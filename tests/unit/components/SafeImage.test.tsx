import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SafeImage } from '@/components/ui/SafeImage';

describe('SafeImage Component', () => {
  it('renders image with initial src and alt', () => {
    render(<SafeImage src="https://example.com/photo.jpg" alt="Test photo" width={200} height={200} />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Test photo');
  });

  it('switches to fallback src on error when fallbackSrc is provided', () => {
    const fallback = 'https://example.com/fallback.jpg';
    render(
      <SafeImage
        src="https://example.com/broken.jpg"
        alt="Broken photo"
        width={200}
        height={200}
        fallbackSrc={fallback}
      />
    );
    const img = screen.getByRole('img');
    fireEvent.error(img);
    expect(img.getAttribute('src')).toContain('fallback.jpg');
  });

  it('renders category-based pastel placeholder with icon and descriptive alt when src is missing', () => {
    render(
      <SafeImage
        category="technology"
        type="news"
        width={200}
        height={200}
      />
    );
    const placeholder = screen.getByRole('img');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute('aria-label', 'Technology news');
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders category-based placeholder on image load error when no fallbackSrc is provided', () => {
    render(
      <SafeImage
        src="https://example.com/broken.jpg"
        category="finance"
        type="news"
        width={200}
        height={200}
      />
    );
    const img = screen.getByRole('img');
    fireEvent.error(img);
    const placeholder = screen.getByRole('img');
    expect(placeholder).toHaveAttribute('aria-label', 'Finance news');
    expect(screen.getByText('Finance')).toBeInTheDocument();
  });
});

