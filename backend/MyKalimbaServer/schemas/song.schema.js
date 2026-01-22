var Joi = require("joi");

var createSongSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  artist: Joi.string().max(255).allow(null, ""),
  is_public: Joi.boolean().default(false),
});

var updateSongSchema = Joi.object({
  title: Joi.string().min(1).max(255),
  artist: Joi.string().max(255).allow(null, ""),
  is_public: Joi.boolean(),
}).min(1);

module.exports = {
  createSongSchema: createSongSchema,
  updateSongSchema: updateSongSchema,
};
