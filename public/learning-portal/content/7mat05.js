/* Rai Plus content pack: Class 7 Mathematics (Ganita Prakash), Chapter 5 – Parallel and Intersecting Lines. */
RP.register({key:'7mat05',cls:'7',subject:'Mathematics',ch:'5',title:"Parallel and Intersecting Lines",color:'#1f5f8b',
crumb:"Class 7 Mathematics · Ganita Prakash",h1:"Chapter 5: Parallel and Intersecting Lines",sub:"Intersecting lines, linear pairs, vertically opposite angles, perpendicular and parallel lines, transversals and angle pairs.",heroLabel:"Two parallel lines cut by a transversal",labName:'Transversal lab',
theme:"\n:root{--g:light-dark(#1f5f8b,#8fc2e6);--g2:light-dark(#e8f1f8,#0b1622);--line:light-dark(#cde0ee,#22384b);--bg:light-dark(#ffffff,#081018);--card:light-dark(#ffffff,#0d1620);\n--ink:light-dark(#0d1d2a,#e1ecf5);--mute:light-dark(#475d70,#a7bccd);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#174a6d}\n",
labHTML:`  <h2>Transversal lab</h2>
  <p>Turn the transversal and tilt the second line. Choose an angle pair to highlight. When are corresponding or alternate angles equal?</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="tSvg" viewBox="0 0 460 320" role="img" aria-label="Lines and transversal" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Transversal angle: <b id="tAv"></b><input type="range" class="tS" id="tA" min="30" max="150" value="60"></label></div>
  <div class="ctrl"><label>Tilt of line 2: <b id="tBv"></b><input type="range" class="tS" id="tB" min="-20" max="20" value="0"></label></div>
  <div class="ctrl"><label>Highlight pair<select id="tP"><option value="corr">Corresponding (1 & 5)</option><option value="alt">Alternate interior (3 & 5)</option><option value="co">Interior on same side (4 & 5)</option><option value="vo">Vertically opposite (1 & 3)</option><option value="lp">Linear pair (1 & 2)</option></select></label></div>
  <div class="ctrl"><button class="btn" id="tQ">Quiz: find the angle</button> <input id="tAns" type="number" style="width:5em" placeholder="°"> <button class="btn" id="tC">Check</button></div>
  <div class="box y" id="tOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#1f5f8b',LABNAME='Transversal lab',MIND_CENTER='Lines & angles';
const BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const D=Math.PI/180;
function ang(cx,cy,r,a1,a2,c,fill=true){// degrees, standard (y up)
 const p=a=>[cx+r*Math.cos(a*D),cy-r*Math.sin(a*D)];const [x1,y1]=p(a1),[x2,y2]=p(a2);const large=((a2-a1+360)%360)>180?1:0;return `<path d="M${cx} ${cy} L${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${large} 0 ${x2.toFixed(1)} ${y2.toFixed(1)}Z" fill="${c}" opacity="${fill?.35:0}" stroke="${c}"/>`}
function line(cx,cy,deg,L,c=ink,w=2){const dx=L*Math.cos(deg*D),dy=-L*Math.sin(deg*D);return `<line x1="${(cx-dx).toFixed(1)}" y1="${(cy-dy).toFixed(1)}" x2="${(cx+dx).toFixed(1)}" y2="${(cy+dy).toFixed(1)}" stroke="${c}" stroke-width="${w}"/>`}
function heroDraw(){return `<line x1="20" y1="45" x2="360" y2="45" stroke="#fff" stroke-width="3"/><line x1="20" y1="105" x2="360" y2="105" stroke="#fff" stroke-width="3"/><line x1="120" y1="130" x2="240" y2="20" stroke="#fff" stroke-width="3"/>`}
const HERO=heroDraw;
const MIND=[['Intersecting lines',100,50],['Linear pair',420,50],['Vertically opposite',90,150],['Perpendicular & parallel',430,150],['Transversal angle pairs',110,250],['Testing for parallel',410,250]];

const C=[
{id:'p1',num:'5.1',title:'Intersecting lines and linear pairs',
 intro:'Cross two pencils. How many angles do you see? What do neighbouring angles add up to?',
 obj:'Identify angles at intersecting lines and the linear pair property.',
 prior:'Class 6: lines and angles.',
 simple:'Two lines that meet at a point are intersecting lines; the point is the point of intersection. They make four angles. Two adjacent angles (sharing an arm) that together form a straight line are a linear pair; their sum is 180°. If one is 70°, its neighbour is 110°.',
 detail:'Adjacent angles share a vertex and an arm and do not overlap. Around the point of intersection the four angles add up to 360°. Supplementary angles add to 180° (a linear pair is supplementary).',
 real:'Scissors blades form intersecting lines; opening them changes all four angles together.',
 apply:'One angle of a linear pair is 125°. Find the other.',
 see:{w:520,h:220,f:[
  ['Two lines intersect at O.',line(260,110,0,200)+line(260,110,55,140)+`<circle cx="260" cy="110" r="4"/>`+lbl(268,128,'O')],
  ['∠1 and ∠2 form a linear pair.',ang(260,110,40,0,55,OR)+ang(260,110,40,55,180,BL)+lbl(315,88,'∠1 = 55°','fill="'+OR+'"')+lbl(200,80,'∠2 = 125°','fill="'+BL+'"')],
  ['55° + 125° = 180°',lbl(260,200,'linear pair: sum = 180°','font-weight="700"')]]},
 seeNote:'Adjacent on a straight line: 180°.',
 do:{title:'Paper fold',mat:'Paper, protractor',steps:['Fold two creases that cross.','Measure all four angles.'],obs:'Neighbours add to 180°.',why:'Linear pair.',lab:true},
 memo:'"On a line, neighbours make 180."',
 miscon:['"Any two angles adding to 180° are a linear pair." They must also be adjacent on a line.'],
 terms:['Intersecting lines','Point of intersection','Adjacent angles','Linear pair','Supplementary'],
 q:{q:'Linear pair: one angle 72°. Other:',o:['18°','108°','72°','288°'],a:1,why:'180 − 72.'},
 exam:'Linear pair problems: 2 marks.'},

{id:'p2',num:'5.2',title:'Vertically opposite angles',
 intro:'At a crossing, are the angles opposite each other equal?',
 obj:'Show that vertically opposite angles are equal.',
 prior:'5.1.',
 simple:'When two lines intersect, the angles opposite each other (not adjacent) are vertically opposite angles. They are always equal. Reason: ∠1 + ∠2 = 180° and ∠2 + ∠3 = 180°, so ∠1 = ∠3.',
 detail:'So if one angle is known at an intersection, all four are known: x, 180° − x, x, 180° − x. If the lines meet at 90°, all four angles are right angles: the lines are perpendicular.',
 real:'The arms of an "X"-shaped road crossing show equal opposite angles.',
 apply:'Two lines intersect; one angle is 40°. Find the other three.',
 see:{w:520,h:220,f:[
  ['Four angles at O.',line(260,110,0,200)+line(260,110,40,150)],
  ['Opposite angles: ∠1 and ∠3.',ang(260,110,40,0,40,OR)+ang(260,110,40,180,220,OR)+lbl(318,96,'∠1','fill="'+OR+'"')+lbl(200,132,'∠3','fill="'+OR+'"')],
  ['∠1 = ∠3 (both = 180° − ∠2).',ang(260,110,30,40,180,BL)+lbl(250,70,'∠2','fill="'+BL+'"')+lbl(260,205,'vertically opposite angles are equal','font-weight="700"')]]},
 seeNote:'Opposite angles are equal.',
 do:{title:'Measure and compare',mat:'Ruler, protractor',steps:['Draw two intersecting lines.','Measure all four angles.'],obs:'Opposite pairs equal.',why:'Vertically opposite.',lab:true},
 memo:'"Opposite = equal."',
 miscon:['"Opposite angles add to 180°." They are equal.'],
 terms:['Vertically opposite angles'],
 q:{q:'At an intersection one angle is 65°. Its vertically opposite angle:',o:['115°','65°','25°','295°'],a:1,why:'Equal.'},
 exam:'Find all angles at an intersection: 2 marks.'},

{id:'p3',num:'5.3',title:'Perpendicular and parallel lines',
 intro:'Railway tracks never meet. Floor tile edges meet at right angles. What are these called?',
 obj:'Recognise perpendicular and parallel lines.',
 prior:'5.1, 5.2.',
 simple:'Perpendicular lines meet at a right angle (90°); written AB ⊥ CD. Parallel lines are lines in the same plane that never meet, however far they are extended; the distance between them stays the same. Written l ∥ m.',
 detail:'Examples of parallel lines: opposite edges of a notebook, railway rails, lines on ruled paper. Lines that are not parallel will meet somewhere if extended. Lines in different planes that don\'t meet (like the top edge of a wall and a bottom edge of the opposite wall in another direction) are not called parallel in plane geometry.',
 real:'Zebra crossings show parallel stripes; road crossings are often perpendicular.',
 apply:'Name two pairs of parallel edges in your classroom.',
 see:{w:520,h:200,f:[
  ['Perpendicular: 90°.',line(130,110,0,90)+line(130,110,90,80)+`<path d="M142 110 v-12 h-12" fill="none" stroke="${ink}"/>`+lbl(130,190,'AB ⊥ CD')],
  ['Parallel: never meet.',`<line x1="280" y1="70" x2="500" y2="70" stroke="${BL}" stroke-width="3"/><line x1="280" y1="140" x2="500" y2="140" stroke="${BL}" stroke-width="3"/>`],
  ['Same distance apart everywhere.',[320,390,460].map(x=>`<line x1="${x}" y1="72" x2="${x}" y2="138" stroke="${GR}" stroke-dasharray="3 3"/>`).join('')+lbl(390,190,'l ∥ m')]]},
 seeNote:'⊥ meet at 90°; ∥ never meet.',
 do:{title:'Spot them',mat:'Classroom',steps:['List 5 perpendicular and 5 parallel pairs.'],obs:'Window bars, desk edges.',why:'Everywhere in design.',lab:false},
 memo:'"⊥ makes an L, ∥ like rails."',
 miscon:['"Lines that don\'t meet on the page are parallel." Extend them to check.'],
 terms:['Perpendicular (⊥)','Parallel (∥)','Right angle'],
 q:{q:'Lines meeting at 90° are:',o:['parallel','perpendicular','opposite','curved'],a:1,why:'Definition.'},
 exam:'Identify parallel/perpendicular: 1 mark.'},

{id:'p4',num:'5.4',title:'Transversal and angle pairs',
 intro:'A road crosses two parallel roads. Which angles at the two crossings match?',
 obj:'Name corresponding, alternate and interior angles formed by a transversal.',
 prior:'5.1–5.3.',
 simple:'A transversal is a line that crosses two (or more) lines at different points, making 8 angles. Pairs: corresponding angles (same position at each crossing, e.g. ∠1 and ∠5); alternate interior angles (between the lines, on opposite sides of the transversal, e.g. ∠3 and ∠5); interior angles on the same side (between the lines, same side, e.g. ∠4 and ∠5).',
 detail:'Alternate exterior angles lie outside the lines on opposite sides. Learn by shapes: corresponding angles make an "F", alternate angles a "Z", interior same-side angles a "C" (or "U").',
 real:'Staircase railings crossing parallel steps.',
 apply:'In the figure, name the angle corresponding to ∠2.',
 see:{w:520,h:240,f:[
  ['Two lines cut by a transversal.',`<line x1="40" y1="70" x2="480" y2="70" stroke="${ink}" stroke-width="2"/><line x1="40" y1="170" x2="480" y2="170" stroke="${ink}" stroke-width="2"/>`+line(260,120,60,140,BL,2.5)],
  ['8 angles: 1–4 at top, 5–8 at bottom.',[['1',300,58],['2',260,58],['3',262,90],['4',300,90],['5',244,158],['6',204,158],['7',206,190],['8',244,190]].map(([t,x,y])=>lbl(x,y,t,'font-weight="700"')).join('')],
  ['F: corresponding · Z: alternate · C: same side.',lbl(260,228,'F (1,5) · Z (3,5) · C (4,5)','font-weight="700" fill="'+OR+'"')]]},
 seeNote:'F, Z, C shapes.',
 do:{title:'Letter shapes',mat:'Coloured pencils, worksheet',steps:['Trace F, Z and C shapes on a transversal figure.','Mark the angle pairs.'],obs:'Each letter shows a pair.',why:'Memory aid.',lab:false},
 memo:'"F corresponds, Z alternates, C co-interior."',
 miscon:['"Alternate angles are on the same side." They are on opposite sides.'],
 terms:['Transversal','Corresponding angles','Alternate angles','Interior angles (same side)'],
 q:{q:'Angles in a "Z" shape are:',o:['corresponding','alternate','vertically opposite','linear pair'],a:1,why:'Z = alternate.'},
 exam:'Name angle pairs: 2 marks.'},

{id:'p5',num:'5.5',title:'Parallel lines and their angles',
 intro:'If the two lines are parallel, which angles become equal?',
 obj:'Use angle properties of parallel lines cut by a transversal.',
 prior:'5.4.',
 simple:'If a transversal cuts two PARALLEL lines: corresponding angles are equal; alternate interior angles are equal; interior angles on the same side add up to 180°. So knowing just one angle, you can find all eight.',
 detail:'If the lines are not parallel, these angle pairs are not equal. Example: parallel lines, ∠1 = 60° → ∠5 = 60° (corresponding), ∠3 = 60° (vertically opposite to ∠1), ∠4 = 120°, ∠5 + ∠4 = 180°.',
 real:'Builders use these angle facts to keep shelves and window bars parallel.',
 apply:'Parallel lines, ∠3 = 75°. Find ∠5 and ∠6.',
 see:{w:520,h:240,f:[
  ['Parallel lines, transversal at 60°.',`<line x1="40" y1="70" x2="480" y2="70" stroke="${ink}" stroke-width="2"/><line x1="40" y1="170" x2="480" y2="170" stroke="${ink}" stroke-width="2"/>`+line(260,120,60,140,BL,2.5)],
  ['Corresponding angles equal: 60° and 60°.',ang(289,70,26,0,60,OR)+ang(231,170,26,0,60,OR)+lbl(330,60,'60°','fill="'+OR+'"')+lbl(272,160,'60°','fill="'+OR+'"')],
  ['Interior same side: 120° + 60° = 180°.',ang(289,70,20,240,360,GN)+lbl(320,96,'120°','fill="'+GN+'"')+lbl(260,228,'equal pairs, or adding to 180°','font-weight="700"')]]},
 seeNote:'One angle gives all eight.',
 do:{title:'Ruled paper check',mat:'Ruled notebook, ruler, protractor',steps:['Draw a slanting line across the ruled lines.','Measure corresponding angles.'],obs:'Equal.',why:'Ruled lines are parallel.',lab:true},
 memo:'"Parallel: F and Z equal, C makes 180."',
 miscon:['"Co-interior angles are equal." They add to 180°.'],
 terms:['Corresponding angles equal','Alternate angles equal','Co-interior sum 180°'],
 q:{q:'Parallel lines; ∠4 = 110°. Co-interior ∠5 =',o:['110°','70°','180°','250°'],a:1,why:'180 − 110.'},
 exam:'Find unknown angles with parallel lines: 3 marks.'},

{id:'p6',num:'5.6',title:'Testing and drawing parallel lines',
 intro:'How can you check if two lines are really parallel?',
 obj:'Use angle tests to check and draw parallel lines.',
 prior:'5.5.',
 simple:'Converse tests: if a transversal makes equal corresponding angles, or equal alternate angles, or co-interior angles adding to 180°, then the lines are parallel. To draw a line parallel to l through a point P: draw a transversal through P cutting l; copy the angle at P so the corresponding angles are equal.',
 detail:'Using a set square and ruler: place a set square edge along l, slide it along the ruler to P, and draw. This keeps corresponding angles equal. Architects and engineers use these tests to check alignment.',
 real:'Carpenters slide a set square along a straight edge to draw parallel lines.',
 apply:'A transversal makes alternate angles 52° and 56°. Are the lines parallel?',
 see:{w:520,h:220,f:[
  ['Line l and point P.',`<line x1="40" y1="170" x2="480" y2="170" stroke="${ink}" stroke-width="2"/>`+`<circle cx="320" cy="70" r="4"/>`+lbl(330,62,'P','text-anchor="start"')+lbl(460,190,'l')],
  ['Transversal through P; angle at l is 60°.',line(260,120,60,140,BL,2)+ang(231,170,26,0,60,OR)],
  ['Copy 60° at P: the new line is parallel.',`<line x1="40" y1="70" x2="480" y2="70" stroke="${GN}" stroke-width="2.5"/>`+ang(289,70,26,0,60,OR)+lbl(460,58,'m ∥ l','fill="'+GN+'"')]]},
 seeNote:'Equal corresponding angles ⇒ parallel.',
 do:{title:'Set-square slide',mat:'Ruler, set square',steps:['Draw a line.','Slide the set square along the ruler and draw 3 parallel lines.'],obs:'Evenly spaced parallel lines.',why:'Equal corresponding angles.',lab:true},
 memo:'"Equal F or Z? Then parallel."',
 miscon:['"Lines look parallel, so they are." Test with angles.'],
 terms:['Converse','Set square','Construct parallel line'],
 q:{q:'Corresponding angles 70° and 70°. The lines are:',o:['perpendicular','parallel','intersecting at 70°','can\'t tell'],a:1,why:'Converse test.'},
 exam:'Test for parallel lines: 2 marks.'}
];

const CARDS=[['Linear pair','Adjacent on a line: sum 180°.'],['Vertically opposite','Equal.'],['Around a point','Sum 360°.'],['Perpendicular','Meet at 90° (⊥).'],['Parallel','Never meet (∥).'],['Transversal','Cuts two lines; 8 angles.'],['Corresponding (F)','Equal if lines ∥.'],['Alternate (Z)','Equal if lines ∥.'],['Co-interior (C)','Sum 180° if lines ∥.'],['Test','Equal F/Z angles ⇒ lines ∥.']];

const Q=[
 {lv:1,q:'Lines that never meet:',o:['perpendicular','parallel','intersecting','crossing'],a:1,w:'Parallel.'},
 {lv:1,q:'Vertically opposite angles are:',o:['equal','supplementary','90°','unequal'],a:0,w:'Equal.'},
 {lv:1,q:'Angles of a linear pair add to:',o:['90°','180°','360°','270°'],a:1,w:'Straight line.'},
 {lv:2,q:'Intersection: one angle 50°. The other three:',o:['130°, 50°, 130°','50°, 50°, 50°','40°, 50°, 40°','130°, 130°, 130°'],a:0,w:'Pairs.'},
 {lv:2,q:'"F" shape shows:',o:['alternate','corresponding','co-interior','vertically opposite'],a:1,w:'F.'},
 {lv:2,q:'Parallel lines: alternate interior angle 64°. Its pair:',o:['116°','64°','26°','128°'],a:1,w:'Equal.'},
 {lv:3,q:'Parallel lines: co-interior angles x and 3x. x =',o:['45°','60°','30°','90°'],a:0,w:'4x = 180.'},
 {lv:3,q:'Corresponding angles 85° and 95°. The lines are:',o:['parallel','not parallel','perpendicular','same line'],a:1,w:'Not equal.'},
 {lv:4,q:'Parallel lines, ∠1 = 65° (top-right). Bottom-left ∠7 (alternate exterior):',o:['65°','115°','25°','180°'],a:0,w:'Equal.'},
 {lv:4,q:'Angles around a point: 90°, 120°, x. x =',o:['150°','60°','90°','30°'],a:0,w:'360 − 210.'},
 {lv:5,open:true,m:3,q:'Two parallel lines are cut by a transversal; one angle is 72°. Find all eight angles with reasons.',ans:['Four angles = 72° (corresponding/vertically opposite/alternate) (1.5)','Four angles = 108° (linear pairs) (1.5)']},
 {lv:5,open:true,m:2,q:'Explain why vertically opposite angles are equal.',ans:['∠1 + ∠2 = 180° and ∠2 + ∠3 = 180° (linear pairs) (1)','So ∠1 = ∠3 (1)']}
];

const ONEMIN=['Linear pair 180°; vertically opposite equal.','Perpendicular 90°; parallel never meet.','Transversal makes 8 angles.','F corresponding, Z alternate, C co-interior.','Parallel: F, Z equal; C sums 180°.','Converse tests for parallel lines.'];
const KEYS=[['linear pair',/linear pair|180/i],['vertically opposite',/vertically opposite|opposite/i],['parallel',/parallel/i],['transversal',/transversal/i],['corresponding/alternate',/correspond|alternate/i],['co-interior',/interior|co-interior/i]];

/* ---------- lab ---------- */
let A=60,B=0,P='corr',quiz=null;
function draw(){const y1=90,y2=220,cx=230;const t=A;let s='';
 // line1 horizontal through (cx,y1); transversal through (cx,y1) at angle t; line2 through intersection with transversal at y2 tilted by B
 const dx=(y2-y1)/Math.tan(t*D);const x2=cx-dx; // transversal going down-left when t<90
 s+=line(cx,y1,0,460)+line(x2,y2,B,460,B===0?ink:OR)+line((cx+x2)/2,(y1+y2)/2,t,200,BL,2.5);
 s+=T(445,y1-6,'l','font-size="13"')+T(445,y2-6-Math.tan(B*D)*210,'m','font-size="13"');
 // angles at top: 1: between line(0) and transversal(t) [0..t], 2: [t..180], 3: [180..180+t], 4: [180+t..360]
 const top=[[0,t],[t,180],[180,180+t],[180+t,360]],bot=[[B,t],[t,180+B],[180+B,180+t],[180+t,360+B]];
 const val=k=>{const a=k<4?top[k]:bot[k-4];return Math.round(a[1]-a[0])};
 const pairs={corr:[0,4],alt:[2,4],co:[3,4],vo:[0,2],lp:[0,1]};const [i,j]=pairs[P];
 const draws=k=>{const a=k<4?top[k]:bot[k-4];return k<4?ang(cx,y1,26,a[0],a[1],k===i?OR:GN):ang(x2,y2,26,a[0],a[1],k===j?GN:OR)};
 s+=draws(i)+draws(j);
 const lab=(k)=>{const a=k<4?top[k]:bot[k-4];const m=(a[0]+a[1])/2*D;const c=k<4?[cx,y1]:[x2,y2];return T(c[0]+44*Math.cos(m),c[1]-44*Math.sin(m)+4,`${k+1}: ${val(k)}°`,'font-size="12" font-weight="700"')};
 s+=lab(i)+lab(j);$('#tSvg').innerHTML=s;$('#tAv').textContent=A+'°';$('#tBv').textContent=(B>0?'+':'')+B+'°';
 const vi=val(i),vj=val(j);const par=B===0;const name={corr:'Corresponding',alt:'Alternate interior',co:'Interior angles on the same side',vo:'Vertically opposite',lp:'Linear pair'}[P];
 let m=`<p><b>${name}:</b> ∠${i+1} = ${vi}°, ∠${j+1} = ${vj}°. `;
 if(P==='co')m+=`Sum = ${vi+vj}°. ${par?'Lines are parallel → sum is 180°.':'Lines are NOT parallel → sum is not 180°.'}`;
 else if(P==='lp')m+='Sum = 180° always.';else if(P==='vo')m+='Always equal.';else m+=par?'Lines are parallel → equal.':'Line m is tilted → not equal, so l and m are not parallel.';
 $('#tOut').innerHTML=m+'</p>'}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('tS'))labChange(e.target)})}
function labClick(b){if(b.id==='tQ'){B=0;$('#tB').value=0;A=[40,50,55,65,70,75,110,115,125,130][Math.floor(Math.random()*10)];$('#tA').value=A;const types=['corr','alt','co','vo','lp'];P=types[Math.floor(Math.random()*5)];$('#tP').value=P;draw();
  const pairs={corr:[0,4],alt:[2,4],co:[3,4],vo:[0,2],lp:[0,1]};const [i,j]=pairs[P];const top=[A,180-A,A,180-A],bot=[A,180-A,A,180-A];const vi=top[i],vj=j<4?top[j]:bot[j-4];quiz={ans:vj,i,j,vi};
  $('#tOut').innerHTML=`<p>Lines l ∥ m. ∠${i+1} = ${vi}°. Find ∠${j+1}.</p>`;$('#tSvg').innerHTML=$('#tSvg').innerHTML.replace(new RegExp(`${j+1}: ${vj}°`),`${j+1}: ?`);return true}
 if(b.id==='tC'){if(!quiz){$('#tOut').innerHTML='<p>Press Quiz first.</p>';return true}const g=+$('#tAns').value;$('#tOut').innerHTML=g===quiz.ans?`<p class="fb ok">Correct: ∠${quiz.j+1} = ${quiz.ans}°.</p>`:`<p class="fb no">Not quite: ∠${quiz.j+1} = ${quiz.ans}°. Equal pairs (F, Z, vertically opposite) or 180° pairs (C, linear).</p>`;quiz=null;draw();return true}return false}
function labChange(t){if(t.id==='tA'){A=+t.value}else if(t.id==='tB'){B=+t.value}else if(t.id==='tP'){P=t.value}else return false;quiz=null;draw();return true}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
