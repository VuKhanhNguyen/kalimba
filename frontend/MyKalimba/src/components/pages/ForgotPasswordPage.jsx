import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/auth.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function formatRemaining(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [step, setStep] = useState("request"); // request | reset
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [expiresAt, setExpiresAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const remainingMs = useMemo(() => {
    if (!expiresAt) return 0;
    return Math.max(0, expiresAt - now);
  }, [expiresAt, now]);

  useEffect(() => {
    if (!expiresAt) return;
    const t = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(t);
  }, [expiresAt]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field] && !prev.form) return prev;
      return { ...prev, [field]: undefined, form: undefined };
    });
    if (notice) setNotice("");
  };

  const sendOtp = async () => {
    if (isSubmitting) return;

    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Vui lòng nhập email";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim() }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setNotice("");
        setErrors({ form: payload?.message || "Không thể gửi OTP" });
        return;
      }

      // Start 10-minute countdown on UI.
      setExpiresAt(Date.now() + 10 * 60 * 1000);
      setNow(Date.now());
      setStep("reset");
      setErrors({});
      setNotice(
        "Đã gửi mã OTP về email. Vui lòng kiểm tra hộp thư (kể cả Spam).",
      );
    } catch (err) {
      setNotice("");
      setErrors({ form: "Không thể kết nối máy chủ" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestOtp = async (e) => {
    e.preventDefault();
    await sendOtp();
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Vui lòng nhập email";
    if (!form.otp.trim()) nextErrors.otp = "Vui lòng nhập OTP";
    if (!/^[0-9]{6}$/.test(form.otp.trim()))
      nextErrors.otp = "OTP gồm 6 chữ số";
    if (!form.newPassword)
      nextErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    if (form.newPassword && form.newPassword.length < 8)
      nextErrors.newPassword = "Mật khẩu tối thiểu 8 ký tự";
    if (form.confirmPassword !== form.newPassword)
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    if (expiresAt && Date.now() > expiresAt)
      nextErrors.otp = "OTP đã hết hạn. Vui lòng gửi lại mã.";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          otp: form.otp.trim(),
          new_password: form.newPassword,
        }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors({ form: payload?.message || "Đổi mật khẩu thất bại" });
        return;
      }

      navigate("/login", {
        state: {
          toast: { variant: "success", message: "Đổi mật khẩu thành công" },
        },
      });
    } catch (err) {
      setErrors({ form: "Không thể kết nối máy chủ" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-wrapper">
      <div className="auth-container">
        <header className="auth-header">
          <h1 className="auth-title">Quên mật khẩu</h1>
          <p className="auth-subtitle">
            Nhập email để nhận mã OTP (hiệu lực 10 phút)
          </p>
        </header>

        <form
          className="auth-form"
          onSubmit={step === "request" ? requestOtp : resetPassword}
        >
          {notice ? (
            <small className="form-hint" role="status">
              {notice}
            </small>
          ) : null}
          {errors.form ? (
            <small className="form-error" role="alert">
              {errors.form}
            </small>
          ) : null}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="you@gmail.com"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                aria-invalid={errors.email ? "true" : "false"}
              />
            </div>
            {errors.email ? (
              <small className="form-error" role="alert">
                {errors.email}
              </small>
            ) : null}
          </div>

          {step === "reset" ? (
            <>
              <div className="form-group">
                <label htmlFor="otp" className="form-label">
                  OTP
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    id="otp"
                    name="otp"
                    className="form-input"
                    placeholder="Nhập mã 6 số"
                    value={form.otp}
                    onChange={(e) =>
                      setField("otp", e.target.value.replace(/[^0-9]/g, ""))
                    }
                    aria-invalid={errors.otp ? "true" : "false"}
                    maxLength={6}
                    required
                  />
                </div>
                {errors.otp ? (
                  <small className="form-error" role="alert">
                    {errors.otp}
                  </small>
                ) : null}
                {expiresAt ? (
                  <small className="form-hint">
                    OTP hết hạn sau: <b>{formatRemaining(remainingMs)}</b>
                  </small>
                ) : null}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  Mật khẩu mới
                </label>
                <div className="input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    className="form-input"
                    placeholder="Tối thiểu 8 ký tự"
                    value={form.newPassword}
                    onChange={(e) => setField("newPassword", e.target.value)}
                    aria-invalid={errors.newPassword ? "true" : "false"}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword((v) => !v)}
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.newPassword ? (
                  <small className="form-error" role="alert">
                    {errors.newPassword}
                  </small>
                ) : null}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Xác nhận mật khẩu
                </label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-input"
                    placeholder="Nhập lại mật khẩu"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setField("confirmPassword", e.target.value)
                    }
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword ? (
                  <small className="form-error" role="alert">
                    {errors.confirmPassword}
                  </small>
                ) : null}
              </div>

              <div
                className="remember-forgot"
                style={{ justifyContent: "end" }}
              >
                <button
                  type="button"
                  className="link-button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setErrors({});
                    setNotice("");
                    sendOtp();
                  }}
                >
                  Gửi lại OTP
                </button>
              </div>
            </>
          ) : null}

          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {step === "request"
              ? isSubmitting
                ? "Đang gửi..."
                : "Gửi OTP"
              : isSubmitting
                ? "Đang đổi mật khẩu..."
                : "Đổi mật khẩu"}
          </button>
        </form>

        <div className="auth-divider">
          <span>Hoặc</span>
        </div>

        <div style={{ textAlign: "center" }}>
          <a href="/login" className="forgot-link">
            Quay lại đăng nhập
          </a>
        </div>
      </div>
    </main>
  );
}
