import { NextResponse, type NextRequest } from "next/server";
import { isEnabled, patchEventSummary } from "@/lib/server/google";

/** 契約締結: 仮押さえ予定のタイトルを「【確定】」に更新する */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    customer?: string;
    events?: { workItemId: string; ref: string; name: string }[];
  };
  if (!isEnabled() || !Array.isArray(body.events)) {
    return NextResponse.json({ enabled: false, updated: 0 });
  }
  let updated = 0;
  for (const event of body.events) {
    const [workerId, eventId] = event.ref.split(":");
    if (!workerId || !eventId) continue;
    const ok = await patchEventSummary(
      workerId,
      eventId,
      `【確定】${body.customer ?? ""} ${event.name}`,
    );
    if (ok) updated++;
  }
  return NextResponse.json({ enabled: true, updated });
}
