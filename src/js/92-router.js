/* ---------- router ---------- */
function route(){const t=(location.hash||'#home').slice(1)||'home';return t}
const TITLES={home:'TRAVL · Every millimeter, felt.',shop:'Shop · TRAVL',cart:'Cart · TRAVL',login:'Sign in · TRAVL',checkout:'Checkout · TRAVL',done:'Order placed · TRAVL',account:'Account · TRAVL'};
let lastRoute='',pendingScroll=null;
function render(quiet){
  hsFn=null;
  let r=route();const app=$('#app');
  const prod=CAT.find(p=>p.slug===r);
  if(!prod&&!V[r])r='home';
  if(r==='account'&&!acct()){loginNote='Sign in to see your account.';r='login'}
  let html=prod?pdp(prod):V[r]();
  app.innerHTML='<span id="main-start"></span>'+html;
  app.dataset.ready='1';
  document.title=prod?prod.name+' · TRAVL':TITLES[r]||TITLES.home;
  chrome();
  if(!quiet||lastRoute!==r){const h=$('h1',app);if(h){h.tabIndex=-1;h.focus({preventScroll:true})}window.scrollTo(0,0)}
  lastRoute=r;mount(r,prod);queueWarp();
  if(pendingScroll&&r==='home'){const t=$('#'+pendingScroll);pendingScroll=null;if(t)setTimeout(()=>t.scrollIntoView(),80)}
}
function mount(r,prod){
  if(r==='home'){mountWordmark();mountTyping();mountHero();mountHScroll();mountBuild();layoutBento()}
  if(prod&&prod.feel)mountSlider();
  if(r==='checkout'){const f=$('form[data-form=checkout]');if(f){
    f.elements.card.addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,19).replace(/(.{4})/g,'$1 ').trim()});
    f.elements.exp.addEventListener('input',e=>{let v=e.target.value.replace(/\D/g,'').slice(0,4);if(v.length>2)v=v.slice(0,2)+'/'+v.slice(2);e.target.value=v});}}
  if(r==='done')mountDone();
}
function mountWordmark(){
  const wm=$('#wm');if(!wm)return;const glow=$('.wm-glow',wm);
  let swept=false,hover=false,tapT=0;
  const setX=e=>{const r=wm.getBoundingClientRect();glow.style.setProperty('--x',((e.clientX-r.left)/r.width*100).toFixed(1)+'%')};
  const on=e=>{hover=true;glow.classList.add('follow');setX(e);wm.classList.add('lit')};
  wm.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')on(e)});
  wm.addEventListener('pointermove',e=>{if(e.pointerType==='touch'&&!e.buttons)return;on(e)});
  wm.addEventListener('pointerleave',e=>{if(e.pointerType==='touch')return;hover=false;wm.classList.remove('lit')});
  wm.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch')return;on(e);clearTimeout(tapT);tapT=setTimeout(()=>{hover=false;wm.classList.remove('lit')},1400)});
  wm.addEventListener('pointercancel',()=>{hover=false;wm.classList.remove('lit')});
  if(reduce){swept=true;return}
  wm.classList.add('pre');
  requestAnimationFrame(()=>requestAnimationFrame(()=>wm.classList.remove('pre')));
  setTimeout(()=>{if(!wm.isConnected)return;if(!hover)glow.classList.remove('follow');wm.classList.add('lit');if(!hover)glow.style.setProperty('--x','125%');
    setTimeout(()=>{swept=true;if(!hover)wm.classList.remove('lit')},2000)},750);
}
function mountHero(){
  const stage=$('#heroStage');if(!stage)return;const sw=bindSwitch(stage),hit=$('.hit',stage);
  let trv=0,target=0,raf=0,last=0,reg=false,bottom=false;
  function tick(now){
    if(!stage.isConnected){raf=0;return}
    const dt=Math.min(.05,(now-last)/1000);last=now;const sp=target>trv?4/.3:4/.55,d=target-trv;
    trv+=Math.sign(d)*Math.min(Math.abs(d),sp*dt);sw.apply(trv);
    const r=trv>=2;if(r&&!reg)click();reg=r;
    const b=trv>=3.98;if(b&&!bottom&&!reduce){stage.classList.remove('jolt');void stage.offsetWidth;stage.classList.add('jolt')}bottom=b;
    raf=Math.abs(target-trv)>1e-3?requestAnimationFrame(tick):0;
  }
  const press=t=>{target=t;if(!raf){last=performance.now();raf=requestAnimationFrame(tick)}};
  hit.addEventListener('pointerdown',e=>{e.preventDefault();try{hit.setPointerCapture(e.pointerId)}catch(x){}press(4)});
  ['pointerup','pointercancel'].forEach(ev=>hit.addEventListener(ev,()=>press(0)));
  hit.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();press(4)}});
  hit.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')press(0)});
  hit.addEventListener('blur',()=>press(0));
  hit.addEventListener('contextmenu',e=>e.preventDefault());
}
function mountSlider(){
  const stage=$('#pdpStage'),rng=$('#trv'),out=$('#trvOut');if(!stage||!rng)return;const sw=bindSwitch(stage);let wasReg=false;
  rng.addEventListener('input',()=>{const mm=+rng.value/100;sw.apply(mm);out.textContent=mm.toFixed(1)+' mm';rng.setAttribute('aria-valuetext',mm.toFixed(1)+' millimeters, '+SNAME[sIdx(mm)]);const r=mm>=2;if(r&&!wasReg)click();wasReg=r});
}
function mountDone(){
  const b=$('#doneKey'),ro=$('#doneRo');if(!b)return;let run=false;
  const set=mm=>{ro.innerHTML=mm.toFixed(1)+'<small>mm</small>';ro.classList.toggle('on',mm>=2)};
  function go(){if(run)return;run=true;b.classList.add('down');click();const t0=performance.now(),D=reduce?1:500;
    (function st(now){const q=clamp((now-t0)/D,0,1),mm=q<.5?4*(q/.5):4*(1-(q-.5)/.5);set(mm);if(q>=1){b.classList.remove('down');run=false;set(0);return}requestAnimationFrame(st)})(t0)}
  b.addEventListener('click',go);
  if(!reduce)setTimeout(go,500);
}
