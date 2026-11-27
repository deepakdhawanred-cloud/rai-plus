/* Rai Plus content pack: Class 6 Science (Curiosity), Chapter 12 – Beyond Earth. Bilingual terms. */
RP.register({key:'6sci12',cls:'6',subject:'Science',ch:'12',title:"Beyond Earth",color:'#3c3489',
crumb:"Class 6 Science · Curiosity · पृथ्वी से आगे",h1:"Chapter 12: Beyond Earth",sub:"पृथ्वी से आगे. Stars and constellations, the Solar System, and what makes Earth special.",heroLabel:"Stars, a crescent Moon and a ringed planet",labName:'Solar System explorer',
theme:"\n:root{--g:light-dark(#3c3489,#b4adf0);--g2:light-dark(#eeedfa,#110f24);--line:light-dark(#d6d3f2,#2d2a55);--bg:light-dark(#ffffff,#0a0916);--card:light-dark(#ffffff,#100e20);\n--ink:light-dark(#16133a,#e6e4f8);--mute:light-dark(#555079,#b2aed3);--y:light-dark(#a3501b,#f0a877);--y2:light-dark(#fbeee4,#2a160a);--hd:#2b2570}\n",
labHTML:`  <h2>Solar System explorer · सौर मंडल</h2>
  <p>Pick a planet to see where it is and what makes it special. Press Play to watch the planets go round.</p>
  <div class="sim"><div><div class="fig" style="max-width:none;background:#0d0b22;border-radius:10px"><svg id="pSvg" viewBox="0 0 460 320" role="img" aria-label="Solar System orbits" style="color:#eee"></svg></div></div>
  <div><div class="ctrl"><label>Planet<select id="pPl"><option value="0">Mercury · बुध</option><option value="1">Venus · शुक्र</option><option value="2" selected>Earth · पृथ्वी</option><option value="3">Mars · मंगल</option><option value="4">Jupiter · बृहस्पति</option><option value="5">Saturn · शनि</option><option value="6">Uranus · अरुण</option><option value="7">Neptune · वरुण</option></select></label></div><div class="ctrl"><button class="btn" id="pPlay">Play</button></div><div class="box y" id="pOut" aria-live="polite"></div><p class="note">Orbits and sizes are not to scale.</p></div></div>
`,
build:function(){

const ACC='#3c3489',LABNAME='Solar System explorer',MIND_CENTER='Beyond Earth · पृथ्वी से आगे';
const PU='#3c3489',YE='#f2c14e',GR='#888780',BL='#2f6f8a',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const star=(x,y,r=3,c=YE)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
function heroDraw(){return star(40,30,3,'#fff')+star(90,60,2,'#fff')+star(140,25,2.5,'#fff')+`<path d="M220 30 a28 28 0 1 0 22 46 a22 22 0 1 1 -22 -46z" fill="#fff"/><circle cx="320" cy="70" r="16" fill="#fff" opacity=".85"/><ellipse cx="320" cy="70" rx="30" ry="7" fill="none" stroke="#fff" stroke-width="2"/>`}
const HERO=heroDraw;
const MIND=[['Night sky',100,50],['Constellations',420,50],['Pole Star',90,150],['The Sun & planets',430,150],['Moons, asteroids, comets',110,250],['Earth is special',410,250]];
// Big Dipper / Saptarishi coordinates
const SR=[[60,140],[100,130],[135,140],[165,150],[205,140],[215,100],[175,95]];

const C=[
{id:'b1',num:'12.1',title:'The night sky · रात का आकाश',
 intro:'On a clear night away from city lights, how many stars can you count?',
 obj:'Describe what we see in the night sky and why stars look small.',
 prior:'Day and night.',
 simple:'In the night sky we see the Moon, stars, and sometimes planets. Stars (तारे) are huge balls of hot gases that give out their own light. They look tiny because they are very, very far away. The Sun is also a star — the nearest one to us; that is why it looks big and bright.',
 detail:'We cannot see stars in the day because the sunlight is too bright. City lights (light pollution) hide faint stars. Planets do not make their own light; they shine by reflecting sunlight, and they usually do not twinkle like stars. The Moon also shines by reflected sunlight.',
 real:'On a village rooftop in Haryana on a dark night you can see thousands of stars and the Milky Way.',
 apply:'Why does the Sun look bigger than other stars?',
 see:{w:520,h:200,f:[
  ['A dark sky full of stars.',`<rect x="0" y="0" width="520" height="200" fill="#0d0b22"/>`+[...Array(40)].map((_,i)=>star((i*137)%510+5,(i*71)%190+5,(i%3)+1,'#fff')).join('')],
  ['The Moon: reflected sunlight.',`<path d="M400 40 a30 30 0 1 0 24 50 a24 24 0 1 1 -24 -50z" fill="#eee"/>`],
  ['The Sun is a star — just the nearest one.',lbl(260,180,'stars make their own light','fill="#fff" font-weight="700"')]]},
 seeNote:'Stars shine by their own light.',
 do:{title:'Star count',mat:'A clear night, a cardboard tube',steps:['Look through the tube at one part of the sky.','Count stars you see.','Compare in town and in a dark place.'],obs:'More stars where it is dark.',why:'Light pollution.',lab:false},
 memo:'"Stars glow, planets and Moon reflect."',
 miscon:['"Stars are small." They are huge but far away.','"The Moon makes its own light." It reflects sunlight.'],
 terms:['Star · तारा','Planet · ग्रह','Light pollution · प्रकाश प्रदूषण','Reflect · परावर्तन'],
 q:{q:'The nearest star to Earth is:',o:['the Moon','the Sun','Pole Star','Venus'],a:1,why:'Sun.'},
 exam:'Difference between stars and planets: 2 marks.'},

{id:'b2',num:'12.2',title:'Constellations and the Pole Star · तारामंडल और ध्रुव तारा',
 intro:'How did travellers find north at night without a compass?',
 obj:'Identify constellations and use them to find the Pole Star.',
 prior:'Night sky (12.1).',
 simple:'A constellation (तारामंडल) is a group of stars that seems to form a pattern. Saptarishi (Ursa Major / Big Dipper) has seven bright stars shaped like a ladle; Orion (Mriga, the hunter) has three stars in a row as its "belt". The two end stars of Saptarishi point towards the Pole Star (ध्रुव तारा), which stays nearly fixed in the northern sky and shows north.',
 detail:'As Earth rotates, stars seem to move across the sky from east to west, but the Pole Star stays almost in one place because it lies nearly above Earth\'s axis. Constellations are seen best at different times of the year: Orion in winter evenings, Saptarishi in summer evenings in India. The stars in a constellation may be at very different distances from us; they only look close.',
 real:'Sailors and desert travellers once used the Pole Star to find north.',
 apply:'Which two stars of Saptarishi point to the Pole Star?',
 see:{w:520,h:240,f:[
  ['Saptarishi: seven stars like a ladle.',`<rect x="0" y="0" width="520" height="240" fill="#0d0b22"/>`+SR.map(p=>star(p[0],p[1],4,'#fff')).join('')+`<polyline points="${SR.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#99a" stroke-width="1"/><path d="M175 95 L205 140" stroke="#99a"/>`+lbl(130,200,'Saptarishi · सप्तर्षि','fill="#fff"')],
  ['The two end stars point the way…',`<path d="M205 140 L234 24" stroke="${YE}" stroke-dasharray="5 4"/>`],
  ['…to the Pole Star: north.',star(235,20,6,YE)+lbl(330,25,'Pole Star · ध्रुव तारा','fill="'+YE+'" font-weight="700"')+lbl(330,45,'→ north','fill="#fff"')]]},
 seeNote:'Pole Star shows north.',
 do:{title:'Find north',mat:'Clear night (with an adult), sky map app optional',steps:['Find Saptarishi in the northern sky.','Extend the line of the two end stars about five times their gap.','Find the Pole Star and face it.'],obs:'You face north.',why:'Pole Star is nearly fixed.',lab:false},
 memo:'"Follow the pointers to the Pole."',
 miscon:['"The Pole Star is the brightest star." It is not; it is useful because it barely moves.'],
 terms:['Constellation · तारामंडल','Saptarishi · सप्तर्षि','Orion · मृग','Pole Star · ध्रुव तारा'],
 q:{q:'The Pole Star helps us find:',o:['east','north','south','west'],a:1,why:'It is above the north.'},
 exam:'How to locate the Pole Star: 2 marks.'},

{id:'b3',num:'12.3',title:'The Solar System · सौर मंडल',
 intro:'Earth is one of eight planets going round the same star. Which ones?',
 obj:'Name the planets in order and describe the Sun\'s role.',
 prior:'Stars (12.1).',
 simple:'The Solar System (सौर मंडल) is the Sun and everything that goes round it: eight planets, their moons, asteroids, comets and dwarf planets. The planets in order from the Sun are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune. Each moves in its own path, called an orbit (कक्षा). The Sun\'s pull (gravity) keeps them in orbit.',
 detail:'The first four (Mercury to Mars) are small and rocky; the outer four (Jupiter to Neptune) are huge, mostly gas or ice, with rings and many moons. Mercury is closest and fastest; Venus is the hottest and brightest planet seen from Earth; Mars looks red; Jupiter is the largest; Saturn has beautiful rings. A memory line: "My Very Educated Mother Just Served Us Noodles".',
 real:'Venus is often seen as the bright "evening star" or "morning star" (Shukra).',
 apply:'Which planet is between Earth and Jupiter?',
 see:{w:520,h:200,f:[
  ['The Sun at the centre.',`<rect x="0" y="0" width="520" height="200" fill="#0d0b22"/><circle cx="10" cy="100" r="60" fill="#f2b632"/>`],
  ['Four rocky inner planets.',[[90,4,'#aaa'],[115,7,'#e8c68a'],[145,7,'#4a90d9'],[175,5,'#c1440e']].map(p=>`<circle cx="${p[0]}" cy="100" r="${p[1]}" fill="${p[2]}"/>`).join('')],
  ['Four giant outer planets.',[[240,22,'#d9a066'],[320,18,'#e3c98f'],[395,12,'#8fd3e0'],[455,12,'#3f6fd1']].map(p=>`<circle cx="${p[0]}" cy="100" r="${p[1]}" fill="${p[2]}"/>`).join('')+`<ellipse cx="320" cy="100" rx="30" ry="6" fill="none" stroke="#e3c98f" stroke-width="2"/>`+lbl(260,180,'My Very Educated Mother Just Served Us Noodles','fill="#fff" font-size="12"')]]},
 seeNote:'Eight planets, each in its own orbit.',
 do:{title:'Model in the corridor',mat:'Chalk, 9 paper discs',steps:['Put the "Sun" at one end of the corridor.','Place planets in order with bigger gaps further out.','Label them.'],obs:'Outer planets are very far apart.',why:'Distances grow outwards.',lab:false},
 memo:'"My Very Educated Mother Just Served Us Noodles."',
 miscon:['"Pluto is the ninth planet." It is now a dwarf planet.'],
 terms:['Solar System · सौर मंडल','Orbit · कक्षा','Gravity · गुरुत्व','Planet · ग्रह'],
 q:{q:'The largest planet is:',o:['Earth','Saturn','Jupiter','Neptune'],a:2,why:'Jupiter.'},
 exam:'Name the planets in order: 2 marks.'},

{id:'b4',num:'12.4',title:'Moons, asteroids and comets · उपग्रह, क्षुद्रग्रह, धूमकेतु',
 intro:'What are "shooting stars"? Are they really stars?',
 obj:'Describe moons, asteroids, comets and meteors.',
 prior:'Solar System (12.3).',
 simple:'A moon (natural satellite, उपग्रह) goes round a planet. Earth has one Moon; Mars has two small moons; Jupiter and Saturn have many. Asteroids (क्षुद्रग्रह) are rocky pieces orbiting the Sun, mostly in a belt between Mars and Jupiter. Comets (धूमकेतु) are lumps of ice and dust that get a bright, long tail when they come near the Sun. Meteors ("shooting stars") are small pieces of rock that burn up as streaks of light when they enter Earth\'s air.',
 detail:'Mercury and Venus have no moons. A comet\'s tail always points away from the Sun. A meteor that reaches the ground is a meteorite. Human-made satellites (like India\'s Chandrayaan and communication satellites) also orbit Earth or the Moon. Pluto and Ceres are dwarf planets.',
 real:'Chandrayaan-3 landed near the Moon\'s south pole in August 2023.',
 apply:'Why is a "shooting star" not a star?',
 see:{w:520,h:220,f:[
  ['Earth and its Moon.',`<rect x="0" y="0" width="520" height="220" fill="#0d0b22"/><circle cx="80" cy="110" r="24" fill="#4a90d9"/><circle cx="80" cy="110" r="50" fill="none" stroke="#557" stroke-dasharray="3 3"/><circle cx="130" cy="110" r="7" fill="#ddd"/>`+lbl(90,190,'Moon · चंद्रमा','fill="#fff"')],
  ['Asteroid belt between Mars and Jupiter.',[...Array(18)].map((_,i)=>`<circle cx="${210+(i*23)%90}" cy="${70+(i*37)%90}" r="${1.5+i%3}" fill="#aa9"/>`).join('')+lbl(255,190,'asteroids · क्षुद्रग्रह','fill="#fff"')],
  ['A comet with its tail away from the Sun.',`<circle cx="400" cy="120" r="7" fill="#dff"/><path d="M405 115 L500 60 L506 72z" fill="#bde" opacity=".6"/>`+lbl(430,190,'comet · धूमकेतु','fill="#fff"')]]},
 seeNote:'Shooting stars are meteors, not stars.',
 do:{title:'Meteor watch',mat:'A dark clear night in mid-December (Geminids) with an adult',steps:['Lie back and watch the sky for 20 minutes.','Count streaks of light.'],obs:'Several meteors.',why:'Rocks burning in air.',lab:false},
 memo:'"Moon round planet, asteroid rock, comet ice with a tail."',
 miscon:['"Shooting stars are falling stars." They are burning rocks.'],
 terms:['Natural satellite · प्राकृतिक उपग्रह','Asteroid · क्षुद्रग्रह','Comet · धूमकेतु','Meteor · उल्का','Dwarf planet · बौना ग्रह'],
 q:{q:'The asteroid belt lies between:',o:['Earth and Mars','Mars and Jupiter','Jupiter and Saturn','Sun and Mercury'],a:1,why:'Main belt.'},
 exam:'Differentiate asteroid, comet and meteor: 3 marks.'},

{id:'b5',num:'12.5',title:'Earth: a special planet · पृथ्वी: एक विशेष ग्रह',
 intro:'Why is Earth the only planet known to have life?',
 obj:'Explain what makes Earth suitable for life and why we must protect it.',
 prior:'Natural resources (Ch 11).',
 simple:'Earth is just the right distance from the Sun: not too hot, not too cold. It has liquid water, air with oxygen, and a layer (ozone) that protects us from harmful sunlight. These make life possible. So far, no other place with life has been found.',
 detail:'Seen from space, Earth looks blue because most of it is covered with water. Scientists search for water and life on Mars and on moons of Jupiter and Saturn. India\'s Mangalyaan reached Mars orbit in 2014 on its first try. Since Earth is our only home, protecting its air, water, soil and living things is our duty.',
 real:'Photos from space show Earth as a "blue marble".',
 apply:'List three features of Earth that support life.',
 see:{w:520,h:220,f:[
  ['Earth: the blue planet.',`<rect x="0" y="0" width="520" height="220" fill="#0d0b22"/><circle cx="260" cy="110" r="70" fill="#2f6fbf"/><path d="M220 80 q20 -20 40 0 q10 30 -20 40 q-20 -10 -20 -40z M280 130 q20 -10 30 10 q-10 20 -30 10z" fill="#5aa05a"/>`],
  ['Right distance, liquid water, air.',lbl(100,40,'not too hot','fill="#fff"')+lbl(420,40,'not too cold','fill="#fff"')+lbl(100,200,'liquid water','fill="#fff"')+lbl(420,200,'air with oxygen','fill="#fff"')],
  ['Protect our only home.',lbl(260,110,'home · घर','fill="#fff" font-size="16" font-weight="700"')]]},
 seeNote:'The only known planet with life.',
 do:{title:'Postcard from Earth',mat:'Card, colours',steps:['Design a postcard to aliens: what makes Earth special?','Add one way to protect it.'],obs:'Water, air, life.',why:'Conditions for life.',lab:false},
 memo:'"Goldilocks planet: just right."',
 miscon:['"Life has been found on Mars." Not so far.'],
 terms:['Life · जीवन','Ozone layer · ओज़ोन परत','Atmosphere · वायुमंडल','Mangalyaan · मंगलयान'],
 q:{q:'Earth supports life mainly because it has:',o:['rings','liquid water, air and right temperature','many moons','no gravity'],a:1,why:'Conditions for life.'},
 exam:'Why is Earth unique? 2 marks.'}
];

const CARDS=[['Star','Huge ball of hot gas; own light.'],['Sun','The nearest star.'],['Planet','Goes round the Sun; reflects light.'],['Constellation','Pattern of stars: Saptarishi, Orion.'],['Pole Star','Nearly fixed; shows north; found with Saptarishi pointers.'],['Planets in order','Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.'],['Inner vs outer','Rocky small vs gas giants.'],['Moon','Natural satellite of a planet.'],['Asteroids','Rocks; belt between Mars and Jupiter.'],['Comet','Ice + dust; tail away from Sun.'],['Meteor','"Shooting star": rock burning in air.'],['Earth','Water, air, right temperature: life.']];

const Q=[
 {lv:1,q:'Planet closest to the Sun:',o:['Venus','Mercury','Earth','Mars'],a:1,w:'Mercury.'},
 {lv:1,q:'The red planet:',o:['Mars','Jupiter','Venus','Saturn'],a:0,w:'Mars.'},
 {lv:1,q:'Planet famous for rings:',o:['Earth','Saturn','Mercury','Mars'],a:1,w:'Saturn.'},
 {lv:2,q:'Stars look small because they are:',o:['small','very far away','cold','dim'],a:1,w:'Distance.'},
 {lv:2,q:'The Pole Star is found using:',o:['Orion\'s belt','Saptarishi pointer stars','the Moon','Venus'],a:1,w:'Pointer stars.'},
 {lv:2,q:'A "shooting star" is a:',o:['star','meteor','comet','planet'],a:1,w:'Burning rock.'},
 {lv:3,q:'Which planet has two small moons?',o:['Mercury','Venus','Mars','Earth'],a:2,w:'Phobos and Deimos.'},
 {lv:3,q:'A comet\'s tail points:',o:['towards the Sun','away from the Sun','to Earth','downwards'],a:1,w:'Pushed away.'},
 {lv:4,q:'Why does the Pole Star seem not to move?',o:['it is very bright','it lies almost above Earth\'s axis','it is a planet','it is close'],a:1,w:'Above the axis.'},
 {lv:4,q:'Which order is correct (from the Sun)?',o:['Earth, Mars, Jupiter','Mars, Earth, Venus','Jupiter, Mars, Saturn','Venus, Mercury, Earth'],a:0,w:'MVEMJSUN.'},
 {lv:5,open:true,m:3,q:'Differentiate between a star and a planet (three points).',ans:['Star has own light; planet reflects (1)','Stars twinkle; planets usually do not (1)','Planets orbit a star; stars are huge hot gas balls (1)']},
 {lv:5,open:true,m:3,q:'Why is Earth the only known planet with life?',ans:['Right distance: suitable temperature (1)','Liquid water (1)','Air with oxygen; ozone protects (1)']}
];

const ONEMIN=['Stars: own light; Sun is nearest star.','Constellations: Saptarishi, Orion.','Pole Star: north; find with pointers.','Eight planets: MVEMJSUN; orbits; gravity.','Moons, asteroids (Mars–Jupiter), comets, meteors.','Earth: water, air, right temperature.'];
const KEYS=[['stars',/star|तारा/i],['constellation',/constell|saptarishi|orion/i],['Pole Star',/pole|ध्रुव/i],['planets order',/mercury|venus|jupiter|saturn/i],['moon/asteroid/comet',/moon|asteroid|comet|meteor/i],['Earth special',/water|oxygen|life/i]];

/* ---------- lab ---------- */
const PL=[['Mercury · बुध','#aaa',3,0,'Closest to the Sun and smallest planet. A year is only 88 days. No moons.'],['Venus · शुक्र','#e8c68a',5,0,'Hottest planet (thick clouds trap heat). Brightest planet in our sky: the "morning/evening star". No moons.'],['Earth · पृथ्वी','#4a90d9',5,1,'Our home. Liquid water, air with oxygen. One Moon. A year is 365¼ days.'],['Mars · मंगल','#c1440e',4,2,'The red planet (rusty iron in its soil). Two small moons. India\'s Mangalyaan orbited it.'],['Jupiter · बृहस्पति','#d9a066',13,95,'Largest planet; a gas giant with a Great Red Spot storm. Many moons.'],['Saturn · शनि','#e3c98f',11,146,'Famous for its bright rings of ice and rock. Many moons.'],['Uranus · अरुण','#8fd3e0',8,28,'An ice giant that spins on its side.'],['Neptune · वरुण','#3f6fd1',8,16,'Farthest planet; very cold and windy. A year is about 165 Earth years.']];
const R=[38,52,68,84,112,140,165,188],SPD=[4.15,1.62,1,0.53,0.084,0.034,0.012,0.006];let pl=2,ang=PL.map((_,i)=>i*0.9),play=false,raf=null;
function draw(){const cx=230,cy=160;let s='';for(let i=0;i<40;i++)s+=`<circle cx="${(i*131)%460}" cy="${(i*53)%320}" r="1" fill="#556"/>`;
 s+=`<circle cx="${cx}" cy="${cy}" r="18" fill="#f2b632"/>`;R.forEach((r,i)=>{s+=`<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r*0.62}" fill="none" stroke="${i===pl?'#f2c14e':'#445'}" stroke-width="${i===pl?1.8:1}"/>`});
 [...Array(30)].forEach((_,k)=>{const a=k*0.21,r=97+(k%3)*3;s+=`<circle cx="${cx+r*Math.cos(a)}" cy="${cy+r*0.62*Math.sin(a)}" r="1" fill="#887"/>`});
 PL.forEach((p,i)=>{const x=cx+R[i]*Math.cos(ang[i]),y=cy+R[i]*0.62*Math.sin(ang[i]);s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${Math.min(9,p[2]*0.7+1.5)}" fill="${p[1]}"/>`;if(i===5)s+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="13" ry="3.5" fill="none" stroke="${p[1]}"/>`;if(i===pl)s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="14" fill="none" stroke="#fff" stroke-dasharray="3 3"/>`});
 $('#pSvg').innerHTML=s}
function info(){const p=PL[pl];$('#pOut').innerHTML=`<p><b>${p[0]}</b> — planet number ${pl+1} from the Sun · ${pl<4?'inner, rocky':'outer, giant'} · moons: ${p[3]===0?'none':p[3]>10?'many':p[3]}</p><p>${p[4]}</p>`}
function loop(){if(!play)return;const svg=$('#pSvg');if(!svg||!svg.isConnected||!svg.getClientRects().length){play=false;$('#pPlay')&&($('#pPlay').textContent='Play');return}ang=ang.map((a,i)=>a+0.03*SPD[i]);draw();raf=requestAnimationFrame(loop)}
function labShow(){draw();info()}
function labInit(){}
function labClick(b){if(b.id==='pPlay'){play=!play;b.textContent=play?'Pause':'Play';if(play)loop();return true}return false}
function labChange(t){if(t.id==='pPl'){pl=+t.value;draw();info();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
