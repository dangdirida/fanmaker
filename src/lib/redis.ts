import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// AI 생성 요청 Rate Limit: 무료 유저 10회/월
export const aiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "30 d"),
  analytics: true,
  prefix: "ratelimit:ai",
});
