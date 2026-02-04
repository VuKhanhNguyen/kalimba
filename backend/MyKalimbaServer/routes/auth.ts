import express, { type CookieOptions } from "express";
import crypto from "node:crypto";
import { Op } from "sequelize";

import models from "../models";
import * as security from "../core/security";
import config from "../core/config";
import * as mailer from "../core/mailer";
import * as http from "../core/http";
import { validateBody } from "../schemas/validate";
import * as authSchemas from "../schemas/auth.schema";

const router = express.Router();

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 8;

function normalizeEmail(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function generateOtpCode() {
  // 6 digits, zero-padded
  const n = crypto.randomBytes(4).readUInt32BE(0) % 1000000;
  return String(n).padStart(6, "0");
}

function otpHashFor(otp: string, userId: unknown, _expiresAt: Date) {
  const secret =
    (config && (config as any).auth && (config as any).auth.jwtSecret) || "";
  // NOTE: Do not include Date fields in the hash.
  // MySQL DATETIME + Sequelize timezone handling can cause millisecond differences
  // between the JS Date used at creation time and the Date read back from DB,
  // which would make the same OTP fail verification.
  const raw = String(otp) + ":" + String(userId) + ":" + secret;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function getClientIp(req: any) {
  const xf = req.headers && req.headers["x-forwarded-for"];
  if (xf) return String(xf).split(",")[0].trim();
  return req.ip || null;
}

function getBackendBaseUrl(req: any) {
  // Prefer an explicitly configured public URL.
  const base = process.env.BACKEND_BASE_URL;
  if (base) return String(base).replace(/\/$/, "");

  // Render provides a stable public URL for the service.
  // Using it avoids issues where req.protocol becomes 'http' behind the proxy.
  const renderUrl = process.env.RENDER_EXTERNAL_URL;
  if (renderUrl) return String(renderUrl).replace(/\/$/, "");

  return req.protocol + "://" + req.get("host");
}

function getFrontendBaseUrl() {
  const base = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
  return String(base).replace(/\/$/, "");
}

function getOauthRedirectUri(req: any, provider: string) {
  const base = getBackendBaseUrl(req);
  const url = new URL(base + "/api/auth/" + provider + "/callback");

  // ngrok free domains may show a browser interstitial ("You are about to visit...")
  // that breaks OAuth callbacks. Adding this query parameter bypasses it.
  if (/ngrok/i.test(base)) {
    url.searchParams.set("ngrok-skip-browser-warning", "true");
  }

  return url.toString();
}

function getHostFromUrl(url: unknown) {
  try {
    return new URL(String(url)).host;
  } catch {
    return "";
  }
}

function maybeRedirectOauthStartToPublicBase(
  req: any,
  res: any,
  provider: string,
) {
  const publicBase = process.env.BACKEND_BASE_URL;
  if (!publicBase) return false;

  const publicHost = getHostFromUrl(publicBase);
  const reqHost = req.get("host");
  if (!publicHost || !reqHost) return false;

  // If user hits http://localhost:3000/api/auth/github but BACKEND_BASE_URL is ngrok,
  // the state cookie would be set on localhost, while callback lands on ngrok -> invalid_state.
  // Redirect the *start* step to BACKEND_BASE_URL so cookies + callback share the same domain.
  if (publicHost !== reqHost) {
    const startUrl = new URL(
      String(publicBase).replace(/\/$/, "") + "/api/auth/" + provider,
    );

    if (/ngrok/i.test(publicBase)) {
      startUrl.searchParams.set("ngrok-skip-browser-warning", "true");
    }

    res.redirect(startUrl.toString());
    return true;
  }

  return false;
}

function oauthCookieOptions(req: any): CookieOptions {
  // Important: base this on the *actual* request protocol.
  // If BACKEND_BASE_URL is https (ngrok) but the dev server is accessed via http://localhost,
  // setting secure=true would prevent the browser from storing the state cookie -> invalid_state.
  const xfProto = req.headers["x-forwarded-proto"];
  const isHttps =
    Boolean(req.secure) || String(xfProto || "").toLowerCase() === "https";
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/api/auth/",
    maxAge: 10 * 60 * 1000,
  };
}

function sanitizeUsername(raw: unknown) {
  let s = String(raw || "")
    .trim()
    .replace(/[^A-Za-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!s) s = "user";
  if (s.length > 50) s = s.slice(0, 50);
  return s;
}

async function generateUniqueUsername(base: unknown) {
  const root = sanitizeUsername(base);
  let candidate = root;
  for (let i = 0; i < 20; i++) {
    // eslint-disable-next-line no-await-in-loop
    const existing = await models.User.findOne({
      where: { username: candidate },
    });
    if (!existing) return candidate;

    const suffix = String(Math.floor(1000 + Math.random() * 9000));
    candidate = root;
    if (candidate.length + 1 + suffix.length > 50) {
      candidate = candidate.slice(0, 50 - 1 - suffix.length);
    }
    candidate = candidate + "_" + suffix;
  }

  // last resort
  return "user_" + crypto.randomBytes(4).toString("hex");
}

function redirectToFrontend(
  res: any,
  path: string,
  params?: Record<string, string>,
) {
  const base = getFrontendBaseUrl();
  const qs = new URLSearchParams(params || {}).toString();
  const url = base + path + (qs ? "?" + qs : "");
  return res.redirect(url);
}

async function findOrCreateOauthUser(profile: any) {
  // profile: { email, name, avatarUrl, suggestedUsername }
  if (!profile || !profile.email) {
    const err: any = new Error("Missing email from OAuth provider");
    err.status = 400;
    throw err;
  }

  const email = String(profile.email).trim().toLowerCase();
  let user = await models.User.findOne({ where: { email } });

  if (!user) {
    const username = await generateUniqueUsername(
      profile.suggestedUsername || email.split("@")[0],
    );
    let fullName = String(profile.name || username).trim();
    if (!fullName) fullName = username;
    const randomPassword = crypto.randomBytes(24).toString("hex");
    const passwordHash = await security.hashPassword(randomPassword);

    user = await models.User.create({
      username,
      passwordHash,
      email,
      fullName,
      phoneNumber: null,
      avatarUrl: profile.avatarUrl || null,
      role: "user",
      status: "active",
      lastLoginAt: new Date(),
    });
  } else {
    user.lastLoginAt = new Date();
    if (!user.avatarUrl && profile.avatarUrl)
      user.avatarUrl = profile.avatarUrl;
    if ((!user.fullName || user.fullName === user.username) && profile.name) {
      user.fullName = String(profile.name).trim() || user.fullName;
    }
    await user.save();
  }

  return user;
}

// --- Credentials auth ---

router.post(
  "/register",
  validateBody(authSchemas.registerSchema),
  async function (req: any, res, next) {
    try {
      const orConditions: any[] = [
        { username: req.body.username },
        { email: req.body.email },
      ];
      if (req.body.phone_number) {
        orConditions.push({ phoneNumber: req.body.phone_number });
      }

      const existing = await models.User.findOne({
        where: {
          [Op.or]: orConditions,
        },
      });

      if (existing) {
        const details: any[] = [];
        if (existing.username === req.body.username) {
          details.push({
            message: "Username already exists",
            path: ["username"],
          });
        }
        if (existing.email === req.body.email) {
          details.push({ message: "Email already exists", path: ["email"] });
        }
        if (
          req.body.phone_number &&
          existing.phoneNumber &&
          existing.phoneNumber === req.body.phone_number
        ) {
          details.push({
            message: "Phone number already exists",
            path: ["phone_number"],
          });
        }

        if (details.length === 0) {
          details.push({ message: "Duplicate value", path: [] });
        }

        return res.status(409).json({ message: "Duplicate value", details });
      }

      const passwordHash = await security.hashPassword(req.body.password);
      const user = await models.User.create({
        username: req.body.username,
        passwordHash,
        email: req.body.email,
        fullName: req.body.full_name,
        phoneNumber: req.body.phone_number || null,
        avatarUrl: req.body.avatar_url || null,
        role: "user",
        status: "active",
      });

      return res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.fullName,
        phone_number: user.phoneNumber,
        role: user.role,
        avatar_url: user.avatarUrl,
        status: user.status,
        created_at: user.created_at,
      });
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  "/login",
  validateBody(authSchemas.loginSchema),
  async function (req: any, res, next) {
    try {
      const identifier = req.body.username_or_email;
      const user = await models.User.findOne({
        where: {
          [Op.or]: [{ username: identifier }, { email: identifier }],
        },
      });

      if (!user)
        return res
          .status(401)
          .json({ message: "tên đăng nhập hoặc mật khẩu sai" });
      if (user.status !== "active")
        return res.status(403).json({ message: "User is not active" });

      const ok = await security.comparePassword(
        req.body.password,
        user.passwordHash,
      );
      if (!ok)
        return res
          .status(401)
          .json({ message: "tên đăng nhập hoặc mật khẩu sai" });

      user.lastLoginAt = new Date();
      await user.save();

      const token = security.signAccessToken({
        id: user.id,
        role: user.role,
        username: user.username,
      });
      return res.json({
        access_token: token,
        token_type: "bearer",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.fullName,
          phone_number: user.phoneNumber,
          role: user.role,
          avatar_url: user.avatarUrl,
          status: user.status,
          last_login_at: user.lastLoginAt,
        },
      });
    } catch (err) {
      return next(err);
    }
  },
);

// --- Password reset via OTP ---

router.post(
  "/forgot-password",
  validateBody(authSchemas.forgotPasswordSchema),
  async function (req: any, res, next) {
    try {
      const email = normalizeEmail(req.body.email);
      const user = await models.User.findOne({ where: { email } });

      // Always respond success to avoid account enumeration.
      if (!user) return res.json({ ok: true });

      const otp = generateOtpCode();
      const expiresAt = new Date(Date.now() + OTP_TTL_MS);
      const otpHash = otpHashFor(otp, user.id, expiresAt);

      await models.PasswordResetOtp.create({
        userId: user.id,
        otpHash,
        expiresAt,
        consumedAt: null,
        sentToEmail: email,
        sendIp: getClientIp(req),
        attempts: 0,
      });

      await mailer.sendMail({
        from: `${(config as any).mail.fromName} <${(config as any).mail.fromEmail}>`,
        to: email,
        subject: "MyKalimba password reset OTP",
        text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
      } as any);

      return res.json({ ok: true });
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  "/reset-password",
  validateBody(authSchemas.resetPasswordSchema),
  async function (req: any, res, next) {
    try {
      const email = normalizeEmail(req.body.email);
      const otp = String(req.body.otp || "").trim();
      const newPassword = String(req.body.new_password || "");

      const user = await models.User.findOne({ where: { email } });
      if (!user) return res.status(400).json({ message: "Invalid OTP" });

      const now = new Date();
      const record = await models.PasswordResetOtp.findOne({
        where: {
          userId: user.id,
          sentToEmail: email,
          consumedAt: null,
          expiresAt: { [Op.gt]: now },
        },
        order: [["created_at", "DESC"]],
      });

      if (!record) return res.status(400).json({ message: "Invalid OTP" });
      if (record.attempts >= OTP_MAX_ATTEMPTS)
        return res.status(429).json({ message: "Too many attempts" });

      record.attempts = Number(record.attempts || 0) + 1;
      await record.save();

      const expectedHash = otpHashFor(otp, user.id, record.expiresAt);
      if (expectedHash !== record.otpHash) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      record.consumedAt = new Date();
      await record.save();

      user.passwordHash = await security.hashPassword(newPassword);
      await user.save();

      return res.json({ ok: true });
    } catch (err) {
      return next(err);
    }
  },
);

// --- OAuth (kept compatible; relies on env vars) ---

router.get("/github", async function (req: any, res) {
  if (maybeRedirectOauthStartToPublicBase(req, res, "github")) return;

  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return res.status(500).send("Missing GITHUB_CLIENT_ID");

  const redirectUri = getOauthRedirectUri(req, "github");
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie("oauth_state_github", state, oauthCookieOptions(req));

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", String(clientId));
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "read:user user:email");

  return res.redirect(url.toString());
});

router.get("/github/callback", async function (req: any, res, next) {
  try {
    const code = String(req.query.code || "");
    const state = String(req.query.state || "");
    const cookieState = String(req.cookies?.oauth_state_github || "");

    if (!code)
      return redirectToFrontend(res, "/oauth/callback", {
        ok: "0",
        error: "missing_code",
      });
    if (!state || !cookieState || state !== cookieState) {
      return redirectToFrontend(res, "/oauth/callback", {
        ok: "0",
        error: "invalid_state",
      });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return redirectToFrontend(res, "/oauth/callback", {
        ok: "0",
        error: "missing_github_env",
      });
    }

    const tokenRes = await http.requestJson(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: http.encodeForm({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: getOauthRedirectUri(req, "github"),
          state,
        }),
      },
    );

    const accessToken = tokenRes.json && tokenRes.json.access_token;
    if (!accessToken) {
      return redirectToFrontend(res, "/oauth/callback", {
        ok: "0",
        error: "token_exchange_failed",
      });
    }

    const userRes = await http.requestJson("https://api.github.com/user", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + accessToken,
        "User-Agent": "mykalimbaserver",
      },
    });

    const emailsRes = await http.requestJson(
      "https://api.github.com/user/emails",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + accessToken,
          "User-Agent": "mykalimbaserver",
        },
      },
    );

    const primaryEmail = Array.isArray(emailsRes.json)
      ? (emailsRes.json.find((e: any) => e.primary) || emailsRes.json[0] || {})
          .email
      : null;

    const profile = {
      email: primaryEmail,
      name: userRes.json && (userRes.json.name || userRes.json.login),
      avatarUrl: userRes.json && userRes.json.avatar_url,
      suggestedUsername: userRes.json && userRes.json.login,
    };

    const user = await findOrCreateOauthUser(profile);
    const token = security.signAccessToken({
      id: user.id,
      role: user.role,
      username: user.username,
    });
    return redirectToFrontend(res, "/oauth/callback", {
      ok: "1",
      access_token: String(token),
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
