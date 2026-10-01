// Laat de app lokaal precies zo werken als op claude.ai: dezelfde claude.use()-aanroepen,
// maar dan via de lokale server (Claude Code op je Mac en JSON-bestanden in de map data).
(function () {
  async function call(input, opts) {
    const r = await fetch("/api/claude", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input, tier: (opts && opts.modelTier) || "default" }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw { code: "local", local: true, message: j.error || "De lokale server gaf een fout." };
    return j.text;
  }
  const sample = async (input, opts) => ({ text: await call(input, opts), truncated: false });
  sample.json = async (input, opts) => {
    const text = await call(input + "\n\nReturn only valid JSON, no code fences.", opts);
    const m = text.match(/\{[\s\S]*\}/);
    try {
      return JSON.parse(m ? m[0] : text);
    } catch {
      throw { code: "local", local: true, message: "Claude gaf geen leesbaar antwoord. Probeer het opnieuw." };
    }
  };

  const name = (p) => p.split("/").pop();
  const db = {
    doc(p) {
      const n = name(p);
      return {
        async get() {
          const r = await fetch("/api/data/" + n);
          if (r.status === 404) return { exists: false, data: () => undefined };
          if (!r.ok) throw { code: "unavailable" };
          const body = await r.json();
          return { exists: true, data: () => body };
        },
        async set(body) {
          const r = await fetch("/api/data/" + n, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
          if (!r.ok) throw { code: "unavailable" };
        },
      };
    },
  };
  const user = { id: async () => "local", isOwner: () => true };
  const caps = { sample, db, user };
  window.claude = { local: true, use: async (n) => caps[n] || null };
})();
