/* Rai Plus content pack: Class 8 Mathematics (Ganita Prakash), Chapter 2 – Power Play (exponents). */
RP.register({key:'8mat02',cls:'8',subject:'Mathematics',ch:'2',title:"Power Play",color:'#1f5f8b',
crumb:"Class 8 Mathematics · Ganita Prakash",h1:"Chapter 2: Power Play",sub:"Doubling and paper folding, exponential notation, the laws of exponents, zero and negative exponents, scientific notation, and making sense of very large and very small numbers.",heroLabel:"A sheet of paper folded again and again",labName:'Paper-folding and exponent lab',
theme:"\n:root{--g:light-dark(#1f5f8b,#8fc2e6);--g2:light-dark(#e8f1f8,#0b1622);--line:light-dark(#cde0ee,#22384b);--bg:light-dark(#ffffff,#081018);--card:light-dark(#ffffff,#0d1620);\n--ink:light-dark(#0d1d2a,#e1ecf5);--mute:light-dark(#475d70,#a7bccd);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#174a6d}\n",
labHTML:`  <h2>Paper-folding and exponent lab</h2>
  <p>Fold mode: a sheet of paper 0.1 mm thick doubles in thickness with each fold. How many folds to pass a building, Mount Everest — the Moon? Laws mode: pick a law and two exponents to see it worked out.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="pSvg" viewBox="0 0 460 320" role="img" aria-label="Paper folding chart" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="pM"><option value="f">Paper folding</option><option value="l">Laws of exponents</option></select></label></div>
  <div class="ctrl" id="pF"><label>Folds: <b id="pNv"></b><input type="range" class="pS" id="pN" min="0" max="50" value="10"></label></div>
  <div class="ctrl" id="pL" style="display:none"><label>Law<select id="pLaw"><option value="mul">aᵐ × aⁿ</option><option value="div">aᵐ ÷ aⁿ</option><option value="pow">(aᵐ)ⁿ</option></select></label> <label>a<input id="pA" type="number" value="2" style="width:3.5em"></label> <label>m<input id="pMm" type="number" value="3" style="width:3.5em"></label> <label>n<input id="pNn" type="number" value="4" style="width:3.5em"></label> <button class="btn" id="pGo">Show</button></div>
  <div class="box y" id="pOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#1f5f8b',LABNAME='Paper-folding and exponent lab',MIND_CENTER='Exponents';
const BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const SUP='⁰¹²³⁴⁵⁶⁷⁸⁹';const sup=n=>String(n).split('').map(c=>c==='-'?'⁻':SUP[+c]).join('');
function heroDraw(){return [0,1,2,3,4].map(k=>`<rect x="${100+k*8}" y="${120-k*18}" width="${160-k*16}" height="${6+k*3}" fill="none" stroke="#fff" stroke-width="2"/>`).join('')}
const HERO=heroDraw;
const MIND=[['Doubling',100,50],['Exponent notation',420,50],['Laws of exponents',90,150],['Zero & negative',430,150],['Scientific notation',110,250],['Big & small numbers',410,250]];

const C=[
{id:'p1',num:'2.1',title:'The power of doubling',
 intro:'Fold a sheet of paper in half again and again. How many folds would reach the Moon?',
 obj:'See how repeated doubling grows extremely fast.',
 prior:'Class 7: multiplication, large numbers.',
 simple:'A sheet of paper about 0.1 mm thick doubles in thickness with each fold: 0.2, 0.4, 0.8, 1.6 mm… After n folds the thickness is 0.1 × 2 × 2 × … (n times) = 0.1 × 2ⁿ mm. After 10 folds: about 10 cm. After 27 folds: taller than Mount Everest. After about 42 folds: past the Moon (about 3,84,400 km away)!',
 detail:'In practice you cannot fold paper more than about 7–8 times by hand, but the maths shows how doubling explodes. This is exponential growth — like bacteria doubling every 20 minutes, or the legend of grains on a chessboard: 1, 2, 4, 8, … on 64 squares, a total of 2⁶⁴ − 1 grains, far more than all the rice in the world.',
 real:'News about viruses "doubling every few days" describes exponential growth.',
 apply:'How thick is the paper after 20 folds? (2¹⁰ ≈ 1000)',
 see:{w:520,h:240,f:[
  ['0, 1, 2, 3 folds: 0.1, 0.2, 0.4, 0.8 mm.',[0,1,2,3].map(k=>`<rect x="${40+k*60}" y="${200-Math.pow(2,k)*6}" width="40" height="${Math.pow(2,k)*6}" fill="${BL}" opacity=".6"/>`+lbl(60+k*60,220,String(k))).join('')],
  ['4, 5 folds: doubling each time.',[4,5].map((k,j)=>`<rect x="${280+j*60}" y="${200-Math.pow(2,k)*6}" width="40" height="${Math.pow(2,k)*6}" fill="${OR}" opacity=".6"/>`+lbl(300+j*60,220,String(k))).join('')],
  ['~42 folds would pass the Moon!',lbl(440,120,'42 folds → Moon','font-size="15" font-weight="700" fill="'+PU+'"')+lbl(260,235,'thickness = 0.1 × 2ⁿ mm','font-size="12"')]]},
 seeNote:'Doubling explodes.',
 do:{title:'Fold and measure',mat:'Newspaper sheet, ruler',steps:['Fold as many times as you can.','Count layers each time: 2, 4, 8, …'],obs:'Hard after 7 folds; 128 layers.',why:'2⁷ = 128.',lab:true},
 memo:'"Each fold doubles."',
 miscon:['"42 folds = 42 × 0.1 mm = 4.2 mm." Each fold doubles, not adds.'],
 terms:['Doubling','Exponential growth','Power of 2'],
 q:{q:'Layers after 6 folds:',o:['12','36','64','6'],a:2,why:'2⁶.'},
 exam:'Doubling problems: 2 marks.'},

{id:'p2',num:'2.2',title:'Exponential notation',
 intro:'How do you write 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 quickly?',
 obj:'Write repeated multiplication using bases and exponents.',
 prior:'2.1; squares and cubes (Ch 1).',
 simple:'aⁿ means a multiplied by itself n times. In 2¹⁰, 2 is the base and 10 is the exponent (power or index). 2¹⁰ = 1024. 10³ = 1000. 5² = 25. Read 3⁴ as "3 to the power 4" = 81.',
 detail:'Negative bases: (−2)³ = −8 (odd power → negative), (−2)⁴ = 16 (even power → positive). Careful: −2⁴ = −(2⁴) = −16, but (−2)⁴ = 16. Expanded form with powers of 10: 47,305 = 4 × 10⁴ + 7 × 10³ + 3 × 10² + 0 × 10 + 5.',
 real:'Computer memory uses powers of 2: 1 KB = 2¹⁰ = 1024 bytes.',
 apply:'Write 81 as a power of 3 and as a power of 9.',
 see:{w:520,h:200,f:[
  ['2 × 2 × 2 × 2 × 2',lbl(260,50,'2 × 2 × 2 × 2 × 2','font-size="22"')],
  ['= 2⁵',lbl(260,105,'= 2⁵ = 32','font-size="26" font-weight="700" fill="'+BL+'"')],
  ['base and exponent',lbl(180,160,'base = 2','fill="'+OR+'"')+lbl(340,160,'exponent = 5','fill="'+GN+'"')]]},
 seeNote:'Exponent counts the factors.',
 do:{title:'Power table',mat:'Notebook',steps:['Make a table of 2¹ to 2¹² and 3¹ to 3⁸.'],obs:'Growing fast.',why:'Notation practice.',lab:false},
 memo:'"Base is the number, exponent is how many times."',
 miscon:['"2⁵ = 2 × 5 = 10." It is 2 multiplied five times = 32.'],
 terms:['Base','Exponent (power, index)','Expanded form'],
 q:{q:'(−3)³ =',o:['27','−27','−9','9'],a:1,why:'Odd power, negative base.'},
 exam:'Write in exponential form: 1 mark.'},

{id:'p3',num:'2.3',title:'Laws of exponents',
 intro:'Is there a shortcut for 2³ × 2⁴ without multiplying it all out?',
 obj:'Use the laws of exponents to simplify expressions.',
 prior:'2.2.',
 simple:'For the same base a: (1) aᵐ × aⁿ = aᵐ⁺ⁿ (2³ × 2⁴ = 2⁷). (2) aᵐ ÷ aⁿ = aᵐ⁻ⁿ (5⁶ ÷ 5² = 5⁴). (3) (aᵐ)ⁿ = aᵐⁿ ((3²)³ = 3⁶). (4) aⁿ × bⁿ = (ab)ⁿ (2³ × 5³ = 10³). (5) aⁿ ÷ bⁿ = (a/b)ⁿ.',
 detail:'Why law 1 works: 2³ × 2⁴ = (2·2·2)(2·2·2·2) = seven 2s = 2⁷. Laws need the same base (for 1–3) or the same exponent (for 4–5): 2³ × 3² cannot be combined. Use prime factorisation: 8³ × 4² = (2³)³ × (2²)² = 2⁹ × 2⁴ = 2¹³.',
 real:'Scientists multiply huge numbers like 10⁸ × 10⁹ = 10¹⁷ instantly.',
 apply:'Simplify (2⁵ × 2³) ÷ 2⁴ and (7²)⁴ ÷ 7⁵.',
 see:{w:520,h:220,f:[
  ['aᵐ × aⁿ = aᵐ⁺ⁿ',lbl(260,40,'aᵐ × aⁿ = aᵐ⁺ⁿ    2³ × 2⁴ = 2⁷','font-size="17"')],
  ['aᵐ ÷ aⁿ = aᵐ⁻ⁿ',lbl(260,95,'aᵐ ÷ aⁿ = aᵐ⁻ⁿ    5⁶ ÷ 5² = 5⁴','font-size="17"')],
  ['(aᵐ)ⁿ = aᵐⁿ',lbl(260,150,'(aᵐ)ⁿ = aᵐⁿ    (3²)³ = 3⁶','font-size="17"')]]},
 seeNote:'Same base: add, subtract, multiply exponents.',
 do:{title:'Prove a law',mat:'Notebook',steps:['Write 3² × 3³ in full.','Count the 3s.'],obs:'Five 3s → 3⁵.',why:'Law 1.',lab:true},
 memo:'"Multiply → add; divide → subtract; power of power → multiply."',
 miscon:['"2³ × 2⁴ = 4⁷" or "= 2¹²". Keep the base; add exponents: 2⁷.'],
 terms:['Laws of exponents','Same base','Power of a power'],
 q:{q:'(2³)⁴ =',o:['2⁷','2¹²','2⁸¹','8⁴... '],a:1,why:'3 × 4.'},
 exam:'Simplify using laws: 3 marks.'},

{id:'p4',num:'2.4',title:'Zero and negative exponents',
 intro:'What could 2⁰ or 2⁻³ possibly mean?',
 obj:'Understand a⁰ = 1 and a⁻ⁿ = 1/aⁿ using patterns.',
 prior:'2.3.',
 simple:'Pattern: 2³ = 8, 2² = 4, 2¹ = 2 — each step divides by 2. Continue: 2⁰ = 1, 2⁻¹ = 1/2, 2⁻² = 1/4, 2⁻³ = 1/8. So a⁰ = 1 (for any non-zero a), and a⁻ⁿ = 1/aⁿ.',
 detail:'Using the division law: 5³ ÷ 5³ = 5⁰, but it also equals 1, so 5⁰ = 1. And 2² ÷ 2⁵ = 2⁻³ = 1/8. All the laws still work with negative exponents: 10⁻² × 10⁵ = 10³. Negative exponents describe small numbers: 10⁻³ = 0.001.',
 real:'A millimetre is 10⁻³ metre.',
 apply:'Find 3⁻² and (2/5)⁻¹.',
 see:{w:520,h:220,f:[
  ['2³ = 8, 2² = 4, 2¹ = 2',[[3,'8'],[2,'4'],[1,'2']].map(([e,v],k)=>lbl(70+k*80,60,`2${sup(e)} = ${v}`,'font-size="17"')).join('')],
  ['÷2 each step → 2⁰ = 1',lbl(310,60,'2⁰ = 1','font-size="17" font-weight="700" fill="'+GN+'"')],
  ['2⁻¹ = 1/2, 2⁻² = 1/4',lbl(160,130,'2⁻¹ = 1/2','font-size="17" fill="'+OR+'"')+lbl(340,130,'2⁻² = 1/4','font-size="17" fill="'+OR+'"')+lbl(260,185,'a⁻ⁿ = 1/aⁿ','font-size="20" font-weight="700"')]]},
 seeNote:'Keep dividing by the base.',
 do:{title:'Pattern ladder',mat:'Notebook',steps:['Write 10³ down to 10⁻³ with values.'],obs:'1000 … 0.001.',why:'Each step ÷ 10.',lab:false},
 memo:'"Negative exponent → flip it."',
 miscon:['"2⁰ = 0." It is 1.','"2⁻³ = −8." It is 1/8.'],
 terms:['Zero exponent','Negative exponent','Reciprocal'],
 q:{q:'7⁰ =',o:['0','7','1','70'],a:2,why:'Any non-zero base.'},
 exam:'Zero/negative exponents: 2 marks.'},

{id:'p5',num:'2.5',title:'Scientific notation',
 intro:'The Sun is about 15,00,00,000 km away. Is there a tidier way to write that?',
 obj:'Write very large and very small numbers in scientific (standard) form.',
 prior:'2.2–2.4.',
 simple:'Scientific notation: a × 10ⁿ, where 1 ≤ a < 10 and n is a whole number. 150,000,000 km = 1.5 × 10⁸ km. Small numbers use negative powers: 0.00045 m = 4.5 × 10⁻⁴ m.',
 detail:'Count how many places the decimal point moves to get a number between 1 and 10: left → positive exponent; right → negative. Compare sizes using exponents first: 3 × 10⁸ is bigger than 9 × 10⁷. Multiply: (2 × 10³)(4 × 10⁵) = 8 × 10⁸.',
 real:'Speed of light ≈ 3 × 10⁸ m/s; a red blood cell is about 7 × 10⁻⁶ m wide.',
 apply:'Write 3,84,400 km and 0.000007 m in scientific notation.',
 see:{w:520,h:200,f:[
  ['150,000,000',lbl(260,50,'150 000 000 km','font-size="22"')],
  ['Move the point 8 places left.',lbl(260,105,'1.5 × 10⁸ km','font-size="24" font-weight="700" fill="'+BL+'"')],
  ['Small: 0.00045 = 4.5 × 10⁻⁴',lbl(260,160,'0.00045 m = 4.5 × 10⁻⁴ m','font-size="18" fill="'+OR+'"')]]},
 seeNote:'One digit before the point.',
 do:{title:'Science facts',mat:'Fact list',steps:['Rewrite 8 science numbers in scientific notation.'],obs:'Easier to compare.',why:'Standard form.',lab:false},
 memo:'"One digit, then times ten to the power."',
 miscon:['"15 × 10⁷ is scientific notation." The first part must be from 1 to less than 10: 1.5 × 10⁸.'],
 terms:['Scientific notation','Standard form'],
 q:{q:'0.0032 in scientific notation:',o:['3.2 × 10³','3.2 × 10⁻³','32 × 10⁻⁴','0.32 × 10⁻²'],a:1,why:'3 places right.'},
 exam:'Scientific notation: 2 marks.'},

{id:'p6',num:'2.6',title:'Making sense of huge and tiny numbers',
 intro:'If you counted one number every second, how long would it take to reach a crore? A billion?',
 obj:'Estimate and compare very large and very small quantities using powers.',
 prior:'2.5.',
 simple:'Powers help us estimate. 1 crore = 10⁷ seconds ≈ 116 days. 1 billion = 10⁹ seconds ≈ 32 years. India\'s population ≈ 1.4 × 10⁹. A grain of sand ≈ 10⁻³ m; an atom ≈ 10⁻¹⁰ m. Each step of 10 is a big jump: 10⁹ is a thousand times 10⁶.',
 detail:'Estimation trick: 2¹⁰ ≈ 10³, so 2²⁰ ≈ 10⁶ and 2³⁰ ≈ 10⁹. A chain message where each person forwards to 2 new people reaches over a crore people in about 24 rounds (2²⁴ ≈ 1.7 × 10⁷). Indian number names: lakh = 10⁵, crore = 10⁷.',
 real:'Ancient Indian texts named huge powers of ten, such as tallakshana (10⁵³) in the Lalitavistara.',
 apply:'About how many seconds are in a year? Write it in scientific notation.',
 see:{w:520,h:220,f:[
  ['10³ seconds ≈ 17 minutes.',lbl(130,50,'10³ s ≈ 17 min','font-size="16"')],
  ['10⁷ seconds ≈ 116 days.',lbl(390,50,'10⁷ s ≈ 116 days','font-size="16"')],
  ['10⁹ seconds ≈ 32 years!',lbl(260,130,'10⁹ s ≈ 32 years','font-size="22" font-weight="700" fill="'+OR+'"')+lbl(260,180,'2¹⁰ ≈ 10³','font-size="15" fill="'+BL+'"')]]},
 seeNote:'Each power of 10 is a big leap.',
 do:{title:'Count a crore?',mat:'Calculator',steps:['Compute seconds in a day, year.','Estimate time to count to a crore.'],obs:'About 4 months non-stop.',why:'Scale of powers.',lab:false},
 memo:'"2¹⁰ is about 10³."',
 miscon:['"A billion is a bit more than a million." It is a thousand times more.'],
 terms:['Estimate','Order of magnitude','Lakh (10⁵)','Crore (10⁷)'],
 q:{q:'2²⁰ is approximately:',o:['10⁴','10⁶','10⁹','10²⁰'],a:1,why:'(2¹⁰)² ≈ (10³)².'},
 exam:'Estimation with powers: 2–3 marks.'}
];
C[2].q.o=['2⁷','2¹²','2⁸¹','8⁷'];

const CARDS=[['Doubling','n folds → 2ⁿ layers.'],['aⁿ','a multiplied n times.'],['Negative base','Odd power −, even power +.'],['Product law','aᵐ × aⁿ = aᵐ⁺ⁿ.'],['Quotient law','aᵐ ÷ aⁿ = aᵐ⁻ⁿ.'],['Power of power','(aᵐ)ⁿ = aᵐⁿ.'],['Zero exponent','a⁰ = 1.'],['Negative exponent','a⁻ⁿ = 1/aⁿ.'],['Scientific notation','a × 10ⁿ, 1 ≤ a < 10.'],['Estimate','2¹⁰ ≈ 10³; crore = 10⁷.']];

const Q=[
 {lv:1,q:'2⁶ =',o:['12','36','64','32'],a:2,w:'2 six times.'},
 {lv:1,q:'In 5⁴, the exponent is:',o:['5','4','20','625'],a:1,w:'Power.'},
 {lv:1,q:'10⁰ =',o:['0','1','10','undefined'],a:1,w:'Zero exponent.'},
 {lv:2,q:'3⁴ × 3² =',o:['3⁸','3⁶','9⁶','3²'],a:1,w:'Add.'},
 {lv:2,q:'7⁸ ÷ 7³ =',o:['7⁵','7¹¹','1⁵','7²⁴'],a:0,w:'Subtract.'},
 {lv:2,q:'2⁻³ =',o:['−8','1/8','−6','8'],a:1,w:'Reciprocal.'},
 {lv:3,q:'4,50,00,000 in scientific notation:',o:['4.5 × 10⁷','45 × 10⁷','4.5 × 10⁸','4.5 × 10⁶'],a:0,w:'7 places.'},
 {lv:3,q:'(−1)¹⁰¹ =',o:['1','−1','101','0'],a:1,w:'Odd power.'},
 {lv:4,q:'Thickness of 0.1 mm paper after 20 folds is about:',o:['2 mm','10 cm','100 m','1 km'],a:2,w:'0.1 × 10⁶ mm = 100 m.'},
 {lv:4,q:'Which is largest?',o:['9 × 10⁷','2 × 10⁸','8 × 10⁸... ','5 × 10⁶'],a:2,w:'Compare exponents first.'},
 {lv:5,open:true,m:3,q:'Simplify (2⁵ × 8²) ÷ 4³ and write the answer as a power of 2.',ans:['8² = 2⁶, 4³ = 2⁶ (1)','2⁵ × 2⁶ = 2¹¹ (1)','2¹¹ ÷ 2⁶ = 2⁵ (1)']},
 {lv:5,open:true,m:3,q:'Use a pattern to explain why 3⁰ = 1 and 3⁻² = 1/9.',ans:['3³=27, 3²=9, 3¹=3: each step ÷3 (1)','Next: 3⁰ = 1 (1)','Then 3⁻¹ = 1/3, 3⁻² = 1/9 (1)']}
];
Q[9].o=['9 × 10⁷','2 × 10⁸','8 × 10⁸','5 × 10⁶'];

const ONEMIN=['Doubling: paper folding to the Moon.','aⁿ: base and exponent.','Laws: add, subtract, multiply exponents.','a⁰ = 1; a⁻ⁿ = 1/aⁿ.','Scientific notation a × 10ⁿ.','Estimate with powers: 2¹⁰ ≈ 10³.'];
const KEYS=[['doubling',/doubl|fold/i],['exponent',/exponent|power|base/i],['laws',/law|add the exponents|aᵐ/i],['zero/negative',/zero|negative|reciprocal/i],['scientific',/scientific|standard form/i],['estimate',/estimat|crore|billion/i]];

/* ---------- lab ---------- */
let mode='f',n=10,wired=false;
const MARKS=[['Your height (1.5 m)',1.5],['Qutub Minar (73 m)',73],['Mount Everest (8.85 km)',8849],['Space station (400 km)',4e5],['Moon (3,84,400 km)',3.844e8],['Sun (15 crore km)',1.5e11]];
const fmt=m=>m<0.01?(m*1000).toFixed(2)+' mm':m<1?(m*100).toFixed(1)+' cm':m<1000?m.toFixed(1)+' m':m<1e7?(m/1000).toLocaleString('en-IN',{maximumFractionDigits:1})+' km':(m/1000).toExponential(2).replace('e+',' × 10^')+' km';
function drawF(){const t=0.0001*Math.pow(2,n);const lg=v=>Math.log10(v);const lo=-4,hi=12;const Y=v=>290-(lg(v)-lo)*(270/(hi-lo));let s=`<line x1="70" y1="20" x2="70" y2="290" stroke="${ink}"/>`;
 for(let e=lo;e<=hi;e+=2)s+=`<line x1="66" y1="${Y(Math.pow(10,e))}" x2="74" y2="${Y(Math.pow(10,e))}" stroke="${ink}"/>`+T(40,Y(Math.pow(10,e))+4,`10${sup(e)} m`,'font-size="10"');
 MARKS.forEach(([name,h])=>{const y=Y(h);const passed=t>=h;s+=`<line x1="70" y1="${y}" x2="440" y2="${y}" stroke="${passed?GN:GR}" stroke-dasharray="4 4"/>`+T(440,y-3,name,`font-size="10" text-anchor="end" fill="${passed?GN:GR}"`)});
 const yt=Y(t);s+=`<rect x="110" y="${yt}" width="40" height="${290-yt}" fill="${BL}" opacity=".55"/>`+T(130,yt-6,fmt(t),'font-size="11" font-weight="700" fill="'+BL+'"');$('#pSvg').innerHTML=s;$('#pNv').textContent=n;
 const passed=MARKS.filter(([,h])=>t>=h);$('#pOut').innerHTML=`<p>${n} folds: layers = 2${sup(n)} = ${Math.pow(2,n).toLocaleString('en-IN')}; thickness = 0.1 mm × 2${sup(n)} ≈ <b>${fmt(t)}</b>.</p>${passed.length?`<p class="fb ok">Taller than: ${passed[passed.length-1][0]}.</p>`:''}<p>Note the scale: each mark on the axis is 100 times the one below.</p>`}
function drawL(){const a=+$('#pA').value,m=+$('#pMm').value,k=+$('#pNn').value,law=$('#pLaw').value;if(!a||!Number.isInteger(m)||!Number.isInteger(k)||Math.abs(m)>12||Math.abs(k)>12){$('#pOut').innerHTML='<p class="fb no">Use a non-zero base and whole-number exponents from −12 to 12.</p>';return}
 const e=law==='mul'?m+k:law==='div'?m-k:m*k;const expr=law==='mul'?`${a}${sup(m)} × ${a}${sup(k)}`:law==='div'?`${a}${sup(m)} ÷ ${a}${sup(k)}`:`(${a}${sup(m)})${sup(k)}`;const rule=law==='mul'?`${m} + ${k}`:law==='div'?`${m} − ${k}`:`${m} × ${k}`;
 let s=T(230,60,expr,'font-size="26"')+T(230,120,`= ${a}${sup('('+rule+')').replace('(','').replace(')','')}`,'font-size="18" fill="'+GR+'"');s=T(230,60,expr,'font-size="26"')+T(230,120,`exponent: ${rule} = ${e}`,'font-size="18" fill="'+GR+'"')+T(230,185,`= ${a}${sup(e)}`,'font-size="30" font-weight="700" fill="'+BL+'"');
 const val=Math.pow(a,e);s+=T(230,240,`= ${Math.abs(val)<1e12&&Math.abs(val)>1e-6?(Number.isInteger(val)?val.toLocaleString('en-IN'):e<0&&Number.isInteger(Math.pow(a,-e))?'1/'+Math.pow(a,-e).toLocaleString('en-IN'):+val.toPrecision(6)):val.toExponential(3)}`,'font-size="18"');
 if(law==='mul'&&m>0&&k>0&&m+k<=12)s+=T(230,290,`${Array(m).fill(a).join('·')} × ${Array(k).fill(a).join('·')} → ${m+k} factors`,'font-size="11" fill="'+GR+'"');$('#pSvg').innerHTML=s;
 $('#pOut').innerHTML=`<p>${law==='mul'?'Multiplying powers of the same base: add the exponents.':law==='div'?'Dividing powers of the same base: subtract the exponents.':'Power of a power: multiply the exponents.'}${e===0?' Any non-zero number to the power 0 is 1.':e<0?' A negative exponent means a reciprocal.':''}</p>`}
function draw(){$('#pF').style.display=mode==='f'?'':'none';$('#pL').style.display=mode==='l'?'':'none';mode==='f'?drawF():drawL()}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='pN'){n=+e.target.value;drawF()}})}
function labClick(b){if(b.id==='pGo'){drawL();return true}return false}
function labChange(t){if(t.id==='pM'){mode=t.value;draw();return true}if(t.id==='pLaw'){drawL();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
