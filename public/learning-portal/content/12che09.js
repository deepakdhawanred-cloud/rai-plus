/* Rai Plus content pack: Class 12 Chemistry, Chapter 9 – Amines (with diazonium salts) */
RP.register({key:'12che09',cls:'12',subject:'Chemistry',ch:'9',title:"Amines",color:'#2b5f7a',
crumb:"HBSE Class 12 Chemistry · Unit 9 · Taught in December",h1:"Chapter 9: Amines",sub:"Organic derivatives of ammonia: how to name, make and test them, why they are bases, and how diazonium salts build dyes and aromatic compounds.",heroLabel:"A nitrogen atom with its lone pair and an azo dye",labName:'Amine test lab',
theme:"\n:root{--g:light-dark(#2b5f7a,#9cd0ea);--g2:light-dark(#e9f3f8,#0c1a22);--line:light-dark(#cfe2ec,#22394a);--bg:light-dark(#ffffff,#091117);--card:light-dark(#ffffff,#0e1820);\n--ink:light-dark(#0e1a22,#e2eef5);--mute:light-dark(#4b616e,#a4bac7);--y:light-dark(#b3541e,#f2a774);--y2:light-dark(#fbeee4,#2a170a);--hd:#1f465c}\n",
labHTML:`  <h2>Amine test lab</h2>
  <div class="ctrl"><label>Activity<select id="aMode"><option value="test">Identify 1°, 2°, 3° amines</option><option value="base">Basic strength (pKb)</option></select></label></div>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="aSvg" viewBox="0 0 480 330" role="img" aria-label="Amine lab" style="color:var(--ink)"></svg></div></div>
  <div><div id="aCtl"></div><div class="box y" id="aOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#2b5f7a',LABNAME='Amine test lab',MIND_CENTER='Amines';
const BL='#2b5f7a',OR='#b3541e',GR='#888780',GN='#3b6d11',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,'font-size="14" '+o);
const ring=(cx,cy,r=30)=>{let p='';for(let i=0;i<6;i++){const a=Math.PI/6+i*Math.PI/3;p+=(i?'L':'M')+(cx+r*Math.cos(a)).toFixed(1)+' '+(cy+r*Math.sin(a)).toFixed(1)}return `<path d="${p}Z" fill="none" stroke="${ink}" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${r*0.6}" fill="none" stroke="${ink}" stroke-width="1.5"/>`};
const arrow=(x1,y,x2,t='')=>`<line x1="${x1}" y1="${y}" x2="${x2-6}" y2="${y}" stroke="${ink}" stroke-width="2"/><path d="M${x2-10} ${y-5} L${x2} ${y} L${x2-10} ${y+5}Z" fill="${ink}"/>`+(t?T((x1+x2)/2,y-8,t,'font-size="11"'):'');
function heroDraw(){return `<circle cx="70" cy="70" r="16" fill="#fff" opacity=".85"/><text x="70" y="76" font-size="16" text-anchor="middle" fill="#1f465c" font-weight="700">N</text><ellipse cx="70" cy="40" rx="6" ry="9" fill="#fff" opacity=".7"/><path d="M150 70 h30 M185 65 l10 10 M185 75 l10 -10" stroke="#fff" stroke-width="3"/><rect x="210" y="45" width="60" height="50" rx="10" fill="#f2a774" opacity=".9"/>`}
const HERO=heroDraw;
const MIND=[['Structure & classification',100,50],['Naming',420,50],['Preparation',90,150],['Basicity',430,150],['Reactions & tests',110,250],['Diazonium salts',410,250]];

const C=[
{id:'a1',num:'9.1–9.3',title:'Structure, classification and naming',
 intro:'Replace one, two or three hydrogens of ammonia with carbon groups. What do you get?',
 obj:'Describe the structure of amines; classify them as primary, secondary or tertiary; name them by common and IUPAC systems.',
 prior:'Ammonia; hybridisation; IUPAC rules (Class 11).',
 simple:'Amines are derivatives of ammonia in which hydrogen atoms are replaced by alkyl or aryl groups. One replaced: primary (RNH₂), two: secondary (R₂NH), three: tertiary (R₃N). Nitrogen is sp³ hybridised with a lone pair, so amines are pyramidal; in trimethylamine the C–N–C angle is about 108°.',
 detail:'Aliphatic amines have N attached to an alkyl carbon; aromatic amines (arylamines) have N attached directly to a benzene ring, e.g. aniline C₆H₅NH₂ (benzenamine). Amines with all groups the same are simple; otherwise mixed. Common names: alkyl + amine, e.g. methylamine, dimethylamine. IUPAC: replace -e of the alkane with -amine: CH₃NH₂ methanamine, CH₃CH₂CH₂NH₂ propan-1-amine, CH₃CH(NH₂)CH₃ propan-2-amine. For secondary and tertiary amines, the largest group gives the parent name and others are prefixed with N-: CH₃NHC₂H₅ is N-methylethanamine; (CH₃)₂NC₂H₅ is N,N-dimethylethanamine. Diamines: H₂N–CH₂CH₂–NH₂ ethane-1,2-diamine. Aromatic: C₆H₅NH₂ aniline/benzenamine; C₆H₅NHCH₃ N-methylaniline; p-bromoaniline is 4-bromobenzenamine.',
 real:'Amines occur in nature in proteins, vitamins, alkaloids and hormones; adrenaline and ephedrine are amines.',
 apply:'Classify and give IUPAC names: (CH₃)₃N, CH₃CH₂NHCH₃, (CH₃)₂CHNH₂.',
 see:{w:520,h:220,f:[
  ['Ammonia: N with three H and a lone pair (pyramidal).',lbl(80,100,'N','font-size="22" font-weight="700"')+`<ellipse cx="80" cy="68" rx="7" ry="11" fill="${BL}" opacity=".35"/>`+lbl(50,140,'H','font-size="14"')+lbl(110,140,'H','font-size="14"')+lbl(80,150,'H','font-size="14"')],
  ['Primary RNH₂ · Secondary R₂NH · Tertiary R₃N.',lbl(260,70,'1°: CH₃–NH₂','font-size="15"')+lbl(260,110,'2°: (CH₃)₂NH','font-size="15"')+lbl(260,150,'3°: (CH₃)₃N','font-size="15"')],
  ['Aromatic amine: aniline (benzenamine).',ring(440,110)+`<line x1="440" y1="80" x2="440" y2="55" stroke="${ink}" stroke-width="2"/>`+lbl(440,48,'NH₂','font-size="14"')]]},
 seeNote:'1°, 2°, 3° count groups on N, not on the carbon.',
 do:{title:'Name drill',mat:'Cards with 8 amine formulas',steps:['Mark 1°, 2° or 3°.','Find the parent alkyl group.','Write the IUPAC name with N- prefixes.'],obs:'Names follow a fixed pattern.',why:'IUPAC rules.',lab:false},
 memo:'"Count the carbons on N: one, two, three = 1°, 2°, 3°."',
 miscon:['"(CH₃)₂CHNH₂ is secondary because the carbon is secondary." It is a primary amine (one group on N).','"Amines are planar like ammonium." They are pyramidal.'],
 terms:['Primary/secondary/tertiary amine','Arylamine','Aniline (benzenamine)','N-prefix','Pyramidal'],
 q:{q:'CH₃NHC₂H₅ is named:',o:['ethylmethanamine','N-methylethanamine','N-ethylmethanamine','propan-1-amine'],a:1,why:'Larger group is the parent.'},
 exam:'Naming and classifying amines: 1–2 marks.'},

{id:'a2',num:'9.4',title:'Preparation of amines',
 intro:'How do you put an NH₂ group onto a carbon chain, and how can you remove a carbon at the same time?',
 obj:'Describe the main methods of preparing amines and their limitations.',
 prior:'Reduction; nucleophilic substitution (haloalkanes).',
 simple:'Main methods: (1) reduction of nitro compounds (H₂/Pd, or Sn/HCl or Fe/HCl) — Fe/HCl is preferred; (2) ammonolysis of alkyl halides with NH₃ (gives a mixture of 1°, 2°, 3° amines and quaternary salt); (3) reduction of nitriles (LiAlH₄ or H₂/Ni) — adds one carbon; (4) reduction of amides with LiAlH₄; (5) Gabriel phthalimide synthesis — pure primary aliphatic amines; (6) Hoffmann bromamide degradation — amine with one carbon less than the amide.',
 detail:'Reduction of nitrobenzene with Fe scrap and HCl is preferred because FeCl₂ formed is hydrolysed, releasing HCl, so only a small amount of acid is needed. Ammonolysis: R–X + NH₃ → RNH₂ (+ further alkylation); using a large excess of NH₃ favours the primary amine; it is not suitable for arylamines. Nitrile reduction: R–C≡N + 4[H] → R–CH₂NH₂ (chain ascent). Amide reduction: R–CONH₂ → R–CH₂NH₂ with LiAlH₄ then H₂O. Gabriel: phthalimide + ethanolic KOH → potassium phthalimide; + alkyl halide → N-alkylphthalimide; alkaline hydrolysis → primary amine. Aromatic primary amines cannot be made this way, because aryl halides do not undergo nucleophilic substitution with the phthalimide anion. Hoffmann bromamide: RCONH₂ + Br₂ + 4NaOH → RNH₂ + Na₂CO₃ + 2NaBr + 2H₂O; the alkyl or aryl group migrates from the carbonyl carbon to nitrogen, so the amine has one carbon less.',
 real:'Aniline for dyes and drugs is made industrially by reducing nitrobenzene.',
 apply:'How will you convert ethanoic acid into methanamine?',
 see:{w:520,h:230,f:[
  ['Nitrobenzene → aniline (Fe/HCl or Sn/HCl).',ring(60,60,24)+lbl(60,22,'NO₂','font-size="12"')+arrow(100,60,190,'Fe/HCl')+ring(230,60,24)+lbl(230,22,'NH₂','font-size="12"')],
  ['Hoffmann bromamide: one carbon fewer.',lbl(90,140,'RCONH₂','font-size="14"')+arrow(140,135,330,'Br₂ + 4NaOH')+lbl(370,140,'RNH₂','font-size="14"')],
  ['Gabriel synthesis: only primary aliphatic amines. Nitrile reduction: one carbon more.',lbl(260,200,'R–C≡N  →(LiAlH₄)→  R–CH₂–NH₂','font-size="13"')]]},
 seeNote:'Watch the carbon count: −1 (Hoffmann), +1 (nitrile route).',
 do:{title:'Carbon-count puzzle',mat:'Worksheet',steps:['For each target amine, decide: keep, add or remove a carbon?','Choose: nitro reduction, nitrile route or Hoffmann.'],obs:'The carbon count tells you the method.',why:'Each method changes chain length differently.',lab:false},
 memo:'"Hoffmann Hacks one carbon; Nitrile Nudges one on."',
 miscon:['"Gabriel synthesis makes aniline." It cannot make aryl amines.','"Ammonolysis gives only primary amine." It gives a mixture.'],
 terms:['Reduction','Ammonolysis','Gabriel phthalimide synthesis','Hoffmann bromamide degradation','Chain ascent/descent'],
 q:{q:'Hoffmann bromamide degradation of propanamide gives:',o:['propanamine','ethanamine','butanamine','methanamine'],a:1,why:'One carbon less.'},
 exam:'Named reactions (Gabriel, Hoffmann) with equations: 2–3 marks.'},

{id:'a3',num:'9.5–9.6',title:'Physical properties and basic character',
 intro:'Methylamine smells fishy and dissolves in water. Why is aniline such a weak base compared with it?',
 obj:'Explain solubility and boiling points of amines and compare their basic strengths using pK_b.',
 prior:'Hydrogen bonding; inductive and resonance effects.',
 simple:'Lower aliphatic amines are gases or volatile liquids with a fishy smell, soluble in water by hydrogen bonding. Boiling points: 1° > 2° > 3° (tertiary amines have no N–H for H-bonding). Amines are bases because of the lone pair on N: RNH₂ + H₂O ⇌ RNH₃⁺ + OH⁻. Smaller pK_b = stronger base. Alkyl groups (+I) make aliphatic amines stronger bases than NH₃; aryl amines are much weaker because the lone pair is delocalised into the ring.',
 detail:'pK_b values (in water): NH₃ 4.75; CH₃NH₂ 3.38; (CH₃)₂NH 3.27; (CH₃)₃N 4.22; C₂H₅NH₂ 3.29; (C₂H₅)₂NH 3.00; (C₂H₅)₃N 3.25; C₆H₅NH₂ 9.38. In the gas phase the order is 3° > 2° > 1° > NH₃ (inductive effect only). In water, solvation (H-bonding of the ammonium ion) and steric hindrance also matter: methyl series (CH₃)₂NH > CH₃NH₂ > (CH₃)₃N > NH₃; ethyl series (C₂H₅)₂NH > (C₂H₅)₃N > C₂H₅NH₂ > NH₃. Aniline: the lone pair takes part in resonance with the ring, and the anilinium ion has fewer resonance structures, so aniline is less basic. Electron-releasing groups (–OCH₃, –CH₃) on the ring raise basicity; electron-withdrawing groups (–NO₂, –SO₃H, –COOH, –X) lower it.',
 real:'The fishy smell of spoiling fish is due to volatile amines; lemon juice (acid) removes it by forming non-volatile salts.',
 apply:'Arrange in increasing order of basic strength: C₆H₅NH₂, C₂H₅NH₂, (C₂H₅)₂NH, NH₃.',
 see:{w:520,h:230,f:[
  ['pK_b bars: shorter = stronger base.',[['(C₂H₅)₂NH',3.00],['C₂H₅NH₂',3.29],['NH₃',4.75],['C₆H₅NH₂',9.38]].map(([n,v],i)=>`<rect x="140" y="${30+i*42}" width="${v*30}" height="24" fill="${i===3?OR:BL}" opacity=".75"/>`+lbl(130,48+i*42,n,'font-size="12" text-anchor="end"')+lbl(150+v*30,48+i*42,String(v),'font-size="12" text-anchor="start"')).join('')],
  ['Aniline: the N lone pair is spread into the ring (resonance), so it is less available.',lbl(260,215,'aryl amines ≪ NH₃ < aliphatic amines (in basic strength)','font-weight="700"')]]},
 seeNote:'pK_b data as in the textbook table.',
 do:{title:'Litmus check',mat:'Dilute solutions of methylamine (or ammonia) and aniline water, red litmus',steps:['Dip red litmus into each.'],obs:'Methylamine turns red litmus blue clearly; aniline only weakly.',why:'Aliphatic amines are stronger bases.',lab:true},
 memo:'"Smaller pK_b, stronger base; ring steals the lone pair."',
 miscon:['"Tertiary amines are always the strongest bases." In water solvation and steric effects change the order.','"Aniline is stronger than ammonia because of the ring." It is much weaker.'],
 terms:['pK_b','Basic strength','+I effect','Solvation','Steric hindrance','Resonance in aniline'],
 q:{q:'Which is the weakest base?',o:['NH₃','CH₃NH₂','C₆H₅NH₂','(CH₃)₂NH'],a:2,why:'pK_b 9.38.'},
 exam:'Order of basic strength with reasons is a frequent 3-mark question.'},

{id:'a4',num:'9.6',title:'Reactions: alkylation, acylation and distinguishing tests',
 intro:'Three bottles: a 1°, a 2° and a 3° amine. Which tests tell them apart?',
 obj:'Write acylation and alkylation reactions and use the carbylamine, nitrous acid and Hinsberg tests.',
 prior:'Basicity (a3).',
 simple:'Acylation: 1° and 2° amines react with acid chlorides or anhydrides (replace an N–H by an acyl group), e.g. aniline + acetyl chloride → acetanilide; pyridine removes the HCl formed. Carbylamine test: only primary amines (aliphatic and aromatic), heated with chloroform and ethanolic KOH, give foul-smelling isocyanides. Hinsberg\'s reagent (benzenesulphonyl chloride): 1° gives a sulphonamide soluble in alkali; 2° gives one insoluble in alkali; 3° does not react.',
 detail:'Alkylation: amines react with alkyl halides (nucleophilic substitution) to give higher amines and finally quaternary ammonium salts. Benzoylation: with benzoyl chloride (C₆H₅COCl). Carbylamine: R–NH₂ + CHCl₃ + 3KOH → R–NC + 3KCl + 3H₂O. Nitrous acid (NaNO₂ + HCl): primary aliphatic amines give alcohols with quantitative evolution of nitrogen gas (used to estimate amino acids and proteins); primary aromatic amines at 273–278 K give diazonium salts. Hinsberg details: with a 1° amine, N-alkylbenzenesulphonamide still has an acidic H on N (strongly electron-withdrawing sulphonyl group), so it dissolves in alkali; the 2° product has no H on N, so it is insoluble; 3° amines have no H on N and do not react. Nowadays benzenesulphonyl chloride is replaced by p-toluenesulphonyl chloride.',
 real:'Paracetamol is made by acetylating 4-aminophenol, an acylation reaction of an aromatic amine.',
 apply:'How will you distinguish methylamine from dimethylamine by a chemical test?',
 see:{w:520,h:230,f:[
  ['Carbylamine: only 1° amines give a foul-smelling isocyanide.',lbl(260,40,'RNH₂ + CHCl₃ + 3KOH → RNC + 3KCl + 3H₂O','font-size="13"')],
  ['Hinsberg: 1° product dissolves in alkali; 2° does not; 3° no reaction.',[['1°','soluble in KOH',BL],['2°','insoluble',OR],['3°','no reaction',GR]].map(([a,b,c],i)=>`<path d="M${120+i*140} 80 v80 a22 22 0 0 0 44 0 v-80" fill="none" stroke="${ink}" stroke-width="2"/><path d="M${122+i*140} 130 v30 a20 20 0 0 0 40 0 v-30z" fill="${c}" opacity="${i===1?0.2:0.5}"/>`+(i===1?[0,1,2].map(k=>`<circle cx="${135+i*140+k*9}" cy="${168}" r="3" fill="${OR}"/>`).join(''):'')+lbl(142+i*140,215,a+': '+b,'font-size="12"')).join('')]]},
 seeNote:'Precipitate in the 2° tube does not dissolve in alkali.',
 do:{title:'Test plan',mat:'Flow-chart paper',steps:['Start with an unknown amine.','Apply carbylamine test; then Hinsberg test.','Decide 1°, 2° or 3°.'],obs:'A two-test decision tree identifies the class.',why:'Each test depends on N–H count.',lab:true},
 memo:'"Carbylamine: 1° only. Hinsberg: 1° dissolves, 2° doesn\'t, 3° ignores."',
 miscon:['"Secondary amines give the carbylamine test." Only primary amines.','"Tertiary amines react with Hinsberg reagent." They have no N–H.'],
 terms:['Acylation','Alkylation','Quaternary ammonium salt','Carbylamine (isocyanide) test','Hinsberg\'s reagent','Nitrous acid'],
 q:{q:'Which gives the carbylamine test?',o:['(CH₃)₂NH','(CH₃)₃N','C₆H₅NH₂','C₆H₅NHCH₃'],a:2,why:'Primary amine.'},
 exam:'Distinguishing tests (1° vs 2° vs 3°) appear every year: 2–3 marks.'},

{id:'a5',num:'9.6',title:'Electrophilic substitution in aniline',
 intro:'Bromine water with aniline gives a white precipitate instantly. Why does it put three bromines on the ring?',
 obj:'Explain the strong activating effect of –NH₂ and how acetylation controls it; describe bromination, nitration and sulphonation of aniline.',
 prior:'Resonance; directing effects.',
 simple:'–NH₂ strongly activates the benzene ring and directs to ortho and para positions. With bromine water at room temperature aniline gives 2,4,6-tribromoaniline (white precipitate). To get a monosubstituted product, first acetylate (–NHCOCH₃ is less activating), substitute, then hydrolyse back.',
 detail:'Nitration: direct nitration gives tarry oxidation products plus a large amount of meta product, because in strong acid aniline is protonated to the anilinium ion, which is meta-directing; typical yields p 51%, m 47%, o 2%. Protecting –NH₂ by acetylation gives mainly p-nitroacetanilide, hydrolysed to p-nitroaniline. Sulphonation: aniline + conc. H₂SO₄ → anilinium hydrogensulphate; heated at 453–473 K → p-aminobenzene sulphonic acid (sulphanilic acid), which exists as a zwitterion. Friedel–Crafts: aniline does not undergo it, because it forms a salt with the Lewis acid AlCl₃, putting a positive charge on N that deactivates the ring.',
 real:'Sulpha drugs (early antibacterials) are derived from sulphanilic acid chemistry.',
 apply:'Why does aniline not undergo Friedel–Crafts reaction?',
 see:{w:520,h:230,f:[
  ['Aniline + Br₂ water → 2,4,6-tribromoaniline (white precipitate).',ring(70,110,28)+lbl(70,68,'NH₂','font-size="12"')+arrow(115,110,230,'Br₂/H₂O')+ring(280,110,28)+lbl(280,68,'NH₂','font-size="12"')+[['Br',238,88],['Br',322,88],['Br',280,162]].map(([t,x,y])=>lbl(x,y,t,'font-size="12" fill="'+OR+'"')).join('')],
  ['Protect first: acetylate → brominate → hydrolyse = p-bromoaniline.',lbl(410,60,'–NH₂ → –NHCOCH₃','font-size="12"')+lbl(410,90,'→ p-Br product','font-size="12"')+lbl(410,120,'→ hydrolyse','font-size="12"')+lbl(410,150,'p-bromoaniline','font-size="12" font-weight="700"')],
  ['Direct nitration gives lots of meta product (anilinium ion is meta-directing).',lbl(260,215,'p 51% · m 47% · o 2% (direct nitration)','font-size="12"')]]},
 seeNote:'Acetylation tames the activating –NH₂ group.',
 do:{title:'Bromine water test (demonstration)',mat:'Aniline (few drops), bromine water, fume cupboard',steps:['Add bromine water drop by drop to aniline in water.'],obs:'Brown colour vanishes; white precipitate forms.',why:'2,4,6-tribromoaniline.',lab:false},
 memo:'"NH₂ is too keen: tame it with acetyl."',
 miscon:['"Nitration of aniline gives only o/p products." In acid much meta product forms.','"Aniline does Friedel–Crafts easily." It forms a salt with AlCl₃.'],
 terms:['Activating group','ortho/para directing','Acetanilide','Anilinium ion','Sulphanilic acid','Zwitterion'],
 q:{q:'Aniline with bromine water gives:',o:['o-bromoaniline','p-bromoaniline','2,4,6-tribromoaniline','m-bromoaniline'],a:2,why:'Strong activation.'},
 exam:'Why acetylation before nitration; why no Friedel–Crafts: 2 marks each.'},

{id:'a6',num:'9.7–9.10',title:'Diazonium salts: preparation and reactions',
 intro:'One intermediate turns aniline into chlorobenzene, phenol, iodobenzene or a bright orange dye. What is it?',
 obj:'Prepare benzenediazonium chloride; write its replacement and coupling reactions and state its importance.',
 prior:'Nitrous acid reaction (a4).',
 simple:'Aniline with nitrous acid (NaNO₂ + HCl) at 273–278 K gives benzenediazonium chloride, C₆H₅N₂⁺Cl⁻ (diazotisation). It is stable only when cold. The –N₂⁺ group can be replaced by Cl, Br, CN, I, F, OH, H or NO₂, with N₂ gas escaping. It also couples with phenol or aniline to give coloured azo dyes.',
 detail:'Arenediazonium salts are more stable than alkyl ones because of resonance with the ring; they are usually used immediately in solution. Replacement (N₂ lost): Sandmeyer — CuCl/HCl → C₆H₅Cl; CuBr/HBr → C₆H₅Br; CuCN/KCN → C₆H₅CN. Gattermann — Cu powder with HCl or HBr → C₆H₅Cl/Br. KI → iodobenzene. HBF₄ then heat → fluorobenzene. H₃PO₂ or ethanol (mild reducing agents) → benzene. Warm water → phenol. With HBF₄ then NaNO₂/Cu, heat → nitrobenzene. Coupling (N retained; electrophilic substitution at para position): with phenol in alkaline medium → p-hydroxyazobenzene (orange dye); with aniline in mildly acidic medium → p-aminoazobenzene (yellow dye). Importance: they give a route to aryl halides, cyanides and phenols that cannot be made easily by direct substitution (e.g. fluoro- and iodobenzene, which cannot be made by direct halogenation), and to dyes.',
 real:'Many textile and food colours are azo dyes made by diazonium coupling.',
 apply:'How will you convert aniline into (i) benzonitrile (ii) iodobenzene (iii) phenol?',
 see:{w:520,h:240,f:[
  ['Aniline + NaNO₂ + HCl at 273–278 K → benzenediazonium chloride.',ring(60,110,26)+lbl(60,72,'NH₂','font-size="12"')+arrow(100,110,200,'0–5 °C')+ring(240,110,26)+lbl(240,72,'N₂⁺Cl⁻','font-size="12"')],
  ['Replace N₂⁺: CuCl, CuBr, CuCN (Sandmeyer); KI; H₂O; H₃PO₂.',[['Cl, Br, CN',360,40],['I (KI)',440,80],['OH (H₂O, warm)',450,130],['H (H₃PO₂)',430,180]].map(([t,x,y])=>`<line x1="270" y1="110" x2="${x-40}" y2="${y}" stroke="${GR}"/>`+lbl(x,y,t,'font-size="12"')).join('')],
  ['Coupling with phenol → orange azo dye (–N=N– kept).',`<rect x="150" y="190" width="220" height="34" rx="8" fill="#f2a774" opacity=".8"/>`+lbl(260,212,'p-hydroxyazobenzene','font-size="13" font-weight="700"')]]},
 seeNote:'Keep the diazonium salt cold; it decomposes when warm.',
 do:{title:'Azo dye demonstration (teacher)',mat:'Aniline, NaNO₂, HCl, ice, 2-naphthol in NaOH, cloth strip',steps:['Diazotise aniline in an ice bath.','Add to alkaline 2-naphthol.','Dip a cloth strip.'],obs:'A bright orange-red dye forms and stains the cloth.',why:'Azo coupling.',lab:false},
 memo:'"Cold to make it, Cu to swap it, phenol to colour it."',
 miscon:['"Diazonium salts are stable at room temperature." They decompose; keep at 0–5 °C.','"Coupling loses N₂." In coupling the N=N is kept.'],
 terms:['Diazotisation','Benzenediazonium chloride','Sandmeyer reaction','Gattermann reaction','Azo coupling','Azo dye'],
 q:{q:'Benzenediazonium chloride + CuCN/KCN gives:',o:['benzonitrile','phenol','aniline','chlorobenzene'],a:0,why:'Sandmeyer: –CN replaces –N₂⁺.'},
 exam:'Conversions via diazonium salts are 3–5 mark favourites.'}
];

const CARDS=[['1°, 2°, 3° amines','RNH₂, R₂NH, R₃N (count groups on N).'],['Structure','N sp³, pyramidal; ≈ 108° in (CH₃)₃N.'],['IUPAC','Alkanamine; N-alkyl for 2°/3° (e.g. N-methylethanamine).'],['Nitro reduction','Fe/HCl preferred (little acid needed).'],['Gabriel','Phthalimide → pure 1° aliphatic amine; not aryl.'],['Hoffmann bromamide','RCONH₂ + Br₂ + 4NaOH → RNH₂ (one C less).'],['Nitrile reduction','RCN → RCH₂NH₂ (one C more).'],['pK_b','Smaller = stronger base; aniline 9.38, NH₃ 4.75.'],['Basicity in water','(C₂H₅)₂NH > (C₂H₅)₃N > C₂H₅NH₂ > NH₃ > C₆H₅NH₂.'],['Carbylamine','Only 1° amines → foul-smelling isocyanide.'],['Hinsberg','1°: soluble in alkali; 2°: insoluble; 3°: no reaction.'],['HNO₂','1° aliphatic → alcohol + N₂; 1° aromatic (0–5 °C) → diazonium.'],['Bromination','Aniline + Br₂ water → 2,4,6-tribromoaniline.'],['Protection','Acetylate –NH₂ before nitration/monobromination.'],['No Friedel–Crafts','Aniline forms salt with AlCl₃.'],['Sandmeyer','Cu(I) salts: Cl, Br, CN replace N₂⁺.'],['Other replacements','KI → I; H₂O → OH; H₃PO₂ → H; HBF₄ → F.'],['Azo coupling','With phenol (orange), aniline (yellow); N=N kept.']];

const Q=[
 {lv:1,q:'(CH₃)₂NH is a:',o:['primary amine','secondary amine','tertiary amine','quaternary salt'],a:1,w:'Two groups on N.'},
 {lv:1,q:'The hybridisation of N in amines is:',o:['sp','sp²','sp³','dsp²'],a:2,w:'Pyramidal.'},
 {lv:1,q:'Hoffmann bromamide degradation gives an amine with:',o:['one more carbon','the same carbons','one carbon less','two carbons less'],a:2,w:'Carbonyl carbon is lost as CO₃²⁻.'},
 {lv:1,q:'Diazotisation is carried out at:',o:['273–278 K','373 K','453 K','room temperature always'],a:0,w:'0–5 °C.'},
 {lv:2,q:'Which cannot be prepared by Gabriel synthesis?',o:['ethanamine','propanamine','aniline','methanamine'],a:2,w:'Aryl halides do not react.'},
 {lv:2,q:'Which amine does not react with Hinsberg\'s reagent?',o:['CH₃NH₂','(CH₃)₂NH','(CH₃)₃N','C₆H₅NH₂'],a:2,w:'No N–H.'},
 {lv:2,q:'Aniline + bromine water gives:',o:['p-bromoaniline','2,4,6-tribromoaniline','o-bromoaniline','bromobenzene'],a:1,w:'Highly activated ring.'},
 {lv:3,q:'Increasing basic strength (water):',o:['C₆H₅NH₂ < NH₃ < C₂H₅NH₂ < (C₂H₅)₂NH','NH₃ < C₆H₅NH₂ < C₂H₅NH₂ < (C₂H₅)₂NH','(C₂H₅)₂NH < C₂H₅NH₂ < NH₃ < C₆H₅NH₂','C₂H₅NH₂ < NH₃ < C₆H₅NH₂ < (C₂H₅)₂NH'],a:0,w:'pK_b 9.38 > 4.75 > 3.29 > 3.00.'},
 {lv:3,q:'Benzenediazonium chloride + H₃PO₂ gives:',o:['phenol','benzene','chlorobenzene','aniline'],a:1,w:'Mild reduction.'},
 {lv:3,q:'Ethanoic acid → methanamine. The key step is:',o:['Gabriel synthesis','Hoffmann bromamide on ethanamide','nitrile reduction','Sandmeyer reaction'],a:1,w:'CH₃COOH → CH₃CONH₂ → CH₃NH₂.'},
 {lv:4,q:'Assertion (A): Aniline does not undergo Friedel–Crafts reaction. Reason (R): Aniline forms a salt with AlCl₃, which deactivates the ring.',o:['Both true and R explains A','Both true, R does not explain A','A true, R false','A false, R true'],a:0,w:'Positive N deactivates.'},
 {lv:4,q:'Direct nitration of aniline gives a large amount of m-nitroaniline because:',o:['–NH₂ is meta directing','aniline is protonated to anilinium ion','nitration is reversible','of steric hindrance'],a:1,w:'–NH₃⁺ is meta directing.'},
 {lv:4,q:'Which test distinguishes CH₃NH₂ from (CH₃)₂NH?',o:['litmus','carbylamine test','Br₂ water','solubility in water'],a:1,w:'Only 1° gives isocyanide.'},
 {lv:5,open:true,m:3,q:'Arrange in decreasing order of pK_b and explain: C₂H₅NH₂, C₆H₅NHCH₃, (C₂H₅)₂NH, C₆H₅NH₂.',ans:['pK_b: C₆H₅NH₂ > C₆H₅NHCH₃ > C₂H₅NH₂ > (C₂H₅)₂NH (1).','Aryl amines weak: lone pair delocalised into ring; N-methyl (+I) slightly raises basicity (1).','Aliphatic: +I and solvation; 2° ethyl amine strongest here (1).']},
 {lv:5,open:true,m:3,q:'Describe the Hinsberg test to distinguish primary, secondary and tertiary amines.',ans:['React with benzenesulphonyl chloride (1).','1°: N-alkylbenzenesulphonamide with acidic N–H, soluble in alkali; 2°: N,N-dialkyl product, insoluble in alkali (1).','3°: no reaction (no N–H) (1).']},
 {lv:5,open:true,m:4,q:'How will you convert aniline into (i) chlorobenzene (ii) benzonitrile (iii) phenol (iv) p-hydroxyazobenzene?',ans:['Diazotise: aniline + NaNO₂/HCl at 273–278 K → C₆H₅N₂⁺Cl⁻ (1).','(i) CuCl/HCl → chlorobenzene; (ii) CuCN/KCN → benzonitrile (1).','(iii) warm with water → phenol (1).','(iv) couple with phenol in alkaline medium → p-hydroxyazobenzene (1).']}
];

const ONEMIN=['1°/2°/3° by groups on N; N sp³ pyramidal.','IUPAC: alkanamine; N-prefix for 2°/3°.','Prepare: nitro reduction (Fe/HCl), ammonolysis, nitrile/amide reduction, Gabriel (1° aliphatic), Hoffmann (−1 C).','Basic: lone pair; pK_b smaller = stronger; aniline weakest (resonance).','Water order (ethyl): 2° > 3° > 1° > NH₃.','Carbylamine: 1° only. Hinsberg: 1° soluble, 2° insoluble, 3° no reaction.','HNO₂: 1° aliphatic → ROH + N₂; aromatic (cold) → diazonium.','Aniline: Br₂ water → tribromo; protect by acetylation; no Friedel–Crafts.','Diazonium: Sandmeyer (CuCl/CuBr/CuCN), KI, H₂O, H₃PO₂, HBF₄.','Coupling → azo dyes (phenol orange, aniline yellow).'];
const KEYS=[['1°/2°/3°',/primary|secondary|tertiary|1°|2°|3°/i],['preparation methods',/gabriel|hoffmann|reduction|ammonolysis/i],['pKb / basicity',/pk|basic/i],['resonance in aniline',/resonance|delocal/i],['carbylamine',/carbylamine|isocyanide/i],['Hinsberg',/hinsberg|sulphonyl/i],['nitrous acid',/nitrous|NaNO2|NaNO₂/i],['tribromoaniline',/tribromo|bromine water/i],['diazonium',/diazon/i],['Sandmeyer / coupling',/sandmeyer|coupling|azo/i]];

/* ---------- lab ---------- */
let mode='test',am='1';
const AM={'1':['Primary (ethanamine, C₂H₅NH₂)',{carb:['Foul smell of isocyanide (solution stays colourless)','#f1efe8'],hins:['Product dissolves in KOH (clear solution)','#cfe2ec'],hno2:['Bubbles of N₂ gas; alcohol formed','#e6f1fb']}],'2':['Secondary (N-ethylethanamine, (C₂H₅)₂NH)',{carb:['No smell: no reaction','#f1efe8'],hins:['White solid, insoluble in KOH','#ffffff'],hno2:['Yellow oily N-nitrosamine (no N₂)','#f2e49a']}],'3':['Tertiary (N,N-diethylethanamine, (C₂H₅)₃N)',{carb:['No reaction','#f1efe8'],hins:['No reaction','#f1efe8'],hno2:['Dissolves as a salt (no N₂)','#f1efe8']}]};
const PKB=[['(C₂H₅)₂NH',3.00],['C₂H₅NH₂',3.29],['(C₂H₅)₃N',3.25],['(CH₃)₂NH',3.27],['CH₃NH₂',3.38],['(CH₃)₃N',4.22],['NH₃',4.75],['C₆H₅NH₂',9.38]];
function drawTest(){const [name,r]=AM[am];const tests=[['carb','Carbylamine\n(CHCl₃ + KOH, warm)'],['hins','Hinsberg\n(C₆H₅SO₂Cl, then KOH)'],['hno2','Nitrous acid\n(NaNO₂ + HCl)']];let s='';
 tests.forEach(([k,t],i)=>{const x=80+i*160,[res,c]=r[k];s+=`<path d="M${x-25} 60 v160 a25 25 0 0 0 50 0 v-160" fill="none" stroke="${ink}" stroke-width="2.5"/><path d="M${x-23} 150 v70 a23 23 0 0 0 46 0 v-70z" fill="${c}" opacity=".85" stroke="${GR}" stroke-width=".5"/>`;
  if(am==='2'&&k==='hins')for(let j=0;j<6;j++)s+=`<circle cx="${x-12+(j%3)*12}" cy="${228+Math.floor(j/3)*10}" r="3.5" fill="#bbb"/>`;
  if(am==='1'&&k==='hno2')for(let j=0;j<5;j++)s+=`<circle cx="${x-8+(j%2)*14}" cy="${200-j*14}" r="4" fill="none" stroke="${BL}"/>`;
  if(am==='1'&&k==='carb')s+=`<path d="M${x-10} 50 q-8 -14 0 -26 q8 -12 0 -24" fill="none" stroke="${OR}" stroke-width="2"/><path d="M${x+8} 50 q-8 -14 0 -26" fill="none" stroke="${OR}" stroke-width="2"/>`;
  t.split('\n').forEach((ln,j)=>s+=T(x,280+j*16,ln,'font-size="11"'))});
 $('#aSvg').innerHTML=s;
 $('#aOut').innerHTML=`<p><b>${name}</b></p><p>Carbylamine: ${r.carb[0]}</p><p>Hinsberg: ${r.hins[0]}</p><p>Nitrous acid: ${r.hno2[0]}</p><p class="note">Nitrous acid results for 2°/3° are given for interest; the textbook uses carbylamine and Hinsberg tests to classify.</p>`}
function drawBase(){let s='';const sorted=PKB.slice().sort((a,b)=>a[1]-b[1]);sorted.forEach(([n,v],i)=>{const y=24+i*36;s+=`<rect x="150" y="${y}" width="${v*30}" height="24" rx="4" fill="${n==='C₆H₅NH₂'?OR:n==='NH₃'?GR:BL}" opacity=".8"/>`+T(140,y+17,n,'font-size="12" text-anchor="end"')+T(156+v*30,y+17,v.toFixed(2),'font-size="12" text-anchor="start"')});
 s+=T(300,318,'pK_b (smaller = stronger base)','font-size="12"');$('#aSvg').innerHTML=s;
 $('#aOut').innerHTML=`<p>Strongest here: <b>(C₂H₅)₂NH</b> (pK_b 3.00). Weakest: <b>aniline</b> (9.38).</p><p>Ethyl series in water: 2° > 3° > 1° > NH₃. Methyl series: 2° > 1° > 3° > NH₃.</p><p>Reasons: +I effect raises electron density on N; solvation of the ammonium ion and steric hindrance change the order in water; in aniline the lone pair is delocalised into the ring.</p>`}
function ctl(){return mode==='test'?`<div class="ctrl"><label>Unknown amine<select id="aAm"><option value="1" ${am==='1'?'selected':''}>Sample A</option><option value="2" ${am==='2'?'selected':''}>Sample B</option><option value="3" ${am==='3'?'selected':''}>Sample C</option></select></label><button class="btn" id="aRev">Reveal identity</button></div>`:''}
function labShow(){$('#aCtl').innerHTML=ctl();mode==='test'?drawTest():drawBase();if(mode==='test')$('#aOut').querySelector('p').innerHTML='<b>Unknown sample</b>: use the three results to decide 1°, 2° or 3°.'}
function labInit(){}
function labClick(b){if(b.id==='aRev'){drawTest();return true}return false}
function labChange(t){if(t.id==='aMode'){mode=t.value;labShow();return true}if(t.id==='aAm'){am=t.value;labShow();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
