import { NextRequest, NextResponse } from 'next/server';
import { fetchSpotifyNowPlaying } from '@/server/services/spotifyService';
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

    const item = await fetchSpotifyNowPlaying(spotifyAccessToken);

    return NextResponse.json({
      success: true,
      item,
      isPlaying: Boolean(item?.isPlaying),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch now playing track' },
      { status: 500 }
    );
  }
}
