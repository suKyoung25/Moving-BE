import express from 'express';
import moverController from '../controllers/mover.controller';
import { verifyAccessToken } from "../middlewares/auth.middleware";
const { getMovers, getMoverDetail, favoriteMover, unfavoriteMover, designateMover } = moverController;


const moverRouter = express.Router();

// 전체 기사님 리스트 조회 (비회원도 가능)
moverRouter.get('/', getMovers);

// 기사님 상세 정보
moverRouter.get('/:moverId', getMoverDetail);

// 기사님 찜하기
moverRouter.post('/:moverId/favorite', verifyAccessToken, favoriteMover);

// 찜 취소
moverRouter.delete('/:moverId/favorite', verifyAccessToken, unfavoriteMover);

// 기사님 지정 요청 (PATCH)
moverRouter.patch('/:moverId', verifyAccessToken, designateMover);

// 찜한 기사님 리스트 조회
//

export default moverRouter;
