/* Rai Plus content pack: Class 6 Science (Curiosity), Chapter 3 – Mindful Eating: A Path to a Healthy Body. Bilingual terms. */
RP.register({key:'6sci03',cls:'6',subject:'Science',ch:'3',title:"Mindful Eating: A Path to a Healthy Body",color:'#a3471b',
crumb:"Class 6 Science · Curiosity · सचेत भोजन",h1:"Chapter 3: Mindful Eating: A Path to a Healthy Body",sub:"What our food contains, how to test for it, and how to eat a balanced diet.",heroLabel:"A thali with roti, dal, rice, vegetables and curd",labName:'Thali builder lab',
theme:"\n:root{--g:light-dark(#a3471b,#f0a37a);--g2:light-dark(#fbefe8,#22120a);--line:light-dark(#f0d6c6,#4a2a1a);--bg:light-dark(#ffffff,#130b07);--card:light-dark(#ffffff,#1b100a);\n--ink:light-dark(#22120a,#f6e8df);--mute:light-dark(#6e5242,#cdb0a0);--y:light-dark(#2e6fb5,#85b7eb);--y2:light-dark(#e6f1fb,#0c1e33);--hd:#7a3311}\n",
labHTML:`  <h2>Thali builder · थाली बनाएँ</h2>
  <p>Add foods to your thali. The bars show which nutrients your meal provides. Try to fill every bar without overdoing fats and sugar.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="tSvg" viewBox="0 0 460 320" role="img" aria-label="Thali and nutrient bars" style="color:var(--ink)"></svg></div></div>
  <div><div id="tBtns" class="ctrl" style="flex-wrap:wrap"></div><div class="box y" id="tOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#a3471b',LABNAME='Thali builder lab',MIND_CENTER='Food · भोजन';
const OR='#a3471b',GN='#3b6d11',BL='#2e6fb5',YL='#e0a02a',PU='#7f77dd',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
function thali(cx,cy,r,items){let s=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#d9d4c7" stroke="${GR}" stroke-width="3"/>`;items.forEach((c,i)=>{const a=i*2*Math.PI/Math.max(items.length,1),d=items.length>1?r*0.55:0;s+=`<circle cx="${cx+d*Math.cos(a)}" cy="${cy+d*Math.sin(a)}" r="${r*0.28}" fill="${c}" stroke="#fff" stroke-width="2"/>`});return s}
function heroDraw(){return `<circle cx="80" cy="70" r="45" fill="#fff" opacity=".85"/><circle cx="65" cy="55" r="12" fill="#f2c94c"/><circle cx="95" cy="60" r="12" fill="#c9a227"/><circle cx="80" cy="90" r="12" fill="#97c459"/>`}
const HERO=heroDraw;
const MIND=[['Food across India',100,50],['Changing food habits',420,50],['Nutrients in food',90,150],['Testing food',430,150],['Balanced diet',110,250],['Deficiency diseases & junk food',410,250]];

const C=[
{id:'f1',num:'3.1',title:'Food diversity across India · भोजन की विविधता',
 intro:'Makki di roti in Punjab, idli in Karnataka, eromba in Manipur. Why do people in different places eat different food?',
 obj:'Explain how local crops, climate and culture shape regional food, and how food habits change over time.',
 prior:'Food you eat at home.',
 simple:'What people eat depends on the crops that grow nearby, the climate, and their culture and traditions. Punjab grows wheat, maize and chickpea (makki di roti, chhole, lassi). Karnataka grows rice, ragi, urad and coconut (idli, dosa, sambhar). Manipur grows rice, bamboo and soybean (eromba, kangsoi).',
 detail:'Food habits also change over time. Cooking has moved from chulhas to gas stoves; better transport, technology and communication bring foods and recipes from other regions to our homes. Talking to grandparents about what they ate as children shows how food has changed. Traditional foods are often rich in nutrients made from local, seasonal ingredients.',
 real:'In Haryana, bajra roti, kadhi, saag and lassi are traditional foods suited to local crops and climate.',
 apply:'Ask an elder what they ate as a child. List two foods that are eaten less now and two new foods.',
 see:{w:520,h:220,f:[
  ['Punjab: wheat, maize → makki di roti, lassi.',thali(90,100,60,['#f2c94c','#e8d4a0','#fff'])+lbl(90,190,'Punjab')],
  ['Karnataka: rice, ragi, coconut → idli, dosa, sambhar.',thali(260,100,60,['#fff','#c9a27a','#e0a02a'])+lbl(260,190,'Karnataka')],
  ['Manipur: rice, bamboo, soybean → eromba, kangsoi.',thali(430,100,60,['#fff','#97c459','#7a5a2a'])+lbl(430,190,'Manipur')]]},
 seeNote:'Examples from the textbook.',
 do:{title:'Family food interview',mat:'Notebook',steps:['Interview a grandparent about their childhood meals.','Note cooking methods and ingredients.','Compare with today.'],obs:'Food habits have changed.',why:'Technology, transport, communication.',lab:false},
 memo:'"Local crops, local plates."',
 miscon:['"Everyone in India eats the same food." Food varies widely by region.'],
 terms:['Food diversity · भोजन विविधता','Cuisine · व्यंजन','Food habits · खान-पान की आदतें'],
 q:{q:'Idli and dosa are traditional to:',o:['Punjab','Karnataka','Manipur','Rajasthan'],a:1,why:'Rice and urad region.'},
 exam:'Factors affecting food habits: 2 marks.'},

{id:'f2',num:'3.2',title:'Nutrients in our food · भोजन के पोषक तत्व',
 intro:'Why do we feel tired if we skip breakfast?',
 obj:'Name the components of food and their functions and sources.',
 prior:'Food diversity (3.1).',
 simple:'Food contains nutrients (पोषक तत्व). Carbohydrates (कार्बोहाइड्रेट) and fats (वसा) give energy; proteins (प्रोटीन) help growth and repair; vitamins (विटामिन) and minerals (खनिज) keep us healthy and are needed in small amounts. Food also has dietary fibre (रुक्षांश) and water.',
 detail:'Carbohydrates: main energy source — cereals (wheat, rice, millets), potato, fruits. Fats: stored energy; help absorb some vitamins; ghee, oils, nuts, milk; eat in moderation. Proteins: body-building — pulses, beans, milk, paneer, eggs, fish, meat. Vitamins and minerals: e.g. vitamin C from amla and citrus fruits; iron from green leafy vegetables and jaggery; calcium from milk. Dietary fibre (roughage) is not digested but helps food move through the gut and prevents constipation: whole grains, fruits, vegetables, pulses. Water helps absorb nutrients, removes wastes and keeps body temperature steady.',
 real:'Dal–chawal with sabzi and curd combines carbohydrate, protein, vitamins, minerals and fibre in one meal.',
 apply:'For each item in your lunch, name its main nutrient.',
 see:{w:520,h:240,f:[
  ['Energy: carbohydrates and fats.',`<rect x="30" y="60" width="140" height="40" rx="8" fill="${YL}" opacity=".85"/>`+lbl(100,85,'carbohydrates')+`<rect x="30" y="110" width="140" height="40" rx="8" fill="#f2c94c" opacity=".85"/>`+lbl(100,135,'fats')],
  ['Growth: proteins. Protection: vitamins and minerals.',`<rect x="190" y="60" width="140" height="40" rx="8" fill="${OR}" opacity=".85"/>`+lbl(260,85,'proteins','fill="#fff"')+`<rect x="190" y="110" width="140" height="40" rx="8" fill="${GN}" opacity=".85"/>`+lbl(260,135,'vitamins, minerals','fill="#fff"')],
  ['Also needed: fibre and water.',`<rect x="350" y="60" width="140" height="40" rx="8" fill="#7a5a2a" opacity=".85"/>`+lbl(420,85,'fibre','fill="#fff"')+`<rect x="350" y="110" width="140" height="40" rx="8" fill="${BL}" opacity=".85"/>`+lbl(420,135,'water','fill="#fff"')+lbl(260,200,'energy · growth · protection','font-weight="700"')]]},
 seeNote:'Most foods contain more than one nutrient.',
 do:{title:'Food label check',mat:'Packed food labels',steps:['Read the nutrition table on 3 packets.','Note carbohydrate, protein, fat and sugar per 100 g.'],obs:'Different foods have very different amounts.',why:'Labels show nutrients.',lab:false},
 memo:'"Carbs and fats for fuel, proteins to build, vitamins and minerals to protect."',
 miscon:['"Fat is always bad." Some fat is needed; excess is harmful.','"Fibre is useless because it is not digested." It keeps digestion healthy.'],
 terms:['Nutrient · पोषक तत्व','Carbohydrate · कार्बोहाइड्रेट','Protein · प्रोटीन','Fat · वसा','Vitamin · विटामिन','Mineral · खनिज','Dietary fibre · रुक्षांश'],
 q:{q:'Body-building foods are rich in:',o:['carbohydrates','proteins','fats','fibre'],a:1,why:'Growth and repair.'},
 exam:'Functions and sources of nutrients: 2–3 marks.'},

{id:'f3',num:'3.3',title:'Testing food for nutrients · भोजन का परीक्षण',
 intro:'How can you find out, with a few drops, whether a food has starch?',
 obj:'Perform simple tests for starch, fat and protein.',
 prior:'Nutrients (3.2).',
 simple:'Starch test: add a few drops of dilute iodine solution; a blue-black colour shows starch. Fat test: rub the food on paper; an oily (translucent) patch shows fat. Protein test: add copper sulphate solution and then sodium hydroxide (caustic soda) solution; a violet colour shows protein.',
 detail:'Carry out tests on small amounts of food; mash solids with a little water first. Results: potato, rice and wheat flour give blue-black with iodine; groundnut, butter and coconut leave an oily patch; boiled egg white, milk and soaked moong give violet. Sodium hydroxide is corrosive: the protein test should be done or supervised by the teacher, using gloves and goggles.',
 real:'Food inspectors use similar chemical tests (on a larger scale) to check food quality.',
 apply:'A food turns blue-black with iodine and leaves an oily patch. What two nutrients does it contain?',
 see:{w:520,h:240,f:[
  ['Starch + iodine → blue-black.',`<path d="M60 60 v120 a25 25 0 0 0 50 0 v-120" fill="none" stroke="${ink}" stroke-width="2"/><path d="M62 130 v50 a23 23 0 0 0 46 0 v-50z" fill="#1f2a5a"/>`+lbl(85,225,'starch')],
  ['Fat → oily patch on paper.',`<rect x="200" y="70" width="110" height="110" fill="#fafaf6" stroke="${GR}"/><ellipse cx="255" cy="125" rx="28" ry="20" fill="#f2e6a0" opacity=".7"/>`+lbl(255,225,'fat')],
  ['Protein + copper sulphate + caustic soda → violet.',`<path d="M400 60 v120 a25 25 0 0 0 50 0 v-120" fill="none" stroke="${ink}" stroke-width="2"/><path d="M402 130 v50 a23 23 0 0 0 46 0 v-50z" fill="#7d3c98"/>`+lbl(425,225,'protein')]]},
 seeNote:'Protein test with teacher supervision.',
 do:{title:'Starch hunt',mat:'Dilute iodine, dropper, potato, rice, bread, cucumber, milk',steps:['Put small pieces on a plate.','Add 2 drops of iodine to each.','Record the colour.'],obs:'Potato, rice and bread turn blue-black.',why:'They contain starch.',lab:true},
 memo:'"Iodine blue-black = starch; oily paper = fat; violet = protein."',
 miscon:['"Blue-black means sugar." It shows starch.','"Any oily patch means the food was fried." It shows fat in the food.'],
 terms:['Iodine test','Starch · मंड','Translucent · पारभासी','Copper sulphate · कॉपर सल्फेट','Caustic soda · कॉस्टिक सोडा'],
 q:{q:'Iodine turns a food blue-black. It contains:',o:['protein','fat','starch','vitamin C'],a:2,why:'Starch test.'},
 exam:'Describe a test for starch/fat/protein: 2 marks.'},

{id:'f4',num:'3.4',title:'Balanced diet and millets · संतुलित आहार',
 intro:'Is a plate full of only rice enough for a growing child?',
 obj:'Define a balanced diet and appreciate millets as nutritious grains.',
 prior:'Nutrients (3.2).',
 simple:'A balanced diet (संतुलित आहार) contains all the nutrients in the right amounts, along with roughage and water. It helps us grow, stay active and resist disease. Millets such as jowar, bajra and ragi are nutritious grains, rich in minerals, vitamins and fibre.',
 detail:'The right amount of food depends on age, gender, activity and health: a growing child or a farmer doing heavy work needs more energy than someone resting. Eating a variety of foods — cereals or millets, pulses, vegetables, fruits, milk products — usually gives a balanced diet. Millets grow with little water and were celebrated in the International Year of Millets (2023); they are also called "Shree Anna" in India. Mindful eating means eating slowly, recognising when we are full and choosing healthy foods.',
 real:'Bajra roti with green leafy saag and buttermilk is a traditional balanced winter meal in Haryana.',
 apply:'Plan a balanced lunch using foods available at home.',
 see:{w:520,h:220,f:[
  ['A thali with cereal, dal, vegetable, curd and salad.',thali(130,110,85,[YL,OR,GN,'#fff','#97c459'])],
  ['All nutrients in suitable amounts + fibre + water.',lbl(360,90,'balanced diet · संतुलित आहार','font-weight="700"')+lbl(360,120,'millets: jowar, bajra, ragi','font-size="12"')+lbl(360,145,'eat slowly; stop when full','font-size="12"')]]},
 seeNote:'Variety is the key.',
 do:{title:'My meal diary',mat:'Notebook',steps:['Record everything you eat for 3 days.','Mark which nutrients each meal gives.','Find what is missing.'],obs:'Most days some group is low.',why:'Balanced diet needs variety.',lab:true},
 memo:'"Variety on the plate = balance in the body."',
 miscon:['"Eating more means eating healthy." Balance matters more than quantity.','"Millets are poor people\'s food." They are highly nutritious.'],
 terms:['Balanced diet · संतुलित आहार','Millets · मोटा अनाज/श्री अन्न','Mindful eating · सचेत भोजन'],
 q:{q:'Which is a millet?',o:['wheat','bajra','rice','maize'],a:1,why:'Pearl millet.'},
 exam:'Define balanced diet; why millets are good: 2 marks.'},

{id:'f5',num:'3.5',title:'Deficiency diseases and junk food · कमी से होने वाले रोग',
 intro:'Why did sailors on long voyages get bleeding gums?',
 obj:'Link deficiency diseases to missing nutrients and explain why junk food should be limited.',
 prior:'Nutrients (3.2).',
 simple:'Diseases caused by the lack of a nutrient over a long time are deficiency diseases (अपूर्णता रोग). Vitamin A: night blindness. Vitamin B1: beriberi. Vitamin C: scurvy (bleeding gums). Vitamin D: rickets (soft, bent bones). Calcium: weak bones and teeth. Iodine: goitre (swollen neck gland). Iron: anaemia (tiredness, pale skin).',
 detail:'Deficiency diseases can be prevented by a balanced diet. Sailors once got scurvy because they had no fresh fruit; amla, oranges and lemons provide vitamin C. Iodised salt prevents goitre. Sunlight helps the body make vitamin D. Junk food (chips, sugary drinks, fried snacks) is high in fat, sugar and salt but low in other nutrients; eating it often can cause weight gain and health problems, so it should be eaten rarely and in small amounts.',
 real:'Iodised salt is used across India to prevent goitre.',
 apply:'A child has difficulty seeing in dim light. Which nutrient might be missing, and which foods help?',
 see:{w:520,h:240,f:[
  ['Vitamin A → night blindness; C → scurvy.',lbl(130,60,'Vitamin A → night blindness')+lbl(130,90,'Vitamin B1 → beriberi')+lbl(130,120,'Vitamin C → scurvy')],
  ['Vitamin D → rickets; iodine → goitre; iron → anaemia.',lbl(390,60,'Vitamin D → rickets')+lbl(390,90,'Iodine → goitre')+lbl(390,120,'Iron → anaemia')],
  ['Junk food: high fat, sugar, salt; low in other nutrients.',`<rect x="160" y="160" width="200" height="50" rx="10" fill="${OR}" opacity=".2" stroke="${OR}"/>`+lbl(260,190,'junk food: eat rarely','font-weight="700"')]]},
 seeNote:'Prevented by a balanced diet.',
 do:{title:'Poster',mat:'Chart paper, colours',steps:['Pick one deficiency disease.','Draw its cause, symptoms and foods that prevent it.'],obs:'Prevention is simple with the right food.',why:'Deficiency diseases come from missing nutrients.',lab:false},
 memo:'"A–Night, B1–Beriberi, C–sCurvy, D–rickets, Iodine–goitre, Iron–anaemia."',
 miscon:['"Deficiency diseases are infectious." They are not caught from others.','"Junk food gives instant energy, so it is healthy." It lacks most nutrients.'],
 terms:['Deficiency disease · अपूर्णता रोग','Night blindness · रतौंधी','Scurvy · स्कर्वी','Rickets · रिकेट्स','Goitre · घेंघा','Anaemia · रक्ताल्पता'],
 q:{q:'Lack of iodine causes:',o:['scurvy','goitre','rickets','beriberi'],a:1,why:'Thyroid gland swells.'},
 exam:'Match deficiency diseases with nutrients: 2–3 marks.'}
];

const CARDS=[['Food diversity','Local crops, climate and culture shape regional food.'],['Carbohydrates','Energy: cereals, millets, potato.'],['Fats','Energy store: ghee, oil, nuts (moderation).'],['Proteins','Growth and repair: pulses, milk, eggs.'],['Vitamins & minerals','Protection; small amounts: amla, greens, milk.'],['Fibre & water','Digestion; transport of nutrients, removing waste.'],['Starch test','Iodine → blue-black.'],['Fat test','Oily patch on paper.'],['Protein test','Copper sulphate + caustic soda → violet.'],['Balanced diet','All nutrients in right amounts + fibre + water.'],['Deficiency diseases','A night blindness; B1 beriberi; C scurvy; D rickets; iodine goitre; iron anaemia.'],['Junk food','High fat, sugar, salt; low nutrients.']];

const Q=[
 {lv:1,q:'Which nutrient gives the most energy-quick fuel from cereals?',o:['carbohydrate','protein','vitamin','mineral'],a:0,w:'Cereals are rich in carbohydrates.'},
 {lv:1,q:'Iodine turns starch:',o:['red','blue-black','violet','yellow'],a:1,w:'Starch test.'},
 {lv:1,q:'Scurvy is caused by lack of:',o:['vitamin A','vitamin C','vitamin D','iron'],a:1,w:'Bleeding gums.'},
 {lv:2,q:'An oily patch on paper shows:',o:['starch','fat','protein','water'],a:1,w:'Fat test.'},
 {lv:2,q:'Dietary fibre helps in:',o:['growth','digestion and preventing constipation','energy','seeing in dim light'],a:1,w:'Roughage.'},
 {lv:2,q:'Rickets is due to lack of:',o:['vitamin D/calcium','vitamin B1','iodine','iron'],a:0,w:'Soft bones.'},
 {lv:3,q:'A food gives violet colour with copper sulphate and caustic soda. It has:',o:['starch','protein','fat','sugar only'],a:1,w:'Protein test.'},
 {lv:3,q:'Which meal is closest to balanced?',o:['chips and cola','rice only','roti, dal, sabzi, curd and salad','sweets'],a:2,w:'All groups.'},
 {lv:4,q:'Why are millets called nutritious?',o:['they are sweet','rich in minerals, vitamins and fibre','they are expensive','they have no fat'],a:1,w:'NCERT point.'},
 {lv:4,q:'Iodised salt is used to prevent:',o:['anaemia','goitre','beriberi','night blindness'],a:1,w:'Iodine.'},
 {lv:5,open:true,m:3,q:'Describe how you would test a food sample for starch and for fat.',ans:['Starch: add a few drops of dilute iodine; blue-black shows starch (1)','Fat: rub on paper; oily/translucent patch shows fat (1)','Use small samples; record observations (1)']},
 {lv:5,open:true,m:3,q:'What is a balanced diet? Why should junk food be limited?',ans:['All nutrients in right amounts + fibre + water (1)','Junk food: high fat, sugar, salt; low in other nutrients (1)','Leads to weight gain and health problems if eaten often (1)']}
];

const ONEMIN=['Food varies by region: local crops, climate, culture.','Carbs and fats: energy; proteins: growth; vitamins and minerals: protection.','Fibre and water are also needed.','Iodine → blue-black (starch); oily patch (fat); violet (protein).','Balanced diet: all nutrients in right amounts.','Millets (jowar, bajra, ragi) are nutritious.','Deficiency: A night blindness, B1 beriberi, C scurvy, D rickets, iodine goitre, iron anaemia.','Junk food: limit it.'];
const KEYS=[['carbohydrates',/carbo/i],['proteins',/protein|प्रोटीन/i],['fats',/fat|वसा/i],['vitamins & minerals',/vitamin|mineral/i],['fibre & water',/fibre|fiber|roughage|water/i],['starch test',/iodine|blue.?black|starch/i],['balanced diet',/balanced|संतुलित/i],['millets',/millet|bajra|ragi|jowar/i],['deficiency diseases',/scurvy|rickets|goitre|anaemia|night blind|beriberi/i],['junk food',/junk/i]];

/* ---------- lab ---------- */
const FOODS=[['Roti',YL,{c:3,p:1,f:0,v:0,fi:1}],['Rice',YL,{c:3,p:0,f:0,v:0,fi:0}],['Bajra roti','#c9a27a',{c:3,p:1,f:0,v:1,fi:2}],['Dal',OR,{c:1,p:3,f:0,v:1,fi:1}],['Paneer','#fff',{c:0,p:3,f:2,v:0,fi:0}],['Green sabzi',GN,{c:1,p:0,f:0,v:3,fi:2}],['Curd','#f5f2ea',{c:1,p:2,f:1,v:1,fi:0}],['Salad','#97c459',{c:0,p:0,f:0,v:2,fi:2}],['Fruit (amla/orange)','#f2994a',{c:1,p:0,f:0,v:3,fi:1}],['Ghee (1 spoon)','#f2c94c',{c:0,p:0,f:2,v:0,fi:0}],['Chips','#e0a02a',{c:2,p:0,f:3,v:0,fi:0,j:1}],['Cola','#4a2a1a',{c:3,p:0,f:0,v:0,fi:0,j:1}]];
let plate=[];
function draw(){const tot={c:0,p:0,f:0,v:0,fi:0,j:0};plate.forEach(i=>{const n=FOODS[i][2];for(const k in n)tot[k]+=n[k]});
 let s=thali(110,160,100,plate.slice(0,8).map(i=>FOODS[i][1]));
 const bars=[['Carbohydrates','c',YL,6],['Proteins','p',OR,5],['Fats','f','#f2c94c',3],['Vitamins & minerals','v',GN,6],['Fibre','fi','#7a5a2a',5]];
 bars.forEach(([n,k,c,target],i)=>{const y=40+i*50,w=Math.min(1.6,tot[k]/target)*120;s+=T(300,y-6,n,'font-size="12" text-anchor="start"')+`<rect x="300" y="${y}" width="150" height="16" fill="none" stroke="${GR}"/><rect x="300" y="${y}" width="${Math.min(150,w)}" height="16" fill="${c}" opacity=".85"/><line x1="420" y1="${y-2}" x2="420" y2="${y+18}" stroke="${ink}" stroke-dasharray="3 2"/>`});
 $('#tSvg').innerHTML=s;
 const low=bars.filter(([,k,,t])=>tot[k]<t*0.7).map(b=>b[0]),high=tot.f>4?['Fats']:[];
 $('#tOut').innerHTML=`<p>On your thali: ${plate.length?plate.map(i=>FOODS[i][0]).join(', '):'nothing yet'}</p>${plate.length?`<p>${low.length?'Low in: <b>'+low.join(', ')+'</b>.':'All nutrient groups covered!'}${high.length?' Too much <b>fat</b>.':''}${tot.j?' Junk items add fat/sugar but few nutrients.':''}</p>`:''}<p class="note">Dashed line = a good amount for one meal (illustrative).</p>`;
 $('#tBtns').innerHTML=FOODS.map((f,i)=>`<button class="btn" data-food="${i}">${f[0]}</button>`).join('')+'<button class="btn" id="tClr">Clear</button>'}
function labShow(){draw()}
function labInit(){}
function labClick(b){if(b.dataset.food!==undefined){if(plate.length<10)plate.push(+b.dataset.food);draw();return true}if(b.id==='tClr'){plate=[];draw();return true}return false}
function labChange(){return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
