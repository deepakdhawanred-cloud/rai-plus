/* Rai Plus content pack: Class 9 Science, Chapter 12 – Improvement in Food Resources (NCERT, as in the HBSE plan). Bilingual: Hindi terms alongside. */
RP.register({key:'9sci12',cls:'9',subject:'Science',ch:'12',title:"Improvement in Food Resources",color:'#4f6b1a',
crumb:"HBSE Class 9 Science · खाद्य संसाधनों में सुधार · Taught in December",h1:"Chapter 12: Improvement in Food Resources · खाद्य संसाधनों में सुधार",sub:"Better crop varieties, better farm management and better animal husbandry: how India feeds more people from the same land.",heroLabel:"A wheat field, a cow, a fish pond and a beehive",labName:'Farm lab',
theme:"\n:root{--g:light-dark(#4f6b1a,#b5d67a);--g2:light-dark(#f1f6e6,#141a08);--line:light-dark(#dbe6c4,#30401a);--bg:light-dark(#ffffff,#0d1006);--card:light-dark(#ffffff,#13180a);\n--ink:light-dark(#171d0b,#eaf1dc);--mute:light-dark(#5b6847,#b3c19a);--y:light-dark(#9a5a10,#f0b56a);--y2:light-dark(#fbf0e2,#2a1a08);--hd:#3b5112}\n",
labHTML:`  <h2>Farm lab · खेत प्रयोगशाला</h2>
  <div class="ctrl"><label>Activity<select id="fMode"><option value="pond">Composite fish pond · मिश्रित मछली पालन</option><option value="season">Kharif or Rabi? · खरीफ या रबी</option></select></label></div>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="fSvg" viewBox="0 0 480 300" role="img" aria-label="Farm activity" style="color:var(--ink)"></svg></div></div>
  <div><div id="fCtl"></div><div class="box y" id="fOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#4f6b1a',LABNAME='Farm lab',MIND_CENTER='Food resources';
const GN='#4f6b1a',BR='#9a5a10',BL='#378add',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const plant=(x,y,h,c=GN)=>`<line x1="${x}" y1="${y}" x2="${x}" y2="${y-h}" stroke="${c}" stroke-width="2"/><ellipse cx="${x-4}" cy="${y-h*.6}" rx="5" ry="2.5" fill="${c}" transform="rotate(-30 ${x-4} ${y-h*.6})"/><ellipse cx="${x+4}" cy="${y-h*.4}" rx="5" ry="2.5" fill="${c}" transform="rotate(30 ${x+4} ${y-h*.4})"/>`;
const wheat=(x,y,h)=>plant(x,y,h,'#c9a227')+`<ellipse cx="${x}" cy="${y-h-5}" rx="3" ry="7" fill="#c9a227"/>`;
function heroDraw(){let s='';for(let i=0;i<10;i++)s+=`<line x1="${20+i*12}" y1="110" x2="${20+i*12}" y2="70" stroke="#fff" stroke-width="2"/><ellipse cx="${20+i*12}" cy="66" rx="3" ry="7" fill="#fff"/>`;return s+`<ellipse cx="220" cy="95" rx="50" ry="14" fill="#fff" opacity=".5"/><path d="M200 95 q10 -8 20 0 q-10 8 -20 0 l-8 -6 v12z" fill="#fff"/>`}
const HERO=heroDraw;
const MIND=[['Crops & seasons',100,50],['Variety improvement',420,50],['Nutrients, manure, irrigation',100,150],['Cropping patterns & protection',430,150],['Cattle & poultry',110,250],['Fish & bees',410,250]];

const C=[
{id:'f1',num:'12.1',title:'Our food crops and their seasons · फसलें और ऋतुएँ',
 intro:'Why does Haryana sow paddy in the monsoon but wheat in winter?',
 obj:'Classify crops by the nutrients they provide and by season (kharif and rabi).',
 prior:'Nutrients in food (carbohydrates, proteins, fats, vitamins, minerals).',
 simple:'Cereals (wheat, rice, maize, millets) give carbohydrates for energy. Pulses (gram, pea, lentil, pigeon pea, green and black gram) give protein. Oil seeds (soyabean, groundnut, mustard, sesame, sunflower) give fats. Vegetables, spices and fruits give vitamins and minerals. Fodder crops such as berseem, oats and sudan grass feed livestock. Crops need particular temperature and day length: kharif (खरीफ) crops grow in the rainy season, June to October; rabi (रबी) crops grow in winter, November to April.',
 detail:'Kharif crops: paddy, soyabean, pigeon pea (arhar), maize, cotton, green gram, black gram. Rabi crops: wheat, gram, peas, mustard, linseed. India\'s food grain production rose greatly after the Green Revolution, and milk production after the White Revolution, while the area under farming rose only a little. To get more food from the same land, we must improve yields in three ways: (1) crop variety improvement, (2) crop production management, and (3) crop protection management. Sustainable practices are needed so that the land stays fertile and the environment is not damaged.',
 real:'In Haryana, wheat and mustard are the main rabi crops; paddy, bajra and cotton are grown in kharif.',
 apply:'Classify as kharif or rabi: wheat, paddy, mustard, maize, gram, cotton.',
 see:{w:520,h:230,f:[
  ['Cereals → carbohydrates (energy).',[0,1,2,3,4].map(i=>wheat(40+i*16,150,60)).join('')+lbl(75,180,'cereals: energy')],
  ['Pulses → protein. Oil seeds → fats.',[0,1,2,3].map(i=>plant(200+i*18,150,45)+`<ellipse cx="${200+i*18+6}" cy="${110}" rx="6" ry="3" fill="${GN}"/>`).join('')+lbl(225,180,'pulses: protein')+[0,1,2].map(i=>plant(340+i*22,150,70,'#c9a227')+`<circle cx="${340+i*22}" cy="78" r="8" fill="#f2b632"/>`).join('')+lbl(362,180,'oil seeds: fats')],
  ['Kharif: June–October (rainy). Rabi: November–April (winter).',lbl(150,215,'kharif · खरीफ: paddy, maize, cotton','font-weight="700"')+lbl(390,215,'rabi · रबी: wheat, gram, mustard','font-weight="700"')]]},
 seeNote:'Each crop group meets a different nutrient need.',
 do:{title:'Kitchen survey',mat:'Your kitchen store, a notebook',steps:['List the grains, pulses and oils at home.','Write the crop each came from.','Mark each crop kharif or rabi.'],obs:'Both seasons feed your family.',why:'Different crops, different seasons.',lab:true},
 memo:'"Kharif in the rains, Rabi in the cold."',
 miscon:['"Pulses are mainly carbohydrate." They are our main plant protein.','"Rabi means summer." Rabi is the winter season crop.'],
 terms:['Cereals','Pulses · दालें','Oil seeds · तिलहन','Kharif · खरीफ','Rabi · रबी','Fodder · चारा'],
 q:{q:'Which is a rabi crop?',o:['Paddy','Wheat','Maize','Cotton'],a:1,why:'Wheat is sown in winter.'},
 exam:'Kharif/rabi classification and crop–nutrient matching are 1–2 mark questions.'},

{id:'f2',num:'12.1.1',title:'Crop variety improvement · फसल की किस्मों में सुधार',
 intro:'How do scientists get a wheat plant that gives more grain and resists disease?',
 obj:'Explain hybridisation and the useful traits sought in new crop varieties.',
 prior:'Crops and seasons (12.1).',
 simple:'Scientists breed varieties with useful traits such as high yield, good quality and disease resistance. One way is hybridisation (संकरण): crossing two plants with different good traits. Another is introducing a gene that gives a desired trait, making a genetically modified crop. Good-quality seeds of one variety should then be used.',
 detail:'Hybridisation can be intervarietal (between different varieties), interspecific (between two species of the same genus) or intergeneric (between different genera). Traits sought: (1) higher yield; (2) improved quality, e.g. baking quality in wheat, protein quality in pulses, oil quality in oil seeds; (3) resistance to biotic stresses (diseases, insects, nematodes) and abiotic stresses (drought, salinity, waterlogging, heat, cold, frost); (4) change in maturity duration: shorter duration lets farmers grow more crops per year and lowers cost; (5) wider adaptability to different climates; (6) desirable agronomic traits, e.g. tallness and profuse branching for fodder crops, dwarfness in cereals so less nutrients are used. Varieties must be tested to make sure they suit the local conditions.',
 real:'Short, sturdy wheat varieties were central to the Green Revolution in Punjab and Haryana.',
 apply:'Why would a farmer want a variety that matures early?',
 see:{w:520,h:230,f:[
  ['Variety A: high yield but disease-prone.',[0,1,2].map(i=>wheat(60+i*20,150,70)).join('')+lbl(80,180,'A: high yield')],
  ['Variety B: disease-resistant but low yield.',[0,1,2].map(i=>wheat(380+i*20,150,40)).join('')+lbl(400,180,'B: resistant')],
  ['Cross them (hybridisation · संकरण): offspring can combine both traits.',`<path d="M120 120 Q240 60 360 120" fill="none" stroke="${BR}" stroke-width="2" stroke-dasharray="5 4"/>`+lbl(240,80,'×','font-size="22"')+[0,1,2].map(i=>wheat(220+i*20,210,70)).join('')+lbl(240,226,'improved variety','font-weight="700"')]]},
 seeNote:'Selection then keeps the best offspring.',
 do:{title:'Seed comparison',mat:'Seed packets of two varieties (or their labels)',steps:['Read the labels: yield, duration, resistance.','Compare which suits a dry area or a short season.'],obs:'Labels list the bred traits.',why:'Varieties are bred for specific traits.',lab:false},
 memo:'"Yield, Quality, Resistance, Duration, Adaptability, Agronomic traits."',
 miscon:['"Hybrid means mixing seeds in a bag." It means crossing two parent plants.','"One variety suits every region." Varieties are tested for local conditions.'],
 terms:['Hybridisation · संकरण','Genetically modified (GM) crop','Biotic stress','Abiotic stress'],
 q:{q:'Crossing two different varieties of the same crop is called:',o:['intergeneric hybridisation','intervarietal hybridisation','interspecific hybridisation','crop rotation'],a:1,why:'Between varieties.'},
 exam:'"List factors for which variety improvement is done" is a frequent 3-mark question.'},

{id:'f3',num:'12.1.2',title:'Nutrients, manure and fertilisers · पोषक तत्व, खाद और उर्वरक',
 intro:'A plant needs 16 nutrients. Where does it get each one?',
 obj:'Name plant nutrients and their sources; compare manure and fertilisers; describe organic farming.',
 prior:'Crop variety improvement.',
 simple:'Plants need 16 nutrients. Carbon and oxygen come from air; hydrogen and oxygen from water; the other 13 come from soil. Six are needed in large amounts (macronutrients) and seven in small amounts (micronutrients). Manure (खाद) is decomposed animal and plant waste; it adds a little nutrient but a lot of organic matter, improving soil structure. Fertilisers (उर्वरक) are factory-made and supply specific nutrients like nitrogen, phosphorus and potassium.',
 detail:'Macronutrients (6): nitrogen, phosphorus, potassium, calcium, magnesium, sulphur. Micronutrients (7): iron, manganese, boron, zinc, copper, molybdenum, chlorine. Manure increases water-holding capacity of sandy soils and improves drainage in clayey soils. Compost: farm waste (livestock excreta, vegetable waste, animal refuse, sewage, straw, eradicated weeds) decomposed in pits; vermicompost uses earthworms to speed decomposition. Green manure: plants such as sun hemp or guar are grown and then ploughed into the soil. Fertilisers give quick, high yields but must be applied carefully (right dose, time, pre- and post-application care); overuse kills soil micro-organisms, reduces soil fertility in the long run and pollutes water. Organic farming uses little or no chemicals and uses manures, bio-fertilisers (e.g. blue-green algae), neem leaves for pest control, and mixed cropping.',
 real:'Many farm families in Haryana keep a compost or vermicompost pit for dung and crop waste.',
 apply:'Give two advantages of manure over fertilisers and one of fertilisers over manure.',
 see:{w:520,h:240,f:[
  ['Air → C, O. Water → H, O.',lbl(90,40,'air: C, O','font-weight="700"')+lbl(90,70,'water: H, O','font-weight="700"')+plant(260,200,120,GN)],
  ['Soil → 13 nutrients: 6 macro, 7 micro.',`<rect x="20" y="200" width="480" height="30" fill="#c8a982" opacity=".6"/>`+lbl(380,70,'macro: N P K Ca Mg S','font-size="12"')+lbl(380,95,'micro: Fe Mn B Zn Cu Mo Cl','font-size="12"')],
  ['Manure improves soil structure; fertilisers give quick specific nutrients.',lbl(140,140,'manure · खाद: organic matter','font-size="12"')+lbl(380,140,'fertiliser · उर्वरक: N, P, K','font-size="12"')]]},
 seeNote:'16 nutrients in total.',
 do:{title:'Mini compost bin',mat:'A bucket with holes, kitchen peels, dry leaves, soil, a few earthworms (optional)',steps:['Layer peels, dry leaves and soil.','Keep moist and turn weekly.','Check after 4–6 weeks.'],obs:'Dark, crumbly compost.',why:'Microbes (and earthworms) decompose waste into manure.',lab:false},
 memo:'"Air–water give CHO; soil gives 13: six big, seven small."',
 miscon:['"Fertiliser and manure are the same." Manure is organic; fertilisers are chemical.','"More fertiliser always means more yield." Overuse harms soil and water.'],
 terms:['Macronutrients · वृहत पोषक','Micronutrients · सूक्ष्म पोषक','Manure · खाद','Compost, vermicompost','Green manure','Fertiliser · उर्वरक','Organic farming · जैविक खेती'],
 q:{q:'Which is a micronutrient?',o:['Nitrogen','Potassium','Zinc','Calcium'],a:2,why:'Zinc is needed in small amounts.'},
 exam:'Manure vs fertiliser and lists of macro/micronutrients are common.'},

{id:'f4',num:'12.1.2',title:'Irrigation and cropping patterns · सिंचाई और फसल पैटर्न',
 intro:'Why might a farmer sow soyabean and maize in alternate rows in the same field?',
 obj:'Describe irrigation sources and the cropping patterns: mixed cropping, intercropping and crop rotation.',
 prior:'Nutrients and manure.',
 simple:'Irrigation (सिंचाई) supplies water at the right stages. Sources: wells (dug wells and tube wells), canals, river lift systems and tanks; rainwater harvesting and check-dams raise groundwater. Cropping patterns help get more from land: mixed cropping (मिश्रित फसल) grows two or more crops together in the same field; intercropping (अंतराफसलीकरण) grows them in a definite row pattern; crop rotation (फसल चक्र) grows different crops on a field one after another in a planned sequence.',
 detail:'Mixed cropping reduces the risk of total crop failure: e.g. wheat + gram, wheat + mustard, groundnut + sunflower. Intercropping: crops with different nutrient needs are chosen so nutrients are used well, and pests and diseases spread less; e.g. soyabean + maize, finger millet (bajra) + cowpea (lobia); each crop can be fertilised and harvested separately. Crop rotation depends on moisture, irrigation and duration; with a legume in the rotation, soil nitrogen is replenished. Two or three crops a year can be grown with proper rotation. India\'s farming depends on rainfall timing; failure of monsoon or poor rains can destroy a crop, which is why irrigation matters.',
 real:'In many parts of Haryana, a rice–wheat rotation is followed; adding a pulse such as moong helps restore soil nitrogen.',
 apply:'How is intercropping different from mixed cropping?',
 see:{w:520,h:240,f:[
  ['Mixed cropping: seeds sown together, no pattern.',`<rect x="20" y="40" width="150" height="150" fill="#f1ead9"/>`+[...Array(30)].map((_,i)=>{const x=30+(i*47)%135,y=55+(i*29)%125;return i%2?`<circle cx="${x}" cy="${y}" r="4" fill="${GN}"/>`:`<circle cx="${x}" cy="${y}" r="4" fill="#c9a227"/>`}).join('')+lbl(95,210,'mixed · मिश्रित')],
  ['Intercropping: crops in set rows.',`<rect x="185" y="40" width="150" height="150" fill="#f1ead9"/>`+[0,1,2,3,4,5].map(r=>[0,1,2,3,4,5,6].map(c=>`<circle cx="${197+c*20}" cy="${55+r*24}" r="4" fill="${r%3===2?'#c9a227':GN}"/>`).join('')).join('')+lbl(260,210,'intercropping · अंतराफसलीकरण')],
  ['Crop rotation: different crops one after another.',`<rect x="350" y="40" width="150" height="150" fill="#f1ead9"/>`+lbl(425,80,'kharif: paddy','font-size="12"')+lbl(425,115,'↓','font-size="16"')+lbl(425,150,'rabi: wheat','font-size="12"')+lbl(425,175,'↺ add a legume','font-size="11"')+lbl(425,210,'rotation · फसल चक्र')]]},
 seeNote:'Green and yellow dots stand for two different crops.',
 do:{title:'Field survey',mat:'A visit to a nearby farm, a notebook',steps:['Ask the farmer which crops grow in each season.','Note any rows of two crops together.','Ask how the field is irrigated.'],obs:'A record of real patterns and water sources.',why:'Patterns and irrigation raise yield.',lab:true},
 memo:'"Mixed = mixed up; Inter = in rows; Rotation = one after another."',
 miscon:['"Mixed cropping and intercropping are the same." Intercropping has a fixed row pattern.','"Crop rotation means rotating plants in the field." It means changing crops season by season.'],
 terms:['Irrigation · सिंचाई','Tube well','Canal','Check-dam','Mixed cropping · मिश्रित फसल','Intercropping · अंतराफसलीकरण','Crop rotation · फसल चक्र'],
 q:{q:'Growing soyabean and maize in alternate rows is:',o:['mixed cropping','intercropping','crop rotation','hybridisation'],a:1,why:'Definite row pattern.'},
 exam:'Differences between mixed cropping, intercropping and crop rotation are asked every year.'},

{id:'f5',num:'12.1.3',title:'Crop protection and storage · फसल सुरक्षा और भंडारण',
 intro:'A farmer harvests a big crop, but a third of it is spoiled in the store. What went wrong?',
 obj:'Describe weeds, pests and diseases and their control; describe losses in storage and how to prevent them.',
 prior:'Crop production management.',
 simple:'Weeds (खरपतवार) are unwanted plants that take nutrients, space and light from crops. Insect pests (पीड़क) attack crops by cutting roots, stems and leaves; sucking cell sap; or boring into stems and fruits. Diseases are caused by bacteria, fungi and viruses. In storage, grain is spoiled by insects, rodents, fungi, mites and bacteria (biotic factors) and by moisture and temperature (abiotic factors).',
 detail:'Weeds: e.g. Xanthium (gokhroo), Parthenium (gajar ghas), Cyperinus rotundus (motha). Control: mechanical removal, proper seed-bed preparation, timely sowing, intercropping and crop rotation, and weedicides. Pathogens spread through soil, water and air. Control: pesticides (herbicides, insecticides, fungicides) used in the correct amounts, since excess poisons plants, animals and soil; resistant varieties; summer ploughing (deep ploughing in summer to destroy weeds and pests). Storage losses: degradation in quality, loss in weight, poor germination, discolouration, poor marketability. Prevention: cleaning before storage, proper drying in sunlight and shade, fumigation with chemicals that kill pests; large-scale storage in godowns.',
 real:'Families often dry grain in the sun and keep it in sealed bins with neem leaves to protect it from insects.',
 apply:'Why should grain be dried well before storage?',
 see:{w:520,h:230,f:[
  ['Weeds compete with the crop for nutrients, water and light.',[0,1,2,3].map(i=>wheat(40+i*25,150,70)).join('')+[0,1].map(i=>plant(62+i*50,150,40,'#7a8a3a')).join('')+lbl(95,180,'weeds · खरपतवार')],
  ['Pests cut, suck sap from, or bore into plants.',plant(260,150,80)+`<ellipse cx="270" cy="100" rx="7" ry="4" fill="${BR}"/>`+lbl(260,180,'pests · पीड़क')],
  ['Storage losses: insects, rodents, fungi; moisture and temperature.',`<rect x="380" y="70" width="90" height="80" fill="#f1ead9" stroke="${ink}"/>`+[...Array(8)].map((_,i)=>`<circle cx="${392+(i*11)%70}" cy="${85+(i*17)%55}" r="3" fill="${GR}"/>`).join('')+lbl(425,180,'dry · clean · fumigate')]]},
 seeNote:'Prevention is cheaper than cure.',
 do:{title:'Storage experiment',mat:'Two jars, grain, water',steps:['Put dry grain in one jar and slightly damp grain in another; seal both.','Check after two weeks.'],obs:'Damp grain shows fungus or smell.',why:'Moisture helps microbes and pests.',lab:false},
 memo:'"Weeds steal, pests eat, microbes infect; dry, clean, fumigate."',
 miscon:['"More pesticide is better." Excess is poisonous and pollutes.','"Storage losses are only from rats." Moisture, fungi, insects and mites also cause them.'],
 terms:['Weeds · खरपतवार','Pests · पीड़क','Pathogen · रोगाणु','Weedicide','Fumigation · धूमन','Biotic and abiotic factors'],
 q:{q:'Parthenium (gajar ghas) is a:',o:['pest','weed','fungus','fertiliser'],a:1,why:'An unwanted plant.'},
 exam:'Factors causing storage loss and their prevention are common 3-mark questions.'},

{id:'f6',num:'12.2',title:'Animal husbandry: cattle and poultry · पशुपालन',
 intro:'Why do dairy farmers cross local cows with foreign breeds?',
 obj:'Describe cattle farming and poultry farming, including cross-breeding and care.',
 prior:'Variety improvement in crops (similar idea for animals).',
 simple:'Animal husbandry (पशुपालन) is the scientific management of livestock: feeding, breeding and disease control. Cattle are kept for milk (milch animals, e.g. cows and buffaloes) and for farm labour (draught animals). Poultry farming (कुक्कुट पालन) raises chickens for eggs (layers) and meat (broilers). Cross-breeding combines good traits of local and foreign breeds.',
 detail:'Cattle: two species, cows (Bos indicus) and buffaloes (Bubalus bubalis). Milk production depends on the duration of the lactation period. Exotic breeds (e.g. Jersey, Brown Swiss) have long lactation; local breeds (e.g. Red Sindhi, Sahiwal) resist disease well; crossing them aims at both. Care: clean, dry, roofed sheds with good ventilation; regular brushing; balanced food with roughage (mainly fibre) and concentrates (low fibre, rich in proteins and other nutrients); feed additives with micronutrients; vaccination against viral and bacterial diseases; protection from external parasites (skin diseases) and internal parasites (stomach, intestine, liver flukes). Poultry: cross-breeding Indian (e.g. Aseel) and foreign (e.g. Leghorn) breeds aims at more chicks, dwarf broiler parents, tolerance to heat, low maintenance and smaller layer size with feed efficiency. Broilers are fed vitamin-rich feed (especially vitamins A and K) for fast growth; layers need enough space and light. Poultry is called India\'s most efficient converter of low-fibre foodstuff into high-protein food. Hygiene, temperature control and vaccination prevent poultry diseases.',
 real:'The Murrah buffalo, a well-known high-milk breed, comes from Haryana.',
 apply:'What two benefits does a farmer seek by crossing a local cow with an exotic breed?',
 see:{w:520,h:230,f:[
  ['Local breed: disease-resistant.',`<ellipse cx="100" cy="110" rx="50" ry="26" fill="#d3b58a"/><rect x="62" y="130" width="8" height="30" fill="#d3b58a"/><rect x="128" y="130" width="8" height="30" fill="#d3b58a"/><circle cx="152" cy="98" r="14" fill="#d3b58a"/>`+lbl(100,185,'Sahiwal / Red Sindhi')],
  ['Exotic breed: long lactation (more milk).',`<ellipse cx="400" cy="110" rx="50" ry="26" fill="#f1efe8" stroke="${ink}"/><rect x="362" y="130" width="8" height="30" fill="${GR}"/><rect x="428" y="130" width="8" height="30" fill="${GR}"/><circle cx="452" cy="98" r="14" fill="#f1efe8" stroke="${ink}"/>`+lbl(400,185,'Jersey / Brown Swiss')],
  ['Cross-breed: both traits.',`<path d="M150 70 Q250 20 350 70" fill="none" stroke="${BR}" stroke-width="2" stroke-dasharray="5 4"/>`+lbl(250,50,'×','font-size="22"')+lbl(250,220,'cross-breed: more milk + disease resistance','font-weight="700"')]]},
 seeNote:'Breed examples as given in the textbook.',
 do:{title:'Dairy visit',mat:'A visit to a dairy or a talk with a cattle owner',steps:['Ask about the breed and daily milk yield.','Ask what the cattle eat (roughage vs concentrates).','Ask about vaccination.'],obs:'A record of real cattle care.',why:'Management affects yield.',lab:false},
 memo:'"Local resists, exotic lactates; cross gets both."',
 miscon:['"Draught animals give the most milk." Milch animals are kept for milk.','"Broilers lay eggs." Broilers are raised for meat; layers for eggs.'],
 terms:['Animal husbandry · पशुपालन','Milch animal · दुधारू पशु','Draught animal · भारवाही पशु','Lactation period · दुग्धस्रवण काल','Roughage, concentrates','Poultry · कुक्कुट पालन','Layers, broilers'],
 q:{q:'Milk production of a cow mainly depends on its:',o:['size','lactation period','colour','age only'],a:1,why:'Longer lactation → more milk.'},
 exam:'Cross-breeding aims and care of cattle/poultry are 3-mark questions.'},

{id:'f7',num:'12.2',title:'Fish production and bee-keeping · मत्स्य उत्पादन और मधुमक्खी पालन',
 intro:'Can five kinds of fish share one pond without fighting over food?',
 obj:'Describe capture and culture fisheries, composite fish culture, and bee-keeping.',
 prior:'Animal husbandry.',
 simple:'Fish are obtained by capture fishing (from natural sources) and by culture fishery (farming fish). In composite fish culture, five or six species are grown together in one pond; they feed in different zones, so they do not compete for food. Bee-keeping (मधुमक्खी पालन) gives honey and wax at low cost.',
 detail:'Marine fishery: pomphret, mackerel, tuna, sardines, Bombay duck; located with satellites and echo-sounders. Mariculture (culture in sea water): mullets, bhetki, pearl spots, prawns, mussels, oysters, and seaweed. Inland fishery: canals, ponds, reservoirs, rivers, and brackish water (estuaries, lagoons). Composite fish culture: catla feeds at the surface; rohu in the middle zone; mrigal and common carp at the bottom; grass carp eats weeds. A problem is the lack of good-quality seed, since many of these fish breed only during monsoon; hormonal stimulation in ponds now gives pure fish seed. Bee-keeping: local varieties are Apis cerana indica (Indian bee), Apis dorsata (rock bee) and Apis florae (little bee); the Italian bee Apis mellifera is used to increase yield because it collects more honey, stings less, stays in a beehive for long periods and breeds very well. The value and taste of honey depends on pasturage, i.e. the flowers available to the bees.',
 real:'Many village ponds in Haryana are now used for fish culture under state schemes.',
 apply:'In composite fish culture, why are catla, rohu and mrigal grown together?',
 see:{w:520,h:240,f:[
  ['A pond has three feeding zones.',`<rect x="40" y="40" width="440" height="180" fill="${BL}" opacity=".15"/><line x1="40" y1="100" x2="480" y2="100" stroke="${BL}" stroke-dasharray="4 4"/><line x1="40" y1="160" x2="480" y2="160" stroke="${BL}" stroke-dasharray="4 4"/>`+lbl(500,75,'surface','text-anchor="end" font-size="11"')+lbl(500,135,'middle','text-anchor="end" font-size="11"')+lbl(500,195,'bottom','text-anchor="end" font-size="11"')],
  ['Catla at the surface, rohu in the middle, mrigal and common carp at the bottom.',[['catla',140,70],['rohu',240,130],['mrigal',140,190],['common carp',320,190]].map(([n,x,y])=>`<path d="M${x-20} ${y} q20 -12 40 0 q-20 12 -40 0 l-10 -7 v14z" fill="${GN}"/>`+lbl(x,y-14,n,'font-size="11"')).join('')],
  ['Grass carp eats weeds. No competition: more fish from one pond.',`<path d="M400 120 q20 -12 40 0 q-20 12 -40 0 l-10 -7 v14z" fill="${BR}"/>`+lbl(420,106,'grass carp','font-size="11"')+lbl(260,236,'composite fish culture · मिश्रित मछली संवर्धन','font-weight="700"')]]},
 seeNote:'Zones as described in the textbook.',
 do:{title:'Honey label check',mat:'Two honey jars from different places',steps:['Compare colour and taste.','Read the label for the flower source.'],obs:'Honey from different flowers tastes different.',why:'Pasturage decides honey quality.',lab:false},
 memo:'"Catla on top, rohu in the middle, mrigal at the bottom."',
 miscon:['"Fish of one species grow best alone." Composite culture uses all zones.','"All bees are the same." Italian bees give higher yield and sting less.'],
 terms:['Capture fishery','Culture fishery','Mariculture','Composite fish culture · मिश्रित मछली संवर्धन','Apiary · मधुमक्खी पालन गृह','Pasturage'],
 q:{q:'In composite fish culture, which fish feeds at the surface?',o:['Mrigal','Rohu','Catla','Common carp'],a:2,why:'Catla is a surface feeder.'},
 exam:'Composite fish culture and the advantages of the Italian bee are common questions.'}
];

const CARDS=[['Cereals','Carbohydrates: wheat, rice, maize, millets.'],['Pulses','Protein: gram, pea, lentil, arhar.'],['Oil seeds','Fats: soyabean, groundnut, mustard.'],['Kharif · खरीफ','June–Oct: paddy, maize, cotton, soyabean.'],['Rabi · रबी','Nov–Apr: wheat, gram, mustard, peas.'],['Hybridisation · संकरण','Crossing plants with different good traits.'],['16 nutrients','Air: C, O; water: H, O; soil: 13 (6 macro + 7 micro).'],['Macronutrients','N, P, K, Ca, Mg, S.'],['Micronutrients','Fe, Mn, B, Zn, Cu, Mo, Cl.'],['Manure vs fertiliser','Organic, improves soil structure vs chemical, quick specific nutrients.'],['Mixed cropping','Two or more crops together, no pattern; reduces risk.'],['Intercropping','Crops in set rows; uses nutrients better.'],['Crop rotation','Different crops one after another; legumes restore N.'],['Storage losses','Biotic (insects, rodents, fungi) + abiotic (moisture, temperature).'],['Cattle','Local: disease-resistant; exotic: long lactation.'],['Poultry','Layers (eggs), broilers (meat); Aseel × Leghorn.'],['Composite fish culture','Catla surface, rohu middle, mrigal/common carp bottom, grass carp weeds.'],['Italian bee','Apis mellifera: more honey, stings less, breeds well.']];

const Q=[
 {lv:1,q:'Which crop provides mainly protein?',o:['Wheat','Gram','Mustard','Rice'],a:1,w:'Pulses are protein-rich.'},
 {lv:1,q:'Kharif crops are grown in:',o:['winter','the rainy season','spring only','summer only'],a:1,w:'June to October.'},
 {lv:1,q:'How many nutrients do plants get from soil?',o:['16','13','6','7'],a:1,w:'13 from soil (6 macro + 7 micro).'},
 {lv:1,q:'Catla feeds in the pond\'s:',o:['bottom','middle','surface','weeds'],a:2,w:'Surface feeder.'},
 {lv:2,q:'Growing groundnut and sunflower together without a row pattern is:',o:['intercropping','mixed cropping','crop rotation','hybridisation'],a:1,w:'No fixed pattern.'},
 {lv:2,q:'Which is a weed?',o:['Xanthium','Rohu','Aseel','Berseem'],a:0,w:'Xanthium (gokhroo).'},
 {lv:2,q:'Exotic cattle breeds such as Jersey are selected for:',o:['disease resistance','long lactation period','draught work','small size'],a:1,w:'More milk.'},
 {lv:3,q:'Why is a legume included in crop rotation?',o:['It is a weed','It restores soil nitrogen','It needs no water','It kills pests'],a:1,w:'Root nodules fix nitrogen.'},
 {lv:3,q:'Excessive use of fertilisers can:',o:['improve soil structure','kill useful soil micro-organisms and pollute water','increase organic matter','prevent weeds'],a:1,w:'Long-term harm.'},
 {lv:3,q:'A broiler is raised for:',o:['eggs','meat','wool','milk'],a:1,w:'Layers give eggs.'},
 {lv:4,q:'Assertion (A): Composite fish culture gives high yield. Reason (R): The species feed in different zones and do not compete.',o:['Both true and R explains A','Both true, R does not explain A','A true, R false','A false, R true'],a:0,w:'Whole pond used.'},
 {lv:4,q:'Which is a biotic cause of storage loss?',o:['Moisture','Temperature','Rodents','Sunlight'],a:2,w:'Living factors.'},
 {lv:4,q:'Which improvement aim matches "dwarfness in cereals"?',o:['Higher quality','Desirable agronomic traits','Wider adaptability','Abiotic resistance'],a:1,w:'Agronomic traits: dwarf cereals use fewer nutrients.'},
 {lv:5,open:true,m:3,q:'Differentiate between mixed cropping, intercropping and crop rotation, with one example each.',ans:['Mixed: two or more crops together, no pattern, e.g. wheat + gram (1).','Intercropping: crops in a definite row pattern, e.g. soyabean + maize (1).','Rotation: different crops one after another on the same field in planned sequence, e.g. paddy then wheat, with a legume (1).']},
 {lv:5,open:true,m:3,q:'Give three differences between manure and fertilisers.',ans:['Manure is organic (plant/animal waste); fertilisers are chemicals (1).','Manure adds organic matter and improves soil structure; fertilisers do not (1).','Fertilisers give specific nutrients quickly in large amounts; overuse harms soil and water (1).']},
 {lv:5,open:true,m:3,q:'What is composite fish culture? Name the zone each fish feeds in.',ans:['Growing five or six fish species together in one pond (1).','Catla: surface; rohu: middle zone (1).','Mrigal and common carp: bottom; grass carp: weeds (1).']}
];

const ONEMIN=['Cereals → carbs; pulses → protein; oil seeds → fats.','Kharif (June–Oct): paddy, maize, cotton. Rabi (Nov–Apr): wheat, gram, mustard.','Variety improvement: yield, quality, resistance, duration, adaptability, agronomic traits.','16 nutrients: 6 macro (N P K Ca Mg S), 7 micro (Fe Mn B Zn Cu Mo Cl) from soil.','Manure: organic, improves soil; fertilisers: quick, specific, overuse harms.','Mixed cropping, intercropping (rows), crop rotation (sequence).','Weeds, pests, diseases; storage losses: biotic + abiotic; dry, clean, fumigate.','Cattle: local resists disease, exotic gives more milk; cross-breed.','Poultry: layers and broilers; Aseel × Leghorn.','Composite fish culture zones; Italian bee for honey.'];
const KEYS=[['kharif / rabi',/kharif|rabi|खरीफ|रबी/i],['hybridisation',/hybrid|संकरण|cross/i],['macro / micronutrients',/macro|micro|nutrient/i],['manure vs fertiliser',/manure|fertili|खाद|उर्वरक/i],['irrigation',/irrigat|सिंचाई|tube well|canal/i],['cropping patterns',/mixed|intercrop|rotation/i],['weeds & pests',/weed|pest|खरपतवार/i],['storage',/storage|fumig|moisture/i],['cattle / poultry',/cattle|lactation|poultry|broiler|layer/i],['fish & bees',/catla|rohu|composite|bee|honey/i]];

/* ---------- lab ---------- */
let mode='pond';
const FISH={catla:['Catla','surface','#4f6b1a'],rohu:['Rohu','middle','#378add'],mrigal:['Mrigal','bottom','#9a5a10'],carp:['Common carp','bottom','#7a5a2a'],grass:['Grass carp','weeds','#639922']};
let stock={catla:0,rohu:0,mrigal:0,carp:0,grass:0};
const CROPS=[['Wheat','rabi'],['Paddy','kharif'],['Mustard','rabi'],['Maize','kharif'],['Gram','rabi'],['Cotton','kharif'],['Soyabean','kharif'],['Peas','rabi'],['Pigeon pea (arhar)','kharif'],['Linseed','rabi'],['Green gram (moong)','kharif'],['Black gram (urad)','kharif']];
let answers={};
function ctl(){if(mode==='pond')return `<p>Stock the pond (0–3 of each):</p>`+Object.entries(FISH).map(([k,[n,z]])=>`<div class="ctrl"><label>${n} <span class="note">(${z})</span><input type="range" class="fSl" data-k="${k}" min="0" max="3" value="${stock[k]}"></label></div>`).join('')+`<div class="ctrl"><button class="btn" id="fBest">Show a balanced pond</button><button class="btn" id="fClr">Empty</button></div>`;
 return `<p>Sort each crop. Tap Kharif or Rabi.</p>`+CROPS.map(([n],i)=>`<div class="ctrl" style="gap:6px;align-items:center"><span style="min-width:10em">${n}</span>${answers[i]?`<span class="fb ${answers[i]===CROPS[i][1]?'ok':'no'}">${answers[i]===CROPS[i][1]?'✓':'✗'} ${CROPS[i][1]}</span>`:`<button class="btn" data-crop="${i}" data-s="kharif">Kharif</button><button class="btn" data-crop="${i}" data-s="rabi">Rabi</button>`}</div>`).join('')}
function drawPond(){const Z={surface:75,middle:150,bottom:225,weeds:150};let s=`<rect x="20" y="40" width="440" height="230" rx="10" fill="${BL}" opacity=".15"/><line x1="20" y1="115" x2="460" y2="115" stroke="${BL}" stroke-dasharray="4 4"/><line x1="20" y1="190" x2="460" y2="190" stroke="${BL}" stroke-dasharray="4 4"/>`+T(440,60,'surface','font-size="11" text-anchor="end"')+T(440,135,'middle','font-size="11" text-anchor="end"')+T(440,210,'bottom','font-size="11" text-anchor="end"');
 [0,1,2].forEach(i=>s+=`<path d="M${60+i*150} 270 q8 -40 0 -70 M${70+i*150} 270 q-6 -30 6 -55" stroke="#639922" stroke-width="3" fill="none"/>`);
 let k=0;Object.entries(stock).forEach(([f,c])=>{for(let i=0;i<c;i++){const [,z,col]=FISH[f];const x=60+((k*97)%320),y=Z[z]+((i%2)?12:-12)+(z==='weeds'?60:0);s+=`<path d="M${x-18} ${y} q18 -11 36 0 q-18 11 -36 0 l-9 -6 v12z" fill="${col}"/>`;k++}});
 $('#fSvg').innerHTML=s;
 const zones={surface:stock.catla,middle:stock.rohu,bottom:stock.mrigal+stock.carp,weeds:stock.grass},tot=Object.values(stock).reduce((a,b)=>a+b,0);
 const empty=Object.entries(zones).filter(([,v])=>v===0).map(([z])=>z),crowd=Object.entries(zones).filter(([,v])=>v>3).map(([z])=>z);
 let msg=tot===0?'The pond is empty. Add fish.':empty.length?`Unused food zone(s): <b>${empty.join(', ')}</b>. Add a fish that feeds there.`:'Every zone is used: catla, rohu, mrigal/common carp and grass carp share the pond without competing.';
 if(crowd.length)msg+=` Too many fish feeding in: <b>${crowd.join(', ')}</b>, so they compete for food.`;
 $('#fOut').innerHTML=`<p>Fish stocked: <b>${tot}</b></p><p>${msg}</p>`}
function drawSeason(){let s=`<rect x="20" y="30" width="210" height="250" rx="8" fill="#e6f1fb"/><rect x="250" y="30" width="210" height="250" rx="8" fill="#fbf0e2"/>`+T(125,55,'Kharif · खरीफ (June–Oct)','font-size="13" font-weight="700"')+T(355,55,'Rabi · रबी (Nov–Apr)','font-size="13" font-weight="700"');
 const kx=[],rx=[];Object.entries(answers).forEach(([i,a])=>{const ok=a===CROPS[i][1];(CROPS[i][1]==='kharif'?kx:rx).push([CROPS[i][0],ok])});
 kx.forEach(([n,ok],j)=>s+=T(125,85+j*26,(ok?'✓ ':'✗ ')+n,'font-size="13"'));rx.forEach(([n,ok],j)=>s+=T(355,85+j*26,(ok?'✓ ':'✗ ')+n,'font-size="13"'));
 $('#fSvg').innerHTML=s;const done=Object.keys(answers).length,right=Object.entries(answers).filter(([i,a])=>a===CROPS[i][1]).length;
 $('#fOut').innerHTML=`<p>Sorted ${done} of ${CROPS.length}; correct: <b>${right}</b>.</p><p>Crops appear under their correct season; ✗ marks a wrong guess.</p>`}
function labShow(){$('#fCtl').innerHTML=ctl();mode==='pond'?drawPond():drawSeason()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('fSl'))labChange(t)})}
function labClick(b){if(b.id==='fBest'){stock={catla:2,rohu:2,mrigal:1,carp:1,grass:1};labShow();return true}if(b.id==='fClr'){Object.keys(stock).forEach(k=>stock[k]=0);labShow();return true}if(b.dataset&&b.dataset.crop!==undefined){answers[b.dataset.crop]=b.dataset.s;labShow();return true}return false}
function labChange(t){if(t.id==='fMode'){mode=t.value;labShow();return true}if(t.classList&&t.classList.contains('fSl')){stock[t.dataset.k]=+t.value;drawPond();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
