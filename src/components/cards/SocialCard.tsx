import React, { useState } from 'react';
import { SocialItem } from '@/types';
import { Heart, MessageSquare, Repeat2, CheckCircle2 } from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';

interface SocialCardProps {
  item: SocialItem;
  onOpenDetails: () => void;
}

export const SocialCard: React.FC<SocialCardProps> = ({ item, onOpenDetails }) => {
  const [likes, setLikes] = useState(item.likesCount);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const getPlatformBadge = () => {
    const colors: Record<string, string> = {
      twitter: 'text-sky-500 bg-sky-500/10',
      threads: 'text-zinc-700 dark:text-zinc-300 bg-zinc-500/10',
      instagram: 'text-pink-500 bg-pink-500/10',
      bluesky: 'text-blue-500 bg-blue-500/10',
    };
    return (
      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${colors[item.platform]}`}>
        {item.platform}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Author Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-slate-200 dark:ring-slate-700 flex-shrink-0">
            <SafeImage
              src={item.authorAvatar}
              alt={item.authorName}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {item.authorName}
              </span>
              {item.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {item.authorHandle} • {item.timestamp}
            </span>
          </div>
        </div>
        {getPlatformBadge()}
      </div>

      {/* Post Text */}
      <div className="flex-1 flex flex-col">
        <p
          onClick={onOpenDetails}
          className="text-xs text-slate-700 dark:text-slate-300 mb-3 leading-relaxed cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-3"
        >
          {item.summary}
        </p>

        {/* Media if present */}
        {item.imageUrl && (
          <div
            onClick={onOpenDetails}
            className="relative w-full h-36 rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800 cursor-pointer"
          >
            <SafeImage
              src={item.imageUrl}
              alt={item.imageAlt || `${item.category} social`}
              category={item.category}
              type={item.type}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* Hashtags */}
        {item.hashtags && item.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.hashtags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Engagement Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors ${
              hasLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-500'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500' : ''}`} />
            <span>{likes.toLocaleString()}</span>
          </button>

          <div className="flex items-center gap-1.5 hover:text-emerald-500 cursor-pointer transition-colors">
            <Repeat2 className="w-3.5 h-3.5" />
            <span>{item.repostsCount.toLocaleString()}</span>
          </div>

          <button
            onClick={onOpenDetails}
            className="flex items-center gap-1.5 hover:text-indigo-500 cursor-pointer transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{item.commentsCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
