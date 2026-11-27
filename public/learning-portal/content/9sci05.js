/* Rai Plus content pack: Class 9 Science, Chapter 5 – The Fundamental Unit of Life (rationalised NCERT). Bilingual: Hindi terms alongside. */
RP.register({key:'9sci05',cls:'9',subject:'Science',ch:'5',title:"The Fundamental Unit of Life",color:'#3b6d11',
crumb:"HBSE Class 9 Science · जीवन की मौलिक इकाई · Taught in August",h1:"Chapter 5: The Fundamental Unit of Life · जीवन की मौलिक इकाई",sub:"Discovery of the cell, the plasma membrane and osmosis, the cell wall and plasmolysis, the nucleus, the organelles and their jobs, and how cells divide.",heroLabel:"A plant cell with its organelles",labName:'Osmosis lab',
theme:"\n:root{--g:light-dark(#3b6d11,#a8d77d);--g2:light-dark(#eef6e4,#0f1a07);--line:light-dark(#d4e7bf,#2c4219);--bg:light-dark(#ffffff,#0b1206);--card:light-dark(#ffffff,#111a0a);\n--ink:light-dark(#162508,#e6f1da);--mute:light-dark(#4f6439,#b5c9a0);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#2b520b}\n",
labHTML:`  <h2>Osmosis lab · परासरण प्रयोगशाला</h2>
  <p>Put a cell into water with different amounts of salt. Water moves across the membrane from where it is more (dilute side) to where it is less (concentrated side). Watch the cell swell or shrink, and see why plant cells survive in pure water but animal cells may burst.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="osSvg" viewBox="0 0 520 320" role="img" aria-label="Osmosis" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Cell<select id="osC"><option value="p">Plant cell (onion peel) · पादप कोशिका</option><option value="a">Animal cell (red blood cell) · जंतु कोशिका</option></select></label></div>
  <div class="ctrl"><label><span>Salt outside: <b id="osSv"></b>%</span><input type="range" id="osS" min="0" max="5" step="0.1" value="0.9"></label></div>
  <div class="box y" id="osOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3b6d11',LABNAME='Osmosis lab',MIND_CENTER='Cell · कोशिका';
const GN='#3b6d11',BL='#1f5f8b',OR='#b04a1f',PU='#6a4fb3',RD='#c0392b',YL='#c9a227',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const lead=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ink}" stroke-width="1" stroke-opacity=".6"/>`;
function plantCell(x,y,w,h,s=1){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${14*s}" fill="${GN}" fill-opacity=".08" stroke="${GN}" stroke-width="${7*s}"/><rect x="${x+8*s}" y="${y+8*s}" width="${w-16*s}" height="${h-16*s}" rx="${10*s}" fill="#e9f6dc" fill-opacity=".6" stroke="${GN}" stroke-width="${1.5*s}"/>`+
 `<ellipse cx="${x+w*.58}" cy="${y+h*.52}" rx="${w*.24}" ry="${h*.26}" fill="${BL}" fill-opacity=".18" stroke="${BL}" stroke-width="${1.5*s}"/>`+
 `<circle cx="${x+w*.22}" cy="${y+h*.3}" r="${h*.12}" fill="${PU}" fill-opacity=".3" stroke="${PU}" stroke-width="${1.5*s}"/><circle cx="${x+w*.22}" cy="${y+h*.3}" r="${h*.04}" fill="${PU}"/>`+
 [[.2,.75],[.85,.2],[.45,.15],[.88,.8]].map(([a,b])=>`<ellipse cx="${x+w*a}" cy="${y+h*b}" rx="${w*.06}" ry="${h*.04}" fill="${GN}"/>`).join('')+
 `<ellipse cx="${x+w*.35}" cy="${y+h*.85}" rx="${w*.06}" ry="${h*.035}" fill="${OR}" fill-opacity=".6" stroke="${OR}"/>`}
function heroDraw(){return `<rect x="60" y="25" width="220" height="100" rx="14" fill="none" stroke="#fff" stroke-width="5"/><ellipse cx="190" cy="76" rx="50" ry="28" fill="#fff" opacity=".25"/><circle cx="110" cy="58" r="14" fill="#fff" opacity=".8"/>`+[[95,100],[240,45],[150,42]].map(([a,b])=>`<ellipse cx="${a}" cy="${b}" rx="10" ry="5" fill="#fff"/>`).join('')}
const HERO=heroDraw;
const MIND=[['Discovery & cell theory',100,50],['Membrane & osmosis',420,50],['Cell wall & plasmolysis',90,150],['Nucleus; pro/eukaryotes',430,150],['Organelles · कोशिकांग',110,250],['Cell division',410,250]];

const C=[
{id:'c1',num:'5.1',title:'Discovery of the cell · कोशिका की खोज',
 intro:'In 1665 Robert Hooke looked at a thin slice of cork and saw tiny boxes like a honeycomb. What had he found?',
 obj:'Trace the discovery of cells and state the cell theory.',
 prior:'Class 8: cell structure and functions.',
 simple:'Robert Hooke (1665) saw little compartments in cork and called them cells (कोशिका). A cell is the basic structural and functional unit of life. Some organisms are a single cell — unicellular (एककोशिकीय): Amoeba, Paramecium, bacteria. Others have many cells working together — multicellular (बहुकोशिकीय): plants, animals, fungi.',
 detail:'Leeuwenhoek (1674) first saw free-living cells in pond water with an improved microscope. Robert Brown (1831) discovered the nucleus. Purkinje (1839) coined "protoplasm". Schleiden (1838) and Schwann (1839) proposed the cell theory: all plants and animals are made of cells, and the cell is the basic unit of life. Virchow (1855) added: all cells arise from pre-existing cells. Cells have different shapes and sizes to suit their functions — long branched nerve cells, disc-shaped red blood cells.',
 real:'An onion peel under a school microscope shows neatly arranged, brick-like cells.',
 apply:'Why are nerve cells long and branched?',
 see:{w:520,h:220,f:[
  ['Hooke\'s cork cells.',[...Array(12)].map((_,i)=>`<rect x="${30+(i%4)*36}" y="${50+Math.floor(i/4)*36}" width="32" height="32" fill="none" stroke="${OR}" stroke-width="3"/>`).join('')+lbl(100,180,'cork (1665)')],
  ['Unicellular Amoeba.',`<path d="M250 110 q-30 -50 20 -55 q40 -20 50 25 q30 20 0 45 q-10 30 -45 15 q-40 5 -25 -30z" fill="${BL}" fill-opacity=".2" stroke="${BL}" stroke-width="2"/><circle cx="270" cy="100" r="9" fill="${PU}"/>`+lbl(275,180,'one cell')],
  ['Specialised shapes.',`<circle cx="430" cy="80" r="10" fill="${PU}"/><path d="M430 90 L430 160 M430 160 l-15 15 M430 160 l15 15 M422 74 l-20 -18 M438 74 l20 -18" stroke="${PU}" stroke-width="3" fill="none"/>`+lbl(430,195,'nerve cell')]]},
 seeNote:'Cells come in many shapes.',
 do:{title:'Onion peel slide',mat:'Onion, forceps, slide, safranin, glycerine, microscope',steps:['Peel the thin inner skin; stain with safranin.','Mount in glycerine; observe.'],obs:'Brick-like cells with nuclei.',why:'Plants are made of cells.',lab:true},
 memo:'"Hooke named, Brown found the nucleus, Schleiden–Schwann stated, Virchow completed."',
 miscon:['"Hooke saw living cells." He saw dead cork cell walls.'],
 terms:['Cell · कोशिका','Unicellular · एककोशिकीय','Multicellular · बहुकोशिकीय','Cell theory · कोशिका सिद्धांत','Protoplasm · जीवद्रव्य'],
 q:{q:'Who discovered the nucleus?',o:['Hooke','Brown','Purkinje','Virchow'],a:1,why:'1831.'},
 exam:'Scientists and contributions: 1–2 marks.'},

{id:'c2',num:'5.2',title:'Plasma membrane, diffusion and osmosis · प्लाज्मा झिल्ली और परासरण',
 intro:'Why does a raisin swell in water, and why do vegetables go limp in salted water?',
 obj:'Describe the plasma membrane and explain diffusion and osmosis.',
 prior:'Chapter 1: diffusion.',
 simple:'The plasma membrane (प्लाज्मा झिल्ली) is the outer covering of every cell. It is selectively permeable (वरणात्मक पारगम्य): it lets some substances in and out but not others. Gases like O₂ and CO₂ move by diffusion (विसरण), from higher to lower concentration. Osmosis (परासरण) is the movement of water through a selectively permeable membrane from a region of higher water concentration (dilute solution) to lower water concentration (concentrated solution).',
 detail:'Hypotonic outside solution (more dilute): water enters, cell swells. Isotonic (same concentration): no net change. Hypertonic (more concentrated): water leaves, cell shrinks. The membrane is made of lipids and proteins and is flexible, so cells like Amoeba can engulf food by endocytosis. Unicellular freshwater organisms and plant roots take in water by osmosis.',
 real:'Salting pickles draws water out of the vegetables by osmosis, which also stops microbes from growing.',
 apply:'What happens to a de-shelled egg placed in concentrated salt solution?',
 see:{w:520,h:220,f:[
  ['A raisin in water (hypotonic).',`<ellipse cx="100" cy="110" rx="28" ry="20" fill="${OR}" fill-opacity=".5" stroke="${OR}"/>`+lbl(100,170,'water moves in')+`<path d="M40 110 h25 M160 110 h-25" stroke="${BL}" stroke-width="2.5" marker-end="url(#ah)"/>`],
  ['Isotonic: no net change.',`<ellipse cx="260" cy="110" rx="34" ry="26" fill="${OR}" fill-opacity=".4" stroke="${OR}"/>`+lbl(260,170,'balanced')],
  ['Hypertonic: water leaves.',`<ellipse cx="420" cy="110" rx="22" ry="15" fill="${OR}" fill-opacity=".6" stroke="${OR}"/>`+`<path d="M395 110 h-30 M445 110 h30" stroke="${BL}" stroke-width="2.5" marker-end="url(#ah)"/>`+lbl(420,170,'cell shrinks')+lbl(260,30,'water: dilute → concentrated, through the membrane','font-weight="700"')]]},
 seeNote:'Water follows the solute.',
 do:{title:'Raisin and egg',mat:'Raisins, de-shelled egg, water, salt/sugar solution',steps:['Soak raisins in water and in sugar solution.','Compare after 2 hours.'],obs:'Swell in water; stay shrunken in sugar solution.',why:'Osmosis.',lab:true},
 memo:'"Water walks to the salty side."',
 miscon:['"In osmosis, salt moves into the cell." Only water moves across the membrane in osmosis.'],
 terms:['Plasma membrane · प्लाज्मा झिल्ली','Selectively permeable · वरणात्मक पारगम्य','Diffusion · विसरण','Osmosis · परासरण','Hypotonic · अल्पपरासरी','Hypertonic · अतिपरासरी','Isotonic · समपरासरी','Endocytosis'],
 q:{q:'A cell in a hypotonic solution will:',o:['shrink','swell','stay the same','dissolve'],a:1,why:'Water enters.'},
 exam:'Hypo/iso/hypertonic, raisin/egg experiments: 3 marks.'},

{id:'c3',num:'5.3',title:'Cell wall and plasmolysis · कोशिका भित्ति और जीवद्रव्यकुंचन',
 intro:'Why do plant cells not burst in fresh water, while red blood cells can?',
 obj:'Describe the cell wall and explain plasmolysis.',
 prior:'5.2.',
 simple:'Plant cells have a rigid cell wall (कोशिका भित्ति) outside the plasma membrane, made mainly of cellulose. It gives strength and stops the cell from bursting in dilute solutions — the cell becomes firm (turgid). When a plant cell loses water in a concentrated solution, its contents shrink away from the wall. This is plasmolysis (जीवद्रव्यकुंचन).',
 detail:'Cell walls let plant cells withstand very dilute external media. Fungi and bacteria also have cell walls (not made of cellulose). Turgid cells keep leaves and young stems upright; a wilted plant recovers when watered because cells take in water by osmosis. Plasmolysis can be seen in Rhoeo leaf peel placed in salt solution.',
 real:'Too much fertiliser around roots can make the soil water concentrated and pull water out of the plant — it wilts.',
 apply:'Why does a wilted plant become fresh again after watering?',
 see:{w:520,h:220,f:[
  ['Turgid plant cell.',`<rect x="40" y="50" width="160" height="120" rx="10" fill="none" stroke="${GN}" stroke-width="7"/><rect x="48" y="58" width="144" height="104" rx="8" fill="${GN}" fill-opacity=".25" stroke="${GN}"/>`+lbl(120,195,'turgid (in water)')],
  ['Contents shrink away.',`<rect x="300" y="50" width="160" height="120" rx="10" fill="none" stroke="${GN}" stroke-width="7"/><ellipse cx="380" cy="110" rx="48" ry="34" fill="${GN}" fill-opacity=".3" stroke="${GN}"/>`+lbl(380,195,'plasmolysed (in salt)')],
  ['The wall keeps its shape.',lbl(260,30,'cell wall stays; membrane pulls away','font-weight="700"')]]},
 seeNote:'Wall stays, contents shrink.',
 do:{title:'Rhoeo plasmolysis',mat:'Rhoeo leaf peel, salt solution, microscope',steps:['Mount the peel in water; observe.','Replace water with salt solution; observe again.'],obs:'Coloured contents shrink from the wall.',why:'Exosmosis.',lab:true},
 memo:'"Wall stays, membrane runs away."',
 miscon:['"Animal cells have cell walls." Only plants, fungi and bacteria do.'],
 terms:['Cell wall · कोशिका भित्ति','Cellulose · सेल्युलोज','Plasmolysis · जीवद्रव्यकुंचन','Turgid · स्फीत'],
 q:{q:'The plant cell wall is mainly made of:',o:['protein','cellulose','starch','lipid'],a:1,why:'Polysaccharide.'},
 exam:'Plasmolysis with diagram: 3 marks.'},

{id:'c4',num:'5.4',title:'The nucleus; prokaryotes and eukaryotes · केंद्रक',
 intro:'Bacteria have no proper nucleus. So where do they keep their instructions?',
 obj:'Describe the nucleus and compare prokaryotic and eukaryotic cells.',
 prior:'5.1.',
 simple:'The nucleus (केंद्रक) is the control centre of the cell. It has a double-layered nuclear membrane with pores, and contains chromosomes (गुणसूत्र) made of DNA and protein. DNA carries the information for making and organising the cell. In a non-dividing cell, this material appears as tangled threads called chromatin. Cells with a well-defined nucleus are eukaryotic (यूकैरियोटिक); cells without a nuclear membrane are prokaryotic (प्रोकैरियोटिक).',
 detail:'In prokaryotes (bacteria), the genetic material lies in a region called the nucleoid, and membrane-bound organelles are absent; they are generally small (1–10 μm). Eukaryotes (plants, animals, fungi, protists) have a nucleus and membrane-bound organelles, and are generally larger (5–100 μm). Genes are functional segments of DNA.',
 real:'Antibiotics target features of bacterial cells that our eukaryotic cells lack.',
 apply:'Make a table of three differences between prokaryotic and eukaryotic cells.',
 see:{w:520,h:220,f:[
  ['A prokaryote: no nuclear membrane.',`<rect x="40" y="70" width="170" height="80" rx="40" fill="${OR}" fill-opacity=".1" stroke="${OR}" stroke-width="2"/><path d="M80 110 q20 -20 40 0 t40 0" fill="none" stroke="${PU}" stroke-width="3"/>`+lbl(125,175,'nucleoid · bacteria')],
  ['A eukaryote: true nucleus.',`<ellipse cx="380" cy="110" rx="110" ry="65" fill="${BL}" fill-opacity=".08" stroke="${BL}" stroke-width="2"/><circle cx="380" cy="110" r="32" fill="${PU}" fill-opacity=".2" stroke="${PU}" stroke-width="3"/><circle cx="380" cy="110" r="8" fill="${PU}"/>`+lbl(380,195,'nucleus with membrane')],
  ['Chromosomes: DNA + protein.',lbl(380,40,'chromatin → chromosomes','font-weight="700"')]]},
 seeNote:'Membrane around the DNA or not.',
 do:{title:'Cheek cells',mat:'Toothpick, slide, methylene blue, microscope',steps:['Gently scrape inside the cheek; spread on a slide.','Stain; observe.'],obs:'Nucleus stained dark blue.',why:'Eukaryotic cells.',lab:true},
 memo:'"Pro = before nucleus; Eu = true nucleus."',
 miscon:['"Bacteria have no DNA." They have DNA, just no nuclear membrane.'],
 terms:['Nucleus · केंद्रक','Chromosome · गुणसूत्र','DNA','Chromatin','Gene · जीन','Prokaryote','Eukaryote','Nucleoid'],
 q:{q:'Which has no nuclear membrane?',o:['onion cell','cheek cell','bacterium','Amoeba'],a:2,why:'Prokaryote.'},
 exam:'Prokaryote vs eukaryote: 3 marks.'},

{id:'c5',num:'5.5',title:'Cell organelles · कोशिकांग',
 intro:'A cell is like a busy factory. Who makes the products, who packs them, who supplies the power?',
 obj:'State the structure and function of the main cell organelles.',
 prior:'5.4.',
 simple:'Endoplasmic reticulum (ER · अंतर्द्रव्यी जालिका): a network of membranes for transport; rough ER has ribosomes and makes proteins, smooth ER makes fats (lipids) and detoxifies poisons. Golgi apparatus (गॉल्जी उपकरण): stores, modifies and packages products. Lysosomes (लयनकाय): bags of digestive enzymes — "suicide bags". Mitochondria (सूत्रकणिका): powerhouses that release energy as ATP. Plastids (लवक): chloroplasts for photosynthesis in plants. Vacuoles (रिक्तिका): storage sacs, very large in plant cells.',
 detail:'Mitochondria and plastids have their own DNA and ribosomes and can make some of their own proteins. Chromoplasts give colour to flowers and fruits; leucoplasts store starch, oils and proteins. Ribosomes are the sites of protein synthesis. Membrane biogenesis: proteins and lipids made by ER help build the cell membrane. Lysosomes burst and digest a damaged cell.',
 real:'A cell is like a school: the nucleus is the principal\'s office, mitochondria the power room, Golgi the dispatch section.',
 apply:'Match each organelle with a job in a factory.',
 see:{w:520,h:240,f:[
  ['A plant cell.',plantCell(140,30,260,170)],
  ['Labels.',lead(170,80,95,60)+lbl(65,55,'nucleus')+lead(290,120,440,120)+lbl(470,124,'vacuole')+lead(195,158,95,190)+lbl(70,200,'chloroplast')+lead(232,180,300,222)+lbl(340,228,'mitochondrion')],
  ['Wall and membrane.',lead(145,40,90,20)+lbl(60,18,'cell wall')+lead(395,45,460,20)+lbl(470,18,'membrane')]]},
 seeNote:'Each organelle has a job.',
 do:{title:'Cell model',mat:'Thermocol tray, clay, beads, string',steps:['Build a plant cell model.','Label each organelle with its job.'],obs:'Organelle map.',why:'Structure and function.',lab:false},
 memo:'"Mito makes power, Golgi packs, lysosome cleans, ER carries."',
 miscon:['"Only plant cells have mitochondria." Both plant and animal cells have them.'],
 terms:['Endoplasmic reticulum · अंतर्द्रव्यी जालिका','Golgi apparatus · गॉल्जी उपकरण','Lysosome · लयनकाय','Mitochondria · सूत्रकणिका','Plastids · लवक','Vacuole · रिक्तिका','Ribosome','ATP'],
 q:{q:'The "powerhouse" of the cell is the:',o:['nucleus','mitochondrion','Golgi apparatus','vacuole'],a:1,why:'Releases ATP energy.'},
 exam:'Organelle functions; plant vs animal cell: 3–5 marks.'},

{id:'c6',num:'5.6',title:'Cell division · कोशिका विभाजन',
 intro:'You grew from a single cell. How did one cell become trillions?',
 obj:'Distinguish between mitosis and meiosis.',
 prior:'5.4.',
 simple:'New cells form by cell division (कोशिका विभाजन) for growth, repair and reproduction. Mitosis (समसूत्री विभाजन): one cell divides into two identical daughter cells with the same number of chromosomes as the parent — for growth and repair. Meiosis (अर्धसूत्री विभाजन): happens in reproductive organs; one cell divides twice to form four cells, each with half the number of chromosomes — these are gametes (eggs and sperm).',
 detail:'Halving in meiosis keeps the chromosome number constant across generations: when two gametes fuse, the full number is restored. Humans have 46 chromosomes in body cells and 23 in gametes. Mitosis also replaces worn-out cells, such as skin and blood cells.',
 real:'A cut finger heals as cells near the wound divide by mitosis.',
 apply:'Why must gametes have half the chromosome number?',
 see:{w:520,h:220,f:[
  ['Parent cell.',`<circle cx="70" cy="110" r="40" fill="${GN}" fill-opacity=".15" stroke="${GN}" stroke-width="2"/>`+lbl(70,115,'46')],
  ['Mitosis: two identical cells.',`<circle cx="200" cy="80" r="28" fill="${GN}" fill-opacity=".15" stroke="${GN}" stroke-width="2"/><circle cx="200" cy="145" r="28" fill="${GN}" fill-opacity=".15" stroke="${GN}" stroke-width="2"/>`+lbl(200,85,'46')+lbl(200,150,'46')+lbl(200,200,'mitosis','font-weight="700"')],
  ['Meiosis: four cells, half number.',[[350,70],[410,70],[350,150],[410,150]].map(([a,b])=>`<circle cx="${a}" cy="${b}" r="22" fill="${OR}" fill-opacity=".15" stroke="${OR}" stroke-width="2"/>`+lbl(a,b+5,'23')).join('')+lbl(380,200,'meiosis','font-weight="700"')]]},
 seeNote:'Mitosis copies; meiosis halves.',
 do:{title:'Onion root tip',mat:'Prepared slide of onion root tip',steps:['Observe under the microscope.','Spot cells with visible chromosomes.'],obs:'Dividing cells.',why:'Mitosis in growing tips.',lab:false},
 memo:'"Mi-TWO-sis makes two; MEI-osis makes gametes."',
 miscon:['"Meiosis happens everywhere in the body." Only in reproductive organs.'],
 terms:['Cell division · कोशिका विभाजन','Mitosis · समसूत्री','Meiosis · अर्धसूत्री','Gamete · युग्मक','Daughter cell'],
 q:{q:'Meiosis produces:',o:['2 identical cells','4 cells with half the chromosomes','1 cell','4 identical body cells'],a:1,why:'Gametes.'},
 exam:'Mitosis vs meiosis: 2–3 marks.'}
];

const CARDS=[['Cell · कोशिका','Basic structural and functional unit of life.'],['Hooke 1665','Saw cork cells.'],['Cell theory','Schleiden, Schwann; Virchow: cells from cells.'],['Plasma membrane','Selectively permeable boundary.'],['Osmosis · परासरण','Water through membrane: dilute → concentrated.'],['Hypo/iso/hyper','Swell / no change / shrink.'],['Cell wall','Cellulose; prevents bursting.'],['Plasmolysis','Contents shrink from wall in strong solution.'],['Nucleus','Control centre; chromosomes = DNA + protein.'],['Prokaryote','No nuclear membrane; nucleoid.'],['Mitochondria','Powerhouse: ATP.'],['Lysosome','Suicide bags: digestive enzymes.'],['Golgi','Packages and dispatches.'],['Mitosis vs meiosis','2 identical vs 4 with half chromosomes.']];

const Q=[
 {lv:1,q:'Who first used the word "cell"?',o:['Leeuwenhoek','Hooke','Brown','Schwann'],a:1,w:'1665.'},
 {lv:1,q:'Which organelle contains digestive enzymes?',o:['mitochondrion','lysosome','ribosome','plastid'],a:1,w:'Suicide bag.'},
 {lv:1,q:'Site of photosynthesis:',o:['chloroplast','nucleus','vacuole','Golgi'],a:0,w:'Plastid with chlorophyll.'},
 {lv:2,q:'The plasma membrane is:',o:['fully permeable','impermeable','selectively permeable','made of cellulose'],a:2,w:'Lets some substances pass.'},
 {lv:2,q:'Which cell has the largest vacuole?',o:['nerve cell','plant cell','RBC','bacterium'],a:1,w:'Central vacuole.'},
 {lv:2,q:'Rough ER is rough because of:',o:['lipids','ribosomes','DNA','cellulose'],a:1,w:'Ribosomes attached.'},
 {lv:3,q:'An animal cell in pure water may:',o:['shrink','burst','plasmolyse','stay the same'],a:1,w:'No cell wall.'},
 {lv:3,q:'Which organelles have their own DNA?',o:['Golgi and ER','mitochondria and plastids','lysosomes and vacuoles','ribosomes'],a:1,w:'Semi-autonomous.'},
 {lv:4,q:'Human gametes contain:',o:['46 chromosomes','23 chromosomes','92 chromosomes','12 chromosomes'],a:1,w:'Meiosis halves.'},
 {lv:4,q:'Leaves of a plant in salty soil wilt because:',o:['water enters cells','water leaves cells by osmosis','cells divide','walls break'],a:1,w:'Hypertonic soil water.'},
 {lv:5,open:true,m:3,q:'What happens to (a) an animal cell and (b) a plant cell placed in a hypotonic solution? Give reasons.',ans:['Animal: swells, may burst (1)','Plant: becomes turgid, does not burst (1)','Reason: water enters by osmosis; cell wall resists (1)']},
 {lv:5,open:true,m:5,q:'Draw a labelled diagram of a plant cell. Give three differences between plant and animal cells.',ans:['Diagram with wall, membrane, nucleus, vacuole, chloroplast (2)','Plant has cell wall; animal does not (1)','Plant has plastids; animal does not (1)','Plant has large central vacuole; animal small/many (1)']}
];

const ONEMIN=['Hooke, Brown, cell theory.','Membrane, diffusion, osmosis.','Cell wall, turgor, plasmolysis.','Nucleus; prokaryote vs eukaryote.','Organelles and their jobs.','Mitosis vs meiosis.'];
const KEYS=[['discovery',/hooke|cell theory|कोशिका/i],['osmosis',/osmosis|परासरण|membrane/i],['plasmolysis',/plasmolysis|cell wall|भित्ति/i],['nucleus',/nucleus|केंद्रक|prokaryot|eukaryot/i],['organelles',/mitochondri|golgi|lysosome|organelle|कोशिकांग/i],['division',/mitosis|meiosis|division|विभाजन/i]];

/* ---------- lab ---------- */
let cell='p',salt=0.9,size=1,run=false,wired=false,looping=false,last=0;
function target(){const d=0.9-salt;if(cell==='a'){return Math.max(.55,Math.min(1.35,1+d*.42))}return Math.max(.55,Math.min(1.02,1+d*.3))}
function draw(){const tgt=target();const burst=cell==='a'&&salt<0.3&&size>1.3;let g=`<rect x="10" y="20" width="500" height="250" rx="16" fill="${BL}" fill-opacity="${.04+salt*.05}" stroke="${BL}" stroke-opacity=".3"/>`;
 for(let i=0;i<Math.round(salt*10);i++)g+=`<circle cx="${30+(i*71)%460}" cy="${40+(i*53)%210}" r="3" fill="${OR}"/>`;
 const cx=260,cy=145;
 if(cell==='p'){g+=`<rect x="${cx-110}" y="${cy-80}" width="220" height="160" rx="14" fill="none" stroke="${GN}" stroke-width="8"/>`;const w=196*size,h=136*size;g+=`<rect x="${cx-w/2}" y="${cy-h/2}" width="${w}" height="${h}" rx="${12+(1-size)*30}" fill="${GN}" fill-opacity=".25" stroke="${GN}" stroke-width="2"/><circle cx="${cx-w*.28}" cy="${cy-h*.2}" r="${14*Math.sqrt(size)}" fill="${PU}" fill-opacity=".5"/>`}
 else if(!burst){const r=60*size;g+=`<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r*(size<.85?.75:.9)}" fill="${RD}" fill-opacity=".45" stroke="${RD}" stroke-width="2"/>`+(size<.85?[...Array(10)].map((_,i)=>{const a=i/10*6.28;return `<circle cx="${cx+Math.cos(a)*r}" cy="${cy+Math.sin(a)*r*.75}" r="5" fill="${RD}" fill-opacity=".6"/>`}).join(''):'')}
 else{g+=[...Array(12)].map((_,i)=>{const a=i/12*6.28;return `<path d="M${cx+Math.cos(a)*55} ${cy+Math.sin(a)*55} l${Math.cos(a)*25} ${Math.sin(a)*25}" stroke="${RD}" stroke-width="4"/>`}).join('')+T(cx,cy+5,'BURST!','font-size="22" font-weight="700" fill="'+RD+'"')}
 const dir=burst?'':tgt>size+.01?'in':tgt<size-.01?'out':'';
 if(dir){[[60,145],[460,145],[260,40],[260,255]].forEach(([x,y])=>{const dx=cx-x,dy=cy-y,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,s=dir==='in'?1:-1;const x1=dir==='in'?x:cx-ux*120,y1=dir==='in'?y:cy-uy*95;g+=`<line x1="${x1}" y1="${y1}" x2="${x1+ux*40*s}" y2="${y1+uy*40*s}" stroke="${BL}" stroke-width="3" marker-end="url(#ah)"/>`})}
 const kind=salt<0.85?'Hypotonic · अल्पपरासरी':salt>0.95?'Hypertonic · अतिपरासरी':'Isotonic · समपरासरी';
 g+=T(260,300,kind+(burst?' — cell burst':dir?` — water moving ${dir}`:' — balance reached'),'font-size="14" font-weight="700"');
 $('#osSvg').innerHTML=g;$('#osSv').textContent=salt.toFixed(1);
 let msg='';if(cell==='p'){msg=size<.8?'<b>Plasmolysis:</b> the contents have shrunk away from the cell wall.':salt<0.85?'<b>Turgid:</b> the cell is full and firm. The cell wall stops it from bursting.':'The cell is normal.'}else{msg=burst?'<b>The cell burst.</b> Animal cells have no cell wall to resist water coming in.':size<.85?'<b>Crenated:</b> the red blood cell has shrunk and wrinkled.':salt<0.85?'The cell is swelling as water enters.':'Normal shape: 0.9% salt is isotonic with blood. That is why a saline drip is 0.9%.'}
 $('#osOut').innerHTML=`<p>${msg}</p><p>Inside the cell ≈ 0.9% salt; outside ${salt.toFixed(1)}%. Water moves from the more dilute side to the more concentrated side.</p>`}
function loop(ts){if(!$('#osSvg')||!$('#osSvg').isConnected||($('#v-lab')&&$('#v-lab').hidden)){looping=false;return}const dt=last?Math.min(.05,(ts-last)/1000):0;last=ts;const t=target();const burstLimit=cell==='a'&&salt<0.3?1.45:t;
 const goal=cell==='a'&&salt<0.3?burstLimit:t;if(Math.abs(goal-size)>.003)size+=(goal-size)*Math.min(1,dt*1.6);draw();requestAnimationFrame(loop)}
function labShow(){last=0;if(!looping){looping=true;requestAnimationFrame(loop)}}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='osS'){salt=+e.target.value;if(!looping){looping=true;last=0;requestAnimationFrame(loop)}}})}
function labClick(){return false}
function labChange(t){if(t.id==='osC'){cell=t.value;size=1;if(!looping){looping=true;last=0;requestAnimationFrame(loop)}return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
