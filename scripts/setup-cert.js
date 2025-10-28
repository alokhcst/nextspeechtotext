const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');

console.log('Setting up local HTTPS certificate...\n');

// Check if mkcert is installed
try {
  execSync('mkcert --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ mkcert is not installed. Please install it first:');
  console.error('\nWindows:');
  console.error('  choco install mkcert');
  console.error('\nmacOS:');
  console.error('  brew install mkcert');
  console.error('\nLinux:');
  console.error('  sudo apt install libnss3-tools');
  console.error('  wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64');
  console.error('  sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert');
  console.error('  sudo chmod +x /usr/local/bin/mkcert\n');
  process.exit(1);
}

// Create .cert directory
if (!fs.existsSync('.cert')) {
  fs.mkdirSync('.cert', { recursive: true });
}

// Install local CA
console.log('Installing local CA...');
try {
  execSync('mkcert -install', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to install CA:', error.message);
  process.exit(1);
}

// Get local IP address
const networkInterfaces = os.networkInterfaces();
let localIP = null;

Object.values(networkInterfaces).forEach((interfaces) => {
  if (!localIP) {
    const ipv4 = interfaces?.find((iface) => iface.family === 'IPv4' && !iface.internal);
    if (ipv4) localIP = ipv4.address;
  }
});

const hosts = ['localhost', '127.0.0.1', '::1'];
if (localIP) {
  hosts.push(localIP);
  console.log(`Generating certificate for localhost, 127.0.0.1, and ${localIP}...`);
} else {
  console.log('Generating certificate for localhost and 127.0.0.1...');
}

try {
  execSync(`mkcert -key-file .cert/key.pem -cert-file .cert/cert.pem ${hosts.join(' ')}`, {
    stdio: 'inherit'
  });
  console.log('\n✅ Certificate created successfully!');
  console.log('Your certificate files are in the .cert/ directory');
  console.log('\nTo start the dev server with HTTPS, run: npm run dev:https');
} catch (error) {
  console.error('Failed to generate certificate:', error.message);
  process.exit(1);
}

