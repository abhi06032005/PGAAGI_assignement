"use client";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Radio, Bookmark, Plus, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTrending } from "@/features/feed/feedThunks";
import { setSelectedDetailItem } from "@/features/feed/feedSlice";
import { setSettingsModalOpen } from "@/features/auth/authSlice";
import { SafeImage } from "@/components/ui/SafeImage";
import { Skeleton } from "@/components/ui/Skeleton";
export function StudioRail({ connected }: { connected: boolean }) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const items = useAppSelector((s) => s.feed.trendingAll);
  const status = useAppSelector((s) => s.feed.trendingStatus);
  const saved = useAppSelector((s) => s.favorites.favoriteItems);
  const categories = useAppSelector((s) => s.preferences.favoriteCategories);
  useEffect(() => {
    dispatch(fetchTrending("all"));
  }, [dispatch]);
  return (
    <aside className="studio-rail">
      <div className="rail-title">
        <h2>{t("studio.onYourRadar")}</h2>
        <span className={`live-status ${connected ? "connected" : ""}`}>
          <i />
          {connected ? "LIVE" : "PAUSED"}
        </span>
      </div>
      <section className="rail-panel">
        <div className="section-label">
          <Radio size={15} />
          {t("nav.trending")}
          <Link href="/trending" aria-label="View all trending">
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="radar-list">
          {items.slice(0, 4).map((item, index) => (
            <button
              key={item.id}
              onClick={() => dispatch(setSelectedDetailItem(item))}
            >
              <span className="radar-number">0{index + 1}</span>
              <span>
                <small>{item.category}</small>
                <strong>{item.title}</strong>
                <em>{item.source || item.sourceName}</em>
              </span>
            </button>
          ))}
          {!items.length && (status === "loading" || status === "idle") && (
            <div role="status" aria-label={t("studio.findingStories")}>
              {[0, 1, 2, 3].map((i) => (
                <div className="radar-skeleton" key={i}>
                  <Skeleton className="h-7 w-6" />
                  <div>
                    <Skeleton className="h-2 w-16 mb-3" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!items.length && status === "failed" && (
            <div className="rail-error" role="status">
              {t("design.trendingError")}
              <button onClick={() => dispatch(fetchTrending("all"))}>
                {t("design.reloadRadar")}
              </button>
            </div>
          )}
          {!items.length && status === "succeeded" && (
            <p className="rail-error">{t("design.noTrends")}</p>
          )}
        </div>
      </section>
      <section className="rail-panel interest-panel">
        <div className="section-label">
          {t("studio.yourInterests")}
          <button
            aria-label="Edit interests"
            onClick={() => dispatch(setSettingsModalOpen(true))}
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="interest-tags">
          {categories.map((c) => (
            <span key={c}>{t(`categories.${c}`, c)}</span>
          ))}
        </div>
        <p>{t("studio.interestsHint")}</p>
      </section>
      <section className="saved-panel">
        <div className="section-label">
          <Bookmark size={16} />
          {t("studio.forLater")}
          <span>{saved.length.toString().padStart(2, "0")}</span>
        </div>
        {saved.length ? (
          saved.slice(0, 2).map((item) => (
            <button
              className="saved-mini"
              key={item.id}
              onClick={() => dispatch(setSelectedDetailItem(item))}
            >
              <span className="saved-image">
                <SafeImage
                  src={item.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                />
              </span>
              <strong>{item.title}</strong>
            </button>
          ))
        ) : (
          <p>{t("studio.saveHint")}</p>
        )}
        <Link href="/favorites">
          {t("studio.openCollection")}
          <ArrowUpRight size={17} />
        </Link>
      </section>
      <div className="quiet-note">
        <span className="flex items-center justify-center">
          <Sparkles size={14} className="text-amber-500" />
        </span>
        <p>
          {t("studio.stayCurious")}
          <br />
          <strong>{t("studio.somethingGood")}</strong>
        </p>
      </div>
      <p className="data-note">{t("studio.demoNote")}</p>
    </aside>
  );
}
