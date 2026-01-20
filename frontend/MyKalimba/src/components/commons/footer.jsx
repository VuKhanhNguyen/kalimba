import React from "react";
import { useI18n } from "../../i18n/useI18n.js";
export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h5>{t("title")}</h5>
          <p>{t("description")}</p>
        </div>
        <div className="footer-section">
          <h5>{t("footer.section.quickLinks")}</h5>
          <ul>
            <li>
              <a href="#">{t("footer.link.home")}</a>
            </li>
            <li>
              <a href="#">{t("footer.link.sheets")}</a>
            </li>
            <li>
              <a href="#">{t("footer.link.tutorials")}</a>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h5>{t("footer.section.community")}</h5>
          <ul>
            <li>
              <a href="#">{t("footer.link.forum")}</a>
            </li>
            <li>
              <a href="#">{t("footer.link.discord")}</a>
            </li>
            <li>
              <a href="#">{t("footer.link.contribute")}</a>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h5>{t("footer.section.resources")}</h5>
          <ul>
            <li>
              <a href="https://picocss.com" target="_blank">
                {t("footer.link.picoCss")}
              </a>
            </li>
            <li>
              <a
                href="https://github.com/Dunamis4tw/kalimba-online"
                target="_blank"
              >
                {t("footer.sourcecode")}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <small>
          <span>{t("footer.builtwith")}</span>{" "}
          <a href="https://picocss.com" target="_blank">
            Pico
          </a>{" "}
          •<span> {t("footer.hostedby")}</span>{" "}
          <a href="https://pages.github.com" target="_blank">
            GitHub Pages
          </a>
        </small>
      </div>
    </footer>
  );
}
export default Footer;
