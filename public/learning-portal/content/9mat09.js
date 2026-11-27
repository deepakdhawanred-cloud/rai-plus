/* Rai Plus content pack: Class 9 Mathematics, Chapter 9 – Circles (rationalised NCERT). */
RP.register({key:'9mat09',cls:'9',subject:'Mathematics',ch:'9',title:"Circles",color:'#b04a1f',
crumb:"HBSE Class 9 Mathematics · Unit: Geometry · Taught in January",h1:"Chapter 9: Circles",sub:"Parts of a circle, equal chords and their angles and distances, the perpendicular from the centre, angles subtended by an arc, and cyclic quadrilaterals.",heroLabel:"Angles standing on the same arc",labName:'Circle angle explorer',
theme:"\n:root{--g:light-dark(#b04a1f,#f2a77f);--g2:light-dark(#fbefe9,#21110a);--line:light-dark(#f0d6c8,#4a2a1a);--bg:light-dark(#ffffff,#140c08);--card:light-dark(#ffffff,#1c120c);\n--ink:light-dark(#2d160a,#f6e8df);--mute:light-dark(#6a4c3c,#d1b8a8);--y:light-dark(#1f5f8b,#8cc4ea);--y2:light-dark(#eaf3fa,#081520);--hd:#7d3d1d}\n",
labHTML:`  <h2>Circle angle explorer</h2>
  <p><b>Arc angles:</b> move A, B and P around the circle. The angle at the centre is always double the angle at P (when P is on the major arc). <b>Cyclic quadrilateral:</b> move the four vertices — opposite angles always add up to 180°.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="ciSvg" viewBox="0 0 520 340" role="img" aria-label="Circle angles" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="ciM"><option value="a">Angle at centre vs at circumference</option><option value="q">Cyclic quadrilateral</option></select></label></div>
  <div class="ctrl"><label><span id="ciL1"></span><input type="range" class="ciS" id="ci1" min="0" max="359" value="200"></label></div>
  <div class="ctrl"><label><span id="ciL2"></span><input type="range" class="ciS" id="ci2" min="0" max="359" value="340"></label></div>
  <div class="ctrl"><label><span id="ciL3"></span><input type="range" class="ciS" id="ci3" min="0" max="359" value="90"></label></div>
  <div class="ctrl" id="ciQ4"><label><span id="ciL4"></span><input type="range" class="ciS" id="ci4" min="0" max="359" value="140"></label></div>
  <div class="box y" id="ciOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#b04a1f',LABNAME='Circle angle explorer',MIND_CENTER='Circles';
const OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',RD='#c0392b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const rad=d=>d*Math.PI/180;const CX=260,CY=170,R=130;
const at=(deg,r=R,cx=CX,cy=CY)=>[cx+r*Math.cos(rad(deg)),cy-r*Math.sin(rad(deg))];
const dot=(p,t,c=ink,off=16)=>{const dx=p[0]-CX,dy=p[1]-CY,L=Math.hypot(dx,dy)||1;return `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${c}"/>`+(t?T(p[0]+dx/L*off,p[1]+dy/L*off+5,t,`font-size="14" font-weight="700" fill="${c}"`):'')};
const seg=(p,q,c=ink,w=2.5,d='')=>`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${c}" stroke-width="${w}" ${d?`stroke-dasharray="${d}"`:''}/>`;
function angAt(v,p,q){const a=Math.atan2(p[1]-v[1],p[0]-v[0]),b=Math.atan2(q[1]-v[1],q[0]-v[0]);let d=Math.abs(a-b);if(d>Math.PI)d=2*Math.PI-d;return d*180/Math.PI}
function arcMark(v,p,q,r,c){const a=Math.atan2(p[1]-v[1],p[0]-v[0]),b=Math.atan2(q[1]-v[1],q[0]-v[0]);let d=b-a;while(d<=-Math.PI)d+=2*Math.PI;while(d>Math.PI)d-=2*Math.PI;return `<path d="M${v[0]} ${v[1]} L${v[0]+r*Math.cos(a)} ${v[1]+r*Math.sin(a)} A${r} ${r} 0 0 ${d>0?1:0} ${v[0]+r*Math.cos(b)} ${v[1]+r*Math.sin(b)} Z" fill="${c}" fill-opacity=".25" stroke="${c}" stroke-width="2"/>`}
const circ=(c=ink)=>`<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${c}" stroke-width="2.5"/><circle cx="${CX}" cy="${CY}" r="3.5" fill="${ink}"/>`;
function heroDraw(){return `<circle cx="170" cy="75" r="60" fill="none" stroke="#fff" stroke-width="3"/><line x1="120" y1="108" x2="220" y2="108" stroke="#fff" stroke-width="2"/><line x1="120" y1="108" x2="190" y2="18" stroke="#fff" stroke-width="2"/><line x1="220" y1="108" x2="190" y2="18" stroke="#fff" stroke-width="2"/><line x1="120" y1="108" x2="140" y2="23" stroke="#fff" stroke-width="2" opacity=".6"/><line x1="220" y1="108" x2="140" y2="23" stroke="#fff" stroke-width="2" opacity=".6"/>`}
const HERO=heroDraw;
const MIND=[['Parts of a circle',100,50],['Equal chords, equal angles',420,50],['Perpendicular bisects chord',90,150],['Equal chords equidistant',430,150],['Angle at centre = 2×',110,250],['Cyclic quadrilaterals',410,250]];
/* fig helpers on a smaller circle */
const sCX=260,sCY=115,sR=90;const sat=d=>[sCX+sR*Math.cos(rad(d)),sCY-sR*Math.sin(rad(d))];
const scirc=`<circle cx="${sCX}" cy="${sCY}" r="${sR}" fill="none" stroke="${ink}" stroke-width="2.5"/><circle cx="${sCX}" cy="${sCY}" r="3.5" fill="${ink}"/>`;
const L=(p,q,c=ink,w=2.5,d='')=>`<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="${c}" stroke-width="${w}" ${d?`stroke-dasharray="${d}"`:''}/>`;

const C=[
{id:'c1',num:'9.1',title:'Parts of a circle',
 intro:'A pizza cut into slices shows many parts of a circle. Can you name them?',
 obj:'Recall the terms related to a circle.',
 prior:'Class 6: circles.',
 simple:'A circle is the set of all points in a plane at a fixed distance (radius) from a fixed point (centre). A chord joins two points on the circle; the longest chord is a diameter (= 2 × radius). An arc is a piece of the circle; a semicircle is half the circle. A segment is the region between a chord and its arc; a sector is the region between two radii and an arc.',
 detail:'Minor arc and major arc; minor segment and major segment; minor and major sector. A point can lie inside, on or outside the circle. Circles with equal radii are congruent.',
 real:'A pizza slice is a sector; the crust between two cut ends is an arc.',
 apply:'Draw a circle and mark a chord, a diameter, a minor sector and a major segment.',
 see:{w:520,h:230,f:[
  ['A circle with centre O.',scirc+lbl(sCX+12,sCY+4,'O')],
  ['Radius, chord, diameter.',L([sCX,sCY],sat(60),BL)+lbl(300,70,'radius','fill="'+BL+'"')+L(sat(200),sat(330),OR)+lbl(250,175,'chord','fill="'+OR+'"')+L(sat(110),sat(290),GN)+lbl(208,60,'diameter','fill="'+GN+'"')],
  ['Sector and segment.',`<path d="M${sCX} ${sCY} L${sat(0)[0]} ${sat(0)[1]} A${sR} ${sR} 0 0 0 ${sat(50)[0]} ${sat(50)[1]} Z" fill="${PU}" fill-opacity=".3"/>`+lbl(395,95,'sector','fill="'+PU+'"')+`<path d="M${sat(200)[0]} ${sat(200)[1]} A${sR} ${sR} 0 0 0 ${sat(330)[0]} ${sat(330)[1]} Z" fill="${OR}" fill-opacity=".2"/>`+lbl(260,225,'minor segment below the chord','fill="'+OR+'"')]]},
 seeNote:'Know the parts.',
 do:{title:'Pizza parts',mat:'Paper circle, scissors',steps:['Cut a sector and a segment.','Label each.'],obs:'Different shapes.',why:'Parts of a circle.',lab:false},
 memo:'"Sector = slice; segment = chord + arc."',
 miscon:['"A segment and a sector are the same." A sector is bounded by two radii; a segment by a chord.'],
 terms:['Centre','Radius','Chord','Diameter','Arc','Segment','Sector'],
 q:{q:'The longest chord of a circle is the:',o:['radius','diameter','arc','tangent'],a:1,why:'Passes through the centre.'},
 exam:'Terms: 1 mark.'},

{id:'c2',num:'9.2',title:'Equal chords subtend equal angles at the centre',
 intro:'Two equal sticks fitted as chords in a ring: do they make the same angle at the centre?',
 obj:'Prove and use: equal chords subtend equal angles at the centre, and conversely.',
 prior:'Chapter 7: congruence.',
 simple:'Theorem 9.1: equal chords of a circle subtend equal angles at the centre. Theorem 9.2 (converse): if the angles subtended by two chords at the centre are equal, the chords are equal.',
 detail:'Proof of 9.1: chords AB = CD, centre O. In △AOB and △COD: OA = OC, OB = OD (radii) and AB = CD, so the triangles are congruent (SSS) and ∠AOB = ∠COD (CPCT). The converse is proved by SAS.',
 real:'Equally spaced spokes in a wheel make equal angles at the hub and cut off equal chords on the rim.',
 apply:'In a circle, chord AB subtends 70° at the centre and chord CD equals AB. Find ∠COD.',
 see:{w:520,h:230,f:[
  ['Circle.',scirc],
  ['Two equal chords.',L(sat(60),sat(140),BL)+L(sat(220),sat(300),OR)],
  ['Equal angles at O.',L([sCX,sCY],sat(60),BL,1.5)+L([sCX,sCY],sat(140),BL,1.5)+L([sCX,sCY],sat(220),OR,1.5)+L([sCX,sCY],sat(300),OR,1.5)+lbl(sCX,sCY-22,'80°','fill="'+BL+'"')+lbl(sCX,sCY+30,'80°','fill="'+OR+'"')]]},
 seeNote:'Equal chords ⇔ equal central angles.',
 do:{title:'Fold check',mat:'Paper circle',steps:['Draw two equal chords.','Join to the centre and measure.'],obs:'Equal angles.',why:'Theorem 9.1.',lab:false},
 memo:'"Same chord length, same centre angle."',
 miscon:['"Longer chords make smaller central angles." Longer chords make larger central angles.'],
 terms:['Subtend','Central angle'],
 q:{q:'Equal chords subtend at the centre angles that are:',o:['supplementary','equal','complementary','unrelated'],a:1,why:'Theorem 9.1.'},
 exam:'Theorem 9.1 proof: 3 marks.'},

{id:'c3',num:'9.3',title:'Perpendicular from the centre to a chord',
 intro:'How can you find the centre of a round plate using only a ruler and a set square?',
 obj:'Prove and use: the perpendicular from the centre to a chord bisects it, and conversely.',
 prior:'9.2; RHS congruence.',
 simple:'Theorem 9.3: the perpendicular from the centre of a circle to a chord bisects the chord. Theorem 9.4 (converse): the line drawn through the centre to bisect a chord is perpendicular to the chord.',
 detail:'Proof of 9.3: OM ⊥ AB. In △OMA and △OMB: OA = OB (radii), OM common, ∠OMA = ∠OMB = 90°, so △OMA ≅ △OMB (RHS) and AM = BM. Using Baudhayana–Pythagoras: half-chord² + distance² = radius². A chord 8 cm long in a circle of radius 5 cm is 3 cm from the centre.',
 real:'To find a broken wheel\'s centre: draw two chords, their perpendicular bisectors meet at the centre.',
 apply:'A chord of length 24 cm is 5 cm from the centre. Find the radius.',
 see:{w:520,h:230,f:[
  ['A chord AB.',scirc+L(sat(210),sat(330),OR)+lbl(sat(210)[0]-12,sat(210)[1]+14,'A')+lbl(sat(330)[0]+12,sat(330)[1]+14,'B')],
  ['Perpendicular from O.',L([sCX,sCY],[sCX,sat(210)[1]],BL)+`<rect x="${sCX}" y="${sat(210)[1]-12}" width="12" height="12" fill="none" stroke="${BL}"/>`+lbl(sCX+10,sat(210)[1]+16,'M')],
  ['AM = MB.',lbl(220,214,'AM = MB','font-weight="700" fill="'+OR+'"')+lbl(400,214,'r² = d² + (½ chord)²','font-size="12"')]]},
 seeNote:'Perpendicular from the centre halves the chord.',
 do:{title:'Find the centre',mat:'Circular lid, paper',steps:['Trace the lid; draw two chords.','Draw their perpendicular bisectors.'],obs:'They meet at the centre.',why:'Theorem 9.4.',lab:true},
 memo:'"Drop a perpendicular from O — it cuts the chord in half."',
 miscon:['"Any line from the centre bisects a chord." Only the perpendicular (or the line through the midpoint).'],
 terms:['Perpendicular bisector','Distance from centre'],
 q:{q:'Radius 13 cm, chord 24 cm. Distance from centre:',o:['5 cm','12 cm','11 cm','7 cm'],a:0,why:'√(169 − 144).'},
 exam:'Theorem 9.3; chord-distance problems: 3 marks.'},

{id:'c4',num:'9.4',title:'Equal chords and their distances from the centre',
 intro:'Are all equal chords the same distance from the centre?',
 obj:'Prove and use: equal chords are equidistant from the centre, and conversely.',
 prior:'9.3.',
 simple:'Theorem 9.5: equal chords of a circle (or of congruent circles) are equidistant from the centre. Theorem 9.6 (converse): chords equidistant from the centre are equal in length. Also, the longer the chord, the nearer it is to the centre.',
 detail:'The distance of a chord from the centre is the length of the perpendicular from the centre to the chord. Proof idea: with OL ⊥ AB and OM ⊥ CD, AL = ½AB = ½CD = CM, and OA = OC, so △OLA ≅ △OMC (RHS), giving OL = OM.',
 real:'Spokes of the same length in a round table meet the edge in chords that are equally far from the centre.',
 apply:'Two equal chords AB and CD intersect at E. Prove that AE = DE using the theorem.',
 see:{w:520,h:230,f:[
  ['Two equal chords.',scirc+L(sat(30),sat(150),BL)+L(sat(210),sat(330),BL)],
  ['Their distances.',L([sCX,sCY],[sCX,sat(30)[1]],OR)+L([sCX,sCY],[sCX,sat(210)[1]],OR)],
  ['Equal distances.',lbl(sCX+24,(sCY+sat(30)[1])/2+4,'d','fill="'+OR+'" font-weight="700"')+lbl(sCX+24,(sCY+sat(210)[1])/2+4,'d','fill="'+OR+'" font-weight="700"')+lbl(420,214,'equal chords ⇔ equal distances','font-weight="700"')]]},
 seeNote:'Same length ⇔ same distance.',
 do:{title:'Measure distances',mat:'Compass, ruler, set square',steps:['Draw three equal chords.','Measure each distance from O.'],obs:'Equal.',why:'Theorem 9.5.',lab:false},
 memo:'"Equal chords sit at equal distances."',
 miscon:['"A chord farther from the centre is longer." It is shorter.'],
 terms:['Equidistant','Distance of a chord'],
 q:{q:'Chords at equal distances from the centre are:',o:['equal','parallel','perpendicular','diameters'],a:0,why:'Theorem 9.6.'},
 exam:'Equal chords theorems: 2–3 marks.'},

{id:'c5',num:'9.5',title:'Angle subtended by an arc',
 intro:'From the goalpost, a football shot can be taken from anywhere on an arc. Is the angle the same everywhere?',
 obj:'Use: the angle at the centre is double the angle at the circumference; angles in the same segment are equal; the angle in a semicircle is 90°.',
 prior:'9.2.',
 simple:'Theorem 9.7: the angle subtended by an arc at the centre is double the angle subtended by it at any point on the remaining part of the circle. Theorem 9.8: angles in the same segment of a circle are equal. Special case: the angle in a semicircle is a right angle (central angle 180° → inscribed angle 90°).',
 detail:'Proof of 9.7: join P to O and extend. Using isosceles triangles (OA = OP) and the exterior angle property, ∠AOB = 2∠APB. Converse (Theorem 9.9): if a line segment joining two points subtends equal angles at two other points on the same side, the four points are concyclic.',
 real:'Architects use the semicircle property to make right angles from a circular template.',
 apply:'∠AOB = 100° at the centre. Find ∠APB for P on the major arc, and for P on the minor arc.',
 see:{w:520,h:240,f:[
  ['Arc AB and centre angle.',scirc+L([sCX,sCY],sat(230),OR)+L([sCX,sCY],sat(310),OR)+lbl(sCX,sCY+28,'2x','fill="'+OR+'" font-weight="700"')],
  ['Angle at P on the circle.',L(sat(100),sat(230),BL)+L(sat(100),sat(310),BL)+lbl(sat(100)[0]-4,sat(100)[1]+30,'x','fill="'+BL+'" font-weight="700"')+lbl(sat(100)[0]-6,sat(100)[1]-10,'P')],
  ['Another P: same angle.',L(sat(60),sat(230),GN)+L(sat(60),sat(310),GN)+lbl(sat(60)[0]+6,sat(60)[1]+26,'x','fill="'+GN+'" font-weight="700"')+lbl(420,232,'centre angle = 2 × circumference angle','font-weight="700" font-size="12"')]]},
 seeNote:'Same arc, same angle on the circle; double at the centre.',
 do:{title:'Semicircle right angle',mat:'Compass, set square',steps:['Draw a diameter AB; pick points P on the circle.','Measure ∠APB.'],obs:'Always 90°.',why:'Angle in a semicircle.',lab:true},
 memo:'"Centre gets double; same segment, same angle; semicircle gives 90."',
 miscon:['"The angle at the centre equals the angle at the circumference." It is double.'],
 terms:['Inscribed angle','Angle in a semicircle','Same segment','Concyclic points'],
 q:{q:'If ∠AOB = 120° at the centre, ∠APB (P on major arc) =',o:['120°','60°','240°','30°'],a:1,why:'Half.'},
 exam:'Theorem 9.7 and problems: 3–5 marks.'},

{id:'c6',num:'9.6',title:'Cyclic quadrilaterals',
 intro:'Four points on a circle form a quadrilateral. What is special about its opposite angles?',
 obj:'Prove and use: opposite angles of a cyclic quadrilateral add up to 180°.',
 prior:'9.5.',
 simple:'A quadrilateral whose four vertices lie on a circle is cyclic. Theorem 9.10: the sum of either pair of opposite angles of a cyclic quadrilateral is 180°. Theorem 9.11 (converse): if a pair of opposite angles of a quadrilateral add up to 180°, the quadrilateral is cyclic.',
 detail:'Proof: ∠A and ∠C stand on arcs that together make the whole circle; their central angles sum to 360°, so ∠A + ∠C = 180°. Consequence: an exterior angle of a cyclic quadrilateral equals the interior opposite angle. Every rectangle is cyclic; a parallelogram that is cyclic must be a rectangle.',
 real:'Wheels and round tables: any four points on the rim form a cyclic quadrilateral.',
 apply:'ABCD is cyclic with ∠A = 80° and ∠B = 110°. Find ∠C and ∠D.',
 see:{w:520,h:240,f:[
  ['Four points on a circle.',scirc+[40,140,215,300].map((d,i)=>`<circle cx="${sat(d)[0]}" cy="${sat(d)[1]}" r="5" fill="${ink}"/>`+lbl(sat(d)[0]+(Math.cos(rad(d))*14),sat(d)[1]-(Math.sin(rad(d))*14)+5,'ABCD'[i])).join('')],
  ['A cyclic quadrilateral.',`<polygon points="${[40,140,215,300].map(d=>sat(d).map(v=>v.toFixed(1)).join(',')).join(' ')}" fill="${PU}" fill-opacity=".12" stroke="${PU}" stroke-width="2.5"/>`],
  ['Opposite angles sum to 180°.',lbl(430,214,'∠A + ∠C = 180°','font-weight="700" fill="'+OR+'"')+lbl(430,232,'∠B + ∠D = 180°','font-weight="700" fill="'+BL+'"')]]},
 seeNote:'Opposite angles are supplementary.',
 do:{title:'Measure a cyclic quad',mat:'Compass, protractor',steps:['Mark four points on a circle; join them.','Measure opposite angles.'],obs:'Pairs add to 180°.',why:'Theorem 9.10.',lab:true},
 memo:'"Cyclic: opposite angles make a straight angle."',
 miscon:['"All quadrilaterals are cyclic." Only those whose opposite angles add to 180°.'],
 terms:['Cyclic quadrilateral','Concyclic','Exterior angle'],
 q:{q:'In cyclic ABCD, ∠A = 70°. ∠C =',o:['70°','110°','20°','290°'],a:1,why:'180 − 70.'},
 exam:'Cyclic quadrilateral problems: 3 marks.'}
];

const CARDS=[['Chord','Joins two points on a circle.'],['Diameter','Longest chord = 2r.'],['Segment vs sector','Chord + arc vs two radii + arc.'],['Equal chords','Equal angles at centre; equidistant.'],['Perpendicular from O','Bisects the chord.'],['r² = d² + (½c)²','Chord–distance relation.'],['Angle at centre','= 2 × angle at circumference.'],['Same segment','Equal angles.'],['Semicircle','Angle = 90°.'],['Cyclic quadrilateral','Opposite angles sum to 180°.'],['Exterior angle (cyclic)','= interior opposite angle.']];

const Q=[
 {lv:1,q:'A chord passing through the centre is a:',o:['radius','diameter','tangent','secant'],a:1,w:'Definition.'},
 {lv:1,q:'Angle in a semicircle:',o:['45°','60°','90°','180°'],a:2,w:'Theorem.'},
 {lv:1,q:'Opposite angles of a cyclic quadrilateral sum to:',o:['90°','180°','270°','360°'],a:1,w:'Theorem 9.10.'},
 {lv:2,q:'Radius 5 cm, chord 8 cm. Distance from centre:',o:['3 cm','4 cm','6 cm','2 cm'],a:0,w:'√(25 − 16).'},
 {lv:2,q:'∠AOB = 90°. ∠ACB (C on major arc) =',o:['90°','45°','180°','135°'],a:1,w:'Half.'},
 {lv:2,q:'Equal chords are ___ from the centre:',o:['at different distances','equidistant','at zero distance','always 1 cm'],a:1,w:'Theorem 9.5.'},
 {lv:3,q:'Cyclic ABCD: ∠B = 115°. ∠D =',o:['65°','115°','245°','75°'],a:0,w:'180 − 115.'},
 {lv:3,q:'Chord 24 cm at 5 cm from centre. Radius:',o:['13 cm','12 cm','17 cm','19 cm'],a:0,w:'√(144 + 25).'},
 {lv:4,q:'∠ABC = 69° and ∠ACB = 31° in a circle with BC a chord and A on the circle; ∠BDC (D on same side as A) =',o:['69°','80°','31°','100°'],a:1,w:'∠BAC = 80°, same segment.'},
 {lv:4,q:'A cyclic parallelogram is a:',o:['rhombus','rectangle','trapezium','kite'],a:1,w:'Opposite angles equal and supplementary → 90°.'},
 {lv:5,open:true,m:3,q:'Prove that the perpendicular from the centre of a circle to a chord bisects the chord.',ans:['OM ⊥ AB; join OA, OB (1)','△OMA ≅ △OMB by RHS (1)','AM = BM by CPCT (1)']},
 {lv:5,open:true,m:5,q:'Prove that the opposite angles of a cyclic quadrilateral are supplementary. Hence find all angles of cyclic ABCD if ∠A = 3x, ∠C = x + 20°, ∠B = 95°.',ans:['∠A = ½ reflex/central angles; ∠A + ∠C = ½ × 360° (2)','= 180° (1)','4x + 20 = 180 → x = 40 → ∠A = 120°, ∠C = 60° (1)','∠D = 85° (1)']}
];

const ONEMIN=['Parts of a circle.','Equal chords ⇔ equal central angles.','Perpendicular from centre bisects chord.','Equal chords ⇔ equidistant.','Centre angle = 2 × circumference angle; semicircle 90°.','Cyclic quadrilateral: opposite angles 180°.'];
const KEYS=[['parts',/chord|arc|sector|segment/i],['equal chords',/equal chords/i],['perpendicular',/perpendicular|bisect/i],['equidistant',/equidistant|distance/i],['angle at centre',/centre|semicircle|double/i],['cyclic',/cyclic/i]];

/* ---------- lab ---------- */
let mode='a',v=[200,340,90,140],wired=false;
function drawA(){const A=at(v[0]),B=at(v[1]),P=at(v[2]);const O=[CX,CY];
 let central=((v[1]-v[0])%360+360)%360;/* arc from A ccw to B */
 const pIn=((v[2]-v[0])%360+360)%360<central;/* P on arc A→B (ccw) */
 const arcAB=pIn?360-central:central;/* arc not containing P */
 const insc=angAt(P,A,B);let s=circ();
 const startA=pIn?v[1]:v[0],span=arcAB;let d='';for(let i=0;i<=40;i++){const p=at(startA+span*i/40);d+=(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)}s+=`<path d="${d}" fill="none" stroke="${OR}" stroke-width="6" stroke-opacity=".5"/>`;
 s+=seg(O,A,OR)+seg(O,B,OR)+seg(P,A,BL)+seg(P,B,BL);
 if(arcAB<=180)s+=arcMark(O,A,B,26,OR);s+=arcMark(P,A,B,26,BL);
 s+=dot(A,'A')+dot(B,'B')+dot(P,'P',BL)+T(CX+12,CY+18,'O','font-size="13" font-weight="700"');
 $('#ciSvg').innerHTML=s;
 const ratio=arcAB/insc;$('#ciOut').innerHTML=`<p>Arc AB (not containing P) = <b>${arcAB.toFixed(0)}°</b> → angle at the centre ∠AOB = ${arcAB.toFixed(0)}°${arcAB>180?' (reflex)':''}.</p><p>Angle at P: ∠APB = <b>${insc.toFixed(1)}°</b>. Ratio = ${isFinite(ratio)?ratio.toFixed(2):'—'} → the centre angle is <b>double</b>.</p><p>${Math.abs(arcAB-180)<1?'AB is a diameter: the angle in a semicircle is 90°!':'Move P along the same arc: ∠APB stays the same (angles in the same segment).'}</p>`}
function drawQ(){const ds=[...v].sort((a,b)=>a-b);const P4=ds.map(d=>at(d));let s=circ()+`<polygon points="${P4.map(p=>p.map(x=>x.toFixed(1)).join(',')).join(' ')}" fill="${PU}" fill-opacity=".1" stroke="${PU}" stroke-width="2.5"/>`;
 const angs=P4.map((p,i)=>angAt(p,P4[(i+3)%4],P4[(i+1)%4]));const cols=[OR,BL,OR,BL];P4.forEach((p,i)=>s+=arcMark(p,P4[(i+3)%4],P4[(i+1)%4],22,cols[i])+dot(p,'ABCD'[i],cols[i]));
 $('#ciSvg').innerHTML=s;$('#ciOut').innerHTML=`<p>∠A + ∠C = ${angs[0].toFixed(1)}° + ${angs[2].toFixed(1)}° = <b>${(angs[0]+angs[2]).toFixed(1)}°</b></p><p>∠B + ∠D = ${angs[1].toFixed(1)}° + ${angs[3].toFixed(1)}° = <b>${(angs[1]+angs[3]).toFixed(1)}°</b></p><p>Opposite angles of a cyclic quadrilateral always add up to 180°.</p>`}
function draw(){const labs=mode==='a'?['Point A','Point B','Point P']:['Vertex 1','Vertex 2','Vertex 3','Vertex 4'];[1,2,3].forEach(i=>$('#ciL'+i).innerHTML=`${labs[i-1]}: <b>${v[i-1]}°</b>`);$('#ciQ4').style.display=mode==='q'?'':'none';if(mode==='q')$('#ciL4').innerHTML=`${labs[3]}: <b>${v[3]}°</b>`;mode==='a'?drawA():drawQ()}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const el=e.target;if(!el||!el.classList||!el.classList.contains('ciS'))return;v[+el.id.slice(2)-1]=+el.value;draw()})}
function labClick(){return false}
function labChange(el){if(el.id==='ciM'){mode=el.value;v=mode==='a'?[200,340,90,140]:[30,120,200,300];[1,2,3,4].forEach(i=>$('#ci'+i).value=v[i-1]);draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
