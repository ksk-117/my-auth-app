import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ available: false, message: "メールアドレスが必要です" });
    }

    // メール形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ available: false, message: "有効なメールアドレスを入力してください" });
    }

    // データベース接続確認
    try {
      await prisma.$connect();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json({ 
        available: false, 
        message: "データベース接続エラーが発生しました。環境変数を確認してください。" 
      }, { status: 500 });
    }

    // 重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ available: false, message: "このメールアドレスは既に使用されています" });
    }

    return NextResponse.json({ available: true, message: "このメールアドレスは使用可能です" });
  } catch (error) {
    console.error("Email check error:", error);
    return NextResponse.json({ 
      available: false, 
      message: `サーバーエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 