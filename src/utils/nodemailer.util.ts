import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // smtp.gmail.com
  port: Number(process.env.SMTP_PORT), // 587
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 선택: 연결 확인
export async function sendVerificationEmail(to: string, token: string) {
  const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: to,
    subject: "[무빙] 이메일 인증을 해주세요!",
    html: `
      <div>
        <h2>무빙 회원가입</h2>
        <p>안녕하세요! 무빙에 가입해주셔서 감사합니다.</p>
        <p>아래의 링크를 클릭해 이메일 인증을 완료해 주세요. 이 링크는 <strong>15분</strong>간 유효합니다.</p>

        <a href="${verificationLink}" style="background-color: #1b92ff; color: white; text-decoration: none; padding: 10px; display: inline-block;"

        <p style="margin-top: 30px; font-size: 12px; color: #888;">만약 링크가 연결되지 않는다면, 아래의 주소를 복사해 브라우저에 붙여넣으세요.<br />${verificationLink}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`${to}로 인증 메일이 보내졌습니다.`);
  } catch (error) {
    console.error("인증 메일 발송에 실패했습니다.", error);
  }
}
