/* Rai Plus content pack: Class 9 Science, Chapter 8 – Force and Laws of Motion (rationalised NCERT). Bilingual: Hindi terms alongside. */
RP.register({key:'9sci08',cls:'9',subject:'Science',ch:'8',title:"Force and Laws of Motion",color:'#b04a1f',
crumb:"HBSE Class 9 Science · बल तथा गति के नियम · Taught in October",h1:"Chapter 8: Force and Laws of Motion · बल तथा गति के नियम",sub:"Balanced and unbalanced forces, inertia and Newton's first law, momentum, the second law F = ma, action and reaction, and conservation of momentum.",heroLabel:"Two trolleys colliding",labName:'Force & collision lab',
theme:"\n:root{--g:light-dark(#b04a1f,#f2a77f);--g2:light-dark(#fbefe9,#21110a);--line:light-dark(#f0d6c8,#4a2a1a);--bg:light-dark(#ffffff,#140c08);--card:light-dark(#ffffff,#1c120c);\n--ink:light-dark(#2d160a,#f6e8df);--mute:light-dark(#6a4c3c,#d1b8a8);--y:light-dark(#1f5f8b,#8cc4ea);--y2:light-dark(#eaf3fa,#081520);--hd:#7d3d1d}\n",
labHTML:`  <h2>Force &amp; collision lab · बल और संघट्ट प्रयोगशाला</h2>
  <p><b>F = ma:</b> push a trolley with a force and see how its mass decides the acceleration. <b>Collision:</b> two trolleys stick together when they collide. Compare the total momentum before and after.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="fcSvg" viewBox="0 0 520 320" role="img" aria-label="Force and collision" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Experiment<select id="fcM"><option value="f">Second law: F = ma</option><option value="c">Collision: momentum conserved</option></select></label></div>
  <div id="fcF"><div class="ctrl"><label><span>Force F: <b id="fcFv"></b> N</span><input type="range" class="fcS" id="fcFo" min="0" max="20" value="10"></label></div>
  <div class="ctrl"><label><span>Mass m: <b id="fcMv"></b> kg</span><input type="range" class="fcS" id="fcMa" min="1" max="10" value="2"></label></div></div>
  <div id="fcC" style="display:none"><div class="ctrl"><label><span>Trolley A: <b id="fcAmv"></b> kg at <b id="fcAuv"></b> m/s</span><input type="range" class="fcS" id="fcAm" min="1" max="6" value="2"><input type="range" class="fcS" id="fcAu" min="0" max="6" value="4"></label></div>
  <div class="ctrl"><label><span>Trolley B: <b id="fcBmv"></b> kg at <b id="fcBuv"></b> m/s</span><input type="range" class="fcS" id="fcBm" min="1" max="6" value="2"><input type="range" class="fcS" id="fcBu" min="-4" max="2" value="0"></label></div></div>
  <div class="ctrl"><button class="btn p" id="fcGo">Go</button> <button class="btn" id="fcR">Reset</button></div>
  <div class="box y" id="fcOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#b04a1f',LABNAME='Force & collision lab',MIND_CENTER='Force · बल';
const OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',RD='#c0392b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const arrow=(x1,y1,x2,y2,c=OR,w=3)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" marker-end="url(#ah)"/>`;
const blk=(x,y,w,h,c,t='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${c}" fill-opacity=".25" stroke="${c}" stroke-width="2"/>`+(t?T(x+w/2,y+h/2+5,t,'font-size="13" font-weight="700"'):'');
const trolley=(x,y,w,c,t)=>`<rect x="${x}" y="${y-30}" width="${w}" height="26" rx="5" fill="${c}" fill-opacity=".3" stroke="${c}" stroke-width="2"/><circle cx="${x+10}" cy="${y}" r="5" fill="${ink}"/><circle cx="${x+w-10}" cy="${y}" r="5" fill="${ink}"/>`+T(x+w/2,y-12,t,'font-size="12" font-weight="700"');
function heroDraw(){return `<rect x="40" y="70" width="80" height="34" rx="6" fill="#fff" opacity=".9"/><rect x="220" y="70" width="80" height="34" rx="6" fill="#fff" opacity=".6"/><path d="M130 87 h60" stroke="#fff" stroke-width="4"/><path d="M180 77 l14 10 l-14 10" fill="none" stroke="#fff" stroke-width="4"/><line x1="20" y1="114" x2="330" y2="114" stroke="#fff" stroke-width="2"/>`}
const HERO=heroDraw;
const MIND=[['Balanced forces',100,50],['First law & inertia',420,50],['Momentum · संवेग',90,150],['Second law: F = ma',430,150],['Third law',110,250],['Conservation',410,250]];

const C=[
{id:'f1',num:'8.1',title:'Balanced and unbalanced forces · संतुलित और असंतुलित बल',
 intro:'Two teams pull a rope in a tug of war. Why does nothing move at first, then suddenly one team wins?',
 obj:'Distinguish balanced and unbalanced forces and their effects.',
 prior:'Class 8: force and pressure, friction.',
 simple:'A force (बल) is a push or pull. It can change an object\'s speed, direction of motion or shape. When forces on an object cancel out (equal and opposite), they are balanced (संतुलित) — the motion does not change. When they do not cancel, there is an unbalanced (असंतुलित) net force, which changes the object\'s velocity — it accelerates.',
 detail:'A box at rest stays at rest if your push is balanced by friction. Push harder and the net force becomes unbalanced; the box moves. To keep a bicycle moving at constant speed, you pedal to balance friction — no net force is needed for constant velocity. An unbalanced force is needed to change velocity.',
 real:'A car moving at constant speed on a highway has its engine force balanced by friction and air drag.',
 apply:'A box is pushed with 50 N and friction is 50 N. Is the force balanced? What happens if the push becomes 70 N?',
 see:{w:520,h:200,f:[
  ['Equal and opposite.',blk(210,80,100,60,GR,'box')+arrow(210,110,140,110,BL)+arrow(310,110,380,110,BL)+lbl(170,98,'50 N')+lbl(350,98,'50 N')],
  ['Balanced: no change.',lbl(260,170,'balanced → no change in motion','fill="'+BL+'"')],
  ['Make one bigger: unbalanced.',arrow(310,110,440,110,OR,5)+lbl(400,132,'70 N','fill="'+OR+'"')+lbl(260,40,'unbalanced → accelerates towards the larger force','font-weight="700" fill="'+OR+'"')]]},
 seeNote:'Net force decides.',
 do:{title:'Rubber-band tug',mat:'Small block, two spring balances',steps:['Pull equally from both sides.','Increase one pull.'],obs:'Moves only when unequal.',why:'Net force.',lab:false},
 memo:'"Balanced = no change; unbalanced = change."',
 miscon:['"A moving object always needs a net force." Constant velocity needs zero net force.'],
 terms:['Force · बल','Balanced forces · संतुलित बल','Unbalanced force · असंतुलित बल','Net force · परिणामी बल','Friction · घर्षण'],
 q:{q:'If balanced forces act on a moving ball, it:',o:['stops','keeps the same velocity','speeds up','turns'],a:1,why:'No net force.'},
 exam:'Balanced vs unbalanced: 2 marks.'},

{id:'f2',num:'8.2',title:"Newton's first law and inertia · जड़त्व",
 intro:'Why do you lurch forward when a bus brakes suddenly?',
 obj:"State Newton's first law and explain inertia with examples.",
 prior:'8.1.',
 simple:"Newton's first law (गति का पहला नियम): an object remains in a state of rest or of uniform motion in a straight line unless compelled to change that state by an applied unbalanced force. This tendency to resist change is inertia (जड़त्व). So the first law is also called the law of inertia. Mass is a measure of inertia — heavier objects have more inertia.",
 detail:'Galileo showed with inclined planes that, without friction, a ball would roll on forever. Examples: passengers fall forward when a bus stops (their bodies keep moving) and backward when it starts; dust falls out of a beaten carpet; a coin on a card over a glass drops into the glass when the card is flicked. Seat belts protect against inertia of motion.',
 real:'Seat belts stop your body continuing forward when the car stops suddenly.',
 apply:'Why is it harder to push a loaded truck than an empty one?',
 see:{w:520,h:200,f:[
  ['A bus moving.',`<rect x="80" y="70" width="240" height="80" rx="12" fill="${BL}" fill-opacity=".15" stroke="${BL}" stroke-width="2"/><circle cx="130" cy="155" r="12" fill="${ink}"/><circle cx="270" cy="155" r="12" fill="${ink}"/><circle cx="200" cy="95" r="10" fill="${OR}"/><line x1="200" y1="105" x2="200" y2="135" stroke="${OR}" stroke-width="4"/>`],
  ['Brakes!',lbl(390,110,'STOP','font-size="20" font-weight="700" fill="'+RD+'"')],
  ['The passenger keeps moving.',`<line x1="200" y1="105" x2="222" y2="132" stroke="${OR}" stroke-width="4"/>`+arrow(212,92,260,92,OR)+lbl(260,40,'inertia of motion → lurch forward','font-weight="700"')]]},
 seeNote:'Bodies resist change.',
 do:{title:'Coin and card',mat:'Glass, playing card, coin',steps:['Place the card on the glass, coin on the card.','Flick the card sharply.'],obs:'Coin drops into the glass.',why:'Inertia of rest.',lab:true},
 memo:'"Things keep doing what they are doing."',
 miscon:['"Objects stop naturally." They stop because of friction; without it, they would keep going.'],
 terms:["Newton's first law · पहला नियम",'Inertia · जड़त्व','Inertia of rest','Inertia of motion'],
 q:{q:'Mass is a measure of:',o:['speed','inertia','force','momentum'],a:1,why:'More mass, more inertia.'},
 exam:'Inertia examples: 2 marks.'},

{id:'f3',num:'8.3',title:'Momentum · संवेग',
 intro:'A cricket ball and a table-tennis ball come at you at the same speed. Which would you rather catch?',
 obj:'Define momentum and calculate it.',
 prior:'8.2; velocity.',
 simple:'Momentum (संवेग) p of an object is the product of its mass and velocity: p = mv. Its SI unit is kg m/s. It has direction (same as velocity). A heavy or fast object has large momentum and needs a larger force or longer time to stop.',
 detail:'A 0.16 kg cricket ball at 25 m/s: p = 4 kg m/s. A 0.003 kg table-tennis ball at 25 m/s: p = 0.075 kg m/s. A bullet has small mass but huge velocity, so large momentum. A truck moving slowly can still have large momentum because of its mass.',
 real:'Heavy trucks need much longer distances to stop than cars at the same speed.',
 apply:'Find the momentum of a 1000 kg car moving at 72 km/h.',
 see:{w:520,h:200,f:[
  ['p = m × v.',lbl(260,50,'p = m × v','font-size="22" font-weight="700" fill="'+OR+'"')],
  ['Cricket ball.',`<circle cx="130" cy="110" r="16" fill="${RD}"/>`+lbl(130,150,'0.16 kg × 25 m/s = 4 kg m/s')],
  ['Table-tennis ball.',`<circle cx="390" cy="110" r="10" fill="#f4f4f4" stroke="${GR}"/>`+lbl(390,150,'0.003 × 25 = 0.075 kg m/s')]]},
 seeNote:'Mass and velocity together.',
 do:{title:'Catch it',mat:'Tennis ball, cricket ball (soft throw)',steps:['Catch each thrown gently at similar speed.','Compare the "sting".'],obs:'Heavier ball harder to stop.',why:'Larger momentum.',lab:false},
 memo:'"Momentum = mass in motion."',
 miscon:['"Only fast things have large momentum." Heavy slow things can too.'],
 terms:['Momentum · संवेग','kg m/s'],
 q:{q:'Momentum of 5 kg at 4 m/s:',o:['1.25','9','20','0.8'],a:2,why:'5 × 4 kg m/s.'},
 exam:'Momentum numericals: 1–2 marks.'},

{id:'f4',num:'8.4',title:'Second law: F = ma · गति का दूसरा नियम',
 intro:'Why do cricketers pull their hands back while catching a fast ball?',
 obj:"State Newton's second law and use F = ma.",
 prior:'8.3.',
 simple:"Newton's second law: the rate of change of momentum of an object is proportional to the applied unbalanced force, in the direction of the force. This gives F = ma (force = mass × acceleration). SI unit of force: newton (N) — 1 N is the force that gives 1 kg an acceleration of 1 m/s².",
 detail:'F = m(v − u)/t = (mv − mu)/t: force is the change of momentum per unit time. For a given change in momentum, a longer time means a smaller force — so a fielder pulls hands back, high jumpers land on soft mattresses, and cars have crumple zones. A karate expert breaks a slab by delivering momentum in a very short time (large force).',
 real:'Air bags in cars increase the time over which your momentum is stopped, reducing the force.',
 apply:'What force is needed to accelerate a 1200 kg car at 2 m/s²?',
 see:{w:520,h:200,f:[
  ['Same force, small mass.',blk(80,60,60,40,BL,'1 kg')+arrow(40,80,78,80,OR)+arrow(150,80,230,80,GN)+lbl(190,70,'big a','fill="'+GN+'"')],
  ['Same force, large mass.',blk(80,130,110,50,BL,'5 kg')+arrow(40,155,78,155,OR)+arrow(200,155,230,155,GN)+lbl(220,145,'small a','fill="'+GN+'"')],
  ['F = ma.',lbl(390,110,'F = ma','font-size="28" font-weight="700" fill="'+OR+'"')+lbl(390,150,'1 N = 1 kg × 1 m/s²')]]},
 seeNote:'Force shared by mass gives acceleration.',
 do:{title:'Catch softly',mat:'Ball, partner',steps:['Catch a ball with stiff hands, then while pulling back.','Compare.'],obs:'Pulling back hurts less.',why:'Longer time, smaller force.',lab:true},
 memo:'"F = ma; slower stop, softer force."',
 miscon:['"Heavier objects need no force to accelerate." They need more force for the same acceleration.'],
 terms:["Second law · दूसरा नियम",'Newton (N) · न्यूटन','F = ma','Rate of change of momentum'],
 q:{q:'Force on a 3 kg object with a = 4 m/s²:',o:['7 N','12 N','0.75 N','1.33 N'],a:1,why:'3 × 4.'},
 exam:'Derive F = ma; numericals; applications: 3–5 marks.'},

{id:'f5',num:'8.5',title:'Third law: action and reaction · गति का तीसरा नियम',
 intro:'When you jump off a boat onto the bank, why does the boat move backwards?',
 obj:"State Newton's third law and identify action–reaction pairs.",
 prior:'8.4.',
 simple:"Newton's third law (गति का तीसरा नियम): to every action, there is an equal and opposite reaction. When one object exerts a force on another, the second object exerts an equal force in the opposite direction on the first. The two forces act on different objects, so they do not cancel.",
 detail:'Examples: a gun recoils when fired; a rocket pushes gases down and the gases push it up; when you walk, you push the ground backward and the ground pushes you forward; a sailor jumping forward pushes the boat back. Equal forces may produce different accelerations because the masses differ (gun vs bullet).',
 real:'Rockets work even in space because they push exhaust gases out and the gases push back.',
 apply:'Identify the action and reaction when a swimmer pushes water backwards.',
 see:{w:520,h:200,f:[
  ['A gun fires.',`<rect x="190" y="90" width="120" height="24" rx="4" fill="${GR}"/><rect x="160" y="100" width="40" height="40" rx="4" fill="${GR}"/>`],
  ['Bullet forward.',`<ellipse cx="380" cy="102" rx="12" ry="6" fill="${OR}"/>`+arrow(395,102,460,102,OR)+lbl(430,90,'action','fill="'+OR+'"')],
  ['Gun recoils.',arrow(150,125,80,125,BL)+lbl(110,150,'reaction (recoil)','fill="'+BL+'"')+lbl(260,40,'equal and opposite — on different objects','font-weight="700"')]]},
 seeNote:'Pairs act on different bodies.',
 do:{title:'Balloon rocket',mat:'Balloon, straw, string, tape',steps:['Thread a straw on a stretched string; tape an inflated balloon to it.','Release the balloon\'s mouth.'],obs:'Balloon zooms the other way.',why:'Action–reaction.',lab:true},
 memo:'"Push it, it pushes back."',
 miscon:['"Action and reaction cancel." They act on different objects.'],
 terms:["Third law · तीसरा नियम",'Action · क्रिया','Reaction · प्रतिक्रिया','Recoil'],
 q:{q:'Action and reaction forces act on:',o:['the same body','different bodies','only moving bodies','only heavy bodies'],a:1,why:'They don\'t cancel.'},
 exam:'Third law examples: 2 marks.'},

{id:'f6',num:'8.6',title:'Conservation of momentum · संवेग संरक्षण',
 intro:'Two trolleys crash and stick together. Can we predict how fast the pair moves?',
 obj:'Apply the law of conservation of momentum.',
 prior:'8.3–8.5.',
 simple:'When two or more objects interact and no external unbalanced force acts, the total momentum before equals the total momentum after: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂. This follows from the second and third laws.',
 detail:'If they stick: m₁u₁ + m₂u₂ = (m₁ + m₂)v. Recoil of a gun: before firing total momentum = 0, so m_bullet v_bullet = −m_gun v_gun. A 2 kg trolley at 4 m/s hits a 2 kg trolley at rest and they stick: v = 8 ÷ 4 = 2 m/s.',
 real:'Rockets, recoiling guns and colliding vehicles all obey momentum conservation.',
 apply:'A 20 g bullet leaves a 2 kg gun at 150 m/s. Find the recoil velocity of the gun.',
 see:{w:520,h:200,f:[
  ['Before: A moves, B at rest.',trolley(40,110,90,BL,'A 2 kg')+arrow(135,90,180,90,BL)+lbl(160,80,'4 m/s')+trolley(260,110,90,OR,'B 2 kg')],
  ['After: they move together.',trolley(250,180,90,BL,'A')+trolley(340,180,90,OR,'B')+arrow(440,160,490,160,PU)+lbl(465,150,'2 m/s')],
  ['Momentum conserved.',lbl(260,30,'8 kg m/s before = 8 kg m/s after','font-weight="700" fill="'+PU+'"')]]},
 seeNote:'Total momentum stays the same.',
 do:{title:'Marble collisions',mat:'Marbles, ruler groove',steps:['Roll one marble into another at rest.','Observe speeds.'],obs:'Momentum transferred.',why:'Conservation.',lab:false},
 memo:'"Total momentum in = total momentum out."',
 miscon:['"Momentum is lost in a collision." In an isolated system, total momentum is conserved.'],
 terms:['Conservation of momentum · संवेग संरक्षण','Isolated system','Recoil velocity'],
 q:{q:'A 1 kg ball at 6 m/s sticks to a 2 kg ball at rest. Final velocity:',o:['2 m/s','3 m/s','6 m/s','1 m/s'],a:0,why:'6 ÷ 3.'},
 exam:'Conservation numericals (recoil, collisions): 3 marks.'}
];

const CARDS=[['Force · बल','Push or pull; changes speed, direction or shape.'],['Balanced forces','Net force zero; no change in motion.'],['First law','Rest or uniform motion continues without net force.'],['Inertia · जड़त्व','Resistance to change; measured by mass.'],['Momentum · संवेग','p = mv; kg m/s.'],['Second law','F = ma; F = change in momentum ÷ time.'],['Newton','1 N = 1 kg × 1 m/s².'],['Longer stopping time','Smaller force (catching, airbags).'],['Third law','Equal and opposite on different bodies.'],['Conservation','m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂.'],['Recoil','m_bullet v_bullet = −m_gun v_gun.']];

const Q=[
 {lv:1,q:'SI unit of force:',o:['joule','newton','watt','pascal'],a:1,w:'N.'},
 {lv:1,q:'The first law is also called the law of:',o:['momentum','inertia','gravity','energy'],a:1,w:'Inertia.'},
 {lv:1,q:'Momentum = ',o:['m + v','m × v','m ÷ v','m × a'],a:1,w:'p = mv.'},
 {lv:2,q:'Which has the most inertia?',o:['a bicycle','a car','a truck','a ball'],a:2,w:'Largest mass.'},
 {lv:2,q:'When a bus starts suddenly, passengers fall:',o:['forward','backward','sideways','not at all'],a:1,w:'Inertia of rest.'},
 {lv:2,q:'F = 30 N on m = 6 kg. a =',o:['5 m/s²','180 m/s²','24 m/s²','0.2 m/s²'],a:0,w:'30 ÷ 6.'},
 {lv:3,q:'Fielders pull hands back to:',o:['increase force','increase stopping time','increase momentum','look stylish'],a:1,w:'Smaller force.'},
 {lv:3,q:'Which pair is action–reaction?',o:['weight of book, table pushing book','book pushing table, table pushing book','book\'s weight, Earth\'s mass','friction, weight'],a:1,w:'Different bodies, same interaction.'},
 {lv:4,q:'A 50 g bullet leaves a 4 kg gun at 400 m/s. Recoil speed:',o:['5 m/s','2 m/s','10 m/s','0.5 m/s'],a:0,w:'0.05 × 400 = 4v.'},
 {lv:4,q:'A 1500 kg car slows from 20 m/s to 0 in 5 s. Braking force:',o:['3000 N','6000 N','7500 N','1500 N'],a:1,w:'1500 × 4.'},
 {lv:5,open:true,m:3,q:'State Newton\'s second law and derive F = ma from it.',ans:['Statement (1)','F ∝ (mv − mu)/t (1)','= m(v − u)/t = ma with k = 1 (1)']},
 {lv:5,open:true,m:5,q:'A 100 g ball moving at 6 m/s hits a 200 g ball at rest. After collision, the first ball stops. Find the velocity of the second ball. State the law used and two of Newton\'s laws behind it.',ans:['Momentum before = 0.1 × 6 = 0.6 kg m/s (1)','After: 0.2 × v (1)','v = 3 m/s (1)','Law of conservation of momentum (1)','Follows from second and third laws (1)']}
];

const ONEMIN=['Balanced vs unbalanced forces.','First law; inertia; mass.','Momentum p = mv.','F = ma; stopping time and force.','Action and reaction.','Conservation of momentum.'];
const KEYS=[['balanced',/balanced|संतुलित/i],['inertia',/inertia|first law|जड़त्व/i],['momentum',/momentum|संवेग/i],['F = ma',/F = ma|second law/i],['third law',/third law|reaction|प्रतिक्रिया/i],['conservation',/conserv|संरक्षण/i]];

/* ---------- lab ---------- */
let mode='f',F=10,M=2,Am=2,Au=4,Bm=2,Bu=0,t=0,run=false,last=0,looping=false,wired=false;
function stuckV(){return (Am*Au+Bm*Bu)/(Am+Bm)}
function collide(){const gap=200,rel=Au-Bu;return rel>0?gap/(rel*12):Infinity}
function drawF(){const a=F/M,TT=4,tt=Math.min(t,TT),s=.5*a*tt*tt,v=a*tt;const sMax=.5*20*16;const x=110+Math.min(1,s/sMax)*300;const w=40+M*8;let g=`<line x1="20" y1="200" x2="500" y2="200" stroke="${GR}" stroke-width="2"/>`;
 g+=trolley(x,195,w,BL,M+' kg')+(F?arrow(x-70,180,x-4,180,OR,2+F/5)+T(x-40,166,F+' N','font-size="12" fill="'+OR+'"'):'')+(v>0?arrow(x+w+6,150,x+w+6+Math.min(80,v*4),150,GN):'');
 g+=T(260,40,`a = F ÷ m = ${F} ÷ ${M} = ${a.toFixed(2)} m/s²`,'font-size="16" font-weight="700" fill="'+OR+'"')+T(260,70,`t = ${tt.toFixed(1)} s · v = ${v.toFixed(1)} m/s · p = ${(M*v).toFixed(1)} kg m/s`,'font-size="13"');
 g+=T(260,260,'momentum gained = F × t = '+(F*tt).toFixed(1)+' kg m/s','font-size="13"');
 $('#fcSvg').innerHTML=g;$('#fcFv').textContent=F;$('#fcMv').textContent=M;
 $('#fcOut').innerHTML=`<p>Acceleration <b>${a.toFixed(2)} m/s²</b>. ${F===0?'No force → no acceleration (first law).':`Double the force → double the acceleration. Double the mass → half the acceleration.`}</p>${tt>0?`<p>Second law check: change in momentum ÷ time = ${(M*v).toFixed(1)} ÷ ${tt.toFixed(1)} = ${(M*v/tt).toFixed(1)} N = F.</p>`:'<p>Press Go to push the trolley for 4 seconds.</p>'}`;return tt>=TT}
function drawC(){const tc=collide();const V=stuckV();let xa,xb;const xa0=40,xb0=40+200+60;
 if(t<tc){xa=xa0+Au*t*12;xb=xb0+Bu*t*12}else{const dt=t-tc;xa=xa0+Au*tc*12+V*dt*12;xb=xa+60}
 xa=Math.max(-70,Math.min(470,xa));xb=Math.max(0,Math.min(530,xb));
 let g=`<line x1="10" y1="170" x2="510" y2="170" stroke="${GR}" stroke-width="2"/>`+trolley(xa,165,60,BL,'A '+Am+' kg')+trolley(xb,165,60,OR,'B '+Bm+' kg');
 const pA=Am*Au,pB=Bm*Bu,pT=pA+pB,after=(Am+Bm)*V;const bar=(y,val,c,lab)=>`<rect x="${val>=0?260:260+val*6}" y="${y}" width="${Math.abs(val)*6}" height="16" fill="${c}" fill-opacity=".7"/>`+T(120,y+13,lab,'font-size="12"')+T(260+(val>=0?val*6+24:val*6-24),y+13,val.toFixed(1),'font-size="11"');
 g+=`<line x1="260" y1="200" x2="260" y2="300" stroke="${ink}" stroke-opacity=".4"/>`+bar(206,pA,BL,'p of A before')+bar(228,pB,OR,'p of B before')+bar(250,pT,PU,'total before')+bar(278,after,GN,'total after');
 g+=T(260,40,t>=tc?`stuck together: v = ${V.toFixed(2)} m/s`:'before collision','font-size="15" font-weight="700"');
 $('#fcSvg').innerHTML=g;['Am','Au','Bm','Bu'].forEach(k=>$('#fc'+k+'v').textContent={Am,Au,Bm,Bu}[k]);
 $('#fcOut').innerHTML=`<p>Before: ${Am} × ${Au} + ${Bm} × (${Bu}) = <b>${pT.toFixed(1)} kg m/s</b></p><p>After (stuck): (${Am} + ${Bm}) × v → v = ${pT.toFixed(1)} ÷ ${Am+Bm} = <b>${V.toFixed(2)} m/s</b></p><p>${tc===Infinity?'They never meet: A must be faster than B to catch it.':'Total momentum is the same before and after — it is conserved.'}</p>`;return t>tc+3||t>12}
function draw(){$('#fcF').style.display=mode==='f'?'':'none';$('#fcC').style.display=mode==='c'?'':'none';const done=mode==='f'?drawF():drawC();$('#fcGo').textContent=run?'Pause':done?'Done':'Go';return done}
function loop(ts){if(!$('#fcSvg')||!$('#fcSvg').isConnected||($('#v-lab')&&$('#v-lab').hidden)){looping=false;return}const dt=last?Math.min(.05,(ts-last)/1000):0;last=ts;if(run){t+=dt;if(draw())run=false;}if(run)requestAnimationFrame(loop);else{looping=false;draw()}}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const el=e.target;if(!el||!el.classList||!el.classList.contains('fcS'))return;const v=+el.value;({fcFo:()=>F=v,fcMa:()=>M=v,fcAm:()=>Am=v,fcAu:()=>Au=v,fcBm:()=>Bm=v,fcBu:()=>Bu=v})[el.id]();t=0;run=false;draw()})}
function labClick(b){if(b.id==='fcGo'){if(draw()&&!run)return true;run=!run;if(run&&!looping){looping=true;last=0;requestAnimationFrame(loop)}draw();return true}if(b.id==='fcR'){t=0;run=false;draw();return true}return false}
function labChange(el){if(el.id==='fcM'){mode=el.value;t=0;run=false;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
