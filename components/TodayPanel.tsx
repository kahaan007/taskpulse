"use client";

import { useMemo } from "react";
import type { Entry, LogInput, SlotView, TodayResponse } from "@/lib/types";

interface Props {
  today: TodayResponse;
  pending: LogInput[];
  nowMs: number;
  activeSlotId?: string | null;
  onUndo: () => void;
  onPick: (slotId: string) => void;
}

const hm = (iso: string, tz: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));

export default function TodayPanel({ today, pending, nowMs, activeSlotId, onUndo, onPick }: Props) {
  const slotsById = useMemo(() => new Map(today.slots.map((s) => [s.id, s])), [today.slots]);

  const pendingEntries: Entry[] = pending
    .filter((p) => slotsById.has(p.slotId) && !today.slots.find((s) => s.id === p.slotId)?.state)
    .map((p) => ({
      id: `pending-${p.entryId}`,
      title: p.description?.trim() || [p.taskType.join(", "), p.client.join(", ")].filter(Boolean).join(" — "),
      minutes: p.minutes,
      client: p.client,
      goal: p.goal,
      taskType: p.taskType,
      start: slotsById.get(p.slotId)!.startISO,
    }));

  const entries = [...today.entries, ...pendingEntries].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const total = entries.reduce((a, e) => a + (e.minutes || 0), 0);

  const perClient = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of entries) {
      const names = e.client.length ? e.client : ["(no client)"];
      for (const c of names) m.set(c, (m.get(c) || 0) + (e.minutes || 0) / names.length);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [entries]);
  const max = perClient[0]?.[1] || 1;

  const pendingSlots = new Set(pending.map((p) => p.slotId));
  const cellState = (s: SlotView) => s.state || (pendingSlots.has(s.id) ? "logged" : undefined);
  const endMs = (s: SlotView) => new Date(s.endISO).getTime();
  const startMs = (s: SlotView) => new Date(s.startISO).getTime();

  return (
    <div className="panel">
      <div>
        <div className="mono mut">{today.date}</div>
        <h2>
          {Math.floor(total / 60)}h {String(total % 60).padStart(2, "0")}m logged
        </h2>
      </div>

      <div>
        <span className="label-sm">Slots · {today.slots.length}</span>
        <div className="cells" style={{ gridTemplateColumns: `repeat(${Math.min(18, Math.max(6, today.slots.length / 2))}, 1fr)` }}>
          {today.slots.map((s) => {
            const st = cellState(s);
            const missed = !st && nowMs >= endMs(s);
            const cur = nowMs >= startMs(s) && nowMs < endMs(s);
            return (
              <button
                key={s.id}
                type="button"
                className="cell"
                data-s={st || ""}
                data-missed={missed ? 1 : 0}
                data-cur={cur ? 1 : 0}
                title={`${s.label}${st ? " · " + st : missed ? " · unlogged" : ""}`}
                aria-label={`${s.label} ${st || (missed ? "unlogged" : "upcoming")}`}
                onClick={() => !st && nowMs >= startMs(s) && onPick(s.id)}
                style={s.id === activeSlotId ? { outline: "2px solid var(--acc)", outlineOffset: 1 } : undefined}
              />
            );
          })}
        </div>
        <div className="mono mut" style={{ marginTop: 8, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <span>■ logged</span>
          <span style={{ color: "var(--err)" }}>□ missed</span>
          <span>▨ skipped</span>
        </div>
      </div>

      {perClient.length > 0 && (
        <div>
          <span className="label-sm">By client</span>
          <div className="bars">
            {perClient.slice(0, 6).map(([name, mins]) => (
              <div className="bar-row" key={name}>
                <div className="top-r">
                  <span>{name}</span>
                  <span className="mono">{Math.round(mins)}m</span>
                </div>
                <div className="track">
                  <i style={{ width: `${(mins / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span className="label-sm" style={{ margin: 0 }}>Timeline</span>
          {today.canUndo && (
            <button type="button" className="btn-ghost" onClick={onUndo}>
              Undo last
            </button>
          )}
        </div>
        {entries.length === 0 ? (
          <div className="empty">Nothing logged yet today.</div>
        ) : (
          <div className="entries">
            {entries.map((e) => (
              <div key={e.id} className={`entry${e.id.startsWith("pending-") ? " pending" : ""}`}>
                <time>{e.start ? hm(e.start, today.tz) : "--:--"}</time>
                <div>
                  <b>{e.title}</b>
                  <small>{[e.client.join(", "), e.taskType.join(", ")].filter(Boolean).join(" · ")}</small>
                  {e.id.startsWith("pending-") && <small style={{ color: "var(--acc)" }}>PENDING SYNC</small>}
                </div>
                <span className="mins">{e.minutes}m</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
