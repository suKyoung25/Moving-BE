import { Client, PrismaClient, EstimateStatus } from "@prisma/client";
import estimateRepository from "../repositories/estimate.repository";
import { BadRequestError } from "../types/errors";

interface EstimateInput {
  price?: number;
  comment: string;
  moverId: string;
  clientId: string;
  requestId: string;
}

const prisma = new PrismaClient();

// client 데기 중인 견적서 조회
async function getPendingEstimates(clientId: Client["id"]) {
  const requests = await estimateRepository.findPendingEstimatesByClientId(clientId);

  return Promise.all(
    requests.map(async (req) => {
      const designatedMoverIds = req.designatedRequest.map((d) => d.moverId);

      const estimates = await Promise.all(
        req.estimate.map(async (e) => {
          const isDesignated = designatedMoverIds.includes(e.moverId);
          const isFavorited = await estimateRepository.isFavoriteMover(clientId, e.moverId);

          return {
            estimateId: e.id,
            moverId: e.mover.id,
            moverName: e.mover.name,
            moverNickName: e.mover.nickName,
            profileImage: e.mover.profileImage,
            comment: e.comment,
            price: e.price,
            created: e.createdAt,
            reviewRating: e.mover.averageReviewRating,
            reviewCount: e.mover.reviewCount,
            career: e.mover.career,
            estimateCount: e.mover.estimateCount,
            favoriteCount: e.mover.favoriteCount,
            isDesignated,
            isFavorited,
          };
        }),
      );

      return {
        requestId: req.id,
        moveDate: req.moveDate,
        fromAddress: req.fromAddress,
        toAddress: req.toAddress,
        moveType: req.moveType,
        estimates,
      };
    }),
  );
}

// 견적 요청하기
async function createEstimate({ price, comment, moverId, clientId, requestId }: EstimateInput) {
  return prisma.estimate.create({
    data: {
      price,
      comment,
      moverStatus: EstimateStatus.CONFIRMED,
      client: { connect: { id: clientId } },
      mover: { connect: { id: moverId } },
      request: { connect: { id: requestId } },
    },
  });
}

// 견적 거절하기
async function rejectEstimate({ comment, moverId, clientId, requestId }: EstimateInput) {
  const newEstimate = await prisma.estimate.create({
    data: {
      comment,
      moverStatus: EstimateStatus.REJECTED,
      client: { connect: { id: clientId } },
      mover: { connect: { id: moverId } },
      request: { connect: { id: requestId } },
    },
  });

  return newEstimate;
}

// 보낸 견적 조회
async function findEstimatesByMoverId(moverId: string) {
  return prisma.estimate.findMany({
    where: {
      moverId,
      moverStatus: "CONFIRMED",
    },
    select: {
      id: true,
      price: true,
      comment: true,
      createdAt: true,
      isClientConfirmed: true,
      moverId: true,
      request: {
        select: {
          moveDate: true,
          fromAddress: true,
          toAddress: true,
          moveType: true,
          client: {
            select: {
              name: true,
            },
          },
          designatedRequest: {
            select: {
              moverId: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// 보낸 견적 상세 조회
async function findSentEstimateById(moverId: string, estimateId: string) {
  return prisma.estimate.findFirst({
    where: {
      id: estimateId,
      moverId,
    },
    select: {
      id: true,
      price: true,
      moverId: true,
      createdAt: true,
      isClientConfirmed: true,
      request: {
        select: {
          moveType: true,
          moveDate: true,
          fromAddress: true,
          toAddress: true,
          requestedAt: true,
          client: {
            select: {
              name: true,
            },
          },
          designatedRequest: {
            select: {
              moverId: true,
            },
          },
        },
      },
    },
  });
}

// 반려한 견적 조회
async function getEstimatesByStatus(moverId: string) {
  return prisma.estimate.findMany({
    where: {
      moverId,
      moverStatus: "REJECTED",
    },
    select: {
      id: true,
      price: true,
      comment: true,
      createdAt: true,
      isClientConfirmed: true,
      moverId: true,
      request: {
        select: {
          moveDate: true,
          fromAddress: true,
          toAddress: true,
          moveType: true,
          client: {
            select: {
              name: true,
            },
          },
          designatedRequest: {
            select: {
              moverId: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// client 받은 견적 조회
async function getReceivedEstimates(clientId: Client["id"], category: "all" | "confirmed" = "all") {
  const requests = await estimateRepository.findReceivedEstimatesByClientId(clientId);

  return requests.map((req) => ({
    requestId: req.id,
    moveDate: req.moveDate,
    fromAddress: req.fromAddress,
    toAddress: req.toAddress,
    moveType: req.moveType,
    requestedAt: req.requestedAt,
    designatedRequest: req.designatedRequest,
    estimates: req.estimate
      .filter((e) => {
        if (category === "confirmed") {
          return e.moverStatus === "CONFIRMED" && e.isClientConfirmed === true;
        }
        return true;
      })
      .map((e) => ({
        estimateId: e.id,
        moverId: e.mover.id,
        moverName: e.mover.name,
        moverNickName: e.mover.nickName,
        profileImage: e.mover.profileImage,
        comment: e.comment,
        price: e.price,
        created: e.createdAt,
        reviewRating: e.mover.averageReviewRating,
        reviewCount: e.mover.reviewCount,
        career: e.mover.career,
        estimateCount: e.mover.estimateCount,
        favoriteCount: e.mover.favoriteCount,
        isConfirmed: e.moverStatus === "CONFIRMED" && e.isClientConfirmed === true,
      })),
  }));
}

export default {
  getPendingEstimates,
  createEstimate,
  findSentEstimateById,
  rejectEstimate,
  findEstimatesByMoverId,
  getEstimatesByStatus,
  getReceivedEstimates,
};
