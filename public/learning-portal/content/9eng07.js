/* Rai Plus content pack: Class 9 English (Beehive), Chapter 7 – Reach for the Top. Original summaries and study notes; the textbook text is not reproduced. */
RP.register({key:'9eng07',cls:'9',subject:'English',ch:'7',title:"Reach for the Top",color:'#a0522d',
crumb:"Class 9 English · Beehive (Prose)",h1:"Chapter 7: Reach for the Top",sub:"Two true stories of determination — Santosh Yadav, the Rewari mountaineer who climbed Everest twice, and tennis champion Maria Sharapova — with comparison, vocabulary and answer-writing practice.",heroLabel:"A mountain peak and a tennis racket",labName:'Venn comparison lab',
theme:"\n:root{--g:light-dark(#a0522d,#f0b28e);--g2:light-dark(#fbf0ea,#1d0f08);--line:light-dark(#efd5c6,#46291b);--bg:light-dark(#ffffff,#120a06);--card:light-dark(#ffffff,#1b100a);\n--ink:light-dark(#2b150a,#f6e7de);--mute:light-dark(#6d4f40,#d0b3a3);--y:light-dark(#1f5f8b,#8fc2e6);--y2:light-dark(#e8f1f8,#0b1622);--hd:#7f3f20}\n",
labHTML:`  <h2>Venn comparison lab</h2>
  <p>Read each fact or quality and decide: does it describe Santosh Yadav, Maria Sharapova, or both? Your answers fill the Venn diagram. Use it to plan a comparison answer.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="vSvg" viewBox="0 0 460 320" role="img" aria-label="Venn diagram comparing Santosh and Maria" style="color:var(--ink)"></svg></div></div>
  <div><div class="box" id="vCard" style="min-height:3.2em"></div>
  <div class="ctrl"><button class="btn" id="vS">Santosh</button> <button class="btn" id="vB">Both</button> <button class="btn" id="vM">Maria</button></div>
  <div class="ctrl"><button class="btn" id="vRe">Start again</button></div>
  <div class="box y" id="vOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#a0522d',LABNAME='Venn comparison lab',MIND_CENTER='Reach for the Top';
const BR='#a0522d',BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".13" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
const mountain=(x,y,s=1,c=GN)=>`<path d="M${x} ${y} L${x+60*s} ${y-90*s} L${x+120*s} ${y} Z" fill="${c}" fill-opacity=".2" stroke="${c}" stroke-width="2"/><path d="M${x+45*s} ${y-68*s} L${x+60*s} ${y-90*s} L${x+75*s} ${y-68*s} Z" fill="#fff" stroke="${c}"/>`;
const racket=(x,y,c=OR)=>`<ellipse cx="${x}" cy="${y}" rx="26" ry="34" fill="none" stroke="${c}" stroke-width="3"/><line x1="${x}" y1="${y+34}" x2="${x}" y2="${y+80}" stroke="${c}" stroke-width="5"/><circle cx="${x+45}" cy="${y-30}" r="9" fill="#c8d84a" stroke="${GR}"/>`;
function heroDraw(){return `<path d="M60 150 L130 40 L200 150 Z" fill="none" stroke="#fff" stroke-width="3"/><ellipse cx="280" cy="80" rx="26" ry="34" fill="none" stroke="#fff" stroke-width="3"/><line x1="280" y1="114" x2="280" y2="150" stroke="#fff" stroke-width="4"/>`}
const HERO=heroDraw;
const MIND=[['Santosh: early life',100,50],['Santosh: the climbs',420,50],['Maria: the journey',90,150],['Compare',430,150],['Vocabulary',110,250],['Answer writing',410,250]];

const C=[
{id:'r1',num:'7.1',title:'Santosh Yadav: a girl who chose her own path',
 intro:'A girl from Joniyawas village in Rewari — our own district — grew up to climb the highest mountain in the world twice. How did it begin?',
 obj:'Summarise Santosh Yadav\'s early life and explain how she broke social expectations.',
 prior:'Reading a biography; Class 8 stories of achievers.',
 simple:'Santosh Yadav was born in the village of Joniyawas in Rewari district, Haryana, in a family with five sons; she was the only daughter. Girls in her community were usually married young and not encouraged to study far from home. Santosh refused to follow this path quietly. She insisted on studying, joined a school in Delhi, and when her parents hesitated to pay, she said she would pay her own fees — and earned money through part-time work.',
 detail:'Her parents, impressed by her determination, finally supported her. She went on to college in Jaipur (Maharani College). From her hostel window she watched people climb into the Aravalli hills and disappear; curiosity led her to meet them — they were mountaineers. This chance discovery changed her life. Key point for answers: she questioned traditions politely but firmly, and backed her words with hard work.',
 real:'Many girls in Haryana villages today study further because earlier achievers like Santosh showed it was possible.',
 apply:'In your own words, explain how Santosh paid for her studies in Delhi.',
 see:{w:520,h:230,f:[
  ['Joniyawas, Rewari: an only daughter among five sons.',box(20,30,150,60,'Joniyawas',BR,'Rewari, Haryana')],
  ['She insists on studying; pays her own fees with part-time work.',`<path d="M170 60 h40" stroke="${GR}" stroke-width="2"/>`+box(210,30,150,60,'School in Delhi',BL,'earns her own fees')],
  ['College in Jaipur: she spots climbers on the Aravalli hills.',`<path d="M360 60 h20" stroke="${GR}" stroke-width="2"/>`+box(380,30,130,60,'Jaipur',PU,'sees climbers')+mountain(200,210,.9)]]},
 seeNote:'Choices, not chance, shaped her life.',
 do:{title:'Timeline card',mat:'Chart paper',steps:['Draw a timeline of Santosh\'s life from village to college.','Add one quality for each stage.'],obs:'A visual summary.',why:'Sequencing helps long answers.',lab:false},
 memo:'"Village → Delhi → Jaipur → mountains."',
 miscon:['"Santosh rebelled rudely against her family." She was firm but respectful, and won their support.'],
 terms:['Unconventional','Determination','Traditional society','Biography'],
 q:{q:'How did Santosh pay her school fees in Delhi?',o:['A scholarship from the state','Her brothers paid','She did part-time jobs','The school waived them'],a:2,why:'She earned the money herself.'},
 exam:'Santosh\'s early life and determination: 3 marks.'},

{id:'r2',num:'7.2',title:'Santosh Yadav: on top of Everest — twice',
 intro:'What makes someone not just a climber but a leader on the mountain?',
 obj:'Describe Santosh Yadav\'s achievements as a mountaineer and her concern for others and the environment.',
 prior:'7.1.',
 simple:'Santosh trained at the Nehru Institute of Mountaineering in Uttarkashi and went on an expedition every year. She climbed Mount Everest in 1992, at about twenty years of age — one of the youngest women to do so then. Within a year she climbed it again with an Indo-Nepalese women\'s expedition, becoming the first woman in the world to climb Everest twice.',
 detail:'Her team-mates admired her leadership and care: during the 1992 climb she helped climbers in trouble, even sharing oxygen with a fellow climber. She cared deeply about the Himalayan environment and collected and brought down a large amount of garbage from the mountain. The Government of India honoured her with the Padma Shri. Qualities to quote in answers: courage, endurance, leadership, compassion and ecological concern.',
 real:'Clean-up expeditions on Everest continue today — showing her environmental concern was ahead of its time.',
 apply:'Give two examples of Santosh\'s concern for others and for nature.',
 see:{w:520,h:240,f:[
  ['Training at Uttarkashi.',mountain(30,220,1.2,GN)+lbl(100,235,'Uttarkashi training')],
  ['Everest 1992 and again within a year.',mountain(200,220,1.5,BL)+lbl(290,30,'Everest ×2','font-size="16" font-weight="700" fill="'+BL+'"')],
  ['Helps team-mates; cleans the mountain; Padma Shri.',lbl(440,90,'shares oxygen','fill="'+BR+'"')+lbl(440,115,'removes garbage','fill="'+GN+'"')+lbl(440,140,'Padma Shri','fill="'+PU+'"')]]},
 seeNote:'Achiever and caretaker.',
 do:{title:'Award citation',mat:'Notebook',steps:['Write a 60-word citation for Santosh\'s Padma Shri.'],obs:'Highlights achievements and values.',why:'Formal writing practice.',lab:false},
 memo:'"Two climbs, three Cs: courage, care, cleanliness."',
 miscon:['"She climbed Everest twice on the same expedition." It was two separate expeditions within about a year.'],
 terms:['Expedition','Mountaineering','Ecological','Padma Shri','Endurance'],
 q:{q:'Santosh Yadav was the first woman in the world to:',o:['reach the South Pole','climb Everest twice','climb K2','climb without oxygen'],a:1,why:'Her record.'},
 exam:'Santosh\'s achievements and qualities: 3–5 marks.'},

{id:'r3',num:'7.3',title:'Maria Sharapova: from Siberia to world number one',
 intro:'What would you give up at nine years old to chase a dream?',
 obj:'Summarise Maria Sharapova\'s journey and the sacrifices she made.',
 prior:'7.1–7.2.',
 simple:'Maria Sharapova was born in Siberia, Russia. When she was only nine, she left home to train in tennis in the United States (Florida), travelling with her father. Her mother could not get a visa, so Maria did not see her for about two years. She was lonely and homesick; older trainees at the academy were unkind and ignored her. Instead of giving up, she used the hardship to grow tougher.',
 detail:'Her hard work paid off: she won Wimbledon in 2004 at seventeen and became world number one in 2005 at eighteen. She is described as calm and self-assured, and says she is driven by the wish to be the best rather than by money. Off the court she enjoys fashion, singing, dancing and reading (she likes Sherlock Holmes stories). Key point: success came through sacrifice and mental toughness.',
 real:'Young athletes from Haryana leave home for sports hostels and academies — similar sacrifices.',
 apply:'Why did Maria not see her mother for two years?',
 see:{w:520,h:240,f:[
  ['Siberia, age 9.',box(20,40,140,60,'Siberia',BL,'age 9')],
  ['Florida: training, loneliness, homesickness.',`<path d="M160 70 h40" stroke="${GR}" stroke-width="2"/>`+box(200,40,140,60,'Florida',OR,'lonely, homesick')],
  ['Wimbledon at 17; world No. 1 at 18.',`<path d="M340 70 h20" stroke="${GR}" stroke-width="2"/>`+box(360,40,150,60,'Top of tennis',GN,'Wimbledon 17 · No. 1 at 18')+racket(260,160)]]},
 seeNote:'Sacrifice turned into strength.',
 do:{title:'Diary entry',mat:'Notebook',steps:['Write a diary entry as nine-year-old Maria on her first night in Florida.'],obs:'Shows feelings and resolve.',why:'Empathy and creative writing.',lab:false},
 memo:'"Siberia at nine, Wimbledon at seventeen, number one at eighteen."',
 miscon:['"Maria\'s family moved to America together." Her mother stayed behind (visa problem) for about two years.'],
 terms:['Sacrifice','Homesick','Academy','Self-assured','Ambition'],
 q:{q:'Maria became world number one at the age of:',o:['15','17','18','21'],a:2,why:'2005.'},
 exam:'Maria\'s sacrifices and success: 3 marks.'},

{id:'r4',num:'7.4',title:'Comparing two champions',
 intro:'A mountaineer from Haryana and a tennis star from Siberia — what do they share?',
 obj:'Compare and contrast Santosh Yadav and Maria Sharapova using evidence.',
 prior:'7.1–7.3.',
 simple:'Similarities: both started from humble or ordinary backgrounds, faced hardships early, showed extraordinary determination and hard work, and reached the very top of their fields. Differences: Santosh had to fight social traditions about girls\' education; Maria had family support but faced separation, loneliness and a new country. Santosh is also remembered for compassion and environmental concern; Maria for focus, ambition and mental toughness.',
 detail:'A good comparison answer: (1) start with a one-line introduction; (2) give 2–3 similarities with examples; (3) give 2–3 differences with examples; (4) end with the common lesson — dreams need courage, sacrifice and persistence. Use linking words: both, similarly, whereas, on the other hand, however.',
 real:'You can use the same structure to compare any two characters in an exam.',
 apply:'Write two sentences, each using "whereas", contrasting Santosh and Maria.',
 see:{w:520,h:240,f:[
  ['Santosh\'s circle.',`<circle cx="190" cy="125" r="100" fill="${BR}" fill-opacity=".1" stroke="${BR}" stroke-width="2"/>`+lbl(140,40,'Santosh','font-weight="700" fill="'+BR+'"')],
  ['Maria\'s circle.',`<circle cx="330" cy="125" r="100" fill="${BL}" fill-opacity=".1" stroke="${BL}" stroke-width="2"/>`+lbl(380,40,'Maria','font-weight="700" fill="'+BL+'"')],
  ['Overlap: determination, hard work, reached the top.',lbl(260,110,'determination','font-size="11"')+lbl(260,130,'hard work','font-size="11"')+lbl(260,150,'reached the top','font-size="11"')+lbl(135,120,'fought traditions','font-size="11"')+lbl(135,140,'cared for nature','font-size="11"')+lbl(390,120,'left home at 9','font-size="11"')+lbl(390,140,'mental toughness','font-size="11"')]]},
 seeNote:'Same spirit, different struggles.',
 do:{title:'Comparison table',mat:'Notebook',steps:['Make a table: background, parents\' attitude, hardships, achievements, qualities.'],obs:'Ready revision notes.',why:'Organised comparison.',lab:true},
 memo:'"Both climbed — one a mountain, one a ranking."',
 miscon:['"Both faced the same problems." Their struggles were different.'],
 terms:['Compare','Contrast','Whereas','Similarly','Evidence'],
 q:{q:'Which describes BOTH Santosh and Maria?',o:['Fought against early marriage','Left home at nine','Showed determination and hard work','Received the Padma Shri'],a:2,why:'Common quality.'},
 exam:'Compare the two achievers: 5 marks (long answer).'},

{id:'r5',num:'7.5',title:'Words from the lesson',
 intro:'Words like "ecological" and "adrenaline" appear in this chapter. What do they mean?',
 obj:'Understand and use key vocabulary from the chapter.',
 prior:'Dictionary skills.',
 simple:'Useful words and meanings (in simple English): unconventional — different from what is usual; expedition — a journey made for a special purpose, such as climbing; ecological — related to the environment and living things; endurance — the ability to keep going through hardship; resolve — strong determination; sacrifice — giving up something valuable for a greater goal; homesick — sad because you miss home; adrenaline — a body chemical released in excitement or danger.',
 detail:'Word families help: determine, determined, determination; endure, endurance; ecology, ecological. Use new words in your own sentences — that is how they become part of your vocabulary. Prefix "un-" means not: unconventional, unkind, unusual.',
 real:'News reports on mountaineering and sport often use these words.',
 apply:'Use "endurance" and "sacrifice" in sentences about yourself or someone you admire.',
 see:{w:520,h:220,f:[
  ['Word families.',lbl(130,50,'determine → determination','font-size="15"')+lbl(390,50,'endure → endurance','font-size="15"')],
  ['Prefix un- = not.',lbl(260,110,'un + conventional = unconventional','font-size="16" fill="'+BR+'"')],
  ['Use words in your own sentences.',lbl(260,170,'learn → use → remember','font-size="16" font-weight="700"')]]},
 seeNote:'Build families, not lists.',
 do:{title:'Word wall',mat:'Sticky notes',steps:['Write each word with a meaning and your own sentence.','Stick them on the class wall.'],obs:'Shared vocabulary.',why:'Use makes words stick.',lab:false},
 memo:'"Read it, explain it, use it."',
 miscon:['"Ecological means economic." Ecological is about the environment.'],
 terms:['Expedition','Ecological','Endurance','Resolve','Unconventional'],
 q:{q:'"Ecological" means related to:',o:['money','the environment','sports','music'],a:1,why:'Ecology.'},
 exam:'Word meanings / usage: 1 mark each.'},

{id:'r6',num:'7.6',title:'Writing strong answers',
 intro:'How do you score full marks on "Describe the qualities of Santosh Yadav"?',
 obj:'Write character sketches and value-based answers with evidence.',
 prior:'7.1–7.5.',
 simple:'Character sketch method (PEE): Point — name the quality; Evidence — give an incident from the story; Explain — say what it shows. Example: Santosh was determined (point); she paid her own school fees through part-time work when her family hesitated (evidence); this shows she would not let obstacles stop her education (explain).',
 detail:'Word limits: short answers about 40–50 words; long answers about 120–150 words. Value-based questions (e.g. "What can students learn from these two women?") need your own opinion plus examples from the text. Never copy whole sentences from the textbook — write in your own words; this also shows understanding. Plan with a quick list of 3–4 points before writing.',
 real:'The PEE method works for every literature chapter — prose, poems or supplementary readers.',
 apply:'Write a 50-word PEE paragraph on one quality of Maria Sharapova.',
 see:{w:520,h:220,f:[
  ['Point: name the quality.',box(20,60,150,70,'Point',BR,'the quality')],
  ['Evidence: an incident from the story.',`<path d="M170 95 h15" stroke="${GR}" stroke-width="2"/>`+box(185,60,150,70,'Evidence',BL,'incident from the text')],
  ['Explain: what it shows.',`<path d="M335 95 h15" stroke="${GR}" stroke-width="2"/>`+box(350,60,150,70,'Explain',GN,'what it shows')+lbl(260,180,'P + E + E = full marks','font-size="16" font-weight="700"')]]},
 seeNote:'Point, Evidence, Explain.',
 do:{title:'Peer marking',mat:'Answers written by classmates',steps:['Swap answers.','Tick P, E and E in each paragraph.'],obs:'Missing evidence is the most common gap.',why:'Self-assessment improves writing.',lab:false},
 memo:'"PEE every paragraph."',
 miscon:['"Long answers just retell the story." They must answer the question with points and evidence.'],
 terms:['Character sketch','PEE','Value-based question','Word limit'],
 q:{q:'In PEE, the second E stands for:',o:['Example','Explain','Ending','Essay'],a:1,why:'Point, Evidence, Explain.'},
 exam:'Character sketch / value-based answer: 5 marks.'}
];

const CARDS=[['Santosh\'s village','Joniyawas, Rewari district, Haryana.'],['Her studies','School in Delhi (paid own fees); college in Jaipur.'],['Turning point','Saw climbers on the Aravalli hills.'],['Training','Nehru Institute of Mountaineering, Uttarkashi.'],['Record','First woman to climb Everest twice (1992, 1993).'],['Values','Compassion for team-mates; cleaned the mountain; Padma Shri.'],['Maria\'s start','Left Siberia at nine to train in Florida.'],['Sacrifice','Two years without seeing her mother.'],['Success','Wimbledon at 17; world No. 1 at 18.'],['Lesson','Determination + sacrifice + hard work.']];

const Q=[
 {lv:1,q:'Santosh Yadav was born in a village of:',o:['Rewari district, Haryana','Jaipur, Rajasthan','Uttarkashi, Uttarakhand','Delhi'],a:0,w:'Joniyawas.'},
 {lv:1,q:'Maria Sharapova was born in:',o:['Florida','Siberia','Moscow','London'],a:1,w:'Russia.'},
 {lv:1,q:'Where did Santosh train in mountaineering?',o:['Darjeeling','Uttarkashi','Shimla','Leh'],a:1,w:'Nehru Institute of Mountaineering.'},
 {lv:2,q:'What first drew Santosh to climbing?',o:['A film','Watching climbers in the Aravalli hills','A school trip to Everest','Her brother'],a:1,w:'From her hostel window.'},
 {lv:2,q:'Maria left home for training at the age of:',o:['six','nine','twelve','fifteen'],a:1,w:'Nine.'},
 {lv:2,q:'Santosh was honoured with the:',o:['Arjuna Award only','Padma Shri','Bharat Ratna','Nobel Prize'],a:1,w:'Padma Shri.'},
 {lv:3,q:'Santosh\'s act of bringing garbage down from the mountain shows her:',o:['greed','ecological concern','fear','pride'],a:1,w:'Environment.'},
 {lv:3,q:'Maria says she is driven mainly by:',o:['money','being the best','fame','her coach'],a:1,w:'Ambition to excel.'},
 {lv:4,q:'Which is a DIFFERENCE between them?',o:['Both worked hard','Santosh fought social traditions; Maria faced separation from family','Both reached the top','Both were determined'],a:1,w:'Different struggles.'},
 {lv:4,q:'"Unconventional" means:',o:['very common','different from the usual','unkind','unknown'],a:1,w:'Not conventional.'},
 {lv:5,open:true,m:3,q:'How did Santosh Yadav show that she would not accept the traditional path for girls? (40–50 words)',ans:['Refused early marriage; insisted on education (1)','Joined school in Delhi; paid her own fees by part-time work when parents hesitated (1)','Went on to college and chose an unusual career — mountaineering (1)']},
 {lv:5,open:true,m:5,q:'Compare Santosh Yadav and Maria Sharapova: their backgrounds, struggles and qualities. (120–150 words)',ans:['Introduction naming both and their fields (1)','Similarities: humble start, determination, hard work, reached the top (1)','Santosh: fought traditions, paid own fees, compassion, ecological concern (1)','Maria: left home at nine, loneliness, separation from mother, mental toughness (1)','Conclusion: common lesson about perseverance; own words, linking words (1)']}
];

const ONEMIN=['Santosh: Joniyawas, Rewari; chose education.','Santosh: Everest twice; compassion; Padma Shri.','Maria: Siberia → Florida at nine; sacrifice.','Compare: same spirit, different struggles.','Vocabulary: expedition, ecological, endurance.','Answers: Point–Evidence–Explain.'];
const KEYS=[['Santosh',/santosh|everest|rewari/i],['Maria',/maria|sharapova|siberia/i],['determination',/determin|hard work|persever/i],['sacrifice',/sacrific|homesick|lonely/i],['compare',/both|whereas|differ|similar/i],['PEE',/point|evidence|explain/i]];

/* ---------- lab ---------- */
const FACTS=[['Born in Joniyawas village, Rewari','S'],['Born in Siberia','M'],['Left home at nine to train abroad','M'],['Paid her own school fees','S'],['Showed great determination','B'],['Reached the very top of her field','B'],['Trained at Uttarkashi','S'],['Did not see her mother for two years','M'],['Worked extremely hard','B'],['Won Wimbledon at seventeen','M'],['Cleaned garbage from the mountains','S'],['Faced hardships when young','B'],['Received the Padma Shri','S'],['Became world number one at eighteen','M']];
let order=[],idx=0,placed=[],score=0;
function reset(){order=FACTS.map((f,i)=>i).sort(()=>Math.random()-.5);idx=0;placed=[];score=0}
reset();
function draw(){let s=`<circle cx="165" cy="160" r="135" fill="${BR}" fill-opacity=".08" stroke="${BR}" stroke-width="2"/><circle cx="295" cy="160" r="135" fill="${BL}" fill-opacity=".08" stroke="${BL}" stroke-width="2"/>`+T(110,20,'Santosh','font-size="14" font-weight="700" fill="'+BR+'"')+T(350,20,'Maria','font-size="14" font-weight="700" fill="'+BL+'"')+T(230,20,'Both','font-size="12" font-weight="700"');
 const col={S:[],M:[],B:[]};placed.forEach(([i,g])=>col[g].push([FACTS[i][0],g===FACTS[i][1]]));
 const wrap=(t,n)=>{const w=t.split(' ');const L=[];let c='';w.forEach(x=>{if((c+' '+x).trim().length>n){L.push(c);c=x}else c=(c+' '+x).trim()});L.push(c);return L};
 const put=(arr,x,n)=>{let y=88;arr.forEach(([t,ok])=>{wrap(t,n).forEach((l,k)=>{s+=T(x,y,l,`font-size="9.5" fill="${ok?ink:OR}"`);y+=11});y+=4})};
 put(col.S,105,20);put(col.B,230,14);put(col.M,358,20);$('#vSvg').innerHTML=s;
 $('#vCard').innerHTML=idx<order.length?`<p><b>Fact ${idx+1} of ${order.length}:</b> ${FACTS[order[idx]][0]}</p>`:`<p><b>All placed!</b> Score: ${score}/${order.length}. Use the diagram to plan your comparison answer.</p>`}
function labShow(){draw()}
function labInit(){}
const NAME={S:'Santosh',M:'Maria',B:'both'};
function labClick(b){const g={vS:'S',vM:'M',vB:'B'}[b.id];if(g){if(idx>=order.length)return true;const i=order[idx];const ok=FACTS[i][1]===g;if(ok)score++;placed.push([i,FACTS[i][1]]);$('#vOut').innerHTML=ok?`<p class="fb ok">Correct — this fits ${NAME[g]}.</p>`:`<p class="fb no">Not quite — this fits ${NAME[FACTS[i][1]]}.</p>`;idx++;draw();return true}
 if(b.id==='vRe'){reset();$('#vOut').innerHTML='';draw();return true}return false}
function labChange(){return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
