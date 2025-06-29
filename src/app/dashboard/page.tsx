import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
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
      <h2>ダッシュボード</h2>
      <p>ようこそ、{session.user.email} さん</p>
      <h3>直近のログイン履歴</h3>
      <table border={1} cellPadding={4} style={{width:"100%",background:'#fafafa'}}>
        <thead><tr><th>日時</th><th>IPアドレス</th></tr></thead>
        <tbody>
          {user?.loginHistories.map((h: { id: number; createdAt: Date; ip: string }) => (
            <tr key={h.id}><td>{h.createdAt.toLocaleString()}</td><td>{h.ip}</td></tr>
          ))}
        </tbody>
      </table>
      <br />
      <Link href="/">トップへ戻る</Link>
    </div>
  );
}
