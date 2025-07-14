import { Client, Mover } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { NotFoundError, ServerError } from "../types/errors";
import { CreateRequestDto } from "../dtos/estimate.dto";

// 작성 가능한 리뷰 목록
async function findWritableEstimatesByClientId(clientId: Client["id"]) {
  try {
    const estimate = await prisma.estimate.findMany({
      where: {
        clientId,
        status: "DONE",
        review: null,
      },
      select: {
        id: true,
        price: true,
        moveType: true,
        isDesignated: true,
        moveDate: true,
        mover: {
          select: {
            profileImage: true,
            nickName: true,
          },
        },
      },
      orderBy: {
        moveDate: "desc",
      },
    });
    if (estimate.length === 0) {
      throw new NotFoundError("작성 가능한 리뷰가 없습니다.");
    }
    return estimate;
  } catch (error) {
    throw new ServerError("작성 가능한 리뷰 조회 중 서버 오류가 발생했습니다.", error);
  }
}

// 견적 요청 생성
async function createRequest(request: CreateRequestDto, clientId: string) {
  return await prisma.estimate.create({
    data: { ...request, client: { connect: { id: clientId } } },
  });
}

// 대기 중인 견적서 조회
async function getPendingEstimatesByClientId(clientId: Client["id"]) {
  try {
    const estimate = await prisma.estimate.findMany({
      where: {
        clientId,
        isClientConfirmed: false,
      },
      include: {
        mover: {
          select: {
            id: true,
            name: true,
            nickName: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        requestedAt: "desc",
      },
    });

    return estimate;
  } catch (e) {
    throw new ServerError("대기 중인 견적서 조회 중 서버 오류가 발생했습니다", e);
  }
}

// 찜한 기사님 조회
async function isFavoritMover(clientId: Client["id"], moverId: Mover["id"]) {
  try {
    const favoirte = await prisma.favorite.findUnique({
      where: {
        clientId_moverId: {
          clientId,
          moverId,
        },
      },
    });

    return favoirte;
  } catch (e) {
    throw new ServerError("찜한 기사님을 조회 중 서버 오류가 발생했습니다", e);
  }
}

export default {
  findWritableEstimatesByClientId,
  getPendingEstimatesByClientId,
  isFavoritMover,
  createRequest,
};
