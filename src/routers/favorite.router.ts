import { Router } from "express";
import favoriteController from "../controllers/favorite.controller";

const favoriteRouter = Router();

// 찜한 기사님 목록
favoriteRouter.get("/me", favoriteController.getFavoriteMovers);

export default favoriteRouter;
