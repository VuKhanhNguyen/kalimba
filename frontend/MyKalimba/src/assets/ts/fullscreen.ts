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

const buttonId = "fullscreenButton";
const mainContainerId = "main-container";

function getUiElements() {
  const mainContainer = document.getElementById(mainContainerId);
  const onIcon = document.getElementById("fullscreen-on") as HTMLElement | null;
  const offIcon = document.getElementById(
    "fullscreen-off",
  ) as HTMLElement | null;
  return { mainContainer, onIcon, offIcon };
}

function setUiFullscreen(isFullscreen: boolean) {
  const { mainContainer, onIcon, offIcon } = getUiElements();
  if (onIcon) onIcon.style.display = isFullscreen ? "none" : "";
  if (offIcon) offIcon.style.display = isFullscreen ? "" : "none";
  if (mainContainer) mainContainer.classList.toggle("fullscreen", isFullscreen);
}

function enterFullscreen() {
  const mainContainer = document.getElementById(
    mainContainerId,
  ) as FullscreenElementWithLegacy | null;
  if (!mainContainer) return;

  if (mainContainer.requestFullscreen) {
    void mainContainer.requestFullscreen();
  } else if (mainContainer.mozRequestFullScreen) {
    void mainContainer.mozRequestFullScreen();
  } else if (mainContainer.webkitRequestFullscreen) {
    void mainContainer.webkitRequestFullscreen();
  } else if (mainContainer.msRequestFullscreen) {
    void mainContainer.msRequestFullscreen();
  }
}

function exitFullscreen() {
  const doc = document as DocumentWithLegacyFullscreen;
  if (doc.exitFullscreen) {
    void doc.exitFullscreen();
  } else if (doc.mozCancelFullScreen) {
    void doc.mozCancelFullScreen();
  } else if (doc.webkitExitFullscreen) {
    void doc.webkitExitFullscreen();
  } else if (doc.msExitFullscreen) {
    void doc.msExitFullscreen();
  }
}

// Use event delegation so the handler keeps working even if React remounts
// and replaces the button element (e.g., React.StrictMode dev behavior).
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  const button = target?.closest?.(`#${buttonId}`) as HTMLElement | null;
  if (!button) return;

  if (document.fullscreenElement) {
    exitFullscreen();
  } else {
    enterFullscreen();
  }
});

document.addEventListener("fullscreenchange", () => {
  setUiFullscreen(Boolean(document.fullscreenElement));
});

// Keep UI in sync when the play page mounts.
window.addEventListener("kalimba:mount", () => {
  setUiFullscreen(Boolean(document.fullscreenElement));
});

// Ensure UI is correct on initial load.
setUiFullscreen(Boolean(document.fullscreenElement));

export {};
