import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function getParamFromHashOrQuery(location) {
  // Supports both: /oauth/callback?token=...&provider=...
  // and: /oauth/callback#token=...&provider=...
  const search = location?.search || "";
  const hash = location?.hash || "";

  const queryParams = new URLSearchParams(search.startsWith("?") ? search : "");
  const hashParams = new URLSearchParams(
    hash.startsWith("#") ? hash.slice(1) : "",
  );

  const token = queryParams.get("token") || hashParams.get("token") || "";
  const provider =
    queryParams.get("provider") || hashParams.get("provider") || "";
  const oauthError =
    queryParams.get("oauth_error") || hashParams.get("oauth_error") || "";

  return { token, provider, oauthError };
}

async function fetchMe(token) {
  const res = await fetch(`${API_BASE_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.message || "Không thể lấy thông tin người dùng");
  }
  return payload?.user;
}

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState("Đang xử lý đăng nhập...");

  const params = useMemo(() => getParamFromHashOrQuery(location), [location]);

  useEffect(() => {
    const run = async () => {
      if (params.oauthError) {
        setMessage("Đăng nhập thất bại. Vui lòng thử lại.");
        navigate(
          `/login?oauth_error=${encodeURIComponent(params.oauthError)}&provider=${encodeURIComponent(params.provider || "")}`,
        );
        return;
      }

      if (!params.token) {
        setMessage("Thiếu token đăng nhập.");
        navigate("/login");
        return;
      }

      try {
        window.localStorage?.setItem("access_token", params.token);

        const me = await fetchMe(params.token);
        if (me) {
          try {
            window.localStorage?.setItem("auth_user", JSON.stringify(me));
          } catch (_) {
            // ignore
          }
        }

        window.dispatchEvent(new Event("auth:changed"));

        navigate("/", {
          state: {
            toast: {
              variant: "success",
              message: `Đăng nhập ${params.provider || "OAuth"} thành công`,
            },
          },
        });
      } catch (err) {
        setMessage(err?.message || "Đăng nhập thất bại");
        try {
          window.localStorage?.removeItem("access_token");
        } catch (_) {
          // ignore
        }
        window.dispatchEvent(new Event("auth:changed"));
        navigate("/login");
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.token, params.provider, params.oauthError, navigate]);

  return (
    <main style={{ padding: 24 }}>
      <p aria-busy="true">{message}</p>
    </main>
  );
}
