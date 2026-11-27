/* Rai Plus content pack: Class 8 Mathematics (Ganita Prakash), Chapter 5 – Number Play. */
RP.register({key:'8mat05',cls:'8',subject:'Mathematics',ch:'5',title:"Number Play",color:'#3b6d11',
crumb:"Class 8 Mathematics · Ganita Prakash",h1:"Chapter 5: Number Play",sub:"Parity and sums of consecutive numbers, multiples and always–sometimes–never claims, divisibility by 2, 4, 8, 3, 9 and 11, remainders, digital roots, and cryptarithms.",heroLabel:"Digits arranged in a puzzle",labName:'Divisibility detective',
theme:"\n:root{--g:light-dark(#3b6d11,#a8d77d);--g2:light-dark(#eef6e4,#0f1a07);--line:light-dark(#d4e7bf,#2c4219);--bg:light-dark(#ffffff,#0b1206);--card:light-dark(#ffffff,#111a0a);\n--ink:light-dark(#162508,#e6f1da);--mute:light-dark(#4f6439,#b5c9a0);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#2b520b}\n",
labHTML:`  <h2>Divisibility detective</h2>
  <p>Type any whole number. The detective applies each divisibility shortcut — last digits, digit sum, alternating sum — and shows its digital root. Consecutive mode: find all ways to write a number as a sum of consecutive numbers.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="dvSvg" viewBox="0 0 460 320" role="img" aria-label="Divisibility checks" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="dvM"><option value="d">Divisibility checks</option><option value="c">Sums of consecutive numbers</option></select></label></div>
  <div class="ctrl"><label>Number<input id="dvN" type="number" value="918082" min="1" style="width:9em"></label> <button class="btn" id="dvGo">Investigate</button> <button class="btn" id="dvR">Random</button></div>
  <div class="box y" id="dvOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3b6d11',LABNAME='Divisibility detective',MIND_CENTER='Number play';
const GN='#3b6d11',OR='#b04a1f',BL='#1f5f8b',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
const dsum=n=>String(n).split('').reduce((a,c)=>a+ +c,0);
const droot=n=>n===0?0:1+(n-1)%9;
function heroDraw(){return T(110,90,'S E N D','font-size="18" fill="#fff" font-weight="700"')+T(260,90,'÷ 9 ?','font-size="22" fill="#fff" font-weight="700"')}
const HERO=heroDraw;
const MIND=[['Parity',100,50],['Consecutive sums',420,50],['Multiples & claims',90,150],['Divisibility rules',430,150],['Remainders & digital roots',110,250],['Cryptarithms',410,250]];

const C=[
{id:'p1',num:'5.1',title:'Parity: odd and even',
 intro:'Can five odd numbers ever add up to 100?',
 obj:'Use parity (odd/even) to predict results of operations.',
 prior:'Class 6–7: odd and even numbers, letter-numbers.',
 simple:'Parity tells whether a number is even or odd. Even = 2k, odd = 2k + 1. Rules: even + even = even; odd + odd = even; even + odd = odd. Any product with an even factor is even; odd × odd = odd. The sum of an odd number of odd numbers is odd — so five odd numbers can never total 100.',
 detail:'Algebra proves it: (2a + 1) + (2b + 1) = 2(a + b + 1), which is even. Expressions like n(n + 1) are always even (one of two consecutive numbers is even). Parity arguments solve puzzles quickly without trying every case.',
 real:'Odd–even rules for traffic in Delhi used the parity of the last digit of number plates.',
 apply:'Is 3n + 5 always odd, always even, or does it depend on n?',
 see:{w:520,h:200,f:[
  ['odd + odd = even',lbl(130,50,'odd + odd = even','font-size="17"')+lbl(390,50,'even + odd = odd','font-size="17"')],
  ['Proof with algebra.',lbl(260,105,'(2a + 1) + (2b + 1) = 2(a + b + 1)','font-size="16" fill="'+BL+'"')],
  ['Five odds can\'t make 100.',lbl(260,160,'odd + odd + odd + odd + odd = odd ≠ 100','font-size="15" font-weight="700" fill="'+OR+'"')]]},
 seeNote:'Parity rules settle many puzzles.',
 do:{title:'Odd cards',mat:'Number cards 1–9',steps:['Try to pick 5 odd cards that total 30.'],obs:'Impossible.',why:'Parity.',lab:false},
 memo:'"Odd count of odds is odd."',
 miscon:['"Odd × odd is even." It is odd.'],
 terms:['Parity','Even (2k)','Odd (2k + 1)'],
 q:{q:'The sum of 7 odd numbers is:',o:['always even','always odd','depends','zero'],a:1,why:'Odd count of odds.'},
 exam:'Parity reasoning: 2 marks.'},

{id:'p2',num:'5.2',title:'Sums of consecutive numbers',
 intro:'15 = 7 + 8 = 4 + 5 + 6 = 1 + 2 + 3 + 4 + 5. Can every number be written as a sum of consecutive numbers?',
 obj:'Explore which numbers are sums of consecutive positive integers.',
 prior:'5.1.',
 simple:'Many numbers can be written as sums of two or more consecutive positive numbers. Any odd number greater than 1 is the sum of two consecutive numbers: 2k + 1 = k + (k + 1). Three consecutive numbers always add to a multiple of 3: (n − 1) + n + (n + 1) = 3n.',
 detail:'Surprise: powers of 2 (1, 2, 4, 8, 16, 32, …) can never be written as a sum of two or more consecutive positive numbers; every other number can. The number of ways depends on the odd factors of the number. Gauss\'s trick: 1 + 2 + … + 100 = 100 × 101 ÷ 2 = 5050.',
 real:'Stacking bricks in a staircase uses sums of consecutive numbers.',
 apply:'Write 30 as a sum of consecutive numbers in as many ways as you can.',
 see:{w:520,h:220,f:[
  ['15 = 7 + 8',[7,8].map((n,k)=>`<rect x="${40+k*30}" y="${180-n*12}" width="26" height="${n*12}" fill="${GN}" opacity=".6"/>`).join('')+lbl(70,200,'7 + 8')],
  ['15 = 4 + 5 + 6',[4,5,6].map((n,k)=>`<rect x="${180+k*30}" y="${180-n*12}" width="26" height="${n*12}" fill="${BL}" opacity=".6"/>`).join('')+lbl(225,200,'4 + 5 + 6')],
  ['15 = 1 + 2 + 3 + 4 + 5',[1,2,3,4,5].map((n,k)=>`<rect x="${330+k*30}" y="${180-n*12}" width="26" height="${n*12}" fill="${OR}" opacity=".6"/>`).join('')+lbl(405,200,'1+2+3+4+5')]]},
 seeNote:'Staircases of numbers.',
 do:{title:'Hunt the powers of 2',mat:'Notebook',steps:['Try writing 1–20 as consecutive sums.','Which ones fail?'],obs:'1, 2, 4, 8, 16.',why:'Powers of 2.',lab:true},
 memo:'"Every number except powers of 2."',
 miscon:['"Even numbers can\'t be consecutive sums." 6 = 1 + 2 + 3.'],
 terms:['Consecutive numbers','Power of 2','Gauss sum'],
 q:{q:'Which cannot be written as a sum of consecutive positive numbers?',o:['9','12','16','15'],a:2,why:'Power of 2.'},
 exam:'Consecutive sums: 2 marks.'},

{id:'p3',num:'5.3',title:'Multiples and always–sometimes–never',
 intro:'"A multiple of 6 is a multiple of 3." "A multiple of 3 is a multiple of 6." Which is always true?',
 obj:'Reason about multiples and test claims with proofs and counterexamples.',
 prior:'Factors and multiples (Class 6–7).',
 simple:'If a is a multiple of b, and b is a multiple of c, then a is a multiple of c — "factors of factors are factors". So every multiple of 6 is a multiple of 3 (always), but a multiple of 3 is a multiple of 6 only when it is even (sometimes). To show a claim is sometimes or never true, one counterexample is enough; to show "always", you need a general argument.',
 detail:'The product of two consecutive numbers is always even; of three consecutive numbers, always a multiple of 6. The sum of four consecutive numbers is never a multiple of 4: n + (n+1) + (n+2) + (n+3) = 4n + 6. Multiples of 4: a number is divisible by 4 if its last two digits form a multiple of 4.',
 real:'Leap years are (mostly) multiples of 4 — 2028 is a leap year because 28 is a multiple of 4.',
 apply:'Always, sometimes or never: "The sum of three consecutive numbers is a multiple of 3."',
 see:{w:520,h:200,f:[
  ['Multiples of 6 ⊂ multiples of 3.',`<circle cx="200" cy="100" r="85" fill="${BL}" fill-opacity=".1" stroke="${BL}" stroke-width="2"/><circle cx="220" cy="110" r="45" fill="${GN}" fill-opacity=".2" stroke="${GN}" stroke-width="2"/>`+lbl(160,50,'multiples of 3','fill="'+BL+'"')+lbl(220,115,'of 6','fill="'+GN+'"')],
  ['Always: 6k = 3(2k).',lbl(400,70,'6k = 3 × 2k  ✓','font-size="15" fill="'+GN+'"')],
  ['Sometimes: 9 is a multiple of 3 but not 6.',lbl(400,130,'9: of 3, not of 6','font-size="14" fill="'+OR+'"')]]},
 seeNote:'One counterexample breaks "always".',
 do:{title:'Claim cards',mat:'Statement cards',steps:['Sort into always/sometimes/never with reasons.'],obs:'Counterexamples matter.',why:'Proof vs examples.',lab:false},
 memo:'"Always needs proof; never/sometimes needs an example."',
 miscon:['"It worked for 5 examples, so it is always true." Examples are not proof.'],
 terms:['Multiple','Counterexample','Always / sometimes / never'],
 q:{q:'The product of any two consecutive numbers is:',o:['always odd','always even','sometimes even','never even'],a:1,why:'One is even.'},
 exam:'Justify claims: 3 marks.'},

{id:'p4',num:'5.4',title:'Divisibility rules: 2, 4, 8, 5, 10, 3, 9 and 11',
 intro:'Without dividing, can you tell whether 918082 is divisible by 11?',
 obj:'Use and explain divisibility shortcuts.',
 prior:'5.3; place value.',
 simple:'By 2: last digit even. By 4: last two digits divisible by 4. By 8: last three digits divisible by 8. By 5: last digit 0 or 5. By 10: last digit 0. By 3: digit sum divisible by 3. By 9: digit sum divisible by 9. By 11: alternating sum of digits (from the right: + − + − …) divisible by 11 (including 0).',
 detail:'Why 3 and 9 work: 10 = 9 + 1, 100 = 99 + 1, 1000 = 999 + 1, so a number like 456 = 4×99 + 5×9 + (4+5+6); the parts with 9s are multiples of 9 (and of 3). Why 11 works: 10 = 11 − 1, 100 = 99 + 1, 1000 = 1001 − 1, so digits get alternating signs. 918082: from the right 2 − 8 + 0 − 8 + 1 − 9 = −22 → divisible by 11.',
 real:'ISBN and many ID numbers use digit-sum checks to catch typing errors.',
 apply:'Is 7,425 divisible by 3, 9, 5, 11?',
 see:{w:520,h:220,f:[
  ['Last digits: 2, 4, 8, 5, 10.',box(20,30,150,60,'Last digits',BL,'2 · 4 · 8 · 5 · 10')],
  ['Digit sum: 3 and 9.',box(185,30,150,60,'Digit sum',GN,'3 and 9')],
  ['Alternating sum: 11.',box(350,30,150,60,'Alternating sum',OR,'11')+lbl(260,140,'918082: 2 − 8 + 0 − 8 + 1 − 9 = −22 → ÷ 11 ✓','font-size="14" font-weight="700"')]]},
 seeNote:'Shortcuts come from place value.',
 do:{title:'Rule race',mat:'Number cards',steps:['Test 10 numbers with the rules; check with a calculator.'],obs:'Rules always agree.',why:'Place value.',lab:true},
 memo:'"Last digits, digit sum, alternate sum."',
 miscon:['"If digit sum is divisible by 3, the number is divisible by 9." Only if the digit sum is divisible by 9.'],
 terms:['Divisibility rule','Digit sum','Alternating sum'],
 q:{q:'Is 5,346 divisible by 9?',o:['Yes','No'],a:1,why:'Digit sum 18 → yes! (5+3+4+6=18)'},
 exam:'Apply and explain divisibility rules: 3 marks.'},

{id:'p5',num:'5.5',title:'Remainders and digital roots',
 intro:'Add the digits of 98765 again and again until one digit is left. What does that digit tell you?',
 obj:'Use remainders (nk + r) and digital roots.',
 prior:'5.4.',
 simple:'A number that leaves remainder r when divided by n can be written as nk + r. Numbers leaving remainder 1 on division by 3: 1, 4, 7, 10, … = 3k + 1. The digital root is the single digit got by repeatedly adding digits: 98765 → 35 → 8. The digital root equals the remainder on division by 9 (with 9 instead of 0).',
 detail:'Digital roots check arithmetic ("casting out nines"): the digital root of a product equals the digital root of the product of the digital roots. 23 × 47 = 1081: roots 5 × 2 = 10 → 1, and 1081 → 10 → 1 ✓. Remainders add and multiply too: if a leaves 2 and b leaves 3 on division by 5, a + b leaves 0.',
 real:'Clock arithmetic: 10 hours after 9 o\'clock is 7 o\'clock — remainder on division by 12.',
 apply:'Find the digital root of 4,729 and its remainder on division by 9.',
 see:{w:520,h:200,f:[
  ['98765',lbl(130,60,'98765','font-size="22"')],
  ['→ 35 → 8',lbl(300,60,'→ 9+8+7+6+5 = 35 → 3+5 = 8','font-size="16"')],
  ['Digital root 8 = remainder ÷ 9.',lbl(260,140,'98765 = 9 × 10973 + 8','font-size="17" font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Digital root = remainder by 9.',
 do:{title:'Cast out nines',mat:'Notebook',steps:['Do 3 multiplications.','Check each with digital roots.'],obs:'Roots match.',why:'Remainder arithmetic.',lab:false},
 memo:'"Add digits till one is left — that\'s the remainder by 9."',
 miscon:['"Digital root 9 means remainder 9." It means remainder 0 (divisible by 9).'],
 terms:['Remainder','nk + r form','Digital root','Casting out nines'],
 q:{q:'Digital root of 123456:',o:['3','6','9','21'],a:0,why:'21 → 3.'},
 exam:'Remainders, digital roots: 2 marks.'},

{id:'p6',num:'5.6',title:'Digits in disguise: cryptarithms',
 intro:'In AB + AB + AB = CAB, each letter is a different digit. Can you crack it?',
 obj:'Solve cryptarithms using place value and logical reasoning.',
 prior:'5.1–5.5.',
 simple:'A cryptarithm (alphametic) replaces digits with letters; each letter stands for one digit, and different letters for different digits. Solve by reasoning column by column, using carries and place value. Example: AB + AB + AB = CAB → 3 × (10A + B) = 100C + 10A + B → 20A + 2B = 100C → 10A + B = 50C, so AB = 50, C = 1: 50 + 50 + 50 = 150.',
 detail:'Useful clues: a sum of two numbers can carry at most 1 into the next column; the leading letter cannot be 0; parity and divisibility narrow choices. The famous SEND + MORE = MONEY has a unique answer: 9567 + 1085 = 10652.',
 real:'Puzzle columns in newspapers often carry cryptarithms.',
 apply:'Solve: A + A + A = BA (single digits).',
 see:{w:520,h:220,f:[
  ['AB + AB + AB = CAB',lbl(260,50,'AB + AB + AB = CAB','font-size="20"')],
  ['3(10A + B) = 100C + 10A + B',lbl(260,100,'30A + 3B = 100C + 10A + B  →  10A + B = 50C','font-size="14" fill="'+BL+'"')],
  ['50 + 50 + 50 = 150',lbl(260,160,'50 + 50 + 50 = 150','font-size="20" font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Place value cracks the code.',
 do:{title:'Make your own',mat:'Notebook',steps:['Write a true sum; replace digits with letters.','Swap with a friend.'],obs:'Fun puzzles.',why:'Reasoning.',lab:false},
 memo:'"Column by column, carry by carry."',
 miscon:['"Two letters can be the same digit." Different letters mean different digits.'],
 terms:['Cryptarithm','Alphametic','Carry'],
 q:{q:'A + A + A = BA. A =',o:['3','5','7','9'],a:1,why:'5+5+5 = 15.'},
 exam:'Solve cryptarithm: 3 marks.'}
];
C[3].q={q:'Is 5,346 divisible by 9?',o:['Yes — digit sum 18','No — digit sum 17','Only by 3','Only by 2'],a:0,why:'5+3+4+6 = 18, divisible by 9.'};

const CARDS=[['Parity','even = 2k, odd = 2k + 1.'],['Odd sums','Odd count of odd numbers is odd.'],['Consecutive sums','All numbers except powers of 2.'],['Factors of factors','Multiple of 6 ⇒ multiple of 3.'],['Counterexample','One case disproves "always".'],['2, 4, 8','Last 1, 2, 3 digits.'],['3, 9','Digit sum.'],['11','Alternating digit sum.'],['Digital root','Remainder on division by 9.'],['Cryptarithm','Letters for digits; reason by columns.']];

const Q=[
 {lv:1,q:'odd × odd =',o:['even','odd','depends','zero'],a:1,w:'Odd.'},
 {lv:1,q:'Divisible by 4 if:',o:['last digit even','last two digits divisible by 4','digit sum divisible by 4','ends in 4'],a:1,w:'Last two.'},
 {lv:1,q:'Digit sum of 4,527:',o:['18','17','27','9'],a:0,w:'4+5+2+7.'},
 {lv:2,q:'Is 3,135 divisible by 11?',o:['yes','no'],a:0,w:'5−3+1−3 = 0.'},
 {lv:2,q:'Numbers 3k + 2 leave remainder ___ on ÷ 3:',o:['0','1','2','3'],a:2,w:'nk + r.'},
 {lv:2,q:'Which is a sum of consecutive positive numbers?',o:['8','16','18','32'],a:2,w:'5+6+7.'},
 {lv:3,q:'Digital root of 9,999,999:',o:['9','0','63','7'],a:0,w:'Divisible by 9.'},
 {lv:3,q:'Sum of four consecutive numbers is:',o:['always a multiple of 4','never a multiple of 4','sometimes','always odd'],a:1,w:'4n + 6.'},
 {lv:4,q:'Smallest digit for * so that 52*6 is divisible by 9:',o:['1','5','4','0'],a:4-3,w:'5+2+*+6 = 13 + * → * = 5.'},
 {lv:4,q:'Is 1,728 divisible by 8?',o:['yes','no'],a:0,w:'728 ÷ 8 = 91.'},
 {lv:5,open:true,m:3,q:'Explain why the digit-sum rule for divisibility by 9 works, using 4,536.',ans:['4536 = 4×1000 + 5×100 + 3×10 + 6 (1)','= 4×999 + 5×99 + 3×9 + (4+5+3+6) (1)','First parts are multiples of 9, so divisible iff 4+5+3+6 = 18 is; it is (1)']},
 {lv:5,open:true,m:3,q:'Solve the cryptarithm AB + BA = 121 where A > B (give all answers).',ans:['(10A + B) + (10B + A) = 11(A + B) = 121 (1)','So A + B = 11 (1)','Pairs: 92, 83, 74, 65 (with A > B) (1)']}
];
Q[8].a=1;

const ONEMIN=['Parity rules.','Consecutive sums; powers of 2.','Multiples; always–sometimes–never.','Divisibility rules and why they work.','Remainders and digital roots.','Cryptarithms.'];
const KEYS=[['parity',/parity|odd|even/i],['consecutive',/consecutive/i],['multiples',/multiple|counterexample/i],['divisibility',/divisib/i],['digital root',/digital root|remainder/i],['cryptarithm',/cryptarithm|alphametic/i]];

/* ---------- lab ---------- */
let mode='d';
function drawD(n){const s0=String(n);const ds=dsum(n);const alt=s0.split('').reverse().reduce((a,c,i)=>a+(i%2?-1:1)*(+c),0);const L2=+s0.slice(-2),L3=+s0.slice(-3);
 const rows=[[2,`last digit ${s0.slice(-1)}`,n%2===0],[3,`digit sum ${ds}`,ds%3===0],[4,`last two digits ${L2}`,L2%4===0],[5,`last digit ${s0.slice(-1)}`,n%5===0],[6,'divisible by 2 and 3',n%6===0],[8,`last three digits ${L3}`,L3%8===0],[9,`digit sum ${ds}`,ds%9===0],[10,`last digit ${s0.slice(-1)}`,n%10===0],[11,`alternating sum ${alt}`,alt%11===0]];
 let s=T(230,26,n.toLocaleString('en-IN'),'font-size="22" font-weight="700"');rows.forEach(([d,why,ok],k)=>{const y=58+k*26;s+=`<rect x="20" y="${y-17}" width="420" height="22" rx="5" fill="${ok?GN:GR}" fill-opacity="${ok?.15:.07}"/>`+T(50,y,'÷ '+d,'font-size="13" font-weight="700"')+T(200,y,why,'font-size="12"')+T(400,y,ok?'✓ yes':'✗ no',`font-size="13" font-weight="700" fill="${ok?GN:OR}"`)});
 const dr=droot(n);s+=T(230,305,`digital root: ${ds}${ds>9?' → '+droot(ds):''} → remainder on ÷ 9 is ${n%9}`,'font-size="12" fill="'+PU+'"');$('#dvSvg').innerHTML=s;
 const divs=rows.filter(r=>r[2]).map(r=>r[0]);$('#dvOut').innerHTML=`<p>${divs.length?`Divisible by: <b>${divs.join(', ')}</b>.`:'Not divisible by any of 2–11 listed.'} Parity: <b>${n%2?'odd':'even'}</b>.</p><p>Alternating sum is taken from the right (+ − + − …).</p>`}
function drawC(n){const ways=[];for(let len=2;len*(len+1)/2<=n;len++){const a=(n-len*(len-1)/2)/len;if(Number.isInteger(a)&&a>0)ways.push([a,len])}let s=T(230,26,`${n} as sums of consecutive numbers`,'font-size="15" font-weight="700"');
 ways.slice(0,8).forEach(([a,len],k)=>{const y=60+k*30;const terms=[...Array(len)].map((_,i)=>a+i);s+=T(20,y,(len<=8?terms.join(' + '):`${a} + ${a+1} + … + ${a+len-1}`)+` (${len} terms)`,'font-size="13" text-anchor="start"')});
 if(!ways.length)s+=T(230,140,'No way at all!','font-size="20" font-weight="700" fill="'+OR+'"');$('#dvSvg').innerHTML=s;const p2=(n&(n-1))===0;
 $('#dvOut').innerHTML=ways.length?`<p>${ways.length} way${ways.length>1?'s':''} found.${ways.length>8?' (first 8 shown)':''}</p>`:`<p class="fb ok">${n} is ${p2?'a power of 2 — these can never be written as a sum of two or more consecutive positive numbers.':'not expressible.'}</p>`}
function run(){const n=Math.floor(+$('#dvN').value);if(!(n>=1&&n<=1e12)){$('#dvOut').innerHTML='<p class="fb no">Enter a whole number from 1 upward.</p>';return}if(mode==='c'&&n>100000){$('#dvOut').innerHTML='<p class="fb no">For consecutive sums use a number up to 1,00,000.</p>';return}mode==='d'?drawD(n):drawC(n)}
function labShow(){run()}
function labInit(){}
function labClick(b){if(b.id==='dvGo'){run();return true}if(b.id==='dvR'){$('#dvN').value=mode==='d'?Math.floor(Math.random()*900000)+100:Math.floor(Math.random()*120)+1;run();return true}return false}
function labChange(t){if(t.id==='dvM'){mode=t.value;$('#dvN').value=mode==='d'?918082:30;run();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
