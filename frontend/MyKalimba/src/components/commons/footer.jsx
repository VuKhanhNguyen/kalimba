import React from "react";
import { useI18n } from "../../i18n/useI18n.js";
export function Footer() {
  const { t } = useI18n();
  return (
    <footer>
      <hr />
      <p>
        <small>
          <span>{t("footer.builtwith")}</span>{" "}
          <a href="https://picocss.com" target="_blank">
            Pico
          </a>{" "}
          •
          <a
            href="https://github.com/Dunamis4tw/kalimba-online"
            target="_blank"
          >
            {t("footer.sourcecode")}
          </a>
        </small>
        <small style={{ float: "right" }}>
          <span>{t("footer.hostedby")}</span>{" "}
          <a href="https://pages.github.com" target="_blank">
            GitHub Pages
          </a>
        </small>
      </p>
    </footer>
  );
}
export default Footer;
