import { Request, Response, NextFunction } from "express";

export default function fakeAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.auth = {
    userId: "test1", // 실제 DB에 존재하는 clientId로!
  };
  next();
}
