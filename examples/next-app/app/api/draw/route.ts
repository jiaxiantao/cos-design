import { NextResponse } from 'next/server';

/** Demo server draw — replace with your lottery service. */
export async function GET() {
  const targetIndex = Math.floor(Math.random() * 6);
  return NextResponse.json({
    targetIndex,
    prizeHint: `Server drew index ${targetIndex}`
  });
}
