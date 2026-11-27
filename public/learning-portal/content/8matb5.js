/* Rai Plus content pack: Class 8 Mathematics (Ganita Prakash Part 2), Chapter 5 – Tales by Dots and Lines (mean, median, dot plots, line graphs). */
RP.register({key:'8matb5',cls:'8',subject:'Mathematics',ch:'II-5',title:"Tales by Dots and Lines",color:'#1f5f8b',
crumb:"Class 8 Mathematics · Ganita Prakash Part 2",h1:"Part 2 · Chapter 5: Tales by Dots and Lines",sub:"The mean as a balancing point, the median, mean and median from frequency tables, dot plots, line graphs, and reading the story that data tells.",heroLabel:"Data finds its balance",labName:'Dot plot balance lab',
theme:"\n:root{--g:light-dark(#1f5f8b,#8cc4ea);--g2:light-dark(#eaf3fa,#081520);--line:light-dark(#cde1f0,#22394b);--bg:light-dark(#ffffff,#08111a);--card:light-dark(#ffffff,#0e1822);\n--ink:light-dark(#0f2233,#e2eef7);--mute:light-dark(#4a6075,#aac0d2);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#174a6d}\n",
labHTML:`  <h2>Dot plot balance lab</h2>
  <p>Each dot is one student's score (0–10). Tap above a number to add a dot there; tap a column's dots with "Remove" mode on to take one away. The triangle under the line is the <b>mean</b> — the point where the dot plot would balance. The dashed line marks the <b>median</b>.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="dpSvg" viewBox="0 0 460 300" role="img" aria-label="Dot plot" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Tap mode<select id="dpM"><option value="a">Add a dot</option><option value="r">Remove a dot</option></select></label></div>
  <div class="ctrl"><button class="btn" id="dpOut1">Add an outlier (score 10)</button> <button class="btn" id="dpReset">Reset</button></div>
  <div class="box y" id="dpOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#1f5f8b',LABNAME='Dot plot balance lab',MIND_CENTER='Data stories';
const BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const r2=v=>+v.toFixed(2);
function dots(vals,x0,y0,u,c=BL){const cnt={};let s='';vals.forEach(v=>{cnt[v]=(cnt[v]||0)+1;s+=`<circle cx="${x0+v*u}" cy="${y0-cnt[v]*14}" r="6" fill="${c}"/>`});return s}
function axis(x0,y0,u,n){let s=`<line x1="${x0-10}" y1="${y0}" x2="${x0+n*u+10}" y2="${y0}" stroke="${ink}"/>`;for(let i=0;i<=n;i++)s+=`<line x1="${x0+i*u}" y1="${y0}" x2="${x0+i*u}" y2="${y0+5}" stroke="${ink}"/>`+T(x0+i*u,y0+18,i,'font-size="11"');return s}
const fulcrum=(x,y,c=OR)=>`<polygon points="${x},${y+2} ${x-9},${y+16} ${x+9},${y+16}" fill="${c}"/>`;
function heroDraw(){return `<line x1="40" y1="130" x2="200" y2="130" stroke="#fff" stroke-width="2.5"/>${[[70,1],[100,2],[130,3],[160,1]].map(([x,n])=>[...Array(n)].map((_,k)=>`<circle cx="${x}" cy="${118-k*16}" r="6" fill="#fff"/>`).join('')).join('')}<polygon points="120,132 110,150 130,150" fill="#fff"/>`}
const HERO=heroDraw;
const MIND=[['Mean: balance',100,50],['Median: middle',420,50],['With frequencies',90,150],['Dot plots',430,150],['Line graphs',110,250],['Reading data stories',410,250]];

const C=[
{id:'d1',num:'5.1',title:'The mean: a balancing act',
 intro:'Five friends have 2, 4, 5, 7 and 12 marbles. If they pooled them and shared equally, how many would each get?',
 obj:'Find the mean and understand it as a fair share and a balance point.',
 prior:'Class 7 data handling.',
 simple:'Mean = sum of values ÷ number of values. (2 + 4 + 5 + 7 + 12) ÷ 5 = 30 ÷ 5 = 6. The mean is the "fair share". It is also the balance point: if the values were weights on a see-saw, the mean is where it balances — the distances on the left (6−2, 6−4, 6−5 = 4 + 2 + 1 = 7) equal the distances on the right (1 + 6 = 7).',
 detail:'The deviations from the mean always add to zero. Shortcut: guess a mean, add up the deviations from the guess, and correct. Guess 5: deviations −3, −1, 0, 2, 7 sum to 5; 5 ÷ 5 = 1; mean = 5 + 1 = 6. Mean of the first n natural numbers is (n + 1)/2.',
 real:'Average rainfall, average marks, a cricketer\'s batting average.',
 apply:'Find the mean of the first 50 natural numbers. Check it using the balance idea.',
 see:{w:520,h:200,f:[
  ['Values on a line.',axis(40,140,36,12)+dots([2,4,5,7,12],40,140,36)],
  ['Balance point at 6.',fulcrum(40+6*36,140)+lbl(40+6*36,185,'mean = 6','font-weight="700" fill="'+OR+'"')],
  ['Left distances = right distances.',lbl(130,40,'left: 4 + 2 + 1 = 7','fill="'+BL+'"')+lbl(390,40,'right: 1 + 6 = 7','fill="'+BL+'"')]]},
 seeNote:'The mean balances the data.',
 do:{title:'Ruler see-saw',mat:'Ruler, pencil, coins',steps:['Place coins at marks 2, 4, 5, 7, 12 cm.','Find where it balances on a pencil.'],obs:'Near 6 cm.',why:'Mean = balance.',lab:true},
 memo:'"Mean: share it fairly, balance it evenly."',
 miscon:['"The mean must be one of the values." 6 is not in the data above.'],
 terms:['Mean','Deviation','Balance point'],
 q:{q:'The mean of 3, 5, 7, 9, 11 is:',o:['5','7','9','35'],a:1,why:'35 ÷ 5.'},
 exam:'Finding the mean: 1–2 marks.'},

{id:'d2',num:'5.2',title:'The median: the middle value',
 intro:'In a class, one student scored 98 and the rest scored around 40. Is the mean a fair "typical" score?',
 obj:'Find the median and compare it with the mean.',
 prior:'5.1.',
 simple:'Arrange the data in order. The median is the middle value. For 3, 5, 6, 8, 20 → median 6. For an even number of values, the median is the mean of the two middle values: 3, 5, 6, 8 → (5 + 6) ÷ 2 = 5.5.',
 detail:'The median is not affected much by extreme values (outliers); the mean is pulled towards them. Data 30, 32, 35, 36, 200: mean 66.6, median 35 — the median is the better "typical" value. Half the values are at or below the median, half at or above.',
 real:'House prices and incomes are usually reported as medians because a few very large values distort the mean.',
 apply:'Find the mean and median of 12, 15, 11, 14, 13, 60. Which describes the data better?',
 see:{w:520,h:200,f:[
  ['Sort the values.',[3,5,6,8,20].map((v,i)=>`<rect x="${80+i*75}" y="50" width="56" height="44" rx="8" fill="${i===2?OR:BL}" fill-opacity=".18" stroke="${i===2?OR:BL}"/>`+T(108+i*75,79,v,'font-size="17"')).join('')],
  ['Middle one is the median.',lbl(258,125,'median = 6','font-weight="700" fill="'+OR+'"')],
  ['Mean is pulled by 20.',lbl(258,170,'mean = 42 ÷ 5 = 8.4 (pulled up by the outlier)')]]},
 seeNote:'Middle of the ordered list.',
 do:{title:'Height line',mat:'Classmates',steps:['Line up by height.','Who is in the middle?'],obs:'Median height.',why:'Middle value.',lab:false},
 memo:'"Order first, then middle."',
 miscon:['"Median is the middle of the list as given." The list must be sorted first.'],
 terms:['Median','Outlier','Ordered data'],
 q:{q:'The median of 9, 2, 7, 4, 5 is:',o:['7','5','4','27/5'],a:1,why:'Sorted: 2, 4, 5, 7, 9.'},
 exam:'Median with odd/even counts: 2 marks.'},

{id:'d3',num:'5.3',title:'Mean and median with frequencies',
 intro:'What is the average family size of students in your class, when many families have the same size?',
 obj:'Find the mean and median from a frequency table.',
 prior:'5.1, 5.2.',
 simple:'When a value repeats, a frequency table saves effort. Family size x: 2, 3, 4, 5, 6 with frequency f: 3, 8, 10, 6, 3 (30 students). Mean = Σ(f × x) ÷ Σf = (6 + 24 + 40 + 30 + 18) ÷ 30 = 118 ÷ 30 ≈ 3.93.',
 detail:'Median: total 30 → the middle values are the 15th and 16th. Cumulative frequencies: 3, 11, 21, … The 15th and 16th both lie in size 4, so median = 4. Always add a cumulative-frequency column to locate the middle.',
 real:'Census and survey data are almost always summarised in frequency tables.',
 apply:'Marks 5, 6, 7, 8, 9 with frequencies 2, 5, 8, 3, 2. Find the mean and median.',
 see:{w:520,h:220,f:[
  ['Frequency table.',['x','2','3','4','5','6'].map((v,i)=>T(60+i*70,50,v,'font-size="14" font-weight="700"')).join('')+['f','3','8','10','6','3'].map((v,i)=>T(60+i*70,80,v,'font-size="14"')).join('')],
  ['f × x.',['fx','6','24','40','30','18'].map((v,i)=>T(60+i*70,110,v,'font-size="14" fill="'+BL+'"')).join('')],
  ['Mean and median.',lbl(260,160,'mean = 118 ÷ 30 ≈ 3.93','font-size="15" font-weight="700"')+lbl(260,192,'15th & 16th values → median = 4','font-size="14" fill="'+OR+'"')]]},
 seeNote:'Multiply, add, divide.',
 do:{title:'Family survey',mat:'Class register',steps:['Collect family sizes.','Make a frequency table; find mean and median.'],obs:'Mean and median close.',why:'Frequencies.',lab:false},
 memo:'"Σfx ÷ Σf."',
 miscon:['"Mean = sum of x ÷ number of x values." Multiply each by its frequency first.'],
 terms:['Frequency','Σfx','Cumulative frequency'],
 q:{q:'x: 1, 2, 3; f: 2, 3, 5. Mean:',o:['2','2.3','6','2.5'],a:1,why:'23 ÷ 10.'},
 exam:'Frequency tables: 3 marks.'},

{id:'d4',num:'5.4',title:'Dot plots',
 intro:'How can you see at a glance where data is bunched up and where it is spread out?',
 obj:'Draw and read dot plots; spot clusters, gaps and outliers.',
 prior:'Number line; 5.1–5.3.',
 simple:'A dot plot puts one dot above a number line for each value. Repeated values stack up. You can read the mode (tallest stack), the range (smallest to largest), clusters (where dots bunch), gaps and outliers (lonely dots far away).',
 detail:'Comparing two groups on dot plots drawn on the same scale shows which has a higher centre and which is more spread out. Mark the mean (balance) and median on the plot to compare them visually.',
 real:'Weights of wrestlers in a training camp, or coconuts harvested per tree.',
 apply:'Draw a dot plot for: 3, 4, 4, 5, 5, 5, 6, 6, 7, 12. Mark the outlier, the mode and the median.',
 see:{w:520,h:200,f:[
  ['Number line.',axis(40,150,36,12)],
  ['Dots stack up.',dots([3,4,4,5,5,5,6,6,7,12],40,150,36)],
  ['Read the story.',lbl(40+5*36,55,'mode 5','fill="'+OR+'" font-weight="700"')+lbl(40+12*36,105,'outlier','fill="'+OR+'"')+lbl(260,190,'cluster 3–7; gap 8–11')]]},
 seeNote:'Stacks, clusters, gaps, outliers.',
 do:{title:'Shoe sizes',mat:'Chalk number line',steps:['Each student places a sticker above their shoe size.'],obs:'A live dot plot.',why:'Shape of data.',lab:true},
 memo:'"One value, one dot."',
 miscon:['"The tallest stack is the mean." It is the mode.'],
 terms:['Dot plot','Mode','Range','Outlier','Cluster'],
 q:{q:'In a dot plot, the tallest stack shows the:',o:['mean','median','mode','range'],a:2,why:'Most frequent.'},
 exam:'Read a dot plot: 2 marks.'},

{id:'d5',num:'5.5',title:'Line graphs',
 intro:'How did the temperature change through a day — and when was it rising fastest?',
 obj:'Draw and interpret line graphs of data that change over time.',
 prior:'Coordinates; 5.4.',
 simple:'A line graph plots values against time (on the horizontal axis) and joins the points with line segments. Rising segments show increase; falling ones show decrease; a steeper segment means faster change; a flat segment means no change.',
 detail:'Choose a suitable scale on each axis; a broken axis (zig-zag) can skip values near zero but may exaggerate changes. Two line graphs on the same axes compare trends (e.g. rainfall in two cities). Points between plotted times can be estimated, but only roughly.',
 real:'Fever charts in hospitals, sunrise times through the year, monthly rainfall, a cricket team\'s run rate.',
 apply:'Plot hourly temperatures: 6 am 18°, 9 am 24°, noon 31°, 3 pm 33°, 6 pm 27°. When did it rise fastest?',
 see:{w:520,h:230,f:[
  ['Axes: time and temperature.',`<line x1="50" y1="190" x2="480" y2="190" stroke="${ink}"/><line x1="50" y1="190" x2="50" y2="30" stroke="${ink}"/>`+['6','9','12','15','18'].map((t,i)=>T(80+i*95,208,t,'font-size="11"')).join('')],
  ['Plot points.',[18,24,31,33,27].map((v,i)=>`<circle cx="${80+i*95}" cy="${190-(v-15)*7.5}" r="5" fill="${BL}"/>`).join('')],
  ['Join them.',`<polyline points="${[18,24,31,33,27].map((v,i)=>(80+i*95)+','+(190-(v-15)*7.5)).join(' ')}" fill="none" stroke="${BL}" stroke-width="2.5"/>`+lbl(240,40,'steepest rise: 9 am–noon','fill="'+OR+'" font-weight="700"')]]},
 seeNote:'Slope shows speed of change.',
 do:{title:'Shadow length',mat:'Stick, ruler',steps:['Measure a stick\'s shadow every hour.','Draw a line graph.'],obs:'Shortest at noon.',why:'Change over time.',lab:false},
 memo:'"Up, down, flat; steep means fast."',
 miscon:['"A line graph can be used for any data." Use it for change over time (continuous order), not for unrelated categories.'],
 terms:['Line graph','Trend','Scale','Broken axis'],
 q:{q:'A flat segment on a line graph shows:',o:['fast increase','no change','decrease','an error'],a:1,why:'Same value.'},
 exam:'Interpret a line graph: 2–3 marks.'},

{id:'d6',num:'5.6',title:'Reading the story in data',
 intro:'Two shops claim "our average sale is ₹500". Could they still be very different?',
 obj:'Choose suitable summaries and graphs and avoid misleading conclusions.',
 prior:'5.1–5.5.',
 simple:'A good data story uses the right summary: the mean when values are fairly even, the median when there are outliers. Graphs should have honest scales. Always ask: how many values? What is the spread? Is there an outlier?',
 detail:'The same mean can hide very different data (5, 5, 5, 5 vs 0, 0, 10, 10). A graph whose vertical axis starts far from zero can make small changes look huge. Correlation is not cause: ice-cream sales and heat-stroke cases both rise in summer, but one does not cause the other.',
 real:'Advertisements and news charts sometimes use misleading scales.',
 apply:'Find a newspaper chart and check its axes. Does it tell an honest story?',
 see:{w:520,h:200,f:[
  ['Same mean …',axis(40,80,36,10)+dots([5,5,5,5],40,80,36)+fulcrum(40+5*36,80)],
  ['… very different spread.',axis(40,170,36,10)+dots([0,0,10,10],40,170,36,PU)+fulcrum(40+5*36,170)],
  ['Ask about spread too.',lbl(440,40,'mean 5, all close','font-size="12"')+lbl(440,118,'mean 5, far apart','font-size="12" fill="'+PU+'"')]]},
 seeNote:'Centre and spread together.',
 do:{title:'Chart detective',mat:'Newspapers',steps:['Collect two charts.','Check scales, labels and sources.'],obs:'Some exaggerate.',why:'Honest data.',lab:false},
 memo:'"Centre, spread, scale, source."',
 miscon:['"Same average means same data." Spread can be completely different.'],
 terms:['Spread','Misleading graph','Correlation'],
 q:{q:'Data 10, 11, 12, 13, 99 is best described by:',o:['mean','median','sum','largest value'],a:1,why:'Outlier.'},
 exam:'Choose and justify a summary: 2–3 marks.'}
];

const CARDS=[['Mean','Sum ÷ count; balance point.'],['Deviations','Add up to zero about the mean.'],['Median','Middle of ordered data.'],['Even count','Median = average of two middles.'],['Outlier','Pulls the mean, not the median.'],['Frequency mean','Σfx ÷ Σf.'],['Dot plot','One dot per value; stacks.'],['Mode','Tallest stack.'],['Line graph','Change over time; steep = fast.'],['Honest graphs','Check scale and spread.']];

const Q=[
 {lv:1,q:'Mean of 4, 6, 8:',o:['6','18','8','4'],a:0,w:'18 ÷ 3.'},
 {lv:1,q:'Median of 1, 3, 3, 8, 10:',o:['3','5','8','25'],a:0,w:'Middle value.'},
 {lv:1,q:'Line graphs are best for:',o:['change over time','favourite colours','shoe brands','pie shares'],a:0,w:'Trends.'},
 {lv:2,q:'Median of 2, 4, 6, 10:',o:['4','5','6','5.5'],a:1,w:'(4 + 6) ÷ 2.'},
 {lv:2,q:'Deviations from the mean add up to:',o:['the mean','zero','the count','one'],a:1,w:'Balance.'},
 {lv:2,q:'Mean of first 10 natural numbers:',o:['5','5.5','10','55'],a:1,w:'(10 + 1)/2.'},
 {lv:3,q:'x: 1, 2, 3, 4; f: 1, 2, 3, 4. Mean:',o:['2.5','3','10','2'],a:1,w:'30 ÷ 10.'},
 {lv:3,q:'Adding an outlier of 100 to 5, 6, 7 changes the median from 6 to:',o:['6.5','29.5','6','7'],a:0,w:'(6 + 7) ÷ 2.'},
 {lv:4,q:'Mean of 5 numbers is 12. One number, 20, is removed. New mean:',o:['10','11','8','12'],a:0,w:'(60 − 20) ÷ 4.'},
 {lv:4,q:'A graph\'s vertical axis starts at 95 instead of 0. This may:',o:['exaggerate small changes','hide outliers','change the data','show the median'],a:0,w:'Misleading scale.'},
 {lv:5,open:true,m:3,q:'Find the mean and median of 22, 25, 23, 24, 26, 80. Which better represents the data, and why?',ans:['Mean = 200 ÷ 6 ≈ 33.3 (1)','Median = (24 + 25) ÷ 2 = 24.5 (1)','Median — 80 is an outlier pulling the mean (1)']},
 {lv:5,open:true,m:5,q:'Marks 4, 5, 6, 7, 8 have frequencies 3, 7, 10, 6, 4. Find the mean and median. Draw a dot plot and mark both.',ans:['Σf = 30; Σfx = 12 + 35 + 60 + 42 + 32 = 181 (1)','Mean ≈ 6.03 (1)','Cumulative 3, 10, 20 … 15th & 16th = 6 → median 6 (1)','Dot plot drawn (1)','Mean and median marked (1)']}
];

const ONEMIN=['Mean = balance.','Median = middle.','Σfx ÷ Σf.','Dot plots: stacks and outliers.','Line graphs: trends.','Honest data stories.'];
const KEYS=[['mean',/mean|balance/i],['median',/median|middle/i],['frequency',/frequen/i],['dot plot',/dot plot/i],['line graph',/line graph/i],['story',/spread|mislead|outlier/i]];

/* ---------- lab ---------- */
const START=[3,4,4,5,5,5,6,6,7];
let vals=START.slice(),mode='a',wired=false;
const X0=30,U=40,Y0=230;
function stats(){const n=vals.length;if(!n)return null;const s=[...vals].sort((a,b)=>a-b);const mean=vals.reduce((a,b)=>a+b,0)/n;const med=n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2;const cnt={};vals.forEach(v=>cnt[v]=(cnt[v]||0)+1);const mx=Math.max(...Object.values(cnt));const modes=Object.keys(cnt).filter(k=>cnt[k]===mx);return {n,mean,med,modes,range:s[n-1]-s[0],sum:vals.reduce((a,b)=>a+b,0)}}
function draw(){let s='';for(let i=0;i<=10;i++)s+=`<rect data-dv="${i}" x="${X0+i*U-U/2}" y="20" width="${U}" height="${Y0-20}" fill="transparent" style="cursor:pointer"/>`;
 s+=axis(X0,Y0,U,10).replace(/font-size="11"/g,'font-size="13"');const st0=stats();if(st0)s+=`<line x1="${X0+st0.med*U}" y1="30" x2="${X0+st0.med*U}" y2="${Y0}" stroke="${GN}" stroke-dasharray="5 4" stroke-width="2" pointer-events="none"/>`;const cnt={};vals.forEach(v=>{cnt[v]=(cnt[v]||0)+1;s+=`<circle cx="${X0+v*U}" cy="${Y0-cnt[v]*16}" r="7" fill="${BL}" pointer-events="none"/>`});
 const st=stats();if(st){s+=fulcrum(X0+st.mean*U,Y0+22)+T(X0+st.mean*U,Y0+55,'mean '+r2(st.mean),'font-size="12" font-weight="700" fill="'+OR+'"')+T(X0+st.med*U,24,'median '+st.med,'font-size="12" fill="'+GN+'"')}
 $('#dpSvg').innerHTML=s;
 $('#dpOut').innerHTML=st?`<p>${st.n} values, sum ${st.sum}. <b>Mean</b> = ${st.sum} ÷ ${st.n} = <b>${r2(st.mean)}</b>; <b>median</b> = <b>${st.med}</b>; mode ${st.modes.join(', ')}; range ${st.range}.</p><p>${Math.abs(st.mean-st.med)>1?'The mean and median are far apart — an outlier or a lopsided spread is pulling the mean.':'The mean and median are close — the data is fairly balanced.'}</p>`:'<p>No dots. Tap above a number to add one.</p>'}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('click',e=>{const r=e.target.closest&&e.target.closest('[data-dv]');if(!r)return;const v=+r.dataset.dv;if(mode==='a'){if(vals.length<40)vals.push(v)}else{const i=vals.lastIndexOf(v);if(i>=0)vals.splice(i,1)}draw()})}
function labClick(b){if(b.id==='dpOut1'){vals.push(10);draw();return true}if(b.id==='dpReset'){vals=START.slice();draw();return true}return false}
function labChange(t){if(t.id==='dpM'){mode=t.value;return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
