export default function Home() {
  return (
    <main
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        background: "#fff",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 8px #0001",
      }}
    >
      <h2>認証デモアプリへようこそ</h2>
      <ul style={{ fontSize: "1.1rem" }}>
        <li>
          <a href="/signup">サインアップ</a>（パスワード強度・確認UI付き）
        </li>
        <li>
          <a href="/login">ログイン</a>（アカウントロック機能あり）
        </li>
        <li>
          <a href="/dashboard">ダッシュボード（要ログイン、履歴表示）</a>
        </li>
      </ul>
      <p style={{ color: "#666" }}>
        セキュリティ対策：bcrypt, セキュアCookie, CSP, CSRF, アカウントロック等
      </p>
    </main>
  );
}
