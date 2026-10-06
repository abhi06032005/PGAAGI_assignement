'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export const PulseFavoritesRow: React.FC = () => {
  const router = useRouter();

  const cards = [
    {
      id: 'fav-1',
      bannerBg: 'bg-[#c2dfcb]',
      title: "Why India's EV market is set to boom",
      meta: '',
    },
    {
      id: 'fav-2',
      bannerBg: 'bg-[#f2b8b8]',
      title: 'The Batman',
      meta: '7.8',
    },
    {
      id: 'fav-3',
      bannerBg: 'bg-[#b8cbf2]',
      title: 'Designing a better tomorrow',
      meta: '',
    },
    {
      id: 'fav-4',
      bannerBg: 'bg-[#ebd89f]',
      title: 'Top 10 productivity apps',
      meta: '',
    },
  ];

  return (
    <section aria-labelledby="favorites-heading" className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 id="favorites-heading" className="text-sm font-bold text-slate-900 tracking-tight">
          Favorites
        </h2>
        <button
          onClick={() => router.push('/favorites')}
          className="text-xs font-medium text-slate-500 hover:text-black transition-colors"
        >
          View all
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white/95 rounded-2xl border border-black/5 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* Pastel Banner */}
            <div className={`h-20 w-full ${card.bannerBg}`} />

            {/* Bottom Title */}
            <div className="p-3">
              <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                {card.title}
              </h3>
              {card.meta && (
                <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
                  {card.meta}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
