import { Request, Response } from 'express';
import prisma from '../configs/prisma.config';

export const getMovers = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.id; // 로그인한 경우에만 존재

    const movers = await prisma.mover.findMany({
      include: {
        favorites: clientId
          ? {
              where: {
                clientId,
              },
              select: { id: true },
            }
          : false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const result = movers.map((mover) => ({
      id: mover.id,
      nickName: mover.nickName,
      serviceType: mover.serviceType,
      career: mover.career,
      averageReviewRating: mover.averageReviewRating,
      reviewCount: mover.reviewCount,
      estimateCount: mover.estimateCount,
      profileImage: mover.profileImage,
      isFavorite: mover.favorites?.length > 0, // 로그인한 경우만 포함됨
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('[GET /movers]', error);
    res.status(500).json({ message: '서버 오류 발생' });
  }
};
