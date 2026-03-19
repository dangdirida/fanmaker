import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
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
    async jwt({ token, user, trigger, account }) {
      // 최초 로그인 시 user 정보를 token에 저장
      if (user) {
        token.id = user.id;
        token.sub = user.id;
      }

      // token.sub 폴백 (v5에서는 sub에 user ID가 들어감)
      const userId = (token.id as string) || token.sub;
      if (!userId) return token;

      // 최초 로그인, 세션 업데이트, 또는 DB 정보 미설정 시 DB에서 가져오기
      if (
        account ||
        trigger === "update" ||
        trigger === "signIn" ||
        token.onboardingDone === undefined
      ) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
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
            token.id = dbUser.id;
            token.nickname = dbUser.nickname;
            token.activityType = dbUser.activityType;
            token.onboardingDone = dbUser.onboardingDone;
            token.role = dbUser.role;
            token.isPro = dbUser.isPro;
            token.picture = dbUser.image;
          }
        } catch (e) {
          console.error("[auth] jwt callback DB error:", e);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        const userId = (token.id as string) || token.sub;
        session.user.id = userId!;
        session.user.nickname = (token.nickname as string | null) ?? null;
        session.user.activityType = token.activityType as any;
        session.user.onboardingDone = (token.onboardingDone as boolean) ?? false;
        session.user.role = (token.role as any) ?? "USER";
        session.user.isPro = (token.isPro as boolean) ?? false;
        session.user.image = (token.picture as string | null) ?? null;
      }
      return session;
    },
  },
});
