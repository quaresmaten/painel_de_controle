import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "admin" | "viewer";
    status: "pending" | "approved" | "rejected";
  }

  interface Session {
    user: {
      id: string;
      role: "admin" | "viewer";
      status: "pending" | "approved" | "rejected";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "viewer";
    status: "pending" | "approved" | "rejected";
  }
}
