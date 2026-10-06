'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setProfileModalOpen, setSettingsModalOpen } from '@/features/auth/authSlice';
import { setTheme, setLanguage } from '@/features/preferences/preferencesSlice';
import { SearchBar } from '@/features/search/SearchBar';
import { Moon, Sun, Globe, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Language } from '@/types';

export const Header: React.FC<{ className?: string }> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.preferences.theme);
  const currentLanguage = useAppSelector((state) => state.preferences.language);
  const user = useAppSelector((state) => state.auth.user);
  const { i18n } = useTranslation();

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    dispatch(setTheme(nextTheme));
  };

  const handleToggleLanguage = () => {
    const nextLang: Language = currentLanguage === 'en' ? 'hi' : 'en';
    dispatch(setLanguage(nextLang));
    i18n.changeLanguage(nextLang);
  };

  // Derive initials for avatar circle
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AN';

  return (
    <header className={`w-full flex items-center justify-between gap-4 py-2 ${className}`}>
      {/* Search Input Bar */}
      <div className="flex-1 max-w-xl">
        <SearchBar />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Language switcher button */}
        <button
          onClick={handleToggleLanguage}
          title="Switch language"
          aria-label="Switch language"
          className="flex items-center gap-1.5 bg-white/90 dark:bg-stone-800/90 border border-black/5 dark:border-white/10 shadow-sm rounded-full px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:scale-105 transition-transform"
        >
          <Globe className="w-3.5 h-3.5 text-stone-400" />
          <span>{currentLanguage.toUpperCase()}</span>
        </button>

        {/* Dark/Light toggle */}
        <button
          onClick={handleToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="w-8 h-8 rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Settings button */}
        <button
          onClick={() => dispatch(setSettingsModalOpen(true))}
          aria-label="Open settings panel"
          title="Open settings"
          className="w-8 h-8 rounded-full bg-white/90 dark:bg-stone-800/90 border border-black/5 dark:border-white/10 text-stone-600 dark:text-stone-300 flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* User Avatar Circle */}
        <button
          onClick={() => dispatch(setProfileModalOpen(true))}
          aria-label="Open profile modal"
          title={user?.name || 'Profile'}
          className="w-9 h-9 rounded-full bg-[#cbf63a] text-black font-extrabold text-xs flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
        >
          {initials}
        </button>
      </div>
    </header>
  );
};

export default Header;
