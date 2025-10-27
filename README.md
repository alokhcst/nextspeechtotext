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

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

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

### Tips for Network Access
If you need to access the app from other devices on your network:
1. **Use HTTPS**: Set up an HTTPS server (e.g., using ngrok, Cloudflare Tunnel, or a local certificate)
2. **Access via localhost**: Connect to the machine running the app via remote desktop/SSH
3. **Use VPN**: Connect devices via VPN and use localhost

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
