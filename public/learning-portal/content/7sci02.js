/* Rai Plus content pack: Class 7 Science (Curiosity), Chapter 2 – Exploring Substances: Acidic, Basic, and Neutral. Bilingual terms. */
RP.register({key:'7sci02',cls:'7',subject:'Science',ch:'2',title:"Exploring Substances: Acidic, Basic, and Neutral",color:'#b0306a',
crumb:"Class 7 Science · Curiosity · पदार्थों की खोज: अम्लीय, क्षारकीय और उदासीन",h1:"Chapter 2: Exploring Substances — Acidic, Basic and Neutral",sub:"अम्ल, क्षारक और उदासीन पदार्थ. Testing with indicators, natural indicators, neutralisation and its everyday uses.",heroLabel:"Test tubes turning pink, green and yellow with indicators",labName:'Indicator lab',
theme:"\n:root{--g:light-dark(#b0306a,#f2a3c6);--g2:light-dark(#fbe9f1,#230b17);--line:light-dark(#f0cfdf,#4a2236);--bg:light-dark(#ffffff,#13080e);--card:light-dark(#ffffff,#1b0c14);\n--ink:light-dark(#260b18,#f6e4ed);--mute:light-dark(#6e4a5b,#cfaabb);--y:light-dark(#2f6f8a,#8cc3da);--y2:light-dark(#e6f2f7,#0c1d25);--hd:#871f4f}\n",
labHTML:`  <h2>Indicator lab · सूचक प्रयोगशाला</h2>
  <p><b>Test mode:</b> pick a substance and an indicator. <b>Mystery mode:</b> identify an unknown using as few tests as possible. <b>Neutralise:</b> add drops of base to acid until it turns neutral.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="xSvg" viewBox="0 0 460 320" role="img" aria-label="Test tubes with indicators" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="xMode"><option value="test">Test a substance</option><option value="myst">Mystery solution</option><option value="neut">Neutralise an acid</option></select></label></div>
  <div class="ctrl"><label>Substance<select id="xSub"><option value="lemon">Lemon juice</option><option value="vinegar">Vinegar</option><option value="curd">Curd (dahi) water</option><option value="tamarind">Tamarind (imli) water</option><option value="soda">Baking soda solution</option><option value="soap">Soap solution</option><option value="lime">Lime water</option><option value="antacid">Antacid (milk of magnesia)</option><option value="sugar">Sugar solution</option><option value="salt">Salt solution</option><option value="water">Tap water</option></select></label></div>
  <div class="ctrl" style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn" data-ind="rl">Red litmus</button><button class="btn" data-ind="bl">Blue litmus</button><button class="btn" data-ind="tu">Turmeric</button><button class="btn" data-ind="cr">China rose</button></div>
  <div class="ctrl" style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn" id="xNew">New mystery</button><button class="btn" data-guess="acid">It's acidic</button><button class="btn" data-guess="base">It's basic</button><button class="btn" data-guess="neutral">It's neutral</button></div>
  <div class="ctrl" style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn" id="xDrop">Add 1 drop of base</button><button class="btn" id="xDrop5">Add 5 drops</button><button class="btn" id="xNReset">Start again</button></div>
  <div class="box y" id="xOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#b0306a',LABNAME='Indicator lab',MIND_CENTER='Acids & bases · अम्ल और क्षारक';
const MG='#b0306a',GN='#3b8a3b',YE='#e5b93a',RD='#d24a4a',BLU='#4a78c8',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
// indicator colours: [acid, neutral, base]
const IND={rl:{n:'Red litmus · लाल लिटमस',c:['#d65a5a','#d65a5a','#4a78c8']},bl:{n:'Blue litmus · नीला लिटमस',c:['#d65a5a','#4a78c8','#4a78c8']},tu:{n:'Turmeric · हल्दी',c:['#e5b93a','#e5b93a','#c0392b']},cr:{n:'China rose · गुड़हल',c:['#c2185b','#b58aa8','#3b8a3b']}};
const SUB={lemon:['Lemon juice',0,'citric acid'],vinegar:['Vinegar',0,'acetic acid'],curd:['Curd water',0,'lactic acid'],tamarind:['Tamarind water',0,'tartaric acid'],soda:['Baking soda solution',2,'sodium hydrogen carbonate'],soap:['Soap solution',2,''],lime:['Lime water',2,'calcium hydroxide'],antacid:['Antacid',2,'magnesium hydroxide'],sugar:['Sugar solution',1,''],salt:['Salt solution',1,''],water:['Tap water',1,'']};
const tube=(x,y,c,h=110,label='')=>`<path d="M${x-16} ${y} v${h} a16 16 0 0 0 32 0 v-${h}" fill="#fff" stroke="${ink}" stroke-width="1.5"/><path d="M${x-15} ${y+h*0.35} v${h*0.65} a15 15 0 0 0 30 0 v-${h*0.65}z" fill="${c}" opacity=".85"/>`+(label?T(x,y+h+38,label,'font-size="11"'):'');
const strip=(x,y,c,top)=>`<rect x="${x-6}" y="${y}" width="12" height="70" fill="${top}" stroke="${ink}" stroke-width=".6"/><rect x="${x-6}" y="${y+40}" width="12" height="30" fill="${c}"/>`;
function heroDraw(){return [['#c2185b',60],['#3b8a3b',120],['#e5b93a',180],['#c0392b',240]].map(([c,x])=>`<path d="M${x-12} 30 v70 a12 12 0 0 0 24 0 v-70" fill="none" stroke="#fff" stroke-width="2"/><path d="M${x-11} 60 v40 a11 11 0 0 0 22 0 v-40z" fill="${c}"/>`).join('')}
const HERO=heroDraw;
const MIND=[['Taste is not a test',100,50],['Indicators',420,50],['Litmus',90,150],['Natural indicators',430,150],['Neutralisation',110,250],['Uses in daily life',410,250]];

const C=[
{id:'x1',num:'2.1',title:'Sour, bitter and soapy · खट्टा, कड़वा और साबुन जैसा',
 intro:'Lemon and imli taste sour; soap feels slippery. Is there a safer way to sort substances than tasting?',
 obj:'Classify substances as acidic, basic or neutral, and know why tasting is unsafe.',
 prior:'Materials around us (Class 6 Ch 6).',
 simple:'Substances that taste sour are usually acidic (अम्लीय), e.g. lemon juice, vinegar, curd, tamarind, amla. Substances that taste bitter and feel soapy are usually basic (क्षारकीय), e.g. baking soda, soap, lime water. Substances that are neither are neutral (उदासीन), e.g. pure water, sugar solution, salt solution. But we must NEVER taste or touch unknown substances — many are harmful.',
 detail:'Acids in foods: citric acid (lemon, orange), acetic acid (vinegar), lactic acid (curd), tartaric acid (tamarind, grapes), ascorbic acid (amla — vitamin C). Strong acids and bases in laboratories (like hydrochloric acid or caustic soda) can burn skin and eyes. So scientists use indicators to test safely.',
 real:'Kitchen: imli chutney is sour (acidic); a pinch of baking soda (basic) is added to pakora batter.',
 apply:'Name two acidic and two basic substances in your kitchen.',
 see:{w:520,h:220,f:[
  ['Sour things: acidic.',[['lemon','#e8d44a'],['imli','#8a5a2a'],['curd','#f4f0e6']].map(([n,c],i)=>`<circle cx="${70+i*70}" cy="90" r="24" fill="${c}" stroke="${ink}"/>`+lbl(70+i*70,135,n)).join('')+lbl(140,40,'acidic · अम्लीय','fill="'+MG+'" font-weight="700"')],
  ['Bitter and soapy: basic.',[['soap','#b8e0f0'],['soda','#ffffff'],['lime water','#eef']].map(([n,c],i)=>`<rect x="${300+i*70}" y="68" width="44" height="44" rx="6" fill="${c}" stroke="${ink}"/>`+lbl(322+i*70,135,n)).join('')+lbl(390,40,'basic · क्षारकीय','fill="'+GN+'" font-weight="700"')],
  ['Never taste unknown substances!',`<circle cx="260" cy="185" r="18" fill="none" stroke="${RD}" stroke-width="3"/><line x1="247" y1="172" x2="273" y2="198" stroke="${RD}" stroke-width="3"/>`+lbl(380,190,'use indicators instead','font-weight="700"')]]},
 seeNote:'Taste is not a safe test.',
 do:{title:'Kitchen sort',mat:'List of kitchen items',steps:['List 10 foods and cleaning items.','Guess acidic, basic or neutral.','Check later with indicators.'],obs:'Many sour foods are acidic.',why:'Acids taste sour.',lab:false},
 memo:'"Sour = acid, soapy = base, neither = neutral."',
 miscon:['"All acids are dangerous." Many food acids are safe to eat; lab acids can be harmful.'],
 terms:['Acid · अम्ल','Base · क्षारक','Neutral · उदासीन','Citric acid','Lactic acid'],
 q:{q:'Curd tastes sour because it contains:',o:['citric acid','lactic acid','acetic acid','baking soda'],a:1,why:'Lactic acid.'},
 exam:'Name acids present in foods: 2 marks.'},

{id:'x2',num:'2.2',title:'Indicators and litmus · सूचक और लिटमस',
 intro:'How can a strip of paper tell you whether a liquid is an acid?',
 obj:'Use litmus to test for acids and bases.',
 prior:'2.1.',
 simple:'An indicator (सूचक) is a substance that shows a different colour in acidic and basic solutions. Litmus is a natural indicator obtained from lichens. Acids turn blue litmus red. Bases turn red litmus blue. Neutral substances do not change the colour of either litmus.',
 detail:'Litmus is available as a solution or as paper strips (red and blue). Use a clean dropper or stirrer for each test so solutions do not mix. Record results in a table: substance, effect on red litmus, effect on blue litmus, conclusion.',
 real:'Lab technicians use litmus paper to quickly check if water is acidic.',
 apply:'A solution turns red litmus blue. Is it acidic or basic?',
 see:{w:520,h:230,f:[
  ['Acid: blue litmus turns red.',strip(80,40,'#d65a5a','#4a78c8')+tube(150,40,'#f6efb0',110,'lemon juice')+lbl(115,218,'blue → red','fill="'+RD+'"')],
  ['Base: red litmus turns blue.',strip(260,40,'#4a78c8','#d65a5a')+tube(330,40,'#e8f4fb',110,'soap solution')+lbl(295,218,'red → blue','fill="'+BLU+'"')],
  ['Neutral: no change.',strip(440,40,'#4a78c8','#4a78c8')+lbl(440,218,'no change')]]},
 seeNote:'Blue → red = acid; red → blue = base.',
 do:{title:'Litmus table',mat:'Red and blue litmus strips, 6 solutions, droppers',steps:['Put a drop of each on both strips.','Record colour changes.','Classify each.'],obs:'Lemon: blue → red; soap: red → blue.',why:'Indicator action.',lab:true},
 memo:'"BRA: Blue → Red in Acid."',
 miscon:['"Neutral solutions turn litmus purple." No change.'],
 terms:['Indicator · सूचक','Litmus · लिटमस','Lichen · लाइकेन'],
 q:{q:'Acids turn blue litmus:',o:['green','red','yellow','stay blue'],a:1,why:'BRA.'},
 exam:'Litmus results and conclusions: 2 marks.'},

{id:'x3',num:'2.3',title:'Natural indicators: turmeric and China rose · प्राकृतिक सूचक',
 intro:'Why does a turmeric stain on your shirt turn red when washed with soap?',
 obj:'Use turmeric and China rose (hibiscus) as indicators.',
 prior:'2.2.',
 simple:'Turmeric (हल्दी) is yellow. In a basic solution it turns red; in acidic and neutral solutions it stays yellow. China rose (गुड़हल) petal extract is light pink/purple: it turns dark pink (magenta) in acids and green in bases.',
 detail:'Make turmeric paper by applying turmeric paste on blotting paper and drying it. Make China rose indicator by soaking petals in warm water. Turmeric cannot tell acids from neutral substances (both stay yellow), so we may need another indicator. Red cabbage and beetroot extracts are other natural indicators.',
 real:'Haldi stains on clothes turn reddish-brown with soap (a base).',
 apply:'A solution keeps turmeric yellow. Can you say it is acidic?',
 see:{w:520,h:230,f:[
  ['Turmeric in a base turns red.',tube(70,30,'#e5b93a',110,'turmeric')+tube(150,30,'#c0392b',110,'+ soap')],
  ['China rose: magenta in acid…',tube(300,30,'#c2185b',110,'+ lemon')],
  ['…green in base.',tube(400,30,'#3b8a3b',110,'+ soap')+lbl(350,210,'China rose · गुड़हल','font-weight="700"')]]},
 seeNote:'Turmeric only detects bases.',
 do:{title:'Make your own indicator',mat:'China rose petals, warm water, lemon juice, soap solution',steps:['Soak petals 10 minutes; filter.','Add the extract to lemon juice and to soap solution.'],obs:'Magenta and green.',why:'Natural indicator.',lab:true},
 memo:'"Haldi goes red with soap; hibiscus goes pink with sour, green with soapy."',
 miscon:['"If turmeric stays yellow, the solution is acidic." It could be neutral.'],
 terms:['Turmeric · हल्दी','China rose · गुड़हल','Natural indicator · प्राकृतिक सूचक'],
 q:{q:'Turmeric turns red in:',o:['lemon juice','soap solution','sugar solution','vinegar'],a:1,why:'Base.'},
 exam:'Natural indicators and colours: 2 marks.'},

{id:'x4',num:'2.4',title:'Choosing the right test · सही परीक्षण',
 intro:'You have three unlabelled bottles: acid, base, water. Only red litmus. Can you identify all three?',
 obj:'Plan a sequence of tests to identify unknown solutions.',
 prior:'2.2, 2.3.',
 simple:'Each indicator gives limited information. Red litmus picks out bases (turns blue). Blue litmus picks out acids (turns red). Turmeric picks out bases. China rose separates all three at once: magenta = acid, green = base, no change = neutral.',
 detail:'Trick with only red litmus: test all three; the one turning it blue is the base. Now that blue strip can test the other two: the one turning it red again is the acid; the remaining is neutral. Scientists choose tests to get the most information with the fewest steps.',
 real:'Lab assistants identify unlabelled chemicals step by step, starting with simple tests.',
 apply:'Which single indicator identifies acid, base and neutral at once?',
 see:{w:520,h:220,f:[
  ['Three unknown bottles.',['A','B','C'].map((n,i)=>`<rect x="${100+i*120}" y="40" width="50" height="80" rx="8" fill="#eef" stroke="${ink}"/>`+lbl(125+i*120,90,n,'font-size="18" font-weight="700"')).join('')],
  ['Red litmus: B turns it blue → base.',strip(245,130,'#4a78c8','#d65a5a')],
  ['Use that blue strip: A turns it red → acid; C neutral.',strip(125,130,'#d65a5a','#4a78c8')+lbl(125,215,'acid','fill="'+RD+'"')+lbl(245,215,'base','fill="'+BLU+'"')+lbl(365,215,'neutral')]]},
 seeNote:'Plan your tests.',
 do:{title:'Mystery bottles',mat:'Three labelled-by-letter solutions, red litmus only',steps:['Identify all three using only red litmus.'],obs:'Possible in two steps.',why:'Re-use the blue strip.',lab:true},
 memo:'"China rose tells all three."',
 miscon:['"You need many indicators to identify a substance." Smart planning needs few.'],
 terms:['Test','Unknown','Inference'],
 q:{q:'Which indicator alone distinguishes acid, base and neutral?',o:['red litmus','blue litmus','turmeric','China rose'],a:3,why:'Three different colours.'},
 exam:'Plan tests for unknowns: 3 marks.'},

{id:'x5',num:'2.5',title:'Neutralisation · उदासीनीकरण',
 intro:'What happens when you add baking soda to lemon juice?',
 obj:'Explain neutralisation and observe it with an indicator.',
 prior:'2.2–2.4.',
 simple:'When an acid and a base react, they cancel each other\'s effect. This is neutralisation (उदासीनीकरण). The products are a salt and water: acid + base → salt + water. Heat is also given out: the mixture becomes slightly warm.',
 detail:'Activity: add China rose indicator to dilute hydrochloric acid (by teacher) → magenta. Add sodium hydroxide solution drop by drop with stirring: at the neutral point the colour changes; one more drop makes it green. The "salt" formed (e.g. sodium chloride, common salt) need not be table salt; any substance formed this way is called a salt. When baking soda meets lemon juice, it also fizzes because carbon dioxide gas forms.',
 real:'Baking soda added to lemon juice fizzes and the sourness reduces.',
 apply:'Why does the mixture become warm during neutralisation?',
 see:{w:520,h:230,f:[
  ['Acid + China rose: magenta.',tube(120,30,'#c2185b',120,'acid')],
  ['Add base drop by drop…',`<path d="M200 20 v40 l8 10 l8 -10 v-40z" fill="#eef" stroke="${ink}"/><circle cx="208" cy="80" r="4" fill="${BLU}"/>`+tube(260,30,'#b58aa8',120,'neutral')],
  ['One drop more: green (basic).',tube(400,30,'#3b8a3b',120,'excess base')+lbl(260,225,'acid + base → salt + water + heat','font-weight="700"')]]},
 seeNote:'Neutral point: colour changes.',
 do:{title:'Fizz test',mat:'Lemon juice, baking soda, China rose extract',steps:['Add China rose to lemon juice.','Add baking soda a pinch at a time.','Watch colour and fizz.'],obs:'Magenta → neutral → green; fizzing.',why:'Neutralisation + CO₂.',lab:true},
 memo:'"Acid + base → salt + water (+ heat)."',
 miscon:['"Salt" always means table salt.','"Neutralisation needs heating." It gives out heat.'],
 terms:['Neutralisation · उदासीनीकरण','Salt · लवण','Heat released'],
 q:{q:'Products of neutralisation:',o:['acid + water','salt + water','base + salt','only gas'],a:1,why:'Acid + base → salt + water.'},
 exam:'Explain neutralisation with an activity: 3 marks.'},

{id:'x6',num:'2.6',title:'Neutralisation in daily life · दैनिक जीवन में उदासीनीकरण',
 intro:'Why does a doctor give an antacid for acidity?',
 obj:'Apply neutralisation to everyday situations.',
 prior:'2.5.',
 simple:'Indigestion: too much acid in the stomach causes pain; an antacid (a mild base like milk of magnesia) neutralises it. Ant bite: ants inject formic acid; rubbing baking soda solution (base) gives relief. Soil: very acidic soil is treated with quicklime or slaked lime (bases); very basic soil with organic matter (compost), which releases acids. Factory wastes: acidic wastes are neutralised before being released into rivers.',
 detail:'Toothpaste is basic and neutralises acids made by bacteria in the mouth, preventing tooth decay. A nettle sting contains acid; it is treated by rubbing dock leaves. Farmers in Haryana test soil before adding lime or gypsum.',
 real:'After a heavy meal, some people take an antacid tablet for acidity.',
 apply:'Why should factory wastes be neutralised before release?',
 see:{w:520,h:220,f:[
  ['Stomach acid + antacid.',`<path d="M60 60 q40 -30 80 10 q20 60 -40 80 q-50 0 -40 -90z" fill="#f3c1c1" stroke="${ink}"/>`+lbl(100,170,'antacid → relief')],
  ['Ant bite (formic acid) + baking soda.',`<circle cx="260" cy="100" r="8" fill="#5a3a2a"/><circle cx="276" cy="100" r="10" fill="#5a3a2a"/>`+lbl(268,170,'baking soda')],
  ['Acidic soil + lime.',`<rect x="380" y="90" width="110" height="50" fill="#8a6a3a" opacity=".7"/>`+[0,1,2,3].map(k=>`<circle cx="${395+k*25}" cy="80" r="5" fill="#fff" stroke="${ink}"/>`).join('')+lbl(435,170,'lime · चूना')]]},
 seeNote:'Neutralisation solves everyday problems.',
 do:{title:'Soil test',mat:'Soil sample, water, litmus or China rose',steps:['Stir soil in water; let settle.','Test the water.'],obs:'Acidic, basic or neutral soil.',why:'Soil treatment depends on it.',lab:false},
 memo:'"Antacid for acid, soda for sting, lime for sour soil."',
 miscon:['"Toothpaste is acidic." It is basic.'],
 terms:['Antacid · प्रति-अम्ल','Formic acid','Slaked lime · बुझा हुआ चूना','Compost'],
 q:{q:'Ant bite is treated with:',o:['vinegar','lemon','baking soda','curd'],a:2,why:'Base neutralises formic acid.'},
 exam:'Neutralisation in daily life: 3 marks.'}
];

const CARDS=[['Acid · अम्ल','Sour; turns blue litmus red.'],['Base · क्षारक','Bitter, soapy; turns red litmus blue.'],['Neutral','No change in litmus.'],['Litmus','From lichens.'],['Turmeric','Red in bases; yellow otherwise.'],['China rose','Magenta in acid, green in base.'],['Neutralisation','Acid + base → salt + water + heat.'],['Food acids','Citric (lemon), acetic (vinegar), lactic (curd), tartaric (imli).'],['Antacid','Neutralises stomach acid.'],['Ant bite','Formic acid; use baking soda.'],['Soil','Acidic → lime; basic → compost.']];

const Q=[
 {lv:1,q:'Litmus is obtained from:',o:['turmeric','lichens','China rose','beetroot'],a:1,w:'Lichens.'},
 {lv:1,q:'Vinegar contains:',o:['citric acid','acetic acid','lactic acid','formic acid'],a:1,w:'Acetic.'},
 {lv:1,q:'Bases turn red litmus:',o:['blue','green','yellow','no change'],a:0,w:'Blue.'},
 {lv:2,q:'China rose indicator in soap solution turns:',o:['magenta','green','yellow','red'],a:1,w:'Base → green.'},
 {lv:2,q:'Turmeric stays yellow in:',o:['soap','lime water','lemon juice','baking soda'],a:2,w:'Not a base.'},
 {lv:2,q:'Sugar solution is:',o:['acidic','basic','neutral','salty acid'],a:2,w:'No change.'},
 {lv:3,q:'Acid + base →',o:['salt + water','acid + salt','base + water','only heat'],a:0,w:'Neutralisation.'},
 {lv:3,q:'Antacids are:',o:['acids','mild bases','neutral','salts only'],a:1,w:'Neutralise acid.'},
 {lv:4,q:'Only red litmus is available. A, B, C = acid, base, water. First step:',o:['taste them','test all on red litmus','heat them','mix them'],a:1,w:'Find the base first.'},
 {lv:4,q:'A farmer\'s soil is too acidic. Add:',o:['vinegar','slaked lime','lemon','curd'],a:1,w:'Base.'},
 {lv:5,open:true,m:3,q:'Describe how China rose indicator is used to show neutralisation.',ans:['Add indicator to acid: magenta (1)','Add base drop by drop with stirring (1)','Colour changes at neutral point; excess base turns green (1)']},
 {lv:5,open:true,m:3,q:'Give three applications of neutralisation in daily life.',ans:['Antacid for indigestion (1)','Baking soda for ant bite (1)','Lime for acidic soil / treating factory waste (1)']}
];

const ONEMIN=['Acids sour, bases bitter/soapy; never taste.','Indicators: litmus, turmeric, China rose.','Blue → red = acid; red → blue = base.','Turmeric red only in base.','China rose: magenta acid, green base.','Neutralisation: salt + water + heat.','Antacid, ant bite, soil, factory waste.'];
const KEYS=[['acid/base/neutral',/acid|base|neutral/i],['indicator',/indicator|सूचक/i],['litmus',/litmus/i],['turmeric',/turmeric|haldi|हल्दी/i],['China rose',/china rose|hibiscus|गुड़हल/i],['neutralisation',/neutrali/i],['salt + water',/salt/i],['applications',/antacid|ant|soil|toothpaste/i]];

/* ---------- lab ---------- */
let mode='test',sub='lemon',ind=null,myst=null,mtests=[],nd=0,res=null;const NEUT=10;
function nature(k){return SUB[k][1]}
function drawTest(){const s0=SUB[sub];let s=T(230,24,s0[0],'font-size="16" font-weight="700"');
 const ks=['rl','bl','tu','cr'];ks.forEach((k,i)=>{const x=70+i*105;const done=k===ind;const c=done?IND[k].c[nature(sub)]:'#f4f4f6';s+=tube(x,50,c,130)+T(x,240,IND[k].n.split(' · ')[0],'font-size="11"')+(done?T(x,262,'tested','font-size="11" fill="'+MG+'"'):'')});
 $('#xSvg').innerHTML=s;
 if(ind){const n=nature(sub);const cls=['acidic','neutral','basic'][n];const IN=IND[ind];const before=IN.c[1],after=IN.c[n];
  const said={rl:n===2?'turned blue':'stayed red',bl:n===0?'turned red':'stayed blue',tu:n===2?'turned red':'stayed yellow',cr:n===0?'turned magenta':n===2?'turned green':'did not change'}[ind];
  const conc={rl:n===2?'It is basic.':'It is not basic (acidic or neutral).',bl:n===0?'It is acidic.':'It is not acidic (basic or neutral).',tu:n===2?'It is basic.':'It is not basic.',cr:`It is ${cls}.`}[ind];
  $('#xOut').innerHTML=`<p>${IN.n.split(' · ')[0]} <b>${said}</b>. ${conc}</p>${s0[2]?`<p class="note">Contains ${s0[2]}.</p>`:''}`}else $('#xOut').innerHTML='<p>Press an indicator button to test.</p>'}
function drawMyst(){let s=T(230,24,'Mystery solution ?','font-size="16" font-weight="700"');
 s+=`<rect x="40" y="60" width="70" height="120" rx="10" fill="#eef" stroke="${ink}"/>`+T(75,130,'?','font-size="40" font-weight="700"');
 mtests.forEach((k,i)=>{const x=160+i*75;s+=tube(x,50,IND[k].c[nature(myst)],130)+T(x,240,IND[k].n.split(' · ')[0],'font-size="10"')});
 $('#xSvg').innerHTML=s;if(!res)$('#xOut').innerHTML=`<p>Tests used: ${mtests.length}. Choose indicators, then make your guess.</p>`}
function drawNeut(){const pink=[194,24,91],purple=[181,138,168],green=[59,138,59];let c;if(nd<NEUT){const t=nd/NEUT;c=pink.map((v,i)=>Math.round(v+(purple[i]-v)*t))}else if(nd===NEUT)c=purple;else c=green;
 const col=`rgb(${c.join(',')})`;let s=T(230,24,'Dilute acid + China rose indicator','font-size="15" font-weight="700"');
 s+=`<path d="M210 40 v60 l10 14 l10 -14 v-60z" fill="#e6eefc" stroke="${ink}"/>`+T(270,70,'base (dropper)','font-size="11" text-anchor="start"');
 s+=`<path d="M150 130 v120 a14 14 0 0 0 14 14 h112 a14 14 0 0 0 14 -14 v-120" fill="none" stroke="${ink}" stroke-width="2"/><rect x="152" y="170" width="136" height="92" fill="${col}"/>`;
 s+=T(220,295,`Drops added: ${nd}`,'font-size="13"');$('#xSvg').innerHTML=s;
 $('#xOut').innerHTML=nd<NEUT?`<p>Still acidic (magenta). Keep adding drops and watch the colour.</p>`:nd===NEUT?`<p class="fb ok">Neutral point reached at ${NEUT} drops! Acid + base → salt + water. The beaker feels slightly warm.</p>`:`<p class="fb no">Too far: ${nd-NEUT} extra drop(s) made it basic (green). Start again and add carefully near the end.</p>`}
function draw(){mode==='test'?drawTest():mode==='myst'?drawMyst():drawNeut()}
function newMyst(){const ks=Object.keys(SUB);myst=ks[Math.floor(Math.random()*ks.length)];mtests=[];res=null;drawMyst()}
function labShow(){draw()}
function labInit(){}
function labClick(b){if(b.dataset&&b.dataset.ind){const k=b.dataset.ind;if(mode==='test'){ind=k;drawTest()}else if(mode==='myst'){if(!myst)newMyst();if(!res&&!mtests.includes(k)){mtests.push(k);drawMyst()}}return true}
 if(b.id==='xNew'){mode='myst';$('#xMode').value='myst';newMyst();return true}
 if(b.dataset&&b.dataset.guess){if(mode!=='myst'||!myst){$('#xOut').innerHTML='<p>Choose Mystery mode and press New mystery first.</p>';return true}const n=nature(myst),ans=['acid','neutral','base'][n];res=1;const ok=b.dataset.guess===ans;
  const best=n===1?'China rose (1 test) — or red + blue litmus (2 tests)':'China rose or the right litmus (1 test)';
  $('#xOut').innerHTML=`<p class="fb ${ok?'ok':'no'}">${ok?'Correct!':'Not quite.'} It was <b>${SUB[myst][0]}</b> (${['acidic','neutral','basic'][n]}). You used ${mtests.length} test(s).</p><p class="note">Fewest tests: ${best}.</p>`;return true}
 if(b.id==='xDrop'||b.id==='xDrop5'){mode='neut';$('#xMode').value='neut';nd+=b.id==='xDrop'?1:5;drawNeut();return true}
 if(b.id==='xNReset'){nd=0;mode='neut';$('#xMode').value='neut';drawNeut();return true}return false}
function labChange(t){if(t.id==='xMode'){mode=t.value;if(mode==='myst'&&!myst)newMyst();else draw();return true}if(t.id==='xSub'){sub=t.value;ind=null;mode='test';$('#xMode').value='test';drawTest();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
