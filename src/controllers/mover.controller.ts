import { Request, Response, NextFunction } from 'express';
import moverRepository from '../repositories/mover.repository';

async function getMovers(req: Request, res: Response, next: NextFunction): Promise<void>{
  try {
    const clientId = req.user?.id;
    const result = await moverRepository.fetchMovers(clientId);
    res.status(200).json(result);
  } catch (error) {
    console.error('[GET /movers]', error);
    res.status(500).json({ message: '서버 오류 발생' });
  }
};

async function getMoverDetail(req: Request, res: Response, next: NextFunction): Promise<void>{
  try {
    const clientId = req.user?.id;
    const moverId = req.params.moverId;
    const result = await moverRepository.fetchMoverDetail(moverId, clientId);
    if (!result) {
      res.status(404).json({ message: '기사님을 찾을 수 없습니다.' });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error('[GET /movers/:moverId]', error);
    res.status(500).json({ message: '서버 오류 발생' });
  }
};

async function favoriteMover(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const clientId = req.user?.id;
    const moverId = req.params.moverId;

    if (!clientId) {
      res.status(401).json({ message: '인증 필요' });
      return; // <== 흐름 종료
    }

    if (!moverId) {
      res.status(400).json({ message: '잘못된 요청: moverId 없음' });
      return;
    }

    await moverRepository.addFavoriteMover(clientId, moverId);

    res.status(200).json({ message: '찜 성공' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ message: '이미 찜한 기사입니다.' });
      return;
    }

    console.error('[POST /movers/:moverId/favorite]', error);
    res.status(500).json({ message: '서버 오류 발생' });
  }
}

async function unfavoriteMover(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const clientId = req.user?.id;
    const moverId = req.params.moverId;

    if (!clientId) {
      res.status(401).json({ message: '인증 필요' });
      return;
    }

    if (!moverId) {
      res.status(400).json({ message: '잘못된 요청: moverId 없음' });
      return;
    }

    await moverRepository.removeFavoriteMover(clientId, moverId);
    res.status(200).json({ message: '찜 취소 성공' });
  } catch (error) {
    console.error('[DELETE /movers/:moverId/favorite]', error);
    res.status(500).json({ message: '서버 오류 발생' });
  }
}


async function designateMover(req: Request, res: Response, next: NextFunction): Promise<void>{
  try {
    const clientId = req.user?.id;
    const moverId = req.params.moverId;
    const { requestId } = req.body;

    if (!clientId || !requestId) {
      res.status(400).json({ message: '잘못된 요청' });
    }

    await moverRepository.designateMover(requestId, moverId);

    res.status(200).json({ message: '지정 성공' });
  } catch (error) {
    console.error('[PATCH /movers/:moverId]', error);
    res.status(500).json({ message: '서버 오류 발생' });
  }
};

const moverController = {
  getMovers,
  getMoverDetail,
  favoriteMover,
  unfavoriteMover,
  designateMover,
};

export default moverController;
