import express from "express";
import { Op } from "sequelize";

import models from "../models";
import { validateBody } from "../schemas/validate";
import * as songSchemas from "../schemas/song.schema";
import * as auth from "../middleware/authenticate";

const router = express.Router();

router.get(
  "/",
  auth.optionalAuthenticate,
  async function (req: any, res, next) {
    try {
      let where: any = { isPublic: true };
      if (req.user && req.query.includeMine === "1") {
        where = {
          [Op.or]: [{ isPublic: true }, { createdBy: req.user.id }],
        };
      }

      const songs = await models.Song.findAll({
        where,
        order: [["created_at", "DESC"]],
      });

      return res.json(songs);
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  "/",
  auth.authenticate,
  validateBody(songSchemas.createSongSchema),
  async function (req: any, res, next) {
    try {
      const song = await models.Song.create({
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

router.get(
  "/:id",
  auth.optionalAuthenticate,
  async function (req: any, res, next) {
    try {
      const song = await models.Song.findByPk(req.params.id);
      if (!song) return res.status(404).json({ message: "Song not found" });

      const canView =
        song.isPublic || (req.user && song.createdBy === req.user.id);
      if (!canView) return res.status(403).json({ message: "Forbidden" });

      return res.json(song);
    } catch (err) {
      return next(err);
    }
  },
);

router.put(
  "/:id",
  auth.authenticate,
  validateBody(songSchemas.updateSongSchema),
  async function (req: any, res, next) {
    try {
      const song = await models.Song.findByPk(req.params.id);
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

router.delete("/:id", auth.authenticate, async function (req: any, res, next) {
  try {
    const song = await models.Song.findByPk(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });
    if (song.createdBy !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    await song.destroy();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export default router;
