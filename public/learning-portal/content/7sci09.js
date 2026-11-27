/* Rai Plus content pack: Class 7 Science (Curiosity), Chapter 9 – Life Processes in Animals. Bilingual terms. */
RP.register({key:'7sci09',cls:'7',subject:'Science',ch:'9',title:"Life Processes in Animals",color:'#b03a2e',
crumb:"Class 7 Science · Curiosity · जंतुओं में जैव प्रक्रम",h1:"Chapter 9: Life Processes in Animals",sub:"जंतुओं में जैव प्रक्रम. Digestion from mouth to large intestine, digestion in other animals, breathing and respiration.",heroLabel:"An outline of the human digestive system and lungs",labName:'Body journey lab',
theme:"\n:root{--g:light-dark(#b03a2e,#f2a59c);--g2:light-dark(#fbecea,#220c0a);--line:light-dark(#f1d0cb,#4a2420);--bg:light-dark(#ffffff,#130807);--card:light-dark(#ffffff,#1b0d0b);\n--ink:light-dark(#240e0b,#f6e5e2);--mute:light-dark(#6e4c47,#cdaba6);--y:light-dark(#2f6f8a,#8cc3da);--y2:light-dark(#e6f2f7,#0c1d25);--hd:#842a20}\n",
labHTML:`  <h2>Body journey lab · शरीर यात्रा</h2>
  <p><b>Digestion:</b> follow a bite of food step by step and see what is digested where. <b>Breathing:</b> move the diaphragm and see how activity changes breathing rate.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="bSvg" viewBox="0 0 460 340" role="img" aria-label="Digestive system or lungs" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="bMode"><option value="dig">Journey of food</option><option value="br">Breathing</option></select></label></div>
  <div class="ctrl"><label>Food<select id="bFood"><option value="roti">Roti (starch)</option><option value="dal">Dal (protein)</option><option value="ghee">Ghee (fat)</option><option value="thali">Full thali</option></select></label> <button class="btn" id="bNext">Next step →</button> <button class="btn" id="bRestart">Restart</button></div>
  <div class="ctrl"><label>Diaphragm: <b id="bDv"></b><input type="range" id="bD" min="0" max="100" value="0"></label></div>
  <div class="ctrl"><label>Activity<select id="bAct"><option value="rest">Resting</option><option value="walk">Walking</option><option value="run">Running</option></select></label></div>
  <div class="box y" id="bOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#b03a2e',LABNAME='Body journey lab',MIND_CENTER='Life processes · जैव प्रक्रम';
const RD='#b03a2e',PK='#e8a0a0',OR='#d9822b',BL='#2f6f8a',GN='#3b8a3b',YE='#e5c43a',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
// organ geometry (shared)
const ORG={mouth:[230,30],pipe:[230,90],stom:[260,150],liver:[180,140],small:[230,225],large:[230,225],anus:[230,320]};
function gut(hi){const c=k=>hi===k?RD:PK,o=k=>hi===k?1:.55;return `<ellipse cx="230" cy="28" rx="34" ry="14" fill="${c('mouth')}" opacity="${o('mouth')}"/><rect x="224" y="40" width="12" height="80" rx="5" fill="${c('pipe')}" opacity="${o('pipe')}"/><path d="M234 118 q60 -10 64 30 q4 42 -50 40 q-30 -2 -24 -30z" fill="${c('stom')}" opacity="${o('stom')}"/><path d="M150 120 q40 -20 70 10 q-10 30 -60 30 q-20 -10 -10 -40z" fill="${hi==='liver'?'#8e3b2a':'#c97b6b'}" opacity="${o('liver')}"/>`+
 `<path d="M175 200 h110 v100 h-110z" fill="none" stroke="${c('large')}" stroke-width="16" opacity="${o('large')}"/>`+
 `<path d="M200 215 q30 -10 60 0 q-30 15 -60 15 q30 10 60 10 q-30 15 -60 15 q30 10 60 10 q-30 12 -60 12" fill="none" stroke="${c('small')}" stroke-width="7" opacity="${o('small')}"/><rect x="225" y="300" width="10" height="26" fill="${c('anus')}" opacity="${o('anus')}"/>`}
function lungs(d){const ex=d/100;let s=`<rect x="223" y="20" width="14" height="60" rx="5" fill="#d9a59c"/>`;[-1,1].forEach(k=>{const cx=230+k*(62+ex*10);s+=`<ellipse cx="${cx}" cy="${150}" rx="${50+ex*10}" ry="${80+ex*12}" fill="${PK}" opacity=".8" stroke="${RD}"/><path d="M230 80 q${k*20} 20 ${k*40} 40" stroke="#c0756a" stroke-width="6" fill="none"/>`});
 const dy=250+ex*22;s+=`<path d="M120 ${dy} Q230 ${dy-50+ex*45} 340 ${dy}" stroke="${RD}" stroke-width="5" fill="none"/>`+T(360,dy+4,'diaphragm','font-size="12" text-anchor="start"');
 s+=`<path d="M110 70 Q90 160 110 270 M350 70 Q370 160 350 270" stroke="${GR}" stroke-width="3" fill="none"/>`+T(80,60,'ribs','font-size="11"');return s}
function heroDraw(){return `<ellipse cx="70" cy="30" rx="20" ry="9" fill="#fff"/><rect x="66" y="38" width="8" height="40" fill="#fff"/><path d="M72 76 q34 -6 36 18 q2 24 -28 22z" fill="#fff"/><ellipse cx="220" cy="70" rx="30" ry="45" fill="#fff" opacity=".8"/><ellipse cx="290" cy="70" rx="30" ry="45" fill="#fff" opacity=".8"/>`}
const HERO=heroDraw;
const MIND=[['Nutrition & digestion',100,50],['Mouth & food pipe',420,50],['Stomach & intestines',90,150],['Other animals',430,150],['Breathing',110,250],['Respiration in animals',410,250]];

const C=[
{id:'a1',num:'9.1',title:'Nutrition and digestion · पोषण और पाचन',
 intro:'You eat roti, dal and sabzi. How does your body turn them into energy and growth?',
 obj:'Describe the steps of nutrition and the parts of the digestive system.',
 prior:'Class 6: Mindful Eating (nutrients).',
 simple:'Animals cannot make their own food; they eat plants or other animals. Nutrition involves: ingestion (taking in food), digestion (breaking it into simple soluble substances), absorption (taking them into the blood), assimilation (using them in the body) and egestion (removing undigested waste). The digestive system (पाचन तंत्र) is a long tube — the alimentary canal: mouth → food pipe (oesophagus) → stomach → small intestine → large intestine → anus — with glands such as salivary glands, liver and pancreas.',
 detail:'Digestion breaks complex carbohydrates (starch) into simple sugars (glucose), proteins into amino acids, and fats into fatty acids and glycerol. Juices from glands contain enzymes that speed up these changes. The alimentary canal in adults is about 9 metres long.',
 real:'A sip of ORS gives simple sugar and salts that are absorbed quickly without digestion.',
 apply:'Put the steps in order: absorption, ingestion, egestion, digestion, assimilation.',
 see:{w:520,h:340,f:[
  ['The alimentary canal: mouth to anus.',gut(null)],
  ['Glands: salivary glands, liver, pancreas add juices.',lbl(110,140,'liver · यकृत')+lbl(360,150,'stomach · आमाशय','text-anchor="start"')],
  ['Ingestion → digestion → absorption → assimilation → egestion.',lbl(380,250,'small intestine','text-anchor="start"')+lbl(380,300,'large intestine','text-anchor="start"')]]},
 seeNote:'One long tube with helper glands.',
 do:{title:'Gut length',mat:'Thread, measuring tape',steps:['Cut a 9 m thread.','Coil it to fit in a shoebox.'],obs:'A long tube fits in a small space.',why:'Coiled intestines.',lab:false},
 memo:'"In, break, absorb, use, out."',
 miscon:['"Food is digested only in the stomach." Most digestion and absorption happen in the small intestine.'],
 terms:['Ingestion · अंतर्ग्रहण','Digestion · पाचन','Absorption · अवशोषण','Assimilation · स्वांगीकरण','Egestion · बहिष्करण','Alimentary canal · आहार नाल'],
 q:{q:'Breaking food into simple soluble substances is:',o:['ingestion','digestion','egestion','assimilation'],a:1,why:'Definition.'},
 exam:'Steps of nutrition: 3 marks.'},

{id:'a2',num:'9.2',title:'Mouth and food pipe · मुख और ग्रसिका',
 intro:'Chew a piece of plain roti for two minutes. Why does it start to taste sweet?',
 obj:'Describe the role of teeth, tongue and saliva, and movement in the food pipe.',
 prior:'9.1.',
 simple:'In the mouth (buccal cavity), teeth cut and grind food; the tongue mixes it with saliva and helps swallowing; it also tastes. Saliva (लार) from salivary glands starts digesting starch into sugar — that is why chewed roti tastes sweet. Swallowed food passes down the food pipe (oesophagus, ग्रसिका) by wave-like squeezing movements of its walls.',
 detail:'Teeth types: incisors (cutting), canines (tearing), premolars and molars (chewing and grinding). We get two sets: milk teeth and permanent teeth. Brush twice daily to prevent decay: bacteria on sugary food make acids. Starch test: iodine turns starch blue-black; rice water mixed with saliva after some time no longer turns blue-black.',
 real:'Dentists recommend brushing twice and rinsing after sweets.',
 apply:'Why should food be chewed well?',
 see:{w:520,h:220,f:[
  ['Teeth: incisors, canines, premolars, molars.',`<path d="M60 120 q100 -80 200 0" fill="none" stroke="${ink}" stroke-width="2"/>`+[0,1,2,3,4,5,6,7].map(k=>`<rect x="${78+k*22}" y="${102-Math.sin((k+0.5)/8*Math.PI)*40}" width="16" height="16" rx="4" fill="#fff" stroke="${ink}"/>`).join('')+lbl(160,150,'teeth · दाँत')],
  ['Saliva starts digesting starch.',lbl(400,80,'saliva: starch → sugar','font-weight="700"')],
  ['Food pipe pushes food down in waves.',`<rect x="380" y="110" width="20" height="100" rx="8" fill="${PK}"/><circle cx="390" cy="160" r="9" fill="${OR}"/>`+lbl(450,165,'oesophagus','text-anchor="start"')]]},
 seeNote:'Chew well; saliva starts digestion.',
 do:{title:'Saliva test (teacher)',mat:'Boiled rice water, dilute iodine, two test tubes',steps:['Add a little saliva to one tube; wait 30 minutes.','Add iodine to both.'],obs:'Tube with saliva doesn\'t turn blue-black.',why:'Starch digested.',lab:true},
 memo:'"Cut, tear, grind; saliva sweetens."',
 miscon:['"Swallowing is due to gravity alone." The food pipe walls push food.'],
 terms:['Incisor','Canine','Molar','Saliva · लार','Oesophagus · ग्रसिका'],
 q:{q:'Saliva digests:',o:['protein','fat','starch','water'],a:2,why:'Starch to sugar.'},
 exam:'Role of saliva; types of teeth: 3 marks.'},

{id:'a3',num:'9.3',title:'Stomach, intestines and absorption · आमाशय, आंत्र और अवशोषण',
 intro:'Where does your body actually take in the nutrients from food?',
 obj:'Describe digestion in the stomach and small intestine, absorption, and the large intestine.',
 prior:'9.2.',
 simple:'Stomach (आमाशय): a muscular bag; churns food; its walls release acid (kills germs) and digestive juices that start digesting proteins. Small intestine (क्षुद्रांत्र): receives bile from the liver (breaks fat into droplets) and juice from the pancreas; digestion is completed here. Digested food is absorbed through finger-like projections called villi (दीर्घरोम) into the blood. Large intestine (बृहदांत्र): absorbs water and salts; undigested waste is removed through the anus.',
 detail:'Mucus protects the stomach lining from its own acid. Villi increase the surface area for absorption. Fibre (roughage) from vegetables and whole grains helps the large intestine move waste. Diarrhoea causes loss of water and salts — ORS replaces them.',
 real:'ORS (oral rehydration solution) is used to treat diarrhoea — salt, sugar and clean water.',
 apply:'Why does the small intestine have villi?',
 see:{w:520,h:340,f:[
  ['Stomach: churning, acid, protein digestion begins.',gut('stom')],
  ['Small intestine: digestion completed; absorption by villi.',gut('small')+`<g transform="translate(380 200)">${[0,1,2,3].map(k=>`<path d="M${k*18} 40 v-30 a7 7 0 0 1 14 0 v30" fill="${PK}" stroke="${RD}"/>`).join('')}</g>`+lbl(415,260,'villi · दीर्घरोम')],
  ['Large intestine absorbs water; waste removed.',gut('large')]]},
 seeNote:'Absorption happens in the small intestine.',
 do:{title:'Surface area model',mat:'A flat cloth and a towel of the same size',steps:['Compare how much water each soaks up.'],obs:'Towel (with loops) soaks more.',why:'Villi increase surface area.',lab:false},
 memo:'"Stomach churns, small intestine absorbs, large intestine dries."',
 miscon:['"Bile digests fat by enzymes." Bile breaks fat into droplets; enzymes then digest it.'],
 terms:['Stomach · आमाशय','Bile · पित्त','Pancreas · अग्न्याशय','Villi · दीर्घरोम','Large intestine · बृहदांत्र'],
 q:{q:'Digested food is absorbed mainly in the:',o:['stomach','small intestine','large intestine','mouth'],a:1,why:'Villi.'},
 exam:'Functions of stomach, small and large intestine: 3 marks.'},

{id:'a4',num:'9.4',title:'Digestion in other animals · अन्य जंतुओं में पाचन',
 intro:'Why does a cow keep chewing even when it isn\'t eating?',
 obj:'Describe digestion in ruminants and simple animals.',
 prior:'9.1–9.3.',
 simple:'Cows, buffaloes, goats and camels are ruminants (रोमंथी). They swallow grass quickly; it goes to the first part of the stomach (rumen), where it is partly digested. Later, small lumps called cud come back to the mouth and are chewed again — this is rumination (जुगाली). Bacteria in their stomach help digest cellulose in grass, which humans cannot digest.',
 detail:'Amoeba (a single-celled organism) surrounds food with finger-like projections and digests it inside a food vacuole. Snakes swallow prey whole. Birds have a gizzard that grinds food with small stones. Animals\' teeth suit their food: herbivores have flat grinding teeth; carnivores have sharp canines.',
 real:'In Haryana villages, buffaloes sit chewing cud for hours after grazing.',
 apply:'Why can a cow digest grass but humans cannot?',
 see:{w:520,h:220,f:[
  ['Cow swallows grass quickly.',`<ellipse cx="120" cy="120" rx="70" ry="35" fill="#d8c6a8"/><circle cx="200" cy="100" r="22" fill="#d8c6a8"/>`+[0,1,2,3].map(k=>`<rect x="${70+k*25}" y="150" width="8" height="35" fill="#a68c64"/>`).join('')],
  ['Rumen: partial digestion by bacteria.',`<ellipse cx="110" cy="115" rx="26" ry="16" fill="${GN}" opacity=".5"/>`+lbl(110,80,'rumen')],
  ['Cud returns to the mouth: chewed again.',`<path d="M120 105 Q160 70 195 95" stroke="${OR}" stroke-width="3" fill="none"/>`+lbl(380,110,'rumination · जुगाली','font-weight="700"')]]},
 seeNote:'Bacteria help digest cellulose.',
 do:{title:'Watch a cow',mat:'Observation (from a safe distance)',steps:['Watch a resting cow or buffalo for 5 minutes.','Count chews per minute.'],obs:'Continuous chewing.',why:'Rumination.',lab:false},
 memo:'"Swallow now, chew later."',
 miscon:['"Cows have four stomachs." One stomach with four chambers.'],
 terms:['Ruminant · रोमंथी','Rumen','Cud · जुगाल','Rumination · जुगाली','Cellulose'],
 q:{q:'Cud is chewed by:',o:['lion','cow','snake','frog'],a:1,why:'Ruminant.'},
 exam:'Explain rumination: 2 marks.'},

{id:'a5',num:'9.5',title:'Breathing · श्वसन क्रिया',
 intro:'Put your hand on your chest and breathe deeply. What moves?',
 obj:'Explain inhalation and exhalation and breathing rate.',
 prior:'Class 6: living things breathe.',
 simple:'Breathing means taking in air rich in oxygen (inhalation, अंतःश्वसन) and giving out air rich in carbon dioxide (exhalation, उच्छ्वसन). Air enters through the nostrils, passes the windpipe (trachea) to the lungs (फेफड़े). When we inhale, the ribs move up and out and the diaphragm (a muscular sheet under the lungs) moves down: the chest gets bigger and air rushes in. When we exhale, they move back and air is pushed out.',
 detail:'Hairs and mucus in the nose trap dust; breathe through the nose. An adult at rest breathes about 12–20 times a minute; during exercise the rate increases because the body needs more energy. Sneezing removes irritants. Smoking damages the lungs.',
 real:'After a race on sports day, everyone breathes faster.',
 apply:'Why does your breathing rate increase after running?',
 see:{w:520,h:340,f:[
  ['Lungs at rest.',lungs(0)],
  ['Inhale: ribs up/out, diaphragm down: chest expands.',`<path d="M230 230 v40" stroke="${BL}" stroke-width="3"/><path d="M222 262 l8 10 l8 -10" fill="none" stroke="${BL}" stroke-width="3"/><path d="M95 160 h-30 M365 160 h30" stroke="${BL}" stroke-width="3"/>`+lbl(430,120,'inhale · अंतःश्वसन','text-anchor="start"')],
  ['Exhale: they return; air is pushed out.',lbl(430,160,'exhale · उच्छ्वसन','text-anchor="start"')]]},
 seeNote:'Bigger chest → air in.',
 do:{title:'Balloon lung model',mat:'Plastic bottle, balloons, rubber sheet, straw (with teacher)',steps:['Fix a balloon inside the bottle on a straw.','Pull the rubber sheet at the bottom down.'],obs:'Balloon inflates.',why:'Diaphragm model.',lab:true},
 memo:'"Diaphragm down, air in; diaphragm up, air out."',
 miscon:['"We breathe in only oxygen." We breathe in air, a mixture.'],
 terms:['Inhalation · अंतःश्वसन','Exhalation · उच्छ्वसन','Lungs · फेफड़े','Diaphragm · मध्यपट','Breathing rate'],
 q:{q:'During inhalation the diaphragm:',o:['moves up','moves down','stays still','disappears'],a:1,why:'Chest expands.'},
 exam:'Mechanism of breathing: 3 marks.'},

{id:'a6',num:'9.6',title:'Respiration in animals · जंतुओं में श्वसन',
 intro:'How does a fish breathe under water? How does an earthworm breathe?',
 obj:'Describe how different animals take in oxygen and show exhaled air contains CO₂.',
 prior:'9.5; Class 6 Ch 10.',
 simple:'In our cells, food (glucose) reacts with oxygen to release energy, producing carbon dioxide and water — this is respiration (श्वसन). Animals take in oxygen differently: fish use gills to take oxygen dissolved in water; earthworms breathe through moist skin; insects through tiny holes called spiracles connected to air tubes (tracheae); frogs through lungs and moist skin.',
 detail:'Glucose + oxygen → carbon dioxide + water + energy. Test: blow through a straw into lime water — it turns milky, showing exhaled air contains more carbon dioxide. Earthworms come out during heavy rain because the soil is flooded and they cannot get air.',
 real:'Aquarium pumps bubble air into water so fish get enough dissolved oxygen.',
 apply:'Why do earthworms come out of the soil after heavy rain?',
 see:{w:520,h:220,f:[
  ['Fish: gills.',`<path d="M40 110 q50 -40 110 0 q-60 40 -110 0z M150 110 l26 -18 v36z" fill="${BL}" opacity=".6"/><path d="M70 98 q-5 12 0 24" stroke="${RD}" stroke-width="4" fill="none"/>`+lbl(100,160,'gills · गलफड़े')],
  ['Earthworm: skin. Insect: spiracles.',`<path d="M210 120 q20 -20 40 0 t40 0" stroke="#c48a7a" stroke-width="9" fill="none" stroke-linecap="round"/>`+lbl(250,160,'skin')+`<ellipse cx="400" cy="115" rx="40" ry="14" fill="#7a5a3a"/>`+[0,1,2,3].map(k=>`<circle cx="${375+k*16}" cy="115" r="2.5" fill="#fff"/>`).join('')+lbl(400,160,'spiracles')],
  ['Exhaled air turns lime water milky (CO₂).',lbl(260,205,'glucose + oxygen → CO₂ + water + energy','font-weight="700"')]]},
 seeNote:'Respiration releases energy.',
 do:{title:'Lime water test',mat:'Lime water, straw, test tube (with teacher)',steps:['Blow gently through the straw into lime water.'],obs:'It turns milky.',why:'CO₂ in exhaled air.',lab:true},
 memo:'"Gills, skin, spiracles, lungs — all for oxygen."',
 miscon:['"Breathing and respiration are the same." Breathing moves air; respiration releases energy in cells.'],
 terms:['Respiration · श्वसन','Gills · गलफड़े','Spiracles · श्वास रंध्र','Lime water · चूने का पानी'],
 q:{q:'Insects breathe through:',o:['gills','spiracles','lungs','skin only'],a:1,why:'Air holes.'},
 exam:'Breathing organs in animals: 2 marks.'}
];

const CARDS=[['Steps of nutrition','Ingestion → digestion → absorption → assimilation → egestion.'],['Mouth','Teeth, tongue; saliva digests starch.'],['Oesophagus','Pushes food by waves.'],['Stomach','Churns; acid; protein digestion starts.'],['Small intestine','Bile, pancreatic juice; villi absorb.'],['Large intestine','Absorbs water; waste removed.'],['Ruminants','Rumen, cud, rumination; bacteria digest cellulose.'],['Breathing','Inhale: diaphragm down, ribs out.'],['Respiration','Glucose + O₂ → CO₂ + water + energy.'],['Other animals','Gills, skin, spiracles.'],['Lime water','Turns milky with CO₂.']];

const Q=[
 {lv:1,q:'Digestion of starch begins in the:',o:['stomach','mouth','small intestine','large intestine'],a:1,w:'Saliva.'},
 {lv:1,q:'Finger-like projections in the small intestine:',o:['villi','teeth','gills','spiracles'],a:0,w:'Villi.'},
 {lv:1,q:'Fish breathe through:',o:['lungs','gills','skin only','spiracles'],a:1,w:'Gills.'},
 {lv:2,q:'Bile is made by the:',o:['stomach','liver','pancreas','mouth'],a:1,w:'Liver.'},
 {lv:2,q:'Water is absorbed mainly in the:',o:['large intestine','mouth','oesophagus','stomach'],a:0,w:'Large intestine.'},
 {lv:2,q:'Exhaled air turns lime water:',o:['blue','milky','red','clear'],a:1,w:'CO₂.'},
 {lv:3,q:'During exhalation, the diaphragm:',o:['moves down','moves up','stays','disappears'],a:1,w:'Chest shrinks.'},
 {lv:3,q:'Grass is digested by cows with the help of:',o:['saliva only','bacteria in the rumen','bile','teeth only'],a:1,w:'Cellulose-digesting bacteria.'},
 {lv:4,q:'Breathing rate increases during exercise because:',o:['air is hot','body needs more energy/oxygen','lungs shrink','less CO₂'],a:1,w:'More respiration.'},
 {lv:4,q:'Earthworms come out after heavy rain because:',o:['they like water','soil is flooded and they can\'t get air','to eat leaves','to see light'],a:1,w:'Skin breathing.'},
 {lv:5,open:true,m:4,q:'Trace the path of a bite of roti through the alimentary canal, naming what happens at each stage.',ans:['Mouth: chewing, saliva digests starch (1)','Oesophagus → stomach: churning, acid (1)','Small intestine: digestion completed; absorption by villi (1)','Large intestine: water absorbed; waste egested (1)']},
 {lv:5,open:true,m:3,q:'Explain the mechanism of breathing.',ans:['Inhalation: ribs up/out, diaphragm down (1)','Chest volume increases; air enters lungs (1)','Exhalation: reverse; air pushed out (1)']}
];

const ONEMIN=['Nutrition: ingestion → egestion.','Mouth: teeth, saliva (starch).','Stomach: acid; small intestine: completes digestion, villi absorb.','Large intestine: water; waste out.','Ruminants chew cud.','Breathing: diaphragm; respiration releases energy; gills, skin, spiracles.'];
const KEYS=[['steps',/ingest|digest|absor|egest/i],['saliva',/saliva|लार/i],['stomach',/stomach|आमाशय/i],['villi',/villi|small intestine/i],['ruminant',/rumin|cud|जुगाली/i],['breathing',/diaphragm|inhal|exhal/i],['respiration',/respirat|gill|spiracle/i]];

/* ---------- lab ---------- */
const STEPS=[['mouth','Mouth · मुख','Teeth chew; saliva starts breaking starch into sugar.',{roti:'starch → some sugar',dal:'no change yet',ghee:'no change yet'}],
 ['pipe','Food pipe · ग्रसिका','Wave-like squeezing pushes the food down.',{roti:'—',dal:'—',ghee:'—'}],
 ['stom','Stomach · आमाशय','Churned with acid and juices; protein digestion begins.',{roti:'—',dal:'protein → partly digested',ghee:'—'}],
 ['liver','Liver · यकृत (bile)','Bile from the liver breaks fat into tiny droplets.',{roti:'—',dal:'—',ghee:'fat → droplets'}],
 ['small','Small intestine · क्षुद्रांत्र','Digestion completed; villi absorb nutrients into blood.',{roti:'→ glucose, absorbed',dal:'→ amino acids, absorbed',ghee:'→ fatty acids + glycerol, absorbed'}],
 ['large','Large intestine · बृहदांत्र','Water and salts absorbed from leftovers (fibre).',{roti:'fibre remains',dal:'fibre remains',ghee:'—'}],
 ['anus','Anus · गुदा','Undigested waste is removed (egestion).',{roti:'',dal:'',ghee:''}]];
let mode='dig',food='roti',step=-1,d=0,act='rest',raf=null,ph=0;
function stop(){if(raf)cancelAnimationFrame(raf);raf=null}
function vis(){const s=$('#bSvg');return s&&s.isConnected&&s.getClientRects().length}
function drawDig(){const st=step>=0?STEPS[step]:null;let s=gut(st?st[0]:null);
 if(st){const p=ORG[st[0]];s+=`<circle cx="${p[0]}" cy="${p[1]+(st[0]==='small'?10:0)}" r="9" fill="${YE}" stroke="${ink}"/>`}
 s+=T(400,30,`Step ${step+1}/7`,'font-size="13" font-weight="700"');$('#bSvg').innerHTML=s;
 if(!st){$('#bOut').innerHTML='<p>Press Next step to swallow!</p>';return}
 const fs=food==='thali'?['roti','dal','ghee']:[food];const rows=fs.map(f=>st[3][f]?`<li><b>${{roti:'Roti (starch)',dal:'Dal (protein)',ghee:'Ghee (fat)'}[f]}:</b> ${st[3][f]}</li>`:'').join('');
 $('#bOut').innerHTML=`<p><b>${st[1]}</b> — ${st[2]}</p>${rows?'<ul>'+rows+'</ul>':''}${step===6?'<p class="fb ok">Journey complete! Total gut length ≈ 9 m; food takes about a day to pass through.</p>':''}`}
function rate(){return {rest:16,walk:24,run:40}[act]}
function drawBr(auto){const dd=auto?50+50*Math.sin(ph):d;let s=lungs(dd);const inh=auto?Math.cos(ph)>0:d>50;
 s+=T(400,30,`${rate()} breaths/min`,'font-size="14" font-weight="700"')+T(400,52,{rest:'resting',walk:'walking',run:'running'}[act],'font-size="12"');
 s+=`<path d="M230 ${inh?0:20} v${inh?18:-18}" stroke="${BL}" stroke-width="3"/>`+T(270,14,inh?'air in ↓':'air out ↑','font-size="12" fill="'+BL+'"');
 $('#bSvg').innerHTML=s;$('#bDv').textContent=Math.round(dd)+'%'}
function loop(){if(mode!=='br'||!vis()){stop();return}ph+=2*Math.PI*rate()/60/60;drawBr(true);raf=requestAnimationFrame(loop)}
function draw(){if(mode==='dig'){stop();drawDig()}else{drawBr(true);if(!raf)loop();$('#bOut').innerHTML=`<p>Breathing ${rate()} times a minute. ${act==='rest'?'At rest the body needs less energy.':'Activity needs more energy, so more oxygen: breathing gets faster and deeper.'}</p><p class="note">Drag the diaphragm slider to pause and move it yourself.</p>`}}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='bD')labChange(e.target)})}
function labClick(b){if(b.id==='bNext'){mode='dig';$('#bMode').value='dig';step=Math.min(6,step+1);draw();return true}if(b.id==='bRestart'){step=-1;mode='dig';$('#bMode').value='dig';draw();return true}return false}
function labChange(t){if(t.id==='bMode'){mode=t.value;draw();return true}if(t.id==='bFood'){food=t.value;step=-1;mode='dig';$('#bMode').value='dig';draw();return true}if(t.id==='bAct'){act=t.value;mode='br';$('#bMode').value='br';draw();return true}
 if(t.id==='bD'){stop();mode='br';$('#bMode').value='br';d=+t.value;drawBr(false);$('#bOut').innerHTML=d>50?'<p><b>Inhalation:</b> diaphragm moves down, ribs out — chest expands, air rushes in.</p>':'<p><b>Exhalation:</b> diaphragm moves up, ribs in — chest shrinks, air pushed out.</p>';return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
