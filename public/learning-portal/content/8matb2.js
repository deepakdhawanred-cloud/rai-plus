/* Rai Plus content pack: Class 8 Mathematics (Ganita Prakash Part 2), Chapter 2 – The Baudhayana-Pythagoras Theorem. */
RP.register({key:'8matb2',cls:'8',subject:'Mathematics',ch:'II-2',title:"The Baudhayana-Pythagoras Theorem",color:'#a0522d',
crumb:"Class 8 Mathematics · Ganita Prakash Part 2",h1:"Part 2 · Chapter 2: The Baudhayana-Pythagoras Theorem",sub:"Squares on the sides of a right triangle, Baudhayana's statement in the Śulba-Sūtras, a visual proof, finding missing sides, triples, the converse, and real-life uses.",heroLabel:"Squares on the three sides of a right triangle",labName:'Right-triangle squares lab',
theme:"\n:root{--g:light-dark(#a0522d,#f0b28e);--g2:light-dark(#fbf0ea,#1d0f08);--line:light-dark(#efd5c6,#46291b);--bg:light-dark(#ffffff,#120a06);--card:light-dark(#ffffff,#1b100a);\n--ink:light-dark(#2b150a,#f6e7de);--mute:light-dark(#6d4f40,#d0b3a3);--y:light-dark(#1f5f8b,#8fc2e6);--y2:light-dark(#e8f1f8,#0b1622);--hd:#7f3f20}\n",
labHTML:`  <h2>Right-triangle squares lab</h2>
  <p>Set the two shorter sides a and b, and the angle between them. Squares are drawn on all three sides. When the angle is 90°, the two smaller square areas add up exactly to the biggest. Try other angles too.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="ptSvg" viewBox="0 0 460 320" role="img" aria-label="Squares on triangle sides" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>a: <b id="ptAv"></b><input type="range" class="ptS" id="ptA" min="1" max="12" value="3"></label> <label>b: <b id="ptBv"></b><input type="range" class="ptS" id="ptB" min="1" max="12" value="4"></label></div>
  <div class="ctrl"><label>Angle between a and b: <b id="ptGv"></b><input type="range" class="ptS" id="ptG" min="45" max="135" step="5" value="90"></label></div>
  <div class="ctrl"><button class="btn" id="ptT">Find a triple</button></div>
  <div class="box y" id="ptOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#a0522d',LABNAME='Right-triangle squares lab',MIND_CENTER='Baudhayana–Pythagoras';
const BR='#a0522d',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const P=(pts,c,o=.25)=>`<polygon points="${pts.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')}" fill="${c}" fill-opacity="${o}" stroke="${c}" stroke-width="2"/>`;
function sqOn(p,q,out){const dx=q[0]-p[0],dy=q[1]-p[1];const nx=out*dy,ny=-out*dx;return [p,q,[q[0]+nx,q[1]+ny],[p[0]+nx,p[1]+ny]]}
function heroDraw(){return `<polygon points="150,110 230,110 150,50" fill="none" stroke="#fff" stroke-width="2.5"/><rect x="150" y="110" width="80" height="40" fill="none" stroke="#fff" stroke-width="1.5"/><rect x="110" y="50" width="40" height="60" fill="none" stroke="#fff" stroke-width="1.5"/>`}
const HERO=heroDraw;
const MIND=[['Right triangles',100,50],['Baudhayana\'s statement',420,50],['Visual proof',90,150],['Finding a side',430,150],['Triples & converse',110,250],['Uses',410,250]];

function tri(a,b,ox,oy,u){const A=[ox,oy],B=[ox+a*u,oy],Cc=[ox,oy-b*u];return {A,B,C:Cc}}
const C=[
{id:'b1',num:'2.1',title:'Right triangles and their sides',
 intro:'In a right triangle, which side is always the longest?',
 obj:'Identify the hypotenuse and legs of a right triangle.',
 prior:'Class 7: triangles, angle sum; Class 8 Ch 1 squares.',
 simple:'A right triangle has one angle of 90°. The side opposite the right angle is the hypotenuse — always the longest side. The two sides forming the right angle are the legs (often called the base and the height/perpendicular).',
 detail:'Because the other two angles add to 90°, each is acute, and the hypotenuse is opposite the biggest angle, so it is longest. Right triangles appear wherever vertical meets horizontal: walls and floors, ladders against walls, ramps.',
 real:'A ladder leaning against a wall forms a right triangle with the wall and the ground.',
 apply:'In triangle PQR, ∠Q = 90°. Name the hypotenuse.',
 see:{w:520,h:220,f:[
  ['A right triangle.',P([[120,190],[400,190],[120,40]],BR,.15)+`<path d="M120 172 h18 v18" fill="none" stroke="${ink}" stroke-width="1.5"/>`],
  ['Legs a and b.',lbl(260,210,'leg a','fill="'+BL+'"')+lbl(95,115,'leg b','fill="'+GN+'"')],
  ['Hypotenuse c: opposite the right angle.',lbl(285,105,'hypotenuse c','fill="'+OR+'" font-weight="700"')]]},
 seeNote:'Hypotenuse faces the right angle.',
 do:{title:'Spot the right triangles',mat:'Classroom',steps:['Find 5 right triangles around you.','Mark the hypotenuse.'],obs:'Many everywhere.',why:'Recognition.',lab:false},
 memo:'"Hypotenuse: opposite the square corner."',
 miscon:['"The hypotenuse is the slanting side in any triangle." Only in a right triangle, opposite the 90°.'],
 terms:['Right triangle','Hypotenuse','Legs'],
 q:{q:'The longest side of a right triangle is the:',o:['base','height','hypotenuse','median'],a:2,why:'Opposite 90°.'},
 exam:'Identify hypotenuse: 1 mark.'},

{id:'b2',num:'2.2',title:'Baudhayana\'s statement',
 intro:'Around 800 BCE — centuries before Pythagoras — an Indian text described this property using ropes. What did it say?',
 obj:'State the theorem and its history.',
 prior:'2.1; Class 7 Śulba-Sūtras.',
 simple:'In the Baudhāyana Śulba-Sūtra (around 800 BCE), Baudhayana stated (for a rectangle) that the rope stretched along the diagonal produces an area equal to the areas produced by the length and the breadth together. In modern words: in a right triangle, the square on the hypotenuse equals the sum of the squares on the other two sides: c² = a² + b². It is known as the Baudhayana-Pythagoras theorem.',
 detail:'Pythagoras (Greece, about 6th century BCE) is traditionally credited with a proof; Babylonian tablets and Chinese texts also show knowledge of it. Indian altar-builders used it to construct right angles and squares of required areas — for example, a square with double the area of a given square, using its diagonal.',
 real:'The theorem is used daily by architects, carpenters, surveyors and engineers.',
 apply:'Write the theorem for a right triangle with legs p, q and hypotenuse r.',
 see:{w:520,h:270,f:[
  ['Right triangle.',P([[200,170],[280,170],[200,110]],BR,.25)],
  ['Squares on the legs.',P([[200,170],[280,170],[280,250],[200,250]],BL,.25)+P([[200,170],[200,110],[140,110],[140,170]],GN,.25)+lbl(240,215,'a²','font-weight="700"')+lbl(170,145,'b²','font-weight="700"')],
  ['Square on hypotenuse = sum.',P([[280,170],[200,110],[260,30],[340,90]],OR,.2)+lbl(270,105,'c²','font-weight="700"')+lbl(440,200,'c² = a² + b²','font-size="17" font-weight="700"')]]},
 seeNote:'Big square = two small squares together.',
 do:{title:'Rope triangle',mat:'Rope with 12 equal knots',steps:['Form a 3-4-5 triangle.','Check the corner with a set square.'],obs:'Right angle.',why:'9 + 16 = 25.',lab:false},
 memo:'"Square on the slant = squares on the sides added."',
 miscon:['"The theorem was first known in Greece." Baudhayana stated it earlier in India.'],
 terms:['Baudhāyana Śulba-Sūtra','Theorem','c² = a² + b²'],
 q:{q:'The Śulba-Sūtras were written to help build:',o:['ships','fire altars','forts','canals'],a:1,why:'Vedic altars.'},
 exam:'State the theorem: 1–2 marks.'},

{id:'b3',num:'2.3',title:'A visual proof',
 intro:'Can you see why c² = a² + b² without any algebra?',
 obj:'Follow a rearrangement proof of the theorem.',
 prior:'2.2; area of squares and triangles.',
 simple:'Take a big square of side (a + b). Place four copies of the right triangle inside it so that they leave a tilted square of side c in the middle: area left = c². Rearrange the same four triangles into two rectangles; now the space left is two squares, a² and b². Same big square, same four triangles — so the leftover areas are equal: c² = a² + b².',
 detail:'Algebraic version: (a + b)² = 4 × ½ab + c² → a² + 2ab + b² = 2ab + c² → a² + b² = c². This uses the identity from Part 1 Chapter 6. There are hundreds of known proofs, including one attributed to Bhaskara II (12th century) with the single word "Behold!".',
 real:'Tile patterns on floors can show this proof.',
 apply:'Use (a + b)² = 4(½ab) + c² to derive the theorem.',
 see:{w:520,h:240,f:[
  ['Big square of side a + b.',`<rect x="40" y="20" width="200" height="200" fill="none" stroke="${ink}" stroke-width="2"/><rect x="280" y="20" width="200" height="200" fill="none" stroke="${ink}" stroke-width="2"/>`],
  ['Arrangement 1: leftover c².',P([[40,20],[160,20],[40,100]],BR,.35)+P([[160,20],[240,20],[240,140]],BR,.35)+P([[240,140],[240,220],[120,220]],BR,.35)+P([[120,220],[40,220],[40,100]],BR,.35)+P([[160,20],[240,140],[120,220],[40,100]],OR,.2)+lbl(140,125,'c²','font-weight="700"')],
  ['Arrangement 2: leftover a² + b².',P([[280,20],[400,20],[400,100]],BR,.35)+P([[280,20],[280,100],[400,100]],BR,.35)+P([[400,100],[480,100],[480,220]],BR,.35)+P([[400,100],[400,220],[480,220]],BR,.35)+`<rect x="400" y="20" width="80" height="80" fill="${GN}" fill-opacity=".3" stroke="${GN}"/><rect x="280" y="100" width="120" height="120" fill="${BL}" fill-opacity=".3" stroke="${BL}"/>`+lbl(440,65,'b²','font-weight="700"')+lbl(340,165,'a²','font-weight="700"')]]},
 seeNote:'Same triangles, same leftover area.',
 do:{title:'Cut-out proof',mat:'Paper, scissors',steps:['Cut four equal right triangles and a square frame of side a + b.','Arrange both ways.'],obs:'Leftovers match.',why:'Area conservation.',lab:true},
 memo:'"Behold — rearrange and compare."',
 miscon:['"Checking with one triangle proves it." Proofs work for all right triangles.'],
 terms:['Proof','Rearrangement','Area'],
 q:{q:'In the proof, the big square has side:',o:['c','a + b','a − b','2c'],a:1,why:'Four triangles fit.'},
 exam:'Explain a proof: 3 marks.'},

{id:'b4',num:'2.4',title:'Finding a missing side',
 intro:'A 13 m ladder reaches a window; its foot is 5 m from the wall. How high is the window?',
 obj:'Use the theorem to find the hypotenuse or a leg.',
 prior:'2.2; Class 8 Ch 1 square roots.',
 simple:'Hypotenuse: c = √(a² + b²). Legs 6 and 8: c = √(36 + 64) = √100 = 10. Leg: a = √(c² − b²). Ladder: height = √(13² − 5²) = √(169 − 25) = √144 = 12 m.',
 detail:'If the answer is not a perfect square, estimate: legs 1 and 1 → c = √2 ≈ 1.414; this is the diagonal of a unit square. Baudhayana gave a remarkably accurate approximation for √2. Diagonal of a rectangle l × b = √(l² + b²).',
 real:'TV and phone screens are sold by diagonal length: a 16 × 9 screen ratio and the theorem give the size.',
 apply:'A rectangle is 20 cm × 21 cm. Find its diagonal.',
 see:{w:520,h:220,f:[
  ['Wall and ground.',`<line x1="350" y1="20" x2="350" y2="200" stroke="${ink}" stroke-width="4"/><line x1="100" y1="200" x2="460" y2="200" stroke="${ink}" stroke-width="3"/>`],
  ['Ladder 13 m, foot 5 m away.',`<line x1="250" y1="200" x2="350" y2="40" stroke="${BR}" stroke-width="5"/>`+lbl(280,110,'13 m','fill="'+BR+'" font-weight="700"')+lbl(300,218,'5 m')],
  ['Height = √(169 − 25) = 12 m.',lbl(410,120,'h = 12 m','font-size="16" font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Add squares for the hypotenuse; subtract for a leg.',
 do:{title:'Measure a diagonal',mat:'Notebook, ruler',steps:['Measure length and width of your notebook.','Predict the diagonal; measure it.'],obs:'Close match.',why:'c = √(l² + b²).',lab:true},
 memo:'"Hypotenuse: add then root. Leg: subtract then root."',
 miscon:['"c = a + b." The hypotenuse is shorter than a + b; use squares.'],
 terms:['Square root','Diagonal','Leg'],
 q:{q:'Legs 9 and 12. Hypotenuse:',o:['15','21','13','√21'],a:0,why:'81 + 144 = 225.'},
 exam:'Find missing side: 2–3 marks.'},

{id:'b5',num:'2.5',title:'Triples and the converse',
 intro:'Is a triangle with sides 7, 24, 25 a right triangle? How can you tell without measuring?',
 obj:'Recognise Baudhayana-Pythagorean triples and use the converse to test for right angles.',
 prior:'2.4.',
 simple:'A triple of whole numbers (a, b, c) with a² + b² = c² is a Baudhayana-Pythagorean triple: (3, 4, 5), (5, 12, 13), (8, 15, 17), (7, 24, 25), (20, 21, 29). Multiples of a triple are triples too: (6, 8, 10), (9, 12, 15). Converse: if the sides of a triangle satisfy a² + b² = c² (c largest), the triangle is right-angled.',
 detail:'7² + 24² = 49 + 576 = 625 = 25² → right triangle. If a² + b² > c², the largest angle is acute; if a² + b² < c², it is obtuse. Many triples were listed in the Śulba-Sūtras.',
 real:'Masons use 3-4-5 (or 6-8-10) to check that corners are square.',
 apply:'Is (9, 40, 41) a triple? Is a triangle with sides 6, 7, 9 right, acute or obtuse?',
 see:{w:520,h:200,f:[
  ['7, 24, 25',lbl(260,50,'sides 7, 24, 25','font-size="18"')],
  ['49 + 576 = 625 = 25²',lbl(260,105,'7² + 24² = 49 + 576 = 625 = 25²','font-size="17"')],
  ['Right triangle!',lbl(260,160,'converse → right angle ✓','font-size="17" font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Check a² + b² against c².',
 do:{title:'Triple hunt',mat:'Notebook',steps:['Use (m² − n², 2mn, m² + n²) with small m > n.'],obs:'New triples.',why:'Formula for triples.',lab:true},
 memo:'"3-4-5, 5-12-13, 8-15-17."',
 miscon:['"Any three consecutive numbers make a triple." Only 3, 4, 5.'],
 terms:['Triple','Converse','Acute / obtuse test'],
 q:{q:'Which is a triple?',o:['(4, 5, 6)','(5, 12, 13)','(6, 7, 8)','(2, 3, 4)'],a:1,why:'25 + 144 = 169.'},
 exam:'Test for right angle: 2 marks.'},

{id:'b6',num:'2.6',title:'Using the theorem in real life',
 intro:'How far is it diagonally across a cricket ground, or straight from your home to school if you walk 3 km east and 4 km north?',
 obj:'Apply the theorem to distance and design problems.',
 prior:'2.4, 2.5.',
 simple:'Whenever two distances are at right angles, the straight-line distance is the hypotenuse. 3 km east + 4 km north → straight distance 5 km. A 40-inch TV with a 32-inch width has height √(40² − 32²) = 24 inches. Ramps, roof slopes, poles with support wires — all use the theorem.',
 detail:'In 3D: the space diagonal of a box l × b × h = √(l² + b² + h²) — apply the theorem twice. Doubling a square\'s area: build a square on its diagonal (side √2 times) — Baudhayana\'s method.',
 real:'A 5 m pole needs a support wire fixed 12 m away on the ground: wire length 13 m.',
 apply:'A rectangular park is 60 m × 80 m. How much shorter is walking diagonally than along two sides?',
 see:{w:520,h:220,f:[
  ['3 km east.',`<line x1="80" y1="190" x2="320" y2="190" stroke="${BL}" stroke-width="4"/>`+lbl(200,210,'3 km east','fill="'+BL+'"')],
  ['4 km north.',`<line x1="320" y1="190" x2="320" y2="30" stroke="${GN}" stroke-width="4"/>`+lbl(370,110,'4 km north','fill="'+GN+'"')],
  ['Straight: 5 km.',`<line x1="80" y1="190" x2="320" y2="30" stroke="${OR}" stroke-width="4" stroke-dasharray="8 5"/>`+lbl(170,100,'5 km','fill="'+OR+'" font-weight="700"')]]},
 seeNote:'Right-angle paths → hypotenuse shortcut.',
 do:{title:'Shortcut survey',mat:'Measuring tape, school ground',steps:['Measure two sides of a rectangular ground.','Compute and then measure the diagonal.'],obs:'They agree.',why:'Theorem in action.',lab:false},
 memo:'"East and north? Use the theorem."',
 miscon:['"Diagonal = length + breadth." It is shorter.'],
 terms:['Straight-line distance','Space diagonal','Application'],
 q:{q:'6 km east then 8 km north. Straight distance:',o:['14 km','10 km','12 km','2 km'],a:1,why:'36 + 64 = 100.'},
 exam:'Word problems: 3 marks.'}
];

const CARDS=[['Hypotenuse','Opposite the right angle; longest.'],['Theorem','c² = a² + b².'],['Baudhayana','Śulba-Sūtra, ~800 BCE.'],['Proof','Rearrange four triangles in (a + b)².'],['Hypotenuse','c = √(a² + b²).'],['Leg','a = √(c² − b²).'],['Triples','3-4-5, 5-12-13, 8-15-17, 7-24-25.'],['Multiples','6-8-10 is also a triple.'],['Converse','a² + b² = c² ⇒ right angle.'],['Uses','Ladders, diagonals, distances.']];

const Q=[
 {lv:1,q:'Legs 3 and 4. Hypotenuse:',o:['5','7','6','25'],a:0,w:'9 + 16.'},
 {lv:1,q:'The hypotenuse is opposite the:',o:['smallest angle','right angle','base','height'],a:1,w:'90°.'},
 {lv:1,q:'Who stated the theorem in the Śulba-Sūtras?',o:['Aryabhata','Baudhayana','Bhaskara','Brahmagupta'],a:1,w:'Baudhayana.'},
 {lv:2,q:'Hypotenuse 17, one leg 8. Other leg:',o:['15','9','25','12'],a:0,w:'289 − 64 = 225.'},
 {lv:2,q:'Diagonal of a 12 × 5 rectangle:',o:['13','17','7','15'],a:0,w:'144 + 25.'},
 {lv:2,q:'Is (6, 8, 10) a triple?',o:['yes','no'],a:0,w:'2 × (3,4,5).'},
 {lv:3,q:'Sides 6, 7, 9: the triangle is',o:['right','acute','obtuse','impossible'],a:2,w:'36 + 49 = 85 < 81? No: 85 > 81 → acute.'},
 {lv:3,q:'A 10 m ladder, foot 6 m from wall. Height reached:',o:['8 m','4 m','16 m','√136 m'],a:0,w:'100 − 36.'},
 {lv:4,q:'Diagonal of a unit square is:',o:['1','2','√2','1.5'],a:2,w:'√(1 + 1).'},
 {lv:4,q:'Walk 9 km east, 12 km north. Straight distance:',o:['21 km','15 km','3 km','18 km'],a:1,w:'81 + 144.'},
 {lv:5,open:true,m:3,q:'Show using the area of (a + b)² that a² + b² = c² for a right triangle.',ans:['Big square of side a + b holds 4 triangles and a square of side c (1)','(a + b)² = 4 × ½ab + c² (1)','a² + 2ab + b² = 2ab + c² ⇒ a² + b² = c² (1)']},
 {lv:5,open:true,m:3,q:'Check whether a triangle with sides 20, 21 and 29 is right-angled.',ans:['Largest side 29: 29² = 841 (1)','20² + 21² = 400 + 441 = 841 (1)','Equal → right-angled (converse) (1)']}
];
Q[6]={lv:3,q:'Sides 6, 7, 9: the triangle is',o:['right','acute','obtuse','impossible'],a:1,w:'36 + 49 = 85 > 81 → largest angle acute.'};

const ONEMIN=['Right triangle; hypotenuse.','Baudhayana\'s statement: c² = a² + b².','Rearrangement proof.','Finding sides.','Triples and converse.','Real-life uses.'];
const KEYS=[['hypotenuse',/hypotenuse/i],['theorem',/c² = a² \+ b²|theorem/i],['Baudhayana',/baudhayana|ulba/i],['proof',/proof|rearrang/i],['triple',/triple/i],['converse',/converse/i]];

/* ---------- lab ---------- */
let a=3,b=4,G=90,wired=false;
function draw(){const th=G*Math.PI/180;const c2=a*a+b*b-2*a*b*Math.cos(th);const c=Math.sqrt(c2);const sc=Math.min(14,110/Math.max(a,b,c));
 const O=[190-(b*sc*Math.cos(th))/2+(G>90?0:0),215],A=[O[0]+a*sc,O[1]],Bp=[O[0]+b*sc*Math.cos(th),O[1]-b*sc*Math.sin(th)];
 const sA=sqOn(O,A,-1),sB=sqOn(Bp,O,-1),sC=sqOn(A,Bp,-1);const cen=q=>[(q[0][0]+q[2][0])/2,(q[0][1]+q[2][1])/2];
 let s=P(sA,BL,.22)+P(sB,GN,.22)+P(sC,OR,.18)+P([O,A,Bp],BR,.35);
 if(G===90)s+=`<path d="M${O[0]+10} ${O[1]} v-10 h-10" fill="none" stroke="${ink}" stroke-width="1.5"/>`;
 [[sA,`a²=${a*a}`,BL],[sB,`b²=${b*b}`,GN],[sC,`c²=${+c2.toFixed(1)}`,OR]].forEach(([q,t,col])=>{const m=cen(q);s+=T(m[0],m[1]+5,t,'font-size="12" font-weight="700" fill="'+col+'"')});
 $('#ptSvg').innerHTML=s;$('#ptAv').textContent=a;$('#ptBv').textContent=b;$('#ptGv').textContent=G+'°';
 const sum=a*a+b*b;const isInt=Math.abs(c-Math.round(c))<1e-9;
 $('#ptOut').innerHTML=G===90?`<p><b>a² + b² = ${a*a} + ${b*b} = ${sum} = c²</b>, so c = √${sum} ${isInt?`= <b>${Math.round(c)}</b>`:`≈ ${c.toFixed(2)}`}.</p>${isInt?`<p class="fb ok">(${Math.min(a,b)}, ${Math.max(a,b)}, ${Math.round(c)}) is a Baudhayana-Pythagorean triple!</p>`:''}`:`<p>Angle ${G}°: c² ≈ ${c2.toFixed(1)}, but a² + b² = ${sum}. ${G<90?'a² + b² > c² — the angle is acute.':'a² + b² < c² — the angle is obtuse.'}</p><p>Only at exactly 90° does a² + b² = c².</p>`}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(!e.target||!e.target.classList||!e.target.classList.contains('ptS'))return;const v=+e.target.value;if(e.target.id==='ptA')a=v;else if(e.target.id==='ptB')b=v;else G=v;draw()})}
function labClick(bt){if(bt.id==='ptT'){const t=[[3,4],[5,12],[8,15],[6,8],[9,12],[12,5],[4,3]][Math.floor(Math.random()*7)];a=t[0];b=t[1];G=90;$('#ptA').value=a;$('#ptB').value=b;$('#ptG').value=90;draw();return true}return false}
function labChange(){return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
