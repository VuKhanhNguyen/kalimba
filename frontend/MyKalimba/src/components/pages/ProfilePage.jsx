import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { I18nContext } from "../../i18n/I18nProvider";
import Header from "../commons/header.jsx";
import Footer from "../commons/footer.jsx";

export function ProfilePage() {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const { t } = useContext(I18nContext);

  const accessToken = useMemo(() => {
    try {
      return window.localStorage?.getItem("access_token") || "";
    } catch (_) {
      return "";
    }
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [errors, setErrors] = useState({});

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
  });
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
    setServerMessage("");
  };

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

  const syncAuthUserToLocalStorage = (nextUser) => {
    try {
      const raw = window.localStorage?.getItem("auth_user");
      const existing = raw ? JSON.parse(raw) : {};
      window.localStorage?.setItem(
        "auth_user",
        JSON.stringify({
          ...existing,
          ...nextUser,
        }),
      );
    } catch (_) {
      // ignore
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setServerMessage("");
      setErrors({});

      if (!accessToken) {
        if (isMounted) {
          setIsLoading(false);
          setUser(null);
        }
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (isMounted) {
            setServerMessage(payload?.message || t("profile.loadError"));
            setUser(null);
          }
          return;
        }

        const u = payload?.user;
        if (isMounted) {
          setUser(u);
          setForm({
            full_name: u?.full_name || "",
            email: u?.email || "",
            phone_number: u?.phone_number || "",
          });
          setAvatarPreviewUrl(u?.avatar_url || "");
          syncAuthUserToLocalStorage(u);
        }
      } catch (err) {
        if (isMounted) {
          setServerMessage("Không thể kết nối máy chủ");
          setUser(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL, accessToken]);

  const mapServerErrors = (payload) => {
    const next = {};
    if (Array.isArray(payload?.details)) {
      for (const d of payload.details) {
        const key = Array.isArray(d?.path) ? d.path[0] : undefined;
        if (key === "email") next.email = t("profile.emailExists");
        if (key === "phone_number")
          next.phone_number = t("profile.phoneExists");
        if (key === "full_name") next.full_name = t("profile.invalidName");
      }
    }
    if (Object.keys(next).length === 0) {
      next.form = payload?.message || t("profile.updateFailed");
    }
    return next;
  };

  const onSaveProfile = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    if (!accessToken) {
      setServerMessage("Bạn chưa đăng nhập.");
      return;
    }

    setIsSaving(true);
    setServerMessage("");
    setErrors({});
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          phone_number: form.phone_number || null,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(mapServerErrors(payload));
        return;
      }

      const nextUser = payload?.user;
      setUser(nextUser);
      syncAuthUserToLocalStorage(nextUser);
      setServerMessage("");
      showToast("success", t("profile.updateSuccess"));
    } catch (err) {
      setServerMessage(t("profile.connectError"));
    } finally {
      setIsSaving(false);
    }
  };

  const onPickAvatar = (e) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    setServerMessage("");
    setErrors((prev) => ({ ...prev, avatar: undefined, form: undefined }));

    if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    if (file) {
      setAvatarPreviewUrl(URL.createObjectURL(file));
    } else {
      setAvatarPreviewUrl(user?.avatar_url || "");
    }
  };

  const onUploadAvatar = async (e) => {
    e.preventDefault();
    if (isUploading) return;
    if (!accessToken) {
      setServerMessage(t("profile.notLoggedIn"));
      return;
    }
    if (!avatarFile) {
      setErrors((prev) => ({ ...prev, avatar: t("profile.selectAvatar") }));
      return;
    }

    setIsUploading(true);
    setServerMessage("");
    setErrors({});
    try {
      const fd = new FormData();
      fd.append("avatar", avatarFile);

      const res = await fetch(`${API_BASE_URL}/api/users/me/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: fd,
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ avatar: payload?.message || t("profile.uploadFailed") });
        return;
      }

      const nextUser = payload?.user;
      setUser(nextUser);
      setAvatarFile(null);
      setAvatarPreviewUrl(nextUser?.avatar_url || "");
      syncAuthUserToLocalStorage(nextUser);
      setServerMessage("");
      showToast("success", t("profile.avatarUpdated"));
    } catch (err) {
      setErrors({ avatar: t("profile.connectError") });
    } finally {
      setIsUploading(false);
    }
  };

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
              onClick={() => setToast(null)}
            >
              ×
            </button>
          </div>
        ) : null}
        <Header />
        <article>
          <header>
            <h2>{t("profile.title")}</h2>
          </header>
          {!accessToken ? (
            <p>{t("profile.notLoggedIn")}</p>
          ) : isLoading ? (
            <p>{t("profile.loading")}</p>
          ) : !user ? (
            <p>{serverMessage || t("profile.loadError")}</p>
          ) : (
            <>
              {serverMessage ? (
                <small className="form-error" role="status">
                  {serverMessage}
                </small>
              ) : null}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr",
                  gap: "1.25rem",
                  alignItems: "start",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <img
                    src={avatarPreviewUrl || "https://placehold.co/140x140"}
                    alt="Avatar"
                    width={140}
                    height={140}
                    style={{
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  />
                  <form
                    onSubmit={onUploadAvatar}
                    style={{ marginTop: "1rem", textAlign: "left" }}
                  >
                    <input
                      id="avatarFile"
                      type="file"
                      accept="image/*"
                      onChange={onPickAvatar}
                      aria-invalid={errors.avatar ? "true" : "false"}
                      style={{
                        position: "absolute",
                        width: 1,
                        height: 1,
                        padding: 0,
                        margin: -1,
                        overflow: "hidden",
                        clip: "rect(0, 0, 0, 0)",
                        whiteSpace: "nowrap",
                        border: 0,
                      }}
                    />
                    <label
                      htmlFor="avatarFile"
                      role="button"
                      className="outline"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "140px",
                        margin: 0,
                      }}
                    >
                      {t("profile.choosePhoto")}
                    </label>
                    <small
                      style={{
                        display: "block",
                        marginTop: ".35rem",
                        color: "var(--muted-color)",
                      }}
                    >
                      {avatarFile?.name || t("profile.noPhotoSelected")}
                    </small>
                    {errors.avatar ? (
                      <small className="form-error" role="alert">
                        {errors.avatar}
                      </small>
                    ) : null}
                    <button
                      type="submit"
                      className="outline"
                      disabled={isUploading}
                      style={{ marginTop: ".5rem" }}
                    >
                      {isUploading
                        ? t("profile.uploading")
                        : t("profile.uploadPhoto")}
                    </button>
                  </form>
                </div>

                <form onSubmit={onSaveProfile}>
                  {errors.form ? (
                    <small className="form-error" role="alert">
                      {errors.form}
                    </small>
                  ) : null}

                  <label>
                    {t("profile.username")}
                    <input type="text" value={user.username || ""} disabled />
                  </label>

                  <label>
                    {t("profile.fullName")}
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(e) => setField("full_name", e.target.value)}
                      aria-invalid={errors.full_name ? "true" : "false"}
                    />
                    {errors.full_name ? (
                      <small className="form-error" role="alert">
                        {errors.full_name}
                      </small>
                    ) : null}
                  </label>

                  <label>
                    {t("profile.email")}
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      aria-invalid={errors.email ? "true" : "false"}
                    />
                    {errors.email ? (
                      <small className="form-error" role="alert">
                        {errors.email}
                      </small>
                    ) : null}
                  </label>

                  <label>
                    {t("profile.phoneNumber")}
                    <input
                      type="tel"
                      value={form.phone_number}
                      onChange={(e) => setField("phone_number", e.target.value)}
                      aria-invalid={errors.phone_number ? "true" : "false"}
                      placeholder="e.g. 0912345678"
                    />
                    {errors.phone_number ? (
                      <small className="form-error" role="alert">
                        {errors.phone_number}
                      </small>
                    ) : null}
                  </label>

                  <button type="submit" disabled={isSaving}>
                    {isSaving ? t("profile.saving") : t("profile.saveChanges")}
                  </button>
                </form>
              </div>
            </>
          )}
        </article>
        <Footer />
      </main>
    </React.Fragment>
  );
}

export default ProfilePage;
