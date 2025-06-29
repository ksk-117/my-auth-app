import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ message: "必須項目が不足しています" }, { status: 400 });
  }
  // メール重複チェック
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ message: "このメールアドレスは既に登録されています" }, { status: 400 });
  }
  // パスワードハッシュ化
  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      password: hash,
    },
  });
  return NextResponse.json({ message: "サインアップ成功" });
}
