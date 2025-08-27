self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const u = new URL(req.url);

  // Only same-origin; only the endpoints we care about
  const inScope = (u.origin === self.location.origin) &&
                  (u.pathname.startsWith('/api/') || u.pathname.startsWith('/ows/'));

  if (!inScope) return;

  event.respondWith((async () => {
    // Let the network happen
    const res = await fetch(req);
    // Clone so we can read the body without consuming it
    const clone = res.clone();

    // Try to read text regardless; guard errors/opaque
    clone.text().then((text) => {
      const ct = clone.headers.get('content-type') || '';
      // Heuristic: content-type says xml/text OR it looks like XML
      const looksXml = ct.includes('xml') || ct.includes('text') ||
                       /^\s*<\??xml|^\s*<\w+/.test(text);
      if (looksXml) {
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
          .then((clients) => {
            clients.forEach((c) => c.postMessage({
              source: 'sw',
              url: u.href,
              contentType: ct,
              text
            }));
          });
      } else {
        // Debug: tell us we intercepted but skipped (uncomment if needed)
        // self.clients.matchAll({type:'window', includeUncontrolled:true})
        //   .then(cs => cs.forEach(c => c.postMessage({source:'sw', skipped:true, url: u.href, contentType: ct })));
      }
    }).catch(() => {
      // Opaque or non-readable body → nothing we can do
    });

    return res;
  })());
});
