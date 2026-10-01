// Werkengels lokale server: serveert de app en geeft hem toegang tot Claude en opslag op je eigen Mac.
// Geen npm-pakketten nodig, alleen Node.js.
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn, execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT || 4321);
const DATA_DIR = path.join(ROOT, "data");
const APP_FILE = path.join(ROOT, "app", "werkengels.html");
const SHIM_FILE = path.join(ROOT, "web", "local-shim.js");

fs.mkdirSync(DATA_DIR, { recursive: true });
loadEnv(path.join(ROOT, ".env"));

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

// ---------- Claude ----------
const MODELS = {
  cli: { quick: "haiku", default: "sonnet", complex: "opus" },
  api: { quick: "claude-haiku-4-5-20251001", default: "claude-sonnet-5-5", complex: "claude-opus-5-5" },
};

function findClaude() {
  const home = os.homedir();
  const candidates = [
    process.env.CLAUDE_BIN,
    path.join(home, ".claude", "local", "claude"),
    path.join(home, ".local", "bin", "claude"),
    "/opt/homebrew/bin/claude",
    "/usr/local/bin/claude",
  ].filter(Boolean);
  for (const c of candidates) if (fs.existsSync(c)) return c;
  try {
    const p = execFileSync("/bin/sh", ["-lc", "command -v claude"], { encoding: "utf8" }).trim().split("\n").pop();
    return p && fs.existsSync(p) ? p : null;
  } catch {
    return null;
  }
}
const CLAUDE_BIN = findClaude();

// Zet een gesprek (rollenspel) om naar één prompt voor de CLI.
function toPrompt(input) {
  if (typeof input === "string") return input;
  const [first, ...rest] = input;
  if (!rest.length) return first.content;
  const lines = rest.map((m) => (m.role === "assistant" ? "YOU: " : "LEARNER: ") + m.content).join("\n\n");
  return `${first.content}\n\nConversation so far:\n${lines}\n\nWrite only your next line as YOU, nothing else.`;
}

function runCli(prompt, tier, minimal) {
  return new Promise((resolve, reject) => {
    const args = ["-p", "--output-format", "json", "--model", MODELS.cli[tier] || "sonnet"];
    if (!minimal) args.push("--tools", "", "--strict-mcp-config", "--no-session-persistence");
    const child = spawn(CLAUDE_BIN, args, { cwd: os.tmpdir(), env: process.env });
    let out = "", err = "";
    const timer = setTimeout(() => child.kill("SIGTERM"), 150000);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", (e) => { clearTimeout(timer); reject(e); });
    child.on("close", (code) => {
      clearTimeout(timer);
      try {
        const j = JSON.parse(out);
        if (j.is_error) return reject(new Error(j.result || "Claude gaf een fout."));
        return resolve(String(j.result || ""));
      } catch {
        if (!minimal && /unknown option|unrecognized/i.test(err)) return runCli(prompt, tier, true).then(resolve, reject);
        reject(new Error((err || out || `Claude stopte met code ${code}`).slice(0, 400)));
      }
    });
    child.stdin.end(prompt);
  });
}

async function runApi(input, tier) {
  const messages = typeof input === "string" ? [{ role: "user", content: input }] : input;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model: MODELS.api[tier] || MODELS.api.default, max_tokens: 2000, messages }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || `API-fout ${r.status}`);
  return j.content.filter((c) => c.type === "text").map((c) => c.text).join("");
}

async function askClaude(input, tier) {
  if (CLAUDE_BIN) return runCli(toPrompt(input), tier);
  if (process.env.ANTHROPIC_API_KEY) return runApi(input, tier);
  throw new Error("Claude Code is niet gevonden op deze Mac. Installeer Claude Code en log in, of zet een ANTHROPIC_API_KEY in het bestand .env.");
}

// ---------- HTTP ----------
function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = "";
    req.on("data", (d) => {
      b += d;
      if (b.length > 2e6) req.destroy();
    });
    req.on("end", () => resolve(b));
    req.on("error", reject);
  });
}
const FAVICON = `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0F766E"/><stop offset="1" stop-color="#B8650F"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><text x="32" y="44" font-family="Arial" font-weight="700" font-size="34" fill="#fff" text-anchor="middle">W</text></svg>')}">`;

function page() {
  const app = fs.readFileSync(APP_FILE, "utf8");
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">${FAVICON}<script src="/local-shim.js"></script></head><body>${app}</body></html>`;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === "GET" && url.pathname === "/") return send(res, 200, page(), "text/html; charset=utf-8");
    if (req.method === "GET" && url.pathname === "/local-shim.js") return send(res, 200, fs.readFileSync(SHIM_FILE), "text/javascript; charset=utf-8");
    if (req.method === "GET" && url.pathname === "/api/ping") return send(res, 200, { ok: true, claude: CLAUDE_BIN ? "cli" : process.env.ANTHROPIC_API_KEY ? "api" : "geen" });

    const dm = url.pathname.match(/^\/api\/data\/(deck|profile)$/);
    if (dm) {
      const file = path.join(DATA_DIR, dm[1] + ".json");
      if (req.method === "GET") return fs.existsSync(file) ? send(res, 200, fs.readFileSync(file)) : send(res, 404, { exists: false });
      if (req.method === "PUT") {
        const body = await readBody(req);
        JSON.parse(body);
        fs.writeFileSync(file + ".tmp", body);
        fs.renameSync(file + ".tmp", file);
        return send(res, 200, { ok: true });
      }
    }

    if (req.method === "POST" && url.pathname === "/api/claude") {
      const { input, tier } = JSON.parse(await readBody(req));
      const text = await askClaude(input, tier || "default");
      return send(res, 200, { text });
    }
    send(res, 404, { error: "Niet gevonden" });
  } catch (e) {
    console.error(new Date().toISOString(), e);
    send(res, 500, { error: e.message || String(e) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Werkengels draait op http://localhost:${PORT}`);
  console.log(CLAUDE_BIN ? `Claude via Claude Code: ${CLAUDE_BIN}` : process.env.ANTHROPIC_API_KEY ? "Claude via API-sleutel" : "Let op: geen Claude gevonden, feedback werkt niet.");
});
