import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "認証デモアプリ",
  description: "Next.js + NextAuth + Prisma 認証デモ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: "#f7f7f7", minHeight: "100vh" }}
      >
        <SessionProvider>
          <header style={{background:"#222",color:"#fff",padding:"1rem",textAlign:"center"}}>
            <h1 style={{margin:0,fontSize:"1.5rem"}}>Next.js 認証・認可デモアプリ</h1>
          </header>
          <main>{children}</main>
          <footer style={{background:"#222",color:"#fff",padding:"0.5rem",textAlign:"center",marginTop:"2rem"}}>
            <small>&copy; 2025 Auth Demo</small>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
