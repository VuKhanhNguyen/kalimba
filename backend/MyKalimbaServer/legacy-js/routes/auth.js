var express = require("express");
var router = express.Router();
var crypto = require("crypto");

var models = require("../models");
var security = require("../core/security");
var config = require("../core/config");
var mailer = require("../core/mailer");
var http = require("../core/http");
var validate = require("../schemas/validate");
var authSchemas = require("../schemas/auth.schema");

var OTP_TTL_MS = 10 * 60 * 1000;
var OTP_MAX_ATTEMPTS = 8;

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function generateOtpCode() {
  // 6 digits, zero-padded
  var n = crypto.randomBytes(4).readUInt32BE(0) % 1000000;
  return String(n).padStart(6, "0");
}

function otpHashFor(otp, userId, expiresAt) {
  var secret = (config && config.auth && config.auth.jwtSecret) || "";
  // NOTE: Do not include Date fields in the hash.
  // MySQL DATETIME + Sequelize timezone handling can cause millisecond differences
  // between the JS Date used at creation time and the Date read back from DB,
  // which would make the same OTP fail verification.
  var raw = String(otp) + ":" + String(userId) + ":" + secret;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function getClientIp(req) {
  var xf = req.headers && req.headers["x-forwarded-for"];
  if (xf) return String(xf).split(",")[0].trim();
  return req.ip || null;
}

function getBackendBaseUrl(req) {
  // Prefer an explicitly configured public URL.
  var base = process.env.BACKEND_BASE_URL;
  if (base) return String(base).replace(/\/$/, "");

  // Render provides a stable public URL for the service.
  // Using it avoids issues where req.protocol becomes 'http' behind the proxy.
  var renderUrl = process.env.RENDER_EXTERNAL_URL;
  if (renderUrl) return String(renderUrl).replace(/\/$/, "");

  return req.protocol + "://" + req.get("host");
}

function getFrontendBaseUrl() {
  var base = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
  return String(base).replace(/\/$/, "");
}

function getOauthRedirectUri(req, provider) {
  var base = getBackendBaseUrl(req);
  var url = new URL(base + "/api/auth/" + provider + "/callback");

  // ngrok free domains may show a browser interstitial ("You are about to visit...")
  // that breaks OAuth callbacks. Adding this query parameter bypasses it.
  if (/ngrok/i.test(base)) {
    url.searchParams.set("ngrok-skip-browser-warning", "true");
  }

  return url.toString();
}

function getHostFromUrl(url) {
  try {
    return new URL(String(url)).host;
  } catch (_) {
    return "";
  }
}

function maybeRedirectOauthStartToPublicBase(req, res, provider) {
  var publicBase = process.env.BACKEND_BASE_URL;
  if (!publicBase) return false;

  var publicHost = getHostFromUrl(publicBase);
  var reqHost = req.get("host");
  if (!publicHost || !reqHost) return false;

  // If user hits http://localhost:3000/api/auth/github but BACKEND_BASE_URL is ngrok,
  // the state cookie would be set on localhost, while callback lands on ngrok -> invalid_state.
  // Redirect the *start* step to BACKEND_BASE_URL so cookies + callback share the same domain.
  if (publicHost !== reqHost) {
    var startUrl = new URL(
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

function oauthCookieOptions(req) {
  // Important: base this on the *actual* request protocol.
  // If BACKEND_BASE_URL is https (ngrok) but the dev server is accessed via http://localhost,
  // setting secure=true would prevent the browser from storing the state cookie -> invalid_state.
  var xfProto = req.headers["x-forwarded-proto"];
  var isHttps =
    Boolean(req.secure) || String(xfProto || "").toLowerCase() === "https";
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/api/auth/",
    maxAge: 10 * 60 * 1000,
  };
}

function sanitizeUsername(raw) {
  var s = String(raw || "")
    .trim()
    .replace(/[^A-Za-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!s) s = "user";
  if (s.length > 50) s = s.slice(0, 50);
  return s;
}

async function generateUniqueUsername(base) {
  var root = sanitizeUsername(base);
  var candidate = root;
  for (var i = 0; i < 20; i++) {
    // eslint-disable-next-line no-await-in-loop
    var existing = await models.User.findOne({
      where: { username: candidate },
    });
    if (!existing) return candidate;

    var suffix = String(Math.floor(1000 + Math.random() * 9000));
    candidate = root;
    if (candidate.length + 1 + suffix.length > 50) {
      candidate = candidate.slice(0, 50 - 1 - suffix.length);
    }
    candidate = candidate + "_" + suffix;
  }

  // last resort
  return "user_" + crypto.randomBytes(4).toString("hex");
}

function redirectToFrontend(res, path, params) {
  var base = getFrontendBaseUrl();
  var qs = new URLSearchParams(params || {}).toString();
  var url = base + path + (qs ? "?" + qs : "");
  return res.redirect(url);
}

async function findOrCreateOauthUser(profile) {
  // profile: { email, name, avatarUrl, suggestedUsername }
  if (!profile || !profile.email) {
    var err = new Error("Missing email from OAuth provider");
    err.status = 400;
    throw err;
  }

  var email = String(profile.email).trim().toLowerCase();
  var user = await models.User.findOne({ where: { email: email } });

  if (!user) {
    var username = await generateUniqueUsername(
      profile.suggestedUsername || email.split("@")[0],
    );
    var fullName = String(profile.name || username).trim();
    if (!fullName) fullName = username;
    var randomPassword = crypto.randomBytes(24).toString("hex");
    var passwordHash = await security.hashPassword(randomPassword);

    user = await models.User.create({
      username: username,
      passwordHash: passwordHash,
      email: email,
      fullName: fullName,
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

router.post(
  "/register",
  validate.validateBody(authSchemas.registerSchema),
  async function (req, res, next) {
    try {
      var orConditions = [
        { username: req.body.username },
        { email: req.body.email },
      ];
      if (req.body.phone_number) {
        orConditions.push({ phoneNumber: req.body.phone_number });
      }

      var existing = await models.User.findOne({
        where: {
          [models.Sequelize.Op.or]: orConditions,
        },
      });

      if (existing) {
        var details = [];
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

        return res
          .status(409)
          .json({ message: "Duplicate value", details: details });
      }

      var passwordHash = await security.hashPassword(req.body.password);
      var user = await models.User.create({
        username: req.body.username,
        passwordHash: passwordHash,
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
  validate.validateBody(authSchemas.loginSchema),
  async function (req, res, next) {
    try {
      var identifier = req.body.username_or_email;
      var user = await models.User.findOne({
        where: {
          [models.Sequelize.Op.or]: [
            { username: identifier },
            { email: identifier },
          ],
        },
      });

      if (!user)
        return res
          .status(401)
          .json({ message: "tên đăng nhập hoặc mật khẩu sai" });
      if (user.status !== "active")
        return res.status(403).json({ message: "User is not active" });

      var ok = await security.comparePassword(
        req.body.password,
        user.passwordHash,
      );
      if (!ok)
        return res
          .status(401)
          .json({ message: "tên đăng nhập hoặc mật khẩu sai" });

      user.lastLoginAt = new Date();
      await user.save();

      var token = security.signAccessToken({
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

// ----------------------------
// Forgot password (OTP via email)
// ----------------------------

router.post(
  "/forgot-password",
  validate.validateBody(authSchemas.forgotPasswordSchema),
  async function (req, res, next) {
    try {
      var email = normalizeEmail(req.body.email);
      var user = await models.User.findOne({ where: { email: email } });

      // Prevent account enumeration: respond OK even if the user does not exist.
      if (!user) {
        return res.json({
          message:
            "Nếu email tồn tại, mã OTP sẽ được gửi. Vui lòng kiểm tra hộp thư.",
        });
      }

      // Basic throttling: if an OTP was created recently, ask user to wait.
      var latest = await models.PasswordResetOtp.findOne({
        where: { userId: user.id, consumedAt: null },
        order: [["created_at", "DESC"]],
      });
      if (latest && latest.created_at) {
        var ageMs = Date.now() - new Date(latest.created_at).getTime();
        if (ageMs < 30 * 1000) {
          return res.status(429).json({
            message: "Vui lòng chờ vài giây rồi thử gửi lại OTP.",
          });
        }
      }

      // Invalidate previous active OTPs for this user.
      await models.PasswordResetOtp.update(
        { consumedAt: new Date() },
        { where: { userId: user.id, consumedAt: null } },
      );

      var otp = generateOtpCode();
      var expiresAt = new Date(Date.now() + OTP_TTL_MS);
      var hash = otpHashFor(otp, user.id);

      await models.PasswordResetOtp.create({
        userId: user.id,
        otpHash: hash,
        expiresAt: expiresAt,
        consumedAt: null,
        sentToEmail: email,
        sendIp: getClientIp(req),
        attempts: 0,
      });

      var fromEmail =
        (config.mail && config.mail.fromEmail) ||
        (config.mail && config.mail.gmailUser) ||
        undefined;
      var fromName = (config.mail && config.mail.fromName) || "MyKalimba";

      var subject = "Mã OTP đặt lại mật khẩu";
      var text =
        "Bạn vừa yêu cầu đặt lại mật khẩu.\n\n" +
        "Mã OTP: " +
        otp +
        "\n" +
        "Mã có hiệu lực trong 10 phút.\n\n" +
        "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.";

      await mailer.sendMail({
        from: fromEmail ? fromName + " <" + fromEmail + ">" : undefined,
        to: email,
        subject: subject,
        text: text,
        html:
          "<p>Bạn vừa yêu cầu đặt lại mật khẩu.</p>" +
          '<p><b>Mã OTP:</b> <span style="font-size:18px">' +
          otp +
          "</span></p>" +
          "<p>Mã có hiệu lực trong <b>10 phút</b>.</p>" +
          "<p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>",
      });

      return res.json({
        message:
          "Nếu email tồn tại, mã OTP sẽ được gửi. Vui lòng kiểm tra hộp thư.",
      });
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  "/reset-password",
  validate.validateBody(authSchemas.resetPasswordSchema),
  async function (req, res, next) {
    try {
      var email = normalizeEmail(req.body.email);
      var otp = String(req.body.otp || "").trim();
      var newPassword = String(req.body.new_password || "");

      var user = await models.User.findOne({ where: { email: email } });
      if (!user) {
        return res
          .status(400)
          .json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
      }

      var now = new Date();
      var record = await models.PasswordResetOtp.findOne({
        where: {
          userId: user.id,
          consumedAt: null,
          expiresAt: { [models.Sequelize.Op.gt]: now },
        },
        order: [["created_at", "DESC"]],
      });

      if (!record) {
        return res
          .status(400)
          .json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
      }

      if ((record.attempts || 0) >= OTP_MAX_ATTEMPTS) {
        return res.status(429).json({
          message: "Bạn đã nhập sai OTP quá nhiều lần. Vui lòng gửi lại mã.",
        });
      }

      var expected = otpHashFor(otp, user.id);
      if (expected !== record.otpHash) {
        record.attempts = (record.attempts || 0) + 1;
        await record.save();
        return res
          .status(400)
          .json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
      }

      user.passwordHash = await security.hashPassword(newPassword);
      await user.save();

      record.consumedAt = now;
      await record.save();

      return res.json({ message: "Đổi mật khẩu thành công" });
    } catch (err) {
      return next(err);
    }
  },
);

// ----------------------------
// OAuth: GitHub
// ----------------------------

router.get("/github", function (req, res) {
  if (maybeRedirectOauthStartToPublicBase(req, res, "github")) return;

  var clientId = process.env.GITHUB_CLIENT_ID;
  var clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).json({ message: "GitHub OAuth is not configured" });
  }

  var state = crypto.randomBytes(16).toString("hex");
  res.cookie("oauth_state_github", state, oauthCookieOptions(req));

  var redirectUri = getOauthRedirectUri(req, "github");
  var authorizeUrl =
    "https://github.com/login/oauth/authorize" +
    "?" +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "read:user user:email",
      state: state,
    }).toString();

  return res.redirect(authorizeUrl);
});

router.get("/github/callback", async function (req, res, next) {
  try {
    if (req.query && req.query.error) {
      return redirectToFrontend(res, "/login", {
        oauth_error: String(req.query.error),
        provider: "github",
      });
    }

    var code = req.query && req.query.code ? String(req.query.code) : "";
    var state = req.query && req.query.state ? String(req.query.state) : "";
    var expectedState = req.cookies ? req.cookies.oauth_state_github : "";
    res.clearCookie("oauth_state_github", { path: "/api/auth/" });

    if (!code) {
      return redirectToFrontend(res, "/login", {
        oauth_error: "missing_code",
        provider: "github",
      });
    }

    if (!state || !expectedState || state !== expectedState) {
      return redirectToFrontend(res, "/login", {
        oauth_error: "invalid_state",
        provider: "github",
      });
    }

    var clientId = process.env.GITHUB_CLIENT_ID;
    var clientSecret = process.env.GITHUB_CLIENT_SECRET;
    var redirectUri = getOauthRedirectUri(req, "github");

    var tokenRes = await http.requestJson(
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
          code: code,
          redirect_uri: redirectUri,
        }),
      },
    );

    var accessToken =
      tokenRes && tokenRes.json ? tokenRes.json.access_token : null;
    if (!accessToken) {
      return redirectToFrontend(res, "/login", {
        oauth_error: "token_exchange_failed",
        provider: "github",
      });
    }

    var userRes = await http.requestJson("https://api.github.com/user", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
        "User-Agent": "MyKalimbaServer",
        Accept: "application/vnd.github+json",
      },
    });

    var ghUser = userRes.json || {};

    var email = ghUser.email;
    if (!email) {
      var emailsRes = await http.requestJson(
        "https://api.github.com/user/emails",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + accessToken,
            "User-Agent": "MyKalimbaServer",
            Accept: "application/vnd.github+json",
          },
        },
      );

      var emails = Array.isArray(emailsRes.json) ? emailsRes.json : [];
      var primary = emails.find(function (e) {
        return e && e.primary && e.verified && e.email;
      });
      if (!primary) {
        primary = emails.find(function (e) {
          return e && e.verified && e.email;
        });
      }
      if (!primary) {
        primary = emails.find(function (e) {
          return e && e.email;
        });
      }
      email = primary ? primary.email : null;
    }

    var user = await findOrCreateOauthUser({
      email: email,
      name: ghUser.name || ghUser.login,
      avatarUrl: ghUser.avatar_url,
      suggestedUsername: ghUser.login,
    });

    var token = security.signAccessToken({
      id: user.id,
      role: user.role,
      username: user.username,
    });

    return redirectToFrontend(res, "/oauth/callback", {
      provider: "github",
      token: token,
    });
  } catch (err) {
    return next(err);
  }
});

// ----------------------------
// OAuth: Google
// ----------------------------

router.get("/google", function (req, res) {
  if (maybeRedirectOauthStartToPublicBase(req, res, "google")) return;

  var clientId = process.env.GOOGLE_CLIENT_ID;
  var clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).json({ message: "Google OAuth is not configured" });
  }

  var state = crypto.randomBytes(16).toString("hex");
  res.cookie("oauth_state_google", state, oauthCookieOptions(req));

  var redirectUri = getOauthRedirectUri(req, "google");
  var authorizeUrl =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    "?" +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state: state,
      include_granted_scopes: "true",
    }).toString();

  return res.redirect(authorizeUrl);
});

router.get("/google/callback", async function (req, res, next) {
  try {
    if (req.query && req.query.error) {
      return redirectToFrontend(res, "/login", {
        oauth_error: String(req.query.error),
        provider: "google",
      });
    }

    var code = req.query && req.query.code ? String(req.query.code) : "";
    var state = req.query && req.query.state ? String(req.query.state) : "";
    var expectedState = req.cookies ? req.cookies.oauth_state_google : "";
    res.clearCookie("oauth_state_google", { path: "/api/auth/" });

    if (!code) {
      return redirectToFrontend(res, "/login", {
        oauth_error: "missing_code",
        provider: "google",
      });
    }

    if (!state || !expectedState || state !== expectedState) {
      return redirectToFrontend(res, "/login", {
        oauth_error: "invalid_state",
        provider: "google",
      });
    }

    var clientId = process.env.GOOGLE_CLIENT_ID;
    var clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    var redirectUri = getOauthRedirectUri(req, "google");

    var tokenRes = await http.requestJson(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: http.encodeForm({
          code: code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      },
    );

    var accessToken =
      tokenRes && tokenRes.json ? tokenRes.json.access_token : null;
    if (!accessToken) {
      return redirectToFrontend(res, "/login", {
        oauth_error: "token_exchange_failed",
        provider: "google",
      });
    }

    var infoRes = await http.requestJson(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + accessToken,
          Accept: "application/json",
        },
      },
    );

    var gUser = infoRes.json || {};

    var user = await findOrCreateOauthUser({
      email: gUser.email,
      name: gUser.name,
      avatarUrl: gUser.picture,
      suggestedUsername: gUser.email
        ? String(gUser.email).split("@")[0]
        : "google_user",
    });

    var token = security.signAccessToken({
      id: user.id,
      role: user.role,
      username: user.username,
    });

    return redirectToFrontend(res, "/oauth/callback", {
      provider: "google",
      token: token,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
