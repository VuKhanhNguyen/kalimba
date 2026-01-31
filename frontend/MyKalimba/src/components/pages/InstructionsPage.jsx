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
          <header style={{ marginBottom: "3rem", textAlign: "center" }}>
            <hgroup>
              <h1
                style={{
                  fontSize: "3rem",
                  background:
                    "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "0.5rem",
                }}
              >
                {t("instructions.title", "Instructions")}
              </h1>
              <p
                style={{ fontSize: "1.2rem", color: "var(--text-muted-color)" }}
              >
                {t("instructions.subtitle")}
              </p>
            </hgroup>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                marginTop: "2rem",
              }}
            >
              <img
                src={logo}
                alt="MyKalimba"
                width={80}
                height={80}
                loading="lazy"
                style={{
                  flex: "0 0 auto",
                  filter: "drop-shadow(0 0 10px rgba(0, 210, 255, 0.5))",
                }}
              />
              <small
                style={{
                  opacity: 0.9,
                  fontStyle: "italic",
                  maxWidth: "400px",
                  textAlign: "left",
                }}
              >
                {t("instructions.tip")}
              </small>
            </div>
          </header>

          <div
            className="glass-panel"
            style={{ padding: "2rem", marginBottom: "2rem" }}
          >
            <section aria-labelledby="quickstart">
              <h2
                id="quickstart"
                style={{
                  color: "var(--primary)",
                  borderBottom: "1px solid var(--glass-border)",
                  paddingBottom: "0.5rem",
                }}
              >
                {t("instructions.quickstart.title")}
              </h2>
              <ol style={{ fontSize: "1.1rem", lineHeight: "1.8" }}>
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
          </div>

          <div
            className="glass-panel"
            style={{ padding: "2rem", marginBottom: "2rem" }}
          >
            <section aria-labelledby="how-to-play">
              <h2
                id="how-to-play"
                style={{
                  color: "var(--primary)",
                  borderBottom: "1px solid var(--glass-border)",
                  paddingBottom: "0.5rem",
                }}
              >
                {t("instructions.howToPlay.title")}
              </h2>
              <div className="grid">
                <div>
                  <h3 style={{ color: "var(--secondary)" }}>
                    {t("instructions.howToPlay.mouse.title")}
                  </h3>
                  <ul>
                    <li>{t("instructions.howToPlay.mouse.bullet1")}</li>
                    <li>{t("instructions.howToPlay.mouse.bullet2")}</li>
                    <li>{t("instructions.howToPlay.mouse.bullet3")}</li>
                  </ul>
                </div>
                <div>
                  <h3 style={{ color: "var(--secondary)" }}>
                    {t("instructions.howToPlay.keyboard.title")}
                  </h3>
                  <ul>
                    <li>{t("instructions.howToPlay.keyboard.bullet1")}</li>
                    <li>{t("instructions.howToPlay.keyboard.bullet2")}</li>
                    <li>
                      {t("instructions.howToPlay.keyboard.bullet3.prefix")}{" "}
                      <kbd
                        style={{
                          background: "var(--surface)",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          color: "#000",
                        }}
                      >
                        Space
                      </kbd>{" "}
                      {t("instructions.howToPlay.keyboard.bullet3.suffix")}
                    </li>
                  </ul>
                </div>
              </div>

              <figure style={{ marginTop: "2rem" }}>
                <img
                  src={keyboardImg}
                  alt={t("instructions.images.keyboard.alt")}
                  loading="lazy"
                  style={{
                    width: "100%",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "var(--glass-shadow)",
                  }}
                />
                <figcaption
                  style={{
                    textAlign: "center",
                    marginTop: "0.5rem",
                    color: "var(--text-muted-color)",
                  }}
                >
                  {t("instructions.howToPlay.keyboard.figureCaption")}
                </figcaption>
              </figure>
            </section>
          </div>

          <div
            className="glass-panel"
            style={{ padding: "2rem", marginBottom: "2rem" }}
          >
            <section aria-labelledby="buttons">
              <h2
                id="buttons"
                style={{
                  color: "var(--primary)",
                  borderBottom: "1px solid var(--glass-border)",
                  paddingBottom: "0.5rem",
                }}
              >
                {t("instructions.buttons.title")}
              </h2>
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
              <small
                style={{
                  display: "block",
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {t("instructions.buttons.note")}
              </small>
            </section>
          </div>

          <div
            className="glass-panel"
            style={{ padding: "2rem", marginBottom: "2rem" }}
          >
            <section aria-labelledby="options">
              <h2
                id="options"
                style={{
                  color: "var(--primary)",
                  borderBottom: "1px solid var(--glass-border)",
                  paddingBottom: "0.5rem",
                }}
              >
                {t("instructions.options.title")}
              </h2>
              <div className="grid">
                <div>
                  <h3 style={{ color: "var(--secondary)" }}>
                    {t("instructions.options.sound.title")}
                  </h3>
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
                  <h3 style={{ color: "var(--secondary)" }}>
                    {t("instructions.options.ui.title")}
                  </h3>
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
                      <strong>Color</strong>:{" "}
                      {t("instructions.options.ui.color")}
                    </li>
                    <li>
                      <strong>Keyboard control</strong>:{" "}
                      {t("instructions.options.ui.keyboardControl")}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid" style={{ marginTop: "2rem", gap: "2rem" }}>
                <figure>
                  <img
                    src={options1Img}
                    alt={t("instructions.images.options1.alt")}
                    loading="lazy"
                    style={{
                      width: "100%",
                      borderRadius: "var(--radius-md)",
                      boxShadow: "var(--glass-shadow)",
                    }}
                  />
                  <figcaption
                    style={{
                      textAlign: "center",
                      marginTop: "0.5rem",
                      color: "var(--text-muted-color)",
                    }}
                  >
                    {t("instructions.options.figure.options1.caption")}
                  </figcaption>
                </figure>
                <figure>
                  <img
                    src={options2Img}
                    alt={t("instructions.images.options2.alt")}
                    loading="lazy"
                    style={{
                      width: "100%",
                      borderRadius: "var(--radius-md)",
                      boxShadow: "var(--glass-shadow)",
                    }}
                  />
                  <figcaption
                    style={{
                      textAlign: "center",
                      marginTop: "0.5rem",
                      color: "var(--text-muted-color)",
                    }}
                  >
                    {t("instructions.options.figure.options2.caption")}
                  </figcaption>
                </figure>
              </div>
            </section>
          </div>

          <div
            className="glass-panel"
            style={{ padding: "2rem", marginBottom: "2rem" }}
          >
            <section aria-labelledby="troubleshooting">
              <h2
                id="troubleshooting"
                style={{
                  color: "var(--primary)",
                  borderBottom: "1px solid var(--glass-border)",
                  paddingBottom: "0.5rem",
                }}
              >
                {t("instructions.troubleshooting.title")}
              </h2>
              <details
                style={{
                  marginBottom: "1rem",
                  borderBottom: "1px solid var(--glass-border)",
                }}
              >
                <summary
                  style={{
                    fontWeight: "bold",
                    cursor: "pointer",
                    color: "var(--text-color)",
                  }}
                >
                  {t("instructions.troubleshooting.noSound.summary")}
                </summary>
                <ul style={{ marginTop: "1rem", paddingLeft: "1.5rem" }}>
                  <li>{t("instructions.troubleshooting.noSound.bullet1")}</li>
                  <li>{t("instructions.troubleshooting.noSound.bullet2")}</li>
                  <li>{t("instructions.troubleshooting.noSound.bullet3")}</li>
                </ul>
              </details>
              <details
                style={{ borderBottom: "1px solid var(--glass-border)" }}
              >
                <summary
                  style={{
                    fontWeight: "bold",
                    cursor: "pointer",
                    color: "var(--text-color)",
                  }}
                >
                  {t("instructions.troubleshooting.keyboard.summary")}
                </summary>
                <ul style={{ marginTop: "1rem", paddingLeft: "1.5rem" }}>
                  <li>{t("instructions.troubleshooting.keyboard.bullet1")}</li>
                  <li>{t("instructions.troubleshooting.keyboard.bullet2")}</li>
                  <li>{t("instructions.troubleshooting.keyboard.bullet3")}</li>
                </ul>
              </details>
            </section>
          </div>

          <footer style={{ textAlign: "center", marginTop: "3rem" }}>
            <small style={{ fontSize: "1rem" }}>
              {t("instructions.footer.ready")}{" "}
              <a
                href="/"
                role="button"
                style={{
                  marginLeft: "0.5rem",
                  background: "var(--primary)",
                  border: "none",
                  padding: "0.5rem 1.5rem",
                  borderRadius: "var(--radius-lg)",
                  color: "var(--primary-inverse)",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                {t("instructions.footer.back")}
              </a>
            </small>
          </footer>
        </article>

        <Footer />
      </main>
    </React.Fragment>
  );
}

export default InstructionsPage;
