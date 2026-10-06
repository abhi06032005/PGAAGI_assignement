"use client";
import { ArrowUpRight, SlidersHorizontal, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSettingsModalOpen } from "@/features/auth/authSlice";
import { setSelectedDetailItem } from "@/features/feed/feedSlice";
import { SafeImage } from "@/components/ui/SafeImage";
export function DashboardIntro() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const items = useAppSelector((s) => s.feed.items);
  const featured =
    items.find((i) => i.imageUrl && i.type === "news") || items[0];
  return (
    <section className="dashboard-intro">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t("studio.yourDailyEdit")}</p>
          <h1>
            {t("greeting.welcome")}, <span>{user.name.split(" ")[0]}.</span>
          </h1>
          <p className="muted">{t("greeting.subtitle")}</p>
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
        <div className="hero-manifesto">
          <div className="eyebrow">
            <Sparkles size={15} /> {t("studio.madeForYou")}
          </div>
          <h2>
            {t("studio.lessNoise")}
            <br />
            <span>{t("studio.moreYou")}</span>
          </h2>
          <p>{t("studio.heroDescription")}</p>
          <button
            onClick={() =>
              document
                .getElementById("feed-start")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            {t("studio.explore")} <ArrowUpRight size={19} />
          </button>
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <span className="hero-edition">P / 01</span>
        </div>
        <button
          className="hero-story"
          onClick={() => featured && dispatch(setSelectedDetailItem(featured))}
          disabled={!featured}
        >
          <SafeImage
            src={featured?.imageUrl}
            alt={featured?.title || "Your daily inspiration"}
            category={featured?.category}
            fill
            className="object-cover"
          />
          <div className="hero-story-shade" />
          <span className="hero-tag">{t("studio.inSpotlight")}</span>
          <div className="hero-story-copy">
            <p>
              {featured?.source || featured?.sourceName || "PULSE EDITORIAL"}
            </p>
            <h2>{featured?.title || t("studio.findingStories")}</h2>
            <span>
              {t("studio.readStory")} <ArrowUpRight size={17} />
            </span>
          </div>
        </button>
      </div>
    </section>
  );
}
