/* Rai Plus content pack: Class 7 Mathematics (Ganita Prakash), Chapter 2 – Arithmetic Expressions. */
RP.register({key:'7mat02',cls:'7',subject:'Mathematics',ch:'2',title:"Arithmetic Expressions",color:'#6a4fb3',
crumb:"Class 7 Mathematics · Ganita Prakash",h1:"Chapter 2: Arithmetic Expressions",sub:"Expressions and their values, comparing expressions, terms, brackets, swapping and grouping, and the distributive property.",heroLabel:"An expression split into coloured terms",labName:'Expression lab',
theme:"\n:root{--g:light-dark(#6a4fb3,#c3b3f2);--g2:light-dark(#f1edfb,#130f22);--line:light-dark(#dcd3f3,#30285a);--bg:light-dark(#ffffff,#0b0916);--card:light-dark(#ffffff,#110e20);\n--ink:light-dark(#1b1338,#ebe6fa);--mute:light-dark(#5a5080,#b8afd6);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#4e3891}\n",
labHTML:`  <h2>Expression lab</h2>
  <p>Type an expression using numbers, + − × ÷ and brackets. The lab splits it into <b>terms</b>, evaluates each term, and adds them. Then play "Which is bigger?" without calculating fully.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="eSvg" viewBox="0 0 460 300" role="img" aria-label="Expression terms" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Expression<input id="eIn" type="text" value="30 + 5 × 4 − 12 ÷ 3" style="width:15em"></label><button class="btn" id="eGo">Evaluate</button></div>
  <div class="ctrl" style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn" data-ex="13 − 2 + 6">13 − 2 + 6</button><button class="btn" data-ex="13 − (2 + 6)">13 − (2 + 6)</button><button class="btn" data-ex="5 × (8 + 2)">5 × (8 + 2)</button><button class="btn" data-ex="5 × 8 + 5 × 2">5 × 8 + 5 × 2</button><button class="btn" data-ex="100 − 25 × 3">100 − 25 × 3</button></div>
  <div class="ctrl"><button class="btn" id="eQ">Which is bigger? (new)</button> <button class="btn" data-c="L">Left</button> <button class="btn" data-c="E">Equal</button> <button class="btn" data-c="R">Right</button></div>
  <div class="box y" id="eOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#6a4fb3',LABNAME='Expression lab',MIND_CENTER='Expressions';
const PU='#6a4fb3',OR='#b04a1f',GN='#3b6d11',BL='#1f5f8b',GR='#888780',ink='currentColor';
const COL=['#6a4fb3','#b04a1f','#3b6d11','#1f5f8b','#a0522d','#2c7a5b'];
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
function pill(x,y,t,c,w){w=w||Math.max(40,t.length*9+16);return `<rect x="${x-w/2}" y="${y-16}" width="${w}" height="28" rx="14" fill="${c}" opacity=".18" stroke="${c}"/>`+T(x,y+3,t,'font-size="14" font-weight="700"')}
function heroDraw(){return ['30','+ 5 × 4','− 12 ÷ 3'].map((t,i)=>`<rect x="${30+i*110}" y="50" width="100" height="36" rx="18" fill="#fff" opacity="${0.5+i*0.15}"/><text x="${80+i*110}" y="74" font-size="16" text-anchor="middle" fill="#4e3891">${t}</text>`).join('')}
const HERO=heroDraw;
const MIND=[['Expressions & values',100,50],['Comparing',420,50],['Terms',90,150],['Brackets',430,150],['Swapping & grouping',110,250],['Distributive property',410,250]];

const C=[
{id:'e1',num:'2.1',title:'Expressions and their values',
 intro:'"13 + 2" and "15" — are they the same?',
 obj:'Understand an arithmetic expression and its value.',
 prior:'Class 6: operations on numbers.',
 simple:'An arithmetic expression is a combination of numbers and operations (+, −, ×, ÷), like 13 + 2 or 4 × 5 − 3. Its value is the number we get after doing the operations: the value of 13 + 2 is 15. We write 13 + 2 = 15. Many different expressions can have the same value: 10 + 5, 3 × 5, 20 − 5 all equal 15.',
 detail:'Expressions describe real situations: "Irfan bought 3 pens at ₹12 each and paid with ₹50" → change = 50 − 3 × 12 = 14. Writing the expression first helps us think clearly before calculating.',
 real:'Shop bills are expressions: 2 × 45 + 3 × 20 = total.',
 apply:'Write three different expressions whose value is 24.',
 see:{w:520,h:200,f:[
  ['An expression…',pill(150,70,'13 + 2',PU,120)],
  ['…has a value.',lbl(260,75,'=','font-size="24"')+pill(360,70,'15',GN,70)],
  ['Many expressions, same value.',['10 + 5','3 × 5','20 − 5','30 ÷ 2'].map((t,i)=>pill(80+i*120,150,t,COL[i],100)).join('')]]},
 seeNote:'Expression → value.',
 do:{title:'Bill as expression',mat:'A shop bill',steps:['Write the bill total as an expression.','Evaluate it.'],obs:'Same as the printed total.',why:'Expressions model situations.',lab:false},
 memo:'"Write it, then work it."',
 miscon:['"An expression must have only one operation." It can have many.'],
 terms:['Expression','Value','Operation'],
 q:{q:'Value of 7 × 6 − 2:',o:['28','40','42','44'],a:1,why:'42 − 2.'},
 exam:'Write an expression for a situation: 2 marks.'},

{id:'e2',num:'2.2',title:'Comparing expressions without calculating',
 intro:'Which is bigger: 1023 + 125 or 1022 + 128? Can you tell without adding?',
 obj:'Compare expressions by reasoning.',
 prior:'2.1.',
 simple:'Sometimes we can compare expressions without finding their values. 1022 + 128 vs 1023 + 125: 1022 is 1 less than 1023, but 128 is 3 more than 125, so the second is 2 more. Use symbols >, < and = to compare.',
 detail:'Rules of thumb: in a sum, increasing one number increases the value; in a difference a − b, increasing a increases the value but increasing b decreases it. In 100 − 37 vs 100 − 39, the second is smaller (we subtract more). This kind of thinking is useful in estimation and in algebra later.',
 real:'Comparing prices: "₹299 + ₹49 delivery" vs "₹319 + ₹19 delivery" — which is cheaper?',
 apply:'Without calculating, compare 87 − 29 and 87 − 31.',
 see:{w:520,h:200,f:[
  ['1023 + 125  ?  1022 + 128',lbl(260,60,'1023 + 125   ?   1022 + 128','font-size="18"')],
  ['1 less, but 3 more…',lbl(195,100,'−1','fill="'+OR+'"')+lbl(330,100,'+3','fill="'+GN+'"')],
  ['…so the right side is bigger by 2.',lbl(260,150,'1023 + 125  <  1022 + 128','font-size="18" font-weight="700"')]]},
 seeNote:'Reason with differences.',
 do:{title:'Bigger or smaller?',mat:'Cards with expression pairs',steps:['Compare without calculating.','Check by calculating.'],obs:'Reasoning works.',why:'Number sense.',lab:true},
 memo:'"Change in parts tells change in whole."',
 miscon:['"Subtracting more gives more." It gives less.'],
 terms:['Compare','Greater than (>)','Less than (<)'],
 q:{q:'Which is greater: 56 − 18 or 56 − 21?',o:['56 − 18','56 − 21','equal','can\'t tell'],a:0,why:'Subtract less.'},
 exam:'Compare expressions with reasoning: 2 marks.'},

{id:'e3',num:'2.3',title:'Terms and order of operations',
 intro:'Is 30 + 5 × 4 equal to 140 or 50?',
 obj:'Split an expression into terms and evaluate correctly.',
 prior:'2.1.',
 simple:'Terms are the parts of an expression joined by + (subtraction is adding a negative: 30 − 12 = 30 + (−12)). In 30 + 5 × 4 − 12 ÷ 3, the terms are 30, 5 × 4 and −12 ÷ 3. First find the value of each term (do × and ÷ inside it), then add the terms: 30 + 20 + (−4) = 46.',
 detail:'So multiplication and division are done before addition and subtraction. Swapping the order of terms doesn\'t change the value: 30 + 20 − 4 = 20 − 4 + 30. Be careful to keep the sign with the term when you move it.',
 real:'Bill: 2 × 45 + 3 × 20 − 10 (discount) → terms 90, 60, −10 → 140.',
 apply:'Find the terms and value of 18 − 4 × 3 + 10 ÷ 2.',
 see:{w:520,h:200,f:[
  ['30 + 5 × 4 − 12 ÷ 3',lbl(260,50,'30 + 5 × 4 − 12 ÷ 3','font-size="20"')],
  ['Terms: 30, 5 × 4, −12 ÷ 3.',pill(110,100,'30',COL[0],60)+pill(250,100,'5 × 4',COL[1],90)+pill(400,100,'− 12 ÷ 3',COL[2],110)],
  ['Values: 30 + 20 − 4 = 46.',pill(110,160,'30',COL[0],60)+pill(250,160,'20',COL[1],60)+pill(400,160,'−4',COL[2],60)+lbl(470,165,'= 46','font-weight="700" text-anchor="start"')]]},
 seeNote:'Terms first, then add.',
 do:{title:'Colour the terms',mat:'Coloured pencils, worksheet',steps:['Underline each term in a different colour.','Evaluate terms, then add.'],obs:'Fewer mistakes.',why:'Term-wise evaluation.',lab:true},
 memo:'"Split at + and −, solve each term, then add."',
 miscon:['"Work left to right always." 30 + 5 × 4 is 50, not 140.'],
 terms:['Term','Negative term','Order of operations'],
 q:{q:'Value of 20 − 3 × 4:',o:['68','8','12','32'],a:1,why:'20 − 12.'},
 exam:'Evaluate using terms: 2 marks.'},

{id:'e4',num:'2.4',title:'Brackets',
 intro:'13 − 2 + 6 = 17, but 13 − (2 + 6) = 5. Why?',
 obj:'Use brackets and remove them correctly.',
 prior:'2.3.',
 simple:'Brackets tell us to evaluate that part first, as one term. 13 − (2 + 6) = 13 − 8 = 5. Removing brackets after a minus sign: the signs of the terms inside change: 13 − (2 + 6) = 13 − 2 − 6. After a plus sign, signs stay: 13 + (2 − 6) = 13 + 2 − 6.',
 detail:'Brackets help write real situations: "₹500 minus the cost of 2 kg potatoes at ₹30 and 1 kg onions at ₹40" = 500 − (2 × 30 + 40) = 400. Nested brackets: evaluate the innermost first.',
 real:'Money left = money − (sum of all expenses).',
 apply:'Remove brackets and evaluate: 50 − (12 − 7).',
 see:{w:520,h:200,f:[
  ['13 − 2 + 6 = 17',lbl(260,50,'13 − 2 + 6 = 17','font-size="18"')],
  ['13 − (2 + 6) = 13 − 8 = 5',lbl(260,100,'13 − (2 + 6) = 13 − 8 = 5','font-size="18" font-weight="700"')],
  ['Removing brackets after "−" flips the signs inside.',lbl(260,155,'13 − (2 + 6) = 13 − 2 − 6','font-size="18" fill="'+OR+'"')]]},
 seeNote:'Minus before a bracket flips signs.',
 do:{title:'Shopping list',mat:'Notebook',steps:['Write money left after buying 3 items as one expression with brackets.','Remove brackets and check.'],obs:'Same value.',why:'Bracket rules.',lab:false},
 memo:'"Minus outside flips inside."',
 miscon:['"13 − (2 + 6) = 13 − 2 + 6." The + must become −.'],
 terms:['Brackets','Remove brackets','Nested'],
 q:{q:'40 − (10 − 3) =',o:['27','33','53','23'],a:1,why:'40 − 7.'},
 exam:'Expressions with brackets: 2 marks.'},

{id:'e5',num:'2.5',title:'Swapping and grouping',
 intro:'Is 25 + 37 + 75 easier to add in a different order?',
 obj:'Use the commutative and associative properties for addition and multiplication.',
 prior:'2.3.',
 simple:'Swapping (commutative property): a + b = b + a and a × b = b × a. Grouping (associative property): (a + b) + c = a + (b + c) and (a × b) × c = a × (b × c). These let us rearrange to calculate easily: 25 + 37 + 75 = (25 + 75) + 37 = 137; 4 × 17 × 25 = (4 × 25) × 17 = 1700.',
 detail:'Subtraction and division cannot be swapped or regrouped freely: 10 − 4 ≠ 4 − 10; (20 ÷ 2) ÷ 5 ≠ 20 ÷ (2 ÷ 5). But treating subtraction as adding a negative term lets us move terms around safely.',
 real:'Mental maths at the shop: ₹48 + ₹27 + ₹52 = (48 + 52) + 27 = ₹127.',
 apply:'Calculate smartly: 2 × 37 × 50.',
 see:{w:520,h:200,f:[
  ['25 + 37 + 75',lbl(260,50,'25 + 37 + 75','font-size="20"')],
  ['Swap and group: (25 + 75) + 37',pill(170,110,'25 + 75',COL[0],110)+pill(330,110,'+ 37',COL[1],80)],
  ['= 100 + 37 = 137',lbl(260,170,'= 100 + 37 = 137','font-size="20" font-weight="700"')]]},
 seeNote:'Make friendly numbers.',
 do:{title:'Mental maths race',mat:'Cards',steps:['Solve 5 sums by smart grouping.','Time yourself.'],obs:'Faster.',why:'Properties.',lab:false},
 memo:'"Swap and group for + and ×; not for − and ÷."',
 miscon:['"10 − 4 = 4 − 10." Subtraction is not commutative.'],
 terms:['Commutative (swapping)','Associative (grouping)'],
 q:{q:'Smart way: 4 × 13 × 25 =',o:['1300','1200','325','5200'],a:0,why:'(4×25)×13.'},
 exam:'Use properties to simplify: 2 marks.'},

{id:'e6',num:'2.6',title:'Distributive property',
 intro:'How can you find 6 × 98 in your head?',
 obj:'Use the distributive property of multiplication over addition and subtraction.',
 prior:'2.4, 2.5.',
 simple:'a × (b + c) = a × b + a × c, and a × (b − c) = a × b − a × c. This is the distributive property. 6 × 98 = 6 × (100 − 2) = 600 − 12 = 588. 5 × (8 + 2) = 5 × 8 + 5 × 2 = 50.',
 detail:'Picture it as a rectangle: 5 rows of (8 + 2) dots = 5 rows of 8 plus 5 rows of 2. It works backwards too: 23 × 7 + 23 × 3 = 23 × (7 + 3) = 230. It is the basis of long multiplication: 34 × 12 = 34 × 10 + 34 × 2.',
 real:'Price of 6 items at ₹98 each = 6 × ₹100 − 6 × ₹2 = ₹588.',
 apply:'Find 12 × 105 using the distributive property.',
 see:{w:520,h:220,f:[
  ['5 rows of (8 + 2).',[...Array(50)].map((_,k)=>`<circle cx="${80+(k%10)*24}" cy="${60+Math.floor(k/10)*24}" r="8" fill="${(k%10)<8?PU:OR}" opacity=".75"/>`).join('')],
  ['= 5 × 8 + 5 × 2',`<line x1="${80+7.5*24}" y1="45" x2="${80+7.5*24}" y2="170" stroke="${ink}" stroke-dasharray="4 3"/>`+lbl(170,195,'5 × 8 = 40','fill="'+PU+'"')+lbl(340,195,'5 × 2 = 10','fill="'+OR+'"')],
  ['5 × (8 + 2) = 50',lbl(450,110,'= 50','font-size="20" font-weight="700" text-anchor="start"')]]},
 seeNote:'Split one factor.',
 do:{title:'Mental multiply',mat:'Notebook',steps:['Do 7 × 99, 8 × 51, 15 × 102 mentally.','Check with written method.'],obs:'693, 408, 1530.',why:'Distributive property.',lab:true},
 memo:'"Multiply each part, then add."',
 miscon:['"5 × (8 + 2) = 5 × 8 + 2." Multiply both parts.'],
 terms:['Distributive property'],
 q:{q:'7 × 99 =',o:['693','700','707','63'],a:0,why:'700 − 7.'},
 exam:'Use distributive property: 2 marks.'}
];

const CARDS=[['Expression','Numbers + operations.'],['Value','Result of the expression.'],['Compare','Reason with changes: > < =.'],['Terms','Parts joined by + (− is a negative term).'],['Order','Evaluate each term (× ÷), then add.'],['Brackets','Evaluate first; minus outside flips signs.'],['Commutative','a + b = b + a; a × b = b × a.'],['Associative','(a + b) + c = a + (b + c).'],['Not for − ÷','Can\'t swap/regroup freely.'],['Distributive','a × (b ± c) = a×b ± a×c.']];

const Q=[
 {lv:1,q:'Value of 8 + 2 × 5:',o:['50','18','20','15'],a:1,w:'Term 2×5 first.'},
 {lv:1,q:'Terms of 9 − 4 × 2 + 7:',o:['9, −4×2, 7','9, 4, 2, 7','9−4, 2+7','none'],a:0,w:'Split at + and −.'},
 {lv:1,q:'Which property: 3 + 5 = 5 + 3?',o:['associative','commutative','distributive','none'],a:1,w:'Swapping.'},
 {lv:2,q:'20 − (5 + 3) =',o:['18','12','28','22'],a:1,w:'20 − 8.'},
 {lv:2,q:'Without calculating: 345 + 99 vs 346 + 97',o:['first bigger','second bigger','equal','can\'t tell'],a:0,w:'−1 but −2.'},
 {lv:2,q:'6 × (10 + 3) =',o:['63','78','60 + 3','19'],a:1,w:'60 + 18.'},
 {lv:3,q:'Remove brackets: 30 − (8 − 2) =',o:['30 − 8 − 2','30 − 8 + 2','30 + 8 − 2','30 + 8 + 2'],a:1,w:'Flip signs.'},
 {lv:3,q:'25 × 37 × 4 smartly =',o:['3700','925','2500','148'],a:0,w:'100 × 37.'},
 {lv:4,q:'"₹200 minus 3 notebooks at ₹45" as expression:',o:['200 − 3 + 45','(200 − 3) × 45','200 − 3 × 45','3 × 45 − 200'],a:2,w:'Change.'},
 {lv:4,q:'Which is NOT always true?',o:['a+b=b+a','a×b=b×a','a−b=b−a','(a×b)×c=a×(b×c)'],a:2,w:'Subtraction.'},
 {lv:5,open:true,m:3,q:'Evaluate 48 − 6 × 5 + 36 ÷ 4 showing the terms.',ans:['Terms: 48, −6×5, 36÷4 (1)','Values: 48, −30, 9 (1)','Sum = 27 (1)']},
 {lv:5,open:true,m:2,q:'Use the distributive property to find 15 × 98.',ans:['15 × (100 − 2) (1)','= 1500 − 30 = 1470 (1)']}
];

const ONEMIN=['Expression and value.','Compare by reasoning.','Terms; × ÷ inside terms first.','Brackets: minus outside flips signs.','Swap and group for + and ×.','Distributive: a(b ± c) = ab ± ac.'];
const KEYS=[['expression/value',/expression|value/i],['terms',/term/i],['brackets',/bracket/i],['commutative/associative',/swap|group|commutat|associat/i],['distributive',/distribut/i]];

/* ---------- lab ---------- */
function tokenize(str){return str.replace(/×|x|X/g,'*').replace(/÷/g,'/').replace(/−|–/g,'-').replace(/\s+/g,'')}
function safeEval(e){if(!/^[0-9+\-*/().]+$/.test(e))throw 'bad';return Function('"use strict";return ('+e+')')()}
function splitTerms(e){const out=[];let depth=0,cur='';for(let i=0;i<e.length;i++){const c=e[i];if(c==='(')depth++;if(c===')')depth--;if((c==='+'||c==='-')&&depth===0&&i>0&&!'*/('.includes(e[i-1])){out.push(cur);cur=c==='-'?'-':''}else cur+=c}out.push(cur);return out.filter(t=>t!=='')}
const pretty=t=>t.replace(/\*/g,' × ').replace(/\//g,' ÷ ').replace(/^-/,'− ').replace(/-/g,' − ').replace(/\+/g,' + ');
let quiz=null;
function show(str){let e;try{e=tokenize(str);const v=safeEval(e);if(!isFinite(v))throw 'div';const terms=splitTerms(e);const vals=terms.map(t=>safeEval(t));
 let s=T(230,30,str,'font-size="18" font-weight="700"');const n=terms.length,w=Math.min(130,420/n);terms.forEach((t,i)=>{const x=230+(i-(n-1)/2)*(w+6);s+=pill(x,85,pretty(t),COL[i%6],w)+`<line x1="${x}" y1="101" x2="${x}" y2="135" stroke="${GR}"/>`+pill(x,150,String(+vals[i].toFixed(4)),COL[i%6],Math.min(w,90))});
 s+=T(230,210,vals.map(v=>(v<0?'(':'')+(+v.toFixed(4))+(v<0?')':'')).join(' + ')+' = '+(+v.toFixed(4)),'font-size="17" font-weight="700"');s+=T(230,250,`${n} term${n>1?'s':''}`,'font-size="13" fill="#888"');
 $('#eSvg').innerHTML=s;$('#eOut').innerHTML=`<p>Value = <b>${+v.toFixed(4)}</b>. Each coloured box is a term; brackets keep their contents together as one term.</p>`}catch(err){$('#eSvg').innerHTML=T(230,150,'Use digits, + − × ÷ and brackets only','font-size="14"');$('#eOut').innerHTML='<p class="fb no">Could not read that expression.</p>'}}
const PAIRS=[['1023 + 125','1022 + 128'],['87 − 29','87 − 31'],['45 × 11','45 × 10 + 45'],['500 − (60 + 40)','500 − 60 + 40'],['36 + 49','35 + 51'],['12 × 25','6 × 50'],['999 + 999','2000 − 1'],['250 − 99','250 − 100'],['8 × (7 + 3)','8 × 7 + 3']];
function labShow(){show($('#eIn').value)}
function labInit(){}
function labClick(b){if(b.id==='eGo'){show($('#eIn').value);return true}if(b.dataset&&b.dataset.ex){$('#eIn').value=b.dataset.ex;show(b.dataset.ex);return true}
 if(b.id==='eQ'){quiz=PAIRS[Math.floor(Math.random()*PAIRS.length)];$('#eSvg').innerHTML=pill(120,140,quiz[0],COL[0],190)+T(230,145,'?','font-size="26" font-weight="700"')+pill(340,140,quiz[1],COL[3],190);$('#eOut').innerHTML='<p>Which side is bigger? Try to reason without calculating fully.</p>';return true}
 if(b.dataset&&b.dataset.c){if(!quiz){$('#eOut').innerHTML='<p>Press "Which is bigger?" first.</p>';return true}const L=safeEval(tokenize(quiz[0])),R=safeEval(tokenize(quiz[1]));const ans=L>R?'L':L<R?'R':'E';$('#eOut').innerHTML=`<p class="fb ${b.dataset.c===ans?'ok':'no'}">${b.dataset.c===ans?'Correct!':'Not quite.'} ${quiz[0]} = ${L}, ${quiz[1]} = ${R}.</p>`;quiz=null;return true}return false}
function labChange(){return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
