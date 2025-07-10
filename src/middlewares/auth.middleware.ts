import { expressjwt } from "express-jwt";
import { ConflictError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new ConflictError(ErrorMessage.JWT_SECRET_NOT_FOUND);
}

export const authenticateMover = expressjwt({
  secret: secretKey,
  algorithms: ["HS256"],
  requestProperty: "auth", // req.auth에 moverId가 들어감
});
