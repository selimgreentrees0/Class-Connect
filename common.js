// Shared helpers for Class Connect
const PX='awtyfm1',ADMIN_ID=PX+'-admin',$=i=>document.getElementById(i);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const set=(e,h)=>{if(e._h!==h){e._h=h;e.innerHTML=h}};
const sw=(l,on,fn,d)=>`<label class=sw style="margin:6px 18px 6px 0"><input type=checkbox ${on?'checked':''} ${d?'disabled':''} onchange="${fn}"><i></i><span>${l}</span></label>`;
const MOB=/Android|iPhone|iPod|iPad|Mobile|Windows Phone/i.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
if(MOB){window.NOGO=1;document.body.innerHTML='<div class=ov><div class=box><h2>💻 Computers only</h2><p class=mu>This page works on laptops and desktop computers, not phones or tablets.</p></div></div>'}
// No server of our own: PeerJS's free public broker is used only for the first handshake. Video/data then flow directly device-to-device; iceServers is empty so media never leaves the LAN.
const mkPeer=id=>new Peer(id,{config:{iceServers:[]}});
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
