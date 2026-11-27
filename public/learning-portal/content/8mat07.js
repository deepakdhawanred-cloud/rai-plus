/* Rai Plus content pack: Class 8 Mathematics (Ganita Prakash), Chapter 7 – Proportional Reasoning-1. */
RP.register({key:'8mat07',cls:'8',subject:'Mathematics',ch:'7',title:"Proportional Reasoning-1",color:'#b04a1f',
crumb:"Class 8 Mathematics · Ganita Prakash",h1:"Chapter 7: Proportional Reasoning-1",sub:"Why stretched pictures look wrong, ratios and their simplest form, proportions, the factor of change, sharing in a ratio, and unit conversions.",heroLabel:"A picture resized in proportion",labName:'Picture resizer and ratio lab',
theme:"\n:root{--g:light-dark(#b04a1f,#f2a77f);--g2:light-dark(#fbefe9,#21110a);--line:light-dark(#f0d6ca,#47271a);--bg:light-dark(#ffffff,#130a06);--card:light-dark(#ffffff,#1c100a);\n--ink:light-dark(#2a1309,#f7e6dd);--mute:light-dark(#6e4f42,#d2b4a6);--y:light-dark(#1f5f8b,#8fc2e6);--y2:light-dark(#e8f1f8,#0b1622);--hd:#8a3815}\n",
labHTML:`  <h2>Picture resizer and ratio lab</h2>
  <p>Resize mode: the original picture is 3 cm wide and 2 cm tall. Change width and height — when the ratio stays 3 : 2, the picture looks right; otherwise it stretches. Share mode: divide an amount in a given ratio.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="prSvg" viewBox="0 0 460 320" role="img" aria-label="Picture resizing" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="prM"><option value="r">Resize a picture</option><option value="s">Share in a ratio</option></select></label></div>
  <div class="ctrl" id="prR"><label>Width (cm): <b id="prWv"></b><input type="range" class="prS" id="prW" min="3" max="15" value="9"></label> <label>Height (cm): <b id="prHv"></b><input type="range" class="prS" id="prH" min="2" max="10" value="6"></label></div>
  <div class="ctrl" id="prSh" style="display:none"><label>Amount ₹<input id="prAmt" type="number" value="1200" style="width:6em"></label> <label>Ratio<input id="prA" type="number" value="3" style="width:3.5em"> : <input id="prB" type="number" value="5" style="width:3.5em"></label> <button class="btn" id="prGo">Share</button></div>
  <div class="box y" id="prOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#b04a1f',LABNAME='Picture resizer and ratio lab',MIND_CENTER='Proportional reasoning';
const OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const gcd=(a,b)=>b?gcd(b,a%b):a;
function face(x,y,w,h,c=OR){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#fdf3e7" stroke="${c}" stroke-width="2"/><circle cx="${x+w/2}" cy="${y+h/2}" r="${Math.min(w,h)*0.32}" fill="#ffd9a8" stroke="${ink}" stroke-width="1" transform="translate(${x+w/2} ${y+h/2}) scale(${w/Math.min(w,h)*.75} ${h/Math.min(w,h)*.75}) translate(${-(x+w/2)} ${-(y+h/2)})"/>`+`<circle cx="${x+w*.42}" cy="${y+h*.45}" r="2.5" fill="${ink}"/><circle cx="${x+w*.58}" cy="${y+h*.45}" r="2.5" fill="${ink}"/><path d="M${x+w*.42} ${y+h*.6} Q${x+w/2} ${y+h*.68} ${x+w*.58} ${y+h*.6}" fill="none" stroke="${ink}" stroke-width="1.5"/>`}
function heroDraw(){return `<rect x="90" y="60" width="60" height="40" fill="none" stroke="#fff" stroke-width="2.5"/><rect x="190" y="40" width="120" height="80" fill="none" stroke="#fff" stroke-width="2.5"/>`}
const HERO=heroDraw;
const MIND=[['Looks right?',100,50],['Ratios & simplest form',420,50],['Proportions',90,150],['Factor of change',430,150],['Sharing in a ratio',110,250],['Unit conversions',410,250]];

const C=[
{id:'r1',num:'7.1',title:'Why do stretched pictures look wrong?',
 intro:'Your photo is 3 cm wide and 2 cm tall. You enlarge it to 9 cm × 3 cm — why does it look squashed?',
 obj:'Understand that shapes look similar when width and height change by the same factor.',
 prior:'Class 6–7: ratio basics, multiplication.',
 simple:'A picture keeps its shape only if its width and height are multiplied by the same number. 3 × 2 → 9 × 6 (both × 3) looks right. 3 × 2 → 9 × 3 (width × 3, height × 1.5) looks stretched. The ratio of width to height must stay the same: 3 : 2 = 9 : 6.',
 detail:'This is why phone and TV screens have fixed aspect ratios like 16 : 9. Maps and models are drawn "to scale": every length is multiplied by the same scale factor. Similar figures have equal ratios of corresponding sides.',
 real:'Passport photos must be 3.5 cm × 4.5 cm — resizing must keep this ratio.',
 apply:'A 4 cm × 6 cm picture is enlarged so its width is 10 cm. What should its height be?',
 see:{w:520,h:220,f:[
  ['Original 3 × 2.',face(30,80,60,40)+lbl(60,140,'3 × 2')],
  ['Both × 3: 9 × 6 looks right.',face(130,30,180,120,GN)+lbl(220,170,'9 × 6 ✓','fill="'+GN+'"')],
  ['Width × 3, height × 1.5: stretched.',face(330,90,180,60,OR)+lbl(420,170,'9 × 3 ✗','fill="'+OR+'"')]]},
 seeNote:'Same factor for both.',
 do:{title:'Photo resize',mat:'Phone or computer photo app',steps:['Stretch a photo freely, then with "keep proportions".'],obs:'Freely stretched looks odd.',why:'Ratio changed.',lab:true},
 memo:'"Multiply both by the same."',
 miscon:['"Adding the same amount keeps the shape." 3 × 2 → 5 × 4 (add 2) changes the shape.'],
 terms:['Aspect ratio','Scale factor','Similar shapes'],
 q:{q:'Which enlargement of a 3 × 2 picture keeps its shape?',o:['6 × 3','6 × 4','5 × 4','9 × 4'],a:1,why:'Both × 2.'},
 exam:'Recognise proportional resizing: 1–2 marks.'},

{id:'r2',num:'7.2',title:'Ratios and their simplest form',
 intro:'A wall has 12 grey bricks and 8 red bricks. How do we compare them?',
 obj:'Write ratios and simplify them.',
 prior:'7.1; HCF.',
 simple:'A ratio a : b compares two quantities of the same kind by division ("a for every b"). 12 grey : 8 red = 12 : 8. Simplify by dividing both terms by their HCF: 12 : 8 = 3 : 2 (HCF 4). Ratios are equal if they simplify to the same form: 6 : 4 = 9 : 6 = 3 : 2.',
 detail:'Quantities must be in the same units: 50 cm : 2 m = 50 : 200 = 1 : 4. Order matters: 3 : 2 is not the same as 2 : 3. Ratios can compare part to part (grey : red) or part to whole (grey : total = 12 : 20 = 3 : 5). Ratios with decimals or fractions can be made whole: 1.5 : 2 = 3 : 4.',
 real:'Body proportions: an adult\'s height is roughly 7–8 times the head height.',
 apply:'Simplify 45 : 60 and 2.5 kg : 750 g.',
 see:{w:520,h:200,f:[
  ['12 grey : 8 red.',[...Array(20)].map((_,k)=>`<rect x="${30+(k%10)*44}" y="${40+Math.floor(k/10)*30}" width="40" height="24" fill="${k<12?GR:OR}" opacity=".7"/>`).join('')],
  ['Divide both by 4.',lbl(260,130,'12 : 8 = (12 ÷ 4) : (8 ÷ 4)','font-size="16"')],
  ['= 3 : 2.',lbl(260,170,'= 3 : 2','font-size="22" font-weight="700" fill="'+OR+'"')]]},
 seeNote:'Divide by the HCF.',
 do:{title:'Class ratios',mat:'Class data',steps:['Find boys : girls, students with glasses : without.','Simplify.'],obs:'Simplest forms.',why:'Ratio practice.',lab:false},
 memo:'"Same units, then divide by HCF."',
 miscon:['"50 cm : 2 m = 50 : 2." Convert to the same unit first: 50 : 200 = 1 : 4.'],
 terms:['Ratio','Terms of a ratio','Simplest form','Equivalent ratios'],
 q:{q:'18 : 24 in simplest form:',o:['9 : 12','3 : 4','6 : 8','4 : 3'],a:1,why:'HCF 6.'},
 exam:'Simplify ratios: 1–2 marks.'},

{id:'r3',num:'7.3',title:'Proportions',
 intro:'Is 4 : 7 :: 12 : 21 a true statement? How do you check quickly?',
 obj:'Identify and solve proportions.',
 prior:'7.2.',
 simple:'Two equal ratios form a proportion: a : b :: c : d (read "a is to b as c is to d"). Check by simplifying both ratios, or by cross-multiplying: a × d = b × c. 4 : 7 :: 12 : 21 is true because 4 × 21 = 84 = 7 × 12. To find a missing term: 3 : 5 :: x : 40 → 3 × 40 = 5x → x = 24.',
 detail:'In a : b :: c : d, a and d are the extremes, b and c the means; product of extremes = product of means. 8 : 3 :: 24 : 6 is false (48 ≠ 72). Proportions solve recipe, map and price problems.',
 real:'If 3 pens cost ₹45, 7 pens cost? 3 : 45 :: 7 : x → x = ₹105.',
 apply:'Find x: 5 : 8 :: 15 : x.',
 see:{w:520,h:200,f:[
  ['4 : 7 :: 12 : 21',lbl(260,50,'4 : 7 :: 12 : 21','font-size="22"')],
  ['Extremes × means.',lbl(260,105,'4 × 21 = 84    7 × 12 = 84','font-size="17"')],
  ['Equal → true proportion.',lbl(260,160,'equal products → proportion ✓','font-size="16" font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Cross-multiply to check.',
 do:{title:'True or false',mat:'Proportion cards',steps:['Check 8 statements by cross-multiplying.'],obs:'Some false.',why:'Proportion test.',lab:false},
 memo:'"Outside × outside = inside × inside."',
 miscon:['"7 : 12 :: 12 : 7 is a proportion." 49 ≠ 144.'],
 terms:['Proportion (::)','Extremes','Means','Cross-multiplication'],
 q:{q:'Find x: 2 : 9 :: x : 63',o:['7','14','18','21'],a:1,why:'2 × 63 ÷ 9.'},
 exam:'Solve proportions: 2 marks.'},

{id:'r4',num:'7.4',title:'Factor of change and scaling',
 intro:'A recipe for 4 people needs 300 g rice. How much for 10 people?',
 obj:'Use the factor of change (scale factor) to solve direct-proportion problems.',
 prior:'7.3.',
 simple:'When two quantities are in direct proportion, they change by the same factor. 4 → 10 people is a factor of 10 ÷ 4 = 2.5, so rice = 300 × 2.5 = 750 g. Unitary method gives the same: 300 ÷ 4 = 75 g per person, × 10 = 750 g.',
 detail:'Direct proportion: as one increases, the other increases at the same rate; their ratio stays constant (y ÷ x = k). Factor of change can be less than 1: halving a recipe uses factor ½. Map scale 1 : 50,000 means 1 cm on the map = 50,000 cm = 500 m on the ground.',
 real:'Mixing a fertiliser: 20 mL per 10 L water → 50 mL for 25 L.',
 apply:'On a map with scale 1 : 2,00,000, two towns are 4.5 cm apart. Real distance?',
 see:{w:520,h:200,f:[
  ['4 people → 300 g.',lbl(130,60,'4 people → 300 g','font-size="17"')],
  ['× 2.5 →',lbl(260,60,'× 2.5','font-size="17" font-weight="700" fill="'+PU+'"')],
  ['10 people → 750 g.',lbl(390,60,'10 people → 750 g','font-size="17" fill="'+GN+'"')+lbl(260,140,'factor of change = 10 ÷ 4 = 2.5','font-size="15"')]]},
 seeNote:'Multiply both by the same factor.',
 do:{title:'Scale a recipe',mat:'A family recipe',steps:['Rewrite it for 3 times as many people.','And for half as many.'],obs:'All amounts scale.',why:'Direct proportion.',lab:false},
 memo:'"Find the factor, multiply everything."',
 miscon:['"For 10 people add 6 × 300 g." Multiply by the factor 2.5.'],
 terms:['Factor of change','Direct proportion','Unitary method','Map scale'],
 q:{q:'5 kg costs ₹160. 8 kg costs:',o:['₹256','₹200','₹240','₹320'],a:0,why:'× 1.6.'},
 exam:'Direct proportion problems: 3 marks.'},

{id:'r5',num:'7.5',title:'Sharing in a ratio',
 intro:'Two friends put in ₹300 and ₹500 to buy a raffle ticket that wins ₹1200. How should they share it fairly?',
 obj:'Divide a quantity in a given ratio.',
 prior:'7.2, 7.4.',
 simple:'To share in the ratio a : b, add the parts: a + b. Each share = (its part ÷ total parts) × amount. ₹1200 in 3 : 5 → 8 parts; each part ₹150; shares ₹450 and ₹750. Check: 450 + 750 = 1200 and 450 : 750 = 3 : 5.',
 detail:'Works for three or more: share ₹900 in 2 : 3 : 4 → 9 parts of ₹100 → ₹200, ₹300, ₹400. If one share is known, find the total: the ratio is 2 : 5 and the smaller share is ₹40 → one part ₹20 → total 7 parts = ₹140.',
 real:'Business partners share profit in the ratio of their investments.',
 apply:'Divide 84 sweets between two classes in the ratio 4 : 3.',
 see:{w:520,h:220,f:[
  ['₹1200 in 3 : 5 → 8 parts.',[...Array(8)].map((_,k)=>`<rect x="${40+k*55}" y="60" width="50" height="40" fill="${k<3?BL:OR}" opacity=".6"/>`).join('')],
  ['Each part = ₹150.',lbl(260,130,'1200 ÷ 8 = ₹150 per part','font-size="16"')],
  ['Shares: ₹450 and ₹750.',lbl(130,180,'3 × 150 = ₹450','font-size="16" fill="'+BL+'" font-weight="700"')+lbl(390,180,'5 × 150 = ₹750','font-size="16" fill="'+OR+'" font-weight="700"')]]},
 seeNote:'Total parts first.',
 do:{title:'Share sweets',mat:'Counters',steps:['Share 30 counters in 2 : 3 and 1 : 4.'],obs:'12 & 18; 6 & 24.',why:'Sharing in a ratio.',lab:true},
 memo:'"Add the parts, find one part, multiply."',
 miscon:['"Share 1200 in 3 : 5 as 300 and 500." That ignores the total; find one part first.'],
 terms:['Sharing in a ratio','Part','Whole'],
 q:{q:'₹500 shared in 2 : 3. The larger share:',o:['₹200','₹300','₹250','₹333'],a:1,why:'5 parts of ₹100.'},
 exam:'Divide in a ratio: 2–3 marks.'},

{id:'r6',num:'7.6',title:'Unit conversions',
 intro:'Your height is 1.52 m. How many centimetres is that? How many inches?',
 obj:'Convert between units using proportional reasoning.',
 prior:'7.4; decimals (Class 7).',
 simple:'Converting units is a proportion problem: 1 m = 100 cm, so 1.52 m = 152 cm. 1 kg = 1000 g, 1 L = 1000 mL, 1 km = 1000 m, 1 hour = 60 minutes. Multiply when converting to a smaller unit; divide when converting to a bigger unit.',
 detail:'Other systems: 1 inch ≈ 2.54 cm, so 152 cm ≈ 152 ÷ 2.54 ≈ 60 inches. 1 mile ≈ 1.6 km. Speed: 72 km/h = 72 × 1000 ÷ 3600 = 20 m/s. Traditional Indian units also existed (e.g. the gaz for cloth).',
 real:'Cricket pitch length: 22 yards ≈ 20.12 m.',
 apply:'Convert 3.5 km to metres, 2500 g to kg, and 54 km/h to m/s.',
 see:{w:520,h:200,f:[
  ['Bigger → smaller: multiply.',lbl(260,50,'1.52 m × 100 = 152 cm','font-size="17"')],
  ['Smaller → bigger: divide.',lbl(260,100,'2500 g ÷ 1000 = 2.5 kg','font-size="17"')],
  ['Speed conversion.',lbl(260,155,'72 km/h × 1000 ÷ 3600 = 20 m/s','font-size="16" font-weight="700" fill="'+PU+'"')]]},
 seeNote:'Use the conversion ratio.',
 do:{title:'Measure in two units',mat:'Ruler with cm and inches',steps:['Measure 5 objects in both units.','Find cm ÷ inch for each.'],obs:'≈ 2.54 every time.',why:'Constant ratio.',lab:false},
 memo:'"To smaller: multiply; to bigger: divide."',
 miscon:['"1.52 m = 15.2 cm." 1 m = 100 cm, so 152 cm.'],
 terms:['Unit conversion','Metric system','Conversion factor'],
 q:{q:'36 km/h in m/s:',o:['10','36','3.6','100'],a:0,why:'36 × 1000 ÷ 3600.'},
 exam:'Unit conversions: 2 marks.'}
];

const CARDS=[['Keep shape','Multiply both dimensions by the same factor.'],['Ratio','a : b compares by division.'],['Simplest form','Divide by the HCF.'],['Same units','Convert before comparing.'],['Proportion','a : b :: c : d.'],['Check','a × d = b × c.'],['Factor of change','New ÷ old.'],['Direct proportion','Ratio stays constant.'],['Sharing','Add parts → one part → multiply.'],['Conversion','To smaller ×, to bigger ÷.']];

const Q=[
 {lv:1,q:'20 : 30 in simplest form:',o:['2 : 3','4 : 6','3 : 2','1 : 3'],a:0,w:'HCF 10.'},
 {lv:1,q:'Is 3 : 4 :: 9 : 12 true?',o:['yes','no'],a:0,w:'36 = 36.'},
 {lv:1,q:'1.2 kg =',o:['12 g','120 g','1200 g','12000 g'],a:2,w:'× 1000.'},
 {lv:2,q:'Find x: 4 : x :: 12 : 27',o:['8','9','6','3'],a:1,w:'4 × 27 ÷ 12.'},
 {lv:2,q:'60 cm : 3 m =',o:['20 : 1','1 : 5','60 : 3','1 : 50'],a:1,w:'60 : 300.'},
 {lv:2,q:'Share ₹720 in 5 : 3. Smaller share:',o:['₹270','₹450','₹240','₹300'],a:0,w:'90 × 3.'},
 {lv:3,q:'A 5 × 8 photo enlarged to width 15. Height:',o:['18','24','11','20'],a:1,w:'× 3.'},
 {lv:3,q:'Recipe: 250 g flour for 6 people. For 9 people:',o:['375 g','300 g','500 g','333 g'],a:0,w:'× 1.5.'},
 {lv:4,q:'Map scale 1 : 50,000. 6 cm on map =',o:['3 km','300 m','30 km','0.3 km'],a:0,w:'300,000 cm.'},
 {lv:4,q:'90 km/h in m/s:',o:['25','90','9','250'],a:0,w:'90 × 1000 ÷ 3600.'},
 {lv:5,open:true,m:3,q:'Explain why a 3 cm × 2 cm photo enlarged to 9 cm × 3 cm looks stretched, and give a correct enlargement.',ans:['Width × 3, height × 1.5 — different factors (1)','Ratio changes from 3 : 2 to 3 : 1 (1)','Correct: 9 × 6 (both × 3) keeps 3 : 2 (1)']},
 {lv:5,open:true,m:3,q:'Riya and Arjun invest ₹4000 and ₹6000. Profit ₹2500. Share it fairly.',ans:['Ratio 4000 : 6000 = 2 : 3 (1)','5 parts; one part ₹500 (1)','Riya ₹1000, Arjun ₹1500 (1)']}
];

const ONEMIN=['Same factor keeps shapes similar.','Ratios and simplest form.','Proportions: cross-multiply.','Factor of change; direct proportion.','Sharing in a ratio.','Unit conversions.'];
const KEYS=[['shape',/shape|stretch|similar/i],['ratio',/ratio/i],['proportion',/proportion/i],['factor',/factor/i],['share',/share/i],['conversion',/convert|unit/i]];

/* ---------- lab ---------- */
let mode='r',W=9,H=6,wired=false;
function drawR(){const sc=22;let s=face(20,20,3*sc,2*sc)+T(20+1.5*sc,20+2*sc+16,'original 3 × 2','font-size="11"');const w=W*sc*.9,h=H*sc*.9;const x=120,y=20;s+=face(x,y,Math.min(w,330),Math.min(h,270),Math.abs(W/H-1.5)<1e-9?GN:OR);
 const g=gcd(W,H);s+=T(x+Math.min(w,330)/2,Math.min(h,270)+y+18,`${W} × ${H}  (ratio ${W/g} : ${H/g})`,'font-size="13" font-weight="700"');$('#prSvg').innerHTML=s;$('#prWv').textContent=W;$('#prHv').textContent=H;
 const ok=Math.abs(W/H-1.5)<1e-9;$('#prOut').innerHTML=ok?`<p class="fb ok">Looks right! Width × ${W/3} and height × ${H/2} — the same factor, so ${W} : ${H} = 3 : 2.</p>`:`<p class="fb no">Stretched! Width × ${+(W/3).toFixed(2)} but height × ${+(H/2).toFixed(2)}. For width ${W}, the height should be ${+(W*2/3).toFixed(2)} cm.</p>`}
function drawS(){const amt=+$('#prAmt').value,a=Math.floor(+$('#prA').value),b=Math.floor(+$('#prB').value);if(!(amt>0&&a>0&&b>0)){$('#prOut').innerHTML='<p class="fb no">Enter a positive amount and whole-number ratio terms.</p>';return}
 const n=a+b,part=amt/n;let s='';const pw=Math.min(50,400/n);for(let k=0;k<n;k++)s+=`<rect x="${30+k*pw}" y="80" width="${pw-4}" height="60" fill="${k<a?BL:OR}" opacity=".6"/>`;
 s+=T(230,50,`₹${amt} in ${a} : ${b} → ${n} parts of ₹${+part.toFixed(2)}`,'font-size="14" font-weight="700"')+T(130,190,`${a} × ${+part.toFixed(2)} = ₹${+(a*part).toFixed(2)}`,'font-size="15" fill="'+BL+'" font-weight="700"')+T(340,190,`${b} × ${+part.toFixed(2)} = ₹${+(b*part).toFixed(2)}`,'font-size="15" fill="'+OR+'" font-weight="700"');
 $('#prSvg').innerHTML=s;$('#prOut').innerHTML=`<p>Total parts = ${a} + ${b} = ${n}; one part = ₹${amt} ÷ ${n} = ₹${+part.toFixed(2)}.</p><p>Check: ₹${+(a*part).toFixed(2)} + ₹${+(b*part).toFixed(2)} = ₹${amt}.</p>`}
function draw(){$('#prR').style.display=mode==='r'?'':'none';$('#prSh').style.display=mode==='s'?'':'none';mode==='r'?drawR():drawS()}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(!e.target||!e.target.classList||!e.target.classList.contains('prS'))return;if(e.target.id==='prW')W=+e.target.value;else H=+e.target.value;drawR()})}
function labClick(b){if(b.id==='prGo'){drawS();return true}return false}
function labChange(t){if(t.id==='prM'){mode=t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
