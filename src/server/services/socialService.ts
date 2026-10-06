import 'server-only';
import env from '../env';
import serverCache from '../cache';
import { SocialItem } from '@/types';
import { mockSocialPosts } from '../mocks/social';
import { normalizeContentItem } from './normalize';

interface MastodonAttachment {
  type: string;
  url: string;
  preview_url: string;
  description?: string;
}

interface MastodonAccount {
  display_name: string;
  username: string;
  avatar: string;
}

interface MastodonStatus {
  id: string;
  created_at: string;
  content: string;
  url: string;
  reblogs_count: number;
  favourites_count: number;
  replies_count: number;
  account: MastodonAccount;
  media_attachments: MastodonAttachment[];
  tags: Array<{ name: string }>;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
}

export async function fetchSocialPosts(tag: string = 'technology'): Promise<SocialItem[]> {
  const cacheKey = `social:${tag}`;
  const cached = serverCache.get<SocialItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${env.MASTODON_INSTANCE_URL}/api/v1/timelines/tag/${tag}?limit=12`;
    const response = await fetch(url, { signal: AbortSignal.timeout(6000), next: { revalidate: 600 } });

    if (response.ok) {
      const statuses: MastodonStatus[] = await response.json();
      if (Array.isArray(statuses) && statuses.length > 0) {
        const items: SocialItem[] = statuses.map((status) => {
          const plainText = stripHtml(status.content);
          const firstImage = status.media_attachments?.find(
            (att) => att.type === 'image'
          )?.url;

          const hashtags = (status.tags || []).map((t) => `#${t.name}`);

          return normalizeContentItem({
            id: `mastodon-${status.id}`,
            type: 'social',
            title: plainText.slice(0, 80) + (plainText.length > 80 ? '...' : ''),
            description: plainText,
            imageUrl: firstImage || undefined,
            imageAlt: `Post by ${status.account.display_name || status.account.username}`,
            source: 'Mastodon',
            url: status.url,
            publishedAt: status.created_at,
            category: 'technology',
            tags: hashtags.length > 0 ? hashtags : ['#tech', '#openweb'],
            platform: 'mastodon',
            authorName: status.account.display_name || status.account.username,
            authorHandle: `@${status.account.username}`,
            authorAvatar: status.account.avatar,
            likesCount: status.favourites_count,
            repostsCount: status.reblogs_count,
            commentsCount: status.replies_count,
            hashtags: hashtags.length > 0 ? hashtags : ['tech'],
            isTrending: status.reblogs_count > 5,
          }) as SocialItem;
        });

        if (items.length > 0) {
          serverCache.set(cacheKey, items, 600);
          return items;
        }
      }
    }
  } catch {
    // Fallback
  }

  serverCache.set(cacheKey, mockSocialPosts, 300);
  return mockSocialPosts;
}
