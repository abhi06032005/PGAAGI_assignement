'use client';

import React from 'react';

export const PageBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#faf7f2] dark:bg-[#121214] text-stone-900 dark:text-stone-100 transition-colors duration-300">
      {/* Fixed Ambient Pastel Mesh Background */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-90 dark:opacity-20"
      >
        {/* Soft flowing pastel gradient layer */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#e6f8ca] via-[#fedccb] via-40% to-[#ded6f9]"
          style={{
            background: 'linear-gradient(125deg, #e4f7c8 0%, #fee5d3 32%, #fcd2e7 68%, #ded8fa 100%)',
          }}
        />
        {/* Blurred Organic Blobs for depth */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#d6f5ad] filter blur-3xl opacity-60 animate-pulse" />
        <div className="absolute top-1/4 -right-24 w-[30rem] h-[30rem] rounded-full bg-[#fbd4d8] filter blur-3xl opacity-60" />
        <div className="absolute bottom-10 left-1/3 w-[26rem] h-[26rem] rounded-full bg-[#e2dcff] filter blur-3xl opacity-60" />
      </div>

      {/* Main Content layer */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
};
export default PageBackground;
