export function isLikelyNotationLine(line) {
  const raw = String(line ?? "");
  const trimmed = raw.trim();
  if (!trimmed) return false;

  // If the line contains characters outside typical tab notation characters,
  // it's likely a lyric line.
  // Allowed: digits (0-7), note letters, octave marks, bar/beat separators, spacing.
  const nonNotation = trimmed.replace(/[0-7A-Ga-g'.,|\-_:xX#♯\s]/g, "");
  return nonNotation.length === 0;
}

export function buildLyricNotationBlocks(content) {
  const lines = String(content || "")
    .split(/\r?\n/)
    .map((l) => String(l).replace(/\s+$/g, ""));

  const blocks = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!String(line).trim()) continue;

    const currentIsNotation = isLikelyNotationLine(line);
    if (!currentIsNotation) {
      const next = lines[i + 1];
      if (next && isLikelyNotationLine(next)) {
        blocks.push({ lyric: line, notes: next });
        i += 1;
        continue;
      }
      blocks.push({ lyric: line, notes: "" });
      continue;
    }

    blocks.push({ lyric: "", notes: line });
  }

  return blocks;
}

export function extractLyricsText(content) {
  const blocks = buildLyricNotationBlocks(content);
  const lyrics = blocks
    .map((b) => String(b.lyric || "").trim())
    .filter(Boolean);
  return lyrics.join("\n");
}

export function toContentString(maybeContent) {
  return typeof maybeContent === "string"
    ? maybeContent
    : JSON.stringify(maybeContent ?? "", null, 2);
}
