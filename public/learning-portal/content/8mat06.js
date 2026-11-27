/* Rai Plus content pack: Class 8 Mathematics (Ganita Prakash), Chapter 6 – We Distribute, Yet Things Multiply. */
RP.register({key:'8mat06',cls:'8',subject:'Mathematics',ch:'6',title:"We Distribute, Yet Things Multiply",color:'#6a4fb3',
crumb:"Class 8 Mathematics · Ganita Prakash",h1:"Chapter 6: We Distribute, Yet Things Multiply",sub:"The distributive property, how products change, multiplying expressions with area models, the identities (a + b)², (a − b)², (a + b)(a − b), and fast mental calculation.",heroLabel:"An area model of (a + b)²",labName:'Area model and mental-maths lab',
theme:"\n:root{--g:light-dark(#6a4fb3,#c3b3ef);--g2:light-dark(#f1edfb,#120d20);--line:light-dark(#ddd4f4,#2f2650);--bg:light-dark(#ffffff,#0c0916);--card:light-dark(#ffffff,#130f20);\n--ink:light-dark(#1b1430,#ebe6f8);--mute:light-dark(#5a5078,#bcb2d8);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#52398f}\n",
labHTML:`  <h2>Area model and mental-maths lab</h2>
  <p>Choose an identity and values for a and b. The rectangle splits into parts whose areas add up to the product. Then try the mental-maths challenge: use an identity to multiply quickly.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="amSvg" viewBox="0 0 460 320" role="img" aria-label="Area model" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Identity<select id="amI"><option value="sq">(a + b)²</option><option value="df">(a − b)²</option><option value="pd">(a + b)(a − b)</option><option value="gen">(a + b)(c + d)</option></select></label></div>
  <div class="ctrl"><label>a: <b id="amAv"></b><input type="range" class="amS" id="amA" min="2" max="12" value="7"></label> <label>b: <b id="amBv"></b><input type="range" class="amS" id="amB" min="1" max="8" value="3"></label></div>
  <div class="ctrl"><button class="btn" id="amQ">Mental-maths challenge</button> <input id="amAns" type="number" style="width:6em"> <button class="btn" id="amC">Check</button></div>
  <div class="box y" id="amOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#6a4fb3',LABNAME='Area model and mental-maths lab',MIND_CENTER='Distributive property';
const PU='#6a4fb3',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const rect=(x,y,w,h,c,t='',o=.25)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" fill-opacity="${o}" stroke="${c}" stroke-width="2"/>`+(t?T(x+w/2,y+h/2+5,t,`font-size="${Math.min(15,Math.max(10,Math.min(w,h)/3))}" font-weight="700" fill="${c}"`):'');
function heroDraw(){return `<rect x="120" y="20" width="80" height="80" fill="none" stroke="#fff" stroke-width="2.5"/><rect x="200" y="20" width="40" height="80" fill="none" stroke="#fff" stroke-width="2.5"/><rect x="120" y="100" width="80" height="40" fill="none" stroke="#fff" stroke-width="2.5"/><rect x="200" y="100" width="40" height="40" fill="none" stroke="#fff" stroke-width="2.5"/>`}
const HERO=heroDraw;
const MIND=[['Distributive property',100,50],['How products change',420,50],['Multiplying expressions',90,150],['(a + b)²',430,150],['(a − b)²',110,250],['(a + b)(a − b)',410,250]];

const C=[
{id:'d1',num:'6.1',title:'The distributive property',
 intro:'How can you find 7 × 98 in your head in two seconds?',
 obj:'Use the distributive property for numbers and expressions.',
 prior:'Class 7: expressions, letter-numbers.',
 simple:'Multiplication distributes over addition and subtraction: a(b + c) = ab + ac and a(b − c) = ab − ac. 7 × 98 = 7 × (100 − 2) = 700 − 14 = 686. 6 × 105 = 6 × 100 + 6 × 5 = 630. With letters: 3(x + 4) = 3x + 12.',
 detail:'Area model: a rectangle of width a and length (b + c) splits into two rectangles of areas ab and ac. Distributing also works in reverse (factorising): 5x + 15 = 5(x + 3). It works for negatives: −2(x − 5) = −2x + 10.',
 real:'Shopkeepers total 4 items at ₹199 as 4 × 200 − 4 = ₹796.',
 apply:'Find 9 × 47 + 9 × 53 quickly.',
 see:{w:520,h:200,f:[
  ['A rectangle a × (b + c).',rect(60,50,240,100,PU,'',.12)+lbl(40,105,'a')+lbl(180,40,'b + c')],
  ['Split it into ab and ac.',rect(60,50,160,100,PU,'ab')+rect(220,50,80,100,OR,'ac')],
  ['a(b + c) = ab + ac.',lbl(420,100,'a(b + c) = ab + ac','font-size="15" font-weight="700"')]]},
 seeNote:'Split the rectangle.',
 do:{title:'Mental shortcuts',mat:'Notebook',steps:['Compute 8 × 99, 12 × 51 and 25 × 44 using distribution.'],obs:'792, 612, 1100.',why:'Distributive property.',lab:false},
 memo:'"Multiply each part, then add."',
 miscon:['"3(x + 4) = 3x + 4." Multiply both terms: 3x + 12.'],
 terms:['Distributive property','Factorise','Area model'],
 q:{q:'7 × 102 =',o:['714','704','724','7102'],a:0,why:'700 + 14.'},
 exam:'Use distributive property: 2 marks.'},

{id:'d2',num:'6.2',title:'How does a product change?',
 intro:'23 × 27 = 621. If 23 becomes 24, by how much does the product grow?',
 obj:'Predict how products change when factors change.',
 prior:'6.1.',
 simple:'If one factor increases by 1, the product increases by the other factor: 24 × 27 = 23 × 27 + 27 = 648. In letters: (a + 1)b = ab + b. If both factors increase by 1: (a + 1)(b + 1) = ab + a + b + 1 — the product grows by a + b + 1.',
 detail:'If one factor is doubled, the product doubles; if both are doubled, it becomes four times. If a increases by 1 and b decreases by 1: (a + 1)(b − 1) = ab − a + b − 1, so the product changes by b − a − 1. For 23 × 27 → 24 × 26: changes by 27 − 23 − 1 = 3, so 624.',
 real:'Adding one more row of 27 chairs to 23 rows adds 27 chairs.',
 apply:'If 15 × 18 = 270, find 16 × 18 and 16 × 19 without multiplying from scratch.',
 see:{w:520,h:220,f:[
  ['a × b rectangle.',rect(60,40,230,135,PU,'ab',.15)+lbl(175,30,'b')+lbl(45,110,'a')],
  ['Add 1 to a: extra strip of b.',rect(60,175,230,22,OR,'b')],
  ['Add 1 to b too: + a + 1.',rect(290,40,22,135,GN,'')+rect(290,175,22,22,BL,'')+lbl(420,110,'(a+1)(b+1) = ab + a + b + 1','font-size="12" font-weight="700"')]]},
 seeNote:'Each change adds a strip.',
 do:{title:'Grid strips',mat:'Grid paper',steps:['Draw 6 × 8; add a row; add a column.','Count added squares.'],obs:'+8, then +7.',why:'Products change predictably.',lab:false},
 memo:'"One more of a adds one b."',
 miscon:['"Increasing both by 1 increases the product by 2." It increases by a + b + 1.'],
 terms:['Factor','Product','Change in product'],
 q:{q:'12 × 15 = 180. 13 × 15 =',o:['181','195','192','193'],a:1,why:'+15.'},
 exam:'Reason about change: 2 marks.'},

{id:'d3',num:'6.3',title:'Multiplying two expressions',
 intro:'How do you multiply (x + 3)(x + 5)?',
 obj:'Multiply binomials using distribution and area models.',
 prior:'6.1.',
 simple:'Distribute each term of the first bracket over the second: (a + b)(c + d) = ac + ad + bc + bd. (x + 3)(x + 5) = x² + 5x + 3x + 15 = x² + 8x + 15. Area model: a rectangle with sides (a + b) and (c + d) splits into four smaller rectangles.',
 detail:'Like terms combine: 5x + 3x = 8x. With subtraction: (x + 4)(x − 2) = x² − 2x + 4x − 8 = x² + 2x − 8. Numbers: 23 × 27 = (20 + 3)(20 + 7) = 400 + 140 + 60 + 21 = 621.',
 real:'A garden (x + 3) m by (x + 5) m has area x² + 8x + 15 square metres.',
 apply:'Expand (2x + 1)(x + 4).',
 see:{w:520,h:220,f:[
  ['(a + b) by (c + d).',lbl(160,25,'c','font-size="14"')+lbl(290,25,'d','font-size="14"')+lbl(40,90,'a','font-size="14"')+lbl(40,175,'b','font-size="14"')],
  ['Four parts.',rect(60,40,200,100,PU,'ac')+rect(260,40,60,100,OR,'ad')+rect(60,140,200,60,BL,'bc')+rect(260,140,60,60,GN,'bd')],
  ['Sum of four areas.',lbl(430,120,'ac + ad + bc + bd','font-size="14" font-weight="700"')]]},
 seeNote:'Every term times every term.',
 do:{title:'Card areas',mat:'Algebra tiles or paper',steps:['Build (x + 2)(x + 3) with tiles.','Count pieces.'],obs:'x² + 5x + 6.',why:'Area model.',lab:true},
 memo:'"First, outer, inner, last."',
 miscon:['"(x + 3)(x + 5) = x² + 15." The middle terms are missing.'],
 terms:['Binomial','Expand','Like terms'],
 q:{q:'(x + 2)(x + 6) =',o:['x² + 12','x² + 8x + 12','x² + 6x + 8','2x + 8'],a:1,why:'x² + 6x + 2x + 12.'},
 exam:'Multiply expressions: 2–3 marks.'},

{id:'d4',num:'6.4',title:'Identity: (a + b)² = a² + 2ab + b²',
 intro:'Can you find 103² in your head?',
 obj:'Use the square-of-a-sum identity with area models and numbers.',
 prior:'6.3.',
 simple:'(a + b)² = (a + b)(a + b) = a² + ab + ab + b² = a² + 2ab + b². Area model: a big square of side (a + b) contains a square a², a square b², and two rectangles ab. 103² = (100 + 3)² = 10000 + 600 + 9 = 10609.',
 detail:'An identity is true for all values of the letters. Common mistake: (a + b)² is NOT a² + b² — the 2ab term matters. (2x + 3)² = 4x² + 12x + 9. Squares of numbers ending in 5: 35² = (30 + 5)² = 900 + 300 + 25 = 1225.',
 real:'A square plot is extended by b metres on two sides: new area = a² + 2ab + b².',
 apply:'Find 52² and 1001² using the identity.',
 see:{w:520,h:240,f:[
  ['Square of side a + b.',lbl(160,22,'a','font-size="14"')+lbl(285,22,'b','font-size="14"')],
  ['a², ab, ab, b².',rect(80,30,160,160,PU,'a²')+rect(240,30,70,160,OR,'ab')+rect(80,190,160,45,OR,'ab')+rect(240,190,70,45,GN,'b²')],
  ['(a + b)² = a² + 2ab + b².',lbl(420,130,'a² + 2ab + b²','font-size="15" font-weight="700"')]]},
 seeNote:'Don\'t forget the two rectangles.',
 do:{title:'Paper squares',mat:'Coloured paper',steps:['Cut a², b² and two ab pieces.','Assemble the big square.'],obs:'They fit exactly.',why:'Identity.',lab:true},
 memo:'"First squared, twice the product, last squared."',
 miscon:['"(a + b)² = a² + b²." Missing 2ab.'],
 terms:['Identity','Square of a sum','Perfect square'],
 q:{q:'(x + 4)² =',o:['x² + 16','x² + 8x + 16','x² + 4x + 16','2x + 8'],a:1,why:'2 × 4 = 8.'},
 exam:'Identity (a + b)²: 2–3 marks.'},

{id:'d5',num:'6.5',title:'Identity: (a − b)² = a² − 2ab + b²',
 intro:'What is 99² — without long multiplication?',
 obj:'Use the square-of-a-difference identity.',
 prior:'6.4.',
 simple:'(a − b)² = a² − 2ab + b². 99² = (100 − 1)² = 10000 − 200 + 1 = 9801. 48² = (50 − 2)² = 2500 − 200 + 4 = 2304.',
 detail:'Area model: start with a², cut off two strips of ab, but the corner b² was removed twice, so add it back once. Also (a − b)² = (b − a)²: squares of opposites are equal. (3x − 2)² = 9x² − 12x + 4.',
 real:'99 × 99 = 9801 is easy with this identity.',
 apply:'Find 98² and 197².',
 see:{w:520,h:240,f:[
  ['Start with a².',rect(80,30,200,200,PU,'',.12)+lbl(180,22,'a','font-size="14"')],
  ['Remove two strips of ab…',rect(230,30,50,200,OR,'',.3)+rect(80,180,200,50,OR,'',.3)],
  ['…add back b² (removed twice).',rect(230,180,50,50,GN,'b²',.45)+rect(80,30,150,150,PU,'(a−b)²',.25)+lbl(420,130,'a² − 2ab + b²','font-size="15" font-weight="700"')]]},
 seeNote:'Subtract twice, add the corner back.',
 do:{title:'Near-hundred squares',mat:'Notebook',steps:['Compute 97², 96², 102², 104² by identities.'],obs:'Fast!',why:'Identities.',lab:false},
 memo:'"Minus twice the product, plus the last squared."',
 miscon:['"(a − b)² = a² − b²." Missing −2ab.'],
 terms:['Square of a difference'],
 q:{q:'99² =',o:['9801','9810','9900','9981'],a:0,why:'10000 − 200 + 1.'},
 exam:'Identity (a − b)²: 2 marks.'},

{id:'d6',num:'6.6',title:'Identity: (a + b)(a − b) = a² − b²',
 intro:'How can 104 × 96 be done in a flash?',
 obj:'Use the difference-of-squares identity for multiplication and factorisation.',
 prior:'6.4, 6.5.',
 simple:'(a + b)(a − b) = a² − ab + ab − b² = a² − b². 104 × 96 = (100 + 4)(100 − 4) = 10000 − 16 = 9984. 23 × 27 = (25 − 2)(25 + 2) = 625 − 4 = 621.',
 detail:'Reverse for factorising: x² − 49 = (x + 7)(x − 7); 51² − 49² = (51 + 49)(51 − 49) = 100 × 2 = 200. Area model: cut a b × (a − b) strip off a² − b² and move it to form an (a + b) × (a − b) rectangle.',
 real:'Quick calculations like 47 × 53 = 50² − 3² = 2491 impress in mental-maths quizzes.',
 apply:'Find 63 × 57 and 101² − 99².',
 see:{w:520,h:240,f:[
  ['a² with b² cut from the corner.',rect(80,30,180,180,PU,'',.25)+rect(200,150,60,60,'#fff','',1)+`<rect x="200" y="150" width="60" height="60" fill="none" stroke="${GR}" stroke-dasharray="4 4"/>`+lbl(170,22,'a')],
  ['Move the strip…',rect(80,150,120,60,OR,'',.35)],
  ['…to make (a + b)(a − b).',rect(300,30,60,180,OR,'',.35)+lbl(440,130,'a² − b²','font-size="16" font-weight="700"')+lbl(440,155,'= (a+b)(a−b)','font-size="12"')]]},
 seeNote:'Rearrange the same area.',
 do:{title:'Pairs around a centre',mat:'Notebook',steps:['Compute 19 × 21, 28 × 32, 45 × 55.'],obs:'399, 896, 2475.',why:'a² − b².',lab:true},
 memo:'"Sum times difference = difference of squares."',
 miscon:['"(a + b)(a − b) = a² + b²." It is a² − b².'],
 terms:['Difference of squares','Factorisation'],
 q:{q:'105 × 95 =',o:['9975','10025','9925','10000'],a:0,why:'10000 − 25.'},
 exam:'Difference of squares: 2–3 marks.'}
];

const CARDS=[['Distributive','a(b + c) = ab + ac.'],['Change','(a + 1)b = ab + b.'],['Both +1','(a+1)(b+1) = ab + a + b + 1.'],['Binomials','(a + b)(c + d) = ac + ad + bc + bd.'],['(a + b)²','a² + 2ab + b².'],['(a − b)²','a² − 2ab + b².'],['(a + b)(a − b)','a² − b².'],['103²','10000 + 600 + 9.'],['99²','10000 − 200 + 1.'],['104 × 96','10000 − 16.']];

const Q=[
 {lv:1,q:'5(x + 3) =',o:['5x + 3','5x + 15','x + 15','5x + 8'],a:1,w:'Distribute.'},
 {lv:1,q:'(a + b)² =',o:['a² + b²','a² + 2ab + b²','2a + 2b','a² − b²'],a:1,w:'Identity.'},
 {lv:1,q:'(a + b)(a − b) =',o:['a² + b²','a² − b²','a² − 2ab','2ab'],a:1,w:'Identity.'},
 {lv:2,q:'101² =',o:['10201','10101','10001','10200'],a:0,w:'10000 + 200 + 1.'},
 {lv:2,q:'(x + 3)(x − 7) =',o:['x² − 4x − 21','x² + 4x − 21','x² − 21','x² − 10x + 21'],a:0,w:'−7x + 3x.'},
 {lv:2,q:'98² =',o:['9604','9804','9404','9608'],a:0,w:'10000 − 400 + 4.'},
 {lv:3,q:'47 × 53 =',o:['2491','2500','2509','2481'],a:0,w:'2500 − 9.'},
 {lv:3,q:'18 × 25 = 450. 19 × 25 =',o:['451','475','470','455'],a:1,w:'+25.'},
 {lv:4,q:'75² − 25² =',o:['5000','2500','50','10000'],a:0,w:'100 × 50.'},
 {lv:4,q:'(2x − 3)² =',o:['4x² − 9','4x² − 12x + 9','4x² − 6x + 9','2x² − 12x + 9'],a:1,w:'2·2x·3 = 12x.'},
 {lv:5,open:true,m:3,q:'Use an area model to show that (a + b)² = a² + 2ab + b².',ans:['Draw square of side a + b (1)','Divide into a², b² and two a × b rectangles (1)','Total area a² + 2ab + b² (1)']},
 {lv:5,open:true,m:3,q:'Evaluate using identities: (i) 1002² (ii) 996 × 1004 (iii) 89².',ans:['1002² = 1000000 + 4000 + 4 = 1004004 (1)','996 × 1004 = 1000000 − 16 = 999984 (1)','89² = 8100 − 180 + 1 = 7921 (1)']}
];

const ONEMIN=['Distributive property.','How products change.','Multiplying binomials.','(a + b)².','(a − b)².','(a + b)(a − b).'];
const KEYS=[['distributive',/distribut/i],['change',/increase|change/i],['expand',/expand|binomial/i],['square of sum',/\(a \+ b\)²|square of a sum/i],['square of difference',/\(a − b\)²|difference/i],['difference of squares',/a² − b²|difference of squares/i]];

/* ---------- lab ---------- */
let id='sq',A=7,B=3,quiz=null,wired=false;
function draw(){const u=Math.min(20,240/(A+B));let s='';const x0=40,y0=30;
 if(id==='sq'){const a=A*u,b=B*u;s+=rect(x0,y0,a,a,PU,`${A}²=${A*A}`)+rect(x0+a,y0,b,a,OR,`${A*B}`)+rect(x0,y0+a,a,b,OR,`${A*B}`)+rect(x0+a,y0+a,b,b,GN,`${B*B}`);s+=T(x0+a/2,y0-8,'a='+A,'font-size="11"')+T(x0+a+b/2,y0-8,'b='+B,'font-size="11"');
  s+=T(360,120,`(${A}+${B})² = ${(A+B)**2}`,'font-size="15" font-weight="700"')+T(360,150,`${A*A} + 2×${A*B} + ${B*B}`,'font-size="13"')+T(360,175,`= ${A*A+2*A*B+B*B}`,'font-size="15" font-weight="700" fill="'+GN+'"')}
 else if(id==='df'){const bb=Math.min(B,A-1);const a=A*u,b=bb*u;s+=rect(x0,y0,a,a,PU,'',.1)+rect(x0+a-b,y0,b,a,OR,'',.25)+rect(x0,y0+a-b,a,b,OR,'',.25)+rect(x0+a-b,y0+a-b,b,b,GN,`${bb*bb}`,.45)+rect(x0,y0,a-b,a-b,PU,`${(A-bb)**2}`,.3);
  s+=T(360,120,`(${A}−${bb})² = ${(A-bb)**2}`,'font-size="15" font-weight="700"')+T(360,150,`${A*A} − 2×${A*bb} + ${bb*bb}`,'font-size="13"')+T(360,175,`= ${A*A-2*A*bb+bb*bb}`,'font-size="15" font-weight="700" fill="'+GN+'"')}
 else if(id==='pd'){const bb=Math.min(B,A-1);const a=A*u,b=bb*u;s+=rect(x0,y0,a,a-b,PU,`${A}×${A-bb}`,.25)+rect(x0,y0+a-b,a-b,b,OR,`${A-bb}×${bb}`,.3)+`<rect x="${x0+a-b}" y="${y0+a-b}" width="${b}" height="${b}" fill="none" stroke="${GR}" stroke-dasharray="4 4"/>`+T(x0+a-b/2,y0+a-b/2+4,`−${bb}²`,'font-size="11" fill="'+GR+'"');
  s+=T(360,110,`(${A}+${bb})(${A}−${bb})`,'font-size="15" font-weight="700"')+T(360,140,`${A*A} − ${bb*bb}`,'font-size="13"')+T(360,170,`= ${(A+bb)*(A-bb)}`,'font-size="15" font-weight="700" fill="'+GN+'"')+T(360,200,'move the orange strip to the right side →','font-size="10"')}
 else{const c=Math.max(1,A-2),d=B+1;const uu=Math.min(20,240/Math.max(A+B,c+d));const a=A*uu,b=B*uu,cc=c*uu,dd=d*uu;s+=rect(x0,y0,cc,a,PU,`${A*c}`)+rect(x0+cc,y0,dd,a,OR,`${A*d}`)+rect(x0,y0+a,cc,b,BL,`${B*c}`)+rect(x0+cc,y0+a,dd,b,GN,`${B*d}`);
  s+=T(360,110,`(${A}+${B})(${c}+${d})`,'font-size="15" font-weight="700"')+T(360,140,`${A*c}+${A*d}+${B*c}+${B*d}`,'font-size="13"')+T(360,170,`= ${(A+B)*(c+d)}`,'font-size="15" font-weight="700" fill="'+GN+'"')}
 $('#amSvg').innerHTML=s;$('#amAv').textContent=A;$('#amBv').textContent=B;
 if(!quiz)$('#amOut').innerHTML=`<p>${{sq:'(a + b)² = a² + 2ab + b²: the square splits into a², b² and two ab rectangles.',df:'(a − b)² = a² − 2ab + b²: remove two ab strips and add back the corner b² removed twice.',pd:'(a + b)(a − b) = a² − b²: the area left after cutting b² from a² rearranges into an (a + b) × (a − b) rectangle.',gen:'(a + b)(c + d) = ac + ad + bc + bd: four rectangles.'}[id]}</p>`}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(!e.target||!e.target.classList||!e.target.classList.contains('amS'))return;if(e.target.id==='amA')A=+e.target.value;else B=+e.target.value;draw()})}
function labClick(bt){if(bt.id==='amQ'){const t=Math.floor(Math.random()*4);const base=[20,30,40,50,60,70,100][Math.floor(Math.random()*7)],k=Math.floor(Math.random()*4)+1;
 quiz=[{q:`${base+k}²`,a:(base+k)**2,h:`(${base} + ${k})² = ${base*base} + ${2*base*k} + ${k*k}`},{q:`${base-k}²`,a:(base-k)**2,h:`(${base} − ${k})² = ${base*base} − ${2*base*k} + ${k*k}`},{q:`${base+k} × ${base-k}`,a:(base+k)*(base-k),h:`${base}² − ${k}² = ${base*base} − ${k*k}`},{q:`${base+k} × ${base+k+2}`,a:(base+k)*(base+k+2),h:`(${base+k+1})² − 1`}][t];$('#amOut').innerHTML=`<p><b>Challenge:</b> ${quiz.q} = ? (use an identity)</p>`;return true}
 if(bt.id==='amC'){if(!quiz){$('#amOut').innerHTML='<p>Press the challenge button first.</p>';return true}const g=+$('#amAns').value;$('#amOut').innerHTML=g===quiz.a?`<p class="fb ok">Correct! ${quiz.q} = ${quiz.a}. ${quiz.h}.</p>`:`<p class="fb no">Not quite: ${quiz.q} = ${quiz.a}. Hint: ${quiz.h}.</p>`;quiz=null;return true}return false}
function labChange(t){if(t.id==='amI'){id=t.value;quiz=null;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
