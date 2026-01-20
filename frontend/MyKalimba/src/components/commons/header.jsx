import React from "react";
import { useI18n } from "../../i18n/useI18n.js";
export function Header() {
  const { t } = useI18n();
  return (
    <header className="main-header">
      <nav className="main-navigation">
        <ul>
          <li>
            <a href="/" className="contrast">
              <strong>{t("title")}</strong>
            </a>
          </li>
        </ul>
        <ul className="nav-links">
          <li>
            <a href="#">{t("header.nav.home")}</a>
          </li>
          <li>
            <a href="#">{t("header.nav.songs")}</a>
          </li>
          <li>
            <a href="#">{t("header.nav.community")}</a>
          </li>
          <li>
            <a href="#" role="button" className="outline">
              {t("header.nav.login")}
            </a>
          </li>
        </ul>
      </nav>
      {/* Kept description but maybe hide it or style it as a subtitle in a hero section if desired. 
          For now I will comment it out or put it in a separate hero component, 
          but strictly sticking to header replacement, I will assume the title in nav is enough. 
          If the description is important, I can add it below nav but 'menu bar' implies just nav. */}
      {/* <p>{t("description")}</p> */}
    </header>
  );
}
export default Header;
