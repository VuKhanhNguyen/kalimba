import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/auth.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field] && !prev.form) return prev;
      return { ...prev, [field]: undefined, form: undefined };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const nextErrors = {};
    if (!form.usernameOrEmail.trim())
      nextErrors.usernameOrEmail = "Vui lòng nhập username";
    if (!form.password) nextErrors.password = "Vui lòng nhập mật khẩu";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username_or_email: form.usernameOrEmail.trim(),
          password: form.password,
        }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          setErrors({ form: "tên đăng nhập hoặc mật khẩu sai" });
          return;
        }

        if (res.status === 400 && Array.isArray(payload?.details)) {
          const serverErrors = {};
          for (const d of payload.details) {
            const key = Array.isArray(d?.path) ? d.path[0] : undefined;
            if (key === "username_or_email")
              serverErrors.usernameOrEmail = "Giá trị không hợp lệ";
            if (key === "password")
              serverErrors.password = "Giá trị không hợp lệ";
          }
          setErrors(
            Object.keys(serverErrors).length
              ? serverErrors
              : { form: "Đăng nhập thất bại" },
          );
          return;
        }

        setErrors({ form: payload?.message || "Đăng nhập thất bại" });
        return;
      }

      if (payload?.access_token) {
        window.localStorage?.setItem("access_token", payload.access_token);
      }

      if (payload?.user) {
        try {
          window.localStorage?.setItem(
            "auth_user",
            JSON.stringify(payload.user),
          );
        } catch (_) {
          // ignore storage errors
        }
        window.dispatchEvent(new Event("auth:changed"));
      }
      navigate("/");
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
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to continue your musical journey
          </p>
        </header>

        <form className="auth-form" onSubmit={onSubmit}>
          {errors.form ? (
            <small className="form-error" role="alert">
              {errors.form}
            </small>
          ) : null}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="username"
                name="username"
                className="form-input"
                placeholder="Enter your username"
                autoComplete="username"
                required
                value={form.usernameOrEmail}
                onChange={(e) => setField("usernameOrEmail", e.target.value)}
                aria-invalid={errors.usernameOrEmail ? "true" : "false"}
                aria-describedby={
                  errors.usernameOrEmail ? "username-helper" : undefined
                }
              />
            </div>
            {errors.usernameOrEmail ? (
              <small id="username-helper" className="form-error" role="alert">
                {errors.usernameOrEmail}
              </small>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={
                  errors.password ? "password-helper" : undefined
                }
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
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
            {errors.password ? (
              <small id="password-helper" className="form-error" role="alert">
                {errors.password}
              </small>
            ) : null}
          </div>

          <div className="remember-forgot">
            <label className="remember-me">
              <input type="checkbox" name="remember" />
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className="forgot-link">
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">
          <span>Or continue with</span>
        </div>

        <div className="social-login">
          <button
            type="button"
            className="social-btn"
            aria-label="Login with Google"
          >
            <svg viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </button>
          <button
            type="button"
            className="social-btn"
            aria-label="Login with GitHub"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </button>
          <button
            type="button"
            className="social-btn"
            aria-label="Login with Facebook"
          >
            <svg viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
        </div>

        <footer className="auth-footer">
          <p>
            Don't have an account?
            <a
              href="/register"
              onClick={(e) => {
                e.preventDefault();
                navigate("/register");
              }}
              className="auth-link"
            >
              Sign Up
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Login;
