/* Rai Plus content pack: Class 9 Mathematics, Chapter 1 – Number Systems (rationalised NCERT). */
RP.register({key:'9mat01',cls:'9',subject:'Mathematics',ch:'1',title:"Number Systems",color:'#3f4fa0',
crumb:"HBSE Class 9 Mathematics · Unit: Number Systems · Taught in April",h1:"Chapter 1: Number Systems",sub:"Rational and irrational numbers, real numbers and their decimal expansions, converting recurring decimals to fractions, operations and rationalising, and laws of exponents.",heroLabel:"The square-root spiral",labName:'Decimal & root lab',
theme:"\n:root{--g:light-dark(#3f4fa0,#aab4f0);--g2:light-dark(#eef0fb,#0d1024);--line:light-dark(#d6daf2,#262b4d);--bg:light-dark(#ffffff,#0a0c18);--card:light-dark(#ffffff,#10132a);\n--ink:light-dark(#141838,#e6e8f8);--mute:light-dark(#4d5378,#b3b8d8);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#2c3880}\n",
labHTML:`  <h2>Decimal &amp; root lab</h2>
  <p><b>Decimal expander:</b> divide p by q step by step. Watch the remainders: when one repeats, the digits start repeating. The prime factors of q predict the result. <b>Square-root spiral:</b> build √2, √3, √4 … with right triangles of side 1.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="nsSvg" viewBox="0 0 520 340" role="img" aria-label="Number systems lab" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="nsM"><option value="d">Decimal expander</option><option value="s">Square-root spiral</option></select></label></div>
  <div id="nsD"><div class="ctrl"><label><span>p: <b id="nsPv"></b></span><input type="range" class="nsS" id="nsP" min="1" max="30" value="1"></label></div>
  <div class="ctrl"><label><span>q: <b id="nsQv"></b></span><input type="range" class="nsS" id="nsQ" min="2" max="40" value="7"></label></div></div>
  <div id="nsSp" style="display:none"><div class="ctrl"><label><span>Build up to √<b id="nsNv"></b></span><input type="range" class="nsS" id="nsN" min="2" max="17" value="5"></label></div></div>
  <div class="box y" id="nsOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3f4fa0',LABNAME='Decimal & root lab',MIND_CENTER='Real numbers';
const IN='#3f4fa0',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',RD='#c0392b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="${c}" fill-opacity=".12" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+(sub?18:h/2+5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+34,sub,'font-size="11"'):'');
function spiral(n,cx,cy,u){let s='',x=cx+u,y=cy,ang=0;s+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${IN}" stroke-width="2"/>`;
 for(let k=2;k<=n;k++){const r=Math.sqrt(k-1);const a=Math.atan2(y-cy,x-cx);const nx=x+u*Math.cos(a-Math.PI/2),ny=y+u*Math.sin(a-Math.PI/2);
  s+=`<polygon points="${cx},${cy} ${x},${y} ${nx},${ny}" fill="${k%2?IN:OR}" fill-opacity=".1" stroke="${GR}" stroke-width="1"/><line x1="${x}" y1="${y}" x2="${nx}" y2="${ny}" stroke="${GR}" stroke-width="2"/><line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="${k%2?IN:OR}" stroke-width="2.5"/>`;
  const mx=cx+(nx-cx)*.62,my=cy+(ny-cy)*.62;s+=T(mx,my+4,'√'+k,'font-size="11" font-weight="700"');x=nx;y=ny}
 return s+`<circle cx="${cx}" cy="${cy}" r="3" fill="${ink}"/>`}
function heroDraw(){let s='',cx=170,cy=80,x=cx+18,y=cy;for(let k=2;k<=12;k++){const a=Math.atan2(y-cy,x-cx);const nx=x+18*Math.cos(a-Math.PI/2),ny=y+18*Math.sin(a-Math.PI/2);s+=`<line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="#fff" stroke-width="1.5" opacity=".8"/><line x1="${x}" y1="${y}" x2="${nx}" y2="${ny}" stroke="#fff" stroke-width="2"/>`;x=nx;y=ny}return s}
const HERO=heroDraw;
const MIND=[['Rational numbers',100,50],['Irrational numbers',420,50],['Decimal expansions',90,150],['Recurring → p/q',430,150],['Operations & rationalising',110,250],['Laws of exponents',410,250]];

const C=[
{id:'n1',num:'1.1',title:'Rational numbers',
 intro:'Is there a number between 1/2 and 1/3? How many?',
 obj:'Classify numbers and find rational numbers between two given numbers.',
 prior:'Natural numbers, whole numbers, integers, fractions.',
 simple:'Natural numbers N = {1, 2, 3, …}; whole numbers W = {0, 1, 2, …}; integers Z = {…, −2, −1, 0, 1, 2, …}. A rational number can be written as p/q, where p and q are integers and q ≠ 0 (Q). Every integer is rational (5 = 5/1). Each rational number has many equivalent forms (1/2 = 2/4 = 10/20); its simplest form has p and q with no common factor.',
 detail:'Between any two rational numbers there are infinitely many rational numbers. Method 1: average them — (a + b)/2 lies between a and b. Method 2: write them with a large common denominator. Between 3/5 and 4/5: write as 30/50 and 40/50 → 31/50, 32/50, …, 39/50.',
 real:'A scale reading like 2.35 cm is a rational number: 235/100.',
 apply:'Find five rational numbers between 3/5 and 4/5.',
 see:{w:520,h:220,f:[
  ['N inside W.',`<ellipse cx="260" cy="110" rx="80" ry="40" fill="${IN}" fill-opacity=".12" stroke="${IN}" stroke-width="2"/>`+lbl(260,115,'N','font-weight="700"')],
  ['W inside Z.',`<ellipse cx="260" cy="110" rx="140" ry="65" fill="none" stroke="${GN}" stroke-width="2"/>`+lbl(370,110,'W, Z','fill="'+GN+'"')],
  ['Z inside Q.',`<ellipse cx="260" cy="110" rx="220" ry="95" fill="none" stroke="${OR}" stroke-width="2"/>`+lbl(450,110,'Q','fill="'+OR+'" font-weight="700"')+lbl(260,212,'N ⊂ W ⊂ Z ⊂ Q')]]},
 seeNote:'Each set sits inside the next.',
 do:{title:'Fill the gap',mat:'Number line on paper',steps:['Mark 1/2 and 1/3.','Find their average; then the average of that with 1/3; keep going.'],obs:'There is always another number.',why:'Q is dense.',lab:false},
 memo:'"p over q, q not zero."',
 miscon:['"There are no numbers between two close fractions." There are infinitely many.'],
 terms:['Natural numbers','Whole numbers','Integers','Rational numbers (p/q)'],
 q:{q:'Which is NOT rational?',o:['−7','0.25','√2','2/9'],a:2,why:'√2 cannot be written as p/q.'},
 exam:'Classify; find rationals between: 1–2 marks.'},

{id:'n2',num:'1.2',title:'Irrational numbers',
 intro:'The diagonal of a square of side 1 has length √2. Can you write √2 as a fraction?',
 obj:'Recognise irrational numbers and locate √2 geometrically.',
 prior:'1.1; Baudhayana–Pythagoras theorem.',
 simple:'A number that cannot be written in the form p/q (p, q integers, q ≠ 0) is irrational. Examples: √2, √3, √5, π, 0.10110111011110… All rational and irrational numbers together make the real numbers R. Every real number corresponds to a unique point on the number line, and every point on the line is a real number.',
 detail:'The Pythagoreans (around 400 BCE) discovered that √2 is irrational. To show √2 on the number line: draw a unit square on [0, 1]; its diagonal is √2; with compass at 0, mark it on the line. Repeating this with right triangles of side 1 gives √3, √4, √5, … — the square-root spiral. Note: 22/7 is only an approximation of π, which is irrational.',
 real:'A4 paper uses the ratio √2 : 1, so folding it in half keeps the same shape.',
 apply:'Draw √5 on the number line using a right triangle with legs 2 and 1.',
 see:{w:520,h:230,f:[
  ['A unit square on the number line.',`<line x1="40" y1="190" x2="480" y2="190" stroke="${ink}"/>`+[0,1,2].map(k=>`<line x1="${100+k*150}" y1="185" x2="${100+k*150}" y2="195" stroke="${ink}"/>`+lbl(100+k*150,210,k)).join('')+`<rect x="100" y="40" width="150" height="150" fill="${IN}" fill-opacity=".08" stroke="${IN}" stroke-width="2"/>`],
  ['The diagonal is √2.',`<line x1="100" y1="190" x2="250" y2="40" stroke="${OR}" stroke-width="3"/>`+lbl(160,105,'√2','fill="'+OR+'" font-weight="700"')],
  ['Swing it down to the line.',`<path d="M250 40 A212 212 0 0 1 312 190" fill="none" stroke="${OR}" stroke-dasharray="5 4" stroke-width="2"/><circle cx="312" cy="190" r="5" fill="${OR}"/>`+lbl(312,178,'√2 ≈ 1.414','fill="'+OR+'"')]]},
 seeNote:'Irrational numbers have exact points.',
 do:{title:'√2 with a compass',mat:'Graph paper, compass, ruler',steps:['Draw a unit square on a number line.','Swing its diagonal down.'],obs:'Point at ≈ 1.414.',why:'√2 is a real number.',lab:true},
 memo:'"Cannot be p/q? Then irrational."',
 miscon:['"π = 22/7 exactly." 22/7 is an approximation; π is irrational.'],
 terms:['Irrational number','Real numbers (R)','Number line','Square-root spiral'],
 q:{q:'Which is irrational?',o:['√16','0.5','√7','3/8'],a:2,why:'7 is not a perfect square.'},
 exam:'Identify irrationals; locate √n: 2 marks.'},

{id:'n3',num:'1.3',title:'Real numbers and their decimal expansions',
 intro:'Why does 1/8 stop at 0.125, while 1/7 goes on forever?',
 obj:'Classify decimal expansions and connect them to rational and irrational numbers.',
 prior:'Long division.',
 simple:'Decimal expansions are of three kinds: terminating (ends: 1/8 = 0.125); non-terminating recurring (repeats a block forever: 1/3 = 0.333… = 0.3̄, 1/7 = 0.142857142857… = 0.1̅4̅2̅8̅5̅7̅); and non-terminating non-recurring (never ends, never repeats: √2 = 1.41421356…). Rational numbers have terminating or recurring expansions; irrational numbers have non-terminating non-recurring expansions.',
 detail:'Why do rationals repeat? When dividing by q, the only possible remainders are 0, 1, …, q − 1. If a remainder 0 appears, the decimal terminates; otherwise a remainder must repeat within q − 1 steps, and from then on the digits repeat. A fraction in lowest terms terminates exactly when q has no prime factors other than 2 and 5.',
 real:'Calculators show only a few digits, so 1/3 appears as 0.3333333 — it actually never ends.',
 apply:'Without dividing, decide whether 7/80, 4/15 and 13/125 terminate.',
 see:{w:520,h:220,f:[
  ['Terminating.',box(20,40,150,50,'1/8 = 0.125',GN,'terminating')],
  ['Recurring.',box(185,40,150,50,'1/7 = 0.1̅4̅2̅8̅5̅7̅',IN,'non-terminating recurring')],
  ['Non-recurring.',box(350,40,150,50,'√2 = 1.41421…',OR,'non-recurring')+lbl(180,140,'rational','font-weight="700" fill="'+IN+'"')+`<path d="M95 100 L160 128 M260 100 L200 128" stroke="${IN}" stroke-width="2"/>`+lbl(425,140,'irrational','font-weight="700" fill="'+OR+'"')]]},
 seeNote:'Repeating or stopping means rational.',
 do:{title:'Remainder detective',mat:'Paper',steps:['Divide 1 by 7 by long division; list remainders.','Stop when a remainder repeats.'],obs:'Remainders 3, 2, 6, 4, 5, 1, then repeat.',why:'Only 6 non-zero remainders possible.',lab:true},
 memo:'"Stops or repeats → rational; neither → irrational."',
 miscon:['"Any long decimal is irrational." 0.142857142857… repeats, so it is rational.'],
 terms:['Terminating decimal','Non-terminating recurring','Non-terminating non-recurring','Bar notation'],
 q:{q:'The decimal expansion of 3/16 is:',o:['terminating','recurring','non-recurring','undefined'],a:0,why:'16 = 2⁴.'},
 exam:'Classify expansions: 1–2 marks.'},

{id:'n4',num:'1.4',title:'Recurring decimals to p/q',
 intro:'0.999… — is it slightly less than 1, or exactly 1?',
 obj:'Convert recurring decimals into fractions.',
 prior:'1.3; simple equations.',
 simple:'Let x = 0.3̄ = 0.333… Multiply by 10 (one digit repeats): 10x = 3.333… Subtract: 9x = 3, so x = 1/3. For two repeating digits multiply by 100. Example: x = 0.2̅7̅; 100x = 27.2̅7̅; 99x = 27; x = 27/99 = 3/11.',
 detail:'For a decimal like 1.27̄ (only 7 repeats): 10x = 12.7̄ and 100x = 127.7̄; subtract: 90x = 115; x = 23/18. And 0.9̄: 10x = 9.9̄ → 9x = 9 → x = 1. So 0.999… is exactly 1.',
 real:'This trick is used to turn repeating calculator answers into exact fractions.',
 apply:'Express 0.4̄7̄ and 0.001̄ in the form p/q.',
 see:{w:520,h:220,f:[
  ['x = 0.2̅7̅.',lbl(260,40,'x = 0.272727…','font-size="17"')],
  ['Multiply by 100.',lbl(260,85,'100x = 27.272727…','font-size="17" fill="'+IN+'"')],
  ['Subtract.',lbl(260,130,'99x = 27','font-size="17" fill="'+OR+'"')+lbl(260,175,'x = 27/99 = 3/11','font-size="20" font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Shift and subtract kills the repeat.',
 do:{title:'Check by dividing',mat:'Calculator',steps:['Convert 0.4̅5̅ to p/q.','Divide to check.'],obs:'5/11 = 0.4545…',why:'Method works.',lab:false},
 memo:'"One digit repeats → ×10; two digits → ×100."',
 miscon:['"0.999… is less than 1." It equals 1 exactly.'],
 terms:['Recurring decimal','Period (repeating block)'],
 q:{q:'0.6̄ as a fraction:',o:['6/10','2/3','3/5','6/100'],a:1,why:'9x = 6.'},
 exam:'Recurring decimal to p/q: 2 marks.'},

{id:'n5',num:'1.5',title:'Operations on real numbers; rationalising',
 intro:'Is √2 + √3 equal to √5? Is 2√3 rational?',
 obj:'Perform operations on irrationals and rationalise denominators.',
 prior:'1.2; algebraic identities.',
 simple:'Rational + irrational = irrational (2 + √3). Non-zero rational × irrational = irrational (2√3). But irrational ± irrational or × irrational can be rational or irrational (√2 × √2 = 2). Identities for positive a, b: √(ab) = √a √b; √(a/b) = √a/√b; (√a + √b)(√a − √b) = a − b; (a + √b)(a − √b) = a² − b; (√a + √b)² = a + 2√(ab) + b.',
 detail:'√2 + √3 ≠ √5 (check: 1.414 + 1.732 = 3.146, but √5 ≈ 2.236). Rationalising the denominator means making it rational. 1/√2 = √2/2. For 1/(2 + √3), multiply top and bottom by the conjugate (2 − √3): (2 − √3)/(4 − 3) = 2 − √3.',
 real:'Engineers prefer rationalised forms because dividing by a whole number is easier.',
 apply:'Rationalise 1/(√7 − 2) and simplify (3 + √3)(2 + √2).',
 see:{w:520,h:220,f:[
  ['1/(2 + √3).',lbl(260,40,'1 ÷ (2 + √3)','font-size="18"')],
  ['Multiply by the conjugate.',lbl(260,95,'× (2 − √3)/(2 − √3)','font-size="18" fill="'+IN+'"')],
  ['Rational denominator.',lbl(260,150,'= (2 − √3) ÷ (4 − 3) = 2 − √3','font-size="18" font-weight="700" fill="'+GN+'"')+lbl(260,195,'uses (a + √b)(a − √b) = a² − b','font-size="12"')]]},
 seeNote:'Conjugates cancel the root.',
 do:{title:'√2 + √3 vs √5',mat:'Calculator',steps:['Compute both.','Compare.'],obs:'Not equal.',why:'Roots don\'t add like that.',lab:false},
 memo:'"Conjugate kills the root in the denominator."',
 miscon:['"√a + √b = √(a + b)." Only √(ab) = √a √b works.'],
 terms:['Surd','Conjugate','Rationalising the denominator'],
 q:{q:'Rationalised form of 1/√5:',o:['√5','√5/5','5/√5','1/5'],a:1,why:'Multiply by √5/√5.'},
 exam:'Rationalise, simplify surds: 2–3 marks.'},

{id:'n6',num:'1.6',title:'Laws of exponents for real numbers',
 intro:'What could 8^(2/3) possibly mean?',
 obj:'Use laws of exponents with rational exponents.',
 prior:'Class 8: exponents.',
 simple:'For a > 0 and rational p, q: aᵖ · a^q = a^(p+q); (aᵖ)^q = a^(pq); aᵖ ÷ a^q = a^(p−q); aᵖ bᵖ = (ab)ᵖ. Also a⁰ = 1 and a^(−n) = 1/aⁿ. The nth root: a^(1/n) = ⁿ√a. And a^(m/n) = (ⁿ√a)ᵐ = ⁿ√(aᵐ).',
 detail:'8^(2/3) = (∛8)² = 2² = 4. 32^(1/5) = 2. 125^(−1/3) = 1/5. 2^(2/3) · 2^(1/3) = 2¹ = 2. (3^(1/5))⁴ = 3^(4/5). Simplify with the same base, then apply the laws.',
 real:'Bacteria doubling every hour grow as 2ᵗ; half an hour gives 2^(1/2) ≈ 1.41 times.',
 apply:'Find 9^(3/2), 16^(−3/4) and simplify 11^(1/2) ÷ 11^(1/4).',
 see:{w:520,h:200,f:[
  ['a^(1/n) = nth root.',lbl(260,45,'a^(1/n) = ⁿ√a','font-size="20" fill="'+IN+'"')],
  ['a^(m/n).',lbl(260,100,'a^(m/n) = (ⁿ√a)ᵐ','font-size="20" fill="'+OR+'"')],
  ['Example.',lbl(260,155,'8^(2/3) = (∛8)² = 2² = 4','font-size="20" font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Denominator = root, numerator = power.',
 do:{title:'Exponent cards',mat:'Cards',steps:['Write 10 expressions with fractional powers.','Evaluate them with a partner.'],obs:'Root first is easier.',why:'Laws.',lab:false},
 memo:'"Bottom is the root, top is the power."',
 miscon:['"8^(2/3) = 8 × 2/3." The exponent is not a multiplier.'],
 terms:['Exponent','Base','nth root','Rational exponent'],
 q:{q:'27^(1/3) =',o:['9','3','81','1/3'],a:1,why:'∛27.'},
 exam:'Evaluate and simplify exponents: 2 marks.'}
];

const CARDS=[['Rational','p/q, q ≠ 0; terminating or recurring.'],['Irrational','Not p/q; non-terminating non-recurring.'],['Real numbers','Rationals + irrationals; every point on the line.'],['Between two rationals','Infinitely many; use averages.'],['Terminating test','q (lowest terms) has only 2s and 5s.'],['Recurring → p/q','Multiply by 10ⁿ, subtract.'],['0.999…','= 1.'],['Conjugate','(a + √b)(a − √b) = a² − b.'],['Rationalise','Multiply by conjugate.'],['√a + √b','≠ √(a + b).'],['a^(m/n)','(ⁿ√a)ᵐ.'],['a^(−n)','1/aⁿ.']];

const Q=[
 {lv:1,q:'Every integer is a:',o:['natural number','whole number','rational number','irrational number'],a:2,w:'n = n/1.'},
 {lv:1,q:'Which is irrational?',o:['√9','√12','0.5','4/3'],a:1,w:'Not a perfect square.'},
 {lv:1,q:'The decimal of 1/3 is:',o:['terminating','non-terminating recurring','non-recurring','0.3'],a:1,w:'0.333…'},
 {lv:2,q:'0.3̅6̅ as p/q:',o:['36/100','4/11','9/25','36/90'],a:1,w:'36/99.'},
 {lv:2,q:'Which terminates?',o:['1/6','7/12','3/40','2/9'],a:2,w:'40 = 2³ × 5.'},
 {lv:2,q:'64^(1/2) =',o:['32','8','4','16'],a:1,w:'√64.'},
 {lv:3,q:'(√5 + √2)(√5 − √2) =',o:['3','7','√3','10'],a:0,w:'5 − 2.'},
 {lv:3,q:'Rationalise 1/(√3 + √2):',o:['√3 + √2','√3 − √2','1','√6'],a:1,w:'Denominator 3 − 2 = 1.'},
 {lv:4,q:'16^(−3/4) =',o:['8','1/8','−8','1/12'],a:1,w:'(⁴√16)⁻³ = 2⁻³.'},
 {lv:4,q:'The sum of a rational and an irrational number is:',o:['always rational','always irrational','sometimes rational','zero'],a:1,w:'Can\'t cancel the irrational part.'},
 {lv:5,open:true,m:3,q:'Express 1.2̅7̅ in the form p/q.',ans:['x = 1.2727…; 100x = 127.2727… (1)','99x = 126 (1)','x = 126/99 = 14/11 (1)']},
 {lv:5,open:true,m:5,q:'Rationalise and simplify: (a) 6/(√5 − √3) (b) find a and b if (3 + √7)/(3 − √7) = a + b√7.',ans:['(a) multiply by (√5 + √3) (1)','= 6(√5 + √3)/2 = 3(√5 + √3) (1)','(b) multiply by (3 + √7): (3 + √7)²/(9 − 7) (1)','= (16 + 6√7)/2 = 8 + 3√7 (1)','a = 8, b = 3 (1)']}
];

const ONEMIN=['N ⊂ W ⊂ Z ⊂ Q ⊂ R.','Irrationals like √2, π; root spiral.','Terminating, recurring, non-recurring.','Recurring decimal → p/q.','Surds and rationalising.','Rational exponents.'];
const KEYS=[['rational',/rational|p\/q/i],['irrational',/irrational|√2/i],['decimal',/decimal|terminat|recurring/i],['p/q',/recurring.*p\/q|99x|9x/i],['rationalise',/rationalis|conjugate|surd/i],['exponents',/exponent|power|root/i]];

/* ---------- lab ---------- */
let mode='d',P=1,Qd=7,N=5,wired=false;
const gcd=(a,b)=>b?gcd(b,a%b):a;
function factors(n){const f=[];let d=2;while(n>1){while(n%d===0){f.push(d);n/=d}d++}return f}
function expand(p,q){const ip=Math.floor(p/q);let r=p%q;const seen={},digits=[],rems=[];let i=0;while(r!==0&&!(r in seen)&&i<60){seen[r]=i;rems.push(r);r*=10;digits.push(Math.floor(r/q));r%=q;i++}return {ip,digits,rems,rep:r!==0&&(r in seen)?seen[r]:-1}}
function drawD(){const g=gcd(P,Qd),p=P/g,q=Qd/g;const e=expand(p,q);const f=factors(q);const term=f.every(x=>x===2||x===5);let s='';
 let dec=e.digits.map((d,i)=>i===e.rep?'‾'+d:d).join('');const str=e.ip+'.'+(e.digits.length?e.digits.map(String).join(''):'0');
 s+=T(260,36,`${P}/${Qd}${g>1?' = '+p+'/'+q:''}`,'font-size="20" font-weight="700"');
 const show=e.rep>=0?e.ip+'.'+e.digits.slice(0,e.rep).join('')+'('+e.digits.slice(e.rep).join('')+')':str;s+=T(260,70,'= '+show+(e.rep>=0?' repeating':''),'font-size="17" fill="'+(e.rep>=0?IN:GN)+'"');
 const n=Math.min(e.rems.length,12);for(let i=0;i<n;i++){const x=40+i*38,y=120;const r=e.rems[i];const isRep=e.rep>=0&&i>=e.rep;s+=`<rect x="${x}" y="${y}" width="32" height="32" rx="8" fill="${isRep?IN:GN}" fill-opacity=".15" stroke="${isRep?IN:GN}"/>`+T(x+16,y+21,r,'font-size="13" font-weight="700"')+T(x+16,y+52,e.digits[i],'font-size="15" fill="'+OR+'"')}
 s+=T(30,140,'rem','font-size="10"')+T(30,175,'digit','font-size="10"');
 if(e.rep>=0){const x1=40+e.rep*38+16,x2=40+Math.min(e.rems.length,12)*38+4;if(e.rems.length<=12)s+=`<path d="M${x2} 136 q20 -40 -${x2-x1} -20" fill="none" stroke="${RD}" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#ah)"/>`+T(x2-10,95,'remainder '+e.rems[e.rep]+' again → repeat','font-size="11" fill="'+RD+'"')}
 s+=T(260,240,`q = ${q}${f.length>1?' = '+f.join(' × '):f.length?' (prime)':''}`,'font-size="16" font-weight="700"')+T(260,270,term?'only 2s and 5s → terminating':'other prime factors → non-terminating recurring','font-size="14" fill="'+(term?GN:IN)+'"');
 $('#nsSvg').innerHTML=s;$('#nsPv').textContent=P;$('#nsQv').textContent=Qd;
 $('#nsOut').innerHTML=`<p>Long division gives remainders ${e.rems.slice(0,12).join(', ')}${e.rems.length>12?', …':''}${e.rep<0?', 0':''}.</p><p>${e.rep<0?'A remainder of 0 appeared, so the decimal <b>terminates</b>.':`Remainder ${e.rems[e.rep]} came back, so the block of ${e.digits.length-e.rep} digit${e.digits.length-e.rep>1?'s':''} <b>repeats forever</b>.`} With denominator ${q}, at most ${q-1} different non-zero remainders are possible.</p>`}
function drawS(){let s=spiral(N,260,168,37);$('#nsSvg').innerHTML=s+T(260,330,'each new side = 1; each spoke = √k','font-size="12"');$('#nsNv').textContent=N;
 $('#nsOut').innerHTML=`<p>Each triangle has a right angle, one side 1 and the previous spoke √(k − 1). By Baudhayana–Pythagoras, the new spoke = √((k − 1) + 1) = <b>√k</b>.</p><p>√${N} ≈ <b>${Math.sqrt(N).toFixed(4)}</b> ${Number.isInteger(Math.sqrt(N))?'— a whole number, so rational!':'— irrational: its decimal never ends or repeats.'}</p>`}
function draw(){$('#nsD').style.display=mode==='d'?'':'none';$('#nsSp').style.display=mode==='s'?'':'none';mode==='d'?drawD():drawS()}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const el=e.target;if(!el||!el.classList||!el.classList.contains('nsS'))return;const v=+el.value;if(el.id==='nsP')P=v;else if(el.id==='nsQ')Qd=v;else N=v;draw()})}
function labClick(){return false}
function labChange(el){if(el.id==='nsM'){mode=el.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
