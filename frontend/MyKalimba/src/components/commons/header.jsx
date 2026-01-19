import React from "react";
import { useI18n } from "../../i18n/useI18n.js";
export function Header() {
  const { t } = useI18n();
  return (
    <header className="container">
      <hgroup>
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
      </hgroup>
    </header>
  );
}
export default Header;
