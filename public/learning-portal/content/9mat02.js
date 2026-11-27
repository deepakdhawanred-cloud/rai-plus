/* Rai Plus content pack: Class 9 Mathematics, Chapter 2 – Polynomials (rationalised NCERT). */
RP.register({key:'9mat02',cls:'9',subject:'Mathematics',ch:'2',title:"Polynomials",color:'#0f6e6e',
crumb:"HBSE Class 9 Mathematics · Unit: Algebra · Taught in May",h1:"Chapter 2: Polynomials",sub:"Polynomials in one variable, their degree and types, zeroes, the factor theorem, factorising quadratics and cubics, and algebraic identities.",heroLabel:"A cubic curve crossing the x-axis at its zeroes",labName:'Polynomial grapher',
theme:"\n:root{--g:light-dark(#0f6e6e,#86d6d6);--g2:light-dark(#e7f4f4,#061616);--line:light-dark(#c6e3e3,#1e3d3d);--bg:light-dark(#ffffff,#071111);--card:light-dark(#ffffff,#0c1818);\n--ink:light-dark(#0b2626,#dff1f1);--mute:light-dark(#466262,#a6c4c4);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#0b5252}\n",
labHTML:`  <h2>Polynomial grapher</h2>
  <p>Set the coefficients of p(x) = ax³ + bx² + cx + d. The curve crosses the x-axis at the zeroes of p(x). Move the test value k: if p(k) = 0, then (x − k) is a factor (factor theorem).</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="pgSvg" viewBox="0 0 520 340" role="img" aria-label="Polynomial graph" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label><span>a (x³): <b id="pgAv"></b></span><input type="range" class="pgS" id="pgA" min="-2" max="2" step="1" value="1"></label></div>
  <div class="ctrl"><label><span>b (x²): <b id="pgBv"></b></span><input type="range" class="pgS" id="pgB" min="-6" max="6" value="-2"></label></div>
  <div class="ctrl"><label><span>c (x): <b id="pgCv"></b></span><input type="range" class="pgS" id="pgC" min="-10" max="10" value="-5"></label></div>
  <div class="ctrl"><label><span>d: <b id="pgDv"></b></span><input type="range" class="pgS" id="pgD" min="-10" max="10" value="6"></label></div>
  <div class="ctrl"><label><span>test k: <b id="pgKv"></b></span><input type="range" class="pgS" id="pgK" min="-4" max="4" value="1"></label></div>
  <div class="box y" id="pgOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#0f6e6e',LABNAME='Polynomial grapher',MIND_CENTER='Polynomials';
const TL='#0f6e6e',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',RD='#c0392b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const tile=(x,y,w,h,c,t)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" fill-opacity=".22" stroke="${c}" stroke-width="1.5"/>`+(t?T(x+w/2,y+h/2+5,t,'font-size="13" font-weight="700"'):'');
function heroDraw(){let d='';for(let i=0;i<=60;i++){const x=-2.5+i*5/60,y=x*x*x-3*x;d+=(i?'L':'M')+(170+x*55).toFixed(1)+' '+(75-y*14).toFixed(1)}return `<line x1="20" y1="75" x2="320" y2="75" stroke="#fff" stroke-width="1.5" opacity=".6"/><path d="${d}" fill="none" stroke="#fff" stroke-width="3"/>`+[-1.732,0,1.732].map(z=>`<circle cx="${170+z*55}" cy="75" r="5" fill="#fff"/>`).join('')}
const HERO=heroDraw;
const MIND=[['Terms & degree',100,50],['Types',420,50],['Zeroes',90,150],['Factor theorem',430,150],['Factorisation',110,250],['Identities',410,250]];

const C=[
{id:'p1',num:'2.1',title:'Polynomials in one variable',
 intro:'Is 3x² + 2x − 7 a polynomial? What about 1/x + 2, or √x?',
 obj:'Identify polynomials, their terms, coefficients and degree.',
 prior:'Class 8: algebraic expressions.',
 simple:'A polynomial in one variable x is an expression like aₙxⁿ + … + a₁x + a₀, where the powers of x are whole numbers (0, 1, 2, …) and the a\'s are real constants (coefficients). Each part is a term. The highest power of x is the degree. 3x² + 2x − 7 has terms 3x², 2x, −7 and degree 2.',
 detail:'Not polynomials: 1/x + 2 (power −1), √x + 3 (power ½), x^(3/2). A constant like 5 is a polynomial of degree 0 (5 = 5x⁰). The zero polynomial 0 has no defined degree. We write polynomials as p(x), q(y), etc. The coefficient of x² in 4x³ − x² + 7 is −1.',
 real:'Profit as a function of items sold, or the height of a thrown ball over time, is often a polynomial.',
 apply:'Write the degree and the coefficient of x² in 2 − x² + x³ and in (π/2)x² + x.',
 see:{w:520,h:200,f:[
  ['A polynomial.',lbl(260,50,'3x² + 2x − 7','font-size="24" font-weight="700"')],
  ['Its terms.',lbl(160,110,'3x²','font-size="18" fill="'+TL+'"')+lbl(260,110,'2x','font-size="18" fill="'+OR+'"')+lbl(360,110,'−7','font-size="18" fill="'+PU+'"')+lbl(160,135,'coefficient 3')+lbl(260,135,'coefficient 2')+lbl(360,135,'constant')],
  ['Degree = highest power.',lbl(260,180,'degree = 2','font-size="16" font-weight="700" fill="'+TL+'"')]]},
 seeNote:'Whole-number powers only.',
 do:{title:'Polynomial or not?',mat:'Expression cards',steps:['Sort cards into polynomials and non-polynomials.','Give a reason for each.'],obs:'Negative or fractional powers excluded.',why:'Definition.',lab:false},
 memo:'"Whole-number powers make a polynomial."',
 miscon:['"√2 x is not a polynomial." It is: the coefficient √2 is fine; only the power of x matters.'],
 terms:['Polynomial','Term','Coefficient','Degree','Constant polynomial','Zero polynomial'],
 q:{q:'Which is a polynomial?',o:['x + 1/x','√x + 1','x³ − √3 x','x^(−2)'],a:2,why:'Powers 3 and 1.'},
 exam:'Identify polynomials and degree: 1 mark.'},

{id:'p2',num:'2.2',title:'Types of polynomials',
 intro:'Monomial, binomial, trinomial; linear, quadratic, cubic — what do these names describe?',
 obj:'Classify polynomials by number of terms and by degree.',
 prior:'2.1.',
 simple:'By number of terms: monomial (1 term: 5x³), binomial (2 terms: x + 1), trinomial (3 terms: x² + x + 1). By degree: linear (degree 1: 2x + 3), quadratic (degree 2: x² − 4), cubic (degree 3: x³ + x).',
 detail:'General forms: linear ax + b (a ≠ 0); quadratic ax² + bx + c (a ≠ 0); cubic ax³ + bx² + cx + d (a ≠ 0). A polynomial of degree n has at most n + 1 terms. Linear polynomials have exactly one zero; quadratics at most two; cubics at most three.',
 real:'Area formulas are quadratic (side²); volume formulas are cubic (side³).',
 apply:'Classify: x + x², 4, y³ − 3y + 1, 3t.',
 see:{w:520,h:200,f:[
  ['By terms.',tile(20,40,150,40,TL,'monomial: 5x³')+tile(185,40,150,40,TL,'binomial: x + 1')+tile(350,40,150,40,TL,'trinomial: x² + x + 1')],
  ['By degree.',tile(20,110,150,40,OR,'linear: 2x + 3')+tile(185,110,150,40,OR,'quadratic: x² − 4')+tile(350,110,150,40,OR,'cubic: x³ + x')],
  ['Two ways to name.',lbl(260,185,'count terms, or look at the highest power','font-weight="700"')]]},
 seeNote:'Terms vs degree.',
 do:{title:'Name game',mat:'Cards',steps:['Write 10 polynomials.','Give each two names.'],obs:'Practice.',why:'Classification.',lab:false},
 memo:'"Mono-bi-tri for terms; linear-quadratic-cubic for degree."',
 miscon:['"x² + x is quadratic AND trinomial." It is quadratic and a binomial (2 terms).'],
 terms:['Monomial','Binomial','Trinomial','Linear','Quadratic','Cubic'],
 q:{q:'x³ − 1 is a:',o:['cubic binomial','quadratic binomial','cubic trinomial','linear monomial'],a:0,why:'Degree 3, two terms.'},
 exam:'Classify polynomials: 1 mark.'},

{id:'p3',num:'2.3',title:'Zeroes of a polynomial',
 intro:'For which value of x does x − 3 become 0? And x² − 4?',
 obj:'Find the value of a polynomial and its zeroes.',
 prior:'2.2; substitution.',
 simple:'The value of p(x) at x = k is p(k), found by substituting k. A zero of p(x) is a number k for which p(k) = 0 — k is also called a root of the equation p(x) = 0. For p(x) = x − 3, p(3) = 0, so 3 is a zero. For x² − 4, the zeroes are 2 and −2.',
 detail:'A linear polynomial ax + b has exactly one zero, x = −b/a. A non-zero constant polynomial has no zero. Every real number is a zero of the zero polynomial. A polynomial can have more than one zero. On a graph, zeroes are where the curve meets the x-axis.',
 real:'Finding when a thrown ball hits the ground means finding a zero of its height polynomial.',
 apply:'Find p(0), p(1), p(2) for p(x) = x² − 3x + 2. Which are zeroes?',
 see:{w:520,h:230,f:[
  ['Axes.',`<line x1="40" y1="130" x2="480" y2="130" stroke="${ink}"/><line x1="260" y1="20" x2="260" y2="220" stroke="${ink}"/>`+[-3,-2,-1,1,2,3].map(k=>T(260+k*60,148,k,'font-size="11"')).join('')],
  ['y = x² − 4.',`<path d="${[...Array(61)].map((_,i)=>{const x=-3+i*.1;return (i?'L':'M')+(260+x*60).toFixed(1)+' '+(130-(x*x-4)*20).toFixed(1)}).join(' ')}" fill="none" stroke="${TL}" stroke-width="3"/>`],
  ['Zeroes where it meets the x-axis.',`<circle cx="140" cy="130" r="6" fill="${OR}"/><circle cx="380" cy="130" r="6" fill="${OR}"/>`+lbl(140,112,'−2','fill="'+OR+'"')+lbl(380,112,'2','fill="'+OR+'"')]]},
 seeNote:'Zeroes = x-intercepts.',
 do:{title:'Value table',mat:'Paper',steps:['Make a table of p(x) = x² − x − 6 for x = −3 to 4.','Spot the zeroes.'],obs:'p(−2) = p(3) = 0.',why:'Zeroes.',lab:false},
 memo:'"Zero of p: the x that makes p zero."',
 miscon:['"0 is always a zero of a polynomial." Only if the constant term is 0.'],
 terms:['Value of a polynomial','Zero (root)','x-intercept'],
 q:{q:'Zero of 2x + 5:',o:['5/2','−5/2','2/5','−2/5'],a:1,why:'x = −b/a.'},
 exam:'Find zeroes; verify: 2 marks.'},

{id:'p4',num:'2.4',title:'The factor theorem',
 intro:'How can you tell that (x − 1) divides x³ − 6x² + 11x − 6 without long division?',
 obj:'State and apply the factor theorem.',
 prior:'2.3.',
 simple:'Factor theorem: if p(x) has degree ≥ 1 and a is a real number, then (x − a) is a factor of p(x) if p(a) = 0, and conversely, if (x − a) is a factor, then p(a) = 0. Check: p(x) = x³ − 6x² + 11x − 6; p(1) = 1 − 6 + 11 − 6 = 0, so (x − 1) is a factor.',
 detail:'To test (x + 2), substitute x = −2. To test (2x − 1), substitute x = 1/2. To find k when (x − 1) is a factor of x² + x + k: p(1) = 0 → 2 + k = 0 → k = −2. The factor theorem helps factorise cubics: find one zero by trying factors of the constant term, then divide.',
 real:'Engineers factorise polynomial equations to find critical values quickly.',
 apply:'Is (x + 1) a factor of x³ + x² + x + 1? Find k if (x − 2) is a factor of x² − kx + 6.',
 see:{w:520,h:200,f:[
  ['p(x).',lbl(260,40,'p(x) = x³ − 6x² + 11x − 6','font-size="18"')],
  ['Substitute x = 1.',lbl(260,95,'p(1) = 1 − 6 + 11 − 6 = 0','font-size="18" fill="'+TL+'"')],
  ['So (x − 1) is a factor.',lbl(260,150,'p(a) = 0 ⇔ (x − a) is a factor','font-size="17" font-weight="700" fill="'+OR+'"')]]},
 seeNote:'Zero ⇔ factor.',
 do:{title:'Factor hunt',mat:'Paper',steps:['For x³ − 7x + 6, try x = 1, 2, −3.','List the factors found.'],obs:'(x − 1)(x − 2)(x + 3).',why:'Factor theorem.',lab:true},
 memo:'"Plug in a; if you get zero, (x − a) is a factor."',
 miscon:['"To test (x + 3), substitute x = 3." Substitute x = −3.'],
 terms:['Factor theorem','Factor','Divisor'],
 q:{q:'(x − 2) is a factor of:',o:['x² + 4','x² − 4','x² + 2x + 4','x² + 2'],a:1,why:'p(2) = 0.'},
 exam:'Factor theorem checks; find k: 2–3 marks.'},

{id:'p5',num:'2.5',title:'Factorising quadratics and cubics',
 intro:'How do you break 6x² + 17x + 5 into two brackets?',
 obj:'Factorise quadratics by splitting the middle term and cubics using the factor theorem.',
 prior:'2.4.',
 simple:'Splitting the middle term for ax² + bx + c: find two numbers p and q with p + q = b and pq = ac. For 6x² + 17x + 5: ac = 30, numbers 15 and 2. 6x² + 15x + 2x + 5 = 3x(2x + 5) + 1(2x + 5) = (3x + 1)(2x + 5).',
 detail:'Cubic example: x³ − 23x² + 142x − 120. Try factors of 120: p(1) = 0, so (x − 1) is a factor. Divide to get x² − 22x + 120 = (x − 10)(x − 12). So p(x) = (x − 1)(x − 10)(x − 12). Always check by expanding.',
 real:'Factorising lets us find dimensions from an area expression, like a rectangle of area x² + 5x + 6 = (x + 2)(x + 3).',
 apply:'Factorise 2y² + 7y + 3 and x³ − 2x² − x + 2.',
 see:{w:520,h:220,f:[
  ['Area model of x² + 5x + 6.',tile(140,40,100,100,TL,'x²')+tile(240,40,60,100,OR,'3x')+tile(140,140,100,40,OR,'2x')+tile(240,140,60,40,PU,'6')],
  ['Side lengths.',lbl(190,30,'x')+lbl(270,30,'3')+lbl(125,95,'x')+lbl(125,165,'2')],
  ['= (x + 2)(x + 3).',lbl(410,110,'(x + 2)(x + 3)','font-size="20" font-weight="700" fill="'+TL+'"')]]},
 seeNote:'Rectangle sides are the factors.',
 do:{title:'Algebra tiles',mat:'Paper tiles: x², x, 1',steps:['Make x² + 5x + 6 as a rectangle.','Read its sides.'],obs:'(x + 2)(x + 3).',why:'Factorisation.',lab:true},
 memo:'"Product ac, sum b."',
 miscon:['"Split into any two numbers that add to b." They must also multiply to ac.'],
 terms:['Splitting the middle term','Factorisation','Quadratic','Cubic'],
 q:{q:'x² + 7x + 12 =',o:['(x + 3)(x + 4)','(x + 2)(x + 6)','(x + 1)(x + 12)','(x − 3)(x − 4)'],a:0,why:'3 + 4 = 7, 3 × 4 = 12.'},
 exam:'Factorise quadratics and cubics: 3 marks.'},

{id:'p6',num:'2.6',title:'Algebraic identities',
 intro:'Can you find 104³ or 99 × 101 in your head?',
 obj:'Use algebraic identities for expansion, factorisation and calculation.',
 prior:'Class 8 identities.',
 simple:'Key identities: (x + y)² = x² + 2xy + y²; (x − y)² = x² − 2xy + y²; x² − y² = (x + y)(x − y); (x + a)(x + b) = x² + (a + b)x + ab; (x + y + z)² = x² + y² + z² + 2xy + 2yz + 2zx; (x + y)³ = x³ + y³ + 3xy(x + y); (x − y)³ = x³ − y³ − 3xy(x − y); x³ + y³ + z³ − 3xyz = (x + y + z)(x² + y² + z² − xy − yz − zx).',
 detail:'Corollary: if x + y + z = 0, then x³ + y³ + z³ = 3xyz. Examples: 99 × 101 = (100 − 1)(100 + 1) = 9999; 104³ = (100 + 4)³ = 1,000,000 + 64 + 3 × 100 × 4 × 104 = 1,124,864. (−12)³ + 7³ + 5³: sum is 0, so = 3(−12)(7)(5) = −1260.',
 real:'Mental maths tricks for squares and products are identities in disguise.',
 apply:'Evaluate 103 × 107 and (28)³ + (−15)³ + (−13)³ without multiplying directly.',
 see:{w:520,h:220,f:[
  ['(x + y)² as squares.',tile(150,30,110,110,TL,'x²')+tile(260,30,60,110,OR,'xy')+tile(150,140,110,60,OR,'xy')+tile(260,140,60,60,PU,'y²')],
  ['Add the areas.',lbl(420,90,'x² + 2xy + y²','font-size="17" font-weight="700" fill="'+TL+'"')],
  ['Shortcut.',lbl(420,150,'99 × 101 = 100² − 1² = 9999','font-size="13"')]]},
 seeNote:'Identities are area facts.',
 do:{title:'Cube model',mat:'Unit cubes',steps:['Build a 3 × 3 × 3 cube as (2 + 1)³.','Count the pieces: 8 + 1 + 3·2·1·3.'],obs:'27.',why:'(x + y)³.',lab:false},
 memo:'"If x + y + z = 0, cubes sum to 3xyz."',
 miscon:['"(x + y)² = x² + y²." The middle term 2xy is missing.'],
 terms:['Identity','Expansion','Corollary'],
 q:{q:'(x + 3)² =',o:['x² + 9','x² + 6x + 9','x² + 3x + 9','x² + 6x + 6'],a:1,why:'2 × 3 × x.'},
 exam:'Expand/factorise with identities; evaluate: 2–5 marks.'}
];

const CARDS=[['Polynomial','Whole-number powers of x with real coefficients.'],['Degree','Highest power.'],['Linear / quadratic / cubic','Degree 1 / 2 / 3.'],['Zero','p(k) = 0.'],['Linear zero','ax + b → x = −b/a.'],['Factor theorem','p(a) = 0 ⇔ (x − a) is a factor.'],['Split middle term','Sum b, product ac.'],['(x + y)²','x² + 2xy + y².'],['x² − y²','(x + y)(x − y).'],['(x + y)³','x³ + y³ + 3xy(x + y).'],['x³ + y³ + z³ − 3xyz','(x + y + z)(x² + y² + z² − xy − yz − zx).'],['If x + y + z = 0','x³ + y³ + z³ = 3xyz.']];

const Q=[
 {lv:1,q:'Degree of 5x³ − 4x + 2:',o:['1','2','3','5'],a:2,w:'Highest power.'},
 {lv:1,q:'Which is a binomial?',o:['x²','x² + 1','x² + x + 1','5'],a:1,w:'Two terms.'},
 {lv:1,q:'Zero of x − 7:',o:['−7','7','0','1/7'],a:1,w:'p(7) = 0.'},
 {lv:2,q:'p(x) = x² − 5x + 6. p(2) =',o:['0','12','−4','20'],a:0,w:'4 − 10 + 6.'},
 {lv:2,q:'(x + 1) is a factor of:',o:['x² + 1','x² − 1','x² + 2','x³ + 2'],a:1,w:'p(−1) = 0.'},
 {lv:2,q:'99² using an identity =',o:['9801','9810','9901','9999'],a:0,w:'(100 − 1)².'},
 {lv:3,q:'2x² + 7x + 3 =',o:['(2x + 1)(x + 3)','(2x + 3)(x + 1)','(x + 7)(2x + 3)','(2x − 1)(x − 3)'],a:0,w:'Split 7x = 6x + x.'},
 {lv:3,q:'k if (x − 1) is a factor of x² + x + k:',o:['2','−2','1','0'],a:1,w:'1 + 1 + k = 0.'},
 {lv:4,q:'If x + y + z = 0, x³ + y³ + z³ =',o:['0','xyz','3xyz','x + y + z'],a:2,w:'Corollary.'},
 {lv:4,q:'Factor of x³ − 6x² + 11x − 6:',o:['(x + 1)','(x − 2)','(x + 3)','(x − 4)'],a:1,w:'p(2) = 8 − 24 + 22 − 6 = 0.'},
 {lv:5,open:true,m:3,q:'Factorise 6x² + 17x + 5 by splitting the middle term.',ans:['ac = 30; 15 + 2 = 17 (1)','6x² + 15x + 2x + 5 = 3x(2x + 5) + 1(2x + 5) (1)','(3x + 1)(2x + 5) (1)']},
 {lv:5,open:true,m:5,q:'Factorise x³ − 23x² + 142x − 120 completely.',ans:['Try factors of 120: p(1) = 0 (1)','(x − 1) is a factor (1)','Divide: x² − 22x + 120 (1)','= (x − 10)(x − 12) (1)','p(x) = (x − 1)(x − 10)(x − 12) (1)']}
];

const ONEMIN=['Polynomials: whole-number powers; degree.','Mono/bi/trinomial; linear/quadratic/cubic.','Zeroes: p(k) = 0.','Factor theorem.','Split the middle term; cubics.','Identities and the 3xyz corollary.'];
const KEYS=[['polynomial',/polynomial|degree/i],['types',/monomial|binomial|quadratic|cubic/i],['zero',/zero|root/i],['factor theorem',/factor theorem|p\(a\)/i],['factorise',/factoris|split/i],['identities',/identit|x³ \+ y³/i]];

/* ---------- lab ---------- */
let A=1,B=-2,Cc=-5,D=6,K=1,wired=false;
const p=x=>A*x*x*x+B*x*x+Cc*x+D;
function zeros(){const z=[];let prev=p(-6),px=-6;for(let x=-6+.01;x<=6;x+=.01){const v=p(x);if(v===0||prev*v<0){let lo=px,hi=x;for(let k=0;k<40;k++){const m=(lo+hi)/2;if(p(lo)*p(m)<=0)hi=m;else lo=m}const r=(lo+hi)/2;if(!z.some(q=>Math.abs(q-r)<.02))z.push(r)}prev=v;px=x}return z}
function fmt(){const t=[[A,'x³'],[B,'x²'],[Cc,'x'],[D,'']].filter(([c])=>c!==0);if(!t.length)return '0';return t.map(([c,v],i)=>{const s=c<0?'− ':(i?'+ ':'');const a=Math.abs(c);return s+((a===1&&v)?'':a)+v}).join(' ')}
function draw(){const X0=260,Y0=170,SX=40,SY=8;let s=`<line x1="20" y1="${Y0}" x2="500" y2="${Y0}" stroke="${ink}"/><line x1="${X0}" y1="10" x2="${X0}" y2="330" stroke="${ink}"/>`;
 for(let k=-5;k<=5;k++)if(k)s+=`<line x1="${X0+k*SX}" y1="${Y0-4}" x2="${X0+k*SX}" y2="${Y0+4}" stroke="${ink}"/>`+T(X0+k*SX,Y0+18,k,'font-size="10"');
 let d='',pen=false;for(let i=0;i<=600;i++){const x=-6+i*.02,y=p(x),sy=Y0-y*SY;if(sy<-200||sy>540){pen=false;continue}d+=(pen?'L':'M')+(X0+x*SX).toFixed(1)+' '+sy.toFixed(1);pen=true}
 s+=`<path d="${d}" fill="none" stroke="${TL}" stroke-width="3"/>`;const z=zeros();z.forEach(r=>s+=`<circle cx="${X0+r*SX}" cy="${Y0}" r="6" fill="${OR}"/>`);
 const pk=p(K);s+=`<line x1="${X0+K*SX}" y1="${Y0}" x2="${X0+K*SX}" y2="${Math.max(10,Math.min(330,Y0-pk*SY))}" stroke="${PU}" stroke-width="2" stroke-dasharray="4 3"/><circle cx="${X0+K*SX}" cy="${Math.max(10,Math.min(330,Y0-pk*SY))}" r="5" fill="${PU}"/>`;
 s+=`<rect x="300" y="10" width="210" height="26" rx="8" style="fill:var(--card)" opacity=".9"/>`+T(405,28,'p(x) = '+fmt(),'font-size="14" font-weight="700"');
 $('#pgSvg').innerHTML=`<defs><clipPath id="pgc"><rect x="0" y="0" width="520" height="340"/></clipPath></defs><g clip-path="url(#pgc)">${s}</g>`;
 [['A',A],['B',B],['C',Cc],['D',D],['K',K]].forEach(([k,v])=>$('#pg'+k+'v').textContent=v);
 const deg=A?3:B?2:Cc?1:0;const isF=Math.abs(pk)<1e-9;
 $('#pgOut').innerHTML=`<p>Degree <b>${deg}</b> (${['constant','linear','quadratic','cubic'][deg]}). Real zeroes: <b>${z.length?z.map(r=>Math.abs(r-Math.round(r))<.005?Math.round(r):r.toFixed(2)).join(', '):'none'}</b>.</p><p>p(${K}) = (${A})(${K})³ + (${B})(${K})² + (${Cc})(${K}) + (${D}) = <b>${pk}</b> → ${isF?`<b>(x ${K<0?'+ '+(-K):'− '+K}) is a factor</b> (factor theorem).`:`(x ${K<0?'+ '+(-K):'− '+K}) is not a factor.`}</p>`}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const el=e.target;if(!el||!el.classList||!el.classList.contains('pgS'))return;const v=+el.value;({pgA:()=>A=v,pgB:()=>B=v,pgC:()=>Cc=v,pgD:()=>D=v,pgK:()=>K=v})[el.id]();draw()})}
function labClick(){return false}
function labChange(){return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
