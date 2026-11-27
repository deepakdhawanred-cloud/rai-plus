/* Rai Plus content pack: Class 11 Chemistry, Chapter 8 – Organic Chemistry: Some Basic Principles and Techniques */
RP.register({key:'11che08',cls:'11',subject:'Chemistry',ch:'8',title:"Organic Chemistry: Basic Principles and Techniques",color:'#2f5d50',
crumb:"HBSE Class 11 Chemistry · Unit 8 · Taught in November",h1:"Chapter 8: Organic Chemistry – Some Basic Principles and Techniques",sub:"Shapes and names of organic molecules, how electrons move in reactions, and how chemists purify and analyse compounds.",heroLabel:"A carbon skeleton with curved arrows and a chromatography strip",labName:'Organic lab',
theme:"\n:root{--g:light-dark(#2f5d50,#9fd3c2);--g2:light-dark(#e9f4f0,#0d1a16);--line:light-dark(#cfe3dc,#24403a);--bg:light-dark(#ffffff,#0a110f);--card:light-dark(#ffffff,#0f1815);\n--ink:light-dark(#0f1c18,#e2efea);--mute:light-dark(#4d645d,#a5bdb5);--y:light-dark(#a3471b,#f0a37a);--y2:light-dark(#fbece4,#2a140a);--hd:#20443a}\n",
labHTML:`  <h2>Organic lab</h2>
  <div class="ctrl"><label>Activity<select id="oMode"><option value="chr">Paper chromatography and Rf</option><option value="cat">Carbocation stability</option><option value="las">Lassaigne's test results</option></select></label></div>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="oSvg" viewBox="0 0 480 340" role="img" aria-label="Organic lab" style="color:var(--ink)"></svg></div></div>
  <div><div id="oCtl"></div><div class="box y" id="oOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#2f5d50',LABNAME='Organic lab',MIND_CENTER='Organic basics';
const TE='#2f5d50',OR='#a3471b',BL='#2e6fb5',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,'font-size="14" '+o);
const bond=(x1,y1,x2,y2,n=1,c=ink)=>{const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),nx=-dy/L*4,ny=dx/L*4;if(n===1)return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2"/>`;if(n===2)return `<line x1="${x1+nx/1.4}" y1="${y1+ny/1.4}" x2="${x2+nx/1.4}" y2="${y2+ny/1.4}" stroke="${c}" stroke-width="2"/><line x1="${x1-nx/1.4}" y1="${y1-ny/1.4}" x2="${x2-nx/1.4}" y2="${y2-ny/1.4}" stroke="${c}" stroke-width="2"/>`;return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2"/><line x1="${x1+nx*1.2}" y1="${y1+ny*1.2}" x2="${x2+nx*1.2}" y2="${y2+ny*1.2}" stroke="${c}" stroke-width="2"/><line x1="${x1-nx*1.2}" y1="${y1-ny*1.2}" x2="${x2-nx*1.2}" y2="${y2-ny*1.2}" stroke="${c}" stroke-width="2"/>`};
const zig=(x0,y0,n,dx=34,dy=20)=>{let d='';for(let i=0;i<=n;i++)d+=(i?'L':'M')+(x0+i*dx)+' '+(y0+(i%2?-dy:0));return `<path d="${d}" fill="none" stroke="${ink}" stroke-width="2.2"/>`};
const curly=(x1,y1,x2,y2,bend=-30,c=OR)=>{const mx=(x1+x2)/2,my=(y1+y2)/2+bend;const a=Math.atan2(y2-my,x2-mx);return `<path d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" fill="none" stroke="${c}" stroke-width="2"/><path d="M${x2} ${y2} L${x2-9*Math.cos(a-0.4)} ${y2-9*Math.sin(a-0.4)} L${x2-9*Math.cos(a+0.4)} ${y2-9*Math.sin(a+0.4)}Z" fill="${c}"/>`};
function heroDraw(){return `<path d="M30 90 L60 70 L90 90 L120 70 L150 90" fill="none" stroke="#fff" stroke-width="3"/><path d="M60 60 Q90 30 120 60" fill="none" stroke="#fff" stroke-width="2"/><rect x="200" y="20" width="30" height="100" fill="#fff" opacity=".6"/><circle cx="215" cy="50" r="5" fill="#fff"/><circle cx="215" cy="80" r="5" fill="#fff"/>`}
const HERO=heroDraw;
const MIND=[['Hybridisation & shapes',100,40],['Representations',420,40],['Functional groups & naming',90,120],['Isomerism',430,120],['Fission, intermediates, reagents',110,200],['Electronic effects',420,200],['Purification',110,280],['Qualitative & quantitative analysis',410,280]];

const C=[
{id:'o1',num:'8.2',title:'Tetravalence of carbon and shapes of molecules',
 intro:'Why is methane a tetrahedron, ethene flat, and ethyne a straight line?',
 obj:'Relate the hybridisation of carbon (sp³, sp², sp) to shape, bond angle, bond length and electronegativity.',
 prior:'Hybridisation and VSEPR (Chapter 4).',
 simple:'Carbon forms four bonds. In methane (CH₄) carbon is sp³ hybridised: tetrahedral, 109.5°. In ethene (C₂H₄) each carbon is sp²: planar, about 120°, with one π bond from side-by-side overlap of unhybridised p orbitals. In ethyne (C₂H₂) each carbon is sp: linear, 180°, with two π bonds.',
 detail:'Hybridisation affects bond length and bond enthalpy: as s-character increases (sp³ 25%, sp² 33%, sp 50%), the orbital holds electrons closer to the nucleus, giving shorter and stronger bonds; sp-hybridised carbon is the most electronegative. A π bond forms when the parallel p orbitals overlap sideways; the two carbons cannot rotate freely about it, and the π electron cloud above and below the plane is easily available to attacking reagents, so multiple bonds are reactive sites. Typical bond lengths: C–C ≈ 154 pm, C=C ≈ 134 pm, C≡C ≈ 120 pm.',
 real:'The rigid flat C=C unit is why cis and trans forms of a compound can exist as separate substances.',
 apply:'State the hybridisation of each carbon in CH₂=CH–C≡N.',
 see:{w:520,h:220,f:[
  ['sp³: tetrahedral (CH₄), 109.5°.',`<circle cx="90" cy="110" r="10" fill="#444"/>`+[[90,50],[40,150],[140,150],[110,140]].map(([x,y])=>bond(90,110,x,y)+`<circle cx="${x}" cy="${y}" r="6" fill="#ddd" stroke="${ink}"/>`).join('')+lbl(90,195,'sp³ · 109.5°')],
  ['sp²: trigonal planar (C₂H₄), 120°, one π bond.',bond(230,110,290,110,2)+`<circle cx="230" cy="110" r="10" fill="#444"/><circle cx="290" cy="110" r="10" fill="#444"/>`+[[200,80],[200,140],[320,80],[320,140]].map(([x,y])=>bond(x<260?230:290,110,x,y)+`<circle cx="${x}" cy="${y}" r="6" fill="#ddd" stroke="${ink}"/>`).join('')+lbl(260,195,'sp² · 120°')],
  ['sp: linear (C₂H₂), 180°, two π bonds.',bond(400,110,450,110,3)+`<circle cx="400" cy="110" r="10" fill="#444"/><circle cx="450" cy="110" r="10" fill="#444"/>`+bond(370,110,400,110)+bond(450,110,480,110)+`<circle cx="370" cy="110" r="6" fill="#ddd" stroke="${ink}"/><circle cx="480" cy="110" r="6" fill="#ddd" stroke="${ink}"/>`+lbl(425,195,'sp · 180°')]]},
 seeNote:'Shown flat; see the 3D visual to rotate them.',
 do:{title:'Balloon shapes',mat:'Four, three and two tied balloons',steps:['Tie 4 balloons at their necks; let them settle.','Repeat with 3 and 2.'],obs:'Tetrahedron, triangle, straight line.',why:'Electron pairs spread as far apart as possible.',lab:false},
 memo:'"More s, more short, more strong: sp > sp² > sp³."',
 miscon:['"All C–C bonds are the same length." Triple < double < single.','"π bonds are stronger than σ bonds." σ bonds are stronger; π electrons are more exposed.'],
 terms:['Tetravalence','sp³, sp², sp','σ bond','π bond','s-character'],
 q:{q:'Hybridisation of carbon in ethyne:',o:['sp³','sp²','sp','dsp²'],a:2,why:'Linear, two π bonds.'},
 exam:'Hybridisation of each carbon in a given molecule is a common 1–2 mark question.'},

{id:'o2',num:'8.3',title:'Structural representations',
 intro:'How can you write butane in five different ways and still mean the same molecule?',
 obj:'Write complete, condensed and bond-line formulas, and read wedge–dash 3D drawings.',
 prior:'Lewis structures.',
 simple:'A complete structural formula shows every bond. A condensed formula groups atoms (CH₃CH₂CH₂CH₃ or CH₃(CH₂)₂CH₃). A bond-line formula draws only the carbon skeleton as a zig-zag: each corner and line end is a carbon carrying enough hydrogens to make four bonds; other atoms are written in.',
 detail:'Bond-line rules: carbon and hydrogen atoms are not shown; lines are C–C bonds drawn in a zig-zag; terminals are methyl groups unless a functional group is shown; heteroatoms (O, N, Cl…) and H attached to them are written. Rings: a hexagon is cyclohexane; with alternating double bonds it is benzene. Three-dimensional representation: a solid wedge is a bond pointing towards you, a dashed wedge points away, and normal lines lie in the plane of the paper.',
 real:'Chemists and drug designers sketch molecules in bond-line form because it is fast and shows the skeleton clearly.',
 apply:'Draw the bond-line structure of 2-methylpentane and of propan-2-ol.',
 see:{w:520,h:220,f:[
  ['Condensed: CH₃CH₂CH₂CH₃ (butane).',lbl(110,60,'CH₃–CH₂–CH₂–CH₃','font-size="16"')],
  ['Bond-line: each corner/end is a carbon.',zig(60,150,3,40,26)+[0,1,2,3].map(i=>`<circle cx="${60+i*40}" cy="${150-(i%2?26:0)}" r="3" fill="${OR}"/>`).join('')+lbl(120,185,'butane')],
  ['Heteroatoms shown: propan-2-ol, and wedge–dash for 3D.',zig(300,150,2,40,26)+bond(340,124,340,90)+lbl(340,82,'OH')+`<path d="M420 110 L470 90 L470 100Z" fill="${ink}"/>`+[0,1,2,3].map(i=>`<line x1="${420+i*3}" y1="${120+i*4}" x2="${470-i*2}" y2="${140}" stroke="${ink}" stroke-width="1.5" opacity="${1-i*.1}"/>`).join('')+lbl(445,185,'wedge / dash','font-size="12"')]]},
 seeNote:'Orange dots mark the carbons hidden in the zig-zag.',
 do:{title:'Formula translation',mat:'Paper, pencil',steps:['Write pentane, hexane and propan-1-ol in condensed form.','Convert each to bond-line.','Swap with a partner and convert back.'],obs:'Both forms carry the same information.',why:'Hydrogens are implied by tetravalence.',lab:false},
 memo:'"Every corner is a C; add Hs to make four."',
 miscon:['"The zig-zag shows the real bond angle as drawn." It is a convention.','"Bond-line ends are hydrogens." Ends are CH₃ groups.'],
 terms:['Complete formula','Condensed formula','Bond-line formula','Wedge and dash'],
 q:{q:'In a bond-line formula, a line end with nothing written stands for:',o:['H','CH₃','OH','a lone pair'],a:1,why:'A terminal carbon with 3 H.'},
 exam:'Converting between condensed and bond-line formulas is common in 2-mark questions.'},

{id:'o3',num:'8.4–8.5',title:'Classification, functional groups and IUPAC names',
 intro:'Butan-2-ol, 3-methylbutanal, 2-chloropropane: how do these names tell you the structure?',
 obj:'Classify organic compounds, identify functional groups and homologous series, and name simple compounds by IUPAC rules.',
 prior:'Representations (8.3).',
 simple:'Compounds are acyclic (open chain) or cyclic (alicyclic, aromatic, heterocyclic). A functional group (–OH, –CHO, >C=O, –COOH, –NH₂, –X) decides the chemistry. Members of a homologous series differ by –CH₂–. An IUPAC name = prefix (substituents) + word root (number of carbons) + primary suffix (ane/ene/yne) + secondary suffix (functional group).',
 detail:'Rules: (1) choose the longest chain containing the functional group / multiple bonds; (2) number so the principal functional group gets the lowest locant, then multiple bonds, then substituents (lowest-locant rule); (3) write substituent prefixes in alphabetical order, with di-, tri- for repeats (not counted in alphabetising); (4) separate numbers by commas and numbers from words by hyphens. Word roots: meth (1), eth (2), prop (3), but (4), pent (5), hex (6). Suffixes: -ol (alcohol), -al (aldehyde), -one (ketone), -oic acid (carboxylic acid), -amine. Halogens and nitro are always prefixes (chloro, bromo, nitro). Examples: CH₃CH(OH)CH₃ = propan-2-ol; CH₃CH(CH₃)CH₂CHO = 3-methylbutanal; CH₂=CH–CH=CH₂ = buta-1,3-diene. Aromatic: benzene derivatives, e.g. methylbenzene (toluene), hydroxybenzene (phenol).',
 real:'Medicine labels list IUPAC-style chemical names, e.g. N-(4-hydroxyphenyl)ethanamide for paracetamol.',
 apply:'Name: CH₃–CH₂–CH(CH₃)–CH₂–CH₃ and CH₃–CO–CH₂–CH₃.',
 see:{w:520,h:220,f:[
  ['Longest chain containing –OH: 4 carbons → "but".',zig(60,130,3,50,30)+bond(110,100,110,60)+lbl(110,52,'OH')+[1,2,3,4].map((n,i)=>lbl(60+i*50,i%2?90:155,String(n),`fill="${OR}" font-size="12"`)).join('')],
  ['Number from the end nearer –OH: OH on C-2.',lbl(370,70,'word root: but','font-size="13"')+lbl(370,95,'primary suffix: an','font-size="13"')+lbl(370,120,'secondary suffix: 2-ol','font-size="13"')],
  ['Name: butan-2-ol.',lbl(370,170,'butan-2-ol','font-size="18" font-weight="700"')]]},
 seeNote:'Lowest locant goes to the principal functional group.',
 do:{title:'Name game',mat:'Cards with 10 condensed formulas',steps:['Find the longest chain with the functional group.','Number for lowest locants.','Build the name and check with a partner.'],obs:'Names become routine after a few.',why:'IUPAC rules are systematic.',lab:false},
 memo:'"Prefix–Root–Suffix: Substituents, Size, Saturation, Speciality."',
 miscon:['"Number from the left always." Number to give the functional group the lowest locant.','"di- counts in alphabetical order." Ignore di-, tri- when alphabetising.'],
 terms:['Acyclic','Alicyclic','Aromatic','Heterocyclic','Functional group','Homologous series','Word root','Locant'],
 q:{q:'IUPAC name of CH₃CH₂CHO:',o:['propanal','propan-1-ol','propanone','ethanal'],a:0,why:'3 carbons, aldehyde.'},
 exam:'IUPAC naming of 4–5 compounds appears in every paper.'},

{id:'o4',num:'8.6',title:'Isomerism',
 intro:'C₄H₁₀O can be an alcohol or an ether. How many structures fit one formula?',
 obj:'Distinguish chain, position, functional and metamerism isomers, and note stereoisomerism.',
 prior:'IUPAC names (8.5).',
 simple:'Isomers have the same molecular formula but different structures or arrangements. Structural isomers differ in how atoms are joined: chain (different skeleton), position (different position of a group or multiple bond), functional group (different functional groups), and metamerism (different alkyl groups on either side of a functional group, e.g. in ethers). Stereoisomers have the same connections but different arrangement in space.',
 detail:'Chain: pentane, 2-methylbutane, 2,2-dimethylpropane (C₅H₁₂). Position: propan-1-ol and propan-2-ol (C₃H₈O). Functional: propanone (ketone) and propanal (aldehyde) (C₃H₆O). Metamerism: methoxypropane (CH₃OC₃H₇) and ethoxyethane (C₂H₅OC₂H₅) (C₄H₁₀O). Stereoisomerism includes geometrical (cis–trans) and optical isomerism, studied later.',
 real:'Ethanol (drinkable in small amounts) and methoxymethane (a gas) are functional isomers, C₂H₆O, with very different properties.',
 apply:'Write a pair of position isomers and a pair of functional isomers for C₃H₆O.',
 see:{w:520,h:220,f:[
  ['Chain isomers (C₅H₁₂): straight vs branched.',zig(40,120,4,30,20)+zig(200,120,3,30,20)+bond(230,100,230,70)+lbl(110,160,'pentane','font-size="12"')+lbl(250,160,'2-methylbutane','font-size="12"')],
  ['Position isomers (C₃H₈O): –OH on C-1 or C-2.',zig(340,80,2,30,20)+bond(400,80,425,95)+lbl(440,100,'OH','font-size="12"')+zig(340,170,2,30,20)+bond(370,150,370,125)+lbl(370,118,'OH','font-size="12"')],
  ['Functional: propanal vs propanone. Metamers: CH₃OC₃H₇ vs C₂H₅OC₂H₅.',lbl(260,205,'same formula, different structure','font-weight="700"')]]},
 seeNote:'All pairs share a molecular formula.',
 do:{title:'Model isomers',mat:'A ball-and-stick kit or toothpicks and clay',steps:['Build all structures of C₅H₁₂.','Build two alcohols and one ether for C₃H₈O.'],obs:'3 for C₅H₁₂; 3 for C₃H₈O.',why:'Same atoms, different arrangements.',lab:false},
 memo:'"Chain, Position, Function, Meta: four ways to rearrange."',
 miscon:['"Drawing a chain bent differently makes an isomer." Bending the same chain is the same molecule.','"Isomers have the same properties." Properties can differ greatly.'],
 terms:['Structural isomerism','Chain','Position','Functional group','Metamerism','Stereoisomerism'],
 q:{q:'Ethoxyethane and methoxypropane are:',o:['chain isomers','position isomers','metamers','functional isomers'],a:2,why:'Different alkyl groups on either side of –O–.'},
 exam:'Identify the type of isomerism in given pairs: 1–2 marks.'},

{id:'o5',num:'8.7',title:'Bond fission, reaction intermediates and reagents',
 intro:'When a bond breaks, do the two electrons stay together or split up?',
 obj:'Distinguish homolytic and heterolytic fission; describe carbocations, carbanions and free radicals; classify nucleophiles and electrophiles.',
 prior:'Hybridisation.',
 simple:'In heterolytic fission both bonding electrons go to one atom, giving ions: a carbocation (C⁺, sp², planar) or a carbanion (C⁻, sp³, pyramidal). In homolytic fission each atom takes one electron, giving free radicals (unpaired electron). Nucleophiles ("nucleus-loving") are electron-rich and donate a pair; electrophiles ("electron-loving") are electron-deficient and accept a pair.',
 detail:'Curved arrows show movement of an electron pair from the bond (or lone pair) to the atom receiving it; a half-headed (fish-hook) arrow shows one electron. Carbocation stability: tertiary > secondary > primary > methyl (alkyl groups release electrons by inductive effect and hyperconjugation). Free radicals follow the same order. Carbanions are the reverse: methyl > 1° > 2° > 3°. Nucleophiles: HO⁻, NC⁻, carbanions (R₃C:⁻), and neutral molecules with lone pairs such as H₂O and R₃N:. Electrophiles: carbocations (R₃C⁺), and neutral molecules with an electron-deficient atom, e.g. the carbon of a carbonyl group (>C=O) or alkyl halides (R₃C–X).',
 real:'Every reaction mechanism in Classes 11 and 12 (halogenation, addition to alkenes, SN reactions) is built from these few ideas.',
 apply:'Classify as nucleophile or electrophile: H₂O, CH₃⁺, CN⁻, BF₃.',
 see:{w:520,h:240,f:[
  ['A C–X bond.',lbl(120,60,'R₃C','font-size="16"')+bond(150,55,200,55)+lbl(220,60,'X','font-size="16"')],
  ['Heterolytic: both electrons to X → carbocation + X⁻.',curly(175,50,215,40,-25)+lbl(120,120,'R₃C⁺  +  :X⁻','font-size="16"')+lbl(120,145,'carbocation (sp², planar)','font-size="12"')],
  ['Homolytic: one electron each → two free radicals.',lbl(380,60,'R₃C–X','font-size="16"')+lbl(380,120,'R₃C•  +  X•','font-size="16"')+lbl(380,145,'free radicals','font-size="12"')],
  ['Stability: 3° > 2° > 1° > CH₃⁺.',lbl(260,210,'carbocation: 3° > 2° > 1° > methyl','font-weight="700"')]]},
 seeNote:'Full arrows move pairs; fish-hooks move single electrons.',
 do:{title:'Arrow drill',mat:'Worksheet of bond breakings',steps:['Draw curved arrows for 5 heterolytic cleavages.','Name each intermediate.'],obs:'Arrows always start at electrons.',why:'Arrows show electron movement, not atom movement.',lab:true},
 memo:'"Nucleophile brings a pair; electrophile wants a pair."',
 miscon:['"Arrows show atoms moving." They show electrons.','"Carbanions follow the same stability order as carbocations." They are the reverse.'],
 terms:['Homolytic fission','Heterolytic fission','Carbocation','Carbanion','Free radical','Nucleophile','Electrophile'],
 q:{q:'The most stable carbocation:',o:['CH₃⁺','CH₃CH₂⁺','(CH₃)₂CH⁺','(CH₃)₃C⁺'],a:3,why:'Tertiary: most alkyl groups.'},
 exam:'Nucleophile/electrophile classification and stability orders are frequent.'},

{id:'o6',num:'8.7',title:'Electronic effects and types of reactions',
 intro:'Why is chloroacetic acid stronger than acetic acid?',
 obj:'Explain the inductive, resonance, electromeric and hyperconjugation effects, and name the main types of organic reactions.',
 prior:'Intermediates and reagents (o5).',
 simple:'Inductive effect: a permanent shift of σ-electrons along a chain towards a more electronegative atom; −I groups pull electrons (–NO₂, –CN, –COOH, –X), +I groups push (alkyl groups). Resonance: electrons in π bonds or lone pairs are delocalised over several structures (e.g. benzene); +R groups donate (–OH, –NH₂, –X), −R groups withdraw (–NO₂, –CHO, –COOH). Electromeric effect: a temporary complete shift of π electrons when an attacking reagent comes near. Hyperconjugation: delocalisation of σ C–H electrons of an alkyl group into an adjacent empty p orbital or π bond.',
 detail:'The inductive effect weakens with distance and is negligible after about three bonds. Example: ClCH₂COOH is a stronger acid than CH₃COOH because –I of Cl stabilises the anion. Resonance hybrid: the real molecule is a blend of contributing structures, more stable than any one of them; the difference in energy is the resonance energy. Conditions: same positions of atoms, same number of unpaired electrons; more stable contributors have more covalent bonds, octets, and less charge separation. Electromeric: +E when the π electrons move to the atom where the reagent attaches, −E when they move away; it lasts only while the reagent is present. Hyperconjugation is a permanent effect (no-bond resonance) and explains: carbocation stability 3° > 2° > 1° (more α-H, more hyperconjugative structures). Types of reactions: substitution, addition, elimination, rearrangement.',
 real:'Medicinal chemists add –F or –CF₃ groups (strong −I) to tune how acidic or basic a drug molecule is.',
 apply:'Arrange in order of acid strength: CH₃COOH, ClCH₂COOH, Cl₂CHCOOH, Cl₃CCOOH.',
 see:{w:520,h:240,f:[
  ['Inductive (−I): Cl pulls σ electrons along the chain; effect fades with distance.',lbl(60,60,'C₃','font-size="15"')+bond(80,55,120,55)+lbl(140,60,'C₂','font-size="15"')+bond(160,55,200,55)+lbl(220,60,'C₁','font-size="15"')+bond(240,55,280,55)+lbl(300,60,'Cl','font-size="15" font-weight="700"')+lbl(220,85,'δ+','font-size="12"')+lbl(140,85,'δδ+','font-size="12"')+lbl(300,85,'δ−','font-size="12"')],
  ['Resonance: π electrons in benzene are delocalised.',`<polygon points="400,30 440,52 440,98 400,120 360,98 360,52" fill="none" stroke="${ink}" stroke-width="2"/><circle cx="400" cy="75" r="26" fill="none" stroke="${TE}" stroke-width="2"/>`],
  ['Hyperconjugation: C–H σ electrons stabilise a neighbouring C⁺.',lbl(160,170,'H–CH₂–C⁺H₂','font-size="16"')+curly(150,160,185,160,-25)+lbl(160,205,'more α-H → more stable C⁺','font-size="12"')+lbl(400,180,'substitution · addition','font-size="12"')+lbl(400,200,'elimination · rearrangement','font-size="12"')]]},
 seeNote:'δ = partial charge.',
 do:{title:'Acid strength table',mat:'pKa values of acetic acid and its chlorinated forms (from a data book)',steps:['List pKa of CH₃COOH, ClCH₂COOH, Cl₂CHCOOH, Cl₃CCOOH.','Plot pKa against number of Cl.'],obs:'pKa falls (stronger acid) with more Cl.',why:'More −I stabilises the carboxylate ion.',lab:false},
 memo:'"I is permanent and fades; R spreads over π; E is temporary; hyperconjugation is no-bond resonance."',
 miscon:['"Resonance means the molecule flips between structures." It is one hybrid.','"Inductive effect works over the whole chain." It dies out after about three bonds.'],
 terms:['Inductive effect (±I)','Resonance (±R)','Resonance hybrid','Electromeric effect (±E)','Hyperconjugation','Substitution','Addition','Elimination','Rearrangement'],
 q:{q:'Which effect is temporary?',o:['Inductive','Resonance','Electromeric','Hyperconjugation'],a:2,why:'Only in the presence of a reagent.'},
 exam:'Explain stability/acidity using I, R or hyperconjugation: 2–3 marks.'},

{id:'o7',num:'8.8',title:'Methods of purification and chromatography',
 intro:'How do you separate the coloured dyes in a black marker ink?',
 obj:'Choose suitable purification methods and calculate Rf in chromatography.',
 prior:'Separation methods (Class 9 Ch 2).',
 simple:'Sublimation separates a solid that changes directly to vapour (e.g. camphor, naphthalene). Crystallisation uses a solvent in which the compound is soluble hot but sparingly cold. Distillation separates liquids with large boiling-point differences; fractional distillation for close boiling points; distillation under reduced pressure for liquids that decompose at their boiling point (e.g. glycerol); steam distillation for steam-volatile, water-immiscible compounds (e.g. aniline). Differential extraction uses a solvent in which the compound is more soluble. Chromatography separates by different movement between a stationary and a mobile phase.',
 detail:'Chromatography types: adsorption chromatography (column chromatography, thin layer chromatography, TLC) depends on different adsorption on an adsorbent such as silica gel or alumina; partition chromatography (paper chromatography) depends on continuous distribution between the stationary phase (water held in the paper) and the mobile phase (solvent). Retardation factor: Rf = distance moved by the substance from the base line ÷ distance moved by the solvent from the base line. Rf is between 0 and 1 and is characteristic of a substance for a given solvent and conditions. Colourless spots are made visible by UV light or iodine vapour or a spraying reagent (e.g. ninhydrin for amino acids). Purity is checked by sharp melting or boiling point.',
 real:'Forensic labs use TLC and paper chromatography to compare inks on documents and dyes in fibres.',
 apply:'A spot moves 3.6 cm while the solvent front moves 6.0 cm. Find its Rf.',
 see:{w:520,h:240,f:[
  ['Paper with a spot on the base line, dipped in solvent.',`<rect x="200" y="20" width="80" height="200" fill="#fafaf6" stroke="${ink}"/><rect x="200" y="200" width="80" height="20" fill="${BL}" opacity=".35"/><line x1="200" y1="185" x2="280" y2="185" stroke="${GR}" stroke-dasharray="3 3"/><circle cx="240" cy="185" r="6" fill="#444"/>`],
  ['Solvent rises; components separate.',`<rect x="200" y="50" width="80" height="150" fill="${BL}" opacity=".12"/><line x1="200" y1="50" x2="280" y2="50" stroke="${BL}" stroke-width="2"/><circle cx="240" cy="80" r="6" fill="#d85a30"/><circle cx="240" cy="130" r="6" fill="#378add"/><circle cx="240" cy="165" r="6" fill="#639922"/>`+lbl(320,54,'solvent front','text-anchor="start" font-size="12"')],
  ['Rf = distance of spot ÷ distance of solvent (from base line).',`<line x1="300" y1="185" x2="300" y2="80" stroke="#d85a30" stroke-width="2"/><line x1="330" y1="185" x2="330" y2="50" stroke="${BL}" stroke-width="2"/>`+lbl(420,140,'Rf = 105 ÷ 135 ≈ 0.78','font-size="13" font-weight="700"')]]},
 seeNote:'Measure both distances from the base line.',
 do:{title:'Marker-ink chromatography',mat:'Filter paper strip, black water-soluble marker, a glass with a little water',steps:['Draw a pencil base line 2 cm from the bottom and put an ink dot on it.','Dip the end in water (dot above the water).','Remove when water is near the top; mark the front; measure.'],obs:'Several coloured bands.',why:'Different dyes have different Rf.',lab:true},
 memo:'"Rf = spot over solvent, always less than 1."',
 miscon:['"Rf can be more than 1." The spot can never pass the solvent front.','"Measure from the bottom of the paper." Measure from the base line.'],
 terms:['Sublimation','Crystallisation','Fractional distillation','Steam distillation','Reduced pressure','Differential extraction','Adsorption/partition chromatography','Rf'],
 q:{q:'Glycerol is purified by:',o:['steam distillation','distillation under reduced pressure','sublimation','crystallisation'],a:1,why:'It decomposes at its boiling point.'},
 exam:'Choosing a method and Rf calculations are frequent 2–3 mark questions.'},

{id:'o8',num:'8.9–8.10',title:'Qualitative and quantitative analysis',
 intro:'How do you prove an unknown organic compound contains nitrogen, and then find what percentage?',
 obj:'Describe the detection of C, H, N, S, halogens and P, and use the formulas for percentage composition.',
 prior:'Ionic reactions; mole concept.',
 simple:'Carbon and hydrogen: heat with copper(II) oxide; CO₂ turns lime water milky and H₂O turns anhydrous copper sulphate blue. Lassaigne\'s test: fuse the compound with sodium metal so N, S and halogens become NaCN, Na₂S and NaX; then test the "sodium fusion extract". N gives Prussian blue; S gives black PbS with lead acetate or violet with sodium nitroprusside; halogens give AgX with HNO₃ + AgNO₃ (AgCl white, AgBr pale yellow, AgI yellow); P gives a yellow precipitate with ammonium molybdate.',
 detail:'If both N and S are present, NaSCN forms and gives a blood-red colour with Fe³⁺. Before testing halogens, boil with HNO₃ to decompose any cyanide or sulphide. AgCl dissolves in ammonia, AgBr only sparingly, AgI not at all. Quantitative analysis (m = mass of compound): Carbon and hydrogen (Liebig): %C = (12 × m₁ × 100)/(44 × m) with m₁ = mass of CO₂; %H = (2 × m₂ × 100)/(18 × m) with m₂ = mass of H₂O. Nitrogen: Dumas method: %N = (28 × V × 100)/(22400 × m), V = volume of N₂ at STP in mL; Kjeldahl\'s method: %N = 1.4 × M × 2(V − V₁/2)/m, where M is the molarity and V the volume (mL) of H₂SO₄ taken, and V₁ the volume of NaOH of the same molarity used to neutralise the excess acid (not applicable to nitro, azo and ring-nitrogen compounds). Halogens (Carius): %X = (atomic mass of X × m₁ × 100)/(molar mass of AgX × m). Sulphur: %S = (32 × m₁ × 100)/(233 × m), m₁ = mass of BaSO₄. Phosphorus: %P = (62 × m₁ × 100)/(222 × m), m₁ = mass of Mg₂P₂O₇. Oxygen: by difference, 100 − sum of other percentages.',
 real:'Food labs use Kjeldahl\'s method to estimate the protein content of grain from its nitrogen percentage.',
 apply:'0.246 g of a compound gave 0.198 g CO₂ and 0.1014 g H₂O. Find %C and %H.',
 see:{w:520,h:240,f:[
  ['Sodium fusion: compound + Na → NaCN, Na₂S, NaX in the extract.',lbl(260,40,'organic compound + Na  →(fuse)→  NaCN, Na₂S, NaX','font-size="13"')],
  ['Tests on the extract give coloured results.',[['N','Prussian blue','#1f3b8a'],['S','black PbS','#222'],['N + S','blood red','#a32d2d'],['Cl','white AgCl','#f1efe8'],['Br','pale yellow AgBr','#f5e6a8'],['I','yellow AgI','#f2c94c']].map(([e,t,c],i)=>`<rect x="${20+i*82}" y="80" width="60" height="80" rx="8" fill="${c}" stroke="${ink}"/>`+lbl(50+i*82,180,e,'font-weight="700"')+lbl(50+i*82,198,t,'font-size="10"')).join('')],
  ['Then quantitative: e.g. %C = 12 m(CO₂) × 100 / (44 m).',lbl(260,228,'percentages add to 100; O by difference','font-weight="700"')]]},
 seeNote:'Colours schematic.',
 do:{title:'Lime-water test (demonstration)',mat:'A candle, a glass, lime water',steps:['Hold a cold dry glass over a candle flame briefly: look for mist.','Then hold it inverted to collect gases and add lime water; shake.'],obs:'Water droplets and milky lime water.',why:'Organic fuels contain C and H.',lab:false},
 memo:'"Na fuses, Fe³⁺ blues (N), Pb blackens (S), Ag precipitates (X), molybdate yellows (P)."',
 miscon:['"Halogens can be tested without boiling off CN⁻/S²⁻." Those ions interfere.','"Kjeldahl works for all N compounds." Not for nitro, azo or ring nitrogen.'],
 terms:['Lassaigne\'s test','Sodium fusion extract','Prussian blue','Dumas method','Kjeldahl\'s method','Carius method'],
 q:{q:'In Lassaigne\'s test, nitrogen is confirmed by:',o:['black precipitate','Prussian blue colour','white precipitate','violet colour'],a:1,why:'Iron(III) ferrocyanide.'},
 exam:'Lassaigne\'s test reactions and percentage numericals (C, H, N, X, S) are 3–5 mark questions.'}
];

const CARDS=[['sp³ / sp² / sp','109.5° tetrahedral / 120° planar / 180° linear; s-character 25/33/50%.'],['Bond lengths','C–C 154, C=C 134, C≡C 120 pm.'],['Bond-line','Corners and ends = C; H implied; heteroatoms shown.'],['IUPAC name','Prefix + word root + primary suffix + secondary suffix.'],['Lowest locant','Principal functional group first, then multiple bonds, then substituents.'],['Homologous series','Members differ by –CH₂–.'],['Isomerism','Chain, position, functional, metamerism; stereo.'],['Fission','Heterolytic → ions; homolytic → free radicals.'],['Carbocation','sp², planar; 3° > 2° > 1° > methyl.'],['Carbanion','sp³, pyramidal; methyl > 1° > 2° > 3°.'],['Nucleophile','Electron-pair donor: HO⁻, CN⁻, H₂O, R₃N.'],['Electrophile','Electron-pair acceptor: R₃C⁺, >C=O carbon.'],['Inductive','Permanent σ shift; −I: NO₂, CN, COOH, X; +I: alkyl.'],['Resonance','π/lone-pair delocalisation; +R: OH, NH₂; −R: NO₂, CHO.'],['Electromeric','Temporary π shift in presence of reagent.'],['Hyperconjugation','σ C–H delocalisation; explains 3° C⁺ stability.'],['Purification','Sublimation, crystallisation, distillation types, extraction, chromatography.'],['Rf','Distance of substance ÷ distance of solvent (from base line).'],['Lassaigne','N: Prussian blue; S: black PbS / violet; N+S: blood red; X: AgX.'],['%C, %H','12m(CO₂)×100/(44m); 2m(H₂O)×100/(18m).'],['%N','Dumas 28V×100/(22400m); Kjeldahl 1.4M·2(V−V₁/2)/m.'],['%X, %S, %P','Carius: A(X)·m₁·100/(M(AgX)·m); S: 32m₁·100/(233m); P: 62m₁·100/(222m).']];

const Q=[
 {lv:1,q:'Bond angle in methane:',o:['90°','109.5°','120°','180°'],a:1,w:'sp³ tetrahedral.'},
 {lv:1,q:'Which is a nucleophile?',o:['CH₃⁺','BF₃','HO⁻','NO₂⁺'],a:2,w:'Electron-rich.'},
 {lv:1,q:'Naphthalene can be purified by:',o:['sublimation','steam distillation','chromatography only','fractional distillation'],a:0,w:'It sublimes.'},
 {lv:1,q:'IUPAC name of CH₃COCH₃:',o:['propanal','propanone','propan-2-ol','ethanone'],a:1,w:'3-C ketone.'},
 {lv:2,q:'The most electronegative carbon is the one that is:',o:['sp³','sp²','sp','all equal'],a:2,w:'50% s-character.'},
 {lv:2,q:'Propan-1-ol and propan-2-ol are:',o:['chain isomers','position isomers','functional isomers','metamers'],a:1,w:'–OH position differs.'},
 {lv:2,q:'In Lassaigne\'s test, a blood-red colour indicates:',o:['N only','S only','both N and S','halogen'],a:2,w:'SCN⁻ with Fe³⁺.'},
 {lv:3,q:'A spot moves 3.6 cm when the solvent moves 6.0 cm. Rf =',o:['0.6','1.67','0.36','2.4'],a:0,w:'3.6 ÷ 6.0.'},
 {lv:3,q:'0.246 g of a compound gives 0.198 g of CO₂. %C is about:',o:['21.95%','12.0%','44.0%','80.5%'],a:0,w:'12 × 0.198 × 100/(44 × 0.246).'},
 {lv:3,q:'Correct order of carbocation stability:',o:['CH₃⁺ > 1° > 2° > 3°','3° > 2° > 1° > CH₃⁺','2° > 3° > 1° > CH₃⁺','all equal'],a:1,w:'Inductive + hyperconjugation.'},
 {lv:4,q:'Assertion (A): ClCH₂COOH is a stronger acid than CH₃COOH. Reason (R): Cl shows −I effect.',o:['Both true and R explains A','Both true, R does not explain A','A true, R false','A false, R true'],a:0,w:'−I stabilises the anion.'},
 {lv:4,q:'Kjeldahl\'s method cannot be used for:',o:['urea','nitrobenzene','glycine','acetamide'],a:1,w:'Nitro N is not converted to (NH₄)₂SO₄.'},
 {lv:4,q:'Which separates aniline from water?',o:['sublimation','steam distillation','crystallisation','reduced-pressure distillation'],a:1,w:'Steam-volatile, immiscible.'},
 {lv:5,open:true,m:3,q:'Explain hyperconjugation and use it to explain why (CH₃)₃C⁺ is more stable than CH₃CH₂⁺.',ans:['Delocalisation of σ C–H electrons of an alkyl group into an adjacent empty p orbital (1).','(CH₃)₃C⁺ has 9 α-H; CH₃CH₂⁺ has 3 α-H (1).','More hyperconjugative structures → more dispersal of positive charge → more stable (1).']},
 {lv:5,open:true,m:3,q:'Describe Lassaigne\'s test for nitrogen with equations.',ans:['Fuse with Na: C + N + Na → NaCN (1).','Boil extract with FeSO₄, acidify with H₂SO₄; ferrocyanide forms (1).','Fe³⁺ gives Prussian blue Fe₄[Fe(CN)₆]₃ (1).']},
 {lv:5,open:true,m:4,q:'In Dumas method, 0.3 g of a compound gave 50 mL of N₂ at STP. Find %N.',ans:['%N = 28 × V × 100/(22400 × m) (1).','= 28 × 50 × 100/(22400 × 0.3) (1).','= 140000/6720 (1).','≈ 20.83% (1).']}
];

const ONEMIN=['sp³ 109.5°, sp² 120°, sp 180°; more s → shorter, stronger, more electronegative.','Bond-line: corners = C; hydrogens implied.','IUPAC: longest chain with FG; lowest locant; alphabetical prefixes.','Isomers: chain, position, functional, metamerism; stereo.','Heterolytic → ions; homolytic → radicals; C⁺: 3° > 2° > 1° > CH₃⁺.','Nucleophile donates a pair; electrophile accepts.','Inductive (permanent, σ), resonance (π), electromeric (temporary), hyperconjugation (σ C–H).','Purify: sublimation, crystallisation, distillations, extraction, chromatography; Rf = spot/solvent.','Lassaigne: N Prussian blue; S black/violet; N+S blood red; X: AgX colours.','%C, %H, %N (Dumas/Kjeldahl), %X, %S, %P formulas; O by difference.'];
const KEYS=[['hybridisation',/sp3|sp³|sp2|sp²|hybrid/i],['bond-line',/bond.?line|zig/i],['IUPAC / locant',/iupac|locant|suffix/i],['isomerism',/isomer|metamer/i],['carbocation stability',/carbocation|3°|tertiary/i],['nucleophile / electrophile',/nucleophile|electrophile/i],['inductive / resonance',/inductive|resonance/i],['hyperconjugation',/hyperconj/i],['chromatography Rf',/chromatog|rf/i],['Lassaigne / % formulas',/lassaigne|kjeldahl|dumas|carius|prussian/i]];

/* ---------- lab ---------- */
let mode='chr',tt=0,run=true,raf=null,solvent='polar';
const DYES=[['Red dye','#d85a30',{polar:0.82,non:0.25}],['Blue dye','#378add',{polar:0.5,non:0.62}],['Green dye','#639922',{polar:0.2,non:0.85}]];
const CAT=[['Methyl','CH₃⁺',0],['Primary (ethyl)','CH₃CH₂⁺',3],['Secondary (isopropyl)','(CH₃)₂CH⁺',6],['Tertiary (tert-butyl)','(CH₃)₃C⁺',9]];let ci=3;
const LAS={N:['Prussian blue','#1f3b8a','FeSO₄, then FeCl₃/H₂SO₄'],S:['Black PbS','#222','lead acetate (or violet with nitroprusside)'],NS:['Blood red','#a32d2d','FeCl₃ (SCN⁻)'],Cl:['White AgCl (dissolves in NH₃)','#f1efe8','HNO₃ + AgNO₃'],Br:['Pale yellow AgBr (sparingly soluble in NH₃)','#f5e6a8','HNO₃ + AgNO₃'],I:['Yellow AgI (insoluble in NH₃)','#f2c94c','HNO₃ + AgNO₃'],P:['Yellow ammonium phosphomolybdate','#e6c13a','oxidise; HNO₃ + ammonium molybdate']};let le='N';
function drawChr(){const f=Math.min(1,tt/6),BL0=290,TOP=40,front=BL0-(BL0-TOP)*f;let s=`<rect x="190" y="20" width="100" height="300" fill="#fafaf6" stroke="${ink}"/><rect x="190" y="300" width="100" height="20" fill="${BL}" opacity=".35"/><rect x="190" y="${front}" width="100" height="${300-front}" fill="${BL}" opacity=".1"/><line x1="190" y1="${front}" x2="290" y2="${front}" stroke="${BL}" stroke-width="2"/><line x1="190" y1="${BL0}" x2="290" y2="${BL0}" stroke="${GR}" stroke-dasharray="3 3"/>`+T(160,BL0+4,'base','font-size="11" text-anchor="end"')+T(160,front+4,'front','font-size="11" text-anchor="end"');
 const out=[];DYES.forEach(([n,c,r],i)=>{const y=BL0-(BL0-front)*r[solvent];s+=`<ellipse cx="${215+i*25}" cy="${y}" rx="8" ry="${5+6*f}" fill="${c}" opacity=".85"/>`;out.push([n,c,(BL0-y)/38,(BL0-front)/38,r[solvent]])});
 $('#oSvg').innerHTML=s;
 $('#oOut').innerHTML=`<p>Solvent front: <b>${((BL0-front)/38).toFixed(1)} cm</b> from base line</p>`+out.map(([n,c,d,sf,rf])=>`<p><span style="color:${c};font-weight:700">${n}</span>: ${d.toFixed(1)} cm → Rf = ${f>0.05?(d/sf).toFixed(2):'—'}</p>`).join('')+`<p>${solvent==='polar'?'Polar solvent: the most polar dye (red) travels furthest.':'Less polar solvent: the order changes, but each Rf is fixed for this solvent.'}</p>`}
function loop(){const sv=$('#oSvg');if(mode!=='chr'||!sv||!sv.isConnected||!sv.getClientRects().length){raf=null;return}if(run&&tt<6)tt+=1/60;drawChr();raf=requestAnimationFrame(loop)}
function drawCat(){const [n,f,a]=CAT[ci];let s='';const cx=240,cy=150;s+=`<circle cx="${cx}" cy="${cy}" r="22" fill="${TE}" opacity=".85"/>`+T(cx,cy+5,'C⁺','font-size="15" fill="#fff" font-weight="700"');
 const nR=[0,1,2,3].indexOf(a/3);for(let k=0;k<3;k++){const an=-Math.PI/2+k*2*Math.PI/3,x=cx+90*Math.cos(an),y=cy+90*Math.sin(an);const isMe=k<nR;s+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${ink}" stroke-width="2"/>`;if(isMe){s+=`<circle cx="${x}" cy="${y}" r="16" fill="#444"/>`+T(x,y+4,'CH₃','font-size="10" fill="#fff"');for(let h=0;h<3;h++){const b=an+(h-1)*0.7,hx=x+34*Math.cos(b),hy=y+34*Math.sin(b);s+=`<line x1="${x}" y1="${y}" x2="${hx}" y2="${hy}" stroke="${ink}"/><circle cx="${hx}" cy="${hy}" r="7" fill="#f2c94c" stroke="${ink}"/>`}}else s+=`<circle cx="${x}" cy="${y}" r="9" fill="#ddd" stroke="${ink}"/>`+T(x,y+4,'H','font-size="10"')}
 s+=T(240,300,'yellow = α-hydrogens available for hyperconjugation','font-size="12"');
 $('#oSvg').innerHTML=s;
 $('#oOut').innerHTML=`<p><b>${n}</b> carbocation ${f}</p><p>α-hydrogens: <b>${a}</b> → hyperconjugative structures: <b>${a}</b></p><p>Alkyl groups also push electrons by +I effect.</p><p>Stability: <b>3° > 2° > 1° > methyl</b>${ci===3?' — this is the most stable.':''}</p>`}
function drawLas(){const [r,c,reag]=LAS[le];let s=`<path d="M200 60 v200 a40 40 0 0 0 80 0 v-200" fill="none" stroke="${ink}" stroke-width="2.5"/><path d="M202 150 v110 a38 38 0 0 0 76 0 v-110z" fill="${c}" opacity=".9"/>`+T(240,330,'sodium fusion extract + reagent','font-size="12"');
 $('#oSvg').innerHTML=s;
 $('#oOut').innerHTML=`<p>Element: <b>${{N:'Nitrogen',S:'Sulphur',NS:'Nitrogen + sulphur',Cl:'Chlorine',Br:'Bromine',I:'Iodine',P:'Phosphorus'}[le]}</b></p><p>Reagent: ${reag}</p><p>Result: <b>${r}</b></p>${'ClBrI'.includes(le)&&le.length<3?'<p>Boil the extract with HNO₃ first to remove CN⁻ and S²⁻, which would interfere.</p>':''}`}
function ctl(){if(mode==='chr')return `<div class="ctrl"><label>Solvent<select id="oSol"><option value="polar" ${solvent==='polar'?'selected':''}>More polar</option><option value="non" ${solvent==='non'?'selected':''}>Less polar</option></select></label><button class="btn" id="oRun">Run again</button></div>`;
 if(mode==='cat')return `<div class="ctrl"><label>Carbocation<select id="oCat">${CAT.map((c,i)=>`<option value="${i}" ${i===ci?'selected':''}>${c[0]}</option>`).join('')}</select></label></div>`;
 return `<div class="ctrl"><label>Element present<select id="oLas">${Object.keys(LAS).map(k=>`<option value="${k}" ${k===le?'selected':''}>${k==='NS'?'N + S':k}</option>`).join('')}</select></label></div>`}
function labShow(){$('#oCtl').innerHTML=ctl();if(mode==='chr'){if(!raf)loop()}else if(mode==='cat')drawCat();else drawLas()}
function labInit(){}
function labClick(b){if(b.id==='oRun'){tt=0;return true}return false}
function labChange(t){switch(t.id){case 'oMode':mode=t.value;labShow();return true;case 'oSol':solvent=t.value;tt=0;return true;case 'oCat':ci=+t.value;drawCat();return true;case 'oLas':le=t.value;drawLas();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
