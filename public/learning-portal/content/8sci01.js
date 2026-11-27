/* Rai Plus content pack: Class 8 Science (Curiosity), Chapter 1 – Exploring the Investigative World of Science. */
RP.register({key:'8sci01',cls:'8',subject:'Science',ch:'1',title:"Exploring the Investigative World of Science",color:'#1f5f8b',
crumb:"Class 8 Science · Curiosity",h1:"Chapter 1: Exploring the Investigative World of Science",sub:"How scientists investigate: observing, asking testable questions, making hypotheses, planning fair tests with variables, recording data, and drawing honest conclusions.",heroLabel:"The cycle of scientific investigation",labName:'Seed germination investigation',
theme:"\n:root{--g:light-dark(#1f5f8b,#8fc2e6);--g2:light-dark(#e8f1f8,#0b1622);--line:light-dark(#cde0ee,#22384b);--bg:light-dark(#ffffff,#081018);--card:light-dark(#ffffff,#0d1620);\n--ink:light-dark(#0d1d2a,#e1ecf5);--mute:light-dark(#475d70,#a7bccd);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#174a6d}\n",
labHTML:`  <h2>Seed germination investigation</h2>
  <p>Question: what do moong seeds need to germinate (sprout)? Set up two trays. Change only ONE condition between them for a fair test, then run the experiment for 4 days and compare.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="gSvg" viewBox="0 0 460 320" role="img" aria-label="Two seed trays" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><b>Tray A</b> <label><input type="checkbox" class="gC" id="aW" checked> water</label> <label><input type="checkbox" class="gC" id="aL" checked> light</label> <label><input type="checkbox" class="gC" id="aT" checked> warm (not fridge)</label></div>
  <div class="ctrl"><b>Tray B</b> <label><input type="checkbox" class="gC" id="bW"> water</label> <label><input type="checkbox" class="gC" id="bL" checked> light</label> <label><input type="checkbox" class="gC" id="bT" checked> warm (not fridge)</label></div>
  <div class="ctrl"><button class="btn" id="gRun">Run 4 days</button> <button class="btn" id="gRe">Reset</button></div>
  <div class="box y" id="gOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#1f5f8b',LABNAME='Seed germination investigation',MIND_CENTER='Scientific investigation';
const BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
const arr=(x1,y1,x2,y2,c=GR)=>{const a=Math.atan2(y2-y1,x2-x1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2"/><path d="M${x2} ${y2} L${x2-8*Math.cos(a-.45)} ${y2-8*Math.sin(a-.45)} L${x2-8*Math.cos(a+.45)} ${y2-8*Math.sin(a+.45)}Z" fill="${c}"/>`};
function cycle(cx,cy,r,items,upto=99){let s='';items.forEach(([t,c],k)=>{if(k>upto)return;const a=-Math.PI/2+k*2*Math.PI/items.length;const x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);s+=box(x-55,y-20,110,40,t,c);if(k<items.length-1&&k<upto||k===items.length-1&&upto>=items.length-1){const a2=-Math.PI/2+(k+1)*2*Math.PI/items.length;const mid=(a+a2)/2;s+=arr(cx+(r-8)*Math.cos(mid-.18),cy+(r-8)*Math.sin(mid-.18),cx+(r-8)*Math.cos(mid+.18),cy+(r-8)*Math.sin(mid+.18))}});return s}
const STEPS=[['Observe',BL],['Question',PU],['Hypothesis',OR],['Experiment',GN],['Analyse',BL],['Conclude',PU]];
function heroDraw(){let s='';for(let k=0;k<6;k++){const a=-Math.PI/2+k*Math.PI/3;s+=`<circle cx="${190+55*Math.cos(a)}" cy="${80+55*Math.sin(a)}" r="12" fill="none" stroke="#fff" stroke-width="2.5"/>`}return s+`<circle cx="190" cy="80" r="55" fill="none" stroke="#fff" stroke-dasharray="5 5"/>`}
const HERO=heroDraw;
const MIND=[['Curiosity & observation',100,50],['Testable questions',420,50],['Hypothesis',90,150],['Variables & fair tests',430,150],['Data & conclusions',110,250],['Science journey',410,250]];

const C=[
{id:'s1',num:'1.1',title:'Curiosity and careful observation',
 intro:'Why does a puri puff up when it is fried, but a chapati on a tawa only sometimes does?',
 obj:'Explain how science begins with curiosity and careful observation.',
 prior:'Class 6–7: observing, measuring, the Curiosity textbooks.',
 simple:'Science starts with noticing things and wondering why. Observation means using our senses — and instruments like rulers, thermometers and microscopes — to gather information carefully. Good observers notice details others miss, and record them honestly, even when the result is unexpected.',
 detail:'Observations can be qualitative (colour, smell, shape: "the puri turned golden and puffed") or quantitative (measured with numbers: "it puffed in 8 seconds at about 180 °C"). Instruments extend our senses: a microscope shows microbes, a telescope shows distant planets. An observation is what you see; an inference is what you think explains it — keep them separate.',
 real:'Farmers observe soil, clouds and leaves to decide when to sow and water.',
 apply:'Write one qualitative and one quantitative observation about a glass of water left in the sun.',
 see:{w:520,h:220,f:[
  ['Notice something.',box(20,80,140,60,'Observe','#1f5f8b','senses + instruments')],
  ['Qualitative: describes.',box(190,30,140,60,'Qualitative',GN,'colour, shape, smell')],
  ['Quantitative: measures.',box(190,130,140,60,'Quantitative',OR,'numbers + units')+arr(160,100,188,70)+arr(160,120,188,150)+lbl(440,100,'observation ≠ inference','font-weight="700"')]]},
 seeNote:'Observe first, explain later.',
 do:{title:'Puri puzzle',mat:'Cooked puri and chapati (with adult help)',steps:['Observe a puri being fried.','Record what you see, hear and measure.','List questions it raises.'],obs:'Steam forms inside and puffs it up.',why:'Observation leads to questions.',lab:false},
 memo:'"Look closely, write honestly."',
 miscon:['"Observation means only looking." It uses all senses and instruments.','"What I think happened is an observation." That is an inference.'],
 terms:['Observation · प्रेक्षण','Curiosity · जिज्ञासा','Qualitative · गुणात्मक','Quantitative · मात्रात्मक','Inference · अनुमान'],
 q:{q:'"The water reached 42 °C" is a:',o:['qualitative observation','quantitative observation','hypothesis','conclusion'],a:1,why:'It has a measured number.'},
 exam:'Observation vs inference: 1–2 marks.'},

{id:'s2',num:'1.2',title:'Asking testable questions',
 intro:'"Why is the sky beautiful?" and "Does salt make water boil at a higher temperature?" — which can an experiment answer?',
 obj:'Turn curiosity into questions that can be tested.',
 prior:'1.1.',
 simple:'A testable question can be answered by observing or experimenting and collecting evidence. "Does salt raise the boiling point of water?" is testable — measure it. "Is red the best colour?" is opinion, not testable by experiment. Testable questions often take the form "How does changing A affect B?"',
 detail:'Improve vague questions: "Do plants like music?" → "Does playing music for 1 hour a day change the height of bean plants after 3 weeks?" The improved question names what you change (music), what you measure (height), and how long. Some big questions need many smaller testable ones.',
 real:'Doctors ask testable questions like "Does this medicine lower fever faster than rest alone?"',
 apply:'Rewrite "Is sugar good?" as a testable question.',
 see:{w:520,h:200,f:[
  ['Vague: "Do plants like music?"',lbl(260,40,'"Do plants like music?"  ✗ vague','font-size="16" fill="'+OR+'"')],
  ['Testable: names what changes and what is measured.',lbl(260,95,'"Does 1 h of music daily change bean plant height in 3 weeks?"','font-size="13" fill="'+GN+'"')],
  ['How does changing A affect B?',lbl(260,160,'How does changing A affect B?','font-size="17" font-weight="700"')]]},
 seeNote:'Change something, measure something.',
 do:{title:'Question sort',mat:'Question cards',steps:['Sort 10 questions into testable and not testable.','Rewrite two non-testable ones.'],obs:'Opinions are not testable.',why:'Evidence needs measurement.',lab:false},
 memo:'"If you can measure it, you can test it."',
 miscon:['"Every question is scientific." Opinion questions cannot be tested by experiment.'],
 terms:['Testable question · परीक्षण योग्य प्रश्न','Evidence · प्रमाण'],
 q:{q:'Which is a testable question?',o:['Which song is nicest?','Does temperature affect how fast sugar dissolves?','Is science fun?','Why is blue pretty?'],a:1,why:'Change temperature, measure time.'},
 exam:'Frame a testable question: 1–2 marks.'},

{id:'s3',num:'1.3',title:'Making a hypothesis',
 intro:'You suspect steam makes the puri puff. How do you turn that hunch into something you can test?',
 obj:'Write a hypothesis and a prediction.',
 prior:'1.2.',
 simple:'A hypothesis is a possible explanation that can be tested — an informed guess based on what you already know. A prediction says what you expect to observe if the hypothesis is right. Hypothesis: "Water in the dough turns to steam and puffs the puri." Prediction: "If I make a puri from very dry dough, it will not puff as much."',
 detail:'Use "If … then … because …": "If seeds get no water, then they will not sprout, because water is needed to start growth." A hypothesis is never "proved" by one experiment; it is supported or not supported by evidence. A rejected hypothesis is still useful — it tells us what is not true.',
 real:'Before vaccines were tested, scientists hypothesised that exposure to a weakened germ would build protection.',
 apply:'Write an "If … then … because …" hypothesis about ice melting faster on a metal plate.',
 see:{w:520,h:200,f:[
  ['If … (what you change)',box(20,70,150,60,'If …',BL,'what you change')],
  ['then … (what you expect)',arr(170,100,190,100)+box(190,70,150,60,'then …',GN,'what you expect')],
  ['because … (your reason)',arr(340,100,360,100)+box(360,70,150,60,'because …',OR,'your reason')]]},
 seeNote:'Testable, with a reason.',
 do:{title:'Hypothesis cards',mat:'Notebook',steps:['Write hypotheses for 3 everyday puzzles using If–then–because.'],obs:'Each can be tested.',why:'Structure helps planning.',lab:false},
 memo:'"If – then – because."',
 miscon:['"A hypothesis is a wild guess." It is based on prior knowledge.','"If the result disagrees, the experiment failed." It means the hypothesis is not supported — still useful.'],
 terms:['Hypothesis · परिकल्पना','Prediction · पूर्वानुमान','Supported · समर्थित'],
 q:{q:'A hypothesis is:',o:['a final fact','a testable possible explanation','an opinion','a measurement'],a:1,why:'Can be tested.'},
 exam:'Write a hypothesis: 2 marks.'},

{id:'s4',num:'1.4',title:'Variables and fair tests',
 intro:'Two seed trays: one watered, one kept in the dark and also unwatered. One sprouted — but why?',
 obj:'Identify independent, dependent and controlled variables; plan a fair test.',
 prior:'Class 7: fair test.',
 simple:'A variable is anything that can change in an experiment. Independent variable — what you change on purpose (water or no water). Dependent variable — what you measure (number of seeds sprouted). Controlled variables — everything kept the same (seed type, number, light, temperature, container). In a fair test you change only one variable at a time.',
 detail:'If you change two things at once (water and light), you cannot tell which one caused the result. A control setup (with normal conditions) gives a baseline to compare against. Repeating trials and using several seeds make results reliable; one seed might simply be bad.',
 real:'Medicine trials compare a group given the medicine with a group given a dummy pill — changing only one thing.',
 apply:'Plan a fair test for: "Does the type of soil affect how tall a plant grows?" Name the three kinds of variables.',
 see:{w:520,h:220,f:[
  ['Change ONE thing: independent.',box(20,40,150,60,'Independent',OR,'you change it')],
  ['Measure: dependent.',box(185,40,150,60,'Dependent',BL,'you measure it')],
  ['Keep the rest the same: controlled.',box(350,40,150,60,'Controlled',GN,'kept the same')+lbl(260,150,'Only one variable changes → fair test','font-size="15" font-weight="700"')]]},
 seeNote:'One change at a time.',
 do:{title:'Germination test',mat:'Moong seeds, cotton, two dishes, water',steps:['Dish A: damp cotton. Dish B: dry cotton.','Keep everything else the same for 4 days.'],obs:'Only A sprouts.',why:'Water was the only difference.',lab:true},
 memo:'"I change, D detects, C constant."',
 miscon:['"More changes at once save time." Then you cannot tell what caused the result.'],
 terms:['Variable · चर','Independent variable · स्वतंत्र चर','Dependent variable · आश्रित चर','Controlled variable · नियंत्रित चर','Fair test · निष्पक्ष परीक्षण'],
 q:{q:'In a test of whether water affects sprouting, the dependent variable is:',o:['amount of water','number of seeds sprouted','seed type','container'],a:1,why:'What is measured.'},
 exam:'Identify variables; fair test: 3 marks.'},

{id:'s5',num:'1.5',title:'Recording data and drawing conclusions',
 intro:'Your experiment is done. How do you turn notes into a conclusion others will trust?',
 obj:'Record data in tables and graphs and write evidence-based conclusions.',
 prior:'1.4; bar graphs.',
 simple:'Record results in a table with headings and units as you go. Show patterns with a bar graph or line graph. A conclusion answers the question using evidence: "Seeds with water sprouted (9 out of 10); seeds without water did not (0 out of 10). So water is needed for germination." Say whether the hypothesis was supported.',
 detail:'Repeat the experiment and take averages to reduce errors. Report surprises honestly. Errors come from measuring carelessly, uncontrolled variables or too few trials. Scientists share methods so others can repeat (replicate) the experiment and check the results.',
 real:'Weather scientists record temperature daily for decades to describe climate trends.',
 apply:'Seeds: tray A (water) 9/10 sprouted; tray B (no water) 0/10. Write a conclusion.',
 see:{w:520,h:240,f:[
  ['Table of results.',`<rect x="30" y="40" width="200" height="90" fill="none" stroke="${ink}"/><line x1="30" y1="70" x2="230" y2="70" stroke="${ink}"/><line x1="130" y1="40" x2="130" y2="130" stroke="${ink}"/>`+lbl(80,60,'Tray','font-weight="700"')+lbl(180,60,'Sprouted','font-weight="700"')+lbl(80,93,'A (water)')+lbl(180,93,'9 / 10')+lbl(80,118,'B (dry)')+lbl(180,118,'0 / 10')],
  ['Bar graph.',`<line x1="290" y1="200" x2="480" y2="200" stroke="${ink}"/><line x1="290" y1="200" x2="290" y2="40" stroke="${ink}"/><rect x="320" y="${200-9*15}" width="50" height="${9*15}" fill="${GN}" opacity=".7"/><rect x="400" y="198" width="50" height="2" fill="${OR}"/>`+lbl(345,218,'A')+lbl(425,218,'B')],
  ['Conclusion: water is needed.',lbl(130,190,'Conclusion: water is needed','font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Evidence → conclusion.',
 do:{title:'Class results',mat:'Results from all groups',steps:['Combine all groups\' data in one table.','Find the average.'],obs:'More data, more reliable.',why:'Repetition reduces error.',lab:false},
 memo:'"Table, graph, claim with evidence."',
 miscon:['"If my result is different, I should change it." Record what you actually observed.'],
 terms:['Data · आँकड़े','Conclusion · निष्कर्ष','Replicate · दोहराना','Average · औसत'],
 q:{q:'Repeating an experiment several times makes results:',o:['less reliable','more reliable','unnecessary','always identical'],a:1,why:'Reduces chance errors.'},
 exam:'Draw conclusion from data: 2–3 marks.'},

{id:'s6',num:'1.6',title:'The year\'s investigative journey',
 intro:'From microbes too tiny to see to stars too far to visit — where will science take us this year?',
 obj:'Connect the scientific method to the topics of Class 8 science and to Indian scientific traditions.',
 prior:'1.1–1.5.',
 simple:'This year\'s chapters use the same investigative skills: the invisible world of microbes; health; magnetic and heating effects of electricity; forces; pressure, winds and cyclones; the particle nature of matter; elements, compounds and mixtures; solutions; mirrors and lenses; keeping time with the skies; how nature works in harmony; and our unique Earth. Science is a process of asking, testing and revising — not just a list of facts.',
 detail:'Science is a shared human effort; ideas change when new evidence appears. India has a long tradition of investigation — from ancient astronomy and metallurgy to modern scientists such as C.V. Raman (scattering of light) and space missions by ISRO. Safety, honesty and respect for living things are part of good science.',
 real:'ISRO\'s Chandrayaan missions tested hypotheses about water on the Moon.',
 apply:'Pick any chapter title and write one testable question about it.',
 see:{w:520,h:280,f:[
  ['Observe → Question → Hypothesis…',cycle(260,140,105,STEPS,2)],
  ['…Experiment → Analyse…',cycle(260,140,105,STEPS,4)],
  ['…Conclude — and ask new questions.',cycle(260,140,105,STEPS,5)+lbl(260,145,'repeat','font-size="12" fill="'+GR+'"')]]},
 seeNote:'Science is a cycle.',
 do:{title:'Wonder wall',mat:'Sticky notes',steps:['Each student posts one question about the natural world.','Group them by chapter.'],obs:'Many questions link to this year\'s topics.',why:'Curiosity drives science.',lab:false},
 memo:'"Ask, test, revise, repeat."',
 miscon:['"Science is a fixed list of facts." It changes with new evidence.'],
 terms:['Scientific method · वैज्ञानिक विधि','Investigation · अन्वेषण','Evidence · प्रमाण'],
 q:{q:'If new evidence contradicts an old idea, scientists:',o:['ignore the evidence','revise the idea','stop investigating','hide the result'],a:1,why:'Science self-corrects.'},
 exam:'Steps of scientific method: 3 marks.'}
];

const CARDS=[['Observation','Using senses and instruments carefully.'],['Qualitative / quantitative','Describes vs measures.'],['Inference','An explanation of an observation.'],['Testable question','How does changing A affect B?'],['Hypothesis','If… then… because…'],['Independent variable','What you change.'],['Dependent variable','What you measure.'],['Controlled variables','Kept the same.'],['Fair test','Change only one variable.'],['Conclusion','Answer with evidence; repeat trials.']];

const Q=[
 {lv:1,q:'Science usually begins with:',o:['a conclusion','curiosity and observation','a graph','a law'],a:1,w:'Wonder.'},
 {lv:1,q:'What you change on purpose is the:',o:['dependent variable','independent variable','controlled variable','result'],a:1,w:'Independent.'},
 {lv:1,q:'"The leaf is dark green" is:',o:['quantitative','qualitative','a hypothesis','a prediction'],a:1,w:'Describes.'},
 {lv:2,q:'A fair test changes:',o:['everything','two variables','only one variable','nothing'],a:2,w:'One at a time.'},
 {lv:2,q:'Which is a hypothesis?',o:['The plant is 12 cm tall.','If plants get more light, they grow taller, because light helps make food.','Plants are nice.','Measure the plant.'],a:1,w:'If–then–because.'},
 {lv:2,q:'Why repeat trials?',o:['to make results reliable','to get the answer you want','to save time','no reason'],a:0,w:'Reduce errors.'},
 {lv:3,q:'Testing if light affects sprouting, which must be controlled?',o:['light','amount of water','number sprouted','none'],a:1,w:'Keep water same.'},
 {lv:3,q:'Tray A: water + light; Tray B: no water + no light. Only A sprouts. Problem?',o:['None','Two variables changed','Too many seeds','Wrong seeds'],a:1,w:'Unfair test.'},
 {lv:4,q:'Results do not support your hypothesis. You should:',o:['change the data','report honestly and rethink','stop','repeat until it agrees'],a:1,w:'Honesty.'},
 {lv:4,q:'"Steam inside makes the puri puff" is:',o:['an observation','an inference/hypothesis','a measurement','a variable'],a:1,w:'Explanation.'},
 {lv:5,open:true,m:3,q:'Plan a fair test to find whether temperature affects how fast sugar dissolves in water. Name the variables.',ans:['Independent: water temperature (1)','Dependent: time to dissolve (1)','Controlled: amount of sugar, water volume, stirring, cup type (1)']},
 {lv:5,open:true,m:5,q:'Describe the steps of a scientific investigation using an example of your choice.',ans:['Observation (1)','Testable question (1)','Hypothesis/prediction (1)','Fair-test experiment with variables (1)','Record data, conclude, repeat/share (1)']}
];

const ONEMIN=['Curiosity and careful observation.','Testable questions: change A, measure B.','Hypothesis: if–then–because.','Variables and fair tests.','Data, graphs and conclusions.','Science is a cycle across the year\'s topics.'];
const KEYS=[['observation',/observ/i],['question',/question|testable/i],['hypothesis',/hypothes|predict/i],['variables',/variable|fair test/i],['conclusion',/conclu|data|evidence/i],['repeat',/repeat|replicat|reliab/i]];

/* ---------- lab ---------- */
let res=null,wired=false;
const cond=p=>({w:$('#'+p+'W').checked,l:$('#'+p+'L').checked,t:$('#'+p+'T').checked});
function sprouts(c,seed){if(!c.w||!c.t)return 0;let n=8+(seed%3);return Math.min(10,n)}
function tray(x,c,n,day){let s=`<rect x="${x}" y="200" width="190" height="40" rx="6" fill="${c.w?'#cfe3f3':'#efe7d8'}" stroke="${GR}"/>`;if(!c.l)s+=`<rect x="${x-5}" y="70" width="200" height="175" rx="8" fill="#222" opacity=".18"/>`+T(x+95,85,'dark box','font-size="11"');
 for(let k=0;k<10;k++){const sx=x+14+k*17.5;const grow=k<n?Math.min(1,day/4):0;s+=`<ellipse cx="${sx}" cy="212" rx="6" ry="4.5" fill="#6b8e23"/>`;if(grow>0){const h=12+60*grow;s+=`<path d="M${sx} 210 q${k%2?6:-6} ${-h/2} 0 ${-h}" stroke="${c.l?GN:'#d8d27a'}" stroke-width="2.5" fill="none"/>`+(grow>.6?`<ellipse cx="${sx+4}" cy="${210-h}" rx="5" ry="3" fill="${c.l?GN:'#e6df8a'}"/>`:'')}}
 s+=T(x+95,262,`${c.w?'water':'no water'} · ${c.l?'light':'dark'} · ${c.t?'warm':'fridge'}`,'font-size="11"');if(!c.t)s+=T(x+95,120,'❄ fridge','font-size="14" fill="'+BL+'"');return s}
function draw(day=res?4:0){const A=cond('a'),B=cond('b');const nA=res?res.a:0,nB=res?res.b:0;let s=T(125,30,'Tray A','font-size="15" font-weight="700"')+T(345,30,'Tray B','font-size="15" font-weight="700"')+tray(30,A,nA,day)+tray(250,B,nB,day);
 if(res)s+=T(125,295,`${nA}/10 sprouted`,'font-size="14" font-weight="700" fill="'+(nA?GN:OR)+'"')+T(345,295,`${nB}/10 sprouted`,'font-size="14" font-weight="700" fill="'+(nB?GN:OR)+'"');$('#gSvg').innerHTML=s}
function diff(){const A=cond('a'),B=cond('b');return ['w','l','t'].filter(k=>A[k]!==B[k])}
const NAME={w:'water',l:'light',t:'warmth'};
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('change',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('gC')){res=null;draw();const d=diff();$('#gOut').innerHTML=d.length===1?`<p>Fair test: only <b>${NAME[d[0]]}</b> differs. Press Run.</p>`:d.length?`<p class="fb no">Unfair: ${d.map(k=>NAME[k]).join(' and ')} differ. Change only one.</p>`:'<p>The trays are identical — change one condition in Tray B.</p>'}})}
function labClick(b){if(b.id==='gRun'){const A=cond('a'),B=cond('b');res={a:sprouts(A,1),b:sprouts(B,2)};let d=0;const t=setInterval(()=>{d+=.5;if(!$('#gSvg')||!$('#gSvg').isConnected){clearInterval(t);return}draw(d);if(d>=4){clearInterval(t);const df=diff();let m=`<p>Tray A: ${res.a}/10 sprouted; Tray B: ${res.b}/10.</p>`;
  if(df.length===1){const k=df[0];m+=k==='l'?'<p class="fb ok">Light did not change germination — seeds sprout in the dark too (though seedlings turn pale and yellow without light). Light is needed later for growth, not for germination.</p>':`<p class="fb ok">Only ${NAME[k]} differed, so ${NAME[k]} explains the difference: seeds need ${NAME[k]} to germinate.</p>`}else if(df.length>1)m+=`<p class="fb no">You changed ${df.map(k=>NAME[k]).join(' and ')} together, so you cannot tell which one caused the result. Make it a fair test.</p>`;else m+='<p>Both trays were the same, so this tells us nothing about any one condition. It can act as a repeat trial.</p>';$('#gOut').innerHTML=m}},120);return true}
 if(b.id==='gRe'){res=null;['aW','aL','aT','bL','bT'].forEach(i=>$('#'+i).checked=true);$('#bW').checked=false;draw();$('#gOut').innerHTML='';return true}return false}
function labChange(){return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
