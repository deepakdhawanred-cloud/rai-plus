/* Rai Plus content pack: Class 6 Science (Curiosity), Chapter 6 – Materials Around Us. Bilingual terms. */
RP.register({key:'6sci06',cls:'6',subject:'Science',ch:'6',title:"Materials Around Us",color:'#6b4a8a',
crumb:"Class 6 Science · Curiosity · हमारे चारों ओर के पदार्थ",h1:"Chapter 6: Materials Around Us",sub:"हमारे चारों ओर के पदार्थ. What things are made of, and how we group materials by their properties.",heroLabel:"A glass, a spoon, a wooden block and a plastic bottle",labName:'Material tester',
theme:"\n:root{--g:light-dark(#6b4a8a,#c9b2e8);--g2:light-dark(#f3eef9,#161022);--line:light-dark(#e0d4ee,#352a4a);--bg:light-dark(#ffffff,#0d0a14);--card:light-dark(#ffffff,#14101c);\n--ink:light-dark(#170f24,#ece6f6);--mute:light-dark(#5d5270,#b6abc8);--y:light-dark(#b3541e,#f2a774);--y2:light-dark(#fbeee4,#2a170a);--hd:#4f3368}\n",
labHTML:`  <h2>Material tester · पदार्थ परीक्षक</h2>
  <p>Choose a material and run each test. Build a property card for it.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="xSvg" viewBox="0 0 460 300" role="img" aria-label="Material test" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Material<select id="xMat"></select></label></div><div class="ctrl" style="flex-wrap:wrap"><button class="btn" data-test="lus">Shine</button><button class="btn" data-test="hard">Scratch</button><button class="btn" data-test="tr">Torch</button><button class="btn" data-test="sol">Put in water</button></div><div class="box y" id="xOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#6b4a8a',LABNAME='Material tester',MIND_CENTER='Materials · पदार्थ';
const PU='#6b4a8a',OR='#b3541e',BL='#2e6fb5',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const beaker=(x,y,fill='#cfe9f7')=>`<path d="M${x} ${y} v110 a10 10 0 0 0 10 10 h80 a10 10 0 0 0 10 -10 v-110" fill="none" stroke="${ink}" stroke-width="2"/><rect x="${x+2}" y="${y+40}" width="96" height="78" fill="${fill}" opacity=".6"/>`;
function heroDraw(){return `<path d="M40 40 h40 l-6 70 h-28z" fill="#fff" opacity=".6"/><rect x="110" y="90" width="50" height="30" fill="#fff" opacity=".8"/><path d="M190 40 q12 0 12 14 v56 h-24 v-56 q0 -14 12 -14z" fill="#fff" opacity=".85"/>`}
const HERO=heroDraw;
const MIND=[['Objects & materials',100,50],['Grouping',420,50],['Lustre & hardness',90,150],['Transparency',430,150],['Solubility',110,250],['Mass, volume, matter',410,250]];

const C=[
{id:'x1',num:'6.1',title:'Objects and materials · वस्तुएँ और पदार्थ',
 intro:'A chair can be made of wood, plastic or metal. Is the chair the material?',
 obj:'Distinguish an object from the material it is made of.',
 prior:'Things around you.',
 simple:'An object is a thing with a use, like a chair, cup or spoon. A material (पदार्थ) is what the object is made of: wood, plastic, metal, glass, cloth, paper, clay. One object can be made from different materials, and one material can make many objects. Some objects use several materials, e.g. a pencil (wood and graphite).',
 detail:'We choose a material that suits the job: glass for windows because light passes through; metal for vehicles because it is strong; cloth for clothes because it is soft and flexible. Early Indian potters, including those of the Harappan civilisation, shaped clay and fired it to make terracotta pots and toys.',
 real:'Steel tumblers, clay matkas and plastic bottles all hold water, but are made of different materials.',
 apply:'Name three objects made of wood and three made of metal.',
 see:{w:520,h:220,f:[
  ['One object, many materials: tumblers of glass, steel, clay.',`<path d="M50 70 h60 l-8 90 h-44z" fill="#cfe9f7" stroke="${ink}"/><path d="M140 70 h60 l-8 90 h-44z" fill="#b0b0b8" stroke="${ink}"/><path d="M230 70 h60 l-8 90 h-44z" fill="#c87533" stroke="${ink}"/>`+lbl(170,190,'glass · steel · clay')],
  ['One material, many objects: wooden chair, pencil, spoon.',lbl(410,90,'wood →','font-size="14" font-weight="700"')+lbl(410,120,'chair, pencil, spoon','font-size="12"')],
  ['Choose a material to suit the use.',lbl(410,190,'property → use','font-weight="700"')]]},
 seeNote:'Object = what it is; material = what it is made of.',
 do:{title:'Object–material table',mat:'Notebook',steps:['List 10 objects in your classroom.','Write the material(s) of each.'],obs:'Many objects use more than one material.',why:'Different parts need different properties.',lab:false},
 memo:'"Object is the thing; material is the stuff."',
 miscon:['"Plastic is an object." Plastic is a material.'],
 terms:['Object · वस्तु','Material · पदार्थ','Terracotta · टेराकोटा'],
 q:{q:'Which is a material?',o:['chair','tumbler','wood','pencil'],a:2,why:'Objects are made of materials.'},
 exam:'Objects vs materials: 1–2 marks.'},

{id:'x2',num:'6.2',title:'Grouping materials; lustre and hardness · चमक और कठोरता',
 intro:'Why does a new steel spoon shine but a wooden spoon does not?',
 obj:'Group materials by properties; identify lustrous and non-lustrous, hard and soft materials.',
 prior:'Objects and materials (6.1).',
 simple:'Grouping (classification) makes objects easy to find and compare. Materials with a shine are lustrous (चमकदार), usually metals like iron, copper, aluminium, gold; materials without shine are non-lustrous, like wood, paper, cloth. Hard materials are difficult to scratch or compress (iron, stone); soft ones are easy to compress or scratch (cotton, sponge).',
 detail:'Metals may lose their shine because of a coating formed by air and moisture (tarnishing); scratching the surface shows the shine underneath. Hardness is relative: rubber is harder than sponge but softer than iron. We can compare hardness by trying to scratch one material with another or with a fingernail. Other ways of grouping: shape, colour, rough or smooth, flexible or rigid.',
 real:'Old copper vessels look dull; cleaning with lemon and salt brings back their shine.',
 apply:'Arrange in order of hardness: sponge, iron nail, rubber eraser, chalk.',
 see:{w:520,h:220,f:[
  ['Lustrous: metals shine.',`<rect x="40" y="70" width="120" height="50" rx="6" fill="#c8c8d0"/><path d="M50 78 l40 0" stroke="#fff" stroke-width="5"/>`+lbl(100,150,'lustrous · चमकदार')],
  ['Non-lustrous: wood, paper, cloth.',`<rect x="200" y="70" width="120" height="50" rx="6" fill="#c9a27a"/>`+lbl(260,150,'non-lustrous')],
  ['Hard vs soft (relative).',lbl(430,80,'iron > rubber > sponge','font-size="12"')+lbl(430,150,'hard · कठोर / soft · नरम')]]},
 seeNote:'Scratch a dull metal to see its shine.',
 do:{title:'Shine and scratch',mat:'Iron nail, aluminium foil, wood, chalk, eraser, sandpaper',steps:['Rub each with sandpaper; check shine.','Try scratching each with a nail.'],obs:'Metals shine after rubbing; chalk scratches easily.',why:'Lustre and hardness.',lab:true},
 memo:'"Metals shine; hardness is a comparison."',
 miscon:['"Dull metals are not metals." Tarnish hides the shine.','"Hard or soft is fixed." Hardness is relative.'],
 terms:['Classification · वर्गीकरण','Lustrous · चमकदार','Hard · कठोर','Soft · नरम','Tarnish'],
 q:{q:'Which is lustrous?',o:['wood','paper','aluminium foil','cloth'],a:2,why:'Metal.'},
 exam:'Lustrous/non-lustrous examples: 1–2 marks.'},

{id:'x3',num:'6.3',title:'Transparent, translucent and opaque · पारदर्शी, पारभासी, अपारदर्शी',
 intro:'You can see through a window but not through a wall. What about butter paper?',
 obj:'Classify materials by how much light passes through them.',
 prior:'Grouping materials (6.2).',
 simple:'Transparent (पारदर्शी) materials let light through so we can see clearly through them: clear glass, water, air, some plastics. Translucent (पारभासी) materials let some light through but we cannot see clearly: butter paper, frosted glass, oiled paper. Opaque (अपारदर्शी) materials do not let light through: wood, cardboard, metal, stone.',
 detail:'Test: look at a lit torch through each sheet. If you see the torch clearly: transparent. If you see a glow but no clear image: translucent. If you see nothing: opaque. Choosing materials: windows use transparent glass; bathroom windows use translucent frosted glass for privacy; walls and doors are opaque.',
 real:'Lampshades are often translucent so light spreads softly.',
 apply:'Classify: plastic sheet, cardboard, butter paper, glass bangle, steel plate.',
 see:{w:520,h:220,f:[
  ['Transparent: clear view.',`<rect x="40" y="50" width="100" height="100" fill="#cfe9f7" opacity=".5" stroke="${BL}"/><circle cx="90" cy="100" r="18" fill="#f2b632"/>`+lbl(90,180,'transparent')],
  ['Translucent: a glow, no clear view.',`<rect x="210" y="50" width="100" height="100" fill="#eee" stroke="${GR}"/><circle cx="260" cy="100" r="26" fill="#f2b632" opacity=".3"/>`+lbl(260,180,'translucent')],
  ['Opaque: nothing seen.',`<rect x="380" y="50" width="100" height="100" fill="#7a5a2a"/>`+lbl(430,180,'opaque')]]},
 seeNote:'Same torch behind each sheet.',
 do:{title:'Torch test',mat:'Torch, glass, butter paper, cardboard, plastic, cloth',steps:['Hold each in front of the torch.','Note what you see.'],obs:'Three groups.',why:'Different amounts of light pass.',lab:true},
 memo:'"See clearly, see a glow, see nothing."',
 miscon:['"Translucent means coloured." It means partly lets light through.'],
 terms:['Transparent · पारदर्शी','Translucent · पारभासी','Opaque · अपारदर्शी'],
 q:{q:'Butter paper is:',o:['transparent','translucent','opaque','lustrous'],a:1,why:'Lets some light through.'},
 exam:'Classify materials by transparency: 2 marks.'},

{id:'x4',num:'6.4',title:'Soluble or insoluble · घुलनशील और अघुलनशील',
 intro:'Sugar disappears in water but sand settles at the bottom. Why?',
 obj:'Classify substances as soluble or insoluble in water, and liquids as miscible or not; know that oil floats.',
 prior:'Water as a liquid.',
 simple:'Substances that dissolve completely in water are soluble (घुलनशील): sugar, salt. Those that do not dissolve are insoluble (अघुलनशील): sand, chalk powder, sawdust. Some liquids mix with water (vinegar, lemon juice); others like oil do not mix and float on top because they are lighter (less dense).',
 detail:'Stirring and warm water make soluble substances dissolve faster. Some gases dissolve in water: oxygen dissolved in water helps fish and water plants breathe. Making ORS (oral rehydration solution) at home: dissolve sugar and salt in boiled and cooled water; it helps during dehydration (loss of water from the body).',
 real:'ORS given during diarrhoea uses salt and sugar dissolved in clean water.',
 apply:'Predict: which will dissolve in water — salt, chalk, sugar, sand, sawdust?',
 see:{w:520,h:240,f:[
  ['Sugar dissolves: soluble.',beaker(30,60)+lbl(80,215,'sugar: soluble')],
  ['Sand settles: insoluble.',beaker(200,60)+[...Array(12)].map((_,i)=>`<circle cx="${210+(i*7)%80}" cy="${172+(i%3)*4}" r="3" fill="#c9a227"/>`).join('')+lbl(250,215,'sand: insoluble')],
  ['Oil floats on water.',beaker(370,60)+`<rect x="372" y="100" width="96" height="14" fill="#f2c94c" opacity=".9"/>`+lbl(420,215,'oil floats')]]},
 seeNote:'Stirring speeds up dissolving.',
 do:{title:'Dissolving test',mat:'5 glasses of water, salt, sugar, sand, chalk, sawdust, spoon',steps:['Add a spoonful of each to a glass.','Stir and wait 5 minutes.','Record: dissolved or not.'],obs:'Salt and sugar dissolve; others do not.',why:'Solubility differs.',lab:true},
 memo:'"Sugar and salt vanish; sand, chalk, sawdust stay; oil floats."',
 miscon:['"Dissolved sugar is gone." It is still there; the water tastes sweet.'],
 terms:['Soluble · घुलनशील','Insoluble · अघुलनशील','Dissolve · घुलना','ORS'],
 q:{q:'Which is insoluble in water?',o:['salt','sugar','sand','lemon juice'],a:2,why:'Settles down.'},
 exam:'Soluble vs insoluble with examples: 2 marks.'},

{id:'x5',num:'6.5',title:'Matter: mass and volume · द्रव्यमान और आयतन',
 intro:'Is air "something" or "nothing"?',
 obj:'Define matter as anything that has mass and occupies space, and name units of mass and volume.',
 prior:'Properties of materials.',
 simple:'Anything that has mass and takes up space is matter (द्रव्य). Mass (द्रव्यमान) is the amount of matter in an object, measured in grams (g) or kilograms (kg). Volume (आयतन) is the space it occupies, measured in millilitres (mL), litres (L) or cubic metres (m³). Air is matter too: it has mass and fills space.',
 detail:'Sunlight, heat and sound are not matter: they do not have mass or take up space. 1 kg = 1000 g; 1 L = 1000 mL. A blown-up balloon shows air occupies space; a pump fills tyres with air. Ancient Indian thinkers (in Ayurveda) grouped substances by pairs of opposite qualities such as heavy–light and hot–cold.',
 real:'Milk is sold by volume (litres); vegetables by mass (kilograms).',
 apply:'Which are matter: air, water, light, a stone, sound?',
 see:{w:520,h:220,f:[
  ['Mass: measured on a balance (g, kg).',`<path d="M60 160 h120 M120 160 v-80 M70 80 h100" stroke="${ink}" stroke-width="3"/><rect x="62" y="60" width="30" height="20" fill="${PU}"/>`+lbl(120,195,'mass · द्रव्यमान')],
  ['Volume: space occupied (mL, L).',`<path d="M260 50 v120 h50 v-120" fill="none" stroke="${ink}" stroke-width="2"/><rect x="262" y="100" width="46" height="68" fill="#cfe9f7"/>`+lbl(285,195,'volume · आयतन')],
  ['Air is matter: it fills a balloon.',`<ellipse cx="430" cy="100" rx="40" ry="50" fill="${OR}" opacity=".6"/><path d="M430 150 l-6 10 h12z" fill="${OR}"/>`+lbl(430,195,'air = matter')]]},
 seeNote:'Light and sound are not matter.',
 do:{title:'Air takes space',mat:'An empty bottle, a bowl of water',steps:['Push the bottle mouth-down into water.','Tilt it slightly.'],obs:'Bubbles come out; water enters only when air leaves.',why:'Air occupies space.',lab:false},
 memo:'"Has mass + takes space = matter."',
 miscon:['"Air is nothing." Air is matter.','"Light is matter." It has no mass.'],
 terms:['Matter · द्रव्य','Mass · द्रव्यमान','Volume · आयतन','Gram, kilogram','Litre, millilitre'],
 q:{q:'Which is not matter?',o:['air','water','light','stone'],a:2,why:'No mass, no space.'},
 exam:'Define matter; units of mass and volume: 2 marks.'}
];

const CARDS=[['Object vs material','Chair (object) made of wood (material).'],['Lustrous','Shiny, usually metals.'],['Hardness','Relative: iron > rubber > sponge.'],['Transparent','Clear view: glass, water, air.'],['Translucent','Some light: butter paper, frosted glass.'],['Opaque','No light: wood, metal, cardboard.'],['Soluble','Dissolves: sugar, salt.'],['Insoluble','Does not dissolve: sand, chalk, sawdust.'],['Oil','Does not mix; floats on water.'],['Matter','Has mass and occupies space.'],['Units','Mass: g, kg; volume: mL, L, m³.']];

const Q=[
 {lv:1,q:'Which is an object, not a material?',o:['wood','glass','spoon','plastic'],a:2,w:'A spoon is a thing made of a material.'},
 {lv:1,q:'Metals are usually:',o:['lustrous','transparent','soluble','soft as sponge'],a:0,w:'Shiny.'},
 {lv:1,q:'Sand in water is:',o:['soluble','insoluble','transparent','a gas'],a:1,w:'Settles.'},
 {lv:2,q:'Frosted glass is:',o:['transparent','translucent','opaque','lustrous'],a:1,w:'Some light passes.'},
 {lv:2,q:'Oil on water:',o:['sinks','floats','dissolves','disappears'],a:1,w:'Lighter, does not mix.'},
 {lv:2,q:'Unit of volume:',o:['kg','litre','metre','gram'],a:1,w:'L, mL.'},
 {lv:3,q:'Which is matter?',o:['sound','light','air','heat'],a:2,w:'Has mass, occupies space.'},
 {lv:3,q:'For a bathroom window that lets light in but gives privacy, use:',o:['transparent glass','frosted (translucent) glass','wood','steel'],a:1,w:'Translucent.'},
 {lv:4,q:'A dull copper vessel becomes shiny after cleaning. This shows:',o:['copper is non-lustrous','tarnish hid its lustre','copper is soft','copper is transparent'],a:1,w:'Metals tarnish.'},
 {lv:4,q:'Rubber is harder than sponge but softer than iron. So hardness is:',o:['fixed','relative','the same for all','about colour'],a:1,w:'Comparison.'},
 {lv:5,open:true,m:3,q:'How will you test whether a material is transparent, translucent or opaque?',ans:['Hold it between your eye and a lit torch (1)','Clear view → transparent; glow only → translucent (1)','Nothing seen → opaque (1)']},
 {lv:5,open:true,m:3,q:'What is matter? Give two examples of matter and one of something that is not matter.',ans:['Anything that has mass and occupies space (1)','Examples: air, water, stone (1)','Not matter: light/sound/heat (1)']}
];

const ONEMIN=['Object = thing; material = what it is made of.','Group materials by properties.','Lustrous (metals) vs non-lustrous.','Hardness is relative.','Transparent / translucent / opaque.','Soluble (sugar, salt) vs insoluble (sand, chalk); oil floats.','Matter has mass and occupies space; g, kg; mL, L.'];
const KEYS=[['object vs material',/object|material|पदार्थ/i],['lustre',/lustr|shin|चमक/i],['hardness',/hard|soft|कठोर/i],['transparency',/transparent|translucent|opaque/i],['solubility',/solub|dissolv|घुल/i],['oil floats',/oil|float/i],['matter',/matter|mass|volume|द्रव्य/i]];

/* ---------- lab ---------- */
const MAT=[['Iron (nail)','#8a8a8a',{lus:1,hard:3,tr:0,sol:0,fl:0}],['Aluminium foil','#d0d0d8',{lus:1,hard:2,tr:0,sol:0,fl:0}],['Wood','#c9a27a',{lus:0,hard:2,tr:0,sol:0,fl:1}],['Glass','#cfe9f7',{lus:0,hard:3,tr:2,sol:0,fl:0}],['Butter paper','#f5f2ea',{lus:0,hard:0,tr:1,sol:0,fl:1}],['Chalk','#f1efe8',{lus:0,hard:1,tr:0,sol:0,fl:0}],['Salt','#fff',{lus:0,hard:1,tr:0,sol:1,fl:0}],['Sugar','#fff',{lus:0,hard:1,tr:0,sol:1,fl:0}],['Sponge','#f2c94c',{lus:0,hard:0,tr:0,sol:0,fl:1}],['Cooking oil','#f2c94c',{lus:0,hard:0,tr:2,sol:0,fl:1,liq:1}]];
let mi=0,card={};
function show(test){const [n,c,p]=MAT[mi];let s='',res='';
 if(test==='lus'){s=`<rect x="140" y="100" width="180" height="70" rx="8" fill="${c}" stroke="${ink}"/>`+(p.lus?`<path d="M155 110 l60 0 M160 122 l40 0" stroke="#fff" stroke-width="6"/>`:'');res=p.lus?'Lustrous (shiny)':'Non-lustrous (dull)'}
 if(test==='hard'){s=`<rect x="140" y="100" width="180" height="70" rx="8" fill="${c}" stroke="${ink}"/><path d="M330 60 L230 140" stroke="${GR}" stroke-width="6"/>`+(p.hard<=1?`<path d="M190 130 l80 -10" stroke="${OR}" stroke-width="3"/>`:'');res=['Very soft (squashes/scratches easily)','Soft (scratches easily)','Fairly hard','Hard (hard to scratch)'][p.hard]}
 if(test==='tr'){s=`<circle cx="80" cy="140" r="20" fill="#f2b632"/><rect x="200" y="60" width="${p.liq?60:20}" height="160" fill="${c}" opacity="${p.tr===2?0.4:p.tr===1?0.85:1}" stroke="${ink}"/><circle cx="380" cy="140" r="16" fill="#f2b632" opacity="${[0,0.35,1][p.tr]}"/><ellipse cx="420" cy="140" rx="10" ry="6" fill="none" stroke="${ink}"/>`;res=['Opaque (no light through)','Translucent (some light)','Transparent (clear view)'][p.tr]}
 if(test==='sol'){s=beaker(180,60);if(p.sol)res='Soluble: dissolves';else if(p.liq){s+=`<rect x="182" y="100" width="96" height="14" fill="${c}"/>`;res='Does not mix; floats on water'}else if(p.fl){s+=`<rect x="200" y="90" width="50" height="16" fill="${c}" stroke="${ink}"/>`;res='Insoluble; floats'}else{s+=`<rect x="205" y="160" width="40" height="14" fill="${c}" stroke="${ink}"/>`;res='Insoluble; sinks'}}
 s+=T(230,280,n,'font-size="16" font-weight="700"');$('#xSvg').innerHTML=s;card[test]=res;
 const names={lus:'Shine',hard:'Hardness',tr:'Light',sol:'In water'};$('#xOut').innerHTML=`<p><b>${n}</b> property card</p>`+Object.entries(names).map(([k,v])=>`<p>${v}: <b>${card[k]||'—'}</b></p>`).join('')}
function labShow(){const s=$('#xMat');if(!s.options.length)s.innerHTML=MAT.map((m,i)=>`<option value="${i}">${m[0]}</option>`).join('');card={};show('lus')}
function labInit(){}
function labClick(b){if(b.dataset&&b.dataset.test){show(b.dataset.test);return true}return false}
function labChange(t){if(t.id==='xMat'){mi=+t.value;card={};show('lus');return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
