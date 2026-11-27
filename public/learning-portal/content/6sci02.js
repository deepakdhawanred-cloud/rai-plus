/* Rai Plus content pack: Class 6 Science (Curiosity), Chapter 2 – Diversity in the Living World. Bilingual terms. */
RP.register({key:'6sci02',cls:'6',subject:'Science',ch:'2',title:"Diversity in the Living World",color:'#3b6d11',
crumb:"Class 6 Science · Curiosity · सजीव जगत में विविधता",h1:"Chapter 2: Diversity in the Living World",sub:"सजीव जगत में विविधता. How plants and animals differ, how we group them, and how they suit where they live.",heroLabel:"A tree, a shrub, a herb and animals of land and water",labName:'Plant detective lab',
theme:"\n:root{--g:light-dark(#3b6d11,#a8d88a);--g2:light-dark(#eef6e6,#111b0b);--line:light-dark(#d3e6c3,#2b3f1f);--bg:light-dark(#ffffff,#0a1007);--card:light-dark(#ffffff,#10170b);\n--ink:light-dark(#131c0c,#e6f0dd);--mute:light-dark(#566749,#adc09f);--y:light-dark(#b3541e,#f2a774);--y2:light-dark(#fbeee4,#2a170a);--hd:#2b500c}\n",
labHTML:`  <h2>Plant detective lab · पौधा जासूस</h2>
  <p>Pick a plant. Look at its leaf veins and roots and its seed. Notice the pattern that links them.</p>
  <div class="ctrl"><label>Plant<select id="pPl"></select></label></div>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="pSvg" viewBox="0 0 460 330" role="img" aria-label="Leaf, root and seed of the chosen plant" style="color:var(--ink)"></svg></div></div>
  <div><div class="box y" id="pOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3b6d11',LABNAME='Plant detective lab',MIND_CENTER='Diversity · विविधता';
const GN='#3b6d11',LG='#97c459',BR='#7a5a2a',OR='#b3541e',BL='#2e6fb5',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
function leaf(cx,cy,type,s=1){const w=40*s,h=90*s;let p=`<path d="M${cx} ${cy-h/2} Q${cx+w} ${cy} ${cx} ${cy+h/2} Q${cx-w} ${cy} ${cx} ${cy-h/2}Z" fill="${LG}" stroke="${GN}" stroke-width="2"/>`;
 if(type==='net'){p+=`<line x1="${cx}" y1="${cy-h/2}" x2="${cx}" y2="${cy+h/2}" stroke="${GN}" stroke-width="2"/>`;for(let i=-3;i<=3;i++){const y=cy+i*h/9;p+=`<path d="M${cx} ${y} l${w*0.55} ${-h*0.08} M${cx} ${y} l${-w*0.55} ${-h*0.08}" stroke="${GN}" stroke-width="1.2"/>`;p+=`<path d="M${cx+w*0.25} ${y-h*0.04} l${w*0.15} ${h*0.05} M${cx-w*0.25} ${y-h*0.04} l${-w*0.15} ${h*0.05}" stroke="${GN}" stroke-width=".8"/>`}}
 else{for(let i=-2;i<=2;i++)p+=`<path d="M${cx} ${cy-h/2} Q${cx+i*w*0.3} ${cy} ${cx} ${cy+h/2}" fill="none" stroke="${GN}" stroke-width="1.2"/>`}return p}
function root(cx,cy,type,s=1){let p='';if(type==='tap'){p+=`<path d="M${cx} ${cy} v${80*s}" stroke="${BR}" stroke-width="5"/>`;for(let i=1;i<5;i++){const y=cy+i*16*s;p+=`<path d="M${cx} ${y} q${14*s} ${6*s} ${26*s} ${14*s} M${cx} ${y+6*s} q${-14*s} ${6*s} ${-24*s} ${14*s}" stroke="${BR}" stroke-width="1.8" fill="none"/>`}}
 else{for(let i=-4;i<=4;i++)p+=`<path d="M${cx} ${cy} q${i*6*s} ${30*s} ${i*12*s} ${70*s}" stroke="${BR}" stroke-width="2" fill="none"/>`}return p}
function plantShape(x,base,kind){if(kind==='herb')return `<path d="M${x} ${base} v-40" stroke="${GN}" stroke-width="3"/>`+leaf(x-10,base-30,'net',.3)+leaf(x+10,base-40,'net',.3);if(kind==='shrub')return [-14,0,14].map(d=>`<path d="M${x} ${base} l${d} -60" stroke="${BR}" stroke-width="4"/>`).join('')+`<circle cx="${x}" cy="${base-70}" r="34" fill="${LG}" opacity=".9"/>`;return `<rect x="${x-8}" y="${base-90}" width="16" height="90" fill="${BR}"/><circle cx="${x}" cy="${base-120}" r="55" fill="${GN}" opacity=".85"/>`}
function heroDraw(){return `<rect x="40" y="60" width="8" height="50" fill="#fff"/><circle cx="44" cy="45" r="26" fill="#fff" opacity=".85"/><circle cx="120" cy="85" r="18" fill="#fff" opacity=".7"/><path d="M180 110 v-20" stroke="#fff" stroke-width="3"/><path d="M220 95 q15 -9 30 0 q-15 9 -30 0 l-8 -6 v12z" fill="#fff"/>`}
const HERO=heroDraw;
const MIND=[['Diversity & nature walk',100,50],['Herbs, shrubs, trees',420,50],['Leaves & roots',90,150],['Seeds: one or two parts',430,150],['Animals & adaptations',110,250],['Protecting biodiversity',410,250]];

const C=[
{id:'d1',num:'2.1',title:'Diversity around us · हमारे चारों ओर विविधता',
 intro:'On a short walk, how many different plants and animals can you spot?',
 obj:'Recognise the variety of living things and record observations in a table.',
 prior:'Living and non-living things.',
 simple:'Nature is full of different plants and animals: this variety is called diversity (विविधता). In the chapter, students go on a nature walk with Dr Raghu and Maniram Chacha and record what they see. Plants differ in height, stem, leaves and flowers. Animals differ in where they live, what they eat and how they move.',
 detail:'Observing carefully and recording in a table (name, where found, height, type of stem, leaf shape, flower colour) helps us compare living things and find similarities. Grouping by similarities makes it easier to study the huge variety of life. The variety of plants and animals in a region is called biodiversity (जैव विविधता).',
 real:'A school garden in Haryana may have neem, tulsi, grass, roses, bougainvillea, sparrows, butterflies and earthworms: that is local biodiversity.',
 apply:'Make a table of 5 plants and 5 animals you see near your home.',
 see:{w:520,h:220,f:[
  ['Plants of different heights.',plantShape(80,190,'herb')+plantShape(170,190,'shrub')+plantShape(290,190,'tree')],
  ['Animals that walk, fly, swim and crawl.',`<path d="M380 80 q12 -10 24 0 q12 -10 24 0" stroke="${ink}" stroke-width="2.5" fill="none"/><path d="M380 170 q15 -9 30 0 q-15 9 -30 0 l-8 -6 v12z" fill="${BL}"/><path d="M440 190 q10 -6 20 0 q10 6 20 0" stroke="${OR}" stroke-width="4" fill="none"/>`],
  ['This variety is biodiversity · जैव विविधता.',lbl(260,212,'diversity · विविधता','font-weight="700"')]]},
 seeNote:'Record what you see in a table.',
 do:{title:'Nature walk table',mat:'Notebook, pencil',steps:['Walk around the school for 20 minutes.','Fill a table: name, where seen, height, stem, leaves, flower colour.','Compare tables with friends.'],obs:'Many different living things even in a small area.',why:'Diversity is everywhere.',lab:true},
 memo:'"Look, list, compare, group."',
 miscon:['"Diversity means only rare animals." Common plants and insects count too.'],
 terms:['Diversity · विविधता','Biodiversity · जैव विविधता','Observation table'],
 q:{q:'The variety of plants and animals in a region is called:',o:['habitat','biodiversity','adaptation','climate'],a:1,why:'Definition.'},
 exam:'Define biodiversity: 1 mark.'},

{id:'d2',num:'2.2',title:'Herbs, shrubs, trees, climbers and creepers',
 intro:'Why can you bend a tomato plant but not a mango tree?',
 obj:'Group plants by height and type of stem.',
 prior:'Parts of a plant.',
 simple:'Herbs (शाक) are small plants with soft, green stems, e.g. tomato, mint, wheat. Shrubs (झाड़ी) are medium-sized with hard, woody stems that branch near the base, e.g. rose, hibiscus, lemon. Trees (वृक्ष) are tall with thick, woody trunks that branch higher up, e.g. mango, neem, peepal. Plants with weak stems that climb using support are climbers (आरोही), e.g. money plant, grapevine; those that spread on the ground are creepers (विसर्पी लता), e.g. pumpkin, watermelon.',
 detail:'Climbers often use tendrils (pea) or twine around supports. Creepers have stems too weak to stand or climb, so they spread along the ground. Grouping by height and stem is one way of organising plants; we can also group them by leaves, roots or seeds.',
 real:'Bottle gourd (lauki) is grown on a support (mandap) as a climber in many Indian homes, while pumpkin spreads on the ground as a creeper.',
 apply:'Classify: tulsi, neem, rose, pumpkin, money plant, mustard.',
 see:{w:520,h:240,f:[
  ['Herb: small, soft green stem.',plantShape(70,200,'herb')+lbl(70,225,'herb · शाक')],
  ['Shrub: woody stem branching near the base. Tree: thick trunk.',plantShape(180,200,'shrub')+lbl(180,225,'shrub · झाड़ी')+plantShape(310,200,'tree')+lbl(310,225,'tree · वृक्ष')],
  ['Climber uses support; creeper spreads on the ground.',`<line x1="430" y1="200" x2="430" y2="60" stroke="${BR}" stroke-width="4"/><path d="M430 200 q20 -20 0 -40 q-20 -20 0 -40 q20 -20 0 -40" stroke="${GN}" stroke-width="3" fill="none"/><path d="M380 205 q30 -8 60 0 q30 8 60 0" stroke="${GN}" stroke-width="3" fill="none"/>`+lbl(450,225,'climber / creeper','font-size="11"')]]},
 seeNote:'Not to scale.',
 do:{title:'Stem bend test',mat:'Stems of a herb, shrub and tree twig (fallen)',steps:['Gently try to bend each.','Note: soft/green or hard/woody.'],obs:'Herb stems bend easily; woody stems do not.',why:'Woody stems are strong.',lab:false},
 memo:'"Herb is soft, shrub is bushy, tree is tall."',
 miscon:['"All big plants are trees." Banana is a large herb.','"Climbers and creepers are the same." Climbers go up; creepers spread on the ground.'],
 terms:['Herb · शाक','Shrub · झाड़ी','Tree · वृक्ष','Climber · आरोही','Creeper · विसर्पी लता'],
 q:{q:'Rose is a:',o:['herb','shrub','tree','creeper'],a:1,why:'Woody stem, branching near base.'},
 exam:'Classify plants as herb/shrub/tree/climber/creeper: 2 marks.'},

{id:'d3',num:'2.3',title:'Leaves and roots · पत्तियाँ और जड़ें',
 intro:'Look at a grass leaf and a hibiscus leaf against the light. The veins look different. Do their roots differ too?',
 obj:'Identify reticulate and parallel venation and taproot and fibrous roots, and the link between them.',
 prior:'Parts of a plant.',
 simple:'The pattern of veins in a leaf is called venation (शिराविन्यास). In reticulate venation (जालिकावत) veins form a net on both sides of a midrib (hibiscus, mango, tulsi). In parallel venation (समानांतर) veins run side by side (grass, wheat, maize, banana). A taproot (मूसला जड़) has one main root with side roots (mustard, carrot, pea). Fibrous roots (झकड़ा जड़) are many thin roots of similar size (wheat, grass, maize, onion).',
 detail:'There is a pattern: plants with reticulate venation usually have taproots, and plants with parallel venation usually have fibrous roots. So by looking at a leaf, you can often predict the type of root without digging the plant up. Roots hold the plant in the soil and absorb water and minerals.',
 real:'Farmers pull out weeds more easily if they have fibrous roots near the surface; taprooted weeds go deep.',
 apply:'A plant has parallel venation. Predict its root type.',
 see:{w:520,h:250,f:[
  ['Reticulate venation → taproot.',leaf(110,80,'net',1)+root(110,150,'tap',1)+lbl(110,245,'reticulate → tap')],
  ['Parallel venation → fibrous roots.',leaf(370,80,'par',1)+root(370,150,'fib',1)+lbl(370,245,'parallel → fibrous')]]},
 seeNote:'This link holds for most plants.',
 do:{title:'Leaf and root survey',mat:'Small uprooted weeds/plants (with permission), hand lens',steps:['Look at the leaf veins of each plant.','Gently wash its roots and look at them.','Record in a table.'],obs:'Net veins go with taproots; parallel veins with fibrous roots.',why:'They belong to two plant groups.',lab:true},
 memo:'"Net leaf, tap root; lines leaf, fibrous root."',
 miscon:['"All leaves have the same vein pattern." There are two main patterns.','"Fibrous roots are weak." They hold soil very well.'],
 terms:['Venation · शिराविन्यास','Reticulate · जालिकावत','Parallel · समानांतर','Taproot · मूसला जड़','Fibrous root · झकड़ा जड़'],
 q:{q:'Wheat has:',o:['reticulate venation and taproot','parallel venation and fibrous roots','reticulate venation and fibrous roots','no roots'],a:1,why:'Grass family.'},
 exam:'Link between venation and root type: 2 marks.'},

{id:'d4',num:'2.4',title:'Seeds: monocots and dicots · एकबीजपत्री और द्विबीजपत्री',
 intro:'Soak a gram seed and a maize seed overnight. One splits into two halves; the other does not. Why?',
 obj:'Distinguish monocot and dicot seeds and connect them to leaf and root patterns.',
 prior:'Leaves and roots (2.3).',
 simple:'A seed contains a tiny plant and stored food in seed leaves called cotyledons (बीजपत्र). Seeds with two cotyledons are dicots (द्विबीजपत्री), e.g. gram, pea, bean, groundnut. Seeds with one cotyledon are monocots (एकबीजपत्री), e.g. maize, wheat, rice.',
 detail:'Soaked dicot seeds split easily into two equal halves; monocot seeds do not. Dicot plants usually have reticulate venation and taproots; monocot plants usually have parallel venation and fibrous roots. So seeds, leaves and roots together help us group plants.',
 real:'Pulses like moong and chana are dicots; cereals like wheat, rice and bajra are monocots.',
 apply:'Classify: rajma, rice, groundnut, maize.',
 see:{w:520,h:220,f:[
  ['Dicot seed (gram): two cotyledons.',`<ellipse cx="110" cy="110" rx="60" ry="45" fill="#e8d4a0" stroke="${BR}" stroke-width="2"/><line x1="110" y1="65" x2="110" y2="155" stroke="${BR}" stroke-width="2"/>`+lbl(110,185,'dicot · द्विबीजपत्री')],
  ['Monocot seed (maize): one cotyledon.',`<path d="M370 60 q50 10 45 60 q-5 45 -45 45 q-40 0 -45 -45 q-5 -50 45 -60z" fill="#f2c94c" stroke="${BR}" stroke-width="2"/>`+lbl(370,185,'monocot · एकबीजपत्री')],
  ['Dicot → net veins, taproot. Monocot → parallel veins, fibrous roots.',lbl(260,212,'2 cotyledons → net + tap · 1 cotyledon → parallel + fibrous','font-size="12" font-weight="700"')]]},
 seeNote:'Soak seeds overnight to see this clearly.',
 do:{title:'Seed split',mat:'Gram, pea, maize and wheat seeds soaked overnight',steps:['Gently press each seed.','See if it splits into two equal parts.'],obs:'Gram and pea split; maize and wheat do not.',why:'Dicots have two cotyledons.',lab:true},
 memo:'"Di = two halves; mono = one piece."',
 miscon:['"All seeds split into two." Only dicot seeds do.'],
 terms:['Cotyledon · बीजपत्र','Dicot · द्विबीजपत्री','Monocot · एकबीजपत्री','Germination · अंकुरण'],
 q:{q:'Maize seed has:',o:['two cotyledons','one cotyledon','no cotyledon','three cotyledons'],a:1,why:'Monocot.'},
 exam:'Monocot vs dicot with examples: 2 marks.'},

{id:'d5',num:'2.5',title:'Animals, habitats and adaptations · आवास और अनुकूलन',
 intro:'Why does a camel have long legs and a fish a smooth, pointed body?',
 obj:'Group animals by movement and habitat, and explain adaptations with examples.',
 prior:'Diversity of animals.',
 simple:'Animals can be grouped by how they move (walk, fly, swim, crawl), what they eat, and where they live. A habitat (आवास) is the place where an organism lives and gets food, water and shelter. Habitats are terrestrial (land) or aquatic (water). Special features that help an organism survive in its habitat are called adaptations (अनुकूलन).',
 detail:'Desert: camels have long legs that keep the body away from hot sand, broad feet for walking on sand, and humps that store fat; cactus stores water in thick stems and has spines instead of leaves. Mountains: deodar and pine trees are cone-shaped so snow slides off; yaks have long hair to keep warm; snow leopards have thick fur. Water: fish have streamlined bodies, fins to swim and gills to breathe; lotus and water lily have floating leaves. Each organism is suited to its own habitat and may not survive in another.',
 real:'In Rajasthan and western Haryana, camels are used in sandy areas because of their adaptations.',
 apply:'How is a fish adapted to life in water?',
 see:{w:520,h:240,f:[
  ['Desert: camel and cactus.',`<rect x="20" y="170" width="150" height="30" fill="#e8d4a0"/><path d="M52 170 v-48 M64 170 v-48 M98 170 v-48 M110 170 v-48" stroke="#a07a52" stroke-width="5"/><ellipse cx="80" cy="116" rx="40" ry="16" fill="#c9a27a"/><path d="M62 104 q14 -26 28 0z" fill="#c9a27a"/><path d="M116 112 q14 -16 12 -40" stroke="#c9a27a" stroke-width="9" fill="none" stroke-linecap="round"/><ellipse cx="134" cy="70" rx="11" ry="7" fill="#c9a27a"/><rect x="148" y="110" width="12" height="60" rx="6" fill="${GN}"/>`+lbl(95,225,'desert')],
  ['Mountains: cone-shaped deodar sheds snow.',`<path d="M260 190 L230 190 L260 70 L290 190Z" fill="${GN}"/><path d="M240 120 l20 -8 l20 8" stroke="#fff" stroke-width="3" fill="none"/>`+lbl(260,225,'mountains')],
  ['Water: streamlined fish with fins and gills.',`<rect x="340" y="80" width="170" height="120" fill="${BL}" opacity=".15"/><path d="M380 140 q35 -22 70 0 q-35 22 -70 0 l-16 -12 v24z" fill="${BL}"/>`+lbl(425,225,'water')]]},
 seeNote:'Adaptations suit a particular habitat.',
 do:{title:'Adaptation cards',mat:'Pictures of 8 animals and plants',steps:['Match each to its habitat.','Write one adaptation for each.'],obs:'Every organism has features that fit its home.',why:'Adaptation.',lab:false},
 memo:'"Home shapes the body: desert hump, mountain coat, water fins."',
 miscon:['"A camel\'s hump stores water." It stores fat.','"Animals choose adaptations." Adaptations develop over very long periods.'],
 terms:['Habitat · आवास','Terrestrial · स्थलीय','Aquatic · जलीय','Adaptation · अनुकूलन','Streamlined · धारारेखित'],
 q:{q:'The conical shape of deodar trees helps them to:',o:['store water','let snow slide off','float','attract birds'],a:1,why:'Mountain adaptation.'},
 exam:'Adaptations of camel, fish, cactus or deodar: 2–3 marks.'},

{id:'d6',num:'2.6',title:'Protecting biodiversity · जैव विविधता का संरक्षण',
 intro:'What happens to a bird when the forest where it nests is cut down?',
 obj:'Explain why biodiversity matters and how it is protected.',
 prior:'Habitats (2.5).',
 simple:'When habitats are destroyed by cutting forests, pollution or building, plants and animals lose their homes and may disappear. Protecting biodiversity keeps nature balanced. India runs projects such as Project Tiger and the reintroduction of cheetahs. Sacred groves are forest patches protected by local communities for generations.',
 detail:'Every living thing depends on others: plants give food and oxygen, insects pollinate flowers, decomposers recycle nutrients. Losing even one species can affect many others. We can help by planting native trees, not wasting water and paper, not disturbing birds\' nests and keeping our surroundings clean.',
 real:'Sacred groves exist in many states of India, such as the "devrais" of Maharashtra and the "orans" of Rajasthan.',
 apply:'List three things your class can do to protect local biodiversity.',
 see:{w:520,h:220,f:[
  ['A forest home for many species.',[60,120,180].map(x=>`<rect x="${x-5}" y="140" width="10" height="50" fill="${BR}"/><circle cx="${x}" cy="125" r="30" fill="${GN}" opacity=".85"/>`).join('')+`<path d="M110 60 q8 -8 16 0 q8 -8 16 0" stroke="${ink}" stroke-width="2" fill="none"/>`],
  ['Cutting it destroys homes.',[320,380].map(x=>`<rect x="${x-6}" y="175" width="12" height="15" fill="${BR}"/>`).join('')+lbl(350,150,'habitat lost','fill="'+OR+'"')],
  ['Protection: Project Tiger, cheetah reintroduction, sacred groves.',lbl(260,212,'protect habitats · संरक्षण','font-weight="700"')]]},
 seeNote:'Protecting habitats protects species.',
 do:{title:'Bird bath project',mat:'A shallow bowl, water',steps:['Place a shallow water bowl in a safe shaded spot.','Record birds that visit for a week.'],obs:'Several kinds of birds visit.',why:'Small acts support local biodiversity.',lab:false},
 memo:'"Save the home, save the species."',
 miscon:['"Only big animals matter." Insects and plants are just as important.'],
 terms:['Conservation · संरक्षण','Project Tiger','Sacred grove · देव वन','Endangered · संकटग्रस्त'],
 q:{q:'Forest patches protected by local communities by tradition are called:',o:['national parks','sacred groves','zoos','gardens'],a:1,why:'NCERT term.'},
 exam:'Ways to protect biodiversity: 2 marks.'}
];

const CARDS=[['Biodiversity · जैव विविधता','Variety of plants and animals in a region.'],['Herb · शाक','Small, soft green stem (tomato, wheat).'],['Shrub · झाड़ी','Woody stem branching near the base (rose).'],['Tree · वृक्ष','Tall, thick woody trunk (mango).'],['Climber / creeper','Climbs on support / spreads on ground.'],['Reticulate venation','Net of veins (hibiscus) → taproot.'],['Parallel venation','Veins side by side (grass) → fibrous roots.'],['Dicot','Two cotyledons (gram, pea).'],['Monocot','One cotyledon (maize, wheat).'],['Habitat · आवास','Place where an organism lives.'],['Adaptation · अनुकूलन','Feature that helps survival in a habitat.'],['Conservation','Project Tiger, cheetah reintroduction, sacred groves.']];

const Q=[
 {lv:1,q:'Mango is a:',o:['herb','shrub','tree','creeper'],a:2,w:'Thick woody trunk.'},
 {lv:1,q:'Pumpkin is a:',o:['climber','creeper','tree','shrub'],a:1,w:'Spreads on the ground.'},
 {lv:1,q:'Grass leaves have:',o:['reticulate venation','parallel venation','no veins','net veins'],a:1,w:'Veins run side by side.'},
 {lv:1,q:'A place where an organism lives is its:',o:['adaptation','habitat','food','shelter only'],a:1,w:'Habitat.'},
 {lv:2,q:'A plant with net-like veins usually has:',o:['fibrous roots','a taproot','no roots','floating roots'],a:1,w:'Reticulate ↔ taproot.'},
 {lv:2,q:'Which seed splits into two halves when soaked?',o:['maize','wheat','gram','rice'],a:2,w:'Dicot.'},
 {lv:2,q:'A camel\'s hump stores:',o:['water','fat','air','sand'],a:1,w:'Fat as food reserve.'},
 {lv:3,q:'A plant has fibrous roots. Its leaves most likely have:',o:['reticulate venation','parallel venation','no veins','both'],a:1,w:'Monocot pattern.'},
 {lv:3,q:'Fish are streamlined so that they can:',o:['breathe in air','move easily through water','store fat','walk on sand'],a:1,w:'Less resistance.'},
 {lv:4,q:'Banana is tall but is a herb because:',o:['it has fruit','its stem is soft, not woody','it grows in water','it is short'],a:1,w:'Grouped by stem.'},
 {lv:4,q:'Which pair is correct?',o:['Rice – dicot','Pea – monocot','Wheat – fibrous roots','Mustard – parallel venation'],a:2,w:'Wheat is a monocot.'},
 {lv:5,open:true,m:3,q:'Explain how a camel is adapted to the desert.',ans:['Long legs keep the body away from hot sand (1)','Broad feet do not sink in sand (1)','Hump stores fat; can go long without water (1)']},
 {lv:5,open:true,m:3,q:'Complete: reticulate venation – ___ root – ___ seed; parallel venation – ___ root – ___ seed. Give one example of each group.',ans:['Reticulate – taproot – dicot (e.g. mustard/gram) (1)','Parallel – fibrous – monocot (e.g. wheat/maize) (1)','Correct examples (1)']}
];

const ONEMIN=['Diversity: variety of life; record in tables.','Herbs (soft), shrubs (woody, bushy), trees (trunk); climbers and creepers.','Reticulate veins ↔ taproot; parallel veins ↔ fibrous roots.','Dicot: 2 cotyledons; monocot: 1 cotyledon.','Habitat: where an organism lives; terrestrial or aquatic.','Adaptations: camel, cactus, deodar, yak, fish.','Protect biodiversity: Project Tiger, cheetahs, sacred groves.'];
const KEYS=[['biodiversity',/biodivers|विविधता/i],['herb/shrub/tree',/herb|shrub|tree|शाक|झाड़ी/i],['climber/creeper',/climber|creeper/i],['venation',/venation|reticulate|parallel|शिरा/i],['taproot/fibrous',/tap|fibrous|मूसला|झकड़ा/i],['monocot/dicot',/monocot|dicot|cotyledon/i],['habitat',/habitat|आवास/i],['adaptation',/adapt|अनुकूलन/i],['conservation',/conserv|project tiger|sacred/i]];

/* ---------- lab ---------- */
const PL=[['Mustard · सरसों','net','tap','di'],['Wheat · गेहूँ','par','fib','mono'],['Hibiscus · गुड़हल','net','tap','di'],['Maize · मक्का','par','fib','mono'],['Tulsi · तुलसी','net','tap','di'],['Grass · घास','par','fib','mono'],['Pea · मटर','net','tap','di'],['Onion · प्याज़','par','fib','mono'],['Mango · आम','net','tap','di'],['Banana · केला','par','fib','mono']];let pi=0;
function draw(){const [n,v,r,sd]=PL[pi];let s=leaf(90,110,v,1.2)+T(90,190,v==='net'?'reticulate venation':'parallel venation','font-size="12"')+`<line x1="160" y1="20" x2="160" y2="310" stroke="#ccc"/>`+root(240,60,r,1.4)+T(240,190,r==='tap'?'taproot':'fibrous roots','font-size="12"')+`<line x1="320" y1="20" x2="320" y2="310" stroke="#ccc"/>`;
 s+=sd==='di'?`<ellipse cx="390" cy="110" rx="45" ry="34" fill="#e8d4a0" stroke="${BR}" stroke-width="2"/><line x1="390" y1="76" x2="390" y2="144" stroke="${BR}" stroke-width="2"/>`:`<path d="M390 70 q38 8 34 46 q-4 34 -34 34 q-30 0 -34 -34 q-4 -38 34 -46z" fill="#f2c94c" stroke="${BR}" stroke-width="2"/>`;s+=T(390,190,sd==='di'?'2 cotyledons (dicot)':'1 cotyledon (monocot)','font-size="12"');
 s+=T(230,260,n,'font-size="18" font-weight="700"');$('#pSvg').innerHTML=s;
 $('#pOut').innerHTML=`<p><b>${n}</b></p><p>Leaf: <b>${v==='net'?'reticulate (जालिकावत)':'parallel (समानांतर)'}</b></p><p>Root: <b>${r==='tap'?'taproot (मूसला जड़)':'fibrous (झकड़ा जड़)'}</b></p><p>Seed: <b>${sd==='di'?'dicot (द्विबीजपत्री)':'monocot (एकबीजपत्री)'}</b></p><p>Pattern: ${v==='net'?'net veins → taproot → dicot':'parallel veins → fibrous roots → monocot'}.</p>`}
function labShow(){const s=$('#pPl');if(!s.options.length)s.innerHTML=PL.map((p,i)=>`<option value="${i}">${p[0]}</option>`).join('');draw()}
function labInit(){}
function labClick(){return false}
function labChange(t){if(t.id==='pPl'){pi=+t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
