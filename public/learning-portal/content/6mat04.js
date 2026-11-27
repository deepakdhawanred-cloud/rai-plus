/* Rai Plus content pack: Class 6 Mathematics (Ganita Prakash), Chapter 4 – Data Handling and Presentation. */
RP.register({key:'6mat04',cls:'6',subject:'Mathematics',ch:'4',title:"Data Handling and Presentation",color:'#2c7a5b',
crumb:"Class 6 Mathematics · Ganita Prakash",h1:"Chapter 4: Data Handling and Presentation",sub:"Collecting and organising data, tally marks, pictographs, bar graphs and choosing a scale.",heroLabel:"A tally, a pictograph and a bar graph",labName:'Graph builder',
theme:"\n:root{--g:light-dark(#2c7a5b,#8fd6b8);--g2:light-dark(#e6f4ee,#0a1a14);--line:light-dark(#c8e6d8,#1f3f32);--bg:light-dark(#ffffff,#07110d);--card:light-dark(#ffffff,#0c1812);\n--ink:light-dark(#0d241b,#dff1e9);--mute:light-dark(#466457,#a8c9ba);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#1f5c43}\n",
labHTML:`  <h2>Graph builder</h2>
  <p>Change the data and the scale. See the same data as tally marks, a pictograph and a bar graph.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="dSvg" viewBox="0 0 460 320" role="img" aria-label="Data shown three ways" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Data set<select id="dSet"><option value="fruit">Favourite fruit (Class 6)</option><option value="trans">How students come to school</option><option value="books">Books borrowed (Mon–Fri)</option></select></label></div><div class="ctrl"><label>Show as<select id="dView"><option value="tally">Tally marks</option><option value="pic">Pictograph</option><option value="bar" selected>Bar graph</option></select></label></div><div class="ctrl"><label>Scale: 1 unit = <b id="dSv"></b><input type="range" id="dS" class="dS" min="1" max="4" value="2"></label></div><div class="box y" id="dOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#2c7a5b',LABNAME='Graph builder',MIND_CENTER='Data';
const GN='#2c7a5b',OR='#b04a1f',BL='#1f5f8b',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
function tally(x,y,n,h=20){let s='';let px=x;for(let g=0;g<Math.floor(n/5);g++){for(let k=0;k<4;k++)s+=`<line x1="${px+k*6}" y1="${y}" x2="${px+k*6}" y2="${y-h}" stroke="${ink}" stroke-width="2"/>`;s+=`<line x1="${px-3}" y1="${y-3}" x2="${px+22}" y2="${y-h+3}" stroke="${ink}" stroke-width="2"/>`;px+=34}for(let k=0;k<n%5;k++)s+=`<line x1="${px+k*6}" y1="${y}" x2="${px+k*6}" y2="${y-h}" stroke="${ink}" stroke-width="2"/>`;return s}
function heroDraw(){return `<g stroke="#fff" stroke-width="3">${[0,1,2,3].map(k=>`<line x1="${40+k*8}" y1="100" x2="${40+k*8}" y2="70"/>`).join('')}<line x1="34" y1="96" x2="70" y2="74"/></g>`+[0,1,2].map(k=>`<circle cx="${130+k*22}" cy="85" r="9" fill="#fff"/>`).join('')+[50,80,35,65].map((h,k)=>`<rect x="${230+k*24}" y="${110-h}" width="18" height="${h}" fill="#fff" opacity=".85"/>`).join('')}
const HERO=heroDraw;
const MIND=[['Collecting data',100,50],['Organising: tally',420,50],['Pictographs',90,150],['Bar graphs',430,150],['Choosing a scale',110,250],['Reading & infographics',410,250]];

const C=[
{id:'d1',num:'4.1',title:'Collecting and organising data',
 intro:'Your class wants to choose one fruit for the picnic. How do you decide fairly?',
 obj:'Collect data for a question and organise it in a table.',
 prior:'Counting.',
 simple:'Data is a collection of facts, such as numbers, words or measurements, gathered to answer a question. First decide the question (e.g. "Which fruit do most students like?"). Collect data by asking, counting or measuring. Then organise it: list or sort it in a table so it is easy to read.',
 detail:'Raw data is not organised: e.g. banana, mango, apple, mango, banana… Sorting it into groups (categories) and counting each makes a frequency table. Data organised well helps make decisions: the picnic fruit, the most common way students come to school, or which books to buy for the library.',
 real:'Before a school trip, teachers collect data on how many students will come and what they will eat.',
 apply:'Write a question you could answer by collecting data in your class.',
 see:{w:520,h:220,f:[
  ['Raw data: answers in any order.',lbl(260,40,'mango, banana, apple, mango, guava, mango, banana, apple, mango, banana','font-size="12"')],
  ['Sort into groups.',['mango','banana','apple','guava'].map((f,i)=>lbl(120+i*95,90,f,'font-weight="700"')).join('')],
  ['Count each: a table.',[4,3,2,1].map((n,i)=>lbl(120+i*95,120,String(n),'font-size="18"')).join('')+lbl(260,180,'organised data is easier to read','font-weight="700"')]]},
 seeNote:'Question → collect → organise.',
 do:{title:'Class survey',mat:'Notebook',steps:['Ask everyone their favourite sport.','List answers, then sort and count.'],obs:'One sport is most popular.',why:'Organising data.',lab:true},
 memo:'"Ask, collect, sort, count."',
 miscon:['"Data is only numbers." It can be words or categories too.'],
 terms:['Data','Raw data','Category','Table'],
 q:{q:'Data is collected to:',o:['decorate','answer a question','waste time','draw only'],a:1,why:'Purpose.'},
 exam:'Organise given data into a table: 2 marks.'},

{id:'d2',num:'4.2',title:'Tally marks',
 intro:'How can you count votes quickly as names are called out?',
 obj:'Record and read data using tally marks.',
 prior:'Organising data (4.1).',
 simple:'Tally marks record counts quickly: draw one stroke | for each item. The fifth stroke is drawn across the four (卌), making a bundle of five. Counting in fives makes the total easy to read. A table with categories, tally marks and the count is a frequency table.',
 detail:'Example: 13 votes = two bundles of five + three strokes. Tallies are useful while data is still coming in, e.g. counting vehicles passing the school gate or votes in a class election.',
 real:'Class monitors count election votes on the board with tally marks.',
 apply:'Draw tally marks for 17.',
 see:{w:520,h:200,f:[
  ['One stroke for each.',tally(60,90,4)],
  ['The 5th stroke crosses: a bundle of 5.',tally(200,90,5)],
  ['13 = 5 + 5 + 3.',tally(320,90,13)+lbl(380,140,'13','font-size="18" font-weight="700"')]]},
 seeNote:'Count in fives.',
 do:{title:'Traffic tally',mat:'Notebook, 10 minutes at the gate (with teacher)',steps:['Tally cars, bikes, autos and buses.','Total each.'],obs:'Bikes most common?',why:'Tally data.',lab:true},
 memo:'"Four standing, one across."',
 miscon:['"Each bundle has four marks." It has five (four + one across).'],
 terms:['Tally marks','Frequency','Frequency table'],
 q:{q:'Tally for 7:',o:['卌 ||','||||||| ','卌 |','卌 |||'],a:0,why:'5 + 2.'},
 exam:'Make a frequency table with tallies: 2 marks.'},

{id:'d3',num:'4.3',title:'Pictographs',
 intro:'Can you show the number of students who like each fruit using pictures?',
 obj:'Draw and read pictographs, including with a key/scale.',
 prior:'Tally (4.2).',
 simple:'A pictograph shows data using pictures or symbols. Each symbol stands for a number given in the key (scale), e.g. 🍎 = 2 students. Half a symbol shows half that number. Always write the key.',
 detail:'If 1 symbol = 5 students and a row shows 3½ symbols, that row is 17.5 → but students are whole, so choose a key that fits the data well (like 1 symbol = 2). Pictographs are attractive but hard to draw when numbers are large or not multiples of the key.',
 real:'Newspapers show population or production using small picture symbols.',
 apply:'Key: 1 ☺ = 4 students. How many students do 3½ ☺ show?',
 see:{w:520,h:220,f:[
  ['Key: ● = 2 students.',lbl(400,30,'Key: ● = 2 students','font-weight="700"')],
  ['Mango 8, Banana 6, Apple 4.',[['Mango',4],['Banana',3],['Apple',2]].map(([f,n],i)=>lbl(70,80+i*40,f,'text-anchor="end"')+[...Array(n)].map((_,k)=>`<circle cx="${100+k*30}" cy="${75+i*40}" r="11" fill="${OR}"/>`).join('')).join('')],
  ['Guava 3: one and a half symbols.',lbl(70,200,'Guava','text-anchor="end"')+`<circle cx="100" cy="195" r="11" fill="${OR}"/><path d="M130 184 a11 11 0 0 0 0 22z" fill="${OR}"/>`+lbl(300,200,'half symbol = 1')]]},
 seeNote:'Always give the key.',
 do:{title:'Pictograph poster',mat:'Chart paper, stickers',steps:['Use your sports survey.','Choose a key; draw the pictograph.'],obs:'Easy to compare.',why:'Pictures.',lab:false},
 memo:'"Picture × key = number."',
 miscon:['"Each picture is always 1." Check the key.'],
 terms:['Pictograph','Symbol','Key / scale'],
 q:{q:'Key: ★ = 5. 4 stars show:',o:['4','9','20','45'],a:2,why:'4 × 5.'},
 exam:'Read/draw a pictograph: 3 marks.'},

{id:'d4',num:'4.4',title:'Bar graphs and scale',
 intro:'Your class has 40 students. How tall should the bars be on a page?',
 obj:'Draw and read bar graphs with a suitable scale.',
 prior:'Pictographs (4.3).',
 simple:'A bar graph shows data with bars of equal width, equal gaps between them, and heights (or lengths) proportional to the values. It has two axes: one for categories, one for values with a scale, e.g. 1 unit = 5 students. Give the graph a title and label both axes.',
 detail:'Choosing a scale: look at the largest value and the space you have. If the largest is 120 and you have 12 squares, take 1 square = 10. Bars can be vertical or horizontal. Bar graphs are easier than pictographs when numbers are large.',
 real:'Report cards sometimes show marks in each subject as bars.',
 apply:'Values: 15, 30, 45, 25. Suggest a scale for 10 squares.',
 see:{w:520,h:240,f:[
  ['Axes, title and labels.',`<line x1="80" y1="200" x2="460" y2="200" stroke="${ink}"/><line x1="80" y1="200" x2="80" y2="30" stroke="${ink}"/>`+lbl(270,22,'Favourite fruit','font-weight="700"')+[0,2,4,6,8].map(v=>T(66,204-v*18,String(v),'font-size="11"')).join('')],
  ['Equal width, equal gaps.',[['Mango',8],['Banana',6],['Apple',4],['Guava',3]].map(([f,v],i)=>`<rect x="${110+i*90}" y="${200-v*18}" width="50" height="${v*18}" fill="${GN}" opacity=".75"/>`+T(135+i*90,218,f,'font-size="12"')).join('')],
  ['Scale: 1 unit = 1 student.',lbl(400,60,'1 unit = 1 student','font-weight="700"')]]},
 seeNote:'Height ∝ value.',
 do:{title:'Draw a bar graph',mat:'Graph paper',steps:['Use your traffic tally.','Choose a scale.','Draw bars with gaps; label axes.'],obs:'Clear comparison.',why:'Bar graph.',lab:true},
 memo:'"Title, axes, scale, equal bars."',
 miscon:['"Bars must touch." In bar graphs there are equal gaps.'],
 terms:['Bar graph','Axis','Scale','Title'],
 q:{q:'Largest value 80, 8 squares available. Scale:',o:['1 square = 1','1 square = 10','1 square = 100','1 square = 5'],a:1,why:'80 ÷ 8.'},
 exam:'Draw a bar graph with scale: 4 marks.'},

{id:'d5',num:'4.5',title:'Reading graphs and infographics',
 intro:'Which day did the library lend the most books? How many more than Monday?',
 obj:'Answer questions from bar graphs and recognise artistic infographics.',
 prior:'Bar graphs (4.4).',
 simple:'To read a bar graph: check the title and scale; find the bar; read its height on the value axis; compare bars by their heights. Questions may ask: which is most/least, how many more, total, or which two are equal.',
 detail:'Infographics present data artistically — e.g. bars drawn as trees, buildings or pencils — to make data attractive. They must still keep heights proportional to the values; otherwise they mislead. Be careful of graphs whose value axis does not start from 0, which exaggerate differences.',
 real:'News channels show election results and rainfall as infographics.',
 apply:'In a bar graph with 1 unit = 5, a bar is 7 units tall. Value?',
 see:{w:520,h:230,f:[
  ['Books borrowed, scale 1 unit = 5.',`<line x1="80" y1="200" x2="460" y2="200" stroke="${ink}"/><line x1="80" y1="200" x2="80" y2="30" stroke="${ink}"/>`+[0,10,20,30,40].map(v=>T(64,204-v*4,String(v),'font-size="11"')).join('')],
  ['Mon 20, Tue 35, Wed 25, Thu 40, Fri 15.',[['Mon',20],['Tue',35],['Wed',25],['Thu',40],['Fri',15]].map(([d,v],i)=>`<rect x="${100+i*70}" y="${200-v*4}" width="40" height="${v*4}" fill="${BL}" opacity=".75"/>`+T(120+i*70,218,d,'font-size="12"')).join('')],
  ['Most: Thursday. Thu − Mon = 20.',`<rect x="310" y="40" width="40" height="160" fill="none" stroke="${OR}" stroke-width="3"/>`+lbl(400,30,'Thu − Mon = 40 − 20 = 20','font-weight="700"')]]},
 seeNote:'Read the scale first.',
 do:{title:'Spot the misleading graph',mat:'Newspaper graphs',steps:['Find a graph in a newspaper.','Check whether the axis starts at 0.'],obs:'Some exaggerate.',why:'Scale matters.',lab:false},
 memo:'"Title, scale, then compare."',
 miscon:['"A taller-looking picture always means more." Check the scale.'],
 terms:['Infographic','Compare','Total'],
 q:{q:'Scale 1 unit = 5; bar of 7 units shows:',o:['12','35','7','75'],a:1,why:'7 × 5.'},
 exam:'Answer questions from a bar graph: 3 marks.'}
];

const CARDS=[['Data','Facts collected to answer a question.'],['Organising','Sort into categories and count.'],['Tally','卌 = 5.'],['Frequency table','Category · tally · count.'],['Pictograph','Symbols + key.'],['Key','What one symbol stands for.'],['Bar graph','Equal widths and gaps; height ∝ value.'],['Scale','Largest value ÷ space available.'],['Reading','Title → scale → bars → compare.'],['Infographic','Artistic but must stay proportional.']];

const Q=[
 {lv:1,q:'Tally 卌 卌 || shows:',o:['10','11','12','13'],a:2,w:'5+5+2.'},
 {lv:1,q:'In a pictograph, the key tells:',o:['the title','what one symbol stands for','the colour','the date'],a:1,w:'Scale.'},
 {lv:1,q:'Bars in a bar graph have:',o:['different widths','equal widths','no gaps ever','random heights'],a:1,w:'Equal widths.'},
 {lv:2,q:'Key ⚽ = 4. 6 symbols show:',o:['10','24','6','64'],a:1,w:'6×4.'},
 {lv:2,q:'Key ⚽ = 4. 2½ symbols show:',o:['8','10','12','6'],a:1,w:'2.5×4.'},
 {lv:2,q:'Bar height 6 units, scale 1 unit = 10:',o:['16','60','6','600'],a:1,w:'6×10.'},
 {lv:3,q:'Values 35, 50, 20. Best scale for 10 squares:',o:['1 = 1','1 = 5','1 = 50','1 = 100'],a:1,w:'50 ÷ 10.'},
 {lv:3,q:'Bars: Mon 20, Tue 35. Tue − Mon:',o:['5','15','55','25'],a:1,w:'35−20.'},
 {lv:4,q:'Why choose 1 symbol = 2 instead of 1 = 5 for values 4, 6, 8?',o:['looks nicer','gives whole symbols','fewer colours','no reason'],a:1,w:'All are multiples of 2.'},
 {lv:4,q:'A graph\'s value axis starts at 90, not 0. It may:',o:['be fair','exaggerate differences','show totals','hide titles'],a:1,w:'Misleading.'},
 {lv:5,open:true,m:4,q:'Data: Cricket 12, Football 8, Kabaddi 10, Hockey 4. Draw a bar graph (describe the steps).',ans:['Title, label axes (1)','Choose scale, e.g. 1 unit = 2 (1)','Equal-width bars with equal gaps (1)','Correct heights: 6, 4, 5, 2 units (1)']},
 {lv:5,open:true,m:2,q:'Give one advantage of a bar graph over a pictograph.',ans:['Easier to draw for large numbers / exact values (1)','No half-symbols needed; easy comparison (1)']}
];

const ONEMIN=['Collect data to answer a question.','Organise: sort and count; frequency table.','Tally: bundles of five.','Pictograph: symbols + key.','Bar graph: equal widths/gaps, scale, title, labels.','Read scale first; beware misleading graphs.'];
const KEYS=[['data',/data/i],['tally',/tally/i],['pictograph',/pictograph|symbol/i],['key/scale',/key|scale/i],['bar graph',/bar/i],['reading',/read|compare/i]];

/* ---------- lab ---------- */
const SETS={fruit:{t:'Favourite fruit (Class 6)',c:['Mango','Banana','Apple','Guava','Grapes'],v:[14,8,6,4,10],u:'students'},trans:{t:'How students come to school',c:['Walk','Cycle','Bus','Auto','Car'],v:[12,9,16,5,3],u:'students'},books:{t:'Books borrowed',c:['Mon','Tue','Wed','Thu','Fri'],v:[16,24,12,28,8],u:'books'}};
let set='fruit',view='bar',sc=2;
function draw(){const S=SETS[set],mx=Math.max(...S.v);let s=T(230,22,S.t,'font-size="15" font-weight="700"');
 if(view==='tally'){S.c.forEach((c,i)=>{const y=70+i*48;s+=T(80,y-4,c,'font-size="13" text-anchor="end"')+tally(100,y,S.v[i],22)+T(420,y-4,String(S.v[i]),'font-size="14" font-weight="700"')})}
 else if(view==='pic'){s+=T(360,46,`Key: ● = ${sc} ${S.u}`,'font-size="13" font-weight="700"');S.c.forEach((c,i)=>{const y=80+i*46;s+=T(80,y+4,c,'font-size="13" text-anchor="end"');const n=S.v[i]/sc;for(let k=0;k<Math.floor(n);k++)s+=`<circle cx="${102+k*24}" cy="${y}" r="10" fill="${OR}"/>`;const f=n-Math.floor(n);if(f>0.01){const x=102+Math.floor(n)*24;s+=`<path d="M${x} ${y-10} A10 10 0 0 0 ${x} ${y+10} Z" fill="${OR}" opacity="${f<0.5?.5:1}"/>`+(Math.abs(f-0.5)>0.01?T(x+20,y+4,`(${(f).toFixed(2)})`,'font-size="10" fill="#888"'):'')}})}
 else{const units=Math.ceil(mx/sc),H=220/Math.max(units,1);s+=`<line x1="70" y1="270" x2="440" y2="270" stroke="${ink}"/><line x1="70" y1="270" x2="70" y2="40" stroke="${ink}"/>`;for(let u=0;u<=units;u++){const y=270-u*H;if(units<=14||u%2===0)s+=`<line x1="66" y1="${y}" x2="440" y2="${y}" stroke="${GR}" stroke-width=".4"/>`+T(56,y+4,String(u*sc),'font-size="10"')}
  S.c.forEach((c,i)=>{const h=S.v[i]/sc*H;s+=`<rect x="${90+i*70}" y="${270-h}" width="40" height="${h}" fill="${GN}" opacity=".8"/>`+T(110+i*70,288,c,'font-size="12"')+T(110+i*70,264-h,String(S.v[i]),'font-size="11"')});s+=T(400,36,`1 unit = ${sc}`,'font-size="12" font-weight="700"')}
 $('#dSvg').innerHTML=s;$('#dSv').textContent=sc+' '+SETS[set].u;
 const iM=S.v.indexOf(mx),mn=Math.min(...S.v),iN=S.v.indexOf(mn),tot=S.v.reduce((a,b)=>a+b,0);
 let h=`<p>Most: <b>${S.c[iM]}</b> (${mx}). Least: <b>${S.c[iN]}</b> (${mn}). Total: ${tot} ${S.u}.</p>`;
 if(view==='pic'){const bad=S.v.filter(v=>v%sc).length;h+=bad?`<p class="fb no">${bad} value(s) need part-symbols with this key. Try a key that divides all values.</p>`:'<p class="fb ok">Every value fits whole (or half) symbols with this key.</p>'}
 if(view==='bar'){const units=Math.ceil(mx/sc);h+=units>14?'<p class="fb no">Too many units: bars get crowded. Choose a bigger scale.</p>':units<4?'<p class="note">Very few units: bars are hard to read exactly.</p>':'<p class="fb ok">Good scale for this data.</p>'}
 $('#dOut').innerHTML=h}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='dS')labChange(e.target)})}
function labClick(){return false}
function labChange(t){if(t.id==='dS'){sc=+t.value;draw();return true}if(t.id==='dSet'){set=t.value;draw();return true}if(t.id==='dView'){view=t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
