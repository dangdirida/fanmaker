"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function NewVirtualIdolInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const initialName = searchParams.get("memberName") || undefined;
    fetch("/api/virtual-idols", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initialName }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) router.replace(`/studio/virtual/${d.data.id}`);
        else router.replace("/studio/virtual");
      })
      .catch(() => router.replace("/studio/virtual"));
  }, [router, searchParams]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <p className="text-gray-500 text-sm">캐릭터 생성 중...</p>
      </div>
    </div>
  );
}

export default function NewVirtualIdolPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <NewVirtualIdolInner />
    </Suspense>
  );
}
