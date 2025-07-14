import prisma from '../configs/prisma.config';

async function fetchMovers(clientId?: string) {
  const movers = await prisma.mover.findMany({
    include: {
      favorites: clientId
        ? {
            where: { clientId },
            select: { id: true },
          }
        : false,
    },
    orderBy: { createdAt: 'desc' },
  });

  return movers.map((mover) => ({
    id: mover.id,
    nickName: mover.nickName,
    serviceType: mover.serviceType,
    career: mover.career,
    averageReviewRating: mover.averageReviewRating,
    reviewCount: mover.reviewCount,
    estimateCount: mover.estimateCount,
    profileImage: mover.profileImage,
    isFavorite: mover.favorites?.length > 0,
  }));
};

async function addFavoriteMover(clientId: string, moverId: string){
  return prisma.favorite.create({
    data: {
      clientId,
      moverId,
    },
  });
};

async function removeFavoriteMover(clientId: string, moverId: string){
  return prisma.favorite.deleteMany({
    where: {
      clientId,
      moverId,
    },
  });
};

async function fetchMoverDetail(moverId: string, clientId?: string) {
  const mover = await prisma.mover.findUnique({
    where: { id: moverId },
    include: {
      favorites: clientId
        ? {
            where: { clientId },
            select: { id: true },
          }
        : false,
        serviceArea: true,
    },
  });

  if (!mover) return null;

  return {
    id: mover.id,
    nickName: mover.nickName,
    name: mover.name,
    phone: mover.phone,
    profileImage: mover.profileImage,
    career: mover.career,
    serviceType: mover.serviceType,
    serviceArea: mover.serviceArea.map((region) => region.regionName),
    description: mover.description,
    averageReviewRating: mover.averageReviewRating,
    reviewCount: mover.reviewCount,
    estimateCount: mover.estimateCount,
    isFavorite: mover.favorites?.length > 0,
  };
}
async function designateMover(requestId: string, moverId: string) {
  return prisma.request.update({
    where: { id: requestId },
    data: {
      moverId,
      isDesignated: true,
      isPending: false,
    },
  });
}



const moverRepository = {
  fetchMovers,
  fetchMoverDetail,
  addFavoriteMover,
  removeFavoriteMover,
  designateMover,
};

export default moverRepository;