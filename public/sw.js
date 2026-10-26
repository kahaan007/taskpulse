/* TaskPulse service worker: push notifications + quick actions */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "TaskPulse", body: event.data ? event.data.text() : "" };
  }
  const slotId = data.slotId;
  const options = {
    body: data.body || "",
    tag: data.tag || "taskpulse",
    renotify: true,
    requireInteraction: true,
    icon: "/icon.svg",
    badge: "/icon.svg",
    data: { slotId, url: data.url || "/" },
    actions: slotId
      ? [
          { action: "log", title: "Log now" },
          { action: "same", title: "Same as last" },
          { action: "snooze", title: "Snooze 5 min" },
        ]
      : [],
  };
  event.waitUntil(self.registration.showNotification(data.title || "TaskPulse", options));
});

function uuid() {
  return self.crypto && self.crypto.randomUUID ? self.crypto.randomUUID() : String(Date.now()) + Math.random();
}

self.addEventListener("notificationclick", (event) => {
  const { slotId, url } = event.notification.data || {};
  event.notification.close();

  if (event.action === "same" && slotId) {
    event.waitUntil(
      fetch("/api/log", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: uuid(), slotId, repeatLast: true, minutes: 0 }),
      })
        .then((r) =>
          r.ok
            ? self.registration.showNotification("Logged", { body: "Same as last entry saved.", tag: "done-" + slotId, icon: "/icon.svg" })
            : self.clients.openWindow(url || "/"),
        )
        .catch(() => self.clients.openWindow(url || "/")),
    );
    return;
  }

  if (event.action === "snooze" && slotId) {
    event.waitUntil(
      fetch("/api/snooze", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, minutes: 5 }),
      }).catch(() => undefined),
    );
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) {
          c.postMessage({ type: "open-slot", slotId });
          return c.focus();
        }
      }
      return self.clients.openWindow(url || "/");
    }),
  );
});
