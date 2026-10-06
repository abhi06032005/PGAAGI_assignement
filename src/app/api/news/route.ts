import { NextRequest, NextResponse } from 'next/server';
import { mockNewsArticles } from '@/server/mocks/news';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const region = searchParams.get('region');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let items = [...mockNewsArticles];

    if (region === 'india') {
      items = items.filter((item) => item.region === 'india');
    } else if (region === 'international') {
      items = items.filter((item) => item.region === 'international');
    }

    if (category && category !== 'all') {
      items = items.filter((item) => item.category === category);
    }

    if (search) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(search) ||
          item.summary.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      items,
      total: items.length,
      data: items,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch news' }, { status: 500 });
  }
}
