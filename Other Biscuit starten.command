#!/bin/zsh
# Dubbelklik om Other Biscuit te starten. Haalt automatisch de nieuwste versie op,
# installeert Claude Code als dat nodig is, en opent de app in je browser.
cd "$(dirname "$0")"
source ~/.zshrc >/dev/null 2>&1
export PATH="$PATH:/opt/homebrew/bin:/usr/local/bin:$HOME/.local/bin:$HOME/.claude/local"
PORT=4321

echo "Other Biscuit wordt gestart..."

# 1. Nieuwste versie ophalen (stil, gaat door als er geen internet is)
git pull --ff-only -q >/dev/null 2>&1

# 2. Node.js nodig
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is niet gevonden. Installeer het via https://nodejs.org en dubbelklik daarna opnieuw."
  read -k 1 "?Druk op een toets om te sluiten."
  exit 1
fi

# 3. Claude Code zoeken, en eenmalig installeren als hij er niet is
CLAUDE_PATH=$(node server/server.js --find-claude 2>/dev/null)
if [ -z "$CLAUDE_PATH" ]; then
  echo ""
  echo "Claude Code staat nog niet op deze Mac. Ik installeer het nu (eenmalig)..."
  curl -fsSL https://claude.ai/install.sh | bash
  CLAUDE_PATH="$HOME/.local/bin/claude"
  if [ ! -x "$CLAUDE_PATH" ]; then
    echo "Installeren lukte niet. Stuur een screenshot van dit venster naar Claude."
    read -k 1 "?Druk op een toets om te sluiten."
    exit 1
  fi
  echo ""
  echo "=============================================================="
  echo " Nog één keer inloggen:"
  echo " 1. Kies 'Claude account with subscription' en log in in je browser"
  echo " 2. Typ daarna /exit en druk op Enter"
  echo "=============================================================="
  echo ""
  "$CLAUDE_PATH"
fi
mkdir -p logs data
grep -q "^CLAUDE_BIN=" .env 2>/dev/null || echo "CLAUDE_BIN=$CLAUDE_PATH" >> .env

# 4. Server (her)starten zodat altijd de nieuwste versie draait
pids=$(lsof -ti tcp:$PORT 2>/dev/null)
[ -n "$pids" ] && kill $pids 2>/dev/null && sleep 0.5
nohup node server/server.js > logs/server.log 2>&1 &
echo $! > logs/server.pid
disown

for i in {1..30}; do
  curl -s "http://localhost:$PORT/api/ping" >/dev/null 2>&1 && break
  sleep 0.3
done

if curl -s "http://localhost:$PORT/api/ping" >/dev/null 2>&1; then
  open "http://localhost:$PORT"
  echo "Other Biscuit draait. Je kunt dit venster sluiten."
else
  echo "Starten lukte niet. Stuur een screenshot van dit venster naar Claude:"
  tail -n 20 logs/server.log
  read -k 1 "?Druk op een toets om te sluiten."
fi
