"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ChangePasswordForm from "./ChangePasswordForm";

interface LoginHistory {
  id: number;
  createdAt: string;
  ip: string;
}

interface UserData {
  loginHistories: LoginHistory[];
}

// クライアントコンポーネントとして分離
const LogoutButton = () => {
  return (
    <button
      onClick={async () => {
        try {
          await signOut({ callbackUrl: "/" });
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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user?.email) {
      router.push("/login");
      return;
    }

    // ユーザーデータを取得
    const fetchUserData = async () => {
      try {
        if (session?.user?.email) {
          const res = await fetch(`/api/user/data?email=${session.user.email}`);
          if (res.ok) {
            const data = await res.json();
            setUserData(data);
          }
        }
      } catch (error) {
        console.error("ユーザーデータ取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div style={{textAlign:'center',marginTop:'2rem',background:'#fff',padding:'2rem',borderRadius:8,boxShadow:'0 2px 8px #0001'}}>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!session?.user?.email) {
    return (
      <div style={{textAlign:'center',marginTop:'2rem',background:'#fff',padding:'2rem',borderRadius:8,boxShadow:'0 2px 8px #0001'}}>
        <p>ログインが必要です。</p>
        <Link href="/login">ログインページへ</Link>
      </div>
    );
  }

  return (
    <div style={{maxWidth:600,margin:"2rem auto",background:'#fff',padding:'2rem',borderRadius:8,boxShadow:'0 2px 8px #0001'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
        <h2>ダッシュボード</h2>
        <LogoutButton />
      </div>
      <p>ようこそ、{session.user.name || session.user.email} さん</p>
      <h3>直近のログイン履歴</h3>
      {userData?.loginHistories ? (
        <table border={1} cellPadding={4} style={{width:"100%",background:'#fafafa'}}>
          <thead><tr><th>日時</th><th>IPアドレス</th></tr></thead>
          <tbody>
            {userData.loginHistories.map((h: LoginHistory) => (
              <tr key={h.id}>
                <td>{new Date(h.createdAt).toLocaleString()}</td>
                <td>{h.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>ログイン履歴を読み込み中...</p>
      )}
      
      <ChangePasswordForm />
      
      <br />
      <Link href="/">トップへ戻る</Link>
    </div>
  );
}
