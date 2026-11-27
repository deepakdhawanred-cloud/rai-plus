/* Rai Plus content pack: Class 12 Chemistry, Chapter 8 – Aldehydes, Ketones and Carboxylic Acids */
RP.register({key:'12che08',cls:'12',subject:'Chemistry',ch:'8',title:"Aldehydes, Ketones and Carboxylic Acids",color:'#8a3b2e',
crumb:"HBSE Class 12 Chemistry · Unit: Organic compounds with oxygen · Taught in November",h1:"Chapter 8: Aldehydes, Ketones and Carboxylic Acids",sub:"The carbonyl group: why it attracts nucleophiles, how to tell aldehydes from ketones, and what makes acids acidic.",heroLabel:"A carbonyl group with partial charges on carbon and oxygen",labName:"Unknown compound lab",
theme:"\n:root{--g:light-dark(#8a3b2e,#eea596);--g2:light-dark(#fbefec,#2a1411);--line:light-dark(#efd6d0,#4a2a24);--bg:light-dark(#ffffff,#170d0b);--card:light-dark(#ffffff,#1e120f);\n--ink:light-dark(#2a1410,#f6e9e6);--mute:light-dark(#6e544e,#c9aca5);--y:light-dark(#2e6f8a,#8fc4dc);--y2:light-dark(#e8f2f6,#0f1f26);--hd:#5c241b}\n",
labHTML:`  <h2>Unknown compound lab</h2>
  <p>Your teacher hands you a bottle labelled only with a letter. Run the tests, record what you see, and identify it.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="uT" viewBox="0 0 460 320" role="img" aria-label="Test tube showing the result of a test" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Unknown<select id="uC"><option value="0">Bottle A</option><option value="1">Bottle B</option><option value="2">Bottle C</option><option value="3">Bottle D</option><option value="4">Bottle E</option><option value="5">Bottle F</option><option value="6">Bottle G</option><option value="7">Bottle H</option></select></label></div>
  <div class="ctrl"><button class="btn" data-test="dnp">2,4-DNP</button><button class="btn" data-test="tol">Tollens'</button><button class="btn" data-test="feh">Fehling's</button><button class="btn" data-test="iod">Iodoform</button><button class="btn" data-test="bic">NaHCO₃</button></div>
  <div class="box y" id="uOut" aria-live="polite"></div>
  <div class="ctrl"><label>I think it is<select id="uG"><option value="">choose…</option></select></label><button class="btn p" id="uCheck">Check</button></div>
  <div id="uFb" aria-live="polite"></div>
  <p class="note">Simulated results. Tollens' and Fehling's reagents are prepared fresh and handled by the teacher.</p></div></div>
`,
build:function(){

const ACC='#8a3b2e',LABNAME='Unknown compound lab',MIND_CENTER='Carbonyl compounds';
const RD='#8a3b2e',BL='#2e6f8a',ink='currentColor';
const pill=(x,y,t,c='#fbefec',w=170)=>`<rect x="${x-w/2}" y="${y-17}" width="${w}" height="34" rx="8" fill="${c}" stroke="${RD}"/>`+T(x,y+5,t,'font-size="13"');
function heroDraw(){return `<line x1="130" y1="62" x2="210" y2="62" stroke="#fff" stroke-width="3"/><line x1="130" y1="70" x2="210" y2="70" stroke="#fff" stroke-width="3"/><circle cx="120" cy="66" r="18" fill="#4a4a46"/><circle cx="222" cy="66" r="18" fill="#d9473f"/>`+T(120,72,'C','font-size="15" font-weight="700" fill="#fff"')+T(222,72,'O','font-size="15" font-weight="700" fill="#fff"')+T(120,36,'δ+','font-size="14" fill="#fff"')+T(222,36,'δ−','font-size="14" fill="#fff"')}
const HERO=heroDraw;
const MIND=[['Carbonyl structure and names',90,50],['Preparation',430,50],['Nucleophilic addition',90,150],['Tests, reduction, oxidation',430,150],['Aldol and Cannizzaro',90,250],['Carboxylic acids',430,250]];

const C=[
{id:'s1',num:'8.1–8.3',title:'The carbonyl group: structure and naming',
 intro:'One carbon, one oxygen, a double bond: the carbonyl group is behind the smell of almonds, the sting of vinegar and nail-polish remover.',
 obj:'Describe the structure and polarity of the carbonyl group and name aldehydes, ketones and carboxylic acids by common and IUPAC systems.',
 prior:'Hybridisation; IUPAC naming (Class 11).',
 simple:'In a carbonyl group, C=O, the carbon is sp² hybridised and the group is flat, with bond angles of about 120°. Oxygen pulls electrons towards itself, so the carbon gets a partial positive charge (δ+) and oxygen a partial negative charge (δ−). In aldehydes the carbonyl carbon has at least one hydrogen (–CHO); in ketones it is joined to two carbon groups; carboxylic acids have –COOH.',
 detail:'The carbonyl carbon forms three σ bonds (sp²) in a trigonal planar arrangement and a π bond with oxygen using its unhybridised p orbital. Oxygen is more electronegative, so the C=O bond is polarised: carbon is an electrophilic (Lewis acid) centre and oxygen a nucleophilic (Lewis base) centre. Carbonyl compounds have substantial dipole moments. IUPAC names: replace the final -e of the alkane with -al for aldehydes, -one for ketones and -oic acid for carboxylic acids, numbering from the carbonyl carbon (aldehydes, acids) or giving it the lowest number (ketones). Examples: HCHO methanal (formaldehyde), CH₃CHO ethanal (acetaldehyde), CH₃COCH₃ propanone (acetone), C₆H₅CHO benzaldehyde, C₆H₅COCH₃ 1-phenylethanone (acetophenone), HCOOH methanoic acid (formic acid), CH₃COOH ethanoic acid (acetic acid), C₆H₅COOH benzoic acid.',
 real:'Formalin (about 40% methanal in water) preserves biological specimens; benzaldehyde gives bitter almonds their smell.',
 apply:'Write the IUPAC name of CH₃CH(CH₃)CH₂CHO and of CH₃COCH₂CH₂CH₃.',
 see:{w:520,h:240,f:[
  ['The carbonyl group is planar; bond angles are about 120°.',pill(260,50,'C=O, sp², 120°','#fbefec',180)],
  ['Oxygen pulls the π electrons: Cδ+ and Oδ−.',T(180,120,'Cδ+','font-size="18" font-weight="700"')+T(340,120,'Oδ−','font-size="18" font-weight="700"')+`<line x1="210" y1="114" x2="310" y2="114" stroke="${ink}" stroke-width="3"/><line x1="210" y1="122" x2="310" y2="122" stroke="${ink}" stroke-width="3"/>`],
  ['–CHO aldehyde, >C=O ketone, –COOH carboxylic acid.',pill(110,200,'–CHO','#fbefec',100)+pill(260,200,'>C=O','#fbefec',100)+pill(410,200,'–COOH','#e8f2f6',110)]]},
 seeNote:'Rotate the 3D models in the Visuals tab.',
 do:{title:'Naming relay',mat:'Cards with condensed formulas',steps:['Draw a formula card.','Count the longest chain containing the carbonyl carbon.','Give the IUPAC and common names; a partner checks.'],obs:'Names follow stem + -al / -one / -oic acid.',why:'IUPAC rules give one unique name per structure.',lab:false},
 memo:'"-al at the end, -one in the middle, -oic acid with OH."',
 miscon:['"The carbonyl carbon is negative." It is δ+, attacked by nucleophiles.','"Propanal and propanone are the same." They are functional isomers.'],
 terms:['Carbonyl group','sp² hybridisation','Polarity','Aldehyde','Ketone','Carboxylic acid'],
 q:{q:'The hybridisation of the carbonyl carbon is:',o:['sp','sp²','sp³','dsp²'],a:1,why:'Three σ bonds in a plane plus one π bond.'},
 exam:'Naming and structure questions appear as 1–2 mark items.'},
{id:'s2',num:'8.2',title:'Preparing aldehydes and ketones',
 intro:'Can you stop the oxidation of an alcohol at the aldehyde, before it becomes an acid?',
 obj:'Recall the main methods of preparing aldehydes and ketones, including named reactions.',
 prior:'Alcohols (Ch 7).',
 simple:'Oxidise primary alcohols to aldehydes and secondary alcohols to ketones. Other routes: ozonolysis of alkenes; Rosenmund reduction of acid chlorides; Stephen reduction of nitriles; Etard reaction of toluene; and Friedel–Crafts acylation of benzene to give aromatic ketones.',
 detail:'From alcohols: primary alcohols → aldehydes and secondary alcohols → ketones with oxidising agents such as K₂Cr₂O₇/H⁺ or KMnO₄; a mild reagent, pyridinium chlorochromate (PCC), stops at the aldehyde. Dehydrogenation over heated Ag or Cu also works. Ozonolysis of alkenes followed by Zn/H₂O gives aldehydes or ketones. Rosenmund reduction: acyl chloride + H₂ over Pd on BaSO₄ → aldehyde. Stephen reaction: nitrile + SnCl₂/HCl → imine → hydrolysis → aldehyde. Nitriles with DIBAL-H, then hydrolysis, also give aldehydes. Etard reaction: toluene + chromyl chloride (CrO₂Cl₂) → benzaldehyde. Gatterman–Koch: benzene + CO + HCl with anhydrous AlCl₃/CuCl → benzaldehyde. Ketones: acyl chlorides with dialkylcadmium; nitriles with Grignard reagents followed by hydrolysis; Friedel–Crafts acylation: benzene + RCOCl with anhydrous AlCl₃ → aryl ketone.',
 real:'Industrial acetone and formaldehyde are made by oxidising or dehydrogenating the corresponding alcohols.',
 apply:'How will you convert ethanol into ethanal without forming ethanoic acid?',
 see:{w:520,h:240,f:[
  ['1° alcohol → aldehyde; 2° alcohol → ketone (oxidation).',pill(130,50,'RCH₂OH → RCHO','#fbefec',170)+pill(380,50,'R₂CHOH → R₂CO','#fbefec',170)],
  ['Rosenmund: RCOCl + H₂ (Pd–BaSO₄) → RCHO.',pill(260,120,'Rosenmund','#e8f2f6',140)],
  ['Etard: toluene + CrO₂Cl₂ → benzaldehyde. Friedel–Crafts: benzene + RCOCl (AlCl₃) → ketone.',pill(140,195,'Etard','#e8f2f6',100)+pill(370,195,'Friedel–Crafts','#e8f2f6',150)]]},
 seeNote:'Named reactions are favourites for conversion questions.',
 do:{title:'Conversion chain card',mat:'Notebook',steps:['Write ethanol → ethanal (PCC) → ethanoic acid (K₂Cr₂O₇/H⁺).','Write benzene → acetophenone (CH₃COCl, AlCl₃).','Write toluene → benzaldehyde (CrO₂Cl₂, then H₃O⁺).'],obs:'Each step names its reagent.',why:'Reagent choice controls how far reaction goes.',lab:false},
 memo:'"Rosenmund: Rest on Pd–BaSO₄; Stephen: SnCl₂; Etard: chromyl chloride."',
 miscon:['"Strong oxidants stop at the aldehyde." They usually go on to the acid; PCC stops at the aldehyde.','"Friedel–Crafts acylation gives aldehydes." It gives ketones.'],
 terms:['PCC','Ozonolysis','Rosenmund reduction','Stephen reaction','Etard reaction','Friedel–Crafts acylation'],
 q:{q:'Benzaldehyde can be prepared from toluene by:',o:['Rosenmund reduction','Etard reaction','Cannizzaro reaction','Clemmensen reduction'],a:1,why:'Chromyl chloride oxidises the methyl group.'},
 exam:'Named-reaction equations and conversions are 2–3 mark questions every year.'},
{id:'s3',num:'8.4',title:'Nucleophilic addition reactions',
 intro:'Why do aldehydes react faster than ketones with the same reagent?',
 obj:'Describe the mechanism of nucleophilic addition, explain the reactivity order, and write additions of HCN, NaHSO₃, Grignard reagents, alcohols and ammonia derivatives.',
 prior:'Polarity of the carbonyl group (8.1).',
 simple:'A nucleophile attacks the δ+ carbonyl carbon. The carbon changes from flat (sp²) to tetrahedral (sp³), and the oxygen gets a negative charge, which then picks up H⁺. Aldehydes react faster than ketones because they have less crowding (steric effect) and the carbon is more positive (fewer electron-donating alkyl groups).',
 detail:'Mechanism: the nucleophile attacks the electrophilic carbon perpendicular to the plane of the sp² carbon; hybridisation changes from sp² to sp³ and a tetrahedral alkoxide intermediate forms, which captures a proton to give the product. Reactivity: aldehydes > ketones. Sterically, two substituents in ketones hinder attack more than one in aldehydes; electronically, two alkyl groups reduce the electrophilicity of the carbonyl carbon more. Examples: (a) HCN (base-catalysed) → cyanohydrins; (b) sodium hydrogensulphite → crystalline addition products, used to separate and purify aldehydes; (c) Grignard reagents → alcohols after hydrolysis; (d) alcohols with dry HCl → hemiacetals and acetals (ketones with ethylene glycol give ketals); (e) ammonia derivatives Z–NH₂ add and then lose water to give C=N–Z: hydroxylamine → oximes, hydrazine → hydrazones, phenylhydrazine → phenylhydrazones, 2,4-dinitrophenylhydrazine (2,4-DNP) → orange-red 2,4-DNP derivatives, semicarbazide → semicarbazones.',
 real:'The orange crystals from 2,4-DNP were used for a century to identify unknown carbonyl compounds by their melting points.',
 apply:'Arrange in increasing order of reactivity towards HCN: ethanal, propanal, propanone, butanone.',
 see:{w:520,h:240,f:[
  ['A nucleophile (Nu⁻) attacks the δ+ carbon.',pill(120,60,'Nu⁻','#e8f2f6',70)+T(300,66,'>C=O','font-size="22" font-weight="700"')+`<path d="M160 60 Q 220 20 270 55" fill="none" stroke="${BL}" stroke-width="2.5"/>`],
  ['A tetrahedral intermediate forms: oxygen carries the negative charge.',T(300,140,'Nu–C–O⁻','font-size="22" font-weight="700"')],
  ['It takes H⁺ to give the addition product.',T(300,210,'Nu–C–OH','font-size="22" font-weight="700"')+T(150,210,'+ H⁺','font-size="16"')]]},
 seeNote:'Animated in the Visuals tab.',
 do:{title:'2,4-DNP test (teacher demonstration)',mat:'Brady\'s reagent (2,4-DNP), propanone, ethanol, test tubes',steps:['Add a few drops of propanone to 2 mL of 2,4-DNP reagent.','Repeat with ethanol.','Compare.'],obs:'Propanone gives an orange-yellow precipitate; ethanol does not.',why:'Only carbonyl compounds form 2,4-DNP derivatives. Safety: 2,4-DNP is handled by the teacher.',lab:true},
 memo:'"Nu attacks C, O goes minus, H⁺ finishes it."',
 miscon:['"Ketones are more reactive because they have two groups." Those groups hinder attack and reduce δ+.','"The nucleophile attacks oxygen." It attacks carbon.'],
 terms:['Nucleophilic addition','Cyanohydrin','Hemiacetal, acetal','Oxime, hydrazone','2,4-DNP derivative'],
 q:{q:'Which is most reactive towards nucleophilic addition?',o:['Propanone','Ethanal','Methanal','Butanone'],a:2,why:'Methanal has no alkyl groups: least hindered, most δ+.'},
 exam:'Reactivity order with reasons and ammonia-derivative products are 2–3 mark questions.'},
{id:'s4',num:'8.4',title:'Reduction, oxidation and tests',
 intro:'Aldehydes and ketones look alike. One simple test tells them apart: a silver mirror.',
 obj:'Write reduction reactions (to alcohols and to hydrocarbons), explain Tollens\', Fehling\'s and iodoform tests, and use them to distinguish compounds.',
 prior:'Oxidation of alcohols.',
 simple:'Reduction: NaBH₄ or LiAlH₄ turns aldehydes into 1° alcohols and ketones into 2° alcohols. Clemmensen and Wolff–Kishner reductions turn C=O into CH₂. Aldehydes are easily oxidised, so they reduce Tollens\' reagent (silver mirror) and Fehling\'s solution (red-brown precipitate); ketones do not. Methyl ketones give a yellow iodoform precipitate.',
 detail:'Reduction to alcohols: NaBH₄, LiAlH₄ or catalytic hydrogenation. Reduction to hydrocarbons: Clemmensen (zinc amalgam + conc. HCl) and Wolff–Kishner (hydrazine, then heating with KOH in ethylene glycol). Oxidation: aldehydes are oxidised to carboxylic acids even by mild oxidising agents; ketones need vigorous conditions and C–C bond cleavage. Tollens\' test: ammoniacal silver nitrate; aldehyde → silver mirror (Ag) and the carboxylate anion. Fehling\'s test: Fehling\'s solutions A (aqueous CuSO₄) and B (alkaline sodium potassium tartrate) mixed; aldehyde → red-brown Cu₂O precipitate; aromatic aldehydes do not respond. Haloform reaction: aldehydes and ketones with at least one CH₃CO– group (methyl ketones) are oxidised by sodium hypohalite to sodium salts of acids with one carbon fewer and haloform; with iodine and NaOH, yellow iodoform (CHI₃) forms. Ethanol also gives the iodoform test, because it is first oxidised to ethanal.',
 real:'Making silver mirrors on glass historically used the very same Tollens\' reaction with a sugar (an aldehyde).',
 apply:'Give a chemical test to distinguish (i) propanal and propanone, (ii) acetophenone and benzophenone.',
 see:{w:520,h:240,f:[
  ['Tollens\': aldehyde gives a silver mirror.',`<rect x="60" y="40" width="70" height="160" rx="14" fill="#dfe3e6" stroke="${ink}"/><rect x="62" y="110" width="66" height="88" fill="#b8bec4"/>`+T(95,225,'mirror','font-size="12"')],
  ['Fehling\'s: aliphatic aldehyde gives a red-brown precipitate.',`<rect x="225" y="40" width="70" height="160" rx="14" fill="#6fa8e0" opacity=".5" stroke="${ink}"/><rect x="227" y="170" width="66" height="28" fill="#a1401f"/>`+T(260,225,'Cu₂O','font-size="12"')],
  ['Iodoform: methyl ketones (and ethanol) give a yellow precipitate.',`<rect x="390" y="40" width="70" height="160" rx="14" fill="#f8f2d8" stroke="${ink}"/><rect x="392" y="170" width="66" height="28" fill="#e2c13a"/>`+T(425,225,'CHI₃','font-size="12"')]]},
 seeNote:'Try them on unknowns in the lab.',
 do:{title:'Distinguishing tests (teacher demonstration)',mat:'Freshly prepared Tollens\' reagent, Fehling\'s A and B, iodine–NaOH, ethanal, propanone, benzaldehyde; warm water bath',steps:['Warm each sample with Tollens\' reagent in a clean tube.','Warm each with Fehling\'s solution.','Warm each with iodine and NaOH.'],obs:'Ethanal: mirror, red precipitate, yellow precipitate. Propanone: only yellow precipitate. Benzaldehyde: only mirror.',why:'Aldehydes are reducing agents; methyl ketones give iodoform. Safety: dispose of Tollens\' reagent promptly; never store it.',lab:true},
 memo:'"Tollens\': all aldehydes. Fehling\'s: aliphatic aldehydes only. Iodoform: CH₃CO– (and CH₃CH(OH)–)."',
 miscon:['"Ketones give the silver mirror." They don\'t.','"Benzaldehyde gives Fehling\'s test." Aromatic aldehydes do not.'],
 terms:['Clemmensen reduction','Wolff–Kishner reduction','Tollens\' test','Fehling\'s test','Haloform reaction'],
 q:{q:'Which compound gives both Tollens\' and iodoform tests?',o:['Methanal','Ethanal','Propanone','Benzaldehyde'],a:1,why:'Ethanal is an aldehyde with a CH₃CO– group.'},
 exam:'Distinguishing-test questions are among the most frequent 2–3 mark items.'},
{id:'s5',num:'8.4',title:'Aldol condensation and Cannizzaro reaction',
 intro:'Two ethanal molecules, a drop of dilute alkali, and they join into a bigger molecule. How?',
 obj:'Explain the role of α-hydrogens, and write aldol, cross aldol and Cannizzaro reactions.',
 prior:'Nucleophilic addition (8.4).',
 simple:'Hydrogens on the carbon next to C=O (α-hydrogens) are acidic. Aldehydes and ketones with at least one α-hydrogen, in dilute alkali, join together: aldol condensation. Those without α-hydrogens (like methanal and benzaldehyde), in concentrated alkali, undergo Cannizzaro reaction: one molecule is reduced to an alcohol and another oxidised to an acid salt.',
 detail:'Acidity of α-hydrogens: the strong electron-withdrawing effect of the carbonyl group and resonance stabilisation of the conjugate base (enolate) make α-hydrogens acidic. Aldol reaction: aldehydes and ketones with at least one α-hydrogen, in dilute alkali, give β-hydroxy aldehydes (aldols) or β-hydroxy ketones (ketols), which readily lose water on heating to give α,β-unsaturated carbonyl compounds (aldol condensation products). Example: 2CH₃CHO (dil. NaOH) → CH₃CH(OH)CH₂CHO (3-hydroxybutanal) → (Δ, −H₂O) CH₃CH=CHCHO (but-2-enal). Cross aldol: between two different carbonyl compounds; with two compounds each having α-hydrogens, four products form; it is most useful when one partner has no α-hydrogen. Cannizzaro reaction: aldehydes with no α-hydrogen, heated with concentrated alkali, undergo self-oxidation and reduction (disproportionation): 2HCHO + conc. KOH → CH₃OH + HCOOK; 2C₆H₅CHO + conc. NaOH → C₆H₅CH₂OH + C₆H₅COONa.',
 real:'Aldol reactions build many fragrances and medicines; living cells use enzyme-controlled aldol reactions in sugar metabolism.',
 apply:'Which of these undergo aldol and which Cannizzaro: methanal, ethanal, benzaldehyde, propanone, 2,2-dimethylpropanal?',
 see:{w:520,h:240,f:[
  ['α-hydrogen present → aldol (dilute alkali).',pill(140,50,'2 CH₃CHO','#fbefec',140)+T(290,56,'→','font-size="18"')+pill(400,50,'CH₃CH(OH)CH₂CHO','#e8f2f6',200)],
  ['Heat: water is lost → α,β-unsaturated aldehyde.',pill(400,120,'CH₃CH=CHCHO','#e8f2f6',180)],
  ['No α-hydrogen → Cannizzaro (conc. alkali): alcohol + acid salt.',pill(140,200,'2 HCHO','#fbefec',110)+T(260,206,'→','font-size="18"')+pill(400,200,'CH₃OH + HCOOK','#e8f2f6',180)]]},
 seeNote:'Look for α-hydrogens first.',
 do:{title:'α-hydrogen hunt',mat:'Structures of ten carbonyl compounds',steps:['Circle the α-carbon(s) in each.','Count the α-hydrogens.','Sort into "aldol" and "Cannizzaro".'],obs:'HCHO, C₆H₅CHO, (CH₃)₃CCHO have none.',why:'Aldol needs an enolate, which needs an α-hydrogen.',lab:false},
 memo:'"α-H? Aldol in dilute. No α-H? Cannizzaro in concentrated."',
 miscon:['"Benzaldehyde gives aldol on its own." It has no α-hydrogen; it gives Cannizzaro.','"Aldol needs concentrated alkali." Dilute alkali; Cannizzaro needs concentrated.'],
 terms:['α-hydrogen','Enolate','Aldol','Aldol condensation','Cross aldol','Cannizzaro reaction','Disproportionation'],
 q:{q:'Which does NOT undergo aldol condensation?',o:['Ethanal','Propanone','Benzaldehyde','Propanal'],a:2,why:'No α-hydrogen.'},
 exam:'Aldol and Cannizzaro equations, with conditions, are frequent 2–3 mark items.'},
{id:'s6',num:'8.5–8.9',title:'Carboxylic acids: preparation, acidity and reactions',
 intro:'Why is chloroacetic acid about a hundred times stronger than acetic acid?',
 obj:'Prepare carboxylic acids, explain their high boiling points and the effect of substituents on acidity, and write their important reactions.',
 prior:'Carbonyl chemistry (8.4); resonance.',
 simple:'Carboxylic acids are made by oxidising alcohols, aldehydes or alkylbenzenes, by hydrolysing nitriles, or from Grignard reagents and CO₂. They have high boiling points because their molecules pair up by hydrogen bonding. They are acidic because the carboxylate ion is stabilised by resonance. Electron-withdrawing groups make them stronger acids; electron-donating groups make them weaker.',
 detail:'Preparation: oxidation of primary alcohols and aldehydes; oxidation of alkylbenzenes with alkaline KMnO₄ (the whole side chain becomes –COOH); hydrolysis of nitriles and amides; Grignard reagent + dry ice (CO₂), then acid; hydrolysis of acyl halides, anhydrides and esters. Physical properties: higher boiling points than aldehydes, ketones and even alcohols of similar mass, because of extensive intermolecular hydrogen bonding; in the vapour phase or aprotic solvents most exist as cyclic dimers. Acidity: RCOOH ⇌ RCOO⁻ + H⁺; the carboxylate ion is stabilised by two equivalent resonance structures. Carboxylic acids are weaker than mineral acids but stronger than alcohols and many phenols. Electron-withdrawing groups (–Cl, –F, –NO₂, –CN) increase acidity; electron-donating groups decrease it. Order: CF₃COOH > CCl₃COOH > CHCl₂COOH > NO₂CH₂COOH > NC–CH₂COOH > FCH₂COOH > ClCH₂COOH > BrCH₂COOH > HCOOH > ClCH₂CH₂COOH > C₆H₅COOH > C₆H₅CH₂COOH > CH₃COOH > CH₃CH₂COOH. Reactions: with metals and alkalis to give salts; with carbonates and hydrogencarbonates, releasing CO₂ (a test); with alcohols and acid catalyst to give esters (esterification); with PCl₅, PCl₃ or SOCl₂ to give acid chlorides; with NH₃ to give amides; decarboxylation with soda lime (NaOH + CaO) to give alkanes; Kolbe electrolysis of salts; reduction by LiAlH₄ to primary alcohols; Hell–Volhard–Zelinsky (HVZ) reaction: α-halogenation with Cl₂ or Br₂ and red phosphorus; electrophilic substitution in aromatic acids at the meta position.',
 real:'Ethanoic acid in vinegar, citric acid in lemons and the long-chain acids in soaps and fats are all carboxylic acids.',
 apply:'Arrange in increasing order of acid strength: benzoic acid, 4-nitrobenzoic acid, 4-methoxybenzoic acid.',
 see:{w:520,h:240,f:[
  ['The carboxylate ion is stabilised by resonance: the charge is shared by both oxygens.',pill(260,50,'R–COO⁻ ↔ R–COO⁻','#e8f2f6',220)],
  ['Electron-withdrawing groups pull charge away: stronger acid.',pill(150,130,'Cl–CH₂COOH','#fbefec',150)+T(360,136,'stronger than CH₃COOH','font-size="13"')],
  ['Electron-donating groups push charge in: weaker acid.',pill(150,200,'CH₃CH₂COOH','#fbefec',150)+T(360,206,'weaker than CH₃COOH','font-size="13"')]]},
 seeNote:'Compare pKa values in the Visuals tab.',
 do:{title:'Bicarbonate test',mat:'Sodium hydrogencarbonate solution, ethanoic acid, ethanol, phenol solution, test tubes',steps:['Add each liquid to 2 mL of NaHCO₃ solution.','Watch for effervescence.','Test any gas with lime water.'],obs:'Only ethanoic acid gives brisk effervescence (CO₂).',why:'Carboxylic acids are stronger than carbonic acid; phenol and ethanol are not.',lab:true},
 memo:'"Pull (EWG) strengthens, push (EDG) weakens."',
 miscon:['"Carboxylic acids are as strong as HCl." They are weak acids.','"More chlorine atoms make it weaker." More EWGs make it stronger.'],
 terms:['Carboxylate ion','Resonance stabilisation','pKa','Decarboxylation','HVZ reaction','Esterification'],
 q:{q:'Which is the strongest acid?',o:['CH₃COOH','ClCH₂COOH','Cl₂CHCOOH','Cl₃CCOOH'],a:3,why:'Three electron-withdrawing Cl atoms.'},
 exam:'Acidity order with reasons, HVZ, decarboxylation and the NaHCO₃ test are frequent 2–3 mark items.'}
];

const CARDS=[['Carbonyl carbon','sp², trigonal planar, δ+ (electrophilic).'],['Naming','-al (aldehyde), -one (ketone), -oic acid (acid).'],['PCC','Oxidises 1° alcohol to aldehyde without going on to acid.'],['Rosenmund','RCOCl + H₂ (Pd/BaSO₄) → RCHO.'],['Stephen','RCN + SnCl₂/HCl → imine → H₃O⁺ → RCHO.'],['Etard','Toluene + CrO₂Cl₂ → benzaldehyde.'],['Friedel–Crafts acylation','ArH + RCOCl (anhydrous AlCl₃) → ArCOR.'],['Reactivity','Aldehydes > ketones (steric + electronic).'],['Z–NH₂ products','Oxime, hydrazone, phenylhydrazone, 2,4-DNP derivative, semicarbazone.'],['Clemmensen','Zn–Hg + conc. HCl: C=O → CH₂.'],['Wolff–Kishner','NH₂NH₂ then KOH/ethylene glycol: C=O → CH₂.'],["Tollens' test",'Aldehydes give a silver mirror.'],["Fehling's test",'Aliphatic aldehydes give red-brown Cu₂O.'],['Iodoform test','CH₃CO– compounds (and ethanol) give yellow CHI₃.'],['Aldol','α-H present, dilute alkali: β-hydroxy carbonyl → α,β-unsaturated.'],['Cannizzaro','No α-H, conc. alkali: alcohol + acid salt.'],['Acidity','EWG increases, EDG decreases; carboxylate resonance.'],['HVZ','RCH₂COOH + X₂/red P → α-halo acid.'],['Decarboxylation','RCOONa + NaOH/CaO (heat) → RH.'],['NaHCO₃ test','Carboxylic acids give CO₂.']];

const Q=[
 {lv:1,q:'The IUPAC name of CH₃COCH₃ is:',o:['Propanal','Propanone','Ethanone','Acetaldehyde'],a:1,w:'Three carbons, ketone.'},
 {lv:1,q:'Which reagent gives a silver mirror with aldehydes?',o:["Fehling's solution","Tollens' reagent",'2,4-DNP','I₂/NaOH'],a:1,w:'Ammoniacal silver nitrate.'},
 {lv:1,q:'True or false: benzaldehyde gives a positive Fehling\'s test.',o:['True','False'],a:1,w:'Aromatic aldehydes do not.'},
 {lv:1,q:'Clemmensen reduction converts a carbonyl group into:',o:['–CH₂–','–CHOH–','–COOH','–C≡C–'],a:0,w:'Zn–Hg/HCl reduces C=O to CH₂.'},
 {lv:2,q:'Which will undergo Cannizzaro reaction?',o:['Ethanal','Propanal','Methanal','Propanone'],a:2,w:'No α-hydrogen.'},
 {lv:2,q:'Aldehydes are more reactive than ketones towards nucleophiles because of:',o:['Only steric reasons','Only electronic reasons','Both steric and electronic reasons','Hydrogen bonding'],a:2,w:'Less crowding and greater δ+.'},
 {lv:2,q:'Carboxylic acids have higher boiling points than alcohols of similar mass because of:',o:['Ionic bonds','More extensive hydrogen bonding (dimers)','Higher molar mass','Resonance only'],a:1,w:'Strong intermolecular H-bonding.'},
 {lv:3,q:'Which pair can be distinguished by the iodoform test?',o:['Ethanal and propanone','Propanone and pentan-3-one','Methanal and benzaldehyde','Ethanoic acid and benzoic acid'],a:1,w:'Propanone is a methyl ketone; pentan-3-one is not.'},
 {lv:3,q:'The product of aldol condensation of ethanal (after heating) is:',o:['Butanal','But-2-enal','3-Hydroxybutanal','Ethanol'],a:1,w:'3-hydroxybutanal loses water.'},
 {lv:3,q:'Toluene treated with alkaline KMnO₄ and then acid gives:',o:['Benzaldehyde','Benzyl alcohol','Benzoic acid','Phenol'],a:2,w:'The side chain is oxidised to –COOH.'},
 {lv:4,q:'Assertion (A): Chloroacetic acid is stronger than acetic acid. Reason (R): –Cl is electron-withdrawing and stabilises the carboxylate ion.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'The inductive effect spreads the negative charge.'},
 {lv:4,q:'A compound C₃H₆O gives 2,4-DNP and iodoform tests but not Tollens\'. It is:',o:['Propanal','Propanone','Propan-2-ol','Prop-2-en-1-ol'],a:1,w:'Carbonyl, methyl ketone, not an aldehyde.'},
 {lv:4,q:'Increasing order of reactivity towards HCN: ',o:['Di-tert-butyl ketone < methyl tert-butyl ketone < acetone < acetaldehyde','Acetaldehyde < acetone < methyl tert-butyl ketone < di-tert-butyl ketone','Acetone < acetaldehyde < di-tert-butyl ketone < methyl tert-butyl ketone','All equal'],a:0,w:'More bulky/donating groups → less reactive.'},
 {lv:5,open:true,m:3,q:'Write the mechanism of nucleophilic addition of HCN to a carbonyl compound and explain why aldehydes are more reactive than ketones.',ans:['CN⁻ (from HCN with base) attacks δ+ carbon; sp² → sp³ tetrahedral alkoxide (1).','Protonation gives cyanohydrin (1).','Ketones: two alkyl groups hinder attack and reduce δ+ (1).']},
 {lv:5,open:true,m:3,q:'Give simple chemical tests to distinguish: (i) propanal and propanone, (ii) benzaldehyde and acetophenone, (iii) phenol and benzoic acid.',ans:["(i) Tollens' or Fehling's: propanal positive (1).","(ii) Tollens': benzaldehyde positive; iodoform: acetophenone positive (1).",'(iii) NaHCO₃: benzoic acid effervesces; or FeCl₃: phenol gives violet colour (1).']},
 {lv:5,open:true,m:5,q:'Write equations for: (a) Rosenmund reduction, (b) Etard reaction, (c) Cannizzaro reaction of HCHO, (d) HVZ reaction, (e) decarboxylation.',ans:['RCOCl + H₂ → RCHO + HCl (Pd–BaSO₄) (1).','C₆H₅CH₃ + CrO₂Cl₂ (CS₂) → chromium complex → H₃O⁺ → C₆H₅CHO (1).','2HCHO + conc. KOH → CH₃OH + HCOOK (1).','RCH₂COOH + X₂ (red P) → RCHXCOOH + HX (1).','RCOONa + NaOH (CaO, heat) → RH + Na₂CO₃ (1).']}
];

const ONEMIN=['C=O: sp², planar, Cδ+ Oδ−.','Names: -al, -one, -oic acid.','Prepare: oxidise alcohols (PCC stops at aldehyde), ozonolysis, Rosenmund, Stephen, Etard, Friedel–Crafts.','Nucleophilic addition; aldehydes > ketones.','HCN, NaHSO₃, Grignard, alcohols, Z–NH₂ (oxime, hydrazone, 2,4-DNP).','Reduce: NaBH₄/LiAlH₄ (alcohol); Clemmensen / Wolff–Kishner (CH₂).',"Tests: Tollens' (all aldehydes), Fehling's (aliphatic), iodoform (CH₃CO–).",'α-H: aldol (dilute base); no α-H: Cannizzaro (conc. base).','Acids: H-bonded dimers; carboxylate resonance; EWG ↑ acidity.','Acid reactions: NaHCO₃ → CO₂, esters, acid chlorides, amides, decarboxylation, HVZ.'];
const KEYS=[['carbonyl / C=O',/carbonyl|c=o/i],['sp² / planar',/sp2|sp²|planar/i],['nucleophile',/nucleophil/i],['aldehyde vs ketone reactivity',/steric|electronic|reactiv/i],["Tollens'",/tollen|silver/i],["Fehling's",/fehling|cu₂o|cu2o/i],['iodoform',/iodoform|chi/i],['α-hydrogen',/α|alpha/i],['aldol',/aldol/i],['Cannizzaro',/cannizzaro/i],['acidity / resonance',/acid|resonan|carboxylate/i],['electron-withdrawing',/withdraw|ewg|-i effect/i],['NaHCO₃ / CO₂',/nahco|bicarbonate|hydrogencarbonate|co₂|co2/i]];

/* ---------- lab ---------- */
const CMP=[['Methanal',1,1,1,0,0],['Ethanal',1,1,1,1,0],['Propanone',1,0,0,1,0],['Benzaldehyde',1,1,0,0,0],['Acetophenone',1,0,0,1,0],['Pentan-3-one',1,0,0,0,0],['Ethanoic acid',0,0,0,0,1],['Ethanol',0,0,0,1,0]];
const ORDER=[3,0,6,2,7,5,1,4];let seen={};
const TEST={dnp:['2,4-DNP',1,'Orange-yellow precipitate (2,4-dinitrophenylhydrazone): a carbonyl group is present.','No precipitate: no aldehyde or ketone group.','#e8a33a'],
 tol:["Tollens' reagent",2,'Silver mirror on the inside of the tube: an aldehyde (a reducing agent).','No mirror: not an aldehyde.','#b8bec4'],
 feh:["Fehling's solution",3,'Red-brown precipitate of Cu₂O: an aliphatic aldehyde.','Stays blue: not an aliphatic aldehyde.','#a1401f'],
 iod:['Iodine and NaOH',4,'Yellow precipitate of iodoform (CHI₃), with an antiseptic smell: a CH₃CO– group (or CH₃CH(OH)–).','No yellow precipitate.','#e2c13a'],
 bic:['NaHCO₃ solution',5,'Brisk effervescence; the gas turns lime water milky (CO₂): a carboxylic acid.','No effervescence.','#ffffff']};
function draw(tk){const c=CMP[ORDER[+$('#uC').value]],t=TEST[tk],pos=tk?c[t[1]]===1:false;
 let s=`<rect x="170" y="30" width="120" height="250" rx="22" fill="none" stroke="${ink}" stroke-width="2.5"/>`;
 const base=tk==='feh'?'#6fa8e0':tk==='iod'?'#d8b25a':tk==='tol'?'#e6e8ea':tk==='dnp'?'#f0c98a':'#eef4f7';s+=`<rect x="172" y="130" width="116" height="148" rx="20" fill="${base}" opacity="${tk?.6:.2}"/>`;
 if(pos){if(tk==='tol')s+=`<rect x="172" y="130" width="10" height="148" fill="#9aa1a8"/><rect x="278" y="130" width="10" height="148" fill="#9aa1a8"/><rect x="172" y="262" width="116" height="16" rx="8" fill="#9aa1a8"/>`;
  else if(tk==='bic')for(let i=0;i<18;i++)s+=`<circle cx="${185+(i*37)%90}" cy="${140+(i*53)%130}" r="${3+i%3}" fill="none" stroke="#2e6f8a" stroke-width="1.5"/>`;
  else s+=`<rect x="174" y="246" width="112" height="30" rx="14" fill="${t[4]}"/>`}
 s+=T(230,305,tk?t[0]:'Choose a test','font-size="13"');$('#uT').innerHTML=s}
function labInit(){$('#uG').innerHTML='<option value="">choose…</option>'+CMP.map((c,i)=>`<option value="${i}">${c[0]}</option>`).join('')}
function labShow(){draw(null);$('#uOut').innerHTML='<p>No tests run yet.</p>'}
function labClick(b){if(b.dataset.test){const k=b.dataset.test,ci=ORDER[+$('#uC').value],c=CMP[ci],t=TEST[k],pos=c[t[1]]===1;draw(k);seen[ci]=seen[ci]||{};seen[ci][k]=pos;
  $('#uOut').innerHTML=Object.entries(seen[ci]).map(([kk,p])=>`<p><b>${TEST[kk][0]}:</b> ${p?TEST[kk][2]:TEST[kk][3]}</p>`).join('');return true}
 if(b.id==='uCheck'){const ci=ORDER[+$('#uC').value],g=$('#uG').value;if(g===''){$('#uFb').innerHTML='<p class="fb no">Choose a compound first.</p>';return true}
  $('#uFb').innerHTML=+g===ci?`<p class="fb ok">Correct: it is ${CMP[ci][0]}.</p>`:`<p class="fb no">Not ${CMP[+g][0]}. Compare your test results with what ${CMP[+g][0]} would give.</p>`;return true}return false}
function labChange(t){if(t.id==='uC'){draw(null);const ci=ORDER[+t.value];$('#uOut').innerHTML=seen[ci]?Object.entries(seen[ci]).map(([kk,p])=>`<p><b>${TEST[kk][0]}:</b> ${p?TEST[kk][2]:TEST[kk][3]}</p>`).join(''):'<p>No tests run yet.</p>';$('#uFb').innerHTML='';return true}return t.id==='uG'}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
