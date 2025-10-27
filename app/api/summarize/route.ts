import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

/**
 * API route to handle real-time summarization using Claude
 * Accepts text and returns streaming summary
 * Based on official Anthropic SDK documentation
 */
export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey,
    });

    // Create a stream for real-time updates
    // See: https://docs.anthropic.com/en/api/messages-streaming
    // Use a valid Claude model name
    // Common options: 'claude-3-5-sonnet-20240620', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'
    const model = process.env.ANTHROPIC_MODEL ;
    
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Please provide a concise, real-time summary of the following speech transcription. Focus on key points, main ideas, and any action items. Keep it brief but comprehensive:

${text}`,
        },
      ],
    });

    // Convert Anthropic stream to readable stream with proper SSE formatting
    // Documentation: https://docs.anthropic.com/en/api/messages-streaming#event-types
    const encoder = new TextEncoder();
    
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Handle each event type from the stream
          // Event types: https://docs.anthropic.com/en/api/messages-streaming#event-types
          // Supported events: message_start, message_delta, message_stop,
          //                   content_block_start, content_block_delta, content_block_stop
          for await (const event of stream) {
            switch (event.type) {
              // Text delta events - the actual content being streamed
              case 'content_block_delta':
                // Check if delta has text property
                if ('text' in event.delta) {
                  const text = event.delta.text;
                  // Send SSE formatted data
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                  );
                }
                break;

              // Stream end event
              case 'message_stop':
                // Signal completion
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
                return;

              // Optional: Handle other events for debugging
              case 'message_start':
              case 'message_delta':
              case 'content_block_start':
              case 'content_block_stop':
                // Silently ignore these event types
                break;

              default:
                // Handle any unexpected event types
                console.warn('Unexpected event type:', event);
                break;
            }
          }
          
          // Ensure stream is closed even if message_stop wasn't received
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream processing error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering in nginx
      },
    });
  } catch (error) {
    console.error('Summarization error:', error);
    return Response.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

