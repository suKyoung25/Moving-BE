// middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../configs/prisma.config';

export const authenticate = {
  optional: async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const client = await prisma.client.findUnique({ where: { id: decoded.id } });
        if (client) req.user = client;
      } catch {
        // 토큰 유효하지 않아도 그냥 넘어감
      }
    }
    next();
  },
};
