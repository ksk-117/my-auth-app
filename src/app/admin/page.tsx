import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface SessionUser {
  user?: {
    email?: string;
  };
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions) as SessionUser | null;
  
  // 管理者チェック（例：特定のメールアドレス）
  if (!session?.user?.email || session.user.email !== "admin@example.com") {
    return (
      <div style={{textAlign:'center',marginTop:'2rem',background:'#fff',padding:'2rem',borderRadius:8,boxShadow:'0 2px 8px #0001'}}>
        <p>管理者権限が必要です。</p>
        <Link href="/">トップへ戻る</Link>
      </div>
    );
  }

  // 全ユーザー取得
  const users = await prisma.user.findMany({
    include: {
      loginHistories: {
        orderBy: { createdAt: "desc" },
        take: 5
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div style={{maxWidth:800,margin:"2rem auto",background:'#fff',padding:'2rem',borderRadius:8,boxShadow:'0 2px 8px #0001'}}>
      <h2>管理者ダッシュボード</h2>
      <p>登録ユーザー数: {users.length}</p>
      
      <h3>ユーザー一覧</h3>
      <table border={1} cellPadding={4} style={{width:"100%",background:'#fafafa'}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>メールアドレス</th>
            <th>名前</th>
            <th>登録日</th>
            <th>ログイン試行回数</th>
            <th>ロック状態</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.name || "-"}</td>
              <td>{user.createdAt.toLocaleDateString()}</td>
              <td>{user.loginAttempts}</td>
              <td>
                {user.lockedUntil && new Date() < user.lockedUntil 
                  ? `ロック中 (${user.lockedUntil.toLocaleString()})` 
                  : "正常"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <br />
      <Link href="/">トップへ戻る</Link>
    </div>
  );
} 