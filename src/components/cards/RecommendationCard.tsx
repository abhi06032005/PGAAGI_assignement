import React from 'react';
import { RecommendationItem } from '@/types';
import { Star, Play, Music, Film, Mic } from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';

interface RecommendationCardProps {
  item: RecommendationItem;
  onOpenDetails: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ item, onOpenDetails }) => {
  const getSubtypeIcon = () => {
    switch (item.subType) {
      case 'movie':
        return <Film className="w-3.5 h-3.5 text-fuchsia-500" />;
      case 'music':
        return <Music className="w-3.5 h-3.5 text-cyan-500" />;
      case 'podcast':
        return <Mic className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="relative w-full h-44 overflow-hidden rounded-xl mb-4 bg-slate-100 dark:bg-slate-800">
        <SafeImage
          src={item.imageUrl}
          alt={item.imageAlt || item.title}
          category={item.category}
          type={item.type}
          fill
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-xs font-semibold capitalize z-10">
          {getSubtypeIcon()}
          <span>{item.subType}</span>
        </div>

        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 text-xs font-bold shadow z-10">
          <Star className="w-3 h-3 fill-slate-950" />
          <span>{item.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <h3
          onClick={onOpenDetails}
          className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 cursor-pointer transition-colors mb-1"
        >
          {item.title}
        </h3>

        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          By {item.creator} • {item.releaseYear}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed flex-1">
          {item.summary}
        </p>

        {item.genre && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.genre.slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span>{item.durationOrEpisodes || item.timestamp}</span>

          <button
            onClick={onOpenDetails}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-fuchsia-600/10 hover:bg-fuchsia-600/20 text-fuchsia-600 dark:text-fuchsia-400 text-xs font-semibold transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{item.subType === 'movie' ? 'Trailer' : 'Play'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
