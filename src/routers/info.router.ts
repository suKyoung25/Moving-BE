import { Router } from "express";

const infoRouter = Router();

infoRouter.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <title>Moving API</title>
        <style>
          body {
            font-family: sans-serif;
            padding: 1.5rem;
            line-height: 1.6;
            background: #f9f9f9;
            color: #333;
          }
          h1 {
            color: #2d3748;
          }
          a {
            color: #3182ce;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <h1>Moving API</h1>
        <p>이 서버는 코드잇 고급 프로젝트 4팀의 백엔드 API입니다.</p>
        <p>주요 엔드포인트:</p>
        <ul>
          <li><a href="/docs">/docs</a> - Swagger 문서</li>
          <li><a href="/auth">/auth</a> - 인증 라우터</li>
        </ul>
      </body>
    </html>
  `);
});

export default infoRouter;
