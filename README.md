# Other Biscuit

Engels oefenen in twee sporen: **Werk** (zakelijk Engels voor online marketing) en **Dagelijks Engels** (gesprekken, reizen, series, nieuws). Per spoor een dagelijkse sessie van 8 minuten, plus langere opdrachten, een woordenschattest, woorden uit je eigen teksten en leesstukken. Je eigen fouten worden je lesstof.

De woordenlijst komt uit SUBTLEX-US (Brysbaert & New, 2009): woorden gesorteerd op hoe vaak ze voorkomen in films en series.

## Installeren (eenmalig, Mac)

Open Terminal en plak:

```
git clone https://github.com/wesley853/Engels-taalapp.git ~/OtherBiscuit
```

Daarna staat de map `OtherBiscuit` in je thuismap. Sleep hem gerust naar je zijbalk in Finder.

## Gebruiken

| Bestand | Wat het doet |
|---|---|
| `Other Biscuit starten.command` | Start de app en opent hem in je browser (http://localhost:4321) |
| `Other Biscuit stoppen.command` | Stopt de app |
| `Other Biscuit bijwerken.command` | Haalt de nieuwste versie op. Je voortgang blijft bewaard |

## Wat je nodig hebt

- **Node.js** (staat er al als je SEA Platform draait)
- **Claude Code**, ingelogd met je Claude-account. Other Biscuit gebruikt dat voor de feedback, dus het kost niets extra.
  Geen Claude Code? Zet dan `ANTHROPIC_API_KEY=...` in een bestand `.env` in deze map (dat kost wel geld per gebruik).

## Waar staat wat

- `app/other-biscuit.html`: de app zelf (dezelfde versie draait ook als artifact op claude.ai)
- `server/server.js`: lokale server, zonder extra pakketten
- `web/local-shim.js`: koppelt de app aan de lokale server
- `data/`: je voortgang en kaarten (wordt niet naar GitHub gestuurd)
- `logs/server.log`: kijk hier als iets niet werkt
- `docs/onderzoek.md`: het onderzoek waarop de app is gebaseerd
