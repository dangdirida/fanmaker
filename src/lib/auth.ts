import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { ActivityType, Role } from "@prisma/client";

const providers = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    allowDangerousEmailAccountLinking: true,
  }),
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "이메일", type: "email" },
      password: { label: "비밀번호", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
      });

      if (!user || !user.password) return null;

      const isValid = await bcrypt.compare(
        credentials.password as string,
        user.password
      );

      if (!isValid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
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
      if (user) {
        token.id = user.id;
      }
      // 세션 업데이트 시 DB에서 최신 정보 가져오기
      if (trigger === "update" || !token.nickname) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            nickname: true,
            onboardingDone: true,
            role: true,
            isPro: true,
            image: true,
            activityType: true,
          },
        });
        if (dbUser) {
          token.nickname = dbUser.nickname;
          token.onboardingDone = dbUser.onboardingDone;
          token.role = dbUser.role;
          token.isPro = dbUser.isPro;
          token.image = dbUser.image;
          token.activityType = dbUser.activityType;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.nickname = token.nickname as string | null;
        session.user.activityType = token.activityType as ActivityType;
        session.user.onboardingDone = token.onboardingDone as boolean;
        session.user.role = token.role as Role;
        session.user.isPro = token.isPro as boolean;
        session.user.image = token.image as string | null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
});
