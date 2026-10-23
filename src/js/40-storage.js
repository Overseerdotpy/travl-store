/* ---------- state + storage ---------- */
const KEY='travl.store.v1';
const blank=()=>({v:1,updatedAt:0,accounts:[],session:null,cart:[],orders:[],ship:{},lastOrder:null});
let S=load(), memOnly=false;
function load(){try{const r=localStorage.getItem(KEY);if(r)return Object.assign(blank(),JSON.parse(r))}catch(e){}return blank()}
function persist(){S.updatedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){memOnly=true}queueSync();syncText()}

/* db mirror: only runs for signed-in Claude viewers who can write; everyone else keeps the local copy */
let dbRef=null, syncState='local', syncTimer=0, pushing=false, again=false;
async function connect(){
  try{
    if(!window.claude||!window.claude.use)return;
    const user=await window.claude.use('user'), db=await window.claude.use('db');
    if(!user||!db)return;
    const id=await user.id(); if(!id)return;
    dbRef=db.doc('data/users/'+id+'/travl');
    const snap=await dbRef.get(), r=snap.exists?snap.data():null;
    if(r&&r.state&&r.updatedAt>S.updatedAt){S=Object.assign(blank(),r.state);try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}syncState='synced';render(true)}
    else if(S.updatedAt>0){await push()}
    else syncState='synced';
    syncText();
  }catch(e){dbRef=null;syncState='local';syncText()}
}
async function push(){
  if(!dbRef)return; if(pushing){again=true;return} pushing=true;
  try{await dbRef.set({state:JSON.parse(JSON.stringify(S)),updatedAt:S.updatedAt});syncState='synced'}
  catch(e){dbRef=null;syncState='local'}
  pushing=false; syncText(); if(again){again=false;queueSync()}
}
function queueSync(){if(!dbRef)return;clearTimeout(syncTimer);syncTimer=setTimeout(push,700)}
function syncText(){const el=$('#syncStatus');if(!el)return;el.textContent=memOnly?'Storage is blocked in this browser, so your cart resets when you leave.':syncState==='synced'?'Saved on this device and synced to your Claude account.':'Saved on this device only.'}
