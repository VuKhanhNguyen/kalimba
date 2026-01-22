var Joi = require("joi");

var createTabSchema = Joi.object({
  song_id: Joi.number().integer().positive().required(),
  instrument: Joi.string().max(50).default("kalimba"),
  format: Joi.string().max(50).default("text"),
  content: Joi.alternatives()
    .try(Joi.string(), Joi.object(), Joi.array())
    .required(),
  base_note: Joi.number().integer().min(0).allow(null),
  keys_count: Joi.number().integer().min(8).max(21).allow(null),
  arrangement: Joi.string().max(50).allow(null, ""),
  label_type: Joi.string().max(50).allow(null, ""),
  soundfont: Joi.string().max(100).allow(null, ""),
  version: Joi.number().integer().min(1).default(1),
});

var updateTabSchema = Joi.object({
  instrument: Joi.string().max(50),
  format: Joi.string().max(50),
  content: Joi.alternatives().try(Joi.string(), Joi.object(), Joi.array()),
  base_note: Joi.number().integer().min(0).allow(null),
  keys_count: Joi.number().integer().min(8).max(21).allow(null),
  arrangement: Joi.string().max(50).allow(null, ""),
  label_type: Joi.string().max(50).allow(null, ""),
  soundfont: Joi.string().max(100).allow(null, ""),
  version: Joi.number().integer().min(1),
}).min(1);

module.exports = {
  createTabSchema: createTabSchema,
  updateTabSchema: updateTabSchema,
};
