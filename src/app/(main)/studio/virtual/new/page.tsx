"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewVirtualIdolPage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/virtual-idols", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) router.replace(`/studio/virtual/${d.data.id}`);
        else router.replace("/studio/virtual");
      })
      .catch(() => router.replace("/studio/virtual"));
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <p className="text-gray-500 text-sm">캐릭터 생성 중...</p>
      </div>
    </div>
  );
}
