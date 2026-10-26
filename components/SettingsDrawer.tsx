"use client";

import { useState } from "react";
import { api, enablePush } from "@/lib/client";
import type { Settings } from "@/lib/types";
import { Toggle } from "./ui";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

interface Props {
  settings: Settings;
  onClose: () => void;
  onSaved: (s: Settings) => void;
  onLogout: () => void;
  notify: (msg: string, err?: boolean) => void;
}

export default function SettingsDrawer({ settings, onClose, onSaved, onLogout, notify }: Props) {
  const [s, setS] = useState<Settings>(settings);
  const [holidays, setHolidays] = useState(settings.holidays.join("\n"));
  const [theme, setTheme] = useState<string>(() =>
    typeof document !== "undefined" ? document.documentElement.dataset.theme || "system" : "system",
  );
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const saved = await api.saveSettings({
        ...s,
        holidays: holidays
          .split(/[\s,]+/)
          .map((x) => x.trim())
          .filter(Boolean),
      });
      onSaved(saved);
      notify("Settings saved");
      onClose();
    } catch (e) {
      notify((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  };

  const setThemePref = (t: string) => {
    setTheme(t);
    if (t === "system") {
      delete document.documentElement.dataset.theme;
      localStorage.removeItem("tp-theme");
    } else {
      document.documentElement.dataset.theme = t;
      localStorage.setItem("tp-theme", t);
    }
  };

  const turnOnPush = async () => {
    try {
      const r = await enablePush();
      if (r === "ok") notify("Notifications on for this device");
      else if (r === "denied") notify("Permission denied in the browser", true);
      else if (r === "not-configured") notify("Server has no VAPID keys yet — see README", true);
      else notify("This browser doesn't support push", true);
    } catch (e) {
      notify((e as Error).message, true);
    }
  };

  const testPush = async () => {
    try {
      const r = await api.pushTest();
      notify(r.sent ? `Sent to ${r.sent} device(s)` : "No subscribed devices", !r.sent);
    } catch (e) {
      notify((e as Error).message, true);
    }
  };

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label="Settings">
        <div className="drawer-h">
          <h2 style={{ margin: 0, fontWeight: 900, fontStretch: "125%", fontSize: 22, letterSpacing: "-0.03em" }}>Settings</h2>
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </div>

        <div className="panel" style={{ gap: 24 }}>
          <div>
            <span className="label-sm">Notifications</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn-ghost" onClick={turnOnPush}>Enable on this device</button>
              <button className="btn-ghost" onClick={testPush}>Send test</button>
            </div>
          </div>

          <Toggle label="Quiet mode" hint="Pause all reminders" on={s.quiet} onChange={(v) => setS({ ...s, quiet: v })} />

          <div className="row2" style={{ gap: 12 }}>
            <label>
              <span className="label-sm">Start</span>
              <input className="field-sm" type="time" value={s.start} onChange={(e) => setS({ ...s, start: e.target.value })} />
            </label>
            <label>
              <span className="label-sm">End</span>
              <input className="field-sm" type="time" value={s.end} onChange={(e) => setS({ ...s, end: e.target.value })} />
            </label>
          </div>

          <label>
            <span className="label-sm">Interval</span>
            <select className="field-sm" value={s.interval} onChange={(e) => setS({ ...s, interval: Number(e.target.value) })}>
              {[5, 10, 15, 20, 30, 60].map((n) => (
                <option key={n} value={n}>
                  Every {n} min
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="label-sm">Active days</span>
            <div className="days">
              {DAYS.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={s.weekdays.includes(i)}
                  aria-label={["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i]}
                  onClick={() => setS({ ...s, weekdays: s.weekdays.includes(i) ? s.weekdays.filter((x) => x !== i) : [...s.weekdays, i] })}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <label>
            <span className="label-sm">Holidays to skip (YYYY-MM-DD, one per line)</span>
            <textarea
              className="field-sm"
              style={{ padding: 12, minHeight: 96, fontFamily: "var(--mono)", fontSize: 13 }}
              value={holidays}
              onChange={(e) => setHolidays(e.target.value)}
              placeholder={"2026-11-08\n2026-12-25"}
            />
          </label>

          <div>
            <span className="label-sm">Theme</span>
            <div className="seg">
              {["system", "dark", "light"].map((t) => (
                <button key={t} type="button" aria-pressed={theme === t} onClick={() => setThemePref(t)} style={{ textTransform: "capitalize" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="submit" style={{ flex: 1 }} onClick={save} disabled={busy}>
              Save settings
            </button>
            <button className="bar-btn" onClick={onLogout}>Log out</button>
          </div>
          <p className="mono mut" style={{ margin: 0, lineHeight: 1.6 }}>
            Changing window or interval takes effect for reminders from the next tick. The cron schedule itself lives in vercel.json.
          </p>
        </div>
      </aside>
    </>
  );
}
