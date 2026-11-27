/* Rai Plus content pack: Class 12 Biology, Chapter 12 – Ecosystem (rationalised scope) */
RP.register({key:'12bio12',cls:'12',subject:'Biology',ch:'12',title:"Ecosystem",color:'#3f6b2a',
crumb:"HBSE Class 12 Biology · Unit: Ecology · Taught in December",h1:"Chapter 12: Ecosystem",sub:"How living things and their surroundings work as one unit: productivity, decomposition, energy flow and ecological pyramids.",heroLabel:"A pond with sun, plants, consumers and decomposers, and an energy pyramid",labName:'Energy flow lab',
theme:"\n:root{--g:light-dark(#3f6b2a,#b0d895);--g2:light-dark(#eef5e8,#121b0d);--line:light-dark(#d4e6c6,#2c3d22);--bg:light-dark(#ffffff,#0b1008);--card:light-dark(#ffffff,#10170c);\n--ink:light-dark(#131c0d,#e7f0df);--mute:light-dark(#566749,#adc09f);--y:light-dark(#b3541e,#f2a774);--y2:light-dark(#fbeee4,#2a170a);--hd:#2c4b1d}\n",
labHTML:`  <h2>Energy flow lab</h2>
  <div class="ctrl"><label>Activity<select id="eMode"><option value="flow">Energy through a food chain</option><option value="pyr">Pyramids in different ecosystems</option></select></label></div>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="eSvg" viewBox="0 0 480 340" role="img" aria-label="Ecological pyramid" style="color:var(--ink)"></svg></div></div>
  <div><div id="eCtl"></div><div class="box y" id="eOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3f6b2a',LABNAME='Energy flow lab',MIND_CENTER='Ecosystem';
const GN='#3f6b2a',OR='#b3541e',BR='#7a5a2a',BL='#2e6fb5',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,'font-size="14" '+o);
const ar=(x1,y1,x2,y2,c=ink)=>{const a=Math.atan2(y2-y1,x2-x1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2"/><path d="M${x2} ${y2} L${x2-9*Math.cos(a-0.4)} ${y2-9*Math.sin(a-0.4)} L${x2-9*Math.cos(a+0.4)} ${y2-9*Math.sin(a+0.4)}Z" fill="${c}"/>`};
function pyr(x,y,w,h,vals,cols,inv=false){let s='';const n=vals.length,mx=Math.max(...vals);vals.forEach((v,i)=>{const ww=Math.max(14,w*v/mx),yy=inv?y+i*h:y+(n-1-i)*h;s+=`<rect x="${x-ww/2}" y="${yy}" width="${ww}" height="${h-3}" fill="${cols[i]}" opacity=".8"/>`});return s}
function heroDraw(){return `<circle cx="40" cy="35" r="16" fill="#fff" opacity=".85"/><path d="M80 110 L150 40 L220 110Z" fill="none" stroke="#fff" stroke-width="2"/><rect x="100" y="90" width="100" height="18" fill="#fff" opacity=".7"/><rect x="120" y="70" width="60" height="18" fill="#fff" opacity=".7"/><rect x="138" y="50" width="24" height="18" fill="#fff" opacity=".7"/>`}
const HERO=heroDraw;
const MIND=[['Structure & function',100,50],['Productivity (GPP, NPP)',420,50],['Decomposition',90,150],['Energy flow, 10% law',430,150],['Food chains & webs',110,250],['Ecological pyramids',410,250]];
const COLS=['#639922','#97c459','#e0a02a','#b3541e'];

const C=[
{id:'e1',num:'12.1',title:'Ecosystem: structure and function',
 intro:'A pond and a forest look very different. What do all ecosystems share?',
 obj:'Describe the biotic and abiotic components of an ecosystem, its stratification, and its four functional aspects.',
 prior:'Organisms and populations (Ch 11).',
 simple:'An ecosystem is a functional unit of nature in which living organisms interact among themselves and with their physical environment. Ecosystems can be terrestrial (forest, grassland, desert) or aquatic (pond, lake, wetland, river, estuary), or man-made (crop fields, aquarium). Biotic components are producers, consumers and decomposers; abiotic components include light, temperature, water, soil and minerals.',
 detail:'Vertical distribution of different species at different levels is called stratification: in a forest, trees occupy the top layer, shrubs the second, herbs and grasses the bottom. A pond is a self-sustaining, simple example: abiotic components are water with dissolved inorganic and organic substances and the rich soil deposit at the bottom; producers are phytoplankton, some algae and floating, submerged and marginal plants; consumers range from zooplankton to free-swimming and bottom-dwelling animals; decomposers are fungi, bacteria and flagellates, especially at the bottom. The four important functional aspects of an ecosystem are: (i) productivity, (ii) decomposition, (iii) energy flow, (iv) nutrient cycling.',
 real:'A village pond in Haryana, with algae, water plants, fish, frogs and bacteria in its mud, is a complete ecosystem.',
 apply:'List the producers, consumers and decomposers of a pond ecosystem.',
 see:{w:520,h:240,f:[
  ['A pond: water, sunlight, and mud at the bottom (abiotic).',`<circle cx="460" cy="40" r="22" fill="#f2b632"/><path d="M20 90 Q260 70 500 90 L500 220 L20 220Z" fill="${BL}" opacity=".15"/><rect x="20" y="200" width="480" height="20" fill="#8a6a3a" opacity=".5"/>`],
  ['Producers: phytoplankton and plants.',[...Array(14)].map((_,i)=>`<circle cx="${40+i*32}" cy="${110+(i%3)*12}" r="3" fill="${GN}"/>`).join('')+`<path d="M60 200 q-6 -40 4 -70 M70 200 q6 -40 -2 -80" stroke="${GN}" stroke-width="3" fill="none"/>`],
  ['Consumers: zooplankton, fish. Decomposers: bacteria and fungi in the mud.',`<path d="M250 150 q15 -9 30 0 q-15 9 -30 0 l-8 -6 v12z" fill="${OR}"/><path d="M360 170 q15 -9 30 0 q-15 9 -30 0 l-8 -6 v12z" fill="${OR}"/>`+[...Array(10)].map((_,i)=>`<circle cx="${200+i*25}" cy="210" r="2" fill="${BR}"/>`).join('')+lbl(260,236,'productivity · decomposition · energy flow · nutrient cycling','font-size="12"')]]},
 seeNote:'Schematic pond.',
 do:{title:'Ecosystem audit',mat:'Notebook, a school garden or pond',steps:['List what you see: living and non-living.','Sort living things into producers, consumers and decomposers.','Note layers (stratification) if any.'],obs:'Every ecosystem has all three biotic groups.',why:'Energy and nutrients need all three.',lab:false},
 memo:'"P-D-E-N: Productivity, Decomposition, Energy flow, Nutrient cycling."',
 miscon:['"An ecosystem is only living things." It includes the physical environment.','"Man-made systems are not ecosystems." Crop fields and aquaria are man-made ecosystems.'],
 terms:['Ecosystem','Biotic, abiotic','Stratification','Producers','Consumers','Decomposers'],
 q:{q:'Vertical layering of species in a forest is called:',o:['succession','stratification','zonation','food web'],a:1,why:'Trees, shrubs, herbs at different levels.'},
 exam:'Components of a pond ecosystem: 2–3 marks.'},

{id:'e2',num:'12.2',title:'Productivity',
 intro:'Two fields get the same sunlight. Why does one produce more plant matter?',
 obj:'Define primary production, productivity, GPP and NPP, and state what affects productivity.',
 prior:'Photosynthesis.',
 simple:'Primary production is the amount of biomass or organic matter produced per unit area over a time period by plants during photosynthesis, expressed as weight (g m⁻²) or energy (kcal m⁻²). The rate of biomass production is productivity (g m⁻² yr⁻¹ or kcal m⁻² yr⁻¹). Gross primary productivity (GPP) is the total rate of production; plants use part of it in respiration (R). Net primary productivity: NPP = GPP − R. NPP is the biomass available to consumers (herbivores) and decomposers.',
 detail:'Secondary productivity is the rate of formation of new organic matter by consumers. Primary productivity depends on the plant species in an area, environmental factors, availability of nutrients and the photosynthetic capacity of plants, so it varies between ecosystems. The annual net primary productivity of the whole biosphere is about 170 billion tons (dry weight) of organic matter. Of this, despite occupying about 70% of the surface, the oceans account for only about 55 billion tons.',
 real:'Farmers raise NPP of crops with irrigation, fertilisers and better varieties: more biomass from the same sunlight.',
 apply:'GPP of a field is 2000 g m⁻² yr⁻¹ and respiration uses 800 g m⁻² yr⁻¹. What is NPP?',
 see:{w:520,h:220,f:[
  ['GPP: total organic matter made by photosynthesis.',`<rect x="60" y="80" width="400" height="40" fill="${GN}" opacity=".8"/>`+lbl(260,105,'GPP','fill="#fff" font-weight="700"')],
  ['R: used by the plant in respiration.',`<rect x="60" y="140" width="150" height="40" fill="${OR}" opacity=".8"/>`+lbl(135,165,'R','fill="#fff" font-weight="700"')],
  ['NPP = GPP − R: available to herbivores and decomposers.',`<rect x="210" y="140" width="250" height="40" fill="#97c459" opacity=".9"/>`+lbl(335,165,'NPP','font-weight="700"')+lbl(260,210,'NPP = GPP − R','font-weight="700"')]]},
 seeNote:'Bar lengths illustrative.',
 do:{title:'Leaf weighing',mat:'Seedlings grown in light and dark, a balance, an oven',steps:['Grow two sets of seedlings for 2 weeks, one in light.','Dry and weigh them.'],obs:'Light-grown seedlings gain dry mass.',why:'Net production of organic matter needs photosynthesis.',lab:false},
 memo:'"Gross minus Respiration = Net."',
 miscon:['"GPP is what consumers eat." They get NPP.','"Oceans, being largest, are most productive overall." They produce about 55 of 170 billion tons.'],
 terms:['Primary production','Productivity','GPP','NPP','Secondary productivity'],
 q:{q:'NPP equals:',o:['GPP + R','GPP − R','R − GPP','GPP × R'],a:1,why:'Definition.'},
 exam:'Define GPP/NPP and factors affecting productivity: 2–3 marks.'},

{id:'e3',num:'12.3',title:'Decomposition',
 intro:'Why do fallen leaves vanish quickly in a warm, wet monsoon but stay for months in winter?',
 obj:'Describe the steps of decomposition and the factors that control its rate.',
 prior:'Decomposers; productivity.',
 simple:'Decomposers break down complex organic matter into inorganic substances like CO₂, water and nutrients. The raw material is detritus: dead plant remains (leaves, bark, flowers) and dead animal remains, including faecal matter. Steps: fragmentation, leaching, catabolism, humification and mineralisation.',
 detail:'Fragmentation: detritivores such as earthworms break detritus into smaller particles. Leaching: water-soluble inorganic nutrients go down into the soil and get precipitated as unavailable salts. Catabolism: bacterial and fungal enzymes degrade detritus into simpler inorganic substances. These three go on simultaneously. Humification: accumulation of a dark, amorphous substance called humus, highly resistant to microbial action, which decomposes very slowly; it is colloidal and acts as a reservoir of nutrients. Mineralisation: humus is further degraded by some microbes, releasing inorganic nutrients. Decomposition is largely oxygen-requiring. Its rate depends on chemical composition of detritus and climate: it is slower if detritus is rich in lignin and chitin, and quicker if rich in nitrogen and water-soluble substances like sugars. Warm and moist conditions favour decomposition; low temperature and anaerobiosis inhibit it, leading to build-up of organic material.',
 real:'Compost pits and vermicomposting speed up decomposition by keeping waste moist, aerated and full of earthworms.',
 apply:'Why does decomposition slow down in waterlogged soil?',
 see:{w:520,h:240,f:[
  ['Detritus: dead leaves, remains.',[...Array(8)].map((_,i)=>`<ellipse cx="${40+i*20}" cy="60" rx="9" ry="4" fill="${BR}" transform="rotate(${i*25} ${40+i*20} 60)"/>`).join('')+lbl(110,95,'detritus','font-size="12"')],
  ['Fragmentation (earthworms) → leaching → catabolism (microbes).',ar(200,60,260,60)+lbl(320,50,'fragmentation','font-size="12"')+lbl(320,72,'leaching · catabolism','font-size="12"')],
  ['Humification (humus) → mineralisation (nutrients released).',`<rect x="60" y="150" width="400" height="40" fill="#3a2a1a" opacity=".6"/>`+lbl(260,175,'humus → mineralisation → nutrients','fill="#fff" font-size="13"')+lbl(260,225,'warm + moist + O₂ = fast · lignin/chitin = slow','font-size="12"')]]},
 seeNote:'Steps 1–3 run at the same time.',
 do:{title:'Litter-bag experiment',mat:'Mesh bags, dry leaves of two kinds, a balance',steps:['Weigh leaves into bags; bury some in moist soil, keep some dry.','Reweigh after 4 weeks.'],obs:'Moist, buried bags lose more mass.',why:'Moisture, warmth and organisms speed decomposition.',lab:false},
 memo:'"Fragment, Leach, Catabolise, Humify, Mineralise."',
 miscon:['"Humus decomposes fast." It decomposes very slowly.','"Leaching makes nutrients more available." It can lock them as unavailable salts.'],
 terms:['Detritus','Detritivores','Fragmentation','Leaching','Catabolism','Humification','Humus','Mineralisation'],
 q:{q:'Decomposition is slowest when detritus is rich in:',o:['sugars','nitrogen','lignin and chitin','water'],a:2,why:'Hard to break down.'},
 exam:'Steps of decomposition and factors: 3–5 marks.'},

{id:'e4',num:'12.4',title:'Energy flow and the 10 per cent law',
 intro:'A lion eats a deer that ate grass. How much of the Sun\'s energy reaches the lion?',
 obj:'Trace unidirectional energy flow through trophic levels, use the 10 per cent law, and distinguish grazing and detritus food chains.',
 prior:'Productivity; photosynthesis.',
 simple:'Except for deep-sea hydrothermal ecosystems, the Sun is the only source of energy. Less than 50% of incident solar radiation is photosynthetically active radiation (PAR), and plants capture only 2–10% of PAR. Energy flows in one direction: sun → producers → consumers. At each step only about 10% passes to the next trophic level; the rest is lost as heat (respiration). This is the 10 per cent law (Lindeman).',
 detail:'Green plants are producers. Primary consumers (herbivores) feed on plants; secondary consumers (primary carnivores) on herbivores; tertiary consumers on them. Grazing food chain (GFC): grass → goat → man. Detritus food chain (DFC) begins with dead organic matter and is made of decomposers (heterotrophic fungi and bacteria, called saprotrophs). In an aquatic ecosystem the GFC is the major conduit of energy flow; in a terrestrial ecosystem a much larger fraction flows through the DFC. Some DFC organisms are prey to GFC animals, and some animals (e.g. cockroaches, crows) are omnivores; food chains interconnect to form a food web. Each trophic level has a certain mass of living material at a particular time, the standing crop. The number of trophic levels is restricted because of the 10% loss at each level. Energy flow obeys the laws of thermodynamics.',
 real:'Eating plants directly feeds more people from the same land than feeding the plants to animals first, because of the 10% loss.',
 apply:'If producers trap 20,000 J, how much energy reaches a tertiary consumer by the 10 per cent law?',
 see:{w:520,h:240,f:[
  ['Sun → producers → herbivores → carnivores.',`<circle cx="40" cy="50" r="20" fill="#f2b632"/>`+ar(62,55,100,90)+['Producers','Herbivores','Carnivore 1','Carnivore 2'].map((t,i)=>`<rect x="${100+i*100}" y="80" width="88" height="34" rx="6" fill="${COLS[i]}" opacity=".85"/>`+lbl(144+i*100,102,t,'font-size="11"')+(i<3?ar(188+i*100,97,200+i*100,97):'')).join('')],
  ['Only ≈10% passes on at each step.',[10000,1000,100,10].map((v,i)=>lbl(144+i*100,140,v+' J','font-size="12" font-weight="700"')).join('')],
  ['The rest is lost as heat (respiration) at every level.',[0,1,2,3].map(i=>`<path d="M${144+i*100} 160 q-8 15 0 30 q8 15 0 30" fill="none" stroke="${OR}" stroke-width="2"/>`).join('')+lbl(470,230,'heat','font-size="12" fill="'+OR+'"')]]},
 seeNote:'Values illustrate the 10% law.',
 do:{title:'Food-web mapping',mat:'Chart paper, pictures of local organisms',steps:['Build three food chains from your area.','Join them where organisms are shared to make a web.'],obs:'A web, not a single line.',why:'Organisms feed at more than one level.',lab:false},
 memo:'"Energy flows one way and shrinks tenfold each step."',
 miscon:['"Energy cycles like nutrients." Energy flows one way and is lost as heat.','"All of the sunlight is used by plants." Only 2–10% of PAR is captured.'],
 terms:['PAR','Trophic level','Grazing food chain','Detritus food chain','Food web','Standing crop','10 per cent law'],
 q:{q:'Plants capture about what fraction of PAR?',o:['50–60%','2–10%','90%','0.1%'],a:1,why:'NCERT range.'},
 exam:'10% law calculations and GFC vs DFC: 2–3 marks.'},

{id:'e5',num:'12.5',title:'Ecological pyramids',
 intro:'Why can a pyramid of biomass in the sea stand upside down, but a pyramid of energy never can?',
 obj:'Describe pyramids of number, biomass and energy, explain inverted pyramids, and state their limitations.',
 prior:'Energy flow (12.4).',
 simple:'An ecological pyramid shows the relationship between trophic levels: producers form the base and top carnivores the tip. Pyramids can show number, biomass (dry weight) or energy. In most ecosystems all three are upright. The pyramid of energy is always upright, because energy is lost as heat at each step.',
 detail:'Calculations of energy, biomass or numbers must include all organisms at that trophic level. Inverted pyramids: the pyramid of biomass in the sea is generally inverted because the biomass of fishes far exceeds that of phytoplankton at any one time (phytoplankton reproduce fast). The pyramid of numbers can be inverted, e.g. insects feeding on a big tree. Each bar of an energy pyramid shows the amount of energy at a trophic level in a given time or annually per unit area. Limitations of pyramids: they do not take into account the same species belonging to two or more trophic levels; they assume a simple food chain, which seldom exists in nature, and do not accommodate a food web; saprophytes are not given any place, even though they play a vital role.',
 real:'In a mango tree, one tree supports thousands of insects, which support a few birds: an inverted pyramid of numbers.',
 apply:'Draw the pyramid of biomass for a sea ecosystem and explain why it is inverted.',
 see:{w:520,h:240,f:[
  ['Grassland: upright pyramid of numbers.',pyr(110,40,180,40,[100,40,15,4],COLS)+lbl(110,220,'grassland: numbers','font-size="12"')],
  ['Sea: inverted pyramid of biomass.',pyr(290,40,150,40,[20,40,70,100],COLS,false).replace(/x="(\d+\.?\d*)"/g,(m,v)=>m)+lbl(290,220,'sea: biomass','font-size="12"')],
  ['Energy: always upright.',pyr(440,40,120,40,[100,10,1,0.1],COLS)+lbl(440,220,'any: energy','font-size="12"')]]},
 seeNote:'Bottom bar = producers. Widths illustrative.',
 do:{title:'Build a number pyramid',mat:'Counts from a 1 m² patch of grass (plants, insects, spiders)',steps:['Count organisms at each level.','Draw bars proportional to the counts.'],obs:'Usually upright.',why:'Fewer organisms higher up.',lab:true},
 memo:'"Energy pyramids never stand on their heads."',
 miscon:['"Inverted biomass pyramid breaks the 10% law." It is a snapshot (standing crop); energy flow is still upright.','"Pyramids show decomposers." Saprophytes have no place in them.'],
 terms:['Pyramid of number','Pyramid of biomass','Pyramid of energy','Inverted pyramid','Standing crop'],
 q:{q:'Which pyramid is always upright?',o:['number','biomass','energy','none'],a:2,why:'Energy lost at every level.'},
 exam:'Inverted pyramids and limitations: 3 marks.'}
];

const CARDS=[['Ecosystem','Functional unit: organisms + physical environment.'],['Stratification','Vertical layers: trees, shrubs, herbs.'],['Four functions','Productivity, decomposition, energy flow, nutrient cycling.'],['GPP / NPP','NPP = GPP − R; NPP feeds consumers and decomposers.'],['Biosphere NPP','≈ 170 billion t/yr (dry wt); oceans ≈ 55 billion t.'],['Decomposition steps','Fragmentation, leaching, catabolism, humification, mineralisation.'],['Fast decomposition','Nitrogen, sugars, warm, moist, aerobic.'],['Slow decomposition','Lignin, chitin, cold, anaerobic.'],['PAR','< 50% of sunlight; plants capture 2–10% of PAR.'],['10 per cent law','≈10% energy passes to the next trophic level.'],['GFC vs DFC','Grazing: starts with plants; detritus: starts with dead matter.'],['Pyramids','Number, biomass, energy; energy always upright.'],['Inverted','Biomass in sea; numbers on a tree.'],['Limitations','Ignore multi-level species, food webs, saprophytes.']];

const Q=[
 {lv:1,q:'NPP =',o:['GPP + R','GPP − R','R − GPP','GPP/R'],a:1,w:'Definition.'},
 {lv:1,q:'The first step of decomposition is:',o:['leaching','fragmentation','humification','mineralisation'],a:1,w:'Detritivores break detritus.'},
 {lv:1,q:'Which pyramid is always upright?',o:['number','biomass','energy','all'],a:2,w:'Energy is lost at each level.'},
 {lv:1,q:'A food chain starting from dead organic matter is the:',o:['grazing food chain','detritus food chain','food web','pyramid'],a:1,w:'DFC.'},
 {lv:2,q:'Humus is:',o:['quickly decomposed','highly resistant to microbial action','a decomposer','inorganic'],a:1,w:'Decomposes very slowly.'},
 {lv:2,q:'Percentage of PAR captured by plants:',o:['2–10%','50%','90%','100%'],a:0,w:'NCERT figure.'},
 {lv:2,q:'Pyramid of biomass in the sea is generally:',o:['upright','inverted','spindle-shaped','absent'],a:1,w:'Fish biomass exceeds phytoplankton.'},
 {lv:3,q:'Producers trap 20,000 J. Energy reaching tertiary consumers ≈',o:['2000 J','200 J','20 J','2 J'],a:2,w:'×0.1 three times.'},
 {lv:3,q:'Decomposition will be fastest in:',o:['cold dry soil','warm moist soil with oxygen','waterlogged soil','a desert'],a:1,w:'Warm, moist, aerobic.'},
 {lv:3,q:'GPP 2000, R 800 (g m⁻² yr⁻¹). NPP =',o:['2800','1200','2.5','1600'],a:1,w:'2000 − 800.'},
 {lv:4,q:'Assertion (A): The number of trophic levels in a food chain is limited. Reason (R): Only about 10% of energy passes to the next level.',o:['Both true and R explains A','Both true, R does not explain A','A true, R false','A false, R true'],a:0,w:'Too little energy left for many levels.'},
 {lv:4,q:'Which is NOT a limitation of ecological pyramids?',o:['They ignore food webs','They give no place to saprophytes','They show energy loss','They ignore species at two trophic levels'],a:2,w:'Showing loss is their purpose.'},
 {lv:4,q:'In terrestrial ecosystems, a larger fraction of energy flows through the:',o:['grazing food chain','detritus food chain','top carnivores','producers only'],a:1,w:'NCERT statement.'},
 {lv:5,open:true,m:3,q:'Describe the steps of decomposition.',ans:['Fragmentation by detritivores; leaching of soluble nutrients (1).','Catabolism by bacterial/fungal enzymes (1).','Humification (humus) and mineralisation releasing inorganic nutrients (1).']},
 {lv:5,open:true,m:3,q:'Explain why the pyramid of energy is always upright while the pyramid of biomass may be inverted. Give an example.',ans:['Energy flows one way; ≈90% lost as heat at each level, so each higher level has less (1).','Biomass pyramid shows standing crop at one time (1).','Sea: small phytoplankton biomass supports larger fish biomass because phytoplankton reproduce rapidly (1).']},
 {lv:5,open:true,m:3,q:'Distinguish between GPP and NPP. What affects primary productivity?',ans:['GPP: total rate of organic matter production in photosynthesis (1).','NPP = GPP − respiration losses; available to consumers (1).','Depends on plant species, environmental factors, nutrients, photosynthetic capacity (1).']}
];

const ONEMIN=['Ecosystem = organisms + environment; stratification in forests.','Functions: productivity, decomposition, energy flow, nutrient cycling.','NPP = GPP − R; biosphere ≈ 170 billion t/yr; oceans ≈ 55.','Decomposition: fragmentation, leaching, catabolism, humification, mineralisation.','Fast: N-rich, sugars, warm, moist; slow: lignin, chitin, cold, anaerobic.','PAR < 50%; plants capture 2–10%.','10% law; energy flow is unidirectional.','GFC vs DFC; food webs; standing crop.','Pyramids: number, biomass, energy; energy always upright; sea biomass inverted.','Limitations: multi-level species, food webs, saprophytes ignored.'];
const KEYS=[['biotic/abiotic',/biotic|abiotic|producer|consumer/i],['GPP / NPP',/gpp|npp|gross|net/i],['decomposition steps',/fragment|leach|catabol|humif|mineral/i],['humus',/humus/i],['PAR',/par|photosynthetically active/i],['10 per cent law',/10\s*%|10 per cent|ten per/i],['GFC / DFC',/grazing|detritus/i],['food web',/web/i],['pyramids',/pyramid/i],['inverted',/invert/i]];

/* ---------- lab ---------- */
let mode='flow',sun=1000000,cap=2,tr=10,eco='grass',kind='num';
const DATA={grass:{name:'Grassland',num:[5842000,708000,354000,3],bio:[100,15,3,1],en:[100,10,1,0.1]},sea:{name:'Sea (open water)',num:[100000,5000,500,10],bio:[4,21,40,80],en:[100,10,1,0.1]},tree:{name:'A single tree',num:[1,5000,80,4],bio:[100,8,2,0.5],en:[100,10,1,0.1]}};
function drawFlow(){const par=sun*0.5,prod=par*cap/100;const lv=[prod];for(let i=1;i<4;i++)lv.push(lv[i-1]*tr/100);
 const names=['Producers','Herbivores','Carnivores','Top carnivores'];let s=`<circle cx="40" cy="40" r="22" fill="#f2b632"/>`+T(40,80,'sunlight','font-size="11"');
 const mx=lv[0];lv.forEach((v,i)=>{const w=Math.max(8,380*Math.pow(v/mx,0.35)),y=280-i*60;s+=`<rect x="${270-w/2}" y="${y}" width="${w}" height="50" fill="${COLS[i]}" opacity=".85"/>`+T(270,y+22,names[i],'font-size="12" font-weight="700"')+T(270,y+40,Math.round(v).toLocaleString()+' J','font-size="12"')});
 $('#eSvg').innerHTML=s+T(470,20,'bar widths compressed so small levels stay visible','font-size="10" text-anchor="end"');
 $('#eOut').innerHTML=`<p>Sunlight: <b>${sun.toLocaleString()} J</b> → PAR (≈50%): ${par.toLocaleString()} J</p><p>Captured by producers (${cap}% of PAR): <b>${Math.round(prod).toLocaleString()} J</b></p><p>With ${tr}% transfer: herbivores ${Math.round(lv[1]).toLocaleString()} J, carnivores ${Math.round(lv[2]).toLocaleString()} J, top carnivores <b>${lv[3].toFixed(1)} J</b></p><p>That is ${(lv[3]/sun*100).toExponential(1)}% of the original sunlight.</p>`}
function drawPyr(){const d=DATA[eco],v=d[kind];const names=['Producers','Primary consumers','Secondary consumers','Tertiary consumers'];let s='';const mx=Math.max(...v);
 v.forEach((x,i)=>{const w=Math.max(10,400*(kind==='num'?Math.pow(x/mx,0.25):x/mx)),y=270-i*62;s+=`<rect x="${240-w/2}" y="${y}" width="${w}" height="54" fill="${COLS[i]}" opacity=".85"/>`+T(240,y+24,names[i],'font-size="12" font-weight="700"')+T(240,y+42,kind==='num'?x.toLocaleString():x+(kind==='bio'?' (relative)':' (relative)'),'font-size="11"')});
 $('#eSvg').innerHTML=s;const inv=kind!=='en'&&((eco==='sea'&&kind==='bio')||(eco==='tree'&&kind==='num'));
 $('#eOut').innerHTML=`<p><b>${d.name}</b>: pyramid of ${kind==='num'?'numbers':kind==='bio'?'biomass':'energy'}</p><p>Shape: <b>${inv?'inverted (or partly inverted)':'upright'}</b></p><p>${kind==='en'?'Energy pyramids are always upright: energy is lost as heat at each level.':inv?(eco==='sea'?'Phytoplankton have small standing biomass but reproduce fast, supporting a larger biomass of fish.':'One big tree supports many insects: the producer level has the fewest individuals.'):'Each level supports fewer organisms or less mass above it.'}</p>${eco==='grass'&&kind==='num'?'<p class="note">Grassland counts from the NCERT example.</p>':'<p class="note">Values illustrative.</p>'}`}
function ctl(){if(mode==='flow')return `<div class="ctrl"><label>Producers capture: <b id="eC">${cap}</b>% of PAR<input type="range" class="eSl" id="eCap" min="1" max="10" value="${cap}"></label></div><div class="ctrl"><label>Transfer between levels: <b id="eT">${tr}</b>%<input type="range" class="eSl" id="eTr" min="5" max="20" value="${tr}"></label></div>`;
 return `<div class="ctrl"><label>Ecosystem<select id="eEco"><option value="grass" ${eco==='grass'?'selected':''}>Grassland</option><option value="sea" ${eco==='sea'?'selected':''}>Sea</option><option value="tree" ${eco==='tree'?'selected':''}>A single tree</option></select></label><label>Pyramid of<select id="eKind"><option value="num" ${kind==='num'?'selected':''}>Numbers</option><option value="bio" ${kind==='bio'?'selected':''}>Biomass</option><option value="en" ${kind==='en'?'selected':''}>Energy</option></select></label></div>`}
function labShow(){$('#eCtl').innerHTML=ctl();mode==='flow'?drawFlow():drawPyr()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('eSl'))labChange(t)})}
function labClick(){return false}
function labChange(t){switch(t.id){case 'eMode':mode=t.value;labShow();return true;case 'eCap':cap=+t.value;$('#eC').textContent=cap;drawFlow();return true;case 'eTr':tr=+t.value;$('#eT').textContent=tr;drawFlow();return true;case 'eEco':eco=t.value;drawPyr();return true;case 'eKind':kind=t.value;drawPyr();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
