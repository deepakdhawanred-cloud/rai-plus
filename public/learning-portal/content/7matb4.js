/* Rai Plus content pack: Class 7 Mathematics (Ganita Prakash Part 2), Chapter 4 – Another Peek Beyond the Point (multiplying and dividing decimals). */
RP.register({key:'7matb4',cls:'7',subject:'Mathematics',ch:'II-4',title:"Another Peek Beyond the Point",color:'#6a4fb3',
crumb:"Class 7 Mathematics · Ganita Prakash Part 2",h1:"Part 2 · Chapter 4: Another Peek Beyond the Point",sub:"Multiplying and dividing decimals by 10, 100 and 1000, multiplying decimals with the grid model, counting decimal places, dividing decimals, and estimating.",heroLabel:"A 10 × 10 grid showing 0.3 × 0.4",labName:'Decimal grid and shift lab',
theme:"\n:root{--g:light-dark(#6a4fb3,#c3b3ef);--g2:light-dark(#f1edfb,#120d20);--line:light-dark(#ddd4f4,#2f2650);--bg:light-dark(#ffffff,#0c0916);--card:light-dark(#ffffff,#130f20);\n--ink:light-dark(#1b1430,#ebe6f8);--mute:light-dark(#5a5078,#bcb2d8);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#52398f}\n",
labHTML:`  <h2>Decimal grid and shift lab</h2>
  <p>Grid mode: the square is 1 whole. Shade a × b with the sliders and count the double-shaded small squares (each is 0.01). Shift mode: watch digits move when you multiply or divide by 10, 100 or 1000. Then try the quiz.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="dSvg" viewBox="0 0 460 320" role="img" aria-label="Decimal grid" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="dM"><option value="grid">Grid: a × b</option><option value="shift">Shift: × or ÷ 10, 100, 1000</option></select></label></div>
  <div class="ctrl" id="dGridC"><label>a = <b id="dAv"></b><input type="range" class="dS" id="dA" min="1" max="10" value="3"></label><label>b = <b id="dBv"></b><input type="range" class="dS" id="dB" min="1" max="10" value="4"></label></div>
  <div class="ctrl" id="dShiftC" style="display:none"><label>Number<input id="dN" type="number" step="any" value="3.75" style="width:6em"></label><label>Operation<select id="dOp"><option value="1">× 10</option><option value="2">× 100</option><option value="3">× 1000</option><option value="-1">÷ 10</option><option value="-2">÷ 100</option><option value="-3">÷ 1000</option></select></label><button class="btn" id="dGo">Shift</button></div>
  <div class="ctrl"><button class="btn" id="dQ">Quiz</button> <input id="dAns" type="number" step="any" style="width:6em"> <button class="btn" id="dC">Check</button></div>
  <div class="box y" id="dOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#6a4fb3',LABNAME='Decimal grid and shift lab',MIND_CENTER='Decimals × ÷';
const PU='#6a4fb3',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const fx=v=>String(+v.toFixed(6));
function grid(x0,y0,S,a,b){let s='';const c=S/10;for(let i=0;i<10;i++)for(let j=0;j<10;j++){const A=i<a,B=j<b;s+=`<rect x="${x0+i*c}" y="${y0+j*c}" width="${c}" height="${c}" fill="${A&&B?PU:A?BL:B?OR:'none'}" opacity="${A&&B?.75:.22}" stroke="${GR}" stroke-width=".5"/>`}return s+`<rect x="${x0}" y="${y0}" width="${S}" height="${S}" fill="none" stroke="${ink}" stroke-width="2"/>`}
function heroDraw(){let s='';for(let i=0;i<10;i++)for(let j=0;j<10;j++)s+=`<rect x="${120+i*14}" y="${10+j*14}" width="14" height="14" fill="${i<3&&j<4?'#fff':'none'}" opacity="${i<3&&j<4?.8:1}" stroke="#fff" stroke-width=".5"/>`;return s}
const HERO=heroDraw;
const MIND=[['× and ÷ by 10s',100,50],['Grid model',420,50],['Decimal places',90,150],['Decimal × decimal',430,150],['Division',110,250],['Estimation',410,250]];

const C=[
{id:'d1',num:'4.1',title:'Multiplying and dividing by 10, 100, 1000',
 intro:'A pen costs ₹12.75. What do 10 pens cost? 100 pens?',
 obj:'Multiply and divide decimals by powers of 10 by shifting digits.',
 prior:'Part 1 Ch 3: place value of decimals.',
 simple:'Multiplying by 10 moves every digit one place to the left (the number becomes 10 times bigger): 12.75 × 10 = 127.5. × 100 moves two places: 1275. Dividing by 10 moves every digit one place to the right: 12.75 ÷ 10 = 1.275; ÷ 100 = 0.1275.',
 detail:'We often say "the decimal point moves", but really the digits change place value. Add zeros as placeholders when needed: 3.4 × 1000 = 3400; 5 ÷ 1000 = 0.005. Units: 2.5 m = 250 cm (× 100); 750 g = 0.75 kg (÷ 1000).',
 real:'Converting 1.6 km to metres: 1.6 × 1000 = 1600 m.',
 apply:'Find 0.045 × 100 and 63.2 ÷ 1000.',
 see:{w:520,h:200,f:[
  ['12.75',lbl(260,50,'12.75','font-size="24"')],
  ['× 10: digits move one place left.',lbl(260,100,'× 10 → 127.5','font-size="20" fill="'+GN+'"')],
  ['÷ 10: digits move one place right.',lbl(260,150,'÷ 10 → 1.275','font-size="20" fill="'+OR+'"')]]},
 seeNote:'Count the zeros; shift that many places.',
 do:{title:'Place-value strip',mat:'Paper place-value chart, digit cards',steps:['Place 4.56 on the chart.','Slide the digits left one column (× 10).'],obs:'45.6.',why:'Place value changes.',lab:true},
 memo:'"× 10s → left; ÷ 10s → right."',
 miscon:['"× 10 means add a zero: 3.4 × 10 = 3.40." The digits shift: 34.'],
 terms:['Power of 10','Place value','Placeholder zero'],
 q:{q:'7.3 × 100 =',o:['7.300','73','730','0.073'],a:2,why:'Two places left.'},
 exam:'× and ÷ by powers of 10: 1 mark.'},

{id:'d2',num:'4.2',title:'Multiplying a decimal by a whole number',
 intro:'A ribbon costs ₹4.25 per metre. What do 6 metres cost?',
 obj:'Multiply decimals by whole numbers.',
 prior:'4.1.',
 simple:'Multiply as whole numbers, then place the decimal point. 4.25 × 6: 425 × 6 = 2550. 4.25 has 2 decimal places, so the answer has 2: 25.50 = 25.5. Or think: 4.25 = 425 hundredths; 6 × 425 hundredths = 2550 hundredths = 25.5.',
 detail:'Repeated addition also works: 0.3 × 4 = 0.3 + 0.3 + 0.3 + 0.3 = 1.2. Check by estimating: 4.25 × 6 is about 4 × 6 = 24, so 25.5 is reasonable.',
 real:'Petrol at ₹96.70 per litre × 5 litres ≈ ₹483.50.',
 apply:'Find 3.08 × 7.',
 see:{w:520,h:200,f:[
  ['4.25 = 425 hundredths.',lbl(260,50,'4.25 = 425 hundredths','font-size="18"')],
  ['× 6 = 2550 hundredths.',lbl(260,100,'425 × 6 = 2550 hundredths','font-size="18"')],
  ['= 25.50 = 25.5',lbl(260,150,'= 25.5','font-size="22" font-weight="700"')]]},
 seeNote:'Think in hundredths.',
 do:{title:'Shopping bill',mat:'Price list',steps:['Find the cost of 3 notebooks at ₹24.50.'],obs:'₹73.50.',why:'Decimal × whole.',lab:false},
 memo:'"Multiply, then count places."',
 miscon:['"0.3 × 4 = 0.12." It is 1.2 (12 tenths).'],
 terms:['Tenths','Hundredths','Product'],
 q:{q:'0.6 × 5 =',o:['0.30','3','30','0.03'],a:1,why:'30 tenths.'},
 exam:'Decimal × whole number: 1–2 marks.'},

{id:'d3',num:'4.3',title:'Decimal × decimal: the grid model',
 intro:'What is 0.3 × 0.4? Is it bigger or smaller than 0.3?',
 obj:'Use the area model to multiply decimals.',
 prior:'Fractions × fractions (Part 1 Ch 8).',
 simple:'Draw a square as 1 whole, divided into 10 × 10 = 100 small squares (each 0.01). Shade 3 columns (0.3) and 4 rows (0.4). The overlap is 3 × 4 = 12 small squares = 0.12. So 0.3 × 0.4 = 0.12 — smaller than both, because we take a part of a part.',
 detail:'As fractions: 3/10 × 4/10 = 12/100 = 0.12. Multiplying by a number less than 1 makes a number smaller; multiplying by a number more than 1 makes it bigger. 1.2 × 0.5 = 0.6 (half of 1.2).',
 real:'A garden 0.6 km long and 0.5 km wide has area 0.3 sq km.',
 apply:'Use a grid to find 0.7 × 0.2.',
 see:{w:520,h:240,f:[
  ['Shade 0.3 (columns).',grid(160,20,200,3,0)],
  ['Shade 0.4 (rows).',grid(160,20,200,3,4)],
  ['Overlap: 12 hundredths = 0.12.',lbl(450,120,'0.3 × 0.4','font-size="16"')+lbl(450,145,'= 0.12','font-size="18" font-weight="700" fill="'+PU+'"')]]},
 seeNote:'Part of a part is smaller.',
 do:{title:'Grid paper',mat:'10 × 10 grid paper, two colours',steps:['Show 0.5 × 0.6.','Count the overlap.'],obs:'30 squares = 0.30.',why:'Area model.',lab:true},
 memo:'"Part of a part."',
 miscon:['"Multiplication always makes bigger." Not when a factor is below 1.'],
 terms:['Area model','Hundredth','Overlap'],
 q:{q:'0.2 × 0.3 =',o:['0.6','0.06','6','0.006'],a:1,why:'6 hundredths.'},
 exam:'Decimal × decimal: 2 marks.'},

{id:'d4',num:'4.4',title:'Counting decimal places',
 intro:'Is there a quick rule for 1.25 × 0.4?',
 obj:'Multiply decimals using the decimal-places rule.',
 prior:'4.3.',
 simple:'Multiply as whole numbers, ignoring the points. Count the total decimal places in both numbers. Put that many decimal places in the answer. 1.25 × 0.4: 125 × 4 = 500; places 2 + 1 = 3 → 0.500 = 0.5.',
 detail:'Why it works: 1.25 = 125/100 and 0.4 = 4/10, so the product is 500/1000. Always estimate to check: 1.25 × 0.4 ≈ 1 × 0.4 = 0.4, so 0.5 is sensible. Trailing zeros after the point can be dropped (0.500 = 0.5).',
 real:'Cloth at ₹85.5 per metre × 2.4 m = ₹205.2.',
 apply:'Find 2.06 × 1.5.',
 see:{w:520,h:200,f:[
  ['1.25 × 0.4',lbl(260,50,'1.25 × 0.4','font-size="22"')],
  ['125 × 4 = 500; places 2 + 1 = 3.',lbl(260,100,'125 × 4 = 500    (2 + 1 = 3 places)','font-size="16"')],
  ['= 0.500 = 0.5',lbl(260,150,'= 0.500 = 0.5','font-size="22" font-weight="700"')]]},
 seeNote:'Total places in, same places out.',
 do:{title:'Rule check',mat:'Calculator',steps:['Do 5 products by the rule.','Check with a calculator.'],obs:'Same answers.',why:'Fractions with powers of 10.',lab:false},
 memo:'"Count them in, count them out."',
 miscon:['"Line up the decimal points to multiply." That is for adding; for multiplying, count places.'],
 terms:['Decimal places','Trailing zero'],
 q:{q:'0.05 × 0.3 =',o:['0.15','0.015','1.5','0.0015'],a:1,why:'3 places.'},
 exam:'Multiply decimals: 2 marks.'},

{id:'d5',num:'4.5',title:'Dividing decimals',
 intro:'₹25.5 shared among 5 friends, or 2.4 m of ribbon cut into 0.3 m pieces — how?',
 obj:'Divide a decimal by a whole number and by a decimal.',
 prior:'4.1–4.4.',
 simple:'Decimal ÷ whole: divide as usual, placing the point above the point. 25.5 ÷ 5 = 5.1. Decimal ÷ decimal: make the divisor a whole number by multiplying both numbers by the same power of 10. 2.4 ÷ 0.3 = 24 ÷ 3 = 8 (8 pieces).',
 detail:'The quotient does not change if both numbers are multiplied by the same number: 1.44 ÷ 0.12 = 144 ÷ 12 = 12. Dividing by a number less than 1 gives a bigger answer: 3 ÷ 0.5 = 6 (how many halves in 3?).',
 real:'A 1.5 L bottle fills how many 0.25 L glasses? 1.5 ÷ 0.25 = 150 ÷ 25 = 6.',
 apply:'Find 7.2 ÷ 0.08.',
 see:{w:520,h:200,f:[
  ['2.4 ÷ 0.3',lbl(260,50,'2.4 ÷ 0.3','font-size="22"')],
  ['× 10 both: 24 ÷ 3.',lbl(260,100,'(× 10 both)  24 ÷ 3','font-size="18"')],
  ['= 8 pieces.',`<rect x="60" y="140" width="400" height="22" fill="none" stroke="${ink}"/>`+[...Array(8)].map((_,k)=>`<line x1="${60+k*50}" y1="140" x2="${60+k*50}" y2="162" stroke="${PU}"/>`).join('')+lbl(260,190,'8 pieces of 0.3 m','font-weight="700"')]]},
 seeNote:'Make the divisor whole.',
 do:{title:'Pour and count',mat:'1 L water, 0.2 L cup',steps:['How many cups fill 1 L?'],obs:'5.',why:'1 ÷ 0.2 = 10 ÷ 2.',lab:false},
 memo:'"Scale both, then share."',
 miscon:['"Division always makes smaller." Not when dividing by less than 1.'],
 terms:['Dividend','Divisor','Quotient'],
 q:{q:'4.5 ÷ 0.9 =',o:['0.5','5','50','4.05'],a:1,why:'45 ÷ 9.'},
 exam:'Divide decimals: 2 marks.'},

{id:'d6',num:'4.6',title:'Estimating and real-life problems',
 intro:'Is 3.9 × 5.1 about 2, 20 or 200?',
 obj:'Estimate decimal products and quotients and solve problems.',
 prior:'4.1–4.5.',
 simple:'Round to easy numbers first: 3.9 × 5.1 ≈ 4 × 5 = 20 (exact: 19.89). Estimation tells you where the decimal point should be. Word problems: unit prices, measures, averages — decide × or ÷, estimate, then calculate.',
 detail:'Average: total ÷ count. Five runners: 12.4 s, 12.8 s, 13.1 s, 12.5 s, 13.2 s → total 64 s ÷ 5 = 12.8 s. Unit price: 2.5 kg for ₹150 → ₹60 per kg. Better buy: compare price per unit.',
 real:'Which is cheaper: 1.5 L for ₹90 or 2 L for ₹110? ₹60/L vs ₹55/L → the 2 L bottle.',
 apply:'A car runs 18.5 km on 1 litre. How far on 6.4 litres? Estimate first.',
 see:{w:520,h:200,f:[
  ['3.9 × 5.1 ≈ ?',lbl(260,50,'3.9 × 5.1 ≈ 4 × 5 = 20','font-size="18"')],
  ['Exact: 19.89 — close to 20.',lbl(260,100,'exact: 19.89','font-size="18" fill="'+GN+'"')],
  ['Not 1.989 or 198.9!',lbl(260,150,'1.989 ✗     198.9 ✗','font-size="18" fill="'+OR+'"')]]},
 seeNote:'Estimate places the point.',
 do:{title:'Better buy',mat:'Grocery labels',steps:['Find price per kg or per litre for two pack sizes.','Which is the better buy?'],obs:'Bigger packs often cheaper per unit.',why:'Unit rate by division.',lab:false},
 memo:'"Estimate first, calculate next, check last."',
 miscon:['"Bigger pack is always cheaper per unit." Check by dividing.'],
 terms:['Estimate','Unit price','Average'],
 q:{q:'Best estimate of 7.8 × 2.1:',o:['1.6','16','160','1600'],a:1,why:'8 × 2.'},
 exam:'Word problems with decimals: 3 marks.'}
];

const CARDS=[['× 10, 100, 1000','Digits shift left 1, 2, 3 places.'],['÷ 10, 100, 1000','Digits shift right.'],['Decimal × whole','Multiply, then place the point.'],['Grid model','0.3 × 0.4 = 12 hundredths.'],['Part of a part','× number < 1 makes smaller.'],['Decimal places','Total places in = places out.'],['Decimal ÷ whole','Point above point.'],['Decimal ÷ decimal','Make divisor whole by × 10s.'],['÷ number < 1','Answer bigger.'],['Estimate','Round first to place the point.']];

const Q=[
 {lv:1,q:'5.6 × 10 =',o:['5.60','56','560','0.56'],a:1,w:'One place.'},
 {lv:1,q:'42.7 ÷ 100 =',o:['4.27','0.427','4270','0.0427'],a:1,w:'Two places right.'},
 {lv:1,q:'0.4 × 3 =',o:['0.12','1.2','12','0.012'],a:1,w:'12 tenths.'},
 {lv:2,q:'0.6 × 0.7 =',o:['4.2','0.42','0.042','42'],a:1,w:'2 places.'},
 {lv:2,q:'1.2 × 0.5 =',o:['6','0.6','0.06','60'],a:1,w:'Half of 1.2.'},
 {lv:2,q:'9.6 ÷ 3 =',o:['3.2','32','0.32','3.02'],a:0,w:'Point above point.'},
 {lv:3,q:'3.6 ÷ 0.4 =',o:['0.9','9','90','1.44'],a:1,w:'36 ÷ 4.'},
 {lv:3,q:'2.5 kg costs ₹175. Price per kg:',o:['₹70','₹7','₹437.5','₹17.5'],a:0,w:'175 ÷ 2.5.'},
 {lv:4,q:'Which is greater than 8?',o:['8 × 0.9','8 ÷ 0.9','8 × 0.1','8 ÷ 10'],a:1,w:'÷ less than 1.'},
 {lv:4,q:'Best estimate of 49.8 ÷ 4.9:',o:['1','10','100','0.1'],a:1,w:'50 ÷ 5.'},
 {lv:5,open:true,m:3,q:'Use a 10 × 10 grid to explain why 0.4 × 0.5 = 0.2.',ans:['Grid = 1 whole, each small square 0.01 (1)','Shade 4 columns and 5 rows; overlap 20 squares (1)','20 hundredths = 0.20 = 0.2 (1)']},
 {lv:5,open:true,m:3,q:'Juice: 1.5 L for ₹96 or 2.5 L for ₹150. Which is the better buy? Show working.',ans:['96 ÷ 1.5 = ₹64 per L (1)','150 ÷ 2.5 = ₹60 per L (1)','2.5 L pack is the better buy (1)']}
];

const ONEMIN=['× / ÷ by 10s: shift digits.','Decimal × whole.','Grid model: part of a part.','Count decimal places.','Divide: make the divisor whole.','Estimate to check.'];
const KEYS=[['powers of 10',/10|100|1000|shift/i],['grid',/grid|area|overlap/i],['decimal places',/places/i],['division',/divis|÷|divisor/i],['estimate',/estimat|round/i],['unit price',/unit|per/i]];

/* ---------- lab ---------- */
let mode='grid',a=3,b=4,quiz=null,wired=false,num=3.75,k=1;
const PV=['Th','H','T','O','.','t','h','th'];
function drawShift(anim){let s='';const cols=['Thousands','Hundreds','Tens','Ones','','tenths','hundredths','thousandths','10-thous.'];const x0=20,w=46;
 const dec=v=>{const t=fx(v);return t.includes('.')?t.split('.')[1].length:0};const r0=num*Math.pow(10,k),D=Math.min(4,Math.max(1,dec(num),dec(r0)));const fmt=v=>{const str=v.toFixed(D);const [ip,fp]=str.split('.');return {ip:ip.padStart(4,' '),fp}};
 const row=(v,y,c)=>{const {ip,fp}=fmt(v);let r='';[...ip].forEach((d,i)=>{if(d!==' ')r+=T(x0+i*w+w/2,y,d,`font-size="22" fill="${c}"`)});r+=T(x0+4*w+w/2,y,'.',`font-size="26" font-weight="700"`);[...fp].forEach((d,i)=>r+=T(x0+(5+i)*w+w/2,y,d,`font-size="22" fill="${c}"`));return r};
 cols.forEach((c,i)=>{if(c)s+=`<rect x="${x0+i*w}" y="40" width="${w}" height="190" fill="${i<4?BL:OR}" opacity=".07" stroke="${GR}" stroke-width=".5"/>`+T(x0+i*w+w/2,32,c,'font-size="8"')});
 const r=num*Math.pow(10,k);s+=row(num,100,ink)+row(r,190,PU);
 s+=`<path d="M230 120 v40" stroke="${PU}" stroke-width="2"/>`+T(330,145,`${k>0?'× ':'÷ '}${Math.pow(10,Math.abs(k))}: ${Math.abs(k)} place${Math.abs(k)>1?'s':''} ${k>0?'left':'right'}`,'font-size="13" fill="'+PU+'" font-weight="700"');
 s+=T(230,280,`${fx(num)} ${k>0?'×':'÷'} ${Math.pow(10,Math.abs(k))} = ${fx(r)}`,'font-size="18" font-weight="700"');$('#dSvg').innerHTML=s;
 $('#dOut').innerHTML=`<p>Each digit moves ${Math.abs(k)} place${Math.abs(k)>1?'s':''} to the ${k>0?'left (bigger)':'right (smaller)'}. Answer: <b>${fx(r)}</b>.</p>${Math.abs(r)>=10000||(r!==0&&Math.abs(r)<0.0001)?'<p>(Some digits are outside this chart.)</p>':''}`}
function drawGrid(){const s=grid(30,30,250,a,b)+T(155,300,`${(a/10).toFixed(1)} × ${(b/10).toFixed(1)}`,'font-size="16"')+T(380,120,`${a} × ${b} = ${a*b}`,'font-size="16"')+T(380,150,'hundredths','font-size="12"')+T(380,190,`= ${fx(a*b/100)}`,'font-size="22" font-weight="700" fill="'+PU+'"');
 $('#dSvg').innerHTML=s;$('#dAv').textContent=(a/10).toFixed(1);$('#dBv').textContent=(b/10).toFixed(1);
 $('#dOut').innerHTML=`<p>${a} columns (${(a/10).toFixed(1)}) × ${b} rows (${(b/10).toFixed(1)}) overlap in <b>${a*b}</b> small squares = <b>${fx(a*b/100)}</b>.</p><p>${a<10&&b<10?'Both factors are less than 1, so the product is smaller than each.':a===10&&b===10?'1 × 1 = 1.':'× 1 leaves a number unchanged.'}</p>`}
function draw(){$('#dGridC').style.display=mode==='grid'?'':'none';$('#dShiftC').style.display=mode==='shift'?'':'none';mode==='grid'?drawGrid():drawShift()}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('dS'))labChange(e.target)})}
function labClick(bt){if(bt.id==='dGo'){const v=+$('#dN').value;if(!isFinite(v)||Math.abs(v)>=1000){$('#dOut').innerHTML='<p class="fb no">Use a number below 1000.</p>';return true}num=v;k=+$('#dOp').value;drawShift();return true}
 if(bt.id==='dQ'){const t=Math.floor(Math.random()*4);const r1=(Math.floor(Math.random()*9)+1)/10,r2=(Math.floor(Math.random()*9)+1)/10,n=+(Math.random()*90+1).toFixed(2),p=[10,100,1000][Math.floor(Math.random()*3)];
  quiz=[{q:`${r1} × ${r2}`,a:+(r1*r2).toFixed(4)},{q:`${n} × ${p}`,a:+(n*p).toFixed(4)},{q:`${n} ÷ ${p}`,a:+(n/p).toFixed(6)},{q:`${fx(r1*r2*10)} ÷ ${r2}`,a:+(r1*10).toFixed(4)}][t];$('#dOut').innerHTML=`<p><b>Quiz:</b> ${quiz.q} = ?</p>`;return true}
 if(bt.id==='dC'){if(!quiz){$('#dOut').innerHTML='<p>Press Quiz first.</p>';return true}const g=+$('#dAns').value;$('#dOut').innerHTML=Math.abs(g-quiz.a)<1e-9?`<p class="fb ok">Correct: ${quiz.q} = ${fx(quiz.a)}.</p>`:`<p class="fb no">Not quite: ${quiz.q} = ${fx(quiz.a)}. Estimate first to place the point.</p>`;quiz=null;return true}return false}
function labChange(t){if(t.id==='dA')a=+t.value;else if(t.id==='dB')b=+t.value;else if(t.id==='dM')mode=t.value;else return false;draw();return true}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
