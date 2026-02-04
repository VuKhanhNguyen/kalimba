import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import "./index.css";
import "./assets/css/pico.min.css";
import "./assets/css/pico-theme-switcher.css";
import "./assets/css/pico-color-picker.css";
import "./assets/css/kalimba.css";
import "./assets/css/layout.css";

import App from "./App";
import I18nProvider from "./i18n/I18nProvider";

createRoot(document.body).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
