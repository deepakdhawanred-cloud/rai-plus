/* Rai Plus content pack: Class 8 Science (Curiosity), Chapter 6 – Pressure, Winds, Storms, and Cyclones. */
RP.register({key:'8sci06',cls:'8',subject:'Science',ch:'6',title:"Pressure, Winds, Storms, and Cyclones",color:'#1f5f8b',
crumb:"Class 8 Science · Curiosity",h1:"Chapter 6: Pressure, Winds, Storms, and Cyclones",sub:"Pressure as force on an area, pressure in liquids, air pressure, how uneven heating makes winds, thunderstorms, cyclones, and staying safe.",heroLabel:"A swirling cyclone with an eye",labName:'Pressure and wind lab',
theme:"\n:root{--g:light-dark(#1f5f8b,#8fc2e6);--g2:light-dark(#e8f1f8,#0b1622);--line:light-dark(#cde0ee,#22384b);--bg:light-dark(#ffffff,#081018);--card:light-dark(#ffffff,#0d1620);\n--ink:light-dark(#0d1d2a,#e1ecf5);--mute:light-dark(#475d70,#a7bccd);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#174a6d}\n",
labHTML:`  <h2>Pressure and wind lab</h2>
  <p>Area mode: the same force on a smaller area gives more pressure — watch how deep a block sinks into sand. Depth mode: water spurts from holes in a bottle — deeper holes, stronger jets. Wind mode: heat land or sea and watch air move from high to low pressure.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="wSvg" viewBox="0 0 460 320" role="img" aria-label="Pressure experiment" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="wM"><option value="a">Force and area</option><option value="d">Water depth</option><option value="w">Sea and land breeze</option></select></label></div>
  <div class="ctrl" id="wA"><label>Force (N): <b id="wFv"></b><input type="range" class="wS" id="wF" min="10" max="100" step="10" value="50"></label> <label>Area (cm²): <b id="wAv"></b><input type="range" class="wS" id="wAr" min="1" max="50" value="25"></label></div>
  <div class="ctrl" id="wD" style="display:none"><label>Water level: <b id="wLv"></b><input type="range" class="wS" id="wL" min="20" max="100" step="10" value="100"></label></div>
  <div class="ctrl" id="wW" style="display:none"><label>Time<select id="wT"><option value="day">Daytime (land hotter)</option><option value="night">Night (sea warmer)</option></select></label></div>
  <div class="box y" id="wOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#1f5f8b',LABNAME='Pressure and wind lab',MIND_CENTER='Pressure & weather';
const BL='#1f5f8b',OR='#b04a1f',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
const arr=(x1,y1,x2,y2,c=GR,w=3)=>{const a=Math.atan2(y2-y1,x2-x1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/><path d="M${x2} ${y2} L${x2-10*Math.cos(a-.45)} ${y2-10*Math.sin(a-.45)} L${x2-10*Math.cos(a+.45)} ${y2-10*Math.sin(a+.45)}Z" fill="${c}"/>`};
function spiral(cx,cy,r,c=BL){let s='';for(let k=0;k<4;k++){let p='';for(let t=0;t<=1;t+=.05){const a=k*Math.PI/2+t*2.6,rr=r*(.25+.75*t);p+=(t?'L':'M')+(cx+rr*Math.cos(a)).toFixed(1)+' '+(cy+rr*Math.sin(a)).toFixed(1)}s+=`<path d="${p}" fill="none" stroke="${c}" stroke-width="3" opacity=".7"/>`}return s+`<circle cx="${cx}" cy="${cy}" r="${r*.18}" fill="#fff" stroke="${c}" stroke-width="2"/>`}
function heroDraw(){let s='';for(let k=0;k<4;k++){let p='';for(let t=0;t<=1;t+=.05){const a=k*Math.PI/2+t*2.6,r=15+50*t;p+=(t?'L':'M')+(190+r*Math.cos(a)).toFixed(1)+' '+(80+r*Math.sin(a)).toFixed(1)}s+=`<path d="${p}" fill="none" stroke="#fff" stroke-width="3"/>`}return s}
const HERO=heroDraw;
const MIND=[['Pressure = force/area',100,50],['Liquid pressure',420,50],['Air pressure',90,150],['Winds',430,150],['Thunderstorms',110,250],['Cyclones & safety',410,250]];

const C=[
{id:'w1',num:'6.1',title:'Pressure: force on an area',
 intro:'Why does a sharp knife cut easily, and why do camels walk on sand without sinking?',
 obj:'Define pressure and relate it to force and area.',
 prior:'Ch 5: force, newton.',
 simple:'Pressure is the force acting on a unit area of a surface: pressure = force ÷ area. The same force on a smaller area gives more pressure; on a larger area, less pressure. Unit: newton per square metre (N/m²), called pascal (Pa).',
 detail:'Sharp knives and needles have tiny areas → high pressure → easy cutting. Wide straps on school bags, broad tyres on tractors and the wide feet of camels spread the force → low pressure. A 600 N person standing on two feet (0.04 m²) exerts 15,000 Pa; on one foot, 30,000 Pa.',
 real:'Tractors in Haryana fields have broad rear tyres so they don\'t sink into soft soil.',
 apply:'A box weighs 200 N and its base is 0.5 m². Find the pressure it exerts.',
 see:{w:520,h:220,f:[
  ['Same force, big area: low pressure.',`<rect x="60" y="100" width="140" height="40" fill="${BL}" opacity=".5"/><rect x="30" y="140" width="200" height="50" fill="#e8d7a8"/>`+lbl(130,210,'large area → low pressure')],
  ['Same force, small area: high pressure.',`<rect x="355" y="70" width="30" height="80" fill="${OR}" opacity=".6"/><rect x="290" y="140" width="160" height="50" fill="#e8d7a8"/><rect x="355" y="140" width="30" height="20" fill="${OR}" opacity=".6"/>`+lbl(370,210,'small area → high pressure','fill="'+OR+'"')],
  ['P = F ÷ A',lbl(260,40,'pressure = force ÷ area','font-size="18" font-weight="700"')]]},
 seeNote:'Smaller area, more pressure.',
 do:{title:'Sand test',mat:'Tray of sand, brick',steps:['Place a brick flat, then on its end.','Compare the dents.'],obs:'Deeper on end.',why:'Smaller area.',lab:true},
 memo:'"Sharp and narrow presses hard."',
 miscon:['"Pressure and force are the same." Pressure depends on area too.'],
 terms:['Pressure · दाब','Area · क्षेत्रफल','Pascal (Pa) · पास्कल','Thrust · प्रणोद'],
 q:{q:'Pressure increases when:',o:['area increases','area decreases (same force)','force decreases','nothing changes'],a:1,why:'P = F/A.'},
 exam:'Pressure numericals: 2–3 marks.'},

{id:'w2',num:'6.2',title:'Pressure in liquids',
 intro:'Why are dams built thicker at the bottom than at the top?',
 obj:'Explain that liquids exert pressure in all directions and that it increases with depth.',
 prior:'6.1.',
 simple:'Liquids exert pressure on the walls and base of their container and on anything inside them — in all directions. Pressure increases with depth: water spurts farther from a hole near the bottom of a bottle than from one near the top. At the same depth, pressure is the same in all directions.',
 detail:'Dams are thicker at the base to withstand the greater pressure at depth. Divers feel more pressure the deeper they go. Water from an overhead tank flows with more force on the ground floor than on upper floors.',
 real:'Bhakra Dam on the Sutlej is very thick at its base.',
 apply:'Why does water come out faster from a tap on the ground floor than the top floor?',
 see:{w:520,h:240,f:[
  ['A bottle full of water with three holes.',`<rect x="120" y="30" width="80" height="190" rx="10" fill="${BL}" opacity=".25" stroke="${ink}" stroke-width="2"/>`],
  ['Deeper hole → stronger jet.',[[70,40],[130,85],[190,135]].map(([y,d])=>`<path d="M200 ${y} Q${200+d/2} ${y} ${200+d} 230" fill="none" stroke="${BL}" stroke-width="3"/>`).join('')],
  ['Dams are thicker at the base.',`<polygon points="400,40 440,40 490,220 360,220" fill="${GR}" opacity=".5"/>`+lbl(425,235,'dam')]]},
 seeNote:'Deeper = more pressure.',
 do:{title:'Bottle holes',mat:'Plastic bottle, nail (adult help), water',steps:['Make three holes at different heights.','Fill with water; watch jets.'],obs:'Bottom jet goes farthest.',why:'Pressure increases with depth.',lab:true},
 memo:'"Deeper, stronger push."',
 miscon:['"Liquids push only downwards." They push in all directions.'],
 terms:['Liquid pressure · द्रव दाब','Depth · गहराई','Dam · बाँध'],
 q:{q:'Liquid pressure is greatest:',o:['at the surface','at the bottom','in the middle only','same everywhere'],a:1,why:'Increases with depth.'},
 exam:'Liquid pressure and depth: 2 marks.'},

{id:'w3',num:'6.3',title:'Air pressure',
 intro:'How can air — which we cannot see — crush an empty can?',
 obj:'Show that air exerts pressure and describe its effects.',
 prior:'6.2.',
 simple:'Air has weight and exerts pressure on everything — atmospheric pressure. We don\'t feel it because the pressure inside our bodies balances it. A sucker sticks to a smooth wall because air pressure outside pushes it when air is pressed out from underneath. Drinking with a straw works because air pressure pushes the liquid up when you reduce pressure inside the straw.',
 detail:'Air pressure decreases with height: it is lower on mountains, so breathing is harder and water boils at a lower temperature. A barometer measures air pressure; weather reports use it. When a heated can of steam is sealed and cooled, the inside pressure drops and outside air crushes it.',
 real:'Our ears "pop" in an aeroplane or on a hill road as the air pressure changes.',
 apply:'Explain how a rubber sucker sticks to glass.',
 see:{w:520,h:220,f:[
  ['Air pushes from all sides.',`<rect x="190" y="70" width="140" height="90" rx="8" fill="none" stroke="${ink}" stroke-width="2"/>`+[[260,30,260,65],[260,200,260,165],[140,115,185,115],[380,115,335,115]].map(a=>arr(...a,BL,3)).join('')],
  ['Inside pressure balances it.',lbl(260,120,'inside = outside','font-size="12"')],
  ['Remove inside air → outside air crushes.',lbl(260,210,'remove air inside → can is crushed','fill="'+OR+'" font-weight="700"')]]},
 seeNote:'Air pressure is all around.',
 do:{title:'Card trick',mat:'Glass of water, postcard',steps:['Fill a glass, cover with card, turn over (over a sink).'],obs:'Card stays.',why:'Air pressure pushes up.',lab:false},
 memo:'"Air pushes everywhere."',
 miscon:['"Suction pulls things." Actually air pressure pushes.'],
 terms:['Atmospheric pressure · वायुमंडलीय दाब','Barometer · वायुदाबमापी','Sucker · चूषक'],
 q:{q:'A straw works because:',o:['the mouth pulls liquid','air pressure pushes liquid up','liquid is light','straw is narrow'],a:1,why:'Air pressure.'},
 exam:'Effects of air pressure: 2 marks.'},

{id:'w4',num:'6.4',title:'How winds blow',
 intro:'At the seaside, why does a cool breeze blow from the sea in the afternoon?',
 obj:'Explain wind as air moving from high to low pressure due to uneven heating.',
 prior:'6.3; heat (Class 7).',
 simple:'Wind is moving air. Air moves from a region of high pressure to a region of low pressure; the greater the difference, the faster the wind. When air is heated it expands, becomes lighter and rises, leaving low pressure below; cooler air rushes in. Uneven heating of the Earth\'s surface causes winds.',
 detail:'Sea breeze (day): land heats faster than sea → air over land rises → cool air from the sea blows in. Land breeze (night): land cools faster → air over the sea is warmer and rises → air flows from land to sea. On a larger scale, uneven heating between the equator and poles, and between land and ocean, drives global winds and the monsoon (summer: moist winds from sea to land).',
 real:'The monsoon winds bring rain to Haryana in July–August.',
 apply:'Why does a sea breeze blow during the day?',
 see:{w:520,h:240,f:[
  ['Day: land hot, sea cool.',`<rect x="20" y="170" width="230" height="50" fill="#d9b98a"/><rect x="270" y="170" width="230" height="50" fill="${BL}" opacity=".5"/>`+lbl(135,200,'land (hot)')+lbl(385,200,'sea (cool)')],
  ['Hot air rises over land (low pressure).',arr(135,160,135,70,OR)+lbl(70,110,'LOW','fill="'+OR+'" font-weight="700"')],
  ['Cool sea air blows in: sea breeze.',arr(385,70,385,155,BL)+arr(370,150,160,150,BL)+lbl(450,110,'HIGH','fill="'+BL+'" font-weight="700"')+lbl(265,140,'sea breeze','fill="'+BL+'"')]]},
 seeNote:'High to low, driven by heat.',
 do:{title:'Candle convection',mat:'Candle, incense stick (teacher)',steps:['Hold smoking incense near a lit candle.'],obs:'Smoke rises above the flame.',why:'Hot air rises.',lab:true},
 memo:'"Heat lifts air; air rushes in."',
 miscon:['"Wind blows from low to high pressure." It is high to low.'],
 terms:['Wind · पवन','High pressure · उच्च दाब','Low pressure · निम्न दाब','Sea breeze · समुद्री समीर','Land breeze · स्थल समीर'],
 q:{q:'At night, the breeze at the seaside blows:',o:['from sea to land','from land to sea','upward only','no wind'],a:1,why:'Land cools faster.'},
 exam:'Sea and land breezes: 3 marks.'},

{id:'w5',num:'6.5',title:'Thunderstorms',
 intro:'Why do summer afternoons in north India sometimes end with sudden dark clouds, lightning and strong winds?',
 obj:'Explain how thunderstorms form and how to stay safe in lightning.',
 prior:'6.4.',
 simple:'In hot, humid weather, warm moist air rises rapidly. As it rises it cools, and water vapour condenses into tall thunderclouds. Rising and falling air, water drops and ice inside the cloud create electric charges. A huge spark between charges is lightning; the rapid heating of air makes the sound of thunder. Strong winds and heavy rain follow.',
 detail:'Light travels faster than sound, so we see lightning before hearing thunder: count seconds and divide by 3 to estimate distance in km. Lightning safety: stay indoors; avoid open fields, tall trees and water; don\'t use wired phones or touch metal; if caught outside, crouch low on your toes. Lightning conductors on tall buildings carry charge safely to the ground. Dust storms (aandhi) in Haryana and Rajasthan occur in May–June.',
 real:'IMD issues thunderstorm and lightning warnings; the Damini app gives lightning alerts.',
 apply:'You see lightning and hear thunder 6 seconds later. About how far away is the storm?',
 see:{w:520,h:240,f:[
  ['Warm moist air rises.',arr(140,220,140,140,OR)+arr(200,220,200,140,OR)],
  ['Tall thundercloud forms.',`<path d="M80 130 q20 -60 80 -50 q20 -60 80 -20 q60 -20 70 40 q30 10 20 30 H80 Z" fill="${GR}" opacity=".6"/>`],
  ['Lightning and thunder.',`<path d="M270 135 l-15 30 h15 l-20 40" fill="none" stroke="#e6b800" stroke-width="4"/>`+lbl(400,80,'stay indoors','fill="'+GN+'" font-weight="700"')+lbl(400,105,'avoid trees and open fields','fill="'+GN+'"')+lbl(400,130,'count seconds ÷ 3 = km','fill="'+BL+'"')]]},
 seeNote:'Rising humid air → storm.',
 do:{title:'Lightning distance',mat:'Watch',steps:['During a storm (indoors), count seconds between flash and thunder.'],obs:'Distance in km ≈ seconds ÷ 3.',why:'Sound is slower than light.',lab:false},
 memo:'"When thunder roars, go indoors."',
 miscon:['"Standing under a tree is safe in lightning." Trees attract lightning.'],
 terms:['Thunderstorm · तड़ित झंझा','Lightning · तड़ित','Thunder · गरज','Lightning conductor · तड़ित चालक'],
 q:{q:'In a lightning storm, the safest place is:',o:['under a tall tree','inside a building','in an open field','in a pond'],a:1,why:'Shelter.'},
 exam:'Thunderstorm formation and safety: 3 marks.'},

{id:'w6',num:'6.6',title:'Cyclones and staying safe',
 intro:'How does a storm over the Bay of Bengal grow into a giant spinning cyclone hundreds of kilometres wide?',
 obj:'Describe how cyclones form, their structure, and safety measures.',
 prior:'6.4, 6.5.',
 simple:'Over warm oceans (about 26 °C or more), warm moist air rises, creating very low pressure. Surrounding air rushes in, and because the Earth rotates, it starts to spin. Rising air cools, releasing heat as vapour condenses, which strengthens the storm. A cyclone has a calm centre — the eye — surrounded by a wall of violent winds and heavy rain.',
 detail:'Cyclones bring very strong winds, heavy rain, flooding and storm surges (sea water flooding the coast). India\'s east coast (Odisha, Andhra Pradesh, Tamil Nadu, West Bengal) faces more cyclones than the west. The India Meteorological Department (IMD) tracks cyclones with satellites and radar and issues warnings; cyclones are given names (e.g. Fani, Amphan, Biparjoy). Safety: follow warnings, move to cyclone shelters, store food, water and medicines, stay away from the coast, avoid fishing at sea.',
 real:'Timely evacuation during Cyclone Fani (2019) in Odisha saved many lives.',
 apply:'List four things a family should do when a cyclone warning is issued.',
 see:{w:520,h:240,f:[
  ['Warm ocean, rising air.',`<rect x="20" y="200" width="480" height="30" fill="${BL}" opacity=".4"/>`+lbl(260,220,'warm sea (≥ 26 °C)','fill="#fff"')],
  ['Air spirals in around low pressure.',spiral(260,110,85)],
  ['Calm eye at the centre.',lbl(260,115,'eye','font-size="12" font-weight="700"')+lbl(430,40,'IMD warns early','fill="'+GN+'" font-weight="700"')]]},
 seeNote:'Warm sea fuels the spin.',
 do:{title:'Family cyclone plan',mat:'Chart paper',steps:['Prepare an emergency kit list and evacuation plan.'],obs:'A ready plan.',why:'Preparedness saves lives.',lab:false},
 memo:'"Warm sea, low pressure, spin — listen to IMD."',
 miscon:['"When the eye passes, the storm is over." The other side of the wall follows.'],
 terms:['Cyclone · चक्रवात','Eye · चक्रवात की आँख','Storm surge · तूफ़ानी लहर','IMD · भारत मौसम विज्ञान विभाग'],
 q:{q:'Cyclones form over:',o:['cold deserts','warm oceans','high mountains','frozen lakes'],a:1,why:'Warm moist air.'},
 exam:'Cyclone formation and safety: 3–5 marks.'}
];

const CARDS=[['Pressure','Force ÷ area; unit pascal (N/m²).'],['Small area','More pressure: knives, nails.'],['Large area','Less pressure: straps, broad tyres.'],['Liquid pressure','All directions; increases with depth.'],['Air pressure','Pushes everywhere; less at height.'],['Wind','High → low pressure; uneven heating.'],['Sea/land breeze','Day: sea→land; night: land→sea.'],['Thunderstorm','Rising humid air; lightning + thunder.'],['Cyclone','Warm sea, low pressure, spinning, eye.'],['Safety','Indoors in lightning; follow IMD warnings.']];

const Q=[
 {lv:1,q:'Unit of pressure:',o:['newton','pascal','joule','watt'],a:1,w:'N/m².'},
 {lv:1,q:'Wind blows from:',o:['low to high pressure','high to low pressure','east to west only','cold to hot always'],a:1,w:'High → low.'},
 {lv:1,q:'Calm centre of a cyclone:',o:['wall','eye','surge','tail'],a:1,w:'Eye.'},
 {lv:2,q:'200 N on 0.5 m² gives pressure:',o:['100 Pa','400 Pa','200 Pa','0.0025 Pa'],a:1,w:'200 ÷ 0.5.'},
 {lv:2,q:'School bags have wide straps to:',o:['look nice','reduce pressure on shoulders','increase weight','increase pressure'],a:1,w:'Larger area.'},
 {lv:2,q:'Thunder heard 9 s after lightning: distance',o:['3 km','9 km','27 km','1 km'],a:0,w:'÷ 3.'},
 {lv:3,q:'Why are dams thicker at the base?',o:['for beauty','water pressure increases with depth','less water at bottom','to save cement'],a:1,w:'Depth.'},
 {lv:3,q:'Sea breeze blows in the day because:',o:['sea heats faster','land heats faster and air above rises','fish move','moon pulls air'],a:1,w:'Uneven heating.'},
 {lv:4,q:'Which coast of India faces more cyclones?',o:['west','east','north','none'],a:1,w:'Bay of Bengal.'},
 {lv:4,q:'Water boils at a lower temperature on mountains because:',o:['air pressure is lower','it is colder','water is lighter','sunlight is stronger'],a:0,w:'Less pressure.'},
 {lv:5,open:true,m:3,q:'Explain how a cyclone forms.',ans:['Warm sea heats moist air, which rises → very low pressure (1)','Surrounding air rushes in and spins due to Earth\'s rotation (1)','Condensation releases heat, strengthening the storm; eye forms at centre (1)']},
 {lv:5,open:true,m:5,q:'List five safety measures during a thunderstorm or cyclone.',ans:['Stay indoors / go to shelters (1)','Avoid trees, open fields, water (1)','Do not touch metal/wired phones; unplug appliances (1)','Keep emergency kit: food, water, torch, medicines (1)','Follow IMD warnings; stay away from coast (1)']}
];

const ONEMIN=['Pressure = force ÷ area.','Liquid pressure increases with depth.','Air pressure everywhere; less at height.','Winds: high to low pressure; breezes.','Thunderstorms and lightning safety.','Cyclones: formation, eye, IMD warnings.'];
const KEYS=[['pressure',/pressure/i],['area',/area/i],['depth',/depth/i],['wind',/wind|breeze/i],['thunderstorm',/thunder|lightning/i],['cyclone',/cyclone|eye|IMD/i]];

/* ---------- lab ---------- */
let mode='a',F=50,A=25,lev=100,time='day',wired=false,tick=0,anim=null;
function drawA(){const P=F/A;const depth=Math.min(90,P*9);const w=Math.max(12,Math.sqrt(A)*22);let s=`<rect x="20" y="170" width="420" height="120" fill="#e8d7a8"/>`;
 s+=`<rect x="${230-w/2}" y="${80+depth}" width="${w}" height="90" fill="${OR}" opacity=".7" stroke="${ink}"/>`+arr(230,20,230,75+depth,BL,4)+T(280,40,`${F} N`,'font-size="15" font-weight="700" fill="'+BL+'"');
 s+=T(230,305,`pressure = ${F} ÷ ${A} = ${(P).toFixed(1)} N/cm²`,'font-size="15" font-weight="700"');$('#wSvg').innerHTML=s;$('#wFv').textContent=F;$('#wAv').textContent=A;
 $('#wOut').innerHTML=`<p>Pressure = force ÷ area = <b>${P.toFixed(1)} N/cm²</b>.</p><p>${A<=5?'Tiny area — like a nail or knife edge — sinks deep.':A>=35?'Large area — like a camel\'s foot or tractor tyre — barely sinks.':'Try a smaller or larger area with the same force.'}</p>`}
function drawD(){const top=300-2.4*lev;let s=`<rect x="80" y="60" width="110" height="240" rx="10" fill="none" stroke="${ink}" stroke-width="2"/><rect x="82" y="${top}" width="106" height="${298-top}" fill="${BL}" opacity=".3"/>`;
 [100,170,240].forEach(y=>{const d=y-top;s+=`<circle cx="190" cy="${y}" r="3" fill="${ink}"/>`;if(d>0){const r=Math.sqrt(d)*14;s+=`<path d="M190 ${y} Q${190+r*.6} ${y} ${190+r} 300" fill="none" stroke="${BL}" stroke-width="3"/>`+T(205,y-6,`depth ${Math.round(d/2.4)}`,'font-size="10" text-anchor="start"')}});
 $('#wSvg').innerHTML=s+T(330,40,'deeper hole → longer jet','font-size="13" font-weight="700"');$('#wLv').textContent=lev+'%';$('#wOut').innerHTML='<p>Water pressure increases with depth: the lowest hole has the most water above it, so its jet goes farthest. Lower the water level and watch every jet weaken.</p>'}
function drawW(){const day=time==='day';let s=`<rect x="0" y="0" width="460" height="200" fill="${day?'#e9f4fb':'#1e2a44'}"/><rect x="0" y="200" width="230" height="120" fill="#c9a26b"/><rect x="230" y="200" width="230" height="120" fill="${BL}" opacity=".55"/>`;
 s+=T(115,250,day?'land: hot':'land: cool','font-size="14" font-weight="700"')+T(345,250,day?'sea: cool':'sea: warmer','font-size="14" font-weight="700" fill="#fff"');
 s+=day?`<circle cx="400" cy="40" r="22" fill="#ffd34d"/>`:`<circle cx="400" cy="40" r="16" fill="#eee"/>`;
 const hot=day?115:345,cold=day?345:115;const o=(tick%40)/40;
 s+=arr(hot,190,hot,90,OR,3)+arr(cold,90,cold,180,BL,3)+arr(hot<cold?hot+20:hot-20,70,cold+(hot<cold?-20:20),70,GR,2)+arr(cold+(hot<cold?-20:20),190,hot+(hot<cold?20:-20),190,BL,4);
 for(let k=0;k<4;k++){const x=cold+(hot-cold)*((o+k/4)%1);s+=`<circle cx="${x}" cy="185" r="4" fill="${day?BL:'#9cc8ee'}"/>`}
 s+=T(hot+(hot<cold?-45:45),182,'LOW','font-size="13" font-weight="700" fill="'+OR+'"')+T(cold+(hot<cold?45:-45),182,'HIGH','font-size="13" font-weight="700" fill="'+BL+'"')+T(230,170,day?'sea breeze →':'← land breeze','font-size="14" font-weight="700" fill="'+(day?ink:'#fff')+'"').replace('→','').replace('←','');
 $('#wSvg').innerHTML=s;$('#wOut').innerHTML=day?'<p>Day: land heats faster. Hot air over land rises (low pressure); cooler, high-pressure air from the sea flows in — a <b>sea breeze</b>.</p>':'<p>Night: land cools faster; the sea stays warmer. Air over the sea rises; air flows from land to sea — a <b>land breeze</b>.</p>'}
function draw(){['a','d','w'].forEach(k=>$('#w'+k.toUpperCase()).style.display=mode===k?'':'none');clearInterval(anim);if(mode==='a')drawA();else if(mode==='d')drawD();else{drawW();anim=setInterval(()=>{if(!$('#wSvg')||!$('#wSvg').isConnected||mode!=='w'){clearInterval(anim);return}tick++;drawW()},80)}}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(!e.target||!e.target.classList||!e.target.classList.contains('wS'))return;const id=e.target.id,v=+e.target.value;if(id==='wF')F=v;else if(id==='wAr')A=v;else lev=v;mode==='a'?drawA():drawD()})}
function labClick(){return false}
function labChange(t){if(t.id==='wM'){mode=t.value;draw();return true}if(t.id==='wT'){time=t.value;drawW();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
