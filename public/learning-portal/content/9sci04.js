/* Rai Plus content pack: Class 9 Science, Chapter 4 – Structure of the Atom */
RP.register({key:'9sci04',cls:'9',subject:'Science',ch:'4',title:"Structure of the Atom",color:'#4a3c8c',
crumb:"HBSE Class 9 Science · Unit: Matter · Taught in November",h1:"Chapter 4: Structure of the Atom",sub:"What is inside an atom, how scientists found out, and how electrons decide the way elements behave.",heroLabel:"A Bohr model of an atom with a nucleus and electrons in shells",labName:"Atom builder",
theme:"\n:root{--g:light-dark(#4a3c8c,#b4a9ec);--g2:light-dark(#f0eefb,#17142a);--line:light-dark(#dcd8f2,#2e2950);--bg:light-dark(#ffffff,#0e0c18);--card:light-dark(#ffffff,#141120);\n--ink:light-dark(#15122a,#ebe8f7);--mute:light-dark(#5a5478,#aea8cc);--y:light-dark(#d85a30,#f0997b);--y2:light-dark(#fbece6,#2a1610);--hd:#33296a}\n",
labHTML:`  <h2>Atom builder</h2>
  <p>Add or remove protons, neutrons and electrons. The builder names the element and works out its mass number, charge, electron arrangement and valency.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="ab" viewBox="0 0 460 420" role="img" aria-label="Bohr model of the atom you are building" style="color:var(--ink)"></svg></div></div>
  <div>
   <div class="ctrl"><span style="min-width:90px">Protons</span><button class="btn" data-pm="p-1">−</button><b id="np" style="min-width:24px;text-align:center"></b><button class="btn" data-pm="p+1">+</button></div>
   <div class="ctrl"><span style="min-width:90px">Neutrons</span><button class="btn" data-pm="n-1">−</button><b id="nn" style="min-width:24px;text-align:center"></b><button class="btn" data-pm="n+1">+</button></div>
   <div class="ctrl"><span style="min-width:90px">Electrons</span><button class="btn" data-pm="e-1">−</button><b id="ne" style="min-width:24px;text-align:center"></b><button class="btn" data-pm="e+1">+</button></div>
   <div class="ctrl"><button class="btn" data-pre="C">Carbon-12</button><button class="btn" data-pre="Na">Sodium-23</button><button class="btn" data-pre="Cl35">Chlorine-35</button><button class="btn" data-pre="Cl37">Chlorine-37</button></div>
   <div class="box y" id="abOut" aria-live="polite"></div>
  </div></div>
`,
build:function(){

const ACC='#4a3c8c',LABNAME='Atom builder',MIND_CENTER='The atom';
const PR='#d85a30',NE='#888780',EL='#378add',ink='currentColor';
const EL20=[['',''],['H','Hydrogen',1,1],['He','Helium',4,0],['Li','Lithium',7,1],['Be','Beryllium',9,2],['B','Boron',11,3],['C','Carbon',12,4],['N','Nitrogen',14,3],['O','Oxygen',16,2],['F','Fluorine',19,1],['Ne','Neon',20,0],['Na','Sodium',23,1],['Mg','Magnesium',24,2],['Al','Aluminium',27,3],['Si','Silicon',28,4],['P','Phosphorus',31,'3, 5'],['S','Sulphur',32,2],['Cl','Chlorine',35,1],['Ar','Argon',40,0],['K','Potassium',39,1],['Ca','Calcium',40,2]];
function config(e){const sh=[2,8,8,2],out=[];let left=e;for(const c of sh){if(left<=0)break;const k=Math.min(c,left);out.push(k);left-=k}return out}
function bohr(cx,cy,Z,N,e,scale=1,animate=false){let s='';const cf=config(e),R=[0,55,90,125,158].map(x=>x*scale);
 const nuc=Math.min(26,10+Math.sqrt(Z+N)*3.2)*scale;s+=`<circle cx="${cx}" cy="${cy}" r="${nuc+4}" fill="${PR}" opacity=".12"/>`;
 const tot=Z+N,parts=[];let zp=Z,nn=N;while(zp||nn){if(zp&&(zp>=nn||!nn)){parts.push(PR);zp--}if(nn&&(nn>zp||!zp)){parts.push(NE);nn--}}
 parts.forEach((c,i)=>{const a=i*2.4,rr=Math.sqrt(i/Math.max(1,tot))*nuc;s+=`<circle cx="${cx+rr*Math.cos(a)}" cy="${cy+rr*Math.sin(a)}" r="${4.2*scale}" fill="${c}"/>`});
 cf.forEach((n,k)=>{const r=R[k+1];s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${ink}" stroke-opacity=".35" stroke-width="1.2"/>`;
  s+=`<g ${animate?`style="transform-origin:${cx}px ${cy}px;animation:spin ${8+k*5}s linear infinite"`:''}>`;for(let j=0;j<n;j++){const a=j/n*Math.PI*2+k*.4;s+=`<circle cx="${cx+r*Math.cos(a)}" cy="${cy+r*Math.sin(a)}" r="${5.5*scale}" fill="${EL}"/>`}s+='</g>';
  s+=T(cx+r*0.72,cy-r*0.72-6,'KLMN'[k],'font-size="12"')});return s}
function heroDraw(){return `<g style="color:#fff">`+bohr(180,62,6,6,6,0.42)+`</g>`}
const HERO=heroDraw;
const MIND=[['Charged particles',90,50],['Atomic models',430,50],['Electron shells',90,150],['Valency',430,150],['Atomic and mass number',90,250],['Isotopes and isobars',430,250]];

const C=[
{id:'p1',num:'4.1',title:'Charged particles in matter',
 intro:'Rub a comb in dry hair and it picks up bits of paper. Where does that charge come from?',
 obj:'Describe the discovery of electrons, protons and neutrons, and compare their charges and masses.',
 prior:'Atoms and molecules (Ch 3).',
 simple:'Atoms are not indivisible. They contain three kinds of particles: electrons (negative), protons (positive) and neutrons (no charge). Protons and neutrons are in the centre (nucleus); electrons are outside it.',
 detail:'J.J. Thomson identified the electron, a negatively charged particle. In 1886 E. Goldstein discovered "canal rays", positively charged radiations, which led to the discovery of the proton. A proton has a charge equal in size and opposite in sign to an electron, and a mass of about 2000 times that of an electron. The proton\'s mass is taken as one unit (1 u) and its charge as +1; the electron\'s charge is −1 and its mass is considered negligible. In 1932 J. Chadwick discovered the neutron, which has no charge and a mass nearly equal to that of a proton. Neutrons are present in the nuclei of all atoms except ordinary hydrogen. Because the atom is electrically neutral, the number of protons equals the number of electrons.',
 real:'The static shock you sometimes feel from a car door or a woollen sweater is a flow of electrons from one object to another.',
 apply:'An atom has 13 protons and 14 neutrons. How many electrons does it have, and what is its approximate mass?',
 see:{w:520,h:240,f:[
  ['Electron: negative charge (−1), almost no mass.',`<circle cx="110" cy="80" r="14" fill="${EL}"/>`+T(110,125,'electron, e⁻','font-size="13"')],
  ['Proton: positive charge (+1), mass 1 u.',`<circle cx="260" cy="80" r="20" fill="${PR}"/>`+T(260,125,'proton, p⁺','font-size="13"')],
  ['Neutron: no charge, mass about 1 u.',`<circle cx="410" cy="80" r="20" fill="${NE}"/>`+T(410,125,'neutron, n','font-size="13"')+T(260,200,'An atom has equal numbers of protons and electrons.','font-size="13"')]]},
 seeNote:'Electron mass is about 1/2000 of a proton\'s.',
 do:{title:'Charge by rubbing',mat:'A plastic comb or balloon, dry hair or a woollen cloth, small paper bits',steps:['Rub the comb in dry hair for 20 seconds.','Bring it near the paper bits.','Try again without rubbing.'],obs:'The rubbed comb attracts the paper; the unrubbed one does not.',why:'Rubbing transfers electrons, leaving the comb charged. This showed that atoms contain charged particles.',lab:false},
 memo:'"Protons Positive, Neutrons Neutral, electrons the light negatives."',
 miscon:['"Neutrons are in every nucleus." Ordinary hydrogen has none.','"The electron is as heavy as the proton." It is about 2000 times lighter.'],
 terms:['Electron','Proton','Neutron','Canal rays','Nucleus'],
 q:{q:'Canal rays led to the discovery of the:',o:['Electron','Proton','Neutron','Nucleus'],a:1,why:'Goldstein\'s positive canal rays led to the proton.'},
 exam:'Comparing the three particles (charge, mass, location, discoverer) is a common 2–3 mark question.'},
{id:'p2',num:'4.2.1',title:"Thomson's model of the atom",
 intro:'If an atom has positive and negative charges but is neutral overall, how might they be arranged?',
 obj:"Describe Thomson's model and state its limitation.",
 prior:'Charged particles (4.1).',
 simple:'Thomson imagined the atom as a positively charged sphere with electrons embedded in it, like seeds in a watermelon or currants in a Christmas pudding. The positive and negative charges are equal, so the atom is neutral.',
 detail:"Thomson's model: (i) an atom consists of a positively charged sphere and the electrons are embedded in it; (ii) the negative and positive charges are equal in magnitude, so the atom as a whole is electrically neutral. It explained why atoms are neutral, but it could not explain the results of experiments by other scientists, especially Rutherford's alpha-particle scattering experiment.",
 real:'Cut a watermelon: red flesh everywhere with black seeds scattered through it. That is the picture Thomson had in mind.',
 apply:"According to Thomson's model, would fast alpha particles fired at a thin gold foil be deflected much? Explain.",
 see:{w:520,h:240,f:[
  ['A sphere of positive charge.',`<circle cx="260" cy="120" r="90" fill="${PR}" opacity=".25" stroke="${PR}"/>`+T(260,228,'positive sphere','font-size="13"')],
  ['Electrons embedded in it, like seeds in a watermelon.',[[-40,-30],[30,-50],[50,20],[-20,40],[-60,10],[10,0],[40,60]].map(([x,y])=>`<circle cx="${260+x}" cy="${120+y}" r="8" fill="${EL}"/>`).join('')],
  ['Equal positive and negative charge: the atom is neutral.',T(430,60,'neutral','font-size="14" font-weight="700"')]]},
 seeNote:'Later disproved by Rutherford\'s experiment.',
 do:{title:'Model it',mat:'A ball of red clay or dough, black peppercorns or seeds',steps:['Shape the clay into a ball (positive charge).','Press the seeds in all over (electrons).','Cut it in half and look inside.'],obs:'Seeds are spread evenly through the ball.',why:"This is Thomson's plum-pudding picture.",lab:false},
 memo:'"Thomson: Tarbooz (watermelon) atom."',
 miscon:['"Thomson\'s model has a nucleus." It has no nucleus; positive charge is spread out.'],
 terms:["Thomson's model",'Plum-pudding model','Electrically neutral'],
 q:{q:"In Thomson's model, the positive charge is:",o:['Concentrated at the centre','Spread uniformly through the sphere','Absent','In orbits'],a:1,why:'A uniform positive sphere with embedded electrons.'},
 exam:"Postulates and the limitation of Thomson's model are asked for 2 marks."},
{id:'p3',num:'4.2.2',title:"Rutherford's alpha-scattering experiment",
 intro:'Fire tiny bullets at a sheet of gold thinner than paper. Some bounce straight back. What could stop them?',
 obj:"Describe Rutherford's experiment, its observations and conclusions, his nuclear model and its drawback.",
 prior:"Thomson's model (4.2.1).",
 simple:'Rutherford fired fast alpha particles at very thin gold foil. Most went straight through, some were deflected a little, and very few bounced back. He concluded that an atom is mostly empty space with a tiny, heavy, positive nucleus at the centre, and electrons revolve around it.',
 detail:'Alpha particles are doubly charged helium ions with a mass of 4 u. Rutherford used gold foil about 1000 atoms thick. Observations: (i) most of the fast-moving alpha particles passed straight through the foil; (ii) some were deflected by small angles; (iii) surprisingly, about one out of every 12000 particles appeared to rebound. Conclusions: most of the space inside the atom is empty; the positive charge occupies very little space; and all the positive charge and almost all the mass is concentrated in a very small volume at the centre, the nucleus. The radius of the nucleus is about 10⁵ times smaller than that of the atom. Nuclear model: a positively charged centre called the nucleus; electrons revolve around it in circular paths; the size of the nucleus is very small compared with the atom. Drawback: a charged particle moving in a circle would radiate energy, so the electrons would lose energy and fall into the nucleus, making the atom unstable — but atoms are stable.',
 real:'If an atom were the size of a cricket stadium, its nucleus would be about the size of a small marble at the centre.',
 apply:'What would Rutherford have observed if the positive charge were spread evenly through the atom, as Thomson said?',
 see:{w:520,h:240,f:[
  ['Alpha particles fired at thin gold foil.',`<rect x="250" y="20" width="10" height="200" fill="#e2b93b"/>`+[60,100,140,180].map(y=>`<line x1="30" y1="${y}" x2="245" y2="${y}" stroke="${PR}" stroke-width="2" marker-end="url(#a)"/>`).join('')],
  ['Most pass straight through; some are deflected.',[60,140,180].map(y=>`<line x1="265" y1="${y}" x2="490" y2="${y}" stroke="${PR}" stroke-width="2"/>`).join('')+`<line x1="265" y1="100" x2="480" y2="40" stroke="${PR}" stroke-width="2"/>`],
  ['Very few (about 1 in 12000) bounce back: a tiny dense nucleus.',`<path d="M245 120 L200 200" stroke="#c0392b" stroke-width="2.5" fill="none"/>`+T(160,225,'rebounds','font-size="13"')]]},
 seeNote:'Watch the full animation in the Visuals tab.',
 do:{title:'Marble model',mat:'A tray, a small heavy ball hidden under a cardboard sheet, 20 marbles',steps:['A partner hides the ball under the cardboard.','Roll marbles under the sheet from one side without looking.','Note where marbles come out deflected or bounce back.'],obs:'Most marbles go straight; a few bounce off the hidden ball.',why:'From the few deflections you can locate a small obstacle, as Rutherford located the nucleus.',lab:false},
 memo:'"Most through (empty), some bend (positive), few back (tiny heavy nucleus)."',
 miscon:['"Most alpha particles bounced back." Only about 1 in 12000 did.','"Rutherford\'s model was perfect." It could not explain why atoms are stable.'],
 terms:['Alpha particle','Gold foil','Nucleus','Nuclear model','Stability'],
 q:{q:'Most alpha particles passed straight through the gold foil because:',o:['The nucleus is very large','Most of the atom is empty space','Gold is soft','Alpha particles are negative'],a:1,why:'The atom is mostly empty.'},
 exam:'Observations, conclusions and drawback of Rutherford\'s model is a classic 3–5 mark question.'},
{id:'p4',num:'4.2.3–4.2.4',title:"Bohr's model and the neutron",
 intro:'Rutherford\'s electrons should spiral into the nucleus. Why don\'t they?',
 obj:"State Bohr's postulates, name the shells K, L, M, N, and locate neutrons.",
 prior:"Rutherford's model (4.2.2).",
 simple:'Bohr said electrons can move only in certain special orbits, called discrete orbits or shells. While in these orbits they do not lose energy, so the atom is stable. The shells are named K, L, M, N or numbered 1, 2, 3, 4 outwards from the nucleus.',
 detail:"Neils Bohr's postulates: (i) only certain special orbits, known as discrete orbits of electrons, are allowed inside the atom; (ii) while revolving in discrete orbits the electrons do not radiate energy. These orbits or shells are called energy levels, represented by K, L, M, N… or n = 1, 2, 3, 4… The neutron (discovered by Chadwick in 1932) has no charge and a mass almost equal to that of a proton; neutrons are present in the nucleus of all atoms except ordinary hydrogen. The mass of an atom is the sum of the masses of the protons and neutrons in its nucleus.",
 real:'Like floors in a building: you can stand on the 1st or 2nd floor, but not halfway between.',
 apply:'How did Bohr\'s model solve the stability problem in Rutherford\'s model?',
 see:{w:520,h:240,f:[
  ['A nucleus with protons and neutrons.',`<circle cx="260" cy="120" r="16" fill="${PR}" opacity=".5"/>`],
  ['Electrons in fixed shells: K, L, M.',[40,72,104].map((r,k)=>`<circle cx="260" cy="120" r="${r}" fill="none" stroke="${ink}" stroke-opacity=".4"/>`+T(260+r*0.72,120-r*0.72-4,'KLM'[k],'font-size="12"')).join('')],
  ['In these orbits electrons do not lose energy, so the atom is stable.',`<circle cx="300" cy="120" r="6" fill="${EL}"/><circle cx="188" cy="120" r="6" fill="${EL}"/><circle cx="260" cy="16" r="6" fill="${EL}"/>`]]},
 seeNote:'Try the spinning model in the Atom builder.',
 do:{title:'Steps, not slopes',mat:'A staircase or a stack of books',steps:['Place a ball on one step.','Try to place it halfway between steps.','Relate steps to energy levels.'],obs:'The ball rests only on steps.',why:'Electrons occupy only allowed energy levels.',lab:false},
 memo:'"Bohr: Fixed floors, no energy lost."',
 miscon:['"Electrons can be anywhere around the nucleus." In Bohr\'s model only in fixed shells.','"Neutrons orbit with electrons." They are in the nucleus.'],
 terms:['Discrete orbits','Shells','Energy levels','K, L, M, N','Neutron'],
 q:{q:'Which sub-atomic particle is absent in an ordinary hydrogen atom?',o:['Electron','Proton','Neutron','None'],a:2,why:'Ordinary hydrogen has one proton and one electron.'},
 exam:"Bohr's postulates and labelled shell diagrams are 2–3 mark questions."},
{id:'p5',num:'4.3',title:'How electrons are distributed in shells',
 intro:'Sodium has 11 electrons. Which shells are they in?',
 obj:'Use the Bohr–Bury rules to write the electronic configuration of the first 20 elements.',
 prior:"Bohr's model (4.2.3).",
 simple:'Electrons fill the shells from the inside out. A shell can hold at most 2n² electrons: K (n = 1) holds 2, L (n = 2) holds 8, M (n = 3) holds 18. The outermost shell can hold at most 8. An inner shell fills before the next one starts.',
 detail:'Bohr and Bury rules: (i) the maximum number of electrons in a shell is given by 2n², where n is the shell number: K = 2, L = 8, M = 18, N = 32. (ii) The maximum number of electrons in the outermost shell is 8. (iii) Electrons are not accommodated in a given shell unless the inner shells are filled; shells are filled in a stepwise manner. Examples: carbon (6) is 2, 4; sodium (11) is 2, 8, 1; chlorine (17) is 2, 8, 7; argon (18) is 2, 8, 8. For the first 18 elements, the M shell holds up to 8; for potassium (19) the next electron goes into N: 2, 8, 8, 1.',
 real:'Like filling seats in a bus with rows of 2, 8 and 8: the front rows fill before anyone sits further back.',
 apply:'Write the electronic configuration of magnesium (Z = 12) and of the ion Mg²⁺.',
 see:{w:520,h:240,f:[
  ['K shell first: up to 2 electrons.',`<circle cx="260" cy="120" r="12" fill="${PR}" opacity=".5"/><circle cx="260" cy="120" r="35" fill="none" stroke="${ink}" stroke-opacity=".4"/><circle cx="295" cy="120" r="5" fill="${EL}"/><circle cx="225" cy="120" r="5" fill="${EL}"/>`],
  ['Then the L shell: up to 8.',`<circle cx="260" cy="120" r="65" fill="none" stroke="${ink}" stroke-opacity=".4"/>`+[0,1,2,3,4,5,6,7].map(j=>{const a=j/8*Math.PI*2;return `<circle cx="${260+65*Math.cos(a)}" cy="${120+65*Math.sin(a)}" r="5" fill="${EL}"/>`}).join('')],
  ['Then M: sodium (11) is 2, 8, 1.',`<circle cx="260" cy="120" r="95" fill="none" stroke="${ink}" stroke-opacity=".4"/><circle cx="355" cy="120" r="5" fill="${EL}"/>`+T(440,60,'Na: 2, 8, 1','font-size="14" font-weight="700"')]]},
 seeNote:'Build any of the first 20 elements in the Atom builder.',
 do:{title:'Bottle-cap shells',mat:'Three concentric circles drawn on paper, 20 bottle caps',steps:['Place caps for an element\'s electrons from the inner circle outwards: 2, then 8, then 8.','Do this for carbon, sodium, chlorine and argon.','Write each configuration.'],obs:'C 2, 4; Na 2, 8, 1; Cl 2, 8, 7; Ar 2, 8, 8.',why:'Bohr–Bury rules.',lab:false},
 memo:'"2, 8, 8: fill from the inside out."',
 miscon:['"The M shell can only hold 8." It can hold 18, but in the first 20 elements the outermost holds at most 8.','"Electrons can skip a shell." Inner shells fill first.'],
 terms:['Electronic configuration','2n² rule','Outermost shell','Valence shell'],
 q:{q:'The electronic configuration of chlorine (Z = 17) is:',o:['2, 8, 7','2, 7, 8','2, 8, 8, 1','8, 2, 7'],a:0,why:'K 2, L 8, M 7.'},
 exam:'Configurations of the first 20 elements appear in almost every paper.'},
{id:'p6',num:'4.4',title:'Valency',
 intro:'Why do helium and neon refuse to react, while sodium reacts with almost anything?',
 obj:'Define valence electrons and valency, and find the valency of elements from their configuration.',
 prior:'Electronic configuration (4.3).',
 simple:'The electrons in the outermost shell are valence electrons. Atoms with a full outer shell (8, or 2 for helium) are stable and do not react. Other atoms combine to reach a full outer shell. Valency is the combining capacity: the number of electrons an atom gains, loses or shares to complete its octet.',
 detail:'An outermost shell with eight electrons is said to possess an octet; atoms react so as to achieve an octet. Helium (2) and the noble gases with 8 outer electrons have zero valency. If an atom has 1, 2 or 3 valence electrons it usually loses them, so its valency equals the number of valence electrons (Na 1, Mg 2, Al 3). If it has 5, 6 or 7, it is easier to gain 3, 2 or 1, so valency = 8 − valence electrons (N 3, O 2, Cl 1). Carbon (4) shares four electrons: valency 4. Some elements show more than one valency: phosphorus shows 3 and 5.',
 real:'Neon in glowing signs does not react with the metal electrodes because its outer shell is already full.',
 apply:'Find the valency of an element with atomic number 16.',
 see:{w:520,h:240,f:[
  ['Sodium 2, 8, 1: lose 1 → valency 1.',T(140,60,'Na: 2, 8, 1','font-size="14"')+T(380,60,'valency 1','font-size="14" font-weight="700"')],
  ['Oxygen 2, 6: gain 2 → valency 2.',T(140,120,'O: 2, 6','font-size="14"')+T(380,120,'valency 8 − 6 = 2','font-size="14" font-weight="700"')],
  ['Neon 2, 8: full octet → valency 0.',T(140,180,'Ne: 2, 8','font-size="14"')+T(380,180,'valency 0','font-size="14" font-weight="700"')]]},
 seeNote:'Valency comes only from the outermost shell.',
 do:{title:'Octet card game',mat:'Cards with elements 1–20 and their configurations',steps:['Pick a card and decide: lose, gain or share?','Write the valency.','Pair cards that can combine (e.g. Na with Cl, Mg with O).'],obs:'Pairs whose valencies match combine one to one.',why:'Atoms combine to achieve stable octets.',lab:false},
 memo:'"1, 2, 3: give away; 5, 6, 7: take from 8; 4: share; 8: rest."',
 miscon:['"Valency = number of valence electrons always." For 5–7 valence electrons it is 8 minus that.','"Noble gases have valency 8." Their valency is 0.'],
 terms:['Valence electrons','Valency','Octet','Duplet'],
 q:{q:'The valency of nitrogen (2, 5) is:',o:['5','3','2','8'],a:1,why:'8 − 5 = 3.'},
 exam:'Find-the-valency questions are common 1–2 mark items.'},
{id:'p7',num:'4.5',title:'Atomic number and mass number',
 intro:'What makes a carbon atom a carbon atom and not nitrogen?',
 obj:'Define atomic number (Z) and mass number (A), and calculate protons, neutrons and electrons from them.',
 prior:'Sub-atomic particles (4.1).',
 simple:'The atomic number Z is the number of protons. It decides which element an atom is. The mass number A is the total number of protons and neutrons (nucleons). Neutrons = A − Z.',
 detail:'Atomic number (Z) = number of protons in the nucleus. All atoms of an element have the same atomic number; it defines the element. Hydrogen Z = 1, carbon Z = 6. Protons and neutrons are together called nucleons. Mass number (A) = number of protons + number of neutrons. Example: carbon has 6 protons and 6 neutrons, so A = 12 u; aluminium has 13 protons and 14 neutrons, so A = 27 u. Notation: the mass number is written as a superscript and the atomic number as a subscript to the left of the symbol, e.g. ¹⁴₇N. In a neutral atom, electrons = protons = Z.',
 real:'Every element in the periodic table is placed by its atomic number: that number is its identity card.',
 apply:'An atom has mass number 23 and atomic number 11. Find the numbers of protons, neutrons and electrons.',
 see:{w:520,h:240,f:[
  ['Atomic number Z = number of protons.',T(140,70,'Z = protons','font-size="15" font-weight="700"')],
  ['Mass number A = protons + neutrons.',T(380,70,'A = p + n','font-size="15" font-weight="700"')],
  ['Written as ¹²₆C: neutrons = A − Z = 6.',T(260,170,'¹²₆C','font-size="40" font-weight="700"')+T(260,215,'6 protons, 6 neutrons, 6 electrons','font-size="13"')]]},
 seeNote:'Electrons do not count in the mass number.',
 do:{title:'Count the particles',mat:'Notebook, list of ten atoms in A/Z notation',steps:['For each atom, write p = Z, n = A − Z, e = Z.','Check that p + n = A.'],obs:'Every row adds up.',why:'A counts nucleons; Z counts protons.',lab:false},
 memo:'"Z for identity, A for All the heavy ones."',
 miscon:['"Mass number includes electrons." Their mass is negligible; A = p + n.','"Atomic number is the number of neutrons." It is the number of protons.'],
 terms:['Atomic number (Z)','Mass number (A)','Nucleons','A/Z notation'],
 q:{q:'An atom of ³⁵₁₇Cl has how many neutrons?',o:['17','18','35','52'],a:1,why:'35 − 17 = 18.'},
 exam:'p, n, e calculations from A and Z are 1–2 mark questions.'},
{id:'p8',num:'4.6',title:'Isotopes and isobars',
 intro:'Chlorine\'s atomic mass is 35.5 u. How can an atom have half a neutron?',
 obj:'Define isotopes and isobars with examples, state uses of isotopes, and calculate average atomic mass.',
 prior:'Atomic number and mass number (4.5).',
 simple:'Isotopes are atoms of the same element (same atomic number) with different mass numbers, because they have different numbers of neutrons. Isobars are atoms of different elements with the same mass number. Chlorine is a mixture of isotopes of mass 35 and 37, so its average mass is 35.5 u.',
 detail:'Isotopes: atoms of the same element having the same atomic number but different mass numbers. Hydrogen has three: protium ¹₁H, deuterium ²₁H (D) and tritium ³₁H (T). Carbon: ¹²₆C and ¹⁴₆C; chlorine: ³⁵₁₇Cl and ³⁷₁₇Cl. Isotopes have the same chemical properties (same electron arrangement) but different physical properties. Natural chlorine contains ³⁵Cl and ³⁷Cl in the ratio 3 : 1, so the average atomic mass = 35 × 3/4 + 37 × 1/4 = 35.5 u. Uses: an isotope of uranium is used as fuel in nuclear reactors; an isotope of cobalt is used in the treatment of cancer; an isotope of iodine is used in the treatment of goitre. Isobars: atoms of different elements with different atomic numbers but the same mass number, e.g. calcium (Z = 20) and argon (Z = 18) both have mass number 40.',
 real:'Doctors use radioactive cobalt in cancer treatment and radioactive iodine for thyroid problems such as goitre.',
 apply:'Calculate the average atomic mass of an element whose isotopes ¹⁶X and ¹⁸X are present in the ratio 9 : 1.',
 see:{w:520,h:240,f:[
  ['Isotopes of hydrogen: same protons, different neutrons.',['¹H','²H','³H'].map((t,i)=>T(100+i*80,60,t,'font-size="18" font-weight="700"')).join('')+T(180,90,'protium, deuterium, tritium','font-size="12"')],
  ['Chlorine-35 : chlorine-37 = 3 : 1 → average 35.5 u.',T(380,60,'35 × ¾ + 37 × ¼ = 35.5','font-size="13"')],
  ['Isobars: different elements, same mass number (⁴⁰Ca, ⁴⁰Ar).',T(260,170,'⁴⁰₂₀Ca   ⁴⁰₁₈Ar','font-size="22" font-weight="700"')]]},
 seeNote:'Same Z → isotopes; same A → isobars.',
 do:{title:'Bead isotopes',mat:'Red beads (protons), grey beads (neutrons), small bowls',steps:['Make three "nuclei" each with 1 red bead and 0, 1 and 2 grey beads.','Make two nuclei with 20 red + 20 grey and 18 red + 22 grey.','Label them as isotopes or isobars.'],obs:'The first three are isotopes of hydrogen; the last two are isobars (Ca and Ar).',why:'Isotopes share Z; isobars share A.',lab:false},
 memo:'"IsotoPes: same Protons. IsobArs: same A."',
 miscon:['"Isotopes are different elements." They are the same element.','"Isotopes react differently." Their chemical properties are the same.'],
 terms:['Isotopes','Isobars','Protium, deuterium, tritium','Average atomic mass'],
 q:{q:'⁴⁰₂₀Ca and ⁴⁰₁₈Ar are:',o:['Isotopes','Isobars','Both','Neither'],a:1,why:'Different elements, same mass number.'},
 exam:'Definitions with examples, uses of isotopes and average atomic mass (Cl = 35.5) are 2–3 mark questions.'}
];

const CARDS=[['Electron','Charge −1; negligible mass; outside the nucleus. Discovered by J.J. Thomson.'],['Proton','Charge +1; mass 1 u; in the nucleus. From Goldstein\'s canal rays.'],['Neutron','No charge; mass about 1 u; in the nucleus. Chadwick, 1932.'],["Thomson's model",'Positive sphere with electrons embedded (watermelon).'],['α-scattering results','Most through; some deflected; about 1 in 12000 rebound.'],['Nucleus','Tiny, dense, positive centre; radius ~10⁵ times smaller than the atom.'],["Rutherford's drawback",'Revolving electrons should radiate energy and fall in; cannot explain stability.'],["Bohr's postulates",'Electrons in discrete orbits; no energy radiated while in them.'],['2n² rule','K 2, L 8, M 18, N 32; outermost at most 8.'],['Valency','Combining capacity; = valence electrons (1–3) or 8 − valence electrons (5–7).'],['Atomic number Z','Number of protons.'],['Mass number A','Protons + neutrons.'],['Isotopes','Same Z, different A (¹H, ²H, ³H; ³⁵Cl, ³⁷Cl).'],['Isobars','Same A, different Z (⁴⁰Ca, ⁴⁰Ar).'],['Uses of isotopes','Uranium: nuclear fuel; cobalt: cancer; iodine: goitre.']];

const Q=[
 {lv:1,q:'The neutron was discovered by:',o:['J.J. Thomson','E. Goldstein','J. Chadwick','E. Rutherford'],a:2,w:'Chadwick, 1932.'},
 {lv:1,q:'The maximum number of electrons in the L shell is:',o:['2','8','18','32'],a:1,w:'2n² with n = 2.'},
 {lv:1,q:'True or false: isotopes of an element have the same chemical properties.',o:['True','False'],a:0,w:'Same electron arrangement.'},
 {lv:1,q:'Mass number is the sum of:',o:['Protons and electrons','Protons and neutrons','Neutrons and electrons','All three'],a:1,w:'Nucleons.'},
 {lv:1,q:'Alpha particles are:',o:['Electrons','Doubly charged helium ions','Neutrons','Hydrogen atoms'],a:1,w:'He²⁺, mass 4 u.'},
 {lv:2,q:'Which observation showed that most of the atom is empty space?',o:['Some alpha particles rebounded','Most alpha particles passed straight through','Some were deflected slightly','Gold foil glowed'],a:1,w:'Most went straight through.'},
 {lv:2,q:'The valency of magnesium (2, 8, 2) is:',o:['2','6','8','12'],a:0,w:'It loses its 2 valence electrons.'},
 {lv:2,q:'Why do noble gases not react?',o:['They have no electrons','Their outermost shell is complete','They are too heavy','They have no neutrons'],a:1,w:'Full octet (duplet for He).'},
 {lv:3,q:'An atom has 2, 8, 7 electrons. Its atomic number is:',o:['7','15','17','35'],a:2,w:'2 + 8 + 7 = 17 (chlorine).'},
 {lv:3,q:'The average atomic mass of chlorine, with ³⁵Cl and ³⁷Cl in ratio 3 : 1, is:',o:['35','35.5','36','37'],a:1,w:'35 × ¾ + 37 × ¼ = 35.5.'},
 {lv:3,q:'An ion has 10 electrons and 11 protons. It is:',o:['Na','Na⁺','Ne','F⁻'],a:1,w:'11 protons = sodium; one electron lost.'},
 {lv:4,q:'Assertion (A): Rutherford\'s model could not explain the stability of the atom. Reason (R): A charged particle moving in a circle radiates energy.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'Electrons would lose energy and fall into the nucleus.'},
 {lv:4,q:'If Z = 3, what would be the valency and the name of the element?',o:['3, boron','1, lithium','3, lithium','1, sodium'],a:1,w:'2, 1: lithium, valency 1.'},
 {lv:4,q:'Which pair are isobars?',o:['¹²C and ¹⁴C','³⁵Cl and ³⁷Cl','⁴⁰Ca and ⁴⁰Ar','¹H and ²H'],a:2,w:'Same A, different elements.'},
 {lv:5,open:true,m:3,q:"Describe Rutherford's alpha-particle scattering experiment: give its observations and conclusions.",ans:['Fast alpha particles directed at thin gold foil (1).','Observations: most passed straight; some deflected; about 1 in 12000 rebounded (1).','Conclusions: atom mostly empty; positive charge and mass concentrated in a tiny nucleus (1).']},
 {lv:5,open:true,m:3,q:'State the rules for writing the distribution of electrons in shells. Write the configurations of Na and Cl.',ans:['Maximum 2n² electrons in a shell (1).','Outermost shell at most 8; inner shells fill first, stepwise (1).','Na 2, 8, 1; Cl 2, 8, 7 (1).']},
 {lv:5,open:true,m:3,q:'Define isotopes and isobars, with one example each. Give two uses of isotopes.',ans:['Isotopes: same Z, different A, e.g. ³⁵Cl and ³⁷Cl (1).','Isobars: different Z, same A, e.g. ⁴⁰Ca and ⁴⁰Ar (1).','Uses: uranium as nuclear fuel; cobalt for cancer; iodine for goitre (any two) (1).']},
 {lv:5,open:true,m:2,q:'Compare the properties of electrons, protons and neutrons.',ans:['Charge: −1, +1, 0; location: shells, nucleus, nucleus (1).','Mass: negligible, 1 u, about 1 u (1).']}
];

const ONEMIN=['Electron (−1, ~0 mass), proton (+1, 1 u), neutron (0, ~1 u).','Thomson: positive sphere with embedded electrons.','Rutherford: most through, some deflected, ~1 in 12000 back → tiny positive nucleus.','Rutherford\'s drawback: cannot explain stability.','Bohr: discrete orbits K, L, M, N; no energy lost.','2n² rule; outermost shell max 8; fill inside out.','Valency: valence electrons (1–3) or 8 − them (5–7); noble gases 0.','Z = protons; A = protons + neutrons.','Isotopes: same Z, different A; isobars: same A, different Z.','Cl average 35.5 u; isotope uses: U fuel, Co cancer, I goitre.'];
const KEYS=[['electron',/electron/i],['proton',/proton/i],['neutron',/neutron/i],['nucleus',/nucleus|nuclei/i],['alpha / gold foil',/alpha|α|gold/i],['empty space',/empty/i],['Bohr orbits / shells',/orbit|shell|K,? L/i],['2n² rule',/2n|2, ?8/i],['valency / octet',/valen|octet/i],['atomic number',/atomic number|\bZ\b/i],['mass number',/mass number|\bA\b/i],['isotopes',/isotop/i],['isobars',/isobar/i]];

/* ---------- lab ---------- */
let Zp=6,Nn=6,Ee=6;
function labDraw(){Zp=Math.max(1,Math.min(20,Zp));Nn=Math.max(0,Math.min(24,Nn));Ee=Math.max(0,Math.min(20,Ee));
 $('#np').textContent=Zp;$('#nn').textContent=Nn;$('#ne').textContent=Ee;
 $('#ab').innerHTML=`<style>@keyframes spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){g[style*="spin"]{animation:none!important}}</style>`+bohr(230,210,Zp,Nn,Ee,1.25,true);
 const el=EL20[Zp],A=Zp+Nn,ch=Zp-Ee,cf=config(Ee),usual=el[2];
 const chS=ch===0?'neutral atom':ch>0?`ion with charge ${ch}+`:`ion with charge ${-ch}−`;
 let iso='';if(A!==usual)iso=`<p class="note">This is an isotope of ${el[1].toLowerCase()} (usual mass number ${usual}): same protons, ${A>usual?'more':'fewer'} neutrons.</p>`;
 const val=ch===0?`<p><b>Valency:</b> ${el[3]}</p>`:'';
 $('#abOut').innerHTML=`<h3 style="margin:0">${el[1]} <span style="font-weight:400">(${el[0]})</span></h3><p style="font-size:22px;margin:.2em 0"><sup>${A}</sup><sub>${Zp}</sub>${el[0]}${ch?`<sup>${Math.abs(ch)>1?Math.abs(ch):''}${ch>0?'+':'−'}</sup>`:''}</p><p><b>Atomic number Z:</b> ${Zp} &nbsp; <b>Mass number A:</b> ${A}</p><p><b>Electron arrangement:</b> ${cf.join(', ')||'none'} &nbsp;(${chS})</p>${val}${iso}`}
const PRE={C:[6,6,6],Na:[11,12,11],Cl35:[17,18,17],Cl37:[17,20,17]};
function labInit(){}
function labShow(){labDraw()}
function labClick(b){if(b.dataset.pm){const[k,d]=[b.dataset.pm[0],+b.dataset.pm.slice(1)];if(k==='p')Zp+=d;if(k==='n')Nn+=d;if(k==='e')Ee+=d;labDraw();return true}
 if(b.dataset.pre){[Zp,Nn,Ee]=PRE[b.dataset.pre];labDraw();return true}return false}
function labChange(t){return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
