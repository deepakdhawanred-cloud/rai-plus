/* Rai Plus content pack: Class 9 Mathematics, Chapter 4 – Linear Equations in Two Variables (rationalised NCERT). */
RP.register({key:'9mat04',cls:'9',subject:'Mathematics',ch:'4',title:"Linear Equations in Two Variables",color:'#b04a1f',
crumb:"HBSE Class 9 Mathematics · Unit: Algebra · Taught in August",h1:"Chapter 4: Linear Equations in Two Variables",sub:"What a linear equation in two variables is, turning word problems into equations, why there are infinitely many solutions, checking and finding solutions, and seeing them as a straight line.",heroLabel:"Solutions lining up on a straight line",labName:'Solution finder',
theme:"\n:root{--g:light-dark(#b04a1f,#f2a77f);--g2:light-dark(#fbefe9,#21110a);--line:light-dark(#f0d6c8,#4a2a1a);--bg:light-dark(#ffffff,#140c08);--card:light-dark(#ffffff,#1c120c);\n--ink:light-dark(#2d160a,#f6e8df);--mute:light-dark(#6a4c3c,#d1b8a8);--y:light-dark(#1f5f8b,#8cc4ea);--y2:light-dark(#eaf3fa,#081520);--hd:#7d3d1d}\n",
labHTML:`  <h2>Solution finder</h2>
  <p>Choose a, b and c for <b>ax + by = c</b>. The table lists solutions; each pair (x, y) is plotted. Notice they all lie on one straight line. Tap any grid point to test whether it is a solution.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="leSvg" viewBox="0 0 520 360" role="img" aria-label="Linear equation" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label><span>a: <b id="leAv"></b></span><input type="range" class="leS" id="leA" min="-5" max="5" value="2"></label></div>
  <div class="ctrl"><label><span>b: <b id="leBv"></b></span><input type="range" class="leS" id="leB" min="-5" max="5" value="1"></label></div>
  <div class="ctrl"><label><span>c: <b id="leCv"></b></span><input type="range" class="leS" id="leC" min="-10" max="10" value="6"></label></div>
  <div class="box y" id="leOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#b04a1f',LABNAME='Solution finder',MIND_CENTER='ax + by + c = 0';
const OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',RD='#c0392b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
function axes(x0,y0,u,n){let s='';for(let k=-n;k<=n;k++){s+=`<line x1="${x0+k*u}" y1="${y0-n*u}" x2="${x0+k*u}" y2="${y0+n*u}" stroke="${GR}" stroke-opacity="${k?.2:1}" stroke-width="${k?1:2}"/><line x1="${x0-n*u}" y1="${y0+k*u}" x2="${x0+n*u}" y2="${y0+k*u}" stroke="${GR}" stroke-opacity="${k?.2:1}" stroke-width="${k?1:2}"/>`;if(k&&k%2===0)s+=T(x0+k*u,y0+13,k,'font-size="9"')+T(x0-9,y0-k*u+3,k,'font-size="9"')}return s}
function heroDraw(){let s='<line x1="40" y1="130" x2="300" y2="20" stroke="#fff" stroke-width="3"/>';for(let k=0;k<6;k++){const x=60+k*45,y=130-(x-40)*110/260;s+=`<circle cx="${x}" cy="${y}" r="6" fill="#fff"/>`}return s}
const HERO=heroDraw;
const MIND=[['ax + by + c = 0',100,50],['Word problems',420,50],['Infinitely many solutions',90,150],['Checking solutions',430,150],['Graph is a line',110,250],['x = a, y = b',410,250]];

const C=[
{id:'l1',num:'4.1',title:'Linear equations in two variables',
 intro:'"The cost of a notebook is twice the cost of a pen." How can we write this with two unknowns?',
 obj:'Recognise linear equations in two variables and write them in standard form.',
 prior:'Class 8: linear equations in one variable.',
 simple:'An equation that can be written as ax + by + c = 0, where a, b, c are real numbers and a and b are not both zero, is a linear equation in two variables x and y. Examples: 2x + 3y = 12, x − 4 = √3 y, y = 3x.',
 detail:'Write each in standard form and read a, b, c: 2x + 3y = 12 → 2x + 3y − 12 = 0 (a = 2, b = 3, c = −12). x = −5 → 1x + 0y + 5 = 0 (a = 1, b = 0, c = 5). y = 3x → 3x − y + 0 = 0. An equation with x², xy or 1/x is not linear.',
 real:'Ticket sales: 50 adults (₹x each) and 20 children (₹y each) collected ₹3000 → 50x + 20y = 3000.',
 apply:'Write in the form ax + by + c = 0 and find a, b, c: 3x = 2y; y − 2 = 0; x/2 + y/3 = 1.',
 see:{w:520,h:200,f:[
  ['A sentence.',lbl(260,40,'"notebook costs twice a pen"','font-size="16"')],
  ['Variables.',lbl(260,90,'notebook = x, pen = y','font-size="16" fill="'+BL+'"')],
  ['Equation.',lbl(260,140,'x = 2y  →  x − 2y + 0 = 0','font-size="18" font-weight="700" fill="'+OR+'"')+lbl(260,180,'a = 1, b = −2, c = 0')]]},
 seeNote:'Words → symbols → standard form.',
 do:{title:'Spot the linear one',mat:'Equation cards',steps:['Sort cards: linear in two variables or not.'],obs:'No squares, products or 1/x.',why:'Definition.',lab:false},
 memo:'"ax + by + c = 0, powers of x and y only 1."',
 miscon:['"x = 5 is not an equation in two variables." It can be written as 1x + 0y − 5 = 0.'],
 terms:['Linear equation in two variables','Standard form ax + by + c = 0','Coefficient'],
 q:{q:'Which is linear in two variables?',o:['x² + y = 4','xy = 6','3x − 2y = 7','1/x + y = 2'],a:2,why:'Powers 1, no products.'},
 exam:'Standard form; identify a, b, c: 1–2 marks.'},

{id:'l2',num:'4.2',title:'Writing word problems as equations',
 intro:'In a cricket match, two batters together scored 176 runs. Can you write this as an equation?',
 obj:'Translate situations into linear equations in two variables.',
 prior:'4.1.',
 simple:'Choose letters for the two unknowns, then write the relationship. Two batters\' runs: x + y = 176. The cost of a notebook is twice that of a pen: x = 2y. A taxi charges ₹8 for the first km and ₹5 for each next km; total fare y for x km: y = 8 + 5(x − 1), i.e. 5x − y + 3 = 0.',
 detail:'Always say what each letter stands for and include units. Check the equation with an easy number. Temperature: F = (9/5)C + 32 is a linear equation in C and F.',
 real:'Shopkeepers write cost equations to find profit at different sales levels.',
 apply:'The sum of a two-digit number\'s digits is 9 — write an equation. Ramu\'s age is 3 more than twice Sita\'s — write an equation.',
 see:{w:520,h:200,f:[
  ['Two batters.',lbl(260,40,'Batter A: x runs · Batter B: y runs','font-size="15"')],
  ['Total 176.',lbl(260,95,'x + y = 176','font-size="22" font-weight="700" fill="'+OR+'"')],
  ['Many possibilities.',lbl(260,150,'(100, 76), (88, 88), (176, 0), (60, 116) …','font-size="14" fill="'+BL+'"')]]},
 seeNote:'Name, relate, write.',
 do:{title:'Make your own',mat:'Paper',steps:['Write three situations from daily life.','Swap; partners write equations.'],obs:'Practice.',why:'Modelling.',lab:false},
 memo:'"Let x be…, let y be…, then…"',
 miscon:['"Use the same letter for both unknowns." Each unknown needs its own variable.'],
 terms:['Variable','Translate','Model'],
 q:{q:'"Cost of 2 pens and 3 pencils is ₹50":',o:['2x + 3y = 50','5xy = 50','2x = 3y + 50','x + y = 50'],a:0,why:'Pens x, pencils y.'},
 exam:'Form equations from statements: 2 marks.'},

{id:'l3',num:'4.3',title:'Infinitely many solutions',
 intro:'How many pairs of numbers add up to 10?',
 obj:'Understand that a linear equation in two variables has infinitely many solutions and find some.',
 prior:'4.1, 4.2.',
 simple:'A solution is a pair of values (x, y) that makes the equation true. For x + 2y = 6: (0, 3), (2, 2), (6, 0), (4, 1) are all solutions. To find solutions, pick any value of x and solve for y (or pick y and solve for x). Since we can pick infinitely many values, there are infinitely many solutions.',
 detail:'Convenient choices: put x = 0 to find where the line meets the y-axis, and y = 0 for the x-axis. For 2x + 3y = 12: x = 0 → y = 4 → (0, 4); y = 0 → x = 6 → (6, 0); x = 3 → y = 2 → (3, 2). Fractions and negatives are allowed: x = 1 → y = 10/3.',
 real:'There are many ways to pay ₹100 using ₹10 and ₹20 notes.',
 apply:'Find four solutions of 2x + y = 7.',
 see:{w:520,h:220,f:[
  ['x + 2y = 6.',lbl(260,30,'x + 2y = 6','font-size="20" font-weight="700"')],
  ['A table of solutions.',['x','0','2','4','6'].map((v,i)=>T(120+i*70,80,v,'font-size="15" font-weight="700"')).join('')+['y','3','2','1','0'].map((v,i)=>T(120+i*70,115,v,'font-size="15" fill="'+OR+'"')).join('')],
  ['And infinitely more.',lbl(260,170,'choose any x, solve for y → endless pairs','font-weight="700" fill="'+BL+'"')]]},
 seeNote:'Pick one, solve for the other.',
 do:{title:'Note combos',mat:'Paper money',steps:['Find all ways to make ₹100 with ₹10 and ₹20 notes.','Write the equation 10x + 20y = 100.'],obs:'Several whole-number solutions.',why:'Solutions.',lab:false},
 memo:'"Two unknowns, one equation → endless answers."',
 miscon:['"An equation has only one solution." Linear equations in two variables have infinitely many.'],
 terms:['Solution','Ordered pair','Infinitely many'],
 q:{q:'A solution of x + y = 5 is:',o:['(2, 2)','(3, 2)','(5, 5)','(1, 1)'],a:1,why:'3 + 2 = 5.'},
 exam:'Find solutions: 2 marks.'},

{id:'l4',num:'4.4',title:'Checking solutions',
 intro:'Is (2, 3) a solution of 3x − 2y = 0?',
 obj:'Check whether a given pair is a solution, and find unknown constants.',
 prior:'4.3.',
 simple:'Substitute x and y into the equation. If the left side equals the right side, the pair is a solution. 3x − 2y with (2, 3): 6 − 6 = 0 ✓. With (1, 1): 3 − 2 = 1 ≠ 0 ✗.',
 detail:'Finding k: if x = 2, y = 1 is a solution of 2x + 3y = k, then k = 4 + 3 = 7. Checking is also how we test our own answers.',
 real:'Teachers check answers by substituting them back — the same idea.',
 apply:'Check (0, 2), (2, 0), (4, 0), (√2, 4√2) for x − 2y = 4. Find k if (2, 1) satisfies 2x + 3y = k.',
 see:{w:520,h:200,f:[
  ['Equation.',lbl(260,40,'3x − 2y = 0','font-size="20"')],
  ['Try (2, 3).',lbl(150,100,'3(2) − 2(3) = 0 ✓','font-size="17" fill="'+GN+'"')],
  ['Try (1, 1).',lbl(380,100,'3(1) − 2(1) = 1 ✗','font-size="17" fill="'+RD+'"')+lbl(260,160,'substitute and compare both sides','font-weight="700"')]]},
 seeNote:'Substitute, compare.',
 do:{title:'Check the pairs',mat:'Worksheet',steps:['Test 6 pairs in 2x + y = 7.'],obs:'Only some fit.',why:'Substitution.',lab:true},
 memo:'"Plug in, balance check."',
 miscon:['"(2, 3) and (3, 2) are both solutions if one is." Order matters: x first, then y.'],
 terms:['Substitution','Satisfy','LHS / RHS'],
 q:{q:'Is (1, 4) a solution of 2x + y = 6?',o:['yes','no'],a:0,why:'2 + 4 = 6.'},
 exam:'Check solutions; find k: 1–2 marks.'},

{id:'l5',num:'4.5',title:'The graph is a straight line',
 intro:'Plot several solutions of x + y = 5. What do you notice?',
 obj:'Plot solutions and see that a linear equation in two variables is represented by a straight line.',
 prior:'Chapter 3; 4.3.',
 simple:'Every solution (x, y) is a point on the coordinate plane. All solutions of a linear equation in two variables lie on one straight line, and every point on that line is a solution. That is why it is called "linear".',
 detail:'To draw the line, find two or three solutions (often x = 0 and y = 0), plot them and join with a ruler. A point not on the line is not a solution. Different equations give different lines; y = 2x passes through the origin.',
 real:'A mobile plan charging ₹200 plus ₹1 per minute gives a straight-line graph of bill vs minutes.',
 apply:'Draw the graph of x + y = 4. Use it to check whether (1, 3) and (2, 3) are solutions.',
 see:{w:520,h:260,f:[
  ['Axes.',axes(260,130,20,6)],
  ['Plot (0, 4), (2, 2), (4, 0).',[[0,4],[2,2],[4,0]].map(([x,y])=>`<circle cx="${260+x*20}" cy="${130-y*20}" r="5" fill="${OR}"/>`).join('')],
  ['They lie on a line.',`<line x1="${260-2*20}" y1="${130-6*20}" x2="${260+6*20}" y2="${130+2*20}" stroke="${BL}" stroke-width="3"/>`+lbl(420,60,'x + y = 4','fill="'+BL+'" font-weight="700"')]]},
 seeNote:'Solutions line up.',
 do:{title:'String line',mat:'Graph board, pins, string',steps:['Pin four solutions of 2x + y = 6.','Stretch a string.'],obs:'All on one line.',why:'Linear.',lab:true},
 memo:'"Two points fix the line."',
 miscon:['"Only whole-number points are solutions." Every point on the line is a solution.'],
 terms:['Graph','Straight line','Collinear points'],
 q:{q:'The graph of 2x + 3y = 6 is a:',o:['circle','curve','straight line','point'],a:2,why:'Linear.'},
 exam:'Draw graphs; read solutions: 3 marks.'},

{id:'l6',num:'4.6',title:'Lines parallel to the axes',
 intro:'What does the equation x = 3 look like on a graph?',
 obj:'Recognise equations of lines parallel to the axes.',
 prior:'4.5.',
 simple:'x = a is a line parallel to the y-axis, a units from it (all points have x = a). y = b is a line parallel to the x-axis. The x-axis itself is y = 0; the y-axis is x = 0.',
 detail:'In one variable, x = 3 is a single point on the number line. In two variables, x = 3 (that is, 1x + 0y = 3) is a whole vertical line: (3, 0), (3, 2), (3, −5) are all solutions. y = −2 is a horizontal line 2 units below the x-axis.',
 real:'On a map, a road running due north–south could be described by x = constant.',
 apply:'Give the geometric meaning of y = 3 as an equation in one variable and in two variables.',
 see:{w:520,h:260,f:[
  ['Axes.',axes(260,130,20,6)],
  ['x = 3: vertical.',`<line x1="320" y1="10" x2="320" y2="250" stroke="${OR}" stroke-width="3"/>`+lbl(350,30,'x = 3','fill="'+OR+'" font-weight="700"')],
  ['y = −2: horizontal.',`<line x1="140" y1="170" x2="380" y2="170" stroke="${BL}" stroke-width="3"/>`+lbl(170,190,'y = −2','fill="'+BL+'" font-weight="700"')]]},
 seeNote:'One coordinate fixed.',
 do:{title:'Same x club',mat:'Floor axes',steps:['Everyone with x = 2 stands up.','Notice the line.'],obs:'A vertical line.',why:'x = 2.',lab:false},
 memo:'"x = a stands up; y = b lies down."',
 miscon:['"x = 3 is a horizontal line." It is vertical.'],
 terms:['Parallel to axis','Vertical line','Horizontal line'],
 q:{q:'The graph of y = 4 is parallel to the:',o:['x-axis','y-axis','line y = x','none'],a:0,why:'Horizontal.'},
 exam:'Lines parallel to axes: 1–2 marks.'}
];

const CARDS=[['Linear eq. in two variables','ax + by + c = 0; a, b not both 0.'],['Standard form','Bring all terms to one side.'],['Solution','A pair (x, y) that satisfies it.'],['How many solutions?','Infinitely many.'],['Finding solutions','Choose x, solve for y.'],['Checking','Substitute; LHS = RHS?'],['Graph','A straight line.'],['x = a','Vertical line.'],['y = b','Horizontal line.'],['x-axis / y-axis','y = 0 / x = 0.']];

const Q=[
 {lv:1,q:'In 3x − 5y + 7 = 0, b =',o:['3','−5','7','5'],a:1,w:'Coefficient of y.'},
 {lv:1,q:'Number of solutions of x + y = 8:',o:['one','two','none','infinitely many'],a:3,w:'Two variables, one equation.'},
 {lv:1,q:'Graph of x = 2 is:',o:['horizontal','vertical','through origin','a point'],a:1,w:'Parallel to y-axis.'},
 {lv:2,q:'A solution of 2x + y = 7:',o:['(2, 3)','(3, 2)','(1, 4)','(0, 6)'],a:0,w:'4 + 3.'},
 {lv:2,q:'y = 3x in standard form:',o:['3x + y = 0','3x − y = 0','x − 3y = 0','3x = 0'],a:1,w:'Rearrange.'},
 {lv:2,q:'Where does x + 2y = 8 meet the y-axis?',o:['(0, 4)','(8, 0)','(0, 8)','(4, 0)'],a:0,w:'x = 0.'},
 {lv:3,q:'k if (2, 1) satisfies 2x + 3y = k:',o:['5','7','8','6'],a:1,w:'4 + 3.'},
 {lv:3,q:'"Sum of two numbers is 27":',o:['x − y = 27','xy = 27','x + y = 27','2x = 27'],a:2,w:'Translate.'},
 {lv:4,q:'Which point lies on 3x − 2y = 6?',o:['(2, 0)','(0, 3)','(1, 1)','(2, 2)'],a:0,w:'6 − 0 = 6.'},
 {lv:4,q:'Taxi: ₹8 for 1st km, ₹5 per next km. Equation (x km, ₹y):',o:['y = 8x','y = 5x + 3','y = 5x + 8','y = 13x'],a:1,w:'8 + 5(x − 1).'},
 {lv:5,open:true,m:3,q:'Write four solutions of 2x + y = 7 and show that they are collinear by plotting.',ans:['Four correct pairs, e.g. (0, 7), (1, 5), (2, 3), (3, 1) (1)','Plotted correctly (1)','Join: straight line (1)']},
 {lv:5,open:true,m:5,q:'The cost of a notebook is twice the cost of a pen. Write a linear equation in two variables, find three solutions, and explain why the graph is a straight line through the origin.',ans:['x = 2y or x − 2y = 0 (1)','Three solutions e.g. (0, 0), (20, 10), (30, 15) (2)','c = 0 so (0, 0) satisfies it (1)','Linear → straight line (1)']}
];

const ONEMIN=['ax + by + c = 0.','Word problems → equations.','Infinitely many solutions.','Check by substitution.','Graph: a straight line.','x = a vertical; y = b horizontal.'];
const KEYS=[['standard form',/ax \+ by|standard form/i],['word problem',/word|translate/i],['solutions',/solution/i],['check',/check|substitut/i],['graph',/graph|line/i],['axes lines',/x = a|y = b|parallel/i]];

/* ---------- lab ---------- */
let a=2,b=1,c=6,test=null,wired=false;
const X0=180,Y0=180,U=16,N=10;
function sols(){const out=[];for(let x=-3;x<=3;x++){if(b!==0){const y=(c-a*x)/b;out.push([x,y])}}if(b===0&&a!==0){for(let y=-2;y<=2;y++)out.push([c/a,y])}return out}
const nice=v=>Number.isInteger(v)?String(v):(Math.abs(v*2-Math.round(v*2))<1e-9||Math.abs(v*3-Math.round(v*3))<1e-9)?(v.toFixed(2)):v.toFixed(2);
function draw(){let s=`<rect x="${X0-N*U}" y="${Y0-N*U}" width="${2*N*U}" height="${2*N*U}" fill="transparent"/>`+axes(X0,Y0,U,N);
 for(let x=-N;x<=N;x++)for(let y=-N;y<=N;y++)s+=`<circle data-le="${x},${y}" cx="${X0+x*U}" cy="${Y0-y*U}" r="6" fill="transparent" style="cursor:pointer"/>`;
 const valid=a!==0||b!==0;let line='';
 if(valid){let p1,p2;if(b!==0){p1=[-N,(c-a*-N)/b];p2=[N,(c-a*N)/b]}else{p1=[c/a,-N];p2=[c/a,N]}line=`<line x1="${X0+p1[0]*U}" y1="${Y0-p1[1]*U}" x2="${X0+p2[0]*U}" y2="${Y0-p2[1]*U}" stroke="${BL}" stroke-width="3" pointer-events="none"/>`}
 s=`<defs><clipPath id="lec"><rect x="${X0-N*U}" y="${Y0-N*U}" width="${2*N*U}" height="${2*N*U}"/></clipPath></defs>`+s+`<g clip-path="url(#lec)">${line}${valid?sols().map(([x,y])=>`<circle cx="${X0+x*U}" cy="${Y0-y*U}" r="5" fill="${OR}" pointer-events="none"/>`).join(''):''}${test?`<circle cx="${X0+test[0]*U}" cy="${Y0-test[1]*U}" r="7" fill="none" stroke="${test[2]?GN:RD}" stroke-width="3" pointer-events="none"/>`:''}</g>`;
 const co=(k,v)=>k===1?v:k===-1?'−'+v:k+v;const eq=a===0?`${co(b,'y')} = ${c}`:b===0?`${co(a,'x')} = ${c}`:`${co(a,'x')} ${b<0?'−':'+'} ${Math.abs(b)===1?'':Math.abs(b)}y = ${c}`;
 s+=T(440,24,eq,'font-size="16" font-weight="700" fill="'+BL+'"');
 const tb=valid?sols().slice(0,7):[];s+=T(400,60,'x','font-size="13" font-weight="700"')+T(470,60,'y','font-size="13" font-weight="700"');tb.forEach(([x,y],i)=>s+=T(400,82+i*22,nice(x),'font-size="12"')+T(470,82+i*22,nice(y),'font-size="12" fill="'+OR+'"'));
 $('#leSvg').innerHTML=s;$('#leAv').textContent=a;$('#leBv').textContent=b;$('#leCv').textContent=c;
 let msg=valid?`<p>Equation <b>${eq}</b>. ${b===0?`b = 0, so it is the vertical line x = ${nice(c/a)}.`:a===0?`a = 0, so it is the horizontal line y = ${nice(c/b)}.`:`Meets the y-axis at (0, ${nice(c/b)}) and the x-axis at (${nice(c/a)}, 0).`}</p>`:'<p>a and b cannot both be 0 — that is not a linear equation in two variables.</p>';
 if(test)msg+=`<p>Test (${test[0]}, ${test[1]}): ${a}(${test[0]}) + ${b}(${test[1]}) = ${a*test[0]+b*test[1]} ${test[2]?'= '+c+' ✓ <b>a solution</b> (on the line)':'≠ '+c+' ✗ <b>not a solution</b> (off the line)'}</p>`;
 $('#leOut').innerHTML=msg}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const el=e.target;if(!el||!el.classList||!el.classList.contains('leS'))return;const v=+el.value;if(el.id==='leA')a=v;else if(el.id==='leB')b=v;else c=v;test=null;draw()});
 document.addEventListener('click',e=>{const p=e.target.closest&&e.target.closest('[data-le]');if(!p)return;const [x,y]=p.dataset.le.split(',').map(Number);test=[x,y,a*x+b*y===c];draw()})}
function labClick(){return false}
function labChange(){return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
