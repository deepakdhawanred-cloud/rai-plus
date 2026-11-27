/* Rai Plus content pack: Class 8 Science (Curiosity), Chapter 7 – Particulate Nature of Matter. */
RP.register({key:'8sci07',cls:'8',subject:'Science',ch:'7',title:"Particulate Nature of Matter",color:'#6a4fb3',
crumb:"Class 8 Science · Curiosity",h1:"Chapter 7: Particulate Nature of Matter",sub:"Matter is made of tiny particles with spaces between them, always moving and attracting each other; how this explains solids, liquids, gases, diffusion and changes of state.",heroLabel:"Particles in a solid, liquid and gas",labName:'Particle simulator',
theme:"\n:root{--g:light-dark(#6a4fb3,#c3b3ef);--g2:light-dark(#f1edfb,#120d20);--line:light-dark(#ddd4f4,#2f2650);--bg:light-dark(#ffffff,#0c0916);--card:light-dark(#ffffff,#130f20);\n--ink:light-dark(#1b1430,#ebe6f8);--mute:light-dark(#5a5078,#bcb2d8);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#52398f}\n",
labHTML:`  <h2>Particle simulator</h2>
  <p>States mode: heat or cool a sample of water particles and watch them vibrate in place (ice), slide past each other (water) or fly freely (steam). Diffusion mode: drop ink into cold or hot water and see how fast it spreads.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="kSvg" viewBox="0 0 460 320" role="img" aria-label="Particle box" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="kM"><option value="s">States of matter</option><option value="d">Diffusion</option></select></label></div>
  <div class="ctrl"><label>Temperature (°C): <b id="kTv"></b><input type="range" class="kS" id="kT" min="-20" max="120" step="5" value="25"></label></div>
  <div class="ctrl" id="kDc" style="display:none"><button class="btn" id="kDrop">Drop ink</button></div>
  <div class="box y" id="kOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#6a4fb3',LABNAME='Particle simulator',MIND_CENTER='Particles';
const PU='#6a4fb3',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
const arr=(x1,y1,x2,y2,c=GR,w=2.5)=>{const a=Math.atan2(y2-y1,x2-x1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/><path d="M${x2} ${y2} L${x2-8*Math.cos(a-.45)} ${y2-8*Math.sin(a-.45)} L${x2-8*Math.cos(a+.45)} ${y2-8*Math.sin(a+.45)}Z" fill="${c}"/>`};
function solidBox(x,y,c=BL){let s=`<rect x="${x}" y="${y}" width="110" height="110" fill="none" stroke="${ink}" stroke-width="1.5"/>`;for(let i=0;i<5;i++)for(let j=0;j<5;j++)s+=`<circle cx="${x+15+i*20}" cy="${y+15+j*20}" r="8" fill="${c}" opacity=".8"/>`;return s}
function liquidBox(x,y,c=BL){let s=`<rect x="${x}" y="${y}" width="110" height="110" fill="none" stroke="${ink}" stroke-width="1.5"/>`;const P=[[15,95],[33,92],[52,96],[71,93],[92,95],[22,76],[42,74],[63,77],[84,72],[12,58],[32,55],[55,58],[77,54],[96,60],[44,38],[68,40]];P.forEach(([a,b])=>s+=`<circle cx="${x+a}" cy="${y+b}" r="8" fill="${c}" opacity=".8"/>`);return s}
function gasBox(x,y,c=BL){let s=`<rect x="${x}" y="${y}" width="110" height="110" fill="none" stroke="${ink}" stroke-width="1.5"/>`;[[20,20],[80,30],[50,60],[15,85],[90,90],[60,15]].forEach(([a,b],k)=>s+=`<circle cx="${x+a}" cy="${y+b}" r="8" fill="${c}" opacity=".8"/>`+arr(x+a+8,y+b,x+a+20,y+b+(k%2?10:-10),GR,1.5));return s}
function heroDraw(){let s='';for(let i=0;i<3;i++)for(let j=0;j<3;j++)s+=`<circle cx="${80+i*16}" cy="${60+j*16}" r="6" fill="#fff"/>`;[[170,95],[188,92],[180,76],[200,80]].forEach(([a,b])=>s+=`<circle cx="${a}" cy="${b}" r="6" fill="#fff"/>`);[[260,40],[300,70],[280,110]].forEach(([a,b])=>s+=`<circle cx="${a}" cy="${b}" r="6" fill="#fff"/>`);return s}
const HERO=heroDraw;
const MIND=[['Made of particles',100,50],['Spaces between',420,50],['Always moving',90,150],['Forces of attraction',430,150],['Three states',110,250],['Changes of state',410,250]];

const C=[
{id:'k1',num:'7.1',title:'Matter is made of tiny particles',
 intro:'Crush a sugar crystal into powder, then dissolve it. Where does the sugar go?',
 obj:'Show that matter is made of extremely small particles.',
 prior:'Class 6–7: materials, solutions.',
 simple:'Matter is anything that has mass and takes up space. All matter is made up of extremely tiny particles — far too small to see even with an ordinary microscope. When sugar dissolves in water, it breaks into particles so small that they spread out between the water particles; we cannot see them, but the water tastes sweet.',
 detail:'Dilution experiment: one crystal of potassium permanganate colours a whole glass of water; diluting again and again, the water stays faintly pink — so one crystal contains millions of particles. Ancient Indian philosopher Kanad (Acharya Kanada) suggested matter is made of tiny indivisible particles called "parmanu". Modern science calls the smallest particles atoms and molecules.',
 real:'A few drops of perfume can be smelled across a room — because they contain an enormous number of tiny particles.',
 apply:'Why can\'t you see sugar after it dissolves, though you can taste it?',
 see:{w:520,h:220,f:[
  ['A sugar crystal.',`<rect x="60" y="80" width="40" height="40" fill="#f3f3f3" stroke="${ink}"/>`+lbl(80,140,'crystal')],
  ['Crushed into tiny bits.',[...Array(12)].map((_,k)=>`<rect x="${170+(k%4)*16}" y="${85+Math.floor(k/4)*16}" width="9" height="9" fill="#f3f3f3" stroke="${ink}"/>`).join('')+lbl(200,140,'powder')],
  ['Dissolved: particles spread between water particles.',`<rect x="320" y="50" width="140" height="110" fill="${BL}" opacity=".15" stroke="${ink}"/>`+[...Array(30)].map((_,k)=>`<circle cx="${330+(k*37)%125}" cy="${60+(k*53)%95}" r="${k%3?4:2.5}" fill="${k%3?BL:'#e6a700'}" opacity=".7"/>`).join('')+lbl(390,185,'sugar particles (yellow) between water particles','font-size="10"')]]},
 seeNote:'Too small to see, but there.',
 do:{title:'Dilution chain',mat:'Potassium permanganate crystal, 5 glasses of water (teacher)',steps:['Dissolve one crystal in glass 1.','Transfer 10 mL to glass 2, and so on.'],obs:'Colour fades but stays.',why:'A huge number of tiny particles.',lab:false},
 memo:'"Small, smaller, particles."',
 miscon:['"Dissolved sugar disappears." Its particles are still there, spread out.'],
 terms:['Matter · द्रव्य','Particle · कण','Parmanu · परमाणु','Dissolve · घुलना'],
 q:{q:'One crystal colouring many glasses of water shows that matter has:',o:['large particles','a huge number of tiny particles','no particles','only liquid particles'],a:1,why:'Dilution.'},
 exam:'Evidence for particles: 2 marks.'},

{id:'k2',num:'7.2',title:'Spaces between particles',
 intro:'Add 50 mL of sugar solution to 50 mL of water. Do you always get exactly 100 mL? Mix 50 mL alcohol and 50 mL water — less than 100 mL! Why?',
 obj:'Show that particles of matter have spaces between them.',
 prior:'7.1.',
 simple:'There are spaces between the particles of matter. When sugar dissolves, its particles fit into the spaces between water particles, so the water level hardly rises. Gases have the most space between particles — that is why we can compress (squeeze) air in a syringe, but hardly compress water, and not at all a solid block.',
 detail:'Mixing 50 mL ethanol with 50 mL water gives slightly less than 100 mL because smaller particles fit into spaces between larger ones (like mixing marbles and sand). Compressed gases are stored in cylinders: LPG, CNG, oxygen for hospitals.',
 real:'CNG buses and autos carry a lot of gas squeezed into small cylinders.',
 apply:'Why can a syringe full of air be pushed in, but not one full of water?',
 see:{w:520,h:220,f:[
  ['Marbles fill a jar…',`<rect x="80" y="40" width="120" height="140" fill="none" stroke="${ink}" stroke-width="2"/>`+[...Array(20)].map((_,k)=>`<circle cx="${95+(k%4)*30}" cy="${165-Math.floor(k/4)*28}" r="13" fill="${PU}" opacity=".6"/>`).join('')],
  ['…sand fits into the gaps.',[...Array(60)].map((_,k)=>`<circle cx="${88+(k*29)%108}" cy="${50+(k*41)%128}" r="2" fill="#c9a26b"/>`).join('')],
  ['Gases: most space → easily compressed.',gasBox(340,50)+lbl(395,185,'gas: lots of space')]]},
 seeNote:'Spaces allow mixing and squeezing.',
 do:{title:'Syringe squeeze',mat:'Two syringes (no needle), water',steps:['Fill one with air, one with water; block the tips.','Push the plungers.'],obs:'Air compresses; water hardly.',why:'Spaces in gases.',lab:false},
 memo:'"Gas gaps are greatest."',
 miscon:['"Particles of a liquid touch with no space." There are small spaces.'],
 terms:['Interparticle space · अंतराकणीय स्थान','Compress · संपीडित करना','CNG / LPG'],
 q:{q:'Which can be compressed most easily?',o:['iron block','water','air','wood'],a:2,why:'Large spaces.'},
 exam:'Spaces between particles: 2 marks.'},

{id:'k3',num:'7.3',title:'Particles are always moving',
 intro:'Why can you smell hot jalebis being fried from far away, but not cold ones?',
 obj:'Explain that particles move continuously and that heating increases their speed; describe diffusion.',
 prior:'7.2.',
 simple:'Particles of matter are always moving — they have kinetic energy. Diffusion is the spreading and mixing of particles of one substance into another on their own. Smells spread through air by diffusion; ink spreads in water. Diffusion is fastest in gases, slower in liquids and very slow in solids. Heating makes particles move faster, so diffusion is faster when hot.',
 detail:'Pollen grains in water seen under a microscope jiggle randomly — Brownian motion — because water particles keep hitting them. Hot tea dissolves sugar faster. Smell of incense or a gas leak spreads through a room by diffusion (LPG has a strong-smelling substance added so leaks can be detected).',
 real:'Plants take in carbon dioxide and give out oxygen through leaves by diffusion.',
 apply:'Why does a drop of ink spread faster in hot water than in cold water?',
 see:{w:520,h:220,f:[
  ['Ink drop in water.',`<rect x="60" y="40" width="160" height="150" fill="${BL}" opacity=".1" stroke="${ink}"/><circle cx="140" cy="70" r="10" fill="${PU}"/>`+lbl(140,210,'cold water')],
  ['It spreads slowly…',[...Array(14)].map((_,k)=>`<circle cx="${110+(k*23)%60}" cy="${60+(k*17)%60}" r="4" fill="${PU}" opacity=".6"/>`).join('')],
  ['…and faster in hot water.',`<rect x="300" y="40" width="160" height="150" fill="${OR}" opacity=".08" stroke="${ink}"/>`+[...Array(40)].map((_,k)=>`<circle cx="${310+(k*37)%145}" cy="${50+(k*29)%135}" r="4" fill="${PU}" opacity=".5"/>`).join('')+lbl(380,210,'hot water','fill="'+OR+'"')]]},
 seeNote:'Heat → faster particles → faster diffusion.',
 do:{title:'Hot vs cold ink',mat:'Two glasses (hot and cold water), ink',steps:['Add one drop of ink to each without stirring.'],obs:'Spreads faster in hot water.',why:'Particles move faster.',lab:true},
 memo:'"Hotter means faster."',
 miscon:['"Diffusion needs stirring." It happens by itself.'],
 terms:['Diffusion · विसरण','Kinetic energy · गतिज ऊर्जा','Brownian motion · ब्राउनी गति'],
 q:{q:'Diffusion is fastest in:',o:['solids','liquids','gases','all equally'],a:2,why:'Most space and fastest particles.'},
 exam:'Diffusion and temperature: 2–3 marks.'},

{id:'k4',num:'7.4',title:'Particles attract each other',
 intro:'Why is it easy to break a piece of chalk but very hard to break an iron nail?',
 obj:'Explain the force of attraction between particles and its strength in different states.',
 prior:'7.3.',
 simple:'Particles of matter attract each other — interparticle force of attraction. This force holds particles together. It is strongest in solids, weaker in liquids, and weakest (almost negligible) in gases. Different solids have different strengths of attraction: iron particles are held more strongly than chalk particles.',
 detail:'Hard to break → strong attraction. Water drops stick together and form a curved surface; it takes effort to separate two wet glass slides. Gas particles barely attract, so gases spread to fill any container.',
 real:'You can easily cut butter but not a steel spoon — different forces of attraction.',
 apply:'Arrange in order of increasing force of attraction: water, oxygen, sugar.',
 see:{w:520,h:220,f:[
  ['Solid: strongest attraction.',solidBox(30,50)+lbl(85,185,'strong')],
  ['Liquid: weaker.',liquidBox(205,50)+lbl(260,185,'weaker')],
  ['Gas: weakest.',gasBox(380,50)+lbl(435,185,'weakest')]]},
 seeNote:'Attraction: solid > liquid > gas.',
 do:{title:'Break test',mat:'Chalk, rubber band, iron nail',steps:['Try breaking or stretching each.'],obs:'Nail hardest.',why:'Strongest attraction.',lab:false},
 memo:'"Solids stick, liquids slip, gases flee."',
 miscon:['"Particles in solids don\'t move." They vibrate in place.'],
 terms:['Force of attraction · आकर्षण बल','Interparticle force · अंतराकणीय बल'],
 q:{q:'Force of attraction between particles is least in:',o:['ice','water','steam','iron'],a:2,why:'Gas.'},
 exam:'Force of attraction in states: 2 marks.'},

{id:'k5',num:'7.5',title:'Solids, liquids and gases',
 intro:'Why does a stone keep its shape, water takes the shape of the glass, and air fills the whole room?',
 obj:'Explain the properties of the three states using the particle model.',
 prior:'7.2–7.4.',
 simple:'Solids: particles closely packed in fixed positions, vibrating; strong attraction → fixed shape and volume, not compressible. Liquids: particles close but able to slide past each other; weaker attraction → fixed volume but take the shape of the container, flow. Gases: particles far apart, moving fast in all directions; very weak attraction → no fixed shape or volume, fill the container, easily compressed.',
 detail:'Density: solids and liquids are usually much denser than gases. Some exceptions are interesting: ice floats on water because its particles are arranged in an open pattern. Sponge is a solid that can be compressed because it has holes filled with air.',
 real:'Water in a pot takes the shape of the pot; the steam rising from it spreads into the kitchen.',
 apply:'Use the particle model to explain why gases can be compressed but solids cannot.',
 see:{w:520,h:220,f:[
  ['Solid: fixed shape and volume.',solidBox(30,40,BL)+lbl(85,175,'fixed shape & volume')],
  ['Liquid: fixed volume, flows.',liquidBox(205,40,BL)+lbl(260,175,'flows; fixed volume')],
  ['Gas: fills the container.',gasBox(380,40,BL)+lbl(435,175,'fills container')]]},
 seeNote:'Arrangement explains properties.',
 do:{title:'Act it out',mat:'Classroom space',steps:['Students act as particles: solid (arms linked, vibrate), liquid (close, sliding), gas (moving freely).'],obs:'Spacing and movement differ.',why:'Particle model.',lab:true},
 memo:'"Packed, sliding, flying."',
 miscon:['"Sponge being compressible means solids are compressible." It is the air in the holes that compresses.'],
 terms:['Solid · ठोस','Liquid · द्रव','Gas · गैस','Density · घनत्व','Compressibility · संपीड्यता'],
 q:{q:'Which has a fixed volume but no fixed shape?',o:['solid','liquid','gas','none'],a:1,why:'Liquid.'},
 exam:'Compare three states: 3–5 marks.'},

{id:'k6',num:'7.6',title:'Changes of state',
 intro:'Ice melts, water boils, and wet clothes dry even on a cool day. What is happening to the particles?',
 obj:'Explain melting, boiling, evaporation, condensation and freezing using particles.',
 prior:'7.5.',
 simple:'Heating gives particles more energy: they vibrate more, overcome attraction and change state. Melting: solid → liquid at the melting point (ice at 0 °C). Boiling: liquid → gas throughout the liquid at the boiling point (water at 100 °C at sea level). Evaporation: liquid → gas from the surface at any temperature. Cooling reverses these: condensation (gas → liquid), freezing (liquid → solid). Some solids change directly to gas — sublimation (camphor, naphthalene balls).',
 detail:'During melting and boiling, the temperature stays constant even though heat is supplied — the energy is used to break attraction (latent heat). Evaporation is faster with higher temperature, larger surface area, wind and lower humidity; it causes cooling (sweating, earthen pots/matkas keep water cool).',
 real:'A matka cools water because water seeping through its pores evaporates, taking heat away.',
 apply:'Why do clothes dry faster on a sunny, windy day?',
 see:{w:520,h:220,f:[
  ['Solid → liquid: melting.',box(20,80,120,50,'Solid',BL)+arr(140,95,190,95,OR)+lbl(165,85,'melt','fill="'+OR+'"')],
  ['Liquid → gas: boiling/evaporation.',box(195,80,120,50,'Liquid',BL)+arr(315,95,365,95,OR)+lbl(340,85,'boil','fill="'+OR+'"')+box(370,80,120,50,'Gas',BL)],
  ['Cooling reverses: condense, freeze.',arr(365,120,315,120,BL)+arr(190,120,140,120,BL)+lbl(340,140,'condense','fill="'+BL+'"')+lbl(165,140,'freeze','fill="'+BL+'"')+lbl(260,190,'solid → gas directly: sublimation (camphor)','font-size="12"')]]},
 seeNote:'Heat in → particles break free.',
 do:{title:'Melting curve',mat:'Ice, beaker, thermometer, burner (teacher)',steps:['Heat crushed ice; record temperature every minute.'],obs:'Stays at 0 °C while melting.',why:'Energy breaks attraction.',lab:true},
 memo:'"Melt, boil, condense, freeze — sublime skips."',
 miscon:['"Evaporation happens only at 100 °C." It happens at any temperature.'],
 terms:['Melting · पिघलना','Boiling · क्वथन','Evaporation · वाष्पीकरण','Condensation · संघनन','Sublimation · ऊर्ध्वपातन'],
 q:{q:'Camphor changing directly to vapour is:',o:['melting','sublimation','condensation','freezing'],a:1,why:'Solid → gas.'},
 exam:'Changes of state with particle model: 3 marks.'}
];

const CARDS=[['Particles','All matter is made of tiny particles.'],['Kanad','Ancient idea of parmanu.'],['Spaces','Gases have most space → compressible.'],['Motion','Particles always move; heat speeds them.'],['Diffusion','Spreading by itself; fastest in gases.'],['Attraction','Solid > liquid > gas.'],['Solid','Fixed shape and volume.'],['Liquid','Fixed volume; takes container shape.'],['Gas','Fills container; compressible.'],['Changes','Melt, boil, evaporate, condense, freeze, sublime.']];

const Q=[
 {lv:1,q:'Spreading of perfume smell is due to:',o:['condensation','diffusion','freezing','melting'],a:1,w:'Diffusion.'},
 {lv:1,q:'Ice melts at:',o:['0 °C','100 °C','−10 °C','37 °C'],a:0,w:'Melting point.'},
 {lv:1,q:'Particles are farthest apart in:',o:['solids','liquids','gases'],a:2,w:'Gas.'},
 {lv:2,q:'Which state has fixed volume but takes the container\'s shape?',o:['solid','liquid','gas'],a:1,w:'Liquid.'},
 {lv:2,q:'Diffusion is faster in hot water because particles:',o:['stop moving','move faster','get bigger','attract more'],a:1,w:'Kinetic energy.'},
 {lv:2,q:'Naphthalene balls disappear over time by:',o:['melting','sublimation','evaporation of water','freezing'],a:1,w:'Solid → gas.'},
 {lv:3,q:'Mixing 50 mL alcohol and 50 mL water gives slightly less than 100 mL because:',o:['some evaporates instantly','particles fit into spaces','water disappears','measurement error only'],a:1,w:'Spaces.'},
 {lv:3,q:'A matka cools water by:',o:['condensation','evaporation','freezing','melting'],a:1,w:'Evaporative cooling.'},
 {lv:4,q:'During boiling, temperature stays at 100 °C because heat is used to:',o:['heat the pot','overcome attraction between particles','make bubbles colder','nothing'],a:1,w:'Latent heat.'},
 {lv:4,q:'Order of attraction (increasing):',o:['sugar, water, oxygen','oxygen, water, sugar','water, oxygen, sugar','sugar, oxygen, water'],a:1,w:'Gas < liquid < solid.'},
 {lv:5,open:true,m:3,q:'Give three pieces of evidence that particles of matter are moving.',ans:['Smell spreads (diffusion in air) (1)','Ink spreads in water without stirring (1)','Brownian motion of pollen/dust (1)']},
 {lv:5,open:true,m:5,q:'Compare solids, liquids and gases in terms of particle arrangement, movement, attraction, shape and compressibility.',ans:['Arrangement: packed / close / far (1)','Movement: vibrate / slide / fly freely (1)','Attraction: strong / weaker / weakest (1)','Shape & volume: fixed / fixed volume only / neither (1)','Compressibility: no / hardly / easily (1)']}
];

const ONEMIN=['Matter is made of tiny particles.','Spaces between particles.','Particles move; diffusion; heat speeds it.','Attraction between particles.','Three states explained.','Changes of state; sublimation; evaporation cools.'];
const KEYS=[['particles',/particle/i],['spaces',/space|compress/i],['motion',/moving|motion|diffusion/i],['attraction',/attraction/i],['states',/solid|liquid|gas/i],['changes',/melt|boil|evapor|condens|sublim/i]];

/* ---------- lab ---------- */
const NP=48;let mode='s',temp=25,P=[],inkP=null,anim=null,wired=false;
function init(){P=[];for(let i=0;i<NP;i++){const c=i%8,r=Math.floor(i/8);P.push({hx:150+c*22,hy:180+r*20,x:150+c*22,y:180+r*20,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2})}}
function state(){return temp<=0?'solid':temp<100?'liquid':'gas'}
function stepS(){const st=state();const sp=Math.max(.3,(temp+30)/35);P.forEach(p=>{if(st==='solid'){p.x=p.hx+(Math.random()-.5)*sp*1.5;p.y=p.hy+(Math.random()-.5)*sp*1.5}else{p.vx+=(Math.random()-.5)*.6*sp;p.vy+=(Math.random()-.5)*.6*sp+(st==='liquid'?.25:0);const lim=st==='gas'?sp*2.2:sp*.9;p.vx=Math.max(-lim,Math.min(lim,p.vx));p.vy=Math.max(-lim,Math.min(lim,p.vy));p.x+=p.vx;p.y+=p.vy;const top=st==='liquid'?165:30;if(p.x<28){p.x=28;p.vx*=-1}if(p.x>432){p.x=432;p.vx*=-1}if(p.y<top){p.y=top;p.vy=Math.abs(p.vy)}if(p.y>288){p.y=288;p.vy*=-1}}})}
function drawS(){const st=state();let s=`<rect x="20" y="20" width="420" height="276" fill="none" stroke="${ink_()}" stroke-width="2"/>`;P.forEach(p=>s+=`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="8" fill="${st==='solid'?'#7fb3e0':BL}" opacity=".85"/>`);
 s+=T(230,312,`${temp} °C — ${st==='solid'?'ICE (solid)':st==='liquid'?'WATER (liquid)':'STEAM (gas)'}`,'font-size="14" font-weight="700"');$('#kSvg').innerHTML=s}
function ink_(){return 'currentColor'}
function stepD(){if(!inkP)return;const sp=.4+(temp+20)/40;inkP.forEach(p=>{p.x+=(Math.random()-.5)*sp*3;p.y+=(Math.random()-.5)*sp*3;p.x=Math.max(28,Math.min(432,p.x));p.y=Math.max(60,Math.min(288,p.y))})}
function drawD(){let s=`<rect x="20" y="50" width="420" height="246" fill="${temp>60?'#fbe3d6':'#e3eef9'}" stroke="${ink_()}" stroke-width="2"/>`;if(inkP){inkP.forEach(p=>s+=`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="${PU}" opacity=".7"/>`);const xs=inkP.map(p=>p.x),spread=Math.max(...xs)-Math.min(...xs);s+=T(230,312,`spread: ${Math.round(spread)} px`,'font-size="12"')}
 s+=T(230,35,`water at ${Math.max(0,Math.min(100,temp))} °C`,'font-size="14" font-weight="700"');$('#kSvg').innerHTML=s}
function msg(){if(mode==='s'){const st=state();$('#kOut').innerHTML=st==='solid'?'<p><b>Solid:</b> particles are held in fixed positions by strong attraction and only vibrate. Fixed shape and volume.</p>':st==='liquid'?`<p><b>Liquid:</b> particles have enough energy to slide past each other but stay close. Takes the shape of the container. ${temp>=80?'Getting close to boiling!':''}</p>`:'<p><b>Gas:</b> particles have enough energy to break free and fly in all directions, filling the whole box.</p>'}else $('#kOut').innerHTML=inkP?`<p>The inkP spreads by itself — diffusion. ${temp>=60?'Hot water: particles move fast, so it spreads quickly.':temp<=10?'Cold water: particles move slowly, so it spreads slowly.':'Try very hot or very cold water and compare.'}</p>`:'<p>Set the temperature, then drop the inkP.</p>'}
function loop(){clearInterval(anim);anim=setInterval(()=>{if(!$('#kSvg')||!$('#kSvg').isConnected){clearInterval(anim);return}if(mode==='s'){stepS();drawS()}else{stepD();drawD()}},60)}
function labShow(){if(!P.length)init();$('#kTv').textContent=temp;mode==='s'?drawS():drawD();msg();loop()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='kT'){const old=state();temp=+e.target.value;$('#kTv').textContent=temp;if(mode==='s'&&old==='solid'&&state()!=='solid'){}if(mode==='s'&&state()==='solid')P.forEach(p=>{p.x=p.hx;p.y=p.hy});msg()}})}
function labClick(b){if(b.id==='kDrop'){inkP=[];for(let i=0;i<60;i++)inkP.push({x:230+(Math.random()-.5)*10,y:80+(Math.random()-.5)*10});msg();return true}return false}
function labChange(t){if(t.id==='kM'){mode=t.value;$('#kDc').style.display=mode==='d'?'':'none';inkP=null;if(mode==='s')init();msg();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
