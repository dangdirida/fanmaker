import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "이미 사용 중인 이메일입니다." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("[signup] Error:", error);
    return NextResponse.json(
      { success: false, error: "회원가입에 실패했습니다." },
      { status: 500 }
    );
  }
}
