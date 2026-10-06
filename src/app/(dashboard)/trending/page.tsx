'use client';

import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { TrendingSection } from '@/features/trending/TrendingSection';
import { GlassCard } from '@/components/ui/GlassCard';
import { Flame } from 'lucide-react';

export default function TrendingPage() {
  const {t}=useTranslation();
  const [scope, setScope] = useState<'all' | 'forYou'>('all');

  return (
    <div className="space-y-6 animate-fade-in">
      <GlassCard className="p-6 border border-white/80 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>{t('trending.title')}</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {t('trending.subtitle')}
          </p>
        </div>

        {/* Scope selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-100 dark:bg-stone-800/80 self-start sm:self-auto">
          <button
            onClick={() => setScope('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              scope === 'all'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            {t('trending.all')}
          </button>
          <button
            onClick={() => setScope('forYou')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              scope === 'forYou'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            {t('trending.forYou')}
          </button>
        </div>
      </GlassCard>

      <TrendingSection scope={scope} limit={12} />
    </div>
  );
}
