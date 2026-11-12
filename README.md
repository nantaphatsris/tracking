# SkyTracker compact demo + TouchDesigner bridge

## What changed
- Compact UI: camera preview, TRACK state, XY, marker count, WebSocket state.
- Settings and marker print sheet are collapsed.
- Camera request reduced to 960x540.
- Marker detection is throttled to ~15 fps and processing canvas capped at 640 px.
- WebSocket sends the same demo payload shape: `{"type":"xy","x":0.5,"y":0.5}`; no stale XY is sent when markers are lost.
- No hard-coded expired Cloudflare URL. Enter your actual WebSocket endpoint.

## TouchDesigner bridge (optional)
This package includes `server.js`, a minimal bridge if the old Node/OSC service is not running:
1. On the computer running TouchDesigner, install Node.js.
2. In this folder run `npm install ws`.
3. Run `node server.js`.
4. In TouchDesigner create OSC In CHOP or OSC In DAT and listen on UDP port 8000.
5. If TouchDesigner is on another machine, run with `TD_HOST` set to that machine's LAN IP:
   - Windows PowerShell: `$env:TD_HOST="192.168.1.50"; node server.js`
6. In the web page settings, enter `ws://<NODE_COMPUTER_LAN_IP>:8080` if served in a compatible secure context, or use `wss://` through a secure tunnel/reverse proxy when the page is hosted on HTTPS.
7. OSC output:
   - `/skytracker/xy` with two float arguments (x, y), normalized 0–1
   - `/skytracker/active` with integer 0/1

## Important network note
A GitHub Pages HTTPS page may block a plain `ws://` connection as mixed content. For phone testing, use a secure `wss://` endpoint/tunnel, or serve the page and WebSocket securely on your LAN. Do not reuse a temporary Cloudflare URL after it expires.

## Calibration
The marker coordinates are measured from the top-left corner of the TV's visible image area. Ensure the actual marker dimensions and their X/Y locations are entered accurately. Keep printed marker faces as coplanar with the screen plane as possible.

## Known limits
This is a prototype. The compact UI and throttled processing reduce load but do not guarantee a fixed FPS on every phone. A single detected marker provides four corner correspondences; multiple visible markers improve robustness. The browser implementation must be tested against the actual phone camera and the user's TouchDesigner network.
