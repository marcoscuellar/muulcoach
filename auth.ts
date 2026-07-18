import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";

// Real accounts — NextAuth (Auth.js v5) + Resend magic-link email + the
// ollin-kv (Upstash Redis) store. Matches the OLLIN Tracker stack.
// Everything is env-guarded so a missing key never crashes the build/site.

const hasKv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

const redis = hasKv
  ? new Redis({
      url: process.env.KV_REST_API_URL as string,
      token: process.env.KV_REST_API_TOKEN as string,
    })
  : null;

/** True only when every piece needed for login is configured. */
export const authEnabled = Boolean(
  process.env.AUTH_SECRET && process.env.RESEND_API_KEY && redis,
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: redis ? UpstashRedisAdapter(redis) : undefined,
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      // Set EMAIL_FROM to a Resend-verified sender for real users.
      // onboarding@resend.dev works out of the box but only emails your own address.
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    }),
  ],
  pages: { signIn: "/login" },
  trustHost: true,
});
