var express = require("express");
var router = express.Router();

var models = require("../models");
var validate = require("../schemas/validate");
var tabSchemas = require("../schemas/tab.schema");
var auth = require("../middleware/authenticate");

function normalizeContent(content) {
  if (content === null || content === undefined) return "";
  if (typeof content === "string") return content;
  try {
    return JSON.stringify(content);
  } catch (e) {
    return String(content);
  }
}

router.get("/", auth.optionalAuthenticate, async function (req, res, next) {
  try {
    var where = {};
    if (req.query.songId) where.songId = req.query.songId;

    if (req.user) {
      var tabs = await models.Tab.findAll({
        where: where,
        include: [
          {
            model: models.Song,
            as: "song",
            attributes: ["id", "isPublic", "createdBy"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      var filtered = tabs.filter(function (t) {
        return t.createdBy === req.user.id || (t.song && t.song.isPublic);
      });

      return res.json(filtered);
    }

    var publicTabs = await models.Tab.findAll({
      where: where,
      include: [
        {
          model: models.Song,
          as: "song",
          where: { isPublic: true },
          attributes: [],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.json(publicTabs);
  } catch (err) {
    return next(err);
  }
});

router.post(
  "/",
  auth.authenticate,
  validate.validateBody(tabSchemas.createTabSchema),
  async function (req, res, next) {
    try {
      var song = await models.Song.findByPk(req.body.song_id);
      if (!song) return res.status(404).json({ message: "Song not found" });

      var tab = await models.Tab.create({
        songId: req.body.song_id,
        createdBy: req.user.id,
        instrument: req.body.instrument,
        format: req.body.format,
        content: normalizeContent(req.body.content),
        baseNote: req.body.base_note,
        keysCount: req.body.keys_count,
        arrangement: req.body.arrangement || null,
        labelType: req.body.label_type || null,
        soundfont: req.body.soundfont || null,
        version: req.body.version,
      });

      return res.status(201).json(tab);
    } catch (err) {
      return next(err);
    }
  },
);

router.get("/:id", auth.optionalAuthenticate, async function (req, res, next) {
  try {
    var tab = await models.Tab.findByPk(req.params.id, {
      include: [{ model: models.Song, as: "song" }],
    });
    if (!tab) return res.status(404).json({ message: "Tab not found" });

    var canView =
      (tab.song && tab.song.isPublic) ||
      (req.user && tab.createdBy === req.user.id);
    if (!canView) return res.status(403).json({ message: "Forbidden" });

    return res.json(tab);
  } catch (err) {
    return next(err);
  }
});

router.put(
  "/:id",
  auth.authenticate,
  validate.validateBody(tabSchemas.updateTabSchema),
  async function (req, res, next) {
    try {
      var tab = await models.Tab.findByPk(req.params.id);
      if (!tab) return res.status(404).json({ message: "Tab not found" });
      if (tab.createdBy !== req.user.id)
        return res.status(403).json({ message: "Forbidden" });

      if (req.body.instrument !== undefined)
        tab.instrument = req.body.instrument;
      if (req.body.format !== undefined) tab.format = req.body.format;
      if (req.body.content !== undefined)
        tab.content = normalizeContent(req.body.content);
      if (req.body.base_note !== undefined) tab.baseNote = req.body.base_note;
      if (req.body.keys_count !== undefined)
        tab.keysCount = req.body.keys_count;
      if (req.body.arrangement !== undefined)
        tab.arrangement = req.body.arrangement || null;
      if (req.body.label_type !== undefined)
        tab.labelType = req.body.label_type || null;
      if (req.body.soundfont !== undefined)
        tab.soundfont = req.body.soundfont || null;
      if (req.body.version !== undefined) tab.version = req.body.version;

      await tab.save();
      return res.json(tab);
    } catch (err) {
      return next(err);
    }
  },
);

router.delete("/:id", auth.authenticate, async function (req, res, next) {
  try {
    var tab = await models.Tab.findByPk(req.params.id);
    if (!tab) return res.status(404).json({ message: "Tab not found" });
    if (tab.createdBy !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    await tab.destroy();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
