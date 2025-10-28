const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Check if certificate files exist
const certPath = '.cert/cert.pem';
const keyPath = '.cert/key.pem';

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.error('❌ SSL certificate files not found!');
  console.error('Please run: npm run setup-cert');
  process.exit(1);
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log('');
    console.log('🚀 Ready on https://localhost:' + port);
    console.log('');
    console.log('📝 You can also access via your network IP:');
    console.log('   https://<your-ip>:' + port);
    console.log('');
  });
});

