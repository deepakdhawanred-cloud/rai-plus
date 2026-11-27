/* Rai Plus content pack: Class 6 Science (Curiosity), Chapter 5 – Measurement of Length and Motion. Bilingual terms. */
RP.register({key:'6sci05',cls:'6',subject:'Science',ch:'5',title:"Measurement of Length and Motion",color:'#2d4f8a',
crumb:"Class 6 Science · Curiosity · लंबाई तथा गति का मापन",h1:"Chapter 5: Measurement of Length and Motion",sub:"लंबाई तथा गति का मापन. From handspans to metres, measuring correctly, and the different kinds of motion.",heroLabel:"A ruler, a measuring tape and a moving cart",labName:'Measuring lab',
theme:"\n:root{--g:light-dark(#2d4f8a,#a6c1ee);--g2:light-dark(#ebf0f9,#0e1424);--line:light-dark(#d1dcf0,#26324d);--bg:light-dark(#ffffff,#0a0e18);--card:light-dark(#ffffff,#0f1422);\n--ink:light-dark(#0f1626,#e3e9f6);--mute:light-dark(#4f5b72,#a8b4cb);--y:light-dark(#b3541e,#f2a774);--y2:light-dark(#fbeee4,#2a170a);--hd:#203b69}\n",
labHTML:`  <h2>Measuring lab · मापन प्रयोगशाला</h2>
  <p>Measure the pencil. Try a broken ruler and different eye positions, and see how the reading changes.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="rSvg" viewBox="0 0 480 300" role="img" aria-label="A pencil on a ruler with an eye looking at the scale" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Ruler<select id="rRul"><option value="ok">Good ruler (0 mark visible)</option><option value="br">Broken end (start from 1 cm)</option></select></label></div><div class="ctrl"><label>Eye position<select id="rEye"><option value="0">Directly above</option><option value="-1">To the left</option><option value="1">To the right</option></select></label></div><div class="ctrl"><label>Pencil length: <b id="rLv"></b><input type="range" id="rLen" min="40" max="140" value="96"></label></div><div class="box y" id="rOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#2d4f8a',LABNAME='Measuring lab',MIND_CENTER='Measurement & motion';
const BL='#2d4f8a',OR='#b3541e',GN='#3b6d11',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
function ruler(x,y,cm,k,start=0){let s=`<rect x="${x}" y="${y}" width="${cm*k}" height="34" fill="#f5e6a8" stroke="${ink}"/>`;for(let i=0;i<=cm*10;i++){const xx=x+i*k/10,h=i%10?(i%5?7:11):16;s+=`<line x1="${xx}" y1="${y}" x2="${xx}" y2="${y+h}" stroke="${ink}" stroke-width="${i%10?0.6:1.2}"/>`;if(i%10===0)s+=T(xx,y+28,String(i/10+start),'font-size="10"')}return s}
const pencil=(x,y,len)=>`<rect x="${x}" y="${y}" width="${len-14}" height="12" fill="#f2c94c" stroke="${ink}"/><path d="M${x+len-14} ${y} L${x+len} ${y+6} L${x+len-14} ${y+12}Z" fill="#e8d4a0" stroke="${ink}"/>`;
function heroDraw(){let s='<rect x="20" y="70" width="180" height="24" fill="#fff" opacity=".85"/>';for(let i=0;i<=18;i++)s+=`<line x1="${20+i*10}" y1="70" x2="${20+i*10}" y2="${i%5?78:84}" stroke="#203b69"/>`;return s+'<rect x="220" y="50" width="40" height="24" rx="4" fill="#fff" opacity=".8"/><circle cx="228" cy="78" r="6" fill="#fff"/><circle cx="252" cy="78" r="6" fill="#fff"/>'}
const HERO=heroDraw;
const MIND=[['Body measures',100,50],['Standard units & SI',420,50],['Measuring correctly',90,150],['Curved lines',430,150],['Reference point, rest & motion',110,250],['Types of motion',410,250]];

const C=[
{id:'l1',num:'5.1',title:'Measuring with body parts · शरीर के अंगों से मापन',
 intro:'You and your friend both measure a desk in handspans. Why do you get different answers?',
 obj:'Explain why body-part measures are unreliable and why standard units are needed.',
 prior:'Counting and comparing lengths.',
 simple:'Long ago, people measured with body parts: handspan (बालिश्त), arm length, foot length and stride (कदम). In ancient India units like angula (finger width), dhanusa and yojana were used. But body parts differ from person to person, so the same object gave different measurements. This is why standard units (मानक मात्रक) were needed.',
 detail:'Carpenters and tailors still sometimes use the angula. Farmers used strides to divide fields. Archaeologists have found what may be marked scales at Harappan sites, showing measuring tools were used very early. Measurement means comparing an unknown quantity with a known fixed quantity called a unit; the result has a number and a unit, e.g. 12 handspans or 1.5 m.',
 real:'A tailor measuring cloth with a tape gets the same result for every customer; measuring with a handspan would not.',
 apply:'Measure your desk in handspans and ask two friends to do the same. Compare.',
 see:{w:520,h:220,f:[
  ['Measuring a desk with handspans.',`<rect x="40" y="110" width="300" height="20" fill="#c9a27a"/>`+[0,1,2,3,4].map(i=>`<path d="M${50+i*58} 105 q29 -30 58 0" fill="none" stroke="${OR}" stroke-width="2"/>`).join('')],
  ['A smaller hand gives a bigger number.',[0,1,2,3,4,5,6].map(i=>`<path d="M${50+i*42} 150 q21 -18 42 0" fill="none" stroke="${BL}" stroke-width="2"/>`).join('')+lbl(420,120,'5 spans','fill="'+OR+'"')+lbl(420,150,'7 spans','fill="'+BL+'"')],
  ['Different people → different results: we need standard units.',lbl(260,200,'standard units · मानक मात्रक','font-weight="700"')]]},
 seeNote:'The desk did not change; the "unit" did.',
 do:{title:'Handspan survey',mat:'A desk, three friends',steps:['Each person measures the desk in handspans.','Record and compare.'],obs:'Different numbers.',why:'Handspans are not equal.',lab:false},
 memo:'"Body units vary; standard units don\'t."',
 miscon:['"Measurement is just a number." It needs a unit too.'],
 terms:['Handspan · बालिश्त','Stride · कदम','Angula · अंगुल','Unit · मात्रक','Standard unit · मानक मात्रक'],
 q:{q:'Body-part measurements are unreliable because:',o:['they are too large','body parts differ from person to person','they are too small','they use numbers'],a:1,why:'Not standard.'},
 exam:'Why standard units are needed: 2 marks.'},

{id:'l2',num:'5.2',title:'Standard units: the metre · मीटर',
 intro:'How many centimetres are there in your height in metres?',
 obj:'Use the SI unit of length and convert between km, m, cm and mm, writing units correctly.',
 prior:'Need for standard units (5.1).',
 simple:'Countries agreed on the International System of Units (SI). The SI unit of length is the metre (m). 1 m = 100 cm; 1 cm = 10 mm; 1 km = 1000 m. Small lengths use cm or mm; long distances use km.',
 detail:'The smallest division on an ordinary ruler is 1 mm (0.1 cm). Some rulers also show inches: 1 inch = 2.54 cm. Writing units: symbols are lowercase (km, m, cm, mm), take no plural "s" and no full stop, and are separated from the number by a space: 5 m, not 5m or 5 mtrs. Choose the right tool: a 15 cm ruler for a pencil, a metre scale or measuring tape for a room, a flexible tailor\'s tape for curved things.',
 real:'Road signs give distances in km; cloth is sold in metres; a pen is about 14 cm long.',
 apply:'Convert: 2.5 m = ___ cm; 45 mm = ___ cm; 3 km = ___ m.',
 see:{w:520,h:220,f:[
  ['1 km = 1000 m.',lbl(130,60,'1 km = 1000 m','font-size="16" font-weight="700"')],
  ['1 m = 100 cm.',lbl(130,110,'1 m = 100 cm','font-size="16" font-weight="700"')],
  ['1 cm = 10 mm.',ruler(270,90,2,100)+lbl(130,160,'1 cm = 10 mm','font-size="16" font-weight="700"')+lbl(370,160,'smallest division: 1 mm','font-size="12"')]]},
 seeNote:'Write "5 m", not "5m." or "5 mtrs".',
 do:{title:'Estimate then measure',mat:'Ruler, metre tape',steps:['Estimate the length of your book, desk and classroom door.','Measure each in suitable units.','Compare estimate and measurement.'],obs:'Estimates get better with practice.',why:'Familiarity with units.',lab:true},
 memo:'"Kilo-thousand, centi-hundredth, milli-thousandth."',
 miscon:['"1 m = 1000 cm." 1 m = 100 cm.','"Write 5 cms." Write 5 cm.'],
 terms:['SI unit','Metre · मीटर','Centimetre · सेंटीमीटर','Millimetre · मिलीमीटर','Kilometre · किलोमीटर'],
 q:{q:'1 m equals:',o:['10 cm','100 cm','1000 cm','1000 mm only'],a:1,why:'Also 1000 mm.'},
 exam:'Unit conversion: 2 marks.'},

{id:'l3',num:'5.3',title:'Measuring correctly · सही विधि से मापन',
 intro:'Two students measure the same pencil and get 9.6 cm and 9.9 cm. Who made a mistake?',
 obj:'Use a ruler correctly: alignment, eye position and broken-end readings.',
 prior:'Units (5.2).',
 simple:'Place the ruler along the length of the object, touching it. Start from the zero mark. Keep your eye directly above the point you are reading; looking from the side gives a wrong reading. If the end of the ruler is broken, start from a full mark such as 1 cm and subtract it from the reading at the other end.',
 detail:'Example: one end of the pencil at 1.0 cm and the other at 10.6 cm: length = 10.6 − 1.0 = 9.6 cm. Measure two or three times and take the usual (or average) value. Scales with raised markings let visually challenged students measure by touch.',
 real:'Carpenters say "measure twice, cut once" to avoid errors.',
 apply:'A ruler is broken at the start. One end of a leaf is at 2.0 cm and the other at 8.5 cm. Find the length.',
 see:{w:520,h:240,f:[
  ['Ruler touching the object, starting at 0.',ruler(40,120,11,40)+pencil(40,100,384)],
  ['Eye directly above the reading.',`<ellipse cx="424" cy="40" rx="14" ry="8" fill="none" stroke="${GN}" stroke-width="2"/><circle cx="424" cy="40" r="4" fill="${GN}"/><line x1="424" y1="48" x2="424" y2="118" stroke="${GN}" stroke-dasharray="4 3"/>`+lbl(480,40,'✓','font-size="18" fill="'+GN+'"')],
  ['From the side: a wrong reading (parallax error).',`<ellipse cx="490" cy="70" rx="12" ry="7" fill="none" stroke="${OR}" stroke-width="2"/><line x1="488" y1="76" x2="440" y2="118" stroke="${OR}" stroke-dasharray="4 3"/>`+lbl(260,210,'eye above · start at a full mark · subtract if broken','font-size="12" font-weight="700"')]]},
 seeNote:'Here the pencil is 9.6 cm long.',
 do:{title:'Broken scale challenge',mat:'Ruler, a leaf, a pencil',steps:['Pretend the first 2 cm of the ruler are broken.','Measure starting from the 2 cm mark.','Subtract 2 cm.'],obs:'Same length as measuring from 0.',why:'Length is the difference between end readings.',lab:true},
 memo:'"Touch, align, eye above, subtract the start."',
 miscon:['"Always start from the end of the ruler." The physical end may not be zero.'],
 terms:['Parallax error','Zero mark','Broken scale'],
 q:{q:'Ends of an object are at 3.0 cm and 7.5 cm. Its length is:',o:['10.5 cm','4.5 cm','7.5 cm','3.0 cm'],a:1,why:'7.5 − 3.0.'},
 exam:'Correct method of measurement: 2–3 marks.'},

{id:'l4',num:'5.4',title:'Measuring a curved line · वक्र रेखा की लंबाई',
 intro:'How can you measure the length of a curvy road on a map with a straight ruler?',
 obj:'Measure curved lengths with a thread or flexible tape.',
 prior:'Measuring correctly (5.3).',
 simple:'Place a thread carefully along the curved line, marking where it starts and ends. Straighten the thread and measure the marked length on a metre scale. A flexible measuring tape can be used directly for curved objects such as the girth of a tree or your waist.',
 detail:'Use a thread that does not stretch. Keep it close to the curve at every point. Repeat a few times and take the average. Tailors measure chest and waist with a tape; foresters measure the girth (distance around) of tree trunks.',
 real:'A tailor measures around your arm with a flexible tape.',
 apply:'How would you find the distance around a bangle?',
 see:{w:520,h:220,f:[
  ['A curved line.',`<path d="M40 120 C100 40 160 200 220 120 S330 40 380 120" fill="none" stroke="${BL}" stroke-width="4"/>`],
  ['Lay a thread along it and mark the ends.',`<path d="M40 120 C100 40 160 200 220 120 S330 40 380 120" fill="none" stroke="${OR}" stroke-width="2" stroke-dasharray="3 2"/><circle cx="40" cy="120" r="4" fill="${OR}"/><circle cx="380" cy="120" r="4" fill="${OR}"/>`],
  ['Straighten the thread and measure it.',`<line x1="40" y1="190" x2="480" y2="190" stroke="${OR}" stroke-width="2"/>`+lbl(260,212,'thread length = curve length','font-weight="700"')]]},
 seeNote:'Use a non-stretchy thread.',
 do:{title:'Map distance',mat:'A map, thread, ruler',steps:['Lay a thread along a road between two towns.','Measure the thread.','Use the map scale to convert to km.'],obs:'Road distance is longer than straight-line distance.',why:'Roads curve.',lab:false},
 memo:'"Bend the thread, then straighten and read."',
 miscon:['"Curved lines cannot be measured with a ruler." Use a thread, then the ruler.'],
 terms:['Curved line · वक्र रेखा','Thread · धागा','Girth · घेरा'],
 q:{q:'To measure the girth of a tree trunk, use:',o:['a 15 cm ruler','a flexible measuring tape','a metre stick held straight','a handspan'],a:1,why:'It bends around.'},
 exam:'Describe measuring a curved line: 2 marks.'},

{id:'l5',num:'5.5',title:'Reference point, rest and motion · संदर्भ बिंदु, विराम और गति',
 intro:'Sitting in a moving bus, are you at rest or in motion?',
 obj:'Use a reference point to describe position and decide whether an object is at rest or in motion.',
 prior:'Measuring distance.',
 simple:'A reference point (संदर्भ बिंदु) is a fixed landmark from which we describe position, e.g. a school gate, a kilometre stone or a tree. An object is in motion (गति) if its position changes with time relative to the reference point, and at rest (विराम) if its position does not change.',
 detail:'Whether something is at rest or moving depends on the reference point. A passenger in a moving bus is at rest relative to the bus seat but in motion relative to trees outside. Kilometre stones on highways tell distances from towns; the starting line in a race is a reference point.',
 real:'The highway stone "Rewari 25" tells you how far you are from Rewari: Rewari is the reference point.',
 apply:'Is the classroom blackboard at rest or in motion relative to (a) the classroom (b) the Sun?',
 see:{w:520,h:220,f:[
  ['A tree is the reference point.',`<rect x="56" y="130" width="10" height="50" fill="#7a5a2a"/><circle cx="61" cy="115" r="26" fill="${GN}" opacity=".85"/>`+lbl(61,205,'reference','font-size="12"')],
  ['The bus moves away from the tree: motion.',`<rect x="200" y="130" width="120" height="40" rx="6" fill="${BL}"/><circle cx="225" cy="175" r="10" fill="${ink}"/><circle cx="295" cy="175" r="10" fill="${ink}"/><path d="M330 150 h40" stroke="${OR}" stroke-width="3"/><path d="M362 144 l8 6 l-8 6" fill="none" stroke="${OR}" stroke-width="3"/>`],
  ['A passenger is at rest relative to the bus but moving relative to the tree.',`<circle cx="260" cy="145" r="7" fill="#f2c94c"/>`+lbl(400,90,'passenger: rest (bus) / motion (tree)','font-size="12"')]]},
 seeNote:'Rest and motion depend on the reference point.',
 do:{title:'Position game',mat:'Classroom',steps:['Choose the door as reference.','Describe where each desk is (steps from the door).','Move one desk; describe again.'],obs:'Position changes = motion.',why:'Motion is change of position.',lab:false},
 memo:'"Moving compared with what? Always name the reference."',
 miscon:['"An object is either moving or not, full stop." It depends on the reference point.'],
 terms:['Reference point · संदर्भ बिंदु','Position · स्थिति','Rest · विराम','Motion · गति'],
 q:{q:'An object is in motion if its position:',o:['stays the same','changes with time relative to a reference point','is high','is far away'],a:1,why:'Definition.'},
 exam:'Rest and motion relative to a reference: 2 marks.'},

{id:'l6',num:'5.6',title:'Types of motion · गति के प्रकार',
 intro:'A train on a straight track, a merry-go-round and a swing: how are their motions different?',
 obj:'Identify linear, circular and oscillatory motion, and periodic motion.',
 prior:'Rest and motion (5.5).',
 simple:'Linear motion (रैखिक गति): along a straight line, e.g. a car on a straight road, a falling stone. Circular motion (वृत्तीय गति): along a circle, staying the same distance from a centre, e.g. a merry-go-round, the tip of a clock hand. Oscillatory motion (दोलन गति): to and fro about a fixed position, e.g. a swing, a pendulum, a plucked guitar string. Motion that repeats after a fixed time is periodic (आवर्ती).',
 detail:'Circular and oscillatory motions repeat, so both are periodic. A single object can show more than one kind of motion: a bicycle moves forward in a straight line while its wheels turn in circles. A satellite orbiting Earth moves in (nearly) circular motion.',
 real:'The pendulum of an old wall clock swings with oscillatory, periodic motion.',
 apply:'Classify: blades of a ceiling fan, a child on a slide, a swing, the needle of a sewing machine.',
 see:{w:520,h:240,f:[
  ['Linear: along a straight line.',`<rect x="30" y="100" width="50" height="26" rx="4" fill="${BL}"/><path d="M90 113 h80" stroke="${OR}" stroke-width="3"/><path d="M162 107 l8 6 l-8 6" fill="none" stroke="${OR}" stroke-width="3"/>`+lbl(100,170,'linear · रैखिक')],
  ['Circular: around a centre.',`<circle cx="260" cy="113" r="45" fill="none" stroke="${GR}" stroke-dasharray="4 3"/><circle cx="305" cy="113" r="8" fill="${OR}"/><circle cx="260" cy="113" r="3" fill="${ink}"/>`+lbl(260,190,'circular · वृत्तीय')],
  ['Oscillatory: to and fro about a fixed point.',`<line x1="420" y1="40" x2="400" y2="140" stroke="${ink}"/><line x1="420" y1="40" x2="440" y2="140" stroke="${ink}" opacity=".3"/><circle cx="400" cy="145" r="10" fill="${BL}"/><circle cx="440" cy="145" r="10" fill="${BL}" opacity=".3"/>`+lbl(420,190,'oscillatory · दोलन')+lbl(260,230,'circular and oscillatory motions are periodic','font-size="12" font-weight="700"')]]},
 seeNote:'Periodic = repeats after a fixed time.',
 do:{title:'Pendulum timing',mat:'A thread, a small stone, a stopwatch',steps:['Tie the stone and let it swing.','Count swings in 30 seconds, three times.'],obs:'The count is almost the same each time.',why:'Periodic motion.',lab:false},
 memo:'"Line, circle, to-and-fro; repeat = periodic."',
 miscon:['"A swing moves in circular motion." It is oscillatory (to and fro along an arc).','"Periodic motion must be circular." Oscillation is also periodic.'],
 terms:['Linear motion · रैखिक गति','Circular motion · वृत्तीय गति','Oscillatory motion · दोलन गति','Periodic motion · आवर्ती गति'],
 q:{q:'The motion of a pendulum is:',o:['linear','circular','oscillatory','none'],a:2,why:'To and fro.'},
 exam:'Classify motions with examples: 2–3 marks.'}
];

const CARDS=[['Body units','Handspan, stride, angula: vary between people.'],['SI unit of length','metre (m).'],['Conversions','1 km = 1000 m; 1 m = 100 cm; 1 cm = 10 mm.'],['Writing units','5 m — lowercase, no "s", space before unit.'],['Correct measuring','Ruler along object; eye directly above; subtract if broken.'],['Curved line','Thread along curve; straighten; measure.'],['Reference point','Fixed landmark to describe position.'],['Rest / motion','Position unchanged / changing w.r.t. reference.'],['Linear','Straight line.'],['Circular','Around a centre.'],['Oscillatory','To and fro about a fixed point.'],['Periodic','Repeats after fixed time.']];

const Q=[
 {lv:1,q:'SI unit of length:',o:['centimetre','metre','kilometre','inch'],a:1,w:'Metre.'},
 {lv:1,q:'1 cm =',o:['10 mm','100 mm','1000 mm','1 mm'],a:0,w:'1 cm = 10 mm.'},
 {lv:1,q:'A swing shows:',o:['linear motion','oscillatory motion','no motion','circular motion only'],a:1,w:'To and fro.'},
 {lv:2,q:'Correct way to write five metres:',o:['5 M','5 mtrs','5 m','5m.'],a:2,w:'Symbol rules.'},
 {lv:2,q:'Which is in circular motion?',o:['tip of a clock hand','a falling stone','a car on a straight road','a swing'],a:0,w:'Moves round a centre.'},
 {lv:2,q:'2.5 m in centimetres:',o:['25 cm','250 cm','2500 cm','0.25 cm'],a:1,w:'×100.'},
 {lv:3,q:'A ruler is broken; object ends at 1.0 cm and 10.6 cm. Length:',o:['10.6 cm','11.6 cm','9.6 cm','1.0 cm'],a:2,w:'10.6 − 1.0.'},
 {lv:3,q:'A passenger sitting in a moving train is at rest relative to:',o:['the platform','trees outside','the train seat','the station'],a:2,w:'Reference point.'},
 {lv:4,q:'Why are both circular and oscillatory motions called periodic?',o:['they are fast','they repeat after a fixed time','they are straight','they never stop'],a:1,w:'Definition.'},
 {lv:4,q:'Best tool to measure the waist of a person:',o:['15 cm ruler','metre stick','flexible measuring tape','handspan'],a:2,w:'Curved.'},
 {lv:5,open:true,m:3,q:'List three precautions while measuring length with a ruler.',ans:['Place the ruler along the object, touching it (1)','Keep the eye directly above the reading (1)','If the zero end is broken, start from a full mark and subtract (1)']},
 {lv:5,open:true,m:3,q:'Give one example each of linear, circular and oscillatory motion.',ans:['Linear: car on a straight road (1)','Circular: merry-go-round / fan blade tip (1)','Oscillatory: swing / pendulum (1)']}
];

const ONEMIN=['Body units vary; standard units are needed.','SI unit of length: metre; 1 km = 1000 m, 1 m = 100 cm, 1 cm = 10 mm.','Write "5 m": lowercase, no plural, space.','Ruler along the object, eye directly above, subtract if broken.','Curved lines: thread, then ruler.','Reference point; rest and motion depend on it.','Linear, circular, oscillatory; circular and oscillatory are periodic.'];
const KEYS=[['standard units',/standard|मानक/i],['metre',/metre|meter|मीटर/i],['conversions',/100 cm|10 mm|1000 m/i],['eye above',/eye|parallax/i],['broken ruler',/broken|subtract/i],['thread for curve',/thread|curve/i],['reference point',/reference|संदर्भ/i],['rest and motion',/rest|motion|गति/i],['linear/circular/oscillatory',/linear|circular|oscillat/i],['periodic',/periodic|आवर्ती/i]];

/* ---------- lab ---------- */
let rul='ok',eye=0,len=96;const K=36,X0=40,Y0=150;
function draw(){const start=rul==='br'?1:0;const px=len*K/10;const left=X0+(rul==='br'?K:0);let s=ruler(X0,Y0,11,K,0);if(rul==='br')s+=`<path d="M${X0-2} ${Y0-2} l${K-4} 0 l-6 38 l${-K+10} 0z" fill="var(--bg,#fff)"/><path d="M${X0+K-6} ${Y0-2} l6 38" stroke="${ink}" stroke-dasharray="3 2"/>`;
 s+=pencil(left,Y0-16,px);const endX=left+px;const ex=endX+eye*70,ey=50;s+=`<ellipse cx="${ex}" cy="${ey}" rx="14" ry="8" fill="none" stroke="${eye?OR:GN}" stroke-width="2"/><circle cx="${ex}" cy="${ey}" r="4" fill="${eye?OR:GN}"/><line x1="${ex}" y1="${ey+8}" x2="${endX}" y2="${Y0-16}" stroke="${eye?OR:GN}" stroke-dasharray="4 3"/>`;
 const readEnd=(endX-X0)/K+start*0;const shown=+(readEnd+(eye?-eye*0.3:0)).toFixed(1);const startR=rul==='br'?1:0;
 $('#rSvg').innerHTML=s;$('#rLv').textContent=(len/10).toFixed(1)+' cm';
 $('#rOut').innerHTML=`<p>Start reading: <b>${startR.toFixed(1)} cm</b>; end reading you see: <b>${shown.toFixed(1)} cm</b></p><p>Length = ${shown.toFixed(1)} − ${startR.toFixed(1)} = <b>${(shown-startR).toFixed(1)} cm</b> ${eye?'<span class="fb no">— wrong! Your eye is to the side (parallax error).</span>':'<span class="fb ok">— correct.</span>'}</p><p>True length: ${(len/10).toFixed(1)} cm.</p>`}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='rLen')labChange(e.target)})}
function labClick(){return false}
function labChange(t){if(t.id==='rRul'){rul=t.value;draw();return true}if(t.id==='rEye'){eye=+t.value;draw();return true}if(t.id==='rLen'){len=+t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
