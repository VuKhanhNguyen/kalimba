import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import en from "../assets/lang/en.json";
import vi from "../assets/lang/vi.json";

const TRANSLATIONS = {
  en,
  vi,
};

const LANGUAGE_LABELS = {
  en: "English",
  vi: "Tiếng Việt",
};

function normalizeLangCode(code) {
  return (code || "").toString().trim().replaceAll("_", "-").toLowerCase();
}

function pickInitialLang() {
  const stored = window.localStorage?.getItem("localization");
  if (stored) {
    const normalized = normalizeLangCode(stored);
    const base = normalized.split("-")[0];
    if (TRANSLATIONS[normalized]) return normalized;
    if (TRANSLATIONS[base]) return base;
  }

  const navLangs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language || navigator.userLanguage || "en"];

  for (const lang of navLangs) {
    const normalized = normalizeLangCode(lang);
    const base = normalized.split("-")[0];
    if (TRANSLATIONS[normalized]) return normalized;
    if (TRANSLATIONS[base]) return base;
  }

  return "en";
}

export const I18nContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
  languages: [],
});

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(pickInitialLang);

  const setLang = useCallback((nextLang) => {
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
    (key, fallback) => {
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
      let meta = document.querySelector('meta[name="description"]');
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
