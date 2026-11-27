/* Rai Plus content pack: Class 9 Science, Chapter 11 – Sound (rationalised NCERT). Bilingual: Hindi terms alongside. */
RP.register({key:'9sci11',cls:'9',subject:'Science',ch:'11',title:"Sound",color:'#5b3f8f',
crumb:"HBSE Class 9 Science · ध्वनि · Taught in December",h1:"Chapter 11: Sound · ध्वनि",sub:"How vibrations make sound, how it travels as a wave, why echoes happen, and what we cannot hear.",heroLabel:"A tuning fork sending compressions and rarefactions through air",labName:'Sound lab',
theme:"\n:root{--g:light-dark(#5b3f8f,#c3b0e8);--g2:light-dark(#f2eefa,#17112a);--line:light-dark(#ddd3f0,#33284d);--bg:light-dark(#ffffff,#0e0b16);--card:light-dark(#ffffff,#15111f);\n--ink:light-dark(#18122a,#ece6f7);--mute:light-dark(#5c5274,#b5abc9);--y:light-dark(#b35a14,#f2a86a);--y2:light-dark(#fbefe4,#2a170a);--hd:#43296f}\n",
labHTML:`  <h2>Sound lab · ध्वनि प्रयोगशाला</h2>
  <div class="ctrl"><label>Experiment<select id="wMode"><option value="wave">Sound wave in air</option><option value="echo">Echo calculator · प्रतिध्वनि</option></select></label></div>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="wSvg" viewBox="0 0 520 300" role="img" aria-label="Sound experiment" style="color:var(--ink)"></svg></div></div>
  <div><div id="wCtl"></div><div class="box y" id="wOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#5b3f8f',LABNAME='Sound lab',MIND_CENTER='Sound · ध्वनि';
const PU='#5b3f8f',OR='#b35a14',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,'font-size="14" '+o);
const ray=(x1,y1,x2,y2,c=OR,w=2,d='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" ${d?`stroke-dasharray="${d}"`:''}/>`;
function dots(x0,x1,y0,y1,dens,seed=1){let s='';const N=Math.round((x1-x0)/6);for(let i=0;i<N;i++){const xb=x0+i*(x1-x0)/N;const dx=dens(xb);for(let j=0;j<6;j++){const y=y0+((j*37+i*13*seed)%97)/97*(y1-y0);s+=`<circle cx="${(xb+dx).toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="${PU}"/>`}}return s}
const wavePath=(x0,x1,yc,A,lam,ph=0)=>{let d='';for(let x=x0;x<=x1;x+=3)d+=(x===x0?'M':'L')+x+' '+(yc-A*Math.sin(2*Math.PI*(x-x0)/lam+ph)).toFixed(1);return d};
function heroDraw(){let s='<rect x="30" y="40" width="8" height="60" fill="#fff"/><rect x="46" y="40" width="8" height="60" fill="#fff"/>';for(let i=0;i<5;i++)s+=`<path d="M${80+i*36} 45 q12 25 0 50" fill="none" stroke="#fff" stroke-width="${i%2?1.5:4}" opacity=".85"/>`;return s}
const HERO=heroDraw;
const MIND=[['Vibration makes sound',100,50],['Longitudinal wave',420,50],['λ, ν, T, A, v = λν',90,150],['Pitch, loudness, quality',430,150],['Echo & reverberation',110,250],['20 Hz – 20 kHz; ultrasound',410,250]];

const C=[
{id:'w1',num:'11.1',title:'Production of sound · ध्वनि का उत्पादन',
 intro:'Touch your throat while you speak. What do your fingers feel?',
 obj:'Explain that sound is produced by vibrating objects and is a form of energy.',
 prior:'Energy and its forms; to-and-fro motion.',
 simple:'Sound (ध्वनि) is a form of energy that makes us hear. It is produced when something vibrates (कंपन): moves rapidly to and fro. A struck tuning fork, a plucked guitar string, the skin of a drum and our vocal cords all vibrate to make sound.',
 detail:'Activities: touch a struck tuning fork to a hanging table-tennis ball: the ball is pushed away, showing the prongs are vibrating. Dip the prongs of a sounding tuning fork in water: the water splashes. Sound can be produced by plucking (sitar, guitar), striking (drum, tabla), scratching, rubbing, blowing into (flute) or shaking objects. In all cases a body vibrates. In humans, sound is made by the vibration of the vocal cords. The energy we put in (striking, plucking) is carried away as sound energy; the sound dies out as the vibrations stop.',
 real:'A school bell keeps ringing for a while after it is struck; put your hand on it and the sound stops at once.',
 apply:'Why does a drum stop sounding when you press your palm on its skin?',
 see:{w:520,h:220,f:[
  ['A tuning fork is struck.',`<rect x="100" y="40" width="10" height="110" rx="4" fill="${GR}"/><rect x="130" y="40" width="10" height="110" rx="4" fill="${GR}"/><path d="M105 150 q15 20 30 0" fill="none" stroke="${GR}" stroke-width="10"/><rect x="115" y="165" width="10" height="40" fill="${GR}"/>`],
  ['Its prongs move rapidly to and fro: they vibrate (कंपन).',`<path d="M92 60 h-12 M92 90 h-12 M148 60 h12 M148 90 h12" stroke="${OR}" stroke-width="2"/><path d="M86 55 l-8 5 l8 5 M154 55 l8 5 l-8 5" fill="none" stroke="${OR}" stroke-width="2"/>`],
  ['A hanging ball touching a prong is pushed away again and again.',`<line x1="200" y1="10" x2="180" y2="70" stroke="${ink}"/><circle cx="178" cy="78" r="12" fill="#fff" stroke="${ink}" stroke-width="2"/>`+lbl(330,90,'vibration → sound energy','font-weight="700"')]]},
 seeNote:'Sound is a form of energy produced by vibration.',
 do:{title:'Feel the vibration',mat:'Your throat, a rubber band, a steel tumbler',steps:['Hum with fingers on your throat.','Stretch and pluck a rubber band; watch it.','Strike a tumbler and touch it lightly.'],obs:'Each source vibrates while it makes sound.',why:'Vibration produces sound.',lab:false},
 memo:'"No vibration, no sound."',
 miscon:['"Sound is a substance that flows." It is energy carried by vibrations.','"Loud sounds need large objects." Any vibrating object can be loud.'],
 terms:['Sound · ध्वनि','Vibration · कंपन','Vocal cords · वाक् तंतु','Tuning fork · स्वरित्र'],
 q:{q:'Sound is produced by:',o:['light','vibrating objects','heat','magnets'],a:1,why:'Every sound source vibrates.'},
 exam:'"How is sound produced? Give an activity" is a common 2-mark question.'},

{id:'w2',num:'11.2',title:'Sound travels as a longitudinal wave · अनुदैर्ध्य तरंग',
 intro:'Air particles near a speaker don\'t fly to your ear. So how does the sound reach you?',
 obj:'Describe propagation of sound through a medium as compressions and rarefactions; distinguish longitudinal and transverse waves.',
 prior:'Production of sound (11.1); particles of matter.',
 simple:'Sound needs a medium (माध्यम): a solid, liquid or gas. A vibrating object pushes the air particles next to it, making a region of high pressure called a compression (संपीडन). As it moves back, it leaves a low-pressure region called a rarefaction (विरलन). The particles only move back and forth about their places; the disturbance travels forward. Because the particles move along the direction of the wave, sound is a longitudinal wave (अनुदैर्ध्य तरंग).',
 detail:'A wave is a disturbance that moves through a medium; the particles pass the disturbance on to their neighbours and do not travel with it. Mechanical waves need a medium. Sound in air: compressions (more particles, higher density and pressure) alternate with rarefactions (fewer particles, lower density and pressure). Propagation of sound is the travel of these density/pressure variations. A slinky pushed and pulled along its length shows compressions and rarefactions: a longitudinal wave. If you move one end up and down, the coils move perpendicular to the wave: a transverse wave (अनुप्रस्थ तरंग). Light is a transverse wave but not mechanical; it needs no medium. Sound cannot travel through vacuum.',
 real:'On the Moon there is no air, so astronauts talk by radio. Sound cannot cross empty space.',
 apply:'In a slinky, which way do the coils move for (a) a longitudinal and (b) a transverse wave?',
 see:{w:520,h:240,f:[
  ['A vibrating prong pushes the air: a compression (C) forms.',`<rect x="20" y="40" width="10" height="160" fill="${GR}"/>`+dots(40,500,40,200,x=>15*Math.sin(2*Math.PI*(x-40)/120))],
  ['It moves back: a rarefaction (R). The pattern moves outward.',[0,1,2,3].map(i=>lbl(100+i*120,30,'C','font-weight="700" fill="'+OR+'"')+(i<3?lbl(160+i*120,30,'R','font-weight="700"'):'')).join('')],
  ['Particles only shake back and forth along the wave direction: a longitudinal wave.',`<path d="M200 220 h120" stroke="${ink}" stroke-width="2"/><path d="M312 214 l8 6 l-8 6" fill="none" stroke="${ink}" stroke-width="2"/>`+lbl(420,225,'wave direction','font-size="12"')]]},
 seeNote:'C = compression (संपीडन), R = rarefaction (विरलन).',
 do:{title:'Slinky waves',mat:'A slinky, a friend, a smooth floor',steps:['Stretch the slinky along the floor.','Push and pull one end along its length.','Then move the end side to side.'],obs:'Pushing makes bunched and spread coils travelling along; side-to-side makes humps.',why:'Longitudinal vs transverse waves.',lab:true},
 memo:'"C is crowded, R is roomy; particles stay, the pattern travels."',
 miscon:['"Air particles travel from the speaker to my ear." Only the disturbance travels.','"Sound is a transverse wave." In air it is longitudinal.'],
 terms:['Medium · माध्यम','Compression · संपीडन','Rarefaction · विरलन','Longitudinal wave · अनुदैर्ध्य तरंग','Transverse wave · अनुप्रस्थ तरंग'],
 q:{q:'In a sound wave in air, a region of high pressure is a:',o:['rarefaction','compression','crest','trough'],a:1,why:'Particles are crowded.'},
 exam:'Differences between longitudinal and transverse waves are asked every year.'},

{id:'w3',num:'11.2',title:'Characteristics of a wave: λ, ν, T, A and v · तरंग के अभिलक्षण',
 intro:'Why does a whistle sound so different from a drum? The answer is in a few numbers.',
 obj:'Define wavelength, frequency, time period, amplitude and speed, and use v = λν.',
 prior:'Compressions and rarefactions (11.2).',
 simple:'Draw the density or pressure of air against distance: compressions are peaks (crests) and rarefactions are valleys (troughs). Wavelength λ (तरंगदैर्ध्य) is the distance between two neighbouring compressions. Frequency ν (आवृत्ति) is the number of oscillations per second, measured in hertz (Hz). Time period T (आवर्तकाल) is the time for one oscillation: T = 1/ν. Amplitude A (आयाम) is the largest disturbance from the middle value. Speed v = λν.',
 detail:'Wavelength is measured in metres. Frequency: 1 Hz = one oscillation per second; 1 kHz = 1000 Hz. Time period in seconds; ν = 1/T. Amplitude is the maximum disturbance (of density or pressure) from the normal value. Speed is the distance travelled by a point of the wave (say a compression) per second: in one time period T it travels one wavelength, so v = λ/T = λν. Example: a sound of frequency 2 kHz and wavelength 35 cm travels at v = 2000 × 0.35 = 700 m/s; 1.5 km takes 1500/700 ≈ 2.1 s. For a given medium (at a fixed temperature) the speed is fixed, so a higher frequency means a shorter wavelength.',
 real:'In air at room temperature, a 340 Hz tone has a wavelength of about 1 m.',
 apply:'A sound wave has frequency 2 kHz and wavelength 35 cm. How long will it take to travel 1.5 km?',
 see:{w:520,h:240,f:[
  ['Air density against distance: compressions are crests, rarefactions are troughs.',`<line x1="30" y1="120" x2="500" y2="120" stroke="${GR}" stroke-dasharray="4 4"/><path d="${wavePath(30,500,120,60,160,Math.PI/2)}" fill="none" stroke="${PU}" stroke-width="3"/>`+lbl(30,40,'density','text-anchor="start" font-size="12"')],
  ['Wavelength λ: distance between two neighbouring crests.',ray(30,40,190,40,OR,2)+`<path d="M30 34 v12 M190 34 v12" stroke="${OR}" stroke-width="2"/>`+lbl(110,32,'λ','font-weight="700" fill="'+OR+'"')],
  ['Amplitude A: the largest change from the middle line.',ray(110,120,110,182,OR,2,'4 3')+lbl(124,158,'A','font-weight="700" fill="'+OR+'"')],
  ['v = λν; T = 1/ν.',lbl(380,225,'v = λ × ν   ·   T = 1/ν','font-weight="700"')]]},
 seeNote:'Units: λ in m, ν in Hz, T in s, v in m/s.',
 do:{title:'Count the waves',mat:'A long rope, a stopwatch, a friend',steps:['Shake one end of the rope steadily.','Count how many shakes you make in 10 s.','Measure the distance between two humps.','Multiply to get the speed.'],obs:'More shakes per second give shorter humps.',why:'v = λν; speed depends on the rope.',lab:true},
 memo:'"Very Lazy Nights: v = λν."',
 miscon:['"Higher frequency means faster sound." In a given medium the speed is the same.','"Amplitude is the wavelength." Amplitude is the height of the disturbance.'],
 terms:['Wavelength λ · तरंगदैर्ध्य','Frequency ν · आवृत्ति','Hertz (Hz)','Time period T · आवर्तकाल','Amplitude · आयाम'],
 q:{q:'A sound has ν = 500 Hz and λ = 0.68 m. Its speed is:',o:['340 m/s','735 m/s','0.00136 m/s','500 m/s'],a:0,why:'500 × 0.68 = 340.'},
 exam:'Numericals with v = λν and T = 1/ν are 2–3 mark questions.'},

{id:'w4',num:'11.2',title:'Pitch, loudness and quality · तारत्व, प्रबलता और गुणता',
 intro:'A mosquito\'s buzz and a lion\'s roar: which is louder, and which is higher?',
 obj:'Relate pitch to frequency, loudness to amplitude, and quality (timbre) to the shape of the wave.',
 prior:'Frequency and amplitude (11.2).',
 simple:'Pitch (तारत्व) is how high or low a sound seems; it depends on frequency. High frequency = high pitch (a whistle, a bird). Loudness (प्रबलता) depends on amplitude: hit a drum harder and the larger vibration gives a louder sound. Quality or timbre (गुणता) lets you tell a flute from a violin playing the same note; it depends on the shape of the wave.',
 detail:'A faster-vibrating object has a higher frequency and higher pitch. Loudness is how the ear feels the energy of the sound: a larger amplitude carries more energy and sounds louder; loudness is measured in decibels (dB). As sound spreads out, its amplitude and loudness decrease. A sound of a single frequency is a tone; a sound made of several frequencies is a note and is pleasant; an unpleasant sound is noise. Music is pleasant to hear and has a rich quality. A mosquito has a high pitch but low loudness; a lion\'s roar has low pitch but high loudness. Intensity is the sound energy passing per second through unit area; loudness is how the ear responds to it, so two sounds of equal intensity can seem different in loudness.',
 real:'Girls\' and women\'s voices usually have a higher pitch than men\'s because their vocal cords are shorter and vibrate faster.',
 apply:'Which property of sound changes when you strike a tabla harder? Which changes when you tighten it?',
 see:{w:520,h:260,f:[
  ['Low pitch: few waves per second.',`<path d="${wavePath(30,240,60,30,140)}" fill="none" stroke="${PU}" stroke-width="2.5"/>`+lbl(135,110,'low frequency → low pitch','font-size="12"')],
  ['High pitch: many waves per second.',`<path d="${wavePath(280,490,60,30,45)}" fill="none" stroke="${PU}" stroke-width="2.5"/>`+lbl(385,110,'high frequency → high pitch','font-size="12"')],
  ['Soft and loud: same frequency, different amplitude.',`<path d="${wavePath(30,240,180,15,70)}" fill="none" stroke="${OR}" stroke-width="2.5"/><path d="${wavePath(280,490,180,50,70)}" fill="none" stroke="${OR}" stroke-width="2.5"/>`+lbl(135,250,'small amplitude → soft','font-size="12"')+lbl(385,250,'large amplitude → loud','font-size="12"')]]},
 seeNote:'Pitch ↔ frequency; loudness ↔ amplitude; quality ↔ wave shape.',
 do:{title:'Ruler music',mat:'A 30 cm ruler, a table edge',steps:['Press one end of the ruler on the table and twang the free end.','Shorten the free part and twang again.','Twang harder.'],obs:'Shorter → higher pitch; harder → louder.',why:'Shorter vibrates faster (higher ν); harder → bigger amplitude.',lab:true},
 memo:'"Pitch–frequency, Loud–amplitude, Quality–shape."',
 miscon:['"High pitch = loud." Pitch depends on frequency, loudness on amplitude.','"Loudness and intensity are the same." Loudness is the ear\'s response.'],
 terms:['Pitch · तारत्व','Loudness · प्रबलता','Quality/timbre · गुणता','Tone, note, noise','Intensity · तीव्रता'],
 q:{q:'The pitch of a sound depends on its:',o:['amplitude','frequency','speed','medium'],a:1,why:'Higher frequency → higher pitch.'},
 exam:'Pitch vs loudness with diagrams of waves is a frequent question.'},

{id:'w5',num:'11.2',title:'Speed of sound in different media · विभिन्न माध्यमों में ध्वनि की चाल',
 intro:'Put your ear to a long iron railing while a friend taps the far end. You hear it twice. Why?',
 obj:'Compare the speed of sound in solids, liquids and gases and state the effect of temperature.',
 prior:'v = λν (11.2).',
 simple:'Sound travels at different speeds in different media. It is slowest in gases, faster in liquids and fastest in solids. It also travels faster when the medium is warmer. In air at 22 °C sound travels at about 344 m/s, in water about 1500 m/s, and in steel about 5960 m/s.',
 detail:'Approximate speeds at 25 °C: aluminium 6420 m/s, steel 5960, iron 5950, glass (flint) 3980; sea water 1531, distilled water 1498; hydrogen 1284, helium 965, air 346, oxygen 316 m/s. The speed of sound in air at 0 °C is 331 m/s and at 22 °C 344 m/s. Sound is far slower than light (3 × 10⁸ m/s), which is why we see lightning before we hear thunder. Example: thunder heard 3 s after the flash; distance ≈ 346 × 3 ≈ 1 km. When a source moves faster than sound (supersonic), it makes shock waves; you do not need this for the exam.',
 real:'You see a cricketer hit the ball at the far end of a big ground a moment before you hear the knock.',
 apply:'A flash of lightning is seen and thunder heard 4 s later. How far away was it (speed of sound 346 m/s)?',
 see:{w:520,h:230,f:[
  ['Gas: particles far apart. Speed in air ≈ 346 m/s.',`<rect x="20" y="40" width="150" height="120" fill="none" stroke="${GR}"/>`+[...Array(10)].map((_,i)=>`<circle cx="${35+(i*47)%130}" cy="${55+(i*31)%95}" r="4" fill="${PU}"/>`).join('')+lbl(95,190,'air: 346 m/s')],
  ['Liquid: closer. Water ≈ 1498 m/s.',`<rect x="185" y="40" width="150" height="120" fill="none" stroke="${GR}"/>`+[...Array(28)].map((_,i)=>`<circle cx="${197+(i*29)%128}" cy="${52+(i*17)%100}" r="4" fill="${PU}"/>`).join('')+lbl(260,190,'water: 1498 m/s')],
  ['Solid: tightly packed. Steel ≈ 5960 m/s.',`<rect x="350" y="40" width="150" height="120" fill="none" stroke="${GR}"/>`+[...Array(60)].map((_,i)=>`<circle cx="${360+(i%10)*14}" cy="${50+Math.floor(i/10)*18}" r="4" fill="${PU}"/>`).join('')+lbl(425,190,'steel: 5960 m/s')+lbl(260,222,'speed: gas < liquid < solid','font-weight="700"')]]},
 seeNote:'Values at about 25 °C.',
 do:{title:'Two sounds from one tap',mat:'A long iron railing or a long table, a friend, a coin',steps:['Put your ear on one end.','Ask your friend to tap the far end once.','Listen carefully.'],obs:'Through the solid it arrives first and clearer; through air a moment later.',why:'Sound travels faster in solids.',lab:false},
 memo:'"Solids sprint, liquids jog, gases walk."',
 miscon:['"Sound travels faster in air than in water." It is about 4 times faster in water.','"Sound and light travel at the same speed." Light is nearly a million times faster.'],
 terms:['Speed of sound · ध्वनि की चाल','Medium','Temperature dependence','Supersonic'],
 q:{q:'Sound travels fastest in:',o:['air','water','steel','vacuum'],a:2,why:'Solids conduct sound fastest; vacuum not at all.'},
 exam:'Ordering speeds and lightning–thunder distance numericals are common.'},

{id:'w6',num:'11.3',title:'Reflection of sound and echo · ध्वनि का परावर्तन और प्रतिध्वनि',
 intro:'Shout in a large empty hall or near a cliff and you hear yourself again. How far must the wall be?',
 obj:'State that sound reflects like light; explain echo and the minimum distance for it.',
 prior:'Speed of sound.',
 simple:'Sound bounces off hard surfaces, obeying the same laws of reflection as light: the angle of incidence equals the angle of reflection, and both lie in the same plane with the normal. If a reflected sound reaches you at least 0.1 s after the original, you hear it separately: an echo (प्रतिध्वनि). In air at 22 °C (344 m/s) that needs a reflecting surface at least 17.2 m away.',
 detail:'The sensation of a sound stays in our brain for about 0.1 s, so the echo must come back at least 0.1 s later. Total path = 344 × 0.1 = 34.4 m, so the obstacle must be at least 17.2 m away. Echoes can be heard many times by repeated reflections (as in thunder rolling among clouds and the ground). Example: a person claps near a cliff and hears the echo after 2 s; at 346 m/s, distance to the cliff = (346 × 2)/2 = 346 m. Always halve the total distance, since sound goes there and back. To check reflection, use two tubes aimed at a wall: the sound from a ticking clock in one tube is heard best through the other tube when the angles are equal.',
 real:'Bats, and the fisherman\'s echo-sounder, use reflected sound to measure distances.',
 apply:'A child shouts and hears the echo from a wall after 0.8 s. How far is the wall (v = 340 m/s)?',
 see:{w:520,h:240,f:[
  ['A person shouts towards a cliff.',`<circle cx="60" cy="100" r="12" fill="${PU}"/><rect x="54" y="112" width="12" height="60" fill="${PU}"/><path d="M440 20 L500 20 L500 220 L420 220 L450 140 L430 80Z" fill="#b4b2a9"/>`],
  ['Sound goes to the cliff…',ray(80,110,430,110,OR,2.5)+`<path d="M420 104 l10 6 l-10 6" fill="none" stroke="${OR}" stroke-width="2.5"/>`],
  ['…and comes back. Total distance = 2d.',ray(430,130,80,130,PU,2.5,'6 4')+`<path d="M90 124 l-10 6 l10 6" fill="none" stroke="${PU}" stroke-width="2.5"/>`+lbl(255,165,'d')],
  ['Echo heard only if t ≥ 0.1 s → d ≥ 17.2 m (in air at 22 °C).',lbl(255,215,'d = v × t / 2','font-weight="700"')]]},
 seeNote:'Halve the total distance: there and back.',
 do:{title:'Clap echo',mat:'An open ground with a tall wall, a stopwatch, a measuring tape',steps:['Stand about 50 m from the wall.','Clap, and on hearing the echo clap again; keep the rhythm.','Time 20 claps; find the time per echo.','Use d = vt/2 to check the distance.'],obs:'Calculated distance is close to measured.',why:'Echo time = 2d/v.',lab:true},
 memo:'"Echo: there and back, so halve it; at least 17.2 m."',
 miscon:['"d = v × t." Remember to halve it.','"Any wall gives an echo." Too close and it merges with the original.'],
 terms:['Reflection of sound · ध्वनि का परावर्तन','Echo · प्रतिध्वनि','Persistence of hearing (0.1 s)'],
 q:{q:'Echo is heard after 2 s; v = 346 m/s. Distance to the reflector:',o:['173 m','346 m','692 m','1384 m'],a:1,why:'346 × 2 / 2.'},
 exam:'Echo distance numericals and "minimum distance for echo" are standard.'},

{id:'w7',num:'11.3',title:'Reverberation and uses of multiple reflection · अनुरणन',
 intro:'Why do cinema halls have soft panels on their walls and curtains on the windows?',
 obj:'Explain reverberation, how it is reduced, and devices that use multiple reflection of sound.',
 prior:'Reflection and echo (11.3).',
 simple:'In a big hall, sound reflects again and again from walls, ceiling and floor, and lingers. This is reverberation (अनुरणन). Too much of it makes speech unclear, so halls use sound-absorbing materials: fibreboard, rough plaster, curtains and soft seats. Multiple reflection is also useful: megaphones, horns, trumpets and shehnais send sound forward; a stethoscope carries a patient\'s heartbeat to the doctor\'s ears; curved ceilings and sound boards spread sound evenly in halls.',
 detail:'Reverberation is the persistence of sound in a big hall due to repeated reflections. It is reduced by covering the roof and walls with sound-absorbent materials such as compressed fibreboard, rough plaster or draperies, and by using seats with absorbing material. Megaphone and loudhailer: a tube followed by a conical opening reflects sound repeatedly so most of the sound waves go forward towards the audience. Stethoscope: the sound of the heartbeat reaches the doctor\'s ears by multiple reflection inside a long tube. Concert halls and auditoriums have curved ceilings so that sound reaches every corner after reflection; a curved sound board behind the stage does the same.',
 real:'The school assembly hall with bare walls can sound boomy; hanging curtains noticeably improves how clearly announcements are heard.',
 apply:'Why is the ceiling of a concert hall made curved?',
 see:{w:520,h:240,f:[
  ['A megaphone: sound reflects inside the cone and is sent forward.',`<path d="M40 110 L80 100 L200 50 L200 170 L80 120Z" fill="#e6e0f3" stroke="${ink}" stroke-width="2"/>`+ray(70,110,140,74)+ray(140,74,200,100)+ray(200,100,280,110)],
  ['A curved sound board behind the speaker spreads sound to the audience.',`<path d="M330 40 Q300 120 330 200" fill="none" stroke="${ink}" stroke-width="4"/><circle cx="350" cy="120" r="8" fill="${PU}"/>`+ray(350,120,316,80,OR,1.5)+ray(316,80,500,60,OR,1.5)+ray(350,120,316,160,OR,1.5)+ray(316,160,500,180,OR,1.5)],
  ['Soft materials on walls absorb sound and reduce reverberation.',lbl(260,225,'megaphone · stethoscope · sound board · curved ceiling','font-size="12"')]]},
 seeNote:'Multiple reflection directs sound where we want it.',
 do:{title:'Paper megaphone',mat:'A chart paper cone',steps:['Speak softly to a friend 10 m away.','Speak again at the same effort through a paper cone.'],obs:'The voice reaches farther through the cone.',why:'Multiple reflection sends the sound forward.',lab:false},
 memo:'"Reverb lingers; soft walls swallow it; curved walls send it."',
 miscon:['"Reverberation and echo are the same." Echo is a distinct repeat; reverberation is a lingering blur.','"Stethoscope amplifies electrically." A simple one works by multiple reflection.'],
 terms:['Reverberation · अनुरणन','Sound absorbent','Megaphone · मेगाफ़ोन','Stethoscope · स्टेथोस्कोप','Sound board'],
 q:{q:'A stethoscope works on the principle of:',o:['refraction','multiple reflection of sound','ultrasound','resonance'],a:1,why:'Sound reflects along the tube.'},
 exam:'Uses of multiple reflection and ways to reduce reverberation are 3-mark questions.'},

{id:'w8',num:'11.4',title:'Range of hearing and ultrasound · श्रव्यता का परिसर और पराश्रव्य',
 intro:'Dogs can hear a whistle that you cannot. What is special about it?',
 obj:'State the human audible range, define infrasound and ultrasound, and list applications of ultrasound.',
 prior:'Frequency (11.2).',
 simple:'Humans hear sounds from about 20 Hz to 20,000 Hz (20 kHz). Below 20 Hz is infrasound (अपश्रव्य); above 20 kHz is ultrasound (पराश्रव्य). Children under five and some animals like dogs can hear up to about 25 kHz. Bats, dolphins and porpoises make ultrasound. Ultrasound is used in industry and medicine because it travels in a narrow beam and reflects well from boundaries.',
 detail:'Infrasound: a vibrating pendulum (too slow to hear); rhinoceroses communicate using infrasound as low as 5 Hz; whales and elephants produce infrasound; earthquakes produce low-frequency infrasound before the main shock waves, which may alert some animals. Ultrasound: bats, porpoises and dolphins; moths of some families can hear the high-frequency squeaks of bats. Our hearing range shrinks with age, especially at high frequencies. Uses of ultrasound: (1) cleaning hard-to-reach parts (spiral tubes, odd-shaped parts, electronic components) by placing them in a cleaning solution through which ultrasound is sent; (2) detecting cracks and flaws in metal blocks, since ultrasound reflects back from a flaw; (3) echocardiography: images of the heart; (4) ultrasonography: images of internal organs such as the liver, gall bladder, uterus and kidney, and of the fetus during pregnancy; (5) breaking small kidney stones into fine grains.',
 real:'Ultrasound scans at a hospital make pictures of internal organs using echoes, without X-rays.',
 apply:'Why is ultrasound, not ordinary sound, used to find cracks inside metal blocks?',
 see:{w:520,h:220,f:[
  ['Frequency scale.',`<line x1="30" y1="110" x2="500" y2="110" stroke="${ink}" stroke-width="2"/>`+[[30,'1 Hz'],[150,'20 Hz'],[380,'20 kHz'],[500,'200 kHz']].map(([x,t])=>`<line x1="${x}" y1="104" x2="${x}" y2="116" stroke="${ink}"/>`+T(x,135,t,'font-size="12"')).join('')],
  ['Humans hear between 20 Hz and 20 kHz.',`<rect x="150" y="80" width="230" height="24" fill="${PU}" opacity=".7"/>`+lbl(265,72,'audible · श्रव्य','font-weight="700"')],
  ['Below: infrasound (elephants, rhinos). Above: ultrasound (bats, dolphins).',`<rect x="30" y="80" width="120" height="24" fill="${GR}" opacity=".5"/><rect x="380" y="80" width="120" height="24" fill="${OR}" opacity=".6"/>`+lbl(90,165,'infrasound · अपश्रव्य','font-size="12"')+lbl(440,165,'ultrasound · पराश्रव्य','font-size="12"')+lbl(90,185,'elephants, rhinos','font-size="11"')+lbl(440,185,'bats, dolphins','font-size="11"')]]},
 seeNote:'Log-like scale, not to proportion.',
 do:{title:'Hearing test (safe volume)',mat:'A phone tone-generator app, low volume',steps:['At low volume, slowly raise the frequency from 1 kHz.','Note where you stop hearing it. Ask an older adult to try.'],obs:'Younger people usually hear higher frequencies.',why:'The upper limit falls with age.',lab:false},
 memo:'"Twenty to twenty-thousand; below is infra, above is ultra."',
 miscon:['"Ultrasound is very loud sound." It is very high frequency, not loudness.','"Infrasound can\'t exist because we can\'t hear it." Many animals use it.'],
 terms:['Audible range · श्रव्यता का परिसर','Infrasound · अपश्रव्य','Ultrasound · पराश्रव्य','Echocardiography','Ultrasonography'],
 q:{q:'Which can humans NOT hear?',o:['200 Hz','2000 Hz','15,000 Hz','30,000 Hz'],a:3,why:'Above 20 kHz is ultrasound.'},
 exam:'Applications of ultrasound and the audible range are frequent 2–3 mark questions.'}
];

const CARDS=[['Sound · ध्वनि','Energy produced by vibrating objects.'],['Medium','Sound needs a solid, liquid or gas; not vacuum.'],['Compression · संपीडन','High pressure/density region.'],['Rarefaction · विरलन','Low pressure/density region.'],['Longitudinal wave','Particles vibrate along the wave direction (sound in air).'],['Transverse wave','Particles vibrate perpendicular (rope waves, light).'],['Wavelength λ','Distance between two neighbouring compressions; m.'],['Frequency ν','Oscillations per second; Hz. T = 1/ν.'],['v = λν','Speed = wavelength × frequency.'],['Pitch ↔ frequency','High ν → high pitch.'],['Loudness ↔ amplitude','Bigger A → louder.'],['Speeds','Air ≈ 346, water ≈ 1500, steel ≈ 5960 m/s.'],['Echo','Needs ≥ 0.1 s; ≥ 17.2 m in air at 22 °C; d = vt/2.'],['Reverberation · अनुरणन','Lingering due to repeated reflection; reduce with absorbers.'],['Multiple reflection uses','Megaphone, stethoscope, sound board, curved ceilings.'],['Hearing range','20 Hz – 20 kHz; below infra, above ultra.'],['Ultrasound uses','Cleaning, flaw detection, echocardiography, ultrasonography, kidney stones.']];

const Q=[
 {lv:1,q:'Sound cannot travel through:',o:['steel','water','air','vacuum'],a:3,w:'Sound needs a medium.'},
 {lv:1,q:'The SI unit of frequency is:',o:['metre','second','hertz','decibel'],a:2,w:'1 Hz = 1 oscillation per second.'},
 {lv:1,q:'Sound in air is a:',o:['transverse wave','longitudinal wave','light wave','electromagnetic wave'],a:1,w:'Particles move along the direction of travel.'},
 {lv:1,q:'Human audible range is about:',o:['2 Hz–2 kHz','20 Hz–20 kHz','200 Hz–200 kHz','20 kHz–200 kHz'],a:1,w:'20 Hz to 20,000 Hz.'},
 {lv:2,q:'Loudness of sound depends on its:',o:['frequency','amplitude','wavelength','speed'],a:1,w:'Bigger amplitude, louder.'},
 {lv:2,q:'A wave has a time period of 0.005 s. Its frequency is:',o:['20 Hz','200 Hz','500 Hz','2000 Hz'],a:1,w:'ν = 1/T = 200 Hz.'},
 {lv:2,q:'Bats find their way using:',o:['infrasound','ultrasound','light','magnetism'],a:1,w:'They emit ultrasound and hear echoes.'},
 {lv:3,q:'A sound of frequency 2 kHz has wavelength 35 cm. Its speed is:',o:['70 m/s','700 m/s','7000 m/s','5.7 m/s'],a:1,w:'2000 × 0.35.'},
 {lv:3,q:'Thunder is heard 3 s after the flash (v = 346 m/s). The cloud is about:',o:['115 m away','519 m away','1038 m away','2076 m away'],a:2,w:'346 × 3 (light arrives almost instantly).'},
 {lv:3,q:'An echo returns in 0.8 s; v = 340 m/s. The wall is:',o:['136 m','272 m','425 m','544 m'],a:0,w:'340 × 0.8 / 2.'},
 {lv:4,q:'Assertion (A): An echo is not heard in a small room. Reason (R): The reflected sound returns in less than 0.1 s.',o:['Both true and R explains A','Both true, R does not explain A','A true, R false','A false, R true'],a:0,w:'Walls are closer than 17.2 m.'},
 {lv:4,q:'Two tuning forks in air give sounds of 256 Hz and 512 Hz. Compared with the first, the second has:',o:['double speed','half the wavelength','double amplitude','half the pitch'],a:1,w:'Same speed; λ = v/ν halves.'},
 {lv:4,q:'Why are the walls of an auditorium covered with fibreboard?',o:['To increase echo','To reduce reverberation','To make sound faster','To produce ultrasound'],a:1,w:'Absorbers cut repeated reflections.'},
 {lv:5,open:true,m:3,q:'Explain how sound travels through air, using the terms compression and rarefaction. Why is it called a longitudinal wave?',ans:['Vibrating object pushes air → compression (high pressure); moves back → rarefaction (low pressure) (1).','These alternate regions move outward; particles oscillate about their mean positions, passing energy on (1).','Particles vibrate parallel to the direction of travel → longitudinal (1).']},
 {lv:5,open:true,m:3,q:'What is the minimum distance needed for an echo in air at 22 °C? Show your working.',ans:['Persistence of hearing ≈ 0.1 s (1).','Total path = 344 × 0.1 = 34.4 m (1).','Distance to reflector = 34.4/2 = 17.2 m (1).']},
 {lv:5,open:true,m:3,q:'Give three applications of ultrasound.',ans:['Cleaning hard-to-reach parts in a cleaning solution (1).','Detecting cracks/flaws in metal blocks (1).','Medical imaging: echocardiography / ultrasonography; breaking kidney stones (1).']}
];

const ONEMIN=['Sound = energy from vibration; needs a medium.','Air: compressions (संपीडन) and rarefactions (विरलन) → longitudinal wave.','λ distance C to C; ν per second (Hz); T = 1/ν; v = λν.','Pitch ↔ frequency; loudness ↔ amplitude; quality ↔ wave shape.','Speed: gas < liquid < solid; faster when warmer. Air ≈ 346 m/s.','Echo needs ≥ 0.1 s → ≥ 17.2 m; d = vt/2.','Reverberation (अनुरणन): reduce with fibreboard, curtains, soft seats.','Multiple reflection: megaphone, stethoscope, sound board, curved ceiling.','Hearing 20 Hz–20 kHz; infrasound below, ultrasound above.','Ultrasound: cleaning, flaw detection, scans, kidney stones.'];
const KEYS=[['vibration',/vibrat|कंपन/i],['medium',/medium|माध्यम|vacuum/i],['compression / rarefaction',/compress|rarefac|संपीडन|विरलन/i],['longitudinal',/longitud|अनुदैर्ध्य/i],['v = λν',/λ|lambda|v\s*=|wavelength/i],['pitch–frequency',/pitch|तारत्व/i],['loudness–amplitude',/loud|amplitude|आयाम/i],['echo 17.2 m / 0.1 s',/echo|17\.2|0\.1\s*s|प्रतिध्वनि/i],['reverberation',/reverb|अनुरणन/i],['20 Hz–20 kHz, ultrasound',/20\s*k|ultra|infra|पराश्रव्य/i]];

/* ---------- lab ---------- */
let mode='wave',nu=340,amp=8,med='air',ed=50,emed='air',tt=0,raf=null;
const SPD={air:346,water:1498,steel:5960};
const MNAME={air:'air',water:'water',steel:'steel'};
function ctl(){return mode==='wave'?`<div class="ctrl"><label>Frequency ν: <b id="wNu">${nu}</b> Hz<input type="range" class="wSl" id="wF" min="100" max="1000" step="10" value="${nu}"></label></div><div class="ctrl"><label>Amplitude (loudness)<input type="range" class="wSl" id="wA" min="2" max="14" value="${amp}"></label></div><div class="ctrl"><label>Medium<select id="wM"><option value="air" ${med==='air'?'selected':''}>Air</option><option value="water" ${med==='water'?'selected':''}>Water</option><option value="steel" ${med==='steel'?'selected':''}>Steel</option></select></label><button class="btn" id="wPlay">Play this tone</button></div>`
 :`<div class="ctrl"><label>Distance to wall d: <b id="wDv">${ed}</b> m<input type="range" class="wSl" id="wD" min="2" max="400" value="${ed}"></label></div><div class="ctrl"><label>Medium<select id="wEM"><option value="air" ${emed==='air'?'selected':''}>Air</option><option value="water" ${emed==='water'?'selected':''}>Water</option></select></label></div>`}
function drawWave(){const v=SPD[med],lam=v/nu;const px=Math.min(240,Math.max(40,lam*120));/* pixels per wavelength, display only */
 let s=`<rect x="10" y="40" width="10" height="140" fill="${GR}"/>`;const ph=tt*0.08;
 for(let i=0;i<70;i++){const x0=30+i*6.8;for(let j=0;j<7;j++){const y=48+j*19+((i*7)%5);const dx=amp*Math.sin(2*Math.PI*x0/px-ph);s+=`<circle cx="${(x0-dx).toFixed(1)}" cy="${y}" r="2" fill="${PU}"/>`}}
 let d='';for(let x=30;x<=505;x+=4){const p=Math.cos(2*Math.PI*x/px-ph);d+=(x===30?'M':'L')+x+' '+(250-amp*3*p).toFixed(1)}
 s+=`<line x1="30" y1="250" x2="505" y2="250" stroke="${GR}" stroke-dasharray="4 4"/><path d="${d}" fill="none" stroke="${OR}" stroke-width="2.5"/>`+T(40,200,'pressure','font-size="11" text-anchor="start"');
 $('#wSvg').innerHTML=s;
 $('#wOut').innerHTML=`<p>Medium: <b>${MNAME[med]}</b>, v ≈ ${v} m/s</p><p>λ = v/ν = ${v}/${nu} = <b>${lam.toFixed(2)} m</b>; T = 1/ν = <b>${(1000/nu).toFixed(2)} ms</b></p><p>Higher ν → higher pitch and shorter λ. Bigger amplitude → louder. Crowded dots = compression (संपीडन); spread = rarefaction (विरलन).</p><p class="note">The picture is stretched to fit; dots move back and forth only.</p>`}
function drawEcho(){const v=SPD[emed],t=2*ed/v,ok=t>=0.1;const W=Math.min(470,60+ed*1.1);
 let s=`<circle cx="40" cy="120" r="12" fill="${PU}"/><rect x="34" y="132" width="12" height="60" fill="${PU}"/><rect x="${W}" y="30" width="24" height="200" fill="#b4b2a9"/>`;
 s+=`<line x1="60" y1="110" x2="${W}" y2="110" stroke="${OR}" stroke-width="2.5"/><line x1="${W}" y1="135" x2="60" y2="135" stroke="${PU}" stroke-width="2.5" stroke-dasharray="6 4"/>`+T((60+W)/2,160,'d = '+ed+' m','font-size="13"');
 $('#wSvg').innerHTML=s;
 $('#wOut').innerHTML=`<p>Time for echo t = 2d/v = 2 × ${ed} / ${v} = <b>${t.toFixed(3)} s</b></p><p>${ok?'<b>Echo heard</b>: it returns after at least 0.1 s.':'<b>No separate echo</b>: it returns in less than 0.1 s and merges with the original sound.'}</p><p>Minimum distance in ${emed}: ${(v*0.05).toFixed(1)} m.</p>`}
function loop(){const sv=$('#wSvg');if(mode!=='wave'||!sv||!sv.isConnected||sv.getClientRects().length===0){raf=null;return}tt++;drawWave();raf=requestAnimationFrame(loop)}
function labShow(){$('#wCtl').innerHTML=ctl();if(mode==='wave'){if(!raf)loop()}else drawEcho()}
let wired=false,ac=null;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('wSl'))labChange(t)})}
function tone(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=nu;g.gain.value=0.02+amp*0.006;o.connect(g).connect(ac.destination);o.start();g.gain.setTargetAtTime(0,ac.currentTime+0.7,0.08);o.stop(ac.currentTime+1.1)}catch(e){}}
function labClick(b){if(b.id==='wPlay'){tone();return true}return false}
function labChange(t){switch(t.id){case 'wMode':mode=t.value;labShow();return true;case 'wF':nu=+t.value;$('#wNu').textContent=nu;return true;case 'wA':amp=+t.value;return true;case 'wM':med=t.value;return true;case 'wD':ed=+t.value;$('#wDv').textContent=ed;drawEcho();return true;case 'wEM':emed=t.value;drawEcho();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
