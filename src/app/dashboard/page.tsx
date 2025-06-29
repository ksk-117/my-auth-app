import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Session } from "next-auth";

// クライアントコンポーネントとして分離
const LogoutButton = () => {
  return (
    <button
      onClick={async () => {
        try {
          const { signOut } = await import("next-auth/react");
          signOut({ callbackUrl: "/" });
        } catch {
          window.location.href = "/";
        }
      }}
      style={{
        background: "#e74c3c",
        color: "white",
        border: "none",
        padding: "0.5rem 1rem",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "0.9rem"
      }}
    >
      ログアウト
    </button>
  );
};

const ChangePasswordForm = () => {
  return (
    <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h3>パスワード変更</h3>
      <p>パスワード変更機能は現在開発中です。</p>
    </div>
  );
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions) as Session | null;
  
  if (!session || !session.user?.email) {
    return (
      <div style={{textAlign:'center',marginTop:'2rem',background:'#fff',padding:'2rem',borderRadius:8,boxShadow:'0 2px 8px #0001'}}>
        <p>ログインが必要です。</p>
        <Link href="/login">ログインページへ</Link>
      </div>
    );
  }

  // ログイン履歴取得
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { loginHistories: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  return (
    <div style={{maxWidth:600,margin:"2rem auto",background:'#fff',padding:'2rem',borderRadius:8,boxShadow:'0 2px 8px #0001'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
        <h2>ダッシュボード</h2>
        <LogoutButton />
      </div>
      <p>ようこそ、{session.user.name || session.user.email} さん</p>
      <h3>直近のログイン履歴</h3>
      <table border={1} cellPadding={4} style={{width:"100%",background:'#fafafa'}}>
        <thead><tr><th>日時</th><th>IPアドレス</th></tr></thead>
        <tbody>
          {user?.loginHistories.map((h: { id: number; createdAt: Date; ip: string }) => (
            <tr key={h.id}><td>{h.createdAt.toLocaleString()}</td><td>{h.ip}</td></tr>
          ))}
        </tbody>
      </table>
      
      <ChangePasswordForm />
      
      <br />
      <Link href="/">トップへ戻る</Link>
    </div>
  );
}
