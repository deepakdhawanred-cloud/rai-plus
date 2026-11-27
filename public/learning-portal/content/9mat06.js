/* Rai Plus content pack: Class 9 Mathematics, Chapter 6 – Lines and Angles (rationalised NCERT). */
RP.register({key:'9mat06',cls:'9',subject:'Mathematics',ch:'6',title:"Lines and Angles",color:'#1f5f8b',
crumb:"HBSE Class 9 Mathematics · Unit: Geometry · Taught in September",h1:"Chapter 6: Lines and Angles",sub:"Basic terms, linear pairs, vertically opposite angles, angles made by a transversal with parallel lines, and the angle sum of a triangle.",heroLabel:"Two parallel lines cut by a transversal",labName:'Transversal explorer',
theme:"\n:root{--g:light-dark(#1f5f8b,#8cc4ea);--g2:light-dark(#eaf3fa,#081520);--line:light-dark(#cde1f0,#22394b);--bg:light-dark(#ffffff,#08111a);--card:light-dark(#ffffff,#0e1822);\n--ink:light-dark(#0f2233,#e2eef7);--mute:light-dark(#4a6075,#aac0d2);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#174a6d}\n",
labHTML:`  <h2>Transversal explorer</h2>
  <p>A transversal cuts two lines, making eight angles. Turn the transversal and tilt the lower line. Choose a pair type to highlight it. When the lines are parallel, corresponding and alternate angles are equal and co-interior angles add to 180°.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="trSvg" viewBox="0 0 520 340" role="img" aria-label="Transversal" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label><span>Transversal angle: <b id="trTv"></b>°</span><input type="range" class="trS" id="trT" min="30" max="150" value="60"></label></div>
  <div class="ctrl"><label><span>Tilt of lower line: <b id="trKv"></b>°</span><input type="range" class="trS" id="trK" min="-20" max="20" value="0"></label></div>
  <div class="ctrl"><label>Highlight<select id="trP"><option value="c">Corresponding angles</option><option value="a">Alternate interior angles</option><option value="i">Co-interior angles</option><option value="v">Vertically opposite angles</option><option value="l">Linear pair</option></select></label></div>
  <div class="box y" id="trOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#1f5f8b',LABNAME='Transversal explorer',MIND_CENTER='Lines & angles';
const BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',RD='#c0392b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const rad=d=>d*Math.PI/180;
function arc(cx,cy,r,a1,a2,c,fill=false){const p1=[cx+r*Math.cos(rad(a1)),cy-r*Math.sin(rad(a1))],p2=[cx+r*Math.cos(rad(a2)),cy-r*Math.sin(rad(a2))];const large=((a2-a1+360)%360)>180?1:0;return `<path d="M${fill?cx+' '+cy+' L':''}${p1[0].toFixed(1)} ${p1[1].toFixed(1)} A${r} ${r} 0 ${large} 0 ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}${fill?'Z':''}" fill="${fill?c:'none'}" fill-opacity="${fill?.3:0}" stroke="${c}" stroke-width="2.5"/>`}
const ray=(x,y,deg,L,c=ink,w=2.5)=>`<line x1="${x}" y1="${y}" x2="${x+L*Math.cos(rad(deg))}" y2="${y-L*Math.sin(rad(deg))}" stroke="${c}" stroke-width="${w}"/>`;
function heroDraw(){return `<line x1="30" y1="45" x2="320" y2="45" stroke="#fff" stroke-width="3"/><line x1="30" y1="105" x2="320" y2="105" stroke="#fff" stroke-width="3"/><line x1="110" y1="140" x2="230" y2="10" stroke="#fff" stroke-width="3"/>`}
const HERO=heroDraw;
const MIND=[['Basic terms',100,50],['Linear pair',420,50],['Vertically opposite',90,150],['Transversal angles',430,150],['Parallel lines',110,250],['Triangle angle sum',410,250]];

const C=[
{id:'g1',num:'6.1',title:'Basic terms and types of angles',
 intro:'The hands of a clock make different angles through the day. Can you name them all?',
 obj:'Recall line, segment, ray, collinear points and types of angles and angle pairs.',
 prior:'Class 6–7: lines and angles.',
 simple:'A line segment has two end points; a ray has one end point; a line has none. Three or more points on one line are collinear. Angle types: acute (< 90°), right (= 90°), obtuse (between 90° and 180°), straight (= 180°), reflex (between 180° and 360°). Complementary angles add to 90°; supplementary angles add to 180°.',
 detail:'Adjacent angles share a common vertex and a common arm, and their other arms lie on opposite sides of the common arm. When two adjacent angles are such that their non-common arms form a line, they form a linear pair. The complement of 35° is 55°; its supplement is 145°.',
 real:'A clock at 3:00 shows a right angle; at 6:00 a straight angle.',
 apply:'Find the angle that equals its own complement, and one that is twice its supplement.',
 see:{w:520,h:200,f:[
  ['Acute and right.',ray(40,150,0,80)+ray(40,150,45,80)+arc(40,150,22,0,45,OR)+lbl(70,180,'acute')+ray(150,150,0,80)+ray(150,150,90,80)+`<rect x="150" y="136" width="14" height="14" fill="none" stroke="${OR}" stroke-width="2"/>`+lbl(190,180,'right')],
  ['Obtuse and straight.',ray(290,150,0,60)+ray(290,150,130,70)+arc(290,150,20,0,130,OR)+lbl(290,180,'obtuse')+`<line x1="390" y1="150" x2="500" y2="150" stroke="${ink}" stroke-width="2.5"/>`+arc(445,150,18,0,180,OR)+lbl(445,180,'straight')],
  ['Pairs.',lbl(260,40,'complementary: sum 90° · supplementary: sum 180°','font-weight="700"')]]},
 seeNote:'Know the names by size.',
 do:{title:'Clock angles',mat:'Clock face',steps:['Set times 2:00, 3:00, 5:00, 6:00, 8:00.','Name the angle between the hands.'],obs:'Acute, right, obtuse, straight, reflex/obtuse.',why:'Angle types.',lab:false},
 memo:'"C for Corner (90°), S for Straight (180°)."',
 miscon:['"A reflex angle is the same as an obtuse angle." Reflex is more than 180°.'],
 terms:['Line segment','Ray','Collinear','Acute','Obtuse','Reflex','Complementary','Supplementary','Adjacent angles'],
 q:{q:'The supplement of 70° is:',o:['20°','110°','290°','70°'],a:1,why:'180 − 70.'},
 exam:'Complements, supplements: 1 mark.'},

{id:'g2',num:'6.2',title:'Linear pair axiom',
 intro:'A ray stands on a line. What do the two angles it makes always add up to?',
 obj:'State and use the linear pair axiom.',
 prior:'6.1.',
 simple:'Axiom 6.1: if a ray stands on a line, the sum of the two adjacent angles so formed is 180°. Axiom 6.2 (converse): if the sum of two adjacent angles is 180°, their non-common arms form a line. Together these are the linear pair axiom.',
 detail:'If ∠AOC = 3x and ∠BOC = 2x form a linear pair, then 5x = 180°, x = 36°, so the angles are 108° and 72°. Several angles on one side of a line at a point add to 180°; all angles around a point add to 360°.',
 real:'A door opened at 120° from the wall makes 60° with the other side of the wall line.',
 apply:'Two angles of a linear pair are in the ratio 4 : 5. Find them.',
 see:{w:520,h:200,f:[
  ['A line AB.',`<line x1="60" y1="150" x2="460" y2="150" stroke="${ink}" stroke-width="3"/>`+lbl(55,170,'A')+lbl(465,170,'B')],
  ['A ray OC stands on it.',ray(260,150,60,120,BL,3)+lbl(330,40,'C')+lbl(260,172,'O')],
  ['Angles add to 180°.',arc(260,150,30,0,60,OR)+arc(260,150,40,60,180,GN)+lbl(310,135,'60°','fill="'+OR+'"')+lbl(200,115,'120°','fill="'+GN+'"')+lbl(260,195,'60° + 120° = 180°','font-weight="700"')]]},
 seeNote:'Straight line = 180°.',
 do:{title:'Fold it',mat:'Paper, protractor',steps:['Draw a line and a ray from a point on it.','Measure both angles; add.'],obs:'180°.',why:'Linear pair.',lab:false},
 memo:'"Ray on a line: the two angles make a straight 180."',
 miscon:['"Any two supplementary angles form a linear pair." They must also be adjacent.'],
 terms:['Linear pair','Axiom','Converse'],
 q:{q:'In a linear pair, one angle is 75°. The other is:',o:['15°','105°','75°','285°'],a:1,why:'180 − 75.'},
 exam:'Linear pair problems: 2 marks.'},

{id:'g3',num:'6.3',title:'Vertically opposite angles',
 intro:'Two straight roads cross. Are the opposite angles at the crossing equal?',
 obj:'Prove and use the vertically opposite angles theorem.',
 prior:'6.2.',
 simple:'Theorem 6.1: if two lines intersect, the vertically opposite angles are equal. Lines AB and CD meet at O: ∠AOC = ∠BOD and ∠AOD = ∠BOC.',
 detail:'Proof: ∠AOC + ∠AOD = 180° (linear pair) and ∠AOD + ∠BOD = 180° (linear pair). So ∠AOC + ∠AOD = ∠AOD + ∠BOD, giving ∠AOC = ∠BOD (axiom: equals subtracted from equals). Similarly ∠AOD = ∠BOC.',
 real:'Scissors blades: as one angle opens, the opposite one opens by the same amount.',
 apply:'Lines AB and CD meet at O. If ∠AOC + ∠BOD = 80°, find all four angles.',
 see:{w:520,h:220,f:[
  ['Two lines cross.',`<line x1="80" y1="190" x2="440" y2="30" stroke="${ink}" stroke-width="3"/><line x1="80" y1="40" x2="440" y2="180" stroke="${ink}" stroke-width="3"/>`],
  ['One pair.',arc(260,110,28,-21.3,24,OR,true)+arc(260,110,28,158.7,204,OR,true)+lbl(310,115,'x','fill="'+OR+'"')+lbl(210,115,'x','fill="'+OR+'"')],
  ['The other pair.',arc(260,110,22,24,158.7,BL,true)+arc(260,110,22,204,338.7,BL,true)+lbl(260,75,'y','fill="'+BL+'"')+lbl(260,155,'y','fill="'+BL+'"')+lbl(260,210,'vertically opposite angles are equal','font-weight="700"')]]},
 seeNote:'Opposite angles match.',
 do:{title:'Scissor check',mat:'Two sticks pinned at the middle',steps:['Open to various angles.','Measure opposite angles.'],obs:'Always equal.',why:'Theorem 6.1.',lab:false},
 memo:'"Across the X, angles are twins."',
 miscon:['"Adjacent angles at an intersection are equal." Opposite ones are equal; adjacent ones are supplementary.'],
 terms:['Vertically opposite angles','Intersecting lines','Theorem'],
 q:{q:'If one angle at an intersection is 40°, its vertically opposite angle is:',o:['40°','140°','50°','320°'],a:0,why:'Equal.'},
 exam:'Prove/use Theorem 6.1: 2–3 marks.'},

{id:'g4',num:'6.4',title:'Angles made by a transversal',
 intro:'A road crosses two parallel railway tracks. How many angles appear at the two crossings?',
 obj:'Name corresponding, alternate and co-interior angles.',
 prior:'6.3.',
 simple:'A transversal is a line that cuts two or more lines at distinct points. With two lines, it makes eight angles: four exterior (outside the two lines) and four interior (between them). Pairs: corresponding angles (same position at each crossing: ∠1 and ∠5); alternate interior angles (inside, opposite sides of the transversal: ∠3 and ∠6); co-interior angles (inside, same side: ∠3 and ∠5).',
 detail:'There are 4 pairs of corresponding angles, 2 pairs of alternate interior angles, 2 pairs of alternate exterior angles and 2 pairs of co-interior (consecutive interior) angles. These names describe positions; they are equal or supplementary only when the lines are parallel.',
 real:'Zebra crossings, railway tracks and window grills show transversals and parallels.',
 apply:'Draw two lines and a transversal; number the angles 1–8 and list all pairs.',
 see:{w:520,h:240,f:[
  ['Two lines and a transversal.',`<line x1="40" y1="70" x2="480" y2="70" stroke="${ink}" stroke-width="2.5"/><line x1="40" y1="170" x2="480" y2="170" stroke="${ink}" stroke-width="2.5"/><line x1="180" y1="230" x2="320" y2="10" stroke="${ink}" stroke-width="2.5"/>`],
  ['Corresponding.',arc(282,70,24,0,57.5,OR,true)+arc(218,170,24,0,57.5,OR,true)+lbl(320,55,'1','fill="'+OR+'"')+lbl(255,155,'5','fill="'+OR+'"')],
  ['Alternate interior.',arc(282,70,24,180,237.5,BL,true)+arc(218,170,24,0,57.5,BL,true)+lbl(250,92,'3','fill="'+BL+'"')+lbl(410,210,'alternate: Z shape · corresponding: F shape','font-size="12"')]]},
 seeNote:'F for corresponding, Z for alternate, C/U for co-interior.',
 do:{title:'Letter shapes',mat:'Paper',steps:['Trace F, Z and C shapes on a transversal diagram.','Name the pairs.'],obs:'Shapes help.',why:'Angle pairs.',lab:true},
 memo:'"F – corresponding, Z – alternate, C – co-interior."',
 miscon:['"Corresponding angles are always equal." Only when the lines are parallel.'],
 terms:['Transversal','Corresponding angles','Alternate interior angles','Co-interior angles','Exterior angles'],
 q:{q:'Angles inside the lines, on the same side of the transversal, are:',o:['corresponding','alternate','co-interior','vertically opposite'],a:2,why:'Definition.'},
 exam:'Identify angle pairs: 1 mark.'},

{id:'g5',num:'6.5',title:'Parallel lines and a transversal',
 intro:'Why do architects check that a window frame\'s sides are parallel by measuring just one angle?',
 obj:'Use angle relationships to identify and work with parallel lines.',
 prior:'6.4.',
 simple:'If a transversal cuts two parallel lines: corresponding angles are equal (axiom); alternate interior angles are equal; co-interior angles add to 180°. Conversely, if corresponding angles are equal, or alternate interior angles are equal, or co-interior angles are supplementary, then the lines are parallel.',
 detail:'Theorem 6.6: lines that are parallel to the same line are parallel to each other. Problems: if AB ∥ CD and a transversal makes ∠1 = 65°, all eight angles are 65° or 115°. To find an angle at a "bend" between two parallel lines, draw a third parallel line through the bend.',
 real:'Carpenters use a set square sliding along a straight edge to draw parallel lines — equal corresponding angles.',
 apply:'AB ∥ CD, ∠APQ = 50° and ∠PRD = 127°. Find x and y in the standard NCERT figure.',
 see:{w:520,h:240,f:[
  ['Parallel lines.',`<line x1="40" y1="70" x2="480" y2="70" stroke="${BL}" stroke-width="2.5"/><line x1="40" y1="170" x2="480" y2="170" stroke="${BL}" stroke-width="2.5"/><line x1="180" y1="230" x2="320" y2="10" stroke="${ink}" stroke-width="2.5"/>`+lbl(470,60,'l')+lbl(470,160,'m')],
  ['57° here.',arc(282,70,24,0,57.5,OR,true)+lbl(320,55,'57°','fill="'+OR+'"')],
  ['All angles follow.',arc(218,170,24,0,57.5,OR,true)+arc(218,170,24,57.5,180,GN,true)+lbl(255,155,'57°','fill="'+OR+'"')+lbl(180,150,'123°','fill="'+GN+'"')+lbl(380,225,'equal or supplementary — only two values','font-weight="700"')]]},
 seeNote:'One angle decides all eight.',
 do:{title:'Ruled lines',mat:'Ruled notebook, protractor',steps:['Draw a transversal across two lines.','Measure corresponding angles.'],obs:'Equal.',why:'Lines are parallel.',lab:true},
 memo:'"Parallel: equal Fs, equal Zs, Cs make 180."',
 miscon:['"Co-interior angles are equal for parallel lines." They are supplementary.'],
 terms:['Parallel lines (∥)','Converse','Theorem 6.6'],
 q:{q:'If l ∥ m and an alternate interior angle is 70°, the other is:',o:['70°','110°','20°','140°'],a:0,why:'Equal.'},
 exam:'Find angles; prove lines parallel: 3 marks.'},

{id:'g6',num:'6.6',title:'Angle sum of a triangle',
 intro:'Tear the three corners off a paper triangle and put them together. What do you get?',
 obj:'Prove the angle sum property and the exterior angle property.',
 prior:'6.5.',
 simple:'Theorem: the sum of the angles of a triangle is 180°. Proof: through vertex A of △ABC, draw line PQ ∥ BC. ∠PAB = ∠B and ∠QAC = ∠C (alternate angles). ∠PAB + ∠A + ∠QAC = 180° (angles on a line). So ∠A + ∠B + ∠C = 180°.',
 detail:'Exterior angle property: if a side of a triangle is produced, the exterior angle equals the sum of the two interior opposite angles. ∠ACD = ∠A + ∠B. So an exterior angle is greater than each interior opposite angle. Example: angles in ratio 2 : 3 : 4 → 40°, 60°, 80°.',
 real:'Roof trusses are triangles; builders use the angle sum to cut timber at the right angles.',
 apply:'The angles of a triangle are in the ratio 5 : 3 : 7. Find them and classify the triangle.',
 see:{w:520,h:230,f:[
  ['A triangle.',`<polygon points="120,190 400,190 230,50" fill="${BL}" fill-opacity=".08" stroke="${ink}" stroke-width="2.5"/>`+lbl(110,210,'B')+lbl(410,210,'C')+lbl(230,40,'A')],
  ['A line through A parallel to BC.',`<line x1="60" y1="50" x2="460" y2="50" stroke="${BL}" stroke-width="2" stroke-dasharray="6 4"/>`+lbl(450,40,'∥ BC','fill="'+BL+'"')],
  ['Alternate angles fill the straight line.',arc(120,190,28,0,52,OR,true)+arc(400,190,28,140.6,180,GN,true)+arc(230,50,28,180,232,OR,true)+arc(230,50,28,-39.4,0,GN,true)+lbl(260,226,'∠A + ∠B + ∠C = 180°','font-weight="700"')]]},
 seeNote:'A parallel line proves it.',
 do:{title:'Tear the corners',mat:'Paper triangle',steps:['Tear off the three corners.','Arrange them along a line.'],obs:'A straight angle.',why:'Sum 180°.',lab:true},
 memo:'"Three corners make a straight line."',
 miscon:['"A triangle can have two obtuse angles." Their sum would exceed 180°.'],
 terms:['Angle sum property','Exterior angle','Interior opposite angles'],
 q:{q:'Two angles of a triangle are 50° and 60°. The third is:',o:['70°','80°','90°','110°'],a:0,why:'180 − 110.'},
 exam:'Prove angle sum; exterior angle problems: 3–5 marks.'}
];

const CARDS=[['Complementary','Sum 90°.'],['Supplementary','Sum 180°.'],['Linear pair','Adjacent, sum 180°.'],['Vertically opposite','Equal.'],['Transversal','Cuts two lines; 8 angles.'],['Corresponding (F)','Equal if lines ∥.'],['Alternate (Z)','Equal if lines ∥.'],['Co-interior (C)','Sum 180° if lines ∥.'],['Converse','Equal corresponding → lines ∥.'],['Parallel to same line','Parallel to each other.'],['Triangle sum','180°.'],['Exterior angle','= sum of interior opposite angles.']];

const Q=[
 {lv:1,q:'Complement of 40°:',o:['50°','140°','40°','320°'],a:0,w:'90 − 40.'},
 {lv:1,q:'An angle between 180° and 360° is:',o:['obtuse','straight','reflex','acute'],a:2,w:'Definition.'},
 {lv:1,q:'Vertically opposite angles are:',o:['supplementary','equal','complementary','unrelated'],a:1,w:'Theorem 6.1.'},
 {lv:2,q:'Linear pair 3x and 2x: x =',o:['18°','36°','30°','45°'],a:1,w:'5x = 180.'},
 {lv:2,q:'If l ∥ m, co-interior angles are:',o:['equal','supplementary','complementary','90° each'],a:1,w:'Sum 180°.'},
 {lv:2,q:'Third angle when two are 35° and 75°:',o:['70°','80°','90°','60°'],a:0,w:'180 − 110.'},
 {lv:3,q:'Angles in ratio 2 : 3 : 4. Largest:',o:['60°','80°','90°','100°'],a:1,w:'20° × 4.'},
 {lv:3,q:'Exterior angle 110°, one interior opposite 40°. Other:',o:['70°','30°','150°','40°'],a:0,w:'110 − 40.'},
 {lv:4,q:'If corresponding angles are 72° and 72°, the lines are:',o:['intersecting','parallel','perpendicular','coincident'],a:1,w:'Converse.'},
 {lv:4,q:'Two lines meet; one angle is 3 times its adjacent angle. The larger is:',o:['45°','120°','135°','150°'],a:2,w:'x + 3x = 180.'},
 {lv:5,open:true,m:3,q:'Prove that vertically opposite angles are equal.',ans:['∠AOC + ∠AOD = 180° (linear pair) (1)','∠AOD + ∠BOD = 180° (1)','Subtract: ∠AOC = ∠BOD; similarly the other pair (1)']},
 {lv:5,open:true,m:5,q:'Prove that the sum of the angles of a triangle is 180°. Use it to find the angles of a triangle whose angles are x, 2x and 3x.',ans:['Draw PQ ∥ BC through A (1)','∠PAB = ∠B, ∠QAC = ∠C (alternate) (1)','Angles on line PQ sum to 180° (1)','6x = 180 → x = 30° (1)','Angles 30°, 60°, 90° (1)']}
];

const ONEMIN=['Angle types and pairs.','Linear pair = 180°.','Vertically opposite angles equal.','F, Z, C angle pairs.','Parallel lines: equal / supplementary.','Triangle sum 180°; exterior angle.'];
const KEYS=[['types',/acute|obtuse|reflex|complement|supplement/i],['linear pair',/linear pair/i],['vertically opposite',/vertically opposite/i],['transversal',/transversal|corresponding|alternate|co-interior/i],['parallel',/parallel/i],['triangle',/triangle|exterior/i]];

/* ---------- lab ---------- */
let th=60,tilt=0,pair='c',wired=false;
function draw(){const P1=[260,100];const yb=230;const lineL=(x)=>yb+Math.tan(rad(tilt))*(x-260)*-1;
 const dx=Math.cos(rad(th)),dy=-Math.sin(rad(th));let s='';
 s+=`<line x1="30" y1="100" x2="490" y2="100" stroke="${BL}" stroke-width="3"/>`;const lx1=30,lx2=490;s+=`<line x1="${lx1}" y1="${lineL(lx1)}" x2="${lx2}" y2="${lineL(lx2)}" stroke="${BL}" stroke-width="3"/>`;
 const kk=-Math.tan(rad(tilt));const sP=(yb-100)/(dy-kk*dx);const B=[260+dx*sP,100+dy*sP];
 s+=`<line x1="${P1[0]+dx*120}" y1="${P1[1]+dy*120}" x2="${B[0]-dx*90}" y2="${B[1]-dy*90}" stroke="${ink}" stroke-width="2.5"/>`;
 const lowerDir=tilt;
 const angAt=(base,c0)=>{const tA=th,bA=base;return [[bA,tA],[tA,bA+180],[bA+180,tA+180],[tA+180,bA+360]]};
 const top=angAt(0),bot=angAt(lowerDir);
 const sz=(a)=>((a[1]-a[0])%360+360)%360;
 const lab=(cx,cy,a,n,c)=>{const m=rad((a[0]+a[1])/2);return T(cx+36*Math.cos(m),cy-36*Math.sin(m)+4,n,`font-size="12" font-weight="700" fill="${c}"`)};
 const names=[1,2,3,4];const pairs={c:[[0,0]],a:[[2,0],[3,1]],i:[[3,0],[2,1]],v:[[0,2]],l:[[0,1]]};
 const hl=pairs[pair];const hiT=new Set(),hiB=new Set();
 if(pair==='c')hiT.add(0),hiB.add(0);else if(pair==='a'){hiT.add(3);hiB.add(1)}else if(pair==='i'){hiT.add(3);hiB.add(0)}else if(pair==='v'){hiT.add(0);hiT.add(2)}else{hiT.add(0);hiT.add(1)}
 top.forEach((a,i)=>{s+=arc(P1[0],P1[1],hiT.has(i)?24:16,a[0],a[1],hiT.has(i)?OR:GR,hiT.has(i))+lab(P1[0],P1[1],a,i+1,hiT.has(i)?OR:GR)});
 bot.forEach((a,i)=>{s+=arc(B[0],B[1],hiB.has(i)?24:16,a[0],a[1],hiB.has(i)?GN:GR,hiB.has(i))+lab(B[0],B[1],a,i+5,hiB.has(i)?GN:GR)});
 const angT=top.map(sz),angB=bot.map(sz);
 s+=lbl(470,92,'l')+lbl(470,lineL(470)-8,'m');
 $('#trSvg').innerHTML=s;$('#trTv').textContent=th;$('#trKv').textContent=tilt;
 const par=tilt===0;let msg='';const r=v=>Math.round(v)+'°';
 if(pair==='c')msg=`Corresponding ∠1 = ${r(angT[0])}, ∠5 = ${r(angB[0])} → ${Math.abs(angT[0]-angB[0])<.5?'<b>equal</b>':'<b>not equal</b>'}.`;
 else if(pair==='a')msg=`Alternate interior ∠4 = ${r(angT[3])}, ∠6 = ${r(angB[1])} → ${Math.abs(angT[3]-angB[1])<.5?'<b>equal</b>':'<b>not equal</b>'}.`;
 else if(pair==='i')msg=`Co-interior ∠4 + ∠5 = ${r(angT[3])} + ${r(angB[0])} = <b>${r(angT[3]+angB[0])}</b>.`;
 else if(pair==='v')msg=`Vertically opposite ∠1 = ${r(angT[0])}, ∠3 = ${r(angT[2])} → always <b>equal</b>.`;
 else msg=`Linear pair ∠1 + ∠2 = ${r(angT[0])} + ${r(angT[1])} = <b>180°</b> — always.`;
 $('#trOut').innerHTML=`<p>${msg}</p><p>${par?'Lines l and m are <b>parallel</b>: corresponding and alternate angles are equal; co-interior angles add to 180°.':'Lines l and m are <b>not parallel</b> (tilt ≠ 0): corresponding and alternate angles differ. Set tilt to 0 to make them parallel.'}</p>`}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const el=e.target;if(!el||!el.classList||!el.classList.contains('trS'))return;if(el.id==='trT')th=+el.value;else tilt=+el.value;draw()})}
function labClick(){return false}
function labChange(el){if(el.id==='trP'){pair=el.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
