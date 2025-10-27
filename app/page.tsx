import { SpeechToText } from './components/speech-to-text';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <SpeechToText />
    </div>
  );
}
