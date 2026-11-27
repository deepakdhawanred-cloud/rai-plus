/* Rai Plus content pack: Class 8 Mathematics (Ganita Prakash Part 2), Chapter 6 – Algebra Play (number tricks, pyramids, calendar magic, digit puzzles). */
RP.register({key:'8matb6',cls:'8',subject:'Mathematics',ch:'II-6',title:"Algebra Play",color:'#a0522d',
crumb:"Class 8 Mathematics · Ganita Prakash Part 2",h1:"Part 2 · Chapter 6: Algebra Play",sub:"Using algebra to explain number magic: 'think of a number' tricks, number pyramids, calendar puzzles, reversed-digit differences, the largest product puzzle and divisibility shortcuts.",heroLabel:"Algebra behind the magic",labName:'Pyramid & calendar lab',
theme:"\n:root{--g:light-dark(#a0522d,#f0b48f);--g2:light-dark(#fbf0ea,#1d0f08);--line:light-dark(#efd6c8,#47301f);--bg:light-dark(#ffffff,#140b06);--card:light-dark(#ffffff,#1b110a);\n--ink:light-dark(#2d160a,#f6e8df);--mute:light-dark(#6a4c3c,#d1b8a8);--y:light-dark(#1f5f8b,#8cc4ea);--y2:light-dark(#eaf3fa,#081520);--hd:#7d3d1d}\n",
labHTML:`  <h2>Pyramid &amp; calendar lab</h2>
  <p><b>Pyramid:</b> each brick is the sum of the two below it. Change the bottom row and predict the top using a + 3b + 3c + d. <b>Calendar:</b> tap any date to pick a 2 × 2 block; its sum is always 4n + 16, where n is the top-left date.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="apSvg" viewBox="0 0 460 320" role="img" aria-label="Algebra play" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="apM"><option value="p">Number pyramid</option><option value="c">Calendar 2 × 2 block</option></select></label></div>
  <div id="apPC"><div class="ctrl"><label>a: <b id="apAv"></b><input type="range" class="apS" id="apA" min="0" max="20" value="2"></label></div>
  <div class="ctrl"><label>b: <b id="apBv"></b><input type="range" class="apS" id="apB" min="0" max="20" value="5"></label></div>
  <div class="ctrl"><label>c: <b id="apCv"></b><input type="range" class="apS" id="apC" min="0" max="20" value="3"></label></div>
  <div class="ctrl"><label>d: <b id="apDv"></b><input type="range" class="apS" id="apD" min="0" max="20" value="7"></label></div>
  <div class="ctrl"><button class="btn" id="apHide">Hide / show top (predict!)</button></div></div>
  <div class="box y" id="apOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#a0522d',LABNAME='Pyramid & calendar lab',MIND_CENTER='Algebra play';
const BR='#a0522d',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',OR='#b04a1f',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const brick=(x,y,w,t,c=BR,o='.15')=>`<rect x="${x}" y="${y}" width="${w}" height="34" rx="5" fill="${c}" fill-opacity="${o}" stroke="${c}" stroke-width="1.5"/>`+T(x+w/2,y+22,t,'font-size="13" font-weight="700"');
function pyramid(row,x0,y0,w,show=true,cOverride){let s='',r=row.slice(),lvl=0;const rows=[r];while(r.length>1){r=r.slice(1).map((v,i)=>typeof v==='number'&&typeof r[i]==='number'?v+r[i]:'?');rows.push(r)}
 rows.forEach((rw,L)=>rw.forEach((v,i)=>{const x=x0+L*w/2+i*w,y=y0-L*40;const top=L===rows.length-1;s+=brick(x,y,w-4,top&&!show?'?':v,top?(cOverride||OR):BR,top?'.25':'.12')}));return s}
function heroDraw(){return `<g fill="none" stroke="#fff" stroke-width="2">${[[40,110,4],[70,80,3],[100,50,2],[130,20,1]].map(([x,y,n])=>[...Array(n)].map((_,i)=>`<rect x="${x+i*60}" y="${y}" width="56" height="26" rx="4"/>`).join('')).join('')}</g>`}
const HERO=heroDraw;
const MIND=[['Think-of-a-number',100,50],['Number pyramids',420,50],['Calendar magic',90,150],['Reversed digits',430,150],['Largest product',110,250],['Divisibility shortcuts',410,250]];

const C=[
{id:'a1',num:'6.1',title:'"Think of a number" tricks',
 intro:'Think of a number. Double it. Add 10. Halve it. Subtract the number you started with. Your answer is 5 — every time! How?',
 obj:'Use a variable to explain why number tricks always work.',
 prior:'Algebraic expressions (Class 7; Part 1 Ch 6).',
 simple:'Let the number be x. Double: 2x. Add 10: 2x + 10. Halve: x + 5. Subtract x: 5. The x disappears, so the answer is always 5, whatever number you pick. Algebra turns a "magic trick" into a proof.',
 detail:'Tricks can also reveal the original number: "Multiply by 3, add 6, divide by 3, tell me the answer" → (3x + 6)/3 = x + 2, so subtract 2. You can design your own trick by making sure the steps cancel out the variable (or leave a simple form of it).',
 real:'Magicians and puzzle books use algebra-based tricks.',
 apply:'Explain: think of a number, add 7, multiply by 2, subtract 4, halve, subtract the original number. What is the result?',
 see:{w:520,h:220,f:[
  ['Start: x.',lbl(90,40,'x','font-size="18" font-weight="700"')+lbl(90,70,'double → 2x','font-size="15"')],
  ['+10, then halve.',lbl(260,40,'2x + 10','font-size="18"')+lbl(260,70,'halve → x + 5','font-size="15"')],
  ['Subtract x: always 5.',lbl(430,40,'x + 5 − x','font-size="18"')+lbl(430,70,'= 5','font-size="22" font-weight="700" fill="'+OR+'"')+lbl(260,150,'the variable cancels — so the answer never depends on x','font-weight="700"')]]},
 seeNote:'The variable cancels.',
 do:{title:'Magic for the class',mat:'Paper slips',steps:['Perform the trick on 5 classmates.','Explain it with x.'],obs:'Always 5.',why:'Algebra proof.',lab:false},
 memo:'"Let it be x, and watch it vanish."',
 miscon:['"Trying a few numbers proves it always works." Only algebra proves it for every number.'],
 terms:['Variable','Expression','Proof'],
 q:{q:'Think of x; multiply by 4; add 8; divide by 4; subtract x. Result:',o:['x','2','4','8'],a:1,why:'x + 2 − x.'},
 exam:'Explain a number trick algebraically: 2–3 marks.'},

{id:'a2',num:'6.2',title:'Number pyramids',
 intro:'In a number pyramid, each brick is the sum of the two bricks under it. Can you find the top brick without building the whole pyramid?',
 obj:'Use algebra to find the top of a number pyramid directly.',
 prior:'6.1; adding expressions.',
 simple:'Bottom row a, b, c (three bricks): next row a + b, b + c; top a + 2b + c. With four bricks a, b, c, d: top = a + 3b + 3c + d. Example: 2, 5, 3, 7 → 2 + 15 + 9 + 7 = 33.',
 detail:'The coefficients 1, 2, 1 and 1, 3, 3, 1 are rows of Pascal\'s triangle (Meru Prastara). With five bricks: 1, 4, 6, 4, 1. Middle bricks count more, so to make the top as large as possible, put the largest numbers in the middle.',
 real:'The same pattern shows up in counting paths on a grid.',
 apply:'Bottom row 1, 2, 3, 4, 5. Find the top using 1, 4, 6, 4, 1.',
 see:{w:520,h:220,f:[
  ['Bottom row a, b, c.',['a','b','c'].map((v,i)=>brick(140+i*80,160,76,v)).join('')],
  ['Next row.',['a + b','b + c'].map((v,i)=>brick(180+i*80,120,76,v)).join('')],
  ['Top: a + 2b + c.',brick(220,80,76,'a+2b+c',OR,'.25')+lbl(260,40,'coefficients 1, 2, 1 — Pascal\'s triangle','font-weight="700"')]]},
 seeNote:'Middle bricks count more.',
 do:{title:'Pyramid race',mat:'Paper',steps:['One student builds the pyramid; another uses a + 3b + 3c + d.','Who finishes first?'],obs:'Formula wins.',why:'Algebra shortcut.',lab:true},
 memo:'"1-3-3-1 for four at the bottom."',
 miscon:['"The top is just the sum of the bottom row." Middle bricks are counted more than once.'],
 terms:['Number pyramid','Coefficient','Pascal\'s triangle'],
 q:{q:'Bottom row 1, 2, 3, 4. Top:',o:['10','20','16','24'],a:1,why:'1 + 6 + 9 + 4.'},
 exam:'Top of a pyramid algebraically: 2–3 marks.'},

{id:'a3',num:'6.3',title:'Calendar magic',
 intro:'Choose any 2 × 2 block of dates on a calendar. Tell me only the top-left date, and I\'ll tell you the sum of all four instantly.',
 obj:'Use algebra to discover patterns in calendar blocks.',
 prior:'6.1.',
 simple:'If the top-left date is n, the block is n, n + 1 (right), n + 7 (below), n + 8 (diagonal). Sum = 4n + 16. If n = 10, the sum is 56. The diagonals have equal sums: n + (n + 8) = (n + 1) + (n + 7) = 2n + 8.',
 detail:'For a 3 × 3 block with centre m: the dates are m − 8 … m + 8, and the sum is 9m (each pair around the centre adds to 2m). Moving a 2 × 2 block down one week adds 7 to each date, so the sum increases by 28.',
 real:'Calendar tricks are classic school-assembly magic.',
 apply:'A 3 × 3 calendar block has a sum of 153. What is the centre date?',
 see:{w:520,h:220,f:[
  ['The block.',[['n','n+1'],['n+7','n+8']].map((r,i)=>r.map((v,j)=>brick(170+j*90,50+i*45,86,v,BL)).join('')).join('')],
  ['Add them.',lbl(260,170,'n + (n + 1) + (n + 7) + (n + 8) = 4n + 16','font-size="15" font-weight="700"')],
  ['Diagonals equal.',lbl(260,200,'n + (n + 8) = (n + 1) + (n + 7) = 2n + 8','font-size="13" fill="'+OR+'"')]]},
 seeNote:'+1 across, +7 down.',
 do:{title:'Calendar check',mat:'Wall calendar',steps:['Pick five 2 × 2 blocks.','Check sum = 4n + 16.'],obs:'Always true.',why:'Algebra.',lab:true},
 memo:'"Across +1, down +7."',
 miscon:['"Dates below are +1." They are +7 (one week later).'],
 terms:['Calendar block','4n + 16','Pattern'],
 q:{q:'Top-left date 12 in a 2 × 2 block. Sum:',o:['48','64','56','60'],a:1,why:'4 × 12 + 16.'},
 exam:'Calendar algebra: 2 marks.'},

{id:'a4',num:'6.4',title:'Reversed-digit puzzles',
 intro:'Take 73. Reverse it: 37. Subtract: 36. Try 82 − 28 = 54. Notice anything?',
 obj:'Prove that a two-digit number minus its reverse is divisible by 9, and the sum by 11.',
 prior:'Place value; 6.1.',
 simple:'A two-digit number with digits a and b is 10a + b. Its reverse is 10b + a. Difference: (10a + b) − (10b + a) = 9a − 9b = 9(a − b) — always a multiple of 9. Sum: 11a + 11b = 11(a + b) — always a multiple of 11.',
 detail:'73 − 37 = 9 × (7 − 3) = 36. 82 + 28 = 11 × 10 = 110. For three-digit numbers abc − cba = 99(a − c). This lets you predict the answer from the digits alone.',
 real:'Used in quick mental checks and number puzzles.',
 apply:'Without subtracting, find 91 − 19 and 64 + 46.',
 see:{w:520,h:200,f:[
  ['Number and reverse.',lbl(260,40,'10a + b   and   10b + a','font-size="17"')],
  ['Difference.',lbl(260,95,'(10a + b) − (10b + a) = 9(a − b)','font-size="16" fill="'+BL+'"')],
  ['Sum.',lbl(260,150,'(10a + b) + (10b + a) = 11(a + b)','font-size="16" fill="'+OR+'"')]]},
 seeNote:'Place value explains it.',
 do:{title:'Digit flip',mat:'Paper',steps:['Try 10 two-digit numbers.','Divide differences by 9.'],obs:'Quotient = a − b.',why:'9(a − b).',lab:false},
 memo:'"Flip and subtract → 9s; flip and add → 11s."',
 miscon:['"A two-digit number ab means a × b." It means 10a + b.'],
 terms:['Place value','10a + b','Multiple of 9 / 11'],
 q:{q:'(10a + b) − (10b + a) equals:',o:['9(a + b)','9(a − b)','11(a − b)','a − b'],a:1,why:'9a − 9b.'},
 exam:'Prove a digit property: 3 marks.'},

{id:'a5',num:'6.5',title:'The largest product puzzle',
 intro:'Use the digits 2, 3, 4 and 5 to make two two-digit numbers whose product is as large as possible.',
 obj:'Investigate how to arrange digits to get the largest product, and explain using algebra.',
 prior:'Multiplication; area model (Part 1 Ch 6).',
 simple:'The tens digits matter most, so put the largest digits (5 and 4) in the tens places: 5_ × 4_. Then pair the next largest digit with the smaller tens digit: 52 × 43 = 2236 beats 53 × 42 = 2226.',
 detail:'Why? (10a + c)(10b + d) = 100ab + 10(ad + bc) + cd. With a > b and c > d, choosing ad + bc larger means pairing the bigger units digit with the smaller tens digit. A general rule: to maximise a product with a fixed sum, make the numbers as close to each other as possible: 52 and 43 differ by 9, while 53 and 42 differ by 11.',
 real:'"Fixed sum, closest numbers → largest product" is why a square has the largest area among rectangles of the same perimeter.',
 apply:'Using digits 1, 6, 7, 9, make the largest product of two two-digit numbers.',
 see:{w:520,h:200,f:[
  ['Largest in the tens places.',lbl(260,45,'5_ × 4_','font-size="20"')],
  ['Two choices.',lbl(160,100,'53 × 42 = 2226','font-size="16"')+lbl(360,100,'52 × 43 = 2236','font-size="16" fill="'+OR+'" font-weight="700"')],
  ['Closer numbers win.',lbl(260,160,'52 and 43 differ by 9; 53 and 42 by 11','font-size="14"')]]},
 seeNote:'Big digits in big places; keep factors close.',
 do:{title:'Digit cards',mat:'4 digit cards',steps:['Try all arrangements.','Find the largest product.'],obs:'Rule emerges.',why:'Algebra of place value.',lab:false},
 memo:'"Big digits high, factors close."',
 miscon:['"Put the two largest digits in one number." 54 × 32 = 1728 is much smaller.'],
 terms:['Product','Arrangement','Place value'],
 q:{q:'Largest product from digits 1, 2, 3, 4:',o:['43 × 21','41 × 32','42 × 31','34 × 12'],a:1,why:'1312 vs 903, 1302.'},
 exam:'Reasoning puzzles: 2–3 marks.'},

{id:'a6',num:'6.6',title:'Divisibility shortcuts explained',
 intro:'Why does adding the digits tell you whether a number is divisible by 3 or 9?',
 obj:'Use algebra to explain divisibility rules for 3, 9 and 11.',
 prior:'Part 1 Ch 5 Number Play; 6.4.',
 simple:'A three-digit number abc = 100a + 10b + c = (99a + 9b) + (a + b + c). The first part is always a multiple of 9 (and 3). So the number is divisible by 9 (or 3) exactly when a + b + c is.',
 detail:'For 11: 100a + 10b + c = (99a + 11b) + (a − b + c). The bracket is a multiple of 11, so the number is divisible by 11 when the alternating sum a − b + c is. Example: 726 → 7 − 2 + 6 = 11 ✓. The same idea extends to longer numbers using 999…, 1001, and so on.',
 real:'Shopkeepers use digit-sum checks ("casting out nines") to catch addition mistakes.',
 apply:'Use algebra to show that 4-digit numbers follow the same rule for 9.',
 see:{w:520,h:200,f:[
  ['Split by place value.',lbl(260,45,'100a + 10b + c','font-size="18"')],
  ['Regroup.',lbl(260,100,'(99a + 9b) + (a + b + c)','font-size="17" fill="'+BL+'"')],
  ['Check the digit sum.',lbl(260,155,'multiple of 9 + digit sum → test the digit sum','font-size="14" font-weight="700" fill="'+OR+'"')]]},
 seeNote:'Rules are algebra in disguise.',
 do:{title:'Rule check',mat:'Calculator',steps:['Pick 5 numbers with digit sum 18.','Divide by 9.'],obs:'All divisible.',why:'99a + 9b.',lab:false},
 memo:'"99 and 9 hide inside every number."',
 miscon:['"Digit sum works for every divisor." It works for 3 and 9 (not for 7, for example).'],
 terms:['Digit sum','Alternating sum','Divisibility'],
 q:{q:'Is 5247 divisible by 9?',o:['Yes: digit sum 18','No: digit sum 17','Yes: ends in 7','No: odd'],a:0,why:'5 + 2 + 4 + 7 = 18.'},
 exam:'Explain a divisibility rule: 3 marks.'}
];

const CARDS=[['Number trick','Let the number be x; the steps cancel x.'],['Pyramid (3)','Top = a + 2b + c.'],['Pyramid (4)','Top = a + 3b + 3c + d.'],['Pascal','Coefficients 1, 3, 3, 1 …'],['2 × 2 calendar','Sum = 4n + 16.'],['3 × 3 calendar','Sum = 9 × centre.'],['Reverse − original','9(a − b).'],['Reverse + original','11(a + b).'],['Largest product','Big digits in tens; factors close.'],['Divisibility 9','100a + 10b + c = 99a + 9b + (a + b + c).']];

const Q=[
 {lv:1,q:'A two-digit number with digits a, b is:',o:['ab','a + b','10a + b','10b + a'],a:2,w:'Place value.'},
 {lv:1,q:'In a calendar, the date just below n is:',o:['n + 1','n + 7','n + 10','n − 7'],a:1,w:'One week later.'},
 {lv:1,q:'Pyramid bottom 4, 6, 1. Top:',o:['11','17','10','21'],a:1,w:'4 + 12 + 1.'},
 {lv:2,q:'85 − 58 =',o:['27','9 × 4','33','18'],a:0,w:'9 × 3.'},
 {lv:2,q:'2 × 2 calendar block with sum 80. Top-left date:',o:['16','20','14','18'],a:0,w:'4n + 16 = 80.'},
 {lv:2,q:'Think of x, add 3, double, subtract 6, halve. Result:',o:['x','3','x + 3','6'],a:0,w:'(2x + 6 − 6)/2.'},
 {lv:3,q:'Pyramid bottom a, b, c, d, e. Coefficient of c at the top:',o:['3','4','6','5'],a:2,w:'1, 4, 6, 4, 1.'},
 {lv:3,q:'Sum of 3 × 3 calendar block with centre 17:',o:['153','136','170','144'],a:0,w:'9 × 17.'},
 {lv:4,q:'Which is divisible by 11?',o:['517','523','734','615'],a:0,w:'5 − 1 + 7 = 11.'},
 {lv:4,q:'Largest product from digits 3, 5, 7, 8 (two 2-digit numbers):',o:['85 × 73','83 × 75','87 × 53','78 × 53'],a:1,w:'6225 > 6205.'},
 {lv:5,open:true,m:3,q:'Prove that the difference between a two-digit number and the number formed by reversing its digits is always divisible by 9.',ans:['Number = 10a + b, reverse = 10b + a (1)','Difference = 9a − 9b (1)','= 9(a − b), a multiple of 9 (1)']},
 {lv:5,open:true,m:5,q:'Design your own "think of a number" trick with at least four steps that always gives 7. Show the algebra.',ans:['Clear steps (1)','Uses x (1)','Algebra at each step (1)','x cancels (1)','Final answer 7 (1)']}
];

const ONEMIN=['Tricks: x cancels.','Pyramids: 1-3-3-1.','Calendar: 4n + 16.','Reverse digits: 9(a − b), 11(a + b).','Largest product: place value.','Divisibility rules explained.'];
const KEYS=[['trick',/trick|think of/i],['pyramid',/pyramid|pascal/i],['calendar',/calendar/i],['reverse',/revers/i],['product',/largest product|product/i],['divisibility',/divisib/i]];

/* ---------- lab ---------- */
let mode='p',P={a:2,b:5,c:3,d:7},showTop=true,N=10,wired=false;
function drawP(){const {a,b,c,d}=P;let s=pyramid([a,b,c,d],50,250,90,showTop);const top=a+3*b+3*c+d;
 s+=T(230,40,showTop?`top = ${a} + 3×${b} + 3×${c} + ${d} = ${top}`:'predict the top!','font-size="15" font-weight="700"');
 $('#apSvg').innerHTML=s;['a','b','c','d'].forEach(k=>$('#ap'+k.toUpperCase()+'v').textContent=P[k]);
 $('#apOut').innerHTML=showTop?`<p>Built brick by brick, the top is <b>${top}</b>. The formula a + 3b + 3c + d gives the same: ${a} + ${3*b} + ${3*c} + ${d} = ${top}.</p><p>The middle bricks count 3 times. Put the biggest numbers in the middle for the largest top.</p>`:`<p>The top is hidden. Work it out with a + 3b + 3c + d, then press the button to check.</p>`}
function drawC(){let s='';const days=['Mo','Tu','We','Th','Fr','Sa','Su'];days.forEach((d,i)=>s+=T(55+i*58,30,d,'font-size="12" font-weight="700"'));
 const sel=[N,N+1,N+7,N+8];for(let dt=1;dt<=30;dt++){const r=Math.floor((dt-1)/7),c=(dt-1)%7;const on=sel.includes(dt);s+=`<rect data-cd="${dt}" x="${30+c*58}" y="${42+r*52}" width="52" height="46" rx="6" fill="${on?BL:'transparent'}" fill-opacity="${on?.25:0}" stroke="${on?BL:GR}" style="cursor:pointer"/>`+`<text x="${56+c*58}" y="${71+r*52}" font-size="15" text-anchor="middle" pointer-events="none" ${on?'font-weight="700"':''} fill="currentColor">${dt}</text>`}
 $('#apSvg').innerHTML=s;const sum=sel.reduce((p,q)=>p+q,0);
 $('#apOut').innerHTML=`<p>Block: ${N}, ${N+1}, ${N+7}, ${N+8}. Sum = <b>${sum}</b>.</p><p>Formula: 4n + 16 = 4 × ${N} + 16 = <b>${4*N+16}</b> ✓. Diagonals: ${N} + ${N+8} = ${N+1} + ${N+7} = ${2*N+8}.</p>`}
function draw(){$('#apPC').style.display=mode==='p'?'':'none';mode==='p'?drawP():drawC()}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('apS')){P[t.id.slice(2).toLowerCase()]=+t.value;drawP()}});
 document.addEventListener('click',e=>{const r=e.target.closest&&e.target.closest('[data-cd]');if(!r||mode!=='c')return;let d=+r.dataset.cd;const col=(d-1)%7;if(col===6)d-=1;if(d+8>30)d-=7*Math.ceil((d+8-30)/7);if(d<1)d=1;N=d;drawC()})}
function labClick(b){if(b.id==='apHide'){showTop=!showTop;drawP();return true}return false}
function labChange(t){if(t.id==='apM'){mode=t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
