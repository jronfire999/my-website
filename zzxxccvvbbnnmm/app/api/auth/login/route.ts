import { NextRequest, NextResponse } from "next/server";
import { authenticatePassword, createSession } from "@/lib/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin && host && new URL(origin).host !== host) {
      return NextResponse.json({ error: "Request rejected." }, { status: 403 });
    }
    const body = await request.json().catch(() => null);
    const password = typeof body?.password === "string" ? body.password : "";
    if (password.length < 12 || password.length > 256) {
      return NextResponse.json({ error: "Invalid password." }, { status: 400 });
    }
    const person = await authenticatePassword(password);
    if (!person) {
      await new Promise((resolve) => setTimeout(resolve, 650));
      return NextResponse.json({ error: "Password not recognized." }, { status: 401 });
    }
    await createSession(person);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Login service is not ready. Check server configuration." }, { status: 503 });
  }
}