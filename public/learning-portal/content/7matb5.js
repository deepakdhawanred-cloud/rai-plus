/* Rai Plus content pack: Class 7 Mathematics (Ganita Prakash Part 2), Chapter 5 – Connecting the Dots (data handling). */
RP.register({key:'7matb5',cls:'7',subject:'Mathematics',ch:'II-5',title:"Connecting the Dots…",color:'#b04a1f',
crumb:"Class 7 Mathematics · Ganita Prakash Part 2",h1:"Part 2 · Chapter 5: Connecting the Dots…",sub:"Statistical questions and statements, the mean as a fair share, the median, outliers, choosing mean or median, and visualising data honestly.",heroLabel:"A dot plot with its mean and median",labName:'Mean–median lab',
theme:"\n:root{--g:light-dark(#b04a1f,#f2a77f);--g2:light-dark(#fbefe9,#21110a);--line:light-dark(#f0d6ca,#47271a);--bg:light-dark(#ffffff,#130a06);--card:light-dark(#ffffff,#1c100a);\n--ink:light-dark(#2a1309,#f7e6dd);--mute:light-dark(#6e4f42,#d2b4a6);--y:light-dark(#1f5f8b,#8fc2e6);--y2:light-dark(#e8f1f8,#0b1622);--hd:#8a3815}\n",
labHTML:`  <h2>Mean–median lab</h2>
  <p>Type a data set (numbers separated by commas) or pick an example. The dot plot shows the mean (balance point, orange) and the median (middle value, blue). Add an outlier and watch which one moves more.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="mSvg" viewBox="0 0 460 320" role="img" aria-label="Dot plot with mean and median" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Data<input id="mD" type="text" value="6, 2, 9, 5, 4, 6, 3, 5" style="width:100%"></label></div>
  <div class="ctrl"><button class="btn" id="mGo">Plot</button> <button class="btn" id="mOut1">Add outlier (40)</button> <button class="btn" id="mRm">Remove largest</button></div>
  <div class="ctrl"><label>Example<select id="mEx"><option value="">— choose —</option><option value="6, 2, 9, 5, 4, 6, 3, 5">Ball bounces</option><option value="2, 7, 9, 4, 3">Flowers bloomed (5 days)</option><option value="0, 1, 0, 4, 8, 2, 1, 0, 3, 25, 2">Pets at home</option><option value="138, 142, 145, 140, 151, 136, 147, 144, 139">Heights (cm)</option></select></label></div>
  <div class="ctrl"><button class="btn" id="mQ">Quiz</button> <input id="mAns" type="number" step="any" style="width:5em"> <button class="btn" id="mC">Check</button></div>
  <div class="box y" id="mOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#b04a1f',LABNAME='Mean–median lab',MIND_CENTER='Data & averages';
const OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const r2=v=>Math.round(v*100)/100;
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const median=a=>{const b=[...a].sort((x,y)=>x-y),n=b.length;return n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2};
function dots(x0,x1,y,data,lo,hi,c=GR,step=1){const X=v=>x0+(v-lo)*(x1-x0)/(hi-lo);let s=`<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${ink}" stroke-width="1.5"/>`;for(let v=lo;v<=hi;v+=step)s+=`<line x1="${X(v)}" y1="${y-3}" x2="${X(v)}" y2="${y+3}" stroke="${ink}"/>`+T(X(v),y+16,String(v),'font-size="10"');const cnt={};data.forEach(v=>{cnt[v]=(cnt[v]||0)+1;s+=`<circle cx="${X(v)}" cy="${y-10-(cnt[v]-1)*14}" r="6" fill="${c}"/>`});return {s,X}}
function heroDraw(){let s='<line x1="40" y1="140" x2="340" y2="140" stroke="#fff" stroke-width="2"/>';[[80,1],[120,2],[160,3],[200,2],[240,1],[300,1]].forEach(([x,n])=>{for(let k=0;k<n;k++)s+=`<circle cx="${x}" cy="${125-k*16}" r="6" fill="#fff"/>`});return s+'<line x1="175" y1="50" x2="175" y2="145" stroke="#fff" stroke-dasharray="5 4" stroke-width="2"/>'}
const HERO=heroDraw;
const MIND=[['Statistical statements',100,50],['Mean',420,50],['Median',90,150],['Outliers',430,150],['Mean or median?',110,250],['Graphs',410,250]];

const C=[
{id:'m1',num:'5.1',title:'Questions and statistical statements',
 intro:'"Students in our class sleep about 8 hours" — how could you check whether that is true?',
 obj:'Recognise statistical questions and statements about data.',
 prior:'Class 6 data handling: tally, pictographs, bar graphs.',
 simple:'A statistical question expects answers that vary and needs data to answer: "How long do students in our class sleep?" A statistical statement summarises what data shows: "Most students sleep between 7 and 9 hours." Compare: "How tall am I?" has one answer — not statistical.',
 detail:'Steps of a data investigation: ask a question → collect data → organise it (table, tally, sorted list) → summarise (averages, graphs) → make careful statements. A good statement says only as much as the data supports: "In this survey of 30 students…" rather than "All children…".',
 real:'Cricket commentary is full of statistical statements: "He scores more in the second innings."',
 apply:'Is "How many pets does each student in our class have?" a statistical question? Why?',
 see:{w:520,h:220,f:[
  ['Ask a question.',`<rect x="10" y="80" width="90" height="50" rx="8" fill="${BL}" fill-opacity=".15" stroke="${BL}"/>`+lbl(55,110,'Ask')],
  ['Collect → organise → summarise.',[['Collect',115],['Organise',220],['Summarise',325]].map(([t,x])=>`<rect x="${x}" y="80" width="90" height="50" rx="8" fill="${GN}" fill-opacity=".15" stroke="${GN}"/>`+lbl(x+45,110,t)).join('')],
  ['Make a careful statement.',`<rect x="430" y="80" width="85" height="50" rx="8" fill="${OR}" fill-opacity=".15" stroke="${OR}"/>`+lbl(472,110,'State')+lbl(260,175,'say only what the data shows','font-weight="700"')]]},
 seeNote:'Data first, claims second.',
 do:{title:'Class survey',mat:'Notebook',steps:['Ask: "How many hours did you sleep last night?"','Record every answer.'],obs:'Answers vary.',why:'Statistical question.',lab:false},
 memo:'"Varied answers → statistical question."',
 miscon:['"Any question with a number is statistical." Only if answers vary across people or times.'],
 terms:['Data','Statistical question','Statistical statement','Survey'],
 q:{q:'Which is a statistical question?',o:['What is my age?','How tall is our classroom door?','How many books did each student read this month?','What is 7 × 8?'],a:2,why:'Answers vary.'},
 exam:'Identify statistical questions: 1 mark.'},

{id:'m2',num:'5.2',title:'The mean: a fair share',
 intro:'Five friends have 2, 7, 9, 4 and 3 laddoos. If they share equally, how many does each get?',
 obj:'Find the mean and understand it as a fair share and a balance point.',
 prior:'5.1; division.',
 simple:'Mean (average) = sum of all values ÷ number of values. Laddoos: (2 + 7 + 9 + 4 + 3) ÷ 5 = 25 ÷ 5 = 5 each. The mean is what everyone would get if the total were shared equally.',
 detail:'Balance point: on a dot plot, the mean is where the data would balance like a see-saw — the distances of values above the mean exactly cancel those below. The mean need not be one of the data values, and need not be a whole number: (6 + 2 + 9 + 5 + 4 + 6 + 3 + 5) ÷ 8 = 40 ÷ 8 = 5.',
 real:'A batter\'s average in cricket is total runs ÷ number of times out.',
 apply:'Find the mean of 12, 15, 9, 18, 16.',
 see:{w:520,h:220,f:[
  ['Unequal piles: 2, 7, 9, 4, 3.',[2,7,9,4,3].map((n,k)=>[...Array(n)].map((_,j)=>`<rect x="${50+k*90}" y="${180-j*16}" width="40" height="14" rx="3" fill="${OR}" opacity=".7"/>`).join('')).join('')],
  ['Share equally…',`<line x1="30" y1="${180-4*16}" x2="490" y2="${180-4*16}" stroke="${BL}" stroke-dasharray="6 4" stroke-width="2"/>`],
  ['…5 each: the mean.',lbl(260,30,'(2+7+9+4+3) ÷ 5 = 5','font-size="17" font-weight="700"')]]},
 seeNote:'Level the piles.',
 do:{title:'Level the towers',mat:'Unifix cubes',steps:['Build towers of 2, 7, 9, 4, 3.','Move cubes until all are equal.'],obs:'5 each.',why:'Mean as fair share.',lab:true},
 memo:'"Add them all, divide by how many."',
 miscon:['"The mean must be one of the values." It can be any number.'],
 terms:['Mean (average)','Sum','Fair share','Balance point'],
 q:{q:'Mean of 4, 8, 6, 2:',o:['4','5','6','20'],a:1,why:'20 ÷ 4.'},
 exam:'Calculate mean: 2 marks.'},

{id:'m3',num:'5.3',title:'The median: the middle value',
 intro:'Line up nine students by height. Who is in the middle?',
 obj:'Find the median of a data set with odd or even count.',
 prior:'5.2; ordering numbers.',
 simple:'Median = the middle value when data is arranged in order. Odd count: 3, 5, 6, 8, 12 → median 6. Even count: take the mean of the two middle values: 2, 4, 7, 9 → (4 + 7) ÷ 2 = 5.5. Half the data is at or below the median and half at or above.',
 detail:'Position: for n values in order, the median is the ((n + 1) ÷ 2)th value. 21 values → 11th value. Always sort first! Unsorted onion prices 25, 24, 26, 28, 30, 35, 39, 43, 49, 56, 59, 44 sort to 24 … 59; 12 values → mean of the 6th and 7th (35 and 39) = 37.',
 real:'House prices and salaries are often reported as medians.',
 apply:'Find the median of 7, 3, 9, 1, 5, 11.',
 see:{w:520,h:220,f:[
  ['Unsorted: 8, 3, 12, 6, 5.',[8,3,12,6,5].map((v,k)=>lbl(80+k*90,50,String(v),'font-size="20"')).join('')],
  ['Sorted: 3, 5, 6, 8, 12.',[3,5,6,8,12].map((v,k)=>lbl(80+k*90,110,String(v),'font-size="20"')).join('')],
  ['Middle value = 6.',`<circle cx="260" cy="104" r="20" fill="none" stroke="${BL}" stroke-width="3"/>`+lbl(260,175,'median = 6','font-size="18" font-weight="700" fill="'+BL+'"')]]},
 seeNote:'Sort first, then find the middle.',
 do:{title:'Human median',mat:'9 volunteers',steps:['Line up by height.','Find the middle person.'],obs:'Median height.',why:'Middle value.',lab:false},
 memo:'"Sort, then middle."',
 miscon:['"Median = middle of the list as written." Sort first.'],
 terms:['Median','Ascending order','Middle value'],
 q:{q:'Median of 10, 2, 8, 4:',o:['6','5','8','4'],a:0,why:'(4 + 8) ÷ 2.'},
 exam:'Find median: 2 marks.'},

{id:'m4',num:'5.4',title:'Outliers',
 intro:'Ten friends read 2–8 books each, but one read 40. What happens to the average?',
 obj:'Identify outliers and see their effect on mean and median.',
 prior:'5.2, 5.3.',
 simple:'An outlier is a value far away from most of the data. Data 5, 6, 7, 8 has mean 6.5 and median 6.5. Add an outlier 50: 5, 6, 7, 8, 50 → mean 76 ÷ 5 = 15.2, but median 7. The mean jumps; the median hardly moves.',
 detail:'Why? The mean uses every value\'s size, so one huge value pulls it. The median only cares about position. Outliers may be genuine (one avid reader) or errors (someone typed 400 for 40) — always check them.',
 real:'One crorepati in a village raises the "average income" a lot but not the median.',
 apply:'Data: 3, 4, 4, 5, 34. Find mean and median. Which better describes a typical value?',
 see:{w:520,h:220,f:[
  ['5, 6, 7, 8: mean = median = 6.5.',dots(40,480,170,[5,6,7,8],0,50,GR,5).s],
  ['Add outlier 50.',`<circle cx="${dots(40,480,170,[],0,50).X(50)}" cy="160" r="6" fill="${OR}"/>`],
  ['Mean 15.2 jumps; median 7 stays.',`<line x1="${dots(40,480,170,[],0,50).X(15.2)}" y1="60" x2="${dots(40,480,170,[],0,50).X(15.2)}" y2="170" stroke="${OR}" stroke-width="2" stroke-dasharray="5 4"/><line x1="${dots(40,480,170,[],0,50).X(7)}" y1="60" x2="${dots(40,480,170,[],0,50).X(7)}" y2="170" stroke="${BL}" stroke-width="2"/>`+lbl(200,50,'mean 15.2','fill="'+OR+'"')+lbl(80,50,'median 7','fill="'+BL+'"')]]},
 seeNote:'Outliers pull the mean.',
 do:{title:'Outlier test',mat:'Lab on this page',steps:['Plot a data set.','Add an outlier.','Compare how far mean and median move.'],obs:'Mean moves much more.',why:'Mean uses every value.',lab:true},
 memo:'"Outliers pull the mean, not the median."',
 miscon:['"Outliers should always be deleted." Check first; they may be real.'],
 terms:['Outlier','Spread','Typical value'],
 q:{q:'Adding a very large value usually changes which more?',o:['median','mean','both equally','neither'],a:1,why:'Mean uses size.'},
 exam:'Effect of outlier: 2–3 marks.'},

{id:'m5',num:'5.5',title:'Mean or median?',
 intro:'Which average should a news report use for "typical pocket money"?',
 obj:'Choose an appropriate representative value and justify it.',
 prior:'5.4.',
 simple:'Use the mean when data is fairly even without extreme values and you care about the total or fair share (marks, rainfall, runs). Use the median when there are outliers or the data is lopsided (incomes, house prices, pets per home). If mean and median are close, either describes the data well.',
 detail:'Mean × number of values = total: if 30 students average 42 marks, the total is 1260. You can\'t get a total from the median. Comparing groups: compare means or medians, and also look at spread (smallest to largest).',
 real:'Where are onions costlier — Yahapur or Wahapur? Compare the median or mean monthly price for each town.',
 apply:'Pets per home: 0, 1, 0, 4, 8, 2, 1, 0, 3, 25, 2. Which average is better, and why?',
 see:{w:520,h:220,f:[
  ['Even data, no outliers → mean.',lbl(130,60,'marks, rainfall, runs','font-size="14"')+lbl(130,90,'→ MEAN','font-size="18" font-weight="700" fill="'+OR+'"')],
  ['Outliers or lopsided → median.',lbl(390,60,'income, house prices','font-size="14"')+lbl(390,90,'→ MEDIAN','font-size="18" font-weight="700" fill="'+BL+'"')],
  ['Close values → either works.',lbl(260,170,'mean ≈ median → either','font-size="16" font-weight="700"')]]},
 seeNote:'Pick by the shape of the data.',
 do:{title:'Debate',mat:'Data cards',steps:['Each group gets a data set and must argue for mean or median.'],obs:'Reasons depend on outliers.',why:'Representative value.',lab:false},
 memo:'"Outliers? Choose the median."',
 miscon:['"The mean is always the best average." Not with outliers.'],
 terms:['Representative value','Lopsided data','Total from mean'],
 q:{q:'For typical family income in a town, use:',o:['mean','median','largest value','smallest value'],a:1,why:'Outliers.'},
 exam:'Justify choice of average: 3 marks.'},

{id:'m6',num:'5.6',title:'Visualising data honestly',
 intro:'Two bar graphs show the same data, but one makes the difference look huge. How?',
 obj:'Draw and read dot plots and bar graphs, and spot misleading graphs.',
 prior:'5.1–5.5; Class 6 bar graphs.',
 simple:'Dot plots show every value as a dot above a number line — great for small data sets and spotting outliers. Bar graphs compare categories. Always label axes, use equal scale steps, and start the value axis at 0 for bar graphs.',
 detail:'Misleading tricks: a value axis starting at 90 instead of 0 makes 95 vs 98 look like a big gap; unequal steps; missing labels; using only selected data. Be a data detective: read the axes and scale before believing the picture.',
 real:'Advertisements sometimes use cut-off axes to exaggerate differences.',
 apply:'A bar graph of 52 and 55 starts its axis at 50. What impression does it give?',
 see:{w:520,h:240,f:[
  ['Honest: axis from 0.',`<line x1="40" y1="200" x2="220" y2="200" stroke="${ink}"/><line x1="40" y1="200" x2="40" y2="40" stroke="${ink}"/><rect x="70" y="${200-95*1.5}" width="40" height="${95*1.5}" fill="${BL}" opacity=".7"/><rect x="140" y="${200-98*1.5}" width="40" height="${98*1.5}" fill="${OR}" opacity=".7"/>`+lbl(130,225,'starts at 0: small gap')],
  ['Misleading: axis from 90.',`<line x1="300" y1="200" x2="480" y2="200" stroke="${ink}"/><line x1="300" y1="200" x2="300" y2="40" stroke="${ink}"/><rect x="330" y="${200-5*18}" width="40" height="${5*18}" fill="${BL}" opacity=".7"/><rect x="400" y="${200-8*18}" width="40" height="${8*18}" fill="${OR}" opacity=".7"/>`+lbl(390,225,'starts at 90: looks huge','fill="'+OR+'"')],
  ['Same data: 95 and 98.',lbl(260,25,'Same data: 95 vs 98','font-size="15" font-weight="700"')]]},
 seeNote:'Check the axis.',
 do:{title:'Spot the trick',mat:'Newspaper or ad graphs',steps:['Find a graph.','Check axes, scale and labels.'],obs:'Some exaggerate.',why:'Critical reading.',lab:false},
 memo:'"Read the axis before the bars."',
 miscon:['"A taller bar always means a big difference." Check where the axis starts.'],
 terms:['Dot plot','Bar graph','Scale','Misleading graph'],
 q:{q:'A bar graph is most honest when the value axis:',o:['starts at 0','starts near the smallest value','has no labels','has unequal steps'],a:0,why:'True proportions.'},
 exam:'Read/draw graphs; spot misleading: 2–3 marks.'}
];

const CARDS=[['Statistical question','Expects varied answers; needs data.'],['Statistical statement','Summarises data carefully.'],['Mean','Sum ÷ number of values.'],['Fair share','Mean = equal share of total.'],['Balance point','Mean balances the dot plot.'],['Median','Middle of sorted data.'],['Even count','Median = mean of two middle values.'],['Outlier','Far from the rest; pulls the mean.'],['Which average?','Outliers → median.'],['Honest graphs','Bar axis from 0; equal steps.']];

const Q=[
 {lv:1,q:'Mean of 3, 5, 7:',o:['5','15','7','3'],a:0,w:'15 ÷ 3.'},
 {lv:1,q:'Median of 9, 1, 5:',o:['1','5','9','15'],a:1,w:'Sort: 1, 5, 9.'},
 {lv:1,q:'An outlier is a value that is:',o:['the middle','far from the rest','the most common','zero'],a:1,w:'Definition.'},
 {lv:2,q:'Mean of 6, 2, 9, 5, 4, 6, 3, 5:',o:['5','6','4.5','40'],a:0,w:'40 ÷ 8.'},
 {lv:2,q:'Median of 2, 9, 4, 7:',o:['5.5','4','7','6'],a:0,w:'(4 + 7) ÷ 2.'},
 {lv:2,q:'Mean of 4 values is 10. Total:',o:['14','40','2.5','10'],a:1,w:'Mean × count.'},
 {lv:3,q:'Data 5, 6, 7, 8, 50: median is',o:['7','15.2','6.5','50'],a:0,w:'Middle.'},
 {lv:3,q:'Mean of 5, 6, 7, 8, 50:',o:['15.2','7','13','76'],a:0,w:'76 ÷ 5.'},
 {lv:4,q:'Best average for house prices in a city with a few mansions:',o:['mean','median','largest','sum'],a:1,w:'Outliers.'},
 {lv:4,q:'A bar graph axis starts at 90. It may:',o:['be more accurate','exaggerate differences','hide the data','show the median'],a:1,w:'Misleading.'},
 {lv:5,open:true,m:3,q:'Pets: 0, 1, 0, 4, 8, 2, 1, 0, 3, 25, 2. Find the mean and median. Which is more representative?',ans:['Mean = 46 ÷ 11 ≈ 4.2 (1)','Sorted: 0,0,0,1,1,2,2,3,4,8,25; median = 2 (1)','Median, because 25 is an outlier pulling the mean (1)']},
 {lv:5,open:true,m:3,q:'The mean of 5 numbers is 12. Four of them are 10, 14, 9, 15. Find the fifth.',ans:['Total = 5 × 12 = 60 (1)','Sum of four = 48 (1)','Fifth = 12 (1)']}
];

const ONEMIN=['Statistical questions and statements.','Mean: fair share, balance point.','Median: sort, find the middle.','Outliers pull the mean.','Choose mean or median by data shape.','Honest graphs: check axes.'];
const KEYS=[['statistical',/statistic/i],['mean',/mean|average/i],['median',/median|middle/i],['outlier',/outlier/i],['choose',/representative|choose|which average/i],['graph',/graph|dot plot|axis/i]];

/* ---------- lab ---------- */
let data=[6,2,9,5,4,6,3,5],quiz=null;
function parse(t){return t.split(/[,\s]+/).filter(Boolean).map(Number).filter(v=>isFinite(v))}
function nice(lo,hi){let st=1;const r=hi-lo;if(r>20)st=5;if(r>60)st=10;if(r>150)st=20;const L=Math.floor(lo/st)*st,H=Math.ceil(hi/st)*st;return [L,H===L?L+st:H,st]}
function draw(){if(!data.length){$('#mSvg').innerHTML='';$('#mOut').innerHTML='<p class="fb no">Enter some numbers.</p>';return}
 const mn=mean(data),md=median(data);const [lo,hi,st]=nice(Math.min(...data),Math.max(...data));
 const d=dots(30,430,250,data.map(v=>Math.round(v)===v?v:r2(v)),lo,hi,GR,st);let s=d.s;
 s+=`<line x1="${d.X(mn)}" y1="40" x2="${d.X(mn)}" y2="255" stroke="${OR}" stroke-width="2.5" stroke-dasharray="6 4"/><path d="M${d.X(mn)-10} 285 L${d.X(mn)} 268 L${d.X(mn)+10} 285 Z" fill="${OR}"/>`;
 s+=`<line x1="${d.X(md)}" y1="40" x2="${d.X(md)}" y2="255" stroke="${BL}" stroke-width="2.5"/>`;
 const close=Math.abs(d.X(mn)-d.X(md))<60;s+=T(d.X(mn),30,'mean '+r2(mn),'font-size="12" font-weight="700" fill="'+OR+'"')+T(d.X(md),close?14:30,'median '+r2(md),'font-size="12" font-weight="700" fill="'+BL+'"');
 s+=T(230,305,'▲ balance point (mean)','font-size="10" fill="'+OR+'"');$('#mSvg').innerHTML=s;const b=[...data].sort((x,y)=>x-y);
 $('#mOut').innerHTML=`<p>n = ${data.length}; sum = ${r2(data.reduce((a,c)=>a+c,0))}. <b style="color:${OR}">Mean = ${r2(mn)}</b>; <b style="color:${BL}">Median = ${r2(md)}</b>.</p><p>Sorted: ${b.join(', ')}</p><p>${Math.abs(mn-md)>Math.max(1,(hi-lo)*.12)?'Mean and median are far apart — an outlier or lopsided data. The median is the better typical value here.':'Mean and median are close — either describes the data well.'}</p>`}
function labShow(){draw()}
function labInit(){}
function labClick(b){if(b.id==='mGo'){data=parse($('#mD').value).slice(0,40);draw();return true}
 if(b.id==='mOut1'){data=[...data,40];$('#mD').value=data.join(', ');draw();return true}
 if(b.id==='mRm'){if(data.length>1){const i=data.indexOf(Math.max(...data));data.splice(i,1);$('#mD').value=data.join(', ');draw()}return true}
 if(b.id==='mQ'){const n=Math.random()<.5?5:6;const a=[...Array(n)].map(()=>Math.floor(Math.random()*15)+1);const t=Math.random()<.5;const val=t?mean(a):median(a);
  if(t&&Math.abs(val*100-Math.round(val*100))>1e-9){a[0]+= (n-(a.reduce((s,x)=>s+x,0)%n))%n}
  const v2=t?mean(a):median(a);quiz={a:r2(v2),t:t?'mean':'median'};data=a;$('#mD').value=a.join(', ');$('#mSvg').innerHTML='';$('#mOut').innerHTML=`<p><b>Quiz:</b> find the <b>${quiz.t}</b> of ${a.join(', ')}.</p>`;return true}
 if(b.id==='mC'){if(!quiz){$('#mOut').innerHTML='<p>Press Quiz first.</p>';return true}const g=+$('#mAns').value;const ok=Math.abs(g-quiz.a)<0.01;const q=quiz;quiz=null;draw();$('#mOut').insertAdjacentHTML('afterbegin',ok?`<p class="fb ok">Correct: the ${q.t} is ${q.a}.</p>`:`<p class="fb no">Not quite: the ${q.t} is ${q.a}.</p>`);return true}return false}
function labChange(t){if(t.id==='mEx'&&t.value){$('#mD').value=t.value;data=parse(t.value);draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
