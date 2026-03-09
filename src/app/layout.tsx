import type { Metadata } from "next";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "FanMaker — K-pop 팬 창작 플랫폼",
  description:
    "AI로 K-pop 아이돌 프로젝트를 직접 프로듀싱하고, 아티스트별 유니버스에서 커뮤니티와 공유하는 팬 참여형 창작 플랫폼",
  openGraph: {
    title: "FanMaker",
    description: "AI로 나만의 K-pop 콘텐츠를 만들어보세요",
    images: ["/og-thumbnail.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FanMaker",
    description: "AI로 나만의 K-pop 콘텐츠를 만들어보세요",
    images: ["/og-thumbnail.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn(geistSans.variable)}>
      <body className="antialiased bg-[#0a0a0a] text-white font-[family-name:var(--font-geist-sans)]">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
