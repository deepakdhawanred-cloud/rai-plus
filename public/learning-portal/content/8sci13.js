/* Rai Plus content pack: Class 8 Science (Curiosity), Chapter 13 – Our Home: Earth, a Unique Life Sustaining Planet. */
RP.register({key:'8sci13',cls:'8',subject:'Science',ch:'13',title:"Our Home: Earth, a Unique Life Sustaining Planet",color:'#1f5f8b',
crumb:"Class 8 Science · Curiosity",h1:"Chapter 13: Our Home — Earth, a Unique Life Sustaining Planet",sub:"The habitable zone, liquid water, a protective atmosphere and magnetic field, Earth among the planets, how life continues through reproduction, and the threats we must tackle.",heroLabel:"Earth with its atmosphere in the habitable zone",labName:'Habitable zone explorer',
theme:"\n:root{--g:light-dark(#1f5f8b,#8fc2e6);--g2:light-dark(#e8f1f8,#0b1622);--line:light-dark(#cde0ee,#22384b);--bg:light-dark(#ffffff,#081018);--card:light-dark(#ffffff,#0d1620);\n--ink:light-dark(#0d1d2a,#e1ecf5);--mute:light-dark(#475d70,#a7bccd);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#174a6d}\n",
labHTML:`  <h2>Habitable zone explorer</h2>
  <p>Move a planet closer to or farther from the Sun and give it a thin, Earth-like or very thick atmosphere. See its rough average temperature and whether water would be ice, liquid or steam. Then compare the real planets. (A simplified model for learning.)</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="hzSvg" viewBox="0 0 460 320" role="img" aria-label="Habitable zone" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Distance from Sun (Earth = 1): <b id="hzDv"></b><input type="range" class="hzS" id="hzD" min="0.3" max="2.0" step="0.05" value="1"></label></div>
  <div class="ctrl"><label>Atmosphere<select id="hzA"><option value="0">None / very thin</option><option value="1" selected>Earth-like</option><option value="2">Very thick (CO₂)</option></select></label></div>
  <div class="ctrl"><label>Real planet<select id="hzP"><option value="">— choose —</option><option value="0.39,0">Mercury</option><option value="0.72,2">Venus</option><option value="1,1">Earth</option><option value="1.52,0">Mars</option></select></label></div>
  <div class="box y" id="hzOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#1f5f8b',LABNAME='Habitable zone explorer',MIND_CENTER='Unique Earth';
const BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',GD='#e0a800',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
const arr=(x1,y1,x2,y2,c=GR,w=2)=>{const a=Math.atan2(y2-y1,x2-x1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/><path d="M${x2} ${y2} L${x2-8*Math.cos(a-.45)} ${y2-8*Math.sin(a-.45)} L${x2-8*Math.cos(a+.45)} ${y2-8*Math.sin(a+.45)}Z" fill="${c}"/>`};
function heroDraw(){return `<circle cx="190" cy="80" r="40" fill="none" stroke="#fff" stroke-width="3"/><circle cx="190" cy="80" r="52" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="4 4"/>`}
const HERO=heroDraw;
const MIND=[['Habitable zone',100,50],['Liquid water',420,50],['Atmosphere & ozone',90,150],['Magnetic field & size',430,150],['Continuity of life',110,250],['Threats & care',410,250]];

const C=[
{id:'e1',num:'13.1',title:'The habitable zone',
 intro:'Venus is closer to the Sun and Mars is farther. Why is Earth, in between, the one full of life?',
 obj:'Explain the habitable ("Goldilocks") zone around a star.',
 prior:'Class 6: solar system; Ch 11 Earth\'s motions.',
 simple:'The habitable zone is the region around a star where a planet could have the right temperature for liquid water on its surface — not too hot, not too cold. Earth lies in the Sun\'s habitable zone at about 15 crore km (150 million km). Mercury and Venus are too hot; Mars is at the cold edge; outer planets are far too cold.',
 detail:'Distance is not the only factor: Venus has a thick carbon dioxide atmosphere that traps heat, making its surface about 460 °C — hotter than Mercury. Mars has a very thin atmosphere and is very cold (average about −60 °C). Earth\'s average is about 15 °C. Scientists search for planets around other stars (exoplanets) in habitable zones.',
 real:'ISRO\'s Mangalyaan (2014) studied Mars\'s thin atmosphere.',
 apply:'Why is Venus hotter than Mercury though it is farther from the Sun?',
 see:{w:520,h:220,f:[
  ['The Sun.',`<circle cx="30" cy="110" r="60" fill="${GD}"/>`],
  ['Zones: too hot, just right, too cold.',`<rect x="100" y="40" width="110" height="140" fill="${OR}" opacity=".15"/><rect x="210" y="40" width="120" height="140" fill="${GN}" opacity=".18"/><rect x="330" y="40" width="180" height="140" fill="${BL}" opacity=".12"/>`+lbl(155,60,'too hot','fill="'+OR+'"')+lbl(270,60,'habitable zone','fill="'+GN+'" font-weight="700"')+lbl(420,60,'too cold','fill="'+BL+'"')],
  ['Mercury, Venus, Earth, Mars.',[['M',120,4],['V',180,9],['E',260,10],['Ma',335,6]].map(([n,x,r])=>`<circle cx="${x}" cy="120" r="${r}" fill="${n==='E'?BL:GR}"/>`+lbl(x,150,n,'font-size="11"')).join('')]]},
 seeNote:'Just the right distance — and atmosphere.',
 do:{title:'Lamp distance',mat:'Lamp, three thermometers',steps:['Place thermometers at 20, 50 and 100 cm from a lamp.','Read after 10 minutes.'],obs:'Closer is hotter.',why:'Distance affects temperature.',lab:true},
 memo:'"Not too hot, not too cold — just right for water."',
 miscon:['"The closest planet is always the hottest." Venus is hotter than Mercury because of its atmosphere.'],
 terms:['Habitable zone · जीवन योग्य क्षेत्र','Exoplanet · बाह्यग्रह','Goldilocks zone'],
 q:{q:'The hottest planet surface in our solar system is:',o:['Mercury','Venus','Mars','Earth'],a:1,why:'Thick CO₂ atmosphere.'},
 exam:'Habitable zone: 2 marks.'},

{id:'e2',num:'13.2',title:'Water: the liquid of life',
 intro:'About 71% of Earth\'s surface is water. Why does life need it so much?',
 obj:'Explain why liquid water is essential for life and how much is usable.',
 prior:'13.1; Ch 9 solutions.',
 simple:'Liquid water is essential: life began in water; cells are mostly water; water dissolves nutrients and carries them; it helps control body temperature. Earth has water as solid (ice), liquid and vapour, and the water cycle moves it around. But about 97% is salty ocean water; only about 3% is fresh, and most of that is locked in ice caps and glaciers — less than 1% is easily usable.',
 detail:'Water heats and cools slowly, so oceans keep Earth\'s climate moderate. Ice floats, so lakes freeze from the top and life survives below. Groundwater is a key freshwater source in Haryana but its levels are falling in many districts because of over-pumping.',
 real:'Rainwater harvesting and drip irrigation help save Haryana\'s falling groundwater.',
 apply:'Why is fresh water called a precious resource though Earth has so much water?',
 see:{w:520,h:220,f:[
  ['All water on Earth.',`<rect x="40" y="60" width="400" height="50" fill="${BL}" opacity=".55"/>`+lbl(240,90,'oceans (salty) ~97%','fill="#fff" font-weight="700"')],
  ['Fresh water ~3%.',`<rect x="440" y="60" width="14" height="50" fill="${GN}"/>`+lbl(450,130,'fresh ~3%','font-size="11" fill="'+GN+'"')],
  ['Mostly ice; less than 1% easily usable.',lbl(260,180,'most fresh water is ice; <1% easily usable','font-weight="700"')]]},
 seeNote:'Plenty of water, little to drink.',
 do:{title:'Bucket model',mat:'10 L bucket, measuring spoon',steps:['Let 10 L represent all water.','Remove 300 mL for fresh water; then a few spoonfuls for usable water.'],obs:'Tiny amount usable.',why:'Freshwater scarcity.',lab:false},
 memo:'"97 salty, 3 fresh, 1 usable."',
 miscon:['"Most of Earth\'s water is drinkable." Most is salty or frozen.'],
 terms:['Fresh water · मीठा पानी','Groundwater · भूजल','Water cycle · जल चक्र'],
 q:{q:'About how much of Earth\'s water is salty?',o:['3%','50%','97%','71%'],a:2,why:'Oceans.'},
 exam:'Importance and scarcity of water: 2–3 marks.'},

{id:'e3',num:'13.3',title:'A protective blanket: the atmosphere',
 intro:'What stops Earth from freezing at night like the Moon, and from being burnt by ultraviolet rays?',
 obj:'Describe how the atmosphere supports and protects life.',
 prior:'13.1; Ch 6 air pressure.',
 simple:'Earth\'s atmosphere is about 78% nitrogen, 21% oxygen and small amounts of argon, carbon dioxide and water vapour. It gives oxygen for breathing and CO₂ for photosynthesis. Greenhouse gases (CO₂, water vapour, methane) trap some heat, keeping Earth warm (natural greenhouse effect). The ozone layer high up absorbs harmful ultraviolet (UV) rays. The atmosphere also burns up most meteors.',
 detail:'Without the greenhouse effect, Earth\'s average temperature would be about −18 °C instead of about 15 °C. Too much CO₂ from burning fuels strengthens the effect and causes global warming. Chemicals like CFCs (from old fridges and sprays) damaged the ozone layer; the Montreal Protocol (1987) banned them and the ozone layer is slowly recovering.',
 real:'The Moon has no atmosphere: its surface swings from about 120 °C in sunlight to about −170 °C at night.',
 apply:'Why would Earth be much colder without greenhouse gases?',
 see:{w:520,h:240,f:[
  ['Earth and its atmosphere.',`<circle cx="260" cy="240" r="140" fill="${BL}" opacity=".5"/><circle cx="260" cy="240" r="175" fill="none" stroke="${BL}" stroke-width="16" opacity=".15"/><circle cx="260" cy="240" r="200" fill="none" stroke="${PU}" stroke-width="5" opacity=".5"/>`+lbl(430,60,'ozone layer','fill="'+PU+'"')],
  ['Ozone blocks UV.',arr(90,10,150,70,PU,2.5)+`<line x1="150" y1="70" x2="160" y2="80" stroke="${PU}" stroke-width="3"/>`+lbl(70,30,'UV','fill="'+PU+'"')],
  ['Greenhouse gases keep heat in.',`<path d="M260 100 q-20 -30 0 -50 q20 -20 0 -40" fill="none" stroke="${OR}" stroke-width="2.5"/>`+lbl(110,130,'heat trapped → warm Earth','fill="'+OR+'"')]]},
 seeNote:'Air to breathe, warmth, and a UV shield.',
 do:{title:'Mini greenhouse',mat:'Two jars, thermometers, plastic cover',steps:['Cover one jar; keep both in sunlight.','Compare temperatures after 20 minutes.'],obs:'Covered jar warmer.',why:'Heat trapping.',lab:false},
 memo:'"Breathe, warm, shield."',
 miscon:['"The greenhouse effect is always bad." The natural effect keeps Earth habitable; excess causes warming.'],
 terms:['Atmosphere · वायुमंडल','Ozone layer · ओज़ोन परत','Greenhouse effect · हरितगृह प्रभाव','Ultraviolet rays · पराबैंगनी किरणें'],
 q:{q:'The ozone layer protects us from:',o:['infrared heat','ultraviolet rays','radio waves','visible light'],a:1,why:'Absorbs UV.'},
 exam:'Role of atmosphere: 3 marks.'},

{id:'e4',num:'13.4',title:'Magnetic shield, size and gravity',
 intro:'Why don\'t charged particles from the Sun strip away our air, as happened to Mars?',
 obj:'Explain how Earth\'s magnetic field, size and gravity help sustain life, and compare Earth with other planets.',
 prior:'13.3; Ch 5 gravity; Ch 4 magnetism.',
 simple:'Earth has a magnetic field (as if a giant bar magnet were inside) that deflects most harmful charged particles from the Sun (solar wind) — they create auroras near the poles. Earth\'s size gives it enough gravity to hold on to its atmosphere and water. Mars, smaller with a weak magnetic field, lost most of its air over time.',
 detail:'Earth is the largest of the four rocky (terrestrial) planets: Mercury, Venus, Earth, Mars. Jupiter, Saturn, Uranus and Neptune are giant planets made mostly of gas or ice, without solid surfaces like ours. Earth\'s tilted axis gives seasons; its rotation gives day and night; its Moon steadies the tilt.',
 real:'Compasses work because of Earth\'s magnetic field — the same field that shields us.',
 apply:'Give two reasons why Mars cannot support life as Earth does.',
 see:{w:520,h:220,f:[
  ['Earth\'s magnetic field.',`<circle cx="300" cy="110" r="40" fill="${BL}"/>`+[50,70,90].map(r=>`<ellipse cx="300" cy="110" rx="${r+20}" ry="${r}" fill="none" stroke="${PU}" stroke-width="1.5" opacity=".6"/>`).join('')],
  ['Solar wind is deflected.',[50,90,130,170].map(y=>`<path d="M40 ${y} Q180 ${y} ${y<110?200:200} ${y<110?y-40:y+40}" fill="none" stroke="${GD}" stroke-width="2"/>`).join('')+lbl(80,30,'solar wind','fill="'+GD+'"')],
  ['Size and gravity hold the air.',lbl(440,200,'gravity holds air and water','fill="'+GN+'" font-weight="700"')]]},
 seeNote:'Invisible shields protect life.',
 do:{title:'Planet table',mat:'Data cards',steps:['Compare size, distance, atmosphere and temperature of 4 rocky planets.'],obs:'Only Earth has all conditions.',why:'Unique Earth.',lab:false},
 memo:'"Magnet shield, right size, right spot."',
 miscon:['"Gravity is the same on all planets." It depends on mass and size.'],
 terms:['Magnetic field · चुंबकीय क्षेत्र','Solar wind · सौर पवन','Aurora · ध्रुवीय ज्योति','Terrestrial planet · स्थलीय ग्रह'],
 q:{q:'Mars lost most of its atmosphere partly because it has:',o:['too much water','a weak magnetic field and low gravity','rings','two Suns'],a:1,why:'Weak shield.'},
 exam:'Features that sustain life: 3 marks.'},

{id:'e5',num:'13.5',title:'Life continues: reproduction',
 intro:'Every living thing eventually dies. How does life on Earth carry on for millions of years?',
 obj:'Describe asexual and sexual reproduction as ways life continues.',
 prior:'Ch 2 cells and microbes; Class 7 plants.',
 simple:'Reproduction is the process by which living things produce new individuals of their own kind, so that species continue. Asexual reproduction involves one parent; offspring are identical copies — binary fission in bacteria and Amoeba, budding in yeast and Hydra, spores in fungi, vegetative propagation in plants (potato eyes, rose cuttings). Sexual reproduction involves two parents producing male and female gametes that fuse (fertilisation) to form a zygote; offspring show variation.',
 detail:'Asexual reproduction is fast and needs no partner, but offspring are all alike, so a single disease can wipe them out. Sexual reproduction is slower but creates variety, helping species adapt to changing environments. Flowering plants reproduce sexually through pollination and seeds; many animals lay eggs (oviparous) or give birth to young (viviparous).',
 real:'Farmers grow sugarcane and potatoes from stem pieces — vegetative propagation.',
 apply:'Why might a population produced by sexual reproduction survive a new disease better?',
 see:{w:520,h:220,f:[
  ['Asexual: one parent splits.',`<circle cx="70" cy="110" r="22" fill="${GN}" opacity=".6"/>`+arr(95,110,130,110)+`<circle cx="155" cy="95" r="15" fill="${GN}" opacity=".6"/><circle cx="155" cy="128" r="15" fill="${GN}" opacity=".6"/>`+lbl(110,180,'binary fission: identical')],
  ['Sexual: two gametes fuse.',`<circle cx="310" cy="80" r="8" fill="${BL}"/><circle cx="310" cy="140" r="14" fill="${OR}" opacity=".7"/>`+arr(320,85,370,105)+arr(325,135,370,115)+`<circle cx="395" cy="110" r="18" fill="${PU}" opacity=".6"/>`+lbl(395,145,'zygote','font-size="11"')],
  ['Variation helps species adapt.',lbl(360,190,'sexual → variation','font-weight="700" fill="'+PU+'"')]]},
 seeNote:'One parent copies; two parents mix.',
 do:{title:'Grow a potato plant',mat:'Potato with eyes, pot of soil',steps:['Cut a piece with an eye; plant it.','Water and observe for 2 weeks.'],obs:'A shoot grows.',why:'Vegetative propagation.',lab:false},
 memo:'"One parent = copies; two parents = variety."',
 miscon:['"Plants reproduce only by seeds." Many also reproduce vegetatively.'],
 terms:['Reproduction · जनन','Asexual · अलैंगिक','Sexual · लैंगिक','Binary fission · द्विखंडन','Budding · मुकुलन','Fertilisation · निषेचन','Zygote · युग्मनज'],
 q:{q:'Yeast reproduces asexually by:',o:['fertilisation','budding','pollination','seeds'],a:1,why:'Budding.'},
 exam:'Asexual vs sexual reproduction: 3 marks.'},

{id:'e6',num:'13.6',title:'Threats to life on Earth — and what we can do',
 intro:'Earth sustained life for billions of years. Could human actions upset this balance in just a few hundred?',
 obj:'Identify major threats to Earth\'s life-support systems and actions to reduce them.',
 prior:'13.1–13.5; Ch 12 conservation.',
 simple:'Threats: air pollution (vehicles, industries, crop-residue burning), water pollution, plastic waste, deforestation, loss of biodiversity, overuse of groundwater, and climate change from excess greenhouse gases — causing heatwaves, melting glaciers, rising seas and erratic rainfall. Actions: use public transport and cycles, save electricity, switch to renewable energy (solar, wind), plant native trees, reduce–reuse–recycle, avoid burning crop residue and waste, save water.',
 detail:'India\'s commitments include expanding solar power, the National Clean Air Programme and Mission LiFE (Lifestyle for Environment), which encourages simple daily actions. Stubble burning in Haryana and Punjab worsens winter smog in north India; alternatives include happy seeders and turning residue into compost or fuel pellets.',
 real:'Rooftop solar panels on schools and homes in Haryana cut electricity bills and emissions.',
 apply:'Suggest three things your school can do to reduce its impact on Earth.',
 see:{w:520,h:220,f:[
  ['Threats.',box(20,40,220,60,'Threats',OR,'pollution · deforestation · climate change')],
  ['Actions.',box(280,40,220,60,'Actions',GN,'renewables · trees · 3 Rs · save water')],
  ['Mission LiFE.',lbl(260,160,'small daily actions × many people = big change','font-size="14" font-weight="700"')]]},
 seeNote:'Our planet, our responsibility.',
 do:{title:'Carbon diary',mat:'Notebook',steps:['For a week, note travel mode, electricity use, plastic used.','Pick two habits to change.'],obs:'Personal impact.',why:'Mission LiFE.',lab:false},
 memo:'"Reduce, reuse, recycle, replant, renew."',
 miscon:['"One person can\'t make a difference." Collective small actions matter.'],
 terms:['Climate change · जलवायु परिवर्तन','Global warming · वैश्विक तापन','Renewable energy · नवीकरणीय ऊर्जा','Biodiversity · जैव विविधता','Mission LiFE'],
 q:{q:'Which reduces greenhouse gas emissions?',o:['burning crop residue','using solar power','more private cars','cutting forests'],a:1,why:'Renewable.'},
 exam:'Threats and solutions: 3–5 marks.'}
];

const CARDS=[['Habitable zone','Right distance for liquid water.'],['Venus','Hottest: thick CO₂ atmosphere.'],['Water','97% salty; <1% easily usable.'],['Atmosphere','78% N₂, 21% O₂.'],['Greenhouse effect','Keeps Earth ~15 °C (not −18 °C).'],['Ozone layer','Absorbs UV; Montreal Protocol.'],['Magnetic field','Deflects solar wind.'],['Asexual reproduction','One parent; identical offspring.'],['Sexual reproduction','Two parents; variation.'],['Threats','Pollution, deforestation, climate change.']];

const Q=[
 {lv:1,q:'Earth\'s atmosphere is mostly:',o:['oxygen','nitrogen','carbon dioxide','hydrogen'],a:1,w:'78%.'},
 {lv:1,q:'The ozone layer absorbs:',o:['UV rays','oxygen','water vapour','heat only'],a:0,w:'UV.'},
 {lv:1,q:'Binary fission is a type of:',o:['sexual reproduction','asexual reproduction','pollination','fertilisation'],a:1,w:'One parent.'},
 {lv:2,q:'Without greenhouse gases, Earth\'s average temperature would be about:',o:['15 °C','−18 °C','100 °C','0 °C'],a:1,w:'Too cold.'},
 {lv:2,q:'Which planet lies in the Sun\'s habitable zone?',o:['Mercury','Earth','Jupiter','Neptune'],a:1,w:'Earth.'},
 {lv:2,q:'Fresh water easily available to us is:',o:['about 50%','less than 1%','about 97%','about 10%'],a:1,w:'Scarce.'},
 {lv:3,q:'Venus is hotter than Mercury because:',o:['it is closer','its thick CO₂ atmosphere traps heat','it has oceans','it spins fast'],a:1,w:'Greenhouse.'},
 {lv:3,q:'Variation among offspring results from:',o:['budding','binary fission','sexual reproduction','spore formation'],a:2,w:'Two parents.'},
 {lv:4,q:'Earth\'s magnetic field helps life by:',o:['heating the core','deflecting harmful solar particles','making rain','creating seasons'],a:1,w:'Shield.'},
 {lv:4,q:'An alternative to stubble burning:',o:['burning at night','happy seeder / composting residue','throwing in rivers','spraying chemicals'],a:1,w:'Sustainable.'},
 {lv:5,open:true,m:3,q:'Give three features that make Earth suitable for life.',ans:['In the habitable zone: right temperature for liquid water (1)','Atmosphere with oxygen, greenhouse warmth and ozone UV shield (1)','Magnetic field and right size/gravity hold atmosphere and water (1)']},
 {lv:5,open:true,m:5,q:'Describe five actions students can take to protect Earth.',ans:['Save electricity; use renewables (1)','Walk/cycle/public transport (1)','Reduce, reuse, recycle; avoid single-use plastic (1)','Save water; rainwater harvesting (1)','Plant native trees; don\'t burn waste (1)']}
];

const ONEMIN=['Habitable zone.','Water: 97% salty, little usable.','Atmosphere: oxygen, greenhouse warmth, ozone.','Magnetic field, size and gravity.','Asexual and sexual reproduction.','Threats and actions (Mission LiFE).'];
const KEYS=[['habitable zone',/habitable|goldilocks/i],['water',/water/i],['atmosphere',/atmosphere|ozone|greenhouse/i],['magnetic',/magnetic|gravity/i],['reproduction',/reproduc|fission|budding/i],['threats',/pollution|climate|threat/i]];

/* ---------- lab ---------- */
let D=1,A=1,wired=false;
function temp(){const base=255/Math.sqrt(D)-273;const gh=[0,33,480][A];return Math.round(base+gh*(A===2?Math.min(1,1/D):1))}
function draw(){const t=temp();const st=t<0?'ice':t<100?'liquid':'steam';let s=`<rect x="0" y="0" width="460" height="320" fill="#0d1030"/><circle cx="-20" cy="160" r="70" fill="${GD}"/>`;
 const X=d=>40+d*200;s+=`<rect x="${X(.95)}" y="40" width="${X(1.37)-X(.95)}" height="240" fill="${GN}" opacity=".18"/>`+T((X(.95)+X(1.37))/2,30,'habitable zone (approx.)','font-size="10" fill="#a8d77d"');
 [['Mercury',.39],['Venus',.72],['Earth',1],['Mars',1.52]].forEach(([n,d])=>s+=`<line x1="${X(d)}" y1="270" x2="${X(d)}" y2="280" stroke="#888"/>`+T(X(d),295,n,'font-size="9" fill="#aaa"'));
 const px=X(D);s+=`<circle cx="${px}" cy="160" r="22" fill="${st==='liquid'?BL:st==='ice'?'#dfe9f2':'#c9a26b'}"/>`;if(A>0)s+=`<circle cx="${px}" cy="160" r="${A===2?34:28}" fill="none" stroke="#9cc8ee" stroke-width="${A===2?8:3}" opacity=".5"/>`;
 s+=T(px,120,`${t} °C`,'font-size="16" font-weight="700" fill="#fff"')+T(px,210,`water: ${st}`,'font-size="13" font-weight="700" fill="'+(st==='liquid'?'#a8d77d':'#f2a77f')+'"');
 $('#hzSvg').innerHTML=s;$('#hzDv').textContent=D.toFixed(2);
 $('#hzOut').innerHTML=`<p>Rough average temperature: <b>${t} °C</b> — water would be <b>${st}</b>.</p><p>${st==='liquid'?'Liquid water is possible — a key condition for life as we know it.':A===2&&t>100?'A thick CO₂ atmosphere traps so much heat that the surface is scorching — like Venus.':A===0&&t<0?'Without an atmosphere\'s greenhouse warming, it is frozen — like Mars.':st==='ice'?'Too far and too cold: water freezes.':'Too hot: water boils away.'}</p><p>This model is very simplified; real planets also depend on clouds, oceans and more.</p>`}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='hzD'){D=+e.target.value;draw()}})}
function labClick(){return false}
function labChange(t){if(t.id==='hzA'){A=+t.value;draw();return true}if(t.id==='hzP'&&t.value){const [d,a]=t.value.split(',').map(Number);D=d;A=a;$('#hzD').value=d;$('#hzA').value=a;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
