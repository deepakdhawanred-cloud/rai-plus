/* Rai Plus content pack: Class 6 Mathematics (Ganita Prakash), Chapter 5 – Prime Time. */
RP.register({key:'6mat05',cls:'6',subject:'Mathematics',ch:'5',title:"Prime Time",color:'#8a3612',
crumb:"Class 6 Mathematics · Ganita Prakash",h1:"Chapter 5: Prime Time",sub:"Common multiples and factors, primes and composites, the sieve of Eratosthenes, co-primes, prime factorisation and divisibility tests.",heroLabel:"A grid of numbers with primes highlighted",labName:'Prime lab',
theme:"\n:root{--g:light-dark(#8a3612,#f2a77f);--g2:light-dark(#fbefe9,#21110a);--line:light-dark(#f0d6c9,#4a2a1c);--bg:light-dark(#ffffff,#130a06);--card:light-dark(#ffffff,#1b0f09);\n--ink:light-dark(#24120a,#f6e7df);--mute:light-dark(#6e5043,#cfb1a3);--y:light-dark(#1f5f8b,#8fc2e6);--y2:light-dark(#e6f0f8,#0c1a26);--hd:#6b2a0e}\n",
labHTML:`  <h2>Prime lab</h2>
  <p><b>Sieve:</b> press Next to cross out multiples of each prime. <b>Factor tree:</b> type a number to split it into primes.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="pSvg" viewBox="0 0 460 320" role="img" aria-label="Sieve or factor tree" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="pMode"><option value="sieve">Sieve of Eratosthenes (1–100)</option><option value="tree">Factor tree</option></select></label></div><div class="ctrl" id="pSieveC"><button class="btn" id="pNext">Next prime</button> <button class="btn" id="pReset">Reset</button></div><div class="ctrl"><label>Number for factor tree<input id="pN" type="number" value="360" style="width:6em"></label><button class="btn" id="pTree">Make tree</button></div><div class="box y" id="pOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#8a3612',LABNAME='Prime lab',MIND_CENTER='Primes';
const OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const isP=n=>{if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true};
function grid(x0,y0,N,cols,cell,colour){let s='';for(let n=1;n<=N;n++){const r=Math.floor((n-1)/cols),c=(n-1)%cols;const f=colour(n);s+=`<rect x="${x0+c*cell}" y="${y0+r*cell}" width="${cell-2}" height="${cell-2}" rx="3" fill="${f||'none'}" stroke="${GR}" stroke-width=".5"/>`+T(x0+c*cell+cell/2-1,y0+r*cell+cell/2+3,String(n),'font-size="'+Math.max(9,cell*0.38)+'"')}return s}
function heroDraw(){let s='';for(let n=1;n<=30;n++){const r=Math.floor((n-1)/10),c=(n-1)%10;s+=`<rect x="${20+c*28}" y="${20+r*28}" width="24" height="24" rx="3" fill="#fff" opacity="${isP(n)?.9:.25}"/>`}return s}
const HERO=heroDraw;
const MIND=[['Common multiples',100,50],['Common factors',420,50],['Primes & composites',90,150],['Sieve',430,150],['Co-primes',110,250],['Prime factorisation & divisibility',410,250]];

const C=[
{id:'p1',num:'5.1',title:'Common multiples and common factors',
 intro:'Idli-Vada game: say "idli" for multiples of 3, "vada" for multiples of 5. What do you say at 15?',
 obj:'Find common multiples and common factors.',
 prior:'Multiplication tables.',
 simple:'Multiples of 3: 3, 6, 9, 12, 15, … Multiples of 5: 5, 10, 15, 20, … Numbers in both lists are common multiples: 15, 30, 45, … (multiples of 15). In the game, say "idli-vada" at these. Factors of a number divide it exactly: factors of 12 are 1, 2, 3, 4, 6, 12. Factors of 18: 1, 2, 3, 6, 9, 18. Common factors of 12 and 18: 1, 2, 3, 6.',
 detail:'Jumping Jackrabbit: a rabbit jumps 4 steps at a time, another 6. Both land on 12, 24, 36, … (common multiples of 4 and 6). The smallest common multiple is the lowest common multiple (LCM); the largest common factor is the highest common factor (HCF). 1 is a factor of every number; every number is a multiple and a factor of itself.',
 real:'Two buses leave the stand every 10 and 15 minutes. They leave together every 30 minutes.',
 apply:'Find the first three common multiples of 4 and 6.',
 see:{w:520,h:200,f:[
  ['Multiples of 3.',[3,6,9,12,15,18,21,24,27,30].map((n,i)=>T(40+i*48,60,String(n),'font-size="14" fill="'+(n%15?OR:'#000')+'"')).join('')],
  ['Multiples of 5.',[5,10,15,20,25,30].map((n,i)=>T(40+i*80,110,String(n),'font-size="14" fill="'+(n%15?BL:'#000')+'"')).join('')],
  ['Common: 15, 30 → "idli-vada".',`<circle cx="232" cy="56" r="16" fill="none" stroke="${GN}" stroke-width="2"/><circle cx="472" cy="56" r="16" fill="none" stroke="${GN}" stroke-width="2"/>`+lbl(260,170,'common multiples of 3 and 5: 15, 30, 45 …','font-weight="700"')]]},
 seeNote:'Common multiples of 3 and 5 are multiples of 15.',
 do:{title:'Idli-Vada',mat:'The whole class in a circle',steps:['Count 1, 2, 3… around the circle.','Say "idli" for multiples of 3, "vada" for multiples of 5, "idli-vada" for both.','Anyone who slips sits down.'],obs:'Idli-vada at 15, 30, 45…',why:'Common multiples.',lab:false},
 memo:'"Multiples grow, factors divide."',
 miscon:['"Common multiples of 4 and 6 are multiples of 24." They are multiples of 12.'],
 terms:['Multiple','Factor','Common multiple','Common factor','LCM','HCF'],
 q:{q:'Common factors of 12 and 18:',o:['1, 2, 3, 6','1, 2, 4','2, 3, 9','6, 12'],a:0,why:'Both lists.'},
 exam:'Common multiples/factors: 2 marks.'},

{id:'p2',num:'5.2',title:'Prime and composite numbers',
 intro:'You have 12 chairs. In how many ways can you arrange them in a rectangle? And 13 chairs?',
 obj:'Distinguish primes and composites.',
 prior:'Factors (5.1).',
 simple:'A prime number has exactly two factors: 1 and itself (2, 3, 5, 7, 11, 13, …). A composite number has more than two factors (4, 6, 8, 9, 10, 12, …). 1 has only one factor, so it is neither prime nor composite. 2 is the only even prime.',
 detail:'Rectangles: 12 chairs can make 1 × 12, 2 × 6, 3 × 4 rectangles; 13 chairs only 1 × 13 — that is why 13 is prime. There are 25 primes below 100. Primes never run out: there are infinitely many.',
 real:'Some locks and online security use very large prime numbers.',
 apply:'Is 51 prime? (Hint: try dividing by 3.)',
 see:{w:520,h:200,f:[
  ['12 = 3 × 4 rectangle.',[...Array(12)].map((_,k)=>`<circle cx="${60+(k%4)*22}" cy="${60+Math.floor(k/4)*22}" r="8" fill="${BL}"/>`).join('')+lbl(95,150,'12: many rectangles')],
  ['13: only a line 1 × 13.',[...Array(13)].map((_,k)=>`<circle cx="${210+k*22}" cy="80" r="8" fill="${OR}"/>`).join('')+lbl(340,150,'13: prime')],
  ['1 is neither prime nor composite.',lbl(260,190,'prime: exactly 2 factors','font-weight="700"')]]},
 seeNote:'Exactly two factors = prime.',
 do:{title:'Chair rectangles',mat:'Counters or bottle caps',steps:['Take 2 to 20 counters.','Find every rectangle for each number.','Mark numbers with only one rectangle.'],obs:'Those are primes.',why:'Only factors 1 and itself.',lab:true},
 memo:'"Prime: one and itself, nothing else."',
 miscon:['"1 is prime." It has only one factor.','"All odd numbers are prime." 9, 15, 21 are not.'],
 terms:['Prime','Composite','Factor'],
 q:{q:'Which is prime?',o:['21','27','29','33'],a:2,why:'Only 1 and 29.'},
 exam:'Identify primes/composites: 2 marks.'},

{id:'p3',num:'5.3',title:'Sieve of Eratosthenes and co-primes',
 intro:'How can you quickly find all primes up to 100?',
 obj:'Use the sieve; identify co-prime pairs.',
 prior:'Primes (5.2).',
 simple:'Sieve of Eratosthenes: write 1 to 100. Cross out 1. Circle 2 and cross out its other multiples. Circle the next uncrossed number, 3, and cross out its multiples. Repeat with 5 and 7. All remaining numbers are prime. Co-prime numbers have no common factor other than 1, e.g. 8 and 15. They need not be prime themselves.',
 detail:'Why only up to 7 for 100? Any composite up to 100 has a factor ≤ 10, so it is already crossed out by 2, 3, 5 or 7. Eratosthenes was a Greek scholar who also estimated Earth\'s size. Two primes are always co-prime; two consecutive numbers are always co-prime.',
 real:'In gear designs, co-prime tooth counts spread wear evenly.',
 apply:'Are 21 and 25 co-prime?',
 see:{w:520,h:240,f:[
  ['Write 1 to 30.',grid(40,20,30,10,26,()=>null)],
  ['Cross out multiples of 2, 3, 5.',grid(40,20,30,10,26,n=>n===1||(!isP(n))?'#ddd':null)],
  ['Remaining: primes.',grid(40,20,30,10,26,n=>isP(n)?'#f6c7ae':(n===1||!isP(n))?'#eee':null)+lbl(400,40,'2, 3, 5, 7, 11, 13,','font-size="12"')+lbl(400,58,'17, 19, 23, 29','font-size="12"')]]},
 seeNote:'Sieve up to 7 for 100.',
 do:{title:'Sieve it',mat:'1–100 grid sheet, coloured pencils',steps:['Follow the sieve steps.','Count primes in each row of ten.'],obs:'25 primes; fewer in later rows.',why:'Primes thin out.',lab:true},
 memo:'"Cross the multiples, keep the primes."',
 miscon:['"Co-primes must be primes." 8 and 15 are co-prime.'],
 terms:['Sieve of Eratosthenes','Co-prime'],
 q:{q:'Which pair is co-prime?',o:['12, 18','8, 15','10, 25','6, 9'],a:1,why:'Only 1 common.'},
 exam:'List primes up to 50 using sieve: 2 marks.'},

{id:'p4',num:'5.4',title:'Prime factorisation',
 intro:'Every number is built from primes, like a house from bricks. Which bricks make 60?',
 obj:'Write numbers as products of primes using a factor tree.',
 prior:'Primes (5.2).',
 simple:'Prime factorisation writes a number as a product of primes: 60 = 2 × 2 × 3 × 5. Use a factor tree: split 60 into 6 × 10, then 6 = 2 × 3 and 10 = 2 × 5; stop at primes. Every composite number has exactly one prime factorisation (order doesn\'t matter).',
 detail:'Use factorisation to test co-primes (no prime in common) and to check divisibility: 60 is divisible by 12 because 12 = 2 × 2 × 3 is "inside" 2 × 2 × 3 × 5. Different first splits (60 = 4 × 15) give the same primes.',
 real:'Like a number\'s fingerprint: unique.',
 apply:'Find the prime factorisation of 84.',
 see:{w:520,h:230,f:[
  ['60 splits into 6 × 10.',lbl(260,30,'60','font-size="18" font-weight="700"')+`<line x1="255" y1="38" x2="190" y2="80" stroke="${GR}"/><line x1="265" y1="38" x2="330" y2="80" stroke="${GR}"/>`+lbl(185,95,'6','font-size="16"')+lbl(335,95,'10','font-size="16"')],
  ['6 = 2 × 3; 10 = 2 × 5.',`<line x1="180" y1="102" x2="150" y2="145" stroke="${GR}"/><line x1="190" y1="102" x2="220" y2="145" stroke="${GR}"/><line x1="330" y1="102" x2="300" y2="145" stroke="${GR}"/><line x1="340" y1="102" x2="370" y2="145" stroke="${GR}"/>`+[[150,'2'],[220,'3'],[300,'2'],[370,'5']].map(([x,t])=>`<circle cx="${x}" cy="155" r="14" fill="${OR}" opacity=".2" stroke="${OR}"/>`+lbl(x,160,t,'font-size="15"')).join('')],
  ['60 = 2 × 2 × 3 × 5.',lbl(260,210,'60 = 2 × 2 × 3 × 5','font-size="17" font-weight="700"')]]},
 seeNote:'Stop when every branch ends in a prime.',
 do:{title:'Two trees, one answer',mat:'Paper',steps:['Draw a factor tree for 72 starting 8 × 9.','Draw another starting 6 × 12.','Compare.'],obs:'Both give 2×2×2×3×3.',why:'Unique factorisation.',lab:true},
 memo:'"Split until prime."',
 miscon:['"Different trees give different answers." The primes are always the same.'],
 terms:['Prime factorisation','Factor tree'],
 q:{q:'Prime factorisation of 36:',o:['4 × 9','2 × 2 × 3 × 3','6 × 6','2 × 18'],a:1,why:'All primes.'},
 exam:'Factor tree: 2 marks.'},

{id:'p5',num:'5.5',title:'Divisibility tests',
 intro:'Is 7,35,120 divisible by 8? Can you tell without dividing?',
 obj:'Use divisibility rules for 2, 4, 5, 8 and 10.',
 prior:'Place value.',
 simple:'Divisible by 10: last digit 0. By 5: last digit 0 or 5. By 2: last digit even (0, 2, 4, 6, 8). By 4: number formed by the last two digits is divisible by 4. By 8: number formed by the last three digits is divisible by 8.',
 detail:'Why does the rule for 4 work? 100 is divisible by 4, so all the hundreds part is; only the last two digits matter. Similarly 1000 is divisible by 8. (Rules for 3 and 9 using digit sums come later.)',
 real:'Check quickly if sweets can be shared equally in boxes of 4 or 8.',
 apply:'Is 3,416 divisible by 8?',
 see:{w:520,h:200,f:[
  ['By 2, 5, 10: look at the last digit.',lbl(260,50,'73,51,2[0] → ÷ 2, 5, 10 ✓','font-size="16"')],
  ['By 4: last two digits.',lbl(260,100,'9,3[16] → 16 ÷ 4 = 4 ✓','font-size="16"')],
  ['By 8: last three digits.',lbl(260,150,'7,35,[120] → 120 ÷ 8 = 15 ✓','font-size="16"')]]},
 seeNote:'Look only at the ending.',
 do:{title:'Number plates',mat:'Car number plates in the parking',steps:['Note 10 four-digit numbers.','Test each for 2, 4, 5, 8, 10.'],obs:'Quick tests.',why:'Place value.',lab:false},
 memo:'"2, 5, 10: last one; 4: last two; 8: last three."',
 miscon:['"Divisible by 4 if last digit is 4." Use last two digits (14 is not).'],
 terms:['Divisible','Divisibility test'],
 q:{q:'Which is divisible by 4?',o:['1,234','5,316','7,114','9,342'],a:1,why:'16 ÷ 4.'},
 exam:'Apply divisibility tests: 2 marks.'}
];

const CARDS=[['Multiple','Product with a counting number.'],['Factor','Divides exactly.'],['Common multiple','In both lists; e.g. 3 and 5 → 15, 30.'],['Common factor','Divides both.'],['Prime','Exactly two factors.'],['Composite','More than two factors.'],['1','Neither prime nor composite.'],['Sieve','Cross out multiples of 2, 3, 5, 7 (≤ 100).'],['Co-prime','Only common factor 1.'],['Prime factorisation','60 = 2×2×3×5; unique.'],['Divisibility','2, 5, 10: last digit; 4: last two; 8: last three.']];

const Q=[
 {lv:1,q:'Smallest prime:',o:['0','1','2','3'],a:2,w:'2.'},
 {lv:1,q:'Factors of 15:',o:['1, 3, 5, 15','1, 15','3, 5','1, 5, 15, 30'],a:0,w:'All divisors.'},
 {lv:1,q:'Which is composite?',o:['17','19','21','23'],a:2,w:'3×7.'},
 {lv:2,q:'First common multiple of 4 and 6:',o:['24','12','10','2'],a:1,w:'LCM.'},
 {lv:2,q:'Prime factorisation of 18:',o:['2×9','2×3×3','3×6','1×18'],a:1,w:'All primes.'},
 {lv:2,q:'Divisible by 5:',o:['132','245','317','408'],a:1,w:'Ends in 5.'},
 {lv:3,q:'Primes between 20 and 30:',o:['21, 23','23, 29','23, 27, 29','25, 29'],a:1,w:'23, 29.'},
 {lv:3,q:'Which is divisible by 8?',o:['2,124','3,440','5,212','1,234'],a:1,w:'440 ÷ 8 = 55.'},
 {lv:4,q:'Two consecutive numbers are always:',o:['prime','co-prime','even','composite'],a:1,w:'Only 1 in common.'},
 {lv:4,q:'Two bells ring every 6 and 8 minutes. Together again after:',o:['14 min','24 min','48 min','2 min'],a:1,w:'LCM 24.'},
 {lv:5,open:true,m:3,q:'Draw a factor tree for 120 and write its prime factorisation.',ans:['120 = 10 × 12 (1)','10 = 2×5; 12 = 2×2×3 (1)','120 = 2×2×2×3×5 (1)']},
 {lv:5,open:true,m:2,q:'Why is 1 neither prime nor composite?',ans:['Prime needs exactly two factors (1)','1 has only one factor (itself) (1)']}
];

const ONEMIN=['Common multiples and factors; LCM, HCF.','Prime: exactly 2 factors; 1 is neither.','Sieve of Eratosthenes: 25 primes below 100.','Co-primes: only 1 in common.','Prime factorisation is unique.','Divisibility: 2, 5, 10 last digit; 4 last two; 8 last three.'];
const KEYS=[['multiples',/multiple/i],['factors',/factor/i],['prime',/prime/i],['sieve',/sieve/i],['co-prime',/co-?prime/i],['divisibility',/divisib/i]];

/* ---------- lab ---------- */
const PR=[2,3,5,7];let mode='sieve',step=0,treeN=360;
function sieveCol(n){if(n===1)return step>0?'#ddd':null;for(let k=0;k<Math.min(step,4);k++){const p=PR[k];if(n===p)return '#f6c7ae';if(n%p===0)return ['#cfe0ee','#dbe9cf','#e5dcf5','#f5e6c8'][k]}if(step>=5&&isP(n))return '#f6c7ae';return null}
function drawSieve(){$('#pSvg').innerHTML=grid(25,10,100,10,30,sieveCol);
 const msg=step===0?'Press Next to cross out 1 and multiples of 2.':step<=4?`Circled ${PR[step-1]}; crossed out its other multiples (shaded).`:'All remaining numbers are prime: 25 primes up to 100.';
 $('#pOut').innerHTML=`<p>${msg}</p>`+(step>=5?'<p class="note">2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97</p>':'')}
function tree(n){const nodes=[];function split(v,x,y,dx){const id=nodes.length;nodes.push({v,x,y,p:isP(v)});if(isP(v)||v<4)return id;let d=2;for(let k=Math.floor(Math.sqrt(v));k>=2;k--)if(v%k===0){d=k;break}const a=split(d,x-dx,y+48,dx*0.55),b=split(v/d,x+dx,y+48,dx*0.55);nodes[id].c=[a,b];return id}
 split(n,230,28,110);return nodes}
function drawTree(){const n=treeN;if(!(n>=2&&n<=100000)){$('#pSvg').innerHTML=T(230,150,'Enter a number from 2 to 100000','font-size="14"');return}
 const N=tree(n);let s='';N.forEach(o=>{if(o.c)o.c.forEach(c=>s+=`<line x1="${o.x}" y1="${o.y+10}" x2="${N[c].x}" y2="${N[c].y-14}" stroke="${GR}"/>`)});
 N.forEach(o=>{s+=o.p?`<circle cx="${o.x}" cy="${o.y}" r="15" fill="${OR}" opacity=".2" stroke="${OR}"/>`:'';s+=T(o.x,o.y+5,String(o.v),`font-size="${o.v>999?11:14}" font-weight="${o.p?700:400}"`)});
 const ps=N.filter(o=>o.p&&!o.c).map(o=>o.v).sort((a,b)=>a-b);$('#pSvg').innerHTML=s;
 $('#pOut').innerHTML=isP(n)?`<p class="fb ok">${n} is prime: its only factors are 1 and ${n}.</p>`:`<p class="fb ok">${n} = ${ps.join(' × ')}</p><p>Circled numbers are primes: the tree stops there.</p>`}
function draw(){mode==='sieve'?drawSieve():drawTree()}
function labShow(){draw()}
function labInit(){}
function labClick(b){if(b.id==='pNext'){mode='sieve';$('#pMode').value='sieve';step=Math.min(5,step+1);drawSieve();return true}if(b.id==='pReset'){step=0;mode='sieve';$('#pMode').value='sieve';drawSieve();return true}if(b.id==='pTree'){mode='tree';$('#pMode').value='tree';treeN=Math.floor(+$('#pN').value);drawTree();return true}return false}
function labChange(t){if(t.id==='pMode'){mode=t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
