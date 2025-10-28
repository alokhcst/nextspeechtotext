#!/bin/bash
# Setup SSL certificate for local HTTPS development

echo "Setting up local HTTPS certificate..."

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "mkcert is not installed. Please install it first:"
    echo "  Windows: choco install mkcert"
    echo "  macOS: brew install mkcert"
    echo "  Linux: sudo apt install libnss3-tools && wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64 && sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert && sudo chmod longing+x /usr/local/bin/mkcert"
    exit 1
fi

# Create certificates directory
mkdir -p .cert

# Install local CA
echo "Installing local CA..."
mkcert -install

# Get local IP address
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    LOCAL_IP=$(ipconfig | findstr /i "IPv4" | findstr /v "192.168.1.1" | awk '{print $NF}' | head -1)
else
    # Unix/Linux/macOS
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

echo "Generating certificate for localhost, 127.0.0.1, and $LOCAL_IP..."

# Generate certificate
mkcert -key-file .cert/key.pem -cert-file .cert/cert.pem localhost 127.0.0.1 ::1 $LOCAL_IP

echo "✅ Certificate created successfully!"
echo "Your certificate files are in the .cert/ directory"
echo ""
echo "To start the dev server with HTTPS, run: npm run dev:https"

