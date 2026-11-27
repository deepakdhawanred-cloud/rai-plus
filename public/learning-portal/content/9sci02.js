/* Rai Plus content pack: Class 9 Science, Chapter 2 – Is Matter Around Us Pure? (rationalised NCERT: separation methods dropped). Bilingual: Hindi terms alongside. */
RP.register({key:'9sci02',cls:'9',subject:'Science',ch:'2',title:"Is Matter Around Us Pure?",color:'#1f5f8b',
crumb:"HBSE Class 9 Science · क्या हमारे आस-पास के पदार्थ शुद्ध हैं? · Taught in May",h1:"Chapter 2: Is Matter Around Us Pure? · क्या हमारे आस-पास के पदार्थ शुद्ध हैं?",sub:"Pure substances and mixtures, solutions and their concentration, suspensions, colloids and the Tyndall effect, physical and chemical changes, elements and compounds.",heroLabel:"A torch beam through a solution and a colloid",labName:'Mixtures lab',
theme:"\n:root{--g:light-dark(#1f5f8b,#8cc4ea);--g2:light-dark(#eaf3fa,#081520);--line:light-dark(#cde1f0,#22394b);--bg:light-dark(#ffffff,#08111a);--card:light-dark(#ffffff,#0e1822);\n--ink:light-dark(#0f2233,#e2eef7);--mute:light-dark(#4a6075,#aac0d2);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#174a6d}\n",
labHTML:`  <h2>Mixtures lab · मिश्रण प्रयोगशाला</h2>
  <p><b>Concentration:</b> dissolve potassium nitrate in water and find when the solution becomes saturated. Warming lets more dissolve. <b>Torch test:</b> shine a beam through different mixtures and see which scatter light (Tyndall effect), which settle and which pass through filter paper.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="mxSvg" viewBox="0 0 520 320" role="img" aria-label="Mixtures experiment" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Experiment<select id="mxM"><option value="c">Concentration &amp; saturation · सांद्रता</option><option value="t">Torch test · टिंडल प्रभाव</option></select></label></div>
  <div id="mxC"><div class="ctrl"><label><span>Solute (KNO₃): <b id="mxSv"></b> g</span><input type="range" class="mxS" id="mxS" min="0" max="150" value="40"></label></div>
  <div class="ctrl"><label><span>Water: <b id="mxWv"></b> g</span><input type="range" class="mxS" id="mxW" min="50" max="200" step="10" value="100"></label></div>
  <div class="ctrl"><label><span>Temperature: <b id="mxTv"></b> °C</span><input type="range" class="mxS" id="mxT" min="10" max="80" step="5" value="20"></label></div></div>
  <div id="mxTc" style="display:none"><div class="ctrl"><label>Mixture<select id="mxK"><option value="salt">Salt in water</option><option value="sugar">Sugar in water</option><option value="milk">Milk in water</option><option value="starch">Starch solution</option><option value="chalk">Chalk powder in water</option><option value="mud">Muddy water</option></select></label></div></div>
  <div class="box y" id="mxOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#1f5f8b',LABNAME='Mixtures lab',MIND_CENTER='Pure? · शुद्ध?';
const BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',YL='#d9a21b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-4:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+13,sub,'font-size="10.5"'):'');
const beaker=(x,y,w,h,fill,op=.3)=>`<path d="M${x} ${y} v${h} q0 8 8 8 h${w-16} q8 0 8 -8 v${-h}" fill="none" stroke="${ink}" stroke-width="2"/><rect x="${x+2}" y="${y+h*.3}" width="${w-4}" height="${h*.7+6}" fill="${fill}" fill-opacity="${op}"/>`;
function heroDraw(){return `<rect x="20" y="58" width="40" height="22" rx="4" fill="#fff"/><path d="M60 62 L330 50 L330 90 L60 76 Z" fill="#fff" opacity=".18"/><rect x="120" y="30" width="70" height="80" rx="6" fill="none" stroke="#fff" stroke-width="2"/><rect x="230" y="30" width="70" height="80" rx="6" fill="none" stroke="#fff" stroke-width="2"/><path d="M230 58 L300 55 L300 80 L230 76 Z" fill="#fff" opacity=".7"/>`}
const HERO=heroDraw;
const MIND=[['Mixtures · मिश्रण',100,50],['Solutions · विलयन',420,50],['Suspensions · निलंबन',90,150],['Colloids · कोलॉइड',430,150],['Changes · परिवर्तन',110,250],['Elements & compounds',410,250]];

const C=[
{id:'p1',num:'2.1',title:'Pure substances and mixtures · शुद्ध पदार्थ और मिश्रण',
 intro:'The milk packet says "pure". To a scientist, is milk pure?',
 obj:'Distinguish pure substances from mixtures, and homogeneous from heterogeneous mixtures.',
 prior:'Chapter 1; Class 6 separation of substances.',
 simple:'In science, a pure substance (शुद्ध पदार्थ) contains only one kind of particle and has the same composition throughout (water, sugar, gold). A mixture (मिश्रण) contains two or more substances mixed in any proportion, each keeping its own properties. Milk, air, soil and sea water are mixtures.',
 detail:'A homogeneous mixture (समांगी) has a uniform composition throughout — salt in water, air, brass. A heterogeneous mixture (विषमांगी) has visibly different parts or non-uniform composition — sand and water, oil and water, soil. Mixtures can be separated by physical methods because the components keep their own properties.',
 real:'"Pure ghee" in advertising means unadulterated, not chemically pure.',
 apply:'Classify: soda water, wood, air, soil, vinegar, tap water.',
 see:{w:520,h:230,f:[
  ['Matter splits into two kinds.',box(190,20,140,40,'Matter · पदार्थ',GR)+`<path d="M230 60 L130 95 M290 60 L390 95" stroke="${GR}" stroke-width="2"/>`],
  ['Pure substance: one kind of particle.',box(40,95,180,44,'Pure substance',BL,'one kind of particle')],
  ['Mixture: homogeneous or heterogeneous.',box(300,95,180,44,'Mixture · मिश्रण',OR,'two or more substances')+`<path d="M350 139 L300 170 M430 139 L470 170" stroke="${OR}" stroke-width="2"/>`+box(220,170,140,44,'Homogeneous',OR,'salt water')+box(380,170,130,44,'Heterogeneous',OR,'sand + water')]]},
 seeNote:'The classification tree.',
 do:{title:'Mix and look',mat:'Salt, sand, water, glasses',steps:['Stir salt into one glass, sand into another.','Look closely after 2 minutes.'],obs:'Salt: uniform; sand: settles.',why:'Homogeneous vs heterogeneous.',lab:false},
 memo:'"One kind = pure; many kinds = mixture."',
 miscon:['"Pure milk is a pure substance." Milk is a mixture of water, fat, proteins and more.'],
 terms:['Pure substance · शुद्ध पदार्थ','Mixture · मिश्रण','Homogeneous · समांगी','Heterogeneous · विषमांगी'],
 q:{q:'Which is a homogeneous mixture?',o:['sand in water','salt in water','oil in water','soil'],a:1,why:'Uniform composition.'},
 exam:'Classify substances; define mixture types: 2 marks.'},

{id:'p2',num:'2.2',title:'Solutions and concentration · विलयन और सांद्रता',
 intro:'Two glasses of nimbu-pani: one tastes much sweeter. How do we put a number on "sweeter"?',
 obj:'Describe solutions and calculate concentration.',
 prior:'2.1; percentages.',
 simple:'A solution (विलयन) is a homogeneous mixture. The substance that dissolves is the solute (विलेय); the substance it dissolves in is the solvent (विलायक). Concentration = (mass of solute ÷ mass of solution) × 100%, where mass of solution = mass of solute + mass of solvent.',
 detail:'Solutions can be solid (alloys like brass), liquid (sugar in water, soda water) or gaseous (air). Particles in a solution are smaller than 1 nm, cannot be seen, do not scatter light and do not settle. A saturated solution (संतृप्त विलयन) cannot dissolve more solute at that temperature; the amount that dissolves in a saturated solution is the solubility (विलेयता). Solubility of most solids increases with temperature. Concentration can also be mass by volume.',
 real:'ORS packets give a set concentration of salt and sugar for treating dehydration.',
 apply:'40 g of common salt is dissolved in 320 g of water. Find the concentration.',
 see:{w:520,h:220,f:[
  ['Solute + solvent.',lbl(130,50,'solute · विलेय','font-size="15" fill="'+OR+'"')+lbl(390,50,'solvent · विलायक','font-size="15" fill="'+BL+'"')+lbl(260,50,'+','font-size="20"')],
  ['= solution.',lbl(260,105,'= solution · विलयन (homogeneous)','font-size="15" font-weight="700"')],
  ['Concentration formula.',lbl(260,160,'concentration = mass of solute ÷ mass of solution × 100%','font-size="14" fill="'+BL+'"')+lbl(260,192,'40 g in 320 g water → 40 ÷ 360 × 100 ≈ 11.1%','font-size="13"')]]},
 seeNote:'Divide by the whole solution, not the solvent.',
 do:{title:'Saturate it',mat:'Salt, water, spoon, beaker, warm water',steps:['Add salt spoon by spoon until no more dissolves.','Warm it and try again.'],obs:'More dissolves when warm.',why:'Solubility rises with temperature.',lab:true},
 memo:'"Solute in solvent makes a solution; divide by the whole."',
 miscon:['"Concentration = solute ÷ solvent." Divide by the mass of the whole solution.'],
 terms:['Solution · विलयन','Solute · विलेय','Solvent · विलायक','Saturated · संतृप्त','Solubility · विलेयता','Alloy · मिश्रधातु'],
 q:{q:'20 g sugar in 80 g water. Concentration:',o:['25%','20%','80%','16%'],a:1,why:'20 ÷ 100 × 100.'},
 exam:'Concentration numericals; saturation and solubility: 3 marks.'},

{id:'p3',num:'2.3',title:'Suspensions · निलंबन',
 intro:'Shake chalk powder in water: it looks milky, but leave it for an hour. What happens?',
 obj:'Describe the properties of suspensions.',
 prior:'2.2.',
 simple:'A suspension (निलंबन) is a heterogeneous mixture in which solid particles are spread through a liquid but do not dissolve. The particles can be seen with the naked eye, settle down when left undisturbed, can be separated by filtration, and scatter a beam of light so its path is visible.',
 detail:'Suspensions are unstable: as particles settle, the suspension breaks and no longer scatters light. Examples: chalk in water, muddy water, flour in water, sand in water. Medicines labelled "shake well before use" are often suspensions.',
 real:'Muddy river water is cleared in treatment plants by letting particles settle.',
 apply:'Why do some syrups say "shake well before use"?',
 see:{w:520,h:220,f:[
  ['Freshly stirred: cloudy.',beaker(90,50,100,130,GR,.35)+[...Array(24)].map((_,i)=>`<circle cx="${100+(i*37)%80}" cy="${100+(i*53)%70}" r="3" fill="${GR}"/>`).join('')+lbl(140,205,'just stirred')],
  ['After some time: settled.',beaker(320,50,100,130,BL,.12)+[...Array(24)].map((_,i)=>`<circle cx="${330+(i*37)%80}" cy="${180-(i%3)*5}" r="3" fill="${GR}"/>`).join('')+lbl(370,205,'particles settle')],
  ['Visible, settle, filterable.',lbl(260,30,'suspension: particles visible · settle · filter out','font-weight="700"')]]},
 seeNote:'Unstable — it settles.',
 do:{title:'Settle test',mat:'Chalk, water, glass',steps:['Stir chalk into water.','Leave undisturbed for 30 minutes.'],obs:'Chalk settles at the bottom.',why:'Particles are large.',lab:true},
 memo:'"Suspension sinks."',
 miscon:['"A cloudy liquid is always a solution." A solution is clear; cloudiness means a suspension or colloid.'],
 terms:['Suspension · निलंबन','Filtration · निस्यंदन','Sediment · अवसाद'],
 q:{q:'Which is a suspension?',o:['salt water','chalk in water','air','brass'],a:1,why:'Particles settle.'},
 exam:'Properties of suspensions: 2 marks.'},

{id:'p4',num:'2.4',title:'Colloids and the Tyndall effect · कोलॉइड और टिंडल प्रभाव',
 intro:'Sunlight streams through a gap in a dusty room or a misty forest. Why can we see the beams?',
 obj:'Describe colloids, their components and the Tyndall effect.',
 prior:'2.2, 2.3.',
 simple:'A colloid (कोलॉइड) is a mixture whose particles are too small to see or settle, but big enough to scatter light. The scattering of light by colloid particles is the Tyndall effect (टिंडल प्रभाव). Colloids look homogeneous but are actually heterogeneous; they cannot be separated by ordinary filtration (centrifugation can separate them).',
 detail:'A colloid has a dispersed phase (परिक्षिप्त प्रावस्था — the particles) and a dispersion medium (परिक्षेपण माध्यम — what they are spread in). Types: fog and mist (liquid in gas, aerosol), smoke (solid in gas), milk (liquid in liquid, emulsion), shaving cream (gas in liquid, foam), jelly and cheese (liquid in solid, gel), coloured gemstones (solid in solid). Particle size: solution < 1 nm, colloid 1–1000 nm, suspension > 1000 nm.',
 real:'Headlight beams on a foggy Haryana winter night are visible because of the Tyndall effect.',
 apply:'Name the dispersed phase and dispersion medium in fog, milk and smoke.',
 see:{w:520,h:220,f:[
  ['A torch and two beakers.',`<rect x="20" y="100" width="40" height="24" rx="4" fill="${YL}"/>`+beaker(140,50,100,130,BL,.12)+beaker(330,50,100,130,GR,.3)+lbl(190,205,'salt solution')+lbl(380,205,'milk in water (colloid)')],
  ['Solution: beam invisible.',`<path d="M60 108 L140 108 L140 116 L60 116 Z" fill="${YL}" opacity=".6"/>`],
  ['Colloid: beam visible.',`<path d="M240 108 L330 106 L430 102 L430 122 L330 118 L240 116 Z" fill="${YL}" opacity=".5"/>`+`<path d="M330 106 L430 102 L430 122 L330 118 Z" fill="${YL}" opacity=".9"/>`+lbl(380,40,'Tyndall effect','font-weight="700" fill="'+OR+'"')]]},
 seeNote:'Colloid particles scatter light.',
 do:{title:'Torch test',mat:'Torch, glasses of salt water, milk-water, starch solution',steps:['Darken the room; shine the torch from the side.','Look for the beam\'s path.'],obs:'Beam visible in milk and starch, not salt water.',why:'Tyndall effect.',lab:true},
 memo:'"Solutions hide the beam; colloids show it."',
 miscon:['"Colloids are solutions because they look clear." They scatter light, so they are heterogeneous.'],
 terms:['Colloid · कोलॉइड','Tyndall effect · टिंडल प्रभाव','Dispersed phase · परिक्षिप्त प्रावस्था','Dispersion medium · परिक्षेपण माध्यम','Emulsion · पायस','Aerosol · एरोसोल'],
 q:{q:'Fog is an example of:',o:['solid in gas','liquid in gas','gas in liquid','liquid in liquid'],a:1,why:'Water droplets in air.'},
 exam:'Solution vs colloid vs suspension table: 3–5 marks.'},

{id:'p5',num:'2.5',title:'Physical and chemical changes · भौतिक और रासायनिक परिवर्तन',
 intro:'Ice melting and wood burning both change something. Which change makes a new substance?',
 obj:'Distinguish physical and chemical properties and changes.',
 prior:'Class 7 Ch: Changes around us.',
 simple:'A physical change (भौतिक परिवर्तन) changes properties like shape, size or state, but no new substance forms — melting ice, dissolving sugar, cutting paper. A chemical change (रासायनिक परिवर्तन) produces new substances with new properties — burning, rusting, cooking, digestion.',
 detail:'Physical properties: colour, hardness, density, melting and boiling point. Chemical properties describe how a substance reacts (e.g. burns, rusts). When a candle burns, both happen: wax melting is physical; wax burning to carbon dioxide and water is chemical. Interconversion of states is a physical change.',
 real:'Making curd from milk is a chemical change; boiling milk is physical.',
 apply:'Classify: growth of a plant, rusting, freezing water, burning paper, dissolving salt, cooking an egg.',
 see:{w:520,h:220,f:[
  ['Physical: same substance.',box(40,50,200,60,'Physical change',BL,'ice ⇄ water, no new substance')],
  ['Chemical: new substance.',box(280,50,200,60,'Chemical change',OR,'wood → ash + CO₂ + heat')],
  ['Candle: both.',lbl(260,160,'burning candle: wax melts (physical) + wax burns (chemical)','font-size="13" font-weight="700"')]]},
 seeNote:'New substance? Then chemical.',
 do:{title:'Candle watch',mat:'Candle, matchbox, glass plate (with care)',steps:['Light a candle; watch the wax.','Hold a cold plate above (carefully).'],obs:'Melted wax; soot and water droplets.',why:'Both kinds of change.',lab:false},
 memo:'"New stuff = chemical; same stuff = physical."',
 miscon:['"Every change you cannot reverse is chemical." Breaking glass is irreversible but physical.'],
 terms:['Physical change · भौतिक परिवर्तन','Chemical change · रासायनिक परिवर्तन','Physical property','Chemical property'],
 q:{q:'Which is a chemical change?',o:['melting wax','dissolving salt','rusting of iron','breaking glass'],a:2,why:'New substance: iron oxide.'},
 exam:'Classify changes with reasons: 2–3 marks.'},

{id:'p6',num:'2.6',title:'Elements and compounds · तत्व और यौगिक',
 intro:'Heat iron filings with sulphur, and a magnet no longer picks out the iron. What happened?',
 obj:'Define elements and compounds; compare compounds with mixtures.',
 prior:'2.1, 2.5.',
 simple:'An element (तत्व) is the basic form of matter that cannot be broken into simpler substances by chemical reactions (iron, oxygen, carbon). A compound (यौगिक) is formed when two or more elements combine chemically in a fixed proportion (water H₂O, iron sulphide FeS). A compound has properties different from its elements.',
 detail:'Elements are metals (lustrous, malleable, ductile, good conductors, sonorous — iron, copper), non-metals (dull, brittle, poor conductors — carbon, sulphur, oxygen) and metalloids with intermediate properties (boron, silicon, germanium). Iron + sulphur mixture: magnet separates iron, any proportion, no heat change. Heated: iron sulphide forms — fixed proportion, magnet does not attract, energy given out, new properties; with dilute acid it gives a gas with rotten-egg smell (H₂S) instead of hydrogen.',
 real:'Table salt (NaCl) is made of a poisonous metal and a poisonous gas, yet it is safe to eat.',
 apply:'List three differences between a mixture of iron and sulphur and iron sulphide.',
 see:{w:520,h:230,f:[
  ['Pure substances: elements and compounds.',box(185,15,150,40,'Pure substance',BL)+`<path d="M220 55 L130 85 M300 55 L390 85" stroke="${BL}" stroke-width="2"/>`],
  ['Elements: metals, non-metals, metalloids.',box(30,85,200,44,'Element · तत्व',GN,'one type of atom')+box(20,160,70,40,'Metal',GN)+box(95,160,70,40,'Non-metal',GN)+box(170,160,70,40,'Metalloid',GN)],
  ['Compound: elements combined chemically.',box(290,85,200,44,'Compound · यौगिक',OR,'fixed proportion, new properties')+lbl(390,180,'Fe + S → FeS','font-size="16" font-weight="700" fill="'+OR+'"')]]},
 seeNote:'Combine chemically → compound.',
 do:{title:'Iron and sulphur',mat:'Iron filings, sulphur powder, magnet, test tube (teacher demo)',steps:['Test the mixture with a magnet.','Teacher heats it; test the product with a magnet.'],obs:'Mixture: iron attracted; product: not.',why:'Compound formed.',lab:false},
 memo:'"Elements alone, compounds bonded, mixtures just mingled."',
 miscon:['"A compound keeps the properties of its elements." It has completely new properties.'],
 terms:['Element · तत्व','Compound · यौगिक','Metal · धातु','Non-metal · अधातु','Metalloid · उपधातु'],
 q:{q:'Which is a compound?',o:['air','brass','water','oxygen'],a:2,why:'H and O combined in fixed ratio.'},
 exam:'Mixture vs compound table: 3 marks.'}
];

const CARDS=[['Pure substance · शुद्ध पदार्थ','One kind of particle, same composition throughout.'],['Mixture · मिश्रण','Two or more substances, any proportion, keep properties.'],['Homogeneous','Uniform composition: salt water, air.'],['Heterogeneous','Non-uniform: sand + water.'],['Concentration','Mass of solute ÷ mass of solution × 100.'],['Saturated solution','Cannot dissolve more at that temperature.'],['Solubility · विलेयता','Amount dissolving in 100 g solvent at saturation.'],['Suspension · निलंबन','Visible particles; settle; filterable.'],['Colloid · कोलॉइड','1–1000 nm particles; Tyndall effect; do not settle.'],['Tyndall effect','Scattering of light by colloid particles.'],['Physical vs chemical','No new substance vs new substance.'],['Element · तत्व','Cannot be broken down chemically.'],['Compound · यौगिक','Elements combined chemically in fixed ratio.'],['Metalloids','Boron, silicon, germanium.']];

const Q=[
 {lv:1,q:'Which is a pure substance?',o:['milk','air','sugar','soil'],a:2,w:'One kind of particle.'},
 {lv:1,q:'The substance that dissolves is the:',o:['solvent','solute','solution','colloid'],a:1,w:'Definition.'},
 {lv:1,q:'Scattering of light by colloid particles is called:',o:['reflection','Tyndall effect','refraction','dispersion'],a:1,w:'Definition.'},
 {lv:2,q:'Brass is a:',o:['compound','element','homogeneous mixture','suspension'],a:2,w:'Alloy of copper and zinc.'},
 {lv:2,q:'Milk is an example of:',o:['foam','emulsion','gel','aerosol'],a:1,w:'Liquid in liquid.'},
 {lv:2,q:'Which is a metalloid?',o:['sodium','silicon','sulphur','copper'],a:1,w:'Intermediate properties.'},
 {lv:3,q:'10 g salt in 90 g water. Concentration:',o:['11.1%','10%','90%','9%'],a:1,w:'10 ÷ 100 × 100.'},
 {lv:3,q:'Particles of a suspension:',o:['pass through filter paper','settle on standing','are smaller than 1 nm','never scatter light'],a:1,w:'Large, unstable.'},
 {lv:4,q:'62 g KNO₃ saturates 100 g water at 40 °C. Mass needed for 50 g water at 40 °C:',o:['31 g','62 g','124 g','12 g'],a:0,w:'Half.'},
 {lv:4,q:'Iron sulphide differs from an iron–sulphur mixture because it:',o:['is attracted by a magnet','has a fixed composition','can have any ratio','keeps iron\'s properties'],a:1,w:'Compound.'},
 {lv:5,open:true,m:3,q:'Differentiate between a solution, a colloid and a suspension on the basis of particle size, Tyndall effect and stability.',ans:['Size: <1 nm, 1–1000 nm, >1000 nm (1)','Tyndall: no, yes, yes (1)','Stability: stable, stable, unstable/settles (1)']},
 {lv:5,open:true,m:5,q:'A solution contains 40 g of sugar in 320 g of water. Calculate its concentration. Explain what a saturated solution is and how temperature affects solubility.',ans:['Mass of solution = 360 g (1)','Concentration = 40 ÷ 360 × 100 ≈ 11.1% (1)','Saturated: no more solute dissolves at that temperature (1)','Solubility of solids usually increases with temperature (1)','Example or reason (1)']}
];

const ONEMIN=['Pure substance vs mixture; homo/heterogeneous.','Solution: solute + solvent; concentration %.','Suspension: visible, settles, filters.','Colloid: Tyndall effect; phase and medium.','Physical vs chemical change.','Elements (metal, non-metal, metalloid) and compounds.'];
const KEYS=[['mixture',/mixture|मिश्रण/i],['solution',/solution|concentration|विलयन/i],['suspension',/suspension|निलंबन/i],['colloid',/colloid|tyndall|कोलॉइड/i],['change',/physical|chemical|परिवर्तन/i],['element/compound',/element|compound|तत्व|यौगिक/i]];

/* ---------- lab ---------- */
const SOL=[[10,21],[20,32],[30,46],[40,62],[50,85],[60,110],[70,138],[80,169]];
const solub=t=>{for(let i=0;i<SOL.length-1;i++){const [a,sa]=SOL[i],[b,sb]=SOL[i+1];if(t<=b)return sa+(sb-sa)*(t-a)/(b-a)}return 169};
const MIX={salt:{n:'Salt in water',k:'Solution · विलयन',c:BL,op:.12,tyn:false,set:false,fil:true,size:'< 1 nm'},sugar:{n:'Sugar in water',k:'Solution · विलयन',c:BL,op:.12,tyn:false,set:false,fil:true,size:'< 1 nm'},
 milk:{n:'Milk in water',k:'Colloid (emulsion) · कोलॉइड',c:'#d8d2c0',op:.75,tyn:true,set:false,fil:true,size:'1–1000 nm'},starch:{n:'Starch solution',k:'Colloid (sol) · कोलॉइड',c:'#cfd8e0',op:.45,tyn:true,set:false,fil:true,size:'1–1000 nm'},
 chalk:{n:'Chalk powder in water',k:'Suspension · निलंबन',c:GR,op:.4,tyn:true,set:true,fil:false,size:'> 1000 nm'},mud:{n:'Muddy water',k:'Suspension · निलंबन',c:'#8a6a3a',op:.55,tyn:true,set:true,fil:false,size:'> 1000 nm'}};
let mode='c',S=40,W=100,TT=20,K='milk',wired=false;
function drawC(){const sol=solub(TT)*W/100,dis=Math.min(S,sol),und=S-dis,conc=S?dis/(dis+W)*100:0;let g='';
 g+=beaker(140,60,200,200,BL,.08+Math.min(.45,conc/80));
 const n=Math.round(und/3);for(let i=0;i<n;i++)g+=`<rect x="${150+(i*23)%180}" y="${258-Math.floor(i/8)*6}" width="6" height="5" fill="#f4f4f4" stroke="${GR}"/>`;
 g+=`<rect x="380" y="70" width="14" height="190" rx="7" fill="none" stroke="${ink}"/><rect x="383" y="${260-TT*2.2}" width="8" height="${TT*2.2}" rx="4" fill="${OR}"/>`+T(387,60,TT+' °C','font-size="12"');
 g+=T(240,40,und>0.5?'Saturated · संतृप्त':'Unsaturated · असंतृप्त','font-size="16" font-weight="700" fill="'+(und>0.5?OR:GN)+'"');
 g+=T(240,300,`dissolved ${dis.toFixed(0)} g of ${S} g`,'font-size="13"');
 $('#mxSvg').innerHTML=g;$('#mxSv').textContent=S;$('#mxWv').textContent=W;$('#mxTv').textContent=TT;
 $('#mxOut').innerHTML=`<p>Solubility of KNO₃ at ${TT} °C ≈ <b>${solub(TT).toFixed(0)} g</b> per 100 g water, so ${W} g water can dissolve up to <b>${sol.toFixed(0)} g</b>.</p><p>Concentration = ${dis.toFixed(0)} ÷ (${dis.toFixed(0)} + ${W}) × 100 = <b>${conc.toFixed(1)}%</b>.</p><p>${und>0.5?`${und.toFixed(0)} g stays undissolved at the bottom. Warm the water to dissolve more.`:'All the solute dissolved. Add more to reach saturation.'}</p>`}
function drawT(){const m=MIX[K];let g=`<rect x="10" y="132" width="50" height="26" rx="5" fill="${YL}"/><circle cx="60" cy="145" r="6" fill="#fff6c8"/>`;
 g+=beaker(170,60,170,200,m.c,m.op);
 if(m.set){g+=[...Array(30)].map((_,i)=>`<circle cx="${180+(i*41)%150}" cy="${262-(i%3)*5}" r="3" fill="${m.c}"/>`).join('')}
 g+=`<path d="M66 140 L170 138 L170 152 L66 150 Z" fill="${YL}" opacity=".35"/>`;
 if(m.tyn)g+=`<path d="M172 138 L338 134 L338 156 L172 152 Z" fill="${YL}" opacity=".85"/>`;
 g+=`<path d="M340 140 L510 134 L510 156 L340 150 Z" fill="${YL}" opacity="${m.tyn?.2:.35}"/>`;
 g+=T(255,40,m.k,'font-size="15" font-weight="700" fill="'+(m.tyn?OR:BL)+'"')+T(255,300,m.tyn?'beam path visible inside':'beam path not visible inside','font-size="13"');
 $('#mxSvg').innerHTML=g;
 $('#mxOut').innerHTML=`<p><b>${m.n}</b> is a <b>${m.k}</b>. Particle size ${m.size}.</p><p>Tyndall effect: <b>${m.tyn?'yes':'no'}</b> · settles on standing: <b>${m.set?'yes':'no'}</b> · particles pass through filter paper: <b>${m.fil?'yes':'no'}</b>.</p>`}
function draw(){$('#mxC').style.display=mode==='c'?'':'none';$('#mxTc').style.display=mode==='t'?'':'none';mode==='c'?drawC():drawT()}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const t=e.target;if(!t||!t.classList||!t.classList.contains('mxS'))return;const v=+t.value;if(t.id==='mxS')S=v;else if(t.id==='mxW')W=v;else TT=v;drawC()})}
function labClick(){return false}
function labChange(t){if(t.id==='mxM'){mode=t.value;draw();return true}if(t.id==='mxK'){K=t.value;drawT();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
