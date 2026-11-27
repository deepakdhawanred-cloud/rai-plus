/* Rai Plus content pack: Class 8 Mathematics (Ganita Prakash), Chapter 4 – Quadrilaterals. */
RP.register({key:'8mat04',cls:'8',subject:'Mathematics',ch:'4',title:"Quadrilaterals",color:'#b04a1f',
crumb:"Class 8 Mathematics · Ganita Prakash",h1:"Chapter 4: Quadrilaterals",sub:"Angle sum of a quadrilateral, rectangles and squares, parallelograms, rhombuses, kites and trapeziums — their sides, angles and diagonals — and how the family fits together.",heroLabel:"A family of quadrilaterals",labName:'Quadrilateral shaper',
theme:"\n:root{--g:light-dark(#b04a1f,#f2a77f);--g2:light-dark(#fbefe9,#21110a);--line:light-dark(#f0d6ca,#47271a);--bg:light-dark(#ffffff,#130a06);--card:light-dark(#ffffff,#1c100a);\n--ink:light-dark(#2a1309,#f7e6dd);--mute:light-dark(#6e4f42,#d2b4a6);--y:light-dark(#1f5f8b,#8fc2e6);--y2:light-dark(#e8f1f8,#0b1622);--hd:#8a3815}\n",
labHTML:`  <h2>Quadrilateral shaper</h2>
  <p>Build a parallelogram with base a, side b and angle θ. Make the angle 90° or the sides equal and watch its name change. Turn on diagonals to check their properties. Try the kite and trapezium too.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="qdSvg" viewBox="0 0 460 320" role="img" aria-label="Quadrilateral" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Family<select id="qdF"><option value="p">Parallelogram family</option><option value="k">Kite</option><option value="t">Trapezium</option></select></label></div>
  <div class="ctrl"><label>a: <b id="qdAv"></b><input type="range" class="qdS" id="qdA" min="4" max="10" value="8"></label> <label>b: <b id="qdBv"></b><input type="range" class="qdS" id="qdB" min="3" max="10" value="5"></label></div>
  <div class="ctrl"><label>θ: <b id="qdTv"></b><input type="range" class="qdS" id="qdT" min="40" max="140" step="5" value="65"></label></div>
  <div class="ctrl"><label><input type="checkbox" id="qdD" checked> show diagonals</label></div>
  <div class="box y" id="qdOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#b04a1f',LABNAME='Quadrilateral shaper',MIND_CENTER='Quadrilaterals';
const OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const poly=(pts,c,o=.15)=>`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="${c}" fill-opacity="${o}" stroke="${c}" stroke-width="2.5"/>`;
const diag=(a,b,c=GR)=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="1.6" stroke-dasharray="6 4"/>`;
const tick=(p,q,n=1,c=ink)=>{const mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2,a=Math.atan2(q[1]-p[1],q[0]-p[0])+Math.PI/2;let s='';for(let k=0;k<n;k++){const o=(k-(n-1)/2)*5;const cx=mx+o*Math.cos(a-Math.PI/2),cy=my+o*Math.sin(a-Math.PI/2);s+=`<line x1="${cx-6*Math.cos(a)}" y1="${cy-6*Math.sin(a)}" x2="${cx+6*Math.cos(a)}" y2="${cy+6*Math.sin(a)}" stroke="${c}" stroke-width="1.5"/>`}return s};
const right=(p,u,v,s=12)=>`<path d="M${p[0]+u[0]*s} ${p[1]+u[1]*s} L${p[0]+(u[0]+v[0])*s} ${p[1]+(u[1]+v[1])*s} L${p[0]+v[0]*s} ${p[1]+v[1]*s}" fill="none" stroke="${ink}" stroke-width="1.3"/>`;
function heroDraw(){return `<rect x="70" y="50" width="60" height="60" fill="none" stroke="#fff" stroke-width="2.5"/><polygon points="160,110 180,50 240,50 220,110" fill="none" stroke="#fff" stroke-width="2.5"/><polygon points="300,40 330,80 300,130 270,80" fill="none" stroke="#fff" stroke-width="2.5"/>`}
const HERO=heroDraw;
const MIND=[['Angle sum 360°',100,50],['Rectangle & square',420,50],['Parallelogram',90,150],['Rhombus',430,150],['Kite & trapezium',110,250],['Family tree',410,250]];

const C=[
{id:'q1',num:'4.1',title:'Quadrilaterals and their angle sum',
 intro:'Draw any four-sided shape and measure its four angles. What do they add up to?',
 obj:'Identify parts of a quadrilateral and prove the angle sum is 360°.',
 prior:'Class 7: triangles, angle sum 180°.',
 simple:'A quadrilateral is a closed figure with four straight sides, four vertices and four angles. A diagonal joins opposite vertices. Draw one diagonal: it splits the quadrilateral into two triangles. Each triangle has angles adding to 180°, so the four angles of a quadrilateral add to 2 × 180° = 360°.',
 detail:'Adjacent sides share a vertex; opposite sides do not. A convex quadrilateral has both diagonals inside; a concave one has one diagonal outside (an arrowhead shape). The 360° rule works for both. If three angles are 80°, 95° and 110°, the fourth is 360° − 285° = 75°.',
 real:'Tiles, doors, kites, notebooks and cricket pitches are all quadrilaterals.',
 apply:'Three angles of a quadrilateral are 70°, 90° and 120°. Find the fourth.',
 see:{w:520,h:220,f:[
  ['A quadrilateral ABCD.',poly([[80,180],[420,190],[380,40],[150,60]],OR)+lbl(70,195,'A')+lbl(430,205,'B')+lbl(390,30,'C')+lbl(140,50,'D')],
  ['Diagonal AC makes two triangles.',diag([80,180],[380,40],BL)],
  ['2 × 180° = 360°.',lbl(260,130,'180°','fill="'+BL+'"')+lbl(200,90,'180°','fill="'+BL+'"')+lbl(260,212,'angle sum = 360°','font-size="15" font-weight="700"')]]},
 seeNote:'Two triangles inside.',
 do:{title:'Tear the corners',mat:'Paper quadrilateral, scissors',steps:['Cut out any quadrilateral.','Tear off the four corners and fit them around a point.'],obs:'They make a full turn.',why:'360°.',lab:false},
 memo:'"Four sides, two triangles, 360."',
 miscon:['"Only special quadrilaterals add to 360°." Every quadrilateral does.'],
 terms:['Quadrilateral','Vertex','Diagonal','Adjacent / opposite sides','Convex / concave'],
 q:{q:'Three angles are 85°, 95°, 100°. The fourth is:',o:['80°','90°','100°','70°'],a:0,why:'360 − 280.'},
 exam:'Angle sum problems: 2 marks.'},

{id:'q2',num:'4.2',title:'Rectangles and squares',
 intro:'How can a carpenter check that a door frame is truly rectangular using only a measuring tape?',
 obj:'State and use properties of rectangles and squares, including diagonals.',
 prior:'4.1.',
 simple:'A rectangle has four right angles. Its opposite sides are equal and parallel. Its diagonals are equal and bisect each other (cut each other in half). A square is a rectangle with all four sides equal; its diagonals are equal, bisect each other at right angles, and bisect the corner angles (45° each).',
 detail:'Carpenter\'s check: measure both diagonals — if they are equal (and opposite sides are equal), the frame is a rectangle. Why are rectangle diagonals equal? Triangles ABC and BAD are congruent (SAS: AB common, BC = AD, right angles), so AC = BD.',
 real:'Masons check room corners by measuring diagonals.',
 apply:'A rectangle\'s diagonal AC = 13 cm. What is BD? If they meet at O, find AO.',
 see:{w:520,h:220,f:[
  ['Rectangle: four right angles.',poly([[60,170],[260,170],[260,50],[60,50]],OR)+right([60,170],[1,0],[0,-1])+right([260,170],[-1,0],[0,-1])],
  ['Diagonals equal and bisect each other.',diag([60,170],[260,50],BL)+diag([260,170],[60,50],BL)+`<circle cx="160" cy="110" r="3" fill="${BL}"/>`],
  ['Square: diagonals also at 90°.',poly([[330,170],[450,170],[450,50],[330,50]],GN)+diag([330,170],[450,50],PU)+diag([450,170],[330,50],PU)+right([390,110],[.707,-.707],[.707,.707],10)+lbl(390,200,'square')]]},
 seeNote:'Equal diagonals → rectangle.',
 do:{title:'Diagonal check',mat:'Measuring tape, door or table top',steps:['Measure both diagonals of a table top.'],obs:'Equal for a rectangle.',why:'Rectangle property.',lab:true},
 memo:'"Rectangle: equal diagonals. Square: equal and perpendicular."',
 miscon:['"A square is not a rectangle." A square is a special rectangle.'],
 terms:['Rectangle','Square','Bisect','Perpendicular'],
 q:{q:'Diagonals of a square:',o:['are unequal','are equal and perpendicular','never meet','are parallel'],a:1,why:'Square property.'},
 exam:'Properties of rectangle/square: 2–3 marks.'},

{id:'q3',num:'4.3',title:'Parallelograms',
 intro:'Push a rectangle sideways so it leans. Which properties survive?',
 obj:'State and prove properties of parallelograms.',
 prior:'4.2; parallel lines and transversals (Class 7).',
 simple:'A parallelogram has both pairs of opposite sides parallel. Properties: opposite sides are equal; opposite angles are equal; adjacent angles add to 180° (they are co-interior angles); diagonals bisect each other (but are not usually equal).',
 detail:'Proof idea: diagonal AC divides parallelogram ABCD into triangles ABC and CDA, which are congruent (ASA, using alternate angles and common side AC), so AB = CD and BC = DA. If one angle is 70°, the others are 110°, 70°, 110°. A rectangle is a parallelogram with a right angle.',
 real:'Folding stools and scissor lifts use parallelograms that change shape but keep sides parallel.',
 apply:'In parallelogram PQRS, ∠P = 65°. Find ∠Q, ∠R and ∠S.',
 see:{w:520,h:220,f:[
  ['Parallelogram ABCD.',poly([[60,170],[320,170],[420,50],[160,50]],OR)+tick([60,170],[320,170],1)+tick([160,50],[420,50],1)+tick([320,170],[420,50],2)+tick([60,170],[160,50],2)],
  ['Opposite angles equal; adjacent add to 180°.',lbl(95,160,'70°','fill="'+BL+'"')+lbl(385,65,'70°','fill="'+BL+'"')+lbl(300,160,'110°','fill="'+GN+'"')+lbl(180,65,'110°','fill="'+GN+'"')],
  ['Diagonals bisect each other.',diag([60,170],[420,50],PU)+diag([320,170],[160,50],PU)+`<circle cx="240" cy="110" r="3" fill="${PU}"/>`]]},
 seeNote:'Opposites equal; diagonals halve each other.',
 do:{title:'Straw parallelogram',mat:'Straws, pins',steps:['Make a straw parallelogram.','Push it to change angles; measure.'],obs:'Opposite angles stay equal.',why:'Parallel sides.',lab:true},
 memo:'"Opposites equal, neighbours 180, diagonals halve."',
 miscon:['"Diagonals of a parallelogram are equal." Only for rectangles.'],
 terms:['Parallelogram','Parallel','Co-interior angles','Congruent'],
 q:{q:'One angle of a parallelogram is 72°. Its adjacent angle is:',o:['72°','108°','18°','288°'],a:1,why:'180 − 72.'},
 exam:'Parallelogram properties with proof: 3 marks.'},

{id:'q4',num:'4.4',title:'Rhombus',
 intro:'A diamond shape on a playing card — what is special about its diagonals?',
 obj:'State properties of a rhombus and use them.',
 prior:'4.3.',
 simple:'A rhombus is a parallelogram with all four sides equal. It has all parallelogram properties, and also: its diagonals bisect each other at right angles, and each diagonal bisects the angles at the vertices it joins. A square is a rhombus with right angles.',
 detail:'Because diagonals are perpendicular bisectors, a rhombus splits into four congruent right triangles. Area of a rhombus = ½ × d₁ × d₂. If diagonals are 6 cm and 8 cm, each half is 3 and 4, so each side = 5 cm (3-4-5).',
 real:'Diamond patterns in fences and tiles are rhombuses.',
 apply:'A rhombus has diagonals 10 cm and 24 cm. Find its side.',
 see:{w:520,h:220,f:[
  ['Rhombus: all sides equal.',poly([[260,20],[380,110],[260,200],[140,110]],OR)+[[[260,20],[380,110]],[[380,110],[260,200]],[[260,200],[140,110]],[[140,110],[260,20]]].map(([p,q])=>tick(p,q,1)).join('')],
  ['Diagonals at right angles.',diag([260,20],[260,200],BL)+diag([140,110],[380,110],BL)+right([260,110],[1,0],[0,-1],10)],
  ['Area = ½ × d₁ × d₂.',lbl(440,180,'area = ½ d₁ d₂','font-weight="700"')]]},
 seeNote:'Perpendicular bisecting diagonals.',
 do:{title:'Fold a rhombus',mat:'Square paper',steps:['Fold along both diagonals of a rhombus cut-out.'],obs:'Four matching right triangles.',why:'Perpendicular diagonals.',lab:false},
 memo:'"Rhombus: equal sides, crossing diagonals at 90°."',
 miscon:['"A rhombus has equal diagonals." Only a square does.'],
 terms:['Rhombus','Perpendicular bisector','Area of rhombus'],
 q:{q:'Diagonals of a rhombus are 6 cm and 8 cm. Side =',o:['5 cm','7 cm','10 cm','14 cm'],a:0,why:'3-4-5.'},
 exam:'Rhombus diagonals: 2–3 marks.'},

{id:'q5',num:'4.5',title:'Kites and trapeziums',
 intro:'A paper kite and the cross-section of a bucket — which special quadrilaterals are they?',
 obj:'Describe kites and trapeziums and their properties.',
 prior:'4.1–4.4.',
 simple:'A kite has two pairs of equal adjacent sides. Its diagonals are perpendicular, and one diagonal (the main one) bisects the other and the angles at its ends. A trapezium has exactly one pair of parallel sides. In an isosceles trapezium, the non-parallel sides are equal, base angles are equal and diagonals are equal.',
 detail:'In a trapezium, the angles between a non-parallel side and the two parallel sides add to 180° (co-interior). Area of a trapezium = ½ × (sum of parallel sides) × height. A rhombus is a special kite (all four sides equal).',
 real:'Bucket and lampshade side views are isosceles trapeziums.',
 apply:'In trapezium ABCD with AB ∥ DC, ∠A = 65°. Find ∠D.',
 see:{w:520,h:220,f:[
  ['Kite: two pairs of equal adjacent sides.',poly([[120,20],[190,80],[120,200],[50,80]],OR)+tick([120,20],[190,80],1)+tick([120,20],[50,80],1)+tick([190,80],[120,200],2)+tick([50,80],[120,200],2)],
  ['Kite diagonals perpendicular.',diag([120,20],[120,200],BL)+diag([50,80],[190,80],BL)+right([120,80],[1,0],[0,1],9)],
  ['Trapezium: one pair of parallel sides.',poly([[260,180],[490,180],[430,60],[320,60]],GN)+lbl(375,50,'parallel','font-size="11" fill="'+GN+'"')+lbl(375,200,'parallel','font-size="11" fill="'+GN+'"')]]},
 seeNote:'Kite: adjacent pairs; trapezium: one parallel pair.',
 do:{title:'Make a kite',mat:'Two sticks, paper, string',steps:['Cross two sticks at right angles, one off-centre.','Join the ends.'],obs:'A kite shape.',why:'Perpendicular diagonals.',lab:false},
 memo:'"Kite: neighbours match. Trapezium: one parallel pair."',
 miscon:['"A trapezium has two pairs of parallel sides." Only one pair (else it is a parallelogram).'],
 terms:['Kite','Trapezium','Isosceles trapezium','Area of trapezium'],
 q:{q:'A trapezium has:',o:['no parallel sides','exactly one pair of parallel sides','two pairs','all sides equal'],a:1,why:'Definition.'},
 exam:'Kite/trapezium properties: 2 marks.'},

{id:'q6',num:'4.6',title:'The quadrilateral family tree',
 intro:'Is a square a rhombus? Is a rectangle a parallelogram? Is every rhombus a square?',
 obj:'Relate special quadrilaterals in a hierarchy and reason about "always / sometimes / never".',
 prior:'4.2–4.5.',
 simple:'Quadrilateral → trapezium (one pair parallel) and parallelogram (two pairs parallel) and kite. Parallelogram → rectangle (right angles) and rhombus (equal sides). Square = rectangle + rhombus: it has every property of both. So: a square is always a rectangle, a rhombus, a parallelogram and a kite; a rectangle is sometimes a square; a rhombus is never a trapezium (under the "exactly one pair" definition).',
 detail:'To identify a shape, check properties in order: parallel sides? equal sides? right angles? diagonals? Diagonal facts summary: parallelogram — bisect each other; rectangle — bisect and equal; rhombus — bisect at 90°; square — all of these; kite — perpendicular.',
 real:'Architects choose shapes by properties: rectangles for rooms, rhombus tiles for patterns.',
 apply:'True or false: every square is a rhombus; every rhombus is a square.',
 see:{w:520,h:240,f:[
  ['Quadrilateral at the top.',`<rect x="190" y="10" width="140" height="32" rx="8" fill="${GR}" fill-opacity=".15" stroke="${GR}"/>`+lbl(260,31,'Quadrilateral','font-weight="700"')],
  ['Trapezium, parallelogram, kite.',[['Trapezium',40],['Parallelogram',190],['Kite',360]].map(([t,x])=>`<rect x="${x}" y="80" width="${t==='Parallelogram'?140:120}" height="32" rx="8" fill="${OR}" fill-opacity=".12" stroke="${OR}"/>`+lbl(x+(t==='Parallelogram'?70:60),101,t)).join('')+`<path d="M260 42 L100 80 M260 42 L260 80 M260 42 L420 80" stroke="${GR}"/>`],
  ['Rectangle, rhombus → square.',[['Rectangle',140],['Rhombus',290]].map(([t,x])=>`<rect x="${x}" y="150" width="100" height="32" rx="8" fill="${BL}" fill-opacity=".12" stroke="${BL}"/>`+lbl(x+50,171,t)).join('')+`<path d="M260 112 L190 150 M260 112 L340 150 M190 182 L260 205 M340 182 L260 205" stroke="${GR}"/><rect x="215" y="205" width="90" height="30" rx="8" fill="${GN}" fill-opacity=".15" stroke="${GN}"/>`+lbl(260,225,'Square','font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Square inherits everything.',
 do:{title:'Always / sometimes / never',mat:'Statement cards',steps:['Sort statements like "A rectangle is a square".'],obs:'Hierarchy matters.',why:'Inclusive definitions.',lab:true},
 memo:'"Square: the best of both."',
 miscon:['"A square is not a parallelogram." It is — a very special one.'],
 terms:['Hierarchy','Always / sometimes / never','Inclusive definition'],
 q:{q:'A rhombus with one right angle is a:',o:['kite only','square','trapezium','rectangle only'],a:1,why:'All sides equal + right angle.'},
 exam:'Classify and justify: 3 marks.'}
];

const CARDS=[['Angle sum','360° (two triangles).'],['Rectangle','Right angles; diagonals equal, bisect.'],['Square','Rectangle + rhombus; diagonals equal, ⟂.'],['Parallelogram','Opposite sides/angles equal; diagonals bisect.'],['Adjacent angles','Add to 180° in a parallelogram.'],['Rhombus','All sides equal; diagonals ⟂ bisectors.'],['Rhombus area','½ × d₁ × d₂.'],['Kite','Two pairs of equal adjacent sides; diagonals ⟂.'],['Trapezium','Exactly one pair of parallel sides.'],['Hierarchy','Square ⊂ rectangle, rhombus ⊂ parallelogram.']];

const Q=[
 {lv:1,q:'Sum of angles of a quadrilateral:',o:['180°','270°','360°','540°'],a:2,w:'Two triangles.'},
 {lv:1,q:'All sides equal and all angles 90°:',o:['rhombus','rectangle','square','kite'],a:2,w:'Square.'},
 {lv:1,q:'Exactly one pair of parallel sides:',o:['parallelogram','trapezium','rhombus','kite'],a:1,w:'Trapezium.'},
 {lv:2,q:'Parallelogram: ∠A = 75°. ∠C =',o:['105°','75°','15°','285°'],a:1,w:'Opposite angles.'},
 {lv:2,q:'Diagonals equal but not perpendicular:',o:['rhombus','rectangle (not square)','kite','square'],a:1,w:'Rectangle.'},
 {lv:2,q:'Rhombus diagonals 16 and 12. Area:',o:['96','192','48','28'],a:0,w:'½ × 16 × 12.'},
 {lv:3,q:'Rhombus diagonals 10 and 24. Side:',o:['13','17','26','12'],a:0,w:'5-12-13.'},
 {lv:3,q:'Angles in ratio 1:2:3:4. Largest:',o:['144°','120°','90°','36°'],a:0,w:'360 × 4/10.'},
 {lv:4,q:'Which is always true?',o:['A rectangle is a square','A square is a rhombus','A rhombus is a rectangle','A kite is a parallelogram'],a:1,w:'Hierarchy.'},
 {lv:4,q:'A parallelogram with equal diagonals is a:',o:['rhombus','rectangle','kite','trapezium'],a:1,w:'Equal diagonals.'},
 {lv:5,open:true,m:3,q:'Prove that the opposite sides of a parallelogram are equal.',ans:['Draw diagonal AC; AB ∥ DC and AD ∥ BC (1)','∠BAC = ∠DCA and ∠BCA = ∠DAC (alternate); AC common → △ABC ≅ △CDA (ASA) (1)','So AB = CD and BC = DA (CPCT) (1)']},
 {lv:5,open:true,m:3,q:'A carpenter measures a frame: opposite sides 80 cm and 60 cm, diagonals 100 cm and 100 cm. Is it a rectangle? Explain.',ans:['Opposite sides equal → parallelogram (1)','Diagonals equal → rectangle (1)','Check: 60² + 80² = 100² so angle is 90° (1)']}
];

const ONEMIN=['Angle sum 360°.','Rectangle and square: diagonals.','Parallelogram properties.','Rhombus: perpendicular diagonals.','Kite and trapezium.','Family tree: always/sometimes/never.'];
const KEYS=[['360',/360/],['rectangle',/rectangle/i],['parallelogram',/parallelogram/i],['rhombus',/rhombus/i],['kite/trapezium',/kite|trapezium/i],['diagonals',/diagonal/i]];

/* ---------- lab ---------- */
let fam='p',A=8,B=5,TH=65,showD=true,wired=false;
const R2=v=>Math.round(v*10)/10;
let U=26;
function pts(){const t=TH*Math.PI/180;if(fam==='p'){U=Math.min(26,200/(B*Math.sin(t)),400/(A+B*Math.abs(Math.cos(t))));const u=U;const x0=230-(A*u+B*u*Math.cos(t))/2,y0=230;return [[x0,y0],[x0+A*u,y0],[x0+A*u+B*u*Math.cos(t),y0-B*u*Math.sin(t)],[x0+B*u*Math.cos(t),y0-B*u*Math.sin(t)]]}
 if(fam==='k'){U=Math.min(26,230/(B*.6+A*.63),380/(B*1.6));const u=U;const h1=B*u*.6,h2=A*u*.9,w=B*u*.8;return [[230,40],[230+w,40+h1],[230,40+h1+h2*.7],[230-w,40+h1]]}
 U=Math.min(26,200/(B*Math.sin(t)),400/A);const u=U;let dx=B*Math.cos(t);dx=Math.max(-(A-1)/2,Math.min((A-1)/2,dx));const h=Math.sqrt(Math.max(1,B*B-dx*dx));const x0=230-A*u/2,y0=240;return [[x0,y0],[x0+A*u,y0],[x0+A*u-dx*u,y0-h*u],[x0+dx*u,y0-h*u]]}
const dist=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1])/U;
function draw(){const P=pts();let s=poly(P,OR,.13);['A','B','C','D'].forEach((n,k)=>s+=T(P[k][0]+(k===0||k===3?-12:12),P[k][1]+(k<2?16:-6),n,'font-size="13" font-weight="700"'));
 const sides=[0,1,2,3].map(k=>dist(P[k],P[(k+1)%4]));const ang=[0,1,2,3].map(k=>{const p=P[k],a=P[(k+3)%4],b=P[(k+1)%4];const v1=[a[0]-p[0],a[1]-p[1]],v2=[b[0]-p[0],b[1]-p[1]];return Math.acos((v1[0]*v2[0]+v1[1]*v2[1])/(Math.hypot(...v1)*Math.hypot(...v2)))*180/Math.PI});
 ang.forEach((g,k)=>s+=T(P[k][0]+(k===0||k===3?22:-22),P[k][1]+(k<2?-8:18),Math.round(g)+'°','font-size="11" fill="'+BL+'"'));
 const d1=dist(P[0],P[2]),d2=dist(P[1],P[3]);
 if(showD){s+=diag(P[0],P[2],PU)+diag(P[1],P[3],PU);const vx=[P[2][0]-P[0][0],P[2][1]-P[0][1]],wx=[P[3][0]-P[1][0],P[3][1]-P[1][1]];const da=Math.round(Math.acos(Math.abs(vx[0]*wx[0]+vx[1]*wx[1])/(Math.hypot(...vx)*Math.hypot(...wx)))*180/Math.PI);s+=T(230,300,`diagonals: ${R2(d1)} and ${R2(d2)}; angle between ${da}°`,'font-size="12" fill="'+PU+'"');var dang=da}
 $('#qdSvg').innerHTML=s;$('#qdAv').textContent=A;$('#qdBv').textContent=B;$('#qdTv').textContent=TH+'°';
 let name,props=[];if(fam==='p'){const r=TH===90,e=A===B;name=r&&e?'Square':r?'Rectangle':e?'Rhombus':'Parallelogram';props.push('opposite sides equal and parallel','opposite angles equal','diagonals bisect each other');if(r)props.push('diagonals equal');if(e)props.push('diagonals perpendicular');}
 else if(fam==='k'){name='Kite';props.push('two pairs of equal adjacent sides','diagonals perpendicular','one diagonal bisects the other')}else{name=Math.abs(TH-90)<1?'Right trapezium':'Isosceles trapezium';props.push('exactly one pair of parallel sides','angles on each slanted side add to 180°');if(name.startsWith('Isosceles'))props.push('base angles equal','diagonals equal')}
 const sum=Math.round(ang.reduce((a,b)=>a+b,0));$('#qdOut').innerHTML=`<p><b style="font-size:1.1em">${name}</b> — sides ${sides.map(R2).join(', ')}.</p><p>${props.join('; ')}.</p><p>Angle sum: ${ang.map(Math.round).join(' + ')} = ${sum}°.</p>`}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(!e.target||!e.target.classList||!e.target.classList.contains('qdS'))return;const v=+e.target.value;if(e.target.id==='qdA')A=v;else if(e.target.id==='qdB')B=v;else TH=v;draw()})}
function labClick(){return false}
function labChange(t){if(t.id==='qdF'){fam=t.value;draw();return true}if(t.id==='qdD'){showD=t.checked;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
