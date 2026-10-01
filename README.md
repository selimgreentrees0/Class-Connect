# Class Connect 2.0 (local network)

## Run
1. Install Node 18+ on the admin computer, then in this folder: `npm install` then `npm start`.
2. The console prints three addresses (students / teachers / admin). Open them from any computer on the same network.
3. Each device must accept the one-time certificate warning (Advanced → Proceed). HTTPS is required by browsers for screen sharing.
4. Admin default password: `skyblue` (change it in the Admin page). Create teacher codes there.

Nothing leaves your network: pages, signaling and screen video are all served/relayed locally (no cloud PeerJS, no STUN).

## Notes
- Screen sharing requires **Entire Screen** (validated in Chrome/Edge). Window/tab choices are rejected.
- Previews are ~560px at a few fps; expanding a student switches that one stream to up to 1920px/20-30fps. Only the class on screen streams; other tabs/classes send nothing.
- Admin quality cap: Eco / Balanced / Max.
- Admin login stores a token on that device; while the teacher view is open there, the student page is locked.
- If devices cannot connect on a managed network, allow peer-to-peer WebRTC on the LAN (or disable Chrome's "Anonymize local IPs exposed by WebRTC" flag).
