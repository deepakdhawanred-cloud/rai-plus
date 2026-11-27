/* Rai Plus content pack: Class 7 Science (Curiosity), Chapter 12 – Earth, Moon, and the Sun. Bilingual terms. */
RP.register({key:'7sci12',cls:'7',subject:'Science',ch:'12',title:"Earth, Moon, and the Sun",color:'#3c3489',
crumb:"Class 7 Science · Curiosity · पृथ्वी, चंद्रमा और सूर्य",h1:"Chapter 12: Earth, Moon, and the Sun",sub:"पृथ्वी, चंद्रमा और सूर्य. Rotation and day–night, revolution and the year, phases of the Moon, and solar and lunar eclipses.",heroLabel:"Sun, Earth and Moon in a line",labName:'Sky simulator',
theme:"\n:root{--g:light-dark(#3c3489,#b4adf0);--g2:light-dark(#eeedfa,#110f24);--line:light-dark(#d6d3f2,#2d2a55);--bg:light-dark(#ffffff,#0a0916);--card:light-dark(#ffffff,#100e20);\n--ink:light-dark(#16133a,#e6e4f8);--mute:light-dark(#555079,#b2aed3);--y:light-dark(#a3501b,#f0a877);--y2:light-dark(#fbeee4,#2a160a);--hd:#2b2570}\n",
labHTML:`  <h2>Sky simulator · आकाश सिम्युलेटर</h2>
  <p><b>Moon:</b> move through a lunar month and see the phase from Earth; line up for an eclipse. <b>Day & night:</b> spin the Earth and watch Rewari move into daylight.</p>
  <div class="sim"><div><div class="fig" style="max-width:none;background:#0d0b22;border-radius:10px"><svg id="kSvg" viewBox="0 0 460 320" role="img" aria-label="Earth, Moon and Sun" style="color:#eee"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="kMode"><option value="moon">Moon phases & eclipses</option><option value="spin">Day and night</option></select></label></div>
  <div class="ctrl"><label>Day of lunar month: <b id="kDv"></b><input type="range" class="kS" id="kD" min="0" max="29.5" step="0.5" value="7"></label></div>
  <div class="ctrl"><label><input type="checkbox" id="kTilt" checked> Moon's orbit is tilted (real sky)</label> <label>Month no.<input type="range" class="kS" id="kM" min="0" max="11" value="0" style="width:8em"></label></div>
  <div class="ctrl"><label>Hour (Earth spin): <b id="kHv"></b><input type="range" class="kS" id="kH" min="0" max="24" step="1" value="12"></label></div>
  <div class="ctrl"><button class="btn" id="kPlay">Play</button></div>
  <div class="box y" id="kOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3c3489',LABNAME='Sky simulator',MIND_CENTER='Earth, Moon, Sun';
const PU='#3c3489',YE='#f2c14e',BL='#2f6fbf',GR='#888780',OR='#a3501b',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const arr=(x1,y1,x2,y2,c=YE,w=2)=>{const a=Math.atan2(y2-y1,x2-x1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/><path d="M${x2} ${y2} l${(-9*Math.cos(a-0.45)).toFixed(1)} ${(-9*Math.sin(a-0.45)).toFixed(1)} M${x2} ${y2} l${(-9*Math.cos(a+0.45)).toFixed(1)} ${(-9*Math.sin(a+0.45)).toFixed(1)}" stroke="${c}" stroke-width="${w}"/>`};
const sun=(x,y,r=26)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${YE}"/>`;
// phase disc as seen from Earth: f = fraction of cycle (0 new, .5 full)
function phase(cx,cy,r,f){const lit='#f4f1e0',dark='#2a2a3a';const k=Math.cos(2*Math.PI*f);// 1 new, -1 full
 const waxing=f<0.5;const rx=Math.abs(k)*r;let s=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${dark}"/>`;
 const half=waxing?`M${cx} ${cy-r} A${r} ${r} 0 0 1 ${cx} ${cy+r}`:`M${cx} ${cy-r} A${r} ${r} 0 0 0 ${cx} ${cy+r}`;
 const sweep=(waxing?(k>0?0:1):(k>0?1:0));s+=`<path d="${half} A${rx} ${r} 0 0 ${sweep} ${cx} ${cy-r}z" fill="${lit}"/>`;return s}
function earthLit(cx,cy,r){return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#1a3a6a"/><path d="M${cx} ${cy-r} A${r} ${r} 0 0 0 ${cx} ${cy+r}z" fill="${BL}"/>`}
function heroDraw(){return `<circle cx="50" cy="70" r="26" fill="#fff"/><circle cx="200" cy="70" r="16" fill="#fff" opacity=".85"/><circle cx="270" cy="70" r="7" fill="#fff" opacity=".7"/>`}
const HERO=heroDraw;
const MIND=[['Rotation: day & night',100,50],['Revolution: the year',420,50],['The Moon',90,150],['Phases',430,150],['Solar eclipse',110,250],['Lunar eclipse',410,250]];

const C=[
{id:'k1',num:'12.1',title:'Rotation: day and night · घूर्णन: दिन और रात',
 intro:'Why does the Sun seem to rise in the east and set in the west?',
 obj:'Explain day and night by the Earth\'s rotation.',
 prior:'Class 6: Beyond Earth (Solar System).',
 simple:'The Earth spins on its axis — an imaginary line through the North and South Poles — from west to east. This is rotation (घूर्णन). One rotation takes about 24 hours. At any time, half the Earth faces the Sun (day) and the other half faces away (night). Because the Earth turns from west to east, the Sun appears to move across the sky from east to west.',
 detail:'Places to the east see sunrise earlier: the Sun rises in Arunachal Pradesh nearly two hours before it rises in Gujarat. The Earth\'s axis is tilted, which (with revolution) causes seasons — you will learn more later. Aryabhata explained that the Earth rotates and the stars only appear to move.',
 real:'Sunrise in Itanagar happens much earlier than in Rewari.',
 apply:'If the Earth stopped rotating, what would happen to day and night?',
 see:{w:520,h:220,f:[
  ['Sunlight from one side.',`<rect width="520" height="220" rx="8" fill="#0d0b22"/>`+sun(40,110)+arr(80,80,180,80)+arr(80,140,180,140)],
  ['Half the Earth is in day, half in night.',earthLit(300,110,70)+lbl(260,110,'day','fill="#fff"')+lbl(340,110,'night','fill="#fff"')],
  ['Earth spins west → east in 24 h.',`<path d="M250 30 A70 20 0 0 0 350 30" fill="none" stroke="#fff" stroke-width="2"/>`+arr(340,32,352,28,'#fff')+lbl(440,200,'rotation · घूर्णन','fill="#fff" font-weight="700"')]]},
 seeNote:'Sun\'s motion is apparent.',
 do:{title:'Torch and ball',mat:'Torch, ball, sticker (your town), dark room',steps:['Shine the torch on the ball.','Turn the ball slowly west to east.','Watch the sticker go from night to day.'],obs:'Sticker enters light from the "east".',why:'Rotation.',lab:true},
 memo:'"Earth spins, Sun seems to move."',
 miscon:['"The Sun goes round the Earth every day." The Earth rotates.'],
 terms:['Rotation · घूर्णन','Axis · अक्ष','Day and night'],
 q:{q:'Day and night are caused by:',o:['revolution','rotation','the Moon','clouds'],a:1,why:'Spin.'},
 exam:'Explain day and night: 2 marks.'},

{id:'k2',num:'12.2',title:'Revolution: the year · परिक्रमण: वर्ष',
 intro:'Why do we add a day in February every four years?',
 obj:'Describe the Earth\'s revolution and the year.',
 prior:'12.1.',
 simple:'While rotating, the Earth also moves around the Sun in a path called its orbit. One complete trip is a revolution (परिक्रमण) and takes about 365¼ days — one year. Calendars have 365 days, so every four years an extra day (29 February) is added: a leap year (अधिवर्ष) has 366 days.',
 detail:'The Earth travels about 940 million km in one revolution, at about 30 km every second! The tilt of the axis and revolution together cause seasons. Different calendars (Indian national calendar, Islamic, Gregorian) are based on the Sun, the Moon, or both.',
 real:'2024 and 2028 are leap years.',
 apply:'Is 2026 a leap year? How many days does it have?',
 see:{w:520,h:220,f:[
  ['The Sun at the centre.',`<rect width="520" height="220" rx="8" fill="#0d0b22"/>`+sun(260,110,24)],
  ['The Earth\'s orbit.',`<ellipse cx="260" cy="110" rx="200" ry="80" fill="none" stroke="#888" stroke-dasharray="5 4"/>`],
  ['One revolution ≈ 365¼ days = 1 year.',`<circle cx="460" cy="110" r="10" fill="${BL}"/>`+arr(455,140,430,170,'#fff')+lbl(260,210,'revolution · परिक्रमण: 365¼ days','fill="#fff" font-weight="700"')]]},
 seeNote:'Leap year every 4 years.',
 do:{title:'Calendar check',mat:'Calendars of different years',steps:['Find February in 2023, 2024, 2025.'],obs:'2024 has 29 days in February.',why:'Leap year.',lab:false},
 memo:'"Spin = day; trip round the Sun = year."',
 miscon:['"A year is exactly 365 days." It is about 365¼.'],
 terms:['Revolution · परिक्रमण','Orbit · कक्षा','Year','Leap year · अधिवर्ष'],
 q:{q:'One revolution of the Earth takes about:',o:['24 hours','29.5 days','365¼ days','10 years'],a:2,why:'A year.'},
 exam:'Rotation vs revolution: 2 marks.'},

{id:'k3',num:'12.3',title:'The Moon · चंद्रमा',
 intro:'Why do we always see the same face of the Moon?',
 obj:'Describe the Moon and its motion.',
 prior:'Class 6 Ch 12.',
 simple:'The Moon is Earth\'s natural satellite. It has no light of its own; it shines by reflecting sunlight. It revolves around the Earth in about 27⅓ days and also rotates on its axis in the same time — so the same side always faces the Earth. The Moon has no air or water on its surface; it has craters made by falling rocks.',
 detail:'The Moon is about 3,84,000 km from Earth. Its gravity causes tides in the oceans. India\'s Chandrayaan-3 landed near the Moon\'s south pole in August 2023; 23 August is celebrated as National Space Day.',
 real:'Tides at Mumbai\'s coast rise and fall twice a day mainly because of the Moon.',
 apply:'Why can\'t we see the far side of the Moon from Earth?',
 see:{w:520,h:220,f:[
  ['Earth and its Moon.',`<rect width="520" height="220" rx="8" fill="#0d0b22"/>`+`<circle cx="260" cy="110" r="30" fill="${BL}"/>`],
  ['The Moon revolves in ~27⅓ days.',`<circle cx="260" cy="110" r="90" fill="none" stroke="#888" stroke-dasharray="4 4"/><circle cx="350" cy="110" r="12" fill="#ddd"/>`],
  ['Same side always faces Earth.',`<path d="M338 110 a12 12 0 0 1 0 -0.1" fill="none"/><circle cx="342" cy="110" r="3" fill="${OR}"/>`+lbl(260,215,'reflects sunlight; no own light','fill="#fff" font-weight="700"')]]},
 seeNote:'Same face, reflected light.',
 do:{title:'Same face walk',mat:'A chair (Earth), a friend (Moon)',steps:['Friend walks around the chair always facing it.','Notice the friend also turns once.'],obs:'Rotates once per revolution.',why:'Same face.',lab:false},
 memo:'"Moon: borrowed light, same face."',
 miscon:['"The Moon makes its own light." It reflects sunlight.'],
 terms:['Natural satellite · प्राकृतिक उपग्रह','Craters · क्रेटर','Tides · ज्वार-भाटा'],
 q:{q:'The Moon shines because it:',o:['burns','reflects sunlight','has volcanoes','is hot'],a:1,why:'Reflection.'},
 exam:'Facts about the Moon: 2 marks.'},

{id:'k4',num:'12.4',title:'Phases of the Moon · चंद्रमा की कलाएँ',
 intro:'Why does the Moon look like a thin crescent on some nights and a full disc on others?',
 obj:'Explain the phases of the Moon.',
 prior:'12.3.',
 simple:'The Sun always lights half of the Moon. As the Moon goes around the Earth, we see different amounts of its lit half: these are phases (कलाएँ). New Moon (अमावस्या) — lit side faces away, Moon not seen. Then crescent, first quarter (half), gibbous, and Full Moon (पूर्णिमा) — whole lit face towards us. Then it decreases back. From one new moon to the next takes about 29½ days (a lunar month).',
 detail:'Waxing (शुक्ल पक्ष) — lit part grows after new moon; waning (कृष्ण पक्ष) — lit part shrinks after full moon. Festivals: Diwali on amavasya; Holi and Guru Purnima on purnima. The lunar month (29½ days) is longer than 27⅓ days because the Earth also moves around the Sun meanwhile.',
 real:'Diwali falls on a new-moon night; Holi on a full-moon night.',
 apply:'Is the Moon visible on Diwali night? Why?',
 see:{w:520,h:200,f:[
  ['New → crescent → first quarter.',`<rect width="520" height="200" rx="8" fill="#0d0b22"/>`+[0,0.12,0.25].map((f,k)=>phase(60+k*70,90,24,f)).join('')],
  ['→ gibbous → full.',[0.37,0.5].map((f,k)=>phase(270+k*70,90,24,f)).join('')],
  ['Then it wanes back to new moon: ~29½ days.',[0.63,0.75,0.88].map((f,k)=>phase(60+k*60,160,18,f)).join('')+lbl(370,165,'waxing → full → waning → new','fill="#fff" font-weight="700"')]]},
 seeNote:'Half lit always; we see part of it.',
 do:{title:'Moon diary',mat:'Notebook',steps:['Draw the Moon\'s shape every clear night for a month.','Note dates of full and new moon.'],obs:'Shapes repeat in ~29½ days.',why:'Phases.',lab:false},
 memo:'"Amavasya dark, purnima bright."',
 miscon:['"Phases are caused by Earth\'s shadow." They are due to how much lit half we see.'],
 terms:['Phases · कलाएँ','New moon · अमावस्या','Full moon · पूर्णिमा','Waxing · शुक्ल पक्ष','Waning · कृष्ण पक्ष'],
 q:{q:'Phases of the Moon are due to:',o:['Earth\'s shadow','how much of the lit half we see','clouds','the Moon\'s light changing'],a:1,why:'Geometry.'},
 exam:'Explain phases with a diagram: 3 marks.'},

{id:'k5',num:'12.5',title:'Solar eclipse · सूर्य ग्रहण',
 intro:'How can the small Moon hide the huge Sun?',
 obj:'Explain a solar eclipse and safety in viewing it.',
 prior:'12.4; Ch 11 (shadows).',
 simple:'A solar eclipse (सूर्य ग्रहण) happens when the Moon comes between the Sun and the Earth in a straight line, and the Moon\'s shadow falls on the Earth. It can happen only on a new-moon day. The Moon looks as big as the Sun because, though about 400 times smaller, it is also about 400 times closer.',
 detail:'Total solar eclipse — in the darkest part of the shadow (umbra) the Sun is completely covered; partial — only part covered; annular — a bright ring remains. NEVER look at the Sun directly, even during an eclipse — it can permanently damage the eyes. Use certified eclipse glasses or a pinhole projector.',
 real:'Indians watched the partial solar eclipse safely with pinhole projectors and eclipse glasses.',
 apply:'Why doesn\'t a solar eclipse happen every new moon?',
 see:{w:520,h:200,f:[
  ['Sun, Moon, Earth in a line.',`<rect width="520" height="200" rx="8" fill="#0d0b22"/>`+sun(50,100,40)+`<circle cx="260" cy="100" r="9" fill="#ddd"/><circle cx="440" cy="100" r="30" fill="${BL}"/>`],
  ['Moon\'s shadow falls on Earth.',`<polygon points="260,91 260,109 412,104 412,96" fill="#000" opacity=".7"/><polygon points="260,91 260,109 440,130 440,70" fill="#000" opacity=".3"/>`],
  ['Only on new-moon days. Never look directly at the Sun!',lbl(260,180,'solar eclipse · सूर्य ग्रहण','fill="#fff" font-weight="700"')]]},
 seeNote:'Order: Sun – Moon – Earth.',
 do:{title:'Pinhole viewer',mat:'Cardboard with a pinhole, white paper',steps:['Stand with your back to the Sun.','Let sunlight through the pinhole onto paper.'],obs:'Image of the Sun (and eclipse).',why:'Safe viewing.',lab:false},
 memo:'"Solar: Moon in the middle, on amavasya."',
 miscon:['"Eclipses are harmful to food or babies." They are natural events; only looking at the Sun is dangerous.'],
 terms:['Solar eclipse · सूर्य ग्रहण','Umbra · प्रच्छाया','Total / partial / annular','Eclipse glasses'],
 q:{q:'A solar eclipse can occur only on:',o:['full moon','new moon','any day','first quarter'],a:1,why:'Moon between Sun and Earth.'},
 exam:'Solar eclipse with diagram and safety: 3 marks.'},

{id:'k6',num:'12.6',title:'Lunar eclipse · चंद्र ग्रहण',
 intro:'Why does the full Moon sometimes turn coppery red?',
 obj:'Explain a lunar eclipse and why eclipses don\'t happen every month.',
 prior:'12.5.',
 simple:'A lunar eclipse (चंद्र ग्रहण) happens when the Earth comes between the Sun and the Moon in a straight line, and the Earth\'s shadow falls on the Moon. It can happen only on a full-moon night. It is safe to watch with naked eyes. During a total lunar eclipse the Moon often looks reddish, because a little sunlight bends through Earth\'s atmosphere.',
 detail:'Eclipses do not happen every month because the Moon\'s orbit is tilted (about 5°) to the Earth\'s orbit; usually the Moon passes a little above or below the line joining the Sun and Earth. Eclipses happen only when a new or full moon occurs near the points where the orbits cross. Scientists predict eclipses years in advance.',
 real:'A total lunar eclipse visible from India was widely watched in September 2025.',
 apply:'Why is it safe to see a lunar eclipse without glasses?',
 see:{w:520,h:200,f:[
  ['Sun, Earth, Moon in a line.',`<rect width="520" height="200" rx="8" fill="#0d0b22"/>`+sun(50,100,40)+`<circle cx="300" cy="100" r="30" fill="${BL}"/><circle cx="450" cy="100" r="9" fill="#ddd"/>`],
  ['Earth\'s shadow falls on the Moon.',`<polygon points="300,70 300,130 470,110 470,90" fill="#000" opacity=".6"/><circle cx="450" cy="100" r="9" fill="#b5532e"/>`],
  ['Only on full-moon nights; safe to watch.',lbl(260,180,'lunar eclipse · चंद्र ग्रहण','fill="#fff" font-weight="700"')]]},
 seeNote:'Order: Sun – Earth – Moon.',
 do:{title:'Eclipse model',mat:'Torch, big ball (Earth), small ball (Moon)',steps:['Line up torch–small ball–big ball (solar).','Line up torch–big ball–small ball (lunar).'],obs:'Shadows fall on Earth / Moon.',why:'Eclipses.',lab:true},
 memo:'"Lunar: Earth in the middle, on purnima."',
 miscon:['"Eclipses happen every month." The Moon\'s orbit is tilted.'],
 terms:['Lunar eclipse · चंद्र ग्रहण','Blood moon','Tilted orbit'],
 q:{q:'In a lunar eclipse, which is in the middle?',o:['Sun','Moon','Earth','none'],a:2,why:'Earth\'s shadow on Moon.'},
 exam:'Solar vs lunar eclipse: 3 marks.'}
];

const CARDS=[['Rotation','Earth spins W→E in ~24 h → day and night.'],['Apparent motion','Sun seems to move E→W.'],['Revolution','Around the Sun in 365¼ days.'],['Leap year','366 days, every 4 years.'],['Moon','Reflects sunlight; same face to Earth.'],['Lunar month','~29½ days (new to new).'],['New moon','Amavasya; not visible.'],['Full moon','Purnima; whole face lit.'],['Solar eclipse','Sun–Moon–Earth; new moon; never look at Sun.'],['Lunar eclipse','Sun–Earth–Moon; full moon; safe to view.'],['Not every month','Moon\'s orbit tilted ~5°.']];

const Q=[
 {lv:1,q:'Earth rotates from:',o:['east to west','west to east','north to south','south to north'],a:1,w:'W→E.'},
 {lv:1,q:'A leap year has:',o:['364 days','365 days','366 days','360 days'],a:2,w:'366.'},
 {lv:1,q:'On amavasya the Moon is:',o:['full','not visible','half','red'],a:1,w:'New moon.'},
 {lv:2,q:'Time for one rotation of Earth:',o:['24 hours','365 days','29.5 days','1 hour'],a:0,w:'A day.'},
 {lv:2,q:'Lunar eclipse occurs on:',o:['new moon','full moon','any night','first quarter'],a:1,w:'Earth between.'},
 {lv:2,q:'We see the Moon because it:',o:['glows','reflects sunlight','is hot','is close'],a:1,w:'Reflection.'},
 {lv:3,q:'During a solar eclipse the order is:',o:['Sun–Earth–Moon','Sun–Moon–Earth','Moon–Sun–Earth','Earth–Sun–Moon'],a:1,w:'Moon in middle.'},
 {lv:3,q:'Sun appears to rise in the east because:',o:['Sun moves','Earth rotates west to east','Moon pushes it','clouds'],a:1,w:'Apparent motion.'},
 {lv:4,q:'Eclipses don\'t occur every month because:',o:['the Moon is too small','the Moon\'s orbit is tilted','clouds block them','the Sun moves'],a:1,w:'Tilt.'},
 {lv:4,q:'Sunrise in Arunachal Pradesh is earlier than in Gujarat because:',o:['it is higher','it is further east','it is colder','it is bigger'],a:1,w:'East sees Sun first.'},
 {lv:5,open:true,m:3,q:'Explain why the Moon shows phases.',ans:['Sun always lights half the Moon (1)','Moon revolves around Earth (1)','We see different portions of the lit half: new → full → new (1)']},
 {lv:5,open:true,m:4,q:'Give two differences between a solar and a lunar eclipse, with the order of bodies.',ans:['Solar: Sun–Moon–Earth (1)','Lunar: Sun–Earth–Moon (1)','Solar on new moon; lunar on full moon (1)','Solar unsafe to view directly; lunar safe (1)']}
];

const ONEMIN=['Rotation: day and night; Sun\'s apparent motion.','Revolution: 365¼ days; leap year.','Moon reflects light; same face.','Phases: new → full → new in 29½ days.','Solar eclipse: Moon in middle, new moon; protect eyes.','Lunar eclipse: Earth in middle, full moon; tilted orbit.'];
const KEYS=[['rotation',/rotat|घूर्णन/i],['revolution/year',/revolution|365|leap/i],['moon reflects',/reflect/i],['phases',/phase|new moon|full moon|amavas|purnima/i],['solar eclipse',/solar eclipse|सूर्य ग्रहण/i],['lunar eclipse',/lunar eclipse|चंद्र ग्रहण/i]];

/* ---------- lab ---------- */
let mode='moon',day=7,tilt=true,mon=0,hr=12,play=false,raf=null;
function stop(){play=false;if(raf)cancelAnimationFrame(raf);raf=null;const b=$('#kPlay');if(b)b.textContent='Play'}
function vis(){const s=$('#kSvg');return s&&s.isConnected&&s.getClientRects().length}
function drawMoon(){const f=day/29.5;const ex=200,ey=165,R=110;const a=Math.PI-2*Math.PI*f;// new moon at left (towards Sun)
 let s=sun(20,165,34)+[0,1,2,3,4].map(k=>arr(60,85+k*40,110,85+k*40,YE,1.2)).join('');
 s+=`<circle cx="${ex}" cy="${ey}" r="${R}" fill="none" stroke="#556" stroke-dasharray="4 4"/>`+earthLit(ex,ey,26);
 const mx=ex+R*Math.cos(a),my=ey-R*Math.sin(a);const node=(mon%6===0)||(mon%6===5);const yoff=tilt&&!node?(mon%2?1:-1)*14:0;
 s+=`<circle cx="${mx.toFixed(1)}" cy="${(my+yoff*0).toFixed(1)}" r="10" fill="#333"/><path d="M${mx.toFixed(1)} ${(my-10).toFixed(1)} A10 10 0 0 0 ${mx.toFixed(1)} ${(my+10).toFixed(1)}z" fill="#eee"/>`;
 const nearNew=Math.abs(f)<0.025||Math.abs(f-1)<0.025,nearFull=Math.abs(f-0.5)<0.025;const ecl=(nearNew||nearFull)&&(!tilt||node);
 if(ecl&&nearNew)s+=`<polygon points="${mx},${my-10} ${mx},${my+10} ${ex-24},${ey+4} ${ex-24},${ey-4}" fill="#000" opacity=".8"/>`;
 if(ecl&&nearFull)s+=`<polygon points="${ex},${ey-26} ${ex},${ey+26} ${mx+12},${my+6} ${mx+12},${my-6}" fill="#000" opacity=".5"/><circle cx="${mx}" cy="${my}" r="10" fill="#b5532e"/>`;
 // view from Earth
 s+=`<rect x="350" y="20" width="100" height="120" rx="8" fill="#151330" stroke="#445"/>`+T(400,38,'seen from Earth','font-size="11"')+(ecl&&nearFull?`<circle cx="400" cy="85" r="30" fill="#b5532e"/>`:ecl&&nearNew?sun(400,85,30)+`<circle cx="400" cy="85" r="30" fill="#111"/>`:phase(400,85,30,f));
 const name=f<0.03||f>0.97?'New moon · अमावस्या':f<0.22?'Waxing crescent':f<0.28?'First quarter':f<0.47?'Waxing gibbous':f<0.53?'Full moon · पूर्णिमा':f<0.72?'Waning gibbous':f<0.78?'Last quarter':'Waning crescent';
 s+=T(400,132,name.split(' · ')[0],'font-size="11"')+(tilt?T(200,300,node?'Moon crosses Earth\'s orbit plane this month':'Moon passes above/below the Sun–Earth line this month','font-size="11" fill="#bbb"'):'');
 $('#kSvg').innerHTML=s;$('#kDv').textContent=day;
 let m=`<p><b>Day ${day}: ${name}</b></p>`;if(nearNew)m+=ecl?'<p class="fb ok">Solar eclipse! The Moon is between the Sun and the Earth and its shadow falls on Earth. Never look at the Sun directly.</p>':'<p>New moon — but no eclipse this month: the Moon passes slightly above or below the Sun–Earth line (tilted orbit). Try another month number.</p>';
 else if(nearFull)m+=ecl?'<p class="fb ok">Lunar eclipse! The Earth is between the Sun and the Moon; Earth\'s shadow turns the Moon reddish.</p>':'<p>Full moon — no eclipse this month because of the tilted orbit. Try another month number.</p>';
 else m+=f<0.5?'<p>Waxing (शुक्ल पक्ष): we see more of the lit half each night.</p>':'<p>Waning (कृष्ण पक्ष): we see less of the lit half each night.</p>';$('#kOut').innerHTML=m}
function drawSpin(){const cx=240,cy=160,R=90;let s=sun(30,160,34)+[0,1,2,3].map(k=>arr(70,100+k*40,130,100+k*40,YE,1.2)).join('')+earthLit(cx,cy,R);
 const a=Math.PI-(hr/24)*2*Math.PI;// noon (12) faces Sun (left)
 const px=cx+R*Math.cos(a),py=cy-R*Math.sin(a)*0.3;const dayside=Math.cos(a)<0;
 s+=`<ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${R*0.3}" fill="none" stroke="#9cc" stroke-dasharray="3 3"/><circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="7" fill="${OR}" stroke="#fff"/>`+T(px,py-12,'Rewari','font-size="11"');
 s+=`<line x1="${cx}" y1="${cy-R-20}" x2="${cx}" y2="${cy+R+20}" stroke="#ccc" stroke-dasharray="4 3"/>`+T(cx,cy-R-26,'N','font-size="12"')+arr(cx+40,cy-R-6,cx+60,cy-R-2,'#fff',1.5)+T(cx+80,cy-R,'W→E','font-size="11"');
 s+=T(400,40,`${String(hr%24).padStart(2,'0')}:00`,'font-size="20" font-weight="700"')+T(400,64,dayside?'☀ day':'☾ night','font-size="14"');
 $('#kSvg').innerHTML=s;$('#kHv').textContent=hr+':00';
 const t=hr%24;$('#kOut').innerHTML=`<p>${t===6?'Sunrise: Rewari is turning into the Sun\'s light (east first).':t===12?'Noon: Rewari faces the Sun.':t===18?'Sunset: Rewari is turning away from the Sun.':t===0?'Midnight: Rewari faces away from the Sun.':dayside?'Daytime in Rewari.':'Night in Rewari.'}</p><p class="note">The Earth turns west → east, so the Sun seems to move east → west.</p>`}
function draw(){mode==='moon'?drawMoon():drawSpin()}
function loop(){if(!play)return;if(!vis()){stop();return}if(mode==='moon'){day=Math.round((day+0.1)*10)/10;if(day>29.5){day=0;mon=(mon+1)%12;$('#kM').value=mon}$('#kD').value=day}else{hr=(hr+0.05)%24;$('#kH').value=Math.floor(hr)}draw();if(mode==='spin')$('#kHv').textContent=Math.floor(hr)+':00';raf=requestAnimationFrame(loop)}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('kS'))labChange(e.target)})}
function labClick(b){if(b.id==='kPlay'){if(play)stop();else{play=true;b.textContent='Pause';loop()}return true}return false}
function labChange(t){switch(t.id){case 'kMode':mode=t.value;stop();break;case 'kD':day=+t.value;mode='moon';$('#kMode').value='moon';break;case 'kM':mon=+t.value;mode='moon';$('#kMode').value='moon';break;case 'kTilt':tilt=t.checked;break;case 'kH':hr=+t.value;mode='spin';$('#kMode').value='spin';break;default:return false}draw();return true}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
