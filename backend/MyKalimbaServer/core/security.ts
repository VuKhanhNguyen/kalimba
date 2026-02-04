import bcrypt from "bcryptjs";
import jwt, {
  type JwtPayload,
  type Secret,
  type SignOptions,
} from "jsonwebtoken";
import config from "./config";

export function hashPassword(plainPassword: string) {
  return bcrypt.hash(plainPassword, 10);
}

export function comparePassword(plainPassword: string, passwordHash: string) {
  return bcrypt.compare(plainPassword, passwordHash);
}

export function signAccessToken(payload: string | Buffer | object) {
  const secret = config.auth.jwtSecret as unknown as Secret;
  const expiresIn = config.auth
    .jwtExpiresIn as unknown as SignOptions["expiresIn"];
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyAccessToken(token: string): string | JwtPayload {
  return jwt.verify(token, config.auth.jwtSecret as unknown as Secret);
}
