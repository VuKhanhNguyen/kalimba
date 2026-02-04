var express = require("express");
var router = express.Router();

var models = require("../models");
var validate = require("../schemas/validate");
var songSchemas = require("../schemas/song.schema");
var auth = require("../middleware/authenticate");

router.get("/", auth.optionalAuthenticate, async function (req, res, next) {
  try {
    var where = { isPublic: true };
    if (req.user && req.query.includeMine === "1") {
      where = {
        [models.Sequelize.Op.or]: [
          { isPublic: true },
          { createdBy: req.user.id },
        ],
      };
    }

    var songs = await models.Song.findAll({
      where: where,
      order: [["created_at", "DESC"]],
    });

    return res.json(songs);
  } catch (err) {
    return next(err);
  }
});

router.post(
  "/",
  auth.authenticate,
  validate.validateBody(songSchemas.createSongSchema),
  async function (req, res, next) {
    try {
      var song = await models.Song.create({
        title: req.body.title,
        artist: req.body.artist || null,
        isPublic: req.body.is_public,
        createdBy: req.user.id,
      });

      return res.status(201).json(song);
    } catch (err) {
      return next(err);
    }
  },
);

router.get("/:id", auth.optionalAuthenticate, async function (req, res, next) {
  try {
    var song = await models.Song.findByPk(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });

    var canView = song.isPublic || (req.user && song.createdBy === req.user.id);
    if (!canView) return res.status(403).json({ message: "Forbidden" });

    return res.json(song);
  } catch (err) {
    return next(err);
  }
});

router.put(
  "/:id",
  auth.authenticate,
  validate.validateBody(songSchemas.updateSongSchema),
  async function (req, res, next) {
    try {
      var song = await models.Song.findByPk(req.params.id);
      if (!song) return res.status(404).json({ message: "Song not found" });
      if (song.createdBy !== req.user.id)
        return res.status(403).json({ message: "Forbidden" });

      if (req.body.title !== undefined) song.title = req.body.title;
      if (req.body.artist !== undefined) song.artist = req.body.artist || null;
      if (req.body.is_public !== undefined) song.isPublic = req.body.is_public;

      await song.save();
      return res.json(song);
    } catch (err) {
      return next(err);
    }
  },
);

router.delete("/:id", auth.authenticate, async function (req, res, next) {
  try {
    var song = await models.Song.findByPk(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });
    if (song.createdBy !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    await song.destroy();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
