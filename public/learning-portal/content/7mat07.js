/* Rai Plus content pack: Class 7 Mathematics (Ganita Prakash), Chapter 7 – A Tale of Three Intersecting Lines. */
RP.register({key:'7mat07',cls:'7',subject:'Mathematics',ch:'7',title:"A Tale of Three Intersecting Lines",color:'#3b6d11',
crumb:"Class 7 Mathematics · Ganita Prakash",h1:"Chapter 7: A Tale of Three Intersecting Lines",sub:"Triangles: parts and types, the triangle inequality, constructing with three sides, angle sum 180°, constructions with angles, and altitudes.",heroLabel:"A triangle drawn with compass arcs",labName:'Triangle builder',
theme:"\n:root{--g:light-dark(#3b6d11,#a8d77d);--g2:light-dark(#eef6e4,#0f1a07);--line:light-dark(#d4e7bf,#2c4219);--bg:light-dark(#ffffff,#0b1206);--card:light-dark(#ffffff,#111a0a);\n--ink:light-dark(#162508,#e6f1da);--mute:light-dark(#4f6439,#b5c9a0);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#2b520b}\n",
labHTML:`  <h2>Triangle builder</h2>
  <p>Set three side lengths. The builder draws the arcs, checks the triangle inequality, shows the angles and their sum, and names the triangle.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="gSvg" viewBox="0 0 460 320" role="img" aria-label="Triangle construction" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>BC = <b id="gAv"></b><input type="range" class="gS" id="gA" min="2" max="10" step="0.5" value="6"></label></div>
  <div class="ctrl"><label>AC = <b id="gBv"></b><input type="range" class="gS" id="gB" min="2" max="10" step="0.5" value="5"></label></div>
  <div class="ctrl"><label>AB = <b id="gCv"></b><input type="range" class="gS" id="gC" min="2" max="10" step="0.5" value="4"></label></div>
  <div class="ctrl"><label><input type="checkbox" id="gAlt"> Show altitude from A</label> <button class="btn" id="gTear">Tear corners (angle sum)</button></div>
  <div class="box y" id="gOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3b6d11',LABNAME='Triangle builder',MIND_CENTER='Triangles';
const GN='#3b6d11',OR='#b04a1f',BL='#1f5f8b',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const tri=(P,c=GN)=>`<polygon points="${P.map(p=>p.join(',')).join(' ')}" fill="${c}" fill-opacity=".15" stroke="${c}" stroke-width="2.5"/>`;
const tri2=(P,c=GN)=>`<polygon points="${P.map(p=>p.join(',')).join(' ')}" fill="${c}" fill-opacity=".15" stroke="${c}" stroke-width="2.5"/>`;
function heroDraw(){return `<polygon points="60,110 220,110 150,30" fill="none" stroke="#fff" stroke-width="3"/><path d="M120 40 A90 90 0 0 1 180 40" stroke="#fff" fill="none" stroke-width="2"/>`}
const HERO=heroDraw;
const MIND=[['Parts of a triangle',100,50],['Types',420,50],['Triangle inequality',90,150],['Construct with 3 sides',430,150],['Angle sum 180°',110,250],['Altitudes',410,250]];

const C=[
{id:'t1',num:'7.1',title:'Parts and types of triangles',
 intro:'Three lines that intersect in pairs make a closed figure. What is it?',
 obj:'Name the parts of a triangle and classify triangles by sides and angles.',
 prior:'Ch 5: intersecting lines; Class 6 angles.',
 simple:'A triangle ABC has 3 vertices (A, B, C), 3 sides (AB, BC, CA) and 3 angles (∠A, ∠B, ∠C). By sides: equilateral (all 3 equal), isosceles (2 equal), scalene (all different). By angles: acute-angled (all < 90°), right-angled (one 90°), obtuse-angled (one > 90°).',
 detail:'Each side is opposite one angle: BC is opposite ∠A. In an isosceles triangle, the angles opposite the equal sides are equal. An equilateral triangle has all angles 60°. Triangles are the strongest shape — bridges and roof trusses use them.',
 real:'Roof frames and bridge girders use triangles for strength.',
 apply:'A triangle has sides 5 cm, 5 cm, 7 cm. Name its type.',
 see:{w:520,h:220,f:[
  ['Triangle ABC.',tri([[60,180],[220,180],[150,50]])+lbl(48,195,'B')+lbl(232,195,'C')+lbl(150,40,'A')],
  ['By sides: equilateral, isosceles, scalene.',tri([[280,120],[340,120],[310,68]],BL)+tri([[360,120],[410,120],[385,50]],PU)+tri([[430,120],[500,120],[450,80]],OR)],
  ['By angles: acute, right, obtuse.',lbl(390,150,'equilateral · isosceles · scalene','font-size="11"')+lbl(390,190,'acute · right · obtuse','font-weight="700"')]]},
 seeNote:'Classify by sides and by angles.',
 do:{title:'Straw triangles',mat:'Straws of 3 lengths, thread',steps:['Make equilateral, isosceles and scalene triangles.','Measure their angles.'],obs:'Equilateral angles all 60°.',why:'Types.',lab:false},
 memo:'"Equi all, Iso two, Scalene none."',
 miscon:['"A right triangle can also be obtuse." Only one angle can be ≥ 90°.'],
 terms:['Vertex','Side','Equilateral','Isosceles','Scalene','Acute / right / obtuse'],
 q:{q:'Triangle with sides 4, 4, 4 cm:',o:['scalene','isosceles only','equilateral','right'],a:2,why:'All equal.'},
 exam:'Classify triangles: 2 marks.'},

{id:'t2',num:'7.2',title:'The triangle inequality',
 intro:'Can you make a triangle with sticks of 2 cm, 3 cm and 7 cm?',
 obj:'State and use the triangle inequality.',
 prior:'7.1.',
 simple:'In any triangle, the sum of any two sides is greater than the third side. 2 + 3 = 5 < 7, so 2, 3, 7 cannot form a triangle — the short sticks can\'t meet. 4, 5, 6: 4 + 5 > 6 ✓ → a triangle is possible.',
 detail:'Quick check: the two shorter sides together must be longer than the longest side. If they are exactly equal (2 + 3 = 5), the "triangle" collapses into a straight line. The shortest path between two points is a straight line — that is why the inequality holds.',
 real:'Walking straight across a park is shorter than going along two sides.',
 apply:'Can 3 cm, 4 cm and 8 cm form a triangle?',
 see:{w:520,h:220,f:[
  ['Sticks 2, 3 and 7.',`<line x1="80" y1="170" x2="430" y2="170" stroke="${ink}" stroke-width="4"/>`+lbl(255,195,'7')],
  ['2 and 3 from the ends don\'t meet.',`<line x1="80" y1="170" x2="160" y2="110" stroke="${OR}" stroke-width="4"/><line x1="430" y1="170" x2="310" y2="90" stroke="${BL}" stroke-width="4"/>`+lbl(110,120,'2','fill="'+OR+'"')+lbl(380,110,'3','fill="'+BL+'"')],
  ['2 + 3 < 7 → no triangle.',lbl(260,45,'2 + 3 = 5 < 7  ✗','font-size="18" font-weight="700" fill="'+OR+'"')]]},
 seeNote:'Two shorter sides > longest side.',
 do:{title:'Stick test',mat:'Broom sticks cut to 2, 3, 4, 5, 7 cm',steps:['Try every group of 3.','Record which make triangles.'],obs:'Inequality decides.',why:'Triangle inequality.',lab:true},
 memo:'"Small + small > big."',
 miscon:['"Any three lengths make a triangle." Not if two short sides are too short.'],
 terms:['Triangle inequality'],
 q:{q:'Which can form a triangle?',o:['1, 2, 3','2, 3, 6','3, 4, 5','1, 1, 3'],a:2,why:'3 + 4 > 5.'},
 exam:'Check triangle inequality: 2 marks.'},

{id:'t3',num:'7.3',title:'Constructing a triangle with three sides',
 intro:'Construct a triangle with sides 6 cm, 5 cm and 4 cm. Where is the third corner?',
 obj:'Construct a triangle given three sides (SSS) using a compass.',
 prior:'Class 6 Ch 8 (points at given distances).',
 simple:'Steps: (1) draw BC = 6 cm; (2) with centre B, radius 4 cm, draw an arc; (3) with centre C, radius 5 cm, draw an arc cutting the first; (4) the crossing point is A; join AB and AC. A is 4 cm from B and 5 cm from C.',
 detail:'If the arcs don\'t meet, the sides break the triangle inequality. The arcs meet at two points (above and below BC) — both give the same triangle reflected. All triangles with the same three sides are the same shape and size (congruent) — you will learn more in "Geometric Twins".',
 real:'Surveyors locate a point from two known points by measuring distances.',
 apply:'Write the steps to construct a triangle with sides 7, 5, 5 cm.',
 see:{w:520,h:220,f:[
  ['Draw BC = 6 cm.',`<line x1="140" y1="180" x2="380" y2="180" stroke="${ink}" stroke-width="2.5"/>`+lbl(130,198,'B')+lbl(390,198,'C')+lbl(260,200,'6 cm')],
  ['Arcs: 4 cm from B, 5 cm from C.',`<path d="M${140+160*Math.cos(-1.4)} ${180+160*Math.sin(-1.4)} A160 160 0 0 1 ${140+160*Math.cos(-0.8)} ${180+160*Math.sin(-0.8)}" fill="none" stroke="${BL}"/><path d="M${380+200*Math.cos(-2.4)} ${180+200*Math.sin(-2.4)} A200 200 0 0 1 ${380+200*Math.cos(-1.9)} ${180+200*Math.sin(-1.9)}" fill="none" stroke="${OR}"/>`],
  ['They cross at A. Join AB, AC.',`<line x1="140" y1="180" x2="230" y2="48" stroke="${GN}" stroke-width="2.5"/><line x1="380" y1="180" x2="230" y2="48" stroke="${GN}" stroke-width="2.5"/>`+lbl(230,38,'A','font-weight="700"')]]},
 seeNote:'Two arcs find the third vertex.',
 do:{title:'Construct',mat:'Compass, ruler, pencil',steps:['Construct triangles with sides (6, 5, 4) and (7, 7, 7).','Measure their angles.'],obs:'Equilateral: 60° each.',why:'SSS construction.',lab:true},
 memo:'"Base, arc, arc, join."',
 miscon:['"Arcs can be any radius." They must equal the given sides.'],
 terms:['Construction','Arc','SSS'],
 q:{q:'First step of SSS construction:',o:['draw an angle','draw one side','draw a circle','measure angles'],a:1,why:'Base side.'},
 exam:'Construct a triangle with three sides: 4 marks.'},

{id:'t4',num:'7.4',title:'Angle sum of a triangle',
 intro:'Tear off the three corners of a paper triangle and put them together. What do you get?',
 obj:'Show and use the angle sum property (180°).',
 prior:'Ch 5: parallel lines, alternate angles.',
 simple:'The three angles of any triangle add up to 180°: ∠A + ∠B + ∠C = 180°. Tearing the corners and placing them side by side makes a straight angle. If two angles are 50° and 60°, the third is 180° − 110° = 70°.',
 detail:'Proof using parallel lines: draw a line through A parallel to BC. The alternate angles at A equal ∠B and ∠C, and together with ∠A they lie on a straight line: 180°. Consequences: a triangle can have at most one right or obtuse angle; each angle of an equilateral triangle is 60°; in a right triangle the other two angles add to 90°.',
 real:'Carpenters check triangular frames using this property.',
 apply:'A right triangle has one angle 35°. Find the third angle.',
 see:{w:520,h:220,f:[
  ['A paper triangle.',tri([[80,180],[260,180],[180,60]])],
  ['Tear the corners…',`<path d="M80 180 l30 0 a30 30 0 0 0 -16 -26z" fill="${OR}" opacity=".6"/><path d="M260 180 l-30 0 a30 30 0 0 1 12 -28z" fill="${BL}" opacity=".6"/><path d="M180 60 l-15 25 a30 30 0 0 0 28 2z" fill="${PU}" opacity=".6"/>`],
  ['…they make a straight line: 180°.',`<line x1="330" y1="170" x2="500" y2="170" stroke="${ink}" stroke-width="2"/><path d="M415 170 L385 170 A30 30 0 0 1 395 148z" fill="${OR}" opacity=".6"/><path d="M415 170 L395 148 A30 30 0 0 1 440 150z" fill="${PU}" opacity=".6"/><path d="M415 170 L440 150 A30 30 0 0 1 445 170z" fill="${BL}" opacity=".6"/>`+lbl(415,200,'∠A + ∠B + ∠C = 180°','font-weight="700"')]]},
 seeNote:'Always 180°.',
 do:{title:'Tear test',mat:'Paper triangles of different shapes',steps:['Tear off the corners.','Fit them together at a point on a line.'],obs:'Straight angle each time.',why:'Angle sum.',lab:true},
 memo:'"Three corners make a straight line."',
 miscon:['"Bigger triangles have bigger angle sums." Always 180°.'],
 terms:['Angle sum property','Straight angle'],
 q:{q:'Two angles 45° and 75°. Third:',o:['60°','70°','80°','120°'],a:0,why:'180 − 120.'},
 exam:'Use angle sum property: 2 marks.'},

{id:'t5',num:'7.5',title:'Constructing with angles (SAS and ASA)',
 intro:'Can you construct a triangle if you know two sides and the angle between them?',
 obj:'Construct triangles given two sides and the included angle, or two angles and the included side.',
 prior:'7.3; Class 6 protractor.',
 simple:'SAS: draw AB; at A draw the given angle with a protractor; mark AC along that ray; join BC. ASA: draw the given side BC; draw the given angles at B and C; the rays meet at A.',
 detail:'For ASA, the two angles must add to less than 180°, or the rays won\'t meet. Using the angle sum property, if two angles and any side are known, the third angle can be found first. A triangle cannot be fixed by three angles alone (many sizes are possible).',
 real:'Navigators fix a ship\'s position using angles measured from two lighthouses a known distance apart (ASA).',
 apply:'Can you construct a triangle with angles 100° and 90°? Why not?',
 see:{w:520,h:220,f:[
  ['SAS: AB = 5 cm, ∠A = 60°, AC = 4 cm.',`<line x1="60" y1="180" x2="260" y2="180" stroke="${ink}" stroke-width="2.5"/><line x1="60" y1="180" x2="140" y2="41" stroke="${BL}" stroke-width="2"/>`+lbl(50,195,'A')+lbl(270,195,'B')+lbl(85,165,'60°','font-size="11"')],
  ['Join BC.',`<line x1="140" y1="41" x2="260" y2="180" stroke="${GN}" stroke-width="2.5"/>`+lbl(145,32,'C')],
  ['ASA: two angles at the ends of a side.',`<line x1="320" y1="180" x2="480" y2="180" stroke="${ink}" stroke-width="2.5"/><line x1="320" y1="180" x2="420" y2="70" stroke="${OR}"/><line x1="480" y1="180" x2="400" y2="60" stroke="${OR}"/>`+lbl(400,205,'rays meet at the third vertex')]]},
 seeNote:'SAS and ASA fix a triangle.',
 do:{title:'Two constructions',mat:'Ruler, protractor, compass',steps:['Construct SAS: 5 cm, 50°, 6 cm.','Construct ASA: 6 cm with 40° and 70°.'],obs:'Measure the remaining parts.',why:'Constructions.',lab:false},
 memo:'"SAS: side-angle-side; ASA: angle-side-angle."',
 miscon:['"Three angles fix a triangle." They fix the shape, not the size.'],
 terms:['SAS','ASA','Included angle','Included side'],
 q:{q:'Two angles 120° and 70°. A triangle is:',o:['possible','impossible','right','isosceles'],a:1,why:'Sum > 180°.'},
 exam:'SAS/ASA construction: 4 marks.'},

{id:'t6',num:'7.6',title:'Altitudes of a triangle',
 intro:'How tall is a triangle?',
 obj:'Draw and understand altitudes.',
 prior:'Ch 5: perpendicular lines.',
 simple:'An altitude is the perpendicular segment from a vertex to the opposite side (or its extension). It gives the "height" of the triangle for that base. Every triangle has 3 altitudes, one from each vertex.',
 detail:'In an acute triangle all altitudes lie inside; in a right triangle two altitudes are the legs themselves; in an obtuse triangle two altitudes fall outside (on the extended sides). The three altitudes (extended if needed) meet at one point. Altitudes are needed for area: area = ½ × base × height.',
 real:'The height of a triangular roof is the altitude from the top to the base.',
 apply:'Where do the altitudes of a right triangle meet?',
 see:{w:520,h:220,f:[
  ['Triangle ABC with base BC.',tri([[80,190],[300,190],[200,40]])],
  ['Altitude from A ⊥ BC.',`<line x1="200" y1="40" x2="200" y2="190" stroke="${OR}" stroke-width="2.5" stroke-dasharray="6 4"/><path d="M200 178 h12 v12" fill="none" stroke="${OR}"/>`+lbl(215,120,'height','fill="'+OR+'" text-anchor="start"')],
  ['Obtuse triangle: altitude falls outside.',tri([[350,190],[450,190],[500,80]],BL)+`<line x1="500" y1="80" x2="500" y2="190" stroke="${OR}" stroke-dasharray="5 4"/><line x1="450" y1="190" x2="510" y2="190" stroke="${GR}" stroke-dasharray="3 3"/>`]]},
 seeNote:'Perpendicular from a vertex.',
 do:{title:'Fold an altitude',mat:'Paper triangle',steps:['Fold so that side BC folds onto itself and the crease passes through A.'],obs:'The crease is the altitude.',why:'Perpendicular.',lab:false},
 memo:'"Altitude: vertex to opposite side at 90°."',
 miscon:['"Altitudes are always inside." Not in obtuse triangles.'],
 terms:['Altitude','Height','Perpendicular','Base'],
 q:{q:'An altitude meets the opposite side at:',o:['60°','90°','45°','any angle'],a:1,why:'Perpendicular.'},
 exam:'Draw altitudes: 2 marks.'}
];

const CARDS=[['Parts','3 vertices, 3 sides, 3 angles.'],['By sides','Equilateral, isosceles, scalene.'],['By angles','Acute, right, obtuse.'],['Inequality','Sum of two sides > third.'],['SSS','Base + two arcs.'],['Angle sum','180°.'],['Equilateral','Each angle 60°.'],['SAS / ASA','Other ways to construct.'],['Altitude','Perpendicular from vertex to opposite side.'],['Obtuse','Two altitudes fall outside.']];

const Q=[
 {lv:1,q:'Sum of angles of a triangle:',o:['90°','180°','360°','270°'],a:1,w:'Angle sum.'},
 {lv:1,q:'Triangle with two equal sides:',o:['scalene','isosceles','equilateral only','obtuse'],a:1,w:'Isosceles.'},
 {lv:1,q:'Each angle of an equilateral triangle:',o:['45°','60°','90°','30°'],a:1,w:'180/3.'},
 {lv:2,q:'Can 3, 4, 8 form a triangle?',o:['yes','no','only right','only isosceles'],a:1,w:'3 + 4 < 8.'},
 {lv:2,q:'Angles 40° and 65°; third:',o:['75°','85°','95°','105°'],a:0,w:'180 − 105.'},
 {lv:2,q:'A triangle with angles 30°, 60°, 90° is:',o:['acute','right','obtuse','equilateral'],a:1,w:'One 90°.'},
 {lv:3,q:'Isosceles triangle: vertex angle 40°. Base angles:',o:['70° each','40° each','140°','50° each'],a:0,w:'(180 − 40)/2.'},
 {lv:3,q:'Altitudes of an obtuse triangle:',o:['all inside','two outside','none','all outside'],a:1,w:'Obtuse.'},
 {lv:4,q:'Third side of a triangle with sides 5 and 8 can be:',o:['2','3','12','13'],a:2,w:'3 < x < 13.'},
 {lv:4,q:'Angles in ratio 1 : 2 : 3. Largest angle:',o:['60°','90°','120°','30°'],a:1,w:'6 parts = 180.'},
 {lv:5,open:true,m:4,q:'Write the steps to construct triangle PQR with PQ = 6 cm, QR = 5 cm, PR = 4.5 cm.',ans:['Draw PQ = 6 cm (1)','Arc of radius 5 cm from Q (1)','Arc of radius 4.5 cm from P cutting it at R (1)','Join PR and QR (1)']},
 {lv:5,open:true,m:3,q:'Prove that the angles of a triangle add to 180° using a line parallel to one side.',ans:['Draw line through A parallel to BC (1)','Alternate angles at A equal ∠B and ∠C (1)','Together with ∠A they form a straight angle: 180° (1)']}
];

const ONEMIN=['Parts and types of triangles.','Triangle inequality.','SSS construction with arcs.','Angle sum 180°.','SAS and ASA constructions.','Altitudes: perpendicular from vertex.'];
const KEYS=[['types',/equilateral|isosceles|scalene|acute|obtuse/i],['inequality',/inequalit|sum of two/i],['construction',/construct|arc/i],['angle sum',/180|angle sum/i],['SAS/ASA',/SAS|ASA/i],['altitude',/altitude|height/i]];

/* ---------- lab ---------- */
let a=6,b=5,c=4,alt=false,tear=false;
function draw(){const u=24,Bx=90,By=270,Cx=Bx+a*u,Cy=By;let s=`<line x1="${Bx}" y1="${By}" x2="${Cx}" y2="${Cy}" stroke="${ink}" stroke-width="2.5"/>`+T(Bx-12,By+16,'B','font-size="13"')+T(Cx+12,Cy+16,'C','font-size="13"')+T((Bx+Cx)/2,By+20,a+' cm','font-size="12"');
 const ok=a<b+c&&b<a+c&&c<a+b;const x=(a*a+c*c-b*b)/(2*a);const h2=c*c-x*x;
 s+=`<circle cx="${Bx}" cy="${By}" r="${c*u}" fill="none" stroke="${BL}" stroke-width="1" stroke-dasharray="4 4" opacity=".7"/><circle cx="${Cx}" cy="${Cy}" r="${b*u}" fill="none" stroke="${OR}" stroke-width="1" stroke-dasharray="4 4" opacity=".7"/>`;
 let m='';if(!ok){const L=Math.max(a,b,c),S=a+b+c-L;s+=T(230,40,`${(S).toFixed(1)} ≤ ${L}: the arcs ${S===L?'just touch':'do not meet'}`,'font-size="14" font-weight="700" fill="'+OR+'"');m=`<p class="fb no">No triangle: the two shorter sides add to ${S} cm, which is not more than ${L} cm (triangle inequality).</p>`}
 else{const h=Math.sqrt(h2);const Ax=Bx+x*u,Ay=By-h*u;s+=tri2([[Bx,By],[Cx,Cy],[Ax,Ay]])+T(Ax,Ay-10,'A','font-size="13" font-weight="700"')+T((Bx+Ax)/2-14,(By+Ay)/2,c+'','font-size="12" fill="'+BL+'"')+T((Cx+Ax)/2+14,(Cy+Ay)/2,b+'','font-size="12" fill="'+OR+'"');
  const D=180/Math.PI;const A=Math.acos((b*b+c*c-a*a)/(2*b*c))*D,B=Math.acos((a*a+c*c-b*b)/(2*a*c))*D,Cc=180-A-B;
  s+=T(Bx+30,By-8,Math.round(B)+'°','font-size="12"')+T(Cx-30,Cy-8,Math.round(Cc)+'°','font-size="12"')+T(Ax,Ay+26,Math.round(A)+'°','font-size="12"');
  if(alt){s+=`<line x1="${Ax}" y1="${Ay}" x2="${Ax}" y2="${By}" stroke="${PU}" stroke-width="2" stroke-dasharray="6 4"/>`+(Ax<Bx||Ax>Cx?`<line x1="${Math.min(Ax,Bx)}" y1="${By}" x2="${Math.max(Ax,Cx)}" y2="${By}" stroke="${GR}" stroke-dasharray="3 3"/>`:'')+`<path d="M${Ax} ${By-10} h10 v10" fill="none" stroke="${PU}"/>`}
  if(tear){const base=380,yy=60;const r=30;const arc=(st,en,col)=>{const p=t=>[base+r*Math.cos(t*Math.PI/180),yy-r*Math.sin(t*Math.PI/180)];const [x1,y1]=p(st),[x2,y2]=p(en);return `<path d="M${base} ${yy} L${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 0 0 ${x2.toFixed(1)} ${y2.toFixed(1)}Z" fill="${col}" opacity=".6"/>`};s+=`<line x1="${base-50}" y1="${yy}" x2="${base+50}" y2="${yy}" stroke="${ink}"/>`+arc(0,B,BL)+arc(B,B+A,GN)+arc(B+A,180,OR)+T(base,yy+22,'180°','font-size="12" font-weight="700"')}
  const type=(a===b&&b===c)?'equilateral':(a===b||b===c||a===c)?'isosceles':'scalene';const big=Math.max(A,B,Cc);const at=Math.abs(big-90)<0.5?'right-angled':big>90?'obtuse-angled':'acute-angled';
  m=`<p class="fb ok">Triangle possible. It is <b>${type}</b> and <b>${at}</b>.</p><p>∠A ≈ ${A.toFixed(0)}°, ∠B ≈ ${B.toFixed(0)}°, ∠C ≈ ${Cc.toFixed(0)}° — sum = 180°.</p>`+(alt?'<p class="note">Purple: altitude from A (perpendicular to BC'+(Ax<Bx||Ax>Cx?', falls outside because the triangle is obtuse at B or C':'')+').</p>':'')}
 $('#gSvg').innerHTML=s;$('#gAv').textContent=a+' cm';$('#gBv').textContent=b+' cm';$('#gCv').textContent=c+' cm';$('#gOut').innerHTML=m}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('gS'))labChange(e.target)})}
function labClick(bt){if(bt.id==='gTear'){tear=!tear;draw();return true}return false}
function labChange(t){if(t.id==='gA')a=+t.value;else if(t.id==='gB')b=+t.value;else if(t.id==='gC')c=+t.value;else if(t.id==='gAlt')alt=t.checked;else return false;draw();return true}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
