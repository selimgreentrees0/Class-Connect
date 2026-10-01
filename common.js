// Shared helpers for Class Connect
const PX='awtyfm1',ADMIN_ID=PX+'-admin',$=i=>document.getElementById(i);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const set=(e,h)=>{if(e._h!==h){e._h=h;e.innerHTML=h}};
const sw=(l,on,fn,d)=>`<label class=sw style="margin:6px 18px 6px 0"><input type=checkbox ${on?'checked':''} ${d?'disabled':''} onchange="${fn}"><i></i><span>${l}</span></label>`;
const MOB=/Android|iPhone|iPod|iPad|Mobile|Windows Phone/i.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
if(MOB){window.NOGO=1;document.body.innerHTML='<div class=ov><div class=box><h2>💻 Computers only</h2><p class=mu>This page works on laptops and desktop computers, not phones or tablets.</p></div></div>'}
// No server of our own: PeerJS's free public broker is used only for the first handshake. Video/data then flow directly device-to-device; iceServers is empty so media never leaves the LAN.
const mkPeer=id=>{const o={config:{iceServers:[]}},p=id?new Peer(id,o):new Peer(o);setInterval(()=>{if(!p.destroyed&&p.disconnected)try{p.reconnect()}catch(e){}},2500);p.on('error',e=>{if(/network|server-error|socket/.test(e.type))setTimeout(()=>{try{p.reconnect()}catch(x){}},2000)});(window.PEERS=window.PEERS||[]).push(p);return p};
const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
function toast(m){let w=$('tw');if(!w){w=document.createElement('div');w.id='tw';document.body.appendChild(w)}const d=document.createElement('div');d.className='toast';d.textContent=m;w.appendChild(d);setTimeout(()=>d.remove(),4500)}
// Stream quality profiles (bits/s, frames/s). "lo" = grid preview, "hi" = expanded view.
const CAP={eco:{lo:60e3,hi:1.2e6,lf:3,hf:12},bal:{lo:100e3,hi:2.4e6,lf:4,hf:20},max:{lo:160e3,hi:4e6,lf:5,hf:30}};
// Keyed tile grid: tiles (and their <video> elements) persist across updates so previews never flicker.
function Grid(el,o){const T=new Map();
 const mk=x=>{const e=document.createElement('div');e.className='tile';
  e.innerHTML='<div class=pv title="Click to expand"><video muted autoplay playsinline></video><div class=ph>📺<small>No screen</small></div><span class=live>LIVE</span></div><div class=tf><label class=ck><input type=checkbox><i></i></label><b></b><span class=pill></span><button class="sm g rm" title="Remove from class">✕</button></div>';
  const t={el:e,v:e.querySelector('video'),cb:e.querySelector('input'),nm:e.querySelector('b'),pl:e.querySelector('.pill')};
  e.querySelector('.pv').onclick=()=>o.expand(x.id);t.cb.onchange=()=>o.tick(x.id,t.cb.checked);e.querySelector('.rm').onclick=()=>o.rm(x.id);return t};
 return{update(L){const ids=new Set(L.map(x=>x.id));T.forEach((t,i)=>{if(!ids.has(i)){t.el.remove();T.delete(i)}});
  L.forEach((x,n)=>{let t=T.get(x.id);if(!t){t=mk(x);T.set(x.id,t)}
   if(t.nm.textContent!==x.name)t.nm.textContent=x.name;t.pl.className='pill '+x.cls;if(t.pl.textContent!==x.txt)t.pl.textContent=x.txt;t.cb.checked=!!x.ck;
   const st=x.stream||null;if(t.v.srcObject!==st){t.v.srcObject=st;if(st)t.v.play().catch(()=>{})}
   t.el.classList.toggle('on',!!(st&&st.active&&st.getVideoTracks().some(k=>k.readyState=='live')));
   if(el.children[n]!==t.el)el.insertBefore(t.el,el.children[n]||null)})}}}
// Expanded single-student view. Opening asks for high resolution; closing returns to low.
function Expand(o){const m=document.createElement('div');m.className='xp hide';
 m.innerHTML='<div class=xb><div class=xh><b></b><span class=pill></span><span class=sp></span><button class="sm g" data-a=p>◀</button><button class="sm g" data-a=n>▶</button><button class="sm r" data-a=r>Remove</button><button class="sm g" data-a=c>Close</button></div><video autoplay playsinline muted></video></div>';document.body.appendChild(m);
 let id=null;const v=m.querySelector('video'),api={get id(){return id},
  open(i){id=i;m.classList.remove('hide');o.q();api.refresh()},
  close(){id=null;m.classList.add('hide');v.srcObject=null;o.q()},
  refresh(){if(!id)return;const s=o.info(id);if(!s)return api.close();const b=m.querySelector('b');if(b.textContent!==s.name)b.textContent=s.name;const p=m.querySelector('.pill');p.className='pill '+s.cls;p.textContent=s.txt;if(v.srcObject!==(s.stream||null)){v.srcObject=s.stream||null;v.play().catch(()=>{})}}};
 m.onclick=e=>{const a=e.target.dataset.a;if(e.target===m||a=='c')api.close();else if(a=='r'){if(o.rm(id))api.close()}else if(a=='p'||a=='n'){const L=o.ids(),k=L.indexOf(id);if(L.length>1)api.open(L[(k+(a=='n'?1:L.length-1))%L.length])}};
 addEventListener('keydown',e=>{if(id&&e.key=='Escape')api.close()});return api}
// First-open local-network permission. Chrome/Edge ask "Look for and connect to devices on your local network";
// we trigger that prompt up front (from a click) so screen sharing / peer links work right away. Remembered after the first time.
(()=>{if(window.NOGO)return;
 const K='cc_lan_ok',st=async()=>{try{return(await navigator.permissions.query({name:'local-network-access'})).state}catch(e){try{return(await navigator.permissions.query({name:'local-network'})).state}catch(x){return'unknown'}}};
 const probe=async()=>{
  const t=(u,sp)=>{const c=new AbortController();setTimeout(()=>c.abort(),2500);return fetch(u,{mode:'no-cors',cache:'no-store',targetAddressSpace:sp,signal:c.signal}).catch(()=>{})};
  await Promise.all([t('http://192.168.0.1/','local'),t('http://10.0.0.1/','local'),t('http://localhost:9/','loopback')]);
  try{const pc=new RTCPeerConnection({iceServers:[]});pc.createDataChannel('x');await pc.setLocalDescription(await pc.createOffer());await new Promise(r=>{pc.onicecandidate=e=>{if(!e.candidate)r()};setTimeout(r,1500)});pc.close()}catch(e){}
 };
 const show=denied=>{const o=document.createElement('div');o.className='ov';o.style.zIndex=99999;
  o.innerHTML='<div class=box><h2>🌐 Allow local network access</h2><p class=mu>Class Connect connects computers in your school directly to each other. When your browser asks to <b>“look for and connect to devices on your local network”</b>, choose <b>Allow</b>.</p>'+
  (denied?'<p class=mu style="color:#d33">Access was blocked. Click the 🔒 icon next to the address bar → Site settings → set <b>Local network access</b> to Allow, then reload.</p>':'')+
  '<button id=lanb>Continue</button></div>';document.body.appendChild(o);
  $('lanb').onclick=async()=>{$('lanb').disabled=true;$('lanb').textContent='Waiting for permission…';await probe();const s=await st();
   if(s=='denied'){o.remove();show(true);return}try{localStorage.setItem(K,'1')}catch(e){}o.remove()}};
 addEventListener('DOMContentLoaded',async()=>{const s=await st();let seen=0;try{seen=localStorage.getItem(K)}catch(e){}
  if(s=='granted'||(seen&&s!='denied')||s=='unknown'&&seen)return;
  if(s=='unknown'&&!seen&&!(window.isSecureContext&&/Chrome|Edg/.test(navigator.userAgent)))return;
  show(s=='denied')})
})();

// Admin console open on this computer => the student page must not run here.
(()=>{const K='cc_admin_hb',P=location.pathname;
 if(/admin/i.test(P)){const b=()=>{try{localStorage.setItem(K,Date.now())}catch(e){}};b();setInterval(b,1000);return}
 if(/teacher/i.test(P))return;
 const up=()=>{try{return Date.now()-(+localStorage.getItem(K)||0)<3500}catch(e){return false}},was=up();
 if(was){window.NOGO=1;(window.PEERS||[]).forEach(p=>{try{p.destroy()}catch(e){}});
  const m=()=>{document.body.innerHTML='<div class=ov><div class=box><h2>🚫 Not available here</h2><p class=mu>The admin console is open on this computer, so the student page can\'t be used. Close the admin page to continue.</p></div></div>'};
  document.body?m():addEventListener('DOMContentLoaded',m)}
 setInterval(()=>{if(up()!==was)location.reload()},1500)})();
