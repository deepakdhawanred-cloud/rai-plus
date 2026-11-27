/* Rai Plus content pack: Class 8 Science (Curiosity), Chapter 5 – Exploring Forces. */
RP.register({key:'8sci05',cls:'8',subject:'Science',ch:'5',title:"Exploring Forces",color:'#0f6e7a',
crumb:"Class 8 Science · Curiosity",h1:"Chapter 5: Exploring Forces",sub:"Force as a push or pull, what forces can do, contact and non-contact forces, friction, gravity, mass and weight, measuring force, and buoyancy.",heroLabel:"Arrows pushing and pulling a box",labName:'Ramp friction and weight lab',
theme:"\n:root{--g:light-dark(#0f6e7a,#86d0da);--g2:light-dark(#e6f4f6,#071618);--line:light-dark(#c6e3e7,#1d3d42);--bg:light-dark(#ffffff,#061012);--card:light-dark(#ffffff,#0b1719);\n--ink:light-dark(#0a2226,#dff0f2);--mute:light-dark(#46636a,#a6c4c9);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#0b555e}\n",
labHTML:`  <h2>Ramp friction and weight lab</h2>
  <p>Ramp mode: tilt a ramp and choose its surface. The block slides only when the pull of gravity down the slope beats friction. Weight mode: hang a 1 kg mass on a spring balance on different worlds — the mass stays the same, the weight changes.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="fSvg" viewBox="0 0 460 320" role="img" aria-label="Ramp" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="fM"><option value="r">Ramp and friction</option><option value="w">Mass and weight</option></select></label></div>
  <div class="ctrl" id="fR"><label>Angle: <b id="fAv"></b><input type="range" class="fS" id="fA" min="0" max="50" value="15"></label> <label>Surface<select id="fSu"><option value="ice">Ice</option><option value="glass">Glass</option><option value="wood" selected>Wood</option><option value="sand">Sandpaper</option><option value="rubber">Rubber mat</option></select></label> <label><input type="checkbox" id="fOil"> oil the surface</label></div>
  <div class="ctrl" id="fW" style="display:none"><label>World<select id="fP"><option value="9.8">Earth</option><option value="1.6">Moon</option><option value="3.7">Mars</option><option value="24.8">Jupiter</option></select></label> <label>Mass (kg): <b id="fMv"></b><input type="range" class="fS" id="fMs" min="1" max="10" value="1"></label></div>
  <div class="box y" id="fOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#0f6e7a',LABNAME='Ramp friction and weight lab',MIND_CENTER='Forces';
const TL='#0f6e7a',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
const arr=(x1,y1,x2,y2,c=GR,w=3)=>{const a=Math.atan2(y2-y1,x2-x1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/><path d="M${x2} ${y2} L${x2-10*Math.cos(a-.45)} ${y2-10*Math.sin(a-.45)} L${x2-10*Math.cos(a+.45)} ${y2-10*Math.sin(a+.45)}Z" fill="${c}"/>`};
function heroDraw(){return `<rect x="160" y="60" width="60" height="50" fill="none" stroke="#fff" stroke-width="3"/><path d="M90 85 h60 M140 75 l10 10 l-10 10 M230 85 h60 M280 75 l10 10 l-10 10" stroke="#fff" stroke-width="3" fill="none"/>`}
const HERO=heroDraw;
const MIND=[['Push or pull',100,50],['Effects of force',420,50],['Contact & non-contact',90,150],['Friction',430,150],['Gravity, mass, weight',110,250],['Measuring & buoyancy',410,250]];

const C=[
{id:'f1',num:'5.1',title:'Force: a push or a pull',
 intro:'Kicking a football, opening a door, lifting a bag — what do these have in common?',
 obj:'Describe force as a push or pull caused by interaction between objects.',
 prior:'Class 6–7: motion, magnets.',
 simple:'A force is a push or a pull on an object. Forces arise when objects interact — at least two objects are involved (your foot and the ball). A force has a size (magnitude) and a direction, so we draw it as an arrow. Forces in the same direction add up; in opposite directions they subtract.',
 detail:'In a tug of war, if both teams pull equally, the net force is zero and the rope does not move — balanced forces. If one team pulls harder, the rope moves towards it — unbalanced forces. The SI unit of force is the newton (N), named after Isaac Newton.',
 real:'Pushing a stalled car: more people pushing in the same direction add their forces.',
 apply:'Two friends push a box with 30 N and 20 N in the same direction. What is the total force? What if they push in opposite directions?',
 see:{w:520,h:220,f:[
  ['A box.',`<rect x="220" y="80" width="80" height="60" fill="${GR}" opacity=".35" stroke="${ink}" stroke-width="2"/>`],
  ['Two forces in the same direction add.',arr(120,95,215,95,TL)+arr(120,125,190,125,TL)+lbl(150,80,'30 N','fill="'+TL+'"')+lbl(150,150,'20 N','fill="'+TL+'"')],
  ['Opposite forces subtract.',arr(400,110,305,110,OR)+lbl(360,95,'20 N','fill="'+OR+'"')+lbl(260,195,'net force = 30 N − 20 N = 10 N →','font-weight="700"')]]},
 seeNote:'Forces are arrows: size and direction.',
 do:{title:'Tug of war',mat:'Rope, two teams',steps:['Pull with equal teams, then unequal.','Observe the rope.'],obs:'Moves only when unbalanced.',why:'Net force.',lab:false},
 memo:'"Push, pull, size and direction."',
 miscon:['"A moving object always needs a force to keep moving." Without friction it would keep moving.'],
 terms:['Force · बल','Push · धक्का','Pull · खिंचाव','Newton (N) · न्यूटन','Net force · परिणामी बल'],
 q:{q:'Balanced forces acting on a still object:',o:['make it move','keep it at rest','change its shape always','double its speed'],a:1,why:'Net force zero.'},
 exam:'Net force and balanced forces: 2 marks.'},

{id:'f2',num:'5.2',title:'What can a force do?',
 intro:'A bowler, a batsman and a fielder all apply forces to the ball. What does each force change?',
 obj:'List the effects of force on objects.',
 prior:'5.1.',
 simple:'A force can: (1) make a still object move; (2) change the speed of a moving object (faster or slower); (3) stop a moving object; (4) change the direction of motion; (5) change the shape of an object (squeezing dough, stretching a rubber band).',
 detail:'Sometimes several effects happen together: a batsman\'s hit changes the ball\'s speed and direction. A force may not always produce motion — pushing a wall does not move it, but the wall pushes back. Shape changes can be temporary (spring, rubber) or permanent (clay).',
 real:'Making rotis: rolling changes the dough\'s shape; flipping changes its direction.',
 apply:'Name the effect of force in: braking a cycle, kneading dough, hitting a six.',
 see:{w:520,h:220,f:[
  ['Start or stop motion.',box(20,40,150,55,'Start / stop',TL)],
  ['Change speed or direction.',box(185,40,150,55,'Speed / direction',BL)],
  ['Change shape.',box(350,40,150,55,'Shape',OR)+`<ellipse cx="425" cy="160" rx="55" ry="20" fill="${OR}" opacity=".3"/>`+lbl(425,200,'squeezed dough','fill="'+OR+'"')]]},
 seeNote:'Five effects.',
 do:{title:'Ball station',mat:'Ball, clay',steps:['Make the ball start, stop, turn.','Squeeze clay.'],obs:'All effects seen.',why:'Effects of force.',lab:false},
 memo:'"Start, speed, stop, steer, squash."',
 miscon:['"If nothing moves, no force acted." Forces may be balanced.'],
 terms:['Effect of force · बल का प्रभाव','Direction · दिशा','Shape · आकार'],
 q:{q:'Stretching a rubber band shows force can change:',o:['colour','shape','mass','temperature'],a:1,why:'Shape.'},
 exam:'Effects of force with examples: 2–3 marks.'},

{id:'f3',num:'5.3',title:'Contact and non-contact forces',
 intro:'A magnet pulls a pin without touching it. A comb rubbed on hair attracts paper bits. How?',
 obj:'Classify forces as contact or non-contact.',
 prior:'5.1, Class 6 magnets.',
 simple:'Contact forces act only when objects touch: muscular force (our muscles), friction, and normal force from surfaces. Non-contact forces act from a distance: magnetic force (magnets attract iron), electrostatic force (charged objects attract or repel — rubbed comb and paper bits), and gravitational force (Earth pulls everything down).',
 detail:'Non-contact forces get weaker with distance. Like magnetic poles repel, unlike attract; like charges repel, unlike charges attract. Gravity always attracts — every object pulls every other object, but the pull is noticeable only for very massive objects like the Earth.',
 real:'Lightning involves huge electrostatic charges between clouds and the ground.',
 apply:'Classify: kicking a ball, a falling apple, a magnet lifting nails, rubbing hands.',
 see:{w:520,h:220,f:[
  ['Contact: muscular, friction.',box(20,40,220,60,'Contact',TL,'muscular · friction · normal')],
  ['Non-contact: magnetic, electrostatic, gravity.',box(280,40,220,60,'Non-contact',PU,'magnetic · electrostatic · gravity')],
  ['Gravity acts from a distance.',`<circle cx="390" cy="170" r="10" fill="${OR}"/>`+arr(390,140,390,195,PU,2)+lbl(260,170,'falling apple: no touch needed','fill="'+PU+'"')]]},
 seeNote:'Touching or not?',
 do:{title:'Charged comb',mat:'Plastic comb, paper bits',steps:['Rub comb on dry hair.','Bring near paper bits.'],obs:'Paper jumps to comb.',why:'Electrostatic force.',lab:false},
 memo:'"Touch: muscle, friction. No touch: magnet, charge, gravity."',
 miscon:['"Gravity needs air." It acts in space too.'],
 terms:['Contact force · संपर्क बल','Non-contact force · असंपर्क बल','Muscular force · पेशीय बल','Electrostatic force · स्थिरवैद्युत बल','Magnetic force · चुंबकीय बल'],
 q:{q:'Which is a non-contact force?',o:['friction','muscular','gravitational','push of a hand'],a:2,why:'Acts at a distance.'},
 exam:'Contact vs non-contact: 2 marks.'},

{id:'f4',num:'5.4',title:'Friction',
 intro:'Why is it easy to slip on a wet marble floor but not on a rough road?',
 obj:'Explain friction, the factors affecting it, and ways to increase or reduce it.',
 prior:'5.3.',
 simple:'Friction is a contact force between two surfaces that opposes motion (or attempted motion). It is caused by tiny bumps on surfaces catching on each other. Rough surfaces → more friction; smooth surfaces → less friction. Friction also produces heat (rubbing hands).',
 detail:'Static friction (before motion) is greater than sliding friction; rolling friction is much smaller — so wheels and ball bearings help. Increase friction: treads on tyres and shoes, sand on slippery roads, chalk on gymnasts\' hands. Reduce friction: oil and grease, ball bearings, polishing, streamlined shapes (fluid friction or drag in air and water). Friction is useful (walking, writing, brakes) and a nuisance (wear and tear, energy loss).',
 real:'Kabaddi players need good grip; shoes with treads increase friction.',
 apply:'Give two ways each to increase and reduce friction.',
 see:{w:520,h:220,f:[
  ['Surfaces have tiny bumps.',`<path d="M40 150 ${[...Array(24)].map((_,k)=>`l9 ${k%2?8:-8}`).join(' ')}" fill="none" stroke="${ink}" stroke-width="2"/><path d="M60 142 ${[...Array(20)].map((_,k)=>`l9 ${k%2?-8:8}`).join(' ')}" fill="none" stroke="${TL}" stroke-width="2"/>`+lbl(150,180,'magnified surfaces')],
  ['Push → friction opposes.',arr(320,100,410,100,TL)+arr(470,130,390,130,OR)+lbl(365,85,'push','fill="'+TL+'"')+lbl(430,155,'friction','fill="'+OR+'"')],
  ['Rough more, smooth less; rolling least.',lbl(390,200,'rough > smooth > rolling','font-weight="700"')]]},
 seeNote:'Friction opposes motion.',
 do:{title:'Ramp race',mat:'Ramp, toy car, cloth, sandpaper, glass',steps:['Release a car down the ramp on different surfaces.','Measure distance travelled.'],obs:'Farthest on glass.',why:'Less friction.',lab:true},
 memo:'"Rough grips, smooth slips, wheels whiz."',
 miscon:['"Friction is always bad." We could not walk or write without it.'],
 terms:['Friction · घर्षण','Static friction · स्थैतिक घर्षण','Rolling friction · लोटनिक घर्षण','Lubricant · स्नेहक','Drag · कर्षण'],
 q:{q:'Ball bearings reduce friction because:',o:['they add weight','rolling friction is less than sliding','they are sticky','they heat up'],a:1,why:'Rolling.'},
 exam:'Friction: factors and methods: 3 marks.'},

{id:'f5',num:'5.5',title:'Gravity, mass and weight',
 intro:'On the Moon you could jump six times higher. Does your mass change there?',
 obj:'Distinguish mass from weight and explain gravitational force.',
 prior:'5.3.',
 simple:'Gravity is the force with which the Earth pulls objects towards its centre. Mass is the amount of matter in an object (kg) — it stays the same everywhere. Weight is the force of gravity on that mass (newtons) — it changes with location. On Earth, weight ≈ mass × 9.8 N. On the Moon, gravity is about 1/6 of Earth\'s, so weight is about 1/6.',
 detail:'A 60 kg student weighs about 588 N on Earth and about 98 N on the Moon, but still has 60 kg mass. In everyday talk we say "weight in kg", but scientifically weight is a force. Gravity keeps the Moon orbiting Earth and the planets orbiting the Sun.',
 real:'Astronauts bounce on the Moon because their weight is much less.',
 apply:'A bag has mass 5 kg. Find its weight on Earth and on the Moon.',
 see:{w:520,h:220,f:[
  ['Same mass: 60 kg.',lbl(260,40,'mass = 60 kg (everywhere)','font-size="16" font-weight="700"')],
  ['Earth: weight ≈ 588 N.',`<circle cx="140" cy="140" r="45" fill="${BL}" opacity=".3"/>`+lbl(140,145,'Earth')+lbl(140,210,'588 N','font-size="16" fill="'+BL+'"')],
  ['Moon: weight ≈ 98 N.',`<circle cx="380" cy="140" r="25" fill="${GR}" opacity=".4"/>`+lbl(380,145,'Moon')+lbl(380,210,'98 N (≈ 1/6)','font-size="16" fill="'+GR+'"')]]},
 seeNote:'Mass stays; weight changes.',
 do:{title:'Weigh it',mat:'Spring balance, objects',steps:['Hang objects; read in newtons.','Convert: weight ÷ 9.8 = mass.'],obs:'Mass in kg.',why:'Weight = mass × g.',lab:true},
 memo:'"Mass is matter, weight is pull."',
 miscon:['"Mass and weight are the same." Weight is a force that depends on gravity.'],
 terms:['Gravity · गुरुत्वाकर्षण','Mass · द्रव्यमान','Weight · भार','Spring balance · कमानीदार तुला'],
 q:{q:'Your mass on the Moon compared with Earth:',o:['one-sixth','the same','six times','zero'],a:1,why:'Mass doesn\'t change.'},
 exam:'Mass vs weight: 2–3 marks.'},

{id:'f6',num:'5.6',title:'Measuring force and buoyancy',
 intro:'Why does a mug of water feel lighter when lifted under water in a bucket?',
 obj:'Measure force with a spring balance and explain upthrust (buoyant force).',
 prior:'5.5.',
 simple:'A spring balance measures force: the spring stretches more for a bigger force; the scale reads in newtons. Water and other fluids push objects upward — the buoyant force (upthrust). An object floats if upthrust balances its weight; it sinks if its weight is greater.',
 detail:'An object in water seems to weigh less: apparent loss of weight = upthrust. The upthrust equals the weight of the liquid displaced (Archimedes\' principle). Objects less dense than water (wood, ice) float; denser ones (iron nail) sink — but an iron ship floats because its shape displaces a lot of water.',
 real:'Ships of the Indian Navy are made of steel but float because of their hollow shape.',
 apply:'A stone weighs 10 N in air and 6 N in water. What is the upthrust?',
 see:{w:520,h:240,f:[
  ['In air: 10 N.',`<line x1="140" y1="20" x2="140" y2="60" stroke="${ink}"/><rect x="128" y="60" width="24" height="50" fill="none" stroke="${ink}"/>`+lbl(185,90,'10 N')+`<rect x="125" y="120" width="30" height="30" fill="${GR}"/>`],
  ['In water: 6 N.',`<rect x="300" y="110" width="140" height="110" fill="${BL}" opacity=".2" stroke="${BL}"/><line x1="370" y1="20" x2="370" y2="60" stroke="${ink}"/><rect x="358" y="60" width="24" height="40" fill="none" stroke="${ink}"/><rect x="355" y="150" width="30" height="30" fill="${GR}"/>`+lbl(415,85,'6 N')],
  ['Upthrust = 4 N.',arr(370,215,370,185,GN)+lbl(260,232,'upthrust = 10 − 6 = 4 N','font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Water pushes up.',
 do:{title:'Float or sink',mat:'Bucket, objects, spring balance',steps:['Weigh objects in air and in water.','Note which float.'],obs:'All seem lighter in water.',why:'Upthrust.',lab:false},
 memo:'"Water pushes up — floats if push ≥ weight."',
 miscon:['"Heavy things always sink." Shape and density matter — ships float.'],
 terms:['Buoyant force · उत्प्लावन बल','Upthrust · उत्क्षेप','Float · तैरना','Sink · डूबना','Spring balance · कमानीदार तुला'],
 q:{q:'A stone weighs 12 N in air and 9 N in water. Upthrust:',o:['21 N','3 N','9 N','12 N'],a:1,why:'12 − 9.'},
 exam:'Spring balance; buoyancy: 2–3 marks.'}
];

const CARDS=[['Force','Push or pull; has size and direction.'],['Newton','SI unit of force (N).'],['Net force','Same direction add; opposite subtract.'],['Effects','Start, stop, speed, direction, shape.'],['Contact forces','Muscular, friction, normal.'],['Non-contact','Magnetic, electrostatic, gravitational.'],['Friction','Opposes motion; rough > smooth > rolling.'],['Mass','Amount of matter (kg); same everywhere.'],['Weight','Gravity on mass (N); Moon ≈ 1/6.'],['Upthrust','Liquid pushes up; float if ≥ weight.']];

const Q=[
 {lv:1,q:'The SI unit of force is:',o:['kilogram','newton','metre','joule'],a:1,w:'N.'},
 {lv:1,q:'Friction acts:',o:['in the direction of motion','opposite to motion','upwards','only in water'],a:1,w:'Opposes.'},
 {lv:1,q:'A rubbed comb attracting paper shows:',o:['magnetic force','electrostatic force','friction','muscular force'],a:1,w:'Charge.'},
 {lv:2,q:'Weight of a 10 kg mass on Earth (g = 9.8):',o:['10 N','98 N','9.8 N','980 N'],a:1,w:'m × g.'},
 {lv:2,q:'Treads on tyres:',o:['reduce friction','increase friction','reduce weight','add buoyancy'],a:1,w:'Grip.'},
 {lv:2,q:'40 N right and 25 N left: net force',o:['65 N right','15 N right','15 N left','0'],a:1,w:'Subtract.'},
 {lv:3,q:'Your weight on the Moon is about:',o:['the same','1/6 of Earth','6 times','zero'],a:1,w:'Gravity 1/6.'},
 {lv:3,q:'A stone weighs 8 N in air and 5 N in water. Upthrust:',o:['13 N','3 N','5 N','8 N'],a:1,w:'8 − 5.'},
 {lv:4,q:'Why do iron ships float but iron nails sink?',o:['ships are painted','hollow shape displaces more water','nails are magnetic','sea water is heavier only for ships'],a:1,w:'Upthrust.'},
 {lv:4,q:'Which friction is least?',o:['static','sliding','rolling','all same'],a:2,w:'Rolling.'},
 {lv:5,open:true,m:3,q:'Distinguish between mass and weight (three points).',ans:['Mass: matter; weight: force of gravity (1)','Mass in kg; weight in N (1)','Mass constant; weight changes with place (1)']},
 {lv:5,open:true,m:3,q:'Friction is a necessary evil. Justify with examples.',ans:['Useful: walking, writing, brakes, grip (1)','Harmful: wear and tear, heat, energy loss (1)','Control: lubricants/bearings to reduce; treads/sand to increase (1)']}
];

const ONEMIN=['Force: push/pull, size and direction.','Effects: start, stop, speed, direction, shape.','Contact vs non-contact forces.','Friction: opposes motion; increase/reduce.','Mass vs weight; gravity.','Spring balance and upthrust.'];
const KEYS=[['force',/force|push|pull/i],['effects',/shape|direction|speed/i],['contact',/contact/i],['friction',/friction/i],['mass/weight',/mass|weight|gravity/i],['buoyancy',/upthrust|buoyan|float/i]];

/* ---------- lab ---------- */
const MU={ice:.05,glass:.15,wood:.35,sand:.65,rubber:.9};
let mode='r',ang=15,surf='wood',oil=false,g=9.8,mass=1,wired=false,anim=null;
function drawR(slidePos=0){const mu=MU[surf]*(oil?.45:1);const th=ang*Math.PI/180;const slides=Math.tan(th)>mu;const L=360,x0=50,y0=270;const x1=x0+L*Math.cos(th),y1=y0-L*Math.sin(th);
 let s=`<polygon points="${x0},${y0} ${x1},${y1} ${x1},${y0}" fill="${{ice:'#d8eef7',glass:'#e6f2f5',wood:'#d9b98a',sand:'#c9b27a',rubber:'#555'}[surf]}" opacity=".7" stroke="${ink}" stroke-width="2"/>`;
 const d=Math.max(0,L-60-slidePos*(L-80));const bx=x0+d*Math.cos(th),by=y0-d*Math.sin(th);s+=`<g transform="translate(${bx} ${by}) rotate(${-ang})"><rect x="-22" y="-36" width="44" height="36" fill="${OR}" opacity=".85" stroke="${ink}"/></g>`;
 const cx=bx-18*Math.sin(th),cy=by-18*Math.cos(th);const gp=60*Math.sin(th)+6,fr=Math.min(gp,60*mu*Math.cos(th)+4);
 s+=arr(cx,cy,cx-gp*Math.cos(th),cy+gp*Math.sin(th),BL,3)+arr(cx,cy,cx+fr*Math.cos(th),cy-fr*Math.sin(th),GN,3);
 s+=T(110,30,'gravity down slope','font-size="12" fill="'+BL+'"')+T(110,48,'friction up slope','font-size="12" fill="'+GN+'"')+T(380,300,`${ang}°  ${surf}${oil?' + oil':''}`,'font-size="13" font-weight="700"');$('#fSvg').innerHTML=s;$('#fAv').textContent=ang+'°';
 const crit=Math.round(Math.atan(mu)*180/Math.PI);$('#fOut').innerHTML=slides?`<p class="fb ok">The block slides! Pull down the slope is greater than friction.</p><p>On ${surf}${oil?' with oil':''}, it starts sliding at about ${crit}°.</p>`:`<p>The block stays still: friction balances the pull down the slope.</p><p>Tilt beyond about ${crit}° to make it slide. ${surf==='rubber'?'Rubber grips strongly.':''}</p>`;return slides}
function drawW(){const W=mass*g;const ext=Math.min(200,W*2.2);let s=`<line x1="100" y1="10" x2="360" y2="10" stroke="${ink}" stroke-width="4"/><rect x="200" y="20" width="60" height="230" rx="8" fill="none" stroke="${ink}" stroke-width="2"/>`;
 for(let k=0;k<=10;k++)s+=`<line x1="200" y1="${30+k*20}" x2="212" y2="${30+k*20}" stroke="${ink}"/>`+T(185,34+k*20,String(k*10),'font-size="9"');
 let p='M230 25';for(let k=0;k<12;k++)p+=` L${k%2?220:240} ${25+(ext+10)*(k+1)/12}`;s+=`<path d="${p}" fill="none" stroke="${GR}" stroke-width="2"/><line x1="205" y1="${35+ext}" x2="255" y2="${35+ext}" stroke="${OR}" stroke-width="3"/><line x1="230" y1="${35+ext}" x2="230" y2="${55+ext}" stroke="${ink}"/><rect x="${215}" y="${55+ext}" width="30" height="${Math.min(40,15+mass*3)}" fill="${GR}"/>`;
 const world={'9.8':'Earth','1.6':'Moon','3.7':'Mars','24.8':'Jupiter'}[String(g)];s+=T(370,120,world,'font-size="20" font-weight="700"')+T(370,160,`mass ${mass} kg`,'font-size="15"')+T(370,195,`weight ${(W).toFixed(1)} N`,'font-size="17" font-weight="700" fill="'+OR+'"');if(W>100)s+=T(370,225,'(off the scale!)','font-size="11"');
 $('#fSvg').innerHTML=s;$('#fMv').textContent=mass;$('#fOut').innerHTML=`<p>Weight = mass × gravity = ${mass} × ${g} = <b>${W.toFixed(1)} N</b>.</p><p>The mass is ${mass} kg on every world; only the weight changes.${world==='Moon'?' On the Moon it is about one-sixth of Earth\'s.':''}</p>`}
function animate(){clearInterval(anim);if(!drawR(0))return;let p=0;anim=setInterval(()=>{if(!$('#fSvg')||!$('#fSvg').isConnected){clearInterval(anim);return}p+=.05;drawR(Math.min(1,p));if(p>=1)clearInterval(anim)},40)}
function draw(){$('#fR').style.display=mode==='r'?'':'none';$('#fW').style.display=mode==='w'?'':'none';mode==='r'?animate():drawW()}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(!e.target||!e.target.classList||!e.target.classList.contains('fS'))return;if(e.target.id==='fA'){ang=+e.target.value;animate()}else{mass=+e.target.value;drawW()}})}
function labClick(){return false}
function labChange(t){if(t.id==='fM'){mode=t.value;draw();return true}if(t.id==='fSu'){surf=t.value;animate();return true}if(t.id==='fOil'){oil=t.checked;animate();return true}if(t.id==='fP'){g=+t.value;drawW();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
