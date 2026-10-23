/* ---------- cart math ---------- */
const lines=()=>S.cart.map(l=>({p:byId(l.id),qty:l.qty})).filter(l=>l.p);
const cartCount=()=>S.cart.reduce((n,l)=>n+l.qty,0);
function totals(){
  const sub=lines().reduce((n,l)=>n+l.p.price*l.qty,0), ship=sub===0?0:sub>=10000?0:900, tax=Math.round(sub*.0825);
  return {sub,ship,tax,total:sub+ship+tax};
}
function addToCart(id,qty){
  const l=S.cart.find(x=>x.id===id);if(l)l.qty=Math.min(10,l.qty+qty);else S.cart.push({id,qty:Math.min(10,qty)});
  persist();chrome();
}
const acct=()=>S.accounts.find(a=>a.email===S.session)||null;
