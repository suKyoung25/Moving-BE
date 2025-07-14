import jwt from "jsonwebtoken";
import { ConflictError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";
import { createdToken } from "../types";

export function generateAccessToken(user: createdToken): string {
  const payload = {
    userId: user.userId,
    email: user.email,
    name: user.name,
    userType: user.userType,
  };

  const accessSecret = process.env.JWT_SECRET;
  if (!accessSecret) {
    throw new ConflictError(ErrorMessage.JWT_SECRET_NOT_FOUND);
  }

  const expiresIn = "1h";

  const accessToken = jwt.sign(payload, accessSecret, {
    expiresIn,
  } as jwt.SignOptions);

  return accessToken;
}

export function generateRefreshToken(user: createdToken): string {
  const payload = {
    userId: user.userId,
    email: user.email,
    name: user.name,
    userType: user.userType,
  };

  const refreshSecret = process.env.JWT_SECRET;
  if (!refreshSecret) {
    throw new ConflictError(ErrorMessage.JWT_SECRET_NOT_FOUND);
  }

  const expiresIn = "7d";

  const refreshToken = jwt.sign(payload, refreshSecret, {
    expiresIn,
  } as jwt.SignOptions);

  return refreshToken;
}
