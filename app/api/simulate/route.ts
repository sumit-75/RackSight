import { NextResponse } from 'next/server';
import { runSimulation } from '@/lib/simulator';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await runSimulation();
    return NextResponse.json({ status: 'success', ...result });
  } catch (error: unknown) {
    return NextResponse.json(
      { status: 'error', message: (error as Error).message || 'Simulation failed' },
      { status: 500 }
    );
  }
}
