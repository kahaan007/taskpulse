import { getFieldOptions, notionConfigured, P } from "@/lib/notion";

const API = "https://api.notion.com/v1";
const VERSION = "2025-09-03";
const DS = process.env.NOTION_DATA_SOURCE_ID || "";

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

export const dynamic = "force-dynamic";

export async function GET() {
  if (!notionConfigured) {
    return Response.json({
      configured: false,
      databaseId: DS,
      results: [],
    });
  }

  try {
    const [queryRes, options] = await Promise.all([
      nfetch<{ results: any[] }>(`/data_sources/${DS}/query`, {
        method: "POST",
        body: JSON.stringify({
          page_size: 50,
          sorts: [{ property: P.created, direction: "descending" }],
        }),
      }),
      getFieldOptions(),
    ]);

    const tasks = (queryRes.results || []).map((r) => {
      const p = r.properties;
      const titleItems = p[P.title]?.title || [];
      const title = titleItems.map((t: any) => t.plain_text).join("") || "(Untitled Task)";
      const client = (p[P.client]?.multi_select || []).map((x: any) => x.name);
      const taskType = (p[P.taskType]?.multi_select || []).map((x: any) => x.name);
      const goal = (p[P.goal]?.multi_select || []).map((x: any) => x.name);
      const status = p[P.status]?.status?.name || "Not started";
      const priority = p[P.priority]?.select?.name || "Medium";
      const minutes = p[P.minutes]?.number ?? 15;
      const created = p[P.created]?.date?.start || "";
      const deadline = p[P.deadline]?.date?.start || "";
      const link = (p[P.link]?.rich_text || []).map((t: any) => t.plain_text).join("");

      return {
        id: r.id,
        title,
        status: status === "Done" ? "Done" : status === "In progress" ? "In Progress" : status === "In Review" ? "In Review" : "Backlog",
        rawStatus: status,
        priority: priority === "High" ? "High" : priority === "Urgent" ? "Urgent" : priority === "Low" ? "Low" : "Medium",
        client,
        taskType,
        goal,
        pulseMinutes: minutes,
        dueDate: deadline || (created ? created.slice(0, 10) : "Nov 15, 2026"),
        created,
        url: r.url,
        link,
        category: client[0] || (taskType[0] ? `Design · ${taskType[0]}` : "General"),
        tags: [...client, ...taskType, ...goal].filter(Boolean),
        assignee: {
          name: "Dieter K.",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        },
      };
    });

    return Response.json({
      configured: true,
      databaseId: DS,
      total: tasks.length,
      tasks,
      options,
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!notionConfigured) {
    return Response.json({ error: "Notion is not configured" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const title = body.title || "New Task";
    const minutes = Number(body.pulseMinutes) || 15;
    const client = Array.isArray(body.client) ? body.client : body.client ? [body.client] : [];
    const taskType = Array.isArray(body.taskType) ? body.taskType : body.taskType ? [body.taskType] : [];
    const goal = Array.isArray(body.goal) ? body.goal : body.goal ? [body.goal] : [];
    const status = body.status === "Done" ? "Done" : body.status === "In Progress" ? "In progress" : "Not started";
    const priority = body.priority || "Medium";

    const props: Record<string, unknown> = {
      [P.title]: { title: [{ type: "text", text: { content: title } }] },
      [P.minutes]: { number: minutes },
      [P.client]: { multi_select: client.map((name: string) => ({ name })) },
      [P.taskType]: { multi_select: taskType.map((name: string) => ({ name })) },
      [P.goal]: { multi_select: goal.map((name: string) => ({ name })) },
      [P.status]: { status: { name: status } },
      [P.priority]: { select: { name: priority } },
      [P.created]: { date: { start: new Date().toISOString() } },
    };

    if (process.env.NOTION_USER_ID) {
      props[P.assignee] = { people: [{ id: process.env.NOTION_USER_ID }] };
    }

    const createdPage = await nfetch<{ id: string; url: string }>("/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: { type: "data_source_id", data_source_id: DS },
        properties: props,
      }),
    });

    return Response.json({ ok: true, id: createdPage.id, url: createdPage.url });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!notionConfigured) {
    return Response.json({ error: "Notion is not configured" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const pageId = body.id;
    if (!pageId) return Response.json({ error: "Missing page id" }, { status: 400 });

    const props: Record<string, unknown> = {};

    if (body.title) {
      props[P.title] = { title: [{ type: "text", text: { content: body.title } }] };
    }
    if (body.status) {
      const notionStatus = body.status === "Done" ? "Done" : body.status === "In Progress" ? "In progress" : "Not started";
      props[P.status] = { status: { name: notionStatus } };
    }
    if (body.priority) {
      props[P.priority] = { select: { name: body.priority } };
    }
    if (body.pulseMinutes !== undefined) {
      props[P.minutes] = { number: Number(body.pulseMinutes) };
    }

    const updated = await nfetch<{ id: string }>(`/pages/${pageId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties: props }),
    });

    return Response.json({ ok: true, id: updated.id });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!notionConfigured) {
    return Response.json({ error: "Notion is not configured" }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return Response.json({ error: "Missing page id" }, { status: 400 });

    await nfetch(`/pages/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ in_trash: true }),
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
