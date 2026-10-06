import { NextRequest } from 'next/server';
import { mockNewsArticles } from '@/server/mocks/news';
import { mockSocialPosts } from '@/server/mocks/social';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const pool = [...mockNewsArticles, ...mockSocialPosts];

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection ACK
      const initMessage = `data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`;
      controller.enqueue(encoder.encode(initMessage));

      const intervalId = setInterval(() => {
        if (request.signal.aborted) {
          clearInterval(intervalId);
          controller.close();
          return;
        }

        const randomPick = pool[Math.floor(Math.random() * pool.length)];
        const liveEvent = {
          type: 'ITEM',
          data: {
            ...randomPick,
            id: `live-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: 'Just now',
            publishedAt: new Date().toISOString(),
            isTrending: true,
          },
        };

        try {
          const payload = `data: ${JSON.stringify(liveEvent)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          clearInterval(intervalId);
        }
      }, 8000);

      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        try {
          controller.close();
        } catch {
          // Closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
