import { FALLBACK_OPTIONS } from "./fallback";
import type { Entry, FieldOptions, LogInput, Opt } from "./types";

const API = "https://api.notion.com/v1";
const VERSION = "2025-09-03";

export const notionConfigured = Boolean(process.env.NOTION_TOKEN && process.env.NOTION_DATA_SOURCE_ID);
const DS = process.env.NOTION_DATA_SOURCE_ID || "";

/** Exact property names in the Daily Task Manager (note the trailing space in "Client "). */
export const P = {
  title: "Time Taken",
  minutes: "Minutes",
  client: "Client ",
  goal: "Broad Goal",
  taskType: "Task type",
  status: "Status",
  priority: "Priority",
  effort: "Effort level",
  deadline: "Deadline",
  link: "Project File Link",
  created: "Date Created",
  assignee: "Assignee",
} as const;

async function nfetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": VERSION,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`Notion ${res.status}: ${body.slice(0, 300)}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return (await res.json()) as T;
}

/* ---------------- schema ---------------- */

type RawOpt = { name: string; color?: string };
let schemaCache: { at: number; value: FieldOptions } | null = null;

function opts(prop: unknown, kind: "select" | "multi_select" | "status"): Opt[] {
  const arr = (prop as Record<string, { options?: RawOpt[] }> | undefined)?.[kind]?.options;
  return (arr || []).map((x) => ({ name: x.name, color: x.color || "default" }));
}

export async function getFieldOptions(): Promise<FieldOptions> {
  if (!notionConfigured) return FALLBACK_OPTIONS;
  if (schemaCache && Date.now() - schemaCache.at < 10 * 60 * 1000) return schemaCache.value;
  try {
    const ds = await nfetch<{ properties: Record<string, unknown> }>(`/data_sources/${DS}`);
    const pr = ds.properties;
    const value: FieldOptions = {
      client: opts(pr[P.client], "multi_select"),
      goal: opts(pr[P.goal], "multi_select"),
      taskType: opts(pr[P.taskType], "multi_select"),
      status: opts(pr[P.status], "status"),
      priority: opts(pr[P.priority], "select"),
      effort: opts(pr[P.effort], "select"),
    };
    schemaCache = { at: Date.now(), value };
    return value;
  } catch {
    return schemaCache?.value || FALLBACK_OPTIONS;
  }
}

/* ---------------- write ---------------- */

const rt = (s: string) => [{ type: "text", text: { content: s.slice(0, 1900) } }];

export async function createEntry(
  input: Omit<LogInput, "entryId" | "slotId" | "repeatLast">,
  startISO: string,
  title: string,
): Promise<{ id: string; url: string }> {
  const props: Record<string, unknown> = {
    [P.title]: { title: rt(title) },
    [P.minutes]: { number: input.minutes },
    [P.client]: { multi_select: input.client.map((name) => ({ name })) },
    [P.goal]: { multi_select: input.goal.map((name) => ({ name })) },
    [P.taskType]: { multi_select: input.taskType.map((name) => ({ name })) },
    [P.status]: { status: { name: input.status } },
    [P.created]: { date: { start: startISO } },
  };
  if (input.priority) props[P.priority] = { select: { name: input.priority } };
  if (input.effort) props[P.effort] = { select: { name: input.effort } };
  if (input.deadline) props[P.deadline] = { date: { start: input.deadline } };
  if (input.link) props[P.link] = { rich_text: rt(input.link) };
  if (process.env.NOTION_USER_ID) props[P.assignee] = { people: [{ id: process.env.NOTION_USER_ID }] };

  const page = await nfetch<{ id: string; url: string }>("/pages", {
    method: "POST",
    body: JSON.stringify({ parent: { type: "data_source_id", data_source_id: DS }, properties: props }),
  });
  return { id: page.id, url: page.url };
}

export async function archivePage(pageId: string): Promise<void> {
  await nfetch(`/pages/${pageId}`, { method: "PATCH", body: JSON.stringify({ in_trash: true }) });
}

/* ---------------- read ---------------- */

interface RawPage {
  id: string;
  url: string;
  properties: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

function parsePage(p: RawPage): Entry {
  const pr = p.properties;
  const names = (k: string): string[] => (pr[k]?.multi_select || []).map((x: { name: string }) => x.name);
  return {
    id: p.id,
    url: p.url,
    title: (pr[P.title]?.title || []).map((t: { plain_text: string }) => t.plain_text).join("") || "(untitled)",
    minutes: pr[P.minutes]?.number ?? 0,
    client: names(P.client),
    goal: names(P.goal),
    taskType: names(P.taskType),
    status: pr[P.status]?.status?.name,
    start: pr[P.created]?.date?.start || "",
  };
}

export async function queryRange(fromISO: string, toISO: string): Promise<Entry[]> {
  const out: Entry[] = [];
  let cursor: string | undefined;
  do {
    const res = await nfetch<{ results: RawPage[]; has_more: boolean; next_cursor: string | null }>(
      `/data_sources/${DS}/query`,
      {
        method: "POST",
        body: JSON.stringify({
          filter: {
            and: [
              { property: P.created, date: { on_or_after: fromISO } },
              { property: P.created, date: { before: toISO } },
            ],
          },
          sorts: [{ property: P.created, direction: "ascending" }],
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {}),
        }),
      },
    );
    out.push(...res.results.map(parsePage));
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);
  return out;
}
