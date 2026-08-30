import { NextResponse, type NextRequest } from "next/server";
import { authUrl, isEnabled } from "@/lib/server/google";

export function GET(req: NextRequest) {
  if (!isEnabled()) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET が未設定です" },
      { status: 503 },
    );
  }
  const worker = req.nextUrl.searchParams.get("worker");
  const returnTo = req.nextUrl.searchParams.get("returnTo") ?? "/";
  if (!worker) {
    return NextResponse.json({ error: "worker is required" }, { status: 400 });
  }
  return NextResponse.redirect(authUrl(worker, returnTo, req.nextUrl.origin));
}
