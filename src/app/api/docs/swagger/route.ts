import { NextResponse } from 'next/server';
import { swaggerDocument } from '@/lib/swagger';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  return NextResponse.json(swaggerDocument);
}


