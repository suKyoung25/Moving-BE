import favoriteController from "../controllers/favorite.controller";
import { Router } from "express";
import { cacheMiddleware } from "../middlewares/cache.middleware";

const favoriteRouter = Router();

// 찜한 기사님 목록
favoriteRouter.get("/me", cacheMiddleware(), favoriteController.getFavoriteMovers);

export default favoriteRouter;
