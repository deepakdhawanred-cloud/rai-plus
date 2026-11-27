/* Rai Plus content pack: Class 9 Science, Chapter 9 – Gravitation (rationalised NCERT). Bilingual: Hindi terms alongside. */
RP.register({key:'9sci09',cls:'9',subject:'Science',ch:'9',title:"Gravitation",color:'#5b3f8f',
crumb:"HBSE Class 9 Science · गुरुत्वाकर्षण · Taught in November",h1:"Chapter 9: Gravitation · गुरुत्वाकर्षण",sub:"The universal law of gravitation, free fall and g, mass and weight, thrust and pressure, buoyancy and Archimedes' principle.",heroLabel:"The Earth pulling the Moon",labName:'Weight & buoyancy lab',
theme:"\n:root{--g:light-dark(#5b3f8f,#c3b0e8);--g2:light-dark(#f2eefa,#17112a);--line:light-dark(#ddd3f0,#33284d);--bg:light-dark(#ffffff,#0e0b16);--card:light-dark(#ffffff,#15111f);\n--ink:light-dark(#18122a,#ece6f7);--mute:light-dark(#5c5274,#b5abc9);--y:light-dark(#b35a14,#f2a86a);--y2:light-dark(#fbefe4,#2a170a);--hd:#43296f}\n",
labHTML:`  <h2>Weight &amp; buoyancy lab · भार और उत्प्लावकता प्रयोगशाला</h2>
  <p><b>Planets:</b> your mass stays the same everywhere, but your weight W = mg changes with g. <b>Archimedes:</b> hang a block from a spring balance and lower it into a liquid. The reading drops by the weight of liquid displaced — the buoyant force. If the block is less dense than the liquid, it floats.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="gvSvg" viewBox="0 0 520 330" role="img" aria-label="Gravitation experiment" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Experiment<select id="gvM"><option value="b">Archimedes' principle · आर्किमिडीज़ सिद्धांत</option><option value="w">Weight on other worlds · भार</option></select></label></div>
  <div id="gvB"><div class="ctrl"><label>Block material<select id="gvMat"><option value="400">Wood (400 kg/m³)</option><option value="900">Ice (900 kg/m³)</option><option value="2700" selected>Aluminium (2700 kg/m³)</option><option value="7800">Iron (7800 kg/m³)</option></select></label></div>
  <div class="ctrl"><label>Liquid<select id="gvLiq"><option value="1000">Water (1000 kg/m³)</option><option value="1200">Strong salt water (1200 kg/m³)</option><option value="800">Kerosene (800 kg/m³)</option></select></label></div>
  <div class="ctrl"><label><span>Lower the block: <b id="gvDv"></b>%</span><input type="range" class="gvS" id="gvD" min="0" max="100" value="0"></label></div></div>
  <div id="gvW" style="display:none"><div class="ctrl"><label><span>Mass: <b id="gvMv"></b> kg</span><input type="range" class="gvS" id="gvMs" min="10" max="100" value="50"></label></div></div>
  <div class="box y" id="gvOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#5b3f8f',LABNAME='Weight & buoyancy lab',MIND_CENTER='Gravitation';
const PU='#5b3f8f',OR='#b35a14',BL='#1f5f8b',GN='#3b6d11',RD='#c0392b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const arrow=(x1,y1,x2,y2,c=OR,w=3)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" marker-end="url(#ah)"/>`;
function heroDraw(){return `<circle cx="110" cy="75" r="45" fill="#fff" opacity=".9"/><circle cx="290" cy="60" r="16" fill="#fff" opacity=".7"/><path d="M160 72 L268 62" stroke="#fff" stroke-width="2" stroke-dasharray="6 5"/><path d="M240 64 l28 -2 l-24 12" fill="none" stroke="#fff" stroke-width="2"/>`}
const HERO=heroDraw;
const MIND=[['Universal law',100,50],['Free fall & g',420,50],['Mass vs weight',90,150],['Thrust & pressure',430,150],['Buoyancy · उत्प्लावकता',110,250],['Archimedes',410,250]];

const C=[
{id:'v1',num:'9.1',title:'Universal law of gravitation · गुरुत्वाकर्षण का सार्वत्रिक नियम',
 intro:'An apple falls to the ground, but the Moon does not. Or does it?',
 obj:'State the universal law of gravitation and use F = Gm₁m₂/d².',
 prior:'Chapter 7: circular motion; Chapter 8: force.',
 simple:'Every object in the universe attracts every other object with a force. This force is proportional to the product of their masses and inversely proportional to the square of the distance between them: F = G m₁m₂ ÷ d². G is the universal gravitational constant: 6.7 × 10⁻¹¹ N m²/kg².',
 detail:'Newton realised that the force that makes an apple fall also keeps the Moon in its orbit — the Moon is continuously "falling" towards the Earth while moving sideways, so it goes round. Doubling the distance makes the force one-fourth (inverse square). The law explains: the force that binds us to the Earth, the motion of the Moon around the Earth, planets around the Sun, and tides due to the Moon and the Sun.',
 real:'High and low tides at the sea are caused mainly by the Moon\'s gravitational pull.',
 apply:'If the distance between two objects is tripled, what happens to the gravitational force?',
 see:{w:520,h:200,f:[
  ['Two masses.',`<circle cx="120" cy="100" r="40" fill="${PU}" fill-opacity=".3" stroke="${PU}" stroke-width="2"/><circle cx="400" cy="100" r="22" fill="${OR}" fill-opacity=".3" stroke="${OR}" stroke-width="2"/>`+lbl(120,105,'m₁')+lbl(400,105,'m₂')],
  ['They pull each other.',arrow(165,100,230,100,PU)+arrow(375,100,310,100,OR)+`<line x1="120" y1="160" x2="400" y2="160" stroke="${GR}"/>`+lbl(260,180,'d')],
  ['F = G m₁m₂ / d².',lbl(260,40,'F = G m₁m₂ ÷ d²','font-size="18" font-weight="700" fill="'+PU+'"')]]},
 seeNote:'Mass increases it; distance weakens it fast.',
 do:{title:'Inverse square with light',mat:'Torch, graph paper',steps:['Shine the torch at the paper from 10 cm and 20 cm.','Count lit squares.'],obs:'4 times the area at double distance.',why:'Inverse square idea.',lab:false},
 memo:'"Multiply the masses, divide by the square of the distance."',
 miscon:['"Only the Earth pulls; small objects don\'t." Every pair of objects attracts; small masses give tiny forces.'],
 terms:['Gravitation · गुरुत्वाकर्षण','Universal constant G','Inverse square law · व्युत्क्रम वर्ग नियम'],
 q:{q:'If the distance is doubled, F becomes:',o:['double','half','one-fourth','four times'],a:2,why:'1/d².'},
 exam:'State the law; ratio questions: 2–3 marks.'},

{id:'v2',num:'9.2',title:'Free fall and acceleration due to gravity · मुक्त पतन',
 intro:'Drop a stone and a sheet of paper. Now crumple the paper and drop them again. What changed?',
 obj:'Explain free fall and calculate g; solve free-fall problems.',
 prior:'9.1; equations of motion.',
 simple:'When an object falls only under gravity, it is in free fall (मुक्त पतन). It accelerates at g, the acceleration due to gravity (गुरुत्वीय त्वरण) ≈ 9.8 m/s² near the Earth\'s surface. All objects fall with the same g whatever their mass — air resistance makes light, spread-out objects fall slower.',
 detail:'g = GM ÷ R², where M is the mass of the Earth (6 × 10²⁴ kg) and R its radius (6.4 × 10⁶ m). g is slightly more at the poles than at the equator (Earth is flatter at the poles). Equations of motion with g: v = u + gt, h = ut + ½gt², v² = u² + 2gh (take g negative for upward motion). A stone thrown up slows by 9.8 m/s every second until it stops, then falls back.',
 real:'Skydivers fall faster when they curl up and slower when they spread out — air resistance.',
 apply:'A stone is dropped from a 20 m tower. Find the time to reach the ground and its speed (g = 10 m/s²).',
 see:{w:520,h:220,f:[
  ['A ball dropped.',`<circle cx="160" cy="30" r="10" fill="${OR}"/>`],
  ['Gaps grow each second.',[0,1,2,3].map(k=>`<circle cx="160" cy="${30+4.9*k*k*3.5}" r="10" fill="${OR}" opacity="${.3+k*.23}"/>`+lbl(220,(k===0?26:k===1?52:34)+4.9*k*k*3.5,'t = '+k+' s, v = '+(9.8*k).toFixed(1)+' m/s','fill="'+BL+'"')).join('')],
  ['g ≈ 9.8 m/s².',lbl(420,110,'g ≈ 9.8 m/s²','font-size="20" font-weight="700" fill="'+PU+'"')+lbl(420,140,'same for all masses')]]},
 seeNote:'Every second adds 9.8 m/s.',
 do:{title:'Paper and stone',mat:'Stone, two sheets of paper',steps:['Drop a stone and a flat sheet together.','Crumple a sheet; drop it with the stone.'],obs:'Crumpled paper lands with the stone.',why:'Air resistance; same g.',lab:true},
 memo:'"Without air, a feather and a hammer fall together."',
 miscon:['"Heavier objects fall faster." Without air resistance, all fall with the same acceleration.'],
 terms:['Free fall · मुक्त पतन','Acceleration due to gravity · गुरुत्वीय त्वरण','g = 9.8 m/s²'],
 q:{q:'A ball is dropped. Its speed after 2 s (g = 10 m/s²):',o:['10 m/s','20 m/s','5 m/s','40 m/s'],a:1,why:'v = gt.'},
 exam:'Free-fall numericals; derive g = GM/R²: 3 marks.'},

{id:'v3',num:'9.3',title:'Mass and weight · द्रव्यमान और भार',
 intro:'An astronaut weighs 600 N on Earth. Has she lost mass on the Moon, where the scale shows 100 N?',
 obj:'Distinguish mass and weight and calculate weight on the Earth and the Moon.',
 prior:'9.2.',
 simple:'Mass (द्रव्यमान) is the amount of matter in an object, measured in kg; it is the same everywhere. Weight (भार) is the force with which the Earth (or another body) pulls an object: W = mg, measured in newtons. Weight changes with g.',
 detail:'On the Moon, g is about 1/6 of the Earth\'s, so weight on the Moon = 1/6 of weight on the Earth. 60 kg astronaut: Earth weight 588 N, Moon weight 98 N, mass still 60 kg. A beam balance compares masses (works the same on the Moon); a spring balance measures weight (reads less on the Moon). 1 kg-wt = 9.8 N.',
 real:'Astronauts can jump much higher on the Moon because their weight is much less.',
 apply:'A bag has a mass of 12 kg. What is its weight on the Earth and on the Moon?',
 see:{w:520,h:200,f:[
  ['Same mass.',lbl(260,40,'mass = 60 kg (everywhere)','font-size="16" font-weight="700"')],
  ['Earth weight.',`<circle cx="130" cy="120" r="40" fill="${BL}" fill-opacity=".3" stroke="${BL}"/>`+lbl(130,125,'Earth')+lbl(130,185,'W = 60 × 9.8 = 588 N','fill="'+BL+'"')],
  ['Moon weight.',`<circle cx="390" cy="120" r="24" fill="${GR}" fill-opacity=".4" stroke="${GR}"/>`+lbl(390,125,'Moon')+lbl(390,185,'W = 588 ÷ 6 = 98 N','fill="'+GR+'"')]]},
 seeNote:'Mass stays; weight changes.',
 do:{title:'Spring vs beam',mat:'Spring balance, beam balance, weights',steps:['Weigh an object with both.','Discuss which would change on the Moon.'],obs:'Spring balance measures weight.',why:'W = mg.',lab:false},
 memo:'"Mass is how much; weight is how hard it\'s pulled."',
 miscon:['"Weight is measured in kg." Weight is a force, in newtons.'],
 terms:['Mass · द्रव्यमान','Weight · भार','W = mg','Newton'],
 q:{q:'Weight of a 10 kg object on the Moon (g_M ≈ 1.63 m/s²):',o:['10 N','16.3 N','98 N','1.63 N'],a:1,why:'10 × 1.63.'},
 exam:'Mass vs weight; Moon weight numericals: 2–3 marks.'},

{id:'v4',num:'9.4',title:'Thrust and pressure · प्रणोद और दाब',
 intro:'Why does a camel walk easily on sand while a man sinks, and why are knives sharp?',
 obj:'Define thrust and pressure and explain everyday examples.',
 prior:'Class 8: pressure.',
 simple:'Thrust (प्रणोद) is the force acting perpendicular to a surface. Pressure (दाब) = thrust ÷ area. SI unit: pascal (Pa) = 1 N/m². The same force gives more pressure on a smaller area and less pressure on a larger area.',
 detail:'Examples: wide straps on school bags and broad tyres on tractors reduce pressure; sharp knives and pointed nails increase pressure. Liquids and gases exert pressure in all directions; pressure in a liquid increases with depth. A 50 kg person (490 N) standing on two feet (0.05 m²) exerts ≈ 9800 Pa; on one heel (0.005 m²) ≈ 98,000 Pa.',
 real:'Snowshoes and camel feet spread weight over a large area so they don\'t sink.',
 apply:'A block weighing 50 N has faces 0.5 m × 0.2 m, 0.5 m × 0.1 m and 0.2 m × 0.1 m. On which face is the pressure greatest?',
 see:{w:520,h:200,f:[
  ['Same thrust.',`<rect x="60" y="100" width="140" height="50" fill="${OR}" fill-opacity=".3" stroke="${OR}"/><rect x="330" y="60" width="50" height="90" fill="${OR}" fill-opacity=".3" stroke="${OR}"/>`+arrow(130,50,130,96,PU)+arrow(355,15,355,56,PU)],
  ['Different area.',lbl(130,175,'large area → low pressure','fill="'+BL+'"')+lbl(355,175,'small area → high pressure','fill="'+RD+'"')],
  ['P = F / A.',lbl(260,25,'pressure = thrust ÷ area','font-weight="700"')]]},
 seeNote:'Spread it out or focus it.',
 do:{title:'Sand footprints',mat:'Tray of sand, brick',steps:['Place a brick flat, then on its end.','Compare the dents.'],obs:'Deeper dent on the end.',why:'Smaller area, more pressure.',lab:false},
 memo:'"Small area, big pressure."',
 miscon:['"Pressure and force are the same." Pressure is force per unit area.'],
 terms:['Thrust · प्रणोद','Pressure · दाब','Pascal (Pa) · पास्कल'],
 q:{q:'1 pascal equals:',o:['1 N m','1 N/m²','1 kg/m²','1 J/m'],a:1,why:'Definition.'},
 exam:'Pressure numericals and examples: 2–3 marks.'},

{id:'v5',num:'9.5',title:'Buoyancy · उत्प्लावकता',
 intro:'Push an empty plastic bottle into a bucket of water. Why does it fight back?',
 obj:'Explain buoyant force and why objects float or sink.',
 prior:'9.4; density.',
 simple:'A liquid pushes up on any object placed in it. This upward force is the buoyant force or upthrust (उत्प्लावन बल). If the buoyant force is greater than or equal to the object\'s weight, it floats; if less, it sinks. An object floats if its density is less than the liquid\'s density.',
 detail:'Density (घनत्व) = mass ÷ volume (kg/m³). Water: 1000 kg/m³. Iron (7800) sinks; wood (about 400–700) floats; ice (900) floats with about 9/10 under water. A huge iron ship floats because its hollow shape displaces a large volume of water. Relative density = density of substance ÷ density of water (no unit).',
 real:'People float easily in the Dead Sea because very salty water is much denser.',
 apply:'A 500 g sealed packet has a volume of 350 cm³. Will it float or sink in water?',
 see:{w:520,h:220,f:[
  ['Water tank.',`<rect x="60" y="80" width="400" height="120" fill="${BL}" fill-opacity=".15" stroke="${BL}"/>`],
  ['Cork floats.',`<rect x="130" y="66" width="50" height="34" fill="${OR}" fill-opacity=".6"/>`+arrow(155,150,155,108,GN)+lbl(155,50,'wood floats')],
  ['Iron sinks.',`<rect x="330" y="166" width="40" height="34" fill="${GR}"/>`+arrow(350,210,350,212,GN)+lbl(350,150,'iron sinks')+lbl(260,25,'float if density < liquid','font-weight="700"')]]},
 seeNote:'Density decides.',
 do:{title:'Float or sink',mat:'Bucket of water; cork, coin, nail, plastic, wax',steps:['Predict, then test each object.','Check densities.'],obs:'Less dense objects float.',why:'Buoyancy.',lab:true},
 memo:'"Lighter than the liquid (per volume) floats."',
 miscon:['"Heavy things always sink." A heavy ship floats because of its shape and large displaced volume.'],
 terms:['Buoyancy · उत्प्लावकता','Upthrust · उत्प्लावन बल','Density · घनत्व','Relative density · आपेक्षिक घनत्व'],
 q:{q:'An object of density 800 kg/m³ in water will:',o:['sink','float','dissolve','stay in the middle'],a:1,why:'Less dense than water.'},
 exam:'Float/sink with density: 2 marks.'},

{id:'v6',num:'9.6',title:"Archimedes' principle · आर्किमिडीज़ का सिद्धांत",
 intro:'King Hiero wanted to know if his crown was pure gold. Archimedes found the answer in his bath.',
 obj:"State Archimedes' principle and apply it.",
 prior:'9.5.',
 simple:"Archimedes' principle: when a body is fully or partially immersed in a liquid, it experiences an upward force equal to the weight of the liquid displaced by it. A spring balance shows less weight when the object is in water — the loss in weight equals the buoyant force.",
 detail:'Buoyant force = density of liquid × volume immersed × g. Uses: designing ships and submarines; hydrometers to measure density of liquids; lactometers to check the purity of milk. A stone that weighs 2 N in air and 1.5 N in water experiences a 0.5 N upthrust, so it displaces 0.5 N of water (≈ 51 cm³).',
 real:'Dairies use lactometers, which work on Archimedes\' principle, to detect water mixed in milk.',
 apply:'A block weighs 10 N in air and 6 N in water. Find the buoyant force and the volume of the block.',
 see:{w:520,h:230,f:[
  ['In air: 2 N.',`<line x1="140" y1="20" x2="140" y2="60" stroke="${ink}" stroke-width="2"/><rect x="125" y="60" width="30" height="40" fill="${GR}"/>`+lbl(140,125,'reads 2.0 N')],
  ['In water: 1.5 N.',`<rect x="300" y="110" width="160" height="100" fill="${BL}" fill-opacity=".18" stroke="${BL}"/><line x1="380" y1="20" x2="380" y2="130" stroke="${ink}" stroke-width="2"/><rect x="365" y="130" width="30" height="40" fill="${GR}"/>`+arrow(380,200,380,176,GN)+lbl(380,95,'reads 1.5 N')],
  ['Loss = upthrust = water displaced.',lbl(260,222,'loss in weight 0.5 N = weight of water displaced','font-weight="700" fill="'+PU+'"')]]},
 seeNote:'Lost weight goes to the water.',
 do:{title:'Stone in water',mat:'Spring balance, stone, beaker of water',steps:['Weigh the stone in air.','Weigh it immersed; compare.'],obs:'Reading drops.',why:'Upthrust.',lab:true},
 memo:'"Weight lost = water pushed out."',
 miscon:['"The object loses mass in water." It loses apparent weight; mass is unchanged.'],
 terms:["Archimedes' principle · आर्किमिडीज़ का सिद्धांत",'Lactometer · दुग्धमापी','Hydrometer · घनत्वमापी','Apparent weight'],
 q:{q:'An object weighs 8 N in air and 5 N in water. Upthrust:',o:['13 N','3 N','5 N','8 N'],a:1,why:'8 − 5.'},
 exam:"State and apply Archimedes' principle: 3 marks."}
];

const CARDS=[['Universal law','F = G m₁m₂ ÷ d².'],['G','6.7 × 10⁻¹¹ N m²/kg².'],['Inverse square','Double d → force ÷ 4.'],['Free fall · मुक्त पतन','Only gravity acts; a = g.'],['g','≈ 9.8 m/s²; g = GM ÷ R².'],['Mass','Amount of matter; kg; constant.'],['Weight','W = mg; newtons; varies.'],['Moon','g and weight ≈ 1/6 of Earth.'],['Thrust · प्रणोद','Perpendicular force.'],['Pressure · दाब','Thrust ÷ area; Pa.'],['Buoyancy','Upward push of a liquid.'],['Float rule','Floats if density < liquid.'],["Archimedes",'Upthrust = weight of liquid displaced.']];

const Q=[
 {lv:1,q:'SI unit of pressure:',o:['newton','pascal','joule','watt'],a:1,w:'N/m².'},
 {lv:1,q:'Value of g near Earth\'s surface:',o:['6.7 m/s²','9.8 m/s²','1.6 m/s²','98 m/s²'],a:1,w:'Standard value.'},
 {lv:1,q:'Weight is measured in:',o:['kg','N','g','m/s²'],a:1,w:'A force.'},
 {lv:2,q:'Weight of a 20 kg object on Earth (g = 9.8):',o:['20 N','196 N','2.04 N','29.8 N'],a:1,w:'20 × 9.8.'},
 {lv:2,q:'Why are school bag straps wide?',o:['look nice','reduce pressure','increase pressure','reduce weight'],a:1,w:'Larger area.'},
 {lv:2,q:'Which floats in water?',o:['iron','ice','lead','stone'],a:1,w:'900 kg/m³.'},
 {lv:3,q:'If both masses double and distance doubles, F becomes:',o:['same','double','four times','half'],a:0,w:'4 ÷ 4.'},
 {lv:3,q:'A stone falls for 3 s (g = 10). Distance fallen:',o:['30 m','45 m','90 m','15 m'],a:1,w:'½ × 10 × 9.'},
 {lv:4,q:'A 60 kg astronaut on the Moon (g ≈ 1.63): weight ≈',o:['60 N','98 N','588 N','36 N'],a:1,w:'60 × 1.63.'},
 {lv:4,q:'A ball thrown up at 20 m/s rises to (g = 10):',o:['10 m','20 m','40 m','2 m'],a:1,w:'v² = u² − 2gh.'},
 {lv:5,open:true,m:3,q:'Why does a heavy iron ship float while an iron nail sinks?',ans:['Floating depends on buoyant force vs weight (1)','Ship\'s hollow shape displaces a large volume of water (1)','Upthrust equals its weight; nail\'s small volume gives too little upthrust (1)']},
 {lv:5,open:true,m:5,q:"State Archimedes' principle. A body weighs 25 N in air and 20 N when fully immersed in water. Find (a) the buoyant force (b) its volume (c) its density. (g = 10 m/s²)",ans:['Statement (1)','Buoyant force = 5 N (1)','Water displaced: 0.5 kg → volume 5 × 10⁻⁴ m³ (1)','Mass = 2.5 kg (1)','Density = 2.5 ÷ 0.0005 = 5000 kg/m³ (1)']}
];

const ONEMIN=['F = G m₁m₂/d².','Free fall: g = 9.8 m/s².','Mass vs weight; Moon 1/6.','Pressure = thrust ÷ area.','Buoyancy: density decides float/sink.',"Archimedes: upthrust = weight displaced."];
const KEYS=[['universal law',/universal|G m|गुरुत्वाकर्षण/i],['g',/free fall|9\.8|मुक्त पतन/i],['weight',/weight|mass|भार/i],['pressure',/pressure|thrust|दाब/i],['buoyancy',/buoyan|float|sink|उत्प्लाव/i],['archimedes',/archimedes|आर्किमिडीज़/i]];

/* ---------- lab ---------- */
let mode='b',rho=2700,liq=1000,dep=0,mass=50,wired=false;
const V=0.001,g=9.8;
const PL=[['Moon',1.63,GR],['Mercury',3.7,'#a0846b'],['Mars',3.71,RD],['Earth',9.8,BL],['Jupiter',24.8,OR]];
function drawB(){const W=rho*V*g;const sub=Math.min(1,rho/liq);const floats=rho<liq;const frac=floats?Math.min(dep/100,sub):dep/100;const Fb=liq*V*frac*g;const read=Math.max(0,W-Fb);
 let s='';const tankTop=170,waterY=190;s+=`<rect x="140" y="${tankTop}" width="240" height="140" fill="none" stroke="${ink}" stroke-width="2"/><rect x="141" y="${waterY}" width="238" height="119" fill="${liq===800?'#e9c46a':BL}" fill-opacity="${liq===1200?.3:.18}"/>`;
 const bh=60,bw=60;const top=waterY-bh+frac*bh;const bx=230;
 s+=`<line x1="260" y1="20" x2="260" y2="60" stroke="${ink}" stroke-width="2"/><rect x="235" y="60" width="50" height="60" rx="6" fill="${PU}" fill-opacity=".15" stroke="${PU}" stroke-width="2"/>`;
 const spr=Math.max(4,read/W*36||4);s+=`<path d="M260 66 ${[...Array(6)].map((_,i)=>`L${i%2?268:252} ${66+(i+1)*spr/6}`).join(' ')}" fill="none" stroke="${PU}" stroke-width="2"/>`+T(260,112,read.toFixed(1)+' N','font-size="12" font-weight="700" fill="'+PU+'"');
 s+=`<line x1="260" y1="120" x2="260" y2="${top}" stroke="${ink}" stroke-width="1.5" stroke-dasharray="${read<0.05?'3 3':'0'}"/>`;
 const col={400:'#b07a3a',900:'#bfe3f5',2700:'#b8b8c0',7800:'#5b5b66'}[rho];s+=`<rect x="${bx}" y="${top}" width="${bw}" height="${bh}" fill="${col}" stroke="${ink}" stroke-width="1.5"/>`;
 if(Fb>0)s+=arrow(bx+bw+16,top+bh+20,bx+bw+16,top+bh-10,GN)+T(bx+bw+60,top+bh+10,'upthrust '+Fb.toFixed(1)+' N','font-size="11" fill="'+GN+'"');
 s+=arrow(bx-14,top+10,bx-14,top+50,RD)+T(75,top+34,'weight '+W.toFixed(1)+' N','font-size="12" fill="'+RD+'"');
 $('#gvSvg').innerHTML=s;$('#gvDv').textContent=dep;
 $('#gvOut').innerHTML=`<p>Block: 1 litre (0.001 m³), density ${rho} kg/m³ → weight in air <b>${W.toFixed(1)} N</b>.</p><p>Submerged ${Math.round(frac*100)}% → liquid displaced ${(frac*1000).toFixed(0)} cm³ → upthrust = ${liq} × ${(V*frac).toFixed(4)} × 9.8 = <b>${Fb.toFixed(1)} N</b>.</p><p>Spring balance reads <b>${read.toFixed(1)} N</b>. ${floats?(frac>=sub-0.001?`It <b>floats</b> with ${Math.round(sub*100)}% under the surface: the upthrust equals its weight, so the balance reads zero.`:'Keep lowering: it will float.'):(dep===100?`It <b>sinks</b>: even fully under, upthrust (${Fb.toFixed(1)} N) is less than its weight.`:'Loss in weight = weight of liquid displaced (Archimedes).')}</p>`}
function drawW(){let s='';PL.forEach(([n,gg,c],i)=>{const x=60+i*100,W=mass*gg;const h=Math.min(200,W/2500*200);s+=`<rect x="${x-26}" y="${270-h}" width="52" height="${h}" rx="6" fill="${c}" fill-opacity=".55"/>`+T(x,290,n,'font-size="13" font-weight="700"')+T(x,262-h,Math.round(W)+' N','font-size="12"')+T(x,310,'g = '+gg,'font-size="10.5"')});
 s+=T(260,30,`mass = ${mass} kg on every world`,'font-size="16" font-weight="700" fill="'+PU+'"');$('#gvSvg').innerHTML=s;$('#gvMv').textContent=mass;
 $('#gvOut').innerHTML=`<p>W = m × g. On Earth: ${mass} × 9.8 = <b>${(mass*9.8).toFixed(0)} N</b>; on the Moon: ${mass} × 1.63 = <b>${(mass*1.63).toFixed(0)} N</b> (about one-sixth).</p><p>Your mass, ${mass} kg, does not change — only the pull (g) of each world does.</p>`}
function draw(){$('#gvB').style.display=mode==='b'?'':'none';$('#gvW').style.display=mode==='w'?'':'none';mode==='b'?drawB():drawW()}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const el=e.target;if(!el||!el.classList||!el.classList.contains('gvS'))return;if(el.id==='gvD')dep=+el.value;else mass=+el.value;draw()})}
function labClick(){return false}
function labChange(el){if(el.id==='gvM'){mode=el.value;draw();return true}if(el.id==='gvMat'){rho=+el.value;draw();return true}if(el.id==='gvLiq'){liq=+el.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
