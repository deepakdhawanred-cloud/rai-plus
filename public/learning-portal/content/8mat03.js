/* Rai Plus content pack: Class 8 Mathematics (Ganita Prakash), Chapter 3 – A Story of Numbers. */
RP.register({key:'8mat03',cls:'8',subject:'Mathematics',ch:'3',title:"A Story of Numbers",color:'#a0522d',
crumb:"Class 8 Mathematics · Ganita Prakash",h1:"Chapter 3: A Story of Numbers",sub:"From matching sticks to cows, to Roman numerals, Egyptian symbols, the idea of a base, Mesopotamian base-60, Mayan base-20 and Chinese rods — and the Indian place-value system with zero.",heroLabel:"Numerals from different civilisations",labName:'Number systems converter',
theme:"\n:root{--g:light-dark(#a0522d,#f0b28e);--g2:light-dark(#fbf0ea,#1d0f08);--line:light-dark(#efd5c6,#46291b);--bg:light-dark(#ffffff,#120a06);--card:light-dark(#ffffff,#1b100a);\n--ink:light-dark(#2b150a,#f6e7de);--mute:light-dark(#6d4f40,#d0b3a3);--y:light-dark(#1f5f8b,#8fc2e6);--y2:light-dark(#e8f1f8,#0b1622);--hd:#7f3f20}\n",
labHTML:`  <h2>Number systems converter</h2>
  <p>Type a number (1 to 3999). See it written the Roman way, with Egyptian-style symbols, in Mayan base-20 dots and bars, as Mesopotamian base-60 "digits", and in base 2. Then try the quiz.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="nSvg" viewBox="0 0 460 320" role="img" aria-label="Number in many systems" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Number<input id="nN" type="number" value="1729" min="1" max="3999" style="width:6em"></label> <button class="btn" id="nGo">Convert</button></div>
  <div class="ctrl"><button class="btn" id="nQ">Roman quiz</button> <input id="nAns" type="text" style="width:7em"> <button class="btn" id="nC">Check</button></div>
  <div class="box y" id="nOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#a0522d',LABNAME='Number systems converter',MIND_CENTER='Number systems';
const BR='#a0522d',BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
function roman(n){const V=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let s='';for(const [v,r] of V)while(n>=v){s+=r;n-=v}return s}
function fromRoman(s){const m={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};s=s.toUpperCase().trim();if(!/^[IVXLCDM]+$/.test(s))return NaN;let t=0;for(let i=0;i<s.length;i++){const a=m[s[i]],b=m[s[i+1]]||0;t+=a<b?-a:a}return t}
/* simplified Egyptian-style glyphs */
const EG=[(x,y,c)=>`<line x1="${x}" y1="${y-14}" x2="${x}" y2="${y+6}" stroke="${c}" stroke-width="2.5"/>`,(x,y,c)=>`<path d="M${x-6} ${y+6} V${y-6} Q${x} ${y-16} ${x+6} ${y-6} V${y+6}" fill="none" stroke="${c}" stroke-width="2.5"/>`,(x,y,c)=>`<path d="M${x} ${y+6} V${y-4} a6 6 0 1 1 6 -6" fill="none" stroke="${c}" stroke-width="2.5"/>`,(x,y,c)=>`<path d="M${x} ${y+6} V${y-8} M${x-6} ${y-8} Q${x} ${y-20} ${x+6} ${y-8}" fill="none" stroke="${c}" stroke-width="2.5"/>`];
const EGN=['stroke (1)','heel bone (10)','coil of rope (100)','lotus (1000)'];
function egypt(n,x0,y,maxW=440){let s='',x=x0;const d=[Math.floor(n/1000)%10,Math.floor(n/100)%10,Math.floor(n/10)%10,n%10];const C=[PU,GN,BL,OR];[3,2,1,0].forEach((p,j)=>{for(let k=0;k<d[j];k++){if(x>x0+maxW){x=x0;y+=26}s+=EG[p](x,y,C[j]);x+=13}x+=6});return s}
function mayanDigit(v,x,y){let s='';const bars=Math.floor(v/5),dots=v%5;for(let b=0;b<bars;b++)s+=`<rect x="${x-16}" y="${y-b*8}" width="32" height="5" rx="2" fill="${BR}"/>`;for(let d=0;d<dots;d++)s+=`<circle cx="${x-12+d*8}" cy="${y-bars*8-4}" r="3" fill="${BR}"/>`;if(v===0)s+=`<ellipse cx="${x}" cy="${y}" rx="12" ry="6" fill="none" stroke="${BR}" stroke-width="2"/>`;return s}
function digits(n,b){const d=[];do{d.unshift(n%b);n=Math.floor(n/b)}while(n>0);return d}
function heroDraw(){return T(110,90,'XII','font-size="30" fill="#fff" font-weight="700"')+T(200,90,'१२','font-size="30" fill="#fff"')+T(280,90,'12','font-size="30" fill="#fff" font-weight="700"')}
const HERO=heroDraw;
const MIND=[['Counting & matching',100,50],['Roman numerals',420,50],['Egyptian system',90,150],['Idea of a base',430,150],['Base-60, base-20',110,250],['Place value & zero',410,250]];

const C=[
{id:'n1',num:'3.1',title:'Counting before numerals',
 intro:'A herder has no number words. How can she check that all her cows came back in the evening?',
 obj:'Understand one-to-one matching and early counting methods.',
 prior:'Class 6–7 number sense.',
 simple:'Before writing numbers, people matched objects one-to-one: one stick (or pebble, knot, notch) for each cow. In the evening, match each returning cow with a stick; if sticks are left over, cows are missing. Tally marks, notches on bones and knotted cords were early ways to record counts. Grouping (like bundles of 5 or 10) made large counts easier.',
 detail:'Very old bones with carved notches show people kept counts tens of thousands of years ago. Matching shows whether two collections are equal without knowing the number. Grouping by a fixed size — often 10, because of fingers — was the first step towards a base.',
 real:'Tally marks in bundles of five are still used to count votes in class elections.',
 apply:'Show 23 using tally marks in groups of five.',
 see:{w:520,h:200,f:[
  ['One stick for each cow.',[...Array(7)].map((_,k)=>`<line x1="${50+k*20}" y1="60" x2="${50+k*20}" y2="110" stroke="${BR}" stroke-width="4"/>`).join('')+lbl(110,135,'7 sticks')],
  ['Match each returning cow to a stick.',[...Array(6)].map((_,k)=>`<circle cx="${50+k*20}" cy="160" r="7" fill="${GR}"/>`).join('')+lbl(110,190,'6 cows back — 1 missing!','fill="'+OR+'"')],
  ['Tally marks group in fives.',`<g stroke="${ink}" stroke-width="3">${[0,1,2,3].map(k=>`<line x1="${320+k*12}" y1="70" x2="${320+k*12}" y2="120"/>`).join('')}<line x1="312" y1="110" x2="366" y2="80"/>${[0,1].map(k=>`<line x1="${390+k*12}" y1="70" x2="${390+k*12}" y2="120"/>`).join('')}</g>`+lbl(370,150,'5 + 2 = 7')]]},
 seeNote:'Matching before counting.',
 do:{title:'Stick count',mat:'Sticks, small objects',steps:['Match each object in a pile with a stick.','Remove some objects; match again.'],obs:'Leftover sticks show missing objects.',why:'One-to-one correspondence.',lab:false},
 memo:'"One stick, one cow."',
 miscon:['"You must know numbers to compare quantities." Matching works without numbers.'],
 terms:['One-to-one matching','Tally','Grouping'],
 q:{q:'Matching each cow with one stick is called:',o:['addition','one-to-one correspondence','place value','base'],a:1,why:'Matching.'},
 exam:'Early counting methods: 2 marks.'},

{id:'n2',num:'3.2',title:'Roman numerals',
 intro:'Clock faces and book chapters still use XII and IV. How does the Roman system work?',
 obj:'Read and write Roman numerals and see the limits of the system.',
 prior:'3.1.',
 simple:'Romans used letters for landmark numbers: I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. Symbols are added: XVI = 10 + 5 + 1 = 16. A smaller symbol before a larger one is subtracted: IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900. 1729 = MDCCXXIX.',
 detail:'Rules: a symbol is not repeated more than three times (III, not IIII — though some clocks show IIII); only I, X, C are placed before a larger symbol, and only before the next two larger ones. There is no zero, and calculating (especially multiplying) is very hard — the system groups but has no place value.',
 real:'Roman numerals appear on clock faces, book volumes and in names like Queen Elizabeth II.',
 apply:'Write 2026 and 449 in Roman numerals.',
 see:{w:520,h:200,f:[
  ['Landmark symbols.',[['I',1],['V',5],['X',10],['L',50],['C',100],['D',500],['M',1000]].map(([r,v],k)=>lbl(50+k*70,50,r,'font-size="22" font-weight="700" fill="'+BR+'"')+lbl(50+k*70,75,String(v))).join('')],
  ['Add: XVI = 16.',lbl(150,135,'XVI = 10 + 5 + 1 = 16','font-size="16"')],
  ['Subtract: IX = 9, XC = 90.',lbl(380,135,'IX = 10 − 1 = 9','font-size="16" fill="'+OR+'"')+lbl(260,180,'1729 = MDCCXXIX','font-size="17" font-weight="700"')]]},
 seeNote:'Add normally; subtract when smaller comes first.',
 do:{title:'Roman clock',mat:'Paper plate',steps:['Make a clock with Roman numerals I–XII.'],obs:'IV and IX use subtraction.',why:'Roman rules.',lab:true},
 memo:'"I Value Xylophones Like Cows Do Milk" — I, V, X, L, C, D, M.',
 miscon:['"IL = 49." 49 is XLIX; I can only go before V and X.'],
 terms:['Roman numerals','Additive','Subtractive notation'],
 q:{q:'XC =',o:['110','90','190','40'],a:1,why:'100 − 10.'},
 exam:'Convert Roman ↔ Hindu-Arabic: 2 marks.'},

{id:'n3',num:'3.3',title:'The Egyptian system',
 intro:'Ancient Egyptians carved numbers on temple walls using pictures. How did they write 2,345?',
 obj:'Read and write numbers in the Egyptian system and add with it.',
 prior:'3.2.',
 simple:'Egyptians used a picture symbol for each power of 10: a stroke (1), a heel bone (10), a coil of rope (100), a lotus flower (1000), a finger (10,000), a tadpole (1,00,000) and a kneeling figure (10,00,000). Repeat each symbol as many times as needed: 2,345 = 2 lotus + 3 coils + 4 heel bones + 5 strokes. Order does not matter.',
 detail:'Addition: combine all symbols; whenever there are ten of one symbol, replace them with one of the next symbol (like carrying). Egyptians multiplied by repeated doubling and adding. The system groups by 10 but needs a new symbol for each power and many repetitions — 999 needs 27 symbols.',
 real:'Hieroglyphic numerals are found on monuments over 4,000 years old.',
 apply:'How many symbols does the Egyptian system need to write 4,321? And 999?',
 see:{w:520,h:200,f:[
  ['Symbols for 1, 10, 100, 1000.',[0,1,2,3].map(k=>EG[k](80+k*110,60,[OR,BL,GN,PU][k])+lbl(80+k*110,90,EGN[k],'font-size="11"')).join('')],
  ['2,345 drawn with symbols.',egypt(2345,60,150)],
  ['Ten of one = one of the next.',lbl(260,190,'10 strokes → 1 heel bone (carry)','font-size="13" font-weight="700"')]]},
 seeNote:'Repeat symbols; regroup tens.',
 do:{title:'Egyptian addition',mat:'Symbol cards',steps:['Add 1,256 and 2,367 with symbol cards.','Regroup every ten.'],obs:'3,623.',why:'Base-10 grouping.',lab:false},
 memo:'"Stroke, bone, coil, lotus."',
 miscon:['"Egyptian numerals use place value." Position does not matter; symbols are repeated.'],
 terms:['Hieroglyph','Base 10','Regrouping'],
 q:{q:'In the Egyptian system, 3 coils and 2 strokes is:',o:['32','302','320','3002'],a:1,why:'300 + 2.'},
 exam:'Egyptian numerals: 2 marks.'},

{id:'n4',num:'3.4',title:'The idea of a base',
 intro:'Why did the Egyptians choose 10 for their landmark numbers? Could another number work?',
 obj:'Understand base-n systems and write numbers in other bases.',
 prior:'3.3.',
 simple:'A base is the group size used to make landmark numbers: in base 10, landmarks are 1, 10, 100, 1000 (powers of 10). In base 5, landmarks are 1, 5, 25, 125. In base 2, they are 1, 2, 4, 8, 16, … Any whole number greater than 1 can be a base. 13 in base 2 = 8 + 4 + 1 = 1101₂.',
 detail:'To convert to base b, repeatedly divide by b and read remainders from bottom to top: 13 ÷ 2 = 6 r1, 6 ÷ 2 = 3 r0, 3 ÷ 2 = 1 r1, 1 ÷ 2 = 0 r1 → 1101. Base 2 (binary) is used by computers because circuits are either on (1) or off (0).',
 real:'Every photo, video and message on a phone is stored as binary 0s and 1s.',
 apply:'Write 25 in base 2 and in base 5.',
 see:{w:520,h:200,f:[
  ['Base 10 landmarks: 1, 10, 100, 1000.',lbl(260,40,'base 10: 1, 10, 100, 1000','font-size="16"')],
  ['Base 2 landmarks: 1, 2, 4, 8, 16.',lbl(260,90,'base 2: 1, 2, 4, 8, 16, …','font-size="16" fill="'+BL+'"')],
  ['13 = 8 + 4 + 1 = 1101 in base 2.',lbl(260,150,'13 = 8 + 4 + 0 + 1 = 1101₂','font-size="18" font-weight="700" fill="'+BL+'"')]]},
 seeNote:'Landmarks are powers of the base.',
 do:{title:'Binary cards',mat:'Cards showing 1, 2, 4, 8, 16 dots',steps:['Show 11 by turning cards face up.'],obs:'8 + 2 + 1 → 1011.',why:'Base 2.',lab:false},
 memo:'"Base b: landmarks 1, b, b², b³."',
 miscon:['"Base 10 is the only possible base." Any number above 1 works.'],
 terms:['Base','Landmark numbers','Binary (base 2)','Powers'],
 q:{q:'101₂ in base 10 is:',o:['101','5','3','7'],a:1,why:'4 + 0 + 1.'},
 exam:'Convert between bases: 2–3 marks.'},

{id:'n5',num:'3.5',title:'Base 60, base 20 and counting rods',
 intro:'Why are there 60 minutes in an hour and 360 degrees in a circle?',
 obj:'Describe the Mesopotamian base-60, Mayan base-20 and Chinese rod systems.',
 prior:'3.4.',
 simple:'Mesopotamians (in present-day Iraq, about 4,000 years ago) used base 60 with place value: two wedge-shaped marks for 1 and 10 built digits 1–59, and position showed powers of 60. We still use base 60 for time (60 seconds, 60 minutes) and angles. The Maya of Central America used base 20 with dots (1) and bars (5), and later a symbol for zero. The Chinese used counting rods in columns, a place-value system.',
 detail:'1729 in base 60: 1729 = 28 × 60 + 49 → digits (28)(49). Early Mesopotamian writing had no zero, so a gap could mean anything — confusing! Base 60 is handy because 60 has many factors (1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60), so fractions are easy.',
 real:'2 h 15 min = 2 × 60 + 15 = 135 minutes — a base-60 calculation.',
 apply:'Write 125 minutes in hours and minutes. Draw 13 in Mayan dots and bars.',
 see:{w:520,h:220,f:[
  ['Base 60: 1729 = 28 × 60 + 49.',lbl(130,50,'1729 = (28)(49)₆₀','font-size="17" fill="'+BL+'"')+lbl(130,80,'28 × 60 + 49','font-size="13"')],
  ['Mayan base 20: dots and bars.',mayanDigit(4,330,80)+mayanDigit(9,400,80)+lbl(365,110,'1729 = 4 × 400 + 6 × 20 + 9','font-size="11"')],
  ['60 minutes, 360 degrees.',lbl(260,175,'base-60 lives on: 60 min, 60 s, 360°','font-size="15" font-weight="700"')]]},
 seeNote:'Different bases, same numbers.',
 do:{title:'Mayan numbers',mat:'Paper',steps:['Draw 0–19 with dots and bars.'],obs:'Bars of 5, dots of 1.',why:'Base 20.',lab:false},
 memo:'"Time ticks in sixties."',
 miscon:['"Base 60 needs 60 different symbols." Mesopotamians built them from two marks.'],
 terms:['Sexagesimal (base 60)','Mayan (base 20)','Counting rods','Place value'],
 q:{q:'We use base 60 today for:',o:['money','time','weight','length'],a:1,why:'Minutes, seconds.'},
 exam:'Ancient number systems: 2–3 marks.'},

{id:'n6',num:'3.6',title:'The Indian place-value system and zero',
 intro:'With only ten symbols, how can we write any number at all, however large?',
 obj:'Explain the Indian (Hindu) place-value system and the role of zero.',
 prior:'3.1–3.5.',
 simple:'The Indian system uses ten digits 0–9, base 10 and place value: the value of a digit depends on its position. In 507, the 5 means 5 hundreds, 0 means no tens, 7 means 7 ones. Zero is both a placeholder (507 vs 57) and a number in its own right. With this, any number can be written with just ten symbols, and calculations become easy.',
 detail:'The Bakhshali manuscript uses a dot for zero; Brahmagupta (628 CE) gave rules for arithmetic with zero and negative numbers. Through Arab scholars (al-Khwarizmi) the system reached Europe as "Hindu-Arabic numerals" and, by the 17th century, replaced Roman numerals. Expanded form: 4,072 = 4 × 1000 + 0 × 100 + 7 × 10 + 2.',
 real:'Every price, phone number and computer program relies on place value and zero.',
 apply:'Write 30,605 in expanded form. Why can\'t we drop the zeros?',
 see:{w:520,h:220,f:[
  ['Ten digits.',lbl(260,40,'0 1 2 3 4 5 6 7 8 9','font-size="22" letter-spacing="4"')],
  ['Position gives value: 507.',[['5','hundreds',OR],['0','tens',GR],['7','ones',BL]].map(([d,p,c],k)=>`<rect x="${150+k*80}" y="70" width="60" height="60" rx="8" fill="${c}" fill-opacity=".15" stroke="${c}"/>`+lbl(180+k*80,110,d,'font-size="26" font-weight="700" fill="'+c+'"')+lbl(180+k*80,148,p,'font-size="11"')).join('')],
  ['Zero holds the place.',lbl(260,195,'507 ≠ 57: zero is a placeholder and a number','font-size="14" font-weight="700"')]]},
 seeNote:'Ten symbols, endless numbers.',
 do:{title:'Without zero?',mat:'Notebook',steps:['Try writing 205 and 25 without a zero.'],obs:'They look the same!',why:'Zero as placeholder.',lab:false},
 memo:'"Place gives value; zero holds the place."',
 miscon:['"Zero means nothing, so it doesn\'t matter." It changes the value of every other digit.'],
 terms:['Place value','Zero (शून्य)','Hindu-Arabic numerals','Expanded form','Brahmagupta'],
 q:{q:'Who gave rules for arithmetic with zero in 628 CE?',o:['Aryabhata','Brahmagupta','Fibonacci','Euclid'],a:1,why:'Brahmasphutasiddhanta.'},
 exam:'Importance of place value and zero: 3 marks.'}
];

const CARDS=[['Matching','One stick per object.'],['Roman','I V X L C D M; add, or subtract smaller-first.'],['No zero','Roman and Egyptian systems lack zero/place value.'],['Egyptian','Symbol per power of 10, repeated.'],['Base','Group size; landmarks are its powers.'],['Binary','Base 2: 1, 2, 4, 8…'],['Base 60','Mesopotamia; time and angles.'],['Base 20','Maya: dots (1) and bars (5).'],['Place value','Value depends on position.'],['Zero','Placeholder and number; Brahmagupta 628 CE.']];

const Q=[
 {lv:1,q:'Roman numeral for 50:',o:['V','L','C','D'],a:1,w:'L.'},
 {lv:1,q:'Base of the Mesopotamian system:',o:['10','20','60','2'],a:2,w:'Sexagesimal.'},
 {lv:1,q:'MCM =',o:['1100','1900','2100','1009'],a:1,w:'1000 + 900.'},
 {lv:2,q:'13 in base 2:',o:['1011','1101','1110','111'],a:1,w:'8+4+1.'},
 {lv:2,q:'Egyptian symbol for 100:',o:['stroke','heel bone','coil of rope','lotus'],a:2,w:'Coil.'},
 {lv:2,q:'In the Mayan system, a bar means:',o:['1','5','10','20'],a:1,w:'Bar = 5.'},
 {lv:3,q:'Why is calculating with Roman numerals hard?',o:['too few symbols','no place value or zero','base 2','too many digits'],a:1,w:'No positional system.'},
 {lv:3,q:'145 minutes =',o:['1 h 45 min','2 h 25 min','2 h 45 min','1 h 25 min'],a:1,w:'2 × 60 + 25.'},
 {lv:4,q:'Which needs the most symbols in the Egyptian system?',o:['1000','999','100','1001'],a:1,w:'27 symbols.'},
 {lv:4,q:'1729 in base 60 has digits:',o:['(28)(49)','(17)(29)','(29)(28)','(1)(729)'],a:0,w:'28 × 60 + 49.'},
 {lv:5,open:true,m:3,q:'Compare the Roman and Indian number systems (three points).',ans:['Roman uses letters for landmarks; Indian uses 10 digits (1)','Roman has no zero or place value; Indian has both (1)','Indian makes calculation easy and can write any number (1)']},
 {lv:5,open:true,m:3,q:'Convert 45 into base 2 by repeated division, and check.',ans:['45÷2=22 r1, 22÷2=11 r0, 11÷2=5 r1 (1)','5÷2=2 r1, 2÷2=1 r0, 1÷2=0 r1 → 101101 (1)','Check: 32+8+4+1 = 45 (1)']}
];

const ONEMIN=['Matching and tally marks.','Roman numerals: add and subtract.','Egyptian symbols for powers of 10.','Base: landmarks are powers.','Base 60 (time), base 20 (Maya), rods.','Indian place value and zero.'];
const KEYS=[['matching',/match|tally/i],['Roman',/roman/i],['Egyptian',/egypt/i],['base',/base/i],['place value',/place value|position/i],['zero',/zero/i]];

/* ---------- lab ---------- */
let quiz=null;
function draw(n){let s='';s+=T(20,30,`${n}`,'font-size="22" font-weight="700" text-anchor="start"');
 s+=T(20,62,'Roman:','font-size="12" text-anchor="start" fill="'+BR+'"')+T(85,62,roman(n),'font-size="16" font-weight="700" text-anchor="start"');
 s+=T(20,95,'Egyptian:','font-size="12" text-anchor="start" fill="'+BR+'"')+egypt(n,95,100,340);
 const may=digits(n,20);s+=T(20,195,'Mayan (base 20):','font-size="12" text-anchor="start" fill="'+BR+'"');may.forEach((v,k)=>{s+=mayanDigit(v,150+k*55,205)});s+=T(150+may.length*55,200,`= ${may.join(' | ')}`,'font-size="11" text-anchor="start"');
 const b60=digits(n,60);s+=T(20,245,'Base 60:','font-size="12" text-anchor="start" fill="'+BR+'"')+T(95,245,b60.map(d=>`(${d})`).join(' ')+`  → ${b60.map((d,k)=>d+(b60.length-1-k?` × 60${b60.length-1-k>1?'²':''}`:'')).join(' + ')}`,'font-size="13" text-anchor="start"');
 s+=T(20,280,'Base 2:','font-size="12" text-anchor="start" fill="'+BR+'"')+T(95,280,digits(n,2).join(''),'font-size="14" font-weight="700" text-anchor="start" letter-spacing="1"');
 s+=T(20,308,'Indian (Devanagari):','font-size="12" text-anchor="start" fill="'+BR+'"')+T(150,308,String(n).replace(/\d/g,d=>'०१२३४५६७८९'[d]),'font-size="15" text-anchor="start"');
 $('#nSvg').innerHTML=s;const eg=String(n).split('').reduce((a,c)=>a+ +c,0);$('#nOut').innerHTML=`<p>Roman needs ${roman(n).length} letters; Egyptian needs ${eg} symbols; our place-value system needs only ${String(n).length} digits.</p>`}
function labShow(){draw(1729)}
function labInit(){}
function labClick(b){if(b.id==='nGo'){const n=Math.floor(+$('#nN').value);if(!(n>=1&&n<=3999)){$('#nOut').innerHTML='<p class="fb no">Use a whole number from 1 to 3999.</p>';return true}draw(n);return true}
 if(b.id==='nQ'){const n=Math.floor(Math.random()*1999)+1;const dir=Math.random()<.5;quiz={n,dir};$('#nOut').innerHTML=dir?`<p><b>Quiz:</b> write <b>${n}</b> in Roman numerals.</p>`:`<p><b>Quiz:</b> what number is <b>${roman(n)}</b>?</p>`;return true}
 if(b.id==='nC'){if(!quiz){$('#nOut').innerHTML='<p>Press "Roman quiz" first.</p>';return true}const v=$('#nAns').value.trim();const ok=quiz.dir?v.toUpperCase()===roman(quiz.n):+v===quiz.n;$('#nOut').innerHTML=ok?`<p class="fb ok">Correct: ${quiz.n} = ${roman(quiz.n)}.</p>`:`<p class="fb no">Not quite: ${quiz.n} = ${roman(quiz.n)}.</p>`;quiz=null;return true}return false}
function labChange(){return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
