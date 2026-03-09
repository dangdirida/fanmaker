import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

const ALLOWED_TYPES: Record<string, { mimes: string[]; maxMB: number }> = {
  audio: { mimes: ["audio/mpeg", "audio/wav", "audio/aac", "audio/mp4"], maxMB: 50 },
  images: { mimes: ["image/jpeg", "image/png", "image/webp"], maxMB: 10 },
  videos: { mimes: ["video/mp4", "video/quicktime"], maxMB: 500 },
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const bucket = formData.get("bucket") as string;

  if (!file || !bucket) {
    return NextResponse.json(
      { success: false, error: "파일과 버킷을 지정해주세요" },
      { status: 400 }
    );
  }

  const config = ALLOWED_TYPES[bucket];
  if (!config) {
    return NextResponse.json(
      { success: false, error: "유효하지 않은 버킷입니다" },
      { status: 400 }
    );
  }

  // 파일 형식 검사
  if (!config.mimes.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: "UNSUPPORTED_FORMAT", message: "지원하지 않는 파일 형식입니다" },
      { status: 400 }
    );
  }

  // 파일 크기 검사
  const maxBytes = config.maxMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { success: false, error: "FILE_TOO_LARGE", message: `파일 크기는 ${config.maxMB}MB 이하여야 합니다` },
      { status: 400 }
    );
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${session.user.id}/${timestamp}_${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "UPLOAD_FAILED", message: "파일 업로드에 실패했습니다" },
      { status: 500 }
    );
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return NextResponse.json({
    success: true,
    data: { url: urlData.publicUrl, path: filePath, bucket },
  });
}
