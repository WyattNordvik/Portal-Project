// src/pages/api/auth/[...nextauth].ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { authOptions } from "@/lib/auth-options"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Email + Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds) return null;
        const user = await prisma.user.findUnique({ where: { email: creds.email } });
        if (user && await verifyPassword(creds.password, user.passwordHash)) {
          return { id: user.id, email: user.email, name: user.name };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
	  // Persist the user.id into the token right after sign in
	  async jwt({ token, user }) {
		  if (user) token.id = (user as any).id;
		  return token;
	  },
	  async session({ session, token }) {
		  if (session.user) {
			  session.user.id = token.id as string;
		  }
		  return session;
		},
	},
};

export default NextAuth(authOptions);

