/* Rai Plus content pack: Class 8 Science (Curiosity), Chapter 9 – The Amazing World of Solutes, Solvents, and Solutions. */
RP.register({key:'8sci09',cls:'8',subject:'Science',ch:'9',title:"The Amazing World of Solutes, Solvents, and Solutions",color:'#0f6e7a',
crumb:"Class 8 Science · Curiosity",h1:"Chapter 9: The Amazing World of Solutes, Solvents, and Solutions",sub:"Solute, solvent and solution, water as a universal solvent, saturated solutions and solubility, effect of temperature, concentration, gases in liquids, and density.",heroLabel:"Sugar dissolving in a glass of water",labName:'Dissolving and density lab',
theme:"\n:root{--g:light-dark(#0f6e7a,#86d0da);--g2:light-dark(#e6f4f6,#071618);--line:light-dark(#c6e3e7,#1d3d42);--bg:light-dark(#ffffff,#061012);--card:light-dark(#ffffff,#0b1719);\n--ink:light-dark(#0a2226,#dff0f2);--mute:light-dark(#46636a,#a6c4c9);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#0b555e}\n",
labHTML:`  <h2>Dissolving and density lab</h2>
  <p>Dissolve mode: add spoonfuls of salt or sugar to 100 mL of water at different temperatures. When no more dissolves, the solution is saturated. Egg mode: add salt to water and watch when the egg floats. (Values are rounded for learning.)</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="sSvg" viewBox="0 0 460 320" role="img" aria-label="Beaker" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="sM"><option value="d">Dissolve until saturated</option><option value="e">Floating egg</option></select></label></div>
  <div class="ctrl" id="sDc"><label>Solute<select id="sSo"><option value="salt">Common salt</option><option value="sugar">Sugar</option></select></label> <label>Water temperature (°C): <b id="sTv"></b><input type="range" class="sS" id="sT" min="10" max="90" step="10" value="30"></label></div>
  <div class="ctrl"><button class="btn" id="sAdd">Add 10 g</button> <button class="btn" id="sRe">Empty and refill</button></div>
  <div class="box y" id="sOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#0f6e7a',LABNAME='Dissolving and density lab',MIND_CENTER='Solutions';
const TL='#0f6e7a',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
function beaker(x,y,w,h,fill=BL,op=.2){return `<path d="M${x} ${y} V${y+h} H${x+w} V${y}" fill="none" stroke="${ink}" stroke-width="2.5"/><rect x="${x+2}" y="${y+h*.25}" width="${w-4}" height="${h*.75-2}" fill="${fill}" opacity="${op}"/>`}
function heroDraw(){return `<path d="M150 40 V140 H230 V40" fill="none" stroke="#fff" stroke-width="3"/>`+[0,1,2,3,4,5].map(k=>`<circle cx="${165+k*11}" cy="${60+k*13}" r="3" fill="#fff"/>`).join('')}
const HERO=heroDraw;
const MIND=[['Solute & solvent',100,50],['Universal solvent',420,50],['Saturated solutions',90,150],['Temperature & solubility',430,150],['Concentration',110,250],['Gases & density',410,250]];

const C=[
{id:'s1',num:'9.1',title:'Solute, solvent and solution',
 intro:'Stir sugar into nimbu-paani. The sugar vanishes but the drink tastes sweet. What has formed?',
 obj:'Define solute, solvent and solution with examples.',
 prior:'Ch 7 particles; Ch 8 mixtures.',
 simple:'A solution is a homogeneous mixture of two or more substances. The substance that dissolves is the solute (sugar, salt); the substance in which it dissolves is the solvent (usually water); together they make the solution. Solute particles spread evenly between solvent particles, so the solution looks the same throughout and the solute does not settle.',
 detail:'Soluble substances dissolve (salt, sugar, copper sulphate); insoluble ones do not (sand, chalk, oil in water). Solutions can be solid (alloys like brass), liquid (salt water, soda) or gas (air). Solutions are clear and particles pass through filter paper; in a suspension (chalk in water) particles are visible and settle.',
 real:'ORS (oral rehydration solution) is salt and sugar dissolved in clean water — it saves lives in diarrhoea.',
 apply:'Name the solute and solvent in: tea with sugar, salt water, soda water.',
 see:{w:520,h:220,f:[
  ['Solvent: water.',beaker(40,40,110,140)+lbl(95,200,'solvent (water)')],
  ['Solute: sugar.',`<rect x="210" y="120" width="30" height="30" fill="#f5f5f5" stroke="${ink}"/>`+lbl(225,175,'solute (sugar)')],
  ['Solution: evenly mixed.',beaker(320,40,110,140,TL,.25)+[...Array(16)].map((_,k)=>`<circle cx="${330+(k*29)%90}" cy="${80+(k*17)%90}" r="2.5" fill="#e6a700"/>`).join('')+lbl(375,200,'solution')]]},
 seeNote:'Solute + solvent = solution.',
 do:{title:'Soluble or not?',mat:'Glasses of water; salt, sugar, sand, chalk, oil',steps:['Stir each into water.','Wait 5 minutes and observe.'],obs:'Salt, sugar dissolve; others don\'t.',why:'Solubility.',lab:false},
 memo:'"Solute goes in, solvent takes it in."',
 miscon:['"Dissolving is the same as melting." Melting needs heat and no solvent.'],
 terms:['Solute · विलेय','Solvent · विलायक','Solution · विलयन','Soluble · घुलनशील','Insoluble · अघुलनशील'],
 q:{q:'In salt water, the solvent is:',o:['salt','water','both','neither'],a:1,why:'Water dissolves salt.'},
 exam:'Define with examples: 2 marks.'},

{id:'s2',num:'9.2',title:'Water: the universal solvent',
 intro:'Why do rivers carry minerals, our blood carry nutrients, and plants absorb food from the soil — all with water?',
 obj:'Explain why water is called the universal solvent and name other solvents.',
 prior:'9.1.',
 simple:'Water dissolves more substances than any other common liquid, so it is called the universal solvent. This is why water carries dissolved minerals in rivers, nutrients in plant sap and blood, and oxygen for fish. But some substances don\'t dissolve in water — oil, grease, paint, nail polish. For these we use other solvents: kerosene, turpentine, acetone, alcohol.',
 detail:'Because water dissolves so much, pure water is rare in nature; even rainwater dissolves gases from air. Hard water contains dissolved calcium and magnesium salts, which make it hard to form lather with soap. Soap and detergent help oil mix with water.',
 real:'Painters clean brushes with turpentine; nail polish is removed with acetone.',
 apply:'Why can\'t you wash an oily pan with water alone?',
 see:{w:520,h:220,f:[
  ['Water dissolves salt, sugar, minerals, oxygen.',box(30,40,200,60,'Water',BL,'salt · sugar · minerals · O₂')],
  ['Not oil or paint.',box(290,40,200,60,'Other solvents',OR,'kerosene · turpentine · acetone')],
  ['Universal solvent.',lbl(260,160,'water dissolves more substances than any other common liquid','font-size="13" font-weight="700"')]]},
 seeNote:'Water dissolves the most.',
 do:{title:'Oil vs water',mat:'Water, oil, soap',steps:['Mix oil and water; shake; wait.','Add soap and shake again.'],obs:'Oil separates; soap helps mix.',why:'Oil insoluble in water.',lab:false},
 memo:'"Water dissolves almost everything — but not grease."',
 miscon:['"Water dissolves everything." Oil and many plastics don\'t dissolve.'],
 terms:['Universal solvent · सार्वत्रिक विलायक','Hard water · कठोर जल','Turpentine'],
 q:{q:'Which dissolves nail polish?',o:['water','acetone','salt water','milk'],a:1,why:'Organic solvent.'},
 exam:'Universal solvent: 2 marks.'},

{id:'s3',num:'9.3',title:'Saturated solutions and solubility',
 intro:'Keep adding salt to a glass of water. Will it ever stop dissolving?',
 obj:'Define saturated and unsaturated solutions and solubility.',
 prior:'9.1.',
 simple:'A solution in which more solute can still dissolve is unsaturated. When no more solute can dissolve at that temperature, the solution is saturated — extra solute settles at the bottom. Solubility is the maximum amount of a solute that can dissolve in 100 g of water at a given temperature.',
 detail:'Different substances have different solubilities. At about 30 °C, roughly 36 g of common salt or about 220 g of sugar dissolve in 100 g of water — sugar is far more soluble. A supersaturated solution holds more than normal (made by cooling a hot saturated solution carefully); disturbing it makes crystals form.',
 real:'Making sugar syrup for gulab jamun uses lots of sugar dissolved in hot water.',
 apply:'You add salt to water until some stays undissolved. What kind of solution is it?',
 see:{w:520,h:220,f:[
  ['Unsaturated: dissolves fully.',beaker(40,40,110,140,TL,.2)+lbl(95,200,'unsaturated')],
  ['Add more…',`<path d="M210 100 h50" stroke="${GR}" stroke-width="3"/><path d="M260 100 l-10 -6 v12z" fill="${GR}"/>`],
  ['Saturated: extra settles.',beaker(310,40,110,140,TL,.35)+[...Array(10)].map((_,k)=>`<rect x="${318+k*9}" y="170" width="7" height="7" fill="#f5f5f5" stroke="${GR}"/>`).join('')+lbl(365,200,'saturated')]]},
 seeNote:'Saturated = no more dissolves.',
 do:{title:'Spoon count',mat:'Glass of water, salt, spoon',steps:['Add one level spoon at a time, stirring.','Stop when salt remains.'],obs:'About 9–10 spoons in 100 mL.',why:'Solubility limit.',lab:true},
 memo:'"Saturated: full up."',
 miscon:['"Stirring more makes unlimited salt dissolve." There is a limit at each temperature.'],
 terms:['Saturated · संतृप्त','Unsaturated · असंतृप्त','Solubility · विलेयता'],
 q:{q:'A saturated solution:',o:['can dissolve more solute','cannot dissolve more at that temperature','has no solute','is always hot'],a:1,why:'Definition.'},
 exam:'Saturated vs unsaturated: 2 marks.'},

{id:'s4',num:'9.4',title:'Temperature and solubility',
 intro:'Why does sugar dissolve faster and more in hot tea than in iced tea?',
 obj:'Describe the effect of temperature, stirring and particle size on dissolving.',
 prior:'9.3; Ch 7 particle motion.',
 simple:'For most solids, solubility increases with temperature: hot water dissolves more sugar than cold water. Sugar\'s solubility rises a lot; salt\'s rises only a little. Dissolving is also faster with stirring and with powdered (smaller) particles, because particles meet the solvent more quickly — though these don\'t change how much can dissolve.',
 detail:'If a hot saturated solution is cooled, the extra solute comes out as crystals — crystallisation. This is how salt is purified and how sugar crystals (mishri) are made. Gases behave the opposite way: they dissolve less in warm water.',
 real:'Mishri is made by cooling a hot, concentrated sugar solution slowly.',
 apply:'Why do crystals form when a hot saturated copper sulphate solution cools?',
 see:{w:520,h:240,f:[
  ['Solubility vs temperature (rounded).',`<line x1="60" y1="200" x2="460" y2="200" stroke="${ink}"/><line x1="60" y1="200" x2="60" y2="30" stroke="${ink}"/>`+lbl(260,225,'temperature →')+lbl(40,110,'g / 100 g','font-size="10"')],
  ['Sugar rises steeply.',`<polyline points="60,${200-180*.4} 160,${200-200*.4} 260,${200-240*.4} 360,${200-290*.4} 460,${200-360*.4}" fill="none" stroke="${OR}" stroke-width="3"/>`+lbl(430,40,'sugar','fill="'+OR+'"')],
  ['Salt rises only a little.',`<polyline points="60,${200-35*1.5} 460,${200-40*1.5}" fill="none" stroke="${BL}" stroke-width="3"/>`+lbl(430,125,'salt','fill="'+BL+'"')]]},
 seeNote:'Hot water dissolves more (for most solids).',
 do:{title:'Hot vs cold',mat:'Hot and cold water, sugar cubes',steps:['Drop a sugar cube in each; don\'t stir.','Time how long they take.'],obs:'Hot is faster.',why:'Particles move faster.',lab:true},
 memo:'"Heat helps solids dissolve; stir and crush to speed it up."',
 miscon:['"Stirring increases solubility." It only speeds dissolving.'],
 terms:['Crystallisation · क्रिस्टलीकरण','Rate of dissolving · घुलने की दर'],
 q:{q:'Crushing sugar before adding it to water:',o:['increases solubility','makes it dissolve faster','stops dissolving','makes it insoluble'],a:1,why:'More surface.'},
 exam:'Factors affecting dissolving: 3 marks.'},

{id:'s5',num:'9.5',title:'Concentration of a solution',
 intro:'Two glasses of sharbat — one tastes much sweeter. How can we describe the difference with numbers?',
 obj:'Describe dilute and concentrated solutions and calculate simple concentration.',
 prior:'9.3.',
 simple:'Concentration tells how much solute is present in a given amount of solution. A dilute solution has little solute; a concentrated solution has a lot. Concentration (by mass) = mass of solute ÷ mass of solution × 100%. 10 g salt in 90 g water → 10 ÷ 100 × 100 = 10% solution.',
 detail:'Adding more solvent dilutes a solution (the amount of solute stays the same). Medicines, ORS and fertiliser sprays must be made at the right concentration. Concentration can also be written as mass of solute per volume, e.g. grams per litre.',
 real:'WHO ORS: about 2.6 g salt and 13.5 g glucose in 1 litre of water.',
 apply:'25 g of sugar is dissolved in 225 g of water. Find the concentration by mass.',
 see:{w:520,h:220,f:[
  ['Dilute: few solute particles.',beaker(60,40,110,140,TL,.15)+[...Array(5)].map((_,k)=>`<circle cx="${80+k*15}" cy="${110+(k%2)*20}" r="4" fill="${OR}"/>`).join('')+lbl(115,200,'dilute')],
  ['Concentrated: many.',beaker(300,40,110,140,TL,.3)+[...Array(28)].map((_,k)=>`<circle cx="${310+(k*29)%90}" cy="${80+(k*17)%90}" r="4" fill="${OR}"/>`).join('')+lbl(355,200,'concentrated')],
  ['% = solute ÷ solution × 100.',lbl(260,25,'concentration = solute ÷ solution × 100%','font-size="14" font-weight="700"')]]},
 seeNote:'More solute per amount → more concentrated.',
 do:{title:'Colour strength',mat:'Food colour, 3 glasses',steps:['Make solutions with 1, 3 and 6 drops in equal water.'],obs:'Darker = more concentrated.',why:'Concentration.',lab:false},
 memo:'"Solute over solution, times 100."',
 miscon:['"Concentration = mass of solute ÷ mass of solvent." Divide by the whole solution.'],
 terms:['Concentration · सांद्रता','Dilute · तनु','Concentrated · सांद्र'],
 q:{q:'20 g salt in 80 g water gives concentration:',o:['25%','20%','80%','16%'],a:1,why:'20 ÷ 100.'},
 exam:'Concentration numericals: 2–3 marks.'},

{id:'s6',num:'9.6',title:'Gases in liquids, and density',
 intro:'Why does a cold soda fizz less than a warm one — and why does an egg float in very salty water?',
 obj:'Explain dissolved gases, and how dissolving changes density.',
 prior:'9.4, 9.5.',
 simple:'Gases dissolve in liquids too: oxygen dissolved in water lets fish breathe; carbon dioxide is dissolved under pressure in soda. Gases dissolve more in cold water and less in warm water — so warm soda goes flat faster, and fish suffer in warm, polluted water. Dissolving salt makes water denser (more mass in the same volume). Density = mass ÷ volume. An egg sinks in tap water but floats in strong salt water.',
 detail:'Opening a soda bottle lowers pressure, so CO₂ bubbles out. Objects float in a liquid if they are less dense than it. People float easily in the Dead Sea because its water is very salty and dense. Hot industrial water released into rivers lowers dissolved oxygen.',
 real:'Aquarium pumps bubble air into water to keep enough dissolved oxygen for fish.',
 apply:'Why do fish die when warm waste water from factories is released into a river?',
 see:{w:520,h:220,f:[
  ['Tap water: egg sinks.',beaker(60,40,110,140,BL,.15)+`<ellipse cx="115" cy="160" rx="16" ry="20" fill="#f6e8c8" stroke="${GR}"/>`+lbl(115,200,'tap water')],
  ['Salt water: egg floats.',beaker(300,40,110,140,TL,.35)+`<ellipse cx="355" cy="85" rx="16" ry="20" fill="#f6e8c8" stroke="${GR}"/>`+lbl(355,200,'strong salt water')],
  ['Denser liquid → floats.',lbl(260,25,'density = mass ÷ volume','font-size="14" font-weight="700"')]]},
 seeNote:'Salt raises density.',
 do:{title:'Floating egg',mat:'Egg, glass of water, salt',steps:['Put the egg in water.','Add salt spoon by spoon, stirring gently.'],obs:'Egg rises and floats.',why:'Density increases.',lab:true},
 memo:'"Cold holds gas; salt holds up eggs."',
 miscon:['"Hot water holds more gas, like solids." Gases dissolve less in hot water.'],
 terms:['Dissolved oxygen · घुलित ऑक्सीजन','Density · घनत्व','Carbonated drink'],
 q:{q:'Gases dissolve more in:',o:['hot water','cold water','boiling water','neither'],a:1,why:'Opposite of most solids.'},
 exam:'Dissolved gases; density: 2–3 marks.'}
];

const CARDS=[['Solution','Homogeneous mixture: solute + solvent.'],['Solute','Substance that dissolves.'],['Solvent','Substance that dissolves the solute.'],['Universal solvent','Water dissolves the most substances.'],['Saturated','No more solute dissolves.'],['Solubility','Max g per 100 g water at a temperature.'],['Temperature','Solids: more soluble when hot (mostly).'],['Concentration','Solute ÷ solution × 100%.'],['Gases','Dissolve more in cold water.'],['Density','Mass ÷ volume; salt water is denser.']];

const Q=[
 {lv:1,q:'In sugar solution, sugar is the:',o:['solvent','solute','solution','suspension'],a:1,w:'Dissolves.'},
 {lv:1,q:'Water is called the universal solvent because:',o:['it is cheap','it dissolves many substances','it is clear','it boils at 100 °C'],a:1,w:'Dissolves most.'},
 {lv:1,q:'Which does not dissolve in water?',o:['salt','sugar','oil','copper sulphate'],a:2,w:'Insoluble.'},
 {lv:2,q:'A solution that can dissolve no more solute is:',o:['dilute','saturated','unsaturated','suspension'],a:1,w:'Saturated.'},
 {lv:2,q:'15 g salt in 135 g water: concentration',o:['10%','15%','11%','90%'],a:0,w:'15 ÷ 150.'},
 {lv:2,q:'Stirring:',o:['increases solubility','speeds dissolving','stops dissolving','makes solution saturated'],a:1,w:'Rate only.'},
 {lv:3,q:'Hot saturated solution cooled forms crystals because:',o:['solubility decreases on cooling','water evaporates instantly','solute melts','pressure rises'],a:0,w:'Crystallisation.'},
 {lv:3,q:'An egg floats in strong salt water because:',o:['egg gets lighter','salt water is denser','salt enters the egg','water is warm'],a:1,w:'Density.'},
 {lv:4,q:'Warm soda goes flat faster because:',o:['gases dissolve less when warm','sugar evaporates','CO₂ dissolves more','bottle expands'],a:0,w:'Gas solubility.'},
 {lv:4,q:'At ~30 °C, which dissolves more in 100 g water?',o:['salt','sugar','same','neither'],a:1,w:'Sugar far more soluble.'},
 {lv:5,open:true,m:3,q:'Describe how you would make a saturated salt solution and show it is saturated.',ans:['Add salt to 100 mL water spoon by spoon, stirring (1)','Continue until some salt stays undissolved (1)','Undissolved salt at bottom shows no more can dissolve at that temperature (1)']},
 {lv:5,open:true,m:3,q:'Why do fish find it harder to survive in warm water?',ans:['Fish use oxygen dissolved in water (1)','Gases dissolve less in warm water (1)','So warm water has less oxygen; pollution/hot discharge worsens it (1)']}
];

const ONEMIN=['Solute + solvent = solution.','Water: universal solvent.','Saturated solutions; solubility.','Temperature, stirring, particle size.','Concentration (%).','Gases dissolve more in cold; density.'];
const KEYS=[['solute/solvent',/solute|solvent/i],['universal',/universal/i],['saturated',/saturat/i],['temperature',/temperature|hot|cold/i],['concentration',/concentrat/i],['density',/densit|float/i]];

/* ---------- lab ---------- */
let mode='d',solute='salt',temp=30,added=0,wired=false;
const solub=()=>solute==='salt'?35+temp*.045:180+temp*2.1;
function draw(){$('#sTv').textContent=temp;$('#sDc').style.display=mode==='d'?'':'none';let s='';
 if(mode==='d'){const S=solub(),dis=Math.min(added,S),extra=Math.max(0,added-S);s+=beaker(150,40,160,230,TL,.15+Math.min(.35,dis/600));
  for(let k=0;k<Math.min(60,Math.round(dis/(solute==='salt'?1:5)));k++)s+=`<circle cx="${160+(k*37)%140}" cy="${110+(k*23)%150}" r="2.5" fill="${solute==='salt'?'#fff':'#e6a700'}" stroke="${GR}" stroke-width=".4"/>`;
  for(let k=0;k<Math.min(40,Math.ceil(extra/(solute==='salt'?2:10)));k++)s+=`<rect x="${158+(k*13)%145}" y="${258-Math.floor(k/11)*7}" width="8" height="7" fill="#f5f5f5" stroke="${GR}"/>`;
  s+=T(230,25,`${added} g ${solute} in 100 g water at ${temp} °C`,'font-size="13" font-weight="700"')+T(390,120,`dissolved: ${Math.round(dis)} g`,'font-size="12"')+T(390,145,`undissolved: ${Math.round(extra)} g`,'font-size="12" fill="'+(extra?OR:GR)+'"')+T(390,180,extra?'SATURATED':'unsaturated','font-size="14" font-weight="700" fill="'+(extra?OR:GN)+'"');
  $('#sSvg').innerHTML=s;$('#sOut').innerHTML=extra?`<p class="fb ok">Saturated! About ${Math.round(S)} g of ${solute} dissolves in 100 g of water at ${temp} °C; the extra ${Math.round(extra)} g settles. Raise the temperature to see if more dissolves.</p>`:`<p>Unsaturated — all ${added} g dissolved. Keep adding. ${added?`Concentration ≈ ${Math.round(100*added/(100+added))}%.`:''}</p>`}
 else{const conc=added/(100+added);const rho=1+conc*.72;const egg=1.07;const top=72,bot=250;const ey=rho>=egg+.05?top+25:rho>=egg?(top+bot)/2:bot-22;
  s+=beaker(150,20,160,260,TL,.12+Math.min(.4,conc*1.2))+`<ellipse cx="230" cy="${ey}" rx="22" ry="28" fill="#f6e8c8" stroke="${GR}" stroke-width="1.5"/>`+T(390,120,`salt added: ${added} g`,'font-size="12"')+T(390,145,`density ≈ ${rho.toFixed(3)} g/mL`,'font-size="12"')+T(390,180,ey<200?(ey<100?'FLOATS':'hovers'):'sinks','font-size="15" font-weight="700" fill="'+(ey<200?GN:OR)+'"');
  $('#sSvg').innerHTML=s;$('#sOut').innerHTML=ey>=200?'<p>The egg is denser than the water, so it sinks. Add salt to make the water denser.</p>':ey>100?'<p>The water\'s density now nearly equals the egg\'s — it hovers in the middle!</p>':'<p class="fb ok">The salt water is now denser than the egg, so the egg floats.</p>'}}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='sT'){temp=+e.target.value;draw()}})}
function labClick(b){if(b.id==='sAdd'){added+=10;draw();return true}if(b.id==='sRe'){added=0;draw();return true}return false}
function labChange(t){if(t.id==='sM'){mode=t.value;added=0;draw();return true}if(t.id==='sSo'){solute=t.value;added=0;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
