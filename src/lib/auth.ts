import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // 최초 로그인 시 user 정보를 token에 저장
      if (user) {
        token.id = user.id;
      }

      // 세션 업데이트 또는 정보 미설정 시 DB에서 가져오기
      if (trigger === "update" || (token.id && !token.nickname)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            nickname: true,
            activityType: true,
            onboardingDone: true,
            role: true,
            isPro: true,
            image: true,
          },
        });

        if (dbUser) {
          token.nickname = dbUser.nickname;
          token.activityType = dbUser.activityType;
          token.onboardingDone = dbUser.onboardingDone;
          token.role = dbUser.role;
          token.isPro = dbUser.isPro;
          token.picture = dbUser.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.nickname = token.nickname as string | null;
        session.user.activityType = token.activityType as any;
        session.user.onboardingDone = token.onboardingDone as boolean;
        session.user.role = token.role as any;
        session.user.isPro = token.isPro as boolean;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
  },
});
