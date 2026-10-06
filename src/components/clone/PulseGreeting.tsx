'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedCategory, setSelectedType } from '@/features/search/searchSlice';
import { setSettingsModalOpen } from '@/features/auth/authSlice';
import { SlidersHorizontal } from 'lucide-react';
import { Category, ContentType } from '@/types';

export const PulseGreeting: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedCategory = useAppSelector((state) => state.search.selectedCategory);
  const selectedType = useAppSelector((state) => state.search.selectedType);

  const tabs: { label: string; id: string; category?: Category; type?: ContentType }[] = [
    { label: 'All', id: 'all' },
    { label: 'News', id: 'news', type: 'news' },
    { label: 'Movies', id: 'movies', type: 'recommendation' },
    { label: 'Music', id: 'music', type: 'recommendation' },
    { label: 'Social', id: 'social', type: 'social' },
    { label: 'Finance', id: 'finance', category: 'finance' },
  ];

  const handleTabClick = (tab: typeof tabs[number]) => {
    if (tab.id === 'all') {
      dispatch(setSelectedCategory('all'));
      dispatch(setSelectedType('all'));
    } else if (tab.category) {
      dispatch(setSelectedCategory(tab.category));
      dispatch(setSelectedType('all'));
    } else if (tab.type) {
      dispatch(setSelectedType(tab.type));
      dispatch(setSelectedCategory('all'));
    }
  };

  const isActive = (tab: typeof tabs[number]) => {
    if (tab.id === 'all') return selectedCategory === 'all' && selectedType === 'all';
    if (tab.category) return selectedCategory === tab.category;
    if (tab.type) return selectedType === tab.type;
    return false;
  };

  return (
    <div className="space-y-4">
      {/* Title & Customize Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-stone-100 tracking-tight">
            Good morning, Abhijeet
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-stone-400 mt-0.5">
            Here is what is trending for you today
          </p>
        </div>

        <button
          onClick={() => dispatch(setSettingsModalOpen(true))}
          className="bg-white/90 dark:bg-stone-800/90 hover:bg-white dark:hover:bg-stone-800 border border-black/5 dark:border-white/10 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-stone-200 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-stone-400" />
          <span>Customize</span>
        </button>
      </div>

      {/* Filter Tabs matching image */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-1 rounded-full text-xs font-semibold transition-all shadow-sm cursor-pointer ${
                active
                  ? 'bg-black text-white dark:bg-stone-100 dark:text-stone-900'
                  : 'bg-white/80 dark:bg-stone-800/80 border border-black/5 dark:border-white/10 text-slate-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
