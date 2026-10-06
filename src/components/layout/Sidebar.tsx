'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedType } from '@/features/search/searchSlice';
import { setSettingsModalOpen } from '@/features/auth/authSlice';
import { signOut } from 'next-auth/react';
import {
  Compass,
  Flame,
  Settings,
  Newspaper,
  Film,
  Music,
  Users,
  LogOut,
  Square,
  Activity,
  Heart,
} from 'lucide-react';
import { ContentType } from '@/types';

export const Sidebar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const selectedType = useAppSelector((state) => state.search.selectedType);
  const isSpotifyConnected = useAppSelector((state) => state.spotify?.isConnected);

  const navLinks = [
    { href: '/', label: 'Home', icon: Square, exact: true },
    { href: '/discover', label: 'Discover', icon: Compass },
    { href: '/trending', label: 'Trending', icon: Flame },
    { href: '/favorites', label: 'Favorites', icon: Heart },
  ];

  const sourceItems: { type: ContentType | 'all'; label: string; icon: React.ElementType }[] = [
    { type: 'news', label: 'News', icon: Newspaper },
    { type: 'recommendation', label: 'Movies', icon: Film },
    { type: 'music', label: 'Music', icon: Music },
    { type: 'social', label: 'Social', icon: Users },
  ];

  return (
    <aside
      aria-label="Sidebar navigation"
      className={`w-48 xl:w-52 flex-shrink-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-3xl p-4 border border-black/5 dark:border-stone-800 shadow-sm flex flex-col justify-between select-none ${className}`}
    >
      <div>
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 px-3 py-2 mb-4 group">
          <div className="w-6 h-6 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center transition-transform group-hover:scale-105">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-sm text-stone-900 dark:text-stone-100 tracking-tight">
            Pulse
          </span>
        </Link>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => dispatch(setSettingsModalOpen(true))}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-full text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-stone-400" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Media Sources */}
        <div className="mt-6 pt-2">
          <div className="text-[11px] font-medium text-stone-400 dark:text-stone-500 px-3.5 mb-2">
            Sources
          </div>
          <div className="space-y-1">
            {sourceItems.map((source) => {
              const Icon = source.icon;
              const isSelected = selectedType === source.type;
              return (
                <button
                  key={source.type}
                  onClick={() => dispatch(setSelectedType(isSelected ? 'all' : source.type))}
                  className={`w-full flex items-center justify-between px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-stone-400" />
                    <span>{source.label}</span>
                  </div>
                  {source.type === 'music' && isSpotifyConnected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Log out at bottom */}
      <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 text-stone-400" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
