/* Rai Plus content pack: Class 10 Science, Chapter 13 – Our Environment */
RP.register({key:'10sci13',cls:'10',subject:'Science',ch:'13',title:"Our Environment",color:'#1f6b52',
crumb:"HBSE Class 10 Science \u00b7 Unit: Natural Resources (4 marks) \u00b7 Taught in December",h1:"Chapter 13: Our Environment",sub:"Where energy goes, where poisons gather, and what happens to what we throw away.",heroLabel:"The Sun shining on a pyramid of producers, herbivores and carnivores",labName:"Ecosystem lab",
theme:"\n:root{--g:light-dark(#1f6b52,#7fcfb0);--g2:light-dark(#e6f3ee,#13261f);--line:light-dark(#cfe3da,#24403a);--bg:light-dark(#ffffff,#0c1613);--card:light-dark(#ffffff,#10201a);\n--ink:light-dark(#10201a,#e3efe9);--mute:light-dark(#4d6359,#9db7ab);--y:light-dark(#e2b93b,#e8c45a);--y2:light-dark(#fbf5dd,#26220f);--hd:#163f31}\n",labHTML:"  <h2>Ecosystem lab</h2>\n  <p>Build a food chain and watch energy shrink at every step, see pesticides pile up at the top, sort waste into the right bins, and test how CFCs thin the ozone shield.</p>\n  <div class=\"ftabs\" role=\"group\" aria-label=\"Lab tool\"><button data-tool=\"chain\" aria-pressed=\"true\">Food chain and energy</button><button data-tool=\"waste\" aria-pressed=\"false\">Waste sorter</button><button data-tool=\"ozone\" aria-pressed=\"false\">Ozone shield</button></div>\n  <div id=\"t-chain\">\n    <h3>1. Put the food chain in order</h3>\n    <p class=\"note\">Tap the organisms from the producer up to the top consumer.</p>\n    <div class=\"ctrl\"><label>Ecosystem<select id=\"chainSel\"><option value=\"0\">Grassland</option><option value=\"1\">Pond</option><option value=\"2\">Forest</option></select></label><button class=\"btn\" id=\"chainReset\">Start again</button></div>\n    <div class=\"ctrl\" id=\"chips\"></div>\n    <div id=\"chainOut\" class=\"box\" aria-live=\"polite\"></div>\n    <h3>2. Follow the energy</h3>\n    <div class=\"ctrl\"><label>Sunlight falling on the plants (J)<select id=\"sun\"><option value=\"1000000\" selected>1,000,000</option><option value=\"2000000\">2,000,000</option><option value=\"500000\">500,000</option></select></label><label style=\"flex-direction:row;align-items:center;gap:8px\"><input type=\"checkbox\" id=\"pest\" style=\"width:22px;height:22px\"> Spray a pesticide on the crop</label></div>\n    <div class=\"fig\" style=\"max-width:760px\"><svg id=\"pyr\" viewBox=\"0 0 760 340\" role=\"img\" aria-label=\"Energy pyramid\" style=\"color:var(--ink)\"></svg></div>\n    <p class=\"note\" id=\"pyrNote\"></p>\n  </div>\n  <div id=\"t-waste\" hidden>\n    <div class=\"sim\">\n      <div>\n        <h3 id=\"wItem\"></h3>\n        <div class=\"ctrl\"><button class=\"btn p\" data-bin=\"bio\">Biodegradable bin</button><button class=\"btn\" data-bin=\"non\">Non-biodegradable bin</button></div>\n        <div id=\"wFb\" aria-live=\"polite\"></div>\n        <p class=\"note\" id=\"wScore\"></p>\n      </div>\n      <div><div class=\"fig\"><svg id=\"wBins\" viewBox=\"0 0 420 260\" role=\"img\" aria-label=\"Two waste bins\" style=\"color:var(--ink)\"></svg></div></div>\n    </div>\n  </div>\n  <div id=\"t-ozone\" hidden>\n    <div class=\"sim\">\n      <div><div class=\"fig\" style=\"max-width:none\"><svg id=\"oz\" viewBox=\"0 0 600 360\" role=\"img\" aria-label=\"Ozone layer and ultraviolet rays\" style=\"color:var(--ink)\"></svg></div></div>\n      <div>\n        <div class=\"ctrl\"><label>CFCs released (relative amount)<input type=\"range\" id=\"cfc\" min=\"0\" max=\"100\" value=\"0\"></label></div>\n        <div class=\"ctrl\"><button class=\"btn\" id=\"ozAgree\">Apply the 1987 agreement</button></div>\n        <div class=\"box y\" id=\"ozOut\" aria-live=\"polite\"></div>\n        <p class=\"note\">Illustrative model: amounts are relative, not real measurements.</p>\n      </div>\n    </div>\n  </div>\n",
build:function(){

const ACC='#1f6b52',LABNAME='Ecosystem lab',MIND_CENTER='Our environment';
const LEAF='#4f9a3c',SOIL='#8a6a45',WATER='#5aa7d6',SUN='#f2b62b';
const chip=(x,y,t,c='#e6f3ee',w=104)=>`<rect x="${x-w/2}" y="${y-18}" width="${w}" height="36" rx="18" fill="${c}" stroke="#1f6b52"/>`+T(x,y+5,t,'font-size="13"');
function sunG(x,y,r){let s=`<circle cx="${x}" cy="${y}" r="${r}" fill="${SUN}"/>`;for(let i=0;i<12;i++){const a=i*Math.PI/6;s+=`<line x1="${x+Math.cos(a)*(r+4)}" y1="${y+Math.sin(a)*(r+4)}" x2="${x+Math.cos(a)*(r+12)}" y2="${y+Math.sin(a)*(r+12)}" stroke="${SUN}" stroke-width="3" stroke-linecap="round"/>`}return s}
function heroDraw(){let s=sunG(300,34,18);const t=[['#7fbf5a',150,96,'producers'],['#b6d36a',120,74,'herbivores'],['#e2b93b',90,52,'carnivores'],['#d9822b',60,30,'top']];
  t.forEach(([c,w,y,n],i)=>{s+=`<rect x="${180-w}" y="${y}" width="${w*2}" height="20" rx="4" fill="${c}"/>`});return s+`<line x1="290" y1="44" x2="232" y2="96" stroke="${SUN}" stroke-width="2" stroke-dasharray="4 3"/>`}
const HERO=heroDraw;
const MIND=[['Waste types',90,60],['Ecosystem',430,60],['Food chains and webs',90,220],['Energy and 10% law',430,220],['Ozone and garbage',260,265]];

const C=[
{id:'e1',num:'13.1',title:'Biodegradable and non-biodegradable waste',
 intro:'What happens to the things we throw away? Some disappear into the soil; others stay for years.',
 obj:'Distinguish between biodegradable and non-biodegradable substances with examples, and explain why the difference matters.',
 prior:'Decomposition of dead matter (Class 8).',
 simple:'Biodegradable things, like fruit peels, leaves and paper, are broken down by bacteria and fungi into simple substances that go back into the soil. Non-biodegradable things, like plastics and many chemicals, cannot be broken down this way, so they stay in the environment for a very long time.',
 detail:'Substances that are broken down by biological processes, mainly the action of decomposers such as bacteria and fungi, are called biodegradable. Substances that are not broken down by biological processes are non-biodegradable. These may be inert and simply persist in the environment for a long time, or they may harm members of an ecosystem. Enzymes are specific: the decomposers that digest food scraps have no enzymes to break down most plastics, which is why plastics last. Burying a few kinds of waste and checking them over weeks shows this difference directly.',
 real:'Banana peels thrown in a garden vanish in weeks; a polythene bag thrown in the same place may still be there years later, choking drains and harming cattle that eat it.',
 apply:'Your school canteen uses plastic cups. Suggest two biodegradable alternatives and one reason each is better.',
 see:{w:520,h:250,f:[
  ['Two pits in the soil: one with a vegetable peel, one with a plastic bag.',`<rect x="0" y="120" width="520" height="130" fill="${SOIL}" opacity=".35"/>`+chip(140,160,'vegetable peel','#d9efc9',130)+chip(380,160,'plastic bag','#dfe6ee',120)],
  ['After a few weeks, bacteria and fungi have broken the peel down into soil.',`<rect x="80" y="140" width="120" height="40" rx="18" fill="${SOIL}" opacity=".6"/>`+T(140,215,'decomposed','font-size="13"')],
  ['The plastic bag is unchanged: decomposers have no enzymes to break it down.',T(380,215,'still there','font-size="13"')+T(260,40,'Biodegradable vs non-biodegradable','font-weight="700"')]]},
 seeNote:'Based on the NCERT burial activity.',
 do:{title:'Bury and check (two-week activity)',mat:'Two small pots of soil; vegetable peel, a leaf, paper, a polythene piece, a glass marble; labels',steps:['Bury each item in labelled spots and keep the soil moist.','Dig up and observe every 3–4 days for two weeks.','Record changes in a table; photograph each check.'],obs:'Peel, leaf and paper soften and break down; polythene and glass do not change.',why:'Decomposers digest only substances their enzymes can act on. Safety: wash hands after handling soil.',lab:true},
 memo:'"Bio = Breaks down by life."',
 miscon:['"Biodegradable means it disappears overnight." It takes days to months.','"Non-biodegradable means harmless." Some are inert, others poison food chains.'],
 terms:['Biodegradable','Non-biodegradable','Decomposers','Enzymes'],
 q:{q:'Which of these is non-biodegradable?',o:['Fruit peel','Cotton cloth','Polythene bag','Dry leaves'],a:2,why:'Polythene cannot be broken down by decomposers.'},
 exam:'1-mark classification questions and 2–3 mark "difference between" questions are common.'},
{id:'e2',num:'13.2',title:'The ecosystem and its components',
 intro:'Living things and their surroundings work together as one system.',
 obj:'Define an ecosystem and identify its biotic and abiotic components and the roles of producers, consumers and decomposers.',
 prior:'Food habits of animals; photosynthesis (Ch 5).',
 simple:'An ecosystem is all the living things in an area plus their non-living surroundings, interacting. Living parts are biotic (plants, animals, microbes); non-living parts are abiotic (sunlight, water, soil, air, temperature). Plants are producers; animals are consumers; bacteria and fungi are decomposers.',
 detail:'All organisms in an area, together with the non-living constituents of the environment, form an ecosystem. Forests, ponds and lakes are natural ecosystems; gardens, crop fields and aquariums are human-made (artificial) ecosystems. Green plants and blue-green algae make food by photosynthesis and are called producers. Organisms that depend on producers directly or indirectly are consumers: herbivores, carnivores, omnivores and parasites. Decomposers, such as bacteria and fungi, break down dead remains and wastes into simple substances that return to the soil and are used again by plants.',
 real:'A school aquarium is a small artificial ecosystem: it needs plants, fish, light, water and sometimes cleaning because decomposers alone can\'t keep up.',
 apply:'Why do we not need to clean a natural pond the way we clean an aquarium?',
 see:{w:520,h:270,f:[
  ['Abiotic parts: sunlight, water, soil, air.',sunG(460,50,22)+`<rect x="0" y="170" width="520" height="100" fill="${WATER}" opacity=".35"/><rect x="0" y="240" width="520" height="30" fill="${SOIL}" opacity=".5"/>`],
  ['Producers: plants and algae make food from sunlight.',chip(110,140,'water plants','#d9efc9',120)+chip(250,200,'algae','#d9efc9',90)],
  ['Consumers: animals that eat plants or other animals.',chip(360,200,'small fish','#fff2c2',100)+chip(420,140,'frog','#fff2c2',80)],
  ['Decomposers: bacteria and fungi recycle dead matter back into the soil.',chip(260,252,'bacteria and fungi','#efe2d2',160)]]},
 seeNote:'A pond ecosystem: every part depends on others.',
 do:{title:'Make a bottle ecosystem',mat:'A clear jar, pond water, a few water plants, gravel, a snail (optional)',steps:['Add gravel, then pond water and plants; place the jar in indirect light.','Label the biotic and abiotic parts.','Observe and record changes every two days for two weeks.'],obs:'Plants grow, the water stays clearer when balanced; dead leaves slowly break down.',why:'Producers, consumers and decomposers keep materials cycling. Return living things to the pond afterwards.'},
 memo:'"P-C-D": Producers make, Consumers take, Decomposers break.',
 miscon:['"Decomposers are harmful." They are essential recyclers.','"Abiotic factors don\'t matter." Light, water and temperature control which organisms can live there.'],
 terms:['Ecosystem','Biotic, abiotic','Producers, consumers, decomposers','Natural and artificial ecosystems'],
 q:{q:'Which of these is an artificial ecosystem?',o:['Forest','Pond','Crop field','Lake'],a:2,why:'Crop fields, gardens and aquariums are made and managed by humans.'},
 exam:'Definitions and "give examples" questions (1–2 marks); "what if decomposers were absent" (3 marks).'},
{id:'e3',num:'13.2.1',title:'Food chains, food webs and trophic levels',
 intro:'Who eats whom? Food chains trace the path of food, and real ecosystems weave them into webs.',
 obj:'Construct food chains and webs and identify trophic levels.',
 prior:'Concept 13.2: producers and consumers.',
 simple:'A food chain shows who eats whom: grass is eaten by a grasshopper, which is eaten by a frog, which is eaten by a snake, which is eaten by an eagle. Each step is a trophic level. In nature, animals eat many things, so chains join into a food web.',
 detail:'A series of organisms feeding on one another forms a food chain, for example grass → deer → lion. Each step is a trophic level: autotrophs (producers) are the first level, herbivores (primary consumers) the second, small carnivores (secondary consumers) the third, and larger carnivores (tertiary consumers) the fourth. Food chains generally have three or four steps. Since each organism is usually eaten by two or more kinds of organisms, which in turn eat several kinds, the relationships are a network of branching chains called a food web.',
 real:'When frogs were heavily caught in some areas, insect pests increased in rice fields: one change ripples through the web.',
 apply:'In the chain grass → grasshopper → frog → snake → eagle, what is the trophic level of the snake?',
 see:{w:520,h:260,f:[
  ['Producer: grass (level 1).',chip(70,80,'grass','#d9efc9',80)],
  ['Primary consumer: grasshopper (level 2), then frog (level 3).',`<line x1="112" y1="80" x2="140" y2="80" stroke="#555" stroke-width="2" marker-end="url(#ah)"/>`+chip(195,80,'grasshopper','#fff2c2',100)+`<line x1="246" y1="80" x2="272" y2="80" stroke="#555" stroke-width="2" marker-end="url(#ah)"/>`+chip(315,80,'frog','#fff2c2',76)],
  ['Snake (level 4), eagle (level 5). Arrows point from food to eater.',`<line x1="355" y1="80" x2="380" y2="80" stroke="#555" stroke-width="2" marker-end="url(#ah)"/>`+chip(420,80,'snake','#ffe0c2',76)+`<line x1="420" y1="100" x2="420" y2="150" stroke="#555" stroke-width="2" marker-end="url(#ah)"/>`+chip(420,170,'eagle','#ffd2c2',76)],
  ['Add more links and the chains become a food web: the mouse eats grass and is eaten by the snake and the eagle.',chip(195,170,'mouse','#fff2c2',76)+`<path d="M80 98 Q120 170 155 170" fill="none" stroke="#999" stroke-width="2" marker-end="url(#ah)"/><path d="M233 160 Q330 130 395 92" fill="none" stroke="#999" stroke-width="2" marker-end="url(#ah)"/><line x1="233" y1="172" x2="380" y2="172" stroke="#999" stroke-width="2" marker-end="url(#ah)"/>`+T(260,240,'Food web = interlinked food chains','font-size="14"')]]},
 seeNote:'Arrows show the direction food (and energy) moves.',
 do:{title:'Schoolyard food web',mat:'Notebook, a 15-minute walk in the school garden',steps:['List every plant and animal you see or find signs of (bites on leaves, droppings, webs).','Write who eats whom; ask your teacher if unsure.','Draw at least two food chains, then join them into a web.'],obs:'Most animals appear in more than one chain.',why:'Real feeding relationships branch, forming webs.',lab:true},
 memo:'"Arrow = eaten by": food flows to the eater.',
 miscon:['"Arrows point to what is eaten." They point from food to the eater, showing energy flow.','"A food web is one long chain." It is many chains linked together.'],
 terms:['Food chain','Food web','Trophic level','Primary, secondary, tertiary consumer'],
 q:{q:'In the chain grass → deer → lion, the deer is a:',o:['Producer','Primary consumer','Secondary consumer','Decomposer'],a:1,why:'It eats producers directly, so it is at the second trophic level.'},
 exam:'Drawing or completing a food chain/web is common (1–3 marks); identifying trophic levels in a given chain.'},
{id:'e4',num:'13.2.1',title:'Energy flow and the 10 per cent law',
 intro:'Energy enters as sunlight and leaks away at every step, which is why food chains are short.',
 obj:'Explain energy flow in an ecosystem and apply the 10 per cent law.',
 prior:'Concept 13.2.1: trophic levels.',
 simple:'Plants capture only about 1% of the sunlight that falls on their leaves. When an animal eats, only about 10% of the energy in its food becomes its own body; the rest is used for living or lost as heat. So each level up gets about one-tenth of the energy below.',
 detail:'Green plants in a terrestrial ecosystem capture about 1% of the solar energy falling on their leaves and convert it into food energy. When green plants are eaten by primary consumers, a great deal of energy is lost as heat to the environment, some goes into digestion and work, and the rest into growth and reproduction. On average, about 10% of the food eaten is turned into the consumer\'s own body and made available to the next level. This is the 10 per cent law. Since so little energy is available after the fourth level, food chains usually have only three or four steps. Energy flow is unidirectional: energy captured by producers never goes back to the Sun, and energy passed to herbivores does not return to plants.',
 real:'Eating plant foods directly feeds more people from the same farmland than feeding plants to animals and eating the animals.',
 apply:'If plants in a field store 10,000 J, how much energy reaches a snake that eats frogs that eat grasshoppers that eat the plants?',
 see:{w:520,h:290,f:[
  ['Sunlight: 1,000,000 J falls on the plants. They capture about 1%: 10,000 J.',sunG(60,50,24)+`<rect x="110" y="230" width="300" height="40" rx="6" fill="#7fbf5a"/>`+T(260,256,'Producers 10,000 J','font-weight="700"')],
  ['Herbivores get about 10%: 1,000 J.',`<rect x="160" y="180" width="200" height="40" rx="6" fill="#b6d36a"/>`+T(260,206,'Herbivores 1,000 J')],
  ['Carnivores get 10% of that: 100 J. Top carnivores: 10 J.',`<rect x="200" y="130" width="120" height="40" rx="6" fill="#e2b93b"/>`+T(260,156,'Carnivores 100 J')+`<rect x="230" y="80" width="60" height="40" rx="6" fill="#d9822b"/>`+T(260,106,'10 J','fill="#fff"')],
  ['About 90% is lost at each step, mostly as heat. Energy flows one way only.',T(260,30,'10% passes up · 90% lost · flow is one-way','font-size="14"')]]},
 seeNote:'Pyramid widths are not to scale; real differences are even larger.',
 do:{title:'The 10% relay',mat:'100 dried beans (or paper squares) per group of five',steps:['Student 1 (plant) starts with 100 beans and passes 10 to student 2 (herbivore), keeping the rest as "used or lost".','Student 2 passes 10% of what they got (1 bean) to student 3.','Ask: how much can student 4 receive?'],obs:'By the fourth link there is almost nothing left to pass on.',why:'Each level keeps only about 10% of the energy it eats as body mass available to the next level.',lab:true},
 memo:'"Sun 100 → Plant 1 → then ÷10 each step."',
 miscon:['"Energy is recycled like nutrients." Nutrients cycle; energy flows one way and is lost as heat.','"Top predators have the most energy." They get the least.'],
 terms:['Energy flow','10 per cent law','Unidirectional'],
 q:{q:'If producers in an ecosystem have 20,000 J, how much energy reaches the tertiary consumer?',o:['2,000 J','200 J','20 J','2 J'],a:2,why:'20,000 → 2,000 (primary) → 200 (secondary) → 20 J (tertiary).'},
 exam:'Numericals on the 10% law (2–3 marks) and "why are food chains short" (2 marks) are frequent.'},
{id:'e5',num:'13.2.1',title:'Biological magnification',
 intro:'Some chemicals do the opposite of energy: they become more concentrated at each step up the chain.',
 obj:'Explain biological magnification and why humans are most at risk.',
 prior:'Concepts 13.1 and 13.2.1: non-biodegradable substances; food chains.',
 simple:'Pesticides sprayed on crops wash into soil and water. Plants absorb them; animals eat many plants and store the chemicals in their bodies because these chemicals cannot be broken down. Each level eats lots of the level below, so the chemical builds up. Humans, at the top, get the highest amounts.',
 detail:'Pesticides and other chemicals used to protect crops are partly washed into the soil and water bodies. From the soil and water they are absorbed by plants along with water and minerals, and from water bodies they enter aquatic plants and animals. Because these chemicals are not degradable, they accumulate progressively at each trophic level. This increase in concentration of harmful chemicals with each higher trophic level is called biological magnification. Since human beings occupy the top level in many food chains, the maximum concentration of these chemicals gets accumulated in our bodies, which is why food grains, vegetables and fish are tested for pesticide residues.',
 real:'Washing vegetables and choosing produce grown with fewer pesticides reduces what reaches your plate.',
 apply:'Why does a fish-eating bird have far more pesticide in its body than the fish it eats?',
 see:{w:520,h:260,f:[
  ['Pesticide is sprayed on the crop and washes into the water.',chip(80,200,'water / soil','#dbeef8',110)+[0,1,2].map(i=>`<circle cx="${60+i*20}" cy="230" r="4" fill="#b03a2e"/>`).join('')],
  ['Plants and plankton absorb it: a little in each.',chip(200,160,'plankton','#d9efc9',96)+[0,1,2,3].map(i=>`<circle cx="${178+i*14}" cy="186" r="4" fill="#b03a2e"/>`).join('')],
  ['Small fish eat lots of plankton, so they store more.',chip(320,110,'small fish','#fff2c2',100)+[0,1,2,3,4,5,6,7].map(i=>`<circle cx="${290+(i%4)*14}" cy="${134+Math.floor(i/4)*10}" r="4" fill="#b03a2e"/>`).join('')],
  ['Big fish, birds and humans at the top store the most: biological magnification.',chip(440,60,'humans / birds','#ffd2c2',120)+Array.from({length:16},(_,i)=>`<circle cx="${400+(i%8)*11}" cy="${84+Math.floor(i/8)*10}" r="4" fill="#b03a2e"/>`).join('')]]},
 seeNote:'Red dots show relative amounts of pesticide, not real values.',
 do:{title:'Spoonful model',mat:'Coloured water, four cups, a teaspoon and a tablespoon',steps:['Cup 1 (water) has a few drops of colour in plain water.','Take 10 spoonfuls from cup 1 into cup 2, then let half evaporate in the sun (the "body" keeps the colour).','Repeat into cups 3 and 4 and compare colour.'],obs:'The colour gets darker in each cup.',why:'Organisms keep the chemical while losing water and energy, so it concentrates up the chain.',lab:true},
 memo:'"Energy shrinks up the chain; poison grows up the chain."',
 miscon:['"Biological magnification means organisms get bigger." It means chemical concentration increases.'],
 terms:['Biological magnification','Pesticide residue','Non-biodegradable chemicals'],
 q:{q:'In which organism of the chain grass → goat → human would a pesticide be most concentrated?',o:['Grass','Goat','Human','It would be equal in all'],a:2,why:'Non-biodegradable chemicals accumulate at each level, so the top level has the most.'},
 exam:'"What is biological magnification? Will its level be different at different levels?" is a classic 3-mark question.'},
{id:'e6',num:'13.3.1',title:'The ozone layer and its depletion',
 intro:'High in the atmosphere, a thin layer of ozone shields life from the Sun\'s ultraviolet rays.',
 obj:'Explain how ozone forms, why it matters, what depletes it and what has been done about it.',
 prior:'Oxygen and the atmosphere (Class 9).',
 simple:'Ozone (O₃) is a molecule of three oxygen atoms. High up in the atmosphere it absorbs harmful ultraviolet (UV) radiation from the Sun. Chemicals called CFCs, once used in refrigerators and fire extinguishers, break ozone down. In 1987, countries agreed to freeze CFC production at 1986 levels.',
 detail:'Ozone is formed at higher levels of the atmosphere when UV radiation acts on oxygen (O₂) molecules, splitting them into free oxygen atoms, which then combine with O₂ to form ozone: O₂ → O + O, then O + O₂ → O₃. Ozone at ground level is a deadly poison, but the ozone layer shields the Earth\'s surface from UV radiation, which can cause skin cancer and other damage. The amount of ozone began to drop sharply in the 1980s, a decrease linked to synthetic chemicals like chlorofluorocarbons (CFCs), used as refrigerants and in fire extinguishers. In 1987 the United Nations Environment Programme (UNEP) succeeded in forging an agreement to freeze CFC production at 1986 levels, and it is now mandatory for manufacturing companies worldwide to make CFC-free refrigerators.',
 real:'New refrigerators and ACs carry "CFC-free" labels because of this agreement.',
 apply:'Why is ozone helpful high in the atmosphere but harmful at ground level?',
 see:{w:520,h:280,f:[
  ['The Sun sends out ultraviolet (UV) rays.',sunG(70,50,26)],
  ['High in the atmosphere, UV splits O₂, and the free O atoms join O₂ to make ozone (O₃).',`<rect x="0" y="110" width="520" height="30" fill="#8fd0ff" opacity=".6"/>`+T(330,130,'ozone layer (O₃)','font-size="14"')],
  ['The ozone layer absorbs most UV before it reaches the ground.',[150,230,310].map(x=>`<line x1="${x-60}" y1="40" x2="${x}" y2="112" stroke="#8a3fc6" stroke-width="3" stroke-dasharray="6 4"/>`).join('')+`<rect x="0" y="240" width="520" height="40" fill="${LEAF}" opacity=".5"/>`],
  ['CFCs released from old fridges and fire extinguishers break ozone down, letting more UV through.',`<rect x="380" y="110" width="80" height="30" fill="var(--bg)"/>`+`<line x1="370" y1="40" x2="420" y2="240" stroke="#8a3fc6" stroke-width="3"/>`+chip(420,200,'CFCs','#f3d6d6',70)]]},
 seeNote:'The gap in the layer is drawn to show thinning; it is not to scale.',
 do:{title:'Label check and survey',mat:'Old and new refrigerator or AC labels at home or in a shop; notebook',steps:['Find the refrigerant name or "CFC-free" label on appliances.','Survey five households: how old is the fridge, is it CFC-free?','Present the results as a class bar chart.'],obs:'Newer appliances are labelled CFC-free.',why:'International agreement made manufacturers switch to ozone-safer refrigerants.',lab:true},
 memo:'"O₃ up high = sunscreen; O₃ down low = poison."',
 miscon:['"The ozone hole causes global warming." Ozone depletion lets in UV; global warming is a different problem.','"Ozone is harmless everywhere." At ground level it is poisonous.'],
 terms:['Ozone (O₃)','Ultraviolet radiation','CFCs','UNEP 1987'],
 q:{q:'Which chemicals are mainly responsible for depleting the ozone layer?',o:['Carbon dioxide','Chlorofluorocarbons (CFCs)','Nitrogen','Water vapour'],a:1,why:'CFCs used as refrigerants and in fire extinguishers break down ozone.'},
 exam:'"How is ozone formed? Why is its depletion a concern?" (3 marks) is common; the 1987 UNEP agreement is a frequent 1-mark fact.'},
{id:'e7',num:'13.3.2',title:'Managing the garbage we produce',
 intro:'Each of us produces garbage every day. Managing it well is a choice we make at home.',
 obj:'Suggest ways to reduce, sort and dispose of household garbage.',
 prior:'Concept 13.1: biodegradable and non-biodegradable waste.',
 simple:'Improvements in lifestyle have increased the waste we create, and much of it is non-biodegradable packaging. Separating wet (biodegradable) and dry (non-biodegradable) waste at home lets the first be composted and the second be recycled. Better still is to reduce what we use and reuse what we can.',
 detail:'With rising incomes and changing habits, people use more disposable products and packaging, increasing the amount of waste generated. Biodegradable kitchen waste can be composted or used to make biogas, while recyclable materials such as paper, metal and some plastics can be reprocessed. Non-biodegradable waste that is dumped harms soil, water and animals and can choke drains. Local bodies handle collection, but managing waste begins at home: segregating waste into separate bins, avoiding single-use plastics, carrying cloth bags, and reusing containers all cut the load. Even "natural" disposables have a cost: making clay cups (kulhads) in very large numbers would use up fertile topsoil, so reusable options are often better.',
 real:'Many cities in Haryana now ask households to hand over wet and dry waste separately.',
 apply:'Plan a week-long challenge for your family to halve its plastic waste. List three specific changes.',
 see:{w:520,h:240,f:[
  ['Sort at home: a green bin for wet (biodegradable) waste and a blue bin for dry waste.',`<rect x="90" y="80" width="120" height="130" rx="10" fill="#4f9a3c"/>`+T(150,150,'wet','fill="#fff" font-weight="700"')+`<rect x="310" y="80" width="120" height="130" rx="10" fill="#2a62c9"/>`+T(370,150,'dry','fill="#fff" font-weight="700"')],
  ['Wet waste goes to compost or biogas; dry waste is recycled.',T(150,232,'→ compost / biogas','font-size="13"')+T(370,232,'→ recycling','font-size="13"')],
  ['Best of all: reduce and reuse before you throw anything.',T(260,40,'Reduce · Reuse · Recycle','font-weight="700" font-size="18"')]]},
 seeNote:'Bin colours vary by city; check your local system.',
 do:{title:'One-week home waste audit (project)',mat:'Two bags at home, a kitchen scale or a counting sheet',steps:['For 7 days, sort household waste into wet and dry.','Weigh or count items each evening and record them.','Identify the three largest sources of dry waste and suggest a swap for each.','Present a chart and your action plan to the class.'],obs:'Most dry waste is packaging; wet waste is mostly kitchen scraps.',why:'Measuring waste shows where reduction is easiest. Safety: wear gloves when handling waste.',lab:true},
 memo:'"Green for food, blue for the rest; reduce first, that\'s best."',
 miscon:['"Recycling solves the problem." Reducing and reusing come first; recycling also uses energy.','"Natural materials have no cost." Making them in bulk can still harm the environment.'],
 terms:['Segregation','Composting','Recycling','Reduce, reuse'],
 q:{q:'Which action best reduces non-biodegradable waste at home?',o:['Burning plastic bags','Carrying a cloth bag for shopping','Burying plastic in the garden','Throwing waste in the river'],a:1,why:'Avoiding single-use plastic prevents the waste from being created at all.'},
 exam:'Short-answer questions on ways to manage garbage and on reducing disposables appear as 2–3 mark questions.'}
];

const CARDS=[['Biodegradable','Broken down by biological processes (decomposers), e.g. peels, paper.'],['Non-biodegradable','Not broken down by biological processes, e.g. plastics, glass.'],['Ecosystem','All organisms in an area plus the non-living environment, interacting.'],['Biotic and abiotic','Living components; non-living components such as light, water, soil.'],['Producers','Green plants and blue-green algae that make food by photosynthesis.'],['Decomposers','Bacteria and fungi that break down dead remains into simple substances.'],['Artificial ecosystems','Human-made, e.g. gardens, crop fields, aquariums.'],['Trophic level','Each step of a food chain.'],['Food web','A network of interlinked food chains.'],['Energy captured by plants','About 1% of the sunlight falling on their leaves.'],['10 per cent law','About 10% of energy at one level passes to the next.'],['Why food chains are short','Too little energy is left after three or four steps.'],['Energy flow','Unidirectional: it never returns to the previous level.'],['Biological magnification','Increase in concentration of harmful chemicals at each higher trophic level.'],['Ozone formation','O₂ → O + O (by UV); O + O₂ → O₃.'],['Ozone depletion cause','CFCs used as refrigerants and in fire extinguishers.'],['UNEP 1987','Agreement to freeze CFC production at 1986 levels.'],['Garbage management','Reduce, reuse, segregate wet and dry, compost and recycle.']];

const Q=[
 {lv:1,q:'Which of the following is biodegradable?',o:['Plastic bottle','Aluminium can','Vegetable peel','Glass jar'],a:2,w:'Peels are broken down by decomposers.'},
 {lv:1,q:'Decomposers are mainly:',o:['Plants and algae','Bacteria and fungi','Herbivores','Insects only'],a:1,w:'Bacteria and fungi break down dead matter.'},
 {lv:1,q:'True or false: energy flow in an ecosystem is unidirectional.',o:['True','False'],a:0,w:'True: energy never returns to the level it came from.'},
 {lv:1,q:'Fill in the blank: ozone is formed when UV radiation acts on ________.',o:['nitrogen','oxygen (O₂)','carbon dioxide','water'],a:1,w:'UV splits O₂; the atoms join O₂ to form O₃.'},
 {lv:1,q:'Green plants capture about what percentage of the sunlight falling on their leaves?',o:['1%','10%','50%','90%'],a:0,w:'About 1% of incident solar energy.'},
 {lv:2,q:'Food chains usually have only three or four steps because:',o:['Animals stop eating','Energy available decreases greatly at each level','Plants cannot grow tall','Decomposers eat the top consumers'],a:1,w:'Only about 10% passes on each time, so little remains after four steps.'},
 {lv:2,q:'In a food chain, the concentration of non-biodegradable pesticides is highest in:',o:['Producers','Herbivores','The top consumer','Decomposers'],a:2,w:'Biological magnification concentrates them at the top.'},
 {lv:2,q:'An aquarium is called an artificial ecosystem because:',o:['It has no living things','It is made and maintained by humans','It has no water','It has no producers'],a:1,w:'Human-made and managed systems are artificial ecosystems.'},
 {lv:3,q:'Producers in a field store 20,000 J. How much energy reaches the tertiary consumer?',o:['2,000 J','200 J','20 J','2 J'],a:2,w:'20,000 → 2,000 → 200 → 20 J.'},
 {lv:3,q:'Which health problem is most directly linked to ozone depletion?',o:['Malaria','Skin cancer','Diabetes','Goitre'],a:1,w:'More UV reaching the ground increases the risk of skin cancer.'},
 {lv:3,q:'A family wants to cut its waste. Which is the best first step?',o:['Burn plastic at home','Avoid single-use items and carry cloth bags','Bury all waste in the garden','Throw waste in an empty plot'],a:1,w:'Reducing waste at the source is best.'},
 {lv:4,q:'Assertion (A): If all decomposers were removed, dead remains would pile up. Reason (R): Decomposers break down complex organic substances into simple ones that return to the soil.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'Without decomposers, nothing recycles dead matter.'},
 {lv:4,q:'Assertion (A): Pesticide concentration is highest at the top of a food chain. Reason (R): Pesticides are non-biodegradable and accumulate at each trophic level.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'This is biological magnification.'},
 {lv:4,q:'What if all the herbivores in a forest were killed? The most likely immediate effect is:',o:['Carnivores would increase','Plants would overgrow and carnivores would decline','Nothing would change','Decomposers would disappear'],a:1,w:'Plants lose their consumers; carnivores lose their food.'},
 {lv:5,open:true,m:3,q:'What are decomposers? What will happen if there are no decomposers in an ecosystem?',ans:['Bacteria and fungi that break down dead remains and wastes into simple substances (1).','Without them, dead matter would pile up (1).','Nutrients would not return to the soil, so producers would suffer (1).']},
 {lv:5,open:true,m:3,q:'State the 10 per cent law. Explain it with an example of a food chain.',ans:['About 10% of energy at one trophic level passes to the next (1).','Example chain with values, e.g. plants 10,000 J → deer 1,000 J → lion 100 J (1).','Rest lost as heat/used in life processes; energy flow is one-way (1).']},
 {lv:5,open:true,m:3,q:'What is biological magnification? Will the level of this magnification be different at different levels of the ecosystem?',ans:['Increase in concentration of harmful non-biodegradable chemicals at each higher trophic level (1).','Yes, it differs: lowest in producers, highest at the top (1).','Because organisms eat large amounts of the level below and cannot break the chemical down; humans at the top get the most (1).']},
 {lv:5,open:true,m:3,q:'How is ozone formed in the upper atmosphere? Why is its depletion a cause of concern, and what step was taken in 1987?',ans:['O₂ → O + O under UV; O + O₂ → O₃ (1).','Depletion lets more UV reach Earth, causing skin cancer and other harm (1).','UNEP 1987 agreement to freeze CFC production at 1986 levels (1).']},
 {lv:5,open:true,m:2,q:'Give two ways in which you can reduce the problem of garbage disposal at home.',ans:['Segregate wet and dry waste; compost wet waste (1).','Reduce single-use plastics, reuse containers, carry cloth bags (1).']}
];

const ONEMIN=['Biodegradable: broken down by decomposers; non-biodegradable: persists (plastics, glass).','Ecosystem = biotic + abiotic; natural (pond, forest) or artificial (garden, aquarium, crop field).','Producers make food; consumers eat; decomposers (bacteria, fungi) recycle.','Food chain steps = trophic levels; chains interlink into food webs.','Plants capture about 1% of sunlight; about 10% passes to each next level; energy flow is one-way.','Food chains are short (3–4 steps) because energy runs out.','Biological magnification: non-biodegradable chemicals concentrate up the chain; humans at the top get most.','Ozone: O₂ → O + O, O + O₂ → O₃; shields from UV; depleted by CFCs; UNEP 1987 froze CFC production at 1986 levels.','Garbage: reduce, reuse, segregate wet and dry, compost and recycle.'];
const KEYS=[['biodegradable',/biodegrad/i],['decomposers',/decompos|bacteria|fung/i],['ecosystem',/ecosystem/i],['biotic and abiotic',/biotic/i],['producers and consumers',/producer|consumer/i],['food chain / web',/chain|web/i],['trophic level',/trophic/i],['10 per cent law',/10\s*%|ten per|10 per/i],['1% of sunlight',/1\s*%|one per/i],['one-way energy flow',/one.way|unidirection/i],['biological magnification',/magnif/i],['ozone and UV',/ozone|uv|ultra/i],['CFCs',/cfc|chlorofluoro/i],['garbage management',/garbage|recycl|reuse|segregat/i]];


/* ---------- food chain ---------- */
const CHAINS=[['Grass','Grasshopper','Frog','Snake','Eagle'],['Phytoplankton','Zooplankton','Small fish','Big fish','Kingfisher'],['Plants','Deer','Lion']];
let chainSel=0,picked=[],chainOrder=[];
const LVL=['Producer','Primary consumer','Secondary consumer','Tertiary consumer','Quaternary consumer'];
function chainNew(){picked=[];chainOrder=shuf(CHAINS[chainSel].slice());chainDraw()}
function chainDraw(){$('#chips').innerHTML=chainOrder.map(n=>`<button class="btn${picked.includes(n)?' p':''}" data-org="${esc(n)}" ${picked.includes(n)?'disabled':''}>${esc(n)}</button>`).join('');
  const ch=CHAINS[chainSel];let msg=picked.length?picked.map(esc).join(' → '):'Your chain will appear here.';
  if(picked.length===ch.length){const ok=picked.every((x,i)=>x===ch[i]);msg+=ok?`<p class="fb ok">Correct! ${ch.length} trophic levels.</p>`:`<p class="fb no">Not quite. The correct chain is ${ch.map(esc).join(' → ')}. Remember: start with the producer, and the arrow means "is eaten by".</p>`}
  $('#chainOut').innerHTML=msg;pyrDraw()}
function pyrDraw(){const ch=CHAINS[chainSel],sun=+$('#sun').value,pest=$('#pest').checked;let e=sun*0.01;const W=760,rows=ch.length,h=Math.min(56,280/rows);let s='';
  s+=sunG(56,40,20)+T(56,88,(sun/1000).toLocaleString('en-IN')+' kJ','font-size="12"')+T(56,104,'sunlight','font-size="12"');
  ch.forEach((n,i)=>{const en=e*Math.pow(.1,i),w=Math.max(70,560*Math.pow(.62,i)),y=320-(i+1)*h;const col=['#7fbf5a','#b6d36a','#e2b93b','#d9822b','#c0532e'][i];
    s+=`<rect x="${(W-w)/2+40}" y="${y}" width="${w}" height="${h-6}" rx="6" fill="${col}"/>`+T(W/2+40,y+h/2+2,`${n}: ${en>=1?Math.round(en).toLocaleString('en-IN'):en.toFixed(1)} J`,'font-size="14" font-weight="700"');
    s+=`<text x="${(W-w)/2+30}" y="${y+h/2+2}" text-anchor="end" font-size="12" fill="currentColor" font-family="Source Sans 3,sans-serif">${LVL[i]}</text>`;
    if(pest){const c=0.02*Math.pow(10,i);s+=`<text x="${(W+w)/2+52}" y="${y+h/2+2}" font-size="12" fill="#b03a2e" font-family="Source Sans 3,sans-serif">pesticide ${c<1?c.toFixed(2):c.toFixed(0)} ppm</text>`}});
  $('#pyr').innerHTML=s;
  $('#pyrNote').textContent=`Plants capture about 1% of the sunlight (${Math.round(e).toLocaleString('en-IN')} J). Each level passes on about 10%, so the top ${ch[ch.length-1].toLowerCase()} receives only ${(e*Math.pow(.1,ch.length-1)).toFixed(e*Math.pow(.1,ch.length-1)<1?1:0)} J.`+(pest?' Pesticide values are illustrative: the chemical concentrates roughly tenfold at each step, the reverse of energy.':'')}
/* ---------- waste sorter ---------- */
const WASTE=[['Vegetable peel','bio','Decomposers break it down into compost in a few weeks.'],['Plastic carry bag','non','Decomposers have no enzymes to break polythene down; it lasts for years.'],['Old newspaper','bio','Paper is made from plant fibre and decomposes; better still, recycle it.'],['Glass bottle','non','Glass does not decompose, but it can be recycled again and again.'],['Dry leaves','bio','Leaves rot into humus; ideal for a compost pit.'],['Aluminium can','non','Metal does not decompose; it is valuable for recycling.'],['Cotton cloth','bio','Cotton is a plant fibre and decomposes slowly.'],['Thermocol cup','non','Thermocol (polystyrene) is a plastic and persists for a very long time.'],['Tea leaves','bio','Used tea leaves are excellent compost.'],['Ballpoint pen refill','non','Plastic and ink chemicals do not break down.'],['Wooden ice-cream stick','bio','Wood decomposes, though slowly.'],['Chips packet','non','Multi-layer plastic and foil packaging does not decompose and is hard to recycle.']];
let wq=[],wi=0,wscore=0,wdone=0,wbins={bio:[],non:[]};
function wNew(){wq=shuf(WASTE.slice());wi=0;wscore=0;wdone=0;wbins={bio:[],non:[]};wDraw()}
function wDraw(){const it=wq[wi];$('#wItem').textContent=it?`Where does this go? ${it[0]}`:`Done! You scored ${wscore} of ${WASTE.length}.`;
  $$('[data-bin]').forEach(b=>b.disabled=!it);$('#wScore').textContent=wdone?`Score: ${wscore} of ${wdone}`:'';
  let s='';[['bio',40,'#4f9a3c','Biodegradable'],['non',230,'#2a62c9','Non-biodegradable']].forEach(([k,x,c,n])=>{s+=`<path d="M${x} 70 h150 l-14 170 h-122 z" fill="${c}"/>`+T(x+75,60,n,'font-size="14" font-weight="700"');wbins[k].slice(-6).forEach((t,i)=>s+=`<text x="${x+75}" y="${100+i*22}" text-anchor="middle" font-size="12" fill="#fff" font-family="Source Sans 3,sans-serif">${esc(t)}</text>`)});
  $('#wBins').innerHTML=s}
/* ---------- ozone ---------- */
let cfc=0;
function ozDraw(){const thin=cfc/100,th=34*(1-0.75*thin),uv=Math.round(5+70*thin);let s=`<rect x="0" y="0" width="600" height="360" fill="#0f2a4a" opacity=".12"/>`+sunG(70,50,26);
  s+=`<rect x="0" y="${130-th/2}" width="600" height="${th}" fill="#8fd0ff" opacity=".75"/>`+`<text x="12" y="${130+th/2+18}" font-size="13" fill="currentColor" font-family="Source Sans 3,sans-serif">ozone layer</text>`;
  const n=8;for(let i=0;i<n;i++){const x=150+i*55,pass=i<Math.round(n*(0.1+0.75*thin));s+=`<line x1="${x-70}" y1="40" x2="${x}" y2="${pass?300:126}" stroke="#8a3fc6" stroke-width="3" stroke-dasharray="7 4"/>`+(pass?`<circle cx="${x}" cy="302" r="5" fill="#8a3fc6"/>`:'')}
  s+=`<rect x="0" y="300" width="600" height="60" fill="${LEAF}" opacity=".55"/>`+T(300,340,'UV reaching the ground: '+uv+'% (relative)','font-weight="700"');
  for(let i=0;i<Math.round(cfc/12);i++)s+=chip(60+i*64,215,'CFC','#f3d6d6',50);
  $('#oz').innerHTML=s;$('#ozOut').textContent=cfc===0?'With no CFCs, the ozone layer absorbs most of the UV radiation.':cfc<40?'CFCs are starting to break ozone down. A little more UV reaches the ground.':'Heavy CFC use thins the layer sharply: much more UV gets through, raising the risk of skin cancer and harming crops and plankton.'}
let tool='chain';
function labInit(){}
function labShow(){if(tool==='chain'){if(!chainOrder.length)chainNew();else pyrDraw()}else if(tool==='waste'){if(!wq.length)wNew();else wDraw()}else ozDraw()}
function labClick(b){
  if(b.dataset.tool){tool=b.dataset.tool;$$('[data-tool]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.tool===tool));['chain','waste','ozone'].forEach(t=>$('#t-'+t).hidden=t!==tool);labShow()}
  else if(b.dataset.org){if(picked.length<CHAINS[chainSel].length){picked.push(b.dataset.org);chainDraw()}}
  else if(b.id==='chainReset')chainNew();
  else if(b.dataset.bin){const it=wq[wi];if(!it)return true;const ok=b.dataset.bin===it[1];wdone++;if(ok)wscore++;wbins[b.dataset.bin].push(it[0]);$('#wFb').innerHTML=`<p class="fb ${ok?'ok':'no'}">${ok?'Correct.':'Not quite: it belongs in the '+(it[1]==='bio'?'biodegradable':'non-biodegradable')+' bin.'} ${esc(it[2])}</p>`;wi++;wDraw();if(wi>=wq.length)$('#wFb').innerHTML+=`<button class="btn" id="wAgain">Play again</button>`}
  else if(b.id==='wAgain'){$('#wFb').innerHTML='';wNew()}
  else if(b.id==='ozAgree'){const step=()=>{if(cfc>0){cfc=Math.max(0,cfc-5);$('#cfc').value=cfc;ozDraw();setTimeout(step,120)}else{$('#ozOut').textContent='After the 1987 agreement froze CFC production, and later phase-outs, CFC levels fell and the ozone layer has begun to recover slowly.'}};step()}
  else return false;return true}
function labChange(t){if(t.id==='chainSel'){chainSel=+t.value;chainNew();return true}if(t.id==='sun'||t.id==='pest'){pyrDraw();return true}if(t.id==='cfc'){cfc=+t.value;ozDraw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
