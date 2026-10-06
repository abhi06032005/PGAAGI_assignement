'use client';

import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setQuery, setDebouncedQuery, setSelectedCategory, setSelectedType } from './searchSlice';
import { Category, ContentType } from '@/types';
import { useTranslation } from 'react-i18next';

export const SearchBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const query = useAppSelector((state) => state.search.query);
  const selectedCategory = useAppSelector((state) => state.search.selectedCategory);
  const selectedType = useAppSelector((state) => state.search.selectedType);
  const favoriteCategories = useAppSelector((state) => state.preferences.favoriteCategories);

  const [localInput, setLocalInput] = useState(query);

  // 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setDebouncedQuery(localInput));
    }, 300);
    return () => clearTimeout(timer);
  }, [localInput, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalInput(val);
    dispatch(setQuery(val));
  };

  const handleClear = () => {
    setLocalInput('');
    dispatch(setQuery(''));
    dispatch(setDebouncedQuery(''));
  };

  // Types list
  const types: { id: ContentType | 'all'; label: string }[] = [
    { id: 'all', label: 'All Media' },
    { id: 'news', label: 'News' },
    { id: 'recommendation', label: 'Movies' },
    { id: 'social', label: 'Social' },
    { id: 'music', label: 'Music' },
  ];

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* Search Input Bar */}
      <div className="relative flex items-center w-full">
        <div className="absolute left-4 text-stone-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={localInput}
          onChange={handleChange}
          placeholder={t('search.placeholder', 'Search across news, social, movies, music...')}
          aria-label="Search content"
          className="w-full pl-11 pr-10 py-3 rounded-full bg-white/70 dark:bg-stone-900/80 backdrop-blur-md border border-white/80 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 shadow-sm transition-all"
        />
        {localInput && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3.5 p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category and Type Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        {/* Type pills */}
        <div className="flex items-center gap-1.5 border-r border-stone-200 dark:border-stone-800 pr-3 mr-1">
          {types.map((item) => {
            const isActive = selectedType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => dispatch(setSelectedType(item.id))}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-sm'
                    : 'bg-white/60 dark:bg-stone-800/60 hover:bg-white/90 text-stone-600 dark:text-stone-300 border border-white/60 dark:border-stone-700/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Category Pills from Preferences */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => dispatch(setSelectedCategory('all'))}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-sm'
                : 'bg-white/60 dark:bg-stone-800/60 hover:bg-white/90 text-stone-600 dark:text-stone-300 border border-white/60 dark:border-stone-700/60'
            }`}
          >
            All Categories
          </button>
          {favoriteCategories.map((cat: Category) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => dispatch(setSelectedCategory(cat))}
                className={`px-3 py-1.5 rounded-full font-medium capitalize whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-sm'
                    : 'bg-white/60 dark:bg-stone-800/60 hover:bg-white/90 text-stone-600 dark:text-stone-300 border border-white/60 dark:border-stone-700/60'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
