/* Rai Plus content pack: Class 9 Science, Chapter 3 – Atoms and Molecules (rationalised NCERT: mole concept dropped). Bilingual: Hindi terms alongside. */
RP.register({key:'9sci03',cls:'9',subject:'Science',ch:'3',title:"Atoms and Molecules",color:'#7a3fa0',
crumb:"HBSE Class 9 Science · परमाणु एवं अणु · Taught in July",h1:"Chapter 3: Atoms and Molecules · परमाणु एवं अणु",sub:"The laws of chemical combination, Dalton's atomic theory, atoms and their symbols and masses, molecules and ions, writing chemical formulae, and molecular mass.",heroLabel:"Atoms joining into a water molecule",labName:'Formula builder',
theme:"\n:root{--g:light-dark(#7a3fa0,#d3a8ef);--g2:light-dark(#f5eefa,#170c1f);--line:light-dark(#e3d2ef,#3d2a4a);--bg:light-dark(#ffffff,#100a14);--card:light-dark(#ffffff,#170f1c);\n--ink:light-dark(#241130,#efe3f6);--mute:light-dark(#5d4a6a,#c3b0cf);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#5a2a7a}\n",
labHTML:`  <h2>Formula builder · सूत्र निर्माण</h2>
  <p>Pick a positive ion and a negative ion. Their charges (valencies · संयोजकता) must balance. The builder criss-crosses the valencies to give the formula, then adds up the atomic masses to find the formula unit mass.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="fbSvg" viewBox="0 0 520 320" role="img" aria-label="Formula builder" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Positive ion (cation · धनायन)<select id="fbA"></select></label></div>
  <div class="ctrl"><label>Negative ion (anion · ऋणायन)<select id="fbB"></select></label></div>
  <div class="ctrl"><button class="btn" id="fbQ">Challenge me</button></div>
  <div class="box y" id="fbOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#7a3fa0',LABNAME='Formula builder',MIND_CENTER='Atoms · परमाणु';
const PU='#7a3fa0',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',RD='#c0392b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const atom=(x,y,r,c,t)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${ink}" stroke-opacity=".3"/>`+T(x,y+5,t,`font-size="${Math.max(11,r*.8)}" font-weight="700" fill="#fff"`);
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-4:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+13,sub,'font-size="10.5"'):'');
function heroDraw(){return `<circle cx="150" cy="75" r="34" fill="#fff"/><circle cx="104" cy="104" r="20" fill="#fff" opacity=".8"/><circle cx="196" cy="104" r="20" fill="#fff" opacity=".8"/><circle cx="280" cy="60" r="12" fill="#fff" opacity=".5"/><circle cx="310" cy="96" r="8" fill="#fff" opacity=".5"/>`}
const HERO=heroDraw;
const MIND=[['Laws of combination',100,50],["Dalton's theory",420,50],['Atoms & symbols',90,150],['Molecules & ions',430,150],['Chemical formulae',110,250],['Molecular mass',410,250]];

const C=[
{id:'a1',num:'3.1',title:'Laws of chemical combination · रासायनिक संयोजन के नियम',
 intro:'Burn a candle in a sealed jar on a balance. Does the reading change?',
 obj:'State and apply the law of conservation of mass and the law of constant proportions.',
 prior:'Chapter 2: chemical change, compounds.',
 simple:'Law of conservation of mass (द्रव्यमान संरक्षण का नियम): in a chemical reaction, mass can neither be created nor destroyed — the total mass of reactants equals the total mass of products. Law of constant proportions (स्थिर अनुपात का नियम): in a chemical compound, the elements are always present in a definite proportion by mass. In water, hydrogen : oxygen = 1 : 8 by mass, whatever its source.',
 detail:'Lavoisier established conservation of mass; Proust stated constant proportions. Example: 5.3 g sodium carbonate + 6.0 g ethanoic acid → 2.2 g carbon dioxide + 0.9 g water + 8.2 g sodium ethanoate; 11.3 g = 11.3 g. In ammonia, N : H = 14 : 3 by mass. A gas escaping from an open flask makes it look as if mass is lost — in a closed system it is not.',
 real:'Pharmacists rely on fixed proportions: every sample of the same compound has the same composition.',
 apply:'3 g of carbon burns in 8 g of oxygen to give 11 g of CO₂. What mass of CO₂ forms from 3 g carbon in 50 g oxygen?',
 see:{w:520,h:220,f:[
  ['Reactants on a balance.',`<rect x="60" y="150" width="400" height="10" rx="5" fill="${GR}"/><polygon points="260,160 245,190 275,190" fill="${GR}"/>`+box(80,90,140,56,'reactants',BL,'11.3 g')],
  ['Products after the reaction.',box(300,90,140,56,'products',OR,'11.3 g')],
  ['Mass is conserved.',lbl(260,40,'mass of reactants = mass of products','font-size="15" font-weight="700" fill="'+PU+'"')+lbl(260,210,'water: H : O = 1 : 8 always (constant proportions)')]]},
 seeNote:'Balance stays level.',
 do:{title:'Closed-flask reaction',mat:'Conical flask, small tube, barium chloride and sodium sulphate solutions, balance (teacher demo)',steps:['Weigh the closed flask with both solutions kept apart.','Tilt to mix; weigh again.'],obs:'Mass unchanged.',why:'Conservation of mass.',lab:false},
 memo:'"Mass in = mass out; ratio fixed."',
 miscon:['"Burning wood destroys mass." The mass goes into gases and ash; total is conserved.'],
 terms:['Conservation of mass · द्रव्यमान संरक्षण','Constant proportions · स्थिर अनुपात','Reactant · अभिकारक','Product · उत्पाद'],
 q:{q:'In water, H : O by mass is:',o:['2 : 1','1 : 8','1 : 16','8 : 1'],a:1,why:'2 × 1 : 16.'},
 exam:'Verify a law using given data: 2–3 marks.'},

{id:'a2',num:'3.2',title:"Dalton's atomic theory · डाल्टन का परमाणु सिद्धांत",
 intro:'Why should mass be conserved, and why should proportions stay fixed? John Dalton had an idea.',
 obj:"State the postulates of Dalton's atomic theory and link them to the laws.",
 prior:'3.1.',
 simple:"All matter is made of very tiny particles called atoms (परमाणु). Atoms are indivisible and cannot be created or destroyed in a reaction. Atoms of a given element are identical in mass and chemical properties; atoms of different elements differ. Atoms combine in small whole-number ratios to form compounds. In a given compound, the relative number and kinds of atoms are constant.",
 detail:'"Atoms cannot be created or destroyed" explains conservation of mass. "Fixed ratio of atoms in a compound" explains constant proportions. Later discoveries showed that atoms are divisible (electrons, protons, neutrons — next chapter) and that isotopes of the same element differ in mass, so some postulates were revised.',
 real:'Dalton was a school teacher; he also studied colour blindness.',
 apply:"Which postulate of Dalton's theory explains the law of conservation of mass?",
 see:{w:520,h:220,f:[
  ['Atoms are tiny, indivisible.',atom(90,100,26,PU,'C')+lbl(90,160,'indivisible atom')],
  ['Same element: identical atoms.',atom(220,100,22,BL,'O')+atom(270,100,22,BL,'O')+lbl(245,160,'identical atoms')],
  ['Combine in whole-number ratios.',atom(390,100,26,PU,'C')+atom(436,100,22,BL,'O')+atom(344,100,22,BL,'O')+lbl(390,160,'CO₂ — 1 : 2')]]},
 seeNote:'Atoms explain the laws.',
 do:{title:'Bead models',mat:'Beads of two colours, clay',steps:['Make CO₂ and H₂O models.','Count atoms before and after "reacting".'],obs:'Atoms rearranged, none lost.',why:"Dalton's idea.",lab:false},
 memo:'"Tiny, unbreakable, identical, whole-number."',
 miscon:['"Atoms really are indivisible." They are made of smaller particles; Dalton\'s idea was later revised.'],
 terms:['Atom · परमाणु','Postulate · अभिधारणा','Atomic theory · परमाणु सिद्धांत'],
 q:{q:'Which Dalton postulate explains constant proportions?',o:['atoms are tiny','relative number and kinds of atoms in a compound are constant','atoms are indivisible','all atoms are alike'],a:1,why:'Fixed ratio of atoms.'},
 exam:'Postulates linked to laws: 2–3 marks.'},

{id:'a3',num:'3.3',title:'Atoms: size, symbols and atomic mass · परमाणु, प्रतीक और परमाणु द्रव्यमान',
 intro:'Millions of atoms placed side by side would barely make the thickness of this page. How do we write and weigh them?',
 obj:'Use symbols of elements and atomic mass units.',
 prior:'3.2.',
 simple:'Atoms are extremely small — atomic radius is measured in nanometres (1 nm = 10⁻⁹ m); hydrogen is about 0.1 nm. IUPAC sets symbols: the first one or two letters of the English or Latin name, first letter capital (H, O, C, Ca, Cl, Na from natrium, K from kalium, Fe from ferrum). Atomic mass is measured relative to carbon-12: 1 atomic mass unit (u) = 1/12 of the mass of a carbon-12 atom.',
 detail:'Common atomic masses: H 1, C 12, N 14, O 16, Na 23, Mg 24, Al 27, S 32, Cl 35.5, K 39, Ca 40, Fe 56, Cu 63.5, Zn 65. Atoms of most elements do not exist alone; they form molecules or ions. Dalton used circular pictorial symbols; Berzelius suggested letter symbols.',
 real:'Scanning tunnelling microscopes can show images of individual atoms on a surface.',
 apply:'Write the symbols for sodium, potassium, iron, copper, silver and gold, and say which come from Latin names.',
 see:{w:520,h:220,f:[
  ['Symbols: one or two letters.',['H','O','C','Ca','Cl','Na','K','Fe'].map((s,i)=>`<rect x="${30+i*60}" y="40" width="50" height="50" rx="8" fill="${PU}" fill-opacity=".12" stroke="${PU}"/>`+T(55+i*60,72,s,'font-size="20" font-weight="700" fill="'+PU+'"')).join('')],
  ['Latin roots.',lbl(260,120,'Na: natrium · K: kalium · Fe: ferrum · Cu: cuprum · Ag: argentum · Au: aurum','font-size="12.5"')],
  ['Atomic mass unit.',lbl(260,170,'1 u = 1/12 of the mass of one carbon-12 atom','font-size="15" font-weight="700" fill="'+OR+'"')]]},
 seeNote:'First letter capital, second small.',
 do:{title:'Symbol cards',mat:'Cards',steps:['Make 20 cards with name on one side and symbol on the other.','Quiz a partner.'],obs:'Latin symbols are tricky.',why:'IUPAC symbols.',lab:false},
 memo:'"Capital first, small second — Co is cobalt, CO is carbon monoxide."',
 miscon:['"CO and Co are the same." Co is cobalt; CO is carbon monoxide (two elements).'],
 terms:['Symbol · प्रतीक','Atomic mass unit (u) · परमाणु द्रव्यमान इकाई','Nanometre','IUPAC'],
 q:{q:'The symbol of potassium is:',o:['P','Po','K','Pt'],a:2,why:'From kalium.'},
 exam:'Symbols and atomic masses: 1–2 marks.'},

{id:'a4',num:'3.4',title:'Molecules and ions · अणु और आयन',
 intro:'Oxygen in the air is not single atoms. What is it, then?',
 obj:'Define molecules, atomicity and ions; distinguish simple and polyatomic ions.',
 prior:'3.3.',
 simple:'A molecule (अणु) is the smallest particle of an element or compound that can exist independently and shows its properties. Molecules of elements contain the same kind of atoms (O₂, N₂, O₃, P₄, S₈); molecules of compounds contain different atoms (H₂O, NH₃, CO₂). The number of atoms in a molecule is its atomicity (परमाणुकता): He 1, O₂ 2, O₃ 3, P₄ 4, S₈ 8.',
 detail:'Compounds of metals and non-metals are made of charged particles called ions (आयन). A positively charged ion is a cation (Na⁺, Mg²⁺); a negatively charged ion is an anion (Cl⁻, O²⁻). A group of atoms carrying a charge is a polyatomic ion (बहुपरमाणुक आयन): NH₄⁺, OH⁻, NO₃⁻, SO₄²⁻, CO₃²⁻, PO₄³⁻. Sodium chloride is not made of molecules but of Na⁺ and Cl⁻ ions held together.',
 real:'Ozone (O₃) high in the atmosphere absorbs harmful ultraviolet rays.',
 apply:'Give the atomicity of argon, chlorine, ozone and phosphorus.',
 see:{w:520,h:220,f:[
  ['Element molecule: O₂.',atom(80,90,22,RD,'O')+atom(120,90,22,RD,'O')+lbl(100,140,'O₂ (atomicity 2)')],
  ['Compound molecule: H₂O.',atom(260,90,24,RD,'O')+atom(228,114,15,BL,'H')+atom(292,114,15,BL,'H')+lbl(260,150,'H₂O')],
  ['Ions: Na⁺ and Cl⁻.',atom(390,90,18,PU,'Na')+T(408,72,'+','font-size="16" font-weight="700"')+atom(450,90,24,GN,'Cl')+T(476,70,'−','font-size="18" font-weight="700"')+lbl(420,150,'ions in NaCl')+lbl(260,205,'molecule = smallest independent particle; ion = charged particle')]]},
 seeNote:'Neutral molecules, charged ions.',
 do:{title:'Atomicity sort',mat:'Formula cards',steps:['Sort O₂, O₃, He, P₄, S₈, N₂ by atomicity.'],obs:'1, 2, 3, 4, 8.',why:'Atomicity.',lab:false},
 memo:'"Molecule: neutral team; ion: charged player."',
 miscon:['"Salt is made of NaCl molecules." It is made of Na⁺ and Cl⁻ ions in a lattice.'],
 terms:['Molecule · अणु','Atomicity · परमाणुकता','Ion · आयन','Cation · धनायन','Anion · ऋणायन','Polyatomic ion · बहुपरमाणुक आयन'],
 q:{q:'Atomicity of ozone:',o:['1','2','3','4'],a:2,why:'O₃.'},
 exam:'Atomicity, ions: 1–2 marks.'},

{id:'a5',num:'3.5',title:'Writing chemical formulae · रासायनिक सूत्र लिखना',
 intro:'Why is it H₂O and not HO, and CaCl₂ and not CaCl?',
 obj:'Write formulae of simple compounds using valency and the criss-cross method.',
 prior:'3.4.',
 simple:'Valency (संयोजकता) is the combining capacity of an atom or ion — its charge for ions. In a formula, the total positive and negative valencies must balance. Criss-cross method: write the symbols (metal first), write valencies below, cross them over as subscripts, and simplify. Ca²⁺ and Cl⁻ → Ca₁Cl₂ → CaCl₂. Al³⁺ and O²⁻ → Al₂O₃.',
 detail:'When a polyatomic ion appears more than once, put it in brackets: Ca(OH)₂, (NH₄)₂SO₄, Al₂(SO₄)₃. If the valencies are equal, they cancel: Mg²⁺ + O²⁻ → MgO, not Mg₂O₂. Names: binary compounds end in -ide (sodium chloride, magnesium oxide). Simple molecular compounds: H₂O, CO₂, NH₃, CH₄, HCl.',
 real:'Every medicine label lists chemical names whose formulae follow these rules.',
 apply:'Write the formulae of aluminium sulphate, ammonium chloride and calcium carbonate.',
 see:{w:520,h:220,f:[
  ['Symbols and valencies.',lbl(170,60,'Al','font-size="26" font-weight="700"')+lbl(350,60,'O','font-size="26" font-weight="700"')+lbl(170,100,'3','font-size="20" fill="'+OR+'"')+lbl(350,100,'2','font-size="20" fill="'+BL+'"')],
  ['Criss-cross.',`<path d="M180 105 L340 140" stroke="${OR}" stroke-width="2.5" marker-end="url(#ah)"/><path d="M340 105 L180 140" stroke="${BL}" stroke-width="2.5" marker-end="url(#ah)"/>`],
  ['Formula: Al₂O₃.',lbl(260,190,'Al₂O₃','font-size="28" font-weight="700" fill="'+PU+'"')+lbl(430,190,'charges: +6 = −6 ✓','font-size="12"')]]},
 seeNote:'Valencies swap places.',
 do:{title:'Ion jigsaw',mat:'Card ions with tabs (one tab per valency)',steps:['Join cations and anions so all tabs fit.','Write the formula.'],obs:'Two Cl⁻ fit one Ca²⁺.',why:'Balancing valencies.',lab:true},
 memo:'"Cross the charges, then simplify; bracket the groups."',
 miscon:['"MgO is written Mg₂O₂." Simplify to the lowest ratio: MgO.'],
 terms:['Valency · संयोजकता','Chemical formula · रासायनिक सूत्र','Criss-cross method','Binary compound'],
 q:{q:'Formula of calcium hydroxide:',o:['CaOH','CaOH₂','Ca(OH)₂','Ca₂OH'],a:2,why:'Bracket the polyatomic ion.'},
 exam:'Write formulae: 1 mark each.'},

{id:'a6',num:'3.6',title:'Molecular mass and formula unit mass · आण्विक द्रव्यमान',
 intro:'Which is heavier: a molecule of water or a molecule of carbon dioxide?',
 obj:'Calculate molecular mass and formula unit mass.',
 prior:'3.3, 3.5.',
 simple:'Molecular mass (आण्विक द्रव्यमान) = sum of the atomic masses of all atoms in a molecule, in u. H₂O = 2 × 1 + 16 = 18 u. CO₂ = 12 + 2 × 16 = 44 u. So a CO₂ molecule is heavier.',
 detail:'For ionic compounds, which are not made of molecules, we use formula unit mass (सूत्र इकाई द्रव्यमान), calculated the same way: NaCl = 23 + 35.5 = 58.5 u; CaCl₂ = 40 + 2 × 35.5 = 111 u. With brackets, multiply everything inside: Ca(OH)₂ = 40 + 2 × (16 + 1) = 74 u. HNO₃ = 1 + 14 + 48 = 63 u.',
 real:'Chemists use these masses to work out how much of each chemical to mix.',
 apply:'Find the molecular mass of H₂SO₄, C₂H₅OH and the formula unit mass of K₂CO₃.',
 see:{w:520,h:200,f:[
  ['H₂O.',lbl(260,50,'H₂O = 2 × 1 + 16 = 18 u','font-size="17"')],
  ['CO₂.',lbl(260,100,'CO₂ = 12 + 2 × 16 = 44 u','font-size="17" fill="'+BL+'"')],
  ['Formula unit mass.',lbl(260,150,'CaCl₂ = 40 + 2 × 35.5 = 111 u','font-size="17" fill="'+OR+'"')+lbl(260,185,'(ionic compounds → formula unit mass)','font-size="12"')]]},
 seeNote:'Add up every atom.',
 do:{title:'Mass race',mat:'Atomic mass table',steps:['Calculate masses of 5 compounds.','Order them from lightest to heaviest.'],obs:'Practice.',why:'Sum of atomic masses.',lab:false},
 memo:'"Count each atom, multiply, add."',
 miscon:['"Ca(OH)₂ = 40 + 16 + 1 × 2." Multiply the whole bracket: 40 + 2 × 17 = 74.'],
 terms:['Molecular mass · आण्विक द्रव्यमान','Formula unit mass · सूत्र इकाई द्रव्यमान','u'],
 q:{q:'Molecular mass of NH₃ (N = 14, H = 1):',o:['15 u','17 u','18 u','14 u'],a:1,why:'14 + 3.'},
 exam:'Calculate molecular masses: 2–3 marks.'}
];

const CARDS=[['Conservation of mass','Mass of reactants = mass of products.'],['Constant proportions','Elements in a compound in fixed mass ratio.'],["Dalton's theory",'Tiny indivisible atoms; whole-number ratios.'],['Atomic mass unit','1/12 mass of a C-12 atom.'],['Latin symbols','Na, K, Fe, Cu, Ag, Au.'],['Molecule · अणु','Smallest independent particle.'],['Atomicity','He 1, O₂ 2, O₃ 3, P₄ 4, S₈ 8.'],['Ion · आयन','Charged atom or group: cation +, anion −.'],['Polyatomic ions','NH₄⁺ OH⁻ NO₃⁻ SO₄²⁻ CO₃²⁻ PO₄³⁻.'],['Criss-cross','Swap valencies as subscripts; simplify.'],['Molecular mass','Sum of atomic masses: H₂O = 18 u.'],['Formula unit mass','For ionic compounds: NaCl = 58.5 u.']];

const Q=[
 {lv:1,q:'The symbol for iron is:',o:['I','Ir','Fe','F'],a:2,w:'Ferrum.'},
 {lv:1,q:'1 u equals:',o:['mass of H atom','1/12 mass of C-12 atom','mass of O atom','1 g'],a:1,w:'Definition.'},
 {lv:1,q:'Atomicity of S₈:',o:['1','2','4','8'],a:3,w:'Eight atoms.'},
 {lv:2,q:'Formula of magnesium chloride:',o:['MgCl','MgCl₂','Mg₂Cl','Mg₂Cl₂'],a:1,w:'Mg²⁺, Cl⁻.'},
 {lv:2,q:'Which is a polyatomic ion?',o:['Na⁺','Cl⁻','SO₄²⁻','O²⁻'],a:2,w:'Group of atoms.'},
 {lv:2,q:'Molecular mass of CO₂:',o:['28 u','44 u','32 u','22 u'],a:1,w:'12 + 32.'},
 {lv:3,q:'Formula of aluminium sulphate:',o:['AlSO₄','Al₂SO₄','Al₂(SO₄)₃','Al₃(SO₄)₂'],a:2,w:'Al³⁺, SO₄²⁻.'},
 {lv:3,q:'Formula unit mass of Ca(OH)₂:',o:['57 u','74 u','58 u','114 u'],a:1,w:'40 + 2 × 17.'},
 {lv:4,q:'3 g of H₂ reacts with 24 g of O₂ to form water. Mass of water:',o:['21 g','27 g','24 g','3 g'],a:1,w:'Conservation of mass.'},
 {lv:4,q:'Mass ratio C : O in CO₂ is:',o:['1 : 2','3 : 8','12 : 16','6 : 8'],a:1,w:'12 : 32.'},
 {lv:5,open:true,m:3,q:'State the law of constant proportions. In ammonia, N and H are combined in the ratio 14 : 3 by mass. What mass of hydrogen combines with 28 g of nitrogen?',ans:['Statement (1)','Ratio method 14 : 3 = 28 : x (1)','x = 6 g (1)']},
 {lv:5,open:true,m:5,q:'Write the formulae of (a) sodium oxide (b) ammonium sulphate (c) calcium carbonate, and find the formula unit mass of each. (Na 23, O 16, N 14, H 1, S 32, Ca 40, C 12)',ans:['Na₂O = 62 u (1)','(NH₄)₂SO₄ (1)','= 2 × 18 + 96 = 132 u (1)','CaCO₃ (1)','= 40 + 12 + 48 = 100 u (1)']}
];

const ONEMIN=['Mass conserved; proportions fixed.',"Dalton's atomic theory.",'Symbols and atomic mass unit.','Molecules, atomicity, ions.','Formulae by criss-cross.','Molecular and formula unit mass.'];
const KEYS=[['laws',/conservation|constant proportion|नियम/i],['dalton',/dalton/i],['symbols',/symbol|प्रतीक|atomic mass/i],['molecules',/molecule|ion|अणु|आयन/i],['formulae',/formula|valency|संयोजकता/i],['mass',/molecular mass|formula unit|द्रव्यमान/i]];

/* ---------- lab ---------- */
const CAT=[['Na','sodium',1,23,0],['K','potassium',1,39,0],['H','hydrogen',1,1,0],['NH4','ammonium',1,18,1],['Ag','silver',1,108,0],['Mg','magnesium',2,24,0],['Ca','calcium',2,40,0],['Zn','zinc',2,65,0],['Cu','copper(II)',2,63.5,0],['Al','aluminium',3,27,0],['Fe','iron(III)',3,56,0]];
const AN=[['Cl','chloride',1,35.5,0],['OH','hydroxide',1,17,1],['NO3','nitrate',1,62,1],['HCO3','hydrogen carbonate',1,61,1],['O','oxide',2,16,0],['S','sulphide',2,32,0],['SO4','sulphate',2,96,1],['CO3','carbonate',2,60,1],['PO4','phosphate',3,95,1]];
const sub=s=>s.replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d]);
const sup=v=>v===1?'':'²³'[v-2];
const gcd=(a,b)=>b?gcd(b,a%b):a;
let ai=6,bi=0,ch=null,wired=false;
function formula(c,a){const g=gcd(c[2],a[2]);const nc=a[2]/g,na=c[2]/g;const part=(x,n)=>n===1?sub(x[0]):(x[4]?'('+sub(x[0])+')'+sub(String(n)):sub(x[0])+sub(String(n)));return {f:part(c,nc)+part(a,na),nc,na}}
function draw(){const c=CAT[ai],a=AN[bi];const {f,nc,na}=formula(c,a);const m=nc*c[3]+na*a[3];let s='';
 const tile=(x,y,ion,col,sign)=>`<rect x="${x}" y="${y}" width="130" height="70" rx="14" fill="${col}" fill-opacity=".14" stroke="${col}" stroke-width="2.5"/>`+T(x+65,y+40,sub(ion[0])+sup(ion[2])+sign,`font-size="24" font-weight="700" fill="${col}"`)+T(x+65,y+60,ion[1],'font-size="11"');
 s+=tile(60,30,c,BL,'⁺')+tile(330,30,a,GN,'⁻');
 s+=T(125,125,'valency '+c[2],'font-size="14" fill="'+OR+'"')+T(395,125,'valency '+a[2],'font-size="14" fill="'+OR+'"');
 s+=`<path d="M150 135 L370 175" stroke="${OR}" stroke-width="2.5" marker-end="url(#ah)"/><path d="M370 135 L150 175" stroke="${OR}" stroke-width="2.5" marker-end="url(#ah)"/>`;
 for(let i=0;i<nc;i++)s+=`<circle cx="${190-(nc-1)*14+i*28}" cy="205" r="11" fill="${BL}"/>`;for(let i=0;i<na;i++)s+=`<circle cx="${330-(na-1)*14+i*28}" cy="205" r="11" fill="${GN}"/>`;
 s+=T(260,210,'+'+(nc*c[2])+' / −'+(na*a[2]),'font-size="12"');
 s+=T(260,262,f,`font-size="38" font-weight="700" fill="${PU}"`)+T(260,298,`${c[1]} ${a[1]} · ${+m.toFixed(1)} u`,'font-size="14"');
 $('#fbSvg').innerHTML=s;
 let ok='';if(ch){const hit=ch[0]===ai&&ch[1]===bi;ok=hit?`<p class="fb ok">Challenge solved: ${ch[2]} is ${f}.</p>`:`<p><b>Challenge:</b> build <b>${ch[2]}</b>.</p>`;if(hit)ch=null}
 $('#fbOut').innerHTML=ok+`<p>${nc} × ${sub(c[0])}${sup(c[2])}⁺ gives +${nc*c[2]}; ${na} × ${sub(a[0])}${sup(a[2])}⁻ gives −${na*a[2]}. Charges balance.</p><p>Formula unit mass = ${nc} × ${c[3]} + ${na} × ${a[3]} = <b>${+m.toFixed(1)} u</b>${a[4]&&na>1||c[4]&&nc>1?'. The bracket shows the polyatomic ion is taken more than once.':'.'}</p>`}
function labShow(){const A=$('#fbA'),B=$('#fbB');if(A&&!A.options.length){A.innerHTML=CAT.map((c,i)=>`<option value="${i}">${c[1]} ${sub(c[0])}${sup(c[2])}⁺</option>`).join('');B.innerHTML=AN.map((a,i)=>`<option value="${i}">${a[1]} ${sub(a[0])}${sup(a[2])}⁻</option>`).join('')}A.value=ai;B.value=bi;draw()}
function labInit(){wired=true}
function labClick(b){if(b.id==='fbQ'){const i=Math.floor(Math.random()*CAT.length),j=Math.floor(Math.random()*AN.length);ch=[i,j,CAT[i][1]+' '+AN[j][1]];draw();return true}return false}
function labChange(t){if(t.id==='fbA'){ai=+t.value;draw();return true}if(t.id==='fbB'){bi=+t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
