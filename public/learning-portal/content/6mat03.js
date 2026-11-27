/* Rai Plus content pack: Class 6 Mathematics (Ganita Prakash), Chapter 3 – Number Play. */
RP.register({key:'6mat03',cls:'6',subject:'Mathematics',ch:'3',title:"Number Play",color:'#6a4fb3',
crumb:"Class 6 Mathematics · Ganita Prakash",h1:"Chapter 3: Number Play",sub:"Numbers that tell us things, supercells, digit sums, palindromes, Kaprekar's 6174, estimation and the Collatz conjecture.",heroLabel:"Digits swirling into 6174",labName:'Number machines',
theme:"\n:root{--g:light-dark(#6a4fb3,#c3b3f2);--g2:light-dark(#f1edfb,#130f22);--line:light-dark(#dcd3f3,#30285a);--bg:light-dark(#ffffff,#0b0916);--card:light-dark(#ffffff,#110e20);\n--ink:light-dark(#1b1338,#ebe6fa);--mute:light-dark(#5a5080,#b8afd6);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#4e3891}\n",
labHTML:`  <h2>Number machines</h2>
  <p>Type a starting number, choose a machine and press Run. Watch each step.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="nSvg" viewBox="0 0 460 300" role="img" aria-label="Steps of the number machine" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Machine<select id="nM"><option value="kap">Kaprekar (4-digit) → 6174</option><option value="pal">Reverse and add → palindrome</option><option value="col">Collatz: halve or 3n+1</option><option value="dig">Digit sum until one digit</option></select></label></div><div class="ctrl"><label>Start number<input id="nStart" type="number" value="3524" style="width:7em"></label><button class="btn" id="nRun">Run</button></div><div class="box y" id="nOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#6a4fb3',LABNAME='Number machines',MIND_CENTER='Number play';
const PU='#6a4fb3',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,t,c=PU,w=50)=>`<rect x="${x-w/2}" y="${y-18}" width="${w}" height="30" rx="6" fill="${c}" opacity=".15" stroke="${c}"/>`+T(x,y+3,String(t),'font-size="14" font-weight="700"');
function heroDraw(){return `<text x="60" y="60" font-size="30" fill="#fff" opacity=".6">3524</text><text x="180" y="90" font-size="30" fill="#fff" opacity=".8">3087</text><text x="300" y="60" font-size="36" fill="#fff">6174</text>`}
const HERO=heroDraw;
const MIND=[['Numbers tell us things',100,50],['Supercells',420,50],['Digit sums & palindromes',90,150],['Kaprekar 6174',430,150],['Estimation',110,250],['Collatz',410,250]];

const C=[
{id:'n1',num:'3.1',title:'Numbers can tell us things',
 intro:'Children stand in a line; each says how many neighbours are taller. Can you work out who is tallest?',
 obj:'Use numbers to describe arrangements, and reason about them.',
 prior:'Counting and comparing numbers.',
 simple:'In a row of children, each child says a number: how many of their immediate neighbours (left and right) are taller. A child at an end has only one neighbour, so says 0 or 1; others say 0, 1 or 2. A child who says 0 is taller than all neighbours. Numbers like these carry information we can reason about.',
 detail:'Puzzles: can the numbers be 2, 2, 2 in a row? No — if both neighbours of the middle child are taller, those neighbours can\'t also each have two taller neighbours at the ends. Reasoning like this — "can this happen? why not?" — is the heart of number play.',
 real:'In a queue at the canteen, the tallest student always says 0.',
 apply:'Arrange 5 children so that the numbers read 1, 1, 1, 1, 1. Is it possible?',
 see:{w:520,h:200,f:[
  ['Five children of different heights.',[60,110,80,140,95].map((h,i)=>`<rect x="${70+i*80}" y="${170-h}" width="40" height="${h}" rx="6" fill="${PU}" opacity=".5"/>`).join('')],
  ['Each counts taller neighbours.',['1','0','1','0','1'].map((t,i)=>T(90+i*80,190,t,'font-size="16" font-weight="700"')).join('')],
  ['A 0 means taller than both neighbours.',lbl(330,20,'0 → taller than neighbours','font-weight="700"')]]},
 seeNote:'Numbers carry clues.',
 do:{title:'Class line-up',mat:'5–7 classmates',steps:['Stand in a line.','Each says how many neighbours are taller.','Rearrange to get all 1s or as many 0s as possible.'],obs:'Some patterns are impossible.',why:'Reasoning.',lab:false},
 memo:'"0 means a local tallest."',
 miscon:['"Any list of 0, 1, 2 is possible." Some are impossible.'],
 terms:['Neighbour','Arrangement','Reasoning'],
 q:{q:'A child at the end of the line can say:',o:['0 or 1 only','0, 1 or 2','only 2','only 0'],a:0,why:'One neighbour.'},
 exam:'Reason about an arrangement: 2 marks.'},

{id:'n2',num:'3.2',title:'Supercells',
 intro:'In a table of numbers, which cells are bigger than all their neighbours?',
 obj:'Find supercells in a grid and reason about how many there can be.',
 prior:'Comparing numbers.',
 simple:'In a grid of numbers, a cell is a supercell if its number is greater than all its neighbours (the cells directly left, right, above and below). Colour the supercells. The largest number in the grid is always a supercell.',
 detail:'Questions to explore: in a 1-row table, can every alternate cell be a supercell? Can two neighbouring cells both be supercells? (No: one of them is smaller.) What is the most supercells a 4 × 4 grid can have? (8, in a chessboard pattern.)',
 real:'On a map of hill heights, peaks are like supercells.',
 apply:'Why can\'t two neighbouring cells both be supercells?',
 see:{w:520,h:220,f:[
  ['A grid of numbers.',(()=>{const g=[[200,577,626],[345,814,108],[623,421,900]];let s='';g.forEach((r,i)=>r.forEach((v,j)=>{s+=`<rect x="${160+j*70}" y="${30+i*50}" width="70" height="50" fill="none" stroke="${GR}"/>`+T(195+j*70,60+i*50,String(v),'font-size="15"')}));return s})()],
  ['814 beats 577, 345, 108 and 421.',`<rect x="230" y="80" width="70" height="50" fill="${OR}" opacity=".25"/>`],
  ['Supercells: 814, 626, 900, 623.',`<rect x="300" y="30" width="70" height="50" fill="${OR}" opacity=".25"/><rect x="300" y="130" width="70" height="50" fill="${OR}" opacity=".25"/><rect x="160" y="130" width="70" height="50" fill="${OR}" opacity=".25"/>`+lbl(260,210,'supercell: bigger than all neighbours','font-weight="700"')]]},
 seeNote:'The biggest number is always a supercell.',
 do:{title:'Make supercells',mat:'Grid paper',steps:['Fill a 3 × 3 grid so exactly 1 cell is a supercell.','Now try for 4 or 5.'],obs:'5 is the most in 3 × 3 (corners + centre).',why:'Supercells can\'t touch.',lab:true},
 memo:'"Supercells never touch."',
 miscon:['"Only the biggest number is a supercell." There can be many.'],
 terms:['Supercell','Grid','Neighbour'],
 q:{q:'The largest number in a grid is:',o:['never a supercell','always a supercell','sometimes','only at a corner'],a:1,why:'Bigger than everything.'},
 exam:'Find supercells: 2 marks.'},

{id:'n3',num:'3.3',title:'Digit sums and palindromes',
 intro:'Reverse 47 and add: 47 + 74 = 121. Read it backwards!',
 obj:'Explore digit sums and palindromic numbers.',
 prior:'Place value.',
 simple:'The digit sum of a number is the sum of its digits: 368 → 3+6+8 = 17. A palindrome reads the same forwards and backwards: 121, 3443, 55. Reverse-and-add: take a number, add its reverse, repeat; most numbers soon give a palindrome (e.g. 39 + 93 = 132, 132 + 231 = 363).',
 detail:'Numbers with the same digit sum often show patterns; for example, numbers whose digit sum is divisible by 3 are themselves divisible by 3. Palindromes appear in dates (e.g. 12-02-2021 written 12022021), car numbers and words (malayalam). Some numbers, like 196, take very long (or maybe never) to become palindromes with reverse-and-add — nobody knows for sure.',
 real:'Some odometers show palindromes like 13531 km.',
 apply:'Use reverse-and-add on 68 until you get a palindrome.',
 see:{w:520,h:200,f:[
  ['Start: 39.',box(80,80,39)],
  ['39 + 93 = 132.',box(200,80,132,BL,60)],
  ['132 + 231 = 363: a palindrome!',box(340,80,363,GN,60)+lbl(340,140,'363 ↔ 363','font-weight="700"')]]},
 seeNote:'Read it both ways.',
 do:{title:'Palindrome race',mat:'Paper',steps:['Each pick a 2-digit number.','Reverse and add until a palindrome.','Who needs the most steps?'],obs:'Most finish in 1–3 steps; 89 needs 24!',why:'Number behaviour.',lab:true},
 memo:'"Reverse, add, repeat."',
 miscon:['"Every number becomes a palindrome in one step." Some take many steps.'],
 terms:['Digit sum','Palindrome','Reverse'],
 q:{q:'Which is a palindrome?',o:['1231','4554','6781','1012'],a:1,why:'Same both ways.'},
 exam:'Reverse-and-add steps: 2 marks.'},

{id:'n4',num:'3.4',title:'The magic number of Kaprekar',
 intro:'Take any 4-digit number (not all digits the same). Biggest − smallest, again and again… What happens?',
 obj:'Carry out Kaprekar\'s routine and see it reach 6174.',
 prior:'Subtraction, place value.',
 simple:'D. R. Kaprekar, a mathematics teacher from Devlali, Maharashtra, discovered this: take a 4-digit number using at least two different digits. Arrange its digits to make the largest and the smallest numbers. Subtract. Repeat with the answer. You will always reach 6174 within 7 steps, and then 7641 − 1467 = 6174 forever. 6174 is called Kaprekar\'s constant.',
 detail:'Keep leading zeros: if you get 999, treat it as 0999 (largest 9990, smallest 0999). For 3-digit numbers, the routine reaches 495.',
 real:'Kaprekar discovered this in 1949; mathematicians around the world still study it.',
 apply:'Start from 2026. How many steps to 6174?',
 see:{w:520,h:200,f:[
  ['3524 → 5432 − 2345 = 3087.',box(70,60,3524)+lbl(250,65,'5432 − 2345 = 3087')],
  ['3087 → 8730 − 0378 = 8352.',lbl(250,105,'8730 − 0378 = 8352')],
  ['8352 → 8532 − 2358 = 6174. Then it stays.',lbl(250,145,'8532 − 2358 = 6174')+box(440,145,6174,OR,60)]]},
 seeNote:'Always 6174 within 7 steps.',
 do:{title:'6174 hunt',mat:'Paper, a partner',steps:['Each choose a 4-digit number.','Run Kaprekar\'s routine.','Count the steps.'],obs:'Both reach 6174.',why:'Kaprekar\'s constant.',lab:true},
 memo:'"Big minus small leads to 6174."',
 miscon:['"Any 4-digit number works." Not all digits the same (e.g. 1111 gives 0).'],
 terms:['Kaprekar\'s constant (6174)','Largest/smallest arrangement'],
 q:{q:'Kaprekar\'s constant for 4-digit numbers:',o:['495','1089','6174','9999'],a:2,why:'Reached in ≤ 7 steps.'},
 exam:'Carry out Kaprekar\'s routine: 3 marks.'},

{id:'n5',num:'3.5',title:'Estimation and the Collatz conjecture',
 intro:'How many times does your heart beat in a day? Roughly!',
 obj:'Estimate sensibly and explore the Collatz conjecture.',
 prior:'Multiplication.',
 simple:'Estimation means finding a sensible approximate answer quickly, using rounded numbers: 72 beats a minute ≈ 70 × 60 × 24 ≈ 1,00,000 beats a day. Collatz conjecture: start with any number. If it is even, halve it; if it is odd, multiply by 3 and add 1. Repeat. It seems always to reach 1 (then 4, 2, 1 repeats). Nobody has proved it is true for every number!',
 detail:'Collatz from 6: 6, 3, 10, 5, 16, 8, 4, 2, 1. From 27 it takes 111 steps and climbs to 9232 before coming down. A conjecture is a statement believed true but not yet proven. Estimation checks: digit sums, clocks and calendars give quick ways to test answers.',
 real:'Shopkeepers estimate a bill by rounding prices.',
 apply:'Run Collatz from 7. Highest number reached?',
 see:{w:520,h:220,f:[
  ['Start at 6.',box(50,60,6)],
  ['Even → halve; odd → 3n + 1.',[3,10,5,16,8].map((v,i)=>box(120+i*70,60,v,i%2?BL:PU)).join('')],
  ['…4, 2, 1. Does every number get to 1? Unknown!',[4,2,1].map((v,i)=>box(190+i*70,150,v,GN)).join('')+lbl(260,205,'an open problem in mathematics','font-weight="700"')]]},
 seeNote:'Some easy questions are unsolved.',
 do:{title:'Estimate it',mat:'Notebook',steps:['Estimate the number of students in your school.','Count roughly by classes.','Compare with the real number.'],obs:'Close, not exact.',why:'Rounding.',lab:false},
 memo:'"Even halve, odd 3n+1."',
 miscon:['"Mathematics has answered every question." Collatz is still open.'],
 terms:['Estimation','Rounding','Conjecture','Collatz'],
 q:{q:'Collatz: next after 5 is:',o:['2.5','10','16','15'],a:2,why:'3×5 + 1.'},
 exam:'Collatz sequence from a number: 2 marks.'}
];

const CARDS=[['Taller neighbours','0 = taller than both neighbours.'],['Supercell','Greater than all neighbours.'],['Supercells','Never touch; largest is always one.'],['Digit sum','Sum of digits: 368 → 17.'],['Palindrome','Same both ways: 1221.'],['Reverse and add','Often gives a palindrome.'],['Kaprekar','Largest − smallest → 6174 (≤ 7 steps).'],['3-digit Kaprekar','Reaches 495.'],['Estimation','Round, then calculate.'],['Collatz','Even ÷ 2, odd 3n+1; seems always to reach 1.'],['Conjecture','Believed true, not proved.']];

const Q=[
 {lv:1,q:'Digit sum of 4527:',o:['16','18','17','20'],a:1,w:'4+5+2+7.'},
 {lv:1,q:'Which is a palindrome?',o:['1234','5665','5656','1011'],a:1,w:'Reads same both ways.'},
 {lv:1,q:'Kaprekar\'s constant:',o:['6174','4176','1089','495'],a:0,w:'6174.'},
 {lv:2,q:'Collatz from 10: next is',o:['5','31','20','11'],a:0,w:'Even, halve.'},
 {lv:2,q:'Largest number with digits 3, 0, 7, 2:',o:['7320','7302','3720','2037'],a:0,w:'Descending.'},
 {lv:2,q:'Two neighbouring cells can both be supercells:',o:['always','never','sometimes','only in a row'],a:1,w:'One is smaller.'},
 {lv:3,q:'One Kaprekar step from 2111:',o:['2111−1112=999','2111−1121=990','1112−2111','2111'],a:0,w:'Largest 2111, smallest 1112.'},
 {lv:3,q:'Reverse-and-add on 57:',o:['132 → 363','132 → 264','121','75'],a:0,w:'57+75=132; 132+231=363.'},
 {lv:4,q:'Best estimate of 49 × 21:',o:['100','1000','10000','500'],a:1,w:'50 × 20.'},
 {lv:4,q:'Most supercells in a 3 × 3 grid:',o:['3','4','5','9'],a:2,w:'Corners and centre.'},
 {lv:5,open:true,m:3,q:'Apply Kaprekar\'s routine to 1234 until 6174.',ans:['4321−1234 = 3087 (1)','8730−0378 = 8352 (1)','8532−2358 = 6174 (1)']},
 {lv:5,open:true,m:3,q:'Write the Collatz sequence starting from 12.',ans:['12, 6, 3, 10, 5 (1)','16, 8, 4, 2, 1 (1)','Rule: even halve; odd 3n+1 (1)']}
];

const ONEMIN=['Numbers carry information: taller neighbours.','Supercells: larger than all neighbours.','Digit sums; palindromes; reverse and add.','Kaprekar: 6174 in ≤ 7 steps.','Estimate by rounding.','Collatz: open problem.'];
const KEYS=[['neighbours',/neighbour|taller/i],['supercell',/supercell/i],['palindrome',/palindrom/i],['digit sum',/digit sum/i],['6174',/6174|kaprekar/i],['estimate',/estimat|round/i],['Collatz',/collatz|3n/i]];

/* ---------- lab ---------- */
let mach='kap';
function digits(n,len){return String(n).padStart(len,'0').split('').map(Number)}
function run(start){const st=[];let n=start;
 if(mach==='kap'){if(n<1000||n>9999)return {err:'Enter a 4-digit number (1000–9999).'};if(new Set(String(n)).size===1)return {err:'Use at least two different digits.'};
  st.push([n,'start']);for(let i=0;i<8&&n!==6174;i++){const d=digits(n,4);const big=+d.slice().sort((a,b)=>b-a).join(''),sm=+d.slice().sort((a,b)=>a-b).join('');n=big-sm;st.push([n,`${big} − ${String(sm).padStart(4,'0')}`])}return {st,msg:`Reached 6174 in ${st.length-1} step${st.length-1===1?'':'s'}.`}}
 if(mach==='pal'){if(n<1||n>99999)return {err:'Enter a number from 1 to 99999.'};st.push([n,'start']);const isP=x=>String(x)===String(x).split('').reverse().join('');for(let i=0;i<24&&!(i>0&&isP(n));i++){const r=+String(n).split('').reverse().join('');st.push([n+r,`${n} + ${r}`]);n+=r}return {st,msg:isP(n)?`Palindrome ${n} after ${st.length-1} step(s).`:'No palindrome yet after 24 steps (try 196 — no one knows if it ever ends!).'}}
 if(mach==='col'){if(n<1||n>100000)return {err:'Enter a number from 1 to 100000.'};st.push([n,'start']);let mx=n;for(let i=0;i<200&&n!==1;i++){n=n%2?3*n+1:n/2;mx=Math.max(mx,n);st.push([n,n%2&&false?'':''])}return {st,msg:`Reached 1 in ${st.length-1} steps. Highest: ${mx}.`}}
 if(mach==='dig'){if(n<1)return {err:'Enter a positive number.'};st.push([n,'start']);while(n>9){const s=String(n).split('').map(Number);n=s.reduce((a,b)=>a+b,0);st.push([n,s.join('+')])}return {st,msg:`Single digit: ${n}.`}}}
function draw(r){let s='';if(!r||r.err){$('#nSvg').innerHTML=T(230,150,r?r.err:'Press Run','font-size="14"');$('#nOut').innerHTML=r&&r.err?`<p class="fb no">${r.err}</p>`:'';return}
 const st=r.st;if(mach==='col'&&st.length>12){const mx=Math.max(...st.map(x=>x[0]));const X=i=>30+i*400/(st.length-1),Y=v=>260-220*v/mx;s+=`<polyline points="${st.map((x,i)=>X(i).toFixed(1)+','+Y(x[0]).toFixed(1)).join(' ')}" fill="none" stroke="${PU}" stroke-width="2"/>`+st.map((x,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(x[0]).toFixed(1)}" r="2.5" fill="${x[0]%2?OR:PU}"/>`).join('')+T(230,285,'step →','font-size="12"')+T(60,Y(mx)-6,'max '+mx,'font-size="12"')}
 else{const show=st.slice(0,10);show.forEach((x,i)=>{const y=24+i*28;s+=T(110,y+5,x[1],'font-size="12" fill="#888"')+box(300,y,x[0],i===show.length-1?OR:PU,90)});if(st.length>10)s+=T(300,290,'…','font-size="14"')}
 $('#nSvg').innerHTML=s;$('#nOut').innerHTML=`<p class="fb ok">${r.msg}</p>`}
function labShow(){draw(run(+$('#nStart').value))}
function labInit(){}
function labClick(b){if(b.id==='nRun'){draw(run(Math.floor(+$('#nStart').value)));return true}return false}
function labChange(t){if(t.id==='nM'){mach=t.value;const d={kap:3524,pal:68,col:27,dig:98765};$('#nStart').value=d[mach];draw(run(d[mach]));return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
