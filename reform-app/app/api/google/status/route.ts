import { NextResponse } from "next/server";
import { connectedWorkerIds, isEnabled } from "@/lib/server/google";

export async function GET() {
  const enabled = isEnabled();
  return NextResponse.json({
    enabled,
    connected: enabled ? await connectedWorkerIds() : [],
  });
}
