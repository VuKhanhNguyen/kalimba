import React, { useMemo } from "react";
import { buildLyricNotationBlocks } from "../../utils/tabLyricLayout";

export default function TabLyricNotationView({
  content,
  maxBlocks,
  compact = false,
  style,
}) {
  const blocks = useMemo(() => buildLyricNotationBlocks(content), [content]);

  const displayBlocks = useMemo(() => {
    const nonEmpty = blocks.filter((b) => Boolean(b.lyric) || Boolean(b.notes));
    if (typeof maxBlocks === "number") return nonEmpty.slice(0, maxBlocks);
    return nonEmpty;
  }, [blocks, maxBlocks]);

  const lyricStyle = {
    textAlign: "center",
    fontSize: compact ? "0.9rem" : "1rem",
    lineHeight: compact ? 1.4 : 1.5,
    marginBottom: "0.25rem",
    whiteSpace: "pre-wrap",
  };

  const notesStyle = {
    textAlign: "center",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    fontWeight: 700,
    fontSize: compact ? "0.95rem" : "1.05rem",
    lineHeight: compact ? 1.5 : 1.6,
    color: "#ff7a00",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  return (
    <div
      style={{
        padding: compact ? "0.5rem 0.5rem" : "0.75rem 0.5rem",
        border: "1px solid var(--muted-border-color)",
        borderRadius: "var(--border-radius)",
        background: "var(--card-background-color)",
        ...style,
      }}
    >
      {displayBlocks.map((b, idx) => (
        <div
          key={`blk-${idx}`}
          style={{ marginBottom: compact ? "0.6rem" : "0.85rem" }}
        >
          {b.lyric ? (
            <div
              style={{
                ...lyricStyle,
                marginBottom: b.notes ? (compact ? "0.25rem" : "0.35rem") : 0,
              }}
            >
              {b.lyric}
            </div>
          ) : null}
          {b.notes ? <div style={notesStyle}>{b.notes}</div> : null}
        </div>
      ))}
    </div>
  );
}
