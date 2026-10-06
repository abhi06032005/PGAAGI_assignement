"use client";
import { useEffect } from "react";
import { Search, Globe, Moon, Sun, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setQuery, setDebouncedQuery } from "@/features/search/searchSlice";
import { setProfileModalOpen } from "@/features/auth/authSlice";
import { setTheme, setLanguage } from "@/features/preferences/preferencesSlice";
export function PulseTopNav() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const query = useAppSelector((s) => s.search.query);
  const { theme, language } = useAppSelector((s) => s.preferences);
  const user = useAppSelector((s) => s.auth.user);
  useEffect(() => {
    const timer = setTimeout(() => dispatch(setDebouncedQuery(query)), 300);
    return () => clearTimeout(timer);
  }, [query, dispatch]);
  return (
    <header className="studio-header">
      <div className="header-breadcrumb">
        {t("studio.workspace")} <span>/</span>{" "}
        <strong>{t("studio.overview")}</strong>
      </div>
      <div className="header-actions">
        <label className="studio-search">
          <Search size={17} />
          <input
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
              <X size={15} />
            </button>
          ) : (
            <kbd>⌕</kbd>
          )}
        </label>
        <button
          className="icon-button language-button"
          aria-label="Switch language"
          onClick={() => dispatch(setLanguage(language === "en" ? "hi" : "en"))}
        >
          <Globe size={17} />
          <span>{language.toUpperCase()}</span>
        </button>
        <button
          className="icon-button"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          onClick={() =>
            dispatch(setTheme(theme === "dark" ? "light" : "dark"))
          }
        >
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <button
          className="profile-avatar"
          aria-label="Open profile"
          onClick={() => dispatch(setProfileModalOpen(true))}
        >
          {user.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </button>
      </div>
    </header>
  );
}
