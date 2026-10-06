"use client";
import {
  ArrowDown,
  ArrowUpRight,
  Headphones,
  SlidersHorizontal,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSettingsModalOpen } from "@/features/auth/authSlice";
import { setSelectedDetailItem } from "@/features/feed/feedSlice";
import { setAiDjModalOpen } from "@/features/spotify/spotifySlice";
import { SafeImage } from "@/components/ui/SafeImage";
import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardIntro() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const discover = usePathname() === "/discover";
  const user = useAppSelector((s) => s.auth.user);
  const { items, status } = useAppSelector((s) => s.feed);
  const featured =
    items.find((i) => i.imageUrl && i.type === "news") || items[0];
  const loading = !featured && (status === "idle" || status === "loading");
  return (
    <section className="dashboard-intro">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            <span className="edition-dot" />
            {t("studio.yourDailyEdit")}
          </p>
          <h1>
            {discover ? (
              t("design.discoverTitle")
            ) : (
              <>
                {t("greeting.welcome")}, <span>{user.name.split(" ")[0]}.</span>
              </>
            )}
          </h1>
          <p className="muted">
            {discover ? t("design.discoverSubtitle") : t("greeting.subtitle")}
          </p>
        </div>
        <button
          className="soft-button"
          onClick={() => dispatch(setSettingsModalOpen(true))}
        >
          <SlidersHorizontal size={16} />
          {t("studio.customize")}
        </button>
      </div>
      <div className="hero-grid">
        {loading ? (
          <div
            className="hero-story hero-loading"
            role="status"
            aria-label={t("studio.findingStories")}
          >
            <Skeleton className="h-6 w-28" />
            <div>
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          </div>
        ) : featured ? (
          <button
            className="hero-story"
            onClick={() => dispatch(setSelectedDetailItem(featured))}
          >
            <SafeImage
              src={featured.imageUrl}
              alt={featured.title}
              category={featured.category}
              fill
              priority
              className="object-cover"
            />
            <div className="hero-story-shade" />
            <span className="hero-tag">
              <span />
              {t("studio.inSpotlight")}
            </span>
            <div className="hero-story-copy">
              <p>
                {featured.source || featured.sourceName || "PULSE EDITORIAL"}
                <span> / </span>
                {t(`categories.${featured.category}`, featured.category)}
              </p>
              <h2>{featured.title}</h2>
              <div className="hero-story-bottom">
                <span>{t("studio.readStory")}</span>
                <span className="circle-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </div>
            </div>
          </button>
        ) : (
          <div className="hero-story hero-empty">
            <span className="eyebrow">PULSE / THE DAILY EDIT</span>
            <h2>{t("design.freshPerspective")}</h2>
            <p>{t("studio.trySearch")}</p>
            <a href="#feed-start" className="soft-button">
              {t("studio.explore")}
              <ArrowDown size={16} />
            </a>
          </div>
        )}
        <div className="soundtrack-card">
          <div className="eyebrow">
            <Headphones size={15} />
            {t("design.yourSoundtrack")}
          </div>
          <div className="record-art" aria-hidden="true">
            <div className="record-sleeve">
              <span>p.</span>
              <small>SOUND / 01</small>
            </div>
            <div className="vinyl-record">
              <span />
            </div>
          </div>
          <div className="soundtrack-copy">
            <h2>{t("design.setTheTone")}</h2>
            <p>{t("design.soundtrackDescription")}</p>
          </div>
          <button
            className="dark-button"
            onClick={() => dispatch(setAiDjModalOpen(true))}
          >
            {t("design.makePlaylist")}
            <ArrowUpRight size={17} />
          </button>
          <span className="soundtrack-footnote">
            {t("design.poweredByMood")}
          </span>
        </div>
      </div>
    </section>
  );
}
