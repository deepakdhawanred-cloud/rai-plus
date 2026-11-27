/* Rai Plus content pack: Class 9 Mathematics, Chapter 12 – Statistics (rationalised NCERT: graphical representation of data). */
RP.register({key:'9mat12',cls:'9',subject:'Mathematics',ch:'12',title:"Statistics",color:'#6a4fb3',
crumb:"HBSE Class 9 Mathematics · Unit: Statistics · Taught in February",h1:"Chapter 12: Statistics",sub:"Collecting data, frequency distribution tables, bar graphs, histograms with equal and varying class widths, and frequency polygons.",heroLabel:"A histogram with its frequency polygon",labName:'Histogram builder',
theme:"\n:root{--g:light-dark(#6a4fb3,#c6b6f0);--g2:light-dark(#f2eefb,#130e24);--line:light-dark(#ddd3f3,#2f2650);--bg:light-dark(#ffffff,#0c0918);--card:light-dark(#ffffff,#130f22);\n--ink:light-dark(#1d1438,#ebe6f8);--mute:light-dark(#5a4f7a,#b9b0d6);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#4a3390}\n",
labHTML:`  <h2>Histogram builder</h2>
  <p>Here are the marks of 40 students (out of 100). Change the class width to regroup the same data. Turn on the frequency polygon, which joins the mid-points of the bar tops. Wider classes hide detail; narrower ones can look jagged.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="stSvg" viewBox="0 0 520 330" role="img" aria-label="Histogram" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Class width<select id="stW"><option value="5">5</option><option value="10" selected>10</option><option value="20">20</option><option value="25">25</option></select></label></div>
  <div class="ctrl"><label>Show<select id="stP"><option value="h">Histogram</option><option value="hp">Histogram + frequency polygon</option><option value="p">Frequency polygon only</option></select></label></div>
  <div class="ctrl"><button class="btn" id="stR">New class of students</button></div>
  <div class="box y" id="stOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#6a4fb3',LABNAME='Histogram builder',MIND_CENTER='Statistics';
const PU='#6a4fb3',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',RD='#c0392b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
function axes(x0,y0,w,h,xl,yl){return `<line x1="${x0}" y1="${y0}" x2="${x0+w}" y2="${y0}" stroke="${ink}"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0-h}" stroke="${ink}"/>`+T(x0+w-20,y0+30,xl,'font-size="11"')+T(x0+12,y0-h-8,yl,'font-size="11"')}
function heroDraw(){let s='';[30,55,80,60,35].forEach((h,i)=>s+=`<rect x="${70+i*44}" y="${130-h}" width="44" height="${h}" fill="#fff" fill-opacity=".25" stroke="#fff" stroke-width="2"/>`);s+=`<polyline points="48,130 92,100 136,75 180,50 224,70 268,95 312,130" fill="none" stroke="#fff" stroke-width="3"/>`;return s}
const HERO=heroDraw;
const MIND=[['Data · collection',100,50],['Frequency tables',420,50],['Bar graphs',90,150],['Histograms',430,150],['Varying widths',110,250],['Frequency polygons',410,250]];

const C=[
{id:'s1',num:'12.1',title:'Data and its collection',
 intro:'Your class teacher wants to know how students come to school. How should she collect and organise this information?',
 obj:'Understand data, primary and secondary data, and why we organise data.',
 prior:'Class 6–8: data handling.',
 simple:'Data are facts or figures collected for a purpose (marks, heights, rainfall). Statistics is the study of collecting, organising, presenting, analysing and interpreting data. Primary data are collected by the investigator directly (surveying classmates). Secondary data are taken from sources already collected by others (census reports, newspapers).',
 detail:'Raw data are unorganised. Organising them (in tables or graphs) helps us see patterns quickly. The range = highest value − lowest value. Statistics helps governments plan (census), businesses decide, and scientists test ideas.',
 real:'The Census of India collects data about every household to plan schools, hospitals and roads.',
 apply:'Give two examples each of primary and secondary data you could use for a project on rainfall in Rewari.',
 see:{w:520,h:200,f:[
  ['Collect.',`<rect x="30" y="70" width="130" height="60" rx="10" fill="${PU}" fill-opacity=".14" stroke="${PU}" stroke-width="2"/>`+T(95,105,'Collect','font-size="15" font-weight="700"')],
  ['Organise.',`<path d="M165 100 h30" stroke="${GR}" stroke-width="2" marker-end="url(#ah)"/><rect x="200" y="70" width="130" height="60" rx="10" fill="${BL}" fill-opacity=".14" stroke="${BL}" stroke-width="2"/>`+T(265,105,'Organise','font-size="15" font-weight="700"')],
  ['Present and interpret.',`<path d="M335 100 h30" stroke="${GR}" stroke-width="2" marker-end="url(#ah)"/><rect x="370" y="70" width="130" height="60" rx="10" fill="${OR}" fill-opacity=".14" stroke="${OR}" stroke-width="2"/>`+T(435,105,'Present','font-size="15" font-weight="700"')+lbl(260,170,'primary: you collect · secondary: someone else collected','font-weight="700"')]]},
 seeNote:'Collect → organise → present.',
 do:{title:'Class survey',mat:'Notebook',steps:['Ask everyone how they come to school.','Record the raw data.'],obs:'A list that needs organising.',why:'Primary data.',lab:false},
 memo:'"Primary = first-hand; secondary = second-hand."',
 miscon:['"Data must always be numbers." Data can also be categories (mode of transport).'],
 terms:['Data','Statistics','Primary data','Secondary data','Raw data','Range'],
 q:{q:'Data taken from a newspaper report are:',o:['primary','secondary','raw','grouped'],a:1,why:'Collected by others.'},
 exam:'Primary vs secondary: 1 mark.'},

{id:'s2',num:'12.2',title:'Frequency distribution tables',
 intro:'Marks of 40 students are written in a long list. How can we see at a glance how many scored between 40 and 50?',
 obj:'Make grouped frequency distribution tables and find class marks.',
 prior:'12.1; tally marks.',
 simple:'A frequency distribution table shows how often each value or group of values occurs. For many values, group them into class intervals such as 0–10, 10–20, … The number of values in each class is its frequency. In the exclusive method (10–20), a value equal to the upper limit (20) goes into the next class (20–30).',
 detail:'Class size (width) = upper limit − lower limit. Class mark (mid-point) = (lower + upper) ÷ 2. For an inclusive table (10–19, 20–29), adjust to continuous classes (9.5–19.5, 19.5–29.5) before drawing histograms. The sum of all frequencies equals the total number of observations.',
 real:'School results are summarised as "number of students scoring 90–100, 80–90, …".',
 apply:'Make a table with classes of width 10 for these marks: 23, 45, 67, 34, 56, 78, 89, 12, 45, 50, 60, 70.',
 see:{w:520,h:220,f:[
  ['Class intervals.',['0–20','20–40','40–60','60–80','80–100'].map((c,i)=>T(90+i*90,50,c,'font-size="14" font-weight="700"')).join('')],
  ['Frequencies.',[3,8,15,10,4].map((f,i)=>T(90+i*90,90,f,'font-size="16" fill="'+OR+'"')).join('')],
  ['Class marks.',[10,30,50,70,90].map((m,i)=>T(90+i*90,130,m,'font-size="14" fill="'+BL+'"')).join('')+lbl(260,180,'class mark = (lower + upper) ÷ 2 · total = 40','font-weight="700"')]]},
 seeNote:'Group, count, find mid-points.',
 do:{title:'Tally it',mat:'List of 30 heights',steps:['Choose class width 5 cm.','Tally and count.'],obs:'A frequency table.',why:'Organising data.',lab:false},
 memo:'"Upper limit goes up a class."',
 miscon:['"In 10–20, 20 belongs to this class." In exclusive classes, 20 goes to 20–30.'],
 terms:['Frequency','Class interval','Class size','Class mark','Exclusive / inclusive classes'],
 q:{q:'Class mark of 30–40:',o:['30','35','40','10'],a:1,why:'(30 + 40) ÷ 2.'},
 exam:'Frequency tables and class marks: 2 marks.'},

{id:'s3',num:'12.3',title:'Bar graphs',
 intro:'Which mode of transport do most students in your class use? How can a picture show this?',
 obj:'Draw and read bar graphs.',
 prior:'12.2.',
 simple:'A bar graph shows data using bars of equal width with equal gaps between them. The height (or length) of each bar shows the value. Bar graphs suit categories (transport mode, favourite sport) or separate years.',
 detail:'Choose a suitable scale (e.g. 1 unit = 5 students). Label both axes and give a title. Bars can be vertical or horizontal. A double bar graph compares two sets of data side by side.',
 real:'News channels show party seats or rainfall by month as bar graphs.',
 apply:'Draw a bar graph for: walk 12, bicycle 8, bus 15, car 5 students.',
 see:{w:520,h:240,f:[
  ['Axes.',axes(70,200,400,170,'mode','students')],
  ['Bars with gaps.',[['walk',12],['cycle',8],['bus',15],['car',5]].map(([n,v],i)=>`<rect x="${100+i*95}" y="${200-v*10}" width="55" height="${v*10}" fill="${[PU,BL,OR,GN][i]}" fill-opacity=".7"/>`+T(127+i*95,218,n,'font-size="12"')).join('')],
  ['Values.',[12,8,15,5].map((v,i)=>T(127+i*95,195-v*10,v,'font-size="12" font-weight="700"')).join('')+lbl(270,30,'equal widths, equal gaps','font-weight="700"')]]},
 seeNote:'Gaps between bars for separate categories.',
 do:{title:'Transport survey graph',mat:'Graph paper',steps:['Use your class survey from 12.1.','Draw a bar graph.'],obs:'The most common mode stands out.',why:'Bar graphs.',lab:false},
 memo:'"Bars with gaps for categories."',
 miscon:['"Bar widths can vary in a bar graph." Bars must have equal widths.'],
 terms:['Bar graph','Scale','Double bar graph'],
 q:{q:'In a bar graph, the value is shown by the bar\'s:',o:['width','height','colour','gap'],a:1,why:'Height (or length).'},
 exam:'Draw/read bar graphs: 2–3 marks.'},

{id:'s4',num:'12.4',title:'Histograms',
 intro:'How is a histogram different from a bar graph?',
 obj:'Draw histograms for grouped data with equal class widths.',
 prior:'12.2, 12.3.',
 simple:'A histogram shows a grouped frequency distribution with continuous classes. Class intervals go on the x-axis, frequencies on the y-axis. Bars are drawn next to each other with no gaps, because the classes are continuous. The width of each bar is the class size.',
 detail:'If the first class does not start at 0, show a kink (zig-zag) on the x-axis. For inclusive classes (like 10–19), first convert to continuous classes (9.5–19.5). The area of each rectangle is proportional to the frequency.',
 real:'Doctors use histograms of patients\' ages or blood pressure readings.',
 apply:'Draw a histogram of the weights (kg) of 36 students: 30–35: 9, 35–40: 6, 40–45: 15, 45–50: 3, 50–55: 1, 55–60: 2.',
 see:{w:520,h:240,f:[
  ['Axes with class intervals.',axes(70,200,400,170,'weight (kg)','students')+[30,35,40,45,50,55,60].map((v,i)=>T(90+i*60,218,v,'font-size="11"')).join('')],
  ['Bars touch.',[9,6,15,3,1,2].map((f,i)=>`<rect x="${90+i*60}" y="${200-f*10}" width="60" height="${f*10}" fill="${PU}" fill-opacity=".55" stroke="${PU}"/>`).join('')],
  ['No gaps — continuous classes.',lbl(270,30,'histogram: no gaps between bars','font-weight="700"')]]},
 seeNote:'Adjacent bars for continuous data.',
 do:{title:'Height histogram',mat:'Class heights data',steps:['Group heights in 5 cm classes.','Draw a histogram.'],obs:'Shape of the distribution.',why:'Histograms.',lab:true},
 memo:'"Histogram bars hold hands."',
 miscon:['"A histogram is a bar graph with numbers." Histograms are for continuous grouped data, with no gaps.'],
 terms:['Histogram','Continuous classes','Kink in axis'],
 q:{q:'In a histogram, bars are drawn:',o:['with equal gaps','without gaps','as lines','as circles'],a:1,why:'Classes are continuous.'},
 exam:'Draw histograms: 3 marks.'},

{id:'s5',num:'12.5',title:'Histograms with varying widths',
 intro:'What if some classes are wider than others? Will tall bars still be fair?',
 obj:'Adjust frequencies for unequal class widths.',
 prior:'12.4.',
 simple:'When class widths differ, bar heights must be adjusted so that areas stay proportional to frequencies. Choose the minimum class size as the standard. Adjusted frequency = (minimum class size ÷ class size) × frequency.',
 detail:'Example: marks 20–30: 7, 30–40: 10, 40–50: 10, 50–60: 20, 60–70: 20, 70–100: 15 (width 30). Minimum width 10. Adjusted height for 70–100 = 10/30 × 15 = 5. Without adjustment, the 70–100 bar would wrongly look like the biggest group.',
 real:'Income data often use wide top classes (₹1 lakh – ₹10 lakh) and need adjusting.',
 apply:'Classes 0–10: 5, 10–20: 8, 20–40: 12, 40–60: 6. Find the adjusted heights.',
 see:{w:520,h:240,f:[
  ['Unequal classes.',axes(70,200,400,170,'marks','frequency')+[20,30,40,50,60,70,100].map((v,i)=>T(i<6?90+i*50:440,218,v,'font-size="11"')).join('')],
  ['Unadjusted (misleading).',`<rect x="340" y="${200-15*8}" width="100" height="${15*8}" fill="${RD}" fill-opacity=".25" stroke="${RD}" stroke-dasharray="5 4"/>`+[7,10,10,20,20].map((f,i)=>`<rect x="${90+i*50}" y="${200-f*8}" width="50" height="${f*8}" fill="${PU}" fill-opacity=".5" stroke="${PU}"/>`).join('')],
  ['Adjusted height 5.',`<rect x="340" y="${200-5*8}" width="100" height="${5*8}" fill="${GN}" fill-opacity=".6" stroke="${GN}"/>`+lbl(390,145,'15 → 5','fill="'+GN+'" font-weight="700"')+lbl(270,30,'adjusted = (min width ÷ width) × frequency','font-weight="700"')]]},
 seeNote:'Area, not height, shows frequency.',
 do:{title:'Fair bars',mat:'Graph paper',steps:['Draw the example with and without adjusting.'],obs:'Adjusted is fair.',why:'Area ∝ frequency.',lab:false},
 memo:'"Wide class? Shrink the height."',
 miscon:['"Use the raw frequency as height even for wide classes." That exaggerates wide classes.'],
 terms:['Varying class width','Adjusted frequency','Proportional area'],
 q:{q:'Min width 10; class width 20 has frequency 12. Adjusted height:',o:['12','24','6','10'],a:2,why:'10/20 × 12.'},
 exam:'Varying-width histograms: 3–5 marks.'},

{id:'s6',num:'12.6',title:'Frequency polygons',
 intro:'Can we compare two classes\' marks on one graph without overlapping bars?',
 obj:'Draw frequency polygons with and without histograms.',
 prior:'12.4.',
 simple:'A frequency polygon is made by joining the mid-points of the tops of the histogram bars with straight lines. To close it, add imaginary classes with zero frequency before the first and after the last class, and join to their class marks on the x-axis.',
 detail:'Without a histogram: plot (class mark, frequency) points and join them, adding the zero-frequency end points. Two frequency polygons on one graph compare two distributions clearly (e.g. two sections\' marks). The area under the polygon equals the area of the histogram.',
 real:'Comparing the age distribution of two villages is easier with two frequency polygons.',
 apply:'Draw the frequency polygon for: 0–10: 5, 10–20: 10, 20–30: 4, 30–40: 6, 40–50: 7, 50–60: 3.',
 see:{w:520,h:240,f:[
  ['Histogram.',axes(70,200,400,170,'class','freq')+[5,10,4,6,7,3].map((f,i)=>`<rect x="${110+i*50}" y="${200-f*15}" width="50" height="${f*15}" fill="${PU}" fill-opacity=".35" stroke="${PU}"/>`).join('')],
  ['Mid-points of tops.',[5,10,4,6,7,3].map((f,i)=>`<circle cx="${135+i*50}" cy="${200-f*15}" r="4" fill="${OR}"/>`).join('')],
  ['Join, closing at zero.',`<polyline points="85,200 ${[5,10,4,6,7,3].map((f,i)=>(135+i*50)+','+(200-f*15)).join(' ')} 435,200" fill="none" stroke="${OR}" stroke-width="2.5"/>`+lbl(270,30,'join class marks; add zero-frequency ends','font-weight="700"')]]},
 seeNote:'Dots at the middle of each top.',
 do:{title:'Compare sections',mat:'Marks of two sections',steps:['Draw both frequency polygons on one graph.','Compare.'],obs:'Easy comparison.',why:'Polygons overlap neatly.',lab:true},
 memo:'"Mid-points joined, ends grounded."',
 miscon:['"The polygon starts at the first bar\'s top." It starts on the x-axis at the class mark of an imaginary zero class.'],
 terms:['Frequency polygon','Class mark','Zero-frequency class'],
 q:{q:'A frequency polygon joins the:',o:['corners of bars','mid-points of bar tops','bar bases','axes'],a:1,why:'Class marks.'},
 exam:'Draw frequency polygons: 3 marks.'}
];

const CARDS=[['Primary data','Collected first-hand.'],['Secondary data','Taken from existing sources.'],['Range','Highest − lowest.'],['Frequency','How many times a value/class occurs.'],['Class mark','(Lower + upper) ÷ 2.'],['Exclusive classes','Upper limit goes to next class.'],['Bar graph','Equal widths, equal gaps.'],['Histogram','Continuous classes, no gaps.'],['Varying widths','Adjusted = (min width ÷ width) × f.'],['Frequency polygon','Join class marks; zero-frequency ends.']];

const Q=[
 {lv:1,q:'Data collected by the investigator are:',o:['primary','secondary','grouped','ungrouped'],a:0,w:'First-hand.'},
 {lv:1,q:'Class mark of 10–20:',o:['10','15','20','30'],a:1,w:'Mid-point.'},
 {lv:1,q:'In a histogram, bars:',o:['have gaps','touch','are thin lines','are circles'],a:1,w:'Continuous classes.'},
 {lv:2,q:'Range of 12, 45, 7, 30, 21:',o:['38','45','7','33'],a:0,w:'45 − 7.'},
 {lv:2,q:'Class size of 25–35:',o:['25','30','10','35'],a:2,w:'35 − 25.'},
 {lv:2,q:'In 10–20, 20–30, the value 20 goes in:',o:['10–20','20–30','both','neither'],a:1,w:'Exclusive classes.'},
 {lv:3,q:'Min width 5, class width 15 with frequency 9. Adjusted height:',o:['9','27','3','45'],a:2,w:'5/15 × 9.'},
 {lv:3,q:'Inclusive class 10–19 becomes continuous as:',o:['10–20','9.5–19.5','10.5–19.5','9–19'],a:1,w:'Subtract/add 0.5.'},
 {lv:4,q:'A frequency polygon is closed by joining to:',o:['the origin','class marks of zero-frequency classes','the highest bar','the y-axis'],a:1,w:'Imaginary end classes.'},
 {lv:4,q:'For comparing two distributions, it is best to use:',o:['two histograms overlapping','two frequency polygons','a pie chart','a table only'],a:1,w:'Clear comparison.'},
 {lv:5,open:true,m:3,q:'Explain why heights of bars must be adjusted in a histogram with varying class widths, and give the formula.',ans:['Area should be proportional to frequency (1)','Wide classes would look too big otherwise (1)','Adjusted = (minimum class size ÷ class size) × frequency (1)']},
 {lv:5,open:true,m:5,q:'Draw a histogram and frequency polygon for: 30–40: 6, 40–50: 10, 50–60: 15, 60–70: 9, 70–80: 4. Mark the class marks.',ans:['Correct axes and scale (1)','Bars with no gaps (1)','Class marks 35, 45, 55, 65, 75 (1)','Points joined (1)','Closed at 25 and 85 on x-axis (1)']}
];

const ONEMIN=['Primary and secondary data.','Frequency tables; class marks.','Bar graphs: gaps.','Histograms: no gaps.','Adjust for varying widths.','Frequency polygons.'];
const KEYS=[['data',/primary|secondary|data/i],['table',/frequency (distribution )?table|class mark/i],['bar graph',/bar graph/i],['histogram',/histogram/i],['varying',/varying|adjust/i],['polygon',/polygon/i]];

/* ---------- lab ---------- */
let W=10,show='h',data=[],wired=false;
function gen(){data=[];let seed=Math.floor(Math.random()*1e6);const R=()=>{seed=(seed*9301+49297)%233280;return seed/233280};for(let i=0;i<40;i++){const v=Math.round(55+((R()+R()+R()+R())/4-.5)*90);data.push(Math.max(0,Math.min(99,v)))}}
gen();
function draw(){const n=Math.ceil(100/W);const f=Array(n).fill(0);data.forEach(v=>f[Math.min(n-1,Math.floor(v/W))]++);const mx=Math.max(...f);const X0=60,Y0=270,PW=420,PH=220;const bw=PW/100*W;const sy=PH/Math.max(1,mx);
 let s=axes(X0,Y0,PW,PH+10,'marks','students');for(let k=0;k<=100;k+=W>=20?W:W*2)s+=T(X0+k*PW/100,Y0+16,k,'font-size="10"');for(let k=0;k<=mx;k+=Math.max(1,Math.ceil(mx/5)))s+=T(X0-14,Y0-k*sy+4,k,'font-size="10"');
 if(show!=='p')f.forEach((v,i)=>s+=`<rect x="${X0+i*bw}" y="${Y0-v*sy}" width="${bw}" height="${v*sy}" fill="${PU}" fill-opacity=".45" stroke="${PU}"/>`+(v?T(X0+i*bw+bw/2,Y0-v*sy-4,v,'font-size="10"'):''));
 if(show!=='h'){const pts=[[X0-bw/2,Y0],...f.map((v,i)=>[X0+i*bw+bw/2,Y0-v*sy]),[X0+n*bw+bw/2,Y0]];s+=`<polyline points="${pts.map(p=>p.map(x=>x.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${OR}" stroke-width="2.5"/>`+pts.slice(1,-1).map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${OR}"/>`).join('')}
 $('#stSvg').innerHTML=s;const mi=f.indexOf(mx);const sorted=[...data].sort((a,b)=>a-b);
 $('#stOut').innerHTML=`<p>${n} classes of width ${W}. Most students are in <b>${mi*W}–${mi*W+W}</b> (${mx} students). Range: ${sorted[39]} − ${sorted[0]} = ${sorted[39]-sorted[0]}.</p><p>${W<=5?'Narrow classes: lots of detail, but the shape looks jagged.':W>=25?'Wide classes: smooth, but details are hidden.':'A balanced width shows the overall shape clearly.'} Total frequency = ${f.reduce((a,b)=>a+b,0)}.</p>`}
function labShow(){draw()}
function labInit(){wired=true}
function labClick(b){if(b.id==='stR'){gen();draw();return true}return false}
function labChange(el){if(el.id==='stW'){W=+el.value;draw();return true}if(el.id==='stP'){show=el.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
