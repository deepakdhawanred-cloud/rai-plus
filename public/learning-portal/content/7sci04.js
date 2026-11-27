/* Rai Plus content pack: Class 7 Science (Curiosity), Chapter 4 – The World of Metals and Non-metals. Bilingual terms. */
RP.register({key:'7sci04',cls:'7',subject:'Science',ch:'4',title:"The World of Metals and Non-metals",color:'#5a6b7a',
crumb:"Class 7 Science · Curiosity · धातुओं एवं अधातुओं की दुनिया",h1:"Chapter 4: The World of Metals and Non-metals",sub:"धातु और अधातु. Lustre, hardness, sound, malleability, ductility, conduction, how they react with oxygen, and their uses.",heroLabel:"A shiny metal sheet, a coil of wire and a lump of yellow sulphur",labName:'Material tester',
theme:"\n:root{--g:light-dark(#5a6b7a,#b8c6d2);--g2:light-dark(#eef2f5,#10151a);--line:light-dark(#d5dde3,#2c353d);--bg:light-dark(#ffffff,#0a0d10);--card:light-dark(#ffffff,#10151a);\n--ink:light-dark(#151c22,#e6ecf1);--mute:light-dark(#55636e,#b0bdc7);--y:light-dark(#b0306a,#f2a3c6);--y2:light-dark(#fbe9f1,#230b17);--hd:#3e4b56}\n",
labHTML:`  <h2>Material tester · पदार्थ परीक्षक</h2>
  <p>Pick a sample and run the tests. Then decide: metal or non-metal? Score yourself on all ten samples.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="mSvg" viewBox="0 0 460 320" role="img" aria-label="Sample and test results" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Sample<select id="mS"><option value="fe">Sample 1 (grey rod)</option><option value="cu">Sample 2 (reddish wire)</option><option value="al">Sample 3 (silvery foil)</option><option value="s">Sample 4 (yellow powder)</option><option value="c">Sample 5 (black lump)</option><option value="mg">Sample 6 (grey ribbon)</option><option value="gr">Sample 7 (pencil lead)</option><option value="au">Sample 8 (yellow shiny coin)</option><option value="i">Sample 9 (dark crystals)</option><option value="zn">Sample 10 (bluish-grey sheet)</option></select></label></div>
  <div class="ctrl" style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn" data-t="look">Look (lustre)</button><button class="btn" data-t="hammer">Hammer it</button><button class="btn" data-t="ring">Drop it (sound)</button><button class="btn" data-t="circuit">Circuit test</button><button class="btn" data-t="burn">Burn → oxide in water + litmus</button></div>
  <div class="ctrl" style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn" data-g="metal">It's a metal</button><button class="btn" data-g="non">It's a non-metal</button></div>
  <div class="box y" id="mOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#5a6b7a',LABNAME='Material tester',MIND_CENTER='Metals & non-metals · धातु और अधातु';
const SL='#5a6b7a',RD='#d65a5a',BLU='#4a78c8',GN='#3b8a3b',YE='#e5c43a',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const shine=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c}"/><path d="M${x+6} ${y+h-6} L${x+w*0.45} ${y+6}" stroke="#fff" stroke-width="4" opacity=".7"/>`;
function heroDraw(){return shine(40,40,90,60,'#fff')+`<path d="M170 70 q20 -30 40 0 t40 0 t40 0" stroke="#fff" stroke-width="4" fill="none"/><circle cx="330" cy="80" r="22" fill="#fff" opacity=".7"/>`}
const HERO=heroDraw;
const MIND=[['Lustre, hardness, sound',100,50],['Malleable & ductile',420,50],['Conductors',90,150],['Non-metals & exceptions',430,150],['Oxides: basic & acidic',110,250],['Uses',410,250]];

const C=[
{id:'m1',num:'4.1',title:'Lustre, hardness and sound · चमक, कठोरता और ध्वनि',
 intro:'Why does a steel plate ring when dropped, but a piece of coal just thuds?',
 obj:'Describe lustre, hardness and sonority of metals.',
 prior:'Class 6: materials around us.',
 simple:'Metals (धातु) such as iron, copper, aluminium, gold and silver have a shine called lustre (धात्विक चमक). Most metals are hard. Metals make a ringing sound when struck: they are sonorous (ध्वानिक). That is why school bells and temple bells are made of metal.',
 detail:'Metals may lose their shine in air because a dull layer forms on the surface; rubbing with sandpaper shows the shine again. Some metals are exceptions: sodium and potassium are soft enough to cut with a knife. Mercury is a liquid metal at room temperature.',
 real:'Temple bells and ghungroos are made of metals to give a ringing sound.',
 apply:'Why is a school bell not made of wood?',
 see:{w:520,h:220,f:[
  ['Rub a dull iron nail with sandpaper…',`<rect x="60" y="90" width="150" height="20" rx="4" fill="#8a7d70"/>`+lbl(135,140,'dull surface')],
  ['…it shines: lustre.',shine(60,90,150,20,'#b9c2c9')+lbl(135,165,'lustre · धात्विक चमक','font-weight="700"')],
  ['Metals ring when struck: sonorous.',`<path d="M340 60 q40 -10 80 0 l10 70 h-100z" fill="#c9a227"/>`+[0,1,2].map(k=>`<path d="M${440+k*12} ${80-k*6} q10 20 0 40" stroke="${SL}" fill="none"/>`).join('')+lbl(385,170,'sonorous · ध्वानिक','font-weight="700"')]]},
 seeNote:'Shine and ring: signs of a metal.',
 do:{title:'Shine and ring',mat:'Iron nail, sandpaper, coal piece, wood, steel spoon',steps:['Rub each with sandpaper.','Drop each on the floor.'],obs:'Metals shine and ring; coal and wood don\'t.',why:'Lustre and sonority.',lab:true},
 memo:'"Metals shine and sing."',
 miscon:['"All metals are hard and solid." Sodium is soft; mercury is liquid.'],
 terms:['Metal · धातु','Lustre · धात्विक चमक','Hard · कठोर','Sonorous · ध्वानिक'],
 q:{q:'Bells are made of metals because metals are:',o:['soft','sonorous','dull','brittle'],a:1,why:'Ringing sound.'},
 exam:'Properties of metals: 2 marks.'},

{id:'m2',num:'4.2',title:'Malleable and ductile · आघातवर्धनीय और तन्य',
 intro:'How is aluminium foil made so thin? How are copper wires made?',
 obj:'Explain malleability and ductility.',
 prior:'4.1.',
 simple:'Metals can be beaten into thin sheets without breaking: they are malleable (आघातवर्धनीय). Aluminium foil and silver varq on sweets are examples. Metals can be drawn into thin wires: they are ductile (तन्य). Copper and aluminium wires are examples.',
 detail:'Gold and silver are the most malleable and ductile: one gram of gold can be drawn into a wire about 2 km long. Non-metals like coal and sulphur crumble when hammered — they are brittle (भंगुर). Malleability and ductility let metals be shaped into utensils, sheets for cars and roofs, and wires.',
 real:'Silver varq on kaju katli is beaten so thin it is almost transparent.',
 apply:'Give one use each of malleability and ductility.',
 see:{w:520,h:220,f:[
  ['A lump of metal and a lump of coal.',`<rect x="80" y="110" width="60" height="40" rx="6" fill="#b9c2c9"/><rect x="330" y="110" width="60" height="40" rx="10" fill="#333"/>`],
  ['Hammer: metal flattens…',`<rect x="40" y="140" width="150" height="10" rx="3" fill="#b9c2c9"/>`+lbl(115,185,'malleable · आघातवर्धनीय','font-weight="700"')],
  ['…coal breaks into pieces.',[0,1,2,3,4].map(k=>`<polygon points="${320+k*18},150 ${330+k*18},135 ${338+k*18},150" fill="#333"/>`).join('')+lbl(360,185,'brittle · भंगुर','font-weight="700"')]]},
 seeNote:'Flatten (malleable), stretch (ductile).',
 do:{title:'Hammer test',mat:'Aluminium wire, coal piece, hammer (with teacher)',steps:['Hammer each gently on a stone.'],obs:'Aluminium flattens; coal crumbles.',why:'Malleable vs brittle.',lab:true},
 memo:'"Malleable → sheets, ductile → wires."',
 miscon:['"Ductile means can be bent once." It means drawn into wires.'],
 terms:['Malleable · आघातवर्धनीय','Ductile · तन्य','Brittle · भंगुर','Foil · पन्नी'],
 q:{q:'Drawing metals into wires uses the property:',o:['malleability','ductility','lustre','sonority'],a:1,why:'Ductile.'},
 exam:'Define malleability and ductility: 2 marks.'},

{id:'m3',num:'4.3',title:'Conductors of heat and electricity · ऊष्मा और विद्युत के चालक',
 intro:'Why are cooking pans made of metal but have plastic or wooden handles?',
 obj:'Show that metals conduct heat and electricity.',
 prior:'Ch 3: conductors and insulators.',
 simple:'Metals are good conductors of heat: heat travels quickly through them, so pans heat food well. Metals are good conductors of electricity, so wires are made of copper and aluminium. Most non-metals are poor conductors (insulators), so handles are made of plastic or wood.',
 detail:'Silver and copper are the best conductors. Graphite (a form of carbon, a non-metal) is an exception: it conducts electricity — pencil lead lights a bulb in a circuit. Diamond (also carbon) does not.',
 real:'Pressure cookers: aluminium/steel body, plastic handle.',
 apply:'Why is copper used for electric wires?',
 see:{w:520,h:220,f:[
  ['Metal spoon in hot tea: handle heats up.',`<rect x="70" y="120" width="80" height="70" rx="6" fill="#c98a5a" opacity=".6"/><line x1="100" y1="160" x2="170" y2="60" stroke="#999" stroke-width="5"/>`+lbl(170,50,'warm!','fill="'+RD+'"')],
  ['Plastic handle stays cool.',`<rect x="260" y="120" width="120" height="40" rx="8" fill="#888"/><rect x="380" y="132" width="90" height="16" rx="6" fill="#3a3a3a"/>`+lbl(425,180,'insulating handle')],
  ['Metals carry electricity too.',lbl(260,210,'metals: good conductors of heat and electricity','font-weight="700"')]]},
 seeNote:'Metals conduct; most non-metals don\'t.',
 do:{title:'Wax race',mat:'Steel, wooden and plastic spoons, wax drops, hot water',steps:['Stick a wax drop at the top of each spoon.','Stand spoons in hot water.'],obs:'Wax on steel melts first.',why:'Metal conducts heat.',lab:true},
 memo:'"Metal pans, plastic handles."',
 miscon:['"All non-metals are insulators." Graphite conducts electricity.'],
 terms:['Conductor · चालक','Insulator · विद्युतरोधी','Graphite · ग्रेफाइट'],
 q:{q:'Which non-metal conducts electricity?',o:['sulphur','graphite','iodine','oxygen'],a:1,why:'Exception.'},
 exam:'Why handles are plastic: 2 marks.'},

{id:'m4',num:'4.4',title:'Non-metals and the exceptions · अधातु और अपवाद',
 intro:'Is everything that shines a metal?',
 obj:'Describe properties of non-metals and notable exceptions.',
 prior:'4.1–4.3.',
 simple:'Non-metals (अधातु) such as sulphur, carbon (coal), iodine, oxygen and nitrogen are usually dull, brittle (if solid), not sonorous, and poor conductors. They can be solids (sulphur, carbon), a liquid (bromine) or gases (oxygen, nitrogen).',
 detail:'Exceptions to remember: mercury — a liquid metal; sodium, potassium — soft metals; iodine — a non-metal with lustre; graphite — a non-metal that conducts electricity; diamond — a non-metal that is the hardest natural substance. So we look at many properties together to classify.',
 real:'Diamond (carbon) is used in cutting tools because it is very hard.',
 apply:'Name a non-metal that is lustrous and one that is very hard.',
 see:{w:520,h:220,f:[
  ['Non-metals: sulphur, coal, iodine.',`<circle cx="80" cy="90" r="26" fill="${YE}"/><rect x="150" y="66" width="50" height="48" rx="10" fill="#333"/><polygon points="270,70 290,90 270,110 250,90" fill="#4b3b6e"/>`+lbl(80,140,'sulphur')+lbl(175,140,'coal')+lbl(270,140,'iodine')],
  ['Exceptions: mercury (liquid metal)…',`<ellipse cx="380" cy="100" rx="40" ry="14" fill="#c9d1d8"/>`+lbl(380,140,'mercury')],
  ['…graphite conducts, diamond is hardest.',`<polygon points="470,70 490,95 470,120 450,95" fill="#dff3ff" stroke="${ink}"/>`+lbl(470,140,'diamond')+lbl(260,200,'look at many properties together','font-weight="700"')]]},
 seeNote:'Classify using several properties.',
 do:{title:'Odd one out',mat:'Picture cards',steps:['Sort metals/non-metals.','Find the exceptions.'],obs:'Mercury, graphite, iodine, diamond.',why:'Exceptions.',lab:false},
 memo:'"Mercury flows, graphite glows, iodine shows, diamond knows."',
 miscon:['"Everything shiny is a metal." Iodine shines.'],
 terms:['Non-metal · अधातु','Brittle · भंगुर','Mercury · पारा','Diamond · हीरा'],
 q:{q:'A liquid metal at room temperature:',o:['bromine','mercury','sodium','iron'],a:1,why:'Mercury.'},
 exam:'Exceptions among metals/non-metals: 2 marks.'},

{id:'m5',num:'4.5',title:'Reaction with oxygen: basic and acidic oxides · ऑक्सीजन से अभिक्रिया',
 intro:'Burn a magnesium ribbon and dissolve the ash in water. What does litmus show?',
 obj:'Show that metal oxides are basic and non-metal oxides are acidic.',
 prior:'Ch 2: acids, bases, indicators.',
 simple:'Metals react with oxygen to form metal oxides. Magnesium burns with a dazzling white flame to form magnesium oxide (white ash). Dissolved in water, it turns red litmus blue: metal oxides are basic (क्षारकीय). Non-metals form non-metal oxides: sulphur burns with a blue flame forming sulphur dioxide gas; dissolved in water it turns blue litmus red: non-metal oxides are acidic (अम्लीय).',
 detail:'Safety: these burning experiments are done only by the teacher; do not look straight at burning magnesium, and sulphur dioxide has a choking smell. Carbon (coal) burns to form carbon dioxide, which makes water slightly acidic. Iron slowly reacts with oxygen and water to form rust (more in Ch 5).',
 real:'Sulphur dioxide from factories causes acid rain.',
 apply:'A solution of an oxide turns red litmus blue. Was it formed from a metal or non-metal?',
 see:{w:520,h:240,f:[
  ['Magnesium burns: white flame.',`<line x1="80" y1="150" x2="140" y2="90" stroke="#aaa" stroke-width="5"/><circle cx="140" cy="90" r="16" fill="#fff" stroke="${YE}" stroke-width="4"/>`+lbl(110,190,'Mg → MgO (white ash)')],
  ['MgO + water: red litmus → blue (basic).',`<rect x="190" y="70" width="12" height="60" fill="${BLU}"/>`+lbl(196,150,'basic','fill="'+BLU+'"')],
  ['Sulphur burns: blue flame; SO₂ in water: blue litmus → red (acidic).',`<path d="M330 150 q-10 -40 10 -60 q20 20 10 60z" fill="${BLU}" opacity=".7"/>`+`<rect x="420" y="70" width="12" height="60" fill="${RD}"/>`+lbl(400,190,'S → SO₂: acidic','fill="'+RD+'"')+lbl(260,228,'metal oxide: basic · non-metal oxide: acidic','font-weight="700"')]]},
 seeNote:'Metals → basic oxides; non-metals → acidic oxides.',
 do:{title:'Teacher demo',mat:'Magnesium ribbon, tongs, burner, water, litmus (teacher only)',steps:['Teacher burns Mg; collect ash.','Dissolve ash in water; test with litmus.'],obs:'Red litmus turns blue.',why:'Basic oxide.',lab:true},
 memo:'"Metal oxide makes base; non-metal oxide makes acid."',
 miscon:['"All oxides are acidic." Metal oxides are basic.'],
 terms:['Oxide · ऑक्साइड','Magnesium oxide','Sulphur dioxide','Basic / acidic oxide'],
 q:{q:'Sulphur dioxide dissolved in water turns blue litmus:',o:['blue','red','green','no change'],a:1,why:'Acidic.'},
 exam:'Nature of oxides with litmus: 3 marks.'},

{id:'m6',num:'4.6',title:'Uses of metals and non-metals · धातुओं और अधातुओं के उपयोग',
 intro:'Which metals and non-metals did you use today?',
 obj:'Relate uses to properties.',
 prior:'4.1–4.5.',
 simple:'Metals: iron/steel for buildings, bridges and utensils (strong); copper and aluminium for wires (ductile, conductors); aluminium for foil and aircraft (light, malleable); gold and silver for jewellery (lustrous, don\'t tarnish easily). Non-metals: oxygen for breathing and burning; nitrogen in fertilisers; carbon in fuels (coal); chlorine to disinfect water; iodine (tincture) as an antiseptic; sulphur in medicines and crackers.',
 detail:'Choosing a material means matching properties to the job. Metals are mined from ores; using them carefully and recycling them (scrap iron, aluminium cans) saves resources and energy.',
 real:'Scrap dealers (kabadiwalas) collect metals for recycling.',
 apply:'Why are cooking utensils made of steel or aluminium?',
 see:{w:520,h:220,f:[
  ['Metals in use.',[['wires','copper','#c46a3a'],['foil','aluminium','#c9d1d8'],['jewellery','gold','#e5c43a']].map(([u,m,c],k)=>`<circle cx="${70+k*90}" cy="80" r="26" fill="${c}"/>`+lbl(70+k*90,125,m)+lbl(70+k*90,143,u,'font-size="11" fill="#888"')).join('')],
  ['Non-metals in use.',[['breathing','oxygen','#cfe8ef'],['fertiliser','nitrogen','#dcd3f3'],['clean water','chlorine','#d6f0c8']].map(([u,m,c],k)=>`<circle cx="${330+k*80}" cy="80" r="26" fill="${c}" stroke="${ink}"/>`+lbl(330+k*80,125,m)+lbl(330+k*80,143,u,'font-size="11" fill="#888"')).join('')],
  ['Property decides use.',lbl(260,195,'match the property to the job; recycle metals','font-weight="700"')]]},
 seeNote:'Use follows property.',
 do:{title:'Home survey',mat:'Notebook',steps:['List 10 metal and 5 non-metal items/uses at home.','Write the property behind each use.'],obs:'Many uses.',why:'Properties decide use.',lab:false},
 memo:'"Strong iron, wiry copper, light aluminium, shiny gold."',
 miscon:['"Non-metals are useless." Oxygen, nitrogen, chlorine are essential.'],
 terms:['Ore · अयस्क','Recycling · पुनर्चक्रण','Fertiliser · उर्वरक'],
 q:{q:'Aluminium foil uses the property:',o:['ductility','malleability','sonority','brittleness'],a:1,why:'Sheets.'},
 exam:'Uses with reasons: 3 marks.'}
];

const CARDS=[['Lustre','Metallic shine.'],['Sonorous','Rings when struck.'],['Malleable','Beaten into sheets.'],['Ductile','Drawn into wires.'],['Brittle','Breaks easily (non-metals).'],['Conductors','Metals; graphite exception.'],['Exceptions','Mercury liquid; sodium soft; iodine lustrous; diamond hard.'],['Metal oxide','Basic: red litmus → blue (MgO).'],['Non-metal oxide','Acidic: blue litmus → red (SO₂).'],['Uses','Iron, copper, aluminium, gold; O₂, N₂, Cl₂.']];

const Q=[
 {lv:1,q:'Shiny appearance of metals:',o:['ductility','lustre','brittleness','sonority'],a:1,w:'Lustre.'},
 {lv:1,q:'A non-metal:',o:['copper','sulphur','zinc','gold'],a:1,w:'Sulphur.'},
 {lv:1,q:'Wires are made using:',o:['malleability','ductility','brittleness','lustre'],a:1,w:'Ductile.'},
 {lv:2,q:'Coal when hammered:',o:['flattens','breaks into pieces','rings','stretches'],a:1,w:'Brittle.'},
 {lv:2,q:'Magnesium oxide in water is:',o:['acidic','basic','neutral','metal'],a:1,w:'Metal oxide.'},
 {lv:2,q:'Liquid metal:',o:['mercury','bromine','iodine','sodium'],a:0,w:'Mercury.'},
 {lv:3,q:'Pan handles are plastic because plastic is:',o:['a conductor of heat','a poor conductor of heat','shiny','sonorous'],a:1,w:'Insulator.'},
 {lv:3,q:'Burning sulphur gives:',o:['magnesium oxide','sulphur dioxide','carbon','rust'],a:1,w:'SO₂.'},
 {lv:4,q:'A sample is dull, crumbles, but conducts electricity. It is probably:',o:['iron','graphite','sulphur','copper'],a:1,w:'Exception.'},
 {lv:4,q:'An oxide solution turns blue litmus red. The element was:',o:['magnesium','sulphur','iron','gold'],a:1,w:'Acidic oxide → non-metal.'},
 {lv:5,open:true,m:3,q:'Describe an activity to show metal oxides are basic.',ans:['Teacher burns magnesium ribbon (1)','Ash (MgO) dissolved in water (1)','Turns red litmus blue → basic (1)']},
 {lv:5,open:true,m:3,q:'Give three differences between metals and non-metals.',ans:['Lustrous vs dull (1)','Malleable/ductile vs brittle (1)','Good vs poor conductors; basic vs acidic oxides (1)']}
];

const ONEMIN=['Metals: lustrous, hard, sonorous.','Malleable (sheets), ductile (wires).','Good conductors; non-metals poor (graphite exception).','Exceptions: mercury, sodium, iodine, diamond.','Metal oxides basic; non-metal oxides acidic.','Uses depend on properties.'];
const KEYS=[['lustre',/lustr|shine/i],['malleable/ductile',/mallea|ductil/i],['sonorous',/sonor|ring/i],['conductor',/conduct/i],['exceptions',/mercury|graphite|iodine|diamond/i],['oxides',/oxide|litmus/i],['uses',/wire|foil|jewel|use/i]];

/* ---------- lab ---------- */
// [name, metal?, colour, lustre, hammer, ring, conduct, oxide(0 none safe /'b'/'a')]
const S={fe:['Iron',1,'#8d969c',1,'flattens slightly (hard)',1,1,'b'],cu:['Copper',1,'#c46a3a',1,'flattens into a sheet',1,1,'b'],al:['Aluminium',1,'#c9d1d8',1,'flattens easily',1,1,'b'],s:['Sulphur',0,'#e5c43a',0,'crumbles to powder',0,0,'a'],c:['Carbon (coal)',0,'#333',0,'breaks into pieces',0,0,'a'],mg:['Magnesium',1,'#b5b9bd',1,'flattens',1,1,'b'],gr:['Graphite',0,'#4a4a4a',0.5,'breaks',0,1,'a'],au:['Gold',1,'#e5c43a',1,'flattens into a very thin sheet',1,1,'n'],i:['Iodine',0,'#4b3b6e',1,'crumbles',0,0,'n'],zn:['Zinc',1,'#9fb0bf',1,'flattens',1,1,'b']};
let cur='fe',tests={},score={},msg='';
function draw(){const s0=S[cur];let s='';const done=tests[cur]||{};
 const c=s0[2];s+=done.hammer?(s0[1]?`<rect x="40" y="110" width="150" height="14" rx="3" fill="${c}"/>`:[0,1,2,3,4,5].map(k=>`<polygon points="${60+k*22},124 ${70+k*22},106 ${80+k*22},124" fill="${c}"/>`).join('')):(done.look&&s0[3]?shine(70,70,90,60,c):`<rect x="70" y="70" width="90" height="60" rx="${s0[1]?4:14}" fill="${c}" opacity="${s0[1]&&!done.look?.75:1}"/>`);
 s+=T(115,160,'Sample: '+(score[cur]!==undefined?s0[0]:'?'),'font-size="13" font-weight="700"');
 const rows=[['look','Lustre',done.look?(s0[3]===1?'shiny ✓':s0[3]===0.5?'slight shine':'dull'):'—'],['hammer','Hammer',done.hammer?s0[4]:'—'],['ring','Sound',done.ring?(s0[5]?'rings (sonorous)':'dull thud'):'—'],['circuit','Circuit',done.circuit?(s0[6]?'bulb glows (conductor)':'no glow'):'—'],['burn','Oxide + litmus',done.burn?(s0[7]==='b'?'red litmus → blue: basic':s0[7]==='a'?'blue litmus → red: acidic':'no simple reaction'):'—']];
 rows.forEach(([k,n,v],i)=>{const y=60+i*36;s+=`<rect x="220" y="${y-18}" width="230" height="30" rx="5" fill="${done[k]?'#eef2f5':'none'}" stroke="${GR}" stroke-width=".6"/>`+T(228,y+2,n,'font-size="12" font-weight="700" text-anchor="start"')+T(330,y+2,v,'font-size="11" text-anchor="start"')});
 if(done.circuit&&s0[6])s+=`<circle cx="115" cy="230" r="18" fill="#f7d14c" opacity=".5"/><circle cx="115" cy="230" r="10" fill="#fff6c2" stroke="${ink}"/>`;
 const n=Object.keys(score).length,ok=Object.values(score).filter(Boolean).length;s+=T(330,290,`Score: ${ok}/${n} of 10 samples`,'font-size="13" font-weight="700"');
 $('#mSvg').innerHTML=s;$('#mOut').innerHTML=msg||'<p>Run some tests, then decide.</p>'}
function labShow(){draw()}
function labInit(){}
function labClick(b){if(b.dataset&&b.dataset.t){tests[cur]=tests[cur]||{};tests[cur][b.dataset.t]=1;msg=b.dataset.t==='burn'?'<p class="note">Burning tests are done only by a teacher. Iodine and gold were not burnt here.</p>':'';draw();return true}
 if(b.dataset&&b.dataset.g){const s0=S[cur];const ok=(b.dataset.g==='metal')===!!s0[1];const nT=Object.keys(tests[cur]||{}).length;score[cur]=ok;
  const ex={gr:' Graphite conducts electricity but is a non-metal: look at all properties!',i:' Iodine has lustre but is a non-metal.',mg:'',au:''}[cur]||'';
  msg=`<p class="fb ${ok?'ok':'no'}">${ok?'Correct':'Not quite'}: it is <b>${s0[0]}</b>, a ${s0[1]?'metal':'non-metal'}. You used ${nT} test(s).${ex}</p>`;draw();return true}return false}
function labChange(t){if(t.id==='mS'){cur=t.value;msg='';draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
