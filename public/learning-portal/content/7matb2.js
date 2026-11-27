/* Rai Plus content pack: Class 7 Mathematics (Ganita Prakash Part 2), Chapter 2 – Operations with Integers. */
RP.register({key:'7matb2',cls:'7',subject:'Mathematics',ch:'II-2',title:"Operations with Integers",color:'#1f5f8b',
crumb:"Class 7 Mathematics · Ganita Prakash Part 2",h1:"Part 2 · Chapter 2: Operations with Integers",sub:"Multiplying integers with patterns and the number line, sign rules, properties of multiplication, dividing integers, and real-life uses.",heroLabel:"Jumps on a number line showing 3 × (−2)",labName:'Integer jump lab',
theme:"\n:root{--g:light-dark(#1f5f8b,#8fc2e6);--g2:light-dark(#e8f1f8,#0b1622);--line:light-dark(#cde0ee,#22384b);--bg:light-dark(#ffffff,#081018);--card:light-dark(#ffffff,#0d1620);\n--ink:light-dark(#0d1d2a,#e1ecf5);--mute:light-dark(#475d70,#a7bccd);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#174a6d}\n",
labHTML:`  <h2>Integer jump lab</h2>
  <p>a × b: make |b| jumps of size a (forwards if b is positive, backwards — reversed direction — if b is negative). Watch the sign pattern table too. Then try the sign-rule quiz.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="jSvg" viewBox="0 0 460 320" role="img" aria-label="Number line jumps" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>a (jump size): <b id="jAv"></b><input type="range" class="jS" id="jA" min="-6" max="6" value="3"></label></div>
  <div class="ctrl"><label>b (number of jumps): <b id="jBv"></b><input type="range" class="jS" id="jB" min="-5" max="5" value="-2"></label></div>
  <div class="ctrl"><label>Operation<select id="jOp"><option value="mul">a × b</option><option value="div">(a × b) ÷ b = a</option></select></label></div>
  <div class="ctrl"><button class="btn" id="jQ">Quiz</button> <input id="jAns" type="number" style="width:5em"> <button class="btn" id="jC">Check</button></div>
  <div class="box y" id="jOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#1f5f8b',LABNAME='Integer jump lab',MIND_CENTER='Integers × ÷';
const BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const sg=n=>n>0?'+'+n:n<0?'−'+(-n):'0';const pa=n=>n<0?'('+sg(n)+')':sg(n);
function nl(x0,x1,y,lo,hi,step=1){const X=v=>x0+(v-lo)*(x1-x0)/(hi-lo);let s=`<line x1="${x0-6}" y1="${y}" x2="${x1+6}" y2="${y}" stroke="${ink}" stroke-width="2"/>`;for(let v=lo;v<=hi;v+=step)s+=`<line x1="${X(v)}" y1="${y-4}" x2="${X(v)}" y2="${y+4}" stroke="${ink}"/>`+((v%(step*2)===0||step>=5)?T(X(v),y+18,sg(v),'font-size="10"'):'');return {s,X}}
function jumps(X,y,start,size,n,c){let s='',p=start;for(let k=0;k<n;k++){const q=p+size;s+=`<path d="M${X(p)} ${y} Q${(X(p)+X(q))/2} ${y-28} ${X(q)} ${y}" fill="none" stroke="${c}" stroke-width="2"/><path d="M${X(q)} ${y} l${size>0?-7:7} -6" stroke="${c}" stroke-width="2"/>`;p=q}return s}
function heroDraw(){return `<line x1="20" y1="100" x2="360" y2="100" stroke="#fff" stroke-width="3"/>`+[0,1,2].map(k=>`<path d="M${190-k*50} 100 Q${165-k*50} 60 ${140-k*50} 100" fill="none" stroke="#fff" stroke-width="3"/>`).join('')}
const HERO=heroDraw;
const MIND=[['Repeated addition',100,50],['Sign patterns',420,50],['Number line',90,150],['Properties',430,150],['Division',110,250],['Real life',410,250]];

const C=[
{id:'j1',num:'2.1',title:'Multiplication as repeated addition',
 intro:'The temperature drops 3 °C every hour for 4 hours. What is the total change?',
 obj:'Multiply a negative integer by a positive integer.',
 prior:'Class 6: integers; addition and subtraction.',
 simple:'4 × (−3) = (−3) + (−3) + (−3) + (−3) = −12. Multiplying a negative number by a positive number gives a negative number. On the number line: 4 jumps of −3 starting at 0 land at −12.',
 detail:'Order doesn\'t matter: (−3) × 4 = 4 × (−3) = −12 (commutative). Real life: a loss of ₹50 a day for 6 days = 6 × (−50) = −300, a loss of ₹300.',
 real:'Leh: temperature falls 3 °C per hour after sunset; after 4 hours it is 12 °C colder.',
 apply:'Find 5 × (−7).',
 see:{w:520,h:200,f:[
  ['Start at 0.',nl(40,480,120,-14,4,1).s+`<circle cx="${nl(40,480,120,-14,4).X(0)}" cy="120" r="5" fill="${BL}"/>`],
  ['4 jumps of −3.',jumps(nl(40,480,120,-14,4).X,120,0,-3,4,OR)],
  ['4 × (−3) = −12.',`<circle cx="${nl(40,480,120,-14,4).X(-12)}" cy="120" r="6" fill="${OR}"/>`+lbl(260,180,'4 × (−3) = −12','font-size="16" font-weight="700"')]]},
 seeNote:'Positive × negative = negative.',
 do:{title:'Temperature walk',mat:'Number line on the floor',steps:['Start at 0; take 3 steps of −2.','Where do you end?'],obs:'−6.',why:'Repeated addition.',lab:true},
 memo:'"Many losses make a bigger loss."',
 miscon:['"4 × (−3) = 12." Repeated negatives stay negative.'],
 terms:['Repeated addition','Product'],
 q:{q:'6 × (−4) =',o:['24','−24','−10','2'],a:1,why:'Six −4s.'},
 exam:'Multiply integers: 1 mark.'},

{id:'j2',num:'2.2',title:'Patterns and sign rules',
 intro:'Why is (−3) × (−4) positive?',
 obj:'Discover sign rules for multiplication from patterns.',
 prior:'2.1.',
 simple:'Look at a pattern: (−3) × 3 = −9, (−3) × 2 = −6, (−3) × 1 = −3, (−3) × 0 = 0. Each step adds 3. Continue: (−3) × (−1) = 3, (−3) × (−2) = 6. So negative × negative = positive. Rules: (+)(+) = +, (+)(−) = −, (−)(+) = −, (−)(−) = +.',
 detail:'For many factors: count the negatives — an even number of negative factors gives a positive product; an odd number gives negative. (−1) × (−1) × (−1) = −1. Brahmagupta stated: "the product of two debts is a fortune".',
 real:'Reversing a loss (removing a debt) is a gain.',
 apply:'Sign of (−2) × (−3) × (−4) × (−1)?',
 see:{w:520,h:220,f:[
  ['(−3) × 3 = −9 … (−3) × 0 = 0',[3,2,1,0].map((b,k)=>lbl(140,40+k*30,`(−3) × ${b} = ${-3*b===0?0:sg(-3*b)}`,'font-size="15"')).join('')],
  ['Each step adds 3…',`<path d="M230 50 v100" stroke="${GN}" stroke-width="2"/>`+lbl(270,100,'+3 each','fill="'+GN+'" text-anchor="start"')],
  ['…so (−3) × (−1) = 3, (−3) × (−2) = 6.',[-1,-2].map((b,k)=>lbl(400,70+k*30,`(−3) × (${sg(b)}) = +${-3*b}`,'font-size="15" font-weight="700" fill="'+OR+'"')).join('')+lbl(400,180,'(−)(−) = +','font-size="18" font-weight="700"')]]},
 seeNote:'The pattern decides.',
 do:{title:'Pattern table',mat:'Notebook',steps:['Make a table of (−4) × b for b = 3 down to −3.'],obs:'Values increase by 4.',why:'Sign rule.',lab:true},
 memo:'"Same signs: +; different signs: −."',
 miscon:['"Two negatives make a bigger negative." In multiplication they make a positive.'],
 terms:['Sign rule','Even/odd number of negatives'],
 q:{q:'(−5) × (−6) =',o:['−30','30','−11','11'],a:1,why:'Same signs.'},
 exam:'Sign rules: 2 marks.'},

{id:'j3',num:'2.3',title:'Multiplication on the number line',
 intro:'How do you show (−2) × (−3) as jumps?',
 obj:'Model integer multiplication with jumps.',
 prior:'2.2.',
 simple:'a × b: a is the jump size, b is how many jumps. If b is positive, make b jumps of a. If b is negative, make |b| jumps of a and then reverse (take the opposite). (−2) × (−3): 3 jumps of −2 reach −6; reversed → +6.',
 detail:'Reversing = multiplying by −1. So a × (−b) = −(a × b). This explains why negative × negative is positive.',
 real:'Rewinding a video of a car moving backwards shows it moving forwards.',
 apply:'Model 4 × (−2) and (−4) × (−2).',
 see:{w:520,h:200,f:[
  ['3 jumps of −2: reach −6.',nl(40,480,120,-8,8,1).s+jumps(nl(40,480,120,-8,8).X,120,0,-2,3,OR)],
  ['Reverse (because b = −3).',`<path d="M${nl(40,480,120,-8,8).X(-6)} 140 Q260 190 ${nl(40,480,120,-8,8).X(6)} 140" fill="none" stroke="${GN}" stroke-dasharray="5 4" stroke-width="2"/>`],
  ['(−2) × (−3) = +6.',`<circle cx="${nl(40,480,120,-8,8).X(6)}" cy="120" r="6" fill="${GN}"/>`+lbl(260,40,'(−2) × (−3) = +6','font-size="16" font-weight="700"')]]},
 seeNote:'Negative count reverses.',
 do:{title:'Walk it',mat:'Floor number line',steps:['Model (−3) × 2 and (−3) × (−2).'],obs:'−6 and +6.',why:'Reversal.',lab:false},
 memo:'"Negative count = turn around."',
 miscon:['"Jumps can\'t be negative." Negative count means reverse.'],
 terms:['Jump size','Reverse'],
 q:{q:'(−1) × (−9) =',o:['−9','9','0','−1'],a:1,why:'Reverse of −9.'},
 exam:'Model on number line: 2 marks.'},

{id:'j4',num:'2.4',title:'Properties of multiplication',
 intro:'Is (−4) × 25 × (−3) easier in some order?',
 obj:'Use properties of multiplication for integers.',
 prior:'2.2; Part 1 Ch 2.',
 simple:'For integers: commutative a × b = b × a; associative (a × b) × c = a × (b × c); distributive a × (b + c) = a × b + a × c; a × 1 = a; a × 0 = 0; a × (−1) = −a. Use them to calculate smartly: (−4) × 25 × (−3) = (−100) × (−3) = 300.',
 detail:'Distributive with negatives: (−7) × 98 = (−7) × (100 − 2) = −700 + 14 = −686. Product of any number of integers with a zero factor is 0.',
 real:'Account statements: 12 months × (−₹150) = −₹1800.',
 apply:'Find (−25) × 37 × 4 smartly.',
 see:{w:520,h:200,f:[
  ['(−4) × 25 × (−3)',lbl(260,50,'(−4) × 25 × (−3)','font-size="20"')],
  ['= (−100) × (−3)',lbl(260,100,'= (−100) × (−3)','font-size="18"')],
  ['= 300',lbl(260,150,'= 300','font-size="22" font-weight="700"')]]},
 seeNote:'Group for easy numbers.',
 do:{title:'Smart products',mat:'Cards',steps:['Compute 5 products by grouping.'],obs:'Faster.',why:'Properties.',lab:false},
 memo:'"Swap, group, distribute — signs too."',
 miscon:['"a × 0 = a." It is 0.'],
 terms:['Commutative','Associative','Distributive','Identity (1)'],
 q:{q:'(−8) × (−125) =',o:['1000','−1000','133','−133'],a:0,why:'Same signs.'},
 exam:'Use properties: 2 marks.'},

{id:'j5',num:'2.5',title:'Dividing integers',
 intro:'−12 ÷ 3 = ? Think: 3 × ? = −12.',
 obj:'Divide integers using sign rules.',
 prior:'2.2.',
 simple:'Division is the inverse of multiplication: if a × b = c, then c ÷ b = a. Since 3 × (−4) = −12, (−12) ÷ 3 = −4. Sign rules are the same: same signs → positive; different signs → negative. (−20) ÷ (−5) = 4; 18 ÷ (−6) = −3.',
 detail:'Division by zero is not defined: no number times 0 gives a non-zero number. 0 ÷ (non-zero) = 0. Division is not commutative: 12 ÷ (−3) ≠ (−3) ÷ 12. Average change: total change ÷ time.',
 real:'A diver goes from 0 to −36 m in 6 minutes: −6 m per minute.',
 apply:'Find (−56) ÷ (−8) and 63 ÷ (−9).',
 see:{w:520,h:200,f:[
  ['3 × (−4) = −12',lbl(260,50,'3 × (−4) = −12','font-size="18"')],
  ['so (−12) ÷ 3 = −4.',lbl(260,100,'(−12) ÷ 3 = −4','font-size="18" font-weight="700"')],
  ['Same signs +, different signs −; ÷ 0 undefined.',lbl(260,160,'÷ 0 is not defined','fill="'+OR+'"')]]},
 seeNote:'Same sign rules as ×.',
 do:{title:'Inverse check',mat:'Notebook',steps:['For each division, write the matching multiplication.'],obs:'Signs agree.',why:'Inverse.',lab:false},
 memo:'"Division undoes multiplication."',
 miscon:['"(−20) ÷ (−5) = −4." Same signs give +4.'],
 terms:['Inverse','Quotient','Undefined (÷ 0)'],
 q:{q:'(−42) ÷ 7 =',o:['6','−6','−35','49'],a:1,why:'Different signs.'},
 exam:'Divide integers: 1 mark.'},

{id:'j6',num:'2.6',title:'Integers in real life',
 intro:'A shopkeeper loses ₹40 on each of 5 items but gains ₹30 on each of 8 items. Net?',
 obj:'Solve real-life problems with integer operations.',
 prior:'2.1–2.5.',
 simple:'Write gains as positive, losses as negative: 5 × (−40) + 8 × 30 = −200 + 240 = +40: a net profit of ₹40. Quiz scoring: +4 for correct, −1 for wrong: 12 correct, 5 wrong → 48 − 5 = 43.',
 detail:'Temperatures: falling 2 °C per hour from 5 °C, after 6 hours: 5 + 6 × (−2) = −7 °C. Lift: going down 3 floors per minute for 4 minutes from floor 5 → 5 + 4 × (−3) = −7 (basement 7).',
 real:'Competitive exams use negative marking: −1 for wrong answers.',
 apply:'Quiz: +3 for right, −2 for wrong. 15 right, 7 wrong. Score?',
 see:{w:520,h:200,f:[
  ['Loss ₹40 × 5 items.',lbl(140,60,'5 × (−40) = −200','font-size="16" fill="'+OR+'"')],
  ['Gain ₹30 × 8 items.',lbl(380,60,'8 × (+30) = +240','font-size="16" fill="'+GN+'"')],
  ['Net: +40 (profit).',lbl(260,130,'−200 + 240 = +40','font-size="20" font-weight="700"')]]},
 seeNote:'Gains +, losses −.',
 do:{title:'Mock quiz',mat:'10 questions, +4/−1 marking',steps:['Take the quiz.','Calculate score with integers.'],obs:'Negative marking matters.',why:'Integer arithmetic.',lab:false},
 memo:'"Write signs first, then calculate."',
 miscon:['"Losses can be ignored." They subtract.'],
 terms:['Profit/loss','Negative marking'],
 q:{q:'+4 right, −1 wrong: 10 right, 4 wrong =',o:['36','40','44','26'],a:0,why:'40 − 4.'},
 exam:'Word problems with integers: 3 marks.'}
];

const CARDS=[['Repeated addition','4 × (−3) = −12.'],['Sign rules','Same signs +; different −.'],['Many factors','Even negatives → +; odd → −.'],['Number line','Negative count reverses.'],['× (−1)','Gives the opposite.'],['Properties','Commutative, associative, distributive.'],['× 0','Always 0.'],['Division','Inverse of ×; same sign rules.'],['÷ 0','Not defined.'],['Real life','Gains +, losses −.']];

const Q=[
 {lv:1,q:'7 × (−3) =',o:['21','−21','−10','4'],a:1,w:'Different signs.'},
 {lv:1,q:'(−6) × (−5) =',o:['30','−30','−11','1'],a:0,w:'Same signs.'},
 {lv:1,q:'(−24) ÷ 4 =',o:['6','−6','−20','−96'],a:1,w:'Different signs.'},
 {lv:2,q:'(−1) × (−1) × (−1) =',o:['1','−1','3','−3'],a:1,w:'Three negatives.'},
 {lv:2,q:'0 ÷ (−7) =',o:['−7','0','undefined','7'],a:1,w:'Zero.'},
 {lv:2,q:'(−36) ÷ (−9) =',o:['4','−4','−45','27'],a:0,w:'Same signs.'},
 {lv:3,q:'(−4) × 25 × (−7) =',o:['700','−700','−28','28'],a:0,w:'(−100)(−7).'},
 {lv:3,q:'(−9) × 99 =',o:['−891','891','−900','−909'],a:0,w:'−900 + 9.'},
 {lv:4,q:'Temperature 4 °C falls 3 °C per hour for 5 hours:',o:['−11 °C','19 °C','−15 °C','11 °C'],a:0,w:'4 − 15.'},
 {lv:4,q:'Which is undefined?',o:['0 ÷ 5','5 ÷ 0','0 × 5','−5 ÷ −5'],a:1,w:'÷ 0.'},
 {lv:5,open:true,m:3,q:'Use a pattern to show that (−4) × (−2) = 8.',ans:['(−4) × 2 = −8, (−4) × 1 = −4, (−4) × 0 = 0 (1)','Each step increases by 4 (1)','So (−4) × (−1) = 4, (−4) × (−2) = 8 (1)']},
 {lv:5,open:true,m:3,q:'Quiz: +5 correct, −2 wrong, 0 unanswered. Riya: 14 correct, 4 wrong, 2 unanswered. Score?',ans:['14 × 5 = 70 (1)','4 × (−2) = −8 (1)','Score = 62 (1)']}
];

const ONEMIN=['Repeated addition: 4 × (−3) = −12.','Pattern: (−)(−) = +.','Number line: negative count reverses.','Properties of ×.','Division: same sign rules; ÷ 0 undefined.','Real life: profit/loss, scores, temperature.'];
const KEYS=[['sign rules',/sign|same|different/i],['negative × negative',/negative.*positive|\(−\)\(−\)/i],['number line',/number line|jump|revers/i],['properties',/commutat|associat|distribut/i],['division',/divis|÷/i],['zero',/zero|undefined/i]];

/* ---------- lab ---------- */
let a=3,b=-2,op='mul',quiz=null;
function draw(){const P=a*b;const lo=-30,hi=30;const N=nl(20,440,150,lo,hi,5);let s=N.s;const X=N.X;
 const n=Math.abs(b);s+=jumps(X,150,0,a,n,b>=0?GN:OR);const end=a*n;
 if(b<0)s+=`<path d="M${X(end)} 170 Q${(X(end)+X(-end))/2} 230 ${X(-end)} 170" fill="none" stroke="${PU}" stroke-dasharray="5 4" stroke-width="2"/>`+T((X(end)+X(-end))/2,240,'reverse (b is negative)','font-size="11" fill="'+PU+'"');
 s+=`<circle cx="${X(P)}" cy="150" r="7" fill="${b<0?PU:GN}"/>`+T(X(P),125,sg(P),'font-size="13" font-weight="700"');
 // pattern table
 let t='';for(let k=3;k>=-3;k--){const y=20+(3-k)*14;}
 const row=[3,2,1,0,-1,-2,-3].map(k=>`${sg(a)} × ${pa(k)} = ${sg(a*k)}`);s+=T(230,30,op==='mul'?`${sg(a)} × ${pa(b)} = ${sg(P)}`:`${sg(P)} ÷ ${pa(b)} = ${b===0?'undefined':sg(a)}`,'font-size="18" font-weight="700"');
 s+=row.map((r,k)=>T(110+(k%4)*110,270+Math.floor(k/4)*20,r,`font-size="11" fill="${[3,2,1,0,-1,-2,-3][k]===b?OR:'#888'}"`)).join('');
 $('#jSvg').innerHTML=s;$('#jAv').textContent=sg(a);$('#jBv').textContent=sg(b);
 let m=op==='mul'?`<p>${n} jump${n===1?'':'s'} of ${sg(a)}${b<0?', then reverse':''}: <b>${sg(a)} × ${pa(b)} = ${sg(P)}</b>.</p><p>${a===0||b===0?'Anything × 0 = 0.':(a<0)===(b<0)?'Same signs → positive.':'Different signs → negative.'}</p>`:(b===0?'<p class="fb no">Division by 0 is not defined.</p>':`<p>Since ${sg(a)} × ${pa(b)} = ${sg(P)}, we get <b>${sg(P)} ÷ ${pa(b)} = ${sg(a)}</b>.</p>`);
 $('#jOut').innerHTML=m}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('jS'))labChange(e.target)})}
function labClick(bt){if(bt.id==='jQ'){const x=Math.floor(Math.random()*19)-9||-4,y=Math.floor(Math.random()*13)-6||3;const t=Math.random()<.5;quiz=t?{q:`${pa(x)} × ${pa(y)}`,a:x*y}:{q:`${pa(x*y)} ÷ ${pa(y)}`,a:x};$('#jOut').innerHTML=`<p><b>Quiz:</b> ${quiz.q} = ?</p>`;return true}
 if(bt.id==='jC'){if(!quiz){$('#jOut').innerHTML='<p>Press Quiz first.</p>';return true}const g=+$('#jAns').value;$('#jOut').innerHTML=g===quiz.a?`<p class="fb ok">Correct: ${quiz.q} = ${sg(quiz.a)}.</p>`:`<p class="fb no">Not quite: ${quiz.q} = ${sg(quiz.a)}. Check the sign rule.</p>`;quiz=null;return true}return false}
function labChange(t){if(t.id==='jA')a=+t.value;else if(t.id==='jB')b=+t.value;else if(t.id==='jOp')op=t.value;else return false;draw();return true}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
