/* Rai Plus content pack: Class 6 Science (Curiosity), Chapter 8 – A Journey through States of Water. Bilingual terms. */
RP.register({key:'6sci08',cls:'6',subject:'Science',ch:'8',title:"A Journey through States of Water",color:'#185fa5',
crumb:"Class 6 Science · Curiosity · जल की अवस्थाओं की यात्रा",h1:"Chapter 8: A Journey through States of Water",sub:"जल की अवस्थाओं की यात्रा. Ice, water and vapour; evaporation, condensation, and the water cycle.",heroLabel:"Ice cube, water drop and vapour with clouds and rain",labName:'Drying lab',
theme:"\n:root{--g:light-dark(#185fa5,#9cc8f0);--g2:light-dark(#e8f1fa,#0c1724);--line:light-dark(#cfe0f1,#22364b);--bg:light-dark(#ffffff,#090f17);--card:light-dark(#ffffff,#0e1620);\n--ink:light-dark(#0e1a26,#e2ecf6);--mute:light-dark(#4b5f72,#a4b8cb);--y:light-dark(#b3541e,#f2a774);--y2:light-dark(#fbeee4,#2a170a);--hd:#12477c}\n",
labHTML:`  <h2>Drying lab · सुखाने की प्रयोगशाला</h2>
  <p>Change the conditions and see how fast a wet cloth dries.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="eSvg" viewBox="0 0 460 300" role="img" aria-label="Wet cloth drying" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Temperature: <b id="eTv"></b><input type="range" class="eS" id="eT" min="10" max="45" value="30"></label></div><div class="ctrl"><label>Spread of cloth<select id="eA"><option value="1">Folded</option><option value="2" selected>Half open</option><option value="3">Fully spread</option></select></label></div><div class="ctrl"><label>Wind<select id="eW"><option value="1">Still air</option><option value="2" selected>Light breeze</option><option value="3">Windy</option></select></label></div><div class="ctrl"><label>Humidity<select id="eH"><option value="1">Dry day</option><option value="2" selected>Normal</option><option value="3">Rainy/humid day</option></select></label></div><div class="box y" id="eOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#185fa5',LABNAME='Drying lab',MIND_CENTER='Water · जल';
const BL='#185fa5',LB='#9cc8f0',OR='#b3541e',GR='#888780',GN='#3b6d11',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const vap=(x,y,n=3)=>[...Array(n)].map((_,i)=>`<path d="M${x+i*14} ${y} q-6 -10 0 -20 q6 -10 0 -20" fill="none" stroke="${GR}" stroke-width="2"/>`).join('');
const cloud=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="0" r="20" fill="#dfe6ee"/><circle cx="22" cy="-8" r="24" fill="#dfe6ee"/><circle cx="46" cy="0" r="20" fill="#dfe6ee"/><rect x="0" y="0" width="46" height="18" fill="#dfe6ee"/></g>`;
function heroDraw(){return `<rect x="30" y="70" width="34" height="34" rx="5" fill="#fff" opacity=".8"/><path d="M110 100 q14 -36 28 0 q-14 14 -28 0z" fill="#fff"/><path d="M180 100 q-8 -14 0 -28 q8 -14 0 -28" fill="none" stroke="#fff" stroke-width="3"/><circle cx="240" cy="40" r="16" fill="#fff" opacity=".8"/><circle cx="260" cy="34" r="18" fill="#fff" opacity=".8"/>`}
const HERO=heroDraw;
const MIND=[['Three states',100,50],['Evaporation',420,50],['What speeds it up',90,150],['Cooling by evaporation',430,150],['Condensation',110,250],['Water cycle',410,250]];

const C=[
{id:'v1',num:'8.1',title:'Three states of water · जल की तीन अवस्थाएँ',
 intro:'A cube of ice, a glass of water and the steam from a kettle: what is the same about them?',
 obj:'Describe the three states of water and the changes between them.',
 prior:'Water boils at 100 °C and freezes at 0 °C (Ch 1, Ch 7).',
 simple:'Water exists as a solid (ice), a liquid (water) and a gas (water vapour, जलवाष्प). Ice has a fixed shape; liquid water takes the shape of its container; water vapour spreads to fill all the space available. Melting (पिघलना): ice → water. Freezing (जमना): water → ice. Evaporation (वाष्पन): water → vapour. Condensation (संघनन): vapour → water.',
 detail:'Melting happens when ice is heated; freezing when water is cooled to 0 °C. Water vapour is invisible; the white "steam" seen above a kettle is actually tiny droplets formed when vapour cools. The amount of water does not change when it changes state: melted ice gives water of the same mass.',
 real:'Ice in a glass of nimbu-paani melts as it takes heat from the drink.',
 apply:'Name the change: (a) ice cream melting (b) water in a freezer (c) wet roads drying.',
 see:{w:520,h:220,f:[
  ['Ice: fixed shape.',`<rect x="40" y="90" width="70" height="70" rx="8" fill="${LB}" stroke="${BL}"/>`+lbl(75,190,'ice · बर्फ')],
  ['Water: takes the shape of the container.',`<path d="M200 80 v80 a8 8 0 0 0 8 8 h64 a8 8 0 0 0 8 -8 v-80" fill="none" stroke="${ink}" stroke-width="2"/><rect x="202" y="110" width="76" height="56" fill="${BL}" opacity=".5"/>`+lbl(240,190,'water · जल')],
  ['Vapour: spreads everywhere.',vap(400,150,3)+lbl(415,190,'vapour · जलवाष्प')+lbl(155,60,'melting →','font-size="12"')+lbl(330,60,'evaporation →','font-size="12"')]]},
 seeNote:'Same water, three states.',
 do:{title:'Ice to water',mat:'Ice cubes in a closed steel tumbler',steps:['Note the ice.','Leave it 30 minutes; note the water.','Look at the outside of the tumbler.'],obs:'Ice melts; droplets form outside.',why:'Melting inside; condensation outside.',lab:false},
 memo:'"Melt up, freeze down; evaporate out, condense back."',
 miscon:['"Steam you see is water vapour." Visible steam is tiny droplets; vapour is invisible.'],
 terms:['Solid · ठोस','Liquid · द्रव','Water vapour · जलवाष्प','Melting · पिघलना','Freezing · जमना'],
 q:{q:'Water vapour changing to liquid water is:',o:['evaporation','condensation','melting','freezing'],a:1,why:'Definition.'},
 exam:'Name the changes of state: 2 marks.'},

{id:'v2',num:'8.2',title:'Evaporation · वाष्पन',
 intro:'Wet clothes dry on a line without being boiled. Where does the water go?',
 obj:'Explain evaporation and the factors that change its rate.',
 prior:'States of water (8.1).',
 simple:'Evaporation is the slow change of liquid water into water vapour at any temperature, from its surface. Wet clothes drying, a mopped floor drying and puddles disappearing are examples. Evaporation is faster when: (1) the temperature is higher; (2) the surface area is larger (spread out); (3) there is wind; (4) the air is less humid (drier).',
 detail:'Humidity (आर्द्रता) is the amount of water vapour in the air. On rainy, humid days clothes take longer to dry because the air already holds a lot of vapour. A puddle shrinks both by evaporation and by seeping into the ground. Salt is made from sea water by letting water evaporate in shallow pans in the sun.',
 real:'Clothes dry fastest on a sunny, windy day when spread fully on the line.',
 apply:'Why do clothes dry slowly in the monsoon?',
 see:{w:520,h:220,f:[
  ['A wet cloth on a line.',`<line x1="40" y1="60" x2="480" y2="60" stroke="${ink}"/><rect x="200" y="60" width="120" height="80" fill="${LB}" stroke="${BL}"/>`],
  ['Water leaves as vapour from the surface.',vap(220,55,6)],
  ['Faster with heat, spreading, wind and dry air.',`<circle cx="70" cy="140" r="22" fill="#f2b632"/>`+`<path d="M380 120 h60 M380 135 h50" stroke="${GR}" stroke-width="2"/>`+lbl(260,200,'heat · area · wind · dry air','font-weight="700"')]]},
 seeNote:'Evaporation happens at any temperature.',
 do:{title:'Two plates',mat:'Two equal spoons of water, a cup and a plate',steps:['Put one in a cup and one spread on a plate.','Keep both in the same place.','Check every 30 minutes.'],obs:'The plate dries first.',why:'Larger surface area.',lab:true},
 memo:'"Hot, wide, windy, dry: water says goodbye."',
 miscon:['"Water evaporates only when it boils." It evaporates at any temperature.','"Humid air dries clothes faster." It slows drying.'],
 terms:['Evaporation · वाष्पन','Surface area · पृष्ठ क्षेत्रफल','Humidity · आर्द्रता','Wind · पवन'],
 q:{q:'Clothes dry fastest when:',o:['folded on a humid day','spread out on a sunny, windy day','kept in a box','kept in shade on a rainy day'],a:1,why:'All factors favourable.'},
 exam:'Factors affecting evaporation: 2–3 marks.'},

{id:'v3',num:'8.3',title:'Cooling by evaporation · वाष्पन से ठंडक',
 intro:'Why does water in an earthen matka stay cool in summer?',
 obj:'Explain that evaporation causes cooling, with everyday examples.',
 prior:'Evaporation (8.2).',
 simple:'Evaporating water takes heat from its surroundings, so the surroundings cool down. Sweat evaporating from our skin cools us. Water seeps through tiny pores of a matka and evaporates from its outer surface, cooling the water inside. Sprinkling water on a hot floor or roof cools it.',
 detail:'A fan cools us by speeding up the evaporation of sweat. After a bath we feel cold until the body dries. Desert coolers and wet khus curtains work on the same idea. On humid days sweat evaporates slowly, so we feel sticky and less cool.',
 real:'In Haryana villages, people sprinkle water in courtyards on hot summer evenings to cool them.',
 apply:'Why do we feel cooler under a fan even though it doesn\'t cool the air?',
 see:{w:520,h:220,f:[
  ['A matka with water.',`<path d="M200 60 q-60 40 -40 110 q60 30 120 0 q20 -70 -40 -110z" fill="#c87533" stroke="${ink}"/><rect x="225" y="45" width="30" height="20" fill="#c87533" stroke="${ink}"/>`],
  ['Water seeps out and evaporates from the surface.',vap(150,120,2)+vap(310,120,2)+[0,1,2,3,4].map(i=>`<circle cx="${170+i*25}" cy="${150}" r="3" fill="${BL}"/>`).join('')],
  ['Evaporation takes heat: water inside stays cool.',lbl(240,205,'evaporation → cooling','font-weight="700"')]]},
 seeNote:'The same idea cools us when we sweat.',
 do:{title:'Wet cloth thermometer',mat:'Two thermometers, wet cotton, a fan',steps:['Wrap wet cotton around one thermometer bulb.','Place both in front of a fan for 5 minutes.','Compare readings.'],obs:'The wrapped one reads lower.',why:'Evaporation cools.',lab:true},
 memo:'"Evaporation steals heat."',
 miscon:['"A fan cools the air." It speeds evaporation of sweat; the air is not much cooler.'],
 terms:['Cooling · ठंडक','Sweat · पसीना','Matka · मटका','Pores · छिद्र'],
 q:{q:'A matka keeps water cool because:',o:['clay is cold','water evaporates from its surface','it is kept in shade only','it has ice'],a:1,why:'Cooling by evaporation.'},
 exam:'Examples of cooling by evaporation: 2 marks.'},

{id:'v4',num:'8.4',title:'Condensation · संघनन',
 intro:'Where do the water drops on the outside of a cold glass come from?',
 obj:'Explain condensation and give examples.',
 prior:'Water vapour in air (8.2).',
 simple:'Condensation is the change of water vapour into liquid water when it touches a cold surface. Droplets on the outside of a glass of cold water, on a cold bottle from the fridge, and on grass and leaves on winter mornings come from water vapour in the air.',
 detail:'The droplets on the outside of a cold glass are not leaking from inside: the outside gets wet even if the inside holds coloured water and the drops stay colourless. Fog, mist on a bathroom mirror and the "steam" above a kettle are tiny droplets formed by condensation. Condensation is the reverse of evaporation.',
 real:'On winter mornings in north India, droplets cover grass and car windows.',
 apply:'How can you show that the drops on a cold glass come from the air?',
 see:{w:520,h:220,f:[
  ['A glass of ice-cold coloured water.',`<path d="M200 50 l12 140 h96 l12 -140z" fill="none" stroke="${ink}" stroke-width="2"/><path d="M204 90 l9 98 h94 l9 -98z" fill="#e88a8a" opacity=".6"/><rect x="230" y="100" width="22" height="22" fill="#fff" opacity=".8"/>`],
  ['Vapour in the air touches the cold surface.',vap(140,130,2)+vap(360,130,2)],
  ['It condenses into colourless drops on the outside.',[0,1,2,3,4,5].map(i=>`<circle cx="${i%2?327:193}" cy="${90+i*16}" r="4" fill="${LB}" stroke="${BL}"/>`).join('')+lbl(260,212,'vapour → water: condensation','font-weight="700"')]]},
 seeNote:'Drops are colourless: they came from the air.',
 do:{title:'Cold glass',mat:'Steel glass, ice, food colour',steps:['Fill with coloured ice water.','Wait 5 minutes.','Wipe a drop from outside with white paper.'],obs:'Colourless drops outside.',why:'Condensation of air\'s water vapour.',lab:true},
 memo:'"Cold surface catches vapour."',
 miscon:['"The glass leaks." The water comes from the air.'],
 terms:['Condensation · संघनन','Droplets · बूँदें','Fog · कोहरा'],
 q:{q:'Water drops on the outside of a cold bottle come from:',o:['inside the bottle','water vapour in the air','the fridge','plastic'],a:1,why:'Condensation.'},
 exam:'Explain droplets on a cold glass: 2 marks.'},

{id:'v5',num:'8.5',title:'The water cycle · जल चक्र',
 intro:'The water you drink may once have been in the sea, a cloud and a river. How?',
 obj:'Describe the water cycle and the need to save water.',
 prior:'Evaporation and condensation.',
 simple:'Water from oceans, rivers, lakes, soil and plants evaporates. The vapour rises, cools high up and condenses on tiny dust particles into droplets that form clouds. Droplets join to form bigger drops that fall as rain (or snow, hail). Water flows back into rivers and seas or soaks into the ground. This continuous circulation is the water cycle (जल चक्र).',
 detail:'Plants also give out water vapour through their leaves. Only a small part of Earth\'s water is fresh and usable; most is salty sea water or frozen ice. So we must use water carefully, avoid wasting it, keep water bodies clean, and harvest rainwater.',
 real:'Rainwater harvesting tanks on school rooftops store monsoon rain for later use.',
 apply:'Draw the water cycle and label evaporation, condensation and rain.',
 see:{w:520,h:250,f:[
  ['Sun heats water in the sea.',`<circle cx="470" cy="40" r="24" fill="#f2b632"/><path d="M20 200 q60 -10 120 0 t120 0 v40 h-240z" fill="${BL}" opacity=".5"/>`+lbl(120,235,'sea')],
  ['Evaporation: vapour rises.',vap(100,190,4)+`<path d="M120 150 v-70" stroke="${GR}" stroke-dasharray="4 3"/>`+lbl(60,120,'evaporation','font-size="12"')],
  ['Condensation: clouds form.',cloud(200,60)+cloud(300,50,0.8)],
  ['Rain falls and flows back.',[0,1,2,3,4].map(i=>`<line x1="${310+i*12}" y1="90" x2="${304+i*12}" y2="120" stroke="${BL}" stroke-width="2"/>`).join('')+`<path d="M480 130 L380 160 L300 200" fill="none" stroke="${ink}"/><path d="M470 140 C420 170 340 190 250 205" fill="none" stroke="${BL}" stroke-width="3"/>`+lbl(400,175,'rain → rivers → sea','font-size="12"')]]},
 seeNote:'The cycle never stops.',
 do:{title:'Water cycle in a bowl',mat:'A bowl of warm water, cling film, ice cube',steps:['Cover the bowl with cling film; put an ice cube on top.','Watch for 15 minutes in sunlight.'],obs:'Droplets form under the film and drip back.',why:'Evaporation, condensation, "rain".',lab:false},
 memo:'"Up as vapour, cool into clouds, down as rain."',
 miscon:['"Clouds are water vapour." Clouds are tiny water droplets (or ice).','"Water is unlimited." Usable fresh water is small.'],
 terms:['Water cycle · जल चक्र','Cloud · बादल','Rain · वर्षा','Rainwater harvesting · वर्षा जल संचयन'],
 q:{q:'Clouds are formed by:',o:['evaporation only','condensation of water vapour','melting','freezing of the sea'],a:1,why:'Cooling vapour forms droplets.'},
 exam:'Draw and explain the water cycle: 3 marks.'}
];

const CARDS=[['Three states','Ice (solid), water (liquid), vapour (gas).'],['Melting / freezing','Solid ↔ liquid.'],['Evaporation','Liquid → vapour at any temperature.'],['Faster evaporation','Higher temperature, larger area, wind, low humidity.'],['Humidity · आर्द्रता','Amount of water vapour in air.'],['Cooling by evaporation','Sweat, matka, fan, sprinkling water.'],['Condensation','Vapour → liquid on cold surface.'],['Water cycle','Evaporation → condensation (clouds) → rain → rivers/sea.'],['Save water','Little usable fresh water; harvest rain.']];

const Q=[
 {lv:1,q:'Solid form of water:',o:['vapour','ice','steam','dew'],a:1,w:'Ice.'},
 {lv:1,q:'Liquid → gas at the surface at any temperature:',o:['condensation','evaporation','freezing','melting'],a:1,w:'Evaporation.'},
 {lv:1,q:'Drops on a cold glass are due to:',o:['evaporation','condensation','melting','leaking'],a:1,w:'Vapour condenses.'},
 {lv:2,q:'Clothes dry slowly when the air is:',o:['dry','humid','windy','hot'],a:1,w:'High humidity.'},
 {lv:2,q:'A matka cools water by:',o:['condensation','evaporation','melting','freezing'],a:1,w:'Evaporation takes heat.'},
 {lv:2,q:'Spreading water on a plate makes it evaporate faster because of:',o:['more surface area','less heat','humidity','colour'],a:0,w:'Area.'},
 {lv:3,q:'Why do we feel cool after a bath?',o:['water is cold','evaporation of water from skin takes heat','air is cold','soap'],a:1,w:'Cooling by evaporation.'},
 {lv:3,q:'Correct order in the water cycle:',o:['rain → evaporation → clouds','evaporation → clouds → rain','clouds → evaporation → rain','rain → clouds → evaporation'],a:1,w:'Sequence.'},
 {lv:4,q:'Coloured ice water in a glass; drops outside are colourless. This shows:',o:['the glass leaks','drops come from vapour in the air','colour evaporates','ice melts outside'],a:1,w:'Condensation.'},
 {lv:4,q:'A fan makes us feel cooler mainly because it:',o:['makes air very cold','speeds up evaporation of sweat','adds humidity','blows heat in'],a:1,w:'Evaporation.'},
 {lv:5,open:true,m:3,q:'Name four factors that affect the rate of evaporation and how.',ans:['Higher temperature → faster (1)','Larger surface area and more wind → faster (1)','Higher humidity → slower (1)']},
 {lv:5,open:true,m:3,q:'Explain how clouds and rain are formed.',ans:['Water evaporates from seas, rivers, soil, plants (1)','Vapour rises, cools and condenses around dust into droplets → clouds (1)','Droplets join, become heavy and fall as rain (1)']}
];

const ONEMIN=['Ice, water, vapour; melting, freezing, evaporation, condensation.','Evaporation at any temperature; faster with heat, area, wind, dry air.','Humidity slows drying.','Evaporation cools: sweat, matka, fan.','Condensation: vapour → water on cold surfaces.','Water cycle: evaporation → clouds → rain.','Save water: little is usable.'];
const KEYS=[['three states',/ice|vapour|solid|liquid|gas/i],['evaporation',/evaporat|वाष्पन/i],['factors',/temperature|area|wind|humid/i],['cooling',/cool|matka|sweat/i],['condensation',/condens|संघनन/i],['water cycle',/cycle|cloud|rain|चक्र/i],['save water',/save|harvest/i]];

/* ---------- lab ---------- */
let tt=30,ar=2,wi=2,hu=2;
function draw(){const rate=(0.4+tt/30)*(0.5+ar*0.35)*(0.6+wi*0.4)/(0.5+hu*0.45);const hrs=Math.max(0.3,6/rate);
 const w=ar===1?60:ar===2?100:150;let s=`<line x1="20" y1="60" x2="440" y2="60" stroke="${ink}"/><rect x="${230-w/2}" y="60" width="${w}" height="${ar===1?110:90}" fill="${LB}" stroke="${BL}"/>`+vap(230-w/2+10,55,Math.min(8,Math.round(rate*2)));
 s+=`<circle cx="60" cy="230" r="${10+tt/3}" fill="#f2b632"/>`+T(60,290,tt+' °C','font-size="12"');for(let i=0;i<wi;i++)s+=`<path d="M${340} ${200+i*16} h${40+i*10}" stroke="${GR}" stroke-width="2"/>`;s+=T(370,290,['still','breeze','windy'][wi-1],'font-size="12"');for(let i=0;i<hu*3;i++)s+=`<circle cx="${180+i*14}" cy="${250+(i%2)*10}" r="3" fill="${BL}" opacity=".5"/>`;s+=T(220,290,['dry air','normal','humid'][hu-1],'font-size="12"');
 $('#eSvg').innerHTML=s;$('#eTv').textContent=tt+' °C';$('#eOut').innerHTML=`<p>Estimated drying time: <b>${hrs<1?Math.round(hrs*60)+' minutes':hrs.toFixed(1)+' hours'}</b></p><p>${hrs<1.5?'Fast drying: warm, spread, windy, dry air.':hrs>5?'Slow drying: try spreading the cloth, more wind, a warmer or drier day.':'Moderate drying.'}</p><p class="note">Simple model for comparison only.</p>`}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='eT')labChange(e.target)})}
function labClick(){return false}
function labChange(t){switch(t.id){case 'eT':tt=+t.value;draw();return true;case 'eA':ar=+t.value;draw();return true;case 'eW':wi=+t.value;draw();return true;case 'eH':hu=+t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
