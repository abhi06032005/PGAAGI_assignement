'use client';

import { useDialog } from './useDialog';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedDetailItem } from '@/features/feed/feedSlice';
import { toggleFavorite } from '@/features/favorites/favoritesSlice';
import { CategoryBadge, TypeBadge } from '../ui/Badge';
import { X, Bookmark, Share2, ExternalLink, ThumbsUp, Send, Star } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { SafeImage } from '../ui/SafeImage';

export const ItemDetailModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const item = useAppSelector((state) => state.feed.selectedDetailItem);
  const favoriteIds = useAppSelector((state) => state.favorites.favoriteIds);
  const [commentText, setCommentText] = useState('');
  const [notes, setNotes] = useState<Record<string,string[]>>({});
  const comments = item ? notes[item.id] || [] : [];
  const [copied, setCopied] = useState(false);

  const dialogRef=useDialog(!!item,()=>dispatch(setSelectedDetailItem(null)));
  if (!item) return null;

  const isFavorite = favoriteIds.includes(item.id);

  const handleClose = () => {
    dispatch(setSelectedDetailItem(null));
  };

  const handleShare = async () => {
    try { await navigator.clipboard.writeText(item.url || window.location.href); setCopied(true); setTimeout(()=>setCopied(false),2000); } catch { setCopied(false); }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      setNotes({...notes,[item.id]:[commentText.trim(), ...comments]});
      setCommentText('');
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-item-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
    >
      <GlassCard
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 flex flex-col bg-white dark:bg-stone-900 border border-white/80 dark:border-stone-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-6">
          <div className="flex items-center gap-2">
            <TypeBadge type={item.type} />
            <CategoryBadge category={item.category} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(toggleFavorite(item))}
              className={`p-2 rounded-full transition-colors ${
                isFavorite
                  ? 'text-amber-500 bg-amber-500/10'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
              title="Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Share link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              aria-label="Close details"
              onClick={handleClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {copied && (
          <div className="mb-4 text-xs font-semibold text-emerald-600 bg-emerald-500/10 py-1.5 px-3 rounded-full text-center border border-emerald-500/20">
            Link copied to clipboard
          </div>
        )}

        {/* Hero Image / Category Placeholder */}
        <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden mb-6 border border-stone-200 dark:border-stone-800 shadow-inner">
          <SafeImage
            src={item.imageUrl}
            alt={item.imageAlt || item.title}
            category={item.category}
            type={item.type}
            fill
            className="object-cover"
          />
        </div>

        {/* Title */}
        <h2 id="modal-item-title" className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
          {item.title}
        </h2>

        {/* Meta details */}
        <div className="flex items-center gap-3 text-xs text-stone-500 mb-6 flex-wrap">
          <span>{item.timestamp}</span>
          {item.type === 'news' && (
            <>
              <span>• Source: <strong className="text-stone-700 dark:text-stone-300">{item.source || item.sourceName}</strong></span>
              {item.author && <span>• By {item.author}</span>}
              {item.readTimeMinutes && <span>• {item.readTimeMinutes} min read</span>}
            </>
          )}
          {item.type === 'recommendation' && (
            <>
              <span>• Creator: <strong className="text-stone-700 dark:text-stone-300">{item.creator}</strong></span>
              <span className="flex items-center gap-1">• Rating: <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" /> {item.rating} / 10</span>
              <span>• {item.releaseYear}</span>
            </>
          )}
          {item.type === 'social' && (
            <>
              <span>• Platform: <strong className="uppercase text-stone-800 dark:text-stone-200">{item.platform === 'twitter' ? '𝕏 Twitter' : item.platform}</strong></span>
              {(item as any).subreddit && <span>• Subreddit: <strong className="text-orange-600 dark:text-orange-400">{(item as any).subreddit}</strong></span>}
              <span>• Author: <strong className="text-stone-700 dark:text-stone-300">{item.authorName} ({item.authorHandle})</strong></span>
              <span>• Engagement: {(item.likesCount || 0).toLocaleString()} {item.platform === 'reddit' ? 'upvotes' : 'likes'}{(item.commentsCount ? ` · ${item.commentsCount.toLocaleString()} comments` : '')}</span>
            </>
          )}
          {item.type === 'music' && (
            <>
              <span>• Artist: <strong className="text-stone-700 dark:text-stone-300">{item.artist}</strong></span>
              <span>• Album: {item.album}</span>
            </>
          )}
        </div>

        {/* Detailed Description */}
        <div className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed mb-8 space-y-4 font-light">
          <p>{item.description || item.summary}</p>
        </div>

{item.type === 'music' && item.previewUrl && <audio controls src={item.previewUrl} className="w-full mb-6" aria-label={`Preview ${item.title}`}/>}
        {/* Action Button */}
        {item.url && (
          <div className="mb-8">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold text-xs transition-all shadow-md"
            >
              <span>
                {item.type === 'social'
                  ? item.platform === 'reddit'
                    ? 'Open Reddit Thread'
                    : item.platform === 'twitter'
                    ? 'Open on 𝕏 Twitter'
                    : 'Open Post'
                  : 'Visit Official Source'}
              </span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Discussion / Comments Section */}
        <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
          <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>Your session notes</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
              {comments.length}
            </span>
          </h4>

          <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a private note..."
              className="flex-1 px-4 py-2.5 text-xs rounded-full border border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400 placeholder-stone-400"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-5 py-2.5 rounded-full bg-stone-900 dark:bg-white disabled:opacity-50 text-white dark:text-stone-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>Post</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="space-y-2">
            {comments.map((c, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 flex items-start gap-2.5"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default ItemDetailModal;
