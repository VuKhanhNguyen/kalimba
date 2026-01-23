import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n/useI18n.js";
export function Header() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const readAuthUser = () => {
      try {
        const raw = window.localStorage?.getItem("auth_user");
        if (!raw) return setUsername(null);
        const user = JSON.parse(raw);
        setUsername(user?.username || null);
      } catch (_) {
        setUsername(null);
      }
    };

    readAuthUser();
    window.addEventListener("storage", readAuthUser);
    return () => window.removeEventListener("storage", readAuthUser);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  const handleProfile = (e) => {
    e.preventDefault();
    navigate("/profile");
  };

  const handleSettings = (e) => {
    e.preventDefault();
    navigate("/settings");
  };

  const handleLogout = (e) => {
    e.preventDefault();

    const ok = window.confirm("Bạn có muốn đăng xuất không?");
    if (!ok) return;

    try {
      window.localStorage?.removeItem("access_token");
      window.localStorage?.removeItem("auth_user");
    } catch (_) {
      // ignore storage errors
    }
    window.dispatchEvent(new Event("auth:changed"));
    setUsername(null);
    navigate("/");
  };
  return (
    <header className="main-header">
      <nav className="main-navigation">
        <ul>
          <li>
            <a href="/" className="contrast">
              <strong>{t("title")}</strong>
            </a>
          </li>
        </ul>
        <ul className="nav-links">
          <li>
            <a href="/">{t("header.nav.home")}</a>
          </li>
          <li>
            <a href="/songs">{t("header.nav.songs")}</a>
          </li>
          <li>
            <a href="/instructions">{t("header.nav.instructions")}</a>
          </li>
          {username ? (
            <li role="list">
              <a
                href="#"
                role="button"
                className="outline"
                aria-haspopup="menu"
                onClick={(e) => e.preventDefault()}
              >
                {t("header.hello")} {username}!
              </a>
              <ul role="menu">
                <li>
                  <a href="#" role="menuitem" onClick={handleProfile}>
                    Hồ sơ
                  </a>
                </li>
                <li>
                  <a href="#" role="menuitem" onClick={handleSettings}>
                    Cài đặt
                  </a>
                </li>
                <li>
                  <a href="#" role="menuitem" onClick={handleLogout}>
                    Đăng xuất
                  </a>
                </li>
              </ul>
            </li>
          ) : (
            <li>
              <a
                href="#"
                onClick={handleLogin}
                role="button"
                className="outline"
              >
                {t("header.nav.login")}
              </a>
            </li>
          )}
        </ul>
      </nav>
      {/* Kept description but maybe hide it or style it as a subtitle in a hero section if desired. 
          For now I will comment it out or put it in a separate hero component, 
          but strictly sticking to header replacement, I will assume the title in nav is enough. 
          If the description is important, I can add it below nav but 'menu bar' implies just nav. */}
      {/* <p>{t("description")}</p> */}
    </header>
  );
}
export default Header;
