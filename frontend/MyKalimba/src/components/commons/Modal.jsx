import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  title,
  onClose,
  children,
  maxWidth = 760,
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        // close only when clicking the overlay, not the dialog itself
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.38)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth,
          maxHeight: "calc(100vh - 2rem)",
          overflow: "auto",
          borderRadius: "var(--radius-md)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem 1rem",
            borderBottom: "1px solid var(--muted-border-color)",
          }}
        >
          <strong style={{ margin: 0 }}>{title}</strong>
          <button
            type="button"
            className="secondary"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: "auto",
              padding: "0.25rem 0.6rem",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "1rem" }}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
