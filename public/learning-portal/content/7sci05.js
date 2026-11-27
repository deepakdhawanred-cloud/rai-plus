/* Rai Plus content pack: Class 7 Science (Curiosity), Chapter 5 – Changes Around Us: Physical and Chemical. Bilingual terms. */
RP.register({key:'7sci05',cls:'7',subject:'Science',ch:'5',title:"Changes Around Us: Physical and Chemical",color:'#9a4a14',
crumb:"Class 7 Science · Curiosity · हमारे चारों ओर परिवर्तन: भौतिक और रासायनिक",h1:"Chapter 5: Changes Around Us — Physical and Chemical",sub:"भौतिक और रासायनिक परिवर्तन. Reversible and irreversible changes, signs of a chemical change, rusting and its prevention, crystallisation.",heroLabel:"Ice melting, paper burning, a rusty nail and a crystal",labName:'Change lab',
theme:"\n:root{--g:light-dark(#9a4a14,#f0a877);--g2:light-dark(#fbeee4,#2a160a);--line:light-dark(#f1d6c4,#4a2c1a);--bg:light-dark(#ffffff,#130b06);--card:light-dark(#ffffff,#1b1009);\n--ink:light-dark(#24140a,#f6e8de);--mute:light-dark(#6e5444,#cfb4a3);--y:light-dark(#2f6f8a,#8cc3da);--y2:light-dark(#e6f2f7,#0c1d25);--hd:#773510}\n",
labHTML:`  <h2>Change lab · परिवर्तन प्रयोगशाला</h2>
  <p><b>Classify:</b> do something to a material, look for signs, then decide physical or chemical. <b>Rust race:</b> watch three iron nails over 7 days.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="gSvg" viewBox="0 0 460 320" role="img" aria-label="Change experiment" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="gMode"><option value="cls">Classify a change</option><option value="rust">Rust race (3 test tubes)</option></select></label></div>
  <div class="ctrl"><label>Action<select id="gAct"><option value="ice">Melt an ice cube</option><option value="paper">Burn a strip of paper</option><option value="salt">Dissolve salt in water</option><option value="soda">Add vinegar to baking soda</option><option value="egg">Cook an egg</option><option value="wax">Melt candle wax</option><option value="milk">Leave milk to set as curd</option><option value="tear">Tear a paper</option><option value="mg">Burn magnesium (teacher)</option><option value="cuso4">Iron nail in copper sulphate solution</option></select></label> <button class="btn" id="gDo">Do it</button></div>
  <div class="ctrl" style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn" data-g="p">Physical</button><button class="btn" data-g="c">Chemical</button></div>
  <div class="ctrl"><label>Day: <b id="gDv"></b><input type="range" id="gD" min="0" max="7" value="0"></label></div>
  <div class="box y" id="gOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#9a4a14',LABNAME='Change lab',MIND_CENTER='Changes · परिवर्तन';
const OR='#9a4a14',BL='#2f6f8a',GN='#3b8a3b',RD='#c0392b',GR='#888780',RU='#a0522d',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const flame=(x,y,s=1,c='#f2a33a')=>`<path d="M${x} ${y} q${-12*s} ${-18*s} 0 ${-40*s} q${12*s} ${22*s} 0 ${40*s}z" fill="${c}"/>`;
const bubbles=(x,y,n=6)=>[...Array(n)].map((_,k)=>`<circle cx="${x+(k*17)%40-20}" cy="${y-(k*13)%45}" r="${2+k%3}" fill="none" stroke="${BL}"/>`).join('');
function heroDraw(){return `<rect x="40" y="60" width="40" height="40" rx="6" fill="#fff" opacity=".8"/><path d="M60 110 q-10 6 0 10 q10 -4 0 -10" fill="#fff"/>`+flame(150,110,1.2,'#fff')+`<line x1="220" y1="70" x2="290" y2="110" stroke="#fff" stroke-width="6"/><polygon points="340,60 370,80 360,115 325,110 315,80" fill="#fff" opacity=".85"/>`}
const HERO=heroDraw;
const MIND=[['Physical changes',100,50],['Chemical changes',420,50],['Signs of a chemical change',90,150],['Reversible?',430,150],['Rusting',110,250],['Crystallisation',410,250]];

const C=[
{id:'g1',num:'5.1',title:'Physical changes · भौतिक परिवर्तन',
 intro:'Ice melts into water and water freezes back into ice. Is anything new made?',
 obj:'Identify physical changes.',
 prior:'Class 6: states of water; separation.',
 simple:'In a physical change (भौतिक परिवर्तन), a substance changes its shape, size, state or appearance, but no new substance is formed. Examples: melting ice, freezing water, boiling water, dissolving sugar, cutting paper, folding cloth, melting wax, breaking glass.',
 detail:'Many physical changes are reversible: ice ↔ water, wax melting and setting again. Some are not easy to reverse (a broken glass, torn paper) but are still physical because the material is the same. Dissolving salt in water is physical: you can get the salt back by evaporation.',
 real:'Making ice cubes in the freezer is a physical change.',
 apply:'Is dissolving sugar in tea a physical change? Explain.',
 see:{w:520,h:200,f:[
  ['Ice (solid).',`<rect x="60" y="80" width="50" height="50" rx="8" fill="#cfe8f7" stroke="${BL}"/>`],
  ['Melts into water — same substance.',`<path d="M200 130 q30 -10 60 0 q-30 14 -60 0z" fill="#8cc3da"/>`+lbl(230,160,'still water (H₂O)')],
  ['Freeze it again: ice is back.',`<rect x="380" y="80" width="50" height="50" rx="8" fill="#cfe8f7" stroke="${BL}"/>`+lbl(260,60,'⇄ reversible','font-weight="700"')]]},
 seeNote:'No new substance.',
 do:{title:'Wax test',mat:'Candle piece, spoon, warm water bath (adult)',steps:['Melt a piece of wax in a spoon over warm water.','Let it cool.'],obs:'Solid wax again.',why:'Physical change.',lab:true},
 memo:'"New look, same stuff = physical."',
 miscon:['"Dissolving makes a new substance." Salt can be recovered.'],
 terms:['Physical change · भौतिक परिवर्तन','State · अवस्था','Reversible · उत्क्रमणीय'],
 q:{q:'Which is a physical change?',o:['burning wood','melting butter','cooking rice','rusting'],a:1,why:'Only state changes.'},
 exam:'Examples of physical change: 2 marks.'},

{id:'g2',num:'5.2',title:'Chemical changes · रासायनिक परिवर्तन',
 intro:'Can you turn ash back into paper?',
 obj:'Identify chemical changes in which new substances form.',
 prior:'5.1; Ch 2 (acids and bases); Ch 4 (oxides).',
 simple:'In a chemical change (रासायनिक परिवर्तन), one or more new substances are formed with different properties. Examples: burning paper or wood, cooking food, rusting of iron, milk turning into curd, ripening and rotting of fruit, digestion of food, burning magnesium, baking soda reacting with vinegar.',
 detail:'Chemical changes are usually irreversible: you can\'t get the paper back from ash and smoke. Burning magnesium gives magnesium oxide (new substance). Baking soda + vinegar gives carbon dioxide gas (new substance) — it turns lime water milky. Iron nail in blue copper sulphate solution: the solution turns green and a brown coating of copper forms on the nail.',
 real:'Making roti: raw dough → cooked roti is a chemical change.',
 apply:'Why is curdling of milk a chemical change?',
 see:{w:520,h:220,f:[
  ['Paper strip.',`<rect x="60" y="80" width="100" height="20" fill="#f4f0e6" stroke="${ink}"/>`],
  ['Burning: heat, light, smoke.',flame(110,80,1.3)+`<path d="M110 30 q10 -10 0 -20 q-10 -10 0 -20" stroke="${GR}" fill="none"/>`],
  ['Ash and gases: new substances. Can\'t reverse.',`<path d="M300 110 q20 -10 40 0 q20 -6 40 0 v10 h-80z" fill="#555"/>`+lbl(340,150,'ash · राख')+lbl(260,200,'new substances formed','font-weight="700"')]]},
 seeNote:'New substance = chemical change.',
 do:{title:'Fizz and lime water',mat:'Baking soda, vinegar, bottle, straw, lime water (teacher)',steps:['Add vinegar to baking soda.','Pass the gas into lime water.'],obs:'Fizzing; lime water turns milky.',why:'CO₂, a new substance.',lab:true},
 memo:'"New stuff made = chemical."',
 miscon:['"All chemical changes need fire." Rusting and curdling don\'t.'],
 terms:['Chemical change · रासायनिक परिवर्तन','New substance','Irreversible · अनुत्क्रमणीय','Carbon dioxide'],
 q:{q:'Which is a chemical change?',o:['tearing cloth','melting ice','rusting of iron','boiling water'],a:2,why:'Rust is new.'},
 exam:'Chemical change with evidence: 3 marks.'},

{id:'g3',num:'5.3',title:'Signs of a chemical change · रासायनिक परिवर्तन के संकेत',
 intro:'How can you tell a chemical change has happened without a laboratory?',
 obj:'Use observable signs to recognise chemical changes.',
 prior:'5.2.',
 simple:'Signs that a chemical change may have happened: a gas is given off (bubbles, fizz); colour changes; heat or light is given out (or absorbed); a new smell; a solid (precipitate) forms; a change in taste.',
 detail:'One sign alone may mislead: boiling water bubbles but is physical. Look for evidence of a new substance. Examples: apple turning brown when cut (colour), Mg burning (light, heat, white ash), vinegar + baking soda (gas), iron nail in copper sulphate (colour blue → green, brown coating), curd (taste, smell).',
 real:'A cut apple browns; a rotten egg smells — both chemical changes.',
 apply:'Bubbles appear when you boil water. Is it a chemical change?',
 see:{w:520,h:220,f:[
  ['Gas: bubbles and fizz.',`<path d="M50 80 v90 a10 10 0 0 0 10 10 h60 a10 10 0 0 0 10 -10 v-90" fill="none" stroke="${ink}" stroke-width="2"/>`+bubbles(90,165,9)+lbl(90,205,'gas')],
  ['Colour change: blue → green.',`<rect x="200" y="90" width="40" height="70" fill="#4a90d9" opacity=".6"/><rect x="260" y="90" width="40" height="70" fill="#6aa86a" opacity=".6"/>`+lbl(250,205,'colour')],
  ['Heat and light; new smell.',flame(400,160,1.4)+lbl(400,205,'heat/light')]]},
 seeNote:'Look for evidence of a new substance.',
 do:{title:'Apple browning',mat:'Apple, knife (adult), lemon',steps:['Cut two slices; put lemon juice on one.','Observe after 30 minutes.'],obs:'Plain slice browns.',why:'Chemical change with air.',lab:false},
 memo:'"Gas, colour, heat, smell, solid — think chemical."',
 miscon:['"Any bubbling means chemical change." Boiling is physical.'],
 terms:['Evidence','Gas · गैस','Colour change','Precipitate'],
 q:{q:'Iron nail in copper sulphate: the solution turns',o:['red','green','colourless','black'],a:1,why:'New substance forms.'},
 exam:'Signs of chemical change: 2 marks.'},

{id:'g4',num:'5.4',title:'Reversible and irreversible; useful and harmful · उत्क्रमणीय-अनुत्क्रमणीय',
 intro:'Which changes would you like to undo, and which can never be undone?',
 obj:'Classify changes as reversible/irreversible and useful/harmful.',
 prior:'5.1–5.3.',
 simple:'Reversible changes can be undone (melting/freezing, dissolving/evaporating). Irreversible changes cannot (burning, cooking, ripening). Most physical changes are reversible; most chemical changes are irreversible. Changes can also be useful (cooking, digestion, making curd) or harmful (rusting, rotting food, burning forests).',
 detail:'Slow and fast changes: rusting and ripening are slow; burning and fizzing are fast. Periodic changes repeat regularly (day and night, seasons) — they are physical events in nature. Humans control changes: refrigerators slow spoilage; fertilisers speed growth.',
 real:'Refrigerating milk slows the change into curd.',
 apply:'Give a useful chemical change and a harmful chemical change from daily life.',
 see:{w:520,h:200,f:[
  ['Reversible: melting ⇄ freezing.',lbl(130,60,'ice ⇄ water','font-size="16"')+lbl(130,90,'reversible','fill="'+GN+'"')],
  ['Irreversible: wood → ash.',lbl(390,60,'wood → ash + smoke','font-size="16"')+lbl(390,90,'irreversible','fill="'+RD+'"')],
  ['Useful or harmful?',lbl(130,150,'useful: cooking, curd, digestion','fill="'+GN+'"')+lbl(390,150,'harmful: rusting, rotting','fill="'+RD+'"')]]},
 seeNote:'Two ways to classify a change.',
 do:{title:'Change chart',mat:'Chart paper',steps:['Make a 2×2 chart: reversible/irreversible × useful/harmful.','Place 12 everyday changes.'],obs:'Patterns.',why:'Classification.',lab:false},
 memo:'"Can I undo it? Do I want it?"',
 miscon:['"All physical changes are reversible." Breaking glass is not easily reversed.'],
 terms:['Reversible · उत्क्रमणीय','Irreversible · अनुत्क्रमणीय','Useful / harmful'],
 q:{q:'Which is irreversible?',o:['melting wax','dissolving sugar','cooking an egg','freezing water'],a:2,why:'Chemical.'},
 exam:'Classify changes: 2 marks.'},

{id:'g5',num:'5.5',title:'Rusting and its prevention · जंग लगना और उसकी रोकथाम',
 intro:'Why does an iron gate rust faster in the monsoon?',
 obj:'State the conditions for rusting and ways to prevent it.',
 prior:'Ch 4: metals react with oxygen.',
 simple:'Rusting (जंग लगना) is a chemical change in which iron reacts with oxygen (from air) and water (moisture) to form rust — a brown, flaky substance. Iron + oxygen + water → rust. Both air and water are needed. Rusting is faster in humid and coastal areas.',
 detail:'Experiment (3 test tubes): A — nail in tap water (air + water): rusts. B — nail in boiled water covered with oil (no air): no rust. C — nail with anhydrous calcium chloride (dry air, no water): no rust. Prevention: painting, oiling or greasing, galvanisation (coating with zinc), making stainless steel (iron mixed with chromium and nickel). Rust flakes off, so the iron below keeps rusting.',
 real:'Iron gates are painted before the monsoon; buckets are galvanised.',
 apply:'Why do ships rust faster than iron objects in Rewari?',
 see:{w:520,h:240,f:[
  ['A: air + water.',`<path d="M70 40 v130 a16 16 0 0 0 32 0 v-130" fill="#fff" stroke="${ink}"/><rect x="71" y="120" width="30" height="66" fill="#cfe8f7"/><line x1="86" y1="60" x2="86" y2="170" stroke="${RU}" stroke-width="6"/>`+lbl(86,215,'rusts','fill="'+RU+'"')],
  ['B: no air (boiled water + oil).',`<path d="M230 40 v130 a16 16 0 0 0 32 0 v-130" fill="#fff" stroke="${ink}"/><rect x="231" y="100" width="30" height="86" fill="#cfe8f7"/><rect x="231" y="92" width="30" height="10" fill="#e5c43a"/><line x1="246" y1="60" x2="246" y2="170" stroke="#8d969c" stroke-width="6"/>`+lbl(246,215,'no rust')],
  ['C: no water (dry with CaCl₂).',`<path d="M390 40 v130 a16 16 0 0 0 32 0 v-130" fill="#fff" stroke="${ink}"/><rect x="391" y="160" width="30" height="26" fill="#eee"/><line x1="406" y1="60" x2="406" y2="150" stroke="#8d969c" stroke-width="6"/>`+lbl(406,215,'no rust')]]},
 seeNote:'Rust needs both air and water.',
 do:{title:'Three tubes',mat:'3 nails, tubes, tap water, boiled water, oil, calcium chloride (teacher)',steps:['Set up A, B, C.','Observe for a week.'],obs:'Only A rusts.',why:'Needs air + water.',lab:true},
 memo:'"Iron + air + water = rust. Paint, oil, zinc stop it."',
 miscon:['"Rust is just dirt." It is a new substance (iron oxide).'],
 terms:['Rusting · जंग लगना','Galvanisation · यशदलेपन','Stainless steel'],
 q:{q:'Rusting needs:',o:['only air','only water','air and water','heat'],a:2,why:'Both.'},
 exam:'Conditions for rusting; prevention: 3 marks.'},

{id:'g6',num:'5.6',title:'Crystallisation · क्रिस्टलीकरण',
 intro:'How do we get big, beautiful crystals of salt or copper sulphate?',
 obj:'Describe crystallisation as a physical change to get pure crystals.',
 prior:'Dissolving; evaporation (Class 6).',
 simple:'Crystallisation (क्रिस्टलीकरण) gives large, pure crystals from a solution. Make a hot, saturated solution of copper sulphate (with a few drops of dilute sulphuric acid, by teacher), filter it, and let it cool slowly undisturbed. Blue crystals form. It is a physical change: copper sulphate remains copper sulphate.',
 detail:'Evaporating sea water gives salt crystals, but they are small and impure; crystallisation gives purer crystals. Alum (phitkari) and sugar can also be crystallised. Slow cooling gives bigger crystals. Crystals have regular shapes and flat faces.',
 real:'Mishri (sugar crystals) is made by slow crystallisation of sugar syrup.',
 apply:'Why should the solution be cooled slowly?',
 see:{w:520,h:220,f:[
  ['Hot saturated solution.',`<path d="M60 70 v90 a10 10 0 0 0 10 10 h80 a10 10 0 0 0 10 -10 v-90" fill="none" stroke="${ink}" stroke-width="2"/><rect x="62" y="100" width="96" height="68" fill="#4a90d9" opacity=".6"/>`+flame(110,215,0.7)],
  ['Filter and cool slowly.',`<path d="M260 70 v90 a10 10 0 0 0 10 10 h80 a10 10 0 0 0 10 -10 v-90" fill="none" stroke="${ink}" stroke-width="2"/><rect x="262" y="110" width="96" height="58" fill="#4a90d9" opacity=".35"/>`],
  ['Blue crystals form.',[0,1,2,3].map(k=>`<polygon points="${280+k*20},165 ${290+k*20},150 ${300+k*20},165 ${290+k*20},172" fill="#2a6fc0"/>`).join('')+lbl(420,120,'crystals · क्रिस्टल','font-weight="700"')]]},
 seeNote:'Physical change; pure crystals.',
 do:{title:'Grow alum crystals',mat:'Phitkari, warm water, thread, glass',steps:['Dissolve as much alum as possible in warm water.','Hang a thread in it; leave undisturbed for days.'],obs:'Crystals on the thread.',why:'Crystallisation.',lab:false},
 memo:'"Saturate, filter, cool slowly, crystals grow."',
 miscon:['"Crystallisation is chemical." It is physical.'],
 terms:['Crystallisation · क्रिस्टलीकरण','Saturated solution · संतृप्त विलयन','Crystal · क्रिस्टल'],
 q:{q:'Crystallisation is a:',o:['chemical change','physical change','neither','both'],a:1,why:'No new substance.'},
 exam:'Describe crystallisation: 3 marks.'}
];

const CARDS=[['Physical change','No new substance; often reversible.'],['Chemical change','New substance; usually irreversible.'],['Signs','Gas, colour, heat/light, smell, solid.'],['Baking soda + vinegar','CO₂ → lime water milky.'],['Iron + CuSO₄','Blue → green; brown copper on nail.'],['Burning Mg','White light; MgO ash.'],['Rusting','Iron + oxygen + water → rust.'],['Prevention','Paint, oil, galvanise (zinc), stainless steel.'],['Crystallisation','Pure crystals; physical.'],['Reversible?','Melting yes; burning no.']];

const Q=[
 {lv:1,q:'Physical change:',o:['burning','melting','rusting','cooking'],a:1,w:'State change.'},
 {lv:1,q:'Rust is formed from iron, water and:',o:['nitrogen','oxygen','carbon','salt'],a:1,w:'Oxygen.'},
 {lv:1,q:'Galvanisation coats iron with:',o:['copper','zinc','gold','paint'],a:1,w:'Zinc.'},
 {lv:2,q:'Baking soda + vinegar gives the gas:',o:['oxygen','carbon dioxide','hydrogen','nitrogen'],a:1,w:'CO₂.'},
 {lv:2,q:'Curdling of milk is:',o:['physical','chemical','reversible','none'],a:1,w:'New substance.'},
 {lv:2,q:'Crystallisation gives:',o:['impure powder','pure crystals','gas','rust'],a:1,w:'Pure crystals.'},
 {lv:3,q:'Nail in boiled water under oil does not rust because:',o:['no water','no air','no light','too cold'],a:1,w:'Oil blocks air.'},
 {lv:3,q:'Boiling water bubbles. This is:',o:['chemical','physical','rusting','burning'],a:1,w:'No new substance.'},
 {lv:4,q:'Iron nail in CuSO₄ solution: which shows a chemical change?',o:['nail gets wet','solution turns green and nail gets brown coat','solution cools','nothing'],a:1,w:'New substances.'},
 {lv:4,q:'Rusting is faster in Mumbai than in Rewari because of:',o:['more humidity','more sunlight','less air','more dust'],a:0,w:'Moisture.'},
 {lv:5,open:true,m:3,q:'Describe the three-test-tube experiment for conditions of rusting.',ans:['A: air + water — rusts (1)','B: boiled water + oil (no air) — no rust (1)','C: dry air with CaCl₂ (no water) — no rust; both needed (1)']},
 {lv:5,open:true,m:3,q:'Give three differences between physical and chemical changes.',ans:['No new substance vs new substance (1)','Usually reversible vs usually irreversible (1)','Chemical often shows gas/colour/heat signs (1)']}
];

const ONEMIN=['Physical: no new substance; often reversible.','Chemical: new substance; signs: gas, colour, heat/light, smell.','Baking soda + vinegar → CO₂.','Rusting: iron + oxygen + water.','Prevent rust: paint, oil, galvanise, stainless steel.','Crystallisation: pure crystals (physical).'];
const KEYS=[['physical',/physical|भौतिक/i],['chemical',/chemical|रासायनिक/i],['new substance',/new substance/i],['signs',/gas|colour|heat|smell/i],['rusting',/rust|जंग/i],['prevention',/paint|galvan|oil|zinc/i],['crystallisation',/crystal/i]];

/* ---------- lab ---------- */
const A={ice:['Melt an ice cube','p','It turns to water; no gas, no colour change. Freeze it again → ice.'],paper:['Burn paper','c','Heat, light, smoke and ash: new substances. Cannot reverse.'],salt:['Dissolve salt','p','Salt disappears from view, but evaporating the water gives the salt back.'],soda:['Vinegar + baking soda','c','Fizzing: carbon dioxide gas formed (turns lime water milky).'],egg:['Cook an egg','c','Runny egg becomes solid and white: new substances; cannot reverse.'],wax:['Melt wax','p','Liquid wax sets back to solid wax on cooling.'],milk:['Milk → curd','c','Taste, smell and texture change: new substances (lactic acid).'],tear:['Tear paper','p','Same paper, smaller pieces: no new substance.'],mg:['Burn magnesium','c','Dazzling light; white ash of magnesium oxide (basic).'],cuso4:['Iron nail in copper sulphate','c','Blue solution turns green; brown copper coats the nail.']};
let mode='cls',act='ice',done=false,day=0,seen={};
function drawCls(){const a=act;let s=T(230,26,A[a][0],'font-size="16" font-weight="700"');const d=done;
 const beaker=(c,h=60)=>`<path d="M170 110 v120 a12 12 0 0 0 12 12 h96 a12 12 0 0 0 12 -12 v-120" fill="none" stroke="${ink}" stroke-width="2"/><rect x="172" y="${242-h}" width="116" height="${h-2}" fill="${c}" opacity=".7"/>`;
 if(a==='ice')s+=d?`<path d="M190 225 q40 -16 80 0 q-40 18 -80 0z" fill="#8cc3da"/>`:`<rect x="205" y="160" width="50" height="50" rx="8" fill="#cfe8f7" stroke="${BL}"/>`;
 if(a==='paper')s+=d?`<path d="M190 220 q20 -10 40 0 q20 -6 40 0 v10 h-80z" fill="#555"/>`+flame(230,200,1.5)+`<path d="M230 130 q12 -12 0 -24 q-12 -12 0 -24" stroke="${GR}" fill="none" stroke-width="2"/>`:`<rect x="170" y="190" width="120" height="20" fill="#f4f0e6" stroke="${ink}"/>`;
 if(a==='salt')s+=beaker('#cfe8f7',90)+(d?'':[0,1,2,3,4].map(k=>`<rect x="${200+k*12}" y="${100}" width="6" height="6" fill="#fff" stroke="${ink}"/>`).join(''));
 if(a==='soda')s+=beaker('#f4f0e6',50)+(d?bubbles(230,230,14)+bubbles(210,200,8):'');
 if(a==='egg')s+=d?`<ellipse cx="230" cy="200" rx="70" ry="30" fill="#fff" stroke="${ink}"/><circle cx="230" cy="200" r="20" fill="#f2b632"/>`:`<ellipse cx="230" cy="200" rx="70" ry="30" fill="#f5f5dc" opacity=".5" stroke="${ink}"/><circle cx="230" cy="200" r="20" fill="#f2b632"/>`;
 if(a==='wax')s+=d?`<path d="M190 220 q40 -14 80 0 q-40 16 -80 0z" fill="#f7f0c8" stroke="${ink}"/>`:`<rect x="205" y="140" width="50" height="80" fill="#f7f0c8" stroke="${ink}"/>`;
 if(a==='milk')s+=beaker(d?'#f7f3e3':'#ffffff',80)+(d?T(230,200,'curd','font-size="14"'):'');
 if(a==='tear')s+=d?[0,1,2,3].map(k=>`<rect x="${170+k*32}" y="${190+(k%2)*12}" width="26" height="18" fill="#f4f0e6" stroke="${ink}" transform="rotate(${k*8-10} ${180+k*32} 200)"/>`).join(''):`<rect x="170" y="190" width="120" height="30" fill="#f4f0e6" stroke="${ink}"/>`;
 if(a==='mg')s+=d?`<circle cx="230" cy="170" r="50" fill="#fff6c2" opacity=".6"/><circle cx="230" cy="170" r="24" fill="#fff" stroke="#f7d14c" stroke-width="5"/>`:`<line x1="170" y1="220" x2="290" y2="140" stroke="#b5b9bd" stroke-width="5"/>`;
 if(a==='cuso4')s+=beaker(d?'#6aa86a':'#4a90d9',100)+`<line x1="230" y1="90" x2="230" y2="230" stroke="${d?RU:'#8d969c'}" stroke-width="7"/>`;
 if(!d)s+=T(230,290,'Press "Do it"','font-size="13" fill="#888"');
 $('#gSvg').innerHTML=s;$('#gDv').textContent=day}
function drawRust(){let s=T(230,24,'Rust race: 3 iron nails','font-size="16" font-weight="700"');const amt=day/7;
 const tubes=[['A: air + water',1,'#cfe8f7',false],['B: no air (oil)',0,'#cfe8f7',true],['C: no water (dry)',0,'#eee',false]];
 tubes.forEach(([n,r,c,oil],i)=>{const x=90+i*140;s+=`<path d="M${x-22} 50 v170 a22 22 0 0 0 44 0 v-170" fill="#fff" stroke="${ink}"/>`+(i<2?`<rect x="${x-21}" y="120" width="42" height="120" fill="${c}"/>`:`<rect x="${x-21}" y="205" width="42" height="35" fill="#eee"/>`)+(oil?`<rect x="${x-21}" y="110" width="42" height="12" fill="#e5c43a"/>`:'');
  const rc=r?`rgb(${Math.round(141+19*amt)},${Math.round(150-68*amt)},${Math.round(156-111*amt)})`:'#8d969c';s+=`<line x1="${x}" y1="70" x2="${x}" y2="${i===2?195:225}" stroke="${rc}" stroke-width="9"/>`;if(r&&day>=3)for(let k=0;k<day;k++)s+=`<circle cx="${x-6+(k*7)%12}" cy="${130+k*12}" r="3" fill="${RU}"/>`;s+=T(x,280,n,'font-size="12"')});
 $('#gSvg').innerHTML=s;$('#gDv').textContent=day;
 $('#gOut').innerHTML=day===0?'<p>Move the day slider to watch.</p>':day<3?'<p>Not much yet… rusting is slow.</p>':'<p class="fb ok">Only nail A (air + water) rusts. B (no air) and C (no water) stay grey. Rusting needs <b>both oxygen and water</b>.</p>'}
function draw(){mode==='cls'?drawCls():drawRust()}
function labShow(){draw();if(mode==='cls'&&!done)$('#gOut').innerHTML='<p>Choose an action and press Do it.</p>'}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='gD')labChange(e.target)})}
function labClick(b){if(b.id==='gDo'){mode='cls';$('#gMode').value='cls';done=true;drawCls();$('#gOut').innerHTML='<p>Look for signs. Is a new substance formed? Choose Physical or Chemical.</p>';return true}
 if(b.dataset&&b.dataset.g){if(mode!=='cls'||!done){$('#gOut').innerHTML='<p>First press Do it.</p>';return true}const ok=b.dataset.g===A[act][1];seen[act]=ok;const n=Object.keys(seen).length,c=Object.values(seen).filter(Boolean).length;
  $('#gOut').innerHTML=`<p class="fb ${ok?'ok':'no'}">${ok?'Correct':'Not quite'} — ${A[act][1]==='p'?'physical':'chemical'} change. ${A[act][2]}</p><p class="note">Score: ${c}/${n} of 10 actions.</p>`;return true}return false}
function labChange(t){if(t.id==='gMode'){mode=t.value;draw();if(mode==='cls')$('#gOut').innerHTML='<p>Choose an action and press Do it.</p>';return true}if(t.id==='gAct'){act=t.value;done=false;mode='cls';$('#gMode').value='cls';drawCls();$('#gOut').innerHTML='<p>Press Do it.</p>';return true}if(t.id==='gD'){day=+t.value;mode='rust';$('#gMode').value='rust';drawRust();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
