/* Rai Plus content pack: Class 7 Mathematics (Ganita Prakash), Chapter 3 – A Peek Beyond the Point. */
RP.register({key:'7mat03',cls:'7',subject:'Mathematics',ch:'3',title:"A Peek Beyond the Point",color:'#2c7a5b',
crumb:"Class 7 Mathematics · Ganita Prakash",h1:"Chapter 3: A Peek Beyond the Point",sub:"Tenths and hundredths, decimal place value, decimals on the number line, comparing, adding and subtracting decimals, and decimals in measurement.",heroLabel:"A ruler zoomed in between two centimetre marks",labName:'Decimal zoom lab',
theme:"\n:root{--g:light-dark(#2c7a5b,#8fd6b8);--g2:light-dark(#e6f4ee,#0a1a14);--line:light-dark(#c8e6d8,#1f3f32);--bg:light-dark(#ffffff,#07110d);--card:light-dark(#ffffff,#0c1812);\n--ink:light-dark(#0d241b,#dff1e9);--mute:light-dark(#466457,#a8c9ba);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#1f5c43}\n",
labHTML:`  <h2>Decimal zoom lab</h2>
  <p>Pick a decimal. Zoom the number line in step by step: whole numbers → tenths → hundredths. See it on a 100-square grid too. Then play "Which is greater?"</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="dSvg" viewBox="0 0 460 320" role="img" aria-label="Decimal number line zoom" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Decimal<input id="dIn" type="number" step="0.01" min="0" max="9.99" value="2.47" style="width:6em"></label><button class="btn" id="dGo">Show</button></div>
  <div class="ctrl"><label>Zoom level<select id="dZ"><option value="0">0 to 10 (wholes)</option><option value="1">tenths</option><option value="2" selected>hundredths</option></select></label></div>
  <div class="ctrl"><button class="btn" id="dQ">Which is greater? (new)</button> <button class="btn" data-g="0">Left</button> <button class="btn" data-g="1">Right</button></div>
  <div class="box y" id="dOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#2c7a5b',LABNAME='Decimal zoom lab',MIND_CENTER='Decimals';
const GN='#2c7a5b',OR='#b04a1f',BL='#1f5f8b',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
function ruler(x0,y,len,from,to,step,lab,hl){const n=Math.round((to-from)/step);const u=len/n;let s=`<line x1="${x0}" y1="${y}" x2="${x0+len}" y2="${y}" stroke="${ink}" stroke-width="2"/>`;for(let i=0;i<=n;i++){const v=from+i*step,x=x0+i*u;const big=lab(i);s+=`<line x1="${x}" y1="${y-(big?9:5)}" x2="${x}" y2="${y+(big?9:5)}" stroke="${ink}" stroke-width="${big?1.4:.7}"/>`+(big?T(x,y+24,(+v.toFixed(2)).toString(),'font-size="11"'):'')}if(hl!==undefined)s+=`<circle cx="${x0+(hl-from)/(to-from)*len}" cy="${y}" r="6" fill="${OR}"/>`;return s}
function grid(x0,y0,n,u=12){let s='';for(let i=0;i<100;i++){s+=`<rect x="${x0+(i%10)*u}" y="${y0+Math.floor(i/10)*u}" width="${u}" height="${u}" fill="${i<n?GN:'none'}" opacity="${i<n?.65:1}" stroke="${GR}" stroke-width=".4"/>`}return s}
function heroDraw(){return `<line x1="30" y1="80" x2="350" y2="80" stroke="#fff" stroke-width="3"/>`+[...Array(11)].map((_,k)=>`<line x1="${30+k*32}" y1="${k%5?72:64}" x2="${30+k*32}" y2="${k%5?88:96}" stroke="#fff" stroke-width="2"/>`).join('')+`<circle cx="${30+7*32}" cy="80" r="7" fill="#fff"/>`}
const HERO=heroDraw;
const MIND=[['Tenths',100,50],['Hundredths',420,50],['Place value',90,150],['Number line',430,150],['Comparing',110,250],['Add & subtract',410,250]];

const C=[
{id:'d1',num:'3.1',title:'Tenths: parts of one · दशांश',
 intro:'Your pencil is more than 7 cm but less than 8 cm. How do you write its exact length?',
 obj:'Understand tenths and the decimal point.',
 prior:'Class 6: fractions; measuring with a ruler.',
 simple:'When one unit is divided into 10 equal parts, each part is one-tenth: 1/10, written 0.1. On a ruler, 1 cm has 10 mm, so 1 mm = 0.1 cm. A pencil 7 cm and 4 mm long is 7 + 4/10 = 7.4 cm. The dot is the decimal point: digits to its right are parts of one.',
 detail:'7.4 is read "seven point four". 0.5 = 5/10 = 1/2. 10 tenths make 1 whole: 0.1 × 10 = 1. Indian money: 10 paise was once one-tenth of a rupee (₹0.10).',
 real:'Body temperature 98.6 °F; 37.5 °C — tenths in thermometers.',
 apply:'Write 3 cm 9 mm in cm.',
 see:{w:520,h:200,f:[
  ['A ruler from 7 cm to 8 cm.',ruler(60,100,400,7,8,0.1,i=>i%10===0)],
  ['10 equal parts: each 0.1 cm (1 mm).',ruler(60,100,400,7,8,0.1,i=>true)],
  ['7 cm and 4 mm = 7.4 cm.',`<rect x="60" y="60" width="160" height="16" fill="${GN}" opacity=".5"/>`+`<circle cx="220" cy="100" r="7" fill="${OR}"/>`+lbl(220,160,'7.4 cm','font-size="16" font-weight="700"')]]},
 seeNote:'1 mm = 0.1 cm.',
 do:{title:'Measure in decimals',mat:'Ruler, 5 small objects',steps:['Measure each to the nearest mm.','Write the length in cm as a decimal.'],obs:'e.g. 6.3 cm.',why:'Tenths.',lab:true},
 memo:'"One-tenth = 0.1 = one millimetre of a centimetre."',
 miscon:['"7.4 cm means 7 cm and 4 cm." It means 7 and 4 tenths.'],
 terms:['Tenth','Decimal point','Decimal'],
 q:{q:'5 mm in cm is:',o:['5 cm','0.5 cm','0.05 cm','50 cm'],a:1,why:'5/10 cm.'},
 exam:'Convert mm to cm as decimals: 1 mark.'},

{id:'d2',num:'3.2',title:'Hundredths · शतांश',
 intro:'₹2 and 47 paise — how do we write that?',
 obj:'Understand hundredths and write money and lengths with two decimal places.',
 prior:'3.1.',
 simple:'Divide one unit into 100 equal parts: each is one-hundredth, 1/100 = 0.01. Divide a tenth into 10 parts: each is a hundredth. ₹1 = 100 paise, so 1 paise = ₹0.01 and ₹2 and 47 paise = ₹2.47. 1 m = 100 cm, so 1 cm = 0.01 m: 1 m 35 cm = 1.35 m.',
 detail:'2.47 = 2 + 4/10 + 7/100 = 2 + 47/100. On a 10 × 10 grid, 0.47 is 47 small squares (4 full rows + 7 more). 0.4 = 0.40 (40 hundredths) — writing a zero at the end does not change the value.',
 real:'Petrol prices like ₹94.72 per litre use hundredths.',
 apply:'Write 3 m 6 cm in metres.',
 see:{w:520,h:200,f:[
  ['A 10 × 10 grid: 1 whole.',grid(60,30,0,14)],
  ['47 hundredths shaded.',grid(60,30,47,14)],
  ['0.47 = 4 tenths + 7 hundredths.',lbl(360,90,'0.47','font-size="26" font-weight="700"')+lbl(360,125,'= 4/10 + 7/100')+lbl(360,150,'₹0.47 = 47 paise')]]},
 seeNote:'Two places after the point = hundredths.',
 do:{title:'Price tags',mat:'Shop receipts',steps:['Write 5 prices.','Say rupees and paise for each.'],obs:'₹12.50 = 12 rupees 50 paise.',why:'Hundredths.',lab:false},
 memo:'"100 paise = ₹1, so 1 paise = ₹0.01."',
 miscon:['"3 m 6 cm = 3.6 m." It is 3.06 m.'],
 terms:['Hundredth','Paise','Two decimal places'],
 q:{q:'₹5 and 8 paise =',o:['₹5.8','₹5.08','₹5.80','₹58'],a:1,why:'8/100.'},
 exam:'Write money/length as decimals: 2 marks.'},

{id:'d3',num:'3.3',title:'Decimal place value · दशमलव स्थानीय मान',
 intro:'In 36.25, what is the value of the 2?',
 obj:'Use the place-value chart for decimals.',
 prior:'3.1, 3.2.',
 simple:'Places to the left of the point: ones, tens, hundreds… Places to the right: tenths, hundredths, thousandths… Each place is 1/10 of the place to its left. In 36.25: 3 tens, 6 ones, 2 tenths, 5 hundredths. Value of 2 = 2/10 = 0.2.',
 detail:'Expanded form: 36.25 = 30 + 6 + 0.2 + 0.05 = 3 × 10 + 6 × 1 + 2 × 1/10 + 5 × 1/100. Thousandths (0.001) are used in grams and kilograms: 1 g = 0.001 kg.',
 real:'1.250 kg of rice = 1 kg 250 g.',
 apply:'Write 405.06 in expanded form.',
 see:{w:520,h:180,f:[
  ['Place-value chart.',['Tens','Ones','•','Tenths','Hundredths'].map((p,i)=>`<rect x="${70+i*80}" y="40" width="76" height="26" fill="${i===2?'none':GN}" opacity=".2"/>`+T(108+i*80,58,p,'font-size="11" font-weight="700"')).join('')],
  ['36.25 in the chart.',['3','6','.','2','5'].map((d,i)=>T(108+i*80,100,d,'font-size="26" font-weight="700"')).join('')],
  ['= 30 + 6 + 0.2 + 0.05',lbl(260,150,'36.25 = 30 + 6 + 0.2 + 0.05','font-size="16"')]]},
 seeNote:'Each place is a tenth of the one on its left.',
 do:{title:'Build with blocks',mat:'Base-10 blocks (flat = 1, long = 0.1, cube = 0.01)',steps:['Build 1.34.','Exchange 10 cubes for a long.'],obs:'Regrouping works like whole numbers.',why:'Place value.',lab:false},
 memo:'"Tens, ones, POINT, tenths, hundredths."',
 miscon:['"The first place after the point is tens." It is tenths.'],
 terms:['Tenths place','Hundredths place','Expanded form','Thousandths'],
 q:{q:'Value of 5 in 12.35:',o:['5','0.5','0.05','50'],a:2,why:'Hundredths.'},
 exam:'Place value and expanded form: 2 marks.'},

{id:'d4',num:'3.4',title:'Decimals on the number line · संख्या रेखा पर दशमलव',
 intro:'Where exactly is 2.47 between 2 and 3?',
 obj:'Locate decimals on a number line by zooming in.',
 prior:'3.3.',
 simple:'Zoom in: 2.47 is between 2 and 3. Divide 2–3 into 10 parts (tenths): it is between 2.4 and 2.5. Divide 2.4–2.5 into 10 parts (hundredths): it is at the 7th mark — 2.47.',
 detail:'Every decimal has a place on the number line. Between any two decimals there are more decimals: between 2.4 and 2.5 are 2.41, 2.42, …; between 2.41 and 2.42 are 2.411, 2.412, … — we can keep zooming forever.',
 real:'A cricket run rate of 7.45 lies between 7.4 and 7.5.',
 apply:'Name three decimals between 0.6 and 0.7.',
 see:{w:520,h:240,f:[
  ['0 to 10: 2.47 is between 2 and 3.',ruler(40,50,440,0,10,1,i=>true,2.47)],
  ['Zoom: between 2.4 and 2.5.',ruler(40,120,440,2,3,0.1,i=>true,2.47)],
  ['Zoom again: at 2.47.',ruler(40,190,440,2.4,2.5,0.01,i=>i%5===0,2.47)]]},
 seeNote:'Zoom in by tenths.',
 do:{title:'Human number line',mat:'Rope with 0 and 1 marked, cards',steps:['Mark tenths with clips.','Stand at 0.3, 0.75, 0.5.'],obs:'Positions between tenths.',why:'Decimals on the line.',lab:false},
 memo:'"Zoom, zoom, find it."',
 miscon:['"There are no numbers between 2.4 and 2.5." There are infinitely many.'],
 terms:['Number line','Zoom','Between'],
 q:{q:'2.47 lies between:',o:['2.3 and 2.4','2.4 and 2.5','2.5 and 2.6','24 and 25'],a:1,why:'Zoom.'},
 exam:'Represent decimals on a number line: 2 marks.'},

{id:'d5',num:'3.5',title:'Comparing decimals · दशमलवों की तुलना',
 intro:'Which is greater: 0.5 or 0.45?',
 obj:'Compare and order decimals.',
 prior:'3.3, 3.4.',
 simple:'Compare the whole-number parts first. If equal, compare tenths; if equal, compare hundredths. 0.5 vs 0.45: tenths 5 > 4, so 0.5 > 0.45. Writing equal numbers of decimal places helps: 0.50 vs 0.45.',
 detail:'Common trap: "0.45 has more digits so it is bigger" — wrong! Compare place by place. Ordering: 1.09 < 1.1 < 1.19 < 1.9. On a number line, the decimal to the right is greater.',
 real:'Athletics: a 100 m time of 10.05 s beats 10.5 s.',
 apply:'Arrange 3.3, 3.03, 3.33, 3.303 in increasing order.',
 see:{w:520,h:200,f:[
  ['0.5 and 0.45 on grids.',grid(60,30,50,12)+grid(260,30,45,12)],
  ['50 squares vs 45 squares.',lbl(120,170,'0.5 = 0.50')+lbl(320,170,'0.45')],
  ['0.5 > 0.45',lbl(450,90,'0.5 > 0.45','font-size="18" font-weight="700"')]]},
 seeNote:'Compare place by place, not by length.',
 do:{title:'Race results',mat:'List of race times',steps:['Order the times from fastest to slowest.'],obs:'Smallest time wins.',why:'Comparing decimals.',lab:true},
 memo:'"Line up the points, then compare."',
 miscon:['"0.45 > 0.5 because 45 > 5." Compare tenths first.'],
 terms:['Compare','Order','Equal decimals'],
 q:{q:'Which is the greatest?',o:['0.8','0.75','0.799','0.09'],a:0,why:'8 tenths.'},
 exam:'Compare/order decimals: 2 marks.'},

{id:'d6',num:'3.6',title:'Adding and subtracting decimals · दशमलवों का जोड़-घटाव',
 intro:'You buy a pen for ₹12.75 and a notebook for ₹38.50. How much in all?',
 obj:'Add and subtract decimals by lining up the decimal points.',
 prior:'3.3; whole-number addition.',
 simple:'Write the numbers so the decimal points are in a column (fill empty places with zeros). Add or subtract as with whole numbers, and put the point in the answer directly below. 12.75 + 38.50 = 51.25. Change from ₹100: 100.00 − 51.25 = 48.75.',
 detail:'Carrying and borrowing work exactly as with whole numbers: 10 hundredths = 1 tenth, 10 tenths = 1 one. Estimate first: 12.75 + 38.50 ≈ 13 + 39 = 52. Units must match: 1.5 m + 30 cm = 1.5 m + 0.30 m = 1.8 m.',
 real:'Shopkeepers add bills with decimals every day.',
 apply:'Find 7.5 − 2.38.',
 see:{w:520,h:200,f:[
  ['Line up the decimal points.',lbl(260,50,'  12.75','font-size="22" font-family="monospace"')+lbl(260,85,'+ 38.50','font-size="22" font-family="monospace"')+`<line x1="190" y1="98" x2="330" y2="98" stroke="${ink}" stroke-width="2"/>`],
  ['Add column by column; carry as usual.',lbl(260,130,'  51.25','font-size="22" font-family="monospace" font-weight="700"')],
  ['Estimate check: 13 + 39 ≈ 52 ✓',lbl(260,180,'estimate: 13 + 39 ≈ 52','fill="'+GN+'"')]]},
 seeNote:'Points in a column.',
 do:{title:'Bill check',mat:'A real bill',steps:['Add the items yourself.','Compare with the printed total.'],obs:'Same total.',why:'Decimal addition.',lab:true},
 memo:'"Point under point."',
 miscon:['"7.5 − 2.38 = 5.23" (ignoring place). Write 7.50 − 2.38 = 5.12.'],
 terms:['Line up','Carry','Borrow','Estimate'],
 q:{q:'4.6 + 2.75 =',o:['6.81','7.35','6.135','7.81'],a:1,why:'4.60 + 2.75.'},
 exam:'Word problems with decimals: 3 marks.'}
];

const CARDS=[['Tenth','1/10 = 0.1; 1 mm = 0.1 cm.'],['Hundredth','1/100 = 0.01; 1 paise = ₹0.01.'],['Place value','Tens, ones . tenths, hundredths.'],['Expanded form','36.25 = 30 + 6 + 0.2 + 0.05.'],['Trailing zero','0.4 = 0.40.'],['Number line','Zoom: tenths, then hundredths.'],['Between','Infinitely many decimals.'],['Compare','Whole part, then tenths, then hundredths.'],['Add/subtract','Line up points; fill zeros.'],['Units','1 m = 100 cm; 1 kg = 1000 g.']];

const Q=[
 {lv:1,q:'7 tenths =',o:['7','0.7','0.07','70'],a:1,w:'7/10.'},
 {lv:1,q:'₹3 and 5 paise =',o:['₹3.5','₹3.05','₹3.50','₹35'],a:1,w:'5/100.'},
 {lv:1,q:'Value of 4 in 2.84:',o:['4','0.4','0.04','40'],a:2,w:'Hundredths.'},
 {lv:2,q:'Which is greater: 0.6 or 0.58?',o:['0.6','0.58','equal','can\'t tell'],a:0,w:'Tenths 6 > 5.'},
 {lv:2,q:'2 m 7 cm in metres:',o:['2.7 m','2.07 m','27 m','2.007 m'],a:1,w:'7/100.'},
 {lv:2,q:'3.4 + 1.25 =',o:['4.65','4.29','4.59','15.9'],a:0,w:'3.40 + 1.25.'},
 {lv:3,q:'8 − 3.65 =',o:['5.35','4.35','5.65','4.65'],a:1,w:'8.00 − 3.65.'},
 {lv:3,q:'Expanded form of 50.07:',o:['50 + 0.7','50 + 0.07','5 + 0.07','50 + 7'],a:1,w:'7 hundredths.'},
 {lv:4,q:'Increasing order:',o:['1.1, 1.09, 1.19','1.09, 1.1, 1.19','1.19, 1.1, 1.09','1.1, 1.19, 1.09'],a:1,w:'Place by place.'},
 {lv:4,q:'Pen ₹12.75 + notebook ₹38.50; change from ₹100:',o:['₹48.75','₹51.25','₹49.25','₹47.75'],a:0,w:'100 − 51.25.'},
 {lv:5,open:true,m:3,q:'Show 0.37 on a 10 × 10 grid and on a number line (describe).',ans:['Shade 37 of 100 squares (3 full rows + 7) (1)','Number line: zoom 0–1 into tenths; between 0.3 and 0.4 (1)','Zoom 0.3–0.4 into hundredths; mark 7th point (1)']},
 {lv:5,open:true,m:3,q:'Riya walked 1.75 km in the morning and 2.4 km in the evening. How much more in the evening? Total?',ans:['2.40 − 1.75 = 0.65 km more (1.5)','Total = 1.75 + 2.40 = 4.15 km (1.5)']}
];

const ONEMIN=['Tenths (0.1) and hundredths (0.01).','Money and lengths as decimals.','Decimal place value; expanded form.','Number line: zoom in.','Compare place by place.','Add/subtract: line up points.'];
const KEYS=[['tenths',/tenth|0\.1/i],['hundredths',/hundredth|0\.01|paise/i],['place value',/place/i],['number line',/number line|zoom/i],['compare',/compar|greater/i],['add/subtract',/add|subtract|line up/i]];

/* ---------- lab ---------- */
let v=2.47,z=2,quiz=null;
function draw(){let s='';const a=Math.floor(v),t=Math.floor(Math.round(v*100)/10)/10;
 s+=T(230,22,'Zoom into '+v.toFixed(2),'font-size="15" font-weight="700"');
 s+=ruler(30,60,400,0,10,1,i=>true,v);if(z>=1){s+=`<path d="M${30+a*40} 70 L30 100 M${30+(a+1)*40} 70 L430 100" stroke="${GR}" stroke-dasharray="3 3"/>`+ruler(30,120,400,a,a+1,0.1,i=>true,v)}
 if(z>=2){s+=`<path d="M${30+(t-a)*400} 130 L30 160 M${30+(t-a+0.1)*400} 130 L430 160" stroke="${GR}" stroke-dasharray="3 3"/>`+ruler(30,180,400,t,t+0.1,0.01,i=>true,v)}
 const hun=Math.round((v-a)*100);s+=grid(300,215,hun,9)+T(240,255,`${a} whole${a===1?'':'s'} +`,'font-size="13"')+T(400,262,`${hun}/100`,'font-size="13" text-anchor="start"');
 $('#dSvg').innerHTML=s;const d=v.toFixed(2).split('.');
 $('#dOut').innerHTML=`<p><b>${v.toFixed(2)}</b> = ${a} + ${d[1][0]}/10 + ${d[1][1]}/100 = ${a} + ${+d[1]}/100</p><p>Between ${t.toFixed(1)} and ${(t+0.1).toFixed(1)} on the number line.</p>`}
function labShow(){draw()}
function labInit(){}
function labClick(b){if(b.id==='dGo'){const x=+$('#dIn').value;if(!(x>=0&&x<10)){$('#dOut').innerHTML='<p class="fb no">Enter a decimal from 0 to 9.99.</p>';return true}v=Math.round(x*100)/100;draw();return true}
 if(b.id==='dQ'){const base=Math.floor(Math.random()*5);const traps=[[0.5,0.45],[0.3,0.29],[1.09,1.1],[2.7,2.65],[0.08,0.1],[3.33,3.3],[0.9,0.89],[4.05,4.5]];const p=traps[Math.floor(Math.random()*traps.length)].map(x=>+(x+base).toFixed(2));if(Math.random()<.5)p.reverse();quiz=p;$('#dSvg').innerHTML=T(130,160,String(p[0]),'font-size="36" font-weight="700"')+T(230,160,'?','font-size="30"')+T(330,160,String(p[1]),'font-size="36" font-weight="700"');$('#dOut').innerHTML='<p>Which is greater?</p>';return true}
 if(b.dataset&&b.dataset.g!==undefined){if(!quiz){$('#dOut').innerHTML='<p>Press "Which is greater?" first.</p>';return true}const g=quiz[+b.dataset.g],o=quiz[1-b.dataset.g];const ok=g>o;$('#dOut').innerHTML=`<p class="fb ${ok?'ok':'no'}">${ok?'Correct!':'Not quite.'} ${Math.max(...quiz)} > ${Math.min(...quiz)}. Compare the whole part, then tenths, then hundredths.</p>`;v=Math.max(...quiz);quiz=null;return true}return false}
function labChange(t){if(t.id==='dZ'){z=+t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
