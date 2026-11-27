/* Rai Plus content pack: Class 7 Science (Curiosity), Chapter 10 – Life Processes in Plants. Bilingual terms. */
RP.register({key:'7sci10',cls:'7',subject:'Science',ch:'10',title:"Life Processes in Plants",color:'#3b7d1a',
crumb:"Class 7 Science · Curiosity · पादपों में जैव प्रक्रम",h1:"Chapter 10: Life Processes in Plants",sub:"पादपों में जैव प्रक्रम. Photosynthesis, the starch test, stomata, respiration in plants, transport of water and food, and transpiration.",heroLabel:"A leaf in sunlight releasing oxygen bubbles",labName:'Photosynthesis lab',
theme:"\n:root{--g:light-dark(#3b7d1a,#a8d77d);--g2:light-dark(#eef6e4,#0f1a07);--line:light-dark(#d4e7bf,#2c4219);--bg:light-dark(#ffffff,#0b1206);--card:light-dark(#ffffff,#111a0a);\n--ink:light-dark(#162508,#e6f1da);--mute:light-dark(#4f6439,#b5c9a0);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#2b5c10}\n",
labHTML:`  <h2>Photosynthesis lab · प्रकाश संश्लेषण प्रयोगशाला</h2>
  <p><b>Bubble counter:</b> a water plant (Hydrilla) gives off oxygen bubbles. Change light, carbon dioxide and temperature, and count bubbles per minute. <b>Starch test:</b> cover part of a leaf and test it with iodine.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="fSvg" viewBox="0 0 460 320" role="img" aria-label="Water plant giving bubbles" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="fMode"><option value="bub">Bubble counter</option><option value="starch">Starch test with a covered leaf</option></select></label></div>
  <div class="ctrl"><label>Lamp distance: <b id="fLv"></b><input type="range" class="fS" id="fL" min="10" max="100" step="10" value="30"></label></div>
  <div class="ctrl"><label>Baking soda (CO₂) in water<select id="fC"><option value="0">None</option><option value="1" selected>A pinch</option><option value="2">A spoonful</option></select></label></div>
  <div class="ctrl"><label>Water temperature<select id="fT"><option value="5">Cold (5 °C)</option><option value="25" selected>Room (25 °C)</option><option value="45">Hot (45 °C)</option></select></label></div>
  <div class="ctrl" style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn" data-s="dark">1. Keep plant in dark 2 days</button><button class="btn" data-s="cover">2. Cover part of a leaf</button><button class="btn" data-s="sun">3. Keep in sunlight 6 h</button><button class="btn" data-s="test">4. Boil in alcohol, add iodine</button><button class="btn" id="fSR">Restart</button></div>
  <div class="box y" id="fOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3b7d1a',LABNAME='Photosynthesis lab',MIND_CENTER='Plant life processes · पादप जैव प्रक्रम';
const GN='#3b7d1a',LG='#8fc15a',BL='#2f6f8a',LB='#a9cfee',YE='#f2b632',OR='#b04a1f',BR='#7a5a3a',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const arr=(x1,y1,x2,y2,c=OR,w=2)=>{const a=Math.atan2(y2-y1,x2-x1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/><path d="M${x2} ${y2} l${(-9*Math.cos(a-0.45)).toFixed(1)} ${(-9*Math.sin(a-0.45)).toFixed(1)} M${x2} ${y2} l${(-9*Math.cos(a+0.45)).toFixed(1)} ${(-9*Math.sin(a+0.45)).toFixed(1)}" stroke="${c}" stroke-width="${w}"/>`};
const sun=(x,y,r=20)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${YE}"/>`+[...Array(8)].map((_,k)=>{const a=k*Math.PI/4;return `<line x1="${x+(r+3)*Math.cos(a)}" y1="${y+(r+3)*Math.sin(a)}" x2="${x+(r+10)*Math.cos(a)}" y2="${y+(r+10)*Math.sin(a)}" stroke="${YE}" stroke-width="3"/>`}).join('');
const leaf=(cx,cy,w,h,c=GN,rot=0)=>`<path d="M${cx-w/2} ${cy} Q${cx} ${cy-h} ${cx+w/2} ${cy} Q${cx} ${cy+h} ${cx-w/2} ${cy}z" fill="${c}" transform="rotate(${rot} ${cx} ${cy})"/><line x1="${cx-w/2}" y1="${cy}" x2="${cx+w/2}" y2="${cy}" stroke="#2a5a10" transform="rotate(${rot} ${cx} ${cy})"/>`;
function heroDraw(){return sun(50,40,16).replace(/#f2b632/g,'#fff')+leaf(180,80,140,50,'#fff')+[0,1,2].map(k=>`<circle cx="${280+k*14}" cy="${70-k*16}" r="${4+k}" fill="none" stroke="#fff" stroke-width="2"/>`).join('')}
const HERO=heroDraw;
const MIND=[['Photosynthesis',100,50],['Starch test',420,50],['Stomata',90,150],['Respiration in plants',430,150],['Transport: xylem & phloem',110,250],['Transpiration',410,250]];

const C=[
{id:'f1',num:'10.1',title:'Photosynthesis · प्रकाश संश्लेषण',
 intro:'A tiny seed becomes a huge mango tree. Where does all that material come from?',
 obj:'Describe photosynthesis and what it needs.',
 prior:'Class 6: plants, leaves; Ch 9 (respiration).',
 simple:'Green plants make their own food by photosynthesis (प्रकाश संश्लेषण). In the leaves, the green pigment chlorophyll (पर्णहरित) captures sunlight. Using this energy, the plant combines carbon dioxide (from air) and water (from soil) to make glucose (a sugar) and releases oxygen. Carbon dioxide + water —(sunlight, chlorophyll)→ glucose + oxygen.',
 detail:'Glucose is changed into starch and stored. Plants are called producers (autotrophs, स्वपोषी) because they make food; animals that eat plants or other animals are consumers (heterotrophs, विषमपोषी). Almost all food chains begin with photosynthesis. The oxygen we breathe comes from photosynthesis.',
 real:'A single large tree releases enough oxygen in a year for several people.',
 apply:'Name the four things a leaf needs for photosynthesis.',
 see:{w:520,h:230,f:[
  ['Sunlight falls on a green leaf.',sun(60,50)+leaf(260,130,220,70)+arr(85,70,170,110,YE,2.5)],
  ['CO₂ in from air; water up from roots.',arr(150,200,210,150,GR)+lbl(130,215,'CO₂')+arr(380,220,320,160,BL)+lbl(400,230,'water · जल')],
  ['Glucose made; oxygen released.',arr(300,100,360,40,GN)+lbl(390,35,'O₂','font-weight="700"')+lbl(260,135,'glucose → starch','fill="#fff" font-weight="700"')]]},
 seeNote:'Sunlight + chlorophyll + CO₂ + water.',
 do:{title:'Leaf colours',mat:'Leaves of different plants',steps:['Collect green and non-green (e.g. croton) leaves.','Note where the green colour is.'],obs:'Green parts have chlorophyll.',why:'Chlorophyll needed.',lab:false},
 memo:'"Sun + CO₂ + water + green → sugar + O₂."',
 miscon:['"Plants get their food from the soil." Soil gives water and minerals; food is made in leaves.'],
 terms:['Photosynthesis · प्रकाश संश्लेषण','Chlorophyll · पर्णहरित','Glucose','Producer / autotroph · स्वपोषी'],
 q:{q:'Gas released in photosynthesis:',o:['carbon dioxide','oxygen','nitrogen','hydrogen'],a:1,why:'O₂.'},
 exam:'Word equation of photosynthesis: 2 marks.'},

{id:'f2',num:'10.2',title:'Testing a leaf for starch · स्टार्च परीक्षण',
 intro:'How can we prove a leaf made food in sunlight?',
 obj:'Perform the starch test and show that light is needed.',
 prior:'10.1; Ch 9 (iodine test).',
 simple:'Iodine turns starch blue-black. To test a leaf: boil it in water (to soften), then in alcohol in a water bath (to remove chlorophyll — done by the teacher; alcohol catches fire easily), rinse, and add iodine. Parts that made starch turn blue-black.',
 detail:'Experiment for light: keep a potted plant in the dark for 2 days (destarching). Cover part of a leaf with black paper on both sides. Keep the plant in sunlight for a few hours. Test the leaf: the uncovered part turns blue-black; the covered part does not — light is needed for photosynthesis. Similar experiments with variegated leaves show chlorophyll is needed.',
 real:'Rice, wheat and potato are full of starch made by photosynthesis.',
 apply:'Why is the plant kept in the dark before the experiment?',
 see:{w:520,h:220,f:[
  ['A leaf with a black paper strip.',leaf(260,110,280,80)+`<rect x="220" y="60" width="50" height="100" fill="#222"/>`],
  ['Remove chlorophyll; add iodine.',leaf(260,110,280,80,'#f4ecc8')],
  ['Uncovered parts: blue-black (starch). Covered strip: no starch.',leaf(260,110,280,80,'#2a2a5a')+`<rect x="220" y="60" width="50" height="100" fill="#f4ecc8"/>`+lbl(260,200,'light is needed','font-weight="700"')]]},
 seeNote:'Blue-black = starch present.',
 do:{title:'Iodine on food',mat:'Potato slice, rice, dilute iodine',steps:['Add a drop of iodine to each.'],obs:'Blue-black.',why:'Starch stored from photosynthesis.',lab:true},
 memo:'"Iodine + starch = blue-black."',
 miscon:['"Leaves are boiled to kill germs." Boiling softens; alcohol removes chlorophyll.'],
 terms:['Starch · मंड','Iodine test','Destarching','Variegated leaf'],
 q:{q:'Iodine turns starch:',o:['red','blue-black','yellow','green'],a:1,why:'Starch test.'},
 exam:'Experiment: light is necessary for photosynthesis: 4 marks.'},

{id:'f3',num:'10.3',title:'Stomata: tiny doors in leaves · रंध्र',
 intro:'How does carbon dioxide get inside a leaf?',
 obj:'Describe stomata and their role in gas exchange.',
 prior:'10.1.',
 simple:'Leaves have tiny pores called stomata (रंध्र; singular stoma), mostly on the lower surface. Each stoma is surrounded by two guard cells (द्वार कोशिकाएँ) that open and close it. Carbon dioxide enters and oxygen leaves through stomata; water vapour also escapes through them.',
 detail:'You can see stomata by peeling the thin lower skin of a leaf (e.g. Tradescantia or Rhoeo) and viewing it under a microscope. Stomata usually close at night or when the plant is short of water, reducing water loss.',
 real:'Leaves of desert plants have fewer stomata, often sunken, to save water.',
 apply:'Why are most stomata on the lower surface of leaves?',
 see:{w:520,h:220,f:[
  ['Leaf peel under a microscope.',`<circle cx="260" cy="110" r="95" fill="#e8f4dc" stroke="${ink}"/>`+[0,1,2,3,4,5].map(k=>`<path d="M${170+(k%3)*60} ${60+Math.floor(k/3)*50+ (k%2)*20} h40" stroke="${GR}" stroke-width=".6"/>`).join('')],
  ['Guard cells around a pore.',`<path d="M230 110 q30 -30 60 0 q-30 -10 -60 0z" fill="${GN}"/><path d="M230 110 q30 30 60 0 q-30 10 -60 0z" fill="${GN}"/>`+lbl(260,150,'stoma · रंध्र')],
  ['CO₂ in, O₂ and water vapour out.',arr(180,60,240,100,GR)+lbl(165,52,'CO₂ in')+arr(285,100,345,60,GN)+lbl(370,52,'O₂, H₂O out')]]},
 seeNote:'Guard cells open and close stomata.',
 do:{title:'Leaf peel',mat:'Rhoeo leaf, slide, microscope (school lab)',steps:['Peel the lower surface skin.','View with water on a slide.'],obs:'Stomata with guard cells.',why:'Gas exchange pores.',lab:false},
 memo:'"Stomata: the leaf\'s doors."',
 miscon:['"Stomata are always open." They close at night and in water shortage.'],
 terms:['Stomata · रंध्र','Guard cells · द्वार कोशिकाएँ','Gas exchange'],
 q:{q:'Stomata are controlled by:',o:['root hairs','guard cells','xylem','flowers'],a:1,why:'Guard cells.'},
 exam:'Role of stomata: 2 marks.'},

{id:'f4',num:'10.4',title:'Respiration in plants · पादपों में श्वसन',
 intro:'Do plants breathe at night?',
 obj:'Show that plants respire all the time, releasing carbon dioxide.',
 prior:'Ch 9 (respiration); 10.1.',
 simple:'Like animals, plants respire day and night: glucose + oxygen → carbon dioxide + water + energy. Leaves take in oxygen through stomata; roots take oxygen from air between soil particles. In daylight, photosynthesis is usually faster than respiration, so plants give out more oxygen than they use. At night only respiration happens.',
 detail:'Experiment: germinating seeds in a closed flask with a small tube of lime water — the lime water turns milky, showing CO₂ is released. Overwatering fills soil air spaces and roots cannot get oxygen; plants may wilt. That is why pots have drainage holes.',
 real:'Potted plants die when overwatered — roots cannot respire.',
 apply:'Why do flower pots have a hole at the bottom?',
 see:{w:520,h:220,f:[
  ['Germinating seeds in a closed flask.',`<path d="M200 40 h40 v40 l50 100 h-140 l50 -100z" fill="#fff" stroke="${ink}" stroke-width="2"/>`+[0,1,2,3,4].map(k=>`<ellipse cx="${180+k*20}" cy="170" rx="8" ry="5" fill="${BR}"/>`).join('')],
  ['A small tube of lime water inside.',`<rect x="214" y="110" width="12" height="50" fill="#eef" stroke="${ink}"/>`],
  ['Lime water turns milky: CO₂ released.',`<rect x="214" y="125" width="12" height="35" fill="#ddd"/>`+lbl(400,110,'seeds respire','font-weight="700"')+lbl(400,135,'day and night')]]},
 seeNote:'Plants respire all the time.',
 do:{title:'Sprout respiration',mat:'Moong sprouts, closed jar, lime water in a cap (teacher)',steps:['Keep sprouts and a cap of lime water in a closed jar for a day.'],obs:'Lime water milky.',why:'CO₂ from respiration.',lab:true},
 memo:'"Photosynthesis by day; respiration always."',
 miscon:['"Plants respire only at night." They respire all the time.'],
 terms:['Respiration · श्वसन','Germinating seeds','Root respiration'],
 q:{q:'Plants respire:',o:['only at night','only in day','all the time','never'],a:2,why:'Need energy always.'},
 exam:'Photosynthesis vs respiration: 3 marks.'},

{id:'f5',num:'10.5',title:'Transport in plants: xylem and phloem · पादपों में परिवहन',
 intro:'Put a white flower in coloured water. What happens to the petals?',
 obj:'Describe transport of water and food through xylem and phloem.',
 prior:'10.1.',
 simple:'Roots absorb water and minerals through root hairs. Water travels up the stem in pipe-like tubes called xylem (जाइलम) to the leaves. Food made in the leaves is carried to all parts (stem, roots, fruits) by another set of tubes called phloem (फ्लोएम). Xylem and phloem together form the vascular tissue.',
 detail:'Activity: keep a celery stalk or balsam plant in water with red ink; after some hours, cut the stem — red dots show the xylem. Water moves up in xylem from roots to leaves (one way). Phloem carries food up and down. Potatoes store food sent down by phloem.',
 real:'Coloured carnations sold in markets are often made by putting white flowers in dyed water.',
 apply:'In which tissue does food from leaves reach a mango fruit?',
 see:{w:520,h:240,f:[
  ['Roots absorb water and minerals.',`<path d="M260 230 v-40 M260 200 l-30 30 M260 205 l30 28 M260 215 l-15 20" stroke="${BR}" stroke-width="3"/>`+lbl(340,230,'root hairs','text-anchor="start"')],
  ['Xylem: water goes up.',`<rect x="252" y="40" width="6" height="160" fill="${BL}"/>`+arr(240,170,240,70,BL)+lbl(200,60,'xylem · जाइलम','fill="'+BL+'"')],
  ['Phloem: food goes to all parts.',`<rect x="262" y="40" width="6" height="160" fill="${OR}"/>`+arr(282,70,282,170,OR)+lbl(330,60,'phloem · फ्लोएम','fill="'+OR+'" text-anchor="start"')+leaf(260,35,120,30)]]},
 seeNote:'Xylem: water up. Phloem: food everywhere.',
 do:{title:'Red celery',mat:'Celery stalk or balsam plant, red ink, water',steps:['Keep in red water for 4 hours.','Cut across the stem.'],obs:'Red dots: xylem.',why:'Water rises in xylem.',lab:true},
 memo:'"Xylem: water. Phloem: food."',
 miscon:['"The same tubes carry water and food." Xylem and phloem are different.'],
 terms:['Root hairs','Xylem · जाइलम','Phloem · फ्लोएम','Vascular tissue · संवहनी ऊतक'],
 q:{q:'Water is carried up by:',o:['phloem','xylem','stomata','flowers'],a:1,why:'Xylem.'},
 exam:'Xylem vs phloem: 2 marks.'},

{id:'f6',num:'10.6',title:'Transpiration · वाष्पोत्सर्जन',
 intro:'Tie a plastic bag around a leafy branch on a sunny day. Where do the droplets come from?',
 obj:'Explain transpiration and its uses to the plant.',
 prior:'10.3, 10.5.',
 simple:'Plants lose water as vapour mainly through stomata: transpiration (वाष्पोत्सर्जन). It creates a pull that helps draw water up through the xylem from the roots. It also cools the leaves (like sweating). Most of the water a plant absorbs is lost by transpiration.',
 detail:'Transpiration is faster on hot, dry, windy, sunny days. It adds water vapour to the air and is part of the water cycle — forests help bring rain. Desert plants like cactus have spines instead of leaves to reduce transpiration.',
 real:'It feels cooler under a neem tree partly because leaves lose water by transpiration.',
 apply:'Why does a cactus have spines instead of broad leaves?',
 see:{w:520,h:220,f:[
  ['Plastic bag over a leafy branch.',`<path d="M180 190 v-100" stroke="${BR}" stroke-width="4"/>`+leaf(150,110,70,24,GN,-30)+leaf(210,90,70,24,GN,30)+`<path d="M120 60 q60 -40 120 0 v100 q-60 20 -120 0z" fill="#fff" opacity=".35" stroke="${ink}"/>`],
  ['After some hours: droplets inside.',[0,1,2,3,4,5].map(k=>`<circle cx="${135+k*18}" cy="${75+(k%2)*12}" r="4" fill="${LB}" stroke="${BL}"/>`).join('')],
  ['Water vapour leaves through stomata.',lbl(390,100,'transpiration · वाष्पोत्सर्जन','font-weight="700"')+lbl(390,125,'pulls water up · cools leaves')]]},
 seeNote:'Pull and cool.',
 do:{title:'Bag test',mat:'Clear plastic bag, thread, a leafy plant',steps:['Tie the bag around a branch in sunlight.','Check after 3 hours.'],obs:'Water droplets.',why:'Transpiration.',lab:true},
 memo:'"Leaves sweat, water climbs."',
 miscon:['"Transpiration is wasteful only." It pulls water up and cools the plant.'],
 terms:['Transpiration · वाष्पोत्सर्जन','Transpiration pull','Water vapour'],
 q:{q:'Transpiration mainly happens through:',o:['roots','stomata','flowers','bark'],a:1,why:'Pores in leaves.'},
 exam:'Importance of transpiration: 2 marks.'}
];

const CARDS=[['Photosynthesis','CO₂ + water → glucose + O₂ (sunlight, chlorophyll).'],['Chlorophyll','Green pigment that captures light.'],['Producers','Plants make their own food.'],['Starch test','Iodine → blue-black.'],['Light needed','Covered leaf part: no starch.'],['Stomata','Pores with guard cells; gas exchange.'],['Respiration in plants','All the time; CO₂ released.'],['Xylem','Carries water up.'],['Phloem','Carries food to all parts.'],['Transpiration','Water vapour lost; pulls water up; cools.']];

const Q=[
 {lv:1,q:'Green pigment in leaves:',o:['haemoglobin','chlorophyll','starch','iodine'],a:1,w:'Chlorophyll.'},
 {lv:1,q:'Pores in leaves:',o:['villi','stomata','spiracles','gills'],a:1,w:'Stomata.'},
 {lv:1,q:'Water moves up through:',o:['phloem','xylem','stomata','petals'],a:1,w:'Xylem.'},
 {lv:2,q:'Raw materials for photosynthesis:',o:['O₂ and glucose','CO₂ and water','starch and iodine','N₂ and water'],a:1,w:'Inputs.'},
 {lv:2,q:'Iodine test shows the presence of:',o:['protein','starch','fat','water'],a:1,w:'Starch.'},
 {lv:2,q:'Loss of water vapour from leaves:',o:['respiration','transpiration','germination','digestion'],a:1,w:'Transpiration.'},
 {lv:3,q:'Why is a plant destarched before the experiment?',o:['to kill it','to remove existing starch so new starch can be detected','to add chlorophyll','to water it'],a:1,w:'Fair test.'},
 {lv:3,q:'At night, plants:',o:['only photosynthesise','only respire','do neither','release only oxygen'],a:1,w:'No light.'},
 {lv:4,q:'Moving a lamp closer to a water plant makes bubbles:',o:['fewer','more (up to a limit)','stop','turn red'],a:1,w:'More light.'},
 {lv:4,q:'An overwatered potted plant wilts because roots:',o:['get too much light','cannot get oxygen','make too much food','lose chlorophyll'],a:1,w:'No air in soil.'},
 {lv:5,open:true,m:4,q:'Describe an experiment to show that light is necessary for photosynthesis.',ans:['Destarch the plant in the dark for 2 days (1)','Cover part of a leaf with black paper; keep in sunlight (1)','Test leaf with iodine after removing chlorophyll (1)','Uncovered part blue-black, covered part not → light needed (1)']},
 {lv:5,open:true,m:3,q:'Give three differences between photosynthesis and respiration.',ans:['Uses CO₂ + water vs uses glucose + O₂ (1)','Releases O₂ vs releases CO₂ (1)','Needs light, only in green parts vs all the time, all cells (1)']}
];

const ONEMIN=['Photosynthesis: CO₂ + water → glucose + O₂ with light and chlorophyll.','Starch test: iodine blue-black; light needed.','Stomata and guard cells.','Plants respire day and night.','Xylem: water up; phloem: food.','Transpiration: pull and cooling.'];
const KEYS=[['photosynthesis',/photosynth|प्रकाश संश्लेषण/i],['chlorophyll',/chlorophyll/i],['starch/iodine',/starch|iodine/i],['stomata',/stoma/i],['respiration',/respir/i],['xylem/phloem',/xylem|phloem/i],['transpiration',/transpir/i]];

/* ---------- lab ---------- */
let mode='bub',dist=30,co2=1,temp=25,ph=0,raf=null,bubs=[],sst=[];
function rateBub(){const light=Math.min(1,(100/dist)/3.3);const c=[0.15,0.6,1][co2];const tf=temp===25?1:temp===5?0.3:0.45;return Math.round(60*Math.min(light,c)*tf)}
function stop(){if(raf)cancelAnimationFrame(raf);raf=null}
function vis(){const s=$('#fSvg');return s&&s.isConnected&&s.getClientRects().length}
function drawBub(){const r=rateBub();let s='';const lx=40+dist*1.6;s+=`<circle cx="${lx}" cy="80" r="16" fill="${YE}"/><path d="M${lx-14} 60 h28 l-6 -16 h-16z" fill="#555"/>`+[...Array(5)].map((_,k)=>`<line x1="${lx+18}" y1="${70+k*5}" x2="${lx+18+Math.max(10,60-dist/2)}" y2="${60+k*12}" stroke="${YE}" opacity="${Math.max(0.15,1-dist/110)}"/>`).join('');
 s+=`<path d="M260 60 v200 a12 12 0 0 0 12 12 h136 a12 12 0 0 0 12 -12 v-200" fill="none" stroke="${ink}" stroke-width="2"/><rect x="262" y="90" width="156" height="180" fill="${LB}" opacity=".5"/>`;
 s+=`<path d="M300 210 l40 -50 h10 l-40 50z" fill="#cfe8f7" stroke="${ink}"/><path d="M340 260 v-90" stroke="${GN}" stroke-width="3"/>`+[0,1,2,3,4,5].map(k=>leaf(340+(k%2?14:-14),250-k*14,26,8,GN,k%2?20:-20)).join('');
 bubs.forEach(b=>s+=`<circle cx="${b.x.toFixed(1)}" cy="${b.y.toFixed(1)}" r="${b.r}" fill="none" stroke="${BL}" stroke-width="1.5"/>`);
 s+=T(340,300,`≈ ${r} bubbles / minute`,'font-size="14" font-weight="700"')+T(120,300,`lamp ${dist} cm · ${temp} °C`,'font-size="12"');$('#fSvg').innerHTML=s;
 $('#fLv').textContent=dist+' cm';
 const lim=(()=>{const light=Math.min(1,(100/dist)/3.3),c=[0.15,0.6,1][co2];if(temp!==25)return temp===5?'Too cold: photosynthesis slows down.':'Too hot: the plant is stressed; rate falls.';return light<c?'Light is the limiting factor: bring the lamp closer.':c<1?'Carbon dioxide is limiting: add more baking soda.':'Plenty of light and CO₂: near the maximum rate.'})();
 $('#fOut').innerHTML=`<p>Bubbles are <b>oxygen</b> from photosynthesis.</p><p>${lim}</p>`}
function loop(){if(mode!=='bub'||!vis()){stop();return}const r=rateBub();if(Math.random()<r/60/60*2)bubs.push({x:338+Math.random()*6,y:170,r:2+Math.random()*2});bubs.forEach(b=>b.y-=1.2);bubs=bubs.filter(b=>b.y>92);drawBub();raf=requestAnimationFrame(loop)}
function drawStarch(){let s='';const has=k=>sst.includes(k);const dark=has('dark'),cover=has('cover'),sun0=has('sun'),test=has('test');
 s+=sun0?sun(60,50):`<rect x="20" y="20" width="80" height="60" fill="#222" opacity="${dark?0.8:0}"/>`;
 const lc=test?(sun0?'#2a2a5a':'#f4ecc8'):GN;s+=leaf(260,160,300,100,lc);
 if(cover)s+=test?`<rect x="225" y="100" width="70" height="120" fill="#f4ecc8"/>`:`<rect x="225" y="100" width="70" height="120" fill="#222"/>`;
 if(test&&sun0&&!dark)s+=`<rect x="225" y="100" width="70" height="120" fill="#2a2a5a" opacity="${cover?0.5:0}"/>`;
 s+=T(260,290,sst.length?'Steps done: '+sst.map(k=>({dark:'dark',cover:'cover',sun:'sunlight',test:'iodine'}[k])).join(' → '):'Do the steps in order','font-size="12"');$('#fSvg').innerHTML=s;
 let m='';if(test){if(!sun0)m='<p class="fb no">No sunlight: the whole leaf stays yellowish-brown — no starch was made.</p>';else if(!dark&&cover)m='<p class="fb no">The covered part also shows some blue-black: the plant was not destarched first, so old starch was still there. Restart and keep it in the dark first.</p>';else if(cover)m='<p class="fb ok">Uncovered parts are blue-black (starch); the covered strip is not. Light is necessary for photosynthesis!</p>';else m='<p>Whole leaf is blue-black. Cover part of a leaf to show light is needed.</p>'}else m='<p>Do the steps 1 → 4.</p>';$('#fOut').innerHTML=m}
function draw(){if(mode==='bub'){drawBub();if(!raf)loop()}else{stop();drawStarch()}}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='fL')labChange(e.target)})}
function labClick(b){if(b.dataset&&b.dataset.s){mode='starch';$('#fMode').value='starch';if(!sst.includes(b.dataset.s)&&!sst.includes('test'))sst.push(b.dataset.s);draw();return true}if(b.id==='fSR'){sst=[];mode='starch';$('#fMode').value='starch';draw();return true}return false}
function labChange(t){if(t.id==='fMode'){mode=t.value;draw();return true}if(t.id==='fL'){dist=+t.value}else if(t.id==='fC'){co2=+t.value}else if(t.id==='fT'){temp=+t.value}else return false;mode='bub';$('#fMode').value='bub';draw();return true}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
