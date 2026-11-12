// SkyTracker WebSocket -> OSC bridge
// Install: npm install ws
// Run: node server.js
// TouchDesigner: OSC In CHOP/DAT listen on UDP port 8000
const WebSocket = require("ws");
const dgram = require("dgram");

const WS_PORT = Number(process.env.WS_PORT || 8080);
const TD_HOST = process.env.TD_HOST || "127.0.0.1";
const TD_PORT = Number(process.env.TD_PORT || 8000);
const OSC_ADDRESS = process.env.OSC_ADDRESS || "/skytracker/xy";
const udp = dgram.createSocket("udp4");
const wss = new WebSocket.Server({ port: WS_PORT });

function oscString(s) {
  const b = Buffer.from(s + "\0", "utf8");
  const pad = (4 - (b.length % 4)) % 4;
  return Buffer.concat([b, Buffer.alloc(pad)]);
}
function oscXY(x, y) {
  const address = oscString(OSC_ADDRESS);
  const types = oscString(",ff");
  const values = Buffer.alloc(8);
  values.writeFloatBE(x, 0);
  values.writeFloatBE(y, 4);
  return Buffer.concat([address, types, values]);
}
function oscActive(active) {
  const address = oscString("/skytracker/active");
  const types = oscString(",i");
  const value = Buffer.alloc(4);
  value.writeInt32BE(active ? 1 : 0, 0);
  return Buffer.concat([address, types, value]);
}

wss.on("connection", ws => {
  console.log("SkyTracker client connected");
  ws.send(JSON.stringify({ type: "welcome", playerId: "skytracker" }));
  ws.on("message", raw => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "xy" && Number.isFinite(msg.x) && Number.isFinite(msg.y)) {
        const x = Math.max(0, Math.min(1, msg.x));
        const y = Math.max(0, Math.min(1, msg.y));
        udp.send(oscXY(x, y), TD_PORT, TD_HOST);
      } else if (msg.type === "active") {
        udp.send(oscActive(!!msg.active), TD_PORT, TD_HOST);
      }
    } catch (e) {
      console.error("Bad message:", e.message);
    }
  });
  ws.on("close", () => console.log("SkyTracker client disconnected"));
});
console.log(`WebSocket listening on :${WS_PORT}; OSC -> ${TD_HOST}:${TD_PORT}`);
