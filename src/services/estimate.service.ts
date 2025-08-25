import estimateRepository from "../repositories/estimate.repository";
import moverRepository from "../repositories/mover.repository";
import { PrismaClient, EstimateStatus } from "@prisma/client";
import notificationService from "./notification.service";
import { BadRequestError, EstimateInput, NotFoundError } from "../types";
import authClientRepository from "../repositories/authClient.repository";
import { translateData } from "../utils/translation.util";
import prisma from "../configs/prisma.config";

// client 대기 중인 견적서 조회
async function getPendingEstimates(clientId: string, offset = 0, limit = 6, targetLang?: string) {
  const { estimates, totalCount } = await estimateRepository.findPendingEstimatesByClientId(
    clientId,
    offset,
    limit,
  );

  const results = await Promise.all(
    estimates.map(async (e) => {
      const designatedMoverIds = e.request.designatedRequests.map((d) => d.moverId);

      const isDesignated = designatedMoverIds.includes(e.moverId);
      const isFavorited = await estimateRepository.isFavoriteMover(clientId, e.moverId);

      return {
        estimate: {
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
        },
        request: {
          requestId: e.request.id,
          moveDate: e.request.moveDate,
          fromAddress: e.request.fromAddress,
          toAddress: e.request.toAddress,
          moveType: e.request.moveType,
        },
      };
    }),
  );

  const result = {
    data: results,
    totalCount,
  };

  // 번역이 필요한 경우 번역 수행
  if (targetLang) {
    return (await translateData(
      result,
      ["data.estimate.comment", "data.request.fromAddress", "data.request.toAddress"],
      targetLang,
    )) as typeof result;
  }

  return result;
}

// 견적 보내기 (기사)
async function createEstimate({ price, comment, moverId, clientId, requestId }: EstimateInput) {
  const result = await prisma.estimate.create({
    data: {
      price,
      comment,
      moverStatus: EstimateStatus.CONFIRMED,
      client: { connect: { id: clientId } },
      mover: { connect: { id: moverId } },
      request: { connect: { id: requestId } },
    },
    include: {
      request: true,
    },
  });

  // 견적 보내는 기사 이름 조회
  const mover = await moverRepository.fetchMoverDetail(moverId);

  // 새로운 견적 알림 (to 유저)
  await notificationService.notifyEstimate({
    clientId,
    moverName: mover!.nickName!,
    moveType: result.request.moveType,
    type: "NEW_ESTIMATE",
    targetId: result.id,
    targetUrl: `/my-quotes/client/${result.id}`,
  });

  return result;
}

// 견적 거절하기 (기사)
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

  // 견적 보낸 기사 조회
  const mover = await moverRepository.fetchMoverDetail(moverId);

  // 견적 반려 알림 (to 유저)
  await notificationService.notifyEstimateRejcted({
    userId: clientId,
    moverName: mover.nickName!,
    type: "ESTIMATE_REJECTED",
  });

  return newEstimate;
}

// 보낸 견적 조회
async function getPaginatedSentEstimates(moverId: string, page: number, targetLang?: string) {
  const result = await estimateRepository.getPaginatedSentEstimates(moverId, page);

  // 번역이 필요한 경우 번역 수행
  if (targetLang) {
    return (await translateData(
      result,
      ["data.comment", "data.request.fromAddress", "data.request.toAddress"],
      targetLang,
    )) as typeof result;
  }

  return result;
}

// 보낸 견적 상세 조회
async function findSentEstimateById(moverId: string, estimateId: string, targetLang?: string) {
  const result = await prisma.estimate.findFirst({
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
          designatedRequests: {
            select: {
              moverId: true,
            },
          },
        },
      },
    },
  });

  // 번역이 필요한 경우 번역 수행
  if (targetLang && result) {
    return (await translateData(
      result,
      ["request.fromAddress", "request.toAddress"],
      targetLang,
    )) as typeof result;
  }

  return result;
}

// 반려한 견적 조회
async function getRejectedEstimates(moverId: string, page: number, targetLang?: string) {
  const result = await estimateRepository.getRejectedEstimates(moverId, page);

  // 번역이 필요한 경우 번역 수행
  if (targetLang) {
    return (await translateData(
      result,
      ["data.comment", "data.request.fromAddress", "data.request.toAddress"],
      targetLang,
    )) as typeof result;
  }

  return result;
}

// client 받은 견적 조회
async function getReceivedEstimates(
  clientId: string,
  page: number,
  limit: number,
  category: "all" | "confirmed",
  targetLang?: string,
) {
  const { estimates, totalCount } = await estimateRepository.findReceivedEstimatesByClientId(
    clientId,
    page,
    limit,
    category,
  );

  const data = await Promise.all(
    estimates.map(async (e) => {
      const isFavorited = await estimateRepository.isFavoriteMover(clientId, e.mover.id);

      return {
        estimate: {
          estimateId: e.id,
          comment: e.comment,
          price: e.price,
          created: e.createdAt,
          moverId: e.mover.id,
          moverName: e.mover.name,
          moverNickName: e.mover.nickName,
          profileImage: e.mover.profileImage,
          reviewRating: e.mover.averageReviewRating,
          reviewCount: e.mover.reviewCount,
          career: e.mover.career,
          estimateCount: e.mover.estimateCount,
          favoriteCount: e.mover.favoriteCount,
          isConfirmed: e.moverStatus === "CONFIRMED" && e.isClientConfirmed,
          isFavorited,
        },
        request: {
          requestId: e.request.id,
          moveDate: e.request.moveDate,
          fromAddress: e.request.fromAddress,
          toAddress: e.request.toAddress,
          moveType: e.request.moveType,
          requestedAt: e.request.requestedAt,
          designatedRequest: e.request.designatedRequests,
        },
      };
    }),
  );

  const result = { data, totalCount };

  // 번역이 필요한 경우 번역 수행
  if (targetLang) {
    return (await translateData(
      result,
      ["data.estimate.comment", "data.request.fromAddress", "data.request.toAddress"],
      targetLang,
    )) as typeof result;
  }

  return result;
}

// client 견적 확정
async function confirmEstimate(estimateId: string, clientId: string) {
  const result = await prisma.$transaction(async (tx) => {
    // 견적 조회 및 검증
    const estimate = await estimateRepository.findEstimateById(tx, estimateId);
    if (!estimate) throw new BadRequestError("견적을 찾을 수 없습니다.");
    if (estimate.clientId !== clientId) throw new BadRequestError("권한이 없습니다.");
    if (estimate.isClientConfirmed) throw new BadRequestError("이미 확정된 견적입니다.");

    // 견적 확정
    await estimateRepository.updateEstimateConfirmed(tx, estimateId);

    // 기사님 estimateCount +1
    await estimateRepository.incrementMoverEstimateCount(tx, estimate.moverId);

    await estimateRepository.updateRequestPendingFalse(tx, estimate.request.id);

    return { estimateId, moverId: estimate.moverId };
  });

  // 견적 보낸 기사 조회
  const mover = await moverRepository.fetchMoverDetail(result.moverId);

  // 견적 확정 알림 (to 유저)
  await notificationService.notifyEstimateConfirmed({
    userId: clientId,
    moverName: mover.nickName!,
    type: "ESTIMATE_CONFIRMED",
    targetId: estimateId,
    targetUrl: `/my-quotes/client/${estimateId}`,
  });

  // 견적 요청한 유저 조회
  const client = await authClientRepository.findById(clientId);

  // 견적 확정 알림 (to 기사)
  await notificationService.notifyEstimateConfirmed({
    userId: result.moverId,
    clientName: client!.name!,
    type: "ESTIMATE_CONFIRMED",
    targetId: estimateId,
    targetUrl: `/my-quotes/mover/${estimateId}`,
  });

  return result;
}

// 견적 상세 조회
async function getEstimateDetail(estimateId: string, clientId: string) {
  const estimate = await estimateRepository.findEstimateDetailById(estimateId, clientId);

  if (!estimate) {
    throw new NotFoundError("견적을 찾을 수 없습니다.");
  }

  const requestId = estimate.request.id;

  // Request에 다른 확정된 견적이 있는지 조회
  const confirmedEstimate = await estimateRepository.findConfirmedEstimate(requestId);

  const isConfirmedByAnyone = !!confirmedEstimate;

  // 찜한 기사님 확인
  const isFavorite = await estimateRepository.isFavoriteMover(clientId, estimate.moverId);

  return {
    id: estimate.id,
    price: estimate.price,
    moverStatus: estimate.moverStatus,
    isClientConfirmed: estimate.isClientConfirmed,
    comment: estimate.comment,
    createdAt: estimate.createdAt,
    status: isConfirmedByAnyone ? "received" : "pending",
    request: estimate.request,
    mover: estimate.mover,
    isFavorite: !!isFavorite,
  };
}

// 견적 취소하기
async function deleteEstimate(estimateId: string, moverId: string) {
  const estimate = await estimateRepository.findById(estimateId);

  if (!estimate || estimate.moverId !== moverId) {
    return null;
  }

  // 확정된 견적은 삭제 불가
  if (estimate.isClientConfirmed) {
    return null;
  }

  // 상태가 CONFIRMED 또는 REJECTED인 경우만 삭제 허용
  if (!["CONFIRMED", "REJECTED"].includes(estimate.moverStatus)) {
    return null;
  }

  return await estimateRepository.deleteById(estimateId);
}

// 견적 상세 조회 (알림용)
async function getEstimateById(estimateId: string) {
  return await estimateRepository.findEstimate(estimateId);
}

export default {
  getPendingEstimates,
  createEstimate,
  findSentEstimateById,
  rejectEstimate,
  getPaginatedSentEstimates,
  getRejectedEstimates,
  getReceivedEstimates,
  getEstimateById,
  confirmEstimate,
  getEstimateDetail,
  deleteEstimate,
};
