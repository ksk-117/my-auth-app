import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import zxcvbn from "zxcvbn";

interface SessionUser {
  user?: {
    email?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as SessionUser | null;
    if (!session?.user?.email) {
      return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    
    // バリデーション
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "必須項目が不足しています" }, { status: 400 });
    }

    // ユーザー取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ message: "ユーザーが見つかりません" }, { status: 404 });
    }

    // 現在のパスワード確認
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidCurrentPassword) {
      return NextResponse.json({ message: "現在のパスワードが正しくありません" }, { status: 400 });
    }

    // 新しいパスワード強度チェック
    const passwordStrength = zxcvbn(newPassword);
    if (passwordStrength.score < 2) {
      return NextResponse.json({ message: "新しいパスワードの強度が低すぎます" }, { status: 400 });
    }

    // パスワード更新
    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash }
    });

    return NextResponse.json({ message: "パスワードが正常に変更されました" });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ message: "サーバーエラーが発生しました" }, { status: 500 });
  }
} 