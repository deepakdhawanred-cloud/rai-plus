/* Rai Plus content pack: Class 9 Science, Chapter 7 – Motion (rationalised NCERT). Bilingual: Hindi terms alongside. */
RP.register({key:'9sci07',cls:'9',subject:'Science',ch:'7',title:"Motion",color:'#1f5f8b',
crumb:"HBSE Class 9 Science · गति · Taught in September",h1:"Chapter 7: Motion · गति",sub:"Distance and displacement, speed and velocity, acceleration, distance–time and velocity–time graphs, the three equations of motion and uniform circular motion.",heroLabel:"A car speeding up along a road",labName:'Motion graph lab',
theme:"\n:root{--g:light-dark(#1f5f8b,#8cc4ea);--g2:light-dark(#eaf3fa,#081520);--line:light-dark(#cde1f0,#22394b);--bg:light-dark(#ffffff,#08111a);--card:light-dark(#ffffff,#0e1822);\n--ink:light-dark(#0f2233,#e2eef7);--mute:light-dark(#4a6075,#aac0d2);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#174a6d}\n",
labHTML:`  <h2>Motion graph lab · गति आलेख प्रयोगशाला</h2>
  <p>Set the starting velocity <i>u</i> and acceleration <i>a</i> of the car, then press Go. The distance–time and velocity–time graphs draw themselves, and the readings check the equations of motion. Try a = 0 (uniform motion) and a negative a (braking).</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="mgSvg" viewBox="0 0 520 340" role="img" aria-label="Motion graphs" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label><span>Initial velocity u: <b id="mgUv"></b> m/s</span><input type="range" class="mgS" id="mgU" min="0" max="20" value="5"></label></div>
  <div class="ctrl"><label><span>Acceleration a: <b id="mgAv"></b> m/s²</span><input type="range" class="mgS" id="mgA" min="-4" max="4" step="0.5" value="1"></label></div>
  <div class="ctrl"><button class="btn p" id="mgGo">Go</button> <button class="btn" id="mgReset">Reset</button></div>
  <div class="box y" id="mgOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#1f5f8b',LABNAME='Motion graph lab',MIND_CENTER='Motion · गति';
const BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',RD='#c0392b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const axes=(x,y,w,h,xl,yl)=>`<line x1="${x}" y1="${y+h}" x2="${x+w}" y2="${y+h}" stroke="${ink}"/><line x1="${x}" y1="${y+h}" x2="${x}" y2="${y}" stroke="${ink}"/>`+T(x+w-10,y+h+16,xl,'font-size="11"')+T(x+4,y-6,yl,'font-size="11"');
const car=(x,y,c=RD)=>`<rect x="${x-22}" y="${y-14}" width="44" height="14" rx="4" fill="${c}"/><rect x="${x-12}" y="${y-24}" width="22" height="11" rx="3" fill="${c}" opacity=".8"/><circle cx="${x-12}" cy="${y}" r="5" fill="${ink}"/><circle cx="${x+12}" cy="${y}" r="5" fill="${ink}"/>`;
function heroDraw(){return `<line x1="20" y1="120" x2="330" y2="120" stroke="#fff" stroke-width="2" stroke-dasharray="10 8"/>`+[40,90,160,250].map((x,i)=>`<g opacity="${.25+i*.25}"><rect x="${x}" y="96" width="44" height="16" rx="4" fill="#fff"/><circle cx="${x+10}" cy="114" r="5" fill="#fff"/><circle cx="${x+34}" cy="114" r="5" fill="#fff"/></g>`).join('')}
const HERO=heroDraw;
const MIND=[['Distance & displacement',100,50],['Speed & velocity',420,50],['Acceleration · त्वरण',90,150],['Graphs · आलेख',430,150],['Equations of motion',110,250],['Circular motion',410,250]];

const C=[
{id:'g1',num:'7.1',title:'Distance and displacement · दूरी और विस्थापन',
 intro:'You walk from home to school (2 km) and back. How far did you travel? How far are you from where you started?',
 obj:'Distinguish distance from displacement and uniform from non-uniform motion.',
 prior:'Class 7: speed; Class 8: force.',
 simple:'An object is in motion if its position changes with time with respect to a reference point (origin). Distance (दूरी) is the total length of the path travelled — it has only magnitude (scalar · अदिश). Displacement (विस्थापन) is the shortest distance from the initial to the final position, in a given direction — it has magnitude and direction (vector · सदिश). Home to school and back: distance 4 km, displacement 0.',
 detail:'Displacement can be zero even when distance is not; its magnitude is never more than the distance. Uniform motion (एकसमान गति): equal distances in equal intervals of time, however small. Non-uniform motion: unequal distances in equal intervals — a car in city traffic. SI unit of both distance and displacement is the metre (m).',
 real:'A runner completing one lap of a 400 m track has run 400 m but has zero displacement.',
 apply:'An athlete runs around a circular track of radius 7 m once. Find the distance and displacement.',
 see:{w:520,h:200,f:[
  ['Home to school.',`<circle cx="80" cy="100" r="8" fill="${BL}"/><circle cx="440" cy="100" r="8" fill="${OR}"/>`+lbl(80,130,'home')+lbl(440,130,'school')],
  ['Go and come back.',`<path d="M88 90 Q260 40 432 90" fill="none" stroke="${OR}" stroke-width="2.5" marker-end="url(#ah)"/><path d="M432 112 Q260 160 88 112" fill="none" stroke="${OR}" stroke-width="2.5" marker-end="url(#ah)"/>`],
  ['Distance 4 km; displacement 0.',lbl(260,185,'distance = 2 + 2 = 4 km · displacement = 0','font-size="15" font-weight="700"')]]},
 seeNote:'Path length vs straight-line change.',
 do:{title:'Classroom walk',mat:'Measuring tape, chalk',steps:['Walk 4 m east, then 3 m north.','Measure the straight line from start to end.'],obs:'Distance 7 m; displacement 5 m.',why:'Shortest path.',lab:false},
 memo:'"Distance counts every step; displacement only cares where you end."',
 miscon:['"Displacement is always equal to distance." Only in straight-line motion without turning back.'],
 terms:['Distance · दूरी','Displacement · विस्थापन','Scalar · अदिश','Vector · सदिश','Uniform motion · एकसमान गति'],
 q:{q:'One full lap of a circular track: displacement is:',o:['2πr','πr','zero','r'],a:2,why:'Same start and end.'},
 exam:'Distance vs displacement numericals: 2 marks.'},

{id:'g2',num:'7.2',title:'Speed and velocity · चाल और वेग',
 intro:'A bus speedometer shows 60 km/h. Does that tell you where the bus is going?',
 obj:'Define speed and velocity and calculate averages.',
 prior:'7.1.',
 simple:'Speed (चाल) = distance ÷ time. Velocity (वेग) = displacement ÷ time — speed in a given direction. SI unit: m/s. Average speed = total distance ÷ total time. Average velocity = total displacement ÷ total time; if velocity changes uniformly, average velocity = (u + v) ÷ 2.',
 detail:'1 km/h = 5/18 m/s (so 72 km/h = 20 m/s). Velocity changes if speed changes, direction changes, or both. The speedometer shows instantaneous speed; the odometer shows distance travelled. Average velocity can be zero for a round trip even though average speed is not.',
 real:'Google Maps estimates travel time using average speeds along each road.',
 apply:'A car covers 150 km in 2.5 hours. Find its average speed in km/h and m/s.',
 see:{w:520,h:200,f:[
  ['Speed: distance ÷ time.',lbl(260,50,'speed = distance ÷ time','font-size="17"')],
  ['Velocity: displacement ÷ time.',lbl(260,100,'velocity = displacement ÷ time (with direction)','font-size="16" fill="'+BL+'"')],
  ['Convert units.',lbl(260,150,'km/h × 5/18 = m/s · 72 km/h = 20 m/s','font-size="15" fill="'+OR+'"')]]},
 seeNote:'Velocity = speed + direction.',
 do:{title:'Walking speed',mat:'Stopwatch, tape',steps:['Mark 20 m; time yourself walking it.','Calculate your speed.'],obs:'About 1–1.5 m/s.',why:'Speed = d/t.',lab:false},
 memo:'"Speed is how fast; velocity is how fast AND which way."',
 miscon:['"Average speed = average of two speeds." Use total distance ÷ total time.'],
 terms:['Speed · चाल','Velocity · वेग','Average speed · औसत चाल','m/s'],
 q:{q:'54 km/h in m/s is:',o:['15 m/s','54 m/s','194.4 m/s','5.4 m/s'],a:0,why:'54 × 5/18.'},
 exam:'Average speed and velocity numericals: 2–3 marks.'},

{id:'g3',num:'7.3',title:'Acceleration · त्वरण',
 intro:'A scooter goes from 0 to 36 km/h in 5 s. A truck takes 20 s. How do we compare them?',
 obj:'Define acceleration and calculate it.',
 prior:'7.2.',
 simple:'Acceleration (त्वरण) is the rate of change of velocity: a = (v − u) ÷ t, where u is initial velocity, v final velocity and t time. SI unit: m/s². If velocity increases, a is positive; if it decreases, a is negative — called retardation or deceleration (मंदन).',
 detail:'Uniform acceleration: velocity changes by equal amounts in equal intervals (a freely falling body). Non-uniform acceleration: unequal changes (a car in traffic). Scooter: 36 km/h = 10 m/s; a = (10 − 0) ÷ 5 = 2 m/s². Truck: a = 10 ÷ 20 = 0.5 m/s². Acceleration is a vector.',
 real:'Car brochures quote "0–100 km/h in 10 s" — a measure of acceleration.',
 apply:'A train slows from 72 km/h to rest in 20 s. Find its acceleration.',
 see:{w:520,h:200,f:[
  ['Velocity changes.',car(80,120)+car(260,120,OR)+car(440,120,PU)+lbl(80,150,'0 m/s')+lbl(260,150,'5 m/s')+lbl(440,150,'10 m/s')],
  ['Equal changes in equal times.',lbl(170,90,'+5 in 2.5 s')+lbl(350,90,'+5 in 2.5 s')],
  ['a = (v − u) ÷ t.',lbl(260,190,'a = (10 − 0) ÷ 5 = 2 m/s²','font-size="16" font-weight="700" fill="'+BL+'"')]]},
 seeNote:'Rate of change of velocity.',
 do:{title:'Ball down a ramp',mat:'Plank, ball, stopwatch, chalk',steps:['Mark positions every second as the ball rolls.','Compare gaps.'],obs:'Gaps grow.',why:'Acceleration.',lab:true},
 memo:'"Acceleration: how fast velocity changes."',
 miscon:['"Negative acceleration means moving backwards." It means slowing down in the direction of motion.'],
 terms:['Acceleration · त्वरण','Retardation · मंदन','m/s²','Uniform acceleration'],
 q:{q:'u = 0, v = 20 m/s, t = 4 s. a =',o:['80 m/s²','5 m/s²','0.2 m/s²','24 m/s²'],a:1,why:'20 ÷ 4.'},
 exam:'Acceleration numericals: 2 marks.'},

{id:'g4',num:'7.4',title:'Graphs of motion · गति के आलेख',
 intro:'Can a picture tell you whether a cyclist was resting, cruising or speeding up?',
 obj:'Draw and interpret distance–time and velocity–time graphs.',
 prior:'7.2, 7.3; line graphs.',
 simple:'Distance–time graph: a straight sloping line means uniform speed (slope = speed); a horizontal line means the object is at rest; a curve means non-uniform speed. Velocity–time graph: a horizontal line means uniform velocity; a straight sloping line means uniform acceleration (slope = acceleration).',
 detail:'The area under a velocity–time graph gives the displacement (distance for straight-line motion). For uniform velocity 10 m/s for 5 s: area = 50 m. For uniform acceleration from 0 to 10 m/s in 4 s: triangle area = ½ × 4 × 10 = 20 m. A downward slope in a v–t graph is deceleration.',
 real:'Railway engineers use v–t graphs to plan braking distances for trains.',
 apply:'Draw the v–t graph for a car accelerating uniformly from 0 to 20 m/s in 10 s; find the distance covered.',
 see:{w:520,h:230,f:[
  ['Distance–time.',axes(40,30,190,150,'t','d')+`<line x1="40" y1="180" x2="220" y2="50" stroke="${BL}" stroke-width="3"/><line x1="40" y1="180" x2="220" y2="180" stroke="${GR}" stroke-width="3" stroke-dasharray="6 4"/>`+lbl(150,210,'slope = speed · flat = rest')],
  ['Velocity–time.',axes(290,30,190,150,'t','v')+`<line x1="290" y1="180" x2="460" y2="60" stroke="${OR}" stroke-width="3"/>`],
  ['Area = displacement.',`<polygon points="290,180 460,180 460,60" fill="${OR}" fill-opacity=".2"/>`+lbl(400,210,'slope = a · area = s','fill="'+OR+'"')]]},
 seeNote:'Slope and area tell the story.',
 do:{title:'Bus journey graph',mat:'Graph paper, a bus timetable',steps:['Plot distance vs time for stops.','Mark the flat parts.'],obs:'Flat = stopped at a station.',why:'d–t graph.',lab:true},
 memo:'"d–t slope = speed; v–t slope = acceleration; v–t area = distance."',
 miscon:['"A horizontal v–t line means the object is at rest." It means constant velocity; rest is v = 0.'],
 terms:['Distance–time graph','Velocity–time graph','Slope · ढाल','Area under graph'],
 q:{q:'A horizontal line on a distance–time graph shows:',o:['uniform speed','rest','acceleration','deceleration'],a:1,why:'Distance not changing.'},
 exam:'Interpret graphs; area under v–t: 3 marks.'},

{id:'g5',num:'7.5',title:'Equations of motion · गति के समीकरण',
 intro:'A bus brakes at 3 m/s². Will it stop before the crossing 40 m ahead?',
 obj:'Derive and use the three equations of uniformly accelerated motion.',
 prior:'7.3, 7.4.',
 simple:'For uniform acceleration in a straight line: (1) v = u + at (velocity–time relation); (2) s = ut + ½at² (position–time relation); (3) 2as = v² − u² (position–velocity relation). Here s is displacement.',
 detail:'Graphical derivation from a v–t graph: slope gives (1); area of trapezium (rectangle ut + triangle ½at²) gives (2); area = ½(u + v)t combined with t = (v − u)/a gives (3). Braking: u = 20 m/s, a = −5 m/s², stop v = 0 → s = (0 − 400)/(2 × −5) = 40 m. Use consistent SI units.',
 real:'Traffic police use stopping-distance formulas to reconstruct accidents.',
 apply:'A car starts from rest and accelerates at 2 m/s² for 10 s. Find v and s.',
 see:{w:520,h:220,f:[
  ['v = u + at.',lbl(260,50,'① v = u + at','font-size="20" font-weight="700" fill="'+BL+'"')],
  ['s = ut + ½at².',lbl(260,105,'② s = ut + ½at²','font-size="20" font-weight="700" fill="'+OR+'"')],
  ['2as = v² − u².',lbl(260,160,'③ 2as = v² − u²','font-size="20" font-weight="700" fill="'+GN+'"')+lbl(260,200,'uniform acceleration, straight line','font-size="12"')]]},
 seeNote:'Three tools, one situation.',
 do:{title:'Pick the equation',mat:'Problem cards',steps:['List known quantities (u, v, a, s, t).','Choose the equation missing the unknown you don\'t need.'],obs:'Fast solving.',why:'Strategy.',lab:false},
 memo:'"Missing s? use ①. Missing v? use ②. Missing t? use ③."',
 miscon:['"Use these equations for any motion." Only for uniform acceleration.'],
 terms:['Equations of motion · गति के समीकरण','Initial velocity u','Final velocity v','Displacement s'],
 q:{q:'u = 5 m/s, a = 2 m/s², t = 3 s. v =',o:['11 m/s','6 m/s','10 m/s','15 m/s'],a:0,why:'5 + 6.'},
 exam:'Derivations and numericals: 3–5 marks.'},

{id:'g6',num:'7.6',title:'Uniform circular motion · एकसमान वृत्तीय गति',
 intro:'A stone whirled on a string moves at steady speed. Is it accelerating?',
 obj:'Explain uniform circular motion and calculate speed in a circle.',
 prior:'7.2, 7.3.',
 simple:'When an object moves in a circular path at constant speed, its direction keeps changing, so its velocity changes — it is accelerated. This is uniform circular motion (एकसमान वृत्तीय गति). Speed v = 2πr ÷ t, where r is the radius and t the time for one round.',
 detail:'At every point, the velocity is along the tangent (स्पर्श रेखा). If the string breaks, the stone flies off along the tangent at that point. Examples: the Moon around the Earth, satellites, the tip of a clock hand, an athlete on a circular track, a merry-go-round.',
 real:'Sparks from a grinding wheel fly off along tangents.',
 apply:'A satellite moves in a circular orbit of radius 42,250 km and takes 24 h. Find its speed.',
 see:{w:520,h:230,f:[
  ['A circular path.',`<circle cx="260" cy="115" r="80" fill="none" stroke="${GR}" stroke-width="2" stroke-dasharray="6 5"/><circle cx="260" cy="115" r="4" fill="${ink}"/>`],
  ['Velocity along the tangent.',[0,1.6,3.3,4.7].map(a=>{const x=260+80*Math.cos(a),y=115+80*Math.sin(a);return `<circle cx="${x}" cy="${y}" r="7" fill="${RD}"/><line x1="${x}" y1="${y}" x2="${x-45*Math.sin(a)}" y2="${y+45*Math.cos(a)}" stroke="${BL}" stroke-width="2.5" marker-end="url(#ah)"/>`}).join('')],
  ['v = 2πr / t.',lbl(260,222,'direction changes → accelerated · v = 2πr ÷ t','font-weight="700"')]]},
 seeNote:'Same speed, changing direction.',
 do:{title:'Stone and string',mat:'Small ball on a string (outdoors, carefully)',steps:['Whirl gently; release the string.','Note the direction it flies.'],obs:'Along the tangent.',why:'Velocity is tangential.',lab:false},
 memo:'"Steady speed, turning direction — still accelerating."',
 miscon:['"Constant speed means no acceleration." In a circle, the direction changes, so there is acceleration.'],
 terms:['Uniform circular motion · एकसमान वृत्तीय गति','Tangent · स्पर्श रेखा','Radius · त्रिज्या'],
 q:{q:'In uniform circular motion, what changes?',o:['speed','direction of velocity','radius','nothing'],a:1,why:'Direction keeps changing.'},
 exam:'Why circular motion is accelerated; v = 2πr/t: 2–3 marks.'}
];

const CARDS=[['Distance · दूरी','Total path length; scalar.'],['Displacement · विस्थापन','Shortest start-to-end; vector.'],['Speed','Distance ÷ time.'],['Velocity · वेग','Displacement ÷ time; has direction.'],['km/h → m/s','× 5/18.'],['Acceleration · त्वरण','a = (v − u) ÷ t; m/s².'],['Retardation','Negative acceleration (slowing).'],['d–t graph','Slope = speed; flat = rest.'],['v–t graph','Slope = acceleration; area = displacement.'],['Equation 1','v = u + at'],['Equation 2','s = ut + ½at²'],['Equation 3','2as = v² − u²'],['Circular motion','v = 2πr ÷ t; accelerated.']];

const Q=[
 {lv:1,q:'SI unit of acceleration:',o:['m/s','m/s²','km/h','m'],a:1,w:'Change of velocity per second.'},
 {lv:1,q:'Which is a vector?',o:['distance','speed','displacement','time'],a:2,w:'Has direction.'},
 {lv:1,q:'Slope of a distance–time graph gives:',o:['acceleration','speed','displacement','force'],a:1,w:'d/t.'},
 {lv:2,q:'72 km/h =',o:['20 m/s','72 m/s','7.2 m/s','259 m/s'],a:0,w:'× 5/18.'},
 {lv:2,q:'Area under a v–t graph gives:',o:['acceleration','displacement','speed','time'],a:1,w:'v × t.'},
 {lv:2,q:'A body moving in a circle at constant speed has:',o:['no acceleration','constant velocity','acceleration','zero speed'],a:2,w:'Direction changes.'},
 {lv:3,q:'Starts from rest, a = 4 m/s², t = 5 s. Distance:',o:['20 m','50 m','100 m','40 m'],a:1,w:'½ × 4 × 25.'},
 {lv:3,q:'A car slows from 20 m/s to 0 in 4 s. a =',o:['5 m/s²','−5 m/s²','80 m/s²','−80 m/s²'],a:1,w:'(0 − 20) ÷ 4.'},
 {lv:4,q:'u = 10 m/s, a = −2 m/s². Distance before stopping:',o:['25 m','50 m','100 m','20 m'],a:0,w:'0 − 100 = 2(−2)s.'},
 {lv:4,q:'Radius 7 m track, one round in 22 s. Speed:',o:['1 m/s','2 m/s','4 m/s','0.5 m/s'],a:1,w:'2π(7) = 44 m ÷ 22.'},
 {lv:5,open:true,m:3,q:'Derive v = u + at using a velocity–time graph.',ans:['Draw v–t graph with u at t = 0 and v at t (1)','Slope = (v − u)/t = a (1)','Rearrange: v = u + at (1)']},
 {lv:5,open:true,m:5,q:'A bus moving at 36 km/h applies brakes and stops in 5 s. Find (a) its retardation and (b) the distance covered while braking. Draw its v–t graph.',ans:['u = 10 m/s, v = 0 (1)','a = −2 m/s² (1)','s = ut + ½at² = 50 − 25 = 25 m (1)','v–t graph: straight line from 10 to 0 over 5 s (1)','Area check = ½ × 5 × 10 = 25 m (1)']}
];

const ONEMIN=['Distance vs displacement.','Speed vs velocity; × 5/18.','Acceleration a = (v − u)/t.','Graphs: slope and area.','v = u + at; s = ut + ½at²; 2as = v² − u².','Uniform circular motion: v = 2πr/t.'];
const KEYS=[['displacement',/displacement|विस्थापन|distance/i],['velocity',/velocity|speed|वेग|चाल/i],['acceleration',/accelerat|त्वरण/i],['graph',/graph|slope|आलेख/i],['equations',/equation|v = u|समीकरण/i],['circular',/circular|वृत्तीय/i]];

/* ---------- lab ---------- */
const TMAX=10;let U=5,A=1,t=0,run=false,last=0,wired=false,looping=false;
const vel=tt=>Math.max(0,U+A*tt);
function stopT(){return A<0?-U/A:Infinity}
function pos(tt){const ts=stopT();const t2=Math.min(tt,ts);return U*t2+.5*A*t2*t2}
const SMAX=()=>Math.max(30,pos(TMAX)),VMAX=()=>Math.max(10,U+Math.max(0,A)*TMAX);
function draw(){const sM=SMAX(),vM=VMAX();let g='';
 g+=`<line x1="20" y1="70" x2="500" y2="70" stroke="${GR}" stroke-width="2"/>`;for(let k=0;k<=10;k++)g+=`<line x1="${20+k*48}" y1="66" x2="${20+k*48}" y2="74" stroke="${GR}"/>`;
 const cx=20+pos(t)/sM*470;g+=car(Math.min(495,cx),62)+T(260,24,`t = ${t.toFixed(1)} s · s = ${pos(t).toFixed(1)} m · v = ${vel(t).toFixed(1)} m/s`,'font-size="14" font-weight="700"');
 const GX=(x0,tt)=>x0+tt/TMAX*200;
 g+=axes(40,110,210,180,'t (s)','s (m)')+axes(290,110,210,180,'t (s)','v (m/s)');
 let p1='',p2='';const N=Math.max(1,Math.round(t*10));for(let i=0;i<=N;i++){const tt=t*i/N;p1+=(i?'L':'M')+GX(40,tt).toFixed(1)+' '+(290-pos(tt)/sM*170).toFixed(1);p2+=(i?'L':'M')+GX(290,tt).toFixed(1)+' '+(290-vel(tt)/vM*170).toFixed(1)}
 if(t>0){g+=`<path d="${p2}L${GX(290,t).toFixed(1)} 290L290 290Z" fill="${OR}" fill-opacity=".15"/>`}
 g+=`<path d="${p1}" fill="none" stroke="${BL}" stroke-width="3"/><path d="${p2}" fill="none" stroke="${OR}" stroke-width="3"/>`;
 g+=T(145,316,'distance–time','font-size="12" fill="'+BL+'"')+T(395,316,'velocity–time (shaded area = s)','font-size="12" fill="'+OR+'"');
 $('#mgSvg').innerHTML=g;$('#mgUv').textContent=U;$('#mgAv').textContent=A;$('#mgGo').textContent=run?'Pause':(t>=TMAX?'Done':'Go');
 const ts=stopT(),te=Math.min(t,ts);const v=vel(t),s=pos(t);
 $('#mgOut').innerHTML=`<p>① v = u + at = ${U} + (${A})(${te.toFixed(1)}) = <b>${v.toFixed(1)} m/s</b></p><p>② s = ut + ½at² = ${U}(${te.toFixed(1)}) + ½(${A})(${te.toFixed(1)})² = <b>${s.toFixed(1)} m</b></p><p>③ 2as = v² − u²: ${(2*A*s).toFixed(1)} = ${(v*v-U*U).toFixed(1)} ✓</p><p>${A===0?'a = 0: uniform motion — straight d–t line, flat v–t line.':A>0?'Speeding up: the d–t graph curves upward; the v–t graph is a rising straight line.':t>=ts?`The car stopped after ${ts.toFixed(1)} s. Braking distance = ${pos(ts).toFixed(1)} m.`:'Braking: the v–t graph slopes down; the d–t graph flattens.'}</p>`}
function loop(ts2){if(!$('#mgSvg')||!$('#mgSvg').isConnected||($('#v-lab')&&$('#v-lab').hidden)){looping=false;return}const dt=last?Math.min(.05,(ts2-last)/1000):0;last=ts2;
 if(run){t=Math.min(TMAX,t+dt*1.5);if(t>=TMAX)run=false;draw()}if(run){requestAnimationFrame(loop)}else looping=false}
function startLoop(){if(!looping){looping=true;last=0;requestAnimationFrame(loop)}}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const el=e.target;if(!el||!el.classList||!el.classList.contains('mgS'))return;if(el.id==='mgU')U=+el.value;else A=+el.value;t=0;run=false;draw()})}
function labClick(b){if(b.id==='mgGo'){if(t>=TMAX)return true;run=!run;if(run)startLoop();draw();return true}if(b.id==='mgReset'){t=0;run=false;draw();return true}return false}
function labChange(){return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
