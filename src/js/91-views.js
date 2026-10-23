/* ---------- views ---------- */
const V={};
function card(p){
  return '<article class="card"><a class="im" href="#'+p.slug+'" tabindex="-1" aria-hidden="true">'+im(p.img,'')+'</a>'
   +'<h3><a href="#'+p.slug+'">'+esc(p.name)+'</a></h3><p>'+esc(p.short)+'</p>'
   +'<div class="row"><span class="price">'+money(p.price)+'</span><button class="btn small" type="button" data-act="add" data-id="'+p.id+'">Add to cart</button></div></article>';
}
V.home=()=>
 '<section class="hero0" id="hero0">'+wmHTML()+typed('p','subline','sub',SUB)+'</section>'
 +'<div class="wrap"><div class="bento">'
 +'<div class="bprow r-a">'
 +bp({cls:'bp-copy',g:1,label:'Every millimeter, felt',body:'<div><p class="kicker">TRAVL 75 mechanical keyboard</p>'+typed('h1','','h1type','Every millimeter, felt.')+'</div><p class="lede">A 75% keyboard in CNC aluminum, built around one number: 4.0 mm of travel. Press the key to feel what that means.</p><div class="ctas"><a class="btn key" href="#p-board">Shop the TRAVL 75</a><a class="btn" href="story/">Watch the story</a></div>',more:'Eighty-two keys, one switch, and a counter that reads real travel. Hold the key beside this panel to feel it.'})
 +'<article class="bp bp-stage" style="--g0:1.35">'+stageHTML('heroStage','Press and hold to press the switch. At 2.0 millimeters it registers.',true)+'<div class="bp-cap"><b>Press and hold the key.</b><div class="more"><div>At 2.0 mm it registers; at 4.0 mm it bottoms out.</div></div></div>'+bpToggle('Press and hold the key')+'</article>'
 +'</div>'
 +'<div class="bprow r-b">'
 +bp({cls:'bp-stat',g:1,label:'4.0 millimeters of travel',body:'<p class="num">4.0<small>mm</small></p><p class="lab">of travel, top to bottom</p>',more:'The full stroke. The stem sinks, the spring compresses, and the key bottoms out on the housing.'})
 +bp({cls:'bp-stat',g:1,label:'2.0 millimeters to register',body:'<p class="num">2.0<small>mm</small></p><p class="lab">where the key registers</p>',more:'Halfway down, two copper contacts meet. That is the moment the keypress counts.'})
 +bp({cls:'bp-stat',g:1,label:'82 keys',body:'<p class="num">82</p><p class="lab">keys in a 75% layout</p>',more:'The same switch in every position, and exactly one terracotta Esc keycap.'})
 +'</div>'
 +'<div class="bprow r-c">'
 +'<article class="bp bp-img" style="--g0:1.2">'+im('intro','')+'<div class="bp-cap"><b>TRAVL 75 in graphite</b><div class="more"><div>Bead blasted aluminum with a polished chamfer where the light catches.</div></div></div>'+bpToggle('The board')+'</article>'
 +bp({cls:'bp-board',g:1,label:'The board',body:'<div><p class="kicker">The board</p><h2>Machined, not molded.</h2></div><p class="sec">CNC aluminum in graphite, bead blasted, with a polished chamfer where the light catches. A brushed brass plate underneath adds heft and steadies the board.</p><div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap"><span class="price">'+money(byId('board').price)+'</span><a class="btn key" href="#p-board">See the TRAVL 75</a></div>',more:'Eighty-two keycaps in warm PBT, and exactly one in terracotta. Free shipping over $100.'})
 +'</div></div>'
 +'</div>'+hsHTML()+'<div class="wrap">'+cfgHTML()
 +'<section class="block"><div class="banner">'+im('v4','')+'<div class="in"><h2>Made for the late hours.</h2><p>Warm light, a quiet desk, and a board that feels the same at 2 a.m. as it does at 9.</p><div><a class="btn" href="story/">Scroll the full story</a></div></div></div></section>'
 +'<section class="block"><div style="display:flex;justify-content:space-between;align-items:end;gap:16px;flex-wrap:wrap;margin-bottom:32px"><div><p class="kicker">The shop</p><h2>Start with one key.</h2></div><a class="btn" href="#shop">View all</a></div><div class="cards">'+CAT.map(card).join('')+'</div></section></div>';

V.shop=()=>'<div class="wrap page"><p class="kicker">The shop</p><h1>Everything TRAVL.</h1><p class="lede" style="margin-top:16px">Free shipping on orders over $100, otherwise $9. Concept products: orders are simulated.</p><div class="cards" style="margin-top:40px">'+CAT.map(card).join('')+'</div></div>';

function pdp(p){
  const first=p.gallery[0];
  return '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#shop">Shop</a> / '+esc(p.name)+'</nav>'
  +'<div class="pdp"><div class="gal"><div class="main" id="galMain">'+im(first)+'</div>'
  +(p.gallery.length>1?'<div class="thumbs" role="group" aria-label="Product images">'+p.gallery.map((k,i)=>'<button type="button" data-act="thumb" data-k="'+k+'" aria-current="'+(i===0)+'" aria-label="Show image '+(i+1)+': '+esc(ALT[k])+'">'+im(k,'alt=""').replace(/alt="[^"]*"\s/,'')+'</button>').join('')+'</div>':'')
  +'</div>'
  +'<div class="buy"><div><h1 style="font-size:clamp(32px,4vw,48px)">'+esc(p.name)+'</h1><p class="price" style="margin-top:14px">'+money(p.price)+'</p></div>'
  +'<div class="prose">'+p.long.map(t=>'<p>'+esc(t)+'</p>').join('')+'</div>'
  +'<ul>'+p.bullets.map(b=>'<li>'+esc(b)+'</li>').join('')+'</ul>'
  +'<div class="buyrow"><div class="qty" role="group" aria-label="Quantity"><button type="button" data-act="pq" data-d="-1" aria-label="Decrease quantity">−</button><output id="pq" aria-live="polite">1</output><button type="button" data-act="pq" data-d="1" aria-label="Increase quantity">+</button></div>'
  +'<button class="btn key" type="button" data-act="add" data-id="'+p.id+'" data-useqty="1">Add to cart</button></div>'
  +'<button class="btn" type="button" data-act="add" data-id="'+p.id+'" data-useqty="1" data-then="checkout">Buy now</button>'
  +(p.id==='board'?'<p><a href="#home" data-act="gobuild">Customize layout, keycaps and cord</a></p>':'')
  +'<p class="notice">Concept product. Orders are simulated and nothing is charged or shipped. Free shipping over $100.</p></div></div>'
  +(p.feel?'<section class="block"><div class="split" style="align-items:start"><div style="display:flex;flex-direction:column;gap:16px"><div><p class="kicker">Feel the travel</p><h2>Press it before you buy it.</h2></div><div class="prose"><p>Drag the slider to press the switch. The counter reads real travel, and the label names the state.</p></div></div><div>'+stageHTML('pdpStage','',false)
    +'<div class="scrub-ctl"><label for="trv">Press the key</label><input id="trv" type="range" min="0" max="400" value="0" step="1"><output for="trv" id="trvOut">0.0 mm</output></div></div></div></section>':'')
  +'<section class="block"><h2 style="margin-bottom:24px">Specifications</h2><table class="spec"><tbody>'+p.specs.map(r=>'<tr><th scope="row">'+esc(r[0])+'</th><td>'+esc(r[1])+'</td></tr>').join('')+'</tbody></table></section>'
  +'<section class="block"><div style="margin-bottom:28px"><h2>You might also like</h2></div><div class="cards">'+CAT.filter(x=>x.id!==p.id).map(card).join('')+'</div></section></div>';
}

V.cart=()=>{
  const L=lines();
  if(!L.length)return '<div class="wrap page"><div class="empty"><h1>Your cart is empty.</h1><p class="lede">Start with the board, or press a few switches first.</p><div style="display:flex;gap:14px;flex-wrap:wrap"><a class="btn key" href="#p-board">Shop the TRAVL 75</a><a class="btn" href="#shop">Browse the shop</a></div></div></div>';
  const t=totals(),left=Math.max(0,10000-t.sub);
  return '<div class="wrap page"><h1 style="font-size:clamp(32px,4vw,48px)">Your cart</h1><div class="two"><div class="lines" role="list">'
   +L.map(l=>'<div class="line" role="listitem"><a href="#'+l.p.slug+'" tabindex="-1" aria-hidden="true">'+im(l.p.img,'').replace(/alt="[^"]*"/,'alt=""')+'</a>'
   +'<div class="meta"><a href="#'+l.p.slug+'">'+esc(l.p.name)+'</a>'+(l.p.variant?'<span class="muted" style="font-size:14px">'+esc(l.p.variant)+'</span>':'')+'<span class="muted mono">'+money(l.p.price)+' each</span>'
   +'<div class="ctl"><div class="qty" role="group" aria-label="Quantity for '+esc(l.p.name)+'"><button type="button" data-act="dec" data-id="'+l.p.id+'" aria-label="Decrease quantity of '+esc(l.p.name)+'">−</button><output aria-live="polite">'+l.qty+'</output><button type="button" data-act="inc" data-id="'+l.p.id+'" aria-label="Increase quantity of '+esc(l.p.name)+'">+</button></div>'
   +'<button class="link" type="button" data-act="rm" data-id="'+l.p.id+'">Remove</button></div></div>'
   +'<div class="tot">'+money(l.p.price*l.qty)+'</div></div>').join('')+'</div>'
   +'<aside class="summary" aria-label="Order summary"><h2 style="font-size:22px">Summary</h2>'
   +(left>0?'<div><p class="sec" style="font-size:14px;margin-bottom:8px">Add '+money(left)+' more for free shipping.</p><div class="progress" aria-hidden="true"><i style="width:'+Math.round(t.sub/100)+'%"></i></div></div>':'<p class="sec" style="font-size:14px">You’ve got free shipping.</p>')
   +'<dl><dt>Subtotal</dt><dd>'+money(t.sub)+'</dd><dt>Shipping</dt><dd>'+(t.ship?money(t.ship):'Free')+'</dd><dt>Estimated tax</dt><dd>'+money(t.tax)+'</dd></dl>'
   +'<dl class="total"><dt>Total</dt><dd>'+money(t.total)+'</dd></dl>'
   +'<a class="btn key" href="#checkout">Check out</a><p class="notice">Concept store: nothing is charged.</p></aside></div></div>';
};

let loginTab='in', loginNote='';
V.login=()=>{
  const s=loginTab==='up';
  return '<div class="wrap page"><div class="authbox"><h1 style="font-size:clamp(32px,4vw,48px)">'+(s?'Create your account':'Welcome back')+'</h1>'
   +(loginNote?'<p class="lede" style="margin-top:12px;font-size:17px">'+esc(loginNote)+'</p>':'')
   +'<div class="tabs" role="tablist" aria-label="Account"><button role="tab" type="button" data-act="tab" data-t="in" aria-selected="'+!s+'">Sign in</button><button role="tab" type="button" data-act="tab" data-t="up" aria-selected="'+s+'">Create account</button></div>'
   +'<form data-form="'+(s?'signup':'signin')+'" novalidate><div class="alert" role="alert" tabindex="-1" hidden></div>'
   +(s?field({name:'name',label:'Your name',auto:'name',req:1}):'')
   +field({name:'email',label:'Email',type:'email',auto:'email',req:1,ph:'name@example.com',inputmode:'email'})
   +field({name:'password',label:'Password',type:'password',auto:s?'new-password':'current-password',req:1,hint:s?'At least 8 characters.':''})
   +'<label class="check"><input type="checkbox" data-act="showpw"> Show password</label>'
   +'<button class="btn key" type="submit" style="width:100%">'+(s?'Create account':'Sign in')+'</button></form>'
   +(cartCount()?'<p style="margin-top:24px"><a href="#checkout">Continue as guest</a></p>':'')
   +'<p class="notice" style="margin-top:28px">Prototype: accounts are kept on this device (and mirrored to your Claude account when you’re signed in to it). There is no real authentication, so don’t reuse a real password.</p></div></div>';
};

V.checkout=()=>{
  const L=lines();
  if(!L.length)return V.cart();
  const t=totals(),a=acct(),sh=S.ship||{};
  return '<div class="wrap page"><h1 style="font-size:clamp(32px,4vw,48px)">Checkout</h1>'
   +(a?'<p class="sec" style="margin-top:10px">Signed in as '+esc(a.email)+'.</p>':'<p class="sec" style="margin-top:10px">Checking out as a guest. <a href="#login" data-act="signinfirst">Sign in</a> to use your saved details.</p>')
   +'<div class="two"><form data-form="checkout" novalidate><div class="alert" role="alert" tabindex="-1" hidden></div>'
   +'<fieldset class="set"><legend>Contact</legend>'+field({name:'email',label:'Email',type:'email',auto:'email',req:1,value:sh.email||(a?a.email:''),ph:'name@example.com',inputmode:'email'})+'</fieldset>'
   +'<fieldset class="set"><legend>Delivery</legend>'+field({name:'name',label:'Full name',auto:'name',req:1,value:sh.name||(a?a.name:'')})
   +field({name:'addr1',label:'Street address',auto:'address-line1',req:1,value:sh.addr1})+field({name:'addr2',label:'Apartment, suite, etc.',auto:'address-line2',value:sh.addr2})
   +'<div class="grid2">'+field({name:'city',label:'City',auto:'address-level2',req:1,value:sh.city})+field({name:'state',label:'State',auto:'address-level1',req:1,select:STATES,value:sh.state})+'</div>'
   +'<div class="grid2">'+field({name:'zip',label:'ZIP code',auto:'postal-code',req:1,inputmode:'numeric',max:5,value:sh.zip})+field({name:'phone',label:'Phone',type:'tel',auto:'tel',value:sh.phone,inputmode:'tel'})+'</div>'
   +'<p class="sec" style="font-size:14px">Concept shipping: United States only.</p></fieldset>'
   +'<fieldset class="set"><legend>Payment</legend><p class="notice" style="margin-bottom:18px">Concept payment: nothing is charged and card details are never saved. A test card is filled in. Please don’t enter a real card number.</p>'
   +field({name:'card',label:'Card number',auto:'off',req:1,inputmode:'numeric',value:'4242 4242 4242 4242',max:23})
   +'<div class="grid2">'+field({name:'exp',label:'Expiry (MM/YY)',auto:'off',req:1,inputmode:'numeric',value:'12/30',max:5})+field({name:'cvc',label:'CVC',auto:'off',req:1,inputmode:'numeric',value:'123',max:4})+'</div></fieldset>'
   +'<label class="check"><input type="checkbox" name="save" checked> Save these delivery details for next time</label>'
   +'<button class="btn key" type="submit" id="placeBtn" style="width:100%">Place order · '+money(t.total)+'</button></form>'
   +'<aside class="summary" aria-label="Order summary"><h2 style="font-size:22px">Your order</h2>'
   +L.map(l=>'<div style="display:grid;grid-template-columns:64px 1fr auto;gap:12px;align-items:center">'+im(l.p.img,'').replace(/alt="[^"]*"/,'alt=""').replace('<img','<img style="border-radius:8px;aspect-ratio:16/10;object-fit:cover"')+'<div style="font-size:15px"><strong>'+esc(l.p.name)+'</strong>'+(l.p.variant?'<br><span class="muted" style="font-size:13px">'+esc(l.p.variant)+'</span>':'')+'<br><span class="muted">Qty '+l.qty+'</span></div><span class="mono">'+money(l.p.price*l.qty)+'</span></div>').join('')
   +'<dl style="border-top:1px solid var(--border);padding-top:14px"><dt>Subtotal</dt><dd>'+money(t.sub)+'</dd><dt>Shipping</dt><dd>'+(t.ship?money(t.ship):'Free')+'</dd><dt>Estimated tax</dt><dd>'+money(t.tax)+'</dd></dl>'
   +'<dl class="total"><dt>Total</dt><dd>'+money(t.total)+'</dd></dl><a href="#cart" style="font-size:14px">Edit cart</a></aside></div></div>';
};

V.done=()=>{
  const o=S.orders.find(x=>x.id===S.lastOrder);
  if(!o)return V.shop();
  return '<div class="wrap page"><p class="kicker">Order placed</p><h1>Thanks, '+esc(o.ship.name.split(' ')[0])+'.</h1>'
   +'<p class="lede" style="margin-top:16px">Order <span class="mono" style="color:var(--fg)">'+esc(o.id)+'</span> is in. Nothing was charged, and nothing will ship: this is a concept store. We’d have emailed a receipt to '+esc(o.email)+'.</p>'
   +'<div class="done-key"><button class="btn key" id="doneKey" type="button">Press to celebrate</button><span class="big" id="doneRo" aria-hidden="true">0.0<small>mm</small></span></div>'
   +'<div class="two" style="margin-top:8px"><div>'+orderBody(o)+'</div><aside class="summary"><h2 style="font-size:20px">What’s next</h2>'
   +(acct()?'<p class="sec">Your order is in your account.</p><a class="btn" href="#account">View your orders</a>':'<p class="sec">Create an account with '+esc(o.email)+' to see this order again.</p><a class="btn" href="#login" data-act="signupfirst">Create account</a>')
   +'<a class="btn key" href="#shop">Keep shopping</a></aside></div></div>';
};
function orderBody(o){
  return '<div style="display:grid;gap:20px;color:var(--fg-2);font-size:15px"><div>'+o.items.map(i=>'<div style="display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-top:1px solid var(--border)"><span>'+esc(i.name)+(i.variant?' ('+esc(i.variant)+')':'')+' × '+i.qty+'</span><span class="mono">'+money(i.price*i.qty)+'</span></div>').join('')
   +'<div style="display:flex;justify-content:space-between;padding:10px 0;border-top:1px solid var(--border)"><span>Shipping</span><span class="mono">'+(o.totals.ship?money(o.totals.ship):'Free')+'</span></div>'
   +'<div style="display:flex;justify-content:space-between;padding:10px 0;border-top:1px solid var(--border)"><span>Estimated tax</span><span class="mono">'+money(o.totals.tax)+'</span></div>'
   +'<div style="display:flex;justify-content:space-between;padding:10px 0;border-top:1px solid var(--border-strong);color:var(--fg);font-weight:600"><span>Total</span><span class="mono">'+money(o.totals.total)+'</span></div></div>'
   +'<div><strong style="color:var(--fg)">Delivering to</strong><br>'+esc(o.ship.name)+'<br>'+esc(o.ship.addr1)+(o.ship.addr2?', '+esc(o.ship.addr2):'')+'<br>'+esc(o.ship.city)+', '+esc(o.ship.state)+' '+esc(o.ship.zip)+'</div>'
   +'<div><strong style="color:var(--fg)">Payment</strong><br>Test payment, not charged</div></div>';
}

let acctTab='orders';
V.account=()=>{
  const a=acct();
  if(!a)return V.login();
  const os=S.orders.filter(o=>o.email===a.email).sort((x,y)=>y.createdAt-x.createdAt);
  const orders=os.length?os.map(o=>'<details class="order"><summary><span class="mono">'+esc(o.id)+'</span><span>'+new Date(o.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})+'</span><span class="mono">'+money(o.totals.total)+'</span></summary><div class="body"><div>'+orderBody(o)+'</div><div><strong style="color:var(--fg)">Status</strong><br>'+esc(o.status)+'</div></div></details>').join('')
    :'<div class="empty" style="padding:24px 0"><p class="lede">No orders yet.</p><a class="btn key" href="#p-board">Shop the TRAVL 75</a></div>';
  const sh=S.ship||{};
  const prof='<form data-form="profile" novalidate style="max-width:460px"><div class="alert" role="alert" tabindex="-1" hidden></div>'
   +field({name:'name',label:'Your name',auto:'name',req:1,value:a.name})
   +'<div class="f"><label>Email</label><input value="'+esc(a.email)+'" disabled></div>'
   +'<p class="sec" style="font-size:14px;margin-bottom:16px">Saved delivery details: '+(sh.addr1?esc(sh.name+', '+sh.addr1+', '+sh.city+', '+sh.state+' '+sh.zip):'none yet. Check out with “Save these delivery details” ticked.')+'</p>'
   +'<button class="btn key" type="submit">Save name</button></form>'
   +'<div style="margin-top:48px;max-width:460px"><h3>Your data</h3><p class="sec" style="font-size:15px;margin:8px 0 16px">Everything lives in this browser'+(syncState==='synced'?' and your Claude account':'')+'. You can erase it at any time.</p><button class="btn" type="button" data-act="wipe">Delete all my data</button></div>';
  return '<div class="wrap page"><div style="display:flex;justify-content:space-between;align-items:end;flex-wrap:wrap;gap:16px"><div><p class="kicker">Account</p><h1 style="font-size:clamp(32px,4vw,48px)">Hi, '+esc(a.name.split(' ')[0])+'.</h1></div><button class="btn" type="button" data-act="signout">Sign out</button></div>'
   +'<div class="tabs" role="tablist"><button role="tab" type="button" data-act="atab" data-t="orders" aria-selected="'+(acctTab==='orders')+'">Orders</button><button role="tab" type="button" data-act="atab" data-t="profile" aria-selected="'+(acctTab==='profile')+'">Profile</button></div>'
   +(acctTab==='orders'?orders:prof)+'</div>';
};
