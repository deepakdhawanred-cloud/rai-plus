/* Rai Plus content pack: Class 6 Mathematics (Ganita Prakash), Chapter 1 – Patterns in Mathematics. */
RP.register({key:'6mat01',cls:'6',subject:'Mathematics',ch:'1',title:"Patterns in Mathematics",color:'#b04a1f',
crumb:"Class 6 Mathematics · Ganita Prakash",h1:"Chapter 1: Patterns in Mathematics",sub:"Number sequences, seeing them as pictures, how they connect, and patterns in shapes.",heroLabel:"Triangular and square dot patterns",labName:'Sequence lab',
theme:"\n:root{--g:light-dark(#b04a1f,#f2a77f);--g2:light-dark(#fbefe9,#21110a);--line:light-dark(#f0d6c9,#4a2a1c);--bg:light-dark(#ffffff,#130a06);--card:light-dark(#ffffff,#1b0f09);\n--ink:light-dark(#24120a,#f6e7df);--mute:light-dark(#6e5043,#cfb1a3);--y:light-dark(#1f5f8b,#8fc2e6);--y2:light-dark(#e6f0f8,#0c1a26);--hd:#8a3612}\n",
labHTML:`  <h2>Sequence lab</h2>
  <p>Choose a sequence and move the slider to see each term as a picture.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="qSvg" viewBox="0 0 460 300" role="img" aria-label="Sequence picture" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Sequence<select id="qSeq"><option value="odd">Odd numbers</option><option value="tri">Triangular numbers</option><option value="sq">Square numbers</option><option value="cube">Cube numbers</option><option value="pow2">Powers of 2</option><option value="vir">Virahānka numbers</option><option value="oddsum">Adding odd numbers</option></select></label></div><div class="ctrl"><label>Term number n: <b id="qNv"></b><input type="range" id="qN" class="qS" min="1" max="8" value="4"></label></div><div class="box y" id="qOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#b04a1f',LABNAME='Sequence lab',MIND_CENTER='Patterns';
const OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const dot=(x,y,c=OR,r=6)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const triPic=(x0,y0,n,g=14,c=OR)=>{let s='';for(let r=0;r<n;r++)for(let k=0;k<=r;k++)s+=dot(x0+(k-r/2)*g,y0+r*g*0.87,c,g*0.38);return s};
const sqPic=(x0,y0,n,g=14,c=BL)=>{let s='';for(let r=0;r<n;r++)for(let k=0;k<n;k++)s+=dot(x0+k*g,y0+r*g,c,g*0.38);return s};
function heroDraw(){return triPic(80,30,4,16,'#fff')+sqPic(180,30,4,16,'#fff')}
const HERO=heroDraw;
const MIND=[['What is maths?',100,50],['Number sequences',420,50],['Pictures of sequences',90,150],['Relations',430,150],['Shape sequences',110,250],['Look for the rule',410,250]];

const C=[
{id:'m1',num:'1.1',title:'What is mathematics?',
 intro:'Why does a sunflower have its seeds arranged in spirals? Why do the days repeat in a week?',
 obj:'See mathematics as the search for patterns and their explanations.',
 prior:'Counting and numbers from earlier classes.',
 simple:'Mathematics is, in large part, the search for patterns and for the reasons why those patterns exist. Patterns are everywhere: in numbers, shapes, nature, art, music and in the motion of the Sun, Moon and stars. Finding and explaining patterns helps us predict, build and understand.',
 detail:'Ancient Indian mathematicians studied patterns in poetry rhythms, in calendars and in astronomy. Today patterns in data help in weather forecasts, cricket analysis and building bridges. Throughout this book, you will be asked to find a pattern, describe it, and explain why it works.',
 real:'Calendar patterns: if 1 December is a Tuesday, then 8, 15, 22 and 29 December are Tuesdays too.',
 apply:'Find a pattern on a calendar page and explain why it works.',
 see:{w:520,h:200,f:[
  ['Patterns in numbers.',lbl(130,60,'1, 3, 5, 7, 9, …','font-size="18" font-weight="700"')],
  ['Patterns in shapes.',triPic(360,40,4,16)],
  ['Patterns in nature and time.',lbl(260,170,'days of the week · Moon phases · petals')]]},
 seeNote:'Find the pattern, then ask why.',
 do:{title:'Calendar hunt',mat:'This month\'s calendar',steps:['Pick a 3 × 3 square of dates.','Add the corners; compare with 4 × centre.'],obs:'Equal!',why:'Each corner is centre ± 8 or ± 6.',lab:false},
 memo:'"Spot it, say it, explain it."',
 miscon:['"Maths is only calculation." It is mainly about patterns and reasoning.'],
 terms:['Pattern','Sequence','Rule','Explanation'],
 q:{q:'Mathematics is largely about:',o:['only adding','finding patterns and explaining them','memorising tables only','drawing'],a:1,why:'NCERT definition.'},
 exam:'Give one pattern from daily life: 1 mark.'},

{id:'m2',num:'1.2',title:'Number sequences',
 intro:'1, 4, 9, 16, … What comes next, and why?',
 obj:'Recognise and extend important number sequences.',
 prior:'Multiplication.',
 simple:'A sequence is a list of numbers in order following a rule. Important ones: all 1s (1, 1, 1, …); counting numbers (1, 2, 3, …); odd numbers (1, 3, 5, …); even numbers (2, 4, 6, …); triangular numbers (1, 3, 6, 10, 15, …); squares (1, 4, 9, 16, 25, …); cubes (1, 8, 27, 64, 125, …); Virahānka numbers (1, 2, 3, 5, 8, 13, …); powers of 2 (1, 2, 4, 8, 16, …); powers of 3 (1, 3, 9, 27, 81, …).',
 detail:'Rules: triangular numbers add 2, then 3, then 4…; squares are n × n; cubes are n × n × n; Virahānka numbers: each is the sum of the previous two (found by Virahānka about 1300 years ago while studying poetry rhythms; later also called Fibonacci numbers); powers of 2 double each time.',
 real:'Doubling: one grain of rice on the first square of a chessboard, two on the next, four on the next… becomes enormous.',
 apply:'Write the next three terms of 1, 2, 3, 5, 8, 13, …',
 see:{w:520,h:220,f:[
  ['Squares: 1, 4, 9, 16, 25.',lbl(260,40,'1, 4, 9, 16, 25, …','font-size="16"')],
  ['Triangular: 1, 3, 6, 10, 15.',lbl(260,90,'1, 3, 6, 10, 15, …','font-size="16"')],
  ['Virahānka: add the previous two.',lbl(260,140,'1, 2, 3, 5, 8, 13, 21, …','font-size="16"')+lbl(260,180,'Powers of 2: 1, 2, 4, 8, 16, 32, …','font-size="16"')]]},
 seeNote:'Each sequence has a rule.',
 do:{title:'Sequence detective',mat:'Notebook',steps:['Write the first 8 terms of each sequence above.','Write the rule in words.'],obs:'Each has a clear rule.',why:'Patterns.',lab:true},
 memo:'"Odd +2, triangle +1 more each time, square n×n, cube n×n×n, Virahānka add two, powers double."',
 miscon:['"1, 2, 4, … must continue 8." It depends on the rule; always state it.'],
 terms:['Sequence','Term','Triangular number','Square number','Cube number','Virahānka number'],
 q:{q:'Next term of 1, 3, 6, 10, 15, …:',o:['18','20','21','25'],a:2,why:'Add 6.'},
 exam:'Next terms of standard sequences: 2 marks.'},

{id:'m3',num:'1.3',title:'Visualising number sequences',
 intro:'Why are 1, 4, 9, 16 called square numbers?',
 obj:'Draw sequences as dot pictures and explain their names.',
 prior:'Number sequences (1.2).',
 simple:'Many sequences can be drawn with dots. Square numbers make squares of dots (1, 2×2, 3×3, …). Triangular numbers make triangles of dots (1; 1+2; 1+2+3; …). Cube numbers make cubes of small blocks. Powers of 2 can be drawn by repeatedly doubling a shape.',
 detail:'Pictures help explain rules: to go from one triangle to the next, add a new row with one more dot; to go from one square to the next, add an L-shaped border (an odd number of dots). This is why "seeing" a sequence often shows WHY a pattern is true.',
 real:'Bowling pins (1, 2, 3, 4 = 10) form a triangular number.',
 apply:'Draw the 5th triangular number. How many dots?',
 see:{w:520,h:220,f:[
  ['Triangular numbers.',triPic(60,40,1)+triPic(110,40,2)+triPic(170,40,3)+triPic(240,40,4)+lbl(150,140,'1, 3, 6, 10')],
  ['Square numbers.',sqPic(330,40,1)+sqPic(355,40,2)+sqPic(395,40,3)],
  ['Each step adds a row or an L-border.',lbl(370,140,'1, 4, 9')+lbl(260,200,'see the rule in the picture','font-weight="700"')]]},
 seeNote:'Pictures explain names.',
 do:{title:'Bead squares',mat:'Beads, buttons or bottle caps',steps:['Make squares of 1, 4, 9, 16.','Count the extra beads added each time.'],obs:'3, 5, 7: odd numbers.',why:'L-border.',lab:true},
 memo:'"Triangles grow by rows, squares by L-borders."',
 miscon:['"Square numbers are numbers with four sides." They make square dot arrays.'],
 terms:['Visualise','Dot pattern','Array'],
 q:{q:'The 4th triangular number is:',o:['6','8','10','16'],a:2,why:'1+2+3+4.'},
 exam:'Draw the first four square numbers: 2 marks.'},

{id:'m4',num:'1.4',title:'Relations among number sequences',
 intro:'Add 1 + 3 + 5 + 7. Now 1 + 3 + 5 + 7 + 9. Notice anything?',
 obj:'Discover and explain relations among sequences.',
 prior:'Visualising (1.3).',
 simple:'Adding odd numbers from 1 always gives a square number: 1 = 1, 1+3 = 4, 1+3+5 = 9, 1+3+5+7 = 16. So the sum of the first n odd numbers is n × n. Adding two consecutive triangular numbers gives a square number: 1+3 = 4, 3+6 = 9, 6+10 = 16.',
 detail:'More: 1 + 2 + 3 + … + n + … + 3 + 2 + 1 (up and down) = n × n. Adding powers of 2: 1+2 = 3, 1+2+4 = 7, 1+2+4+8 = 15: one less than the next power of 2. Pictures prove these: odd numbers are L-borders that build a square; two triangles fit together into a square.',
 real:'The sum 1 + 3 + 5 + … + 99 is 50 × 50 = 2500, found in seconds.',
 apply:'Find 1 + 3 + 5 + … + 19 without adding one by one.',
 see:{w:520,h:220,f:[
  ['1 (one dot).',dot(60,60,OR,7)],
  ['+3 (an L-border).',[[1,0],[0,1],[1,1]].map(p=>dot(60+p[0]*20,60+p[1]*20,BL,7)).join('')],
  ['+5, +7: a 4 × 4 square.',[[2,0],[2,1],[0,2],[1,2],[2,2]].map(p=>dot(60+p[0]*20,60+p[1]*20,GN,7)).join('')+[[3,0],[3,1],[3,2],[0,3],[1,3],[2,3],[3,3]].map(p=>dot(60+p[0]*20,60+p[1]*20,PU,7)).join('')+lbl(330,110,'1+3+5+7 = 16 = 4×4','font-size="16" font-weight="700"')]]},
 seeNote:'Sum of first n odd numbers = n × n.',
 do:{title:'Prove with beads',mat:'Beads of 4 colours',steps:['Lay 1, then 3, 5, 7 in L-shapes of different colours.','See the square.'],obs:'4 × 4.',why:'Each L adds the next odd number.',lab:true},
 memo:'"Odd numbers stack into squares."',
 miscon:['"Patterns seen in a few cases are always true." Explain why (proof).'],
 terms:['Sum','Relation','Proof'],
 q:{q:'1 + 3 + 5 + 7 + 9 + 11 = ?',o:['30','36','42','49'],a:1,why:'6 × 6.'},
 exam:'Explain why sum of odd numbers is square: 3 marks.'},

{id:'m5',num:'1.5',title:'Patterns in shapes',
 intro:'Triangle, square, pentagon, hexagon… how many sides next?',
 obj:'Recognise shape sequences and connect them with number sequences.',
 prior:'Sequences (1.2–1.4).',
 simple:'Shapes also form sequences. Regular polygons: triangle (3 sides), square (4), pentagon (5), hexagon (6), heptagon (7), octagon (8), nonagon (9), decagon (10): the number of sides gives the counting numbers from 3. Complete graphs: join every pair of dots; the number of lines gives triangular numbers 0, 1, 3, 6, 10. Stacked squares give square numbers; stacked triangles give square numbers too (1, 4, 9, 16).',
 detail:'Koch snowflake: start with a triangle, replace the middle third of each side with a smaller triangle bump; repeat. The number of sides goes 3, 12, 48, 192: multiply by 4 each time. Shape sequences are found in rangoli, tiles and art.',
 real:'Rangoli and tile designs often grow by repeating a shape pattern.',
 apply:'How many lines in a complete graph with 5 dots?',
 see:{w:520,h:220,f:[
  ['Regular polygons: 3, 4, 5, 6 sides…',[3,4,5,6].map((n,j)=>{const cx=60+j*70,cy=70,r=26;return `<polygon points="${[...Array(n)].map((_,k)=>{const a=-Math.PI/2+k*2*Math.PI/n;return (cx+r*Math.cos(a)).toFixed(1)+','+(cy+r*Math.sin(a)).toFixed(1)}).join(' ')}" fill="none" stroke="${OR}" stroke-width="2"/>`}).join('')],
  ['Complete graphs: lines 1, 3, 6.',[2,3,4].map((n,j)=>{const cx=110+j*120,cy=165,r=28;const P=[...Array(n)].map((_,k)=>{const a=-Math.PI/2+k*2*Math.PI/n;return [cx+r*Math.cos(a),cy+r*Math.sin(a)]});let s='';for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)s+=`<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" stroke="${BL}"/>`;return s+P.map(p=>dot(p[0],p[1],BL,4)).join('')}).join('')],
  ['Shapes connect to number sequences.',lbl(400,70,'sides: 3, 4, 5, 6…')+lbl(470,170,'lines: 1, 3, 6…')]]},
 seeNote:'Shape sequences hide number sequences.',
 do:{title:'Handshakes',mat:'4–5 friends',steps:['Everyone shakes hands with everyone once.','Count handshakes for 2, 3, 4, 5 people.'],obs:'1, 3, 6, 10.',why:'Complete graph = triangular numbers.',lab:false},
 memo:'"Polygons count up; complete graphs make triangles."',
 miscon:['"A complete graph with 4 dots has 4 lines." It has 6.'],
 terms:['Regular polygon','Complete graph','Koch snowflake'],
 q:{q:'Lines in a complete graph with 4 dots:',o:['4','5','6','8'],a:2,why:'Triangular number.'},
 exam:'Shape sequences and their numbers: 2 marks.'}
];

const CARDS=[['Mathematics','Search for patterns and explanations.'],['Odd numbers','1, 3, 5, 7, …'],['Triangular','1, 3, 6, 10, 15, …'],['Squares','1, 4, 9, 16, 25, … (n×n)'],['Cubes','1, 8, 27, 64, 125, …'],['Virahānka','1, 2, 3, 5, 8, 13, … add previous two.'],['Powers of 2','1, 2, 4, 8, 16, … double.'],['Odd sum','1+3+…(n terms) = n×n.'],['Triangles','Two consecutive triangular numbers make a square.'],['Powers of 2 sum','1+2+4+…+2ⁿ = next power − 1.'],['Polygons','3, 4, 5, 6… sides.'],['Complete graphs','Lines: 0, 1, 3, 6, 10.']];

const Q=[
 {lv:1,q:'Next odd number after 17:',o:['18','19','21','20'],a:1,w:'+2.'},
 {lv:1,q:'5th square number:',o:['10','20','25','16'],a:2,w:'5×5.'},
 {lv:1,q:'Next in 1, 2, 4, 8, 16:',o:['24','32','20','18'],a:1,w:'Double.'},
 {lv:2,q:'Next Virahānka number after 8, 13:',o:['18','21','26','20'],a:1,w:'8+13.'},
 {lv:2,q:'3rd cube number:',o:['9','27','18','64'],a:1,w:'3×3×3.'},
 {lv:2,q:'Triangular number after 10:',o:['14','15','16','20'],a:1,w:'+5.'},
 {lv:3,q:'1 + 3 + 5 + … + 19 =',o:['81','100','90','121'],a:1,w:'10 odd numbers → 10×10.'},
 {lv:3,q:'6 + 10 (two consecutive triangular numbers) =',o:['15','16','25','36'],a:1,w:'4×4.'},
 {lv:4,q:'1 + 2 + 4 + 8 + 16 =',o:['31','32','30','33'],a:0,w:'32 − 1.'},
 {lv:4,q:'Lines in a complete graph of 6 dots:',o:['10','12','15','21'],a:2,w:'Triangular: 15.'},
 {lv:5,open:true,m:3,q:'Show with a picture why 1 + 3 + 5 + 7 = 4 × 4.',ans:['Start with 1 dot (1)','Add L-shaped borders of 3, 5, 7 dots (1)','They form a 4×4 square (1)']},
 {lv:5,open:true,m:3,q:'Write the first 8 Virahānka numbers and state the rule.',ans:['1, 2, 3, 5, 8, 13, 21, 34 (2)','Each is the sum of the two before it (1)']}
];

const ONEMIN=['Maths: search for patterns and explanations.','Key sequences: odd, triangular, square, cube, Virahānka, powers of 2/3.','Draw them with dots.','Odd numbers add to squares.','Two triangular numbers make a square.','Shape sequences: polygons, complete graphs, Koch snowflake.'];
const KEYS=[['pattern',/pattern/i],['odd',/odd/i],['triangular',/triang/i],['square',/square/i],['Virahānka',/virah|fibon/i],['powers of 2',/power|doubl/i],['sum of odd',/sum|add/i]];

/* ---------- lab ---------- */
const SEQ={odd:n=>2*n-1,tri:n=>n*(n+1)/2,sq:n=>n*n,cube:n=>n*n*n,pow2:n=>2**(n-1),vir:n=>{let a=1,b=2;if(n===1)return 1;for(let i=2;i<n;i++)[a,b]=[b,a+b];return b},oddsum:n=>n*n};
const NAMES={odd:'Odd numbers',tri:'Triangular numbers',sq:'Square numbers',cube:'Cube numbers',pow2:'Powers of 2',vir:'Virahānka numbers',oddsum:'1 + 3 + 5 + … (n odd numbers)'};
let sq='odd',n=4;
function pic(){const cx=230;let s='';
 if(sq==='odd'){const v=2*n-1;const g=Math.min(24,260/n);for(let i=0;i<n;i++)s+=dot(80+(n-1)*g,60+i*g,OR,g*0.36);for(let i=0;i<n-1;i++)s+=dot(80+i*g,60+(n-1)*g,OR,g*0.36)}
 else if(sq==='tri'){s=triPic(cx,40,n,Math.min(26,200/n))}
 else if(sq==='sq'){const g=Math.min(26,200/n);s=sqPic(cx-(n-1)*g/2,40,n,g)}
 else if(sq==='cube'){const g=Math.min(22,120/n);for(let z=n-1;z>=0;z--)for(let y=0;y<n;y++)for(let x=0;x<n;x++){const px=150+x*g+z*g*0.5,py=60+y*g-z*g*0.5+n*g*0.5;s+=`<rect x="${px}" y="${py}" width="${g-2}" height="${g-2}" fill="${PU}" opacity="${0.35+0.08*z}" stroke="#fff" stroke-width=".5"/>`}}
 else if(sq==='pow2'){const v=2**(n-1),cols=Math.ceil(Math.sqrt(v)),g=Math.min(24,220/cols);for(let i=0;i<v;i++)s+=dot(cx-(cols-1)*g/2+(i%cols)*g,40+Math.floor(i/cols)*g,BL,g*0.36)}
 else if(sq==='vir'){const v=SEQ.vir(n);let x=60;const W=Math.min(18,300/v);let left=v;const lay=[];
  // show as rhythms of short (1) and long (2) beats: one pattern of length n
  let pat=[];let k=n;while(k>0){if(k>=2&&(k%3===2||k===2)){pat.push(2);k-=2}else{pat.push(1);k-=1}}let px=60;pat.forEach(b=>{s+=`<rect x="${px}" y="120" width="${b*34-4}" height="40" rx="6" fill="${b===2?OR:BL}"/>`;px+=b*34});s+=lbl(230,200,`One of the ${v} rhythms of total length ${n} (short = 1 beat, long = 2 beats)`,'font-size="12"')}
 else if(sq==='oddsum'){const g=Math.min(26,200/n);const cols=[OR,BL,GN,PU];for(let r=0;r<n;r++)for(let c=0;c<n;c++){const L=Math.max(r,c);s+=dot(cx-(n-1)*g/2+c*g,40+r*g,cols[L%4],g*0.38)}}
 return s}
function draw(){const f=SEQ[sq];const terms=[...Array(8)].map((_,i)=>f(i+1));let s=pic();
 s+=T(230,270,terms.map((t,i)=>i+1===n?`[${t}]`:t).join(', ')+', …','font-size="14" font-weight="700"');
 $('#qSvg').innerHTML=s;$('#qNv').textContent=n;
 const v=f(n);let h=`<p><b>${NAMES[sq]}</b>: term ${n} = <b>${v}</b></p>`;
 const R={odd:`Rule: 2 × ${n} − 1. Each L-shape adds 2.`,tri:`Rule: 1 + 2 + … + ${n}. Add a new row of ${n} dots.`,sq:`Rule: ${n} × ${n}.`,cube:`Rule: ${n} × ${n} × ${n}.`,pow2:`Rule: double the previous term.`,vir:`Rule: add the two previous terms. Virahānka counted rhythms made of short (1-beat) and long (2-beat) syllables.`,oddsum:`1 + 3 + … + ${2*n-1} = ${n} × ${n} = ${n*n}. Each colour is one odd number (an L-border).`};
 $('#qOut').innerHTML=h+`<p>${R[sq]}</p>`}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='qN')labChange(e.target)})}
function labClick(){return false}
function labChange(t){if(t.id==='qN'){n=+t.value;draw();return true}if(t.id==='qSeq'){sq=t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
