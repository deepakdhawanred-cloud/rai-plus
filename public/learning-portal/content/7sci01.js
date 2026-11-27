/* Rai Plus content pack: Class 7 Science (Curiosity), Chapter 1 – The Ever-Evolving World of Science. Bilingual terms. */
RP.register({key:'7sci01',cls:'7',subject:'Science',ch:'1',title:"The Ever-Evolving World of Science",color:'#2f6f8a',
crumb:"Class 7 Science · Curiosity · विज्ञान का सतत विकसित होता संसार",h1:"Chapter 1: The Ever-Evolving World of Science",sub:"विज्ञान का सतत विकसित होता संसार. Asking questions, fair tests, how scientific ideas change, and science in society.",heroLabel:"A magnifying glass, a notebook and a question mark",labName:'Fair-test lab',
theme:"\n:root{--g:light-dark(#2f6f8a,#8cc3da);--g2:light-dark(#e6f2f7,#0c1d25);--line:light-dark(#cbe3ed,#21404d);--bg:light-dark(#ffffff,#081217);--card:light-dark(#ffffff,#0d1a20);\n--ink:light-dark(#0d222b,#e0eef4);--mute:light-dark(#4a6470,#a6c3cf);--y:light-dark(#b0306a,#f2a3c6);--y2:light-dark(#fbe9f1,#230b17);--hd:#20536a}\n",
labHTML:`  <h2>Fair-test lab · निष्पक्ष परीक्षण</h2>
  <p>Question: <b id="fQ"></b> Set up two pots so that ONLY the factor you are testing is different. Then run the experiment.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="fSvg" viewBox="0 0 460 300" role="img" aria-label="Two pots in an experiment" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Question<select id="fQs"><option value="light">Does sunlight help a plant grow?</option><option value="water">Does watering help a plant grow?</option><option value="soil">Does compost help a plant grow?</option></select></label></div>
  <div class="ctrl"><b>Pot A</b> <label><input type="checkbox" class="fC" data-p="0" data-k="light" checked> sunlight</label> <label><input type="checkbox" class="fC" data-p="0" data-k="water" checked> water</label> <label><input type="checkbox" class="fC" data-p="0" data-k="soil" checked> compost</label></div>
  <div class="ctrl"><b>Pot B</b> <label><input type="checkbox" class="fC" data-p="1" data-k="light"> sunlight</label> <label><input type="checkbox" class="fC" data-p="1" data-k="water" checked> water</label> <label><input type="checkbox" class="fC" data-p="1" data-k="soil" checked> compost</label></div>
  <div class="ctrl"><button class="btn" id="fRun">Run for 2 weeks</button></div><div class="box y" id="fOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#2f6f8a',LABNAME='Fair-test lab',MIND_CENTER='Science · विज्ञान';
const BL='#2f6f8a',GN='#3b8a3b',OR='#b0306a',BR='#8a5a2a',YE='#e5b93a',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const pot=(x,y,h,leaves,c=GN)=>`<path d="M${x-30} ${y} h60 l-8 40 h-44z" fill="${BR}"/><path d="M${x} ${y} v${-h}" stroke="${c}" stroke-width="3"/>`+[...Array(leaves)].map((_,k)=>{const yy=y-12-k*(h-10)/Math.max(leaves,1);const d=k%2?1:-1;return `<path d="M${x} ${yy} q${d*18} -6 ${d*22} -16 q${-d*16} 0 ${-d*22} 16z" fill="${c}" opacity=".85"/>`}).join('');
function heroDraw(){return `<circle cx="80" cy="60" r="28" fill="none" stroke="#fff" stroke-width="4"/><line x1="100" y1="80" x2="130" y2="110" stroke="#fff" stroke-width="5"/><rect x="180" y="30" width="80" height="90" rx="6" fill="#fff" opacity=".8"/><text x="320" y="95" font-size="70" fill="#fff">?</text>`}
const HERO=heroDraw;
const MIND=[['Science around us',100,50],['Questions & observation',420,50],['Fair tests',90,150],['Ideas change',430,150],['Science & society',110,250],['Being responsible',410,250]];

const C=[
{id:'e1',num:'1.1',title:'Science all around us · हमारे चारों ओर विज्ञान',
 intro:'Why does milk turn into curd? Why does a ceiling fan keep turning after you switch it off?',
 obj:'Recognise that science explains everyday events and connects many topics.',
 prior:'Class 6: The Wonderful World of Science.',
 simple:'Science is a way of understanding the world by asking questions, observing, testing ideas and sharing results. In Class 6 you explored living things, food, magnets, measurement, materials, temperature, water and the sky. In Class 7 you will explore substances, electricity, metals, changes, our bodies, heat, time and motion, plants, light, and the Earth, Moon and Sun.',
 detail:'Science is not just facts in a book; it is a method for finding out. The same method is used by a farmer testing seeds, a doctor diagnosing illness, and an ISRO scientist designing a rocket. Every topic in science links to others: heat links to weather, electricity to magnets, plants to food.',
 real:'Curd-setting at home is science: bacteria change milk using a little warmth.',
 apply:'List three everyday questions you would like science to answer.',
 see:{w:520,h:220,f:[
  ['Questions everywhere.',['Why does curd set?','Why do metals shine?','How does a bulb glow?'].map((t,i)=>lbl(260,50+i*30,t)).join('')],
  ['Science connects topics.',[['substances',80],['electricity',200],['heat',320],['plants',440]].map(([t,x])=>`<circle cx="${x}" cy="170" r="30" fill="${BL}" opacity=".2" stroke="${BL}"/>`+lbl(x,175,t,'font-size="11"')).join('')],
  ['…and it keeps growing.',`<path d="M110 170 h60 M230 170 h60 M350 170 h60" stroke="${BL}" stroke-dasharray="4 3"/>`+lbl(260,215,'Class 7: 12 new journeys','font-weight="700"')]]},
 seeNote:'Science is a way of finding out.',
 do:{title:'Question jar',mat:'A jar, slips of paper',steps:['Each student writes one "why" question.','Put them in the class jar.','Open one each week and investigate.'],obs:'Many interesting questions.',why:'Curiosity drives science.',lab:false},
 memo:'"Ask, observe, test, share."',
 miscon:['"Science is only for scientists in labs." Everyone uses its method.'],
 terms:['Science · विज्ञान','Curiosity · जिज्ञासा','Observation · प्रेक्षण'],
 q:{q:'Science is best described as:',o:['a list of facts','a way of finding out','only experiments','only inventions'],a:1,why:'A method.'},
 exam:'What is science? 1 mark.'},

{id:'e2',num:'1.2',title:'Asking questions and making observations · प्रश्न पूछना और प्रेक्षण',
 intro:'Is "plants are nice" a scientific question? What about "does a plant grow faster in sunlight?"',
 obj:'Frame testable questions and record careful observations.',
 prior:'1.1.',
 simple:'A testable question can be answered by an experiment or observation: "Does salt dissolve faster in hot water?" A good observation is careful and recorded: what you saw, measured, heard or smelled, with numbers and units where possible.',
 detail:'Observations vs. inferences: "the leaf is yellow" is an observation; "the plant lacks water" is an inference (a possible explanation). Scientists keep a notebook with date, materials, steps and results so others can repeat the work. A hypothesis is a possible answer that can be tested.',
 real:'A farmer notes which field gave more wheat and asks why.',
 apply:'Turn "plants like music" into a testable question.',
 see:{w:520,h:200,f:[
  ['Not testable: "plants are nice".',lbl(260,50,'"Plants are nice."','fill="'+GR+'"')],
  ['Testable: compare and measure.',lbl(260,100,'"Does a plant grow taller in sunlight than in shade?"','font-weight="700"')],
  ['Observation vs inference.',lbl(150,160,'observation: leaf is yellow')+lbl(390,160,'inference: maybe it needs water','fill="'+OR+'"')]]},
 seeNote:'Testable = can be checked.',
 do:{title:'Notebook page',mat:'Notebook',steps:['Observe a plant for 5 days.','Record height (cm), leaf colour, date.'],obs:'A data table.',why:'Recorded observations.',lab:false},
 memo:'"See it, measure it, write it."',
 miscon:['"Inferences are facts." They are possible explanations to test.'],
 terms:['Testable question','Observation · प्रेक्षण','Inference · अनुमान','Hypothesis · परिकल्पना'],
 q:{q:'Which is an observation?',o:['The plant is sad','The leaf is 6 cm long','The plant needs love','Plants dislike shade'],a:1,why:'Measured fact.'},
 exam:'Observation vs inference: 2 marks.'},

{id:'e3',num:'1.3',title:'Fair tests and variables · निष्पक्ष परीक्षण और चर',
 intro:'Two pots: one in the sun and watered, the other in shade and not watered. The sunny one grows better. Why can\'t you say it was the sunlight?',
 obj:'Design a fair test by changing only one factor.',
 prior:'1.2.',
 simple:'In a fair test you change only ONE factor (the one you are testing) and keep all other factors the same. Then any difference in the result is because of that one factor. The setup where the factor is absent is the control.',
 detail:'Factors that can change are called variables. Example: testing sunlight → same plant type, pot size, soil, water, and only light differs. Repeating the test with several plants makes the result more reliable. Unfair tests give misleading conclusions.',
 real:'Medicines are tested fairly: one group gets the medicine, a similar group does not.',
 apply:'You want to test if salt dissolves faster in hot water. What must be kept the same?',
 see:{w:520,h:240,f:[
  ['Unfair: two things differ.',pot(110,170,90,4)+pot(210,170,30,1)+lbl(110,30,'sun + water')+lbl(210,30,'shade, no water')+lbl(160,232,'✗ can\'t tell which mattered','fill="'+OR+'"')],
  ['Fair: only light differs.',pot(330,170,90,4)+pot(440,170,40,2,'#9bbf6a')+lbl(330,30,'sun + water')+lbl(440,30,'shade + water')],
  ['Now the difference is due to light.',lbl(385,232,'✓ fair test','fill="'+GN+'" font-weight="700"')]]},
 seeNote:'Change one thing at a time.',
 do:{title:'Dissolving race',mat:'Two glasses, hot and cold water (same amount), sugar',steps:['Add one spoon of sugar to each at the same time.','Stir equally; time until dissolved.'],obs:'Hot water is faster.',why:'Only temperature differs.',lab:true},
 memo:'"One change, everything else same."',
 miscon:['"More differences give more information." They confuse the result.'],
 terms:['Fair test · निष्पक्ष परीक्षण','Variable · चर','Control · नियंत्रण'],
 q:{q:'In a fair test you change:',o:['everything','only one factor','nothing','two factors'],a:1,why:'One variable.'},
 exam:'Design a fair test: 3 marks.'},

{id:'e4',num:'1.4',title:'Scientific ideas change · वैज्ञानिक विचार बदलते हैं',
 intro:'People once believed the Sun goes around the Earth. What changed their minds?',
 obj:'Understand that science changes with new evidence.',
 prior:'1.3.',
 simple:'Scientific ideas are always open to change. When new observations or better instruments give new evidence, ideas are improved or replaced. Science is "ever-evolving" — this is its strength, not a weakness.',
 detail:'Examples: Aryabhata (5th century) said the Earth rotates on its axis, explaining day and night; later Copernicus and Galileo gave evidence that the Earth goes around the Sun. Microscopes revealed tiny living things, changing ideas about disease. Pluto was called a planet until 2006 and is now a dwarf planet. Each change came from careful observation and debate.',
 real:'Your science textbook is updated as knowledge grows.',
 apply:'Why is it good that science can change its mind?',
 see:{w:520,h:200,f:[
  ['Old idea: everything goes round the Earth.',`<circle cx="120" cy="100" r="16" fill="${BL}"/><circle cx="120" cy="100" r="60" fill="none" stroke="${GR}" stroke-dasharray="4 3"/><circle cx="180" cy="100" r="10" fill="${YE}"/>`],
  ['New evidence…',lbl(260,30,'new evidence: telescopes, measurements →','font-weight="700"')],
  ['Better idea: Earth goes round the Sun and spins.',`<circle cx="400" cy="100" r="18" fill="${YE}"/><circle cx="400" cy="100" r="60" fill="none" stroke="${GR}" stroke-dasharray="4 3"/><circle cx="460" cy="100" r="9" fill="${BL}"/>`+lbl(400,190,'Aryabhata: Earth rotates')]]},
 seeNote:'Evidence decides.',
 do:{title:'Then and now',mat:'Library or internet with an adult',steps:['Find one idea in science that changed.','Write what the old and new ideas were and what evidence changed it.'],obs:'Ideas improve.',why:'New evidence.',lab:false},
 memo:'"New evidence, better ideas."',
 miscon:['"If science changes, it can\'t be trusted." Changing with evidence makes it more reliable.'],
 terms:['Evidence · प्रमाण','Theory · सिद्धांत','Aryabhata · आर्यभट'],
 q:{q:'Scientific ideas change mainly because of:',o:['fashion','new evidence','votes','luck'],a:1,why:'Evidence.'},
 exam:'Give an example of a changed scientific idea: 2 marks.'},

{id:'e5',num:'1.5',title:'Science, technology and society · विज्ञान, प्रौद्योगिकी और समाज',
 intro:'How did science help India send Chandrayaan-3 to the Moon?',
 obj:'Connect science with technology and its effects on society.',
 prior:'1.4.',
 simple:'Technology is the use of scientific knowledge to make useful things: phones, vaccines, solar panels, rockets. Science and technology improve health, farming, communication and transport. But they must be used wisely: plastics, pollution and overuse of resources are side effects.',
 detail:'Indian contributions: C. V. Raman (Raman effect, Nobel Prize 1930); Asima Chatterjee (medicines from plants); Janaki Ammal (plant breeding, sugarcane); ISRO\'s Chandrayaan-3 landing near the Moon\'s south pole (2023). Citizens should ask: is this technology safe, fair and sustainable?',
 real:'Mobile phones use science of electricity, light and waves.',
 apply:'Name one technology that helps farmers in Haryana.',
 see:{w:520,h:200,f:[
  ['Science: understanding.',lbl(100,60,'science · विज्ञान','font-weight="700"')+`<circle cx="100" cy="120" r="30" fill="${BL}" opacity=".25"/>`],
  ['Technology: using it.',lbl(260,60,'technology · प्रौद्योगिकी','font-weight="700"')+`<rect x="235" y="95" width="50" height="50" rx="8" fill="${GN}" opacity=".3"/>`],
  ['Society: choices and effects.',lbl(420,60,'society · समाज','font-weight="700"')+`<circle cx="405" cy="120" r="14" fill="${OR}" opacity=".4"/><circle cx="435" cy="120" r="14" fill="${OR}" opacity=".4"/>`+`<path d="M135 120 h95 M290 120 h90" stroke="${GR}" stroke-width="2"/>`]]},
 seeNote:'Use science wisely.',
 do:{title:'Tech interview',mat:'Grandparents or elders',steps:['Ask how daily life was 50 years ago (no phones, LPG, etc.).','List technologies that changed life.'],obs:'Big changes.',why:'Science and technology.',lab:false},
 memo:'"Know (science), make (technology), choose wisely (society)."',
 miscon:['"Technology is always good." It needs wise use.'],
 terms:['Technology · प्रौद्योगिकी','Society · समाज','Sustainable · संधारणीय'],
 q:{q:'C. V. Raman won the Nobel Prize for work on:',o:['electricity','light scattering','plants','rockets'],a:1,why:'Raman effect.'},
 exam:'Contributions of Indian scientists: 2 marks.'},

{id:'e6',num:'1.6',title:'Being a responsible young scientist · एक ज़िम्मेदार युवा वैज्ञानिक',
 intro:'Your result did not match your guess. Should you change the numbers?',
 obj:'Practise honesty, safety and teamwork in science.',
 prior:'1.1–1.5.',
 simple:'Good scientists are honest: they record what they actually observe, even when it is unexpected. They work safely: follow instructions, wear protection, never taste chemicals, handle heat and glass carefully. They share and discuss results respectfully, and they repeat experiments to check.',
 detail:'Unexpected results are valuable — they can lead to discoveries. Teamwork: different people notice different things. Respect living things during investigations; do not harm plants and animals unnecessarily.',
 real:'Penicillin was discovered because Alexander Fleming paid attention to an unexpected result.',
 apply:'List three safety rules for your science lab.',
 see:{w:520,h:200,f:[
  ['Honest records.',`<rect x="60" y="40" width="80" height="100" rx="6" fill="#fff" stroke="${ink}"/>`+[0,1,2,3].map(k=>`<line x1="70" y1="${60+k*18}" x2="130" y2="${60+k*18}" stroke="${GR}"/>`).join('')+lbl(100,165,'record truly')],
  ['Safety first.',`<path d="M260 40 l40 70 h-80z" fill="${YE}" stroke="${ink}"/>`+lbl(260,95,'!','font-size="26" font-weight="700"')+lbl(260,165,'goggles, care with heat')],
  ['Share and repeat.',`<circle cx="400" cy="80" r="16" fill="${BL}" opacity=".5"/><circle cx="440" cy="80" r="16" fill="${OR}" opacity=".5"/>`+lbl(420,165,'discuss, repeat, check')]]},
 seeNote:'Honest, safe, curious.',
 do:{title:'Lab rules poster',mat:'Chart paper',steps:['Make a class poster of 5 lab safety rules.'],obs:'Shared rules.',why:'Safety.',lab:false},
 memo:'"Honest records, safe hands, open mind."',
 miscon:['"Wrong results mean failure." They are information.'],
 terms:['Honesty · ईमानदारी','Safety · सुरक्षा','Repeat · दोहराना'],
 q:{q:'An unexpected result should be:',o:['hidden','changed','recorded honestly','ignored'],a:2,why:'Honesty.'},
 exam:'Qualities of a scientist: 2 marks.'}
];

const CARDS=[['Science','A way of finding out.'],['Testable question','Can be checked by experiment.'],['Observation','What you see/measure.'],['Inference','Possible explanation.'],['Hypothesis','A testable possible answer.'],['Fair test','Change only one factor.'],['Variable','A factor that can change.'],['Control','Setup without the factor tested.'],['Ever-evolving','Ideas change with evidence.'],['Technology','Using science to make things.'],['Responsibility','Honest, safe, respectful.']];

const Q=[
 {lv:1,q:'Which is a testable question?',o:['Is red the best colour?','Does sugar dissolve faster in hot water?','Are cats cute?','Is maths fun?'],a:1,w:'Can be tested.'},
 {lv:1,q:'In a fair test, how many factors do you change?',o:['0','1','2','all'],a:1,w:'One.'},
 {lv:1,q:'Using science to make useful things is:',o:['technology','art','history','luck'],a:0,w:'Technology.'},
 {lv:2,q:'"The soil is wet" is:',o:['an inference','an observation','a hypothesis','a law'],a:1,w:'Seen directly.'},
 {lv:2,q:'Aryabhata said the Earth:',o:['is flat','rotates on its axis','is the largest planet','has no moon'],a:1,w:'Rotation explains day/night.'},
 {lv:2,q:'Scientific ideas change because of:',o:['new evidence','opinions','popularity','age'],a:0,w:'Evidence.'},
 {lv:3,q:'Testing if light helps growth, pot B (control) should have:',o:['no water','no light, everything else same','different soil','different plant'],a:1,w:'Only light differs.'},
 {lv:3,q:'Repeating an experiment makes results:',o:['less reliable','more reliable','useless','wrong'],a:1,w:'Checks.'},
 {lv:4,q:'Two pots: A sunny+watered, B shady+dry. A grows better. Conclusion:',o:['light helps','water helps','can\'t tell — unfair test','both help equally'],a:2,w:'Two factors differ.'},
 {lv:4,q:'Your result disagrees with the book. Best action:',o:['change your data','repeat carefully and report honestly','give up','copy a friend'],a:1,w:'Honesty and checking.'},
 {lv:5,open:true,m:3,q:'Design a fair test: does compost help plants grow?',ans:['Two similar pots, same plant, light, water (1)','Only one gets compost (1)','Measure height over 2 weeks; compare (1)']},
 {lv:5,open:true,m:2,q:'Why is science called "ever-evolving"?',ans:['Ideas improve or change with new evidence (1)','Example: Earth goes round the Sun / Pluto reclassified (1)']}
];

const ONEMIN=['Science: a way of finding out.','Testable questions; observation vs inference.','Fair test: change one variable; control.','Ideas change with evidence.','Science → technology → society.','Be honest, safe and curious.'];
const KEYS=[['question',/question/i],['observation',/observ/i],['fair test',/fair|variable|control/i],['evidence',/evidence|change/i],['technology',/technolog/i],['honesty/safety',/honest|safe/i]];

/* ---------- lab ---------- */
let q='light',ran=false;const Qs={light:'Does sunlight help a plant grow?',water:'Does watering help a plant grow?',soil:'Does compost help a plant grow?'};
function state(){const S=[{},{}];$$('.fC').forEach(c=>S[+c.dataset.p][c.dataset.k]=c.checked);return S}
function growth(s){let g=2;if(s.light)g+=5;if(s.water)g+=4;if(s.soil)g+=2;if(!s.water)g=Math.min(g,3);if(!s.light)g=Math.min(g,4);return g}
function draw(){const S=state();let s='';[0,1].forEach(p=>{const x=p?340:120,st=S[p];const g=ran?growth(st):2;
 s+=(st.light?`<circle cx="${x+70}" cy="40" r="16" fill="${YE}"/>`:`<rect x="${x-60}" y="20" width="120" height="16" fill="#555" opacity=".5"/>`)+(st.water?`<path d="M${x-50} 120 l6 12 a7 7 0 1 1 -12 0z" fill="#4a78c8"/>`:'')+(st.soil?`<rect x="${x-26}" y="232" width="52" height="8" fill="#5a3a1a"/>`:'');
 s+=pot(x,232,20+g*12,Math.max(1,Math.round(g/2)),st.light?GN:'#a8c27a')+T(x,290,'Pot '+'AB'[p]+(ran?` · ${(2+g*1.5).toFixed(1)} cm`:''),'font-size="13" font-weight="700"')});
 $('#fSvg').innerHTML=s;$('#fQ').textContent=Qs[q]}
function judge(){const S=state();const diff=['light','water','soil'].filter(k=>S[0][k]!==S[1][k]);
 if(diff.length===0)return `<p class="fb no">Both pots are the same — nothing is being tested. Make the factor "${q}" different.</p>`;
 if(diff.length>1)return `<p class="fb no">Unfair test: ${diff.join(' and ')} are both different. You can't tell which caused the change.</p>`;
 if(diff[0]!==q)return `<p class="fb no">Fair, but you are testing "${diff[0]}", not "${q}". Change only ${q}.</p>`;
 const withF=S[0][q]?0:1,g1=growth(S[withF]),g0=growth(S[1-withF]);
 return `<p class="fb ok">Fair test! Only ${q} differs. Pot ${'AB'[1-withF]} is the control.</p><p>Result: with ${q}: ${(2+g1*1.5).toFixed(1)} cm; without: ${(2+g0*1.5).toFixed(1)} cm. ${g1>g0?`So ${q} helps the plant grow.`:'No clear difference — try other conditions.'}</p><p class="note">Scientists would repeat with several plants to be sure.</p>`}
function labShow(){draw();$('#fOut').innerHTML='<p>Set the two pots, then press Run.</p>'}
function labInit(){}
function labClick(b){if(b.id==='fRun'){ran=true;draw();$('#fOut').innerHTML=judge();return true}return false}
function labChange(t){if(t.id==='fQs'){q=t.value;ran=false;draw();$('#fOut').innerHTML='<p>Set the two pots, then press Run.</p>';return true}if(t.classList&&t.classList.contains('fC')){ran=false;draw();$('#fOut').innerHTML='<p>Press Run to see what happens.</p>';return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
