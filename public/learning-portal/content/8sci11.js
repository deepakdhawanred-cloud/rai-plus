/* Rai Plus content pack: Class 8 Science (Curiosity), Chapter 11 – Keeping Time with the Skies. */
RP.register({key:'8sci11',cls:'8',subject:'Science',ch:'11',title:"Keeping Time with the Skies",color:'#2e3a87',
crumb:"Class 8 Science · Curiosity",h1:"Chapter 11: Keeping Time with the Skies",sub:"Days and years from the Sun, phases of the Moon, the Moon in the daytime sky, lunar, solar and lunisolar calendars, festivals and the sky, and artificial satellites.",heroLabel:"Phases of the Moon around the Earth",labName:'Moon phase simulator',
theme:"\n:root{--g:light-dark(#2e3a87,#aab4f0);--g2:light-dark(#eceefa,#0c0f24);--line:light-dark(#d2d6f2,#262c55);--bg:light-dark(#ffffff,#080a18);--card:light-dark(#ffffff,#0e1124);\n--ink:light-dark(#121736,#e6e8f8);--mute:light-dark(#4f5683,#b6bbe0);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#232c6b}\n",
labHTML:`  <h2>Moon phase simulator</h2>
  <p>Move through the 29.5-day lunar month. Left: a view from above — the Sun lights half of the Moon. Right: what we see from Earth, with the approximate time the Moon rises.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="mnSvg" viewBox="0 0 460 320" role="img" aria-label="Moon phases" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Day of lunar month: <b id="mnDv"></b><input type="range" class="mnS" id="mnD" min="0" max="29.5" step="0.5" value="7.5"></label></div>
  <div class="ctrl"><button class="btn" id="mnPlay">Play month</button> <button class="btn" id="mnQ">Phase quiz</button></div>
  <div class="ctrl" id="mnOpts"></div>
  <div class="box y" id="mnOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#2e3a87',LABNAME='Moon phase simulator',MIND_CENTER='Time from the sky';
const NV='#2e3a87',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',GD='#e0a800',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
/* phase disc: frac 0..1 of lunar month (0 new, .5 full); waxing lit on right (northern hemisphere view) */
function phase(cx,cy,r,f){const k=Math.cos(2*Math.PI*f);const waxing=f<.5;let s=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#2b2f45"/>`;const rx=Math.abs(k)*r;
 const sweepOuter=waxing?1:0;const lit=`M${cx} ${cy-r} A${r} ${r} 0 0 ${sweepOuter} ${cx} ${cy+r} A${rx} ${r} 0 0 ${k>0?(waxing?0:1):(waxing?1:0)} ${cx} ${cy-r}Z`;s+=`<path d="${lit}" fill="#f4efd6"/>`;return s+`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#999" stroke-width=".6"/>`}
function pname(f){const d=f*29.5;if(d<1||d>28.5)return 'New Moon (Amavasya)';if(d<6.4)return 'Waxing crescent';if(d<8.4)return 'First quarter';if(d<13.8)return 'Waxing gibbous';if(d<15.7)return 'Full Moon (Purnima)';if(d<21.1)return 'Waning gibbous';if(d<23.1)return 'Last (third) quarter';return 'Waning crescent'}
function heroDraw(){let s='<circle cx="190" cy="80" r="14" fill="#fff"/>';for(let k=0;k<8;k++){const a=k*Math.PI/4;s+=`<circle cx="${190+55*Math.cos(a)}" cy="${80+55*Math.sin(a)}" r="8" fill="none" stroke="#fff" stroke-width="2"/>`}return s}
const HERO=heroDraw;
const MIND=[['Day & year from the Sun',100,50],['Phases of the Moon',420,50],['Moon in the day sky',90,150],['Calendars',430,150],['Festivals & sky',110,250],['Artificial satellites',410,250]];

const C=[
{id:'t1',num:'11.1',title:'The Sun gives us days and years',
 intro:'Before clocks, how did people know it was noon — or that a year had passed?',
 obj:'Relate the day to Earth\'s rotation and the year to its revolution, and describe sundials.',
 prior:'Class 6–7: Earth\'s rotation and revolution, shadows.',
 simple:'A day is the time the Earth takes to spin once on its axis (rotation) — about 24 hours; it causes day and night. A year is the time the Earth takes to go once around the Sun (revolution) — about 365¼ days; with the tilt of Earth\'s axis it causes seasons. Shadows change through the day: shortest at local noon. A sundial uses a shadow to tell time.',
 detail:'Because a year is 365¼ days, we add one extra day every 4 years — a leap year with 29 February. Jantar Mantar observatories (Jaipur, Delhi, Ujjain, Varanasi), built by Sawai Jai Singh II in the 18th century, include a giant sundial, the Samrat Yantra, that tells local time to within a few seconds.',
 real:'The Samrat Yantra at Jaipur\'s Jantar Mantar is one of the world\'s largest sundials.',
 apply:'Why do we have leap years?',
 see:{w:520,h:220,f:[
  ['Sun and Earth.',`<circle cx="100" cy="110" r="40" fill="${GD}"/>`+lbl(100,170,'Sun')],
  ['Rotation: one day.',`<circle cx="330" cy="110" r="22" fill="${BL}"/><path d="M300 80 a40 40 0 0 1 60 0" fill="none" stroke="${ink}" stroke-width="2"/><path d="M360 80 l-8 -3 l2 8z" fill="${ink}"/>`+lbl(330,60,'spins: 1 day','font-size="11"')],
  ['Revolution: one year.',`<ellipse cx="100" cy="110" rx="250" ry="70" fill="none" stroke="${GR}" stroke-dasharray="5 5"/>`+lbl(260,205,'orbit: 365¼ days → leap year every 4 years','font-weight="700"')]]},
 seeNote:'Spin = day; orbit = year.',
 do:{title:'Shadow stick',mat:'Stick, chalk, sunny ground',steps:['Mark the tip of the shadow every hour.','Find when it is shortest.'],obs:'Shortest around midday.',why:'Sun highest at noon.',lab:false},
 memo:'"Spin a day, circle a year."',
 miscon:['"The Sun moves around the Earth in a day." The Earth\'s spin makes the Sun appear to move.'],
 terms:['Rotation · घूर्णन','Revolution · परिक्रमण','Sundial · धूपघड़ी','Leap year · अधिवर्ष'],
 q:{q:'A leap year has:',o:['364 days','365 days','366 days','360 days'],a:2,why:'Extra day.'},
 exam:'Day, year, leap year: 2 marks.'},

{id:'t2',num:'11.2',title:'Phases of the Moon',
 intro:'The Moon is always a round ball. Why does it look like a thin crescent on some days and a full disc on others?',
 obj:'Explain why the Moon shows phases.',
 prior:'11.1; the Moon reflects sunlight.',
 simple:'The Moon has no light of its own; it reflects sunlight. The Sun always lights half of the Moon. As the Moon orbits the Earth, we see different amounts of its lit half — these are the phases. New Moon (amavasya): lit side faces away, we see nothing. Then waxing crescent, first quarter (half), waxing gibbous, Full Moon (purnima), then waning gibbous, last quarter, waning crescent, and back to New Moon.',
 detail:'One cycle of phases takes about 29.5 days — a lunar month. Waxing means the lit part is growing; waning means shrinking. From the northern hemisphere, the waxing Moon is lit on the right. Phases are NOT caused by the Earth\'s shadow — that would be an eclipse.',
 real:'Shukla paksha (bright fortnight) and Krishna paksha (dark fortnight) in Indian calendars follow the waxing and waning Moon.',
 apply:'About how many days after New Moon is the Full Moon?',
 see:{w:520,h:200,f:[
  ['New → crescent → first quarter.',[0,.12,.25].map((f,k)=>phase(60+k*65,90,24,f)+lbl(60+k*65,135,['new','crescent','1st qtr'][k],'font-size="10"')).join('')],
  ['→ gibbous → full.',[.38,.5].map((f,k)=>phase(255+k*65,90,24,f)+lbl(255+k*65,135,['gibbous','full'][k],'font-size="10"')).join('')],
  ['→ waning back to new: 29.5 days.',[.68,.85].map((f,k)=>phase(385+k*65,90,24,f)).join('')+lbl(260,180,'one cycle ≈ 29.5 days (lunar month)','font-weight="700"')]]},
 seeNote:'Same Moon, different views of its lit half.',
 do:{title:'Ball and lamp',mat:'Lamp (Sun), ball on a stick (Moon), your head (Earth)',steps:['In a dark room, hold the ball at arm\'s length.','Turn slowly around, watching the lit part.'],obs:'All phases appear.',why:'Changing viewing angle.',lab:true},
 memo:'"Waxing grows from the right, waning fades to the left."',
 miscon:['"Phases are caused by Earth\'s shadow." They are caused by viewing angle; Earth\'s shadow causes eclipses.'],
 terms:['Phase · कला','New Moon · अमावस्या','Full Moon · पूर्णिमा','Waxing · शुक्ल पक्ष','Waning · कृष्ण पक्ष','Lunar month · चांद्र मास'],
 q:{q:'The Moon shines because it:',o:['makes its own light','reflects sunlight','reflects Earth\'s light only','burns gas'],a:1,why:'Reflection.'},
 exam:'Explain phases: 3 marks.'},

{id:'t3',num:'11.3',title:'The Moon in the daytime sky',
 intro:'Have you seen the Moon in the morning or afternoon sky? Why is it there when the Sun is up?',
 obj:'Relate the phase of the Moon to when it rises and sets.',
 prior:'11.2.',
 simple:'The Moon rises about 50 minutes later each day. Full Moon rises at sunset and is in the sky all night. New Moon rises with the Sun (and isn\'t seen). First quarter rises around noon and is high in the sky at sunset — visible in the afternoon. Last quarter rises around midnight and is visible in the morning sky after sunrise.',
 detail:'So the Moon is above the horizon about half of the time — sometimes in daylight. A crescent seen in the evening western sky just after sunset is a young waxing Moon; a crescent seen in the eastern sky before sunrise is an old waning Moon.',
 real:'Malini saw the Moon overhead at sunset — it must have been near first quarter.',
 apply:'You see a half Moon high in the sky in the early morning. Which phase is it?',
 see:{w:520,h:220,f:[
  ['Full Moon: rises at sunset.',box(20,40,150,60,'Full Moon',GD,'rises ~6 pm')],
  ['First quarter: rises ~noon.',box(185,40,150,60,'First quarter',BL,'rises ~12 noon')],
  ['Last quarter: rises ~midnight.',box(350,40,150,60,'Last quarter',NV,'rises ~12 midnight')+lbl(260,160,'Moon rises ~50 minutes later each day','font-weight="700"')]]},
 seeNote:'Phase tells the rising time.',
 do:{title:'Moon diary',mat:'Notebook',steps:['For two weeks, note the Moon\'s shape and the time you see it.'],obs:'Later each day; shape changes.',why:'Orbit around Earth.',lab:false},
 memo:'"Full at dusk, half at noon or midnight, new with the Sun."',
 miscon:['"The Moon only comes out at night." It is often visible in daytime.'],
 terms:['Moonrise · चंद्रोदय','Horizon · क्षितिज'],
 q:{q:'The Full Moon rises at about:',o:['sunrise','noon','sunset','midnight'],a:2,why:'Opposite the Sun.'},
 exam:'Phase and rising time: 2 marks.'},

{id:'t4',num:'11.4',title:'Calendars: lunar, solar and lunisolar',
 intro:'Why does Eid move earlier each year in the English calendar, while Makar Sankranti stays near 14 January?',
 obj:'Compare lunar, solar and lunisolar calendars.',
 prior:'11.1, 11.2.',
 simple:'A solar calendar follows the Earth\'s orbit: 365 days (366 in leap years) — the Gregorian calendar we use for dates. A lunar calendar follows the Moon: 12 lunar months ≈ 354 days, about 11 days shorter than the solar year, so its months drift through the seasons (the Hijri calendar). A lunisolar calendar uses lunar months but adds an extra month (adhik maas) about every 2½–3 years to stay in step with the seasons — most Indian calendars (Vikram Samvat, Saka) are lunisolar.',
 detail:'India\'s official national calendar is the Saka calendar (adopted 1957), aligned with the solar year. Makar Sankranti follows the Sun\'s position, so it stays around 14–15 January. Festivals based on lunar dates (Diwali on Kartik amavasya, Holi on Phalguna purnima) shift by a few weeks each year but stay in the same season because of adhik maas.',
 real:'Diwali always falls in October or November, thanks to the lunisolar adjustment.',
 apply:'How many days shorter is a lunar year than a solar year? What problem does that cause?',
 see:{w:520,h:220,f:[
  ['Solar: 365¼ days.',box(20,40,150,60,'Solar',GD,'365¼ days · seasons fixed')],
  ['Lunar: ~354 days.',box(185,40,150,60,'Lunar',NV,'~354 days · drifts')],
  ['Lunisolar: lunar months + extra month.',box(350,40,150,60,'Lunisolar',GN,'adhik maas every ~3 yrs')+lbl(260,160,'365 − 354 ≈ 11 days difference each year','font-weight="700"')]]},
 seeNote:'Adhik maas keeps festivals in season.',
 do:{title:'Calendar compare',mat:'Gregorian and Hindu panchang calendars',steps:['Find dates of Holi and Diwali for 3 years.','Compare.'],obs:'Shift but stay in season.',why:'Lunisolar.',lab:false},
 memo:'"Solar fixes seasons; lunar follows Moon; lunisolar does both."',
 miscon:['"All Indian festivals follow the Moon." Makar Sankranti follows the Sun.'],
 terms:['Solar calendar · सौर पंचांग','Lunar calendar · चांद्र पंचांग','Lunisolar · चांद्र-सौर','Adhik maas · अधिक मास','Saka calendar · शक संवत्'],
 q:{q:'A lunar year is about ___ days:',o:['365','354','366','300'],a:1,why:'12 × 29.5.'},
 exam:'Types of calendars: 3 marks.'},

{id:'t5',num:'11.5',title:'Festivals, farming and the sky',
 intro:'How did farmers know when to sow, and how are festivals connected to the sky?',
 obj:'Connect sky observations with festivals, farming and traditional knowledge.',
 prior:'11.4.',
 simple:'People watched the Sun, Moon and stars to plan farming and celebrate. Many festivals mark astronomical events: Makar Sankranti (the Sun entering Makara rashi), Purnima and Amavasya festivals, harvest festivals like Baisakhi and Pongal. Nakshatras — groups of stars along the Moon\'s path — were used to mark days and seasons; the Moon passes through 27 nakshatras in its monthly journey.',
 detail:'Ancient Indian astronomers like Aryabhata (5th century) explained that the Moon shines by reflected light and gave accurate values for the length of the year. Traditional sayings linked seasons and rain to nakshatras. Today, the India Meteorological Department uses satellites, but sky-watching is still how calendars are built.',
 real:'Karva Chauth, Raksha Bandhan and many fasts are fixed by Moon phases.',
 apply:'Name two festivals linked to the Full Moon and one linked to the Sun.',
 see:{w:520,h:220,f:[
  ['Moon festivals.',box(20,40,220,60,'Moon-based',NV,'Holi (purnima) · Diwali (amavasya)')],
  ['Sun festivals.',box(280,40,220,60,'Sun-based',GD,'Makar Sankranti · Baisakhi')],
  ['27 nakshatras along the Moon\'s path.',[...Array(27)].map((_,k)=>{const a=k*2*Math.PI/27;return `<circle cx="${260+170*Math.cos(a)}" cy="${165+35*Math.sin(a)}" r="2.5" fill="${NV}"/>`}).join('')+lbl(260,170,'27 nakshatras','font-size="12" font-weight="700"')]]},
 seeNote:'Sky sets the festival calendar.',
 do:{title:'Festival survey',mat:'Calendar',steps:['List 10 festivals.','Mark each Sun-based or Moon-based.'],obs:'Most are Moon-based.',why:'Lunisolar calendars.',lab:false},
 memo:'"Purnima, amavasya, Sankranti — sky-timed celebrations."',
 miscon:['"Festivals are on random dates." They follow sky cycles.'],
 terms:['Nakshatra · नक्षत्र','Rashi · राशि','Purnima','Amavasya','Aryabhata'],
 q:{q:'Makar Sankranti is based on:',o:['the Moon','the Sun','a planet','a comet'],a:1,why:'Sun\'s position.'},
 exam:'Festivals and astronomy: 2 marks.'},

{id:'t6',num:'11.6',title:'Artificial satellites and space debris',
 intro:'How does your phone know where you are? How does the weather forecast see clouds over the whole country?',
 obj:'Describe artificial satellites, their uses, and the problem of space debris.',
 prior:'11.1–11.5.',
 simple:'The Moon is Earth\'s natural satellite. Artificial satellites are human-made objects placed in orbit around the Earth. Uses: communication (TV, phone, internet), weather forecasting and cyclone warnings, navigation (India\'s NavIC system, GPS), remote sensing for farming, forests and disasters, and scientific research. ISRO launched India\'s first satellite, Aryabhata, in 1975.',
 detail:'Geostationary satellites orbit about 36,000 km up and seem to stay over one place — good for TV and weather (INSAT series). Low-Earth-orbit satellites (a few hundred km up) take detailed pictures. Space debris — dead satellites, rocket parts and fragments — can collide with working satellites; scientists are working on ways to track and remove it.',
 real:'INSAT and NavIC satellites help fishermen in coastal states know safe fishing zones and cyclone warnings.',
 apply:'Give three uses of artificial satellites.',
 see:{w:520,h:240,f:[
  ['Earth with satellites.',`<circle cx="260" cy="130" r="55" fill="${BL}" opacity=".6"/><circle cx="260" cy="130" r="95" fill="none" stroke="${GR}" stroke-dasharray="4 4"/><rect x="345" y="85" width="16" height="10" fill="${OR}"/><rect x="331" y="88" width="12" height="4" fill="${NV}"/><rect x="363" y="88" width="12" height="4" fill="${NV}"/>`],
  ['Uses.',lbl(90,40,'communication','fill="'+NV+'"')+lbl(90,65,'weather','fill="'+NV+'"')+lbl(90,90,'navigation (NavIC)','fill="'+NV+'"')+lbl(90,115,'remote sensing','fill="'+NV+'"')],
  ['Space debris.',[...Array(12)].map((_,k)=>`<circle cx="${260+110*Math.cos(k)}" cy="${130+110*Math.sin(k)}" r="2" fill="${GR}"/>`).join('')+lbl(430,220,'space debris: a growing risk','fill="'+OR+'"')]]},
 seeNote:'Satellites serve daily life.',
 do:{title:'Satellite spotting',mat:'Clear evening sky',steps:['After sunset, watch for a steady moving point of light.'],obs:'A satellite or the ISS.',why:'Reflects sunlight.',lab:false},
 memo:'"Talk, weather, find the way, watch the land."',
 miscon:['"Satellites stay in space with no speed." They move fast in orbit.'],
 terms:['Artificial satellite · कृत्रिम उपग्रह','Orbit · कक्षा','Geostationary · भूस्थिर','Space debris · अंतरिक्ष मलबा','NavIC'],
 q:{q:'India\'s first satellite (1975) was:',o:['INSAT','Aryabhata','Chandrayaan','NavIC'],a:1,why:'Aryabhata.'},
 exam:'Uses of satellites: 3 marks.'}
];

const CARDS=[['Day','One rotation of Earth (~24 h).'],['Year','One revolution (~365¼ days).'],['Leap year','366 days, every 4 years.'],['Phases','Viewing angle of the Moon\'s lit half.'],['Lunar month','~29.5 days, new to new.'],['Waxing / waning','Shukla / Krishna paksha.'],['Moonrise','~50 minutes later each day.'],['Lunar year','~354 days; drifts.'],['Lunisolar','Adds adhik maas; Indian calendars.'],['Satellites','Communication, weather, NavIC, remote sensing.']];

const Q=[
 {lv:1,q:'The Moon shines by:',o:['its own light','reflected sunlight','starlight','Earthlight only'],a:1,w:'Reflection.'},
 {lv:1,q:'Full Moon is called:',o:['Amavasya','Purnima','Ekadashi','Sankranti'],a:1,w:'Purnima.'},
 {lv:1,q:'One lunar month is about:',o:['24 days','29.5 days','31 days','365 days'],a:1,w:'29.5.'},
 {lv:2,q:'The phase never seen from Earth:',o:['full','new','half','crescent'],a:1,w:'Lit side away.'},
 {lv:2,q:'Lunar year is shorter than solar year by about:',o:['1 day','11 days','30 days','5 days'],a:1,w:'365 − 354.'},
 {lv:2,q:'India\'s satellite navigation system:',o:['GPS','NavIC','INSAT','Galileo'],a:1,w:'NavIC.'},
 {lv:3,q:'A half Moon high in the sky at sunset is:',o:['first quarter','last quarter','full','new'],a:0,w:'Rises ~noon.'},
 {lv:3,q:'Adhik maas is added to:',o:['make the year longer for fun','keep lunar months in step with seasons','mark eclipses','count leap seconds'],a:1,w:'Lunisolar.'},
 {lv:4,q:'Phases of the Moon are caused by:',o:['Earth\'s shadow','changing view of the Moon\'s lit half','clouds','Moon changing size'],a:1,w:'Viewing angle.'},
 {lv:4,q:'Geostationary satellites are useful for TV because they:',o:['move very fast across the sky','stay over the same place','are very close','have no antennas'],a:1,w:'Fixed position.'},
 {lv:5,open:true,m:3,q:'Explain why the Moon shows phases.',ans:['Moon reflects sunlight; Sun lights half of it (1)','As Moon orbits Earth, we see different parts of the lit half (1)','New → crescent → quarter → gibbous → full and back, in ~29.5 days (1)']},
 {lv:5,open:true,m:3,q:'Distinguish solar, lunar and lunisolar calendars with one example each.',ans:['Solar: follows Earth\'s orbit, 365¼ days — Gregorian (1)','Lunar: 12 lunar months ≈ 354 days, drifts — Hijri (1)','Lunisolar: lunar months + adhik maas — Vikram Samvat/Hindu calendars (1)']}
];

const ONEMIN=['Day = rotation; year = revolution; leap year.','Phases: lit half viewed from Earth.','Moonrise later each day; Moon in day sky.','Solar, lunar, lunisolar calendars.','Festivals and nakshatras.','Artificial satellites; space debris.'];
const KEYS=[['day/year',/rotation|revolution|leap/i],['phases',/phase|crescent|gibbous/i],['moonrise',/rise|daytime/i],['calendar',/calendar|lunar|solar/i],['festival',/festival|nakshatra|purnima/i],['satellite',/satellite|debris/i]];

/* ---------- lab ---------- */
let day=7.5,timer=null,quiz=null,wired=false;
function rise(d){const h=(6+d*24/29.5)%24;const hh=Math.floor(h),mm=Math.round((h-hh)*60/10)*10;const ap=hh<12?'am':'pm';const h12=((hh+11)%12)+1;return `${h12}:${String(mm%60).padStart(2,'0')} ${ap}`}
function draw(){const f=day/29.5;let s=`<rect x="0" y="0" width="230" height="320" fill="#0d1030"/>`;s+=`<rect x="0" y="0" width="14" height="320" fill="${GD}" opacity=".8"/>`+T(110,20,'view from above','font-size="11" fill="#ccc"')+T(30,300,'sunlight →','font-size="10" fill="'+GD+'" text-anchor="start"');
 const ex=125,ey=165,R=85;s+=`<circle cx="${ex}" cy="${ey}" r="${R}" fill="none" stroke="#556" stroke-dasharray="3 4"/><circle cx="${ex}" cy="${ey}" r="16" fill="${BL}"/><path d="M${ex} ${ey-16} A16 16 0 0 0 ${ex} ${ey+16}Z" fill="#000" opacity=".45"/>`;
 const a=Math.PI+2*Math.PI*f;const mx=ex+R*Math.cos(a),my=ey-R*Math.sin(a);s+=`<circle cx="${mx}" cy="${my}" r="11" fill="#2b2f45"/><path d="M${mx} ${my-11} A11 11 0 0 0 ${mx} ${my+11}Z" fill="#f4efd6"/>`;
 s+=`<line x1="${ex}" y1="${ey}" x2="${mx}" y2="${my}" stroke="#888" stroke-dasharray="2 3"/>`+T(ex,ey+32,'Earth','font-size="10" fill="#ccc"');
 s+=`<rect x="235" y="0" width="225" height="320" fill="#121636"/>`+T(347,20,'seen from Earth','font-size="11" fill="#ccc"')+phase(347,140,70,f)+T(347,245,pname(f),'font-size="14" font-weight="700" fill="#fff"')+T(347,270,`day ${day} of 29.5`,'font-size="11" fill="#ccc"')+T(347,292,`rises ≈ ${rise(day)}`,'font-size="12" fill="'+GD+'"');
 $('#mnSvg').innerHTML=s;$('#mnDv').textContent=day;if(!quiz){const p=pname(f);$('#mnOut').innerHTML=`<p><b>${p}</b>. ${f<.5&&day>1?'Waxing — lit part growing (Shukla paksha).':day>15.7&&day<28.5?'Waning — lit part shrinking (Krishna paksha).':''}</p><p>The Moon rises about ${rise(day)} and is up for roughly 12 hours after that.</p>`}}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='mnD'){day=+e.target.value;draw()}});document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ph]');if(!b||!quiz)return;const ok=b.dataset.ph===quiz;$('#mnOut').innerHTML=ok?`<p class="fb ok">Correct — ${quiz}.</p>`:`<p class="fb no">Not quite — it is ${quiz}.</p>`;quiz=null;$('#mnOpts').innerHTML=''})}
function labClick(b){if(b.id==='mnPlay'){clearInterval(timer);day=0;timer=setInterval(()=>{if(!$('#mnSvg')||!$('#mnSvg').isConnected){clearInterval(timer);return}day=Math.round((day+.5)*2)/2;if(day>29.5){clearInterval(timer);day=29.5}$('#mnD').value=day;draw()},150);return true}
 if(b.id==='mnQ'){clearInterval(timer);const opts=['New Moon (Amavasya)','Waxing crescent','First quarter','Waxing gibbous','Full Moon (Purnima)','Waning gibbous','Last (third) quarter','Waning crescent'];const days=[0,4,7.5,11,15,18.5,22,26];const k=Math.floor(Math.random()*8);day=days[k];$('#mnD').value=day;quiz=null;draw();quiz=opts[k];
  $('#mnOut').innerHTML='<p><b>Quiz:</b> which phase is shown on the right? (Ignore the label!)</p>';$('#mnSvg').querySelectorAll('text').forEach(t=>{if(t.textContent===quiz||t.textContent.startsWith('day '))t.textContent='?'});$('#mnOpts').innerHTML=opts.map(o=>`<button class="btn" type="button" data-ph="${o}">${o.replace(/ \(.*\)/,'')}</button>`).join(' ');return true}return false}
function labChange(){return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
