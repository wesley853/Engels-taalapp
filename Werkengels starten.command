#!/bin/zsh
# Dubbelklik om Werkengels te starten. De app opent in je browser.
cd "$(dirname "$0")"
source ~/.zshrc >/dev/null 2>&1
export PATH="$PATH:/opt/homebrew/bin:/usr/local/bin:$HOME/.local/bin:$HOME/.claude/local"
PORT=4321

if curl -s "http://localhost:$PORT/api/ping" >/dev/null 2>&1; then
  echo "Werkengels draait al. Ik open hem in je browser."
  open "http://localhost:$PORT"
  exit 0
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is niet gevonden. Installeer het via https://nodejs.org en probeer opnieuw."
  read -k 1 "?Druk op een toets om te sluiten."
  exit 1
fi

mkdir -p logs data
nohup node server/server.js > logs/server.log 2>&1 &
echo $! > logs/server.pid
disown

for i in {1..30}; do
  curl -s "http://localhost:$PORT/api/ping" >/dev/null 2>&1 && break
  sleep 0.3
done

if curl -s "http://localhost:$PORT/api/ping" >/dev/null 2>&1; then
  open "http://localhost:$PORT"
  echo "Werkengels draait op http://localhost:$PORT"
  echo "Je kunt dit venster sluiten. Stoppen doe je met 'Werkengels stoppen.command'."
else
  echo "Starten lukte niet. Kijk in logs/server.log wat er misging:"
  tail -n 20 logs/server.log
  read -k 1 "?Druk op een toets om te sluiten."
fi
