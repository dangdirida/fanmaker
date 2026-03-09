import { ActivityType, Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nickname: string | null;
      activityType: ActivityType;
      onboardingDone: boolean;
      role: Role;
      isPro: boolean;
    } & DefaultSession["user"];
  }
}
