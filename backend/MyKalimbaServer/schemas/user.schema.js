var Joi = require("joi");

var PHONE_REGEX = /^\+?[0-9]{8,15}$/;

var updateMeSchema = Joi.object({
  email: Joi.string().email().max(254),
  full_name: Joi.string().trim().min(1).max(200),
  phone_number: Joi.alternatives()
    .try(Joi.string().trim().pattern(PHONE_REGEX).max(30), Joi.valid(null, ""))
    .optional(),
}).min(1);

module.exports = {
  updateMeSchema: updateMeSchema,
};
