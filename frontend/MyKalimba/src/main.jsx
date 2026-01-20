import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import "./index.css";

import "https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js";
import "https://cdn.jsdelivr.net/npm/soundfont-player@0.12.0/dist/soundfont-player.min.js";
import "./assets/css/pico.min.css";
import "./assets/css/pico-theme-switcher.css";
import "./assets/css/pico-color-picker.css";
import "./assets/css/kalimba.css";
import "./assets/css/layout.css";

import App from "./App.jsx";
import I18nProvider from "./i18n/I18nProvider.jsx";

createRoot(document.body).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
