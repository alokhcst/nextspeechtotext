# HTTPS Setup Instructions

This app now supports HTTPS for secure microphone access on network IPs.

## Quick Start

1. **Generate Certificate** (One-time setup):
   ```bash
   npm run setup-cert
   ```

2. **Start HTTPS Server**:
   ```bash
   npm run dev:https
   ```

3. **Access the App**:
   - Local: https://localhost:3000
   - Network: https://192.168.1.68:3000 (your IP will be shown)

## Accepting the Certificate in Chrome

Since this is a self-signed certificate, Chrome will show a security warning. Here's how to accept it:

### Step 1: Click "Advanced"
On the error page, click the "Advanced" button at the bottom.

### Step 2: Proceed Anyway
Click "Proceed to 192.168.1.68 (unsafe)" link.

**Note**: Chrome may show a "Your connection is not private" error first. You need to click "Advanced" to see the proceed option.

### Alternative: Trust the Certificate

For a better experience, you can add the certificate to Chrome's trusted certificates:

1. **Export the certificate** (in Chrome):
   - Click the lock icon in the address bar
   - Click "Certificate" → "Details" → "Copy to file"
   - Save as a .crt file

2. **Add to Chrome**:
   - Go to `chrome://settings/certificates`
   - Click "Authorities" tab
   - Click "Import"
   - Select your .crt file
   - Check "Trust this certificate for identifying websites"

## Troubleshooting

### Issue: "ERR_CERT_INVALID" or "Your connection is not private"

**Solution**: 
1. Make sure you generated the certificate with your network IP: `npm run setup-cert`
2. Restart the HTTPS server: `npm run dev:https`
3. In Chrome, go to `chrome://settings/certificates` and remove any old certificates for this IP
4. Try accessing the site again and click "Advanced" → "Proceed"

### Issue: Certificate doesn't include your IP

**Solution**:
The certificate script automatically detects your network IP. If it's not detected:
1. Manually check your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Edit `scripts/generate-cert.js` and add your IP manually to the `hostnames` array

### Issue: Still getting security warning

**Solution**:
- Self-signed certificates always show warnings - this is normal for local development
- Click "Advanced" and proceed - it's safe for local use
- For production, use a real certificate from Let's Encrypt or a CA

## How It Works

The HTTPS setup uses:
- **node-forge**: Generates self-signed certificates
- **Custom HTTPS server**: Runs Next.js with SSL/TLS
- **Subject Alternative Names (SAN)**: Includes multiple hostnames/IPs in one certificate

This allows the Web Speech API to work securely on network IPs, not just localhost.

## Security Note

These certificates are for **local development only**. They are self-signed and not trusted by default. For production deployments, use proper SSL certificates from a Certificate Authority.

