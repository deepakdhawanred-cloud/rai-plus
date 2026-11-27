/* Rai Plus content pack: Class 7 Science (Curiosity), Chapter 7 – Heat Transfer in Nature. Bilingual terms. */
RP.register({key:'7sci07',cls:'7',subject:'Science',ch:'7',title:"Heat Transfer in Nature",color:'#c0392b',
crumb:"Class 7 Science · Curiosity · प्रकृति में ऊष्मा स्थानांतरण",h1:"Chapter 7: Heat Transfer in Nature",sub:"ऊष्मा का स्थानांतरण. Conduction, convection and radiation; sea and land breezes; colours and heat; the water cycle and groundwater.",heroLabel:"Sun's rays, a sea breeze and a pan on a flame",labName:'Heat-transfer lab',
theme:"\n:root{--g:light-dark(#c0392b,#f3a39a);--g2:light-dark(#fcedeb,#230c0a);--line:light-dark(#f2d0cb,#4a2320);--bg:light-dark(#ffffff,#130807);--card:light-dark(#ffffff,#1b0d0b);\n--ink:light-dark(#220c0a,#f6e4e2);--mute:light-dark(#6e4b47,#cdaaa6);--y:light-dark(#2e6fb5,#85b7eb);--y2:light-dark(#e6f1fb,#0c1e33);--hd:#8a2418}\n",
labHTML:`  <h2>Heat-transfer lab · ऊष्मा प्रयोगशाला</h2>
  <p>Choose an experiment. <b>Conduction:</b> which rod drops its wax pins first? <b>Convection:</b> watch hot water rise. <b>Breeze:</b> switch between day and night at the seaside. <b>Radiation:</b> black or white can in the Sun?</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="tSvg" viewBox="0 0 460 320" role="img" aria-label="Heat transfer experiment" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Experiment<select id="tMode"><option value="cond">Conduction race</option><option value="conv">Convection in water</option><option value="breeze">Sea and land breeze</option><option value="rad">Radiation: black vs white</option></select></label></div>
  <div class="ctrl"><label>Rod material<select id="tMat"><option value="cu">Copper</option><option value="al">Aluminium</option><option value="fe">Iron/steel</option><option value="glass">Glass</option><option value="wood">Wood</option><option value="plastic">Plastic</option></select></label></div>
  <div class="ctrl"><button class="btn" id="tGo">Start / heat</button> <button class="btn" id="tReset">Reset</button> <button class="btn" id="tDN">Toggle day / night</button></div>
  <div class="box y" id="tOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#c0392b',LABNAME='Heat-transfer lab',MIND_CENTER='Heat transfer · ऊष्मा स्थानांतरण';
const RD='#c0392b',OR='#e07b22',BL='#2e6fb5',LB='#a9cfee',GN='#3b8a3b',GR='#888780',YE='#f2b632',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const flame=(x,y,s=1)=>`<path d="M${x} ${y} q${-12*s} ${-18*s} 0 ${-38*s} q${12*s} ${20*s} 0 ${38*s}z" fill="${OR}"/><path d="M${x} ${y} q${-6*s} ${-10*s} 0 ${-20*s} q${6*s} ${10*s} 0 ${20*s}z" fill="${YE}"/>`;
const arr=(x1,y1,x2,y2,c=RD,w=2.5)=>{const a=Math.atan2(y2-y1,x2-x1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/><path d="M${x2} ${y2} l${(-10*Math.cos(a-0.45)).toFixed(1)} ${(-10*Math.sin(a-0.45)).toFixed(1)} M${x2} ${y2} l${(-10*Math.cos(a+0.45)).toFixed(1)} ${(-10*Math.sin(a+0.45)).toFixed(1)}" stroke="${c}" stroke-width="${w}"/>`};
const sun=(x,y,r=22)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${YE}"/>`+[...Array(8)].map((_,k)=>{const a=k*Math.PI/4;return `<line x1="${x+(r+4)*Math.cos(a)}" y1="${y+(r+4)*Math.sin(a)}" x2="${x+(r+12)*Math.cos(a)}" y2="${y+(r+12)*Math.sin(a)}" stroke="${YE}" stroke-width="3"/>`}).join('');
function heroDraw(){return sun(60,50,20).replace(/#f2b632/g,'#fff')+`<path d="M130 100 q30 -20 60 0 t60 0" stroke="#fff" stroke-width="3" fill="none"/>`+arr(140,60,230,60,'#fff',3)+`<rect x="290" y="70" width="70" height="16" rx="4" fill="#fff"/>`+flame(325,120,0.8).replace(/#e07b22|#f2b632/g,'#fff')}
const HERO=heroDraw;
const MIND=[['Conduction',100,50],['Conductors & insulators',420,50],['Convection',90,150],['Sea & land breeze',430,150],['Radiation & colours',110,250],['Water cycle & groundwater',410,250]];

const C=[
{id:'t1',num:'7.1',title:'Conduction · चालन',
 intro:'Leave a steel spoon in hot tea. Why does the handle get hot?',
 obj:'Explain conduction as heat transfer through a solid from hotter to colder parts.',
 prior:'Class 6: temperature and its measurement.',
 simple:'Heat always flows from a hotter object or part to a colder one. In solids, heat passes from particle to particle without the particles moving from their places: this is conduction (चालन). Heat a metal strip at one end: wax pins stuck along it fall one by one, starting from the end nearest the flame.',
 detail:'Particles at the hot end vibrate faster and pass the energy to neighbours. Conduction needs contact. When you touch a cold railing, heat flows from your hand to the railing, so it feels cold. When you hold a hot cup, heat flows into your hand.',
 real:'A tawa heats from the flame below; the whole tawa becomes hot by conduction.',
 apply:'Why does a metal chair feel colder than a wooden one on a winter morning, though both are at the same temperature?',
 see:{w:520,h:220,f:[
  ['A metal strip with wax pins; heat at one end.',`<rect x="80" y="100" width="360" height="12" fill="#a8b0b8"/>`+[0,1,2,3,4].map(k=>`<rect x="${130+k*65}" y="112" width="6" height="22" fill="#f4e7b5" stroke="${ink}" stroke-width=".5"/>`).join('')+flame(90,180,1)],
  ['Heat travels along: nearest pins fall first.',`<rect x="80" y="100" width="180" height="12" fill="${RD}" opacity=".55"/>`+arr(110,85,260,85)],
  ['Hot → cold, particle to particle.',lbl(260,40,'conduction · चालन','font-weight="700"')+lbl(330,200,'pins fall: 1st, 2nd, 3rd …')]]},
 seeNote:'Heat flows hot → cold.',
 do:{title:'Wax-pin strip',mat:'Aluminium strip, candle wax, drawing pins, candle, stand (with teacher)',steps:['Stick pins with wax at equal gaps.','Heat one end.','Note the order the pins fall.'],obs:'Nearest first.',why:'Conduction.',lab:true},
 memo:'"Hot to cold, hand to hand along the solid."',
 miscon:['"Cold flows into your hand." Heat flows out of your hand.'],
 terms:['Heat · ऊष्मा','Conduction · चालन','Hot → cold'],
 q:{q:'In conduction, the particles:',o:['move from place to place','pass heat to neighbours while staying in place','do not vibrate','carry light'],a:1,why:'Definition.'},
 exam:'Explain conduction with an activity: 3 marks.'},

{id:'t2',num:'7.2',title:'Conductors and insulators of heat · ऊष्मा के चालक और कुचालक',
 intro:'Why do we wear woollen clothes in winter?',
 obj:'Classify materials as good or poor conductors of heat and give uses.',
 prior:'7.1; Ch 4 (metals).',
 simple:'Materials that let heat pass easily are good conductors (ऊष्मा के सुचालक): metals like copper, aluminium, iron. Materials that do not let heat pass easily are poor conductors or insulators (ऊष्मा के कुचालक/ऊष्मारोधी): wood, plastic, glass, cloth, wool, air.',
 detail:'Cooking pots are metal (good conductors) with wooden or plastic handles (insulators). Woollen clothes trap air between fibres; air is a poor conductor, so body heat is not lost. Two thin blankets keep you warmer than one thick blanket because air is trapped between them. Ice-boxes use thermocol.',
 real:'Haryana winters: woollen shawls and razais trap air and keep us warm.',
 apply:'Why are two thin blankets warmer than one thick blanket?',
 see:{w:520,h:220,f:[
  ['Metal pan conducts heat to food.',`<path d="M60 110 h140 v20 a10 10 0 0 1 -10 10 h-120 a10 10 0 0 1 -10 -10z" fill="#9aa3ab"/>`+flame(130,190,1)],
  ['Plastic handle stays cool.',`<rect x="200" y="112" width="90" height="14" rx="6" fill="#3a3a3a"/>`+lbl(245,155,'insulator')],
  ['Wool traps air: keeps heat in.',[0,1,2,3,4,5].map(k=>`<path d="M${360+k*20} 70 q10 20 0 40 q-10 20 0 40" stroke="#c9a" stroke-width="5" fill="none"/>`).join('')+lbl(410,200,'trapped air · फँसी हुई वायु')]]},
 seeNote:'Air is a poor conductor.',
 do:{title:'Spoon race',mat:'Steel, plastic and wooden spoons, butter dots, hot water',steps:['Put a butter dot at the top of each spoon.','Stand them in hot water.'],obs:'Steel one melts first.',why:'Metal conducts.',lab:true},
 memo:'"Metal pans, wooden handles, woollen shawls."',
 miscon:['"Wool produces heat." It traps air and stops heat loss.'],
 terms:['Good conductor · सुचालक','Insulator · ऊष्मारोधी','Trapped air'],
 q:{q:'Woollen clothes keep us warm because:',o:['wool makes heat','air trapped in wool is a poor conductor','wool is a metal','wool absorbs cold'],a:1,why:'Trapped air.'},
 exam:'Uses of conductors and insulators: 2 marks.'},

{id:'t3',num:'7.3',title:'Convection · संवहन',
 intro:'Drop a crystal of potassium permanganate in water and heat gently from below. Why does a purple stream rise?',
 obj:'Explain convection in liquids and gases.',
 prior:'7.1.',
 simple:'In liquids and gases, heated particles move: the warm part becomes lighter and rises, and cooler, heavier liquid or gas sinks to take its place. This carries heat around: convection (संवहन). The moving loop is a convection current.',
 detail:'Heat water from below: the bottom water warms, rises; cooler water sinks; the whole beaker heats. That is why we heat from below. Smoke rises; hot air rises above a heater; room exhaust fans and ventilators are placed high up to let hot air out. Convection does not happen in solids.',
 real:'Ventilators near the ceiling let hot air escape from classrooms.',
 apply:'Why are ventilators placed near the ceiling?',
 see:{w:520,h:240,f:[
  ['Beaker of water heated at one side.',`<path d="M170 50 v150 a12 12 0 0 0 12 12 h156 a12 12 0 0 0 12 -12 v-150" fill="none" stroke="${ink}" stroke-width="2"/><rect x="172" y="70" width="176" height="140" fill="${LB}" opacity=".5"/>`+flame(210,250,1)],
  ['Warm water rises…',arr(210,190,210,90,RD)],
  ['…cool water sinks: a convection current.',arr(215,82,310,82,RD)+arr(310,90,310,190,BL)+arr(300,200,220,200,BL)+lbl(360,140,'convection current','text-anchor="start"')]]},
 seeNote:'Liquids and gases carry heat by moving.',
 do:{title:'Purple loop',mat:'Beaker of water, a grain of potassium permanganate, candle (teacher)',steps:['Drop the grain near one edge.','Heat gently below it.'],obs:'Purple rises, spreads, sinks on the other side.',why:'Convection current.',lab:true},
 memo:'"Warm rises, cool sinks, round it goes."',
 miscon:['"Heat rises." Warm fluid rises, carrying heat.'],
 terms:['Convection · संवहन','Convection current · संवहन धारा'],
 q:{q:'Convection happens in:',o:['solids only','liquids and gases','vacuum','metals'],a:1,why:'Particles move.'},
 exam:'Explain convection with a diagram: 3 marks.'},

{id:'t4',num:'7.4',title:'Sea breeze and land breeze · समुद्री और स्थलीय समीर',
 intro:'At the beach in the afternoon, the wind blows from the sea. At night it reverses. Why?',
 obj:'Explain sea and land breezes using convection.',
 prior:'7.3.',
 simple:'Land heats up and cools down faster than water. Day: land is hotter, air over land warms and rises; cooler air from the sea moves in — sea breeze (समुद्री समीर). Night: land cools faster, sea is warmer; air over the sea rises; cooler air from land moves out — land breeze (स्थलीय समीर).',
 detail:'Fishermen use the land breeze to sail out early in the morning and the sea breeze to return in the afternoon. On a large scale, the same idea (land and ocean heating differently) helps drive the monsoon winds over India.',
 real:'Coastal cities like Mumbai and Chennai get cool sea breezes on summer afternoons.',
 apply:'Which breeze helps fishermen return to shore in the afternoon?',
 see:{w:520,h:230,f:[
  ['Day: land hotter than sea.',sun(470,35)+`<rect x="0" y="170" width="250" height="60" fill="${BL}" opacity=".5"/><rect x="250" y="160" width="270" height="70" fill="#c9a36a"/>`+lbl(125,215,'sea','fill="#fff"')+lbl(385,210,'land (hot)')],
  ['Warm air over land rises.',arr(385,150,385,70,RD)],
  ['Cool sea air moves in: sea breeze.',arr(120,140,330,140,BL)+arr(380,60,140,60,GR,1.8)+arr(120,70,120,130,GR,1.8)+lbl(225,125,'sea breeze · समुद्री समीर','font-weight="700"')]]},
 seeNote:'Day: sea → land. Night: land → sea.',
 do:{title:'Sand vs water',mat:'Two bowls (dry sand, water), thermometer, sunlight',steps:['Keep both in sun for 30 minutes; measure.','Keep in shade 30 minutes; measure.'],obs:'Sand heats and cools faster.',why:'Land vs water.',lab:false},
 memo:'"Day sea-to-land, night land-to-sea."',
 miscon:['"The sea breeze blows at night." It blows by day.'],
 terms:['Sea breeze · समुद्री समीर','Land breeze · स्थलीय समीर','Monsoon · मानसून'],
 q:{q:'A land breeze blows:',o:['from sea to land at day','from land to sea at night','upward only','never'],a:1,why:'Land cools faster.'},
 exam:'Sea and land breeze with diagrams: 4 marks.'},

{id:'t5',num:'7.5',title:'Radiation and colours · विकिरण और रंग',
 intro:'How does the Sun\'s heat reach us across empty space?',
 obj:'Explain radiation and the effect of colour on absorbing heat.',
 prior:'7.1–7.3.',
 simple:'Heat from the Sun reaches us without any medium (through empty space): this is radiation (विकिरण). All hot objects radiate heat — we feel warmth near a fire without touching it. Dark-coloured objects absorb more radiated heat; light-coloured objects reflect more. So we prefer white or light clothes in summer and dark clothes in winter.',
 detail:'Experiment: two identical cans, one painted black, one white, filled with equal water and kept in sunlight — the black can\'s water gets hotter. Roofs painted white keep houses cooler. Solar water heaters have black panels to absorb more heat.',
 real:'"Cool roofs" painted white reduce indoor heat in Indian cities.',
 apply:'Why are solar cooker boxes painted black inside?',
 see:{w:520,h:220,f:[
  ['Sun radiates heat through space.',sun(70,60)+arr(100,80,200,130,OR)+arr(95,95,190,170,OR)],
  ['Black can absorbs more…',`<rect x="230" y="110" width="60" height="80" rx="6" fill="#222"/>`+lbl(260,210,'hotter','fill="'+RD+'"')],
  ['…white can reflects more.',`<rect x="360" y="110" width="60" height="80" rx="6" fill="#fff" stroke="${ink}"/>`+arr(380,105,340,60,OR,1.5)+lbl(390,210,'cooler','fill="'+BL+'"')]]},
 seeNote:'Dark absorbs, light reflects.',
 do:{title:'Black vs white',mat:'Two cups (one wrapped in black paper, one in white), water, thermometer',steps:['Fill equally; keep in sun 1 hour.','Measure both.'],obs:'Black is warmer.',why:'Absorbs more radiation.',lab:true},
 memo:'"Black takes heat, white sends it back."',
 miscon:['"Radiation needs air." It works through empty space.'],
 terms:['Radiation · विकिरण','Absorb · अवशोषण','Reflect · परावर्तन'],
 q:{q:'Sun\'s heat reaches Earth by:',o:['conduction','convection','radiation','evaporation'],a:2,why:'No medium needed.'},
 exam:'Three modes of heat transfer with examples: 3 marks.'},

{id:'t6',num:'7.6',title:'The water cycle and groundwater · जल चक्र और भौम जल',
 intro:'Where does the water in a handpump come from?',
 obj:'Describe the role of heat in the water cycle and explain groundwater and its conservation.',
 prior:'Class 6: water cycle.',
 simple:'Heat from the Sun evaporates water from seas, rivers and plants; vapour rises by convection, cools and condenses into clouds; rain falls. Some rainwater seeps into the soil (infiltration, अंतःस्यंदन) and collects in layers of rock and soil as groundwater (भौम जल). The upper level of this water is the water table (जल स्तर). A layer holding lots of water is an aquifer (जलभृत).',
 detail:'Handpumps, wells and tube wells draw groundwater. Over-pumping for farming, cutting forests and covering ground with concrete reduce recharge, so the water table falls — a serious problem in Haryana and Punjab. Rainwater harvesting, recharge pits, check dams and drip irrigation help.',
 real:'Many Haryana districts are "over-exploited" for groundwater; farmers now use drip irrigation.',
 apply:'Why does the water table fall in cities with lots of concrete?',
 see:{w:520,h:240,f:[
  ['Sun heats water: evaporation.',sun(60,40)+`<rect x="0" y="140" width="160" height="30" fill="${BL}" opacity=".5"/>`+arr(80,135,80,80,GR,1.8)],
  ['Clouds form; rain falls.',`<ellipse cx="260" cy="50" rx="60" ry="20" fill="#dfe6ee"/>`+[0,1,2,3].map(k=>`<line x1="${230+k*18}" y1="75" x2="${225+k*18}" y2="100" stroke="${BL}" stroke-width="2"/>`).join('')],
  ['Rain seeps down to groundwater.',`<rect x="160" y="140" width="360" height="100" fill="#c9a36a" opacity=".6"/><rect x="160" y="200" width="360" height="40" fill="${BL}" opacity=".45"/><line x1="160" y1="200" x2="520" y2="200" stroke="${BL}" stroke-dasharray="5 4"/>`+arr(260,145,260,195,BL,1.8)+`<rect x="420" y="110" width="10" height="100" fill="#666"/>`+lbl(340,195,'water table · जल स्तर','font-size="12"')+lbl(340,230,'aquifer · जलभृत','font-size="12"')]]},
 seeNote:'Recharge must balance pumping.',
 do:{title:'Recharge pit model',mat:'Plastic bottle, pebbles, sand, soil, water',steps:['Layer pebbles, sand, soil in a cut bottle.','Pour water; watch it seep down.'],obs:'Water collects at the bottom.',why:'Infiltration.',lab:false},
 memo:'"Rain in, pump out — keep them balanced."',
 miscon:['"Groundwater never runs out." It falls if pumped faster than recharged.'],
 terms:['Infiltration · अंतःस्यंदन','Groundwater · भौम जल','Water table · जल स्तर','Aquifer · जलभृत','Rainwater harvesting'],
 q:{q:'The upper level of groundwater is the:',o:['aquifer','water table','cloud','river bed'],a:1,why:'Definition.'},
 exam:'Groundwater depletion and conservation: 3 marks.'}
];

const CARDS=[['Heat flow','Hotter → colder.'],['Conduction · चालन','Through solids; particles stay in place.'],['Good conductors','Metals.'],['Insulators','Wood, plastic, wool, air.'],['Convection · संवहन','Liquids and gases; warm rises, cool sinks.'],['Sea breeze','Day: sea → land.'],['Land breeze','Night: land → sea.'],['Radiation · विकिरण','No medium needed; Sun\'s heat.'],['Colours','Dark absorbs; light reflects.'],['Groundwater','Infiltration; water table; aquifer.'],['Conserve','Rainwater harvesting, recharge pits, drip irrigation.']];

const Q=[
 {lv:1,q:'Heat flows from:',o:['cold to hot','hot to cold','both ways equally','nowhere'],a:1,w:'Hot → cold.'},
 {lv:1,q:'A good conductor of heat:',o:['wood','copper','plastic','wool'],a:1,w:'Metal.'},
 {lv:1,q:'Heat from the Sun reaches us by:',o:['conduction','convection','radiation','sea breeze'],a:2,w:'Radiation.'},
 {lv:2,q:'In convection, warm liquid:',o:['sinks','rises','stays still','freezes'],a:1,w:'Lighter.'},
 {lv:2,q:'Sea breeze blows during:',o:['night','day','winter only','never'],a:1,w:'Land hotter by day.'},
 {lv:2,q:'In summer, better to wear:',o:['black clothes','light-coloured clothes','woollens','plastic'],a:1,w:'Reflect heat.'},
 {lv:3,q:'Woollen clothes keep us warm because:',o:['they create heat','air trapped is a poor conductor','they are dark','they absorb cold'],a:1,w:'Trapped air.'},
 {lv:3,q:'Water seeping into soil is:',o:['evaporation','infiltration','condensation','radiation'],a:1,w:'Infiltration.'},
 {lv:4,q:'Why are ventilators placed high?',o:['for light','hot air rises and escapes','cold air rises','decoration'],a:1,w:'Convection.'},
 {lv:4,q:'Water table falls when:',o:['more recharge','pumping exceeds recharge','more forests','more rain'],a:1,w:'Balance.'},
 {lv:5,open:true,m:4,q:'Explain sea breeze and land breeze with reasons.',ans:['Land heats faster by day; air above rises (1)','Cooler sea air moves in — sea breeze (1)','Land cools faster at night; air above sea rises (1)','Cooler land air moves to sea — land breeze (1)']},
 {lv:5,open:true,m:3,q:'Give three ways to conserve groundwater.',ans:['Rainwater harvesting / recharge pits (1)','Drip/sprinkler irrigation; less waste (1)','Plant trees; reduce concrete; check dams (1)']}
];

const ONEMIN=['Heat flows hot → cold.','Conduction in solids; metals conduct, wool/air insulate.','Convection in fluids: warm rises.','Sea breeze by day, land breeze at night.','Radiation needs no medium; dark absorbs.','Water cycle; groundwater, water table, aquifer; conserve.'];
const KEYS=[['conduction',/conduct|चालन/i],['insulator',/insulat|wool|air/i],['convection',/convect|संवहन/i],['sea/land breeze',/breeze|समीर/i],['radiation',/radiat|विकिरण/i],['groundwater',/groundwater|water table|aquifer|भौम/i]];

/* ---------- lab ---------- */
const K={cu:['Copper',1.0],al:['Aluminium',0.7],fe:['Iron/steel',0.3],glass:['Glass',0.03],wood:['Wood',0.01],plastic:['Plastic',0.008]};
let mode='cond',mat='cu',t=0,run=false,raf=null,day=true,ph=0;
function stop(){run=false;if(raf)cancelAnimationFrame(raf);raf=null}
function vis(){const s=$('#tSvg');return s&&s.isConnected&&s.getClientRects().length}
function loop(){if(!run)return;if(!vis()){stop();return}t+=1;ph+=0.02;draw();raf=requestAnimationFrame(loop)}
function drawCond(){const k=K[mat][1];let s=T(230,24,K[mat][0]+' rod','font-size="15" font-weight="700"');const L=320,x0=80;
 const reach=Math.min(L,run||t?Math.sqrt(t*k)*28:0);s+=`<defs><linearGradient id="tg" x1="0" x2="1"><stop offset="0" stop-color="${RD}"/><stop offset="1" stop-color="${RD}" stop-opacity="0"/></linearGradient></defs>`;
 const col={cu:'#c46a3a',al:'#c9d1d8',fe:'#8d969c',glass:'#cfe8ef',wood:'#a0703a',plastic:'#4ab0d9'}[mat];s+=`<rect x="${x0}" y="120" width="${L}" height="16" rx="3" fill="${col}" stroke="${ink}" stroke-width=".6"/>`+(reach>0?`<rect x="${x0}" y="120" width="${reach}" height="16" fill="url(#tg)" opacity=".7"/>`:'');
 let fallen=0;[0,1,2,3,4].forEach(i=>{const px=x0+40+i*65;const f=reach>px-x0+10;if(f)fallen++;s+=f?`<rect x="${px}" y="250" width="22" height="6" fill="#f4e7b5" stroke="${ink}" stroke-width=".5"/>`:`<rect x="${px}" y="136" width="6" height="24" fill="#f4e7b5" stroke="${ink}" stroke-width=".5"/>`});
 s+=flame(x0+10,200,1.2)+`<line x1="40" y1="258" x2="420" y2="258" stroke="${GR}"/>`+T(230,290,`Time: ${(t/30).toFixed(0)} s · pins fallen: ${fallen}/5`,'font-size="13"');
 $('#tSvg').innerHTML=s;if(t>0)$('#tOut').innerHTML=fallen===5?`<p class="fb ok">All pins fell in about ${(t/30).toFixed(0)} s: ${K[mat][0]} is a good conductor.</p>`:t>900?`<p class="fb no">${K[mat][0]} conducts heat very poorly (an insulator): pins hardly fall.</p>`:'<p>Heating…</p>';if(fallen===5||t>900)stop()}
function drawConv(){let s=T(230,24,'Convection in water','font-size="15" font-weight="700"');s+=`<path d="M120 50 v200 a14 14 0 0 0 14 14 h192 a14 14 0 0 0 14 -14 v-200" fill="none" stroke="${ink}" stroke-width="2"/><rect x="122" y="70" width="216" height="192" fill="${LB}" opacity=".45"/>`+(run||t?flame(170,305,1.1):'');
 if(run||t){for(let i=0;i<22;i++){const u=((ph*0.6+i/22)%1);let x,y;const W=170,H=170,cx=230,cy=166;// loop rectangle path
  const p=u*4;if(p<1){x=170;y=250-p*H}else if(p<2){x=170+(p-1)*(W-30);y=80}else if(p<3){x=310;y=80+(p-2)*H}else{x=310-(p-3)*(W-30);y=250}
  s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#8e44ad" opacity="${0.35+0.5*(1-Math.abs((p%2)-1))}"/>`}
  s+=arr(150,230,150,110,RD)+arr(330,110,330,230,BL)+T(150,100,'warm rises','font-size="11" fill="'+RD+'"')+T(330,250,'cool sinks','font-size="11" fill="'+BL+'"')}
 $('#tSvg').innerHTML=s;$('#tOut').innerHTML=run||t?'<p class="fb ok">The purple colour rises above the flame, spreads at the top and sinks on the other side: a convection current carries heat round the whole beaker.</p>':'<p>Press Start to heat from below one side.</p>'}
function drawBreeze(){let s='';s+=day?`<rect x="0" y="0" width="460" height="320" fill="#e8f4fd"/>`+sun(400,40):`<rect x="0" y="0" width="460" height="320" fill="#1b2340"/><circle cx="400" cy="40" r="16" fill="#eee"/>`;
 s+=`<rect x="0" y="230" width="220" height="90" fill="${BL}" opacity=".6"/><path d="M220 230 L460 210 V320 H220z" fill="#c9a36a"/>`+T(110,280,day?'sea (cooler)':'sea (warmer)','font-size="12" fill="#fff"')+T(340,280,day?'land (hotter)':'land (cooler)','font-size="12"');
 const k=(ph*40)%60;if(day){s+=arr(330,200,330,100,RD)+arr(320,80,120,80,GR,1.8)+arr(110,90,110,190,GR,1.8);for(let i=0;i<4;i++){const x=40+((i*60+k*2)%220);s+=arr(x,205,x+28,205,'#fff',2)}}
 else{s+=arr(110,200,110,100,RD)+arr(120,80,320,80,GR,1.8)+arr(330,90,330,190,GR,1.8);for(let i=0;i<4;i++){const x=420-((i*60+k*2)%220);s+=arr(x,200,x-28,200,'#fff',2)}}
 s+=T(230,30,day?'Day: sea breeze · समुद्री समीर':'Night: land breeze · स्थलीय समीर',`font-size="15" font-weight="700" fill="${day?'#222':'#fff'}"`);
 $('#tSvg').innerHTML=s;$('#tOut').innerHTML=day?'<p>By day, land heats faster. Warm air over land rises; cooler air from the sea flows in: <b>sea breeze</b>.</p>':'<p>At night, land cools faster. Air over the warmer sea rises; cooler air from land flows out: <b>land breeze</b>.</p>'}
function drawRad(){const temp=b=>(30+Math.min(t,600)/600*(b?14:6)).toFixed(1);let s=sun(230,40,24);
 s+=arr(210,70,130,150,OR)+arr(250,70,330,150,OR)+`<rect x="90" y="160" width="80" height="110" rx="8" fill="#222"/><rect x="290" y="160" width="80" height="110" rx="8" fill="#fff" stroke="${ink}"/>`+(t?arr(320,155,380,100,OR,1.5):'');
 s+=T(130,300,`black can: ${temp(1)} °C`,'font-size="13" font-weight="700"')+T(330,300,`white can: ${temp(0)} °C`,'font-size="13" font-weight="700"');
 $('#tSvg').innerHTML=s;$('#tOut').innerHTML=t?`<p class="fb ok">After ${(Math.min(t,600)/10).toFixed(0)} minutes (simulated), the black can is hotter: dark colours absorb more radiation; white reflects more.</p>`:'<p>Press Start to put both cans in the sun (both start at 30 °C).</p>';if(t>=600)stop()}
function draw(){mode==='cond'?drawCond():mode==='conv'?drawConv():mode==='breeze'?drawBreeze():drawRad()}
function labShow(){draw();if(mode==='breeze'||((mode==='conv')&&t)){if(!run){run=true;loop()}}else if(t===0)$('#tOut').innerHTML='<p>Press Start / heat.</p>'}
function labInit(){}
function labClick(b){if(b.id==='tGo'){if(!run){run=true;loop()}return true}if(b.id==='tReset'){stop();t=0;ph=0;draw();if(mode==='breeze'){run=true;loop()}return true}if(b.id==='tDN'){mode='breeze';$('#tMode').value='breeze';day=!day;draw();if(!run){run=true;loop()}return true}return false}
function labChange(x){if(x.id==='tMode'){stop();mode=x.value;t=0;ph=0;draw();if(mode==='breeze'){run=true;loop()}else $('#tOut').innerHTML='<p>Press Start / heat.</p>';return true}if(x.id==='tMat'){stop();mat=x.value;mode='cond';$('#tMode').value='cond';t=0;draw();$('#tOut').innerHTML='<p>Press Start / heat.</p>';return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
