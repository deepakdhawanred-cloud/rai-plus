/* Rai Plus content pack: Class 10 Mathematics, Chapter 12 – Surface Areas and Volumes (rationalised NCERT: combinations of solids) */
RP.register({key:'10mat12',cls:'10',subject:'Mathematics',ch:'12',title:"Surface Areas and Volumes",color:'#3d5a2a',
crumb:"HBSE Class 10 Mathematics · Unit: Mensuration · Taught in December",h1:"Chapter 12: Surface Areas and Volumes",sub:"Real objects are made of joined solids. Count only the surfaces you can see, and add (or subtract) the volumes.",heroLabel:"A toy made of a cone on a hemisphere and a tent made of a cone on a cylinder",labName:'Combination lab',
theme:"\n:root{--g:light-dark(#3d5a2a,#a9cf8f);--g2:light-dark(#eef5e8,#121b0d);--line:light-dark(#d6e6c9,#2c3d22);--bg:light-dark(#ffffff,#0b1008);--card:light-dark(#ffffff,#10170c);\n--ink:light-dark(#131c0d,#e7f0df);--mute:light-dark(#566749,#adc09f);--y:light-dark(#9a4b1c,#f0a873);--y2:light-dark(#fbeee4,#2a170a);--hd:#2c431d}\n",
labHTML:`  <h2>Combination lab</h2>
  <p>Choose an object, set its measurements, and see which surfaces count and how the total is built (π = 22/7).</p>
  <div class="ctrl"><label>Object<select id="kObj"><option value="toy">Toy: cone on a hemisphere</option><option value="cap">Capsule: cylinder with hemispherical ends</option><option value="tent">Tent: cone on a cylinder</option><option value="cube">Cube with a hemisphere on top</option><option value="scoop">Cylinder with hemispheres scooped out of both ends</option></select></label></div>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="kSvg" viewBox="0 0 440 340" role="img" aria-label="The combined solid" style="color:var(--ink)"></svg></div></div>
  <div><div id="kCtl"></div><div class="box y" id="kOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3d5a2a',LABNAME='Combination lab',MIND_CENTER='Combined solids';
const OR='#9a4b1c',LB='#b5d4f4',LG='#c0dd97',ink='currentColor',P=22/7;
const fx=(n,d=2)=>(+n.toFixed(d)).toLocaleString('en-IN');
const lbl=(x,y,t,o='')=>T(x,y,t,'font-size="14" '+o);
const E=(cx,cy,r)=>r*.28;
/* drawing helpers: all vertical-axis solids */
function coneUp(cx,by,r,h,f=LB){const ry=E(0,0,r);return `<path d="M${cx-r} ${by} L${cx} ${by-h} L${cx+r} ${by} A${r} ${ry} 0 0 1 ${cx-r} ${by}Z" fill="${f}" opacity=".6"/><path d="M${cx-r} ${by} L${cx} ${by-h} L${cx+r} ${by}" fill="none" stroke="${ink}" stroke-width="2"/><path d="M${cx-r} ${by} A${r} ${ry} 0 0 0 ${cx+r} ${by}" fill="none" stroke="${ink}" stroke-width="1.6"/>`}
function hemiDown(cx,cy,r,f=LG,topEdge=true){const ry=E(0,0,r);return `<path d="M${cx-r} ${cy} A${r} ${r} 0 0 0 ${cx+r} ${cy} A${r} ${ry} 0 0 1 ${cx-r} ${cy}Z" fill="${f}" opacity=".6"/><path d="M${cx-r} ${cy} A${r} ${r} 0 0 0 ${cx+r} ${cy}" fill="none" stroke="${ink}" stroke-width="2"/>`+(topEdge?`<path d="M${cx-r} ${cy} A${r} ${ry} 0 0 1 ${cx+r} ${cy}" fill="none" stroke="${ink}" stroke-width="1" stroke-dasharray="4 3"/>`:'')}
function hemiUp(cx,cy,r,f=LG){const ry=E(0,0,r);return `<path d="M${cx-r} ${cy} A${r} ${r} 0 0 1 ${cx+r} ${cy} A${r} ${ry} 0 0 1 ${cx-r} ${cy}Z" fill="${f}" opacity=".6"/><path d="M${cx-r} ${cy} A${r} ${r} 0 0 1 ${cx+r} ${cy}" fill="none" stroke="${ink}" stroke-width="2"/><path d="M${cx-r} ${cy} A${r} ${ry} 0 0 0 ${cx+r} ${cy}" fill="none" stroke="${ink}" stroke-width="1.4"/>`}
function cylV(cx,by,r,h,f=LB,caps=true){const ry=E(0,0,r);return `<path d="M${cx-r} ${by-h} V${by} A${r} ${ry} 0 0 0 ${cx+r} ${by} V${by-h} A${r} ${ry} 0 0 0 ${cx-r} ${by-h}Z" fill="${f}" opacity=".55"/><path d="M${cx-r} ${by-h} V${by} A${r} ${ry} 0 0 0 ${cx+r} ${by} V${by-h}" fill="none" stroke="${ink}" stroke-width="2"/>`+(caps?`<ellipse cx="${cx}" cy="${by-h}" rx="${r}" ry="${ry}" fill="none" stroke="${ink}" stroke-width="1.6"/>`:`<path d="M${cx-r} ${by-h} A${r} ${ry} 0 0 0 ${cx+r} ${by-h}" fill="none" stroke="${ink}" stroke-width="1.6"/><path d="M${cx-r} ${by-h} A${r} ${ry} 0 0 1 ${cx+r} ${by-h}" fill="none" stroke="${ink}" stroke-width="1" stroke-dasharray="4 3"/>`)+`<path d="M${cx-r} ${by} A${r} ${ry} 0 0 1 ${cx+r} ${by}" fill="none" stroke="${ink}" stroke-width="1" stroke-dasharray="4 3"/>`}
function cube(x,y,a,f='#f1efe8'){const d=a*.35;return `<path d="M${x} ${y} h${a} l${d} ${-d} h${-a}Z" fill="${f}" stroke="${ink}" stroke-width="1.6"/><path d="M${x+a} ${y} v${a} l${d} ${-d} v${-a}Z" fill="#d3d1c7" stroke="${ink}" stroke-width="1.6"/><rect x="${x}" y="${y}" width="${a}" height="${a}" fill="${f}" stroke="${ink}" stroke-width="2"/>`}
function heroDraw(){return `<path d="M40 70 L70 20 L100 70Z" fill="#fff" opacity=".85"/><path d="M40 70 A30 30 0 0 0 100 70Z" fill="#fff" opacity=".6"/><rect x="150" y="60" width="80" height="50" fill="#fff" opacity=".6"/><path d="M150 60 L190 20 L230 60Z" fill="#fff" opacity=".85"/>`}
const HERO=heroDraw;
const MIND=[['Formula toolkit',100,50],['Visible surfaces only',420,50],['Joined faces vanish',90,150],['Hollows add curved area',430,150],['Volumes add',110,250],['Cost, mass, capacity',410,250]];

const C=[
{id:'k1',num:'12.1',title:'Toolkit: the basic solids',
 intro:'A capsule, a tent, a toy top: before combining them, keep every basic formula ready.',
 obj:'Recall the surface areas and volumes of the cuboid, cube, cylinder, cone, sphere and hemisphere.',
 prior:'Class 9 Chapter 11 (cone, sphere, hemisphere); Class 8 cuboid and cylinder.',
 simple:'Every combined object in this chapter is built from six solids. Know their curved/total surface areas and volumes, and know which surfaces each one has: a cylinder has a curved surface and two circular ends; a cone has a curved surface and one base; a hemisphere has a curved surface and one flat circle.',
 detail:'Cuboid l × b × h: TSA = 2(lb + bh + hl), V = lbh. Cube of edge a: TSA = 6a², V = a³. Cylinder (r, h): CSA = 2πrh, TSA = 2πr(r + h), V = πr²h. Cone (r, h, l = √(r² + h²)): CSA = πrl, TSA = πr(l + r), V = ⅓πr²h. Sphere: SA = 4πr², V = ⁴⁄₃πr³. Hemisphere: CSA = 2πr², TSA = 3πr², V = ⅔πr³. Take π = 22/7 unless told otherwise. Watch units: area in cm² or m², volume in cm³ or m³; 1 m³ = 1000 L; 1 L = 1000 cm³.',
 real:'An engineer pricing a water tank or a tailor cutting a tent works from exactly these formulas.',
 apply:'List the surfaces of a cylinder, a cone and a hemisphere, and give the area of each.',
 see:{w:520,h:230,f:[
  ['Cylinder: curved 2πrh + two circles.',cylV(80,180,40,110)+lbl(80,215,'2πrh, πr², πr²')],
  ['Cone: curved πrl + one base.',coneUp(220,180,40,120)+lbl(220,215,'πrl, πr²')],
  ['Hemisphere: curved 2πr² + one flat circle.',hemiDown(360,120,45)+`<ellipse cx="360" cy="120" rx="45" ry="12.6" fill="none" stroke="${ink}" stroke-width="1.6"/>`+lbl(360,215,'2πr², πr²')],
  ['Sphere: one curved surface, 4πr².',`<circle cx="470" cy="130" r="40" fill="${LB}" opacity=".6" stroke="${ink}" stroke-width="2"/>`+lbl(470,215,'4πr²')]]},
 seeNote:'Knowing each solid\'s faces is the key to combinations.',
 do:{title:'Formula card',mat:'An index card',steps:['Write the six solids in a column.','For each, write CSA, TSA and V.','Mark the faces of each solid with a tick.'],obs:'A one-page toolkit for every problem.',why:'Combinations are just sums of these parts.',lab:false},
 memo:'"Cylinder 2πrh, cone πrl, hemisphere 2πr², sphere 4πr²."',
 miscon:['"CSA of cone uses h." It uses slant height l.','"A hemisphere\'s TSA is always used." Only if its flat face shows.'],
 terms:['Curved surface area','Total surface area','Volume','π = 22/7'],
 q:{q:'CSA of a cylinder of radius r and height h:',o:['πr²h','2πrh','2πr(r+h)','πrl'],a:1,why:'2πrh.'},
 exam:'Formulas are not given in the exam; they must be memorised.'},

{id:'k2',num:'12.2',title:'Surface area of a combination: count only what shows',
 intro:'A spinning top is a cone sitting on a hemisphere. How much paint covers it?',
 obj:'Find the surface area of a combined solid by adding only the surfaces that are exposed.',
 prior:'Toolkit formulas (12.1).',
 simple:'When two solids are joined, the faces that touch each other are hidden inside. They are not part of the outer surface. So add up only the surfaces you can see. For a top made of a cone on a hemisphere of the same radius, the circular faces are joined, so surface area = CSA of cone + CSA of hemisphere = πrl + 2πr².',
 detail:'Method: (1) name the solids; (2) list every surface each one has; (3) strike out joined faces; (4) add the rest. Example (top): r = 3.5 cm, cone height 12 cm, so l = √(3.5² + 12²) = 12.5 cm. SA = πrl + 2πr² = 22/7 × 3.5 × 12.5 + 2 × 22/7 × 3.5² = 137.5 + 77 = 214.5 cm². Capsule: a cylinder (length 9 mm, r = 2.5 mm) with a hemisphere on each end. SA = 2πrh + 2 × 2πr² = 141.43 + 78.57 = 220 mm² (the two hemispheres make one sphere\'s area, 4πr²). Note that the total surface area of the combination is NOT the sum of the separate TSAs.',
 real:'A medicine capsule\'s coating, a toy top\'s paint, a pencil cap\'s plastic: each uses only outer surfaces.',
 apply:'A toy is a cone of radius 3.5 cm on a hemisphere of the same radius. The total height is 15.5 cm. Find its total surface area.',
 see:{w:520,h:250,f:[
  ['Two separate solids: a cone and a hemisphere with the same radius.',coneUp(130,120,50,110)+hemiDown(130,160,50)+`<ellipse cx="130" cy="160" rx="50" ry="14" fill="none" stroke="${ink}" stroke-width="1.4"/>`],
  ['Join them: the two circular faces press together and disappear inside.',coneUp(360,130,50,110,LB)+hemiDown(360,130,50,LG,false)+`<path d="M310 130 A50 14 0 0 1 410 130" fill="none" stroke="${OR}" stroke-width="2" stroke-dasharray="4 3"/>`+lbl(450,136,'hidden','fill="'+OR+'" font-size="12"')],
  ['Surface area = πrl + 2πr² (no circles).',lbl(360,240,'SA = πrl + 2πr²','font-weight="700"')]]},
 seeNote:'Joined faces are not on the outside.',
 do:{title:'Paint test',mat:'Clay, two colours of paint (or crayons)',steps:['Make a clay cone and a clay hemisphere of the same radius.','Colour all their surfaces.','Join them and look: which colour can you no longer see?'],obs:'The two flat circles are hidden.',why:'Only exposed surfaces count.',lab:true},
 memo:'"Joined faces hide; add only the outside."',
 miscon:['"Add the TSAs of each part." That counts hidden faces.','"Two hemispheres = 2 × 3πr²." On a capsule only curved parts show: 4πr².'],
 terms:['Combination of solids','Exposed surface','Hidden (joined) face'],
 q:{q:'A capsule (cylinder h, radius r, hemispherical ends) has surface area:',o:['2πrh + 6πr²','2πrh + 4πr²','2πr(r + h) + 4πr²','πr²h + ⁴⁄₃πr³'],a:1,why:'Cylinder curved + two hemispheres curved.'},
 exam:'Exercise 12.1 problems (toys, capsules, tents) are 3-mark questions every year.'},

{id:'k3',num:'12.2',title:'Joined unequal faces: a hemisphere on a cube',
 intro:'A hemisphere sits on top of a cube. Part of the cube\'s top is covered, part still shows.',
 obj:'Handle joins where a smaller face sits on a larger one, giving 6a² + πr².',
 prior:'Count only exposed surfaces (12.2).',
 simple:'When a hemisphere of radius r sits on a cube of edge a, it covers a circle of area πr² on the cube\'s top. The cube shows 6a² − πr². The hemisphere adds its curved surface 2πr². Total = 6a² − πr² + 2πr² = 6a² + πr².',
 detail:'Example: a cubical block of side 7 cm is surmounted by a hemisphere of the greatest possible diameter, 7 cm (r = 3.5 cm). SA = 6 × 49 + 22/7 × 3.5² = 294 + 38.5 = 332.5 cm². The greatest diameter of a hemisphere that fits on a face is the edge of the cube, a. Similar cases: a cone on a cylinder of equal radius (tent): the circle is fully hidden; a cylinder on a cuboid: the cuboid loses a circle of πr² from its top, and the cylinder adds its curved surface 2πrh plus its top circle πr², so the circle "moves up" and the net extra is just 2πrh.',
 real:'A decorative block in a garden or a trophy base: paint is needed for the visible parts of the cube and the dome.',
 apply:'A cube of edge 5 cm has a hemisphere of diameter 4.2 cm on top. Find the total surface area.',
 see:{w:520,h:250,f:[
  ['A cube of edge a.',cube(160,90,140)],
  ['A hemisphere sits on the top face, covering a circle of area πr².',`<ellipse cx="${230+24}" cy="${90-24}" rx="60" ry="17" fill="${OR}" opacity=".3"/>`+hemiUp(254,66,60)],
  ['Surface = 6a² − πr² (cube) + 2πr² (dome) = 6a² + πr².',lbl(260,248,'SA = 6a² + πr²','font-weight="700"')]]},
 seeNote:'The covered circle is removed; the dome is added.',
 do:{title:'Sticky-note check',mat:'A cube-shaped box, a bowl, paper',steps:['Place the bowl upside down on the box.','Trace round the bowl\'s rim on the box top.','Which part of the box top is still visible?'],obs:'Only the area outside the circle shows.',why:'Subtract the covered circle, then add the dome.',lab:true},
 memo:'"Take away the footprint, add the dome."',
 miscon:['"6a² + 2πr²." You must remove the covered circle: 6a² + πr².','"Hemisphere TSA 3πr² is added." Its flat face is hidden.'],
 terms:['Surmounted','Footprint (covered face)','Greatest possible diameter'],
 q:{q:'SA of a cube (edge 7 cm) with a hemisphere (r = 3.5 cm) on top:',o:['294 cm²','332.5 cm²','371 cm²','409.5 cm²'],a:1,why:'294 + 38.5.'},
 exam:'"Greatest diameter the hemisphere can have" appears with this type.'},

{id:'k4',num:'12.2',title:'Hollows and depressions',
 intro:'Scoop a hemisphere out of the end of a wooden cylinder. Does the surface area go up or down?',
 obj:'Find surface areas when a solid is cut out of another.',
 prior:'Exposed surfaces; hemisphere CSA.',
 simple:'Cutting a hollow removes a flat face but creates a new curved inside surface. For a hemisphere scooped out of a cylinder\'s end, the circle πr² goes, but the bowl inside adds 2πr². So the total goes up by πr² for each scoop.',
 detail:'Example: from a solid cylinder of height 10 cm and radius 3.5 cm, a hemisphere is scooped out at each end. Original TSA = 2πrh + 2πr². After scooping: the two end circles are gone, two hemispherical bowls appear: SA = 2πrh + 2 × 2πr² = 220 + 154 = 374 cm². Volume goes down: πr²h − 2 × ⅔πr³ = 385 − 179.67 = 205.33 cm³. Other cases: a cone hollowed out of a cylinder (same base, same height): SA = 2πrh + πr² (top circle) + πrl (inside cone). A bird-bath: a cylinder with a hemispherical depression at the top: SA = 2πrh + 2πr² (the top circle is replaced by the bowl).',
 real:'A bird-bath, a pen stand with holes, and a mould with a cavity are hollows.',
 apply:'A cylinder of height 2.4 cm and diameter 1.4 cm has a conical cavity of the same height and diameter. Find the total surface area of the remaining solid (nearest cm²).',
 see:{w:520,h:250,f:[
  ['A solid cylinder.',cylV(140,210,60,170,LB,true)],
  ['Scoop a hemisphere out of each end.',hemiDown(140,40,60,'#ffffff',false)+`<path d="M80 210 A60 60 0 0 1 200 210" fill="none" stroke="${OR}" stroke-width="2" stroke-dasharray="5 3"/><path d="M80 40 A60 60 0 0 0 200 40" fill="none" stroke="${OR}" stroke-width="2" stroke-dasharray="5 3"/>`],
  ['End circles are gone; two bowls appear. SA = 2πrh + 4πr².',lbl(370,110,'lose: 2 × πr²')+lbl(370,140,'gain: 2 × 2πr²')+lbl(370,190,'SA = 2πrh + 4πr²','font-weight="700"')]]},
 seeNote:'Surface area goes up; volume goes down.',
 do:{title:'Clay scoop',mat:'A clay cylinder, a spoon',steps:['Shape a thick clay cylinder.','Scoop out a round bowl from the top with a spoon.','Compare: is there more surface to paint now?'],obs:'The bowl\'s inside has more area than the flat circle.',why:'2πr² > πr².',lab:true},
 memo:'"Hollow out: lose a circle, gain a bowl."',
 miscon:['"Removing material reduces the surface area." Here it increases it.','"Subtract the hemisphere\'s area." Add its curved area, subtract only the flat circle.'],
 terms:['Depression','Cavity','Scooped out'],
 q:{q:'A hemisphere of radius r is scooped from one end of a cylinder (radius r, height h). The new TSA is:',o:['2πrh + 2πr²','2πrh + 3πr²','2πrh + πr²','2πrh + 4πr²'],a:1,why:'One circle (bottom) πr² + bowl 2πr² + curved 2πrh.'},
 exam:'Scooped-out and cavity problems are Exercise 12.1 Q8–Q9 types.'},

{id:'k5',num:'12.3',title:'Volume of a combination of solids',
 intro:'How much air is inside a tent made of a cylinder with a cone on top?',
 obj:'Find the volume of combined solids by adding (or subtracting) the volumes of the parts.',
 prior:'Toolkit volumes (12.1).',
 simple:'Unlike surface area, volume has no hidden parts to worry about. The volume of a combined solid is just the sum of the volumes of its parts. If a part is hollowed out, subtract its volume.',
 detail:'Example: a solid is a cone of radius 1 cm on a hemisphere of radius 1 cm, and the cone\'s height equals its radius. V = ⅓πr²h + ⅔πr³ = ⅓π + ⅔π = π cm³. Model: a cylinder of diameter 3 cm with a cone at each end, total length 12 cm, each cone 2 cm high. V = πr² × 8 + 2 × ⅓πr² × 2 = 56.57 + 9.43 = 66 cm³. Iron pole: a cylinder (height 220 cm, base diameter 24 cm) with a cylinder of height 60 cm and radius 8 cm on top. V = π(12² × 220 + 8² × 60) = 3.14 × 35520 = 111532.8 cm³. At 8 g/cm³, mass = 892262.4 g ≈ 892.26 kg.',
 real:'Grain stored in a silo (cylinder with a conical top) is worked out by adding the two volumes.',
 apply:'A pen stand is a cuboid 15 cm × 10 cm × 3.5 cm with four conical holes of radius 0.5 cm and depth 1.4 cm. Find the volume of wood.',
 see:{w:520,h:260,f:[
  ['A tent: a cylinder with a cone on top.',cylV(200,230,90,90,LG,false)+coneUp(200,140,90,100,LB)],
  ['Volume of air = cylinder + cone.',lbl(400,120,'πr²h₁')+lbl(400,150,'+ ⅓πr²h₂')],
  ['V = πr²h₁ + ⅓πr²h₂. For hollows, subtract.',lbl(400,200,'add parts','font-weight="700"')+lbl(400,225,'subtract holes','font-weight="700"')]]},
 seeNote:'No hidden faces to worry about for volume.',
 do:{title:'Water in a combined vessel',mat:'A bottle with a conical top, a measuring jug',steps:['Measure the bottle\'s radius and the heights of its cylindrical and conical parts.','Calculate πr²h₁ + ⅓πr²h₂.','Fill it from the jug and compare.'],obs:'The two results are close.',why:'Volumes simply add.',lab:false},
 memo:'"Volumes add; holes subtract."',
 miscon:['"Subtract the joined part\'s volume." Nothing is hidden for volume.','"Use slant height in volume." Use vertical height.'],
 terms:['Volume of combination','Density (mass = volume × density)','Capacity'],
 q:{q:'Volume of a cone (r = 1 cm, h = 1 cm) on a hemisphere (r = 1 cm):',o:['π/3 cm³','2π/3 cm³','π cm³','4π/3 cm³'],a:2,why:'π/3 + 2π/3.'},
 exam:'Exercise 12.2 (models, poles, pen stands, vessels) gives 3–4 mark questions.'},

{id:'k6',num:'12.3',title:'Word problems: cost, mass and capacity',
 intro:'A tent maker charges by the square metre; an iron pole is sold by the kilogram. Which formula do you need?',
 obj:'Decide whether a problem needs surface area or volume, and convert to cost, mass or capacity.',
 prior:'Surface area and volume of combinations.',
 simple:'Ask: is the problem about covering (paint, canvas, cloth, polishing) or filling (water, air, metal, mass)? Covering → surface area. Filling → volume. Then multiply by the rate: cost per m², or density in g/cm³, or convert to litres.',
 detail:'Tent: a cylinder 2.1 m high, diameter 4 m, with a conical top of slant height 2.8 m. Canvas (no floor) = 2πrh + πrl = 2 × 22/7 × 2 × 2.1 + 22/7 × 2 × 2.8 = 26.4 + 17.6 = 44 m². At ₹500 per m², cost = ₹22,000. Mass: volume × density, e.g. 111532.8 cm³ × 8 g/cm³ = 892.26 kg. Capacity: 1 L = 1000 cm³; 1 m³ = 1000 L. Rounding: keep exact fractions until the last step.',
 real:'A shopkeeper quoting for painting domes, or a farmer finding how many litres a tank holds, uses exactly these steps.',
 apply:'A vessel is a hemisphere of radius 7 cm with a hollow cylinder on it; total height 13 cm. Find its inner surface area.',
 see:{w:520,h:220,f:[
  ['Covering words: paint, canvas, cloth, polish, cost per m² → surface area.',lbl(130,60,'cover → area','font-weight="700"')+lbl(130,90,'cm², m²')],
  ['Filling words: water, air, melt, recast, mass, litres → volume.',lbl(390,60,'fill → volume','font-weight="700"')+lbl(390,90,'cm³, m³, L')],
  ['Then convert: × rate, × density, ÷ 1000 for litres.',lbl(260,170,'area × ₹/m²  ·  volume × g/cm³  ·  cm³ ÷ 1000 = L','font-size="13"')]]},
 seeNote:'Read the verb first.',
 do:{title:'Sort the problems',mat:'The exercise questions',steps:['For each question, underline the action word (paint, fill, melt…).','Write A for area or V for volume.','Then solve.'],obs:'Most errors disappear once A/V is decided.',why:'The verb tells you the quantity.',lab:false},
 memo:'"Cover = area; fill = volume."',
 miscon:['"A tent needs TSA of cone + cylinder." No floor, and no joined circle.','"1 m³ = 100 L." It is 1000 L.'],
 terms:['Rate per m²','Density','Capacity (litres)'],
 q:{q:'Canvas for a tent (cylinder h = 2.1 m, r = 2 m; cone l = 2.8 m):',o:['44 m²','52 m²','26.4 m²','17.6 m²'],a:0,why:'26.4 + 17.6.'},
 exam:'Cost-of-canvas and mass-of-pole questions are classic 3–4 mark items.'}
];

const CARDS=[['Cylinder','CSA 2πrh · TSA 2πr(r + h) · V πr²h'],['Cone','CSA πrl · TSA πr(l + r) · V ⅓πr²h'],['Sphere','SA 4πr² · V ⁴⁄₃πr³'],['Hemisphere','CSA 2πr² · TSA 3πr² · V ⅔πr³'],['Cuboid','TSA 2(lb + bh + hl) · V lbh'],['Cube','TSA 6a² · V a³'],['Combination SA','Add exposed surfaces only.'],['Toy (cone on hemisphere)','πrl + 2πr²'],['Capsule','2πrh + 4πr²'],['Tent (canvas)','2πrh + πrl'],['Hemisphere on cube','6a² + πr²'],['Scooped ends','2πrh + 4πr² (area up, volume down)'],['Combination volume','Add volumes; subtract hollows.'],['Units','1 L = 1000 cm³; 1 m³ = 1000 L; mass = V × density.']];

const Q=[
 {lv:1,q:'When two solids are joined, the surface area of the combination is:',o:['sum of their TSAs','sum of exposed surfaces','sum of volumes','always less than each part'],a:1,w:'Hidden faces do not count.'},
 {lv:1,q:'The volume of a combined solid is:',o:['sum of the volumes of the parts','sum of their surface areas','product of volumes','always the larger volume'],a:0,w:'Volumes add.'},
 {lv:1,q:'Two cubes each of volume 64 cm³ are joined end to end. The surface area of the cuboid is:',o:['128 cm²','160 cm²','192 cm²','96 cm²'],a:1,w:'Cuboid 8 × 4 × 4: 2(32 + 16 + 32) = 160.'},
 {lv:2,q:'SA of a toy made of a cone (r = 3.5 cm, l = 12.5 cm) on a hemisphere (r = 3.5 cm):',o:['137.5 cm²','214.5 cm²','252 cm²','176 cm²'],a:1,w:'137.5 + 77.'},
 {lv:2,q:'SA of a capsule: cylinder 9 mm long, radius 2.5 mm, hemispherical ends:',o:['220 mm²','180 mm²','259 mm²','141 mm²'],a:0,w:'141.43 + 78.57 = 220.'},
 {lv:2,q:'A hemisphere of radius r is placed on a cube of edge a. The SA becomes:',o:['6a² + 2πr²','6a² + πr²','6a² + 3πr²','6a² − πr²'],a:1,w:'−πr² + 2πr².'},
 {lv:3,q:'A cylinder (r = 3.5 cm, h = 10 cm) has a hemisphere scooped from each end. Its SA is:',o:['297 cm²','374 cm²','220 cm²','451 cm²'],a:1,w:'220 + 154.'},
 {lv:3,q:'Volume of a model: cylinder of diameter 3 cm, length 8 cm, with a cone of height 2 cm on each end:',o:['56.57 cm³','66 cm³','70.71 cm³','75.43 cm³'],a:1,w:'56.57 + 9.43.'},
 {lv:3,q:'Canvas for a tent: cylinder h = 2.1 m, diameter 4 m, cone slant height 2.8 m. At ₹500/m², the cost is:',o:['₹22,000','₹13,200','₹8,800','₹25,000'],a:0,w:'44 m² × 500.'},
 {lv:4,q:'Assertion (A): Scooping a hemisphere from a cylinder\'s end increases its surface area. Reason (R): 2πr² > πr².',o:['Both true and R explains A','Both true, R does not explain A','A true, R false','A false, R true'],a:0,w:'A circle πr² is replaced by a bowl 2πr².'},
 {lv:4,q:'A cone and a hemisphere have equal radius r and are joined. If the cone\'s height is 2r, the total volume is:',o:['πr³','⁴⁄₃πr³','2πr³','⅔πr³'],a:1,w:'⅔πr³ + ⅔πr³.'},
 {lv:4,q:'A solid iron pole: cylinder (r = 12 cm, h = 220 cm) with a cylinder (r = 8 cm, h = 60 cm) on top. Density 8 g/cm³, π = 3.14. Mass:',o:['892.26 kg','111.53 kg','796.15 kg','964.32 kg'],a:0,w:'3.14 × 35520 × 8 g.'},
 {lv:5,open:true,m:3,q:'A toy is a cone of radius 3.5 cm on a hemisphere of the same radius. The total height is 15.5 cm. Find its total surface area.',ans:['Cone height = 15.5 − 3.5 = 12 cm; l = √(3.5² + 12²) = 12.5 cm (1).','CSA cone = 22/7 × 3.5 × 12.5 = 137.5 cm²; CSA hemisphere = 2 × 22/7 × 3.5² = 77 cm² (1).','Total = 214.5 cm² (1).']},
 {lv:5,open:true,m:3,q:'A wooden article is made by scooping a hemisphere out of each end of a solid cylinder of height 10 cm and base radius 3.5 cm. Find its total surface area.',ans:['Curved surface of cylinder = 2πrh = 220 cm² (1).','Two hemispherical bowls = 2 × 2πr² = 154 cm² (1).','Total = 374 cm² (1).']},
 {lv:5,open:true,m:4,q:'A tent is a cylinder of height 2.1 m and diameter 4 m, with a cone of the same diameter and slant height 2.8 m on top. Find the area of canvas and its cost at ₹500 per m² (the floor is not covered).',ans:['Exposed: cylinder curved surface and cone curved surface only (1).','2πrh = 2 × 22/7 × 2 × 2.1 = 26.4 m² (1).','πrl = 22/7 × 2 × 2.8 = 17.6 m²; total 44 m² (1).','Cost = 44 × 500 = ₹22,000 (1).']}
];

const ONEMIN=['Know all six solids\' CSA, TSA and V.','Combination SA: only exposed surfaces; joined faces vanish.','Toy: πrl + 2πr². Capsule: 2πrh + 4πr².','Hemisphere on cube: 6a² + πr².','Hollow: lose a flat face, gain a curved one.','Volume of combination: add parts, subtract holes.','Tent canvas: 2πrh + πrl (no floor).','Cover → area; fill/melt/mass → volume.','1 L = 1000 cm³; 1 m³ = 1000 L.','Keep fractions till the end; π = 22/7 unless told.'];
const KEYS=[['exposed / visible surfaces',/expos|visible|outer|hidden|joined/i],['πrl',/πrl/i],['2πr²',/2πr²/],['2πrh',/2πrh/],['6a² + πr²',/6a²/],['hollow / scooped',/hollow|scoop|cavit|depress/i],['volumes add',/add|sum/i],['subtract holes',/subtract|minus|remov/i],['units',/cm²|cm³|litre|m³/i],['cost / density',/cost|rate|density|mass/i]];

/* ---------- lab ---------- */
const DEF={toy:{r:3.5,h:12},cap:{r:2.5,h:9},tent:{r:2,h:2.1,h2:1.96},cube:{a:7,r:3.5},scoop:{r:3.5,h:10}};
let obj='toy',v=JSON.parse(JSON.stringify(DEF));
const SL={r:['Radius r',0.5,10,0.5],h:['Height h',1,20,0.5],h2:['Cone height h₂',0.5,10,0.01],a:['Cube edge a',2,14,0.5]};
function ctl(){const o=v[obj];return Object.keys(o).map(k=>{let [n,mi,ma,st]=SL[k];if(obj==='tent'&&k==='h')n='Cylinder height h₁';if(obj==='cap'&&k==='h')n='Cylinder length h';if(obj==='toy'&&k==='h')n='Cone height h';return `<div class="ctrl"><label>${n}: <b id="kv-${k}">${o[k]}</b><input type="range" data-k="${k}" class="kSl" min="${mi}" max="${ma}" step="${st}" value="${o[k]}"></label></div>`}).join('')}
function calc(){const o=v[obj];let g='',rows=[],tot=0,vol=0,vs='';
 if(obj==='toy'){const {r,h}=o,l=Math.hypot(r,h);const s=Math.min(110/r,230/(h+r)),R=r*s,H=h*s,cy=60+H;g=coneUp(220,cy,R,H)+hemiDown(220,cy,R,LG,false)+`<path d="M${220-R} ${cy} A${R} ${R*.28} 0 0 1 ${220+R} ${cy}" fill="none" stroke="${OR}" stroke-width="2" stroke-dasharray="4 3"/>`;
  rows=[['Cone curved πrl',P*r*l,`22/7 × ${r} × ${fx(l)}`],['Hemisphere curved 2πr²',2*P*r*r,`2 × 22/7 × ${r}²`],['Joined circle','hidden','not counted']];vol=P*r*r*h/3+2/3*P*r**3;vs=`⅓πr²h + ⅔πr³`}
 if(obj==='cap'){const {r,h}=o;const s=Math.min(90/r,250/(h+2*r)),R=r*s,H=h*s,by=40+R+H;g=hemiUp(220,by-H,R)+cylV(220,by,R,H,LB,false)+hemiDown(220,by,R,LG,false);
  rows=[['Cylinder curved 2πrh',2*P*r*h,`2 × 22/7 × ${r} × ${h}`],['Two hemispheres 2 × 2πr²',4*P*r*r,`4 × 22/7 × ${r}²`],['Two end circles','hidden','not counted']];vol=P*r*r*h+4/3*P*r**3;vs='πr²h + ⁴⁄₃πr³'}
 if(obj==='tent'){const {r,h,h2}=o,l=Math.hypot(r,h2);const s=Math.min(130/r,260/(h+h2)),R=r*s,by=310;g=cylV(220,by,R,h*s,LG,false)+coneUp(220,by-h*s,R,h2*s,LB);
  rows=[['Cylinder curved 2πrh₁',2*P*r*h,`2 × 22/7 × ${r} × ${h}`],['Cone curved πrl',P*r*l,`22/7 × ${r} × ${fx(l)} (l = √(r² + h₂²))`],['Floor and joined circle','not counted','no canvas']];vol=P*r*r*h+P*r*r*h2/3;vs='πr²h₁ + ⅓πr²h₂'}
 if(obj==='cube'){const {a}=o;let r=Math.min(o.r,a/2);o.r=r;const s=170/a,A=a*s,x=110,y=310-A;g=cube(x,y,A)+hemiUp(x+A/2+A*.175,y-A*.175,r*s);
  rows=[['Cube 6a²',6*a*a,`6 × ${a}²`],['Covered circle −πr²',-P*r*r,`−22/7 × ${r}²`],['Dome 2πr²',2*P*r*r,`2 × 22/7 × ${r}²`]];vol=a**3+2/3*P*r**3;vs='a³ + ⅔πr³';if(o.r!==DEF.cube.r&&o.r===a/2)rows.push(['Note','—','r is limited to a/2'])}
 if(obj==='scoop'){let {r,h}=o;if(h<2*r){h=2*r;o.h=h}const s=Math.min(100/r,260/h),R=r*s,H=h*s,by=40+H;g=cylV(220,by,R,H,LB,true)+`<path d="M${220-R} ${by-H} A${R} ${R} 0 0 0 ${220+R} ${by-H}" fill="none" stroke="${OR}" stroke-width="2" stroke-dasharray="5 3"/><path d="M${220-R} ${by} A${R} ${R} 0 0 1 ${220+R} ${by}" fill="none" stroke="${OR}" stroke-width="2" stroke-dasharray="5 3"/>`;
  rows=[['Cylinder curved 2πrh',2*P*r*h,`2 × 22/7 × ${r} × ${h}`],['Two bowls 2 × 2πr²',4*P*r*r,`4 × 22/7 × ${r}²`],['End circles','removed','scooped away']];vol=P*r*r*h-4/3*P*r**3;vs='πr²h − ⁴⁄₃πr³'}
 rows.forEach(x=>{if(typeof x[1]==='number')tot+=x[1]});
 $('#kSvg').innerHTML=g;
 $('#kOut').innerHTML=`<table style="font-size:13px"><tr><th>Surface</th><th>Working</th><th>Area</th></tr>${rows.map(x=>`<tr><td>${x[0]}</td><td>${x[2]}</td><td>${typeof x[1]==='number'?fx(x[1])+' sq units':x[1]}</td></tr>`).join('')}</table><p>Total surface area = <b>${fx(tot)}</b> square units</p><p>Volume = ${vs} = <b>${fx(vol)}</b> cubic units</p>`;
 Object.keys(v[obj]).forEach(k=>{const e=$('#kv-'+k);if(e)e.textContent=v[obj][k]})}
function labShow(){$('#kCtl').innerHTML=ctl();calc()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('kSl'))labChange(t)})}
function labClick(){return false}
function labChange(t){if(t.id==='kObj'){obj=t.value;labShow();return true}if(t.classList&&t.classList.contains('kSl')){v[obj][t.dataset.k]=+t.value;calc();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
