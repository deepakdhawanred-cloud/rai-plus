/* Rai Plus content pack: Class 9 Mathematics, Chapter 3 – Coordinate Geometry (rationalised NCERT). */
RP.register({key:'9mat03',cls:'9',subject:'Mathematics',ch:'3',title:"Coordinate Geometry",color:'#6a4fb3',
crumb:"HBSE Class 9 Mathematics · Unit: Coordinate Geometry · Taught in July",h1:"Chapter 3: Coordinate Geometry",sub:"Why we need coordinates, the Cartesian plane with its axes and quadrants, the abscissa and ordinate, signs in each quadrant, and plotting points.",heroLabel:"Points on a coordinate grid",labName:'Coordinate challenge',
theme:"\n:root{--g:light-dark(#6a4fb3,#c6b6f0);--g2:light-dark(#f2eefb,#130e24);--line:light-dark(#ddd3f3,#2f2650);--bg:light-dark(#ffffff,#0c0918);--card:light-dark(#ffffff,#130f22);\n--ink:light-dark(#1d1438,#ebe6f8);--mute:light-dark(#5a4f7a,#b9b0d6);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#4a3390}\n",
labHTML:`  <h2>Coordinate challenge</h2>
  <p>Tap any grid point to see its coordinates and quadrant. Press <b>Challenge</b> to get a target point to plot — or <b>Read it</b> to name a point that appears. Keep a streak going!</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="cgSvg" viewBox="0 0 400 400" role="img" aria-label="Coordinate plane" style="color:var(--ink);max-width:460px;margin:auto;display:block"></svg></div></div>
  <div><div class="ctrl"><button class="btn p" id="cgC">Challenge: plot it</button> <button class="btn" id="cgR">Read it</button></div>
  <div class="ctrl" id="cgOpts" style="display:none"></div>
  <div class="box y" id="cgOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#6a4fb3',LABNAME='Coordinate challenge',MIND_CENTER='Coordinates';
const PU='#6a4fb3',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',RD='#c0392b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
function grid(x0,y0,u,n,showQ){let s='';for(let k=-n;k<=n;k++){s+=`<line x1="${x0+k*u}" y1="${y0-n*u}" x2="${x0+k*u}" y2="${y0+n*u}" stroke="${GR}" stroke-opacity="${k?.25:1}" stroke-width="${k?1:2}"/><line x1="${x0-n*u}" y1="${y0+k*u}" x2="${x0+n*u}" y2="${y0+k*u}" stroke="${GR}" stroke-opacity="${k?.25:1}" stroke-width="${k?1:2}"/>`;if(k)s+=T(x0+k*u,y0+14,k,'font-size="9"')+T(x0-9,y0-k*u+3,k,'font-size="9"')}
 s+=T(x0+n*u+8,y0+4,'x','font-size="12" font-weight="700"')+T(x0,y0-n*u-6,'y','font-size="12" font-weight="700"');
 if(showQ)[['I (+, +)',1,1],['II (−, +)',-1,1],['III (−, −)',-1,-1],['IV (+, −)',1,-1]].forEach(([t,a,b])=>s+=T(x0+a*n*u*.7,y0-b*n*u*.75,t,`font-size="13" font-weight="700" fill="${PU}" fill-opacity=".7"`));return s}
const pt=(x0,y0,u,x,y,c=OR,t='')=>`<circle cx="${x0+x*u}" cy="${y0-y*u}" r="5" fill="${c}"/>`+(t?T(x0+x*u+(x>=0?26:-26),y0-y*u-8,t,`font-size="12" font-weight="700" fill="${c}"`):'');
function heroDraw(){let s='<line x1="40" y1="75" x2="300" y2="75" stroke="#fff" stroke-width="2"/><line x1="170" y1="15" x2="170" y2="135" stroke="#fff" stroke-width="2"/>';[[230,40],[100,50],[120,110],[260,115]].forEach(([a,b])=>s+=`<circle cx="${a}" cy="${b}" r="6" fill="#fff"/>`);return s}
const HERO=heroDraw;
const MIND=[['Why coordinates',100,50],['Axes & origin',420,50],['Quadrants',90,150],['Abscissa & ordinate',430,150],['Plotting points',110,250],['Points on axes',410,250]];

const C=[
{id:'q1',num:'3.1',title:'Why do we need coordinates?',
 intro:'Your friend says "I am sitting near the window." The classroom has four windows. How could you describe your seat exactly?',
 obj:'Understand that a point in a plane needs two references to be located.',
 prior:'Number line (Chapter 1).',
 simple:'On a line, one number locates a point. In a plane (a flat surface), we need two numbers: how far along and how far up (or down). For example, "3rd row, 5th seat" or "the house at the corner of Street 2 and Lane 5". These pairs of numbers are coordinates.',
 detail:'The French mathematician René Descartes (1596–1650) developed this idea, so the system is called the Cartesian system. A city map with streets running north–south and east–west, a chess board (e4), and seat numbers in a cinema all use coordinate ideas.',
 real:'GPS locates any place on Earth using two coordinates: latitude and longitude.',
 apply:'Describe the position of your desk in the classroom using two numbers.',
 see:{w:520,h:220,f:[
  ['A classroom of desks.',[...Array(20)].map((_,i)=>`<rect x="${120+(i%5)*60}" y="${30+Math.floor(i/5)*42}" width="40" height="26" rx="4" fill="${GR}" fill-opacity=".2" stroke="${GR}"/>`).join('')],
  ['Row and column numbers.',[1,2,3,4,5].map(c=>lbl(140+(c-1)*60,22,'col '+c)).join('')+[1,2,3,4].map(r=>lbl(85,48+(r-1)*42,'row '+r)).join('')],
  ['(column 4, row 3).',`<rect x="300" y="114" width="40" height="26" rx="4" fill="${OR}" fill-opacity=".6" stroke="${OR}"/>`+lbl(260,205,'two numbers fix one place exactly','font-weight="700"')]]},
 seeNote:'Two numbers, one place.',
 do:{title:'Seat map',mat:'Classroom',steps:['Number rows and columns.','Each student says their pair; others find them.'],obs:'Unique positions.',why:'Coordinates.',lab:false},
 memo:'"One number on a line, two in a plane."',
 miscon:['"One distance is enough to locate a point in a plane." You need two.'],
 terms:['Plane','Coordinates','Cartesian system','Descartes'],
 q:{q:'How many numbers locate a point in a plane?',o:['1','2','3','4'],a:1,why:'Along and up.'},
 exam:'Short reasoning: 1 mark.'},

{id:'q2',num:'3.2',title:'The Cartesian plane: axes and origin',
 intro:'Two number lines cross at right angles. What do we get?',
 obj:'Describe the x-axis, y-axis, origin and the coordinate plane.',
 prior:'3.1.',
 simple:'Draw a horizontal number line (the x-axis) and a vertical number line (the y-axis), crossing at right angles at their zeros. The crossing point is the origin O. The plane is now the Cartesian (coordinate) plane. Right of O and above O are positive; left and below are negative.',
 detail:'Positive x-axis OX, negative x-axis OX\'; positive y-axis OY, negative y-axis OY\'. The axes are perpendicular. The same unit distance is used on both axes (unless stated otherwise).',
 real:'Graph paper is a ready-made Cartesian plane.',
 apply:'Name the four half-axes and say which way is positive on each axis.',
 see:{w:400,h:400,f:[
  ['The x-axis.',`<line x1="20" y1="200" x2="380" y2="200" stroke="${ink}" stroke-width="2" marker-end="url(#ah)"/>`+lbl(370,220,'X')+lbl(30,220,'X\'')],
  ['The y-axis.',`<line x1="200" y1="380" x2="200" y2="20" stroke="${ink}" stroke-width="2" marker-end="url(#ah)"/>`+lbl(215,30,'Y')+lbl(215,380,'Y\'')],
  ['Origin O.',`<circle cx="200" cy="200" r="6" fill="${OR}"/>`+lbl(165,225,'O (0, 0)','fill="'+OR+'" font-weight="700"')+lbl(300,190,'+')+lbl(100,190,'−')+lbl(210,110,'+')+lbl(210,300,'−')]]},
 seeNote:'Two perpendicular number lines.',
 do:{title:'Floor axes',mat:'Chalk, string',steps:['Draw two perpendicular lines on the floor.','Mark units; stand on points called out.'],obs:'Living coordinate plane.',why:'Axes.',lab:false},
 memo:'"x across, y up; they meet at O."',
 miscon:['"The y-axis is horizontal." The y-axis is vertical.'],
 terms:['x-axis','y-axis','Origin','Cartesian plane'],
 q:{q:'Coordinates of the origin:',o:['(1, 1)','(0, 0)','(0, 1)','(1, 0)'],a:1,why:'Where axes cross.'},
 exam:'Definitions: 1 mark.'},

{id:'q3',num:'3.3',title:'Quadrants and signs',
 intro:'Is the point (−3, 4) to the left or right of the y-axis? Above or below the x-axis?',
 obj:'Identify the four quadrants and the signs of coordinates in each.',
 prior:'3.2.',
 simple:'The axes divide the plane into four quadrants, numbered anticlockwise from the top right: Quadrant I (+, +), Quadrant II (−, +), Quadrant III (−, −), Quadrant IV (+, −).',
 detail:'(−3, 4) has negative x and positive y, so it is in Quadrant II. (5, −2) is in Quadrant IV. Points on the axes do not belong to any quadrant. Changing the sign of the y-coordinate reflects a point in the x-axis; changing the sign of x reflects it in the y-axis.',
 real:'Maps use similar ideas: north-east, north-west, south-west, south-east.',
 apply:'In which quadrant or on which axis do (−2, 4), (3, −1), (−1, 0), (1, 2), (−3, −5) lie?',
 see:{w:400,h:400,f:[
  ['Axes.',grid(200,200,20,9,false)],
  ['Four quadrants.',grid(200,200,20,9,true)],
  ['Examples.',pt(200,200,20,-3,4,OR,'(−3, 4)')+pt(200,200,20,5,-2,BL,'(5, −2)')]]},
 seeNote:'Signs tell the quadrant.',
 do:{title:'Quadrant corners',mat:'Floor axes from 3.2',steps:['Call out coordinates; students run to the right quadrant.'],obs:'Signs decide.',why:'Quadrants.',lab:false},
 memo:'"All plus in I; then go anticlockwise: (−,+), (−,−), (+,−)."',
 miscon:['"Quadrants are numbered clockwise." They go anticlockwise from the top right.'],
 terms:['Quadrant I–IV','Sign convention'],
 q:{q:'(−4, −6) lies in quadrant:',o:['I','II','III','IV'],a:2,why:'Both negative.'},
 exam:'Identify quadrants: 1 mark.'},

{id:'q4',num:'3.4',title:'Abscissa and ordinate',
 intro:'In the pair (4, 3), which number is the "across" and which is the "up"?',
 obj:'Read and write coordinates of points as ordered pairs.',
 prior:'3.3.',
 simple:'The coordinates of a point P are written (x, y). x is the x-coordinate or abscissa — the perpendicular distance of P from the y-axis, measured along the x-axis. y is the y-coordinate or ordinate — the perpendicular distance from the x-axis. Order matters: (4, 3) and (3, 4) are different points.',
 detail:'To read the coordinates of a point, drop perpendiculars to both axes and read off the numbers. (x, y) is called an ordered pair. If x ≠ y, then (x, y) ≠ (y, x).',
 real:'Spreadsheet cells (B4) and chess squares (e4) use ordered "column, row" pairs too.',
 apply:'Plot (4, 3) and (3, 4). Are they the same point?',
 see:{w:400,h:400,f:[
  ['A point P.',grid(200,200,30,6,false)+pt(200,200,30,4,3,OR,'P(4, 3)')],
  ['Distance from the y-axis = 4.',`<line x1="200" y1="110" x2="320" y2="110" stroke="${BL}" stroke-width="2" stroke-dasharray="5 4"/>`+lbl(260,100,'abscissa 4','fill="'+BL+'"')],
  ['Distance from the x-axis = 3.',`<line x1="320" y1="200" x2="320" y2="110" stroke="${GN}" stroke-width="2" stroke-dasharray="5 4"/>`+lbl(355,160,'ordinate 3','fill="'+GN+'"')]]},
 seeNote:'Across first, then up.',
 do:{title:'Mystery picture',mat:'Graph paper',steps:['Plot a list of points in order and join them.','See the picture.'],obs:'A shape appears.',why:'Ordered pairs.',lab:false},
 memo:'"Walk before you climb: x then y."',
 miscon:['"(3, 4) and (4, 3) are the same." Order matters.'],
 terms:['Abscissa (x-coordinate)','Ordinate (y-coordinate)','Ordered pair'],
 q:{q:'The abscissa of (−5, 2) is:',o:['2','−5','5','−2'],a:1,why:'First number.'},
 exam:'Read coordinates from a graph: 2 marks.'},

{id:'q5',num:'3.5',title:'Plotting points',
 intro:'Place the point (−2, −3) on graph paper. Where do you start?',
 obj:'Plot given points on the Cartesian plane.',
 prior:'3.4.',
 simple:'To plot (x, y): start at the origin, move x units along the x-axis (right if positive, left if negative), then y units parallel to the y-axis (up if positive, down if negative). Mark the point and label it.',
 detail:'Choose a suitable scale so that all points fit. Plotting several points and joining them can give shapes: (0, 0), (4, 0), (4, 3), (0, 3) make a rectangle. Points with the same y lie on a horizontal line; points with the same x lie on a vertical line.',
 real:'Ships and aircraft are plotted on charts using coordinates.',
 apply:'Plot A(−2, 3), B(2, 3), C(2, −1), D(−2, −1). What shape is ABCD? Find its side lengths.',
 see:{w:400,h:400,f:[
  ['Start at O.',grid(200,200,30,6,false)+`<circle cx="200" cy="200" r="5" fill="${PU}"/>`],
  ['Move 2 left.',`<line x1="200" y1="200" x2="140" y2="200" stroke="${BL}" stroke-width="3" marker-end="url(#ah)"/>`],
  ['Then 3 down.',`<line x1="140" y1="200" x2="140" y2="290" stroke="${GN}" stroke-width="3" marker-end="url(#ah)"/>`+pt(200,200,30,-2,-3,OR,'(−2, −3)')]]},
 seeNote:'Along, then up or down.',
 do:{title:'Draw a star',mat:'Graph paper',steps:['Plot (0, 4), (1, 1), (4, 1), (2, −1), (3, −4), (0, −2), (−3, −4), (−2, −1), (−4, 1), (−1, 1).','Join in order.'],obs:'A star.',why:'Plotting.',lab:true},
 memo:'"Across the corridor, then up the stairs."',
 miscon:['"Plot y first." Always move along x first.'],
 terms:['Plotting','Scale','Graph paper'],
 q:{q:'To plot (−2, 5), from O move:',o:['2 right, 5 up','2 left, 5 up','5 left, 2 up','2 left, 5 down'],a:1,why:'x negative, y positive.'},
 exam:'Plot points; identify shape: 2–3 marks.'},

{id:'q6',num:'3.6',title:'Points on the axes',
 intro:'Where is a point whose y-coordinate is 0?',
 obj:'Recognise the form of coordinates of points on the axes.',
 prior:'3.4, 3.5.',
 simple:'A point on the x-axis has y = 0: (x, 0), such as (5, 0) or (−3, 0). A point on the y-axis has x = 0: (0, y), such as (0, 4) or (0, −2). The origin (0, 0) is on both axes. Points on the axes do not lie in any quadrant.',
 detail:'Distance of (x, y) from the y-axis is |x|, from the x-axis is |y|. So (−6, 0) is 6 units from the origin along the negative x-axis. The point where a line meets the x-axis is found by putting y = 0.',
 real:'Sea level is like the x-axis for heights: 0 m altitude.',
 apply:'Write the coordinates of a point on the y-axis 5 units below the origin, and a point on the x-axis 3 units to its left.',
 see:{w:400,h:400,f:[
  ['Points on the x-axis.',grid(200,190,28,6,false)+pt(200,190,28,4,0,BL,'(4, 0)')+pt(200,190,28,-3,0,BL,'(−3, 0)')],
  ['Points on the y-axis.',pt(200,190,28,0,5,GN,'(0, 5)')+pt(200,190,28,0,-2,GN,'(0, −2)')],
  ['The origin is on both.',pt(200,190,28,0,0,OR,'')+lbl(200,392,'x-axis: y = 0 · y-axis: x = 0','font-weight="700"')]]},
 seeNote:'Zero in one coordinate.',
 do:{title:'Axis hop',mat:'Floor axes',steps:['Stand on points called with one zero.','Notice you are always on an axis.'],obs:'Zero means on an axis.',why:'Axis points.',lab:false},
 memo:'"y = 0 → on x-axis; x = 0 → on y-axis."',
 miscon:['"(0, 5) is on the x-axis." x = 0 means it is on the y-axis.'],
 terms:['Points on axes','Distance from axes'],
 q:{q:'(0, −7) lies on the:',o:['x-axis','y-axis','quadrant III','quadrant IV'],a:1,why:'x = 0.'},
 exam:'Points on axes: 1 mark.'}
];

const CARDS=[['Cartesian plane','x-axis and y-axis at right angles.'],['Origin','(0, 0).'],['Abscissa','x-coordinate; distance from y-axis.'],['Ordinate','y-coordinate; distance from x-axis.'],['Ordered pair','(x, y) ≠ (y, x).'],['Quadrant I','(+, +)'],['Quadrant II','(−, +)'],['Quadrant III','(−, −)'],['Quadrant IV','(+, −)'],['On x-axis','(x, 0).'],['On y-axis','(0, y).']];

const Q=[
 {lv:1,q:'The y-coordinate is also called the:',o:['abscissa','ordinate','origin','quadrant'],a:1,w:'Definition.'},
 {lv:1,q:'(3, 5) lies in quadrant:',o:['I','II','III','IV'],a:0,w:'(+, +).'},
 {lv:1,q:'A point on the x-axis has:',o:['x = 0','y = 0','x = y','both non-zero'],a:1,w:'(x, 0).'},
 {lv:2,q:'(−2, 7) lies in quadrant:',o:['I','II','III','IV'],a:1,w:'(−, +).'},
 {lv:2,q:'Distance of (−6, 4) from the y-axis:',o:['4','6','−6','10'],a:1,w:'|x|.'},
 {lv:2,q:'Which point is on the y-axis?',o:['(2, 0)','(0, −3)','(1, 1)','(−1, 2)'],a:1,w:'x = 0.'},
 {lv:3,q:'If x < 0 and y < 0, the point is in quadrant:',o:['I','II','III','IV'],a:2,w:'(−, −).'},
 {lv:3,q:'Points (2, 1), (2, 4), (2, −3) lie on a line that is:',o:['horizontal','vertical','the x-axis','diagonal'],a:1,w:'Same x.'},
 {lv:4,q:'A(0, 0), B(4, 0), C(4, 3), D(0, 3). ABCD is a:',o:['square','rectangle','rhombus','trapezium'],a:1,w:'4 by 3.'},
 {lv:4,q:'Reflection of (3, −5) in the x-axis:',o:['(−3, −5)','(3, 5)','(−3, 5)','(5, 3)'],a:1,w:'Change sign of y.'},
 {lv:5,open:true,m:3,q:'Plot A(−3, 2), B(1, 2), C(1, −2). Find the fourth point D so that ABCD is a square.',ans:['Plot correctly (1)','AB = 4, BC = 4 (1)','D = (−3, −2) (1)']},
 {lv:5,open:true,m:5,q:'Without plotting, state the quadrant or axis of: (−4, 5), (3, −2), (0, −6), (−1, −8), (7, 0). Explain the rule you used.',ans:['II (1)','IV (1)','negative y-axis (1)','III; positive x-axis (1)','Rule: signs of x and y / zero coordinate means on an axis (1)']}
];

const ONEMIN=['Two numbers locate a point in a plane.','Axes, origin, Cartesian plane.','Quadrants and signs.','Abscissa and ordinate.','Plotting: along, then up.','Points on axes have a zero.'];
const KEYS=[['coordinates',/coordinate|cartesian/i],['axes',/axis|axes|origin/i],['quadrant',/quadrant/i],['abscissa',/abscissa|ordinate/i],['plot',/plot/i],['on axes',/on the (x|y)-axis|\(x, 0\)|\(0, y\)/i]];

/* ---------- lab ---------- */
const X0=200,Y0=200,U=20,N=9;let target=null,read=null,sel=null,streak=0,wired=false;
const quad=(x,y)=>x===0&&y===0?'the origin':x===0?'the y-axis':y===0?'the x-axis':x>0&&y>0?'Quadrant I':x<0&&y>0?'Quadrant II':x<0?'Quadrant III':'Quadrant IV';
function draw(msg){let s=grid(X0,Y0,U,N,true);for(let x=-N;x<=N;x++)for(let y=-N;y<=N;y++)s+=`<circle data-cg="${x},${y}" cx="${X0+x*U}" cy="${Y0-y*U}" r="8" fill="transparent" style="cursor:pointer"/>`;
 if(sel)s+=`<line x1="${X0+sel[0]*U}" y1="${Y0-sel[1]*U}" x2="${X0+sel[0]*U}" y2="${Y0}" stroke="${GN}" stroke-dasharray="4 3" stroke-width="2" pointer-events="none"/><line x1="${X0+sel[0]*U}" y1="${Y0-sel[1]*U}" x2="${X0}" y2="${Y0-sel[1]*U}" stroke="${BL}" stroke-dasharray="4 3" stroke-width="2" pointer-events="none"/>`+`<circle cx="${X0+sel[0]*U}" cy="${Y0-sel[1]*U}" r="6" fill="${OR}" pointer-events="none"/>`;
 if(read)s+=`<circle cx="${X0+read[0]*U}" cy="${Y0-read[1]*U}" r="8" fill="${RD}" pointer-events="none"><animate attributeName="r" values="6;10;6" dur="1.2s" repeatCount="indefinite"/></circle>`;
 $('#cgSvg').innerHTML=s;if(msg)$('#cgOut').innerHTML=msg}
const rnd=()=>{let x,y;do{x=Math.floor(Math.random()*17)-8;y=Math.floor(Math.random()*17)-8}while(x===0&&y===0);return [x,y]};
function labShow(){draw(target||read?null:'<p>Tap any grid point to see its coordinates.</p>')}
function labInit(){if(wired)return;wired=true;document.addEventListener('click',e=>{const c=e.target.closest&&e.target.closest('[data-cg]');if(c){const [x,y]=c.dataset.cg.split(',').map(Number);sel=[x,y];
  if(target){const ok=x===target[0]&&y===target[1];streak=ok?streak+1:0;const msg=ok?`<p class="fb ok">Correct! (${x}, ${y}) is in ${quad(x,y)}. Streak: ${streak} 🔥</p>`:`<p class="fb no">You tapped (${x}, ${y}). Target was (${target[0]}, ${target[1]}): move ${Math.abs(target[0])} ${target[0]<0?'left':'right'}, then ${Math.abs(target[1])} ${target[1]<0?'down':'up'}.</p>`;if(!ok)sel=target;target=null;draw(msg);return}
  draw(`<p>Point <b>(${x}, ${y})</b> — abscissa ${x}, ordinate ${y}.</p><p>It lies in <b>${quad(x,y)}</b>. Distance from the y-axis: ${Math.abs(x)}; from the x-axis: ${Math.abs(y)}.</p>`);return}
 const b=e.target.closest&&e.target.closest('[data-cr]');if(b&&read){const ok=b.dataset.cr===read.join(',');streak=ok?streak+1:0;$('#cgOpts').style.display='none';const r=read;read=null;sel=r;draw(ok?`<p class="fb ok">Correct! It is (${r[0]}, ${r[1]}). Streak: ${streak} 🔥</p>`:`<p class="fb no">Not quite — it is (${r[0]}, ${r[1]}). Read across (x) first, then up/down (y).</p>`)}})}
function labClick(b){if(b.id==='cgC'){target=rnd();read=null;sel=null;$('#cgOpts').style.display='none';draw(`<p><b>Plot (${target[0]}, ${target[1]})</b> — tap that grid point.</p>`);return true}
 if(b.id==='cgR'){read=rnd();target=null;sel=null;const [x,y]=read;const opts=[[x,y],[y,x],[-x,y],[x,-y]].filter((v,i,a)=>a.findIndex(w=>w[0]===v[0]&&w[1]===v[1])===i).sort(()=>Math.random()-.5);$('#cgOpts').innerHTML=opts.map(o=>`<button class="btn" type="button" data-cr="${o.join(',')}">(${o[0]}, ${o[1]})</button>`).join(' ');$('#cgOpts').style.display='';draw('<p><b>Read it:</b> what are the coordinates of the flashing point?</p>');return true}return false}
function labChange(){return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
