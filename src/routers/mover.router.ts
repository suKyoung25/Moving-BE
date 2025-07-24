import express from 'express';
import { verifyAccessToken } from "../middlewares/auth.middleware";
import moverController from '../controllers/mover.controller';

const { 
  getMovers, 
  getMoverDetail, 
  toggleFavoriteMover,
  designateMover 
} = moverController;

const moverRouter = express.Router();

// 전체 기사님 리스트 조회 (비회원도 가능)
moverRouter.get('/', getMovers);

// 기사님 상세 정보
moverRouter.get('/:moverId', getMoverDetail);

// 기사님 찜 토글
moverRouter.post('/:moverId/toggle-favorite', verifyAccessToken, toggleFavoriteMover);

// 기사님 지정 요청 (PATCH)
moverRouter.patch('/:moverId', verifyAccessToken, designateMover);

export default moverRouter;