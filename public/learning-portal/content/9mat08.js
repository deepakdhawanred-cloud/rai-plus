/* Rai Plus content pack: Class 9 Mathematics, Chapter 8 – Quadrilaterals (rationalised NCERT: parallelogram properties, mid-point theorem) */
RP.register({key:'9mat08',cls:'9',subject:'Mathematics',ch:'8',title:"Quadrilaterals",color:'#7a3b52',
crumb:"HBSE Class 9 Mathematics · Unit: Geometry · Taught in December",h1:"Chapter 8: Quadrilaterals",sub:"Why a parallelogram's opposite sides match, why its diagonals cut each other in half, and the mid-point theorem.",heroLabel:"A parallelogram with its diagonals, and a triangle with the line joining two mid-points",labName:'Quadrilateral lab',
theme:"\n:root{--g:light-dark(#7a3b52,#e2a9be);--g2:light-dark(#f8edf1,#1e0f15);--line:light-dark(#ead3dc,#43262f);--bg:light-dark(#ffffff,#120a0d);--card:light-dark(#ffffff,#1a0f13);\n--ink:light-dark(#22111a,#f3e6ec);--mute:light-dark(#6e5260,#c8adb9);--y:light-dark(#1f6f8b,#8fd0e6);--y2:light-dark(#e6f3f8,#0c2029);--hd:#5b2a3d}\n",
labHTML:`  <h2>Quadrilateral lab</h2>
  <p>Drag the corners A, B, C, D. Or pick a shape. The lab measures sides, angles and diagonals and names the shape.</p>
  <div class="ctrl"><label>Start from<select id="qPre"><option value="par">Parallelogram</option><option value="rect">Rectangle</option><option value="rho">Rhombus</option><option value="sq">Square</option><option value="trap">Trapezium</option><option value="kite">Kite</option><option value="gen">Any quadrilateral</option></select></label><label style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" id="qMid"> Join mid-points</label><label style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" id="qDia" checked> Show diagonals</label></div>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="qSvg" viewBox="0 0 460 340" role="img" aria-label="Quadrilateral ABCD with draggable corners" style="color:var(--ink);touch-action:none"></svg></div></div>
  <div><div class="box y" id="qOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#7a3b52',LABNAME='Quadrilateral lab',MIND_CENTER='Quadrilaterals';
const MA='#7a3b52',TE='#1f6f8b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,'font-size="15" font-weight="700" '+o);
const poly=(pts,o='')=>`<path d="M${pts.map(p=>p.join(' ')).join(' L')}Z" ${o}/>`;
const tick=(a,b,n=1,c=MA)=>{const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),nx=-dy/L*7,ny=dx/L*7,tx=dx/L*4,ty=dy/L*4;let s='';for(let i=0;i<n;i++){const o=(i-(n-1)/2);s+=`<line x1="${mx+o*tx-nx}" y1="${my+o*ty-ny}" x2="${mx+o*tx+nx}" y2="${my+o*ty+ny}" stroke="${c}" stroke-width="2"/>`}return s};
const arrowMark=(a,b,n=1,c=TE)=>{const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,ang=Math.atan2(b[1]-a[1],b[0]-a[0]);let s='';for(let i=0;i<n;i++){const ox=mx+Math.cos(ang)*(i*7),oy=my+Math.sin(ang)*(i*7);s+=`<path d="M${ox-8*Math.cos(ang-0.5)} ${oy-8*Math.sin(ang-0.5)} L${ox} ${oy} L${ox-8*Math.cos(ang+0.5)} ${oy-8*Math.sin(ang+0.5)}" fill="none" stroke="${c}" stroke-width="2"/>`}return s};
const A0=[120,200],B0=[340,200],C0=[400,80],D0=[180,80];
function heroDraw(){return `<path d="M30 110 L130 110 L170 40 L70 40Z" fill="none" stroke="#fff" stroke-width="3"/><path d="M30 110 L170 40 M130 110 L70 40" stroke="#fff" stroke-width="1.5" opacity=".8"/><path d="M200 110 L280 110 L230 30Z" fill="none" stroke="#fff" stroke-width="3"/><path d="M215 70 L255 70" stroke="#fff" stroke-width="3" opacity=".8"/>`}
const HERO=heroDraw;
const MIND=[['Parallelogram family',100,50],['Diagonal → two ≅ triangles',420,50],['Opposite sides & angles equal',100,150],['Diagonals bisect each other',430,150],['One pair equal & parallel',110,250],['Mid-point theorem',410,250]];

const C=[
{id:'q1',num:'8.1',title:'The parallelogram family',
 intro:'A tabletop, a door, a kite, a rhombus-shaped tile: which of these are parallelograms?',
 obj:'Recall the definitions of parallelogram, rectangle, rhombus, square, trapezium and kite, and how they are related.',
 prior:'Parallel lines and transversals (Ch 6); congruence of triangles (Ch 7).',
 simple:'A quadrilateral has four sides, four angles and two diagonals. If both pairs of opposite sides are parallel, it is a parallelogram. A rectangle is a parallelogram with a right angle; a rhombus is a parallelogram with all sides equal; a square is both a rectangle and a rhombus. A trapezium has only one pair of parallel sides. A kite has two pairs of equal adjacent sides.',
 detail:'Every square is a rectangle and a rhombus; every rectangle and every rhombus is a parallelogram. Not every parallelogram is a rectangle. Diagonal facts you will prove: in a parallelogram the diagonals bisect each other; in a rectangle they are also equal; in a rhombus they also meet at right angles; in a square they are equal and perpendicular, and bisect each other. A kite\'s diagonals are perpendicular but only one of them is bisected. The angle sum of any quadrilateral is 360° (draw one diagonal: two triangles of 180° each).',
 real:'Scissor lifts and folding gates use parallelograms: as the frame tilts, opposite sides stay parallel.',
 apply:'Is every rhombus a square? Is every square a rhombus? Give a reason.',
 see:{w:520,h:240,f:[
  ['Parallelogram: both pairs of opposite sides parallel.',poly([[20,90],[120,90],[150,30],[50,30]],`fill="#f3dfe7" stroke="${ink}" stroke-width="2"`)+arrowMark([20,90],[120,90])+arrowMark([50,30],[150,30])+arrowMark([20,90],[50,30],2)+arrowMark([120,90],[150,30],2)],
  ['Rectangle (all angles 90°) and rhombus (all sides equal).',poly([[200,90],[300,90],[300,30],[200,30]],`fill="#f3dfe7" stroke="${ink}" stroke-width="2"`)+poly([[350,60],[400,20],[450,60],[400,100]],`fill="#f3dfe7" stroke="${ink}" stroke-width="2"`)],
  ['Square: a rectangle and a rhombus at once.',poly([[60,140],[130,140],[130,210],[60,210]],`fill="#f3dfe7" stroke="${ink}" stroke-width="2"`)],
  ['Not parallelograms: trapezium (one parallel pair) and kite.',poly([[200,210],[320,210],[290,150],[230,150]],`fill="none" stroke="${GR}" stroke-width="2"`)+poly([[400,130],[440,175],[400,230],[360,175]],`fill="none" stroke="${GR}" stroke-width="2"`)]]},
 seeNote:'Arrowheads mark parallel sides.',
 do:{title:'Sort the shapes',mat:'Cut-outs of 10 quadrilaterals, a set square, a ruler',steps:['Check opposite sides for parallel with the set square.','Measure sides and angles.','Sort into a family tree.'],obs:'Square sits under both rectangle and rhombus.',why:'Each special type adds one condition.',lab:true},
 memo:'"Square ⊂ rectangle ∩ rhombus ⊂ parallelogram."',
 miscon:['"A square is not a rectangle." It is a special rectangle.','"A trapezium is a parallelogram." It has only one pair of parallel sides.'],
 terms:['Parallelogram','Rectangle','Rhombus','Square','Trapezium','Kite'],
 q:{q:'A parallelogram with one right angle is a:',o:['rhombus','rectangle','trapezium','kite'],a:1,why:'Then all angles are 90°.'},
 exam:'"State true/false: every square is a rhombus" style questions appear in MCQs.'},

{id:'q2',num:'8.1',title:'A diagonal divides a parallelogram into two congruent triangles',
 intro:'Cut a paper parallelogram along one diagonal. Do the two triangles match exactly?',
 obj:'Prove that a diagonal of a parallelogram divides it into two congruent triangles.',
 prior:'ASA congruence; alternate interior angles.',
 simple:'In parallelogram ABCD draw diagonal AC. AB ∥ DC, so ∠BAC = ∠DCA (alternate angles). BC ∥ AD, so ∠BCA = ∠DAC (alternate angles). AC is common. So △ABC ≅ △CDA by ASA.',
 detail:'Proof. Given: ABCD is a parallelogram, AC a diagonal. To prove: △ABC ≅ △CDA. Since AB ∥ DC and AC is a transversal, ∠BAC = ∠DCA (alternate interior angles). Since BC ∥ AD and AC is a transversal, ∠BCA = ∠DAC. AC = CA (common). Hence △ABC ≅ △CDA (ASA rule). This one result gives the others: by CPCT, AB = CD and BC = DA (opposite sides equal), and ∠B = ∠D. Using the other diagonal BD in the same way gives ∠A = ∠C. Always name the triangles in matching order (A↔C, B↔D, C↔A).',
 real:'Two identical set squares placed along their long edges make a parallelogram (or a rectangle).',
 apply:'Show that the diagonal BD also divides parallelogram ABCD into two congruent triangles.',
 see:{w:520,h:240,f:[
  ['Parallelogram ABCD.',poly([[90,190],[330,190],[430,60],[190,60]],`fill="#f3dfe7" stroke="${ink}" stroke-width="2"`)+lbl(78,208,'A')+lbl(338,208,'B')+lbl(442,58,'C')+lbl(180,52,'D')],
  ['Draw diagonal AC.',`<line x1="90" y1="190" x2="430" y2="60" stroke="${TE}" stroke-width="2.5"/>`],
  ['Alternate angles: ∠BAC = ∠DCA and ∠BCA = ∠DAC; AC common.',`<path d="M130 190 A40 40 0 0 0 127 176" fill="none" stroke="${MA}" stroke-width="3"/><path d="M390 60 A40 40 0 0 0 393 74" fill="none" stroke="${MA}" stroke-width="3"/>`],
  ['So △ABC ≅ △CDA (ASA).',lbl(260,232,'△ABC ≅ △CDA (ASA)','font-weight="700"')]]},
 seeNote:'Match the letters in order: A↔C, B↔D, C↔A.',
 do:{title:'Cut and flip',mat:'A paper parallelogram, scissors',steps:['Cut along one diagonal.','Turn one triangle round (rotate 180°) and place it on the other.'],obs:'They match exactly.',why:'The triangles are congruent.',lab:true},
 memo:'"Two pairs of alternate angles plus the shared diagonal: ASA."',
 miscon:['"Use SSS." We don\'t yet know the sides are equal; that is what we will prove.','"The triangles are mirror images." One is the other rotated through 180°.'],
 terms:['Diagonal','Alternate interior angles','ASA','CPCT'],
 q:{q:'In parallelogram ABCD with diagonal AC, △ABC is congruent to:',o:['△ACD','△CDA','△DAC','△BCA'],a:1,why:'A↔C, B↔D, C↔A.'},
 exam:'This theorem\'s proof is a frequent 3-mark question.'},

{id:'q3',num:'8.1',title:'Opposite sides and opposite angles (and their converses)',
 intro:'If someone hands you a quadrilateral with opposite sides equal, can you be sure it is a parallelogram?',
 obj:'Use: in a parallelogram opposite sides are equal and opposite angles are equal; and conversely, either property makes a quadrilateral a parallelogram.',
 prior:'Diagonal theorem (q2); SSS congruence.',
 simple:'From the two congruent triangles, opposite sides of a parallelogram are equal and opposite angles are equal. The converses are also true: if both pairs of opposite sides of a quadrilateral are equal, it is a parallelogram; if both pairs of opposite angles are equal, it is a parallelogram.',
 detail:'Converse (sides): in ABCD with AB = CD and AD = BC, draw AC. △ABC ≅ △CDA by SSS, so ∠BAC = ∠DCA, which are alternate angles, so AB ∥ CD; similarly AD ∥ BC. Hence ABCD is a parallelogram. Converse (angles): if ∠A = ∠C and ∠B = ∠D, then 2∠A + 2∠B = 360°, so ∠A + ∠B = 180°: co-interior angles, so AD ∥ BC; similarly AB ∥ DC. Also, adjacent angles of a parallelogram are supplementary (add to 180°). Example: if one angle of a parallelogram is 70°, the others are 110°, 70°, 110°. If the angles of a quadrilateral are in the ratio 3 : 5 : 9 : 13, they are 36°, 60°, 108°, 156°.',
 real:'A carpenter checks a frame is a true parallelogram by measuring that opposite sides are equal.',
 apply:'Two opposite angles of a parallelogram are (3x − 2)° and (50 − x)°. Find all the angles.',
 see:{w:520,h:240,f:[
  ['Opposite sides are equal.',poly([[90,190],[330,190],[430,60],[190,60]],`fill="#f3dfe7" stroke="${ink}" stroke-width="2"`)+tick([90,190],[330,190])+tick([190,60],[430,60])+tick([90,190],[190,60],2)+tick([330,190],[430,60],2)],
  ['Opposite angles are equal; adjacent angles add to 180°.',`<path d="M120 190 A30 30 0 0 0 107 166" fill="none" stroke="${TE}" stroke-width="3"/><path d="M400 60 A30 30 0 0 0 413 84" fill="none" stroke="${TE}" stroke-width="3"/>`+lbl(150,180,'x','font-size="13"')+lbl(392,84,'x','font-size="13"')+lbl(300,180,'180° − x','font-size="12"')],
  ['Converses: equal opposite sides, or equal opposite angles ⇒ parallelogram.',lbl(260,232,'property ⇔ parallelogram','font-weight="700"')]]},
 seeNote:'Ticks mark equal sides.',
 do:{title:'Straw frame',mat:'Four straws (two of one length, two of another), thread',steps:['Thread the straws into a loop with equal straws opposite.','Push the frame into different shapes.'],obs:'It always stays a parallelogram.',why:'Equal opposite sides force a parallelogram.',lab:true},
 memo:'"Opposites match; neighbours make 180."',
 miscon:['"Adjacent angles are equal." Opposite angles are equal; adjacent ones are supplementary.','"One pair of equal opposite sides is enough." Not unless they are also parallel (see q5).'],
 terms:['Opposite sides','Opposite angles','Adjacent (consecutive) angles','Supplementary','Converse'],
 q:{q:'One angle of a parallelogram is 65°. The other three are:',o:['65°, 65°, 165°','115°, 65°, 115°','25°, 65°, 25°','90°, 90°, 115°'],a:1,why:'Opposite equal; adjacent supplementary.'},
 exam:'Angle-finding using these properties appears every year.'},

{id:'q4',num:'8.1',title:'Diagonals of a parallelogram bisect each other',
 intro:'Where exactly do the diagonals of a parallelogram cross?',
 obj:'Prove that the diagonals of a parallelogram bisect each other, and use the converse.',
 prior:'Opposite sides equal; alternate angles; ASA/AAS.',
 simple:'Let diagonals AC and BD meet at O. In △AOB and △COD: AB = CD (opposite sides), ∠OAB = ∠OCD and ∠OBA = ∠ODC (alternate angles). So △AOB ≅ △COD (ASA), giving OA = OC and OB = OD. Each diagonal cuts the other in half. Conversely, if the diagonals of a quadrilateral bisect each other, it is a parallelogram.',
 detail:'Converse proof: if OA = OC and OB = OD, then △AOB ≅ △COD by SAS (vertically opposite angles at O are equal), so ∠OAB = ∠OCD: alternate angles, so AB ∥ CD. Similarly AD ∥ BC. Special cases (Exercise 8.1): if the diagonals of a parallelogram are equal, it is a rectangle; if the diagonals of a quadrilateral bisect each other at right angles, it is a rhombus; if they are equal and bisect each other at right angles, it is a square. The diagonals of a square are equal and bisect each other at right angles.',
 real:'To find the centre of a rectangular board, draw both diagonals: they cross at the centre.',
 apply:'Show that if the diagonals of a parallelogram are equal, it is a rectangle.',
 see:{w:520,h:240,f:[
  ['Parallelogram with both diagonals; they meet at O.',poly([[90,190],[330,190],[430,60],[190,60]],`fill="#f3dfe7" stroke="${ink}" stroke-width="2"`)+`<line x1="90" y1="190" x2="430" y2="60" stroke="${TE}" stroke-width="2"/><line x1="330" y1="190" x2="190" y2="60" stroke="${TE}" stroke-width="2"/><circle cx="260" cy="125" r="4" fill="${ink}"/>`+lbl(262,150,'O')],
  ['OA = OC and OB = OD.',tick([90,190],[260,125],1,MA)+tick([260,125],[430,60],1,MA)+tick([330,190],[260,125],2,MA)+tick([260,125],[190,60],2,MA)],
  ['Converse: diagonals that bisect each other ⇒ parallelogram.',lbl(260,232,'OA = OC, OB = OD ⇔ parallelogram','font-weight="700"')]]},
 seeNote:'Ticks mark the equal halves.',
 do:{title:'Two sticks',mat:'Two sticks of any lengths, a pin through their mid-points',steps:['Pin the sticks at their mid-points.','Join the four ends with string.','Rotate one stick.'],obs:'The string always forms a parallelogram; at 90° a rhombus; equal sticks give rectangles.',why:'Diagonals bisecting each other ⇔ parallelogram.',lab:true},
 memo:'"Parallelogram diagonals cut each other in half."',
 miscon:['"Diagonals of a parallelogram are equal." Only in a rectangle (or square).','"Diagonals are perpendicular in every parallelogram." Only in a rhombus (or square).'],
 terms:['Bisect','Point of intersection','Vertically opposite angles','Rectangle/rhombus/square tests'],
 q:{q:'The diagonals of a parallelogram are equal. It must be a:',o:['rhombus','rectangle','trapezium','kite'],a:1,why:'Equal diagonals in a parallelogram give a right angle.'},
 exam:'Exercise 8.1 Q2–Q5 type proofs are common 3–5 mark questions.'},

{id:'q5',num:'8.1',title:'One pair of opposite sides equal and parallel',
 intro:'Draw two equal, parallel line segments and join their ends. What shape appears?',
 obj:'Prove and use: a quadrilateral is a parallelogram if one pair of opposite sides is equal and parallel.',
 prior:'SAS congruence; alternate angles.',
 simple:'In ABCD let AB = CD and AB ∥ CD. Draw diagonal AC. ∠BAC = ∠DCA (alternate angles), AB = CD, and AC is common, so △ABC ≅ △CDA (SAS). Then ∠BCA = ∠DAC, which makes BC ∥ AD. So ABCD is a parallelogram.',
 detail:'This is the quickest test of all: you only need one pair of sides. Example (Exercise 8.1 type): in parallelogram ABCD, E and F are mid-points of AB and CD. Then AE = ½AB = ½CD = FC and AE ∥ FC, so AECF is a parallelogram. Another: ABCD is a parallelogram and P, Q are points on diagonal BD with DP = BQ; show that APCQ is a parallelogram (use the diagonals-bisect test: OA = OC and OP = OQ). Summary of parallelogram tests: (1) both pairs of opposite sides parallel (definition); (2) both pairs of opposite sides equal; (3) both pairs of opposite angles equal; (4) diagonals bisect each other; (5) one pair of opposite sides equal and parallel.',
 real:'The two rails of a straight railway line are equal and parallel; join their ends with sleepers and you get a parallelogram (a rectangle).',
 apply:'ABCD is a parallelogram; E and F are mid-points of AB and CD. Show that AECF is a parallelogram.',
 see:{w:520,h:240,f:[
  ['AB and DC are equal and parallel.',`<line x1="90" y1="190" x2="330" y2="190" stroke="${ink}" stroke-width="3"/><line x1="190" y1="60" x2="430" y2="60" stroke="${ink}" stroke-width="3"/>`+arrowMark([90,190],[330,190])+arrowMark([190,60],[430,60])+tick([90,190],[330,190],1,MA)+tick([190,60],[430,60],1,MA)+lbl(78,208,'A')+lbl(338,208,'B')+lbl(442,58,'C')+lbl(180,52,'D')],
  ['Join the ends.',`<line x1="90" y1="190" x2="190" y2="60" stroke="${GR}" stroke-width="2" stroke-dasharray="5 3"/><line x1="330" y1="190" x2="430" y2="60" stroke="${GR}" stroke-width="2" stroke-dasharray="5 3"/>`],
  ['The other pair must be parallel too: a parallelogram.',lbl(260,232,'equal + parallel (one pair) ⇒ parallelogram','font-weight="700"')]]},
 seeNote:'Five tests for a parallelogram; this is the shortest.',
 do:{title:'Ruler slide',mat:'A ruler, a pencil, paper',steps:['Draw a line along the ruler edge from 0 to 8 cm.','Slide the ruler straight up (keep it parallel) and draw again from 0 to 8 cm.','Join the ends.'],obs:'A parallelogram.',why:'One pair equal and parallel is enough.',lab:false},
 memo:'"One pair, equal AND parallel: done."',
 miscon:['"One pair equal is enough." It must also be parallel (an isosceles trapezium has one equal pair).','"One pair parallel is enough." That only gives a trapezium.'],
 terms:['Parallelogram tests','SAS','Isosceles trapezium (counter-example)'],
 q:{q:'Which condition alone guarantees a parallelogram?',o:['One pair of opposite sides parallel','One pair of opposite sides equal','One pair of opposite sides equal and parallel','Diagonals equal'],a:2,why:'That is a theorem.'},
 exam:'"Show that AECF is a parallelogram" type proofs are standard.'},

{id:'q6',num:'8.2',title:'The mid-point theorem and its converse',
 intro:'Join the mid-points of two sides of any triangle. How does this segment compare with the third side?',
 obj:'Prove and apply: the segment joining the mid-points of two sides of a triangle is parallel to the third side and half of it; and the converse.',
 prior:'Parallelogram tests; ASA/SAS congruence.',
 simple:'Mid-point theorem: in △ABC, if E and F are the mid-points of AB and AC, then EF ∥ BC and EF = ½BC. Converse: a line through the mid-point of one side, drawn parallel to another side, bisects the third side.',
 detail:'Proof idea: extend EF to D so that EF = FD, and join DC. △AEF ≅ △CDF (SAS: AF = CF, EF = DF, vertically opposite angles), so AE = CD and ∠EAF = ∠DCF, giving CD ∥ AB. Then EB = AE = CD and EB ∥ CD, so EBCD is a parallelogram (one pair equal and parallel). Hence ED ∥ BC and ED = BC, so EF ∥ BC and EF = ½ED = ½BC. Uses: (1) the segments joining the mid-points of the sides of any quadrilateral form a parallelogram (each side is parallel to a diagonal and half of it); (2) joining the mid-points of the three sides of a triangle divides it into four congruent triangles; (3) in a right triangle, the mid-point of the hypotenuse is equidistant from all three vertices. Example: sides 7, 8, 9 cm → the triangle of mid-points has sides 3.5, 4, 4.5 cm and perimeter 12 cm.',
 real:'A carpenter finds the middle of a sloping roof truss by joining the mid-points of the two rafters: the brace comes out parallel to the base and half as long.',
 apply:'ABC is a triangle with AB = 5.6 cm, BC = 6 cm, CA = 7 cm. D, E, F are mid-points of the sides. Find the perimeter of △DEF.',
 see:{w:520,h:250,f:[
  ['Triangle ABC.',poly([[260,30],[80,210],[440,210]],`fill="#f3dfe7" stroke="${ink}" stroke-width="2"`)+lbl(260,22,'A')+lbl(66,224,'B')+lbl(454,224,'C')],
  ['E and F are the mid-points of AB and AC.',`<circle cx="170" cy="120" r="5" fill="${MA}"/><circle cx="350" cy="120" r="5" fill="${MA}"/>`+lbl(152,118,'E')+lbl(368,118,'F')+tick([260,30],[170,120])+tick([170,120],[80,210])+tick([260,30],[350,120],2)+tick([350,120],[440,210],2)],
  ['EF ∥ BC and EF = ½ BC.',`<line x1="170" y1="120" x2="350" y2="120" stroke="${TE}" stroke-width="3"/>`+arrowMark([170,120],[350,120])+arrowMark([80,210],[440,210])+lbl(260,244,'EF ∥ BC,  EF = ½ BC','font-weight="700"')]]},
 seeNote:'Single ticks: AE = EB; double ticks: AF = FC.',
 do:{title:'Fold and measure',mat:'A paper triangle, a ruler',steps:['Fold to find the mid-points of two sides; mark them.','Join them and measure; measure the third side.','Fold the triangle along this segment: where does the top vertex land?'],obs:'The segment is half the base; the vertex lands on the base.',why:'Mid-point theorem.',lab:true},
 memo:'"Join the middles: parallel and half."',
 miscon:['"EF = BC." It is half of BC.','"Works only for isosceles triangles." It works for every triangle.'],
 terms:['Mid-point','Mid-point theorem','Converse','Varignon parallelogram (mid-point quadrilateral)'],
 q:{q:'In △ABC, D and E are mid-points of AB and AC, and BC = 12 cm. DE =',o:['24 cm','12 cm','6 cm','3 cm'],a:2,why:'DE = ½BC.'},
 exam:'Exercise 8.2 (mid-point quadrilaterals, perimeter of mid-point triangle) gives 3–4 mark proofs.'}
];

const CARDS=[['Parallelogram','Both pairs of opposite sides parallel.'],['Rectangle','Parallelogram with a right angle; diagonals equal.'],['Rhombus','Parallelogram with all sides equal; diagonals ⊥.'],['Square','Rectangle + rhombus; diagonals equal and ⊥.'],['Angle sum','Any quadrilateral: 360°.'],['Diagonal theorem','Diagonal → two congruent triangles (ASA).'],['Opposite sides','Equal in a parallelogram; and conversely.'],['Opposite angles','Equal; adjacent angles add to 180°.'],['Diagonals','Bisect each other; and conversely.'],['Quickest test','One pair of opposite sides equal AND parallel.'],['Mid-point theorem','EF ∥ BC and EF = ½BC.'],['Converse','Line through a mid-point parallel to a side bisects the third side.'],['Mid-point quadrilateral','Joining mid-points of any quadrilateral → parallelogram.']];

const Q=[
 {lv:1,q:'The sum of the angles of a quadrilateral is:',o:['180°','270°','360°','540°'],a:2,w:'Two triangles.'},
 {lv:1,q:'Diagonals of a parallelogram:',o:['are always equal','bisect each other','are always perpendicular','never meet'],a:1,w:'Theorem.'},
 {lv:1,q:'True or false: every rectangle is a parallelogram.',o:['True','False'],a:0,w:'Its opposite sides are parallel.'},
 {lv:1,q:'In △ABC, the segment joining mid-points of AB and AC is:',o:['perpendicular to BC','parallel to BC and half of it','equal to BC','parallel to AB'],a:1,w:'Mid-point theorem.'},
 {lv:2,q:'One angle of a parallelogram is 110°. Its adjacent angle is:',o:['110°','70°','90°','250°'],a:1,w:'Adjacent angles add to 180°.'},
 {lv:2,q:'Angles of a quadrilateral are in the ratio 3 : 5 : 9 : 13. The largest angle is:',o:['130°','156°','108°','144°'],a:1,w:'360/30 = 12; 13 × 12 = 156.'},
 {lv:2,q:'A quadrilateral whose diagonals bisect each other at right angles is a:',o:['rectangle','rhombus','trapezium','kite'],a:1,w:'Exercise 8.1 result.'},
 {lv:3,q:'Two opposite angles of a parallelogram are (3x − 2)° and (50 − x)°. The angle is:',o:['37°','143°','13°','26°'],a:0,w:'3x − 2 = 50 − x → x = 13; 37°.'},
 {lv:3,q:'Sides of △ABC are 7, 8, 9 cm. The perimeter of the triangle formed by joining the mid-points is:',o:['24 cm','12 cm','6 cm','48 cm'],a:1,w:'Half of 24.'},
 {lv:3,q:'ABCD is a rhombus with diagonals 16 cm and 12 cm. Its side is:',o:['10 cm','14 cm','20 cm','8 cm'],a:0,w:'Halves 8 and 6 meet at 90°: √(64+36).'},
 {lv:4,q:'Assertion (A): The quadrilateral formed by joining mid-points of the sides of any quadrilateral is a parallelogram. Reason (R): Each of its sides is parallel to a diagonal of the original quadrilateral.',o:['Both true and R explains A','Both true, R does not explain A','A true, R false','A false, R true'],a:0,w:'Opposite sides are both parallel to the same diagonal.'},
 {lv:4,q:'If the mid-points of the sides of a rectangle are joined in order, the figure formed is a:',o:['rectangle','rhombus','square','kite'],a:1,w:'Sides are halves of the (equal) diagonals.'},
 {lv:4,q:'Which is NOT enough to prove ABCD is a parallelogram?',o:['AB = CD and AD = BC','AB ∥ CD and AB = CD','AB ∥ CD and AD = BC','∠A = ∠C and ∠B = ∠D'],a:2,w:'An isosceles trapezium satisfies it.'},
 {lv:5,open:true,m:3,q:'Prove that a diagonal of a parallelogram divides it into two congruent triangles.',ans:['ABCD parallelogram, diagonal AC; AB ∥ DC ⇒ ∠BAC = ∠DCA (alternate) (1).','BC ∥ AD ⇒ ∠BCA = ∠DAC (alternate); AC common (1).','△ABC ≅ △CDA by ASA (1).']},
 {lv:5,open:true,m:3,q:'Show that if the diagonals of a parallelogram are equal, it is a rectangle.',ans:['In parallelogram ABCD, AC = BD. △ABC and △DCB: AB = DC, BC common, AC = DB ⇒ congruent (SSS) (1).','So ∠ABC = ∠DCB (CPCT) (1).','They are co-interior angles (sum 180°), so each is 90° ⇒ rectangle (1).']},
 {lv:5,open:true,m:4,q:'ABCD is a quadrilateral; P, Q, R, S are the mid-points of AB, BC, CD, DA. Show that PQRS is a parallelogram.',ans:['Draw diagonal AC (1).','In △ABC: PQ ∥ AC and PQ = ½AC (mid-point theorem) (1).','In △ADC: SR ∥ AC and SR = ½AC (1).','So PQ = SR and PQ ∥ SR ⇒ PQRS is a parallelogram (1).']}
];

const ONEMIN=['Parallelogram ⊃ rectangle, rhombus ⊃ square.','Angle sum of a quadrilateral = 360°.','Diagonal → two congruent triangles (ASA).','Opposite sides equal; opposite angles equal; adjacent angles 180°.','Diagonals bisect each other.','Each property\'s converse is also a test.','Quickest test: one pair equal and parallel.','Rectangle: diagonals equal. Rhombus: diagonals ⊥. Square: both.','Mid-point theorem: EF ∥ BC, EF = ½BC; and converse.','Mid-points of any quadrilateral form a parallelogram.'];
const KEYS=[['360°',/360/],['congruent triangles',/congruen|≅|asa/i],['opposite sides equal',/opposite sides/i],['opposite angles equal',/opposite angles/i],['180° adjacent',/180|supplement|adjacent/i],['diagonals bisect',/bisect/i],['converse',/convers/i],['equal and parallel',/equal and parallel|parallel and equal/i],['mid-point theorem',/mid.?point/i],['half of third side',/half|½|1\/2/i]];

/* ---------- lab ---------- */
let P=[[80,260],[300,260],[380,90],[160,90]],drag=-1,showMid=false,showDia=true;
const PRE={par:[[80,260],[300,260],[380,90],[160,90]],rect:[[100,260],[360,260],[360,100],[100,100]],rho:[[230,290],[350,180],[230,70],[110,180]],sq:[[130,280],[310,280],[310,100],[130,100]],trap:[[70,260],[390,260],[310,100],[150,100]],kite:[[230,300],[340,150],[230,60],[120,150]],gen:[[90,270],[350,240],[390,110],[150,70]]};
const d2=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function ang(a,b,c){const v1=[a[0]-b[0],a[1]-b[1]],v2=[c[0]-b[0],c[1]-b[1]];return Math.acos(Math.max(-1,Math.min(1,(v1[0]*v2[0]+v1[1]*v2[1])/(Math.hypot(...v1)*Math.hypot(...v2)))))*180/Math.PI}
const par=(a,b,c,d)=>{const u=[b[0]-a[0],b[1]-a[1]],v=[d[0]-c[0],d[1]-c[1]];return Math.abs(u[0]*v[1]-u[1]*v[0])/(Math.hypot(...u)*Math.hypot(...v))<0.02};
function isect(a,c,b,d){const x1=a[0],y1=a[1],x2=c[0],y2=c[1],x3=b[0],y3=b[1],x4=d[0],y4=d[1];const den=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);if(Math.abs(den)<1e-6)return null;const t=((x1-x3)*(y3-y4)-(y1-y3)*(x3-x4))/den,u=-((x1-x2)*(y1-y3)-(y1-y2)*(x1-x3))/den;return {p:[x1+t*(x2-x1),y1+t*(y2-y1)],t,u}}
function classify(){const [A,B,Cc,D]=P;const s=[d2(A,B),d2(B,Cc),d2(Cc,D),d2(D,A)],an=[ang(D,A,B),ang(A,B,Cc),ang(B,Cc,D),ang(Cc,D,A)];const eq=(x,y)=>Math.abs(x-y)/Math.max(x,y)<0.03,rt=x=>Math.abs(x-90)<2.5;
 const p1=par(A,B,D,Cc),p2=par(B,Cc,A,D);const sum=an.reduce((x,y)=>x+y);
 if(Math.abs(sum-360)>2)return 'concave or crossed (drag a corner back out)';
 if(p1&&p2){const allEq=eq(s[0],s[1])&&eq(s[1],s[2])&&eq(s[2],s[3]),right=rt(an[0]);return allEq&&right?'square':allEq?'rhombus':right?'rectangle':'parallelogram'}
 if(p1||p2)return 'trapezium';
 if((eq(s[0],s[1])&&eq(s[2],s[3]))||(eq(s[1],s[2])&&eq(s[3],s[0])))return 'kite';
 return 'quadrilateral (no special name)'}
const SC=0.05;/* px → cm for display */
function draw(){const [A,B,Cc,D]=P;let s=poly(P,`fill="#f3dfe7" stroke="${ink}" stroke-width="2.5"`);
 const I=isect(A,Cc,B,D);
 if(showDia){s+=`<line x1="${A[0]}" y1="${A[1]}" x2="${Cc[0]}" y2="${Cc[1]}" stroke="${TE}" stroke-width="1.8"/><line x1="${B[0]}" y1="${B[1]}" x2="${D[0]}" y2="${D[1]}" stroke="${TE}" stroke-width="1.8"/>`;if(I)s+=`<circle cx="${I.p[0]}" cy="${I.p[1]}" r="4" fill="${TE}"/>`+T(I.p[0]+12,I.p[1]-6,'O','font-size="13" font-weight="700"')}
 if(showMid){const M=[[A,B],[B,Cc],[Cc,D],[D,A]].map(([u,v])=>[(u[0]+v[0])/2,(u[1]+v[1])/2]);s+=poly(M,`fill="none" stroke="#d85a30" stroke-width="2.5" stroke-dasharray="6 3"`)+M.map(m=>`<circle cx="${m[0]}" cy="${m[1]}" r="4" fill="#d85a30"/>`).join('')}
 const L=['A','B','C','D'],cx=(A[0]+B[0]+Cc[0]+D[0])/4,cy=(A[1]+B[1]+Cc[1]+D[1])/4;
 P.forEach((p,i)=>{const dx=p[0]-cx,dy=p[1]-cy,k=18/Math.hypot(dx,dy);s+=`<circle cx="${p[0]}" cy="${p[1]}" r="11" fill="${MA}" opacity=".25" data-v="${i}" style="cursor:grab"/><circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${MA}" pointer-events="none"/>`+T(p[0]+dx*k,p[1]+dy*k+5,L[i],'font-size="15" font-weight="700" pointer-events="none"')});
 $('#qSvg').innerHTML=s;
 const sd=[d2(A,B),d2(B,Cc),d2(Cc,D),d2(D,A)].map(x=>(x*SC).toFixed(1)),an=[ang(D,A,B),ang(A,B,Cc),ang(B,Cc,D),ang(Cc,D,A)].map(x=>x.toFixed(0));
 let dia='';if(I){const oa=d2(A,I.p)*SC,oc=d2(Cc,I.p)*SC,ob=d2(B,I.p)*SC,od=d2(D,I.p)*SC;const cross=ang(A,I.p,B);dia=`<p>Diagonals: AC = ${(d2(A,Cc)*SC).toFixed(1)}, BD = ${(d2(B,D)*SC).toFixed(1)} cm; OA = ${oa.toFixed(1)}, OC = ${oc.toFixed(1)}, OB = ${ob.toFixed(1)}, OD = ${od.toFixed(1)}; they cross at ${cross.toFixed(0)}°.</p>`}
 let mid='';if(showMid)mid='<p>The orange mid-point quadrilateral is always a <b>parallelogram</b> (mid-point theorem), whatever shape you drag.</p>';
 $('#qOut').innerHTML=`<p>Shape: <b>${classify()}</b></p><p>Sides AB, BC, CD, DA = ${sd.join(', ')} cm</p><p>Angles A, B, C, D = ${an.join('°, ')}° (sum ${an.reduce((x,y)=>x+ +y,0)}°)</p>${dia}${mid}`}
function svgPt(e){const sv=$('#qSvg'),pt=sv.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform(sv.getScreenCTM().inverse());return [Math.max(15,Math.min(445,Math.round(q.x))),Math.max(15,Math.min(325,Math.round(q.y)))]}
let wired=false;
function labInit(){if(wired)return;wired=true;
 document.addEventListener('pointerdown',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.v!==undefined&&t.closest('#qSvg')){drag=+t.dataset.v;e.preventDefault()}});
 document.addEventListener('pointermove',e=>{if(drag<0||!$('#qSvg'))return;P[drag]=svgPt(e);draw()});
 document.addEventListener('pointerup',()=>{drag=-1})}
function labShow(){draw()}
function labClick(){return false}
function labChange(t){if(t.id==='qPre'){P=PRE[t.value].map(p=>p.slice());draw();return true}if(t.id==='qMid'){showMid=t.checked;draw();return true}if(t.id==='qDia'){showDia=t.checked;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
