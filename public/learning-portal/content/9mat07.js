/* Rai Plus content pack: Class 9 Mathematics, Chapter 7 – Triangles (rationalised NCERT: congruence, isosceles properties). */
RP.register({key:'9mat07',cls:'9',subject:'Mathematics',ch:'7',title:"Triangles",color:'#3b6d11',
crumb:"HBSE Class 9 Mathematics · Unit: Geometry · Taught in October",h1:"Chapter 7: Triangles",sub:"Congruent figures and CPCT, the SAS, ASA, AAS, SSS and RHS congruence rules, and the properties of isosceles triangles.",heroLabel:"Two congruent triangles",labName:'Congruence builder',
theme:"\n:root{--g:light-dark(#3b6d11,#a8d77d);--g2:light-dark(#eef6e4,#0f1a07);--line:light-dark(#d4e7bf,#2c4219);--bg:light-dark(#ffffff,#0b1206);--card:light-dark(#ffffff,#111a0a);\n--ink:light-dark(#162508,#e6f1da);--mute:light-dark(#4f6439,#b5c9a0);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#2b520b}\n",
labHTML:`  <h2>Congruence builder</h2>
  <p>Pick a rule and set three measurements. The builder draws every triangle that fits. If only one triangle (up to flipping) is possible, the rule fixes the triangle — it is a congruence rule. Try the SSA "trap": sometimes two different triangles fit.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="cbSvg" viewBox="0 0 520 330" role="img" aria-label="Congruence builder" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Rule<select id="cbR"><option value="sas">SAS: two sides and the included angle</option><option value="sss">SSS: three sides</option><option value="asa">ASA: two angles and the included side</option><option value="ssa">SSA: two sides and a non-included angle (trap!)</option></select></label></div>
  <div class="ctrl"><label><span id="cbL1"></span><input type="range" class="cbS" id="cb1" min="2" max="9" step="0.5" value="6"></label></div>
  <div class="ctrl"><label><span id="cbL2"></span><input type="range" class="cbS" id="cb2" min="2" max="9" step="0.5" value="5"></label></div>
  <div class="ctrl"><label><span id="cbL3"></span><input type="range" class="cbS" id="cb3" min="10" max="150" step="1" value="50"></label></div>
  <div class="box y" id="cbOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3b6d11',LABNAME='Congruence builder',MIND_CENTER='Congruence';
const GN='#3b6d11',BL='#1f5f8b',OR='#b04a1f',PU='#6a4fb3',RD='#c0392b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const tri=(pts,c,op='.15')=>`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="${c}" fill-opacity="${op}" stroke="${c}" stroke-width="2.5"/>`;
const tick=(a,b,n,c=ink)=>{const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),ux=-dy/L*6,uy=dx/L*6,tx=dx/L*4,ty=dy/L*4;let s='';for(let i=0;i<n;i++){const o=(i-(n-1)/2);s+=`<line x1="${mx-ux+tx*o}" y1="${my-uy+ty*o}" x2="${mx+ux+tx*o}" y2="${my+uy+ty*o}" stroke="${c}" stroke-width="2"/>`}return s};
const arcAt=(v,p,q,r,c,n=1)=>{const a1=Math.atan2(p[1]-v[1],p[0]-v[0]),a2=Math.atan2(q[1]-v[1],q[0]-v[0]);let s='';for(let i=0;i<n;i++){const rr=r+i*5;const x1=v[0]+rr*Math.cos(a1),y1=v[1]+rr*Math.sin(a1),x2=v[0]+rr*Math.cos(a2),y2=v[1]+rr*Math.sin(a2);let d=a2-a1;while(d<=-Math.PI)d+=2*Math.PI;while(d>Math.PI)d-=2*Math.PI;s+=`<path d="M${x1} ${y1} A${rr} ${rr} 0 0 ${d>0?1:0} ${x2} ${y2}" fill="none" stroke="${c}" stroke-width="2"/>`}return s};
function heroDraw(){return `<polygon points="30,120 130,120 70,30" fill="none" stroke="#fff" stroke-width="3"/><polygon points="200,120 300,120 240,30" fill="#fff" fill-opacity=".3" stroke="#fff" stroke-width="3"/>`}
const HERO=heroDraw;
const MIND=[['Congruence & CPCT',100,50],['SAS',420,50],['ASA & AAS',90,150],['Isosceles triangles',430,150],['SSS',110,250],['RHS',410,250]];
const A1=[[40,190],[200,190],[90,60]],B1=[[300,190],[460,190],[350,60]];

const C=[
{id:'t1',num:'7.1',title:'Congruent figures and CPCT',
 intro:'Two photocopies of the same picture fit exactly on each other. In geometry, what do we call such figures?',
 obj:'Understand congruence and correspondence, and use CPCT.',
 prior:'Class 7: congruence of triangles.',
 simple:'Figures are congruent (≅) if they have the same shape and size — one can be placed exactly over the other. Two triangles ABC and PQR are congruent if, with the correspondence A ↔ P, B ↔ Q, C ↔ R, all three pairs of sides and all three pairs of angles are equal. We write △ABC ≅ △PQR (order matters).',
 detail:'CPCT: corresponding parts of congruent triangles are equal. Once we prove two triangles congruent, we can conclude any pair of corresponding sides or angles are equal. Circles with equal radii are congruent; squares with equal sides are congruent. Fortunately we do not need all six equalities — a few well-chosen ones guarantee the rest (the congruence rules).',
 real:'Mass-produced parts (screws, tiles, coins) are congruent so they fit interchangeably.',
 apply:'If △ABC ≅ △FED, which side of △FED corresponds to BC? Which angle to ∠A?',
 see:{w:520,h:220,f:[
  ['△ABC.',tri(A1,GN)+lbl(30,208,'A')+lbl(205,208,'B')+lbl(90,50,'C')],
  ['△PQR.',tri(B1,BL)+lbl(290,208,'P')+lbl(465,208,'Q')+lbl(350,50,'R')],
  ['Matching parts.',tick(A1[0],A1[1],1)+tick(B1[0],B1[1],1)+tick(A1[1],A1[2],2)+tick(B1[1],B1[2],2)+tick(A1[0],A1[2],3)+tick(B1[0],B1[2],3)+lbl(260,30,'△ABC ≅ △PQR (A↔P, B↔Q, C↔R)','font-weight="700"')]]},
 seeNote:'Same marks = equal parts.',
 do:{title:'Trace and fit',mat:'Tracing paper',steps:['Trace one triangle.','Place it on the other — rotate or flip if needed.'],obs:'Exact fit.',why:'Congruence.',lab:false},
 memo:'"≅ means a perfect fit; CPCT gives the rest."',
 miscon:['"△ABC ≅ △PQR means the same as △ABC ≅ △QRP." The order shows which vertices correspond.'],
 terms:['Congruent (≅)','Correspondence','CPCT'],
 q:{q:'If △ABC ≅ △PQR, then AC =',o:['PQ','QR','PR','RP only if isosceles'],a:2,why:'A↔P, C↔R.'},
 exam:'Correspondence and CPCT: 1 mark.'},

{id:'t2',num:'7.2',title:'SAS congruence rule',
 intro:'If you know two sides of a triangle and the angle between them, can you draw only one triangle?',
 obj:'State and use the SAS congruence rule.',
 prior:'7.1.',
 simple:'Axiom 7.1 (SAS): two triangles are congruent if two sides and the included angle of one are equal to two sides and the included angle of the other. The angle must be between the two sides.',
 detail:'Example: in a figure, OA = OB and OD = OC, with ∠AOD = ∠BOC (vertically opposite). So △AOD ≅ △BOC by SAS, and by CPCT AD = BC and AD ∥ BC (alternate angles equal). SAS is taken as an axiom (accepted, not proved).',
 real:'A carpenter fixing two sticks of set lengths at a set hinge angle always gets the same triangular frame.',
 apply:'AB is a line segment and line l is its perpendicular bisector. Show that any point P on l is equidistant from A and B.',
 see:{w:520,h:220,f:[
  ['Two sides and the included angle.',tri(A1,GN,'0')+tick(A1[0],A1[1],1,GN)+tick(A1[0],A1[2],2,GN)+arcAt(A1[0],A1[1],A1[2],22,OR)],
  ['Same in another triangle.',tri(B1,BL,'0')+tick(B1[0],B1[1],1,BL)+tick(B1[0],B1[2],2,BL)+arcAt(B1[0],B1[1],B1[2],22,OR)],
  ['So the triangles are congruent.',tri(A1,GN)+tri(B1,BL)+lbl(260,30,'SAS: side – included angle – side','font-weight="700"')]]},
 seeNote:'The angle must be in between.',
 do:{title:'Straw triangles',mat:'Straws, protractor',steps:['Cut two straws of 6 cm and 5 cm; join at 50°.','Close the triangle; compare with friends.'],obs:'All the same.',why:'SAS.',lab:true},
 memo:'"S-A-S: the angle is sandwiched."',
 miscon:['"Any two sides and any angle work." The angle must be included between the sides (SSA does not work).'],
 terms:['SAS','Included angle','Axiom'],
 q:{q:'For SAS, the equal angle must be:',o:['any angle','included between the two sides','a right angle','opposite the longer side'],a:1,why:'Sandwiched.'},
 exam:'SAS proofs: 3 marks.'},

{id:'t3',num:'7.3',title:'ASA and AAS congruence rules',
 intro:'Knowing two angles and one side — is that enough?',
 obj:'State and use the ASA and AAS congruence rules.',
 prior:'7.2.',
 simple:'Theorem 7.1 (ASA): two triangles are congruent if two angles and the included side of one are equal to two angles and the included side of the other. AAS: two triangles are congruent if any two pairs of angles and one pair of corresponding sides are equal (the side need not be included), because the third angles are then also equal (angle sum 180°).',
 detail:'ASA is proved from SAS by considering cases. Example: line l bisects ∠A, and B is a point on l; BP and BQ are perpendiculars from B to the arms. Then △APB ≅ △AQB (AAS), so BP = BQ: B is equidistant from the arms of the angle. Note: AAA is not a congruence rule — triangles with equal angles can be different sizes (similar, not congruent).',
 real:'Surveyors fix a point by measuring a base line and the two angles at its ends (ASA).',
 apply:'Line segment AB is parallel to CD, and O is the midpoint of AD. Show that △AOB ≅ △DOC.',
 see:{w:520,h:220,f:[
  ['Two angles and the side between.',tri(A1,GN,'0')+arcAt(A1[0],A1[1],A1[2],22,OR)+arcAt(A1[1],A1[0],A1[2],22,OR,2)+tick(A1[0],A1[1],1,GN)],
  ['Same in the other.',tri(B1,BL,'0')+arcAt(B1[0],B1[1],B1[2],22,OR)+arcAt(B1[1],B1[0],B1[2],22,OR,2)+tick(B1[0],B1[1],1,BL)],
  ['ASA; AAA is not enough.',lbl(260,30,'ASA ✓ · AAS ✓ · AAA ✗ (size can differ)','font-weight="700"')]]},
 seeNote:'Angles fix shape; a side fixes size.',
 do:{title:'Same angles, different size',mat:'Protractor, ruler',steps:['Draw two triangles with angles 50°, 60°, 70° but different sides.'],obs:'Not congruent.',why:'AAA fails.',lab:false},
 memo:'"Angles give shape, a side gives size."',
 miscon:['"AAA proves congruence." It only proves similarity.'],
 terms:['ASA','AAS','AAA (not a rule)'],
 q:{q:'Which is NOT a congruence rule?',o:['SAS','ASA','SSS','AAA'],a:3,why:'Size not fixed.'},
 exam:'ASA/AAS proofs: 3 marks.'},

{id:'t4',num:'7.4',title:'Isosceles triangles',
 intro:'Fold an isosceles triangle so its equal sides meet. What do you notice about its base angles?',
 obj:'Prove and use the properties of isosceles triangles.',
 prior:'7.2, 7.3.',
 simple:'A triangle with two equal sides is isosceles. Theorem 7.2: angles opposite to equal sides of an isosceles triangle are equal. Theorem 7.3 (converse): the sides opposite to equal angles of a triangle are equal.',
 detail:'Proof of 7.2: in △ABC with AB = AC, draw the bisector of ∠A meeting BC at D. △BAD ≅ △CAD (SAS: AB = AC, ∠BAD = ∠CAD, AD common). So ∠B = ∠C (CPCT). Consequences: each angle of an equilateral triangle is 60°. The bisector of the vertex angle of an isosceles triangle is also the perpendicular bisector of the base.',
 real:'The two sloping sides of an A-frame roof are equal, so it meets the walls at equal angles.',
 apply:'In isosceles △ABC with AB = AC, ∠A = 40°. Find ∠B and ∠C.',
 see:{w:520,h:230,f:[
  ['AB = AC.',tri([[160,200],[360,200],[260,40]],GN,'.12')+tick([260,40],[160,200],1)+tick([260,40],[360,200],1)+lbl(150,218,'B')+lbl(370,218,'C')+lbl(260,30,'A')],
  ['Bisector AD.',`<line x1="260" y1="40" x2="260" y2="200" stroke="${BL}" stroke-width="2" stroke-dasharray="5 4"/>`+lbl(260,218,'D','fill="'+BL+'"')],
  ['∠B = ∠C.',arcAt([160,200],[360,200],[260,40],24,OR)+arcAt([360,200],[160,200],[260,40],24,OR)+lbl(430,120,'∠B = ∠C','font-size="16" font-weight="700" fill="'+OR+'"')]]},
 seeNote:'Equal sides face equal angles.',
 do:{title:'Fold test',mat:'Paper isosceles triangle',steps:['Fold so the equal sides coincide.','Compare the base angles.'],obs:'They match.',why:'Theorem 7.2.',lab:true},
 memo:'"Equal sides ⇔ equal opposite angles."',
 miscon:['"The equal angles are at the top vertex." They are the base angles, opposite the equal sides.'],
 terms:['Isosceles triangle','Base angles','Vertex angle','Equilateral triangle'],
 q:{q:'In isosceles △ABC (AB = AC), ∠B = 65°. ∠A =',o:['65°','50°','115°','25°'],a:1,why:'180 − 130.'},
 exam:'Isosceles theorems and problems: 3 marks.'},

{id:'t5',num:'7.5',title:'SSS congruence rule',
 intro:'Three sticks of fixed length — how many different triangles can they make?',
 obj:'State and use the SSS congruence rule.',
 prior:'7.4.',
 simple:'Theorem 7.4 (SSS): if three sides of one triangle are equal to the three sides of another triangle, the two triangles are congruent.',
 detail:'This is why triangles are rigid: once the three side lengths are fixed, the shape cannot change. A quadrilateral with fixed sides can still be pushed out of shape, which is why bridges, towers and roof trusses use triangles. Example: AB = AC and D is a point such that DB = DC; then △ABD ≅ △ACD (SSS), so AD bisects ∠A.',
 real:'Electricity pylons and cycle frames are made of triangles because SSS makes them rigid.',
 apply:'△ABC and △DBC are isosceles on the same base BC. Show that △ABD ≅ △ACD.',
 see:{w:520,h:220,f:[
  ['Three sides marked.',tri(A1,GN,'0')+tick(A1[0],A1[1],1,GN)+tick(A1[1],A1[2],2,GN)+tick(A1[0],A1[2],3,GN)],
  ['Same three sides.',tri(B1,BL,'0')+tick(B1[0],B1[1],1,BL)+tick(B1[1],B1[2],2,BL)+tick(B1[0],B1[2],3,BL)],
  ['Rigid shape.',tri(A1,GN)+tri(B1,BL)+lbl(260,30,'SSS → congruent; triangles are rigid','font-weight="700"')]]},
 seeNote:'Three lengths fix a triangle.',
 do:{title:'Rigid vs wobbly',mat:'Straws, pins',steps:['Build a triangle and a square frame.','Push the corners.'],obs:'Square wobbles; triangle doesn\'t.',why:'SSS.',lab:true},
 memo:'"Three sides lock the shape."',
 miscon:['"Four sides fix a quadrilateral too." A quadrilateral with fixed sides can change its angles.'],
 terms:['SSS','Rigidity'],
 q:{q:'Two triangles with sides 3, 4, 5 cm each are congruent by:',o:['SAS','ASA','SSS','RHS'],a:2,why:'All three sides.'},
 exam:'SSS proofs: 3 marks.'},

{id:'t6',num:'7.6',title:'RHS congruence rule',
 intro:'For right triangles, is it enough to know the hypotenuse and one side?',
 obj:'State and use the RHS congruence rule.',
 prior:'7.5.',
 simple:'Theorem 7.5 (RHS): if in two right triangles the hypotenuse and one side of one triangle are equal to the hypotenuse and one side of the other, the two triangles are congruent. (R = right angle, H = hypotenuse, S = side.)',
 detail:'This works even though it looks like SSA, because the right angle is the largest angle and the hypotenuse is opposite it — by Baudhayana–Pythagoras, the third side is then fixed. Example: AD is an altitude of isosceles △ABC with AB = AC. Then △ABD ≅ △ACD (RHS), so BD = CD: the altitude bisects the base.',
 real:'A ladder of fixed length placed at the same height on a wall stands the same distance from the wall.',
 apply:'BE and CF are equal altitudes of △ABC. Prove that △ABC is isosceles using RHS.',
 see:{w:520,h:220,f:[
  ['A right triangle.',tri([[60,190],[220,190],[60,60]],GN,'.12')+`<rect x="60" y="176" width="14" height="14" fill="none" stroke="${OR}" stroke-width="2"/>`],
  ['Hypotenuse and a side.',tick([220,190],[60,60],2,GN)+tick([60,190],[60,60],1,GN)+lbl(160,110,'H','fill="'+GN+'" font-weight="700"')+lbl(45,125,'S')],
  ['Another with the same H and S.',tri([[300,190],[460,190],[300,60]],BL,'.12')+`<rect x="300" y="176" width="14" height="14" fill="none" stroke="${OR}" stroke-width="2"/>`+tick([460,190],[300,60],2,BL)+tick([300,190],[300,60],1,BL)+lbl(260,30,'RHS → congruent','font-weight="700"')]]},
 seeNote:'Only for right triangles.',
 do:{title:'Ladder test',mat:'Ruler as ladder, book as wall',steps:['Lean the ruler so its top touches the same height.','Measure foot distance each time.'],obs:'Always the same.',why:'RHS.',lab:false},
 memo:'"Right angle, Hypotenuse, Side."',
 miscon:['"RHS works for any triangle." It needs a right angle.'],
 terms:['RHS','Hypotenuse','Right triangle'],
 q:{q:'RHS applies only to:',o:['equilateral triangles','right triangles','isosceles triangles','obtuse triangles'],a:1,why:'Right angle needed.'},
 exam:'RHS proofs: 3 marks.'}
];

const CARDS=[['Congruent ≅','Same shape and size.'],['CPCT','Corresponding parts of congruent triangles are equal.'],['SAS','Two sides + included angle (axiom).'],['ASA','Two angles + included side.'],['AAS','Two angles + any corresponding side.'],['SSS','Three sides.'],['RHS','Right angle + hypotenuse + side.'],['Not rules','AAA and SSA.'],['Isosceles','Equal sides ⇔ equal opposite angles.'],['Equilateral','Each angle 60°.']];

const Q=[
 {lv:1,q:'SAS means:',o:['side-angle-side with the angle included','any two sides and angle','three sides','side and two angles'],a:0,w:'Included angle.'},
 {lv:1,q:'Which is not a congruence rule?',o:['SSS','ASA','AAA','RHS'],a:2,w:'AAA gives similarity.'},
 {lv:1,q:'Each angle of an equilateral triangle:',o:['45°','60°','90°','120°'],a:1,w:'180 ÷ 3.'},
 {lv:2,q:'In △ABC, AB = AC and ∠A = 80°. ∠B =',o:['50°','80°','100°','40°'],a:0,w:'(180 − 80) ÷ 2.'},
 {lv:2,q:'If △ABC ≅ △DEF, then ∠B =',o:['∠D','∠E','∠F','∠A'],a:1,w:'Correspondence.'},
 {lv:2,q:'RHS needs:',o:['two angles','right angle, hypotenuse, side','three sides','one side'],a:1,w:'Definition.'},
 {lv:3,q:'AB = AC, D is midpoint of BC. △ABD ≅ △ACD by:',o:['SAS','SSS','ASA','RHS'],a:1,w:'AB = AC, BD = CD, AD common.'},
 {lv:3,q:'Angles opposite equal sides are:',o:['supplementary','equal','complementary','right'],a:1,w:'Theorem 7.2.'},
 {lv:4,q:'Two triangles have two sides and a non-included angle equal. They are:',o:['always congruent','not necessarily congruent','never congruent','similar'],a:1,w:'SSA ambiguous.'},
 {lv:4,q:'In isosceles △ABC (AB = AC), the altitude AD:',o:['bisects BC','equals AB','is parallel to BC','is outside'],a:0,w:'RHS.'},
 {lv:5,open:true,m:3,q:'Prove that the angles opposite to equal sides of an isosceles triangle are equal.',ans:['Draw bisector AD of ∠A (1)','△BAD ≅ △CAD by SAS (1)','∠B = ∠C by CPCT (1)']},
 {lv:5,open:true,m:5,q:'ABC is an isosceles triangle with AB = AC. BE and CF are altitudes to AC and AB. Prove that BE = CF.',ans:['Consider △ABE and △ACF (1)','∠AEB = ∠AFC = 90° (1)','∠A common, AB = AC (1)','△ABE ≅ △ACF by AAS (1)','BE = CF by CPCT (1)']}
];

const ONEMIN=['Congruent figures; CPCT.','SAS axiom.','ASA, AAS; AAA fails.','Isosceles: equal sides ⇔ equal angles.','SSS; triangles are rigid.','RHS for right triangles.'];
const KEYS=[['congruent',/congruen|CPCT/i],['SAS',/SAS/],['ASA',/ASA|AAS/],['isosceles',/isosceles/i],['SSS',/SSS/],['RHS',/RHS|hypotenuse/i]];

/* ---------- lab ---------- */
let rule='sas',v1=6,v2=5,v3=50,wired=false;
const U=32,O=[50,290];
const P=(x,y)=>[O[0]+x*U,O[1]-y*U];
function solve(){const r=Math.PI/180;
 if(rule==='sas'){const A=[0,0],B=[v1,0],Cc=[v2*Math.cos(v3*r),v2*Math.sin(v3*r)];return [[A,B,Cc]]}
 if(rule==='sss'){const a=v1,b=v2,c=v3/15;if(a+b<=c||a+c<=b||b+c<=a)return [];const x=(a*a+c*c-b*b)/(2*a);const y=Math.sqrt(Math.max(0,c*c-x*x));return [[[0,0],[a,0],[x,y]]]}
 if(rule==='asa'){const Aa=v2*12,Bb=v3;if(Aa+Bb>=180)return [];const c=v1;const C=180-Aa-Bb;const b=c*Math.sin(Bb*r)/Math.sin(C*r);return [[[0,0],[c,0],[b*Math.cos(Aa*r),b*Math.sin(Aa*r)]]]}
 const b=v1,a=v2,A=v3*r;const h=b*Math.sin(A);if(a<h-1e-9)return [];const xc=b*Math.cos(A);const d=Math.sqrt(Math.max(0,a*a-h*h));const out=[];[xc+d,xc-d].forEach(x=>{if(x>1e-6&&!out.some(o=>Math.abs(o[1][0]-x)<1e-6))out.push([[0,0],[x,0],[xc,h]])});return out}
function labels(){const L={sas:['Side AB',' cm','Side AC',' cm','Included angle A','°'],sss:['Side AB',' cm','Side BC',' cm','Side AC','  cm (÷15)'],asa:['Side AB',' cm','Angle A (×12)','°','Angle B','°'],ssa:['Side AC',' cm','Side BC',' cm','Angle A (not between them)','°']}[rule];return L}
function draw(){const L=labels();const show2=rule==='asa'?(v2*12)+'°':v2+' cm';const show3=rule==='sss'?(v3/15).toFixed(1)+' cm':v3+'°';
 $('#cbL1').innerHTML=`${L[0]}: <b>${v1}</b> cm`;$('#cbL2').innerHTML=`${L[2]}: <b>${show2}</b>`;$('#cbL3').innerHTML=`${L[4]}: <b>${show3}</b>`;
 const sols=solve();let s=`<line x1="20" y1="${O[1]}" x2="500" y2="${O[1]}" stroke="${GR}" stroke-opacity=".3"/>`;const cols=[GN,OR];
 sols.forEach((t,i)=>{const pts=t.map(p=>P(...p));s+=tri(pts,cols[i],'.15')+T(pts[0][0]-10,pts[0][1]+16,'A','font-size="13" font-weight="700"')+T(pts[1][0]+(i?-6:8),pts[1][1]+16,'B'+(i?'₂':(sols.length>1?'₁':'')),`font-size="13" font-weight="700" fill="${cols[i]}"`)+T(pts[2][0],pts[2][1]-8,'C','font-size="13" font-weight="700"')});
 if(rule==='ssa'&&sols.length){const Cp=P(...sols[0][2]);s+=`<circle cx="${Cp[0]}" cy="${Cp[1]}" r="${v2*U}" fill="none" stroke="${PU}" stroke-dasharray="4 4"/>`}
 s+=T(260,24,sols.length===0?'No triangle possible':sols.length===1?'Exactly one triangle':'Two different triangles!','font-size="16" font-weight="700" fill="'+(sols.length===2?RD:sols.length?GN:GR)+'"');
 $('#cbSvg').innerHTML=`<defs><clipPath id="cbc"><rect width="520" height="330"/></clipPath></defs><g clip-path="url(#cbc)">${s}</g>`;
 const name={sas:'SAS',sss:'SSS',asa:'ASA',ssa:'SSA'}[rule];
 $('#cbOut').innerHTML=sols.length===0?`<p>These measurements cannot form a triangle${rule==='sss'?' (the sum of any two sides must exceed the third)':rule==='asa'?' (the two angles already reach 180°)':' (side BC is too short to reach the base line)'}.</p>`:sols.length===1?`<p><b>${name}</b> fixed one triangle. Anyone using these three measurements draws the same triangle — ${rule==='ssa'?'here SSA happened to give one, but not always!':`${name} is a congruence rule.`}</p>`:`<p><b>SSA trap:</b> two different triangles (green and orange) have the same two sides and the same non-included angle. So SSA is <b>not</b> a congruence rule. (The circle shows where C can reach.)</p>`}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const el=e.target;if(!el||!el.classList||!el.classList.contains('cbS'))return;const v=+el.value;if(el.id==='cb1')v1=v;else if(el.id==='cb2')v2=v;else v3=v;draw()})}
function labClick(){return false}
function labChange(el){if(el.id==='cbR'){rule=el.value;if(rule==='ssa'){v1=8;v2=5;v3=35}else if(rule==='sss'){v1=7;v2=5;v3=90}else if(rule==='asa'){v1=7;v2=4;v3=60}else{v1=6;v2=5;v3=50}$('#cb1').value=v1;$('#cb2').value=v2;$('#cb3').value=v3;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
