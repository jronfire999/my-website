import { NextResponse } from "next/server";
import { lockSession } from "@/lib/server";

export const runtime = "nodejs";

export async function POST() {
  try {
    await lockSession();
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not lock session." }, { status: 503 });
  }
}