/* ---------- configurator: layout, keycaps, cord ---------- */
const LAY=[{id:'65',name:'65%',base:22900,d:'Compact, with arrow keys'},{id:'75',name:'75%',base:24900,d:'The standard TRAVL'},{id:'80',name:'80%',base:26900,d:'Adds the navigation cluster'},{id:'100',name:'100%',base:29900,d:'Full size with a numpad'}];
const CAPS=[{id:'warm',name:'Warm PBT',add:0,d:'Off-white, terracotta Esc'},{id:'graphite',name:'Graphite PBT',add:2900,d:'Grey, brass Esc'},{id:'night',name:'Night PBT',add:2900,d:'Charcoal, lamp-light Esc'}];
const CORDS=[{id:'straight',name:'Straight',add:0,d:'USB-C, straight'},{id:'coiled',name:'Coiled',add:1900,d:'USB-C, coiled'},{id:'aviator',name:'Coiled aviator',add:2900,d:'Coiled, with aviator connector'}];
const PAL={
 warm:{a:['#E6DCD1','#BDB2A5','#2A2629'],m:['#CFC4B7','#A99E91','#2A2629'],e:['#C2633F','#8f4429','#141214']},
 graphite:{a:['#9A949A','#6A646A','#1E1C20'],m:['#8A848A','#5C565C','#1E1C20'],e:['#B8976F','#8A6F4C','#1E1C20']},
 night:{a:['#4A464D','#2B292E','#E6DCD1'],m:['#3D3A40','#24222A','#E6DCD1'],e:['#F3D9A4','#C2A872','#1E1C20']}
};
const cfg={layout:'75',caps:'warm',cord:'straight'};
const isDefaultCfg=()=>cfg.layout==='75'&&cfg.caps==='warm'&&cfg.cord==='straight';
function cfgItem(l,c,k){
  const L=LAY.find(x=>x.id===l),C=CAPS.find(x=>x.id===c),K=CORDS.find(x=>x.id===k);if(!L||!C||!K)return null;
  return {id:'board~'+l+'~'+c+'~'+k,slug:'p-board',name:'TRAVL '+L.name,price:L.base+C.add+K.add,img:'intro',variant:C.name+' keycaps, '+K.name.toLowerCase()+' cord'};
}
function genLayout(id){
  const keys=[];let maxX=0,maxY=0;
  const add=(x,y,w,l,k,h)=>{keys.push({x,y,w,h:h||1,l:l||'',k:k||'a'});maxX=Math.max(maxX,x+w);maxY=Math.max(maxY,y+(h||1))};
  const rowAt=(y,x,toks)=>{toks.forEach(t=>{if(typeof t==='number'){x+=t;return}add(x,y,t[0],t[1],t[2]);x+=t[0]});return x};
  const A=n=>Array.from({length:n},()=>[1,'','a']),Fk=n=>Array.from({length:n},()=>[1,'','m']),M=(w,l)=>[w,l||'','m'];
  const hasF=id!=='65',big=id==='80'||id==='100',y0=hasF?1.4:0;
  if(hasF){
    if(big)rowAt(0,0,[[1,'Esc','e'],1,...Fk(4),.5,...Fk(4),.5,...Fk(4),.25,...Fk(3)]);
    else rowAt(0,0,[[1,'Esc','e'],...Fk(4),.25,...Fk(4),.25,...Fk(4),.25,...Fk(2)]);
  }
  rowAt(y0,0,[...(id==='65'?[[1,'Esc','e'],...A(12)]:A(13)),M(2,'')]);
  rowAt(y0+1,0,[M(1.5,'Tab'),...A(12),M(1.5,'')]);
  rowAt(y0+2,0,[M(1.75,'Caps'),...A(11),M(2.25,'Enter')]);
  rowAt(y0+3,0,[M(2.25,'Shift'),...A(10),M(big?2.75:1.75,'Shift')]);
  if(big)rowAt(y0+4,0,[M(1.25,'Ctrl'),M(1.25,'Win'),M(1.25,'Alt'),M(6.25,''),M(1.25,'Alt'),M(1.25,'Win'),M(1.25,'Fn'),M(1.25,'Ctrl')]);
  else rowAt(y0+4,0,[M(1.25,'Ctrl'),M(1.25,'Win'),M(1.25,'Alt'),M(6.25,''),M(1.5,'Alt'),M(1.5,'Fn')]);
  if(!big){
    [0,1,2,3].forEach(i=>add(15,y0+i,1,'','m'));
    add(14,y0+3,1,'↑','m');add(13,y0+4,1,'←','m');add(14,y0+4,1,'↓','m');add(15,y0+4,1,'→','m');
  }else{
    rowAt(y0,15.25,[A(3).map(k=>[1,'','m'])].flat());rowAt(y0+1,15.25,[[1,'','m'],[1,'','m'],[1,'','m']]);
    add(16.25,y0+3,1,'↑','m');add(15.25,y0+4,1,'←','m');add(16.25,y0+4,1,'↓','m');add(17.25,y0+4,1,'→','m');
  }
  if(id==='100'){
    const nx=18.5;
    rowAt(y0,nx,[[1,'','m'],[1,'','m'],[1,'','m'],[1,'','m']]);
    rowAt(y0+1,nx,[[1,'','a'],[1,'','a'],[1,'','a']]);add(nx+3,y0+1,1,'','m',2);
    rowAt(y0+2,nx,[[1,'','a'],[1,'','a'],[1,'','a']]);
    rowAt(y0+3,nx,[[1,'','a'],[1,'','a'],[1,'','a']]);add(nx+3,y0+3,1,'','m',2);
    add(nx,y0+4,2,'','a');add(nx+2,y0+4,1,'','a');
  }
  return {keys,w:maxX,h:maxY};
}
function previewSVG(){
  const L=genLayout(cfg.layout),P=PAL[cfg.caps],pad=.6,top=3.2,W=L.w+pad*2,CH=L.h+pad*2,H=top+CH+.3,ox=pad,oy=top+pad,cx=W/2;
  let s='<svg viewBox="0 0 '+W.toFixed(2)+' '+H.toFixed(2)+'" role="img" aria-label="'+esc(cfgSentence())+'" focusable="false"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#66626a"/><stop offset="1" stop-color="#37343a"/></linearGradient></defs>';
  // cord
  const cc='#9b9186',cableTop=top;
  const plug=y=>'<rect x="'+(cx-.32)+'" y="'+y+'" width=".64" height=".86" rx=".12" fill="#cfc8c0"/><rect x="'+(cx-.2)+'" y="'+(y+.08)+'" width=".4" height=".16" rx=".05" fill="#2b292e"/>';
  if(cfg.cord==='straight'){
    s+='<line x1="'+cx+'" y1="'+cableTop+'" x2="'+cx+'" y2="1.0" stroke="'+cc+'" stroke-width=".17" stroke-linecap="round"/>'+plug(.16);
  }else{
    const y1=cfg.cord==='aviator'?cableTop-1.15:cableTop-.5,y2=1.2,loops=cfg.cord==='aviator'?7:8,R=.36;let d='',first=true;
    for(let th=0;th<=2*Math.PI*loops;th+=.12){const x=cx+R*Math.cos(th),y=y1-(y1-y2)*th/(2*Math.PI*loops)+.14*Math.sin(th);d+=(first?'M':'L')+x.toFixed(3)+' '+y.toFixed(3)+' ';first=false}
    s+='<line x1="'+cx+'" y1="'+cableTop+'" x2="'+cx+'" y2="'+(y1+.2)+'" stroke="'+cc+'" stroke-width=".17" stroke-linecap="round"/>'
     +'<path d="'+d+'" fill="none" stroke="'+cc+'" stroke-width=".15" stroke-linecap="round" stroke-linejoin="round"/>'
     +'<line x1="'+cx+'" y1="'+(y2-.05)+'" x2="'+cx+'" y2="1.0" stroke="'+cc+'" stroke-width=".17" stroke-linecap="round"/>'+plug(.16);
    if(cfg.cord==='aviator')s+='<rect x="'+(cx-.3)+'" y="'+(cableTop-1.0)+'" width=".6" height=".85" rx=".1" fill="#8a8378"/><g stroke="#2b292e" stroke-width=".05" opacity=".7"><line x1="'+(cx-.3)+'" y1="'+(cableTop-.8)+'" x2="'+(cx+.3)+'" y2="'+(cableTop-.8)+'"/><line x1="'+(cx-.3)+'" y1="'+(cableTop-.6)+'" x2="'+(cx+.3)+'" y2="'+(cableTop-.6)+'"/><line x1="'+(cx-.3)+'" y1="'+(cableTop-.4)+'" x2="'+(cx+.3)+'" y2="'+(cableTop-.4)+'"/></g>';
  }
  // case + plate
  s+='<rect x="0" y="'+top+'" width="'+W+'" height="'+CH+'" rx=".5" fill="url(#cg)"/><rect x=".04" y="'+(top+.04)+'" width="'+(W-.08)+'" height="'+(CH-.08)+'" rx=".46" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width=".05"/>'
   +'<rect x=".3" y="'+(top+.3)+'" width="'+(W-.6)+'" height="'+(CH-.6)+'" rx=".3" fill="#17151a"/>';
  L.keys.forEach(k=>{
    const c=P[k.k==='f'?'m':k.k]||P.a,x=ox+k.x+.05,y=oy+k.y+.05,w=k.w-.1,h=k.h-.1;
    s+='<rect x="'+x.toFixed(3)+'" y="'+y.toFixed(3)+'" width="'+w.toFixed(3)+'" height="'+h.toFixed(3)+'" rx=".13" fill="'+c[1]+'"/><rect x="'+(x+.06).toFixed(3)+'" y="'+(y+.05).toFixed(3)+'" width="'+(w-.12).toFixed(3)+'" height="'+(h-.2).toFixed(3)+'" rx=".11" fill="'+c[0]+'"/>';
    if(k.l)s+='<text x="'+(x+w/2).toFixed(3)+'" y="'+(y+(h-.2)/2+.14).toFixed(3)+'" text-anchor="middle" font-size=".3" font-family="Montserrat,system-ui,sans-serif" font-weight="600" fill="'+c[2]+'">'+k.l+'</text>';
  });
  return s+'</svg>';
}
function cfgPrice(){const L=LAY.find(x=>x.id===cfg.layout),C=CAPS.find(x=>x.id===cfg.caps),K=CORDS.find(x=>x.id===cfg.cord);return L.base+C.add+K.add}
function cfgSentence(){const L=LAY.find(x=>x.id===cfg.layout),C=CAPS.find(x=>x.id===cfg.caps),K=CORDS.find(x=>x.id===cfg.cord);return 'TRAVL '+L.name+': '+genLayout(cfg.layout).keys.length+' keys, '+C.name+' keycaps, '+K.name.toLowerCase()+' cord.'}
function optHTML(grp,o,sub){const sel=cfg[grp]===o.id;return '<label class="opt'+(sel?' on':'')+'"><input type="radio" name="cfg-'+grp+'" value="'+o.id+'" data-cfg="'+grp+'"'+(sel?' checked':'')+'><span class="opt-t">'+esc(o.name)+'</span><span class="opt-s">'+esc(sub)+'</span></label>'}
const delta=a=>a?'+'+money(a):'Included';
function cfgHTML(){
  return '<section class="block" id="cfg" aria-labelledby="cfgT"><div class="cfg-head"><p class="kicker">Make it yours</p><h2 id="cfgT">Pick the size, the keycaps, the cord.</h2></div>'
   +'<div class="cfg"><div class="cfg-stage"><div class="cfg-view" id="cfgView"></div><p class="cfg-cap" id="cfgCap"></p></div>'
   +'<div class="cfg-opts"><form onsubmit="return false">'
   +'<fieldset><legend>Layout</legend><div class="opts two">'+LAY.map(o=>optHTML('layout',o,genLayout(o.id).keys.length+' keys, from '+money(o.base))).join('')+'</div></fieldset>'
   +'<fieldset style="margin-top:28px"><legend>Keycaps</legend><div class="opts">'+CAPS.map(o=>optHTML('caps',o,o.d+'. '+delta(o.add))).join('')+'</div></fieldset>'
   +'<fieldset style="margin-top:28px"><legend>Cord</legend><div class="opts">'+CORDS.map(o=>optHTML('cord',o,o.d+'. '+delta(o.add))).join('')+'</div></fieldset></form>'
   +'<div class="cfg-sum" id="cfgSum" aria-live="polite"></div></div></div></section>';
}
function paintCfg(){
  const v=$('#cfgView');if(!v)return;
  v.innerHTML=previewSVG();$('#cfgCap').textContent=cfgSentence();
  $$('.opt').forEach(l=>{const i=$('input',l);l.classList.toggle('on',i.checked)});
  $('#cfgSum').innerHTML='<p class="nm">'+esc(cfgSentence().replace(/:.*$/,''))+'</p><p class="muted" style="font-size:14px">'+esc(cfgSentence().replace(/^[^:]*:\s*/,''))+'</p><div class="row"><span class="tot">'+money(cfgPrice())+'</span><button class="btn key" type="button" data-act="cfgadd">Add to cart</button><button class="btn" type="button" data-act="cfgadd" data-then="checkout">Buy now</button></div><p class="notice">Concept product. Orders are simulated and nothing is charged or shipped.</p>';
}
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.cfg){cfg[t.dataset.cfg]=t.value;paintCfg()}});
function mountBuild(){if($('#cfg'))paintCfg()}
