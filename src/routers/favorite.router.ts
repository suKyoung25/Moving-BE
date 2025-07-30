import favoriteController from "@/controllers/favorite.controller";
import { Router } from "express";

const favoriteRouter = Router();

// 찜한 기사님 목록
favoriteRouter.get("/me", favoriteController.getFavoriteMovers);

export default favoriteRouter;
