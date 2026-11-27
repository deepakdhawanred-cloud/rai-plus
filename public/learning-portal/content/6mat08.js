/* Rai Plus content pack: Class 6 Mathematics (Ganita Prakash), Chapter 8 – Playing with Constructions. */
RP.register({key:'6mat08',cls:'6',subject:'Mathematics',ch:'8',title:"Playing with Constructions",color:'#185fa5',
crumb:"Class 6 Mathematics · Ganita Prakash",h1:"Chapter 8: Playing with Constructions",sub:"Circles and curves with a compass, properties of squares and rectangles, constructing them, and finding points at given distances.",heroLabel:"A compass drawing two arcs that cross",labName:'Compass lab',
theme:"\n:root{--g:light-dark(#185fa5,#9cc8f0);--g2:light-dark(#e8f1fa,#0c1724);--line:light-dark(#cfe0f1,#22364b);--bg:light-dark(#ffffff,#090f17);--card:light-dark(#ffffff,#0e1620);\n--ink:light-dark(#0e1a26,#e2ecf6);--mute:light-dark(#4b5f72,#a4b8cb);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#12477c}\n",
labHTML:`  <h2>Compass lab</h2>
  <p>Find the points that are a given distance from A and from B. Draw an arc from each; the crossing points are the answers.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="cSvg" viewBox="0 0 460 300" role="img" aria-label="Two arcs from A and B" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>AB = <b id="cDv"></b><input type="range" class="cS" id="cD" min="2" max="10" step="0.5" value="6"></label></div><div class="ctrl"><label>Distance from A = <b id="cAv"></b><input type="range" class="cS" id="cA" min="1" max="10" step="0.5" value="5"></label></div><div class="ctrl"><label>Distance from B = <b id="cBv"></b><input type="range" class="cS" id="cB" min="1" max="10" step="0.5" value="4"></label></div><div class="ctrl"><label><input type="checkbox" id="cTri" checked> Join to make a triangle</label></div><div class="box y" id="cOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#185fa5',LABNAME='Compass lab',MIND_CENTER='Constructions';
const BL='#185fa5',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const pt=(x,y,n,c=ink,dy=-10)=>`<circle cx="${x}" cy="${y}" r="4" fill="${c}"/>`+(n?T(x,y+dy,n,'font-size="13" font-style="italic"'):'');
const arc=(cx,cy,r,a1,a2,c=BL)=>{const p=a=>[(cx+r*Math.cos(a)).toFixed(1),(cy+r*Math.sin(a)).toFixed(1)];const [x1,y1]=p(a1),[x2,y2]=p(a2);return `<path d="M${x1} ${y1} A${r} ${r} 0 ${a2-a1>Math.PI?1:0} 1 ${x2} ${y2}" fill="none" stroke="${c}" stroke-width="1.8"/>`};
const right=(x,y,dx,dy)=>`<path d="M${x+dx*12} ${y} v${dy*12} h${-dx*12}" fill="none" stroke="${ink}"/>`;
function heroDraw(){return `<circle cx="80" cy="110" r="4" fill="#fff"/><circle cx="200" cy="110" r="4" fill="#fff"/><path d="M120 40 A90 90 0 0 1 170 70" stroke="#fff" fill="none" stroke-width="3"/><path d="M160 40 A80 80 0 0 0 120 70" stroke="#fff" fill="none" stroke-width="3"/>`}
const HERO=heroDraw;
const MIND=[['Circles & curves',100,50],['Rectangles & squares',420,50],['Constructing a rectangle',90,150],['Points at a distance',430,150],['Diagonals',110,250],['Designs',410,250]];

const C=[
{id:'c1',num:'8.1',title:'Circles and curves with a compass',
 intro:'How do you draw a perfectly round circle?',
 obj:'Use a compass to draw circles and arcs; know centre, radius and diameter.',
 prior:'Lines and angles (Ch 2).',
 simple:'A compass has a pointed leg and a pencil leg. Keep the point fixed and turn the pencil to draw a circle. The fixed point is the centre. The distance from the centre to the circle is the radius. A line through the centre from one side of the circle to the other is a diameter = 2 × radius. Part of a circle is an arc.',
 detail:'All points on a circle are the same distance (radius) from the centre. With arcs of circles you can draw beautiful designs: wavy borders, flowers, "eyes" and patterns used in rangoli and kolam.',
 real:'Rangoli artists use a string tied to a fixed point to draw large circles.',
 apply:'A circle has diameter 10 cm. What is its radius?',
 see:{w:520,h:220,f:[
  ['Fix the point: the centre O.',pt(260,110,'O')],
  ['Turn the pencil: a circle of radius r.',`<circle cx="260" cy="110" r="80" fill="none" stroke="${BL}" stroke-width="2.5"/><line x1="260" y1="110" x2="340" y2="110" stroke="${OR}" stroke-width="2"/>`+lbl(300,102,'r','fill="'+OR+'"')],
  ['Diameter = 2 × radius.',`<line x1="180" y1="110" x2="340" y2="110" stroke="${GN}" stroke-width="2" stroke-dasharray="6 4"/>`+lbl(260,210,'diameter = 2r','font-weight="700"')]]},
 seeNote:'Every point on the circle is r from O.',
 do:{title:'Compass flower',mat:'Compass, pencil',steps:['Draw a circle of radius 4 cm.','From any point on it, draw an arc of the same radius through the centre.','Repeat round the circle.'],obs:'A six-petal flower.',why:'Equal radii.',lab:true},
 memo:'"Fix the point, turn the pencil."',
 miscon:['"Radius = diameter." Diameter is twice the radius.'],
 terms:['Compass','Centre','Radius','Diameter','Arc'],
 q:{q:'Diameter of a circle of radius 6 cm:',o:['3 cm','6 cm','12 cm','36 cm'],a:2,why:'2 × 6.'},
 exam:'Draw a circle; mark radius and diameter: 2 marks.'},

{id:'c2',num:'8.2',title:'Properties of rectangles and squares',
 intro:'What makes a rectangle a rectangle?',
 obj:'State the properties of rectangles and squares.',
 prior:'Angles (Ch 2).',
 simple:'A rectangle has four sides; opposite sides are equal; all four angles are right angles (90°). A square is a rectangle with all four sides equal. In a rectangle, the diagonals are equal and cut each other in half. In a square, they also meet at right angles.',
 detail:'Naming: rectangle ABCD — go around in order: A, B, C, D. Sides AB, BC, CD, DA; diagonals AC and BD. A shape with four equal sides but no right angles is not a square (it is a rhombus).',
 real:'Doors, books and phone screens are rectangles; chessboard squares are squares.',
 apply:'Is every square a rectangle? Is every rectangle a square?',
 see:{w:520,h:220,f:[
  ['Rectangle ABCD.',`<rect x="60" y="50" width="200" height="110" fill="none" stroke="${BL}" stroke-width="2.5"/>`+pt(60,160,'D',ink,18)+pt(260,160,'C',ink,18)+pt(260,50,'B')+pt(60,50,'A')],
  ['Opposite sides equal; every angle 90°.',right(60,50,1,1)+right(260,50,-1,1)+right(60,160,1,-1)+right(260,160,-1,-1)],
  ['Square: all sides equal too.',`<rect x="340" y="50" width="110" height="110" fill="none" stroke="${OR}" stroke-width="2.5"/>`+lbl(395,185,'square: 4 equal sides, 4 right angles')]]},
 seeNote:'Square = special rectangle.',
 do:{title:'Check a book',mat:'A book, ruler, set square',steps:['Measure all four sides.','Check corners with a set square.'],obs:'Opposite sides equal; 90° corners.',why:'Rectangle.',lab:false},
 memo:'"Rectangle: opposite equal, all right. Square: all equal, all right."',
 miscon:['"A square is not a rectangle." It is a special rectangle.'],
 terms:['Rectangle','Square','Opposite sides','Right angle','Diagonal'],
 q:{q:'Which is true for every rectangle?',o:['all sides equal','all angles 90°','diagonals unequal','only 2 right angles'],a:1,why:'Definition.'},
 exam:'Properties of rectangle/square: 2 marks.'},

{id:'c3',num:'8.3',title:'Constructing a rectangle and a square',
 intro:'Draw a rectangle 6 cm × 4 cm exactly. Where do you start?',
 obj:'Construct a rectangle or square with given sides using ruler and protractor/set square.',
 prior:'Properties (8.2).',
 simple:'To construct rectangle ABCD with AB = 6 cm, BC = 4 cm: (1) draw AB = 6 cm; (2) at A and B draw 90° angles; (3) mark D on the line at A and C on the line at B, each 4 cm away (use a compass of radius 4 cm); (4) join DC. Check: DC should be 6 cm. For a square, all sides are the same length.',
 detail:'A compass is used to copy lengths exactly: open it to 4 cm on a ruler and draw arcs from A and B. You can also construct a rectangle from one side and a diagonal: draw AB, draw 90° at B, then from A draw an arc of radius equal to the diagonal to cut that line at C.',
 real:'Carpenters mark rectangular frames using a set square.',
 apply:'Write the steps to construct a square of side 5 cm.',
 see:{w:520,h:230,f:[
  ['Draw AB = 6 cm.',`<line x1="120" y1="190" x2="360" y2="190" stroke="${ink}" stroke-width="2.5"/>`+pt(120,190,'A',ink,18)+pt(360,190,'B',ink,18)+lbl(240,212,'6 cm')],
  ['Draw 90° at A and B.',`<line x1="120" y1="190" x2="120" y2="20" stroke="${GR}"/><line x1="360" y1="190" x2="360" y2="20" stroke="${GR}"/>`+right(120,190,1,-1)+right(360,190,-1,-1)],
  ['Arcs of 4 cm mark D and C.',arc(120,190,160,-1.75,-1.39,OR)+arc(360,190,160,-1.75,-1.39,OR)+pt(120,30,'D')+pt(360,30,'C')],
  ['Join DC. Check DC = 6 cm.',`<line x1="120" y1="30" x2="360" y2="30" stroke="${BL}" stroke-width="2.5"/><line x1="120" y1="190" x2="120" y2="30" stroke="${BL}" stroke-width="2.5"/><line x1="360" y1="190" x2="360" y2="30" stroke="${BL}" stroke-width="2.5"/>`+lbl(420,110,'4 cm','text-anchor="start"')]]},
 seeNote:'Measure twice, draw once.',
 do:{title:'Construct and check',mat:'Ruler, compass, set square/protractor',steps:['Construct a 7 cm × 3 cm rectangle.','Measure both diagonals.'],obs:'Diagonals equal.',why:'Rectangle property.',lab:true},
 memo:'"Base, right angles, arcs, join."',
 miscon:['"Eyeballing 90° is fine." Use a set square or protractor.'],
 terms:['Construct','Set square','Copy a length'],
 q:{q:'First step to construct a 6 cm × 4 cm rectangle:',o:['draw a circle','draw AB = 6 cm','draw a diagonal','draw 45°'],a:1,why:'Start with a side.'},
 exam:'Construct a rectangle; write steps: 4 marks.'},

{id:'c4',num:'8.4',title:'Points at given distances',
 intro:'A treasure is 5 m from the well and 4 m from the tree. Where is it?',
 obj:'Locate points at given distances from two points using arcs.',
 prior:'Circles (8.1).',
 simple:'All points 5 cm from A lie on a circle of radius 5 cm around A. All points 4 cm from B lie on a circle of radius 4 cm around B. Where the two circles (or arcs) cross, the points are 5 cm from A AND 4 cm from B. There can be two such points, one, or none.',
 detail:'If AB is too long (more than 5 + 4 = 9 cm) the arcs don\'t meet. If AB is too short compared with the difference of the radii, one circle is inside the other and they don\'t meet. Joining A, B and a crossing point gives a triangle with sides AB, 5 cm and 4 cm: this is how triangles with three given sides are constructed.',
 real:'Mobile phone networks locate a phone using its distance from towers in the same way.',
 apply:'AB = 10 cm. Can you find a point 4 cm from A and 3 cm from B?',
 see:{w:520,h:240,f:[
  ['A and B, 6 cm apart.',pt(170,150,'A',ink,22)+pt(350,150,'B',ink,22)+`<line x1="170" y1="150" x2="350" y2="150" stroke="${GR}"/>`],
  ['Arc of 5 cm from A.',arc(170,150,150,-1.2,-0.2,BL)],
  ['Arc of 4 cm from B: they cross at P.',arc(350,150,120,-2.9,-1.9,OR)+pt(282.5,51,'P')+`<line x1="170" y1="150" x2="282.5" y2="51" stroke="${GN}"/><line x1="350" y1="150" x2="282.5" y2="51" stroke="${GN}"/>`+lbl(260,225,'P is 5 cm from A and 4 cm from B','font-weight="700"')]]},
 seeNote:'Crossing arcs = both conditions.',
 do:{title:'Treasure hunt',mat:'Two markers on the ground, rope',steps:['Tie rope of length 5 at A and 4 at B.','Walk each end until they meet.'],obs:'Two possible spots.',why:'Circles cross twice.',lab:true},
 memo:'"Arc from each, cross is the answer."',
 miscon:['"There is always exactly one point." There can be 0, 1 or 2.'],
 terms:['Arc','Intersection','Equidistant'],
 q:{q:'Arcs of 3 cm from A and 3 cm from B, AB = 8 cm:',o:['meet at 2 points','meet at 1 point','don\'t meet','meet everywhere'],a:2,why:'3 + 3 < 8.'},
 exam:'Locate a point using arcs: 3 marks.'},

{id:'c5',num:'8.5',title:'Diagonals and designs',
 intro:'Why do the diagonals of a rectangle cross exactly at its middle?',
 obj:'Explore diagonals of rectangles and squares; make designs.',
 prior:'8.2–8.4.',
 simple:'In a rectangle the two diagonals are equal and bisect each other (cut each other into two equal halves). So their crossing point is the centre of the rectangle, and a circle with that centre passes through all four corners. In a square the diagonals are also perpendicular (meet at 90°).',
 detail:'Using these facts: to construct a rectangle from its diagonals, draw two equal segments that bisect each other and join their ends. Designs like the "house" with a sloping roof, or a square with a quarter-circle in each corner, use compass and ruler together.',
 real:'Tiles with diagonal patterns and window grills use these properties.',
 apply:'A rectangle\'s diagonal is 10 cm. How far is its centre from each corner?',
 see:{w:520,h:220,f:[
  ['Rectangle with both diagonals.',`<rect x="160" y="60" width="200" height="100" fill="none" stroke="${BL}" stroke-width="2.5"/><line x1="160" y1="60" x2="360" y2="160" stroke="${OR}" stroke-width="2"/><line x1="360" y1="60" x2="160" y2="160" stroke="${OR}" stroke-width="2"/>`],
  ['They cross at the centre and are equal.',pt(260,110,'O',ink,-12)],
  ['A circle centred at O passes through all four corners.',`<circle cx="260" cy="110" r="111.8" fill="none" stroke="${GN}" stroke-dasharray="6 4"/>`]]},
 seeNote:'Equal halves of equal diagonals.',
 do:{title:'Corner circle',mat:'Rectangle drawing, compass',steps:['Draw both diagonals; mark O.','With centre O, radius OA, draw a circle.'],obs:'It passes through B, C, D.',why:'OA = OB = OC = OD.',lab:false},
 memo:'"Rectangle diagonals: equal, halve each other."',
 miscon:['"Diagonals of a rectangle meet at 90°." Only in a square.'],
 terms:['Diagonal','Bisect','Perpendicular'],
 q:{q:'Diagonals of a square:',o:['unequal','equal and perpendicular','parallel','do not meet'],a:1,why:'Square property.'},
 exam:'Properties of diagonals: 2 marks.'}
];

const CARDS=[['Compass','Fixed point + pencil.'],['Radius','Centre to circle.'],['Diameter','2 × radius.'],['Arc','Part of a circle.'],['Rectangle','Opposite sides equal, all angles 90°.'],['Square','All sides equal, all angles 90°.'],['Construct rectangle','Side, two right angles, arcs, join.'],['Points at distances','Crossing of two arcs: 0, 1 or 2 points.'],['Rectangle diagonals','Equal; bisect each other.'],['Square diagonals','Also perpendicular.']];

const Q=[
 {lv:1,q:'The fixed point of a circle:',o:['radius','centre','arc','diameter'],a:1,w:'Centre.'},
 {lv:1,q:'Radius 7 cm, diameter:',o:['3.5 cm','7 cm','14 cm','21 cm'],a:2,w:'2r.'},
 {lv:1,q:'Each angle of a rectangle:',o:['60°','90°','120°','180°'],a:1,w:'Right angle.'},
 {lv:2,q:'A square is a rectangle with:',o:['no right angles','all sides equal','one side longer','curved sides'],a:1,w:'Definition.'},
 {lv:2,q:'Points 4 cm from A form a:',o:['line','square','circle','triangle'],a:2,w:'Circle of radius 4.'},
 {lv:2,q:'Diagonals of a rectangle are:',o:['equal','unequal','perpendicular always','parallel'],a:0,w:'Equal.'},
 {lv:3,q:'Arcs 5 cm from A and 5 cm from B, AB = 6 cm meet at:',o:['0 points','1 point','2 points','3 points'],a:2,w:'5+5 > 6.'},
 {lv:3,q:'Rectangle diagonal 12 cm; centre to a corner:',o:['3 cm','6 cm','12 cm','24 cm'],a:1,w:'Half.'},
 {lv:4,q:'Arcs 2 cm from A and 3 cm from B, AB = 5 cm meet at:',o:['0','exactly 1','2','many'],a:1,w:'2+3 = 5: they just touch.'},
 {lv:4,q:'Why use a compass to mark 4 cm on the perpendicular line?',o:['looks nice','copies the length exactly','draws angles','not needed'],a:1,w:'Copying length.'},
 {lv:5,open:true,m:4,q:'Write the steps to construct a square of side 5 cm.',ans:['Draw AB = 5 cm (1)','Draw 90° at A and B (1)','Cut arcs of 5 cm on both lines: D and C (1)','Join DC; check DC = 5 cm (1)']},
 {lv:5,open:true,m:2,q:'Explain why there can be two points that are 5 cm from A and 4 cm from B.',ans:['Two circles can cross at two points (1)','One on each side of AB (1)']}
];

const ONEMIN=['Compass: centre, radius, diameter, arc.','Rectangle: opposite sides equal; all 90°.','Square: all sides equal too.','Construct: side, right angles, arcs, join.','Points at distances: crossing arcs.','Rectangle diagonals equal and bisect; square\'s also perpendicular.'];
const KEYS=[['compass/circle',/compass|circle/i],['radius/diameter',/radius|diameter/i],['rectangle',/rectangle/i],['square',/square/i],['arcs crossing',/arc|cross|intersect/i],['diagonals',/diagonal/i]];

/* ---------- lab ---------- */
let D=6,RA=5,RB=4,tri=true;
function draw(){const u=22,ax=230-D*u/2,bx=230+D*u/2,y=200;let s='';
 s+=`<circle cx="${ax}" cy="${y}" r="${RA*u}" fill="none" stroke="${BL}" stroke-width="1.5" opacity=".75"/><circle cx="${bx}" cy="${y}" r="${RB*u}" fill="none" stroke="${OR}" stroke-width="1.5" opacity=".75"/>`;
 s+=`<line x1="${ax}" y1="${y}" x2="${bx}" y2="${y}" stroke="${ink}" stroke-width="2"/>`+pt(ax,y,'A',ink,20)+pt(bx,y,'B',ink,20)+T(230,y+20,D+' cm','font-size="12"');
 const d=D,a=(RA*RA-RB*RB+d*d)/(2*d),h2=RA*RA-a*a;let n=0,P=[];
 if(d>RA+RB+1e-9||d<Math.abs(RA-RB)-1e-9)n=0;else{const h=Math.sqrt(Math.max(0,h2));const px=ax+a*u;P=h<1e-6?[[px,y]]:[[px,y-h*u],[px,y+h*u]];n=P.length}
 P.forEach((p,i)=>{s+=`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="6" fill="${GN}"/>`+T(p[0]+12,p[1]-6,i?'Q':'P','font-size="13" font-weight="700" text-anchor="start"');if(tri&&i===0&&n===2)s+=`<polygon points="${ax},${y} ${bx},${y} ${p[0].toFixed(1)},${p[1].toFixed(1)}" fill="${GN}" opacity=".15" stroke="${GN}" stroke-width="2"/>`});
 $('#cSvg').innerHTML=s;$('#cDv').textContent=D+' cm';$('#cAv').textContent=RA+' cm';$('#cBv').textContent=RB+' cm';
 let m;if(n===2)m=`<p class="fb ok">Two points, P and Q, are ${RA} cm from A and ${RB} cm from B.</p>${tri?`<p>Triangle ABP has sides ${D}, ${RA} and ${RB} cm.</p>`:''}`;
 else if(n===1)m='<p class="fb ok">The arcs just touch: exactly one point, on the line AB. No triangle — it is flat.</p>';
 else m=D>RA+RB?`<p class="fb no">No point: ${RA} + ${RB} = ${RA+RB} cm is less than AB = ${D} cm. The arcs can't reach each other.</p>`:`<p class="fb no">No point: one circle is inside the other (difference ${Math.abs(RA-RB)} cm is more than AB = ${D} cm).</p>`;
 $('#cOut').innerHTML=m}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('cS'))labChange(e.target)})}
function labClick(){return false}
function labChange(t){switch(t.id){case 'cD':D=+t.value;break;case 'cA':RA=+t.value;break;case 'cB':RB=+t.value;break;case 'cTri':tri=t.checked;break;default:return false}draw();return true}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
