import type { NextFunction, Request, Response } from "express";
import * as security from "../core/security";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const header: any =
      (req.headers as any).authorization || (req.headers as any).Authorization;
    if (!header)
      return res.status(401).json({ message: "Missing Authorization header" });

    const parts = String(header).split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid Authorization header" });
    }

    const token = parts[1];
    const decoded = security.verifyAccessToken(token);
    (req as any).user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header: any =
    (req.headers as any).authorization || (req.headers as any).Authorization;
  if (!header) return next();

  const parts = String(header).split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return next();

  try {
    (req as any).user = security.verifyAccessToken(parts[1]);
  } catch {
    // ignore
  }

  return next();
}
