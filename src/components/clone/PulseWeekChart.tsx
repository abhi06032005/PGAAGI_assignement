'use client';

import React from 'react';

export const PulseWeekChart: React.FC = () => {
  const days = [
    { label: 'M', height: 'h-6', isLime: false },
    { label: 'T', height: 'h-10', isLime: false },
    { label: 'W', height: 'h-6', isLime: false },
    { label: 'T', height: 'h-14', isLime: true },
    { label: 'F', height: 'h-8', isLime: false },
    { label: 'S', height: 'h-4', isLime: false },
    { label: 'S', height: 'h-7', isLime: false },
  ];

  return (
    <div className="bg-[#1c2026] rounded-2xl p-4 text-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-white tracking-tight">
          Your week
        </h3>
        <span className="text-xs font-bold text-[#cbf63a]">
          12 read · 5 watched
        </span>
      </div>

      {/* Bar Chart Columns */}
      <div className="flex items-end justify-between gap-3 pt-4 pb-1 px-2">
        {days.map((day, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
            <div
              className={`w-full max-w-[3.5rem] rounded-xl transition-all ${day.height} ${
                day.isLime ? 'bg-[#cbf63a]' : 'bg-white'
              }`}
            />
            <span className="text-[11px] font-semibold text-slate-400">
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
