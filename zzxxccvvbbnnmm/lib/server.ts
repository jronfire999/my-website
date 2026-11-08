import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
import { cookies } from "next/headers";

const COOKIE = "__Host-zzxxcc-session";
const SESSION_HOURS = 8;

export function getAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Server configuration is incomplete.");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
  });
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function authenticatePassword(password: string) {
  const candidates = [
    { person: "person_1", hash: process.env.AUTH_PERSON_1_PASSWORD_HASH },
    { person: "person_2", hash: process.env.AUTH_PERSON_2_PASSWORD_HASH }
  ];
  if (candidates.some((item) => !item.hash)) throw new Error("Server authentication is not configured.");
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
  const admin = getAdmin();
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000).toISOString();
  const { error } = await admin.schema("private_chat").from("sessions").insert({
    person_id: personId,
    token_hash: hashToken(token),
    expires_at: expiresAt
  });
  if (error) throw new Error("Could not create a session.");
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: SESSION_HOURS * 60 * 60
  });
}

export async function lockSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const admin = getAdmin();
    await admin.schema("private_chat").from("sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("token_hash", hashToken(token))
      .is("revoked_at", null);
  }
  jar.delete(COOKIE);
}
