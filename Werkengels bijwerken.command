#!/bin/zsh
# Dubbelklik om de nieuwste versie van Werkengels op te halen. Je voortgang blijft bewaard.
cd "$(dirname "$0")"
if git pull --ff-only; then
  echo "Werkengels is bijgewerkt. Ik herstart de app."
  "./Werkengels stoppen.command" >/dev/null 2>&1
  "./Werkengels starten.command"
else
  echo "Bijwerken lukte niet. Stuur een screenshot van dit venster naar Claude."
  read -k 1 "?Druk op een toets om te sluiten."
fi
