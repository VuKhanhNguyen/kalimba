import Joi from "joi";

const USERNAME_REGEX = /^[A-Za-z0-9_]+$/;
const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

export const registerSchema = Joi.object({
  username: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .pattern(USERNAME_REGEX)
    .required(),
  password: Joi.string().min(8).max(200).required(),
  email: Joi.string().email().max(254).required(),
  full_name: Joi.string().max(200).required(),
  phone_number: Joi.string()
    .trim()
    .pattern(PHONE_REGEX)
    .max(30)
    .allow(null, ""),
  avatar_url: Joi.string().uri().max(1000).allow(null, ""),
});

export const loginSchema = Joi.object({
  username_or_email: Joi.string().min(3).max(254).required(),
  password: Joi.string().min(1).max(200).required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().max(254).required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().max(254).required(),
  otp: Joi.string()
    .trim()
    .pattern(/^[0-9]{6}$/)
    .required(),
  new_password: Joi.string().min(8).max(200).required(),
});
