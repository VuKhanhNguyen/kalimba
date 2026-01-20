import React from "react";
import { useLocation } from "react-router-dom";
import PageLoaderOverlay from "./PageLoaderOverlay.jsx";

export default function RouteChangeLoader({ minVisibleMs = 450 }) {
  const location = useLocation();
  const isFirstRenderRef = React.useRef(true);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    let cancelled = false;
    const startedAt = performance.now();

    setVisible(true);

    const hideTimer = window.setTimeout(() => {
      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, minVisibleMs - elapsed);

      window.setTimeout(() => {
        if (!cancelled) setVisible(false);
      }, remaining);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(hideTimer);
    };
  }, [location.pathname, location.search, location.hash, minVisibleMs]);

  if (!visible) return null;
  return <PageLoaderOverlay />;
}
