import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import zxcvbn from "zxcvbn";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    
    // バリデーション
    if (!email || !password) {
      return NextResponse.json({ message: "必須項目が不足しています" }, { status: 400 });
    }
    
    // メール形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "有効なメールアドレスを入力してください" }, { status: 400 });
    }
    
    // パスワード強度チェック
    const passwordStrength = zxcvbn(password);
    if (passwordStrength.score < 2) {
      return NextResponse.json({ message: "パスワード強度が低すぎます" }, { status: 400 });
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
        name: name || null,
      },
    });
    
    return NextResponse.json({ message: "サインアップ成功" });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
