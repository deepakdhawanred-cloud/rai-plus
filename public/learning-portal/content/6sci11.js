/* Rai Plus content pack: Class 6 Science (Curiosity), Chapter 11 – Nature's Treasures. Bilingual terms. */
RP.register({key:'6sci11',cls:'6',subject:'Science',ch:'11',title:"Nature's Treasures",color:'#2c7a5b',
crumb:"Class 6 Science · Curiosity · प्रकृति के खज़ाने",h1:"Chapter 11: Nature's Treasures",sub:"प्रकृति के खज़ाने. Air, water, sunlight, soil, forests and fuels: using natural resources wisely.",heroLabel:"Sun, wind, water, a tree and coal",labName:'Resource bank',
theme:"\n:root{--g:light-dark(#2c7a5b,#8fd6b8);--g2:light-dark(#e6f4ee,#0a1a14);--line:light-dark(#c8e6d8,#1f3f32);--bg:light-dark(#ffffff,#07110d);--card:light-dark(#ffffff,#0c1812);\n--ink:light-dark(#0d241b,#dff1e9);--mute:light-dark(#466457,#a8c9ba);--y:light-dark(#9a4a14,#f0a877);--y2:light-dark(#fbeee4,#2a160a);--hd:#1f5c43}\n",
labHTML:`  <h2>Resource bank · संसाधन बैंक</h2>
  <p>Run a village for 30 years. Choose how fast to use coal and how much to plant and save. Watch the stocks.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="rSvg" viewBox="0 0 460 300" role="img" aria-label="Resource stocks over time" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Coal burnt per year: <b id="rCv"></b><input type="range" class="rS" id="rC" min="0" max="10" value="6"></label></div><div class="ctrl"><label>Trees cut per year: <b id="rTv"></b><input type="range" class="rS" id="rT" min="0" max="20" value="12"></label></div><div class="ctrl"><label>Trees planted per year: <b id="rPv"></b><input type="range" class="rS" id="rP" min="0" max="20" value="5"></label></div><div class="ctrl"><label>Solar panels<select id="rSol"><option value="0">None</option><option value="1">Some</option><option value="2">Many</option></select></label></div><div class="box y" id="rOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#2c7a5b',LABNAME='Resource bank',MIND_CENTER='Natural resources · प्राकृतिक संसाधन';
const GN='#2c7a5b',LG='#8fd6b8',BR='#6b4a2a',BL='#2f6f8a',YE='#e0a92a',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const tree=(x,y,s=1)=>`<rect x="${x-3*s}" y="${y-20*s}" width="${6*s}" height="${20*s}" fill="${BR}"/><circle cx="${x}" cy="${y-30*s}" r="${16*s}" fill="${GN}" opacity=".85"/>`;
function heroDraw(){return `<circle cx="50" cy="40" r="18" fill="#fff"/><path d="M110 40 h40 M110 55 h30" stroke="#fff" stroke-width="3"/><path d="M180 100 q20 -14 40 0 t40 0" stroke="#fff" stroke-width="3" fill="none"/><rect x="290" y="70" width="6" height="30" fill="#fff"/><circle cx="293" cy="60" r="16" fill="#fff" opacity=".85"/>`}
const HERO=heroDraw;
const MIND=[['What are resources?',100,50],['Air, water, sunlight',420,50],['Soil & forests',90,150],['Minerals & fuels',430,150],['Renewable or not',110,250],['Use wisely',410,250]];

const C=[
{id:'n1',num:'11.1',title:'Natural resources · प्राकृतिक संसाधन',
 intro:'List everything you used this morning. Where did each come from?',
 obj:'Define natural resources and give examples.',
 prior:'Materials around us (Ch 6), water (Ch 8).',
 simple:'Natural resources (प्राकृतिक संसाधन) are materials and energy from nature that we use: air, water, sunlight, soil, plants and animals, forests, minerals, rocks, coal, petroleum and natural gas. Humans did not make them; we only use or change them.',
 detail:'Things made by humans from natural resources (cloth, paper, bricks, plastic) are human-made. Natural resources are shared by all living things, not only humans. Their use must be fair to other people, other living things, and future generations.',
 real:'A cotton shirt: cotton (plant) + water + sunlight + soil: many natural resources.',
 apply:'Trace a notebook back to its natural resources.',
 see:{w:520,h:220,f:[
  ['Sunlight and air.',`<circle cx="60" cy="50" r="22" fill="#f2b632"/><path d="M110 50 h50 M110 65 h40" stroke="${GR}" stroke-width="2"/>`+lbl(60,95,'sunlight')+lbl(140,95,'air')],
  ['Water and soil.',`<path d="M220 80 q20 -12 40 0 t40 0" stroke="${BL}" stroke-width="3" fill="none"/><rect x="330" y="65" width="80" height="20" fill="${BR}" opacity=".7"/>`+lbl(260,105,'water')+lbl(370,105,'soil')],
  ['Forests, minerals and fuels.',tree(90,190)+`<path d="M220 190 l20 -30 l20 30z" fill="${GR}"/><rect x="330" y="165" width="40" height="25" fill="#333"/>`+lbl(90,210,'forest')+lbl(240,210,'minerals')+lbl(350,210,'coal')]]},
 seeNote:'Nature provides; we use.',
 do:{title:'Resource trail',mat:'Notebook',steps:['Choose 5 things you used today.','For each, write the natural resources it came from.'],obs:'Everything traces back to nature.',why:'Natural resources.',lab:false},
 memo:'"If nature made it, it\'s a natural resource."',
 miscon:['"Plastic is a natural resource." It is made by humans from petroleum.'],
 terms:['Natural resource · प्राकृतिक संसाधन','Human-made · मानव निर्मित','Mineral · खनिज'],
 q:{q:'Which is a natural resource?',o:['plastic bottle','sunlight','brick','paper'],a:1,why:'Sunlight is from nature.'},
 exam:'Define natural resources with examples: 2 marks.'},

{id:'n2',num:'11.2',title:'Air, water and sunlight · वायु, जल, सूर्य का प्रकाश',
 intro:'What would happen if the Sun stopped shining for a week?',
 obj:'Explain the importance of air, water and sunlight.',
 prior:'Water cycle (Ch 8).',
 simple:'Air is a mixture of gases: mainly nitrogen and oxygen, with small amounts of carbon dioxide, water vapour and others. Living things need oxygen to breathe; plants need carbon dioxide to make food. Moving air (wind) turns windmills and helps winnowing. Water is needed by all living things, for farming and industry. Sunlight gives light and heat, helps plants make food, drives the water cycle, and solar panels turn it into electricity.',
 detail:'Air pollution (smoke, dust, stubble burning) harms health; Delhi–NCR, including Rewari, faces poor air in winter. Fresh usable water is limited, so save it. Sunlight is plentiful in India; solar energy is clean.',
 real:'Rooftop solar panels in Haryana villages supply electricity and pump water for farms.',
 apply:'Name two ways sunlight is useful besides giving light.',
 see:{w:520,h:220,f:[
  ['Air: mostly nitrogen and oxygen.',`<circle cx="90" cy="110" r="60" fill="#d9eef7"/><path d="M90 110 L90 50 A60 60 0 1 1 46 151 Z" fill="${BL}" opacity=".6"/><path d="M90 110 L46 151 A60 60 0 0 1 82 50 Z" fill="${GN}" opacity=".6"/>`+lbl(130,200,'nitrogen (most) · oxygen','font-size="12"')],
  ['Wind turns windmills.',`<line x1="270" y1="70" x2="270" y2="190" stroke="${ink}" stroke-width="3"/>`+[0,120,240].map(a=>`<path d="M270 70 l${(40*Math.cos(a*Math.PI/180)).toFixed(1)} ${(40*Math.sin(a*Math.PI/180)).toFixed(1)}" stroke="${ink}" stroke-width="5"/>`).join('')],
  ['Sunlight → solar panel → electricity.',`<circle cx="470" cy="40" r="20" fill="#f2b632"/><rect x="380" y="120" width="80" height="40" fill="#24476b" transform="skewX(-15)"/>`+lbl(430,200,'solar panel · सौर पैनल')]]},
 seeNote:'Air, water and sunlight support all life.',
 do:{title:'Solar heater',mat:'Two identical glasses of water, one wrapped in black paper',steps:['Keep both in sunlight for 1 hour.','Feel or measure the temperature.'],obs:'The black-wrapped one is warmer.',why:'It absorbs more sunlight.',lab:false},
 memo:'"Air to breathe, water to live, Sun to power."',
 miscon:['"Air is mainly oxygen." It is mainly nitrogen.'],
 terms:['Air · वायु','Oxygen · ऑक्सीजन','Nitrogen · नाइट्रोजन','Solar energy · सौर ऊर्जा','Wind energy · पवन ऊर्जा'],
 q:{q:'The main gas in air is:',o:['oxygen','nitrogen','carbon dioxide','water vapour'],a:1,why:'About four-fifths.'},
 exam:'Uses of air/water/sunlight: 2 marks.'},

{id:'n3',num:'11.3',title:'Soil and forests · मृदा और वन',
 intro:'It can take hundreds of years to form a few centimetres of soil. Why should we care?',
 obj:'Explain the importance of soil and forests and how to protect them.',
 prior:'Plants (Ch 2).',
 simple:'Soil forms very slowly from rocks broken by sun, wind, water and living things, mixed with decaying plant and animal matter. Plants grow in soil; it holds water and is home to many organisms. Forests give wood, fruits, medicines, gum, honey, oxygen and homes for animals; they bring rain, keep soil in place and are home to many forest communities.',
 detail:'Cutting trees exposes soil to wind and rain, which wash it away (soil erosion). Planting trees, terrace farming, and not leaving fields bare protect soil. Chipko movement: villagers in the Himalayas hugged trees to stop them being cut. In Rajasthan, the Bishnoi community has protected trees and animals for centuries.',
 real:'Aravalli hills near Rewari and Gurugram are being replanted to stop soil loss and dust.',
 apply:'Why does soil wash away faster from a bare slope than from a forest?',
 see:{w:520,h:220,f:[
  ['Forest: roots hold the soil.',tree(80,160)+tree(130,170)+tree(180,160)+`<path d="M40 170 L240 180 V210 H40 Z" fill="${BR}" opacity=".6"/>`],
  ['Bare slope: rain washes soil away.',`<path d="M300 120 L500 190 V210 H300 Z" fill="${BR}" opacity=".6"/>`+[0,1,2,3].map(i=>`<line x1="${330+i*40}" y1="${60}" x2="${325+i*40}" y2="${90}" stroke="${BL}" stroke-width="2"/>`).join('')+`<path d="M420 175 q30 10 70 15" stroke="${BR}" stroke-width="4" fill="none"/>`+lbl(400,110,'soil erosion · मृदा अपरदन','font-size="12"')],
  ['Protect: plant trees.',lbl(140,40,'roots hold soil · trees bring rain','font-weight="700"')]]},
 seeNote:'Soil takes centuries to form.',
 do:{title:'Erosion trays',mat:'Two trays of soil: one with grass/sprouts, one bare; watering can',steps:['Tilt both trays.','Pour equal water on each.','Compare the water that runs off.'],obs:'Bare tray loses muddy water.',why:'Roots hold soil.',lab:true},
 memo:'"No roots, no soil."',
 miscon:['"Soil can be made quickly." It takes hundreds of years.'],
 terms:['Soil · मृदा','Soil erosion · मृदा अपरदन','Forest · वन','Chipko movement · चिपको आंदोलन'],
 q:{q:'Soil erosion is reduced by:',o:['cutting trees','planting trees','burning stubble','leaving fields bare'],a:1,why:'Roots hold soil.'},
 exam:'Importance of forests: 3 marks.'},

{id:'n4',num:'11.4',title:'Minerals and fossil fuels · खनिज और जीवाश्म ईंधन',
 intro:'Coal was once a forest. How?',
 obj:'Describe minerals and fossil fuels and their formation.',
 prior:'Natural resources (11.1).',
 simple:'Minerals are natural substances in rocks, e.g. iron ore, copper, bauxite (for aluminium), mica and salt. Fossil fuels (जीवाश्म ईंधन) are coal, petroleum and natural gas, formed over millions of years from buried remains of plants and animals under heat and pressure. They are used to cook, run vehicles and make electricity.',
 detail:'Coal formed from ancient forests buried under the ground. Petroleum and natural gas formed from tiny sea organisms buried under the sea bed. Petrol, diesel, kerosene, LPG and many plastics come from petroleum. Burning fossil fuels releases smoke and carbon dioxide, causing air pollution and warming the planet.',
 real:'CNG buses and autos in Delhi–NCR burn natural gas, which gives less smoke than diesel.',
 apply:'Why are fossil fuels called "fossil"?',
 see:{w:520,h:230,f:[
  ['Millions of years ago: forests and sea life.',tree(60,100)+tree(100,100)+tree(140,100)+`<path d="M300 100 q40 -10 80 0 t80 0 v20 h-160z" fill="${BL}" opacity=".5"/>`],
  ['They died and were buried under layers.',`<rect x="30" y="110" width="460" height="20" fill="#c9b48a"/><rect x="30" y="130" width="460" height="20" fill="#a68c64"/>`],
  ['Heat and pressure → coal, petroleum, gas.',`<rect x="60" y="155" width="120" height="20" fill="#222"/><ellipse cx="380" cy="170" rx="70" ry="12" fill="#3a2a14"/>`+lbl(120,200,'coal · कोयला')+lbl(380,200,'petroleum, natural gas')]]},
 seeNote:'Formed over millions of years.',
 do:{title:'Fuel survey',mat:'Notebook',steps:['List fuels used at home and in your family\'s vehicles.','Mark which are fossil fuels.'],obs:'LPG, petrol, diesel are fossil fuels.',why:'From petroleum.',lab:false},
 memo:'"Buried life + heat + pressure + time = fossil fuel."',
 miscon:['"Coal can be made again quickly." It takes millions of years.'],
 terms:['Mineral · खनिज','Fossil fuel · जीवाश्म ईंधन','Coal · कोयला','Petroleum · पेट्रोलियम','Natural gas · प्राकृतिक गैस'],
 q:{q:'Coal is formed from:',o:['sea water','buried ancient plants','sand','iron ore'],a:1,why:'Ancient forests.'},
 exam:'How are fossil fuels formed? 2 marks.'},

{id:'n5',num:'11.5',title:'Renewable or non-renewable? Using resources wisely · नवीकरणीय और अनवीकरणीय',
 intro:'Sunlight will last billions of years; coal may run out in your lifetime. What should we do?',
 obj:'Classify resources and suggest ways to conserve them.',
 prior:'11.1–11.4.',
 simple:'Renewable resources (नवीकरणीय) are replaced by nature quickly or are always available: sunlight, wind, water (through the water cycle), forests (if replanted). Non-renewable resources (अनवीकरणीय) take millions of years to form and will run out: coal, petroleum, natural gas, minerals. Sustainable use means using resources so that enough is left for the future.',
 detail:'Renewable resources can also be harmed: water can be polluted, forests over-cut. Ways to conserve: switch off lights and fans; use public transport, cycles; use solar and wind energy; reduce, reuse, recycle; save water; plant trees; don\'t waste food and paper.',
 real:'Many Haryana schools now use rooftop solar power and rainwater harvesting.',
 apply:'Suggest three things your class can do to save resources.',
 see:{w:520,h:220,f:[
  ['Renewable: sun, wind, water, forests.',`<rect x="30" y="40" width="200" height="140" rx="10" fill="${LG}" opacity=".35"/>`+lbl(130,65,'Renewable · नवीकरणीय','font-weight="700"')+['sunlight','wind','water','forests (replanted)'].map((t,i)=>lbl(130,95+i*22,t)).join('')],
  ['Non-renewable: coal, petroleum, gas, minerals.',`<rect x="290" y="40" width="200" height="140" rx="10" fill="#ccc" opacity=".45"/>`+lbl(390,65,'Non-renewable · अनवीकरणीय','font-weight="700"')+['coal','petroleum','natural gas','minerals'].map((t,i)=>lbl(390,95+i*22,t)).join('')],
  ['Use wisely so enough is left.',lbl(260,210,'reduce · reuse · recycle · save','font-weight="700"')]]},
 seeNote:'Sustainable use protects the future.',
 do:{title:'Energy audit',mat:'Your classroom',steps:['Count lights and fans left on in empty rooms during a day.','Make a "switch off" poster.'],obs:'Wasted electricity.',why:'Conserving resources.',lab:false},
 memo:'"Renew: sun, wind, water, wood. Not renew: coal, oil, gas, ore."',
 miscon:['"Renewable resources can never be harmed." Water can be polluted; forests over-cut.'],
 terms:['Renewable · नवीकरणीय','Non-renewable · अनवीकरणीय','Sustainable use · सतत उपयोग','Conservation · संरक्षण'],
 q:{q:'Which is non-renewable?',o:['sunlight','wind','coal','water'],a:2,why:'Millions of years to form.'},
 exam:'Renewable vs non-renewable with examples: 3 marks.'}
];

const CARDS=[['Natural resource','From nature: air, water, sunlight, soil, forests, minerals, fuels.'],['Air','Mostly nitrogen; oxygen for breathing.'],['Sunlight','Light, heat, food-making, solar power.'],['Soil','Forms over centuries; erosion if bare.'],['Forests','Wood, food, medicine, rain, soil protection.'],['Chipko','People hugged trees to save them.'],['Minerals','Iron ore, bauxite, copper, mica.'],['Fossil fuels','Coal, petroleum, natural gas: buried life + time.'],['Renewable','Sun, wind, water, forests.'],['Non-renewable','Coal, petroleum, gas, minerals.'],['Sustainable use','Leave enough for the future.']];

const Q=[
 {lv:1,q:'Which is a fossil fuel?',o:['wood','coal','sunlight','wind'],a:1,w:'Coal.'},
 {lv:1,q:'Main gas in air:',o:['oxygen','nitrogen','CO₂','argon'],a:1,w:'Nitrogen.'},
 {lv:1,q:'Renewable resource:',o:['petroleum','sunlight','coal','natural gas'],a:1,w:'Sunlight.'},
 {lv:2,q:'Petrol and LPG come from:',o:['coal','petroleum','forests','minerals'],a:1,w:'Petroleum.'},
 {lv:2,q:'Soil erosion is caused mainly by:',o:['planting trees','cutting trees','rainwater harvesting','grass cover'],a:1,w:'Bare soil.'},
 {lv:2,q:'The Chipko movement was about:',o:['saving water','saving trees','building dams','mining'],a:1,w:'Hugging trees.'},
 {lv:3,q:'Fossil fuels are non-renewable because they:',o:['are liquids','take millions of years to form','are cheap','burn easily'],a:1,w:'Slow formation.'},
 {lv:3,q:'Which is human-made?',o:['coal','plastic','iron ore','soil'],a:1,w:'From petroleum.'},
 {lv:4,q:'Best way for a school to cut fossil fuel use:',o:['more diesel generators','rooftop solar panels','burn leaves','keep lights on'],a:1,w:'Renewable.'},
 {lv:4,q:'Water is renewable, yet we must save it because:',o:['it is non-renewable','usable fresh water is limited and can be polluted','it burns','it is a fossil fuel'],a:1,w:'Limited usable water.'},
 {lv:5,open:true,m:3,q:'Classify: coal, sunlight, wind, natural gas, forests, iron ore.',ans:['Renewable: sunlight, wind, forests (1.5)','Non-renewable: coal, natural gas, iron ore (1.5)']},
 {lv:5,open:true,m:3,q:'Suggest three ways to conserve natural resources at home.',ans:['Switch off lights/fans; use solar (1)','Save water: fix leaks, reuse (1)','Reduce, reuse, recycle; less private vehicle use (1)']}
];

const ONEMIN=['Natural resources: from nature.','Air (N₂, O₂), water, sunlight are vital.','Soil forms slowly; forests protect it.','Minerals and fossil fuels from the Earth.','Fossil fuels: buried life, millions of years.','Renewable vs non-renewable.','Sustainable use; conserve.'];
const KEYS=[['natural resources',/natural resource|संसाधन/i],['air/water/sunlight',/air|water|sun/i],['soil/forests',/soil|forest/i],['fossil fuels',/fossil|coal|petrol/i],['renewable',/renewable/i],['conserve',/conserv|save|sustain|reuse/i]];

/* ---------- lab ---------- */
let coal=6,cut=12,plant=5,sol=0;
function sim(){const yrs=30;let C0=100,F=60;const cs=[],fs=[];let ranOut=-1;const need=10;
 for(let y=0;y<=yrs;y++){cs.push(C0);fs.push(F);const solarGive=[0,3,6][sol];const burn=Math.max(0,Math.min(C0,coal));C0-=burn;if(C0<=0&&ranOut<0)ranOut=y;F=Math.max(0,Math.min(120,F-cut*0.4+plant*0.4));}
 return {cs,fs,ranOut,energy:Math.min(coal,100)+[0,3,6][sol]}}
function draw(){const r=sim();const X=y=>50+y*12,Y=v=>230-v*1.6;let s=`<line x1="50" y1="230" x2="420" y2="230" stroke="${ink}"/><line x1="50" y1="230" x2="50" y2="30" stroke="${ink}"/>`+T(235,262,'years →','font-size="12"');
 [0,10,20,30].forEach(y=>s+=T(X(y),246,String(y),'font-size="11"'));
 s+=`<polyline points="${r.cs.map((v,i)=>X(i)+','+Y(v)).join(' ')}" fill="none" stroke="#333" stroke-width="2.5"/><polyline points="${r.fs.map((v,i)=>X(i)+','+Y(v)).join(' ')}" fill="none" stroke="${GN}" stroke-width="2.5"/>`+`<line x1="300" y1="40" x2="325" y2="40" stroke="#333" stroke-width="2.5"/><line x1="300" y1="60" x2="325" y2="60" stroke="${GN}" stroke-width="2.5"/>`+T(350,44,'coal','font-size="12"')+T(355,64,'forest','font-size="12"');
 s+=`<circle cx="400" cy="40" r="${6+sol*6}" fill="#f2b632" opacity="${sol?1:.3}"/>`;
 $('#rSvg').innerHTML=s;$('#rCv').textContent=coal;$('#rTv').textContent=cut;$('#rPv').textContent=plant;
 const e=coal+[0,3,6][sol];const fEnd=r.fs[30];
 let h=`<p>Coal left after 30 years: <b>${Math.round(r.cs[30])}</b> of 100. ${r.ranOut>=0?`<b>Coal ran out in year ${r.ranOut}.</b>`:''}</p><p>Forest after 30 years: <b>${Math.round(fEnd)}</b> (started at 60).</p><p>Energy each year: ${e} units ${e<6?'<span class="fb no">(not enough for the village: add solar)</span>':''}</p>`;
 h+=(r.ranOut<0&&fEnd>=60&&e>=6)?'<p class="fb ok">Sustainable! Enough energy, coal saved, forest kept.</p>':'<p class="note">Try: less coal, more solar, plant at least as many trees as you cut.</p>';
 $('#rOut').innerHTML=h}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('rS'))labChange(e.target)})}
function labClick(){return false}
function labChange(t){switch(t.id){case 'rC':coal=+t.value;break;case 'rT':cut=+t.value;break;case 'rP':plant=+t.value;break;case 'rSol':sol=+t.value;break;default:return false}draw();return true}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
