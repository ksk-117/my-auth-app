"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("ログイン失敗またはアカウントがロックされています");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>ログイン</h2>
      <form onSubmit={handleSubmit}>
        <label>Email<br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label><br /><br />
        <label>パスワード<br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label><br /><br />
        <button type="submit" disabled={loading}>ログイン</button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
