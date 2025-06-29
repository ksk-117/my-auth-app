import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface SessionUser {
  user?: {
    email?: string;
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as SessionUser | null;
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email || email !== session.user.email) {
      return NextResponse.json({ message: "権限がありません" }, { status: 403 });
    }

    // ユーザーとログイン履歴を取得
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        loginHistories: { 
          orderBy: { createdAt: "desc" }, 
          take: 10 
        } 
      },
    });

    if (!user) {
      return NextResponse.json({ message: "ユーザーが見つかりません" }, { status: 404 });
    }

    return NextResponse.json({
      loginHistories: user.loginHistories.map(h => ({
        id: h.id,
        createdAt: h.createdAt.toISOString(),
        ip: h.ip
      }))
    });
  } catch (error) {
    console.error("User data fetch error:", error);
    return NextResponse.json({ message: "サーバーエラーが発生しました" }, { status: 500 });
  }
} 