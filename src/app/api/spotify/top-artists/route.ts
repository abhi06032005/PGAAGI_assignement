import { NextRequest, NextResponse } from 'next/server';
import { fetchSpotifyTopArtists } from '@/server/services/spotifyService';
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

    const items = await fetchSpotifyTopArtists(spotifyAccessToken);

    return NextResponse.json({
      success: true,
      items,
      total: items.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch top artists' },
      { status: 500 }
    );
  }
}
