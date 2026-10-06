import { NextRequest, NextResponse } from 'next/server';

// In-memory store for custom items in serverless runtime
const customFeedItems: Array<Record<string, unknown>> = [];

export async function GET() {
  return NextResponse.json({ success: true, items: customFeedItems });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, summary, category = 'technology', type = 'news', url = '#', imageUrl, source = 'User Post' } = body;

    if (!title || !summary) {
      return NextResponse.json({ success: false, error: 'Title and summary are required' }, { status: 400 });
    }

    const cleanCategory = String(category || 'technology').toLowerCase();
    const newItem = {
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: type || 'news',
      title: String(title).trim(),
      summary: String(summary).trim(),
      category: cleanCategory,
      timestamp: 'Custom Story',
      publishedAt: new Date().toISOString(),
      source: source || 'Custom Feed',
      sourceName: source || 'Custom Feed',
      readTimeMinutes: Math.max(1, Math.ceil(String(summary).split(' ').length / 200)),
      imageUrl: imageUrl || `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80`,
      imageAlt: String(title).trim(),
      url: url || '#',
      isTrending: false,
    };

    customFeedItems.unshift(newItem);

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create custom item' }, { status: 500 });
  }
}
