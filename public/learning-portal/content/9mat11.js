/* Rai Plus content pack: Class 9 Mathematics, Chapter 11 – Surface Areas and Volumes (rationalised NCERT: cone, sphere, hemisphere) */
RP.register({key:'9mat11',cls:'9',subject:'Mathematics',ch:'11',title:"Surface Areas and Volumes",color:'#2b5c8a',
crumb:"HBSE Class 9 Mathematics · Unit: Mensuration · Taught in November",h1:"Chapter 11: Surface Areas and Volumes",sub:"Cones, spheres and hemispheres: how much material covers them, and how much they hold.",heroLabel:"A cone, a sphere and a hemisphere",labName:'Solids lab',
theme:"\n:root{--g:light-dark(#2b5c8a,#9cc4ea);--g2:light-dark(#eaf2fa,#0e1a26);--line:light-dark(#cddfee,#25384b);--bg:light-dark(#ffffff,#0a1118);--card:light-dark(#ffffff,#0f1821);\n--ink:light-dark(#0f1b27,#e4edf6);--mute:light-dark(#4c5f72,#a3b6c9);--y:light-dark(#b8611f,#f0a86a);--y2:light-dark(#fbefe4,#2a180a);--hd:#1f4366}\n",
labHTML:`  <h2>Solids lab</h2>
  <p>Pick a solid, set its measurements, and see every formula worked out with π = 22/7.</p>
  <div class="ctrl"><label>Solid<select id="sSol"><option value="cone">Right circular cone</option><option value="sph">Sphere</option><option value="hem">Hemisphere (solid)</option></select></label></div>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="sSvg" viewBox="0 0 480 320" role="img" aria-label="The chosen solid with its measurements" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Radius r (cm)<input type="range" id="sR" min="1" max="21" value="7"></label></div><div class="ctrl" id="sHrow"><label>Height h (cm)<input type="range" id="sH" min="1" max="30" value="24"></label></div><div class="box y" id="sOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#2b5c8a',LABNAME='Solids lab',MIND_CENTER='Surface areas & volumes';
const BL='#2b5c8a',OR='#b8611f',GR='#888780',LB='#b5d4f4',ink='currentColor';
const fx=(n,d=2)=>{const v=+n.toFixed(d);return v.toLocaleString('en-IN')};
function cone(cx,by,r,h,o={}){const ry=r*.28,ax=cx,ay=by-h,fill=o.fill||LB;return `<path d="M${cx-r} ${by} L${ax} ${ay} L${cx+r} ${by} A${r} ${ry} 0 0 1 ${cx-r} ${by}Z" fill="${fill}" opacity="${o.op||.55}"/><path d="M${cx-r} ${by} A${r} ${ry} 0 0 1 ${cx+r} ${by}" fill="none" stroke="${ink}" stroke-width="1.2" stroke-dasharray="4 3"/><path d="M${cx-r} ${by} A${r} ${ry} 0 0 0 ${cx+r} ${by}" fill="none" stroke="${ink}" stroke-width="2"/><path d="M${cx-r} ${by} L${ax} ${ay} L${cx+r} ${by}" fill="none" stroke="${ink}" stroke-width="2"/>`}
function sphere(cx,cy,r,o={}){return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${o.fill||LB}" opacity=".55"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${ink}" stroke-width="2"/><path d="M${cx-r} ${cy} A${r} ${r*.28} 0 0 1 ${cx+r} ${cy}" fill="none" stroke="${ink}" stroke-width="1.1" stroke-dasharray="4 3"/><path d="M${cx-r} ${cy} A${r} ${r*.28} 0 0 0 ${cx+r} ${cy}" fill="none" stroke="${ink}" stroke-width="1.4"/>`}
function hemi(cx,cy,r,o={}){return `<path d="M${cx-r} ${cy} A${r} ${r} 0 0 0 ${cx+r} ${cy} A${r} ${r*.28} 0 0 0 ${cx-r} ${cy}Z" fill="${o.fill||LB}" opacity=".55"/><ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r*.28}" fill="${o.top||'#e6f1fb'}" stroke="${ink}" stroke-width="2"/><path d="M${cx-r} ${cy} A${r} ${r} 0 0 0 ${cx+r} ${cy}" fill="none" stroke="${ink}" stroke-width="2"/>`}
function cyl(cx,by,r,h,o={}){const ry=r*.28;return `<rect x="${cx-r}" y="${by-h}" width="${2*r}" height="${h}" fill="${o.fill||'none'}" opacity="${o.op||1}"/><ellipse cx="${cx}" cy="${by-h}" rx="${r}" ry="${ry}" fill="none" stroke="${ink}" stroke-width="1.6"/><path d="M${cx-r} ${by-h} V${by} A${r} ${ry} 0 0 0 ${cx+r} ${by} V${by-h}" fill="none" stroke="${ink}" stroke-width="1.6"/><path d="M${cx-r} ${by} A${r} ${ry} 0 0 1 ${cx+r} ${by}" fill="none" stroke="${ink}" stroke-width="1" stroke-dasharray="4 3"/>`}
const lbl=(x,y,t,o='')=>T(x,y,t,'font-size="14" '+o);
function heroDraw(){return `<path d="M30 110 L60 40 L90 110Z" fill="#fff" opacity=".85"/><circle cx="150" cy="80" r="30" fill="#fff" opacity=".85"/><path d="M200 80 A30 30 0 0 0 260 80Z" fill="#fff" opacity=".85"/>`}
const HERO=heroDraw;
const MIND=[['Cone: r, h, l',100,50],['CSA = πrl',420,50],['Sphere: 4πr²',90,150],['Hemisphere: 2πr², 3πr²',430,150],['Cone volume ⅓πr²h',110,250],['Sphere volume ⁴⁄₃πr³',410,250]];

const C=[
{id:'s1',num:'11.1',title:'The right circular cone and its slant height',
 intro:'An ice-cream cone, a birthday cap, a tent: all cones. What three lengths describe one?',
 obj:'Identify the radius r, height h and slant height l of a right circular cone and use l² = r² + h².',
 prior:'Pythagoras theorem; circle, radius, diameter.',
 simple:'Turn a right-angled triangle about one of its perpendicular sides and it sweeps out a right circular cone. The side it turns about is the height h, the other perpendicular side becomes the radius r of the circular base, and the hypotenuse becomes the slant height l. So l² = r² + h², or l = √(r² + h²).',
 detail:'A right circular cone has a circular base, a vertex (apex) directly above the centre of the base, and a curved surface. "Right" means the line from the vertex to the centre of the base is perpendicular to the base. The height h is the length of this line. Any line segment from the vertex to a point on the circle of the base is a slant height l; all slant heights are equal. In the right triangle formed by h, r and l, l is the hypotenuse, so l = √(r² + h²). Common triples: r = 3, h = 4 gives l = 5; r = 7, h = 24 gives l = 25; r = 5, h = 12 gives l = 13; r = 8, h = 15 gives l = 17.',
 real:'A clown\'s cap and a funnel are cones. Their makers need the slant height to cut the sheet.',
 apply:'A cone has radius 6 cm and height 8 cm. Find its slant height.',
 see:{w:520,h:260,f:[
  ['A right-angled triangle with perpendicular sides h and r.',`<path d="M260 30 L260 210 L350 210Z" fill="${LB}" stroke="${ink}" stroke-width="2"/><rect x="260" y="198" width="12" height="12" fill="none" stroke="${ink}"/>`+lbl(245,125,'h')+lbl(305,230,'r')+lbl(320,110,'l')],
  ['Turn it about side h: the other side sweeps a circle and the hypotenuse sweeps the curved surface.',cone(260,210,90,180,{op:.25})+`<path d="M200 70 A70 20 0 1 0 320 70" fill="none" stroke="${OR}" stroke-width="2"/><path d="M314 64 l8 6 l-9 4" fill="none" stroke="${OR}" stroke-width="2"/>`],
  ['So l² = r² + h². With r = 7, h = 24: l = √(49 + 576) = 25.',lbl(110,240,'l = √(r² + h²)','font-weight="700"')]]},
 seeNote:'All slant heights of a right circular cone are equal.',
 do:{title:'Make a cone from a triangle',mat:'A right-angled triangle cut from card, a pencil, tape',steps:['Tape one perpendicular side of the triangle to a pencil.','Spin the pencil quickly between your palms.','Look at the shape the triangle seems to make.'],obs:'A solid-looking cone appears.',why:'Rotating a right triangle about a leg generates a right circular cone.',lab:true},
 memo:'"r and h are the legs, l is the long one."',
 miscon:['"Slant height = height." l is always longer than h.','"l = r + h." Use Pythagoras: l = √(r² + h²).'],
 terms:['Right circular cone','Vertex (apex)','Height h','Slant height l'],
 q:{q:'A cone has r = 5 cm and h = 12 cm. Its slant height is:',o:['17 cm','13 cm','7 cm','√119 cm'],a:1,why:'√(25 + 144) = √169 = 13.'},
 exam:'Finding l before CSA is the first step of most cone problems.'},

{id:'s2',num:'11.1',title:'Curved and total surface area of a cone',
 intro:'Cut a paper cap along a slant line and flatten it. What shape do you get?',
 obj:'Derive and use CSA = πrl and TSA = πr(l + r).',
 prior:'Slant height (11.1); area of a circle; arc of a circle.',
 simple:'Open a cone along a slant height and it flattens into a sector of a circle of radius l. Its arc is the base circumference 2πr. Cutting the sector into many thin pieces and arranging them head-to-tail gives nearly a rectangle of length πr and height l. So the curved surface area (CSA) = πrl. Add the circular base πr² to get the total surface area (TSA) = πrl + πr² = πr(l + r).',
 detail:'The flattened curved surface is a sector with radius l and arc length 2πr. Cut it into many tiny sectors and arrange them alternately up and down: the shape approaches a rectangle with height l and length half the arc, i.e. ½ × 2πr = πr. Area = πr × l. So CSA of a cone = πrl. A cone closed at the base also has the circle of area πr². TSA = πrl + πr² = πr(l + r). Example: r = 7 cm, h = 24 cm → l = 25 cm; CSA = (22/7) × 7 × 25 = 550 cm²; TSA = 550 + 154 = 704 cm². Use CSA alone for open things such as a tent (no floor), a clown\'s cap or an ice-cream cone; use TSA for a closed solid. Units are square units.',
 real:'A conical tent needs canvas only for its curved surface: the area to buy is πrl, plus a little extra for stitching.',
 apply:'A conical tent is 10 m high and the radius of its base is 24 m. How much canvas is needed?',
 see:{w:520,h:260,f:[
  ['Open the cone along a slant height…',cone(110,200,60,150)+`<line x1="110" y1="50" x2="155" y2="215" stroke="${OR}" stroke-width="2" stroke-dasharray="5 3"/>`+lbl(150,130,'cut','fill="'+OR+'"')],
  ['…and it flattens into a sector of radius l with arc length 2πr.',(()=>{const cx=350,cy=60,R=150,a0=55,a1=125,p=a=>[cx+R*Math.cos(a*Math.PI/180),cy+R*Math.sin(a*Math.PI/180)];const [x0,y0]=p(a0),[x1,y1]=p(a1);return `<path d="M${cx} ${cy} L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}Z" fill="${LB}" opacity=".6" stroke="${ink}" stroke-width="2"/>`+lbl(cx+48,cy+70,'l')+lbl(cx,cy+R+20,'arc = 2πr')})()],
  ['Area of sector = ½ × arc × radius = ½ × 2πr × l = πrl.',lbl(260,250,'CSA = πrl   ·   TSA = πr(l + r)','font-weight="700"')]]},
 seeNote:'TSA adds the base circle, πr².',
 do:{title:'Cap from a sector',mat:'Chart paper, compass, scissors, tape',steps:['Draw a circle of radius 10 cm and cut out a sector of angle 216°.','Join its straight edges to make a cone.','Measure the base radius.'],obs:'The radius is about 6 cm, because arc = (216/360) × 2π × 10 = 2π × 6.',why:'The sector\'s arc becomes the base circumference.',lab:true},
 memo:'"Curved: πrl. Closed: add πr²."',
 miscon:['"CSA = πrh." Use slant height l, not h.','"A tent needs TSA." A tent has no canvas floor: CSA only.'],
 terms:['Curved surface area (CSA)','Total surface area (TSA)','Sector','Net of a cone'],
 q:{q:'CSA of a cone with r = 7 cm and l = 10 cm (π = 22/7):',o:['154 cm²','220 cm²','374 cm²','440 cm²'],a:1,why:'(22/7) × 7 × 10 = 220.'},
 exam:'Tent canvas, cap material and cost-per-m² problems are 3–4 marks.'},

{id:'s3',num:'11.2',title:'Surface area of a sphere',
 intro:'How much leather covers a football? Wrap string round a ball and find out.',
 obj:'Use the surface area of a sphere, 4πr².',
 prior:'Area of a circle πr².',
 simple:'A sphere is the set of all points in space at the same distance r from a centre. Wind a string round a ball until its surface is covered, then use the same length of string to fill circles with the ball\'s radius: it fills exactly four circles. So the surface area of a sphere = 4 × πr² = 4πr².',
 detail:'Activity: stick a nail in a ball, wind string round it from the nail until the surface is covered, marking start and end. Unwind it, and draw four circles each with radius equal to the ball\'s radius. Filling them with the string uses it all, so the sphere\'s surface = area of four great circles = 4πr². A great circle is a circle on the sphere whose centre is the sphere\'s centre. Example: r = 21 cm → SA = 4 × (22/7) × 21 × 21 = 5544 cm². If the radius doubles, the surface area becomes 4 times; if it is halved, the area becomes ¼. Archimedes showed this area equals the curved surface area of the cylinder that just encloses the sphere: 2πr × 2r = 4πr².',
 real:'Painting a spherical dome or covering a football: the material needed is 4πr².',
 apply:'The radius of a balloon increases from 7 cm to 14 cm. Find the ratio of the surface areas.',
 see:{w:520,h:240,f:[
  ['A sphere of radius r.',sphere(120,120,70)+`<line x1="120" y1="120" x2="190" y2="120" stroke="${OR}" stroke-width="2"/>`+lbl(155,112,'r')],
  ['The string that covers it exactly fills four circles of the same radius.',[0,1,2,3].map(i=>`<circle cx="${280+(i%2)*80}" cy="${80+Math.floor(i/2)*80}" r="35" fill="${LB}" stroke="${ink}" stroke-width="1.6"/>`).join('')+`<path d="M200 120 h40" stroke="${ink}" stroke-width="2"/><path d="M234 114 l8 6 l-8 6" fill="none" stroke="${ink}" stroke-width="2"/>`],
  ['Surface area = 4πr².',lbl(440,125,'4πr²','font-size="22" font-weight="700"')]]},
 seeNote:'A great circle has the same radius as the sphere.',
 do:{title:'String on a ball',mat:'A ball, string, a pin, paper, compass',steps:['Pin one end of the string to the top of the ball.','Wind it round, covering the surface completely.','Unwind it and fill circles of the ball\'s radius.'],obs:'About four circles get filled.',why:'SA of sphere = 4πr².',lab:false},
 memo:'"Sphere: four circles. 4πr²."',
 miscon:['"Doubling r doubles the area." Area goes as r²: 4 times.','"Use diameter in place of r." Halve the diameter first.'],
 terms:['Sphere','Great circle','Surface area 4πr²'],
 q:{q:'Surface area of a sphere of radius 7 cm:',o:['154 cm²','308 cm²','616 cm²','1437 cm²'],a:2,why:'4 × 22/7 × 49 = 616.'},
 exam:'Ratio questions (radius doubled, balloon inflated) are frequent 2-markers.'},

{id:'s4',num:'11.2',title:'Hemisphere: curved and total surface area',
 intro:'Cut an orange in half. How much peel does one half have, and how much cut surface?',
 obj:'Use CSA = 2πr² and TSA = 3πr² for a solid hemisphere, and handle hollow hemispherical bowls.',
 prior:'Surface area of a sphere (11.2).',
 simple:'A hemisphere is half a sphere, so its curved surface area is half of 4πr², i.e. 2πr². A solid hemisphere also has a flat circular face of area πr². So its total surface area = 2πr² + πr² = 3πr².',
 detail:'Cut a sphere through its centre along a great circle and you get two hemispheres. CSA (the rounded part) = ½ × 4πr² = 2πr². TSA of a solid hemisphere = 2πr² + πr² = 3πr². A hemispherical bowl is open, so for painting the inside only, use 2πr² with the inner radius; for the outside, use 2πr² with the outer radius. Example: a bowl of inner radius 5 cm: inner CSA = 2 × 3.14 × 25 = 157 cm². For a bowl with thickness t, outer radius = inner radius + t. Example: inner r = 5 cm, thickness 0.25 cm → outer r = 5.25 cm; outer CSA = 2 × (22/7) × 5.25² = 173.25 cm².',
 real:'Tinning the inside of a hemispherical copper vessel costs according to 2πr² of its inner surface.',
 apply:'Find the TSA of a solid hemisphere of radius 10 cm (π = 3.14).',
 see:{w:520,h:240,f:[
  ['A sphere cut through its centre.',sphere(120,120,70)+`<line x1="40" y1="120" x2="200" y2="120" stroke="${OR}" stroke-width="2" stroke-dasharray="5 3"/>`],
  ['One half: the curved part is 2πr².',hemi(360,90,70)+lbl(360,200,'curved: 2πr²')],
  ['A solid hemisphere also has the flat circle πr². TSA = 3πr².',lbl(360,60,'flat: πr²','font-size="13"')+lbl(360,228,'TSA = 3πr²','font-weight="700"')]]},
 seeNote:'Open bowl: 2πr² only.',
 do:{title:'Orange peel',mat:'An orange, a knife (with an adult), paper with circles of the same radius',steps:['Cut the orange in half.','Peel one half and lay the pieces in circles of the orange\'s radius.'],obs:'The peel of one half fills about two circles.',why:'CSA of a hemisphere = 2πr².',lab:false},
 memo:'"Half sphere: 2πr² curved, add one circle for 3πr²."',
 miscon:['"TSA of a hemisphere is 2πr²." That is CSA; solid TSA is 3πr².','"A bowl has 3πr²." An open bowl has no flat face.'],
 terms:['Hemisphere','CSA 2πr²','TSA 3πr²','Inner and outer radius'],
 q:{q:'TSA of a solid hemisphere of radius 7 cm:',o:['308 cm²','462 cm²','616 cm²','154 cm²'],a:1,why:'3 × 22/7 × 49 = 462.'},
 exam:'Bowl problems with thickness (inner and outer radius) are favourites.'},

{id:'s5',num:'11.3',title:'Volume of a right circular cone',
 intro:'How many cone-fulls of water fill a cylinder with the same base and height?',
 obj:'Use V = ⅓πr²h for a cone and solve related problems.',
 prior:'Volume of a cylinder πr²h (Class 8); slant height.',
 simple:'Make a cone and a cylinder with the same base radius and the same height. Fill the cone with water or sand and pour it into the cylinder. It takes exactly three cone-fulls to fill the cylinder. So the volume of a cone is one third of the cylinder: V = ⅓πr²h.',
 detail:'Activity: from tin or card make a hollow cylinder and a hollow cone of equal radius and height. Three fillings of the cone fill the cylinder, so V(cone) = ⅓ × πr²h. Remember to use the vertical height h, not the slant height. If only l is given, find h = √(l² − r²) first. Example: r = 7 cm, h = 24 cm → V = ⅓ × (22/7) × 49 × 24 = 1232 cm³. Volume is in cubic units, and 1 litre = 1000 cm³, so 1232 cm³ = 1.232 L. A heap of wheat is often cone-shaped: its volume tells how much grain there is, and its CSA tells how much canvas covers it.',
 real:'A conical heap of grain in a field: its volume gives the amount of grain, and its CSA tells how much tarpaulin covers it from rain.',
 apply:'A conical pit is 3.5 m across the top and 12 m deep. What is its capacity in kilolitres?',
 see:{w:520,h:260,f:[
  ['A cylinder and a cone with the same radius and height.',cyl(140,220,60,160)+cone(360,220,60,160)],
  ['One cone-full of water fills one third of the cylinder.',cyl(140,220,60,53.3,{fill:'#85b7eb',op:.6})+`<rect x="80" y="166" width="120" height="54" fill="#85b7eb" opacity=".6"/>`+lbl(140,150,'⅓')],
  ['Three cone-fulls fill it. V(cone) = ⅓πr²h.',`<rect x="80" y="60" width="120" height="160" fill="#85b7eb" opacity=".35"/>`+lbl(260,250,'V = ⅓ πr²h','font-weight="700"')]]},
 seeNote:'Same base radius, same height.',
 do:{title:'Three fills (cone vs cylinder)',mat:'Card, tape, sand or rice',steps:['Make an open cylinder and an open cone of the same radius and height.','Fill the cone with sand, level it, and pour into the cylinder.','Count how many fills it takes.'],obs:'Three fills.',why:'V(cone) = ⅓ V(cylinder).',lab:true},
 memo:'"Cone is a third of its cylinder: ⅓πr²h."',
 miscon:['"Use l in the volume formula." Use vertical height h.','"Volume in cm²." Volume is in cm³.'],
 terms:['Volume','Capacity','Cubic centimetre (cm³)','Litre (1000 cm³)'],
 q:{q:'Volume of a cone with r = 3 cm and h = 7 cm (π = 22/7):',o:['22 cm³','66 cm³','198 cm³','132 cm³'],a:1,why:'⅓ × 22/7 × 9 × 7 = 66.'},
 exam:'Capacity in litres/kilolitres and "find h from l" are common 3-mark questions.'},

{id:'s6',num:'11.4',title:'Volume of a sphere and a hemisphere',
 intro:'Drop a ball into a full glass of water. The water that spills out has the same volume as the ball.',
 obj:'Use V = ⁴⁄₃πr³ for a sphere and ⅔πr³ for a hemisphere.',
 prior:'Surface area of a sphere; volume of a cone.',
 simple:'Put spheres of different radii into a full container and measure the water that overflows each time. The results fit V = ⁴⁄₃πr³. A hemisphere holds half of this: ⅔πr³.',
 detail:'Activity: fill a container to the brim, place it in a tray, and gently immerse a ball of radius r; collect and measure the overflow. Repeating with balls of radii 3, 4, 5 cm shows V = ⁴⁄₃πr³. A hemisphere: V = ½ × ⁴⁄₃πr³ = ⅔πr³. Example: r = 11.2 cm → V = ⁴⁄₃ × (22/7) × 11.2³ ≈ 5887.32 cm³. If the radius doubles, volume becomes 8 times (2³). A hemispherical bowl of radius 3.5 cm holds ⅔ × (22/7) × 3.5³ ≈ 89.8 cm³ ≈ 0.0898 L. Hollow sphere (shell) volume = ⁴⁄₃π(R³ − r³), using outer R and inner r. Archimedes\' favourite result: a sphere has ⅔ the volume of the cylinder that just encloses it (⁴⁄₃πr³ vs πr² × 2r = 2πr³).',
 real:'Medicine capsules, ball bearings and globes: their material is worked out with ⁴⁄₃πr³.',
 apply:'How many litres of milk can a hemispherical bowl of diameter 10.5 cm hold?',
 see:{w:520,h:240,f:[
  ['A container filled to the brim, in a tray.',`<rect x="60" y="60" width="140" height="150" fill="#85b7eb" opacity=".45" stroke="${ink}" stroke-width="2"/><rect x="30" y="210" width="200" height="16" fill="none" stroke="${ink}" stroke-width="2"/>`],
  ['A ball pushed in makes water overflow into the tray.',sphere(130,130,40)+`<path d="M60 60 q-12 40 -14 150" stroke="#185fa5" stroke-width="3" fill="none"/><rect x="32" y="214" width="196" height="10" fill="#85b7eb" opacity=".7"/>`],
  ['Volume of overflow = volume of ball = ⁴⁄₃πr³. Hemisphere: ⅔πr³.',lbl(380,110,'sphere: ⁴⁄₃πr³','font-weight="700"')+lbl(380,150,'hemisphere: ⅔πr³','font-weight="700"')]]},
 seeNote:'Displacement: the overflow equals the immersed volume.',
 do:{title:'Overflow method',mat:'A glass filled to the brim, a tray, balls of different sizes, a measuring cylinder',steps:['Stand the full glass in the tray.','Lower a ball in gently until it is fully under water.','Measure the water in the tray; compare with ⁴⁄₃πr³.'],obs:'Measured volume is close to the formula.',why:'An immersed object pushes out its own volume of water.',lab:false},
 memo:'"Four-thirds pi r cubed; half of it for a bowl."',
 miscon:['"Volume is 4πr²." That is surface area.','"Doubling r doubles volume." It becomes 8 times.'],
 terms:['Volume of sphere','Volume of hemisphere','Displacement','Spherical shell'],
 q:{q:'Volume of a sphere of radius 3 cm (use π = 22/7):',o:['113.14 cm³','36 cm³','84.86 cm³','339.43 cm³'],a:0,why:'⁴⁄₃ × 22/7 × 27 = 792/7 ≈ 113.14.'},
 exam:'Capacity of bowls, number of small balls made from a big one, and ratio of volumes are common.'}
];

const CARDS=[['Slant height','l = √(r² + h²)'],['Cone CSA','πrl'],['Cone TSA','πr(l + r)'],['Cone volume','⅓πr²h'],['Sphere SA','4πr²'],['Sphere volume','⁴⁄₃πr³'],['Hemisphere CSA','2πr²'],['Hemisphere TSA (solid)','3πr²'],['Hemisphere volume','⅔πr³'],['Triples','(3,4,5), (5,12,13), (7,24,25), (8,15,17)'],['Units','Area in cm², m²; volume in cm³, m³.'],['Litres','1 L = 1000 cm³; 1 m³ = 1000 L = 1 kL.'],['Radius doubled','Area × 4, volume × 8.'],['Tent or cap','CSA only (no base).']];

const Q=[
 {lv:1,q:'The slant height of a cone with r = 3 cm, h = 4 cm is:',o:['5 cm','7 cm','12 cm','√7 cm'],a:0,w:'√(9+16) = 5.'},
 {lv:1,q:'Curved surface area of a cone is:',o:['πr²h','πrl','2πrh','πr(l+r)'],a:1,w:'CSA = πrl.'},
 {lv:1,q:'Surface area of a sphere is:',o:['2πr²','3πr²','4πr²','⁴⁄₃πr³'],a:2,w:'4πr².'},
 {lv:1,q:'Volume of a hemisphere is:',o:['⅔πr³','⁴⁄₃πr³','2πr²','⅓πr³'],a:0,w:'Half of ⁴⁄₃πr³.'},
 {lv:2,q:'CSA of a cone with r = 7 cm, l = 25 cm (π = 22/7):',o:['550 cm²','704 cm²','1232 cm²','154 cm²'],a:0,w:'22/7 × 7 × 25 = 550.'},
 {lv:2,q:'TSA of a solid hemisphere of radius 14 cm (π = 22/7):',o:['1232 cm²','1848 cm²','2464 cm²','616 cm²'],a:1,w:'3 × 22/7 × 196 = 1848.'},
 {lv:2,q:'Volume of a cone with r = 7 cm and h = 24 cm (π = 22/7):',o:['3696 cm³','1232 cm³','616 cm³','550 cm³'],a:1,w:'⅓ × 22/7 × 49 × 24 = 1232.'},
 {lv:3,q:'The radius of a sphere is doubled. Its volume becomes:',o:['2 times','4 times','6 times','8 times'],a:3,w:'(2r)³ = 8r³.'},
 {lv:3,q:'A cone has l = 13 cm and r = 5 cm. Its volume (π = 3.14) is about:',o:['314 cm³','204 cm³','1020 cm³','942 cm³'],a:0,w:'h = 12; ⅓ × 3.14 × 25 × 12 = 314.'},
 {lv:3,q:'Canvas for a conical tent with r = 24 m and h = 10 m (π = 22/7) is about:',o:['754.3 m²','1961.1 m²','2640 m²','1810.3 m²'],a:1,w:'l = 26; 22/7 × 24 × 26 ≈ 1961.1 m².'},
 {lv:4,q:'A sphere and a cone have the same radius r and equal volumes. The height of the cone is:',o:['r','2r','3r','4r'],a:3,w:'⅓πr²h = ⁴⁄₃πr³ → h = 4r.'},
 {lv:4,q:'Assertion (A): A hemispherical bowl of radius r needs 3πr² of paint inside. Reason (R): TSA of a solid hemisphere is 3πr².',o:['Both true and R explains A','Both true but R does not explain A','A false, R true','A true, R false'],a:2,w:'An open bowl\'s inside is 2πr²; R is true for a solid.'},
 {lv:4,q:'The ratio of surface areas of two spheres is 9 : 16. The ratio of their volumes is:',o:['3 : 4','9 : 16','27 : 64','81 : 256'],a:2,w:'r ratio 3 : 4 → volume 27 : 64.'},
 {lv:5,open:true,m:3,q:'A conical tent is 10 m high and its base radius is 24 m. Find (i) its slant height (ii) the cost of canvas at ₹70 per m² (π = 22/7).',ans:['l = √(24² + 10²) = 26 m (1).','CSA = (22/7) × 24 × 26 = 13728/7 m² ≈ 1961.14 m² (1).','Cost = 13728/7 × 70 = ₹1,37,280 (1).']},
 {lv:5,open:true,m:3,q:'A hemispherical bowl is made of steel 0.25 cm thick. Its inner radius is 5 cm. Find its outer curved surface area (π = 22/7).',ans:['Outer radius = 5 + 0.25 = 5.25 cm (1).','Outer CSA = 2πR² (1).','= 2 × 22/7 × 5.25 × 5.25 = 173.25 cm² (1).']},
 {lv:5,open:true,m:4,q:'A metal sphere of radius 4.2 cm is melted and recast as a cone of base radius 4.2 cm. Find the height of the cone.',ans:['Volume is conserved: ⁴⁄₃πr³ = ⅓πr²h (1).','Cancel ⅓πr²: 4r = h (1).','h = 4 × 4.2 = 16.8 cm (1).','Check: units cm; no π value needed (1).']}
];

const ONEMIN=['Cone: l = √(r² + h²).','Cone CSA = πrl; TSA = πr(l + r).','Cone volume = ⅓πr²h (three cones fill the cylinder).','Sphere: SA = 4πr²; V = ⁴⁄₃πr³.','Hemisphere: CSA 2πr²; solid TSA 3πr²; V = ⅔πr³.','Open bowl/tent: no base area.','Double r: area × 4, volume × 8.','1 L = 1000 cm³; 1 m³ = 1 kL.','Use h (not l) in volume; find h = √(l² − r²) if needed.','Melting/recasting: volume stays the same.'];
const KEYS=[['l = √(r²+h²)',/√|slant|r²\s*\+\s*h²|pythag/i],['πrl',/πrl|pi\s*r\s*l/i],['πr(l+r)',/l\s*\+\s*r|tsa/i],['⅓πr²h',/⅓|1\/3|third/i],['4πr²',/4πr²|4\s*pi\s*r/i],['⁴⁄₃πr³',/⁴⁄₃|4\/3/],['2πr²',/2πr²|2\s*pi\s*r/i],['3πr²',/3πr²|3\s*pi\s*r/i],['⅔πr³',/⅔|2\/3/],['units cm² / cm³',/cm²|cm³|cubic|square/i]];

/* ---------- lab ---------- */
let sol='cone',R=7,H=24;
const P=22/7;
function labDraw(){const s=Math.min(110/R,200/(sol==='cone'?Math.max(H,R):2*R)),rr=R*s;
 $('#sHrow').style.display=sol==='cone'?'':'none';
 let g='';let out='';
 if(sol==='cone'){const hh=H*s,l=Math.hypot(R,H),by=270;g=cone(170,by,rr,hh)+`<line x1="170" y1="${by}" x2="170" y2="${by-hh}" stroke="${OR}" stroke-width="2" stroke-dasharray="5 3"/><line x1="170" y1="${by}" x2="${170+rr}" y2="${by}" stroke="${OR}" stroke-width="2"/>`+lbl(160,by-hh/2,'h','text-anchor="end"')+lbl(170+rr/2,by+20,'r')+lbl(170+rr/2+14,by-hh/2,'l');
  const csa=P*R*l,tsa=csa+P*R*R,v=P*R*R*H/3;
  g+=lbl(380,80,`r = ${R} cm`)+lbl(380,104,`h = ${H} cm`)+lbl(380,128,`l = ${fx(l)} cm`);
  out=`<p>l = √(${R}² + ${H}²) = √${R*R+H*H} = <b>${fx(l)} cm</b>${Number.isInteger(l)?' (a whole number!)':''}</p><p>CSA = πrl = 22/7 × ${R} × ${fx(l)} = <b>${fx(csa)} cm²</b></p><p>TSA = CSA + πr² = ${fx(csa)} + ${fx(P*R*R)} = <b>${fx(tsa)} cm²</b></p><p>Volume = ⅓πr²h = ⅓ × 22/7 × ${R}² × ${H} = <b>${fx(v)} cm³</b> (${fx(v/1000,3)} L)</p>`}
 else if(sol==='sph'){g=sphere(170,160,rr)+`<line x1="170" y1="160" x2="${170+rr}" y2="160" stroke="${OR}" stroke-width="2"/>`+lbl(170+rr/2,152,'r')+lbl(380,120,`r = ${R} cm`);
  out=`<p>Surface area = 4πr² = 4 × 22/7 × ${R}² = <b>${fx(4*P*R*R)} cm²</b></p><p>Volume = ⁴⁄₃πr³ = ⁴⁄₃ × 22/7 × ${R}³ = <b>${fx(4/3*P*R**3)} cm³</b> (${fx(4/3*P*R**3/1000,3)} L)</p><p>Try doubling r: area × 4, volume × 8.</p>`}
 else{g=hemi(170,110,rr)+`<line x1="170" y1="110" x2="${170+rr}" y2="110" stroke="${OR}" stroke-width="2"/>`+lbl(170+rr/2,104,'r')+lbl(380,120,`r = ${R} cm`);
  out=`<p>CSA = 2πr² = 2 × 22/7 × ${R}² = <b>${fx(2*P*R*R)} cm²</b></p><p>TSA (solid) = 3πr² = <b>${fx(3*P*R*R)} cm²</b></p><p>Volume = ⅔πr³ = <b>${fx(2/3*P*R**3)} cm³</b> (${fx(2/3*P*R**3/1000,3)} L)</p><p>An open bowl has only the curved surface, 2πr².</p>`}
 $('#sSvg').innerHTML=g;$('#sOut').innerHTML=out}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const t=e.target;if(t&&(t.id==='sR'||t.id==='sH'))labChange(t)})}
function labShow(){labDraw()}
function labClick(){return false}
function labChange(t){if(t.id==='sSol'){sol=t.value;labDraw();return true}if(t.id==='sR'){R=+t.value;labDraw();return true}if(t.id==='sH'){H=+t.value;labDraw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
