/* Rai Plus content pack: Class 9 Science, Chapter 1 – Matter in Our Surroundings (rationalised NCERT). Bilingual: Hindi terms alongside. */
RP.register({key:'9sci01',cls:'9',subject:'Science',ch:'1',title:"Matter in Our Surroundings",color:'#0f7a5a',
crumb:"HBSE Class 9 Science · हमारे आस-पास के पदार्थ · Taught in April",h1:"Chapter 1: Matter in Our Surroundings · हमारे आस-पास के पदार्थ",sub:"What matter is made of, the three states, how heat and pressure change states, evaporation and why it cools.",heroLabel:"Particles of a solid, a liquid and a gas",labName:'Heating curve lab',
theme:"\n:root{--g:light-dark(#0f7a5a,#7fd8b8);--g2:light-dark(#e8f6f0,#08190f);--line:light-dark(#cbe8dc,#1f3d31);--bg:light-dark(#ffffff,#08120d);--card:light-dark(#ffffff,#0d1a14);\n--ink:light-dark(#0c2219,#e1f3eb);--mute:light-dark(#466456,#a4c4b6);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#0a5a42}\n",
labHTML:`  <h2>Heating curve lab · तापन वक्र प्रयोगशाला</h2>
  <p>100 g of ice at −20 °C is heated steadily. Watch the particles and the thermometer. Notice the two flat parts of the graph: the temperature stops rising while the state changes, because the heat is used to separate particles (latent heat · गुप्त ऊष्मा).</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="hcSvg" viewBox="0 0 520 320" role="img" aria-label="Heating curve and particles" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label><span>Heater power: <b id="hcPv"></b> W</span><input type="range" id="hcP" min="100" max="800" step="50" value="400"></label></div>
  <div class="ctrl"><button class="btn p" id="hcGo">Heat</button> <button class="btn" id="hcReset">Reset</button></div>
  <div class="box y" id="hcOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#0f7a5a',LABNAME='Heating curve lab',MIND_CENTER='Matter · पदार्थ';
const GN='#0f7a5a',BL='#1f5f8b',OR='#b04a1f',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const ball=(x,y,c=BL,r=6)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
function boxP(x,y,w,h,kind,c=BL){let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" stroke="${ink}" stroke-width="1.5"/>`;
 if(kind==='s'){for(let i=0;i<5;i++)for(let j=0;j<4;j++)s+=ball(x+14+i*(w-28)/4,y+h-12-j*14,c)}
 else if(kind==='l'){const P=[[.15,.85],[.32,.8],[.5,.88],[.68,.82],[.85,.86],[.22,.68],[.42,.66],[.6,.7],[.78,.64],[.12,.55],[.35,.52],[.55,.56],[.75,.5],[.9,.58]];P.forEach(([a,b])=>s+=ball(x+a*w,y+b*h,c))}
 else {const P=[[.15,.2],[.7,.15],[.4,.45],[.85,.6],[.2,.75],[.55,.85],[.9,.3]];P.forEach(([a,b])=>s+=ball(x+a*w,y+b*h,c))}
 return s}
function heroDraw(){let s='';[[40,'s'],[150,'l'],[260,'g']].forEach(([x,k])=>{s+=`<rect x="${x}" y="30" width="80" height="80" rx="6" fill="none" stroke="#fff" stroke-width="2"/>`;
 const P=k==='s'?[...Array(16)].map((_,i)=>[x+12+(i%4)*19,52+Math.floor(i/4)*16]):k==='l'?[[12,80],[30,86],[48,78],[66,88],[20,66],[40,70],[58,64],[16,96],[36,98],[56,96],[72,72]].map(([a,b])=>[x+a,b+4]):[[14,44],[60,40],[36,70],[66,90],[20,98],[48,100]].map(([a,b])=>[x+a,b]);
 P.forEach(([a,b])=>s+=`<circle cx="${a}" cy="${b}" r="5" fill="#fff"/>`)});return s}
const HERO=heroDraw;
const MIND=[['Particles · कण',100,50],['States · अवस्थाएँ',420,50],['Heat changes state',90,150],['Pressure · दाब',430,150],['Evaporation · वाष्पन',110,250],['Cooling · शीतलन',410,250]];

const C=[
{id:'m1',num:'1.1',title:'Matter is made of particles · द्रव्य कणों से बना है',
 intro:'Drop a few crystals of potassium permanganate in water: the whole beaker turns pink. What does that tell us about matter?',
 obj:'State the characteristics of particles of matter.',
 prior:'Class 6–8: materials, solids, liquids and gases.',
 simple:'Matter (द्रव्य) is anything that has mass and occupies space. It is made of extremely small particles. These particles (1) have spaces between them, (2) are continuously moving — they have kinetic energy, and (3) attract each other. The pink colour spreading shows that particles are tiny and that they move into the spaces between water particles.',
 detail:'One crystal can colour litres of water, so it must contain millions of particles. Particles move faster when heated: sugar dissolves faster and smells spread faster in hot conditions. The mixing of particles of two substances on their own is diffusion (विसरण). The attraction between particles varies: iron particles hold together strongly, chalk particles weakly.',
 real:'You smell hot food from far away, but cold food only when you are close.',
 apply:'Why does a drop of ink spread faster in hot water than in cold water?',
 see:{w:520,h:220,f:[
  ['Particles with spaces.',boxP(40,40,130,130,'l')+lbl(105,195,'spaces between particles')],
  ['Particles keep moving.',boxP(195,40,130,130,'g',OR)+`<path d="M240 70 l18 -10 M290 120 l-14 12 M250 150 l20 4" stroke="${OR}" stroke-width="2" marker-end="url(#ah)"/>`+lbl(260,195,'they move (kinetic energy)')],
  ['Particles attract each other.',boxP(350,40,130,130,'s',GN)+lbl(415,195,'force of attraction')]]},
 seeNote:'Three properties of particles.',
 do:{title:'Diffusion in water',mat:'Two beakers (hot and cold water), ink or KMnO₄',steps:['Add one drop to each beaker without stirring.','Watch for 5 minutes.'],obs:'Colour spreads faster in hot water.',why:'Particles move faster when hotter.',lab:false},
 memo:'"Space, Speed, Stick" — spaces, moving, attraction.',
 miscon:['"Particles stop moving in a solid." They still vibrate about fixed positions.'],
 terms:['Matter · द्रव्य','Particle · कण','Diffusion · विसरण','Kinetic energy · गतिज ऊर्जा'],
 q:{q:'Smell of hot food reaches us quickly because particles:',o:['are large','move faster when hot','have no spaces','stop attracting'],a:1,why:'Higher temperature, faster diffusion.'},
 exam:'Characteristics of particles with examples: 2–3 marks.'},

{id:'m2',num:'1.2',title:'Solid, liquid and gas · ठोस, द्रव और गैस',
 intro:'Why can you pour water but not a brick — and why can you squeeze air into a cycle tyre?',
 obj:'Compare the properties of the three states of matter.',
 prior:'1.1.',
 simple:'Solids (ठोस) have a fixed shape and volume, are rigid and hardly compressible — particles are closely packed with strong attraction. Liquids (द्रव) have a fixed volume but take the shape of the container and flow. Gases (गैस) have neither fixed shape nor volume, are highly compressible and fill any container — particles are far apart and move randomly at high speed.',
 detail:'Liquids and gases are fluids. Gases can be compressed a lot: LPG and CNG cylinders hold large amounts of gas in small volumes. Diffusion is fastest in gases, slower in liquids and very slow in solids. Gas particles hitting the container walls create gas pressure. Exceptions puzzle students: a sponge is a solid with air-filled holes; a rubber band changes shape under force but regains it.',
 real:'Oxygen cylinders in hospitals store compressed oxygen.',
 apply:'Arrange air, sugar and water in increasing order of the force of attraction between particles.',
 see:{w:520,h:220,f:[
  ['Solid: packed and ordered.',boxP(40,40,130,130,'s',BL)+lbl(105,195,'ठोस · fixed shape')],
  ['Liquid: close but free to slide.',boxP(195,40,130,130,'l',BL)+lbl(260,195,'द्रव · flows')],
  ['Gas: far apart and fast.',boxP(350,40,130,130,'g',BL)+lbl(415,195,'गैस · fills container')]]},
 seeNote:'Spacing and freedom increase from solid to gas.',
 do:{title:'Syringe test',mat:'Three syringes (sealed tips), water, sand',steps:['Fill one with air, one with water, one with sand.','Push the plungers.'],obs:'Only air compresses a lot.',why:'Gas particles have large spaces.',lab:false},
 memo:'"Solid sits, liquid slips, gas goes everywhere."',
 miscon:['"A sponge is not a solid because it can be squeezed." It is a solid with air spaces; the air is squeezed out.'],
 terms:['Solid · ठोस','Liquid · द्रव','Gas · गैस','Compressibility · संपीड्यता','Rigidity · दृढ़ता'],
 q:{q:'Which state has a fixed volume but no fixed shape?',o:['solid','liquid','gas','none'],a:1,why:'Liquids take the container\'s shape.'},
 exam:'Tabulate differences between three states: 3 marks.'},

{id:'m3',num:'1.3',title:'Heat changes the state · ताप से अवस्था परिवर्तन',
 intro:'A thermometer in melting ice stays at 0 °C even while you keep heating it. Where does the heat go?',
 obj:'Explain melting and boiling and the idea of latent heat.',
 prior:'1.1, 1.2; temperature.',
 simple:'Heating gives particles more kinetic energy. At the melting point (गलनांक) — 0 °C or 273 K for ice — the solid turns into liquid. At the boiling point (क्वथनांक) — 100 °C or 373 K for water at normal pressure — the liquid turns into gas. During melting or boiling, the temperature stays constant: the heat is used to overcome the attraction between particles. This hidden heat is latent heat (गुप्त ऊष्मा).',
 detail:'Latent heat of fusion: heat needed to change 1 kg of solid into liquid at its melting point (334 kJ/kg for ice). Latent heat of vaporisation: heat needed to change 1 kg of liquid into gas at its boiling point (2260 kJ/kg for water). So steam at 100 °C has more energy than water at 100 °C and causes worse burns. Kelvin scale: K = °C + 273 (more exactly 273.15). SI unit of temperature is kelvin.',
 real:'Steam burns are more severe than burns from boiling water.',
 apply:'Convert 25 °C, 373 K and −40 °C to the other scale.',
 see:{w:520,h:230,f:[
  ['Axes: heat added → temperature.',`<line x1="50" y1="200" x2="490" y2="200" stroke="${ink}"/><line x1="50" y1="200" x2="50" y2="30" stroke="${ink}"/>`+lbl(270,222,'heat supplied →')+T(28,40,'°C','font-size="12"')],
  ['Rise, flat (melting), rise.',`<polyline points="50,185 90,160 200,160 270,80" fill="none" stroke="${BL}" stroke-width="3"/>`+lbl(145,150,'melting · 0 °C','fill="'+BL+'"')],
  ['Flat again while boiling.',`<polyline points="270,80 470,80 490,50" fill="none" stroke="${OR}" stroke-width="3"/>`+lbl(370,70,'boiling · 100 °C','fill="'+OR+'"')+lbl(250,40,'flat parts: latent heat','font-weight="700"')]]},
 seeNote:'Temperature pauses during a change of state.',
 do:{title:'Melting and boiling',mat:'Ice, beaker, thermometer, burner',steps:['Heat ice; note temperature every 30 s.','Continue until water boils; plot a graph.'],obs:'Flat at 0 °C and 100 °C.',why:'Latent heat.',lab:true},
 memo:'"Changing state? Temperature waits."',
 miscon:['"Temperature always rises when you heat something." Not during melting or boiling.'],
 terms:['Melting point · गलनांक','Boiling point · क्वथनांक','Latent heat · गुप्त ऊष्मा','Fusion · संगलन','Kelvin · केल्विन'],
 q:{q:'300 K in °C is:',o:['27 °C','573 °C','−27 °C','30 °C'],a:0,why:'300 − 273.'},
 exam:'Latent heat, steam burns, K ↔ °C: 2–3 marks.'},

{id:'m4',num:'1.4',title:'Pressure can change the state · दाब का प्रभाव',
 intro:'How does a gas station fit so much gas into a small CNG cylinder? And why does "dry ice" never become liquid?',
 obj:'Explain how pressure and temperature together change states; understand sublimation.',
 prior:'1.2, 1.3.',
 simple:'Applying pressure and lowering temperature pushes gas particles close together and can turn a gas into a liquid (liquefaction). Solid carbon dioxide (dry ice) changes directly into gas when pressure is lowered to 1 atmosphere — this direct change from solid to gas is sublimation (ऊर्ध्वपातन). The reverse, gas to solid, is deposition (निक्षेपण).',
 detail:'Camphor, naphthalene balls and ammonium chloride sublime on heating. Atmospheric pressure at sea level is 1 atm = 1.01 × 10⁵ Pa. Pressure units: pascal (Pa), atmosphere (atm). So the state of a substance depends on both temperature and pressure.',
 real:'Naphthalene balls in cupboards slowly disappear without leaving a liquid.',
 apply:'Why are gases like LPG stored under high pressure?',
 see:{w:520,h:220,f:[
  ['Gas in a cylinder.',boxP(40,50,120,120,'g',BL)+lbl(100,195,'gas')],
  ['Push the piston: particles crowd.',`<path d="M190 110 h40" stroke="${OR}" stroke-width="3" marker-end="url(#ah)"/>`+lbl(210,95,'pressure + cooling','font-size="11"')+boxP(250,80,80,90,'l',BL)+lbl(290,195,'→ liquid')],
  ['Dry ice: solid → gas directly.',`<rect x="380" y="130" width="60" height="40" rx="4" fill="${GR}" opacity=".5"/>`+`<path d="M395 120 q-8 -20 4 -40 M420 120 q8 -22 -4 -44" fill="none" stroke="${GR}" stroke-width="2"/>`+lbl(410,195,'sublimation')+lbl(410,212,'ऊर्ध्वपातन')]]},
 seeNote:'Pressure squeezes, temperature frees.',
 do:{title:'Camphor sublimation',mat:'Camphor, china dish, inverted funnel, cotton plug, burner',steps:['Heat camphor gently under the funnel.','Look at the funnel walls.'],obs:'Solid deposits on cool walls.',why:'Sublimation and deposition.',lab:false},
 memo:'"High pressure + low temperature = liquefy."',
 miscon:['"Every solid melts before boiling." Some sublime directly.'],
 terms:['Sublimation · ऊर्ध्वपातन','Deposition · निक्षेपण','Atmosphere (atm)','Liquefaction · द्रवण'],
 q:{q:'Which sublimes on heating?',o:['salt','sugar','camphor','wax'],a:2,why:'Solid → vapour directly.'},
 exam:'Sublimation examples, effect of pressure: 2 marks.'},

{id:'m5',num:'1.5',title:'Evaporation · वाष्पीकरण',
 intro:'Wet clothes dry on a line without ever reaching 100 °C. How?',
 obj:'Define evaporation and explain the factors affecting it.',
 prior:'1.3.',
 simple:'Evaporation (वाष्पीकरण) is the change of a liquid into vapour at any temperature below its boiling point. It happens at the surface: some surface particles have enough energy to escape. Evaporation increases with (1) larger surface area, (2) higher temperature, (3) lower humidity (आर्द्रता), and (4) higher wind speed.',
 detail:'Boiling happens throughout the liquid at a fixed temperature; evaporation happens only at the surface, at all temperatures. Humidity is the amount of water vapour in the air — on a humid rainy day clothes dry slowly. Wind carries away the vapour, letting more particles escape.',
 real:'Clothes dry faster when spread out, in sunlight, on a windy dry day.',
 apply:'Why do clothes take longer to dry in the rainy season?',
 see:{w:520,h:220,f:[
  ['Surface particles escape.',`<rect x="60" y="110" width="160" height="70" fill="${BL}" fill-opacity=".25" stroke="${BL}"/>`+[80,120,160,200].map(x=>ball(x,100,BL,5)).join('')+`<path d="M120 95 l0 -30 M180 95 l6 -34" stroke="${BL}" stroke-width="2" marker-end="url(#ah)"/>`+lbl(140,200,'escapes from the surface')],
  ['Faster with area, heat, wind.',lbl(380,60,'↑ surface area','font-size="14"')+lbl(380,90,'↑ temperature','font-size="14"')+lbl(380,120,'↑ wind speed','font-size="14"')],
  ['Slower with humidity.',lbl(380,155,'↑ humidity → slower','font-size="14" fill="'+OR+'"')]]},
 seeNote:'Four factors.',
 do:{title:'Drying race',mat:'Two equal wet handkerchiefs',steps:['Spread one flat, fold the other; keep both in the same place.','Compare after 30 minutes.'],obs:'Spread one dries first.',why:'Larger surface area.',lab:false},
 memo:'"SATW: Surface, Air (wind), Temperature, Wetness of air (humidity)."',
 miscon:['"Evaporation only happens at 100 °C." It happens at all temperatures.'],
 terms:['Evaporation · वाष्पीकरण','Humidity · आर्द्रता','Vapour · वाष्प','Boiling · क्वथन'],
 q:{q:'Evaporation decreases when:',o:['temperature rises','humidity rises','wind speed rises','area increases'],a:1,why:'Air already holds vapour.'},
 exam:'Factors affecting evaporation; evaporation vs boiling: 3 marks.'},

{id:'m6',num:'1.6',title:'Evaporation causes cooling · वाष्पीकरण से शीतलन',
 intro:'Why does water stay cool in a clay matka during a Haryana summer?',
 obj:'Explain cooling by evaporation with everyday examples.',
 prior:'1.5.',
 simple:'Particles that escape during evaporation are the most energetic ones. They take energy from the remaining liquid and surroundings, so the temperature drops: evaporation causes cooling. Water seeps through the tiny pores of a matka and evaporates from its surface, cooling the water inside.',
 detail:'Sweating cools our body: sweat takes heat from the skin to evaporate. Cotton clothes absorb sweat and expose it to air, so they are best in summer. Acetone or petrol on the palm feels cold. People sprinkle water on rooftops or open ground in hot afternoons. Water droplets on the outside of a glass of ice water come from water vapour in the air condensing — the reverse process.',
 real:'Desert coolers work by evaporating water through wet pads.',
 apply:'Why should we wear cotton clothes in summer?',
 see:{w:520,h:220,f:[
  ['A clay matka with pores.',`<path d="M200 60 q-60 20 -60 80 q0 50 60 60 h80 q60 -10 60 -60 q0 -60 -60 -80 z" fill="${OR}" fill-opacity=".3" stroke="${OR}" stroke-width="2"/>`],
  ['Water seeps and evaporates.',[160,350,180,330].map((x,i)=>`<path d="M${x} ${110+i*20} q${i%2?14:-14} -14 ${i%2?6:-6} -30" fill="none" stroke="${BL}" stroke-width="2"/>`).join('')],
  ['Heat leaves → water cools.',lbl(240,140,'cool water','font-size="15" font-weight="700" fill="'+BL+'"')+lbl(240,30,'evaporation takes heat away','font-weight="700"')]]},
 seeNote:'Evaporation borrows heat.',
 do:{title:'Cold palm',mat:'Cotton dipped in water and in sanitiser (alcohol)',steps:['Dab each on the back of your hand.','Compare.'],obs:'Alcohol feels colder.',why:'Evaporates faster, takes heat faster.',lab:false},
 memo:'"Evaporation steals heat."',
 miscon:['"The matka is cold because clay is cold." Evaporation from its surface takes heat away.'],
 terms:['Cooling · शीतलन','Condensation · संघनन','Sweat · पसीना'],
 q:{q:'We wear cotton clothes in summer because cotton:',o:['is heavy','absorbs sweat and helps it evaporate','stops evaporation','is a good conductor'],a:1,why:'Evaporation cools.'},
 exam:'Cooling by evaporation examples: 2–3 marks.'}
];

const CARDS=[['Matter · द्रव्य','Has mass and occupies space; made of particles.'],['Particle properties','Spaces, motion, attraction.'],['Diffusion · विसरण','Intermixing of particles on their own; faster when hot.'],['Solid · ठोस','Fixed shape and volume; rigid.'],['Liquid · द्रव','Fixed volume, no fixed shape; flows.'],['Gas · गैस','No fixed shape or volume; compressible.'],['Melting point of ice','0 °C = 273 K.'],['Boiling point of water','100 °C = 373 K.'],['Latent heat · गुप्त ऊष्मा','Heat used to change state at constant temperature.'],['K ↔ °C','K = °C + 273.'],['Sublimation · ऊर्ध्वपातन','Solid → gas directly (camphor, dry ice).'],['Evaporation factors','Area ↑, temperature ↑, wind ↑, humidity ↓.'],['Cooling','Evaporation takes heat away (matka, sweat).']];

const Q=[
 {lv:1,q:'Which is NOT matter?',o:['air','smell','love','water'],a:2,w:'No mass, no space.'},
 {lv:1,q:'SI unit of temperature:',o:['°C','°F','K','J'],a:2,w:'Kelvin.'},
 {lv:1,q:'Change of solid directly into gas is:',o:['evaporation','sublimation','condensation','fusion'],a:1,w:'Definition.'},
 {lv:2,q:'Highest diffusion rate is in:',o:['solids','liquids','gases','all equal'],a:2,w:'Particles move fastest.'},
 {lv:2,q:'Convert 373 K to °C:',o:['100 °C','646 °C','73 °C','−100 °C'],a:0,w:'373 − 273.'},
 {lv:2,q:'During melting, the temperature:',o:['rises','falls','stays constant','doubles'],a:2,w:'Latent heat.'},
 {lv:3,q:'Clothes dry fastest on a:',o:['humid still day','dry windy sunny day','cold humid day','dark room'],a:1,w:'All factors favour evaporation.'},
 {lv:3,q:'Steam burns are worse than boiling-water burns because steam:',o:['is hotter than 100 °C','carries extra latent heat','is lighter','is a gas'],a:1,w:'Latent heat of vaporisation.'},
 {lv:4,q:'A gas can be liquefied by:',o:['raising temperature, lowering pressure','lowering temperature, raising pressure','only stirring','adding salt'],a:1,w:'Particles brought closer.'},
 {lv:4,q:'Water droplets form outside a glass of ice water because:',o:['water seeps through glass','vapour in air condenses','ice evaporates','glass melts'],a:1,w:'Condensation.'},
 {lv:5,open:true,m:3,q:'Give three differences between evaporation and boiling.',ans:['Evaporation at all temperatures; boiling at a fixed temperature (1)','Evaporation at the surface; boiling throughout (1)','Evaporation causes cooling and is slow; boiling is fast with bubbles (1)']},
 {lv:5,open:true,m:5,q:'Explain with a labelled sketch why the temperature of melting ice stays at 0 °C while it is being heated. What is latent heat of fusion? Why does a matka keep water cool?',ans:['Heating curve sketch with flat region (1)','Heat used to overcome attraction, not to raise KE (1)','Latent heat of fusion: heat to change 1 kg solid to liquid at MP (1)','Matka: water evaporates from pores (1)','Evaporation takes heat away → cooling (1)']}
];

const ONEMIN=['Matter: particles with spaces, motion, attraction.','Solid, liquid, gas compared.','Melting 0 °C, boiling 100 °C; latent heat.','Pressure + cooling liquefies; sublimation.','Evaporation and its four factors.','Evaporation cools: matka, sweat, cotton.'];
const KEYS=[['particles',/particle|कण/i],['states',/solid|liquid|gas|ठोस|द्रव|गैस/i],['latent heat',/latent|गुप्त/i],['sublimation',/sublim|ऊर्ध्वपातन/i],['evaporation',/evapor|वाष्प/i],['cooling',/cool|शीतलन|matka/i]];

/* ---------- lab: heating curve ---------- */
const M=100,cI=2.1,cW=4.2,cS=2.0,LF=334,LV=2260;
const E1=M*cI*20,E2=E1+M*LF,E3=E2+M*cW*100,E4=E3+M*LV,EMAX=E4+M*cS*30;
let P=400,HQ=0,run=false,looping=false,last=0,wired=false,parts=[];
function stateAt(q){if(q<E1)return {T:-20+q/(M*cI),st:'Ice (solid · ठोस)',fl:0,gs:0};if(q<E2)return {T:0,st:'Melting · गलन',fl:(q-E1)/(E2-E1),gs:0};if(q<E3)return {T:(q-E2)/(M*cW),st:'Water (liquid · द्रव)',fl:1,gs:0};if(q<E4)return {T:100,st:'Boiling · क्वथन',fl:1,gs:(q-E3)/(E4-E3)};return {T:100+(q-E4)/(M*cS),st:'Steam (gas · गैस)',fl:1,gs:1}}
const GX0=230,GY0=280,GW=270,GH=240,TX=q=>GX0+q/EMAX*GW,TY=t=>GY0-(t+30)/(160)*GH;
function curvePath(){let d='';for(let i=0;i<=200;i++){const q=EMAX*i/200;d+=(i?'L':'M')+TX(q).toFixed(1)+' '+TY(stateAt(q).T).toFixed(1)}return d}
const CP=curvePath();
function initParts(){parts=[];for(let i=0;i<36;i++){const c=i%6,r=Math.floor(i/6);parts.push({hx:30+c*28,hy:255-r*24,x:30+c*28,y:255-r*24,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2,o:Math.random()})}}
function step(s){const amp=1.2+Math.max(0,s.T+20)/40;parts.forEach((p,i)=>{const isG=p.o<s.gs,isL=p.o<s.fl;
 if(isG){p.vx+=(Math.random()-.5)*.8;p.vy+=(Math.random()-.5)*.8;const sp=Math.hypot(p.vx,p.vy),mx=5+s.T/40;if(sp>mx){p.vx*=mx/sp;p.vy*=mx/sp}if(sp<3){p.vx*=1.3;p.vy*=1.3}p.x+=p.vx;p.y+=p.vy;if(p.x<22||p.x>188)p.vx*=-1;if(p.y<62||p.y>262)p.vy*=-1;p.x=Math.min(188,Math.max(22,p.x));p.y=Math.min(262,Math.max(62,p.y))}
 else if(isL){p.x+=(Math.random()-.5)*amp*2.2;p.y+=(Math.random()-.5)*amp*1.6+.15;p.x=Math.min(186,Math.max(24,p.x));p.y=Math.min(262,Math.max(150,p.y))}
 else{p.x=p.hx+(Math.random()-.5)*amp;p.y=p.hy+(Math.random()-.5)*amp}})}
function draw(){const s=stateAt(HQ);let g=`<rect x="14" y="54" width="182" height="216" rx="8" fill="${BL}" fill-opacity=".05" stroke="${ink}" stroke-width="1.5"/>`;
 parts.forEach(p=>{g+=`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="7" fill="${p.o<s.gs?OR:BL}"/>`});
 g+=T(105,40,s.st,'font-size="14" font-weight="700"')+(run?`<g>${[40,80,120,160].map(x=>`<path d="M${x} 296 q-6 -8 0 -16 q6 -8 0 -16" fill="none" stroke="${OR}" stroke-width="2.5"/>`).join('')}</g>`:'')+T(105,312,run?'heater ON':'heater off','font-size="11"');
 g+=`<line x1="${GX0}" y1="${GY0}" x2="${GX0+GW}" y2="${GY0}" stroke="${ink}"/><line x1="${GX0}" y1="${GY0}" x2="${GX0}" y2="${GY0-GH}" stroke="${ink}"/>`;
 [-20,0,50,100,130].forEach(t=>g+=`<line x1="${GX0-4}" y1="${TY(t)}" x2="${GX0}" y2="${TY(t)}" stroke="${ink}"/>`+T(GX0-18,TY(t)+4,t,'font-size="10"'));
 g+=`<path d="${CP}" fill="none" stroke="${GR}" stroke-width="2" stroke-dasharray="4 4"/>`;
 let dd='';for(let i=0;i<=120;i++){const q=HQ*i/120;dd+=(i?'L':'M')+TX(q).toFixed(1)+' '+TY(stateAt(q).T).toFixed(1)}g+=`<path d="${dd}" fill="none" stroke="${OR}" stroke-width="3"/><circle cx="${TX(HQ)}" cy="${TY(s.T)}" r="6" fill="${OR}"/>`;
 g+=T(GX0+GW/2,GY0+22,'heat supplied →','font-size="11"')+T(GX0+10,GY0-GH-8,'°C','font-size="11"');
 $('#hcSvg').innerHTML=g;$('#hcPv').textContent=P;$('#hcGo').textContent=run?'Pause':(HQ>=EMAX?'Done':'Heat');
 const t=HQ/P;$('#hcOut').innerHTML=`<p><b>${s.st}</b> · temperature <b>${s.T.toFixed(1)} °C</b> (${(s.T+273).toFixed(0)} K)</p><p>Heat supplied: ${(HQ/1000).toFixed(1)} kJ in ${t.toFixed(0)} s at ${P} W.</p><p>${s.T===0&&HQ>E1?'The temperature is stuck at 0 °C: heat is breaking the solid apart (latent heat of fusion, 33.4 kJ for 100 g).':s.T===100&&HQ>E3?'Stuck at 100 °C: heat is pulling particles completely apart (latent heat of vaporisation, 226 kJ — the longest flat part!).':'The temperature rises: particles gain kinetic energy.'}</p>`}
function loop(ts){if(!$('#hcSvg')||!$('#hcSvg').isConnected||($('#v-lab')&&$('#v-lab').hidden)){looping=false;return}const dt=last?Math.min(.05,(ts-last)/1000):0;last=ts;
 if(run){HQ=Math.min(EMAX,HQ+P*dt*60);if(HQ>=EMAX)run=false}step(stateAt(HQ));draw();requestAnimationFrame(loop)}
function labShow(){if(!parts.length)initParts();last=0;if(!looping){looping=true;requestAnimationFrame(loop)}}
function labInit(){if(wired)return;wired=true;initParts();document.addEventListener('input',e=>{if(e.target&&e.target.id==='hcP'){P=+e.target.value}})}
function labClick(b){if(b.id==='hcGo'){if(HQ>=EMAX)return true;run=!run;return true}if(b.id==='hcReset'){run=false;HQ=0;initParts();return true}return false}
function labChange(){return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
