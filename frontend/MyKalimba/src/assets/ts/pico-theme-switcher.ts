type Scheme = "auto" | "dark" | "light";

type ThemeSwitcherState = {
  resolvedScheme: "dark" | "light";
};

const localStorageKey = "picoPreferredColorScheme";
const buttonsTargetSelector = ".theme-switcher";

function getPreferredColorScheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function loadSchemeFromLocalStorage(): Scheme {
  try {
    const stored = window.localStorage?.getItem(localStorageKey);
    if (stored === "dark" || stored === "light" || stored === "auto")
      return stored;
  } catch {
    // ignore
  }
  return "auto";
}

function saveResolvedSchemeToLocalStorage(resolved: "dark" | "light"): void {
  try {
    window.localStorage?.setItem(localStorageKey, resolved);
  } catch {
    // ignore
  }
}

function resolveScheme(scheme: Scheme): "dark" | "light" {
  if (scheme === "auto") return getPreferredColorScheme();
  return scheme;
}

function applyScheme(resolved: "dark" | "light"): void {
  document.documentElement.setAttribute("data-theme", resolved);

  // Match legacy behavior:
  // - when dark mode is active, show the "light" icon/button and hide the "dark" icon/button.
  // - otherwise, show the "dark" icon/button and hide the "light" icon/button.
  const darkMode = resolved === "dark";

  const switchers = document.querySelectorAll<HTMLElement>(
    buttonsTargetSelector,
  );
  switchers.forEach((switcher) => {
    const showSelector = darkMode ? '[theme="light"]' : '[theme="dark"]';
    const hideSelector = darkMode ? '[theme="dark"]' : '[theme="light"]';

    switcher.querySelectorAll<HTMLElement>(showSelector).forEach((el) => {
      el.style.display = "";
    });

    switcher.querySelectorAll<HTMLElement>(hideSelector).forEach((el) => {
      el.style.display = "none";
    });
  });
}

function onFirstMatch(selector: string, onMatch: (el: Element) => void): void {
  const existing = document.querySelector(selector);
  if (existing) {
    onMatch(existing);
    return;
  }

  const observer = new MutationObserver(() => {
    const found = document.querySelector(selector);
    if (!found) return;
    observer.disconnect();
    onMatch(found);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function initThemeSwitchers(state: ThemeSwitcherState): void {
  // Event delegation so it works even if React rerenders the switcher nodes.
  if (
    (document.documentElement as HTMLElement).dataset.themeSwitcherInit === "1"
  ) {
    return;
  }
  (document.documentElement as HTMLElement).dataset.themeSwitcherInit = "1";

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const switcher = target.closest(buttonsTargetSelector);
    if (!switcher) return;

    const next = state.resolvedScheme === "dark" ? "light" : "dark";
    state.resolvedScheme = next;
    applyScheme(next);
    saveResolvedSchemeToLocalStorage(next);
  });
}

(function main() {
  const stored = loadSchemeFromLocalStorage();
  const initialResolved = resolveScheme(stored);
  const state: ThemeSwitcherState = { resolvedScheme: initialResolved };

  applyScheme(initialResolved);
  saveResolvedSchemeToLocalStorage(initialResolved);

  // Initialize immediately + when switchers show up.
  initThemeSwitchers(state);
  onFirstMatch(buttonsTargetSelector, () => initThemeSwitchers(state));
})();

export {};
