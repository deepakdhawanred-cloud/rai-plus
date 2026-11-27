/* Rai Plus content pack: Class 8 Mathematics (Ganita Prakash), Chapter 1 – A Square and A Cube. */
RP.register({key:'8mat01',cls:'8',subject:'Mathematics',ch:'1',title:"A Square and A Cube",color:'#6a4fb3',
crumb:"Class 8 Mathematics · Ganita Prakash",h1:"Chapter 1: A Square and A Cube",sub:"The locker puzzle, square numbers and their patterns, square roots by prime factorisation and estimation, cubes, cube roots, and the taxicab number 1729.",heroLabel:"A square of tiles and a cube of blocks",labName:'Locker puzzle and square–cube lab',
theme:"\n:root{--g:light-dark(#6a4fb3,#c3b3ef);--g2:light-dark(#f1edfb,#120d20);--line:light-dark(#ddd4f4,#2f2650);--bg:light-dark(#ffffff,#0c0916);--card:light-dark(#ffffff,#130f20);\n--ink:light-dark(#1b1430,#ebe6f8);--mute:light-dark(#5a5078,#bcb2d8);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#52398f}\n",
labHTML:`  <h2>Locker puzzle and square–cube lab</h2>
  <p>Locker mode: 100 closed lockers, 100 people. Person k toggles every k-th locker (open ↔ close). Step through and see which lockers stay open. Checker mode: enter a number to see its prime factors grouped in pairs (square?) and triples (cube?).</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="qSvg" viewBox="0 0 460 320" role="img" aria-label="Lockers" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="qM"><option value="l">Locker puzzle</option><option value="c">Square / cube checker</option></select></label></div>
  <div class="ctrl" id="qL"><button class="btn" id="qStep">Next person</button> <button class="btn" id="qAll">All 100 people</button> <button class="btn" id="qRe">Reset</button></div>
  <div class="ctrl" id="qCk" style="display:none"><label>Number<input id="qN" type="number" value="1728" min="1" max="1000000" style="width:7em"></label> <button class="btn" id="qGo">Check</button></div>
  <div class="box y" id="qOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#6a4fb3',LABNAME='Locker puzzle and square–cube lab',MIND_CENTER='Squares & cubes';
const PU='#6a4fb3',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
function pf(n){const f=[];let d=2;while(n>1&&d*d<=n){while(n%d===0){f.push(d);n/=d}d++}if(n>1)f.push(n);return f}
function sq(x,y,n,c,u=14){let s='';for(let i=0;i<n;i++)for(let j=0;j<n;j++)s+=`<rect x="${x+i*u}" y="${y+j*u}" width="${u}" height="${u}" fill="${c}" fill-opacity=".35" stroke="${c}" stroke-width=".7"/>`;return s}
function cube(x,y,n,u=16){let s='';const dx=u*.5,dy=u*.4;for(let k=n-1;k>=0;k--)for(let j=0;j<n;j++)for(let i=0;i<n;i++){const X=x+i*u+k*dx,Y=y-j*u-k*dy;s+=`<path d="M${X} ${Y} h${u} v${-u} h${-u}z" fill="#cbbdf0" stroke="${PU}" stroke-width=".6"/><path d="M${X} ${Y-u} l${dx} ${-dy} h${u} l${-dx} ${dy}z" fill="#e6defa" stroke="${PU}" stroke-width=".6"/><path d="M${X+u} ${Y} l${dx} ${-dy} v${-u} l${-dx} ${dy}z" fill="#a58fe0" stroke="${PU}" stroke-width=".6"/>`}return s}
function heroDraw(){let s='';for(let i=0;i<3;i++)for(let j=0;j<3;j++)s+=`<rect x="${80+i*22}" y="${50+j*22}" width="22" height="22" fill="none" stroke="#fff" stroke-width="2"/>`;return s+`<path d="M230 120 h60 v-60 h-60z M230 60 l25 -20 h60 l-25 20 M290 120 l25 -20 v-60" fill="none" stroke="#fff" stroke-width="2.5"/>`}
const HERO=heroDraw;
const MIND=[['Locker puzzle',100,50],['Square numbers',420,50],['Square roots',90,150],['Cubes',430,150],['Cube roots',110,250],['1729 & patterns',410,250]];

const C=[
{id:'q1',num:'1.1',title:'The locker puzzle',
 intro:'100 lockers, all closed. Person 1 opens all. Person 2 toggles every 2nd. Person 3 toggles every 3rd… up to person 100. Which lockers end up open?',
 obj:'Solve the locker puzzle using factors and discover perfect squares.',
 prior:'Class 6–7: factors, primes.',
 simple:'Locker n is toggled once for each factor of n. Locker 6: factors 1, 2, 3, 6 → toggled 4 times → closed. Locker 9: factors 1, 3, 9 → toggled 3 times → open. A locker stays open only if it has an odd number of factors. Only perfect squares (1, 4, 9, 16, …, 100) have an odd number of factors.',
 detail:'Why? Factors come in pairs: 12 = 1 × 12 = 2 × 6 = 3 × 4. For a square like 36, one pair repeats: 6 × 6, so 6 is counted once and the total is odd. So 10 lockers stay open: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100.',
 real:'Puzzles like this train the habit of looking for a pattern before brute-force counting.',
 apply:'Is locker 50 open or closed? Locker 64?',
 see:{w:520,h:220,f:[
  ['12: factors in pairs → even count.',lbl(130,50,'12 = 1×12 = 2×6 = 3×4','font-size="15"')+lbl(130,80,'6 factors → closed','fill="'+OR+'"')],
  ['36: 6 × 6 pairs with itself → odd count.',lbl(390,50,'36 = 1×36 = 2×18 = 3×12 = 4×9 = 6×6','font-size="12"')+lbl(390,80,'9 factors → open','fill="'+GN+'"')],
  ['Open lockers are perfect squares.',[1,4,9,16,25,36,49,64,81,100].map((v,k)=>`<rect x="${30+k*47}" y="130" width="40" height="55" rx="4" fill="${GN}" fill-opacity=".3" stroke="${GN}"/>`+lbl(50+k*47,163,String(v))).join('')]]},
 seeNote:'Odd number of factors ⇔ perfect square.',
 do:{title:'Act it out',mat:'20 students as lockers (stand/sit)',steps:['Students 1–20 are lockers.','Callers toggle multiples of 1, 2, 3, … 20.'],obs:'1, 4, 9, 16 standing.',why:'Squares.',lab:true},
 memo:'"Squares stay open."',
 miscon:['"Prime-numbered lockers stay open." Primes have exactly 2 factors → closed.'],
 terms:['Factor','Factor pair','Perfect square','Toggle'],
 q:{q:'How many of the 100 lockers stay open?',o:['50','25','10','1'],a:2,why:'Squares up to 100.'},
 exam:'Explain the locker puzzle: 3 marks.'},

{id:'q2',num:'1.2',title:'Square numbers and their patterns',
 intro:'Why is 1 + 3 + 5 + 7 always a square?',
 obj:'Recognise square numbers and their properties and patterns.',
 prior:'1.1.',
 simple:'A square number is n × n = n². 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, … Patterns: the sum of the first n odd numbers is n² (1 + 3 + 5 + 7 = 16). Squares end only in 0, 1, 4, 5, 6 or 9 — a number ending in 2, 3, 7 or 8 is never a perfect square.',
 detail:'Between n² and (n + 1)² there are 2n non-square numbers (between 16 and 25: 8 numbers). A number ending in an odd number of zeros (like 1000) is not a square. Squares of numbers ending in 5: 25² = 625, 35² = 1225 (n(n + 1) followed by 25). Adding the next odd number gives the next square: an L-shaped strip around a square grid.',
 real:'Square tiles: a 12 × 12 floor needs 144 tiles.',
 apply:'Without calculating, can 2678 be a perfect square? Why?',
 see:{w:520,h:220,f:[
  ['1, then add 3…',sq(60,40,1,PU,30)+sq(160,40,2,PU,30)],
  ['…add 5, add 7…',sq(260,40,3,PU,30)],
  ['1 + 3 + 5 + 7 = 16 = 4².',sq(370,40,4,GN,30)+lbl(260,200,'sum of first n odd numbers = n²','font-weight="700"')]]},
 seeNote:'Odd numbers build squares.',
 do:{title:'L-strips',mat:'Square grid paper',steps:['Shade 1 square; add an L of 3, then 5, then 7.'],obs:'Squares grow.',why:'Odd-number pattern.',lab:false},
 memo:'"Squares end in 0, 1, 4, 5, 6, 9."',
 miscon:['"2² = 4, so n² = 2n." Square means n × n, not 2 × n.'],
 terms:['Square number','n²','Unit digit','Odd numbers'],
 q:{q:'Which cannot be a perfect square?',o:['1296','3457','2025','4096'],a:1,why:'Ends in 7.'},
 exam:'Properties of squares: 2 marks.'},

{id:'q3',num:'1.3',title:'Square roots',
 intro:'A square garden has area 784 m². How long is each side?',
 obj:'Find square roots by prime factorisation, repeated subtraction and estimation.',
 prior:'1.2; prime factorisation.',
 simple:'Square root is the reverse of squaring: √49 = 7 because 7² = 49. Prime factorisation: 784 = 2 × 2 × 2 × 2 × 7 × 7 — group into pairs (2 × 2)(2 × 2)(7 × 7); take one from each pair: 2 × 2 × 7 = 28. So √784 = 28.',
 detail:'If a prime has no partner, the number is not a perfect square: 72 = 2 × 2 × 2 × 3 × 3 — one 2 is left over; multiply by 2 to get 144 = 12². Repeated subtraction of odd numbers: 25 − 1 − 3 − 5 − 7 − 9 = 0 in 5 steps → √25 = 5. Estimation: √300 lies between 17 (289) and 18 (324), closer to 17.',
 real:'Carpenters find the side of a square table top from its area.',
 apply:'Find √1296 by prime factorisation. Estimate √500 to the nearest whole number.',
 see:{w:520,h:220,f:[
  ['784 = 2·2·2·2·7·7',lbl(260,40,'784 = 2 × 2 × 2 × 2 × 7 × 7','font-size="18"')],
  ['Pair them up.',lbl(260,95,'(2 × 2)(2 × 2)(7 × 7)','font-size="18" fill="'+PU+'"')],
  ['One from each pair: 2 × 2 × 7 = 28.',lbl(260,155,'√784 = 2 × 2 × 7 = 28','font-size="20" font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Pairs → square root.',
 do:{title:'Odd subtraction',mat:'Notebook',steps:['Find √81 and √121 by subtracting 1, 3, 5, …'],obs:'9 and 11 steps.',why:'Odd-number pattern.',lab:false},
 memo:'"Pair the primes, pick one from each."',
 miscon:['"√ means divide by 2." √16 = 4, not 8.'],
 terms:['Square root (√)','Prime factorisation','Estimate'],
 q:{q:'√1764 =',o:['42','44','38','48'],a:0,why:'42² = 1764.'},
 exam:'Square root by prime factors: 3 marks.'},

{id:'q4',num:'1.4',title:'Cube numbers',
 intro:'How many small cubes build a 4 × 4 × 4 block?',
 obj:'Recognise cube numbers and their patterns.',
 prior:'1.2; volume.',
 simple:'A cube number is n × n × n = n³. 1, 8, 27, 64, 125, 216, 343, 512, 729, 1000. A 4 × 4 × 4 block uses 64 unit cubes. Cubes of even numbers are even; of odd numbers, odd.',
 detail:'Pattern: 1 = 1, 3 + 5 = 8, 7 + 9 + 11 = 27, 13 + 15 + 17 + 19 = 64 — consecutive odd numbers add to cubes. Unit digits of cubes can be any digit: 2³ = 8, 3³ = 27, 7³ = 343, 8³ = 512 (notice 2↔8 and 3↔7 swap). Cube of a negative number is negative: (−3)³ = −27.',
 real:'Volume of a cubical water tank of side 2 m is 8 m³ = 8000 litres.',
 apply:'Find 12³. Show that 125 is a sum of 5 consecutive odd numbers.',
 see:{w:520,h:240,f:[
  ['2³ = 8',cube(40,200,2,22)+lbl(80,225,'2³ = 8')],
  ['3³ = 27',cube(190,200,3,22)+lbl(250,225,'3³ = 27')],
  ['4³ = 64',cube(360,200,4,18)+lbl(420,225,'4³ = 64')]]},
 seeNote:'n layers of n × n.',
 do:{title:'Build cubes',mat:'Unit cubes or sugar cubes',steps:['Build 2×2×2 and 3×3×3 cubes.','Count the blocks.'],obs:'8 and 27.',why:'n³.',lab:false},
 memo:'"Cube: three times the same number."',
 miscon:['"2³ = 6." It is 2 × 2 × 2 = 8.'],
 terms:['Cube number','n³','Volume'],
 q:{q:'5³ =',o:['15','25','125','53'],a:2,why:'5 × 5 × 5.'},
 exam:'Cubes and patterns: 2 marks.'},

{id:'q5',num:'1.5',title:'Cube roots',
 intro:'A cubical box holds 1728 small dice. How many dice long is each edge?',
 obj:'Find cube roots by prime factorisation and by unit-digit reasoning.',
 prior:'1.4.',
 simple:'∛ is the reverse of cubing: ∛125 = 5. Prime factorisation: 1728 = 2·2·2·2·2·2·3·3·3 → triples (2·2·2)(2·2·2)(3·3·3) → take one from each: 2 × 2 × 3 = 12. ∛1728 = 12.',
 detail:'If primes don\'t group into triples, it\'s not a perfect cube: 72 = 2³ × 3² — multiply by 3 to get 216 = 6³. Quick method for 4–6 digit cubes: unit digit tells the last digit of the root (…3 → 7, …7 → 3, …2 → 8, …8 → 2, others same); the thousands part tells the first digit. ∛17576: ends in 6 → 6; 17 lies between 2³ = 8 and 3³ = 27 → 2. Answer 26.',
 real:'Packaging: the edge of a cubic carton holding 8000 cm³ is 20 cm.',
 apply:'Find ∛2744 and ∛46656.',
 see:{w:520,h:220,f:[
  ['1728 = 2⁶ × 3³',lbl(260,40,'1728 = 2·2·2 · 2·2·2 · 3·3·3','font-size="17"')],
  ['Group in triples.',lbl(260,95,'(2·2·2)(2·2·2)(3·3·3)','font-size="17" fill="'+PU+'"')],
  ['One from each triple: 12.',lbl(260,155,'∛1728 = 2 × 2 × 3 = 12','font-size="20" font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Triples → cube root.',
 do:{title:'Unit-digit trick',mat:'List of cubes 1–10',steps:['Note unit digits of n³.','Use them to find ∛ of 4-digit cubes.'],obs:'Fast cube roots.',why:'Unit-digit pattern.',lab:true},
 memo:'"Triple the primes, pick one from each."',
 miscon:['"∛27 = 9." It is 3 (3 × 3 × 3 = 27).'],
 terms:['Cube root (∛)','Triplet','Perfect cube'],
 q:{q:'∛512 =',o:['6','7','8','9'],a:2,why:'8³ = 512.'},
 exam:'Cube root: 2–3 marks.'},

{id:'q6',num:'1.6',title:'1729 and other number wonders',
 intro:'Ramanujan, lying ill in hospital, said 1729 was "a very interesting number". Why?',
 obj:'Explore the taxicab number and other square/cube patterns.',
 prior:'1.4, 1.5.',
 simple:'When G.H. Hardy visited Srinivasa Ramanujan and mentioned his taxi number 1729 seemed dull, Ramanujan replied that it is the smallest number expressible as the sum of two cubes in two different ways: 1729 = 1³ + 12³ = 9³ + 10³. Such numbers are called taxicab (Hardy–Ramanujan) numbers.',
 detail:'More patterns: 1³ + 2³ + 3³ + … + n³ = (1 + 2 + … + n)² — e.g. 1 + 8 + 27 = 36 = 6². Some numbers are both squares and cubes: 1, 64, 729 (sixth powers). Pythagorean triples link squares: 3² + 4² = 5².',
 real:'Ramanujan, from Tamil Nadu, is celebrated on National Mathematics Day, 22 December.',
 apply:'Check that 1³ + 2³ + 3³ + 4³ is a square.',
 see:{w:520,h:200,f:[
  ['1729',lbl(260,50,'1729','font-size="34" font-weight="700" fill="'+PU+'"')],
  ['= 1³ + 12³',lbl(150,120,'= 1³ + 12³','font-size="20"')+lbl(150,150,'1 + 1728','font-size="13"')],
  ['= 9³ + 10³',lbl(380,120,'= 9³ + 10³','font-size="20"')+lbl(380,150,'729 + 1000','font-size="13"')]]},
 seeNote:'Two ways as a sum of two cubes.',
 do:{title:'Sum of cubes',mat:'Notebook',steps:['Compute 1³, 1³+2³, 1³+2³+3³, …','Compare with squares.'],obs:'1, 9, 36, 100…',why:'(1+2+…+n)².',lab:false},
 memo:'"1729: one-twelve, nine-ten."',
 miscon:['"1729 = 12³ + 1³ only." It also equals 9³ + 10³.'],
 terms:['Taxicab number','Ramanujan','Sixth power'],
 q:{q:'1729 = 9³ + ?',o:['10³','11³','8³','12³'],a:0,why:'729 + 1000.'},
 exam:'Hardy–Ramanujan number: 1–2 marks.'}
];

const CARDS=[['Locker puzzle','Open lockers = perfect squares.'],['Odd factors','Only squares have an odd number of factors.'],['Square','n × n = n².'],['Odd sums','1 + 3 + … (n odds) = n².'],['Unit digits','Squares end in 0,1,4,5,6,9.'],['√ by primes','Pair primes; one from each pair.'],['Cube','n × n × n = n³.'],['∛ by primes','Triples; one from each.'],['Unit-digit trick','2↔8, 3↔7 for cube roots.'],['1729','1³ + 12³ = 9³ + 10³.']];

const Q=[
 {lv:1,q:'13² =',o:['26','169','139','196'],a:1,w:'13 × 13.'},
 {lv:1,q:'∛64 =',o:['8','4','16','32'],a:1,w:'4³.'},
 {lv:1,q:'Which is a perfect square?',o:['50','72','81','90'],a:2,w:'9².'},
 {lv:2,q:'Number of non-square numbers between 25 and 36:',o:['10','11','9','5'],a:0,w:'2 × 5.'},
 {lv:2,q:'Smallest number to multiply 72 by to get a perfect square:',o:['2','3','6','4'],a:0,w:'72 × 2 = 144.'},
 {lv:2,q:'∛2744 =',o:['14','12','16','24'],a:0,w:'14³.'},
 {lv:3,q:'Locker 48 after all 100 people: ',o:['open','closed'],a:1,w:'Not a square.'},
 {lv:3,q:'√ of 2025 =',o:['45','55','35','25'],a:0,w:'45².'},
 {lv:4,q:'1³ + 2³ + 3³ + 4³ =',o:['100','64','30','10²... no'],a:0,w:'(1+2+3+4)².'},
 {lv:4,q:'Smallest number to divide 135 by to get a perfect cube:',o:['3','5','9','27'],a:1,w:'135 = 3³ × 5.'},
 {lv:5,open:true,m:3,q:'Explain why only perfect-square lockers remain open in the locker puzzle.',ans:['Locker n is toggled once for each factor of n (1)','Factors come in pairs, giving an even count, except squares where one factor pairs with itself (1)','Odd number of toggles → open, so only squares stay open (1)']},
 {lv:5,open:true,m:3,q:'Find ∛17576 using the unit-digit method and check by prime factorisation.',ans:['Unit digit 6 → root ends in 6 (1)','17 between 8 and 27 → first digit 2; root 26 (1)','17576 = 2³ × 13³ → ∛ = 2 × 13 = 26 ✓ (1)']}
];
Q[8].o=['100','64','30','36'];

const ONEMIN=['Locker puzzle → squares.','Square numbers and patterns.','√ by prime pairs, subtraction, estimation.','Cube numbers.','∛ by triples and unit digits.','1729 taxicab number.'];
const KEYS=[['locker',/locker/i],['square',/square/i],['square root',/√|square root/i],['cube',/cube/i],['prime factorisation',/prime/i],['1729',/1729|ramanujan/i]];

/* ---------- lab ---------- */
let mode='l',step=0,open=Array(101).fill(false);
function drawL(hl=0){let s='';for(let n=1;n<=100;n++){const i=(n-1)%20,j=Math.floor((n-1)/20);const x=10+i*22,y=10+j*52;const o=open[n];const touch=hl&&n%hl===0;s+=`<rect x="${x}" y="${y}" width="19" height="40" rx="2" fill="${o?GN:'#ccc'}" fill-opacity="${o?.55:.5}" stroke="${touch?OR:GR}" stroke-width="${touch?2.2:.8}"/>`+T(x+9.5,y+26,String(n),`font-size="8" ${o?'font-weight="700"':''}`)}
 s+=T(230,305,step?`after person ${step}`:'all lockers closed','font-size="13" font-weight="700"');$('#qSvg').innerHTML=s;const op=[];for(let n=1;n<=100;n++)if(open[n])op.push(n);
 $('#qOut').innerHTML=step?`<p>${step===100?'All 100 people done.':`Person ${step} toggled every ${step}${step===1?'st':step===2?'nd':step===3?'rd':'th'} locker (orange outline).`} Open lockers (${op.length}): ${op.length<=30?op.join(', '):op.slice(0,30).join(', ')+' …'}</p>${step===100?'<p class="fb ok">Only perfect squares remain open: each has an odd number of factors.</p>':''}`:'<p>Press "Next person".</p>'}
function toggle(k){for(let n=k;n<=100;n+=k)open[n]=!open[n]}
function drawC(){const n=Math.floor(+$('#qN').value);if(!(n>=1&&n<=1000000)){$('#qOut').innerHTML='<p class="fb no">Use a whole number from 1 to 1,000,000.</p>';return}
 const f=pf(n);const cnt={};f.forEach(p=>cnt[p]=(cnt[p]||0)+1);const ps=Object.keys(cnt).map(Number);
 const isSq=ps.every(p=>cnt[p]%2===0),isCu=ps.every(p=>cnt[p]%3===0);let s=T(230,30,`${n} = ${f.length?f.join(' × '):'1'}`,`font-size="${f.length>10?12:16}" font-weight="700"`);
 let y=80;s+=T(110,y-20,'pairs (square?)','font-size="12" fill="'+BL+'"')+T(340,y-20,'triples (cube?)','font-size="12" fill="'+PU+'"');
 ps.forEach((p,k)=>{const c=cnt[p];const yy=y+k*36;for(let i=0;i<c;i++){const pairDone=Math.floor(i/2)*2+1<c||c%2===0;s+=`<circle cx="${30+i*24}" cy="${yy}" r="10" fill="${(i<c-c%2)?BL:OR}" opacity=".7"/>`+T(30+i*24,yy+4,String(p),'font-size="10" fill="#fff"');s+=`<circle cx="${260+i*24}" cy="${yy}" r="10" fill="${(i<c-c%3)?PU:OR}" opacity=".7"/>`+T(260+i*24,yy+4,String(p),'font-size="10" fill="#fff"')}});
 $('#qSvg').innerHTML=s;const sr=ps.reduce((a,p)=>a*Math.pow(p,Math.floor(cnt[p]/2)),1),cr=ps.reduce((a,p)=>a*Math.pow(p,Math.floor(cnt[p]/3)),1);
 const mSq=ps.reduce((a,p)=>a*(cnt[p]%2?p:1),1),mCu=ps.reduce((a,p)=>a*Math.pow(p,(3-cnt[p]%3)%3),1);
 $('#qOut').innerHTML=`<p>${isSq?`<b class="fb ok">Perfect square:</b> √${n} = ${sr}.`:`Not a perfect square (orange primes unpaired). Multiply by ${mSq} to get ${n*mSq} = ${Math.round(Math.sqrt(n*mSq))}².`}</p><p>${isCu?`<b class="fb ok">Perfect cube:</b> ∛${n} = ${cr}.`:`Not a perfect cube. Multiply by ${mCu} to get ${n*mCu} = ${Math.round(Math.cbrt(n*mCu))}³.`}</p>`}
function draw(){$('#qL').style.display=mode==='l'?'':'none';$('#qCk').style.display=mode==='c'?'':'none';mode==='l'?drawL():drawC()}
function labShow(){draw()}
function labInit(){}
function labClick(b){if(b.id==='qStep'){if(step<100){step++;toggle(step)}drawL(step);return true}if(b.id==='qAll'){while(step<100){step++;toggle(step)}drawL();return true}if(b.id==='qRe'){step=0;open=Array(101).fill(false);drawL();return true}if(b.id==='qGo'){drawC();return true}return false}
function labChange(t){if(t.id==='qM'){mode=t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
