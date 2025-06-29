"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDebugInfo("");
    setLoading(true);
    
    console.log("ログイン試行:", { email, password: "***" });
    
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    
    console.log("ログイン結果:", res);
    setDebugInfo(`ログイン結果: ${JSON.stringify(res, null, 2)}`);
    
    setLoading(false);
    if (res?.ok) {
      console.log("ログイン成功、ダッシュボードにリダイレクト");
      router.push("/dashboard");
    } else {
      console.log("ログイン失敗:", res?.error);
      setError(`ログイン失敗: ${res?.error || "不明なエラー"}`);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", background: "#fff", padding: "2rem", borderRadius: 8, boxShadow: "0 2px 8px #0001" }}>
      <h2>ログイン</h2>
      <form onSubmit={handleSubmit}>
        <label>Email<br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{width:"100%"}} />
        </label><br /><br />
        <label>パスワード<br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{width:"100%"}} />
        </label><br /><br />
        <button type="submit" disabled={loading} style={{width:"100%"}}>
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      {debugInfo && (
        <div style={{ marginTop: 8, padding: "0.5rem", background: "#f0f0f0", fontSize: "0.8rem", whiteSpace: "pre-wrap" }}>
          <strong>デバッグ情報:</strong><br />
          {debugInfo}
        </div>
      )}
      <div style={{marginTop:16}}><Link href="/signup">サインアップはこちら</Link></div>
    </div>
  );
}
