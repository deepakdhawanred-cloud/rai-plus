/* Rai Plus content pack: Class 7 Mathematics (Ganita Prakash Part 2), Chapter 7 – Finding the Unknown (simple equations). */
RP.register({key:'7matb7',cls:'7',subject:'Mathematics',ch:'II-7',title:"Finding the Unknown",color:'#3b6d11',
crumb:"Class 7 Mathematics · Ganita Prakash Part 2",h1:"Part 2 · Chapter 7: Finding the Unknown",sub:"Number puzzles, equations as balances, solving by doing the same to both sides, two-step equations, forming equations from word problems, and checking solutions.",heroLabel:"A balance with boxes of unknown weight",labName:'Balance lab',
theme:"\n:root{--g:light-dark(#3b6d11,#a8d77d);--g2:light-dark(#eef6e4,#0f1a07);--line:light-dark(#d4e7bf,#2c4219);--bg:light-dark(#ffffff,#0b1206);--card:light-dark(#ffffff,#111a0a);\n--ink:light-dark(#162508,#e6f1da);--mute:light-dark(#4f6439,#b5c9a0);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#2b520b}\n",
labHTML:`  <h2>Balance lab</h2>
  <p>Each green box weighs x. Orange blocks weigh 1 each. Keep the balance level by doing the same thing to both pans. Get one box alone to find x.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="bSvg" viewBox="0 0 460 320" role="img" aria-label="Balance scale" style="color:var(--ink)"></svg></div></div>
  <div><div class="box" id="bEq" style="font-size:1.25em;text-align:center"></div>
  <div class="ctrl"><button class="btn" id="bM1">Remove 1 block from each pan</button> <button class="btn" id="bMx">Remove 1 box from each pan</button></div>
  <div class="ctrl"><button class="btn" id="bDiv">Divide both pans by the number of boxes</button></div>
  <div class="ctrl"><button class="btn" id="bNew">New equation</button> <button class="btn" id="bRe">Reset</button></div>
  <div class="box y" id="bOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3b6d11',LABNAME='Balance lab',MIND_CENTER='Equations';
const GN='#3b6d11',OR='#b04a1f',BL='#1f5f8b',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
function pan(x,y,boxes,ones,w=150){let s=`<path d="M${x-w/2} ${y} L${x+w/2} ${y} L${x+w/2-15} ${y+12} L${x-w/2+15} ${y+12} Z" fill="${GR}" opacity=".5"/>`;let i=0;const per=Math.floor(w/26);
 const place=(c,t)=>{const col=i%per,row=Math.floor(i/per);const bx=x-w/2+8+col*26,by=y-24-row*26;s+=`<rect x="${bx}" y="${by}" width="22" height="22" rx="${t?3:11}" fill="${c}" opacity=".85"/>`+(t?T(bx+11,by+16,t,'font-size="12" fill="#fff" font-weight="700"'):'');i++};
 for(let k=0;k<boxes;k++)place(GN,'x');for(let k=0;k<ones;k++)place(OR,'');return s}
function scale(L,R){return `<line x1="230" y1="285" x2="230" y2="60" stroke="${ink}" stroke-width="4"/><path d="M195 305 L265 305 L250 285 L210 285 Z" fill="${ink}"/><line x1="80" y1="60" x2="380" y2="60" stroke="${ink}" stroke-width="4"/><line x1="100" y1="60" x2="100" y2="215" stroke="${GR}"/><line x1="360" y1="60" x2="360" y2="215" stroke="${GR}"/>`+pan(100,215,L[0],L[1],170)+pan(360,215,R[0],R[1],170)}
function heroDraw(){return `<line x1="90" y1="60" x2="290" y2="60" stroke="#fff" stroke-width="3"/><line x1="190" y1="60" x2="190" y2="140" stroke="#fff" stroke-width="3"/><rect x="100" y="30" width="22" height="22" fill="none" stroke="#fff" stroke-width="2"/><rect x="128" y="30" width="22" height="22" fill="none" stroke="#fff" stroke-width="2"/>`+[0,1,2,3].map(k=>`<circle cx="${236+k*14}" cy="44" r="6" fill="#fff"/>`).join('')}
const HERO=heroDraw;
const MIND=[['Number puzzles',100,50],['Equation as balance',420,50],['Same to both sides',90,150],['Two-step equations',430,150],['Forming equations',110,250],['Checking',410,250]];

const C=[
{id:'u1',num:'7.1',title:'Number puzzles and the unknown',
 intro:'"I think of a number, multiply it by 3 and add 5. I get 26." What was my number?',
 obj:'Write puzzles using a letter for the unknown and find it by reasoning.',
 prior:'Part 1 Ch 2 Expressions using Letter-Numbers.',
 simple:'Use a letter for the unknown number: let it be x. "Multiply by 3 and add 5 gives 26" becomes 3x + 5 = 26. This is an equation — a statement that two expressions are equal. Work backwards: 26 − 5 = 21, then 21 ÷ 3 = 7. So x = 7.',
 detail:'An expression (3x + 5) has no "=" sign; an equation (3x + 5 = 26) does. The value of the letter that makes the equation true is the solution. Trial and error works for small numbers, but systematic methods (next concepts) work for any.',
 real:'Puzzles like "a number plus its double is 45" are quick equation practice.',
 apply:'Think of a number, double it, subtract 4, get 18. Find the number.',
 see:{w:520,h:200,f:[
  ['x → × 3 → + 5 → 26',lbl(260,50,'x  →  × 3  →  + 5  →  26','font-size="20"')],
  ['Work backwards: 26 − 5 = 21; 21 ÷ 3 = 7.',lbl(260,110,'7  ←  ÷ 3  ←  − 5  ←  26','font-size="20" fill="'+OR+'"')],
  ['x = 7.',lbl(260,170,'x = 7','font-size="24" font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Undo the steps in reverse order.',
 do:{title:'Mind reader',mat:'A partner',steps:['Partner thinks of a number, × 2, + 6, tells you the result.','Undo to find it.'],obs:'Works every time.',why:'Inverse operations.',lab:false},
 memo:'"Last done, first undone."',
 miscon:['"Undo in the same order." Undo in reverse order.'],
 terms:['Unknown','Variable','Equation','Solution'],
 q:{q:'A number plus 9 is 25. The number is:',o:['34','16','14','25'],a:1,why:'25 − 9.'},
 exam:'Form and solve puzzle equations: 2 marks.'},

{id:'u2',num:'7.2',title:'An equation is a balance',
 intro:'Two boxes and 3 blocks balance 11 blocks. How heavy is one box?',
 obj:'Model equations with a balance and keep it level.',
 prior:'7.1.',
 simple:'Think of an equation as a balance: the left side and right side weigh the same. 2x + 3 = 11 means 2 boxes and 3 blocks on the left balance 11 blocks on the right. Whatever you do to one pan, you must do to the other, or the balance tips.',
 detail:'Remove 3 blocks from each pan: 2x = 8. Halve both pans: x = 4. Each box weighs 4. The balance idea explains every rule for solving equations.',
 real:'A shopkeeper\'s balance with a known weight on one side finds the unknown weight on the other.',
 apply:'Draw a balance for 3x + 2 = 14 and solve it.',
 see:{w:460,h:300,f:[
  ['2x + 3 = 11',scale([2,3],[0,11])],
  ['Remove 3 from each pan: 2x = 8.',lbl(230,25,'remove 3 blocks from each pan → 2x = 8','fill="'+OR+'"')],
  ['Halve both: x = 4.',lbl(230,295,'2x + 3 = 11 → 2x = 8 → x = 4','font-size="15" font-weight="700"')]]},
 seeNote:'Same to both pans keeps the balance.',
 do:{title:'Real balance',mat:'Pan balance, closed boxes with equal hidden coins, loose coins',steps:['Balance 2 boxes + 3 coins against 11 coins.','Remove 3 coins from each side.'],obs:'2 boxes balance 8 coins.',why:'Balance model.',lab:true},
 memo:'"Fair to both pans."',
 miscon:['"Subtract only from the side with x." Both sides must change.'],
 terms:['Balance','Left-hand side (LHS)','Right-hand side (RHS)'],
 q:{q:'In 4x + 1 = 13, after removing 1 from both sides:',o:['4x = 14','4x = 12','x = 13','4x = 1'],a:1,why:'13 − 1.'},
 exam:'Balance model: 2 marks.'},

{id:'u3',num:'7.3',title:'Solving by doing the same to both sides',
 intro:'Is there a rule that solves x − 7 = 12 and 5x = 35 alike?',
 obj:'Solve one-step equations using inverse operations on both sides.',
 prior:'7.2.',
 simple:'Use the inverse (opposite) operation on both sides to get x alone. x + 7 = 12 → subtract 7: x = 5. x − 7 = 12 → add 7: x = 19. 5x = 35 → divide by 5: x = 7. x ÷ 4 = 6 → multiply by 4: x = 24.',
 detail:'Inverse pairs: + and −; × and ÷. "Transposing" (moving a term to the other side and changing its sign) is a shortcut for the same thing: x + 7 = 12 → x = 12 − 7. Negative and fraction answers are fine: x + 9 = 4 → x = −5; 2x = 7 → x = 3.5.',
 real:'"After spending ₹45, I have ₹80 left. How much did I start with?" x − 45 = 80 → x = 125.',
 apply:'Solve: x − 13 = 29; 8x = 56; x/5 = 9.',
 see:{w:520,h:220,f:[
  ['x + 7 = 12 → − 7 both sides → x = 5',lbl(260,40,'x + 7 = 12   →  (−7)  →  x = 5','font-size="17"')],
  ['5x = 35 → ÷ 5 both sides → x = 7',lbl(260,100,'5x = 35   →  (÷5)  →  x = 7','font-size="17"')],
  ['x ÷ 4 = 6 → × 4 both sides → x = 24',lbl(260,160,'x ÷ 4 = 6   →  (×4)  →  x = 24','font-size="17"')]]},
 seeNote:'Use the inverse operation.',
 do:{title:'Inverse cards',mat:'Operation cards',steps:['Match each operation with its inverse.','Solve 6 one-step equations.'],obs:'Pairs: +/−, ×/÷.',why:'Undoing.',lab:false},
 memo:'"Undo it on both sides."',
 miscon:['"x − 7 = 12 so x = 5." Add 7: x = 19.'],
 terms:['Inverse operation','Transpose','One-step equation'],
 q:{q:'Solve 6x = 42:',o:['36','7','48','252'],a:1,why:'÷ 6.'},
 exam:'One-step equations: 1 mark each.'},

{id:'u4',num:'7.4',title:'Two-step equations',
 intro:'3x + 5 = 26 needs two moves. Which first?',
 obj:'Solve equations needing two steps, and with x on both sides.',
 prior:'7.3.',
 simple:'First undo addition or subtraction, then multiplication or division. 3x + 5 = 26 → subtract 5: 3x = 21 → divide by 3: x = 7. 4x − 3 = 17 → add 3: 4x = 20 → x = 5. (x/2) + 4 = 10 → x/2 = 6 → x = 12.',
 detail:'x on both sides: 5x + 2 = 3x + 10 → subtract 3x from both: 2x + 2 = 10 → 2x = 8 → x = 4. Brackets: 2(x + 3) = 18 → x + 3 = 9 → x = 6 (or expand: 2x + 6 = 18).',
 real:'A taxi charges ₹50 plus ₹12 per km; the fare was ₹206: 12x + 50 = 206 → x = 13 km.',
 apply:'Solve 7x − 4 = 3x + 20.',
 see:{w:520,h:220,f:[
  ['3x + 5 = 26',lbl(260,40,'3x + 5 = 26','font-size="20"')],
  ['− 5: 3x = 21',lbl(260,95,'(−5)   3x = 21','font-size="20"')],
  ['÷ 3: x = 7',lbl(260,150,'(÷3)   x = 7','font-size="22" font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Add/subtract first, then ×/÷.',
 do:{title:'Step race',mat:'Equation cards',steps:['Solve in pairs, writing each step.'],obs:'Same order works.',why:'Reverse of BODMAS.',lab:true},
 memo:'"Peel the outside first."',
 miscon:['"Divide first in 3x + 5 = 26: x + 5 = 26/3." Undo + 5 first.'],
 terms:['Two-step equation','Variables on both sides','Brackets'],
 q:{q:'Solve 2x − 1 = 9:',o:['4','5','10','3'],a:1,why:'2x = 10.'},
 exam:'Two-step equations: 2 marks.'},

{id:'u5',num:'7.5',title:'Forming equations from word problems',
 intro:'Riya\'s father is 4 years more than 3 times her age. He is 40. How old is Riya?',
 obj:'Translate word problems into equations and solve them.',
 prior:'7.1–7.4.',
 simple:'Steps: (1) choose a letter for the unknown and say what it means; (2) translate words into an equation; (3) solve; (4) answer in words with units. Riya: let her age be x years. 3x + 4 = 40 → 3x = 36 → x = 12. Riya is 12 years old.',
 detail:'Key phrases: "more than" → +, "less than" → −, "times" → ×, "is" → =. Careful: "5 less than x" is x − 5, not 5 − x. Perimeter: a rectangle with length 3 cm more than breadth b and perimeter 34 cm: 2(b + 3 + b) = 34 → 4b + 6 = 34 → b = 7 cm.',
 real:'Sharing: ₹500 split so that A gets ₹60 more than B: x + (x + 60) = 500 → x = 220.',
 apply:'The sum of three consecutive numbers is 72. Find them.',
 see:{w:520,h:220,f:[
  ['Let Riya\'s age be x.',lbl(260,40,'Let Riya\'s age = x years','font-size="17"')],
  ['3x + 4 = 40',lbl(260,95,'father: 3x + 4 = 40','font-size="17"')],
  ['x = 12: Riya is 12.',lbl(260,150,'3x = 36 → x = 12','font-size="20" font-weight="700" fill="'+GN+'"')+lbl(260,185,'Riya is 12 years old.')]]},
 seeNote:'Let, translate, solve, answer.',
 do:{title:'Write your own',mat:'Notebook',steps:['Write a word problem about your family\'s ages.','Swap and solve.'],obs:'Equations from stories.',why:'Translation skill.',lab:false},
 memo:'"Let – Link – Lose the extras – Language answer."',
 miscon:['"5 less than x = 5 − x." It is x − 5.'],
 terms:['Word problem','Translate','Consecutive numbers'],
 q:{q:'"7 more than twice a number is 31." Equation:',o:['7x + 2 = 31','2x + 7 = 31','2(x + 7) = 31','2x − 7 = 31'],a:1,why:'Twice, then add 7.'},
 exam:'Form and solve from word problem: 3 marks.'},

{id:'u6',num:'7.6',title:'Checking solutions',
 intro:'You got x = 6 for 4x − 5 = 17. How can you be sure?',
 obj:'Check solutions by substitution and spot errors.',
 prior:'7.3–7.5.',
 simple:'Substitute your answer back into the original equation: 4 × 6 − 5 = 19, not 17, so x = 6 is wrong. Correct: 4x = 22 → x = 5.5; check 4 × 5.5 − 5 = 22 − 5 = 17 ✓.',
 detail:'Also check the answer makes sense in the story: an age can\'t be negative; a number of people must be a whole number. If the equation gives x = 12.5 people, recheck the equation. Common errors: sign mistakes when transposing; dividing only one term.',
 real:'Accountants verify totals by substituting back — the habit of checking saves money.',
 apply:'Check whether x = 3 solves 5x + 4 = 2x + 13.',
 see:{w:520,h:200,f:[
  ['Claim: x = 6 for 4x − 5 = 17.',lbl(260,40,'4x − 5 = 17;  try x = 6','font-size="18"')],
  ['4 × 6 − 5 = 19 ≠ 17 ✗',lbl(260,95,'4 × 6 − 5 = 19 ≠ 17 ✗','font-size="18" fill="'+OR+'"')],
  ['x = 5.5: 22 − 5 = 17 ✓',lbl(260,150,'x = 5.5:  22 − 5 = 17 ✓','font-size="18" font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Substitute and compare.',
 do:{title:'Error hunt',mat:'Worked solutions with mistakes',steps:['Check each by substitution.','Find and fix the error.'],obs:'Sign errors are common.',why:'Checking.',lab:false},
 memo:'"Plug it back, see it balance."',
 miscon:['"If it looks right, it is right." Always substitute.'],
 terms:['Substitution','Verification','Sensible answer'],
 q:{q:'Is x = 4 a solution of 3x − 2 = 10?',o:['Yes','No'],a:0,why:'12 − 2 = 10.'},
 exam:'Verify solution: 1 mark.'}
];

const CARDS=[['Equation','Two expressions joined by "=".'],['Solution','Value that makes it true.'],['Balance','Same to both sides.'],['Inverse','+ ↔ −, × ↔ ÷.'],['One-step','Undo the single operation.'],['Two-step','Undo + or − first, then × or ÷.'],['x both sides','Bring x terms together first.'],['Word problems','Let, translate, solve, answer.'],['Careful','"5 less than x" = x − 5.'],['Check','Substitute back.']];

const Q=[
 {lv:1,q:'x + 8 = 15, x =',o:['23','7','8','15'],a:1,w:'15 − 8.'},
 {lv:1,q:'x/3 = 5, x =',o:['15','8','2','5/3'],a:0,w:'× 3.'},
 {lv:1,q:'Which is an equation?',o:['3x + 2','3x + 2 = 11','3x','x > 2'],a:1,w:'Has =.'},
 {lv:2,q:'3x + 4 = 19, x =',o:['5','23/3','15','7'],a:0,w:'3x = 15.'},
 {lv:2,q:'5x − 6 = 24, x =',o:['6','3.6','30','4'],a:0,w:'5x = 30.'},
 {lv:2,q:'2(x + 4) = 20, x =',o:['6','8','12','10'],a:0,w:'x + 4 = 10.'},
 {lv:3,q:'6x + 3 = 2x + 23, x =',o:['5','6.5','4','20'],a:0,w:'4x = 20.'},
 {lv:3,q:'"A number decreased by 9 is 17":',o:['9 − x = 17','x − 9 = 17','x + 9 = 17','9x = 17'],a:1,w:'Decreased by.'},
 {lv:4,q:'Three consecutive numbers sum to 51. The smallest:',o:['16','17','15','18'],a:0,w:'3x + 3 = 51.'},
 {lv:4,q:'Perimeter of a square is 48 cm. Side:',o:['12 cm','24 cm','16 cm','4 cm'],a:0,w:'4s = 48.'},
 {lv:5,open:true,m:3,q:'Riya\'s father\'s age is 4 more than three times Riya\'s age. He is 40. Form an equation and find Riya\'s age; check.',ans:['Let age = x; 3x + 4 = 40 (1)','3x = 36, x = 12 (1)','Check: 3 × 12 + 4 = 40 ✓; Riya is 12 (1)']},
 {lv:5,open:true,m:3,q:'A taxi charges ₹50 plus ₹12 per km. A ride cost ₹206. How long was it?',ans:['12x + 50 = 206 (1)','12x = 156 (1)','x = 13 km (1)']}
];

const ONEMIN=['Puzzles: letter for the unknown.','Equation = balance.','Same operation on both sides.','Two-step: undo + / − first.','Word problems: let, translate, solve, answer.','Check by substitution.'];
const KEYS=[['equation',/equation/i],['balance',/balance|both sides/i],['inverse',/inverse|undo/i],['two-step',/two-step|first/i],['word problem',/word|let /i],['check',/check|substitut/i]];

/* ---------- lab ---------- */
let L=[2,3],R=[0,11],start=null,moves=0,hist=[];
const eq=()=>{const side=([b,o])=>(b?(b===1?'x':b+'x'):'')+(b&&o?' + ':'')+(o||!b?o:'');return `${side(L)} = ${side(R)}`};
function newEq(){do{newEq0()}while(R[1]>20||L[1]>20)}
function newEq0(){const x=Math.floor(Math.random()*6)+1;const a=Math.floor(Math.random()*3)+1;const twoSide=Math.random()<.35;let b=Math.floor(Math.random()*5);
 if(twoSide){const c=a+Math.floor(Math.random()*2)+1;const d=Math.floor(Math.random()*4);L=[c,d];R=[c-a,d+a*x]}else{L=[a+1,b];R=[0,(a+1)*x+b]}start={L:[...L],R:[...R],x};moves=0;hist=[]}
newEq();L=[2,3];R=[0,11];start={L:[2,3],R:[0,11],x:4};
function draw(){$('#bSvg').innerHTML=scale(L,R);$('#bEq').innerHTML=eq();
 if(L[0]===1&&L[1]===0&&R[0]===0){$('#bOut').innerHTML=`<p class="fb ok">Solved in ${moves} move${moves===1?'':'s'}: <b>x = ${R[1]}</b>. Check: ${start.L[0]} × ${R[1]}${start.L[1]?' + '+start.L[1]:''} = ${start.L[0]*R[1]+start.L[1]} and ${start.R[0]?start.R[0]+' × '+R[1]+' + ':''}${start.R[1]} = ${start.R[0]*R[1]+start.R[1]} ✓</p>`}
 else if(!hist.length)$('#bOut').innerHTML='<p>Make a move. Tip: remove the extra blocks or boxes first, then divide.</p>'}
function labShow(){draw()}
function labInit(){}
function labClick(b){
 if(b.id==='bM1'){if(L[1]>0&&R[1]>0){L[1]--;R[1]--;moves++;hist.push('−1');$('#bOut').innerHTML='<p>Removed one block from each pan — still balanced.</p>'}else $('#bOut').innerHTML='<p class="fb no">One pan has no blocks left to remove.</p>';draw();return true}
 if(b.id==='bMx'){if(L[0]>0&&R[0]>0){L[0]--;R[0]--;moves++;hist.push('−x');$('#bOut').innerHTML='<p>Removed one box from each pan — still balanced.</p>'}else $('#bOut').innerHTML='<p class="fb no">Only one pan has boxes. Remove blocks, then divide.</p>';draw();return true}
 if(b.id==='bDiv'){const n=L[0];if(R[0]===0&&L[1]===0&&n>1){if(R[1]%n===0){L=[1,0];R=[0,R[1]/n];moves++;hist.push('÷');}else $('#bOut').innerHTML='<p class="fb no">The blocks don\'t share equally.</p>'}else $('#bOut').innerHTML='<p class="fb no">First get only boxes on one side and only blocks on the other.</p>';draw();return true}
 if(b.id==='bNew'){newEq();draw();return true}
 if(b.id==='bRe'){L=[...start.L];R=[...start.R];moves=0;hist=[];draw();return true}return false}
function labChange(){return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
