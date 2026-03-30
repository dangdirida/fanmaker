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
  title: "팬메이커 — 나만의 가상 K-pop 아이돌 창작 플랫폼",
  description:
    "나만의 가상 K-pop 아이돌을 만들고 공유하는 창작 플랫폼",
  openGraph: {
    title: "팬메이커",
    description: "나만의 가상 K-pop 아이돌을 만들고 공유하는 창작 플랫폼",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "팬메이커",
    description: "나만의 가상 K-pop 아이돌을 만들고 공유하는 창작 플랫폼",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn(geistSans.variable)} suppressHydrationWarning>
      <body className="antialiased bg-white text-gray-900 dark:bg-[#0a0a0a] dark:text-white font-sans transition-colors duration-200">
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
