// Service worker mínimo, solo para que la app sea instalable como PWA.
// No cachea nada — todo pasa siempre por la red, así los datos nunca quedan viejos.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
