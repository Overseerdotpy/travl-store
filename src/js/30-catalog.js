/* ---------- catalog ---------- */
const CAT=[
 {id:'board',slug:'p-board',name:'TRAVL 75',price:24900,img:'intro',short:'A 75% keyboard in CNC aluminum, built around 4.0 mm of travel.',
  long:['82 keys in a 75% layout, in a CNC aluminum case finished in graphite, bead blasted, with a polished chamfer where the light catches.','A brushed brass plate underneath adds heft and steadies the board. Warm PBT keycaps, with one terracotta Esc.'],
  gallery:['intro','top','v2','v3','v4','v5'],feel:true,
  bullets:['4.0 mm of travel, registering at 2.0 mm','CNC aluminum case with a brass plate','One USB-C port, rubber feet, no wobble'],
  specs:[['Layout','75%, 82 keys'],['Travel','4.0 mm total, registers at 2.0 mm'],['Case','CNC aluminum in graphite, bead blasted, polished chamfer'],['Plate','Brushed brass'],['Keycaps','PBT, warm off-white with a terracotta Esc'],['Switch housing','Clear polycarbonate'],['Connection','One USB-C port'],['In the box','Keyboard and USB-C cable']]},
 {id:'tester',slug:'p-tester',name:'Travel tester',price:1800,img:'lift',short:'A plate of the clear switches, to feel 4.0 mm before you commit.',
  long:['The same clear switch as the board, on a small plate you can press as often as you like.','Watch the stem sink and the spring compress, and feel the click arrive at 2.0 mm.'],
  gallery:['lift','press'],feel:true,
  bullets:['Same switch as the TRAVL 75','Clear housing, so you can see the mechanism','Registers at 2.0 mm, bottoms out at 4.0 mm'],
  specs:[['Contents','Ten clear switches on a plate'],['Travel','4.0 mm total, registers at 2.0 mm'],['Switch housing','Clear polycarbonate']]},
 {id:'escape',slug:'p-escape',name:'Escape keycap',price:1200,img:'esc',short:'The terracotta Esc keycap, sold on its own.',
  long:['The one terracotta key on the board, and the only accent color in the brand.','Warm PBT, in the same finish as the rest of the keycaps.'],
  gallery:['esc'],feel:false,
  bullets:['PBT in terracotta','Matches the Esc on the TRAVL 75'],
  specs:[['Material','PBT'],['Color','Terracotta'],['Made for','The TRAVL 75']]}
];
const byId=id=>CAT.find(p=>p.id===id)||(typeof id==='string'&&id.indexOf('board~')===0?cfgItem.apply(null,id.split('~').slice(1)):null);
