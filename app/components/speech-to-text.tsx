'use client';

import { useState, useEffect, useRef } from 'react';

interface ConversationEntry {
  id: string;
  timestamp: number;
  text: string;
  summary?: string;
}

/**
 * Speech-to-Text component with real-time Claude integration
 * Uses Web Speech API for transcription and Claude for summarization
 */
export function SpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [currentSummary, setCurrentSummary] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const summaryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTextRef = useRef('');
  const lastFinalTextRef = useRef('');

  useEffect(() => {
    // Check for browser support
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = '';
      let finalText = '';

      // Process all results from the last resultIndex
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          // Only add final transcripts to the permanent transcript
          finalText += transcript + ' ';
        } else {
          // Keep interim results separate
          interimText += transcript;
        }
      }

      // Update the permanent transcript only with final results
      if (finalText) {
        lastFinalTextRef.current = finalText.trim();
        
        setTranscript((prev) => {
          const updated = prev + finalText;
          accumulatedTextRef.current = updated;
          return updated;
        });

        // Add to conversation history
        if (finalText.trim()) {
          const entry: ConversationEntry = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            text: finalText.trim(),
          };
          
          setConversationHistory((prev) => [...prev, entry]);
        }
      }

      // Update interim transcript separately (temporary display only)
      setInterimTranscript(interimText);

      // Get incremental summary after every finalized chunk (reduced timeout for continuous listening)
      if (finalText) {
        if (summaryTimeoutRef.current) {
          clearTimeout(summaryTimeoutRef.current);
        }

        // Shorter timeout for more responsive summaries
        summaryTimeoutRef.current = setTimeout(async () => {
          // Summarize only the new content plus recent context
          const recentContext = conversationHistory
            .slice(-2) // Last 5 entries for context
            .map(e => e.text)
            .join(' ');
          
          const textToSummarize = recentContext + ' ' + accumulatedTextRef.current;
          await getSummary(textToSummarize);
        }, 3000);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Speech recognition error occurred.';
      
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please check your browser permissions and allow microphone access. If using a network IP (not localhost or HTTPS), you may need to set up HTTPS or use a tunneling service like ngrok.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please connect a microphone and try again.';
          break;
        case 'network':
          errorMessage = 'Network error occurred. Please check your connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service is not allowed.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      setError(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        // Restart recognition if it ended unexpectedly
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (summaryTimeoutRef.current) {
        clearTimeout(summaryTimeoutRef.current);
      }
    };
  }, [isListening]);

  /**
   * Fetch summary from Claude API with streaming support
   */
  const getSummary = async (text: string) => {
    try {
      setError(null);
      setCurrentSummary(''); // Clear previous summary

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get summary');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedSummary = '';

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            
            // Check for completion signal
            if (data === '[DONE]') {
              break;
            }
            
            // Parse JSON data
            if (data) {
              try {
                const parsed = JSON.parse(data);
                
                // Handle text content
                if (parsed.text) {
                  accumulatedSummary += parsed.text;
                  setCurrentSummary(accumulatedSummary);
                }
                
                // Handle errors
                if (parsed.error) {
                  setError(parsed.error);
                  break;
                }
              } catch (e) {
                // Ignore parsing errors for incomplete JSON
                console.warn('Failed to parse SSE data:', e);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Summary error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary';
      setError(errorMessage);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('Failed to start listening. Please ensure microphone permissions are granted. If using a network IP, you may need HTTPS.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);

      // Generate final summary when stopping
      if (accumulatedTextRef.current) {
        getSummary(accumulatedTextRef.current);
      }
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setCurrentSummary('');
    setConversationHistory([]);
    accumulatedTextRef.current = '';
    lastFinalTextRef.current = '';
    if (summaryTimeoutRef.current) {
      clearTimeout(summaryTimeoutRef.current);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Speech to Text with AI Summary
        </h1>
        <p className="text-muted-foreground">
          Speak naturally and get real-time transcription with Claude-powered summaries
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 text-destructive">
          {error}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={startListening}
          disabled={isListening}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            isListening
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {isListening ? 'Listening...' : 'Start Recording'}
        </button>

        <button
          onClick={stopListening}
          disabled={!isListening}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            !isListening
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
          }`}
        >
          Stop Recording
        </button>

        <button
          onClick={clearTranscript}
          className="px-6 py-3 rounded-lg font-medium border border-input hover:bg-accent hover:text-accent-foreground transition-all"
        >
          Clear
        </button>
      </div>

      {/* Status Indicator */}
      {isListening && (
        <div className="flex items-center justify-center gap-2 text-primary">
          <div className="h-3 w-3 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-medium">Listening...</span>
        </div>
      )}

      {/* Transcript Display */}
      <div className="space-y-4">
        <div className="bg-card rounded-lg border p-6 min-h-[200px]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Transcript
          </h2>
          {transcript || interimTranscript ? (
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {transcript}
              <span className="text-muted-foreground italic">
                {interimTranscript}
              </span>
            </p>
          ) : (
            <p className="text-muted-foreground italic">
              Your speech transcription will appear here...
            </p>
          )}
        </div>

        {/* Summary Display */}
        <div className="bg-card rounded-lg border p-6 min-h-[150px]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            AI Summary
          </h2>
          {currentSummary ? (
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {currentSummary}
            </p>
          ) : (
            <p className="text-muted-foreground italic">
              AI-powered summary will appear here automatically...
            </p>
          )}
        </div>

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">💬</span>
              Conversation History ({conversationHistory.length} entries)
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {conversationHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="border-l-4 border-primary/30 pl-4 py-2 bg-muted/30 rounded-r"
                >
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {entry.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
