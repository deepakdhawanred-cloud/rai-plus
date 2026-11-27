/* Rai Plus content pack: Class 9 Social Science – Political Science (Democratic Politics I), Chapter P4 – Working of Institutions. Original summary content. */
RP.register({key:'9sstp4',cls:'9',subject:'Social Science',ch:'P4',title:"Working of Institutions",color:'#8b3a62',
crumb:"Class 9 Social Science · Political Science",h1:"Political Science · Chapter 4: Working of Institutions",sub:"How a major decision is taken, Parliament and its two Houses, the political and permanent executive, the Prime Minister and the President, and the independent judiciary.",heroLabel:"Parliament, executive and judiciary",labName:'Bill journey and "Who decides?" lab',
theme:"\n:root{--g:light-dark(#8b3a62,#e6a9c6);--g2:light-dark(#f8ecf2,#1c0b14);--line:light-dark(#ecd0de,#43233a);--bg:light-dark(#ffffff,#12080d);--card:light-dark(#ffffff,#1a0c14);\n--ink:light-dark(#2a0f1d,#f4e3eb);--mute:light-dark(#6c4a5b,#cdb0bf);--y:light-dark(#1f5f8b,#8fc2e6);--y2:light-dark(#e8f1f8,#0b1622);--hd:#6e2a4c}\n",
labHTML:`  <h2>Bill journey and "Who decides?" lab</h2>
  <p>Journey mode: take a bill through Parliament step by step. Choose an ordinary bill or a money bill and see how the role of the Rajya Sabha changes. Quiz mode: read a situation and pick the institution responsible.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="pSvg" viewBox="0 0 460 320" role="img" aria-label="Bill journey" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="pM"><option value="j">Bill journey</option><option value="q">Who decides? quiz</option></select></label></div>
  <div class="ctrl" id="pJC"><label>Bill type<select id="pT"><option value="o">Ordinary bill</option><option value="m">Money bill</option></select></label> <button class="btn" id="pNext">Next step</button> <button class="btn" id="pRe">Restart</button></div>
  <div class="ctrl" id="pQC" style="display:none"><button class="btn" id="pQ">New situation</button></div>
  <div class="ctrl" id="pOpts"></div>
  <div class="box y" id="pOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#8b3a62',LABNAME='Bill journey and "Who decides?" lab',MIND_CENTER='Institutions';
const MG='#8b3a62',BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
const arr=(x1,y1,x2,y2,c=GR)=>{const a=Math.atan2(y2-y1,x2-x1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2"/><path d="M${x2} ${y2} L${x2-8*Math.cos(a-.45)} ${y2-8*Math.sin(a-.45)} L${x2-8*Math.cos(a+.45)} ${y2-8*Math.sin(a+.45)}Z" fill="${c}"/>`};
function heroDraw(){return `<rect x="60" y="40" width="70" height="90" rx="6" fill="none" stroke="#fff" stroke-width="3"/><rect x="155" y="40" width="70" height="90" rx="6" fill="none" stroke="#fff" stroke-width="3"/><rect x="250" y="40" width="70" height="90" rx="6" fill="none" stroke="#fff" stroke-width="3"/>`}
const HERO=heroDraw;
const MIND=[['Decision making',100,50],['Parliament',420,50],['Two Houses',90,150],['Executive',430,150],['PM & President',110,250],['Judiciary',410,250]];

const C=[
{id:'w1',num:'4.1',title:'How a major policy decision is taken',
 intro:'In 1990 the Government of India announced 27% reservation in central government jobs for socially and educationally backward classes. Who took that decision, and how?',
 obj:'Trace how institutions together make and check a major decision.',
 prior:'P3 Electoral Politics.',
 simple:'Democracy works through institutions: the legislature (Parliament) makes laws, the executive (government) puts them into action, and the judiciary settles disputes. In the 1990 example: the Mandal Commission (set up in 1979) had recommended reservations; the Union Cabinet decided to act on them; officials drafted the order — an Office Memorandum issued on 13 August 1990; Parliament debated it; people protested and others supported it; cases went to the Supreme Court, which in 1992 (the Indira Sawhney case) upheld the order but asked the government to exclude the well-off among backward classes (the "creamy layer").',
 detail:'An Office Memorandum is an order issued by a government department. The President is formally the head; the Prime Minister and Cabinet take the decision; civil servants prepare it. Institutions involve rules and delays, but they ensure decisions are discussed, checked and fair — which is why democracies rely on them.',
 real:'School decisions too pass through institutions: principal, school management committee, and rules from the board.',
 apply:'List the institutions involved in the 1990 decision and the role of each.',
 see:{w:520,h:230,f:[
  ['Mandal Commission recommends (1980 report).',box(20,30,140,55,'Commission',GR,'recommends')],
  ['Cabinet decides; officials issue the Office Memorandum (1990).',arr(160,57,195,57)+box(195,30,140,55,'Cabinet',MG,'decides')+arr(335,57,370,57)+box(370,30,140,55,'Officials',BL,'issue order')],
  ['Supreme Court upholds it, with changes (1992).',arr(440,85,440,130)+box(330,130,180,60,'Supreme Court',PU,'upholds, excludes creamy layer')+lbl(160,170,'Parliament debates, people react','fill="'+GN+'"')]]},
 seeNote:'Many institutions, one decision.',
 do:{title:'Newspaper trail',mat:'News articles on a recent government decision',steps:['Identify who proposed, decided, implemented and challenged it.'],obs:'Several institutions involved.',why:'Checks and balances.',lab:false},
 memo:'"Propose → decide → implement → review."',
 miscon:['"The Prime Minister alone decides everything." Decisions pass through many institutions.'],
 terms:['Institution','Office Memorandum','Cabinet','Mandal Commission','Creamy layer'],
 q:{q:'The 1990 reservation order was issued as a(n):',o:['Act of Parliament','Office Memorandum','Supreme Court judgment','President\'s speech'],a:1,why:'Government order.'},
 exam:'Role of institutions in a decision: 3–5 marks.'},

{id:'w2',num:'4.2',title:'Parliament and why we need it',
 intro:'Why have an assembly of elected representatives at all?',
 obj:'Explain the powers and importance of Parliament.',
 prior:'4.1.',
 simple:'Parliament is the national assembly of elected representatives: the President, the Lok Sabha and the Rajya Sabha. It is the final authority for making laws; it controls the government (ministers must answer questions; the government stays only while it has the support of the Lok Sabha); it controls the money (taxes and spending need its approval); and it is the highest forum for debate on public issues.',
 detail:'Tools of control: Question Hour, debates, motions, committees, and a no-confidence motion that can remove a government in the Lok Sabha. State legislatures (Vidhan Sabhas) do the same for states — Haryana has a one-house legislature, the Haryana Vidhan Sabha.',
 real:'Every year the Budget is presented and passed in Parliament before the government can spend.',
 apply:'Give two ways Parliament controls the government.',
 see:{w:520,h:220,f:[
  ['Parliament = President + Lok Sabha + Rajya Sabha.',box(170,20,180,50,'Parliament',MG)],
  ['Its four big roles.',[['Makes laws',20],['Controls govt.',145],['Controls money',270],['Debates issues',395]].map(([t,x])=>box(x,120,110,50,t,BL)).join('')],
  ['Connected.',[75,200,325,450].map(x=>arr(260,70,x,118)).join('')]]},
 seeNote:'Laws, control, money, debate.',
 do:{title:'Watch Question Hour',mat:'Sansad TV clip',steps:['Note three questions asked to ministers.'],obs:'Ministers must answer.',why:'Accountability.',lab:false},
 memo:'"Law, Look-after, Lakh-rupee budget, Loud debate."',
 miscon:['"Parliament only makes laws." It also controls government and money.'],
 terms:['Parliament (संसद)','Question Hour','No-confidence motion','Budget'],
 q:{q:'A government must keep the support of:',o:['Rajya Sabha','Lok Sabha','Supreme Court','Election Commission'],a:1,why:'Lok Sabha majority.'},
 exam:'Functions of Parliament: 3 marks.'},

{id:'w3',num:'4.3',title:'Lok Sabha and Rajya Sabha',
 intro:'If the two Houses disagree, whose view wins?',
 obj:'Compare the composition and powers of the two Houses.',
 prior:'4.2.',
 simple:'Lok Sabha (House of the People): members directly elected by the people (543 elected seats); term 5 years. Rajya Sabha (Council of States): members elected by state legislatures, plus 12 nominated by the President; it is permanent, with one-third of members retiring every 2 years. Lok Sabha is more powerful.',
 detail:'Why Lok Sabha is stronger: (1) ordinary bills must pass both Houses, but in a deadlock a joint sitting decides — Lok Sabha\'s larger numbers usually prevail; (2) money bills start only in the Lok Sabha; the Rajya Sabha can only delay them up to 14 days or suggest changes, which the Lok Sabha may reject; (3) the Lok Sabha controls the Council of Ministers — a no-confidence motion there removes the government. The Rajya Sabha protects the interests of the states.',
 real:'Haryana elects 5 Rajya Sabha members through its MLAs and 10 Lok Sabha members directly.',
 apply:'Why can\'t the Rajya Sabha block a money bill?',
 see:{w:520,h:240,f:[
  ['Lok Sabha: directly elected, 5 years.',box(30,30,200,70,'Lok Sabha',GN,'directly elected · 5 years')],
  ['Rajya Sabha: elected by MLAs + 12 nominated; permanent.',box(290,30,200,70,'Rajya Sabha',OR,'by MLAs + 12 nominated · permanent')],
  ['Lok Sabha has more power.',lbl(130,140,'Money bills start here','fill="'+GN+'"')+lbl(130,165,'Controls the ministers','fill="'+GN+'"')+lbl(130,190,'Wins joint sitting (numbers)','fill="'+GN+'"')+lbl(390,140,'Can delay money bill 14 days','fill="'+OR+'"')+lbl(390,165,'Represents the states','fill="'+OR+'"')]]},
 seeNote:'Lok Sabha: more power; Rajya Sabha: voice of the states.',
 do:{title:'Comparison chart',mat:'Notebook',steps:['Make a 2-column table: composition, term, money bills, control of ministers.'],obs:'Lok Sabha stronger.',why:'Direct election.',lab:true},
 memo:'"Lok = log (people), stronger; Rajya = states, permanent."',
 miscon:['"Rajya Sabha is the upper house, so it is more powerful." Lok Sabha holds more real power.'],
 terms:['Lok Sabha (लोक सभा)','Rajya Sabha (राज्य सभा)','Money bill','Joint sitting'],
 q:{q:'Money bills can be introduced only in:',o:['Rajya Sabha','Lok Sabha','either House','Supreme Court'],a:1,why:'Lok Sabha.'},
 exam:'Compare the two Houses: 3–5 marks.'},

{id:'w4',num:'4.4',title:'Political and permanent executive',
 intro:'The Health Minister may be a lawyer by training. Who gives the expert advice?',
 obj:'Distinguish the political executive from the permanent executive and describe the Council of Ministers.',
 prior:'4.2.',
 simple:'The executive carries out government policies. The political executive is elected by the people for a fixed period — the Prime Minister and ministers. The permanent executive is civil servants (IAS, IPS officers etc.) appointed on a long-term basis; they stay even when governments change. Ministers have more power because, in a democracy, the will of the people is supreme; officers advise and implement.',
 detail:'The Council of Ministers has three ranks: Cabinet Ministers (top leaders heading major ministries; the Cabinet is the inner group that takes key decisions), Ministers of State with independent charge, and Ministers of State who assist Cabinet Ministers. Ministers must be members of Parliament (or become one within six months). Collective responsibility: the whole Cabinet stands together on decisions.',
 real:'District level: the elected MLA raises issues; the Deputy Commissioner (IAS) implements schemes.',
 apply:'Why should a non-expert minister have the final say over an expert officer?',
 see:{w:520,h:230,f:[
  ['Political executive: elected, fixed term.',box(30,30,200,70,'Political executive',MG,'PM & ministers · elected')],
  ['Permanent executive: civil servants, long-term.',box(290,30,200,70,'Permanent executive',BL,'civil servants · appointed')],
  ['Ministers decide; officers advise and implement.',arr(230,65,288,65,MG)+lbl(260,140,'Ministers decide (people\'s will)','fill="'+MG+'"')+lbl(260,165,'Officers advise and implement','fill="'+BL+'"')]]},
 seeNote:'People\'s will, expert help.',
 do:{title:'Role cards',mat:'Cards: Minister, Secretary, MP',steps:['Act out a decision on a new school scheme.'],obs:'Minister decides, secretary drafts.',why:'Executive roles.',lab:false},
 memo:'"Political = elected, decides; permanent = expert, stays."',
 miscon:['"Civil servants are elected." They are appointed through exams.'],
 terms:['Political executive','Permanent executive','Civil servant','Cabinet (मंत्रिमंडल)','Collective responsibility'],
 q:{q:'An IAS officer belongs to the:',o:['political executive','permanent executive','legislature','judiciary'],a:1,why:'Appointed civil servant.'},
 exam:'Political vs permanent executive: 3 marks.'},

{id:'w5',num:'4.5',title:'The Prime Minister and the President',
 intro:'Who is the head of the country, and who heads the government?',
 obj:'Describe the powers of the Prime Minister and the position of the President.',
 prior:'4.4.',
 simple:'The President is the head of the State — a nominal (ceremonial) head. The Prime Minister is the head of the government and holds real power. The President appoints as PM the leader of the majority party or coalition in the Lok Sabha; the PM chooses the ministers, who are then appointed by the President. The PM chairs Cabinet meetings, coordinates departments and can dismiss ministers.',
 detail:'The President is elected indirectly by elected MPs and MLAs, not directly by the people. All government actions happen in the President\'s name, and the President is also the Supreme Commander of the armed forces, but acts on the advice of the Council of Ministers. The President can ask the Council to reconsider advice once; if it sends the same advice again, the President must follow it. The President\'s own discretion matters most when no party has a clear majority and the President must choose who can form a government. In coalition governments, the PM must accommodate partner parties, which limits the PM\'s power.',
 real:'Bills become laws only after the President signs them.',
 apply:'Why is the President called a nominal head?',
 see:{w:520,h:220,f:[
  ['President: head of State (nominal).',box(30,30,200,60,'President',PU,'head of State · nominal')],
  ['Prime Minister: head of government (real power).',box(290,30,200,60,'Prime Minister',MG,'head of govt. · real power')],
  ['President acts on advice of the Council of Ministers.',arr(290,75,232,75,MG)+lbl(260,130,'advice of PM & Council','fill="'+MG+'"')+lbl(260,170,'elected indirectly by MPs + MLAs','fill="'+PU+'"')]]},
 seeNote:'Nominal head vs real head.',
 do:{title:'Indirect election',mat:'Class simulation',steps:['Class reps (as MLAs) vote for a "President".'],obs:'Indirect election.',why:'President\'s election.',lab:false},
 memo:'"President signs; Prime Minister steers."',
 miscon:['"The people directly elect the President." Elected MPs and MLAs do.'],
 terms:['Head of State','Head of government','Nominal executive','Coalition'],
 q:{q:'The Prime Minister is appointed by the:',o:['people directly','President','Chief Justice','Rajya Sabha'],a:1,why:'Leader of the Lok Sabha majority.'},
 exam:'Powers of PM; position of President: 3–5 marks.'},

{id:'w6',num:'4.6',title:'The independent judiciary',
 intro:'Can a court cancel a law made by Parliament?',
 obj:'Explain the structure and independence of the Indian judiciary and its powers.',
 prior:'4.1–4.5.',
 simple:'The judiciary settles disputes and protects rights. India has an integrated judiciary: the Supreme Court at the top, High Courts in the states, and district and subordinate courts below. The Supreme Court\'s decisions bind all courts. The judiciary is independent: it is not under the control of the legislature or the executive.',
 detail:'Judges of the Supreme Court and High Courts are appointed by the President on the advice of the PM and in consultation with the Chief Justice of India; in practice senior judges play a major role. A judge can be removed only by an impeachment motion passed separately by two-thirds of members present in both Houses — very rare. Judicial review: courts can declare a law or action invalid if it goes against the Constitution. Public Interest Litigation (PIL): anyone can approach the courts if public interest is hurt by government action.',
 real:'Through PILs, courts have given orders on issues like pollution and children\'s rights.',
 apply:'Why is independence of judges important for ordinary citizens?',
 see:{w:520,h:240,f:[
  ['Supreme Court at the top.',box(185,20,150,50,'Supreme Court',PU)],
  ['High Courts in the states.',arr(260,70,260,95)+box(185,95,150,45,'High Courts',BL)],
  ['District and subordinate courts.',arr(260,140,260,165)+box(160,165,200,45,'District courts',GN)+lbl(440,60,'Judicial review','fill="'+PU+'"')+lbl(440,85,'PIL','fill="'+PU+'"')+lbl(440,110,'Independent','fill="'+PU+'"')]]},
 seeNote:'Integrated and independent.',
 do:{title:'Moot court',mat:'Classroom roles',steps:['Hold a mock PIL hearing on a school issue.'],obs:'Arguments, judgment.',why:'Role of courts.',lab:false},
 memo:'"Courts check the other two."',
 miscon:['"Judges can be removed by the government easily." Only by impeachment by Parliament.'],
 terms:['Judiciary (न्यायपालिका)','Judicial review','PIL','Impeachment','Integrated judiciary'],
 q:{q:'The power to declare a law unconstitutional is:',o:['impeachment','judicial review','money bill','Question Hour'],a:1,why:'Courts.'},
 exam:'Independence and powers of judiciary: 3–5 marks.'}
];

const CARDS=[['Institutions','Legislature, executive, judiciary.'],['1990 decision','Mandal → Cabinet → Office Memorandum → Supreme Court (1992).'],['Parliament','President + Lok Sabha + Rajya Sabha.'],['Lok Sabha','Directly elected; stronger; money bills.'],['Rajya Sabha','States\' house; permanent; 14-day delay on money bills.'],['Political executive','Elected; decides.'],['Permanent executive','Civil servants; implements.'],['Prime Minister','Head of government; real power.'],['President','Head of State; nominal; elected indirectly.'],['Judiciary','Independent; judicial review; PIL.']];

const Q=[
 {lv:1,q:'The head of the State in India is the:',o:['Prime Minister','President','Chief Justice','Speaker'],a:1,w:'Nominal head.'},
 {lv:1,q:'Rajya Sabha members are mostly elected by:',o:['the people','state legislatures','the President','judges'],a:1,w:'MLAs.'},
 {lv:1,q:'Which is part of the permanent executive?',o:['Prime Minister','Cabinet Minister','IAS officer','MP'],a:2,w:'Civil servant.'},
 {lv:2,q:'Rajya Sabha can delay a money bill by up to:',o:['14 days','6 months','1 year','forever'],a:0,w:'14 days.'},
 {lv:2,q:'Who presides over the Cabinet?',o:['President','Prime Minister','Vice-President','Speaker'],a:1,w:'PM.'},
 {lv:2,q:'A judge can be removed by:',o:['Prime Minister\'s order','impeachment by Parliament','President alone','Election Commission'],a:1,w:'Two-thirds in both Houses.'},
 {lv:3,q:'Supreme Court upheld the 1990 order but excluded:',o:['all OBCs','the creamy layer','women','farmers'],a:1,w:'Indira Sawhney case.'},
 {lv:3,q:'Why does the Lok Sabha usually win a joint sitting?',o:['It meets first','It has more members','The Speaker decides','The President helps'],a:1,w:'Numbers.'},
 {lv:4,q:'A citizen files a case against river pollution in public interest. This is:',o:['impeachment','PIL','money bill','Question Hour'],a:1,w:'Public Interest Litigation.'},
 {lv:4,q:'Which shows Parliament controlling the executive?',o:['Question Hour','Judicial review','Civil service exam','Election of judges'],a:0,w:'Ministers answer.'},
 {lv:5,open:true,m:3,q:'Give three reasons why the Lok Sabha is more powerful than the Rajya Sabha.',ans:['Joint sitting: Lok Sabha\'s larger numbers usually prevail (1)','Money bills: start in Lok Sabha; Rajya Sabha can only delay 14 days (1)','Controls Council of Ministers; no-confidence motion removes govt. (1)']},
 {lv:5,open:true,m:5,q:'Describe the institutions involved in the 1990 decision on reservations for backward classes.',ans:['Mandal Commission recommended reservations (1)','Cabinet (PM & ministers) decided to implement (1)','Officials drafted and issued the Office Memorandum, 13 Aug 1990 (1)','Parliament debated; people reacted (1)','Supreme Court (1992) upheld it, excluding the creamy layer (1)']}
];

const ONEMIN=['1990 decision: many institutions.','Parliament: laws, control, money, debate.','Lok Sabha stronger than Rajya Sabha.','Political vs permanent executive.','PM real head; President nominal head.','Independent judiciary: judicial review, PIL.'];
const KEYS=[['institutions',/institution/i],['Parliament',/parliament|lok sabha|rajya sabha/i],['executive',/executive|minister|civil serv/i],['PM / President',/prime minister|president/i],['judiciary',/court|judici|judge/i],['money bill',/money bill/i]];

/* ---------- lab ---------- */
const STEPS={o:[['Drafted','A ministry drafts the bill; the Cabinet approves it.',BL],['Lok Sabha','Introduced, debated (three readings), voted. Passed by majority.',GN],['Rajya Sabha','Debated and voted. It can pass, amend or reject an ordinary bill.',OR],['Agreement?','If the Houses disagree, the President can call a joint sitting; the larger Lok Sabha usually prevails.',PU],['President','The President gives assent (can return it once for reconsideration).',MG],['Law','The bill becomes an Act — a law.',GN]],
 m:[['Drafted','The Finance Ministry prepares the money bill (e.g. the Budget). Only the Lok Sabha may receive it first.',BL],['Lok Sabha','Introduced only in the Lok Sabha, debated and passed.',GN],['Rajya Sabha','Can only recommend changes and delay it up to 14 days — it cannot reject it.',OR],['Lok Sabha decides','The Lok Sabha may accept or reject the suggestions. If 14 days pass, the bill is deemed passed.',GN],['President','The President gives assent (cannot return a money bill).',MG],['Law','The money bill becomes law.',GN]]};
const SIT=[['A minister must answer MPs\' questions about rising prices.','Parliament'],['A court strikes down a law that violates Fundamental Rights.','Judiciary'],['A district collector implements a new road scheme.','Permanent executive'],['The Prime Minister drops a minister from the Cabinet.','Political executive'],['A no-confidence motion is debated.','Parliament'],['A citizen\'s PIL about clean air is heard.','Judiciary'],['A ministry secretary drafts a new rule for the minister.','Permanent executive'],['The Cabinet decides to launch a new scheme for farmers.','Political executive']];
const INST=['Parliament','Political executive','Permanent executive','Judiciary'];
let mode='j',type='o',step=0,cur=null,wired=false;
function drawJ(){const S=STEPS[type];let s='';S.forEach(([t,,c],i)=>{const col=i%3,row=Math.floor(i/3);const x=row?320-col*145:20+col*145,y=40+row*130;s+=`<rect x="${x}" y="${y}" width="120" height="60" rx="10" fill="${i<=step?c:'none'}" fill-opacity="${i===step?.35:.14}" stroke="${i<=step?c:GR}" stroke-width="${i===step?3:1.5}"/>`+T(x+60,y+35,t,`font-size="13" font-weight="700" fill="${i<=step?c:GR}"`);
  if(i<S.length-1){if(i===2)s+=arr(x+60,y+60,x+60,y+128,i<step?ink:GR);else if(row===0)s+=arr(x+120,y+30,x+143,y+30,i<step?ink:GR);else s+=arr(x,y+30,x-23,y+30,i<step?ink:GR)}});
 s+=T(230,290,type==='o'?'Ordinary bill':'Money bill','font-size="16" font-weight="700"');$('#pSvg').innerHTML=s;const [t,d]=S[step];$('#pOut').innerHTML=`<p><b>Step ${step+1}: ${t}.</b> ${d}</p>${step===S.length-1?'<p class="fb ok">Done! Restart or switch bill type to compare.</p>':''}`}
function drawQ(){let s=INST.map((n,i)=>box(20+(i%2)*225,40+Math.floor(i/2)*120,195,80,n,[BL,MG,GN,PU][i])).join('');$('#pSvg').innerHTML=s}
function draw(){$('#pJC').style.display=mode==='j'?'':'none';$('#pQC').style.display=mode==='q'?'':'none';if(mode==='j'){$('#pOpts').innerHTML='';drawJ()}else{drawQ();if(!cur)$('#pOut').innerHTML='<p>Press "New situation".</p>'}}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-inst]');if(!b||!cur)return;const ok=b.dataset.inst===cur[1];$('#pOut').innerHTML=ok?`<p class="fb ok">Correct — ${cur[1]}.</p>`:`<p class="fb no">Not quite — this is the ${cur[1]}.</p>`;$('#pOpts').innerHTML='';cur=null})}
function labClick(bt){if(bt.id==='pNext'){if(step<STEPS[type].length-1)step++;drawJ();return true}if(bt.id==='pRe'){step=0;drawJ();return true}
 if(bt.id==='pQ'){cur=SIT[Math.floor(Math.random()*SIT.length)];$('#pOut').innerHTML=`<p><b>Situation:</b> ${cur[0]}</p>`;$('#pOpts').innerHTML=INST.map(n=>`<button class="btn" type="button" data-inst="${n}">${n}</button>`).join(' ');return true}return false}
function labChange(t){if(t.id==='pM'){mode=t.value;cur=null;draw();return true}if(t.id==='pT'){type=t.value;step=0;drawJ();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
