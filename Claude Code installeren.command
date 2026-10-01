#!/bin/zsh
# Installeert Claude Code (alleen nodig als Werkengels zegt dat Claude Code niet gevonden is).
cd "$(dirname "$0")"
echo "Claude Code wordt geinstalleerd..."
curl -fsSL https://claude.ai/install.sh | bash
CLAUDE="$HOME/.local/bin/claude"
if [ ! -x "$CLAUDE" ]; then
  echo "Installeren lukte niet. Stuur een screenshot van dit venster naar Claude."
  read -k 1 "?Druk op een toets om te sluiten."
  exit 1
fi
echo ""
echo "Gelukt. Nu log je één keer in:"
echo "1. Kies 'Claude account with subscription' en log in in je browser."
echo "2. Typ daarna /exit en druk op Enter."
echo ""
"$CLAUDE"
"./Werkengels stoppen.command" >/dev/null 2>&1
"./Werkengels starten.command"
