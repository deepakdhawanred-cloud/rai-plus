/* Rai Plus content pack: Class 11 Biology, Chapter 15 – Body Fluids and Circulation */
RP.register({key:'11bio15',cls:'11',subject:'Biology',ch:'15',title:"Body Fluids and Circulation",color:'#9b2335',
crumb:"HBSE Class 11 Biology · Unit: Human Physiology · Taught in November",h1:"Chapter 15: Body Fluids and Circulation",sub:"Blood and lymph, the four-chambered heart, the cardiac cycle and ECG, and double circulation.",heroLabel:"A heart with its ECG trace",labName:'Heart lab',
theme:"\n:root{--g:light-dark(#9b2335,#f0a1ad);--g2:light-dark(#fbecee,#220c10);--line:light-dark(#f0d0d5,#4a2329);--bg:light-dark(#ffffff,#130809);--card:light-dark(#ffffff,#1b0d10);\n--ink:light-dark(#22090e,#f6e4e7);--mute:light-dark(#6e4b52,#cdaab1);--y:light-dark(#185fa5,#85b7eb);--y2:light-dark(#e6f1fb,#0c1e33);--hd:#741726}\n",
labHTML:`  <h2>Heart lab</h2>
  <div class="ctrl"><label>Activity<select id="hMode"><option value="cyc">Cardiac cycle and ECG</option><option value="bg">Blood group compatibility</option></select></label></div>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="hSvg" viewBox="0 0 480 360" role="img" aria-label="Heart lab" style="color:var(--ink)"></svg></div></div>
  <div><div id="hCtl"></div><div class="box y" id="hOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#9b2335',LABNAME='Heart lab',MIND_CENTER='Circulation';
const RD='#c0392b',BL='#2e6fb5',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const cell=(x,y,r,f,o='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${o}/>`;
function ecgY(t){/* t in s within 0.8 s cycle; returns mV-ish */const g=(c,w,a)=>a*Math.exp(-((t-c)**2)/(2*w*w));return g(0.05,0.022,0.15)+g(0.14,0.008,-0.12)+g(0.16,0.009,1.1)+g(0.18,0.008,-0.25)+g(0.36,0.035,0.3)}
const ecgPath=(x0,y0,W,H,cycles=1)=>{let d='';for(let i=0;i<=400;i++){const tt=i/400*0.8*cycles;d+=(i?'L':'M')+(x0+i/400*W).toFixed(1)+' '+(y0-ecgY(tt%0.8)*H).toFixed(1)}return d};
function heroDraw(){return `<path d="M60 50 C60 20 100 20 100 50 C100 20 140 20 140 50 C140 80 100 100 100 115 C100 100 60 80 60 50Z" fill="#fff" opacity=".85"/><path d="${ecgPath(160,80,120,40)}" fill="none" stroke="#fff" stroke-width="2"/>`}
const HERO=heroDraw;
const MIND=[['Blood: plasma + cells',100,50],['Blood groups & clotting',420,50],['Lymph',90,150],['Heart structure',430,150],['Cardiac cycle & ECG',110,250],['Double circulation, disorders',410,250]];

const C=[
{id:'b1',num:'15.1',title:'Blood: plasma and formed elements',
 intro:'Spin a tube of blood and it separates into a pale yellow liquid and a red layer. What are they?',
 obj:'Describe the composition of plasma and the formed elements (RBCs, WBCs, platelets) with their numbers and functions.',
 prior:'Connective tissue (Class 11 Ch 7); breathing and gas transport (Ch 14).',
 simple:'Blood is a special connective tissue: a fluid matrix (plasma) with formed elements. Plasma is about 55% of blood; it is mostly water with proteins, salts, glucose and other substances. Formed elements (about 45%) are red blood cells (erythrocytes) that carry oxygen, white blood cells (leucocytes) that defend the body, and platelets (thrombocytes) that help clotting.',
 detail:'Plasma: straw-coloured, viscous; 90–92% water, 6–8% proteins. Proteins: fibrinogen (clotting), globulins (defence), albumins (osmotic balance). Plasma also has small amounts of minerals (Na⁺, Ca²⁺, Mg²⁺, HCO₃⁻, Cl⁻), glucose, amino acids, lipids. Plasma without clotting factors is serum. RBCs: most abundant, 5–5.5 million per mm³ in a healthy adult; formed in red bone marrow in adults; no nucleus in most mammals; biconcave shape; red due to haemoglobin (12–16 g per 100 mL); life span about 120 days; destroyed in the spleen ("graveyard of RBCs"). WBCs: nucleated, colourless, 6000–8000 per mm³, short-lived. Granulocytes: neutrophils (60–65%, phagocytic), eosinophils (2–3%, resist infection, allergic reactions), basophils (0.5–1%, secrete histamine, serotonin, heparin; inflammation). Agranulocytes: lymphocytes (20–25%; B and T cells, immunity), monocytes (6–8%, phagocytic). Platelets: cell fragments from megakaryocytes in bone marrow; 1.5–3.5 lakh per mm³; release clotting factors.',
 real:'A complete blood count (CBC) report lists exactly these: RBC count, haemoglobin, WBC count with percentages of each type, and platelet count.',
 apply:'A report shows a platelet count of 50,000 per mm³. What problem might this person face?',
 see:{w:520,h:240,f:[
  ['Centrifuged blood: plasma above (≈55%), formed elements below (≈45%).',`<rect x="60" y="20" width="60" height="200" rx="8" fill="none" stroke="${ink}" stroke-width="2"/><rect x="62" y="22" width="56" height="108" fill="#f5e6a8"/><rect x="62" y="130" width="56" height="88" fill="${RD}"/>`+lbl(160,80,'plasma 55%','text-anchor="start"')+lbl(160,180,'cells 45%','text-anchor="start"')],
  ['RBC: biconcave, no nucleus, haemoglobin.',`<ellipse cx="320" cy="60" rx="30" ry="22" fill="${RD}"/><ellipse cx="320" cy="60" rx="13" ry="9" fill="#e07b6f"/>`+lbl(420,64,'RBC 5–5.5 million/mm³','font-size="12"')],
  ['WBC: nucleated, defence. Platelets: fragments for clotting.',`<circle cx="320" cy="140" r="26" fill="#e9e3f5" stroke="#7f77dd"/><path d="M306 136 q8 -14 16 0 q8 14 16 0" fill="#7f77dd"/>`+lbl(420,144,'WBC 6000–8000/mm³','font-size="12"')+[0,1,2].map(i=>cell(305+i*14,205,4,'#c58ea4')).join('')+lbl(420,209,'platelets 1.5–3.5 lakh/mm³','font-size="12"')]]},
 seeNote:'Not to scale.',
 do:{title:'Read a blood report',mat:'A sample CBC report (anonymised)',steps:['Find RBC count, Hb, WBC count, differential count and platelets.','Compare each with the normal range.'],obs:'Each value matches a formed element in this chapter.',why:'CBC measures formed elements.',lab:false},
 memo:'"Never Let Monkeys Eat Bananas: neutrophils > lymphocytes > monocytes > eosinophils > basophils."',
 miscon:['"Serum and plasma are the same." Serum is plasma without clotting factors.','"All WBCs are phagocytes." Lymphocytes act through immunity.'],
 terms:['Plasma','Serum','Erythrocyte','Haemoglobin','Leucocyte','Granulocyte','Agranulocyte','Thrombocyte'],
 q:{q:'The most abundant WBCs are:',o:['lymphocytes','neutrophils','monocytes','basophils'],a:1,why:'60–65%.'},
 exam:'Composition of plasma and WBC types with percentages are frequent 2–3 mark questions.'},

{id:'b2',num:'15.1.3',title:'Blood groups and coagulation',
 intro:'Why can a person with group O give blood to almost anyone, but receive only group O?',
 obj:'Explain the ABO and Rh blood groups, transfusion compatibility, erythroblastosis foetalis, and the clotting cascade.',
 prior:'Plasma proteins; antigens and antibodies.',
 simple:'ABO grouping depends on antigens A and B on RBC surfaces; plasma carries the opposite natural antibodies. Group A has antigen A and anti-B; group B has antigen B and anti-A; AB has both antigens and no antibodies (universal recipient); O has no antigens and both antibodies (universal donor). The Rh antigen is present in Rh+ people and absent in Rh−. Clotting: injured tissue and platelets set off a cascade that turns fibrinogen into fibrin threads, which trap cells into a clot.',
 detail:'Donor–recipient rule: the donor\'s RBC antigens must not meet matching antibodies in the recipient\'s plasma. A → A, AB; B → B, AB; AB → AB only; O → all. Rh: nearly 80% of humans are Rh+. An Rh− person exposed to Rh+ blood forms anti-Rh antibodies. Erythroblastosis foetalis: an Rh− mother carrying an Rh+ fetus; in the first pregnancy the blood is kept apart by the placenta, but some fetal blood may mix at delivery, so the mother makes anti-Rh antibodies; in later Rh+ pregnancies these cross the placenta and destroy fetal RBCs, causing severe anaemia and jaundice. It is prevented by giving the mother anti-Rh antibodies right after the first delivery. Coagulation: at the injury, platelets and tissue release factors; a cascade forms the enzyme thrombokinase, which converts inactive prothrombin into thrombin; thrombin converts fibrinogen into fibrin, whose network traps formed elements to make a clot. Calcium ions are essential for clotting.',
 real:'Blood banks cross-match donor and patient blood before every transfusion.',
 apply:'A patient is AB Rh−. From which groups can they receive red cells safely?',
 see:{w:520,h:240,f:[
  ['Group A RBC carries antigen A; plasma has anti-B.',`<circle cx="90" cy="90" r="40" fill="${RD}" opacity=".8"/>`+[0,1,2,3,4,5].map(i=>{const a=i*Math.PI/3;return `<path d="M${90+40*Math.cos(a)} ${90+40*Math.sin(a)} l${8*Math.cos(a)} ${8*Math.sin(a)}" stroke="${ink}" stroke-width="3"/>`}).join('')+lbl(90,160,'A: antigen A, anti-B')],
  ['O: no antigens → universal donor. AB: no antibodies → universal recipient.',lbl(330,70,'O → everyone','font-weight="700"')+lbl(330,100,'AB ← everyone','font-weight="700"')],
  ['Clotting: thrombokinase → prothrombin → thrombin; fibrinogen → fibrin threads.',`<path d="M220 160 L460 160" stroke="${GR}"/>`+lbl(340,180,'prothrombin → thrombin','font-size="12"')+lbl(340,200,'fibrinogen → fibrin (needs Ca²⁺)','font-size="12"')+[0,1,2,3,4].map(i=>`<line x1="${240+i*45}" y1="215" x2="${280+i*40}" y2="235" stroke="#a07a3a" stroke-width="2"/>`).join('')]]},
 seeNote:'Antigens on cells; antibodies in plasma.',
 do:{title:'Compatibility grid',mat:'A 4 × 4 grid',steps:['Write donor groups across, recipient groups down.','Tick a box if donor RBC antigens are not attacked by recipient antibodies.'],obs:'O column all ticks; AB row all ticks.',why:'Antigen–antibody rule.',lab:true},
 memo:'"O gives to all; AB takes from all."',
 miscon:['"Universal donor O can give whole plasma to anyone." The rule is about red cells; plasma antibodies matter too.','"Rh problem in the first pregnancy." Usually in the second and later.'],
 terms:['Antigen','Antibody','Universal donor/recipient','Rh factor','Erythroblastosis foetalis','Thrombokinase','Prothrombin','Fibrin'],
 q:{q:'A person with group B has in their plasma:',o:['anti-A','anti-B','both','none'],a:0,why:'Antibody opposite to own antigen.'},
 exam:'Donor–recipient table and erythroblastosis foetalis are 3-mark favourites.'},

{id:'b3',num:'15.2',title:'Lymph (tissue fluid)',
 intro:'Fluid leaks out of capillaries all the time. Why don\'t our tissues swell up?',
 obj:'Describe how tissue fluid forms and the role of the lymphatic system.',
 prior:'Blood plasma.',
 simple:'As blood passes through capillaries, water and small solutes move out into spaces between cells; this is tissue fluid (interstitial fluid). It has the same mineral distribution as plasma but fewer large proteins and no RBCs. Exchange of nutrients and gases between blood and cells happens through it. Lymph vessels collect this fluid and drain it back into major veins.',
 detail:'Lymph is a colourless fluid containing specialised lymphocytes responsible for immune responses. It is an important carrier for nutrients and hormones. Fats are absorbed through lymph in the lacteals present in the intestinal villi. The lymphatic system also returns proteins and fluid to the blood.',
 real:'Swollen glands in the neck during an infection are lymph nodes busy with immune activity.',
 apply:'How is lymph different from blood?',
 see:{w:520,h:220,f:[
  ['Blood capillary: fluid leaks out between cells.',`<path d="M40 110 H480" stroke="${RD}" stroke-width="18" opacity=".6"/>`+[0,1,2,3,4].map(i=>`<path d="M${90+i*80} 100 v-30" stroke="#f5e6a8" stroke-width="3"/>`).join('')],
  ['Tissue fluid bathes cells: exchange happens here.',[0,1,2,3,4,5].map(i=>`<rect x="${60+i*70}" y="20" width="50" height="40" rx="8" fill="#f3d6db"/>`).join('')],
  ['Lymph vessels collect it and return it to veins.',`<path d="M40 180 H480" stroke="#c9b46b" stroke-width="10" opacity=".8"/>`+lbl(260,205,'lymph vessel: lymphocytes, absorbed fats')]]},
 seeNote:'Lymph has lymphocytes, no RBCs.',
 do:{title:'Compare three fluids',mat:'A table',steps:['Make columns: blood, tissue fluid, lymph.','Fill: RBCs, large proteins, lymphocytes, where found.'],obs:'Only blood has RBCs.',why:'Large items stay in vessels.',lab:false},
 memo:'"Leak out, collect up, drain back."',
 miscon:['"Lymph is just plasma." It has fewer proteins and many lymphocytes, no RBCs.'],
 terms:['Tissue (interstitial) fluid','Lymph','Lymphatic system','Lacteals'],
 q:{q:'Fats are absorbed into:',o:['blood capillaries','lacteals','arteries','the heart'],a:1,why:'Lymph vessels in villi.'},
 exam:'Lymph composition and function: 2 marks.'},

{id:'b4',num:'15.3',title:'Circulatory pathways and the human heart',
 intro:'A fish heart has two chambers, a frog\'s three, yours four. Why does that matter?',
 obj:'Compare open and closed circulation across vertebrates, and describe the structure of the human heart.',
 prior:'Lymph and blood.',
 simple:'Arthropods and molluscs have open circulation (blood flows into open spaces); annelids and chordates have closed circulation (blood always in vessels). Fishes have a 2-chambered heart (single circulation); amphibians and most reptiles 3 chambers (mixed blood); crocodiles, birds and mammals 4 chambers, so oxygenated and deoxygenated blood never mix (double circulation). The human heart has two atria and two ventricles, separated by septa, with valves that keep blood flowing one way.',
 detail:'The human heart is mesodermal, in the thoracic cavity between the lungs, slightly tilted to the left, about the size of a clenched fist. It is protected by a double-walled pericardium with pericardial fluid. Chambers: two thin-walled upper atria and two thick-walled lower ventricles. Septa: inter-atrial, inter-ventricular and atrio-ventricular. Valves: tricuspid (right AV), bicuspid or mitral (left AV), semilunar valves at the openings of the pulmonary artery (from right ventricle) and aorta (from left ventricle). Valves allow one-way flow and prevent backflow. Cardiac muscle throughout. Nodal tissue: sino-atrial node (SAN) in the right upper corner of the right atrium; atrio-ventricular node (AVN) in the lower left corner of the right atrium; AV bundle (bundle of His) → right and left bundle branches → Purkinje fibres in the ventricle walls. The SAN generates the most action potentials (about 70–75 per minute) and so is the pacemaker.',
 real:'An artificial pacemaker takes over the SAN\'s job when it fails to set a steady rhythm.',
 apply:'Why is the left ventricle wall thicker than the right?',
 see:{w:520,h:280,f:[
  ['Four chambers: right atrium and ventricle (deoxygenated), left atrium and ventricle (oxygenated).',`<rect x="140" y="40" width="110" height="90" rx="20" fill="${BL}" opacity=".55"/><rect x="270" y="40" width="110" height="90" rx="20" fill="${RD}" opacity=".55"/><path d="M140 140 h110 v70 q-50 60 -110 0z" fill="${BL}" opacity=".7"/><path d="M270 140 h110 v70 q-50 60 -110 0z" fill="${RD}" opacity=".8"/>`+lbl(195,90,'RA')+lbl(325,90,'LA')+lbl(195,185,'RV')+lbl(325,185,'LV')],
  ['Valves: tricuspid (right), bicuspid/mitral (left).',`<path d="M170 135 h50" stroke="${ink}" stroke-width="4"/><path d="M300 135 h50" stroke="${ink}" stroke-width="4"/>`+lbl(95,139,'tricuspid','font-size="12"')+lbl(430,139,'bicuspid','font-size="12"')],
  ['SAN (pacemaker) → AVN → bundle of His → Purkinje fibres.',`<circle cx="160" cy="55" r="7" fill="#f2b632"/><circle cx="240" cy="120" r="7" fill="#f2b632"/><path d="M260 140 V220 M260 220 q-40 10 -80 -20 M260 220 q40 10 80 -20" stroke="#f2b632" stroke-width="3" fill="none"/>`+lbl(160,35,'SAN','font-size="12"')+lbl(225,120,'AVN','font-size="12" text-anchor="end"')]]},
 seeNote:'Schematic; the left ventricle wall is actually thickest.',
 do:{title:'Feel and count',mat:'Two fingers, a watch',steps:['Find your pulse at the wrist.','Count for 60 s at rest and after 20 jumps.'],obs:'About 72 at rest, higher after exercise.',why:'The SAN rate is changed by nerves and hormones.',lab:false},
 memo:'"Try before you Buy: tricuspid right, bicuspid left."',
 miscon:['"Pulmonary artery carries oxygenated blood." It carries deoxygenated blood to the lungs.','"The brain starts each heartbeat." The heart is myogenic: the SAN starts it.'],
 terms:['Open/closed circulation','Atrium','Ventricle','Tricuspid','Bicuspid (mitral)','Semilunar valve','SAN','AVN','Bundle of His','Purkinje fibres'],
 q:{q:'The pacemaker of the heart is the:',o:['AVN','SAN','bundle of His','Purkinje fibres'],a:1,why:'It generates the most action potentials.'},
 exam:'Labelled diagram of the heart section is often asked (5 marks).'},

{id:'b5',num:'15.3.2',title:'The cardiac cycle and heart sounds',
 intro:'Lub-dub, lub-dub, about 72 times a minute. What closes to make each sound?',
 obj:'Describe the events of the cardiac cycle, its duration, stroke volume, cardiac output and heart sounds.',
 prior:'Heart structure (15.3).',
 simple:'One cardiac cycle is the sequence of contraction (systole) and relaxation (diastole) of the atria and ventricles: about 0.8 s, so about 72 beats per minute. In each cycle each ventricle pumps about 70 mL (stroke volume). Cardiac output = stroke volume × heart rate ≈ 5 L per minute. The first sound "lub" is the closing of the AV valves; the second "dub" is the closing of the semilunar valves.',
 detail:'Start with all chambers relaxed (joint diastole): AV valves open, semilunar valves closed; blood from the veins flows into the atria and ventricles. The SAN fires: atrial systole pushes about 30% more blood into the ventricles. The impulse passes via AVN and bundle of His to the ventricles: ventricular systole. Ventricular pressure rises, AV valves close (lub, preventing backflow), then semilunar valves open and blood is pushed into the pulmonary artery and aorta. Ventricles relax: pressure falls, semilunar valves close (dub, preventing backflow). As pressure falls further the AV valves open and the ventricles fill again. Timing: atrial systole ≈ 0.1 s, ventricular systole ≈ 0.3 s, joint diastole ≈ 0.4 s. Cardiac output rises in athletes due to a larger stroke volume and can be changed by nerves and hormones.',
 real:'Doctors listen to lub-dub with a stethoscope; an extra whooshing sound (murmur) may indicate a leaking valve.',
 apply:'Calculate cardiac output for heart rate 72/min and stroke volume 70 mL.',
 see:{w:520,h:230,f:[
  ['0–0.1 s: atrial systole.',`<rect x="20" y="60" width="65" height="40" fill="${RD}" opacity=".8"/>`+lbl(52,50,'atria','font-size="11"')],
  ['0.1–0.4 s: ventricular systole (lub at start, dub at end).',`<rect x="85" y="110" width="195" height="40" fill="${RD}" opacity=".8"/>`+lbl(182,170,'ventricles contract','font-size="11"')+lbl(85,200,'lub','font-weight="700"')+lbl(280,200,'dub','font-weight="700"')],
  ['0.4–0.8 s: joint diastole: all relaxed, chambers fill.',`<rect x="280" y="60" width="240" height="90" fill="${BL}" opacity=".25"/>`+lbl(400,110,'joint diastole','font-size="12"')+`<line x1="20" y1="215" x2="520" y2="215" stroke="${ink}"/>`+[0,0.1,0.4,0.8].map(t=>lbl(Math.min(500,20+t*625),232,t+' s','font-size="11"')).join('')]]},
 seeNote:'Total 0.8 s at 72 beats per minute.',
 do:{title:'Stethoscope substitute',mat:'A paper tube, a partner',steps:['Place the tube on the partner\'s chest, left of the breastbone.','Listen for two sounds per beat.'],obs:'Lub (louder, longer) then dub (sharper).',why:'Valves closing.',lab:true},
 memo:'"Lub = AV shut (start of squeeze); Dub = semilunar shut (end of squeeze)."',
 miscon:['"Heart sounds are muscle contractions." They are valves closing.','"Atria pump most of the ventricular filling." Most fills passively; atria add about 30%.'],
 terms:['Systole','Diastole','Cardiac cycle','Stroke volume','Cardiac output','Lub, dub'],
 q:{q:'The "dub" sound is due to closure of:',o:['tricuspid valve','bicuspid valve','semilunar valves','AV node'],a:2,why:'At the end of ventricular systole.'},
 exam:'Cardiac cycle events and cardiac output calculation are 3–5 mark questions.'},

{id:'b6',num:'15.3.3',title:'Electrocardiograph (ECG)',
 intro:'The ECG machine draws a wavy line. What does each bump mean?',
 obj:'Interpret the P wave, QRS complex and T wave of a standard ECG.',
 prior:'Cardiac cycle (15.3.2).',
 simple:'An ECG records the heart\'s electrical activity through electrodes on the wrists and chest. The P wave is the electrical excitation (depolarisation) of the atria, which leads to atrial contraction. The QRS complex is the depolarisation of the ventricles, which starts ventricular contraction. The T wave is the return of the ventricles to normal (repolarisation); its end marks the end of systole.',
 detail:'A patient is connected with three electrical leads (one on each wrist and one on the left ankle) for a standard ECG; a detailed ECG uses multiple chest leads. Counting the number of QRS complexes in a given time gives the heart rate. Each person has a typical ECG shape; deviations from it can indicate a possible abnormality or disease, so the ECG is of great clinical significance.',
 real:'An ECG taken during chest pain helps doctors check whether the heart muscle is getting enough blood.',
 apply:'On an ECG strip, 6 QRS complexes appear in 5 seconds. What is the heart rate?',
 see:{w:520,h:220,f:[
  ['A standard ECG trace.',`<path d="${ecgPath(20,150,480,100)}" fill="none" stroke="${RD}" stroke-width="2.5"/>`],
  ['P: atrial depolarisation.',lbl(20+0.05/0.8*480,110,'P','font-weight="700"')],
  ['QRS: ventricular depolarisation (ventricles start to contract).',lbl(20+0.16/0.8*480,30,'R','font-weight="700"')+lbl(20+0.14/0.8*480,180,'Q','font-weight="700"')+lbl(20+0.185/0.8*480,190,'S','font-weight="700"')],
  ['T: ventricular repolarisation; end of T ≈ end of systole.',lbl(20+0.36/0.8*480,100,'T','font-weight="700"')]]},
 seeNote:'Schematic trace of one cycle.',
 do:{title:'Count the rate',mat:'A printed ECG strip (25 mm/s)',steps:['Count QRS complexes in 6 s (150 mm).','Multiply by 10.'],obs:'About 70–75 per minute in a resting adult.',why:'Each QRS = one ventricular beat.',lab:true},
 memo:'"P for the Pre-chambers (atria), QRS for the Real pumps, T for Time to reset."',
 miscon:['"The ECG records sound." It records electrical activity.','"QRS is atrial contraction." It is ventricular depolarisation.'],
 terms:['ECG','Depolarisation','Repolarisation','P wave','QRS complex','T wave'],
 q:{q:'The QRS complex represents:',o:['atrial depolarisation','ventricular depolarisation','ventricular repolarisation','atrial repolarisation'],a:1,why:'It triggers ventricular systole.'},
 exam:'Draw and label a standard ECG: 3 marks.'},

{id:'b7',num:'15.4',title:'Double circulation, regulation and disorders',
 intro:'Blood passes through your heart twice for every trip round the body. Why?',
 obj:'Trace pulmonary and systemic circulation, describe the hepatic portal system and regulation of heart rate, and list common disorders.',
 prior:'Heart structure and cardiac cycle.',
 simple:'Pulmonary circulation: right ventricle → pulmonary artery → lungs → pulmonary veins → left atrium. Systemic circulation: left ventricle → aorta → arteries → tissues → veins → venae cavae → right atrium. Blood passes through the heart twice in one complete round: double circulation. Heart rate is set by the SAN but adjusted by the nervous system and hormones.',
 detail:'Systemic circulation supplies nutrients, O₂ and other substances to tissues and takes CO₂ and wastes away. Hepatic portal system: the hepatic portal vein carries blood from the intestine to the liver before it reaches the systemic circulation. The heart has its own coronary system of vessels. Regulation: the heart is auto-regulated by nodal tissue, so it is myogenic. Sympathetic nerves (from the autonomic nervous system) increase the rate and strength of contraction and cardiac output; parasympathetic signals decrease them. Adrenal medullary hormones can also raise cardiac output. Disorders: high blood pressure (hypertension): BP higher than normal (120/80 mm Hg); 140/90 or above repeatedly indicates hypertension, which leads to heart disease and affects vital organs such as brain and kidney. Coronary artery disease (CAD, atherosclerosis): deposits of calcium, fat, cholesterol and fibrous tissue narrow the arteries supplying the heart muscle. Angina (angina pectoris): acute chest pain when not enough oxygen reaches the heart muscle; more common in middle-aged and elderly. Heart failure: the heart cannot pump blood effectively enough to meet the body\'s needs; sometimes called congestive heart failure because congestion of the lungs is a main symptom. It is different from cardiac arrest (heart stops beating) and heart attack (heart muscle suddenly damaged by inadequate blood supply).',
 real:'Regular exercise, less salt and no smoking lower the risk of hypertension and coronary artery disease.',
 apply:'Trace a red blood cell from the right atrium back to the right atrium, naming each chamber and vessel.',
 see:{w:520,h:260,f:[
  ['Heart in the middle; lungs above, body below.',`<rect x="210" y="100" width="100" height="70" rx="14" fill="#f3d6db" stroke="${ink}"/><rect x="190" y="10" width="140" height="40" rx="12" fill="#e6f1fb" stroke="${BL}"/><rect x="170" y="210" width="180" height="40" rx="12" fill="#fbe8e4" stroke="${RD}"/>`+lbl(260,35,'lungs')+lbl(260,236,'body tissues')+lbl(260,140,'heart')],
  ['Pulmonary circuit: right ventricle → lungs → left atrium.',`<path d="M230 100 C180 80 180 60 200 50" stroke="${BL}" stroke-width="4" fill="none"/><path d="M320 50 C340 60 340 80 290 100" stroke="${RD}" stroke-width="4" fill="none"/>`+lbl(150,75,'pulmonary artery','font-size="11"')+lbl(380,75,'pulmonary vein','font-size="11"')],
  ['Systemic circuit: left ventricle → aorta → body → venae cavae → right atrium.',`<path d="M290 170 C360 190 350 205 330 210" stroke="${RD}" stroke-width="4" fill="none"/><path d="M190 210 C170 200 170 185 230 170" stroke="${BL}" stroke-width="4" fill="none"/>`+lbl(400,195,'aorta','font-size="11"')+lbl(120,195,'venae cavae','font-size="11"')]]},
 seeNote:'Blue = deoxygenated, red = oxygenated.',
 do:{title:'BP survey (with permission)',mat:'A digital BP monitor at home or school clinic',steps:['Record the BP of three adults at rest.','Compare with 120/80 mm Hg.'],obs:'Values vary; repeated ≥ 140/90 needs a doctor.',why:'Hypertension is defined by repeated readings.',lab:false},
 memo:'"Right to Lungs, Left to Limbs."',
 miscon:['"All arteries carry oxygenated blood." The pulmonary artery carries deoxygenated blood.','"Heart attack and cardiac arrest are the same." Arrest = stops beating; attack = muscle damage from blocked supply.'],
 terms:['Pulmonary circulation','Systemic circulation','Double circulation','Hepatic portal system','Coronary system','Myogenic','Hypertension','CAD','Angina','Heart failure'],
 q:{q:'Blood from the intestine reaches the liver through the:',o:['hepatic artery','hepatic portal vein','aorta','pulmonary vein'],a:1,why:'Portal system.'},
 exam:'Double circulation flow chart and disorders are 3–5 mark questions.'}
];

const CARDS=[['Plasma','≈55%; 90–92% water, 6–8% proteins (fibrinogen, globulins, albumins).'],['Serum','Plasma without clotting factors.'],['RBC','5–5.5 million/mm³; Hb 12–16 g/100 mL; 120 days; destroyed in spleen.'],['WBC','6000–8000/mm³: N 60–65%, L 20–25%, M 6–8%, E 2–3%, B 0.5–1%.'],['Platelets','1.5–3.5 lakh/mm³; from megakaryocytes; clotting.'],['ABO','A: anti-B; B: anti-A; AB: none (universal recipient); O: both (universal donor).'],['Rh','≈80% Rh+; erythroblastosis foetalis in Rh− mother, Rh+ fetus.'],['Clotting','Thrombokinase: prothrombin → thrombin; fibrinogen → fibrin; Ca²⁺ needed.'],['Lymph','Tissue fluid in lymph vessels; lymphocytes; fat absorption via lacteals.'],['Heart valves','Tricuspid (right), bicuspid/mitral (left), semilunar (arteries).'],['Nodal tissue','SAN (pacemaker, 70–75/min) → AVN → bundle of His → Purkinje.'],['Cardiac cycle','0.8 s; 72/min; stroke volume ≈ 70 mL; output ≈ 5 L/min.'],['Heart sounds','Lub: AV valves close; dub: semilunar valves close.'],['ECG','P: atrial depolarisation; QRS: ventricular depolarisation; T: ventricular repolarisation.'],['Double circulation','Pulmonary (RV → lungs → LA) + systemic (LV → body → RA).'],['Disorders','Hypertension (≥140/90), CAD, angina, heart failure.']];

const Q=[
 {lv:1,q:'Plasma forms about what percentage of blood?',o:['45%','55%','75%','90%'],a:1,w:'Formed elements ≈ 45%.'},
 {lv:1,q:'RBCs are destroyed mainly in the:',o:['liver','spleen','bone marrow','kidney'],a:1,w:'Graveyard of RBCs.'},
 {lv:1,q:'The universal donor blood group is:',o:['A','B','AB','O'],a:3,w:'No A or B antigens.'},
 {lv:1,q:'Normal blood pressure is:',o:['80/120 mm Hg','120/80 mm Hg','140/90 mm Hg','100/60 mm Hg'],a:1,w:'Systolic/diastolic.'},
 {lv:2,q:'Which WBC secretes histamine and heparin?',o:['Neutrophil','Basophil','Lymphocyte','Monocyte'],a:1,w:'Basophils, 0.5–1%.'},
 {lv:2,q:'The T wave of an ECG shows:',o:['atrial depolarisation','ventricular depolarisation','ventricular repolarisation','SAN firing'],a:2,w:'Return to normal.'},
 {lv:2,q:'Fibrinogen is converted to fibrin by:',o:['thrombokinase','thrombin','prothrombin','heparin'],a:1,w:'Thrombin acts on fibrinogen.'},
 {lv:3,q:'Stroke volume 70 mL, heart rate 72/min. Cardiac output:',o:['5.04 L/min','0.98 L/min','7.2 L/min','50.4 L/min'],a:0,w:'70 × 72 = 5040 mL.'},
 {lv:3,q:'An ECG shows 6 QRS complexes in 5 s. Heart rate:',o:['30/min','60/min','72/min','90/min'],a:2,w:'6 × 12 = 72.'},
 {lv:3,q:'An Rh− mother is pregnant with her second Rh+ child. The risk is:',o:['erythroblastosis foetalis','haemophilia','sickle-cell anaemia','hypertension'],a:0,w:'Maternal anti-Rh antibodies attack fetal RBCs.'},
 {lv:4,q:'Assertion (A): The human heart is myogenic. Reason (R): The SAN generates action potentials without nerve input.',o:['Both true and R explains A','Both true, R does not explain A','A true, R false','A false, R true'],a:0,w:'Nodal tissue starts each beat.'},
 {lv:4,q:'Which correctly traces pulmonary circulation?',o:['LV → aorta → lungs → RA','RV → pulmonary artery → lungs → pulmonary vein → LA','RA → lungs → LA','LV → pulmonary vein → lungs → RA'],a:1,w:'Right side to lungs, back to left atrium.'},
 {lv:4,q:'A group A person can safely receive red cells from:',o:['A and O','A and AB','B and O','AB only'],a:0,w:'Donor must lack B antigen.'},
 {lv:5,open:true,m:3,q:'Describe the events of the cardiac cycle and explain the two heart sounds.',ans:['Joint diastole: AV valves open, ventricles fill; atrial systole adds ≈30% (1).','Ventricular systole: AV valves close (lub), semilunar valves open, blood ejected (1).','Ventricular diastole: semilunar valves close (dub); AV valves reopen; cycle 0.8 s (1).']},
 {lv:5,open:true,m:3,q:'Draw and label a standard ECG and state what each wave represents.',ans:['Trace with P, QRS, T labelled (1).','P: atrial depolarisation; QRS: ventricular depolarisation (1).','T: ventricular repolarisation; QRS count gives heart rate (1).']},
 {lv:5,open:true,m:3,q:'Explain the coagulation of blood.',ans:['Injury: platelets/tissues release factors → thrombokinase (1).','Thrombokinase converts prothrombin to thrombin; Ca²⁺ needed (1).','Thrombin converts fibrinogen to fibrin threads that trap cells → clot (1).']}
];

const ONEMIN=['Plasma 55% (fibrinogen, globulins, albumins); formed elements 45%.','RBC 5–5.5 million/mm³, 120 days; Hb 12–16 g/100 mL.','WBC: N > L > M > E > B (60–65, 20–25, 6–8, 2–3, 0.5–1%).','Platelets 1.5–3.5 lakh/mm³; clotting: prothrombin → thrombin; fibrinogen → fibrin.','ABO: O universal donor, AB universal recipient; Rh and erythroblastosis foetalis.','Lymph: tissue fluid + lymphocytes; lacteals absorb fat.','Heart: 2 atria, 2 ventricles; tricuspid right, bicuspid left; SAN pacemaker.','Cycle 0.8 s; stroke volume 70 mL; output ≈ 5 L/min; lub = AV close, dub = semilunar close.','ECG: P atria, QRS ventricles depolarise, T ventricles repolarise.','Double circulation; hepatic portal; hypertension ≥ 140/90, CAD, angina, heart failure.'];
const KEYS=[['plasma 55%',/plasma/i],['RBC / haemoglobin',/rbc|erythro|haemoglobin|hemoglobin/i],['WBC types',/wbc|leuco|neutrophil|lymphocyte/i],['platelets & clotting',/platelet|clot|fibrin|thromb/i],['ABO / Rh',/abo|rh|donor|recipient|antigen/i],['lymph',/lymph/i],['SAN pacemaker',/san|pacemaker|sino/i],['cardiac cycle / output',/systole|diastole|cardiac output|stroke/i],['ECG P QRS T',/ecg|qrs|p wave|t wave/i],['double circulation',/pulmonary|systemic|double/i]];

/* ---------- lab ---------- */
let mode='cyc',tt=0,run=true,raf=null,bpm=72;
const GRP=['O','A','B','AB'],ANT={O:[],A:['A'],B:['B'],AB:['A','B']};let dn='O',rc='A',dRh='+',rRh='+';
function phase(t){if(t<0.1)return 'as';if(t<0.4)return 'vs';return 'jd'}
function drawCyc(){const Pd=0.8*72/bpm,t=(tt%Pd)/Pd*0.8,ph=phase(t);const aS=ph==='as',vS=ph==='vs';
 const avOpen=!vS,slOpen=vS&&t>0.13&&t<0.38;
 let s='';const sqA=aS?6:0,sqV=vS?10:0;
 s+=`<rect x="${110+sqA}" y="${30+sqA}" width="${110-2*sqA}" height="${80-2*sqA}" rx="18" fill="${BL}" opacity="${aS?.85:.45}"/><rect x="${250+sqA}" y="${30+sqA}" width="${110-2*sqA}" height="${80-2*sqA}" rx="18" fill="${RD}" opacity="${aS?.85:.45}"/>`;
 s+=`<path d="M${110+sqV} 125 h${110-2*sqV} v${70-sqV} q${-(55-sqV)} ${60-sqV} ${-(110-2*sqV)} 0z" fill="${BL}" opacity="${vS?.9:.5}"/><path d="M${250+sqV} 125 h${110-2*sqV} v${70-sqV} q${-(55-sqV)} ${60-sqV} ${-(110-2*sqV)} 0z" fill="${RD}" opacity="${vS?.9:.5}"/>`;
 const v=(x,open)=>open?`<path d="M${x-25} 118 l8 10 M${x+25} 118 l-8 10" stroke="${ink}" stroke-width="3"/>`:`<path d="M${x-25} 118 h50" stroke="${ink}" stroke-width="4"/>`;
 s+=v(165,avOpen)+v(305,avOpen);
 s+=`<rect x="370" y="${slOpen?50:60}" width="18" height="40" fill="none" stroke="${ink}" stroke-width="${slOpen?1.5:3}"/>`+T(379,44,slOpen?'open':'shut','font-size="10"')+T(420,74,'semilunar','font-size="11"');
 s+=T(165,75,'RA','font-size="13" font-weight="700"')+T(305,75,'LA','font-size="13" font-weight="700"')+T(165,170,'RV','font-size="13" font-weight="700"')+T(305,170,'LV','font-size="13" font-weight="700"')+T(70,122,avOpen?'AV open':'AV shut','font-size="11"');
 const x0=20,W=440,y0=320;s+=`<path d="${ecgPath(x0,y0,W,55)}" fill="none" stroke="${RD}" stroke-width="2"/><line x1="${x0+t/0.8*W}" y1="250" x2="${x0+t/0.8*W}" y2="345" stroke="${ink}" stroke-width="1.5"/>`;
 [[0,0.1,'atrial systole',BL],[0.1,0.4,'ventricular systole',RD],[0.4,0.8,'joint diastole',GR]].forEach(([a,b,n,c])=>{s+=`<rect x="${x0+a/0.8*W}" y="245" width="${(b-a)/0.8*W}" height="10" fill="${c}" opacity=".5"/>`+T(x0+(a+b)/1.6*W,240,n,'font-size="10"')});
 const snd=Math.abs(t-0.1)<0.03?'LUB':Math.abs(t-0.4)<0.03?'DUB':'';if(snd)s+=T(240,225,snd,`font-size="20" font-weight="700" fill="${RD}"`);
 $('#hSvg').innerHTML=s;
 const sv=70,co=sv*bpm/1000;
 $('#hOut').innerHTML=`<p>t = <b>${t.toFixed(2)} s</b> of a 0.8 s cycle (scaled to ${bpm} beats/min)</p><p>Phase: <b>${ph==='as'?'Atrial systole':ph==='vs'?'Ventricular systole':'Joint diastole'}</b></p><p>AV valves: <b>${avOpen?'open':'closed'}</b> · semilunar: <b>${slOpen?'open':'closed'}</b></p><p>Cardiac output = 70 mL × ${bpm} = <b>${co.toFixed(2)} L/min</b></p>`}
function loop(){const sv=$('#hSvg');if(mode!=='cyc'||!sv||!sv.isConnected||!sv.getClientRects().length){raf=null;return}if(run)tt+=1/60*0.5;drawCyc();raf=requestAnimationFrame(loop)}
function okBG(){const anti={O:['A','B'],A:['B'],B:['A'],AB:[]}[rc];const abo=!ANT[dn].some(a=>anti.includes(a));const rh=!(dRh==='+'&&rRh==='-');return {abo,rh}}
function drawBG(){const {abo,rh}=okBG(),ok=abo&&rh;let s='';
 const rbc=(cx,cy,g,rh,label)=>{let r=`<circle cx="${cx}" cy="${cy}" r="48" fill="${RD}" opacity=".75"/>`;ANT[g].forEach((a,i)=>{for(let k=0;k<4;k++){const an=(k*90+i*45)*Math.PI/180;r+=`<g transform="translate(${cx+52*Math.cos(an)} ${cy+52*Math.sin(an)})"><text font-size="13" font-weight="700" text-anchor="middle" fill="currentColor">${a}</text></g>`}});if(rh==='+')r+=`<text x="${cx}" y="${cy+5}" font-size="14" text-anchor="middle" fill="#fff" font-weight="700">Rh</text>`;return r+T(cx,cy+80,label+': '+g+rh,'font-size="13" font-weight="700"')};
 s+=rbc(120,120,dn,dRh,'Donor RBC')+`<path d="M190 120 h90" stroke="${ink}" stroke-width="3"/><path d="M272 113 l10 7 l-10 7" fill="none" stroke="${ink}" stroke-width="3"/>`;
 const anti={O:['anti-A','anti-B'],A:['anti-B'],B:['anti-A'],AB:['none']}[rc];
 s+=`<rect x="300" y="60" width="160" height="120" rx="14" fill="#f5e6a8" opacity=".7"/>`+T(380,90,'Recipient plasma','font-size="12"')+T(380,115,anti.join(', '),'font-size="13" font-weight="700"')+T(380,140,rRh==='-'?'Rh− (may make anti-Rh)':'Rh+','font-size="12"')+T(380,205,'Recipient: '+rc+rRh,'font-size="13" font-weight="700"');
 s+=T(240,290,ok?'✓ Compatible':'✗ Not compatible: clumping (agglutination) risk','font-size="16" font-weight="700" fill="'+(ok?'#3b6d11':'#a32d2d')+'"');
 $('#hSvg').innerHTML=s;
 $('#hOut').innerHTML=`<p>${abo?'ABO: no clash.':'ABO: donor antigen '+ANT[dn].filter(a=>({O:['A','B'],A:['B'],B:['A'],AB:[]}[rc]).includes(a)).join(', ')+' meets matching antibody.'}</p><p>${rh?'Rh: fine.':'Rh: Rh+ red cells into an Rh− person can trigger anti-Rh antibodies.'}</p><p>Try O− as donor (gives to all) and AB+ as recipient (receives from all).</p>`}
function ctl(){if(mode==='cyc')return `<div class="ctrl"><label>Heart rate: <b id="hB">${bpm}</b>/min<input type="range" id="hR" class="hSl" min="50" max="150" value="${bpm}"></label></div><div class="ctrl"><button class="btn" id="hP">${run?'Pause':'Play'}</button><button class="btn" id="hS">Step 0.05 s</button></div>`;
 const sel=(id,v,opts)=>`<select id="${id}">${opts.map(o=>`<option ${o===v?'selected':''}>${o}</option>`).join('')}</select>`;
 return `<div class="ctrl"><label>Donor ${sel('hDn',dn,GRP)}</label><label>Rh ${sel('hDr',dRh,['+','-'])}</label></div><div class="ctrl"><label>Recipient ${sel('hRc',rc,GRP)}</label><label>Rh ${sel('hRr',rRh,['+','-'])}</label></div>`}
function labShow(){$('#hCtl').innerHTML=ctl();if(mode==='cyc'){if(!raf)loop()}else drawBG()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='hR')labChange(e.target)})}
function labClick(b){if(b.id==='hP'){run=!run;b.textContent=run?'Pause':'Play';return true}if(b.id==='hS'){run=false;$('#hP').textContent='Play';tt+=0.05*72/bpm;drawCyc();return true}return false}
function labChange(t){switch(t.id){case 'hMode':mode=t.value;labShow();return true;case 'hR':bpm=+t.value;$('#hB').textContent=bpm;return true;case 'hDn':dn=t.value;drawBG();return true;case 'hRc':rc=t.value;drawBG();return true;case 'hDr':dRh=t.value;drawBG();return true;case 'hRr':rRh=t.value;drawBG();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
