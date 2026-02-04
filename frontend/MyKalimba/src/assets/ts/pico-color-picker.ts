type ColorShades = Record<string, string> & { inverse: string };

type ColorPickerState = {
  color: string;
  colors: Record<string, ColorShades>;
  buttonsTarget: string;
  selectorButton: string;
  selectorSection: string;
  localStorageKey: string;
  buttons: NodeListOf<HTMLButtonElement> | null;
  generatedStyles: string | null;
};

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

function themeFromLocalStorage(state: ColorPickerState): string {
  try {
    const stored = window.localStorage?.getItem(state.localStorageKey);
    return stored ?? state.color;
  } catch {
    return state.color;
  }
}

function themeToLocalStorage(state: ColorPickerState, theme: string): void {
  try {
    window.localStorage?.setItem(state.localStorageKey, theme);
  } catch {
    // ignore
  }
}

function minifyCss(css: string): string {
  return css.replace(/^ +/gm, "");
}

function hexToRgba(hex: string, alpha: number): string {
  if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    throw new Error("Bad Hex");
  }

  const raw = hex.substring(1);
  const chars = raw.split("");
  const full =
    chars.length === 3
      ? [chars[0], chars[0], chars[1], chars[1], chars[2], chars[2]].join("")
      : chars.join("");

  const num = Number(`0x${full}`);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function setActiveButton(state: ColorPickerState, theme: string): void {
  if (!state.buttons) return;

  state.buttons.forEach((btn) => btn.removeAttribute("class"));

  const active = document.querySelector<HTMLButtonElement>(
    `${state.selectorButton}[data-color="${theme}"]`,
  );
  active?.setAttribute("class", "picked");
}

function generateTheme(state: ColorPickerState, themeName: string): void {
  const shades = state.colors[themeName];
  if (!shades) return;

  const tokens: Record<string, string> = {
    ".name": themeName.charAt(0).toUpperCase() + themeName.substring(1) + " ",
    ".c500": shades["500"],
    ".c600": shades["600"],
    ".c700": shades["700"],
    ".c600-outline-light": hexToRgba(shades["600"], 0.125),
    ".c600-outline-dark": hexToRgba(shades["600"], 0.25),
    ".inverse": shades.inverse,
  };

  Object.keys(tokens).forEach((selector) => {
    document
      .querySelectorAll<HTMLElement>(`${state.selectorSection} ${selector}`)
      .forEach((el) => {
        el.innerHTML = tokens[selector];
      });
  });

  const css = `
    [data-theme="generated"] {
      --h4-color: ${shades["700"]};
      --primary: ${shades["600"]};
      --primary-hover: ${shades["700"]};
      --primary-focus: ${hexToRgba(shades["600"], 0.125)};
      --primary-inverse: ${shades.inverse};
    }
    @media only screen and (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) [data-theme="generated"] {
        --h4-color: ${shades["400"]};
        --primary: ${shades["600"]};
        --primary-hover: ${shades["500"]};
        --primary-focus: ${hexToRgba(shades["600"], 0.25)};
        --primary-inverse: ${shades.inverse};
      }
    }
    [data-theme="dark"] [data-theme="generated"] {
      --h4-color: ${shades["500"]};
      --primary: ${shades["600"]};
      --primary-hover: ${shades["500"]};
      --primary-focus: ${hexToRgba(shades["600"], 0.25)};
      --primary-inverse: ${shades.inverse};
    }
    [data-theme="generated"] {
      --form-element-active-border-color: var(--primary);
      --form-element-focus-color: var(--primary-focus);
      --switch-color: var(--primary-inverse);
      --switch-checked-background-color: var(--primary);
    }
  `;

  const styleEl = document.querySelector<HTMLStyleElement>(
    'style[title="color-picker"]',
  );
  if (!styleEl) return;

  styleEl.innerHTML = (state.generatedStyles ?? "") + minifyCss(css);
}

function generateButtons(state: ColorPickerState): void {
  const target = document.querySelector<HTMLElement>(state.buttonsTarget);
  if (!target) return;

  // Prevent double-init (SPA route changes).
  if (target.querySelector("figure[data-color-picker='1']")) return;

  let buttonsHtml = "";
  let buttonCss = "";

  for (const name of Object.keys(state.colors)) {
    buttonsHtml += `<button data-color="${name}" aria-label="Activate ${name} theme"></button>`;

    const shades = state.colors[name];
    buttonCss += `
      button[data-color="${name}"] { background-color: ${shades["600"]}; }
      [data-theme="light"] button[data-color="${name}"]:hover,
      [data-theme="light"] button[data-color="${name}"]:active,
      [data-theme="light"] button[data-color="${name}"]:focus {
        background-color: ${shades["700"]};
      }
      [data-theme="dark"] button[data-color="${name}"]:hover,
      [data-theme="dark"] button[data-color="${name}"]:active,
      [data-theme="dark"] button[data-color="${name}"]:focus {
        background-color: ${shades["500"]};
      }
    `;
  }

  const figure = document.createElement("figure");
  figure.dataset.colorPicker = "1";
  figure.innerHTML = buttonsHtml;
  target.append(figure);

  state.buttons = document.querySelectorAll<HTMLButtonElement>(
    state.selectorButton,
  );

  state.buttons.forEach((btn) => {
    btn.addEventListener(
      "click",
      (evt) => {
        const clicked = evt.currentTarget as HTMLButtonElement;
        const theme = clicked.getAttribute("data-color");
        if (!theme) return;

        setActiveButton(state, theme);
        generateTheme(state, theme);
        themeToLocalStorage(state, theme);
      },
      false,
    );
  });

  let styleEl = document.querySelector<HTMLStyleElement>(
    'style[title="color-picker"]',
  );
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.setAttribute("title", "color-picker");
    document.head.appendChild(styleEl);
  }

  state.generatedStyles = minifyCss(buttonCss);
  styleEl.innerHTML = state.generatedStyles;
}

function initColorPicker(state: ColorPickerState): void {
  generateButtons(state);

  const theme = themeFromLocalStorage(state);
  setActiveButton(state, theme);
  generateTheme(state, theme);
}

const state: ColorPickerState = {
  color: "teal",
  colors: {},
  buttonsTarget: "#customization",
  selectorButton: "#customization button[data-color]",
  selectorSection: "#customization",
  localStorageKey: "picoColorTheme",
  buttons: null,
  generatedStyles: null,
};

state.colors = {
  red: {
    "50": "#ffebee",
    "100": "#ffcdd2",
    "200": "#ef9a9a",
    "300": "#e57373",
    "400": "#ef5350",
    "500": "#f44336",
    "600": "#e53935",
    "700": "#d32f2f",
    "800": "#c62828",
    "900": "#b71c1c",
    a100: "#ff8a80",
    a200: "#ff5252",
    a400: "#ff1744",
    a700: "#d50000",
    inverse: "#FFF",
  },
  pink: {
    "50": "#fce4ec",
    "100": "#f8bbd0",
    "200": "#f48fb1",
    "300": "#f06292",
    "400": "#ec407a",
    "500": "#e91e63",
    "600": "#d81b60",
    "700": "#c2185b",
    "800": "#ad1457",
    "900": "#880e4f",
    a100: "#ff80ab",
    a200: "#ff4081",
    a400: "#f50057",
    a700: "#c51162",
    inverse: "#FFF",
  },
  purple: {
    "50": "#f3e5f5",
    "100": "#e1bee7",
    "200": "#ce93d8",
    "300": "#ba68c8",
    "400": "#ab47bc",
    "500": "#9c27b0",
    "600": "#8e24aa",
    "700": "#7b1fa2",
    "800": "#6a1b9a",
    "900": "#4a148c",
    a100: "#ea80fc",
    a200: "#e040fb",
    a400: "#d500f9",
    a700: "#aa00ff",
    inverse: "#FFF",
  },
  "deep-purple": {
    "50": "#ede7f6",
    "100": "#d1c4e9",
    "200": "#b39ddb",
    "300": "#9575cd",
    "400": "#7e57c2",
    "500": "#673ab7",
    "600": "#5e35b1",
    "700": "#512da8",
    "800": "#4527a0",
    "900": "#311b92",
    a100: "#b388ff",
    a200: "#7c4dff",
    a400: "#651fff",
    a700: "#6200ea",
    inverse: "#FFF",
  },
  indigo: {
    "50": "#e8eaf6",
    "100": "#c5cae9",
    "200": "#9fa8da",
    "300": "#7986cb",
    "400": "#5c6bc0",
    "500": "#3f51b5",
    "600": "#3949ab",
    "700": "#303f9f",
    "800": "#283593",
    "900": "#1a237e",
    a100: "#8c9eff",
    a200: "#536dfe",
    a400: "#3d5afe",
    a700: "#304ffe",
    inverse: "#FFF",
  },
  blue: {
    "50": "#e3f2fd",
    "100": "#bbdefb",
    "200": "#90caf9",
    "300": "#64b5f6",
    "400": "#42a5f5",
    "500": "#2196f3",
    "600": "#1e88e5",
    "700": "#1976d2",
    "800": "#1565c0",
    "900": "#0d47a1",
    a100: "#82b1ff",
    a200: "#448aff",
    a400: "#2979ff",
    a700: "#2962ff",
    inverse: "#FFF",
  },
  "light-blue": {
    "50": "#e1f5fe",
    "100": "#b3e5fc",
    "200": "#81d4fa",
    "300": "#4fc3f7",
    "400": "#29b6f6",
    "500": "#03a9f4",
    "600": "#039be5",
    "700": "#0288d1",
    "800": "#0277bd",
    "900": "#01579b",
    a100: "#80d8ff",
    a200: "#40c4ff",
    a400: "#00b0ff",
    a700: "#0091ea",
    inverse: "#FFF",
  },
  cyan: {
    "50": "#e0f7fa",
    "100": "#b2ebf2",
    "200": "#80deea",
    "300": "#4dd0e1",
    "400": "#26c6da",
    "500": "#00bcd4",
    "600": "#00acc1",
    "700": "#0097a7",
    "800": "#00838f",
    "900": "#006064",
    a100: "#84ffff",
    a200: "#18ffff",
    a400: "#00e5ff",
    a700: "#00b8d4",
    inverse: "#000",
  },
  teal: {
    "50": "#e0f2f1",
    "100": "#b2dfdb",
    "200": "#80cbc4",
    "300": "#4db6ac",
    "400": "#26a69a",
    "500": "#009688",
    "600": "#00897b",
    "700": "#00796b",
    "800": "#00695c",
    "900": "#004d40",
    a100: "#a7ffeb",
    a200: "#64ffda",
    a400: "#1de9b6",
    a700: "#00bfa5",
    inverse: "#000",
  },
  green: {
    "50": "#e8f5e9",
    "100": "#c8e6c9",
    "200": "#a5d6a7",
    "300": "#81c784",
    "400": "#66bb6a",
    "500": "#4caf50",
    "600": "#43a047",
    "700": "#388e3c",
    "800": "#2e7d32",
    "900": "#1b5e20",
    a100: "#b9f6ca",
    a200: "#69f0ae",
    a400: "#00e676",
    a700: "#00c853",
    inverse: "#000",
  },
  "light-green": {
    "50": "#f1f8e9",
    "100": "#dcedc8",
    "200": "#c5e1a5",
    "300": "#aed581",
    "400": "#9ccc65",
    "500": "#8bc34a",
    "600": "#7cb342",
    "700": "#689f38",
    "800": "#558b2f",
    "900": "#33691e",
    a100: "#ccff90",
    a200: "#b2ff59",
    a400: "#76ff03",
    a700: "#64dd17",
    inverse: "#000",
  },
  lime: {
    "50": "#f9fbe7",
    "100": "#f0f4c3",
    "200": "#e6ee9c",
    "300": "#dce775",
    "400": "#d4e157",
    "500": "#cddc39",
    "600": "#c0ca33",
    "700": "#afb42b",
    "800": "#9e9d24",
    "900": "#827717",
    a100: "#f4ff81",
    a200: "#eeff41",
    a400: "#c6ff00",
    a700: "#aeea00",
    inverse: "#000",
  },
  yellow: {
    "50": "#fffde7",
    "100": "#fff9c4",
    "200": "#fff59d",
    "300": "#fff176",
    "400": "#ffee58",
    "500": "#ffeb3b",
    "600": "#fdd835",
    "700": "#fbc02d",
    "800": "#f9a825",
    "900": "#f57f17",
    a100: "#ffff8d",
    a200: "#ffff00",
    a400: "#ffea00",
    a700: "#ffd600",
    inverse: "#000",
  },
  orange: {
    "50": "#fff3e0",
    "100": "#ffe0b2",
    "200": "#ffcc80",
    "300": "#ffb74d",
    "400": "#ffa726",
    "500": "#ff9800",
    "600": "#fb8c00",
    "700": "#f57c00",
    "800": "#ef6c00",
    "900": "#e65100",
    a100: "#ffd180",
    a200: "#ffab40",
    a400: "#ff9100",
    a700: "#ff6d00",
    inverse: "#000",
  },
  "deep-orange": {
    "50": "#fbe9e7",
    "100": "#ffccbc",
    "200": "#ffab91",
    "300": "#ff8a65",
    "400": "#ff7043",
    "500": "#ff5722",
    "600": "#f4511e",
    "700": "#e64a19",
    "800": "#d84315",
    "900": "#bf360c",
    a100: "#ff9e80",
    a200: "#ff6e40",
    a400: "#ff3d00",
    a700: "#dd2c00",
    inverse: "#FFF",
  },
  brown: {
    "50": "#efebe9",
    "100": "#d7ccc8",
    "200": "#bcaaa4",
    "300": "#a1887f",
    "400": "#8d6e63",
    "500": "#795548",
    "600": "#6d4c41",
    "700": "#5d4037",
    "800": "#4e342e",
    "900": "#3e2723",
    inverse: "#FFF",
  },
  "blue-grey": {
    "50": "#eceff1",
    "100": "#cfd8dc",
    "200": "#b0bec5",
    "300": "#90a4ae",
    "400": "#78909c",
    "500": "#607d8b",
    "600": "#546e7a",
    "700": "#455a64",
    "800": "#37474f",
    "900": "#263238",
    inverse: "#FFF",
  },
};

(function main() {
  // SPA-safe: init when the options panel mounts.
  onFirstMatch(state.buttonsTarget, () => initColorPicker(state));

  // Try once in case it's already there.
  initColorPicker(state);
})();

export {};
