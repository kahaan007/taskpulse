"use client";

import { useMemo, useState } from "react";
import type { Opt } from "@/lib/types";

const COLORS: Record<string, string> = {
  default: "#8a8a8a",
  gray: "#9b9a97",
  brown: "#a1724f",
  orange: "#e0782f",
  yellow: "#d9a21b",
  green: "#3f9e6b",
  blue: "#3d85d6",
  purple: "#8a63d2",
  pink: "#d4559c",
  red: "#d9453c",
};

export const dotColor = (c?: string) => COLORS[c || "default"] || COLORS.default;

export function Chip({ opt, on, onClick }: { opt: Opt; on: boolean; onClick: () => void }) {
  return (
    <button type="button" className="chip" aria-pressed={on} onClick={onClick}>
      <span className="dot" style={{ ["--dot" as string]: dotColor(opt.color) }} />
      {opt.name}
    </button>
  );
}

interface ChipGroupProps {
  options: Opt[];
  selected: string[];
  onToggle: (name: string) => void;
  /** names to float to the top (recently / frequently used) */
  favorites?: string[];
  searchable?: boolean;
  placeholder?: string;
  collapsedCount?: number;
}

export function ChipGroup({ options, selected, onToggle, favorites = [], searchable, placeholder, collapsedCount = 12 }: ChipGroupProps) {
  const [q, setQ] = useState("");
  const [all, setAll] = useState(false);

  const ordered = useMemo(() => {
    const sel = new Set(selected);
    const fav = new Set(favorites);
    const rank = (o: Opt) => (sel.has(o.name) ? 0 : fav.has(o.name) ? 1 : 2);
    return [...options].sort((a, b) => rank(a) - rank(b));
  }, [options, selected, favorites]);

  const query = q.trim().toLowerCase();
  const filtered = query ? ordered.filter((o) => o.name.toLowerCase().includes(query)) : ordered;
  const shown = query || all ? filtered : filtered.slice(0, collapsedCount);
  const hidden = filtered.length - shown.length;

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {searchable && options.length > collapsedCount && (
        <input
          className="search"
          type="search"
          placeholder={placeholder || "Search…"}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label={placeholder || "Search options"}
        />
      )}
      <div className="chips" role="group">
        {shown.map((o) => (
          <Chip key={o.name} opt={o} on={selected.includes(o.name)} onClick={() => onToggle(o.name)} />
        ))}
        {!query && hidden > 0 && (
          <button type="button" className="more" onClick={() => setAll(true)}>
            + {hidden} more
          </button>
        )}
        {!query && all && filtered.length > collapsedCount && (
          <button type="button" className="more" onClick={() => setAll(false)}>
            Show less
          </button>
        )}
        {query && filtered.length === 0 && <span className="mono mut">No match</span>}
      </div>
    </div>
  );
}

export function Seg({
  options,
  value,
  onChange,
  allowClear,
}: {
  options: Opt[];
  value?: string;
  onChange: (v: string | undefined) => void;
  allowClear?: boolean;
}) {
  return (
    <div className="seg" role="group">
      {options.map((o) => (
        <button
          key={o.name}
          type="button"
          aria-pressed={value === o.name}
          onClick={() => onChange(allowClear && value === o.name ? undefined : o.name)}
        >
          <span className="dot" style={{ ["--dot" as string]: dotColor(o.color) }} />
          {o.name}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ label, hint, on, onChange }: { label: string; hint?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="toggle">
      <div>
        <div style={{ fontWeight: 700 }}>{label}</div>
        {hint && <div className="mono mut" style={{ marginTop: 2 }}>{hint}</div>}
      </div>
      <button type="button" role="switch" aria-checked={on} aria-label={label} className="switch" onClick={() => onChange(!on)}>
        <i />
      </button>
    </div>
  );
}
