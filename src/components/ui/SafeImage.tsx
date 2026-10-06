"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Category, ContentType } from "@/types";
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
} from "lucide-react";

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
    gradient: "from-[#dbeafe] via-[#eff6ff] to-[#bfdbfe]",
    icon: Cpu,
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  finance: {
    gradient: "from-[#d1fae5] via-[#ecfdf5] to-[#a7f3d0]",
    icon: TrendingUp,
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  sports: {
    gradient: "from-[#fef3c7] via-[#fffbeb] to-[#fde68a]",
    icon: Trophy,
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  entertainment: {
    gradient: "from-[#fce7f3] via-[#fdf2f8] to-[#fbcfe8]",
    icon: Film,
    iconColor: "text-pink-600 dark:text-pink-400",
  },
  health: {
    gradient: "from-[#ffe4e6] via-[#fff1f2] to-[#fecdd3]",
    icon: Heart,
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  science: {
    gradient: "from-[#ede9fe] via-[#f5f3ff] to-[#ddd6fe]",
    icon: FlaskConical,
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  space: {
    gradient: "from-[#e0e7ff] via-[#eef2ff] to-[#c7d2fe]",
    icon: Telescope,
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  general: {
    gradient: "from-[#e4f7c8] via-[#fee5d3] to-[#ded8fa]",
    icon: Sparkles,
    iconColor: "text-stone-700 dark:text-stone-300",
  },
};

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  category = "technology",
  type = "news",
  fill = false,
  width,
  height,
  className = "",
  priority = false,
  fallbackSrc,
}) => {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const [loadedSource, setLoadedSource] = useState<string | null>(null);
  const categoryKey = (category || "technology").toLowerCase();
  const catCapitalized =
    categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
  const effectiveAlt = alt ?? `${catCapitalized} ${type || "news"}`;
  const activeSource =
    src && !failedSources.includes(src)
      ? src
      : fallbackSrc && !failedSources.includes(fallbackSrc)
        ? fallbackSrc
        : null;

  useEffect(() => {
    if (!activeSource || loadedSource === activeSource) return;
    // A stalled image should resolve to the same useful cover as a failed image.
    const timeout = window.setTimeout(
      () =>
        setFailedSources((previous) => [...previous.slice(-3), activeSource]),
      15000,
    );
    return () => window.clearTimeout(timeout);
  }, [activeSource, loadedSource]);

  if (!activeSource) {
    const theme = CATEGORY_THEMES[categoryKey] || CATEGORY_THEMES.general;
    const Icon = theme.icon;
    return (
      <div
        role="img"
        aria-label={effectiveAlt}
        data-category={categoryKey}
        className={`image-placeholder relative flex flex-col items-center justify-center select-none overflow-hidden ${className} ${fill ? "w-full h-full" : ""}`}
        style={
          !fill
            ? { width: width || 400, height: height || 300, maxWidth: "100%" }
            : undefined
        }
      >
        <div className="relative z-10 flex flex-col items-center justify-center gap-2 p-3 text-center">
          <div className="p-3 rounded-xl">
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-medium tracking-wider uppercase">
            {catCapitalized}
          </span>
        </div>
      </div>
    );
  }

  return (
    <span
      className={
        fill
          ? "safe-image absolute inset-0 block"
          : "safe-image relative inline-block"
      }
      style={
        !fill
          ? { width: width || 400, height: height || 300, maxWidth: "100%" }
          : undefined
      }
    >
      {loadedSource !== activeSource && (
        <span aria-hidden="true" className="skeleton absolute inset-0 block" />
      )}
      <Image
        src={activeSource}
        alt={effectiveAlt}
        fill={fill}
        width={!fill ? width || 400 : undefined}
        height={!fill ? height || 300 : undefined}
        priority={priority}
        unoptimized
        onLoad={() => setLoadedSource(activeSource)}
        onError={() =>
          setFailedSources((previous) => [...previous.slice(-3), activeSource])
        }
        className={`${className} ${loadedSource === activeSource ? "image-loading" : "opacity-0"}`}
        sizes="(max-width: 540px) 100vw, (max-width: 1090px) 60vw, 600px"
      />
    </span>
  );
};
export default SafeImage;
