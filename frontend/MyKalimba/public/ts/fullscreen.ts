type FullscreenElementWithLegacy = HTMLElement & {
  mozRequestFullScreen?: () => Promise<void> | void;
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

type DocumentWithLegacyFullscreen = Document & {
  mozCancelFullScreen?: () => Promise<void> | void;
  webkitExitFullscreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
};

function onFirstMatch(selector: string, onMatch: (el: Element) => void): void {
  const existing = document.querySelector(selector);
  if (existing) {
    onMatch(existing);
    return;
  }

  const observer = new MutationObserver(() => {
    const found = document.querySelector(selector);
    if (!found) return;
    observer.disconnect();
    onMatch(found);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function setupFullscreen(): void {
  const buttonId = "fullscreenButton";
  const mainContainerId = "main-container";

  const isInitializedAttr = "data-fullscreen-init";

  const tryInit = () => {
    const fullscreenButton = document.getElementById(buttonId);
    const mainContainer = document.getElementById(mainContainerId);
    if (!fullscreenButton || !mainContainer) return;

    if (fullscreenButton.getAttribute(isInitializedAttr) === "1") return;
    fullscreenButton.setAttribute(isInitializedAttr, "1");

    const mainEl = mainContainer as FullscreenElementWithLegacy;
    const doc = document as DocumentWithLegacyFullscreen;

    const onIcon = document.getElementById(
      "fullscreen-on",
    ) as HTMLElement | null;
    const offIcon = document.getElementById(
      "fullscreen-off",
    ) as HTMLElement | null;

    const setUiFullscreen = (isFullscreen: boolean) => {
      if (onIcon) onIcon.style.display = isFullscreen ? "none" : "";
      if (offIcon) offIcon.style.display = isFullscreen ? "" : "none";
      mainContainer.classList.toggle("fullscreen", isFullscreen);
    };

    const enterFullscreen = () => {
      if (mainEl.requestFullscreen) {
        void mainEl.requestFullscreen();
      } else if (mainEl.mozRequestFullScreen) {
        void mainEl.mozRequestFullScreen();
      } else if (mainEl.webkitRequestFullscreen) {
        void mainEl.webkitRequestFullscreen();
      } else if (mainEl.msRequestFullscreen) {
        void mainEl.msRequestFullscreen();
      }
      setUiFullscreen(true);
    };

    const exitFullscreen = () => {
      if (doc.exitFullscreen) {
        void doc.exitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        void doc.mozCancelFullScreen();
      } else if (doc.webkitExitFullscreen) {
        void doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        void doc.msExitFullscreen();
      }
      setUiFullscreen(false);
    };

    fullscreenButton.addEventListener("click", () => {
      if (document.fullscreenElement) {
        exitFullscreen();
      } else {
        enterFullscreen();
      }
    });

    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        setUiFullscreen(false);
      }
    });

    // Ensure UI is correct on init.
    setUiFullscreen(Boolean(document.fullscreenElement));
  };

  // SPA-safe: initialize when the button appears.
  tryInit();
  onFirstMatch(`#${buttonId}`, () => tryInit());
}

setupFullscreen();

export {};
