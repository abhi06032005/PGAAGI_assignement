'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Category, ContentType } from '@/types';
import {
  Cpu,
  TrendingUp,
  Trophy,
  Film,
  Heart,
  FlaskConical,
  Telescope,
  Sparkles,
  LucideIcon,
} from 'lucide-react';

export interface SafeImageProps {
  src?: string | null;
  alt?: string;
  category?: Category | string;
  type?: ContentType | string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallbackSrc?: string;
}

interface CategoryPlaceholderConfig {
  gradient: string;
  icon: LucideIcon;
  iconColor: string;
}

const CATEGORY_THEMES: Record<string, CategoryPlaceholderConfig> = {
  technology: {
    gradient: 'from-[#dbeafe] via-[#eff6ff] to-[#bfdbfe]',
    icon: Cpu,
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  finance: {
    gradient: 'from-[#d1fae5] via-[#ecfdf5] to-[#a7f3d0]',
    icon: TrendingUp,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  sports: {
    gradient: 'from-[#fef3c7] via-[#fffbeb] to-[#fde68a]',
    icon: Trophy,
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  entertainment: {
    gradient: 'from-[#fce7f3] via-[#fdf2f8] to-[#fbcfe8]',
    icon: Film,
    iconColor: 'text-pink-600 dark:text-pink-400',
  },
  health: {
    gradient: 'from-[#ffe4e6] via-[#fff1f2] to-[#fecdd3]',
    icon: Heart,
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  science: {
    gradient: 'from-[#ede9fe] via-[#f5f3ff] to-[#ddd6fe]',
    icon: FlaskConical,
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  space: {
    gradient: 'from-[#e0e7ff] via-[#eef2ff] to-[#c7d2fe]',
    icon: Telescope,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  general: {
    gradient: 'from-[#e4f7c8] via-[#fee5d3] to-[#ded8fa]',
    icon: Sparkles,
    iconColor: 'text-stone-700 dark:text-stone-300',
  },
};

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  category = 'technology',
  type = 'news',
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  fallbackSrc,
}) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const error = !!src && failedSrc === src;

  // Derive descriptive alt text if not provided
  const categoryKey = (category || 'technology').toLowerCase();
  const catCapitalized = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
  const effectiveAlt = alt || `${catCapitalized} ${type || 'news'}`;

  // If fallbackSrc is provided and error occurs, use fallbackSrc if still in image mode
  if (error && fallbackSrc) {
    return (
      <Image
        src={fallbackSrc}
        alt={effectiveAlt}
        fill={fill}
        width={!fill ? width || 400 : undefined}
        height={!fill ? height || 300 : undefined}
        priority={priority}
        className={className}
        unoptimized={fallbackSrc.startsWith('data:') || fallbackSrc.endsWith('.svg')}
      />
    );
  }

  // If no src is provided, or image failed and no fallbackSrc, render category-based pastel placeholder
  if (!src || error) {
    const theme = CATEGORY_THEMES[categoryKey] || CATEGORY_THEMES.general;
    const Icon = theme.icon;

    return (
      <div
        role="img"
        aria-label={effectiveAlt}
        className={`relative flex flex-col items-center justify-center select-none overflow-hidden bg-gradient-to-br ${theme.gradient} ${className} ${fill ? 'w-full h-full' : ''}`}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 p-3 text-center">
          <div className={`p-2.5 rounded-2xl bg-white/80 dark:bg-stone-900/60 shadow-xs backdrop-blur-xs ${theme.iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className={`text-[11px] font-bold tracking-wide uppercase ${theme.iconColor}`}>
            {catCapitalized}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={effectiveAlt}
      fill={fill}
      width={!fill ? width || 400 : undefined}
      height={!fill ? height || 300 : undefined}
      priority={priority}
      onError={() => setFailedSrc(src)}
      className={className}
      unoptimized
      sizes="(max-width: 760px) 50vw, 400px"
    />
  );
};

export default SafeImage;
