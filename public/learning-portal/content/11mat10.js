/* Rai Plus content pack: Class 11 Mathematics, Chapter 10 – Conic Sections */
RP.register({key:'11mat10',cls:'11',subject:'Mathematics',ch:'10',title:"Conic Sections",color:'#24577a',
crumb:"HBSE Class 11 Mathematics · Unit: Coordinate Geometry · Taught in November",h1:"Chapter 10: Conic Sections",sub:"Slice a double cone and you get a circle, ellipse, parabola or hyperbola. Each has a simple focus property and a standard equation.",heroLabel:"A double cone cut by planes, and an ellipse with its two foci",labName:'Conic lab',
theme:"\n:root{--g:light-dark(#24577a,#9cc9ea);--g2:light-dark(#eaf2f8,#0d1822);--line:light-dark(#cde0ee,#24394a);--bg:light-dark(#ffffff,#091017);--card:light-dark(#ffffff,#0e1720);\n--ink:light-dark(#0e1a24,#e2edf5);--mute:light-dark(#4b6070,#a4b9c8);--y:light-dark(#b3541e,#f2a774);--y2:light-dark(#fbeee4,#2a170a);--hd:#1b4160}\n",
labHTML:`  <h2>Conic lab</h2>
  <p>Choose a conic and its constants. The point P moves along the curve and the lab checks its focus property.</p>
  <div class="ctrl"><label>Conic<select id="cType"><option value="cir">Circle</option><option value="par">Parabola y² = 4ax</option><option value="ell" selected>Ellipse x²/a² + y²/b² = 1</option><option value="hyp">Hyperbola x²/a² − y²/b² = 1</option></select></label></div>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="cSvg" viewBox="0 0 440 400" role="img" aria-label="Conic on coordinate axes" style="color:var(--ink)"></svg></div></div>
  <div><div id="cCtl"></div><div class="box y" id="cOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#24577a',LABNAME='Conic lab',MIND_CENTER='Conic sections';
const BL='#24577a',OR='#b3541e',GR='#888780',GN='#3b6d11',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,'font-size="14" '+o);
const fx=(n,d=2)=>(+n.toFixed(d)).toString();
/* a small axis plot helper: k px per unit, origin (ox,oy) */
function axes(ox,oy,w,h){return `<line x1="${ox-w}" y1="${oy}" x2="${ox+w}" y2="${oy}" stroke="${GR}"/><line x1="${ox}" y1="${oy-h}" x2="${ox}" y2="${oy+h}" stroke="${GR}"/>`}
const pathXY=(pts)=>pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join('');
function heroDraw(){return `<ellipse cx="80" cy="70" rx="55" ry="32" fill="none" stroke="#fff" stroke-width="3"/><circle cx="50" cy="70" r="4" fill="#fff"/><circle cx="110" cy="70" r="4" fill="#fff"/><path d="M170 30 Q210 150 250 30" fill="none" stroke="#fff" stroke-width="3"/>`}
const HERO=heroDraw;
const MIND=[['Sections of a cone',100,50],['Circle',420,50],['Parabola',90,150],['Ellipse',430,150],['Hyperbola',110,250],['e, foci, latus rectum',410,250]];

const C=[
{id:'c1',num:'10.2',title:'Sections of a cone',
 intro:'Shine a torch at a wall: tilt it and the patch of light changes from a circle to an ellipse to a parabola-like curve. Why?',
 obj:'Describe how a plane cutting a double cone gives a circle, ellipse, parabola or hyperbola, and when degenerate conics arise.',
 prior:'Straight lines (Ch 9); distance formula.',
 simple:'Rotate a line (the generator) about a fixed vertical line (the axis) through a point V, keeping the angle α between them fixed: it sweeps a double-napped cone. Cut it with a plane making angle β with the axis. If β = 90°: circle. If α < β < 90°: ellipse. If β = α: parabola. If 0 ≤ β < α: hyperbola (the plane cuts both nappes).',
 detail:'When the plane passes through the vertex V, we get degenerate conics: a point (α < β ≤ 90°), a straight line (β = α, the plane touches along a generator) or a pair of intersecting lines (0 ≤ β < α). These curves were studied by Apollonius and are used in planetary motion (ellipses), telescopes and headlights (parabolas) and navigation systems (hyperbolas). Each non-degenerate conic other than the circle can also be defined by a focus, a directrix and an eccentricity e: for every point P on the curve, distance to focus = e × distance to directrix, with e < 1 ellipse, e = 1 parabola, e > 1 hyperbola (the circle has e = 0).',
 real:'Planets move in ellipses; satellite dishes and car headlights are parabolic; some radio navigation systems use hyperbolas.',
 apply:'A plane makes an angle β = 60° with the axis of a cone of semi-vertical angle α = 30°. Which conic is formed?',
 see:{w:520,h:260,f:[
  ['A double-napped cone: axis, vertex V, generator at angle α.',`<path d="M140 20 L260 130 L380 20 M140 240 L260 130 L380 240" fill="none" stroke="${ink}" stroke-width="2"/><line x1="260" y1="10" x2="260" y2="250" stroke="${GR}" stroke-dasharray="5 4"/><circle cx="260" cy="130" r="4" fill="${ink}"/>`+lbl(275,135,'V')+lbl(284,90,'α','fill="'+OR+'"')],
  ['β = 90°: circle; α < β < 90°: ellipse.',`<line x1="170" y1="50" x2="350" y2="50" stroke="${BL}" stroke-width="3"/><line x1="175" y1="40" x2="345" y2="80" stroke="${GN}" stroke-width="3"/>`+lbl(450,52,'circle','font-size="12" fill="'+BL+'"')+lbl(450,80,'ellipse','font-size="12" fill="'+GN+'"')],
  ['β = α: parabola; β < α: hyperbola (both nappes).',`<line x1="150" y1="133" x2="290" y2="5" stroke="${OR}" stroke-width="3"/><line x1="330" y1="10" x2="340" y2="250" stroke="#7f77dd" stroke-width="3"/>`+lbl(450,130,'parabola (∥ generator)','font-size="12" fill="'+OR+'"')+lbl(450,240,'hyperbola','font-size="12" fill="#7f77dd"')]]},
 seeNote:'β is the angle between the cutting plane and the axis.',
 do:{title:'Torch on a wall',mat:'A torch, a wall, a dark room',steps:['Point the torch straight at the wall: note the shape.','Tilt it gradually.','Tilt until one edge of the beam runs parallel to the wall.'],obs:'Circle → ellipse → open parabola-like curve.',why:'The light cone is cut by the wall plane at different angles.',lab:false},
 memo:'"90° circle, steeper than α ellipse, equal parabola, flatter hyperbola."',
 miscon:['"A hyperbola is two parabolas." It has its own equation and asymptotes.','"An ellipse is a squashed circle with one centre point as focus." It has two foci.'],
 terms:['Double-napped cone','Generator','Axis','Vertex','Degenerate conic','Eccentricity'],
 q:{q:'If the cutting plane is parallel to a generator (β = α), the section is a:',o:['circle','ellipse','parabola','hyperbola'],a:2,why:'Definition.'},
 exam:'Conditions on β and α are asked as 1-mark MCQs.'},

{id:'c2',num:'10.3',title:'The circle',
 intro:'How do you write the equation of every point 5 units from (2, −3)?',
 obj:'Write and use the standard and general forms of the equation of a circle.',
 prior:'Distance formula.',
 simple:'A circle is the set of all points in a plane at a fixed distance r (radius) from a fixed point (h, k) (centre). By the distance formula, (x − h)² + (y − k)² = r². If the centre is the origin: x² + y² = r².',
 detail:'Expanding gives the general form x² + y² + 2gx + 2fy + c = 0 with centre (−g, −f) and radius √(g² + f² − c), a real circle when g² + f² − c > 0. Examples: centre (−3, 2), r = 4: (x + 3)² + (y − 2)² = 16. x² + y² + 8x + 10y − 8 = 0: complete the squares, (x + 4)² + (y + 5)² = 49, centre (−4, −5), radius 7. A circle through three given points: substitute each point into (x − h)² + (y − k)² = r² and solve. A circle through (2, −2) and (3, 4) with centre on x + y = 2: set (h, k) with h + k = 2 and equal distances to both points.',
 real:'GPS position fixing uses circles (spheres) of known distance from satellites.',
 apply:'Find the centre and radius of x² + y² − 4x − 8y − 45 = 0.',
 see:{w:520,h:260,f:[
  ['Axes and a centre C(h, k).',axes(160,170,140,150)+`<circle cx="240" cy="110" r="4" fill="${OR}"/>`+lbl(255,104,'C(h, k)','font-size="12"')],
  ['All points at distance r from C.',`<circle cx="240" cy="110" r="80" fill="none" stroke="${BL}" stroke-width="2.5"/><line x1="240" y1="110" x2="305" y2="63" stroke="${OR}" stroke-width="2"/>`+lbl(280,78,'r')+`<circle cx="305" cy="63" r="4" fill="${ink}"/>`+lbl(330,58,'P(x, y)','font-size="12"')],
  ['(x − h)² + (y − k)² = r².',lbl(410,230,'(x − h)² + (y − k)² = r²','font-weight="700"')]]},
 seeNote:'Distance CP = r for every P.',
 do:{title:'Pin and string',mat:'Paper on a board, a pin, string, pencil',steps:['Pin the string at the centre.','Keep it taut with the pencil and go round.'],obs:'A circle.',why:'Constant distance from one point.',lab:false},
 memo:'"Centre (h, k): subtract inside, radius squared outside."',
 miscon:['"In (x + 3)² + (y − 2)² = 16 the centre is (3, −2)." It is (−3, 2).','"r = 16." r² = 16, so r = 4.'],
 terms:['Centre','Radius','Standard form','General form','Completing the square'],
 q:{q:'Centre and radius of (x − 1)² + (y + 2)² = 9:',o:['(1, −2), 9','(−1, 2), 3','(1, −2), 3','(1, 2), 3'],a:2,why:'Signs flip inside; r = √9.'},
 exam:'Finding centre/radius and equations through given conditions: 2–4 marks.'},

{id:'c3',num:'10.4',title:'The parabola',
 intro:'Why do car headlights and dish antennas have a parabolic shape?',
 obj:'Define a parabola by focus and directrix; use the four standard forms, focus, directrix and latus rectum.',
 prior:'Distance formula.',
 simple:'A parabola is the set of all points in a plane equidistant from a fixed line (directrix) and a fixed point not on it (focus). With focus (a, 0) and directrix x = −a: y² = 4ax. The vertex is at the origin, the axis is the x-axis, and the latus rectum (chord through the focus perpendicular to the axis) has length 4a.',
 detail:'Four standard forms (a > 0): y² = 4ax (opens right, focus (a, 0), directrix x = −a); y² = −4ax (opens left, focus (−a, 0), directrix x = a); x² = 4ay (opens up, focus (0, a), directrix y = −a); x² = −4ay (opens down, focus (0, −a), directrix y = a). Reading the form: the parabola is symmetric about the axis of the squared variable\'s partner (y² → x-axis); its opening follows the sign of the non-squared variable\'s coefficient. Latus rectum = 4a, ends (a, ±2a) for y² = 4ax. Example: y² = 8x: 4a = 8, a = 2, focus (2, 0), directrix x = −2, latus rectum 8. Example: focus (0, −3), directrix y = 3 → x² = −12y.',
 real:'Light from a bulb at the focus of a parabolic reflector comes out as a parallel beam; incoming parallel signals meet at a dish antenna\'s focus.',
 apply:'Find the focus, axis, directrix and latus rectum of x² = −16y.',
 see:{w:520,h:260,f:[
  ['Directrix x = −a and focus F(a, 0).',axes(200,130,170,120)+`<line x1="160" y1="10" x2="160" y2="250" stroke="${OR}" stroke-dasharray="6 4" stroke-width="2"/><circle cx="240" cy="130" r="5" fill="${OR}"/>`+lbl(240,152,'F(a, 0)','font-size="12"')+lbl(140,24,'x = −a','font-size="12"')],
  ['Points equidistant from both form y² = 4ax.',(()=>{const pts=[];for(let y=-115;y<=115;y+=3){const x=(y*y)/(4*40);pts.push([200+x,130-y])}return `<path d="${pathXY(pts)}" fill="none" stroke="${BL}" stroke-width="2.5"/>`})()],
  ['For P: PF = PM (distance to directrix). Latus rectum = 4a.',(()=>{const y=70,x=(y*y)/160;const Px=200+x,Py=130-y;return `<circle cx="${Px}" cy="${Py}" r="4" fill="${ink}"/><line x1="${Px}" y1="${Py}" x2="240" y2="130" stroke="${GN}" stroke-width="2"/><line x1="${Px}" y1="${Py}" x2="160" y2="${Py}" stroke="${GN}" stroke-width="2"/>`+lbl(Px+16,Py-4,'P','font-size="12"')+`<line x1="240" y1="50" x2="240" y2="210" stroke="#7f77dd" stroke-width="2"/>`+lbl(300,40,'latus rectum 4a','font-size="12" fill="#7f77dd"')})()]]},
 seeNote:'a = 1 unit is 40 px here.',
 do:{title:'Fold a parabola',mat:'Wax paper or tracing paper, a pen',steps:['Draw a straight line near one edge (directrix) and a dot above it (focus).','Fold so a point on the line lands on the dot; crease. Repeat 30 times along the line.'],obs:'The creases outline a parabola.',why:'Each crease is equidistant from focus and directrix.',lab:true},
 memo:'"y² → opens sideways; x² → opens up/down; sign says which way."',
 miscon:['"Latus rectum is 2a." It is 4a.','"In y² = −8x the focus is (2, 0)." It is (−2, 0).'],
 terms:['Focus','Directrix','Vertex','Axis','Latus rectum'],
 q:{q:'Focus of y² = 12x:',o:['(12, 0)','(3, 0)','(0, 3)','(−3, 0)'],a:1,why:'4a = 12, a = 3.'},
 exam:'Focus/directrix/latus rectum from an equation, or the equation from them: 2–4 marks.'},

{id:'c4',num:'10.5',title:'The ellipse',
 intro:'Tie a loop of string round two pins and run a pencil inside it. What curve appears?',
 obj:'Define an ellipse by its foci; use x²/a² + y²/b² = 1, c² = a² − b², eccentricity and latus rectum.',
 prior:'Distance formula.',
 simple:'An ellipse is the set of all points in a plane the sum of whose distances from two fixed points (foci) is constant (= 2a). With foci (±c, 0): x²/a² + y²/b² = 1, where a > b and c² = a² − b². Major axis length 2a, minor axis 2b. Eccentricity e = c/a, with 0 < e < 1.',
 detail:'Vertices (±a, 0); ends of minor axis (0, ±b). If the major axis is along the y-axis: x²/b² + y²/a² = 1, foci (0, ±c). Latus rectum length = 2b²/a. As e → 0 the ellipse becomes a circle (c = 0, a = b); as e → 1 it flattens. Example: x²/36 + y²/16 = 1: a = 6, b = 4, c = √20 = 2√5, foci (±2√5, 0), e = √5/3, latus rectum 2 × 16/6 = 16/3. Example: vertices (±13, 0), foci (±5, 0): b² = 169 − 25 = 144, so x²/169 + y²/144 = 1. Rule to read the form: the larger denominator is a²; the major axis lies along that variable\'s axis.',
 real:'The Earth\'s orbit is an ellipse with the Sun at one focus; whispering galleries use the reflective property of ellipses.',
 apply:'Find the foci, vertices, eccentricity and latus rectum of x²/25 + y²/100 = 1.',
 see:{w:520,h:260,f:[
  ['Two foci F₁, F₂ at (±c, 0).',axes(260,130,230,115)+`<circle cx="180" cy="130" r="5" fill="${OR}"/><circle cx="340" cy="130" r="5" fill="${OR}"/>`+lbl(180,152,'F₁','font-size="12"')+lbl(340,152,'F₂','font-size="12"')],
  ['Ellipse: PF₁ + PF₂ = 2a.',`<ellipse cx="260" cy="130" rx="140" ry="98" fill="none" stroke="${BL}" stroke-width="2.5"/>`+(()=>{const t=1.1,Px=260+140*Math.cos(t),Py=130-98*Math.sin(t);return `<circle cx="${Px}" cy="${Py}" r="4" fill="${ink}"/><line x1="${Px}" y1="${Py}" x2="180" y2="130" stroke="${GN}" stroke-width="2"/><line x1="${Px}" y1="${Py}" x2="340" y2="130" stroke="${GN}" stroke-width="2"/>`+lbl(Px,Py-10,'P','font-size="12"')})()],
  ['a² = b² + c²; e = c/a < 1.',lbl(260,250,'x²/a² + y²/b² = 1,  c² = a² − b²','font-weight="700"')+lbl(410,128,'a','font-size="12"')+lbl(268,40,'b','font-size="12"')]]},
 seeNote:'Here a = 140 px, b = 98 px, c = 80 px (check: 98² + 80² ≈ 140²).',
 do:{title:'Gardener\'s ellipse',mat:'Two pins, a loop of string, a pencil, card',steps:['Fix two pins a few cm apart.','Put a loop of string round them and stretch it with the pencil.','Move the pencil round keeping the string taut.'],obs:'An ellipse.',why:'Sum of distances to the pins is constant.',lab:true},
 memo:'"Ellipse: sum = 2a, c² = a² − b², e < 1."',
 miscon:['"c² = a² + b² for an ellipse." That is the hyperbola.','"a is always under x²." a² is the larger denominator.'],
 terms:['Foci','Major axis (2a)','Minor axis (2b)','c² = a² − b²','Eccentricity e = c/a','Latus rectum 2b²/a'],
 q:{q:'For x²/25 + y²/9 = 1, the foci are:',o:['(±4, 0)','(±3, 0)','(0, ±4)','(±5, 0)'],a:0,why:'c² = 25 − 9 = 16.'},
 exam:'Finding all elements from an equation, or the equation from given foci/vertices, is a 4–5 mark staple.'},

{id:'c5',num:'10.6',title:'The hyperbola',
 intro:'What curve has two separate branches that get closer and closer to two straight lines?',
 obj:'Define a hyperbola by its foci; use x²/a² − y²/b² = 1, c² = a² + b², eccentricity and latus rectum.',
 prior:'Ellipse (10.5).',
 simple:'A hyperbola is the set of all points in a plane the difference of whose distances from two fixed points (foci) is constant (= 2a). With foci (±c, 0): x²/a² − y²/b² = 1, where c² = a² + b². Transverse axis 2a, conjugate axis 2b, eccentricity e = c/a > 1.',
 detail:'Vertices (±a, 0). If the transverse axis is along the y-axis: y²/a² − x²/b² = 1, foci (0, ±c). Latus rectum length = 2b²/a. Unlike the ellipse, a need not be larger than b: the positive term tells which axis is transverse. A hyperbola with a = b is called rectangular (equilateral), e = √2. Example: x²/9 − y²/16 = 1: a = 3, b = 4, c = 5, foci (±5, 0), e = 5/3, latus rectum 32/3. Example: foci (0, ±12), latus rectum 36: 2b²/a = 36 and a² + b² = 144 → a = 6, b² = 108: y²/36 − x²/108 = 1.',
 real:'Cooling towers of power stations have hyperbolic profiles; a sonic boom on the ground spreads along a hyperbola.',
 apply:'Find the foci, vertices, eccentricity and latus rectum of y²/9 − x²/27 = 1.',
 see:{w:520,h:260,f:[
  ['Foci F₁, F₂ at (±c, 0).',axes(260,130,230,115)+`<circle cx="160" cy="130" r="5" fill="${OR}"/><circle cx="360" cy="130" r="5" fill="${OR}"/>`+lbl(160,152,'F₁','font-size="12"')+lbl(360,152,'F₂','font-size="12"')],
  ['Two branches: |PF₁ − PF₂| = 2a.',(()=>{const a=60,b=80;let r=[],l=[];for(let t=-1.4;t<=1.4;t+=0.05){const x=a*Math.cosh(t),y=b*Math.sinh(t);r.push([260+x,130-y]);l.push([260-x,130-y])}return `<path d="${pathXY(r)}" fill="none" stroke="${BL}" stroke-width="2.5"/><path d="${pathXY(l)}" fill="none" stroke="${BL}" stroke-width="2.5"/>`})()],
  ['c² = a² + b²; e = c/a > 1.',lbl(260,250,'x²/a² − y²/b² = 1,  c² = a² + b²','font-weight="700"')]]},
 seeNote:'Here a = 60 px, b = 80 px, so c = 100 px.',
 do:{title:'Compare ellipse and hyperbola',mat:'A table',steps:['Write the definition, equation, relation of a, b, c, e and latus rectum for both.','Highlight the differences.'],obs:'Sum vs difference; minus vs plus.',why:'They are "opposite" conics.',lab:false},
 memo:'"Hyperbola: difference = 2a, c² = a² + b², e > 1."',
 miscon:['"a > b always." In a hyperbola either can be larger.','"The hyperbola is closed." It has two open branches.'],
 terms:['Transverse axis','Conjugate axis','c² = a² + b²','Eccentricity e > 1','Rectangular hyperbola'],
 q:{q:'For x²/16 − y²/9 = 1, e =',o:['5/4','3/4','4/5','5/3'],a:0,why:'c = 5, a = 4.'},
 exam:'Elements of a hyperbola or its equation from conditions: 4–5 marks.'}
];

const CARDS=[['Circle','(x − h)² + (y − k)² = r²; general: centre (−g, −f), r = √(g² + f² − c).'],['Parabola y² = 4ax','Focus (a, 0), directrix x = −a, latus rectum 4a.'],['Parabola x² = 4ay','Focus (0, a), directrix y = −a.'],['Ellipse','x²/a² + y²/b² = 1, a > b; c² = a² − b²; foci (±c, 0).'],['Ellipse e','e = c/a, 0 < e < 1; latus rectum 2b²/a.'],['Hyperbola','x²/a² − y²/b² = 1; c² = a² + b²; foci (±c, 0).'],['Hyperbola e','e = c/a > 1; latus rectum 2b²/a.'],['Focus property','Ellipse: PF₁ + PF₂ = 2a; hyperbola: |PF₁ − PF₂| = 2a; parabola: PF = PM.'],['Cone sections','β = 90° circle; α < β < 90° ellipse; β = α parabola; β < α hyperbola.'],['Reading forms','Ellipse: larger denominator = a²; hyperbola: positive term gives transverse axis.']];

const Q=[
 {lv:1,q:'The eccentricity of a parabola is:',o:['0','between 0 and 1','1','greater than 1'],a:2,w:'e = 1.'},
 {lv:1,q:'Centre of (x + 2)² + (y − 5)² = 49:',o:['(2, −5)','(−2, 5)','(−2, −5)','(2, 5)'],a:1,w:'Change signs.'},
 {lv:1,q:'Latus rectum of y² = 4ax is:',o:['a','2a','4a','a/4'],a:2,w:'4a.'},
 {lv:1,q:'For an ellipse, c² =',o:['a² + b²','a² − b²','b² − a²','2ab'],a:1,w:'a > c.'},
 {lv:2,q:'Focus of x² = −16y:',o:['(0, −4)','(0, 4)','(−4, 0)','(4, 0)'],a:0,w:'4a = 16, opens down.'},
 {lv:2,q:'Radius of x² + y² − 4x − 8y − 45 = 0:',o:['5','√65','8','√45'],a:1,w:'(x−2)² + (y−4)² = 65.'},
 {lv:2,q:'Foci of x²/36 + y²/16 = 1:',o:['(±2√5, 0)','(±√52, 0)','(0, ±2√5)','(±4, 0)'],a:0,w:'c² = 20.'},
 {lv:3,q:'Eccentricity of x²/9 − y²/16 = 1:',o:['5/3','4/3','3/5','5/4'],a:0,w:'c = 5, a = 3.'},
 {lv:3,q:'Equation of the ellipse with vertices (±13, 0) and foci (±5, 0):',o:['x²/169 + y²/144 = 1','x²/144 + y²/169 = 1','x²/169 + y²/25 = 1','x²/169 − y²/144 = 1'],a:0,w:'b² = 169 − 25.'},
 {lv:3,q:'Parabola with focus (6, 0) and directrix x = −6:',o:['y² = 6x','y² = 24x','x² = 24y','y² = 12x'],a:1,w:'a = 6, 4a = 24.'},
 {lv:4,q:'Assertion (A): x²/4 + y²/9 = 1 has its major axis along the y-axis. Reason (R): The larger denominator is under y².',o:['Both true and R explains A','Both true, R does not explain A','A true, R false','A false, R true'],a:0,w:'a² = 9 under y².'},
 {lv:4,q:'Latus rectum of the ellipse x²/25 + y²/100 = 1:',o:['5/2','8','5','20'],a:2,w:'a = 10, b = 5: 2b²/a = 50/10 = 5.'},
 {lv:4,q:'A plane cuts a cone (semi-vertical angle 30°) at β = 20° to the axis. The section is:',o:['ellipse','parabola','hyperbola','circle'],a:2,w:'β < α.'},
 {lv:5,open:true,m:4,q:'Find the coordinates of the foci, the vertices, the lengths of the major and minor axes, the eccentricity and the latus rectum of x²/36 + y²/16 = 1.',ans:['a = 6, b = 4, c = √(36 − 16) = 2√5 (1).','Foci (±2√5, 0); vertices (±6, 0) (1).','Major axis 12, minor axis 8 (1).','e = √5/3; latus rectum 2b²/a = 16/3 (1).']},
 {lv:5,open:true,m:4,q:'Find the equation of the hyperbola with foci (0, ±12) and latus rectum of length 36.',ans:['Transverse axis along y: y²/a² − x²/b² = 1, c = 12 (1).','2b²/a = 36 → b² = 18a (1).','a² + 18a = 144 → a = 6 (taking a > 0), b² = 108 (1).','Equation: y²/36 − x²/108 = 1 (1).']},
 {lv:5,open:true,m:3,q:'Find the equation of the circle passing through (2, −2) and (3, 4) with its centre on x + y = 2.',ans:['Let centre (h, k), h + k = 2 (1).','(h − 2)² + (k + 2)² = (h − 3)² + (k − 4)² → 2h + 12k = 17; with h + k = 2: h = 0.7, k = 1.3 (1).','r² = (0.7 − 2)² + (1.3 + 2)² = 12.58; (x − 0.7)² + (y − 1.3)² = 12.58 (1).']}
];

const ONEMIN=['Cone cut at β: 90° circle; α<β<90° ellipse; β=α parabola; β<α hyperbola.','Circle: (x − h)² + (y − k)² = r².','Parabola: PF = PM; y² = 4ax, focus (a, 0), directrix x = −a, LR 4a.','Ellipse: PF₁ + PF₂ = 2a; c² = a² − b²; e = c/a < 1; LR 2b²/a.','Hyperbola: |PF₁ − PF₂| = 2a; c² = a² + b²; e > 1; LR 2b²/a.','Larger denominator → major axis (ellipse).','Positive term → transverse axis (hyperbola).','e: circle 0, ellipse < 1, parabola 1, hyperbola > 1.'];
const KEYS=[['sections of a cone',/cone|β|nappe/i],['circle equation',/\(x\s*[−-]\s*h\)|centre|radius/i],['parabola y² = 4ax',/4ax|parabola/i],['focus / directrix',/focus|directrix/i],['latus rectum',/latus/i],['ellipse c² = a² − b²',/ellipse|a²\s*[−-]\s*b²/i],['hyperbola c² = a² + b²',/hyperbola|a²\s*\+\s*b²/i],['eccentricity',/eccentric|e\s*=/i]];

/* ---------- lab ---------- */
let type='ell',pa={a:5,b:3,r:4,h:1,k:-1,ap:1.5},th=0.8,raf=null,run=true;
const K=28,OX=220,OY=200;const X=x=>OX+x*K,Y=y=>OY-y*K;
function grid(){let s='';for(let i=-7;i<=7;i++){s+=`<line x1="${X(i)}" y1="10" x2="${X(i)}" y2="390" stroke="${GR}" stroke-width="${i?0.3:1.2}"/><line x1="10" y1="${Y(i)}" x2="430" y2="${Y(i)}" stroke="${GR}" stroke-width="${i?0.3:1.2}"/>`}return s}
const dist=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
function draw(){let s=grid(),out='';const P=[];
 if(type==='cir'){const {r,h,k}=pa;for(let t=0;t<=6.3;t+=0.05)P.push([X(h+r*Math.cos(t)),Y(k+r*Math.sin(t))]);s+=`<path d="${pathXY(P)}" fill="none" stroke="${BL}" stroke-width="2.5"/><circle cx="${X(h)}" cy="${Y(k)}" r="4" fill="${OR}"/>`;const pt=[h+r*Math.cos(th),k+r*Math.sin(th)];s+=`<line x1="${X(h)}" y1="${Y(k)}" x2="${X(pt[0])}" y2="${Y(pt[1])}" stroke="${GN}" stroke-width="2"/><circle cx="${X(pt[0])}" cy="${Y(pt[1])}" r="5" fill="${ink}"/>`;
  out=`<p>Equation: <b>(x ${h<0?'+ '+(-h):'− '+h})² + (y ${k<0?'+ '+(-k):'− '+k})² = ${r*r}</b></p><p>Centre (${h}, ${k}), radius ${r}</p><p>CP = <b>${fx(dist(pt,[h,k]))}</b> for every P.</p>`}
 if(type==='par'){const a=pa.ap;for(let y=-7;y<=7;y+=0.1){const x=y*y/(4*a);if(x<=8)P.push([X(x),Y(y)])}s+=`<path d="${pathXY(P)}" fill="none" stroke="${BL}" stroke-width="2.5"/><line x1="${X(-a)}" y1="10" x2="${X(-a)}" y2="390" stroke="${OR}" stroke-width="2" stroke-dasharray="6 4"/><circle cx="${X(a)}" cy="${Y(0)}" r="5" fill="${OR}"/><line x1="${X(a)}" y1="${Y(2*a)}" x2="${X(a)}" y2="${Y(-2*a)}" stroke="#7f77dd" stroke-width="2"/>`;
  const yy=5*Math.sin(th),xx=yy*yy/(4*a),F=[a,0];s+=`<line x1="${X(xx)}" y1="${Y(yy)}" x2="${X(a)}" y2="${Y(0)}" stroke="${GN}" stroke-width="2"/><line x1="${X(xx)}" y1="${Y(yy)}" x2="${X(-a)}" y2="${Y(yy)}" stroke="${GN}" stroke-width="2"/><circle cx="${X(xx)}" cy="${Y(yy)}" r="5" fill="${ink}"/>`+T(X(-a)-4,24,'x = −'+a,'font-size="12" text-anchor="end"');
  out=`<p>Equation: <b>y² = ${fx(4*a)}x</b></p><p>Focus (${a}, 0), directrix x = −${a}, latus rectum ${fx(4*a)}</p><p>P(${fx(xx)}, ${fx(yy)}): PF = <b>${fx(dist([xx,yy],F))}</b>, PM = <b>${fx(xx+a)}</b> (equal, e = 1)</p>`}
 if(type==='ell'){let {a,b}=pa;const maj=a>=b;const A=Math.max(a,b),B=Math.min(a,b),c=Math.sqrt(A*A-B*B);for(let t=0;t<=6.3;t+=0.04)P.push([X(a*Math.cos(t)),Y(b*Math.sin(t))]);const F1=maj?[-c,0]:[0,-c],F2=maj?[c,0]:[0,c];s+=`<path d="${pathXY(P)}" fill="none" stroke="${BL}" stroke-width="2.5"/>`+[F1,F2].map(f=>`<circle cx="${X(f[0])}" cy="${Y(f[1])}" r="5" fill="${OR}"/>`).join('');
  const pt=[a*Math.cos(th),b*Math.sin(th)];const d1=dist(pt,F1),d2=dist(pt,F2);s+=`<line x1="${X(pt[0])}" y1="${Y(pt[1])}" x2="${X(F1[0])}" y2="${Y(F1[1])}" stroke="${GN}" stroke-width="2"/><line x1="${X(pt[0])}" y1="${Y(pt[1])}" x2="${X(F2[0])}" y2="${Y(F2[1])}" stroke="${GN}" stroke-width="2"/><circle cx="${X(pt[0])}" cy="${Y(pt[1])}" r="5" fill="${ink}"/>`;
  out=a===b?`<p>a = b: this is a <b>circle</b> (c = 0, e = 0).</p>`:`<p>Equation: <b>x²/${a*a} + y²/${b*b} = 1</b> (major axis along ${maj?'x':'y'})</p><p>c = √(${A*A} − ${B*B}) = <b>${fx(c)}</b>; foci ${maj?'(±'+fx(c)+', 0)':'(0, ±'+fx(c)+')'}</p><p>e = c/a = <b>${fx(c/A,3)}</b>; latus rectum 2b²/a = <b>${fx(2*B*B/A)}</b></p><p>PF₁ + PF₂ = ${fx(d1)} + ${fx(d2)} = <b>${fx(d1+d2)}</b> = 2 × ${A}</p>`}
 if(type==='hyp'){const {a,b}=pa,c=Math.sqrt(a*a+b*b);let r=[],l=[];for(let t=-2.2;t<=2.2;t+=0.04){const x=a*Math.cosh(t),y=b*Math.sinh(t);if(Math.abs(y)<8&&x<8){r.push([X(x),Y(y)]);l.push([X(-x),Y(y)])}}
  s+=`<path d="${pathXY(r)}" fill="none" stroke="${BL}" stroke-width="2.5"/><path d="${pathXY(l)}" fill="none" stroke="${BL}" stroke-width="2.5"/><line x1="${X(-8)}" y1="${Y(-8*b/a)}" x2="${X(8)}" y2="${Y(8*b/a)}" stroke="${GR}" stroke-dasharray="4 4"/><line x1="${X(-8)}" y1="${Y(8*b/a)}" x2="${X(8)}" y2="${Y(-8*b/a)}" stroke="${GR}" stroke-dasharray="4 4"/>`+[[-c,0],[c,0]].map(f=>`<circle cx="${X(f[0])}" cy="${Y(f[1])}" r="5" fill="${OR}"/>`).join('');
  const t=1.2*Math.sin(th),pt=[a*Math.cosh(t),b*Math.sinh(t)],d1=dist(pt,[-c,0]),d2=dist(pt,[c,0]);s+=`<line x1="${X(pt[0])}" y1="${Y(pt[1])}" x2="${X(-c)}" y2="${Y(0)}" stroke="${GN}" stroke-width="2"/><line x1="${X(pt[0])}" y1="${Y(pt[1])}" x2="${X(c)}" y2="${Y(0)}" stroke="${GN}" stroke-width="2"/><circle cx="${X(pt[0])}" cy="${Y(pt[1])}" r="5" fill="${ink}"/>`;
  out=`<p>Equation: <b>x²/${a*a} − y²/${b*b} = 1</b></p><p>c = √(${a*a} + ${b*b}) = <b>${fx(c)}</b>; foci (±${fx(c)}, 0)</p><p>e = <b>${fx(c/a,3)}</b>; latus rectum 2b²/a = <b>${fx(2*b*b/a)}</b>${a===b?' · rectangular hyperbola, e = √2':''}</p><p>|PF₁ − PF₂| = |${fx(d1)} − ${fx(d2)}| = <b>${fx(Math.abs(d1-d2))}</b> = 2 × ${a}</p><p class="note">Dashed lines are the asymptotes y = ±(b/a)x.</p>`}
 $('#cSvg').innerHTML=s;$('#cOut').innerHTML=out}
const SL={cir:[['h','Centre h',-3,3,1],['k','Centre k',-3,3,1],['r','Radius r',1,5,1]],par:[['ap','a',0.5,3,0.5]],ell:[['a','a',1,7,1],['b','b',1,6,1]],hyp:[['a','a',1,5,1],['b','b',1,5,1]]};
function ctl(){return SL[type].map(([k,n,mi,ma,st])=>`<div class="ctrl"><label>${n}: <b id="cv-${k}">${pa[k]}</b><input type="range" class="cSl" data-k="${k}" min="${mi}" max="${ma}" step="${st}" value="${pa[k]}"></label></div>`).join('')+`<div class="ctrl"><button class="btn" id="cRun">${run?'Pause P':'Move P'}</button></div>`}
function loop(){const sv=$('#cSvg');if(!sv||!sv.isConnected||!sv.getClientRects().length){raf=null;return}if(run){th+=0.012;draw()}raf=requestAnimationFrame(loop)}
function labShow(){$('#cCtl').innerHTML=ctl();draw();if(!raf)loop()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('cSl'))labChange(t)})}
function labClick(b){if(b.id==='cRun'){run=!run;b.textContent=run?'Pause P':'Move P';return true}return false}
function labChange(t){if(t.id==='cType'){type=t.value;labShow();return true}if(t.classList&&t.classList.contains('cSl')){pa[t.dataset.k]=+t.value;$('#cv-'+t.dataset.k).textContent=t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
