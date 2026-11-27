/* Rai Plus content pack: Class 6 Mathematics (Ganita Prakash), Chapter 10 – The Other Side of Zero. */
RP.register({key:'6mat10',cls:'6',subject:'Mathematics',ch:'10',title:"The Other Side of Zero",color:'#1f5f8b',
crumb:"Class 6 Mathematics · Ganita Prakash",h1:"Chapter 10: The Other Side of Zero",sub:"Negative numbers: the building lift, the number line, adding and subtracting with tokens, comparing, and real-life uses.",heroLabel:"A lift with floors above and below ground",labName:'Integer lab',
theme:"\n:root{--g:light-dark(#1f5f8b,#8fc2e6);--g2:light-dark(#e8f1f8,#0b1622);--line:light-dark(#cde0ee,#22384b);--bg:light-dark(#ffffff,#081018);--card:light-dark(#ffffff,#0d1620);\n--ink:light-dark(#0d1d2a,#e1ecf5);--mute:light-dark(#475d70,#a7bccd);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#174a6d}\n",
labHTML:`  <h2>Integer lab</h2>
  <p>Choose a start, an operation and a number. See it as a jump on the number line and as tokens (zero pairs cancel).</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="iSvg" viewBox="0 0 460 300" role="img" aria-label="Number line and tokens" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Start: <b id="iAv"></b><input type="range" class="iS" id="iA" min="-8" max="8" value="3"></label></div><div class="ctrl"><label>Operation<select id="iOp"><option value="+">add (+)</option><option value="-">subtract (−)</option></select></label></div><div class="ctrl"><label>Number: <b id="iBv"></b><input type="range" class="iS" id="iB" min="-8" max="8" value="-5"></label></div><div class="box y" id="iOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#1f5f8b',LABNAME='Integer lab',MIND_CENTER='Integers';
const BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const sg=n=>n>0?'+'+n:n<0?'−'+(-n):'0';
const tok=(x,y,p)=>`<circle cx="${x}" cy="${y}" r="11" fill="${p?GN:OR}" opacity=".85"/>`+T(x,y+5,p?'+':'−','font-size="15" fill="#fff" font-weight="700"');
function nline(x0,x1,y,lo,hi,step=1){const X=v=>x0+(v-lo)*(x1-x0)/(hi-lo);let s=`<line x1="${x0-10}" y1="${y}" x2="${x1+10}" y2="${y}" stroke="${ink}" stroke-width="2"/>`;for(let v=lo;v<=hi;v+=step)s+=`<line x1="${X(v)}" y1="${y-5}" x2="${X(v)}" y2="${y+5}" stroke="${ink}"/>`+T(X(v),y+20,sg(v),`font-size="11" fill="${v<0?OR:v>0?GN:'currentColor'}"`);return {s,X}}
function lift(x,y,floor){let s='';for(let f=-3;f<=3;f++){const yy=y-f*26;s+=`<rect x="${x}" y="${yy-13}" width="90" height="26" fill="${f<0?'#e9d9c8':f===0?'#cfe3cf':'#dde8f2'}" stroke="${GR}"/>`+T(x-14,yy+5,sg(f),'font-size="12"')}s+=`<rect x="${x+30}" y="${y-floor*26-11}" width="30" height="22" fill="${BL}"/>`;return s+`<line x1="${x-30}" y1="${y+13}" x2="${x+120}" y2="${y+13}" stroke="${GN}" stroke-width="2"/>`}
function heroDraw(){let s='';for(let f=-2;f<=2;f++)s+=`<rect x="60" y="${70-f*20}" width="70" height="20" fill="none" stroke="#fff"/>`;return s+`<rect x="80" y="72" width="26" height="16" fill="#fff"/><line x1="160" y1="80" x2="380" y2="80" stroke="#fff" stroke-width="3"/><circle cx="270" cy="80" r="6" fill="#fff"/>`}
const HERO=heroDraw;
const MIND=[['Lift & floors',100,50],['Number line',420,50],['Adding',90,150],['Subtracting',430,150],['Tokens & zero pairs',110,250],['Real life & history',410,250]];

const C=[
{id:'i1',num:'10.1',title:'Floors above and below ground',
 intro:'In a mall, the lift shows B1, B2 for floors below the ground. How would you number them?',
 obj:'Use positive and negative numbers to describe positions above and below zero.',
 prior:'Counting numbers.',
 simple:'In the "Chhotu building", the ground floor is 0. Floors above are +1, +2, +3 (positive numbers). Floors below are −1, −2, −3 (negative numbers, read "negative one"). Pressing +3 in the lift means "go up 3"; −2 means "go down 2". Starting at +1 and pressing −3 takes you to −2.',
 detail:'Numbers ..., −3, −2, −1, 0, +1, +2, +3, ... are integers (पूर्णांक). Zero is neither positive nor negative. We often write positive numbers without the + sign: +5 = 5. Each positive number has an opposite negative number: the opposite of +4 is −4.',
 real:'Basement parking levels are often marked B1, B2, which are like −1, −2.',
 apply:'You are at floor −1 and press +4. Where do you reach?',
 see:{w:520,h:240,f:[
  ['Ground floor is 0.',lift(200,130,0)],
  ['Up: +1, +2, +3. Down: −1, −2, −3.',lbl(380,60,'above ground: positive','fill="'+GN+'"')+lbl(380,200,'below ground: negative','fill="'+OR+'"')],
  ['From +1, press −3: reach −2.',lift(200,130,-2)+lbl(380,130,'+1 + (−3) = −2','font-weight="700"')]]},
 seeNote:'Zero is the reference.',
 do:{title:'Human lift',mat:'Chalk ladder on the ground marked −5 to +5',steps:['Stand on 0.','Classmates call "+3", "−4" etc.','Move and say where you land.'],obs:'Positions.',why:'Integers.',lab:false},
 memo:'"Up is plus, down is minus, ground is zero."',
 miscon:['"−3 is bigger than −1 because 3 > 1." −3 is further down.'],
 terms:['Positive number','Negative number','Integer · पूर्णांक','Opposite'],
 q:{q:'Two floors below the ground floor:',o:['+2','−2','0','2'],a:1,why:'Below zero.'},
 exam:'Represent situations with integers: 2 marks.'},

{id:'i2',num:'10.2',title:'The integer number line and comparing',
 intro:'Which is colder: −5 °C or −2 °C?',
 obj:'Place integers on the number line and compare them.',
 prior:'10.1.',
 simple:'On a number line, positive numbers are to the right of 0 and negative numbers to the left, at equal steps. A number to the right is greater. So 3 > −1, 0 > −4, and −2 > −5. Every negative number is less than 0 and less than every positive number.',
 detail:'Opposites are the same distance from 0 on either side: −3 and +3. Ordering: −7 < −4 < −1 < 0 < 2 < 6. Temperatures below 0 °C, like in Leh in winter (−15 °C), are negative.',
 real:'Leh can reach −20 °C in winter; Rewari rarely goes below 0 °C.',
 apply:'Arrange −3, 2, −7, 0, 5 in increasing order.',
 see:{w:520,h:180,f:[
  ['Number line from −5 to +5.',nline(40,480,90,-5,5).s],
  ['Right is greater: −2 > −5.',`<circle cx="172" cy="90" r="8" fill="${OR}"/><circle cx="40" cy="90" r="8" fill="${OR}" opacity=".5"/>`+lbl(130,60,'−2 > −5','font-weight="700"')],
  ['Opposites: −3 and +3.',`<path d="M128 75 Q260 20 392 75" fill="none" stroke="${GR}" stroke-dasharray="4 3"/>`+lbl(260,40,'same distance from 0')]]},
 seeNote:'Further right = greater.',
 do:{title:'Temperature order',mat:'Weather data for 5 cold cities',steps:['Write minimum temperatures.','Arrange coldest to warmest.'],obs:'Most negative = coldest.',why:'Comparing integers.',lab:false},
 memo:'"Right is more, left is less."',
 miscon:['"−5 > −2." On the number line −5 is to the left, so smaller.'],
 terms:['Number line','Greater than (>)','Less than (<)'],
 q:{q:'Which is greatest?',o:['−8','−3','−5','−1'],a:3,why:'Closest to the right.'},
 exam:'Compare and order integers: 2 marks.'},

{id:'i3',num:'10.3',title:'Adding integers',
 intro:'You are at −2 and go up 5 floors. Where are you?',
 obj:'Add integers using the number line and tokens.',
 prior:'10.2.',
 simple:'Adding a positive number moves right (up); adding a negative number moves left (down). On tokens: a green (+) token is +1, a red (−) token is −1. A + and a − together make a zero pair (+1 + (−1) = 0), so cancel them. (−2) + 5: two reds, five greens → two zero pairs cancel, three greens remain = +3.',
 detail:'Rules that follow: two positives add up (3 + 4 = 7); two negatives add up as a bigger negative ((−3) + (−4) = −7); a positive and a negative — find the difference and take the sign of the bigger one ((−6) + 2 = −4). Adding opposites gives 0: 5 + (−5) = 0.',
 real:'You owe ₹50 (−50) and earn ₹80 (+80): you now have ₹30.',
 apply:'Find (−7) + 4 and 7 + (−4).',
 see:{w:520,h:220,f:[
  ['(−2): two red tokens.',tok(80,60,0)+tok(110,60,0)],
  ['+5: five green tokens.',[0,1,2,3,4].map(k=>tok(200+k*30,60,1)).join('')],
  ['Zero pairs cancel: +3 left.',`<line x1="68" y1="48" x2="122" y2="72" stroke="#333" stroke-width="2"/><line x1="188" y1="48" x2="242" y2="72" stroke="#333" stroke-width="2"/>`+lbl(260,130,'(−2) + 5 = +3','font-size="18" font-weight="700"')+nline(60,460,180,-4,6).s]]},
 seeNote:'Zero pairs cancel.',
 do:{title:'Token game',mat:'Two colours of buttons',steps:['Show (−4) + 6 with buttons.','Remove zero pairs.','Count what is left.'],obs:'+2.',why:'Zero pairs.',lab:true},
 memo:'"+ and − together make zero."',
 miscon:['"(−3) + (−4) = +7." Two negatives make a bigger negative: −7.'],
 terms:['Token','Zero pair','Sum'],
 q:{q:'(−5) + 3 =',o:['8','−8','−2','2'],a:2,why:'Difference 2, sign of bigger (−5).'},
 exam:'Add integers: 2 marks.'},

{id:'i4',num:'10.4',title:'Subtracting integers',
 intro:'What is 3 − (−2)? Taking away a debt — does it make you richer?',
 obj:'Subtract integers; see that subtracting a number = adding its opposite.',
 prior:'10.3.',
 simple:'Subtracting means "take away". With tokens, to take away 2 reds from 3 greens, first add 2 zero pairs (doesn\'t change the value), then take away the 2 reds: 5 greens remain. So 3 − (−2) = 5. Rule: subtracting a number is the same as adding its opposite: a − b = a + (−b).',
 detail:'Examples: 5 − 8 = 5 + (−8) = −3; (−4) − 3 = (−4) + (−3) = −7; (−4) − (−6) = (−4) + 6 = 2. On the number line, subtracting a negative moves right. Subtraction also finds the difference between two levels: from −3 to +4 is 4 − (−3) = 7 floors.',
 real:'Temperature rose from −3 °C to 4 °C: a rise of 7 °C.',
 apply:'Find (−6) − (−2).',
 see:{w:520,h:220,f:[
  ['3 green tokens. Take away 2 reds — there are none!',[0,1,2].map(k=>tok(80+k*30,60,1)).join('')],
  ['Add 2 zero pairs (value unchanged).',[0,1].map(k=>tok(200+k*60,60,1)+tok(230+k*60,60,0)).join('')],
  ['Take away 2 reds: 5 greens left.',`<line x1="218" y1="48" x2="242" y2="72" stroke="#333" stroke-width="2"/><line x1="278" y1="48" x2="302" y2="72" stroke="#333" stroke-width="2"/>`+lbl(260,130,'3 − (−2) = 5 = 3 + 2','font-size="18" font-weight="700"')]]},
 seeNote:'Subtract = add the opposite.',
 do:{title:'Temperature change',mat:'Weather data',steps:['Find the change from minimum to maximum in Leh: e.g. −8 °C to 5 °C.'],obs:'5 − (−8) = 13 °C.',why:'Difference.',lab:false},
 memo:'"Minus a minus is a plus."',
 miscon:['"Subtraction always makes smaller." 3 − (−2) = 5 is bigger.'],
 terms:['Difference','Opposite','Additive inverse'],
 q:{q:'4 − (−3) =',o:['1','7','−7','−1'],a:1,why:'4 + 3.'},
 exam:'Subtract integers: 2 marks.'},

{id:'i5',num:'10.5',title:'Integers in real life and history',
 intro:'Where else do you see negative numbers around you?',
 obj:'Use integers in real-life situations; know their history.',
 prior:'10.1–10.4.',
 simple:'Integers describe opposites: profit (+) and loss (−), deposit (+) and withdrawal (−) in a bank, above and below sea level, temperatures above and below 0 °C, goal difference in football. A bank balance can be negative if you owe money.',
 detail:'Brahmagupta, in his book Brāhmasphuṭasiddhānta (628 CE), gave rules for working with zero and negative numbers (which he called debts, "ṛṇa") and positive numbers (fortunes, "dhana"): for example, a debt minus zero is a debt; zero minus a debt is a fortune. Negative numbers were accepted in Europe much later. The Dead Sea shore is about 430 m below sea level (−430 m).',
 real:'A shopkeeper\'s week: +₹300, −₹120, +₹50 → net +₹230.',
 apply:'A diver is at −15 m and rises 6 m. New depth?',
 see:{w:520,h:220,f:[
  ['Sea level is 0.',`<rect x="0" y="100" width="520" height="120" fill="${BL}" opacity=".25"/><line x1="0" y1="100" x2="520" y2="100" stroke="${BL}" stroke-width="2"/>`+lbl(40,92,'0 m')],
  ['Mountain: +; diver: −.',`<path d="M300 100 L380 20 L460 100z" fill="${GN}" opacity=".6"/>`+lbl(380,14,'+800 m')+`<circle cx="140" cy="170" r="10" fill="${OR}"/>`+lbl(200,175,'−15 m')],
  ['Brahmagupta (628 CE): rules for debts and fortunes.',lbl(260,210,'ṛṇa (debt, −) · dhana (fortune, +)','font-weight="700"')]]},
 seeNote:'Opposites → integers.',
 do:{title:'Pocket-money ledger',mat:'Notebook',steps:['Write a week\'s pocket money in (+) and spending (−).','Find the balance.'],obs:'Net balance.',why:'Integers.',lab:false},
 memo:'"Fortune plus, debt minus."',
 miscon:['"Negative numbers aren\'t real." They describe real situations.'],
 terms:['Profit / loss','Deposit / withdrawal','Sea level','Brahmagupta'],
 q:{q:'A diver at −15 m rises 6 m. New position:',o:['−21 m','−9 m','9 m','21 m'],a:1,why:'−15 + 6.'},
 exam:'Word problems with integers: 3 marks.'}
];

const CARDS=[['Integers','…, −2, −1, 0, 1, 2, …'],['Zero','Neither positive nor negative.'],['Opposite','−4 ↔ +4.'],['Number line','Right is greater.'],['Any negative','Less than 0 and every positive.'],['Zero pair','(+1) + (−1) = 0.'],['Adding','Positive → right; negative → left.'],['Subtracting','a − b = a + (−b).'],['Minus a minus','3 − (−2) = 5.'],['Brahmagupta','Rules for debts (−) and fortunes (+), 628 CE.']];

const Q=[
 {lv:1,q:'Which is a negative integer?',o:['0','5','−5','½'],a:2,w:'−5.'},
 {lv:1,q:'Opposite of −7:',o:['−7','7','0','1/7'],a:1,w:'+7.'},
 {lv:1,q:'Which is greater?',o:['−3','−9','equal','can\'t say'],a:0,w:'Right of −9.'},
 {lv:2,q:'(−4) + (−5) =',o:['9','−9','1','−1'],a:1,w:'Both negative.'},
 {lv:2,q:'8 + (−3) =',o:['11','5','−5','−11'],a:1,w:'Difference 5, sign +.'},
 {lv:2,q:'Increasing order:',o:['−1, −4, 0, 3','−4, −1, 0, 3','0, −1, −4, 3','3, 0, −1, −4'],a:1,w:'Left to right.'},
 {lv:3,q:'5 − 9 =',o:['4','−4','14','−14'],a:1,w:'5 + (−9).'},
 {lv:3,q:'(−2) − (−6) =',o:['−8','4','−4','8'],a:1,w:'−2 + 6.'},
 {lv:4,q:'Temperature −4 °C rises by 9 °C:',o:['−13 °C','5 °C','13 °C','−5 °C'],a:1,w:'−4 + 9.'},
 {lv:4,q:'From floor −3 to floor +4, how many floors up?',o:['1','7','−7','12'],a:1,w:'4 − (−3).'},
 {lv:5,open:true,m:3,q:'Use tokens to explain (−3) − (−5).',ans:['Start with 3 red tokens (1)','Add 2 zero pairs so there are 5 reds to take away (1)','Remove 5 reds; 2 greens left → +2 (1)']},
 {lv:5,open:true,m:3,q:'A shop: Monday profit ₹500, Tuesday loss ₹200, Wednesday loss ₹450. Net result?',ans:['500 + (−200) + (−450) (1)','= −150 (1)','Net loss of ₹150 (1)']}
];

const ONEMIN=['Integers: positives, zero, negatives.','Number line: right is greater.','Add: positive right, negative left.','Tokens: zero pairs cancel.','Subtract = add the opposite.','Real life: floors, temperature, money; Brahmagupta.'];
const KEYS=[['negative',/negative|minus|below/i],['zero',/zero/i],['number line',/number line|right|left/i],['zero pair',/zero pair|cancel/i],['subtract opposite',/opposite/i],['real life',/temperature|debt|bank|floor|sea/i]];

/* ---------- lab ---------- */
let A=3,B=-5,op='+';
function draw(){const add=op==='+'?B:-B,R=A+add;const lo=Math.min(-10,A,R),hi=Math.max(10,A,R);const NL=nline(20,440,60,-16,16,2);let s=NL.s;const X=NL.X;
 s+=`<circle cx="${X(A)}" cy="60" r="7" fill="${BL}"/>`;if(add!==0){const dir=add>0?1:-1;s+=`<path d="M${X(A)} 48 Q${(X(A)+X(R))/2} ${20} ${X(R)} 48" fill="none" stroke="${add>0?GN:OR}" stroke-width="2.5"/><path d="M${X(R)} 48 l${-dir*8} -6 M${X(R)} 48 l${-dir*3} -10" stroke="${add>0?GN:OR}" stroke-width="2.5"/>`}
 s+=`<circle cx="${X(R)}" cy="60" r="8" fill="none" stroke="${ink}" stroke-width="2.5"/>`+T(X(R),102,'= '+sg(R),'font-size="13" font-weight="700"');
 // tokens
 const row=(n,y,lab)=>{let t=T(40,y+5,lab,'font-size="12" text-anchor="start"');const g=Math.min(24,290/Math.max(1,Math.abs(n)));for(let k=0;k<Math.abs(n);k++)t+=tok(150+k*g,y,n>0);return t};
 if(op==='+'){s+=row(A,150,'Start '+sg(A))+row(B,180,'Add '+sg(B));const pairs=Math.min(Math.abs(A),Math.abs(B))*(Math.sign(A)*Math.sign(B)<0?1:0);s+=T(230,215,pairs?`${pairs} zero pair${pairs>1?'s':''} cancel`:'no zero pairs','font-size="12" fill="#888"')+row(R,250,'Result '+sg(R))}
 else{const need=Math.abs(B),have=Math.sign(A)===Math.sign(B)||B===0?Math.abs(A):0;const extra=Math.max(0,need-(Math.sign(A)===Math.sign(B)?Math.abs(A):0));
  s+=row(A,150,'Start '+sg(A));if(B!==0&&extra>0){s+=T(40,185,`add ${extra} zero pair${extra>1?'s':''}`,'font-size="12" text-anchor="start"');for(let k=0;k<extra;k++)s+=tok(150+k*48,180,1)+tok(174+k*48,180,0)}s+=T(230,215,`take away ${need} ${B>0?'green':'red'} token${need===1?'':'s'}`,'font-size="12" fill="#888"')+row(R,250,'Result '+sg(R))}
 $('#iSvg').innerHTML=s;$('#iAv').textContent=sg(A);$('#iBv').textContent=sg(B);
 const expr=op==='+'?`${sg(A)} + (${sg(B)})`:`${sg(A)} − (${sg(B)})`;
 $('#iOut').innerHTML=`<p><b>${expr} = ${sg(R)}</b></p>`+(op==='-'?`<p>Same as ${sg(A)} + (${sg(-B)}): subtracting is adding the opposite.</p>`:'')+`<p class="note">Green = +1, red = −1. A green and a red make a zero pair.</p>`}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('iS'))labChange(e.target)})}
function labClick(){return false}
function labChange(t){if(t.id==='iA'){A=+t.value;draw();return true}if(t.id==='iB'){B=+t.value;draw();return true}if(t.id==='iOp'){op=t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
