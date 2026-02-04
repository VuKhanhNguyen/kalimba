import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/auth.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const USERNAME_REGEX = /^[A-Za-z0-9_]+$/;
const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field] && !prev.form) return prev;
      return { ...prev, [field]: undefined, form: undefined };
    });
  };

  const validate = () => {
    const nextErrors = {};

    const username = form.username.trim();
    if (!username) nextErrors.username = "Vui lòng nhập username";
    else if (username.length < 3)
      nextErrors.username = "Username tối thiểu 3 ký tự";
    else if (username.length > 50)
      nextErrors.username = "Username tối đa 50 ký tự";
    else if (!USERNAME_REGEX.test(username))
      nextErrors.username = "Username không được chứa ký tự đặc biệt";

    const fullName = form.fullName.trim();
    if (!fullName) nextErrors.fullName = "Vui lòng nhập họ tên";

    const email = form.email.trim();
    if (!email) nextErrors.email = "Vui lòng nhập email";

    const password = form.password;
    if (!password) nextErrors.password = "Vui lòng nhập mật khẩu";
    else if (password.length < 8)
      nextErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";

    const confirmPassword = form.confirmPassword;
    if (!confirmPassword)
      nextErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    else if (confirmPassword !== password)
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp";

    const phone = form.phoneNumber.trim();
    if (phone && !PHONE_REGEX.test(phone)) {
      nextErrors.phoneNumber = "Số điện thoại không hợp lệ";
    }

    return nextErrors;
  };

  const mapServerErrors = (payload) => {
    const nextErrors = {};
    const details = payload?.details;
    if (Array.isArray(details)) {
      for (const d of details) {
        const path0 = Array.isArray(d?.path) ? d.path[0] : undefined;
        if (path0 === "username")
          nextErrors.username = "Username không hợp lệ hoặc đã tồn tại";
        else if (path0 === "email") nextErrors.email = "Email đã tồn tại";
        else if (path0 === "phone_number")
          nextErrors.phoneNumber = "Số điện thoại đã tồn tại";
      }
    }
    if (Object.keys(nextErrors).length === 0) {
      nextErrors.form = payload?.message || "Đăng ký thất bại";
    }
    return nextErrors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          email: form.email.trim(),
          full_name: form.fullName.trim(),
          phone_number: form.phoneNumber.trim() || null,
        }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors(mapServerErrors(payload));
        return;
      }

      navigate("/login");
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Join our community of Kalimba enthusiasts
          </p>
        </header>

        <form className="auth-form" onSubmit={onSubmit}>
          {errors.form ? (
            <small className="form-error" role="alert">
              {errors.form}
            </small>
          ) : null}

          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Full Name
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="form-input"
                placeholder="John Doe"
                autoComplete="name"
                required
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                aria-invalid={errors.fullName ? "true" : "false"}
                aria-describedby={
                  errors.fullName ? "fullName-helper" : undefined
                }
              />
            </div>
            {errors.fullName ? (
              <small id="fullName-helper" className="form-error" role="alert">
                {errors.fullName}
              </small>
            ) : null}
          </div>

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
                placeholder="Choose a username"
                autoComplete="username"
                required
                value={form.username}
                onChange={(e) => setField("username", e.target.value)}
                aria-invalid={errors.username ? "true" : "false"}
                aria-describedby={
                  errors.username ? "username-helper" : undefined
                }
              />
            </div>
            {errors.username ? (
              <small id="username-helper" className="form-error" role="alert">
                {errors.username}
              </small>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="john@example.com"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-helper" : undefined}
              />
            </div>
            {errors.email ? (
              <small id="email-helper" className="form-error" role="alert">
                {errors.email}
              </small>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label">
              Phone Number
            </label>
            <div className="input-wrapper">
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                className="form-input"
                placeholder="e.g. 0912345678"
                autoComplete="tel"
                value={form.phoneNumber}
                onChange={(e) => setField("phoneNumber", e.target.value)}
                aria-invalid={errors.phoneNumber ? "true" : "false"}
                aria-describedby={
                  errors.phoneNumber ? "phone-helper" : undefined
                }
              />
            </div>
            {errors.phoneNumber ? (
              <small id="phone-helper" className="form-error" role="alert">
                {errors.phoneNumber}
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
                placeholder="Create a password"
                autoComplete="new-password"
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
                onClick={() => setShowPassword(!showPassword)}
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

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={(e) => setField("confirmPassword", e.target.value)}
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                aria-describedby={
                  errors.confirmPassword ? "confirm-helper" : undefined
                }
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              <small id="confirm-helper" className="form-error" role="alert">
                {errors.confirmPassword}
              </small>
            ) : null}
          </div>

          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <footer className="auth-footer">
          <p>
            Already have an account?
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              className="auth-link"
            >
              Sign In
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Register;
