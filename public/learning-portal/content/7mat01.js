/* Rai Plus content pack: Class 7 Mathematics (Ganita Prakash), Chapter 1 – Large Numbers Around Us. */
RP.register({key:'7mat01',cls:'7',subject:'Mathematics',ch:'1',title:"Large Numbers Around Us",color:'#1f5f8b',
crumb:"Class 7 Mathematics · Ganita Prakash",h1:"Chapter 1: Large Numbers Around Us",sub:"Lakhs and crores, millions and billions, place value and commas, number names, rounding and estimating, and getting a feel for big numbers.",heroLabel:"A place-value chart with lakhs and crores",labName:'Big-number explorer',
theme:"\n:root{--g:light-dark(#1f5f8b,#8fc2e6);--g2:light-dark(#e8f1f8,#0b1622);--line:light-dark(#cde0ee,#22384b);--bg:light-dark(#ffffff,#081018);--card:light-dark(#ffffff,#0d1620);\n--ink:light-dark(#0d1d2a,#e1ecf5);--mute:light-dark(#475d70,#a7bccd);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#174a6d}\n",
labHTML:`  <h2>Big-number explorer</h2>
  <p>Type any number up to 99 crore (999,999,999). See it in both systems, its place values, its name, rounded values, and how big it really is. Then try the quiz.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="nSvg" viewBox="0 0 460 300" role="img" aria-label="Place value chart" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Number<input id="nIn" type="number" value="140854321" style="width:10em"></label><button class="btn" id="nShow">Show</button></div>
  <div class="ctrl"><label>Round to nearest<select id="nR"><option value="1000">thousand</option><option value="100000" selected>lakh</option><option value="1000000">million</option><option value="10000000">crore</option></select></label></div>
  <div class="ctrl"><button class="btn" id="nQ">Quiz: write in figures</button> <input id="nA" type="text" style="width:10em" placeholder="your answer"> <button class="btn" id="nC">Check</button></div>
  <div class="box y" id="nOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#1f5f8b',LABNAME='Big-number explorer',MIND_CENTER='Large numbers';
const BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const ONES=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'],TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function w2(n){return n<20?ONES[n]:TENS[Math.floor(n/10)]+(n%10?'-'+ONES[n%10]:'')}
function w3(n){const h=Math.floor(n/100),r=n%100;return (h?ONES[h]+' hundred'+(r?' ':''):'')+(r?w2(r):'')}
function indName(n){if(n===0)return 'zero';const cr=Math.floor(n/1e7),la=Math.floor(n%1e7/1e5),th=Math.floor(n%1e5/1e3),rest=n%1e3;return [cr?w3(cr)+' crore':'',la?w2(la)+' lakh':'',th?w2(th)+' thousand':'',rest?w3(rest):''].filter(Boolean).join(' ')}
function intName(n){if(n===0)return 'zero';const b=Math.floor(n/1e9),m=Math.floor(n%1e9/1e6),th=Math.floor(n%1e6/1e3),rest=n%1e3;return [b?w3(b)+' billion':'',m?w3(m)+' million':'',th?w3(th)+' thousand':'',rest?w3(rest):''].filter(Boolean).join(' ')}
const indC=n=>n.toLocaleString('en-IN'),intC=n=>n.toLocaleString('en-US');
const PLACES=['Ones','Tens','Hundreds','Thousands','Ten thousands','Lakhs','Ten lakhs','Crores','Ten crores'];
function chart(x0,y0,n,w=50,hl=-1){const d=String(n).padStart(9,'0').split('');let s='';const grp=[[0,2,'Crores',PU],[2,4,'Lakhs',OR],[4,6,'Thousands',GN],[6,9,'Ones',BL]];
 grp.forEach(([a,b,nm,c])=>{s+=`<rect x="${x0+a*w}" y="${y0}" width="${(b-a)*w}" height="20" fill="${c}" opacity=".25"/>`+T(x0+(a+b)/2*w,y0+15,nm,'font-size="11" font-weight="700"')});
 ['TC','C','TL','L','TTh','Th','H','T','O'].forEach((p,i)=>{s+=`<rect x="${x0+i*w}" y="${y0+20}" width="${w}" height="20" fill="none" stroke="${GR}" stroke-width=".5"/>`+T(x0+i*w+w/2,y0+35,p,'font-size="10"')+`<rect x="${x0+i*w}" y="${y0+40}" width="${w}" height="34" fill="${i===hl?'#fde8c8':'none'}" stroke="${GR}" stroke-width=".5"/>`+T(x0+i*w+w/2,y0+64,String(n)>=''&&i>=9-String(n).length?d[i]:'','font-size="18" font-weight="700"')});return s}
function heroDraw(){return ['C','L','Th','O'].map((t,i)=>`<rect x="${40+i*70}" y="40" width="64" height="50" rx="6" fill="#fff" opacity="${0.4+i*0.15}"/><text x="${72+i*70}" y="72" font-size="18" text-anchor="middle" fill="#174a6d">${t}</text>`).join('')}
const HERO=heroDraw;
const MIND=[['A lakh and a crore',100,50],['Indian place value',420,50],['International system',90,150],['Number names',430,150],['Rounding & estimating',110,250],['Feel of big numbers',410,250]];

const C=[
{id:'n1',num:'1.1',title:'A lakh, a crore… how big? · लाख और करोड़',
 intro:'If you count one number every second, how long would it take to count to one lakh?',
 obj:'Understand the size of a lakh and a crore.',
 prior:'Class 6: numbers up to 1,00,000.',
 simple:'1 lakh = 1,00,000 = 100 thousands. 1 crore = 1,00,00,000 = 100 lakhs. Counting one number per second without stopping, 1 lakh takes about 28 hours, and 1 crore takes about 116 days!',
 detail:'10 lakh = 1,000,000 = 1 million (international system). 1 crore = 10 million. 100 crore = 1 billion. India\'s population is about 140 crore (1.4 billion). Large numbers appear in populations, distances in space, money in budgets, and the number of stars.',
 real:'A cricket stadium may hold about 1 lakh people (Narendra Modi Stadium, Ahmedabad holds about 1,32,000).',
 apply:'How many lakhs make one crore?',
 see:{w:520,h:200,f:[
  ['1 thousand = 1,000.',`<rect x="40" y="70" width="40" height="40" fill="${BL}" opacity=".5"/>`+lbl(60,135,'1,000')],
  ['1 lakh = 100 thousands.',[...Array(100)].map((_,k)=>`<rect x="${130+(k%10)*8}" y="${50+Math.floor(k/10)*8}" width="7" height="7" fill="${OR}" opacity=".6"/>`).join('')+lbl(170,150,'1,00,000')],
  ['1 crore = 100 lakhs.',[...Array(100)].map((_,k)=>`<rect x="${320+(k%10)*15}" y="${30+Math.floor(k/10)*13}" width="13" height="11" fill="${PU}" opacity=".5"/>`).join('')+lbl(395,175,'1,00,00,000','font-weight="700"')]]},
 seeNote:'Each step is 100 times bigger.',
 do:{title:'Counting time',mat:'Stopwatch',steps:['Time yourself counting 1 to 100 aloud.','Estimate time to count to 1 lakh.'],obs:'Many hours!',why:'Feel of large numbers.',lab:false},
 memo:'"100 thousand = lakh, 100 lakh = crore."',
 miscon:['"A crore is 10 lakhs." It is 100 lakhs.'],
 terms:['Lakh','Crore','Thousand'],
 q:{q:'1 crore = ? lakh',o:['10','100','1000','10,000'],a:1,why:'100 lakhs.'},
 exam:'Relations between lakh and crore: 1 mark.'},

{id:'n2',num:'1.2',title:'Indian place value and commas · भारतीय स्थानीय मान',
 intro:'Where do the commas go in 140854321?',
 obj:'Use the Indian place-value chart and commas.',
 prior:'1.1.',
 simple:'Indian places from right: ones, tens, hundreds, thousands, ten thousands, lakhs, ten lakhs, crores, ten crores. Commas: the first comma after 3 digits from the right (hundreds), then after every 2 digits: 14,08,54,321 (fourteen crore eight lakh fifty-four thousand three hundred twenty-one).',
 detail:'Each place is 10 times the place to its right. Place value of a digit = digit × value of its place: in 14,08,54,321, the 8 is in the lakhs place, so its value is 8,00,000. Zeros hold places: 5,00,07,000 has zeros in many places.',
 real:'Bank cheques and Indian newspapers use lakhs and crores with Indian commas.',
 apply:'Put commas in 52803006 (Indian system) and read it.',
 see:{w:520,h:180,f:[
  ['Place-value chart.',chart(35,30,140854321)],
  ['Commas: 3 digits, then every 2.',lbl(260,140,'14,08,54,321','font-size="22" font-weight="700"')],
  ['The 8 is in the lakhs place: 8,00,000.',`<rect x="${35+3*50}" y="70" width="50" height="34" fill="#fde8c8" opacity=".7"/>`+lbl(260,170,'fourteen crore eight lakh fifty-four thousand three hundred twenty-one','font-size="11"')]]},
 seeNote:'Indian commas: 3, then 2, 2…',
 do:{title:'Newspaper hunt',mat:'A newspaper',steps:['Find 5 large numbers.','Read them aloud in lakhs/crores.'],obs:'Budgets, populations.',why:'Indian system.',lab:false},
 memo:'"Three, then two-two-two."',
 miscon:['"Commas every 3 digits always." That is the international system.'],
 terms:['Place','Place value','Face value','Comma'],
 q:{q:'Place value of 7 in 3,47,25,610:',o:['7,00,000','70,00,000','7,000','70,000'],a:1,why:'Ten lakhs place.'},
 exam:'Write with commas and in words: 2 marks.'},

{id:'n3',num:'1.3',title:'The international system · अंतर्राष्ट्रीय प्रणाली',
 intro:'Why do some books say "1.4 billion" instead of "140 crore"?',
 obj:'Use millions and billions and convert between systems.',
 prior:'1.2.',
 simple:'International places: ones, tens, hundreds, thousands, ten thousands, hundred thousands, millions, ten millions, hundred millions, billions. Commas every 3 digits from the right: 140,854,321 (one hundred forty million eight hundred fifty-four thousand three hundred twenty-one).',
 detail:'Conversions: 1 million = 10 lakh; 10 million = 1 crore; 100 million = 10 crore; 1 billion = 100 crore. So 140 crore = 1,400 million = 1.4 billion.',
 real:'International news reports India\'s population as about 1.4 billion.',
 apply:'Write 25 lakh in millions.',
 see:{w:520,h:200,f:[
  ['Same number, two comma styles.',lbl(140,60,'Indian','font-weight="700"')+lbl(140,90,'14,08,54,321','font-size="18"')],
  ['International: commas every 3 digits.',lbl(380,60,'International','font-weight="700"')+lbl(380,90,'140,854,321','font-size="18"')],
  ['Conversions.',lbl(260,140,'10 lakh = 1 million · 1 crore = 10 million')+lbl(260,165,'100 crore = 1 billion','font-weight="700"')]]},
 seeNote:'Million = 10 lakh.',
 do:{title:'Convert it',mat:'Notebook',steps:['Write 5 numbers in both systems.','Read them both ways.'],obs:'Same number, different names.',why:'Two systems.',lab:true},
 memo:'"Million = 10 lakh; crore = 10 million; billion = 100 crore."',
 miscon:['"A million is a lakh." A million is 10 lakh.'],
 terms:['Million','Billion','International system'],
 q:{q:'1 million =',o:['1 lakh','10 lakh','1 crore','100 lakh'],a:1,why:'1,000,000.'},
 exam:'Convert between systems: 2 marks.'},

{id:'n4',num:'1.4',title:'Reading and writing number names · संख्याओं के नाम',
 intro:'How do you write "five crore seven thousand and twelve" in figures?',
 obj:'Convert between numerals and number names in both systems.',
 prior:'1.2, 1.3.',
 simple:'To read: group digits using commas, then read each group with its period name. 5,00,07,012 → five crore seven thousand twelve. To write in figures: fill each period carefully with zeros where needed.',
 detail:'Check: count the digits. Up to 9 digits → up to ten crores. Common errors are missing zeros: "two crore fifty thousand" = 2,00,50,000 (not 2,50,000). In the international system: 50,007,012 → fifty million seven thousand twelve.',
 real:'Cheques must have the amount in both words and figures.',
 apply:'Write "three crore four lakh six" in figures.',
 see:{w:520,h:180,f:[
  ['Number name.',lbl(260,40,'"five crore seven thousand twelve"','font-size="15"')],
  ['Fill the periods.',chart(35,60,50007012)],
  ['5,00,07,012.',lbl(260,170,'5,00,07,012','font-size="20" font-weight="700"')]]},
 seeNote:'Zeros keep places.',
 do:{title:'Cheque practice',mat:'Specimen cheque',steps:['Write ₹12,05,040 in words.'],obs:'Twelve lakh five thousand forty.',why:'Number names.',lab:false},
 memo:'"Group, name, check zeros."',
 miscon:['"Two crore fifty thousand = 2,50,000." Missing zeros.'],
 terms:['Number name','Numeral','Period'],
 q:{q:'"Seven lakh seven" in figures:',o:['7,07','7,00,007','70,007','7,000,007'],a:1,why:'Fill zeros.'},
 exam:'Write numbers in words/figures: 2 marks.'},

{id:'n5',num:'1.5',title:'Rounding and estimating · पूर्णांकन और अनुमान',
 intro:'A news report says "about 30 lakh people visited". Was it exactly 30,00,000?',
 obj:'Round large numbers and estimate sums and products.',
 prior:'Class 6: rounding.',
 simple:'Rounding gives a simpler nearby number. To round to the nearest lakh, look at the ten-thousands digit: 5 or more → round up; less than 5 → round down. 28,63,400 → 29,00,000 (nearest lakh). Estimation: round first, then calculate quickly: 4,98,000 + 3,07,000 ≈ 5,00,000 + 3,00,000 = 8,00,000.',
 detail:'Choose the rounding place by purpose: for crowds, nearest lakh or thousand; for money, nearest rupee or hundred. Estimates help check answers: if 2,45,000 × 4 gives 98,000, something is wrong (estimate ≈ 10,00,000).',
 real:'Election results, crowd sizes and budgets are often given as rounded figures.',
 apply:'Round 7,46,52,190 to the nearest crore.',
 see:{w:520,h:180,f:[
  ['28,63,400 lies between 28 lakh and 29 lakh.',`<line x1="60" y1="100" x2="460" y2="100" stroke="${ink}" stroke-width="2"/>`+lbl(60,130,'28,00,000')+lbl(460,130,'29,00,000')+`<line x1="260" y1="92" x2="260" y2="108" stroke="${GR}"/>`+lbl(260,130,'28,50,000','font-size="11"')],
  ['It is past the halfway mark.',`<circle cx="${60+400*0.634}" cy="100" r="7" fill="${OR}"/>`+lbl(60+400*0.634,80,'28,63,400','fill="'+OR+'"')],
  ['Rounded to the nearest lakh: 29,00,000.',`<path d="M${60+400*0.634} 100 Q360 60 460 95" fill="none" stroke="${GN}" stroke-width="2"/>`+lbl(260,170,'≈ 29 lakh','font-weight="700"')]]},
 seeNote:'Look at the digit to the right of the rounding place.',
 do:{title:'Estimate the crowd',mat:'Photo of a crowd, grid',steps:['Count people in one grid square.','Multiply by the number of squares.'],obs:'Approximate total.',why:'Estimation.',lab:false},
 memo:'"5 or more, raise the score."',
 miscon:['"Rounding changes the number a lot." It keeps it close and easy.'],
 terms:['Round off','Estimate','Nearest lakh/crore'],
 q:{q:'5,48,900 rounded to the nearest lakh:',o:['5,00,000','5,50,000','6,00,000','5,49,000'],a:0,why:'Ten-thousands digit is 4.'},
 exam:'Round and estimate: 2 marks.'},

{id:'n6',num:'1.6',title:'Getting a feel for large numbers · बड़ी संख्याओं का अनुभव',
 intro:'Is 1 crore seconds more or less than a year?',
 obj:'Relate large numbers to real quantities and explore digit puzzles.',
 prior:'1.1–1.5.',
 simple:'Compare big numbers with familiar things. 1 crore seconds ≈ 116 days (less than a year). A year has about 3 crore 15 lakh seconds. A stack of 1 lakh ₹500 notes (each about 0.1 mm thick) is about 10 m tall. Largest and smallest numbers from given digits: with 3, 0, 7, 5 → largest 7530, smallest 3057 (0 can\'t start).',
 detail:'Patterns: 1 + 9 = 10, 1 + 99 = 100, 1 + 999 = 1000 … Successor/predecessor of large numbers: after 9,99,999 comes 10,00,000. Using estimation, scientists express huge distances: Sun–Earth ≈ 15 crore km.',
 real:'Sun–Earth distance ≈ 15 crore km (150 million km).',
 apply:'What number comes just after 9,99,99,999?',
 see:{w:520,h:200,f:[
  ['1 crore seconds…',lbl(130,70,'1,00,00,000 s','font-size="18"')],
  ['…≈ 116 days.',lbl(380,70,'≈ 116 days','font-size="18" font-weight="700"')],
  ['Sun–Earth ≈ 15 crore km = 150 million km.',`<circle cx="70" cy="150" r="22" fill="#f2b632"/><circle cx="450" cy="150" r="9" fill="${BL}"/><line x1="95" y1="150" x2="438" y2="150" stroke="${GR}" stroke-dasharray="5 4"/>`+lbl(260,140,'≈ 15 crore km')]]},
 seeNote:'Compare with familiar things.',
 do:{title:'Big-number facts',mat:'Internet with adult, chart paper',steps:['Find 5 large numbers (population of Haryana, distance to Moon…).','Write them in both systems.'],obs:'A class poster.',why:'Feel for size.',lab:false},
 memo:'"Big numbers become friendly when compared."',
 miscon:['"0 can start a 4-digit number." Then it is a 3-digit number.'],
 terms:['Successor','Predecessor','Estimate'],
 q:{q:'Smallest 4-digit number with digits 3, 0, 7, 5 (each once):',o:['0357','3057','3075','5037'],a:1,why:'0 cannot be first.'},
 exam:'Largest/smallest numbers; successor: 2 marks.'}
];

const CARDS=[['Lakh','1,00,000 = 100 thousand.'],['Crore','1,00,00,000 = 100 lakh.'],['Indian commas','3 digits, then every 2: 14,08,54,321.'],['International commas','Every 3: 140,854,321.'],['Million','10 lakh.'],['Billion','100 crore.'],['Place value','Digit × place.'],['Rounding','Look right; 5 or more → up.'],['Estimate','Round first, then calculate.'],['Feel','1 crore seconds ≈ 116 days.']];

const Q=[
 {lv:1,q:'1 lakh =',o:['10,000','1,00,000','10,00,000','1,000'],a:1,w:'100 thousand.'},
 {lv:1,q:'Indian form of 54321678:',o:['54,321,678','5,43,21,678','543,21,678','54,32,16,78'],a:1,w:'3 then 2s.'},
 {lv:1,q:'1 billion =',o:['10 crore','100 crore','1000 crore','1 crore'],a:1,w:'100 crore.'},
 {lv:2,q:'Place value of 6 in 2,63,15,400:',o:['6,00,000','60,00,000','6,000','60,000'],a:1,w:'Ten lakhs.'},
 {lv:2,q:'"Two crore fifty thousand" in figures:',o:['2,50,000','2,00,50,000','2,05,00,000','20,50,000'],a:1,w:'Fill zeros.'},
 {lv:2,q:'25 lakh =',o:['2.5 million','25 million','0.25 million','250 million'],a:0,w:'10 lakh = 1 million.'},
 {lv:3,q:'7,46,52,190 rounded to nearest crore:',o:['7 crore','8 crore','7.5 crore','10 crore'],a:0,w:'Ten-lakhs digit 4.'},
 {lv:3,q:'Estimate 4,98,000 + 3,07,000:',o:['≈ 8 lakh','≈ 80 lakh','≈ 7 lakh','≈ 1 crore'],a:0,w:'5 + 3 lakh.'},
 {lv:4,q:'Successor of 9,99,99,999:',o:['10,00,00,000','9,99,99,998','1,00,00,000','99,99,99,999'],a:0,w:'+1.'},
 {lv:4,q:'Counting 1 per second, 1 crore takes about:',o:['1 day','11 days','116 days','10 years'],a:2,w:'10⁷ ÷ 86400.'},
 {lv:5,open:true,m:3,q:'Write 30405060 in both systems with commas and number names.',ans:['Indian: 3,04,05,060 (1)','three crore four lakh five thousand sixty (1)','International: 30,405,060 — thirty million four hundred five thousand sixty (1)']},
 {lv:5,open:true,m:2,q:'Form the largest and smallest 5-digit numbers using 4, 0, 9, 2, 7 once each.',ans:['Largest: 97,420 (1)','Smallest: 20,479 (1)']}
];

const ONEMIN=['Lakh = 100 thousand; crore = 100 lakh.','Indian commas 3-2-2; international every 3.','Million = 10 lakh; billion = 100 crore.','Number names: group, name, zeros.','Rounding and estimation.','Feel: 1 crore seconds ≈ 116 days.'];
const KEYS=[['lakh/crore',/lakh|crore/i],['commas',/comma/i],['million/billion',/million|billion/i],['place value',/place/i],['rounding',/round|estimat/i],['number names',/name|words/i]];

/* ---------- lab ---------- */
let n=140854321,quiz=null;
function draw(){let s=chart(5,10,Math.min(n,999999999));const r=+$('#nR').value;const rd=Math.round(n/r)*r;
 s+=T(230,120,'Indian: '+indC(n),'font-size="16" font-weight="700"')+T(230,146,'International: '+intC(n),'font-size="16" font-weight="700"');
 const secs=n,days=secs/86400;const feel=days<1?`${Math.round(secs/60)} minutes`:days<365?`${days.toFixed(0)} days`:`${(days/365).toFixed(1)} years`;
 s+=T(230,180,`Counting 1 per second: about ${feel}`,'font-size="13"')+T(230,204,`Stack of ${indC(n)} ₹10 notes ≈ ${(n*0.1/1000).toLocaleString('en-IN',{maximumFractionDigits:1})} m tall`,'font-size="13"');
 s+=T(230,236,`Rounded to nearest ${$('#nR').selectedOptions[0].text}: ${indC(rd)}`,'font-size="13" fill="'+OR+'" font-weight="700"');
 $('#nSvg').innerHTML=s;$('#nOut').innerHTML=`<p><b>Indian name:</b> ${indName(n)}</p><p><b>International name:</b> ${intName(n)}</p>`}
function labShow(){draw()}
function labInit(){}
function labClick(b){if(b.id==='nShow'){const v=Math.floor(Math.abs(+$('#nIn').value||0));if(v>999999999){$('#nOut').innerHTML='<p class="fb no">Please use numbers up to 99,99,99,999.</p>';return true}n=v;draw();return true}
 if(b.id==='nQ'){const parts=[Math.floor(Math.random()*99)+1,Math.random()<.4?0:Math.floor(Math.random()*99),Math.random()<.4?0:Math.floor(Math.random()*99),Math.random()<.5?0:Math.floor(Math.random()*999)];quiz=parts[0]*1e7+parts[1]*1e5+parts[2]*1e3+parts[3];$('#nOut').innerHTML=`<p><b>Write in figures:</b> "${indName(quiz)}"</p>`;return true}
 if(b.id==='nC'){if(quiz===null){$('#nOut').innerHTML='<p>Press Quiz first.</p>';return true}const v=+String($('#nA').value).replace(/[,\s]/g,'');$('#nOut').innerHTML=v===quiz?`<p class="fb ok">Correct! ${indC(quiz)} (international ${intC(quiz)}).</p>`:`<p class="fb no">Not quite. Answer: ${indC(quiz)}. Check the zeros in empty periods.</p>`;n=quiz;draw();$('#nOut').innerHTML=(v===quiz?`<p class="fb ok">Correct! ${indC(quiz)}</p>`:`<p class="fb no">Not quite. Answer: ${indC(quiz)}. Check the zeros in empty periods.</p>`)+`<p><b>International:</b> ${intC(quiz)} — ${intName(quiz)}</p>`;quiz=null;return true}return false}
function labChange(t){if(t.id==='nR'){draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
