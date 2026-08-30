import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Googleカレンダー連携のサーバー側実装。
 * GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET が未設定の間は isEnabled() が false になり、
 * アプリはデモの空き状況データで動作する。
 * トークンは MVP としてファイル(.data/google-tokens.json)に保存する。DB導入時に置き換える。
 */

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
].join(" ");

const TOKEN_PATH =
  process.env.GOOGLE_TOKEN_STORE ?? path.join(process.cwd(), ".data", "google-tokens.json");

interface StoredToken {
  refresh_token: string;
  access_token: string;
  /** epoch ms */
  expires_at: number;
}

type TokenFile = Record<string, StoredToken>;

export function isEnabled(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

async function readTokens(): Promise<TokenFile> {
  try {
    return JSON.parse(await fs.readFile(TOKEN_PATH, "utf8")) as TokenFile;
  } catch {
    return {};
  }
}

async function writeTokens(tokens: TokenFile): Promise<void> {
  await fs.mkdir(path.dirname(TOKEN_PATH), { recursive: true });
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));
}

export async function connectedWorkerIds(): Promise<string[]> {
  return Object.keys(await readTokens());
}

function redirectUri(origin: string): string {
  return process.env.GOOGLE_REDIRECT_URI ?? `${origin}/api/google/callback`;
}

export function authUrl(workerId: string, returnTo: string, origin: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    state: JSON.stringify({ w: workerId, r: returnTo }),
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCode(
  code: string,
  workerId: string,
  origin: string,
): Promise<void> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`token exchange failed: ${await res.text()}`);
  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  const tokens = await readTokens();
  tokens[workerId] = {
    refresh_token: data.refresh_token ?? tokens[workerId]?.refresh_token ?? "",
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  await writeTokens(tokens);
}

async function getAccessToken(workerId: string): Promise<string | null> {
  const tokens = await readTokens();
  const token = tokens[workerId];
  if (!token) return null;
  if (Date.now() < token.expires_at - 60_000) return token.access_token;
  if (!token.refresh_token) return null;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: token.refresh_token,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokens[workerId] = {
    ...token,
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  await writeTokens(tokens);
  return data.access_token;
}

/** 指定日のJST 0:00からの分単位で busy 区間を返す */
export async function freeBusy(
  workerId: string,
  date: string,
): Promise<{ startMin: number; endMin: number; title: string }[] | null> {
  const accessToken = await getAccessToken(workerId);
  if (!accessToken) return null;
  const dayStart = new Date(`${date}T00:00:00+09:00`);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      timeZone: "Asia/Tokyo",
      items: [{ id: "primary" }],
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    calendars: { primary?: { busy: { start: string; end: string }[] } };
  };
  const busy = data.calendars.primary?.busy ?? [];
  return busy.map((b) => ({
    startMin: Math.max(
      0,
      Math.round((new Date(b.start).getTime() - dayStart.getTime()) / 60_000),
    ),
    endMin: Math.min(
      24 * 60,
      Math.round((new Date(b.end).getTime() - dayStart.getTime()) / 60_000),
    ),
    title: "予定あり",
  }));
}

function toDateTime(date: string, min: number): string {
  const h = String(Math.floor(min / 60)).padStart(2, "0");
  const m = String(min % 60).padStart(2, "0");
  return `${date}T${h}:${m}:00`;
}

export async function insertEvent(
  workerId: string,
  args: {
    summary: string;
    description: string;
    date: string;
    startMin: number;
    endMin: number;
    projectId: string;
  },
): Promise<string | null> {
  const accessToken = await getAccessToken(workerId);
  if (!accessToken) return null;
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: args.summary,
        description: args.description,
        start: { dateTime: toDateTime(args.date, args.startMin), timeZone: "Asia/Tokyo" },
        end: { dateTime: toDateTime(args.date, args.endMin), timeZone: "Asia/Tokyo" },
        extendedProperties: { private: { reformAppProjectId: args.projectId } },
      }),
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { id: string };
  return data.id;
}

export async function patchEventSummary(
  workerId: string,
  eventId: string,
  summary: string,
): Promise<boolean> {
  const accessToken = await getAccessToken(workerId);
  if (!accessToken) return false;
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ summary }),
    },
  );
  return res.ok;
}
