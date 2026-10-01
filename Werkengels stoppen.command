#!/bin/zsh
# Dubbelklik om Werkengels te stoppen.
cd "$(dirname "$0")"
PORT=4321
stopped=0
if [ -f logs/server.pid ] && kill "$(cat logs/server.pid)" 2>/dev/null; then stopped=1; fi
pids=$(lsof -ti tcp:$PORT 2>/dev/null)
if [ -n "$pids" ]; then kill $pids 2>/dev/null; stopped=1; fi
rm -f logs/server.pid
if [ $stopped = 1 ]; then echo "Werkengels is gestopt."; else echo "Werkengels draaide niet."; fi
