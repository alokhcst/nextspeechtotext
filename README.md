# Speech to Text with AI Summary

A modern Next.js application that provides real-time speech-to-text transcription with Claude-powered AI summaries.

## Features

- 🎤 **Real-time Speech Recognition**: Uses Web Speech API for live transcription
- 🤖 **AI-Powered Summaries**: Automatically generates summaries using Claude 3.5 Sonnet
- 🔄 **Streaming Updates**: Real-time summary updates as you speak
- 💅 **Modern UI**: Beautiful, responsive design with dark mode support
- ⚡ **Fast & Optimized**: Built with Next.js 16 and React 19

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Claude API key from [Anthropic Console](https://console.anthropic.com/)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd nextspeechtotext
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Add your Claude API key to `.env.local`:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-20240620
```

**Available Models** (optional - defaults to Claude 3.5 Sonnet):
- `claude-3-5-sonnet-20240620` - Best for most tasks (default)
- `claude-3-sonnet-20240229` - Reliable general-purpose model
- `claude-3-haiku-20240307` - Fast and cost-effective
- `claude-3-opus-20240229` - Most powerful (if available in your plan)

**Note**: If you need network IP access (not just localhost), skip to step 6 and use the HTTPS setup.

5. Run the development server:

**Option A: HTTP (localhost only)**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser

**Option B: HTTPS (works on network IPs) - Recommended**
```bash
# First, generate SSL certificate (one-time setup)
npm run setup-cert

# Then run the HTTPS server
npm run dev:https
```
Open [https://localhost:3000](https://localhost:3000) in your browser

> **Note**: The browser will show a security warning for the self-signed certificate. Click "Advanced" and "Proceed to localhost" to continue. This is safe for local development.

## Usage

1. Click **Start Recording** to begin speech recognition
2. Speak naturally - your words will be transcribed in real-time
3. AI summaries are automatically generated every 5 seconds
4. Click **Stop Recording** to pause and get a final summary
5. Click **Clear** to reset the transcript and summary

## Browser Support

### Speech Recognition Requirements

**IMPORTANT**: The Web Speech API requires a secure context. Speech recognition will only work on:
- ✅ `https://` (secure HTTPS connections)
- ✅ `http://localhost` (local development)
- ✅ `http://127.0.0.1` (local IP address)
- ❌ **NOT** on `http://192.168.x.x` or other network IPs without HTTPS

### Supported Browsers
- Google Chrome (recommended)
- Microsoft Edge (recommended)
- Safari (with some limitations)

### Network Access with HTTPS

The app now supports HTTPS out of the box for secure network access:

1. **Run the HTTPS server**:
   ```bash
   npm run setup-cert  # One-time setup
   npm run dev:https   # Start HTTPS server
   ```

2. **Access from any device on your network**:
   - Open `https://<your-computer-ip>:3000` on any device
   - The certificate includes your local IP automatically
   - Accept the browser security warning (safe for development)

3. **For production**, consider:
   - Using ngrok: `npx ngrok http 3000`
   - Using Cloudflare Tunnel
   - Deploying to a hosting service with SSL

For the best experience, use Chrome or Edge.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **AI**: Anthropic Claude 3.5 Sonnet
- **Speech Recognition**: Web Speech API

## Project Structure

```
nextspeechtotext/
├── app/
│   ├── api/
│   │   └── summarize/
│   │       └── route.ts       # Claude API integration
│   ├── components/
│   │   └── speech-to-text.tsx # Main speech recognition component
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── .env.local.example         # Environment variables template
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies
└── README.md                  # This file
```

## License

MIT
