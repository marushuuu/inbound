import { NextResponse, type NextRequest } from "next/server";
import { connectedWorkerIds, freeBusy, isEnabled } from "@/lib/server/google";
import type { BusyBlock } from "@/lib/types";

/** 指定日の連携済み担当者の busy 区間を返す(未連携・無効時は空) */
export async function POST(req: NextRequest) {
  const { date } = (await req.json()) as { date?: string };
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date (YYYY-MM-DD) is required" }, { status: 400 });
  }
  if (!isEnabled()) {
    return NextResponse.json({ enabled: false, busy: {} });
  }
  const busy: Record<string, BusyBlock[]> = {};
  for (const workerId of await connectedWorkerIds()) {
    const blocks = await freeBusy(workerId, date);
    if (blocks) busy[workerId] = blocks;
  }
  return NextResponse.json({ enabled: true, busy });
}
