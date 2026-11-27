/* Rai Plus content pack: Class 12 Physics, Chapter 11 – Dual Nature of Radiation and Matter */
RP.register({key:'12phy11',cls:'12',subject:'Physics',ch:'11',title:"Dual Nature of Radiation and Matter",color:'#5b2f86',
crumb:"HBSE Class 12 Physics · Unit: Dual Nature of Radiation and Matter · Taught in November",h1:"Chapter 11: Dual Nature of Radiation and Matter",sub:"Light that knocks electrons out of metal like particles, and electrons that behave like waves.",heroLabel:"Photons striking a metal plate and ejecting electrons",labName:"Photoelectric lab",
theme:"\n:root{--g:light-dark(#5b2f86,#c8a6ee);--g2:light-dark(#f3eefa,#1c1328);--line:light-dark(#e0d4ef,#382a4d);--bg:light-dark(#ffffff,#110c18);--card:light-dark(#ffffff,#171020);\n--ink:light-dark(#1a1026,#efe8f8);--mute:light-dark(#62537a,#b6a6cc);--y:light-dark(#d07a2a,#eaa767);--y2:light-dark(#fcf0e3,#2a1d10);--hd:#3e1f5e}\n",
labHTML:`  <h2>Photoelectric lab</h2>
  <p>Shine light on a metal plate in an evacuated tube. Change the metal, the wavelength, the intensity and the collector potential, and measure the photocurrent.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="peT" viewBox="0 0 520 240" role="img" aria-label="Photoelectric tube" style="color:var(--ink)"></svg></div><div class="fig" style="max-width:none"><svg id="peG" viewBox="0 0 520 220" role="img" aria-label="Photocurrent against collector potential" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Metal (work function)<select id="peM"><option value="2.14">Caesium (2.14 eV)</option><option value="2.30">Potassium (2.30 eV)</option><option value="2.75" selected>Sodium (2.75 eV)</option><option value="3.20">Calcium (3.20 eV)</option><option value="4.17">Molybdenum (4.17 eV)</option><option value="4.65">Copper (4.65 eV)</option><option value="5.65">Platinum (5.65 eV)</option></select></label></div>
  <div class="ctrl"><label>Wavelength λ (nm)<input type="range" id="peL" min="150" max="700" step="5" value="400"></label><label>Intensity (relative)<input type="range" id="peI" min="0" max="100" step="5" value="60"></label><label>Collector potential V (volts)<input type="range" id="peV" min="-6" max="6" step="0.1" value="2"></label></div>
  <div class="box y" id="peOut" aria-live="polite"></div>
  <p class="note">Work functions from NCERT Table 11.1. Simulation: currents are relative, not real microamperes.</p></div></div>
`,
build:function(){

const ACC='#5b2f86',LABNAME='Photoelectric lab',MIND_CENTER='Dual nature';
const PU='#5b2f86',OR='#d07a2a',BL='#378add',ink='currentColor',HC=1240;
const pill=(x,y,t,c='#f3eefa',w=150)=>`<rect x="${x-w/2}" y="${y-17}" width="${w}" height="34" rx="8" fill="${c}" stroke="${PU}"/>`+T(x,y+5,t,'font-size="13"');
const wave=(x0,y,len,amp,lam,col)=>{let d=`M${x0} ${y}`;for(let x=0;x<=len;x+=3)d+=` L${x0+x} ${y+amp*Math.sin(x/lam*2*Math.PI)}`;return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2"/>`};
function lamCol(l){if(l<380)return '#8a5cc6';if(l<450)return '#6a4bd6';if(l<495)return '#3a7fd6';if(l<570)return '#3aa65a';if(l<590)return '#d9c23a';if(l<620)return '#e08a2a';return '#d6402a'}
function heroDraw(){let s=`<rect x="250" y="20" width="14" height="90" fill="#cfcfcf"/>`;for(let i=0;i<3;i++)s+=wave(60,40+i*25,180,5,18,'#eaa767');for(let i=0;i<3;i++)s+=`<circle cx="${300+i*20}" cy="${45+i*25}" r="5" fill="#9bd0ff"/>`;return s}
const HERO=heroDraw;
const MIND=[['Electron emission',90,50],['Photoelectric effect',430,50],['Failure of wave theory',90,150],["Einstein's equation",430,150],['Photons',90,250],['Matter waves',430,250]];

const C=[
{id:'q1',num:'11.2',title:'Electron emission and work function',
 intro:'A metal is full of free electrons. Why don\'t they simply fly out of it?',
 obj:'Define work function, state its unit (eV), and name the three methods of electron emission.',
 prior:'Electric potential and energy (Ch 2).',
 simple:'Free electrons in a metal are held inside by the attraction of the positive ions. To pull one out, a minimum energy must be given to it. This minimum energy is the work function φ₀ of the metal. It is measured in electron volts (eV). Electrons can be given this energy by heating (thermionic emission), by a very strong electric field (field emission) or by light (photoelectric emission).',
 detail:'If an electron tries to leave the metal surface, the surface acquires a positive charge and pulls the electron back. The minimum energy required by an electron to escape from the metal surface is called the work function φ₀. It depends on the properties of the metal and the nature of its surface. It is expressed in electron volts: 1 eV is the energy gained by an electron accelerated through a potential difference of 1 volt, so 1 eV = 1.602 × 10⁻¹⁹ J. Caesium has the lowest work function (2.14 eV) in NCERT\'s table and platinum the highest (5.65 eV). Three methods of supplying the energy: (i) thermionic emission, by heating; (ii) field emission, by a very strong electric field (about 10⁸ V/m); (iii) photoelectric emission, by light of suitable frequency.',
 real:'Old TV picture tubes and X-ray tubes produce their electron beams by heating a filament: thermionic emission.',
 apply:'Convert a work function of 2.3 eV into joules.',
 see:{w:520,h:240,f:[
  ['Free electrons inside the metal are held by the positive ions.',`<rect x="60" y="60" width="200" height="140" fill="#cfcfcf" opacity=".6"/>`+[0,1,2,3,4,5].map(i=>`<circle cx="${90+(i%3)*60}" cy="${95+Math.floor(i/3)*60}" r="7" fill="${BL}"/>`).join('')],
  ['To escape, an electron needs at least φ₀, the work function.',`<line x1="262" y1="95" x2="420" y2="70" stroke="${OR}" stroke-width="2.5"/><circle cx="430" cy="68" r="7" fill="${BL}"/>`+T(360,50,'needs ≥ φ₀','font-size="13"')],
  ['Energy can come from heat, a strong field or light.',pill(130,225,'thermionic','#fcf0e3',110)+pill(260,225,'field','#fcf0e3',90)+pill(390,225,'photoelectric','#f3eefa',130)]]},
 seeNote:'1 eV = 1.602 × 10⁻¹⁹ J.',
 do:{title:'Work-function ranking',mat:'NCERT Table 11.1, notebook',steps:['List the metals from lowest to highest work function.','Mark which can emit electrons in visible light (photon energy about 1.8–3.1 eV).','Discuss why caesium is used in photocells.'],obs:'Only metals with φ₀ below about 3.1 eV respond to visible light.',why:'Photon energy must be at least φ₀.',lab:false},
 memo:'"Work function = the exit fee."',
 miscon:['"Work function is the same for all metals." It depends on the metal and its surface.','"Any amount of energy frees an electron." It needs at least φ₀.'],
 terms:['Work function','Electron volt','Thermionic emission','Field emission','Photoelectric emission'],
 q:{q:'1 eV equals:',o:['1.602 × 10⁻¹⁹ J','9.1 × 10⁻³¹ J','6.63 × 10⁻³⁴ J','1 J'],a:0,why:'Energy gained by an electron through 1 V.'},
 exam:'Definitions of work function and the eV are 1-mark questions.'},
{id:'q2',num:'11.3–11.4',title:'The photoelectric effect: what experiments show',
 intro:'Shine red light on zinc for hours: nothing. A brief flash of ultraviolet: electrons fly out at once. Why?',
 obj:'Describe the experimental set-up and how photocurrent depends on intensity, potential and frequency; define stopping potential and threshold frequency.',
 prior:'Work function (11.2).',
 simple:'When light of high enough frequency falls on a metal, electrons are emitted at once. More intense light gives more electrons (more current) but not faster ones. Higher frequency gives faster electrons. Below a certain threshold frequency, no electrons are emitted, however bright the light. The negative potential that just stops the fastest electrons is the stopping potential.',
 detail:'Hertz (1887) noticed that ultraviolet light helped sparks jump; Hallwachs and Lenard studied the effect further. In the experimental tube, light falls on the emitter plate C; the collector A is kept at a potential with respect to C. Findings: (1) Effect of intensity: for a fixed frequency and accelerating potential, photocurrent is directly proportional to intensity. (2) Effect of potential: photocurrent increases with accelerating potential until it reaches a saturation value. With a negative (retarding) potential, current decreases and becomes zero at the stopping potential V₀; eV₀ = Kmax. For a given frequency, V₀ is independent of intensity. (3) Effect of frequency: V₀ increases linearly with frequency; there is a minimum cut-off or threshold frequency ν₀ below which no emission occurs, whatever the intensity. (4) Emission is instantaneous (about 10⁻⁹ s or less).',
 real:'Automatic doors and burglar alarms use photocells: a beam of light falling on a photosensitive surface keeps a current flowing until someone blocks it.',
 apply:'The stopping potential for some light on a metal is 1.5 V. What is the maximum kinetic energy of the photoelectrons, in eV and in joules?',
 see:{w:520,h:240,f:[
  ['Brighter light → more electrons, larger saturation current.',`<path d="M60 200 L200 200" stroke="${ink}" stroke-width="1.5"/><path d="M60 200 L60 40" stroke="${ink}" stroke-width="1.5"/><path d="M90 200 C 110 120 130 80 200 75" fill="none" stroke="${PU}" stroke-width="2.5"/><path d="M90 200 C 110 150 130 120 200 115" fill="none" stroke="${PU}" stroke-width="2" opacity=".55"/>`+T(130,225,'same V₀','font-size="12"')],
  ['Higher frequency → larger stopping potential.',`<path d="M300 200 L480 200" stroke="${ink}" stroke-width="1.5"/><path d="M300 200 L300 40" stroke="${ink}" stroke-width="1.5"/><path d="M340 200 L480 60" stroke="${OR}" stroke-width="2.5"/>`+T(470,215,'ν','font-size="13"')+T(290,45,'V₀','font-size="13"')],
  ['Below the threshold frequency ν₀: no emission at all.',`<circle cx="340" cy="200" r="5" fill="${OR}"/>`+T(340,225,'ν₀','font-size="13" font-weight="700"')]]},
 seeNote:'Run the experiment yourself in the lab.',
 do:{title:'Read the graphs',mat:'NCERT figures of current vs potential and stopping potential vs frequency',steps:['On the current–potential graph, mark the saturation currents and the stopping potential.','On the V₀–ν graph, read the threshold frequency where the line meets the axis.','Compare two metals.'],obs:'The lines for different metals are parallel with different intercepts.',why:'Slope = h/e for all metals; the intercept depends on φ₀.',lab:false},
 memo:'"Intensity → how many. Frequency → how fast."',
 miscon:['"Brighter light gives faster electrons." Intensity changes the number, not the maximum speed.','"Very bright red light will eventually free electrons." Not below the threshold frequency.'],
 terms:['Photocurrent','Saturation current','Stopping potential','Threshold frequency','Photosensitive surface'],
 q:{q:'For a given metal and frequency, increasing the intensity of light:',o:['Increases the stopping potential','Increases the saturation current','Decreases the threshold frequency','Has no effect'],a:1,why:'More photons → more photoelectrons.'},
 exam:'The three graphs (I–intensity, I–V, V₀–ν) and their explanation carry 3–5 marks.'},
{id:'q3',num:'11.5',title:'Why the wave theory of light fails',
 intro:'Waves spread energy evenly. So why can\'t a dim but long-lasting light ever free an electron?',
 obj:'List the features of the photoelectric effect that the wave picture of light cannot explain.',
 prior:'Experimental findings (11.3–11.4).',
 simple:'If light were only a wave, brighter light should give electrons more energy, any frequency should work if you wait long enough, and dim light should take time to build up enough energy. All three predictions are wrong.',
 detail:'According to the wave picture, the free electrons absorb radiant energy continuously, and a greater intensity means greater amplitude of the electric and magnetic fields, so (i) the maximum kinetic energy of photoelectrons should increase with intensity; (ii) light of any frequency, if intense enough, should eject electrons, so there should be no threshold frequency; and (iii) since energy is spread over the wavefront, an electron would take hours to collect enough energy, so emission could not be instantaneous. Experiments contradict all three: Kmax is independent of intensity, a threshold frequency exists, and emission is instantaneous. So the wave picture is unable to explain the most basic features of photoelectric emission.',
 real:'This failure, more than a century ago, led to the idea that light energy comes in packets, the starting point of quantum physics.',
 apply:'Estimate why a dim lamp, according to wave theory, would cause a long delay before emission.',
 see:{w:520,h:240,f:[
  ['Wave theory predicts: brighter light → faster electrons.',pill(140,60,'predicted','#f3eefa',110)+T(380,65,'Observed: no','font-size="14" font-weight="700"')],
  ['Wave theory predicts: any frequency works if bright enough.',pill(140,120,'predicted','#f3eefa',110)+T(380,125,'Observed: threshold ν₀','font-size="14" font-weight="700"')],
  ['Wave theory predicts: a time lag for dim light.',pill(140,180,'predicted','#f3eefa',110)+T(380,185,'Observed: instant','font-size="14" font-weight="700"')]]},
 seeNote:'Three predictions, three failures.',
 do:{title:'Bucket analogy',mat:'Discussion',steps:['Imagine filling a bucket with drizzle (wave) versus throwing one stone (photon).','Which can knock a can off a wall immediately?','Relate to frequency and intensity.'],obs:'One energetic stone works instantly; light drizzle does not.',why:'Energy arrives in packets, not continuously.',lab:false},
 memo:'"Wave theory: wrong on energy, wrong on threshold, wrong on time."',
 miscon:['"Wave theory explains everything about light." It explains interference and diffraction, but not the photoelectric effect.'],
 terms:['Wave picture','Instantaneous emission','Threshold'],
 q:{q:'Which observation cannot be explained by the wave theory?',o:['Light travels in straight lines','Existence of a threshold frequency','Light can be reflected','Light has a speed'],a:1,why:'Waves of any frequency should work if intense enough.'},
 exam:'"Why could the wave theory not explain the photoelectric effect?" is a frequent 3-mark question.'},
{id:'q4',num:'11.6',title:"Einstein's photoelectric equation",
 intro:'Einstein said light energy comes in packets of hν. That one idea explains every observation.',
 obj:'State and use Kmax = hν − φ₀, derive the threshold frequency, and interpret the V₀–ν graph.',
 prior:'Photoelectric findings (11.4).',
 simple:'Light comes in packets (quanta) of energy hν. One quantum is absorbed by one electron. Part of the energy (φ₀) frees the electron; the rest becomes its kinetic energy. So Kmax = hν − φ₀. If hν is less than φ₀, no electron comes out.',
 detail:'In 1905 Einstein proposed that radiation energy is built up of discrete units, quanta of energy hν. In photoelectric emission an electron absorbs one quantum. If hν exceeds φ₀, the electron is emitted with maximum kinetic energy Kmax = hν − φ₀. Consequences: (i) Kmax depends linearly on ν and not on intensity; (ii) since Kmax ≥ 0, emission occurs only if hν > φ₀, giving the threshold frequency ν₀ = φ₀/h; (iii) greater intensity means more quanta, so more electrons (larger current) but no change in Kmax; (iv) absorption of a quantum is instantaneous. Using eV₀ = Kmax: V₀ = (h/e)ν − φ₀/e, a straight line of slope h/e. Millikan (1906–1916) verified this and found h ≈ 6.4 × 10⁻³⁴ J s, close to Planck\'s value 6.626 × 10⁻³⁴ J s.',
 real:'Solar cells and light meters in cameras work on this exchange of photon energy for electron energy.',
 apply:'Light of wavelength 400 nm falls on sodium (φ₀ = 2.75 eV). Find Kmax and the stopping potential (hc = 1240 eV nm).',
 see:{w:520,h:240,f:[
  ['One photon of energy hν hits one electron.',`<path d="M40 120 l130 0" stroke="${OR}" stroke-width="3"/>`+T(100,105,'hν','font-size="15" font-weight="700"')+`<rect x="180" y="60" width="20" height="120" fill="#cfcfcf"/>`],
  ['φ₀ is used to get out of the metal…',T(190,215,'− φ₀','font-size="15" font-weight="700"')],
  ['…and the rest is kinetic energy: Kmax = hν − φ₀.',`<line x1="202" y1="120" x2="380" y2="80" stroke="${BL}" stroke-width="2.5"/><circle cx="390" cy="78" r="7" fill="${BL}"/>`+T(420,60,'Kmax = hν − φ₀','font-size="15" font-weight="700"')]]},
 seeNote:'Slope of the V₀–ν graph = h/e, the same for all metals.',
 do:{title:'Find h from data',mat:'Table of frequency and stopping potential (e.g. from the lab)',steps:['Plot V₀ against ν.','Find the slope.','Multiply by e = 1.6 × 10⁻¹⁹ C.'],obs:'About 6.6 × 10⁻³⁴ J s.',why:'Slope = h/e.',lab:false},
 memo:'"Photon pays the exit fee; the change is kinetic energy."',
 miscon:['"Kmax = hν." The work function must be subtracted.','"All electrons have Kmax." Kmax is the maximum; most have less.'],
 terms:["Einstein's photoelectric equation",'Quantum','Threshold frequency ν₀ = φ₀/h',"Planck's constant"],
 q:{q:'The slope of the stopping potential–frequency graph is:',o:['h','h/e','e/h','φ₀/e'],a:1,why:'V₀ = (h/e)ν − φ₀/e.'},
 exam:'Numericals on Kmax, V₀, ν₀ and the V₀–ν graph appear every year (2–5 marks).'},
{id:'q5',num:'11.7',title:'Particle nature of light: the photon',
 intro:'If light comes in packets, does each packet have momentum, like a tiny ball?',
 obj:'State the properties of photons and calculate photon energy, momentum and photon flux.',
 prior:"Einstein's equation (11.6).",
 simple:'Light behaves as a stream of particles called photons. Each photon has energy E = hν and momentum p = hν/c, travels at the speed of light, and has no charge. Brighter light of the same colour simply means more photons per second.',
 detail:'Photon picture: (i) in the interaction of radiation with matter, radiation behaves as if it is made of particles called photons; (ii) each photon has energy E = hν and momentum p = hν/c, and speed c, the speed of light; (iii) all photons of light of a particular frequency ν, or wavelength λ, have the same energy and momentum, whatever the intensity; increasing intensity increases the number of photons per second crossing a given area; (iv) photons are electrically neutral and are not deflected by electric and magnetic fields; (v) in a photon–particle collision, such as photon–electron collision, total energy and total momentum are conserved, though the number of photons may not be. Useful form: E (in eV) = 1240/λ (in nm).',
 real:'A 1 mW laser pointer of red light sends out roughly 3 × 10¹⁵ photons every second.',
 apply:'Find the energy and momentum of a photon of wavelength 600 nm.',
 see:{w:520,h:240,f:[
  ['A beam of light = a stream of photons.',[0,1,2,3,4,5].map(i=>`<circle cx="${80+i*60}" cy="100" r="8" fill="${OR}"/>`).join('')],
  ['Each photon: E = hν, p = hν/c, speed c, no charge.',T(260,160,'E = hν   p = h/λ','font-size="15" font-weight="700"')],
  ['Brighter light of the same colour: more photons, same energy each.',[0,1,2,3,4,5,6,7,8,9,10].map(i=>`<circle cx="${60+i*40}" cy="210" r="6" fill="${OR}"/>`).join('')]]},
 seeNote:'E (eV) ≈ 1240 / λ (nm).',
 do:{title:'Photon counting estimate',mat:'Calculator',steps:['A 60 W bulb gives about 3 W of visible light at about 550 nm.','Energy per photon = 1240/550 eV, convert to joules.','Photons per second = 3 W ÷ energy per photon.'],obs:'Of the order of 10¹⁹ photons per second.',why:'Each photon carries only a tiny energy.',lab:false},
 memo:'"Photon: hν energy, h/λ momentum, c speed, zero charge."',
 miscon:['"Photons slow down in dim light." All photons travel at c.','"Brighter light means more energetic photons." It means more photons.'],
 terms:['Photon','Photon energy','Photon momentum','Photon flux'],
 q:{q:'The energy of a photon of wavelength 620 nm is about:',o:['1 eV','2 eV','3 eV','6.2 eV'],a:1,why:'1240/620 = 2 eV.'},
 exam:'Photon energy, momentum and number-per-second numericals are common 2–3 mark items.'},
{id:'q6',num:'11.8',title:'Wave nature of matter: de Broglie wavelength',
 intro:'If light, a wave, can act like particles, can particles like electrons act like waves?',
 obj:"State de Broglie's hypothesis and calculate the de Broglie wavelength of particles, including electrons accelerated through a potential V.",
 prior:'Photon momentum (11.7).',
 simple:'De Broglie suggested that moving particles also behave like waves. The wavelength of a particle is λ = h/p = h/mv. For everyday objects it is far too small to notice; for electrons it is about the size of atoms.',
 detail:"In 1924 Louis de Broglie argued that nature is symmetrical: if radiation has a dual (wave-particle) nature, so should matter. The wavelength λ associated with a particle of momentum p is λ = h/p = h/mv (the de Broglie relation). The dual aspect is shown by the equation itself: λ is a wave attribute, p a particle attribute. For a macroscopic object, such as a ball of 0.12 kg moving at 20 m/s, λ is about 10⁻³⁴ m, far too small to measure. For an electron accelerated through a potential V from rest, K = eV and p = √(2meV), so λ = h/√(2meV) = 1.227/√V nm. For V = 120 V, λ ≈ 0.112 nm, comparable to the spacing between atoms in crystals; this is why electron waves are diffracted by crystals and why electron microscopes can see very fine detail.",
 real:'Electron microscopes use the very short de Broglie wavelength of fast electrons to see details far smaller than an ordinary light microscope can.',
 apply:'Find the de Broglie wavelength of an electron accelerated through 100 V.',
 see:{w:520,h:240,f:[
  ['A cricket ball: huge momentum, wavelength impossibly tiny.',`<circle cx="100" cy="80" r="18" fill="#c0392b"/>`+T(250,85,'λ ≈ 10⁻³⁴ m','font-size="14"')],
  ['An electron: tiny momentum, wavelength about the size of an atom.',`<circle cx="100" cy="170" r="7" fill="${BL}"/>`+wave(120,170,320,10,30,BL)],
  ['λ = h/p = h/mv',T(260,225,'λ = h/p','font-size="16" font-weight="700"')]]},
 seeNote:'For electrons: λ = 1.227/√V nm.',
 do:{title:'Compare wavelengths',mat:'Calculator',steps:['Find λ for a 0.15 kg ball at 30 m/s.','Find λ for an electron accelerated through 54 V.','Compare each with the size of an atom (~0.1 nm).'],obs:'Ball: ~10⁻³⁴ m; electron: ~0.167 nm.',why:'Only tiny particles have measurable wavelengths.',lab:false},
 memo:'"de Broglie: big momentum, small wave."',
 miscon:['"Only electrons have matter waves." Every moving object does; most are too small to detect.','"A matter wave is an electromagnetic wave." It is not; it is associated with any moving particle.'],
 terms:['de Broglie hypothesis','Matter waves','de Broglie wavelength','Dual nature'],
 q:{q:'If the momentum of a particle is doubled, its de Broglie wavelength:',o:['Doubles','Halves','Stays the same','Becomes four times'],a:1,why:'λ = h/p.'},
 exam:'de Broglie wavelength numericals (λ = 1.227/√V nm) are 2–3 mark favourites.'}
];

const CARDS=[['Work function φ₀','Minimum energy for an electron to escape a metal surface.'],['1 eV','1.602 × 10⁻¹⁹ J.'],['Three emissions','Thermionic (heat), field (strong E), photoelectric (light).'],['Photocurrent and intensity','Directly proportional.'],['Stopping potential V₀','eV₀ = Kmax; independent of intensity.'],['Threshold frequency ν₀','Minimum frequency for emission; ν₀ = φ₀/h.'],['Instantaneous','Emission within about 10⁻⁹ s.'],["Einstein's equation",'Kmax = hν − φ₀.'],['V₀–ν graph','Straight line, slope h/e, intercept gives ν₀.'],['Photon energy','E = hν = hc/λ; E(eV) = 1240/λ(nm).'],['Photon momentum','p = hν/c = h/λ.'],['de Broglie wavelength','λ = h/p = h/mv.'],['Electron wavelength','λ = 1.227/√V nm.']];

const Q=[
 {lv:1,q:'Photoelectric emission does NOT occur if the frequency of light is:',o:['Above threshold','Equal to threshold','Below threshold','Very high'],a:2,w:'Below ν₀ there is no emission.'},
 {lv:1,q:'The work function is usually measured in:',o:['Volts','Electron volts','Hertz','Newtons'],a:1,w:'eV.'},
 {lv:1,q:'True or false: the stopping potential depends on the intensity of light.',o:['True','False'],a:1,w:'It depends only on frequency (for a given metal).'},
 {lv:1,q:'The de Broglie wavelength of a particle of momentum p is:',o:['hp','h/p','p/h','hc/p'],a:1,w:'λ = h/p.'},
 {lv:2,q:'The energy of a photon of wavelength 400 nm is about (hc = 1240 eV nm):',o:['1.55 eV','3.1 eV','4.96 eV','0.31 eV'],a:1,w:'1240/400 = 3.1 eV.'},
 {lv:2,q:'Saturation photocurrent depends on:',o:['Frequency only','Intensity','Work function only','Stopping potential'],a:1,w:'More photons → more electrons.'},
 {lv:2,q:'The slope of the V₀–ν graph gives:',o:['h','h/e','φ₀','e'],a:1,w:'V₀ = (h/e)ν − φ₀/e.'},
 {lv:3,q:'Light of 3.1 eV photons falls on sodium (φ₀ = 2.75 eV). The stopping potential is:',o:['0.35 V','2.75 V','3.1 V','5.85 V'],a:0,w:'Kmax = 0.35 eV, so V₀ = 0.35 V.'},
 {lv:3,q:'The threshold wavelength for a metal of work function 2.48 eV is (hc = 1240 eV nm):',o:['250 nm','500 nm','620 nm','400 nm'],a:1,w:'λ₀ = 1240/2.48 = 500 nm.'},
 {lv:3,q:'An electron accelerated through 100 V has a de Broglie wavelength of about:',o:['0.123 nm','1.23 nm','12.3 nm','0.0123 nm'],a:0,w:'1.227/√100 = 0.1227 nm.'},
 {lv:4,q:'Assertion (A): Photoelectric emission is instantaneous. Reason (R): One photon transfers all its energy to one electron in a single event.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'No energy needs to accumulate.'},
 {lv:4,q:'An electron and a proton have the same kinetic energy. Which has the longer de Broglie wavelength?',o:['Electron','Proton','Same','Cannot say'],a:0,w:'λ = h/√(2mK): smaller mass, longer λ.'},
 {lv:4,q:'Doubling the intensity of light of fixed frequency above threshold will:',o:['Double Kmax','Double the saturation current','Halve the stopping potential','Change ν₀'],a:1,w:'Twice as many photons.'},
 {lv:5,open:true,m:3,q:"State three observations of the photoelectric effect that cannot be explained by the wave theory, and explain how Einstein's equation accounts for them.",ans:['Kmax independent of intensity → Kmax = hν − φ₀ depends only on ν (1).','Threshold frequency exists → emission only if hν ≥ φ₀ (1).','Instantaneous emission → single photon–electron interaction (1).']},
 {lv:5,open:true,m:3,q:'Draw graphs showing the variation of photocurrent with collector potential for (a) two intensities at the same frequency, (b) two frequencies at the same intensity.',ans:['(a) Same stopping potential, different saturation currents (1.5).','(b) Same saturation current, larger (more negative) stopping potential for the higher frequency (1.5).']},
 {lv:5,open:true,m:3,q:'Monochromatic light of frequency 6.0 × 10¹⁴ Hz is produced by a laser emitting 2.0 × 10⁻³ W. (a) What is the energy of a photon? (b) How many photons per second, on average, are emitted?',ans:['E = hν = 6.63 × 10⁻³⁴ × 6.0 × 10¹⁴ = 3.98 × 10⁻¹⁹ J (1.5).','N = P/E = 2.0 × 10⁻³ / 3.98 × 10⁻¹⁹ ≈ 5.0 × 10¹⁵ photons/s (1.5).']}
];

const ONEMIN=['Work function φ₀: minimum escape energy; 1 eV = 1.602 × 10⁻¹⁹ J.','Emission by heat, strong field or light.','Photocurrent ∝ intensity; saturation at high V.','Stopping potential V₀: eV₀ = Kmax; independent of intensity.','Threshold ν₀: no emission below it; emission is instantaneous.','Wave theory fails on all three key points.','Einstein: Kmax = hν − φ₀; ν₀ = φ₀/h; V₀–ν slope h/e.','Photon: E = hν, p = h/λ, speed c, no charge.','E(eV) = 1240/λ(nm).','de Broglie: λ = h/p; electrons λ = 1.227/√V nm.'];
const KEYS=[['work function',/work function|φ/i],['threshold frequency',/threshold/i],['stopping potential',/stopping/i],['intensity → current',/intensit/i],['frequency → energy',/frequenc/i],['instantaneous',/instant/i],['Kmax = hν − φ₀',/hν|h\s*ν|hv|kmax/i],['photon',/photon|quant/i],['h/e slope',/h\/e|slope/i],['de Broglie',/broglie|h\/p|h\/mv/i]];

/* ---------- lab ---------- */
let pts=[];
function current(phi,lam,I,V){const E=HC/lam,K=E-phi;if(K<=0)return{i:0,K,E};let f;if(V<=-K)f=0;else if(V<0)f=0.55*Math.pow(1+V/K,1.3);else f=1-0.45*Math.exp(-V*1.5);return{i:I*f,K,E}}
function labDraw(){const phi=+$('#peM').value,lam=+$('#peL').value,I=+$('#peI').value,V=+$('#peV').value,r=current(phi,lam,I,V),col=lamCol(lam);
 let s=`<rect x="80" y="40" width="360" height="160" rx="70" fill="none" stroke="${ink}" stroke-width="2"/><rect x="120" y="70" width="14" height="100" fill="#b4b2a9"/><rect x="386" y="70" width="14" height="100" fill="#b4b2a9"/>`+T(127,192,'C','font-size="13"')+T(393,192,'A','font-size="13"');
 for(let k=0;k<4;k++){const op=I/100;s+=`<line x1="${20+k*12}" y1="${10+k*8}" x2="122" y2="${80+k*22}" stroke="${col}" stroke-width="3" opacity="${op}"/>`}
 const n=Math.round(r.i/12);for(let k=0;k<n;k++){const x=140+((k*53+Date.now()/20)%240);s+=`<circle cx="${x}" cy="${80+(k*29)%80}" r="4" fill="${BL}"/>`}
 s+=T(260,225,`light: ${lam} nm, photon energy ${r.E.toFixed(2)} eV`,'font-size="13"');$('#peT').innerHTML=s;
 let g=`<line x1="40" y1="180" x2="500" y2="180" stroke="${ink}" stroke-width="1.5"/><line x1="270" y1="20" x2="270" y2="190" stroke="${ink}" stroke-width="1.5"/>`+T(495,200,'V','font-size="13"')+T(285,24,'I','font-size="13"');
 for(let v=-6;v<=6;v+=2)g+=T(270+v*36,198,String(v),'font-size="11"');
 if(r.K>0){let d='';for(let v=-6;v<=6;v+=0.05){const c=current(phi,lam,I,v).i;d+=(d?'L':'M')+(270+v*36)+' '+(180-c*1.5)}g+=`<path d="${d}" fill="none" stroke="${PU}" stroke-width="2.5"/><circle cx="${270-r.K*36}" cy="180" r="5" fill="${OR}"/>`+T(270-r.K*36,168,'−V₀','font-size="12"')}
 g+=`<circle cx="${270+V*36}" cy="${180-r.i*1.5}" r="6" fill="${OR}"/>`;$('#peG').innerHTML=g;
 const nu=(3e8/(lam*1e-9)/1e14).toFixed(2),nu0=(phi*1.602e-19/6.626e-34/1e14).toFixed(2);
 $('#peOut').innerHTML=r.K>0?`<p>Photon energy hν = ${r.E.toFixed(2)} eV (ν = ${nu} × 10¹⁴ Hz)</p><p><b>Kmax = hν − φ₀ = ${r.E.toFixed(2)} − ${phi} = ${r.K.toFixed(2)} eV</b></p><p><b>Stopping potential V₀ = ${r.K.toFixed(2)} V</b> · threshold ν₀ = ${nu0} × 10¹⁴ Hz</p><p>Photocurrent at V = ${V} V: ${r.i.toFixed(0)} (relative)</p><p class="note">Change the intensity: the current changes but V₀ does not.</p>`:`<p class="fb no">No photoelectrons. Photon energy ${r.E.toFixed(2)} eV is less than the work function ${phi} eV, so ν is below the threshold ν₀ = ${nu0} × 10¹⁴ Hz, however bright the light.</p>`}
function labInit(){}
function labShow(){labDraw()}
function labClick(b){return false}
function labChange(t){if(['peM','peL','peI','peV'].includes(t.id)){labDraw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
