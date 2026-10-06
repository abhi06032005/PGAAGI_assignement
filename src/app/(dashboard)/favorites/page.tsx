'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FavoritesSection } from '@/features/favorites/components/FavoritesSection';
import { GlassCard } from '@/components/ui/GlassCard';
import { Heart } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

export default function FavoritesPage() {
  const {t}=useTranslation();
  const favoriteCount = useAppSelector((state) => state.favorites.favoriteIds.length);

  return (
    <div className="space-y-6 animate-fade-in">
      <GlassCard className="p-6 border border-white/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>{t('favorites.title')}</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {t('favorites.subtitle')}
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
          {favoriteCount} {favoriteCount === 1 ? 'Item' : 'Items'}
        </span>
      </GlassCard>

      <FavoritesSection layout="grid" />
    </div>
  );
}
