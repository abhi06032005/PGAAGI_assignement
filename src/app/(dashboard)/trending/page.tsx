"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TrendingSection } from "@/features/trending/TrendingSection";
export default function TrendingPage() {
  const { t } = useTranslation();
  const [scope, setScope] = useState<"all" | "forYou">("all");
  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            <span className="edition-dot" />
            {t("studio.onYourRadar")}
          </p>
          <h1>{t("trending.title")}</h1>
          <p className="muted">{t("trending.subtitle")}</p>
        </div>
      </div>
      <div
        className="filter-row trend-tabs"
        role="group"
        aria-label="Trending scope"
      >
        {(["all", "forYou"] as const).map((value) => (
          <button
            key={value}
            className={scope === value ? "selected" : ""}
            aria-pressed={scope === value}
            onClick={() => setScope(value)}
          >
            {t(`trending.${value}`)}
          </button>
        ))}
      </div>
      <TrendingSection scope={scope} limit={12} />
    </section>
  );
}
