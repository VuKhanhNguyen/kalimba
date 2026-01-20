import React from "react";

export default function PageLoaderOverlay({ label = "Loading" }) {
  return (
    <div
      className="page-loader-overlay"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="page-loader-spinner" />
    </div>
  );
}
