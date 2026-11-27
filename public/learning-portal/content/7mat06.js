/* Rai Plus content pack: Class 7 Mathematics (Ganita Prakash), Chapter 6 – Number Play. */
RP.register({key:'7mat06',cls:'7',subject:'Mathematics',ch:'6',title:"Number Play",color:'#6a4fb3',
crumb:"Class 7 Mathematics · Ganita Prakash",h1:"Chapter 6: Number Play",sub:"Parity of sums and products, parity puzzles, magic squares, digit sums and divisibility by 3 and 9, and letter puzzles.",heroLabel:"A 3 × 3 magic square with sums of 15",labName:'Magic square lab',
theme:"\n:root{--g:light-dark(#6a4fb3,#c3b3f2);--g2:light-dark(#f1edfb,#130f22);--line:light-dark(#dcd3f3,#30285a);--bg:light-dark(#ffffff,#0b0916);--card:light-dark(#ffffff,#110e20);\n--ink:light-dark(#1b1338,#ebe6fa);--mute:light-dark(#5a5080,#b8afd6);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#4e3891}\n",
labHTML:`  <h2>Magic square lab</h2>
  <p>Tap a number, then tap a cell to place it (tap a filled cell to clear it). Make every row, column and diagonal add to the same sum.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="qSvg" viewBox="0 0 460 330" role="img" aria-label="Magic square grid" style="color:var(--ink);cursor:pointer"></svg></div></div>
  <div><div class="ctrl"><label>Numbers to use<select id="qSet"><option value="1">1 to 9 (sum 15)</option><option value="2">2 to 10 (sum 18)</option><option value="3">5, 10, … 45 (sum 75)</option></select></label></div>
  <div class="ctrl" id="qPal" style="display:flex;flex-wrap:wrap;gap:6px"></div>
  <div class="ctrl"><button class="btn" id="qHint">Hint: centre</button> <button class="btn" id="qClear">Clear</button> <button class="btn" id="qSolve">Show a solution</button></div>
  <div class="box y" id="qOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#6a4fb3',LABNAME='Magic square lab',MIND_CENTER='Number play';
const PU='#6a4fb3',OR='#b04a1f',GN='#3b6d11',BL='#1f5f8b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
function sq3(x0,y0,a,u=50,hl){let s='';a.forEach((v,i)=>{const r=Math.floor(i/3),c=i%3;s+=`<rect x="${x0+c*u}" y="${y0+r*u}" width="${u}" height="${u}" fill="${hl&&hl.includes(i)?'#fde8c8':'none'}" stroke="${ink}" stroke-width="1.5"/>`+(v!==null&&v!==undefined?T(x0+c*u+u/2,y0+r*u+u/2+7,String(v),'font-size="20" font-weight="700"'):'')});return s}
const LO=[2,7,6,9,5,1,4,3,8];
function heroDraw(){return sq3(60,15,LO,36).replace(/currentColor/g,'#fff').replace(/font-size="20" font-weight="700"/g,'font-size="18" font-weight="700" fill="#fff"')}
const HERO=heroDraw;
const MIND=[['Numbers tell things',100,50],['Parity',420,50],['Parity puzzles',90,150],['Magic squares',430,150],['Digit sums',110,250],['Letter puzzles',410,250]];

const C=[
{id:'q1',num:'6.1',title:'Odd and even: parity',
 intro:'Without adding, can you say whether 1 + 3 + 5 + 7 + 9 is odd or even?',
 obj:'Use parity rules for sums and products.',
 prior:'Class 6: even and odd numbers.',
 simple:'Every whole number is even (a multiple of 2) or odd. This is its parity. even + even = even; odd + odd = even; even + odd = odd. A sum of many numbers is odd only if it has an odd number of odd numbers. 1 + 3 + 5 + 7 + 9 has five odd numbers → odd (it is 25).',
 detail:'Products: even × anything = even; odd × odd = odd. Picture: an even number is pairs of dots; an odd number is pairs plus one extra. Two odd numbers: the two extras pair up → even. Even numbers can be written 2n; odd numbers 2n + 1.',
 real:'If students stand in pairs and one is left over, the class has an odd number of students.',
 apply:'Is 13 + 27 + 41 + 8 even or odd?',
 see:{w:520,h:200,f:[
  ['Even: all in pairs.',[0,1,2,3,4,5].map(k=>`<circle cx="${60+Math.floor(k/2)*22}" cy="${80+(k%2)*22}" r="8" fill="${BL}"/>`).join('')+lbl(85,140,'6 (even)')],
  ['Odd: one left over.',[0,1,2,3,4].map(k=>`<circle cx="${230+Math.floor(k/2)*22}" cy="${80+(k%2)*22}" r="8" fill="${OR}"/>`).join('')+lbl(255,140,'5 (odd)')],
  ['odd + odd: extras pair up → even.',lbl(410,90,'odd + odd = even','font-weight="700"')+lbl(410,115,'even + odd = odd')+lbl(260,185,'odd × odd = odd · even × anything = even','font-size="12"')]]},
 seeNote:'Count the odd numbers.',
 do:{title:'Pair up',mat:'Counters',steps:['Show 7 + 9 with counters in pairs.','See what happens to the extras.'],obs:'Even total.',why:'Parity.',lab:false},
 memo:'"Odd odds make odd; even odds make even."',
 miscon:['"Adding odd numbers always gives odd." Two odds give even.'],
 terms:['Parity','Even (2n)','Odd (2n + 1)'],
 q:{q:'Parity of 15 + 22 + 9:',o:['even','odd','both','neither'],a:0,why:'Two odd numbers → even.'},
 exam:'Use parity without calculating: 2 marks.'},

{id:'q2',num:'6.2',title:'Parity puzzles',
 intro:'Can you pick 5 numbers from 1, 3, 5, 7, 9, 11 that add up to 30?',
 obj:'Use parity to prove some things are impossible.',
 prior:'6.1.',
 simple:'Five odd numbers always add to an odd number, and 30 is even — so it is impossible! Parity helps us decide quickly whether a puzzle has a solution, without trying every case.',
 detail:'Grid puzzle: in a grid where each row and column must have an even sum, parity tells which cells must be odd or even. Handshake idea: the number of people who shake an odd number of hands is always even. Chess knight always moves from a light square to a dark square (and back) — a parity argument.',
 real:'Football schedules and seat arrangements often use parity reasoning.',
 apply:'Can three odd numbers add to 20? Why?',
 see:{w:520,h:200,f:[
  ['Pick 5 odd numbers to make 30?',lbl(260,50,'1, 3, 5, 7, 9, 11','font-size="18"')],
  ['5 odds → odd sum.',lbl(260,100,'odd + odd + odd + odd + odd = odd','font-size="15"')],
  ['30 is even → impossible!',lbl(260,150,'impossible — proved by parity','font-weight="700" fill="'+OR+'"')]]},
 seeNote:'Parity can prove impossibility.',
 do:{title:'Puzzle check',mat:'Number cards 1–10',steps:['Try to pick 3 odd cards summing to 16.','Explain why it fails.'],obs:'Always odd.',why:'Parity.',lab:false},
 memo:'"Check parity before you try."',
 miscon:['"If I can\'t find it, maybe I tried wrong." Parity can prove none exists.'],
 terms:['Impossible','Proof','Parity argument'],
 q:{q:'Sum of 7 odd numbers is:',o:['always even','always odd','sometimes odd','zero'],a:1,why:'Odd count of odds.'},
 exam:'Explain impossibility using parity: 2 marks.'},

{id:'q3',num:'6.3',title:'Magic squares',
 intro:'Place 1 to 9 in a 3 × 3 grid so every row, column and diagonal has the same sum.',
 obj:'Build and analyse 3 × 3 magic squares.',
 prior:'6.1.',
 simple:'A magic square has the same sum (magic sum) in every row, column and both diagonals. For 1 to 9: total = 45, three rows → each row = 15. The centre must be 5 (it is in 4 lines). Even numbers go in the corners, odd numbers in the middle of the edges. One solution: 2 7 6 / 9 5 1 / 4 3 8 (the ancient Lo Shu square).',
 detail:'The magic sum of a 3 × 3 square = 3 × centre. Indian mathematician Narayana Pandita (14th century) wrote a full book on magic squares. The 4 × 4 magic square at the Parshvanath temple in Khajuraho (10th century) has magic sum 34 — even more lines add to 34!',
 real:'A 4 × 4 magic square is carved at the Parshvanath Jain temple, Khajuraho.',
 apply:'Why must the centre of a 1–9 magic square be 5?',
 see:{w:520,h:200,f:[
  ['Empty 3 × 3 grid; numbers 1–9.',sq3(60,25,Array(9).fill(null))],
  ['Centre = 5, corners even.',sq3(60,25,[2,null,6,null,5,null,4,null,8],50,[4])],
  ['Every line sums to 15.',sq3(300,25,LO)+lbl(380,195,'magic sum 15','font-weight="700"')]]},
 seeNote:'Magic sum = 3 × centre.',
 do:{title:'Make your own',mat:'Number cards 1–9',steps:['Place 5 in the centre.','Try to complete it.'],obs:'8 solutions (rotations/reflections of one).',why:'Structure.',lab:true},
 memo:'"5 in the middle, evens in corners, 15 everywhere."',
 miscon:['"Many very different 3 × 3 squares exist with 1–9." Only one, up to rotation/reflection.'],
 terms:['Magic square','Magic sum','Lo Shu','Narayana Pandita'],
 q:{q:'Magic sum of a 3 × 3 square using 1–9:',o:['12','15','18','45'],a:1,why:'45 ÷ 3.'},
 exam:'Complete a magic square: 3 marks.'},

{id:'q4',num:'6.4',title:'Changing magic squares',
 intro:'Add 1 to every number in a magic square. Is it still magic?',
 obj:'Create new magic squares from old ones.',
 prior:'6.3.',
 simple:'Adding the same number to every cell keeps the square magic; the magic sum increases by 3 × that number (each line has 3 cells). 1–9 square + 1 → 2–10 square with sum 18. Multiplying every cell by the same number keeps it magic; the magic sum gets multiplied too: × 5 → sum 75.',
 detail:'Rotating or reflecting a magic square gives another magic square. Using letter-numbers: if the centre is c, the magic sum is 3c — a general property that letter-numbers help us prove.',
 real:'Puzzle books create many magic squares from one by these tricks.',
 apply:'Make a magic square from 11 to 19. What is its magic sum?',
 see:{w:520,h:200,f:[
  ['Lo Shu (sum 15).',sq3(40,25,LO,44)],
  ['+ 1 to every cell → sum 18.',sq3(200,25,LO.map(v=>v+1),44)],
  ['× 5 → sum 75.',sq3(360,25,LO.map(v=>v*5),44)+lbl(260,190,'still magic!','font-weight="700"')]]},
 seeNote:'Add or multiply every cell: still magic.',
 do:{title:'Transform',mat:'Lo Shu square',steps:['Add 10 to every cell.','Check sums.'],obs:'Sum 45.',why:'+3 × 10.',lab:false},
 memo:'"Same change everywhere keeps the magic."',
 miscon:['"Adding 1 to each cell adds 1 to the magic sum." It adds 3.'],
 terms:['Transform','Rotate','Reflect'],
 q:{q:'Add 4 to each cell of a sum-15 square. New sum:',o:['19','27','60','15'],a:1,why:'15 + 12.'},
 exam:'New magic square from old: 2 marks.'},

{id:'q5',num:'6.5',title:'Digit sums and divisibility by 3 and 9',
 intro:'Is 4,71,282 divisible by 9? Can you tell in 5 seconds?',
 obj:'Use digit sums to test divisibility by 3 and 9.',
 prior:'Class 6: digit sums; divisibility.',
 simple:'A number is divisible by 3 if the sum of its digits is divisible by 3; divisible by 9 if the digit sum is divisible by 9. 4,71,282 → 4 + 7 + 1 + 2 + 8 + 2 = 24 → divisible by 3 but not 9.',
 detail:'Why? 10 = 9 + 1, 100 = 99 + 1, 1000 = 999 + 1… so a number = (multiple of 9) + (digit sum). Example: 342 = 3 × 99 + 4 × 9 + (3 + 4 + 2). Repeat the digit sum until one digit (digital root): divisible by 9 ⇔ digital root 9.',
 real:'Checking bills: a wrong total often has the wrong digit sum.',
 apply:'Is 5,13,927 divisible by 3? By 9?',
 see:{w:520,h:200,f:[
  ['4,71,282',lbl(260,50,'4,71,282','font-size="22"')],
  ['Digit sum = 24.',lbl(260,100,'4 + 7 + 1 + 2 + 8 + 2 = 24','font-size="16"')],
  ['24 ÷ 3 ✓, 24 ÷ 9 ✗.',lbl(260,150,'divisible by 3, not by 9','font-weight="700"')]]},
 seeNote:'10 = 9 + 1 makes it work.',
 do:{title:'Quick test',mat:'Car number plates',steps:['Test 10 plate numbers for 3 and 9.'],obs:'About 1 in 3 divisible by 3.',why:'Digit sum.',lab:false},
 memo:'"Add the digits; check 3 and 9."',
 miscon:['"Divisible by 3 means last digit 3." Use digit sum.'],
 terms:['Digit sum','Digital root','Divisible'],
 q:{q:'Which is divisible by 9?',o:['3,456','2,345','1,234','5,678'],a:0,why:'18.'},
 exam:'Divisibility tests: 2 marks.'},

{id:'q6',num:'6.6',title:'Letter puzzles (cryptarithms)',
 intro:'In AB + BA = 99 (A, B digits, A > B), how many answers are there?',
 obj:'Solve simple cryptarithms using place value and reasoning.',
 prior:'Place value; 6.5.',
 simple:'In a cryptarithm, letters stand for digits (different letters, different digits). AB means 10A + B. AB + BA = 10A + B + 10B + A = 11(A + B) = 99 → A + B = 9: e.g. 54 + 45, 72 + 27, 81 + 18, 63 + 36.',
 detail:'Strategy: use place value to write each word as an expression, then reason about carries and parity. Puzzle: K2 × 3 = 2K1? Try digits systematically. Famous: SEND + MORE = MONEY (M must be 1).',
 real:'Cryptarithms appear in maths olympiads and puzzle columns.',
 apply:'Find all two-digit AB with AB − BA = 27.',
 see:{w:520,h:200,f:[
  ['AB + BA = 99',lbl(260,50,'AB + BA = 99','font-size="20"')],
  ['= 10A + B + 10B + A = 11(A + B)',lbl(260,100,'11(A + B) = 99','font-size="16"')],
  ['A + B = 9 → 54 + 45, 72 + 27 …',lbl(260,150,'A + B = 9','font-weight="700"')]]},
 seeNote:'Place value turns words into expressions.',
 do:{title:'Make one',mat:'Notebook',steps:['Write a 2-digit addition and replace digits by letters.','Swap with a friend to solve.'],obs:'Reasoning puzzles.',why:'Place value.',lab:false},
 memo:'"AB = 10A + B."',
 miscon:['"AB means A × B." It means 10A + B.'],
 terms:['Cryptarithm','Place value','Carry'],
 q:{q:'If AB + BA = 77, then A + B =',o:['7','11','77','14'],a:0,why:'11(A + B) = 77.'},
 exam:'Solve a cryptarithm: 3 marks.'}
];

const CARDS=[['Parity','Even or odd.'],['Sums','Odd + odd = even; even + odd = odd.'],['Products','Odd × odd = odd; even × any = even.'],['Many odds','Odd count of odds → odd sum.'],['Parity proof','Can show a puzzle is impossible.'],['Magic square','Same sum in rows, columns, diagonals.'],['1–9 square','Sum 15; centre 5; Lo Shu.'],['Transform','+k each cell → sum + 3k; ×k → sum × k.'],['Divisible by 3/9','Digit sum divisible by 3/9.'],['Cryptarithm','AB = 10A + B.']];

const Q=[
 {lv:1,q:'odd + even =',o:['even','odd','zero','can\'t tell'],a:1,w:'Rule.'},
 {lv:1,q:'Centre of a 1–9 magic square:',o:['1','5','9','4'],a:1,w:'Middle number.'},
 {lv:1,q:'Digit sum of 3,456:',o:['18','15','12','9'],a:0,w:'3+4+5+6.'},
 {lv:2,q:'odd × odd =',o:['even','odd','zero','negative'],a:1,w:'Rule.'},
 {lv:2,q:'Which is divisible by 3?',o:['2,111','4,101','5,230','7,001'],a:1,w:'4+1+0+1 = 6.'},
 {lv:2,q:'Magic sum after adding 2 to each cell of sum-15 square:',o:['17','21','30','15'],a:1,w:'+6.'},
 {lv:3,q:'Can 4 odd numbers add to 21?',o:['yes','no','sometimes','only if equal'],a:1,w:'4 odds → even.'},
 {lv:3,q:'AB + BA = 121; A + B =',o:['11','12','10','9'],a:0,w:'121 ÷ 11.'},
 {lv:4,q:'Multiply each cell of a sum-15 square by 3. New sum:',o:['18','45','24','15'],a:1,w:'×3.'},
 {lv:4,q:'Why is the 3 × 3 magic sum = 3 × centre?',o:['always true by algebra','only for 1–9','never','by luck'],a:0,w:'General property.'},
 {lv:5,open:true,m:3,q:'Complete the magic square: top row 8, ?, 6; middle ?, 5, ?; bottom 4, ?, 2.',ans:['Magic sum 15 (centre 5) (1)','Top middle 1; bottom middle 9 (1)','Middle row 3, 5, 7 (1)']},
 {lv:5,open:true,m:2,q:'Explain why five odd numbers cannot add to 50.',ans:['Sum of an odd number of odd numbers is odd (1)','50 is even, so impossible (1)']}
];

const ONEMIN=['Parity rules for sums and products.','Parity proves impossibility.','Magic squares: sum 15, centre 5.','Transform: add or multiply every cell.','Digit sum tests for 3 and 9.','Cryptarithms: AB = 10A + B.'];
const KEYS=[['parity',/parity|odd|even/i],['magic square',/magic/i],['centre',/centre|center|5/i],['digit sum',/digit sum|divisib/i],['cryptarithm',/cryptarithm|10A/i]];

/* ---------- lab ---------- */
let set=1,grid=Array(9).fill(null),pick=null;
function nums(){return set===1?[1,2,3,4,5,6,7,8,9]:set===2?[2,3,4,5,6,7,8,9,10]:[5,10,15,20,25,30,35,40,45]}
function target(){return nums().reduce((a,b)=>a+b,0)/3}
const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function pal(){$('#qPal').innerHTML=nums().map(v=>`<button class="btn" data-n="${v}" ${grid.includes(v)?'disabled style="opacity:.35"':''}${pick===v?' style="outline:3px solid #b04a1f"':''}>${v}</button>`).join('')}
function draw(){const u=80,x0=110,y0=20;let s='';grid.forEach((v,i)=>{const r=Math.floor(i/3),c=i%3;s+=`<rect data-cell="${i}" x="${x0+c*u}" y="${y0+r*u}" width="${u}" height="${u}" fill="#fff" fill-opacity="0.01" stroke="${ink}" stroke-width="2"/>`+(v!==null?T(x0+c*u+u/2,y0+r*u+u/2+9,String(v),'font-size="28" font-weight="700" pointer-events="none"'):'')});
 const tg=target();LINES.forEach((L,k)=>{const vals=L.map(i=>grid[i]);if(vals.some(v=>v===null))return;const sm=vals.reduce((a,b)=>a+b,0);const ok=sm===tg;let x,y;if(k<3){x=x0+3*u+20;y=y0+k*u+u/2+5}else if(k<6){x=x0+(k-3)*u+u/2;y=y0+3*u+22}else if(k===6){x=x0+3*u+20;y=y0+3*u+20}else{x=x0-20;y=y0+3*u+20}s+=T(x,y,String(sm),`font-size="14" font-weight="700" fill="${ok?GN:OR}"`)});
 $('#qSvg').innerHTML=s;pal();const full=grid.every(v=>v!==null);const good=full&&LINES.every(L=>L.reduce((a,i)=>a+grid[i],0)===tg);
 $('#qOut').innerHTML=good?`<p class="fb ok">Magic! Every line adds to ${tg}.</p>`:`<p>Target sum: <b>${tg}</b>. Green sums are correct; orange are not. ${pick!==null?`Selected: ${pick} — tap a cell.`:'Tap a number below.'}</p>`}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('click',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.cell!==undefined&&t.closest&&t.closest('#qSvg')){const i=+t.dataset.cell;if(grid[i]!==null){grid[i]=null}else if(pick!==null){grid[i]=pick;pick=null}draw()}})}
function labClick(b){if(b.dataset&&b.dataset.n){pick=+b.dataset.n;draw();return true}if(b.id==='qClear'){grid=Array(9).fill(null);pick=null;draw();return true}
 if(b.id==='qHint'){const c=nums()[4];if(grid.includes(c))grid[grid.indexOf(c)]=null;grid[4]=c;draw();$('#qOut').innerHTML+=`<p class="note">The centre must be ${c} (the middle number), because it lies on 4 lines. Put the even-position numbers in the corners.</p>`;return true}
 if(b.id==='qSolve'){const N=nums();grid=LO.map(v=>N[v-1]);pick=null;draw();return true}return false}
function labChange(t){if(t.id==='qSet'){set=+t.value;grid=Array(9).fill(null);pick=null;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
