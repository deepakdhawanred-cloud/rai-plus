/* Rai Plus content pack: Class 7 Mathematics (Ganita Prakash Part 2), Chapter 3 – Finding Common Ground (HCF and LCM). */
RP.register({key:'7matb3',cls:'7',subject:'Mathematics',ch:'II-3',title:"Finding Common Ground",color:'#3b6d11',
crumb:"Class 7 Mathematics · Ganita Prakash Part 2",h1:"Part 2 · Chapter 3: Finding Common Ground",sub:"Common factors and HCF, common multiples and LCM, prime factorisation methods, the HCF × LCM relation, and word problems.",heroLabel:"A Venn diagram of prime factors",labName:'HCF–LCM lab',
theme:"\n:root{--g:light-dark(#3b6d11,#a8d77d);--g2:light-dark(#eef6e4,#0f1a07);--line:light-dark(#d4e7bf,#2c4219);--bg:light-dark(#ffffff,#0b1206);--card:light-dark(#ffffff,#111a0a);\n--ink:light-dark(#162508,#e6f1da);--mute:light-dark(#4f6439,#b5c9a0);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#2b520b}\n",
labHTML:`  <h2>HCF–LCM lab</h2>
  <p>Pick two numbers. See their prime factors in a Venn diagram: the overlap gives the HCF, everything together gives the LCM. Switch the view to see tiles (HCF) or meeting bells (LCM).</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="hSvg" viewBox="0 0 460 320" role="img" aria-label="HCF and LCM" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>First number<input id="hA" type="number" value="24" min="2" max="300" style="width:5em"></label> <label>Second number<input id="hB" type="number" value="36" min="2" max="300" style="width:5em"></label> <button class="btn" id="hGo">Show</button></div>
  <div class="ctrl"><label>View<select id="hV"><option value="venn">Prime-factor Venn diagram</option><option value="tile">Square tiles (HCF)</option><option value="bell">Bells ringing together (LCM)</option></select></label></div>
  <div class="box y" id="hOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3b6d11',LABNAME='HCF–LCM lab',MIND_CENTER='HCF & LCM';
const GN='#3b6d11',OR='#b04a1f',BL='#1f5f8b',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const gcd=(a,b)=>b?gcd(b,a%b):a,lcm=(a,b)=>a/gcd(a,b)*b;
function pf(n){const f=[];let d=2;while(n>1){while(n%d===0){f.push(d);n/=d}d++}return f}
function venn(cx,cy,A,B,a,b,r=80){let s=`<circle cx="${cx-50}" cy="${cy}" r="${r}" fill="${BL}" fill-opacity=".12" stroke="${BL}" stroke-width="2"/><circle cx="${cx+50}" cy="${cy}" r="${r}" fill="${OR}" fill-opacity=".12" stroke="${OR}" stroke-width="2"/>`;
 const fa=pf(a),fb=pf(b);const common=[];const ra=[...fa],rb=[...fb];for(let i=ra.length-1;i>=0;i--){const j=rb.indexOf(ra[i]);if(j>=0){common.push(ra[i]);ra.splice(i,1);rb.splice(j,1)}}
 const place=(arr,x)=>arr.map((v,k)=>T(x,cy-((arr.length-1)/2-k)*22+5,String(v),'font-size="17" font-weight="700"')).join('');
 s+=place(ra,cx-85)+place(common,cx)+place(rb,cx+85)+T(cx-60,cy-r-10,String(a),'font-size="15" font-weight="700" fill="'+BL+'"')+T(cx+60,cy-r-10,String(b),'font-size="15" font-weight="700" fill="'+OR+'"');return {s,common,ra,rb}}
function heroDraw(){return `<circle cx="120" cy="70" r="45" fill="none" stroke="#fff" stroke-width="3"/><circle cx="190" cy="70" r="45" fill="none" stroke="#fff" stroke-width="3"/><text x="155" y="76" font-size="18" fill="#fff" text-anchor="middle">2 3</text>`}
const HERO=heroDraw;
const MIND=[['Common factors',100,50],['HCF',420,50],['Common multiples',90,150],['LCM',430,150],['Prime factorisation',110,250],['HCF × LCM',410,250]];

const C=[
{id:'h1',num:'3.1',title:'Common factors and the HCF',
 intro:'You have 24 laddoos and 36 barfis to pack in boxes, each box with one kind and the same number of sweets. What is the largest number per box?',
 obj:'Find common factors and the highest common factor.',
 prior:'Class 6 Prime Time (factors, primes).',
 simple:'Factors of 24: 1, 2, 3, 4, 6, 8, 12, 24. Factors of 36: 1, 2, 3, 4, 6, 9, 12, 18, 36. Common factors: 1, 2, 3, 4, 6, 12. The highest common factor (HCF, also GCD) is 12 — so 12 sweets per box.',
 detail:'If the HCF of two numbers is 1, they are co-prime (e.g. 8 and 15). The HCF of two numbers always divides both numbers and divides their difference too: HCF(24, 36) divides 12.',
 real:'Cutting two ropes of 24 m and 36 m into equal longest pieces: 12 m each.',
 apply:'Find the HCF of 18 and 30 by listing factors.',
 see:{w:520,h:200,f:[
  ['Factors of 24.',lbl(260,50,'24: 1, 2, 3, 4, 6, 8, 12, 24','font-size="16" fill="'+BL+'"')],
  ['Factors of 36.',lbl(260,90,'36: 1, 2, 3, 4, 6, 9, 12, 18, 36','font-size="16" fill="'+OR+'"')],
  ['Common: 1, 2, 3, 4, 6, 12 → HCF = 12.',lbl(260,150,'HCF(24, 36) = 12','font-size="20" font-weight="700"')]]},
 seeNote:'Highest number that divides both.',
 do:{title:'Sweet boxes',mat:'Counters (24 of one colour, 36 of another)',steps:['Make equal groups of each colour with the same group size.','Find the largest group size.'],obs:'12.',why:'HCF.',lab:false},
 memo:'"HCF: biggest that fits into both."',
 miscon:['"HCF is always smaller than both numbers." It can equal the smaller (HCF(6, 18) = 6).'],
 terms:['Common factor','HCF (GCD)','Co-prime'],
 q:{q:'HCF of 16 and 40:',o:['4','8','16','80'],a:1,why:'Largest common factor.'},
 exam:'HCF by listing: 2 marks.'},

{id:'h2',num:'3.2',title:'Common multiples and the LCM',
 intro:'Two bells ring every 6 and 8 minutes. They ring together now. When next?',
 obj:'Find common multiples and the least common multiple.',
 prior:'3.1.',
 simple:'Multiples of 6: 6, 12, 18, 24, 30, 36, 42, 48… Multiples of 8: 8, 16, 24, 32, 40, 48… Common multiples: 24, 48, … The least common multiple (LCM) is 24 — the bells ring together after 24 minutes.',
 detail:'The LCM is a multiple of both numbers; every common multiple is a multiple of the LCM. If two numbers are co-prime, their LCM is their product: LCM(4, 9) = 36. The LCM of numbers where one divides the other is the bigger one: LCM(5, 20) = 20.',
 real:'Buses leaving every 15 and 20 minutes leave together every 60 minutes.',
 apply:'Find the LCM of 9 and 12.',
 see:{w:520,h:200,f:[
  ['Multiples of 6.',[6,12,18,24,30,36,42,48].map((v,k)=>T(60+k*55,60,String(v),`font-size="15" fill="${v%8?BL:'#000'}"`)).join('')],
  ['Multiples of 8.',[8,16,24,32,40,48].map((v,k)=>T(60+k*73,110,String(v),`font-size="15" fill="${v%6?OR:'#000'}"`)).join('')],
  ['First common: 24 = LCM.',`<circle cx="225" cy="55" r="16" fill="none" stroke="${GN}" stroke-width="2"/><circle cx="206" cy="105" r="16" fill="none" stroke="${GN}" stroke-width="2"/>`+lbl(260,170,'LCM(6, 8) = 24','font-size="20" font-weight="700"')]]},
 seeNote:'Smallest number both divide.',
 do:{title:'Clap game',mat:'Two groups',steps:['Group A claps every 3 counts, B every 4.','When do they clap together?'],obs:'12, 24, …',why:'LCM.',lab:false},
 memo:'"LCM: first meeting point."',
 miscon:['"LCM is always the product." Only for co-prime numbers.'],
 terms:['Common multiple','LCM'],
 q:{q:'LCM of 4 and 6:',o:['24','12','2','10'],a:1,why:'First common multiple.'},
 exam:'LCM by listing: 2 marks.'},

{id:'h3',num:'3.3',title:'HCF by prime factorisation',
 intro:'Listing factors of 252 and 360 is slow. Is there a faster way?',
 obj:'Find the HCF using prime factorisation.',
 prior:'Class 6 factor trees.',
 simple:'Write each number as a product of primes. HCF = product of the primes common to both (each taken as many times as it appears in both). 24 = 2 × 2 × 2 × 3; 36 = 2 × 2 × 3 × 3. Common: 2 × 2 × 3 = 12.',
 detail:'Using powers: 24 = 2³ × 3, 36 = 2² × 3² → HCF takes the smaller power of each common prime: 2² × 3 = 12. A Venn diagram of prime factors shows common factors in the overlap.',
 real:'Simplifying fractions: 24/36 = 2/3 by dividing by the HCF 12.',
 apply:'Find HCF(60, 84) by prime factorisation.',
 see:{w:520,h:250,f:[
  ['24 = 2 × 2 × 2 × 3; 36 = 2 × 2 × 3 × 3.',lbl(260,24,'24 = 2·2·2·3     36 = 2·2·3·3','font-size="15"')],
  ['Venn diagram of prime factors.',venn(260,140,0,0,24,36,70).s],
  ['Overlap: 2 × 2 × 3 = 12 = HCF.',lbl(260,240,'HCF = product of overlap = 12','font-weight="700"')]]},
 seeNote:'Overlap = HCF.',
 do:{title:'Factor trees',mat:'Notebook',steps:['Draw factor trees for 48 and 72.','Circle common primes.'],obs:'HCF 24.',why:'Prime factorisation.',lab:true},
 memo:'"HCF: common primes, smaller powers."',
 miscon:['"HCF uses all the primes." Only the common ones.'],
 terms:['Prime factorisation','Power','Venn diagram'],
 q:{q:'HCF of 2³ × 3 and 2 × 3² × 5:',o:['6','2³ × 3² × 5','30','2'],a:0,why:'2 × 3.'},
 exam:'HCF by prime factorisation: 3 marks.'},

{id:'h4',num:'3.4',title:'LCM by prime factorisation',
 intro:'How do you find the LCM of 24 and 36 without listing multiples?',
 obj:'Find the LCM using prime factorisation.',
 prior:'3.3.',
 simple:'LCM = product of all primes in either number, each taken the greatest number of times it appears. 24 = 2³ × 3, 36 = 2² × 3² → LCM = 2³ × 3² = 72. In the Venn diagram: multiply everything inside both circles: 2 × 2 × 2 × 3 × 3 = 72.',
 detail:'For three numbers, do the same with all three. Division method: divide all numbers by common primes repeatedly; LCM = product of divisors and remainders. Check: 72 ÷ 24 = 3, 72 ÷ 36 = 2.',
 real:'Lights blinking every 24 and 36 seconds blink together every 72 seconds.',
 apply:'Find LCM(12, 18, 30).',
 see:{w:520,h:220,f:[
  ['Same Venn diagram.',venn(260,110,0,0,24,36,70).s],
  ['Multiply everything in both circles.',lbl(260,210,'2 × 2 × 2 × 3 × 3 = 72','font-size="16" font-weight="700"')],
  ['LCM = 72.',lbl(450,40,'LCM = 72','font-size="18" font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Everything = LCM.',
 do:{title:'Three numbers',mat:'Notebook',steps:['Find LCM(8, 12, 20) by prime factorisation.'],obs:'120.',why:'Greatest powers.',lab:false},
 memo:'"LCM: all primes, greatest powers."',
 miscon:['"LCM = HCF of bigger numbers." Different ideas.'],
 terms:['LCM by prime factors','Division method'],
 q:{q:'LCM of 2² × 3 and 2 × 3² is:',o:['6','36','18','12'],a:1,why:'2² × 3².'},
 exam:'LCM by prime factorisation: 3 marks.'},

{id:'h5',num:'3.5',title:'HCF × LCM = product',
 intro:'HCF(24, 36) × LCM(24, 36) = 12 × 72. What do you notice?',
 obj:'Use the relation HCF × LCM = product of two numbers.',
 prior:'3.3, 3.4.',
 simple:'For two numbers, HCF × LCM = the product of the numbers: 12 × 72 = 864 = 24 × 36. So if you know three of these four values, you can find the fourth: LCM = (a × b) ÷ HCF.',
 detail:'Why? In the Venn diagram, a × b counts the overlap twice; HCF × LCM also counts the overlap twice (once in HCF, once in LCM). This works only for two numbers, not three.',
 real:'Quick LCM: LCM(18, 24) = 18 × 24 ÷ 6 = 72.',
 apply:'HCF of two numbers is 4 and their product is 192. Find the LCM.',
 see:{w:520,h:200,f:[
  ['HCF = 12, LCM = 72.',lbl(260,60,'12 × 72 = 864','font-size="20"')],
  ['24 × 36 = 864.',lbl(260,110,'24 × 36 = 864','font-size="20"')],
  ['HCF × LCM = a × b.',lbl(260,165,'HCF × LCM = a × b','font-size="20" font-weight="700"')]]},
 seeNote:'Only for two numbers.',
 do:{title:'Test it',mat:'Notebook',steps:['Check the relation for 3 pairs.'],obs:'Always true.',why:'Venn argument.',lab:false},
 memo:'"HCF × LCM = a × b."',
 miscon:['"The relation works for three numbers too." It does not, in general.'],
 terms:['Product relation'],
 q:{q:'a = 15, b = 20, HCF = 5. LCM =',o:['300','60','75','100'],a:1,why:'300 ÷ 5.'},
 exam:'Use HCF × LCM relation: 2 marks.'},

{id:'h6',num:'3.6',title:'HCF or LCM? Word problems',
 intro:'Is the question asking for the largest equal piece, or the first time things coincide?',
 obj:'Decide whether a problem needs HCF or LCM, and solve it.',
 prior:'3.1–3.5.',
 simple:'HCF: largest size that divides things exactly — equal pieces, biggest square tile for a floor, largest group size, simplifying fractions. LCM: smallest quantity that is a multiple of both — when events repeat together, smallest box both lengths fit into, common denominators.',
 detail:'Floor 360 cm × 240 cm: largest square tile = HCF(360, 240) = 120 cm → 3 × 2 = 6 tiles. Traffic lights changing every 48 s and 72 s: together after LCM = 144 s. Adding fractions: LCM of denominators gives the common denominator.',
 real:'Tiling a classroom floor with the fewest square tiles uses the HCF.',
 apply:'Two ropes 84 m and 126 m are cut into pieces of equal length, as long as possible. Length of each piece?',
 see:{w:520,h:220,f:[
  ['Floor 360 × 240 cm.',`<rect x="60" y="40" width="180" height="120" fill="none" stroke="${ink}" stroke-width="2"/>`],
  ['Largest square tile: HCF = 120 cm → 6 tiles.',[0,1,2].map(i=>[0,1].map(j=>`<rect x="${60+i*60}" y="${40+j*60}" width="60" height="60" fill="${GN}" opacity="${(i+j)%2?.25:.45}" stroke="${GN}"/>`).join('')).join('')+lbl(150,185,'HCF → tiles')],
  ['Lights every 48 s and 72 s: together after LCM = 144 s.',lbl(390,100,'LCM → together','font-size="15" font-weight="700"')+lbl(390,130,'144 s')]]},
 seeNote:'Pieces → HCF; together → LCM.',
 do:{title:'Sort problems',mat:'Problem cards',steps:['Sort 8 word problems into HCF and LCM piles.','Solve two from each.'],obs:'Key words help.',why:'Decide first.',lab:false},
 memo:'"Cut/divide → HCF; meet/repeat → LCM."',
 miscon:['"Bigger answer means LCM always." Decide by meaning.'],
 terms:['Word problems','Tiles','Coincide'],
 q:{q:'Bells every 12 and 15 min ring together after:',o:['3 min','60 min','27 min','180 min'],a:1,why:'LCM.'},
 exam:'HCF/LCM word problems: 3 marks.'}
];

const CARDS=[['Common factors','Divide both numbers.'],['HCF','Highest common factor (GCD).'],['Co-prime','HCF = 1.'],['Common multiples','Multiples of both.'],['LCM','Least common multiple.'],['HCF by primes','Common primes, smaller powers.'],['LCM by primes','All primes, greatest powers.'],['Venn','Overlap = HCF; everything = LCM.'],['Relation','HCF × LCM = a × b.'],['Which one?','Pieces/tiles → HCF; together → LCM.']];

const Q=[
 {lv:1,q:'HCF of 12 and 18:',o:['3','6','36','2'],a:1,w:'Largest common factor.'},
 {lv:1,q:'LCM of 3 and 5:',o:['8','15','1','30'],a:1,w:'Co-prime → product.'},
 {lv:1,q:'Numbers with HCF 1 are called:',o:['primes','co-prime','composite','even'],a:1,w:'Co-prime.'},
 {lv:2,q:'HCF(45, 75):',o:['5','15','25','225'],a:1,w:'3 × 5.'},
 {lv:2,q:'LCM(8, 12):',o:['24','48','4','96'],a:0,w:'2³ × 3.'},
 {lv:2,q:'LCM(7, 21):',o:['7','21','147','3'],a:1,w:'7 divides 21.'},
 {lv:3,q:'HCF = 6, a × b = 432. LCM =',o:['72','2592','438','36'],a:0,w:'432 ÷ 6.'},
 {lv:3,q:'Largest square tile for floor 4.2 m × 3 m (in cm):',o:['60 cm','30 cm','20 cm','120 cm'],a:0,w:'HCF(420, 300).'},
 {lv:4,q:'Three lights flash every 4, 6 and 10 s. Together after:',o:['20 s','60 s','240 s','30 s'],a:1,w:'LCM.'},
 {lv:4,q:'Which needs HCF?',o:['when buses meet','longest equal pieces from two ropes','common denominator','bells together'],a:1,w:'Cutting.'},
 {lv:5,open:true,m:3,q:'Find HCF and LCM of 84 and 120 by prime factorisation, and verify HCF × LCM = product.',ans:['84 = 2²·3·7, 120 = 2³·3·5 (1)','HCF = 12, LCM = 840 (1)','12 × 840 = 10080 = 84 × 120 (1)']},
 {lv:5,open:true,m:3,q:'Ropes of 72 m, 108 m and 180 m are cut into equal pieces, as long as possible. Length and number of pieces?',ans:['HCF(72, 108, 180) = 36 m (1.5)','Pieces: 2 + 3 + 5 = 10 (1.5)']}
];

const ONEMIN=['Common factors; HCF.','Common multiples; LCM.','Prime factorisation for HCF and LCM.','Venn: overlap HCF; all LCM.','HCF × LCM = a × b.','Cut → HCF; meet → LCM.'];
const KEYS=[['HCF',/HCF|highest common/i],['LCM',/LCM|least common/i],['prime factorisation',/prime/i],['Venn',/venn|overlap/i],['relation',/product/i],['word problems',/tile|bell|rope|piece/i]];

/* ---------- lab ---------- */
let A=24,B=36,V='venn';
function draw(){const h=gcd(A,B),l=lcm(A,B);let s='';
 if(V==='venn'){const v=venn(230,150,0,0,A,B,95);s+=v.s+T(230,285,`HCF = ${v.common.length?v.common.join(' × '):'1'} = ${h}`,'font-size="15" font-weight="700" fill="'+GN+'"')+T(230,308,`LCM = ${[...v.ra,...v.common,...v.rb].join(' × ')} = ${l}`,'font-size="13" font-weight="700"')}
 if(V==='tile'){const W=Math.max(A,B),H=Math.min(A,B);const sc=Math.min(400/W,240/H);const n1=W/h,n2=H/h;s+=`<rect x="30" y="30" width="${W*sc}" height="${H*sc}" fill="none" stroke="${ink}" stroke-width="2"/>`;if(n1*n2<=400)for(let i=0;i<n1;i++)for(let j=0;j<n2;j++)s+=`<rect x="${30+i*h*sc}" y="${30+j*h*sc}" width="${h*sc}" height="${h*sc}" fill="${GN}" opacity="${(i+j)%2?.25:.5}" stroke="${GN}" stroke-width=".5"/>`;s+=T(230,300,`Floor ${W} × ${H}: largest square tile ${h} × ${h} → ${n1*n2} tiles`,'font-size="13" font-weight="700"')}
 if(V==='bell'){const max=Math.min(l*2,600);const sc=420/max;s+=`<line x1="20" y1="100" x2="440" y2="100" stroke="${GR}"/><line x1="20" y1="200" x2="440" y2="200" stroke="${GR}"/>`+T(20,85,`every ${A}`,'font-size="12" text-anchor="start" fill="'+BL+'"')+T(20,185,`every ${B}`,'font-size="12" text-anchor="start" fill="'+OR+'"');
  for(let t=0;t<=max;t+=A)s+=`<circle cx="${20+t*sc}" cy="100" r="5" fill="${BL}"/>`;for(let t=0;t<=max;t+=B)s+=`<circle cx="${20+t*sc}" cy="200" r="5" fill="${OR}"/>`;
  for(let t=0;t<=max;t+=l)s+=`<line x1="${20+t*sc}" y1="80" x2="${20+t*sc}" y2="220" stroke="${GN}" stroke-width="2.5"/>`+T(20+t*sc,245,String(t),'font-size="12" font-weight="700" fill="'+GN+'"');s+=T(230,290,`Together at 0, ${l}, ${2*l}, … (LCM = ${l})`,'font-size="13" font-weight="700"')}
 $('#hSvg').innerHTML=s;$('#hOut').innerHTML=`<p><b>HCF(${A}, ${B}) = ${h}</b>, <b>LCM(${A}, ${B}) = ${l}</b>.</p><p>Check: ${h} × ${l} = ${h*l} = ${A} × ${B}.${h===1?' The numbers are co-prime.':''}</p>`}
function labShow(){draw()}
function labInit(){}
function labClick(b){if(b.id==='hGo'){const a=Math.floor(+$('#hA').value),c=Math.floor(+$('#hB').value);if(!(a>=2&&a<=300&&c>=2&&c<=300)){$('#hOut').innerHTML='<p class="fb no">Use whole numbers from 2 to 300.</p>';return true}A=a;B=c;draw();return true}return false}
function labChange(t){if(t.id==='hV'){V=t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
