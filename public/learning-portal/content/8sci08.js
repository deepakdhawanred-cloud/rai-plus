/* Rai Plus content pack: Class 8 Science (Curiosity), Chapter 8 – Nature of Matter: Elements, Compounds, and Mixtures. */
RP.register({key:'8sci08',cls:'8',subject:'Science',ch:'8',title:"Nature of Matter: Elements, Compounds, and Mixtures",color:'#3b6d11',
crumb:"Class 8 Science · Curiosity",h1:"Chapter 8: Nature of Matter — Elements, Compounds, and Mixtures",sub:"Pure substances and mixtures, elements and their symbols, metals and non-metals, atoms and molecules, compounds with fixed ratios and new properties, and how mixtures differ.",heroLabel:"Particle pictures of an element, a compound and a mixture",labName:'Particle picture classifier',
theme:"\n:root{--g:light-dark(#3b6d11,#a8d77d);--g2:light-dark(#eef6e4,#0f1a07);--line:light-dark(#d4e7bf,#2c4219);--bg:light-dark(#ffffff,#0b1206);--card:light-dark(#ffffff,#111a0a);\n--ink:light-dark(#162508,#e6f1da);--mute:light-dark(#4f6439,#b5c9a0);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#2b520b}\n",
labHTML:`  <h2>Particle picture classifier</h2>
  <p>Each circle is an atom; atoms joined together form a molecule. Look at the box and decide: element, compound or mixture? Then try "Iron + sulphur" to compare a mixture with a compound.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="xSvg" viewBox="0 0 460 320" role="img" aria-label="Particle picture" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="xM"><option value="c">Classify particle pictures</option><option value="f">Iron + sulphur</option></select></label></div>
  <div class="ctrl" id="xC"><button class="btn" id="xE">Element</button> <button class="btn" id="xK">Compound</button> <button class="btn" id="xX">Mixture</button> <button class="btn" id="xN">Next picture</button></div>
  <div class="ctrl" id="xF" style="display:none"><button class="btn" id="xMix">Mix powders</button> <button class="btn" id="xMag">Bring a magnet</button> <button class="btn" id="xHeat">Heat strongly</button> <button class="btn" id="xRe">Reset</button></div>
  <div class="box y" id="xOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3b6d11',LABNAME='Particle picture classifier',MIND_CENTER='Matter';
const GN='#3b6d11',OR='#b04a1f',BL='#1f5f8b',PU='#6a4fb3',GR='#888780',YE='#d4a017',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
const atom=(x,y,c,r=9)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="#333" stroke-width=".8"/>`;
const mol=(x,y,parts,r=9)=>parts.map(([dx,dy,c])=>atom(x+dx,y+dy,c,r)).join('');
const M={atomR:[[0,0,OR]],atomB:[[0,0,BL]],O2:[[-7,0,OR],[7,0,OR]],H2:[[-6,0,'#ddd'],[6,0,'#ddd']],H2O:[[0,0,OR],[-10,7,'#ddd'],[10,7,'#ddd']],CO2:[[0,0,'#444'],[-14,0,OR],[14,0,OR]],NaCl:[[-7,0,PU],[7,0,GN]],N2:[[-7,0,'#2f8f8f'],[7,0,'#2f8f8f']]};
function scene(x,y,w,h,items,seed=3){let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="${ink}" stroke-width="1.5"/>`;let r=seed;const rnd=()=>{r=(r*9301+49297)%233280;return r/233280};items.forEach(([key,n])=>{for(let k=0;k<n;k++)s+=mol(x+22+rnd()*(w-44),y+22+rnd()*(h-44),M[key],Math.min(9,w/24))});return s}
function heroDraw(){return `<circle cx="100" cy="80" r="10" fill="#fff"/><circle cx="125" cy="70" r="10" fill="#fff"/><circle cx="185" cy="80" r="10" fill="#fff"/><circle cx="200" cy="72" r="7" fill="none" stroke="#fff" stroke-width="2"/><circle cx="270" cy="80" r="10" fill="#fff"/><circle cx="295" cy="70" r="7" fill="none" stroke="#fff" stroke-width="2"/>`}
const HERO=heroDraw;
const MIND=[['Pure vs mixture',100,50],['Elements & symbols',420,50],['Metals & non-metals',90,150],['Atoms & molecules',430,150],['Compounds',110,250],['Mixtures',410,250]];

const C=[
{id:'x1',num:'8.1',title:'Pure substances and mixtures',
 intro:'"Pure ghee", "pure milk" — do these mean the same thing to a scientist?',
 obj:'Distinguish pure substances from mixtures.',
 prior:'Class 6: separation of substances; Ch 7 particles.',
 simple:'In science, a pure substance is made of only one kind of particle and has the same composition throughout — for example, distilled water, sugar, iron, oxygen. A mixture contains two or more substances physically mixed, not chemically joined — for example, air, sea water, soil, lemonade. Pure substances are either elements or compounds.',
 detail:'Everyday "pure" often means "not adulterated" — milk is called pure, but scientifically it is a mixture of water, fats, proteins and sugars. Pure substances have fixed melting and boiling points (pure water boils at 100 °C at sea level); mixtures usually do not.',
 real:'The water we drink is a mixture — it contains dissolved minerals; distilled water used in labs and batteries is pure.',
 apply:'Classify: air, gold, salt solution, distilled water, milk, oxygen.',
 see:{w:520,h:220,f:[
  ['Matter.',box(195,10,130,40,'Matter',GR)],
  ['Pure substances and mixtures.',box(60,90,170,40,'Pure substance',GN)+box(290,90,170,40,'Mixture',OR)+`<path d="M260 50 L145 88 M260 50 L375 88" stroke="${GR}" stroke-width="2"/>`],
  ['Pure → elements or compounds.',box(20,170,110,36,'Element',BL)+box(150,170,110,36,'Compound',PU)+`<path d="M145 130 L75 168 M145 130 L205 168" stroke="${GR}" stroke-width="2"/>`+lbl(375,190,'air · sea water · soil','fill="'+OR+'"')]]},
 seeNote:'One kind of particle = pure.',
 do:{title:'Boiling check',mat:'Distilled water, salt water, thermometer (teacher)',steps:['Heat both; note boiling temperatures.'],obs:'Salt water boils above 100 °C.',why:'Mixtures lack a fixed boiling point.',lab:false},
 memo:'"Pure: one kind; mixture: many kinds."',
 miscon:['"Pure milk is a pure substance." It is a mixture.'],
 terms:['Pure substance · शुद्ध पदार्थ','Mixture · मिश्रण','Composition · संघटन'],
 q:{q:'Which is a pure substance?',o:['air','sea water','distilled water','soil'],a:2,why:'One kind of particle.'},
 exam:'Classify pure/mixture: 2 marks.'},

{id:'x2',num:'8.2',title:'Elements and their symbols',
 intro:'Gold, oxygen and carbon cannot be broken down into anything simpler. What makes them special?',
 obj:'Define elements and use chemical symbols.',
 prior:'8.1.',
 simple:'An element is a pure substance made of only one kind of atom; it cannot be broken down into simpler substances by chemical means. About 118 elements are known; about 94 occur in nature. Each has a symbol of one or two letters: H (hydrogen), O (oxygen), C (carbon), N (nitrogen), Ca (calcium), Cl (chlorine). Some come from Latin names: Na (sodium, natrium), Fe (iron, ferrum), Cu (copper, cuprum), Ag (silver, argentum), Au (gold, aurum).',
 detail:'The first letter is a capital; the second (if any) is small: Co (cobalt) is an element, but CO is carbon monoxide, a compound. Elements are arranged in the periodic table. The most common elements in the Earth\'s crust are oxygen and silicon; in our bodies, oxygen, carbon, hydrogen and nitrogen.',
 real:'Gold jewellery (Au), copper wires (Cu), aluminium foil (Al) and iron rods (Fe) are mostly single elements.',
 apply:'Write symbols for: sodium, potassium, iron, sulphur, magnesium.',
 see:{w:520,h:220,f:[
  ['One-letter symbols.',[['H','hydrogen'],['O','oxygen'],['C','carbon'],['N','nitrogen']].map(([s,n],k)=>`<rect x="${30+k*120}" y="30" width="80" height="70" rx="8" fill="${BL}" fill-opacity=".12" stroke="${BL}"/>`+lbl(70+k*120,72,s,'font-size="28" font-weight="700" fill="'+BL+'"')+lbl(70+k*120,115,n,'font-size="11"')).join('')],
  ['From Latin names.',[['Fe','ferrum (iron)'],['Na','natrium (sodium)'],['Cu','cuprum (copper)'],['Au','aurum (gold)']].map(([s,n],k)=>lbl(70+k*120,160,s,'font-size="22" font-weight="700" fill="'+OR+'"')+lbl(70+k*120,182,n,'font-size="10"')).join('')],
  ['Capital first, small second.',lbl(260,212,'Co = cobalt (element), CO = carbon monoxide (compound)','font-size="12" font-weight="700"')]]},
 seeNote:'Symbols are a shared language.',
 do:{title:'Symbol bingo',mat:'Bingo cards with symbols',steps:['Teacher calls element names; mark the symbols.'],obs:'Learn 20 symbols.',why:'Chemical language.',lab:false},
 memo:'"Fe from ferrum, Au from aurum."',
 miscon:['"CO and Co are the same." Capitals matter.'],
 terms:['Element · तत्व','Atom · परमाणु','Symbol · प्रतीक','Periodic table · आवर्त सारणी'],
 q:{q:'Symbol for iron is:',o:['I','Ir','Fe','In'],a:2,why:'Ferrum.'},
 exam:'Element symbols: 1–2 marks.'},

{id:'x3',num:'8.3',title:'Metals, non-metals and metalloids',
 intro:'Why are cooking pans made of metal but their handles of plastic or wood?',
 obj:'Compare the properties of metals and non-metals.',
 prior:'8.2; Class 7 materials.',
 simple:'Metals (iron, copper, aluminium, gold) are usually shiny (lustrous), hard, good conductors of heat and electricity, malleable (beaten into sheets), ductile (drawn into wires) and sonorous (ring when struck). Non-metals (carbon, sulphur, oxygen, nitrogen) are usually dull, brittle if solid, and poor conductors. Metalloids such as silicon have properties in between.',
 detail:'Exceptions: mercury is a liquid metal; sodium is soft enough to cut with a knife; graphite (a form of carbon) conducts electricity; iodine is a shiny non-metal; diamond (carbon) is the hardest natural substance. Silicon is used in computer chips and solar cells.',
 real:'Copper wires carry electricity; aluminium foil wraps food; silicon chips run phones.',
 apply:'Why is copper used for electric wires and sulphur not?',
 see:{w:520,h:220,f:[
  ['Metals.',box(20,30,220,60,'Metals',BL,'shiny · conduct · malleable · ductile')],
  ['Non-metals.',box(280,30,220,60,'Non-metals',OR,'dull · brittle · poor conductors')],
  ['Exceptions.',lbl(130,140,'mercury: liquid metal','fill="'+BL+'"')+lbl(390,140,'graphite conducts','fill="'+OR+'"')+lbl(260,185,'metalloid: silicon (in between)','font-weight="700" fill="'+PU+'"')]]},
 seeNote:'Properties guide use.',
 do:{title:'Property tests',mat:'Iron nail, copper wire, charcoal, sulphur (teacher), circuit tester',steps:['Test lustre, hammering and conduction.'],obs:'Metals conduct and flatten.',why:'Metallic properties.',lab:false},
 memo:'"Metals: shine, ring, bend, conduct."',
 miscon:['"All metals are solid." Mercury is liquid.'],
 terms:['Metal · धातु','Non-metal · अधातु','Metalloid · उपधातु','Malleable · आघातवर्ध्य','Ductile · तन्य','Lustre · चमक'],
 q:{q:'Which metal is a liquid at room temperature?',o:['sodium','mercury','iron','aluminium'],a:1,why:'Mercury.'},
 exam:'Metals vs non-metals: 3 marks.'},

{id:'x4',num:'8.4',title:'Atoms and molecules',
 intro:'If you kept cutting a piece of gold in half, would you ever reach a smallest piece?',
 obj:'Describe atoms and molecules and read simple formulae.',
 prior:'8.2; Ch 7 particles.',
 simple:'An atom is the smallest particle of an element. A molecule is two or more atoms joined together. Molecules can be of the same element (oxygen O₂ — two oxygen atoms) or of different elements (water H₂O — two hydrogen atoms and one oxygen atom). A chemical formula shows which atoms and how many: CO₂ = 1 carbon + 2 oxygen.',
 detail:'Atoms are incredibly small — about a ten-millionth of a millimetre across. Some elements exist as single atoms (helium, He); many as molecules (O₂, N₂, H₂). The subscript number shows how many atoms of the element are present: NH₃ (ammonia) = 1 N + 3 H.',
 real:'Every breath you take contains about 10²² molecules of air.',
 apply:'How many atoms of each element are in C₆H₁₂O₆ (glucose)?',
 see:{w:520,h:220,f:[
  ['Atom of oxygen.',atom(80,90,OR,14)+lbl(80,130,'O atom')],
  ['Molecule of oxygen O₂.',mol(220,90,[[-12,0,OR],[12,0,OR]],14)+lbl(220,130,'O₂ (element)')],
  ['Molecule of water H₂O.',mol(380,90,[[0,0,OR],[-16,11,'#ddd'],[16,11,'#ddd']],14)+lbl(380,135,'H₂O (compound)')+lbl(260,190,'formula: symbols + number of atoms','font-weight="700"')]]},
 seeNote:'Atoms build molecules.',
 do:{title:'Clay molecules',mat:'Coloured clay, toothpicks',steps:['Build H₂O, CO₂, O₂ and NH₃.'],obs:'Formula = atom count.',why:'Molecular models.',lab:false},
 memo:'"Atoms join to make molecules."',
 miscon:['"Molecules are always compounds." O₂ is a molecule of an element.'],
 terms:['Atom · परमाणु','Molecule · अणु','Chemical formula · रासायनिक सूत्र'],
 q:{q:'A molecule of CO₂ has how many atoms?',o:['1','2','3','4'],a:2,why:'1 C + 2 O.'},
 exam:'Atoms, molecules, formulae: 2 marks.'},

{id:'x5',num:'8.5',title:'Compounds',
 intro:'Sodium is a dangerous metal and chlorine a poisonous gas. Together they make the salt we eat. How?',
 obj:'Describe compounds: fixed composition and new properties.',
 prior:'8.4.',
 simple:'A compound is a pure substance formed when two or more elements combine chemically in a fixed ratio by mass. Its properties are completely different from those of its elements. Water (H₂O): hydrogen burns, oxygen helps burning, but water puts out fire. Common salt (NaCl) from sodium and chlorine. Carbon dioxide (CO₂), sugar, chalk (calcium carbonate) are compounds.',
 detail:'Compounds can be broken into elements only by chemical methods (for example, passing electricity through water gives hydrogen and oxygen). Forming a compound usually involves energy change (heat or light). Water always has hydrogen and oxygen in a 1 : 8 ratio by mass, whatever its source.',
 real:'Baking soda (sodium hydrogen carbonate) is a compound used in cooking and fire extinguishers.',
 apply:'Why are the properties of water different from those of hydrogen and oxygen?',
 see:{w:520,h:220,f:[
  ['Hydrogen and oxygen.',scene(20,30,140,130,[['H2',4],['O2',2]],5)+lbl(90,180,'H₂ + O₂ (elements)')],
  ['Chemical combination →',`<path d="M170 95 h60" stroke="${GR}" stroke-width="3"/><path d="M230 95 l-10 -6 v12z" fill="${GR}"/>`+lbl(200,80,'react','font-size="11"')],
  ['Water: new properties.',scene(240,30,140,130,[['H2O',4]],9)+lbl(310,180,'H₂O (compound)')+lbl(450,90,'puts out fire!','font-size="11" fill="'+BL+'"')]]},
 seeNote:'Fixed ratio, new properties.',
 do:{title:'Electrolysis demo',mat:'Water with a little salt, 9 V battery, pencil leads (teacher)',steps:['Pass current; observe bubbles at both leads.'],obs:'Gas at both.',why:'Compound broken chemically.',lab:false},
 memo:'"Compound: chemically joined, new character."',
 miscon:['"A compound keeps its elements\' properties." It has new properties.'],
 terms:['Compound · यौगिक','Fixed ratio · निश्चित अनुपात','Chemical combination · रासायनिक संयोजन'],
 q:{q:'Common salt is formed from:',o:['sodium and oxygen','sodium and chlorine','carbon and oxygen','hydrogen and chlorine'],a:1,why:'NaCl.'},
 exam:'Properties of compounds: 3 marks.'},

{id:'x6',num:'8.6',title:'Mixtures versus compounds',
 intro:'Iron filings and sulphur powder stirred together, or heated strongly — are the products the same?',
 obj:'Compare mixtures and compounds; classify mixtures as homogeneous or heterogeneous.',
 prior:'8.5.',
 simple:'In a mixture, substances keep their own properties, can be in any ratio, and can be separated by physical methods (magnet, filtration, evaporation, distillation). Homogeneous mixtures look the same throughout (salt solution, air); heterogeneous mixtures do not (sand + water, soil). In a compound, elements lose their properties, are in a fixed ratio, and can be separated only chemically.',
 detail:'Iron + sulphur mixture: a magnet pulls out the iron; the sulphur stays yellow. Heat the mixture strongly and it glows to form iron sulphide (FeS) — black, not attracted by a magnet: a compound. Alloys like brass and steel are homogeneous mixtures of metals.',
 real:'Air is a mixture: we separate oxygen from it for hospitals by cooling and distilling.',
 apply:'Give three differences between a mixture and a compound.',
 see:{w:520,h:220,f:[
  ['Mixture: separate atoms of iron and sulphur.',scene(20,30,150,130,[['atomR',8],['atomB',0]],2)+[...Array(8)].map((_,k)=>atom(45+(k*41)%110,55+(k*29)%90,YE,8)).join('')+lbl(95,180,'iron + sulphur (mixture)')],
  ['Heat strongly →',`<path d="M180 95 h60" stroke="${OR}" stroke-width="3"/><path d="M240 95 l-10 -6 v12z" fill="${OR}"/>`+lbl(210,80,'heat','fill="'+OR+'"')],
  ['Compound FeS: new substance.',`<rect x="250" y="30" width="150" height="130" rx="8" fill="none" stroke="${ink}"/>`+[...Array(7)].map((_,k)=>mol(280+(k*43)%100,55+(k*31)%90,[[-6,0,OR],[6,0,YE]],8)).join('')+lbl(325,180,'iron sulphide (compound)')+lbl(460,100,'magnet ✗','font-size="11" fill="'+OR+'"')]]},
 seeNote:'Physical mix vs chemical join.',
 do:{title:'Magnet test',mat:'Iron filings, sulphur powder, magnet',steps:['Mix the powders.','Run a magnet over them.'],obs:'Iron separates.',why:'Mixture keeps properties.',lab:true},
 memo:'"Mixture: any amount, easy apart. Compound: fixed ratio, chemically bound."',
 miscon:['"All mixtures look mixed." Homogeneous ones look uniform (salt water, air).'],
 terms:['Homogeneous · समांगी','Heterogeneous · विषमांगी','Alloy · मिश्रधातु','Iron sulphide'],
 q:{q:'Which can be separated using a magnet?',o:['iron sulphide','iron + sulphur mixture','water','salt'],a:1,why:'Iron keeps its properties.'},
 exam:'Mixture vs compound: 3–5 marks.'}
];

const CARDS=[['Pure substance','One kind of particle; fixed composition.'],['Mixture','Two or more substances physically mixed.'],['Element','One kind of atom; ~118 known.'],['Symbols','H, O, C, Na (natrium), Fe (ferrum).'],['Metals','Shiny, conduct, malleable, ductile.'],['Non-metals','Dull, brittle, poor conductors.'],['Molecule','Atoms joined: O₂, H₂O.'],['Compound','Fixed ratio, new properties.'],['Homogeneous','Uniform: salt water, air, alloys.'],['Heterogeneous','Not uniform: sand + water, soil.']];

const Q=[
 {lv:1,q:'Symbol of sodium:',o:['S','So','Na','Sd'],a:2,w:'Natrium.'},
 {lv:1,q:'Water is a:',o:['element','compound','mixture','metal'],a:1,w:'H₂O.'},
 {lv:1,q:'Air is a:',o:['compound','element','mixture','metal'],a:2,w:'Mixture of gases.'},
 {lv:2,q:'Which is malleable?',o:['sulphur','copper','charcoal','iodine'],a:1,w:'Metal.'},
 {lv:2,q:'O₂ is a molecule of:',o:['a compound','an element','a mixture','a metal'],a:1,w:'Same atoms.'},
 {lv:2,q:'Salt solution is a:',o:['heterogeneous mixture','homogeneous mixture','compound','element'],a:1,w:'Uniform.'},
 {lv:3,q:'How many atoms in one molecule of NH₃?',o:['2','3','4','5'],a:2,w:'1 + 3.'},
 {lv:3,q:'Heating iron and sulphur gives a black solid not attracted by a magnet. It is:',o:['a mixture','a compound','an element','an alloy'],a:1,w:'FeS.'},
 {lv:4,q:'Which statement is true for compounds?',o:['any ratio','separated by magnet','fixed ratio and new properties','keep element properties'],a:2,w:'Definition.'},
 {lv:4,q:'Graphite is unusual because it:',o:['is a liquid','is a non-metal that conducts electricity','is a metal','is a mixture'],a:1,w:'Exception.'},
 {lv:5,open:true,m:3,q:'Give three differences between a mixture and a compound.',ans:['Mixture: any ratio; compound: fixed ratio (1)','Mixture: components keep properties; compound: new properties (1)','Mixture: separated physically; compound: only chemically (1)']},
 {lv:5,open:true,m:3,q:'Describe how you would show that iron + sulphur powder is a mixture, and what happens when it is heated.',ans:['Magnet removes iron from mixture (1)','Sulphur stays yellow; properties unchanged (1)','Heating forms iron sulphide, a black compound not attracted by magnet (1)']}
];

const ONEMIN=['Pure substances vs mixtures.','Elements and symbols.','Metals, non-metals, metalloids.','Atoms, molecules, formulae.','Compounds: fixed ratio, new properties.','Mixtures vs compounds; homogeneous vs heterogeneous.'];
const KEYS=[['pure/mixture',/pure|mixture/i],['element',/element/i],['symbol',/symbol/i],['metal',/metal/i],['molecule',/atom|molecule|formula/i],['compound',/compound/i]];

/* ---------- lab ---------- */
const PICS=[{n:'Oxygen gas (O₂)',a:'E',it:[['O2',7]]},{n:'Helium (He) — single atoms',a:'E',it:[['atomB',10]]},{n:'Water (H₂O)',a:'K',it:[['H2O',7]]},{n:'Carbon dioxide (CO₂)',a:'K',it:[['CO2',6]]},{n:'Air (N₂, O₂, CO₂)',a:'X',it:[['N2',5],['O2',3],['CO2',1]]},{n:'Hydrogen + oxygen gases mixed',a:'X',it:[['H2',5],['O2',3]]},{n:'Salt (NaCl)',a:'K',it:[['NaCl',8]]},{n:'Salt water',a:'X',it:[['NaCl',3],['H2O',6]]},{n:'Hydrogen gas (H₂)',a:'E',it:[['H2',8]]}];
let cur=null,score=0,tries=0,fs='start';
function newPic(){let k;do{k=Math.floor(Math.random()*PICS.length)}while(PICS[k]===cur&&PICS.length>1);cur=PICS[k];$('#xSvg').innerHTML=scene(60,20,340,260,cur.it,Math.floor(Math.random()*999)+1)+T(230,305,'Element, compound or mixture?','font-size="13" font-weight="700"');$('#xOut').innerHTML=`<p>Score: ${score}/${tries}</p>`}
function drawF(){let s='';const r=(i)=>((i*9301+49297)%233280)/233280;
 if(fs==='start')s+=`<rect x="40" y="200" width="150" height="70" rx="8" fill="#9aa0a6"/>`+T(115,240,'iron filings','font-size="12" fill="#fff"')+`<rect x="270" y="200" width="150" height="70" rx="8" fill="${YE}"/>`+T(345,240,'sulphur powder','font-size="12"');
 if(fs==='mix'||fs==='mag'){s+=`<rect x="100" y="180" width="260" height="90" rx="8" fill="#eee" stroke="${ink}"/>`;for(let i=0;i<120;i++){const iron=i%2===0;if(fs==='mag'&&iron)continue;s+=`<circle cx="${110+r(i)*240}" cy="${190+r(i+300)*70}" r="3" fill="${iron?'#5f6368':YE}"/>`}
  if(fs==='mag'){s+=`<path d="M200 40 v60 a30 30 0 0 0 60 0 v-60 h-18 v60 a12 12 0 0 1 -24 0 v-60z" fill="${OR}"/>`;for(let i=0;i<60;i++)s+=`<circle cx="${205+r(i+50)*50}" cy="${110+r(i+80)*40}" r="3" fill="#5f6368"/>`;s+=T(320,90,'iron sticks to magnet','font-size="12"')}}
 if(fs==='heat'){s+=`<rect x="100" y="180" width="260" height="90" rx="8" fill="#222"/>`+T(230,230,'iron sulphide (FeS)','font-size="14" fill="#fff"')+`<path d="M200 300 q10 -20 0 -30 q20 10 15 30z M250 300 q10 -20 0 -30 q20 10 15 30z" fill="${OR}"/>`}
 $('#xSvg').innerHTML=s;const m={start:'<p>Two elements: grey iron filings (magnetic) and yellow sulphur powder.</p>',mix:'<p>Mixed: you can still see grey and yellow bits. Any amounts can be mixed. Now try the magnet.</p>',mag:'<p class="fb ok">The magnet pulls out the iron — in a mixture each substance keeps its own properties.</p>',heat:'<p class="fb ok">Heated strongly, iron and sulphur react chemically in a fixed ratio to form iron sulphide, a black compound. It is not attracted by a magnet and is not yellow — new properties!</p>'};$('#xOut').innerHTML=m[fs]}
let mode='c';
function labShow(){mode==='c'?newPic():drawF()}
function labInit(){}
function labClick(b){const g={xE:'E',xK:'K',xX:'X'}[b.id];if(g){if(!cur)return true;tries++;const ok=g===cur.a;if(ok)score++;const why={E:'only one kind of atom (single atoms or same-atom molecules).',K:'every molecule is the same and contains different atoms joined together.',X:'it has two or more different kinds of particles, not joined to each other.'}[cur.a];$('#xOut').innerHTML=`<p class="fb ${ok?'ok':'no'}">${ok?'Correct':'Not quite'}: ${cur.n} is ${({E:'an element',K:'a compound',X:'a mixture'})[cur.a]} — ${why}</p><p>Score: ${score}/${tries}</p>`;return true}
 if(b.id==='xN'){newPic();return true}
 if(b.id==='xMix'){fs='mix';drawF();return true}if(b.id==='xMag'){if(fs==='start'){$('#xOut').innerHTML='<p>Mix the powders first.</p>';return true}if(fs==='heat'){$('#xOut').innerHTML='<p class="fb no">The magnet does not attract iron sulphide — it is a new compound.</p>';return true}fs='mag';drawF();return true}
 if(b.id==='xHeat'){if(fs==='start'){$('#xOut').innerHTML='<p>Mix the powders first.</p>';return true}fs='heat';drawF();return true}if(b.id==='xRe'){fs='start';drawF();return true}return false}
function labChange(t){if(t.id==='xM'){mode=t.value;$('#xC').style.display=mode==='c'?'':'none';$('#xF').style.display=mode==='f'?'':'none';mode==='c'?newPic():(fs='start',drawF());return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
