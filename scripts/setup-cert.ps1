# PowerShell script to setup SSL certificate for local HTTPS development

Write-Host "Setting up local HTTPS certificate..." -ForegroundColor Cyan

# Check if mkcert is installed
$mkcertPath = Get-Command mkcert -ErrorAction SilentlyContinue
if (-not $mkcertPath) {
    Write-Host "mkcert is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "  Install via: choco install mkcert" -ForegroundColor Yellow
    Write-Host "  Or download from: https://github.com/FiloSottile/mkcert/releases" -ForegroundColor Yellow
    exit 1
}

# Create certificates directory
if (-not (Test-Path ".cert")) {
    New-Item -ItemType Directory -Path ".cert" | Out-Null
}

# Install local CA
Write-Host "Installing local CA..." -ForegroundColor Cyan
& mkcert -install

# Get local IP address
$LOCAL_IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.0.0.1"} | Select-Object -First 1).IPAddress

if ($LOCAL_IP) {
    Write-Host "Generating certificate for localhost, 127.0.0.1, and $LOCAL_IP..." -ForegroundColor Cyan
    & mkcert -key-file .cert/key.pem -cert-file .cert/cert.pem localhost 127.0.0.1 ::1 $LOCAL_IP
} else {
    Write-Host "Generating certificate for localhost and 127.0.0.1..." -ForegroundColor Cyan
    & mkcert -key-file .cert/key.pem -cert-file .cert/cert.pem localhost 127.0.0.1 ::1
}

Write-Host "✅ Certificate created successfully!" -ForegroundColor Green
Write-Host "Your certificate files are in the .cert/ directory" -ForegroundColor Green
Write-Host ""
Write-Host "To start the dev server with HTTPS, run: npm run dev:https" -ForegroundColor Yellow

