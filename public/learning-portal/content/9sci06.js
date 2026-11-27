/* Rai Plus content pack: Class 9 Science, Chapter 6 – Tissues (rationalised NCERT). Bilingual: Hindi terms alongside. */
RP.register({key:'9sci06',cls:'9',subject:'Science',ch:'6',title:"Tissues",color:'#8a3b5c',
crumb:"HBSE Class 9 Science · ऊतक · Taught in August–September",h1:"Chapter 6: Tissues · ऊतक",sub:"Why many-celled organisms need tissues, plant tissues (meristematic, simple and complex permanent) and animal tissues (epithelial, connective, muscular and nervous).",heroLabel:"Cells grouped into a tissue",labName:'Virtual microscope',
theme:"\n:root{--g:light-dark(#8a3b5c,#eba7c4);--g2:light-dark(#faedf2,#1d0c14);--line:light-dark(#efd3de,#46283a);--bg:light-dark(#ffffff,#130a0f);--card:light-dark(#ffffff,#1a0f15);\n--ink:light-dark(#2d1220,#f6e6ee);--mute:light-dark(#6a4a5a,#d1b4c2);--y:light-dark(#1f5f8b,#8cc4ea);--y2:light-dark(#eaf3fa,#081520);--hd:#6a2a45}\n",
labHTML:`  <h2>Virtual microscope · आभासी सूक्ष्मदर्शी</h2>
  <p>Choose a slide to study a tissue, or press <b>Mystery slide</b> and identify the tissue from what you see. Look for the clues: cell shape, wall thickness, spaces between cells, and nuclei.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="tmSvg" viewBox="0 0 520 320" role="img" aria-label="Microscope view" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Slide<select id="tmS"></select></label></div>
  <div class="ctrl"><button class="btn p" id="tmQ">Mystery slide</button></div>
  <div class="ctrl" id="tmOpts" style="display:none"></div>
  <div class="box y" id="tmOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#8a3b5c',LABNAME='Virtual microscope',MIND_CENTER='Tissues · ऊतक';
const MG='#8a3b5c',GN='#3b6d11',BL='#1f5f8b',OR='#b04a1f',PU='#6a4fb3',RD='#c0392b',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-4:5),t,`font-size="12.5" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+13,sub,'font-size="10"'):'');
const ln=(x1,y1,x2,y2,c=GR)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2"/>`;
let seed=3;const R=()=>{seed=(seed*9301+49297)%233280;return seed/233280};
/* procedural micrographs, drawn inside x0,y0,w,h */
const TIS={
 parenchyma:[GN,'Parenchyma · मृदूतक','Plant · simple permanent','Thin-walled, round, loosely packed living cells with spaces between them. Stores food; chlorenchyma (with chloroplasts) makes food; aerenchyma (large air spaces) helps aquatic plants float.',
  (x,y,w,h)=>{seed=3;let s='';for(let i=0;i<5;i++)for(let j=0;j<4;j++){const cx=x+40+i*(w-80)/4+(j%2)*18,cy=y+35+j*(h-70)/3;s+=`<circle cx="${cx}" cy="${cy}" r="${30+R()*4}" fill="${GN}" fill-opacity=".14" stroke="${GN}" stroke-width="2"/><circle cx="${cx+8}" cy="${cy-6}" r="5" fill="${PU}" fill-opacity=".7"/>`}return s}],
 collenchyma:[GN,'Collenchyma · स्थूलकोण ऊतक','Plant · simple permanent','Living, elongated cells thickened at the corners, with little space between them. Gives flexibility to leaf stalks and young stems so they bend without breaking.',
  (x,y,w,h)=>{let s='';for(let i=0;i<6;i++)for(let j=0;j<4;j++){const cx=x+30+i*(w-60)/5,cy=y+30+j*(h-60)/3;s+=`<rect x="${cx-34}" y="${cy-28}" width="68" height="56" rx="6" fill="${GN}" fill-opacity=".12" stroke="${GN}" stroke-width="2"/>`+[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>`<circle cx="${cx+a*32}" cy="${cy+b*26}" r="7" fill="${GN}" fill-opacity=".7"/>`).join('')}return s}],
 sclerenchyma:[OR,'Sclerenchyma · दृढ़ ऊतक','Plant · simple permanent','Dead cells, long and narrow, with very thick walls of lignin and almost no space inside. Makes plants hard and stiff — husk of coconut, fibres of jute.',
  (x,y,w,h)=>{let s='';for(let i=0;i<7;i++)for(let j=0;j<5;j++){const cx=x+30+i*(w-60)/6,cy=y+28+j*(h-56)/4;s+=`<polygon points="${[0,1,2,3,4,5].map(k=>{const a=k*Math.PI/3;return (cx+30*Math.cos(a)).toFixed(1)+','+(cy+26*Math.sin(a)).toFixed(1)}).join(' ')}" fill="${OR}" fill-opacity=".55" stroke="${OR}" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="5" fill="#fff"/>`}return s}],
 xylem:[BL,'Xylem · जाइलम','Plant · complex permanent','Tracheids and vessels are tube-like dead cells with thick, ringed or spiral walls. Xylem carries water and minerals upward from the roots. It also has xylem parenchyma and fibres.',
  (x,y,w,h)=>{let s='';for(let i=0;i<4;i++){const cx=x+70+i*(w-140)/3;s+=`<rect x="${cx-28}" y="${y+10}" width="56" height="${h-20}" rx="10" fill="${BL}" fill-opacity=".08" stroke="${BL}" stroke-width="2"/>`;for(let k=0;k<9;k++)s+=i%2?`<path d="M${cx-26} ${y+24+k*28} q26 14 52 0" fill="none" stroke="${BL}" stroke-width="2.5"/>`:`<ellipse cx="${cx}" cy="${y+24+k*28}" rx="26" ry="5" fill="none" stroke="${BL}" stroke-width="2.5"/>`}return s}],
 phloem:[PU,'Phloem · फ्लोएम','Plant · complex permanent','Sieve tubes with perforated end walls (sieve plates), companion cells, phloem fibres and parenchyma. Carries food from leaves to other parts in both directions. Mostly living cells (fibres are dead).',
  (x,y,w,h)=>{let s='';for(let i=0;i<3;i++){const cx=x+90+i*(w-180)/2;s+=`<rect x="${cx-34}" y="${y+10}" width="68" height="${h-20}" rx="6" fill="${PU}" fill-opacity=".08" stroke="${PU}" stroke-width="2"/>`;for(let k=1;k<4;k++){const yy=y+10+k*(h-20)/4;s+=`<line x1="${cx-34}" y1="${yy}" x2="${cx+34}" y2="${yy}" stroke="${PU}" stroke-width="3"/>`+[-20,-7,7,20].map(d=>`<circle cx="${cx+d}" cy="${yy}" r="3" fill="#fff"/>`).join('')}s+=`<rect x="${cx+38}" y="${y+30}" width="16" height="${h-60}" rx="6" fill="${PU}" fill-opacity=".25" stroke="${PU}"/><circle cx="${cx+46}" cy="${y+h/2}" r="4" fill="${PU}"/>`}return s}],
 epithelium:[MG,'Squamous epithelium · शल्की उपकला','Animal · epithelial','Flat, thin cells fitted edge to edge like tiles, with no spaces and a nucleus each. Lines the mouth, blood vessels and alveoli; skin has stratified (layered) squamous epithelium.',
  (x,y,w,h)=>{seed=11;let s='';for(let i=0;i<6;i++)for(let j=0;j<4;j++){const cx=x+40+i*(w-80)/5+(j%2)*20,cy=y+35+j*(h-70)/3;s+=`<polygon points="${[0,1,2,3,4,5].map(k=>{const a=k*Math.PI/3+.3;const r=44+R()*6;return (cx+r*Math.cos(a)).toFixed(1)+','+(cy+r*.8*Math.sin(a)).toFixed(1)}).join(' ')}" fill="${MG}" fill-opacity=".1" stroke="${MG}" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="7" fill="${MG}" fill-opacity=".8"/>`}return s}],
 blood:[RD,'Blood · रक्त','Animal · fluid connective','A fluid matrix, plasma, with red blood cells (disc-shaped, no nucleus, carry oxygen), white blood cells (with nuclei, fight germs) and platelets (help clotting).',
  (x,y,w,h)=>{seed=5;let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f7d98b" fill-opacity=".35"/>`;for(let k=0;k<26;k++){const cx=x+20+R()*(w-40),cy=y+20+R()*(h-40);s+=`<circle cx="${cx}" cy="${cy}" r="15" fill="${RD}" fill-opacity=".7"/><circle cx="${cx}" cy="${cy}" r="6" fill="${RD}" fill-opacity=".35"/>`}for(let k=0;k<3;k++){const cx=x+60+R()*(w-120),cy=y+40+R()*(h-80);s+=`<circle cx="${cx}" cy="${cy}" r="21" fill="#e8e0f5" stroke="${PU}" stroke-width="2"/><path d="M${cx-9} ${cy} q5 -10 10 0 q5 10 10 0" stroke="${PU}" stroke-width="5" fill="none"/>`}for(let k=0;k<8;k++)s+=`<circle cx="${x+20+R()*(w-40)}" cy="${y+20+R()*(h-40)}" r="3" fill="${PU}"/>`;return s}],
 striated:[OR,'Striated muscle · रेखित पेशी','Animal · muscular','Long cylindrical fibres with alternate light and dark bands (striations) and many nuclei. Voluntary muscle attached to bones; we control it.',
  (x,y,w,h)=>{let s='';for(let j=0;j<3;j++){const yy=y+20+j*(h-30)/3;s+=`<rect x="${x+10}" y="${yy}" width="${w-20}" height="${(h-30)/3-14}" rx="20" fill="${OR}" fill-opacity=".12" stroke="${OR}" stroke-width="2"/>`;for(let k=0;k<Math.floor((w-44)/18);k++)s+=`<rect x="${x+22+k*18}" y="${yy+4}" width="8" height="${(h-30)/3-22}" fill="${OR}" fill-opacity=".35"/>`;for(let k=0;k<3;k++)s+=`<ellipse cx="${x+80+k*150}" cy="${yy+((h-30)/3-14)/2}" rx="12" ry="6" fill="${PU}"/>`}return s}],
 neuron:[BL,'Nervous tissue · तंत्रिका ऊतक','Animal · nervous','Neurons: a cell body with a nucleus, short branched dendrites and a long axon. They carry messages as electrical impulses. Found in the brain, spinal cord and nerves.',
  (x,y,w,h)=>{let s='';const cx=x+120,cy=y+h/2;for(let k=0;k<7;k++){const a=1.6+k*.45;s+=`<path d="M${cx} ${cy} L${cx+Math.cos(a)*70} ${cy+Math.sin(a)*70} l${Math.cos(a+.4)*25} ${Math.sin(a+.4)*25}" stroke="${BL}" stroke-width="3" fill="none"/>`}s+=`<path d="M${cx+30} ${cy} L${x+w-60} ${cy}" stroke="${BL}" stroke-width="5"/>`;for(let k=0;k<5;k++)s+=`<rect x="${cx+60+k*58}" y="${cy-9}" width="44" height="18" rx="9" fill="${BL}" fill-opacity=".25" stroke="${BL}"/>`;s+=[-1,0,1].map(d=>`<path d="M${x+w-60} ${cy} l40 ${d*30}" stroke="${BL}" stroke-width="3"/>`).join('')+`<circle cx="${cx}" cy="${cy}" r="34" fill="${BL}" fill-opacity=".2" stroke="${BL}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="10" fill="${PU}"/>`;return s}]
};
const KEYS_T=Object.keys(TIS);
function micro(k,x=40,y=30,w=440,h=240){const t=TIS[k];return `<defs><clipPath id="mc${k}"><circle cx="${x+w/2}" cy="${y+h/2}" r="${h/2+20}"/></clipPath></defs><circle cx="${x+w/2}" cy="${y+h/2}" r="${h/2+20}" fill="#fffdf8" stroke="${ink}" stroke-width="4"/><g clip-path="url(#mc${k})">${t[4](x,y,w,h)}</g>`}
function heroDraw(){let s='';for(let i=0;i<5;i++)for(let j=0;j<3;j++)s+=`<rect x="${60+i*44}" y="${30+j*32}" width="40" height="28" rx="6" fill="none" stroke="#fff" stroke-width="2"/><circle cx="${80+i*44}" cy="${44+j*32}" r="4" fill="#fff"/>`;return s}
const HERO=heroDraw;
const MIND=[['What is a tissue',100,50],['Meristematic',420,50],['Simple permanent',90,150],['Xylem & phloem',430,150],['Epithelial & connective',110,250],['Muscle & nerve',410,250]];

const C=[
{id:'t1',num:'6.1',title:'What is a tissue? · ऊतक क्या है?',
 intro:'In a cricket team, each player has a role. In your body, which cells "bat" and which "bowl"?',
 obj:'Define tissue and compare plant and animal tissues.',
 prior:'Chapter 5: cells.',
 simple:'A tissue (ऊतक) is a group of cells that are similar in structure and work together to perform a particular function. In many-celled organisms, there is division of labour (श्रम विभाजन): muscle cells contract, nerve cells carry messages, blood carries oxygen.',
 detail:'Plants are stationary and need strong support, so many plant tissues are dead and supportive. Plant growth happens only in certain regions (meristems). Animals move around for food, shelter and mates, so they use more energy and most of their tissues are living. Animal growth is more uniform. Organisation: cells → tissues → organs → organ systems → organism.',
 real:'Doctors study tissue samples (biopsy) under a microscope to diagnose diseases.',
 apply:'Give two reasons why plant tissues differ from animal tissues.',
 see:{w:520,h:220,f:[
  ['Cells.',[0,1,2].map(i=>`<circle cx="${60+i*30}" cy="110" r="12" fill="${MG}" fill-opacity=".3" stroke="${MG}"/>`).join('')+lbl(90,150,'cells')],
  ['Tissue.',[...Array(9)].map((_,i)=>`<rect x="${200+(i%3)*28}" y="${80+Math.floor(i/3)*24}" width="26" height="22" rx="4" fill="${MG}" fill-opacity=".2" stroke="${MG}"/>`).join('')+lbl(242,170,'tissue')+`<path d="M135 110 h50 M300 110 h50" stroke="${GR}" stroke-width="2" marker-end="url(#ah)"/>`],
  ['Organ.',`<path d="M400 60 q50 -10 60 40 q5 60 -50 70 q-50 0 -50 -60 q0 -45 40 -50z" fill="${MG}" fill-opacity=".25" stroke="${MG}" stroke-width="2"/>`+lbl(415,190,'organ (heart)')]]},
 seeNote:'Cells → tissue → organ.',
 do:{title:'Team roles',mat:'Chart paper',steps:['List the jobs in a school.','Match each with a tissue doing a similar job.'],obs:'Division of labour.',why:'Specialisation.',lab:false},
 memo:'"Same cells, same job = tissue."',
 miscon:['"A tissue is a single cell." It is a group of similar cells.'],
 terms:['Tissue · ऊतक','Division of labour · श्रम विभाजन','Organ · अंग'],
 q:{q:'A group of similar cells doing a specific job is a(n):',o:['organ','tissue','organism','system'],a:1,why:'Definition.'},
 exam:'Define tissue; plant vs animal tissues: 2 marks.'},

{id:'t2',num:'6.2',title:'Meristematic tissue · विभज्योतक ऊतक',
 intro:'Why does a plant keep growing taller all its life while you will stop growing?',
 obj:'Describe meristematic tissues and their types.',
 prior:'6.1; cell division.',
 simple:'Meristematic tissue (विभज्योतक) is made of actively dividing cells. It is found only in growing regions. Its cells are very active, with dense cytoplasm, thin cellulose walls, prominent nuclei and no vacuoles.',
 detail:'Apical meristem (शीर्षस्थ) at the tips of stems and roots increases length. Lateral meristem (पार्श्व — cambium) increases the girth (thickness) of stems and roots. Intercalary meristem (अंतर्विष्ट) at the base of leaves or internodes (e.g. in grasses) helps regrowth. When meristem cells stop dividing and take up a specific role, they form permanent tissues — this process is differentiation (विभेदन).',
 real:'Grass grows back after mowing because of intercalary meristem at the base of its leaves.',
 apply:'Which meristem makes a tree trunk thicker every year?',
 see:{w:520,h:230,f:[
  ['A plant.',`<path d="M260 30 L260 200" stroke="${GN}" stroke-width="8"/><path d="M260 90 q-50 -10 -70 -30 M260 130 q50 -10 70 -30" stroke="${GN}" stroke-width="5" fill="none"/><path d="M260 200 l-30 25 M260 200 l0 28 M260 200 l30 25" stroke="${OR}" stroke-width="4"/>`],
  ['Apical at tips.',`<circle cx="260" cy="30" r="9" fill="${RD}"/><circle cx="260" cy="226" r="9" fill="${RD}"/>`+lbl(340,32,'apical meristem','fill="'+RD+'"')+lbl(340,222,'apical (root tip)','fill="'+RD+'"')],
  ['Lateral and intercalary.',`<rect x="252" y="140" width="16" height="40" fill="${BL}" fill-opacity=".5"/>`+lbl(150,165,'lateral (girth)','fill="'+BL+'"')+`<circle cx="260" cy="90" r="7" fill="${PU}"/>`+lbl(130,100,'intercalary','fill="'+PU+'"')]]},
 seeNote:'Three meristems, three places.',
 do:{title:'Root tip cut',mat:'Two onion bulbs in water jars',steps:['Grow roots; cut 1 cm tips off one bulb\'s roots.','Measure growth for a week.'],obs:'Cut roots stop growing longer.',why:'Apical meristem removed.',lab:false},
 memo:'"Apical = up and down; lateral = side; intercalary = in between."',
 miscon:['"Plants grow everywhere along the stem." Growth happens at meristems.'],
 terms:['Meristem · विभज्योतक','Apical · शीर्षस्थ','Lateral (cambium) · पार्श्व','Intercalary · अंतर्विष्ट','Differentiation · विभेदन'],
 q:{q:'Increase in girth is due to:',o:['apical meristem','lateral meristem','intercalary meristem','parenchyma'],a:1,why:'Cambium.'},
 exam:'Types and location of meristems: 2–3 marks.'},

{id:'t3',num:'6.3',title:'Simple permanent tissues · सरल स्थायी ऊतक',
 intro:'Why is a coconut husk so hard, while a leaf stalk bends easily?',
 obj:'Compare parenchyma, collenchyma and sclerenchyma, and describe protective tissues.',
 prior:'6.2.',
 simple:'Simple permanent tissues are made of one type of cell. Parenchyma (मृदूतक): thin-walled living cells with spaces between them; stores food. Collenchyma (स्थूलकोण): living cells thickened at the corners; gives flexibility. Sclerenchyma (दृढ़ ऊतक): dead cells with thick lignin walls; gives strength and hardness.',
 detail:'Parenchyma variants: chlorenchyma (with chloroplasts, makes food) and aerenchyma (large air cavities, gives buoyancy to aquatic plants). Protective tissue: the epidermis (बाह्यत्वचा) — a single layer of cells covering the plant, often with a waxy cuticle to reduce water loss; leaves have stomata (रंध्र) for gas exchange and transpiration, guarded by guard cells. In older stems, cork (कॉर्क) replaces the epidermis — dead cells with suberin, impervious to gases and water.',
 real:'Bottle corks come from the cork tissue of the cork oak tree.',
 apply:'Which tissue makes celery stalks and leaf stalks flexible?',
 see:{w:520,h:220,f:[
  ['Parenchyma.',`<g transform="scale(.33) translate(30,90)">${TIS.parenchyma[4](0,0,440,240)}</g>`+lbl(85,190,'parenchyma')],
  ['Collenchyma.',`<g transform="scale(.33) translate(560,90)">${TIS.collenchyma[4](0,0,440,240)}</g>`+lbl(260,190,'collenchyma')],
  ['Sclerenchyma.',`<g transform="scale(.33) translate(1090,90)">${TIS.sclerenchyma[4](0,0,440,240)}</g>`+lbl(435,190,'sclerenchyma')]]},
 seeNote:'Thin walls → corner thickening → thick walls.',
 do:{title:'Leaf peel',mat:'Rhoeo/Tradescantia leaf, slide, microscope',steps:['Peel the lower epidermis; mount.','Look for stomata.'],obs:'Bean-shaped guard cells around pores.',why:'Protective tissue.',lab:true},
 memo:'"Paren = packing, Collen = corners, Scleren = stiff."',
 miscon:['"All plant tissues are living." Sclerenchyma, cork, and xylem vessels are dead.'],
 terms:['Parenchyma · मृदूतक','Collenchyma · स्थूलकोण ऊतक','Sclerenchyma · दृढ़ ऊतक','Epidermis · बाह्यत्वचा','Stomata · रंध्र','Cork · कॉर्क','Lignin','Suberin'],
 q:{q:'The husk of a coconut is made of:',o:['parenchyma','collenchyma','sclerenchyma','meristem'],a:2,why:'Thick lignified walls.'},
 exam:'Compare simple tissues; stomata functions: 3 marks.'},

{id:'t4',num:'6.4',title:'Complex permanent tissues: xylem and phloem · जटिल स्थायी ऊतक',
 intro:'How does water get to the top of a 50-metre tree, and how does sugar reach the roots?',
 obj:'Describe xylem and phloem and their functions.',
 prior:'6.3.',
 simple:'Complex tissues are made of more than one type of cell, working together. Xylem (जाइलम) carries water and minerals upward from the roots. Phloem (फ्लोएम) carries food from the leaves to other parts of the plant. Together they form the vascular bundle (संवहन बंडल).',
 detail:'Xylem: tracheids and vessels (tube-like, dead, thick walls) carry water; xylem parenchyma stores food; xylem fibres support. Phloem: sieve tubes (with perforated sieve plates), companion cells, phloem fibres and phloem parenchyma. Except for phloem fibres, phloem cells are living. Xylem transport is one-way (upward); phloem transport is in both directions.',
 real:'Putting a white flower stem in coloured water colours the petals — xylem at work.',
 apply:'Name the four elements of xylem and of phloem.',
 see:{w:520,h:220,f:[
  ['Xylem tubes.',`<g transform="scale(.42) translate(40,60)">${TIS.xylem[4](0,0,440,360)}</g>`+lbl(110,210,'xylem: water ↑','fill="'+BL+'"')],
  ['Phloem sieve tubes.',`<g transform="scale(.42) translate(640,60)">${TIS.phloem[4](0,0,440,360)}</g>`+lbl(360,210,'phloem: food ↕','fill="'+PU+'"')],
  ['Vascular bundle.',lbl(260,20,'xylem + phloem = vascular bundle','font-weight="700"')]]},
 seeNote:'Water up, food both ways.',
 do:{title:'Coloured celery',mat:'Celery or white flower, ink water',steps:['Stand the stem in coloured water overnight.','Cut across the stem.'],obs:'Coloured dots: xylem.',why:'Water transport.',lab:true},
 memo:'"Xylem = water (X for H₂O lines), Phloem = food (F for food)."',
 miscon:['"Phloem carries water." Xylem carries water; phloem carries food.'],
 terms:['Xylem · जाइलम','Phloem · फ्लोएम','Tracheid · वाहिनिका','Vessel · वाहिका','Sieve tube · चालनी नलिका','Companion cell · सहचर कोशिका','Vascular bundle'],
 q:{q:'Food is carried by:',o:['xylem','phloem','cork','epidermis'],a:1,why:'Sieve tubes.'},
 exam:'Xylem vs phloem: 3 marks.'},

{id:'t5',num:'6.5',title:'Epithelial and connective tissues · उपकला और संयोजी ऊतक',
 intro:'Your skin protects you; your blood flows through you. Can both really be "tissues"?',
 obj:'Describe types of epithelial and connective tissues.',
 prior:'6.1.',
 simple:'Epithelial tissue (उपकला) covers and lines body parts. Its cells are tightly packed in a continuous sheet with little space between them, resting on a basement membrane. Connective tissue (संयोजी ऊतक) joins and supports other tissues; its cells are loosely spaced in a matrix (आधात्री) that can be liquid, jelly-like or hard.',
 detail:'Epithelium: squamous (flat — lines mouth, blood vessels, alveoli; skin has stratified squamous); cuboidal (cube-shaped — kidney tubules, salivary ducts); columnar (tall — inner lining of intestine; ciliated columnar in the windpipe moves mucus); glandular (secretes). Connective: blood (fluid matrix, plasma, with RBCs, WBCs, platelets); bone (hard matrix of calcium and phosphorus); cartilage (smooth, flexible — nose, ear, joints); ligament (bone to bone, elastic); tendon (muscle to bone, strong, less flexible); areolar (fills spaces, around organs); adipose (fat storage, insulation).',
 real:'A sprain is an injury to a ligament; a torn tendon makes it hard to move a limb.',
 apply:'Which connective tissue joins muscle to bone? Which joins bone to bone?',
 see:{w:520,h:220,f:[
  ['Squamous epithelium.',`<g transform="scale(.42) translate(40,80)">${TIS.epithelium[4](0,0,440,300)}</g>`+lbl(110,210,'epithelium: tight sheet','fill="'+MG+'"')],
  ['Blood: fluid connective tissue.',`<g transform="scale(.42) translate(640,80)">${TIS.blood[4](0,0,440,300)}</g>`+lbl(360,210,'blood: cells in plasma','fill="'+RD+'"')],
  ['Connections.',lbl(260,24,'ligament: bone–bone · tendon: muscle–bone','font-weight="700"')]]},
 seeNote:'Sheets that cover; matrix that connects.',
 do:{title:'Chicken bone & cartilage',mat:'Cleaned chicken leg bone (from kitchen)',steps:['Find the white smooth ends (cartilage).','Find tough cords (tendons, ligaments).'],obs:'Different connective tissues.',why:'Structure fits function.',lab:false},
 memo:'"Ligament links bones; tendon ties muscle."',
 miscon:['"Blood is not a tissue." It is a fluid connective tissue.'],
 terms:['Epithelial · उपकला','Squamous · शल्की','Cuboidal · घनाकार','Columnar · स्तंभाकार','Connective · संयोजी','Matrix · आधात्री','Ligament · स्नायु','Tendon · कंडरा','Cartilage · उपास्थि','Adipose · वसा ऊतक'],
 q:{q:'A tendon connects:',o:['bone to bone','muscle to bone','muscle to muscle','skin to bone'],a:1,why:'Definition.'},
 exam:'Types of epithelium and connective tissue: 3–5 marks.'},

{id:'t6',num:'6.6',title:'Muscular and nervous tissues · पेशी और तंत्रिका ऊतक',
 intro:'You choose to lift your arm, but you cannot choose to stop your heart. Why?',
 obj:'Compare the three types of muscle and describe the neuron.',
 prior:'6.5.',
 simple:'Muscular tissue (पेशी ऊतक) is made of long cells called muscle fibres that contract and relax to cause movement. Striated (voluntary) muscles move bones under our control. Smooth (involuntary) muscles in the stomach, intestine and blood vessels work without our control. Cardiac muscle in the heart contracts rhythmically all our life. Nervous tissue (तंत्रिका ऊतक) is made of neurons that carry messages as impulses.',
 detail:'Striated: cylindrical, unbranched, multinucleate, light and dark bands. Smooth: spindle-shaped, single nucleus, no bands. Cardiac: cylindrical, branched, single nucleus, striated, involuntary. Neuron (तंत्रिका कोशिका): cell body with nucleus, short dendrites (द्रुमिका) receive signals, a long axon (तंत्रिकाक्ष) carries signals away; a neuron can be up to a metre long. Nerve and muscle tissues together make animals move quickly in response to stimuli.',
 real:'Doctors check reflexes by tapping the knee: neurons and muscles respond in a split second.',
 apply:'Tabulate three differences between striated, smooth and cardiac muscle.',
 see:{w:520,h:220,f:[
  ['Striated muscle.',`<g transform="scale(.42) translate(40,80)">${TIS.striated[4](0,0,440,300)}</g>`+lbl(110,210,'striated: bands, many nuclei','fill="'+OR+'"')],
  ['Neuron.',`<g transform="scale(.42) translate(640,80)">${TIS.neuron[4](0,0,440,300)}</g>`+lbl(360,210,'neuron: dendrites → axon','fill="'+BL+'"')],
  ['Three muscles.',lbl(260,24,'striated (voluntary) · smooth (involuntary) · cardiac (heart)','font-weight="700"')]]},
 seeNote:'Movement and messages.',
 do:{title:'Muscle feel',mat:'Your own arm',steps:['Bend and straighten your arm; feel the biceps.','Feel your pulse: cardiac muscle at work.'],obs:'Voluntary vs involuntary.',why:'Muscle types.',lab:false},
 memo:'"Striated = stripes + choice; smooth = gut; cardiac = never stops."',
 miscon:['"The heart is made of voluntary muscle." Cardiac muscle is involuntary.'],
 terms:['Striated · रेखित','Smooth · अरेखित','Cardiac · हृदय पेशी','Neuron · तंत्रिका कोशिका','Dendrite · द्रुमिका','Axon · तंत्रिकाक्ष','Impulse · आवेग'],
 q:{q:'Which muscle is branched and involuntary?',o:['striated','smooth','cardiac','skeletal'],a:2,why:'Heart muscle.'},
 exam:'Muscle types table; labelled neuron: 3–5 marks.'}
];

const CARDS=[['Tissue · ऊतक','Similar cells doing one job.'],['Meristem','Dividing cells: apical, lateral, intercalary.'],['Parenchyma','Thin walls, spaces; storage.'],['Collenchyma','Corner thickening; flexibility.'],['Sclerenchyma','Dead, lignin walls; strength.'],['Epidermis','Protective layer; stomata.'],['Cork','Dead, suberin; impervious.'],['Xylem','Water up: tracheids, vessels, parenchyma, fibres.'],['Phloem','Food both ways: sieve tubes, companion cells.'],['Epithelium','Tight sheets: squamous, cuboidal, columnar.'],['Connective','Cells in matrix: blood, bone, cartilage.'],['Ligament vs tendon','Bone–bone vs muscle–bone.'],['Muscles','Striated, smooth, cardiac.'],['Neuron','Dendrites, cell body, axon.']];

const Q=[
 {lv:1,q:'Which meristem is at root and shoot tips?',o:['lateral','apical','intercalary','cambium'],a:1,w:'Tips.'},
 {lv:1,q:'Blood is a type of:',o:['epithelial tissue','connective tissue','muscular tissue','nervous tissue'],a:1,w:'Fluid matrix.'},
 {lv:1,q:'Xylem carries:',o:['food','water and minerals','hormones only','air'],a:1,w:'Upward transport.'},
 {lv:2,q:'Aerenchyma helps aquatic plants to:',o:['make food','float','grow tall','store water'],a:1,w:'Air cavities.'},
 {lv:2,q:'Cells of sclerenchyma are:',o:['living, thin-walled','dead, thick-walled','living, corner-thickened','dividing'],a:1,w:'Lignin.'},
 {lv:2,q:'Which epithelium lines the intestine?',o:['squamous','cuboidal','columnar','stratified'],a:2,w:'Absorption.'},
 {lv:3,q:'Which phloem element is dead?',o:['sieve tube','companion cell','phloem fibre','phloem parenchyma'],a:2,w:'Only fibres.'},
 {lv:3,q:'Grass regrows after grazing due to:',o:['apical meristem','lateral meristem','intercalary meristem','cork'],a:2,w:'At leaf bases.'},
 {lv:4,q:'A ligament is injured in a sprain. It connects:',o:['muscle to bone','bone to bone','skin to muscle','nerve to muscle'],a:1,w:'Bone–bone.'},
 {lv:4,q:'Which part of a neuron carries impulses away from the cell body?',o:['dendrite','axon','nucleus','synapse'],a:1,w:'Axon.'},
 {lv:5,open:true,m:3,q:'Differentiate between parenchyma, collenchyma and sclerenchyma based on cell wall, living/dead and function.',ans:['Parenchyma: thin wall, living, storage (1)','Collenchyma: corner-thickened, living, flexibility (1)','Sclerenchyma: lignified thick wall, dead, strength (1)']},
 {lv:5,open:true,m:5,q:'Draw a labelled neuron. Write two differences between striated and smooth muscle, and state where cardiac muscle is found.',ans:['Neuron with dendrites, cell body, nucleus, axon (2)','Striated: voluntary vs smooth involuntary (1)','Striated: bands, multinucleate vs smooth: no bands, uninucleate (1)','Cardiac: heart (1)']}
];

const ONEMIN=['Tissue = similar cells, one job.','Meristems: apical, lateral, intercalary.','Parenchyma, collenchyma, sclerenchyma; epidermis, cork.','Xylem and phloem.','Epithelial and connective tissues.','Muscles and neurons.'];
const KEYS=[['tissue',/tissue|ऊतक/i],['meristem',/meristem|विभज्योतक/i],['simple',/parenchyma|collenchyma|sclerenchyma/i],['complex',/xylem|phloem/i],['epithelial/connective',/epitheli|connective|blood|bone/i],['muscle/nerve',/muscle|neuron|nerv/i]];

/* ---------- lab ---------- */
let cur='parenchyma',quiz=null,score=[0,0],wired=false;
function show(svgOnly){const t=TIS[cur];$('#tmSvg').innerHTML=micro(cur)+T(260,312,quiz?'Mystery slide — what tissue is this?':t[1],'font-size="14" font-weight="700"');
 if(!quiz&&!svgOnly)$('#tmOut').innerHTML=`<p><b>${t[1]}</b> · ${t[2]}</p><p>${t[3]}</p>`}
function labShow(){const S=$('#tmS');if(S&&!S.options.length)S.innerHTML=KEYS_T.map(k=>`<option value="${k}">${TIS[k][1]}</option>`).join('');S.value=cur;show()}
function labInit(){if(wired)return;wired=true;document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tk]');if(!b||!quiz)return;const ok=b.dataset.tk===quiz;score[1]++;if(ok)score[0]++;const t=TIS[quiz];
 $('#tmOut').innerHTML=`<p class="fb ${ok?'ok':'no'}">${ok?'Correct!':'Not quite.'} It is <b>${t[1]}</b>.</p><p>${t[3]}</p><p>Score: ${score[0]} / ${score[1]}</p>`;$('#tmOpts').style.display='none';quiz=null;$('#tmS').value=cur;show(true)})}
function labClick(b){if(b.id==='tmQ'){let k;do{k=KEYS_T[Math.floor(Math.random()*KEYS_T.length)]}while(k===cur&&KEYS_T.length>1);cur=k;quiz=k;
 const opts=[k];while(opts.length<4){const o=KEYS_T[Math.floor(Math.random()*KEYS_T.length)];if(!opts.includes(o))opts.push(o)}opts.sort(()=>Math.random()-.5);
 $('#tmOpts').innerHTML=opts.map(o=>`<button class="btn" type="button" data-tk="${o}">${TIS[o][1].split(' · ')[0]}</button>`).join(' ');$('#tmOpts').style.display='';$('#tmOut').innerHTML='<p>Look for the clues, then choose.</p>';show();return true}return false}
function labChange(t){if(t.id==='tmS'){cur=t.value;quiz=null;$('#tmOpts').style.display='none';show();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
