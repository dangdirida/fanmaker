import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "FanMaker <noreply@fanmaker.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// 공통 이메일 레이아웃
function emailLayout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <!-- 로고 -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:28px;font-weight:bold;background:linear-gradient(90deg,#ff3d7f,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">FanMaker</span>
    </div>
    <!-- 콘텐츠 -->
    <div style="background-color:#1a1a1a;border-radius:16px;padding:32px;border:1px solid #2a2a2a;">
      ${content}
    </div>
    <!-- 푸터 -->
    <div style="text-align:center;margin-top:24px;color:#666;font-size:12px;">
      <p>이 메일은 FanMaker에서 발송되었습니다.</p>
    </div>
  </div>
</body>
</html>`;
}

function buttonHtml(text: string, url: string) {
  return `<a href="${url}" style="display:inline-block;background-color:#ff3d7f;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:10px;margin-top:16px;">${text}</a>`;
}

// 1. 가입 환영 이메일
export async function sendWelcomeEmail(to: string, nickname: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `팬메이커에 오신 걸 환영해요, ${nickname}님! 🎤`,
      html: emailLayout(`
        <h2 style="color:#ffffff;margin:0 0 12px;font-size:20px;">환영해요, ${nickname}님!</h2>
        <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0 0 8px;">
          팬메이커에서 AI로 나만의 K-pop 콘텐츠를 만들어보세요.
        </p>
        <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0 0 20px;">
          리믹스, 버추얼 아이돌, 컨셉 디자인, 퍼포먼스 기획까지<br/>
          당신의 창작이 시작됩니다.
        </p>
        <div style="text-align:center;">
          ${buttonHtml("창작 시작하기", `${APP_URL}/studio`)}
        </div>
      `),
    });
  } catch (error) {
    console.error("환영 이메일 발송 실패:", error);
  }
}

// 2. 반응 알림 이메일
export async function sendReactionNotificationEmail(
  to: string,
  nickname: string,
  postTitle: string,
  reactionCount: number
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `내 창작물에 ${reactionCount}개의 반응이 달렸어요 ✨`,
      html: emailLayout(`
        <h2 style="color:#ffffff;margin:0 0 12px;font-size:20px;">${nickname}님, 축하해요!</h2>
        <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0 0 8px;">
          <strong style="color:#ff3d7f;">"${postTitle}"</strong>에
          ${reactionCount}개의 반응이 달렸어요.
        </p>
        <div style="text-align:center;">
          ${buttonHtml("확인하기", `${APP_URL}/feed`)}
        </div>
      `),
    });
  } catch (error) {
    console.error("반응 알림 이메일 발송 실패:", error);
  }
}

// 3. 댓글 알림 이메일
export async function sendCommentNotificationEmail(
  to: string,
  nickname: string,
  postTitle: string,
  commenterNickname: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${commenterNickname}님이 내 창작물에 댓글을 남겼어요 💬`,
      html: emailLayout(`
        <h2 style="color:#ffffff;margin:0 0 12px;font-size:20px;">${nickname}님, 새 댓글이에요!</h2>
        <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0 0 8px;">
          <strong style="color:#c084fc;">${commenterNickname}</strong>님이
          <strong style="color:#ff3d7f;">"${postTitle}"</strong>에 댓글을 남겼어요.
        </p>
        <div style="text-align:center;">
          ${buttonHtml("댓글 보기", `${APP_URL}/feed`)}
        </div>
      `),
    });
  } catch (error) {
    console.error("댓글 알림 이메일 발송 실패:", error);
  }
}
