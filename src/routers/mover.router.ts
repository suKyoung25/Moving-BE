import express from 'express';
import { verifyAccessToken } from "../middlewares/auth.middleware";
import moverController from '../controllers/mover.controller';

const { 
  getMovers, 
  getMoverDetail, 
  toggleFavoriteMover,
  favoriteMover, 
  unfavoriteMover, 
  designateMover 
} = moverController;

const moverRouter = express.Router();

// 전체 기사님 리스트 조회 (비회원도 가능)
moverRouter.get('/', getMovers);

// 기사님 상세 정보
moverRouter.get('/:moverId', getMoverDetail);

// 기사님 찜 토글 (추천: 새로운 방식)
moverRouter.post('/:moverId/toggle-favorite', verifyAccessToken, toggleFavoriteMover);

// 기사님 찜하기 (레거시: 기존 호환성)
moverRouter.post('/:moverId/favorite', verifyAccessToken, favoriteMover);

// 찜 취소 (레거시: 기존 호환성)
moverRouter.delete('/:moverId/favorite', verifyAccessToken, unfavoriteMover);

// 기사님 지정 요청 (PATCH)
moverRouter.patch('/:moverId', verifyAccessToken, designateMover);

export default moverRouter;