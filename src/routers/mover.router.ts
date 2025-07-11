import express from 'express';
import { getMovers } from '../controllers/mover.controller';
import { authenticate } from '../middlewares/test_auth.middleware';

const moverRouter = express.Router();

// 비회원


// 회원
// 기사님 리스트 조회
// 인증 optional: 회원이면 req.user 제공, 비회원도 접근 가능
moverRouter.get('/', authenticate.optional, getMovers);

//기사님 정보 상세 조회
moverRouter.get('/:moverId', authenticate.optional, getMovers);

// 기사님 찜하기
moverRouter.post('/:moverId/favorite', authenticate.optional, getMovers);

// 기사님 찜 취소하기
moverRouter.delete('/:moverId/favorite', authenticate.optional, getMovers);

// 기사님 지정 요청
moverRouter.patch('/:moverId', authenticate.optional, getMovers);

// 찜한 기사님 리스트 조회
moverRouter.get('/favorite/me', authenticate.optional, getMovers);

export default moverRouter;
