/* Rai Plus content pack: Class 7 Mathematics (Ganita Prakash Part 2), Chapter 1 – Geometric Twins. */
RP.register({key:'7matb1',cls:'7',subject:'Mathematics',ch:'II-1',title:"Geometric Twins",color:'#1f5f8b',
crumb:"Class 7 Mathematics · Ganita Prakash Part 2",h1:"Part 2 · Chapter 1: Geometric Twins",sub:"Congruent figures, superposition, corresponding parts, the SSS, SAS, ASA and RHS criteria, why AAA and SSA fail, and uses of congruence.",heroLabel:"Two identical triangles, one flipped",labName:'Twin-triangle checker',
theme:"\n:root{--g:light-dark(#1f5f8b,#8fc2e6);--g2:light-dark(#e8f1f8,#0b1622);--line:light-dark(#cde0ee,#22384b);--bg:light-dark(#ffffff,#081018);--card:light-dark(#ffffff,#0d1620);\n--ink:light-dark(#0d1d2a,#e1ecf5);--mute:light-dark(#475d70,#a7bccd);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#174a6d}\n",
labHTML:`  <h2>Twin-triangle checker</h2>
  <p>Choose what you know about a triangle. The checker tries to build a <i>different</i> triangle with the same information. If it can't, the condition guarantees twins (congruence)!</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="wSvg" viewBox="0 0 460 320" role="img" aria-label="Two triangles compared" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Given<select id="wC"><option value="SSS">SSS: three sides</option><option value="SAS">SAS: two sides + angle between</option><option value="ASA">ASA: two angles + side between</option><option value="RHS">RHS: right angle, hypotenuse, side</option><option value="AAA">AAA: three angles</option><option value="SSA">SSA: two sides + angle not between</option></select></label></div>
  <div class="ctrl"><button class="btn" id="wTry">Try to make a different triangle</button></div>
  <div class="ctrl"><button class="btn" id="wQ">Quiz: are these twins?</button> <button class="btn" data-a="y">Yes, congruent</button> <button class="btn" data-a="n">Not necessarily</button></div>
  <div class="box y" id="wOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#1f5f8b',LABNAME='Twin-triangle checker',MIND_CENTER='Congruence';
const BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const tri=(P,c=BL,dash='')=>`<polygon points="${P.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')}" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2.5" ${dash?'stroke-dasharray="6 4"':''}/>`;
const tick=(p,q,n,c=ink)=>{const mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2,a=Math.atan2(q[1]-p[1],q[0]-p[0])+Math.PI/2;let s='';for(let k=0;k<n;k++){const o=(k-(n-1)/2)*5,ox=Math.cos(a-Math.PI/2)*o,oy=Math.sin(a-Math.PI/2)*o;s+=`<line x1="${(mx+ox-6*Math.cos(a)).toFixed(1)}" y1="${(my+oy-6*Math.sin(a)).toFixed(1)}" x2="${(mx+ox+6*Math.cos(a)).toFixed(1)}" y2="${(my+oy+6*Math.sin(a)).toFixed(1)}" stroke="${c}" stroke-width="2"/>`}return s};
function heroDraw(){return `<polygon points="40,110 160,110 110,30" fill="none" stroke="#fff" stroke-width="3"/><polygon points="200,110 320,110 250,30" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="6 4"/>`}
const HERO=heroDraw;
const MIND=[['Congruent figures',100,50],['Corresponding parts',420,50],['SSS',90,150],['SAS & ASA',430,150],['RHS',110,250],['AAA & SSA fail',410,250]];

const C=[
{id:'w1',num:'1.1',title:'Congruent figures · सर्वांगसम आकृतियाँ',
 intro:'Two ₹10 coins, two stamps from the same sheet — are they "twins"?',
 obj:'Understand congruence as same shape and same size.',
 prior:'Class 6 symmetry; Ch 7 triangles.',
 simple:'Two figures are congruent if one can be placed exactly on top of the other (superposition), possibly after sliding, turning or flipping it. Congruent figures have the same shape and the same size. We write △ABC ≅ △PQR.',
 detail:'Congruent line segments have equal lengths; congruent angles have equal measures; congruent circles have equal radii. Similar figures (same shape, different size) are not congruent. Factories make congruent parts so they fit any machine.',
 real:'Tiles of the same design are congruent; that\'s why they fit together.',
 apply:'Are two squares with sides 4 cm and 5 cm congruent?',
 see:{w:520,h:200,f:[
  ['A shape.',tri([[60,170],[200,170],[140,60]])],
  ['Slide, turn or flip a copy.',tri([[300,170],[440,170],[360,60]],OR,'d')],
  ['It fits exactly: congruent (≅).',lbl(260,195,'same shape, same size','font-weight="700"')]]},
 seeNote:'Superposition test.',
 do:{title:'Trace and test',mat:'Tracing paper, worksheet of shapes',steps:['Trace one shape.','Try to cover others by sliding, turning, flipping.'],obs:'Only congruent ones fit.',why:'Superposition.',lab:false},
 memo:'"Same shape + same size = congruent."',
 miscon:['"A flipped copy is not congruent." Flipping is allowed.'],
 terms:['Congruent · सर्वांगसम','Superposition','≅'],
 q:{q:'Congruent figures have:',o:['same shape only','same size only','same shape and size','same colour'],a:2,why:'Definition.'},
 exam:'Define congruence: 1 mark.'},

{id:'w2',num:'1.2',title:'Corresponding parts',
 intro:'If △ABC ≅ △PQR, which side of △PQR equals AB?',
 obj:'Match corresponding vertices, sides and angles.',
 prior:'1.1.',
 simple:'In △ABC ≅ △PQR, the order of letters tells the matching: A ↔ P, B ↔ Q, C ↔ R. So AB = PQ, BC = QR, CA = RP, ∠A = ∠P, ∠B = ∠Q, ∠C = ∠R. These matching parts are corresponding parts of congruent triangles (CPCT); they are equal.',
 detail:'Writing the order wrong (e.g. △ABC ≅ △QPR) changes the claim. Mark equal sides with the same number of ticks and equal angles with the same number of arcs to keep track.',
 real:'Spare parts must match the corresponding parts of the original.',
 apply:'△DEF ≅ △XYZ. Write the side equal to EF and the angle equal to ∠F.',
 see:{w:520,h:200,f:[
  ['△ABC.',tri([[50,160],[210,160],[120,50]])+lbl(40,175,'A')+lbl(220,175,'B')+lbl(120,40,'C')],
  ['△PQR (same, moved).',tri([[300,160],[460,160],[370,50]],OR)+lbl(290,175,'P')+lbl(470,175,'Q')+lbl(370,40,'R')],
  ['A↔P, B↔Q, C↔R.',tick([50,160],[210,160],1)+tick([300,160],[460,160],1,OR)+lbl(260,195,'AB = PQ, ∠A = ∠P …','font-weight="700"')]]},
 seeNote:'Order of letters = matching.',
 do:{title:'Tick marks',mat:'Two traced triangles',steps:['Mark equal sides with ticks.','Write the correspondence.'],obs:'Clear matching.',why:'CPCT.',lab:false},
 memo:'"Letter order shows partners."',
 miscon:['"Any order of letters works." Order shows correspondence.'],
 terms:['Corresponding parts','CPCT','Correspondence'],
 q:{q:'△ABC ≅ △PQR. BC equals:',o:['PQ','QR','PR','AC'],a:1,why:'B↔Q, C↔R.'},
 exam:'Write corresponding parts: 2 marks.'},

{id:'w3',num:'1.3',title:'SSS congruence',
 intro:'If two triangles have the same three side lengths, must they be twins?',
 obj:'Use the SSS criterion.',
 prior:'Ch 7: constructing with three sides.',
 simple:'SSS (side-side-side): if three sides of one triangle are equal to three sides of another, the triangles are congruent. When you construct a triangle from three sides, the arcs always give the same triangle (or its mirror image).',
 detail:'This is why triangles make rigid frames: once the three sides are fixed, the shape can\'t change. A quadrilateral with fixed sides can still be pushed out of shape — not rigid.',
 real:'Bridge trusses use triangles because fixed sides fix the shape (SSS).',
 apply:'AB = PQ = 5, BC = QR = 6, CA = RP = 7. Are the triangles congruent?',
 see:{w:520,h:200,f:[
  ['Three sides fixed.',tri([[60,160],[220,160],[150,50]])+tick([60,160],[220,160],1)+tick([220,160],[150,50],2)+tick([150,50],[60,160],3)],
  ['Another triangle with the same sides…',tri([[300,160],[460,160],[390,50]],OR)+tick([300,160],[460,160],1,OR)+tick([460,160],[390,50],2,OR)+tick([390,50],[300,160],3,OR)],
  ['…must be the same: SSS.',lbl(260,195,'SSS ⇒ congruent','font-weight="700"')]]},
 seeNote:'Three sides fix the triangle.',
 do:{title:'Straw rigidity',mat:'Straws and pins',steps:['Make a triangle and a square with straws.','Push the corners.'],obs:'Triangle stays rigid; square deforms.',why:'SSS.',lab:true},
 memo:'"Three sides lock it."',
 miscon:['"Same perimeter means congruent." Sides must match individually.'],
 terms:['SSS criterion','Rigid'],
 q:{q:'Two triangles with sides (3,4,5) and (5,3,4) are:',o:['congruent','not congruent','similar only','can\'t tell'],a:0,why:'Same three sides.'},
 exam:'Apply SSS: 2 marks.'},

{id:'w4',num:'1.4',title:'SAS and ASA congruence',
 intro:'Do two sides and the angle between them fix a triangle?',
 obj:'Use the SAS and ASA criteria.',
 prior:'1.3; Ch 7 constructions.',
 simple:'SAS: two sides and the INCLUDED angle (between them) of one triangle equal those of another → congruent. ASA: two angles and the INCLUDED side equal → congruent. (AAS also works: if two angles are known, the third is known by angle sum.)',
 detail:'The included angle matters: knowing two sides and an angle not between them (SSA) may give two different triangles. In constructions, SAS and ASA each produce exactly one triangle.',
 real:'A door hinge with fixed door width, frame width and opening angle fixes the gap (SAS).',
 apply:'In △ABC and △DEF: AB = DE, ∠B = ∠E, BC = EF. Which criterion?',
 see:{w:520,h:200,f:[
  ['SAS: sides with the angle between.',tri([[60,160],[220,160],[110,60]])+tick([60,160],[220,160],1)+tick([60,160],[110,60],2)+`<path d="M85 160 A25 25 0 0 0 71 138" fill="none" stroke="${OR}" stroke-width="2"/>`],
  ['ASA: angles at both ends of a side.',tri([[300,160],[460,160],[380,60]],GN)+tick([300,160],[460,160],1,GN)+`<path d="M325 160 A25 25 0 0 0 316 141" fill="none" stroke="${OR}" stroke-width="2"/><path d="M435 160 A25 25 0 0 1 444 141" fill="none" stroke="${OR}" stroke-width="2"/>`],
  ['Both fix the triangle.',lbl(260,195,'SAS ⇒ ≅ · ASA ⇒ ≅','font-weight="700"')]]},
 seeNote:'Included parts matter.',
 do:{title:'Construct twice',mat:'Ruler, protractor',steps:['Two students construct SAS: 5 cm, 60°, 4 cm.','Cut out and compare.'],obs:'Identical.',why:'SAS.',lab:false},
 memo:'"Angle in the middle for SAS; side in the middle for ASA."',
 miscon:['"Any two sides and any angle work." Angle must be included.'],
 terms:['SAS','ASA','AAS','Included angle/side'],
 q:{q:'Two angles and the side between them equal → criterion:',o:['SSS','SAS','ASA','RHS'],a:2,why:'Angle-Side-Angle.'},
 exam:'Identify SAS/ASA: 2 marks.'},

{id:'w5',num:'1.5',title:'RHS congruence',
 intro:'For right triangles, is there a shortcut?',
 obj:'Use the RHS criterion for right triangles.',
 prior:'1.4.',
 simple:'RHS (right angle–hypotenuse–side): if two right triangles have equal hypotenuses (the side opposite the right angle) and one other pair of equal sides, they are congruent.',
 detail:'This is a special case where "SSA" works, because the known angle is 90° and the side opposite it is the longest. Example: ladders of equal length leaning against a wall with feet equally far from the wall reach the same height.',
 real:'Two equal ladders with feet equally far from the wall reach equal heights.',
 apply:'Two right triangles: hypotenuse 10 cm and one leg 6 cm each. Congruent?',
 see:{w:520,h:200,f:[
  ['Right triangle: hypotenuse and a leg.',tri([[60,170],[200,170],[60,60]])+`<path d="M60 158 h12 v12" fill="none" stroke="${ink}"/>`+tick([200,170],[60,60],2)+tick([60,170],[200,170],1)],
  ['Another with the same hypotenuse and leg…',tri([[320,170],[460,170],[320,60]],OR)+`<path d="M320 158 h12 v12" fill="none" stroke="${ink}"/>`+tick([460,170],[320,60],2,OR)+tick([320,170],[460,170],1,OR)],
  ['…is congruent: RHS.',lbl(260,195,'RHS ⇒ ≅','font-weight="700"')]]},
 seeNote:'Right angle + hypotenuse + side.',
 do:{title:'Ladder model',mat:'Two equal sticks, a wall, ruler',steps:['Lean both with feet 30 cm from the wall.','Compare heights.'],obs:'Equal heights.',why:'RHS.',lab:false},
 memo:'"Right, hypotenuse, side — locked."',
 miscon:['"Hypotenuse is any side." It is opposite the right angle.'],
 terms:['RHS','Hypotenuse','Right triangle'],
 q:{q:'The hypotenuse is opposite the:',o:['smallest angle','right angle','acute angle','base'],a:1,why:'Definition.'},
 exam:'Apply RHS: 2 marks.'},

{id:'w6',num:'1.6',title:'When twins are not guaranteed: AAA and SSA',
 intro:'Two triangles with the same angles — are they always the same size?',
 obj:'Explain why AAA and SSA do not guarantee congruence; use congruence to prove facts.',
 prior:'1.3–1.5.',
 simple:'AAA: triangles with equal angles can be of different sizes (a small and a big equilateral triangle) — not necessarily congruent. SSA: two sides and a non-included angle can make two different triangles (the swinging side can land in two places).',
 detail:'Using congruence: in an isosceles triangle ABC with AB = AC, draw the bisector of ∠A meeting BC at D. △ABD ≅ △ACD (SAS), so ∠B = ∠C — base angles of an isosceles triangle are equal. Congruence lets us prove such facts for every case.',
 real:'Photographs enlarged keep angles (AAA) but change size — not congruent.',
 apply:'Why is "AAA" not a congruence condition?',
 see:{w:520,h:220,f:[
  ['AAA: same angles…',tri([[60,180],[140,180],[100,111]])+tri([[180,180],[320,180],[250,59]],OR)],
  ['…different sizes: not congruent.',lbl(190,210,'same angles, different sizes')],
  ['SSA can give two triangles.',tri([[360,180],[480,180],[430,90]],GN)+`<line x1="430" y1="90" x2="400" y2="180" stroke="${PU}" stroke-width="2.5" stroke-dasharray="5 4"/>`+lbl(420,210,'two positions for one side')]]},
 seeNote:'AAA and SSA fail.',
 do:{title:'Two equilateral triangles',mat:'Paper, ruler',steps:['Draw equilateral triangles of side 3 cm and 6 cm.','Compare angles and sizes.'],obs:'Same angles, different sizes.',why:'AAA fails.',lab:true},
 memo:'"AAA = same shape, not same size."',
 miscon:['"Equal angles mean congruent." They mean similar.'],
 terms:['AAA (similar, not congruent)','SSA (ambiguous)','Isosceles base angles'],
 q:{q:'Which does NOT guarantee congruence?',o:['SSS','SAS','AAA','RHS'],a:2,why:'Different sizes possible.'},
 exam:'Prove isosceles base angles equal: 3 marks.'}
];

const CARDS=[['Congruent','Same shape and size (≅).'],['Superposition','Place one on the other.'],['CPCT','Corresponding parts are equal.'],['SSS','Three sides.'],['SAS','Two sides + included angle.'],['ASA / AAS','Two angles + a side.'],['RHS','Right angle, hypotenuse, one side.'],['AAA','Not enough (sizes differ).'],['SSA','Can give two triangles.'],['Isosceles','Base angles equal (proof by SAS).']];

const Q=[
 {lv:1,q:'Symbol for congruence:',o:['=','≅','~','≈'],a:1,w:'≅.'},
 {lv:1,q:'SSS uses:',o:['three angles','three sides','two sides','one side'],a:1,w:'Sides.'},
 {lv:1,q:'Hypotenuse is opposite the:',o:['right angle','smallest angle','base','vertex'],a:0,w:'90°.'},
 {lv:2,q:'△ABC ≅ △XYZ. ∠B equals:',o:['∠X','∠Y','∠Z','∠A'],a:1,w:'B↔Y.'},
 {lv:2,q:'AB = PQ, ∠A = ∠P, AC = PR. Criterion:',o:['SSS','SAS','ASA','RHS'],a:1,w:'Included angle.'},
 {lv:2,q:'Two right triangles with equal hypotenuse and one leg:',o:['congruent by RHS','not congruent','similar only','AAA'],a:0,w:'RHS.'},
 {lv:3,q:'Which is NOT a congruence rule?',o:['SAS','ASA','SSA','SSS'],a:2,w:'Ambiguous.'},
 {lv:3,q:'Equal angles 40°, 60°, 80° in two triangles means:',o:['congruent','same shape, maybe different size','same size','nothing'],a:1,w:'AAA.'},
 {lv:4,q:'Why is a triangular frame rigid?',o:['SSS fixes its shape','angles are 60°','it is light','it has 3 corners'],a:0,w:'SSS.'},
 {lv:4,q:'In isosceles △ABC (AB = AC), the bisector of ∠A shows ∠B = ∠C by:',o:['SSS','SAS','AAA','RHS'],a:1,w:'AB=AC, angles, AD common.'},
 {lv:5,open:true,m:3,q:'Prove that the base angles of an isosceles triangle are equal.',ans:['Draw bisector AD of ∠A (1)','△ABD ≅ △ACD by SAS (AB = AC, ∠BAD = ∠CAD, AD common) (1)','So ∠B = ∠C by CPCT (1)']},
 {lv:5,open:true,m:2,q:'Explain with an example why AAA is not a congruence criterion.',ans:['Equilateral triangles of sides 3 cm and 6 cm both have angles 60° (1)','But different sizes — not congruent (1)']}
];

const ONEMIN=['Congruent: same shape and size.','Correspondence from letter order; CPCT.','SSS, SAS, ASA/AAS, RHS.','AAA and SSA don\'t guarantee congruence.','Rigid triangles (SSS).','Isosceles base angles equal.'];
const KEYS=[['congruent',/congruen|≅/i],['CPCT',/correspond|CPCT/i],['SSS',/SSS/],['SAS/ASA',/SAS|ASA/],['RHS',/RHS|hypotenuse/i],['AAA/SSA',/AAA|SSA/]];

/* ---------- lab ---------- */
const OK={SSS:1,SAS:1,ASA:1,RHS:1,AAA:0,SSA:0};let cr='SSS',tried=false,quiz=null;
const P0=[[50,240],[210,240],[120,100]];
function base(){let s=tri(P0)+lbl(40,258,'A')+lbl(220,258,'B')+lbl(120,90,'C');
 if(cr==='SSS')s+=tick(P0[0],P0[1],1)+tick(P0[1],P0[2],2)+tick(P0[2],P0[0],3);
 if(cr==='SAS')s+=tick(P0[0],P0[1],1)+tick(P0[0],P0[2],2)+`<path d="M80 240 A30 30 0 0 0 68 214" fill="none" stroke="${OR}" stroke-width="2.5"/>`;
 if(cr==='ASA')s+=tick(P0[0],P0[1],1)+`<path d="M80 240 A30 30 0 0 0 68 214" fill="none" stroke="${OR}" stroke-width="2.5"/><path d="M180 240 A30 30 0 0 1 190 218" fill="none" stroke="${OR}" stroke-width="2.5"/>`;
 if(cr==='AAA')s+=[0,1,2].map(i=>`<circle cx="${P0[i][0]+(P0[(i+1)%3][0]+P0[(i+2)%3][0]-2*P0[i][0])*0.12}" cy="${P0[i][1]+(P0[(i+1)%3][1]+P0[(i+2)%3][1]-2*P0[i][1])*0.12}" r="4" fill="${OR}"/>`).join('');
 return s}
function draw(){let s='';if(cr==='RHS'){const R=[[50,240],[210,240],[50,110]];s=tri(R)+`<path d="M50 228 h12 v12" fill="none" stroke="${ink}"/>`+tick(R[1],R[2],2)+tick(R[0],R[1],1);if(tried){const Q=[[260,240],[420,240],[260,110]].map(p=>[p[0]+0,p[1]]);s+=tri([[420,240],[260,240],[420,110]],OR,'d')+`<path d="M420 228 h-12 v12" fill="none" stroke="${ink}"/>`}}
 else if(cr==='SSA'){s=tri([[50,240],[230,240],[150,110]])+tick([50,240],[150,110],2)+tick([150,110],[230,240],1)+`<path d="M80 240 A30 30 0 0 0 72 220" fill="none" stroke="${OR}" stroke-width="2.5"/>`;if(tried){// same angle at A, same AC, same CB but B at different spot
   const A=[260,240],Cc=[360,110];// CB length = dist(C,B) original
   const L=Math.hypot(230-150,240-110);const dy=240-110;const dx=Math.sqrt(L*L-dy*dy);s+=tri([A,[Cc[0]+dx,240],Cc],OR,'d')+tri([A,[Cc[0]-dx,240],Cc],PU,'d')+`<circle cx="${Cc[0]}" cy="${Cc[1]}" r="${L}" fill="none" stroke="${GR}" stroke-dasharray="3 3"/>`}}
 else{s=base();if(tried){if(OK[cr]){s+=`<g transform="translate(470 0) scale(-1 1)">${tri(P0.map(p=>[p[0]+0,p[1]]),OR,'d')}</g>`}else{// AAA bigger
   const k=1.45;s+=tri(P0.map(p=>[250+(p[0]-50)*k,240-(240-p[1])*k]),OR,'d')}}}
 $('#wSvg').innerHTML=s;
 if(!tried){$('#wOut').innerHTML=`<p>Given: <b>${cr}</b>. Press "Try to make a different triangle".</p>`;return}
 const msg={SSS:'Any triangle with these three sides is the same — only flipped. SSS guarantees congruence.',SAS:'With two sides and the angle between them fixed, the third side is forced. SAS guarantees congruence.',ASA:'Fixing a side and the angles at both ends forces where the rays meet. ASA guarantees congruence.',RHS:'With a right angle, the hypotenuse and one leg, the other leg is forced. RHS guarantees congruence.',AAA:'Same angles, but a bigger triangle fits too! AAA gives the same shape, not the same size — NOT a congruence rule.',SSA:'The side opposite the given angle can swing and land in two places: two different triangles. SSA is NOT a congruence rule.'};
 $('#wOut').innerHTML=`<p class="fb ${OK[cr]?'ok':'no'}">${msg[cr]}</p>`}
function labShow(){draw()}
function labInit(){}
function labClick(b){if(b.id==='wTry'){tried=true;draw();return true}
 if(b.id==='wQ'){const items=[['AB = PQ, BC = QR, CA = RP','y','SSS'],['∠A = ∠P, ∠B = ∠Q, ∠C = ∠R','n','AAA'],['AB = PQ, ∠B = ∠Q, BC = QR','y','SAS'],['AB = PQ, BC = QR, ∠A = ∠P','n','SSA'],['∠A = ∠P, AB = PQ, ∠B = ∠Q','y','ASA'],['∠C = ∠R = 90°, AB = PQ (hypotenuse), BC = QR','y','RHS']];quiz=items[Math.floor(Math.random()*items.length)];$('#wOut').innerHTML=`<p>In △ABC and △PQR: <b>${quiz[0]}</b>. Are they congruent?</p>`;return true}
 if(b.dataset&&b.dataset.a){if(!quiz){$('#wOut').innerHTML='<p>Press Quiz first.</p>';return true}const ok=b.dataset.a===quiz[1];$('#wOut').innerHTML=`<p class="fb ${ok?'ok':'no'}">${ok?'Correct':'Not quite'}: this is ${quiz[2]}, which ${quiz[1]==='y'?'guarantees congruence':'does not guarantee congruence'}.</p>`;quiz=null;return true}return false}
function labChange(t){if(t.id==='wC'){cr=t.value;tried=false;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
