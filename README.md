# TaskPulse

Active task logging for your Notion **Daily Task Manager**. Every 15 minutes (Mon–Fri, 9:30 AM–6:30 PM IST) it nudges you. You tap chips and hit **Submit task**; a page lands in the database.

Prompts fire at the *end* of each block: 9:45, 10:00 … 6:30 PM (36 per day), each asking about the block that just finished.

## 1. Notion
1. Create an internal integration: https://www.notion.so/profile/integrations
2. Open **Daily Task Manager** → `…` → *Connections* → add the integration.
3. Put the token in `NOTION_TOKEN`. The data source ID is already in `.env.example`.
4. Optional: `NOTION_USER_ID` (from `GET /v1/users`) so *Assignee* is set to you.

The database's title property is named **Time Taken**; TaskPulse writes the task description there (auto-titled "Task type — Client" if left blank). **Minutes** holds the duration. Dropdown options are read live from Notion, so new clients and task types appear without a deploy.

## 2. Run locally
```bash
cp .env.example .env.local   # fill it in
npm install
npm run dev
```
With no Notion token the app runs in **demo mode** (entries stay local) so you can try the UI.

## 3. Push notifications (reminders when the tab is closed)
```bash
npm run vapid                # prints a public/private key pair
```
Set `VAPID_PUBLIC_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (same public key), `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`. Open the app → **Settings → Enable on this device**, then **Send test**. On iPhone, first *Add to Home Screen* (iOS 16.4+).

## 4. Deploy (Vercel)
1. Push to GitHub, import in Vercel, add all env vars.
2. Add Upstash Redis / Vercel KV (`KV_REST_API_URL`, `KV_REST_API_TOKEN`) — needed for slot state and subscriptions in production.
3. Set `APP_PASSCODE`, `SESSION_SECRET`, `CRON_SECRET`.

### Cron
`vercel.json` calls `/api/cron/tick` every 5 minutes, Mon–Fri, 04:00–13:59 UTC (= 9:30–19:29 IST). That needs a Vercel **Pro** plan (Hobby only allows daily crons and will reject the deploy).

For tighter timing, or on Hobby, delete `vercel.json` and have any scheduler hit this every minute:
```
GET https://YOUR-APP/api/cron/tick
Authorization: Bearer <CRON_SECRET>
```
(cron-job.org and GitHub Actions both work). The endpoint is idempotent: each slot is pushed once, and it does nothing on weekends, holidays, outside the window, or in quiet mode.

## Behaviour notes
- **Date Created** is set to the start of the slot being logged, in IST.
- **Minutes > interval** (e.g. 30) also marks the preceding unlogged slot(s) as covered so you aren't re-prompted.
- **Break** and **Skip** mark a slot locally; nothing is written to Notion.
- **Offline**: failed submits queue in IndexedDB and retry; each entry has an idempotency key so retries never double-post.
- **Undo last** moves the most recent Notion page to trash.
- Notification actions: *Log now*, *Same as last* (logs instantly), *Snooze 5 min* (re-nudged on the next cron tick after 5 min).
- Change hours, interval, weekdays, holidays and quiet mode in **Settings**. If you change the hours, also adjust the cron window in `vercel.json`.

## Layout
```
app/api/*        auth, schema, today, log (POST/DELETE/PUT), settings, snooze, push, cron/tick
components/      App (form + takeover prompt), TodayPanel, SettingsDrawer, ui chips
lib/             notion.ts, day.ts (slots + logging), push.ts, store.ts, time.ts
public/sw.js     push + notification actions
```
