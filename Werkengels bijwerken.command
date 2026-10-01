#!/bin/zsh
# Dubbelklik om de nieuwste versie van Werkengels op te halen. Je voortgang blijft bewaard.
cd "$(dirname "$0")"
git pull --ff-only && echo "Werkengels is bijgewerkt. Stop en start de app opnieuw om de nieuwe versie te zien."
read -k 1 "?Druk op een toets om te sluiten."
