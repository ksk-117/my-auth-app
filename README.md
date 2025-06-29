# Next.js 認証・認可デモアプリ

## アプリ概要
Next.js (App Router) + NextAuth.js + Prisma によるセッションベース認証のデモアプリです。

- セッションベース認証（NextAuth.js Credentials Provider）
- サインアップ/ログイン/ダッシュボード（認可）
- 追加機能：
  - ログイン失敗N回でアカウントロック
  - サインアップ時のパスワード確認UI
  - パスワード強度表示（zxcvbn）
  - ログイン履歴表示
- セキュリティ対策：bcrypt, セキュアCookie, CSP, CSRF

## 使用技術
- Next.js (App Router)
- NextAuth.js
- Prisma ORM + SQLite
- bcrypt
- zxcvbn

## 認証方式
- NextAuth.js Credentials Provider によるセッションベース認証
- パスワードはbcryptでハッシュ化し保存
- Cookie属性: HttpOnly, Secure, SameSite=Strict
- Content Security Policy (CSP) ヘッダをmiddlewareで付与

## 追加機能
- ログイン失敗5回で15分アカウントロック
- サインアップ時のパスワード確認UI・強度メーター
- ログイン履歴（直近10件）をダッシュボードで表示

## セキュリティ対策
- bcryptによるパスワードハッシュ化
- セキュアCookie（HttpOnly, Secure, SameSite=Strict）
- Content Security Policy (CSP) 設定
- CSRF/XSS対策（NextAuth.js, CSP）

## 画面イメージ
![signup](public/signup.png)
![login](public/login.png)
![dashboard](public/dashboard.png)

## ローカル動作手順
```bash
git clone <このリポジトリURL>
cd my-auth-app
npm install
npx prisma migrate dev --name init
npm run dev
```

## 備考
- mainブランチのみ評価対象
- 教材にない認証機能・セキュリティ対策を実装
- .env.local でDATABASE_URLを設定（例: sqlite）
