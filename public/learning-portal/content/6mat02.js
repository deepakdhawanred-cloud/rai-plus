/* Rai Plus content pack: Class 6 Mathematics (Ganita Prakash), Chapter 2 – Lines and Angles. */
RP.register({key:'6mat02',cls:'6',subject:'Mathematics',ch:'2',title:"Lines and Angles",color:'#1f5f8b',
crumb:"Class 6 Mathematics · Ganita Prakash",h1:"Chapter 2: Lines and Angles",sub:"Points, lines, segments and rays; angles as turns; types of angles; measuring with a protractor.",heroLabel:"A ray turning to make an angle, with a protractor",labName:'Angle lab',
theme:"\n:root{--g:light-dark(#1f5f8b,#8fc2e6);--g2:light-dark(#e8f1f8,#0b1622);--line:light-dark(#cde0ee,#22384b);--bg:light-dark(#ffffff,#081018);--card:light-dark(#ffffff,#0d1620);\n--ink:light-dark(#0d1d2a,#e1ecf5);--mute:light-dark(#475d70,#a7bccd);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#174a6d}\n",
labHTML:`  <h2>Angle lab</h2>
  <p>Turn the arm to make an angle. Read it on the protractor. In Guess mode, estimate first, then check.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="gSvg" viewBox="0 0 460 300" role="img" aria-label="Angle with protractor" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Angle: <b id="gAv"></b><input type="range" id="gA" class="gS" min="0" max="360" value="50"></label></div><div class="ctrl"><label><input type="checkbox" id="gProt" checked> Show protractor</label></div><div class="ctrl"><button class="btn" id="gNew">Guess mode: new angle</button> <input id="gGuess" type="number" style="width:5em" placeholder="°"> <button class="btn" id="gCheck">Check</button></div><div class="box y" id="gOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#1f5f8b',LABNAME='Angle lab',MIND_CENTER='Lines & angles';
const BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',GR='#888780',PU='#6a4fb3',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const pt=(x,y,n,c=ink)=>`<circle cx="${x}" cy="${y}" r="4" fill="${c}"/>`+(n?T(x,y-10,n,'font-size="13" font-style="italic"'):'');
const arrowHead=(x,y,a,c)=>`<path d="M${x} ${y} l${(-10*Math.cos(a-0.4)).toFixed(1)} ${(-10*Math.sin(a-0.4)).toFixed(1)} M${x} ${y} l${(-10*Math.cos(a+0.4)).toFixed(1)} ${(-10*Math.sin(a+0.4)).toFixed(1)}" stroke="${c}" stroke-width="2"/>`;
function angleFig(cx,cy,deg,r=90,c=OR,arc=true){const a=-deg*Math.PI/180;const x2=cx+r*Math.cos(a),y2=cy+r*Math.sin(a);let s=`<line x1="${cx}" y1="${cy}" x2="${cx+r}" y2="${cy}" stroke="${ink}" stroke-width="2"/><line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="2.5"/>`;
 if(arc&&deg>0){const rr=24,large=deg>180?1:0;s+=deg===90?`<path d="M${cx+16} ${cy} v-16 h-16" fill="none" stroke="${c}"/>`:`<path d="M${cx+rr} ${cy} A${rr} ${rr} 0 ${large} 0 ${(cx+rr*Math.cos(a)).toFixed(1)} ${(cy+rr*Math.sin(a)).toFixed(1)}" fill="none" stroke="${c}"/>`}return s}
function heroDraw(){return `<line x1="40" y1="100" x2="160" y2="100" stroke="#fff" stroke-width="3"/><line x1="40" y1="100" x2="130" y2="30" stroke="#fff" stroke-width="3"/><path d="M200 100 a60 60 0 0 1 120 0z" fill="none" stroke="#fff" stroke-width="2"/>`}
const HERO=heroDraw;
const MIND=[['Point, line, segment',100,50],['Ray',420,50],['Angle as a turn',90,150],['Comparing angles',430,150],['Types of angles',110,250],['Protractor',410,250]];

const C=[
{id:'g1',num:'2.1',title:'Point, line segment and line',
 intro:'Prick a paper with a pin. What is the smallest mark you can make?',
 obj:'Describe a point, line segment and line and name them.',
 prior:'Shapes from earlier classes.',
 simple:'A point marks an exact location; it has no length or width. We name it with a capital letter, e.g. point A. A line segment is the shortest path between two points A and B, written AB with a bar on top (AB̅); it has two end points and a fixed length. A line extends endlessly in both directions; it is drawn with arrows at both ends and named by any two points on it, e.g. line AB, or by a small letter like l.',
 detail:'Through one point, endless lines can pass. Through two points, exactly one line passes. Examples of line segments: edges of a table, a stretched string. The tip of a compass or a pencil dot shows a point.',
 real:'The edge of your geometry box is a line segment; a railway track seen far away seems to go on and on.',
 apply:'How many line segments are in a triangle? Name them.',
 see:{w:520,h:200,f:[
  ['A point.',pt(60,100,'A')],
  ['A line segment AB: two end points.',`<line x1="150" y1="100" x2="290" y2="100" stroke="${BL}" stroke-width="3"/>`+pt(150,100,'A')+pt(290,100,'B')],
  ['A line: goes on in both directions.',`<line x1="330" y1="100" x2="500" y2="100" stroke="${OR}" stroke-width="3"/>`+arrowHead(500,100,0,OR)+arrowHead(330,100,Math.PI,OR)+pt(380,100,'P')+pt(450,100,'Q')+lbl(415,150,'line PQ')]]},
 seeNote:'Segment ends; line doesn\'t.',
 do:{title:'Fold a line',mat:'A sheet of paper',steps:['Fold the paper and crease it.','The crease is a line segment.','Mark two points on it and name it.'],obs:'A straight crease.',why:'Shortest path between end points.',lab:false},
 memo:'"Point: place. Segment: two ends. Line: no end."',
 miscon:['"A line has length." A line goes on forever; only a segment has a length.'],
 terms:['Point','Line segment','Line','End point'],
 q:{q:'How many lines pass through two given points?',o:['none','exactly one','two','many'],a:1,why:'One line.'},
 exam:'Difference between line and line segment: 2 marks.'},

{id:'g2',num:'2.2',title:'Ray',
 intro:'A torch beam starts at the torch and goes on. What shape is that?',
 obj:'Describe and name a ray.',
 prior:'Line and segment (2.1).',
 simple:'A ray starts from one point (its starting point) and goes on endlessly in one direction. Ray OP starts at O and passes through P; we always write the starting point first. A beam of sunlight or torch light is a model of a ray.',
 detail:'Ray OP and ray PO are different: they start at different points and go in opposite directions. A line contains endlessly many rays.',
 real:'Light from a lighthouse starts at the lamp and travels outwards.',
 apply:'Is ray AB the same as ray BA? Explain.',
 see:{w:520,h:180,f:[
  ['Starts at O…',pt(80,90,'O')],
  ['…goes through P and on forever.',`<line x1="80" y1="90" x2="440" y2="90" stroke="${OR}" stroke-width="3"/>`+arrowHead(440,90,0,OR)+pt(220,90,'P')],
  ['Write the starting point first: ray OP.',lbl(260,150,'ray OP','font-size="16" font-weight="700"')]]},
 seeNote:'One end point, one direction.',
 do:{title:'Torch rays',mat:'A torch in a dusty or misty room',steps:['Shine the torch.','Draw what you see.'],obs:'A beam from a point.',why:'Model of a ray.',lab:false},
 memo:'"Ray: start here, never stop."',
 miscon:['"Ray OP = ray PO." Different starting points.'],
 terms:['Ray','Starting point'],
 q:{q:'A ray has:',o:['no end point','one end point','two end points','three end points'],a:1,why:'Starting point only.'},
 exam:'Draw and name a ray: 1 mark.'},

{id:'g3',num:'2.3',title:'Angle as a turn',
 intro:'Open a door a little, then wider. What changes?',
 obj:'Describe an angle as the amount of turn between two rays from a common point.',
 prior:'Rays (2.2).',
 simple:'An angle is formed by two rays starting from the same point. The point is the vertex; the rays are the arms. We name an angle with three letters, vertex in the middle: ∠PQR (vertex Q), or just ∠Q. The size of an angle is the amount of turn from one arm to the other.',
 detail:'Examples: opening a door, the hands of a clock, scissors, opening a book. The length of the arms does not change the size of the angle; only the turn does. Points can be in the interior or exterior of an angle.',
 real:'Clock hands make different angles at different times; at 3 o\'clock they make a right angle.',
 apply:'Name the vertex and arms of ∠ABC.',
 see:{w:520,h:220,f:[
  ['Two rays from a common point Q.',angleFig(150,160,55,130,OR,false)+pt(150,160,'Q')+pt(280,160,'R')+pt(225,52,'P')],
  ['The turn between the arms is the angle.',`<path d="M190 160 A40 40 0 0 0 173 127" fill="none" stroke="${OR}" stroke-width="2"/>`],
  ['∠PQR: vertex Q in the middle.',lbl(400,100,'∠PQR or ∠Q','font-size="16" font-weight="700"')+lbl(400,130,'vertex Q · arms QP, QR')]]},
 seeNote:'Longer arms don\'t make a bigger angle.',
 do:{title:'Paper arms',mat:'Two paper strips, a pin',steps:['Join the strips at one end with a pin.','Turn one strip to make small and large angles.'],obs:'The turn changes.',why:'Angle = amount of turn.',lab:true},
 memo:'"Vertex in the middle; size is the turn."',
 miscon:['"Longer arms mean a bigger angle." Arms\' length doesn\'t matter.'],
 terms:['Angle','Vertex','Arm','Interior','Exterior'],
 q:{q:'In ∠XYZ, the vertex is:',o:['X','Y','Z','none'],a:1,why:'Middle letter.'},
 exam:'Name an angle in three ways: 1 mark.'},

{id:'g4',num:'2.4',title:'Types of angles',
 intro:'Is the corner of your book a small or a large turn?',
 obj:'Classify angles by size using degrees.',
 prior:'Angle as turn (2.3).',
 simple:'Angles are measured in degrees (°). A full turn is 360°. A straight angle (half turn) is 180°. A right angle (quarter turn) is 90°. Acute angle: less than 90°. Obtuse angle: more than 90° but less than 180°. Reflex angle: more than 180° but less than 360°.',
 detail:'Two lines that meet at a right angle are perpendicular. The corner of a book, a set square and a door frame make right angles. Clock: from 12 to 3 the minute hand turns 90°; in one hour it turns 360°. Comparing angles: place one over the other with vertices and one arm together (superimposition).',
 real:'The minute hand turns 6° every minute.',
 apply:'Which type of angle do the clock hands make at 5 o\'clock?',
 see:{w:520,h:240,f:[
  ['Acute < 90°.',angleFig(40,110,45,70,GN)+lbl(75,140,'acute')],
  ['Right = 90°.',angleFig(170,110,90,70,BL)+lbl(205,140,'right')],
  ['Obtuse: between 90° and 180°.',angleFig(330,110,130,70,OR)+lbl(330,140,'obtuse')],
  ['Straight = 180°; reflex: more than 180°.',angleFig(110,215,180,60,PU)+lbl(110,235,'straight')+angleFig(380,200,250,50,OR)+lbl(430,235,'reflex')]]},
 seeNote:'Quarter turn 90°, half turn 180°, full turn 360°.',
 do:{title:'Angle hunt',mat:'Classroom, a set square',steps:['Find 3 acute, 3 right and 3 obtuse angles around you.','Check with the set square corner.'],obs:'Many right angles in buildings.',why:'Building design.',lab:true},
 memo:'"A cute little angle < 90; right 90; obtuse > 90; straight 180; reflex > 180."',
 miscon:['"An angle bigger than 180° is impossible." Reflex angles exist.'],
 terms:['Degree (°)','Acute','Right','Obtuse','Straight','Reflex','Perpendicular'],
 q:{q:'An angle of 135° is:',o:['acute','right','obtuse','reflex'],a:2,why:'Between 90° and 180°.'},
 exam:'Classify given angles: 2 marks.'},

{id:'g5',num:'2.5',title:'Measuring and drawing angles with a protractor',
 intro:'How do we know an angle is exactly 40° and not 45°?',
 obj:'Measure and draw angles using a protractor.',
 prior:'Degrees (2.4).',
 simple:'A protractor is a half circle marked from 0° to 180° on two scales (inner and outer). To measure: place the centre point on the vertex; line up the base line with one arm; read where the other arm crosses, using the scale that starts at 0° on the first arm. To draw ∠ABC = 60°: draw ray BC, place the centre on B along BC, mark 60° from the scale starting at 0° on BC, and join B to the mark.',
 detail:'Common mistake: reading the wrong scale (e.g. 120° instead of 60°). Always estimate first: is it acute or obtuse? For a reflex angle, measure the smaller angle and subtract from 360°. Angles in a straight line add up to 180°.',
 real:'Engineers and carpenters measure angles for roofs and stairs.',
 apply:'A reflex angle\'s smaller side measures 70°. What is the reflex angle?',
 see:{w:520,h:240,f:[
  ['A protractor: 0° to 180°.',`<path d="M110 200 A150 150 0 0 1 410 200 Z" fill="${BL}" opacity=".08" stroke="${BL}"/>`+[0,30,60,90,120,150,180].map(d=>{const a=Math.PI-d*Math.PI/180;return `<line x1="${260+150*Math.cos(a)}" y1="${200-150*Math.sin(a)}" x2="${260+135*Math.cos(a)}" y2="${200-135*Math.sin(a)}" stroke="${BL}"/>`+T(260+120*Math.cos(a),204-120*Math.sin(a),String(180-d),'font-size="11"')}).join('')],
  ['Centre on the vertex; base along one arm.',`<line x1="260" y1="200" x2="440" y2="200" stroke="${ink}" stroke-width="2.5"/>`+pt(260,200,'B')],
  ['Read where the other arm crosses: 60°.',`<line x1="260" y1="200" x2="${260+170*Math.cos(Math.PI/3)}" y2="${200-170*Math.sin(Math.PI/3)}" stroke="${OR}" stroke-width="2.5"/>`+lbl(400,80,'∠ = 60°','font-size="16" font-weight="700" fill="'+OR+'"')]]},
 seeNote:'Start from 0° on the first arm.',
 do:{title:'Measure and check',mat:'Protractor, ruler, pencil',steps:['Draw any three angles.','Estimate, then measure each.','Swap with a friend and check.'],obs:'Estimates improve.',why:'Practice.',lab:true},
 memo:'"Centre on vertex, zero on arm, read from zero."',
 miscon:['"Read the first number you see." Use the scale starting at 0° on your arm.'],
 terms:['Protractor','Inner scale','Outer scale','Base line'],
 q:{q:'A reflex angle whose other side is 70° measures:',o:['110°','250°','290°','180°'],a:2,why:'360 − 70.'},
 exam:'Measure and draw angles: 2–3 marks.'}
];

const CARDS=[['Point','Exact location; named A.'],['Line segment','Two end points; fixed length.'],['Line','Endless both ways.'],['Ray','One end point; endless one way; ray OP starts at O.'],['Angle','Two rays from a common vertex.'],['Naming','∠PQR: vertex Q in the middle.'],['Full turn','360°'],['Straight','180°'],['Right','90°; perpendicular lines.'],['Acute / Obtuse','< 90° / between 90° and 180°.'],['Reflex','Between 180° and 360°.'],['Protractor','Centre on vertex, 0 on arm, read from 0.']];

const Q=[
 {lv:1,q:'A line segment has how many end points?',o:['0','1','2','many'],a:2,w:'Two.'},
 {lv:1,q:'A right angle measures:',o:['45°','90°','180°','360°'],a:1,w:'Quarter turn.'},
 {lv:1,q:'An angle of 30° is:',o:['acute','right','obtuse','reflex'],a:0,w:'< 90°.'},
 {lv:2,q:'In ∠ABC the vertex is:',o:['A','B','C','AB'],a:1,w:'Middle letter.'},
 {lv:2,q:'Angle of a half turn:',o:['90°','180°','270°','360°'],a:1,w:'Straight.'},
 {lv:2,q:'Which is reflex?',o:['95°','170°','200°','90°'],a:2,w:'> 180°.'},
 {lv:3,q:'Angle between clock hands at 3 o\'clock:',o:['30°','60°','90°','180°'],a:2,w:'Quarter turn.'},
 {lv:3,q:'The minute hand turns in 10 minutes:',o:['10°','36°','60°','90°'],a:2,w:'6° per minute.'},
 {lv:4,q:'Two angles on a straight line; one is 65°. The other:',o:['25°','115°','135°','295°'],a:1,w:'180 − 65.'},
 {lv:4,q:'Angle between clock hands at 6 o\'clock:',o:['90°','120°','180°','360°'],a:2,w:'Straight.'},
 {lv:5,open:true,m:3,q:'Write the steps to draw ∠PQR = 75° with a protractor.',ans:['Draw ray QR (1)','Place centre on Q, base along QR; mark 75° on the scale starting at 0 on QR (1)','Join Q to the mark; label P (1)']},
 {lv:5,open:true,m:2,q:'How is a line different from a ray?',ans:['Line: no end point, endless both ways (1)','Ray: one starting point, endless in one direction (1)']}
];

const ONEMIN=['Point, segment (2 ends), line (no ends), ray (1 end).','Angle: two rays from a vertex; ∠PQR.','Size = turn; arms\' length doesn\'t matter.','360° full, 180° straight, 90° right.','Acute, obtuse, reflex.','Protractor: centre on vertex, read from 0.'];
const KEYS=[['point/line/segment',/point|segment|line/i],['ray',/ray/i],['vertex/arms',/vertex|arm/i],['degrees',/degree|°|360|180|90/i],['types',/acute|obtuse|reflex|right/i],['protractor',/protractor/i]];

/* ---------- lab ---------- */
let ang=50,prot=true,secret=null;
function type(d){return d===0?'zero angle':d<90?'acute':d===90?'right':d<180?'obtuse':d===180?'straight':d<360?'reflex':'complete (full turn)'}
function draw(){const cx=230,cy=190,R=140,show=secret===null?ang:secret;let s='';
 if(prot&&secret===null){s+=`<path d="M${cx-R} ${cy} A${R} ${R} 0 0 1 ${cx+R} ${cy} Z" fill="${BL}" opacity=".07" stroke="${BL}"/>`;for(let d=0;d<=180;d+=10){const a=Math.PI-d*Math.PI/180,l=d%30===0?16:8;s+=`<line x1="${cx+R*Math.cos(a)}" y1="${cy-R*Math.sin(a)}" x2="${cx+(R-l)*Math.cos(a)}" y2="${cy-(R-l)*Math.sin(a)}" stroke="${BL}"/>`;if(d%30===0)s+=T(cx+(R-28)*Math.cos(a),cy+4-(R-28)*Math.sin(a),String(180-d),'font-size="10"')}}
 s+=angleFig(cx,cy,show,R+20,OR);s+=pt(cx,cy,'');
 $('#gSvg').innerHTML=s;$('#gAv').textContent=secret===null?ang+'°':'?'}
function info(){$('#gOut').innerHTML=secret===null?`<p><b>${ang}°</b> — ${type(ang)}</p>${ang>180&&ang<360?`<p>Measure the other side: ${360-ang}°, then 360° − ${360-ang}° = ${ang}°.</p>`:''}`:'<p>Estimate the angle, type it and press Check.</p>'}
function labShow(){draw();info()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='gA')labChange(e.target)})}
function labClick(b){if(b.id==='gNew'){secret=5*Math.round((10+Math.random()*330)/5);draw();info();return true}
 if(b.id==='gCheck'){if(secret===null){$('#gOut').innerHTML='<p>Press "Guess mode: new angle" first.</p>';return true}const g=parseFloat($('#gGuess').value);if(isNaN(g)){$('#gOut').innerHTML='<p>Type your estimate.</p>';return true}const e=Math.abs(g-secret);$('#gOut').innerHTML=`<p class="fb ${e<=10?'ok':'no'}">The angle was ${secret}° (${type(secret)}). You were ${e}° off. ${e<=10?'Great estimate!':'Compare it with 90° and 180° first.'}</p>`;ang=secret;secret=null;$('#gA').value=ang;draw();return true}return false}
function labChange(t){if(t.id==='gA'){ang=+t.value;secret=null;draw();info();return true}if(t.id==='gProt'){prot=t.checked;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
