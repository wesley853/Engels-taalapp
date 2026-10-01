#!/bin/zsh
# Dubbelklik om Other Biscuit te stoppen.
cd "$(dirname "$0")"
PORT=4321
stopped=0
if [ -f logs/server.pid ] && kill "$(cat logs/server.pid)" 2>/dev/null; then stopped=1; fi
pids=$(lsof -ti tcp:$PORT 2>/dev/null)
if [ -n "$pids" ]; then kill $pids 2>/dev/null; stopped=1; fi
rm -f logs/server.pid
if [ $stopped = 1 ]; then echo "Other Biscuit is gestopt."; else echo "Other Biscuit draaide niet."; fi
