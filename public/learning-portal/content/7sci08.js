/* Rai Plus content pack: Class 7 Science (Curiosity), Chapter 8 – Measurement of Time and Motion. Bilingual terms. */
RP.register({key:'7sci08',cls:'7',subject:'Science',ch:'8',title:"Measurement of Time and Motion",color:'#185fa5',
crumb:"Class 7 Science · Curiosity · समय और गति का मापन",h1:"Chapter 8: Measurement of Time and Motion",sub:"समय और गति. Sundials, water and sand clocks, the simple pendulum, units of time, speed, and uniform and non-uniform motion.",heroLabel:"A pendulum swinging beside a speedometer",labName:'Pendulum & motion lab',
theme:"\n:root{--g:light-dark(#185fa5,#9cc8f0);--g2:light-dark(#e8f1fa,#0c1724);--line:light-dark(#cfe0f1,#22364b);--bg:light-dark(#ffffff,#090f17);--card:light-dark(#ffffff,#0e1620);\n--ink:light-dark(#0e1a26,#e2ecf6);--mute:light-dark(#4b5f72,#a4b8cb);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#12477c}\n",
labHTML:`  <h2>Pendulum & motion lab · लोलक और गति</h2>
  <p><b>Pendulum:</b> change length, bob mass and how far you pull it. Time 10 oscillations. <b>Motion:</b> watch two cars and read their distance–time graph.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="pSvg" viewBox="0 0 460 320" role="img" aria-label="Pendulum or motion" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="pMode"><option value="pend">Simple pendulum</option><option value="move">Uniform vs non-uniform motion</option></select></label></div>
  <div class="ctrl"><label>Length: <b id="pLv"></b><input type="range" class="pS" id="pL" min="20" max="150" step="5" value="100"></label></div>
  <div class="ctrl"><label>Bob mass: <b id="pMv"></b><input type="range" class="pS" id="pM" min="20" max="200" step="10" value="50"></label></div>
  <div class="ctrl"><label>Pull angle: <b id="pAv"></b><input type="range" class="pS" id="pA" min="5" max="20" value="10"></label></div>
  <div class="ctrl"><button class="btn" id="pGo">Release / start</button> <button class="btn" id="pStop">Stop</button></div>
  <div class="box y" id="pOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#185fa5',LABNAME='Pendulum & motion lab',MIND_CENTER='Time & motion · समय और गति';
const BL='#185fa5',OR='#b04a1f',GN='#3b8a3b',GR='#888780',YE='#f2b632',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const arr=(x1,y1,x2,y2,c=OR,w=2)=>{const a=Math.atan2(y2-y1,x2-x1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/><path d="M${x2} ${y2} l${(-9*Math.cos(a-0.45)).toFixed(1)} ${(-9*Math.sin(a-0.45)).toFixed(1)} M${x2} ${y2} l${(-9*Math.cos(a+0.45)).toFixed(1)} ${(-9*Math.sin(a+0.45)).toFixed(1)}" stroke="${c}" stroke-width="${w}"/>`};
function pend(cx,cy,L,ang,r=12,c=BL){const x=cx+L*Math.sin(ang),y=cy+L*Math.cos(ang);return `<line x1="${cx-40}" y1="${cy}" x2="${cx+40}" y2="${cy}" stroke="${ink}" stroke-width="3"/><line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${ink}" stroke-width="1.5"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${c}"/>`}
function heroDraw(){return pend(80,20,90,0.35,12,'#fff').replace(/currentColor/g,'#fff')+`<path d="M220 110 a60 60 0 0 1 120 0" stroke="#fff" stroke-width="4" fill="none"/><line x1="280" y1="110" x2="315" y2="75" stroke="#fff" stroke-width="4"/>`}
const HERO=heroDraw;
const MIND=[['Ancient clocks',100,50],['Simple pendulum',420,50],['Units of time',90,150],['Speed',430,150],['Uniform & non-uniform',110,250],['Distance–time graph',410,250]];

const C=[
{id:'p1',num:'8.1',title:'Measuring time in the past · पुराने समय में समय मापन',
 intro:'How did people tell the time before clocks and phones?',
 obj:'Describe sundials, water clocks and sand clocks.',
 prior:'Class 6: measurement; the Sun\'s apparent motion.',
 simple:'People used events that repeat regularly to measure time: sunrise to sunrise (a day), phases of the Moon (a month), seasons (a year). To measure parts of a day they used a sundial (धूपघड़ी) — the shadow of a stick moves as the Sun moves; a water clock (ghatika, घटिका) — a bowl with a small hole that sinks in water in a fixed time; and a sand clock (hourglass) — sand flows through a narrow neck.',
 detail:'The Samrat Yantra at Jantar Mantar (Jaipur and Delhi) is a giant sundial that tells local time to about 2 seconds. In ancient India, one ghatika was about 24 minutes (60 ghatikas = 1 day). Sundials do not work at night or on cloudy days; water and sand clocks measure only fixed intervals.',
 real:'The Jantar Mantar in Jaipur, built by Sawai Jai Singh II, has huge sundials still working today.',
 apply:'Why can\'t a sundial be used at night?',
 see:{w:520,h:220,f:[
  ['Sundial: the shadow moves with the Sun.',`<ellipse cx="100" cy="170" rx="70" ry="18" fill="#e8dcc0" stroke="${ink}"/><polygon points="100,170 100,100 140,170" fill="${GR}"/><path d="M100 170 L40 160" stroke="#555" stroke-width="5" opacity=".5"/>`+lbl(100,210,'sundial · धूपघड़ी')],
  ['Water clock: a bowl sinks in a fixed time.',`<path d="M210 140 h100 v60 h-100z" fill="#a9cfee" opacity=".6" stroke="${ink}"/><path d="M230 140 q30 20 60 0" fill="#c87533" stroke="${ink}"/>`+lbl(260,220,'ghatika · घटिका')],
  ['Sand clock: sand runs through a neck.',`<path d="M380 80 h60 l-26 50 l26 50 h-60 l26 -50z" fill="none" stroke="${ink}" stroke-width="2"/><path d="M392 168 h36 l-18 -18z" fill="#e5c43a"/>`+lbl(410,215,'sand clock')]]},
 seeNote:'Regular events measure time.',
 do:{title:'Shadow clock',mat:'Stick, chalk, open ground (sunny day)',steps:['Fix a stick upright.','Mark the shadow tip every hour.','Write the time at each mark.'],obs:'Shadow moves and changes length.',why:'Sun\'s apparent motion.',lab:false},
 memo:'"Shadow, water, sand — old ways of telling time."',
 miscon:['"Sundials work anywhere, anytime." Only in sunlight.'],
 terms:['Sundial · धूपघड़ी','Water clock · घटिका','Sand clock','Periodic event'],
 q:{q:'A ghatika was used to measure:',o:['distance','time','mass','speed'],a:1,why:'Water clock.'},
 exam:'Ancient time-measuring devices: 2 marks.'},

{id:'p2',num:'8.2',title:'The simple pendulum · सरल लोलक',
 intro:'Does a heavy bob swing faster than a light one?',
 obj:'Describe a simple pendulum, its oscillation and time period.',
 prior:'8.1.',
 simple:'A simple pendulum (सरल लोलक) is a small heavy bob hung by a thread from a fixed point. Pulled aside and released, it swings to and fro. One complete to-and-fro swing (from one end to the other and back) is one oscillation (दोलन). The time taken for one oscillation is the time period (आवर्तकाल).',
 detail:'To measure the time period accurately, time 20 oscillations and divide by 20. For small swings, the time period depends on the length of the thread: longer thread → longer period. It does NOT depend on the mass of the bob or (for small swings) on how far it is pulled. A pendulum about 1 m long has a period of about 2 seconds. Galileo noticed this by watching a swinging lamp; pendulum clocks were built using it.',
 real:'Old wall clocks in many homes have a swinging pendulum.',
 apply:'You double the bob\'s mass. What happens to the time period?',
 see:{w:520,h:240,f:[
  ['Bob at rest at the mean position.',pend(260,20,170,0)],
  ['Pull and release: it swings.',pend(260,20,170,0.35,12,'#9cc8f0')+pend(260,20,170,-0.35,12,'#9cc8f0')+`<path d="M200 190 Q260 210 320 190" fill="none" stroke="${OR}" stroke-dasharray="4 3"/>`],
  ['A → B → A = one oscillation.',lbl(195,215,'A')+lbl(325,215,'B')+lbl(260,235,'time period = time for one oscillation','font-weight="700"')]]},
 seeNote:'Period depends on length.',
 do:{title:'Pendulum test',mat:'Thread, small stone, stopwatch',steps:['Make a 50 cm pendulum; time 20 oscillations.','Repeat with 100 cm.','Repeat with a heavier stone.'],obs:'Longer thread → slower; mass no change.',why:'Period depends on length.',lab:true},
 memo:'"Length decides the beat, not weight."',
 miscon:['"A heavier bob swings faster." Mass doesn\'t change the period.'],
 terms:['Simple pendulum · सरल लोलक','Bob','Oscillation · दोलन','Time period · आवर्तकाल','Mean position'],
 q:{q:'The time period of a pendulum depends on its:',o:['mass','length','colour','material'],a:1,why:'For small swings.'},
 exam:'Define oscillation and time period: 2 marks.'},

{id:'p3',num:'8.3',title:'Units of time and clocks · समय के मात्रक',
 intro:'How long is one second, really?',
 obj:'Use the units of time and know modern clocks.',
 prior:'8.2.',
 simple:'The SI unit of time is the second (s). 60 seconds = 1 minute; 60 minutes = 1 hour; 24 hours = 1 day. Larger units: week, month, year, decade (10 years), century (100 years), millennium (1000 years). Clocks: pendulum clocks, quartz clocks (most wall clocks and watches today, using a vibrating quartz crystal), digital clocks, and atomic clocks (the most accurate).',
 detail:'Stopwatches measure short intervals, e.g. a race. Indian Standard Time (IST) is kept by the National Physical Laboratory, New Delhi, using atomic clocks. Converting units: 2 h 15 min = 135 min; 3 min = 180 s.',
 real:'Your mobile phone gets its time from networks linked to atomic clocks.',
 apply:'Convert 1 hour 20 minutes into seconds.',
 see:{w:520,h:200,f:[
  ['60 s = 1 min.',lbl(120,70,'60 s = 1 min','font-size="18"')],
  ['60 min = 1 h; 24 h = 1 day.',lbl(260,110,'60 min = 1 h','font-size="18"')+lbl(400,150,'24 h = 1 day','font-size="18"')],
  ['Quartz and atomic clocks keep accurate time.',lbl(260,190,'pendulum → quartz → atomic','font-weight="700"')]]},
 seeNote:'Second (s) is the SI unit.',
 do:{title:'How long is a minute?',mat:'Stopwatch, partner',steps:['Close eyes; say "stop" when you think 1 minute has passed.','Partner checks the stopwatch.'],obs:'Guesses vary.',why:'Need clocks for accuracy.',lab:false},
 memo:'"60, 60, 24."',
 miscon:['"Hour is the SI unit of time." It is the second.'],
 terms:['Second (s) · सेकंड','Minute','Hour','Quartz clock','Atomic clock'],
 q:{q:'SI unit of time:',o:['hour','minute','second','day'],a:2,why:'Second.'},
 exam:'Convert units of time: 2 marks.'},

{id:'p4',num:'8.4',title:'Speed · चाल',
 intro:'Ravi runs 100 m in 20 s; Sita runs 100 m in 16 s. Who is faster?',
 obj:'Calculate speed as distance covered per unit time.',
 prior:'Class 6: measuring length.',
 simple:'Speed (चाल) tells how fast something moves: speed = distance covered ÷ time taken. SI unit: metre per second (m/s). Common unit: kilometre per hour (km/h). Ravi: 100 ÷ 20 = 5 m/s; Sita: 100 ÷ 16 = 6.25 m/s, so Sita is faster.',
 detail:'Rearranged: distance = speed × time; time = distance ÷ speed. A bus covering 120 km in 3 h has speed 40 km/h. 1 km/h = 1000 m ÷ 3600 s ≈ 0.28 m/s; 36 km/h = 10 m/s. A speedometer shows speed; an odometer shows total distance travelled.',
 real:'Highway signs show speed limits like 80 km/h; vehicles have speedometers.',
 apply:'A train travels 300 km in 5 h. Find its speed.',
 see:{w:520,h:200,f:[
  ['Distance covered…',arr(60,80,420,80,BL,3)+lbl(240,60,'100 m')],
  ['…in time taken.',lbl(240,120,'20 s','font-size="18"')],
  ['Speed = distance ÷ time = 5 m/s.',lbl(260,175,'speed = 100 m ÷ 20 s = 5 m/s','font-size="16" font-weight="700"')]]},
 seeNote:'Speed = distance ÷ time.',
 do:{title:'Class race',mat:'Measuring tape, stopwatch, playground',steps:['Mark 50 m.','Time each runner.','Calculate speeds.'],obs:'Different speeds.',why:'Speed formula.',lab:true},
 memo:'"Speed = distance ÷ time."',
 miscon:['"Faster means more time." Faster means less time for the same distance.'],
 terms:['Speed · चाल','m/s','km/h','Speedometer','Odometer'],
 q:{q:'A cyclist covers 60 m in 10 s. Speed:',o:['6 m/s','600 m/s','0.6 m/s','70 m/s'],a:0,why:'60 ÷ 10.'},
 exam:'Numerical on speed: 3 marks.'},

{id:'p5',num:'8.5',title:'Uniform and non-uniform motion · एकसमान और असमान गति',
 intro:'Does a bus move at the same speed all the way from Rewari to Delhi?',
 obj:'Distinguish uniform and non-uniform motion along a straight line; average speed.',
 prior:'8.4.',
 simple:'An object in straight-line motion (rectilinear, सरल रेखीय) moving equal distances in equal intervals of time has uniform motion (एकसमान गति): its speed is constant. If it covers unequal distances in equal times, it has non-uniform motion (असमान गति). Most motion around us — buses, cycles, people walking — is non-uniform.',
 detail:'For non-uniform motion, average speed = total distance ÷ total time. Example: a bus goes 40 km in the first hour and 60 km in the next hour: average speed = 100 ÷ 2 = 50 km/h. Other kinds of motion: circular (a merry-go-round) and oscillatory (pendulum, swing).',
 real:'A metro train between stations: speeds up, runs steady, slows down — non-uniform overall.',
 apply:'A car covers 10 m, 20 m, 30 m in three successive seconds. Uniform or non-uniform?',
 see:{w:520,h:220,f:[
  ['Uniform: equal distances in equal times.',`<line x1="40" y1="80" x2="480" y2="80" stroke="${GR}"/>`+[0,1,2,3,4].map(k=>`<circle cx="${60+k*100}" cy="80" r="8" fill="${BL}"/>`+lbl(60+k*100,60,k+' s','font-size="11"')).join('')],
  ['Non-uniform: unequal distances.',`<line x1="40" y1="160" x2="480" y2="160" stroke="${GR}"/>`+[0,30,90,190,330].map((d,k)=>`<circle cx="${60+d*1.25}" cy="160" r="8" fill="${OR}"/>`+lbl(60+d*1.25,140,k+' s','font-size="11"')).join('')],
  ['Average speed = total distance ÷ total time.',lbl(260,205,'average speed = total distance ÷ total time','font-weight="700"')]]},
 seeNote:'Equal gaps = uniform.',
 do:{title:'Ball roll',mat:'Ball, long corridor, chalk, stopwatch',steps:['Roll a ball; mark its position every second.','Measure gaps.'],obs:'Gaps shrink: slowing down.',why:'Non-uniform motion.',lab:false},
 memo:'"Same gaps, same speed."',
 miscon:['"A car showing 60 km/h moved uniformly all trip." Speed changes.'],
 terms:['Rectilinear motion · सरल रेखीय गति','Uniform motion · एकसमान गति','Non-uniform motion · असमान गति','Average speed'],
 q:{q:'Equal distances in equal intervals means:',o:['non-uniform','uniform','circular','no motion'],a:1,why:'Constant speed.'},
 exam:'Uniform vs non-uniform; average speed: 3 marks.'},

{id:'p6',num:'8.6',title:'Distance–time graph · दूरी-समय ग्राफ',
 intro:'Can a picture show how fast something moved?',
 obj:'Draw and read distance–time graphs.',
 prior:'8.4, 8.5; Maths Class 6 bar graphs.',
 simple:'A distance–time graph has time on the horizontal (x) axis and distance on the vertical (y) axis. Uniform motion gives a straight line; a steeper line means greater speed. A horizontal line means the object is at rest (distance not changing). Non-uniform motion gives a curved or broken line.',
 detail:'From the graph: read distance at any time; find speed for uniform motion = distance ÷ time from any point on the line. Two objects on one graph: the steeper line is faster. Choose a scale that fits the paper.',
 real:'Fitness apps show distance–time plots of your walk.',
 apply:'Two straight lines on a distance–time graph: A is steeper. Which is faster?',
 see:{w:520,h:240,f:[
  ['Axes: time →, distance ↑.',`<line x1="60" y1="210" x2="460" y2="210" stroke="${ink}" stroke-width="2"/><line x1="60" y1="210" x2="60" y2="30" stroke="${ink}" stroke-width="2"/>`+lbl(260,232,'time (s)')+`<text x="30" y="120" font-size="13" transform="rotate(-90 30 120)" text-anchor="middle">distance (m)</text>`],
  ['Straight line: uniform. Steeper = faster.',`<line x1="60" y1="210" x2="300" y2="50" stroke="${BL}" stroke-width="3"/><line x1="60" y1="210" x2="440" y2="120" stroke="${GN}" stroke-width="3"/>`+lbl(310,45,'fast','fill="'+BL+'" text-anchor="start"')+lbl(445,115,'slow','fill="'+GN+'" text-anchor="start"')],
  ['Flat part: at rest.',`<polyline points="60,210 180,140 300,140 440,60" fill="none" stroke="${OR}" stroke-width="3" stroke-dasharray="6 4"/>`+lbl(240,130,'resting','fill="'+OR+'"')]]},
 seeNote:'Slope shows speed.',
 do:{title:'Plot your walk',mat:'Graph paper, a walk to school (with timings)',steps:['Note distance at each minute.','Plot distance vs time.'],obs:'Flat parts at crossings.',why:'Stops = rest.',lab:false},
 memo:'"Steeper is faster, flat is resting."',
 miscon:['"A flat line means moving fast." It means not moving.'],
 terms:['Distance–time graph','Slope','At rest'],
 q:{q:'A horizontal line on a distance–time graph means the object is:',o:['speeding up','at rest','moving uniformly fast','reversing'],a:1,why:'Distance unchanged.'},
 exam:'Interpret a distance–time graph: 3 marks.'}
];

const CARDS=[['Sundial','Shadow tells time.'],['Ghatika','Water clock ≈ 24 min.'],['Simple pendulum','Bob on a thread.'],['Oscillation','One to-and-fro swing.'],['Time period','Time for one oscillation; depends on length.'],['SI unit of time','Second (s).'],['Speed','Distance ÷ time; m/s, km/h.'],['36 km/h','= 10 m/s.'],['Uniform motion','Equal distances in equal times.'],['Average speed','Total distance ÷ total time.'],['Distance–time graph','Steeper = faster; flat = rest.']];

const Q=[
 {lv:1,q:'SI unit of speed:',o:['km/h','m/s','m','s'],a:1,w:'m/s.'},
 {lv:1,q:'Time for one oscillation is the:',o:['speed','time period','distance','frequency'],a:1,w:'Definition.'},
 {lv:1,q:'Shadow-based clock:',o:['sand clock','sundial','water clock','quartz clock'],a:1,w:'Sundial.'},
 {lv:2,q:'A car goes 150 km in 3 h. Speed:',o:['50 km/h','450 km/h','153 km/h','30 km/h'],a:0,w:'150 ÷ 3.'},
 {lv:2,q:'A pendulum makes 20 oscillations in 40 s. Period:',o:['20 s','2 s','0.5 s','800 s'],a:1,w:'40 ÷ 20.'},
 {lv:2,q:'Uniform motion means:',o:['changing speed','constant speed in a straight line','circular','at rest'],a:1,w:'Equal distances, equal times.'},
 {lv:3,q:'Doubling the bob\'s mass makes the period:',o:['double','half','unchanged','zero'],a:2,w:'Mass doesn\'t matter.'},
 {lv:3,q:'Convert 54 km/h to m/s:',o:['15 m/s','54 m/s','5.4 m/s','150 m/s'],a:0,w:'54 × 5/18.'},
 {lv:4,q:'A bus: 40 km in 1st hour, 20 km in next hour. Average speed:',o:['60 km/h','30 km/h','20 km/h','40 km/h'],a:1,w:'60 ÷ 2.'},
 {lv:4,q:'On a distance–time graph, steeper line means:',o:['slower','faster','at rest','going back'],a:1,w:'Slope = speed.'},
 {lv:5,open:true,m:3,q:'Describe how to find the time period of a pendulum accurately.',ans:['Set up the pendulum; pull slightly and release (1)','Time 20 oscillations with a stopwatch (1)','Divide total time by 20 (1)']},
 {lv:5,open:true,m:3,q:'Ravi cycles 2 km in 10 min, then 3 km in 20 min. Find his average speed in km/h.',ans:['Total distance 5 km (1)','Total time 30 min = 0.5 h (1)','Average speed = 10 km/h (1)']}
];

const ONEMIN=['Sundial, ghatika, sand clock.','Pendulum: oscillation, time period; depends on length only.','Second is the SI unit; 60, 60, 24.','Speed = distance ÷ time; m/s, km/h.','Uniform vs non-uniform; average speed.','Distance–time graph: slope = speed.'];
const KEYS=[['ancient clocks',/sundial|ghatika|sand/i],['pendulum',/pendulum|लोलक|oscillat/i],['time period',/period|length/i],['second',/second|SI/i],['speed',/speed|चाल/i],['uniform',/uniform/i],['graph',/graph|slope/i]];

/* ---------- lab ---------- */
let mode='pend',L=100,M=50,A0=10,run=false,raf=null,t0=0,tt=0,osc=0,last=0,trace=[];
const g=980;function per(){return 2*Math.PI*Math.sqrt(L/g)}
function stop(){run=false;if(raf)cancelAnimationFrame(raf);raf=null}
function vis(){const s=$('#pSvg');return s&&s.isConnected&&s.getClientRects().length}
function loop(ts){if(!run)return;if(!vis()){stop();return}if(!t0)t0=ts;tt=(ts-t0)/1000;draw();raf=requestAnimationFrame(loop)}
function drawPend(){const P=per(),ang=(A0*Math.PI/180)*Math.cos(2*Math.PI*tt/P);const sc=1.6,Lp=L*sc;const r=6+Math.sqrt(M)*1.0;let s=pend(230,20,Lp,run||tt?ang:A0*Math.PI/180,r);
 s+=`<line x1="230" y1="20" x2="230" y2="${20+Lp+20}" stroke="${GR}" stroke-dasharray="3 3"/>`;const n=Math.floor(tt/P);
 s+=T(80,290,`time ${tt.toFixed(1)} s`,'font-size="13"')+T(230,290,`oscillations ${run||tt?n:0}`,'font-size="13"')+T(380,290,`T = ${P.toFixed(2)} s`,'font-size="13" font-weight="700"');
 $('#pSvg').innerHTML=s;$('#pLv').textContent=L+' cm';$('#pMv').textContent=M+' g';$('#pAv').textContent=A0+'°';
 if(run&&n>=10){stop();$('#pOut').innerHTML=`<p class="fb ok">10 oscillations in ${(10*P).toFixed(1)} s → time period = ${(P).toFixed(2)} s.</p><p>Try changing the mass or angle: the period stays the same. Change the length: it changes!</p>`}}
function drawMove(){const D=200,Tm=10;const f1=t=>t*D/Tm,f2=t=>D*Math.pow(t/Tm,2);const t=Math.min(tt,Tm);let s='';
 s+=`<line x1="30" y1="40" x2="430" y2="40" stroke="${GR}"/><line x1="30" y1="80" x2="430" y2="80" stroke="${GR}"/>`;
 const X=d=>30+d*2;s+=`<rect x="${X(f1(t))-14}" y="28" width="28" height="14" rx="4" fill="${BL}"/><rect x="${X(f2(t))-14}" y="68" width="28" height="14" rx="4" fill="${OR}"/>`+T(440,44,'A','font-size="12" text-anchor="start"')+T(440,84,'B','font-size="12" text-anchor="start"');
 for(let k=0;k<=Math.floor(t);k++){s+=`<circle cx="${X(f1(k))}" cy="50" r="2" fill="${BL}"/><circle cx="${X(f2(k))}" cy="90" r="2" fill="${OR}"/>`}
 const gx=t2=>70+t2*36,gy=d=>290-d*0.85;s+=`<line x1="70" y1="290" x2="440" y2="290" stroke="${ink}"/><line x1="70" y1="290" x2="70" y2="110" stroke="${ink}"/>`+T(255,312,'time (s)','font-size="11"')+T(48,200,'d (m)','font-size="11"');
 let p1='',p2='';for(let k=0;k<=t*10;k++){const q=k/10;p1+=`${gx(q).toFixed(1)},${gy(f1(q)).toFixed(1)} `;p2+=`${gx(q).toFixed(1)},${gy(f2(q)).toFixed(1)} `}
 s+=`<polyline points="${p1}" fill="none" stroke="${BL}" stroke-width="2.5"/><polyline points="${p2}" fill="none" stroke="${OR}" stroke-width="2.5"/>`;
 $('#pSvg').innerHTML=s;if(tt>=Tm){stop();$('#pOut').innerHTML='<p class="fb ok">Both cars covered 200 m in 10 s (average speed 20 m/s).</p><p><b>A (blue):</b> equal gaps each second, straight-line graph → <b>uniform motion</b>. <b>B (orange):</b> gaps grow (speeding up), curved graph → <b>non-uniform motion</b>.</p>'}else if(run)$('#pOut').innerHTML='<p>Watch the dots marked each second…</p>'}
function draw(){mode==='pend'?drawPend():drawMove()}
function labShow(){draw();if(!run&&!tt)$('#pOut').innerHTML=mode==='pend'?'<p>Set length, mass and angle, then Release.</p>':'<p>Press Start to race two cars.</p>'}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('pS'))labChange(e.target)})}
function labClick(b){if(b.id==='pGo'){stop();t0=0;tt=0;run=true;raf=requestAnimationFrame(loop);$('#pOut').innerHTML=mode==='pend'?'<p>Counting oscillations…</p>':'<p>Racing…</p>';return true}if(b.id==='pStop'){stop();return true}return false}
function labChange(x){if(x.id==='pMode'){stop();tt=0;mode=x.value;labShow();return true}if(x.id==='pL'){L=+x.value}else if(x.id==='pM'){M=+x.value}else if(x.id==='pA'){A0=+x.value}else return false;stop();tt=0;mode='pend';$('#pMode').value='pend';drawPend();$('#pOut').innerHTML=`<p>Predicted period for ${L} cm: press Release to measure.</p>`;return true}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
