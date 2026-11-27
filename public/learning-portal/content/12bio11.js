/* Rai Plus content pack: Class 12 Biology, Chapter 11 – Organisms and Populations */
RP.register({key:'12bio11',cls:'12',subject:'Biology',ch:'11',title:"Organisms and Populations",color:'#2f6b2f',
crumb:"HBSE Class 12 Biology · Unit: Ecology · Taught in November",h1:"Chapter 11: Organisms and Populations",sub:"How populations grow, what limits them, and the many ways species help, fight, eat and live off each other.",heroLabel:"An S-shaped population growth curve levelling off at the carrying capacity",labName:"Population lab",
theme:"\n:root{--g:light-dark(#2f6b2f,#9fd39f);--g2:light-dark(#edf6ec,#122012);--line:light-dark(#d3e6d1,#284228);--bg:light-dark(#ffffff,#0c140c);--card:light-dark(#ffffff,#111b11);\n--ink:light-dark(#122012,#e6f1e6);--mute:light-dark(#506650,#a9c2a9);--y:light-dark(#b0612a,#eaa767);--y2:light-dark(#fcf0e3,#2a1d10);--hd:#204a20}\n",
labHTML:`  <h2>Population lab</h2>
  <p>Grow a population with or without limits, then classify real examples of how species interact.</p>
  <div class="ftabs" role="group" aria-label="Lab tool"><button data-tool="grow" aria-pressed="true">Growth models</button><button data-tool="int" aria-pressed="false">Interaction sorter</button></div>
  <div id="t-grow">
    <div class="sim"><div><div class="fig" style="max-width:none"><svg id="gS" viewBox="0 0 520 330" role="img" aria-label="Population size against time" style="color:var(--ink)"></svg></div></div>
    <div><div class="ctrl"><label>Starting population N₀<input type="range" id="gN" min="5" max="100" step="5" value="10"></label><label>Intrinsic rate r (per year)<input type="range" id="gR" min="0.1" max="1" step="0.05" value="0.5"></label><label>Carrying capacity K<input type="range" id="gK" min="200" max="1000" step="50" value="600"></label></div>
    <div class="ctrl"><label>Show<select id="gM"><option value="both">Both models</option><option value="exp">Exponential only</option><option value="log">Logistic only</option></select></label></div>
    <div class="box y" id="gOut" aria-live="polite"></div></div></div>
  </div>
  <div id="t-int" hidden>
    <p id="iQ" style="font-size:18px;font-weight:600"></p>
    <div class="ctrl" id="iBtns"></div>
    <div id="iFb" aria-live="polite"></div>
    <div class="ctrl"><button class="btn p" id="iNext">Next example</button><span id="iSc" class="note"></span></div>
  </div>
`,
build:function(){

const ACC='#2f6b2f',LABNAME='Population lab',MIND_CENTER='Populations';
const GR='#2f6b2f',OR='#b0612a',ink='currentColor';
const pill=(x,y,t,c='#edf6ec',w=150)=>`<rect x="${x-w/2}" y="${y-17}" width="${w}" height="34" rx="8" fill="${c}" stroke="${GR}"/>`+T(x,y+5,t,'font-size="13"');
function heroDraw(){let d='';for(let t=0;t<=200;t+=4){const N=100/(1+Math.exp(-(t-90)/18));d+=(t?'L':'M')+(70+t)+' '+(110-N*0.9)}return `<path d="${d}" fill="none" stroke="#fff" stroke-width="3"/><line x1="70" y1="20" x2="280" y2="20" stroke="#eaa767" stroke-dasharray="5 4"/>`+T(300,24,'K','font-size="14" fill="#fff"')}
const HERO=heroDraw;
const MIND=[['Population attributes',90,50],['Population density',430,50],['Growth models',90,150],['Life history',430,150],['Interactions (+/−)',90,250],['Competition, predation, parasitism',430,250]];

const C=[
{id:'t1',num:'11.1.1',title:'Population attributes',
 intro:'A single frog cannot have a birth rate. A pond full of frogs can. What makes a population more than a group of individuals?',
 obj:'Define a population and its attributes: birth rate, death rate, sex ratio and age distribution; interpret age pyramids.',
 prior:'Levels of organisation in ecology.',
 simple:'A population is a group of individuals of the same species living in a well-defined area, sharing resources and able to interbreed. Unlike a single organism, a population has attributes: birth rate (natality), death rate (mortality), sex ratio and age distribution. Plotted as an age pyramid, the age distribution tells whether the population is growing, stable or declining.',
 detail:'Birth rates and death rates are per capita rates, i.e. relative to the members of the population. Example: if a pond had 20 lotus plants last year and 8 new plants were added by reproduction, the birth rate is 8/20 = 0.4 offspring per lotus per year. If 4 of 40 fruit flies in a lab population died in a week, the death rate is 4/40 = 0.1 individuals per fruit fly per week. Sex ratio: e.g. 60% females and 40% males. Age distribution: a population at a given time is composed of pre-reproductive, reproductive and post-reproductive individuals; the plot of the percentage in each age group is the age pyramid. For human populations the pyramid usually shows males and females on two sides. Shape: a broad base (triangular) shows an expanding population; a bell shape shows a stable one; an urn shape (narrow base) shows a declining population.',
 real:'India\'s census uses age pyramids to plan schools, jobs and pensions; a broad base means many children who will soon need schools.',
 apply:'In a population of 1000 mice, 50 die in a year. What is the death rate? Is that a population attribute or an individual one?',
 see:{w:520,h:240,f:[
  ['Expanding: many young (broad base).',`<path d="M60 210 L160 210 L120 60 L100 60 Z" fill="#c0dd97" stroke="${GR}"/>`+T(110,230,'expanding','font-size="12"')],
  ['Stable: bell-shaped.',`<path d="M210 210 L310 210 L300 120 L280 60 L240 60 L220 120 Z" fill="#c0dd97" stroke="${GR}"/>`+T(260,230,'stable','font-size="12"')],
  ['Declining: urn-shaped, fewer young.',`<path d="M385 210 L435 210 L460 120 L440 60 L380 60 L360 120 Z" fill="#c0dd97" stroke="${GR}"/>`+T(410,230,'declining','font-size="12"')]]},
 seeNote:'Base = pre-reproductive; middle = reproductive; top = post-reproductive.',
 do:{title:'Class age pyramid',mat:'Ages of family members of all students, graph paper',steps:['Group ages: 0–14, 15–44, 45 and above.','Count males and females in each group.','Draw horizontal bars on both sides of a central line.'],obs:'A shape emerges: usually wider at the base or middle.',why:'The shape indicates the growth status of the population sampled.',lab:false},
 memo:'"Triangle grows, Bell stays, Urn shrinks."',
 miscon:['"A single organism has a birth rate." Birth rate is a population attribute.','"A narrow-based pyramid means a healthy, growing population." It indicates decline.'],
 terms:['Population','Natality','Mortality','Sex ratio','Age pyramid'],
 q:{q:'An urn-shaped age pyramid indicates a population that is:',o:['Expanding','Stable','Declining','Migrating'],a:2,why:'Few pre-reproductive individuals.'},
 exam:'Age pyramid shapes and birth/death-rate calculations are common 2–3 mark questions.'},
{id:'t2',num:'11.1.2',title:'Population density and how it changes',
 intro:'How would you count the tigers in a reserve, or the bacteria on a plate?',
 obj:'Explain methods of measuring population density and the four processes that change it, using the equation Nₜ₊₁ = Nₜ + [(B + I) − (D + E)].',
 prior:'Population attributes (11.1.1).',
 simple:'Population density (N) is the number of individuals in a given area. Sometimes counting is not practical, so we use relative measures: percent cover, biomass, pug marks, faecal pellets or fish caught per trap. Density goes up by births (B) and immigration (I), and goes down by deaths (D) and emigration (E).',
 detail:'The size of a population, technically its density (N), need not always be numbers: for a single huge banyan tree among 200 Parthenium plants, percent cover or biomass is more meaningful. Total number is hard or impossible to determine for very large populations or where counting takes too long, so relative densities serve the purpose (e.g. number of fish caught per trap). For tigers, census uses pug marks and faecal pellets. Four basic processes fluctuate density: natality (births, B), mortality (deaths, D), immigration (I, individuals of the same species coming in from elsewhere) and emigration (E, individuals leaving). If N is density at time t, then at time t + 1: Nₜ₊₁ = Nₜ + [(B + I) − (D + E)]. Density increases if B + I > D + E. Under normal conditions births and deaths are the most important factors; immigration matters when a new habitat is being colonised.',
 real:'Wildlife staff estimate tiger numbers in Indian reserves from pug marks and camera traps rather than by seeing every tiger.',
 apply:'A population of 500 has 60 births, 25 deaths, 10 immigrants and 15 emigrants in a year. Find the population after one year.',
 see:{w:520,h:240,f:[
  ['Births (B) and immigration (I) add individuals.',pill(130,60,'+ B  + I','#edf6ec',140)],
  ['Deaths (D) and emigration (E) remove them.',pill(390,60,'− D  − E','#fcf0e3',140)],
  ['Nₜ₊₁ = Nₜ + [(B + I) − (D + E)]',T(260,170,'Nₜ₊₁ = Nₜ + [(B + I) − (D + E)]','font-size="16" font-weight="700"')]]},
 seeNote:'Natality, mortality, immigration, emigration.',
 do:{title:'Quadrat count',mat:'1 m × 1 m quadrat (string and four pegs), notebook',steps:['Place the quadrat randomly 5 times in the school lawn.','Count one plant species (e.g. a weed) each time.','Average and calculate density per m².'],obs:'Counts vary between quadrats; the average gives density.',why:'Sampling estimates density when full counting is impractical.',lab:true},
 memo:'"BI in, DE out."',
 miscon:['"Density is always a head count." Cover, biomass or indirect signs are often used.','"Immigration and emigration don\'t change density." They do.'],
 terms:['Population density','Relative density','Natality','Mortality','Immigration','Emigration'],
 q:{q:'Which of these increases population density?',o:['Mortality','Emigration','Immigration','Predation'],a:2,why:'Individuals arrive from outside.'},
 exam:'The density equation and the four processes are 2-mark favourites.'},
{id:'t3',num:'11.1.3',title:'Population growth: exponential and logistic',
 intro:'Darwin calculated that a pair of elephants, with no limits, would have millions of descendants in a few centuries. Why doesn\'t that happen?',
 obj:'Write and interpret the exponential and logistic growth equations; define r and K; distinguish J- and S-shaped curves.',
 prior:'Population density (11.1.2).',
 simple:'With unlimited food and space, a population grows exponentially: the more there are, the faster they increase, giving a J-shaped curve. In reality resources are limited, so growth slows and levels off at the carrying capacity K, giving an S-shaped (logistic) curve.',
 detail:'Exponential growth: when resources are unlimited, each species has the ability to realise fully its innate potential to grow. dN/dt = (b − d) × N; with r = b − d, dN/dt = rN, where r is the intrinsic rate of natural increase. Integrated form: Nₜ = N₀e^(rt). The curve is J-shaped. Example values of r: Norway rat 0.015, flour beetle 0.12; for the human population of India in 1981, r was 0.0205. Logistic growth: no population can grow exponentially for long; resources become limiting and competition increases. A given habitat has enough resources to support a maximum possible number, the carrying capacity (K). A population growing in a habitat with limited resources shows an initial lag phase, followed by acceleration and deceleration, and finally an asymptote when density reaches K. This is the Verhulst–Pearl logistic growth: dN/dt = rN((K − N)/K). It is considered a more realistic model.',
 real:'Bacteria in a fresh culture flask first multiply exponentially, then level off as nutrients run out and wastes build up.',
 apply:'For dN/dt = rN((K − N)/K), what is the growth rate when N = K? When N = K/2?',
 see:{w:520,h:240,f:[
  ['Exponential: dN/dt = rN → J-shaped curve.',(()=>{let d='';for(let t=0;t<=160;t+=4){const N=6*Math.exp(t/45);d+=(t?'L':'M')+(60+t*2)+' '+(210-Math.min(190,N))}return `<path d="${d}" fill="none" stroke="${OR}" stroke-width="3"/>`})()+T(400,40,'J-shape','font-size="13"')],
  ['Logistic: growth slows near K → S-shaped curve.',(()=>{let d='';for(let t=0;t<=160;t+=4){const N=150/(1+24*Math.exp(-t/22));d+=(t?'L':'M')+(60+t*2)+' '+(210-N)}return `<path d="${d}" fill="none" stroke="${GR}" stroke-width="3"/>`})()],
  ['K = carrying capacity, the maximum the habitat can support.',`<line x1="60" y1="60" x2="400" y2="60" stroke="${GR}" stroke-dasharray="5 4"/>`+T(420,64,'K','font-size="15" font-weight="700"')]]},
 seeNote:'Run both models in the Population lab.',
 do:{title:'Yeast growth (demonstration)',mat:'Yeast, sugar solution, 5 test tubes, a microscope with haemocytometer (or turbidity by eye)',steps:['Inoculate sugar solution with a pinch of yeast.','Sample every few hours and count cells (or note cloudiness).','Plot number against time.'],obs:'Slow start, rapid rise, then levelling off.',why:'Logistic growth limited by sugar and alcohol build-up.',lab:true},
 memo:'"J for Jumping with no limits; S for Slowing at K."',
 miscon:['"Logistic growth means the population stops reproducing at K." Births balance deaths at K.','"r is the same for all species." It differs widely.'],
 terms:['Exponential growth','Intrinsic rate of natural increase (r)','Carrying capacity (K)','Logistic growth','Verhulst–Pearl equation'],
 q:{q:'The logistic growth equation is:',o:['dN/dt = rN','dN/dt = rN((K − N)/K)','dN/dt = K/N','Nₜ = N₀ + rt'],a:1,why:'Verhulst–Pearl logistic growth.'},
 exam:'Drawing and explaining J- and S-curves with equations is a frequent 3–5 mark question.'},
{id:'t4',num:'11.1.4',title:'Life history variation',
 intro:'A Pacific salmon breeds once and dies. An elephant breeds many times over decades. Why such different strategies?',
 obj:'Explain how organisms evolve life histories that maximise reproductive fitness, with examples.',
 prior:'Population growth (11.1.3).',
 simple:'Populations evolve to maximise their reproductive fitness (Darwinian fitness, high r) in the habitat where they live. Some species breed only once in their lifetime, others many times. Some produce a large number of small offspring, others a small number of large ones.',
 detail:'Under a particular set of selection pressures, organisms evolve towards the most efficient reproductive strategy. Examples from NCERT: Pacific salmon fish and bamboo breed only once in their lifetime; most birds and mammals breed many times. Oysters and pelagic fishes produce a large number of small-sized offspring, while birds and mammals produce a small number of large-sized offspring. Ecologists suggest that life-history traits of organisms have evolved in relation to the constraints imposed by the abiotic and biotic components of the habitat in which they live.',
 real:'Bamboo forests flower all at once after decades and then die, flooding the area with seeds.',
 apply:'Why might producing many tiny offspring be a good strategy for an oyster living in open sea?',
 see:{w:520,h:240,f:[
  ['Breed once: Pacific salmon, bamboo.',pill(140,60,'breed once','#fcf0e3',130)],
  ['Breed many times: most birds and mammals.',pill(380,60,'breed many times','#edf6ec',150)],
  ['Many small offspring (oysters) or few large ones (mammals).',[0,1,2,3,4,5,6,7,8,9].map(i=>`<circle cx="${70+i*14}" cy="170" r="4" fill="${OR}"/>`).join('')+`<circle cx="390" cy="170" r="16" fill="${GR}"/>`]]},
 seeNote:'Strategies are shaped by the habitat.',
 do:{title:'Strategy table',mat:'Notebook',steps:['List 6 organisms you know.','Note: breeds once or many times; many small or few large offspring.','Suggest why each strategy suits its habitat.'],obs:'Different habitats favour different strategies.',why:'Natural selection maximises reproductive fitness.',lab:false},
 memo:'"Salmon and bamboo: once. Oysters: many and tiny."',
 miscon:['"Producing more offspring is always better." It depends on survival chances and habitat.'],
 terms:['Life history','Reproductive fitness','Darwinian fitness'],
 q:{q:'Which breeds only once in its lifetime?',o:['Elephant','Bamboo','Sparrow','Human'],a:1,why:'NCERT example.'},
 exam:'Life-history examples are asked as 1–2 mark questions.'},
{id:'t5',num:'11.1.5',title:'Population interactions and mutualism',
 intro:'No species lives alone. Who benefits, who is harmed, and who doesn\'t care?',
 obj:'Classify population interactions using + / − / 0 and describe mutualism with NCERT examples.',
 prior:'Food chains (Class 10).',
 simple:'Interactions between two species can be beneficial (+), harmful (−) or neutral (0) for each. Mutualism (+, +): both benefit. Competition (−, −): both lose. Predation and parasitism (+, −): one benefits, one is harmed. Commensalism (+, 0): one benefits, the other is unaffected. Amensalism (−, 0): one is harmed, the other is unaffected.',
 detail:'Mutualism examples: lichens, an intimate mutualistic relationship between a fungus and photosynthesising algae or cyanobacteria; mycorrhizae, associations between fungi and the roots of higher plants (the fungi help absorb nutrients; the plant provides carbohydrates). Plant–animal mutualism often involves co-evolution: in many species of fig trees, a specific wasp species pollinates the fig while laying eggs in it, and the developing seeds feed the wasp larvae. Orchids show great diversity of floral patterns to attract the right pollinator; the Mediterranean orchid Ophrys uses sexual deceit: one petal resembles a female bee, so males "pseudocopulate" with the flower and get dusted with pollen. If the female bee\'s colour patterns change even slightly in evolution, the orchid flower must co-evolve to keep up.',
 real:'The lichens you see as grey-green patches on old walls and tree trunks are a fungus and an alga living as one.',
 apply:'Classify the relationship between a honeybee and a mustard flower. Explain each sign.',
 see:{w:520,h:240,f:[
  ['Mutualism (+, +): both benefit.',pill(130,50,'+ , +','#edf6ec',100)+T(320,55,'lichens, mycorrhizae, fig–wasp','font-size="13"')],
  ['Competition (−, −); predation and parasitism (+, −).',pill(130,110,'− , −','#fcf0e3',100)+pill(260,110,'+ , −','#fcf0e3',100)],
  ['Commensalism (+, 0); amensalism (−, 0).',pill(130,170,'+ , 0','#edf6ec',100)+pill(260,170,'− , 0','#fcf0e3',100)]]},
 seeNote:'Use the interaction matrix in the Visuals tab.',
 do:{title:'Lichen hunt',mat:'Hand lens, notebook',steps:['Look for crusty or leafy grey-green patches on bark and walls.','Observe under a hand lens.','Note where they grow most (clean or polluted areas).'],obs:'Lichens grow on bare surfaces; fewer near busy roads.',why:'They are fungus + alga mutualists; they are sensitive to SO₂ pollution.',lab:false},
 memo:'"Mutual = both smile."',
 miscon:['"Commensalism harms the host." The host is unaffected (0).','"Mutualism is the same as predation." Both benefit in mutualism.'],
 terms:['Mutualism','Lichen','Mycorrhiza','Co-evolution','Pseudocopulation'],
 q:{q:'Mycorrhiza is an example of:',o:['Parasitism','Mutualism','Commensalism','Amensalism'],a:1,why:'Fungus and plant root both benefit.'},
 exam:'The +/−/0 table and mutualism examples are asked every year.'},
{id:'t6',num:'11.1.5',title:'Competition',
 intro:'Goats were brought to an island in the Galapagos. Within ten years the giant tortoises there had vanished. How?',
 obj:'Describe intra- and interspecific competition, competitive exclusion and resource partitioning with NCERT examples.',
 prior:'Interactions (11.1.5).',
 simple:'Competition happens when species fight over limited resources. Even unrelated species can compete: flamingoes and fishes compete for zooplankton in South American lakes. Gause\'s principle says two closely related species competing for the same resource cannot coexist indefinitely; the weaker one is eliminated. But species can avoid competition by using resources differently, called resource partitioning.',
 detail:'Competition is thought to occur when closely related species compete for the same resources that are limiting, but unrelated species can also compete (flamingoes and fishes for zooplankton). Competition can occur even when resources are not limiting: in interference competition, one species reduces the feeding efficiency of another. Evidence: the Abingdon tortoise in the Galapagos Islands became extinct within a decade after goats were introduced, apparently because of the goats\' greater browsing efficiency. Competitive release: a species whose distribution is restricted to a small area expands its range when the competing species is removed; Connell showed on the rocky sea coasts of Scotland that the larger barnacle Balanus dominates the intertidal area and excludes the smaller Chthamalus. Gause\'s competitive exclusion principle: two closely related species competing for the same resources cannot co-exist indefinitely, and the competitively inferior one will be eliminated eventually. Resource partitioning: MacArthur showed that five closely related species of warblers living on the same tree avoided competition and co-existed because of behavioural differences in their foraging activities.',
 real:'Introduced species like water hyacinth outcompete native plants in Indian lakes and wetlands.',
 apply:'How did MacArthur\'s warblers manage to share one tree without one species eliminating the others?',
 see:{w:520,h:240,f:[
  ['Two species, same limited resource.',`<circle cx="160" cy="80" r="30" fill="#c0dd97"/><circle cx="360" cy="80" r="30" fill="#eaa767"/>`+T(260,85,'↔ same food','font-size="13"')],
  ['Gause: the weaker competitor is eliminated (e.g. Abingdon tortoise vs goats).',`<line x1="335" y1="55" x2="385" y2="105" stroke="#c0392b" stroke-width="4"/>`],
  ['Resource partitioning: different feeding zones allow coexistence (MacArthur\'s warblers).',`<rect x="140" y="150" width="240" height="70" rx="8" fill="none" stroke="${GR}"/>`+[0,1,2,3,4].map(i=>`<circle cx="${170+i*45}" cy="${165+(i%2)*35}" r="7" fill="${OR}"/>`).join('')]]},
 seeNote:'See the warbler tree in the Visuals tab.',
 do:{title:'Bean competition pots',mat:'Two pots, mustard and bean seeds',steps:['Pot A: 5 bean seeds. Pot B: 5 bean seeds plus 20 mustard seeds.','Water equally for three weeks.','Compare bean height and leaves.'],obs:'Beans in pot B are usually smaller.',why:'Competition for light, water and nutrients.',lab:true},
 memo:'"Gause: same niche, one wins. Partition: share the tree."',
 miscon:['"Only closely related species compete." Unrelated species can too (flamingoes and fishes).','"Competition needs fighting." Often it is just more efficient use of a resource.'],
 terms:['Interspecific competition','Interference competition','Competitive release','Competitive exclusion principle','Resource partitioning'],
 q:{q:'Who stated the competitive exclusion principle?',o:['Darwin','Gause','MacArthur','Connell'],a:1,why:'Gause.'},
 exam:'Gause\'s principle, resource partitioning and Connell\'s barnacles appear in 2–3 mark questions.'},
{id:'t7',num:'11.1.5',title:'Predation, parasitism and commensalism',
 intro:'A cuckoo never builds a nest, yet its chicks are raised every year. By whom?',
 obj:'Describe predation (and its roles), prey defences, parasitism (including brood parasitism) and commensalism with NCERT examples.',
 prior:'Interactions (11.1.5).',
 simple:'Predators eat prey; they also keep prey populations in check and maintain species diversity. Prey defend themselves with camouflage, poisons and spines. Parasites live on or in a host and harm it. In brood parasitism, the cuckoo lays eggs in a crow\'s nest. In commensalism, one species benefits and the other is unaffected.',
 detail:'Predation: nature\'s way of transferring energy fixed by plants to higher trophic levels. Predators keep prey populations under control: when the prickly pear cactus was introduced into Australia in the 1920s it spread rapidly over millions of hectares; it was finally controlled by bringing in a cactus-feeding predator (a moth) from its natural habitat. Biological control methods in agriculture are based on this. Predators help maintain species diversity by reducing competition among prey: in Paine\'s experiment on the American Pacific coast, when the starfish Pisaster (an important predator) was removed, more than 10 species of invertebrates became extinct within a year because of interspecific competition. Prey defences: camouflage (some insects and frogs are cryptically coloured); being poisonous (the Monarch butterfly is distasteful because of a chemical it acquires by feeding on a poisonous weed as a caterpillar); thorns (Acacia, cactus); chemicals (Calotropis produces highly poisonous cardiac glycosides; nicotine, caffeine, quinine, strychnine and opium are produced as defences). Herbivores are also predators of plants. Parasitism: parasites are host-specific and have evolved special adaptations: loss of unnecessary sense organs, adhesive organs or suckers, loss of digestive system and high reproductive capacity. Life cycles can be complex: the human liver fluke needs two intermediate hosts (a snail and a fish). Cuscuta is a parasitic plant on hedge plants. Ectoparasites (lice on humans, ticks on dogs, copepods on marine fish) feed on the external surface; endoparasites live inside. Brood parasitism in birds: the cuckoo (koel) lays its eggs in the nest of its host (crow); the eggs resemble the host\'s in size and colour. Commensalism: an orchid growing as an epiphyte on a mango branch; barnacles on a whale\'s back; the cattle egret and grazing cattle (cattle stir up insects); sea anemone and clown fish.',
 real:'Farmers use ladybird beetles and dragonflies to control aphids and mosquitoes: biological control based on predation.',
 apply:'Why is the cattle egret–cattle relationship called commensalism and not mutualism?',
 see:{w:520,h:240,f:[
  ['Predation (+, −): prickly pear controlled by a moth in Australia.',pill(150,60,'predator  +','#fcf0e3',150)+pill(380,60,'prey  −','#fcf0e3',120)],
  ['Parasitism (+, −): Plasmodium, liver fluke, Cuscuta; brood parasitism by the cuckoo.',pill(260,130,'parasite + / host −','#fcf0e3',200)],
  ['Commensalism (+, 0): orchid on mango, barnacles on whale, cattle egret and cattle.',pill(260,200,'one + / other 0','#edf6ec',180)]]},
 seeNote:'Classify more in the Interaction sorter.',
 do:{title:'Spot the interaction (field walk)',mat:'Notebook',steps:['Look for: an orchid or fern on a tree, Cuscuta on a hedge, egrets near cattle, ants on plants.','For each, decide who benefits and who is harmed.','Write the interaction type with + / − / 0.'],obs:'Several interaction types can be found in one schoolyard.',why:'Population interactions are everywhere.',lab:false},
 memo:'"Predator eats, parasite lives on, commensal hitchhikes."',
 miscon:['"Parasites always kill the host." Most don\'t; they need a living host.','"Herbivores are not predators." In ecology, plant-eaters are predators of plants.'],
 terms:['Predation','Biological control','Camouflage','Cardiac glycosides','Parasitism','Brood parasitism','Commensalism'],
 q:{q:'The relationship between a cuckoo and a crow is:',o:['Commensalism','Mutualism','Brood parasitism','Competition'],a:2,why:'The crow raises the cuckoo\'s young.'},
 exam:'Examples for each interaction and roles of predators are asked every year (2–5 marks).'}
];

const CARDS=[['Population','Same species, same area, interbreeding, sharing resources.'],['Birth rate','Per capita births: e.g. 8 new lotus / 20 = 0.4 per year.'],['Age pyramids','Triangle: expanding; bell: stable; urn: declining.'],['Density equation','Nₜ₊₁ = Nₜ + [(B + I) − (D + E)].'],['Measuring density','Counts, percent cover, biomass, pug marks, pellets, catch per trap.'],['Exponential growth','dN/dt = rN; Nₜ = N₀e^(rt); J-curve.'],['r','Intrinsic rate of natural increase.'],['Logistic growth','dN/dt = rN((K − N)/K); S-curve.'],['K','Carrying capacity.'],['Life history','Breed once (salmon, bamboo) or many times; many small or few large offspring.'],['Mutualism (+,+)','Lichens, mycorrhizae, fig–wasp, Ophrys and bee.'],['Competition (−,−)','Abingdon tortoise vs goats; Connell\'s barnacles.'],["Gause's principle",'Two species competing for the same resource cannot coexist indefinitely.'],['Resource partitioning','MacArthur\'s five warblers on one tree.'],['Predation (+,−)','Prickly pear and moth; Pisaster removal (Paine).'],['Prey defences','Camouflage, poison (Monarch), thorns, cardiac glycosides (Calotropis).'],['Parasitism (+,−)','Liver fluke (snail, fish hosts); Cuscuta; lice, ticks.'],['Brood parasitism','Cuckoo eggs in crow\'s nest.'],['Commensalism (+,0)','Orchid on mango; barnacles on whale; cattle egret; clown fish and anemone.'],['Amensalism (−,0)','One harmed, other unaffected.']];

const Q=[
 {lv:1,q:'Which is NOT an attribute of a population?',o:['Birth rate','Sex ratio','Age distribution','Metabolic rate'],a:3,w:'Metabolism belongs to individuals.'},
 {lv:1,q:'Carrying capacity is denoted by:',o:['r','N','K','B'],a:2,w:'K.'},
 {lv:1,q:'True or false: Cuscuta is a parasitic plant.',o:['True','False'],a:0,w:'It grows on hedge plants.'},
 {lv:1,q:'An interaction where one species benefits and the other is unaffected is:',o:['Mutualism','Commensalism','Amensalism','Competition'],a:1,w:'(+, 0).'},
 {lv:2,q:'If 8 new lotus plants are added to 20 in a year, the birth rate is:',o:['8','0.4','2.5','28'],a:1,w:'8/20.'},
 {lv:2,q:'Lichens represent:',o:['Fungus and alga in mutualism','Fungus parasitising alga','Commensalism','Amensalism'],a:0,w:'Both benefit.'},
 {lv:2,q:'The Monarch butterfly is protected from predators because it is:',o:['Camouflaged','Distasteful due to a chemical from its food plant','Very fast','Spiny'],a:1,w:'It acquires a toxin as a caterpillar.'},
 {lv:3,q:'A population of 400 has 50 births, 20 deaths, 10 immigrants and 30 emigrants in a year. Size next year:',o:['410','420','400','390'],a:0,w:'400 + (50 + 10) − (20 + 30) = 410.'},
 {lv:3,q:'In the logistic model, the growth rate dN/dt is zero when:',o:['N = 0 only','N = K (and N = 0)','N = K/2','Never'],a:1,w:'(K − N)/K = 0 at N = K.'},
 {lv:3,q:'Removal of the starfish Pisaster in Paine\'s experiment led to:',o:['More invertebrate species','Extinction of over 10 invertebrate species','No change','More starfish'],a:1,w:'Increased competition among prey.'},
 {lv:4,q:'Assertion (A): Predators help maintain species diversity. Reason (R): They reduce the intensity of competition among competing prey species.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'Paine\'s Pisaster experiment.'},
 {lv:4,q:'The cattle egret and grazing cattle show commensalism because:',o:['Both benefit','The egret benefits and cattle are unaffected','Cattle are harmed','The egret is harmed'],a:1,w:'Cattle stir up insects; cattle get nothing.'},
 {lv:4,q:'Which statement is true of exponential growth?',o:['It needs limited resources','It gives an S-shaped curve','dN/dt = rN','It has an asymptote at K'],a:2,w:'J-curve with unlimited resources.'},
 {lv:5,open:true,m:3,q:'Draw and explain the exponential and logistic growth curves. Which is more realistic and why?',ans:['Exponential: dN/dt = rN, J-shaped, unlimited resources (1).','Logistic: dN/dt = rN((K − N)/K), S-shaped with lag, acceleration, deceleration, asymptote at K (1).','Logistic is more realistic because resources are always limited (1).']},
 {lv:5,open:true,m:3,q:'What is Gause\'s competitive exclusion principle? How do species manage to coexist? Give an example.',ans:['Two closely related species competing for the same resources cannot coexist indefinitely; the inferior one is eliminated (1).','Resource partitioning: different times or patterns of feeding (1).','MacArthur\'s five warbler species on the same tree (1).']},
 {lv:5,open:true,m:5,q:'List the types of population interactions with +/−/0 signs and give one example of each.',ans:['Mutualism (+,+): lichens / mycorrhizae (1).','Competition (−,−): flamingoes and fishes / Balanus and Chthamalus (1).','Predation (+,−): tiger–deer / moth–prickly pear; parasitism (+,−): Cuscuta, liver fluke (1).','Commensalism (+,0): orchid on mango, barnacles on whale (1).','Amensalism (−,0) (1).']}
];

const ONEMIN=['Population: same species, same area, interbreeding.','Attributes: birth rate, death rate, sex ratio, age pyramid (triangle, bell, urn).','Nₜ₊₁ = Nₜ + [(B + I) − (D + E)].','Exponential: dN/dt = rN, J-curve; Nₜ = N₀e^(rt).','Logistic: dN/dt = rN((K − N)/K), S-curve; K = carrying capacity.','Life history: salmon, bamboo breed once; oysters many small offspring.','Mutualism (+,+): lichens, mycorrhizae, fig–wasp, Ophrys.','Competition (−,−): Gause; Abingdon tortoise; Balanus/Chthamalus; warblers partition.','Predation (+,−): prickly pear moth; Pisaster; prey defences.','Parasitism (+,−): liver fluke, Cuscuta, cuckoo; commensalism (+,0): orchid, egret, barnacles.'];
const KEYS=[['population attributes',/birth|death|natality|mortality|sex ratio/i],['age pyramid',/pyramid/i],['density equation',/immigra|emigra|B\s*\+\s*I/i],['exponential / J-curve',/exponential|j-?shap|rN/i],['logistic / S-curve',/logistic|s-?shap/i],['carrying capacity K',/carrying|\bK\b/],['mutualism',/mutual/i],['competition / Gause',/compet|gause/i],['predation',/predat/i],['parasitism',/parasit/i],['commensalism',/commensal/i]];

/* ---------- lab ---------- */
let tool='grow';
function growDraw(){const N0=+$('#gN').value,r=+$('#gR').value,K=+$('#gK').value,m=$('#gM').value,T=20;const X=t=>50+t*(450/T),Y=N=>290-N*(260/1000);
 let s=`<line x1="50" y1="290" x2="505" y2="290" stroke="${ink}" stroke-width="1.5"/><line x1="50" y1="290" x2="50" y2="20" stroke="${ink}" stroke-width="1.5"/>`+T_(480,315,'time (years)')+T_(30,16,'N');
 for(let t=0;t<=T;t+=5)s+=T_(X(t),306,String(t));for(let n=0;n<=1000;n+=250)s+=T_(32,Y(n)+4,String(n));
 if(m!=='exp')s+=`<line x1="50" y1="${Y(K)}" x2="505" y2="${Y(K)}" stroke="${GR}" stroke-dasharray="5 4"/>`+T_(512,Y(K)+4,'K');
 let de='',dl='',tHit=null;for(let t=0;t<=T;t+=0.1){const Ne=N0*Math.exp(r*t),Nl=K/(1+((K-N0)/N0)*Math.exp(-r*t));if(Ne<=1000)de+=(de?'L':'M')+X(t)+' '+Y(Ne);else if(tHit===null)tHit=t;dl+=(dl?'L':'M')+X(t)+' '+Y(Nl)}
 if(m!=='log')s+=`<path d="${de}" fill="none" stroke="${OR}" stroke-width="3"/>`;if(m!=='exp')s+=`<path d="${dl}" fill="none" stroke="${GR}" stroke-width="3"/>`;
 $('#gS').innerHTML=s;const t10=10,Ne=N0*Math.exp(r*t10),Nl=K/(1+((K-N0)/N0)*Math.exp(-r*t10));
 $('#gOut').innerHTML=`<p><b>After 10 years</b>: exponential N = ${Math.round(Ne).toLocaleString('en-IN')}; logistic N = ${Math.round(Nl)}.</p><p>Exponential: dN/dt = rN = ${r} × N, so growth keeps speeding up (J-curve).</p><p>Logistic: dN/dt = rN(K − N)/K. Growth is fastest at N = K/2 = ${K/2} and stops at K = ${K} (S-curve).</p>`}
function T_(x,y,t){return T(x,y,t,'font-size="12"')}
const EX=[['Fungus and alga in a lichen','mut'],['Fig tree and its pollinating wasp','mut'],['Flamingoes and fishes feeding on zooplankton','com'],['Goats and the Abingdon tortoise','com'],['Cactus-feeding moth and prickly pear','pred'],['Starfish Pisaster and the invertebrates it eats','pred'],['Cuscuta growing on a hedge plant','par'],['Cuckoo laying eggs in a crow\'s nest','par'],['Orchid growing on a mango branch','commens'],['Barnacles on the back of a whale','commens'],['Cattle egret and grazing cattle','commens'],['Mycorrhizal fungi and pine roots','mut']];
const TY={mut:['Mutualism','+ , +'],com:['Competition','− , −'],pred:['Predation','+ , −'],par:['Parasitism','+ , −'],commens:['Commensalism','+ , 0']};
let qi=0,ok=0,done=0,answered=false;
function intDraw(){const e=EX[qi];answered=false;$('#iQ').textContent=e[0];$('#iBtns').innerHTML=Object.entries(TY).map(([k,v])=>`<button class="btn" data-ty="${k}">${v[0]} (${v[1]})</button>`).join('');$('#iFb').innerHTML='';$('#iSc').textContent=done?`Score: ${ok} of ${done}`:''}
function labInit(){}
function labShow(){if(tool==='grow')growDraw();else intDraw()}
function labClick(b){if(b.dataset.tool){tool=b.dataset.tool;$$('[data-tool]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.tool===tool));['grow','int'].forEach(t=>$('#t-'+(t==='grow'?'grow':'int')).hidden=t!==tool);labShow();return true}
 if(b.dataset.ty){if(answered)return true;answered=true;done++;const right=EX[qi][1],good=b.dataset.ty===right;if(good)ok++;$('#iFb').innerHTML=good?`<p class="fb ok">Correct: ${TY[right][0]} (${TY[right][1]}).</p>`:`<p class="fb no">Not quite. It is ${TY[right][0]} (${TY[right][1]}).</p>`;$('#iSc').textContent=`Score: ${ok} of ${done}`;return true}
 if(b.id==='iNext'){qi=(qi+1)%EX.length;intDraw();return true}return false}
function labChange(t){if(['gN','gR','gK','gM'].includes(t.id)){growDraw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
