import React from "react";

export function Keyboard() {
  return (
    <section>
      <article id="main-container" data-theme="generated">
        <div className="kalimba-container" aria-busy="true"></div>

        <div className="buttons-container">
          <button
            id="fullscreenButton"
            className="button"
            aria-label="Fullscreen button"
            title="Fullscreen button"
          >
            <svg id="fullscreen-on" viewBox="0 0 24 24">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
            <svg
              id="fullscreen-off"
              viewBox="0 0 24 24"
              style={{ display: "none" }}
            >
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
            </svg>
          </button>

          <button
            id="recordButton"
            className="button anim-spin"
            aria-label="Record button"
            title="Record button"
          >
            <svg
              id="icon-spin"
              viewBox="0 0 36 36"
              className="icon loader"
              style={{ display: "none" }}
            >
              <circle
                cx="18"
                cy="18"
                r="16"
                stroke="var(--primary-inverse)"
                fill="none"
                strokeWidth="4"
                strokeDasharray="100"
                strokeDashoffset="33"
              ></circle>
            </svg>

            <svg id="icon-record" viewBox="0 0 36 36" className="icon">
              <circle
                cx="18"
                cy="18"
                r="11"
                fill="var(--primary-inverse)"
              ></circle>
            </svg>

            <svg
              id="icon-stop"
              viewBox="0 0 36 36"
              className="icon"
              style={{ display: "none" }}
            >
              <rect
                width="18"
                height="18"
                x="9"
                y="9"
                fill="var(--primary-inverse)"
              ></rect>
            </svg>
          </button>

          <button
            id="playButton"
            className="button anim-load"
            aria-label="Play button"
            title="Play button"
            disabled
          >
            <svg
              id="icon-load"
              viewBox="0 0 36 36"
              className="icon loader"
              style={{ display: "none" }}
            >
              <circle
                cx="18"
                cy="18"
                r="16"
                stroke="var(--primary-inverse)"
                fill="none"
                strokeWidth="4"
                strokeDasharray="100"
                strokeDashoffset="33"
              ></circle>
            </svg>

            <svg id="icon-play" viewBox="0 0 36 36" className="icon">
              <polygon
                points="12,8 12,28 28,18"
                fill="var(--primary-inverse)"
              ></polygon>
            </svg>

            <svg
              id="icon-pause"
              viewBox="0 0 36 36"
              className="icon"
              style={{ display: "none" }}
            >
              <rect
                x="10"
                y="9"
                width="6"
                height="18"
                fill="var(--primary-inverse)"
              ></rect>
              <rect
                x="20"
                y="9"
                width="6"
                height="18"
                fill="var(--primary-inverse)"
              ></rect>
            </svg>
          </button>
        </div>
      </article>
    </section>
  );
}
export default Keyboard;
