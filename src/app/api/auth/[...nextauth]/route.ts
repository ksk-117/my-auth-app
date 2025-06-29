import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { addLoginHistory, checkAccountLock, incrementLoginAttempts, resetLoginAttempts } from "@/lib/auth-utils";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        // アカウントロック確認
        if (await checkAccountLock(user)) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          await incrementLoginAttempts(user);
          return null;
        }
        await resetLoginAttempts(user);
        await addLoginHistory(user, { headers: req.headers as Record<string, string | string[] | undefined>, socket: undefined });
        return { id: user.id + "", email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        session.user = {
          ...session.user,
          id: token.sub,
        } as typeof session.user & { id: string };
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  // CSPやその他セキュリティヘッダはmiddlewareで対応
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
