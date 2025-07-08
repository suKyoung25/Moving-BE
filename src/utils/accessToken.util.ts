import { createAccessToken } from "../types";
import jwt from "jsonwebtoken";
import { ConflictError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";
import type { StringValue } from "jsonwebtoken";

export function generateAccessToken(user: createAccessToken): string {
  const payload = {
    userId: user.id,
    email: user.email,
    nickName: user.nickName,
    userType: user.userType,
  };

  const accessSecret = process.env.JWT_SECRET as string;
  if (!accessSecret) {
    throw new ConflictError(ErrorMessage.JWT_SECRET_NOT_FOUND);
  }

  const expiresIn = process.env.JWT_EXPIRES_IN as unknown as StringValue;
  if (!expiresIn) {
    throw new ConflictError(ErrorMessage.JWT_EXPIRES_IN_NOT_FOUND);
  }

  const accessToken = jwt.sign(payload, accessSecret, {
    expiresIn,
  });

  return accessToken;
}
