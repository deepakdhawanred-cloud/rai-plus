/* Rai Plus content pack: Class 9 Mathematics, Chapter 10 – Heron's Formula (rationalised NCERT). */
RP.register({key:'9mat10',cls:'9',subject:'Mathematics',ch:'10',title:"Heron's Formula",color:'#0f6e6e',
crumb:"HBSE Class 9 Mathematics · Unit: Mensuration · Taught in January",h1:"Chapter 10: Heron's Formula",sub:"Finding the area of any triangle from its three sides, and using it for quadrilaterals, fields and real-life problems.",heroLabel:"A triangular plot with three measured sides",labName:"Heron's calculator",
theme:"\n:root{--g:light-dark(#0f6e6e,#86d6d6);--g2:light-dark(#e7f4f4,#061616);--line:light-dark(#c6e3e3,#1e3d3d);--bg:light-dark(#ffffff,#071111);--card:light-dark(#ffffff,#0c1818);\n--ink:light-dark(#0b2626,#dff1f1);--mute:light-dark(#466262,#a6c4c4);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#0b5252}\n",
labHTML:`  <h2>Heron's calculator</h2>
  <p>Set the three sides. The calculator draws the triangle, works through Heron's formula step by step, and checks the answer against ½ × base × height measured from the drawing.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="hfSvg" viewBox="0 0 520 330" role="img" aria-label="Heron's formula" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label><span>a (BC): <b id="hfAv"></b> m</span><input type="range" class="hfS" id="hfA" min="1" max="20" value="13"></label></div>
  <div class="ctrl"><label><span>b (CA): <b id="hfBv"></b> m</span><input type="range" class="hfS" id="hfB" min="1" max="20" value="14"></label></div>
  <div class="ctrl"><label><span>c (AB): <b id="hfCv"></b> m</span><input type="range" class="hfS" id="hfC" min="1" max="20" value="15"></label></div>
  <div class="box y" id="hfOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#0f6e6e',LABNAME="Heron's calculator",MIND_CENTER="Heron's formula";
const TL='#0f6e6e',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',RD='#c0392b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const tri=(pts,c,op='.15')=>`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="${c}" fill-opacity="${op}" stroke="${c}" stroke-width="2.5"/>`;
function heroDraw(){return `<polygon points="40,130 300,130 120,25" fill="#fff" fill-opacity=".15" stroke="#fff" stroke-width="3"/><text x="170" y="148" fill="#fff" font-size="14" text-anchor="middle">a</text><text x="70" y="72" fill="#fff" font-size="14">c</text><text x="220" y="72" fill="#fff" font-size="14">b</text>`}
const HERO=heroDraw;
const MIND=[['Why Heron?',100,50],["Heron's formula",420,50],['Scalene triangles',90,150],['Isosceles & equilateral',430,150],['Quadrilaterals',110,250],['Applications',410,250]];

const C=[
{id:'h1',num:'10.1',title:'Why we need Heron\'s formula',
 intro:'A triangular park has sides 40 m, 32 m and 24 m. Nobody has measured its height. Can we still find its area?',
 obj:'Recall the area formula ½ × base × height and see its limitation.',
 prior:'Class 7–8: area of a triangle.',
 simple:'Area of a triangle = ½ × base × height. For a right triangle, the two legs are the base and height. For an equilateral triangle of side a, the height is (√3/2)a, so area = (√3/4)a². But for a scalene triangle whose height is unknown, measuring the height is hard — we need a formula using only the three sides.',
 detail:'Heron (Hero) of Alexandria (about 10–75 CE) gave such a formula. Indian mathematician Brahmagupta later gave a similar formula for cyclic quadrilaterals. In practice, land surveyors measure sides easily but not heights across a field.',
 real:'Land records describe plots by side lengths, not heights.',
 apply:'Find the area of an equilateral triangle of side 10 cm using (√3/4)a².',
 see:{w:520,h:200,f:[
  ['A triangle with a known height.',tri([[60,170],[220,170],[110,50]],TL)+`<line x1="110" y1="50" x2="110" y2="170" stroke="${OR}" stroke-dasharray="5 4" stroke-width="2"/>`+lbl(122,115,'h','fill="'+OR+'"')+lbl(140,190,'base')],
  ['A field: height unknown.',tri([[300,170],[480,170],[340,40]],BL)+lbl(390,190,'40 m')+lbl(305,100,'24 m')+lbl(430,100,'32 m')+lbl(390,120,'h = ?','fill="'+RD+'"')],
  ['Use only sides!',lbl(260,24,'Heron: area from three sides alone','font-weight="700"')]]},
 seeNote:'No height? Use Heron.',
 do:{title:'Hard to measure',mat:'Large chalk triangle on the ground',steps:['Measure the three sides easily.','Try to measure the height accurately.'],obs:'Height is tricky.',why:'Need for Heron.',lab:false},
 memo:'"Sides are easy; heights are hard."',
 miscon:['"Any side times any other side gives area." Only base × height (perpendicular), halved.'],
 terms:['Base','Height (altitude)','Scalene','Equilateral'],
 q:{q:'Area of an equilateral triangle of side 4 cm:',o:['4√3 cm²','8√3 cm²','16 cm²','2√3 cm²'],a:0,why:'(√3/4) × 16.'},
 exam:'Area basics: 1 mark.'},

{id:'h2',num:'10.2',title:"Heron's formula",
 intro:'How can three lengths alone give an area?',
 obj:"State and use Heron's formula.",
 prior:'10.1; square roots.',
 simple:"For a triangle with sides a, b, c: semi-perimeter s = (a + b + c) ÷ 2. Area = √[s(s − a)(s − b)(s − c)]. Example: sides 40, 32, 24 m. s = 48. Area = √(48 × 8 × 16 × 24) = √147456 = 384 m².",
 detail:'Check: 24² + 32² = 40², so it is a right triangle and ½ × 24 × 32 = 384 m² ✓. Steps: (1) find s; (2) find s − a, s − b, s − c; (3) multiply all four; (4) take the square root. Factorise before multiplying to make square roots easier. Each of s − a, s − b, s − c must be positive — otherwise the sides cannot form a triangle.',
 real:'Farmers sharing a triangular field use Heron\'s formula to divide it fairly.',
 apply:'Find the area of a triangle with sides 8 cm, 11 cm and 13 cm.',
 see:{w:520,h:220,f:[
  ['Semi-perimeter.',lbl(260,40,'s = (a + b + c) ÷ 2','font-size="18" fill="'+BL+'"')],
  ['The formula.',lbl(260,100,'Area = √[s(s − a)(s − b)(s − c)]','font-size="20" font-weight="700" fill="'+TL+'"')],
  ['Example.',lbl(260,160,'40, 32, 24: s = 48 → √(48·8·16·24) = 384 m²','font-size="15" fill="'+OR+'"')]]},
 seeNote:'Half the perimeter, then four factors under a root.',
 do:{title:'Check with ½bh',mat:'Graph paper',steps:['Draw a 3–4–5 triangle.','Compute area both ways.'],obs:'Both give 6.',why:'Formula works.',lab:true},
 memo:'"s, then s minus each side, multiply, square root."',
 miscon:['"s is the full perimeter." It is half the perimeter.'],
 terms:["Heron's formula",'Semi-perimeter (s)'],
 q:{q:'Sides 3, 4, 5. s =',o:['12','6','5','3'],a:1,why:'12 ÷ 2.'},
 exam:"Heron's formula numericals: 2–3 marks."},

{id:'h3',num:'10.3',title:'Scalene triangles in real life',
 intro:'A triangular wall of a building has sides 122 m, 22 m and 120 m. How much does it cost to paint its advertisement board?',
 obj:"Apply Heron's formula to scalene triangles in real situations.",
 prior:'10.2.',
 simple:'Find the area with Heron\'s formula, then multiply by the rate. Sides 122, 22, 120: s = 132. Area = √(132 × 10 × 110 × 12) = √1742400 = 1320 m². At ₹5000 per m² per year for 3 months: 1320 × 5000 × 3/12 = ₹16,50,000.',
 detail:'Sides in a ratio: if a triangle has perimeter 300 m and sides in the ratio 3 : 5 : 7, the sides are 60, 100, 140 m; s = 150; area = √(150 × 90 × 50 × 10) = 1500√3 m² ≈ 2598 m². Keep answers in surd form unless told otherwise.',
 real:'Hoardings beside highways are often triangular to fit at road junctions.',
 apply:'A triangle has perimeter 32 cm, two sides 8 cm and 11 cm. Find its area.',
 see:{w:520,h:200,f:[
  ['A triangular board.',tri([[60,170],[460,170],[430,60]],OR)+lbl(260,190,'122 m')+lbl(460,115,'22 m')+lbl(240,100,'120 m')],
  ['s and factors.',lbl(260,30,'s = 132 · s − a = 10, 110, 12','font-size="14"')],
  ['Area.',lbl(260,140,'√(132 × 10 × 110 × 12) = 1320 m²','font-size="16" font-weight="700" fill="'+TL+'"')]]},
 seeNote:'Area first, cost next.',
 do:{title:'School plot',mat:'Measuring tape',steps:['Choose a triangular patch.','Measure sides; compute area.'],obs:'Real area.',why:'Application.',lab:false},
 memo:'"Area × rate = cost."',
 miscon:['"Multiply the sides for the area." Use Heron\'s formula.'],
 terms:['Ratio of sides','Rate','Cost'],
 q:{q:'Sides 5, 12, 13. Area:',o:['30','60','65','78'],a:0,why:'s = 15 → √(15·10·3·2) = 30.'},
 exam:'Real-life Heron problems: 3 marks.'},

{id:'h4',num:'10.4',title:'Isosceles and equilateral triangles',
 intro:'Can Heron\'s formula give the familiar (√3/4)a² for equilateral triangles?',
 obj:"Use Heron's formula for isosceles and equilateral triangles.",
 prior:'10.2.',
 simple:'Equilateral, side a: s = 3a/2; s − a = a/2 (three times). Area = √(3a/2 × a/2 × a/2 × a/2) = (√3/4)a². Isosceles with equal sides a and base b: area = (b/4)√(4a² − b²).',
 detail:'Example: isosceles triangle with equal sides 12 cm and perimeter 30 cm → base 6 cm; s = 15; area = √(15 × 3 × 3 × 9) = 9√15 cm². An umbrella made of 10 triangular cloth pieces each 20, 50, 50 cm uses 10 × area of one piece.',
 real:'Umbrella panels and kites are made of isosceles triangles.',
 apply:'An isosceles triangle has perimeter 30 cm and each equal side 12 cm. Find its area.',
 see:{w:520,h:200,f:[
  ['Equilateral.',tri([[60,170],[200,170],[130,50]],TL)+lbl(130,190,'a')],
  ['Isosceles.',tri([[300,170],[440,170],[370,40]],BL)+lbl(370,190,'b')+lbl(320,100,'a')+lbl(420,100,'a')],
  ['Results.',lbl(130,30,'(√3/4)a²','font-weight="700" fill="'+TL+'"')+lbl(370,24,'(b/4)√(4a² − b²)','font-weight="700" fill="'+BL+'"')]]},
 seeNote:'Heron covers every triangle.',
 do:{title:'Two ways',mat:'Paper',steps:['Equilateral triangle side 6 cm: use Heron and (√3/4)a².'],obs:'9√3 cm² both ways.',why:'Consistency.',lab:false},
 memo:'"Equilateral: root-3 over 4, times a squared."',
 miscon:['"Heron\'s formula only works for scalene triangles." It works for every triangle.'],
 terms:['Isosceles','Equilateral','Perimeter'],
 q:{q:'Area of equilateral triangle, side 6 cm:',o:['9√3 cm²','36 cm²','18√3 cm²','6√3 cm²'],a:0,why:'(√3/4) × 36.'},
 exam:'Isosceles/equilateral areas: 2 marks.'},

{id:'h5',num:'10.5',title:'Area of quadrilaterals',
 intro:'Kamla has a four-sided field. How can a triangle formula help?',
 obj:'Find the area of a quadrilateral by dividing it into triangles.',
 prior:'10.2.',
 simple:'Draw a diagonal to split the quadrilateral into two triangles. Find each area with Heron\'s formula (or ½bh if a right angle is known) and add. Example: ABCD with AB = 3, BC = 4, CD = 4, DA = 5 cm and diagonal AC = 5 cm. △ABC is right-angled (3, 4, 5): area 6 cm². △ACD (5, 4, 5): s = 7, area = √(7 × 2 × 3 × 2) = 2√21 ≈ 9.2 cm². Total ≈ 15.2 cm².',
 detail:'You need the length of one diagonal (sides alone do not fix a quadrilateral). For a rhombus, use the two diagonals or split into two congruent triangles. A park ABCD with ∠C = 90° can be split into a right triangle and one other triangle.',
 real:'Patwaris divide irregular fields into triangles to compute area.',
 apply:'A rhombus has perimeter 80 m and one diagonal 24 m. Find its area.',
 see:{w:520,h:230,f:[
  ['A quadrilateral.',`<polygon points="100,190 260,190 400,120 200,40" fill="${TL}" fill-opacity=".1" stroke="${TL}" stroke-width="2.5"/>`],
  ['A diagonal splits it.',`<line x1="100" y1="190" x2="400" y2="120" stroke="${OR}" stroke-width="2.5" stroke-dasharray="6 4"/>`],
  ['Add two Heron areas.',`<polygon points="100,190 260,190 400,120" fill="${BL}" fill-opacity=".25"/><polygon points="100,190 400,120 200,40" fill="${GN}" fill-opacity=".25"/>`+lbl(260,222,'area = △1 + △2','font-weight="700"')]]},
 seeNote:'Two triangles make a quadrilateral.',
 do:{title:'Field split',mat:'Quadrilateral drawn on graph paper',steps:['Draw a diagonal; measure all lengths.','Compute area; check by counting squares.'],obs:'Close match.',why:'Splitting.',lab:false},
 memo:'"Cut along a diagonal, Heron twice."',
 miscon:['"Four sides fix a quadrilateral\'s area." You also need a diagonal or an angle.'],
 terms:['Diagonal','Quadrilateral','Rhombus'],
 q:{q:'To use Heron for a quadrilateral, you also need:',o:['nothing more','a diagonal','the perimeter','the colour'],a:1,why:'To split into triangles.'},
 exam:'Quadrilateral areas: 3–5 marks.'},

{id:'h6',num:'10.6',title:'Applications and estimation',
 intro:'How many tiles of a triangular shape are needed to cover a floor design?',
 obj:'Solve mixed problems involving cost, number of pieces and estimation.',
 prior:'10.2–10.5.',
 simple:'Typical steps: find the area of one piece or region with Heron\'s formula; then divide or multiply as needed. Floor with 16 triangular tiles each with sides 9, 28, 35 cm: s = 36; area = √(36 × 27 × 8 × 1) = 36√6 ≈ 88.2 cm²; total ≈ 1411 cm²; cost at 50 paise per cm² ≈ ₹705.5.',
 detail:'Use √ values: √2 ≈ 1.41, √3 ≈ 1.73, √5 ≈ 2.24, √6 ≈ 2.45. Estimate before calculating to catch mistakes. Units: if sides are in metres, area is in m²; convert carefully (1 m² = 10,000 cm²).',
 real:'Rangoli designs and decorative tiles often use repeated triangles.',
 apply:'A kite made of a square (diagonal 32 cm) and an isosceles triangle (base 8 cm, sides 6 cm) uses two colours. Find the area of each.',
 see:{w:520,h:200,f:[
  ['One tile.',tri([[60,160],[170,160],[100,70]],OR)+lbl(115,185,'one tile')],
  ['Many tiles.',[0,1,2,3].map(i=>tri([[230+i*60,160],[290+i*60,160],[260+i*60,90]],OR,'.2')).join('')+lbl(350,185,'16 tiles')],
  ['Area × number × rate.',lbl(260,40,'total cost = area of one × number × rate','font-weight="700"')]]},
 seeNote:'Area of one, then scale up.',
 do:{title:'Price a design',mat:'Graph paper',steps:['Design a pattern of 8 triangles.','Price it at ₹2 per cm².'],obs:'Cost estimate.',why:'Application.',lab:false},
 memo:'"One piece, then multiply."',
 miscon:['"Area units are the same as length units." Area is in square units.'],
 terms:['Estimation','Square units','Rate per unit area'],
 q:{q:'A tile has area 36√6 cm². 16 tiles cover about (√6 ≈ 2.45):',o:['1411 cm²','576 cm²','2822 cm²','141 cm²'],a:0,why:'16 × 88.2.'},
 exam:'Mixed application problems: 3–5 marks.'}
];

const CARDS=[['Area of triangle','½ × base × height.'],['Equilateral','(√3/4)a².'],["Heron's formula",'√[s(s − a)(s − b)(s − c)].'],['Semi-perimeter','s = (a + b + c) ÷ 2.'],['Valid triangle','s − a, s − b, s − c all positive.'],['Isosceles','(b/4)√(4a² − b²).'],['Quadrilateral','Split by a diagonal; add two areas.'],['Units','Area in square units.']];

const Q=[
 {lv:1,q:'Semi-perimeter of a triangle with sides 7, 8, 9:',o:['24','12','8','16'],a:1,w:'24 ÷ 2.'},
 {lv:1,q:"Heron's formula uses:",o:['height only','three sides','two angles','base only'],a:1,w:'Sides only.'},
 {lv:1,q:'Area of a 6–8–10 triangle:',o:['24','48','30','60'],a:0,w:'Right triangle: ½ × 6 × 8.'},
 {lv:2,q:'Sides 13, 14, 15. Area:',o:['84','42','91','168'],a:0,w:'s = 21; √(21·8·7·6).'},
 {lv:2,q:'Equilateral triangle, side 10 cm. Area:',o:['25√3','50√3','100','10√3'],a:0,w:'(√3/4) × 100.'},
 {lv:2,q:'Sides 1, 2, 5 cm:',o:['area 1','not a triangle','area 2','area 5'],a:1,w:'1 + 2 < 5.'},
 {lv:3,q:'Perimeter 32 cm, sides 8 and 11. Third side:',o:['13','12','10','21'],a:0,w:'32 − 19.'},
 {lv:3,q:'Isosceles: equal sides 5, base 6. Area:',o:['12','15','24','30'],a:0,w:'s = 8 → √(8·3·3·2).'},
 {lv:4,q:'Rhombus with perimeter 80 m and diagonal 24 m. Area:',o:['384 m²','192 m²','480 m²','240 m²'],a:0,w:'Two triangles 20, 20, 24: each 192.'},
 {lv:4,q:'Sides in ratio 3 : 4 : 5, perimeter 144 cm. Area:',o:['864 cm²','432 cm²','1728 cm²','576 cm²'],a:0,w:'36, 48, 60 → ½ × 36 × 48.'},
 {lv:5,open:true,m:3,q:"Find the area of a triangle with sides 18 cm, 10 cm and the perimeter 42 cm.",ans:['Third side 14 cm (1)','s = 21; s − a = 3, 11, 7 (1)','Area = √(21·3·11·7) = 21√11 cm² (1)']},
 {lv:5,open:true,m:5,q:'ABCD is a park with AB = 9 m, BC = 12 m, CD = 5 m, AD = 8 m and ∠C = 90°. Find its area.',ans:['Join BD: BD = √(12² + 5²) = 13 m (1)','△BCD = ½ × 12 × 5 = 30 m² (1)','△ABD: 9, 8, 13; s = 15 (1)','Area = √(15·6·7·2) = 6√35 ≈ 35.5 m² (1)','Total ≈ 65.5 m² (1)']}
];

const ONEMIN=['½bh needs a height.','Heron: √[s(s−a)(s−b)(s−c)].','Real problems: area × rate.','Isosceles and equilateral by Heron.','Quadrilaterals: split by a diagonal.','Applications and estimation.'];
const KEYS=[['height',/height|½/i],['heron',/heron/i],['semi-perimeter',/semi|s =/i],['isosceles',/isosceles|equilateral/i],['quadrilateral',/quadrilateral|diagonal/i],['application',/cost|rate|tile/i]];

/* ---------- lab ---------- */
let a=13,b=14,c=15,wired=false;
function draw(){const s=(a+b+c)/2,p=s*(s-a)*(s-b)*(s-c);const ok=s-a>0&&s-b>0&&s-c>0;let g='';
 $('#hfAv').textContent=a;$('#hfBv').textContent=b;$('#hfCv').textContent=c;
 if(!ok){g=T(260,150,'These sides cannot make a triangle','font-size="17" font-weight="700" fill="'+RD+'"')+T(260,180,'(the sum of two sides must be greater than the third)','font-size="13"');$('#hfSvg').innerHTML=g;$('#hfOut').innerHTML=`<p>s = ${s}; s − a = ${s-a}, s − b = ${s-b}, s − c = ${s-c}. One of these is not positive, so no triangle exists.</p>`;return}
 const area=Math.sqrt(p);const x=(a*a+c*c-b*b)/(2*a),h=Math.sqrt(Math.max(0,c*c-x*x));const mn=Math.min(0,x),mx=Math.max(a,x);const sc=Math.min(380/(mx-mn),230/h,24);const ox=260-(mn+mx)/2*sc;
 const B=[ox,280],Cc=[ox+a*sc,280],A=[ox+x*sc,280-h*sc];
 g+=tri([B,Cc,A],TL)+`<line x1="${A[0]}" y1="${A[1]}" x2="${A[0]}" y2="280" stroke="${OR}" stroke-width="2" stroke-dasharray="5 4"/>`+(x<0||x>a?`<line x1="${Math.min(A[0],B[0])}" y1="280" x2="${Math.max(A[0],Cc[0])}" y2="280" stroke="${OR}" stroke-dasharray="3 3"/>`:'');
 g+=T(B[0]-10,B[1]+16,'B','font-size="14" font-weight="700"')+T(Cc[0]+10,Cc[1]+16,'C','font-size="14" font-weight="700"')+T(A[0],A[1]-8,'A','font-size="14" font-weight="700"');
 g+=T((B[0]+Cc[0])/2,300,'a = '+a,'font-size="12"')+T((Cc[0]+A[0])/2+20,(Cc[1]+A[1])/2,'b = '+b,'font-size="12"')+T((B[0]+A[0])/2-24,(B[1]+A[1])/2,'c = '+c,'font-size="12"')+T(A[0]+18,(A[1]+280)/2,'h','font-size="13" fill="'+OR+'"');
 g+=T(260,24,`Area = ${area.toFixed(2)} m²`,'font-size="17" font-weight="700" fill="'+TL+'"');
 $('#hfSvg').innerHTML=g;
 $('#hfOut').innerHTML=`<p>① s = (${a} + ${b} + ${c}) ÷ 2 = <b>${s}</b></p><p>② s − a = ${s-a}, s − b = ${s-b}, s − c = ${s-c}</p><p>③ s(s − a)(s − b)(s − c) = ${s} × ${s-a} × ${s-b} × ${s-c} = ${p.toFixed(2)}</p><p>④ Area = √${p.toFixed(2)} = <b>${area.toFixed(2)} m²</b></p><p>Check: height on BC = ${h.toFixed(2)} m → ½ × ${a} × ${h.toFixed(2)} = ${(a*h/2).toFixed(2)} m² ✓</p>`}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const el=e.target;if(!el||!el.classList||!el.classList.contains('hfS'))return;const v=+el.value;if(el.id==='hfA')a=v;else if(el.id==='hfB')b=v;else c=v;draw()})}
function labClick(){return false}
function labChange(){return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
