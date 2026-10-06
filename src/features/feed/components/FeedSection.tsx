"use client";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpDown, RotateCcw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFeed } from "../feedThunks";
import { resetFeedOrder } from "../feedSlice";
import {
  setSelectedCategory,
  setSelectedType,
  setQuery,
  setDebouncedQuery,
} from "@/features/search/searchSlice";
import { FeedSkeletonList } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SortableFeed } from "@/features/dnd/SortableFeed";
import { useInfiniteFeed } from "../useInfiniteFeed";
import { Category, ContentType } from "@/types";
const categories: Category[] = [
  "all",
  "technology",
  "finance",
  "sports",
  "entertainment",
  "health",
  "science",
];
const types: ContentType[] = ["news", "recommendation", "music", "social"];
export function FeedSection() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { items, status, error, isReordered } = useAppSelector((s) => s.feed);
  const { favoriteCategories, favoriteTypes } = useAppSelector(
    (s) => s.preferences,
  );
  const { debouncedQuery, selectedCategory, selectedType } = useAppSelector(
    (s) => s.search,
  );
  const { sentinelRef, hasMore, loadMore } = useInfiniteFeed();
  useEffect(() => {
    const request = dispatch(fetchFeed({ resetPage: true }));
    return () => {
      request.abort();
    };
  }, [
    dispatch,
    favoriteCategories,
    favoriteTypes,
    debouncedQuery,
    selectedCategory,
    selectedType,
  ]);
  const reset = () => {
    dispatch(setQuery(""));
    dispatch(setDebouncedQuery(""));
    dispatch(setSelectedCategory("all"));
    dispatch(setSelectedType("all"));
  };
  return (
    <section id="feed-start" className="feed-section">
      <div className="feed-heading">
        <div>
          <h2>
            {t("feed.title")}{" "}
            <span>
              {items.length} {t("studio.stories")}
            </span>
          </h2>
          <p>{t("studio.mixDescription")}</p>
        </div>
        <div>
          {isReordered ? (
            <button onClick={() => dispatch(resetFeedOrder())}>
              <RotateCcw size={13} />
              {t("studio.resetOrder")}
            </button>
          ) : (
            <span>
              <ArrowUpDown size={13} />
              {t("studio.dragHint")}
            </span>
          )}
        </div>
      </div>
      <div className="filter-row">
        {categories.map((c) => (
          <button
            aria-pressed={selectedCategory === c}
            className={selectedCategory === c ? "selected" : ""}
            key={c}
            onClick={() => dispatch(setSelectedCategory(c))}
          >
            {t(`categories.${c}`)}
          </button>
        ))}
      </div>
      <div className="filter-row type-filters">
        {(["all", ...types] as const).map((type) => (
          <button
            aria-pressed={selectedType === type}
            className={selectedType === type ? "selected" : ""}
            key={type}
            onClick={() => dispatch(setSelectedType(type))}
          >
            {t(
              type === "all"
                ? "studio.allFeeds"
                : `feed.${type === "recommendation" ? "recommendations" : type}`,
            )}
          </button>
        ))}
      </div>
      {status === "failed" && (
        <ErrorState
          title={t("studio.feedError")}
          message={error || t("feed.error")}
          onRetry={() => dispatch(fetchFeed({ resetPage: true }))}
        />
      )}
      {status === "loading" && items.length === 0 && (
        <FeedSkeletonList count={3} />
      )}
      {status === "succeeded" && items.length === 0 && (
        <EmptyState
          title={t("feed.empty")}
          description={t("studio.trySearch")}
          action={
            <button className="soft-button" onClick={reset}>
              {t("studio.resetFilters")}
            </button>
          }
        />
      )}
      {items.length > 0 && <SortableFeed items={items} />}
      <div ref={sentinelRef} className="feed-end" aria-live="polite">
        {status === "loading" ? (
          <span>{t("feed.loadMore")}</span>
        ) : hasMore && status === "succeeded" ? (
          <button className="soft-button" onClick={loadMore}>
            {t("studio.loadMore")}
          </button>
        ) : (
          items.length > 0 && <span>{t("feed.endOfFeed")}</span>
        )}
      </div>
    </section>
  );
}
export default FeedSection;
