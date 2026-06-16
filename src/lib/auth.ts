import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { connectToDatabase } from "@/src/lib/mongodb";
import { serializeDoc } from "@/src/lib/serialize";
import { User } from "@/src/models/user";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "E-mail e senha",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;

        if (!email || !password) return null;

        await connectToDatabase();

        const user = await User.findOne({ email }).lean<{
          _id: unknown;
          name: string;
          email: string;
          passwordHash: string;
          role: "admin" | "viewer";
          status: "pending" | "approved" | "rejected";
        }>();

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = token.role as "admin" | "viewer";
        session.user.status = token.status as "pending" | "approved" | "rejected";
      }

      return session;
    }
  }
};

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const user = await User.findById(session.user.id)
    .select("-passwordHash")
    .lean();

  return user ? (serializeDoc(user) as AppUser) : null;
}

export async function requireApprovedUser() {
  const user = await getSessionUser();

  if (!user || user.status !== "approved") {
    return null;
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireApprovedUser();

  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
}

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "viewer";
  status: "pending" | "approved" | "rejected";
  approvedAt?: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
};
