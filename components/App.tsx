"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError, api, flushQueue, isRetryable, queue, registerSW, uid } from "@/lib/client";
import type { Combo, FieldOptions, LogInput, SlotView, TodayResponse } from "@/lib/types";
import Login from "./Login";
import SettingsDrawer from "./SettingsDrawer";
import TodayPanel from "./TodayPanel";
import { ChipGroup, Seg } from "./ui";

interface Form {
  description: string;
  client: string[];
  goal: string[];
  taskType: string[];
  status: string;
  priority?: string;
  effort?: string;
  minutes: number;
  deadline: string;
  link: string;
}

const emptyForm = (interval: number): Form => ({
  description: "",
  client: [],
  goal: [],
  taskType: [],
  status: "In progress",
  minutes: interval,
  deadline: "",
  link: "",
});

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
const mmss = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
};
const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

function setFavicon(n: number) {
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d");
    if (!x) return;
    x.fillStyle = n > 0 ? "#ff4d00" : "#0a0a0a";
    x.fillRect(0, 0, 64, 64);
    x.strokeStyle = "#ff4d00";
    x.lineWidth = 6;
    x.strokeRect(3, 3, 58, 58);
    if (n > 0) {
      x.fillStyle = "#0a0a0a";
      x.font = "bold 40px sans-serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText(String(Math.min(n, 99)), 32, 36);
    }
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon'][data-tp]");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.dataset.tp = "1";
      document.head.appendChild(link);
    }
    link.href = c.toDataURL();
    const nav = navigator as Navigator & { setAppBadge?: (n?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
    if (n > 0) nav.setAppBadge?.(n).catch(() => undefined);
    else nav.clearAppBadge?.().catch(() => undefined);
  } catch {
    /* cosmetic only */
  }
}

export default function App() {
  const [phase, setPhase] = useState<"loading" | "login" | "ready">("loading");
  const [today, setToday] = useState<TodayResponse | null>(null);
  const [opts, setOpts] = useState<FieldOptions | null>(null);
  const [form, setForm] = useState<Form>(emptyForm(15));
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [pending, setPending] = useState<LogInput[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash] = useState(0);
  const [drawer, setDrawer] = useState<null | "today" | "settings">(null);
  const [promptSlot, setPromptSlot] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null);
  const [listening, setListening] = useState(false);
  const [tick, setTick] = useState(0);

  const offsetRef = useRef(0);
  const promptedRef = useRef<Set<string>>(new Set());
  const snoozeRef = useRef<Map<string, number>>(new Map());
  const initRef = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);

  const say = useCallback((msg: string, err?: boolean) => {
    setToast({ msg, err });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), err ? 4500 : 2600);
  }, []);

  /* ---------- data ---------- */

  const syncPending = useCallback(async () => setPending(await queue.all()), []);

  const refresh = useCallback(async () => {
    try {
      const t = await api.today();
      offsetRef.current = Date.parse(t.nowISO) - Date.now();
      if (!initRef.current) {
        initRef.current = true;
        const now = Date.now() + offsetRef.current;
        for (const s of t.slots) if (now >= Date.parse(s.endISO)) promptedRef.current.add(s.id);
        setForm((f) => (f.client.length || f.taskType.length ? f : emptyForm(t.settings.interval)));
      }
      setToday(t);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setPhase("login");
    }
  }, []);

  const boot = useCallback(async () => {
    try {
      const a = await api.authed();
      if (!a.authed) return setPhase("login");
      const [, o] = await Promise.all([refresh(), api.schema()]);
      setOpts(o);
      await syncPending();
      setPhase("ready");
      registerSW();
      const slot = new URLSearchParams(location.search).get("slot");
      if (slot) {
        setActiveSlotId(slot);
        history.replaceState(null, "", "/");
      }
    } catch {
      setPhase("login");
    }
  }, [refresh, syncPending]);

  useEffect(() => {
    const t = localStorage.getItem("tp-theme");
    if (t) document.documentElement.dataset.theme = t;
    boot();
  }, [boot]);

  // clock
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // periodic refresh + focus refresh
  useEffect(() => {
    if (phase !== "ready") return;
    const id = setInterval(refresh, 60_000);
    const onVis = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [phase, refresh]);

  // offline queue flush
  useEffect(() => {
    if (phase !== "ready") return;
    const run = async () => {
      const n = await flushQueue();
      if (n) {
        say(`Synced ${n} offline ${n === 1 ? "entry" : "entries"}`);
        refresh();
      }
      syncPending();
    };
    run();
    window.addEventListener("online", run);
    const id = setInterval(run, 20_000);
    return () => {
      window.removeEventListener("online", run);
      clearInterval(id);
    };
  }, [phase, refresh, say, syncPending]);

  // service worker -> open slot
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const h = (e: MessageEvent) => {
      if (e.data?.type === "open-slot" && e.data.slotId) {
        setActiveSlotId(e.data.slotId);
        setPromptSlot(null);
        refresh();
      }
    };
    navigator.serviceWorker.addEventListener("message", h);
    return () => navigator.serviceWorker.removeEventListener("message", h);
  }, [refresh]);

  /* ---------- derived ---------- */

  void tick;
  const nowMs = Date.now() + offsetRef.current;
  const slots: SlotView[] = today?.slots ?? [];
  const pendingSlots = useMemo(() => new Set(pending.map((p) => p.slotId)), [pending]);
  const stateOf = useCallback((s: SlotView) => s.state || (pendingSlots.has(s.id) ? "logged" : undefined), [pendingSlots]);
  const endMs = (s: SlotView) => Date.parse(s.endISO);
  const startMs = (s: SlotView) => Date.parse(s.startISO);

  const unloggedEnded = slots.filter((s) => !stateOf(s) && nowMs >= endMs(s));
  const currentSlot = slots.find((s) => nowMs >= startMs(s) && nowMs < endMs(s));
  const picked = activeSlotId ? slots.find((s) => s.id === activeSlotId && !stateOf(s)) : undefined;
  const active: SlotView | null =
    picked || unloggedEnded[unloggedEnded.length - 1] || (currentSlot && !stateOf(currentSlot) ? currentSlot : null);
  const interval = today?.settings.interval ?? 15;
  const nextEnd = slots.find((s) => endMs(s) > nowMs);
  const remaining = nextEnd ? endMs(nextEnd) - nowMs : 0;
  const ringPct = nextEnd ? Math.min(1, Math.max(0, 1 - remaining / (interval * 60000))) : 0;

  const last = today?.recents.last;
  const combos = today?.recents.combos ?? [];
  const favClients = useMemo(() => [...new Set(combos.flatMap((c) => c.client))], [combos]);
  const favTypes = useMemo(() => [...new Set(combos.flatMap((c) => c.taskType))], [combos]);

  const canSubmit = Boolean(active) && form.client.length > 0 && form.taskType.length > 0 && !submitting;
  const target = today ? (Number(today.settings.end.slice(0, 2)) * 60 + Number(today.settings.end.slice(3)) - (Number(today.settings.start.slice(0, 2)) * 60 + Number(today.settings.start.slice(3)))) : 480;
  const loggedMinutes = (today?.totalMinutes ?? 0) + pending.reduce((a, p) => a + p.minutes, 0);

  // takeover prompt when a slot ends while the app is open
  useEffect(() => {
    if (phase !== "ready" || !today || !today.active || today.settings.quiet) return;
    const now = Date.now() + offsetRef.current;
    if (document.visibilityState === "visible") {
      for (const s of slots) {
        if (stateOf(s)) continue;
        const e = Date.parse(s.endISO);
        if (now >= e && now < e + interval * 60000 && !promptedRef.current.has(s.id)) {
          promptedRef.current.add(s.id);
          setPromptSlot(s.id);
          refresh();
          break;
        }
      }
    }
    for (const [id, until] of snoozeRef.current) {
      if (now >= until) {
        snoozeRef.current.delete(id);
        const sl = slots.find((x) => x.id === id);
        if (sl && !stateOf(sl)) setPromptSlot(id);
      }
    }
  }, [tick]); // eslint-disable-line react-hooks/exhaustive-deps

  // tab title + favicon badge
  useEffect(() => {
    const n = unloggedEnded.length;
    const first = unloggedEnded[unloggedEnded.length - 1];
    document.title = n > 0 && first ? `(${n}) Log ${first.label.split(" – ")[1] ?? first.label} · TaskPulse` : "TaskPulse";
    setFavicon(n);
  }, [unloggedEnded.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- actions ---------- */

  const sendInput = useCallback(
    async (input: LogInput, label: string): Promise<boolean> => {
      setSubmitting(true);
      try {
        await api.log(input);
        setFlash((f) => f + 1);
        say(`Logged ${label}`);
        setActiveSlotId(null);
        await refresh();
        return true;
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          setPhase("login");
          return false;
        }
        if (isRetryable(e)) {
          await queue.add(input);
          await syncPending();
          setFlash((f) => f + 1);
          say("Saved offline — will sync when you're back", false);
          setActiveSlotId(null);
          return true;
        }
        say((e as Error).message, true);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [refresh, say, syncPending],
  );

  const submit = useCallback(async () => {
    if (!active || !canSubmit) return;
    const input: LogInput = {
      entryId: uid(),
      slotId: active.id,
      description: form.description.trim() || undefined,
      minutes: form.minutes,
      client: form.client,
      goal: form.goal,
      taskType: form.taskType,
      status: form.status,
      priority: form.priority,
      effort: form.effort,
      deadline: form.deadline || undefined,
      link: form.link.trim() || undefined,
    };
    const ok = await sendInput(input, active.label);
    if (ok) setForm(emptyForm(interval));
  }, [active, canSubmit, form, interval, sendInput]);

  const sameAsLast = useCallback(
    async (slotId: string) => {
      const sl = slots.find((s) => s.id === slotId);
      if (!sl || !last) return say("Nothing to repeat yet", true);
      await sendInput({ ...last, entryId: uid(), slotId, minutes: interval }, sl.label);
    },
    [slots, last, interval, say, sendInput],
  );

  const fill = (c: Pick<Combo, "client" | "goal" | "taskType">) =>
    setForm((f) => ({ ...f, client: c.client, goal: c.goal, taskType: c.taskType }));

  const repeatLast = () => {
    if (!last) return;
    setForm((f) => ({
      ...f,
      description: last.description || "",
      client: last.client,
      goal: last.goal,
      taskType: last.taskType,
      status: last.status || f.status,
      priority: last.priority,
      effort: last.effort,
      minutes: last.minutes || f.minutes,
    }));
  };

  const markSlot = async (state: "break" | "skip") => {
    if (!active) return;
    try {
      await api.mark(active.id, state);
      say(state === "break" ? `${active.label} marked break` : `${active.label} skipped`);
      setActiveSlotId(null);
      await refresh();
    } catch (e) {
      say((e as Error).message, true);
    }
  };

  const undo = async () => {
    try {
      await api.undo();
      say("Last entry removed");
      await refresh();
    } catch (e) {
      say((e as Error).message, true);
    }
  };

  const dictate = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return say("Dictation isn't supported in this browser", true);
    if (listening) return recRef.current?.stop();
    const r = new SR();
    r.lang = "en-IN";
    r.interimResults = false;
    r.onresult = (ev: { results: { 0: { 0: { transcript: string } } } }) => {
      const t = ev.results[0][0].transcript;
      setForm((f) => ({ ...f, description: (f.description ? f.description + " " : "") + t }));
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recRef.current = r;
    r.start();
    setListening(true);
  };

  // Cmd/Ctrl+Enter
  const submitRef = useRef(submit);
  submitRef.current = submit;
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        submitRef.current();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const logout = async () => {
    await api.logout().catch(() => undefined);
    setDrawer(null);
    setPhase("login");
  };

  /* ---------- render ---------- */

  if (phase === "loading") {
    return (
      <div className="login">
        <div className="mono mut">Loading…</div>
      </div>
    );
  }
  if (phase === "login") {
    return (
      <Login
        onDone={() => {
          setPhase("loading");
          initRef.current = false;
          boot();
        }}
      />
    );
  }
  if (!today || !opts) return null;

  const idx = active ? slots.findIndex((s) => s.id === active.id) : -1;
  const overdueMin = active && nowMs >= endMs(active) ? Math.floor((nowMs - endMs(active)) / 60000) : 0;
  const catchUp = unloggedEnded.filter((s) => s.id !== active?.id);
  const promptTarget = promptSlot ? slots.find((s) => s.id === promptSlot) : null;
  const doneCount = slots.filter((s) => stateOf(s)).length;

  const R = 30;
  const C = 2 * Math.PI * R;

  const quietScreen = () => {
    const first = slots[0];
    let h = "Standing by.";
    let sub = "Next prompt arrives when the current slot ends.";
    if (!today.active) {
      h = "Off the clock.";
      sub = "Weekend or holiday. Reminders resume on the next working day.";
    } else if (first && nowMs < startMs(first)) {
      h = `Starts ${fmt(first.startMin)}.`;
      sub = `First prompt at ${fmt(first.endMin)}.`;
    } else if (!nextEnd) {
      h = "Day closed.";
      sub = `${doneCount} of ${slots.length} slots accounted for · ${Math.floor(loggedMinutes / 60)}h ${pad(loggedMinutes % 60)}m logged.`;
    }
    return (
      <div className="state-screen">
        <div className="mono mut">TaskPulse</div>
        <h1>{h}</h1>
        <div className="mono mut">{sub}</div>
      </div>
    );
  };

  return (
    <>
      <header className="top">
        <div className="shell">
          <div className="top-row">
            <div className="brand">
              <i /> TASKPULSE
            </div>
            <div className="top-actions">
              <button className="btn-ghost only-mobile" onClick={() => setDrawer("today")}>
                Today · {Math.floor(loggedMinutes / 60)}h{pad(loggedMinutes % 60)}
              </button>
              <button className="btn-ghost" onClick={() => setDrawer("settings")} aria-label="Settings">
                Settings
              </button>
            </div>
          </div>
        </div>
        <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={target} aria-valuenow={Math.min(loggedMinutes, target)}>
          <i style={{ width: `${Math.min(100, (loggedMinutes / target) * 100)}%` }} />
        </div>
      </header>

      {today.demo && (
        <div className="banner">
          <b>DEMO MODE</b> — NOTION_TOKEN / NOTION_DATA_SOURCE_ID not set. Entries are kept locally and are not sent to Notion.
        </div>
      )}
      {today.settings.quiet && (
        <div className="banner">
          <b>QUIET MODE</b> — reminders are paused. Turn off in Settings.
        </div>
      )}

      <div className="shell">
        <div className="layout">
          <main className="main">
            {!active ? (
              quietScreen()
            ) : (
              <>
                <section className="hero">
                  <div className="hero-meta mono">
                    <span className="tag">
                      Slot {idx + 1}/{slots.length}
                    </span>
                    <span className="mut">
                      {overdueMin > 0 ? `Ended ${overdueMin} min ago` : nowMs >= endMs(active) ? "Just ended" : `Early log · ends in ${mmss(endMs(active) - nowMs)}`}
                    </span>
                    {pending.length > 0 && <span style={{ color: "var(--acc)" }}>{pending.length} pending sync</span>}
                  </div>
                  <h1 className="hero-time" aria-label={`Logging ${active.label}`}>
                    <span>{fmt(active.startMin)}</span>
                    <span className="dash">–</span>
                    <span>{fmt(active.endMin)}</span>
                  </h1>
                  <div className="hero-row">
                    <div className="stats">
                      <div className="stat">
                        <span className="mono mut">Logged</span>
                        <b>
                          {Math.floor(loggedMinutes / 60)}h {pad(loggedMinutes % 60)}m
                        </b>
                      </div>
                      <div className="stat">
                        <span className="mono mut">Streak</span>
                        <b>{today.streak}</b>
                      </div>
                      <div className="stat">
                        <span className="mono mut">Missed</span>
                        <b>{unloggedEnded.length}</b>
                      </div>
                    </div>
                    <div className="ring" aria-label="Time to next slot">
                      <svg width="72" height="72" viewBox="0 0 72 72">
                        <circle className="ring-bg" cx="36" cy="36" r={R} fill="none" strokeWidth="6" />
                        <circle className="ring-fg" cx="36" cy="36" r={R} fill="none" strokeWidth="6" strokeDasharray={C} strokeDashoffset={C * (1 - ringPct)} />
                      </svg>
                      <span>{nextEnd ? mmss(remaining) : "--:--"}</span>
                    </div>
                  </div>
                </section>

                {(catchUp.length > 0 || picked) && (
                  <div className="catch" aria-label="Catch up">
                    <span className="mono mut lbl">Catch up · {unloggedEnded.length}</span>
                    {[...(unloggedEnded.some((s) => s.id === active.id) ? [] : [active]), ...unloggedEnded].map((s) => (
                      <button key={s.id} className="slot-pill" aria-pressed={s.id === active.id} onClick={() => setActiveSlotId(s.id)}>
                        {fmt(s.startMin)}
                      </button>
                    ))}
                  </div>
                )}

                <section className="quick" aria-label="Quick fill">
                  <div className="quick-row">
                    <button className="repeat" disabled={!last} onClick={repeatLast}>
                      <span className="mono">↻ Repeat last</span>
                      <b>{last ? [last.client.join(", "), last.taskType.join(", ")].filter(Boolean).join(" · ") : "Nothing yet"}</b>
                    </button>
                    {combos.map((c, i) => (
                      <button key={i} className="combo" onClick={() => fill(c)}>
                        <span className="mono mut">{c.count}× used</span>
                        <b>{[c.client.join(", "), c.taskType.join(", ")].filter(Boolean).join(" · ")}</b>
                      </button>
                    ))}
                  </div>
                </section>

                <div className="form">
                  <section className="sec">
                    <div className="sec-h">
                      <h3>
                        <span className="n">01</span>Client <span className="req">*</span>
                      </h3>
                      <span className="mono mut">{form.client.length ? `${form.client.length} selected` : "required"}</span>
                    </div>
                    <ChipGroup
                      options={opts.client}
                      selected={form.client}
                      favorites={favClients}
                      searchable
                      placeholder="Search clients…"
                      onToggle={(n) => setForm((f) => ({ ...f, client: toggle(f.client, n) }))}
                    />
                  </section>

                  <section className="sec">
                    <div className="sec-h">
                      <h3>
                        <span className="n">02</span>Task type <span className="req">*</span>
                      </h3>
                      <span className="mono mut">{form.taskType.length ? `${form.taskType.length} selected` : "required"}</span>
                    </div>
                    <ChipGroup
                      options={opts.taskType}
                      selected={form.taskType}
                      favorites={favTypes}
                      searchable
                      placeholder="Search task types…"
                      onToggle={(n) => setForm((f) => ({ ...f, taskType: toggle(f.taskType, n) }))}
                    />
                  </section>

                  <section className="sec">
                    <div className="sec-h">
                      <h3>
                        <span className="n">03</span>Broad goal
                      </h3>
                    </div>
                    <ChipGroup options={opts.goal} selected={form.goal} onToggle={(n) => setForm((f) => ({ ...f, goal: toggle(f.goal, n) }))} />
                  </section>

                  <section className="sec">
                    <div className="sec-h">
                      <h3>
                        <span className="n">04</span>State
                      </h3>
                    </div>
                    <div>
                      <span className="label-sm">Status</span>
                      <Seg options={opts.status} value={form.status} onChange={(v) => v && setForm((f) => ({ ...f, status: v }))} />
                    </div>
                    <div className="row2">
                      <div>
                        <span className="label-sm">Priority</span>
                        <Seg options={opts.priority} value={form.priority} allowClear onChange={(v) => setForm((f) => ({ ...f, priority: v }))} />
                      </div>
                      <div>
                        <span className="label-sm">Effort</span>
                        <Seg options={opts.effort} value={form.effort} allowClear onChange={(v) => setForm((f) => ({ ...f, effort: v }))} />
                      </div>
                    </div>
                  </section>

                  <section className="sec">
                    <div className="sec-h">
                      <h3>
                        <span className="n">05</span>Minutes spent
                      </h3>
                      <span className="mono mut">
                        {form.minutes > interval ? `covers ${Math.floor(form.minutes / interval)} slots back` : `one ${interval}-min slot`}
                      </span>
                    </div>
                    <div className="minutes">
                      {[1, 2, 3, 4].map((k) => (
                        <button
                          key={k}
                          type="button"
                          className="chip"
                          aria-pressed={form.minutes === interval * k}
                          onClick={() => setForm((f) => ({ ...f, minutes: interval * k }))}
                        >
                          {interval * k}
                        </button>
                      ))}
                      <div className="stepper">
                        <button type="button" aria-label="Minus 5 minutes" onClick={() => setForm((f) => ({ ...f, minutes: Math.max(5, f.minutes - 5) }))}>
                          −
                        </button>
                        <output aria-live="polite">{form.minutes}m</output>
                        <button type="button" aria-label="Plus 5 minutes" onClick={() => setForm((f) => ({ ...f, minutes: f.minutes + 5 }))}>
                          +
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="sec">
                    <div className="sec-h">
                      <h3>
                        <span className="n">06</span>What did you do?
                      </h3>
                      <span className="mono mut">optional</span>
                    </div>
                    <div className="field-line">
                      <input
                        className="field"
                        placeholder={[form.taskType.join(", "), form.client.join(", ")].filter(Boolean).join(" — ") || "Auto-titled from type + client"}
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        aria-label="Task description"
                        enterKeyHint="done"
                      />
                      <button type="button" className="btn-ghost mic" aria-pressed={listening} onClick={dictate} aria-label="Dictate description">
                        {listening ? "● Rec" : "Mic"}
                      </button>
                    </div>
                  </section>

                  <section className="sec" style={{ borderBottom: 0 }}>
                    <details className="fold">
                      <summary>
                        <h3 style={{ margin: 0, fontWeight: 800, fontStretch: "112%", fontSize: 18, letterSpacing: "-0.02em" }}>
                          <span className="mono mut" style={{ marginRight: 10 }}>07</span>More
                        </h3>
                        <span className="plus">+</span>
                      </summary>
                      <div className="fold-body">
                        <label>
                          <span className="label-sm">Deadline</span>
                          <input className="field-sm" type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
                        </label>
                        <label>
                          <span className="label-sm">Project file link</span>
                          <input
                            className="field-sm"
                            type="url"
                            inputMode="url"
                            placeholder="https://…"
                            value={form.link}
                            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                          />
                        </label>
                      </div>
                    </details>
                  </section>
                </div>

                <div className="bar">
                  <div className="hint">
                    {!form.client.length || !form.taskType.length ? "Pick a client + task type to submit" : `${active.label} · ${form.minutes} min · ${form.client.join(", ")}`}
                  </div>
                  <button className="bar-btn" onClick={() => markSlot("break")} title="Mark this slot as break / idle (not sent to Notion)">
                    Break
                  </button>
                  <button className="bar-btn" onClick={() => markSlot("skip")} title="Skip this slot">
                    Skip
                  </button>
                  <button key={flash} className={`submit${flash ? " flash" : ""}`} disabled={!canSubmit} onClick={submit}>
                    <span>{submitting ? "Sending…" : "Submit task"}</span>
                    <span className="kbd">⌘↵</span>
                    <span>→</span>
                  </button>
                </div>
              </>
            )}
          </main>

          <aside className="aside" aria-label="Today">
            <TodayPanel today={today} pending={pending} nowMs={nowMs} activeSlotId={active?.id} onUndo={undo} onPick={setActiveSlotId} />
          </aside>
        </div>
      </div>

      {drawer === "today" && (
        <>
          <div className="scrim" onClick={() => setDrawer(null)} />
          <aside className="drawer" role="dialog" aria-label="Today">
            <div className="drawer-h">
              <span className="mono mut">Today</span>
              <button className="btn-ghost" onClick={() => setDrawer(null)}>
                Close
              </button>
            </div>
            <TodayPanel
              today={today}
              pending={pending}
              nowMs={nowMs}
              activeSlotId={active?.id}
              onUndo={undo}
              onPick={(id) => {
                setActiveSlotId(id);
                setDrawer(null);
              }}
            />
          </aside>
        </>
      )}

      {drawer === "settings" && (
        <SettingsDrawer
          settings={today.settings}
          onClose={() => setDrawer(null)}
          onSaved={() => refresh()}
          onLogout={logout}
          notify={say}
        />
      )}

      {promptTarget && !stateOf(promptTarget) && (
        <div className="takeover" role="alertdialog" aria-label="Log your last block">
          <div className="mono">TaskPulse · time check</div>
          <h1>
            <span>What did you do</span>
            {fmt(promptTarget.startMin)}
            <br />– {fmt(promptTarget.endMin)}?
          </h1>
          <div className="acts">
            <button
              className="primary"
              onClick={() => {
                setActiveSlotId(promptTarget.id);
                setPromptSlot(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Log now →
            </button>
            <button
              disabled={!last}
              onClick={() => {
                const id = promptTarget.id;
                setPromptSlot(null);
                sameAsLast(id);
              }}
            >
              Same as last
            </button>
            <button
              onClick={() => {
                snoozeRef.current.set(promptTarget.id, Date.now() + offsetRef.current + 5 * 60000);
                api.snooze(promptTarget.id, 5).catch(() => undefined);
                setPromptSlot(null);
              }}
            >
              Snooze 5
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast${toast.err ? " err" : ""}`} role="status">
          {toast.msg}
        </div>
      )}
    </>
  );
}
