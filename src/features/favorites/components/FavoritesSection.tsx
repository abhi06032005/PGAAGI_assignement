"use client";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectFavoriteItems } from "../selectors";
import { setQuery, setDebouncedQuery } from "@/features/search/searchSlice";
import { EmptyState } from "@/components/ui/EmptyState";
import { ContentCard } from "@/components/cards/ContentCard";

export function FavoritesSection({
  layout = "grid",
  className = "",
}: {
  layout?: "row" | "grid";
  className?: string;
}) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const allFavorites = useAppSelector(selectFavoriteItems);
  const query = useAppSelector((s) => s.search.debouncedQuery);
  const favorites = allFavorites.filter((i) =>
    [i.title, i.summary].join(" ").toLowerCase().includes(query.toLowerCase()),
  );
  if (!favorites.length)
    return (
      <EmptyState
        icon={<Bookmark size={24} />}
        title={
          allFavorites.length
            ? t("design.noSavedMatches")
            : t("design.collectionEmpty")
        }
        description={
          allFavorites.length
            ? t("studio.trySearch")
            : t("design.collectionHint")
        }
        className={className}
        action={
          allFavorites.length ? (
            <button
              className="soft-button"
              onClick={() => {
                dispatch(setQuery(""));
                dispatch(setDebouncedQuery(""));
              }}
            >
              {t("design.clearSearch")}
            </button>
          ) : (
            <Link className="soft-button" href="/">
              {t("design.exploreFeed")}
            </Link>
          )
        }
      />
    );
  return (
    <div
      className={`content-grid ${layout === "row" ? "collection-row" : ""} ${className}`}
    >
      {favorites.map((item) => (
        <ContentCard key={item.id} item={item} inCollection />
      ))}
    </div>
  );
}
export default FavoritesSection;
