import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for fast repeat lookups
const videoCache = new Map<string, string>();

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q || !q.trim()) {
    return NextResponse.json({ success: false, error: 'Query parameter required' }, { status: 400 });
  }

  const queryKey = q.trim().toLowerCase();
  if (videoCache.has(queryKey)) {
    return NextResponse.json({ success: true, videoId: videoCache.get(queryKey) });
  }

  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${q.trim()} official audio`)}`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const html = await res.text();
      // Match YouTube video ID pattern
      const match = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) {
        const videoId = match[1];
        videoCache.set(queryKey, videoId);
        return NextResponse.json({ success: true, videoId });
      }
    }

    // Fallback search without "official audio"
    const fallbackRes = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(q.trim())}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(4000),
      }
    );

    if (fallbackRes.ok) {
      const html = await fallbackRes.text();
      const match = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) {
        const videoId = match[1];
        videoCache.set(queryKey, videoId);
        return NextResponse.json({ success: true, videoId });
      }
    }

    return NextResponse.json({ success: false, error: 'No stream found' }, { status: 404 });
  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}
