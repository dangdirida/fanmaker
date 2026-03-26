import type { Metadata } from "next";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import SessionProvider from "@/components/providers/SessionProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
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
    images: [{ url: "/og-thumbnail.png", width: 1200, height: 630, alt: "FanMaker - K-pop 팬 창작 플랫폼" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FanMaker",
    description: "AI로 나만의 K-pop 콘텐츠를 만들어보세요",
    images: [{ url: "/og-thumbnail.png", width: 1200, height: 630, alt: "FanMaker - K-pop 팬 창작 플랫폼" }],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/favicon.png", sizes: "32x32" }],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn(geistSans.variable)} suppressHydrationWarning>
      <body className="antialiased bg-white text-gray-900 dark:bg-[#0a0a0a] dark:text-white font-[family-name:var(--font-geist-sans)] transition-colors duration-200">
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
