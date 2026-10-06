import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import env from '@/server/env';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: env.NEXTAUTH_SECRET });
    const isConnected = Boolean(token?.isSpotifyConnected && token?.accessToken);

    return NextResponse.json({
      success: true,
      isSpotifyConnected: isConnected,
      userName: token?.name || undefined,
    });
  } catch {
    return NextResponse.json({
      success: true,
      isSpotifyConnected: false,
    });
  }
}
