import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { auth } from "@/auth";

// Per-user data store in ollin-kv (Upstash Redis), so goals/profile/chat follow
// the logged-in user across devices. Only the signed-in user can read/write
// their own data. Runs in the Node runtime.
export const runtime = "nodejs";

const hasKv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const redis = hasKv
  ? new Redis({
      url: process.env.KV_REST_API_URL as string,
      token: process.env.KV_REST_API_TOKEN as string,
    })
  : null;

// Only these keys may be synced (matches the localStorage buckets).
const ALLOWED = new Set(["wingman", "profile", "chat"]);
const dataKey = (email: string, key: string) => `data:${email.toLowerCase()}:${key}`;

export async function GET(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email || !redis) return NextResponse.json({ value: null });

  const key = new URL(req.url).searchParams.get("key") ?? "";
  if (!ALLOWED.has(key)) return NextResponse.json({ error: "Unknown key." }, { status: 400 });

  const value = await redis.get(dataKey(email, key));
  return NextResponse.json({ value: value ?? null });
}

export async function PUT(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email || !redis) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { key?: string; value?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
  if (!body.key || !ALLOWED.has(body.key)) {
    return NextResponse.json({ ok: false, error: "Unknown key." }, { status: 400 });
  }

  await redis.set(dataKey(email, body.key), body.value);
  return NextResponse.json({ ok: true });
}
