/* Rai Plus content pack: Class 8 Mathematics (Ganita Prakash Part 2), Chapter 1 – Fractions in Disguise (percentages). */
RP.register({key:'8matb1',cls:'8',subject:'Mathematics',ch:'II-1',title:"Fractions in Disguise",color:'#1f5f8b',
crumb:"Class 8 Mathematics · Ganita Prakash Part 2",h1:"Part 2 · Chapter 1: Fractions in Disguise",sub:"Percentages as fractions out of 100, converting between fractions, decimals and percentages, finding percentages of quantities, percentage change, and discounts, profit and loss.",heroLabel:"A 100-square grid with some squares shaded",labName:'Percentage grid and change lab',
theme:"\n:root{--g:light-dark(#1f5f8b,#8fc2e6);--g2:light-dark(#e8f1f8,#0b1622);--line:light-dark(#cde0ee,#22384b);--bg:light-dark(#ffffff,#081018);--card:light-dark(#ffffff,#0d1620);\n--ink:light-dark(#0d1d2a,#e1ecf5);--mute:light-dark(#475d70,#a7bccd);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#174a6d}\n",
labHTML:`  <h2>Percentage grid and change lab</h2>
  <p>Grid mode: shade a percentage of a 100-square grid and see it as a fraction and a decimal. Change mode: apply two percentage changes one after the other — does +20% then −20% bring you back?</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="pcSvg" viewBox="0 0 460 320" role="img" aria-label="Percentage grid" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="pcM"><option value="g">100-square grid</option><option value="c">Successive changes</option></select></label></div>
  <div class="ctrl" id="pcG"><label>Percent: <b id="pcPv"></b><input type="range" class="pcS" id="pcP" min="0" max="100" value="35"></label></div>
  <div class="ctrl" id="pcC" style="display:none"><label>Start value<input id="pcV" type="number" value="500" style="width:6em"></label> <label>First change %<input id="pcA" type="number" value="20" style="width:4em"></label> <label>Second change %<input id="pcB" type="number" value="-20" style="width:4em"></label> <button class="btn" id="pcGo">Apply</button></div>
  <div class="ctrl"><button class="btn" id="pcQ">Quiz</button> <input id="pcAns" type="number" step="any" style="width:6em"> <button class="btn" id="pcK">Check</button></div>
  <div class="box y" id="pcOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#1f5f8b',LABNAME='Percentage grid and change lab',MIND_CENTER='Percentages';
const BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const gcd=(a,b)=>b?gcd(b,a%b):a;
const r2=v=>+v.toFixed(2);
function grid(x0,y0,s,p,c=BL){let g='';for(let k=0;k<100;k++){const i=k%10,j=Math.floor(k/10);g+=`<rect x="${x0+i*s}" y="${y0+j*s}" width="${s-1}" height="${s-1}" fill="${k<p?c:'none'}" fill-opacity=".6" stroke="${GR}" stroke-width=".5"/>`}return g}
function heroDraw(){let s='';for(let k=0;k<100;k++)s+=`<rect x="${140+(k%10)*10}" y="${30+Math.floor(k/10)*10}" width="9" height="9" fill="${k<35?'#fff':'none'}" stroke="#fff" stroke-width=".5"/>`;return s}
const HERO=heroDraw;
const MIND=[['Per cent = per hundred',100,50],['Converting forms',420,50],['Percent of a quantity',90,150],['As a percentage',430,150],['Percentage change',110,250],['Discount, profit, loss',410,250]];

const C=[
{id:'f1',num:'1.1',title:'Percent: a fraction out of 100',
 intro:'"35% off", "80% marks", "60% chance of rain" — what does % really mean?',
 obj:'Understand percent as a fraction with denominator 100.',
 prior:'Class 6–7: fractions, decimals.',
 simple:'Percent means "per hundred" or "out of 100". 35% = 35/100 = 0.35. It is a fraction in disguise! On a 100-square grid, 35% means 35 squares shaded. 100% is the whole; 50% is half; 25% is a quarter; 10% is one-tenth.',
 detail:'Percentages make comparison easy because everything is "out of 100": 17 out of 20 (85%) vs 40 out of 50 (80%). Percentages can be more than 100% (150% = 1.5 times) and can be decimals (12.5% = 1/8).',
 real:'Exam results, battery levels, interest rates and election results are all reported in percentages.',
 apply:'Show 45% on a 100-square grid and write it as a fraction in simplest form.',
 see:{w:520,h:220,f:[
  ['100 squares = whole.',grid(40,20,18,0)],
  ['Shade 35.',grid(40,20,18,35)],
  ['35% = 35/100 = 0.35.',lbl(380,90,'35% = 35/100','font-size="17" font-weight="700"')+lbl(380,120,'= 7/20 = 0.35','font-size="16" fill="'+BL+'"')]]},
 seeNote:'Percent = out of 100.',
 do:{title:'Grid shading',mat:'100-square grids',steps:['Shade 10%, 25%, 50%, 75%.'],obs:'Familiar fractions.',why:'Percent as fraction.',lab:true},
 memo:'"Per cent = per hundred."',
 miscon:['"Percent can\'t exceed 100." 150% is 1.5 times the amount.'],
 terms:['Percent (%)','Per hundred','Whole = 100%'],
 q:{q:'40% as a fraction in simplest form:',o:['4/10','2/5','40/10','1/4'],a:1,why:'40/100.'},
 exam:'Meaning of percent: 1 mark.'},

{id:'f2',num:'1.2',title:'Converting fractions, decimals and percentages',
 intro:'Which is more: 3/8 or 37%?',
 obj:'Convert freely between fractions, decimals and percentages.',
 prior:'1.1.',
 simple:'Percent → fraction: put over 100 and simplify (60% = 60/100 = 3/5). Percent → decimal: divide by 100 (60% = 0.6). Fraction → percent: multiply by 100% (3/8 × 100% = 37.5%). Decimal → percent: multiply by 100 (0.07 = 7%).',
 detail:'Useful equivalents: 1/2 = 50%, 1/4 = 25%, 3/4 = 75%, 1/5 = 20%, 1/8 = 12.5%, 1/3 ≈ 33.3%, 2/3 ≈ 66.7%, 1/10 = 10%. To compare 3/8 and 37%, convert: 37.5% > 37%.',
 real:'Cricket strike rates and batting averages often convert fractions to percentages.',
 apply:'Convert 7/20, 0.045 and 2/3 to percentages.',
 see:{w:520,h:200,f:[
  ['Fraction 3/8.',lbl(100,80,'3/8','font-size="24" font-weight="700"')],
  ['× 100% → 37.5%.',lbl(260,80,'× 100% →','font-size="16"')+lbl(410,80,'37.5%','font-size="24" font-weight="700" fill="'+BL+'"')],
  ['÷ 100 → 0.375.',lbl(260,150,'37.5% ÷ 100 = 0.375','font-size="17" fill="'+GN+'"')]]},
 seeNote:'×100 to percent, ÷100 from percent.',
 do:{title:'Matching cards',mat:'Cards with fractions, decimals, percents',steps:['Match equivalent triples.'],obs:'Sets of three.',why:'Conversion.',lab:false},
 memo:'"To percent: × 100; from percent: ÷ 100."',
 miscon:['"0.5 = 5%." It is 50%.'],
 terms:['Equivalent forms','Conversion'],
 q:{q:'0.08 =',o:['80%','8%','0.8%','0.08%'],a:1,why:'× 100.'},
 exam:'Conversions: 1–2 marks.'},

{id:'f3',num:'1.3',title:'Finding a percentage of a quantity',
 intro:'18% GST on a ₹2,500 item — how much tax?',
 obj:'Calculate a percentage of an amount, including mental methods.',
 prior:'1.2.',
 simple:'To find p% of a quantity, multiply by p/100. 18% of ₹2500 = 18/100 × 2500 = ₹450. Mental method: 10% of 2500 = 250; 1% = 25; 18% = 10% + 8% = 250 + 200 = 450.',
 detail:'Handy facts: 50% = half, 25% = quarter, 10% = ÷ 10, 5% = half of 10%, 1% = ÷ 100. x% of y = y% of x: 8% of 50 = 50% of 8 = 4! Reverse: if 20% of a number is 30, the number is 30 ÷ 0.2 = 150.',
 real:'Tips, taxes, discounts and fertiliser mixtures all use "percent of".',
 apply:'Find 15% of ₹840 using 10% and 5%.',
 see:{w:520,h:200,f:[
  ['10% of 2500 = 250.',lbl(130,60,'10% → 250','font-size="17"')],
  ['1% = 25; 8% = 200.',lbl(390,60,'1% → 25, 8% → 200','font-size="17"')],
  ['18% = 450.',lbl(260,140,'18% of ₹2500 = 250 + 200 = ₹450','font-size="17" font-weight="700" fill="'+BL+'"')]]},
 seeNote:'Build from 10% and 1%.',
 do:{title:'Mental percents',mat:'Price tags',steps:['Find 10%, 5%, 25% of five prices mentally.'],obs:'Fast with practice.',why:'Benchmarks.',lab:true},
 memo:'"10% is one place left; 1% is two."',
 miscon:['"20% of 50 = 20 + 50." It is 0.2 × 50 = 10.'],
 terms:['Percentage of','Benchmark percentages'],
 q:{q:'25% of 360 =',o:['90','25','36','120'],a:0,why:'Quarter.'},
 exam:'Percent of quantity: 2 marks.'},

{id:'f4',num:'1.4',title:'Expressing one quantity as a percentage of another',
 intro:'You scored 42 out of 60. What percentage is that?',
 obj:'Write one quantity as a percentage of another.',
 prior:'1.2, 1.3.',
 simple:'Percentage = (part ÷ whole) × 100%. 42 out of 60 = 42/60 × 100% = 70%. Units must match: 45 minutes as a percent of 2 hours = 45/120 × 100% = 37.5%.',
 detail:'Use it to compare: Class A 27 of 30 passed (90%), Class B 44 of 50 passed (88%) — Class A did better. Percent composition: in 250 g of mix with 75 g nuts, nuts are 30%.',
 real:'Attendance: present 180 days out of 200 = 90%.',
 apply:'A team won 18 of 24 matches. What percentage did it win? Lose?',
 see:{w:520,h:200,f:[
  ['42 out of 60.',lbl(260,50,'42 / 60','font-size="22"')],
  ['× 100%.',lbl(260,100,'= 0.7 × 100%','font-size="18"')],
  ['= 70%.',lbl(260,155,'= 70%','font-size="24" font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Part over whole, times 100.',
 do:{title:'Class survey',mat:'Class data',steps:['Find the percentage of students who walk, cycle or come by bus.'],obs:'Adds to 100%.',why:'Parts of a whole.',lab:false},
 memo:'"Part ÷ whole × 100."',
 miscon:['"42 out of 60 = 42%." Divide by 60, not 100.'],
 terms:['Part','Whole','Percentage composition'],
 q:{q:'30 out of 75 =',o:['30%','40%','45%','25%'],a:1,why:'30/75 = 0.4.'},
 exam:'Express as percentage: 2 marks.'},

{id:'f5',num:'1.5',title:'Percentage increase and decrease',
 intro:'A shirt\'s price rises 20%, then falls 20%. Is it back to its original price?',
 obj:'Calculate percentage change and understand successive changes.',
 prior:'1.3, 1.4.',
 simple:'Percentage change = (change ÷ original) × 100%. Price ₹400 → ₹500: increase ₹100, 100/400 = 25% increase. To increase by p%, multiply by (1 + p/100); to decrease, multiply by (1 − p/100). ₹500 + 20% = 500 × 1.2 = ₹600.',
 detail:'Successive changes multiply: +20% then −20% gives × 1.2 × 0.8 = × 0.96 — a 4% net decrease, not 0! Always compare to the original value. A population growing 10% a year for 2 years grows by 21% (1.1 × 1.1 = 1.21).',
 real:'News reports say "petrol price up 5%" — always relative to the old price.',
 apply:'₹800 is increased by 15%, then decreased by 10%. Final value?',
 see:{w:520,h:220,f:[
  ['₹500.',`<rect x="40" y="${200-100}" width="80" height="100" fill="${BL}" opacity=".6"/>`+lbl(80,215,'₹500')],
  ['+20% → ₹600.',`<rect x="190" y="${200-120}" width="80" height="120" fill="${GN}" opacity=".6"/>`+lbl(230,215,'₹600')],
  ['−20% → ₹480 (not ₹500!).',`<rect x="340" y="${200-96}" width="80" height="96" fill="${OR}" opacity=".6"/>`+lbl(380,215,'₹480')+lbl(380,85,'× 1.2 × 0.8 = × 0.96','font-size="12" font-weight="700"')]]},
 seeNote:'Changes multiply; base changes.',
 do:{title:'Price ladder',mat:'Calculator',steps:['Start at ₹1000; apply +10%, +10%, −20%.'],obs:'₹968.',why:'Successive changes.',lab:true},
 memo:'"Change over original; successive changes multiply."',
 miscon:['"+20% then −20% returns to start." It gives 96%.'],
 terms:['Percentage increase','Percentage decrease','Multiplier','Successive change'],
 q:{q:'₹250 → ₹300 is an increase of:',o:['50%','20%','16.7%','25%'],a:1,why:'50/250.'},
 exam:'Percentage change: 3 marks.'},

{id:'f6',num:'1.6',title:'Discount, profit and loss',
 intro:'A ₹1,200 jacket is on sale at 25% off. A shopkeeper bought it for ₹800. Did he make a profit?',
 obj:'Solve problems on discount, profit and loss using percentages.',
 prior:'1.3–1.5.',
 simple:'Discount is a reduction on the marked price (MP): selling price (SP) = MP − discount. 25% off ₹1200: discount ₹300, SP ₹900. Cost price (CP) is what the seller paid. Profit = SP − CP (if SP > CP); loss = CP − SP. Profit % = profit ÷ CP × 100%. Here profit = 900 − 800 = ₹100 → 12.5%.',
 detail:'Profit and loss percentages are always on the cost price. GST is added on the selling price: ₹900 + 12% GST = ₹1008. Two successive discounts of 20% and 10% equal 28%, not 30% (0.8 × 0.9 = 0.72).',
 real:'Festival sales in markets advertise "up to 50% off" — always check the final price.',
 apply:'A cycle bought for ₹4,000 is sold for ₹4,600. Find the profit percentage.',
 see:{w:520,h:220,f:[
  ['Marked price ₹1200.',lbl(130,50,'MP ₹1200','font-size="17"')],
  ['25% off → SP ₹900.',lbl(390,50,'−25% → SP ₹900','font-size="17" fill="'+OR+'"')],
  ['CP ₹800 → profit ₹100 = 12.5%.',lbl(260,130,'profit = 900 − 800 = ₹100','font-size="17"')+lbl(260,165,'profit % = 100/800 × 100 = 12.5%','font-size="16" font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Discount on MP; profit on CP.',
 do:{title:'Shop role-play',mat:'Price cards',steps:['Set MPs, give discounts, compute SPs and profit for given CPs.'],obs:'Different outcomes.',why:'Commercial maths.',lab:false},
 memo:'"Discount from marked; profit over cost."',
 miscon:['"Profit % = profit ÷ SP." It is on cost price.'],
 terms:['Marked price (MP)','Selling price (SP)','Cost price (CP)','Discount','Profit','Loss','GST'],
 q:{q:'MP ₹600, discount 15%. SP =',o:['₹510','₹585','₹90','₹690'],a:0,why:'600 × 0.85.'},
 exam:'Discount/profit/loss problems: 3–5 marks.'}
];

const CARDS=[['Percent','Out of 100: 35% = 35/100.'],['To decimal','Divide by 100.'],['To percent','× 100%.'],['p% of x','p/100 × x.'],['Benchmarks','10% = ÷10; 1% = ÷100.'],['As a percent','part ÷ whole × 100%.'],['Change %','change ÷ original × 100%.'],['Successive','Multiply multipliers: 1.2 × 0.8 = 0.96.'],['Discount','SP = MP − discount.'],['Profit %','profit ÷ CP × 100%.']];

const Q=[
 {lv:1,q:'75% =',o:['3/4','7/5','1/75','0.075'],a:0,w:'75/100.'},
 {lv:1,q:'3/5 as a percent:',o:['35%','60%','30%','53%'],a:1,w:'× 100.'},
 {lv:1,q:'10% of 470 =',o:['4.7','47','470','0.47'],a:1,w:'÷ 10.'},
 {lv:2,q:'36 out of 48 =',o:['75%','36%','48%','66%'],a:0,w:'0.75.'},
 {lv:2,q:'₹600 increased by 15% =',o:['₹615','₹690','₹90','₹700'],a:1,w:'× 1.15.'},
 {lv:2,q:'1/8 =',o:['8%','12.5%','18%','0.125%'],a:1,w:'× 100.'},
 {lv:3,q:'+10% then −10% gives net:',o:['0%','−1%','+1%','−10%'],a:1,w:'1.1 × 0.9 = 0.99.'},
 {lv:3,q:'CP ₹500, SP ₹450. Loss %:',o:['10%','11.1%','50%','5%'],a:0,w:'50/500.'},
 {lv:4,q:'Successive discounts 20% and 10% equal a single discount of:',o:['30%','28%','25%','32%'],a:1,w:'0.8 × 0.9.'},
 {lv:4,q:'20% of a number is 45. The number:',o:['9','225','90','180'],a:1,w:'45 ÷ 0.2.'},
 {lv:5,open:true,m:3,q:'A price of ₹2000 rises 25% and then falls 20%. Find the final price and explain why it is not ₹2000 + 5%.',ans:['2000 × 1.25 = ₹2500 (1)','2500 × 0.8 = ₹2000 (1)','Second change is on the new, larger base; multipliers 1.25 × 0.8 = 1 (1)']},
 {lv:5,open:true,m:3,q:'A jacket MP ₹1600 sold at 20% discount; CP ₹1100. Find SP and profit %.',ans:['Discount = ₹320 (1)','SP = ₹1280 (1)','Profit ₹180; 180/1100 × 100 ≈ 16.4% (1)']}
];

const ONEMIN=['Percent = fraction out of 100.','Convert fractions, decimals, percents.','p% of a quantity; mental benchmarks.','Express as a percentage.','Percentage change; successive changes multiply.','Discount, profit, loss, GST.'];
const KEYS=[['percent',/percent|%/i],['convert',/convert|decimal|fraction/i],['of',/ of /i],['change',/increase|decrease|change/i],['successive',/successive|multipl/i],['discount',/discount|profit|loss/i]];

/* ---------- lab ---------- */
let mode='g',P=35,quiz=null,wired=false;
function drawG(){const g=gcd(P,100)||1;let s=grid(20,20,26,P);s+=T(370,90,`${P}%`,'font-size="30" font-weight="700" fill="'+BL+'"')+T(370,135,`= ${P}/100${g>1&&P?` = ${P/g}/${100/g}`:''}`,'font-size="15"')+T(370,165,`= ${(P/100).toFixed(2)}`,'font-size="15"');$('#pcSvg').innerHTML=s;$('#pcPv').textContent=P+'%';
 if(!quiz)$('#pcOut').innerHTML=`<p>${P} out of 100 squares shaded: ${P}% = ${P/g}/${100/g} = ${P/100}.${P===50?' That is half!':P===25?' A quarter.':P===75?' Three quarters.':P===100?' The whole.':''}</p>`}
function drawC(){const v=+$('#pcV').value,a=+$('#pcA').value,b=+$('#pcB').value;if(!(v>0)||!isFinite(a)||!isFinite(b)||a<=-100||b<=-100){$('#pcOut').innerHTML='<p class="fb no">Use a positive start value and changes above −100%.</p>';return}
 const v1=v*(1+a/100),v2=v1*(1+b/100);const mx=Math.max(v,v1,v2);const H=v=>v/mx*200;let s='';[[v,'start',BL],[v1,`${a>=0?'+':''}${a}%`,a>=0?GN:OR],[v2,`${b>=0?'+':''}${b}%`,b>=0?GN:OR]].forEach(([val,t,c],k)=>{const x=70+k*130;s+=`<rect x="${x}" y="${260-H(val)}" width="80" height="${H(val)}" fill="${c}" opacity=".6"/>`+T(x+40,250-H(val),r2(val),'font-size="13" font-weight="700"')+T(x+40,282,t,'font-size="12"')});
 const net=(v2/v-1)*100;s+=T(230,305,`multiplier: ${r2(1+a/100)} × ${r2(1+b/100)} = ${r2((1+a/100)*(1+b/100))}  → net ${net>=0?'+':''}${r2(net)}%`,'font-size="12" font-weight="700"');$('#pcSvg').innerHTML=s;
 $('#pcOut').innerHTML=`<p>${v} → ${r2(v1)} → <b>${r2(v2)}</b>. Net change: <b>${net>=0?'+':''}${r2(net)}%</b>.</p>${a===-b&&a!==0?'<p class="fb ok">Equal and opposite changes do NOT cancel — the second change is on a different base.</p>':''}`}
function draw(){$('#pcG').style.display=mode==='g'?'':'none';$('#pcC').style.display=mode==='c'?'':'none';mode==='g'?drawG():drawC()}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='pcP'){P=+e.target.value;quiz=null;drawG()}})}
function labClick(b){if(b.id==='pcGo'){drawC();return true}
 if(b.id==='pcQ'){const t=Math.floor(Math.random()*3);const p=[5,10,12,15,20,25,30,40,60,75][Math.floor(Math.random()*10)],x=[40,80,120,200,240,360,500,640,800][Math.floor(Math.random()*9)];
  quiz=[{q:`${p}% of ${x}`,a:p*x/100},{q:`${p*x/100} as a percentage of ${x}`,a:p},{q:`${x} increased by ${p}%`,a:x*(1+p/100)}][t];$('#pcOut').innerHTML=`<p><b>Quiz:</b> ${quiz.q} = ?</p>`;return true}
 if(b.id==='pcK'){if(!quiz){$('#pcOut').innerHTML='<p>Press Quiz first.</p>';return true}const g=+$('#pcAns').value;$('#pcOut').innerHTML=Math.abs(g-quiz.a)<.011?`<p class="fb ok">Correct: ${quiz.q} = ${r2(quiz.a)}.</p>`:`<p class="fb no">Not quite: ${quiz.q} = ${r2(quiz.a)}.</p>`;quiz=null;return true}return false}
function labChange(t){if(t.id==='pcM'){mode=t.value;quiz=null;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
