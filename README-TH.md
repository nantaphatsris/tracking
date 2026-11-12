# SKYTRACKER – Original project refresh

สร้างจาก ZIP โปรเจกต์ที่ผู้ใช้อัปโหลด โดยคง `server.js` และระบบ OSC/ผู้เล่นเดิมไว้

## สิ่งที่ปรับ
- ปรับหน้าเว็บให้กระชับขึ้น
- เพิ่มช่องกรอก WebSocket URL จาก TryCloudflare และปุ่มเชื่อมต่อ
- ไม่เชื่อม `ws://localhost:8080` อัตโนมัติเมื่อเปิดหน้าเว็บจาก GitHub Pages
- คง JSON protocol เดิม:
  - `{ "type": "active", "active": true|false }`
  - `{ "type": "xy", "x": 0..1, "y": 0..1 }`
  - `{ "type": "runAnimation" }`
- คงผู้เล่นสูงสุด 10 คน และ OSC mapping เดิม

## สถานะระบบ Marker
หน้าเว็บชุดนี้ยังคงระบบตรวจจับกรอบสี่เหลี่ยมด้วย OpenCV จากโปรเจกต์เก่า (แตะเลือกกรอบ) ยังไม่ได้ผสาน Bezel ArUco Marker V2 การผสาน Marker และ calibration ต้องทำเป็นขั้นต่อไปและทดสอบกับกล้องจริงก่อน

---

# วิธีเปิดใช้งานแบบเดิม (Node.js + TryCloudflare + TouchDesigner)

## A. เตรียมโฟลเดอร์ Windows
1. แตก ZIP
2. เปิดโฟลเดอร์ `SkyTracker-Project`
3. คลิกแถบที่อยู่ File Explorer พิมพ์ `cmd` แล้วกด Enter
4. ตรวจว่ามี `server.js`, `package.json`, `package-lock.json`, `index.html`

## B. ติดตั้งแพ็กเกจ (ครั้งแรก)
```bash
node -v
npm -v
npm install
```
ถ้า `node` หรือ `npm` ไม่รู้จักคำสั่ง ให้ติดตั้ง Node.js LTS แล้วเปิด CMD ใหม่

## C. เปิด Node server
ใน CMD หน้าต่างแรก:
```bash
node server.js
```
หรือดับเบิลคลิก `START-SERVER.bat`

ควรเห็น:
```text
OSC READY
TouchDesigner: 127.0.0.1:9000
NIGHT SKY MULTIPLAYER SERVER
WebSocket port: 8080
Max players: 10
```
อย่าปิดหน้าต่างนี้ระหว่างเล่น

## D. ตั้ง TouchDesigner
บนคอมพิวเตอร์เดียวกับ Node server:
1. เปิด TouchDesigner
2. สร้าง `OSC In CHOP` (หรือใช้ OSC In DAT ใน network เดิม)
3. ตั้ง Network Port เป็น `9000`
4. เปิด viewer แล้วตรวจ address:
   - `/player/1/active` (integer 0/1)
   - `/player/1/x` (float 0..1)
   - `/player/1/y` (float 0..1)
   - Player ID อาจเป็น 1–10 ตามลำดับที่โทรศัพท์เชื่อม
   - `/animation/run` (integer pulse 1 แล้วกลับ 0)
5. ถ้า TouchDesigner อยู่คนละเครื่องกับ Node server ให้แก้ `remoteAddress` ใน `server.js` จาก `127.0.0.1` เป็น IP LAN ของเครื่อง TouchDesigner แล้ว restart Node server และเปิดรับ UDP port 9000 ใน Firewall

## E. เปิด TryCloudflare (CMD หน้าต่างที่สอง)
ติดตั้ง `cloudflared` ไว้ก่อน แล้วเปิด CMD อีกหน้าต่างหนึ่ง:
```bash
cloudflared tunnel --url http://localhost:8080
```
รอ URL เช่น:
```text
https://random-words.trycloudflare.com
```
เก็บหน้าต่างนี้ไว้เปิดตลอดเล่น URL จะเปลี่ยนเมื่อเปิด tunnel ใหม่

## F. เชื่อม iPhone
1. เปิดหน้าเว็บ SkyTracker ที่ deploy บน GitHub Pages (HTTPS)
2. ในช่อง `WEBSOCKET URL จาก TryCloudflare` ใส่ URL เดียวกัน แต่เปลี่ยน `https://` เป็น `wss://`
   ตัวอย่าง `wss://random-words.trycloudflare.com`
3. กด `เชื่อมต่อ`
4. ควรเห็น `Player 1 / เชื่อมต่อแล้ว` (เครื่องอื่นจะได้ Player 2, 3, ...)
5. อนุญาตกล้อง แล้วกดเปิดกล้อง
6. เมื่อเลือกเป้าหมายได้ ค่า X/Y จะส่งเข้า Node server และออก OSC ไป TouchDesigner

**ห้ามใส่ `ws://localhost:8080` บน iPhone** เพราะ localhost บนมือถือหมายถึงตัวมือถือ ไม่ใช่คอมพิวเตอร์

## G. ตรวจสอบทีละชั้น
- Node CMD: แสดง `Player 1 connected`
- หน้าเว็บ: แสดง Player ID และเชื่อมต่อแล้ว
- TouchDesigner: `/player/1/active` เป็น 1 เมื่อเปิดกล้อง
- เมื่อ tracking ทำงาน `/player/1/x` และ `/player/1/y` เปลี่ยน
- ปิดกล้อง/ปิดหน้าเว็บ `/player/1/active` กลับเป็น 0

## แก้ปัญหา
- WebSocket ต่อไม่ได้: เช็ก Node server, TryCloudflare, URL `wss://` และ hostname
- `ERR_CONNECTION_REFUSED`: server.js ไม่ได้รันหรือ port 8080 ถูกใช้งาน
- `OSC READY` ไม่ขึ้น: ตรวจ UDP port 9001 ฝั่ง Node
- TouchDesigner ไม่มีค่า: เช็ก OSC In port 9000 และ Windows Firewall
- เปิดกล้องไม่ได้: เปิดเว็บผ่าน HTTPS และอนุญาตกล้อง
- URL เปลี่ยน: กรอก URL ใหม่แล้วกดเชื่อมต่ออีกครั้ง

## โปรโตคอล server.js เดิม
```json
{"type":"active","active":true}
{"type":"xy","x":0.52,"y":0.47}
{"type":"runAnimation"}
```

server แปลง XY เป็น OSC แยก address:
- `/player/{id}/x` float
- `/player/{id}/y` float
ไม่ใช่ `/skytracker/xy` แบบ bridge ตัวอย่างทั่วไป
