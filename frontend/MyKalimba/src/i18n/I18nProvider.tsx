import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import en from "../assets/lang/en.json";
import vi from "../assets/lang/vi.json";

type TranslationDict = Record<string, string>;

const TRANSLATIONS: Record<string, TranslationDict> = {
  en: en as TranslationDict,
  vi: vi as TranslationDict,
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

function normalizeLangCode(code: unknown): string {
  return (code || "").toString().trim().replace(/_/g, "-").toLowerCase();
}

function pickInitialLang(): string {
  const stored = window.localStorage?.getItem("localization");
  if (stored) {
    const normalized = normalizeLangCode(stored);
    const base = normalized.split("-")[0];
    if (TRANSLATIONS[normalized]) return normalized;
    if (TRANSLATIONS[base]) return base;
  }

  const navLangs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language || "en"];

  for (const lang of navLangs) {
    const normalized = normalizeLangCode(lang);
    const base = normalized.split("-")[0];
    if (TRANSLATIONS[normalized]) return normalized;
    if (TRANSLATIONS[base]) return base;
  }

  return "en";
}

export type I18nLanguageOption = { code: string; label: string };

export type I18nContextValue = {
  lang: string;
  setLang: (nextLang: string) => void;
  t: (key: string, fallback?: string) => string;
  languages: I18nLanguageOption[];
};

export const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
  languages: [],
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<string>(() => pickInitialLang());

  const setLang = useCallback((nextLang: string) => {
    const normalized = normalizeLangCode(nextLang);
    const base = normalized.split("-")[0];
    const resolved = TRANSLATIONS[normalized]
      ? normalized
      : TRANSLATIONS[base]
        ? base
        : "en";

    setLangState(resolved);
    window.localStorage?.setItem("localization", resolved);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => {
      const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
      return dict?.[key] ?? TRANSLATIONS.en?.[key] ?? fallback ?? "";
    },
    [lang],
  );

  const languages = useMemo(
    () =>
      Object.keys(TRANSLATIONS).map((code) => ({
        code,
        label: LANGUAGE_LABELS[code] || code,
      })),
    [],
  );

  useEffect(() => {
    document.documentElement.lang = lang;

    // Keep basic SEO fields in sync.
    const title = t("title");
    if (title) document.title = title;

    const description = t("seo.description");
    if (description) {
      let meta = document.querySelector(
        'meta[name="description"]',
      ) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }
  }, [lang, t]);

  const value = useMemo(
    () => ({ lang, setLang, t, languages }),
    [lang, setLang, t, languages],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export default I18nProvider;
