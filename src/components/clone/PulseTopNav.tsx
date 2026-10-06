"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  Search,
  X,
  Globe,
  Sun,
  Moon,
  LogOut,
  Headphones,
  Settings2,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setQuery, setDebouncedQuery } from "@/features/search/searchSlice";
import {
  setProfileModalOpen,
  setSettingsModalOpen,
} from "@/features/auth/authSlice";
import { logoutUser } from "@/features/auth/authThunks";
import { signOut } from "next-auth/react";
import { setTheme, setLanguage } from "@/features/preferences/preferencesSlice";
import { setAiDjModalOpen } from "@/features/spotify/spotifySlice";

export function PulseTopNav() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const path = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const query = useAppSelector((s) => s.search.query);
  const { theme, language } = useAppSelector((s) => s.preferences);
  const user = useAppSelector((s) => s.auth.user);
  const route = path === "/" ? "dashboard" : path.slice(1);
  useEffect(() => {
    const timer = setTimeout(() => dispatch(setDebouncedQuery(query)), 300);
    return () => clearTimeout(timer);
  }, [query, dispatch]);
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k" &&
        !document.querySelector('[role="dialog"]')
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);
  return (
    <header className="studio-header">
      <div className="header-breadcrumb">
        {t("studio.workspace")}
        <ChevronRight size={13} />
        <strong>{t(`nav.${route}`)}</strong>
      </div>
      <Link href="/" className="mobile-brand" aria-label="Pulse home">
        <Activity size={23} />
        pulse<span>®</span>
      </Link>
      <div className="header-actions">
        <div className="studio-search">
          <Search size={17} aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            aria-label="Search content"
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(e) => dispatch(setQuery(e.target.value))}
          />
          {query ? (
            <button
              aria-label={t("search.clear")}
              onClick={() => dispatch(setQuery(""))}
            >
              <X size={16} />
            </button>
          ) : (
            <kbd>Ctrl K</kbd>
          )}
        </div>
        <button
          onClick={() => dispatch(setAiDjModalOpen(true))}
          className="mood-button"
          title="Open AI Mood DJ & Playlist Architect"
        >
          <Headphones size={16} />
          <span>AI Mood DJ</span>
        </button>
        <div className="header-utilities">
          <button
            className="icon-button language-button"
            aria-label="Switch language"
            title="Switch language"
            onClick={() =>
              dispatch(setLanguage(language === "en" ? "hi" : "en"))
            }
          >
            <Globe size={17} />
            <span>{language.toUpperCase()}</span>
          </button>
          <button
            className="icon-button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            onClick={() =>
              dispatch(
                setTheme(
                  (
                    theme === "system"
                      ? document.documentElement.classList.contains("dark")
                      : theme === "dark"
                  )
                    ? "light"
                    : "dark",
                ),
              )
            }
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="icon-button mobile-settings"
            aria-label={t("nav.settings")}
            onClick={() => dispatch(setSettingsModalOpen(true))}
          >
            <Settings2 size={18} />
          </button>
          <button
            className="profile-avatar"
            aria-label="Open profile"
            title={user.name}
            onClick={() => dispatch(setProfileModalOpen(true))}
          >
            {user.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </button>
          <button
            className="icon-button logout-button"
            aria-label="Log Out"
            title="Sign out"
            onClick={async () => {
              await dispatch(logoutUser());
              await signOut({ redirect: false }).catch(() => {});
              router.push("/login");
            }}
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
