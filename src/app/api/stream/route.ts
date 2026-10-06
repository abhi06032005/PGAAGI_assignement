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

      const sendLivePick = () => {
        if (request.signal.aborted) return;
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
          // Stream closed
        }
      };

      // Push first live item quickly within 1.5 seconds so user sees live fetching immediately
      const initialTimer = setTimeout(sendLivePick, 1500);

      const intervalId = setInterval(sendLivePick, 5000);

      request.signal.addEventListener('abort', () => {
        clearTimeout(initialTimer);
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
