import { NextRequest, NextResponse } from 'next/server';
import { computeUserVibe } from '@/server/services/vibeService';
import { getToken } from 'next-auth/jwt';
import env from '@/server/env';

export async function GET(request: NextRequest) {
  try {
    let spotifyAccessToken: string | undefined;
    try {
      const token = await getToken({ req: request, secret: env.NEXTAUTH_SECRET });
      if (token?.accessToken) {
        spotifyAccessToken = token.accessToken as string;
      }
    } catch {
      // Ignored
    }

    const vibe = await computeUserVibe(spotifyAccessToken);

    return NextResponse.json({
      success: true,
      vibe,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to compute vibe' },
      { status: 500 }
    );
  }
}
