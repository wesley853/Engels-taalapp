# Werkengels

Zakelijk Engels oefenen voor online marketing. Elke dag 8 minuten, met langere opdrachten als je meer tijd hebt. Je eigen fouten worden je lesstof.

## Installeren (eenmalig, Mac)

Open Terminal en plak:

```
git clone https://github.com/wesley853/Engels-taalapp.git ~/Werkengels
```

Daarna staat de map `Werkengels` in je thuismap. Sleep hem gerust naar je zijbalk in Finder.

## Gebruiken

| Bestand | Wat het doet |
|---|---|
| `Werkengels starten.command` | Start de app en opent hem in je browser (http://localhost:4321) |
| `Werkengels stoppen.command` | Stopt de app |
| `Werkengels bijwerken.command` | Haalt de nieuwste versie op. Je voortgang blijft bewaard |

## Wat je nodig hebt

- **Node.js** (staat er al als je SEA Platform draait)
- **Claude Code**, ingelogd met je Claude-account. Werkengels gebruikt dat voor de feedback, dus het kost niets extra.
  Geen Claude Code? Zet dan `ANTHROPIC_API_KEY=...` in een bestand `.env` in deze map (dat kost wel geld per gebruik).

## Waar staat wat

- `app/werkengels.html`: de app zelf (dezelfde versie draait ook als artifact op claude.ai)
- `server/server.js`: lokale server, zonder extra pakketten
- `web/local-shim.js`: koppelt de app aan de lokale server
- `data/`: je voortgang en kaarten (wordt niet naar GitHub gestuurd)
- `logs/server.log`: kijk hier als iets niet werkt
- `docs/onderzoek.md`: het onderzoek waarop de app is gebaseerd
