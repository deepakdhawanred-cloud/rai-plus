/* Rai Plus content pack: Class 6 Mathematics (Ganita Prakash), Chapter 7 – Fractions. */
RP.register({key:'6mat07',cls:'6',subject:'Mathematics',ch:'7',title:"Fractions",color:'#a3501b',
crumb:"Class 6 Mathematics · Ganita Prakash",h1:"Chapter 7: Fractions",sub:"Fractional units, fractions on the number line, mixed fractions, equivalent fractions, comparing, adding and subtracting.",heroLabel:"A roti cut into equal parts and a fraction bar",labName:'Fraction lab',
theme:"\n:root{--g:light-dark(#a3501b,#f0a877);--g2:light-dark(#fbeee4,#2a160a);--line:light-dark(#f1d6c4,#4a2c1a);--bg:light-dark(#ffffff,#130b06);--card:light-dark(#ffffff,#1b1009);\n--ink:light-dark(#24140a,#f6e8de);--mute:light-dark(#6e5444,#cfb4a3);--y:light-dark(#1f5f8b,#8fc2e6);--y2:light-dark(#e6f0f8,#0c1a26);--hd:#7f3c12}\n",
labHTML:`  <h2>Fraction lab</h2>
  <p>Set two fractions. Compare them on bars and on a number line, and see their sum and difference.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="fSvg" viewBox="0 0 460 320" role="img" aria-label="Two fractions compared" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>First: <b id="fAv"></b></label> <label>top<input type="range" class="fS" id="fA1" min="0" max="12" value="2"></label><label>bottom<input type="range" class="fS" id="fA2" min="1" max="12" value="3"></label></div><div class="ctrl"><label>Second: <b id="fBv"></b></label> <label>top<input type="range" class="fS" id="fB1" min="0" max="12" value="3"></label><label>bottom<input type="range" class="fS" id="fB2" min="1" max="12" value="4"></label></div><div class="box y" id="fOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#a3501b',LABNAME='Fraction lab',MIND_CENTER='Fractions';
const OR='#a3501b',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const fr=(x,y,a,b,o='')=>T(x,y-4,String(a),'font-size="14" '+o)+`<line x1="${x-9}" y1="${y}" x2="${x+9}" y2="${y}" stroke="currentColor"/>`+T(x,y+15,String(b),'font-size="14" '+o);
function bar(x,y,w,h,n,k,c){if(n>36)return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${ink}" stroke-width=".8"/><rect x="${x}" y="${y}" width="${w*k/n}" height="${h}" fill="${c}" opacity=".55"/>`;let s='';for(let i=0;i<n;i++)s+=`<rect x="${x+i*w/n}" y="${y}" width="${w/n}" height="${h}" fill="${i<k?c:'none'}" opacity="${i<k?.55:1}" stroke="${ink}" stroke-width=".8"/>`;return s}
function roti(cx,cy,r,n,k,c=OR){let s=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#f2d29b" stroke="${ink}"/>`;for(let i=0;i<n;i++){const a1=-Math.PI/2+i*2*Math.PI/n,a2=a1+2*Math.PI/n;if(i<k)s+=`<path d="M${cx} ${cy} L${(cx+r*Math.cos(a1)).toFixed(1)} ${(cy+r*Math.sin(a1)).toFixed(1)} A${r} ${r} 0 ${n<2?1:0} 1 ${(cx+r*Math.cos(a2)).toFixed(1)} ${(cy+r*Math.sin(a2)).toFixed(1)}Z" fill="${c}" opacity=".6"/>`;if(n>1)s+=`<line x1="${cx}" y1="${cy}" x2="${(cx+r*Math.cos(a1)).toFixed(1)}" y2="${(cy+r*Math.sin(a1)).toFixed(1)}" stroke="${ink}"/>`}return s}
const gcd=(a,b)=>b?gcd(b,a%b):a;
function heroDraw(){return roti(70,70,40,4,1,'#fff')+bar(150,55,200,30,6,4,'#fff')}
const HERO=heroDraw;
const MIND=[['Fractional units',100,50],['Number line',420,50],['Mixed fractions',90,150],['Equivalent fractions',430,150],['Comparing',110,250],['Adding & subtracting',410,250]];

const C=[
{id:'f1',num:'7.1',title:'Fractional units and fractions',
 intro:'Three children share one roti equally. How much does each get?',
 obj:'Understand fractional units and read fractions.',
 prior:'Division as sharing.',
 simple:'When a whole is divided into equal parts, each part is a fractional unit: 1 roti in 2 equal parts → ½ each; in 3 → ⅓; in 4 → ¼. A fraction like ¾ means 3 units of ¼. The bottom number (denominator) tells how many equal parts the whole has; the top number (numerator) tells how many parts we take.',
 detail:'The parts must be equal for fractional units. The more parts, the smaller each unit: ⅛ is smaller than ¼. In the past, Indian measures like "paav" (¼) and "adha" (½) were in daily use; Egyptian scribes wrote fractions as sums of unit fractions.',
 real:'"Paav kilo" (¼ kg) of tomatoes in the sabzi mandi.',
 apply:'Show ⅗ of a chocolate bar with 5 pieces.',
 see:{w:520,h:200,f:[
  ['One roti, 4 equal parts.',roti(100,100,60,4,0)],
  ['Each part: ¼ (a fractional unit).',roti(100,100,60,4,1)+fr(200,95,1,4)],
  ['3 parts: ¾.',roti(360,100,60,4,3)+fr(460,95,3,4)+lbl(360,190,'numerator 3 · denominator 4')]]},
 seeNote:'Equal parts only.',
 do:{title:'Paper folding',mat:'Paper strips',steps:['Fold a strip in half, then half again.','Shade 3 parts.','Write the fraction.'],obs:'¾.',why:'4 equal parts, 3 taken.',lab:true},
 memo:'"Bottom: how many equal parts; top: how many taken."',
 miscon:['"Any 4 parts make quarters." They must be equal.','"⅛ is bigger than ¼ because 8 > 4." More parts → smaller unit.'],
 terms:['Fraction','Fractional unit','Numerator','Denominator'],
 q:{q:'In ⅖, the denominator is:',o:['2','5','7','3'],a:1,why:'Bottom number.'},
 exam:'Represent fractions: 2 marks.'},

{id:'f2',num:'7.2',title:'Fractions on the number line and mixed fractions',
 intro:'Where does ¾ sit between 0 and 1?',
 obj:'Mark fractions on the number line; convert mixed fractions.',
 prior:'Fractional units (7.1).',
 simple:'Divide the gap between 0 and 1 into equal parts given by the denominator; count numerator parts from 0. Fractions bigger than 1, like 7/4, go beyond 1. 7/4 = 1¾ (one whole and three quarters): a mixed fraction. To convert: 7 ÷ 4 = 1 remainder 3 → 1¾. Back: 1¾ = (1 × 4 + 3)/4 = 7/4.',
 detail:'Fractions less than 1 (numerator < denominator) are sometimes called proper; those ≥ 1 improper. On the number line, 2/2 = 1, 4/4 = 1: any number over itself is 1.',
 real:'"Sawa do" (2¼) hours; "dhai" (2½) kg.',
 apply:'Write 11/3 as a mixed fraction.',
 see:{w:520,h:200,f:[
  ['0 to 2 in quarters.',`<line x1="40" y1="100" x2="480" y2="100" stroke="${ink}" stroke-width="2"/>`+[...Array(9)].map((_,i)=>`<line x1="${40+i*55}" y1="${i%4?94:88}" x2="${40+i*55}" y2="${i%4?106:112}" stroke="${ink}"/>`).join('')+lbl(40,135,'0','font-size="15"')+lbl(260,135,'1','font-size="15"')+lbl(480,135,'2','font-size="15"')],
  ['¾ is 3 quarter-steps from 0.',`<circle cx="205" cy="100" r="7" fill="${OR}"/>`+fr(205,65,3,4,'fill="'+OR+'"')],
  ['7/4 = 1¾: one whole and three quarters.',`<circle cx="425" cy="100" r="7" fill="${BL}"/>`+fr(425,65,7,4,'fill="'+BL+'"')+lbl(425,175,'= 1¾','font-size="16" font-weight="700" fill="'+BL+'"')]]},
 seeNote:'Count units from 0.',
 do:{title:'Rope line',mat:'A rope marked 0 and 1, 2 on the floor',steps:['Divide each whole into 4.','Stand at ¾, 5/4, 1½.'],obs:'Positions.',why:'Fractions are numbers.',lab:false},
 memo:'"Divide, then count."',
 miscon:['"Fractions are always less than 1." 7/4 > 1.'],
 terms:['Number line','Mixed fraction','Proper / improper'],
 q:{q:'9/4 as a mixed fraction:',o:['2¼','1¾','2½','4½'],a:0,why:'9 ÷ 4 = 2 r 1.'},
 exam:'Convert and place fractions: 2 marks.'},

{id:'f3',num:'7.3',title:'Equivalent fractions and simplest form',
 intro:'Is ½ of a roti the same as 2/4 of it?',
 obj:'Find equivalent fractions and reduce to simplest form.',
 prior:'Fractions (7.1–7.2).',
 simple:'Equivalent fractions name the same amount: ½ = 2/4 = 3/6 = 4/8. Multiply (or divide) numerator and denominator by the same number. A fraction is in simplest (lowest) form when the numerator and denominator have no common factor except 1: 6/8 = 3/4.',
 detail:'To simplify, divide both by their HCF: 18/24 → HCF 6 → 3/4. To check if two fractions are equivalent, cross-multiply: a/b = c/d when a × d = b × c (e.g. 2/3 and 8/12: 2 × 12 = 24 = 3 × 8).',
 real:'Half a dozen eggs = 6/12 = ½ of a dozen.',
 apply:'Write three fractions equivalent to ⅔.',
 see:{w:520,h:200,f:[
  ['½ of a bar.',bar(80,30,360,34,2,1,OR)+fr(470,50,1,2)],
  ['2/4 — same length.',bar(80,80,360,34,4,2,BL)+fr(470,100,2,4)],
  ['4/8 — still the same.',bar(80,130,360,34,8,4,GN)+fr(470,150,4,8)]]},
 seeNote:'Same amount, different names.',
 do:{title:'Fraction wall',mat:'Strips of paper folded into 2, 3, 4, 6, 8, 12',steps:['Line them up.','Find all strips equal to ½ and ⅓.'],obs:'½ = 2/4 = 3/6 = 4/8 = 6/12.',why:'Equivalent.',lab:true},
 memo:'"Multiply or divide top and bottom by the same."',
 miscon:['"Add the same number to top and bottom." 1/2 ≠ 2/3.'],
 terms:['Equivalent fractions','Simplest form','HCF'],
 q:{q:'Simplest form of 12/16:',o:['6/8','3/4','4/3','2/3'],a:1,why:'÷4.'},
 exam:'Equivalent fractions; simplify: 2 marks.'},

{id:'f4',num:'7.4',title:'Comparing fractions',
 intro:'Which is more: ⅗ of a pizza or ⅔ of the same pizza?',
 obj:'Compare fractions using common denominators or numerators.',
 prior:'Equivalent fractions (7.3).',
 simple:'Same denominator: bigger numerator is bigger (⅗ > ⅖). Same numerator: smaller denominator is bigger (⅓ > ⅕). Otherwise, make denominators equal using equivalent fractions: ⅗ = 9/15, ⅔ = 10/15, so ⅔ > ⅗.',
 detail:'You can also place them on the number line or compare with ½ as a benchmark: 3/7 < ½ < 4/7. Cross-multiplying works too: compare 3 × 3 = 9 with 2 × 5 = 10.',
 real:'Which shop gives more: ⅓ off or ¼ off?',
 apply:'Arrange ½, ⅔, ¾ in increasing order.',
 see:{w:520,h:200,f:[
  ['⅗ of a bar.',bar(80,40,360,34,5,3,OR)+fr(470,60,3,5)],
  ['⅔ of a bar.',bar(80,100,360,34,3,2,BL)+fr(470,120,2,3)],
  ['As 15ths: 9/15 < 10/15, so ⅗ < ⅔.',lbl(260,180,'9/15 < 10/15','font-size="16" font-weight="700"')]]},
 seeNote:'Make the units the same.',
 do:{title:'Who ate more?',mat:'Two equal paper rotis',steps:['Shade ⅗ of one and ⅔ of the other.','Cut and overlay.'],obs:'⅔ is more.',why:'Common denominator.',lab:true},
 memo:'"Same bottom: compare tops. Same top: smaller bottom wins."',
 miscon:['"⅕ > ⅓ because 5 > 3." Smaller denominator, bigger part.'],
 terms:['Compare','Common denominator','Benchmark'],
 q:{q:'Which is greater?',o:['2/7','2/5','equal','can\'t say'],a:1,why:'Same numerator, smaller denominator.'},
 exam:'Compare/order fractions: 3 marks.'},

{id:'f5',num:'7.5',title:'Adding and subtracting fractions',
 intro:'Meena ate ⅓ of a cake, Ravi ate ¼. How much was eaten?',
 obj:'Add and subtract fractions with same and different denominators.',
 prior:'Equivalent fractions, LCM (Ch 5).',
 simple:'Same denominator: add or subtract numerators, keep the denominator: 2/7 + 3/7 = 5/7; 5/8 − 2/8 = 3/8. Different denominators: rewrite with a common denominator (LCM), then add: ⅓ + ¼ = 4/12 + 3/12 = 7/12.',
 detail:'Brahmagupta (628 CE) gave this method: to add fractions with different denominators, convert them into equivalent fractions with the same denominator, then add. Simplify the answer and convert to a mixed fraction if > 1. Example: ¾ + ⅝ = 6/8 + 5/8 = 11/8 = 1⅜.',
 real:'Recipes: ½ cup + ¼ cup = ¾ cup of milk.',
 apply:'Find ⅚ − ¼.',
 see:{w:520,h:220,f:[
  ['⅓ = 4/12.',bar(80,30,360,30,12,4,OR)+lbl(470,50,'4/12')],
  ['¼ = 3/12.',bar(80,80,360,30,12,3,BL)+lbl(470,100,'3/12')],
  ['Together: 7/12.',bar(80,130,360,30,12,7,GN)+lbl(470,150,'7/12')+lbl(260,200,'⅓ + ¼ = 4/12 + 3/12 = 7/12','font-weight="700"')]]},
 seeNote:'Common units first.',
 do:{title:'Measuring cups',mat:'½, ⅓ and ¼ cups, water',steps:['Pour ½ + ¼ into a cup.','Check against the ¾ mark.'],obs:'¾.',why:'Adding fractions.',lab:false},
 memo:'"Same bottom? add tops. Different? make them same."',
 miscon:['"⅓ + ¼ = 2/7." Never add denominators.'],
 terms:['Common denominator','Brahmagupta','Sum','Difference'],
 q:{q:'½ + ⅓ =',o:['2/5','5/6','2/6','1'],a:1,why:'3/6 + 2/6.'},
 exam:'Add/subtract fractions: 3 marks.'}
];

const CARDS=[['Fractional unit','One of equal parts: ½, ⅓, ¼.'],['Numerator / denominator','Parts taken / equal parts in the whole.'],['Number line','Divide 0–1 into equal parts; count.'],['Mixed fraction','7/4 = 1¾.'],['Equivalent','½ = 2/4 = 3/6.'],['Simplest form','Divide by HCF.'],['Compare','Same denominator → bigger numerator; same numerator → smaller denominator.'],['Add/subtract','Common denominator, then numerators.'],['Brahmagupta','Gave the common-denominator method (628 CE).']];

const Q=[
 {lv:1,q:'Shaded 3 of 8 equal parts:',o:['8/3','3/8','3/5','5/8'],a:1,w:'3 of 8.'},
 {lv:1,q:'Which equals ½?',o:['2/3','3/6','2/5','4/6'],a:1,w:'3/6.'},
 {lv:1,q:'2/9 + 5/9 =',o:['7/18','7/9','3/9','10/9'],a:1,w:'Same denominator.'},
 {lv:2,q:'13/4 as mixed:',o:['3¼','4¼','3½','1¾'],a:0,w:'13 ÷ 4.'},
 {lv:2,q:'2⅓ as improper fraction:',o:['5/3','7/3','6/3','2/3'],a:1,w:'(2×3+1)/3.'},
 {lv:2,q:'Simplest form of 15/25:',o:['3/5','5/3','1/5','15/25'],a:0,w:'÷5.'},
 {lv:3,q:'Greater: 3/7 or 3/8?',o:['3/7','3/8','equal','none'],a:0,w:'Smaller denominator.'},
 {lv:3,q:'¾ − ⅓ =',o:['2/1','5/12','1/2','2/12'],a:1,w:'9/12 − 4/12.'},
 {lv:4,q:'Ascending order of ⅔, ½, ⅚:',o:['½, ⅔, ⅚','⅔, ½, ⅚','⅚, ⅔, ½','½, ⅚, ⅔'],a:0,w:'3/6, 4/6, 5/6.'},
 {lv:4,q:'A tank is ⅜ full; ¼ more is added. Now:',o:['4/12','⅝','½','⅞'],a:1,w:'3/8 + 2/8.'},
 {lv:5,open:true,m:3,q:'Find ⅖ + ⅓ showing steps.',ans:['LCM of 5 and 3 = 15 (1)','⅖ = 6/15, ⅓ = 5/15 (1)','Sum = 11/15 (1)']},
 {lv:5,open:true,m:2,q:'Why is ⅙ smaller than ¼?',ans:['Same whole cut into more equal parts (1)','So each part is smaller (1)']}
];

const ONEMIN=['Fractional units: equal parts.','Numerator/denominator.','Number line; mixed fractions.','Equivalent fractions; simplest form.','Compare by common denominators.','Add/subtract with common denominators (Brahmagupta).'];
const KEYS=[['equal parts',/equal part|unit/i],['numerator/denominator',/numerator|denominator/i],['mixed',/mixed/i],['equivalent',/equivalent/i],['simplest',/simplest|lowest/i],['compare',/compar|greater|smaller/i],['add/subtract',/add|subtract|sum/i]];

/* ---------- lab ---------- */
let a1=2,a2=3,b1=3,b2=4;
const lcm=(a,b)=>a*b/gcd(a,b);
const show=(n,d)=>{if(d===0)return '—';const g=gcd(Math.abs(n),d)||1;const N=n/g,D=d/g;if(D===1)return String(N);if(Math.abs(N)>D){const w=Math.trunc(N/D),r=Math.abs(N%D);return `${N}/${D} = ${w} ${r}/${D}`}return `${N}/${D}`};
function draw(){const L=lcm(a2,b2);let s='';
 s+=bar(40,20,300,32,a2,Math.min(a1,a2),OR)+(a1>a2?T(360,42,`+${a1-a2} more parts`,'font-size="11" text-anchor="start"'):'')+fr(420,40,a1,a2,'fill="'+OR+'"');
 s+=bar(40,70,300,32,b2,Math.min(b1,b2),BL)+(b1>b2?T(360,92,`+${b1-b2} more`,'font-size="11" text-anchor="start"'):'')+fr(420,90,b1,b2,'fill="'+BL+'"');
 s+=T(230,132,`Common units: ${L}ths`,'font-size="12" fill="#888"')+bar(40,140,300,22,L,Math.min(L,a1*L/a2),OR)+bar(40,166,300,22,L,Math.min(L,b1*L/b2),BL);
 const X=v=>40+v*190;s+=`<line x1="40" y1="250" x2="420" y2="250" stroke="${ink}" stroke-width="2"/>`+[0,1,2].map(v=>`<line x1="${X(v)}" y1="242" x2="${X(v)}" y2="258" stroke="${ink}"/>`+T(X(v),276,String(v),'font-size="13"')).join('');
 const va=a1/a2,vb=b1/b2;s+=`<circle cx="${X(Math.min(2,va))}" cy="250" r="7" fill="${OR}"/><circle cx="${X(Math.min(2,vb))}" cy="250" r="7" fill="${BL}" opacity=".8"/>`+T(X(Math.min(2,va)),236,`${a1}/${a2}`,`font-size="12" fill="${OR}"`)+T(X(Math.min(2,vb)),300,`${b1}/${b2}`,`font-size="12" fill="${BL}"`);
 $('#fSvg').innerHTML=s;$('#fAv').textContent=`${a1}/${a2}`;$('#fBv').textContent=`${b1}/${b2}`;
 const A=a1*L/a2,B=b1*L/b2;const cmp=A>B?'>':A<B?'<':'=';
 $('#fOut').innerHTML=`<p>As ${L}ths: ${a1}/${a2} = ${A}/${L}, ${b1}/${b2} = ${B}/${L}</p><p><b>${a1}/${a2} ${cmp} ${b1}/${b2}</b>${cmp==='='?' — equivalent fractions!':''}</p><p>Sum: ${A}/${L} + ${B}/${L} = <b>${show(A+B,L)}</b></p><p>Difference: <b>${show(Math.abs(A-B),L)}</b></p>`}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('fS'))labChange(e.target)})}
function labClick(){return false}
function labChange(t){const v=+t.value;switch(t.id){case 'fA1':a1=v;break;case 'fA2':a2=v;break;case 'fB1':b1=v;break;case 'fB2':b2=v;break;default:return false}draw();return true}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
