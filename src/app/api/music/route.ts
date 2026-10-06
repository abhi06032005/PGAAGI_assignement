import { NextRequest, NextResponse } from 'next/server';
import { fetchMusicRecommendations } from '@/server/services/spotifyService';
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

    const items = await fetchMusicRecommendations(spotifyAccessToken);

    return NextResponse.json({
      success: true,
      items,
      data: items,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch music recommendations' },
      { status: 500 }
    );
  }
}
