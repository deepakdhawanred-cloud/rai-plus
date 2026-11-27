/* Rai Plus content pack: Class 8 Science (Curiosity), Chapter 2 – The Invisible Living World: Beyond Our Naked Eye. */
RP.register({key:'8sci02',cls:'8',subject:'Science',ch:'2',title:"The Invisible Living World: Beyond Our Naked Eye",color:'#3b6d11',
crumb:"Class 8 Science · Curiosity",h1:"Chapter 2: The Invisible Living World — Beyond Our Naked Eye",sub:"Seeing with a microscope, cells, the main groups of microorganisms, where they live, how they help us, how some harm us, and keeping food safe.",heroLabel:"Microbes under a microscope",labName:'Yeast and curd lab',
theme:"\n:root{--g:light-dark(#3b6d11,#a8d77d);--g2:light-dark(#eef6e4,#0f1a07);--line:light-dark(#d4e7bf,#2c4219);--bg:light-dark(#ffffff,#0b1206);--card:light-dark(#ffffff,#111a0a);\n--ink:light-dark(#162508,#e6f1da);--mute:light-dark(#4f6439,#b5c9a0);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#2b520b}\n",
labHTML:`  <h2>Yeast and curd lab</h2>
  <p>Yeast mode: a bottle of warm water with yeast has a balloon on top. Change sugar and temperature and watch the balloon fill with carbon dioxide. Curd mode: change milk temperature and starter to see if curd sets overnight.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="ySvg" viewBox="0 0 460 320" role="img" aria-label="Yeast balloon experiment" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="yM"><option value="y">Yeast balloon</option><option value="c">Setting curd</option></select></label></div>
  <div class="ctrl"><label>Sugar (spoons): <b id="ySv"></b><input type="range" class="yS" id="yS" min="0" max="4" value="2"></label></div>
  <div class="ctrl"><label>Temperature (°C): <b id="yTv"></b><input type="range" class="yS" id="yT" min="5" max="70" step="5" value="35"></label></div>
  <div class="ctrl" id="yStart" style="display:none"><label><input type="checkbox" id="yC" checked> add a spoon of curd (starter)</label></div>
  <div class="ctrl"><button class="btn" id="yRun">Wait (run time)</button></div>
  <div class="box y" id="yOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3b6d11',LABNAME='Yeast and curd lab',MIND_CENTER='Microorganisms';
const GN='#3b6d11',OR='#b04a1f',BL='#1f5f8b',PU='#6a4fb3',GR='#888780',BR='#8a6b3d',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
const rod=(x,y,a=0,c=PU)=>`<rect x="${x-12}" y="${y-4}" width="24" height="8" rx="4" fill="${c}" opacity=".75" transform="rotate(${a} ${x} ${y})"/>`;
const coccus=(x,y,c=PU)=>`<circle cx="${x}" cy="${y}" r="5" fill="${c}" opacity=".75"/>`;
const yeast=(x,y)=>`<ellipse cx="${x}" cy="${y}" rx="9" ry="7" fill="#d9b25c" stroke="${BR}"/><ellipse cx="${x+10}" cy="${y-5}" rx="4" ry="3.5" fill="#d9b25c" stroke="${BR}"/>`;
const amoeba=(x,y)=>`<path d="M${x-20} ${y} q5 -18 18 -14 q12 -12 20 2 q14 4 6 16 q4 14 -14 12 q-10 10 -22 0 q-14 -4 -8 -16z" fill="#9ec5e8" stroke="${BL}" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="5" fill="${BL}"/>`;
const alga=(x,y)=>[0,1,2,3,4].map(k=>`<rect x="${x+k*14}" y="${y}" width="13" height="10" rx="3" fill="${GN}" opacity=".7"/>`).join('');
const mould=(x,y)=>`<path d="M${x} ${y} v-30 M${x+10} ${y} v-40 M${x-10} ${y} v-24" stroke="${GR}" stroke-width="1.5"/><circle cx="${x}" cy="${y-33}" r="5" fill="#333"/><circle cx="${x+10}" cy="${y-43}" r="5" fill="#333"/><circle cx="${x-10}" cy="${y-27}" r="5" fill="#333"/>`;
const virus=(x,y)=>`<circle cx="${x}" cy="${y}" r="9" fill="${OR}" opacity=".8"/>`+[0,1,2,3,4,5,6,7].map(k=>{const a=k*Math.PI/4;return `<line x1="${x+9*Math.cos(a)}" y1="${y+9*Math.sin(a)}" x2="${x+14*Math.cos(a)}" y2="${y+14*Math.sin(a)}" stroke="${OR}" stroke-width="2"/>`}).join('');
function heroDraw(){return `<circle cx="190" cy="80" r="62" fill="none" stroke="#fff" stroke-width="3"/>`+[[160,60],[200,95],[215,55],[175,105]].map(([x,y],k)=>`<rect x="${x}" y="${y}" width="20" height="7" rx="3.5" fill="#fff" transform="rotate(${k*40} ${x+10} ${y+3})"/>`).join('')}
const HERO=heroDraw;
const MIND=[['Microscope & cells',100,50],['Groups of microbes',420,50],['Where they live',90,150],['Useful microbes',430,150],['Harmful microbes',110,250],['Food preservation',410,250]];

const C=[
{id:'v1',num:'2.1',title:'Seeing the invisible: microscopes and cells',
 intro:'A drop of pond water looks clear. Under a microscope it is crowded with moving creatures. What are they made of?',
 obj:'Describe how a microscope reveals tiny organisms and identify the cell as the basic unit of life.',
 prior:'Class 6–7: living things; magnifying glass.',
 simple:'Many living things are too small to see with the naked eye. A microscope uses lenses to magnify them. In the 1600s, Antonie van Leeuwenhoek saw tiny "animalcules" with his simple microscope, and Robert Hooke saw tiny boxes in cork, which he called cells. All living things are made of cells — the basic unit of life. Microorganisms (microbes) are mostly made of just one cell.',
 detail:'A cell has a cell membrane (outer boundary), cytoplasm (jelly-like filling) and usually a nucleus (control centre). Plant cells also have a cell wall and chloroplasts. Bacteria have no proper nucleus. Viruses are not cells at all: they can reproduce only inside the cells of other living things.',
 real:'Doctors use microscopes to examine blood samples and find germs that cause diseases such as malaria.',
 apply:'Name the three basic parts of most cells.',
 see:{w:520,h:240,f:[
  ['A microscope magnifies.',`<rect x="60" y="190" width="100" height="14" fill="${GR}"/><rect x="100" y="60" width="18" height="110" fill="${GR}" transform="rotate(-15 109 115)"/><rect x="60" y="150" width="90" height="8" fill="${ink}"/>`+lbl(110,225,'microscope')],
  ['A cell: membrane, cytoplasm, nucleus.',`<ellipse cx="340" cy="120" rx="110" ry="75" fill="${GN}" fill-opacity=".12" stroke="${GN}" stroke-width="2.5"/><circle cx="360" cy="115" r="22" fill="${PU}" opacity=".5"/>`],
  ['Labels.',lbl(470,60,'membrane','text-anchor="end" fill="'+GN+'"')+lbl(360,120,'nucleus','font-size="11"')+lbl(290,160,'cytoplasm','fill="'+GN+'"')]]},
 seeNote:'Cells are the units of life.',
 do:{title:'Onion peel',mat:'Onion, iodine solution, slide, microscope (school lab)',steps:['Peel a thin layer from inside an onion scale.','Stain with a drop of iodine; cover and observe.'],obs:'Brick-like cells with dark nuclei.',why:'Plant cells with walls.',lab:false},
 memo:'"Membrane wraps, cytoplasm fills, nucleus controls."',
 miscon:['"Microbes are tiny insects." They are mostly single cells.','"Viruses are bacteria." Viruses are not cells.'],
 terms:['Microscope · सूक्ष्मदर्शी','Cell · कोशिका','Nucleus · केंद्रक','Cytoplasm · कोशिकाद्रव्य','Cell membrane · कोशिका झिल्ली'],
 q:{q:'The basic unit of life is the:',o:['atom','cell','organ','tissue'],a:1,why:'All living things are made of cells.'},
 exam:'Parts of a cell; history of microscope: 2–3 marks.'},

{id:'v2',num:'2.2',title:'Groups of microorganisms',
 intro:'Curd, bread mould, pond scum and the common cold all involve microbes — but very different ones.',
 obj:'Name and describe the main groups of microorganisms.',
 prior:'2.1.',
 simple:'Main groups: Bacteria — single cells, shaped like rods, spheres or spirals (e.g. Lactobacillus in curd). Fungi — yeast (single-celled) and moulds (threads, e.g. bread mould). Protozoa — single-celled, often move, e.g. Amoeba, Paramecium. Algae — make their own food by photosynthesis, e.g. Chlamydomonas, Spirogyra. Viruses — much smaller, not cells, reproduce only inside living host cells.',
 detail:'Microbes can be single cells, chains or colonies. Bacteria are the smallest cells; viruses are smaller still and need an electron microscope. Some fungi like mushrooms are large and visible, but their relatives — yeast and moulds — are microscopic.',
 real:'Pond water often turns green in summer because algae multiply rapidly.',
 apply:'Classify: Amoeba, yeast, Lactobacillus, Spirogyra, the virus causing flu.',
 see:{w:520,h:240,f:[
  ['Bacteria and fungi.',rod(60,60,20)+rod(90,80,-30)+coccus(70,95)+coccus(82,100)+lbl(75,135,'bacteria','fill="'+PU+'"')+yeast(170,80)+mould(215,110)+lbl(195,135,'fungi','fill="'+BR+'"')],
  ['Protozoa and algae.',amoeba(310,80)+lbl(310,135,'protozoa','fill="'+BL+'"')+alga(380,75)+lbl(415,135,'algae','fill="'+GN+'"')],
  ['Viruses: not cells.',virus(260,195)+lbl(260,230,'virus — needs a host cell','fill="'+OR+'"')]]},
 seeNote:'Five groups.',
 do:{title:'Pond drop',mat:'Pond water, slide, microscope',steps:['Place a drop on a slide.','Draw what you see.'],obs:'Algae, protozoa.',why:'Microbes everywhere.',lab:false},
 memo:'"Bad Fungi Probably Aren\'t Viruses" — Bacteria, Fungi, Protozoa, Algae, Viruses.',
 miscon:['"All microbes are germs." Most are harmless or useful.'],
 terms:['Bacteria · जीवाणु','Fungi · कवक','Protozoa · प्रोटोज़ोआ','Algae · शैवाल','Virus · विषाणु'],
 q:{q:'Which group makes its own food by photosynthesis?',o:['protozoa','algae','viruses','moulds'],a:1,why:'Have chlorophyll.'},
 exam:'Groups of microorganisms with examples: 3 marks.'},

{id:'v3',num:'2.3',title:'Where microbes live',
 intro:'Are there microbes on your hands right now? In hot springs? Inside your stomach?',
 obj:'Describe the habitats of microorganisms.',
 prior:'2.2.',
 simple:'Microbes live almost everywhere: in soil, water and air; on and inside our bodies (the gut has trillions of helpful bacteria); in extreme places like hot springs, icy regions, salty lakes and deep oceans. They can live alone or together in colonies.',
 detail:'Some bacteria survive harsh conditions by forming tough spores. In our gut, helpful bacteria digest food and make vitamins. In root nodules of pulse plants (like moong, chana) live Rhizobium bacteria. Microbes multiply very fast when conditions — moisture, warmth and food — are right.',
 real:'Washing hands with soap removes microbes picked up from surfaces.',
 apply:'List four places where microbes can be found.',
 see:{w:520,h:220,f:[
  ['Soil, water, air.',box(20,40,140,50,'Soil · water · air',GN)],
  ['Inside our bodies.',box(190,40,140,50,'Our body (gut)',BL)],
  ['Extreme places.',box(360,40,140,50,'Hot springs · ice',OR)+lbl(260,160,'Almost everywhere!','font-size="18" font-weight="700"')]]},
 seeNote:'Everywhere.',
 do:{title:'Bread test',mat:'Two bread slices, plastic bags',steps:['Keep one slice dry, one moist, both in the dark for 4 days.'],obs:'Moist one grows mould.',why:'Moisture helps microbes grow.',lab:false},
 memo:'"Warm, wet, with food — microbes multiply."',
 miscon:['"Microbes live only in dirty places." They are found everywhere, even inside healthy bodies.'],
 terms:['Habitat · आवास','Colony · समूह/कॉलोनी','Spore · बीजाणु','Root nodule · मूल ग्रंथिका'],
 q:{q:'Rhizobium bacteria live in:',o:['our lungs','root nodules of pulse plants','hot springs only','bread'],a:1,why:'Nitrogen fixers.'},
 exam:'Habitats of microbes: 2 marks.'},

{id:'v4',num:'2.4',title:'Friendly microbes',
 intro:'Without microbes there would be no curd, idli, bread — and the planet would be buried in dead leaves.',
 obj:'Explain the useful roles of microorganisms in food, medicine, agriculture and the environment.',
 prior:'2.2, 2.3.',
 simple:'Food: Lactobacillus turns milk into curd; yeast makes dough rise (carbon dioxide) and is used in idli, dosa batter and bread. Medicine: antibiotics like penicillin (discovered by Alexander Fleming from a mould) kill bacteria; vaccines use weakened or dead microbes to train the body. Agriculture: Rhizobium fixes nitrogen from air into the soil. Environment: decomposers break down dead plants and animals into manure (compost) and clean up waste.',
 detail:'Fermentation: yeast converts sugar into alcohol and carbon dioxide; this is why dough rises and why yeast is used in industry. Biogas plants use microbes to turn cow dung into fuel gas. Composting turns kitchen waste into rich manure.',
 real:'Haryana villages use cattle-dung biogas plants for cooking fuel.',
 apply:'Give one use of microbes each in food, medicine and farming.',
 see:{w:520,h:240,f:[
  ['Food: curd, bread.',box(20,30,150,55,'Food',OR,'curd · bread · idli')],
  ['Medicine: antibiotics, vaccines.',box(185,30,150,55,'Medicine',BL,'antibiotics · vaccines')],
  ['Farms and environment.',box(350,30,150,55,'Farms',GN,'nitrogen fixation')+box(185,130,150,55,'Environment',BR,'decomposition · biogas')]]},
 seeNote:'Microbes work for us.',
 do:{title:'Yeast balloon',mat:'Bottle, warm water, sugar, yeast, balloon',steps:['Mix and fit a balloon over the bottle mouth.','Wait 30 minutes.'],obs:'Balloon inflates.',why:'CO₂ from fermentation.',lab:true},
 memo:'"Curd, cake, cure, compost."',
 miscon:['"Antibiotics kill viruses." They work against bacteria, not viruses.'],
 terms:['Fermentation · किण्वन','Antibiotic · प्रतिजैविक','Vaccine · टीका','Decomposer · अपघटक','Nitrogen fixation · नाइट्रोजन स्थिरीकरण'],
 q:{q:'Dough rises because yeast produces:',o:['oxygen','carbon dioxide','nitrogen','water'],a:1,why:'Fermentation gas.'},
 exam:'Uses of microorganisms: 3–5 marks.'},

{id:'v5',num:'2.5',title:'Harmful microbes and diseases',
 intro:'Why does a cold spread through a class, while a cut on your knee does not infect your friends?',
 obj:'Describe diseases caused by microbes, how they spread, and how to prevent them.',
 prior:'2.4.',
 simple:'Disease-causing microbes are called pathogens. Communicable diseases spread from person to person: through air (cold, flu, tuberculosis), water and food (cholera, typhoid), insects (malaria, dengue — mosquitoes are carriers), or contact. Prevention: hand washing, clean drinking water, covering coughs, mosquito control, and vaccination.',
 detail:'Microbes also cause plant diseases (rust of wheat, citrus canker) and animal diseases (foot-and-mouth disease). Food spoilage microbes make food smell bad and can cause food poisoning. Vaccination campaigns have wiped out smallpox and greatly reduced polio in India.',
 real:'India was declared polio-free in 2014 after massive vaccination drives.',
 apply:'Name a disease that spreads through water and one way to prevent it.',
 see:{w:520,h:240,f:[
  ['Air: cold, flu, TB.',box(20,40,150,55,'Air',BL,'cold · flu · TB')],
  ['Water/food: cholera, typhoid.',box(185,40,150,55,'Water / food',GN,'cholera · typhoid')],
  ['Insects: malaria, dengue.',box(350,40,150,55,'Mosquitoes',OR,'malaria · dengue')+lbl(260,160,'Prevent: wash hands · clean water · nets · vaccines','font-size="14" font-weight="700"')]]},
 seeNote:'Know the route, block the route.',
 do:{title:'Glitter germs',mat:'Glitter, soap, water',steps:['Put glitter on one hand; shake hands around the class.','Wash with water only, then with soap.'],obs:'Glitter spreads; soap removes more.',why:'Contact spread; hand washing.',lab:false},
 memo:'"Air, water, insects, touch — block all four."',
 miscon:['"Medicines are the best defence." Prevention (hygiene, vaccines) is better.'],
 terms:['Pathogen · रोगाणु','Communicable disease · संक्रामक रोग','Carrier · वाहक','Vaccination · टीकाकरण'],
 q:{q:'Malaria is spread by:',o:['contaminated water','mosquitoes','air','handshakes'],a:1,why:'Female Anopheles mosquito carries it.'},
 exam:'Diseases and prevention: 3 marks.'},

{id:'v6',num:'2.6',title:'Keeping food safe: preservation',
 intro:'Why do pickles last for months, but cooked dal spoils in a day in summer?',
 obj:'Explain methods of food preservation and why they work.',
 prior:'2.3, 2.5.',
 simple:'Microbes need moisture, warmth and food to grow. Preservation methods remove one of these or kill microbes: refrigeration (cold slows growth), boiling and pasteurisation (heat kills), drying (removes water — papad, dry fruits), salting and sugaring (pickles, jams — draw out water), oil and vinegar (pickles), airtight packing and canning.',
 detail:'Pasteurisation: milk heated to about 70 °C for a short time and then quickly cooled, killing most harmful microbes; named after Louis Pasteur. Chemical preservatives like sodium benzoate are used in sauces and squashes. Refrigeration only slows microbes — it does not kill them.',
 real:'Achaar (pickle) in Haryana homes uses salt, oil and sun-drying to stay good for months.',
 apply:'Why does salt help preserve pickles?',
 see:{w:520,h:220,f:[
  ['Microbes need warmth, moisture, food.',lbl(260,30,'microbes need: warmth · moisture · food','font-size="15" font-weight="700"')],
  ['Remove one condition…',[['Cold',BL,'fridge'],['Dry',BR,'papad'],['Salt/sugar',OR,'pickle, jam']].map(([t,c,s],k)=>box(30+k*160,70,140,55,t,c,s)).join('')],
  ['…or kill them with heat.',box(190,145,140,55,'Heat',PU,'boil · pasteurise')]]},
 seeNote:'Take away what microbes need.',
 do:{title:'Spoilage test',mat:'Cooked rice in 3 bowls',steps:['Keep one in the fridge, one salted, one plain at room temperature.','Observe for 3 days.'],obs:'Plain spoils first.',why:'Preservation slows microbes.',lab:false},
 memo:'"Cold, dry, salty, sweet or heat."',
 miscon:['"The fridge kills microbes." It only slows them down.'],
 terms:['Preservation · परिरक्षण','Pasteurisation · पाश्चरीकरण','Preservative · परिरक्षक','Spoilage · खराब होना'],
 q:{q:'Pasteurised milk has been:',o:['frozen','heated and quickly cooled','salted','dried'],a:1,why:'Kills most microbes.'},
 exam:'Preservation methods with reasons: 3 marks.'}
];

const CARDS=[['Cell','Basic unit of life: membrane, cytoplasm, nucleus.'],['Microscope','Leeuwenhoek and Hooke, 1600s.'],['Five groups','Bacteria, fungi, protozoa, algae, viruses.'],['Viruses','Not cells; reproduce inside host cells.'],['Habitats','Everywhere — even hot springs and our gut.'],['Fermentation','Yeast: sugar → alcohol + CO₂.'],['Curd','Lactobacillus.'],['Antibiotics','Penicillin (Fleming); kill bacteria, not viruses.'],['Pathogens','Spread by air, water, insects, contact.'],['Preservation','Cold, dry, salt, sugar, heat, airtight.']];

const Q=[
 {lv:1,q:'Curd is made by:',o:['yeast','Lactobacillus','virus','Amoeba'],a:1,w:'Bacteria.'},
 {lv:1,q:'Which is NOT made of cells?',o:['bacteria','virus','yeast','Amoeba'],a:1,w:'Virus.'},
 {lv:1,q:'Penicillin was discovered by:',o:['Pasteur','Fleming','Hooke','Leeuwenhoek'],a:1,w:'1928.'},
 {lv:2,q:'Dengue spreads through:',o:['water','mosquitoes','air','food'],a:1,w:'Aedes mosquito.'},
 {lv:2,q:'Rhizobium helps plants by:',o:['causing disease','fixing nitrogen','making alcohol','eating pests'],a:1,w:'Root nodules.'},
 {lv:2,q:'Antibiotics do not work against:',o:['bacteria','viruses','both','neither'],a:1,w:'Viruses.'},
 {lv:3,q:'Salt preserves pickles mainly by:',o:['adding taste','drawing out water microbes need','heating','adding air'],a:1,w:'Removes moisture.'},
 {lv:3,q:'Yeast at 5 °C produces CO₂:',o:['very fast','very slowly','not at all ever','same as 35 °C'],a:1,w:'Cold slows.'},
 {lv:4,q:'A vaccine contains:',o:['antibiotics','weakened or dead microbes (or parts)','vitamins','salt'],a:1,w:'Trains immunity.'},
 {lv:4,q:'Which group includes both yeast and bread mould?',o:['bacteria','fungi','algae','protozoa'],a:1,w:'Fungi.'},
 {lv:5,open:true,m:3,q:'Explain why dough rises when yeast is added, and how temperature affects it.',ans:['Yeast ferments sugar into alcohol and carbon dioxide (1)','CO₂ bubbles get trapped and make dough rise (1)','Warm (~35 °C) speeds it; cold slows; very hot kills yeast (1)']},
 {lv:5,open:true,m:5,q:'Describe five useful roles of microorganisms.',ans:['Curd/idli/bread fermentation (1)','Antibiotics (1)','Vaccines (1)','Nitrogen fixation (1)','Decomposition/compost/biogas (1)']}
];

const ONEMIN=['Microscope; cell is the unit of life.','Five groups of microbes.','Microbes live everywhere.','Useful: food, medicine, farms, environment.','Harmful: pathogens and spread; prevention.','Food preservation methods.'];
const KEYS=[['cell',/cell/i],['groups',/bacteri|fung|protozo|alga|virus/i],['useful',/curd|yeast|antibiotic|vaccine|nitrogen|decompos/i],['harmful',/pathogen|disease|malaria|cholera/i],['prevention',/prevent|hygiene|wash|vaccin/i],['preservation',/preserv|pasteur|salt|refriger/i]];

/* ---------- lab ---------- */
let mode='y',sugar=2,temp=35,ran=false,wired=false;
function rate(){if(temp>=60)return 0;let t=temp<10?.05:temp<=40?(temp-5)/35:Math.max(0,(60-temp)/20);return t*Math.min(1,sugar/2.5)}
function curdOK(){const st=$('#yC')?$('#yC').checked:true;if(!st)return 'no';if(temp<20)return 'slow';if(temp>50)return 'dead';return 'yes'}
function draw(p=ran?1:0){let s='';$('#ySv').textContent=sugar;$('#yTv').textContent=temp;$('#yS').closest('.ctrl').style.display=mode==='y'?'':'none';$('#yStart').style.display=mode==='c'?'':'none';
 if(mode==='y'){const r=rate()*p;const R=10+60*r;s+=`<rect x="170" y="140" width="120" height="150" rx="16" fill="${BL}" fill-opacity=".1" stroke="${ink}" stroke-width="2"/><rect x="172" y="200" width="116" height="88" rx="14" fill="#f3e3b0" opacity=".8"/><rect x="210" y="115" width="40" height="28" fill="none" stroke="${ink}" stroke-width="2"/>`;
  s+=`<ellipse cx="230" cy="${112-R}" rx="${18+R*.6}" ry="${R}" fill="${OR}" opacity=".75"/><path d="M215 116 L245 116 L238 ${112-R*0.2} L222 ${112-R*0.2} Z" fill="${OR}" opacity=".75"/>`;
  for(let k=0;k<Math.round(12*rate()*p+2);k++)s+=`<circle cx="${185+(k*37)%90}" cy="${280-(k*53)%70}" r="${2+k%3}" fill="#fff" stroke="${GR}"/>`;
  for(let k=0;k<6;k++)s+=yeast(185+k*16,270-(k%2)*12);s+=T(230,310,`${sugar} spoon${sugar===1?'':'s'} sugar · ${temp} °C`,'font-size="12"')+T(380,80,`${temp}°C`,`font-size="22" font-weight="700" fill="${temp>50?OR:temp<15?BL:GN}"`)}
 else{const c=curdOK();const set=p>=1&&c==='yes',slow=p>=1&&c==='slow';s+=`<path d="M150 120 L310 120 L295 280 L165 280 Z" fill="${set?'#fbf6e8':'#f7fbff'}" stroke="${ink}" stroke-width="2"/>`;
  if(set)s+=`<path d="M157 150 Q230 140 303 150 L295 280 L165 280 Z" fill="#fffaf0" stroke="#e8dcc0"/>`+[0,1,2,3].map(k=>rod(190+k*25,200+(k%2)*20,k*30)).join('');else s+=`<path d="M157 150 Q230 158 303 150 L295 280 L165 280 Z" fill="#eef6ff"/>`;
  s+=T(230,105,`milk at ${temp} °C`,'font-size="14"')+T(380,80,`${temp}°C`,`font-size="22" font-weight="700" fill="${temp>50?OR:temp<20?BL:GN}"`)}
 $('#ySvg').innerHTML=s}
function msg(){if(mode==='y'){const r=rate();$('#yOut').innerHTML=temp>=60?'<p class="fb no">Too hot — the yeast cells are killed, so no gas forms.</p>':sugar===0?'<p>No sugar: yeast has almost no food, so very little carbon dioxide.</p>':temp<15?'<p>Cold: yeast is alive but works very slowly — the balloon barely grows.</p>':`<p class="fb ok">Yeast ferments sugar → alcohol + carbon dioxide. Balloon filled ${Math.round(r*100)}%. ${temp>=30&&temp<=40?'Warm temperature is ideal.':''}</p>`}
 else{const c=curdOK();$('#yOut').innerHTML=c==='yes'?'<p class="fb ok">Curd set! Lactobacillus from the starter multiplied in warm milk and turned it thick and sour.</p>':c==='slow'?'<p>Too cold: the curd does not set overnight (bacteria multiply very slowly). This is why curd sets slowly in winter.</p>':c==='dead'?'<p class="fb no">Too hot: the bacteria in the starter are killed, so the milk does not set.</p>':'<p class="fb no">No starter: there are not enough Lactobacillus bacteria to set the curd.</p>'}}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('yS')){if(e.target.id==='yS')sugar=+e.target.value;else temp=+e.target.value;ran=false;draw();$('#yOut').innerHTML=''}})}
function labClick(b){if(b.id==='yRun'){ran=false;let p=0;const t=setInterval(()=>{p+=.1;if(!$('#ySvg')||!$('#ySvg').isConnected){clearInterval(t);return}draw(Math.min(1,p));if(p>=1){clearInterval(t);ran=true;msg()}},90);return true}return false}
function labChange(t){if(t.id==='yM'){mode=t.value;temp=mode==='c'?40:35;$('#yT').value=temp;ran=false;draw();$('#yOut').innerHTML='';return true}if(t.id==='yC'){ran=false;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
