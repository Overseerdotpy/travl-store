/* ---------- form helpers ---------- */
function field(o){
  const id='f-'+o.name,hint=o.hint?'<span class="hint" id="h-'+o.name+'">'+o.hint+'</span>':'';
  const inner=o.select
    ?'<select id="'+id+'" name="'+o.name+'" autocomplete="'+(o.auto||'off')+'"'+(o.req?' required':'')+'><option value="">Select</option>'+o.select.map(s=>'<option'+(s===o.value?' selected':'')+'>'+s+'</option>').join('')+'</select>'
    :'<input id="'+id+'" name="'+o.name+'" type="'+(o.type||'text')+'" value="'+esc(o.value||'')+'" autocomplete="'+(o.auto||'off')+'"'+(o.inputmode?' inputmode="'+o.inputmode+'"':'')+(o.max?' maxlength="'+o.max+'"':'')+(o.ph?' placeholder="'+esc(o.ph)+'"':'')+(o.req?' required':'')+(o.hint?' aria-describedby="h-'+o.name+'"':'')+'>';
  return '<div class="f"><label for="'+id+'">'+o.label+(o.req?'':' <span class="muted">(optional)</span>')+'</label>'+inner+hint+'<span class="err" id="err-'+o.name+'"></span></div>';
}
function showErrors(form,errs){
  $$('[aria-invalid]',form).forEach(e=>{e.removeAttribute('aria-invalid');e.removeAttribute('aria-errormessage')});
  $$('.err',form).forEach(e=>e.textContent='');
  const keys=Object.keys(errs),al=$('.alert',form);
  keys.forEach(k=>{const inp=form.elements[k],sp=$('#err-'+k,form);if(inp){inp.setAttribute('aria-invalid','true');inp.setAttribute('aria-errormessage','err-'+k)}if(sp)sp.textContent=errs[k]});
  if(al){
    if(!keys.length){al.hidden=true;return}
    al.innerHTML='<strong>'+(keys.length===1?'One thing needs fixing':keys.length+' things need fixing')+'</strong><ul>'+keys.map(k=>'<li>'+esc(errs[k])+'</li>').join('')+'</ul>';
    al.hidden=false;al.focus();
  }
  const first=keys.length&&form.elements[keys[0]];if(first&&first.focus&&!al)first.focus();
}
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
async function hashPw(pw,salt){
  try{const d=new TextEncoder().encode(salt+':'+pw),h=await crypto.subtle.digest('SHA-256',d);return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('')}
  catch(e){let x=5381;const s=salt+pw;for(let i=0;i<s.length;i++)x=((x<<5)+x+s.charCodeAt(i))|0;return 'x'+(x>>>0).toString(16)}
}
const rnd=n=>{const a=new Uint8Array(n);try{crypto.getRandomValues(a)}catch(e){for(let i=0;i<n;i++)a[i]=Math.random()*256}return Array.from(a).map(b=>b.toString(16).padStart(2,'0')).join('')};
const orderId=()=>'TRVL-'+rnd(3).toUpperCase();
const luhn=n=>{let s=0,alt=false;for(let i=n.length-1;i>=0;i--){let d=+n[i];if(alt){d*=2;if(d>9)d-=9}s+=d;alt=!alt}return s%10===0};
const STATES='AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ');
