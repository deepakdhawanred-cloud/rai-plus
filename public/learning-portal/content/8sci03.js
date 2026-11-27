/* Rai Plus content pack: Class 8 Science (Curiosity), Chapter 3 – Health: The Ultimate Treasure. */
RP.register({key:'8sci03',cls:'8',subject:'Science',ch:'3',title:"Health: The Ultimate Treasure",color:'#b04a1f',
crumb:"Class 8 Science · Curiosity",h1:"Chapter 3: Health — The Ultimate Treasure",sub:"What health means, communicable and non-communicable diseases, how diseases spread and how to block them, the immune system, vaccines, and using antibiotics wisely.",heroLabel:"A shield protecting a community",labName:'Outbreak and vaccination simulator',
theme:"\n:root{--g:light-dark(#b04a1f,#f2a77f);--g2:light-dark(#fbefe9,#21110a);--line:light-dark(#f0d6ca,#47271a);--bg:light-dark(#ffffff,#130a06);--card:light-dark(#ffffff,#1c100a);\n--ink:light-dark(#2a1309,#f7e6dd);--mute:light-dark(#6e4f42,#d2b4a6);--y:light-dark(#1f5f8b,#8fc2e6);--y2:light-dark(#e8f1f8,#0b1622);--hd:#8a3815}\n",
labHTML:`  <h2>Outbreak and vaccination simulator</h2>
  <p>A village of 400 people. One person catches an infection that spreads to neighbours. Vaccinated people (blue) cannot catch or pass it on. Change the vaccination level and hygiene, then start the outbreak. This is a simplified model for learning.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="oSvg" viewBox="0 0 460 320" role="img" aria-label="Outbreak grid" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Vaccinated: <b id="oVv"></b><input type="range" class="oS" id="oV" min="0" max="95" step="5" value="0"></label></div>
  <div class="ctrl"><label>Hygiene (hand washing, masks): <b id="oHv"></b><input type="range" class="oS" id="oH" min="0" max="2" value="0"></label></div>
  <div class="ctrl"><button class="btn" id="oGo">Start outbreak</button> <button class="btn" id="oRe">Reset</button></div>
  <div class="box y" id="oOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#b04a1f',LABNAME='Outbreak and vaccination simulator',MIND_CENTER='Health';
const OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
const arr=(x1,y1,x2,y2,c=GR)=>{const a=Math.atan2(y2-y1,x2-x1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2"/><path d="M${x2} ${y2} L${x2-8*Math.cos(a-.45)} ${y2-8*Math.sin(a-.45)} L${x2-8*Math.cos(a+.45)} ${y2-8*Math.sin(a+.45)}Z" fill="${c}"/>`};
function heroDraw(){return `<path d="M190 25 L240 45 L240 90 Q240 130 190 150 Q140 130 140 90 L140 45 Z" fill="none" stroke="#fff" stroke-width="3"/><path d="M168 88 l15 15 l30 -32" fill="none" stroke="#fff" stroke-width="4"/>`}
const HERO=heroDraw;
const MIND=[['Meaning of health',100,50],['Types of diseases',420,50],['How diseases spread',90,150],['Immune system',430,150],['Vaccines',110,250],['Antibiotics & prevention',410,250]];

const C=[
{id:'h1',num:'3.1',title:'What is health?',
 intro:'Is a person who has no fever, but is always anxious and lonely, fully healthy?',
 obj:'Explain health as physical, mental and social well-being, and list factors that affect it.',
 prior:'Class 6–7: nutrition, hygiene.',
 simple:'The World Health Organization (WHO) describes health as a state of complete physical, mental and social well-being — not merely the absence of disease. Physical: the body works well. Mental: we can manage feelings, think clearly and cope with stress. Social: we get along with family, friends and community.',
 detail:'Health depends on personal habits (balanced diet, exercise, sleep, hygiene), the environment (clean air and water, sanitation, safe housing) and the community (healthcare, vaccination, support). Deficiency diseases come from lacking a nutrient: scurvy (vitamin C), anaemia (iron), goitre (iodine), night blindness (vitamin A). Polluted air — shown by the Air Quality Index (AQI) — harms the lungs.',
 real:'In winter, AQI in Delhi-NCR, including Rewari, often reaches "poor" or worse — a community health problem.',
 apply:'Give one habit each for physical, mental and social health.',
 see:{w:520,h:220,f:[
  ['Physical well-being.',box(20,60,150,60,'Physical',OR,'body works well')],
  ['Mental well-being.',box(185,60,150,60,'Mental',PU,'feelings, coping')],
  ['Social well-being = complete health.',box(350,60,150,60,'Social',BL,'relationships')+lbl(260,175,'All three = health (WHO)','font-size="16" font-weight="700"')]]},
 seeNote:'Health has three sides.',
 do:{title:'Health diary',mat:'Notebook',steps:['For a week, note sleep hours, exercise, fruits/vegetables eaten and time with friends.'],obs:'Patterns in habits.',why:'Habits shape health.',lab:false},
 memo:'"Body, mind, friends."',
 miscon:['"Not being sick means healthy." Mental and social well-being matter too.'],
 terms:['Health · स्वास्थ्य','Well-being · कल्याण','Deficiency disease · अभावजन्य रोग','Sanitation · स्वच्छता'],
 q:{q:'According to WHO, health includes:',o:['only physical fitness','physical, mental and social well-being','only absence of disease','only mental health'],a:1,why:'Three dimensions.'},
 exam:'Meaning of health: 2 marks.'},

{id:'h2',num:'3.2',title:'Communicable and non-communicable diseases',
 intro:'Can you "catch" diabetes from a friend the way you catch a cold?',
 obj:'Distinguish communicable from non-communicable diseases with examples.',
 prior:'3.1; Ch 2 microbes.',
 simple:'Communicable (infectious) diseases are caused by pathogens and can spread from one person to another: cold, flu, tuberculosis, cholera, typhoid, malaria, dengue, chickenpox. Non-communicable diseases do not spread from person to person: diabetes, heart disease, high blood pressure, many cancers, asthma. They are linked to lifestyle, genes, age and environment.',
 detail:'Symptoms (fever, cough, pain) tell us something is wrong; doctors use them and tests to diagnose. Acute diseases last a short time (cold); chronic diseases last long (diabetes). A healthy lifestyle — less sugar and fried food, regular exercise, no tobacco — lowers the risk of many non-communicable diseases.',
 real:'Diabetes is increasingly common in India, even among young people, because of less activity and more processed food.',
 apply:'Classify: dengue, diabetes, tuberculosis, asthma, chickenpox, heart disease.',
 see:{w:520,h:220,f:[
  ['Communicable: spreads.',box(20,40,220,60,'Communicable',OR,'cold · TB · malaria · dengue')],
  ['Non-communicable: does not spread.',box(280,40,220,60,'Non-communicable',BL,'diabetes · heart disease · asthma')],
  ['Causes differ.',lbl(130,150,'pathogens','fill="'+OR+'"')+lbl(390,150,'lifestyle · genes · environment','fill="'+BL+'"')]]},
 seeNote:'Does it pass from person to person?',
 do:{title:'Disease sort',mat:'Disease cards',steps:['Sort 12 diseases into two groups.','Add one prevention tip for each.'],obs:'Two lists.',why:'Different prevention.',lab:false},
 memo:'"Catch it = communicable."',
 miscon:['"All diseases are caused by germs." Many are not.'],
 terms:['Communicable disease · संचारी रोग','Non-communicable disease · असंचारी रोग','Symptom · लक्षण','Chronic · दीर्घकालिक'],
 q:{q:'Which is non-communicable?',o:['tuberculosis','diabetes','cholera','flu'],a:1,why:'Does not spread.'},
 exam:'Classify diseases: 2 marks.'},

{id:'h3',num:'3.3',title:'How diseases spread — and how to stop them',
 intro:'Why do dengue cases rise in July–September and fall by January?',
 obj:'Describe the routes of disease spread and matching preventive measures.',
 prior:'3.2.',
 simple:'Routes: Air — droplets from coughs and sneezes (cold, flu, TB). Water and food — contaminated by faeces (cholera, typhoid, hepatitis A, polio). Vectors — animals that carry pathogens, like mosquitoes (malaria by Anopheles, dengue by Aedes). Direct contact (chickenpox, some skin infections). Block the route: cover coughs, wash hands, drink safe water, cook and cover food, use toilets, and stop mosquitoes breeding.',
 detail:'Mosquitoes breed in still water — coolers, tyres, pots, blocked drains — so cases peak in and after the monsoon. Aedes bites in daytime; Anopheles mostly at night. Community action matters: clean surroundings, cleanliness drives, safe drinking water and toilets (Swachh Bharat).',
 real:'Before travelling to an area with malaria, use mosquito nets and repellents and wear full sleeves.',
 apply:'List three ways to stop mosquitoes breeding around your home.',
 see:{w:520,h:240,f:[
  ['Air: droplets.',box(20,30,115,55,'Air',BL,'cold · TB')],
  ['Water/food.',box(145,30,115,55,'Water / food',GN,'cholera · typhoid')],
  ['Vectors and contact.',box(270,30,115,55,'Mosquito',OR,'malaria · dengue')+box(395,30,115,55,'Contact',PU,'chickenpox')+lbl(260,140,'cover coughs · safe water · no stagnant water · wash hands','font-size="13" font-weight="700"')+lbl(260,175,'Block the route → stop the disease','font-size="15"')]]},
 seeNote:'Each route has its own block.',
 do:{title:'Breeding-site survey',mat:'Checklist',steps:['Survey school/home for still water.','Empty and cover containers.'],obs:'Fewer breeding sites.',why:'Vector control.',lab:false},
 memo:'"Air, water, vector, touch."',
 miscon:['"Dengue spreads from person to person directly." It needs a mosquito.'],
 terms:['Vector · रोगवाहक','Droplet infection · बूंद संक्रमण','Contamination · संदूषण','Stagnant water · ठहरा हुआ पानी'],
 q:{q:'Dengue is carried by the:',o:['housefly','Aedes mosquito','rat','cockroach'],a:1,why:'Vector.'},
 exam:'Modes of spread with prevention: 3 marks.'},

{id:'h4',num:'3.4',title:'Our immune system',
 intro:'Why do you usually get chickenpox only once?',
 obj:'Describe the body\'s lines of defence and how immunity develops.',
 prior:'3.3.',
 simple:'Our body has defences. First line: skin, mucus in the nose, tears, stomach acid — they block or kill many germs. Second line: white blood cells attack germs that get in; fever and inflammation help fight infection. Immunity: after fighting a germ, the body remembers it (memory) and makes antibodies quickly the next time, so we often do not fall ill again.',
 detail:'Antibodies are special proteins that recognise particular germs. Nutrition, sleep and exercise help immunity; stress and poor diet weaken it. Babies get some antibodies from the mother\'s milk.',
 real:'When you have a cold, a runny nose and fever are signs your immune system is fighting.',
 apply:'Name two "first line" defences of the body.',
 see:{w:520,h:220,f:[
  ['First line: skin, mucus, acid.',box(20,60,150,60,'1st line',GN,'skin · mucus · acid')],
  ['Second line: white blood cells.',arr(170,90,190,90)+box(190,60,150,60,'2nd line',BL,'white blood cells')],
  ['Memory: faster response next time.',arr(340,90,360,90)+box(360,60,150,60,'Memory',PU,'antibodies, faster')]]},
 seeNote:'Block, fight, remember.',
 do:{title:'Defence map',mat:'Body outline',steps:['Mark skin, nose, eyes, stomach.','Write how each defends.'],obs:'Many barriers.',why:'First line.',lab:false},
 memo:'"Block, battle, remember."',
 miscon:['"Fever is always bad." Mild fever helps fight infection (but high fever needs a doctor).'],
 terms:['Immunity · प्रतिरक्षा','Antibody · प्रतिपिंड','White blood cell · श्वेत रक्त कोशिका'],
 q:{q:'Antibodies are made by:',o:['red blood cells','white blood cells','skin','bones'],a:1,why:'Immune cells.'},
 exam:'Body defences: 3 marks.'},

{id:'h5',num:'3.5',title:'Vaccines: training the body',
 intro:'How can a small injection protect you for years?',
 obj:'Explain how vaccines work, their history, and why vaccinating many people protects everyone.',
 prior:'3.4.',
 simple:'A vaccine contains weakened or killed germs, or parts of them. It trains the immune system to make antibodies and memory without causing the disease. Edward Jenner made the first vaccine (1796) against smallpox, using cowpox. Thanks to vaccines, smallpox has been wiped out worldwide and India became polio-free (2014).',
 detail:'When most people in a community are vaccinated, the germ cannot find enough people to spread to, so even those who cannot be vaccinated (newborns, some sick people) are protected — herd immunity. Indian scientists have contributed: Kamal Ranadive did pioneering research on cancer and leprosy; Maharaj Kishan Bhan led the development of Rotavac, an Indian vaccine against rotavirus diarrhoea. India\'s Universal Immunisation Programme gives free vaccines to children.',
 real:'Your vaccination card records BCG, polio, DPT, measles and other doses given in childhood.',
 apply:'Why does vaccinating most children protect a newborn too?',
 see:{w:520,h:220,f:[
  ['Vaccine: weakened germ.',box(20,60,140,60,'Vaccine',BL,'weakened germ')],
  ['Body makes antibodies and memory.',arr(160,90,180,90)+box(180,60,160,60,'Immune response',PU,'antibodies + memory')],
  ['Real germ later: quick defeat.',arr(340,90,360,90)+box(360,60,150,60,'Protected',GN,'no illness')]]},
 seeNote:'Practice match for the immune system.',
 do:{title:'Vaccination card',mat:'Your vaccination record',steps:['List the vaccines you received.','Find which disease each protects against.'],obs:'Many diseases covered.',why:'Immunisation.',lab:true},
 memo:'"Vaccine = practice, not the disease."',
 miscon:['"Vaccines give you the disease." They train immunity without causing illness.'],
 terms:['Vaccine · टीका','Vaccination · टीकाकरण','Herd immunity · सामूहिक प्रतिरक्षा','Immunisation · प्रतिरक्षण'],
 q:{q:'The first vaccine (against smallpox) was developed by:',o:['Fleming','Jenner','Pasteur','Ranadive'],a:1,why:'1796.'},
 exam:'How vaccines work: 3 marks.'},

{id:'h6',num:'3.6',title:'Antibiotics — use them wisely',
 intro:'Should you take antibiotics for a common cold?',
 obj:'Explain what antibiotics do, why they don\'t work on viruses, and the danger of resistance.',
 prior:'3.4, 3.5; Ch 2 (penicillin).',
 simple:'Antibiotics are medicines that kill or stop bacteria. Penicillin, discovered by Alexander Fleming (1928) from a mould, was the first. Antibiotics do NOT work against viruses — so they do not cure a cold or flu. Take them only when a doctor prescribes, in the right dose, for the full course.',
 detail:'Antimicrobial resistance: when antibiotics are overused or courses are stopped early, surviving bacteria can become resistant, and the medicine stops working. Resistant infections are a major global threat. Never share or self-prescribe antibiotics. Prevention — hygiene, clean water, vaccines — reduces the need for antibiotics.',
 real:'Doctors in India warn against buying antibiotics without a prescription.',
 apply:'Why should you complete the full antibiotic course even if you feel better?',
 see:{w:520,h:220,f:[
  ['Antibiotics kill bacteria.',box(20,50,150,60,'Antibiotics',GN,'work on bacteria')],
  ['Not viruses.',box(185,50,150,60,'Viruses',OR,'✗ not affected')],
  ['Misuse → resistance.',box(350,50,150,60,'Resistance',PU,'misuse breeds it')+lbl(260,165,'doctor\'s prescription · full course · never share','font-size="14" font-weight="700"')]]},
 seeNote:'Right medicine, right germ, full course.',
 do:{title:'Myth or fact',mat:'Statement cards',steps:['Sort statements about antibiotics into myth or fact.'],obs:'Many myths.',why:'Responsible use.',lab:false},
 memo:'"Bacteria yes, virus no, finish the course."',
 miscon:['"Antibiotics cure colds." Colds are viral.','"Stop once you feel better." Complete the course.'],
 terms:['Antibiotic · प्रतिजैविक','Resistance · प्रतिरोध','Prescription · नुस्खा','Course (of medicine)'],
 q:{q:'Antibiotics are effective against:',o:['viruses','bacteria','all diseases','allergies'],a:1,why:'Bacteria only.'},
 exam:'Antibiotics and resistance: 2–3 marks.'}
];

const CARDS=[['Health (WHO)','Physical, mental and social well-being.'],['Deficiency','Scurvy (C), anaemia (iron), goitre (iodine).'],['Communicable','Spreads: cold, TB, malaria, dengue.'],['Non-communicable','Does not spread: diabetes, heart disease.'],['Vectors','Mosquitoes: Anopheles (malaria), Aedes (dengue).'],['Defences','Skin, mucus, acid; white blood cells.'],['Immunity','Antibodies + memory.'],['Vaccine','Weakened germ trains immunity; Jenner 1796.'],['Herd immunity','Many vaccinated protect all.'],['Antibiotics','Bacteria only; full course; avoid resistance.']];

const Q=[
 {lv:1,q:'Goitre is caused by lack of:',o:['vitamin C','iodine','iron','calcium'],a:1,w:'Iodine.'},
 {lv:1,q:'Malaria is spread by:',o:['Aedes','Anopheles','housefly','water'],a:1,w:'Anopheles.'},
 {lv:1,q:'Antibiotics do not work on:',o:['bacteria','viruses'],a:1,w:'Viruses.'},
 {lv:2,q:'Which spreads through contaminated water?',o:['TB','cholera','diabetes','dengue'],a:1,w:'Water-borne.'},
 {lv:2,q:'First line of defence includes:',o:['antibodies','skin and mucus','vaccines','antibiotics'],a:1,w:'Barriers.'},
 {lv:2,q:'Rotavac, an Indian vaccine, protects against:',o:['polio','rotavirus diarrhoea','TB','malaria'],a:1,w:'M.K. Bhan.'},
 {lv:3,q:'Dengue cases peak in July–September mainly because:',o:['it is cold','stagnant water helps mosquitoes breed','schools are open','people eat more'],a:1,w:'Monsoon.'},
 {lv:3,q:'Stopping antibiotics early can cause:',o:['faster cure','antibiotic resistance','immunity','vaccination'],a:1,w:'Resistance.'},
 {lv:4,q:'Herd immunity protects:',o:['only vaccinated people','also those who cannot be vaccinated','only adults','nobody'],a:1,w:'Community.'},
 {lv:4,q:'A person always tense and isolated, with normal body health, lacks:',o:['physical health','mental and social well-being','nothing','immunity'],a:1,w:'WHO definition.'},
 {lv:5,open:true,m:3,q:'How do vaccines protect us? Why is it important for most people in a community to be vaccinated?',ans:['Vaccine has weakened/killed germs or parts (1)','Body makes antibodies and memory without disease (1)','Herd immunity: germ cannot spread, protecting those not vaccinated (1)']},
 {lv:5,open:true,m:5,q:'Your family is travelling to a place where malaria is common. Suggest five precautions.',ans:['Mosquito nets (1)','Repellents (1)','Full-sleeved clothes, especially evenings (1)','Avoid/clear stagnant water near stay (1)','See a doctor quickly if fever; prescribed medicine only (1)']}
];

const ONEMIN=['Health = physical + mental + social.','Communicable vs non-communicable.','Routes of spread and how to block them.','Immune system: block, fight, remember.','Vaccines and herd immunity.','Antibiotics: bacteria only; resistance.'];
const KEYS=[['health',/well-being|health/i],['communicable',/communicable|spread/i],['vectors',/mosquito|vector/i],['immunity',/immun|antibod|white blood/i],['vaccine',/vaccin/i],['antibiotics',/antibiotic|resistance/i]];

/* ---------- lab ---------- */
const N=20;let grid=[],vac=0,hyg=0,running=false,timer=null,wired=false,days=0;
function seedRand(s){return ()=>{s=(s*9301+49297)%233280;return s/233280}}
function reset(){grid=[];const r=seedRand(7);for(let i=0;i<N*N;i++)grid.push(r()*100<vac?'V':'S');let c=Math.floor(N*N/2)+N/2;while(grid[c]==='V')c++;grid[c]='I';days=0;running=false;clearInterval(timer)}
function draw(){let s='';const u=14,x0=(460-N*u)/2,y0=8;for(let i=0;i<N*N;i++){const x=x0+(i%N)*u,y=y0+Math.floor(i/N)*u;const st=grid[i];s+=`<circle cx="${x+u/2}" cy="${y+u/2}" r="${u/2-1.5}" fill="${st==='V'?BL:st==='I'?OR:st==='R'?GR:'#d9cfc6'}" ${st==='I'?'':''}/>`}
 const cnt=k=>grid.filter(g=>g===k).length;s+=T(115,305,`healthy ${cnt('S')}`,'font-size="11"')+T(200,305,`ill ${cnt('I')}`,'font-size="11" fill="'+OR+'"')+T(275,305,`recovered ${cnt('R')}`,'font-size="11" fill="'+GR+'"')+T(370,305,`vaccinated ${cnt('V')}`,'font-size="11" fill="'+BL+'"');
 $('#oSvg').innerHTML=s;$('#oVv').textContent=vac+'%';$('#oHv').textContent=['none','some','good'][hyg]}
function stepSim(){const p=[0.55,0.35,0.2][hyg];const nxt=[...grid];let any=false;const r=Math.random;
 for(let i=0;i<N*N;i++)if(grid[i]==='I'){any=true;const x=i%N,y=Math.floor(i/N);[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const a=x+dx,b=y+dy;if(a<0||b<0||a>=N||b>=N)return;const j=b*N+a;if(grid[j]==='S'&&r()<p)nxt[j]='I'});if(r()<.35)nxt[i]='R'}
 grid=nxt;days++;draw();if(!any||!grid.includes('I')){clearInterval(timer);running=false;const ill=grid.filter(g=>g==='R'||g==='I').length,sus=N*N-grid.filter(g=>g==='V').length;
  $('#oOut').innerHTML=`<p>Outbreak over after ${days} days. <b>${ill}</b> people fell ill — ${Math.round(100*ill/Math.max(1,sus))}% of those not vaccinated.</p><p>${vac>=70?'<span class="fb ok">With high vaccination, the germ ran out of people to infect — herd immunity protected even the unvaccinated.</span>':vac>=40?'Vaccination slowed the spread. Try a higher level or better hygiene.':'With few people vaccinated, the infection spread widely.'} ${hyg?'Hygiene reduced the chance of passing it on.':''}</p>`}}
function labShow(){if(!grid.length)reset();draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('oS')){if(e.target.id==='oV')vac=+e.target.value;else hyg=+e.target.value;reset();draw();$('#oOut').innerHTML=''}})}
function labClick(b){if(b.id==='oGo'){if(running)return true;reset();running=true;$('#oOut').innerHTML='<p>Spreading…</p>';timer=setInterval(()=>{if(!$('#oSvg')||!$('#oSvg').isConnected){clearInterval(timer);running=false;return}stepSim()},180);return true}if(b.id==='oRe'){reset();draw();$('#oOut').innerHTML='';return true}return false}
function labChange(){return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
