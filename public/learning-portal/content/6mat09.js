/* Rai Plus content pack: Class 6 Mathematics (Ganita Prakash), Chapter 9 – Symmetry. */
RP.register({key:'6mat09',cls:'6',subject:'Mathematics',ch:'9',title:"Symmetry",color:'#6a4fb3',
crumb:"Class 6 Mathematics · Ganita Prakash",h1:"Chapter 9: Symmetry",sub:"Lines of symmetry, figures with many lines, rotational symmetry, and symmetry in nature and art.",heroLabel:"A butterfly with a dashed mirror line and a pinwheel",labName:'Mirror painter',
theme:"\n:root{--g:light-dark(#6a4fb3,#c3b3f2);--g2:light-dark(#f1edfb,#130f22);--line:light-dark(#dcd3f3,#30285a);--bg:light-dark(#ffffff,#0b0916);--card:light-dark(#ffffff,#110e20);\n--ink:light-dark(#1b1338,#ebe6fa);--mute:light-dark(#5a5080,#b8afd6);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#4e3891}\n",
labHTML:`  <h2>Mirror painter</h2>
  <p>Tap squares to colour them. The mirror line(s) copy your pattern. Try making a rangoli!</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="mSvg" viewBox="0 0 320 320" role="img" aria-label="Symmetric grid" style="color:var(--ink);cursor:pointer"></svg></div></div>
  <div><div class="ctrl"><label>Mirror lines<select id="mMode"><option value="v">1 vertical line</option><option value="h">1 horizontal line</option><option value="vh">2 lines (vertical + horizontal)</option><option value="r4">Rotation by 90° (order 4)</option><option value="d4">4 lines (rangoli)</option></select></label></div><div class="ctrl"><label>Colour<select id="mCol"><option value="#6a4fb3">Purple</option><option value="#b04a1f">Orange</option><option value="#3b6d11">Green</option><option value="#e0b84a">Yellow</option></select></label> <button class="btn" id="mClear">Clear</button></div><div class="box y" id="mOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#6a4fb3',LABNAME='Mirror painter',MIND_CENTER='Symmetry';
const PU='#6a4fb3',OR='#b04a1f',GN='#3b6d11',BL='#1f5f8b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const mir=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${OR}" stroke-width="2" stroke-dasharray="7 5"/>`;
const poly=(cx,cy,r,n,c=PU,rot=-Math.PI/2)=>`<polygon points="${[...Array(n)].map((_,k)=>{const a=rot+k*2*Math.PI/n;return (cx+r*Math.cos(a)).toFixed(1)+','+(cy+r*Math.sin(a)).toFixed(1)}).join(' ')}" fill="${c}" opacity=".25" stroke="${c}" stroke-width="2"/>`;
const blade=(cx,cy,a,c)=>`<path d="M${cx} ${cy} L${(cx+50*Math.cos(a)).toFixed(1)} ${(cy+50*Math.sin(a)).toFixed(1)} L${(cx+30*Math.cos(a+0.6)).toFixed(1)} ${(cy+30*Math.sin(a+0.6)).toFixed(1)}Z" fill="${c}" opacity=".7"/>`;
function heroDraw(){return `<path d="M120 70 q-50 -50 -60 0 q10 40 60 10z M120 70 q50 -50 60 0 q-10 40 -60 10z" fill="#fff" opacity=".85"/><line x1="120" y1="20" x2="120" y2="120" stroke="#fff" stroke-dasharray="5 4"/>`+[0,1,2,3].map(k=>blade(280,70,k*Math.PI/2,'#fff')).join('')}
const HERO=heroDraw;
const MIND=[['Line of symmetry',100,50],['Many lines',420,50],['Regular polygons',90,150],['Rotational symmetry',430,150],['Order & angle',110,250],['In nature & art',410,250]];

const C=[
{id:'s1',num:'9.1',title:'Line of symmetry',
 intro:'Fold a paper butterfly down the middle. Do the two halves match?',
 obj:'Identify lines of symmetry (reflection symmetry).',
 prior:'Shapes.',
 simple:'A figure has line symmetry if a line divides it into two parts that match exactly when folded along the line. The line is called the line (or axis) of symmetry. One half is the mirror image of the other: if you put a mirror on the line, the reflection completes the figure.',
 detail:'Check by folding, by tracing and flipping, or with a mirror. Letters like A, M, T, U, V, W, Y have a vertical line of symmetry; B, C, D, E, K have a horizontal one; H, I, O, X have both. F, G, J, L, N, P, Q, R, S, Z have none.',
 real:'The Taj Mahal, a peepal leaf and many kolam designs are symmetric about a line.',
 apply:'Which capital letters have a vertical line of symmetry?',
 see:{w:520,h:220,f:[
  ['Half a butterfly.',`<path d="M260 110 q-80 -90 -110 -10 q20 70 110 30z" fill="${PU}" opacity=".5"/>`],
  ['Fold line (mirror line).',mir(260,20,260,200)],
  ['The mirror image completes it.',`<path d="M260 110 q80 -90 110 -10 q-20 70 -110 30z" fill="${PU}" opacity=".5"/>`+lbl(400,200,'line of symmetry','fill="'+OR+'"')]]},
 seeNote:'Fold and match.',
 do:{title:'Ink blot',mat:'Paper, paint',steps:['Fold a paper in half and open it.','Drop paint on one side; fold and press.','Open.'],obs:'A symmetric pattern.',why:'Folding reflects.',lab:true},
 memo:'"Fold, match, symmetric."',
 miscon:['"Any line through the middle is a line of symmetry." The halves must match exactly.'],
 terms:['Line of symmetry','Mirror image','Reflection'],
 q:{q:'Which letter has a vertical line of symmetry?',o:['F','A','R','S'],a:1,why:'A folds onto itself.'},
 exam:'Draw lines of symmetry: 2 marks.'},

{id:'s2',num:'9.2',title:'Figures with many lines of symmetry',
 intro:'How many ways can you fold a square so the halves match?',
 obj:'Find all lines of symmetry of common figures.',
 prior:'9.1.',
 simple:'Some figures have more than one line of symmetry. A rectangle (not a square) has 2. A square has 4 (2 through mid-points of sides, 2 diagonals). An equilateral triangle has 3. A regular polygon with n sides has n lines of symmetry. A circle has infinitely many (every diameter).',
 detail:'An isosceles triangle has 1; a scalene triangle has none. Note: a rectangle\'s diagonals are NOT lines of symmetry (fold it and see). You can make figures with exactly 2 or 4 lines of symmetry by colouring squares on grid paper.',
 real:'A plain wheel or rotli has many lines of symmetry.',
 apply:'How many lines of symmetry does a regular hexagon have?',
 see:{w:520,h:220,f:[
  ['Square: 4 lines.',poly(100,110,70,4,PU,-Math.PI/4)+mir(100,50,100,170)+mir(40,110,160,110)+mir(50,60,150,160)+mir(150,60,50,160)],
  ['Equilateral triangle: 3 lines.',poly(260,120,70,3,GN)+[0,1,2].map(k=>{const a=-Math.PI/2+k*2*Math.PI/3;return mir(260+75*Math.cos(a),120+75*Math.sin(a),260-40*Math.cos(a),120-40*Math.sin(a))}).join('')],
  ['Rectangle: only 2.',`<rect x="370" y="70" width="120" height="80" fill="${BL}" opacity=".25" stroke="${BL}" stroke-width="2"/>`+mir(430,55,430,165)+mir(355,110,505,110)]]},
 seeNote:'Regular n-gon: n lines.',
 do:{title:'Fold shapes',mat:'Paper square, rectangle, circle',steps:['Fold each in every way that matches.','Count the folds.'],obs:'4, 2, many.',why:'Lines of symmetry.',lab:true},
 memo:'"Square 4, rectangle 2, triangle 3, circle ∞."',
 miscon:['"A rectangle\'s diagonal is a line of symmetry." It is not.'],
 terms:['Regular polygon','Diagonal','Infinitely many'],
 q:{q:'Lines of symmetry of a square:',o:['2','3','4','8'],a:2,why:'2 + 2 diagonals.'},
 exam:'Count lines of symmetry: 2 marks.'},

{id:'s3',num:'9.3',title:'Rotational symmetry',
 intro:'Turn a pinwheel a quarter turn. Does it look the same?',
 obj:'Identify rotational symmetry, angles and order.',
 prior:'Angles (Ch 2).',
 simple:'A figure has rotational symmetry if it looks exactly the same after turning it about its centre by less than a full turn (360°). The smallest such angle is the angle of rotational symmetry. The number of times it looks the same in one full turn is its order: a pinwheel with 4 blades has angle 90° and order 4.',
 detail:'Angle × order = 360°. A square: 90°, order 4; equilateral triangle: 120°, order 3; regular hexagon: 60°, order 6; letter S and Z: 180°, order 2. Every figure looks the same after 360°, so we count rotational symmetry only when the angle is less than 360°.',
 real:'A ceiling fan with 3 blades: 120°, order 3.',
 apply:'What is the angle of rotational symmetry of a regular pentagon?',
 see:{w:520,h:220,f:[
  ['A 4-blade pinwheel.',[0,1,2,3].map(k=>blade(130,110,k*Math.PI/2,[PU,OR,GN,BL][k])).join('')],
  ['Turn 90°: looks the same.',[0,1,2,3].map(k=>blade(380,110,k*Math.PI/2+Math.PI/2,[PU,OR,GN,BL][k])).join('')+`<path d="M330 40 A60 60 0 0 1 430 40" fill="none" stroke="${GR}" stroke-width="1.5"/>`],
  ['Angle 90°, order 4 (90 × 4 = 360).',lbl(260,205,'angle 90° · order 4','font-weight="700"')]]},
 seeNote:'Angle × order = 360°.',
 do:{title:'Turn test',mat:'Cut-out shapes, a pin, tracing paper',steps:['Trace the shape; pin at the centre.','Turn slowly and count matches in one full turn.'],obs:'Order.',why:'Rotational symmetry.',lab:true},
 memo:'"Turn, match, count."',
 miscon:['"Order 1 means rotational symmetry." Order 1 (only 360°) means none.'],
 terms:['Rotational symmetry','Centre of rotation','Angle of symmetry','Order'],
 q:{q:'Angle of rotational symmetry of an equilateral triangle:',o:['60°','90°','120°','180°'],a:2,why:'360 ÷ 3.'},
 exam:'Angle and order: 2 marks.'},

{id:'s4',num:'9.4',title:'Both kinds of symmetry',
 intro:'Does every figure with line symmetry also have rotational symmetry?',
 obj:'Classify figures by line and rotational symmetry.',
 prior:'9.1–9.3.',
 simple:'Some figures have both (square, regular polygons, circle, letter H). Some have only line symmetry (letter A, isosceles triangle). Some have only rotational symmetry (letters S, Z, N, a pinwheel). Some have neither (letter F, a scalene triangle).',
 detail:'A regular polygon with n sides has n lines of symmetry and rotational symmetry of order n (angle 360°/n). Rangoli and kolam designs often have both. Car hub-caps and logos are designed with rotational symmetry.',
 real:'Many company logos have rotational symmetry.',
 apply:'Name a letter with rotational symmetry but no line symmetry.',
 see:{w:520,h:200,f:[
  ['H: both.',T(80,110,'H','font-size=\"70\" font-weight=\"700\"')+mir(80,40,80,130)],
  ['A: line only. S: rotation only.',T(220,110,'A','font-size=\"70\" font-weight=\"700\"')+mir(220,40,220,130)+T(340,110,'S','font-size=\"70\" font-weight=\"700\"')+`<path d="M300 40 A40 40 0 0 1 380 40" fill="none" stroke="${GR}"/>`],
  ['F: neither.',T(450,110,'F','font-size=\"70\" font-weight=\"700\"')+lbl(260,180,'both · line only · rotation only · neither','font-weight="700"')]]},
 seeNote:'Four possibilities.',
 do:{title:'Letter sort',mat:'Alphabet cards',steps:['Sort A–Z into the four groups.','Check with a mirror and by turning.'],obs:'H, I, O, X both; S, Z, N rotation only.',why:'Classification.',lab:false},
 memo:'"Mirror? Turn? Both? Neither?"',
 miscon:['"Rotational symmetry needs line symmetry." S has rotation only.'],
 terms:['Line symmetry','Rotational symmetry'],
 q:{q:'Rotation only (no line symmetry):',o:['A','H','S','T'],a:2,why:'Order 2, no mirror line.'},
 exam:'Classify figures: 2 marks.'},

{id:'s5',num:'9.5',title:'Symmetry in nature and art',
 intro:'Look at a flower, a snowflake, a starfish. What symmetry do you see?',
 obj:'Recognise and create symmetric designs.',
 prior:'9.1–9.4.',
 simple:'Symmetry is everywhere: leaves and butterflies (line symmetry), flowers and starfish (rotational and line), snowflakes (order 6). Humans use symmetry in rangoli, kolam, temple architecture, textiles (bandhani), tiles and logos because it looks balanced and beautiful.',
 detail:'To make a symmetric design, draw one part and reflect or rotate it. In a 4-line rangoli, draw one-eighth and reflect it across lines to fill the whole design. Indian monuments like the Taj Mahal and Humayun\'s Tomb are famous for their symmetry.',
 real:'Diwali rangolis in Rewari homes use order-4 and order-8 symmetry.',
 apply:'Design a rangoli with 4 lines of symmetry.',
 see:{w:520,h:220,f:[
  ['A flower with 6 petals.',[...Array(6)].map((_,k)=>{const a=k*Math.PI/3;return `<ellipse cx="${(130+35*Math.cos(a)).toFixed(1)}" cy="${(110+35*Math.sin(a)).toFixed(1)}" rx="28" ry="12" transform="rotate(${k*60} ${(130+35*Math.cos(a)).toFixed(1)} ${(110+35*Math.sin(a)).toFixed(1)})" fill="${OR}" opacity=".6"/>`}).join('')+`<circle cx="130" cy="110" r="12" fill="#e0b84a"/>`],
  ['A starfish: 5 arms.',poly(380,115,70,5,PU)+poly(380,115,30,5,PU,Math.PI/2)],
  ['Order 6 and order 5.',lbl(130,200,'6 lines, order 6')+lbl(380,200,'5 lines, order 5')]]},
 seeNote:'Nature loves symmetry.',
 do:{title:'Leaf hunt',mat:'Leaves from the school garden',steps:['Collect 5 leaves.','Check for a line of symmetry by folding.'],obs:'Many are nearly symmetric.',why:'Natural growth.',lab:false},
 memo:'"Draw a part, reflect or rotate the rest."',
 miscon:['"Natural things are perfectly symmetric." Often only nearly.'],
 terms:['Rangoli','Kolam','Snowflake'],
 q:{q:'A snowflake usually has rotational symmetry of order:',o:['2','4','6','8'],a:2,why:'Six arms.'},
 exam:'Complete a symmetric figure: 2 marks.'}
];

const CARDS=[['Line of symmetry','Fold line where halves match.'],['Mirror image','Reflection across the line.'],['Square','4 lines; rotation 90°, order 4.'],['Rectangle','2 lines; order 2.'],['Equilateral triangle','3 lines; 120°, order 3.'],['Regular n-gon','n lines; order n; angle 360°/n.'],['Circle','Infinitely many lines.'],['Rotational symmetry','Same after turning < 360°.'],['Angle × order','= 360°.'],['S, Z, N','Rotation only.'],['H, I, O, X','Both.']];

const Q=[
 {lv:1,q:'Lines of symmetry of a rectangle:',o:['1','2','4','0'],a:1,w:'Through mid-points.'},
 {lv:1,q:'A circle has how many lines of symmetry?',o:['1','4','100','infinitely many'],a:3,w:'Every diameter.'},
 {lv:1,q:'Which has no line of symmetry?',o:['M','O','F','X'],a:2,w:'F.'},
 {lv:2,q:'Order of rotational symmetry of a square:',o:['2','3','4','8'],a:2,w:'90° turns.'},
 {lv:2,q:'Angle of rotational symmetry of a regular hexagon:',o:['30°','60°','90°','120°'],a:1,w:'360÷6.'},
 {lv:2,q:'Letter with both line and rotational symmetry:',o:['A','H','S','T'],a:1,w:'H.'},
 {lv:3,q:'Lines of symmetry of an isosceles triangle:',o:['0','1','2','3'],a:1,w:'One.'},
 {lv:3,q:'A figure with angle of symmetry 72° has order:',o:['4','5','6','8'],a:1,w:'360÷72.'},
 {lv:4,q:'Which has rotational symmetry but no line symmetry?',o:['equilateral triangle','pinwheel with curved blades','rectangle','circle'],a:1,w:'Curved blades break mirror lines.'},
 {lv:4,q:'A regular octagon has lines of symmetry:',o:['4','6','8','16'],a:2,w:'n lines.'},
 {lv:5,open:true,m:3,q:'For a regular pentagon, give the number of lines of symmetry, order and angle of rotational symmetry.',ans:['5 lines (1)','Order 5 (1)','Angle 72° (1)']},
 {lv:5,open:true,m:2,q:'Why is the diagonal of a rectangle not a line of symmetry?',ans:['Folding along it, the halves don\'t match (1)','Because adjacent sides are unequal (1)']}
];

const ONEMIN=['Line of symmetry: fold and match.','Square 4, rectangle 2, equilateral triangle 3, circle ∞.','Regular n-gon: n lines, order n.','Rotational symmetry: angle × order = 360°.','Both, line only, rotation only, neither.','Symmetry in nature and art.'];
const KEYS=[['line of symmetry',/line of symmetry|fold|mirror/i],['counts',/square|rectangle|triangle|circle/i],['rotational',/rotat|turn/i],['order/angle',/order|angle|360/i],['nature/art',/nature|rangoli|art|flower/i]];

/* ---------- lab ---------- */
const N=10;let cells={},mode='v',col='#6a4fb3';
function images(r,c){const m=N-1;const L=[[r,c]];
 if(mode==='v')L.push([r,m-c]);else if(mode==='h')L.push([m-r,c]);else if(mode==='vh'){L.push([r,m-c],[m-r,c],[m-r,m-c])}
 else if(mode==='r4'){L.push([c,m-r],[m-r,m-c],[m-c,r])}
 else if(mode==='d4'){L.push([r,m-c],[m-r,c],[m-r,m-c],[c,r],[m-c,r],[c,m-r],[m-c,m-r])}return L}
function draw(){const u=30,x0=10,y0=10;let s='';for(let r=0;r<N;r++)for(let c=0;c<N;c++){const k=r+','+c;s+=`<rect data-cell="${k}" x="${x0+c*u}" y="${y0+r*u}" width="${u}" height="${u}" fill="${cells[k]||'transparent'}" stroke="${GR}" stroke-width=".5"/>`}
 const M=x0+N*u/2,E=x0+N*u;const L=[];if(mode==='v'||mode==='vh'||mode==='d4')L.push(mir(M,x0,M,E));if(mode==='h'||mode==='vh'||mode==='d4')L.push(mir(x0,M,E,M));if(mode==='d4')L.push(mir(x0,x0,E,E),mir(E,x0,x0,E));if(mode==='r4')L.push(`<circle cx="${M}" cy="${M}" r="5" fill="${OR}"/>`);
 $('#mSvg').innerHTML=s+L.join('');
 const D={v:'1 line of symmetry (vertical).',h:'1 line of symmetry (horizontal).',vh:'2 lines of symmetry, and rotational symmetry of order 2 (180°).',r4:'Rotational symmetry of order 4 (90°) about the centre dot. Lines of symmetry only if your pattern also allows it!',d4:'4 lines of symmetry and rotational symmetry of order 4 — like a rangoli.'};
 $('#mOut').innerHTML=`<p>${D[mode]}</p><p class="note">${Object.keys(cells).length} squares coloured.</p>`}
function paint(k){const [r,c]=k.split(',').map(Number);const on=cells[k]!==col;images(r,c).forEach(([a,b])=>{const kk=a+','+b;if(on)cells[kk]=col;else delete cells[kk]});draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('click',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.cell&&t.closest&&t.closest('#mSvg'))paint(t.dataset.cell)})}
function labShow(){if(!Object.keys(cells).length){[[1,1],[2,2],[2,1],[3,3],[1,4],[4,4]].forEach(([r,c])=>images(r,c).forEach(([a,b])=>cells[a+','+b]=col))}draw()}
function labClick(b){if(b.id==='mClear'){cells={};draw();return true}return false}
function labChange(t){if(t.id==='mMode'){mode=t.value;const old=Object.entries(cells);cells={};old.forEach(([k,v])=>{const [r,c]=k.split(',').map(Number);images(r,c).forEach(([a,b])=>cells[a+','+b]=v)});draw();return true}if(t.id==='mCol'){col=t.value;return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
