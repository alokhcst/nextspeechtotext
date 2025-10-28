import { NextResponse } from 'next/server';

/**
 * Health check endpoint for load balancer
 */
export async function GET() {
  return NextResponse.json(
    { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'nextspeechtotext'
    },
    { status: 200 }
  );
}

