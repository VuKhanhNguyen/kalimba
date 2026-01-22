import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function parseJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
    return JSON.parse(json);
  } catch (_) {
    return null;
  }
}

function clearAuthStorage() {
  try {
    window.localStorage?.removeItem("access_token");
    window.localStorage?.removeItem("auth_user");
  } catch (_) {
    // ignore
  }
  window.dispatchEvent(new Event("auth:changed"));
}

export default function AuthSessionWatcher() {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    const setup = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      let token = "";
      try {
        token = window.localStorage?.getItem("access_token") || "";
      } catch (_) {
        token = "";
      }

      if (!token) return;

      const payload = parseJwtPayload(token);
      const expSeconds = payload?.exp;
      if (!expSeconds || typeof expSeconds !== "number") return;

      const expMs = expSeconds * 1000;
      const now = Date.now();

      if (expMs <= now) {
        alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        clearAuthStorage();
        navigate("/login");
        return;
      }

      timerRef.current = setTimeout(() => {
        alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        clearAuthStorage();
        navigate("/login");
      }, expMs - now);
    };

    setup();

    // Update when auth changes in this tab, or from other tabs
    window.addEventListener("auth:changed", setup);
    window.addEventListener("storage", setup);

    return () => {
      window.removeEventListener("auth:changed", setup);
      window.removeEventListener("storage", setup);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [navigate]);

  return null;
}
