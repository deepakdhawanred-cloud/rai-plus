/* Rai Plus content pack: Class 10 Science, Chapter 4 – Carbon and its Compounds */
RP.register({key:'10sci04',cls:'10',subject:'Science',ch:'4',title:"Carbon and its Compounds",color:'#2f5d73',
crumb:"HBSE Class 10 Science · Unit: Chemical Substances · Taught in November",h1:"Chapter 4: Carbon and its Compounds",sub:"How one small atom, by sharing electrons, builds millions of compounds: fuels, alcohols, acids and soaps.",heroLabel:"A methane molecule: one carbon atom sharing electrons with four hydrogen atoms",labName:"Molecule lab",
theme:"\n:root{--g:light-dark(#2f5d73,#8cc4dc);--g2:light-dark(#e7f0f4,#122129);--line:light-dark(#cfdfe6,#24404c);--bg:light-dark(#ffffff,#0b1418);--card:light-dark(#ffffff,#0f1d23);\n--ink:light-dark(#0f1d23,#e3eef2);--mute:light-dark(#4d6470,#9db5c0);--y:light-dark(#e2a93b,#e8bb5a);--y2:light-dark(#fbf3dd,#262010);--hd:#1d3d4c}\n",
labHTML:`  <h2>Molecule lab</h2>
  <p>Turn real 3D models of carbon compounds, then build names and formulas yourself, the IUPAC way.</p>
  <div class="ftabs" role="group" aria-label="Lab tool"><button data-tool="view" aria-pressed="true">3D molecule viewer</button><button data-tool="name" aria-pressed="false">Name builder</button></div>
  <div id="t-view">
    <div class="sim"><div><div class="fig" style="max-width:none"><canvas id="molCv" width="560" height="380" style="width:100%;height:auto;display:block" aria-label="3D molecule model, drag to rotate"></canvas></div><p class="note">Drag to rotate. Grey = carbon, white = hydrogen, red = oxygen, green = chlorine. Double and triple bonds show as two or three sticks.</p></div>
    <div><div class="ctrl"><label>Molecule<select id="molSel"><option value="methane">Methane</option><option value="ethane">Ethane</option><option value="ethene">Ethene</option><option value="ethyne">Ethyne</option><option value="propane">Propane</option><option value="butane">Butane</option><option value="isobutane">Isobutane</option><option value="cyclohexane">Cyclohexane</option><option value="benzene">Benzene</option><option value="chloromethane">Chloromethane</option><option value="ethanol">Ethanol</option><option value="ethanal">Ethanal</option><option value="propanone">Propanone</option><option value="ethanoic">Ethanoic acid</option><option value="ester">Ethyl ethanoate</option></select></label></div>
    <div class="box y" id="molOut" aria-live="polite"></div></div></div>
  </div>
  <div id="t-name" hidden>
    <div class="ctrl"><label>Number of carbon atoms<select id="nC"><option value="1">1</option><option value="2" selected>2</option><option value="3">3</option><option value="4">4</option></select></label>
    <label>Type of compound<select id="fg"><option value="ane">Alkane (single bonds only)</option><option value="ene">Alkene (one double bond)</option><option value="yne">Alkyne (one triple bond)</option><option value="cl">Halo (chlorine)</option><option value="ol">Alcohol (–OH)</option><option value="al">Aldehyde (–CHO)</option><option value="one">Ketone (C=O)</option><option value="oic">Carboxylic acid (–COOH)</option></select></label></div>
    <div class="box y" id="nameOut" aria-live="polite"></div>
    <p class="note">Name = prefix for the number of carbons (meth-, eth-, prop-, but-) + an ending for the functional group. A halogen goes in front as a prefix (chloro-).</p>
  </div>
`,
build:function(){

const ACC='#2f5d73',LABNAME='Molecule lab',MIND_CENTER='Carbon compounds';
const CB='#4a4a46',HB='#ffffff',OB='#d9473f';
const atom=(x,y,el,r)=>{const c=el==='C'?CB:el==='O'?OB:el==='Cl'?'#639922':HB;const rr=r||(el==='H'?13:18);return `<circle cx="${x}" cy="${y}" r="${rr}" fill="${c}" stroke="${el==='H'?'#888780':'#2c2c2a'}" stroke-width="1.5"/>`+`<text x="${x}" y="${y+5}" text-anchor="middle" font-size="${el==='H'?12:14}" font-weight="700" fill="${el==='H'?'#2c2c2a':'#fff'}" font-family="Source Sans 3,sans-serif">${el}</text>`};
const bond=(x1,y1,x2,y2,n=1)=>{let s='';const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;for(let k=0;k<n;k++){const o=(k-(n-1)/2)*6;s+=`<line x1="${x1+nx*o}" y1="${y1+ny*o}" x2="${x2+nx*o}" y2="${y2+ny*o}" stroke="#888780" stroke-width="3"/>`}return s};
const pill=(x,y,t,c='#e7f0f4',w=120)=>`<rect x="${x-w/2}" y="${y-17}" width="${w}" height="34" rx="17" fill="${c}" stroke="#2f5d73"/>`+T(x,y+5,t,'font-size="13"');
function heroDraw(){let s=bond(180,60,120,30)+bond(180,60,240,30)+bond(180,60,120,96)+bond(180,60,240,96);s+=atom(120,30,'H')+atom(240,30,'H')+atom(120,96,'H')+atom(240,96,'H')+atom(180,60,'C',20);
 return s+`<ellipse cx="150" cy="45" rx="9" ry="5" fill="#e2a93b" opacity=".9"/><ellipse cx="210" cy="45" rx="9" ry="5" fill="#e2a93b" opacity=".9"/><ellipse cx="150" cy="78" rx="9" ry="5" fill="#e2a93b" opacity=".9"/><ellipse cx="210" cy="78" rx="9" ry="5" fill="#e2a93b" opacity=".9"/>`+T(300,64,'4 shared pairs','font-size="13"')}
const HERO=heroDraw;
const MIND=[['Covalent bonds',90,50],['Chains, rings, isomers',430,50],['Functional groups',90,150],['Homologous series and names',430,150],['Reactions',90,250],['Ethanol, ethanoic acid, soaps',430,250]];

const C=[
{id:'k1',num:'4.1',title:'Bonding in carbon: the covalent bond',
 intro:'Carbon cannot easily gain or lose four electrons. So how does it form so many compounds?',
 obj:'Explain why carbon forms covalent bonds, and draw electron-dot structures for H₂, O₂, N₂ and CH₄.',
 prior:'Electronic configuration and valency; ionic bonds (Ch 3).',
 simple:'Carbon has 4 electrons in its outer shell. To become stable it would need 4 more or 4 fewer, and both are too hard. So carbon shares electrons with other atoms. A shared pair of electrons is a covalent bond. Two shared pairs make a double bond and three make a triple bond.',
 detail:'Carbon (atomic number 6) has the configuration 2, 4. Gaining four electrons to form C⁴⁻ would be hard because six protons cannot easily hold ten electrons. Losing four to form C⁴⁺ would need a very large amount of energy. Instead carbon shares its valence electrons, forming covalent bonds. Hydrogen shares one pair (H–H). Oxygen shares two pairs (O=O, a double bond). Nitrogen shares three pairs (N≡N, a triple bond). In methane, CH₄, carbon shares one pair with each of four hydrogen atoms. Because the molecules are held together only by weak forces between them, covalent compounds generally have low melting and boiling points, and since no ions are formed they are poor conductors of electricity.',
 real:'Cooking gas (LPG) and CNG are covalent compounds of carbon and hydrogen. That is why they are gases at room temperature and do not conduct electricity.',
 apply:'Draw the electron-dot structure of ammonia, NH₃. How many shared pairs are there?',
 see:{w:520,h:240,f:[
  ['Carbon has 4 outer electrons: it needs 4 more to be stable.',atom(260,110,'C',26)+[0,1,2,3].map(i=>{const a=i*Math.PI/2+Math.PI/4;return `<circle cx="${260+Math.cos(a)*40}" cy="${110+Math.sin(a)*40}" r="5" fill="#e2a93b"/>`}).join('')],
  ['It shares one pair with each of four hydrogen atoms.',bond(260,110,180,50)+bond(260,110,340,50)+bond(260,110,180,170)+bond(260,110,340,170)+atom(180,50,'H')+atom(340,50,'H')+atom(180,170,'H')+atom(340,170,'H')],
  ['Each shared pair is one covalent bond: methane, CH₄, has four.',T(260,225,'CH₄: four single covalent bonds','font-weight="700"')]]},
 seeNote:'Electron-dot (Lewis) structures show only the outer-shell electrons.',
 do:{title:'Bead model of shared pairs',mat:'Beads or small paper circles in two colours, a sheet of paper',steps:['Draw a large circle for carbon with 4 beads of colour 1 on its edge.','Draw four small hydrogen circles, each with 1 bead of colour 2.','Overlap each hydrogen circle with carbon so one bead of each colour sits in the overlap.','Count: how many beads does carbon now "see" in its outer shell?'],obs:'Carbon sees 8 electrons and each hydrogen sees 2, so every atom has a complete shell.',why:'Shared pairs count for both atoms, which is how covalent bonding completes shells without forming ions.',lab:false},
 memo:'"C shares four, never gains or loses more."',
 miscon:['"Carbon forms ions like sodium does." It does not; it shares electrons.','"A double bond is two separate molecules." It is two shared pairs between the same two atoms.'],
 terms:['Covalent bond','Shared pair','Single, double, triple bond','Electron-dot structure'],
 q:{q:'How many shared pairs of electrons are there in an oxygen molecule, O₂?',o:['One','Two','Three','Four'],a:1,why:'O₂ has a double bond: two shared pairs.'},
 exam:'Electron-dot structures (CH₄, O₂, N₂, H₂O, NH₃) are asked almost every year for 2 marks.'},
{id:'k2',num:'4.2.1',title:'Versatile carbon: chains, branches, rings and isomers',
 intro:'Why are there millions of carbon compounds but only a few thousand of most other elements?',
 obj:'Explain catenation and tetravalency; distinguish saturated and unsaturated compounds; identify chains, branches, rings and structural isomers.',
 prior:'Covalent bonds (4.1).',
 simple:'Carbon atoms can join to other carbon atoms in long chains, branched chains and rings. This is called catenation. Each carbon also makes four bonds (tetravalency). Compounds with only single bonds between carbons are saturated; those with a double or triple bond are unsaturated. Compounds with the same formula but different structures are isomers.',
 detail:'Two properties make carbon special. Catenation: carbon forms strong bonds with other carbon atoms, giving long chains, branched chains and rings. Tetravalency: with a valency of four, each carbon can bond to four other atoms, such as carbon, hydrogen, oxygen, nitrogen, sulphur or chlorine. Compounds of carbon and hydrogen are hydrocarbons. Saturated hydrocarbons (alkanes) have only single bonds; unsaturated ones have a double bond (alkenes) or a triple bond (alkynes). Butane, C₄H₁₀, can exist as a straight chain or as a branched chain (isobutane): the same formula with different structures. These are structural isomers. Carbon can also form rings, as in cyclohexane (C₆H₁₂) and benzene (C₆H₆).',
 real:'The petrol in a scooter is a mixture of many hydrocarbons, from straight chains to branched chains and rings, all built from the same carbon skeleton idea.',
 apply:'Draw the two possible structures of C₄H₁₀. How many hydrogen atoms does each carbon carry in the straight-chain form?',
 see:{w:520,h:240,f:[
  ['Straight chain: four carbons in a row (butane).',[0,1,2,3].map(i=>atom(80+i*60,60,'C')).join('')+bond(98,60,122,60)+bond(158,60,182,60)+bond(218,60,242,60)],
  ['Branched chain: same C₄H₁₀ formula, different shape (isobutane).',bond(380,60,330,60)+bond(380,60,430,60)+bond(380,60,380,110)+atom(330,60,'C')+atom(380,60,'C')+atom(430,60,'C')+atom(380,110,'C')],
  ['Ring: six carbons joined in a closed loop (cyclohexane).',(()=>{let s='';for(let i=0;i<6;i++){const a=i*Math.PI/3,b=(i+1)*Math.PI/3;s+=bond(260+Math.cos(a)*45,185+Math.sin(a)*45,260+Math.cos(b)*45,185+Math.sin(b)*45)}for(let i=0;i<6;i++){const a=i*Math.PI/3;s+=atom(260+Math.cos(a)*45,185+Math.sin(a)*45,'C',14)}return s})()]]},
 seeNote:'Hydrogen atoms are left out so the carbon skeleton is easy to see.',
 do:{title:'Build isomers with plasticine',mat:'Plasticine or clay balls (4 large, 10 small), matchsticks or toothpicks',steps:['Make four large balls (carbon) and ten small balls (hydrogen).','Join the carbons in a straight line and add hydrogens so every carbon has four bonds.','Take it apart and join them with one carbon in the middle bonded to the other three.','Count the atoms in both models.'],obs:'Both models have 4 carbons and 10 hydrogens but different shapes.',why:'Same formula, different structure: these are structural isomers. Safety: take care with sharp toothpick ends.',lab:true},
 memo:'"Cat-enation: carbon holds hands with carbon."',
 miscon:['"Isomers are different elements." They have exactly the same atoms, arranged differently.','"Unsaturated means it has water missing." It means a double or triple bond is present.'],
 terms:['Catenation','Tetravalency','Saturated','Unsaturated','Structural isomers','Hydrocarbon'],
 q:{q:'Butane and isobutane are:',o:['Allotropes','Structural isomers','Homologues','Ions'],a:1,why:'Same formula C₄H₁₀, different structures.'},
 exam:'"Why does carbon form a large number of compounds?" (catenation + tetravalency) is a frequent 2–3 mark question.'},
{id:'k3',num:'4.2.2',title:'Functional groups',
 intro:'Swap one hydrogen for an –OH and a gas fuel becomes a liquid alcohol. Why?',
 obj:'Recognise the halo, alcohol, aldehyde, ketone and carboxylic acid groups and explain that they decide a compound\'s properties.',
 prior:'Hydrocarbons (4.2.1).',
 simple:'In a hydrocarbon, one or more hydrogens can be replaced by another atom or a group of atoms, called a heteroatom or functional group. The functional group gives the compound its special properties, whatever the length of the carbon chain.',
 detail:'Atoms such as chlorine, oxygen, nitrogen and sulphur that replace hydrogen in a hydrocarbon are heteroatoms. A heteroatom, or a group containing it, is called a functional group because it largely decides the chemical properties of the compound. Common functional groups: halo (–Cl, –Br) as in chloromethane; alcohol (–OH) as in ethanol; aldehyde (–CHO) as in ethanal; ketone (>C=O inside the chain) as in propanone; and carboxylic acid (–COOH) as in ethanoic acid. The rest of the carbon chain mainly affects physical properties such as boiling point.',
 real:'Hand sanitiser (alcohol, –OH), vinegar (carboxylic acid, –COOH) and nail-polish remover (propanone, a ketone) all smell and behave differently because of their functional groups.',
 apply:'Identify the functional group in CH₃CH₂CHO and in CH₃COCH₃.',
 see:{w:520,h:240,f:[
  ['Start with ethane: only C and H.',pill(90,50,'CH₃–CH₃','#e7f0f4',130)],
  ['Replace one H with –OH: ethanol, an alcohol.',pill(260,50,'CH₃–CH₂–OH','#fde8e6',150)+T(260,90,'alcohol','font-size="13"')],
  ['Other groups give other families: –Cl halo, –CHO aldehyde, >C=O ketone, –COOH carboxylic acid.',pill(90,170,'–Cl','#e4f1dc',80)+pill(190,170,'–CHO','#fde8e6',80)+pill(300,170,'>C=O','#fde8e6',90)+pill(420,170,'–COOH','#fde8e6',100)]]},
 seeNote:'Red-tinted labels contain oxygen.',
 do:{title:'Smell test (teacher demonstration)',mat:'Small labelled samples: dilute ethanol (sanitiser), vinegar, nail-polish remover',steps:['The teacher wafts each sample gently towards students; never sniff directly.','Note the smell and whether it evaporates quickly from a paper strip.','Match each sample to its functional group.'],obs:'Each smells and evaporates differently.',why:'Different functional groups give different properties. Safety: these liquids are flammable; keep away from flames.',lab:true},
 memo:'"Cl–OH–CHO–CO–COOH: halo, -ol, -al, -one, -oic acid."',
 miscon:['"–OH in ethanol makes it a base like NaOH." Alcohols are not bases; the –OH is covalently bonded.','"Ketone and aldehyde are the same." The C=O is at the end of the chain in an aldehyde and inside the chain in a ketone.'],
 terms:['Heteroatom','Functional group','Alcohol','Aldehyde','Ketone','Carboxylic acid'],
 q:{q:'The functional group in ethanoic acid is:',o:['–OH','–CHO','–COOH','>C=O'],a:2,why:'Carboxylic acids contain –COOH.'},
 exam:'Identify-the-functional-group and draw-the-structure questions are common 1–2 mark items.'},
{id:'k4',num:'4.2.3',title:'Homologous series',
 intro:'Methane, ethane, propane, butane… what keeps changing, and what stays the same?',
 obj:'Define a homologous series and state how the members differ in formula, mass, physical and chemical properties.',
 prior:'Alkanes, alkenes and functional groups (4.2.1–4.2.2).',
 simple:'A homologous series is a family of compounds with the same functional group, where each member differs from the next by one –CH₂– unit. Members have similar chemical properties, while physical properties like boiling point change gradually.',
 detail:'Members of a homologous series have the same general formula, for example CₙH₂ₙ₊₂ for alkanes, CₙH₂ₙ for alkenes and CₙH₂ₙ₋₂ for alkynes. Each successive member differs by –CH₂–, which means a difference of 14 u in molecular mass. Because the functional group is the same, chemical properties are similar. As the molecular mass increases, physical properties such as melting point, boiling point and solubility show a gradual change. For example, the alkanes methane, ethane, propane and butane are all gases at room temperature, and their boiling points rise as the chain gets longer.',
 real:'LPG cylinders contain mainly propane and butane, neighbours in the alkane series: similar burning, slightly different boiling points.',
 apply:'Write the formulas of the first three alkenes and check that each differs from the next by CH₂.',
 see:{w:520,h:240,f:[
  ['Methane, CH₄ (16 u).',pill(90,60,'CH₄','#e7f0f4',90)],
  ['Add –CH₂–: ethane, C₂H₆ (30 u).',pill(210,60,'C₂H₆','#e7f0f4',90)+T(150,40,'+CH₂','font-size="12"')],
  ['Add again: propane C₃H₈ (44 u), then butane C₄H₁₀ (58 u). Each step adds 14 u.',pill(330,60,'C₃H₈','#e7f0f4',90)+pill(450,60,'C₄H₁₀','#e7f0f4',90)+T(270,150,'difference of 14 u each step','font-weight="700"')]]},
 seeNote:'Molecular masses use C = 12 u and H = 1 u.',
 do:{title:'Series table',mat:'Notebook, pencil',steps:['Make a table with columns: name, formula, structure, molecular mass.','Fill in the first four alkanes, alkenes and alcohols.','Find the difference in mass between neighbours in each series.'],obs:'Every neighbour pair differs by CH₂ and 14 u.',why:'That constant step is what defines a homologous series.',lab:false},
 memo:'"Same group, step of CH₂, plus 14 each time."',
 miscon:['"Members of a series have identical physical properties." Physical properties change gradually.','"Ethene and ethane are in the same series." Ethane is an alkane; ethene is an alkene.'],
 terms:['Homologous series','General formula','–CH₂– unit','Gradation in properties'],
 q:{q:'Two neighbouring members of a homologous series differ in molecular mass by:',o:['12 u','14 u','16 u','2 u'],a:1,why:'One CH₂ = 12 + 2 = 14 u.'},
 exam:'"Define homologous series and give two characteristics" is a standard 2–3 mark question.'},
{id:'k5',num:'4.2.4',title:'Naming carbon compounds',
 intro:'Is it propanol or propanal? One letter changes the whole compound.',
 obj:'Name simple carbon compounds with up to four carbons using prefixes, suffixes and functional-group endings.',
 prior:'Functional groups (4.2.2) and homologous series (4.2.3).',
 simple:'First count the carbons in the chain: meth- (1), eth- (2), prop- (3), but- (4). Then add the ending for the type of compound: -ane, -ene, -yne for single, double and triple bonds; -ol for alcohols, -al for aldehydes, -one for ketones and -oic acid for carboxylic acids. A halogen is added in front as a prefix: chloro-, bromo-.',
 detail:'Steps: (1) identify the number of carbon atoms and choose the stem; (2) if there is a functional group, show it with a prefix or suffix; (3) when a suffix starting with a vowel is added, the final "e" of the stem is dropped, so propane + ol becomes propanol; (4) for unsaturated chains, -ane changes to -ene (double bond) or -yne (triple bond). Examples: CH₃Cl chloromethane; CH₃CH₂OH ethanol; HCHO methanal; CH₃COCH₃ propanone; CH₃COOH ethanoic acid; CH₂=CH₂ ethene; HC≡CH ethyne.',
 real:'Chemists everywhere use these same rules, so "ethanol" on a sanitiser label in India means exactly the same compound as anywhere else in the world.',
 apply:'Name: CH₃CH₂CH₂OH, CH₃CH₂CHO and CH₃CH₂Br.',
 see:{w:520,h:240,f:[
  ['Count the carbons: 3 carbons → prop-.',pill(110,60,'C–C–C','#e7f0f4',110)+T(110,105,'prop-','font-weight="700"')],
  ['Find the group: –OH → ending -ol.',pill(270,60,'–OH','#fde8e6',80)+T(270,105,'-ol','font-weight="700"')],
  ['Join them: propane + ol → propanol (drop the e).',pill(420,60,'propanol','#fbf3dd',120)+T(260,180,'stem + ending = name','font-weight="700"')]]},
 seeNote:'Try more in the Name builder in the lab.',
 do:{title:'Name card game',mat:'Index cards: stems (meth, eth, prop, but) and endings (ane, ene, yne, ol, al, one, oic acid), plus prefix chloro',steps:['Shuffle each pile.','Draw one stem and one ending; say the name aloud and write the formula.','Partner checks with the textbook; discard impossible ones (methene, methanone).'],obs:'Most combinations give a real compound; a few are impossible.',why:'A double bond needs at least two carbons; a ketone needs at least three.',lab:false},
 memo:'"Mother Eats Peanut Butter: meth, eth, prop, but."',
 miscon:['"Methene exists." A double bond needs at least two carbon atoms.','"Ethanol and ethanal are the same." -ol is an alcohol; -al is an aldehyde.'],
 terms:['Stem (prefix for carbon count)','Suffix','Prefix (chloro-, bromo-)','IUPAC naming'],
 q:{q:'The correct name of CH₃CH₂CHO is:',o:['Propanol','Propanal','Propanone','Propanoic acid'],a:1,why:'3 carbons, aldehyde group: propanal.'},
 exam:'Naming and drawing structures (up to 4 carbons) is common in 1–2 mark questions.'},
{id:'k6',num:'4.3',title:'Chemical properties: combustion, oxidation, addition, substitution',
 intro:'Why does a candle flame look yellow and sooty but a gas stove flame burns blue?',
 obj:'Describe combustion, oxidation, addition and substitution reactions of carbon compounds with equations.',
 prior:'Types of chemical reactions (Ch 1).',
 simple:'Carbon compounds burn in oxygen to give carbon dioxide, water, heat and light (combustion). Alcohols can be oxidised to acids. Unsaturated compounds add hydrogen across a double bond with a catalyst (addition). Saturated hydrocarbons swap hydrogen for chlorine in sunlight (substitution).',
 detail:'Combustion: CH₄ + 2O₂ → CO₂ + 2H₂O + heat and light. Saturated hydrocarbons generally burn with a clean blue flame; unsaturated ones give a yellow, sooty flame. Oxidation: alkaline potassium permanganate or acidified potassium dichromate (oxidising agents) convert ethanol into ethanoic acid. Addition: in the presence of a catalyst such as nickel or palladium, hydrogen adds across a double bond; this hydrogenation is used to turn vegetable oils into vegetable ghee. Animal fats are mostly saturated, and oils with unsaturated fatty acids are considered healthier. Substitution: in sunlight, chlorine replaces hydrogen atoms one at a time in saturated hydrocarbons, for example CH₄ + Cl₂ → CH₃Cl + HCl.',
 real:'A blackened cooking vessel is a sign of incomplete burning: the air holes of the stove are blocked, so the fuel is not fully burnt.',
 apply:'Why is hydrogenation of oils done with a nickel catalyst rather than by heating alone?',
 see:{w:520,h:240,f:[
  ['Combustion: methane + oxygen → carbon dioxide + water + heat.',pill(260,40,'CH₄ + 2O₂ → CO₂ + 2H₂O','#fbf3dd',260)],
  ['Addition: hydrogen adds across C=C with a Ni catalyst.',pill(260,100,'CH₂=CH₂ + H₂ → CH₃–CH₃','#e7f0f4',260)],
  ['Substitution: chlorine replaces hydrogen in sunlight. Oxidation: ethanol → ethanoic acid.',pill(260,160,'CH₄ + Cl₂ → CH₃Cl + HCl','#e4f1dc',260)+pill(260,215,'ethanol → ethanoic acid','#fde8e6',260)]]},
 seeNote:'Equations as in the NCERT textbook.',
 do:{title:'Flame comparison (teacher demonstration)',mat:'Spirit lamp, candle, a steel plate held with tongs',steps:['Hold the plate briefly over the spirit lamp flame, then over the candle flame.','Compare the deposits on the plate.','Observe the colour of each flame.'],obs:'The spirit lamp gives a clean blue flame and little soot; the candle gives a yellow flame and black soot.',why:'Complete combustion gives a blue flame; incomplete combustion leaves unburnt carbon as soot. Safety: tongs and teacher supervision only.',lab:true},
 memo:'"Burn, Oxidise, Add, Swap."',
 miscon:['"All combustion is clean." Incomplete combustion makes soot and carbon monoxide.','"Addition removes atoms." Addition puts atoms onto a double bond; substitution swaps them.'],
 terms:['Combustion','Oxidising agent','Addition reaction','Catalyst','Hydrogenation','Substitution reaction'],
 q:{q:'Converting vegetable oil to vegetable ghee is an example of:',o:['Substitution','Addition (hydrogenation)','Combustion','Oxidation'],a:1,why:'Hydrogen adds across C=C with a nickel catalyst.'},
 exam:'Equations and identifying the reaction type are asked often; the blue vs sooty flame question is a favourite.'},
{id:'k7',num:'4.4',title:'Ethanol and ethanoic acid',
 intro:'One is in sanitiser, the other in vinegar. Together they make a fruity-smelling ester.',
 obj:'State the properties and reactions of ethanol and ethanoic acid, including esterification and saponification.',
 prior:'Functional groups (4.2.2); acids and bases (Ch 2).',
 simple:'Ethanol is a liquid alcohol; it reacts with sodium to give hydrogen gas, and hot concentrated sulphuric acid turns it into ethene. Ethanoic acid is a weak acid: vinegar is a 5–8% solution of it in water. An acid and an alcohol react to form a sweet-smelling ester.',
 detail:'Ethanol (C₂H₅OH): 2Na + 2CH₃CH₂OH → 2CH₃CH₂ONa + H₂; heating with excess concentrated H₂SO₄ at 443 K removes water to give ethene, CH₂=CH₂. Ethanoic acid (CH₃COOH): a weak carboxylic acid; its melting point is 290 K, so pure acid often freezes in cold weather and is called glacial acetic acid. Esterification: CH₃COOH + CH₃CH₂OH → CH₃COOCH₂CH₃ + H₂O, in the presence of an acid catalyst; esters smell sweet and are used in perfumes and flavours. Saponification: an ester reacts with sodium hydroxide to give back the alcohol and the sodium salt of the acid; this reaction is used to make soap. Ethanoic acid reacts with bases (NaOH → CH₃COONa + H₂O) and with carbonates and hydrogencarbonates, giving a salt, water and carbon dioxide.',
 real:'The pickle in your kitchen keeps for months because the vinegar (ethanoic acid) stops microbes growing.',
 apply:'How would you show, using sodium hydrogencarbonate, which of two colourless liquids is ethanoic acid and which is ethanol?',
 see:{w:520,h:240,f:[
  ['Ethanoic acid (vinegar) + ethanol (alcohol).',pill(130,60,'CH₃COOH','#fde8e6',130)+T(225,65,'+','font-weight="700"')+pill(320,60,'C₂H₅OH','#e7f0f4',120)],
  ['With an acid catalyst they form an ester and water.',pill(260,140,'CH₃COOC₂H₅ + H₂O','#fbf3dd',220)],
  ['The ester smells sweet and fruity: used in perfumes and flavours.',T(260,210,'esterification','font-weight="700"')]]},
 seeNote:'Saponification runs the other way with NaOH and gives soap.',
 do:{title:'Esterification (teacher demonstration)',mat:'Ethanol, glacial ethanoic acid, a few drops of concentrated sulphuric acid, test tube, warm water bath, beaker of water',steps:['The teacher mixes 1 mL ethanol and 1 mL glacial ethanoic acid with a few drops of concentrated H₂SO₄.','Warm in a water bath for 5 minutes.','Pour into a beaker of water and smell gently by wafting.'],obs:'A sweet, fruity smell.',why:'An ester forms. Safety: concentrated acid is corrosive; only the teacher handles it.',lab:true},
 memo:'"Acid + alcohol → ester + water (sweet smell)."',
 miscon:['"Vinegar is pure ethanoic acid." It is a 5–8% solution in water.','"Glacial acetic acid is frozen water." It is pure ethanoic acid that freezes at 290 K.'],
 terms:['Ethanol','Ethanoic acid','Glacial acetic acid','Esterification','Ester','Saponification'],
 q:{q:'Which gas is given off when ethanoic acid reacts with sodium carbonate?',o:['Hydrogen','Oxygen','Carbon dioxide','Methane'],a:2,why:'Acids + carbonates → salt + water + CO₂.'},
 exam:'Reactions of ethanol and ethanoic acid with equations carry 3–5 marks; esterification is the most asked.'},
{id:'k8',num:'4.5',title:'Soaps and detergents',
 intro:'Water alone cannot wash oil off your hands. What does soap do?',
 obj:'Explain the structure of a soap molecule, how micelles remove oily dirt, and why detergents work in hard water.',
 prior:'Esters and saponification (4.4); hard water.',
 simple:'A soap molecule has two ends: an ionic head that likes water and a long hydrocarbon tail that likes oil. In water, the tails stick into the oil drop and the heads face the water, forming a ball called a micelle. Rinsing washes the micelles, and the dirt, away.',
 detail:'Soaps are sodium or potassium salts of long-chain carboxylic acids. The ionic end is hydrophilic (water-loving) and the long hydrocarbon chain is hydrophobic (water-repelling, oil-loving). In water, soap molecules arrange themselves so the tails point inward into the oily dirt and the ionic ends face the water, forming clusters called micelles. Micelles stay suspended, so the oily dirt is lifted off and rinsed away. In hard water, calcium and magnesium salts react with soap to form an insoluble, sticky precipitate called scum, wasting soap. Detergents are generally ammonium or sulphonate salts of long-chain carboxylic acids. Their charged ends do not form insoluble precipitates with calcium and magnesium ions, so they work in hard water too.',
 real:'In areas with hard tube-well water, bathing soap barely lathers and leaves a ring in the bucket, while washing powder (a detergent) still lathers well.',
 apply:'A shirt washed with soap in hard water feels stiff and dull. Explain why and suggest a fix.',
 see:{w:520,h:240,f:[
  ['A soap molecule: a water-loving head and an oil-loving tail.',`<line x1="60" y1="60" x2="160" y2="60" stroke="#4a4a46" stroke-width="5" stroke-linecap="round"/><circle cx="172" cy="60" r="12" fill="#d9473f"/>`+T(110,95,'tail (oil-loving)','font-size="12"')+T(190,40,'head','font-size="12"')],
  ['Many molecules surround an oil drop, tails inward.',(()=>{let s='<circle cx="370" cy="130" r="38" fill="#e2a93b" opacity=".85"/>';for(let i=0;i<14;i++){const a=i/14*Math.PI*2;s+=`<line x1="${370+Math.cos(a)*30}" y1="${130+Math.sin(a)*30}" x2="${370+Math.cos(a)*64}" y2="${130+Math.sin(a)*64}" stroke="#4a4a46" stroke-width="3"/><circle cx="${370+Math.cos(a)*70}" cy="${130+Math.sin(a)*70}" r="7" fill="#d9473f"/>`}return s})()],
  ['This cluster is a micelle: it is rinsed away, taking the oil with it.',T(370,228,'micelle','font-weight="700"')]]},
 seeNote:'Not to scale: a real micelle is far too small to see.',
 do:{title:'Soap in soft and hard water',mat:'Two test tubes, distilled or rain water, hard water (tap water with a pinch of calcium chloride or Epsom salt), soap solution, detergent solution',steps:['Put 10 mL of each water in separate tubes.','Add 5 drops of soap solution to each; shake for 30 seconds.','Note the foam height; repeat with detergent.'],obs:'Soap foams well in soft water but forms scum in hard water; detergent foams in both.',why:'Calcium and magnesium ions form insoluble scum with soap but not with detergents.',lab:true},
 memo:'"Head in water, tail in oil, rinse away the soil."',
 miscon:['"Soap dissolves the dirt." It traps oily dirt in micelles that water carries away.','"Detergents and soaps are the same chemical." Detergents are different salts that do not form scum.'],
 terms:['Soap','Hydrophilic','Hydrophobic','Micelle','Scum','Detergent','Hard water'],
 q:{q:'Detergents work better than soaps in hard water because:',o:['They are coloured','They do not form insoluble scum with Ca²⁺ and Mg²⁺','They are acids','They dissolve oil directly'],a:1,why:'Detergent salts stay soluble with calcium and magnesium ions.'},
 exam:'"Explain the cleaning action of soap with a diagram of a micelle" is a classic 3–5 mark question.'}
];

const CARDS=[['Covalent bond','A bond formed by sharing a pair of electrons between two atoms.'],['Why carbon shares','Gaining or losing 4 electrons is too hard; sharing completes its shell.'],['Catenation','Carbon’s ability to bond with other carbon atoms in chains, branches and rings.'],['Tetravalency','Carbon forms four bonds.'],['Saturated vs unsaturated','Only single C–C bonds vs at least one double or triple bond.'],['Structural isomers','Same molecular formula, different structure, e.g. butane and isobutane.'],['Functional group','Heteroatom or group that decides a compound’s chemical properties.'],['–OH, –CHO, >C=O, –COOH','Alcohol, aldehyde, ketone, carboxylic acid.'],['Homologous series','Same functional group; neighbours differ by –CH₂– (14 u).'],['meth, eth, prop, but','Stems for 1, 2, 3, 4 carbon atoms.'],['Combustion','Burning in oxygen: CO₂ + H₂O + heat and light.'],['Addition reaction','Atoms add across a double bond, e.g. hydrogenation with Ni catalyst.'],['Substitution reaction','An atom replaces hydrogen, e.g. CH₄ + Cl₂ → CH₃Cl + HCl in sunlight.'],['Ethanol + sodium','Gives sodium ethoxide and hydrogen gas.'],['Glacial acetic acid','Pure ethanoic acid; freezes at 290 K.'],['Esterification','Acid + alcohol → ester + water, with an acid catalyst.'],['Saponification','Ester + NaOH → alcohol + sodium salt of acid; used to make soap.'],['Micelle','Cluster of soap molecules with tails inside around oil and heads outside in water.'],['Scum','Insoluble precipitate of soap with Ca²⁺ and Mg²⁺ in hard water.']];

const Q=[
 {lv:1,q:'The electronic configuration of carbon is:',o:['2, 6','2, 4','2, 8, 4','2, 2'],a:1,w:'Carbon (Z = 6): 2, 4.'},
 {lv:1,q:'The bond in a nitrogen molecule, N₂, is a:',o:['Single bond','Double bond','Triple bond','Ionic bond'],a:2,w:'N≡N: three shared pairs.'},
 {lv:1,q:'Which of these is an unsaturated hydrocarbon?',o:['Methane','Ethane','Ethene','Propane'],a:2,w:'Ethene has a C=C double bond.'},
 {lv:1,q:'True or false: covalent compounds are generally good conductors of electricity.',o:['True','False'],a:1,w:'False: they form no ions.'},
 {lv:1,q:'Vinegar is a dilute solution of:',o:['Ethanol','Methanoic acid','Ethanoic acid','Propanone'],a:2,w:'5–8% ethanoic acid in water.'},
 {lv:2,q:'Neighbouring members of a homologous series differ by:',o:['–CH–','–CH₂–','–CH₃','–C₂H₄–'],a:1,w:'One –CH₂– unit, 14 u.'},
 {lv:2,q:'The name of CH₃COCH₃ is:',o:['Propanal','Propanol','Propanone','Ethanoic acid'],a:2,w:'3 carbons, ketone group.'},
 {lv:2,q:'Hydrogenation of vegetable oils needs:',o:['Sunlight','A nickel catalyst','Concentrated H₂SO₄','Sodium metal'],a:1,w:'Ni (or Pd) catalyses the addition of H₂.'},
 {lv:2,q:'Why does a yellow, sooty flame appear when burning unsaturated hydrocarbons?',o:['They contain sodium','Combustion is incomplete','They are acids','They contain oxygen'],a:1,w:'Incomplete combustion leaves unburnt carbon.'},
 {lv:3,q:'An organic liquid X reacts with sodium hydrogencarbonate giving brisk effervescence. X is most likely:',o:['Ethanol','Ethanoic acid','Propanone','Ethane'],a:1,w:'Carboxylic acids release CO₂ with hydrogencarbonates.'},
 {lv:3,q:'Ethanol heated with excess hot concentrated H₂SO₄ at 443 K gives:',o:['Ethanoic acid','Ethene','Ethane','Ethyl ethanoate'],a:1,w:'Dehydration removes water, giving ethene.'},
 {lv:3,q:'Which reaction is used to make soap?',o:['Esterification','Saponification','Substitution','Combustion'],a:1,w:'Ester + NaOH → soap (salt) + alcohol.'},
 {lv:4,q:'Assertion (A): Carbon forms a very large number of compounds. Reason (R): Carbon shows catenation and tetravalency.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'These two properties explain the variety.'},
 {lv:4,q:'Assertion (A): Soaps are ineffective in hard water. Reason (R): Soaps form insoluble scum with calcium and magnesium ions.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'Scum formation wastes the soap.'},
 {lv:4,q:'A compound C₃H₆ decolourises bromine water. Which family does it belong to?',o:['Alkane','Alkene','Alkyne','Alcohol'],a:1,w:'CₙH₂ₙ with a double bond: propene, an alkene.'},
 {lv:5,open:true,m:3,q:'Why does carbon form covalent bonds? Draw the electron-dot structure of methane.',ans:['Carbon has 4 valence electrons (2, 4) (1).','Gaining 4 (C⁴⁻) or losing 4 (C⁴⁺) is difficult, so it shares electrons (1).','Correct dot structure of CH₄ with four shared pairs (1).']},
 {lv:5,open:true,m:3,q:'What is a homologous series? Give two characteristics with an example.',ans:['Series of compounds with the same functional group, successive members differing by –CH₂– (1).','Same general formula and similar chemical properties; mass differs by 14 u (1).','Gradual change in physical properties; example: methane, ethane, propane (1).']},
 {lv:5,open:true,m:5,q:'Describe esterification and saponification with equations. Give one use of each.',ans:['Esterification: CH₃COOH + C₂H₅OH → CH₃COOC₂H₅ + H₂O, with acid catalyst (2).','Use: esters in perfumes and flavourings (0.5).','Saponification: CH₃COOC₂H₅ + NaOH → CH₃COONa + C₂H₅OH (2).','Use: making soap (0.5).']},
 {lv:5,open:true,m:5,q:'Explain the cleaning action of soap. Why do detergents work in hard water when soaps do not?',ans:['Soap: ionic head (hydrophilic) and hydrocarbon tail (hydrophobic) (1).','Tails enter oil, heads face water, forming micelles (1); labelled diagram (1).','Micelles are rinsed away with the dirt (1).','Hard water Ca²⁺/Mg²⁺ form scum with soap; detergents’ salts do not (1).']}
];

const ONEMIN=['Carbon (2, 4) shares electrons: covalent bonds; single, double, triple bonds.','Covalent compounds: low melting and boiling points, poor conductors.','Catenation + tetravalency → chains, branches, rings, isomers (butane, isobutane).','Saturated = single bonds only; unsaturated = double or triple bond.','Functional groups: –Cl, –OH, –CHO, >C=O, –COOH decide the properties.','Homologous series: same group, differ by –CH₂– (14 u), gradual physical change.','Names: meth, eth, prop, but + ane/ene/yne/ol/al/one/oic acid; chloro- prefix.','Reactions: combustion, oxidation (KMnO₄/K₂Cr₂O₇), addition (H₂, Ni), substitution (Cl₂, sunlight).','Ethanol + Na → H₂; + conc H₂SO₄ at 443 K → ethene.','Ethanoic acid: vinegar 5–8%, glacial at 290 K; + alcohol → ester; + carbonate → CO₂.','Soap: head in water, tail in oil → micelle; hard water gives scum; detergents work.'];
const KEYS=[['covalent bond',/covalent|shar/i],['valency four / tetravalency',/tetraval|four bonds|valency.*4/i],['catenation',/catenat|chain/i],['isomers',/isomer/i],['saturated and unsaturated',/saturat/i],['functional group',/functional/i],['homologous series',/homolog|CH2|CH₂/i],['naming (meth, eth…)',/meth|eth|prop|but/i],['combustion',/combust|burn/i],['addition / hydrogenation',/addition|hydrogenat/i],['substitution',/substitut/i],['ethanoic acid / vinegar',/ethanoic|vinegar|acetic/i],['esterification',/ester/i],['micelle / soap',/micelle|soap/i],['detergent / hard water',/detergent|hard water|scum/i]];

/* ---------- lab ---------- */
let tool='view',viewer=null;
const STEM=['','meth','eth','prop','but'];
function sub(n){return String(n).split('').map(d=>'₀₁₂₃₄₅₆₇₈₉'[d]).join('')}
function f(n,h,extra=''){return 'C'+(n>1?sub(n):'')+'H'+(h>1?sub(h):'')+extra}
function nameIt(n,g){const st=STEM[n];
 if((g==='ene'||g==='yne')&&n<2)return{bad:`A ${g==='ene'?'double':'triple'} bond needs at least two carbon atoms, so there is no "${st}${g}".`};
 if(g==='one'&&n<3)return{bad:'A ketone needs its C=O inside the chain, so it needs at least three carbon atoms.'};
 const R={ane:[st+'ane',f(n,2*n+2),'alkane: saturated, single bonds only'],ene:[st+'ene',f(n,2*n),'alkene: one C=C double bond'],yne:[st+'yne',f(n,2*n-2),'alkyne: one C≡C triple bond'],
  cl:['chloro'+st+'ane',f(n,2*n+1,'Cl'),'halo compound: Cl replaces one H'],ol:[st+'anol',f(n,2*n+1,'OH'),'alcohol: –OH group'],
  al:[st+'anal',n===1?'HCHO':(n===2?'CH₃CHO':f(n-1,2*n-1,'CHO')),'aldehyde: –CHO at the end of the chain'],
  one:[st+'anone',n===3?'CH₃COCH₃':'CH₃COCH₂CH₃','ketone: C=O inside the chain'],
  oic:[st+'anoic acid',n===1?'HCOOH':(n===2?'CH₃COOH':f(n-1,2*n-1,'COOH')),'carboxylic acid: –COOH group']}[g];
 return{name:R[0],formula:R[1],note:R[2]}}
function nameDraw(){const r=nameIt(+$('#nC').value,$('#fg').value);$('#nameOut').innerHTML=r.bad?`<p class="fb no">${esc(r.bad)}</p>`:`<h3 style="margin:0">${esc(r.name)}</h3><p style="font-size:20px;margin:.2em 0">${esc(r.formula)}</p><p class="note">${esc(r.note)}. Stem "${STEM[+$('#nC').value]}-" means ${$('#nC').value} carbon atom${$('#nC').value>1?'s':''}.</p>`}
function molInfo(){const k=$('#molSel').value,c=MOL3D.count(k);$('#molOut').innerHTML=`<h3 style="margin:0">${esc(MOL3D.MOLS[k].name)}</h3><p>${Object.entries(c).map(([e,n])=>`${n} ${e==='C'?'carbon':e==='H'?'hydrogen':e==='O'?'oxygen':e==='Cl'?'chlorine':e}`).join(', ')} atoms.</p>`}
function labInit(){}
function labShow(){if(tool==='view'){if(!viewer&&window.MOL3D){viewer=MOL3D.view($('#molCv'),$('#molSel').value)}molInfo()}else nameDraw()}
function labClick(b){if(b.dataset.tool){tool=b.dataset.tool;$$('[data-tool]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.tool===tool));['view','name'].forEach(t=>$('#t-'+t).hidden=t!==tool);labShow();return true}return false}
function labChange(t){if(t.id==='molSel'){if(viewer)viewer.set(t.value);molInfo();return true}if(t.id==='nC'||t.id==='fg'){nameDraw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
