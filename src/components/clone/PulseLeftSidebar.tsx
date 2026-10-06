"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  LayoutGrid,
  Compass,
  Flame,
  Bookmark,
  Settings,
  Newspaper,
  Film,
  Music,
  Users,
  LogOut,
  ArrowUpRight,
  Headphones,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedType } from "@/features/search/searchSlice";
import { setSettingsModalOpen } from "@/features/auth/authSlice";
import { setAiDjModalOpen } from "@/features/spotify/spotifySlice";
import { logoutUser } from "@/features/auth/authThunks";
import { signOut } from "next-auth/react";

export function PulseLeftSidebar() {
  const path = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const count = useAppSelector((s) => s.favorites.favoriteIds.length);
  const signedIn = useAppSelector((s) => s.auth.isAuthenticated);
  const selectedType = useAppSelector((s) => s.search.selectedType);
  const nav = [
    ["/", "dashboard", LayoutGrid],
    ["/discover", "discover", Compass],
    ["/trending", "trending", Flame],
    ["/favorites", "favorites", Bookmark],
  ] as const;
  const sources = [
    ["news", Newspaper],
    ["recommendation", Film],
    ["music", Music],
    ["social", Users],
  ] as const;
  return (
    <aside className="studio-sidebar" aria-label="Sidebar navigation">
      <Link href="/" className="brand">
        <span>
          <Activity size={24} />
        </span>
        pulse<span className="brand-dot">®</span>
      </Link>
      <p className="sidebar-label">{t("studio.workspace")}</p>
      <nav aria-label="Main navigation">
        {nav.map(([href, key, Icon]) => (
          <Link
            key={href}
            href={href}
            aria-current={path === href ? "page" : undefined}
            className={`nav-item ${path === href ? "active" : ""}`}
          >
            <Icon size={19} />
            <span>{t(`nav.${key}`)}</span>
            {key === "favorites" && <small>{count}</small>}
          </Link>
        ))}
      </nav>
      <p className="sidebar-label sources-label">{t("studio.yourChannels")}</p>
      <div className="source-nav">
        {sources.map(([type, Icon]) => (
          <button
            key={type}
            className={`nav-item ${selectedType === type && path === "/" ? "channel-active" : ""}`}
            aria-pressed={selectedType === type && path === "/"}
            onClick={() => {
              dispatch(setSelectedType(type));
              router.push("/");
            }}
          >
            <Icon size={18} />
            <span>
              {t(
                `feed.${type === "recommendation" ? "recommendations" : type}`,
              )}
            </span>
            <span className={`source-dot ${type}`} />
          </button>
        ))}
        <button
          className="nav-item sidebar-dj"
          onClick={() => dispatch(setAiDjModalOpen(true))}
          title="Curate music matching your emotion"
        >
          <Headphones size={18} />
          <span>AI Mood DJ</span>
          <ArrowUpRight size={14} className="ml-auto" />
        </button>
      </div>
      <div className="sidebar-bottom">
        <div className="curate-note">
          <span className="curate-mark" aria-hidden="true">
            <Sparkles size={14} className="text-amber-500" />
          </span>
          <strong>{t("studio.makeItYours")}</strong>
          <p>{t("studio.tuneInterests")}</p>
          <button onClick={() => dispatch(setSettingsModalOpen(true))}>
            {t("studio.editInterests")}
            <ArrowUpRight size={15} />
          </button>
        </div>
        <button
          className="nav-item"
          onClick={() => dispatch(setSettingsModalOpen(true))}
        >
          <Settings size={18} />
          {t("nav.settings")}
        </button>
        <button
          className="nav-item"
          onClick={async () => {
            if (signedIn) {
              await dispatch(logoutUser());
              await signOut({ redirect: false }).catch(() => {});
            }
            router.push("/login");
          }}
        >
          <LogOut size={18} />
          {t(signedIn ? "nav.logout" : "nav.login")}
        </button>
        <p className="sidebar-footer">A little curiosity. Every day.</p>
      </div>
    </aside>
  );
}
