"use client";
import { useState, useEffect } from "react";
import zxcvbn from "zxcvbn";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"checking" | "available" | "unavailable" | "invalid" | null>(null);
  const [emailMessage, setEmailMessage] = useState("");

  // メールアドレス重複チェック（デバウンス付き）
  useEffect(() => {
    if (!email) {
      setEmailStatus(null);
      setEmailMessage("");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailStatus("invalid");
      setEmailMessage("有効なメールアドレスを入力してください");
      return;
    }

    setEmailStatus("checking");
    setEmailMessage("チェック中...");

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        
        if (data.available) {
          setEmailStatus("available");
          setEmailMessage(data.message);
        } else {
          setEmailStatus("unavailable");
          setEmailMessage(data.message);
        }
      } catch {
        setEmailStatus("invalid");
        setEmailMessage("チェック中にエラーが発生しました");
      }
    }, 500); // 500msのデバウンス

    return () => clearTimeout(timeoutId);
  }, [email]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordScore(zxcvbn(e.target.value).score);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (emailStatus !== "available") {
      setError("有効なメールアドレスを入力してください");
      return;
    }
    
    if (password !== passwordConfirm) {
      setError("パスワードが一致しません");
      return;
    }
    if (passwordScore < 2) {
      setError("パスワード強度が低すぎます");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess("サインアップ成功！ログインしてください。");
      setEmail(""); setPassword(""); setPasswordConfirm(""); setPasswordScore(0);
      setEmailStatus(null); setEmailMessage("");
    } else {
      const data = await res.json();
      setError(data.message || "サインアップ失敗");
    }
  };

  const getEmailStatusColor = () => {
    switch (emailStatus) {
      case "available": return "green";
      case "unavailable": return "red";
      case "invalid": return "orange";
      case "checking": return "blue";
      default: return "black";
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", background: "#fff", padding: "2rem", borderRadius: 8, boxShadow: "0 2px 8px #0001" }}>
      <h2>サインアップ</h2>
      <form onSubmit={handleSubmit}>
        <label>Email<br />
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={{width:"100%"}} 
          />
        </label>
        {emailMessage && (
          <div style={{ color: getEmailStatusColor(), fontSize: "0.9rem", marginTop: "0.25rem" }}>
            {emailMessage}
          </div>
        )}
        <br /><br />
        <label>パスワード<br />
          <input type="password" value={password} onChange={handlePasswordChange} required style={{width:"100%"}} />
        </label>
        <PasswordStrengthMeter score={passwordScore} />
        <label>パスワード（確認）<br />
          <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required style={{width:"100%"}} />
        </label><br /><br />
        <button type="submit" disabled={loading || emailStatus !== "available"} style={{width:"100%"}}>
          {loading ? "サインアップ中..." : "サインアップ"}
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: "green", marginTop: 8 }}>{success} <Link href="/login">ログイン</Link></div>}
      <div style={{marginTop:16}}><Link href="/login">ログインはこちら</Link></div>
    </div>
  );
}

function PasswordStrengthMeter({ score }: { score: number }) {
  const levels = ["弱い", "やや弱い", "普通", "強い", "とても強い"];
  const colors = ["#e74c3c","#e67e22","#f1c40f","#27ae60","#2ecc71"];
  return (
    <div style={{ margin: "0.5rem 0" }}>
      <progress max={4} value={score} style={{ width: "100%", accentColor: colors[score] }} />
      <div>パスワード強度: <span style={{color:colors[score]}}>{levels[score]}</span></div>
    </div>
  );
}
