import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowUpDown,
  RotateCcw,
  PlusCircle,
  Globe,
  Compass,
  Sliders,
  Newspaper,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFeed } from "../feedThunks";
import { resetFeedOrder } from "../feedSlice";
import { CreateItemModal } from "./CreateItemModal";
import {
  setSelectedCategory,
  setSelectedType,
  setQuery,
  setDebouncedQuery,
  setSelectedNewsRegion,
  setCustomNewsTopic,
} from "@/features/search/searchSlice";
import { selectFilteredFeedItems } from "../selectors";
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const rawItems = useAppSelector((s) => s.feed.items);
  const filteredItems = useAppSelector(selectFilteredFeedItems);
  const { status, error, isReordered } = useAppSelector((s) => s.feed);
  const items = isReordered ? rawItems : filteredItems;

  const { favoriteCategories, favoriteTypes } = useAppSelector(
    (s) => s.preferences,
  );
  const {
    debouncedQuery,
    selectedCategory,
    selectedType,
    selectedNewsRegion,
    customNewsTopic,
  } = useAppSelector((s) => s.search);

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
    selectedNewsRegion,
    customNewsTopic,
  ]);

  const reset = () => {
    dispatch(setQuery(""));
    dispatch(setDebouncedQuery(""));
    dispatch(setSelectedCategory("all"));
    dispatch(setSelectedType("all"));
    dispatch(setSelectedNewsRegion("all"));
    dispatch(setCustomNewsTopic(""));
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
        <div className="feed-actions">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="soft-button add-post-button"
            title="Add a custom story or post to your feeds"
          >
            <PlusCircle size={15} />
            <span>{t("design.addPost")}</span>
          </button>
          <button
            onClick={() => dispatch(fetchFeed({ resetPage: true }))}
            className="soft-button"
            disabled={status === "loading"}
            title="Refresh feed content"
          >
            <RotateCcw size={15} />
            <span>
              {status === "loading"
                ? t("design.refreshing")
                : t("design.refresh")}
            </span>
          </button>
          {isReordered ? (
            <button
              className="reorder-hint"
              onClick={() => dispatch(resetFeedOrder())}
            >
              <RotateCcw size={13} />
              {t("studio.resetOrder")}
            </button>
          ) : (
            <span className="reorder-hint">
              <ArrowUpDown size={13} />
              {t("studio.dragHint")}
            </span>
          )}
        </div>
      </div>

      <CreateItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <div className="feed-filters space-y-3">
        {/* Topic Filters */}
        <div className="filter-row" role="group" aria-label="Filter by topic">
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

        {/* Format Filters */}
        <div
          className="filter-row type-filters"
          role="group"
          aria-label="Filter by format"
        >
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

        {/* Dedicated News Region & Customized Filter */}
        {(selectedType === "all" || selectedType === "news") && (
          <div className="news-region-toolbar pt-2 pb-1 border-t border-stone-200/50 dark:border-stone-800/60 flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                <Newspaper size={13} className="text-stone-400" />
                <span className="font-mono text-[11px] uppercase tracking-wider">News Region:</span>
              </div>

              <div
                className="filter-row flex items-center gap-1.5 flex-wrap"
                role="group"
                aria-label="News Region Filter"
              >
                <button
                  type="button"
                  aria-pressed={selectedNewsRegion === "all"}
                  className={`text-xs py-1 px-3 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedNewsRegion === "all"
                      ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900 border-stone-900 dark:border-white font-semibold shadow-xs"
                      : "bg-white/60 dark:bg-stone-800/50 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100"
                  }`}
                  onClick={() => dispatch(setSelectedNewsRegion("all"))}
                >
                  <Globe size={12} />
                  <span>All Headlines</span>
                </button>

                <button
                  type="button"
                  aria-pressed={selectedNewsRegion === "india"}
                  className={`text-xs py-1 px-3 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedNewsRegion === "india"
                      ? "bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs"
                      : "bg-white/60 dark:bg-stone-800/50 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100"
                  }`}
                  onClick={() => dispatch(setSelectedNewsRegion("india"))}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>India</span>
                </button>

                <button
                  type="button"
                  aria-pressed={selectedNewsRegion === "international"}
                  className={`text-xs py-1 px-3 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedNewsRegion === "international"
                      ? "bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs"
                      : "bg-white/60 dark:bg-stone-800/50 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100"
                  }`}
                  onClick={() => dispatch(setSelectedNewsRegion("international"))}
                >
                  <Compass size={12} />
                  <span>International</span>
                </button>

                <button
                  type="button"
                  aria-pressed={selectedNewsRegion === "custom"}
                  className={`text-xs py-1 px-3 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedNewsRegion === "custom"
                      ? "bg-amber-600 text-white border-amber-600 font-semibold shadow-xs"
                      : "bg-white/60 dark:bg-stone-800/50 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100"
                  }`}
                  onClick={() => dispatch(setSelectedNewsRegion("custom"))}
                >
                  <Sliders size={12} />
                  <span>Customized</span>
                </button>
              </div>
            </div>

            {selectedNewsRegion === "custom" && (
              <div className="flex items-center gap-2 pt-1 flex-wrap animate-in fade-in duration-200">
                <span className="font-mono text-[10px] text-stone-400 uppercase tracking-wider">
                  Preset:
                </span>
                {["AI & Silicon", "ISRO & Space", "Startups", "Green Energy", "Global Policy"].map(
                  (topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => dispatch(setCustomNewsTopic(topic))}
                      className={`text-[11px] px-2.5 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                        customNewsTopic === topic
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40 font-semibold"
                          : "bg-white/40 dark:bg-stone-800/40 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:text-stone-800"
                      }`}
                    >
                      {topic}
                    </button>
                  ),
                )}
                <input
                  type="text"
                  placeholder="Type custom keyword..."
                  value={customNewsTopic}
                  onChange={(e) => dispatch(setCustomNewsTopic(e.target.value))}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/70 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {status === "failed" && (
        <ErrorState
          title={t("studio.feedError")}
          message={error || t("feed.error")}
          onRetry={() => dispatch(fetchFeed({ resetPage: true }))}
        />
      )}

      {(status === "loading" || status === "idle") && items.length === 0 && (
        <FeedSkeletonList count={4} />
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

      {items.length > 0 && (
        <div
          aria-busy={status === "loading"}
          className={status === "loading" ? "feed-refreshing" : ""}
        >
          <SortableFeed items={items} />
        </div>
      )}

      {status === "loading" && items.length > 0 && (
        <FeedSkeletonList count={2} />
      )}

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
