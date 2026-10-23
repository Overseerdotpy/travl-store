/* ---------- materials: pinned horizontal scroll ---------- */
const MAT=[
 {k:'Aluminum',img:'top',p:'CNC aluminum in graphite, milled from a solid block and bead blasted, with a polished chamfer where the light catches.',chips:['CNC milled','Bead blasted','Polished chamfer']},
 {k:'Brass',img:'v3',p:'A brushed brass plate underneath adds heft and steadies the board. Rubber feet, one USB-C port, no wobble.',chips:['Brushed finish','Adds heft','Steadies the board']},
 {k:'PBT',img:'v2',p:'Eighty-two keycaps in warm PBT, each one landing squarely on its switch. Exactly one of them is terracotta.',chips:['Warm off-white','Crisp legends','One terracotta Esc']}
];
function hsHTML(){
  return '<section class="hs" id="hs" aria-labelledby="hsT"><div class="hs-stick"><div class="wrap hs-head"><div><p class="kicker">Materials</p><h2 id="hsT">Three things you can feel.</h2></div>'
   +'<nav class="hs-tabs" aria-label="Materials">'+MAT.map((m,i)=>'<button type="button" data-act="hs" data-i="'+i+'"'+(i===0?' aria-current="true"':'')+'>'+m.k+'</button>').join('')+'</nav></div>'
   +'<div class="hs-bar" aria-hidden="true"><i id="hsBar"></i></div>'
   +'<div class="hs-track" id="hsTrack">'+MAT.map((m,i)=>'<article class="hs-p" aria-label="'+m.k+'"><div class="hs-copy"><p class="hs-n mono">'+(i+1)+' / '+MAT.length+'</p><h3>'+m.k+'</h3><p>'+m.p+'</p><ul class="chips">'+m.chips.map(c=>'<li>'+c+'</li>').join('')+'</ul></div><div class="hs-img">'+im(m.img,'')+'</div></article>').join('')+'</div></div></section>';
}
let hsFn=null;
addEventListener('scroll',()=>{if(hsFn)hsFn()},{passive:true});addEventListener('resize',()=>{if(hsFn)hsFn()});
function mountHScroll(){
  const hs=$('#hs');if(!hs)return;
  if(reduce){hs.classList.add('static');return}
  const track=$('#hsTrack'),bar=$('#hsBar'),tabs=$$('.hs-tabs button',hs),panels=$$('.hs-p',hs),N=panels.length;
  const ss=x=>x*x*(3-2*x);
  hsFn=function(){
    if(!hs.isConnected)return;
    const r=hs.getBoundingClientRect(),travel=Math.max(1,hs.offsetHeight-innerHeight),p=clamp(-r.top/travel,0,1);
    const t=p*(N-1),i=Math.min(N-2,Math.floor(t)),f=t-i,e=i+ss(clamp((f-.22)/.56,0,1));
    track.style.transform='translate3d('+(-e/N*100).toFixed(3)+'%,0,0)';
    bar.style.width=(p*100).toFixed(1)+'%';
    panels.forEach((pn,k)=>pn.style.setProperty('--o',(k-e).toFixed(3)));
    const cur=Math.round(e);tabs.forEach((b,k)=>{if(k===cur)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')});
  };
  hsFn();
}
