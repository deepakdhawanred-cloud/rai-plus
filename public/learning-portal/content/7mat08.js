/* Rai Plus content pack: Class 7 Mathematics (Ganita Prakash), Chapter 8 – Working with Fractions. */
RP.register({key:'7mat08',cls:'7',subject:'Mathematics',ch:'8',title:"Working with Fractions",color:'#a3501b',
crumb:"Class 7 Mathematics · Ganita Prakash",h1:"Chapter 8: Working with Fractions",sub:"Multiplying fractions by whole numbers and by fractions, the area model, reciprocals, dividing fractions, and word problems.",heroLabel:"An area model showing ½ × ⅔",labName:'Fraction operations lab',
theme:"\n:root{--g:light-dark(#a3501b,#f0a877);--g2:light-dark(#fbeee4,#2a160a);--line:light-dark(#f1d6c4,#4a2c1a);--bg:light-dark(#ffffff,#130b06);--card:light-dark(#ffffff,#1b1009);\n--ink:light-dark(#24140a,#f6e8de);--mute:light-dark(#6e5444,#cfb4a3);--y:light-dark(#1f5f8b,#8fc2e6);--y2:light-dark(#e6f0f8,#0c1a26);--hd:#7f3c12}\n",
labHTML:`  <h2>Fraction operations lab</h2>
  <p><b>Multiply:</b> the area model shows a/b × c/d as overlapping shaded parts. <b>Divide:</b> see how many pieces of the second fraction fit into the first.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="oSvg" viewBox="0 0 460 320" role="img" aria-label="Fraction area model" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Operation<select id="oOp"><option value="mul">Multiply (×)</option><option value="div">Divide (÷)</option></select></label></div>
  <div class="ctrl"><label>First: <b id="oAv"></b></label> <label>top<input type="range" class="oS" id="oA1" min="1" max="9" value="1"></label><label>bottom<input type="range" class="oS" id="oA2" min="1" max="9" value="2"></label></div>
  <div class="ctrl"><label>Second: <b id="oBv"></b></label> <label>top<input type="range" class="oS" id="oB1" min="1" max="9" value="2"></label><label>bottom<input type="range" class="oS" id="oB2" min="1" max="9" value="3"></label></div>
  <div class="box y" id="oOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#a3501b',LABNAME='Fraction operations lab',MIND_CENTER='Fraction operations';
const OR='#a3501b',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const gcd=(a,b)=>b?gcd(b,a%b):a;
const fr=(x,y,a,b,o='')=>T(x,y-4,String(a),'font-size="15" '+o)+`<line x1="${x-10}" y1="${y}" x2="${x+10}" y2="${y}" stroke="currentColor"/>`+T(x,y+16,String(b),'font-size="15" '+o);
function area(x0,y0,W,H,a,b,c,d){let s='';for(let i=0;i<b;i++)for(let j=0;j<d;j++){const inA=i<a,inC=j<c;s+=`<rect x="${x0+i*W/b}" y="${y0+j*H/d}" width="${W/b}" height="${H/d}" fill="${inA&&inC?PU:inA?OR:inC?BL:'none'}" opacity="${inA&&inC?.75:.25}" stroke="${ink}" stroke-width=".5"/>`}return s+`<rect x="${x0}" y="${y0}" width="${W}" height="${H}" fill="none" stroke="${ink}" stroke-width="2"/>`}
function heroDraw(){return area(60,25,150,100,1,2,2,3).replace(/currentColor/g,'#fff')}
const HERO=heroDraw;
const MIND=[['Fraction × whole',100,50],['Fraction of a fraction',420,50],['Product rule',90,150],['Reciprocals',430,150],['Dividing fractions',110,250],['Word problems',410,250]];

const C=[
{id:'o1',num:'8.1',title:'Multiplying a fraction by a whole number',
 intro:'Each child eats ¾ of a roti. How many rotis do 4 children eat?',
 obj:'Multiply fractions by whole numbers as repeated addition.',
 prior:'Class 6: fractions; adding fractions.',
 simple:'4 × ¾ = ¾ + ¾ + ¾ + ¾ = 12/4 = 3. Multiply the numerator by the whole number; keep the denominator: n × a/b = (n × a)/b. Also "¾ of 12" = ¾ × 12 = 9.',
 detail:'"Of" means multiply: ⅓ of 15 = 5. Simplify before or after: 6 × ⅔ = 12/3 = 4. Mixed numbers can be written as improper fractions first: 3 × 1½ = 3 × 3/2 = 9/2 = 4½.',
 real:'A recipe needs ⅔ cup of milk per person; for 6 people: 4 cups.',
 apply:'Find ⅖ of 35.',
 see:{w:520,h:200,f:[
  ['¾ of a roti.',[0].map(()=>`<circle cx="80" cy="90" r="40" fill="none" stroke="${ink}"/><path d="M80 90 L80 50 A40 40 0 1 1 40 90z" fill="${OR}" opacity=".6"/>`).join('')],
  ['4 children: ¾ + ¾ + ¾ + ¾.',[1,2,3].map(k=>`<circle cx="${80+k*95}" cy="90" r="40" fill="none" stroke="${ink}"/><path d="M${80+k*95} 90 L${80+k*95} 50 A40 40 0 1 1 ${40+k*95} 90z" fill="${OR}" opacity=".6"/>`).join('')],
  ['= 12/4 = 3 rotis.',lbl(260,180,'4 × ¾ = 12/4 = 3','font-size="18" font-weight="700"')]]},
 seeNote:'Repeated addition.',
 do:{title:'Recipe scaling',mat:'A recipe',steps:['Scale ingredients for 3 times the people.'],obs:'Fractions multiply.',why:'Fraction × whole.',lab:false},
 memo:'"Whole × top; bottom stays."',
 miscon:['"4 × ¾ = 12/16." Multiply the numerator only.'],
 terms:['Fraction × whole','"of" means ×'],
 q:{q:'⅔ of 18 =',o:['6','9','12','27'],a:2,why:'18 ÷ 3 × 2.'},
 exam:'Fraction of a quantity: 1 mark.'},

{id:'o2',num:'8.2',title:'Fraction of a fraction: the area model',
 intro:'Half of ⅔ of a chocolate bar — how much is that?',
 obj:'Find a fraction of a fraction using the area model.',
 prior:'8.1.',
 simple:'Take a rectangle as 1. Shade ⅔ of it (columns). Now take ½ of that shaded part (rows). The double-shaded part is 2 of 6 equal pieces = 2/6 = ⅓. So ½ × ⅔ = ⅓.',
 detail:'The area model: split the rectangle into b columns and d rows; a/b × c/d covers a × c of the b × d small rectangles. It shows why the product rule works.',
 real:'½ of ⅔ of a field planted with wheat is ⅓ of the field.',
 apply:'Use the area model for ⅓ × ¾.',
 see:{w:520,h:220,f:[
  ['⅔ shaded (columns).',area(60,30,180,150,2,3,0,1)],
  ['Half of that (rows).',area(300,30,180,150,2,3,1,2)],
  ['2 of 6 parts: ⅓.',lbl(390,205,'½ × ⅔ = 2/6 = ⅓','font-weight="700"')]]},
 seeNote:'Overlap = product.',
 do:{title:'Fold and shade',mat:'Paper square',steps:['Fold in thirds; shade 2.','Fold the other way in half; shade 1 part.'],obs:'Overlap is ⅓.',why:'Area model.',lab:true},
 memo:'"Shade one way, then the other; overlap is the answer."',
 miscon:['"Multiplying always makes bigger." Multiplying by a fraction less than 1 makes smaller.'],
 terms:['Area model','Fraction of a fraction'],
 q:{q:'½ × ½ =',o:['1','½','¼','2'],a:2,why:'Half of a half.'},
 exam:'Area model: 2 marks.'},

{id:'o3',num:'8.3',title:'The product rule',
 intro:'Is there a quick way to multiply ⅗ × 4/7?',
 obj:'Multiply fractions: numerator × numerator, denominator × denominator.',
 prior:'8.2.',
 simple:'a/b × c/d = (a × c)/(b × d). ⅗ × 4/7 = 12/35. Simplify by cancelling common factors first: 4/9 × 3/8 = (1 × 1)/(3 × 2) = 1/6.',
 detail:'Brahmagupta (628 CE) stated this rule. Multiplying by a fraction less than 1 gives a smaller result; by a fraction greater than 1 gives a larger result. Mixed numbers: convert to improper fractions: 1½ × 2⅔ = 3/2 × 8/3 = 4.',
 real:'A plot ¾ km long and ⅔ km wide has area ½ km².',
 apply:'Find 5/6 × 9/10.',
 see:{w:520,h:200,f:[
  ['⅗ × 4/7',fr(180,90,3,5)+lbl(230,95,'×','font-size="20"')+fr(280,90,4,7)],
  ['= (3 × 4)/(5 × 7)',lbl(400,95,'= 12/35','font-size="20" font-weight="700"')],
  ['Cancel first to keep numbers small.',lbl(260,175,'4/9 × 3/8 = 1/6 (cancel 4 with 8, 3 with 9)','fill="'+OR+'"')]]},
 seeNote:'Top × top, bottom × bottom.',
 do:{title:'Cancel race',mat:'Worksheet',steps:['Multiply 5 pairs with and without cancelling first.'],obs:'Cancelling is faster.',why:'Common factors.',lab:false},
 memo:'"Top × top over bottom × bottom."',
 miscon:['"Cross-multiply to multiply fractions." That is for comparing.'],
 terms:['Product rule','Cancel','Improper fraction'],
 q:{q:'⅔ × 9/10 =',o:['3/5','18/30','11/13','27/20'],a:0,why:'18/30 = 3/5.'},
 exam:'Multiply fractions: 2 marks.'},

{id:'o4',num:'8.4',title:'Reciprocals',
 intro:'What do you multiply ⅗ by to get 1?',
 obj:'Find reciprocals and understand their use.',
 prior:'8.3.',
 simple:'Two numbers whose product is 1 are reciprocals of each other. Reciprocal of a/b is b/a: ⅗ × 5/3 = 1. Reciprocal of 7 (= 7/1) is 1/7. Zero has no reciprocal.',
 detail:'Reciprocal of a mixed number: convert first: 2½ = 5/2 → reciprocal 2/5. A fraction less than 1 has a reciprocal greater than 1, and vice versa. 1 is its own reciprocal.',
 real:'If ¼ km takes 3 minutes, 4 times as many quarter-kms (1 km) take 12 minutes — reciprocals connect "per" quantities.',
 apply:'Find the reciprocal of 3⅓.',
 see:{w:520,h:200,f:[
  ['⅗',fr(150,90,3,5)],
  ['× 5/3',lbl(210,95,'×','font-size="20"')+fr(260,90,5,3)],
  ['= 1: they are reciprocals.',lbl(380,95,'= 1','font-size="22" font-weight="700"')+lbl(260,175,'flip the fraction')]]},
 seeNote:'Flip it.',
 do:{title:'Reciprocal pairs',mat:'Cards',steps:['Match each fraction to its reciprocal.'],obs:'Products are 1.',why:'Definition.',lab:false},
 memo:'"Flip to find the reciprocal."',
 miscon:['"Reciprocal of ⅗ is −⅗." It is 5/3.'],
 terms:['Reciprocal'],
 q:{q:'Reciprocal of 7/9:',o:['9/7','−7/9','7/9','1'],a:0,why:'Flip.'},
 exam:'Find reciprocals: 1 mark.'},

{id:'o5',num:'8.5',title:'Dividing fractions',
 intro:'How many ½-cup scoops are in 3 cups of rice?',
 obj:'Divide fractions by multiplying by the reciprocal.',
 prior:'8.4.',
 simple:'3 ÷ ½ asks "how many halves in 3?" — 6. Rule: dividing by a fraction is the same as multiplying by its reciprocal: a/b ÷ c/d = a/b × d/c. ¾ ÷ ⅜ = ¾ × 8/3 = 2.',
 detail:'Dividing by a fraction less than 1 gives a bigger result (more pieces fit). Check with a strip: how many ⅜ pieces fit in ¾? Exactly 2. Mixed numbers: 2½ ÷ ¼ = 5/2 × 4 = 10.',
 real:'A 3 m ribbon cut into pieces of ¾ m gives 4 pieces.',
 apply:'Find 2/3 ÷ 4/9.',
 see:{w:520,h:200,f:[
  ['3 cups.',[0,1,2].map(k=>`<rect x="${60+k*130}" y="60" width="120" height="40" fill="${OR}" opacity=".3" stroke="${ink}"/>`).join('')],
  ['Cut each into halves.',[0,1,2].map(k=>`<line x1="${120+k*130}" y1="60" x2="${120+k*130}" y2="100" stroke="${ink}" stroke-width="2"/>`).join('')],
  ['6 halves: 3 ÷ ½ = 3 × 2 = 6.',lbl(260,160,'3 ÷ ½ = 3 × 2 = 6','font-size="18" font-weight="700"')]]},
 seeNote:'Divide = multiply by the reciprocal.',
 do:{title:'Scoops',mat:'Rice, ½ and ¼ cup measures',steps:['Count ½-cup scoops in 2 cups.','Count ¼-cup scoops.'],obs:'4 and 8.',why:'Division by fractions.',lab:true},
 memo:'"Keep, change, flip."',
 miscon:['"Dividing always makes smaller." Dividing by ½ doubles.'],
 terms:['Division of fractions','Keep–change–flip'],
 q:{q:'⅘ ÷ ⅖ =',o:['2','8/25','½','4'],a:0,why:'⅘ × 5/2.'},
 exam:'Divide fractions: 2 marks.'},

{id:'o6',num:'8.6',title:'Word problems with fractions',
 intro:'A tank holds 60 litres; it is ⅘ full. ⅜ of the water is used. How much is left?',
 obj:'Solve multi-step problems with fraction operations.',
 prior:'8.1–8.5.',
 simple:'Read carefully: "of" → ×; "how many … in" → ÷. Water in tank = ⅘ × 60 = 48 L. Used = ⅜ × 48 = 18 L. Left = 30 L.',
 detail:'Check if the answer is sensible: the remaining amount must be less than 48 L. Draw a bar model to plan the steps. Units must be consistent.',
 real:'Farm: ⅔ of a 12-acre field is wheat; ¼ of the wheat area is irrigated by drip — 2 acres.',
 apply:'A rope 7½ m is cut into pieces of 1¼ m. How many pieces?',
 see:{w:520,h:200,f:[
  ['Tank: 60 L, ⅘ full = 48 L.',`<rect x="60" y="40" width="400" height="40" fill="none" stroke="${ink}"/><rect x="60" y="40" width="320" height="40" fill="${BL}" opacity=".4"/>`+lbl(220,65,'48 L')],
  ['Used ⅜ of 48 = 18 L.',`<rect x="60" y="40" width="120" height="40" fill="${OR}" opacity=".45"/>`+lbl(120,105,'used 18 L','fill="'+OR+'"')],
  ['Left: 30 L.',lbl(280,105,'left 30 L','font-weight="700"')]]},
 seeNote:'Bar models plan the steps.',
 do:{title:'Bar model',mat:'Notebook',steps:['Draw bar models for 2 word problems.'],obs:'Steps become clear.',why:'Planning.',lab:false},
 memo:'"Of → ×; how many in → ÷."',
 miscon:['"Used ⅜ of the tank" vs "⅜ of the water" — read which whole.'],
 terms:['Bar model','Multi-step'],
 q:{q:'Pieces of ¾ m from 6 m of ribbon:',o:['4.5','8','6','2'],a:1,why:'6 ÷ ¾.'},
 exam:'Word problems: 3 marks.'}
];

const CARDS=[['n × a/b','(n × a)/b.'],['"of"','Means ×.'],['Area model','Overlap shows the product.'],['Product rule','(a × c)/(b × d).'],['Cancel first','Divide common factors.'],['Reciprocal','a/b ↔ b/a; product 1.'],['Zero','No reciprocal.'],['Division','a/b ÷ c/d = a/b × d/c.'],['Effect','× fraction < 1 smaller; ÷ fraction < 1 bigger.'],['Brahmagupta','Gave fraction rules (628 CE).']];

const Q=[
 {lv:1,q:'3 × ⅖ =',o:['6/15','6/5','3/10','5/6'],a:1,w:'Numerator × 3.'},
 {lv:1,q:'Reciprocal of 4:',o:['−4','¼','4','1'],a:1,w:'1/4.'},
 {lv:1,q:'½ × ⅓ =',o:['⅙','⅚','2/5','⅔'],a:0,w:'1/6.'},
 {lv:2,q:'¾ of 20 =',o:['15','12','5','16'],a:0,w:'20 ÷ 4 × 3.'},
 {lv:2,q:'⅔ ÷ ⅓ =',o:['2','2/9','½','⅓'],a:0,w:'⅔ × 3.'},
 {lv:2,q:'1½ × 4 =',o:['6','5','4½','8'],a:0,w:'3/2 × 4.'},
 {lv:3,q:'5/8 × 4/15 =',o:['⅙','20/120','9/23','1/12'],a:0,w:'Cancel.'},
 {lv:3,q:'3 ÷ ¾ =',o:['4','9/4','¼','2¼'],a:0,w:'3 × 4/3.'},
 {lv:4,q:'Which is the largest?',o:['6 × ½','6 ÷ ½','6 × ⅓','6 ÷ 2'],a:1,w:'12.'},
 {lv:4,q:'A 7½ m rope cut into 1¼ m pieces gives:',o:['6','5','8','9⅜'],a:0,w:'15/2 ÷ 5/4.'},
 {lv:5,open:true,m:3,q:'Use the area model to find ⅔ × ¾ and explain.',ans:['Rectangle in 3 columns, shade 2 (1)','4 rows, shade 3 the other way (1)','Overlap 6 of 12 = ½ (1)']},
 {lv:5,open:true,m:3,q:'A tank of 80 L is ¾ full; ⅖ of the water is used. How much remains?',ans:['Water = ¾ × 80 = 60 L (1)','Used = ⅖ × 60 = 24 L (1)','Remaining 36 L (1)']}
];

const ONEMIN=['n × a/b; "of" means ×.','Area model for fraction × fraction.','Product rule; cancel first.','Reciprocals: flip; product 1.','Divide = multiply by reciprocal.','Word problems: bar models.'];
const KEYS=[['fraction × whole',/whole|of/i],['area model',/area model|overlap/i],['product rule',/product|numerator/i],['reciprocal',/reciprocal|flip/i],['division',/divid|÷/i],['word problems',/problem|bar model/i]];

/* ---------- lab ---------- */
let op='mul',a=1,b=2,c=2,d=3;
const simp=(n,m)=>{const g=gcd(n,m);return [n/g,m/g]};const show=(n,m)=>{const [p,q]=simp(n,m);return q===1?String(p):p>q?`${p}/${q} = ${Math.floor(p/q)} ${p%q}/${q}`:`${p}/${q}`};
function draw(){let s='';$('#oAv').textContent=`${a}/${b}`;$('#oBv').textContent=`${c}/${d}`;
 if(op==='mul'){const A=Math.min(a,b),Cc=Math.min(c,d);s+=area(80,30,300,220,A,b,Cc,d)+T(230,280,`${a}/${b} × ${c}/${d}`,'font-size="16" font-weight="700"');
  if(a>b||c>d)s+=T(230,305,'(area model shown for fractions up to 1)','font-size="11" fill="#888"');
  $('#oSvg').innerHTML=s;const N=a*c,D=b*d;$('#oOut').innerHTML=`<p>Columns: ${b} (shade ${a}). Rows: ${d} (shade ${c}). Overlap: ${a*c} of ${b*d} small rectangles.</p><p><b>${a}/${b} × ${c}/${d} = ${N}/${D}${show(N,D)!==`${N}/${D}`?' = '+show(N,D):''}</b></p><p class="note">${N/D<a/b?'Multiplying by a fraction less than 1 made it smaller.':'Multiplying by a fraction ≥ 1 did not make it smaller.'}</p>`}
 else{const v1=a/b,v2=c/d,q=v1/v2;const W=400,scale=W/Math.max(1,Math.ceil(v1));let x=30;s+=`<rect x="30" y="60" width="${v1*scale}" height="40" fill="${OR}" opacity=".35" stroke="${ink}"/>`+T(30+v1*scale/2,50,`${a}/${b}`,'font-size="13" font-weight="700"');
  const n=Math.floor(q+1e-9);for(let k=0;k<n&&k<40;k++){s+=`<rect x="${30+k*v2*scale}" y="120" width="${v2*scale}" height="40" fill="${BL}" opacity="${k%2?.35:.55}" stroke="${ink}"/>`}const rem=q-n;if(rem>1e-9)s+=`<rect x="${30+n*v2*scale}" y="120" width="${rem*v2*scale}" height="40" fill="${BL}" opacity=".15" stroke="${ink}" stroke-dasharray="3 3"/>`;
  s+=T(230,190,`pieces of size ${c}/${d}`,'font-size="12" fill="#888"')+T(230,240,`${a}/${b} ÷ ${c}/${d} = ${a}/${b} × ${d}/${c}`,'font-size="16" font-weight="700"');$('#oSvg').innerHTML=s;
  $('#oOut').innerHTML=`<p>How many ${c}/${d} pieces fit in ${a}/${b}? <b>${show(a*d,b*c)}</b>${rem>1e-9?' (the last piece is only partly filled)':''}.</p><p>Keep ${a}/${b}, change ÷ to ×, flip ${c}/${d} → ${d}/${c}.</p>`}}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('oS'))labChange(e.target)})}
function labClick(){return false}
function labChange(t){switch(t.id){case 'oOp':op=t.value;break;case 'oA1':a=+t.value;break;case 'oA2':b=+t.value;break;case 'oB1':c=+t.value;break;case 'oB2':d=+t.value;break;default:return false}draw();return true}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
