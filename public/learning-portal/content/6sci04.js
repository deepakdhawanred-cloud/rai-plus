/* Rai Plus content pack: Class 6 Science (Curiosity), Chapter 4 – Exploring Magnets. Bilingual terms. */
RP.register({key:'6sci04',cls:'6',subject:'Science',ch:'4',title:"Exploring Magnets",color:'#a32d2d',
crumb:"Class 6 Science · Curiosity · चुंबकों की खोज",h1:"Chapter 4: Exploring Magnets",sub:"चुंबकों की खोज. What magnets attract, where their poles are, how they point north, and how to make and care for them.",heroLabel:"A bar magnet with iron filings and a compass",labName:'Magnet lab',
theme:"\n:root{--g:light-dark(#a32d2d,#f0a1a1);--g2:light-dark(#fbeded,#220c0c);--line:light-dark(#f0d0d0,#4a2323);--bg:light-dark(#ffffff,#130808);--card:light-dark(#ffffff,#1b0d0d);\n--ink:light-dark(#220c0c,#f6e4e4);--mute:light-dark(#6e4b4b,#cdaaaa);--y:light-dark(#185fa5,#85b7eb);--y2:light-dark(#e6f1fb,#0c1e33);--hd:#7a1f1f}\n",
labHTML:`  <h2>Magnet lab · चुंबक प्रयोगशाला</h2>
  <div class="ctrl"><label>Activity<select id="gMode"><option value="pole">Two magnets: attract or repel?</option><option value="mat">Magnetic or not?</option></select></label></div>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="gSvg" viewBox="0 0 460 300" role="img" aria-label="Magnet experiment" style="color:var(--ink)"></svg></div></div>
  <div><div id="gCtl"></div><div class="box y" id="gOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#a32d2d',LABNAME='Magnet lab',MIND_CENTER='Magnets · चुंबक';
const RD='#c0392b',BL='#2e6fb5',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const bar=(x,y,w,h,flip=false)=>`<rect x="${x}" y="${y}" width="${w/2}" height="${h}" fill="${flip?BL:RD}"/><rect x="${x+w/2}" y="${y}" width="${w/2}" height="${h}" fill="${flip?RD:BL}"/>`+T(x+w/4,y+h/2+5,flip?'S':'N','font-size="16" fill="#fff" font-weight="700"')+T(x+3*w/4,y+h/2+5,flip?'N':'S','font-size="16" fill="#fff" font-weight="700"');
function filings(x,y,w,h){let s='';for(let i=0;i<90;i++){const side=i%2?1:-1,t=Math.random()*0.5+0.1,ang=(Math.random()-0.5)*2.6,r=10+Math.random()*28;const cx=side>0?x+w:x,cy=y+h/2;const px=cx+side*r*Math.cos(ang),py=cy+r*Math.sin(ang);s+=`<line x1="${px}" y1="${py}" x2="${px+side*4*Math.cos(ang)}" y2="${py+4*Math.sin(ang)}" stroke="${GR}" stroke-width="1.5"/>`}for(let i=0;i<10;i++){const px=x+w*0.3+Math.random()*w*0.4;s+=`<line x1="${px}" y1="${y-6-Math.random()*4}" x2="${px+3}" y2="${y-6}" stroke="${GR}" stroke-width="1.2"/>`}return s}
const compass=(cx,cy,r,ang)=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fafaf6" stroke="${ink}" stroke-width="2"/><g transform="rotate(${ang} ${cx} ${cy})"><path d="M${cx} ${cy-r*0.8} L${cx+r*0.15} ${cy} L${cx-r*0.15} ${cy}Z" fill="${RD}"/><path d="M${cx} ${cy+r*0.8} L${cx+r*0.15} ${cy} L${cx-r*0.15} ${cy}Z" fill="${GR}"/></g>`+T(cx,cy-r-6,'N','font-size="12"');
function heroDraw(){return `<rect x="40" y="55" width="60" height="28" fill="#fff"/><rect x="100" y="55" width="60" height="28" fill="#fff" opacity=".6"/><circle cx="230" cy="70" r="30" fill="none" stroke="#fff" stroke-width="3"/><path d="M230 45 l6 25 h-12z" fill="#fff"/>`}
const HERO=heroDraw;
const MIND=[['Magnetic materials',100,50],['Poles',420,50],['Finding directions',90,150],['Attraction & repulsion',430,150],['Make a magnet',110,250],['Care of magnets',410,250]];

const C=[
{id:'m1',num:'4.1',title:'Magnetic and non-magnetic materials · चुंबकीय और अचुंबकीय पदार्थ',
 intro:'Bring a magnet near a coin, a pin, an eraser and a key. Which ones stick?',
 obj:'Classify materials as magnetic or non-magnetic.',
 prior:'Materials around us.',
 simple:'Materials attracted by a magnet are magnetic (चुंबकीय): iron, nickel, cobalt and things made of them (pins, nails, iron keys). Materials not attracted are non-magnetic (अचुंबकीय): plastic, wood, glass, rubber, paper, and many metals such as copper, aluminium, gold and silver.',
 detail:'Not all metals are magnetic. Steel (mostly iron) is magnetic, so steel pins stick; many coins and aluminium foil do not. Magnets can act without touching: a magnet can lift a paper clip out of a glass of water without getting wet, and can attract a pin through a thin sheet of paper or cardboard. Natural magnets, such as the rock magnetite (lodestone), were known long ago; today most magnets are artificial, in shapes like bar, horseshoe, ring and button magnets.',
 real:'Scrap dealers use magnets to separate iron from other metals.',
 apply:'Sort: iron nail, aluminium foil, steel spoon, plastic scale, copper wire, nickel coin.',
 see:{w:520,h:220,f:[
  ['A bar magnet.',bar(200,90,120,36)],
  ['Pins and nails (iron) are attracted.',`<line x1="196" y1="108" x2="160" y2="100" stroke="${GR}" stroke-width="3"/><line x1="196" y1="112" x2="160" y2="125" stroke="${GR}" stroke-width="3"/>`+lbl(130,160,'iron pins: magnetic')],
  ['Plastic, wood, glass, copper are not attracted.',`<rect x="380" y="150" width="40" height="20" fill="#7fb3d5"/><rect x="430" y="150" width="40" height="20" fill="#c9a27a"/>`+lbl(425,195,'non-magnetic')]]},
 seeNote:'Magnetic: iron, nickel, cobalt.',
 do:{title:'Magnet hunt',mat:'A magnet, 10 small objects',steps:['Predict which will stick.','Test each one.','Record in a table.'],obs:'Only iron/steel/nickel objects stick.',why:'Only some materials are magnetic.',lab:true},
 memo:'"Iron, Nickel, Cobalt: INC sticks."',
 miscon:['"All metals are attracted by magnets." Copper, aluminium, gold are not.','"Magnets need to touch to attract." They act from a distance.'],
 terms:['Magnet · चुंबक','Magnetic · चुंबकीय','Non-magnetic · अचुंबकीय','Magnetite / lodestone · मैग्नेटाइट'],
 q:{q:'Which is magnetic?',o:['copper wire','aluminium foil','iron nail','plastic scale'],a:2,why:'Iron.'},
 exam:'Classify materials: 1–2 marks.'},

{id:'m2',num:'4.2',title:'Poles of a magnet · चुंबक के ध्रुव',
 intro:'Roll a bar magnet in iron filings. Where do most filings stick?',
 obj:'Locate the poles of a magnet and state that poles always occur in pairs.',
 prior:'Magnetic materials (4.1).',
 simple:'The attraction of a magnet is strongest near its two ends. These ends are the poles (ध्रुव): the north pole (N) and the south pole (S). Iron filings cluster most at the poles and very few stick in the middle.',
 detail:'Poles always come in pairs. If you break a magnet into two pieces, each piece becomes a smaller magnet with its own north and south pole: you can never get a single pole alone. Poles may be marked N and S, or painted in two colours, or marked with a white dot on the north end.',
 real:'Fridge magnets and the magnetic catches on cupboard doors work using poles.',
 apply:'A magnet is broken in the middle. How many poles are there now?',
 see:{w:520,h:220,f:[
  ['A bar magnet in iron filings.',bar(190,95,140,34)],
  ['Most filings cling to the two ends: the poles.',filings(190,95,140,34)],
  ['Break it: each piece has its own N and S.',bar(130,170,90,26)+bar(300,170,90,26)+lbl(260,212,'poles always in pairs','font-weight="700"')]]},
 seeNote:'Filings show where the magnet is strongest.',
 do:{title:'Pin count',mat:'Bar magnet, a box of pins',steps:['Dip the middle and each end of the magnet into pins.','Count the pins held at each place.'],obs:'Ends hold many more pins.',why:'Poles are strongest.',lab:false},
 memo:'"Strong at the ends, weak in the middle; always N with S."',
 miscon:['"The middle of the magnet is strongest." The poles are strongest.','"Breaking a magnet separates N and S." Each piece gets both poles.'],
 terms:['Pole · ध्रुव','North pole · उत्तरी ध्रुव','South pole · दक्षिणी ध्रुव','Iron filings · लौह चूर्ण'],
 q:{q:'A magnet attracts most strongly at its:',o:['middle','poles','surface only','one end only'],a:1,why:'Both ends.'},
 exam:'Where are poles? What happens on breaking a magnet? 2 marks.'},

{id:'m3',num:'4.3',title:'Finding directions · दिशा ज्ञात करना',
 intro:'Hang a bar magnet from a thread and let it settle. Which way does it point?',
 obj:'Explain why a freely suspended magnet points north–south and how a compass works.',
 prior:'Poles (4.2).',
 simple:'A freely suspended bar magnet always comes to rest pointing north–south. The end that points north is its north-seeking (north) pole; the other end is the south pole. A magnetic compass (दिक्सूचक) has a small magnetised needle that turns freely and points north–south, so we can find directions.',
 detail:'The Earth behaves like a giant magnet, which is why freely moving magnets line up north–south. In a compass the north-pointing end of the needle is usually painted red; we rotate the dial until N on the dial lines up with that end, then read other directions. Sailors used magnets to navigate: ancient Indian sailors used a "matsya-yantra", a fish-shaped piece of magnetised iron floating in oil. You can make a compass by stroking a sewing needle with a magnet, pushing it through a cork and floating it in water.',
 real:'Hikers, sailors and pilots carry compasses as backups to GPS.',
 apply:'You face the rising Sun. Which direction does the red end of your compass needle point?',
 see:{w:520,h:220,f:[
  ['A freely hanging magnet settles north–south.',`<line x1="130" y1="10" x2="130" y2="90" stroke="${ink}"/>`+bar(70,90,120,28)+lbl(60,160,'N ←','font-size="13"')+lbl(205,160,'→ S','font-size="13"')],
  ['A compass needle does the same.',compass(360,110,60,0)],
  ['Make one: stroke a needle with a magnet, float it on a cork.',lbl(360,205,'needle + cork + water = compass','font-size="12"')]]},
 seeNote:'The Earth acts like a giant magnet.',
 do:{title:'Floating compass',mat:'Sewing needle, bar magnet, cork slice, bowl of water',steps:['Stroke the needle 30 times in one direction with one pole of the magnet.','Push it through the cork; float it in water.','Compare with a real compass.'],obs:'The needle turns to point north–south.',why:'It has become a magnet.',lab:true},
 memo:'"Free to turn, it points north."',
 miscon:['"A compass points to the North Pole of the Earth exactly." It points along the Earth\'s magnetic north–south.','"Any needle works as a compass." It must be magnetised.'],
 terms:['Compass · दिक्सूचक','North-seeking pole','Freely suspended · स्वतंत्र रूप से लटका','Matsya-yantra'],
 q:{q:'A freely suspended magnet always points:',o:['east–west','north–south','up–down','towards iron only'],a:1,why:'Earth\'s magnetism.'},
 exam:'How does a compass work? 2 marks.'},

{id:'m4',num:'4.4',title:'Attraction and repulsion · आकर्षण और प्रतिकर्षण',
 intro:'Push two magnets together end to end. Sometimes they snap together; sometimes they push apart. Why?',
 obj:'State that unlike poles attract and like poles repel, and use repulsion to identify a magnet.',
 prior:'Poles (4.2).',
 simple:'Unlike poles (N and S) attract (आकर्षण) each other. Like poles (N and N, or S and S) repel (प्रतिकर्षण) each other. Repulsion is the sure test for a magnet: an iron bar is attracted by both poles of a magnet, but only another magnet can be repelled.',
 detail:'Activity: put one bar magnet on a few round pencils so it can roll; bring a pole of another magnet near its pole. It rolls towards the magnet (attraction) or away (repulsion). Magnetic toys, maglev trains and magnetic mazes use attraction and repulsion. Magnets can act through paper, cloth, wood and water.',
 real:'Maglev trains float above their tracks using magnetic repulsion, so there is almost no friction.',
 apply:'You have two identical bars, one a magnet, one plain iron. How can you tell which is which using only the two bars?',
 see:{w:520,h:220,f:[
  ['N facing S: they attract.',bar(40,60,110,30)+bar(170,60,110,30)+lbl(160,50,'→ ←','font-size="14" fill="'+RD+'"')+lbl(160,115,'attract')],
  ['N facing N: they repel.',bar(40,150,110,30)+bar(190,150,110,30,true)+lbl(170,140,'← →','font-size="14" fill="'+BL+'"')+lbl(170,205,'repel')],
  ['Only a magnet can be repelled.',lbl(410,120,'repulsion = sure test','font-weight="700"')]]},
 seeNote:'Like poles repel; unlike poles attract.',
 do:{title:'Rolling magnet',mat:'Two bar magnets, 4 round pencils',steps:['Place one magnet on the pencils.','Bring N of the other magnet near N, then near S.'],obs:'It rolls away from N and towards S.',why:'Like repel, unlike attract.',lab:true},
 memo:'"Opposites attract, likes push back."',
 miscon:['"Attraction proves something is a magnet." Iron is attracted too; only repulsion proves it.'],
 terms:['Attraction · आकर्षण','Repulsion · प्रतिकर्षण','Like poles · समान ध्रुव','Unlike poles · असमान ध्रुव','Maglev'],
 q:{q:'Two north poles placed near each other will:',o:['attract','repel','do nothing','stick together'],a:1,why:'Like poles repel.'},
 exam:'Like/unlike poles; test for a magnet: 2 marks.'},

{id:'m5',num:'4.5',title:'Caring for magnets · चुंबकों की देखभाल',
 intro:'Why do old magnets sometimes become weak?',
 obj:'List ways magnets lose their magnetism and how to store them.',
 prior:'Magnets (4.1–4.4).',
 simple:'Magnets lose their magnetism if they are heated, dropped from a height or hammered. Store bar magnets in pairs with unlike poles on the same side, separated by a piece of wood, with two pieces of soft iron (keepers) placed across their ends. Keep magnets away from mobile phones, TVs, computers, CDs and debit cards.',
 detail:'For a horseshoe magnet, put a piece of iron across its poles when storing. Permanent magnets keep their magnetism for a long time if cared for; temporary magnets (like the magnetised needle) lose it more quickly.',
 real:'Magnetic strips on bank cards can be damaged if kept next to strong magnets.',
 apply:'Draw how you would store two bar magnets.',
 see:{w:520,h:220,f:[
  ['Two magnets with unlike poles on the same side, wood between.',bar(150,60,200,26)+`<rect x="150" y="90" width="200" height="20" fill="#c9a27a"/>`+bar(150,114,200,26,true)],
  ['Soft iron keepers across the ends.',`<rect x="138" y="56" width="10" height="88" fill="${GR}"/><rect x="352" y="56" width="10" height="88" fill="${GR}"/>`+lbl(250,175,'keepers · रक्षक')],
  ['Do not heat, drop or hammer magnets.',lbl(250,210,'no heat · no dropping · no hammering','font-weight="700"')]]},
 seeNote:'Correct storage keeps magnets strong.',
 do:{title:'Drop test (old magnet only)',mat:'An old weak magnet, pins',steps:['Count pins it lifts.','Drop it a few times on a hard floor (teacher demo).','Count again.'],obs:'It lifts fewer pins.',why:'Rough handling weakens magnets.',lab:false},
 memo:'"Pair, wood, keepers; no heat, no knocks."',
 miscon:['"Magnets last forever whatever we do." Heat and shocks weaken them.'],
 terms:['Keeper · रक्षक','Permanent magnet · स्थायी चुंबक','Temporary magnet · अस्थायी चुंबक'],
 q:{q:'A magnet loses its magnetism if it is:',o:['kept with keepers','heated or dropped','kept in a box','painted'],a:1,why:'Heat and shocks.'},
 exam:'How to store magnets: 2 marks.'}
];

const CARDS=[['Magnetic','Iron, nickel, cobalt (and steel).'],['Non-magnetic','Plastic, wood, glass, copper, aluminium.'],['Poles','N and S; strongest at the ends; always in pairs.'],['Freely suspended magnet','Points north–south.'],['Compass · दिक्सूचक','Magnetised needle shows directions.'],['Like poles','Repel.'],['Unlike poles','Attract.'],['Sure test','Repulsion.'],['Make a magnet','Stroke a needle in one direction with one pole.'],['Care','Store in pairs with keepers; avoid heat, drops, hammering.'],['Lodestone','Natural magnet (magnetite).']];

const Q=[
 {lv:1,q:'Which is attracted by a magnet?',o:['wood','iron','plastic','glass'],a:1,w:'Iron is magnetic.'},
 {lv:1,q:'The poles of a magnet are at its:',o:['middle','ends','sides','surface'],a:1,w:'Strongest at the ends.'},
 {lv:1,q:'Unlike poles:',o:['repel','attract','do nothing','melt'],a:1,w:'N–S attract.'},
 {lv:2,q:'A freely suspended magnet points:',o:['east–west','north–south','up–down','randomly'],a:1,w:'Earth\'s magnetism.'},
 {lv:2,q:'If a bar magnet is broken into two, each piece has:',o:['one pole','two poles (N and S)','no poles','only N'],a:1,w:'Poles come in pairs.'},
 {lv:2,q:'Which is a natural magnet?',o:['magnetite','copper','aluminium','plastic'],a:0,w:'Lodestone.'},
 {lv:3,q:'The sure test for a magnet is:',o:['attraction','repulsion','its colour','its weight'],a:1,w:'Only magnets repel.'},
 {lv:3,q:'Which will weaken a magnet?',o:['storing with keepers','heating it','keeping in a box','labelling poles'],a:1,w:'Heat disturbs magnetism.'},
 {lv:4,q:'One end of magnet A attracts BOTH ends of bar B. Bar B is:',o:['a magnet','an iron bar, not a magnet','plastic','copper'],a:1,w:'A magnet would repel at one end; B is magnetic material but not a magnet.'},
 {lv:4,q:'A compass is placed near a bar magnet. The needle points:',o:['north always','along the magnet\'s field, towards its poles','east','nowhere'],a:1,w:'A nearby magnet affects the needle.'},
 {lv:5,open:true,m:3,q:'How can you make a simple compass at home?',ans:['Stroke a sewing needle many times in one direction with one pole of a magnet (1)','Push it through a cork piece; float in a bowl of water (1)','It turns to point north–south (1)']},
 {lv:5,open:true,m:3,q:'How should bar magnets be stored? Why?',ans:['In pairs, unlike poles on the same side (1)','Wood between them; soft iron keepers across the ends (1)','Keeps them from losing magnetism (1)']}
];

const ONEMIN=['Magnetic: iron, nickel, cobalt; non-magnetic: plastic, wood, glass, copper.','Poles at the ends; N and S always together.','Freely suspended magnet → north–south; compass.','Like poles repel; unlike poles attract.','Repulsion is the sure test for a magnet.','Magnetise a needle by stroking; float on cork = compass.','Store in pairs with keepers; avoid heat and knocks.'];
const KEYS=[['magnetic materials',/iron|nickel|cobalt|magnetic/i],['poles',/pole|ध्रुव/i],['north–south',/north|south|उत्तर/i],['compass',/compass|दिक्सूचक/i],['attract',/attract|आकर्षण/i],['repel',/repel|प्रतिकर्षण/i],['make a magnet',/stroke|magneti[sz]e/i],['care',/keeper|heat|drop/i]];

/* ---------- lab ---------- */
let mode='pole',flip=false,gap=120;
const MAT=[['Iron nail',1,'#8a8a8a'],['Steel pin',1,'#a0a0a0'],['Nickel strip',1,'#b0b0a0'],['Copper wire',0,'#c87533'],['Aluminium foil',0,'#d0d0d8'],['Plastic scale',0,'#7fb3d5'],['Wooden block',0,'#c9a27a'],['Glass marble',0,'#bde0f0'],['Rubber eraser',0,'#e8a0a0']];let mi=0;
function drawPole(){const repel=flip;const g=repel?Math.min(200,gap+40):Math.max(4,gap-60);let s=bar(30,120,160,40)+bar(30+160+g,120,160,40,flip);
 s+=T(230,90,repel?'← like poles: REPEL →':'→ unlike poles: ATTRACT ←','font-size="15" font-weight="700" fill="'+(repel?BL:RD)+'"');
 $('#gSvg').innerHTML=s;$('#gOut').innerHTML=`<p>Left magnet: N … S. Right magnet faces it with its <b>${flip?'S':'N'}</b> pole.</p><p>Facing poles: <b>S and ${flip?'S':'N'}</b> → ${repel?'<b>repel</b> (like poles)':'<b>attract</b> (unlike poles)'}.</p>`}
function drawMat(){const [n,m,c]=MAT[mi];let s=bar(60,130,140,36);const x=m?218:330;s+=`<rect x="${x}" y="134" width="70" height="28" rx="6" fill="${c}" stroke="${ink}"/>`+T(x+35,190,n,'font-size="13"');if(m)s+=`<path d="M205 148 h12" stroke="${RD}" stroke-width="3"/>`;
 $('#gSvg').innerHTML=s;$('#gOut').innerHTML=`<p><b>${n}</b>: ${m?'pulled to the magnet — <b>magnetic</b> (चुंबकीय).':'not attracted — <b>non-magnetic</b> (अचुंबकीय).'}</p>`}
function ctl(){return mode==='pole'?`<div class="ctrl"><button class="btn" id="gFlip">Turn the right magnet round</button></div>`:`<div class="ctrl"><label>Object<select id="gMat">${MAT.map((m,i)=>`<option value="${i}" ${i===mi?'selected':''}>${m[0]}</option>`).join('')}</select></label></div>`}
function labShow(){$('#gCtl').innerHTML=ctl();mode==='pole'?drawPole():drawMat()}
function labInit(){}
function labClick(b){if(b.id==='gFlip'){flip=!flip;drawPole();return true}return false}
function labChange(t){if(t.id==='gMode'){mode=t.value;labShow();return true}if(t.id==='gMat'){mi=+t.value;drawMat();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
