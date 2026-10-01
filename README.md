# Class Connect 2.0 — static, peer-to-peer, no server of your own

There is nothing to install or run. Put the 4 files (index.html, teacher.html, admin.html, common.js, style.css) on any static HTTPS host
(GitHub Pages, Netlify, school web space) or just open them from a folder in Chrome/Edge (file:// counts as a secure context, so screen sharing works).

- Students: index.html · Teachers: teacher.html · Admin: admin.html (default password `skyblue`, change it in the page)
- The only outside piece is PeerJS's free public broker, used for the first handshake (like the original app). Screen video and messages go
  directly between computers; with no STUN/TURN configured, they stay on the local network.
- Screen sharing needs **Entire Screen** (Chrome/Edge). Previews ~560px/few fps; expanding a student switches that stream to up to 1920px.
