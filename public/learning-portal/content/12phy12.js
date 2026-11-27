/* Rai Plus content pack: Class 12 Physics, Chapter 12 – Atoms */
RP.register({key:'12phy12',cls:'12',subject:'Physics',ch:'12',title:"Atoms",color:'#1f5d6b',
crumb:"HBSE Class 12 Physics · Unit: Atoms and Nuclei · Taught in November",h1:"Chapter 12: Atoms",sub:"From Rutherford's nucleus to Bohr's energy levels, and the coloured lines that hydrogen gives out.",heroLabel:"Hydrogen energy levels with an electron jumping down and emitting a photon",labName:"Spectrum lab",
theme:"\n:root{--g:light-dark(#1f5d6b,#8fcfdc);--g2:light-dark(#e9f3f5,#10211f);--line:light-dark(#cfe2e7,#24414a);--bg:light-dark(#ffffff,#0b1416);--card:light-dark(#ffffff,#0f1c1f);\n--ink:light-dark(#0f1c1f,#e3eef1);--mute:light-dark(#4e646a,#9fb7bd);--y:light-dark(#c4532d,#f0997b);--y2:light-dark(#fbece6,#2a1610);--hd:#153f49}\n",
labHTML:`  <h2>Spectrum lab</h2>
  <p>Choose an upper and a lower energy level of hydrogen. The electron jumps down and emits a photon; its line appears in the spectrum.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="hl" viewBox="0 0 480 400" role="img" aria-label="Hydrogen energy level diagram" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>From level nᵢ<select id="ni"><option>2</option><option selected>3</option><option>4</option><option>5</option><option>6</option></select></label><label>To level n_f<select id="nf"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5</option></select></label></div>
  <div class="ctrl"><button class="btn p" id="hEmit">Emit photon</button><button class="btn" id="hClr">Clear spectrum</button></div>
  <div class="fig" style="max-width:none"><svg id="hs" viewBox="0 0 480 90" role="img" aria-label="Spectrum lines" style="color:var(--ink)"></svg></div>
  <div class="box y" id="hOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#1f5d6b',LABNAME='Spectrum lab',MIND_CENTER='Atoms';
const TE='#1f5d6b',OR='#c4532d',BL='#378add',ink='currentColor';
const En=n=>-13.6/(n*n);
function lamCol(l){if(l<380)return '#8a5cc6';if(l<450)return '#6a4bd6';if(l<495)return '#3a7fd6';if(l<570)return '#3aa65a';if(l<590)return '#d9c23a';if(l<620)return '#e08a2a';if(l<=750)return '#d6402a';return '#9a4a3a'}
const SER=['','Lyman (ultraviolet)','Balmer (visible)','Paschen (infrared)','Brackett (infrared)','Pfund (infrared)'];
function heroDraw(){let s='';[1,2,3,4].forEach(n=>{const y=110-((En(n)+13.6)/13.6)*95;s+=`<line x1="60" y1="${y}" x2="220" y2="${y}" stroke="#fff" stroke-width="2"/>`});return s+`<path d="M150 ${110-((En(3)+13.6)/13.6)*95} L150 ${110-((En(2)+13.6)/13.6)*95}" stroke="#f0997b" stroke-width="3"/><path d="M160 60 q10 -6 20 0 t20 0 t20 0" fill="none" stroke="#d6402a" stroke-width="2.5"/>`}
const HERO=heroDraw;
const MIND=[['Alpha scattering',90,60],["Bohr's postulates",430,60],['Radius and energy',90,160],['Hydrogen spectrum',430,160],["de Broglie and Bohr",260,260]];

const C=[
{id:'r1',num:'12.2',title:"Alpha-particle scattering and Rutherford's nuclear model",
 intro:'How close can an alpha particle get to a gold nucleus before it is turned back?',
 obj:'Describe the Geiger–Marsden experiment, explain impact parameter and distance of closest approach, and state the nuclear model.',
 prior:'Coulomb\'s law; Class 9 atomic models.',
 simple:'Rutherford\'s students, Geiger and Marsden, fired alpha particles at thin gold foil. Most passed through, a few were turned through large angles. This showed that the atom\'s positive charge and nearly all its mass are packed into a tiny nucleus. A head-on alpha particle stops at a distance of closest approach and turns back.',
 detail:'In 1911 Geiger and Marsden directed a beam of 5.5 MeV alpha particles from a radioactive source (²¹⁴₈₃Bi) at a thin gold foil (thickness 2.1 × 10⁻⁷ m). Most alpha particles passed nearly straight through; only about 0.14% were scattered by more than 1°, and about 1 in 8000 were deflected by more than 90°. Rutherford concluded that the entire positive charge and most of the mass is concentrated in a nucleus whose size is about 10⁻¹⁵ to 10⁻¹⁴ m, about 1/10000 of the atom\'s size. Impact parameter b: the perpendicular distance of the initial velocity of the alpha particle from the centre of the nucleus. Small b → large scattering angle; b = 0 (head-on) → the particle rebounds (θ ≈ π). Distance of closest approach d: at this point all the kinetic energy K has become electric potential energy: K = (1/4πε₀)(2e)(Ze)/d, so d = 2Ze²/(4πε₀K). This gives an upper limit to the size of the nucleus.',
 real:'This experiment showed that every atom in your body is almost entirely empty space.',
 apply:'Find the distance of closest approach for a 7.7 MeV alpha particle and a gold nucleus (Z = 79). Use e²/4πε₀ = 1.44 MeV fm.',
 see:{w:520,h:240,f:[
  ['Large impact parameter b: hardly any deflection.',`<circle cx="300" cy="140" r="8" fill="${OR}"/><path d="M40 60 L560 50" stroke="${BL}" stroke-width="2" fill="none"/>`],
  ['Smaller b: larger deflection.',`<path d="M40 110 C250 110 280 100 420 30" stroke="${BL}" stroke-width="2" fill="none"/>`],
  ['Head-on (b = 0): it stops at distance d and turns back.',`<path d="M40 140 L270 140" stroke="${BL}" stroke-width="2.5"/><path d="M270 146 L60 146" stroke="${BL}" stroke-width="2" stroke-dasharray="5 4"/>`+T(285,175,'d','font-size="14" font-weight="700"')]]},
 seeNote:'Not to scale: the nucleus is about 10⁻⁴ of the atom\'s size.',
 do:{title:'Closest approach calculator',mat:'Calculator',steps:['Use d = (1.44 MeV fm × 2Z)/K.','Try Z = 79 with K = 5.5 MeV and 7.7 MeV.','Compare d with the atom size (10⁻¹⁰ m).'],obs:'d ≈ 41 fm and 30 fm: thousands of times smaller than the atom.',why:'Energy conservation: kinetic → electric potential energy.',lab:false},
 memo:'"Small b, big bend; zero b, comes back at d."',
 miscon:['"Most alpha particles bounced back." Very few did.','"Closest approach is the nucleus radius." It is an upper limit on it.'],
 terms:['Geiger–Marsden experiment','Impact parameter','Distance of closest approach','Nuclear model'],
 q:{q:'For a head-on collision, the impact parameter is:',o:['Maximum','Zero','Equal to the atom radius','Infinite'],a:1,why:'b = 0 means the particle aims straight at the nucleus.'},
 exam:'Distance of closest approach numericals and impact-parameter definitions are 2–3 mark questions.'},
{id:'r2',num:'12.4',title:"Bohr's model of the hydrogen atom",
 intro:'Rutherford\'s orbiting electrons should spiral into the nucleus in about 10⁻⁸ s. Atoms last for billions of years. How?',
 obj:"State the difficulties of Rutherford's model and Bohr's three postulates.",
 prior:'Rutherford model (12.2); Planck\'s quantum idea (Ch 11).',
 simple:'Bohr kept the nucleus but added three rules: (1) electrons move only in certain stable orbits without radiating energy; (2) in these orbits the angular momentum is a whole-number multiple of h/2π; (3) an electron gives out or absorbs a photon only when it jumps between orbits, and the photon\'s energy equals the energy difference.',
 detail:"Difficulties with Rutherford's model: an accelerating (orbiting) electron should radiate electromagnetic energy, lose energy and spiral into the nucleus, so the atom would be unstable; and the radiated frequency would change continuously, giving a continuous spectrum, whereas atoms give line spectra. Bohr (1913) proposed: (i) an electron can revolve in certain stable orbits without emitting radiant energy; each orbit has a definite total energy (stationary states); (ii) the electron revolves only in orbits for which the angular momentum is an integral multiple of h/2π: L = mvr = nh/2π, where n = 1, 2, 3… is the principal quantum number; (iii) an electron may make a transition from one orbit to another of lower energy, emitting a photon of energy equal to the difference: hν = Eᵢ − E_f.",
 real:'Every neon sign, sodium street lamp and fireworks colour is a set of Bohr transitions.',
 apply:'What is the angular momentum of an electron in the third orbit of hydrogen? (h = 6.63 × 10⁻³⁴ J s)',
 see:{w:520,h:240,f:[
  ['Rutherford: an orbiting electron should radiate and spiral in.',`<circle cx="120" cy="120" r="6" fill="${OR}"/>`+`<path d="M200 120 C200 60 60 60 60 120 C60 170 170 170 170 120 C170 85 85 85 85 120 C85 145 145 145 140 120" fill="none" stroke="${BL}" stroke-width="2" stroke-dasharray="5 4"/>`],
  ['Bohr: only certain orbits are allowed, and in them no energy is radiated.',`<circle cx="380" cy="120" r="6" fill="${OR}"/>`+[30,60,90].map(r=>`<circle cx="380" cy="120" r="${r}" fill="none" stroke="${ink}" stroke-opacity=".45"/>`).join('')],
  ['A jump between orbits gives one photon: hν = Eᵢ − E_f.',`<path d="M380 30 L380 60" stroke="${OR}" stroke-width="3"/><path d="M400 45 q8 -6 16 0 t16 0 t16 0" fill="none" stroke="${OR}" stroke-width="2"/>`+T(260,225,'L = nh/2π   hν = Eᵢ − E_f','font-size="14" font-weight="700"')]]},
 seeNote:'Bohr\'s rules work exactly only for hydrogen-like (one-electron) atoms.',
 do:{title:'Stationary states on paper',mat:'Concentric circles labelled n = 1 to 4',steps:['Mark the allowed orbits only.','Draw arrows for jumps down from n = 3 to 2 and from 2 to 1.','Write hν = Eᵢ − E_f beside each.'],obs:'Each arrow gives one definite photon energy.',why:'Discrete orbits give discrete lines.',lab:false},
 memo:'"Stay (no radiation), Spin (L = nh/2π), Step (hν = ΔE)."',
 miscon:['"Electrons radiate while orbiting in Bohr\'s model." Only when they jump.','"Any angular momentum is allowed." Only multiples of h/2π.'],
 terms:['Stationary states','Principal quantum number','Quantisation of angular momentum','Transition'],
 q:{q:"According to Bohr, the angular momentum of an electron in the nth orbit is:",o:['nh','nh/2π','h/2πn','2πnh'],a:1,why:'L = nh/2π.'},
 exam:"Bohr's postulates and the limitations of Rutherford's model are 3-mark favourites."},
{id:'r3',num:'12.4',title:'Radius and energy of the orbits',
 intro:'Bohr\'s rules give exact numbers: how big is a hydrogen atom, and how much energy holds its electron?',
 obj:'Use rₙ = n²a₀ and Eₙ = −13.6/n² eV; define ground state, excited states and ionisation energy.',
 prior:"Bohr's postulates (12.4).",
 simple:'The radius of the nth orbit is n² times the smallest radius a₀ = 0.53 Å. The energy of the nth orbit is −13.6/n² eV. The negative sign means the electron is bound. The lowest level (n = 1) is the ground state; higher ones are excited states. 13.6 eV is needed to remove the electron completely: the ionisation energy.',
 detail:'Combining the centripetal force condition with L = nh/2π gives rₙ = (n²/m)(h/2π)²(4πε₀/e²). For n = 1, r₁ = a₀ = 5.3 × 10⁻¹¹ m (the Bohr radius), so rₙ = n²a₀. The total energy is Eₙ = −(e²/8πε₀rₙ), giving Eₙ = −13.6/n² eV. The negative total energy means the electron is bound to the nucleus. Ground state (n = 1): −13.6 eV. First excited state (n = 2): −3.4 eV; n = 3: −1.51 eV. As n → ∞, E → 0: the electron is free. The minimum energy needed to free the electron from the ground state, 13.6 eV, is the ionisation energy. The energy needed to raise it from n = 1 to n = 2 is the excitation energy, 10.2 eV.',
 real:'At room temperature almost all hydrogen atoms are in the ground state; heating gas strongly in a discharge tube excites them to higher levels.',
 apply:'Find the energy needed to excite a hydrogen atom from n = 1 to n = 3.',
 see:{w:520,h:240,f:[
  ['n = 1: E = −13.6 eV (ground state).',`<line x1="80" y1="210" x2="440" y2="210" stroke="${TE}" stroke-width="3"/>`+T(470,215,'−13.6','font-size="12"')],
  ['n = 2: −3.4 eV; n = 3: −1.51 eV; levels crowd together.',`<line x1="80" y1="90" x2="440" y2="90" stroke="${TE}" stroke-width="2"/><line x1="80" y1="60" x2="440" y2="60" stroke="${TE}" stroke-width="2"/><line x1="80" y1="48" x2="440" y2="48" stroke="${TE}" stroke-width="1.5"/>`+T(470,95,'−3.4','font-size="12"')+T(470,65,'−1.51','font-size="12"')],
  ['E = 0 at n = ∞: 13.6 eV frees the electron (ionisation).',`<line x1="80" y1="30" x2="440" y2="30" stroke="${ink}" stroke-dasharray="5 4"/>`+T(470,34,'0','font-size="12"')+`<path d="M60 210 L60 34" stroke="${OR}" stroke-width="2.5"/>`+T(30,120,'13.6 eV','font-size="12"')]]},
 seeNote:'rₙ = n² × 0.53 Å.',
 do:{title:'Level table',mat:'Calculator',steps:['Calculate Eₙ = −13.6/n² for n = 1 to 6.','Calculate rₙ = 0.53 n² Å.','Plot Eₙ on a vertical scale.'],obs:'Levels get closer together as n increases while radii grow fast.',why:'E ∝ 1/n², r ∝ n².',lab:false},
 memo:'"Radius grows n²; energy shrinks 1/n²."',
 miscon:['"Higher orbit = more negative energy." Higher orbits are less negative (closer to zero).','"Ionisation energy is 13.6 eV for any level." It is 13.6/n² from level n.'],
 terms:['Bohr radius','Ground state','Excited state','Ionisation energy','Excitation energy'],
 q:{q:'The energy of the electron in the n = 2 level of hydrogen is:',o:['−13.6 eV','−6.8 eV','−3.4 eV','−1.51 eV'],a:2,why:'−13.6/4.'},
 exam:'Energy and radius numericals and level-diagram questions carry 2–5 marks.'},
{id:'r4',num:'12.5',title:'Line spectra of the hydrogen atom',
 intro:'Look at hot hydrogen through a prism: not a rainbow, but a few sharp coloured lines. Why those colours?',
 obj:'Explain emission and absorption lines using hν = Eᵢ − E_f, and name the spectral series with their regions.',
 prior:'Energy levels (12.4).',
 simple:'When an electron drops from a higher level to a lower one, it emits a photon of exactly the energy difference. Each possible drop gives one line. Drops to n = 1 give the Lyman series (ultraviolet), to n = 2 the Balmer series (visible), to n = 3 the Paschen series (infrared), and so on.',
 detail:'Frequency of the emitted photon: hν = Eᵢ − E_f = 13.6 (1/n_f² − 1/nᵢ²) eV. In wavelength form: 1/λ = R(1/n_f² − 1/nᵢ²), where R = 1.097 × 10⁷ m⁻¹ is the Rydberg constant. Series: Lyman (n_f = 1, ultraviolet), Balmer (n_f = 2, visible), Paschen (n_f = 3, infrared), Brackett (n_f = 4) and Pfund (n_f = 5), both infrared. The Balmer lines Hα (3 → 2, 656.3 nm, red), Hβ (4 → 2, 486.1 nm), Hγ (434.1 nm) and Hδ (410.2 nm) were the first to be studied. Absorption: if white light passes through hydrogen gas at low temperature, an electron absorbs a photon of exactly the right energy and moves up a level, leaving dark lines at the same wavelengths. Each element has its own unique set of lines, which is why spectra are used to identify elements, even in distant stars.',
 real:'Astronomers know the Sun contains hydrogen because its spectrum shows dark lines at exactly hydrogen\'s Balmer wavelengths.',
 apply:'Calculate the wavelength of the photon emitted when an electron in hydrogen drops from n = 4 to n = 2 (hc = 1240 eV nm).',
 see:{w:520,h:240,f:[
  ['Drops to n = 1: Lyman series (ultraviolet).',`<line x1="60" y1="210" x2="460" y2="210" stroke="${TE}" stroke-width="2.5"/>`+[2,3,4].map((n,i)=>`<path d="M${90+i*20} ${210-(13.6-13.6/n/n)*12} V208" stroke="#8a5cc6" stroke-width="2"/>`).join('')],
  ['Drops to n = 2: Balmer series (visible).',`<line x1="60" y1="${210-10.2*12}" x2="460" y2="${210-10.2*12}" stroke="${TE}" stroke-width="2"/>`+[[3,'#d6402a'],[4,'#3a7fd6'],[5,'#6a4bd6']].map(([n,c],i)=>`<path d="M${230+i*22} ${210-(13.6-13.6/n/n)*12} V${210-10.2*12}" stroke="${c}" stroke-width="2.5"/>`).join('')],
  ['Drops to n = 3: Paschen series (infrared).',`<line x1="60" y1="${210-(13.6-1.51)*12}" x2="460" y2="${210-(13.6-1.51)*12}" stroke="${TE}" stroke-width="2"/>`+T(400,40,'1/λ = R(1/n_f² − 1/nᵢ²)','font-size="13"')]]},
 seeNote:'Build the series line by line in the Spectrum lab.',
 do:{title:'Spectroscope (where available)',mat:'A hydrogen discharge tube with a hand spectroscope, or a CD and a narrow slit for a sodium or tube light',steps:['Look at the light through the spectroscope or at its reflection on the CD.','Note the bright lines.','Compare with an ordinary bulb.'],obs:'A gas lamp gives separate bright lines; a bulb gives a continuous band.',why:'Gas atoms emit only definite photon energies.',lab:true},
 memo:'"Lyman Ultra, Balmer Bright (visible), Paschen and the rest Infrared."',
 miscon:['"The Balmer series is ultraviolet." It is in the visible region.','"Emission and absorption lines are at different wavelengths." They match for the same transitions.'],
 terms:['Emission spectrum','Absorption spectrum','Rydberg constant','Lyman, Balmer, Paschen, Brackett, Pfund series'],
 q:{q:'The Balmer series lines are emitted when electrons fall to:',o:['n = 1','n = 2','n = 3','n = 4'],a:1,why:'n_f = 2.'},
 exam:'Transition wavelengths, series identification and the energy level diagram are 3–5 mark questions.'},
{id:'r5',num:'12.6',title:"de Broglie's explanation of Bohr's second postulate",
 intro:'Why should angular momentum come only in steps of h/2π? An electron wave gives a beautiful answer.',
 obj:"Show that 2πrₙ = nλ leads to mvr = nh/2π, and state the limitations of Bohr's model.",
 prior:'de Broglie wavelength (Ch 11).',
 simple:'Treat the electron as a wave going round the orbit. It can only fit if a whole number of wavelengths fit round the circle: 2πr = nλ. Using λ = h/mv gives mvr = nh/2π, which is Bohr\'s second postulate.',
 detail:"De Broglie argued that the electron in a circular orbit must be a standing wave. For a standing wave on a circle, the circumference must equal a whole number of wavelengths: 2πrₙ = nλ, n = 1, 2, 3… With λ = h/mvₙ this gives 2πrₙ = nh/mvₙ, i.e. mvₙrₙ = nh/2π, Bohr's quantum condition. So the stable orbits are those where the electron wave fits exactly. Limitations of the Bohr model: (i) it applies only to hydrogenic (single-electron) atoms; it cannot be extended even to helium; (ii) it explains the frequencies of the lines but not their relative intensities.",
 real:'A guitar string vibrates only at frequencies where whole half-waves fit along it; an electron orbit is a closed loop version of the same idea.',
 apply:'How many de Broglie wavelengths fit around the third orbit of hydrogen?',
 see:{w:520,h:240,f:[
  ['A wave that does not close on itself cancels out: not allowed.',(()=>{let d='';for(let i=0;i<=200;i++){const a=i/200*Math.PI*2,r=60+8*Math.sin(a*3.4);d+=(i?'L':'M')+(130+r*Math.cos(a))+' '+(120+r*Math.sin(a))}return `<path d="${d}" fill="none" stroke="#b4b2a9" stroke-width="2"/>`})()],
  ['A wave with exactly n wavelengths closes perfectly: a stable orbit.',(()=>{let d='';for(let i=0;i<=200;i++){const a=i/200*Math.PI*2,r=60+8*Math.sin(a*4);d+=(i?'L':'M')+(380+r*Math.cos(a))+' '+(120+r*Math.sin(a))}return `<path d="${d}" fill="none" stroke="${TE}" stroke-width="2.5"/>`})()],
  ['2πr = nλ and λ = h/mv give mvr = nh/2π.',T(260,225,'2πr = nλ  ⇒  mvr = nh/2π','font-size="14" font-weight="700"')]]},
 seeNote:'Here n = 4.',
 do:{title:'Ring standing waves',mat:'A loop of thin wire or a necklace chain',steps:['Shake a closed loop of chain gently in a circle.','Try to see a steady pattern with 2, 3 or 4 bumps.'],obs:'Only patterns with a whole number of bumps stay steady.',why:'Standing waves on a loop need whole wavelengths.',lab:false},
 memo:'"Fit the wave, find the orbit."',
 miscon:['"Bohr\'s model works for all atoms." Only for one-electron atoms.'],
 terms:['Standing wave','Quantum condition','Hydrogenic atom','Limitations of Bohr model'],
 q:{q:'The circumference of the nth Bohr orbit equals:',o:['λ/n','nλ','n²λ','λ'],a:1,why:'2πrₙ = nλ.'},
 exam:'"Use de Broglie\'s hypothesis to explain Bohr\'s second postulate" is a frequent 2–3 mark question.'}
];

const CARDS=[['Geiger–Marsden','5.5 MeV alpha particles on gold foil; about 1 in 8000 deflected by more than 90°.'],['Impact parameter b','Perpendicular distance of the initial velocity from the nucleus.'],['Closest approach','d = 2Ze²/(4πε₀K).'],['Nucleus size','About 10⁻¹⁵ to 10⁻¹⁴ m.'],["Rutherford's difficulty",'Orbiting electron should radiate and spiral in; predicts a continuous spectrum.'],['Bohr postulate 1','Stable orbits without radiation.'],['Bohr postulate 2','mvr = nh/2π.'],['Bohr postulate 3','hν = Eᵢ − E_f.'],['Bohr radius','a₀ = 5.3 × 10⁻¹¹ m; rₙ = n²a₀.'],['Energy levels','Eₙ = −13.6/n² eV.'],['Ionisation energy','13.6 eV from ground state.'],['Series','Lyman (UV, n_f = 1), Balmer (visible, 2), Paschen (IR, 3), Brackett (4), Pfund (5).'],['Rydberg','1/λ = R(1/n_f² − 1/nᵢ²); R = 1.097 × 10⁷ m⁻¹.'],['Hα','3 → 2, 656.3 nm, red.'],['de Broglie and Bohr','2πr = nλ gives mvr = nh/2π.'],['Limitations','Only hydrogenic atoms; cannot explain line intensities.']];

const Q=[
 {lv:1,q:'The Bohr radius of hydrogen is about:',o:['5.3 × 10⁻¹¹ m','5.3 × 10⁻¹⁵ m','1.0 × 10⁻¹⁰ m','5.3 × 10⁻⁹ m'],a:0,w:'a₀ = 0.53 Å.'},
 {lv:1,q:'The ground-state energy of hydrogen is:',o:['−3.4 eV','−13.6 eV','13.6 eV','0 eV'],a:1,w:'E₁ = −13.6 eV.'},
 {lv:1,q:'True or false: the Lyman series lies in the visible region.',o:['True','False'],a:1,w:'It is in the ultraviolet.'},
 {lv:1,q:'For a head-on collision, the scattering angle of the alpha particle is about:',o:['0°','45°','90°','180°'],a:3,w:'It rebounds.'},
 {lv:2,q:'The radius of the n = 3 orbit is how many times the Bohr radius?',o:['3','6','9','27'],a:2,w:'rₙ = n²a₀.'},
 {lv:2,q:'Which postulate did de Broglie\'s hypothesis explain?',o:['Stable orbits','Quantisation of angular momentum','hν = Eᵢ − E_f','Nucleus size'],a:1,w:'2πr = nλ gives mvr = nh/2π.'},
 {lv:2,q:'Spectral lines in the Paschen series end at:',o:['n = 1','n = 2','n = 3','n = 4'],a:2,w:'n_f = 3.'},
 {lv:3,q:'The energy of the photon emitted in the 3 → 2 transition is about:',o:['1.89 eV','10.2 eV','12.1 eV','3.4 eV'],a:0,w:'−1.51 − (−3.4) = 1.89 eV.'},
 {lv:3,q:'The wavelength of that photon is about (hc = 1240 eV nm):',o:['122 nm','486 nm','656 nm','1875 nm'],a:2,w:'1240/1.89 ≈ 656 nm (Hα).'},
 {lv:3,q:'Energy needed to ionise hydrogen from n = 2:',o:['13.6 eV','10.2 eV','3.4 eV','1.51 eV'],a:2,w:'0 − (−3.4) = 3.4 eV.'},
 {lv:4,q:'Assertion (A): The total energy of an electron in a Bohr orbit is negative. Reason (R): The electron is bound to the nucleus.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'Energy must be supplied to free it.'},
 {lv:4,q:'The ratio of the shortest wavelengths of the Lyman and Balmer series is:',o:['1 : 4','4 : 1','1 : 2','2 : 1'],a:0,w:'Series limits: 1/λ ∝ 1/n_f², so λ ∝ n_f²: 1 : 4.'},
 {lv:5,open:true,m:3,q:"State Bohr's postulates for the hydrogen atom.",ans:['Electrons revolve in certain stable orbits without radiating (1).','Angular momentum mvr = nh/2π (1).','Transition between orbits emits/absorbs a photon with hν = Eᵢ − E_f (1).']},
 {lv:5,open:true,m:3,q:'Draw the energy level diagram for hydrogen showing transitions for the Lyman and Balmer series. Calculate the wavelength of the first Balmer line.',ans:['Levels −13.6, −3.4, −1.51, −0.85 eV… with 0 at n = ∞ (1).','Arrows to n = 1 (Lyman) and n = 2 (Balmer) (1).','3 → 2: ΔE = 1.89 eV; λ = 1240/1.89 ≈ 656 nm (1).']},
 {lv:5,open:true,m:3,q:'Use de Broglie\'s hypothesis to explain Bohr\'s second postulate, and state two limitations of the Bohr model.',ans:['Stable orbit holds a standing wave: 2πr = nλ (1).','With λ = h/mv: mvr = nh/2π (1).','Limitations: only one-electron atoms; does not explain line intensities (1).']}
];

const ONEMIN=['Geiger–Marsden: few large-angle scatterings → tiny nucleus (10⁻¹⁵–10⁻¹⁴ m).','b = 0 → rebound; closest approach d = 2Ze²/(4πε₀K).',"Rutherford's model can't explain stability or line spectra.",'Bohr: stable orbits; mvr = nh/2π; hν = Eᵢ − E_f.','rₙ = n²a₀, a₀ = 0.53 Å; Eₙ = −13.6/n² eV.','Ionisation energy 13.6 eV; first excitation 10.2 eV.','Lyman UV (→1), Balmer visible (→2), Paschen IR (→3).','1/λ = R(1/n_f² − 1/nᵢ²); Hα 656.3 nm.','de Broglie: 2πr = nλ explains quantisation.','Bohr model: only hydrogenic atoms; no intensities.'];
const KEYS=[['alpha scattering',/alpha|α|scatter/i],['nucleus',/nucle/i],['impact parameter',/impact/i],['closest approach',/closest/i],['stable orbits',/stable|stationary/i],['mvr = nh/2π',/nh\/2π|nh\/2pi|angular momentum/i],['hν = ΔE',/hν|h\s*ν|hv|transition/i],['−13.6/n²',/13\.6/],['Lyman / Balmer / Paschen',/lyman|balmer|paschen/i],['2πr = nλ',/2πr|standing wave/i]];

/* ---------- lab ---------- */
let lines=[];const Y=n=>30+340*Math.sqrt(-En(n)/13.6);
function labDraw(lastI,lastF){let s='';for(let n=1;n<=6;n++){const y=Y(n);s+=`<line x1="80" y1="${y}" x2="400" y2="${y}" stroke="${TE}" stroke-width="${n===1?3:2}"/>`+T(n>=5?30+(n-5)*28:50,y+(n>=5?-4:5),'n='+n,'font-size="12"')+T(n>=5?440+(n-5)*30:440,y+(n>=5?-4:5),En(n).toFixed(2),'font-size="11"')}s+=T(240,392,'energy axis stretched (not to scale)','font-size="11"');
 s+=`<line x1="80" y1="30" x2="400" y2="30" stroke="${ink}" stroke-dasharray="5 4"/>`+T(440,34,'0 eV','font-size="11"');
 lines.forEach((l,k)=>{const x=100+(k%14)*21;s+=`<path d="M${x} ${Y(l.i)} V${Y(l.f)}" stroke="${l.c}" stroke-width="${l===lines[lines.length-1]?3.5:1.6}" opacity="${l===lines[lines.length-1]?1:.5}"/><path d="M${x-5} ${Y(l.f)-9} l5 9 l5 -9" fill="none" stroke="${l.c}" stroke-width="2"/>`});
 $('#hl').innerHTML=s;
 let sp=`<rect x="10" y="20" width="460" height="40" fill="#111"/>`;const X=l=>10+((l-90)/(2000-90))*460;
 lines.forEach(l=>{sp+=`<line x1="${X(l.lam)}" y1="20" x2="${X(l.lam)}" y2="60" stroke="${l.c}" stroke-width="2"/>`});
 sp+=`<rect x="${X(380)}" y="62" width="${X(750)-X(380)}" height="6" fill="url(#vis)"/><defs><linearGradient id="vis"><stop offset="0" stop-color="#8a5cc6"/><stop offset=".35" stop-color="#3a7fd6"/><stop offset=".55" stop-color="#3aa65a"/><stop offset=".75" stop-color="#d9c23a"/><stop offset="1" stop-color="#d6402a"/></linearGradient></defs>`+T(X(565),84,'visible','font-size="11"')+T(40,14,'90 nm','font-size="11"')+T(440,14,'2000 nm','font-size="11"');
 $('#hs').innerHTML=sp}
function emit(){const ni=+$('#ni').value,nf=+$('#nf').value;if(ni<=nf){$('#hOut').innerHTML='<p class="fb no">The upper level must be higher than the lower level for emission.</p>';return}
 const dE=En(ni)-En(nf),lam=1240/dE,c=lamCol(lam);if(!lines.some(l=>l.i===ni&&l.f===nf))lines.push({i:ni,f:nf,lam,c});else{const L=lines.find(l=>l.i===ni&&l.f===nf);lines=lines.filter(l=>l!==L);lines.push(L)}labDraw();
 $('#hOut').innerHTML=`<p><b>${ni} → ${nf}</b>: ΔE = ${En(ni).toFixed(2)} − (${En(nf).toFixed(2)}) = <b>${dE.toFixed(2)} eV</b></p><p>λ = 1240 / ${dE.toFixed(2)} = <b>${lam.toFixed(1)} nm</b></p><p>Series: <b>${SER[nf]}</b>${lam>=380&&lam<=750?`. You can see this one: it is <span style="color:${c};font-weight:700">coloured</span>.`:''}</p>`}
function labInit(){}
function labShow(){labDraw()}
function labClick(b){if(b.id==='hEmit'){emit();return true}if(b.id==='hClr'){lines=[];labDraw();$('#hOut').innerHTML='';return true}return false}
function labChange(t){return t.id==='ni'||t.id==='nf'}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
