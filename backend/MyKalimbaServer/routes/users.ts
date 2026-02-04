import express from "express";
import multer from "multer";
import { Op } from "sequelize";

import models from "../models";
import { authenticate } from "../middleware/authenticate";
import { validateBody } from "../schemas/validate";
import * as userSchemas from "../schemas/user.schema";
import * as cloudinaryCore from "../core/cloudinary";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

function serializeUser(user: any) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    full_name: user.fullName,
    phone_number: user.phoneNumber,
    role: user.role,
    avatar_url: user.avatarUrl,
    status: user.status,
    last_login_at: user.lastLoginAt,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

router.get("/me", authenticate, async function (req: any, res, next) {
  try {
    const user = await models.User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user: serializeUser(user) });
  } catch (err) {
    return next(err);
  }
});

router.patch(
  "/me",
  authenticate,
  validateBody(userSchemas.updateMeSchema),
  async function (req: any, res, next) {
    try {
      const user = await models.User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const details: any[] = [];

      if (req.body.email && req.body.email !== user.email) {
        const existingEmail = await models.User.findOne({
          where: {
            email: req.body.email,
            id: { [Op.ne]: user.id },
          },
        });
        if (existingEmail) {
          details.push({ message: "Email already exists", path: ["email"] });
        }
      }

      if (req.body.phone_number !== undefined) {
        let nextPhone = req.body.phone_number;
        if (nextPhone === "") nextPhone = null;

        if (nextPhone && nextPhone !== user.phoneNumber) {
          const existingPhone = await models.User.findOne({
            where: {
              phoneNumber: nextPhone,
              id: { [Op.ne]: user.id },
            },
          });
          if (existingPhone) {
            details.push({
              message: "Phone number already exists",
              path: ["phone_number"],
            });
          }
        }
      }

      if (details.length > 0) {
        return res.status(409).json({ message: "Duplicate value", details });
      }

      if (req.body.full_name !== undefined) user.fullName = req.body.full_name;
      if (req.body.email !== undefined) user.email = req.body.email;
      if (req.body.phone_number !== undefined) {
        user.phoneNumber =
          req.body.phone_number === "" ? null : req.body.phone_number;
      }

      await user.save();
      return res.json({ user: serializeUser(user) });
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  "/me/avatar",
  authenticate,
  upload.single("avatar"),
  async function (req: any, res, next) {
    try {
      const user = await models.User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!req.file) {
        return res.status(400).json({ message: "Missing avatar file" });
      }

      if (!req.file.mimetype || req.file.mimetype.indexOf("image/") !== 0) {
        return res.status(400).json({ message: "Invalid file type" });
      }

      cloudinaryCore.configureCloudinary();
      const result: any = await cloudinaryCore.uploadImageBuffer(
        req.file.buffer,
        {
          folder: process.env.CLOUDINARY_FOLDER || "kalimba/avatars",
          resource_type: "image",
          public_id: "user_" + String(user.id),
          overwrite: true,
        },
      );

      user.avatarUrl = result.secure_url || result.url;
      await user.save();

      return res.json({
        avatar_url: user.avatarUrl,
        user: serializeUser(user),
      });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
