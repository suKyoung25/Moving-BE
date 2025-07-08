import { createAccessToken } from "../types";
import jwt from "jsonwebtoken";
import { ConflictError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";

export function generateAccessToken(user: createAccessToken) {
  const payload = {
    userId: user.id,
    email: user.email,
    nickName: user.nickName,
    userType: user.userType,
  };

  const accessSecret = process.env.JWT_SECRET;

  if (!accessSecret) {
    throw new ConflictError(ErrorMessage.JWT_SECRET_NOT_FOUND);
  }

  const accessToken = jwt.sign(payload, accessSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return accessToken;
}
