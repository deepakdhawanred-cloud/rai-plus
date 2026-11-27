/* Rai Plus content pack: Class 12 Mathematics, Chapter 10 – Vector Algebra */
RP.register({key:'12mat10',cls:'12',subject:'Mathematics',ch:'10',title:"Vector Algebra",color:'#264f7a',
crumb:"HBSE Class 12 Mathematics · Unit: Vectors and 3D Geometry · Taught in November",h1:"Chapter 10: Vector Algebra",sub:"Quantities with size and direction: adding them, breaking them into components, and the dot and cross products.",heroLabel:"Two vectors and their sum forming a parallelogram",labName:"3D vector lab",
theme:"\n:root{--g:light-dark(#264f7a,#9cc2ea);--g2:light-dark(#ebf1f8,#111b26);--line:light-dark(#d2deeb,#253649);--bg:light-dark(#ffffff,#0b1118);--card:light-dark(#ffffff,#101823);\n--ink:light-dark(#0f1a26,#e5edf6);--mute:light-dark(#4e5f72,#a3b4c7);--y:light-dark(#c4532d,#f0997b);--y2:light-dark(#fbece6,#2a1610);--hd:#1a3756}\n",
labHTML:`  <h2>3D vector lab</h2>
  <p>Set the components of a and b. Drag the picture to turn the axes. Everything is recalculated as you go.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><canvas id="vC" width="520" height="420" style="width:100%;height:auto;display:block;touch-action:none;cursor:grab" aria-label="3D axes with vectors a, b, a plus b and a cross b"></canvas></div>
   <p class="note"><span style="color:#c4532d">■ a</span> &nbsp; <span style="color:#2e6f8a">■ b</span> &nbsp; <span style="color:#7a5a9e">■ a + b</span> &nbsp; <span style="color:#2f7d3b">■ a × b</span> (drawn shorter when it is long; its true length is in the readout)</p></div>
  <div><div class="ctrl" id="vIn"></div>
  <div class="ctrl"><label style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" id="vSum" checked style="width:22px;height:22px"> a + b</label><label style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" id="vCross" checked style="width:22px;height:22px"> a × b</label></div>
  <div class="box y" id="vOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#264f7a',LABNAME='3D vector lab',MIND_CENTER='Vectors';
const BL='#264f7a',OR='#c4532d',TE='#2e6f8a',PU='#7a5a9e',GN='#2f7d3b',ink='currentColor';
const arr=(x1,y1,x2,y2,c,w=3)=>{const a=Math.atan2(y2-y1,x2-x1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/><path d="M${x2} ${y2} L${x2-12*Math.cos(a-0.4)} ${y2-12*Math.sin(a-0.4)} L${x2-12*Math.cos(a+0.4)} ${y2-12*Math.sin(a+0.4)} Z" fill="${c}"/>`};
function heroDraw(){return arr(80,100,200,60,'#f0997b')+arr(80,100,150,30,'#9cc2ea')+arr(80,100,270,0+0,'#fff',2.5)+`<line x1="200" y1="60" x2="270" y2="0" stroke="#fff" stroke-dasharray="4 4" opacity=".6"/><line x1="150" y1="30" x2="270" y2="0" stroke="#fff" stroke-dasharray="4 4" opacity=".6"/>`}
const HERO=heroDraw;
const MIND=[['Basic concepts',90,50],['Types of vectors',430,50],['Addition',90,150],['Components and section formula',430,150],['Dot product',90,250],['Cross product',430,250]];

const C=[
{id:'v1',num:'10.2',title:'Vectors, magnitude and direction cosines',
 intro:'"Go 5 km" is not enough to find a place. "Go 5 km north-east" is. That extra piece of information is direction.',
 obj:'Distinguish scalars from vectors, represent a vector as a directed line segment, and find direction cosines and direction ratios.',
 prior:'Coordinates in 3D (Class 11).',
 simple:'A scalar has only size (length, mass, time). A vector has size and direction (displacement, velocity, force). A vector AB is drawn as an arrow from A (initial point) to B (terminal point); its length is the magnitude |AB|. In space, the angles α, β, γ that a vector makes with the x, y, z axes give its direction cosines l = cos α, m = cos β, n = cos γ.',
 detail:'A quantity with magnitude and direction is a vector; a directed line segment AB with initial point A and terminal point B represents it, and its magnitude is |AB| (or |a|). Position vector: for a point P(x, y, z), OP = r = x î + y ĵ + z k̂, with |r| = √(x² + y² + z²). Direction cosines: if r makes angles α, β, γ with the positive x, y and z axes, then l = cos α = x/|r|, m = cos β = y/|r|, n = cos γ = z/|r|, and l² + m² + n² = 1. Numbers proportional to l, m, n are direction ratios a, b, c (for r, these are x, y, z).',
 real:'A pilot\'s flight plan gives each leg as a vector: a distance and a heading.',
 apply:'Find the direction cosines of the vector joining the origin to P(1, 2, −2).',
 see:{w:520,h:240,f:[
  ['A vector: an arrow from initial point A to terminal point B.',arr(80,180,260,80,OR)+T(70,200,'A','font-size="14" font-weight="700"')+T(275,75,'B','font-size="14" font-weight="700"')],
  ['Its length is the magnitude |AB|.',T(150,110,'|AB|','font-size="14"')],
  ['Direction cosines: l = x/|r|, m = y/|r|, n = z/|r|; l² + m² + n² = 1.',T(400,150,'l² + m² + n² = 1','font-size="14" font-weight="700"')]]},
 seeNote:'Rotate a 3D vector in the Visuals tab to see α, β, γ.',
 do:{title:'Classroom vectors',mat:'Chalk, metre tape, compass app',steps:['Walk from the door to your desk; measure the straight-line distance.','Note the direction with a compass app.','Write the displacement as a vector.'],obs:'Two classmates who walk the same distance in different directions have different vectors.',why:'A vector needs both magnitude and direction.',lab:false},
 memo:'"Scalar: how much. Vector: how much and which way."',
 miscon:['"Distance is a vector." Distance is scalar; displacement is a vector.','"Direction ratios equal direction cosines." Ratios are only proportional to the cosines.'],
 terms:['Scalar','Vector','Magnitude','Position vector','Direction cosines','Direction ratios'],
 q:{q:'If l, m, n are direction cosines, then l² + m² + n² equals:',o:['0','1','3','l + m + n'],a:1,why:'Standard identity.'},
 exam:'Direction cosine questions are frequent 1–2 mark items.'},
{id:'v2',num:'10.3',title:'Types of vectors',
 intro:'When are two arrows the "same" vector, even if they start at different places?',
 obj:'Identify zero, unit, coinitial, collinear, equal and negative vectors.',
 prior:'Basic concepts (10.2).',
 simple:'Zero vector: magnitude 0, no definite direction. Unit vector: magnitude 1. Coinitial vectors: same starting point. Collinear vectors: parallel to the same line. Equal vectors: same magnitude and direction, wherever they start. Negative of a vector: same magnitude, opposite direction.',
 detail:'Zero (null) vector 0: initial and terminal points coincide, e.g. AA; its direction is indeterminate. Unit vector: magnitude 1; the unit vector in the direction of a is â = a/|a|. Coinitial vectors: two or more vectors with the same initial point. Collinear vectors: parallel to the same line, irrespective of magnitudes and directions. Equal vectors a = b: same magnitude and direction regardless of initial points. Negative of a vector: BA = −AB. Vectors here are free vectors: they can be moved parallel to themselves without changing magnitude and direction.',
 real:'Two cars both driving 60 km/h due north on different roads have equal velocity vectors.',
 apply:'Which of these are collinear: 2î + 3ĵ, −4î − 6ĵ, î + ĵ?',
 see:{w:520,h:240,f:[
  ['Equal vectors: same length and direction, different start points.',arr(60,100,160,60,OR)+arr(60,180,160,140,OR)],
  ['Negative vector: same length, opposite direction.',arr(240,60,340,100,TE)+arr(340,180,240,140,TE)],
  ['Collinear: parallel to one line. Unit vector: length 1.',arr(400,180,480,100,PU)+arr(430,200,470,160,PU,2)]]},
 seeNote:'Free vectors can slide without changing.',
 do:{title:'Sort the arrows',mat:'Squared paper with 10 arrows drawn',steps:['Measure each arrow\'s components (right/up squares).','Group equal, negative and collinear ones.'],obs:'Equal vectors have identical components; collinear ones have proportional components.',why:'Components fix a free vector.',lab:false},
 memo:'"Equal = same size + same way. Collinear = same line, any size."',
 miscon:['"Equal vectors must start at the same point." No: they are free vectors.','"Zero vector has a direction." Its direction is not defined.'],
 terms:['Zero vector','Unit vector','Coinitial','Collinear','Equal vectors','Negative vector'],
 q:{q:'The unit vector in the direction of a = 3î + 4ĵ is:',o:['3î + 4ĵ','(3î + 4ĵ)/5','(3î + 4ĵ)/7','î + ĵ'],a:1,why:'|a| = 5.'},
 exam:'Identifying types of vectors is a 1-mark MCQ favourite.'},
{id:'v3',num:'10.4',title:'Adding vectors and multiplying by a scalar',
 intro:'Walk 3 m east, then 4 m north. Where are you? 7 m away? No: 5 m.',
 obj:'Add vectors by the triangle and parallelogram laws, state the properties of addition, and multiply a vector by a scalar.',
 prior:'Types of vectors (10.3).',
 simple:'Triangle law: place b with its tail at a\'s head; a + b goes from the tail of a to the head of b. Parallelogram law: draw a and b from the same point; their sum is the diagonal. Addition is commutative and associative. Multiplying a by a number λ stretches it by |λ| and flips it if λ is negative.',
 detail:'Triangle law: if a and b are represented by the two sides of a triangle in order, then a + b is represented by the third side taken in the opposite order: AC = AB + BC. Then AB + BC + CA = 0. Parallelogram law: if two coinitial vectors are the adjacent sides of a parallelogram, their sum is the diagonal through their common point. Properties: commutative, a + b = b + a; associative, (a + b) + c = a + (b + c); additive identity, a + 0 = a; additive inverse, a + (−a) = 0. Multiplication by a scalar λ: λa has magnitude |λ||a|, same direction as a if λ > 0 and opposite if λ < 0. Distributive laws: k(a + b) = ka + kb, (k + m)a = ka + ma.',
 real:'A boat crossing a river moves along the sum of its own velocity and the river\'s current.',
 apply:'In triangle ABC, what is AB + BC + CA?',
 see:{w:520,h:240,f:[
  ['Draw a, then b from the head of a.',arr(80,180,250,130,OR)+arr(250,130,330,50,TE)],
  ['The sum a + b closes the triangle.',arr(80,180,330,50,PU,3.5)],
  ['Parallelogram: the same sum along the diagonal.',`<line x1="80" y1="180" x2="160" y2="100" stroke="${TE}" stroke-dasharray="5 4"/><line x1="160" y1="100" x2="330" y2="50" stroke="${OR}" stroke-dasharray="5 4"/>`+T(420,120,'a + b = b + a','font-size="14" font-weight="700"')]]},
 seeNote:'Watch the parallelogram build in the Visuals tab.',
 do:{title:'Walk the vectors',mat:'Open ground, tape measure, chalk',steps:['Walk 3 m east and mark; then 4 m north and mark.','Measure the straight distance from start to end.','Repeat in the order north, then east.'],obs:'5 m both times, ending at the same point.',why:'Triangle law; addition is commutative.',lab:true},
 memo:'"Head to tail, then join tail to head."',
 miscon:['"|a + b| = |a| + |b|." Only when a and b point the same way.','"−2a is shorter than a." It is twice as long, in the opposite direction.'],
 terms:['Triangle law','Parallelogram law','Commutative','Associative','Scalar multiple'],
 q:{q:'If a + b + c = 0 for three non-zero vectors, they represent:',o:['Collinear vectors','The sides of a triangle in order','Unit vectors','Equal vectors'],a:1,why:'Triangle law.'},
 exam:'Triangle-law results (AB + BC + CA = 0) are 1–2 mark questions.'},
{id:'v4',num:'10.5',title:'Components, vector joining two points and section formula',
 intro:'Any arrow in space can be built from three moves: along x, along y and along z.',
 obj:'Write vectors in î, ĵ, k̂ form, add and scale them componentwise, find the vector joining two points and use the section formula.',
 prior:'Addition and scalar multiples (10.4).',
 simple:'Any vector can be written as a = a₁î + a₂ĵ + a₃k̂, where î, ĵ, k̂ are unit vectors along the axes. Then |a| = √(a₁² + a₂² + a₃²). Add and scale by components. The vector from P₁ to P₂ is the difference of their position vectors. A point dividing PQ in ratio m : n internally has position vector (mb + na)/(m + n).',
 detail:'Component form: r = xî + yĵ + zk̂; x, y, z are the scalar components and xî, yĵ, zk̂ the vector components. For a = a₁î + a₂ĵ + a₃k̂ and b = b₁î + b₂ĵ + b₃k̂: a ± b = (a₁ ± b₁)î + (a₂ ± b₂)ĵ + (a₃ ± b₃)k̂; λa = λa₁î + λa₂ĵ + λa₃k̂; a = b iff a₁ = b₁, a₂ = b₂, a₃ = b₃. a and b are collinear iff b = λa, i.e. b₁/a₁ = b₂/a₂ = b₃/a₃. Vector joining P₁(x₁, y₁, z₁) and P₂(x₂, y₂, z₂): P₁P₂ = (x₂ − x₁)î + (y₂ − y₁)ĵ + (z₂ − z₁)k̂. Section formula: if R divides PQ (position vectors a, b) internally in the ratio m : n, then OR = (mb + na)/(m + n); externally, (mb − na)/(m − n). Mid-point: (a + b)/2.',
 real:'GPS and game engines store every movement as x, y and z components.',
 apply:'Find the position vector of the point dividing the join of P(î + 2ĵ − k̂) and Q(−î + ĵ + k̂) internally in the ratio 2 : 1.',
 see:{w:520,h:240,f:[
  ['Break a into moves along x, y and z.',arr(80,200,220,200,OR)+arr(220,200,280,150,TE)+arr(280,150,280,60,GN)],
  ['a = a₁î + a₂ĵ + a₃k̂',arr(80,200,280,60,PU,3.5)+T(400,110,'a = a₁î + a₂ĵ + a₃k̂','font-size="14" font-weight="700"')],
  ['|a| = √(a₁² + a₂² + a₃²)',T(400,170,'|a| = √(a₁² + a₂² + a₃²)','font-size="14"')]]},
 seeNote:'Try different components in the lab.',
 do:{title:'Room corner coordinates',mat:'Tape measure',steps:['Take a room corner as the origin; floor edges as x and y, the vertical edge as z.','Measure x, y, z of a ceiling-fan tip.','Write its position vector and magnitude.'],obs:'A single vector locates the fan tip.',why:'Components along three perpendicular axes fix any point.',lab:false},
 memo:'"Section: m with the far end, n with the near end, over m + n."',
 miscon:['"Section formula is (ma + nb)/(m + n)." m multiplies the far endpoint b.','"Components can be added only for unit vectors." Any vectors add componentwise.'],
 terms:['î, ĵ, k̂','Scalar components','Vector components','Section formula','Mid-point'],
 q:{q:'The vector joining A(1, 2, 3) to B(4, 6, 3) has magnitude:',o:['3','4','5','7'],a:2,why:'3î + 4ĵ + 0k̂ → 5.'},
 exam:'Section formula and component questions are 2-mark staples.'},
{id:'v5',num:'10.6.1',title:'Scalar (dot) product and projection',
 intro:'How much of your push actually moves a trolley forward if you push at an angle?',
 obj:'Define a·b = |a||b| cos θ, use it in component form, find the angle between vectors, test perpendicularity and find the projection of one vector on another.',
 prior:'Components (10.5).',
 simple:'The dot product of a and b is a number: a·b = |a||b| cos θ. In components, a·b = a₁b₁ + a₂b₂ + a₃b₃. If a·b = 0, the vectors are perpendicular. The projection of a on b is a·b/|b|.',
 detail:'Definition: a·b = |a||b| cos θ, 0 ≤ θ ≤ π. Observations: a·b is a real number; a·b = 0 iff a ⊥ b (for non-zero vectors); θ = 0 gives a·b = |a||b|, so a·a = |a|²; θ = π gives a·b = −|a||b|; î·î = ĵ·ĵ = k̂·k̂ = 1 and î·ĵ = ĵ·k̂ = k̂·î = 0. cos θ = a·b/(|a||b|). Properties: commutative (a·b = b·a) and distributive over addition. Component form: a·b = a₁b₁ + a₂b₂ + a₃b₃. Projection of a on b: a·b̂ = a·b/|b|; the projection vector is (a·b̂)b̂.',
 real:'In physics, work done W = F·d: only the component of force along the displacement does work.',
 apply:'Find the angle between a = î + ĵ − k̂ and b = î − ĵ + k̂.',
 see:{w:520,h:240,f:[
  ['Two vectors a and b with angle θ between them.',arr(80,190,340,190,TE)+arr(80,190,260,70,OR)+T(120,178,'θ','font-size="14"')],
  ['Drop a perpendicular from the head of a onto b.',`<line x1="260" y1="70" x2="260" y2="190" stroke="${ink}" stroke-dasharray="5 4"/>`],
  ['Projection of a on b = |a| cos θ = a·b/|b|.',`<line x1="80" y1="205" x2="260" y2="205" stroke="${PU}" stroke-width="4"/>`+T(420,120,'a·b = |a||b| cos θ','font-size="14" font-weight="700"')]]},
 seeNote:'Animated projection in the Visuals tab.',
 do:{title:'Push at an angle',mat:'A toy cart, a spring balance, protractor',steps:['Pull the cart with the balance at 0°, 30°, 60° keeping the reading the same.','Note how far it moves in the same pulls.','Relate to |F| cos θ.'],obs:'The cart moves less as the angle grows.',why:'Only the component along the motion, |F| cos θ, does the work.',lab:true},
 memo:'"Dot gives a number; zero dot means right angle."',
 miscon:['"a·b is a vector." It is a scalar.','"Projection of a on b = a·b/|a|." Divide by |b|.'],
 terms:['Scalar product','Angle between vectors','Perpendicular vectors','Projection'],
 q:{q:'If a·b = 0 and neither is zero, then a and b are:',o:['Parallel','Perpendicular','Equal','Collinear'],a:1,why:'cos θ = 0.'},
 exam:'Angle and projection numericals are standard 2–4 mark questions.'},
{id:'v6',num:'10.6.2',title:'Vector (cross) product and area',
 intro:'Turn a spanner. Which way does the bolt move? Up or down? The cross product answers.',
 obj:'Define a × b, use the determinant form, apply the right-hand rule, and find areas of parallelograms and triangles.',
 prior:'Dot product (10.6.1); determinants (Ch 4).',
 simple:'The cross product a × b is a vector perpendicular to both a and b, with magnitude |a||b| sin θ. Its direction follows the right-hand rule. Its magnitude equals the area of the parallelogram formed by a and b; half of it is the area of the triangle.',
 detail:'Definition: a × b = |a||b| sin θ n̂, where n̂ is the unit vector perpendicular to both a and b such that a, b, n̂ form a right-handed system. Observations: a × b is a vector; a × b = 0 iff a ∥ b (for non-zero vectors); a × a = 0; î × î = ĵ × ĵ = k̂ × k̂ = 0; î × ĵ = k̂, ĵ × k̂ = î, k̂ × î = ĵ, and reversing the order changes the sign; so a × b = −b × a (not commutative). Distributive over addition. Determinant form: a × b = |î ĵ k̂; a₁ a₂ a₃; b₁ b₂ b₃| = (a₂b₃ − a₃b₂)î − (a₁b₃ − a₃b₁)ĵ + (a₁b₂ − a₂b₁)k̂. Areas: parallelogram with adjacent sides a and b: |a × b|; with diagonals d₁ and d₂: ½|d₁ × d₂|; triangle with sides a and b: ½|a × b|. Unit vector perpendicular to a and b: ±(a × b)/|a × b|.',
 real:'Torque τ = r × F: the turning effect of a spanner points along the bolt.',
 apply:'Find the area of the triangle with vertices A(1, 1, 1), B(1, 2, 3), C(2, 3, 1).',
 see:{w:520,h:240,f:[
  ['a and b form a parallelogram.',`<path d="M80 200 L280 200 L360 120 L160 120 Z" fill="${PU}" opacity=".15" stroke="${PU}"/>`+arr(80,200,280,200,OR)+arr(80,200,160,120,TE)],
  ['a × b points perpendicular to both (right-hand rule).',arr(80,200,80,40,GN,3.5)+T(100,40,'a × b','font-size="14" font-weight="700"')],
  ['|a × b| = area of the parallelogram; ½|a × b| = triangle area.',T(420,150,'Area = |a × b|','font-size="14" font-weight="700"')]]},
 seeNote:'Turn the 3D cross product in the lab.',
 do:{title:'Right-hand check',mat:'Your right hand',steps:['Point fingers along a (î), curl them towards b (ĵ).','Your thumb points along a × b.','Swap the order and repeat.'],obs:'î × ĵ points along k̂; ĵ × î points along −k̂.',why:'The cross product is anti-commutative.',lab:false},
 memo:'"î → ĵ → k̂ → î: forward gives +, backward gives −."',
 miscon:['"a × b = b × a." It equals −(b × a).','"The cross product is a scalar." It is a vector.'],
 terms:['Vector product','Right-handed system','Determinant form','Area of parallelogram','Area of triangle'],
 q:{q:'ĵ × î equals:',o:['k̂','−k̂','0','î'],a:1,why:'î × ĵ = k̂, so ĵ × î = −k̂.'},
 exam:'Cross product, perpendicular unit vectors and area questions carry 2–5 marks every year.'}
];

const CARDS=[['Scalar vs vector','Scalar: magnitude only. Vector: magnitude and direction.'],['Position vector','r = xî + yĵ + zk̂; |r| = √(x² + y² + z²).'],['Direction cosines','l = x/|r|, m = y/|r|, n = z/|r|; l² + m² + n² = 1.'],['Unit vector','â = a/|a|.'],['Equal vectors','Same magnitude and direction.'],['Collinear','b = λa; components proportional.'],['Triangle law','AB + BC = AC; AB + BC + CA = 0.'],['Vector P₁P₂','(x₂ − x₁)î + (y₂ − y₁)ĵ + (z₂ − z₁)k̂.'],['Section formula','Internal: (mb + na)/(m + n); external: (mb − na)/(m − n).'],['Dot product','a·b = |a||b| cos θ = a₁b₁ + a₂b₂ + a₃b₃.'],['Perpendicular','a·b = 0.'],['Projection of a on b','a·b/|b|.'],['Cross product','a × b = |a||b| sin θ n̂.'],['î × ĵ','k̂ (cyclic); reversed order gives minus.'],['Parallel','a × b = 0.'],['Areas','Parallelogram |a × b|; triangle ½|a × b|; with diagonals ½|d₁ × d₂|.']];

const Q=[
 {lv:1,q:'Which is a vector quantity?',o:['Mass','Time','Displacement','Temperature'],a:2,w:'Has magnitude and direction.'},
 {lv:1,q:'The magnitude of 2î − ĵ + 2k̂ is:',o:['3','5','9','√5'],a:0,w:'√(4 + 1 + 4) = 3.'},
 {lv:1,q:'True or false: a × b = b × a.',o:['True','False'],a:1,w:'a × b = −b × a.'},
 {lv:1,q:'î·ĵ equals:',o:['1','0','k̂','−1'],a:1,w:'Perpendicular unit vectors.'},
 {lv:2,q:'The direction cosines of î + ĵ + k̂ are:',o:['1, 1, 1','1/√3, 1/√3, 1/√3','1/3, 1/3, 1/3','√3, √3, √3'],a:1,w:'Divide by √3.'},
 {lv:2,q:'The value of λ for which 2î + λĵ + k̂ and î − 2ĵ + 3k̂ are perpendicular is:',o:['1','5/2','2','−5/2'],a:1,w:'2 − 2λ + 3 = 0.'},
 {lv:2,q:'The mid-point of P(a) and Q(b) has position vector:',o:['a + b','(a + b)/2','(a − b)/2','a − b'],a:1,w:'Section formula with 1 : 1.'},
 {lv:3,q:'The projection of a = 2î + 3ĵ + 2k̂ on b = î + 2ĵ + k̂ is:',o:['10/√6','10','√6','5/√6'],a:0,w:'a·b = 10; |b| = √6.'},
 {lv:3,q:'The area of the parallelogram with adjacent sides î + ĵ and ĵ + k̂ is:',o:['1','√2','√3','2'],a:2,w:'(î + ĵ) × (ĵ + k̂) = î − ĵ + k̂; magnitude √3.'},
 {lv:3,q:'If |a| = 2, |b| = 3 and a·b = 3, the angle between a and b is:',o:['30°','45°','60°','90°'],a:2,w:'cos θ = 3/6 = 1/2.'},
 {lv:4,q:'Assertion (A): For non-zero vectors, a × b = 0 implies a ∥ b. Reason (R): |a × b| = |a||b| sin θ.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'sin θ = 0.'},
 {lv:4,q:'If |a + b| = |a − b|, then a and b are:',o:['Parallel','Perpendicular','Equal','Opposite'],a:1,w:'Squaring gives a·b = 0.'},
 {lv:4,q:'|a × b|² + (a·b)² equals:',o:['|a|²|b|²','0','|a| + |b|','2a·b'],a:0,w:'sin²θ + cos²θ = 1.'},
 {lv:5,open:true,m:3,q:'Find the angle between a = î + ĵ − k̂ and b = î − ĵ + k̂.',ans:['a·b = 1 − 1 − 1 = −1 (1).','|a| = |b| = √3 (1).','cos θ = −1/3, θ = cos⁻¹(−1/3) (1).']},
 {lv:5,open:true,m:3,q:'Find a unit vector perpendicular to both a = î + ĵ + k̂ and b = î + 2ĵ + 3k̂.',ans:['a × b = î(3 − 2) − ĵ(3 − 1) + k̂(2 − 1) = î − 2ĵ + k̂ (1.5).','|a × b| = √6 (0.5).','Unit vectors: ±(î − 2ĵ + k̂)/√6 (1).']},
 {lv:5,open:true,m:4,q:'Find the area of the triangle with vertices A(1, 1, 1), B(1, 2, 3) and C(2, 3, 1).',ans:['AB = ĵ + 2k̂, AC = î + 2ĵ (1).','AB × AC = î(0 − 4) − ĵ(0 − 2) + k̂(0 − 1) = −4î + 2ĵ − k̂ (1.5).','|AB × AC| = √21 (0.5).','Area = ½√21 square units (1).']}
];

const ONEMIN=['Vector: magnitude + direction; position vector r = xî + yĵ + zk̂.','Direction cosines l, m, n: l² + m² + n² = 1.','Types: zero, unit, coinitial, collinear, equal, negative.','Triangle and parallelogram laws; addition commutative and associative.','P₁P₂ = difference of position vectors; section (mb + na)/(m + n).','a·b = |a||b| cos θ = a₁b₁ + a₂b₂ + a₃b₃; ⊥ iff a·b = 0.','Projection of a on b = a·b/|b|.','a × b = |a||b| sin θ n̂; determinant form; anti-commutative.','î × ĵ = k̂, ĵ × k̂ = î, k̂ × î = ĵ.','Area: parallelogram |a × b|, triangle ½|a × b|.'];
const KEYS=[['magnitude and direction',/magnitude|direction/i],['direction cosines',/cosine|l²|l\^2/i],['unit vector',/unit/i],['triangle / parallelogram law',/triangle|parallelogram/i],['components î ĵ k̂',/î|ĵ|k̂|component/i],['section formula',/section|m\s*:\s*n|mb/i],['dot product',/dot|scalar product|a·b|cos θ/i],['perpendicular',/perpendic|⊥/i],['projection',/project/i],['cross product',/cross|vector product|×|sin θ/i],['area',/area/i]];

/* ---------- lab ---------- */
let va=[2,1,0],vb=[1,3,1],ang=-0.7,tilt=0.45,drag=null,raf=null;
function ctxDraw(){const cv=$('#vC');if(!cv)return;const ctx=cv.getContext('2d'),W=520,H=420,S=46,cx=W/2,cy=H/2+30;
 const P=v=>{const[x,y,z]=[v[0],v[2],v[1]];const ca=Math.cos(ang),sa=Math.sin(ang);let X=x*ca+z*sa,Z=-x*sa+z*ca;const ct=Math.cos(tilt),st=Math.sin(tilt);let Y=y*ct-Z*st;Z=y*st+Z*ct;const k=14/(14+Z);return[cx+X*S*k,cy-Y*S*k]};
 const dark=getComputedStyle(document.documentElement).colorScheme.includes('dark')&&matchMedia('(prefers-color-scheme: dark)').matches;ctx.clearRect(0,0,W,H);
 const line=(a,b,c,w,dash)=>{const p=P(a),q=P(b);ctx.strokeStyle=c;ctx.lineWidth=w;ctx.setLineDash(dash||[]);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.setLineDash([])};
 const arrow=(v,c,lab)=>{const p=P([0,0,0]),q=P(v);ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();const a=Math.atan2(q[1]-p[1],q[0]-p[0]);ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q[0]-13*Math.cos(a-.4),q[1]-13*Math.sin(a-.4));ctx.lineTo(q[0]-13*Math.cos(a+.4),q[1]-13*Math.sin(a+.4));ctx.fill();ctx.font='600 15px "Source Sans 3",sans-serif';ctx.fillText(lab,q[0]+8,q[1]-6)};
 const ax=getComputedStyle(cv).color||'#888';for(let g=-4;g<=4;g++){line([g,-4,0],[g,4,0],'rgba(136,135,128,.18)',1);line([-4,g,0],[4,g,0],'rgba(136,135,128,.18)',1)}
 [[[5,0,0],'x'],[[0,5,0],'y'],[[0,0,5],'z']].forEach(([v,l])=>{line([0,0,0],v,'#888780',1.5);const q=P(v);ctx.fillStyle='#888780';ctx.font='13px "Source Sans 3",sans-serif';ctx.fillText(l,q[0]+4,q[1])});
 const s=[va[0]+vb[0],va[1]+vb[1],va[2]+vb[2]],c=[va[1]*vb[2]-va[2]*vb[1],va[2]*vb[0]-va[0]*vb[2],va[0]*vb[1]-va[1]*vb[0]];
 if($('#vSum').checked){line(va,s,'#7a5a9e',1.5,[5,4]);line(vb,s,'#7a5a9e',1.5,[5,4]);const p0=P([0,0,0]),p1=P(va),p2=P(s),p3=P(vb);ctx.fillStyle='rgba(122,90,158,.12)';ctx.beginPath();ctx.moveTo(...p0);ctx.lineTo(...p1);ctx.lineTo(...p2);ctx.lineTo(...p3);ctx.fill();arrow(s,'#7a5a9e','a+b')}
 arrow(va,OR,'a');arrow(vb,'#2e6f8a','b');if($('#vCross').checked&&Math.hypot(...c)>0)arrow(c.map(x=>x*Math.min(1,4/Math.max(1,Math.hypot(...c)))),GN,'a×b')}
function vOut(){const s=[va[0]+vb[0],va[1]+vb[1],va[2]+vb[2]],c=[va[1]*vb[2]-va[2]*vb[1],va[2]*vb[0]-va[0]*vb[2],va[0]*vb[1]-va[1]*vb[0]],dot=va[0]*vb[0]+va[1]*vb[1]+va[2]*vb[2],ma=Math.hypot(...va),mb=Math.hypot(...vb),mc=Math.hypot(...c);
 const f=v=>`${v[0]}î ${v[1]<0?'−':'+'} ${Math.abs(v[1])}ĵ ${v[2]<0?'−':'+'} ${Math.abs(v[2])}k̂`,r=x=>Math.round(x*100)/100;let th=ma&&mb?Math.acos(Math.max(-1,Math.min(1,dot/(ma*mb))))*180/Math.PI:null;
 $('#vOut').innerHTML=`<p>a = ${f(va)}, |a| = ${r(ma)}<br>b = ${f(vb)}, |b| = ${r(mb)}</p><p><b>a + b</b> = ${f(s)}</p><p><b>a·b</b> = ${va[0]}×${vb[0]} + ${va[1]}×${vb[1]} + ${va[2]}×${vb[2]} = <b>${dot}</b>${dot===0&&ma&&mb?' → perpendicular':''}</p>${th!==null?`<p>Angle θ = cos⁻¹(${dot}/${r(ma*mb)}) = <b>${r(th)}°</b></p><p>Projection of a on b = a·b/|b| = <b>${r(dot/mb)}</b></p>`:''}<p><b>a × b</b> = ${f(c)}${mc===0&&ma&&mb?' → a ∥ b':''}</p><p>Area of parallelogram = |a × b| = <b>${r(mc)}</b>; triangle = ${r(mc/2)}</p>`}
function labDraw(){ctxDraw();vOut()}
function labInit(){const lab=(n,i,v)=>`<label>${n[0]}${'₁₂₃'[i]}<select data-v="${n[0]}${i}">${[-4,-3,-2,-1,0,1,2,3,4].map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join('')}</select></label>`;
 $('#vIn').innerHTML=['a','b'].map(n=>['x','y','z'].map((c,i)=>lab(`${n}${c}`,i,(n==='a'?va:vb)[i])).join('')).join('');
 const cv=$('#vC');cv.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY,ang,tilt];cv.setPointerCapture(e.pointerId)});cv.addEventListener('pointermove',e=>{if(!drag)return;ang=drag[2]+(e.clientX-drag[0])*.01;tilt=Math.max(-1.2,Math.min(1.4,drag[3]+(e.clientY-drag[1])*.01));ctxDraw()});cv.addEventListener('pointerup',()=>drag=null)}
function labShow(){labDraw()}
function labClick(b){return false}
function labChange(t){if(t.dataset&&t.dataset.v){const v=t.dataset.v,arr=v[0]==='a'?va:vb;arr[+v.slice(1)]=+t.value;labDraw();return true}if(t.id==='vSum'||t.id==='vCross'){labDraw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
