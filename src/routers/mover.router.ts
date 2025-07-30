import express from 'express';
import { verifyAccessToken, optionalAuth } from "../middlewares/auth.middleware";
import moverController from '../controllers/mover.controller';

const { 
  getMovers, 
  getMoverDetail, 
  toggleFavoriteMover,
  getMoverProfile,
} = moverController;

const moverRouter = express.Router();

// 전체 기사님 리스트 조회 (비회원도 가능)
moverRouter.get('/', optionalAuth, getMovers);

// 기사님 본인 프로필 조회
moverRouter.get('/profile', verifyAccessToken, getMoverProfile);

// 기사님 상세 정보
moverRouter.get('/:moverId', optionalAuth, getMoverDetail);

// 기사님 찜 토글
moverRouter.post('/:moverId/toggle-favorite', verifyAccessToken, toggleFavoriteMover);

export default moverRouter;