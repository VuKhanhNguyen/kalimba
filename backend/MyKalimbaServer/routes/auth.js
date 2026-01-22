var express = require("express");
var router = express.Router();

var models = require("../models");
var security = require("../core/security");
var validate = require("../schemas/validate");
var authSchemas = require("../schemas/auth.schema");

router.post(
  "/register",
  validate.validateBody(authSchemas.registerSchema),
  async function (req, res, next) {
    try {
      var existing = await models.User.findOne({
        where: {
          [models.Sequelize.Op.or]: [
            { username: req.body.username },
            { email: req.body.email },
          ],
        },
      });

      if (existing) {
        return res
          .status(409)
          .json({ message: "Username or email already exists" });
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
        return res.status(401).json({ message: "Invalid credentials" });
      if (user.status !== "active")
        return res.status(403).json({ message: "User is not active" });

      var ok = await security.comparePassword(
        req.body.password,
        user.passwordHash,
      );
      if (!ok) return res.status(401).json({ message: "Invalid credentials" });

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

module.exports = router;
