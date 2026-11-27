/* Rai Plus content pack: Class 10 Mathematics, Chapter 11 – Areas Related to Circles */
RP.register({key:'10mat11',cls:'10',subject:'Mathematics',ch:'11',title:"Areas Related to Circles",color:'#7a3f6b',
crumb:"HBSE Class 10 Mathematics · Unit: Mensuration · Taught in November",h1:"Chapter 11: Areas Related to Circles",sub:"Slices of a circle: arc length, sectors like pizza slices, and segments cut off by a chord.",heroLabel:"A circle with one sector shaded like a slice of pizza",labName:"Sector lab",
theme:"\n:root{--g:light-dark(#7a3f6b,#e0a6d2);--g2:light-dark(#f7eef5,#24131f);--line:light-dark(#ead6e4,#432a3c);--bg:light-dark(#ffffff,#140c12);--card:light-dark(#ffffff,#1b1018);\n--ink:light-dark(#22121e,#f2e6ee);--mute:light-dark(#6c5466,#c2a9bb);--y:light-dark(#2f7d6b,#7fcfb9);--y2:light-dark(#e8f5f1,#0f241f);--hd:#552a4a}\n",
labHTML:`  <h2>Sector lab</h2>
  <p>Change the angle and radius. The minor sector and segment are shaded; switch to see the major ones.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="sg" viewBox="0 0 440 400" role="img" aria-label="Circle with a sector and segment" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Angle θ (degrees)<input type="range" id="sA" min="10" max="350" step="5" value="60"></label><label>Radius r (cm)<select id="sR"><option>7</option><option selected>14</option><option>21</option><option>10</option><option>6</option></select></label></div>
  <div class="ctrl"><label>Shade<select id="sMode"><option value="sector">Minor sector</option><option value="segment">Minor segment</option><option value="majs">Major sector</option><option value="majg">Major segment</option></select></label><label>Value of π<select id="sPi"><option value="227">22/7</option><option value="314">3.14</option></select></label></div>
  <div class="box y" id="sOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#7a3f6b',LABNAME='Sector lab',MIND_CENTER='Areas of circles';
const PK='#7a3f6b',GR='#2f7d6b',ink='currentColor';
function arcPath(cx,cy,r,a0,a1,sector=true){const p0=[cx+r*Math.cos(a0),cy-r*Math.sin(a0)],p1=[cx+r*Math.cos(a1),cy-r*Math.sin(a1)],big=(a1-a0)>Math.PI?1:0;return sector?`M${cx} ${cy} L${p0[0]} ${p0[1]} A${r} ${r} 0 ${big} 0 ${p1[0]} ${p1[1]} Z`:`M${p0[0]} ${p0[1]} A${r} ${r} 0 ${big} 0 ${p1[0]} ${p1[1]} Z`}
const circ=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${ink}" stroke-width="2"/>`;
function heroDraw(){return `<circle cx="180" cy="62" r="50" fill="none" stroke="#fff" stroke-width="2"/><path d="${arcPath(180,62,50,0,Math.PI/3)}" fill="#e0a6d2" stroke="#fff" stroke-width="1.5"/>`+T(260,40,'θ/360 × πr²','font-size="13" fill="#fff" text-anchor="start"')}
const HERO=heroDraw;
const MIND=[['Circumference and area',90,60],['Sector and arc',430,60],['Segment',90,230],['Real-life problems',430,230]];

const C=[
{id:'h1',num:'11.1',title:'Perimeter and area of a circle (recap)',
 intro:'A wheel goes round once. How far has the cycle moved?',
 obj:'Recall and use C = 2πr and A = πr², and choose a suitable value of π.',
 prior:'Circumference and area of a circle (Class 7).',
 simple:'The distance around a circle is its circumference (perimeter): 2πr. The space inside it is its area: πr². π is the same for every circle: the ratio of circumference to diameter, about 22/7 or 3.14.',
 detail:'For every circle, circumference ÷ diameter is the same constant, denoted π (pi). π is an irrational number, so in calculations we use an approximate value, usually 22/7 or 3.14. Circumference = 2πr = πd. Area = πr². If a wheel of radius r makes one complete revolution, it covers a distance equal to its circumference. Aryabhata (476–550 CE) gave the approximate value π = 62832/20000 = 3.1416.',
 real:'The cycle wheel of radius 35 cm covers 2 × 22/7 × 35 = 220 cm in one turn.',
 apply:'The area of a circular garden is 616 m². Find its circumference (π = 22/7).',
 see:{w:520,h:240,f:[
  ['A circle of radius r.',circ(160,120,80)+`<line x1="160" y1="120" x2="240" y2="120" stroke="${PK}" stroke-width="2.5"/>`+T(200,110,'r','font-size="14"')],
  ['Unroll the boundary: its length is 2πr.',`<line x1="280" y1="80" x2="500" y2="80" stroke="${PK}" stroke-width="3"/>`+T(390,66,'C = 2πr','font-size="14"')],
  ['The region inside has area πr².',`<circle cx="160" cy="120" r="80" fill="${PK}" opacity=".18"/>`+T(390,150,'A = πr²','font-size="14" font-weight="700"')]]},
 seeNote:'Use the value of π the question asks for.',
 do:{title:'Measure π',mat:'Three round objects (bangle, lid, plate), thread, ruler',steps:['Wrap thread around each object and measure its circumference.','Measure each diameter.','Divide circumference by diameter.'],obs:'Each ratio is a little over 3.1.',why:'C/d = π for every circle.',lab:false},
 memo:'"Cherry pie is delicious (C = πd); apple pies are too (A = πr²)."',
 miscon:['"Area = 2πr." 2πr is the circumference; area is πr².','"π = 22/7 exactly." It is an approximation; π is irrational.'],
 terms:['Circumference','Area','π (pi)','Revolution'],
 q:{q:'The circumference of a circle of radius 7 cm (π = 22/7) is:',o:['22 cm','44 cm','154 cm','49 cm'],a:1,why:'2 × 22/7 × 7 = 44 cm.'},
 exam:'Recap values feed into sector and segment problems; also asked in 1-mark items.'},
{id:'h2',num:'11.2',title:'Sector of a circle and length of an arc',
 intro:'A pizza is cut into 8 equal slices. What is the area of one slice?',
 obj:'Find the length of an arc and the area of a sector of angle θ, and identify minor and major sectors.',
 prior:'Circumference and area (11.1).',
 simple:'A sector is the region between two radii and the arc between them, like a slice of pizza. Its angle θ is a fraction θ/360 of the whole circle, so its area is θ/360 × πr², and its arc length is θ/360 × 2πr.',
 detail:'The portion of the circular region enclosed by two radii and the corresponding arc is a sector. ∠AOB is the angle of the sector. The smaller sector is the minor sector and the remaining part is the major sector, whose angle is 360° − θ. A full circle (360°) has area πr², so a sector of 1° has area πr²/360, and a sector of angle θ has area (θ/360) × πr². Similarly, the length of the arc of a sector of angle θ is (θ/360) × 2πr. The area of the major sector = πr² − area of the minor sector.',
 real:'A car wiper sweeps a sector of the windscreen; the minute hand of a clock sweeps a sector of 6° every minute.',
 apply:'Find the area of the sector of a circle of radius 4 cm and angle 30° (π = 3.14). Also find the major sector.',
 see:{w:520,h:240,f:[
  ['Two radii OA and OB with angle θ between them.',circ(170,130,90)+`<line x1="170" y1="130" x2="260" y2="130" stroke="${ink}" stroke-width="2"/><line x1="170" y1="130" x2="${170+90*Math.cos(Math.PI/3)}" y2="${130-90*Math.sin(Math.PI/3)}" stroke="${ink}" stroke-width="2"/>`+T(195,118,'θ','font-size="14"')],
  ['The shaded region is the minor sector; the rest is the major sector.',`<path d="${arcPath(170,130,90,0,Math.PI/3)}" fill="${PK}" opacity=".35"/>`],
  ['Area = θ/360 × πr²; arc length = θ/360 × 2πr.',T(400,100,'Area = θ/360 × πr²','font-size="14"')+T(400,140,'Arc = θ/360 × 2πr','font-size="14"')]]},
 seeNote:'θ is always measured in degrees in this chapter.',
 do:{title:'Pizza fractions',mat:'Paper circle of radius 7 cm, protractor, scissors',steps:['Cut the circle into sectors of 90°, 60° and 30° (and keep the rest).','Calculate each area with θ/360 × πr².','Check that all the pieces add up to the whole circle.'],obs:'The areas add to πr² = 154 cm².',why:'Each sector is the fraction θ/360 of the whole circle.',lab:false},
 memo:'"Slice = (angle ÷ 360) of the whole pie."',
 miscon:['"Arc length = θ/360 × πr²." That is the sector area; arc uses 2πr.','"The major sector has angle θ." It has angle 360° − θ.'],
 terms:['Sector','Minor sector','Major sector','Arc','Angle of the sector'],
 q:{q:'The area of a sector of angle 90° in a circle of radius 14 cm (π = 22/7) is:',o:['154 cm²','616 cm²','44 cm²','22 cm²'],a:0,why:'¼ × 22/7 × 196 = 154 cm².'},
 exam:'Sector area and arc length (clock hands, wipers) are asked every year for 2–3 marks.'},
{id:'h3',num:'11.2',title:'Segment of a circle',
 intro:'A chord cuts a slice off a circular cake. How much cake is in the small piece?',
 obj:'Find the areas of the minor and major segments using sector minus triangle.',
 prior:'Sector area (11.2); area of a triangle; trigonometric ratios (Ch 8).',
 simple:'A chord divides a circle into two segments. The minor segment = minor sector − triangle OAB. The major segment = circle − minor segment.',
 detail:'The region enclosed by a chord and the arc it cuts off is a segment. The smaller one is the minor segment and the larger the major segment. Area of minor segment APB = area of sector OAPB − area of △OAB. Area of major segment = πr² − area of minor segment. For special angles the triangle area is easy: if θ = 60°, △OAB is equilateral with area (√3/4)r²; if θ = 90°, it is right-angled with area ½r²; if θ = 120°, its area is (√3/4)r². In general, area of △OAB = ½ r² sin θ.',
 real:'The part of a circular window above a straight crossbar, or a flower bed cut off by a straight path, is a segment.',
 apply:'Find the area of the minor segment of a circle of radius 21 cm cut off by a chord that subtends an angle of 120° at the centre (π = 22/7, √3 = 1.73).',
 see:{w:520,h:240,f:[
  ['Draw a chord AB; it cuts the circle into two segments.',circ(170,130,90)+`<line x1="260" y1="130" x2="${170+90*Math.cos(Math.PI/2)}" y2="${130-90*Math.sin(Math.PI/2)}" stroke="${ink}" stroke-width="2.5"/>`],
  ['Minor segment = sector OAB − triangle OAB.',`<path d="${arcPath(170,130,90,0,Math.PI/2,false)}" fill="${GR}" opacity=".45"/><path d="M170 130 L260 130 L170 40 Z" fill="none" stroke="${PK}" stroke-width="2" stroke-dasharray="5 4"/>`],
  ['Major segment = circle − minor segment.',T(400,100,'minor = sector − △','font-size="14"')+T(400,140,'major = πr² − minor','font-size="14"')]]},
 seeNote:'Here θ = 90°, so △OAB = ½ r².',
 do:{title:'Cut and compare',mat:'Paper circle of radius 10 cm, ruler, protractor, scissors, graph paper',steps:['Draw a 90° sector and its chord.','Cut out the minor segment.','Estimate its area by counting squares on graph paper.','Compare with ¼πr² − ½r².'],obs:'About 28.5 cm² by both methods (π = 3.14).',why:'Segment = sector − triangle.',lab:false},
 memo:'"Segment = Slice minus Sandwich (the triangle)."',
 miscon:['"Segment and sector are the same." A sector uses two radii; a segment uses a chord.','"Major segment = πr² − sector." Subtract the minor segment, not the sector.'],
 terms:['Chord','Segment','Minor segment','Major segment'],
 q:{q:'Area of a minor segment = ',o:['Sector + triangle','Sector − triangle','Circle − sector','Triangle − sector'],a:1,why:'Remove the triangle from the sector.'},
 exam:'Segment area with 60°, 90° or 120° is a standard 3-mark question.'},
{id:'h4',num:'11.2',title:'Solving real-life problems',
 intro:'How much area does a cow tied to the corner of a square field graze?',
 obj:'Apply sector and segment formulas to clocks, wipers, grazing animals, umbrellas, brooches and lighthouses.',
 prior:'Sectors and segments (11.2).',
 simple:'Most real problems reduce to: find the angle, find the radius, then use θ/360 × πr² or θ/360 × 2πr, adding or subtracting triangles where needed.',
 detail:'Common NCERT situations: the minute hand of a clock moves 360° in 60 minutes, so 6° per minute; in 5 minutes it sweeps 30°. A horse tied at the corner of a square field with a rope of length r grazes a quadrant (90° sector). Two wipers that do not overlap each sweep a sector of angle 115°. A lighthouse spreads light over a sector of angle 80°. An umbrella with 8 equal ribs is divided into 8 sectors of 45°. Steps: draw a figure, mark the angle and radius, decide whether a sector, segment or difference of areas is needed, and use the value of π asked for.',
 real:'Farmers estimate the grazing area of a tethered animal exactly this way.',
 apply:'The length of the minute hand of a clock is 14 cm. Find the area swept in 5 minutes.',
 see:{w:520,h:240,f:[
  ['Minute hand: 6° per minute. In 5 minutes it sweeps 30°.',circ(130,120,80)+`<path d="${arcPath(130,120,80,Math.PI/2-Math.PI/6,Math.PI/2)}" fill="${PK}" opacity=".35"/><line x1="130" y1="120" x2="130" y2="40" stroke="${ink}" stroke-width="3"/>`],
  ['A horse tied at a corner grazes a quadrant: a 90° sector.',`<rect x="300" y="40" width="160" height="160" fill="none" stroke="${ink}" stroke-width="2"/><path d="M300 200 L300 110 A90 90 0 0 1 390 200 Z" fill="${GR}" opacity=".4"/>`],
  ['Find θ and r, then use θ/360 × πr².',T(260,228,'θ, r → θ/360 × πr²','font-weight="700"')]]},
 seeNote:'Always sketch the situation first.',
 do:{title:'Make a problem',mat:'Notebook',steps:['Find one circular object around you with a moving part or a slice (fan blade, clock, rangoli).','Measure or estimate its radius and angle.','Write and solve your own sector problem.'],obs:'You can model many everyday shapes with sectors.',why:'Applying a formula yourself fixes it in memory.',lab:false},
 memo:'"Sketch, angle, radius, formula."',
 miscon:['"The minute hand sweeps 5° in 5 minutes." It sweeps 6° per minute: 30°.','"A tethered goat in a corner grazes a semicircle." In a corner of a rectangle it is a quadrant.'],
 terms:['Quadrant','Angle swept','Application'],
 q:{q:'The angle swept by the minute hand in 20 minutes is:',o:['20°','60°','120°','240°'],a:2,why:'6° × 20 = 120°.'},
 exam:'Word problems (clock, wipers, horse, umbrella, brooch) carry 2–3 marks.'}
];

const CARDS=[['Circumference','C = 2πr = πd.'],['Area of circle','A = πr².'],['π','Irrational; use 22/7 or 3.14.'],['Sector','Region between two radii and the arc.'],['Area of sector','θ/360 × πr².'],['Length of arc','θ/360 × 2πr.'],['Major sector','Angle 360° − θ; area πr² − minor sector.'],['Segment','Region between a chord and its arc.'],['Minor segment','Sector − triangle OAB.'],['Major segment','πr² − minor segment.'],['Triangle area for 60° or 120°','(√3/4) r².'],['Triangle area for 90°','½ r².'],['Minute hand','Sweeps 6° per minute.']];

const Q=[
 {lv:1,q:'The area of a sector of angle θ of a circle with radius r is:',o:['θ/180 × πr²','θ/360 × πr²','θ/360 × 2πr','θ/720 × πr²'],a:1,w:'Fraction θ/360 of πr².'},
 {lv:1,q:'The length of an arc of angle θ is:',o:['θ/360 × πr²','θ/360 × 2πr','θ/180 × πr','2πrθ'],a:1,w:'Fraction θ/360 of the circumference.'},
 {lv:1,q:'True or false: a segment is bounded by two radii and an arc.',o:['True','False'],a:1,w:'That is a sector; a segment is bounded by a chord and an arc.'},
 {lv:1,q:'If the angle of a minor sector is 80°, the angle of the major sector is:',o:['80°','100°','280°','180°'],a:2,w:'360° − 80°.'},
 {lv:2,q:'Area of a quadrant of a circle with circumference 22 cm (π = 22/7):',o:['77/8 cm²','77/2 cm²','154 cm²','38.5 cm²'],a:0,w:'r = 3.5 cm; ¼ × 22/7 × 12.25 = 9.625 = 77/8 cm².'},
 {lv:2,q:'The minute hand of a clock is 14 cm long. The area swept in 5 minutes (π = 22/7) is:',o:['154/3 cm²','154 cm²','77 cm²','308/3 cm²'],a:0,w:'30/360 × 22/7 × 196 = 154/3 ≈ 51.33 cm².'},
 {lv:2,q:'The length of an arc of a circle of radius 21 cm subtending 60° at the centre is (π = 22/7):',o:['11 cm','22 cm','44 cm','66 cm'],a:1,w:'60/360 × 2 × 22/7 × 21 = 22 cm.'},
 {lv:3,q:'A chord of a circle of radius 10 cm subtends a right angle at the centre. The area of the minor segment (π = 3.14) is:',o:['28.5 cm²','78.5 cm²','50 cm²','21.5 cm²'],a:0,w:'78.5 − 50 = 28.5 cm².'},
 {lv:3,q:'A horse is tied to a peg at one corner of a square field of side 15 m with a 5 m rope. The area it can graze (π = 3.14) is:',o:['19.625 m²','78.5 m²','39.25 m²','15.7 m²'],a:0,w:'Quadrant: ¼ × 3.14 × 25 = 19.625 m².'},
 {lv:3,q:'An umbrella has 8 equally spaced ribs and radius 45 cm. The area between two consecutive ribs (π = 22/7) is:',o:['About 795.5 cm²','About 6364 cm²','About 397.7 cm²','About 1591 cm²'],a:0,w:'45/360 × 22/7 × 2025 = 22275/28 ≈ 795.5 cm².'},
 {lv:4,q:'Assertion (A): If the radius of a circle is doubled, the area of a sector of fixed angle becomes four times. Reason (R): Sector area is proportional to r².',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'θ/360 × π(2r)² = 4 × original.'},
 {lv:4,q:'Two sectors have equal arcs. The first has radius 10 cm and angle 60°. If the second has radius 20 cm, its angle is:',o:['30°','60°','120°','15°'],a:0,w:'Arc ∝ rθ, so 10 × 60 = 20 × θ.'},
 {lv:5,open:true,m:3,q:'A chord of a circle of radius 15 cm subtends an angle of 60° at the centre. Find the areas of the minor and major segments (π = 3.14, √3 = 1.73).',ans:['Sector = 60/360 × 3.14 × 225 = 117.75 cm² (1).','△ = √3/4 × 225 = 97.31 cm²; minor segment = 20.44 cm² (1).','Major segment = 706.5 − 20.44 = 686.06 cm² (1).']},
 {lv:5,open:true,m:3,q:'A car has two wipers which do not overlap. Each wiper has a blade of length 25 cm sweeping through an angle of 115°. Find the total area cleaned at each sweep (π = 22/7).',ans:['One sector = 115/360 × 22/7 × 625 (1).','= 158125/252 ≈ 627.48 cm² (1).','Two wipers: ≈ 1254.96 cm² (1).']},
 {lv:5,open:true,m:3,q:'In a circle of radius 21 cm, an arc subtends an angle of 60° at the centre. Find (i) the length of the arc, (ii) the area of the sector, (iii) the area of the segment formed by the chord (π = 22/7, √3 = 1.73).',ans:['Arc = 60/360 × 2 × 22/7 × 21 = 22 cm (1).','Sector = 60/360 × 22/7 × 441 = 231 cm² (1).','Segment = 231 − (1.73/4 × 441) = 231 − 190.73 = 40.27 cm² (1).']}
];

const ONEMIN=['C = 2πr; A = πr²; π ≈ 22/7 or 3.14.','Sector area = θ/360 × πr².','Arc length = θ/360 × 2πr.','Major sector angle = 360° − θ.','Minor segment = sector − △OAB.','Major segment = πr² − minor segment.','△OAB: ½r² (90°), (√3/4)r² (60° or 120°).','Minute hand sweeps 6° per minute.'];
const KEYS=[['area πr²',/πr²|pi r|πr\^?2/i],['circumference 2πr',/2πr|2 pi r|circumference/i],['θ/360',/360/],['sector',/sector/i],['arc',/arc/i],['segment',/segment/i],['minus triangle',/triangle|△/i],['major / minor',/major|minor/i],['value of π',/22\/7|3\.14/]];

/* ---------- lab ---------- */
function fmt(x){return (Math.round(x*100)/100).toLocaleString('en-IN')}
function labDraw(){const th=+$('#sA').value,r=+$('#sR').value,mode=$('#sMode').value,pi=$('#sPi').value==='227'?22/7:3.14,R=150,cx=220,cy=200,a=th*Math.PI/180;
 const minor=th<=180;const a0=0,a1=a;let s=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${ink}" stroke-width="2"/>`;
 const A=[cx+R,cy],B=[cx+R*Math.cos(a),cy-R*Math.sin(a)],big=th>180?1:0;
 const secP=`M${cx} ${cy} L${A[0]} ${A[1]} A${R} ${R} 0 ${big} 0 ${B[0]} ${B[1]} Z`,segP=`M${A[0]} ${A[1]} A${R} ${R} 0 ${big} 0 ${B[0]} ${B[1]} Z`;
 const majSec=`M${cx} ${cy} L${B[0]} ${B[1]} A${R} ${R} 0 ${1-big} 0 ${A[0]} ${A[1]} Z`,majSeg=`M${B[0]} ${B[1]} A${R} ${R} 0 ${1-big} 0 ${A[0]} ${A[1]} Z`;
 const fillP={sector:secP,segment:segP,majs:majSec,majg:majSeg}[mode];s+=`<path d="${fillP}" fill="${mode.includes('g')&&mode!=='majs'?GR:PK}" opacity=".35"/>`;
 s+=`<line x1="${cx}" y1="${cy}" x2="${A[0]}" y2="${A[1]}" stroke="${ink}" stroke-width="2"/><line x1="${cx}" y1="${cy}" x2="${B[0]}" y2="${B[1]}" stroke="${ink}" stroke-width="2"/>`;
 if(mode==='segment'||mode==='majg')s+=`<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${GR}" stroke-width="2.5"/>`;
 s+=`<path d="M${cx+30} ${cy} A30 30 0 ${big} 0 ${cx+30*Math.cos(a)} ${cy-30*Math.sin(a)}" fill="none" stroke="${ink}" stroke-width="1.5"/>`+T(cx+44*Math.cos(a/2),cy-44*Math.sin(a/2)+5,th+'°','font-size="13"')+T(cx-12,cy+18,'O','font-size="14" font-weight="700"')+T(A[0]+12,A[1]+5,'A','font-size="14" font-weight="700"')+T(B[0]+10*Math.cos(a),B[1]-10*Math.sin(a)+5,'B','font-size="14" font-weight="700"');
 $('#sg').innerHTML=s;
 const circle=pi*r*r,sec=th/360*circle,arc=th/360*2*pi*r,tri=0.5*r*r*Math.abs(Math.sin(a)),seg=th<=180?sec-tri:sec+tri;const piS=pi===3.14?'3.14':'22/7';
 const rows={sector:`Area of sector = ${th}/360 × ${piS} × ${r}² = <b>${fmt(sec)} cm²</b>`,segment:`Area of segment = sector − △OAB = ${fmt(sec)} − ${fmt(tri)} = <b>${fmt(seg)} cm²</b>`+(th>180?' (θ > 180°: the triangle is added)':''),majs:`Major sector = πr² − sector = ${fmt(circle)} − ${fmt(sec)} = <b>${fmt(circle-sec)} cm²</b>`,majg:`Major segment = πr² − minor segment = ${fmt(circle)} − ${fmt(seg)} = <b>${fmt(circle-seg)} cm²</b>`};
 $('#sOut').innerHTML=`<p>Arc length = ${th}/360 × 2 × ${piS} × ${r} = <b>${fmt(arc)} cm</b></p><p>${rows[mode]}</p><p class="note">Area of △OAB = ½ r² sin θ = ${fmt(tri)} cm². Whole circle = ${fmt(circle)} cm².</p>`}
function labInit(){}
function labShow(){labDraw()}
function labClick(b){return false}
function labChange(t){if(['sA','sR','sMode','sPi'].includes(t.id)){labDraw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
