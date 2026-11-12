STAR POINTER HYBRID DEMO
Files: index.html (phone tracker), display.html (TV artwork + 4 QR markers), reference.jpg, marker_TL/TR/BL/BR.png.

SETUP
1. Host the whole folder on HTTPS (GitHub Pages / Netlify).
2. Open display.html on the computer connected to TV. Fit the 4:3 artwork fully on screen; do not crop or stretch.
3. Open index.html on iPhone Safari, allow camera, show one marker clearly, tap Start Tracking.
4. Optional WebSocket: change URL to the TouchDesigner computer's LAN IP and port. Example ws://192.168.1.20:9980. HTTPS pages generally require WSS for secure WebSocket; use a secure WS endpoint or test in a suitable local setup.

HOW IT WORKS
jsQR reads a uniquely coded QR marker (TL/TR/BL/BR). Each marker's four corners are mapped to its known normalized square position on the TV artwork. A planar homography maps the center pixel of the phone camera to normalized artwork X/Y. One visible marker is sufficient for a local planar mapping if marker size and placement are unchanged.
Payload: {"type":"pointer","x":0.5,"y":0.5,"tracking":true,"marker":"TL","timestamp":...}

IMPORTANT
- Keep display aspect ratio and marker placement unchanged.
- A visible marker is required. This hybrid approach is more robust than markerless matching but is not markerless.
- QR detection is performed in browser using jsQR CDN. Internet is needed to load the library unless you host jsQR locally.
- Prototype requires real-device validation; glare, distance, focus, and small marker size affect detection.
