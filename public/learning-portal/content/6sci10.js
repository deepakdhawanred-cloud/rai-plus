/* Rai Plus content pack: Class 6 Science (Curiosity), Chapter 10 – Living Creatures: Exploring their Characteristics. Bilingual terms. */
RP.register({key:'6sci10',cls:'6',subject:'Science',ch:'10',title:"Living Creatures: Exploring their Characteristics",color:'#3b6d11',
crumb:"Class 6 Science · Curiosity · सजीव: उनकी विशेषताओं का अन्वेषण",h1:"Chapter 10: Living Creatures — Exploring their Characteristics",sub:"सजीवों की विशेषताएँ. What makes something alive, seed germination, and life cycles.",heroLabel:"A seedling, a frog and a butterfly",labName:'Is it alive?',
theme:"\n:root{--g:light-dark(#3b6d11,#a8d77d);--g2:light-dark(#eef6e4,#0f1a07);--line:light-dark(#d4e7bf,#2c4219);--bg:light-dark(#ffffff,#0b1206);--card:light-dark(#ffffff,#111a0a);\n--ink:light-dark(#162508,#e6f1da);--mute:light-dark(#4f6439,#b5c9a0);--y:light-dark(#a3501b,#f0a877);--y2:light-dark(#fbeee4,#2a160a);--hd:#2b520b}\n",
labHTML:`  <h2>Is it alive? · क्या यह सजीव है?</h2>
  <p>Choose a thing. Tick each characteristic you think it shows, then press Decide.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="aSvg" viewBox="0 0 460 300" role="img" aria-label="Characteristics checklist" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Thing<select id="aThing"><option value="dog">Dog</option><option value="mango">Mango tree</option><option value="seed">Dry gram seed</option><option value="car">Car</option><option value="cloud">Cloud</option><option value="fire">Candle flame</option><option value="mush">Mushroom</option><option value="robot">Toy robot</option></select></label></div>
  <div class="ctrl" id="aChecks"></div><div class="ctrl"><button class="btn" id="aGo">Decide</button></div><div class="box y" id="aOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3b6d11',LABNAME='Is it alive?',MIND_CENTER='Living · सजीव';
const GN='#3b6d11',LG='#8fc15a',BR='#8a5a12',OR='#a3501b',GR='#888780',BL='#2f6f8a',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const arrow=(x1,y1,x2,y2)=>{const a=Math.atan2(y2-y1,x2-x1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${GR}" stroke-width="1.5"/><path d="M${x2} ${y2} l${(-8*Math.cos(a-0.4)).toFixed(1)} ${(-8*Math.sin(a-0.4)).toFixed(1)} M${x2} ${y2} l${(-8*Math.cos(a+0.4)).toFixed(1)} ${(-8*Math.sin(a+0.4)).toFixed(1)}" stroke="${GR}" stroke-width="1.5"/>`};
function heroDraw(){return `<path d="M60 110 v-40" stroke="#fff" stroke-width="3"/><path d="M60 80 q-20 -10 -24 -26 q20 2 24 26z M60 74 q20 -10 24 -26 q-20 2 -24 26z" fill="#fff"/><ellipse cx="160" cy="95" rx="26" ry="16" fill="#fff" opacity=".85"/><circle cx="150" cy="80" r="5" fill="#fff"/><circle cx="170" cy="80" r="5" fill="#fff"/><path d="M250 70 q-25 -25 -30 5 q25 5 30 -5z M250 70 q25 -25 30 5 q-25 5 -30 -5z" fill="#fff" opacity=".85"/>`}
const HERO=heroDraw;
const MIND=[['Living vs non-living',100,50],['Need food, water, air',420,50],['Growth & movement',90,150],['Respond, excrete',430,150],['Seeds germinate',110,250],['Life cycles',410,250]];

const C=[
{id:'a1',num:'10.1',title:'Living and non-living · सजीव और निर्जीव',
 intro:'A car moves and a cloud grows bigger. Are they alive?',
 obj:'List the characteristics that together show something is living.',
 prior:'Plants and animals around us (Ch 2).',
 simple:'Living things (सजीव) show a set of characteristics together: they need food, water and air; they breathe (respiration); they grow; they move; they respond to changes around them (stimuli); they get rid of wastes (excretion); they reproduce; and they have a life span: they are born and die. Non-living things (निर्जीव) may show one or two features (a car moves, a cloud grows), but not all of them.',
 detail:'So we look at all characteristics together, not just one. Plants are living even though most do not move from place to place: they grow, need water, air and sunlight, respond to light, and reproduce. A seed can stay without signs of life for a long time but grows when it gets the right conditions.',
 real:'A potted plant on your window bends towards light: it responds.',
 apply:'A candle flame needs air and "grows". Why is it still non-living?',
 see:{w:520,h:230,f:[
  ['Living: dog, tree, bird, human.',`<circle cx="80" cy="110" r="34" fill="${LG}" opacity=".5"/>`+lbl(80,115,'living · सजीव','font-weight="700"')],
  ['Non-living: stone, car, chair, cloud.',`<circle cx="440" cy="110" r="34" fill="#ccc" opacity=".6"/>`+lbl(440,115,'non-living','font-weight="700"')],
  ['Living things show ALL these together.',['food & water','respiration','growth','movement','response','excretion','reproduction','life span'].map((t,i)=>lbl(260,40+i*22,t,'font-size="12"')).join('')]]},
 seeNote:'One feature alone is not enough.',
 do:{title:'Living or not?',mat:'Notebook, school garden',steps:['List 10 things you see.','Mark each living or non-living.','Write which characteristics helped you.'],obs:'Living things show many characteristics.',why:'All characteristics together.',lab:true},
 memo:'"Food, breathe, grow, move, respond, excrete, reproduce, die."',
 miscon:['"Plants are non-living because they don\'t walk." They show all other characteristics.','"Anything that moves is alive." A car moves but is non-living.'],
 terms:['Living · सजीव','Non-living · निर्जीव','Characteristic · विशेषता','Life span · जीवन काल'],
 q:{q:'Which is a living thing?',o:['car','cloud','mushroom','candle flame'],a:2,why:'Mushroom (a fungus) grows, feeds, reproduces.'},
 exam:'List characteristics of living things: 3 marks.'},

{id:'a2',num:'10.2',title:'Food, water, air and respiration · भोजन, जल, वायु, श्वसन',
 intro:'Why do fish come up to the surface when a pond\'s water gets dirty?',
 obj:'Show that living things need food, water and air and respire.',
 prior:'Living characteristics (10.1).',
 simple:'All living things need food for energy and growth. Plants make their own food using sunlight, water and air; animals depend on plants or other animals. All living things need water. All living things breathe or take in air (respiration, श्वसन) to get energy from food.',
 detail:'Animals breathe in different ways: humans and dogs through lungs and nose; fish take in oxygen dissolved in water through gills; earthworms through their moist skin; insects through tiny holes (spiracles). Plants take in and give out gases through tiny pores (stomata) on leaves. Living things also produce wastes and remove them: excretion (उत्सर्जन); e.g. sweat and urine in humans.',
 real:'Earthworms come out of the soil after heavy rain because the soil is flooded with water.',
 apply:'How does a fish breathe under water?',
 see:{w:520,h:220,f:[
  ['Humans: nose and lungs.',lbl(80,60,'lungs · फेफड़े','font-weight="700"')+`<ellipse cx="65" cy="120" rx="18" ry="30" fill="#e8a0a0"/><ellipse cx="100" cy="120" rx="18" ry="30" fill="#e8a0a0"/>`],
  ['Fish: gills take oxygen from water.',`<path d="M220 120 q40 -30 90 0 q-50 30 -90 0z M310 120 l20 -15 v30z" fill="${BL}" opacity=".6"/><path d="M245 110 q-4 10 0 20" stroke="#c0392b" stroke-width="3" fill="none"/>`+lbl(260,60,'gills · गलफड़े','font-weight="700"')],
  ['Earthworm: moist skin. Leaves: tiny pores.',`<path d="M380 140 q20 -20 40 0 t40 0" stroke="#c48a7a" stroke-width="8" fill="none" stroke-linecap="round"/>`+lbl(430,60,'skin; stomata','font-weight="700"')]]},
 seeNote:'All living things respire.',
 do:{title:'Breaths per minute',mat:'A clock',steps:['Count your breaths at rest for 1 minute.','Jog on the spot for 1 minute and count again.'],obs:'More breaths after exercise.',why:'Body needs more energy and air.',lab:false},
 memo:'"Lungs, gills, skin, pores: everyone breathes."',
 miscon:['"Plants don\'t breathe." They respire all the time.'],
 terms:['Respiration · श्वसन','Gills · गलफड़े','Excretion · उत्सर्जन','Stomata · रंध्र'],
 q:{q:'Fish breathe through:',o:['lungs','gills','skin only','nose'],a:1,why:'Gills.'},
 exam:'Ways of breathing in animals: 2 marks.'},

{id:'a3',num:'10.3',title:'Growth, movement and response · वृद्धि, गति, अनुक्रिया',
 intro:'Touch the leaves of a touch-me-not (chhui-mui) plant. What happens?',
 obj:'Describe growth, movement and response to stimuli in plants and animals.',
 prior:'10.1, 10.2.',
 simple:'Living things grow: a puppy becomes a dog, a seedling becomes a tree. Animals move from place to place to find food, shelter and safety. Plants do not move from place to place, but parts move: leaves turn to light, flowers open and close. Living things respond to stimuli (उद्दीपन) such as light, touch, heat and sound.',
 detail:'Examples of response: the leaves of Mimosa (छुई-मुई) fold when touched; we pull our hand back from a hot object; cockroaches run when the light is switched on; sunflowers face the Sun. Non-living things can get bigger (a crystal, a cloud) but they don\'t grow by taking in food.',
 real:'Pet dogs run to the door when they hear the bell.',
 apply:'Give two examples of plants responding to a stimulus.',
 see:{w:520,h:220,f:[
  ['Growth: seed → seedling → plant.',`<ellipse cx="60" cy="170" rx="10" ry="7" fill="${BR}"/><path d="M140 175 v-30" stroke="${GN}" stroke-width="3"/><path d="M140 150 q-12 -6 -14 -16 q12 2 14 16z" fill="${LG}"/><path d="M230 175 v-80" stroke="${GN}" stroke-width="4"/>`+[0,1,2].map(i=>`<path d="M230 ${150-i*22} q-20 -8 -24 -22 q20 3 24 22z M230 ${145-i*22} q20 -8 24 -22 q-20 3 -24 22z" fill="${LG}"/>`).join('')],
  ['Response: Mimosa leaves fold when touched.',`<path d="M360 170 v-70" stroke="${GN}" stroke-width="3"/>`+[0,1,2,3,4].map(i=>`<ellipse cx="${345}" cy="${105+i*12}" rx="10" ry="3" fill="${LG}"/><ellipse cx="${375}" cy="${105+i*12}" rx="10" ry="3" fill="${LG}"/>`).join('')],
  ['…then the leaflets close up.',`<path d="M440 170 v-70" stroke="${GN}" stroke-width="3"/>`+[0,1,2,3,4].map(i=>`<ellipse cx="440" cy="${105+i*12}" rx="3" ry="6" fill="${LG}"/>`).join('')+lbl(400,205,'touch-me-not · छुई-मुई')]]},
 seeNote:'Plants respond too.',
 do:{title:'Touch-me-not',mat:'A Mimosa plant (school garden)',steps:['Touch one leaf gently.','Time how long it takes to open again.'],obs:'Folds in seconds; opens after some minutes.',why:'Response to touch.',lab:false},
 memo:'"Grow, move, respond."',
 miscon:['"Crystals growing means they are alive." They don\'t take food or show other features.'],
 terms:['Growth · वृद्धि','Movement · गति','Stimulus · उद्दीपन','Response · अनुक्रिया'],
 q:{q:'Mimosa leaves folding on touch shows:',o:['growth','response to stimulus','excretion','reproduction'],a:1,why:'Response.'},
 exam:'Examples of response in plants/animals: 2 marks.'},

{id:'a4',num:'10.4',title:'Seed germination · बीज का अंकुरण',
 intro:'Dry gram seeds lie for months in a jar. What makes them sprout?',
 obj:'Find the conditions needed for seeds to germinate.',
 prior:'Seeds (Ch 2).',
 simple:'A seed contains a baby plant. When it gets the right conditions, it sprouts: this is germination (अंकुरण). Seeds need water, air and suitable warmth to germinate. Sunlight is not needed for germination, but the seedling needs it to grow and make food.',
 detail:'Activity: take three sets of seeds: (A) dry, (B) moist cotton, (C) fully under boiled-and-cooled water (no air). Only B germinates. Seeds kept in a fridge (too cold) also fail. Sprouts (अंकुरित) of moong and chana are a healthy food.',
 real:'Farmers soak seeds before sowing so they germinate faster.',
 apply:'Why do seeds kept fully under water not germinate?',
 see:{w:520,h:230,f:[
  ['A: dry seeds.',`<rect x="30" y="100" width="110" height="60" rx="6" fill="none" stroke="${ink}"/>`+[0,1,2].map(i=>`<ellipse cx="${60+i*25}" cy="145" rx="8" ry="6" fill="${BR}"/>`).join('')+lbl(85,190,'dry: no')],
  ['B: moist cotton: water + air.',`<rect x="205" y="100" width="110" height="60" rx="6" fill="none" stroke="${ink}"/><rect x="207" y="140" width="106" height="18" fill="#eef"/>`+[0,1,2].map(i=>`<ellipse cx="${235+i*25}" cy="140" rx="8" ry="6" fill="${BR}"/><path d="M${235+i*25} 134 q4 -14 -2 -24" stroke="${GN}" stroke-width="2" fill="none"/>`).join('')+lbl(260,190,'germinates ✓','fill="'+GN+'" font-weight="700"')],
  ['C: under water: no air.',`<rect x="380" y="70" width="110" height="90" rx="6" fill="none" stroke="${ink}"/><rect x="382" y="76" width="106" height="82" fill="${BL}" opacity=".35"/>`+[0,1,2].map(i=>`<ellipse cx="${410+i*25}" cy="150" rx="8" ry="6" fill="${BR}"/>`).join('')+lbl(435,190,'no air: no')]]},
 seeNote:'Water + air + warmth.',
 do:{title:'Three-cup test',mat:'Gram/moong seeds, cotton, 3 cups, boiled-cooled water',steps:['Set up A (dry), B (moist cotton), C (under water).','Keep in a warm place; observe for 3–4 days.'],obs:'Only B sprouts.',why:'Needs water and air.',lab:true},
 memo:'"Water, air, warmth: a seed wakes up."',
 miscon:['"Seeds need sunlight to germinate." Not for germination itself.'],
 terms:['Germination · अंकुरण','Seedling · पौध','Sprout · अंकुर','Seed coat · बीजावरण'],
 q:{q:'Seeds need for germination:',o:['only sunlight','water, air and warmth','soil only','fertiliser'],a:1,why:'Three-cup test.'},
 exam:'Design an activity for germination conditions: 3 marks.'},

{id:'a5',num:'10.5',title:'Life cycles · जीवन चक्र',
 intro:'A tadpole looks like a tiny fish. How does it become a frog?',
 obj:'Describe life cycles of a plant, a frog and a mosquito.',
 prior:'Growth (10.3), germination (10.4).',
 simple:'Every living thing goes through stages from birth to death and produces young ones: its life cycle (जीवन चक्र). Plant: seed → seedling → young plant → adult plant with flowers → fruits and seeds. Frog: eggs (spawn) in water → tadpole (with tail, gills) → tadpole with legs → froglet → adult frog. Mosquito: egg → larva → pupa → adult (first three stages in water).',
 detail:'Many insects change form a lot during their life cycle; this is called metamorphosis (कायांतरण). Stopping water collection (coolers, pots, tyres) breaks the mosquito life cycle and prevents dengue and malaria. Life span is the time from birth to death: a mosquito lives a few weeks, a dog about 12–15 years, some trees hundreds of years.',
 real:'Removing stored water from coolers every week in Haryana summers stops mosquito breeding.',
 apply:'Why does emptying coolers weekly help prevent dengue?',
 see:{w:520,h:240,f:[
  ['Frog: eggs in water.',`<g>${[0,1,2,3,4,5].map(i=>`<circle cx="${100+(i%3)*12}" cy="${60+Math.floor(i/3)*12}" r="6" fill="#dde" stroke="${GR}"/><circle cx="${100+(i%3)*12}" cy="${60+Math.floor(i/3)*12}" r="2" fill="#222"/>`).join('')}</g>`+lbl(115,100,'eggs','font-size="12"')],
  ['Tadpole with a tail.',`<ellipse cx="380" cy="70" rx="12" ry="9" fill="#556"/><path d="M392 70 q20 -8 30 4" stroke="#556" stroke-width="4" fill="none"/>`+lbl(395,100,'tadpole','font-size="12"')],
  ['Tadpole grows legs.',`<ellipse cx="390" cy="180" rx="14" ry="10" fill="#556"/><path d="M404 180 q14 -4 20 4" stroke="#556" stroke-width="3" fill="none"/><path d="M380 188 l-8 10 M396 188 l6 10" stroke="#556" stroke-width="2"/>`+lbl(395,215,'legs appear','font-size="12"')],
  ['Adult frog: the cycle repeats.',`<ellipse cx="120" cy="185" rx="26" ry="16" fill="${GN}" opacity=".8"/><circle cx="110" cy="168" r="5" fill="${GN}"/><circle cx="130" cy="168" r="5" fill="${GN}"/>`+lbl(120,220,'adult frog','font-size="12"')+arrow(150,65,350,65)+arrow(410,110,410,155)+arrow(360,185,160,185)+arrow(115,160,115,110)]]},
 seeNote:'Life cycles repeat.',
 do:{title:'Watch a cycle',mat:'Moong seeds in a pot, notebook',steps:['Sow seeds; water daily.','Draw the plant every 3 days for 3 weeks.'],obs:'Seedling → young plant.',why:'Growth stages.',lab:false},
 memo:'"Mosquito: E-L-P-A. Frog: egg-tadpole-froglet-frog."',
 miscon:['"Tadpoles are baby fish." They are young frogs.'],
 terms:['Life cycle · जीवन चक्र','Tadpole · टैडपोल','Larva · लार्वा','Pupa · प्यूपा','Metamorphosis · कायांतरण'],
 q:{q:'Correct mosquito life cycle:',o:['egg → pupa → larva → adult','egg → larva → pupa → adult','larva → egg → adult','egg → tadpole → adult'],a:1,why:'E-L-P-A.'},
 exam:'Draw the life cycle of a frog: 3 marks.'}
];

const CARDS=[['Living','Food, water, air, respiration, growth, movement, response, excretion, reproduction, life span.'],['Non-living','May show one or two features, not all.'],['Respiration','Lungs, gills, skin, spiracles; plants through pores.'],['Excretion','Removing wastes.'],['Response','To stimuli: Mimosa, hot object.'],['Germination','Needs water, air, warmth.'],['Plant life cycle','Seed → seedling → plant → flowers → seeds.'],['Frog','Eggs → tadpole → froglet → frog.'],['Mosquito','Egg → larva → pupa → adult.'],['Metamorphosis','Big change of form in a life cycle.']];

const Q=[
 {lv:1,q:'Which is non-living?',o:['tree','car','ant','mushroom'],a:1,w:'Car.'},
 {lv:1,q:'Earthworms breathe through:',o:['lungs','gills','moist skin','nose'],a:2,w:'Skin.'},
 {lv:1,q:'Young one of a frog:',o:['larva','tadpole','pupa','calf'],a:1,w:'Tadpole.'},
 {lv:2,q:'Leaves of Mimosa folding on touch shows:',o:['growth','response','excretion','respiration'],a:1,w:'Response.'},
 {lv:2,q:'Seeds kept dry do not germinate because they lack:',o:['air','water','light','soil'],a:1,w:'Water.'},
 {lv:2,q:'Removing waste from the body:',o:['respiration','excretion','reproduction','growth'],a:1,w:'Excretion.'},
 {lv:3,q:'Seeds under boiled water don\'t sprout because:',o:['no water','no air','too much light','no soil'],a:1,w:'Boiling removes dissolved air.'},
 {lv:3,q:'A car moves and uses fuel, but is non-living because it:',o:['is metal','does not grow, reproduce or respond','is fast','is made by humans only'],a:1,w:'All features together.'},
 {lv:4,q:'Emptying coolers weekly prevents mosquitoes because:',o:['adults die in coolers','eggs, larvae and pupae grow in water','water cools','it kills birds'],a:1,w:'Breaks the life cycle.'},
 {lv:4,q:'Which is NOT needed for seed germination?',o:['water','air','warmth','sunlight'],a:3,w:'Sunlight is needed later.'},
 {lv:5,open:true,m:3,q:'Describe an activity to show that seeds need air and water to germinate.',ans:['Set up dry seeds, seeds on moist cotton, seeds under boiled-cooled water (1)','Keep in warm place, observe 3–4 days (1)','Only moist-cotton seeds germinate → need water and air (1)']},
 {lv:5,open:true,m:3,q:'Give any six characteristics of living things.',ans:['Need food, water, air; respiration (1)','Growth, movement, response to stimuli (1)','Excretion, reproduction, life span (1)']}
];

const ONEMIN=['Living things show many characteristics together.','Respire: lungs, gills, skin, spiracles, leaf pores.','Grow, move, respond (Mimosa).','Excretion removes wastes.','Germination: water + air + warmth.','Frog and mosquito life cycles; metamorphosis.','Break the mosquito cycle: no stored water.'];
const KEYS=[['characteristics',/grow|reproduc|respir|excret/i],['non-living',/non-living|निर्जीव/i],['breathing ways',/gill|lung|skin/i],['response',/respon|stimul|mimosa/i],['germination',/germin|अंकुर/i],['life cycle',/cycle|tadpole|larva|pupa/i]];

/* ---------- lab ---------- */
const CH=[['food','Needs food'],['resp','Breathes / respires'],['grow','Grows by itself'],['move','Moves (or parts move)'],['resp2','Responds to stimuli'],['excr','Removes wastes'],['repro','Reproduces'],['die','Has a life span (dies)']];
const TH={dog:['Dog',[1,1,1,1,1,1,1,1],'living'],mango:['Mango tree',[1,1,1,1,1,1,1,1],'living'],seed:['Dry gram seed',[1,1,1,1,1,1,1,1],'living'],car:['Car',[0,0,0,1,0,0,0,0],'non'],cloud:['Cloud',[0,0,0,1,0,0,0,0],'non'],fire:['Candle flame',[0,0,0,1,0,0,0,0],'non'],mush:['Mushroom',[1,1,1,0,1,1,1,1],'living'],robot:['Toy robot',[0,0,0,1,1,0,0,0],'non']};
const NOTE={seed:'A dry seed is alive but resting: it respires very slowly and germinates when it gets water, air and warmth.',fire:'A flame uses air and gets bigger, but it does not grow by taking food, reproduce or respond like living things.',cloud:'A cloud moves and grows by condensation, not by taking in food.',mush:'A mushroom is a fungus: it feeds on dead matter, grows and makes spores.',robot:'A robot can move and react to sensors, but it is built, not born; it does not grow or reproduce.',car:'A car moves and uses fuel, but it does not grow, reproduce or respond by itself.'};
let thing='dog';
function boxes(){$('#aChecks').innerHTML=CH.map(([k,t])=>`<label style="display:block"><input type="checkbox" class="aC" data-k="${k}"> ${t}</label>`).join('')}
function draw(res){const [n,v]=TH[thing];let s=T(230,26,n,'font-size="16" font-weight="700"');const sel=$$('.aC').map(c=>c.checked);
 CH.forEach(([k,t],i)=>{const y=52+i*28;s+=`<rect x="70" y="${y-14}" width="320" height="22" rx="4" fill="${res?(v[i]?'#e3f0d4':'#f2f2f2'):'none'}" stroke="${GR}" stroke-width=".6"/>`+T(84,y+2,t,'font-size="13" text-anchor="start"')+T(370,y+2,sel[i]?'✓':'','font-size="14"');if(res)s+=T(420,y+2,v[i]?'yes':'no',`font-size="12" fill="${v[i]?GN:GR}"`)});
 $('#aSvg').innerHTML=s}
function decide(){const [n,v,cls]=TH[thing];const sel=$$('.aC').map(c=>c.checked?1:0);const right=sel.filter((x,i)=>x===v[i]).length;
 draw(true);$('#aOut').innerHTML=`<p class="fb ${right>=7?'ok':'no'}">You matched ${right} of 8.</p><p><b>${n}</b> is <b>${cls==='living'?'living · सजीव':'non-living · निर्जीव'}</b>.</p>${NOTE[thing]?'<p>'+NOTE[thing]+'</p>':''}`}
function labShow(){if(!$('.aC'))boxes();draw(false)}
function labInit(){}
function labClick(b){if(b.id==='aGo'){decide();return true}return false}
function labChange(t){if(t.id==='aThing'){thing=t.value;boxes();draw(false);$('#aOut').innerHTML='';return true}if(t.classList&&t.classList.contains('aC')){draw(false);return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
