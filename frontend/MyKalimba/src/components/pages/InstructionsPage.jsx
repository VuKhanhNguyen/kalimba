import React from "react";
import Header from "../commons/header.jsx";
import Footer from "../commons/footer.jsx";
import { useI18n } from "../../i18n/useI18n.js";

import logo from "../../assets/imgs/logo.svg";
import keyboardImg from "../../assets/imgs/keyboard.png";
import options1Img from "../../assets/imgs/options_1.png";
import options2Img from "../../assets/imgs/options_2.png";

export function InstructionsPage() {
  const { t } = useI18n();

  return (
    <React.Fragment>
      <main className="container" data-theme="generated">
        <Header />

        <article>
          <header>
            <hgroup>
              <h1>{t("instructions.title", "Instructions")}</h1>
              <p>{t("instructions.subtitle")}</p>
            </hgroup>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <img
                src={logo}
                alt="MyKalimba"
                width={56}
                height={56}
                loading="lazy"
                style={{ flex: "0 0 auto" }}
              />
              <small style={{ opacity: 0.9 }}>{t("instructions.tip")}</small>
            </div>
          </header>

          <section aria-labelledby="quickstart">
            <h2 id="quickstart">{t("instructions.quickstart.title")}</h2>
            <ol>
              <li>
                {t("instructions.quickstart.step1.prefix")}{" "}
                <a href="/">{t("title")}</a>
                {t("instructions.quickstart.step1.suffix")}
              </li>
              <li>{t("instructions.quickstart.step2")}</li>
              <li>{t("instructions.quickstart.step3")}</li>
              <li>
                {t("instructions.quickstart.step4.prefix")}{" "}
                <strong>{t("option.title", "Options")}</strong>{" "}
                {t("instructions.quickstart.step4.suffix")}
              </li>
            </ol>
          </section>

          <section aria-labelledby="how-to-play">
            <h2 id="how-to-play">{t("instructions.howToPlay.title")}</h2>
            <div className="grid">
              <div>
                <h3>{t("instructions.howToPlay.mouse.title")}</h3>
                <ul>
                  <li>{t("instructions.howToPlay.mouse.bullet1")}</li>
                  <li>{t("instructions.howToPlay.mouse.bullet2")}</li>
                  <li>{t("instructions.howToPlay.mouse.bullet3")}</li>
                </ul>
              </div>
              <div>
                <h3>{t("instructions.howToPlay.keyboard.title")}</h3>
                <ul>
                  <li>{t("instructions.howToPlay.keyboard.bullet1")}</li>
                  <li>{t("instructions.howToPlay.keyboard.bullet2")}</li>
                  <li>
                    {t("instructions.howToPlay.keyboard.bullet3.prefix")}{" "}
                    <strong>Space</strong>{" "}
                    {t("instructions.howToPlay.keyboard.bullet3.suffix")}
                  </li>
                </ul>
              </div>
            </div>

            <figure>
              <img
                src={keyboardImg}
                alt={t("instructions.images.keyboard.alt")}
                loading="lazy"
                style={{ width: "100%", borderRadius: 8 }}
              />
              <figcaption>
                {t("instructions.howToPlay.keyboard.figureCaption")}
              </figcaption>
            </figure>
          </section>

          <section aria-labelledby="buttons">
            <h2 id="buttons">{t("instructions.buttons.title")}</h2>
            <ul>
              <li>
                <strong>Fullscreen</strong>:{" "}
                {t("instructions.buttons.fullscreen")}
              </li>
              <li>
                <strong>Record</strong>: {t("instructions.buttons.record")}
              </li>
              <li>
                <strong>Play</strong>: {t("instructions.buttons.play")}
              </li>
            </ul>
            <small>{t("instructions.buttons.note")}</small>
          </section>

          <section aria-labelledby="options">
            <h2 id="options">{t("instructions.options.title")}</h2>
            <div className="grid">
              <div>
                <h3>{t("instructions.options.sound.title")}</h3>
                <ul>
                  <li>
                    <strong>Volume</strong>:{" "}
                    {t("instructions.options.sound.volume")}
                  </li>
                  <li>
                    <strong>Base note</strong>:{" "}
                    {t("instructions.options.sound.baseNote")}
                  </li>
                  <li>
                    <strong>Keys</strong>:{" "}
                    {t("instructions.options.sound.keys")}
                  </li>
                  <li>
                    <strong>Arrangement</strong>:{" "}
                    {t("instructions.options.sound.arrangement")}
                  </li>
                  <li>
                    <strong>Label type</strong>:{" "}
                    {t("instructions.options.sound.labelType")}
                  </li>
                </ul>
              </div>
              <div>
                <h3>{t("instructions.options.ui.title")}</h3>
                <ul>
                  <li>
                    <strong>Soundfonts</strong>:{" "}
                    {t("instructions.options.ui.soundfonts")}
                  </li>
                  <li>
                    <strong>Localization</strong>:{" "}
                    {t("instructions.options.ui.localization")}
                  </li>
                  <li>
                    <strong>Color</strong>: {t("instructions.options.ui.color")}
                  </li>
                  <li>
                    <strong>Keyboard control</strong>:{" "}
                    {t("instructions.options.ui.keyboardControl")}
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid">
              <figure>
                <img
                  src={options1Img}
                  alt={t("instructions.images.options1.alt")}
                  loading="lazy"
                  style={{ width: "100%", borderRadius: 8 }}
                />
                <figcaption>
                  {t("instructions.options.figure.options1.caption")}
                </figcaption>
              </figure>
              <figure>
                <img
                  src={options2Img}
                  alt={t("instructions.images.options2.alt")}
                  loading="lazy"
                  style={{ width: "100%", borderRadius: 8 }}
                />
                <figcaption>
                  {t("instructions.options.figure.options2.caption")}
                </figcaption>
              </figure>
            </div>
          </section>

          <section aria-labelledby="troubleshooting">
            <h2 id="troubleshooting">
              {t("instructions.troubleshooting.title")}
            </h2>
            <details>
              <summary>
                {t("instructions.troubleshooting.noSound.summary")}
              </summary>
              <ul>
                <li>{t("instructions.troubleshooting.noSound.bullet1")}</li>
                <li>{t("instructions.troubleshooting.noSound.bullet2")}</li>
                <li>{t("instructions.troubleshooting.noSound.bullet3")}</li>
              </ul>
            </details>
            <details>
              <summary>
                {t("instructions.troubleshooting.keyboard.summary")}
              </summary>
              <ul>
                <li>{t("instructions.troubleshooting.keyboard.bullet1")}</li>
                <li>{t("instructions.troubleshooting.keyboard.bullet2")}</li>
                <li>{t("instructions.troubleshooting.keyboard.bullet3")}</li>
              </ul>
            </details>
          </section>

          <footer>
            <small>
              {t("instructions.footer.ready")}{" "}
              <a href="/">{t("instructions.footer.back")}</a>.
            </small>
          </footer>
        </article>

        <Footer />
      </main>
    </React.Fragment>
  );
}

export default InstructionsPage;
