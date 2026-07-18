import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyUser } from "@/lib/users";

// Real accounts — NextAuth (Auth.js v5) with email + password, verified against
// the ollin-kv (Upstash Redis) user store. Passwords are bcrypt-hashed in
// lib/users. Credentials auth requires JWT sessions (no database session rows).
// Everything is env-guarded so a missing key never crashes the build/site.

const hasKv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

/** True only when every piece needed for login is configured. */
export const authEnabled = Boolean(process.env.AUTH_SECRET && hasKv);

export const { handlers, auth, signIn, signOut } = NextAuth({
  // JWT sessions kept in a signed cookie. 90-day lifetime so you stay logged in.
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 90 },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;
        const user = await verifyUser(email, password);
        if (!user) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: { signIn: "/login" },
  trustHost: true,
});
