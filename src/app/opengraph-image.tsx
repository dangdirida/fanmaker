import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "팬메이커 - 나만의 가상 K-pop 아이돌 창작 플랫폼";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a0512 60%, #0d0d0d 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 글로우 왼쪽 */}
        <div style={{
          position: "absolute",
          width: "700px", height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,61,127,0.2) 0%, transparent 65%)",
          left: "-200px", top: "-200px",
          display: "flex",
        }} />
        {/* 글로우 오른쪽 */}
        <div style={{
          position: "absolute",
          width: "500px", height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,61,127,0.1) 0%, transparent 65%)",
          right: "-100px", bottom: "-150px",
          display: "flex",
        }} />

        {/* 중앙 콘텐츠 */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "0px",
        }}>
          {/* 아이콘 */}
          <div style={{
            width: "88px", height: "88px",
            borderRadius: "22px",
            background: "rgba(255,61,127,0.18)",
            border: "1.5px solid rgba(255,61,127,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "28px",
          }}>
            <div style={{
              fontSize: "40px",
              display: "flex",
            }}>⚡</div>
          </div>

          {/* 타이틀 */}
          <div style={{
            fontSize: "96px",
            fontWeight: "900",
            color: "#ffffff",
            letterSpacing: "-4px",
            lineHeight: "1",
            marginBottom: "22px",
            display: "flex",
          }}>
            FanMaker
          </div>

          {/* 핑크 라인 */}
          <div style={{
            width: "72px", height: "4px",
            borderRadius: "2px",
            background: "#ff3d7f",
            marginBottom: "22px",
            display: "flex",
          }} />

          {/* 서브타이틀 */}
          <div style={{
            fontSize: "26px",
            color: "#999999",
            letterSpacing: "5px",
            marginBottom: "14px",
            display: "flex",
          }}>
            K-POP 팬 창작 플랫폼
          </div>

          {/* 설명 */}
          <div style={{
            fontSize: "19px",
            color: "#555555",
            display: "flex",
          }}>
            AI로 직접 프로듀싱하는 K-pop 팬 창작 커뮤니티
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
