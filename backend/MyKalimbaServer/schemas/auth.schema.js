var Joi = require("joi");

var USERNAME_REGEX = /^[A-Za-z0-9_]+$/;
var PHONE_REGEX = /^\+?[0-9]{8,15}$/;

var registerSchema = Joi.object({
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

var loginSchema = Joi.object({
  username_or_email: Joi.string().min(3).max(254).required(),
  password: Joi.string().min(1).max(200).required(),
});

module.exports = {
  registerSchema: registerSchema,
  loginSchema: loginSchema,
};
