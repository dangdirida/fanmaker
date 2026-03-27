import { redirect } from "next/navigation";

export default function Home() {
  // next.config.mjs redirects가 우선 처리되지만, 폴백으로 유지
  redirect("/feed");
}
