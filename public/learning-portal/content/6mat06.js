/* Rai Plus content pack: Class 6 Mathematics (Ganita Prakash), Chapter 6 – Perimeter and Area. */
RP.register({key:'6mat06',cls:'6',subject:'Mathematics',ch:'6',title:"Perimeter and Area",color:'#3b6d11',
crumb:"Class 6 Mathematics · Ganita Prakash",h1:"Chapter 6: Perimeter and Area",sub:"Perimeter of rectangles, squares, triangles and regular polygons; area by counting squares and by formula; same area, different perimeter.",heroLabel:"A rectangle on a square grid with its border highlighted",labName:'Rectangle lab',
theme:"\n:root{--g:light-dark(#3b6d11,#a8d77d);--g2:light-dark(#eef6e4,#0f1a07);--line:light-dark(#d4e7bf,#2c4219);--bg:light-dark(#ffffff,#0b1206);--card:light-dark(#ffffff,#111a0a);\n--ink:light-dark(#162508,#e6f1da);--mute:light-dark(#4f6439,#b5c9a0);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#2b520b}\n",
labHTML:`  <h2>Rectangle lab</h2>
  <p>Change the length and breadth. Watch the perimeter (border) and the area (squares inside). Try the challenge.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="rSvg" viewBox="0 0 460 300" role="img" aria-label="Rectangle on grid" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Length (cm): <b id="rLv"></b><input type="range" id="rL" class="rS" min="1" max="16" value="6"></label></div><div class="ctrl"><label>Breadth (cm): <b id="rBv"></b><input type="range" id="rB" class="rS" min="1" max="10" value="4"></label></div><div class="ctrl"><label>Challenge<select id="rCh"><option value="none">Free play</option><option value="a24">Area 24 cm²: smallest perimeter?</option><option value="p20">Perimeter 20 cm: largest area?</option></select></label></div><div class="box y" id="rOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3b6d11',LABNAME='Rectangle lab',MIND_CENTER='Perimeter & area';
const GN='#3b6d11',LG='#a8d77d',OR='#b04a1f',BL='#1f5f8b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
function gridRect(x0,y0,l,b,u,fill=LG,edge=OR){let s='';for(let i=0;i<l;i++)for(let j=0;j<b;j++)s+=`<rect x="${x0+i*u}" y="${y0+j*u}" width="${u}" height="${u}" fill="${fill}" opacity=".5" stroke="${GR}" stroke-width=".5"/>`;return s+`<rect x="${x0}" y="${y0}" width="${l*u}" height="${b*u}" fill="none" stroke="${edge}" stroke-width="3"/>`}
function heroDraw(){let s='';for(let i=0;i<6;i++)for(let j=0;j<3;j++)s+=`<rect x="${40+i*20}" y="${40+j*20}" width="20" height="20" fill="#fff" opacity=".35" stroke="#fff" stroke-width=".5"/>`;return s+`<rect x="40" y="40" width="120" height="60" fill="none" stroke="#fff" stroke-width="3"/>`}
const HERO=heroDraw;
const MIND=[['Perimeter',100,50],['Rectangle & square',420,50],['Triangles & polygons',90,150],['Area by squares',430,150],['Area formulas',110,250],['Same area, different perimeter',410,250]];

const C=[
{id:'a1',num:'6.1',title:'Perimeter',
 intro:'Akshi runs around a park. How far does she go in one round?',
 obj:'Understand perimeter as the length of the boundary.',
 prior:'Measuring length (Science Ch 5).',
 simple:'The perimeter of a closed figure is the total length of its boundary — the distance once around it. To find it, add the lengths of all sides. Perimeter is measured in units of length: cm, m, km.',
 detail:'Running 3 rounds of a park means 3 × perimeter. Fencing a field or putting lace around a tablecloth needs the perimeter. For irregular shapes, use a thread along the boundary, then measure the thread.',
 real:'A farmer in Rewari fencing a field needs wire equal to its perimeter.',
 apply:'A park is 150 m long and 80 m wide. How far is 2 rounds?',
 see:{w:520,h:200,f:[
  ['A park shaped like a rectangle.',`<rect x="140" y="40" width="240" height="120" fill="${LG}" opacity=".35"/>`],
  ['Walk all around the boundary.',`<rect x="140" y="40" width="240" height="120" fill="none" stroke="${OR}" stroke-width="4" stroke-dasharray="10 6"/>`],
  ['Perimeter = sum of all sides.',lbl(260,30,'150 m')+lbl(400,105,'80 m','text-anchor="start"')+lbl(260,190,'150 + 80 + 150 + 80 = 460 m','font-weight="700"')]]},
 seeNote:'Perimeter is a length.',
 do:{title:'Thread around',mat:'Thread, ruler, a leaf',steps:['Lay a thread along the edge of the leaf.','Straighten and measure the thread.'],obs:'Perimeter of the leaf.',why:'Boundary length.',lab:true},
 memo:'"Peri = around, meter = measure."',
 miscon:['"Perimeter is measured in square units." It is a length.'],
 terms:['Perimeter','Boundary','Side'],
 q:{q:'Perimeter means:',o:['space inside','length of the boundary','number of corners','weight'],a:1,why:'Definition.'},
 exam:'Find perimeter of a figure: 2 marks.'},

{id:'a2',num:'6.2',title:'Perimeter of rectangle, square, triangle and regular polygons',
 intro:'Is there a quick way to find the perimeter of a rectangle?',
 obj:'Use formulas for perimeter.',
 prior:'Perimeter (6.1).',
 simple:'Rectangle: perimeter = length + breadth + length + breadth = 2 × (length + breadth). Square (all sides equal): 4 × side. Triangle: sum of three sides; equilateral triangle: 3 × side. Regular polygon (all sides equal): number of sides × side length.',
 detail:'If you know the perimeter, you can find a missing side: a square of perimeter 36 cm has side 9 cm. A rectangle of perimeter 30 cm and length 10 cm has breadth (30 ÷ 2) − 10 = 5 cm. A regular hexagon of side 4 cm has perimeter 24 cm.',
 real:'Lace for a square handkerchief of side 25 cm: 100 cm.',
 apply:'A rectangle has perimeter 50 cm and breadth 10 cm. Find its length.',
 see:{w:520,h:220,f:[
  ['Rectangle: 2 × (l + b).',`<rect x="30" y="50" width="150" height="90" fill="none" stroke="${OR}" stroke-width="3"/>`+lbl(105,40,'l')+lbl(195,100,'b')+lbl(105,170,'2 × (l + b)','font-weight="700"')],
  ['Square: 4 × side.',`<rect x="230" y="50" width="90" height="90" fill="none" stroke="${BL}" stroke-width="3"/>`+lbl(275,40,'a')+lbl(275,170,'4 × a','font-weight="700"')],
  ['Regular hexagon: 6 × side.',`<polygon points="${[...Array(6)].map((_,k)=>{const a=k*Math.PI/3;return (430+48*Math.cos(a)).toFixed(1)+','+(95+48*Math.sin(a)).toFixed(1)}).join(' ')}" fill="none" stroke="${GN}" stroke-width="3"/>`+lbl(430,170,'6 × side','font-weight="700"')]]},
 seeNote:'Equal sides → multiply.',
 do:{title:'Desk perimeter',mat:'Measuring tape',steps:['Measure length and breadth of your desk.','Use 2 × (l + b).','Check by measuring all sides.'],obs:'Same answer.',why:'Formula.',lab:true},
 memo:'"Rectangle 2(l+b), square 4a, polygon n × side."',
 miscon:['"Perimeter of rectangle = l + b." It is 2(l + b).'],
 terms:['Length','Breadth','Equilateral','Regular polygon'],
 q:{q:'Perimeter of a square of side 7 cm:',o:['14 cm','21 cm','28 cm','49 cm'],a:2,why:'4 × 7.'},
 exam:'Perimeter formulas and missing side: 3 marks.'},

{id:'a3',num:'6.3',title:'Area by counting squares',
 intro:'Which leaf is bigger — not around, but in the space it covers?',
 obj:'Find area by counting unit squares.',
 prior:'Perimeter.',
 simple:'Area is the amount of surface a closed figure covers. Measure it by counting unit squares: a square of side 1 cm has area 1 square centimetre (1 cm², sq cm). Place the figure on squared paper and count full squares.',
 detail:'For irregular shapes: count full squares as 1, half (or more than half) as 1, less than half as 0 — or pair up two half squares as 1. Bigger units: square metre (m²) for rooms, square kilometre (km²) for cities.',
 real:'Floor tiles: count tiles to find the area of the floor.',
 apply:'A shape covers 12 full and 6 half squares (1 cm). Area?',
 see:{w:520,h:220,f:[
  ['A shape on squared paper.',(()=>{let s='';for(let i=0;i<10;i++)for(let j=0;j<6;j++)s+=`<rect x="${120+i*28}" y="${20+j*28}" width="28" height="28" fill="none" stroke="${GR}" stroke-width=".5"/>`;return s})()],
  ['Count the full squares inside.',(()=>{let s='';[[1,1],[2,1],[3,1],[1,2],[2,2],[3,2],[4,2],[2,3],[3,3],[4,3],[5,3]].forEach(([i,j])=>s+=`<rect x="${120+i*28}" y="${20+j*28}" width="28" height="28" fill="${LG}" opacity=".7"/>`);return s})()],
  ['11 squares → area 11 cm².',lbl(260,205,'area = number of unit squares = 11 cm²','font-weight="700"')]]},
 seeNote:'Area is measured in square units.',
 do:{title:'Palm area',mat:'Squared paper (1 cm)',steps:['Trace your palm.','Count full and more-than-half squares.'],obs:'Area in cm².',why:'Counting squares.',lab:true},
 memo:'"Area: how many squares cover it."',
 miscon:['"Area is in cm." It is in cm² (square units).'],
 terms:['Area','Unit square','Square centimetre (cm²)','Square metre (m²)'],
 q:{q:'Area is measured in:',o:['cm','cm²','kg','litres'],a:1,why:'Square units.'},
 exam:'Area by counting squares: 2 marks.'},

{id:'a4',num:'6.4',title:'Area of rectangle, square and triangle',
 intro:'A rectangle is 5 squares long and 3 squares wide. Do you need to count all of them?',
 obj:'Use formulas for area of rectangle and square; area of a triangle as half a rectangle.',
 prior:'Counting squares (6.3).',
 simple:'Rectangle: area = length × breadth (rows × columns of squares). Square: side × side. A diagonal cuts a rectangle into two equal right triangles, so each right triangle has area = ½ × length × breadth.',
 detail:'Any triangle drawn inside a rectangle with the same base and height covers half the rectangle; so its area is half the area of the rectangle. Units: if sides are in m, area is in m². Area of a floor 5 m × 4 m = 20 m².',
 real:'A room 4 m × 3 m needs 12 square metres of floor tiles.',
 apply:'A right triangle has legs 6 cm and 8 cm. Area?',
 see:{w:520,h:220,f:[
  ['5 × 3 rectangle: 15 squares.',gridRect(40,40,5,3,30)+lbl(115,160,'5 × 3 = 15 cm²','font-weight="700"')],
  ['Cut along the diagonal…',gridRect(290,40,5,3,30,LG,GR)+`<line x1="290" y1="130" x2="440" y2="40" stroke="${OR}" stroke-width="3"/>`],
  ['…each triangle = half = 7.5 cm².',`<polygon points="290,130 440,130 440,40" fill="${OR}" opacity=".35"/>`+lbl(365,160,'½ × 5 × 3 = 7.5 cm²','font-weight="700"')]]},
 seeNote:'Triangle = half the rectangle.',
 do:{title:'Cut and compare',mat:'Paper rectangle, scissors',steps:['Cut along a diagonal.','Place one triangle on the other.'],obs:'They match.',why:'Each is half.',lab:true},
 memo:'"Rectangle l × b; square a × a; triangle half."',
 miscon:['"Area of a square = 4 × side." That is perimeter; area = side × side.'],
 terms:['Area of rectangle','Area of square','Diagonal'],
 q:{q:'Area of a rectangle 8 cm × 5 cm:',o:['13 cm²','26 cm²','40 cm²','80 cm²'],a:2,why:'8 × 5.'},
 exam:'Area formulas: 3 marks.'},

{id:'a5',num:'6.5',title:'Same area, different perimeters',
 intro:'Can two gardens with the same area need different lengths of fence?',
 obj:'See that figures with equal area can have different perimeters, and vice versa.',
 prior:'6.2, 6.4.',
 simple:'Rectangles with area 24 cm²: 1 × 24 (perimeter 50), 2 × 12 (28), 3 × 8 (22), 4 × 6 (20). Same area, different perimeters! The squarest rectangle has the smallest perimeter. Also, rectangles with the same perimeter can have different areas: for perimeter 20 cm, 1 × 9 = 9 cm², 5 × 5 = 25 cm² (largest).',
 detail:'This helps in real decisions: to fence the biggest garden with a fixed length of wire, make it as close to a square as possible. Tangram pieces rearranged into different shapes keep the same area but change perimeter.',
 real:'A farmer with 40 m of fence gets the biggest field as a 10 m × 10 m square.',
 apply:'Find all rectangles (whole cm) with area 36 cm². Which has the least perimeter?',
 see:{w:520,h:230,f:[
  ['2 × 12: perimeter 28.',gridRect(20,30,12,2,16)+lbl(116,90,'2 × 12 → P = 28')],
  ['3 × 8: perimeter 22.',gridRect(20,110,8,3,16)+lbl(84,180,'3 × 8 → P = 22')],
  ['4 × 6: perimeter 20 — all have area 24.',gridRect(300,30,6,4,16)+lbl(348,110,'4 × 6 → P = 20')+lbl(380,200,'same area 24 cm²','font-weight="700"')]]},
 seeNote:'Area and perimeter are different things.',
 do:{title:'24 squares',mat:'24 square tiles or paper squares',steps:['Make every rectangle using all 24.','Find each perimeter.'],obs:'4 × 6 is smallest.',why:'Closer to a square.',lab:true},
 memo:'"Squarer is thriftier."',
 miscon:['"Bigger perimeter means bigger area." Not always.'],
 terms:['Same area','Different perimeter','Tangram'],
 q:{q:'Rectangles of area 16 cm²; least perimeter:',o:['1 × 16','2 × 8','4 × 4','all equal'],a:2,why:'Square.'},
 exam:'Same area/different perimeter: 3 marks.'}
];

const CARDS=[['Perimeter','Boundary length (cm, m).'],['Rectangle P','2 × (l + b).'],['Square P','4 × side.'],['Regular polygon P','n × side.'],['Area','Surface covered (cm², m²).'],['Rectangle A','l × b.'],['Square A','side × side.'],['Right triangle A','½ × l × b.'],['Irregular area','Count full + half squares.'],['Same area','Different perimeters possible; squarest is least.']];

const Q=[
 {lv:1,q:'Perimeter of a rectangle 6 cm × 4 cm:',o:['10 cm','20 cm','24 cm','24 cm²'],a:1,w:'2(6+4).'},
 {lv:1,q:'Area of a square of side 5 cm:',o:['20 cm²','25 cm²','10 cm²','25 cm'],a:1,w:'5×5.'},
 {lv:1,q:'Unit of area:',o:['cm','cm²','kg','m/s'],a:1,w:'Square units.'},
 {lv:2,q:'Perimeter of an equilateral triangle of side 9 cm:',o:['18 cm','27 cm','81 cm','12 cm'],a:1,w:'3×9.'},
 {lv:2,q:'Square with perimeter 48 cm has side:',o:['12 cm','24 cm','6 cm','16 cm'],a:0,w:'48÷4.'},
 {lv:2,q:'Area of a room 5 m × 4 m:',o:['9 m²','18 m²','20 m²','40 m²'],a:2,w:'5×4.'},
 {lv:3,q:'Area of a right triangle with legs 6 cm and 4 cm:',o:['24 cm²','12 cm²','10 cm²','20 cm²'],a:1,w:'½×6×4.'},
 {lv:3,q:'Rectangle perimeter 30 cm, length 9 cm; breadth:',o:['6 cm','12 cm','21 cm','3 cm'],a:0,w:'15−9.'},
 {lv:4,q:'Which has area 36 cm² and the least perimeter?',o:['1×36','3×12','4×9','6×6'],a:3,w:'Square.'},
 {lv:4,q:'Tiles of 1 m² for a 6 m × 4 m floor:',o:['10','20','24','48'],a:2,w:'6×4.'},
 {lv:5,open:true,m:3,q:'List all whole-number rectangles with area 12 cm² and their perimeters.',ans:['1×12: 26 cm (1)','2×6: 16 cm (1)','3×4: 14 cm — least (1)']},
 {lv:5,open:true,m:3,q:'A park 120 m × 80 m. Find the cost of fencing at ₹50 per metre.',ans:['Perimeter = 2(120+80) (1)','= 400 m (1)','Cost = 400 × 50 = ₹20,000 (1)']}
];

const ONEMIN=['Perimeter = boundary length.','Rectangle 2(l+b), square 4a, polygon n×side.','Area = squares covered (cm²).','Rectangle l×b, square a×a.','Triangle = half of rectangle.','Same area ≠ same perimeter.'];
const KEYS=[['perimeter',/perimeter|boundary/i],['2(l+b)',/2 ?\(|2\(l|l ?\+ ?b/i],['area',/area/i],['l×b',/l ?× ?b|length × breadth/i],['square units',/cm²|square/i],['triangle half',/half|triangle/i]];

/* ---------- lab ---------- */
let L=6,B=4,ch='none';
function draw(){const u=Math.min(24,Math.floor(Math.min(420/L,230/B)));const x0=230-L*u/2,y0=20+(230-B*u)/2;let s=gridRect(x0,y0,L,B,u);
 s+=T(230,y0-6,L+' cm','font-size="13"')+T(x0+L*u+8,y0+B*u/2+4,B+' cm','font-size="13" text-anchor="start"');
 const P=2*(L+B),A=L*B;s+=T(230,288,`Perimeter = 2 × (${L} + ${B}) = ${P} cm · Area = ${L} × ${B} = ${A} cm²`,'font-size="13" font-weight="700"');
 $('#rSvg').innerHTML=s;$('#rLv').textContent=L;$('#rBv').textContent=B;
 let h='';if(ch==='a24'){h=A!==24?`<p>Area is ${A} cm². Make it exactly 24 cm².</p>`:P===20?'<p class="fb ok">Area 24 and perimeter 20 cm — the smallest possible (4 × 6)!</p>':`<p class="fb no">Area 24 ✓ but perimeter ${P} cm. Can you make it smaller?</p>`}
 else if(ch==='p20'){h=P!==20?`<p>Perimeter is ${P} cm. Make it exactly 20 cm.</p>`:A===25?'<p class="fb ok">Perimeter 20 and area 25 cm² — the largest (a 5 × 5 square)!</p>':`<p class="fb no">Perimeter 20 ✓ but area ${A} cm². Can you make it bigger?</p>`}
 else h=`<p>${L===B?'This is a square.':'Rectangle.'} Border = perimeter (orange). Shaded squares = area.</p>`;
 $('#rOut').innerHTML=h}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&(e.target.id==='rL'||e.target.id==='rB'))labChange(e.target)})}
function labClick(){return false}
function labChange(t){if(t.id==='rL'){L=+t.value;draw();return true}if(t.id==='rB'){B=+t.value;draw();return true}if(t.id==='rCh'){ch=t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
