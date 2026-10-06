import React from 'react';
import { NewsItem } from '@/types';
import { Clock, ExternalLink } from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';

interface NewsCardProps {
  item: NewsItem;
  onOpenDetails: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, onOpenDetails }) => {
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
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-xs font-medium z-10">
          {item.sourceName}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <h3
          onClick={onOpenDetails}
          className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors mb-2"
        >
          {item.title}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed flex-1">
          {item.summary}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{item.readTimeMinutes} min read</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>{item.timestamp}</span>
          </div>

          <button
            onClick={onOpenDetails}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <span>Read</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
