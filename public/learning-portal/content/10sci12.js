/* Rai Plus content pack: Class 10 Science, Chapter 12 – Magnetic Effects of Electric Current */
RP.register({key:'10sci12',cls:'10',subject:'Science',ch:'12',title:"Magnetic Effects of Electric Current",color:'#1d4f91',
crumb:"HBSE Class 10 Science \u00b7 Unit: Effects of Current (12 marks) \u00b7 Taught in December",h1:"Chapter 12: Magnetic Effects of Electric Current",sub:"How a current makes a magnet, how a magnet pushes a current, and how your home stays safe.",heroLabel:"A bar magnet with field lines and four compass needles",labName:"Magnetism lab",
theme:"\n:root{--g:light-dark(#1d4f91,#8db6ef);--g2:light-dark(#e9f0fa,#152238);--line:light-dark(#d2deef,#283a58);--bg:light-dark(#ffffff,#0c1320);--card:light-dark(#ffffff,#111a2a);\n--ink:light-dark(#111a27,#e4ebf5);--mute:light-dark(#4f5f78,#9eb0c9);--y:light-dark(#d9822b,#e79a4c);--y2:light-dark(#fdf1e4,#2a1e12);--hd:#14365f;--ok:light-dark(#1d6b2a,#8be19a)}\n",labHTML:"  <h2>Magnetism lab</h2>\n  <p>Three working tools: draw the magnetic field of any source, practise Fleming's left-hand rule, and run the wiring of a house safely.</p>\n  <div class=\"ftabs\" role=\"group\" aria-label=\"Lab tool\"><button data-tool=\"field\" aria-pressed=\"true\">Field-line explorer</button><button data-tool=\"flem\" aria-pressed=\"false\">Fleming's rule trainer</button><button data-tool=\"home\" aria-pressed=\"false\">Home circuit</button></div>\n  <div id=\"t-field\">\n    <div class=\"sim\">\n      <div>\n        <div class=\"fig\" style=\"max-width:none\"><svg id=\"fsvg\" viewBox=\"0 0 600 400\" role=\"img\" aria-label=\"Magnetic field lines of the chosen source\" style=\"background:var(--g2);border-radius:12px;cursor:crosshair;color:var(--ink)\"></svg></div>\n        <p class=\"note\">Tap anywhere to place a compass. Its red end points along the field (the way a north pole would be pushed).</p>\n      </div>\n      <div>\n        <div class=\"ctrl\"><label>Source<select id=\"fsrc\"><option value=\"magnet\">Bar magnet</option><option value=\"wire\">Straight wire (seen end-on)</option><option value=\"loop\">Circular loop (seen edge-on)</option><option value=\"sol\">Solenoid (seen from the side)</option></select></label></div>\n        <div class=\"ctrl\"><label id=\"lI\">Current (A)<input type=\"range\" id=\"fI\" min=\"-3\" max=\"3\" step=\"1\" value=\"2\"></label><label id=\"lN\">Turns<input type=\"range\" id=\"fN\" min=\"1\" max=\"10\" step=\"1\" value=\"4\"></label></div>\n        <div class=\"ctrl\"><button class=\"btn\" id=\"frev\">Reverse current</button><button class=\"btn\" id=\"fclr\">Clear compasses</button></div>\n        <div class=\"box y\" id=\"finfo\" aria-live=\"polite\"></div>\n      </div>\n    </div>\n  </div>\n  <div id=\"t-flem\" hidden>\n    <div class=\"sim\">\n      <div><div class=\"fig\"><svg id=\"flsvg\" viewBox=\"0 0 420 300\" role=\"img\" aria-label=\"Directions of field and current\" style=\"color:var(--ink)\"></svg></div></div>\n      <div>\n        <h3 id=\"flq\"></h3>\n        <div class=\"opts\" id=\"flo\"></div>\n        <div id=\"flf\"></div>\n        <div class=\"ctrl\"><button class=\"btn p\" id=\"flnext\">Next question</button></div>\n        <p class=\"note\" id=\"flscore\"></p>\n      </div>\n    </div>\n  </div>\n  <div id=\"t-home\" hidden>\n    <div class=\"sim\">\n      <div>\n        <div class=\"fig\" style=\"max-width:none\"><svg id=\"hsvg\" viewBox=\"0 0 600 330\" role=\"img\" aria-label=\"House wiring with two circuits\" style=\"color:var(--ink)\"></svg></div>\n        <div id=\"hmsg\" class=\"box y\" aria-live=\"polite\"></div>\n      </div>\n      <div>\n        <h3>Switch appliances on and off</h3>\n        <div id=\"happs\" class=\"rows\"></div>\n        <div class=\"ctrl\"><label style=\"flex-direction:row;align-items:center;gap:8px\"><input type=\"checkbox\" id=\"hkettle5\" style=\"width:22px;height:22px\"> Plug the kettle into a 5 A lighting socket</label></div>\n        <div class=\"ctrl\"><label style=\"flex-direction:row;align-items:center;gap:8px\"><input type=\"checkbox\" id=\"hearth\" checked style=\"width:22px;height:22px\"> Earth wire connected</label></div>\n        <div class=\"ctrl\"><button class=\"btn\" id=\"hshort\">Cause a short circuit</button><button class=\"btn\" id=\"hfault\">Kettle body becomes live</button><button class=\"btn p\" id=\"hreset\">Replace blown fuses</button></div>\n      </div>\n    </div>\n  </div>\n",
build:function(){

const COP='#c8742c',NB='#2a62c9',RED='#d33b2f',BL='#2a62c9';
const ACC='#1d4f91',LABNAME='Magnetism lab',MIND_CENTER='Magnetic effects';
function bar(x,y,w,h){return `<rect x="${x}" y="${y}" width="${w/2}" height="${h}" fill="${BL}"/><rect x="${x+w/2}" y="${y}" width="${w/2}" height="${h}" fill="${RED}"/>`+T(x+w/4,y+h/2+6,'S','fill="#fff" font-weight="700" font-size="18"')+T(x+3*w/4,y+h/2+6,'N','fill="#fff" font-weight="700" font-size="18"')}
const fl=(d,c=NB)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="1.8"/>`;
function ahd(x,y,ang,c=NB){return `<path d="M0 -6 L11 0 L0 6 Z" fill="${c}" transform="translate(${x} ${y}) rotate(${ang})"/>`}
function wsym(x,y,out,r=11){return `<circle cx="${x}" cy="${y}" r="${r}" fill="${COP}" stroke="#7a4512" stroke-width="1.5"/>`+(out?`<circle cx="${x}" cy="${y}" r="3" fill="#fff"/>`:`<path d="M${x-6} ${y-6}L${x+6} ${y+6}M${x+6} ${y-6}L${x-6} ${y+6}" stroke="#fff" stroke-width="2.2"/>`)}
function compass(x,y,ang){return `<g transform="translate(${x} ${y}) rotate(${ang})"><circle r="13" fill="#fff" stroke="#5a6478" stroke-width="1.5"/><path d="M0 -4 L11 0 L0 4Z" fill="${RED}"/><path d="M0 -4 L-11 0 L0 4Z" fill="#5a6478"/></g>`}
function magLines(){let s='';for(let k=1;k<=3;k++){const yt=130-60*k,yb=130+60*k,mt=128.5-45*k,mb=131.5+45*k;s+=fl(`M340 124 C ${340+40*k} ${yt}, ${180-40*k} ${yt}, 180 124`)+ahd(260,mt,180)+fl(`M340 136 C ${340+40*k} ${yb}, ${180-40*k} ${yb}, 180 136`)+ahd(260,mb,180)}return s}
function horseshoe(){return `<path d="M60 40 h120 v60 h-60 v120 h60 v60 h-120 z" fill="none"/>`}
function heroDraw(){let s='';for(let k=1;k<=4;k++){const yt=60-11*k,yb=60+11*k;s+=`<path d="M232 ${60-4} C ${232+28*k} ${yt-20*k}, ${128-28*k} ${yt-20*k}, 128 ${60-4}" fill="none" stroke="#9cc3f5" stroke-width="2" opacity="${1-k*.15}"/><path d="M232 ${60+4} C ${232+28*k} ${yb+20*k}, ${128-28*k} ${yb+20*k}, 128 ${60+4}" fill="none" stroke="#9cc3f5" stroke-width="2" opacity="${1-k*.15}"/>`}
  return s+`<rect x="128" y="44" width="52" height="32" rx="3" fill="${BL}"/><rect x="180" y="44" width="52" height="32" rx="3" fill="${RED}"/>`+T(154,66,'S','fill="#fff" font-weight="700" font-size="18"')+T(206,66,'N','fill="#fff" font-weight="700" font-size="18"')+compass(40,60,0)+compass(320,60,0)+compass(180,14,180)+compass(180,106,180)}
const HERO=heroDraw;
const MIND=[['Field lines',90,60],['Straight wire',430,60],['Loop and solenoid',90,220],['Force: Fleming',430,220],['Domestic circuits',260,265]];

const C=[
{id:'m1',num:'12.1',title:'Magnetic field and field lines',
 intro:'A magnet affects the space around it. That region is its magnetic field, and field lines are how we draw it.',
 obj:'Describe a magnetic field, draw the field lines of a bar magnet and state their properties.',
 prior:'Magnets have north and south poles; like poles repel, unlike poles attract (Class 6).',
 simple:'A compass needle is a tiny magnet. Near a bar magnet it turns to point along the field. If you join up the directions a compass shows, you get field lines. They come out of the north pole, curve round, and go into the south pole.',
 detail:'The magnetic field is the region around a magnet in which its force can be detected. It has both size and direction, so it is a vector quantity. The direction of the field at a point is the direction in which the north pole of a compass needle points there. Field lines run from the north pole to the south pole outside the magnet, and from south to north inside it, so they are closed curves. Where the lines are crowded, the field is stronger. No two field lines ever cross, because a compass at the crossing point would have to point two ways at once.',
 real:'A compass works because the Earth itself behaves like a giant magnet. Fridge-door seals, speakers and motors all use magnetic fields.',
 apply:'Two field lines of a magnet are drawn crossing each other in a student\'s notebook. Explain why this must be a mistake.',
 see:{w:520,h:260,f:[
  ['A bar magnet: north pole (red) on the right, south pole (blue) on the left.',bar(180,112,160,36)],
  ['Field lines leave the north pole, curve round and enter the south pole.',magLines()],
  ['A compass placed on a line points along it: red end in the direction of the field.',compass(260,83,180)+compass(380,130,0)+compass(140,130,0)+compass(260,176,180)],
  ['Lines never cross, and they crowd together near the poles where the field is strongest.',T(260,250,'Closer lines = stronger field · inside the magnet, lines run S to N','font-size="14"')]]},
 seeNote:'Field-line shapes are schematic. Try the Field-line explorer for a calculated pattern.',
 do:{title:'Iron filings and compass plotting (board practical)',mat:'Bar magnet, white sheet, iron filings in a sprinkler, small compass, pencil',steps:['Place the magnet under the sheet and sprinkle filings evenly; tap the sheet gently.','Note the pattern, then remove the filings.','Put the compass near the N pole, mark both ends of the needle, move the compass so its tail sits on the last mark, and repeat until you reach the S pole.','Join the marks with a smooth curve and add arrows. Draw several lines.'],obs:'Filings form curved lines from pole to pole; the plotted lines match them and never cross.',why:'Each filing becomes a tiny magnet and lines up with the field, making the invisible field visible.',lab:true},
 memo:'"Out of North, into South" outside; "Never cross, crowd where strong".',
 miscon:['"Field lines are real strings." They are a drawing tool showing direction and strength.','"Lines stop at the poles." They continue inside the magnet from S to N, making closed loops.'],
 terms:['Magnetic field','Field lines','Compass'],
 q:{q:'Why do two magnetic field lines never cross each other?',o:['Because magnets are too weak','Because at the crossing point a compass would point in two directions at once','Because lines only exist outside the magnet','Because the field is zero there'],a:1,why:'The field has one direction at each point; a crossing would give two.'},
 exam:'Drawing field lines of a bar magnet with arrows and stating two properties is a frequent 2–3 mark question.'},
{id:'m2',num:'12.2.1',title:'Field due to a straight current-carrying wire',
 intro:'An electric current makes its own magnetic field. Oersted discovered this when a current deflected a compass needle.',
 obj:'Describe the field around a straight wire and how it depends on current and distance.',
 prior:'Electric current and circuits (Ch 11).',
 simple:'Put a compass near a wire and switch on the current: the needle swings. The wire\'s field forms circles around it. More current makes the field stronger; further away it gets weaker.',
 detail:'In 1820 Hans Christian Oersted noticed that a compass needle was deflected when a nearby wire carried current, showing that electricity and magnetism are linked. Around a straight conductor the field lines are concentric circles centred on the wire, in planes perpendicular to it. Reversing the current reverses the direction of the field. The strength of the field at a point increases with the current and decreases as the distance from the wire increases, which is why the circles are drawn further apart as they get bigger.',
 real:'Mobile chargers and power cables carry currents, so they have weak magnetic fields around them; this is why a compass misbehaves near live wiring.',
 apply:'A compass 5 cm from a wire deflects by a small angle. Name two ways to make it deflect more.',
 see:{w:520,h:280,f:[
  ['A straight wire passes vertically through a horizontal card. Current flows upwards.',`<ellipse cx="260" cy="150" rx="220" ry="48" fill="var(--g2)" stroke="var(--line)"/><line x1="260" y1="20" x2="260" y2="270" stroke="${COP}" stroke-width="6"/>`+ahd(260,40,-90,COP)+T(300,40,'current','font-size="14"')],
  ['The field lines are circles around the wire, in the plane of the card.',[50,95,140].map((r,i)=>`<ellipse cx="260" cy="150" rx="${r}" ry="${r*.24}" fill="none" stroke="${NB}" stroke-width="1.8"/>`+ahd(260,150+r*.24,0)).join('')],
  ['Near the wire the field is strongest. The circles get further apart as you move out.',compass(330,150,90)+T(260,262,'Stronger with more current · weaker further from the wire','font-size="14"')]]},
 seeNote:'Arrows show the field direction for an upward current, viewed from the front.',
 do:{title:'Oersted\'s experiment',mat:'1.5 V cell, 50 cm thick copper wire, switch (or plug key), compass',steps:['Lay the wire straight in a north–south line and put the compass just under it.','Close the switch briefly and watch the needle.','Swap the cell\'s connections to reverse the current and repeat.','Move the compass further from the wire and repeat.'],obs:'The needle swings when current flows, swings the other way when the current is reversed, and swings less when further away.',why:'The current produces a magnetic field around the wire; its direction depends on the current\'s direction.',lab:true},
 memo:'"Current makes circles": more current, more field; more distance, less field.',
 miscon:['"Only magnets have magnetic fields." Any current produces one.','"The field lines run along the wire." They circle around it.'],
 terms:['Oersted','Concentric circles','Current-carrying conductor'],
 q:{q:'What happens to the magnetic field at a point if the distance from the straight wire is increased?',o:['It increases','It decreases','It stays the same','It reverses direction'],a:1,why:'The field is strongest close to the wire and weakens with distance.'},
 exam:'1–2 mark questions on the field pattern and the factors it depends on; often paired with a diagram.'},
{id:'m3',num:'12.2.2',title:'The right-hand thumb rule',
 intro:'One quick rule with your right hand gives the direction of the field around any straight current.',
 obj:'Apply the right-hand thumb rule to find the direction of the field around a straight conductor.',
 prior:'Concept 12.2.1: circular field around a wire.',
 simple:'Hold the wire in your right hand with your thumb pointing along the current. Your fingers curl around the wire in the direction of the magnetic field.',
 detail:'The right-hand thumb rule (also called Maxwell\'s corkscrew rule) states: imagine holding a current-carrying straight conductor in your right hand so that the thumb points in the direction of the current; then the direction in which the fingers wrap around the conductor gives the direction of the magnetic field lines. For a vertical wire with current flowing upward, the field appears anticlockwise when viewed from above; with current flowing downward it appears clockwise.',
 real:'Electricians and engineers use this rule to predict which way a coil will magnetise.',
 apply:'Current flows vertically downward in a wire. Viewed from above, is the field clockwise or anticlockwise?',
 see:{w:520,h:280,f:[
  ['Grip the wire with your right hand, thumb along the current (upwards).',`<line x1="260" y1="20" x2="260" y2="270" stroke="${COP}" stroke-width="6"/>`+`<path d="M244 120 v-70" stroke="#e0a878" stroke-width="16" stroke-linecap="round"/>`+ahd(244,44,-90,'#8a5a3c')+T(190,60,'thumb = current','font-size="14"')],
  ['Your fingers curl round the wire. That curl is the direction of the field.',`<path d="M200 170 C 200 130, 320 130, 320 170 C 320 210, 200 210, 214 180" fill="none" stroke="#e0a878" stroke-width="14" stroke-linecap="round"/>`+`<ellipse cx="260" cy="170" rx="120" ry="34" fill="none" stroke="${NB}" stroke-width="2"/>`+ahd(260,204,0)+T(400,175,'fingers = field','font-size="14"')],
  ['Reverse the current and the field reverses: downward current gives a clockwise field seen from above.',T(260,262,'Upward current: anticlockwise from above · downward: clockwise','font-size="14"')]]},
 seeNote:'Always the right hand for this rule.',
 do:{title:'Pencil practice',mat:'A pencil (the wire), your right hand, a partner',steps:['Your partner points the pencil up, down, left or right and says "current".','Grip it with your right hand, thumb along the "current", and show the field direction with your fingers.','Check each other, then test your answer with the explorer in the lab.'],obs:'The finger curl flips every time the pencil is reversed.',why:'The rule ties the field\'s direction to the current\'s direction.',lab:true},
 memo:'"Thumbs up for current, fingers curl for field." Right hand only.',
 miscon:['"Use the left hand." The left-hand rule is for force (Fleming); field around a wire uses the right hand.','"Thumb shows the field." The thumb shows current; fingers show field.'],
 terms:['Right-hand thumb rule','Maxwell\'s corkscrew rule'],
 q:{q:'A vertical wire carries current downward. Viewed from above, the magnetic field lines are:',o:['Anticlockwise circles','Clockwise circles','Straight lines pointing up','Straight lines pointing down'],a:1,why:'Thumb pointing down, fingers curl clockwise when seen from above.'},
 exam:'Commonly asked as "state the rule" (2 marks) or as a direction question in a diagram.'},
{id:'m4',num:'12.2.3',title:'Field due to a circular loop',
 intro:'Bend the wire into a loop and the fields from every part of the loop add up at the centre.',
 obj:'Describe the field pattern of a current-carrying circular loop and the factors that affect its strength.',
 prior:'Concepts 12.2.1 and 12.2.2.',
 simple:'Every small piece of the loop makes circles of field. Near the wire the lines look like circles; at the centre of the loop they become straight lines, all pointing the same way. More turns of wire make the field stronger.',
 detail:'Each segment of a circular loop produces concentric field lines around itself. Near the wire they are circular; as we move towards the centre the circles become larger, and at the centre the arcs look like straight lines. By the right-hand thumb rule, every section of the loop makes the field at the centre point in the same direction, so the contributions add. The field at the centre is proportional to the current and to the number of turns n: a coil of n turns produces a field n times that of a single turn, because the current in every turn flows in the same direction.',
 real:'Coils, not straight wires, are used in electric bells and relays because the turns add up to a much stronger field.',
 apply:'A coil of 20 turns is replaced by one of 50 turns with the same current. How does the field at the centre change?',
 see:{w:520,h:260,f:[
  ['A loop seen edge-on: current comes out of the page on the left and goes in on the right.',wsym(150,130,true)+wsym(370,130,false)+T(150,170,'out','font-size="13"')+T(370,170,'in','font-size="13"')],
  ['Near each side of the wire, the field lines are circles.',[22,40].map(r=>`<circle cx="150" cy="130" r="${r}" fill="none" stroke="${NB}" stroke-width="1.6"/><circle cx="370" cy="130" r="${r}" fill="none" stroke="${NB}" stroke-width="1.6"/>`).join('')+ahd(150+40,130,-90)+ahd(370-40,130,-90)],
  ['At the centre the lines are nearly straight and all point the same way.',[230,260,290].map(x=>fl(`M${x} 230 L${x} 30`)+ahd(x,60,-90)).join('')],
  ['n turns carrying the same current give a field n times stronger.',T(260,250,'Field at centre ∝ current × number of turns','font-size="14"')]]},
 seeNote:'The loop is drawn edge-on: a dot means current towards you, a cross means away.',
 do:{title:'Loop through a card',mat:'Thick copper wire bent into a loop, cardboard, iron filings, cell, switch',steps:['Push the loop through two holes in the card so it stands upright.','Sprinkle filings on the card, close the switch briefly and tap the card.','Repeat with a coil of 3 or 4 turns.'],obs:'Filings form circles near the wire and nearly straight lines at the centre; the pattern is sharper with more turns.',why:'Fields from all parts of the loop add up at its centre.'},
 memo:'"Loop the wire, line up the field": circles at the edge, straight in the middle.',
 miscon:['"The field is zero at the centre of a loop." It is strongest and straightest there.'],
 terms:['Circular loop','Number of turns'],
 q:{q:'The field at the centre of a circular coil becomes stronger when:',o:['The number of turns is decreased','The current is increased','The current is switched off','The wire is made of plastic'],a:1,why:'The field at the centre increases with current and with the number of turns.'},
 exam:'Short-answer questions on the pattern and the factors; a diagram earns marks.'},
{id:'m5',num:'12.2.4',title:'The solenoid and the electromagnet',
 intro:'Wind many loops one after another and you get a solenoid, which behaves just like a bar magnet.',
 obj:'Describe the field of a solenoid and explain how an electromagnet is made.',
 prior:'Concept 12.2.3: field of a loop.',
 simple:'A solenoid is a long coil of insulated wire. With current flowing, one end becomes a north pole and the other a south pole, just like a bar magnet. Inside, the field lines are straight and parallel: the field is the same everywhere. Put a soft iron rod inside and you get a strong electromagnet that you can switch on and off.',
 detail:'A coil of many circular turns of insulated copper wire wrapped closely in the shape of a cylinder is called a solenoid. The field-line pattern around a current-carrying solenoid is similar to that of a bar magnet, so one end acts as a north pole and the other as a south pole. The field lines inside a long solenoid are parallel straight lines, showing that the field is uniform inside. A strong field inside a solenoid can magnetise a piece of magnetic material, such as soft iron, placed inside the coil. The magnet so formed is called an electromagnet; it is magnetic only while current flows.',
 real:'Cranes in scrap yards lift cars with electromagnets and drop them by switching off the current. Electric bells and door locks use them too.',
 apply:'Why is soft iron, not steel, used as the core of an electromagnet in a scrap-yard crane?',
 see:{w:520,h:260,f:[
  ['A solenoid: insulated wire wound into a long coil.',[0,1,2,3,4,5,6,7,8].map(i=>`<ellipse cx="${150+i*28}" cy="130" rx="12" ry="46" fill="none" stroke="${COP}" stroke-width="4"/>`).join('')],
  ['Inside, the field lines are straight and parallel: the field is uniform.',[110,130,150].map(y=>fl(`M120 ${y} L400 ${y}`)+ahd(270,y,0)).join('')],
  ['Outside, the lines curve round from one end to the other, like a bar magnet. Here the right end is the north pole.',fl('M400 110 C 470 40, 50 40, 120 110')+ahd(260,58,180)+fl('M400 150 C 470 220, 50 220, 120 150')+ahd(260,202,180)+T(430,135,'N','font-weight="700" font-size="20" fill="'+RED+'"')+T(92,135,'S','font-weight="700" font-size="20" fill="'+BL+'"')],
  ['Put a soft iron core inside: it becomes a strong electromagnet, magnetic only while current flows.',`<rect x="130" y="122" width="260" height="16" fill="#8a96a8"/>`+T(260,250,'Soft iron core → electromagnet','font-size="14"')]]},
 seeNote:'Which end is north depends on the direction of the current; use the explorer to reverse it.',
 do:{title:'Make an electromagnet',mat:'Large iron nail, 1 m insulated copper wire, 1.5 V cell, paper clips',steps:['Wind 20 turns of wire around the nail; connect the ends to the cell for a few seconds at a time.','Count how many paper clips the nail lifts.','Repeat with 40 turns, then switch off and see what happens.'],obs:'More turns lift more clips; the clips drop when the current stops.',why:'The coil\'s field magnetises the iron core only while current flows. Safety: the wire can get warm, so connect only for short bursts.',lab:true},
 memo:'"Solenoid = switchable bar magnet." Straight lines inside, bar-magnet loops outside.',
 miscon:['"An electromagnet is a permanent magnet." It loses its magnetism when the current stops.','"The field inside a solenoid is zero." It is uniform and strong inside.'],
 terms:['Solenoid','Uniform field','Electromagnet','Soft iron core'],
 q:{q:'The magnetic field inside a long straight current-carrying solenoid is:',o:['Zero','Weaker at the centre than at the ends','The same at all points','Strongest at the ends only'],a:2,why:'Parallel straight lines inside show the field is uniform.'},
 exam:'"Draw the field of a solenoid" and "how is an electromagnet made" are standard 2–3 mark questions.'},
{id:'m6',num:'12.3',title:'Force on a conductor in a magnetic field',
 intro:'A magnet pushes on a current-carrying wire. Fleming\'s left-hand rule tells you which way.',
 obj:'Explain the force on a current-carrying conductor in a magnetic field and use Fleming\'s left-hand rule.',
 prior:'Concepts 12.1 and 12.2: fields of magnets and currents.',
 simple:'A wire carrying current makes its own field. Put it in another magnet\'s field and the two fields push on each other, so the wire moves. Reverse the current or the magnet and the push reverses. Stretch out your left hand: forefinger for the field, middle finger for the current, thumb shows the motion.',
 detail:'When an aluminium rod carrying current is placed between the poles of a horseshoe magnet, it is displaced. The displacement reverses when the direction of the current or of the field is reversed, showing that the force depends on both directions. The force is largest when the current is perpendicular to the field. Fleming\'s left-hand rule: stretch the thumb, forefinger and middle finger of the left hand so they are mutually perpendicular. If the forefinger points in the direction of the magnetic field and the middle finger in the direction of the current, the thumb points in the direction of motion (force) on the conductor. Devices that use current-carrying conductors in magnetic fields include electric motors, loudspeakers and electric measuring instruments. Inside the body, tiny currents in nerves produce weak magnetic fields; MRI scanners use strong magnetic fields to image the body.',
 real:'Every ceiling fan, mixer and electric vehicle motor turns because of this force.',
 apply:'In a fan motor, what two changes could make it spin the opposite way?',
 see:{w:520,h:280,f:[
  ['Two magnet poles face each other: N on the left, S on the right. The field points from N to S.',`<rect x="40" y="70" width="80" height="120" rx="6" fill="${RED}"/><rect x="400" y="70" width="80" height="120" rx="6" fill="${BL}"/>`+T(80,136,'N','fill="#fff" font-weight="700" font-size="22"')+T(440,136,'S','fill="#fff" font-weight="700" font-size="22"')+[100,130,160].map(y=>fl(`M125 ${y} L395 ${y}`)+ahd(330,y,0)).join('')],
  ['A rod carrying current into the page sits in the field.',wsym(260,130,false,16)+T(345,118,'current into page','font-size="13"')],
  ['The rod is pushed downwards. Reverse the current or the poles and it is pushed up.',`<line x1="260" y1="150" x2="260" y2="235" stroke="#0f8a3a" stroke-width="5"/>`+ahd(260,238,90,'#0f8a3a')+T(300,232,'force','font-size="14" fill="#0f8a3a"')],
  ['Fleming\'s left-hand rule: Forefinger = Field, seCond finger = Current, thuMb = Motion.',T(260,268,'Left hand: F-ield · C-urrent · M-otion, all at right angles','font-size="14"')]]},
 seeNote:'Here: field to the right, current into the page, so the force is down. Check it with your left hand.',
 do:{title:'Fleming\'s rule trainer',mat:'Your left hand and the trainer in the Magnetism lab',steps:['Read the field and current directions on screen.','Point your left forefinger along the field and middle finger along the current.','Your thumb gives the motion. Choose your answer, then check the explanation.','Do 10 in a row and record your score.'],obs:'After a few tries, the rule becomes automatic.',why:'The force is at right angles to both the field and the current.',lab:true},
 memo:'"FBI" on the left hand: thuMb = Motion (F), Forefinger = B (field), middle = I (current). Or: Father (thumb, force), Mother (forefinger, magnetic field), Child (middle, current).',
 miscon:['"The force is along the field." It is at right angles to both field and current.','"Use the right hand." Force on a conductor uses the left hand.'],
 terms:['Fleming\'s left-hand rule','Force on a conductor','Electric motor','MRI'],
 q:{q:'In Fleming\'s left-hand rule, the forefinger points along:',o:['The current','The magnetic field','The motion of the conductor','The electrons\' speed'],a:1,why:'Forefinger = field, middle finger = current, thumb = motion.'},
 exam:'"State Fleming\'s left-hand rule" (2 marks) and direction questions with diagrams appear almost every year.'},
{id:'m7',num:'12.4',title:'Domestic electric circuits',
 intro:'Your home wiring uses everything in this chapter and the last, plus safety devices that can save lives.',
 obj:'Describe how houses are wired and explain fuses, earthing, overloading and short-circuiting.',
 prior:'Ch 11: current, power P = VI, parallel circuits.',
 simple:'Electricity reaches homes through a live wire (red insulation) and a neutral wire (black). In India the supply is 220 V at 50 Hz. Appliances are connected in parallel so each gets 220 V and can be switched on its own. A fuse melts if too much current flows. The earth wire (green) carries leaking current safely into the ground.',
 detail:'Power comes from the pole through a main fuse and the electricity meter to a distribution box. The live wire carries red insulation, the neutral black, and the earth wire green; the potential difference between live and neutral is 220 V. Usually two separate circuits are used: one of 15 A rating for high-power appliances such as geysers and air coolers, and one of 5 A for bulbs and fans. Each appliance is connected in parallel across live and neutral, with its own switch. The earth wire is connected to a metal plate deep in the ground and to the metal bodies of appliances: if live touches the body, current flows to earth instead of through a person. Overloading happens when too many appliances draw current from one socket, or the supply voltage rises; short-circuiting happens when live and neutral touch directly, so resistance falls and current becomes very large. A fuse in series, or an MCB, breaks the circuit in such cases and protects wiring and appliances.',
 real:'An MCB that "trips" when a geyser and a heater run together is protecting your home from overloading.',
 apply:'A 2000 W geyser and a 1500 W kettle run together on a 15 A circuit at 220 V. Will the fuse blow? Show the calculation.',
 see:{w:520,h:280,f:[
  ['From the pole: live wire (red) and neutral wire (black), 220 V at 50 Hz.',`<line x1="20" y1="60" x2="500" y2="60" stroke="${RED}" stroke-width="4"/><line x1="20" y1="240" x2="500" y2="240" stroke="#222" stroke-width="4"/>`+T(60,50,'live','font-size="13"')+T(60,262,'neutral','font-size="13"')],
  ['A main fuse and the meter come first, then a distribution box.',`<rect x="80" y="45" width="50" height="30" rx="4" fill="#f5e3c6" stroke="#9a6a2a"/>`+T(105,66,'fuse','font-size="12"')+`<rect x="150" y="40" width="60" height="40" rx="6" fill="#dde6f3" stroke="#5a6478"/>`+T(180,66,'meter','font-size="12"')],
  ['Two circuits in parallel: 5 A for lights and fans, 15 A for heavy appliances. Each appliance has its own switch.',[[260,'bulb (5 A)'],[340,'fan (5 A)'],[440,'geyser (15 A)']].map(([x,n])=>`<line x1="${x}" y1="60" x2="${x}" y2="240" stroke="#888" stroke-width="2"/><rect x="${x-34}" y="130" width="68" height="40" rx="8" fill="#fff4d6" stroke="#b58a1c"/>`+T(x,155,n,'font-size="11"')).join('')],
  ['The green earth wire joins metal bodies to the ground, so a leaking current goes to earth, not through you.',`<path d="M440 170 L470 170 L470 270" stroke="#1d8a3a" stroke-width="3" fill="none" stroke-dasharray="6 4"/>`+T(470,276,'earth','font-size="12" fill="#1d8a3a"')]]},
 seeNote:'A simplified diagram. Never open live wiring; this is for understanding only.',
 do:{title:'Inspect a plug and a distribution board (with a teacher, power off)',mat:'A three-pin plug, a screwdriver, the school\'s distribution board (viewed only)',steps:['Open an unplugged three-pin plug and identify the live, neutral and earth pins and wire colours.','Notice that the earth pin is longest and thickest.','With the teacher, look at the MCBs on the board and read their ratings.','Then try the Home circuit tool in the lab.'],obs:'Earth pin longest; MCBs marked with current ratings.',why:'The longer earth pin connects first, so the body is earthed before it is live. Safety: never touch wiring that is connected to the mains.',lab:true},
 memo:'"Red runs, black returns, green guards." Fuse in series, appliances in parallel.',
 miscon:['"A fuse is connected in parallel." It must be in series to break the circuit.','"Earthing is only for big appliances." Any metal-bodied appliance should be earthed.'],
 terms:['Live, neutral, earth','Fuse','MCB','Overloading','Short-circuiting'],
 q:{q:'Why are household appliances connected in parallel?',o:['To share the voltage between them','So each gets the full 220 V and can be switched on or off independently','To reduce the total current to zero','Because fuses only work in parallel'],a:1,why:'In parallel each appliance gets the full supply voltage and has its own switch.'},
 exam:'Long-answer favourite: draw a domestic circuit; explain fuse, earthing, overloading and short-circuiting.'}
];

const CARDS=[['Magnetic field','The region around a magnet where its force can be detected.'],['Direction of field at a point','The direction in which a compass needle\'s north pole points.'],['Field lines outside a magnet','From north pole to south pole.'],['Why field lines never cross','A compass would have to point two ways at the crossing.'],['Oersted\'s discovery','A current in a wire deflects a nearby compass needle.'],['Field around a straight wire','Concentric circles; stronger with more current, weaker further away.'],['Right-hand thumb rule','Thumb along current, curled fingers give the field direction.'],['Field at centre of a loop','Straight lines; increases with current and number of turns.'],['Solenoid','A long coil of insulated wire; behaves like a bar magnet, uniform field inside.'],['Electromagnet','A soft iron core inside a solenoid; magnetic only while current flows.'],['Fleming\'s left-hand rule','Forefinger field, middle finger current, thumb motion (force).'],['When is force on a conductor largest?','When the current is at right angles to the field.'],['Domestic supply in India','220 V, 50 Hz; live red, neutral black, earth green.'],['Two household circuits','5 A for lights and fans; 15 A for high-power appliances.'],['Overloading','Too much current drawn from one circuit or socket.'],['Short-circuiting','Live and neutral touch; resistance falls, current rises sharply.'],['Fuse','Thin wire in series that melts when current exceeds its rating.'],['Earth wire','Carries leaking current to the ground so the user is not shocked.']];

const Q=[
 {lv:1,q:'Outside a bar magnet, magnetic field lines go from:',o:['South pole to north pole','North pole to south pole','The middle to the ends','Nowhere: they are closed only inside'],a:1,w:'Outside the magnet, lines go from N to S; inside, from S to N.'},
 {lv:1,q:'Which instrument shows the direction of a magnetic field at a point?',o:['Ammeter','Voltmeter','Compass','Thermometer'],a:2,w:'A compass needle lines up along the field.'},
 {lv:1,q:'True or false: two magnetic field lines can cross each other.',o:['True','False'],a:1,w:'False: the field has only one direction at each point.'},
 {lv:1,q:'Fill in the blank: the earth wire has ________ insulation.',o:['red','black','green','blue'],a:2,w:'Live red, neutral black, earth green.'},
 {lv:1,q:'The field lines around a straight current-carrying wire are:',o:['Parallel straight lines','Concentric circles','Spirals','Radial lines'],a:1,w:'They are concentric circles centred on the wire.'},
 {lv:2,q:'If you move a compass further away from a current-carrying wire, the field it detects:',o:['Increases','Decreases','Stays the same','Becomes zero at once'],a:1,w:'The field weakens with distance.'},
 {lv:2,q:'The field inside a long current-carrying solenoid is:',o:['Zero','Uniform','Strongest at one end only','Circular'],a:1,w:'Parallel straight lines inside show a uniform field.'},
 {lv:2,q:'A fuse is connected in series with the live wire because:',o:['It increases the voltage','It must carry the whole current so it can break the circuit when the current is too high','It earths the appliance','It reduces resistance'],a:1,w:'In series, all the current passes through the fuse, so it can cut the circuit.'},
 {lv:3,q:'A conductor carries current to the right, and the magnetic field points into the page. Which way is the force on the conductor?',o:['Up the page','Down the page','To the left','Out of the page'],a:0,w:'Forefinger into the page (field), middle finger to the right (current): thumb points up.'},
 {lv:3,q:'A 2 kW heater runs on 220 V. Which circuit should it use?',o:['The 5 A lighting circuit, since it draws about 0.9 A','The 15 A power circuit, since it draws about 9.1 A','Either, since current does not matter','Neither: it needs 50 A'],a:1,w:'I = P/V = 2000/220 ≈ 9.1 A, more than 5 A, so the 15 A circuit.'},
 {lv:3,q:'A 2000 W geyser and a 1500 W kettle run together on a 15 A circuit at 220 V. What happens?',o:['The fuse blows, because the current is about 25 A','Nothing: the total current is about 15.9 A, which is safe','The fuse blows, because the total current is about 15.9 A','The geyser stops but the kettle works'],a:2,w:'I = 3500/220 ≈ 15.9 A, more than 15 A, so the fuse blows (overloading).'},
 {lv:4,q:'Assertion (A): The field at the centre of a circular coil increases with the number of turns. Reason (R): The fields produced by each turn add up because the current in every turn flows in the same direction.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'Each turn adds to the field at the centre.'},
 {lv:4,q:'Assertion (A): Earthing protects the user from electric shock. Reason (R): The earth wire provides a low-resistance path for leaking current to the ground.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'Leaking current takes the easy path to earth rather than through the person.'},
 {lv:4,q:'What if the current in a conductor were parallel to the magnetic field? The force on it would be:',o:['Maximum','Zero','Equal to its weight','Along the field'],a:1,w:'The force is greatest when current and field are perpendicular and zero when they are parallel.'},
 {lv:5,open:true,m:3,q:'Draw the magnetic field lines of a bar magnet and write any two properties of field lines.',ans:['Correct closed lines from N to S outside, with arrows (1).','Property 1: they never cross; property 2: closer lines mean a stronger field (or: inside the magnet they run S to N) (1 + 1).']},
 {lv:5,open:true,m:3,q:'State the right-hand thumb rule. Find the direction of the field around a vertical wire carrying current downward, viewed from above.',ans:['Statement: thumb along current, fingers curl in the direction of the field (2).','Downward current: clockwise when viewed from above (1).']},
 {lv:5,open:true,m:3,q:'State Fleming\'s left-hand rule with a labelled diagram. Name one device that works on this principle.',ans:['Three fingers mutually perpendicular: forefinger field, middle finger current, thumb motion (2).','Device: electric motor, loudspeaker or measuring meter (1).']},
 {lv:5,open:true,m:2,q:'Why does a current-carrying solenoid behave like a bar magnet? How can it be made into an electromagnet?',ans:['Its field pattern matches a bar magnet\'s, one end N, the other S (1).','Place a soft iron core inside; it is magnetised while current flows (1).']},
 {lv:5,open:true,m:5,q:'Draw a schematic of a domestic circuit. Explain the role of the fuse and the earth wire, and the terms overloading and short-circuiting.',ans:['Diagram: live, neutral, earth, main fuse, meter, distribution box, two circuits with appliances in parallel (2).','Fuse in series melts when current exceeds rating, protecting wiring (1).','Earth wire takes leaking current to ground, protecting the user (1).','Overloading: too much current drawn; short-circuit: live touches neutral and current rises sharply (1).']}
];

const ONEMIN=['A magnetic field is the region where a magnet\'s force acts; a compass shows its direction.','Field lines: N to S outside, S to N inside; closed; never cross; crowded where strong.','Oersted: a current produces a magnetic field.','Straight wire: concentric circles; stronger with more current, weaker further away.','Right-hand thumb rule: thumb = current, fingers = field.','Loop: straight lines at centre; field ∝ current × turns.','Solenoid: like a bar magnet, uniform inside; soft iron core makes an electromagnet.','Fleming\'s left-hand rule: Forefinger field, middle current, thumb motion; force largest when current ⟂ field.','Home: 220 V, 50 Hz; live red, neutral black, earth green; 5 A and 15 A circuits in parallel; fuse/MCB against overloading and short circuits; earthing protects users.'];
const KEYS=[['field lines N to S',/north|n to s|n.*s/i],['lines never cross',/cross/i],['compass',/compass/i],['Oersted / current makes field',/oersted|current/i],['concentric circles',/circle/i],['right-hand thumb rule',/right/i],['loop / turns',/turn|loop/i],['solenoid',/solenoid/i],['electromagnet / soft iron',/electromagnet|iron/i],['Fleming\'s left-hand rule',/fleming|left/i],['220 V household supply',/220/],['fuse',/fuse|mcb/i],['earthing',/earth/i],['overloading or short circuit',/overload|short/i]];


/* ---------- field explorer ---------- */
const LAB={src:'magnet',I:2,n:4,comp:[]};
function sources(){const I=LAB.I,n=LAB.n;
  if(LAB.src==='wire')return [[300,200,I]];
  if(LAB.src==='loop')return [[210,200,I*n],[390,200,-I*n]];
  if(LAB.src==='sol'){const k=n+2,w=[];for(let i=0;i<k;i++){const x=230+140*i/(k-1);w.push([x,160,I*.9],[x,240,-I*.9])}return w}
  return []}
function Bat(px,py){let bx=0,by=0;
  if(LAB.src==='magnet'){[[352,200,3],[248,200,-3]].forEach(([x,y,q])=>{const dx=px-x,dy=py-y,r2=dx*dx+dy*dy+1;const r=Math.sqrt(r2);bx+=q*dx/(r2*r)*1000;by+=q*dy/(r2*r)*1000})}
  else sources().forEach(([x,y,I])=>{const dx=px-x,dy=py-y,r2=dx*dx+dy*dy+4;bx+=I*dy/r2*100;by+=-I*dx/r2*100});
  return [bx,by]}
function nearSrc(x,y){if(LAB.src==='magnet')return x>244&&x<356&&y>187&&y<213;return sources().some(([sx,sy])=>(x-sx)**2+(y-sy)**2<100)}
function trace(x0,y0,dir){const pts=[[x0,y0]];let x=x0,y=y0;for(let i=0;i<1400;i++){const [bx,by]=Bat(x,y),m=Math.hypot(bx,by);if(m<1e-9)break;x+=dir*2.5*bx/m;y+=dir*2.5*by/m;if(x<0||x>600||y<0||y>400)break;if(i>4&&nearSrc(x,y))break;pts.push([x,y]);if(i>80&&(x-x0)**2+(y-y0)**2<9){pts.push([x0,y0]);break}}return pts}
function seeds(){const s=[];
  if(LAB.src==='magnet'){for(let a=-150;a<=150;a+=20){const r=a*Math.PI/180;const x=356+8*Math.cos(r),y=200+14*Math.sin(r);s.push([x,y,1])}}
  else if(LAB.src==='wire'){[30,60,95,135,180,230].forEach(r=>s.push([300+r,200,1]))}
  else if(LAB.src==='loop'){[-90,-60,-35,-15,0,15,35,60,90].forEach(d=>s.push([300,200+d,1]));[18,34].forEach(r=>{s.push([210-r,200,1]);s.push([390+r,200,1])})}
  else{[-28,-16,-6,6,16,28].forEach(d=>s.push([300,200+d,1]))}
  return s}
function drawField(){const sv=$('#fsvg');let h='';
  if(LAB.src!=='magnet'&&LAB.I===0){sv.innerHTML=T(300,200,'No current, so no magnetic field.','font-size="18"');fInfo();return}
  seeds().forEach(([x,y,d])=>{const f=trace(x,y,1),bk=LAB.src==='magnet'?[]:trace(x,y,-1).slice(1).reverse();const closed=f.length>2&&(f[f.length-1][0]-x)**2+(f[f.length-1][1]-y)**2<10;const p=closed?f:bk.concat(f);if(p.length<6)return;h+=`<path d="M${p.map(q=>q[0].toFixed(1)+' '+q[1].toFixed(1)).join('L')}" fill="none" stroke="${NB}" stroke-width="1.6" opacity=".85"/>`;const m=Math.floor(p.length/2),a=p[m],b=p[Math.min(m+2,p.length-1)];h+=ahd(a[0],a[1],Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI)});
  if(LAB.src==='magnet')h+=`<rect x="240" y="185" width="60" height="30" fill="${BL}"/><rect x="300" y="185" width="60" height="30" fill="${RED}"/>`+T(270,206,'S','fill="#fff" font-weight="700"')+T(330,206,'N','fill="#fff" font-weight="700"');
  else{if(LAB.src==='sol')h+=`<rect x="220" y="150" width="160" height="100" rx="6" fill="none" stroke="${COP}" stroke-dasharray="5 4"/>`;sources().forEach(([x,y,I])=>h+=wsym(x,y,I>0,9))}
  LAB.comp.forEach(([x,y])=>{const [bx,by]=Bat(x,y);h+=compass(x,y,Math.atan2(by,bx)*180/Math.PI)});
  sv.innerHTML=h;fInfo()}
function fInfo(){const I=LAB.I,s=LAB.src,dir=I>0?'out of the page (dot)':'into the page (cross)';let t='';
  if(s==='magnet')t='Lines leave the north pole and enter the south pole. Place compasses around the magnet to check the direction.';
  else if(I===0)t='Set a current to see the field.';
  else if(s==='wire')t=`Current ${dir}, ${Math.abs(I)} A. The field lines are circles: ${I>0?'anticlockwise':'clockwise'} as you look at the screen. Right-hand thumb rule: thumb ${I>0?'towards you':'away from you'}, fingers curl ${I>0?'anticlockwise':'clockwise'}.`;
  else if(s==='loop')t=`${LAB.n} turn${LAB.n>1?'s':''}, ${Math.abs(I)} A. Circles near the wire, nearly straight lines at the centre pointing ${I>0?'up':'down'}. More turns or more current, stronger field.`;
  else t=`Solenoid with ${LAB.n+2} turns shown, ${Math.abs(I)} A. Straight, uniform field inside pointing ${I>0?'right':'left'}, so the ${I>0?'right':'left'} end is the north pole. Like a bar magnet.`;
  $('#finfo').textContent=t;$('#lI').style.display=s==='magnet'?'none':'';$('#lN').style.display=(s==='loop'||s==='sol')?'':'none'}
/* ---------- Fleming trainer ---------- */
const DIR={right:[1,0,0],left:[-1,0,0],up:[0,1,0],down:[0,-1,0],out:[0,0,1],in:[0,0,-1]};
const DN={right:'to the right',left:'to the left',up:'up the page',down:'down the page',out:'out of the page (towards you)',in:'into the page (away from you)'};
const cross3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const keyOf=v=>Object.keys(DIR).find(k=>DIR[k].every((x,i)=>x===v[i]));
let FL={I:'right',B:'in',done:false,score:0,tot:0};
function arrowSym(cx,cy,d,col,label){let s='';if(d==='out')s=`<circle cx="${cx}" cy="${cy}" r="22" fill="none" stroke="${col}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="5" fill="${col}"/>`;else if(d==='in')s=`<circle cx="${cx}" cy="${cy}" r="22" fill="none" stroke="${col}" stroke-width="3"/><path d="M${cx-12} ${cy-12}L${cx+12} ${cy+12}M${cx+12} ${cy-12}L${cx-12} ${cy+12}" stroke="${col}" stroke-width="3"/>`;else{const v=DIR[d];const x2=cx+v[0]*55,y2=cy-v[1]*55;s=`<line x1="${cx-v[0]*55}" y1="${cy+v[1]*55}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="5"/>`+ahd(x2,y2,Math.atan2(-v[1],v[0])*180/Math.PI,col)}return s+T(cx,cy+(d==='up'||d==='down'?0:0)+92,label,'font-size="15" font-weight="700" fill="'+col+'"')}
function flNew(){const ks=Object.keys(DIR);let I,B;do{I=ks[rand(6)];B=ks[rand(6)]}while(DIR[I].some((x,i)=>x!==0&&DIR[B][i]!==0));FL.I=I;FL.B=B;FL.done=false;
  $('#flsvg').innerHTML=`<rect x="0" y="0" width="420" height="300" rx="12" fill="var(--g2)"/>`+arrowSym(110,130,B,NB,'Field (B)')+arrowSym(310,130,I,COP,'Current (I)');
  $('#flq').textContent=`The magnetic field points ${DN[B]}. The current flows ${DN[I]}. Which way is the force on the conductor?`;
  $('#flo').innerHTML=shuf(ks.slice()).map(k=>`<button data-fl="${k}">${DN[k]}</button>`).join('');$('#flf').innerHTML='';$('#flscore').textContent=FL.tot?`Score: ${FL.score} of ${FL.tot}`:''}
/* ---------- home circuit ---------- */
const APPS=[['LED bulb',10,'L'],['Tube light',40,'L'],['Ceiling fan',75,'L'],['Television',120,'L'],['Laptop charger',65,'L'],['Refrigerator',200,'P'],['Electric iron',1000,'P'],['Electric kettle',1500,'P'],['Water geyser',2000,'P'],['Air conditioner',1500,'P']];
let HS={on:{},blown:{L:false,P:false},msg:'Switch on appliances and watch the current in each circuit.',danger:false};
const circ=a=>a[0]==='Electric kettle'&&$('#hkettle5')&&$('#hkettle5').checked?'L':a[2];
function cload(c){return APPS.filter(a=>circ(a)===c&&HS.on[a[0]]).reduce((s,a)=>s+a[1],0)}
function hCheck(){['L','P'].forEach(c=>{const I=cload(c)/220,R=c==='L'?5:15;if(!HS.blown[c]&&I>R){HS.blown[c]=true;HS.msg=`Overloading! The ${c==='L'?'5 A lighting':'15 A power'} circuit drew ${I.toFixed(1)} A, more than its ${R} A fuse allows, so the fuse melted and cut the circuit. Switch something off and replace the fuse.`;HS.danger=false}})}
function hDraw(){hCheck();const sv=$('#hsvg');let h=`<rect x="0" y="0" width="600" height="330" rx="12" fill="var(--g2)"/>`;
  h+=`<line x1="20" y1="40" x2="580" y2="40" stroke="${RED}" stroke-width="4"/><line x1="20" y1="290" x2="580" y2="290" stroke="#222" stroke-width="4"/><line x1="20" y1="312" x2="580" y2="312" stroke="#1d8a3a" stroke-width="3" stroke-dasharray="7 4" opacity="${$('#hearth').checked?1:.25}"/>`+T(52,32,'live 220 V','font-size="12"')+T(48,282,'neutral','font-size="12"')+T(48,326,'earth','font-size="12" fill="#1d8a3a"');
  [['L',40,'5 A lighting circuit'],['P',320,'15 A power circuit']].forEach(([c,x0,n])=>{const I=cload(c)/220,R=c==='L'?5:15,b=HS.blown[c];
    h+=`<rect x="${x0}" y="58" width="240" height="214" rx="10" fill="var(--card)" stroke="var(--line)"/>`+T(x0+120,80,n,'font-weight="700" font-size="14"')+`<rect x="${x0+90}" y="88" width="60" height="18" rx="4" fill="${b?'#555':'#f5e3c6'}" stroke="#9a6a2a"/>`+T(x0+120,101,b?'BLOWN':'fuse '+R+' A','font-size="11"'+(b?' fill="#fff"':''));
    const apps=APPS.filter(a=>circ(a)===c);apps.forEach((a,i)=>{const on=HS.on[a[0]]&&!b,x=x0+20+(i%3)*76,y=118+Math.floor(i/3)*58;h+=`<rect x="${x}" y="${y}" width="68" height="46" rx="8" fill="${on?'#ffe48a':'#eef0f3'}" stroke="${on?'#c79a12':'#b8c0cc'}"/>`+T(x+34,y+20,a[0].split(' ').slice(-1)[0],'font-size="11"')+T(x+34,y+36,a[1]+' W','font-size="10"')});
    h+=`<rect x="${x0+20}" y="244" width="200" height="12" rx="6" fill="#dfe5ee"/><rect x="${x0+20}" y="244" width="${b?0:Math.min(200,I/R*200)}" height="12" rx="6" fill="${I>R*.8?'#e79a4c':'#2a62c9'}"/>`+T(x0+120,268,(b?0:I).toFixed(1)+' A of '+R+' A','font-size="12"')});
  sv.innerHTML=h;const m=$('#hmsg');m.textContent=HS.msg;m.className='box '+(HS.danger?'v':'y');
  $('#happs').innerHTML=APPS.map(a=>`<label style="flex-direction:row;align-items:center;gap:10px;color:var(--ink);font-weight:400"><input type="checkbox" data-app="${esc(a[0])}" ${HS.on[a[0]]?'checked':''} style="width:22px;height:22px"> ${esc(a[0])} · ${a[1]} W · ${circ(a)==='L'?'5 A':'15 A'} circuit</label>`).join('')}

let tool='field';

function labShow(){if(tool==='field')drawField();else if(tool==='flem'){if(!$('#flo').innerHTML)flNew()}else hDraw()}
function labClick(b){
  if(b.dataset.tool){tool=b.dataset.tool;$$('[data-tool]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.tool===tool));['field','flem','home'].forEach(t=>$('#t-'+t).hidden=t!==tool);labShow()}
  else if(b.id==='frev'){LAB.I=-LAB.I;$('#fI').value=LAB.I;drawField()}
  else if(b.id==='fclr'){LAB.comp=[];drawField()}
  else if(b.dataset.fl){if(FL.done)return true;FL.done=true;FL.tot++;const ans=keyOf(cross3(DIR[FL.I],DIR[FL.B])),ok=b.dataset.fl===ans;if(ok)FL.score++;
    $$('#flo button').forEach(x=>{x.disabled=true;if(x.dataset.fl===ans)x.classList.add('right');else if(x===b)x.classList.add('wrong')});
    $('#flf').innerHTML=`<p class="fb ${ok?'ok':'no'}">${ok?'Correct.':'Not quite.'} Forefinger along the field (${DN[FL.B]}), middle finger along the current (${DN[FL.I]}): your thumb points ${DN[ans]}.</p>`;$('#flscore').textContent=`Score: ${FL.score} of ${FL.tot}`}
  else if(b.id==='flnext')flNew();
  else if(b.id==='hshort'){HS.blown.P=true;HS.danger=false;HS.msg='Short circuit! The live wire touched the neutral wire directly. With almost no resistance, the current shot up and the 15 A fuse melted at once, protecting the wiring from overheating and fire.';hDraw()}
  else if(b.id==='hfault'){if($('#hearth').checked){HS.blown.P=true;HS.danger=false;HS.msg='The kettle\'s live wire touched its metal body. Because the body is earthed, a large current flowed to earth through the earth wire and the fuse blew. Anyone touching the kettle stays safe.'}else{HS.danger=true;HS.msg='Danger! The kettle\'s metal body is now at 220 V and the earth wire is not connected, so nothing stops it. Anyone who touches it gets a severe shock, because their body becomes the path to earth. This is why earthing is essential.'}hDraw()}
  else if(b.id==='hreset'){if(cload('L')/220>5||cload('P')/220>15){HS.msg='Switch some appliances off first; the fuse would blow again.'}else{HS.blown={L:false,P:false};HS.danger=false;HS.msg='Fuses replaced. The circuits are working again.'}hDraw()}
  else return false;return true}
function labChange(t){
  if(t.id==='fsrc'){LAB.src=t.value;LAB.comp=[];drawField();return true}
  if(t.id==='fI'){LAB.I=+t.value;drawField();return true}
  if(t.id==='fN'){LAB.n=+t.value;drawField();return true}
  if(t.dataset.app){HS.on[t.dataset.app]=t.checked;if(!HS.blown.L&&!HS.blown.P)HS.msg='Total current: lighting '+(cload('L')/220).toFixed(1)+' A, power '+(cload('P')/220).toFixed(1)+' A (I = P ÷ 220 V).';hDraw();return true}
  if(t.id==='hkettle5'||t.id==='hearth'){hDraw();return true}
  return false}
function labInit(){const sv0=$('#fsvg');sv0.addEventListener('pointerdown',e=>{const sv=sv0;const p=sv.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(sv.getScreenCTM().inverse());LAB.comp.push([q.x,q.y]);if(LAB.comp.length>12)LAB.comp.shift();drawField()})}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
