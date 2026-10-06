import { describe, it, expect } from 'vitest';
import { computeItemVibeScore } from '@/server/services/vibeService';
import { ContentItem } from '@/types';

describe('Vibe Scoring Algorithm', () => {
  const dummyNewsItem: ContentItem = {
    id: 'test-news-1',
    type: 'news',
    title: 'Quantum Computing Advance',
    description: 'Researchers break new quantum barrier',
    summary: 'Researchers break new quantum barrier',
    source: 'Nature',
    category: 'technology',
    publishedAt: new Date().toISOString(),
    timestamp: 'Just now',
    tags: ['quantum', 'science'],
  };

  const dummySpaceItem: ContentItem = {
    id: 'test-apod-1',
    type: 'apod',
    title: 'Milky Way Core',
    description: 'Stunning telescope capture',
    summary: 'Stunning telescope capture',
    source: 'NASA APOD',
    category: 'space',
    publishedAt: new Date().toISOString(),
    timestamp: 'Today',
    date: '2025-01-01',
    mediaType: 'image',
    tags: ['space', 'galaxy'],
  };

  it('boosts technology news under "Focused" vibe', () => {
    const focusedScore = computeItemVibeScore(dummyNewsItem, 'Focused');
    const chillScore = computeItemVibeScore(dummyNewsItem, 'Chill');
    expect(focusedScore).toBeGreaterThan(chillScore);
  });

  it('boosts space APOD items under "Chill" vibe', () => {
    const chillScore = computeItemVibeScore(dummySpaceItem, 'Chill');
    const energeticScore = computeItemVibeScore(dummySpaceItem, 'Energetic');
    expect(chillScore).toBeGreaterThan(energeticScore);
  });

  it('clamps all vibe scores between 0 and 1.0', () => {
    const score = computeItemVibeScore(dummyNewsItem, 'Hype');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1.0);
  });
});
