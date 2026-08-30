import { NextResponse, type NextRequest } from "next/server";
import { insertEvent, isEnabled } from "@/lib/server/google";

interface ReserveTask {
  workItemId: string;
  workerId: string;
  name: string;
  startMin: number;
  endMin: number;
}

/** 仮押さえ: 各担当者のGoogleカレンダーに「【仮】」予定を登録する */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    projectId?: string;
    customer?: string;
    workTitle?: string;
    date?: string;
    tasks?: ReserveTask[];
  };
  if (!body.projectId || !body.date || !Array.isArray(body.tasks)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
  if (!isEnabled()) {
    return NextResponse.json({ enabled: false, eventIds: {} });
  }
  const eventIds: Record<string, string> = {};
  for (const task of body.tasks) {
    const eventId = await insertEvent(task.workerId, {
      summary: `【仮】${body.customer ?? ""} ${task.name}`,
      description: `${body.workTitle ?? ""}\n案件ID: ${body.projectId}\n(リフォーム営業アプリからの仮押さえ。契約締結で確定に更新されます)`,
      date: body.date,
      startMin: task.startMin,
      endMin: task.endMin,
      projectId: body.projectId,
    });
    if (eventId) eventIds[task.workItemId] = `${task.workerId}:${eventId}`;
  }
  return NextResponse.json({ enabled: true, eventIds });
}
