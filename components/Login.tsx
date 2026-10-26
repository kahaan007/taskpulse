"use client";

import { useState } from "react";
import { api } from "@/lib/client";

export default function Login({ onDone }: { onDone: () => void }) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api.login(pass);
      onDone();
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="login" onSubmit={go}>
      <div className="mono mut">TaskPulse · Notion task logger</div>
      <h1>
        Log<br />
        <em>every</em><br />
        15 min.
      </h1>
      <div style={{ display: "grid", gap: 12 }}>
        <input
          className="field"
          type="password"
          autoFocus
          autoComplete="current-password"
          placeholder="Passcode"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          aria-label="Passcode"
        />
        {err && <div className="mono" style={{ color: "var(--err)" }}>{err}</div>}
        <button className="submit" disabled={busy || !pass}>
          Enter <span>→</span>
        </button>
      </div>
    </form>
  );
}
