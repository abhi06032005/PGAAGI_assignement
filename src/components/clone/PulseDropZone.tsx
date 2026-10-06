'use client';

import React from 'react';
import { Move } from 'lucide-react';

export const PulseDropZone: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Feed reordering dropzone"
      className="border-2 border-dashed border-purple-300/70 bg-purple-50/40 rounded-2xl py-3 px-4 text-center text-xs text-slate-600 font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-purple-50/70 transition-colors"
    >
      <Move className="w-3.5 h-3.5 text-slate-400" />
      <span>Drop a card here to reorder your feed</span>
    </div>
  );
};
