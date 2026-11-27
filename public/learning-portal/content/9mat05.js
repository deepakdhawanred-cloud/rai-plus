/* Rai Plus content pack: Class 9 Mathematics, Chapter 5 – Introduction to Euclid's Geometry (rationalised NCERT). */
RP.register({key:'9mat05',cls:'9',subject:'Mathematics',ch:'5',title:"Introduction to Euclid's Geometry",color:'#8a5a14',
crumb:"HBSE Class 9 Mathematics · Unit: Geometry · Taught in August",h1:"Chapter 5: Introduction to Euclid's Geometry",sub:"Where geometry began, Euclid's definitions, axioms and postulates, and how theorems are proved from them.",heroLabel:"Ruler-and-compass constructions",labName:'Postulate playground',
theme:"\n:root{--g:light-dark(#8a5a14,#e8c07a);--g2:light-dark(#faf3e6,#1c1407);--line:light-dark(#eedcbc,#45351c);--bg:light-dark(#ffffff,#120d05);--card:light-dark(#ffffff,#1a1309);\n--ink:light-dark(#2a1d08,#f4eadb);--mute:light-dark(#6a5838,#cdbb9c);--y:light-dark(#1f5f8b,#8cc4ea);--y2:light-dark(#eaf3fa,#081520);--hd:#6a420c}\n",
labHTML:`  <h2>Postulate playground</h2>
  <p>Test Euclid's postulates by drawing. <b>Line mode:</b> tap two points — exactly one line passes through them, and it extends without end. <b>Circle mode:</b> tap a centre, then a point on the circle. <b>Equals mode:</b> see the axioms "things equal to the same thing are equal" and "the whole is greater than the part".</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="euSvg" viewBox="0 0 520 340" role="img" aria-label="Euclid playground" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="euM"><option value="l">Line through two points (Postulates 1, 2)</option><option value="c">Circle (Postulate 3)</option><option value="a">Axioms with segments</option></select></label></div>
  <div id="euA" style="display:none"><div class="ctrl"><label><span>AB: <b id="euABv"></b></span><input type="range" class="euS" id="euAB" min="20" max="200" value="120"></label></div>
  <div class="ctrl"><label><span>BC: <b id="euBCv"></b></span><input type="range" class="euS" id="euBC" min="20" max="200" value="100"></label></div></div>
  <div class="ctrl"><button class="btn" id="euClr">Clear</button></div>
  <div class="box y" id="euOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#8a5a14',LABNAME='Postulate playground',MIND_CENTER="Euclid's geometry";
const BR='#8a5a14',BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',RD='#c0392b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const dot=(x,y,t,c=ink)=>`<circle cx="${x}" cy="${y}" r="4.5" fill="${c}"/>`+(t?T(x-10,y-10,t,'font-size="14" font-weight="700"'):'');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".12" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-4:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+13,sub,'font-size="10.5"'):'');
function heroDraw(){return `<circle cx="130" cy="80" r="50" fill="none" stroke="#fff" stroke-width="2"/><circle cx="210" cy="80" r="50" fill="none" stroke="#fff" stroke-width="2"/><polygon points="130,80 210,80 170,11" fill="none" stroke="#fff" stroke-width="3"/>`}
const HERO=heroDraw;
const MIND=[['History of geometry',100,50],['Definitions',420,50],['Axioms',90,150],['Five postulates',430,150],['Theorems & proofs',110,250],['Using axioms',410,250]];

const C=[
{id:'u1',num:'5.1',title:'Where geometry began',
 intro:'"Geometry" comes from Greek words meaning "earth measurement". Why would ancient people need to measure the earth?',
 obj:'Trace the origins of geometry in Egypt, India and Greece.',
 prior:'Basic shapes from earlier classes.',
 simple:'Geometry grew from practical needs: re-marking field boundaries after the Nile floods in Egypt, building altars and cities in India, and constructing buildings. The Greeks, especially Thales and Pythagoras, began to prove results by reasoning. Around 300 BCE, Euclid of Alexandria collected the known geometry into 13 books called the Elements.',
 detail:'In India, the Sulbasutras (800–500 BCE) gave precise rules for constructing fire altars (vedis) of specific shapes and areas, including squares, rectangles and the result now called the Baudhayana–Pythagoras theorem. The Harappan cities (around 2500 BCE) had well-planned streets at right angles and bricks in the ratio 4 : 2 : 1. Euclid\'s great contribution was the axiomatic method: start from a few basic assumptions and prove everything else by logic.',
 real:'Mohenjo-daro\'s grid-planned streets show advanced practical geometry.',
 apply:'Find out the brick ratio used in Harappan buildings and why it was useful.',
 see:{w:520,h:200,f:[
  ['Egypt: re-marking fields.',box(20,60,150,60,'Egypt',BR,'land measurement')],
  ['India: altars and cities.',box(185,60,150,60,'India',OR,'Sulbasutras, Harappa')],
  ['Greece: proofs.',box(350,60,150,60,'Greece',BL,'Euclid\'s Elements')+lbl(260,160,'practical rules → logical proofs','font-weight="700"')]]},
 seeNote:'From measuring to reasoning.',
 do:{title:'Rope geometry',mat:'Rope with 12 equal knots',steps:['Form a triangle with sides 3, 4, 5 knots.','Check the angle.'],obs:'A right angle.',why:'Ancient builders\' trick.',lab:false},
 memo:'"Egypt measured, India built, Greece proved."',
 miscon:['"Geometry was invented by Euclid." He organised and proved results known long before.'],
 terms:['Geometry','Sulbasutras','Elements','Axiomatic method'],
 q:{q:'Euclid\'s Elements had how many books?',o:['5','10','13','20'],a:2,why:'Thirteen books.'},
 exam:'History questions: 1 mark.'},

{id:'u2',num:'5.2',title:"Euclid's definitions",
 intro:'How would you define a "point" without using another word that itself needs defining?',
 obj:'State Euclid\'s basic definitions and understand undefined terms.',
 prior:'5.1.',
 simple:'Euclid began with 23 definitions, such as: a point is that which has no part; a line is breadthless length; the ends of a line are points; a straight line lies evenly with the points on itself; a surface has length and breadth only; the edges of a surface are lines.',
 detail:'These definitions use words like "part", "breadth" and "length" that themselves need defining, leading to an endless chain. So mathematicians today take point, line and plane as undefined terms, understood through intuition and examples. A solid has three dimensions, a surface two, a line one, a point none.',
 real:'A star in the night sky looks like a point; a taut string looks like a line.',
 apply:'Why are point, line and plane taken as undefined terms?',
 see:{w:520,h:200,f:[
  ['Point: no part.',dot(80,100,'P')+lbl(80,150,'0 dimensions')],
  ['Line: breadthless length.',`<line x1="170" y1="100" x2="320" y2="100" stroke="${BL}" stroke-width="3"/>`+lbl(245,150,'1 dimension')],
  ['Surface: length and breadth.',`<polygon points="370,70 490,70 470,130 350,130" fill="${OR}" fill-opacity=".2" stroke="${OR}" stroke-width="2"/>`+lbl(420,150,'2 dimensions')]]},
 seeNote:'Dimensions drop: solid → surface → line → point.',
 do:{title:'Define it',mat:'Paper',steps:['Try to define "point" without using any undefined word.'],obs:'It is impossible.',why:'Undefined terms.',lab:false},
 memo:'"Point, line, plane: understood, not defined."',
 miscon:['"A dot on paper is a point." It represents a point; a real point has no size.'],
 terms:['Point','Line','Surface','Undefined terms','Dimension'],
 q:{q:'How many dimensions does a surface have?',o:['0','1','2','3'],a:2,why:'Length and breadth.'},
 exam:'Definitions: 1 mark.'},

{id:'u3',num:'5.3',title:'Axioms (common notions)',
 intro:'If Ravi is as tall as Sita, and Sita is as tall as Mohan, what can you say about Ravi and Mohan?',
 obj:'State Euclid\'s axioms and use them in reasoning.',
 prior:'5.2.',
 simple:'Axioms are obvious truths used throughout mathematics, not only in geometry. Euclid\'s axioms include: (1) things equal to the same thing are equal to one another; (2) if equals are added to equals, the wholes are equal; (3) if equals are subtracted from equals, the remainders are equal; (4) things that coincide with one another are equal; (5) the whole is greater than the part; (6) things that are double of the same things are equal; (7) things that are halves of the same things are equal.',
 detail:'Axiom 1 example: if AB = CD and CD = EF, then AB = EF. Axiom 2: if a = b, then a + c = b + c. Axiom 5: if B lies between A and C, then AC > AB. Axioms are not proved; they are accepted as the starting point.',
 real:'"If both cups hold the same as this jug, they hold the same as each other" — axiom 1 in the kitchen.',
 apply:'If AC = BD and C, B lie between A and D as in A–C–B–D, show AB = CD using an axiom.',
 see:{w:520,h:200,f:[
  ['AB = CD.',`<line x1="40" y1="60" x2="200" y2="60" stroke="${BL}" stroke-width="3"/><line x1="300" y1="60" x2="460" y2="60" stroke="${BL}" stroke-width="3"/>`+lbl(120,50,'AB')+lbl(380,50,'CD')],
  ['CD = EF.',`<line x1="300" y1="120" x2="460" y2="120" stroke="${OR}" stroke-width="3"/>`+lbl(380,110,'EF')],
  ['So AB = EF.',lbl(260,175,'things equal to the same thing are equal','font-weight="700" fill="'+BR+'"')]]},
 seeNote:'Equality passes along.',
 do:{title:'Paper strips',mat:'Strips cut to the same strip',steps:['Cut two strips equal to a reference strip.','Compare them directly.'],obs:'Equal.',why:'Axiom 1.',lab:true},
 memo:'"Equals to the same are equal; whole beats part."',
 miscon:['"Axioms need to be proved." They are accepted as self-evident.'],
 terms:['Axiom','Common notion','Self-evident truth'],
 q:{q:'"The whole is greater than the part" is Euclid\'s:',o:['postulate 1','axiom 5','definition 1','theorem'],a:1,why:'Axiom 5.'},
 exam:'State and apply axioms: 2 marks.'},

{id:'u4',num:'5.4',title:"Euclid's five postulates",
 intro:'What is the least you must assume to be able to draw any figure with a ruler and compass?',
 obj:'State Euclid\'s five postulates.',
 prior:'5.3.',
 simple:'Postulates are assumptions specific to geometry. Postulate 1: a straight line may be drawn from any one point to any other point. Postulate 2: a terminated line (line segment) can be produced indefinitely. Postulate 3: a circle can be drawn with any centre and any radius. Postulate 4: all right angles are equal to one another. Postulate 5: if a straight line falling on two straight lines makes the interior angles on the same side together less than two right angles, then the two lines, if produced indefinitely, meet on that side.',
 detail:'Postulate 1 together with the idea of uniqueness gives: given two distinct points, there is a unique line through them. Postulate 5 (the parallel postulate) is more complex than the others; for centuries mathematicians tried to prove it from the rest and failed, which eventually led to non-Euclidean geometries. An equivalent form: two distinct intersecting lines cannot both be parallel to the same line.',
 real:'Ruler-and-compass constructions in your geometry box rely on postulates 1–3.',
 apply:'If the interior angles on one side add up to 170°, on which side will the lines meet?',
 see:{w:520,h:230,f:[
  ['Two lines cut by a transversal.',`<line x1="60" y1="70" x2="460" y2="50" stroke="${BL}" stroke-width="2.5"/><line x1="60" y1="170" x2="460" y2="140" stroke="${BL}" stroke-width="2.5"/><line x1="200" y1="20" x2="240" y2="210" stroke="${ink}" stroke-width="2"/>`],
  ['Interior angles on the right sum < 180°.',`<path d="M222 63 a18 18 0 0 1 19 9" fill="none" stroke="${OR}" stroke-width="3"/><path d="M233 153 a18 18 0 0 0 16 -10" fill="none" stroke="${OR}" stroke-width="3"/>`+lbl(280,105,'∠1 + ∠2 < 180°','fill="'+OR+'" font-weight="700"')],
  ['They meet on that side.',`<line x1="460" y1="50" x2="900" y2="28" stroke="${BL}" stroke-dasharray="6 5"/><line x1="460" y1="140" x2="900" y2="107" stroke="${BL}" stroke-dasharray="6 5"/>`+lbl(400,215,'lines meet on the right if produced','font-weight="700"')]]},
 seeNote:'The fifth postulate.',
 do:{title:'Test postulate 5',mat:'Long paper, ruler, protractor',steps:['Draw two lines cut by a transversal with interior angles 85° and 80°.','Extend them.'],obs:'They meet on that side.',why:'Postulate 5.',lab:true},
 memo:'"Line, extend, circle, right angles equal, parallels."',
 miscon:['"Postulates and axioms are completely different ideas." Euclid used "postulate" for geometry-specific assumptions; today both words are used for assumptions.'],
 terms:['Postulate','Line segment','Produce (extend)','Parallel postulate'],
 q:{q:'"A circle can be drawn with any centre and radius" is postulate:',o:['1','2','3','4'],a:2,why:'Postulate 3.'},
 exam:'State postulates: 2 marks.'},

{id:'u5',num:'5.5',title:'Theorems and proofs',
 intro:'How can we be sure that two different lines can cross at most once?',
 obj:'Understand how theorems are proved from axioms and postulates.',
 prior:'5.3, 5.4.',
 simple:'A theorem (or proposition) is a statement that is proved using definitions, axioms, postulates and previously proved results. Theorem: two distinct lines cannot have more than one point in common. Proof idea: suppose lines l and m meet at two points P and Q. Then two different lines pass through P and Q. But only one line passes through two distinct points (postulate 1 with uniqueness). This contradiction shows they meet at most once.',
 detail:'This is a proof by contradiction. Euclid proved 465 propositions in a logical chain. A system of axioms should be consistent — it should not be possible to prove a statement and its opposite. Euclid\'s first proposition: an equilateral triangle can be constructed on any given segment, using two circles (postulate 3).',
 real:'Lawyers, scientists and programmers all use chains of logical reasoning like proofs.',
 apply:'Construct an equilateral triangle on a 6 cm segment AB using compasses and explain which postulates you used.',
 see:{w:520,h:240,f:[
  ['Segment AB.',`<line x1="200" y1="160" x2="320" y2="160" stroke="${ink}" stroke-width="3"/>`+dot(200,160,'A')+dot(320,160,'B')],
  ['Circles with centres A and B, radius AB.',`<circle cx="200" cy="160" r="120" fill="none" stroke="${BL}" stroke-dasharray="5 4"/><circle cx="320" cy="160" r="120" fill="none" stroke="${OR}" stroke-dasharray="5 4"/>`],
  ['C where they meet: ABC is equilateral.',`<polygon points="200,160 320,160 260,56" fill="${GN}" fill-opacity=".2" stroke="${GN}" stroke-width="3"/>`+dot(260,56,'C')+lbl(260,228,'AB = AC = BC (radii; axiom 1)','font-weight="700"')]]},
 seeNote:'Euclid\'s first proposition.',
 do:{title:'Construct it',mat:'Compass, ruler',steps:['Draw AB; draw circles centred A and B with radius AB.','Join to the intersection C.'],obs:'Equilateral triangle.',why:'Proof by construction.',lab:true},
 memo:'"Assume, reason, conclude."',
 miscon:['"Checking with many drawings proves a theorem." A proof must use logic from accepted statements.'],
 terms:['Theorem','Proposition','Proof','Proof by contradiction','Consistent system'],
 q:{q:'Two distinct lines can meet in at most:',o:['0 points','1 point','2 points','infinitely many'],a:1,why:'Theorem 5.1.'},
 exam:'Short proofs: 2–3 marks.'},

{id:'u6',num:'5.6',title:'Using axioms in problems',
 intro:'Ali and Bina have the same weight, and each gains 2 kg. Are their weights still equal?',
 obj:'Apply Euclid\'s axioms to everyday and geometric situations.',
 prior:'5.3.',
 simple:'Many reasoning steps in algebra and geometry are Euclid\'s axioms. Equal weights + equal gains = equal weights (axiom 2). If x + y = 10 and x = z, then z + y = 10 (substitution, from axiom 1). If AB = CD, then AB + BC = CD + BC, so AC = BD for points A–B–C–D in order (axiom 2).',
 detail:'Midpoint uniqueness: if C and D are both midpoints of AB, then AC = ½AB and AD = ½AB, so AC = AD (axiom 7, halves of the same thing are equal), and C coincides with D. Every segment has exactly one midpoint.',
 real:'Balancing a scale: adding equal weights to both sides keeps it balanced — axiom 2.',
 apply:'Prove that every line segment has one and only one midpoint.',
 see:{w:520,h:200,f:[
  ['A and B with a point C.',`<line x1="60" y1="100" x2="460" y2="100" stroke="${ink}" stroke-width="3"/>`+dot(60,100,'A')+dot(460,100,'B')+dot(260,100,'C',OR)],
  ['AC = CB.',lbl(160,130,'AC','fill="'+OR+'"')+lbl(360,130,'CB','fill="'+OR+'"')],
  ['Unique midpoint.',lbl(260,175,'AC = ½AB; another midpoint D gives AD = ½AB → D = C','font-size="12.5" font-weight="700"')]]},
 seeNote:'Axioms underlie everyday steps.',
 do:{title:'Balance scale',mat:'Simple balance, equal weights',steps:['Balance two equal masses.','Add equal masses to each side.'],obs:'Still balanced.',why:'Axiom 2.',lab:false},
 memo:'"Do the same to equals; they stay equal."',
 miscon:['"Axioms only apply to geometry." They apply across all mathematics.'],
 terms:['Midpoint','Uniqueness','Coincide'],
 q:{q:'If a = b, then a − 5 = b − 5 by axiom:',o:['1','2','3','5'],a:2,why:'Equals subtracted from equals.'},
 exam:'Apply axioms: 2–3 marks.'}
];

const CARDS=[['Elements','Euclid, c. 300 BCE, 13 books.'],['Sulbasutras','Indian altar geometry, 800–500 BCE.'],['Undefined terms','Point, line, plane.'],['Axiom 1','Equals to the same are equal.'],['Axiom 2 & 3','Add/subtract equals → equals.'],['Axiom 5','Whole > part.'],['Postulate 1','A line between any two points.'],['Postulate 2','A segment can be extended.'],['Postulate 3','Circle with any centre, radius.'],['Postulate 4','All right angles are equal.'],['Postulate 5','Interior angles < 180° → lines meet on that side.'],['Theorem','Proved from axioms and postulates.']];

const Q=[
 {lv:1,q:'Euclid lived in:',o:['Rome','Alexandria','Athens','Babylon'],a:1,w:'Egypt.'},
 {lv:1,q:'Which is an undefined term?',o:['triangle','point','circle','angle'],a:1,w:'Basic term.'},
 {lv:1,q:'Number of Euclid\'s postulates:',o:['3','5','7','23'],a:1,w:'Five.'},
 {lv:2,q:'"All right angles are equal" is postulate:',o:['2','3','4','5'],a:2,w:'Postulate 4.'},
 {lv:2,q:'If x + y = 10 and x = z, then z + y = 10. Axiom used:',o:['things equal to the same thing are equal','whole > part','halves are equal','coincide'],a:0,w:'Substitution.'},
 {lv:2,q:'A line has how many dimensions?',o:['0','1','2','3'],a:1,w:'Length only.'},
 {lv:3,q:'Through two distinct points, the number of lines:',o:['none','exactly one','two','infinitely many'],a:1,w:'Unique line.'},
 {lv:3,q:'Euclid\'s first proposition constructs a(n):',o:['square','equilateral triangle','circle','right angle'],a:1,w:'On a given segment.'},
 {lv:4,q:'The fifth postulate is about:',o:['circles','right angles','parallel lines','points'],a:2,w:'Parallel postulate.'},
 {lv:4,q:'Theorem 5.1 states two distinct lines have at most:',o:['no common point','one common point','two common points','infinitely many'],a:1,w:'Proof by contradiction.'},
 {lv:5,open:true,m:3,q:'Prove that every line segment has one and only one midpoint.',ans:['Assume two midpoints C and D (1)','AC = ½AB = AD (axiom 7) (1)','So C and D coincide; contradiction (1)']},
 {lv:5,open:true,m:5,q:'State Euclid\'s five postulates and explain why the fifth postulate is special.',ans:['Postulates 1–2 (1)','Postulates 3–4 (1)','Postulate 5 (1)','More complex; not self-evident (1)','Attempts to prove it led to non-Euclidean geometry (1)']}
];

const ONEMIN=['Geometry: Egypt, India, Greece.','Definitions; undefined terms.','Seven axioms.','Five postulates.','Theorems proved logically.','Axioms in everyday reasoning.'];
const KEYS=[['history',/euclid|sulbasutra|history/i],['definitions',/definition|undefined/i],['axioms',/axiom|common notion/i],['postulates',/postulate/i],['theorems',/theorem|proof/i],['apply',/midpoint|apply/i]];

/* ---------- lab ---------- */
let mode='l',pts=[],AB=120,BC=100,wired=false;
function ext(p,q){const dx=q[0]-p[0],dy=q[1]-p[1],L=Math.hypot(dx,dy)||1;return [[p[0]-dx/L*900,p[1]-dy/L*900],[q[0]+dx/L*900,q[1]+dy/L*900]]}
function draw(){let s=`<rect id="euBg" x="0" y="0" width="520" height="340" fill="transparent" style="cursor:crosshair"/>`;let msg='';
 if(mode==='l'){if(pts.length>=2){const [a,b]=ext(pts[0],pts[1]);s+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${BL}" stroke-width="2" stroke-dasharray="7 5" pointer-events="none"/><line x1="${pts[0][0]}" y1="${pts[0][1]}" x2="${pts[1][0]}" y2="${pts[1][1]}" stroke="${BL}" stroke-width="4" pointer-events="none"/>`}
  pts.forEach((p,i)=>s+=`<g pointer-events="none">${dot(p[0],p[1],'PQR'[i]||'',i<2?OR:GN)}</g>`);
  if(pts.length<2)msg=`<p>Tap ${pts.length?'a second point':'a point'} on the canvas.</p>`;
  else{msg='<p><b>Postulate 1:</b> the segment PQ joins the two points — and only one straight line passes through them. <b>Postulate 2:</b> the dashed parts show it extends forever in both directions.</p>';
   if(pts.length===3){const [p,q,r]=pts;const cr=Math.abs((q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]))/Math.hypot(q[0]-p[0],q[1]-p[1]);msg+=cr<6?'<p>R lies on line PQ — the three points are <b>collinear</b>.</p>':`<p>R is <b>not</b> on line PQ (about ${cr.toFixed(0)} units away). A different line would be needed through P and R.</p>`}else msg+='<p>Tap a third point R to test whether it lies on the line.</p>'}}
 else if(mode==='c'){if(pts.length>=2){const r=Math.hypot(pts[1][0]-pts[0][0],pts[1][1]-pts[0][1]);s+=`<circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="${r}" fill="${OR}" fill-opacity=".08" stroke="${OR}" stroke-width="3" pointer-events="none"/><line x1="${pts[0][0]}" y1="${pts[0][1]}" x2="${pts[1][0]}" y2="${pts[1][1]}" stroke="${ink}" stroke-dasharray="4 3" pointer-events="none"/>`;msg=`<p><b>Postulate 3:</b> a circle with centre O and radius ${r.toFixed(0)} units. Any centre and any radius are allowed. Tap again to start a new circle.</p>`}else msg=`<p>Tap ${pts.length?'a point on the circle':'the centre O'}.</p>`;
  pts.forEach((p,i)=>s+=`<g pointer-events="none">${dot(p[0],p[1],i?'':'O',i?GR:OR)}</g>`)}
 else{const x0=40,y=150;s+=`<line x1="${x0}" y1="${y}" x2="${x0+AB}" y2="${y}" stroke="${BL}" stroke-width="5"/><line x1="${x0+AB}" y1="${y}" x2="${x0+AB+BC}" y2="${y}" stroke="${OR}" stroke-width="5"/>`+dot(x0,y,'A')+dot(x0+AB,y,'B')+dot(x0+AB+BC,y,'C');
  s+=`<line x1="${x0}" y1="${y+60}" x2="${x0+AB+BC}" y2="${y+60}" stroke="${GN}" stroke-width="5"/>`+T(x0+(AB+BC)/2,y+85,'AC = '+(AB+BC),'font-size="14" fill="'+GN+'"')+T(x0+AB/2,y-14,'AB = '+AB,'font-size="13" fill="'+BL+'"')+T(x0+AB+BC/2,y-14,'BC = '+BC,'font-size="13" fill="'+OR+'"');
  msg=`<p><b>Whole &gt; part (axiom 5):</b> AC = ${AB+BC} is greater than AB = ${AB} and greater than BC = ${BC}.</p><p><b>Equals added to equals (axiom 2):</b> ${AB===BC?'AB = BC, so AB + BC = 2AB — "things double of the same thing are equal".':'Make AB = BC to see "doubles of the same thing are equal".'}</p>`}
 $('#euSvg').innerHTML=s;$('#euOut').innerHTML=msg;$('#euA').style.display=mode==='a'?'':'none';if(mode==='a'){$('#euABv').textContent=AB;$('#euBCv').textContent=BC}}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('click',e=>{if(!e.target||e.target.id!=='euBg')return;const svg=$('#euSvg');const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const p=pt.matrixTransform(svg.getScreenCTM().inverse());const P=[Math.round(p.x),Math.round(p.y)];
  if(mode==='l'){if(pts.length>=3)pts=[];pts.push(P)}else if(mode==='c'){if(pts.length>=2)pts=[];pts.push(P)}draw()});
 document.addEventListener('input',e=>{const el=e.target;if(!el||!el.classList||!el.classList.contains('euS'))return;if(el.id==='euAB')AB=+el.value;else BC=+el.value;draw()})}
function labClick(b){if(b.id==='euClr'){pts=[];draw();return true}return false}
function labChange(el){if(el.id==='euM'){mode=el.value;pts=[];draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
