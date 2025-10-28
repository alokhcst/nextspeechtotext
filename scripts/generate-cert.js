const forge = require('node-forge');
const fs = require('fs');

console.log('Generating self-signed SSL certificate...\n');

// Create .cert directory
if (!fs.existsSync('.cert')) {
  fs.mkdirSync('.cert', { recursive: true });
}

// Generate a key pair
const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();

cert.publicKey = keys.publicKey;
cert.serialNumber = '01' + Math.random().toString().substring(2, 11);
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

// Get local IP addresses
const os = require('os');
const networkInterfaces = os.networkInterfaces();
const hostnames = ['localhost', '127.0.0.1', '::1'];

// Add network IPs
Object.values(networkInterfaces).forEach((interfaces) => {
  interfaces?.forEach((iface) => {
    if (iface.family === 'IPv4' && !iface.internal && !hostnames.includes(iface.address)) {
      hostnames.push(iface.address);
    }
  });
});

// Set certificate attributes
const attrs = [
  { name: 'countryName', value: 'US' },
  { name: 'organizationName', value: 'Local Development' },
  { name: 'commonName', value: 'localhost' }
];

cert.setSubject(attrs);
cert.setIssuer(attrs);

// Create altNames array
const altNames = hostnames.map(hostname => {
  // Check if it's an IP address (IPv4 or IPv6)
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return { type: 7, ip: hostname }; // Type 7 = IP address
  } else if (hostname.includes(':')) {
    return { type: 7, ip: hostname }; // IPv6
  } else {
    return { type: 2, value: hostname }; // Type 2 = DNS name
  }
});

console.log('Hostnames being added:', hostnames);

// Add subject alternative names
cert.setExtensions([
  {
    name: 'basicConstraints',
    cA: true
  },
  {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  },
  {
    name: 'subjectAltName',
    altNames: altNames
  }
]);

// Sign certificate
cert.sign(keys.privateKey);

// Convert certificate and key to PEM format
const certPem = forge.pki.certificateToPem(cert);
const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

// Write certificate and key to files
fs.writeFileSync('.cert/cert.pem', certPem);
fs.writeFileSync('.cert/key.pem', keyPem);

console.log('✅ SSL certificate generated successfully!');
console.log('\nCertificate details:');
console.log(`  - Valid until: ${cert.validity.notAfter.toLocaleDateString()}`);
console.log(`  - Hostnames: ${hostnames.join(', ')}`);
console.log('\n📝 Important: This is a self-signed certificate.');
console.log('   Your browser will show a security warning.');
console.log('   Click "Advanced" and "Proceed to localhost" to continue.');
console.log('\n🚀 To start the HTTPS server, run: npm run dev:https');

