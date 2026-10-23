/* ---------- chrome + toast ---------- */
let toastT=0;
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2400)}
function chrome(){
  const n=cartCount(),c=$('#cartCount');c.textContent=n;c.dataset.n=n;c.parentElement.setAttribute('aria-label','Cart, '+n+(n===1?' item':' items'));
  const a=acct(),l=$('#acct');l.textContent=a?a.name.split(' ')[0]:'Sign in';l.setAttribute('href',a?'#account':'#login');const fa=$('#hfAcct');if(fa)fa.setAttribute('href',a?'#account':'#login');
  const r=route();$$('[data-nav]').forEach(e=>{const k=e.dataset.nav;const on=(k==='shop'&&(r==='shop'||r.indexOf('p-')===0))||(k==='cart'&&(r==='cart'||r==='checkout'))||(k==='account'&&(r==='account'||r==='login'));on?e.setAttribute('aria-current','page'):e.removeAttribute('aria-current')});
}
