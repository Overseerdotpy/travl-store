const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=c=>'$'+(c/100).toLocaleString('en-US',{minimumFractionDigits:c%100?2:0,maximumFractionDigits:2});
const clamp=(x,a,b)=>x<a?a:x>b?b:x;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let IMG={},CLIPB64='';
try{IMG=JSON.parse($('#imgs').textContent);CLIPB64=JSON.parse($('#clip').textContent)}catch(e){}
const ALT={intro:'The TRAVL 75 keyboard floating above a dark desk, with graphite aluminum case, warm off-white keycaps and one terracotta Esc key',top:'Top-down view of the complete TRAVL 75 keyboard',lift:'A clear mechanical switch with its keycap removed',press:'The switch mid-press with the contacts glowing warm',v1:'Switches seated in an aluminum plate with keycaps partly fitted',v2:'Keycaps settling into place across the board',v3:'The brushed brass plate on the underside of the case',v4:'The keyboard on a wooden desk lit by a warm lamp',v5:'The keyboard resting in its box with a USB cable',esc:'The terracotta Esc keycap on the TRAVL 75',poster:''};
const im=(k,extra)=>'<img src="'+(IMG[k]||'')+'" alt="'+esc(ALT[k]||'')+'" '+(extra||'')+'>';

const WM=JSON.parse(document.getElementById('wordmark').textContent);
function wmHTML(){
  const base=WM.paths.map((d,i)=>'<g class="bl" style="--i:'+i+'"><path d="'+d+'"/></g>').join('');
  const glow=WM.paths.map(d=>'<path d="'+d+'"/>').join('');
  return '<div class="wm" id="wm"><svg class="wm-base" viewBox="'+WM.vb+'" role="img" aria-label="TRAVL" focusable="false">'+base+'</svg>'
   +'<div class="wm-glow" aria-hidden="true"><svg viewBox="'+WM.vb+'" focusable="false"><defs><linearGradient id="wmGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="'+WM.w+'" y2="0"><stop offset="0" style="stop-color:var(--g1)"/><stop offset=".45" style="stop-color:var(--g2)"/><stop offset="1" style="stop-color:var(--g3)"/></linearGradient></defs><g fill="url(#wmGrad)">'+glow+'</g></svg></div></div>';
}
const SUB='Four millimeters. Press once and you’ll know.';
function typed(tag,cls,id,text){return '<'+tag+(cls?' class="type '+cls+'"':' class="type"')+' id="'+id+'"><span class="sr">'+text+'</span><span class="ghost" aria-hidden="true">'+text+'</span><span class="live" aria-hidden="true"></span></'+tag+'>'}
function typeInto(host,text,o){
  const live=$('.live',host);if(!live)return;o=o||{};
  if(reduce){live.textContent=text;return}
  const node=document.createTextNode(''),caret=document.createElement('i');caret.className='caret';live.append(node,caret);
  let i=0;const speed=o.speed||60;
  setTimeout(function step(){
    if(!host.isConnected)return;
    if(i<text.length){i++;node.data=text.slice(0,i);setTimeout(step,speed+(/[.,]/.test(text[i-1])?220:0))}
    else setTimeout(()=>caret.classList.add('off'),o.hold||1800);
  },o.delay||0);
}
function mountTyping(){
  const sub=$('#sub'),h=$('#h1type');
  if(sub)typeInto(sub,SUB,{delay:1500,speed:58});
  if(h){
    const go=()=>typeInto(h,'Every millimeter, felt.',{speed:70,hold:1400});
    if(reduce||!('IntersectionObserver' in window)){go();return}
    const io=new IntersectionObserver(en=>{if(en[0].isIntersecting){io.disconnect();go()}},{threshold:.6});io.observe(h);
  }
}
/* ripple: a circle grows from the press point and fades (pointer) or from the center (keyboard) */
function ripple(btn,x,y){
  if(reduce||btn.disabled)return;
  const r=btn.getBoundingClientRect(),px=x==null?r.width/2:x-r.left,py=y==null?r.height/2:y-r.top;
  const d=2*Math.hypot(Math.max(px,r.width-px),Math.max(py,r.height-py)),s=document.createElement('span');
  s.className='ripple';s.style.cssText='width:'+d+'px;height:'+d+'px;left:'+(px-d/2)+'px;top:'+(py-d/2)+'px';
  btn.appendChild(s);s.addEventListener('animationend',()=>s.remove(),{once:true});
}
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('.btn');if(b&&e.button===0)ripple(b,e.clientX,e.clientY)});
document.addEventListener('click',e=>{if(e.detail===0){const b=e.target.closest&&e.target.closest('.btn');if(b)ripple(b)}});
/* progressive blur: stacked backdrop-filter layers, each masked to a band, blur growing toward the edge */
(function(){
  const pb=$('#pblur'),B=[.5,1,2,3,4.5,6.5,9,12],N=B.length,st=100/N;
  B.forEach((b,i)=>{const d=document.createElement('i'),a=i*st,m='linear-gradient(to bottom,rgba(0,0,0,0) '+a+'%,#000 '+(a+st)+'%,#000 '+(a+2*st)+'%,rgba(0,0,0,0) '+(a+3*st)+'%)';
    d.style.cssText='-webkit-backdrop-filter:blur('+b+'px);backdrop-filter:blur('+b+'px);-webkit-mask-image:'+m+';mask-image:'+m;pb.appendChild(d)});
})();
function bpToggle(label){return '<button class="bp-t" type="button" aria-expanded="false" aria-label="Expand: '+esc(label)+'" data-act="bp"><span aria-hidden="true"></span></button>'}
function bp(o){return '<article class="bp '+(o.cls||'')+'" style="--g0:'+(o.g||1)+'"><div class="bp-in">'+o.body+(o.more?'<div class="more"><div>'+o.more+'</div></div>':'')+'</div>'+bpToggle(o.label)+'</article>'}
function setActive(row,panel){$$('.bp',row).forEach(p=>{const on=p===panel;p.classList.toggle('on',on);const t=$('.bp-t',p);if(t)t.setAttribute('aria-expanded',String(on))})}
/* hover is decided from the row's RESTING layout (never from the live, expanding one), so growing a panel can't change which panel is under the cursor */
const ONG={'r-a':1.7,'r-b':2.4,'r-c':1.9};
function widthsFor(row,act){
  const ps=Array.from(row.children),gap=parseFloat(getComputedStyle(row).columnGap)||16,total=row.clientWidth-gap*(ps.length-1);
  const key=Object.keys(ONG).find(k=>row.classList.contains(k)),on=ONG[key]||1.7;
  const it=ps.map((p,i)=>{const cs=getComputedStyle(p);return {g:i===act?on:(parseFloat(cs.getPropertyValue('--g0'))||1),min:parseFloat(cs.minWidth)||0,w:0,fix:false}});
  let free=total,guard=0;
  for(;;){
    const open=it.filter(x=>!x.fix),sum=open.reduce((s,x)=>s+x.g,0);let clamped=false;
    for(const x of open){x.w=free*x.g/sum;if(x.w<x.min){x.w=x.min;x.fix=true;free-=x.min;clamped=true;break}}
    if(!clamped||++guard>8)break;
  }
  return {w:it.map(x=>x.w),gap};
}
function restBounds(row){
  if(row._rb&&row._rbW===row.clientWidth)return row._rb;
  const r=widthsFor(row,-1);let x=0;
  row._rb=r.w.map(w=>{const o={l:x,r:x+w+r.gap/2};x+=w+r.gap;return o});row._rb[0].l=-1e9;row._rb[row._rb.length-1].r=1e9;row._rbW=row.clientWidth;
  return row._rb;
}
/* text inside a panel is laid out at the narrowest width that panel ever has, so it never re-wraps or jumps while panels grow and shrink */
function layoutRow(row){
  row.style.height='';
  if(innerWidth<=900){Array.from(row.children).forEach(p=>p.style.removeProperty('--cw'));return}
  const ps=Array.from(row.children),n=ps.length,all=[widthsFor(row,-1).w];for(let j=0;j<n;j++)all.push(widthsFor(row,j).w);
  ps.forEach((p,i)=>{p.style.setProperty('--cw',Math.floor(Math.min(...all.map(a=>a[i])))+'px')});
  /* size the row once to its tallest open state, then lock it: hovering can never change a row's height */
  const base=row.getBoundingClientRect().height;let need=0;
  row.classList.add('measure');
  ps.forEach((p,i)=>{const inn=p.querySelector('.bp-in');if(!inn)return;ps.forEach((q,k)=>q.classList.toggle('on',k===i));inn.style.flex='none';need=Math.max(need,inn.getBoundingClientRect().height);inn.style.flex=''});
  ps.forEach(q=>q.classList.remove('on'));row.classList.remove('measure');
  row.style.height=Math.ceil(Math.max(base,need))+'px';
}
function layoutBento(){document.querySelectorAll('.bprow').forEach(r=>{r._rb=null;layoutRow(r)})}
function leaveRow(row){if(row.dataset.pin)return;clearTimeout(row._lt);row._lt=setTimeout(()=>{setActive(row,null);row.classList.remove('hov')},90)}
document.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse')return;
  const row=e.target.closest&&e.target.closest('.bprow');
  document.querySelectorAll('.bprow.hov').forEach(r=>{if(r!==row)leaveRow(r)});
  if(!row)return;
  clearTimeout(row._lt);row.classList.add('hov');
  const x=e.clientX-row.getBoundingClientRect().left,rb=restBounds(row);
  let i=rb.findIndex(r=>x>=r.l&&x<r.r);if(i<0)return;
  const p=row.children[i];if(p&&!p.classList.contains('on'))setActive(row,p);
});
document.documentElement.addEventListener('mouseleave',()=>document.querySelectorAll('.bprow.hov').forEach(leaveRow));
addEventListener('resize',layoutBento);
document.addEventListener('focusin',e=>{const p=e.target.closest&&e.target.closest('.bp');if(p&&!p.parentElement.dataset.pin&&!p.classList.contains('on')&&e.target.matches('a,button')&&e.target.matches(':focus-visible'))setActive(p.parentElement,p)});
document.addEventListener('focusout',e=>{const row=e.target.closest&&e.target.closest('.bprow');if(row&&!row.dataset.pin&&!row.contains(e.relatedTarget))setActive(row,null)});
/* liquid glass: refraction only where backdrop-filter accepts an SVG filter (Chromium); glint follows the pointer everywhere */
(function(){
  try{if(/Chrome\//.test(navigator.userAgent)&&window.CSS&&CSS.supports&&CSS.supports('backdrop-filter','url(#lg-warp)'))document.documentElement.classList.add('lg-warp')}catch(e){}
  let raf=0,pend=null;
  document.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch')return;const el=e.target.closest&&e.target.closest('.btn');if(!el)return;
    pend=[el,e.clientX,e.clientY];
    if(!raf)raf=requestAnimationFrame(()=>{raf=0;const t=pend[0],r=t.getBoundingClientRect();t.style.setProperty('--mx',(pend[1]-r.left)+'px');t.style.setProperty('--my',(pend[2]-r.top)+'px')});
  },{passive:true});
})();
