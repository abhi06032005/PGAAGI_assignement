import { NextResponse } from 'next/server';
import { fetchNasaApod } from '@/server/services/nasaService';

export async function GET() {
  try {
    const item = await fetchNasaApod();
    return NextResponse.json({
      success: true,
      item,
      data: item,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch astronomy picture of the day' },
      { status: 500 }
    );
  }
}
