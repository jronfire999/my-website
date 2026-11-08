import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
import { cookies } from "next/headers";

const COOKIE = "__Host-zzxxcc-session";
const SESSION_HOURS = 8;

function getRpc() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key || !process.env.CHAT_RPC_SECRET) {
    throw new Error("Server configuration is incomplete.");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
  });
}

function rpcSecret() {
  const secret = process.env.CHAT_RPC_SECRET;
  if (!secret) throw new Error("Server configuration is incomplete.");
  return secret;
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function authenticatePassword(password: string) {
  const candidates = [
    { person: "person_1", hash: process.env.AUTH_PERSON_1_PASSWORD_HASH },
    { person: "person_2", hash: process.env.AUTH_PERSON_2_PASSWORD_HASH }
  ];
  if (candidates.some((item) => !item.hash)) throw new Error("Password hashes are not configured.");
  const matches: string[] = [];
  for (const candidate of candidates) {
    if (candidate.hash && await argon2.verify(candidate.hash, password).catch(() => false)) {
      matches.push(candidate.person);
    }
  }
  return matches.length === 1 ? matches[0] : null;
}

export async function createSession(personId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000).toISOString();
  const { data, error } = await getRpc().rpc("chat_create_session", {
    p_server_secret: rpcSecret(),
    p_person_id: personId,
    p_token_hash: hashToken(token),
    p_expires_at: expiresAt
  });
  if (error || data !== true) throw new Error("Could not create a session.");
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: SESSION_HOURS * 60 * 60
  });
}

export async function getSessionPerson() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const { data, error } = await getRpc().rpc("chat_validate_session", {
    p_server_secret: rpcSecret(),
    p_token_hash: hashToken(token)
  });
  return error || (data !== "person_1" && data !== "person_2") ? null : data;
}

export async function lockSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    await getRpc().rpc("chat_revoke_session", {
      p_server_secret: rpcSecret(),
      p_token_hash: hashToken(token)
    });
  }
  jar.delete(COOKIE);
}
