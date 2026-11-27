/* Rai Plus content pack: Class 6 Science (Curiosity), Chapter 1 – The Wonderful World of Science. Bilingual terms (Jigyasa). */
RP.register({key:'6sci01',cls:'6',subject:'Science',ch:'1',title:"The Wonderful World of Science",color:'#1f6f8b',
crumb:"Class 6 Science · Curiosity · विज्ञान का अद्भुत संसार",h1:"Chapter 1: The Wonderful World of Science",sub:"विज्ञान का अद्भुत संसार. Science starts with curiosity and follows a careful way of finding answers.",heroLabel:"A magnifying glass over a leaf with question marks",labName:'Scientist lab',
theme:"\n:root{--g:light-dark(#1f6f8b,#8fd0e6);--g2:light-dark(#e8f4f8,#0c1d24);--line:light-dark(#cfe5ee,#22404b);--bg:light-dark(#ffffff,#0a1215);--card:light-dark(#ffffff,#0f191d);\n--ink:light-dark(#0f1c21,#e2eff3);--mute:light-dark(#4c636b,#a5bcc4);--y:light-dark(#b3541e,#f2a774);--y2:light-dark(#fbeee4,#2a170a);--hd:#175469}\n",
labHTML:`  <h2>Scientist lab · वैज्ञानिक प्रयोगशाला</h2>
  <p>Put the steps of the scientific method in order, then use them to solve a mystery.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="mSvg" viewBox="0 0 460 320" role="img" aria-label="Scientific method steps" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mystery<select id="mCase"><option value="pen">My pen stopped writing</option><option value="plant">The plant on the windowsill is drooping</option><option value="torch">The torch does not light</option></select></label></div><div id="mBtns" class="ctrl" style="flex-wrap:wrap"></div><div class="box y" id="mOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#1f6f8b',LABNAME='Scientist lab',MIND_CENTER='Science · विज्ञान';
const TE='#1f6f8b',OR='#b3541e',GN='#3b6d11',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,'font-size="14" '+o);
const STEPS=[['Observe · प्रेक्षण','Notice something'],['Question · प्रश्न','Ask why or how'],['Hypothesis · परिकल्पना','Make a sensible guess'],['Experiment · प्रयोग','Test the guess'],['Analyse · विश्लेषण','Look at the results'],['Conclude · निष्कर्ष','Accept or change the guess']];
const cycle=(cx,cy,r,hi=-1)=>STEPS.map((s,i)=>{const a=-Math.PI/2+i*Math.PI/3,x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);return `<circle cx="${x}" cy="${y}" r="34" fill="${i===hi?OR:TE}" opacity="${i===hi?.9:.75}"/>`+T(x,y-2,s[0].split(' · ')[0],'font-size="12" fill="#fff" font-weight="700"')+T(x,y+13,s[0].split(' · ')[1],'font-size="10" fill="#fff"')}).join('');
function heroDraw(){return `<circle cx="70" cy="60" r="28" fill="none" stroke="#fff" stroke-width="5"/><line x1="90" y1="80" x2="120" y2="110" stroke="#fff" stroke-width="7"/><text x="170" y="70" font-size="40" fill="#fff" font-weight="700">?</text><text x="215" y="100" font-size="30" fill="#fff" opacity=".7">?</text>`}
const HERO=heroDraw;
const MIND=[['Curiosity',100,50],['Science is everywhere',420,50],['Our planet Earth',90,150],['Water & materials',430,150],['Scientific method',110,250],['Working together',410,250]];

const C=[
{id:'w1',num:'1.1',title:'What is science? · विज्ञान क्या है?',
 intro:'A baby touches, shakes and tastes everything. Is that baby already doing science?',
 obj:'Explain that science is a way of thinking, observing and doing to understand the world, and that curiosity starts it.',
 prior:'Your own questions about the world around you.',
 simple:'Science is a way of exploring and understanding the world around us. It begins with curiosity (जिज्ञासा): the wish to know more. Scientists observe carefully, ask questions, make guesses, test them and think about the results.',
 detail:'From infancy we explore by touching, tasting and watching. Taking apart a toy to see how it works is curiosity in action. Science is not just facts in a book; it is a process of discovery that never really ends, because every answer leads to new questions. Anyone who observes carefully and asks "why?" and "how?" is thinking like a scientist.',
 real:'Asking why rotis puff up on a hot tawa is the start of a scientific question.',
 apply:'Write three "why" or "how" questions about things you saw today.',
 see:{w:520,h:220,f:[
  ['Curiosity: noticing something and wanting to know more.',`<circle cx="90" cy="110" r="40" fill="none" stroke="${TE}" stroke-width="5"/><line x1="120" y1="140" x2="160" y2="180" stroke="${TE}" stroke-width="8"/>`+lbl(90,115,'?','font-size="36" font-weight="700"')],
  ['Science = observing, asking, guessing, testing, thinking.',lbl(340,80,'observe → ask → guess','font-size="15"')+lbl(340,115,'→ test → think','font-size="15"')],
  ['It never ends: each answer brings new questions.',lbl(340,175,'science · विज्ञान','font-size="18" font-weight="700"')]]},
 seeNote:'Science is a process, not just a list of facts.',
 do:{title:'Question jar',mat:'A jar, paper slips',steps:['For one week, write every question you wonder about on a slip.','At the end, sort them: which could you test yourself?'],obs:'Many everyday questions can be tested.',why:'Curiosity is where science begins.',lab:false},
 memo:'"Curiosity is the key that opens science."',
 miscon:['"Science is only for scientists in labs." Everyone can think scientifically.','"Science is just memorising facts." It is a way of finding out.'],
 terms:['Science · विज्ञान','Curiosity · जिज्ञासा','Observe · प्रेक्षण करना','Question · प्रश्न'],
 q:{q:'Science begins with:',o:['memorising','curiosity','guessing randomly','copying'],a:1,why:'Curiosity leads to questions.'},
 exam:'"What is science?" in your own words: 2 marks.'},

{id:'w2',num:'1.2',title:'Science is everywhere',
 intro:'Why do stars shine? Why do flowers bloom in spring?',
 obj:'Recognise that science explains things from tiny grains of sand to huge stars, and helps solve real problems.',
 prior:'What is science (1.1).',
 simple:'Science is about everything: grains of sand, mountains, leaves, forests, our bodies and the stars. Stars shine because of reactions inside them. Plants bloom in response to light and temperature. Understanding how plants grow helps farmers grow better crops.',
 detail:'Science connects many parts of life: cooking, farming, medicine, travel and communication all use scientific ideas. The same way of thinking can help us ask questions about food we eat, the water we drink and the things we use, and to look after our environment.',
 real:'Weather forecasts that help farmers decide when to sow are made using science.',
 apply:'Name three things in your kitchen that work because of science.',
 see:{w:520,h:220,f:[
  ['Tiny: grains of sand.',[...Array(12)].map((_,i)=>`<circle cx="${40+(i%4)*14}" cy="${150+Math.floor(i/4)*12}" r="4" fill="#c9a227"/>`).join('')+lbl(60,200,'sand','font-size="12"')],
  ['Living: leaves and forests.',`<path d="M200 190 v-60 M200 140 q-30 -20 -10 -50 q20 20 10 50 q30 -20 10 -50" stroke="${GN}" stroke-width="3" fill="${GN}" opacity=".7"/>`+lbl(200,210,'plants','font-size="12"')],
  ['Huge: the Sun and stars.',`<circle cx="400" cy="100" r="40" fill="#f2b632"/>`+[0,1,2,3,4,5,6,7].map(i=>{const a=i*Math.PI/4;return `<line x1="${400+48*Math.cos(a)}" y1="${100+48*Math.sin(a)}" x2="${400+62*Math.cos(a)}" y2="${100+62*Math.sin(a)}" stroke="#f2b632" stroke-width="3"/>`}).join('')+lbl(400,190,'stars','font-size="12"')]]},
 seeNote:'From the very small to the very large.',
 do:{title:'Science hunt',mat:'Notebook',steps:['Walk around your home or school.','List 10 things and the science you think is behind each.'],obs:'Science is in almost everything.',why:'Science explains how things work.',lab:false},
 memo:'"From sand to stars, science is there."',
 miscon:['"Science is only in laboratories." It is all around us.'],
 terms:['Universe · ब्रह्मांड','Living · सजीव','Non-living · निर्जीव'],
 q:{q:'Farmers grow better crops by understanding:',o:['how plants grow','cartoons','music','sports'],a:0,why:'Science of plant growth.'},
 exam:'Give examples of science in daily life: 2 marks.'},

{id:'w3',num:'1.3',title:'Exploring our home: water and materials',
 intro:'Ice, water and steam: are they the same thing?',
 obj:'Recall that Earth is the only known planet with life, that water exists as solid, liquid and gas, and that objects are made of different materials.',
 prior:'Science is everywhere (1.2).',
 simple:'Earth is the only planet known to have life. It has many environments: forests, oceans, deserts and wetlands. Water can be solid (ice), liquid (water) or gas (steam/water vapour). Pure water freezes at 0 °C and boils at 100 °C. Everyday objects are made from different materials such as metal, plastic, rubber, wood, glass and fabric.',
 detail:'Plants need water, sunlight and nutrients from the soil to grow from seeds. A caterpillar changing into a butterfly is called metamorphosis (कायांतरण). Food gives us energy and helps us grow; Indian regional dishes use many ingredients from plants and animals. A thermometer measures how hot or cold something is (temperature). Knowing what objects are made of helps us sort waste for recycling: paper, plastic and metal can be separated.',
 real:'Separating dry waste (paper, plastic, metal) from wet waste at home helps recycling.',
 apply:'List five objects in your bag and the material each is made of.',
 see:{w:520,h:220,f:[
  ['Ice (solid) · बर्फ',`<rect x="60" y="90" width="60" height="60" rx="6" fill="#cfe9f7" stroke="${TE}"/>`+lbl(90,175,'solid · ठोस','font-size="12"')],
  ['Water (liquid) · जल',`<path d="M220 150 q30 -60 60 0 q-30 25 -60 0z" fill="#378add" opacity=".7"/>`+lbl(250,175,'liquid · द्रव','font-size="12"')],
  ['Steam (gas) · भाप. Freezes at 0 °C, boils at 100 °C.',[0,1,2].map(i=>`<path d="M${400+i*20} 150 q-10 -20 0 -40 q10 -20 0 -40" fill="none" stroke="${GR}" stroke-width="3"/>`).join('')+lbl(420,175,'gas · गैस','font-size="12"')+lbl(260,210,'0 °C freezes · 100 °C boils','font-weight="700"')]]},
 seeNote:'Same substance, three states.',
 do:{title:'Material sort',mat:'10 everyday objects',steps:['Make piles by material: metal, plastic, wood, glass, fabric, paper.','Decide which can be recycled.'],obs:'Objects can be grouped by material.',why:'Materials have different properties.',lab:false},
 memo:'"Ice, water, steam: one water, three states."',
 miscon:['"Steam is a different substance from water." It is water in gas form.'],
 terms:['Solid · ठोस','Liquid · द्रव','Gas · गैस','Temperature · ताप','Material · पदार्थ','Metamorphosis · कायांतरण'],
 q:{q:'Pure water boils at:',o:['0 °C','50 °C','100 °C','37 °C'],a:2,why:'At normal pressure.'},
 exam:'States of water and their temperatures: 1–2 marks.'},

{id:'w4',num:'1.4',title:'The scientific method · वैज्ञानिक विधि',
 intro:'How do scientists make sure their answers are reliable?',
 obj:'List and explain the steps of the scientific method.',
 prior:'Curiosity and questions.',
 simple:'The scientific method is a step-by-step way to find reliable answers: (1) observe something; (2) ask a question; (3) make a hypothesis (परिकल्पना), a sensible guess; (4) test it with an experiment; (5) analyse the results; (6) conclude: does the result support the guess? If not, change the guess and test again.',
 detail:'A good hypothesis can be tested. A fair test changes only one thing at a time and keeps everything else the same. Recording observations carefully (in a table or notebook) lets others check your work. Even if a hypothesis turns out wrong, we learn something, and science moves forward.',
 real:'Doctors use the same steps to find why a patient has a fever: observe symptoms, guess a cause, test, decide.',
 apply:'Your bicycle tyre goes flat every night. Write a hypothesis and a test.',
 see:{w:520,h:280,f:[
  ['Observe and ask.',cycle(260,140,105,0)],
  ['Make a hypothesis and experiment.',cycle(260,140,105,3)],
  ['Analyse and conclude; if needed, go round again.',`<path d="M200 140 a60 60 0 1 1 120 0" fill="none" stroke="${GR}" stroke-dasharray="5 4"/>`+lbl(260,145,'repeat','font-size="12"')]]},
 seeNote:'The steps form a cycle.',
 do:{title:'Melting race',mat:'Three ice cubes, plates, a cloth, a steel bowl',steps:['Hypothesis: the cube under the cloth will melt slowest.','Put one cube in open air, one under cloth, one in the steel bowl.','Check every 5 minutes; record.'],obs:'Results support or reject your guess.',why:'Experiment tests the hypothesis.',lab:true},
 memo:'"O-Q-H-E-A-C: Observe, Question, Hypothesis, Experiment, Analyse, Conclude."',
 miscon:['"A hypothesis must be correct." It is a testable guess; it can be wrong.','"One test proves it forever." Repeat tests to be sure.'],
 terms:['Scientific method · वैज्ञानिक विधि','Hypothesis · परिकल्पना','Experiment · प्रयोग','Analysis · विश्लेषण','Conclusion · निष्कर्ष'],
 q:{q:'A sensible guess that can be tested is a:',o:['conclusion','hypothesis','observation','result'],a:1,why:'Definition.'},
 exam:'Order the steps of the scientific method: 2–3 marks.'},

{id:'w5',num:'1.5',title:'The scientific method in action',
 intro:'Your pen suddenly stops writing. How would a scientist find out why?',
 obj:'Apply the scientific method to an everyday problem and appreciate teamwork in science.',
 prior:'Steps of the scientific method (1.4).',
 simple:'Observation: the pen stopped writing. Question: why? Hypothesis: the ink has run out. Test: open the pen and look at the refill. If the refill is empty, the hypothesis is supported. If it is not empty, think of another reason, for example the ink dried because the cap was left off, and test that.',
 detail:'Scientists rarely work alone. They share results, check each other\'s work and build on earlier discoveries. In class, working with friends, discussing ideas and respecting different views is part of doing science. The world is full of wonders waiting to be explored: the journey of learning continues all our lives.',
 real:'Mechanics, electricians and cooks all troubleshoot using these steps every day.',
 apply:'Use the steps to explain how you would find why a torch does not light.',
 see:{w:520,h:220,f:[
  ['Observe: the pen stopped writing.',`<rect x="40" y="100" width="140" height="18" rx="9" fill="${TE}"/><path d="M180 109 l20 -6 v12z" fill="${ink}"/>`+lbl(110,150,'?','font-size="28"')],
  ['Hypothesis: the ink ran out → test: look at the refill.',`<rect x="250" y="100" width="140" height="10" rx="5" fill="#ddd" stroke="${ink}"/><rect x="250" y="100" width="20" height="10" rx="5" fill="#2e6fb5"/>`+lbl(320,140,'refill nearly empty','font-size="12"')],
  ['Conclude: hypothesis supported. If not, try a new hypothesis.',lbl(260,200,'supported ✓  ·  rejected → new guess','font-weight="700"')]]},
 seeNote:'A wrong guess is still useful: it rules something out.',
 do:{title:'Mystery box',mat:'A closed box with an object inside',steps:['Shake, weigh and listen to the box.','Each team writes a hypothesis and evidence.','Open and compare.'],obs:'Evidence narrows the possibilities.',why:'Observation and testing guide conclusions.',lab:true},
 memo:'"Guess, check, learn, repeat."',
 miscon:['"If the first guess is wrong, the method failed." That is how the method works.'],
 terms:['Evidence · प्रमाण','Teamwork · टीम कार्य','Fair test'],
 q:{q:'If the refill is full but the pen still won\'t write, you should:',o:['give up','form a new hypothesis','say the first guess was right','throw away all pens'],a:1,why:'Revise and test again.'},
 exam:'Apply the method to a situation: 3 marks.'}
];

const CARDS=[['Science · विज्ञान','A way of observing, asking and testing to understand the world.'],['Curiosity · जिज्ञासा','The wish to know more; where science starts.'],['States of water','Ice (solid), water (liquid), steam (gas).'],['0 °C and 100 °C','Water freezes at 0 °C, boils at 100 °C.'],['Materials','Metal, plastic, rubber, wood, glass, fabric, paper.'],['Metamorphosis · कायांतरण','Caterpillar → butterfly.'],['Scientific method','Observe → question → hypothesis → experiment → analyse → conclude.'],['Hypothesis · परिकल्पना','A sensible, testable guess.'],['Fair test','Change one thing; keep the rest the same.']];

const Q=[
 {lv:1,q:'Science starts with:',o:['curiosity','a book','a lab','a teacher only'],a:0,w:'Curiosity leads to questions.'},
 {lv:1,q:'Water in the gas form is called:',o:['ice','steam/water vapour','snow','dew'],a:1,w:'Gas state.'},
 {lv:1,q:'The first step of the scientific method is:',o:['conclusion','experiment','observation','hypothesis'],a:2,w:'Notice something first.'},
 {lv:2,q:'A testable guess is called a:',o:['result','hypothesis','question','law'],a:1,w:'Hypothesis.'},
 {lv:2,q:'Water freezes at:',o:['0 °C','100 °C','10 °C','−10 °C'],a:0,w:'Pure water.'},
 {lv:2,q:'A caterpillar becoming a butterfly is:',o:['evaporation','metamorphosis','melting','germination'],a:1,w:'Change in form.'},
 {lv:3,q:'Correct order:',o:['Hypothesis → Observe → Conclude','Observe → Question → Hypothesis → Experiment','Experiment → Question → Observe','Conclude → Hypothesis → Observe'],a:1,w:'O-Q-H-E-A-C.'},
 {lv:3,q:'In a fair test of which cloth dries fastest, you should:',o:['use different amounts of water','change only the cloth type','dry some in sun and some in shade','use different sizes'],a:1,w:'One variable at a time.'},
 {lv:4,q:'Your hypothesis is not supported by the experiment. The best next step is to:',o:['hide the result','change the result','form a new hypothesis and test it','stop'],a:2,w:'Science revises ideas.'},
 {lv:4,q:'Which is a testable hypothesis?',o:['Roses are the prettiest flowers','Plants kept in the dark will grow less than plants in light','Science is fun','Blue is the best colour'],a:1,w:'Can be measured.'},
 {lv:5,open:true,m:3,q:'Your torch does not light. Use the scientific method to find the reason.',ans:['Observe/question: torch not lighting — why? (1)','Hypothesis: battery is dead; test by replacing it (1)','Analyse/conclude; if still not lit, new hypothesis (bulb or switch) and test (1)']},
 {lv:5,open:true,m:3,q:'Name the three states of water with an example of each, and the temperatures at which water changes state.',ans:['Solid: ice; liquid: water; gas: steam (1)','Freezes at 0 °C (1)','Boils at 100 °C (1)']}
];

const ONEMIN=['Science: a way of exploring and understanding the world.','It starts with curiosity (जिज्ञासा).','Science is everywhere: sand to stars.','Earth: only known planet with life.','Water: ice, water, steam; 0 °C and 100 °C.','Objects are made of different materials; sort to recycle.','Scientific method: observe, question, hypothesis, experiment, analyse, conclude.','A wrong hypothesis is still useful; revise and test again.'];
const KEYS=[['curiosity',/curio|जिज्ञासा/i],['observe',/observ|प्रेक्षण/i],['question',/question|प्रश्न/i],['hypothesis',/hypothes|guess|परिकल्पना/i],['experiment',/experiment|test|प्रयोग/i],['conclusion',/conclu|निष्कर्ष/i],['states of water',/ice|steam|solid|liquid|gas/i],['materials',/material|metal|plastic/i]];

/* ---------- lab ---------- */
let order=[],cs='pen';
const CASES={pen:{obs:'My pen stopped writing.',hyp:[['The ink has run out.','Open it: the refill is empty. Supported!',true],['The pen is broken.','The pen writes with a new refill. Not supported.',false],['The ink dried (cap left off).','Some ink is left but it is dry at the tip. Supported too — more than one cause is possible!',true]]},plant:{obs:'The plant on the windowsill is drooping.',hyp:[['It needs water.','Soil is dry; after watering, it stands up in a few hours. Supported!',true],['It has too much sunlight.','Moving it to shade alone does not help. Not supported.',false],['Insects are eating it.','No insects or bites seen. Not supported.',false]]},torch:{obs:'The torch does not light.',hyp:[['The batteries are dead.','New batteries: it lights! Supported.',true],['The bulb is fused.','Bulb filament is fine. Not supported.',false],['The switch is dirty.','Cleaning the switch does nothing. Not supported.',false]]}};
function drawOrder(){let s='';const correct=order.length===6&&order.every((v,i)=>v===i);for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3,x=230+110*Math.cos(a),y=160+110*Math.sin(a);const k=order[i];s+=`<circle cx="${x}" cy="${y}" r="38" fill="${k===undefined?'none':k===i?TE:OR}" stroke="${TE}" stroke-width="2" opacity="${k===undefined?1:.85}"/>`+T(x,y-26+0,String(i+1),'font-size="11"')+(k!==undefined?T(x,y+4,STEPS[k][0].split(' · ')[0],'font-size="12" fill="#fff" font-weight="700"')+T(x,y+18,STEPS[k][0].split(' · ')[1],'font-size="10" fill="#fff"'):'')}
 if(correct)s+=T(230,165,'✓ correct!','font-size="16" font-weight="700" fill="'+GN+'"');$('#mSvg').innerHTML=s;return correct}
function btns(){const shuffled=[3,0,5,1,4,2];$('#mBtns').innerHTML=shuffled.filter(k=>!order.includes(k)).map(k=>`<button class="btn" data-step="${k}">${STEPS[k][0]}</button>`).join('')+(order.length?'<button class="btn" id="mReset">Reset</button>':'')}
function caseHTML(){const c=CASES[cs];return `<p><b>Observation:</b> ${c.obs}</p><p>Pick a hypothesis to test:</p>`+c.hyp.map((h,i)=>`<button class="btn" data-hyp="${i}" style="margin:3px 0">${h[0]}</button>`).join('<br>')}
function labShow(){order=[];drawOrder();btns();$('#mOut').innerHTML='<p>Tap the steps in the right order, starting from step 1 at the top.</p>'}
function labInit(){}
function labClick(b){if(b.dataset.step!==undefined){order.push(+b.dataset.step);const ok=drawOrder();btns();const i=order.length-1;if(order[i]!==i)$('#mOut').innerHTML=`<p class="fb no">Step ${i+1} should be <b>${STEPS[i][0]}</b> (${STEPS[i][1]}). Reset and try again.</p>`;else if(ok)$('#mOut').innerHTML='<p class="fb ok">All six in order!</p>'+caseHTML();else $('#mOut').innerHTML=`<p class="fb ok">Good: ${STEPS[i][1]}.</p>`;return true}
 if(b.id==='mReset'){labShow();return true}
 if(b.dataset.hyp!==undefined){const h=CASES[cs].hyp[+b.dataset.hyp];$('#mOut').innerHTML=caseHTML()+`<p class="fb ${h[2]?'ok':'no'}"><b>Experiment result:</b> ${h[1]}</p><p>${h[2]?'Conclusion: the hypothesis is supported.':'Conclusion: reject this guess and test another one.'}</p>`;return true}return false}
function labChange(t){if(t.id==='mCase'){cs=t.value;if(order.length===6&&order.every((v,i)=>v===i))$('#mOut').innerHTML='<p class="fb ok">All six in order!</p>'+caseHTML();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
