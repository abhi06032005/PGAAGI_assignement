import { NextRequest, NextResponse } from 'next/server';
import { mockSocialPosts } from '@/server/mocks/social';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let items = [...mockSocialPosts];

    if (category && category !== 'all') {
      items = items.filter((item) => item.category === category);
    }

    if (search) {
      items = items.filter((item) => item.title.toLowerCase().includes(search));
    }

    return NextResponse.json({
      success: true,
      items,
      total: items.length,
      data: items,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch social posts' }, { status: 500 });
  }
}
