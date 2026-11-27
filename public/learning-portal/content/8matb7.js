/* Rai Plus content pack: Class 8 Mathematics (Ganita Prakash Part 2), Chapter 7 – Area. */
RP.register({key:'8matb7',cls:'8',subject:'Mathematics',ch:'II-7',title:"Area",color:'#0f6e6e',
crumb:"Class 8 Mathematics · Ganita Prakash Part 2",h1:"Part 2 · Chapter 7: Area",sub:"Areas of triangles and parallelograms by cutting and rearranging, why shearing keeps area, the rhombus and trapezium formulas, areas of polygons and fields by splitting, and paths and units of area.",heroLabel:"Cut, shift, rearrange",labName:'Shape shear lab',
theme:"\n:root{--g:light-dark(#0f6e6e,#86d6d6);--g2:light-dark(#e7f4f4,#061616);--line:light-dark(#c6e3e3,#1e3d3d);--bg:light-dark(#ffffff,#071111);--card:light-dark(#ffffff,#0c1818);\n--ink:light-dark(#0b2626,#dff1f1);--mute:light-dark(#466262,#a6c4c4);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#0b5252}\n",
labHTML:`  <h2>Shape shear lab</h2>
  <p>Pick a shape and set its measurements on the 1 cm grid. Slide the <b>shear</b> to push the top sideways: the shape leans, but as long as the base and height stay the same, the area does not change.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="arSvg" viewBox="0 0 460 300" role="img" aria-label="Area" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Shape<select id="arT"><option value="p">Parallelogram</option><option value="t">Triangle</option><option value="z">Trapezium</option><option value="r">Rhombus (diagonals)</option></select></label></div>
  <div class="ctrl"><label><span><span id="arBl">base</span>: <b id="arBv"></b> cm</span><input type="range" class="arS" id="arB" min="2" max="12" value="8"></label></div>
  <div class="ctrl" id="arAc"><label><span>top side a: <b id="arAv"></b> cm</span><input type="range" class="arS" id="arA" min="1" max="12" value="4"></label></div>
  <div class="ctrl"><label><span><span id="arHl">height</span>: <b id="arHv"></b> cm</span><input type="range" class="arS" id="arH" min="2" max="9" value="5"></label></div>
  <div class="ctrl" id="arSc"><label><span>shear: <b id="arSv"></b></span><input type="range" class="arS" id="arSh" min="-4" max="6" value="2"></label></div>
  <div class="box y" id="arOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#0f6e6e',LABNAME='Shape shear lab',MIND_CENTER='Area';
const TL='#0f6e6e',OR='#b04a1f',BL='#1f5f8b',PU='#6a4fb3',GN='#3b6d11',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const poly=(pts,c,op='.3')=>`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="${c}" fill-opacity="${op}" stroke="${c}" stroke-width="2"/>`;
const dash=(x1,y1,x2,y2,c=ink)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-dasharray="5 4"/>`;
function heroDraw(){return `<polygon points="40,140 170,140 200,40 70,40" fill="none" stroke="#fff" stroke-width="2.5"/><line x1="70" y1="40" x2="70" y2="140" stroke="#fff" stroke-dasharray="5 4"/>`}
const HERO=heroDraw;
const MIND=[['Triangle = ½ rectangle',100,50],['Parallelogram & shear',420,50],['Rhombus: ½ d₁d₂',90,150],['Trapezium',430,150],['Polygons by splitting',110,250],['Paths & units',410,250]];

const C=[
{id:'r1',num:'7.1',title:'Rectangles and triangles',
 intro:'Draw any triangle inside a rectangle with the same base and height. What fraction of the rectangle does it cover?',
 obj:'Show that the area of a triangle is half the base times the height.',
 prior:'Area of a rectangle; Class 7 area.',
 simple:'Area of a rectangle = length × breadth. Draw a triangle with the same base and height inside it: the height line splits the rectangle into two smaller rectangles, and the triangle is exactly half of each. So area of triangle = ½ × base × height.',
 detail:'The height (altitude) is the perpendicular distance from the base to the opposite vertex. In an obtuse triangle the height can fall outside the triangle, but the formula still holds. Any side can be the base, as long as you use the matching height.',
 real:'Calculating the area of triangular gable walls before painting.',
 apply:'Find the area of a triangle with base 14 cm and height 9 cm.',
 see:{w:520,h:220,f:[
  ['A rectangle.',poly([[100,180],[420,180],[420,50],[100,50]],GR,'.08')],
  ['A triangle with the same base and height.',poly([[100,180],[420,180],[220,50]],TL)+dash(220,50,220,180)],
  ['Each half-rectangle is cut in half.',lbl(260,205,'triangle = ½ × base × height','font-weight="700" fill="'+TL+'"')]]},
 seeNote:'Two halves of two rectangles.',
 do:{title:'Cut and fit',mat:'Paper rectangle, scissors',steps:['Draw a triangle on the rectangle\'s base with its top on the opposite side.','Cut the two outer pieces and fit them on the triangle.'],obs:'They cover it exactly.',why:'Triangle = half.',lab:true},
 memo:'"Half of base times height."',
 miscon:['"The height is the slanting side." The height is always perpendicular to the base.'],
 terms:['Base','Height (altitude)','½bh'],
 q:{q:'Triangle with base 10 cm and height 6 cm. Area:',o:['60 cm²','30 cm²','16 cm²','15 cm²'],a:1,why:'½ × 10 × 6.'},
 exam:'Area of triangles: 1–2 marks.'},

{id:'r2',num:'7.2',title:'Parallelograms and shearing',
 intro:'Push a stack of notebooks so it leans. Has the amount of paper changed?',
 obj:'Find the area of a parallelogram and understand why shearing keeps area.',
 prior:'7.1.',
 simple:'Cut a right triangle off one end of a parallelogram and move it to the other end: you get a rectangle with the same base and height. So area of parallelogram = base × height.',
 detail:'Shearing slides the top side along its line while the base stays fixed. The height doesn\'t change, so the area doesn\'t either: all parallelograms on the same base between the same parallel lines have equal area. The same is true for triangles with the same base and their tops on a line parallel to the base.',
 real:'A leaning stack of books or coins has the same volume as a straight one (the 3D version of shearing).',
 apply:'A parallelogram has sides 12 cm and 7 cm, and the height on the 12 cm side is 5 cm. Find its area and the height on the 7 cm side.',
 see:{w:520,h:220,f:[
  ['A parallelogram.',poly([[80,180],[340,180],[420,60],[160,60]],TL)],
  ['Cut a triangle off.',dash(160,60,160,180)+poly([[80,180],[160,180],[160,60]],OR,'.35')],
  ['Move it: a rectangle.',poly([[340,180],[420,180],[420,60]],OR,'.35')+lbl(250,205,'area = base × height','font-weight="700" fill="'+TL+'"')]]},
 seeNote:'Cut, slide, rectangle.',
 do:{title:'Notebook shear',mat:'Stack of cards',steps:['Stack cards straight; trace the side.','Push into a lean; trace again.'],obs:'Same base and height.',why:'Shearing keeps area.',lab:true},
 memo:'"Lean it, it\'s the same."',
 miscon:['"Area of a parallelogram = side × side." Use base × perpendicular height.'],
 terms:['Parallelogram','Shear','Between the same parallels'],
 q:{q:'Parallelogram base 9 cm, height 4 cm. Area:',o:['13 cm²','36 cm²','18 cm²','26 cm²'],a:1,why:'9 × 4.'},
 exam:'Parallelogram area, missing height: 2–3 marks.'},

{id:'r3',num:'7.3',title:'Area of a rhombus',
 intro:'A kite-shaped tile has diagonals 30 cm and 20 cm. How much glass is needed?',
 obj:'Find the area of a rhombus (and kite) using its diagonals.',
 prior:'7.1; properties of a rhombus (Part 1 Ch 4).',
 simple:'The diagonals of a rhombus cut each other at right angles. They divide it into 4 right triangles that fit exactly inside a rectangle of size d₁ × d₂ — covering half of it. So area of rhombus = ½ × d₁ × d₂.',
 detail:'The same formula works for a kite and for any quadrilateral whose diagonals are perpendicular. A rhombus is also a parallelogram, so its area is also side × height; both methods must agree.',
 real:'Rangoli diamonds, kite making, and tiles.',
 apply:'A rhombus has diagonals 16 cm and 12 cm. Find its area and its side (use Baudhayana-Pythagoras).',
 see:{w:520,h:220,f:[
  ['A rhombus.',poly([[260,30],[400,110],[260,190],[120,110]],TL)],
  ['Diagonals at right angles.',`<line x1="260" y1="30" x2="260" y2="190" stroke="${OR}" stroke-width="2"/><line x1="120" y1="110" x2="400" y2="110" stroke="${OR}" stroke-width="2"/>`+lbl(272,70,'d₁','fill="'+OR+'"')+lbl(330,102,'d₂','fill="'+OR+'"')],
  ['Half of the rectangle d₁ × d₂.',poly([[120,30],[400,30],[400,190],[120,190]],GR,'.05')+lbl(260,212,'area = ½ × d₁ × d₂','font-weight="700" fill="'+TL+'"')]]},
 seeNote:'Half the bounding rectangle.',
 do:{title:'Fold a rhombus',mat:'Paper square',steps:['Fold a rhombus; mark diagonals.','Cut the 4 triangles; rearrange into a rectangle.'],obs:'Rectangle ½d₁ × d₂.',why:'Formula.',lab:true},
 memo:'"Half the product of the diagonals."',
 miscon:['"Rhombus area = side × side." Only a square; use ½d₁d₂ or base × height.'],
 terms:['Rhombus','Diagonals','Kite'],
 q:{q:'Rhombus diagonals 10 cm and 8 cm. Area:',o:['80 cm²','40 cm²','18 cm²','36 cm²'],a:1,why:'½ × 80.'},
 exam:'Rhombus area: 2 marks.'},

{id:'r4',num:'7.4',title:'Area of a trapezium',
 intro:'A field has two parallel sides of 60 m and 40 m, 30 m apart. What is its area?',
 obj:'Derive and use the area formula for a trapezium.',
 prior:'7.1, 7.2.',
 simple:'Take two copies of the trapezium; turn one upside down and join them: you get a parallelogram with base (a + b) and the same height h. Its area is (a + b) × h, so one trapezium has area ½ × (a + b) × h.',
 detail:'Other ways to see it: split the trapezium by a diagonal into two triangles (½ah + ½bh), or average the parallel sides and multiply by the height. Field: ½ × (60 + 40) × 30 = 1500 m².',
 real:'Cross-sections of canals and embankments; side walls of steps.',
 apply:'A trapezium has area 180 cm², height 12 cm and one parallel side 10 cm. Find the other parallel side.',
 see:{w:520,h:220,f:[
  ['A trapezium.',poly([[40,170],[220,170],[180,70],[90,70]],TL)+lbl(130,190,'b')+lbl(135,60,'a')],
  ['Two copies form a parallelogram.',poly([[220,170],[310,170],[360,70],[180,70]],OR,'.25')+lbl(265,190,'a')+lbl(270,60,'b')],
  ['Area = ½(a + b)h.',lbl(260,210,'two copies: (a + b) × h → one: ½(a + b) × h','font-weight="700" fill="'+TL+'"')]]},
 seeNote:'Double it, halve it.',
 do:{title:'Two copies',mat:'Two paper trapeziums',steps:['Cut two identical trapeziums.','Join them into a parallelogram.'],obs:'Base a + b.',why:'Formula.',lab:true},
 memo:'"Add the parallel sides, halve, times height."',
 miscon:['"Use the slanting sides." Only the two parallel sides and the perpendicular distance between them.'],
 terms:['Trapezium','Parallel sides','½(a + b)h'],
 q:{q:'Trapezium: parallel sides 7 and 13 cm, height 6 cm. Area:',o:['120 cm²','60 cm²','40 cm²','78 cm²'],a:1,why:'½ × 20 × 6.'},
 exam:'Trapezium area and missing side: 2–3 marks.'},

{id:'r5',num:'7.5',title:'Areas of polygons and fields',
 intro:'A farmer\'s field has five uneven sides. How can a surveyor find its area?',
 obj:'Find areas of polygons by splitting them into triangles, rectangles and trapeziums.',
 prior:'7.1–7.4.',
 simple:'Split the shape into pieces whose areas you know, find each area, and add. A regular hexagon can be split into 6 equilateral triangles, or into a trapezium + an equilateral triangle + a rhombus with areas in the ratio 2 : 1 : 1.',
 detail:'Surveyors draw a long diagonal (base line) across the field and measure the perpendicular offsets to each corner. This splits the field into right triangles and trapeziums. Alternatively, subtract: area of an L-shape = big rectangle − missing rectangle.',
 real:'Land records (khasra maps) are drawn this way by patwaris.',
 apply:'An L-shaped room: 8 m × 6 m with a 3 m × 2 m corner missing. Find its area two ways.',
 see:{w:520,h:220,f:[
  ['A pentagon-shaped field.',poly([[80,180],[440,180],[460,90],[280,30],[60,100]],TL,'.18')],
  ['Base line and offsets.',`<line x1="80" y1="180" x2="460" y2="90" stroke="${OR}" stroke-width="1.5"/>`+dash(280,30,303,127,OR)+dash(60,100,79,180,OR)],
  ['Add the pieces.',lbl(260,210,'area = sum of triangles and trapeziums','font-weight="700"')]]},
 seeNote:'Split, find, add.',
 do:{title:'School ground survey',mat:'Measuring tape, chalk',steps:['Mark a base line across the ground.','Measure offsets; sketch; compute.'],obs:'Total area.',why:'Splitting.',lab:false},
 memo:'"Break it into shapes you know."',
 miscon:['"Area of an irregular shape can\'t be found." Split it or count squares.'],
 terms:['Polygon','Offset','Survey'],
 q:{q:'An L-shape: 10 × 8 rectangle minus a 4 × 3 corner. Area:',o:['68','80','72','12'],a:0,why:'80 − 12.'},
 exam:'Composite areas: 3–5 marks.'},

{id:'r6',num:'7.6',title:'Paths, borders and units of area',
 intro:'A 1 m wide path runs around a 20 m × 15 m garden. How much land does the path cover?',
 obj:'Find areas of paths and borders, and convert between units of area.',
 prior:'7.1–7.5.',
 simple:'Path outside: (outer rectangle) − (inner rectangle) = (22 × 17) − (20 × 15) = 374 − 300 = 74 m². Path through the middle (crossing paths): add the two strips and subtract the overlap square, which was counted twice.',
 detail:'Units: 1 cm² = 100 mm²; 1 m² = 10,000 cm²; 1 hectare = 10,000 m²; 1 km² = 100 hectares. When a length unit is multiplied by 10, the area unit is multiplied by 100. Land in Haryana is also measured in local units such as kanal and marla (1 acre = 8 kanal, 1 kanal = 20 marla).',
 real:'Cost of tiling a verandah, or laying grass around a pool.',
 apply:'Two 2 m wide roads cross at the centre of a 60 m × 40 m park. Find the area of the roads.',
 see:{w:520,h:220,f:[
  ['Outer rectangle.',poly([[100,20],[420,20],[420,200],[100,200]],OR,'.25')],
  ['Garden inside.',poly([[125,45],[395,45],[395,175],[125,175]],GN,'.22')],
  ['Path = outer − inner.',lbl(260,115,'path = 374 − 300 = 74 m²','font-size="15" font-weight="700"')]]},
 seeNote:'Outer minus inner.',
 do:{title:'Border of a notebook',mat:'Notebook, ruler',steps:['Measure the cover and the inner label area.','Find the border area.'],obs:'Outer − inner.',why:'Path method.',lab:false},
 memo:'"Big minus small; ×100 for each step of 10."',
 miscon:['"1 m² = 100 cm²." It is 100 × 100 = 10,000 cm².'],
 terms:['Path','Hectare','Square units'],
 q:{q:'1 m² equals:',o:['100 cm²','1000 cm²','10,000 cm²','10 cm²'],a:2,why:'100 × 100.'},
 exam:'Paths and unit conversion: 3 marks.'}
];

const CARDS=[['Triangle','½ × base × height.'],['Parallelogram','base × height.'],['Shear','Same base & height → same area.'],['Rhombus/kite','½ × d₁ × d₂.'],['Trapezium','½ × (a + b) × h.'],['Polygons','Split into known shapes and add.'],['Subtraction','L-shape = big − missing.'],['Path','Outer − inner.'],['Crossing roads','Strip + strip − overlap.'],['Units','1 m² = 10,000 cm²; 1 ha = 10,000 m².']];

const Q=[
 {lv:1,q:'Area of a triangle with base 8 cm, height 5 cm:',o:['40 cm²','20 cm²','13 cm²','26 cm²'],a:1,w:'½ × 40.'},
 {lv:1,q:'Area of a parallelogram with base 11 cm, height 3 cm:',o:['33 cm²','14 cm²','16.5 cm²','28 cm²'],a:0,w:'11 × 3.'},
 {lv:1,q:'1 hectare =',o:['100 m²','1000 m²','10,000 m²','1 km²'],a:2,w:'Definition.'},
 {lv:2,q:'Rhombus with diagonals 14 cm and 6 cm. Area:',o:['84 cm²','42 cm²','20 cm²','40 cm²'],a:1,w:'½ × 84.'},
 {lv:2,q:'Trapezium: parallel sides 8, 12 cm; height 5 cm. Area:',o:['100 cm²','50 cm²','480 cm²','25 cm²'],a:1,w:'½ × 20 × 5.'},
 {lv:2,q:'Shearing a parallelogram (same base, same height) changes its:',o:['area','perimeter','base','height'],a:1,w:'Sides lengthen.'},
 {lv:3,q:'Parallelogram area 48 cm², base 12 cm. Height:',o:['4 cm','36 cm','6 cm','8 cm'],a:0,w:'48 ÷ 12.'},
 {lv:3,q:'A 1 m path around a 10 m × 6 m lawn. Path area:',o:['36 m²','32 m²','60 m²','16 m²'],a:0,w:'12 × 8 − 60.'},
 {lv:4,q:'Trapezium area 90 cm², height 6 cm, one parallel side 12 cm. Other side:',o:['18 cm','15 cm','3 cm','30 cm'],a:0,w:'½(12 + x)6 = 90.'},
 {lv:4,q:'Two 3 m roads cross through a 50 m × 30 m park. Road area:',o:['240 m²','231 m²','249 m²','150 m²'],a:1,w:'150 + 90 − 9.'},
 {lv:5,open:true,m:3,q:'Explain, with a diagram, why the area of a trapezium is ½(a + b)h.',ans:['Two copies joined form a parallelogram (1)','Base a + b, height h (1)','Area of one = half of (a + b)h (1)']},
 {lv:5,open:true,m:5,q:'A field ABCDE is surveyed with base line AD = 100 m. Offsets: B is 30 m from A along AD with perpendicular 20 m; C is 70 m from A with perpendicular 25 m (same side); E is 60 m from A with perpendicular 30 m on the other side. Find the area.',ans:['Triangle A-B: ½ × 30 × 20 = 300 (1)','Trapezium B-C: ½(20 + 25) × 40 = 900 (1)','Triangle C-D: ½ × 30 × 25 = 375 (1)','Triangle AED: ½ × 100 × 30 = 1500 (1)','Total = 3075 m² (1)']}
];

const ONEMIN=['Triangle = ½bh.','Parallelogram = bh; shearing keeps area.','Rhombus = ½d₁d₂.','Trapezium = ½(a + b)h.','Split polygons.','Paths; units of area.'];
const KEYS=[['triangle',/triangle|½bh/i],['parallelogram',/parallelogram|shear/i],['rhombus',/rhombus|diagonal/i],['trapezium',/trapezium/i],['polygon',/polygon|split|survey/i],['units',/path|hectare|unit/i]];

/* ---------- lab ---------- */
let type='p',B=8,A=4,H=5,S=2,wired=false,U=30;
const OX=40,OY=270;
function draw(){const ext=type==='r'?12:(type==='z'?Math.max(B,A+Math.max(S,0))+Math.max(0,-S):B+Math.abs(S));U=Math.min(30,400/Math.max(ext,1),240/9);const P=(x,y)=>[OX+x*U,OY-y*U];let s='';
 const GW=Math.floor(410/U);for(let i=0;i<=GW;i++)s+=`<line x1="${OX+i*U}" y1="${OY-9*U}" x2="${OX+i*U}" y2="${OY}" stroke="${GR}" stroke-opacity=".25"/>`;for(let j=0;j<=9;j++)s+=`<line x1="${OX}" y1="${OY-j*U}" x2="${OX+GW*U}" y2="${OY-j*U}" stroke="${GR}" stroke-opacity=".25"/>`;
 const off=type==='r'?0:Math.max(0,-S);let pts,area,txt;
 if(type==='p'){pts=[P(off,0),P(off+B,0),P(off+B+S,H),P(off+S,H)];area=B*H;txt=`Parallelogram: base × height = ${B} × ${H} = <b>${area} cm²</b>.`}
 else if(type==='t'){pts=[P(off,0),P(off+B,0),P(off+S+B/2,H)];area=B*H/2;txt=`Triangle: ½ × base × height = ½ × ${B} × ${H} = <b>${area} cm²</b>.`}
 else if(type==='z'){pts=[P(off,0),P(off+B,0),P(off+S+A,H),P(off+S,H)];area=(A+B)*H/2;txt=`Trapezium: ½ × (a + b) × h = ½ × (${A} + ${B}) × ${H} = <b>${area} cm²</b>.`}
 else {const cx=6,cy=4.5;pts=[P(cx-B/2,cy),P(cx,cy+H/2),P(cx+B/2,cy),P(cx,cy-H/2)];area=B*H/2;txt=`Rhombus: ½ × d₁ × d₂ = ½ × ${B} × ${H} = <b>${area} cm²</b>.`;
  s+=`<line x1="${P(cx-B/2,cy)[0]}" y1="${P(0,cy)[1]}" x2="${P(cx+B/2,cy)[0]}" y2="${P(0,cy)[1]}" stroke="${OR}" stroke-width="2"/><line x1="${P(cx,0)[0]}" y1="${P(0,cy+H/2)[1]}" x2="${P(cx,0)[0]}" y2="${P(0,cy-H/2)[1]}" stroke="${OR}" stroke-width="2"/>`+poly([P(cx-B/2,cy-H/2),P(cx+B/2,cy-H/2),P(cx+B/2,cy+H/2),P(cx-B/2,cy+H/2)],GR,'.05')}
 s=poly(pts,TL,'.35')+s;if(type!=='r'){const top=pts[pts.length-1];s+=dash(top[0],top[1],top[0],OY,OR)+T(top[0]+16,OY-H*U/2,'h','font-size="13" fill="'+OR+'"')}
 $('#arSvg').innerHTML=s;$('#arBv').textContent=B;$('#arAv').textContent=A;$('#arHv').textContent=H;$('#arSv').textContent=S;
 $('#arAc').style.display=type==='z'?'':'none';$('#arSc').style.display=type==='r'?'none':'';$('#arBl').textContent=type==='r'?'diagonal d₁':type==='z'?'bottom side b':'base';$('#arHl').textContent=type==='r'?'diagonal d₂':'height';
 $('#arOut').innerHTML=`<p>${txt}</p><p>${type==='r'?'The rhombus fills exactly half of the dashed rectangle d₁ × d₂.':`Move the shear slider: the shape leans, its slanted sides get longer, but the area stays ${area} cm² because the base and height do not change.`}</p>`}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const t=e.target;if(!t||!t.classList||!t.classList.contains('arS'))return;const v=+t.value;if(t.id==='arB')B=v;else if(t.id==='arA')A=v;else if(t.id==='arH')H=v;else S=v;draw()})}
function labClick(){return false}
function labChange(t){if(t.id==='arT'){type=t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
