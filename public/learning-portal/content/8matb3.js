/* Rai Plus content pack: Class 8 Mathematics (Ganita Prakash Part 2), Chapter 3 – Proportional Reasoning-2 (inverse proportion). */
RP.register({key:'8matb3',cls:'8',subject:'Mathematics',ch:'II-3',title:"Proportional Reasoning-2",color:'#3b6d11',
crumb:"Class 8 Mathematics · Ganita Prakash Part 2",h1:"Part 2 · Chapter 3: Proportional Reasoning-2",sub:"Direct proportion revisited, inverse proportion, telling them apart, graphs of each, work-and-time and speed-and-time problems, and problems with more than two quantities.",heroLabel:"More workers, fewer days",labName:'Inverse proportion lab',
theme:"\n:root{--g:light-dark(#3b6d11,#a8d77d);--g2:light-dark(#eef6e4,#0f1a07);--line:light-dark(#d4e7bf,#2c4219);--bg:light-dark(#ffffff,#0b1206);--card:light-dark(#ffffff,#111a0a);\n--ink:light-dark(#162508,#e6f1da);--mute:light-dark(#4f6439,#b5c9a0);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#2b520b}\n",
labHTML:`  <h2>Inverse proportion lab</h2>
  <p>A wall needs 48 worker-days of work. Change the number of workers: the days needed change so that workers × days stays 48. The rectangle's area (the total work) never changes. The graph shows the curve of inverse proportion; switch to direct proportion to compare.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="ipSvg" viewBox="0 0 460 320" role="img" aria-label="Inverse proportion" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Type<select id="ipT"><option value="i">Inverse: workers and days</option><option value="d">Direct: kg and cost</option></select></label></div>
  <div class="ctrl"><label>x: <b id="ipXv"></b><input type="range" class="ipS" id="ipX" min="1" max="16" value="4"></label></div>
  <div class="ctrl"><button class="btn" id="ipQ">Direct or inverse? quiz</button></div>
  <div class="ctrl" id="ipOpts"></div>
  <div class="box y" id="ipOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3b6d11',LABNAME='Inverse proportion lab',MIND_CENTER='Proportion';
const GN='#3b6d11',OR='#b04a1f',BL='#1f5f8b',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
const r2=v=>+v.toFixed(2);
function heroDraw(){return `<rect x="90" y="40" width="40" height="100" fill="none" stroke="#fff" stroke-width="2.5"/><rect x="170" y="90" width="120" height="50" fill="none" stroke="#fff" stroke-width="2.5"/>`}
const HERO=heroDraw;
const MIND=[['Direct proportion',100,50],['Inverse proportion',420,50],['Which kind?',90,150],['Graphs',430,150],['Work & time',110,250],['Speed & time; many factors',410,250]];

const C=[
{id:'i1',num:'3.1',title:'Direct proportion revisited',
 intro:'3 kg of apples cost ₹360. What do 5 kg cost — and what stays the same?',
 obj:'Recognise direct proportion by a constant ratio.',
 prior:'Part 1 Ch 7 Proportional Reasoning-1.',
 simple:'Two quantities are in direct proportion when both increase (or decrease) by the same factor. Their ratio y ÷ x stays constant. Cost ÷ kg = 360 ÷ 3 = ₹120 per kg, so 5 kg cost ₹600. In symbols: y = kx, where k is the constant.',
 detail:'Check a table: x = 2, 4, 6 and y = 50, 100, 150 → y/x = 25 always, so direct. The graph of direct proportion is a straight line through the origin.',
 real:'Petrol bought and money paid; distance walked at steady speed and time taken.',
 apply:'If 8 notebooks cost ₹224, find the cost of 13.',
 see:{w:520,h:200,f:[
  ['kg: 1, 2, 3, 4',[1,2,3,4].map((k,i)=>lbl(140+i*80,60,`${k} kg`,'font-size="15"')).join('')],
  ['cost: 120, 240, 360, 480',[1,2,3,4].map((k,i)=>lbl(140+i*80,100,`₹${120*k}`,'font-size="15" fill="'+BL+'"')).join('')],
  ['cost ÷ kg = 120 always.',lbl(260,160,'y ÷ x = 120 (constant) → direct','font-size="16" font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Constant ratio.',
 do:{title:'Price table',mat:'Shop price list',steps:['Make tables of quantity vs cost.','Check y ÷ x.'],obs:'Constant for fixed price.',why:'Direct proportion.',lab:false},
 memo:'"Direct: divide gives the same."',
 miscon:['"Any two increasing quantities are proportional." Only if the ratio is constant (age and height are not).'],
 terms:['Direct proportion','Constant of proportionality','y = kx'],
 q:{q:'Which table shows direct proportion?',o:['x 1,2,3 → y 5,10,15','x 1,2,3 → y 6,3,2','x 1,2,3 → y 2,3,4','x 1,2,3 → y 1,4,9'],a:0,why:'y/x = 5.'},
 exam:'Identify direct proportion: 1–2 marks.'},

{id:'i2',num:'3.2',title:'Inverse proportion',
 intro:'4 workers build a wall in 12 days. How long would 6 workers take?',
 obj:'Understand inverse proportion: when one increases, the other decreases so that the product is constant.',
 prior:'3.1.',
 simple:'Two quantities are in inverse proportion when one increases by a factor and the other decreases by the same factor. Their product x × y stays constant. 4 workers × 12 days = 48 worker-days. 6 workers → 48 ÷ 6 = 8 days. In symbols: x × y = k, or y = k ÷ x.',
 detail:'Doubling workers halves the days; tripling workers makes days one-third. This assumes everyone works at the same rate. Example: sharing 60 sweets — 3 children get 20 each; 5 children get 12 each (3 × 20 = 5 × 12 = 60).',
 real:'More people sharing a pizza → smaller slices each.',
 apply:'10 pipes fill a tank in 6 hours. How long would 15 pipes take?',
 see:{w:520,h:220,f:[
  ['4 workers × 12 days.',`<rect x="40" y="40" width="${4*20}" height="${12*12}" fill="${GN}" opacity=".5"/>`+lbl(80,205,'4 × 12 = 48')],
  ['6 workers × 8 days.',`<rect x="200" y="${40+48}" width="${6*20}" height="${8*12}" fill="${BL}" opacity=".5"/>`+lbl(260,205,'6 × 8 = 48')],
  ['Same area: product constant.',`<rect x="380" y="${40+96}" width="${12*10}" height="${4*12}" fill="${OR}" opacity=".5"/>`+lbl(440,205,'12 × 4 = 48')+lbl(260,25,'workers × days = 48 always','font-weight="700"')]]},
 seeNote:'Same area, different shapes.',
 do:{title:'Share counters',mat:'24 counters',steps:['Share among 2, 3, 4, 6, 8 friends.','Record shares.'],obs:'More friends, fewer each; product 24.',why:'Inverse proportion.',lab:true},
 memo:'"Inverse: multiply gives the same."',
 miscon:['"More workers means more days." For inverse proportion, more workers mean fewer days.'],
 terms:['Inverse proportion','x × y = k','Worker-days'],
 q:{q:'5 workers take 8 days. 10 workers take:',o:['16 days','4 days','13 days','8 days'],a:1,why:'40 ÷ 10.'},
 exam:'Inverse proportion problems: 2–3 marks.'},

{id:'i3',num:'3.3',title:'Direct, inverse or neither?',
 intro:'Speed and time for a fixed journey. Age and height. Number of pens and cost. Which is which?',
 obj:'Decide whether two quantities are directly, inversely or not proportional.',
 prior:'3.1, 3.2.',
 simple:'Ask: if one doubles, what happens to the other? Doubles → direct (ratio constant). Halves → inverse (product constant). Neither → not proportional. Examples: pens and cost — direct; speed and time for a fixed distance — inverse; age and height — neither.',
 detail:'Test a table: compute y ÷ x and x × y for each pair. Some relationships are proportional only within limits (more workers stop helping when they get in each other\'s way). Area of a square and its side: side doubles, area quadruples — not proportional.',
 real:'Number of buses and passengers per bus (for a fixed crowd) — inverse.',
 apply:'Classify: distance and petrol used; workers and time; side and perimeter of a square; temperature and time of day.',
 see:{w:520,h:220,f:[
  ['Doubles → direct.',box(20,50,150,70,'Direct',BL,'ratio constant')],
  ['Halves → inverse.',box(185,50,150,70,'Inverse',GN,'product constant')],
  ['Neither.',box(350,50,150,70,'Neither',GR,'e.g. age & height')+lbl(260,170,'test: y ÷ x constant? x × y constant?','font-weight="700"')]]},
 seeNote:'Double-and-see test.',
 do:{title:'Sort the pairs',mat:'Cards with quantity pairs',steps:['Sort into direct, inverse, neither.'],obs:'Reasons differ.',why:'Classification.',lab:true},
 memo:'"Double one: other doubles (direct), halves (inverse), or does its own thing (neither)."',
 miscon:['"If one goes up and the other goes down, it is inverse." Only if the product stays constant.'],
 terms:['Direct','Inverse','Not proportional'],
 q:{q:'Speed and time for a fixed distance are:',o:['direct','inverse','neither','equal'],a:1,why:'Product = distance.'},
 exam:'Classify relationships: 2 marks.'},

{id:'i4',num:'3.4',title:'Graphs of direct and inverse proportion',
 intro:'What does each relationship look like when drawn on a graph?',
 obj:'Recognise graphs of direct and inverse proportion.',
 prior:'3.1–3.3.',
 simple:'Direct proportion (y = kx): a straight line through the origin (0, 0); steeper line → larger k. Inverse proportion (xy = k): a curve that falls steeply at first and then flattens, never touching the axes (a hyperbola).',
 detail:'Reading graphs: from a direct graph through (4, 100), k = 25. From an inverse graph through (4, 12), k = 48, so at x = 8, y = 6. In inverse proportion, x can never be 0 (you can\'t share among 0 people).',
 real:'A taxi fare that is only "per km" (no base fare) gives a straight line through the origin.',
 apply:'Sketch y = 3x and xy = 12 for x = 1 to 6.',
 see:{w:520,h:240,f:[
  ['Axes.',`<line x1="40" y1="210" x2="230" y2="210" stroke="${ink}"/><line x1="40" y1="210" x2="40" y2="30" stroke="${ink}"/><line x1="290" y1="210" x2="480" y2="210" stroke="${ink}"/><line x1="290" y1="210" x2="290" y2="30" stroke="${ink}"/>`],
  ['Direct: straight line through origin.',`<line x1="40" y1="210" x2="220" y2="40" stroke="${BL}" stroke-width="3"/>`+lbl(135,232,'direct: y = kx','fill="'+BL+'"')],
  ['Inverse: falling curve.',`<path d="${[...Array(30)].map((_,i)=>{const x=1+i*.4;return (i?'L':'M')+(290+x*14).toFixed(1)+' '+(210-48/x*3.2).toFixed(1)}).join(' ')}" fill="none" stroke="${GN}" stroke-width="3"/>`+lbl(385,232,'inverse: xy = k','fill="'+GN+'"')]]},
 seeNote:'Line vs curve.',
 do:{title:'Plot both',mat:'Graph paper',steps:['Plot (x, 5x) and (x, 24/x) for x = 1–8.'],obs:'Line and curve.',why:'Graph shapes.',lab:true},
 memo:'"Direct: line from zero. Inverse: sliding curve."',
 miscon:['"Any straight line is direct proportion." It must pass through the origin.'],
 terms:['Graph','Origin','Hyperbola (curve)'],
 q:{q:'The graph of direct proportion is:',o:['a curve','a straight line through the origin','a circle','a horizontal line'],a:1,why:'y = kx.'},
 exam:'Identify graphs: 1–2 marks.'},

{id:'i5',num:'3.5',title:'Work and time problems',
 intro:'If 12 people can harvest a field in 10 days, how many people are needed to finish in 6 days?',
 obj:'Solve work-and-time problems using inverse proportion.',
 prior:'3.2.',
 simple:'Total work = workers × days (constant). 12 × 10 = 120 person-days. For 6 days: 120 ÷ 6 = 20 people. Unitary method: 1 person would take 120 days.',
 detail:'Rates add: if A alone finishes a job in 6 days, A does 1/6 per day; B alone in 3 days does 1/3 per day; together 1/6 + 1/3 = 1/2 per day → 2 days. Pipes filling and emptying tanks work the same way.',
 real:'Contractors plan how many labourers to hire to finish a building on time.',
 apply:'A job takes 15 workers 8 days. After 2 days, 3 workers leave. How many more days will it take?',
 see:{w:520,h:200,f:[
  ['12 people × 10 days = 120.',lbl(260,50,'12 × 10 = 120 person-days','font-size="17"')],
  ['Finish in 6 days?',lbl(260,105,'120 ÷ 6 = 20 people','font-size="17" fill="'+GN+'"')],
  ['Rates add.',lbl(260,160,'A: 1/6 per day, B: 1/3 per day → together 1/2 → 2 days','font-size="14" font-weight="700"')]]},
 seeNote:'Total work stays the same.',
 do:{title:'Class task',mat:'Stack of 60 papers to sort',steps:['Time 1 student, then 2, then 4.'],obs:'Time roughly halves.',why:'Inverse proportion (approx).',lab:false},
 memo:'"Work = workers × days."',
 miscon:['"Together time = sum of times." Add rates, not times.'],
 terms:['Person-days','Rate of work','Unitary method'],
 q:{q:'A does a job in 4 days, B in 12. Together:',o:['16 days','8 days','3 days','6 days'],a:2,why:'1/4 + 1/12 = 1/3.'},
 exam:'Work and time: 3 marks.'},

{id:'i6',num:'3.6',title:'Speed, time and problems with many quantities',
 intro:'A bus takes 5 hours at 60 km/h. How long at 75 km/h? And what if more things change at once?',
 obj:'Solve speed-time problems and problems involving more than two quantities.',
 prior:'3.2–3.5.',
 simple:'For a fixed distance, speed × time = distance (constant) → inverse. 60 × 5 = 300 km; at 75 km/h: 300 ÷ 75 = 4 hours. With several quantities, handle one at a time: 6 machines make 480 items in 4 hours. How many items do 9 machines make in 5 hours? Per machine-hour: 480 ÷ (6 × 4) = 20; so 9 × 5 × 20 = 900.',
 detail:'Decide for each pair whether it is direct or inverse while keeping the others fixed: items ∝ machines (direct), items ∝ hours (direct); days ∝ 1/workers (inverse). Unit rates ("per machine per hour", "per person per day") make such problems straightforward.',
 real:'Mess cooks estimate rice: 50 students for 6 days need 150 kg; 75 students for 4 days need 150 kg too!',
 apply:'8 taps fill 4 tanks in 10 hours. How long do 5 taps take to fill 2 tanks?',
 see:{w:520,h:220,f:[
  ['60 km/h × 5 h = 300 km.',lbl(260,40,'60 × 5 = 300 km','font-size="17"')],
  ['75 km/h → 4 h.',lbl(260,85,'300 ÷ 75 = 4 h','font-size="17" fill="'+GN+'"')],
  ['Many quantities: use a unit rate.',lbl(260,145,'480 ÷ (6 × 4) = 20 items per machine-hour','font-size="14"')+lbl(260,180,'9 × 5 × 20 = 900 items','font-size="16" font-weight="700" fill="'+BL+'"')]]},
 seeNote:'Unit rates tame many-variable problems.',
 do:{title:'Journey planner',mat:'Map distances',steps:['For a 240 km trip, list times at 40, 60, 80 km/h.'],obs:'6, 4, 3 hours.',why:'Inverse proportion.',lab:false},
 memo:'"Speed × time = distance; find the unit rate."',
 miscon:['"Twice the speed takes twice as long." It takes half as long.'],
 terms:['Speed','Unit rate','Compound proportion'],
 q:{q:'A trip takes 3 h at 80 km/h. At 60 km/h it takes:',o:['4 h','2.25 h','5 h','3.5 h'],a:0,why:'240 ÷ 60.'},
 exam:'Speed-time and compound problems: 3–5 marks.'}
];

const CARDS=[['Direct','y ÷ x constant; y = kx.'],['Inverse','x × y constant; y = k ÷ x.'],['Test','Double x: y doubles (direct) or halves (inverse).'],['Neither','e.g. age and height.'],['Direct graph','Straight line through origin.'],['Inverse graph','Falling curve; never touches axes.'],['Work','workers × days = constant.'],['Rates add','1/a + 1/b per day.'],['Speed × time','= distance (fixed) → inverse.'],['Many quantities','Use a unit rate.']];

const Q=[
 {lv:1,q:'In inverse proportion, what stays constant?',o:['x + y','x − y','x × y','x ÷ y'],a:2,w:'Product.'},
 {lv:1,q:'Number of pens and total cost (same price) are:',o:['direct','inverse','neither'],a:0,w:'Ratio constant.'},
 {lv:1,q:'6 workers take 10 days. 3 workers take:',o:['5 days','20 days','13 days','30 days'],a:1,w:'60 ÷ 3.'},
 {lv:2,q:'Speed 50 km/h for 6 h. Same distance at 75 km/h:',o:['9 h','4 h','5 h','3 h'],a:1,w:'300 ÷ 75.'},
 {lv:2,q:'x: 2, 4, 8; y: 24, 12, 6. Relationship:',o:['direct','inverse','neither'],a:1,w:'Product 48.'},
 {lv:2,q:'Side of a square and its area are:',o:['direct','inverse','neither'],a:2,w:'Area ∝ side².'},
 {lv:3,q:'A alone: 10 days; B alone: 15 days. Together:',o:['25 days','12.5 days','6 days','5 days'],a:2,w:'1/10 + 1/15 = 1/6.'},
 {lv:3,q:'Food for 40 people lasts 15 days. For 60 people:',o:['10 days','22.5 days','20 days','12 days'],a:0,w:'600 ÷ 60.'},
 {lv:4,q:'5 machines make 200 items in 4 h. 8 machines in 5 h make:',o:['400','320','250','500'],a:0,w:'10 per machine-hour.'},
 {lv:4,q:'The graph of xy = 36 passes through:',o:['(4, 9)','(4, 32)','(6, 30)','(0, 36)'],a:0,w:'4 × 9.'},
 {lv:5,open:true,m:3,q:'15 workers can build a wall in 12 days. How many workers are needed to build it in 9 days? Explain why this is inverse proportion.',ans:['Total work = 15 × 12 = 180 worker-days (1)','180 ÷ 9 = 20 workers (1)','More workers → fewer days; product constant → inverse (1)']},
 {lv:5,open:true,m:5,q:'12 taps fill 6 tanks in 8 hours. How long will 8 taps take to fill 4 tanks?',ans:['Tap-hours per tank = 12 × 8 ÷ 6 = 16 (1)','4 tanks need 64 tap-hours (1)','With 8 taps: 64 ÷ 8 (1)','= 8 hours (1)','State assumptions: equal taps, same rate (1)']}
];

const ONEMIN=['Direct: constant ratio.','Inverse: constant product.','Double-and-see test.','Graphs: line vs curve.','Work and time; rates add.','Speed-time; many quantities via unit rates.'];
const KEYS=[['direct',/direct/i],['inverse',/inverse/i],['product',/product|constant/i],['graph',/graph|curve|line/i],['work',/work|worker/i],['speed',/speed|unit rate/i]];

/* ---------- lab ---------- */
let type='i',X=4,quiz=null,wired=false;
const PAIRS=[['Number of workers and days to finish a job','i'],['Kg of rice and its cost','d'],['Speed and time for a fixed distance','i'],['Distance and petrol used','d'],['Number of children sharing 60 sweets and sweets each','i'],['Hours worked and wages (fixed hourly rate)','d'],['Number of taps and time to fill a tank','i'],['Side of a square and its perimeter','d']];
function draw(){const k=type==='i'?48:25;const Y=type==='i'?k/X:k*X;let s='';
 const u=type==='i'?12:10;const rw=type==='i'?X*u:X*u,rh=type==='i'?Math.min(220,Y*4.5):Math.min(220,Y/3);s+=`<rect x="20" y="${260-rh}" width="${Math.min(rw,200)}" height="${rh}" fill="${type==='i'?GN:BL}" opacity=".5" stroke="${type==='i'?GN:BL}"/>`;
 s+=T(20+Math.min(rw,200)/2,278,type==='i'?`${X} workers`:`${X} kg`,'font-size="12"')+T(130,30,type==='i'?`${X} × ${r2(Y)} = 48`:`${X} kg → ₹${Y}`,'font-size="15" font-weight="700"');
 const gx0=250,gy0=260,gw=190,gh=220;s+=`<line x1="${gx0}" y1="${gy0}" x2="${gx0+gw}" y2="${gy0}" stroke="${ink}"/><line x1="${gx0}" y1="${gy0}" x2="${gx0}" y2="${gy0-gh}" stroke="${ink}"/>`;
 const ymax=type==='i'?48:400;const GX=x=>gx0+x*gw/16,GY=y=>gy0-Math.min(y,ymax)*gh/ymax;let path='';for(let x=1;x<=16;x+=.25){const y=type==='i'?k/x:k*x;path+=(x===1?'M':'L')+GX(x).toFixed(1)+' '+GY(y).toFixed(1)}
 s+=`<path d="${path}" fill="none" stroke="${type==='i'?GN:BL}" stroke-width="2.5"/>`+(type==='d'?`<line x1="${gx0}" y1="${gy0}" x2="${GX(1)}" y2="${GY(25)}" stroke="${BL}" stroke-width="2.5"/>`:'')+`<circle cx="${GX(X)}" cy="${GY(Y)}" r="6" fill="${OR}"/>`+T(gx0+gw/2,gy0+18,type==='i'?'workers →':'kg →','font-size="11"')+T(gx0-10,gy0-gh-6,type==='i'?'days':'₹','font-size="11"');
 $('#ipSvg').innerHTML=s;$('#ipXv').textContent=X;
 if(!quiz)$('#ipOut').innerHTML=type==='i'?`<p>${X} workers need <b>${r2(Y)} days</b>. Workers × days = ${X} × ${r2(Y)} = 48 (constant). ${X>1?`Compared with 1 worker, the days are divided by ${X}.`:''}</p><p>The rectangle's area — the total work — never changes; only its shape does.</p>`:`<p>${X} kg cost <b>₹${Y}</b>. Cost ÷ kg = ${Y} ÷ ${X} = 25 (constant). The graph is a straight line through the origin.</p>`}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='ipX'){X=+e.target.value;quiz=null;draw()}});document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pk]');if(!b||!quiz)return;const ok=b.dataset.pk===quiz[1];$('#ipOut').innerHTML=ok?`<p class="fb ok">Correct — ${quiz[1]==='i'?'inverse: their product stays constant.':'direct: their ratio stays constant.'}</p>`:`<p class="fb no">Not quite — it is ${quiz[1]==='i'?'inverse (product constant)':'direct (ratio constant)'}.</p>`;$('#ipOpts').innerHTML='';quiz=null})}
function labClick(b){if(b.id==='ipQ'){quiz=PAIRS[Math.floor(Math.random()*PAIRS.length)];$('#ipOut').innerHTML=`<p><b>Quiz:</b> ${quiz[0]}?</p>`;$('#ipOpts').innerHTML='<button class="btn" type="button" data-pk="d">Direct</button> <button class="btn" type="button" data-pk="i">Inverse</button>';return true}return false}
function labChange(t){if(t.id==='ipT'){type=t.value;quiz=null;$('#ipOpts').innerHTML='';draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
