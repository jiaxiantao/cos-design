import { NextResponse } from 'next/server';

/** Demo server draw — replace with your lottery service. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cells = Math.max(1, Number(searchParams.get('cells') ?? 6) || 6);
  const targetIndex = Math.floor(Math.random() * cells);
  return NextResponse.json({
    targetIndex,
    cells,
    prizeHint: `Server drew index ${targetIndex} (of ${cells})`,
  });
}
