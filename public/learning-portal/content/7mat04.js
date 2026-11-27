/* Rai Plus content pack: Class 7 Mathematics (Ganita Prakash), Chapter 4 – Expressions using Letter-Numbers. */
RP.register({key:'7mat04',cls:'7',subject:'Mathematics',ch:'4',title:"Expressions using Letter-Numbers",color:'#b04a1f',
crumb:"Class 7 Mathematics · Ganita Prakash",h1:"Chapter 4: Expressions using Letter-Numbers",sub:"Letters standing for numbers, formulas, writing and evaluating expressions, like terms, and patterns described with letter-numbers.",heroLabel:"A row of matchstick squares with the rule 3n + 1",labName:'Pattern & expression lab',
theme:"\n:root{--g:light-dark(#b04a1f,#f2a77f);--g2:light-dark(#fbefe9,#21110a);--line:light-dark(#f0d6c9,#4a2a1c);--bg:light-dark(#ffffff,#130a06);--card:light-dark(#ffffff,#1b0f09);\n--ink:light-dark(#24120a,#f6e7df);--mute:light-dark(#6e5043,#cfb1a3);--y:light-dark(#1f5f8b,#8fc2e6);--y2:light-dark(#e6f0f8,#0c1a26);--hd:#8a3612}\n",
labHTML:`  <h2>Pattern & expression lab</h2>
  <p>Choose a matchstick pattern and grow it. Count the sticks, fill the table, and find the rule as a letter-number expression. Check your rule!</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="mSvg" viewBox="0 0 460 300" role="img" aria-label="Matchstick pattern" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Pattern<select id="mP"><option value="sq">Row of squares</option><option value="tri">Row of triangles</option><option value="L">Letter L</option><option value="C">Letter C</option><option value="hex">Row of hexagons</option></select></label></div>
  <div class="ctrl"><label>Step n: <b id="mNv"></b><input type="range" id="mN" class="mS" min="1" max="8" value="3"></label></div>
  <div class="ctrl"><label>Your rule (use n), e.g. 3n + 1<input id="mRule" type="text" style="width:8em" placeholder="?"></label><button class="btn" id="mCheck">Check rule</button> <button class="btn" id="mReveal">Show rule</button></div>
  <div class="box y" id="mOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#b04a1f',LABNAME='Pattern & expression lab',MIND_CENTER='Letter-numbers';
const OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const stick=(x1,y1,x2,y2,c='#c8902a')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="5" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="3.5" fill="${OR}"/>`;
function sq(x0,y0,n,u=30){let s=stick(x0,y0,x0,y0+u);for(let i=0;i<n;i++){const x=x0+i*u;s+=stick(x,y0,x+u,y0)+stick(x,y0+u,x+u,y0+u)+stick(x+u,y0,x+u,y0+u)}return s}
function heroDraw(){return sq(40,40,4,40).replace(/#c8902a|#b04a1f/g,'#fff')}
const HERO=heroDraw;
const MIND=[['Letter-numbers',100,50],['Formulas',420,50],['Writing expressions',90,150],['Evaluating',430,150],['Like terms',110,250],['Patterns',410,250]];

const C=[
{id:'l1',num:'4.1',title:'Letters for numbers',
 intro:'Aftab is 3 years older than his sister Shabnam. If Shabnam is 10, Aftab is 13. What if Shabnam\'s age is unknown?',
 obj:'Use a letter to stand for an unknown or changing number.',
 prior:'Ch 2: arithmetic expressions.',
 simple:'A letter can stand for a number we don\'t know or that can change. If Shabnam\'s age is a years, Aftab\'s age is a + 3. We call such letters letter-numbers (variables). a + 3 is an algebraic expression: it gives Aftab\'s age for any value of a.',
 detail:'We usually write 4 × s as 4s and 1 × p as p. The letter can be any — x, y, n, a — it only names the number. "a + 3" stays true every year: when Shabnam is 25, Aftab is 28.',
 real:'Auto fare: ₹30 + ₹15 per km → 30 + 15k for k kilometres.',
 apply:'Rahul has p pencils; Neha has 5 more. Write Neha\'s pencils.',
 see:{w:520,h:200,f:[
  ['Shabnam is a years old.',lbl(130,70,'Shabnam: a','font-size="18"')],
  ['Aftab is 3 years older.',lbl(390,70,'Aftab: a + 3','font-size="18" font-weight="700"')],
  ['Works for any a.',lbl(260,140,'a = 10 → 13 · a = 25 → 28')]]},
 seeNote:'A letter = a number that can vary.',
 do:{title:'Age table',mat:'Notebook',steps:['Make a table of your age and a sibling\'s for 5 years.','Write a rule using a letter.'],obs:'Difference stays same.',why:'Letter-number expression.',lab:false},
 memo:'"Letter = any number."',
 miscon:['"a + 3 means a3." It means 3 more than a.'],
 terms:['Letter-number (variable)','Expression','Unknown'],
 q:{q:'Meera has m marbles; Ravi has 4 fewer. Ravi has:',o:['m + 4','4 − m','m − 4','4m'],a:2,why:'Fewer → subtract.'},
 exam:'Write expressions for situations: 2 marks.'},

{id:'l2',num:'4.2',title:'Formulas',
 intro:'How do you find the perimeter of any square without drawing it?',
 obj:'Write and use formulas with letter-numbers.',
 prior:'Class 6: perimeter and area.',
 simple:'A formula is a rule written with letters. Perimeter of a square with side s: P = 4s. Perimeter of a rectangle: P = 2(l + b). Area of a rectangle: A = l × b = lb. To use a formula, replace the letters by numbers: s = 7 → P = 4 × 7 = 28.',
 detail:'Other formulas: distance = speed × time (d = st); total cost = rate × quantity. Formulas save time and show the relation between quantities clearly.',
 real:'Tailors calculate cloth needed using length × breadth formulas.',
 apply:'Use A = lb to find the area of a 12 m by 8 m field.',
 see:{w:520,h:200,f:[
  ['Square of side s.',`<rect x="80" y="40" width="100" height="100" fill="none" stroke="${OR}" stroke-width="3"/>`+lbl(130,32,'s')],
  ['P = 4s',lbl(130,175,'P = 4s','font-size="18" font-weight="700"')],
  ['Rectangle: P = 2(l + b), A = lb.',`<rect x="300" y="50" width="160" height="80" fill="none" stroke="${BL}" stroke-width="3"/>`+lbl(380,42,'l')+lbl(472,95,'b','text-anchor="start"')+lbl(380,175,'P = 2(l + b) · A = lb','font-weight="700"')]]},
 seeNote:'Formulas work for every size.',
 do:{title:'Formula hunt',mat:'Textbook',steps:['List 3 formulas from science or maths.','Use each once with numbers.'],obs:'Quick answers.',why:'Formulas.',lab:false},
 memo:'"Formula: letters in, numbers out."',
 miscon:['"4s means 4 + s." It means 4 × s.'],
 terms:['Formula','Perimeter','Area'],
 q:{q:'P = 4s; s = 9 cm. P =',o:['13 cm','36 cm','49 cm','94 cm'],a:1,why:'4 × 9.'},
 exam:'Use a formula: 1 mark.'},

{id:'l3',num:'4.3',title:'Writing expressions from situations',
 intro:'Notebooks cost ₹45 each. How much for n notebooks? And with ₹20 off?',
 obj:'Translate word statements into expressions.',
 prior:'4.1.',
 simple:'Key words: "more than" → +; "less than/fewer" → −; "times/each" → ×; "shared equally" → ÷. Cost of n notebooks at ₹45 each: 45n. With ₹20 off: 45n − 20. "5 less than twice a number x": 2x − 5. "Sum of a and b divided by 2": (a + b) ÷ 2.',
 detail:'Order matters with − and ÷: "7 less than y" = y − 7, not 7 − y. Use brackets when a whole group is multiplied: "3 times the sum of x and 4" = 3(x + 4).',
 real:'Mobile plan: ₹199 + ₹2 per extra GB → 199 + 2g.',
 apply:'Write: "4 more than 3 times m".',
 see:{w:520,h:200,f:[
  ['n notebooks at ₹45 each.',lbl(260,60,'45 × n = 45n','font-size="18"')],
  ['₹20 off the total.',lbl(260,105,'45n − 20','font-size="18" font-weight="700"')],
  ['"7 less than y" = y − 7, not 7 − y.',lbl(260,160,'"7 less than y" → y − 7','fill="'+OR+'"')]]},
 seeNote:'Words → symbols carefully.',
 do:{title:'Story to expression',mat:'Cards with stories',steps:['Write an expression for each story.','Swap with a partner to check.'],obs:'Different letters, same structure.',why:'Translation.',lab:true},
 memo:'"Less than: subtract from the thing after."',
 miscon:['"5 less than x = 5 − x." It is x − 5.'],
 terms:['Translate','Sum','Difference','Product','Quotient'],
 q:{q:'"3 times the sum of x and 2":',o:['3x + 2','3(x + 2)','x + 6','3 + x + 2'],a:1,why:'Whole sum × 3.'},
 exam:'Word statements to expressions: 2 marks.'},

{id:'l4',num:'4.4',title:'Evaluating expressions',
 intro:'If x = 4, what is 3x + 5?',
 obj:'Find the value of an expression for given values of the letters.',
 prior:'4.3; Ch 2 (terms).',
 simple:'Replace each letter with its value and calculate, keeping the order (terms first, then add). 3x + 5 at x = 4: 3 × 4 + 5 = 17. 2(a + b) at a = 3, b = 7: 2 × 10 = 20. Different values give different results — that is why it is an expression, not a single number.',
 detail:'Making a table of values helps see patterns: x = 1, 2, 3, 4 → 3x + 5 = 8, 11, 14, 17 (increases by 3 each time). Be careful with negatives: if x = −2, 3x + 5 = −6 + 5 = −1.',
 real:'Auto fare 30 + 15k: for k = 6 km, fare = ₹120.',
 apply:'Find 5y − 2 when y = 6.',
 see:{w:520,h:200,f:[
  ['3x + 5 with x = 4',lbl(260,50,'3x + 5,  x = 4','font-size="18"')],
  ['= 3 × 4 + 5',lbl(260,100,'= 3 × 4 + 5','font-size="18"')],
  ['= 17',lbl(260,150,'= 17','font-size="22" font-weight="700"')]]},
 seeNote:'Substitute, then calculate.',
 do:{title:'Value table',mat:'Notebook',steps:['Make a table of 2n + 1 for n = 1 to 6.'],obs:'3, 5, 7, 9, 11, 13 — odd numbers!',why:'Evaluation.',lab:true},
 memo:'"Swap letter for number, then solve."',
 miscon:['"3x at x = 4 is 34." It is 3 × 4 = 12.'],
 terms:['Substitute','Evaluate','Value'],
 q:{q:'Value of 2a + 3b at a = 5, b = 2:',o:['16','13','10','25'],a:0,why:'10 + 6.'},
 exam:'Evaluate expressions: 2 marks.'},

{id:'l5',num:'4.5',title:'Like terms and simplifying',
 intro:'3 pencils + 5 pencils = 8 pencils. Is 3p + 5p = 8p?',
 obj:'Combine like terms to simplify expressions.',
 prior:'4.4; Ch 2 (distributive property).',
 simple:'Like terms have the same letter part: 3p and 5p are like terms; 3p and 5q are not. Add or subtract like terms by adding their numbers (coefficients): 3p + 5p = 8p; 7x − 2x = 5x. Unlike terms stay separate: 4a + 3b cannot be simplified.',
 detail:'This is the distributive property: 3p + 5p = (3 + 5)p. Simplify: 5x + 3y − 2x + y = 3x + 4y. Brackets: 2(x + 3) + 4x = 2x + 6 + 4x = 6x + 6.',
 real:'Shopping list: 3 kg rice + 2 kg dal + 1 kg rice = 4 kg rice + 2 kg dal.',
 apply:'Simplify 6m + 2n − 4m + 5n.',
 see:{w:520,h:200,f:[
  ['5x + 3y − 2x + y',lbl(260,50,'5x + 3y − 2x + y','font-size="18"')],
  ['Group like terms.',lbl(260,100,'(5x − 2x) + (3y + y)','font-size="18"')+`<rect x="150" y="80" width="100" height="28" rx="14" fill="${OR}" opacity=".15"/><rect x="270" y="80" width="100" height="28" rx="14" fill="${BL}" opacity=".15"/>`],
  ['= 3x + 4y',lbl(260,150,'= 3x + 4y','font-size="22" font-weight="700"')]]},
 seeNote:'Only like terms combine.',
 do:{title:'Sort the terms',mat:'Term cards',steps:['Sort cards into like-term groups.','Combine each group.'],obs:'Simplified expression.',why:'Like terms.',lab:false},
 memo:'"Same letters join; different stay apart."',
 miscon:['"3a + 2b = 5ab." Unlike terms don\'t combine.'],
 terms:['Like terms','Unlike terms','Coefficient','Simplify'],
 q:{q:'Simplify 7k − 3k + 2:',o:['6k','4k + 2','10k + 2','4'],a:1,why:'Combine k terms.'},
 exam:'Simplify expressions: 2 marks.'},

{id:'l6',num:'4.6',title:'Patterns and expressions',
 intro:'How many matchsticks for a row of 50 squares? Do you need to build it?',
 obj:'Describe growing patterns with letter-number expressions.',
 prior:'4.4; Class 6 Ch 1 (patterns).',
 simple:'Row of squares: 1 square needs 4 sticks; each new square adds 3. So n squares need 3n + 1 sticks. For 50 squares: 3 × 50 + 1 = 151. Row of triangles: 2n + 1. Letter L of step n: 2n sticks. A table of values helps find the rule.',
 detail:'Calendar trick: in any 2 × 2 block of dates with top-left a, the dates are a, a + 1, a + 7, a + 8; diagonal sums are equal: a + (a + 8) = (a + 1) + (a + 7) = 2a + 8. Letter-numbers help prove such patterns for every case.',
 real:'Fence posts: n panels need n + 1 posts.',
 apply:'How many sticks for 20 triangles in a row (2n + 1)?',
 see:{w:520,h:200,f:[
  ['1 square: 4 sticks.',sq(40,60,1,40)],
  ['Each new square adds 3.',sq(150,60,3,40)],
  ['n squares: 3n + 1.',lbl(390,85,'3n + 1','font-size="22" font-weight="700" text-anchor="start"')+lbl(260,170,'n = 50 → 151 sticks')]]},
 seeNote:'Find what is added each step.',
 do:{title:'Build and count',mat:'Matchsticks',steps:['Build 1, 2, 3, 4 triangles in a row.','Count sticks; find the rule.'],obs:'3, 5, 7, 9 → 2n + 1.',why:'Pattern rule.',lab:true},
 memo:'"Start + adds × n."',
 miscon:['"4 squares need 16 sticks." Shared sticks: 13.'],
 terms:['Pattern','Rule','Step number n'],
 q:{q:'Sticks for 10 squares in a row (3n + 1):',o:['30','31','40','34'],a:1,why:'31.'},
 exam:'Find the rule of a pattern: 3 marks.'}
];

const CARDS=[['Letter-number','Letter that stands for a number.'],['Expression','e.g. a + 3, 45n − 20.'],['4s','Means 4 × s.'],['Formula','P = 4s, A = lb, d = st.'],['Translate','"7 less than y" = y − 7.'],['Evaluate','Substitute, then calculate.'],['Like terms','Same letter part: 3p, 5p.'],['Simplify','5x + 3y − 2x + y = 3x + 4y.'],['Squares pattern','3n + 1 sticks.'],['Calendar 2×2','Diagonal sums equal: 2a + 8.']];

const Q=[
 {lv:1,q:'"5 more than x":',o:['5x','x + 5','x − 5','5 − x'],a:1,w:'Add.'},
 {lv:1,q:'7 × y is written:',o:['y7','7y','7 + y','y + 7'],a:1,w:'Coefficient first.'},
 {lv:1,q:'Like terms:',o:['3a, 3b','2x, 5x','4m, 4','p, q'],a:1,w:'Same letter.'},
 {lv:2,q:'Value of 4n − 3 at n = 5:',o:['17','23','12','2'],a:0,w:'20 − 3.'},
 {lv:2,q:'Simplify 9a − 4a + a:',o:['5a','6a','4a','14a'],a:1,w:'9−4+1.'},
 {lv:2,q:'Cost of k pens at ₹12 each:',o:['12 + k','12k','k − 12','12/k'],a:1,w:'Rate × quantity.'},
 {lv:3,q:'"Twice the sum of m and 3":',o:['2m + 3','2(m + 3)','m + 6','2 + m + 3'],a:1,w:'Brackets.'},
 {lv:3,q:'Simplify 2(x + 4) + 3x:',o:['5x + 4','5x + 8','6x + 8','2x + 7'],a:1,w:'2x + 8 + 3x.'},
 {lv:4,q:'Row of triangles needs 2n + 1 sticks. For 25 triangles:',o:['50','51','52','27'],a:1,w:'2×25+1.'},
 {lv:4,q:'Dates a, a+1, a+7, a+8 in a 2×2 calendar block. Sum of all four:',o:['4a + 16','4a + 8','2a + 8','4a'],a:0,w:'Add all.'},
 {lv:5,open:true,m:3,q:'A taxi charges ₹50 fixed plus ₹18 per km. Write an expression and find the fare for 12 km.',ans:['Fare = 50 + 18k (1)','k = 12: 50 + 216 (1)','= ₹266 (1)']},
 {lv:5,open:true,m:3,q:'Find the rule for the number of sticks in the letter L pattern (step 1: 2 sticks, step 2: 4, step 3: 6) and use it for step 15.',ans:['Increases by 2 each step (1)','Rule: 2n (1)','Step 15: 30 sticks (1)']}
];

const ONEMIN=['Letters stand for numbers.','Formulas: P = 4s, A = lb.','Words → expressions carefully.','Evaluate by substituting.','Combine like terms only.','Patterns: 3n + 1, 2n + 1, 2n.'];
const KEYS=[['letter-number',/letter|variable/i],['formula',/formula/i],['expression',/expression/i],['evaluate',/evaluat|substitut/i],['like terms',/like term|simplif/i],['pattern',/pattern|3n/i]];

/* ---------- lab ---------- */
const PAT={sq:{n:'Row of squares',f:n=>3*n+1,r:'3n + 1'},tri:{n:'Row of triangles',f:n=>2*n+1,r:'2n + 1'},L:{n:'Letter L',f:n=>2*n,r:'2n'},C:{n:'Letter C',f:n=>3*n,r:'3n'},hex:{n:'Row of hexagons',f:n=>5*n+1,r:'5n + 1'}};
let p='sq',n=3;
function drawPat(){let s='';const u=(p==='L'||p==='C')?Math.min(40,150/n):Math.min(40,300/(n+1));const x0=30,y0=40;
 if(p==='sq')s=sq(x0,y0,n,u);
 if(p==='tri'){const h=u*0.87;for(let i=0;i<n;i++){const bx=x0+Math.floor(i/2)*u;if(i%2===0){if(i===0)s+=stick(bx,y0+h,bx+u/2,y0);s+=stick(bx+u/2,y0,bx+u,y0+h)+stick(bx,y0+h,bx+u,y0+h)}else{s+=stick(bx+u/2,y0,bx+u*1.5,y0)+stick(bx+u*1.5,y0,bx+u,y0+h)}}}
 if(p==='L'){for(let i=0;i<n;i++){s+=stick(x0,y0+i*u,x0,y0+(i+1)*u)+stick(x0+i*u,y0+n*u,x0+(i+1)*u,y0+n*u)}}
 if(p==='C'){for(let i=0;i<n;i++){s+=stick(x0+i*u,y0,x0+(i+1)*u,y0)+stick(x0,y0+i*u,x0,y0+(i+1)*u)+stick(x0+i*u,y0+n*u,x0+(i+1)*u,y0+n*u)}}
 if(p==='hex'){const R=u*0.6,dx=R*Math.sqrt(3);for(let i=0;i<n;i++){const cx=x0+dx/2+i*dx,cy=y0+R;const V=[...Array(6)].map((_,k)=>{const a=-Math.PI/2+k*Math.PI/3;return [cx+R*Math.cos(a),cy+R*Math.sin(a)]});for(let k=0;k<6;k++){if(i>0&&k===4)continue;const a=V[k],b=V[(k+1)%6];s+=stick(a[0].toFixed(1),a[1].toFixed(1),b[0].toFixed(1),b[1].toFixed(1))}}}
 // table
 let t='';for(let k=1;k<=6;k++){t+=`<rect x="${30+(k-1)*66}" y="200" width="64" height="26" fill="${k===n?'#fde8c8':'none'}" stroke="${GR}" stroke-width=".5"/>`+T(62+(k-1)*66,218,'n = '+k,'font-size="12"')+`<rect x="${30+(k-1)*66}" y="226" width="64" height="26" fill="${k===n?'#fde8c8':'none'}" stroke="${GR}" stroke-width=".5"/>`+T(62+(k-1)*66,244,String(PAT[p].f(k)),'font-size="13" font-weight="700"')}
 s+=t+T(230,280,`${PAT[p].n}, step ${n}: ${PAT[p].f(n)} sticks`,'font-size="14" font-weight="700"');$('#mSvg').innerHTML=s;$('#mNv').textContent=n}
function parseRule(r){const e=r.replace(/\s/g,'').replace(/(\d)n/g,'$1*n').replace(/^n/,'1*n').replace(/([+\-])n/g,'$11*n');if(!/^[0-9n+\-*().]+$/.test(e))return null;try{return Function('n','"use strict";return ('+e+')')}catch(x){return null}}
function labShow(){drawPat();$('#mOut').innerHTML='<p>Grow the pattern. What is added each step? Type your rule.</p>'}
function labInit(){}
function labClick(b){if(b.id==='mCheck'){const f=parseRule($('#mRule').value);if(!f){$('#mOut').innerHTML='<p class="fb no">Write a rule like 3n + 1.</p>';return true}let ok=true;try{for(let k=1;k<=10;k++)if(f(k)!==PAT[p].f(k))ok=false}catch(x){ok=false}
  $('#mOut').innerHTML=ok?`<p class="fb ok">Correct! ${PAT[p].r}. For step 50: ${PAT[p].f(50)} sticks — no need to build it!</p>`:`<p class="fb no">Not quite: your rule gives ${(()=>{try{return f(n)}catch(x){return '?'}})()} for step ${n}, but there are ${PAT[p].f(n)}. Look at how many sticks are added each step.</p>`;return true}
 if(b.id==='mReveal'){$('#mOut').innerHTML=`<p>Rule: <b>${PAT[p].r}</b>. Each step adds ${PAT[p].f(2)-PAT[p].f(1)} sticks${PAT[p].f(1)-(PAT[p].f(2)-PAT[p].f(1))?`, plus ${PAT[p].f(1)-(PAT[p].f(2)-PAT[p].f(1))} to start`:''}.</p>`;return true}return false}
let wired=false;
function labChange(t){if(t.id==='mP'){p=t.value;drawPat();$('#mOut').innerHTML='<p>New pattern! Find its rule.</p>';return true}if(t.id==='mN'){n=+t.value;drawPat();return true}return false}
const labInit2=function(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='mN')labChange(e.target)})};

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit2,show:labShow,click:labClick,change:labChange}};
}});
