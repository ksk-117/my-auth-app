import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { addLoginHistory, checkAccountLock, incrementLoginAttempts, resetLoginAttempts } from "@/lib/auth-utils";
import type { Session } from "next-auth";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" as const },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          console.log("認証開始:", credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log("認証情報不足");
            return null;
          }
          
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!user) {
            console.log("ユーザーが見つかりません:", credentials.email);
            return null;
          }
          
          // アカウントロック確認
          if (await checkAccountLock(user)) {
            console.log("アカウントがロックされています:", credentials.email);
            return null;
          }
          
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            console.log("パスワードが無効:", credentials.email);
            await incrementLoginAttempts(user);
            return null;
          }
          
          console.log("認証成功:", credentials.email);
          await resetLoginAttempts(user);
          await addLoginHistory(user, { headers: req.headers as Record<string, string | string[] | undefined>, socket: undefined });
          
          return { 
            id: user.id.toString(), 
            email: user.email, 
            name: user.name 
          };
        } catch (error) {
          console.error("認証エラー:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // 型エラーを抑制しつつ、動作を優先
    async session(params: any) {
      const { session, token } = params;
      if (token?.sub) {
        session.user = {
          ...session.user,
          id: token.sub,
        };
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
