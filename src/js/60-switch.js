/* ---------- the switch (video scrubbed by travel) ---------- */
let _clip=null;
function clipURL(){
  if(_clip!==null)return _clip;
  try{const bin=atob(CLIPB64),n=bin.length,u=new Uint8Array(n);for(let i=0;i<n;i++)u[i]=bin.charCodeAt(i);_clip=URL.createObjectURL(new Blob([u],{type:'video/mp4'}))}catch(e){_clip=''}
  return _clip;
}
const SNAME=['Resting','Pre-travel','Registered at 2.0 mm','Bottomed out at 4.0 mm'];
const sIdx=mm=>mm<.05?0:mm<2?1:mm<3.95?2:3;
function bindSwitch(root){
  const vid=$('video',root),roV=$('.roV',root),roS=$('.roS',root),dot=$('.dot',root);
  let dur=5.04,ready=false,lastT=-1,cur=0;
  const src=clipURL();
  if(src&&vid){
    vid.src=src;
    vid.addEventListener('loadedmetadata',()=>{dur=vid.duration||dur;ready=true;lastT=-1;apply(cur)},{once:true});
    vid.load();const p=vid.play();if(p&&p.then)p.then(()=>{vid.pause();vid.currentTime=0;lastT=-1;apply(cur)}).catch(()=>{});
  }
  function apply(mm){
    cur=mm;const t=clamp(mm/4,0,1)*Math.max(0,dur-.05);
    if(ready&&Math.abs(t-lastT)>.008){vid.currentTime=t;lastT=t}
    roV.textContent=mm.toFixed(1);dot.style.top=(mm/4*100).toFixed(2)+'%';
    roS.textContent=SNAME[sIdx(mm)];root.classList.toggle('on',mm>=2);
  }
  apply(0);
  return {apply,get cur(){return cur}};
}
function stageHTML(id,label,hit){
  return '<div class="stage" id="'+id+'">'
   +'<video muted playsinline preload="auto" poster="'+(IMG.poster||'')+'" aria-hidden="true"></video>'
   +'<div class="hud-ro" aria-hidden="true"><span class="l">Travel</span><b class="roV">0.0</b><i>mm</i></div>'
   +'<div class="hud-gauge" aria-hidden="true"><div class="rail"></div><div class="tick" style="top:0"></div><span class="tk" style="top:0">0</span><div class="tick" style="top:50%"></div><span class="tk" style="top:50%">2.0</span><div class="tick" style="top:100%"></div><span class="tk" style="top:100%">4.0</span><div class="dot"></div></div>'
   +'<div class="hud-state roS" aria-hidden="true">Resting</div>'
   +(hit?'<button class="hit" type="button" aria-label="'+esc(label)+'"></button>':'')
   +'</div>';
}
