/* Rai Plus content pack: Class 9 Science, Chapter 10 – Work and Energy (rationalised NCERT). Bilingual: Hindi terms alongside. */
RP.register({key:'9sci10',cls:'9',subject:'Science',ch:'10',title:"Work and Energy",color:'#b35a14',
crumb:"HBSE Class 9 Science · कार्य तथा ऊर्जा · Taught in December",h1:"Chapter 10: Work and Energy · कार्य तथा ऊर्जा",sub:"Work done by a force, forms of energy, kinetic and potential energy, conservation of energy, power and the commercial unit of energy.",heroLabel:"A ball trading height for speed",labName:'Energy lab',
theme:"\n:root{--g:light-dark(#b35a14,#f2a86a);--g2:light-dark(#fbefe4,#2a170a);--line:light-dark(#f0dcc8,#4a321e);--bg:light-dark(#ffffff,#140d07);--card:light-dark(#ffffff,#1c130b);\n--ink:light-dark(#2d1a0a,#f6eadf);--mute:light-dark(#6a503c,#d1bca8);--y:light-dark(#1f5f8b,#8cc4ea);--y2:light-dark(#eaf3fa,#081520);--hd:#7d3d0d}\n",
labHTML:`  <h2>Energy lab · ऊर्जा प्रयोगशाला</h2>
  <p><b>Falling ball:</b> drop a ball and watch potential energy turn into kinetic energy while the total stays the same (ignoring air). <b>Electricity bill:</b> set how long appliances run each day and find the units (kWh) and the monthly bill.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="enSvg" viewBox="0 0 520 330" role="img" aria-label="Energy experiment" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Experiment<select id="enM"><option value="d">Falling ball: PE ↔ KE</option><option value="b">Electricity bill · बिजली का बिल</option></select></label></div>
  <div id="enD"><div class="ctrl"><label><span>Mass: <b id="enMv"></b> kg</span><input type="range" class="enS" id="enMs" min="1" max="10" value="2"></label></div>
  <div class="ctrl"><label><span>Height: <b id="enHv"></b> m</span><input type="range" class="enS" id="enH" min="5" max="50" step="5" value="20"></label></div>
  <div class="ctrl"><button class="btn p" id="enGo">Drop</button> <button class="btn" id="enR">Reset</button></div></div>
  <div id="enB" style="display:none"></div>
  <div class="box y" id="enOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#b35a14',LABNAME='Energy lab',MIND_CENTER='Energy · ऊर्जा';
const OR='#b35a14',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',RD='#c0392b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const arrow=(x1,y1,x2,y2,c=OR,w=3)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" marker-end="url(#ah)"/>`;
const blk=(x,y,w,h,c,t='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${c}" fill-opacity=".25" stroke="${c}" stroke-width="2"/>`+(t?T(x+w/2,y+h/2+5,t,'font-size="13" font-weight="700"'):'');
function heroDraw(){return `<path d="M30 30 Q170 160 320 40" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 6"/><circle cx="40" cy="38" r="12" fill="#fff"/><circle cx="175" cy="96" r="12" fill="#fff" opacity=".6"/><circle cx="310" cy="48" r="12" fill="#fff" opacity=".35"/>`}
const HERO=heroDraw;
const MIND=[['Work · कार्य',100,50],['Forms of energy',420,50],['Kinetic energy',90,150],['Potential energy',430,150],['Conservation',110,250],['Power & kWh',410,250]];

const C=[
{id:'e1',num:'10.1',title:'Work · कार्य',
 intro:'You push a wall with all your strength for ten minutes. You are tired — but have you done any work?',
 obj:'Define work scientifically and calculate it; identify positive, negative and zero work.',
 prior:'Chapter 8: force.',
 simple:'In science, work (कार्य) is done when a force moves an object in the direction of the force. Work = force × displacement in the direction of the force: W = F × s. SI unit: joule (J) — 1 J is the work done when 1 N moves an object 1 m. Pushing a wall that does not move: no work.',
 detail:'Positive work: force and displacement in the same direction (lifting a bag upward, pulling a cart forward). Negative work: force opposite to displacement (friction on a sliding box, brakes). Zero work: no displacement, or force perpendicular to displacement — carrying a bag while walking horizontally (gravity does no work), the Moon in a circular orbit.',
 real:'A porter climbing stairs with a load does work against gravity; walking on flat ground with it, gravity does no work.',
 apply:'A force of 7 N moves a book 8 m along the force. How much work is done?',
 see:{w:520,h:200,f:[
  ['Force on a box.',blk(80,90,70,50,OR,'box')+arrow(30,115,78,115,RD)+lbl(50,103,'F')],
  ['Box moves s metres.',blk(330,90,70,50,OR,'box')+`<line x1="115" y1="160" x2="365" y2="160" stroke="${BL}" stroke-width="2" marker-end="url(#ah)"/>`+lbl(240,180,'s','fill="'+BL+'"')],
  ['W = F × s.',lbl(260,40,'W = F × s  (joule, J)','font-size="18" font-weight="700" fill="'+OR+'"')]]},
 seeNote:'No movement, no work.',
 do:{title:'Work or not?',mat:'Bag, table, wall',steps:['Push the wall; lift the bag; carry the bag along the corridor.','Decide where work is done by you against gravity.'],obs:'Only lifting does work against gravity.',why:'Displacement along force.',lab:false},
 memo:'"No move, no work."',
 miscon:['"Tiredness means work is done." Work needs displacement in the direction of force.'],
 terms:['Work · कार्य','Joule (J) · जूल','Positive work','Negative work','Zero work'],
 q:{q:'Work done when 10 N moves an object 3 m along it:',o:['13 J','30 J','3.3 J','7 J'],a:1,why:'10 × 3.'},
 exam:'Work numericals; positive/negative/zero: 2–3 marks.'},

{id:'e2',num:'10.2',title:'Energy and its forms · ऊर्जा के रूप',
 intro:'A stretched bow, a moving cricket ball and a lump of coal all have something in common. What?',
 obj:'Define energy and list its forms.',
 prior:'10.1.',
 simple:'Energy (ऊर्जा) is the capacity to do work. An object with energy can exert a force on another object and make it move. Energy is measured in joules, like work. 1 kJ = 1000 J.',
 detail:'Forms of energy: mechanical (kinetic + potential), heat, chemical, electrical, light, sound and nuclear. The Sun is the biggest natural source of energy for us. Energy changes from one form to another: food (chemical) → muscles (mechanical); a bulb (electrical → light + heat); a fan (electrical → mechanical).',
 real:'A hydroelectric dam like Bhakra Nangal turns the potential energy of stored water into electrical energy.',
 apply:'Name the energy changes in a torch, a solar cell and a microphone.',
 see:{w:520,h:200,f:[
  ['Forms of energy.',['Kinetic','Potential','Heat','Chemical'].map((t,i)=>blk(20+i*125,40,110,40,[OR,BL,RD,GN][i],t)).join('')],
  ['More forms.',['Electrical','Light','Sound','Nuclear'].map((t,i)=>blk(20+i*125,100,110,40,[PU,'#c9a227',GR,RD][i],t)).join('')],
  ['They convert.',lbl(260,180,'energy changes form: electrical → light + heat (bulb)','font-weight="700"')]]},
 seeNote:'Many forms, one quantity.',
 do:{title:'Energy chain',mat:'Chart paper',steps:['Trace the energy of a cooked meal back to the Sun.'],obs:'Sun → plants → food → you.',why:'Transformation.',lab:false},
 memo:'"Energy = ability to do work."',
 miscon:['"Energy gets used up and disappears." It changes form; it is not destroyed.'],
 terms:['Energy · ऊर्जा','Mechanical energy · यांत्रिक ऊर्जा','Transformation · रूपांतरण','kJ'],
 q:{q:'In an electric fan, electrical energy mainly becomes:',o:['light','sound','mechanical (kinetic)','chemical'],a:2,why:'Blades move.'},
 exam:'Energy conversions: 1–2 marks.'},

{id:'e3',num:'10.3',title:'Kinetic energy · गतिज ऊर्जा',
 intro:'Why does a car crash at 80 km/h cause about four times the damage of one at 40 km/h?',
 obj:'Derive and use KE = ½mv².',
 prior:'10.1; equations of motion.',
 simple:'Kinetic energy (गतिज ऊर्जा) is the energy an object has because of its motion. KE = ½ m v². Doubling the mass doubles the KE; doubling the speed makes the KE four times.',
 detail:'Derivation: work done to accelerate mass m from rest by force F over distance s: W = F s = m a s, and v² = 2as gives W = ½ m v². So KE equals the work needed to bring the object to that speed from rest. Changing speed from u to v: work done = ½ m v² − ½ m u² (work–energy relation).',
 real:'Speed limits near schools are low because KE, and so crash damage, grows with the square of speed.',
 apply:'A 1500 kg car moves at 60 km/h. Find its kinetic energy and the work needed to stop it.',
 see:{w:520,h:200,f:[
  ['KE = ½mv².',lbl(260,40,'KE = ½ m v²','font-size="22" font-weight="700" fill="'+OR+'"')],
  ['Double the mass → double KE.',lbl(130,110,'2m → 2 × KE','font-size="16" fill="'+BL+'"')],
  ['Double the speed → four times KE.',lbl(390,110,'2v → 4 × KE','font-size="16" fill="'+RD+'"')+lbl(260,170,'speed matters most!','font-weight="700"')]]},
 seeNote:'Speed squared.',
 do:{title:'Marble crater',mat:'Tray of flour, marbles of two sizes',steps:['Drop marbles from different heights.','Compare crater sizes.'],obs:'Faster, heavier → bigger crater.',why:'More KE.',lab:false},
 memo:'"Half m v squared."',
 miscon:['"Double speed, double KE." It becomes four times.'],
 terms:['Kinetic energy · गतिज ऊर्जा','½mv²','Work–energy theorem'],
 q:{q:'KE of 2 kg at 3 m/s:',o:['3 J','6 J','9 J','18 J'],a:2,why:'½ × 2 × 9.'},
 exam:'Derive KE; numericals: 3 marks.'},

{id:'e4',num:'10.4',title:'Potential energy · स्थितिज ऊर्जा',
 intro:'Water stored high in a dam can light up a city. Where is its energy hiding?',
 obj:'Define potential energy and use PE = mgh.',
 prior:'10.3; weight.',
 simple:'Potential energy (स्थितिज ऊर्जा) is energy stored in an object because of its position or shape. Gravitational PE of a mass m raised to height h: PE = m g h. A stretched rubber band or a wound spring has elastic PE.',
 detail:'Work done against gravity to lift a mass m by height h = weight × height = m g h, which is stored as PE. It depends only on the vertical height, not on the path taken. A 10 kg object raised 6 m (g = 9.8 m/s²) gains 588 J.',
 real:'A catapult (gulel) stores elastic potential energy in its stretched rubber.',
 apply:'Find the energy stored in a 2 kg bucket of water lifted 10 m up to a tank (g = 10 m/s²).',
 see:{w:520,h:220,f:[
  ['Ground level.',`<line x1="40" y1="190" x2="480" y2="190" stroke="${GR}" stroke-width="3"/>`+blk(130,150,50,40,BL,'m')],
  ['Lift it up h.',blk(330,50,50,40,BL,'m')+`<line x1="420" y1="90" x2="420" y2="190" stroke="${OR}" stroke-width="2" marker-end="url(#ah)"/><line x1="420" y1="190" x2="420" y2="90" stroke="${OR}" stroke-width="2" marker-end="url(#ah)"/>`+lbl(440,145,'h','fill="'+OR+'"')],
  ['PE = mgh.',lbl(200,40,'PE = m g h','font-size="20" font-weight="700" fill="'+OR+'"')]]},
 seeNote:'Height stores energy.',
 do:{title:'Ramp race',mat:'Toy car, ramp, books',steps:['Release the car from 1, 2 and 3 book heights.','Measure how far it travels.'],obs:'Higher start → farther.',why:'More PE → more KE.',lab:false},
 memo:'"m g h: mass, gravity, height."',
 miscon:['"PE depends on the path taken." It depends only on the height difference.'],
 terms:['Potential energy · स्थितिज ऊर्जा','mgh','Elastic potential energy'],
 q:{q:'PE of 5 kg at 4 m (g = 10):',o:['20 J','200 J','50 J','9 J'],a:1,why:'5 × 10 × 4.'},
 exam:'PE numericals: 2 marks.'},

{id:'e5',num:'10.5',title:'Conservation of energy · ऊर्जा संरक्षण',
 intro:'A ball dropped from a height speeds up as it falls. Where does its extra kinetic energy come from?',
 obj:'State the law of conservation of energy and apply it to free fall.',
 prior:'10.3, 10.4.',
 simple:'Law of conservation of energy (ऊर्जा संरक्षण का नियम): energy can neither be created nor destroyed; it can only be changed from one form to another. The total energy before and after a transformation stays the same. For a freely falling object, PE + KE = constant (ignoring air resistance).',
 detail:'At the top: all PE (mgh), KE = 0. Halfway: half PE, half KE. Just before the ground: PE = 0, KE = mgh, so ½mv² = mgh → v = √(2gh). In real life, some energy turns into heat and sound due to friction and air resistance, but the total is still conserved. A swinging pendulum keeps exchanging PE and KE.',
 real:'A roller coaster car is pulled to the top once; then its PE and KE keep trading for the rest of the ride.',
 apply:'A 1 kg ball falls from 20 m. Find its PE at the top and its speed just before hitting the ground (g = 10).',
 see:{w:520,h:230,f:[
  ['At the top: all PE.',`<circle cx="120" cy="40" r="12" fill="${OR}"/>`+`<rect x="300" y="30" width="${180}" height="16" fill="${BL}"/>`+lbl(250,43,'top')],
  ['Halfway: half and half.',`<circle cx="120" cy="115" r="12" fill="${OR}" opacity=".7"/>`+`<rect x="300" y="105" width="90" height="16" fill="${BL}"/><rect x="390" y="105" width="90" height="16" fill="${RD}"/>`+lbl(250,118,'middle')],
  ['Bottom: all KE.',`<circle cx="120" cy="190" r="12" fill="${OR}" opacity=".5"/>`+`<rect x="300" y="180" width="180" height="16" fill="${RD}"/>`+lbl(250,193,'bottom')+lbl(345,222,'PE','fill="'+BL+'"')+lbl(440,222,'KE','fill="'+RD+'"')]]},
 seeNote:'Total stays the same.',
 do:{title:'Pendulum',mat:'String, bob, stand',steps:['Pull the bob aside and release.','Note highest and lowest points.'],obs:'Fastest at the bottom, stops at the ends.',why:'PE ↔ KE.',lab:true},
 memo:'"Energy only changes clothes."',
 miscon:['"A falling ball creates kinetic energy." It converts its PE into KE.'],
 terms:['Conservation of energy · ऊर्जा संरक्षण','Mechanical energy','v = √(2gh)'],
 q:{q:'For a freely falling body, which stays constant?',o:['PE','KE','PE + KE','speed'],a:2,why:'Conservation.'},
 exam:'Show conservation in free fall: 3–5 marks.'},

{id:'e6',num:'10.6',title:'Power and the commercial unit · शक्ति',
 intro:'Two students climb the same staircase. One takes 10 s, the other 20 s. Who did more work? Who was more powerful?',
 obj:'Define power and calculate electrical energy in kWh.',
 prior:'10.1.',
 simple:'Power (शक्ति) is the rate of doing work: P = W ÷ t. SI unit: watt (W) = 1 J/s. 1 kW = 1000 W. Both students did the same work, but the faster one had twice the power.',
 detail:'Average power = total energy used ÷ total time. Commercial unit of energy: kilowatt hour (kWh) = energy used by a 1 kW device in 1 hour = 3.6 × 10⁶ J. One "unit" on an electricity bill is 1 kWh. Example: a 100 W bulb used 10 hours a day for 30 days = 0.1 × 10 × 30 = 30 kWh.',
 real:'BEE star labels on fans and ACs tell how efficiently they use power.',
 apply:'An electric iron of 1000 W is used 30 minutes a day. Find the units used in 30 days.',
 see:{w:520,h:200,f:[
  ['P = W ÷ t.',lbl(260,40,'P = W ÷ t  (watt, W)','font-size="18" font-weight="700" fill="'+OR+'"')],
  ['1 kWh.',lbl(260,95,'1 kWh = 1000 W × 3600 s = 3.6 × 10⁶ J','font-size="15" fill="'+BL+'"')],
  ['Bill units.',lbl(260,150,'100 W × 10 h × 30 days = 30 kWh = 30 units','font-size="15" fill="'+GN+'"')]]},
 seeNote:'Faster work = more power.',
 do:{title:'Stair power',mat:'Stopwatch, measuring tape',steps:['Measure stair height; time yourself climbing.','P = m g h ÷ t.'],obs:'A few hundred watts.',why:'Power.',lab:false},
 memo:'"Power is work per second; units are kWh."',
 miscon:['"kWh is a unit of power." It is a unit of energy.'],
 terms:['Power · शक्ति','Watt (W) · वाट','Kilowatt hour (kWh)','Unit (electricity)'],
 q:{q:'1 kWh =',o:['1000 J','3.6 × 10⁶ J','3600 J','60 J'],a:1,why:'1000 × 3600.'},
 exam:'Power and kWh numericals: 2–3 marks.'}
];

const CARDS=[['Work · कार्य','W = F × s; joule.'],['Zero work','No displacement or force ⊥ motion.'],['Negative work','Force opposite to motion (friction).'],['Energy · ऊर्जा','Capacity to do work; J.'],['Kinetic energy','½ m v².'],['Potential energy','m g h.'],['Conservation','Energy changes form; total constant.'],['Free fall','PE + KE constant; v = √(2gh).'],['Power · शक्ति','P = W ÷ t; watt.'],['kWh','3.6 × 10⁶ J = 1 unit.']];

const Q=[
 {lv:1,q:'SI unit of work:',o:['watt','joule','newton','pascal'],a:1,w:'N m.'},
 {lv:1,q:'Energy due to motion is:',o:['potential','kinetic','chemical','nuclear'],a:1,w:'Definition.'},
 {lv:1,q:'1 watt =',o:['1 J/s','1 N m','1 J s','1 kWh'],a:0,w:'Definition.'},
 {lv:2,q:'Work done by gravity on a satellite in circular orbit:',o:['positive','negative','zero','infinite'],a:2,w:'Force ⊥ motion.'},
 {lv:2,q:'If speed doubles, KE becomes:',o:['double','four times','half','same'],a:1,w:'v².'},
 {lv:2,q:'PE of 2 kg at 5 m (g = 10):',o:['10 J','100 J','50 J','7 J'],a:1,w:'2 × 10 × 5.'},
 {lv:3,q:'A 60 kg student climbs 5 m in 10 s (g = 10). Power:',o:['300 W','3000 W','30 W','600 W'],a:0,w:'3000 J ÷ 10.'},
 {lv:3,q:'A 2 kW heater runs 3 h. Energy used:',o:['6 kWh','0.67 kWh','5 kWh','6000 kWh'],a:0,w:'2 × 3.'},
 {lv:4,q:'A ball dropped from 45 m reaches the ground at (g = 10):',o:['30 m/s','45 m/s','15 m/s','90 m/s'],a:0,w:'√(2 × 10 × 45).'},
 {lv:4,q:'Work needed to raise a car\'s speed from 10 to 20 m/s (m = 1000 kg):',o:['150 kJ','50 kJ','200 kJ','100 kJ'],a:0,w:'½ × 1000 × (400 − 100).'},
 {lv:5,open:true,m:3,q:'Derive the expression for the kinetic energy of an object of mass m moving with velocity v.',ans:['W = F s = m a s (1)','v² − 0 = 2as → as = v²/2 (1)','W = ½ m v² = KE (1)']},
 {lv:5,open:true,m:5,q:'Show that the total mechanical energy of a freely falling body remains constant. Take m = 2 kg, h = 20 m, g = 10 m/s², and calculate PE and KE at the top, at 10 m, and at the ground.',ans:['Top: PE 400 J, KE 0 (1)','At 10 m: PE 200 J (1)','v² = 2 × 10 × 10 → KE = 200 J (1)','Ground: PE 0, KE 400 J (1)','Total 400 J throughout (1)']}
];

const ONEMIN=['W = F s; positive, negative, zero.','Energy: capacity to do work; many forms.','KE = ½mv².','PE = mgh.','Conservation: PE + KE constant.','Power P = W/t; 1 kWh = 3.6 MJ.'];
const KEYS=[['work',/work|कार्य/i],['energy',/energy|ऊर्जा/i],['kinetic',/kinetic|½ ?m ?v|गतिज/i],['potential',/potential|mgh|स्थितिज/i],['conservation',/conserv|संरक्षण/i],['power',/power|watt|kWh|शक्ति/i]];

/* ---------- lab ---------- */
const APP=[['LED bulb',9,6,'💡'],['Ceiling fan',75,10,'🌀'],['Television',100,4,'📺'],['Refrigerator',150,24,'🧊'],['Electric iron',1000,.5,'👕'],['Water heater (geyser)',2000,1,'🚿'],['Air conditioner',1500,0,'❄️']];
let mode='d',m=2,H=20,t=0,run=false,last=0,looping=false,wired=false,hrs=APP.map(a=>a[2]),rate=7;
const g=9.8,fallT=()=>Math.sqrt(2*H/g);
function drawD(){const tt=Math.min(t,fallT()),y=H-.5*g*tt*tt,v=g*tt,PE=m*g*y,KE=.5*m*v*v,TOT=m*g*H;let s='';
 const Y=hh=>290-hh/50*250;s+=`<line x1="40" y1="290" x2="240" y2="290" stroke="${GR}" stroke-width="3"/><line x1="70" y1="290" x2="70" y2="${Y(H)}" stroke="${GR}" stroke-dasharray="4 4"/>`+T(52,Y(H)+4,H+' m','font-size="11"');
 for(let k=0;k<=50;k+=10)s+=`<line x1="66" y1="${Y(k)}" x2="74" y2="${Y(k)}" stroke="${GR}"/>`;
 s+=`<circle cx="150" cy="${Y(y)-10}" r="${8+m}" fill="${OR}"/>`+(v>0.5?arrow(180,Y(y)-14,180,Y(y)-14+Math.min(60,v*2),RD,2.5):'');
 const bx=300,bw=50,bh=230,sc=bh/TOT;const bar=(x,val,c,lab)=>`<rect x="${x}" y="${290-val*sc}" width="${bw}" height="${val*sc}" fill="${c}" fill-opacity=".8" rx="4"/>`+T(x+bw/2,305,lab,'font-size="12" font-weight="700"')+T(x+bw/2,285-val*sc,Math.round(val)+' J','font-size="11"');
 s+=bar(bx,PE,BL,'PE')+bar(bx+70,KE,RD,'KE')+bar(bx+140,PE+KE,PU,'Total');
 $('#enSvg').innerHTML=s;$('#enMv').textContent=m;$('#enHv').textContent=H;$('#enGo').textContent=run?'Pause':t>=fallT()?'Done':'Drop';
 $('#enOut').innerHTML=`<p>Height <b>${y.toFixed(1)} m</b> · speed <b>${v.toFixed(1)} m/s</b></p><p>PE = mgh = ${m} × 9.8 × ${y.toFixed(1)} = <b>${PE.toFixed(0)} J</b> · KE = ½mv² = <b>${KE.toFixed(0)} J</b></p><p>Total = <b>${(PE+KE).toFixed(0)} J</b> — the same as at the start (${TOT.toFixed(0)} J). ${t>=fallT()?`Landing speed √(2gh) = ${Math.sqrt(2*g*H).toFixed(1)} m/s.`:''}</p>`;return t>=fallT()}
function drawB(){const box=$('#enB');if(box&&!box.dataset.built){box.dataset.built='1';box.innerHTML=APP.map((a,i)=>`<div class="ctrl"><label><span>${a[3]} ${a[0]} (${a[1]} W): <b id="enA${i}v">${a[2]}</b> h/day</span><input type="range" class="enS" id="enA${i}" min="0" max="24" step="0.5" value="${a[2]}"></label></div>`).join('')}
 const kwh=APP.map((a,i)=>a[1]*hrs[i]/1000);const day=kwh.reduce((p,q)=>p+q,0),mon=day*30;let s='';const mx=Math.max(1,...kwh.map(k=>k*30));
 APP.forEach((a,i)=>{const w=kwh[i]*30/mx*260,y=30+i*38;s+=T(110,y+18,a[3]+' '+a[0],'font-size="12"')+`<rect x="200" y="${y+4}" width="${w}" height="22" rx="5" fill="${OR}" fill-opacity=".7"/>`+T(200+w+30,y+20,(kwh[i]*30).toFixed(1),'font-size="11"')});
 s+=T(330,310,`${mon.toFixed(0)} units/month × ₹${rate} = ₹${(mon*rate).toFixed(0)}`,'font-size="16" font-weight="700" fill="'+OR+'"');$('#enSvg').innerHTML=s;
 $('#enOut').innerHTML=`<p>Units per day = Σ(power in kW × hours) = <b>${day.toFixed(2)} kWh</b>.</p><p>Monthly (30 days): <b>${mon.toFixed(0)} units</b>; at ₹${rate} per unit the bill is about <b>₹${(mon*rate).toFixed(0)}</b>.</p><p>High-power devices used even briefly (geyser, iron, AC) add up quickly.</p>`}
function draw(){$('#enD').style.display=mode==='d'?'':'none';$('#enB').style.display=mode==='b'?'':'none';return mode==='d'?drawD():(drawB(),false)}
function loop(ts){if(!$('#enSvg')||!$('#enSvg').isConnected||($('#v-lab')&&$('#v-lab').hidden)){looping=false;return}const dt=last?Math.min(.05,(ts-last)/1000):0;last=ts;if(run){t+=dt*.6;if(draw())run=false}if(run)requestAnimationFrame(loop);else{looping=false;draw()}}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const el=e.target;if(!el||!el.classList||!el.classList.contains('enS'))return;const v=+el.value;if(el.id==='enMs')m=v;else if(el.id==='enH')H=v;else{const i=+el.id.slice(3);hrs[i]=v;$('#enA'+i+'v').textContent=v}if(el.id==='enMs'||el.id==='enH'){t=0;run=false}draw()})}
function labClick(b){if(b.id==='enGo'){if(t>=fallT())return true;run=!run;if(run&&!looping){looping=true;last=0;requestAnimationFrame(loop)}draw();return true}if(b.id==='enR'){t=0;run=false;draw();return true}return false}
function labChange(el){if(el.id==='enM'){mode=el.value;run=false;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
