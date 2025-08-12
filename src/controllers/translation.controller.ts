import { Request, Response } from "express";
import translationService from "../services/translation.service";

export async function translate(req: Request, res: Response) {
  try {
    const { text, targetLang } = req.body;
    if (!text || !targetLang) {
      return res.status(400).json({ message: "text와 targetLang을 모두 입력해야 합니다." });
    }

    const translatedText = await translationService.translateText(text, targetLang);
    res.json({ translatedText });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    });
  }
}
