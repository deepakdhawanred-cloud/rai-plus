/* Rai Plus content pack: Class 8 Science (Curiosity), Chapter 12 – How Nature Works in Harmony. */
RP.register({key:'8sci12',cls:'8',subject:'Science',ch:'12',title:"How Nature Works in Harmony",color:'#3b6d11',
crumb:"Class 8 Science · Curiosity",h1:"Chapter 12: How Nature Works in Harmony",sub:"Habitats and their biotic and abiotic parts, levels of organisation, food chains and webs, decomposers and nature's recycling, relationships between organisms, and conservation through protected areas and sustainable farming.",heroLabel:"A food web linking plants and animals",labName:'Food web balance simulator',
theme:"\n:root{--g:light-dark(#3b6d11,#a8d77d);--g2:light-dark(#eef6e4,#0f1a07);--line:light-dark(#d4e7bf,#2c4219);--bg:light-dark(#ffffff,#0b1206);--card:light-dark(#ffffff,#111a0a);\n--ink:light-dark(#162508,#e6f1da);--mute:light-dark(#4f6439,#b5c9a0);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#2b520b}\n",
labHTML:`  <h2>Food web balance simulator</h2>
  <p>A grassland: grass is eaten by hares, hares are eaten by foxes. Run the model for 40 seasons and watch the populations rise and fall together. Then remove a species, or let farmers spray a pesticide on the grass, and see what happens. (A simplified model for learning.)</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="fwSvg" viewBox="0 0 460 320" role="img" aria-label="Population graph" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Change<select id="fwC"><option value="none">Balanced (no change)</option><option value="nofox">Remove all foxes (hunting)</option><option value="nohare">Hares die of disease</option><option value="drought">Drought: grass grows slowly</option></select></label></div>
  <div class="ctrl"><button class="btn" id="fwGo">Run 40 seasons</button></div>
  <div class="box y" id="fwOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3b6d11',LABNAME='Food web balance simulator',MIND_CENTER='Ecosystem harmony';
const GN='#3b6d11',OR='#b04a1f',BL='#1f5f8b',PU='#6a4fb3',BR='#8a6b3d',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
const arr=(x1,y1,x2,y2,c=GR,w=2)=>{const a=Math.atan2(y2-y1,x2-x1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/><path d="M${x2} ${y2} L${x2-8*Math.cos(a-.45)} ${y2-8*Math.sin(a-.45)} L${x2-8*Math.cos(a+.45)} ${y2-8*Math.sin(a+.45)}Z" fill="${c}"/>`};
function heroDraw(){return `<circle cx="100" cy="120" r="12" fill="#fff"/><circle cx="190" cy="80" r="12" fill="#fff"/><circle cx="280" cy="40" r="12" fill="#fff"/><path d="M110 112 L180 88 M200 72 L270 48" stroke="#fff" stroke-width="2.5"/><circle cx="280" cy="120" r="12" fill="#fff"/><path d="M200 88 L270 112" stroke="#fff" stroke-width="2.5"/>`}
const HERO=heroDraw;
const MIND=[['Habitat: biotic & abiotic',100,50],['Levels of organisation',420,50],['Food chains & webs',90,150],['Decomposers & recycling',430,150],['Relationships',110,250],['Conservation',410,250]];

const C=[
{id:'n1',num:'12.1',title:'Habitats: living and non-living parts',
 intro:'A pond has fish, frogs, water plants — and also water, sunlight, mud and air. Which of these matter to the fish?',
 obj:'Identify biotic and abiotic components of a habitat and how they interact.',
 prior:'Class 6–7: habitats and adaptation.',
 simple:'A habitat is the place where an organism lives and finds food, water, shelter and mates. It has biotic (living) components — plants, animals, microorganisms — and abiotic (non-living) components — sunlight, water, air, soil, temperature, minerals. They depend on each other: plants need sunlight, water and minerals; animals need plants, water and air; microbes break down dead matter into minerals.',
 detail:'Changing an abiotic factor affects living things: less rainfall dries a pond; warmer water holds less oxygen; polluted soil harms plants. Organisms also change abiotic factors: trees shade soil and add moisture to air; earthworms make soil loose and fertile.',
 real:'The Sultanpur bird sanctuary in Gurugram depends on its wetland water level to attract migratory birds in winter.',
 apply:'List three biotic and three abiotic components of a school garden.',
 see:{w:520,h:220,f:[
  ['A pond habitat.',`<ellipse cx="260" cy="150" rx="200" ry="55" fill="${BL}" opacity=".25"/>`+`<circle cx="430" cy="40" r="20" fill="#e0a800"/>`],
  ['Biotic: fish, frog, plants.',`<path d="M200 150 q15 -10 30 0 q-15 10 -30 0z" fill="${OR}"/><path d="M330 110 v-40 M340 110 v-50 M350 110 v-35" stroke="${GN}" stroke-width="3"/>`+lbl(140,215,'biotic: fish, plants, frogs, microbes','fill="'+GN+'"')],
  ['Abiotic: water, sunlight, soil, air.',lbl(390,215,'abiotic: water, sunlight, soil, air','fill="'+BL+'"')]]},
 seeNote:'Living and non-living work together.',
 do:{title:'Habitat survey',mat:'Notebook, hand lens',steps:['Choose a patch of school ground.','List biotic and abiotic components.'],obs:'Both kinds present.',why:'Every habitat has both.',lab:false},
 memo:'"Bio = alive; a-bio = not alive."',
 miscon:['"Only living things matter in a habitat." Sunlight, water and soil are essential.'],
 terms:['Habitat · आवास','Biotic · जैविक','Abiotic · अजैविक'],
 q:{q:'Which is an abiotic component?',o:['earthworm','sunlight','grass','mushroom'],a:1,why:'Non-living.'},
 exam:'Biotic vs abiotic: 2 marks.'},

{id:'n2',num:'12.2',title:'Organism, population, community, ecosystem',
 intro:'One deer, a herd of deer, all the animals and plants in a forest, and the forest with its soil and rivers — how are these different?',
 obj:'Describe levels of organisation in nature.',
 prior:'12.1.',
 simple:'Organism: a single living thing (one deer). Population: all members of one species living in an area (all deer in a forest). Community: all the populations of different species living together in an area (deer, tigers, trees, insects, fungi). Ecosystem: the community together with its abiotic environment (plus soil, water, air, sunlight) — all interacting.',
 detail:'Ecosystems can be natural (forest, pond, grassland, desert, ocean) or human-made (crop field, aquarium, garden). They may be large or small — even a fallen log is a small ecosystem. A community is larger than a population; an ecosystem is larger than a community.',
 real:'The Aravalli hills near Rewari form an ecosystem with dry forests, leopards, nilgai, birds and scrub.',
 apply:'Arrange from smallest to largest: community, organism, ecosystem, population.',
 see:{w:520,h:220,f:[
  ['Organism → population.',box(20,80,110,50,'Organism',GN,'one deer')+arr(130,105,145,105)+box(145,80,110,50,'Population',BL,'all deer')],
  ['→ community.',arr(255,105,270,105)+box(270,80,110,50,'Community',PU,'all species')],
  ['→ ecosystem.',arr(380,105,395,105)+box(395,80,115,50,'Ecosystem',OR,'+ soil, water, air')]]},
 seeNote:'Each level includes the one before.',
 do:{title:'Nested circles',mat:'Chart paper',steps:['Draw four nested circles labelled with each level for a pond.'],obs:'Each larger circle includes smaller ones.',why:'Levels of organisation.',lab:false},
 memo:'"One, many of one kind, many kinds, plus the place."',
 miscon:['"A community includes soil and water." That is the ecosystem.'],
 terms:['Population · जनसंख्या','Community · समुदाय','Ecosystem · पारितंत्र','Species · प्रजाति'],
 q:{q:'All the deer in a forest form a:',o:['community','population','ecosystem','organism'],a:1,why:'One species.'},
 exam:'Levels of organisation: 2 marks.'},

{id:'n3',num:'12.3',title:'Food chains and food webs',
 intro:'If all the hares in a grassland disappeared, what would happen to the grass — and to the foxes?',
 obj:'Construct food chains and webs and explain the flow of energy.',
 prior:'12.2; Class 7 nutrition.',
 simple:'Producers (green plants) make food using sunlight. Consumers eat others: herbivores (primary consumers, e.g. hare) eat plants; carnivores (secondary/tertiary consumers, e.g. fox, eagle) eat animals; omnivores eat both. A food chain shows who eats whom: grass → grasshopper → frog → snake → eagle. Many interlinked chains form a food web.',
 detail:'Energy flows from the Sun to producers and then up the chain, but at each step most energy is used for living or lost as heat — only about 10% passes on. So there are many more plants than herbivores, and fewer carnivores at the top. Removing one species disturbs the web: without hares, grass may grow too much and foxes go hungry.',
 real:'When vultures nearly vanished in India (due to a cattle drug), carcasses rotted longer and stray dog numbers rose.',
 apply:'Make a food chain with four links from a pond.',
 see:{w:520,h:220,f:[
  ['Grass (producer).',box(20,80,90,45,'Grass',GN,'producer')],
  ['→ grasshopper → frog.',arr(110,102,130,102)+box(130,80,100,45,'Grasshopper',BR)+arr(230,102,250,102)+box(250,80,80,45,'Frog',BL)],
  ['→ snake → eagle.',arr(330,102,345,102)+box(345,80,70,45,'Snake',PU)+arr(415,102,430,102)+box(430,80,80,45,'Eagle',OR)+lbl(260,175,'energy decreases at each step (~10% passes on)','font-weight="700"')]]},
 seeNote:'Arrows show the direction food (energy) moves.',
 do:{title:'Web of string',mat:'Ball of string, name cards',steps:['Each student is an organism; pass string to what eats you.','Remove one student; see who is affected.'],obs:'Many links tug.',why:'Interdependence.',lab:true},
 memo:'"Sun → plants → plant-eaters → meat-eaters."',
 miscon:['"Arrows point to the eater\'s food." They point from food to eater (direction of energy).'],
 terms:['Producer · उत्पादक','Consumer · उपभोक्ता','Herbivore · शाकाहारी','Carnivore · मांसाहारी','Food chain · खाद्य श्रृंखला','Food web · खाद्य जाल'],
 q:{q:'In grass → hare → fox, the hare is a:',o:['producer','primary consumer','decomposer','tertiary consumer'],a:1,why:'Eats plants.'},
 exam:'Food chain and web: 3 marks.'},

{id:'n4',num:'12.4',title:'Decomposers: nature\'s recyclers',
 intro:'Leaves fall in every forest every year. Why isn\'t the forest floor buried metres deep?',
 obj:'Explain the role of decomposers and scavengers in recycling nutrients.',
 prior:'12.3; Ch 2 microbes.',
 simple:'Decomposers — bacteria and fungi — break down dead plants, animals and waste into simpler substances. These return minerals to the soil, which plants absorb again. Scavengers (vultures, crows, hyenas) and detritivores (earthworms, millipedes) help by breaking dead matter into smaller pieces. Nature has no "waste": everything is recycled.',
 detail:'Without decomposers, dead matter would pile up and nutrients would be locked away. Composting uses decomposers to turn kitchen and garden waste into manure. Plastics are a problem because decomposers cannot break them down easily — they persist for hundreds of years.',
 real:'Pit composting of vegetable waste at home or school produces manure in about 2–3 months.',
 apply:'Why should we separate biodegradable and non-biodegradable waste?',
 see:{w:520,h:240,f:[
  ['Plants take minerals from soil.',box(200,20,120,45,'Plants',GN)],
  ['Animals eat plants; all die eventually.',box(370,100,120,45,'Animals',OR)+arr(320,50,380,98)],
  ['Decomposers return minerals to soil.',box(200,180,120,45,'Decomposers',BR,'bacteria · fungi')+arr(380,145,320,190)+box(30,100,120,45,'Soil minerals',BL)+arr(200,200,150,140)+arr(150,105,200,55)]]},
 seeNote:'A closed loop of nutrients.',
 do:{title:'Compost pit',mat:'Pit or pot, kitchen waste, soil',steps:['Layer waste and soil; keep moist.','Check every two weeks.'],obs:'Dark, crumbly compost.',why:'Decomposition.',lab:false},
 memo:'"Dead to soil, soil to plant, plant to life."',
 miscon:['"Decomposers are harmful germs." They are essential recyclers.'],
 terms:['Decomposer · अपघटक','Scavenger · अपमार्जक','Biodegradable · जैव निम्नीकरणीय','Compost · कम्पोस्ट','Nutrient cycle · पोषक चक्र'],
 q:{q:'Which are decomposers?',o:['hares and deer','bacteria and fungi','eagles','grass'],a:1,why:'Break down dead matter.'},
 exam:'Role of decomposers: 2–3 marks.'},

{id:'n5',num:'12.5',title:'Living together: relationships in nature',
 intro:'A bee visits a flower; a lichen grows on a rock; a tick feeds on a dog. How do these partners affect each other?',
 obj:'Describe mutualism, commensalism, parasitism, predation and competition.',
 prior:'12.3.',
 simple:'Mutualism: both partners benefit — bees get nectar, flowers get pollinated; lichen = fungus + alga; Rhizobium in pulse root nodules. Commensalism: one benefits, the other is unaffected — a bird nesting in a tree. Parasitism: one benefits, the other is harmed — ticks, lice, Cuscuta (amarbel) on plants. Predation: a predator kills and eats prey — tiger and deer. Competition: organisms compete for the same food, space or light.',
 detail:'These interactions keep populations in balance. Predators prevent herbivores from overgrazing; competition limits how many can live in one place. Humans depend on mutualisms too — about a third of our food crops need pollinators like bees.',
 real:'Farmers in Haryana keep bee boxes near mustard fields: bees make honey and mustard yields increase.',
 apply:'Classify: bee and flower; tick and cow; lion and zebra.',
 see:{w:520,h:220,f:[
  ['Mutualism (+ +).',box(20,40,150,55,'Mutualism',GN,'+ / +  bee & flower')],
  ['Parasitism (+ −).',box(185,40,150,55,'Parasitism',OR,'+ / −  tick & dog')],
  ['Predation, commensalism, competition.',box(350,40,150,55,'Predation',PU,'+ / −  tiger & deer')+lbl(260,150,'commensalism: + / 0  ·  competition: − / −','font-size="13" font-weight="700"')]]},
 seeNote:'Who gains, who loses?',
 do:{title:'Relationship cards',mat:'Picture cards of pairs',steps:['Sort pairs into relationship types.'],obs:'Many kinds of links.',why:'Interdependence.',lab:false},
 memo:'"++ mutual, +0 commensal, +− parasite or predator, −− compete."',
 miscon:['"All relationships are harmful." Many are helpful to both.'],
 terms:['Mutualism · सहोपकारिता','Parasitism · परजीविता','Predation · परभक्षण','Competition · प्रतिस्पर्धा','Pollination · परागण'],
 q:{q:'Lichen (fungus + alga) is an example of:',o:['parasitism','mutualism','predation','competition'],a:1,why:'Both benefit.'},
 exam:'Types of interactions: 3 marks.'},

{id:'n6',num:'12.6',title:'Keeping nature in harmony: conservation',
 intro:'How can we grow enough food and build cities without breaking nature\'s balance?',
 obj:'Describe protected areas and sustainable practices that keep ecosystems healthy.',
 prior:'12.1–12.5.',
 simple:'Human activities — cutting forests, hunting, pollution, overusing pesticides — disturb ecosystems. Protected areas conserve habitats: National Parks (strict protection, e.g. Jim Corbett, Sultanpur in Haryana), Wildlife Sanctuaries, and Biosphere Reserves (large areas protecting wildlife and local people\'s ways of life, e.g. Nilgiri). Sustainable farming: crop rotation with pulses, organic manure, mixed cropping, drip irrigation, and natural pest control instead of heavy pesticides.',
 detail:'Pesticides can enter food chains and build up in top predators (biomagnification), harming birds of prey. Project Tiger (1973) helped tiger numbers recover. Simple actions help: reduce waste, compost, save water, plant native trees, avoid single-use plastics.',
 real:'Project Tiger and protected reserves helped India\'s tiger population roughly double from 2006 to 2022.',
 apply:'Suggest three sustainable farming practices.',
 see:{w:520,h:220,f:[
  ['Protected areas.',box(20,40,220,60,'Protected areas',GN,'national parks · sanctuaries · biosphere reserves')],
  ['Sustainable farming.',box(280,40,220,60,'Sustainable farming',BR,'crop rotation · compost · drip · natural pest control')],
  ['Everyday actions.',lbl(260,150,'reduce · reuse · recycle · plant native trees · save water','font-size="13" font-weight="700"')]]},
 seeNote:'Protect habitats, farm wisely.',
 do:{title:'Green audit',mat:'Checklist',steps:['Audit school water, waste and electricity use.','Propose three changes.'],obs:'Practical improvements.',why:'Sustainability.',lab:false},
 memo:'"Protect, rotate, compost, conserve."',
 miscon:['"More pesticide always means more food." Overuse harms soil, pollinators and food chains.'],
 terms:['National park · राष्ट्रीय उद्यान','Wildlife sanctuary · वन्यजीव अभयारण्य','Biosphere reserve · जैवमंडल आरक्षित क्षेत्र','Sustainable · सतत','Crop rotation · फसल चक्र'],
 q:{q:'Growing pulses between cereal crops helps because:',o:['pulses repel all pests','root nodules add nitrogen to soil','pulses need no water','it removes minerals'],a:1,why:'Rhizobium.'},
 exam:'Conservation measures: 3 marks.'}
];

const CARDS=[['Habitat','Place where an organism lives.'],['Biotic / abiotic','Living / non-living parts.'],['Levels','Organism → population → community → ecosystem.'],['Producers','Green plants make food.'],['Food web','Interlinked food chains.'],['10% rule','Energy decreases up the chain.'],['Decomposers','Bacteria, fungi recycle nutrients.'],['Mutualism','Both benefit: bee–flower, lichen.'],['Parasitism','One gains, one harmed.'],['Conservation','Protected areas; sustainable farming.']];

const Q=[
 {lv:1,q:'Which is biotic?',o:['soil','water','fungus','sunlight'],a:2,w:'Living.'},
 {lv:1,q:'Producers are:',o:['green plants','herbivores','decomposers','carnivores'],a:0,w:'Make food.'},
 {lv:1,q:'All species living together in an area form a:',o:['population','community','habitat','organism'],a:1,w:'Community.'},
 {lv:2,q:'In grass → grasshopper → frog → snake, the snake is a:',o:['primary consumer','secondary consumer','tertiary consumer','producer'],a:2,w:'Third consumer.'},
 {lv:2,q:'Cuscuta (amarbel) on a plant shows:',o:['mutualism','parasitism','commensalism','competition'],a:1,w:'Harms host.'},
 {lv:2,q:'Decomposers return ___ to the soil:',o:['plastics','minerals','sunlight','oxygen only'],a:1,w:'Nutrients.'},
 {lv:3,q:'If foxes are removed from grass → hare → fox, first effect:',o:['hares decrease','hares increase','grass increases','nothing'],a:1,w:'Fewer predators.'},
 {lv:3,q:'Only about ___ of energy passes to the next level:',o:['90%','50%','10%','1%'],a:2,w:'10% rule.'},
 {lv:4,q:'Why are top predators fewer in number?',o:['they are slow','less energy reaches the top','they live longer','they eat plants'],a:1,w:'Energy loss.'},
 {lv:4,q:'Sultanpur in Haryana is known as a:',o:['desert','bird sanctuary / national park','coral reef','hill station'],a:1,w:'Wetland birds.'},
 {lv:5,open:true,m:3,q:'Explain what would happen in a grassland if all the hares died of disease.',ans:['Grass would grow unchecked at first (1)','Foxes lose food and decline/move away (1)','Balance of the food web is disturbed; other species affected (1)']},
 {lv:5,open:true,m:5,q:'Describe the role of decomposers and suggest how we can use them to manage waste.',ans:['Bacteria and fungi break down dead matter (1)','Return minerals to soil for plants (1)','Prevent piling up of dead matter (1)','Composting kitchen/garden waste (1)','Separate biodegradable from plastics, which decomposers cannot break down (1)']}
];

const ONEMIN=['Habitat: biotic and abiotic parts.','Organism → population → community → ecosystem.','Food chains, webs, 10% energy rule.','Decomposers recycle nutrients.','Mutualism, parasitism, predation, competition.','Protected areas and sustainable farming.'];
const KEYS=[['biotic/abiotic',/biotic/i],['levels',/population|community|ecosystem/i],['food chain',/food chain|food web|producer|consumer/i],['decomposers',/decompos|recycl/i],['relationships',/mutual|parasit|predat|competi/i],['conservation',/conserv|protected|sustainable|sanctuary/i]];

/* ---------- lab ---------- */
let wired=false;
function sim(ch){let G=500,H=40,F=8;const out=[];const gr=ch==='drought'?.225:.5;for(let t=0;t<=40;t++){out.push([G,H,F]);if(ch==='nofox'&&t===5)F=0;if(ch==='nohare'&&t===5)H=0;
 const eatG=Math.min(G*.5,.004*G*H),eatH=Math.min(H*.5,.01*H*F);G=Math.max(5,G+gr*G*(1-G/800)-eatG);H=Math.max(0,H+.12*eatG-.1*H-eatH);F=Math.max(0,F+.3*eatH-.12*F);if(ch==='nohare'&&t>=5)H=0;if(F<.3)F=0}return out}
function draw(data,ch){const x0=50,x1=440,y0=270,y1=30;const X=t=>x0+t*(x1-x0)/40;const Yg=v=>y0-(v/900)*(y0-y1),Yh=v=>y0-(v/180)*(y0-y1),Yf=v=>y0-(v/45)*(y0-y1);
 let s=`<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="${ink}"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1}" stroke="${ink}"/>`+T(245,300,'seasons →','font-size="11"');
 const line=(f,c)=>`<polyline points="${data.map((d,t)=>X(t).toFixed(1)+','+f(d).toFixed(1)).join(' ')}" fill="none" stroke="${c}" stroke-width="2.5"/>`;s+=line(d=>Yg(d[0]),GN)+line(d=>Yh(d[1]),BR)+line(d=>Yf(d[2]),OR);
 s+=T(90,20,'grass','font-size="12" font-weight="700" fill="'+GN+'"')+T(170,20,'hares','font-size="12" font-weight="700" fill="'+BR+'"')+T(250,20,'foxes','font-size="12" font-weight="700" fill="'+OR+'"')+T(380,20,'(each drawn to its own scale)','font-size="9" fill="'+GR+'"');
 if(ch!=='none'&&ch!=='drought')s+=`<line x1="${X(5)}" y1="${y1}" x2="${X(5)}" y2="${y0}" stroke="${PU}" stroke-dasharray="4 4"/>`+T(X(5)+4,y1+12,'change','font-size="10" text-anchor="start" fill="'+PU+'"');$('#fwSvg').innerHTML=s;
 const e=data[40];const m={none:'Populations rise and fall but stay in balance: more hares → more food for foxes → more foxes → fewer hares → grass recovers…',nofox:`Without foxes, hares boom and overgraze — the grass falls sharply. Predators keep herbivores in check and protect the plants.`,nohare:'With no hares, grass grows freely, but foxes lose their only food here and die out or leave. Every link matters.',drought:'With grass growing slowly, there is less food for hares, so hares and then foxes stay fewer. Abiotic factors affect the whole chain.'}[ch];
 $('#fwOut').innerHTML=`<p>${m}</p><p>After 40 seasons — grass ≈ ${Math.round(e[0])}, hares ≈ ${Math.round(e[1])}, foxes ≈ ${Math.round(e[2])}.</p>`}
function run(){const ch=$('#fwC').value;draw(sim(ch),ch)}
function labShow(){run()}
function labInit(){}
function labClick(b){if(b.id==='fwGo'){run();return true}return false}
function labChange(t){if(t.id==='fwC'){run();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
