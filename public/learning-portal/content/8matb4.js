/* Rai Plus content pack: Class 8 Mathematics (Ganita Prakash Part 2), Chapter 4 – Exploring Some Geometric Themes (fractals and 3D visualisation). */
RP.register({key:'8matb4',cls:'8',subject:'Mathematics',ch:'II-4',title:"Exploring Some Geometric Themes",color:'#7a3fa0',
crumb:"Class 8 Mathematics · Ganita Prakash Part 2",h1:"Part 2 · Chapter 4: Exploring Some Geometric Themes",sub:"Self-similar shapes (fractals) — the Sierpinski carpet, the Sierpinski triangle and the Koch snowflake — and seeing solids from different directions: views, nets, isometric drawings and impossible figures.",heroLabel:"Shapes inside shapes",labName:'Fractal builder',
theme:"\n:root{--g:light-dark(#7a3fa0,#d3a8ef);--g2:light-dark(#f5eefa,#170c1f);--line:light-dark(#e3d2ef,#3d2a4a);--bg:light-dark(#ffffff,#100a14);--card:light-dark(#ffffff,#170f1c);\n--ink:light-dark(#241130,#efe3f6);--mute:light-dark(#5d4a6a,#c3b0cf);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#5a2a7a}\n",
labHTML:`  <h2>Fractal builder</h2>
  <p>Choose a fractal and move the step slider. At each step the same rule is applied to every piece. Watch how the number of pieces, the remaining area or the perimeter changes.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="frSvg" viewBox="0 0 400 380" role="img" aria-label="Fractal" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Fractal<select id="frT"><option value="c">Sierpinski carpet</option><option value="t">Sierpinski triangle</option><option value="k">Koch snowflake</option></select></label></div>
  <div class="ctrl"><label>Step: <b id="frNv"></b><input type="range" id="frN" min="0" max="4" value="1"></label></div>
  <div class="box y" id="frOut" aria-live="polite"></div>
  <div class="ctrl"><button class="btn" id="frQ">Predict the next step</button></div>
  <div class="ctrl" id="frOpts"></div></div></div>
`,
build:function(){

const ACC='#7a3fa0',LABNAME='Fractal builder',MIND_CENTER='Geometric themes';
const PU='#7a3fa0',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
/* fractal generators (return SVG strings) */
function carpet(x,y,s,n){if(n===0)return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${s.toFixed(2)}" height="${s.toFixed(2)}"/>`;const t=s/3;let o='';for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(!(i===1&&j===1))o+=carpet(x+i*t,y+j*t,t,n-1);return o}
function tri(ax,ay,bx,by,cx,cy,n){if(n===0)return `<polygon points="${[ax,ay,bx,by,cx,cy].map(v=>v.toFixed(2)).join(',')}"/>`;const m=(p,q)=>(p+q)/2;return tri(ax,ay,m(ax,bx),m(ay,by),m(ax,cx),m(ay,cy),n-1)+tri(m(ax,bx),m(ay,by),bx,by,m(bx,cx),m(by,cy),n-1)+tri(m(ax,cx),m(ay,cy),m(bx,cx),m(by,cy),cx,cy,n-1)}
function kochPts(n,cx,cy,R){let p=[0,1,2].map(k=>{const a=-Math.PI/2+k*2*Math.PI/3;return [cx+R*Math.cos(a),cy+R*Math.sin(a)]});for(let s=0;s<n;s++){const q=[];for(let i=0;i<p.length;i++){const [x1,y1]=p[i],[x2,y2]=p[(i+1)%p.length];const dx=(x2-x1)/3,dy=(y2-y1)/3;const a=[x1+dx,y1+dy],b=[x1+2*dx,y1+2*dy];const ang=-Math.PI/3;const c=[a[0]+dx*Math.cos(ang)-dy*Math.sin(ang),a[1]+dx*Math.sin(ang)+dy*Math.cos(ang)];q.push([x1,y1],a,c,b)}p=q}return p}
const koch=(n,cx,cy,R,c)=>`<polygon points="${kochPts(n,cx,cy,R).map(v=>v[0].toFixed(1)+','+v[1].toFixed(1)).join(' ')}" fill="${c}" fill-opacity=".25" stroke="${c}" stroke-width="1.5"/>`;
const cube=(x,y,s,c)=>{const h=s*.5,w=s*.866;return `<polygon points="${x},${y} ${x+w},${y-h} ${x+2*w},${y} ${x+w},${y+h}" fill="${c}" fill-opacity=".55" stroke="${ink}"/><polygon points="${x},${y} ${x+w},${y+h} ${x+w},${y+h+s} ${x},${y+s}" fill="${c}" fill-opacity=".35" stroke="${ink}"/><polygon points="${x+w},${y+h} ${x+2*w},${y} ${x+2*w},${y+s} ${x+w},${y+h+s}" fill="${c}" fill-opacity=".15" stroke="${ink}"/>`};
function heroDraw(){return `<g fill="#fff" opacity=".9">${tri(110,30,40,150,180,150,3)}</g>`}
const HERO=heroDraw;
const MIND=[['Self-similarity',100,50],['Sierpinski carpet',420,50],['Sierpinski triangle',90,150],['Koch snowflake',430,150],['Views of solids',110,250],['Nets, isometric, impossible',410,250]];

const C=[
{id:'g1',num:'4.1',title:'Fractals and self-similarity',
 intro:'Look closely at a fern leaf or a cauliflower floret: each small part looks like a tiny copy of the whole.',
 obj:'Understand self-similarity and how fractals are built by repeating a rule.',
 prior:'Basic shapes; patterns.',
 simple:'A shape is self-similar when its parts look like smaller copies of the whole. A fractal is a shape built by starting with a simple figure (step 0) and applying the same rule again and again to every piece. Each repetition is called a step (or iteration).',
 detail:'In nature: ferns, Romanesco cauliflower, branching trees, river networks, lightning, coastlines. In art: many Indian temple towers (shikharas) are made of smaller copies of the main tower. True mathematical fractals repeat the rule forever; drawings show only the first few steps.',
 real:'The branching of blood vessels and of tree roots follows self-similar patterns.',
 apply:'Draw a "fractal tree": a trunk that splits into two smaller branches, each of which splits again.',
 see:{w:520,h:220,f:[
  ['Step 0: one line.',`<line x1="260" y1="210" x2="260" y2="140" stroke="${PU}" stroke-width="5"/>`],
  ['Step 1: split into two.',`<line x1="260" y1="140" x2="220" y2="95" stroke="${PU}" stroke-width="3.5"/><line x1="260" y1="140" x2="300" y2="95" stroke="${PU}" stroke-width="3.5"/>`],
  ['Step 2: each branch splits again.',[[220,95],[300,95]].map(([x,y])=>`<line x1="${x}" y1="${y}" x2="${x-25}" y2="${y-35}" stroke="${PU}" stroke-width="2.5"/><line x1="${x}" y1="${y}" x2="${x+25}" y2="${y-35}" stroke="${PU}" stroke-width="2.5"/>`).join('')+lbl(260,25,'same rule, smaller each time','font-weight="700"')]]},
 seeNote:'Repeat a rule → fractal.',
 do:{title:'Nature hunt',mat:'Leaves, cauliflower, photos',steps:['Find objects whose parts look like the whole.','Sketch two levels.'],obs:'Self-similarity everywhere.',why:'Fractals in nature.',lab:false},
 memo:'"Zoom in — same shape again."',
 miscon:['"Any repeating pattern is a fractal." A tiled floor repeats side by side; a fractal repeats at smaller and smaller scales.'],
 terms:['Self-similar','Fractal','Step / iteration'],
 q:{q:'A fractal is made by:',o:['drawing random lines','repeating the same rule at smaller scales','colouring a square','rotating a shape once'],a:1,why:'Self-similar repetition.'},
 exam:'Define self-similarity with an example: 1–2 marks.'},

{id:'g2',num:'4.2',title:'The Sierpinski carpet',
 intro:'Cut a square into 9 equal squares and remove the middle one. Now do the same to each of the 8 squares left…',
 obj:'Construct the Sierpinski carpet and count its squares and remaining area.',
 prior:'4.1; area of a square.',
 simple:'Step 0: a filled square. Rule: divide each filled square into 3 × 3 smaller squares and remove the centre one. After step 1: 8 squares; step 2: 8 × 8 = 64; step n: 8ⁿ squares.',
 detail:'Each step keeps 8/9 of the area. Starting with area 1: step 1 → 8/9, step 2 → 64/81, step n → (8/9)ⁿ. The area keeps shrinking towards 0, while the number of squares grows without limit. The side of each small square at step n is (1/3)ⁿ.',
 real:'Patterns like the carpet appear in some rangoli and in antenna designs for mobile phones.',
 apply:'How many squares at step 3? What fraction of the area remains?',
 see:{w:520,h:220,f:[
  ['Step 0.',`<g fill="${PU}">${carpet(30,40,140,0)}</g>`+lbl(100,205,'1 square')],
  ['Step 1.',`<g fill="${PU}">${carpet(190,40,140,1)}</g>`+lbl(260,205,'8 squares, 8/9 area')],
  ['Step 2.',`<g fill="${PU}">${carpet(350,40,140,2)}</g>`+lbl(420,205,'64 squares, 64/81 area')]]},
 seeNote:'×8 pieces, ×8/9 area each step.',
 do:{title:'Paper carpet',mat:'Square grid paper (27 × 27)',steps:['Shade the full square.','Erase the centre ninth; repeat on each remaining ninth.'],obs:'64 squares at step 2.',why:'Rule repeated.',lab:true},
 memo:'"Nine, remove one: eight remain."',
 miscon:['"The squares at step 2 are 16." Each of 8 squares makes 8 more: 64.'],
 terms:['Sierpinski carpet','8ⁿ','(8/9)ⁿ'],
 q:{q:'Number of squares in the Sierpinski carpet at step 2:',o:['16','64','72','81'],a:1,why:'8 × 8.'},
 exam:'Count pieces and area fraction: 2–3 marks.'},

{id:'g3',num:'4.3',title:'The Sierpinski triangle',
 intro:'Join the midpoints of a triangle\'s sides — you get 4 smaller triangles. Remove the middle one and repeat.',
 obj:'Construct the Sierpinski triangle and find patterns in counts and area.',
 prior:'4.2; mid-points; area.',
 simple:'Step 0: a filled equilateral triangle. Rule: join the midpoints of each filled triangle\'s sides, making 4 smaller triangles, and remove the middle (upside-down) one. Step 1: 3 triangles; step 2: 9; step n: 3ⁿ.',
 detail:'Each small triangle has ¼ of the area of its parent, and 3 of 4 are kept, so ¾ of the area remains each step: (3/4)ⁿ after n steps. The side halves each step: (1/2)ⁿ. The same pattern appears when you colour the odd numbers in Pascal\'s triangle (Meru Prastara).',
 real:'Coloured odd/even entries of Pingala\'s Meru Prastara form a Sierpinski triangle.',
 apply:'At step 4, how many triangles are there? What fraction of the area is left?',
 see:{w:520,h:220,f:[
  ['Step 0.',`<g fill="${PU}">${tri(100,30,30,190,170,190,0)}</g>`+lbl(100,210,'1')],
  ['Step 1.',`<g fill="${PU}">${tri(260,30,190,190,330,190,1)}</g>`+lbl(260,210,'3 triangles, ¾ area')],
  ['Step 2.',`<g fill="${PU}">${tri(420,30,350,190,490,190,2)}</g>`+lbl(420,210,'9 triangles, 9/16 area')]]},
 seeNote:'×3 pieces, ×¾ area each step.',
 do:{title:'Midpoint triangle',mat:'Ruler, triangle on paper',steps:['Mark midpoints; join them.','Shade the 3 corner triangles; repeat.'],obs:'9 triangles at step 2.',why:'Self-similar.',lab:true},
 memo:'"Three corners stay, the middle goes."',
 miscon:['"4 triangles at step 1." The middle one is removed: 3 remain.'],
 terms:['Sierpinski triangle','Midpoint','3ⁿ'],
 q:{q:'Fraction of area left after step 2 of the Sierpinski triangle:',o:['3/4','9/16','1/2','27/64'],a:1,why:'(3/4)².'},
 exam:'Draw steps 0–2 and tabulate: 3 marks.'},

{id:'g4',num:'4.4',title:'The Koch snowflake',
 intro:'Can a shape have a boundary that keeps getting longer and longer, while it still fits inside a small circle?',
 obj:'Construct the Koch snowflake and study how its perimeter grows.',
 prior:'4.1; perimeter.',
 simple:'Step 0: an equilateral triangle. Rule: divide each side into 3 equal parts, build an outward equilateral triangle on the middle part, and remove that middle part\'s base. Each side becomes 4 sides, each 1/3 as long.',
 detail:'Number of sides: 3, 12, 48, 192 … = 3 × 4ⁿ. If each original side is 1, the perimeter is 3 × (4/3)ⁿ: 3, 4, 5⅓, 7⅑ … It grows without end. Yet the snowflake always stays inside the circle around the original triangle — a finite area with an endlessly long boundary.',
 real:'Coastlines behave similarly: the finer you measure, the longer they seem.',
 apply:'How many sides does the snowflake have at step 3? What is its perimeter if each original side is 9 cm?',
 see:{w:520,h:220,f:[
  ['Step 0.',koch(0,90,120,75,PU)+lbl(90,210,'3 sides')],
  ['Step 1.',koch(1,260,120,75,PU)+lbl(260,210,'12 sides')],
  ['Step 2.',koch(2,430,120,75,PU)+lbl(430,210,'48 sides')+lbl(260,25,'perimeter ×4/3 each step','font-weight="700"')]]},
 seeNote:'Sides ×4, length ×⅓ → perimeter ×4/3.',
 do:{title:'Draw a snowflake',mat:'Isometric dot paper',steps:['Draw a triangle of side 9 dots.','Add the bumps for step 1 and step 2.'],obs:'Boundary grows.',why:'Koch rule.',lab:true},
 memo:'"Each side becomes four; perimeter grows by a third."',
 miscon:['"The area grows without limit too." The area stays finite; only the perimeter keeps growing.'],
 terms:['Koch snowflake','Perimeter','3 × 4ⁿ sides'],
 q:{q:'At step 1, the Koch snowflake has:',o:['6 sides','9 sides','12 sides','4 sides'],a:2,why:'3 × 4.'},
 exam:'Perimeter growth: 2–3 marks.'},

{id:'g5',num:'4.5',title:'Views of solids: top, front and side',
 intro:'A building looks different from the road, from the side lane and from a drone above. How do we capture all of that?',
 obj:'Draw and match the top, front and side views (projections) of solids.',
 prior:'3D shapes from earlier classes.',
 simple:'A view (projection) is what you see when you look at a solid straight on from one direction. The front view, side view and top view together describe a solid. A cylinder: front view a rectangle, top view a circle. A cone: front view a triangle, top view a circle (with a dot at the centre).',
 detail:'For cube structures, count the cubes in each column: the top view shows which squares are covered; the front view shows the tallest column in each column-line. Different solids can share one view (a cube and a square prism look alike from above), so we usually need two or three views.',
 real:'Architects and engineers draw plans (top view) and elevations (front and side views).',
 apply:'Draw the three views of a matchbox standing on its end.',
 see:{w:520,h:240,f:[
  ['A cube structure.',cube(40,90,40,PU)+cube(109,90,40,PU)+cube(40,50,40,PU)+lbl(110,215,'3D shape')],
  ['Front view.',`<rect x="240" y="80" width="40" height="40" fill="${BL}" fill-opacity=".4" stroke="${ink}"/><rect x="240" y="120" width="40" height="40" fill="${BL}" fill-opacity=".4" stroke="${ink}"/><rect x="280" y="120" width="40" height="40" fill="${BL}" fill-opacity=".4" stroke="${ink}"/>`+lbl(280,215,'front')],
  ['Top view.',`<rect x="380" y="120" width="40" height="40" fill="${GN}" fill-opacity=".4" stroke="${ink}"/><rect x="420" y="120" width="40" height="40" fill="${GN}" fill-opacity=".4" stroke="${ink}"/>`+lbl(420,215,'top')]]},
 seeNote:'Look straight at each face.',
 do:{title:'Block views',mat:'Unit cubes or dice',steps:['Build a small structure.','Draw front, side and top views; swap with a friend to rebuild.'],obs:'Views pin down the shape.',why:'Projections.',lab:true},
 memo:'"Front, side, top — three looks tell the shape."',
 miscon:['"One view is enough." Different solids can share a view.'],
 terms:['Projection','Front / side / top view','Plan and elevation'],
 q:{q:'The top view of a cone standing on its base is:',o:['triangle','circle with a centre dot','rectangle','square'],a:1,why:'Seen from above.'},
 exam:'Match solids with views: 2–3 marks.'},

{id:'g6',num:'4.6',title:'Nets, isometric drawings and impossible figures',
 intro:'Can every drawing of a solid actually be built? Look at the "impossible triangle".',
 obj:'Use nets and isometric drawings; recognise impossible figures.',
 prior:'4.5; nets from earlier classes.',
 simple:'A net is a flat pattern that folds into a solid (a cube has 11 different nets). An isometric drawing shows a solid on triangular dot paper, with vertical edges vertical and other edges at 30°, so equal lengths look equal. Some drawings look like solids but cannot exist in 3D — impossible figures, like the Penrose triangle.',
 detail:'Euler\'s relation for solids like cubes and prisms: Faces + Vertices − Edges = 2 (cube: 6 + 8 − 12 = 2). The Penrose triangle seems to have three straight bars meeting at right angles, but three right angles cannot close a triangle in space — each corner is locally fine, the whole is impossible.',
 real:'Artists use impossible figures for optical illusions; packaging designers use nets.',
 apply:'Which of these is a net of a cube: a cross shape, or a 2 × 3 rectangle of squares?',
 see:{w:520,h:220,f:[
  ['A net of a cube (cross).',[[60,40],[60,80],[60,120],[60,160],[20,80],[100,80]].map(([x,y])=>`<rect x="${x}" y="${y}" width="40" height="40" fill="${PU}" fill-opacity=".3" stroke="${ink}"/>`).join('')],
  ['Isometric cube.',cube(215,90,50,BL)+lbl(258,210,'isometric drawing')],
  ['Impossible figure.',lbl(420,110,'Penrose triangle','font-size="15" font-weight="700" fill="'+OR+'"')+lbl(420,135,'looks solid — cannot be built','font-size="12"')+lbl(260,30,'F + V − E = 2 for a cube: 6 + 8 − 12','font-weight="700"')]]},
 seeNote:'Fold, draw, and question what you see.',
 do:{title:'Cube nets',mat:'Squared paper, scissors',steps:['Draw hexomino shapes.','Cut and fold: which make cubes?'],obs:'11 nets work.',why:'Nets.',lab:true},
 memo:'"Net folds, isometric shows, impossible fools."',
 miscon:['"Any 6 joined squares fold into a cube." A 2 × 3 rectangle does not.'],
 terms:['Net','Isometric drawing','Impossible figure','Euler\'s relation'],
 q:{q:'For a cube, F + V − E equals:',o:['0','2','6','12'],a:1,why:'6 + 8 − 12.'},
 exam:'Nets, isometric sketches, Euler: 2–3 marks.'}
];

const CARDS=[['Self-similar','Parts look like the whole.'],['Fractal','Repeat a rule at smaller scales.'],['Carpet','8ⁿ squares; area (8/9)ⁿ.'],['Sierpinski triangle','3ⁿ triangles; area (3/4)ⁿ.'],['Koch','3 × 4ⁿ sides; perimeter ×4/3.'],['Views','Front, side, top.'],['Net','Flat pattern that folds into a solid.'],['Isometric','Drawn on triangular dot paper.'],['Impossible figure','Looks 3D, cannot be built.'],['Euler','F + V − E = 2.']];

const Q=[
 {lv:1,q:'Which is self-similar?',o:['a fern leaf','a brick','a coin','a ruler'],a:0,w:'Parts like the whole.'},
 {lv:1,q:'Sierpinski carpet: squares removed at step 1:',o:['1','3','8','9'],a:0,w:'The centre one.'},
 {lv:1,q:'Top view of a cylinder standing upright:',o:['rectangle','circle','triangle','square'],a:1,w:'From above.'},
 {lv:2,q:'Sierpinski triangle: triangles at step 3:',o:['9','12','27','64'],a:2,w:'3³.'},
 {lv:2,q:'Koch snowflake sides at step 2:',o:['12','36','48','24'],a:2,w:'3 × 16.'},
 {lv:2,q:'Area remaining in Sierpinski carpet after step 2 (start 1):',o:['8/9','64/81','2/3','1/9'],a:1,w:'(8/9)².'},
 {lv:3,q:'Koch snowflake, original side 3 cm: perimeter at step 1:',o:['9 cm','12 cm','16 cm','27 cm'],a:1,w:'9 × 4/3.'},
 {lv:3,q:'Which 6-square shape is NOT a net of a cube?',o:['cross','T-shape with 4 in a row','2 × 3 rectangle','staircase'],a:2,w:'It cannot close.'},
 {lv:4,q:'A triangular prism has 5 faces and 6 vertices. Edges:',o:['8','9','11','12'],a:1,w:'5 + 6 − E = 2.'},
 {lv:4,q:'As steps increase, the Koch snowflake\'s perimeter:',o:['stays the same','decreases','grows without limit','becomes 0'],a:2,w:'×4/3 each step.'},
 {lv:5,open:true,m:3,q:'Draw steps 0, 1 and 2 of the Sierpinski triangle and make a table of the number of shaded triangles and the fraction of area shaded.',ans:['Correct drawings (1)','Counts 1, 3, 9 (1)','Area 1, 3/4, 9/16 (1)']},
 {lv:5,open:true,m:5,q:'Explain how the Koch snowflake can have a perimeter that grows without limit while its area stays finite. Calculate the perimeter at steps 0–3 if each side starts at 27 cm.',ans:['Each side → 4 sides of ⅓ length (1)','Perimeter ×4/3 each step (1)','81, 108, 144, 192 cm (1)','Shape stays inside a fixed circle → finite area (1)','Conclusion (1)']}
];

const ONEMIN=['Fractals repeat a rule.','Carpet: 8ⁿ, (8/9)ⁿ.','Triangle: 3ⁿ, (3/4)ⁿ.','Koch: perimeter ×4/3.','Front, side, top views.','Nets, isometric, impossible figures.'];
const KEYS=[['self-similar',/self.?similar|fractal/i],['carpet',/carpet/i],['triangle',/sierpinski triangle|3ⁿ/i],['koch',/koch|snowflake/i],['view',/view|projection/i],['net',/net|isometric|impossible/i]];

/* ---------- lab ---------- */
let type='c',N=1,quiz=null,wired=false;
const frac=(a,b)=>`${a}/${b}`;
function draw(){let s='';
 if(type==='c')s=`<g fill="${PU}">${carpet(50,30,300,N)}</g>`;
 else if(type==='t')s=`<g fill="${PU}">${tri(200,20,30,315,370,315,N)}</g>`;
 else s=koch(N,200,190,165,PU);
 $('#frSvg').innerHTML=s;$('#frNv').textContent=N;
 if(quiz)return;
 let t='';
 if(type==='c')t=`<p>Step ${N}: <b>${8**N}</b> squares, each with side (1/3)${N?'<sup>'+N+'</sup>':'⁰'} = 1/${3**N}.</p><p>Area left: (8/9)<sup>${N}</sup> = ${frac(8**N,9**N)} ≈ <b>${(100*(8/9)**N).toFixed(1)}%</b>.</p>`;
 else if(type==='t')t=`<p>Step ${N}: <b>${3**N}</b> triangles, each with side 1/${2**N} of the original.</p><p>Area left: (3/4)<sup>${N}</sup> = ${frac(3**N,4**N)} ≈ <b>${(100*(3/4)**N).toFixed(1)}%</b>.</p>`;
 else t=`<p>Step ${N}: <b>${3*4**N}</b> sides, each 1/${3**N} of the original side.</p><p>Perimeter (original side 1): 3 × (4/3)<sup>${N}</sup> ≈ <b>${(3*(4/3)**N).toFixed(2)}</b>. It keeps growing, yet the shape stays inside the same circle.</p>`;
 $('#frOut').innerHTML=t}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='frN'){N=+e.target.value;quiz=null;$('#frOpts').innerHTML='';draw()}});
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-fp]');if(!b||!quiz)return;const ok=b.dataset.fp===String(quiz.a);$('#frOut').innerHTML=ok?`<p class="fb ok">Correct — ${quiz.why}</p>`:`<p class="fb no">Not quite — the answer is ${quiz.a}. ${quiz.why}</p>`;$('#frOpts').innerHTML='';quiz=null})}
function labClick(b){if(b.id==='frQ'){const n=Math.min(N+1,5);let a,why,q;if(type==='c'){a=8**n;q=`How many squares will the carpet have at step ${n}?`;why=`8<sup>${n}</sup> = ${a}.`}else if(type==='t'){a=3**n;q=`How many triangles at step ${n}?`;why=`3<sup>${n}</sup> = ${a}.`}else{a=3*4**n;q=`How many sides at step ${n}?`;why=`3 × 4<sup>${n}</sup> = ${a}.`}
 const opts=[a,a*2,Math.round(a*3/4)||1,a+8].filter((v,i,arr)=>arr.indexOf(v)===i).sort(()=>Math.random()-.5);quiz={a,why};$('#frOut').innerHTML=`<p><b>Predict:</b> ${q}</p>`;$('#frOpts').innerHTML=opts.map(v=>`<button class="btn" type="button" data-fp="${v}">${v}</button>`).join(' ');return true}return false}
function labChange(t){if(t.id==='frT'){type=t.value;quiz=null;$('#frOpts').innerHTML='';draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
