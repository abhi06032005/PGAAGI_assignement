'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectFavoriteItems } from '../selectors';
import { removeFavorite } from '../favoritesSlice';
import { setSelectedDetailItem } from '@/features/feed/feedSlice';
import { Heart, Trash2, ExternalLink } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ContentItem } from '@/types';

interface FavoritesSectionProps {
  layout?: 'row' | 'grid';
  className?: string;
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({
  layout = 'grid',
  className = '',
}) => {
  const dispatch = useAppDispatch();
  const allFavorites = useAppSelector(selectFavoriteItems);
  const query = useAppSelector(s=>s.search.debouncedQuery);
  const favorites = allFavorites.filter(i=>[i.title,i.summary].join(' ').toLowerCase().includes(query.toLowerCase()));

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="w-6 h-6 text-rose-500" />}
        title="No favorites saved yet"
        description="Click the bookmark or heart icon on any card in the feed to save it here for quick reading."
        className={className}
      />
    );
  }

  // Pre-curated soft pastel tints for cards matching the reference mockup
  const pastelTints = ['#e9f5d6', '#fce8d5', '#fce4ef', '#e7e2fb', '#dcf1f9'];

  return (
    <div
      className={
        layout === 'row'
          ? `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`
          : `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`
      }
    >
      {favorites.map((item: ContentItem, index: number) => {
        const bgTint = pastelTints[index % pastelTints.length];
        return (
          <GlassCard
            key={item.id}
            variant="pastel"
            pastelColor={bgTint}
            className="p-5 flex flex-col justify-between group hover:shadow-md transition-all duration-200 cursor-pointer text-stone-900"
            onClick={() => dispatch(setSelectedDetailItem(item))}
          >
            <div>
              <div className="flex items-center justify-between mb-3 text-xs font-semibold text-stone-600">
                <span className="uppercase tracking-wider">{item.category}</span>
                <button
                  type="button"
                  aria-label="Remove from favorites"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(removeFavorite(item.id));
                  }}
                  className="p-1.5 rounded-full hover:bg-black/10 text-stone-600 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="font-semibold text-stone-900 text-sm line-clamp-2 mb-1.5 group-hover:text-stone-700">
                {item.title}
              </h4>
              <p className="text-xs text-stone-600 line-clamp-2">
                {item.summary}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-black/5 text-[11px] text-stone-500 font-medium">
              <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Saved for later'}</span>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-stone-700 hover:text-black font-semibold"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};

export default FavoritesSection;
