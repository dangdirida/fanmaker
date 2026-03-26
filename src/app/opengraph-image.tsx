import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FanMaker - K-pop 팬 창작 플랫폼";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a0512 50%, #0a0a0a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 글로우 */}
        <div style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,61,127,0.25) 0%, transparent 70%)",
          left: "-100px",
          top: "-100px",
        }} />
        <div style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,61,127,0.15) 0%, transparent 70%)",
          right: "-50px",
          bottom: "-100px",
        }} />

        {/* 중앙 콘텐츠 */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "0px",
          zIndex: 10,
        }}>
          {/* 로고 아이콘 */}
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            background: "rgba(255,61,127,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
            border: "1px solid rgba(255,61,127,0.3)",
          }}>
            <svg width="40" height="40" viewBox="0 0 32 32">
              <path d="M18 4L10 18h7l-3 10 12-14h-8l4-10z" fill="#ff3d7f"/>
            </svg>
          </div>

          {/* 타이틀 */}
          <div style={{
            fontSize: "88px",
            fontWeight: "900",
            color: "#ffffff",
            letterSpacing: "-3px",
            lineHeight: "1",
            marginBottom: "20px",
          }}>
            FanMaker
          </div>

          {/* 핑크 라인 */}
          <div style={{
            width: "80px",
            height: "4px",
            borderRadius: "2px",
            background: "#ff3d7f",
            marginBottom: "24px",
          }} />

          {/* 서브타이틀 */}
          <div style={{
            fontSize: "28px",
            color: "#888888",
            letterSpacing: "4px",
            marginBottom: "16px",
          }}>
            K-POP 팬 창작 플랫폼
          </div>

          {/* 태그라인 */}
          <div style={{
            fontSize: "20px",
            color: "#555555",
          }}>
            AI로 직접 프로듀싱하는 K-pop 팬 창작 커뮤니티
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
