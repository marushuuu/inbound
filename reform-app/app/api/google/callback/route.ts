import { NextResponse, type NextRequest } from "next/server";
import { exchangeCode, isEnabled } from "@/lib/server/google";

export async function GET(req: NextRequest) {
  if (!isEnabled()) {
    return NextResponse.json({ error: "連携が無効です" }, { status: 503 });
  }
  const code = req.nextUrl.searchParams.get("code");
  const stateRaw = req.nextUrl.searchParams.get("state");
  if (!code || !stateRaw) {
    return NextResponse.json({ error: "code / state がありません" }, { status: 400 });
  }
  let workerId = "";
  let returnTo = "/";
  try {
    const state = JSON.parse(stateRaw) as { w?: string; r?: string };
    workerId = state.w ?? "";
    // オープンリダイレクト防止: アプリ内パスのみ許可
    if (state.r && state.r.startsWith("/") && !state.r.startsWith("//")) {
      returnTo = state.r;
    }
  } catch {
    // stateが壊れている場合はトップへ
  }
  if (!workerId) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }
  await exchangeCode(code, workerId, req.nextUrl.origin);
  return NextResponse.redirect(new URL(returnTo, req.nextUrl.origin));
}
