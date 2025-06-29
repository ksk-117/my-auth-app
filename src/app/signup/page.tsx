"use client";
import { useState } from "react";
import zxcvbn from "zxcvbn";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordScore(zxcvbn(e.target.value).score);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
    } else {
      const data = await res.json();
      setError(data.message || "サインアップ失敗");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>サインアップ</h2>
      <form onSubmit={handleSubmit}>
        <label>Email<br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label><br /><br />
        <label>パスワード<br />
          <input type="password" value={password} onChange={handlePasswordChange} required />
        </label>
        <PasswordStrengthMeter score={passwordScore} />
        <label>パスワード（確認）<br />
          <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required />
        </label><br /><br />
        <button type="submit" disabled={loading}>サインアップ</button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}
    </div>
  );
}

function PasswordStrengthMeter({ score }: { score: number }) {
  const levels = ["弱い", "やや弱い", "普通", "強い", "とても強い"];
  return (
    <div style={{ margin: "0.5rem 0" }}>
      <progress max={4} value={score} style={{ width: "100%" }} />
      <div>パスワード強度: {levels[score]}</div>
    </div>
  );
}
