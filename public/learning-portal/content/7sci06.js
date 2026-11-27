/* Rai Plus content pack: Class 7 Science (Curiosity), Chapter 6 – Adolescence: A Stage of Growth and Change. Bilingual terms. Age-appropriate, NCERT-level. */
RP.register({key:'7sci06',cls:'7',subject:'Science',ch:'6',title:"Adolescence: A Stage of Growth and Change",color:'#3c7a6e',
crumb:"Class 7 Science · Curiosity · किशोरावस्था: वृद्धि एवं परिवर्तन की अवस्था",h1:"Chapter 6: Adolescence — A Stage of Growth and Change",sub:"किशोरावस्था. Body changes during puberty, hormones, feelings and friendships, nutrition and hygiene, and making healthy choices.",heroLabel:"Children of different heights growing up",labName:'Healthy-day planner',
theme:"\n:root{--g:light-dark(#3c7a6e,#9fd6ca);--g2:light-dark(#e7f3f0,#0b1a17);--line:light-dark(#cbe5de,#21403a);--bg:light-dark(#ffffff,#08110f);--card:light-dark(#ffffff,#0d1916);\n--ink:light-dark(#0e2420,#e0f0ec);--mute:light-dark(#4a6660,#a8c8c1);--y:light-dark(#a3501b,#f0a877);--y2:light-dark(#fbeee4,#2a160a);--hd:#2b5c53}\n",
labHTML:`  <h2>Healthy-day planner · स्वस्थ दिनचर्या</h2>
  <p>Plan one day for a growing teenager. Choose foods and set sleep, activity and screen time. See which needs are met.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="hSvg" viewBox="0 0 460 320" role="img" aria-label="Daily plan check" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><b>Foods today</b><br><label><input type="checkbox" class="hF" data-f="dal" checked> Dal / rajma / chana</label> <label><input type="checkbox" class="hF" data-f="green"> Green leafy sabzi</label> <label><input type="checkbox" class="hF" data-f="milk" checked> Milk / curd / paneer</label> <label><input type="checkbox" class="hF" data-f="fruit"> Fruit (amla, guava, orange)</label> <label><input type="checkbox" class="hF" data-f="grain" checked> Roti / rice / bajra</label> <label><input type="checkbox" class="hF" data-f="egg"> Egg / jaggery-peanut chikki</label> <label><input type="checkbox" class="hF" data-f="junk" checked> Chips / cold drink</label></div>
  <div class="ctrl"><label>Sleep: <b id="hSv"></b><input type="range" class="hS" id="hSl" min="5" max="11" step="0.5" value="7"></label></div>
  <div class="ctrl"><label>Active play / exercise: <b id="hAv"></b><input type="range" class="hS" id="hAc" min="0" max="120" step="10" value="30"></label></div>
  <div class="ctrl"><label>Screen time (fun): <b id="hTv"></b><input type="range" class="hS" id="hTm" min="0" max="6" step="0.5" value="3"></label></div>
  <div class="box y" id="hOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3c7a6e',LABNAME='Healthy-day planner',MIND_CENTER='Adolescence · किशोरावस्था';
const TL='#3c7a6e',OR='#a3501b',GN='#3b8a3b',RD='#c0392b',BL='#2f6f8a',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const kid=(x,y,h,c=TL)=>`<circle cx="${x}" cy="${y-h}" r="${h*0.12}" fill="${c}"/><rect x="${x-h*0.12}" y="${y-h*0.86}" width="${h*0.24}" height="${h*0.5}" rx="${h*0.06}" fill="${c}"/><rect x="${x-h*0.1}" y="${y-h*0.38}" width="${h*0.08}" height="${h*0.38}" fill="${c}"/><rect x="${x+h*0.02}" y="${y-h*0.38}" width="${h*0.08}" height="${h*0.38}" fill="${c}"/>`;
function heroDraw(){return kid(60,120,60,'#fff')+kid(130,120,80,'#fff')+kid(210,120,100,'#fff')}
const HERO=heroDraw;
const MIND=[['What is adolescence?',100,50],['Body changes',420,50],['Hormones',90,150],['Feelings & friendships',430,150],['Food & hygiene',110,250],['Healthy choices',410,250]];

const C=[
{id:'h1',num:'6.1',title:'What is adolescence? · किशोरावस्था क्या है?',
 intro:'Have you noticed that your clothes from last year don\'t fit any more?',
 obj:'Describe adolescence and puberty as a natural stage of growth.',
 prior:'Class 6: characteristics of living things (growth).',
 simple:'Adolescence (किशोरावस्था) is the period of life between childhood and adulthood, roughly from 10 to 19 years. During this time the body and mind change a lot. Puberty (यौवनारंभ) is the part of adolescence when the body begins to mature. These changes are natural and happen to everyone, but at different times and speeds.',
 detail:'Girls often begin puberty a little earlier than boys. Some classmates may grow taller earlier and others later — both are normal. Comparing yourself with others is unnecessary; each body follows its own timetable. Asking questions to parents, teachers or a doctor is the right way to get correct information.',
 real:'Classmates of the same age can differ in height by 15–20 cm during these years — that is normal.',
 apply:'Why shouldn\'t you worry if a friend grows taller before you?',
 see:{w:520,h:220,f:[
  ['Childhood.',kid(90,190,90)+lbl(90,210,'childhood')],
  ['Adolescence: 10–19 years.',kid(260,190,125)+lbl(260,210,'adolescence · किशोरावस्था','font-weight="700"')],
  ['Adulthood.',kid(430,190,150)+lbl(430,210,'adulthood')]]},
 seeNote:'Natural, but timing differs.',
 do:{title:'Growth record',mat:'Measuring tape, notebook',steps:['Measure your height every 3 months this year.','Make a small table.'],obs:'Growth in spurts.',why:'Adolescence.',lab:false},
 memo:'"Different times, same journey."',
 miscon:['"Everyone changes at the same age." Timing varies from person to person.'],
 terms:['Adolescence · किशोरावस्था','Puberty · यौवनारंभ','Teenager · किशोर'],
 q:{q:'Adolescence is roughly between ages:',o:['2–5','10–19','20–30','40–50'],a:1,why:'NCERT range.'},
 exam:'Define adolescence and puberty: 2 marks.'},

{id:'h2',num:'6.2',title:'Changes in the body · शरीर में परिवर्तन',
 intro:'Why does a boy\'s voice "crack" at around 13?',
 obj:'List common physical changes during puberty.',
 prior:'6.1.',
 simple:'Common changes: a sudden increase in height (growth spurt); change in body shape — shoulders broaden in boys, hips widen in girls; voice becomes deeper in boys as the voice box (larynx) grows and may be seen as an "Adam\'s apple"; girls\' voices become slightly higher; hair grows under the arms and on other parts; sweat and oil glands become more active, sometimes causing pimples (acne).',
 detail:'Long bones of arms and legs grow fast, so people sometimes feel clumsy for a while. Muscles grow. Girls begin to menstruate (periods) during puberty — a normal, healthy body process. These changes prepare the body to become an adult. Keeping clean helps with sweat and acne.',
 real:'School uniforms are often bought one size larger in these years because of the growth spurt.',
 apply:'Why do teenagers get pimples more often?',
 see:{w:520,h:220,f:[
  ['Growth spurt: height increases quickly.',`<line x1="60" y1="190" x2="60" y2="40" stroke="${GR}"/>`+[0,1,2,3,4].map(k=>`<rect x="${80+k*30}" y="${190-[60,70,95,120,128][k]}" width="20" height="${[60,70,95,120,128][k]}" fill="${TL}" opacity=".6"/>`).join('')+lbl(140,210,'ages 10 → 14')],
  ['Voice box grows: deeper voice in boys.',`<path d="M300 60 q20 20 0 50 q-20 30 0 60" stroke="${ink}" fill="none" stroke-width="2"/><circle cx="312" cy="95" r="7" fill="${OR}" opacity=".7"/>`+lbl(330,120,'larynx · स्वरयंत्र','text-anchor="start"')],
  ['Sweat and oil glands become active.',lbl(400,180,'keep clean: wash face, bathe daily','font-weight="700"')]]},
 seeNote:'All these are normal.',
 do:{title:'Myth or fact?',mat:'Slips with statements',steps:['Read each statement in groups.','Decide myth or fact with the teacher.'],obs:'Many myths cleared.',why:'Correct information.',lab:false},
 memo:'"Taller, deeper, hairier, oilier — all normal."',
 miscon:['"Pimples mean poor health." They are common in adolescence due to active oil glands.'],
 terms:['Growth spurt','Voice box (larynx) · स्वरयंत्र','Adam\'s apple','Sweat glands · स्वेद ग्रंथियाँ','Acne · मुँहासे'],
 q:{q:'A deeper voice in boys is due to growth of the:',o:['heart','voice box (larynx)','liver','lungs'],a:1,why:'Larynx.'},
 exam:'Physical changes during puberty: 3 marks.'},

{id:'h3',num:'6.3',title:'Hormones: chemical messengers · हार्मोन',
 intro:'What tells the body when to start these changes?',
 obj:'Explain the role of hormones and endocrine glands.',
 prior:'6.2.',
 simple:'Hormones (हार्मोन) are chemical messengers made by endocrine glands (अंतःस्रावी ग्रंथियाँ). They are released directly into the blood and travel to the parts of the body where they act. At puberty, certain hormones start the changes of adolescence.',
 detail:'The pituitary gland at the base of the brain controls many other glands and makes growth hormone. The thyroid gland in the neck makes thyroxine, which needs iodine — iodised salt helps prevent goitre (swelling of the thyroid). Adrenal glands help the body respond to stress or fear. Hormones work in tiny amounts but have big effects.',
 real:'Iodised salt in Indian kitchens protects against thyroid problems.',
 apply:'Why is iodised salt recommended?',
 see:{w:520,h:220,f:[
  ['Pituitary at the base of the brain.',`<circle cx="260" cy="50" r="34" fill="none" stroke="${ink}"/><circle cx="262" cy="64" r="6" fill="${OR}"/>`+lbl(330,60,'pituitary (growth hormone)','text-anchor="start"')],
  ['Thyroid in the neck (needs iodine).',`<rect x="246" y="86" width="28" height="70" fill="none" stroke="${ink}"/><path d="M252 110 q8 10 16 0" stroke="${BL}" stroke-width="6" fill="none"/>`+lbl(330,115,'thyroid → thyroxine','text-anchor="start"')],
  ['Hormones travel in the blood.',`<path d="M200 170 q60 30 120 0" stroke="${RD}" stroke-width="3" fill="none"/>`+lbl(260,210,'chemical messengers · रासायनिक संदेशवाहक','font-weight="700"')]]},
 seeNote:'Tiny amounts, big effects.',
 do:{title:'Salt check',mat:'Salt packet at home',steps:['Read the label.','Look for "iodised".'],obs:'Most salt is iodised.',why:'Iodine for thyroxine.',lab:false},
 memo:'"Glands send hormones by blood-post."',
 miscon:['"Hormones are only for adults." They act throughout life.'],
 terms:['Hormone · हार्मोन','Endocrine gland · अंतःस्रावी ग्रंथि','Pituitary · पीयूष ग्रंथि','Thyroid · अवटु ग्रंथि','Iodine · आयोडीन'],
 q:{q:'Iodine is needed by the:',o:['pituitary','thyroid','adrenal','heart'],a:1,why:'Thyroxine.'},
 exam:'Role of hormones: 2 marks.'},

{id:'h4',num:'6.4',title:'Feelings, friendships and decisions · भावनाएँ और मित्रता',
 intro:'Do you sometimes feel happy one moment and upset the next?',
 obj:'Recognise emotional and social changes and healthy ways to handle them.',
 prior:'6.1–6.3.',
 simple:'Adolescents may have quick mood changes, feel more self-conscious, want more independence, and care a lot about friends\' opinions. Peer pressure (साथियों का दबाव) can push someone to do things they are not comfortable with. It is okay to say "no".',
 detail:'Healthy ways: talk to a trusted adult (parent, teacher, school counsellor); keep a hobby; play sports; get enough sleep; be kind to yourself and others. Respect everyone\'s body and feelings — no teasing about appearance. If anyone makes you uncomfortable, tell a trusted adult. Helplines like Childline 1098 exist to help children.',
 real:'Many schools have counsellors and "wellness" periods.',
 apply:'A friend dares you to do something unsafe. What can you say?',
 see:{w:520,h:200,f:[
  ['Mood changes are common.',lbl(110,80,'☺ ↔ ☹','font-size="30"')],
  ['Peer pressure: you can say "No".',lbl(270,80,'"No, thanks."','font-size="20" font-weight="700"')],
  ['Talk to a trusted adult.',lbl(420,80,'parent · teacher · counsellor')+lbl(260,160,'Childline 1098','font-weight="700"')]]},
 seeNote:'Feelings are valid; ask for help.',
 do:{title:'Saying no',mat:'Role-play cards',steps:['Act out a peer-pressure situation.','Practise three polite ways to say no.'],obs:'Confidence grows.',why:'Assertiveness.',lab:false},
 memo:'"Feel it, name it, talk about it."',
 miscon:['"Asking for help is weakness." It is wise and brave.'],
 terms:['Emotions · भावनाएँ','Peer pressure · साथियों का दबाव','Trusted adult','Respect · सम्मान'],
 q:{q:'Best response to unsafe peer pressure:',o:['go along','say no and talk to a trusted adult','hide it','tease others'],a:1,why:'Safe choice.'},
 exam:'Handling emotional changes: 2 marks.'},

{id:'h5',num:'6.5',title:'Nutrition and hygiene · पोषण और स्वच्छता',
 intro:'Why do growing teenagers need more dal, milk and green vegetables?',
 obj:'Describe nutritional needs and hygiene practices during adolescence.',
 prior:'Class 6: Mindful Eating.',
 simple:'Fast growth needs a balanced diet: proteins (dal, pulses, milk, paneer, eggs) for muscles; calcium (milk, curd, ragi) for bones; iron (green leafy vegetables, jaggery, dates, amla helps absorb iron) for blood; fruits and vegetables for vitamins; and cereals for energy. Avoid too much junk food and sugary drinks.',
 detail:'Iron deficiency (anaemia) is common among Indian adolescents, especially girls; it causes tiredness. Hygiene: bathe daily, wash face, wear clean clothes, brush twice, wash hands. During periods, girls should use clean sanitary pads or cloth and change them regularly; dispose of used pads properly. These are normal health practices to discuss openly.',
 real:'Government schemes give iron-folic acid tablets to adolescents in schools (WIFS).',
 apply:'Plan a lunch rich in iron and protein from foods available at home.',
 see:{w:520,h:220,f:[
  ['Protein: dal, milk, eggs.',`<circle cx="90" cy="100" r="40" fill="#e5b93a" opacity=".6"/>`+lbl(90,160,'protein')],
  ['Iron: green leafy vegetables, jaggery.',`<circle cx="260" cy="100" r="40" fill="${GN}" opacity=".6"/>`+lbl(260,160,'iron · लौह')],
  ['Calcium: milk, curd, ragi.',`<circle cx="430" cy="100" r="40" fill="#f4f0e6" stroke="${ink}"/>`+lbl(430,160,'calcium')+lbl(260,205,'+ daily bath, clean clothes, brushing','font-weight="700"')]]},
 seeNote:'Grow strong: eat well, stay clean.',
 do:{title:'Food diary',mat:'Notebook',steps:['Note what you eat for 3 days.','Mark protein, iron and calcium foods.'],obs:'Gaps in diet.',why:'Balanced diet.',lab:true},
 memo:'"Dal, doodh, hari sabzi — daily."',
 miscon:['"Skipping meals helps stay fit." Growing bodies need regular meals.'],
 terms:['Balanced diet · संतुलित आहार','Protein · प्रोटीन','Iron · लौह','Calcium · कैल्शियम','Anaemia · रक्ताल्पता','Hygiene · स्वच्छता'],
 q:{q:'Iron-rich food:',o:['chips','spinach','cold drink','biscuits'],a:1,why:'Green leafy vegetable.'},
 exam:'Nutritional needs of adolescents: 3 marks.'},

{id:'h6',num:'6.6',title:'Healthy choices: say no to harmful substances · स्वस्थ विकल्प',
 intro:'Why are tobacco and alcohol banned for children?',
 obj:'Recognise harmful substances and practise healthy habits.',
 prior:'6.4, 6.5.',
 simple:'Tobacco (bidi, cigarettes, gutka), alcohol and drugs harm the growing body and brain and can cause addiction. Saying "no" protects your health. Healthy habits: daily physical activity (about an hour of active play), 8–10 hours of sleep, limited screen time, and outdoor play.',
 detail:'Sale of tobacco to anyone under 18 and near schools is banned in India. If someone offers such substances, refuse and tell a trusted adult. Sleep helps growth and memory; long screen time affects sleep and eyes. Yoga and sports improve mood and fitness.',
 real:'"No tobacco within 100 yards of a school" boards are seen near schools.',
 apply:'Give two reasons why adolescents need enough sleep.',
 see:{w:520,h:200,f:[
  ['No to tobacco, alcohol, drugs.',`<circle cx="100" cy="90" r="36" fill="none" stroke="${RD}" stroke-width="5"/><line x1="74" y1="64" x2="126" y2="116" stroke="${RD}" stroke-width="5"/>`+lbl(100,150,'say no')],
  ['Active play every day.',kid(260,130,80,GN)+lbl(260,150,'~1 hour active play')],
  ['Sleep 8–10 hours.',lbl(430,90,'☾ 8–10 h','font-size="22"')+lbl(430,150,'sleep · नींद')]]},
 seeNote:'Choose health.',
 do:{title:'Habit tracker',mat:'Notebook',steps:['Track sleep, play and screen time for a week.'],obs:'Areas to improve.',why:'Healthy habits.',lab:true},
 memo:'"Play, sleep, eat well; say no to harm."',
 miscon:['"Just once won\'t harm." Addiction can start with "just once".'],
 terms:['Addiction · लत','Tobacco · तंबाकू','Physical activity','Sleep · नींद'],
 q:{q:'Adolescents should sleep about:',o:['4–5 hours','8–10 hours','14 hours','2 hours'],a:1,why:'Growth and health.'},
 exam:'Healthy habits during adolescence: 2 marks.'}
];

const CARDS=[['Adolescence','10–19 years; between childhood and adulthood.'],['Puberty','Body begins to mature.'],['Growth spurt','Fast increase in height.'],['Voice change','Larynx grows; Adam\'s apple.'],['Glands','Sweat and oil glands active; acne.'],['Hormones','Chemical messengers in blood.'],['Pituitary / thyroid','Growth hormone / thyroxine (iodine).'],['Peer pressure','You can say no; talk to a trusted adult.'],['Nutrition','Protein, iron, calcium; avoid junk.'],['Hygiene','Daily bath, clean clothes, menstrual hygiene.'],['Healthy habits','Active play, 8–10 h sleep, say no to tobacco.']];

const Q=[
 {lv:1,q:'Adolescence occurs between:',o:['childhood and adulthood','birth and childhood','adulthood and old age','none'],a:0,w:'Definition.'},
 {lv:1,q:'Hormones are made by:',o:['bones','endocrine glands','muscles','skin only'],a:1,w:'Glands.'},
 {lv:1,q:'Iodised salt helps the:',o:['thyroid','heart','stomach','bones'],a:0,w:'Thyroxine.'},
 {lv:2,q:'Pimples in teenagers are mainly due to:',o:['eating rice','active oil glands','cold weather','reading'],a:1,w:'Oil glands.'},
 {lv:2,q:'Calcium-rich food:',o:['milk','chips','sugar','oil'],a:0,w:'Milk.'},
 {lv:2,q:'Iron deficiency causes:',o:['anaemia','goitre','acne','height'],a:0,w:'Anaemia.'},
 {lv:3,q:'Two friends of the same age differ in height by 15 cm. This is:',o:['a disease','normal variation','due to laziness','a myth'],a:1,w:'Different timing.'},
 {lv:3,q:'Hormones reach body parts through:',o:['air','blood','bones','nerves only'],a:1,w:'Bloodstream.'},
 {lv:4,q:'A friend offers gutka. Best action:',o:['try once','refuse and inform a trusted adult','keep it secret','sell it'],a:1,w:'Healthy choice.'},
 {lv:4,q:'Why do adolescents need more protein?',o:['for fast growth of muscles and body','to sleep more','for pimples','for colour'],a:0,w:'Growth.'},
 {lv:5,open:true,m:3,q:'List three physical changes during puberty.',ans:['Growth spurt (1)','Voice changes / broadening of shoulders or widening of hips (1)','Hair growth; active sweat and oil glands (1)']},
 {lv:5,open:true,m:3,q:'Suggest a balanced one-day menu for an adolescent with reasons.',ans:['Protein: dal/milk/egg (1)','Iron: green leafy vegetables/jaggery; vitamins: fruit (1)','Energy: roti/rice; limit junk food (1)']}
];

const ONEMIN=['Adolescence 10–19; puberty begins changes.','Growth spurt, voice change, hair, active glands.','Hormones from endocrine glands; pituitary, thyroid (iodine).','Mood changes; peer pressure — say no; talk to trusted adults.','Protein, iron, calcium; hygiene.','Active play, sleep, no tobacco/alcohol/drugs.'];
const KEYS=[['adolescence',/adolescen|किशोर/i],['puberty',/pubert/i],['growth/voice',/growth|voice|larynx/i],['hormones',/hormon|gland/i],['peer pressure',/peer|pressure|trusted/i],['nutrition',/protein|iron|calcium|diet/i],['hygiene',/hygien|clean|bath/i]];

/* ---------- lab ---------- */
const F={dal:{p:2,i:1,c:0,v:0,e:1},green:{p:0,i:2,c:1,v:1,e:0},milk:{p:2,i:0,c:2,v:0,e:1},fruit:{p:0,i:1,c:0,v:2,e:1},grain:{p:1,i:1,c:0,v:0,e:2},egg:{p:1,i:1,c:0,v:0,e:1},junk:{p:0,i:0,c:0,v:0,e:1,j:1}};
let sl=7,ac=30,tm=3;
function draw(){const on=$$('.hF').filter(c=>c.checked).map(c=>c.dataset.f);const tot={p:0,i:0,c:0,v:0,e:0};let junk=false;on.forEach(f=>{Object.keys(tot).forEach(k=>tot[k]+=F[f][k]||0);if(F[f].j)junk=true});
 const bars=[['Protein',tot.p,3],['Iron',tot.i,3],['Calcium',tot.c,2],['Vitamins',tot.v,2],['Energy',tot.e,3],['Sleep',sl>=8&&sl<=10?3:sl>=7.5?2:sl>10?2:1,3],['Activity',ac>=60?3:ac>=30?2:ac>0?1:0,3],['Screen limit',tm<=2?3:tm<=3?2:tm<=4?1:0,3]];
 let s=T(230,22,'How well is today planned?','font-size="15" font-weight="700"');
 bars.forEach(([n,v,mx],k)=>{const y=46+k*32,f=Math.min(1,v/mx);const c=f>=1?GN:f>=0.6?'#e5b93a':RD;s+=T(110,y+12,n,'font-size="12" text-anchor="end"')+`<rect x="120" y="${y}" width="280" height="18" rx="9" fill="#eee"/><rect x="120" y="${y}" width="${280*f}" height="18" rx="9" fill="${c}"/>`+T(420,y+13,f>=1?'✓':f>=0.6?'ok':'low','font-size="12" text-anchor="start"')});
 $('#hSvg').innerHTML=s;$('#hSv').textContent=sl+' h';$('#hAv').textContent=ac+' min';$('#hTv').textContent=tm+' h';
 const tips=[];if(tot.p<3)tips.push('Add dal, milk, paneer or egg for protein.');if(tot.i<3)tips.push('Add green leafy sabzi, jaggery or chana for iron (amla/guava helps absorb it).');if(tot.c<2)tips.push('Add milk, curd or ragi for calcium.');if(tot.v<2)tips.push('Add a fruit and vegetables for vitamins.');if(junk)tips.push('Cut down chips and cold drinks — lots of salt/sugar, little nutrition.');if(sl<8)tips.push('Sleep 8–10 hours for growth and memory.');if(ac<60)tips.push('Aim for about an hour of active play.');if(tm>2)tips.push('Limit fun screen time; play outdoors.');
 $('#hOut').innerHTML=tips.length?'<p><b>Suggestions:</b></p><ul>'+tips.map(t=>`<li>${t}</li>`).join('')+'</ul>':'<p class="fb ok">Excellent plan for a growing body!</p>'}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('hS'))labChange(e.target)})}
function labClick(){return false}
function labChange(t){if(t.id==='hSl'){sl=+t.value;draw();return true}if(t.id==='hAc'){ac=+t.value;draw();return true}if(t.id==='hTm'){tm=+t.value;draw();return true}if(t.classList&&t.classList.contains('hF')){draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
