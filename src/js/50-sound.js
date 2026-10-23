/* ---------- sound (opt in, synthesized) ---------- */
let ac=null, soundOn=false;
try{soundOn=localStorage.getItem('travl.sound')==='1'}catch(e){}
function click(){
  if(!soundOn)return;
  try{
    ac=ac||new (window.AudioContext||window.webkitAudioContext)(); if(ac.state==='suspended')ac.resume();
    const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
    o.type='triangle';o.frequency.setValueAtTime(210,t);o.frequency.exponentialRampToValueAtTime(68,t+.05);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.5,t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+.1);
    o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.11);
    const n=Math.floor(ac.sampleRate*.03),nb=ac.createBuffer(1,n,ac.sampleRate),d=nb.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);
    const ns=ac.createBufferSource();ns.buffer=nb;const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=2900;bp.Q.value=.8;
    const ng=ac.createGain();ng.gain.value=.38;ns.connect(bp);bp.connect(ng);ng.connect(ac.destination);ns.start(t);
  }catch(e){}
}
function sndLabel(){const b=$('#snd');b.textContent=soundOn?'Sound on':'Sound off';b.setAttribute('aria-pressed',String(soundOn))}
