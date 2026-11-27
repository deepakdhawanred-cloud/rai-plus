/* Rai Plus content pack: Class 7 Science (Curiosity), Chapter 11 – Light: Shadows and Reflections. Bilingual: Hindi terms follow NCERT "Jigyasa". */
RP.register({key:'7sci11',cls:'7',subject:'Science',ch:'11',title:"Light: Shadows and Reflections",color:'#8a5a12',
crumb:"Class 7 Science · Curiosity · प्रकाश: छाया एवं परावर्तन · Taught in November",h1:"Chapter 11: Light: Shadows and Reflections",sub:"प्रकाश: छाया एवं परावर्तन. Where light comes from, why shadows form, and what a mirror really shows you.",heroLabel:"A torch shining past a ball onto a wall, making a shadow, and a mirror reflecting a beam",labName:'Light lab',
theme:"\n:root{--g:light-dark(#8a5a12,#f0c27a);--g2:light-dark(#fbf3e4,#22180a);--line:light-dark(#ecdcbd,#4a3a1e);--bg:light-dark(#ffffff,#120e08);--card:light-dark(#ffffff,#1a140b);\n--ink:light-dark(#1d160b,#f1e8d8);--mute:light-dark(#6a5a40,#bfae90);--y:light-dark(#185fa5,#85b7eb);--y2:light-dark(#e6f1fb,#0c1e33);--hd:#5e3d0a}\n",
labHTML:`  <h2>Light lab · प्रकाश प्रयोगशाला</h2>
  <p>Choose an experiment. Move the sliders and watch what light does.</p>
  <div class="ctrl"><label>Experiment<select id="lMode"><option value="sh">Shadows · छाया</option><option value="mi">Plane mirror · समतल दर्पण</option><option value="ph">Pinhole camera · सूचिछिद्र कैमरा</option></select></label></div>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="lSvg" viewBox="0 0 520 300" role="img" aria-label="Light experiment" style="color:var(--ink)"></svg></div></div>
  <div><div id="lCtl"></div><div class="box y" id="lOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#8a5a12',LABNAME='Light lab',MIND_CENTER='Light · प्रकाश';
const AM='#e0a02a',BL='#185fa5',GR='#888780',DK='#2c2c2a',ink='currentColor';
const ray=(x1,y1,x2,y2,c=AM,w=2.5,d='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" ${d?`stroke-dasharray="${d}"`:''}/>`;
const arrowOn=(x1,y1,x2,y2,c=AM)=>{const mx=(x1+x2)/2,my=(y1+y2)/2,a=Math.atan2(y2-y1,x2-x1),s=8;return `<path d="M${mx+s*Math.cos(a)} ${my+s*Math.sin(a)} L${mx+s*Math.cos(a+2.5)} ${my+s*Math.sin(a+2.5)} L${mx+s*Math.cos(a-2.5)} ${my+s*Math.sin(a-2.5)}Z" fill="${c}"/>`};
const sun=(x,y,r=22)=>{let s=`<circle cx="${x}" cy="${y}" r="${r}" fill="#f2b632"/>`;for(let i=0;i<8;i++){const a=i*Math.PI/4;s+=ray(x+(r+5)*Math.cos(a),y+(r+5)*Math.sin(a),x+(r+14)*Math.cos(a),y+(r+14)*Math.sin(a),'#f2b632',3)}return s};
const torch=(x,y)=>`<rect x="${x-34}" y="${y-9}" width="30" height="18" rx="3" fill="${GR}"/><path d="M${x-4} ${y-9} L${x+6} ${y-15} L${x+6} ${y+15} L${x-4} ${y+9}Z" fill="#b4b2a9"/><circle cx="${x+6}" cy="${y}" r="5" fill="#fff3c4"/>`;
function heroDraw(){return `<circle cx="70" cy="70" r="16" fill="#fff3c4"/><path d="M86 70 L230 40 L230 110Z" fill="#fff3c4" opacity=".35"/><circle cx="150" cy="70" r="14" fill="#fff"/><path d="M230 52 L230 90" stroke="#5e3d0a" stroke-width="20" opacity=".5"/><line x1="40" y1="128" x2="140" y2="128" stroke="#fff" stroke-width="3"/>`}
const HERO=heroDraw;
const MIND=[['Sources of light',100,50],['Straight-line travel',420,50],['Transparent / opaque',80,150],['Shadows',440,150],['Reflection & mirrors',120,250],['Pinhole camera',400,250]];

const C=[
{id:'l1',num:'11.1',title:'Sources of light · प्रकाश के स्रोत',
 intro:'Fireflies glow in the dark. The Moon shines at night. Do both make their own light?',
 obj:'Tell luminous objects (दीप्त) from non-luminous objects (अदीप्त) and give examples of each.',
 prior:'We see things when light from them enters our eyes.',
 simple:'Objects that give out their own light are luminous (दीप्त): the Sun, stars, a candle flame, a glowing bulb, a firefly. Objects that do not make light are non-luminous (अदीप्त): a book, a chair, the Moon. We see non-luminous objects only because light from a luminous source falls on them and bounces back to our eyes.',
 detail:'The Sun is the main natural source of light on Earth; its light takes about 8 minutes 20 seconds to reach us. Other natural sources are stars, lightning, fire, and some living things such as fireflies and some deep-sea creatures. Man-made sources include candles, oil lamps (दीया), bulbs and LED lamps. The Moon is non-luminous: it reflects sunlight. Planets such as Venus and Mars also shine only by reflected sunlight, while the Pole Star (ध्रुव तारा) is a star and so is luminous. LED lamps use less electricity, give bright light and last longer; used LEDs should be given for recycling, not thrown in household waste. Fireflies use their light to signal to each other, and their numbers are falling because of light pollution and loss of forests.',
 real:'At night, a bright street light near a forest can confuse fireflies, which use their flashes to find each other.',
 apply:'Sort these into luminous and non-luminous: Sun, Moon, mirror, Pole Star, Venus, lit candle, firefly, glass.',
 see:{w:520,h:230,f:[
  ['The Sun makes its own light: it is luminous (दीप्त).',sun(80,90)+T(80,155,'Sun · सूर्य','font-size="14" font-weight="700"')],
  ['Sunlight falls on the Moon.',ray(110,90,330,90)+arrowOn(110,90,330,90)+`<circle cx="350" cy="90" r="22" fill="#d3d1c7"/>`+T(350,135,'Moon · चंद्रमा','font-size="14" font-weight="700"')],
  ['The Moon reflects that light down to our eyes. It is non-luminous (अदीप्त).',ray(342,110,420,190)+arrowOn(342,110,420,190)+`<circle cx="432" cy="198" r="9" fill="${BL}"/>`+T(470,205,'eye','font-size="13"')],
  ['Rule: a luminous object makes light; a non-luminous one only reflects it.',T(260,222,'makes light = luminous · reflects light = non-luminous','font-size="13"')]]},
 seeNote:'Not to scale.',
 do:{title:'Luminous or not?',mat:'A list of 10 things at home',steps:['Write 10 things you can see right now.','Put a tick if it makes its own light.','Switch off the lights at night: which ones can you still see?'],obs:'Only luminous things (a phone screen, a lamp) are seen in full darkness.',why:'Non-luminous things need light falling on them to be seen.',lab:false},
 memo:'"Makes = luminous (दीप्त); borrows = non-luminous (अदीप्त)."',
 miscon:['"The Moon makes its own light." It reflects sunlight.','"A mirror is luminous because it shines." It only reflects light.','"Venus is a bright star." It is a planet and shines by reflected sunlight.'],
 terms:['Luminous · दीप्त','Non-luminous · अदीप्त','Source of light · प्रकाश स्रोत','LED'],
 q:{q:'Which of these is luminous?',o:['Moon','Mirror','Pole Star','Venus'],a:2,why:'The Pole Star is a star and makes its own light.'},
 exam:'Picking luminous objects from a list (Sun, Moon, Pole Star, Venus, mirror) is a common 1-mark question.'},

{id:'l2',num:'11.2',title:'Light travels in a straight line · प्रकाश सीधी रेखा में चलता है',
 intro:'Why can\'t you see a candle flame through a bent pipe?',
 obj:'Show with simple activities that light travels in straight lines.',
 prior:'Sources of light (11.1).',
 simple:'Line up three matchboxes with holes at the same height between a torch and a screen. A bright spot appears on the screen only when all three holes are in one straight line. Move one box and the spot disappears. So light travels in a straight line.',
 detail:'Activity 11.1: make a hole at the same place in three matchbox trays, place them in a row between a torch and a cardboard screen. Light reaches the screen only when the holes are in line. Activity 11.2: look at a candle flame (with an adult) through a long hollow pipe. You can see the flame when the pipe is straight but not when it is bent. Sunlight coming through gaps in leaves or a window shows straight beams in dusty air. A narrow beam of light through slightly milky water also shows a straight path (only a teacher should use a laser, and it must never point at anyone\'s eyes). Because light travels in straight lines, opaque objects form shadows and a pinhole camera forms images.',
 real:'You cannot see round a corner, but you can hear round it. Light does not bend round the corner.',
 apply:'In a figure, three friends look at a candle through pipes: one straight, two bent. Who can see the flame?',
 see:{w:520,h:220,f:[
  ['A torch, three cards with holes, and a screen.',torch(50,100)+[160,260,360].map(x=>`<rect x="${x-4}" y="50" width="8" height="100" fill="#b4b2a9"/><rect x="${x-4}" y="95" width="8" height="10" fill="#fff"/>`).join('')+`<rect x="460" y="40" width="10" height="120" fill="#d3d1c7"/>`],
  ['When the holes are in line, light passes straight through and makes a spot on the screen.',ray(56,100,460,100)+arrowOn(56,100,460,100)+`<circle cx="458" cy="100" r="6" fill="#f2b632"/>`],
  ['Move one card and the light is blocked. No spot.',`<rect x="256" y="128" width="8" height="10" fill="#fff"/>`+T(260,180,'shift one card → light stops','font-size="13"')+T(260,205,'so light travels in a straight line','font-size="14" font-weight="700"')]]},
 seeNote:'Activity 11.1 of the textbook.',
 do:{title:'Three matchboxes (Activity 11.1)',mat:'3 matchboxes, a needle, a torch, a cardboard screen',steps:['Make a hole at the same spot in each inner tray.','Stand them in a row with holes at the same height.','Shine the torch through and look at the screen.','Push the middle box slightly sideways.'],obs:'A spot appears only when all holes are in line.',why:'Light travels in straight lines.',lab:true},
 memo:'"Straight pipe, see the flame; bent pipe, no flame."',
 miscon:['"Light bends round corners like sound." Light travels in straight lines in air.','"A laser is safe to look into." Never look into any laser.'],
 terms:['Straight-line travel · सरल रेखीय गमन','Beam · किरण-पुंज','Ray · किरण'],
 q:{q:'You can see a flame through a pipe only when the pipe is:',o:['bent','straight','coloured','long'],a:1,why:'Light travels in straight lines.'},
 exam:'Diagram questions ask who can see the flame through straight or bent pipes.'},

{id:'l3',num:'11.3',title:'Transparent, translucent and opaque · पारदर्शी, पारभासी और अपारदर्शी',
 intro:'Why can you see through a window glass but not through a wall?',
 obj:'Classify materials by how much light they let through.',
 prior:'Light travels in straight lines (11.2).',
 simple:'Transparent (पारदर्शी) materials let almost all light pass, so you can see clearly through them: clear glass, clean water, air. Translucent (पारभासी) materials let only some light pass, so things look blurry: tracing paper, butter paper, frosted glass. Opaque (अपारदर्शी) materials let no light pass: wood, cardboard, a metal plate, a brick wall.',
 detail:'Activity 11.3: predict, then test each object with a torch and a screen and fill a table. Through a transparent object the screen is almost as bright as without it; through a translucent object it is dimmer; behind an opaque object it is dark. The same material can change: plain paper is nearly opaque, but oiled paper becomes translucent. Thick cloth is opaque, thin muslin is translucent. Transparent glass is used for windows, translucent glass for bathroom windows (light without a clear view), and opaque materials for walls and curtains.',
 real:'Bathroom windows use frosted glass: light comes in, but people outside cannot see in clearly.',
 apply:'Why are car headlight covers transparent but lamp shades often translucent?',
 see:{w:520,h:230,f:[
  ['Light falls on three sheets.',torch(40,60)+torch(40,120)+torch(40,180)+[60,120,180].map(y=>ray(46,y,170,y)).join('')],
  ['Transparent: almost all light passes. Translucent: some passes. Opaque: none.',`<rect x="170" y="40" width="10" height="40" fill="#b5d4f4" opacity=".6"/><rect x="170" y="100" width="10" height="40" fill="#d3d1c7"/><rect x="170" y="160" width="10" height="40" fill="#5f5e5a"/>`+ray(180,60,380,60)+ray(180,120,380,120,AM,1.2,'4 4')],
  ['Names in English and Hindi.',T(450,64,'transparent · पारदर्शी','font-size="13"')+T(450,124,'translucent · पारभासी','font-size="13"')+T(450,184,'opaque · अपारदर्शी','font-size="13"')+`<rect x="380" y="45" width="6" height="30" fill="#f2b632"/><rect x="380" y="105" width="6" height="30" fill="#f2b632" opacity=".45"/>`]]},
 seeNote:'Brightness on the screen shows how much light passed.',
 do:{title:'Material test (Activity 11.3)',mat:'Torch, screen, glass, tracing paper, cardboard, cloth, plastic',steps:['Predict for each: full, some, or no light.','Hold each in front of the torch.','Record what you see on the screen.','Rub a drop of oil on plain paper and test again.'],obs:'Glass: bright; tracing paper: dim; cardboard: dark. Oiled paper lets more light through.',why:'Materials differ in how much light they let pass.',lab:true},
 memo:'"Trans = through (clearly); transLUcent = a LIttle; opaque = nothing."',
 miscon:['"Translucent means coloured." It means partly lets light through.','"All glass is transparent." Frosted glass is translucent.'],
 terms:['Transparent · पारदर्शी','Translucent · पारभासी','Opaque · अपारदर्शी'],
 q:{q:'Tracing paper is:',o:['transparent','translucent','opaque','luminous'],a:1,why:'It lets some light through.'},
 exam:'Matching or classification of materials appears in most tests.'},

{id:'l4',num:'11.4',title:'Shadows · छाया',
 intro:'Your shadow is long in the morning, short at noon, and long again in the evening. Why?',
 obj:'State what is needed for a shadow and how its size and sharpness change.',
 prior:'Light travels in straight lines; opaque objects block light.',
 simple:'A shadow (छाया) forms when an opaque object blocks light. You need three things: a source of light, an opaque object, and a screen (a wall or the ground). Bring the object closer to the torch and the shadow gets bigger; move it closer to the screen and the shadow gets smaller and sharper. The shadow is always dark, whatever the colour of the object.',
 detail:'Activity 11.4: change one thing at a time. Remove the screen: no shadow is seen. Remove the object or switch off the torch: no shadow. Change the colour of the object: the shadow stays dark. Move the object toward the torch: the shadow grows and its edges become blurred. Move it toward the screen: the shadow shrinks and becomes sharper. Tilting the object changes the shadow\'s shape. Opaque objects give dark shadows, translucent objects light shadows, and some transparent objects only faint shadows. Shadows are long when the Sun is low (morning, evening) and shortest near noon when the Sun is high. Shadow puppetry is an old Indian art, for example Tholpavakoothu in Kerala and Charma Bahuli Natya in Maharashtra.',
 real:'A high-flying bird\'s shadow is hard to see on the ground, but when it swoops low you see a clear shadow.',
 apply:'You measure a pole\'s shadow at 9 AM, 12 noon and 4 PM. Which is shortest, and why?',
 see:{w:520,h:240,f:[
  ['Torch, opaque ball, and wall (screen).',torch(50,120)+`<circle cx="200" cy="120" r="20" fill="${DK}"/><rect x="460" y="20" width="12" height="200" fill="#d3d1c7"/>`],
  ['Rays that miss the ball reach the wall. Rays that hit it are blocked.',ray(56,120,460,40)+ray(56,120,460,200)+ray(56,120,186,106,AM,1.6)+ray(56,120,186,134,AM,1.6)],
  ['The blocked region on the wall is the shadow.',`<path d="M56 120 L460 52 L460 188Z" fill="${DK}" opacity=".18"/><rect x="458" y="52" width="14" height="136" fill="${DK}"/>`+T(400,232,'shadow · छाया','font-size="14" font-weight="700"')],
  ['Ball closer to the torch → bigger shadow. Closer to the wall → smaller, sharper shadow.',T(220,232,'closer to torch = bigger','font-size="13"')]]},
 seeNote:'A point-like torch is assumed. A wide light source gives blurred edges.',
 do:{title:'Shadow changes (Activity 11.4)',mat:'Torch, a ball and a book, a wall or white sheet',steps:['Make a shadow of the ball on the wall.','Move the ball toward the torch, then toward the wall.','Try a red and a blue object of the same shape.','Tilt the book.'],obs:'Size changes with distance; colour does not change; shape changes with tilt.',why:'The shadow is the region where light is blocked.',lab:true},
 memo:'"Source + opaque object + screen = shadow."',
 miscon:['"A red ball gives a red shadow." Shadows are dark whatever the colour.','"Shadows form in the dark." No light, no shadow.'],
 terms:['Shadow · छाया','Screen · पर्दा','Shadow puppetry · छाया कठपुतली'],
 q:{q:'Moving an object closer to the torch makes its shadow:',o:['smaller','bigger','coloured','disappear'],a:1,why:'It blocks a wider cone of light.'},
 exam:'Shadow size with distance, and shadow length at different times of day, are frequent questions.'},

{id:'l5',num:'11.5',title:'Reflection of light · प्रकाश का परावर्तन',
 intro:'How can you light up a dark corner of the room using sunlight and a steel plate?',
 obj:'Explain reflection as the change of direction of light at a shiny surface.',
 prior:'Light travels in straight lines.',
 simple:'When light falls on a shiny surface such as a mirror or a polished steel plate, it bounces back in a new direction. This is reflection (परावर्तन). Tilt the mirror and the reflected spot moves.',
 detail:'Activity 11.5: hold a steel plate or plane mirror in sunlight and turn it to throw a bright patch on a shaded wall. Activity 11.6: block all but one gap of a comb with black paper, shine a torch through it to make a narrow beam on white paper, and put a mirror in its path. The beam changes direction at the mirror. Turning the mirror changes the direction of the reflected beam. Smooth shiny surfaces reflect light well; that is why mirrors are polished. Kerala\'s Aranmula Kannadi is a mirror made of polished metal, not glass, and has been made for centuries. (In Class 8 you will measure the angles and learn the laws of reflection.)',
 real:'Rear-view mirrors on scooters and the shiny side of a steel spoon both reflect light to show you things.',
 apply:'Sunlight comes through a window onto the floor. How would you get a bright spot onto the ceiling?',
 see:{w:520,h:240,f:[
  ['A narrow beam travels toward a mirror.',torch(50,60)+ray(56,60,260,190)+arrowOn(56,60,260,190)+`<rect x="180" y="190" width="160" height="8" fill="#b5d4f4"/><rect x="180" y="198" width="160" height="4" fill="${GR}"/>`],
  ['At the mirror the beam changes direction: reflection.',ray(260,190,460,60)+arrowOn(260,190,460,60)],
  ['Tilt the mirror and the reflected beam points somewhere else.',ray(260,190,420,30,BL,2,'6 4')+T(260,228,'reflection · परावर्तन','font-size="14" font-weight="700"')]]},
 seeNote:'Activity 11.6: comb-slit beam on white paper.',
 do:{title:'Sun-spot game (Activity 11.5)',mat:'A small mirror or steel plate, sunlight',steps:['Stand in sunlight near a shaded wall.','Turn the mirror to throw a bright spot on the wall.','Move the spot slowly by tilting the mirror.'],obs:'The spot moves as the mirror tilts.',why:'The mirror changes the direction of light.',lab:false},
 memo:'"Shiny surface, light bounces: reflection."',
 miscon:['"Only glass mirrors reflect." Any shiny surface reflects, including steel and water.','"Never shine a spot into anyone\'s eyes": it can hurt.'],
 terms:['Reflection · परावर्तन','Plane mirror · समतल दर्पण','Aranmula Kannadi'],
 q:{q:'Reflection is the:',o:['making of light','change of direction of light at a shiny surface','blocking of light','absorption of light'],a:1,why:'Definition.'},
 exam:'Definition of reflection and the comb-slit activity are common short questions.'},

{id:'l6',num:'11.6',title:'Images in a plane mirror · समतल दर्पण में प्रतिबिंब',
 intro:'Raise your right hand in front of a mirror. Which hand does your image raise?',
 obj:'State the properties of an image in a plane mirror, including lateral inversion.',
 prior:'Reflection (11.5).',
 simple:'The image (प्रतिबिंब) in a plane mirror is: the same size as the object, upright (erect), as far behind the mirror as the object is in front, and left–right swapped. This swap is called lateral inversion (पार्श्व परिवर्तन). The image cannot be caught on a screen.',
 detail:'Activity 11.7: move a pen in front of a mirror; its image is the same size and upright. Put a screen behind the mirror, or in front of it: no image forms on the screen, because the image only appears to be behind the mirror. Activity 11.8: walk toward and away from a mirror; the image comes nearer or goes farther by the same amount. Touch your right ear with your right hand: the image seems to use its left hand on its left ear. That is why AMBULANCE is written in mirror writing on the front of ambulances: a driver ahead reads it correctly in the rear-view mirror. Letters that look the same in a mirror (A, H, I, M, O, T, U, V, W, X, Y) have a vertical line of symmetry.',
 real:'The word AMBULANCE is painted reversed so it reads correctly in the mirror of the car in front.',
 apply:'You stand 2 m in front of a mirror. How far is your image from you?',
 see:{w:520,h:240,f:[
  ['A plane mirror in the middle. An object F stands 120 px in front.',`<rect x="256" y="30" width="8" height="180" fill="#b5d4f4"/>`+T(140,140,'F','font-size="70" font-weight="700" fill="'+BL+'"')+T(260,228,'mirror','font-size="12"')],
  ['The image is the same size, upright, and the same distance behind the mirror.',`<g transform="translate(520 0) scale(-1 1)">${T(140,140,'F','font-size="70" font-weight="700" fill="'+BL+'" opacity=".55"')}</g>`+ray(165,170,256,170,ink,1.5,'4 3')+ray(264,170,355,170,ink,1.5,'4 3')+T(210,188,'d','font-size="13"')+T(310,188,'d','font-size="13"')],
  ['Left and right are swapped: lateral inversion (पार्श्व परिवर्तन).',T(380,60,'image · प्रतिबिंब','font-size="13"')+T(140,60,'object · वस्तु','font-size="13"')]]},
 seeNote:'Image distance behind the mirror = object distance in front.',
 do:{title:'Mirror writing',mat:'A mirror, paper, pencil',steps:['Write your name on paper and hold it facing the mirror.','Read it in the mirror.','Now write it so it reads correctly in the mirror.'],obs:'The mirror swaps left and right.',why:'Lateral inversion.',lab:true},
 memo:'"Same size, upright, same distance, sides swapped, no screen."',
 miscon:['"The image is upside down." It is upright.','"The image is on the mirror surface." It appears as far behind as you are in front.','"A mirror image can be shown on a screen." Not a plane mirror image.'],
 terms:['Image · प्रतिबिंब','Erect · सीधा','Lateral inversion · पार्श्व परिवर्तन'],
 q:{q:'You are 2 m from a plane mirror. The distance between you and your image is:',o:['1 m','2 m','4 m','0 m'],a:2,why:'Image is 2 m behind: total 4 m.'},
 exam:'Properties of a plane-mirror image and the AMBULANCE example are favourite 2–3 mark questions.'},

{id:'l7',num:'11.7',title:'Pinhole camera · सूचिछिद्र कैमरा',
 intro:'Can a box with a tiny hole take a picture of a tree?',
 obj:'Make a pinhole camera and explain why its image is upside down.',
 prior:'Light travels in straight lines.',
 simple:'A pinhole camera is a box with a tiny hole at one end and a screen of tracing paper at the other. Light from the top of a tree goes straight through the hole and lands at the bottom of the screen; light from the bottom lands at the top. So the image is inverted (उल्टा). It shows the real colours.',
 detail:'Activity 11.9: in a dim room, hold a card with a small hole between a candle (with adult help) and a screen; an upside-down image of the flame appears. Activity 11.10: make two boxes that slide into each other. One has a pinhole in the centre of its end; the other has a 5–6 cm square opening covered with tracing paper as the screen. Point it at a brightly lit distant object, cover your head and the box with a dark cloth, and slide to get a sharp image. The image is inverted and coloured. Rays from each point cross at the hole, which is why up becomes down and left becomes right. The image is smaller when the object is farther away. Pinhole images of the Sun appear as round spots of light under trees, through tiny gaps between leaves.',
 real:'On a sunny day, the round bright spots under a tree are pinhole images of the Sun made by tiny gaps in the leaves.',
 apply:'Sketch how a tree looks on the screen of a pinhole camera.',
 see:{w:520,h:240,f:[
  ['A tree, a box with a pinhole, and a tracing-paper screen.',`<rect x="56" y="110" width="12" height="80" fill="#8a5a12"/><circle cx="62" cy="90" r="38" fill="#639922"/><rect x="260" y="80" width="200" height="80" fill="none" stroke="${ink}" stroke-width="2"/><circle cx="260" cy="120" r="3" fill="${ink}"/><rect x="456" y="80" width="6" height="80" fill="#f1efe8" stroke="${GR}"/>`],
  ['Light from the top of the tree goes straight through the hole to the bottom of the screen.',ray(62,52,260,120,'#639922')+ray(260,120,458,152,'#639922')],
  ['Light from the bottom reaches the top. The image is upside down.',ray(62,190,260,120,'#8a5a12')+ray(260,120,458,96,'#8a5a12')+`<g transform="translate(440 124) scale(.3 -.3) translate(-62 -124)"><rect x="56" y="110" width="12" height="80" fill="#8a5a12"/><circle cx="62" cy="90" r="38" fill="#639922"/></g>`+T(360,200,'inverted image · उल्टा प्रतिबिंब','font-size="14" font-weight="700"')]]},
 seeNote:'Rays cross at the pinhole.',
 do:{title:'Sliding pinhole camera (Activity 11.10)',mat:'Two boxes that slide into each other, a pin, tracing paper, tape, a dark cloth',steps:['Make a pinhole in the centre of one box\'s end.','Cut a 5–6 cm square in the other box and cover it with tracing paper.','Slide the boxes together, point at a sunlit object, and cover your head with the cloth.','Slide to make the image sharp.'],obs:'A small, coloured, upside-down image.',why:'Light travels in straight lines through the hole.',lab:true},
 memo:'"Through the hole, top goes low."',
 miscon:['"A bigger hole gives a better image." A bigger hole makes it blurred.','"Never look at the Sun directly, even through the camera."'],
 terms:['Pinhole camera · सूचिछिद्र कैमरा','Inverted · उल्टा','Screen · पर्दा'],
 q:{q:'The image in a pinhole camera is:',o:['erect and the same size','inverted','always larger','not coloured'],a:1,why:'Rays cross at the pinhole.'},
 exam:'"Draw the image of a tree formed by a pinhole camera" is common.'},

{id:'l8',num:'11.8',title:'Periscope and kaleidoscope · परिदर्शी और बहुरूपदर्शी',
 intro:'How do people in a submarine see above the water?',
 obj:'Explain how two mirrors make a periscope and three mirrors make a kaleidoscope.',
 prior:'Reflection and plane mirror images.',
 simple:'A periscope (परिदर्शी) has two plane mirrors at the two bends of a Z-shaped tube, each tilted at 45°. Light from an object hits the top mirror, turns down, hits the bottom mirror and turns again into your eye. You can see over a wall. A kaleidoscope (बहुरूपदर्शी) has three mirror strips joined as a triangle in a tube, with coloured bits at the end. Many reflections make beautiful patterns that change when you turn it.',
 detail:'In a periscope the two mirrors face each other and are parallel, each at 45° to the tube, so the light is turned through a right angle twice and comes out travelling in its original direction but lower down. Periscopes are used in submarines, tanks and bunkers. In a kaleidoscope, the three mirror strips (about 15 cm × 4 cm) form a triangular prism; one end is closed with a disc of plain glass holding coloured glass pieces, covered by ground glass; the other end has a peephole. Each turn gives a new symmetrical pattern. Designers of wallpaper and fabric have used kaleidoscope patterns for ideas.',
 real:'A periscope lets you watch a parade over the heads of a crowd.',
 apply:'You have a long straight tube. Where would you place two mirrors to make it a periscope?',
 see:{w:520,h:260,f:[
  ['A Z-shaped tube with a mirror at each bend, tilted at 45°.',`<path d="M225 28 V20 H265 V198 M265 236 V240 H225 V62" fill="none" stroke="${ink}" stroke-width="2.5"/><line x1="225" y1="25" x2="265" y2="65" stroke="${BL}" stroke-width="5"/><line x1="225" y1="195" x2="265" y2="235" stroke="${BL}" stroke-width="5"/>`],
  ['Light from the object hits the top mirror and turns down.',`<circle cx="90" cy="45" r="14" fill="#d85a30"/>`+ray(104,45,245,45)+arrowOn(104,45,245,45)+ray(245,45,245,215)+arrowOn(245,45,245,215)],
  ['The bottom mirror turns it into your eye.',ray(245,215,400,215)+arrowOn(245,215,400,215)+`<circle cx="410" cy="215" r="9" fill="${BL}"/>`+T(440,250,'eye','font-size="13"')+T(110,250,'periscope · परिदर्शी','font-size="14" font-weight="700"')]]},
 seeNote:'Mirrors are parallel and each at 45° to the tube.',
 do:{title:'Make a periscope',mat:'A long box or two juice cartons, two small mirrors, tape, scissors',steps:['Cut a window near the top on one side and near the bottom on the opposite side.','Fix one mirror at 45° behind each window, facing each other.','Look in the bottom window.'],obs:'You see things above and beyond the top window.',why:'Two reflections turn the light twice.',lab:false},
 memo:'"Periscope = 2 mirrors at 45°; kaleidoscope = 3 mirrors in a triangle."',
 miscon:['"A periscope needs lenses." A simple one needs only two mirrors.','"The kaleidoscope pattern is printed inside." It comes from repeated reflections.'],
 terms:['Periscope · परिदर्शी','Kaleidoscope · बहुरूपदर्शी','Multiple reflection · बहु-परावर्तन'],
 q:{q:'A simple periscope uses:',o:['one mirror','two plane mirrors','three plane mirrors','a pinhole'],a:1,why:'Two mirrors at 45°.'},
 exam:'Periscope diagram and its uses (submarines, tanks) are frequent questions.'}
];

const CARDS=[['Luminous · दीप्त','Makes its own light: Sun, stars, flame, firefly.'],['Non-luminous · अदीप्त','Only reflects light: Moon, planets, book, mirror.'],['Sunlight travel time','About 8 minutes 20 seconds to reach Earth.'],['Straight-line travel','Matchbox holes / straight pipe: light goes only in straight lines.'],['Transparent · पारदर्शी','Almost all light passes: clear glass, water.'],['Translucent · पारभासी','Some light passes: tracing paper, frosted glass.'],['Opaque · अपारदर्शी','No light passes: wood, metal, cardboard.'],['Shadow needs','A light source, an opaque object and a screen.'],['Shadow size','Closer to the source → bigger; closer to screen → smaller and sharper.'],['Shadow colour','Always dark, whatever the object\'s colour.'],['Reflection · परावर्तन','Change of direction of light at a shiny surface.'],['Plane mirror image','Same size, erect, same distance behind, laterally inverted, not on a screen.'],['Lateral inversion · पार्श्व परिवर्तन','Left and right swapped in a mirror image.'],['Pinhole camera','Inverted, coloured image; rays cross at the hole.'],['Periscope · परिदर्शी','Two parallel mirrors at 45°; submarines, tanks.'],['Kaleidoscope · बहुरूपदर्शी','Three mirror strips in a triangle; repeated reflections.']];

const Q=[
 {lv:1,q:'Which object is luminous?',o:['Moon','Sun','Mirror','Mars'],a:1,w:'The Sun makes its own light.'},
 {lv:1,q:'Clear glass is:',o:['opaque','translucent','transparent','luminous'],a:2,w:'Almost all light passes.'},
 {lv:1,q:'True or false: the Moon has its own light.',o:['True','False'],a:1,w:'It reflects sunlight.'},
 {lv:1,q:'Changing of direction of light by a mirror is called:',o:['shadow','reflection','inversion','absorption'],a:1,w:'Reflection · परावर्तन.'},
 {lv:2,q:'To form a shadow we need a light source, a screen and:',o:['a mirror','an opaque object','a lens','water'],a:1,w:'The opaque object blocks the light.'},
 {lv:2,q:'A red ball\'s shadow on a white wall is:',o:['red','pink','dark','white'],a:2,w:'A shadow is where light is blocked.'},
 {lv:2,q:'The image in a pinhole camera is:',o:['erect','inverted','always bigger','colourless'],a:1,w:'Rays cross at the pinhole.'},
 {lv:3,q:'You stand 1.5 m in front of a plane mirror. Your image is how far from you?',o:['1.5 m','0.75 m','3 m','6 m'],a:2,w:'1.5 m in front + 1.5 m behind.'},
 {lv:3,q:'A ball is moved from near the wall toward the torch. Its shadow:',o:['gets smaller','gets bigger','stays the same','disappears'],a:1,w:'It blocks a wider cone of light.'},
 {lv:3,q:'Your shadow is shortest at about:',o:['9 AM','12 noon','4 PM','sunset'],a:1,w:'The Sun is highest near noon.'},
 {lv:4,q:'Assertion (A): AMBULANCE is written reversed on the front of the vehicle. Reason (R): A plane mirror causes lateral inversion.',o:['Both true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'The driver ahead reads it correctly in the mirror.'},
 {lv:4,q:'Which word looks the same in a plane mirror?',o:['MOM','DAD','BOB','PEN'],a:0,w:'M and O are symmetrical about a vertical line, and MOM reads the same backwards.'},
 {lv:4,q:'A high-flying bird casts no clear shadow on the ground mainly because:',o:['birds are transparent','it is far from the ground, so the shadow is faint and spread out','the Sun is too small','shadows form only at night'],a:1,w:'Far from the screen, the shadow blurs; near the screen it is sharp.'},
 {lv:5,open:true,m:3,q:'List the properties of an image formed by a plane mirror.',ans:['Same size as the object; erect (1).','As far behind the mirror as the object is in front (1).','Laterally inverted and cannot be obtained on a screen (1).']},
 {lv:5,open:true,m:3,q:'Describe an activity to show that light travels in a straight line.',ans:['Three cards/matchboxes with holes at the same height between a torch and screen (1).','Spot seen on the screen only when holes are in line (1).','Shifting one card blocks the light, so light travels in straight lines (1).']},
 {lv:5,open:true,m:3,q:'Draw a labelled diagram of a periscope and give two uses.',ans:['Z-shaped tube with two parallel plane mirrors at 45° (1).','Ray path: object → top mirror → bottom mirror → eye (1).','Uses: submarines, tanks/bunkers, seeing over a crowd (1).']}
];

const ONEMIN=['Luminous (दीप्त) makes light; non-luminous (अदीप्त) only reflects it. Moon is non-luminous.','Sunlight reaches Earth in about 8 min 20 s.','Light travels in straight lines (matchbox holes, straight pipe).','Transparent / translucent / opaque: all / some / no light passes.','Shadow = source + opaque object + screen; always dark.','Object near torch → big shadow; near screen → small and sharp.','Reflection (परावर्तन): light changes direction at a shiny surface.','Plane mirror image: same size, erect, same distance behind, laterally inverted, not on a screen.','Pinhole camera: inverted, coloured image.','Periscope: 2 mirrors at 45°. Kaleidoscope: 3 mirrors in a triangle.'];
const KEYS=[['luminous',/luminous|दीप्त/i],['straight line',/straight|सीधी|सरल/i],['transparent / translucent / opaque',/transparent|translucent|opaque|पारदर्शी|पारभासी/i],['shadow',/shadow|छाया/i],['opaque object needed',/opaque|block/i],['reflection',/reflect|परावर्तन/i],['same size, erect',/same size|erect|upright|सीधा/i],['lateral inversion',/lateral|left.*right|पार्श्व/i],['pinhole',/pinhole|सूचिछिद्र/i],['inverted',/invert|upside|उल्टा/i]];

/* ---------- lab ---------- */
let mode='sh',st={sh:{t:60,o:200,mat:'op'},mi:{d:90,txt:'RAI'},ph:{h:120,d:220}};
const CTL={
 sh:()=>`<div class="ctrl"><label>Torch position<input type="range" id="shT" min="20" max="160" value="${st.sh.t}"></label></div><div class="ctrl"><label>Object position<input type="range" id="shO" min="200" max="440" value="${st.sh.o}"></label></div><div class="ctrl"><label>Object material<select id="shM"><option value="op" ${st.sh.mat==='op'?'selected':''}>Opaque · अपारदर्शी</option><option value="tl" ${st.sh.mat==='tl'?'selected':''}>Translucent · पारभासी</option><option value="tp" ${st.sh.mat==='tp'?'selected':''}>Transparent · पारदर्शी</option></select></label></div>`,
 mi:()=>`<div class="ctrl"><label>Distance from mirror<input type="range" id="miD" min="30" max="200" value="${st.mi.d}"></label></div><div class="ctrl"><label>Word<input id="miW" value="${esc(st.mi.txt)}" maxlength="10" style="width:9em"></label><button class="btn" id="miAmb">Try AMBULANCE</button></div>`,
 ph:()=>`<div class="ctrl"><label>Tree height<input type="range" id="phH" min="60" max="180" value="${st.ph.h}"></label></div><div class="ctrl"><label>Tree distance from camera<input type="range" id="phD" min="120" max="300" value="${st.ph.d}"></label></div>`};
function drawSh(){const {t,o,mat}=st.sh,cy=150,h=50,SX=480;const sx=t+4;const H=h*(SX-sx)/(o-sx);const top=cy-H/2,bot=cy+H/2;
 const shade=mat==='op'?.9:mat==='tl'?.4:.08,objFill=mat==='op'?DK:mat==='tl'?'#d3d1c7':'#b5d4f4';
 let s=`<rect x="${SX}" y="10" width="14" height="280" fill="#f1efe8" stroke="${GR}"/>`+torch(t,cy);
 s+=`<path d="M${sx} ${cy} L${SX} ${Math.max(10,top-40)} L${SX} ${Math.min(290,bot+40)}Z" fill="#f2b632" opacity=".12"/>`;
 s+=ray(sx,cy,SX,Math.max(10,top),AM,1.4,'5 4')+ray(sx,cy,SX,Math.min(290,bot),AM,1.4,'5 4');
 s+=`<rect x="${SX}" y="${Math.max(10,top)}" width="14" height="${Math.min(290,bot)-Math.max(10,top)}" fill="${DK}" opacity="${shade}"/>`;
 s+=`<rect x="${o-6}" y="${cy-h/2}" width="12" height="${h}" fill="${objFill}" stroke="${GR}"/>`+T(o,cy+h/2+18,'object','font-size="12"')+T(t-15,cy+30,'torch','font-size="12"')+T(SX-20,300-4,'screen','font-size="12"');
 $('#lSvg').innerHTML=s;
 const big=H>280;$('#lOut').innerHTML=`<p>Object height 50 · shadow height <b>${big?'more than the screen':Math.round(H)}</b> (${(H/h).toFixed(1)} × the object).</p><p>${mat==='op'?'Opaque: no light passes, so the shadow is <b>dark</b>.':mat==='tl'?'Translucent: some light passes, so the shadow is <b>lighter</b>.':'Transparent: nearly all light passes, so the shadow is <b>very faint</b>.'}</p><p>Move the object toward the torch: the shadow grows. Move it toward the screen: it shrinks toward the object\'s own size.</p>`}
function drawMi(){const {d,txt}=st.mi,MX=260;const w=txt||' ';
 let s=`<rect x="${MX-4}" y="20" width="8" height="240" fill="#b5d4f4"/>`+T(MX,282,'plane mirror · समतल दर्पण','font-size="12"');
 s+=T(MX-d,140,esc(w),`font-size="34" font-weight="700" fill="${BL}" text-anchor="end"`);
 s+=`<g transform="translate(${2*MX} 0) scale(-1 1)">${T(MX-d,140,esc(w),`font-size="34" font-weight="700" fill="${BL}" opacity=".5" text-anchor="end"`)}</g>`;
 s+=ray(MX-d,180,MX-4,180,ink,1.4,'4 3')+ray(MX+4,180,MX+d,180,ink,1.4,'4 3')+T(MX-d/2,200,d+' cm','font-size="12"')+T(MX+d/2,200,d+' cm','font-size="12"')+T(MX-d-40,60,'object','font-size="13"')+T(MX+d+40,60,'image','font-size="13"');
 $('#lSvg').innerHTML=s;
 $('#lOut').innerHTML=`<p>Object is <b>${d} cm</b> in front; image is <b>${d} cm</b> behind. Distance between them: <b>${2*d} cm</b>.</p><p>Same size, upright, and left–right swapped (lateral inversion · पार्श्व परिवर्तन).</p>`}
function drawPh(){const {h,d}=st.ph,PX=300,cy=150,L=160;const base=cy+h/2,tx=PX-d;const ih=h*L/d;
 let s=`<rect x="${PX}" y="${cy-60}" width="${L}" height="120" fill="none" stroke="${ink}" stroke-width="2"/><rect x="${PX+L-3}" y="${cy-60}" width="6" height="120" fill="#f1efe8" stroke="${GR}"/><circle cx="${PX}" cy="${cy}" r="3" fill="${ink}"/>`;
 s+=`<rect x="${tx-5}" y="${base-h*.45}" width="10" height="${h*.45}" fill="#8a5a12"/><circle cx="${tx}" cy="${base-h*.7}" r="${h*.3}" fill="#639922"/>`;
 s+=ray(tx,base-h,PX,cy,'#639922',1.6)+ray(PX,cy,PX+L,cy+ih/2,'#639922',1.6)+ray(tx,base,PX,cy,'#8a5a12',1.6)+ray(PX,cy,PX+L,cy-ih/2,'#8a5a12',1.6);
 const ok=ih<=116;s+=`<g transform="translate(${PX+L-6-ih*.3} ${cy}) scale(${ih/h} ${-ih/h}) translate(${-tx} ${-(base-h/2)})" ${ok?'':'opacity=".6"'}><rect x="${tx-5}" y="${base-h*.45}" width="10" height="${h*.45}" fill="#8a5a12"/><circle cx="${tx}" cy="${base-h*.7}" r="${h*.3}" fill="#639922"/></g>`;
 s+=T(tx,base+18,'tree','font-size="12"')+T(PX+L/2,cy+82,'pinhole camera','font-size="12"');
 $('#lSvg').innerHTML=s;
 $('#lOut').innerHTML=`<p>Image on the screen: <b>inverted</b> (उल्टा), height about <b>${Math.round(ih)}</b> (tree ${h}).</p><p>${ok?'Move the tree farther away: the image gets smaller.':'The image is bigger than the screen: move the tree farther away.'}</p>`}
function labShow(){$('#lCtl').innerHTML=CTL[mode]();({sh:drawSh,mi:drawMi,ph:drawPh})[mode]()}
let wired=false;function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const t=e.target;if(t&&t.closest&&t.closest('#lCtl')&&t.type==='range')labChange(t)})}
function labClick(b){if(b.id==='miAmb'){st.mi.txt='AMBULANCE';st.mi.d=60;labShow();return true}return false}
function labChange(t){const v=t.value;switch(t.id){case 'lMode':mode=v;labShow();return true;case 'shT':st.sh.t=+v;drawSh();return true;case 'shO':st.sh.o=+v;drawSh();return true;case 'shM':st.sh.mat=v;drawSh();return true;case 'miD':st.mi.d=+v;drawMi();return true;case 'miW':st.mi.txt=v.toUpperCase().slice(0,10);drawMi();return true;case 'phH':st.ph.h=+v;drawPh();return true;case 'phD':st.ph.d=+v;drawPh();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
