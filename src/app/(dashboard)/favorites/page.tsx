"use client";
import { useTranslation } from "react-i18next";
import { FavoritesSection } from "@/features/favorites/components/FavoritesSection";
import { useAppSelector } from "@/store/hooks";
export default function FavoritesPage() {
  const { t } = useTranslation();
  const count = useAppSelector((s) => s.favorites.favoriteIds.length);
  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            <span className="edition-dot" />
            {t("studio.forLater")}
          </p>
          <h1>
            {t("favorites.title")}
            <span className="collection-count">
              {" "}
              {count.toString().padStart(2, "0")}
            </span>
          </h1>
          <p className="muted">{t("favorites.subtitle")}</p>
        </div>
      </div>
      <FavoritesSection />
    </section>
  );
}
