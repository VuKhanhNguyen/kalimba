function clampInt(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const SOUNDFONTS = {
  FluidR3_GM: {
    url: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/kalimba-mp3.js",
    gain: 6,
  },
  FatBoy: {
    url: "https://gleitz.github.io/midi-js-soundfonts/FatBoy/kalimba-mp3.js",
    gain: 6,
  },
  Keylimba: {
    url: "/soundfonts/keylimba/kalimba.mp3.js",
    gain: 1,
  },
};

function getSoundfontName() {
  try {
    return window.localStorage?.getItem("soundfont") || "Keylimba";
  } catch {
    return "Keylimba";
  }
}

function getVolumePercent() {
  try {
    return clampInt(window.localStorage?.getItem("volume"), 75);
  } catch {
    return 75;
  }
}

let audioContext;
let instrumentPromise;
let instrumentUrl;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

async function loadInstrument() {
  const Soundfont = window.Soundfont;
  if (!Soundfont?.instrument) {
    throw new Error("Soundfont player is not loaded");
  }

  const sfName = getSoundfontName();
  const sf = SOUNDFONTS[sfName] || SOUNDFONTS.Keylimba;

  if (!instrumentPromise || instrumentUrl !== sf.url) {
    instrumentUrl = sf.url;
    instrumentPromise = Soundfont.instrument(getAudioContext(), sf.url);
  }

  return instrumentPromise;
}

export async function playNoteSequence(noteNames, { bpm = 120 } = {}) {
  const ac = getAudioContext();
  if (ac.state === "suspended") {
    // Must be called from a user gesture.
    await ac.resume();
  }

  const sfName = getSoundfontName();
  const sf = SOUNDFONTS[sfName] || SOUNDFONTS.Keylimba;
  const instrument = await loadInstrument();

  const volume = Math.max(0, Math.min(100, getVolumePercent()));
  const gain = (sf.gain * volume) / 100;

  const stepMs = Math.max(40, Math.round(60000 / Math.max(30, bpm)));
  const timeouts = [];
  let stopped = false;

  const stop = () => {
    stopped = true;
    for (const id of timeouts) clearTimeout(id);
  };

  let offset = 0;
  for (const note of noteNames || []) {
    const id = setTimeout(() => {
      if (stopped) return;
      if (!note) return;
      instrument.play(note, 0, { gain });
    }, offset);
    timeouts.push(id);
    offset += stepMs;
  }

  return { stop };
}
