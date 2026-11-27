/* Rai Plus content pack: Class 9 Social Science – Geography (Contemporary India I), Chapter G4 – Climate. Original summary content. */
RP.register({key:'9sstg4',cls:'9',subject:'Social Science',ch:'G4',title:"Climate",color:'#0f6e7a',
crumb:"Class 9 Social Science · Geography",h1:"Geography · Chapter 4: Climate",sub:"Weather and climate, the controls of climate, factors affecting India's climate, the monsoon mechanism, the four seasons, rainfall distribution, and the monsoon as a unifying bond.",heroLabel:"Monsoon winds reaching India",labName:'Climograph explorer',
theme:"\n:root{--g:light-dark(#0f6e7a,#86d0da);--g2:light-dark(#e6f4f6,#071618);--line:light-dark(#c6e3e7,#1d3d42);--bg:light-dark(#ffffff,#061012);--card:light-dark(#ffffff,#0b1719);\n--ink:light-dark(#0a2226,#dff0f2);--mute:light-dark(#46636a,#a6c4c9);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#0b555e}\n",
labHTML:`  <h2>Climograph explorer</h2>
  <p>A climograph shows monthly rainfall (blue bars) and temperature (orange line) for a place. Compare cities across India, then try "Guess the city". Values are rounded approximate long-term averages, for learning.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="cSvg" viewBox="0 0 460 320" role="img" aria-label="Climograph" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>City<select id="cCity"></select></label></div>
  <div class="ctrl"><label><input type="checkbox" id="cCmp"> Compare with Delhi</label></div>
  <div class="ctrl"><button class="btn" id="cGuess">Guess the city</button></div>
  <div class="ctrl" id="cOpts"></div>
  <div class="box y" id="cOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#0f6e7a',LABNAME='Climograph explorer',MIND_CENTER='Climate of India';
const TL='#0f6e7a',BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const arrow=(x1,y1,x2,y2,c,w=3)=>{const a=Math.atan2(y2-y1,x2-x1),h=9;return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/><path d="M${x2} ${y2} L${x2-h*Math.cos(a-.45)} ${y2-h*Math.sin(a-.45)} L${x2-h*Math.cos(a+.45)} ${y2-h*Math.sin(a+.45)}Z" fill="${c}"/>`};
/* rough outline of India for schematic figures */
const IN='M150 30 L190 25 L215 50 L205 75 L245 85 L300 80 L330 70 L345 85 L320 105 L295 110 L280 135 L250 140 L235 170 L215 205 L195 245 L180 270 L168 250 L155 205 L140 170 L115 160 L95 140 L110 120 L125 100 L140 75 Z';
const india=(o='')=>`<path d="${IN}" fill="${GN}" fill-opacity=".12" stroke="${GN}" stroke-width="2" ${o}/>`;
function heroDraw(){return `<path d="M60 150 Q120 120 170 90" fill="none" stroke="#fff" stroke-width="3"/><path d="M60 110 Q130 90 190 60" fill="none" stroke="#fff" stroke-width="3"/><circle cx="280" cy="60" r="22" fill="none" stroke="#fff" stroke-width="3"/>`+[0,1,2,3].map(k=>`<line x1="${250+k*14}" y1="110" x2="${244+k*14}" y2="130" stroke="#fff" stroke-width="2"/>`).join('')}
const HERO=heroDraw;
const MIND=[['Weather vs climate',100,50],['Controls of climate',420,50],['Monsoon mechanism',90,150],['Four seasons',430,150],['Rainfall pattern',110,250],['Unifying bond',410,250]];

const C=[
{id:'c1',num:'4.1',title:'Weather, climate and the controls of climate',
 intro:'Today it rained in Rewari — is that weather or climate?',
 obj:'Distinguish weather from climate and name the six controls of climate.',
 prior:'Class 7–8: atmosphere, air pressure, winds.',
 simple:'Weather is the state of the atmosphere at a place for a short time (hours or days): temperature, pressure, wind, humidity, rain. Climate is the average pattern of weather over a long period (about 30 years or more). Six main controls decide a place\'s climate: latitude, altitude, pressure and wind system, distance from the sea, ocean currents and relief (mountains).',
 detail:'Latitude: places near the equator get more direct sunlight. Altitude: temperature drops about 6.5 °C for every 1000 m rise, so hill stations are cool. Distance from the sea: coastal places have a moderate (maritime) climate; interior places have extreme (continental) climate. Relief: mountains block winds and cause rain on the windward side and a dry rain-shadow on the leeward side.',
 real:'Mumbai (coast) has a small difference between summer and winter; Delhi (interior) has very hot summers and cold winters.',
 apply:'Why is Shimla cooler than Chandigarh though both are at similar latitude?',
 see:{w:520,h:230,f:[
  ['Weather = short term; climate = long-term average.',lbl(130,40,'Weather: today, this week','font-size="15" fill="'+BL+'"')+lbl(390,40,'Climate: 30+ year average','font-size="15" fill="'+OR+'"')],
  ['Altitude: cooler higher up.',`<path d="M40 210 L130 90 L220 210 Z" fill="${GN}" fill-opacity=".2" stroke="${GN}" stroke-width="2"/>`+lbl(130,80,'cooler')+lbl(130,200,'warmer')],
  ['Relief: rain on the windward side, rain shadow behind.',`<path d="M300 210 L380 100 L460 210 Z" fill="${GR}" fill-opacity=".25" stroke="${GR}" stroke-width="2"/>`+arrow(260,170,345,130,BL)+[0,1,2].map(k=>`<line x1="${330+k*10}" y1="150" x2="${325+k*10}" y2="168" stroke="${BL}" stroke-width="2"/>`).join('')+lbl(330,225,'windward: wet','fill="'+BL+'"')+lbl(450,225,'leeward: dry','fill="'+OR+'"')]]},
 seeNote:'Six controls: latitude, altitude, pressure & winds, distance from sea, ocean currents, relief.',
 do:{title:'Weather diary',mat:'Notebook, school weather data or newspaper',steps:['Record temperature and sky for 7 days.','Compare with your district\'s average for the month.'],obs:'Daily weather varies; the average is steadier.',why:'Climate is an average.',lab:false},
 memo:'"LAPDOR": Latitude, Altitude, Pressure/winds, Distance from sea, Ocean currents, Relief.',
 miscon:['"Weather and climate mean the same." Weather is short-term; climate is long-term average.','"Mountains are always rainy." The leeward side can be dry.'],
 terms:['Weather (मौसम)','Climate (जलवायु)','Continentality','Rain shadow'],
 q:{q:'Climate is the weather averaged over about:',o:['a week','a month','a year','30 years or more'],a:3,why:'Long-term average.'},
 exam:'Weather vs climate; controls of climate: 2–3 marks.'},

{id:'c2',num:'4.2',title:'Factors affecting India\'s climate',
 intro:'India has both snow in Ladakh and steamy heat in Kerala. Why?',
 obj:'Explain how latitude, altitude, pressure, winds and jet streams shape India\'s climate.',
 prior:'4.1.',
 simple:'Latitude: the Tropic of Cancer passes through the middle of India, so the south is tropical and the north is subtropical. Altitude: the Himalayas block cold Central Asian winds, keeping the subcontinent warmer in winter. Pressure and winds: India lies in the zone of north-east trade winds, but its climate is dominated by seasonal reversal of winds — the monsoon.',
 detail:'In winter a high-pressure area forms north of the Himalayas; cold dry winds blow outwards towards the low pressure over the oceans. In summer a low-pressure area develops over interior Asia and north-west India, so winds blow from the oceans to the land. Jet streams — fast, narrow bands of upper-air westerly winds — flow south of the Himalayas in winter and bring western disturbances (winter rain) to north-west India. In summer an easterly jet stream blows over peninsular India and helps the monsoon.',
 real:'Winter rain from western disturbances helps the rabi (wheat) crop in Haryana and Punjab.',
 apply:'How would north India\'s winter change if the Himalayas did not exist?',
 see:{w:520,h:290,f:[
  ['India and the Tropic of Cancer.',india()+`<line x1="60" y1="140" x2="380" y2="140" stroke="${OR}" stroke-dasharray="6 4" stroke-width="2"/>`+lbl(440,145,'Tropic of Cancer','fill="'+OR+'"')],
  ['Himalayas block cold winds from Central Asia.',`<path d="M150 30 L330 70" stroke="${GR}" stroke-width="10" stroke-linecap="round"/>`+arrow(260,5,250,32,BL)+lbl(440,30,'cold winds blocked','fill="'+BL+'"')],
  ['Winter jet stream brings western disturbances.',`<path d="M40 60 Q150 40 260 45 Q330 50 400 40" fill="none" stroke="${PU}" stroke-width="3" stroke-dasharray="8 5"/>`+lbl(440,80,'westerly jet stream','fill="'+PU+'"')+lbl(440,260,'schematic, not to scale','font-size="11" fill="'+GR+'"')]]},
 seeNote:'The Himalayas act as a climatic wall.',
 do:{title:'Atlas work',mat:'Atlas',steps:['Trace the Tropic of Cancer across India.','List the states it passes through.'],obs:'8 states.',why:'Latitude divides tropical and subtropical India.',lab:false},
 memo:'"Tropic in the middle, wall in the north, winds that reverse."',
 miscon:['"All of India is in the tropics." The north lies north of the Tropic of Cancer.'],
 terms:['Tropic of Cancer (कर्क रेखा)','Jet stream','Western disturbances','Trade winds'],
 q:{q:'Western disturbances bring winter rain to:',o:['Kerala','north-west India','Tamil Nadu','north-east India'],a:1,why:'Carried by westerly jet stream.'},
 exam:'Factors affecting India\'s climate: 3 marks.'},

{id:'c3',num:'4.3',title:'The Indian monsoon',
 intro:'Why do winds that blow from land to sea in winter turn around and bring rain in June?',
 obj:'Explain the mechanism, onset, breaks and withdrawal of the monsoon.',
 prior:'4.2; land and sea breezes.',
 simple:'"Monsoon" comes from the Arabic word mausim, meaning season. It is a seasonal reversal of wind direction. In summer the land heats up more than the sea, creating low pressure over north-west India; moist south-west winds blow in from the Indian Ocean and bring rain. In winter the direction reverses.',
 detail:'Factors: differential heating of land and sea; shift of the Inter-Tropical Convergence Zone (ITCZ) northwards over the Ganga plain in summer; high pressure east of Madagascar; heating of the Tibetan plateau; the summer easterly jet stream; El Niño (warm Pacific current) can weaken the monsoon. The Southern Oscillation links pressure over the Indian and Pacific Oceans. Onset: around 1 June in Kerala, covering India by early-to-mid July. "Breaks": dry spells in the rainy season. Withdrawal: begins in north-west India in September; complete by mid-October to early November.',
 real:'IMD announces the monsoon\'s onset over Kerala each year; farmers plan kharif sowing around it.',
 apply:'Why might an El Niño year worry Indian farmers?',
 see:{w:520,h:290,f:[
  ['Summer: land hot → low pressure over north-west India.',india()+lbl(180,100,'LOW','font-size="18" font-weight="700" fill="'+OR+'"')],
  ['Moist south-west winds from the sea.',arrow(60,280,140,200,BL,4)+arrow(260,285,210,220,BL,4)+lbl(52,215,'Arabian Sea branch','fill="'+BL+'" font-size="11"')+lbl(300,265,'Bay of Bengal branch','fill="'+BL+'" font-size="11"')],
  ['Onset ~1 June in Kerala; covers India by July.',`<circle cx="182" cy="262" r="7" fill="${TL}"/>`+lbl(440,140,'Onset: Kerala, ~1 June','fill="'+TL+'"')+lbl(440,165,'All India: ~July')+lbl(440,190,'Withdrawal: Sep–Oct')]]},
 seeNote:'Two branches: Arabian Sea and Bay of Bengal.',
 do:{title:'Land vs water heating',mat:'Two bowls (soil, water), thermometer, sunlight',steps:['Keep both in the Sun for 30 minutes.','Measure temperatures.'],obs:'Soil heats faster.',why:'Differential heating drives the monsoon.',lab:true},
 memo:'"Hot land pulls the wet sea wind."',
 miscon:['"Monsoon means heavy rain." It means seasonal reversal of winds.','"The monsoon arrives everywhere on the same day." It advances over weeks.'],
 terms:['Monsoon (मानसून)','ITCZ','El Niño','Break in monsoon','Onset (आगमन)'],
 q:{q:'The word monsoon comes from mausim, meaning:',o:['rain','wind','season','cloud'],a:2,why:'Arabic for season.'},
 exam:'Mechanism of monsoon; factors: 3–5 marks.'},

{id:'c4',num:'4.4',title:'The four seasons',
 intro:'Why does Chennai get its heaviest rain in October–November when most of India is drying?',
 obj:'Describe the cold, hot, advancing monsoon and retreating monsoon seasons.',
 prior:'4.3.',
 simple:'1. Cold weather season (mid-November to February): cool, dry north-east winds; clear skies; western disturbances give some rain in the north-west; Tamil Nadu coast gets rain from north-east winds over the Bay. 2. Hot weather season (March to May): rising heat in the north; loo (hot dry wind) in the northern plains; pre-monsoon showers. 3. Advancing monsoon (June to September): south-west monsoon rain over most of India. 4. Retreating monsoon (October–November): clear skies, high temperature and humidity ("October heat"); cyclones in the Bay of Bengal; heavy rain on the Coromandel coast.',
 detail:'Local pre-monsoon storms: "mango showers" in Kerala and Karnataka help mangoes ripen; "Kaal Baisakhi" — evening thunderstorms in Bengal and Assam; "blossom showers" help coffee flowers in Kerala. Cyclones of the retreating monsoon can be very destructive along the eastern coast.',
 real:'Haryana: loo in May–June, monsoon rain July–August, foggy cold winter in December–January.',
 apply:'Name the season and region of: loo, mango showers, Kaal Baisakhi, October heat.',
 see:{w:520,h:220,f:[
  ['Cold weather: mid-Nov to Feb.',`<rect x="20" y="60" width="115" height="100" rx="10" fill="${BL}" fill-opacity=".15" stroke="${BL}"/>`+lbl(77,100,'Cold','font-weight="700" fill="'+BL+'"')+lbl(77,125,'Nov–Feb','font-size="11"')],
  ['Hot weather: Mar to May (loo).',`<rect x="145" y="60" width="115" height="100" rx="10" fill="${OR}" fill-opacity=".15" stroke="${OR}"/>`+lbl(202,100,'Hot','font-weight="700" fill="'+OR+'"')+lbl(202,125,'Mar–May','font-size="11"')],
  ['Advancing (Jun–Sep) and retreating (Oct–Nov) monsoon.',`<rect x="270" y="60" width="115" height="100" rx="10" fill="${TL}" fill-opacity=".15" stroke="${TL}"/>`+lbl(327,100,'Monsoon','font-weight="700" fill="'+TL+'"')+lbl(327,125,'Jun–Sep','font-size="11"')+`<rect x="395" y="60" width="115" height="100" rx="10" fill="${PU}" fill-opacity=".15" stroke="${PU}"/>`+lbl(452,100,'Retreating','font-weight="700" fill="'+PU+'"')+lbl(452,125,'Oct–Nov','font-size="11"')+lbl(260,195,'Tamil Nadu: wettest Oct–Dec','fill="'+PU+'"')]]},
 seeNote:'Tamil Nadu coast is wettest when the rest of India dries.',
 do:{title:'Season calendar',mat:'Chart paper',steps:['Draw a 12-month wheel.','Colour the four seasons and add local winds.'],obs:'A climate calendar.',why:'Seasons follow the monsoon.',lab:false},
 memo:'"Cold–Hot–Wet–Retreat."',
 miscon:['"All of India gets most rain in July." Tamil Nadu gets it in Oct–Dec.'],
 terms:['Loo (लू)','Mango showers','Kaal Baisakhi','October heat','Cyclone (चक्रवात)'],
 q:{q:'The loo blows in:',o:['Kerala in winter','northern plains in summer','Assam in autumn','Tamil Nadu in winter'],a:1,why:'Hot dry wind.'},
 exam:'Seasons; local winds: 3–5 marks.'},

{id:'c5',num:'4.5',title:'Distribution of rainfall',
 intro:'Mawsynram gets over 11,000 mm of rain a year; parts of western Rajasthan get under 200 mm. Why so different?',
 obj:'Describe and explain the distribution of rainfall in India.',
 prior:'4.3, 4.4.',
 simple:'Rainfall decreases from east to west in north India and from the west coast to the interior in the peninsula. Heavy (over 200 cm): Western Ghats\' windward slopes, sub-Himalayan areas, north-east hills — Mawsynram (Meghalaya) gets the highest average rainfall in the world. Low (under 60 cm): western Rajasthan, parts of Gujarat, the Deccan interior (rain-shadow), Ladakh.',
 detail:'The Western Ghats force the Arabian Sea branch to rise and rain heavily on the windward (west) side; the Deccan plateau to the east is in the rain shadow. Monsoon rain is uneven and variable: some years bring floods, others drought, so irrigation and water storage matter.',
 real:'Cherrapunji and Mawsynram lie on south-facing slopes of the Khasi hills that trap moist winds.',
 apply:'Why does Mumbai receive much more rain than Pune?',
 see:{w:520,h:290,f:[
  ['India outline.',india()],
  ['Heavy rain: west coast, north-east, Himalayan foothills.',`<path d="M140 170 L155 205 L168 250 L180 270" stroke="${BL}" stroke-width="10" fill="none" opacity=".6"/><circle cx="315" cy="95" r="18" fill="${BL}" opacity=".6"/>`+lbl(440,90,'heavy (>200 cm)','fill="'+BL+'"')],
  ['Low rain: western Rajasthan, Ladakh, Deccan interior.',`<circle cx="115" cy="120" r="22" fill="${OR}" opacity=".45"/><circle cx="185" cy="35" r="14" fill="${OR}" opacity=".45"/><circle cx="200" cy="200" r="15" fill="${OR}" opacity=".35"/>`+lbl(440,140,'low (<60 cm)','fill="'+OR+'"')+lbl(440,260,'schematic, not to scale','font-size="11" fill="'+GR+'"')]]},
 seeNote:'Relief and wind direction decide the rain.',
 do:{title:'Rainfall map',mat:'Outline map of India, atlas',steps:['Shade heavy, moderate and low rainfall areas.','Mark Mawsynram and Jaisalmer.'],obs:'Pattern from the map.',why:'Distribution of rainfall.',lab:false},
 memo:'"East wet, west dry; windward wet, leeward dry."',
 miscon:['"Cherrapunji is the wettest place." Mawsynram nearby has a higher average.'],
 terms:['Rainfall distribution','Windward','Leeward','Variability'],
 q:{q:'Highest average annual rainfall in the world:',o:['Jaisalmer','Mawsynram','Leh','Chennai'],a:1,why:'Meghalaya.'},
 exam:'Rainfall distribution; map work: 3 marks.'},

{id:'c6',num:'4.6',title:'Monsoon as a unifying bond',
 intro:'How can one wind system bind a country with so many climates?',
 obj:'Explain how the monsoon unites India.',
 prior:'4.1–4.5.',
 simple:'The Himalayas protect the whole subcontinent from cold Central Asian winds, and the seasonal rhythm of the monsoon is shared across India. Farmers, festivals and daily life everywhere follow the arrival and retreat of the rains. People from Kerala to Kashmir wait for the monsoon each year.',
 detail:'Agriculture, the economy, water supply and many festivals (sowing and harvest festivals such as Teej, Onam, Pongal, Baisakhi) are linked to the monsoon calendar. Rivers fed by monsoon rain flow across states, connecting regions. This shared dependence gives a sense of unity.',
 real:'Teej in Haryana celebrates the arrival of the monsoon (Sawan).',
 apply:'Give two examples of festivals linked to sowing or harvest.',
 see:{w:520,h:220,f:[
  ['One monsoon…',lbl(260,50,'One monsoon','font-size="20" font-weight="700" fill="'+TL+'"')],
  ['…shapes farming, water and festivals…',['Farming','Water','Festivals','Economy'].map((t,k)=>`<rect x="${30+k*120}" y="90" width="100" height="40" rx="8" fill="${TL}" fill-opacity=".12" stroke="${TL}"/>`+lbl(80+k*120,115,t)).join('')],
  ['…across the whole country.',lbl(260,180,'A shared rhythm unites India','font-size="16" font-weight="700"')]]},
 seeNote:'Shared seasonal rhythm.',
 do:{title:'Festival survey',mat:'Class survey',steps:['List festivals celebrated by classmates\' families.','Mark which are linked to seasons or crops.'],obs:'Many are monsoon-linked.',why:'Unifying bond.',lab:false},
 memo:'"One rain, one rhythm."',
 miscon:['"Climate divides India." The shared monsoon rhythm unites it.'],
 terms:['Unifying bond','Kharif','Rabi'],
 q:{q:'Teej, celebrated in Haryana, welcomes:',o:['winter','the monsoon','harvest of wheat','spring'],a:1,why:'Sawan.'},
 exam:'Monsoon as unifying bond: 3 marks.'}
];

const CARDS=[['Weather','Short-term atmosphere state.'],['Climate','Average weather over 30+ years.'],['Controls','Latitude, altitude, pressure & winds, distance from sea, ocean currents, relief.'],['Himalayas','Block cold winds; climatic wall.'],['Jet stream','Upper-air winds; western disturbances in winter.'],['Monsoon','Seasonal reversal of winds.'],['Onset','Kerala ~1 June; whole country by July.'],['Seasons','Cold, hot, advancing monsoon, retreating monsoon.'],['Local storms','Loo, mango showers, Kaal Baisakhi.'],['Rainfall','Mawsynram wettest; western Rajasthan driest.']];

const Q=[
 {lv:1,q:'Weather refers to:',o:['long-term average','atmosphere at a time','only rainfall','only wind'],a:1,w:'Short term.'},
 {lv:1,q:'The Tropic of Cancer divides India into:',o:['east and west','tropical and subtropical parts','hills and plains','coasts and interior'],a:1,w:'Latitude.'},
 {lv:1,q:'Mango showers occur in:',o:['Punjab','Kerala and Karnataka','Rajasthan','Ladakh'],a:1,w:'Pre-monsoon.'},
 {lv:2,q:'Coastal places have:',o:['extreme climate','moderate climate','no rain','snow'],a:1,w:'Sea moderates.'},
 {lv:2,q:'Loo is:',o:['cold wet wind','hot dry summer wind of northern plains','sea breeze','cyclone'],a:1,w:'Hot weather season.'},
 {lv:2,q:'Coromandel coast gets most rain in:',o:['June–July','October–December','March–April','January'],a:1,w:'Retreating monsoon / NE winds.'},
 {lv:3,q:'Deccan plateau gets less rain because it:',o:['is near the equator','lies in the rain shadow of the Western Ghats','is too high','has no rivers'],a:1,w:'Leeward side.'},
 {lv:3,q:'El Niño tends to:',o:['strengthen the monsoon','weaken the Indian monsoon','cause snowfall','stop western disturbances'],a:1,w:'Warm Pacific current.'},
 {lv:4,q:'Which is a control of climate?',o:['Population','Distance from the sea','Language','Soil colour'],a:1,w:'Continentality.'},
 {lv:4,q:'Western disturbances help which crop?',o:['rice','rabi (wheat)','jute','tea'],a:1,w:'Winter rain.'},
 {lv:5,open:true,m:3,q:'Explain three factors responsible for the Indian monsoon.',ans:['Differential heating of land and sea creates low pressure over NW India (1)','Shift of ITCZ over the Ganga plain; heating of Tibetan plateau (1)','Easterly jet stream / high pressure east of Madagascar; El Niño affects strength (1)']},
 {lv:5,open:true,m:5,q:'Describe the characteristics of the cold weather season in India.',ans:['Mid-November to February; coldest in north (1)','NE trade winds blow land to sea; dry, clear skies (1)','Low temperature, frost in north; temperature rises southwards (1)','Western disturbances bring rain/snow to NW, helping rabi crops (1)','Tamil Nadu coast gets rain from NE winds over the Bay (1)']}
];

const ONEMIN=['Weather vs climate; six controls of climate.','Tropic of Cancer, Himalayas, jet streams.','Monsoon: reversal of winds; ITCZ; El Niño; onset ~1 June.','Seasons: cold, hot, advancing, retreating.','Rainfall: Mawsynram wettest; rain shadow.','Monsoon as a unifying bond.'];
const KEYS=[['weather vs climate',/weather|climate/i],['controls',/latitude|altitude|relief|distance from the sea/i],['monsoon',/monsoon|reversal/i],['ITCZ / El Niño',/ITCZ|El Ni/i],['seasons',/season|loo|cyclone/i],['rainfall',/rainfall|Mawsynram|rain shadow/i]];

/* ---------- lab: climographs (rounded approximate long-term averages) ---------- */
const M='JFMAMJJASOND'.split(''),MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
const CITY={
 'Delhi':{t:[14,17,23,29,33,34,31,30,29,26,20,15],r:[19,20,15,10,30,74,210,230,125,15,5,8],note:'Interior plains: hot summers, cold winters (continental); monsoon rain Jul–Aug.'},
 'Mumbai':{t:[24,25,27,29,30,29,28,27,28,29,28,26],r:[1,1,0,1,15,500,840,530,340,90,15,5],note:'West coast: small temperature range (maritime); very heavy SW monsoon rain.'},
 'Chennai':{t:[25,26,28,31,33,33,31,31,30,28,26,25],r:[25,5,10,15,50,50,90,120,120,280,350,140],note:'Coromandel coast: wettest in Oct–Dec (retreating monsoon / NE winds).'},
 'Jaisalmer':{t:[16,19,25,30,35,35,33,31,31,28,22,17],r:[2,2,3,2,7,20,70,70,25,3,2,2],note:'Thar desert: very little rain; hot summers.'},
 'Leh':{t:[-7,-5,1,6,10,15,18,17,13,6,0,-5],r:[10,8,10,7,7,4,15,15,9,4,3,5],note:'High altitude cold desert: freezing winters, little rain.'},
 'Shillong':{t:[10,12,16,19,20,21,22,22,21,18,14,11],r:[15,30,60,160,300,500,450,350,300,180,35,10],note:'North-east hills: cool due to altitude; heavy monsoon rain.'},
 'Thiruvananthapuram':{t:[27,27,28,29,29,27,27,27,27,27,27,27],r:[25,25,40,120,250,330,215,165,175,290,205,75],note:'Near the equator on the coast: hot all year; rain from both monsoons.'}};
let city='Delhi',cmp=false,guess=null,wired=false;
function graph(name,ghost){const d=CITY[name];const x0=50,x1=420,y0=270,W=(x1-x0)/12;const rmax=900,tmin=-10,tmax=40;const Y=t=>y0-(t-tmin)*(220/(tmax-tmin)),R=r=>y0-Math.min(r,rmax)*220/rmax;let s='';
 if(!ghost){s+=`<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="${ink}"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="40" stroke="${ink}"/><line x1="${x1}" y1="${y0}" x2="${x1}" y2="40" stroke="${ink}"/>`;
  [-10,0,10,20,30,40].forEach(t=>s+=T(x1+16,Y(t)+4,t+'°','font-size="10" fill="'+OR+'"'));[0,300,600,900].forEach(r=>s+=T(x0-20,R(r)+4,String(r),'font-size="10" fill="'+BL+'"'));
  M.forEach((m,k)=>s+=T(x0+W*(k+.5),y0+16,m,'font-size="11"'));s+=T(30,30,'mm','font-size="10" fill="'+BL+'"')+T(430,30,'°C','font-size="10" fill="'+OR+'"')}
 d.r.forEach((r,k)=>s+=`<rect x="${x0+W*k+(ghost?W*.55:4)}" y="${R(r)}" width="${ghost?W*.35:W*(cmp?.5:1)-8}" height="${y0-R(r)}" fill="${ghost?GR:BL}" opacity="${ghost?.45:.65}"/>`);
 s+=`<polyline points="${d.t.map((t,k)=>(x0+W*(k+.5))+','+Y(t)).join(' ')}" fill="none" stroke="${ghost?GR:OR}" stroke-width="${ghost?2:3}" ${ghost?'stroke-dasharray="5 4"':''}/>`;
 if(!ghost)d.t.forEach((t,k)=>s+=`<circle cx="${x0+W*(k+.5)}" cy="${Y(t)}" r="3" fill="${OR}"/>`);return s}
function stats(n){const d=CITY[n];const tot=d.r.reduce((a,b)=>a+b,0),rng=Math.max(...d.t)-Math.min(...d.t);const wet=MN[d.r.indexOf(Math.max(...d.r))];return {tot,rng,wet}}
function draw(){const name=guess?guess.ans:city;let s=graph(name);if(cmp&&!guess&&name!=='Delhi')s+=graph('Delhi',true);
 s+=T(235,22,guess?'Which city is this?':name,'font-size="15" font-weight="700"');$('#cSvg').innerHTML=s;
 if(guess)return;const st=stats(city);$('#cOut').innerHTML=`<p><b>${city}</b>: annual rainfall ≈ ${st.tot} mm; wettest month: ${st.wet}; temperature range ≈ ${st.rng} °C.</p><p>${CITY[city].note}</p>${cmp&&city!=='Delhi'?'<p>Grey = Delhi, for comparison.</p>':''}`}
function labShow(){const sel=$('#cCity');if(sel&&!sel.options.length)sel.innerHTML=Object.keys(CITY).map(c=>`<option>${c}</option>`).join('');draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-city]');if(!b||!guess)return;const ok=b.dataset.city===guess.ans;$('#cOut').innerHTML=ok?`<p class="fb ok">Correct — ${guess.ans}. ${CITY[guess.ans].note}</p>`:`<p class="fb no">Not quite — it was ${guess.ans}. ${CITY[guess.ans].note}</p>`;$('#cOpts').innerHTML='';const n=guess.ans;guess=null;city=n;$('#cCity').value=n;draw()})}
function labClick(b){if(b.id==='cGuess'){const ks=Object.keys(CITY);const ans=ks[Math.floor(Math.random()*ks.length)];const opts=[ans,...ks.filter(k=>k!==ans).sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5);guess={ans};$('#cOpts').innerHTML=opts.map(o=>`<button class="btn" data-city="${o}" type="button">${o}</button>`).join(' ');$('#cOut').innerHTML='<p>Study the bars and line: total rain, wettest month, temperature range. Then pick a city.</p>';draw();return true}return false}
function labChange(t){if(t.id==='cCity'){city=t.value;guess=null;$('#cOpts').innerHTML='';draw();return true}if(t.id==='cCmp'){cmp=t.checked;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
