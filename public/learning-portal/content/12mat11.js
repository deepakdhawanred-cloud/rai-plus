/* Rai Plus content pack: Class 12 Mathematics, Chapter 11 – Three Dimensional Geometry (rationalised: lines only) */
RP.register({key:'12mat11',cls:'12',subject:'Mathematics',ch:'11',title:"Three Dimensional Geometry",color:'#2d4f8a',
crumb:"HBSE Class 12 Mathematics · Unit: Vectors and 3D Geometry · Taught in December",h1:"Chapter 11: Three Dimensional Geometry",sub:"Direction cosines, equations of lines in space, the angle between two lines and the shortest distance between skew lines.",heroLabel:"Two skew lines in space with the shortest segment joining them",labName:'Lines in space lab',
theme:"\n:root{--g:light-dark(#2d4f8a,#a6c1ee);--g2:light-dark(#ebf0f9,#0e1424);--line:light-dark(#d1dcf0,#26324d);--bg:light-dark(#ffffff,#0a0e18);--card:light-dark(#ffffff,#0f1422);\n--ink:light-dark(#0f1626,#e3e9f6);--mute:light-dark(#4f5b72,#a8b4cb);--y:light-dark(#b3541e,#f2a774);--y2:light-dark(#fbeee4,#2a170a);--hd:#203b69}\n",
labHTML:`  <h2>Lines in space lab</h2>
  <p>Each line is r = a + λb. Change the numbers; drag the picture to rotate it. The lab finds the angle between the lines and the shortest distance, and draws the shortest segment.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="lSvg" viewBox="0 0 440 400" role="img" aria-label="Two lines in 3D; drag to rotate" style="color:var(--ink);touch-action:none;cursor:grab"></svg></div></div>
  <div><div class="ctrl"><label>Preset<select id="lPre"><option value="ncert">Skew (textbook example)</option><option value="int">Intersecting</option><option value="par">Parallel</option><option value="perp">Perpendicular, skew</option></select></label></div>
  <div id="lIn"></div><div class="box y" id="lOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#2d4f8a',LABNAME='Lines in space lab',MIND_CENTER='3D geometry';
const BL='#2d4f8a',OR='#b3541e',GN='#3b6d11',GR='#888780',PU='#7f77dd',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,'font-size="14" '+o);
const V={add:(a,b)=>a.map((x,i)=>x+b[i]),sub:(a,b)=>a.map((x,i)=>x-b[i]),mul:(a,k)=>a.map(x=>x*k),dot:(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cr:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len:a=>Math.hypot(...a)};
const fx=(n,d=3)=>{const r=+n.toFixed(d);return Object.is(r,-0)?'0':String(r)};
/* static oblique projection for figures */
const P0=(p,ox=260,oy=140,k=40)=>[ox+k*(p[1]-0.55*p[0]),oy-k*(p[2]-0.35*p[0])];
const ax3=(ox,oy,k,L=3)=>{const O=P0([0,0,0],ox,oy,k),X=P0([L,0,0],ox,oy,k),Y=P0([0,L,0],ox,oy,k),Z=P0([0,0,L],ox,oy,k);return [['x',X],['y',Y],['z',Z]].map(([n,q])=>`<line x1="${O[0]}" y1="${O[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${GR}" stroke-width="1.5"/>`+T(q[0]+(n==='x'?-8:8),q[1]+(n==='z'?-6:4),n,'font-size="13"')).join('')};
const seg3=(a,b,c=BL,w=2.5,ox=260,oy=140,k=40,d='')=>{const p=P0(a,ox,oy,k),q=P0(b,ox,oy,k);return `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${c}" stroke-width="${w}" ${d?`stroke-dasharray="${d}"`:''}/>`};
function heroDraw(){return `<line x1="20" y1="110" x2="160" y2="30" stroke="#fff" stroke-width="3"/><line x1="120" y1="120" x2="260" y2="70" stroke="#fff" stroke-width="3" opacity=".8"/><line x1="98" y1="66" x2="150" y2="102" stroke="#f2a774" stroke-width="3" stroke-dasharray="5 4"/>`}
const HERO=heroDraw;
const MIND=[['Direction cosines',100,50],['Direction ratios',420,50],['Line: r = a + λb',90,150],['Cartesian form',430,150],['Angle between lines',110,250],['Shortest distance',410,250]];

const C=[
{id:'g1',num:'11.2',title:'Direction cosines and direction ratios',
 intro:'How do you describe the direction of a line in space with just three numbers?',
 obj:'Define direction cosines (l, m, n) and direction ratios (a, b, c), use l² + m² + n² = 1, and find them for a line through two points.',
 prior:'Vectors (Ch 10): unit vectors, components.',
 simple:'If a directed line makes angles α, β, γ with the positive x, y and z axes, then l = cos α, m = cos β, n = cos γ are its direction cosines. They satisfy l² + m² + n² = 1. Any three numbers a, b, c proportional to l, m, n are direction ratios. From direction ratios: l = ±a/√(a² + b² + c²), and similarly for m, n.',
 detail:'Reversing the direction of the line changes the signs of the direction cosines, so a line (not directed) has two sets: ±(l, m, n). A line has infinitely many sets of direction ratios but only these two sets of direction cosines. The unit vector along a line with DCs l, m, n is l î + m ĵ + n k̂. For a line through P(x₁, y₁, z₁) and Q(x₂, y₂, z₂): direction ratios are x₂ − x₁, y₂ − y₁, z₂ − z₁, and direction cosines are these divided by PQ = √[(x₂ − x₁)² + (y₂ − y₁)² + (z₂ − z₁)²]. Example: a line makes 90°, 135°, 45° with the axes: DCs are 0, −1/√2, 1/√2. Example: DRs 2, −1, −2 → DCs 2/3, −1/3, −2/3. Points A(2, 3, −4), B(1, −2, 3), C(3, 8, −11) are collinear because the DRs of AB (−1, −5, 7) and BC (2, 10, −14) are proportional.',
 real:'Pilots and drone software describe headings in 3D using exactly such direction numbers.',
 apply:'Find the direction cosines of the line through (−2, 4, −5) and (1, 2, 3).',
 see:{w:520,h:280,f:[
  ['Axes x, y, z.',ax3(260,170,45)],
  ['A line through O making angles α, β, γ with the axes.',seg3([0,0,0],[1.5,2,2.2],OR,3,260,170,45)+(()=>{const p=P0([1.5,2,2.2],260,170,45);return `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${OR}"/>`+lbl(p[0]+10,p[1],'P','font-size="13"')})()],
  ['l = cos α, m = cos β, n = cos γ; l² + m² + n² = 1.',lbl(400,250,'l² + m² + n² = 1','font-weight="700"')+lbl(120,250,'DRs a, b, c ∝ l, m, n','font-size="13"')]]},
 seeNote:'α, β, γ are measured from the positive axes.',
 do:{title:'Check the identity',mat:'Calculator',steps:['Take DRs 2, 3, 6.','Divide each by √(4 + 9 + 36) = 7.','Square and add.'],obs:'4/49 + 9/49 + 36/49 = 1.',why:'DCs are components of a unit vector.',lab:false},
 memo:'"Cosines of the axis-angles; squares add to 1."',
 miscon:['"Direction ratios are unique." Any proportional set works.','"l + m + n = 1." It is l² + m² + n² = 1.'],
 terms:['Direction cosines','Direction ratios','Directed line','Collinear points'],
 q:{q:'If a line has DRs 2, −1, −2, its DCs are:',o:['2, −1, −2','2/3, −1/3, −2/3','2/9, −1/9, −2/9','1/3, 1/3, 1/3'],a:1,why:'Divide by 3.'},
 exam:'DCs from DRs or two points: 2 marks; collinearity check: 2 marks.'},

{id:'g2',num:'11.3',title:'Equation of a line in space',
 intro:'Give a starting point and a direction. Can you write every point on the line with one parameter?',
 obj:'Write the vector and Cartesian equations of a line through a given point and parallel to a given vector.',
 prior:'Position vectors; direction ratios.',
 simple:'A line through a point A (position vector a) parallel to vector b: r = a + λb, where λ is a real number (parameter). If A = (x₁, y₁, z₁) and b has direction ratios a, b, c, the Cartesian form is (x − x₁)/a = (y − y₁)/b = (z − z₁)/c.',
 detail:'Each value of λ gives one point on the line. If l, m, n are the direction cosines, the Cartesian equation is (x − x₁)/l = (y − y₁)/m = (z − z₁)/n. Example: line through (5, 2, −4) parallel to 3î + 2ĵ − 8k̂: r = 5î + 2ĵ − 4k̂ + λ(3î + 2ĵ − 8k̂); Cartesian (x − 5)/3 = (y − 2)/2 = (z + 4)/(−8). Converting Cartesian to vector form: read the point from the numerators (watch signs) and the DRs from the denominators. Example: (x − 5)/3 = (y + 4)/7 = (z − 6)/2 passes through (5, −4, 6) with DRs 3, 7, 2. A line through two points with position vectors a and b: r = a + λ(b − a). A general point on (x − x₁)/a = (y − y₁)/b = (z − z₁)/c is (x₁ + aλ, y₁ + bλ, z₁ + cλ).',
 real:'Computer games and 3D graphics trace light rays as r = a + λb to see which object a ray hits first.',
 apply:'Write the vector and Cartesian equations of the line through (−2, 4, −5) parallel to (x + 3)/3 = (y − 4)/5 = (z + 8)/6.',
 see:{w:520,h:280,f:[
  ['Point A and direction vector b.',ax3(260,170,45)+(()=>{const A=P0([0.5,-1,1],260,170,45),B=P0([0.5+0.6,-1+0.8,1+0.5],260,170,45);return `<circle cx="${A[0]}" cy="${A[1]}" r="5" fill="${OR}"/><line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${GN}" stroke-width="3"/>`+lbl(A[0]-12,A[1]+16,'A','font-size="13"')+lbl(B[0]+10,B[1],'b','font-size="13" fill="'+GN+'"')})()],
  ['All points r = a + λb lie on one line.',seg3([0.5-0.6*2,-1-0.8*2,1-0.5*2],[0.5+0.6*3,-1+0.8*3,1+0.5*3],BL,2.5,260,170,45)+[-1,2].map(l=>{const p=P0([0.5+0.6*l,-1+0.8*l,1+0.5*l],260,170,45);return `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${BL}"/>`+T(p[0]+(l<0?-14:16),p[1]+(l<0?14:-8),'λ = '+l,'font-size="11"')}).join('')],
  ['Cartesian: (x − x₁)/a = (y − y₁)/b = (z − z₁)/c.',lbl(260,265,'(x − x₁)/a = (y − y₁)/b = (z − z₁)/c','font-weight="700"')]]},
 seeNote:'λ can be any real number.',
 do:{title:'Generate points',mat:'Graph paper (or a 3D app)',steps:['Take r = (1, 2, 3) + λ(2, −1, 1).','Find points for λ = −1, 0, 1, 2.','Check they satisfy the Cartesian form.'],obs:'(−1, 3, 2), (1, 2, 3), (3, 1, 4), (5, 0, 5).',why:'Each λ gives a point.',lab:false},
 memo:'"Point plus λ times direction."',
 miscon:['"(x + 3)/2 passes through x = 3." It passes through x = −3.','"The denominators are the point." They are the direction ratios.'],
 terms:['Parameter λ','Vector equation','Cartesian equation','General point'],
 q:{q:'The line (x − 2)/3 = (y + 1)/4 = (z − 5)/(−2) passes through:',o:['(3, 4, −2)','(2, −1, 5)','(−2, 1, −5)','(2, 1, 5)'],a:1,why:'Change signs of the numerator constants.'},
 exam:'Writing vector and Cartesian forms: 2–3 marks.'},

{id:'g3',num:'11.4',title:'Angle between two lines',
 intro:'Two lines in space may never meet. What is the angle between them?',
 obj:'Find the angle between two lines and test for perpendicular and parallel lines.',
 prior:'Dot product; direction ratios.',
 simple:'The angle between two lines is the angle between their direction vectors. If the DRs are a₁, b₁, c₁ and a₂, b₂, c₂: cos θ = |a₁a₂ + b₁b₂ + c₁c₂| / [√(a₁² + b₁² + c₁²) √(a₂² + b₂² + c₂²)]. In vector form, for r = a₁ + λb₁ and r = a₂ + μb₂: cos θ = |b₁ · b₂| / (|b₁| |b₂|).',
 detail:'The modulus gives the acute angle. With direction cosines: cos θ = |l₁l₂ + m₁m₂ + n₁n₂|. Perpendicular lines: a₁a₂ + b₁b₂ + c₁c₂ = 0. Parallel lines: a₁/a₂ = b₁/b₂ = c₁/c₂. Example: (x + 3)/3 = (y − 1)/5 = (z + 3)/4 and (x + 1)/1 = (y − 4)/1 = (z − 5)/2: cos θ = |3 + 5 + 8|/(√50 √6) = 16/(5√2 · √6) = 8√3/15. Example: find p so that (1 − x)/3 = (7y − 14)/(2p) = (z − 3)/2 and (7 − 7x)/(3p) = (y − 5)/1 = (6 − z)/5 are perpendicular: first rewrite in standard form, DRs (−3, 2p/7, 2) and (−3p/7, 1, −5); dot = 9p/7 + 2p/7 − 10 = 0 → p = 70/11.',
 real:'Engineers check that supporting beams in a 3D frame meet at the right angles using this formula.',
 apply:'Find the angle between r = 3î + 2ĵ − 4k̂ + λ(î + 2ĵ + 2k̂) and r = 5î − 2ĵ + μ(3î + 2ĵ + 6k̂).',
 see:{w:520,h:260,f:[
  ['Directions b₁ and b₂ drawn from one point.',`<line x1="260" y1="180" x2="440" y2="90" stroke="${BL}" stroke-width="3"/><line x1="260" y1="180" x2="380" y2="40" stroke="${OR}" stroke-width="3"/>`+lbl(450,90,'b₁','fill="'+BL+'"')+lbl(390,34,'b₂','fill="'+OR+'"')],
  ['θ between them: cos θ = |b₁ · b₂| / (|b₁||b₂|).',`<path d="M320 150 A68 68 0 0 0 304 128" fill="none" stroke="${ink}" stroke-width="2"/>`+lbl(330,128,'θ')],
  ['Perpendicular: a₁a₂ + b₁b₂ + c₁c₂ = 0. Parallel: ratios equal.',lbl(260,235,'⊥: sum of products = 0   ·   ∥: a₁/a₂ = b₁/b₂ = c₁/c₂','font-size="13" font-weight="700"')]]},
 seeNote:'For skew lines, move one direction to start at a common point.',
 do:{title:'Pencil angles',mat:'Two pencils',steps:['Hold two pencils so they do not touch.','Slide one parallel to itself until it touches the other.'],obs:'The angle you see now is the angle between the lines.',why:'Angle depends only on direction.',lab:false},
 memo:'"Dot the directions, divide by lengths."',
 miscon:['"Skew lines have no angle." The angle is defined by their directions.','"Use the points in the formula." Only the direction vectors matter.'],
 terms:['Angle between lines','Perpendicular lines','Parallel lines','Acute angle'],
 q:{q:'Lines with DRs (1, 2, 3) and (3, 0, −1) are:',o:['parallel','perpendicular','coincident','at 45°'],a:1,why:'3 + 0 − 3 = 0.'},
 exam:'Angle between lines and the "find p for perpendicular" type: 3–4 marks.'},

{id:'g4',num:'11.5',title:'Shortest distance between two lines',
 intro:'Two flyovers cross one above the other without meeting. How close do they come?',
 obj:'Identify intersecting, parallel and skew lines and find the shortest distance between skew and parallel lines.',
 prior:'Cross product; projection of a vector.',
 simple:'Lines in space that are neither parallel nor intersecting are skew lines; they lie in different planes. The shortest distance is the length of the segment perpendicular to both. For r = a₁ + λb₁ and r = a₂ + μb₂: d = |(b₁ × b₂) · (a₂ − a₁)| / |b₁ × b₂|. If d = 0, the lines intersect.',
 detail:'Why: b₁ × b₂ is perpendicular to both lines; the shortest distance is the projection of the joining vector a₂ − a₁ onto this common perpendicular. Cartesian form: d = |det[[x₂ − x₁, y₂ − y₁, z₂ − z₁],[a₁, b₁, c₁],[a₂, b₂, c₂]]| / √[(b₁c₂ − b₂c₁)² + (c₁a₂ − c₂a₁)² + (a₁b₂ − a₂b₁)²]. Parallel lines r = a₁ + λb and r = a₂ + μb: d = |b × (a₂ − a₁)| / |b|. Example (textbook type): r = î + ĵ + λ(2î − ĵ + k̂) and r = 2î + ĵ − k̂ + μ(3î − 5ĵ + 2k̂): b₁ × b₂ = 3î − ĵ − 7k̂, |b₁ × b₂| = √59, a₂ − a₁ = î − k̂, dot = 3 + 7 = 10, so d = 10/√59. Example (parallel): r = î + 2ĵ − 4k̂ + λ(2î + 3ĵ + 6k̂) and r = 3î + 3ĵ − 5k̂ + μ(2î + 3ĵ + 6k̂): b × (a₂ − a₁) = (2, 3, 6) × (2, 1, −1) = (−9, 14, −4), length √293, |b| = 7, d = √293/7.',
 real:'Road designers make sure the shortest distance between a flyover and the road below gives enough clearance for trucks.',
 apply:'Find the shortest distance between (x + 1)/7 = (y + 1)/(−6) = (z + 1)/1 and (x − 3)/1 = (y − 5)/(−2) = (z − 7)/1.',
 see:{w:520,h:280,f:[
  ['Two skew lines: not parallel, never meet.',seg3([-2,-2,0],[2,2,0],BL,3,260,170,40)+seg3([-2,2,2],[2,-2,2],OR,3,260,170,40)],
  ['The common perpendicular PQ joins them.',seg3([0,0,0],[0,0,2],GN,3,260,170,40,'6 4')+(()=>{const p=P0([0,0,0],260,170,40),q=P0([0,0,2],260,170,40);return `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${GN}"/><circle cx="${q[0]}" cy="${q[1]}" r="4" fill="${GN}"/>`+lbl(p[0]+12,p[1]+12,'P','font-size="13"')+lbl(q[0]+12,q[1]-6,'Q','font-size="13"')})()],
  ['d = |(b₁ × b₂) · (a₂ − a₁)| / |b₁ × b₂|.',lbl(260,265,'d = |(b₁ × b₂) · (a₂ − a₁)| / |b₁ × b₂|','font-weight="700"')]]},
 seeNote:'PQ is perpendicular to both lines.',
 do:{title:'Two pencils in a box',mat:'A shoebox, two pencils, a ruler',steps:['Tape one pencil along the bottom edge and one across the top in another direction.','Find the shortest gap with a ruler.'],obs:'The shortest gap is the box\'s height, perpendicular to both.',why:'Common perpendicular.',lab:true},
 memo:'"Cross the directions, dot with the gap, divide by the cross."',
 miscon:['"Shortest distance = distance between the given points." The points are arbitrary; use the formula.','"Non-parallel lines in space must meet." They may be skew.'],
 terms:['Skew lines','Coplanar','Common perpendicular','Shortest distance'],
 q:{q:'If the shortest distance between two non-parallel lines is 0, the lines:',o:['are skew','intersect','are parallel','are perpendicular'],a:1,why:'d = 0 ⇒ they meet.'},
 exam:'Shortest distance between skew/parallel lines: 4–5 marks every year.'}
];

const CARDS=[['Direction cosines','l = cos α, m = cos β, n = cos γ; l² + m² + n² = 1.'],['From DRs','l = a/√(a² + b² + c²), etc.'],['Through two points','DRs: x₂ − x₁, y₂ − y₁, z₂ − z₁.'],['Vector line','r = a + λb.'],['Cartesian line','(x − x₁)/a = (y − y₁)/b = (z − z₁)/c.'],['Through two points','r = a + λ(b − a).'],['Angle','cos θ = |b₁·b₂|/(|b₁||b₂|).'],['Perpendicular','a₁a₂ + b₁b₂ + c₁c₂ = 0.'],['Parallel','a₁/a₂ = b₁/b₂ = c₁/c₂.'],['Skew lines','Neither parallel nor intersecting.'],['SD (skew)','|(b₁ × b₂)·(a₂ − a₁)| / |b₁ × b₂|.'],['SD (parallel)','|b × (a₂ − a₁)| / |b|.'],['Intersecting','Non-parallel and SD = 0.']];

const Q=[
 {lv:1,q:'For direction cosines l, m, n: l² + m² + n² =',o:['0','1','2','3'],a:1,w:'Unit vector.'},
 {lv:1,q:'Direction cosines of the y-axis:',o:['1, 0, 0','0, 1, 0','0, 0, 1','1, 1, 1'],a:1,w:'α = 90°, β = 0°, γ = 90°.'},
 {lv:1,q:'The line r = a + λb is parallel to:',o:['a','b','a + b','a × b'],a:1,w:'b is the direction.'},
 {lv:1,q:'Two lines are perpendicular if:',o:['a₁a₂ + b₁b₂ + c₁c₂ = 0','a₁/a₂ = b₁/b₂ = c₁/c₂','a₁ + a₂ = 0','l₁ = l₂'],a:0,w:'Dot product zero.'},
 {lv:2,q:'DCs of a line with DRs 2, −1, −2:',o:['2/3, −1/3, −2/3','2, −1, −2','1/3, −1/3, 1/3','2/9, −1/9, −2/9'],a:0,w:'Divide by 3.'},
 {lv:2,q:'The point on (x − 2)/3 = (y + 1)/4 = (z − 5)/(−2) for λ = 1:',o:['(5, 3, 3)','(2, −1, 5)','(3, 4, −2)','(5, −3, 3)'],a:0,w:'(2 + 3, −1 + 4, 5 − 2).'},
 {lv:2,q:'Lines with DRs (1, 2, 3) and (2, 4, 6) are:',o:['perpendicular','parallel','skew','at 60°'],a:1,w:'Proportional.'},
 {lv:3,q:'cos of the angle between lines with DRs (1, 2, 2) and (3, 2, 6):',o:['19/21','1/3','6/7','5/21'],a:0,w:'(3 + 4 + 12)/(3 × 7).'},
 {lv:3,q:'SD between r = î + ĵ + λ(2î − ĵ + k̂) and r = 2î + ĵ − k̂ + μ(3î − 5ĵ + 2k̂):',o:['10/√59','√59/10','3/√59','0'],a:0,w:'b₁ × b₂ = (3, −1, −7); dot (1, 0, −1) = 10.'},
 {lv:3,q:'DCs of the line through (−2, 4, −5) and (1, 2, 3):',o:['3/√77, −2/√77, 8/√77','3, −2, 8','−3/√77, 2/√77, 8/√77','1/3, 1/3, 1/3'],a:0,w:'DRs (3, −2, 8), length √77.'},
 {lv:4,q:'Assertion (A): If d = 0 for two non-parallel lines, they intersect. Reason (R): Skew lines have a non-zero shortest distance.',o:['Both true and R explains A','Both true, R does not explain A','A true, R false','A false, R true'],a:0,w:'Non-parallel and not skew ⇒ intersecting.'},
 {lv:4,q:'A(2, 3, −4), B(1, −2, 3), C(3, 8, −11) are:',o:['collinear','vertices of a right triangle','coplanar but not collinear','none'],a:0,w:'DRs of AB and BC proportional.'},
 {lv:4,q:'The shortest distance between two parallel lines r = a₁ + λb and r = a₂ + μb is:',o:['|b·(a₂ − a₁)|/|b|','|b × (a₂ − a₁)|/|b|','|a₂ − a₁|','|b|'],a:1,w:'Standard result.'},
 {lv:5,open:true,m:4,q:'Find the shortest distance between r = î + 2ĵ + k̂ + λ(î − ĵ + k̂) and r = 2î − ĵ − k̂ + μ(2î + ĵ + 2k̂).',ans:['b₁ × b₂ = (1, −1, 1) × (2, 1, 2) = (−3, 0, 3) (1).','|b₁ × b₂| = 3√2; a₂ − a₁ = (1, −3, −2) (1).','(b₁ × b₂)·(a₂ − a₁) = −3 + 0 − 6 = −9 (1).','d = 9/(3√2) = 3/√2 = 3√2/2 (1).']},
 {lv:5,open:true,m:3,q:'Find p so that the lines (1 − x)/3 = (7y − 14)/(2p) = (z − 3)/2 and (7 − 7x)/(3p) = (y − 5)/1 = (6 − z)/5 are at right angles.',ans:['Standard forms: DRs (−3, 2p/7, 2) and (−3p/7, 1, −5) (1).','Perpendicular: 9p/7 + 2p/7 − 10 = 0 (1).','11p = 70 ⇒ p = 70/11 (1).']},
 {lv:5,open:true,m:3,q:'Find the vector and Cartesian equations of the line through (1, 2, 3) parallel to 3î + 2ĵ − 2k̂.',ans:['r = î + 2ĵ + 3k̂ + λ(3î + 2ĵ − 2k̂) (1).','DRs 3, 2, −2 (1).','(x − 1)/3 = (y − 2)/2 = (z − 3)/(−2) (1).']}
];

const ONEMIN=['l = cos α, m = cos β, n = cos γ; l² + m² + n² = 1.','DRs ∝ DCs; l = a/√(a² + b² + c²).','Through two points: DRs = differences of coordinates.','Line: r = a + λb; (x − x₁)/a = (y − y₁)/b = (z − z₁)/c.','Angle: cos θ = |b₁·b₂|/(|b₁||b₂|).','⊥: Σa₁a₂ = 0; ∥: ratios equal.','Skew: neither parallel nor intersecting.','SD skew = |(b₁ × b₂)·(a₂ − a₁)|/|b₁ × b₂|.','SD parallel = |b × (a₂ − a₁)|/|b|.','d = 0 for non-parallel lines ⇒ they intersect.'];
const KEYS=[['direction cosines',/direction cosine|cos α|l²/i],['direction ratios',/direction ratio|DR/i],['r = a + λb',/λ|lambda|r\s*=/i],['Cartesian form',/\(x\s*[−-]/],['angle formula',/cos θ|angle/i],['perpendicular',/perpendicular|⊥/i],['parallel',/parallel|∥/i],['skew',/skew/i],['shortest distance',/shortest|SD/i],['cross product',/×|cross/i]];

/* ---------- lab ---------- */
const PRE={ncert:[[1,1,0],[2,-1,1],[2,1,-1],[3,-5,2]],int:[[0,0,0],[1,1,1],[2,0,0],[-1,1,1]],par:[[1,2,-4],[2,3,6],[3,3,-5],[2,3,6]],perp:[[0,0,0],[1,0,0],[0,0,2],[0,1,0]]};
let L=JSON.parse(JSON.stringify(PRE.ncert)),yaw=-0.7,pitch=0.35,drag=null;
let CEN=[0,0,0];function proj(p){p=V.sub(p,CEN);const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);const x=p[0]*cy-p[1]*sy,y=p[0]*sy+p[1]*cy;const z=p[2];const yy=y*cp-z*sp*0,X=x,Y=z*cp-y*sp;return [220+X*28,200-Y*28]}
function closest(a1,b1,a2,b2){const w=V.sub(a1,a2),A=V.dot(b1,b1),B=V.dot(b1,b2),Cc=V.dot(b2,b2),D=V.dot(b1,w),E=V.dot(b2,w),den=A*Cc-B*B;if(Math.abs(den)<1e-9){return [a1,V.add(a2,V.mul(b2,E/Cc))]}const s=(B*E-Cc*D)/den,t=(A*E-B*D)/den;return [V.add(a1,V.mul(b1,s)),V.add(a2,V.mul(b2,t))]}
function draw(){const [a1,b1,a2,b2]=L;CEN=V.mul(V.add(a1,a2),0.5);let s='';const ax=[[[-4,0,0],[4,0,0],'x'],[[0,-4,0],[0,4,0],'y'],[[0,0,-4],[0,0,4],'z']];
 ax.forEach(([p,q,n])=>{const P=proj(p),Q=proj(q);s+=`<line x1="${P[0]}" y1="${P[1]}" x2="${Q[0]}" y2="${Q[1]}" stroke="${GR}" stroke-width="1"/>`+T(Q[0]+6,Q[1],n,'font-size="13"')});
 const line=(a,b,c)=>{const n=V.len(b)||1,u=V.mul(b,4/n);const P=proj(V.sub(a,u)),Q=proj(V.add(a,u)),A=proj(a);return `<line x1="${P[0]}" y1="${P[1]}" x2="${Q[0]}" y2="${Q[1]}" stroke="${c}" stroke-width="3"/><circle cx="${A[0]}" cy="${A[1]}" r="4" fill="${c}"/>`};
 s+=line(a1,b1,BL)+line(a2,b2,OR);
 const cr=V.cr(b1,b2),crl=V.len(cr),g=V.sub(a2,a1);let d,kind,ang;const cosT=Math.abs(V.dot(b1,b2))/(V.len(b1)*V.len(b2));ang=Math.acos(Math.min(1,cosT))*180/Math.PI;
 if(crl<1e-9){d=V.len(V.cr(b1,g))/V.len(b1);kind=d<1e-9?'coincident':'parallel'}else{d=Math.abs(V.dot(cr,g))/crl;kind=d<1e-9?'intersecting':'skew'}
 const [P,Q]=closest(a1,b1,a2,b2);if(d>1e-9){const p=proj(P),q=proj(Q);s+=`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${GN}" stroke-width="3" stroke-dasharray="6 4"/><circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${GN}"/><circle cx="${q[0]}" cy="${q[1]}" r="4" fill="${GN}"/>`}else if(kind==='intersecting'){const p=proj(P);s+=`<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="none" stroke="${GN}" stroke-width="3"/>`}
 s+=T(10,390,'drag to rotate','font-size="11" text-anchor="start"');
 $('#lSvg').innerHTML=s;const v=x=>'('+x.map(n=>fx(n,2)).join(', ')+')';
 $('#lOut').innerHTML=`<p>Line 1: r = ${v(a1)} + λ${v(b1)}<br>Line 2: r = ${v(a2)} + μ${v(b2)}</p><p>b₁ × b₂ = ${v(cr)}, |b₁ × b₂| = ${fx(crl)}</p><p>Angle between lines: <b>${fx(ang,2)}°</b>${Math.abs(V.dot(b1,b2))<1e-9?' (perpendicular)':''}</p><p>Type: <b>${kind}</b>; shortest distance <b>${fx(d)}</b>${kind==='skew'?` = |${fx(V.dot(cr,g))}| / ${fx(crl)}`:''}</p>${kind==='skew'||kind==='parallel'?`<p>Closest points: ${v(P)} and ${v(Q)} (green)</p>`:kind==='intersecting'?`<p>They meet at ${v(P)}.</p>`:''}`}
function inputs(){const nm=['a₁','b₁','a₂','b₂'];return L.map((vec,i)=>`<div class="ctrl" style="gap:4px;align-items:center"><span style="min-width:2em;font-weight:700;color:${i<2?BL:OR}">${nm[i]}</span>${vec.map((x,j)=>`<input class="lV" data-i="${i}" data-j="${j}" type="number" step="1" value="${x}" style="width:4.2em">`).join('')}</div>`).join('')}
function svgPt(e){return [e.clientX,e.clientY]}
let wired=false;
function labInit(){if(wired)return;wired=true;
 document.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('#lSvg')){drag=svgPt(e);e.preventDefault()}});
 document.addEventListener('pointermove',e=>{if(!drag||!$('#lSvg'))return;const p=svgPt(e);yaw+=(p[0]-drag[0])*0.01;pitch=Math.max(-1.3,Math.min(1.3,pitch+(p[1]-drag[1])*0.01));drag=p;draw()});
 document.addEventListener('pointerup',()=>{drag=null});
 document.addEventListener('input',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('lV'))labChange(t)})}
function labShow(){$('#lIn').innerHTML=inputs();draw()}
function labClick(){return false}
function labChange(t){if(t.id==='lPre'){L=JSON.parse(JSON.stringify(PRE[t.value]));labShow();return true}if(t.classList&&t.classList.contains('lV')){const v=parseFloat(t.value);if(!isNaN(v)){L[+t.dataset.i][+t.dataset.j]=v;if(V.len(L[1])&&V.len(L[3]))draw()}return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
