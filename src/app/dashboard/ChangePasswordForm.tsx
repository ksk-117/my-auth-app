"use client";
import { useState } from "react";
import zxcvbn from "zxcvbn";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    setPasswordScore(zxcvbn(e.target.value).score);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("新しいパスワードが一致しません");
      return;
    }

    if (passwordScore < 2) {
      setError("パスワード強度が低すぎます");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setSuccess(data.message);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordScore(0);
      } else {
        setError(data.message || "パスワード変更に失敗しました");
      }
    } catch {
      setError("サーバーエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h3>パスワード変更</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>現在のパスワード<br />
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: "1rem" }}>
          <label>新しいパスワード<br />
            <input
              type="password"
              value={newPassword}
              onChange={handlePasswordChange}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </label>
          <PasswordStrengthMeter score={passwordScore} />
        </div>
        
        <div style={{ marginBottom: "1rem" }}>
          <label>新しいパスワード（確認）<br />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </label>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.5rem",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "変更中..." : "パスワード変更"}
        </button>
      </form>
      
      {error && <div style={{ color: "red", marginTop: "0.5rem" }}>{error}</div>}
      {success && <div style={{ color: "green", marginTop: "0.5rem" }}>{success}</div>}
    </div>
  );
}

function PasswordStrengthMeter({ score }: { score: number }) {
  const levels = ["弱い", "やや弱い", "普通", "強い", "とても強い"];
  const colors = ["#e74c3c", "#e67e22", "#f1c40f", "#27ae60", "#2ecc71"];
  
  return (
    <div style={{ margin: "0.5rem 0" }}>
      <progress max={4} value={score} style={{ width: "100%", accentColor: colors[score] }} />
      <div>パスワード強度: <span style={{ color: colors[score] }}>{levels[score]}</span></div>
    </div>
  );
} 