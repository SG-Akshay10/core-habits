import { NextResponse } from "next/server";

// GET /api/push/vapid-public-key — the client needs this to call
// PushManager.subscribe({ applicationServerKey }).
export async function GET() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json(
      { error: "Push not configured" },
      { status: 503 },
    );
  }
  return NextResponse.json({ publicKey });
}
