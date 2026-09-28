self.addEventListener("push", (event) => {
  let payload;
  try { payload = event.data?.json(); } catch { payload = null; }
  if (!payload || typeof payload.title !== "string") return;
  const href = typeof payload.href === "string" && /^\/orders\/[0-9a-f-]{36}$/i.test(payload.href) ? payload.href : "/notifications";
  event.waitUntil(self.registration.showNotification(payload.title, {
    body: typeof payload.body === "string" ? payload.body : "",
    icon: "/brand/sipp-app-icon.png",
    tag: typeof payload.id === "string" ? payload.id : undefined,
    data: { href },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = event.notification.data?.href;
  const href = typeof raw === "string" && /^\/orders\/[0-9a-f-]{36}$/i.test(raw) ? raw : "/notifications";
  event.waitUntil((async () => {
    const target = new URL(href, self.location.origin).href;
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = windows.find((client) => new URL(client.url).origin === self.location.origin);
    if (existing) { await existing.focus(); await existing.navigate(target); }
    else await self.clients.openWindow(target);
  })());
});
