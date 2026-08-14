import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Run a basic query to check DB connectivity
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', db: 'connected' });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', db: 'disconnected', message: error.message },
      { status: 500 }
    );
  }
}
