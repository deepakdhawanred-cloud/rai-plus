/* Rai Plus content pack: Class 7 Mathematics (Ganita Prakash Part 2), Chapter 6 – Constructions and Tilings. */
RP.register({key:'7matb6',cls:'7',subject:'Mathematics',ch:'II-6',title:"Constructions and Tilings",color:'#0f6e7a',
crumb:"Class 7 Mathematics · Ganita Prakash Part 2",h1:"Part 2 · Chapter 6: Constructions and Tilings",sub:"Ruler-and-compass constructions — perpendicular bisector, perpendicular from a point, angle bisector, petal designs — Śulba-Sūtra rope methods, and tiling the plane.",heroLabel:"Compass arcs and a hexagon tiling",labName:'Tiling explorer',
theme:"\n:root{--g:light-dark(#0f6e7a,#86d0da);--g2:light-dark(#e6f4f6,#071618);--line:light-dark(#c6e3e7,#1d3d42);--bg:light-dark(#ffffff,#061012);--card:light-dark(#ffffff,#0b1719);\n--ink:light-dark(#0a2226,#dff0f2);--mute:light-dark(#46636a,#a6c4c9);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#0b555e}\n",
labHTML:`  <h2>Tiling explorer</h2>
  <p>Pick a regular polygon. Copies are placed around one corner point. If their angles add up to exactly 360°, they fit with no gaps or overlaps — and the shape can tile the whole plane. Try every shape, then try the mixed tilings.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="tSvg" viewBox="0 0 460 320" role="img" aria-label="Polygons around a point" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Shape<select id="tN"><option value="3">Equilateral triangle</option><option value="4" selected>Square</option><option value="5">Regular pentagon</option><option value="6">Regular hexagon</option><option value="7">Regular heptagon</option><option value="8">Regular octagon</option></select></label></div>
  <div class="ctrl"><button class="btn" id="tAdd">Add one at the corner</button> <button class="btn" id="tFill">Show tiling</button> <button class="btn" id="tClr">Clear</button></div>
  <div class="ctrl"><label>Mixed<select id="tMix"><option value="">— choose —</option><option value="8,8,4">Octagon + octagon + square</option><option value="6,3,6,3">Hexagon + triangle (alternating)</option><option value="12,12,3">Dodecagon ×2 + triangle</option><option value="5,5,5">Three pentagons</option></select></label></div>
  <div class="box y" id="tOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#0f6e7a',LABNAME='Tiling explorer',MIND_CENTER='Constructions & tilings';
const TL='#0f6e7a',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const arc=(cx,cy,r,a1,a2,c=GR)=>{const p=a=>[cx+r*Math.cos(a*Math.PI/180),cy-r*Math.sin(a*Math.PI/180)];const [x1,y1]=p(a1),[x2,y2]=p(a2);return `<path d="M${x1} ${y1} A${r} ${r} 0 0 0 ${x2} ${y2}" fill="none" stroke="${c}" stroke-width="1.5"/>`};
const dot=(x,y,t,c=ink,dx=0,dy=-10)=>`<circle cx="${x}" cy="${y}" r="3.5" fill="${c}"/>`+(t?T(x+dx,y+dy,t,'font-size="13" font-weight="700"'):'');
const IA=n=>180-360/n;
const COL={3:'#3b6d11',4:'#1f5f8b',5:'#b04a1f',6:'#6a4fb3',7:'#a0522d',8:'#0f6e7a',12:'#8b3a62'};
function poly(n,x,y,side,rot){const pts=[];let a=rot;let px=x,py=y;for(let k=0;k<n;k++){pts.push([px,py]);px+=side*Math.cos(a*Math.PI/180);py-=side*Math.sin(a*Math.PI/180);a+=360/n}return pts}
const P=(pts,c,o=.35)=>`<polygon points="${pts.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')}" fill="${c}" fill-opacity="${o}" stroke="${c}" stroke-width="1.5"/>`;
function heroDraw(){let s='';for(let i=0;i<4;i++)for(let j=0;j<3;j++){const cx=150+i*45+(j%2)*22,cy=40+j*39;s+=`<polygon points="${[0,1,2,3,4,5].map(k=>[cx+26*Math.cos((k*60+30)*Math.PI/180),cy+26*Math.sin((k*60+30)*Math.PI/180)].join(',')).join(' ')}" fill="none" stroke="#fff" stroke-width="2"/>`}return s}
const HERO=heroDraw;
const MIND=[['Perpendicular bisector',100,50],['Perpendicular from a point',420,50],['Angle bisector',90,150],['Śulba-Sūtras',430,150],['Tilings',110,250],['Angles at a vertex',410,250]];

const AX=120,AY=170,BX=400,BY=170,R=180;
const C=[
{id:'k1',num:'6.1',title:'The perpendicular bisector',
 intro:'With only a compass and an unmarked ruler, how can you find the exact middle of a line segment?',
 obj:'Construct the perpendicular bisector of a segment and explain why it works.',
 prior:'Class 6 Ch 8: compass, circles; Part 1 Ch 7 triangles.',
 simple:'To bisect AB: open the compass to more than half of AB. With centre A, draw arcs above and below AB. With the same radius and centre B, draw arcs cutting the first ones at X and Y. Join XY. XY cuts AB at its midpoint M and is perpendicular to AB. XY is the perpendicular bisector.',
 detail:'Why it works: X is the same distance from A and from B (both are the compass radius), and so is Y. Every point on the perpendicular bisector is equidistant from A and B — and every point equidistant from A and B lies on it. That property is used to find the centre of a circle through three points.',
 real:'Builders find the centre line of a wall or a plot using the same idea with strings.',
 apply:'Draw AB = 7 cm and construct its perpendicular bisector. Measure AM and MB.',
 see:{w:520,h:320,f:[
  ['Segment AB.',`<line x1="${AX}" y1="${AY}" x2="${BX}" y2="${BY}" stroke="${ink}" stroke-width="2.5"/>`+dot(AX,AY,'A',ink,-12,5)+dot(BX,BY,'B',ink,12,5)],
  ['Arcs from A (radius more than half AB).',arc(AX,AY,R,25,60,TL)+arc(AX,AY,R,-60,-25,TL)],
  ['Same radius from B; arcs meet at X and Y.',arc(BX,BY,R,120,155,OR)+arc(BX,BY,R,205,240,OR)],
  ['Join XY: perpendicular bisector through M.',(()=>{const h=Math.sqrt(R*R-140*140);return `<line x1="260" y1="${AY-h-15}" x2="260" y2="${AY+h+15}" stroke="${PU}" stroke-width="2.5"/>`+dot(260,AY-h,'X',PU,12,0)+dot(260,AY+h,'Y',PU,12,8)+dot(260,AY,'M',PU,14,-6)+`<rect x="260" y="${AY-12}" width="12" height="12" fill="none" stroke="${PU}"/>`})()]]},
 seeNote:'Equal radius from both ends is the key.',
 do:{title:'Fold check',mat:'Paper, compass, ruler',steps:['Construct the bisector of a segment.','Fold the paper so A falls on B.'],obs:'The fold lies on XY.',why:'Symmetry: every point on XY is equidistant from A and B.',lab:false},
 memo:'"Same radius, both ends, join the crossings."',
 miscon:['"Any radius works." It must be more than half of AB, or the arcs won\'t meet.'],
 terms:['Perpendicular bisector','Midpoint','Equidistant','Compass'],
 q:{q:'Any point on the perpendicular bisector of AB is:',o:['closer to A','closer to B','equally far from A and B','on AB'],a:2,why:'Equidistant.'},
 exam:'Construct and justify perpendicular bisector: 3 marks.'},

{id:'k2',num:'6.2',title:'Perpendicular from a point to a line',
 intro:'A point P lies above a road line. What is the shortest path from P to the road?',
 obj:'Construct a perpendicular from a point to a line (point outside and point on the line).',
 prior:'6.1.',
 simple:'Point P outside line l: with centre P, draw an arc cutting l at A and B. Now construct the perpendicular bisector of AB (6.1) — it passes through P. That line is perpendicular to l. Point P on l: mark A and B on l equally on both sides of P using the compass, then bisect AB.',
 detail:'Both cases reduce to the perpendicular bisector — a common trick in geometry: turn a new problem into one you already know. The perpendicular is the shortest distance from a point to a line.',
 real:'The height of a triangle (altitude) is the perpendicular from a vertex to the opposite side.',
 apply:'Draw a line l and a point P 4 cm above it. Construct the perpendicular from P to l.',
 see:{w:520,h:280,f:[
  ['Line l and point P.',`<line x1="40" y1="200" x2="480" y2="200" stroke="${ink}" stroke-width="2.5"/>`+lbl(470,190,'l')+dot(260,70,'P',ink,0,-10)],
  ['Arc from P cuts l at A and B.',arc(260,70,170,-130,-50,TL)+dot(260-Math.sqrt(170*170-130*130),200,'A',TL,0,20)+dot(260+Math.sqrt(170*170-130*130),200,'B',TL,0,20)],
  ['Bisect AB: the line passes through P, perpendicular to l.',`<line x1="260" y1="55" x2="260" y2="260" stroke="${PU}" stroke-width="2.5"/><rect x="260" y="188" width="12" height="12" fill="none" stroke="${PU}"/>`]]},
 seeNote:'Make two equal points, then bisect.',
 do:{title:'Shortest path',mat:'Thread, ruler',steps:['From P, stretch thread to several points on l.','Measure each.'],obs:'The perpendicular is shortest.',why:'Perpendicular distance.',lab:false},
 memo:'"Arc, two points, bisect."',
 miscon:['"Any line from P to l is perpendicular." Only the one at 90°.'],
 terms:['Perpendicular','Shortest distance','Altitude'],
 q:{q:'The construction of a perpendicular from P uses:',o:['angle bisector','perpendicular bisector of AB','parallel lines','a protractor'],a:1,why:'Reduce to 6.1.'},
 exam:'Construct perpendicular from a point: 2 marks.'},

{id:'k3',num:'6.3',title:'Angle bisector and petal designs',
 intro:'How do you split an angle into two exactly equal parts without a protractor?',
 obj:'Construct an angle bisector and use compass arcs to make designs.',
 prior:'6.1; angles.',
 simple:'Angle at O: with centre O draw an arc cutting the arms at P and Q. With centres P and Q and the same radius, draw arcs meeting at R inside the angle. Join OR: it bisects the angle. Bisecting again gives quarters, e.g. 90° → 45° → 22.5°.',
 detail:'Why: OP = OQ and PR = QR, and OR is shared, so triangles OPR and OQR are congruent (SSS) — the two angles at O are equal. Petal designs: arcs of equal radius drawn from points on a circle (spaced one radius apart) create a 6-petalled flower; bisecting gives 12 or 8 petal designs, as in rangoli.',
 real:'Rangoli and temple floor designs use compass-like arcs.',
 apply:'Construct a 60° angle with a compass, then bisect it to get 30°.',
 see:{w:520,h:280,f:[
  ['Angle at O.',`<line x1="60" y1="240" x2="460" y2="240" stroke="${ink}" stroke-width="2.5"/><line x1="60" y1="240" x2="${60+400*Math.cos(Math.PI/3)}" y2="${240-400*Math.sin(Math.PI/3)}" stroke="${ink}" stroke-width="2.5"/>`+dot(60,240,'O',ink,-12,5)],
  ['Arc from O cuts arms at P and Q.',arc(60,240,180,-5,65,TL)+dot(240,240,'Q',TL,0,20)+dot(60+180*Math.cos(Math.PI/3),240-180*Math.sin(Math.PI/3),'P',TL,-12,0)],
  ['Arcs from P and Q meet at R; OR bisects the angle.',(()=>{const rx=60+300*Math.cos(Math.PI/6),ry=240-300*Math.sin(Math.PI/6);return arc(240,240,140,40,80,OR)+arc(150,84,140,-35,5,OR)+`<line x1="60" y1="240" x2="${60+400*Math.cos(Math.PI/6)}" y2="${240-400*Math.sin(Math.PI/6)}" stroke="${PU}" stroke-width="2.5"/>`+dot(rx,ry,'R',PU,12,-4)+lbl(170,225,'30°','fill="'+PU+'"')+lbl(140,190,'30°','fill="'+PU+'"')})()]]},
 seeNote:'Congruent triangles (SSS) prove it.',
 do:{title:'Six-petal flower',mat:'Compass, paper',steps:['Draw a circle.','Keeping the same radius, draw arcs from points on it, stepping one radius each time.'],obs:'A 6-petalled flower.',why:'The radius fits 6 times around a circle.',lab:false},
 memo:'"Arc, arc-arc, join."',
 miscon:['"You need a protractor to bisect an angle." Compass and ruler suffice.'],
 terms:['Angle bisector','Congruent','Petal design'],
 q:{q:'Bisecting a 90° angle twice gives:',o:['45°','30°','22.5°','60°'],a:2,why:'90 → 45 → 22.5.'},
 exam:'Construct angle bisector: 2 marks.'},

{id:'k4',num:'6.4',title:'Constructions in the Śulba-Sūtras',
 intro:'Over 2500 years ago, Indian altar builders made precise squares and right angles with just ropes and pegs. How?',
 obj:'Describe rope-and-peg methods for perpendiculars and squares.',
 prior:'6.1, 6.2.',
 simple:'The Śulba-Sūtras are ancient Indian texts on constructing fire altars (vedis) of exact shapes and sizes. A rope tied to a peg works like a compass. To draw a perpendicular to a line through a point, builders marked equal distances on either side and used equal ropes from both ends — the same idea as the perpendicular bisector.',
 detail:'They also used a rope with marks dividing it in lengths such as 3, 4 and 5 units (or 5, 12, 13): stretched into a triangle, it forms a right angle — the idea later known as the Pythagorean relation, which the Śulba-Sūtras state for a rectangle\'s diagonal. Squares were made by constructing perpendiculars at both ends of a side and marking equal lengths.',
 real:'Masons in villages still use the 3-4-5 rope trick to set out square corners.',
 apply:'Mark a rope into 12 equal parts. Show how to make a right angle with it.',
 see:{w:520,h:240,f:[
  ['A rope with 12 equal parts.',[...Array(13)].map((_,k)=>`<circle cx="${40+k*36}" cy="40" r="3" fill="${OR}"/>`).join('')+`<line x1="40" y1="40" x2="472" y2="40" stroke="${OR}" stroke-width="2"/>`],
  ['Stretch into sides 3, 4, 5.',`<polygon points="160,220 400,220 400,40" fill="none" stroke="${TL}" stroke-width="2.5"/>`.replace('400,40','400,40')+''],
  ['A right angle appears.',`<rect x="386" y="206" width="14" height="14" fill="none" stroke="${PU}" stroke-width="2"/>`+lbl(280,235,'4')+lbl(415,130,'3')+lbl(265,120,'5')]]},
 seeNote:'3 + 4 + 5 = 12 knots.',
 do:{title:'Rope triangle',mat:'String with 12 equal knots, 3 friends',steps:['Hold corners at knots 0, 3 and 7 (sides 3, 4, 5).','Check the corner with a set square.'],obs:'90°.',why:'3-4-5 triangle.',lab:false},
 memo:'"3-4-5 makes a corner true."',
 miscon:['"Ancient builders had no geometry." The Śulba-Sūtras show precise geometry.'],
 terms:['Śulba-Sūtras','Vedi (altar)','Rope and peg','Right angle'],
 q:{q:'The Śulba-Sūtras were written mainly to guide the building of:',o:['ships','fire altars','forts','roads'],a:1,why:'Vedic altars.'},
 exam:'Śulba-Sūtra methods: 2 marks.'},

{id:'k5',num:'6.5',title:'Tiling the plane',
 intro:'Why are floor tiles usually squares, rectangles or hexagons — and almost never regular pentagons?',
 obj:'Understand tilings and which regular polygons tile the plane.',
 prior:'Interior angles of polygons (equilateral triangle 60°, square 90°).',
 simple:'A tiling (tessellation) covers a surface with shapes, with no gaps and no overlaps. At every corner where tiles meet, the angles must add up to exactly 360°. Equilateral triangles (6 × 60°), squares (4 × 90°) and regular hexagons (3 × 120°) work. A regular pentagon has angles of 108°: 3 × 108° = 324° leaves a gap; 4 × 108° = 432° overlaps.',
 detail:'Only these three regular polygons tile the plane alone. Combinations work too: octagon + octagon + square (135° + 135° + 90° = 360°); hexagons and triangles. Any triangle and any quadrilateral (even irregular) can tile the plane. Tangram pieces also make tiling patterns.',
 real:'Honeycombs use hexagons — strong and space-saving.',
 apply:'Can regular octagons alone tile a floor? Check with angles.',
 see:{w:520,h:240,f:[
  ['Triangles: 6 × 60° = 360°.',[...Array(6)].map((_,k)=>P([[90,120],[90+60*Math.cos(k*Math.PI/3),120-60*Math.sin(k*Math.PI/3)],[90+60*Math.cos((k+1)*Math.PI/3),120-60*Math.sin((k+1)*Math.PI/3)]],COL[3])).join('')+lbl(90,215,'6 × 60° = 360°')],
  ['Squares: 4 × 90° = 360°.',[[0,0],[1,0],[0,1],[1,1]].map(([i,j])=>`<rect x="${210+i*50}" y="${70+j*50}" width="50" height="50" fill="${COL[4]}" fill-opacity=".35" stroke="${COL[4]}"/>`).join('')+lbl(260,215,'4 × 90° = 360°')],
  ['Pentagons: 3 × 108° = 324° — a gap!',[0,1,2].map(k=>P(poly(5,430,120,45,k*108),COL[5])).join('')+lbl(430,215,'3 × 108° = 324° ✗','fill="'+OR+'"')]]},
 seeNote:'360° at every corner.',
 do:{title:'Tile hunt',mat:'Paper cut-outs of regular polygons',steps:['Try to fit copies of each shape around a point.'],obs:'Triangle, square, hexagon fit.',why:'Angles divide 360.',lab:true},
 memo:'"Three regulars tile: tri, square, hex."',
 miscon:['"All regular polygons tile the plane." Only triangles, squares and hexagons.'],
 terms:['Tiling (tessellation)','Regular polygon','Interior angle','Vertex'],
 q:{q:'Which regular polygon cannot tile the plane alone?',o:['triangle','square','pentagon','hexagon'],a:2,why:'108° doesn\'t divide 360°.'},
 exam:'Which polygons tile; justify with angles: 3 marks.'},

{id:'k6',num:'6.6',title:'Angles at a vertex: testing tilings',
 intro:'How can you check, without cutting paper, whether a mix of shapes will tile?',
 obj:'Use interior angles to test whether shapes fit around a point.',
 prior:'6.5.',
 simple:'Interior angle of a regular polygon with n sides = 180° − 360° ÷ n. Triangle 60°, square 90°, pentagon 108°, hexagon 120°, octagon 135°, dodecagon (12 sides) 150°. Test: do the angles at a corner add up to 360°? Octagon + octagon + square: 135 + 135 + 90 = 360 ✓. Dodecagon + dodecagon + triangle: 150 + 150 + 60 = 360 ✓.',
 detail:'For a regular polygon to tile alone, 360 ÷ (interior angle) must be a whole number: 360 ÷ 60 = 6, 360 ÷ 90 = 4, 360 ÷ 120 = 3; but 360 ÷ 108 = 3.33…, 360 ÷ 135 = 2.67… Exterior angle = 360° ÷ n, and interior + exterior = 180°.',
 real:'Indian jaali screens and floor patterns combine octagons and squares.',
 apply:'Do two hexagons and two triangles fit around a point?',
 see:{w:520,h:220,f:[
  ['Interior angle = 180° − 360° ÷ n.',lbl(260,40,'interior angle = 180° − 360° ÷ n','font-size="17" font-weight="700"')],
  ['Table of angles.',[[3,60],[4,90],[5,108],[6,120],[8,135],[12,150]].map(([n,a],k)=>lbl(55+k*82,90,`n=${n}`,'font-size="12"')+lbl(55+k*82,115,a+'°','font-size="16" fill="'+COL[n]+'"')).join('')],
  ['Octagon + octagon + square = 360°.',lbl(260,175,'135° + 135° + 90° = 360° ✓','font-size="17" fill="'+GN+'"')]]},
 seeNote:'Add the corner angles.',
 do:{title:'Design a floor',mat:'Lab on this page, graph paper',steps:['Use the mixed tilings in the lab.','Draw your own pattern.'],obs:'Corners add to 360°.',why:'Vertex condition.',lab:true},
 memo:'"Corner sum 360 or it won\'t fit."',
 miscon:['"Shapes fit if they look similar." Check the angle sum.'],
 terms:['Interior angle','Exterior angle','Semi-regular tiling'],
 q:{q:'Interior angle of a regular octagon:',o:['120°','135°','140°','150°'],a:1,why:'180 − 45.'},
 exam:'Angle test for tilings: 2–3 marks.'}
];

const CARDS=[['Perpendicular bisector','Equal arcs from A and B; join crossings.'],['Equidistant','Points on it are equally far from A and B.'],['Perpendicular from P','Arc cuts line at A, B; bisect AB.'],['Angle bisector','Arc, two equal arcs, join; SSS proof.'],['Petal designs','Radius fits 6 times round a circle.'],['Śulba-Sūtras','Ancient Indian altar geometry with rope and pegs.'],['3-4-5 rope','Gives a right angle.'],['Tiling rule','Angles at each corner = 360°.'],['Regular tilers','Triangle, square, hexagon only.'],['Interior angle','180° − 360° ÷ n.']];

const Q=[
 {lv:1,q:'A tiling must have:',o:['gaps','overlaps','no gaps and no overlaps','only squares'],a:2,w:'Definition.'},
 {lv:1,q:'Interior angle of an equilateral triangle:',o:['45°','60°','90°','120°'],a:1,w:'180 ÷ 3.'},
 {lv:1,q:'The perpendicular bisector of AB passes through:',o:['A','B','the midpoint of AB','no point of AB'],a:2,w:'Bisects.'},
 {lv:2,q:'How many regular hexagons meet at a corner in a hexagon tiling?',o:['2','3','4','6'],a:1,w:'360 ÷ 120.'},
 {lv:2,q:'For the perpendicular bisector, the compass radius must be:',o:['less than half AB','more than half AB','exactly AB','any'],a:1,w:'Arcs must meet.'},
 {lv:2,q:'Interior angle of a regular pentagon:',o:['100°','108°','120°','135°'],a:1,w:'180 − 72.'},
 {lv:3,q:'Which combination fits around a point?',o:['3 pentagons','2 octagons + 1 square','2 hexagons + 1 square','4 pentagons'],a:1,w:'135+135+90.'},
 {lv:3,q:'Bisecting a 60° angle gives:',o:['20°','30°','45°','120°'],a:1,w:'Half.'},
 {lv:4,q:'A rope triangle with sides 3, 4, 5 gives:',o:['an equilateral triangle','a right angle','a 60° angle','a straight line'],a:1,w:'Śulba-Sūtras.'},
 {lv:4,q:'Why can\'t regular pentagons tile alone?',o:['They are too big','108° does not divide 360° exactly','They have 5 sides only','They are irregular'],a:1,w:'Gap or overlap.'},
 {lv:5,open:true,m:3,q:'Write the steps to construct the perpendicular bisector of AB = 6 cm and explain why it works.',ans:['Arcs above and below AB from A with radius > 3 cm (1)','Same radius from B; arcs meet at X, Y; join XY (1)','X and Y are equidistant from A and B, so XY is the perpendicular bisector (1)']},
 {lv:5,open:true,m:3,q:'Show using angles which regular polygons can tile the plane by themselves.',ans:['Interior angles: 60°, 90°, 108°, 120°, 135°… (1)','Need 360 ÷ angle to be a whole number (1)','Only 60° (6), 90° (4), 120° (3): triangle, square, hexagon (1)']}
];

const ONEMIN=['Perpendicular bisector: equal arcs from both ends.','Perpendicular from a point: reduce to bisector.','Angle bisector; petal designs.','Śulba-Sūtras: rope and pegs, 3-4-5.','Tiling: 360° at each corner.','Interior angle = 180° − 360° ÷ n.'];
const KEYS=[['perpendicular bisector',/bisector|midpoint/i],['perpendicular',/perpendicular/i],['angle bisector',/angle bisector|bisect/i],['Śulba',/ulba|rope/i],['tiling',/tiling|tessellat/i],['360',/360/]];

/* ---------- lab ---------- */
let seq=[],full=false;
function around(){const cx=230,cy=160,side=95;let s='',a=0;seq.forEach((n,k)=>{const ia=IA(n);const pts=poly(n,cx,cy,side,a);s+=P(pts,COL[n],.35);a+=ia});
 s+=`<circle cx="${cx}" cy="${cy}" r="5" fill="${ink}"/>`;return {s,sum:seq.reduce((t,n)=>t+IA(n),0)}}
function tiling(n){let s='';const W=460,H=320;if(n===4){const a=50;for(let x=-a;x<W+a;x+=a)for(let y=-a;y<H+a;y+=a)s+=`<rect x="${x}" y="${y}" width="${a}" height="${a}" fill="${COL[4]}" fill-opacity="${((x+y)/a)%2?.2:.4}" stroke="${COL[4]}"/>`}
 else if(n===3){const a=56,h=a*Math.sqrt(3)/2;for(let r=-1;r<H/h+1;r++)for(let c=-1;c<W/a+2;c++){const x=c*a+(r%2?a/2:0),y=r*h;s+=P([[x,y+h],[x+a,y+h],[x+a/2,y]],COL[3],.35)+P([[x+a/2,y],[x+a*1.5,y],[x+a,y+h]],COL[3],.15)}}
 else if(n===6){const a=34,w=a*Math.sqrt(3);for(let r=-1;r<H/(1.5*a)+1;r++)for(let c=-1;c<W/w+1;c++){const cx=c*w+(r%2?w/2:0),cy=r*1.5*a;s+=`<polygon points="${[0,1,2,3,4,5].map(k=>[cx+a*Math.cos((k*60+30)*Math.PI/180),cy+a*Math.sin((k*60+30)*Math.PI/180)].map(v=>v.toFixed(1)).join(',')).join(' ')}" fill="${COL[6]}" fill-opacity="${(r+c)%3?.2:.4}" stroke="${COL[6]}"/>`}}
 return s}
function draw(){const n=+$('#tN').value;if(full){if([3,4,6].includes(n)){$('#tSvg').innerHTML=tiling(n);$('#tOut').innerHTML=`<p class="fb ok">A regular ${['','','','triangle','square','','hexagon'][n]} tiling: ${360/IA(n)} meet at every corner (${360/IA(n)} × ${IA(n)}° = 360°).</p>`}else{$('#tSvg').innerHTML=around().s;$('#tOut').innerHTML=`<p class="fb no">This shape cannot tile the plane by itself: 360 ÷ ${IA(n)} = ${(360/IA(n)).toFixed(2)} is not a whole number.</p>`}return}
 const {s,sum}=around();$('#tSvg').innerHTML=s+T(230,310,seq.length?`angle sum at the corner: ${seq.map(m=>IA(m)).join(' + ')} = ${sum}°`:'Add shapes at the corner point','font-size="13" font-weight="700"');
 let m='';if(!seq.length)m=`<p>Interior angle of this shape: <b>${IA(n)}°</b>.</p>`;else if(Math.abs(sum-360)<1e-6)m='<p class="fb ok">Exactly 360° — no gap, no overlap. These fit around a point!</p>';else if(sum<360)m=`<p>${sum}° so far — gap of ${(360-sum).toFixed(0)}°. ${360-sum<Math.min(...[3,4,5,6,8].map(IA))?'Too small for any shape: it will never close.':'Add more?'}</p>`;else m=`<p class="fb no">${sum}° — more than 360°: the shapes overlap.</p>`;$('#tOut').innerHTML=m}
function labShow(){draw()}
function labInit(){}
function labClick(b){const n=+$('#tN').value;if(b.id==='tAdd'){full=false;if(seq.reduce((t,m)=>t+IA(m),0)<360-1e-6)seq.push(n);draw();return true}if(b.id==='tFill'){full=true;draw();return true}if(b.id==='tClr'){seq=[];full=false;$('#tMix').value='';draw();return true}return false}
function labChange(t){if(t.id==='tN'){seq=[];full=false;draw();return true}if(t.id==='tMix'&&t.value){seq=t.value.split(',').map(Number);full=false;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
