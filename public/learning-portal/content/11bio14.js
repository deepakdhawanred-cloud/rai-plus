/* Rai Plus content pack: Class 11 Biology, Chapter 14 – Breathing and Exchange of Gases */
RP.register({key:'11bio14',cls:'11',subject:'Biology',ch:'14',title:"Breathing and Exchange of Gases",color:'#8a2f4a',
crumb:"HBSE Class 11 Biology · Unit: Human Physiology · Taught in November",h1:"Chapter 14: Breathing and Exchange of Gases",sub:"How air gets in and out of the lungs, how oxygen and carbon dioxide cross into and out of the blood, and how breathing is controlled.",heroLabel:"A pair of lungs with bronchial tree and alveoli",labName:"Breathing lab",
theme:"\n:root{--g:light-dark(#8a2f4a,#eea2b8);--g2:light-dark(#fbeef2,#2a1119);--line:light-dark(#efd3dc,#4a2433);--bg:light-dark(#ffffff,#170b10);--card:light-dark(#ffffff,#1e1016);\n--ink:light-dark(#2a1119,#f6e9ee);--mute:light-dark(#6e5260,#caa7b6);--y:light-dark(#2e6f8a,#8fc4dc);--y2:light-dark(#e8f2f6,#0f1f26);--hd:#5c1d31}\n",
labHTML:`  <h2>Breathing lab</h2>
  <p>Read a spirogram, then follow oxygen and carbon dioxide down their partial-pressure gradients.</p>
  <div class="ftabs" role="group" aria-label="Lab tool"><button data-tool="spi" aria-pressed="true">Spirogram</button><button data-tool="gas" aria-pressed="false">Gas exchange map</button></div>
  <div id="t-spi">
    <div class="sim"><div><div class="fig" style="max-width:none"><svg id="sp" viewBox="0 0 520 330" role="img" aria-label="Spirogram of lung volumes" style="color:var(--ink)"></svg></div></div>
    <div><div class="ctrl" id="spB"></div><div class="box y" id="spOut" aria-live="polite"></div><p class="note">Typical adult values from NCERT; real values vary with age, sex and fitness.</p></div></div>
  </div>
  <div id="t-gas" hidden>
    <div class="sim"><div><div class="fig" style="max-width:none"><svg id="gx" viewBox="0 0 520 330" role="img" aria-label="Partial pressures at five sites" style="color:var(--ink)"></svg></div></div>
    <div><div class="ctrl" id="gxB"></div><div class="box y" id="gxOut" aria-live="polite"></div><p class="note">Partial pressures in mm Hg (NCERT Table 14.1).</p></div></div>
  </div>
`,
build:function(){

const ACC='#8a2f4a',LABNAME='Breathing lab',MIND_CENTER='Respiration';
const PK='#8a2f4a',BL='#2e6f8a',RD='#c0392b',ink='currentColor';
const pill=(x,y,t,c='#fbeef2',w=170)=>`<rect x="${x-w/2}" y="${y-17}" width="${w}" height="34" rx="8" fill="${c}" stroke="${PK}"/>`+T(x,y+5,t,'font-size="13"');
function heroDraw(){return `<path d="M180 15 V45 M180 45 L150 60 M180 45 L210 60" stroke="#fff" stroke-width="4" fill="none"/><path d="M150 55 C110 55 100 110 140 112 C160 113 165 80 160 60 Z" fill="#eea2b8"/><path d="M210 55 C250 55 260 110 220 112 C200 113 195 80 200 60 Z" fill="#eea2b8"/>`}
const HERO=heroDraw;
const MIND=[['Respiratory organs and system',90,50],['Mechanism of breathing',430,50],['Respiratory volumes',90,150],['Exchange of gases',430,150],['Transport of gases',90,250],['Regulation and disorders',430,250]];

const C=[
{id:'b1',num:'14.1',title:'Respiratory organs and the human respiratory system',
 intro:'An earthworm breathes through its skin, a fish through gills, and you through lungs. What decides which organ an animal uses?',
 obj:'Relate respiratory organs to habitat and organisation, and trace the path of air through the human respiratory system.',
 prior:'Life processes (Class 10).',
 simple:'Simple animals like sponges and flatworms exchange gases by diffusion over the whole body; earthworms use moist skin; insects use tracheal tubes; fishes use gills; land vertebrates use lungs. In humans, air passes through nostrils → nasal chamber → pharynx → larynx → trachea → bronchi → bronchioles → alveoli.',
 detail:'Mechanisms of breathing vary with habitat and level of organisation: lower invertebrates (sponges, coelenterates, flatworms) by simple diffusion over the entire body surface; earthworms through moist cuticle; insects through a network of tubes (tracheal tubes); most aquatic arthropods and molluscs through gills (branchial respiration); terrestrial forms through lungs (pulmonary respiration). Fishes use gills; amphibians like frogs can also respire through moist skin (cutaneous respiration); reptiles, birds and mammals use lungs. Human respiratory system: a pair of external nostrils opens into the nasal chamber through the nasal passage, which opens into the pharynx (common passage for food and air). The pharynx opens through the larynx into the trachea. The larynx is a cartilaginous box (sound box); during swallowing the glottis is covered by a cartilaginous flap, the epiglottis. The trachea divides at the level of the 5th thoracic vertebra into right and left primary bronchi, which divide repeatedly into secondary and tertiary bronchi and bronchioles ending in thin terminal bronchioles. Trachea, bronchi and initial bronchioles are supported by incomplete cartilaginous rings. Each terminal bronchiole gives rise to very thin, irregular-walled, vascularised bag-like alveoli. The branching network of bronchi, bronchioles and alveoli makes up the lungs. The lungs are covered by a double-layered pleura with pleural fluid, which reduces friction. The conducting part runs from the nostrils to the terminal bronchioles; the exchange part is the alveoli and their ducts. The lungs lie in the air-tight thoracic chamber, formed dorsally by the vertebral column, ventrally by the sternum, laterally by the ribs and below by the dome-shaped diaphragm.',
 real:'The hairs and mucus in your nose filter dust; that\'s why you sneeze in a dusty room.',
 apply:'Why is the trachea supported by C-shaped (incomplete) cartilage rings and not by complete rings?',
 see:{w:520,h:240,f:[
  ['Nostrils → nasal chamber → pharynx → larynx → trachea.',`<path d="M260 20 V100" stroke="${PK}" stroke-width="10"/>`+T(330,60,'trachea','font-size="12" text-anchor="start"')],
  ['Trachea branches into bronchi and bronchioles.',`<path d="M260 100 L200 140 L170 180 M200 140 L215 185 M260 100 L320 140 L350 180 M320 140 L305 185" stroke="${PK}" stroke-width="5" fill="none"/>`],
  ['Bronchioles end in thin-walled alveoli where gases are exchanged.',[[170,180],[215,185],[350,180],[305,185]].map(([x,y])=>`<circle cx="${x}" cy="${y+10}" r="10" fill="#eea2b8" stroke="${PK}"/>`).join('')]]},
 seeNote:'See the 3D-style lungs in the Visuals tab.',
 do:{title:'Model lung (bell jar)',mat:'A plastic bottle with the bottom cut off, a balloon, a straw, a rubber sheet, rubber band',steps:['Fix the balloon to the straw inside the bottle.','Stretch the rubber sheet over the open base.','Pull the sheet down, then push it up.'],obs:'The balloon inflates when the sheet is pulled down and deflates when pushed up.',why:'Increasing chest volume lowers pressure, drawing air in.',lab:true},
 memo:'"Nose, Pharynx, Larynx, Trachea, Bronchi, Bronchioles, Alveoli."',
 miscon:['"Gas exchange happens in the trachea." Only in the alveoli.','"The pharynx carries only air." It carries both food and air.'],
 terms:['Pharynx','Larynx','Epiglottis','Trachea','Bronchi, bronchioles','Alveoli','Pleura','Diaphragm'],
 q:{q:'The flap that covers the glottis during swallowing is the:',o:['Larynx','Epiglottis','Pleura','Diaphragm'],a:1,why:'Prevents food entering the larynx.'},
 exam:'Labelled diagrams of the respiratory system are asked for 3 marks.'},
{id:'b2',num:'14.2',title:'Mechanism of breathing',
 intro:'You don\'t suck air into your lungs. You make room for it. How?',
 obj:'Explain inspiration and expiration in terms of pressure gradients and the action of the diaphragm and intercostal muscles.',
 prior:'Respiratory system (14.1).',
 simple:'Inspiration: the diaphragm contracts and flattens, and the external intercostal muscles lift the ribs and sternum. The chest volume increases, lung pressure falls below atmospheric pressure, and air rushes in. Expiration: the muscles relax, the chest volume decreases, lung pressure rises above atmospheric, and air goes out.',
 detail:'Breathing involves inspiration (atmospheric air drawn in) and expiration (alveolar air released). Air moves because of a pressure gradient between the lungs and the atmosphere: inspiration occurs when intra-pulmonary pressure is less than atmospheric pressure; expiration when it is greater. The diaphragm and a specialised set of muscles, the external and internal intercostals between the ribs, generate these gradients. Inspiration starts with contraction of the diaphragm, increasing the volume of the thoracic chamber in the antero-posterior axis; contraction of the external intercostal muscles lifts the ribs and sternum, increasing volume in the dorso-ventral axis. The increase in thoracic volume increases pulmonary volume, decreasing intra-pulmonary pressure. Relaxation of the diaphragm and intercostal muscles returns them to normal positions, reducing thoracic and pulmonary volume; intra-pulmonary pressure rises slightly above atmospheric, causing expiration. Additional muscles in the abdomen can increase the strength of inspiration and expiration. On average, a healthy human breathes 12–16 times per minute. A spirometer measures the volume of air involved in breathing.',
 real:'Singers and swimmers train their diaphragm to take deeper, more controlled breaths.',
 apply:'What happens to the lungs if air enters the pleural cavity through a chest wound? Why?',
 see:{w:520,h:240,f:[
  ['Inspiration: diaphragm contracts and flattens; ribs move up and out.',`<path d="M120 200 Q260 190 400 200" stroke="${PK}" stroke-width="4" fill="none"/>`+T(260,225,'diaphragm flat','font-size="12"')],
  ['Chest volume ↑ → lung pressure falls below atmospheric → air in.',`<path d="M260 20 V70" stroke="${BL}" stroke-width="4" marker-end="url(#a)"/>`+T(330,50,'air in','font-size="13" text-anchor="start"')],
  ['Expiration: muscles relax, diaphragm domes up, volume ↓ → air out.',`<path d="M120 200 Q260 130 400 200" stroke="${PK}" stroke-width="2" stroke-dasharray="5 4" fill="none"/>`+T(260,140,'diaphragm domed','font-size="12"')]]},
 seeNote:'Watch the animated chest in the Visuals tab.',
 do:{title:'Measure your chest',mat:'A measuring tape, a partner',steps:['Measure chest circumference after breathing out normally.','Measure after a deep breath in.','Count breaths per minute while resting.'],obs:'Chest size increases on inspiration; about 12–16 breaths/min.',why:'Rib-cage movement changes chest volume.',lab:false},
 memo:'"Contract = in; relax = out."',
 miscon:['"Lungs pull air in by themselves." Muscles change chest volume; lungs follow.','"Expiration at rest needs strong muscle effort." It is normally passive.'],
 terms:['Inspiration','Expiration','Intra-pulmonary pressure','Diaphragm','External intercostal muscles','Spirometer'],
 q:{q:'During inspiration, the diaphragm:',o:['Relaxes and domes up','Contracts and flattens','Does not move','Moves only in expiration'],a:1,why:'Increases thoracic volume.'},
 exam:'Mechanism of breathing is a 3–5 mark question.'},
{id:'b3',num:'14.2.1',title:'Respiratory volumes and capacities',
 intro:'Even after you breathe out as hard as you can, your lungs still hold about a litre of air. Why can\'t you empty them?',
 obj:'Define TV, IRV, ERV and RV, and the capacities IC, EC, FRC, VC and TLC, with typical values.',
 prior:'Mechanism of breathing (14.2).',
 simple:'Tidal volume (TV): air breathed in or out normally, about 500 mL. IRV: extra air you can forcibly breathe in: 2500–3000 mL. ERV: extra air you can forcibly breathe out: 1000–1100 mL. Residual volume (RV): air left in the lungs after forcible expiration: 1100–1200 mL. Capacities are sums of these volumes.',
 detail:'Tidal volume (TV): volume of air inspired or expired during normal respiration, about 500 mL; a healthy person can inspire or expire about 6000 to 8000 mL of air per minute. Inspiratory reserve volume (IRV): additional air a person can inspire by forcible inspiration, on average 2500–3000 mL. Expiratory reserve volume (ERV): additional air expired by forcible expiration, on average 1000–1100 mL. Residual volume (RV): volume remaining in the lungs even after forcible expiration, on average 1100–1200 mL. Capacities: inspiratory capacity IC = TV + IRV; expiratory capacity EC = TV + ERV; functional residual capacity FRC = ERV + RV; vital capacity VC = ERV + TV + IRV (maximum air breathed in after forced expiration, or out after forced inspiration); total lung capacity TLC = RV + ERV + TV + IRV, or VC + RV.',
 real:'Doctors test vital capacity with a spirometer to check lung health; athletes often have a larger VC.',
 apply:'If TV = 500 mL, IRV = 2500 mL, ERV = 1000 mL and RV = 1200 mL, find VC and TLC.',
 see:{w:520,h:240,f:[
  ['Normal breathing: tidal volume (TV) about 500 mL.',(()=>{let d='';for(let x=0;x<=440;x+=4)d+=(x?'L':'M')+(40+x)+' '+(130+12*Math.sin(x/25));return `<path d="${d}" fill="none" stroke="${PK}" stroke-width="2.5"/>`})()],
  ['A deep breath in adds IRV; a forced breath out removes ERV.',`<line x1="40" y1="40" x2="480" y2="40" stroke="${BL}" stroke-dasharray="4 4"/><line x1="40" y1="170" x2="480" y2="170" stroke="${BL}" stroke-dasharray="4 4"/>`+T(500,44,'IRV','font-size="12"')+T(500,174,'ERV','font-size="12"')],
  ['Residual volume always stays in. VC = IRV + TV + ERV; TLC = VC + RV.',`<rect x="40" y="185" width="440" height="30" fill="${PK}" opacity=".15"/>`+T(260,205,'RV (never exhaled)','font-size="12"')]]},
 seeNote:'Click each volume in the Spirogram tool.',
 do:{title:'Balloon vital capacity',mat:'A large round balloon, a measuring tape',steps:['Take the deepest breath you can.','Blow out as fully as possible into the balloon; tie it.','Measure its circumference and estimate the volume (V = C³/6π²).'],obs:'Typically 2.5–4.5 litres.',why:'This estimates vital capacity.',lab:false},
 memo:'"TV 500, IRV 2500–3000, ERV 1000–1100, RV 1100–1200."',
 miscon:['"Vital capacity includes residual volume." TLC does; VC does not.','"You can breathe out all the air in your lungs." RV always remains.'],
 terms:['Tidal volume','IRV','ERV','Residual volume','Vital capacity','Total lung capacity','FRC'],
 q:{q:'Vital capacity equals:',o:['TV + IRV','TV + ERV','IRV + TV + ERV','VC + RV'],a:2,why:'Maximum air after forced expiration.'},
 exam:'Definitions and calculations of volumes and capacities are 2–3 mark questions.'},
{id:'b4',num:'14.3',title:'Exchange of gases',
 intro:'Oxygen is never pumped from the alveoli into the blood. It moves on its own. What drives it?',
 obj:'Explain gas exchange by diffusion along partial-pressure gradients at the alveoli and tissues, and the role of the diffusion membrane.',
 prior:'Diffusion (Class 9).',
 simple:'Gases move by simple diffusion from where their partial pressure is high to where it is low. In the alveoli, pO₂ is high and pCO₂ low, so O₂ enters the blood and CO₂ leaves it. In the tissues it is the opposite: O₂ leaves the blood and CO₂ enters.',
 detail:'Alveoli are the primary sites of exchange; exchange also occurs between blood and tissues. O₂ and CO₂ are exchanged by simple diffusion, mainly based on pressure/concentration gradient. Solubility and the thickness of the membranes also matter. Partial pressure is the pressure contributed by an individual gas in a mixture: pO₂ and pCO₂. Values (mm Hg, NCERT Table 14.1): atmospheric air pO₂ 159, pCO₂ 0.3; alveoli 104, 40; deoxygenated blood 40, 45; oxygenated blood 95, 40; tissues 40, 45. So O₂ moves alveoli → blood → tissues, and CO₂ tissues → blood → alveoli. The solubility of CO₂ is 20–25 times higher than that of O₂, so the amount of CO₂ that can diffuse through the diffusion membrane per unit difference in partial pressure is much higher. The diffusion membrane has three layers: the thin squamous epithelium of the alveoli, the endothelium of alveolar capillaries and the basement substance between them; its total thickness is much less than a millimetre.',
 real:'At high altitude, pO₂ in the air is lower, so less oxygen diffuses into the blood; climbers feel breathless.',
 apply:'Using the NCERT values, find the pO₂ difference that drives O₂ from alveoli into deoxygenated blood.',
 see:{w:520,h:240,f:[
  ['Alveolus: pO₂ 104, pCO₂ 40 (mm Hg).',`<circle cx="140" cy="110" r="60" fill="#eea2b8" opacity=".6" stroke="${PK}"/>`+T(140,115,'alveolus','font-size="12"')],
  ['Blood arriving: pO₂ 40, pCO₂ 45.',`<rect x="250" y="80" width="230" height="60" rx="30" fill="#7f9fd6" opacity=".5"/>`+T(365,115,'capillary','font-size="12"')],
  ['O₂ diffuses into blood; CO₂ diffuses out: down their gradients.',`<line x1="205" y1="95" x2="245" y2="95" stroke="${RD}" stroke-width="3"/>`+T(225,85,'O₂ →','font-size="12"')+`<line x1="245" y1="128" x2="205" y2="128" stroke="${BL}" stroke-width="3"/>`+T(225,150,'← CO₂','font-size="12"')]]},
 seeNote:'Click each site in the Gas exchange map.',
 do:{title:'Diffusion race',mat:'Two beakers of water, potassium permanganate crystals, cotton wool',steps:['Drop a crystal into still water; time the colour spread over 2 cm.','Repeat with a thin layer of wet cotton above the crystal.'],obs:'Colour spreads slower through the thicker layer.',why:'Thin membranes speed diffusion; the alveolar membrane is extremely thin.',lab:false},
 memo:'"Gases go downhill in partial pressure."',
 miscon:['"Oxygen is actively pumped into blood." It diffuses.','"CO₂ diffuses more slowly than O₂." It is 20–25 times more soluble.'],
 terms:['Partial pressure','Diffusion','Diffusion membrane','Alveolar capillary'],
 q:{q:'The pO₂ in alveoli (mm Hg) is about:',o:['159','104','95','40'],a:1,why:'NCERT Table 14.1.'},
 exam:'The partial-pressure table and diffusion membrane are asked in 2–3 mark questions.'},
{id:'b5',num:'14.4',title:'Transport of gases',
 intro:'Blood plasma can dissolve very little oxygen. So how does every cell in your body get enough?',
 obj:'Describe transport of O₂ by haemoglobin, the oxygen dissociation curve, and the three forms of CO₂ transport.',
 prior:'Exchange of gases (14.3).',
 simple:'About 97% of O₂ is carried by haemoglobin in red blood cells as oxyhaemoglobin; 3% dissolves in plasma. CO₂ is carried 20–25% as carbamino-haemoglobin, about 70% as bicarbonate ions, and 7% dissolved in plasma.',
 detail:'Oxygen: haemoglobin is a red, iron-containing pigment in RBCs; each haemoglobin molecule can carry a maximum of four O₂ molecules. Binding is related primarily to pO₂; pCO₂, H⁺ concentration and temperature also affect it. A plot of percentage saturation of haemoglobin against pO₂ is a sigmoid curve: the oxygen dissociation curve. In the alveoli (high pO₂, low pCO₂, lower H⁺, lower temperature) oxyhaemoglobin forms; in the tissues (low pO₂, high pCO₂, high H⁺, higher temperature) oxygen dissociates. Every 100 mL of oxygenated blood can deliver around 5 mL of O₂ to the tissues under normal physiological conditions. Carbon dioxide: about 20–25% is carried by haemoglobin as carbamino-haemoglobin (binding related to pCO₂; pO₂ is a major factor too). RBCs contain a very high concentration of the enzyme carbonic anhydrase (and plasma a small amount): CO₂ + H₂O ⇌ H₂CO₃ ⇌ HCO₃⁻ + H⁺. At the tissues, where pCO₂ is high, CO₂ forms HCO₃⁻; at the alveoli, where pCO₂ is low, the reaction reverses and CO₂ is released. About 70% of CO₂ is carried as bicarbonate; about 7% dissolved in plasma. Every 100 mL of deoxygenated blood delivers approximately 4 mL of CO₂ to the alveoli.',
 real:'Carbon monoxide poisoning from a closed room with a coal stove is dangerous because CO binds haemoglobin very strongly, blocking oxygen transport.',
 apply:'Why does exercising muscle (warmer, more CO₂, more H⁺) get more oxygen from the same blood?',
 see:{w:520,h:240,f:[
  ['O₂: 97% as oxyhaemoglobin in RBCs, 3% in plasma.',pill(150,50,'O₂: 97% Hb, 3% plasma','#fbeef2',210)],
  ['The oxygen dissociation curve is sigmoid.',(()=>{let d='';for(let p=0;p<=100;p+=2){const s=100*Math.pow(p,2.7)/(Math.pow(p,2.7)+Math.pow(27,2.7));d+=(p?'L':'M')+(300+p*2)+' '+(200-s*1.2)}return `<path d="${d}" fill="none" stroke="${RD}" stroke-width="3"/>`})()],
  ['CO₂: 70% bicarbonate, 20–25% carbamino-haemoglobin, 7% plasma.',pill(150,200,'CO₂: 70% HCO₃⁻','#e8f2f6',180)]]},
 seeNote:'Shift the curve in the Visuals tab.',
 do:{title:'Read the curve',mat:'NCERT Figure 14.5',steps:['Read % saturation at pO₂ = 100 and 40 mm Hg.','Estimate how much O₂ is unloaded in tissues.'],obs:'Saturation falls substantially from alveolar to tissue pO₂.',why:'The sigmoid curve releases O₂ efficiently at tissue pO₂.',lab:false},
 memo:'"O₂: 97 on Hb. CO₂: 70 as bicarbonate."',
 miscon:['"Most CO₂ is carried by haemoglobin." Most (about 70%) is carried as bicarbonate.','"Haemoglobin carries one O₂." Up to four.'],
 terms:['Haemoglobin','Oxyhaemoglobin','Oxygen dissociation curve','Carbamino-haemoglobin','Carbonic anhydrase','Bicarbonate'],
 q:{q:'Most CO₂ is transported in blood as:',o:['Carbamino-haemoglobin','Bicarbonate ions','Dissolved CO₂','Carbonic acid only'],a:1,why:'About 70%.'},
 exam:'Oxygen dissociation curve and CO₂ transport are frequent 3–5 mark questions.'},
{id:'b6',num:'14.5–14.6',title:'Regulation of respiration and disorders',
 intro:'You never forget to breathe, even when asleep. What sets the rhythm?',
 obj:'Describe the respiratory centres and chemoreceptors, and name respiratory disorders.',
 prior:'Transport of gases (14.4).',
 simple:'A respiratory rhythm centre in the medulla sets the basic breathing rhythm; the pneumotaxic centre in the pons can adjust it. A chemosensitive area near the rhythm centre responds to CO₂ and H⁺. Disorders include asthma, emphysema and occupational lung disorders.',
 detail:'Human beings can moderate the respiratory rhythm to suit the demands of the body tissues; this is done by the neural system. A specialised centre in the medulla region of the brain, the respiratory rhythm centre, is primarily responsible for this regulation. Another centre in the pons, the pneumotaxic centre, can moderate the functions of the rhythm centre; neural signals from it can reduce the duration of inspiration and thereby alter the respiratory rate. A chemosensitive area adjacent to the rhythm centre is highly sensitive to CO₂ and hydrogen ions; increases in these activate it, which signals the rhythm centre to make adjustments so these substances can be eliminated. Receptors associated with the aortic arch and carotid artery also recognise changes in CO₂ and H⁺ concentration. The role of oxygen in regulating respiratory rhythm is quite insignificant. Disorders: asthma (difficulty in breathing causing wheezing due to inflammation of bronchi and bronchioles); emphysema (a chronic disorder in which alveolar walls are damaged, decreasing respiratory surface; a major cause is cigarette smoking); occupational respiratory disorders (in industries involving grinding or stone-breaking, so much dust is produced that the defence mechanisms cannot fully cope; long exposure can cause inflammation leading to fibrosis and serious lung damage; workers should wear protective masks).',
 real:'Stone-crushing and mining workers in Haryana and elsewhere are advised to wear masks because silica dust causes lasting lung damage.',
 apply:'Why does holding your breath eventually force you to breathe, even if you try not to?',
 see:{w:520,h:240,f:[
  ['Respiratory rhythm centre in the medulla sets the rhythm.',pill(150,60,'medulla: rhythm','#fbeef2',170)],
  ['Pneumotaxic centre in the pons adjusts it.',pill(380,60,'pons: pneumotaxic','#fbeef2',170)],
  ['A chemosensitive area responds to CO₂ and H⁺; O₂ plays a minor role.',pill(260,170,'CO₂ and H⁺ ↑ → breathe faster','#e8f2f6',240)]]},
 seeNote:'Disorders: asthma, emphysema, occupational disorders.',
 do:{title:'Breath-hold timing',mat:'Stopwatch',steps:['Breathe normally and hold your breath; note the time (stop when uncomfortable, never strain).','Rest, then take three slow deep breaths and hold again.'],obs:'The second hold is usually longer.',why:'Deep breaths lower blood CO₂ temporarily; rising CO₂ is what drives the urge to breathe.',lab:false},
 memo:'"Medulla makes the beat; pons tunes the tempo; CO₂ presses the accelerator."',
 miscon:['"Low oxygen is the main trigger for breathing." CO₂ and H⁺ are the main signals.','"Emphysema is caused by germs." A major cause is smoking.'],
 terms:['Respiratory rhythm centre','Pneumotaxic centre','Chemosensitive area','Asthma','Emphysema','Occupational respiratory disorders'],
 q:{q:'The pneumotaxic centre is located in the:',o:['Medulla','Pons','Cerebrum','Cerebellum'],a:1,why:'It moderates the rhythm centre.'},
 exam:'Regulation of breathing and disorders are 2–3 mark questions.'}
];

const CARDS=[['Respiratory organs','Body surface (sponges), skin (earthworm), tracheae (insects), gills (fish), lungs (land vertebrates).'],['Path of air','Nostrils → nasal chamber → pharynx → larynx → trachea → bronchi → bronchioles → alveoli.'],['Epiglottis','Covers the glottis during swallowing.'],['Inspiration','Diaphragm and external intercostals contract; volume ↑, pressure ↓.'],['Expiration','Muscles relax; volume ↓, pressure ↑ (passive at rest).'],['Breathing rate','12–16 per minute.'],['TV / IRV / ERV / RV','≈500 / 2500–3000 / 1000–1100 / 1100–1200 mL.'],['Vital capacity','ERV + TV + IRV.'],['TLC','VC + RV.'],['Alveoli pO₂ / pCO₂','104 / 40 mm Hg.'],['Tissues pO₂ / pCO₂','40 / 45 mm Hg.'],['CO₂ solubility','20–25 times that of O₂.'],['O₂ transport','97% oxyhaemoglobin; 3% plasma.'],['Dissociation curve','Sigmoid; ~5 mL O₂ delivered per 100 mL blood.'],['CO₂ transport','20–25% carbamino-Hb; 70% HCO₃⁻; 7% plasma.'],['Carbonic anhydrase','CO₂ + H₂O ⇌ H₂CO₃ ⇌ HCO₃⁻ + H⁺.'],['Control','Rhythm centre (medulla), pneumotaxic (pons), chemosensitive area (CO₂, H⁺).'],['Disorders','Asthma, emphysema, occupational disorders.']];

const Q=[
 {lv:1,q:'Gas exchange in humans takes place in the:',o:['Trachea','Bronchi','Alveoli','Pharynx'],a:2,w:'Alveoli.'},
 {lv:1,q:'Tidal volume is approximately:',o:['500 mL','1000 mL','2500 mL','5000 mL'],a:0,w:'Normal breath.'},
 {lv:1,q:'True or false: expiration at rest is normally a passive process.',o:['True','False'],a:0,w:'Muscles relax.'},
 {lv:1,q:'Insects breathe through:',o:['Gills','Lungs','Tracheal tubes','Skin only'],a:2,w:'Tracheal system.'},
 {lv:2,q:'Which volume cannot be measured by a simple spirometer because it never leaves the lungs?',o:['TV','IRV','ERV','RV'],a:3,w:'Residual volume.'},
 {lv:2,q:'About what percentage of O₂ is carried by haemoglobin?',o:['3%','25%','70%','97%'],a:3,w:'As oxyhaemoglobin.'},
 {lv:2,q:'The enzyme that speeds up CO₂ + H₂O ⇌ H₂CO₃ is:',o:['Pepsin','Carbonic anhydrase','Amylase','Trypsin'],a:1,w:'High in RBCs.'},
 {lv:3,q:'If TV = 500, IRV = 2500, ERV = 1000, RV = 1200 mL, TLC is:',o:['4000 mL','5200 mL','4200 mL','3700 mL'],a:1,w:'Sum of all four.'},
 {lv:3,q:'Which condition favours formation of oxyhaemoglobin?',o:['High pCO₂','High H⁺','High temperature','High pO₂, low pCO₂'],a:3,w:'As in alveoli.'},
 {lv:3,q:'CO₂ diffuses easily despite a small pressure gradient because:',o:['It is lighter','It is 20–25 times more soluble than O₂','It is actively transported','The membrane is thick'],a:1,w:'High solubility.'},
 {lv:4,q:'Assertion (A): The role of O₂ in regulating respiratory rhythm is insignificant. Reason (R): The chemosensitive area responds mainly to CO₂ and H⁺.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'NCERT.'},
 {lv:4,q:'Emphysema reduces gas exchange because:',o:['Bronchi narrow','Alveolar walls are damaged, reducing surface area','Haemoglobin falls','Diaphragm stops'],a:1,w:'Less respiratory surface.'},
 {lv:5,open:true,m:3,q:'Explain the mechanism of inspiration and expiration.',ans:['Inspiration: diaphragm and external intercostals contract; thoracic volume ↑ (1).','Intra-pulmonary pressure falls below atmospheric; air enters (1).','Expiration: muscles relax; volume ↓, pressure ↑ above atmospheric; air leaves (1).']},
 {lv:5,open:true,m:3,q:'Define vital capacity and total lung capacity. What is the significance of residual volume?',ans:['VC = ERV + TV + IRV: maximum air breathed out after forced inspiration (1).','TLC = VC + RV (1).','RV keeps alveoli open and allows continuous gas exchange between breaths (1).']},
 {lv:5,open:true,m:5,q:'Describe the transport of O₂ and CO₂ in blood, with the role of the oxygen dissociation curve.',ans:['O₂: 97% as oxyhaemoglobin, 3% in plasma (1).','Sigmoid dissociation curve; loading in alveoli, unloading in tissues (1).','Factors: pO₂, pCO₂, H⁺, temperature; ~5 mL O₂ per 100 mL blood delivered (1).','CO₂: 20–25% carbamino-Hb, 70% bicarbonate via carbonic anhydrase, 7% plasma (1).','Reaction reverses at alveoli; ~4 mL CO₂ per 100 mL blood delivered (1).']}
];

const ONEMIN=['Organs: body surface, skin, tracheae, gills, lungs.','Air path: nose → pharynx → larynx → trachea → bronchi → bronchioles → alveoli.','Inspiration: diaphragm + external intercostals contract; pressure falls.','12–16 breaths/min; spirometer.','TV 500, IRV 2500–3000, ERV 1000–1100, RV 1100–1200 mL.','VC = IRV + TV + ERV; TLC = VC + RV.','Diffusion by partial pressure; alveoli pO₂ 104, pCO₂ 40.','O₂ 97% on Hb; sigmoid curve.','CO₂ 70% bicarbonate (carbonic anhydrase), 20–25% carbamino-Hb, 7% plasma.','Medulla rhythm centre, pons pneumotaxic; CO₂ and H⁺ drive breathing.','Disorders: asthma, emphysema, occupational.'];
const KEYS=[['alveoli',/alveol/i],['diaphragm',/diaphragm/i],['intercostal muscles',/intercostal/i],['pressure gradient',/pressure/i],['tidal volume',/tidal|TV/],['vital capacity',/vital|VC/],['partial pressure',/partial|pO₂|po2/i],['diffusion',/diffus/i],['haemoglobin',/haemoglobin|hemoglobin|Hb/i],['bicarbonate',/bicarbonate|HCO/i],['medulla / pons',/medulla|pons|pneumotaxic/i],['disorders',/asthma|emphysema|occupational/i]];

/* ---------- lab ---------- */
let tool='spi',vsel='TV',gsel=1;
const VOL={TV:[500,'Tidal volume: air in or out in normal breathing.'],IRV:[2750,'Inspiratory reserve volume: extra air by forcible inspiration (2500–3000 mL).'],ERV:[1050,'Expiratory reserve volume: extra air by forcible expiration (1000–1100 mL).'],RV:[1150,'Residual volume: air left after forcible expiration (1100–1200 mL).'],IC:[0,'Inspiratory capacity = TV + IRV.'],EC:[0,'Expiratory capacity = TV + ERV.'],FRC:[0,'Functional residual capacity = ERV + RV.'],VC:[0,'Vital capacity = ERV + TV + IRV.'],TLC:[0,'Total lung capacity = RV + ERV + TV + IRV.']};
const RNG={TV:[0,1],IRV:[1,2],ERV:[3,4],RV:[4,5],IC:[0,2],EC:[3,1],FRC:[3,5],VC:[2,4],TLC:[2,5]};
function spDraw(){const tv=500,irv=2750,erv=1050,rv=1150;const lev=[rv+erv,rv+erv+tv,rv+erv+tv+irv,0,rv+erv,0];
 const Y=v=>300-v*(270/5600),X=x=>40+x;let d=`M${X(0)} ${Y(rv+erv)}`;
 for(let x=0;x<=440;x+=2){let v;if(x<120)v=rv+erv+tv/2+tv/2*Math.sin(x/19-Math.PI/2);else if(x<200)v=rv+erv+tv/2+(irv+tv/2)*Math.sin((x-120)/80*Math.PI/2)*(x<160?1:1);else if(x<280)v=rv+erv+tv+irv-(irv+tv+erv)*((x-200)/80);else if(x<320)v=rv+erv*((x-280)/40);else v=rv+erv+tv/2+tv/2*Math.sin((x-320)/19-Math.PI/2);d+=` L${X(x)} ${Y(v)}`}
 let s=`<line x1="40" y1="300" x2="490" y2="300" stroke="${ink}"/><line x1="40" y1="300" x2="40" y2="20" stroke="${ink}"/>`+T(25,16,'mL','font-size="11"');[0,1000,2000,3000,4000,5000].forEach(v=>s+=T(30,Y(v)+4,String(v),'font-size="10"'));
 const levels=[rv+erv+tv,rv+erv,rv+erv+tv+irv,rv,0];const top={TV:[rv+erv,rv+erv+tv],IRV:[rv+erv+tv,rv+erv+tv+irv],ERV:[rv,rv+erv],RV:[0,rv],IC:[rv+erv,rv+erv+tv+irv],EC:[rv,rv+erv+tv],FRC:[0,rv+erv],VC:[rv,rv+erv+tv+irv],TLC:[0,rv+erv+tv+irv]}[vsel];
 s+=`<rect x="40" y="${Y(top[1])}" width="450" height="${Y(top[0])-Y(top[1])}" fill="${PK}" opacity=".15"/><rect x="495" y="${Y(top[1])}" width="10" height="${Y(top[0])-Y(top[1])}" fill="${PK}"/>`;
 s+=`<path d="${d}" fill="none" stroke="${BL}" stroke-width="2.5"/><rect x="40" y="${Y(rv)}" width="450" height="${Y(0)-Y(rv)}" fill="#b4b2a9" opacity=".25"/>`+T(400,Y(rv/2)+4,'never exhaled (RV)','font-size="11"');$('#sp').innerHTML=s;
 const val=top[1]-top[0];$('#spOut').innerHTML=`<p><b>${vsel}</b> ≈ ${val} mL</p><p>${VOL[vsel][1]}</p>`}
const SITES=[['Atmospheric air',159,0.3],['Alveoli',104,40],['Deoxygenated blood',40,45],['Oxygenated blood',95,40],['Tissues',40,45]];
const POS=[[260,40],[260,120],[110,210],[410,210],[260,295]];
function gxDraw(){let s=`<path d="M260 58 V100 M110 192 L240 135 M280 135 L410 192 M410 228 L280 285 M240 285 L110 228" stroke="${ink}" stroke-opacity=".3" stroke-width="2" fill="none"/>`;
 SITES.forEach((st,i)=>{const[x,y]=POS[i],on=i===gsel;s+=`<rect x="${x-80}" y="${y-18}" width="160" height="36" rx="8" fill="${on?'#fbeef2':'var(--card)'}" stroke="${on?PK:'#b4b2a9'}" stroke-width="${on?2:1}"/>`+T(x,y-2,st[0],'font-size="12"')+T(x,y+13,`pO₂ ${st[1]} · pCO₂ ${st[2]}`,'font-size="11"')});
 $('#gx').innerHTML=s;const st=SITES[gsel];let note='';
 if(gsel===1)note='Compared with deoxygenated blood (pO₂ 40, pCO₂ 45): O₂ diffuses from alveoli into blood (104 → 40) and CO₂ from blood into alveoli (45 → 40).';
 else if(gsel===4)note='Compared with oxygenated blood (pO₂ 95, pCO₂ 40): O₂ diffuses from blood into tissues (95 → 40) and CO₂ from tissues into blood (45 → 40).';
 else if(gsel===0)note='Inhaled air mixes with air already in the lungs, so alveolar pO₂ (104) is lower than atmospheric (159).';
 else if(gsel===2)note='Blood returning from tissues: low O₂, high CO₂. It is sent to the lungs.';
 else note='Blood leaving the lungs: high O₂. It is pumped to the tissues.';
 $('#gxOut').innerHTML=`<p><b>${st[0]}</b>: pO₂ ${st[1]} mm Hg, pCO₂ ${st[2]} mm Hg</p><p>${note}</p>`}
function labInit(){$('#spB').innerHTML=Object.keys(VOL).map(k=>`<button class="btn" data-vol="${k}">${k}</button>`).join('');$('#gxB').innerHTML=SITES.map((s,i)=>`<button class="btn" data-site="${i}">${s[0]}</button>`).join('')}
function labShow(){if(tool==='spi')spDraw();else gxDraw()}
function labClick(b){if(b.dataset.tool){tool=b.dataset.tool;$$('[data-tool]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.tool===tool));['spi','gas'].forEach(t=>$('#t-'+t).hidden=t!==tool);labShow();return true}
 if(b.dataset.vol){vsel=b.dataset.vol;spDraw();return true}if(b.dataset.site){gsel=+b.dataset.site;gxDraw();return true}return false}
function labChange(t){return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
