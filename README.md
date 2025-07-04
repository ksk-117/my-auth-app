（最終調整前です）
# Next.js セキュア認証デモアプリ
Next.js + NextAuth + Prisma を使用した、セキュリティ機能を重視した認証システムのデモアプリケーション。

## 💡 こだわり機能ポイント

1. **🔒 連続N回のログイン失敗でアカウントロック機能**
   - 5回失敗で15分間アカウントロック
   - ログイン試行回数の追跡
   - ロック解除の自動化

2. **✅ サインアップ時の確認用パスワード要求UI機能**
   - パスワード確認フィールド
   - リアルタイム一致チェック
   - 視覚的フィードバック

3. **📊 パスワード強度表示機能**
   - zxcvbnライブラリによる強度評価
   - 5段階の強度レベル表示
   - カラーコーディング付きプログレスバー

4. **🔄 パスワード変更機能**
   - 現在のパスワード確認
   - 新しいパスワード強度チェック
   - セキュアな変更プロセス

5. **📧 メールアドレスリアルタイム重複チェック機能**
   - デバウンス付きリアルタイムチェック
   - メール形式バリデーション
   - 視覚的ステータス表示

6. **📈 ログイン履歴表示機能**
   - IPアドレス記録
   - ログイン日時履歴
   - 直近10件の表示

## 🔐 セキュリティ機能

### 認証・認可
- **NextAuth.js** によるセッションベース認証
- **bcrypt** によるパスワードハッシュ化（salt rounds: 12）
- **セキュアCookie設定**（HttpOnly, Secure, SameSite=Strict）
- **JWT** によるセッション管理

### セキュリティヘッダー
- **Content Security Policy (CSP)** の実装
- **X-Frame-Options: DENY** によるクリックジャッキング対策
- **X-Content-Type-Options: nosniff** によるMIME型スニッフィング対策
- **Referrer-Policy: strict-origin-when-cross-origin**
- **Permissions-Policy** による権限制限
- **HSTS** によるHTTPS強制（本番環境）

### 攻撃対策
- **アカウントロック機能**によるブルートフォース攻撃対策
- **パスワード強度チェック**による弱いパスワード対策
- **入力バリデーション**によるXSS・インジェクション対策
- **CSRF対策**（NextAuth.js内蔵）

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 15.3.4 (App Router)
- **認証**: NextAuth.js 4.24.11
- **データベース**: Prisma ORM + SQLite
- **パスワード**: bcrypt + zxcvbn
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **セキュリティ**: カスタムセキュリティヘッダー

## 📁 プロジェクト構造

```
src/
├── app/
│   ├── api/auth/
│   │   ├── [...nextauth]/route.ts    # NextAuth設定
│   │   ├── signup/route.ts           # サインアップAPI
│   │   ├── change-password/route.ts  # パスワード変更API
│   │   └── check-email/route.ts      # メール重複チェックAPI
│   ├── dashboard/
│   │   ├── page.tsx                  # ダッシュボード
│   │   ├── LogoutButton.tsx          # ログアウトボタン
│   │   └── ChangePasswordForm.tsx    # パスワード変更フォーム
│   ├── login/page.tsx                # ログインページ
│   ├── signup/page.tsx               # サインアップページ
│   └── layout.tsx                    # レイアウト
├── lib/
│   ├── auth-utils.ts                 # 認証ユーティリティ
│   └── prisma.ts                     # Prisma設定
├── types/
│   └── next-auth.d.ts                # NextAuth型定義
└── middleware.ts                     # セキュリティヘッダー
```

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`env.example` を参考に `.env.local` ファイルを作成：

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# その他の設定
NODE_ENV="development"
```

### 3. データベースのセットアップ

```bash
npx prisma generate
npx prisma db push
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で起動

## 📸 画面イメージ

### サインアップ画面
- メールアドレスリアルタイム重複チェック
- パスワード強度メーター
- パスワード確認フィールド

### ログイン画面
- アカウントロック機能
- エラーメッセージ表示

### ダッシュボード
- ログイン履歴表示
- パスワード変更機能
- ログアウト機能

## 🔧 使用方法

1. **サインアップ**: `/signup` でアカウント作成
   - メールアドレスの重複チェック
   - パスワード強度確認
   - パスワード確認入力

2. **ログイン**: `/login` でログイン
   - アカウントロック機能
   - セキュアな認証

3. **ダッシュボード**: `/dashboard` で管理
   - ログイン履歴確認
   - パスワード変更
   - ログアウト

## 🛡️ セキュリティ考慮事項

### 本番環境での設定
- **HTTPS** の強制使用
- **強力なNEXTAUTH_SECRET** の設定
- **適切なデータベース接続** の設定
- **定期的なセキュリティアップデート**

### 実装されたセキュリティ機能
- **パスワードハッシュ化**: bcrypt（salt rounds: 12）
- **セッション管理**: セキュアCookie
- **入力検証**: サーバーサイド・クライアントサイド両方
- **エラーハンドリング**: 情報漏洩を防ぐ適切なエラーメッセージ
- **ログ記録**: セキュリティイベントの追跡

## 📝 ライセンス

MIT License

---

