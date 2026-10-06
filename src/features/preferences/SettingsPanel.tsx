'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  toggleCategory,
  setTheme,
  setLanguage,
  toggleCompactMode,
  toggleAutoRefresh,
  resetPreferences,
} from './preferencesSlice';
import { Category, Language, ThemeMode } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Moon, Sun, Monitor, Languages, Layers, RefreshCw, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const SettingsPanel: React.FC<{ onClose?: () => void; className?: string }> = ({
  onClose,
  className = '',
}) => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const preferences = useAppSelector((state) => state.preferences);

  const allCategories: Category[] = [
    'technology',
    'finance',
    'sports',
    'entertainment',
    'health',
    'science',
  ];

  const handleLanguageChange = (lng: Language) => {
    dispatch(setLanguage(lng));
    i18n.changeLanguage(lng);
  };

  return (
    <GlassCard className={`p-6 w-full max-w-xl mx-auto space-y-6 ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Preferences & Settings</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-sm font-medium"
          >
            Close
          </button>
        )}
      </div>

      {/* Theme Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Appearance & Theme
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
            const isSelected = preferences.theme === mode;
            return (
              <button
                key={mode}
                onClick={() => dispatch(setTheme(mode))}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-semibold capitalize border transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 border-stone-900 dark:border-white shadow-sm'
                    : 'bg-white/60 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                }`}
              >
                {mode === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
                {mode === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
                {mode === 'system' && <Monitor className="w-4 h-4 text-stone-400" />}
                <span>{mode}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Language Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
          <Languages className="w-3.5 h-3.5" />
          <span>Language</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['en', 'hi'] as Language[]).map((lng) => {
            const isSelected = preferences.language === lng;
            return (
              <button
                key={lng}
                onClick={() => handleLanguageChange(lng)}
                className={`py-2 px-3 rounded-2xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 border-stone-900 dark:border-white shadow-sm'
                    : 'bg-white/60 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                }`}
              >
                {lng === 'en' ? 'English (EN)' : 'हिन्दी (Hindi)'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred Categories */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Topics of Interest
        </label>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((category) => {
            const isSelected = preferences.favoriteCategories.includes(category);
            return (
              <button
                key={category}
                onClick={() => dispatch(toggleCategory(category))}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize border transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 border-stone-900 dark:border-white'
                    : 'bg-white/50 dark:bg-stone-800/50 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggle options */}
      <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800 text-sm">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <RefreshCw className="w-4 h-4 text-stone-400" />
            <span>Live social updates</span>
          </span>
          <input
            type="checkbox"
            checked={preferences.autoRefreshRealtime}
            onChange={() => dispatch(toggleAutoRefresh())}
            className="w-4 h-4 accent-stone-900 rounded"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <Layers className="w-4 h-4 text-stone-400" />
            <span>Compact Dashboard Mode</span>
          </span>
          <input
            type="checkbox"
            checked={preferences.compactMode}
            onChange={() => dispatch(toggleCompactMode())}
            className="w-4 h-4 accent-stone-900 rounded"
          />
        </label>
      </div>

      {/* Reset */}
      <div className="pt-2">
        <button
          onClick={() => dispatch(resetPreferences())}
          className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to default preferences</span>
        </button>
      </div>
    </GlassCard>
  );
};

export default SettingsPanel;
