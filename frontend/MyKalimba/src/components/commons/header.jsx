import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n/useI18n.js";
export function Header() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/login");
  };
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
            <a href="/">{t("header.nav.home")}</a>
          </li>
          <li>
            <a href="#">{t("header.nav.songs")}</a>
          </li>
          <li>
            <a href="/instructions">{t("header.nav.instructions")}</a>
          </li>
          <li>
            <a href="#" onClick={handleLogin} role="button" className="outline">
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
