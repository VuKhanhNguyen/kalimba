import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../commons/header.jsx";
import Footer from "../commons/footer.jsx";
import Keyboard from "../play/keyboard.jsx";
import Options from "../play/options.jsx";
import HomeSongsPanel from "../songs/HomeSongsPanel.jsx";

export function PlayKalimbaPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (variant, message) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }

    setToast({ variant, message });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Ensure the legacy jQuery kalimba UI re-initializes after SPA navigation.
    window.dispatchEvent(new Event("kalimba:mount"));
  }, []);

  useEffect(() => {
    const toastFromNav = location?.state?.toast;
    if (toastFromNav?.message) {
      showToast(toastFromNav?.variant || "success", toastFromNav.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location?.state, location.pathname, navigate]);

  return (
    <React.Fragment>
      <main className="container" data-theme="generated">
        {toast ? (
          <div
            className={`app-toast app-toast--${toast.variant}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="app-toast__icon" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M7 12.5L10.2 15.7L17 8.9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="app-toast__message">{toast.message}</span>
            <button
              type="button"
              className="app-toast__close"
              aria-label="Đóng thông báo"
              onClick={() => {
                if (toastTimerRef.current) {
                  clearTimeout(toastTimerRef.current);
                  toastTimerRef.current = null;
                }
                setToast(null);
              }}
            >
              ×
            </button>
          </div>
        ) : null}
        <Header />
        <HomeSongsPanel />
        <Keyboard />
        <Options />
        <Footer />
      </main>
    </React.Fragment>
  );
}
export default PlayKalimbaPage;
