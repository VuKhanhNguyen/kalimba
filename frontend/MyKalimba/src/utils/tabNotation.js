const MAJOR_DEGREE_TO_SEMITONE = [0, 2, 4, 5, 7, 9, 11];
const LETTER_TO_SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SEMITONE_TO_NAME = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

function normalizeSymbols(text) {
  // Users often paste tabs with curly quotes (’), and dashes (–/—/−).
  // Normalize them so regex parsing works.
  return String(text)
    .replace(/[’]/g, "'")
    .replace(/[‐‑‒–—−]/g, "-")
    .replace(/[“”]/g, '"');
}

function clampInt(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function midiToNoteName(midi) {
  const m = clampInt(midi, NaN);
  if (!Number.isFinite(m)) return null;
  const semitone = ((m % 12) + 12) % 12;
  const octave = Math.floor(m / 12) - 1;
  return `${SEMITONE_TO_NAME[semitone]}${octave}`;
}

function getBaseNoteIndex() {
  try {
    const raw = window.localStorage?.getItem("baseNote");
    // kalimba.js stores baseNote as an index into a note array starting from A0.
    return clampInt(raw, 39); // default C4
  } catch {
    return 39;
  }
}

function getBaseNoteMidi() {
  // A0 is MIDI 21 and is index 0 in kalimba.js allNotesSharp.
  return 21 + getBaseNoteIndex();
}

function getBaseOctave() {
  const base = midiToNoteName(getBaseNoteMidi());
  const m = base?.match(/(\d+)$/);
  return m ? clampInt(m[1], 4) : 4;
}

function splitTokenByHyphen(token) {
  // Treat 6-5-6 as three quick notes.
  // Keep empty parts out to avoid weird tokens.
  return token
    .split("-")
    .map((p) => p.trim())
    .filter(Boolean);
}

function parseSustainSuffix(raw) {
  const m = normalizeSymbols(raw).match(/(-+)$/);
  return m ? m[1].length : 0;
}

function stripSustainSuffix(raw) {
  return normalizeSymbols(raw).replace(/(-+)$/, "");
}

function parseNumberPiece(piece) {
  // Supports: 6, 1', 3'', .6, :6, 0 (rest)
  // Sustain: 6-- (adds 2 extra steps)
  const original = String(piece).trim();
  const trimmed = normalizeSymbols(original);
  if (!trimmed) return null;

  const sustain = parseSustainSuffix(trimmed);
  const core = stripSustainSuffix(trimmed);

  if (/^(0|x|_)$/i.test(core)) {
    return { type: "rest", raw: original, len: 1 + sustain };
  }

  const m = core.match(/^([.:]*)([1-7])('+)?$/);
  if (!m) return null;

  const prefix = m[1] || "";
  const degree = clampInt(m[2], NaN);
  const quotes = (m[3] || "").length;

  if (!Number.isFinite(degree) || degree < 1 || degree > 7) return null;

  // '.' means one octave down, ':' means two octaves down (mirrors kalimba.js label logic)
  let octaveShift = 0;
  for (const ch of prefix) {
    if (ch === ".") octaveShift -= 1;
    if (ch === ":") octaveShift -= 2;
  }
  octaveShift += quotes;

  const midi =
    getBaseNoteMidi() + octaveShift * 12 + MAJOR_DEGREE_TO_SEMITONE[degree - 1];
  const noteName = midiToNoteName(midi);
  if (!noteName) return null;

  return { type: "note", raw: original, noteName, len: 1 + sustain };
}

function parseLetterPiece(piece) {
  // Supports: A, G, C', D'', F#4, C#5
  // Sustain: C'-- (adds 2 extra steps)
  const original = String(piece).trim();
  const trimmed = normalizeSymbols(original);
  if (!trimmed) return null;

  const sustain = parseSustainSuffix(trimmed);
  const core = stripSustainSuffix(trimmed);

  if (/^(0|x|_)$/i.test(core)) {
    return { type: "rest", raw: original, len: 1 + sustain };
  }

  const m = core.match(/^([A-Ga-g])([#♯]?)(\d?)([']*)$/);
  if (!m) return null;

  const letter = String(m[1]).toUpperCase();
  const sharp = m[2] ? 1 : 0;
  const explicitOctave = m[3] ? clampInt(m[3], NaN) : null;
  const quotes = (m[4] || "").length;

  const baseOctave =
    explicitOctave !== null && Number.isFinite(explicitOctave)
      ? explicitOctave
      : getBaseOctave();
  const octave = baseOctave + quotes;

  const semitoneBase = LETTER_TO_SEMITONE[letter];
  if (semitoneBase === undefined) return null;

  const midi = 12 * (octave + 1) + semitoneBase + sharp;
  const noteName = midiToNoteName(midi);
  if (!noteName) return null;

  return { type: "note", raw: original, noteName, len: 1 + sustain };
}

function tokenizeLine(line) {
  // Keep ',' and '|' as dedicated tokens (beat/bar separators).
  // Keep '-' because it may represent linked notes (6-5-6) or sustain suffix (6--).
  return normalizeSymbols(line)
    .replace(/[，]/g, ",")
    .replace(/([,|])/g, " $1 ")
    .replace(/[;()\[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

function isQuickHyphenChain(token, parsePiece) {
  const normalized = normalizeSymbols(token);
  if (!normalized.includes("-")) return false;
  // If token ends with '-' it's probably sustain (6--), not quick chain.
  if (/-+$/.test(normalized)) return false;
  const parts = splitTokenByHyphen(normalized);
  if (parts.length <= 1) return false;
  return parts.every((p) => Boolean(parsePiece(p)));
}

function isStandaloneHoldToken(token) {
  return /^-+$/.test(normalizeSymbols(token).trim());
}

export function parseTabContent(content, labelType) {
  const tokens = [];
  const warnings = [];

  const lines = String(content || "").split(/\r?\n/);
  const parsePiece =
    labelType === "Letter" ? parseLetterPiece : parseNumberPiece;

  let notesCount = 0;

  for (const line of lines) {
    const parts = tokenizeLine(line);
    let hasAny = false;

    for (const part of parts) {
      const trimmed = normalizeSymbols(part).trim();

      if (!trimmed) continue;

      if (trimmed === ",") {
        hasAny = true;
        tokens.push({ type: "beat", raw: "," });
        continue;
      }

      if (trimmed === "|") {
        hasAny = true;
        tokens.push({ type: "bar", raw: "|" });
        tokens.push({ type: "newline" });
        continue;
      }

      if (isStandaloneHoldToken(trimmed)) {
        hasAny = true;
        tokens.push({ type: "hold", raw: trimmed, len: trimmed.length });
        continue;
      }

      // Quick chain: 6-5-6 should be treated as 3 notes.
      if (isQuickHyphenChain(trimmed, parsePiece)) {
        const pieces = splitTokenByHyphen(trimmed);
        for (const p of pieces) {
          const parsed = parsePiece(p);
          if (!parsed) continue;
          hasAny = true;
          tokens.push(parsed);
          if (parsed.type === "note") notesCount += 1;
        }
        continue;
      }

      const parsed = parsePiece(trimmed);
      if (parsed) {
        hasAny = true;
        tokens.push(parsed);
        if (parsed.type === "note") notesCount += 1;
      }
    }

    if (hasAny) {
      tokens.push({ type: "newline" });
    }
  }

  if (notesCount === 0) {
    warnings.push(
      "No notes detected. Make sure the tab content uses numbers (1-7) or letters (A-G).",
    );
  }

  return { tokens, warnings };
}

export function tokensToNoteSequence(tokens) {
  // Convert tokens to a list of noteName/null steps for playback.
  // - note: plays once, then adds (len-1) silence steps
  // - rest: adds len silence steps
  // - hold: adds len silence steps
  // - beat: adds 1 silence step (light separation)
  // - bar: adds 2 silence steps (stronger separation)
  // - newline: ignored for playback
  const sequence = [];
  for (const tok of tokens) {
    if (!tok) continue;
    if (tok.type === "newline") {
      // Treat each parsed line as a phrase; add a small pause.
      sequence.push(null, null);
      continue;
    }

    if (tok.type === "beat") {
      sequence.push(null);
      continue;
    }

    if (tok.type === "bar") {
      sequence.push(null, null);
      continue;
    }

    if (tok.type === "hold") {
      const len = Number.isFinite(tok.len) ? tok.len : 1;
      for (let i = 0; i < Math.max(1, len); i += 1) sequence.push(null);
      continue;
    }

    if (tok.type === "rest") {
      const len = Number.isFinite(tok.len) ? tok.len : 1;
      for (let i = 0; i < Math.max(1, len); i += 1) sequence.push(null);
      continue;
    }

    if (tok.type === "note") {
      sequence.push(tok.noteName);
      const len = Number.isFinite(tok.len) ? tok.len : 1;
      for (let i = 1; i < Math.max(1, len); i += 1) sequence.push(null);
    }
  }
  return sequence;
}
