'use client';

import React from 'react';
import { VibeLabel } from '@/types';
import { Sparkles } from 'lucide-react';

interface VibeChipProps {
  vibe: VibeLabel;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const VIBE_STYLES: Record<VibeLabel, { active: string; inactive: string }> = {
  Chill: {
    active: 'bg-teal-500 text-white shadow-teal-500/30',
    inactive: 'bg-teal-500/10 text-teal-600 dark:text-teal-300 hover:bg-teal-500/20',
  },
  Energetic: {
    active: 'bg-amber-500 text-white shadow-amber-500/30',
    inactive: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20',
  },
  Focused: {
    active: 'bg-indigo-500 text-white shadow-indigo-500/30',
    inactive: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20',
  },
  'Feel-good': {
    active: 'bg-pink-500 text-white shadow-pink-500/30',
    inactive: 'bg-pink-500/10 text-pink-600 dark:text-pink-300 hover:bg-pink-500/20',
  },
  Hype: {
    active: 'bg-violet-600 text-white shadow-violet-600/30',
    inactive: 'bg-violet-500/10 text-violet-600 dark:text-violet-300 hover:bg-violet-500/20',
  },
};

export const VibeChip: React.FC<VibeChipProps> = ({
  vibe,
  isActive = false,
  onClick,
  className = '',
}) => {
  const styles = VIBE_STYLES[vibe] || VIBE_STYLES.Chill;
  const currentStyle = isActive ? `${styles.active} shadow-md` : styles.inactive;

  return (
    <button
      onClick={onClick}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${currentStyle} ${className}`}
    >
      <Sparkles className="w-3 h-3" />
      <span>{vibe}</span>
    </button>
  );
};

export default VibeChip;
