/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-act]');if(!el)return;const act=el.dataset.act;
  if(act==='bp'){const p=el.closest('.bp'),row=p.parentElement;if(p.classList.contains('on')&&row.dataset.pin){delete row.dataset.pin;setActive(row,null)}else{row.dataset.pin='1';setActive(row,p)}return}
  if(act==='add'){
    const qty=el.dataset.useqty?(+($('#pq')||{textContent:1}).textContent||1):1;
    addToCart(el.dataset.id,qty);click();toast('Added '+byId(el.dataset.id).name+' to your cart');
    if(el.dataset.then==='checkout')location.hash='#checkout';
  }else if(act==='pq'){const o=$('#pq');o.textContent=clamp(+o.textContent+ +el.dataset.d,1,10)}
  else if(act==='hs'){const hs=$('#hs');if(!hs)return;const N=MAT.length,i=+el.dataset.i,travel=hs.offsetHeight-innerHeight,top=hs.getBoundingClientRect().top+scrollY;scrollTo({top:Math.round(top+(i/(N-1))*travel),behavior:reduce?'auto':'smooth'})}
  else if(act==='cfgadd'){const id=isDefaultCfg()?'board':'board~'+cfg.layout+'~'+cfg.caps+'~'+cfg.cord;addToCart(id,1);click();toast('Added '+byId(id).name+' to your cart');if(el.dataset.then==='checkout')location.hash='#checkout'}
  else if(act==='gobuild'){if(route()==='home'){e.preventDefault();const t=$('#cfg');if(t)t.scrollIntoView({behavior:reduce?'auto':'smooth'})}else pendingScroll='cfg'}
  else if(act==='thumb'){const m=$('#galMain');m.innerHTML=im(el.dataset.k);$$('.thumbs button').forEach(b=>b.setAttribute('aria-current',String(b===el)))}
  else if(act==='inc'||act==='dec'){const l=S.cart.find(x=>x.id===el.dataset.id);if(l){l.qty=clamp(l.qty+(act==='inc'?1:-1),1,10);persist();render(true)}}
  else if(act==='rm'){S.cart=S.cart.filter(x=>x.id!==el.dataset.id);persist();render(true);toast('Removed from your cart')}
  else if(act==='tab'){loginTab=el.dataset.t;loginNote='';render(true)}
  else if(act==='atab'){acctTab=el.dataset.t;render(true)}
  else if(act==='showpw'){const f=el.closest('form');f.elements.password.type=el.checked?'text':'password'}
  else if(act==='signinfirst'){loginTab='in';loginNote='Sign in to use your saved details.'}
  else if(act==='signupfirst'){loginTab='up';loginNote=''}
  else if(act==='signout'){S.session=null;loginTab='in';persist();toast('Signed out');location.hash='#home';chrome()}
  else if(act==='wipe'){
    if(el.dataset.sure){S=blank();persist();toast('All data deleted');location.hash='#home';render()}
    else{el.dataset.sure='1';el.textContent='Yes, delete everything';el.classList.add('key')}
  }
});
document.addEventListener('submit',async e=>{
  const f=e.target.closest('form[data-form]');if(!f)return;e.preventDefault();
  const kind=f.dataset.form,v=n=>(f.elements[n]?f.elements[n].value:'').trim(),errs={};
  if(kind==='signin'||kind==='signup'){
    const email=v('email').toLowerCase(),pw=f.elements.password.value;
    if(!EMAIL.test(email))errs.email='Enter an email like name@example.com.';
    if(kind==='signup'){
      if(!v('name'))errs.name='Enter your name.';
      if(pw.length<8)errs.password='Use at least 8 characters for your password.';
      else if(S.accounts.some(a=>a.email===email))errs.email='An account with this email already exists here. Use Sign in instead.';
    }else if(!pw)errs.password='Enter your password.';
    if(Object.keys(errs).length)return showErrors(f,errs);
    const btn=$('button[type=submit]',f);btn.disabled=true;
    if(kind==='signup'){const salt=rnd(8),hash=await hashPw(pw,salt);S.accounts.push({name:v('name'),email,salt,hash,createdAt:Date.now()});S.session=email;toast('Account created')}
    else{const a=S.accounts.find(x=>x.email===email),ok=a&&(await hashPw(pw,a.salt))===a.hash;
      if(!ok){btn.disabled=false;return showErrors(f,{password:'That email and password don’t match an account on this device. Check them, or create an account.'})}
      S.session=email;toast('Welcome back, '+a.name.split(' ')[0])}
    persist();loginNote='';loginTab='in';location.hash=cartCount()&&S.ship&&S.ship.addr1?'#checkout':'#account';if(route()==='login'||route()==='account')render();chrome();
  }else if(kind==='profile'){
    if(!v('name'))errs.name='Enter your name.';
    if(Object.keys(errs).length)return showErrors(f,errs);
    acct().name=v('name');persist();toast('Saved');render(true);
  }else if(kind==='checkout'){
    const email=v('email').toLowerCase();
    if(!EMAIL.test(email))errs.email='Enter an email like name@example.com.';
    if(!v('name'))errs.name='Enter the name for delivery.';
    if(!v('addr1'))errs.addr1='Enter a street address.';
    if(!v('city'))errs.city='Enter a city.';
    if(!v('state'))errs.state='Choose a state.';
    if(!/^\d{5}$/.test(v('zip')))errs.zip='Enter a 5-digit ZIP code.';
    const card=v('card').replace(/\s/g,'');
    if(!/^\d{13,19}$/.test(card)||!luhn(card))errs.card='That card number doesn’t look right. Use the test card that’s filled in.';
    const m=/^(\d{2})\/(\d{2})$/.exec(v('exp'));
    if(!m||+m[1]<1||+m[1]>12)errs.exp='Enter the expiry as MM/YY.';
    else{const now=new Date(),y=2000+ +m[2],mo=+m[1];if(y<now.getFullYear()||(y===now.getFullYear()&&mo<now.getMonth()+1))errs.exp='That card has expired. Enter a future date.'}
    if(!/^\d{3,4}$/.test(v('cvc')))errs.cvc='Enter the 3 or 4 digit security code.';
    if(Object.keys(errs).length)return showErrors(f,errs);
    showErrors(f,{});
    const btn=$('#placeBtn');btn.disabled=true;btn.textContent='Placing order…';
    const L=lines(),t=totals();
    const ship={name:v('name'),addr1:v('addr1'),addr2:v('addr2'),city:v('city'),state:v('state'),zip:v('zip'),phone:v('phone'),email};
    await new Promise(r=>setTimeout(r,reduce?0:900));
    const o={id:orderId(),createdAt:Date.now(),email,items:L.map(l=>({id:l.p.id,name:l.p.name,variant:l.p.variant||'',price:l.p.price,qty:l.qty})),totals:t,ship,status:'Placed. Concept order, nothing will be built or shipped.'};
    S.orders.push(o);S.lastOrder=o.id;S.cart=[];
    if(f.elements.save.checked)S.ship=ship;
    persist();click();chrome();location.hash='#done';
  }
});
$('#snd').addEventListener('click',()=>{soundOn=!soundOn;try{localStorage.setItem('travl.sound',soundOn?'1':'0')}catch(e){}sndLabel();click()});
$('#skip').addEventListener('click',e=>{e.preventDefault();const a=$('#app');a.focus();a.scrollIntoView()});
/* the footer feathers the progressive blur away as it rises into view */
const ftEl=$('#hf');
let warpQ=false;
function warp(){
  warpQ=false;const r=ftEl.getBoundingClientRect();
  const pb=$('#pblur'),h0=$('#hero0');if(pb){const o=h0?clamp(1-(innerHeight-r.top)/320,0,1):0;pb.style.opacity=o.toFixed(3);pb.style.visibility=o>.01?'visible':'hidden'}
}
const queueWarp=()=>{if(!warpQ){warpQ=true;requestAnimationFrame(warp)}};
addEventListener('scroll',queueWarp,{passive:true});addEventListener('resize',queueWarp);
addEventListener('hashchange',()=>render());
/* hover footer: giant outlined wordmark; a gradient stroke is revealed under the cursor */
(function(){
  const fx=$('#hfx');if(!fx)return;
  const p=WM.paths.map(d=>'<path pathLength="1" d="'+d+'"/>').join('');
  fx.innerHTML='<svg class="hf-base" viewBox="'+WM.vb+'" focusable="false"><g>'+p+'</g></svg>'
   +'<svg class="hf-hot" viewBox="'+WM.vb+'" focusable="false"><defs><linearGradient id="hfGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="'+WM.w+'" y2="0"><stop offset="0" stop-color="#F3D9A4"/><stop offset=".35" stop-color="#C2633F"/><stop offset=".7" stop-color="#B8976F"/><stop offset="1" stop-color="#F3D9A4"/></linearGradient></defs><g stroke="url(#hfGrad)">'+WM.paths.map(d=>'<path d="'+d+'"/>').join('')+'</g></svg>';
  if(reduce||!('IntersectionObserver' in window))fx.classList.add('draw');
  else new IntersectionObserver((en,io)=>{if(en[0].isIntersecting){io.disconnect();fx.classList.add('draw')}},{threshold:.25}).observe(fx);
  let tapT=0;
  const at=e=>{const r=fx.getBoundingClientRect();fx.style.setProperty('--mx',(e.clientX-r.left)+'px');fx.style.setProperty('--my',(e.clientY-r.top)+'px');fx.classList.add('hot')};
  fx.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')at(e)});
  fx.addEventListener('pointermove',e=>{if(e.pointerType==='touch'&&!e.buttons)return;at(e)});
  fx.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')fx.classList.remove('hot')});
  fx.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){at(e);clearTimeout(tapT);tapT=setTimeout(()=>fx.classList.remove('hot'),1400)}});
})();
sndLabel();chrome();render();syncText();connect();
