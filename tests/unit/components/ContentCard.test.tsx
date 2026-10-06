import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { ContentCard } from '@/components/cards/ContentCard';
import { NewsItem, RecommendationItem } from '@/types';

const mockNews: NewsItem = {
  id: 'test-news-1',
  type: 'news',
  title: 'Breakthrough in AI Research',
  description: 'New architecture speeds up training 10x.',
  summary: 'New architecture speeds up training 10x.',
  category: 'technology',
  timestamp: '10m ago',
  publishedAt: new Date().toISOString(),
  source: 'TechDaily',
  sourceName: 'TechDaily',
  imageAlt: 'AI research visual',
  tags: ['ai', 'tech'],
  author: 'Staff Reporter',
  readTimeMinutes: 5,
  imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
};

const mockRec: RecommendationItem = {
  id: 'test-rec-1',
  type: 'recommendation',
  subType: 'movie',
  title: 'Cosmic Odyssey',
  description: 'An incredible space adventure film.',
  summary: 'An incredible space adventure film.',
  category: 'entertainment',
  timestamp: 'Recommended today',
  publishedAt: new Date().toISOString(),
  source: 'TMDB',
  sourceName: 'TMDB',
  imageAlt: 'Cosmic Odyssey poster',
  tags: ['scifi', 'cinema'],
  rating: 4.8,
  genre: ['Sci-Fi', 'Action'],
  releaseYear: 2025,
  creator: 'Director John Doe',
  durationOrEpisodes: '2h 15m',
  imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
};

describe('ContentCard component', () => {
  it('renders news card title and metadata correctly', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <ContentCard item={mockNews} isDraggable={false} />
      </Provider>
    );

    expect(screen.getByText('Breakthrough in AI Research')).toBeInTheDocument();
    expect(screen.getByText(/TechDaily/)).toBeInTheDocument();
    expect(screen.getByText(/5 min read/)).toBeInTheDocument();
    expect(screen.getByText(/Technology/i)).toBeInTheDocument();
  });

  it('renders recommendation card with rating and director', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <ContentCard item={mockRec} isDraggable={false} />
      </Provider>
    );

    expect(screen.getByText('Cosmic Odyssey')).toBeInTheDocument();
    expect(screen.getByText(/By Director John Doe/i)).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('allows user to bookmark item and toggles favorite in redux store', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <ContentCard item={mockNews} isDraggable={false} />
      </Provider>
    );

    const bookmarkBtn = screen.getByLabelText('Toggle favorite');
    expect(store.getState().favorites.favoriteIds).not.toContain('test-news-1');

    fireEvent.click(bookmarkBtn);
    expect(store.getState().favorites.favoriteIds).toContain('test-news-1');

    fireEvent.click(bookmarkBtn);
    expect(store.getState().favorites.favoriteIds).not.toContain('test-news-1');
  });
});
