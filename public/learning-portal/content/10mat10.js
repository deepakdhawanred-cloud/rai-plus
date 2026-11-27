/* Rai Plus content pack: Class 10 Mathematics, Chapter 10 – Circles */
RP.register({key:'10mat10',cls:'10',subject:'Mathematics',ch:'10',title:"Circles",color:'#2e4f8a',
crumb:"HBSE Class 10 Mathematics · Unit: Geometry · Taught in November",h1:"Chapter 10: Circles",sub:"Tangents: the lines that just touch a circle, why they meet the radius at a right angle, and why two tangents from one point are always equal.",heroLabel:"A circle with two tangents drawn from an outside point",labName:"Tangent lab",
theme:"\n:root{--g:light-dark(#2e4f8a,#9bb8ea);--g2:light-dark(#ecf1fa,#121b2b);--line:light-dark(#d3ddef,#26344d);--bg:light-dark(#ffffff,#0c1119);--card:light-dark(#ffffff,#111826);\n--ink:light-dark(#101827,#e5ebf5);--mute:light-dark(#4f5d75,#a5b2c8);--y:light-dark(#d07a2a,#eaa767);--y2:light-dark(#fcf0e3,#2a1d10);--hd:#1d3561}\n",
labHTML:`  <h2>Tangent lab</h2>
  <p>Drag the point P anywhere outside the circle. The two tangents, their lengths and the angles update as you move it.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="tg" viewBox="0 0 520 420" role="img" aria-label="Circle with tangents from a draggable point P" style="color:var(--ink);touch-action:none"></svg></div></div>
  <div><div class="ctrl"><label>Radius r<input type="range" id="tr" min="50" max="130" value="90"></label><label style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" id="tShow" checked style="width:22px;height:22px"> Show radii and right angles</label></div>
  <div class="box y" id="tOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#2e4f8a',LABNAME='Tangent lab',MIND_CENTER='Circles';
const O=[260,120],ink='currentColor',OR='#d07a2a',BL='#2e4f8a';
const circ=(x,y,r,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${ink}" stroke-width="2" ${extra}/>`;
const ln=(x1,y1,x2,y2,c=ink,w=2,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" ${extra}/>`;
const pt=(x,y,l,dx=8,dy=-8)=>`<circle cx="${x}" cy="${y}" r="4" fill="${ink}"/>`+T(x+dx,y+dy,l,'font-size="14" font-weight="700"');
function tangentPts(cx,cy,r,px,py){const d=Math.hypot(px-cx,py-cy),a=Math.atan2(py-cy,px-cx),b=Math.acos(r/d);return[[cx+r*Math.cos(a+b),cy+r*Math.sin(a+b)],[cx+r*Math.cos(a-b),cy+r*Math.sin(a-b)]]}
function heroDraw(){const [A,B]=tangentPts(110,62,40,300,62);return circ(110,62,40,'stroke="#fff"')+ln(300,62,A[0],A[1],'#fff')+ln(300,62,B[0],B[1],'#fff')+`<circle cx="300" cy="62" r="4" fill="#eaa767"/><circle cx="110" cy="62" r="3" fill="#fff"/>`}
const HERO=heroDraw;
const MIND=[['Lines and a circle',90,60],['Tangent ⊥ radius',430,60],['Number of tangents',90,230],['Equal tangents',430,230]];

const C=[
{id:'g1',num:'10.1',title:'A circle and a line: non-intersecting, secant, tangent',
 intro:'Slide a ruler across a coin. It can miss the coin, cut across it, or just touch it at one point.',
 obj:'Classify a line as non-intersecting, a secant or a tangent according to its common points with a circle.',
 prior:'Circle, radius, chord (Class 9).',
 simple:'A line and a circle can meet in 0, 1 or 2 points. No common point: non-intersecting line. Two common points: a secant. Exactly one common point: a tangent. The common point of a tangent and the circle is called the point of contact.',
 detail:'Given a circle and a line in the same plane, there are three possibilities. (i) The line does not touch the circle: it is non-intersecting with respect to the circle. (ii) The line meets the circle in two points: it is a secant. (iii) The line meets the circle in exactly one point: it is a tangent, and the common point is the point of contact. The word "tangent" comes from the Latin "tangere", to touch. A tangent can be thought of as a special case of a secant in which the two end points of its chord coincide.',
 real:'A bicycle wheel rolling on a straight road touches the road at only one point at a time: the road is a tangent to the wheel.',
 apply:'How many tangents can a circle have? Explain using the idea that every point on the circle has one.',
 see:{w:520,h:240,f:[
  ['A line that misses the circle: non-intersecting.',circ(260,130,70)+ln(40,30,480,30,'#888780',2,'stroke-dasharray="6 4"')+T(60,22,'no common point','font-size="12" text-anchor="start"')],
  ['A line that cuts it twice: a secant.',ln(40,110,480,150,BL,2.5)+T(60,100,'secant: two points','font-size="12" text-anchor="start"')],
  ['A line that just touches it once: a tangent at the point of contact.',ln(40,200,480,200,OR,2.5)+`<circle cx="260" cy="200" r="5" fill="${OR}"/>`+T(330,224,'tangent: one point','font-size="12" text-anchor="start"')]]},
 seeNote:'The tangent at the bottom touches the circle at exactly one point.',
 do:{title:'Rotate a secant into a tangent',mat:'A circle drawn on paper, a straight wire or thin stick, a pin',steps:['Pin the stick at a point outside the circle so it crosses the circle (a secant).','Rotate it slowly away from the centre.','Watch the two crossing points come closer.'],obs:'At one position the two points merge into one: the stick is now a tangent.',why:'A tangent is the limiting position of a secant when its two points coincide.',lab:false},
 memo:'"0 miss, 1 touch (tangent), 2 cut (secant)."',
 miscon:['"A tangent can touch the circle at two points." By definition it touches at exactly one point.','"A secant is the same as a chord." A chord is a segment inside the circle; a secant is the whole line.'],
 terms:['Non-intersecting line','Secant','Tangent','Point of contact'],
 q:{q:'A line that meets a circle at exactly two points is called a:',o:['Tangent','Secant','Radius','Diameter'],a:1,why:'Two common points make a secant.'},
 exam:'1-mark fill-in-the-blank and MCQ questions on these definitions are common.'},
{id:'g2',num:'10.2',title:'The tangent is perpendicular to the radius',
 intro:'Of all the line segments from the centre to a tangent line, which one is the shortest?',
 obj:'State and prove Theorem 10.1: the tangent at any point of a circle is perpendicular to the radius through the point of contact.',
 prior:'The perpendicular is the shortest distance from a point to a line (Class 9).',
 simple:'At the point where a tangent touches a circle, the tangent and the radius meet at exactly 90°. Every other point of the tangent lies outside the circle, so the radius to the point of contact is the shortest distance from the centre to the tangent line, and the shortest distance is always the perpendicular.',
 detail:'Theorem 10.1: The tangent at any point of a circle is perpendicular to the radius through the point of contact. Proof: Let XY be the tangent at P to the circle with centre O. Take any point Q on XY other than P and join OQ. Q must lie outside the circle (if it were inside, XY would be a secant). So OQ is longer than the radius OP: OQ > OP. This is true for every point of XY except P, so OP is the shortest of all distances from O to the points of XY. Hence OP is perpendicular to XY. Remarks: by this theorem there is only one tangent at any point of a circle, and the line through the point of contact containing the radius is sometimes called the normal to the circle at that point.',
 real:'When you swing a stone on a string and let go, it flies off along the tangent, at right angles to the string.',
 apply:'A tangent PQ at a point P of a circle of radius 5 cm meets a line through the centre O at Q so that OQ = 12 cm. Find PQ.',
 see:{w:520,h:240,f:[
  ['A tangent XY touching the circle at P; O is the centre.',circ(260,100,70)+ln(80,170,440,170,OR,2.5)+pt(260,100,'O')+pt(260,170,'P',8,22)],
  ['Any other point Q of the tangent is outside the circle, so OQ > OP.',ln(260,100,380,170,'#888780',2,'stroke-dasharray="5 4"')+pt(380,170,'Q',8,22)],
  ['So OP is the shortest distance: OP ⊥ XY.',ln(260,100,260,170,BL,2.5)+`<path d="M260 158 H272 V170" fill="none" stroke="${BL}" stroke-width="1.5"/>`+T(400,40,'OP ⊥ XY','font-weight="700"')]]},
 seeNote:'Try it in the Tangent lab: the right angle stays wherever P is.',
 do:{title:'Check with a set square',mat:'Compass, ruler, set square',steps:['Draw a circle and mark a point P on it.','Draw the radius OP.','Using the set square, draw a line through P at 90° to OP.','Check that this line touches the circle only at P.'],obs:'The perpendicular to the radius at P touches the circle at exactly one point.',why:'That perpendicular is the tangent at P.',lab:false},
 memo:'"Radius meets tangent: right angle, always."',
 miscon:['"Any line through P is a tangent." Only the line perpendicular to OP is.','"There can be two tangents at one point." There is exactly one.'],
 terms:['Theorem 10.1','Point of contact','Normal','Perpendicular distance'],
 q:{q:'The angle between a tangent and the radius at the point of contact is:',o:['60°','45°','90°','180°'],a:2,why:'Theorem 10.1.'},
 exam:'The proof of Theorem 10.1 is a frequently asked 3-mark question.'},
{id:'g3',num:'10.3',title:'Number of tangents from a point',
 intro:'Stand inside a circular park, on its fence, and outside it. From where can you draw a line that only grazes the fence?',
 obj:'State how many tangents can be drawn to a circle from a point inside, on and outside it, and find tangent lengths.',
 prior:'Theorem 10.1; Pythagoras theorem.',
 simple:'From a point inside the circle: no tangent. From a point on the circle: exactly one tangent. From a point outside the circle: exactly two tangents. The length of a tangent from an outside point P is the distance from P to the point of contact.',
 detail:'Case 1: P inside the circle — every line through P cuts the circle in two points, so no tangent can be drawn. Case 2: P on the circle — there is exactly one tangent through P. Case 3: P outside the circle — there are exactly two tangents from P. If the tangent from P touches the circle at T, then PT is called the length of the tangent from P. Since OT ⊥ PT, triangle OTP is right-angled at T, so PT = √(OP² − OT²) = √(d² − r²), where d is the distance of P from the centre and r is the radius.',
 real:'A pulley belt running over a wheel leaves it along tangents; two belts from one point on the frame leave the wheel along the two tangents.',
 apply:'The length of a tangent from a point A at distance 5 cm from the centre of a circle is 4 cm. Find the radius.',
 see:{w:520,h:240,f:[
  ['P inside: every line through P is a secant. No tangent.',circ(110,120,60)+pt(110,135,'P')+T(110,215,'0 tangents','font-size="13"')],
  ['P on the circle: exactly one tangent.',circ(260,120,60)+ln(200,180,320,180,OR,2.5)+pt(260,180,'P',8,20)+T(260,215,'1 tangent','font-size="13"')],
  ['P outside: exactly two tangents.',(()=>{const[A,B]=tangentPts(410,120,50,500,120);return circ(410,120,50)+ln(500,120,A[0],A[1],OR,2.5)+ln(500,120,B[0],B[1],OR,2.5)+pt(500,120,'P',-4,-12)+T(420,215,'2 tangents','font-size="13"')})()]]},
 seeNote:'Length of tangent: PT = √(d² − r²).',
 do:{title:'Measure a tangent',mat:'Compass, ruler, set square',steps:['Draw a circle of radius 3 cm with centre O; mark P with OP = 5 cm.','Draw a tangent from P (use the set square at the point of contact).','Measure PT.'],obs:'PT is about 4 cm.',why:'PT = √(5² − 3²) = 4 cm.',lab:false},
 memo:'"Inside 0, on 1, outside 2."',
 miscon:['"From an outside point there are many tangents." There are exactly two.','"Tangent length is the distance from P to the centre." It is from P to the point of contact.'],
 terms:['Length of tangent','External point','Point of contact'],
 q:{q:'How many tangents can be drawn from a point outside a circle?',o:['0','1','2','Infinitely many'],a:2,why:'Exactly two.'},
 exam:'Tangent-length numericals using Pythagoras are common 2-mark questions.'},
{id:'g4',num:'10.3',title:'Tangents from an external point are equal',
 intro:'Draw two tangents from a point P. Measure them. Try again from a different point. What do you notice?',
 obj:'State and prove Theorem 10.2 and use it to solve problems, including quadrilaterals circumscribing a circle.',
 prior:'Theorem 10.1; RHS congruence (Class 9).',
 simple:'The two tangents drawn from an outside point to a circle are always equal in length. They are also equally inclined to the line joining the point to the centre.',
 detail:'Theorem 10.2: The lengths of tangents drawn from an external point to a circle are equal. Proof: Let PQ and PR be tangents from P to a circle with centre O. Join OP, OQ and OR. Then ∠OQP = ∠ORP = 90° (Theorem 10.1). In right triangles OQP and ORP: OQ = OR (radii) and OP = OP (common). So △OQP ≅ △ORP (RHS), giving PQ = PR (CPCT). It also follows that ∠OPQ = ∠OPR, so the centre lies on the bisector of the angle between the two tangents. Useful results: the angle between the two tangents and the angle subtended by the points of contact at the centre add up to 180°; and for a quadrilateral ABCD circumscribing a circle, AB + CD = AD + BC.',
 real:'The two straight parts of a belt wrapped round a single pulley and pulled to a point are always the same length.',
 apply:'A quadrilateral ABCD is drawn to circumscribe a circle. AB = 6 cm, BC = 7 cm, CD = 4 cm. Find AD.',
 see:{w:520,h:240,f:[
  ['Two tangents PQ and PR from P; join OQ, OR and OP.',(()=>{const[A,B]=tangentPts(170,120,70,430,120);return circ(170,120,70)+ln(430,120,A[0],A[1],OR,2.5)+ln(430,120,B[0],B[1],OR,2.5)+pt(430,120,'P',6,-10)+pt(A[0],A[1],'R',-4,20)+pt(B[0],B[1],'Q',-4,-10)+pt(170,120,'O',-18,-6)})()],
  ['OQ = OR (radii), OP common, right angles at Q and R: the triangles are congruent (RHS).',(()=>{const[A,B]=tangentPts(170,120,70,430,120);return ln(170,120,A[0],A[1],BL,2)+ln(170,120,B[0],B[1],BL,2)+ln(170,120,430,120,'#888780',1.5,'stroke-dasharray="5 4"')})()],
  ['So PQ = PR.',T(300,225,'PQ = PR','font-weight="700"')]]},
 seeNote:'Watch both lengths stay equal as you drag P in the lab.',
 do:{title:'Paper-fold proof',mat:'A circle with two tangents from P drawn on tracing paper',steps:['Fold the paper along the line OP.','Check whether one tangent falls exactly on the other.'],obs:'The two tangents coincide.',why:'OP is a line of symmetry: the tangents are equal and equally inclined to OP.',lab:false},
 memo:'"From one point, two tangents, twin lengths."',
 miscon:['"The tangents are equal only if P is far away." They are equal from every external point.','"AB + BC = CD + DA for a circumscribing quadrilateral." It is opposite sides: AB + CD = AD + BC.'],
 terms:['Theorem 10.2','RHS congruence','Circumscribing quadrilateral','Angle between tangents'],
 q:{q:'Two tangents TP and TQ are drawn from T to a circle with centre O. If ∠POQ = 110°, then ∠PTQ is:',o:['60°','70°','80°','90°'],a:1,why:'∠PTQ + ∠POQ = 180°, so 70°.'},
 exam:'The proof of Theorem 10.2 and the "AB + CD = AD + BC" result are high-frequency 3-mark questions.'}
];

const CARDS=[['Secant','A line meeting a circle in two points.'],['Tangent','A line meeting a circle in exactly one point.'],['Point of contact','The common point of a tangent and the circle.'],['Theorem 10.1','Tangent at any point is perpendicular to the radius through the point of contact.'],['Tangents at one point','Exactly one.'],['From a point inside','No tangent.'],['From a point outside','Exactly two tangents.'],['Length of tangent','PT = √(d² − r²).'],['Theorem 10.2','Tangents from an external point are equal.'],['Angle between tangents','∠PTQ + ∠POQ = 180°.'],['Circumscribing quadrilateral','AB + CD = AD + BC.'],['Centre and tangents','The centre lies on the bisector of the angle between two tangents.']];

const Q=[
 {lv:1,q:'A tangent to a circle intersects it in how many points?',o:['0','1','2','Infinitely many'],a:1,w:'Exactly one point.'},
 {lv:1,q:'How many tangents can a circle have?',o:['1','2','4','Infinitely many'],a:3,w:'One at every point of the circle.'},
 {lv:1,q:'True or false: a tangent can be drawn from a point inside a circle.',o:['True','False'],a:1,w:'No tangent from an inside point.'},
 {lv:1,q:'Fill in the blank: the common point of a tangent and a circle is called the ________.',o:['centre','point of contact','chord','vertex'],a:1,w:'Point of contact.'},
 {lv:2,q:'From a point Q, the length of the tangent to a circle is 24 cm and Q is 25 cm from the centre. The radius is:',o:['7 cm','12 cm','15 cm','24.5 cm'],a:0,w:'r = √(25² − 24²) = 7 cm.'},
 {lv:2,q:'The tangent at a point P of a circle meets the radius OP at an angle of:',o:['30°','60°','90°','180°'],a:2,w:'Theorem 10.1.'},
 {lv:2,q:'Tangents drawn at the ends of a diameter of a circle are:',o:['Perpendicular','Parallel','Intersecting at the centre','Equal to the diameter'],a:1,w:'Both are perpendicular to the same diameter.'},
 {lv:3,q:'If TP and TQ are tangents to a circle with centre O and ∠PTQ = 70°, then ∠POQ equals:',o:['70°','90°','110°','140°'],a:2,w:'180° − 70° = 110°.'},
 {lv:3,q:'A quadrilateral ABCD circumscribes a circle with AB = 8, BC = 9, CD = 6. AD is:',o:['5','7','11','23'],a:0,w:'AB + CD = AD + BC: 14 = AD + 9.'},
 {lv:3,q:'Two concentric circles have radii 5 cm and 3 cm. The length of a chord of the larger circle that touches the smaller one is:',o:['4 cm','6 cm','8 cm','10 cm'],a:2,w:'Half-chord = √(25 − 9) = 4, so chord = 8 cm.'},
 {lv:4,q:'Assertion (A): The tangents drawn from an external point to a circle are equal. Reason (R): The triangles formed with the centre are congruent by RHS.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'That is the proof of Theorem 10.2.'},
 {lv:4,q:'PQ is a tangent at P to a circle with centre O. If ∠OQP = 30° and OP = 5 cm, then OQ is:',o:['5 cm','10 cm','5√3 cm','2.5 cm'],a:1,w:'sin 30° = OP/OQ, so OQ = 10 cm.'},
 {lv:5,open:true,m:3,q:'Prove that the tangent at any point of a circle is perpendicular to the radius through the point of contact.',ans:['Take tangent XY at P and any other point Q on XY; join OQ (1).','Q lies outside the circle, so OQ > OP for every such Q (1).','OP is the shortest distance from O to XY, so OP ⊥ XY (1).']},
 {lv:5,open:true,m:3,q:'Prove that the lengths of tangents drawn from an external point to a circle are equal.',ans:['Join OP, OQ, OR; ∠OQP = ∠ORP = 90° (1).','OQ = OR (radii), OP common (1).','△OQP ≅ △ORP (RHS), so PQ = PR (CPCT) (1).']},
 {lv:5,open:true,m:3,q:'Prove that a parallelogram circumscribing a circle is a rhombus.',ans:['Using equal tangents: AB + CD = AD + BC (1).','In a parallelogram AB = CD and AD = BC, so 2AB = 2BC (1).','AB = BC, so all sides are equal: a rhombus (1).']},
 {lv:5,open:true,m:3,q:'Prove that the angle between the two tangents from an external point is supplementary to the angle subtended by the line segment joining the points of contact at the centre.',ans:['In quadrilateral OPTQ, ∠OPT = ∠OQT = 90° (1).','Angle sum of a quadrilateral is 360° (1).','So ∠PTQ + ∠POQ = 180° (1).']}
];

const ONEMIN=['A line meets a circle in 0, 1 (tangent) or 2 (secant) points.','Theorem 10.1: tangent ⊥ radius at the point of contact.','Exactly one tangent at a point on the circle.','From inside: 0 tangents; on: 1; outside: 2.','Length of tangent = √(d² − r²).','Theorem 10.2: tangents from an external point are equal (RHS).','∠between tangents + ∠at centre = 180°.','Circumscribing quadrilateral: AB + CD = AD + BC.'];
const KEYS=[['tangent',/tangent/i],['secant',/secant/i],['point of contact',/contact/i],['perpendicular / 90°',/perpendic|90|⊥|right angle/i],['radius',/radius|radii/i],['two tangents from outside',/two|2/i],['equal tangents',/equal/i],['RHS congruence',/rhs|congru/i],['Pythagoras / √(d² − r²)',/pythag|√|sqrt/i],['AB + CD = AD + BC',/ab\s*\+\s*cd|opposite sides/i],['180° supplementary',/180|supplement/i]];

/* ---------- lab ---------- */
let P=[460,330],drag=false;
function labDraw(){const r=+$('#tr').value,c=[230,200],d=Math.hypot(P[0]-c[0],P[1]-c[1]),show=$('#tShow').checked;let s=circ(c[0],c[1],r)+pt(c[0],c[1],'O',-18,-6);
 if(d<=r+0.5){s+=`<circle cx="${P[0]}" cy="${P[1]}" r="9" fill="${OR}"/>`+T(P[0]+14,P[1]-10,'P','font-size="14" font-weight="700"');$('#tg').innerHTML=s;$('#tOut').innerHTML=d<r-0.5?'<p><b>P is inside the circle.</b> Every line through P is a secant: no tangent can be drawn.</p>':'<p><b>P is on the circle.</b> Exactly one tangent can be drawn here, perpendicular to OP.</p>';return}
 const[A,B]=tangentPts(c[0],c[1],r,P[0],P[1]);s+=ln(P[0],P[1],A[0],A[1],OR,3)+ln(P[0],P[1],B[0],B[1],OR,3)+ln(c[0],c[1],P[0],P[1],'#888780',1.5,'stroke-dasharray="5 4"');
 if(show){[A,B].forEach(Q=>{s+=ln(c[0],c[1],Q[0],Q[1],BL,2);const ux=(c[0]-Q[0])/r,uy=(c[1]-Q[1])/r,vx=(P[0]-Q[0]),vy=(P[1]-Q[1]),vl=Math.hypot(vx,vy),wx=vx/vl,wy=vy/vl,k=12;s+=`<path d="M${Q[0]+ux*k} ${Q[1]+uy*k} L${Q[0]+ux*k+wx*k} ${Q[1]+uy*k+wy*k} L${Q[0]+wx*k} ${Q[1]+wy*k}" fill="none" stroke="${BL}" stroke-width="1.5"/>`})}
 s+=pt(A[0],A[1],'Q',8,4)+pt(B[0],B[1],'R',8,4)+`<circle cx="${P[0]}" cy="${P[1]}" r="9" fill="${OR}" style="cursor:grab"/>`+T(P[0]+14,P[1]-10,'P','font-size="14" font-weight="700"');
 $('#tg').innerHTML=s;const L=Math.sqrt(d*d-r*r),unit=20;const ang=2*Math.asin(r/d)*180/Math.PI;
 $('#tOut').innerHTML=`<p>OP = d = ${(d/unit).toFixed(2)} cm, radius r = ${(r/unit).toFixed(2)} cm</p><p><b>PQ = PR = ${(L/unit).toFixed(2)} cm</b> = √(d² − r²)</p><p>∠QPR = ${ang.toFixed(1)}°, ∠QOR = ${(180-ang).toFixed(1)}°, sum = 180°</p><p class="note">Scale: 20 px = 1 cm.</p>`}
function labInit(){const svg=$('#tg');const pos=e=>{const b=svg.getBoundingClientRect();return[(e.clientX-b.left)*520/b.width,(e.clientY-b.top)*420/b.height]};
 svg.addEventListener('pointerdown',e=>{const p=pos(e);if(Math.hypot(p[0]-P[0],p[1]-P[1])<30){drag=true;svg.setPointerCapture(e.pointerId)}});
 svg.addEventListener('pointermove',e=>{if(!drag)return;P=pos(e).map((v,i)=>Math.max(12,Math.min(i?408:508,v)));labDraw()});svg.addEventListener('pointerup',()=>drag=false)}
function labShow(){labDraw()}
function labClick(b){return false}
function labChange(t){if(t.id==='tr'||t.id==='tShow'){labDraw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
