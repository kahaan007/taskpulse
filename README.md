# TaskPulse · Notion-Inspired Precision Workspace

> **"Good design is as little design as possible. Less, but better — because it concentrates on the essential aspects, and the products are not burdened with non-essentials."**  
> — Dieter Rams

TaskPulse is a calm, precise, and premium workspace for design and product engineering teams, combining the structure and flexibility of Notion with the timeless utilitarian discipline of Dieter Rams and Braun industrial design. TaskPulse bridges long-form product specifications, database project tracking, and an active 15-minute slot pulse rhythm synchronized with Notion's **Daily Task Manager**.

---

## 1. Design Rationale & Dieter Rams' 10 Principles

| Principle | TaskPulse Implementation |
| :--- | :--- |
| **1. Innovative** | Unifies Notion block editing with active 15-minute slot tracking, eliminating manual timesheets through silent ambient interval logging. |
| **2. Makes a product useful** | Content and typography are heroes; UI chrome recedes into the background until invoked by hover, focus, or keyboard shortcut. |
| **3. Aesthetic** | Restrained Braun palette (warm off-white `#F7F6F3` / low-glare obsidian `#141413`) with strict modular typography (12/13/14/16/20/28/40) and 1px hairline borders. |
| **4. Understandable** | Self-explanatory controls with plain English labels, predictable drag handles (`⋮⋮`), and clear status indicators. |
| **5. Unobtrusive** | Controls rest quietly. Drag handles and block action buttons only appear on block hover. No decorative shadows-for-shadows'-sake or gradient noise. |
| **6. Honest** | No artificial gamification or deceptive animations. System state is always transparent ("Saved just now", live sync pulse dot). |
| **7. Long-lasting** | Timeless typography pairing Inter (neutral Swiss sans) and Newsreader (literary editorial serif). Free from transient UI fads. |
| **8. Thorough to the last detail** | 4px base grid with 8px rhythm, pixel-snapped borders, animated checkbox stroke-draw, and considered skeleton shimmer states instead of cheap spinners. |
| **9. Environmentally conscious** | Extremely lightweight DOM, minimal layout shifts, offline-first IndexedDB caching, and high contrast energy efficiency. |
| **10. As little design as possible** | Only one accent color permitted across the entire system: **Signal Orange (`#E8590C`)**. Everything else is neutral. |

---

## 2. Visual System & Design Tokens

### Color Palette (Braun Industrial Instrument)
- **Light Theme**:
  - Background (Warm off-white): `#F7F6F3`
  - Surface: `#FFFFFF`
  - Sunken: `#EFEEEA`
  - Border: `#E4E2DC` (Hover: `#D0CDC4`, Strong: `#B8B5AB`)
  - Primary Text: `#1A1A18`
  - Secondary Text: `#6B6A65`
  - Tertiary Text: `#9C9A93`
- **Dark Theme**:
  - Background (Obsidian): `#141413`
  - Surface: `#1C1C1A`
  - Sunken: `#181816`
  - Border: `#2B2B28` (Hover: `#3D3D38`)
  - Primary Text: `#ECEAE4`
  - Secondary Text: `#8E8C85`
  - Tertiary Text: `#5E5D57`
- **One Signal Accent Only**:
  - Signal Orange: `#E8590C` (Hover: `#D14F0A`, Subtle tint: `rgba(232, 89, 12, 0.08)`)
  - Focus Ring: `2px solid #E8590C` (WCAG 2.2 AA compliant)
- **Functional Semantic Status**:
  - Desaturated Green: `#2E7D32` (Done / Active)
  - Desaturated Amber: `#ED6C02` (In Review / Warning)
  - Desaturated Crimson: `#D32F2F` (Urgent / Error)

### Typography
- **Modular Scale**: `12px` (micro), `13px` (caption), `14px` (UI), `16px` (body), `20px` (H2), `28px` (H1), `40px` (Page Title).
- **Fonts**:
  - `Inter`: UI chrome and structured documentation.
  - `Newsreader`: Editorial long-form reading (toggleable in top bar).
  - `JetBrains Mono`: Code blocks, duration badges, and metadata.
- **Max reading width**: `720px` for optimal typographic line measure (55–75 characters per line).

---

## 3. Keyboard Shortcuts

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> | Open Command Palette / Quick Find | Global |
| <kbd>⌘\</kbd> / <kbd>Ctrl+\</kbd> | Toggle Sidebar collapse / expand | Global |
| <kbd>⌘⇧F</kbd> / <kbd>Ctrl+Shift+F</kbd> | Toggle Zen Focus Mode (hides all chrome) | Global |
| <kbd>⌘Z</kbd> / <kbd>Ctrl+Z</kbd> | Undo last action with toast notification | Global |
| <kbd>Esc</kbd> | Close Command Palette, Exit Focus Mode, dismiss popovers | Global |
| <kbd>/</kbd> | Open Block Slash Menu with fuzzy search | Block Editor |
| <kbd># Space</kbd> | Transform block into Heading 1 | Block Editor |
| <kbd>## Space</kbd> | Transform block into Heading 2 | Block Editor |
| <kbd>### Space</kbd> | Transform block into Heading 3 | Block Editor |
| <kbd>[] Space</kbd> | Transform block into To-do Item | Block Editor |
| <kbd>- Space</kbd> | Transform block into Bulleted list | Block Editor |
| <kbd>1. Space</kbd> | Transform block into Numbered list | Block Editor |
| <kbd>&gt; Space</kbd> | Transform block into Quote block | Block Editor |
| <kbd>---</kbd> | Insert hairline Divider | Block Editor |

---

## 4. Key Screens Implemented

1. **Home / Dashboard**:
   - Ambient greeting with IST time
   - 36-slot 15-minute visual rhythm meter (9:30 AM–6:30 PM window)
   - Pinned and recently visited cards
   - Active tasks in progress
   - Quiet activity feed
2. **Block-Based Page Editor**:
   - Text, Headings 1–3, To-do with animated checkbox stroke-draw, Bullet & Numbered lists, Toggle accordions, Quotes, Callouts, Syntax Code block with line numbers & copy button, Dividers, Tables, and live TaskPulse Nudge embeds.
   - Hover-reveal drag handles (`⋮⋮`) and add buttons (`+`).
   - Fuzzy slash command menu with keyboard navigation.
   - Live Serif / Sans typography toggle.
3. **Database Views**:
   - 5 Views: **Table**, **Board (Kanban)**, **List**, **Gallery**, **Calendar**.
   - Filter, Sort, and Search popovers.
   - Inline property editing (Status, Priority, Assignee, Pulse Minutes, Due Date).
   - Row Peek side panel modal for in-depth inspection.
4. **Command Palette (`Cmd+K`)**:
   - Accessible combobox dialog with fuzzy search.
   - Categorized by Pages, Actions, Database Views, and TaskPulse Rhythm commands.
5. **Settings & Workspace**:
   - Team members with roles (Owner, Admin, Member, Guest) and invite modal.
   - Appearance controls (Light, Dark, System, Font choice, Density).
   - Notion API connection details and VAPID Web Push nudge test button.
6. **UX States Preview (Skeletons, Empty, Error)**:
   - Accessible from the top bar "State: normal / loading / empty / error" switcher.
   - Skeleton loading state with peaceful shimmer (no cheap spinners).
   - Reassuring empty state with quick starter templates.
   - Human error state with explanatory copy and retry recovery action.
7. **Mobile-First Task-Logging Experience (Primary Default Interface)**:
   - **Mobile-First by Default**: The entire application loads the mobile task logger first for instant capture on any screen or device.
   - **Native iOS Status Bar**: Live tabular clock, cellular signal, 5G, and battery indicator.
   - **Dynamic Island**: Centered interactive pill with live Notion status (`● NOTION LIVE`), pulsing animation during sync, and checkmark morph on success.
   - **1-Tap Speed Presets**: Horizontal quick-fill carousel (`Repeat Last`, `Design System`, `Client Standup`, `UX Research`, `UI Tweak`) to complete 5/5 fields in a single tap.
   - **Desktop Shell Modes**: On larger screens, provides an authentic iPhone 16 Pro mockup frame with a floating switcher between `iPhone Bezel`, `Fluid Mobile`, and `Full Workspace Docs`.
   - **Client Dropdown Bottom Sheet**: Searchable modal bottom sheet with "Recent" group and alphabetical A–Z sticky headers.
   - **Project Dropdown Bottom Sheet**: Dependent on client, displays active project roster.
   - **Task Type Dropdown Bottom Sheet**: Searchable modal bottom sheet preloaded with all **36 available Notion task types** (categorized with custom Dieter Rams icons, "Recent" group for last 3 used, search bar auto-focused, and A–Z index).
   - **Duration Touch Chips & Stepper**: 48px tactile pills (`15m`, `30m`, `1h`, `2h`, `4h`) plus precision 15-minute stepping buttons.
   - **What did you do?**: High-contrast textarea with minimum 10-character validation.
   - **Sticky Pinned Submit Bar**: 56px thumb-zone button with dynamic missing-field validation helper, gentle shake on invalid tap, and 300ms checkmark morph on success.
   - **iOS Home Indicator Bar**: Authentic 134x5px rounded pill pinned at the bottom.
   - **Live Notion Sync & Undo**: Direct POST to Notion's `Daily Task Manager` database with 5s undo toast.

---

## 5. Development & Testing

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Check TypeScript types
npm run typecheck
```
