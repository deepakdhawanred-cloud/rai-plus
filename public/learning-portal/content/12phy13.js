/* Rai Plus content pack: Class 12 Physics, Chapter 13 – Nuclei (rationalised scope: composition, size, binding energy, nuclear force, fission, fusion) */
RP.register({key:'12phy13',cls:'12',subject:'Physics',ch:'13',title:"Nuclei",color:'#5a3d82',
crumb:"HBSE Class 12 Physics · Unit: Atoms and Nuclei · Taught in December",h1:"Chapter 13: Nuclei",sub:"What nuclei are made of, how small and dense they are, why they hold together, and how fission and fusion release energy.",heroLabel:"A nucleus of protons and neutrons, and a binding energy curve",labName:'Binding energy lab',
theme:"\n:root{--g:light-dark(#5a3d82,#c6b2ea);--g2:light-dark(#f1ecf8,#150f20);--line:light-dark(#ddd2ee,#352a4a);--bg:light-dark(#ffffff,#0d0a13);--card:light-dark(#ffffff,#14101c);\n--ink:light-dark(#170f24,#ece6f6);--mute:light-dark(#5d5270,#b6abc8);--y:light-dark(#b3541e,#f2a774);--y2:light-dark(#fbeee4,#2a170a);--hd:#432c63}\n",
labHTML:`  <h2>Binding energy lab</h2>
  <p>Pick a nucleus. The lab works out its mass defect, binding energy, binding energy per nucleon, radius and density, and marks it on the curve.</p>
  <div class="ctrl"><label>Nucleus<select id="nN"></select></label></div>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="nSvg" viewBox="0 0 480 330" role="img" aria-label="Binding energy per nucleon against mass number" style="color:var(--ink)"></svg></div></div>
  <div><div class="box y" id="nOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#5a3d82',LABNAME='Binding energy lab',MIND_CENTER='Nuclei';
const PU='#5a3d82',OR='#b3541e',RD='#c0392b',GR='#888780',BL='#2e6fb5',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,'font-size="14" '+o);
/* approximate BE/A curve (semi-empirical fit, display only) */
function beA(A){if(A<2)return 0;const av=15.8,as=18.3,ac=0.714,aa=23.2;const Z=A/(1.98+0.0155*Math.pow(A,2/3));const B=av*A-as*Math.pow(A,2/3)-ac*Z*(Z-1)/Math.pow(A,1/3)-aa*(A-2*Z)**2/A;return Math.max(0,B/A)}
const NUC=[['H-2','²₁H (deuterium)',1,2,2.014102],['He-4','⁴₂He',2,4,4.002603],['Li-7','⁷₃Li',3,7,7.016003],['C-12','¹²₆C',6,12,12],['O-16','¹⁶₈O',8,16,15.994915],['Fe-56','⁵⁶₂₆Fe',26,56,55.934937],['Ni-62','⁶²₂₈Ni',28,62,61.928345],['Ba-138','¹³⁸₅₆Ba',56,138,137.905247],['U-235','²³⁵₉₂U',92,235,235.04393],['U-238','²³⁸₉₂U',92,238,238.050788]];
const mH=1.007825,mn=1.008665,uMeV=931.5;
const nucleus=(cx,cy,Z,N,r=6)=>{let s='';const n=Z+N,R=r*Math.cbrt(n)*1.25;for(let i=0;i<n;i++){const a=i*2.39996,d=R*Math.sqrt((i+.5)/n);s+=`<circle cx="${(cx+d*Math.cos(a)).toFixed(1)}" cy="${(cy+d*Math.sin(a)).toFixed(1)}" r="${r}" fill="${Math.floor((i+1)*Z/n)>Math.floor(i*Z/n)?RD:'#9a9a9a'}" stroke="#fff" stroke-width="1"/>`}return s};
function heroDraw(){let s='';for(let i=0;i<12;i++){const a=i*2.4,d=14*Math.sqrt((i+.5)/12);s+=`<circle cx="${60+d*Math.cos(a)}" cy="${70+d*Math.sin(a)}" r="6" fill="#fff" opacity="${i%2?.95:.6}"/>`}let d='';for(let A=2;A<=240;A+=4)d+=(A===2?'M':'L')+(110+A*0.6)+' '+(110-beA(A)*9);return s+`<path d="${d}" fill="none" stroke="#fff" stroke-width="2.5"/>`}
const HERO=heroDraw;
const MIND=[['Protons, neutrons, isotopes',100,50],['Size: R = R₀A^⅓',420,50],['Mass defect, E = mc²',90,150],['BE per nucleon curve',430,150],['Nuclear force',110,250],['Fission & fusion',410,250]];

const C=[
{id:'n1',num:'13.2',title:'Atomic masses and composition of the nucleus',
 intro:'If a nucleus is protons and neutrons, why is its mass less than the sum of their masses?',
 obj:'Use the atomic mass unit; describe the composition of a nucleus; define isotopes, isobars and isotones.',
 prior:'Atoms (Ch 12).',
 simple:'Nuclear masses are measured in atomic mass units: 1 u = 1/12 of the mass of a carbon-12 atom = 1.660539 × 10⁻²⁷ kg. A nucleus has Z protons and N neutrons; A = Z + N is the mass number. Proton mass ≈ 1.00727 u, neutron mass ≈ 1.00866 u. Isotopes have the same Z, different A; isobars the same A, different Z; isotones the same N.',
 detail:'Masses are measured accurately with a mass spectrometer. The neutron was discovered by James Chadwick in 1932 when beryllium bombarded with alpha particles emitted a neutral, highly penetrating radiation that knocked protons out of light nuclei. A free neutron is unstable (mean life about 1000 s) but stable inside a nucleus. Notation: ᴬ_Z X, e.g. ¹⁹⁷₇₉Au has 79 protons and 118 neutrons. Isotopes of hydrogen: protium ¹H, deuterium ²H, tritium ³H. Isobars: ³H and ³He. Isotones: ¹⁹⁸₈₀Hg and ¹⁹⁷₇₉Au (both N = 118). The atomic mass of an element is the average of its isotopes weighted by abundance; e.g. chlorine 75.4% ³⁵Cl (34.98 u) and 24.6% ³⁷Cl (36.98 u) gives ≈ 35.47 u.',
 real:'Heavy water (D₂O) used in some nuclear reactors contains deuterium, an isotope of hydrogen.',
 apply:'Lithium has two isotopes: ⁶Li (7.5%, 6.01512 u) and ⁷Li (92.5%, 7.01600 u). Find the atomic mass of lithium.',
 see:{w:520,h:220,f:[
  ['A nucleus: Z protons (red), N neutrons (grey).',nucleus(110,110,6,6,9)+lbl(110,200,'¹²₆C: Z = 6, N = 6')],
  ['Isotopes: same Z, different N.',nucleus(280,80,1,0,8)+nucleus(330,80,1,1,8)+nucleus(390,80,1,2,8)+lbl(335,130,'¹H  ²H  ³H','font-size="13"')],
  ['Isobars: same A. Isotones: same N.',lbl(340,180,'isobars ³H, ³He · isotones ¹⁹⁸Hg, ¹⁹⁷Au','font-size="12"')]]},
 seeNote:'Not to scale.',
 do:{title:'Average atomic mass',mat:'A calculator',steps:['Multiply each isotope\'s mass by its abundance.','Add the results.'],obs:'Chlorine ≈ 35.47 u.',why:'Weighted average of isotopes.',lab:false},
 memo:'"isotoPes same Protons, isotoNes same Neutrons, isobArs same A."',
 miscon:['"Mass number = atomic mass." A is a count; atomic mass is measured in u.','"Neutrons are always stable." Free neutrons decay.'],
 terms:['Atomic mass unit (u)','Mass number A','Atomic number Z','Isotope','Isobar','Isotone','Neutron'],
 q:{q:'¹⁴₆C and ¹⁴₇N are:',o:['isotopes','isobars','isotones','identical'],a:1,why:'Same A = 14.'},
 exam:'Definitions and average atomic mass: 1–2 marks.'},

{id:'n2',num:'13.3',title:'Size and density of the nucleus',
 intro:'If an atom were as big as a cricket ground, how big would its nucleus be?',
 obj:'Use R = R₀A^(1/3) and show that nuclear density is the same for all nuclei.',
 prior:'Rutherford scattering (Ch 12).',
 simple:'Scattering experiments show that the radius of a nucleus is R = R₀A^(1/3), with R₀ ≈ 1.2 fm (1 fm = 10⁻¹⁵ m). So the volume, proportional to R³, is proportional to A. Mass is also proportional to A, so density is about the same for all nuclei: about 2.3 × 10¹⁷ kg/m³.',
 detail:'Rutherford\'s alpha scattering gave an upper limit on nuclear size; fast electron scattering gives accurate radii. Example: R(Fe-56) = 1.2 × 56^(1/3) ≈ 4.6 fm; R(U-238) ≈ 7.4 fm. Density: mass ≈ A × 1.66 × 10⁻²⁷ kg, volume = (4/3)π R₀³ A, so ρ = 1.66 × 10⁻²⁷ / [(4/3)π (1.2 × 10⁻¹⁵)³] ≈ 2.3 × 10¹⁷ kg/m³, independent of A. This is about 10¹⁴ times the density of ordinary matter (e.g. water 10³ kg/m³). Neutron stars are thought to have densities similar to nuclear density.',
 real:'A teaspoon of neutron-star material would weigh roughly as much as a mountain because it is packed at nuclear density.',
 apply:'Find the ratio of the radii of ²⁷Al and ¹²⁵Te.',
 see:{w:520,h:220,f:[
  ['Radius grows as the cube root of A.',[['⁴He',4],['⁵⁶Fe',56],['²³⁸U',238]].map(([n,A],i)=>`<circle cx="${100+i*150}" cy="100" r="${12*Math.cbrt(A)}" fill="${PU}" opacity=".35" stroke="${PU}"/>`+lbl(100+i*150,190,n+': R = '+(1.2*Math.cbrt(A)).toFixed(1)+' fm','font-size="12"')).join('')],
  ['Volume ∝ A and mass ∝ A ⇒ same density for all nuclei.',lbl(260,212,'ρ ≈ 2.3 × 10¹⁷ kg/m³ (all nuclei)','font-weight="700"')]]},
 seeNote:'Drawn to the R ∝ A^(1/3) scale.',
 do:{title:'Cube-root check',mat:'Calculator',steps:['Find A^(1/3) for A = 8, 27, 64, 125.','Multiply by 1.2 fm.'],obs:'2.4, 3.6, 4.8, 6.0 fm.',why:'R = R₀A^(1/3).',lab:false},
 memo:'"R grows by the cube root; density stays put."',
 miscon:['"Bigger nuclei are denser." Density is almost constant.','"R ∝ A." R ∝ A^(1/3).'],
 terms:['Nuclear radius','R₀ ≈ 1.2 fm','Femtometre (fermi)','Nuclear density'],
 q:{q:'Ratio of radii of ²⁷Al and ¹²⁵Te:',o:['27 : 125','3 : 5','9 : 25','1 : 1'],a:1,why:'(27/125)^(1/3) = 3/5.'},
 exam:'Show density is independent of A: 2–3 marks.'},

{id:'n3',num:'13.4',title:'Mass–energy, mass defect and binding energy',
 intro:'Where does the "missing" mass of a nucleus go?',
 obj:'Use E = mc², calculate mass defect and binding energy in MeV.',
 prior:'Atomic mass unit (13.2).',
 simple:'Einstein showed that mass and energy are equivalent: E = mc². A nucleus has less mass than its separate protons and neutrons. This mass defect ΔM = [Z mₚ + (A − Z) mₙ] − M. The energy equivalent, E_b = ΔM c², is the binding energy: the energy needed to pull the nucleus apart into free nucleons (or released when it forms). 1 u ≈ 931.5 MeV.',
 detail:'Using atomic masses (which include electrons) we write ΔM = Z m_H + N mₙ − M_atom, with m_H = 1.007825 u and mₙ = 1.008665 u; the electron masses cancel. Example, ¹⁶₈O (M = 15.994915 u): ΔM = 8 × 1.007825 + 8 × 1.008665 − 15.994915 = 0.137005 u; E_b = 0.137005 × 931.5 ≈ 127.6 MeV; per nucleon ≈ 7.98 MeV. Example, Fe-56: ΔM ≈ 0.5285 u, E_b ≈ 492 MeV, ≈ 8.79 MeV per nucleon. 1 eV = 1.6 × 10⁻¹⁹ J; 1 MeV = 1.6 × 10⁻¹³ J. In chemical reactions mass changes are far too small to notice (energies of eV per atom); in nuclear reactions they are millions of times larger.',
 real:'The energy from nuclear power stations and from the Sun both come from tiny changes in mass, converted by E = mc².',
 apply:'Calculate the binding energy of ⁴₂He (M = 4.002603 u).',
 see:{w:520,h:220,f:[
  ['Separate nucleons: total mass Z mₚ + N mₙ.',nucleus(80,90,2,0,9)+nucleus(130,90,0,2,9)+lbl(110,160,'2p + 2n: 4.03298 u')],
  ['Bound nucleus: smaller mass M.',nucleus(330,90,2,2,9)+lbl(330,160,'⁴He: 4.00260 u')],
  ['ΔM = 0.03038 u ⇒ E_b = ΔM × 931.5 ≈ 28.3 MeV.',`<path d="M180 90 h100" stroke="${ink}" stroke-width="2"/><path d="M272 84 l10 6 l-10 6" fill="none" stroke="${ink}" stroke-width="2"/>`+lbl(230,80,'energy released','font-size="11"')+lbl(260,205,'E_b = ΔM c² ≈ 28.3 MeV','font-weight="700"')]]},
 seeNote:'Masses are atomic masses (electron masses cancel).',
 do:{title:'Unit conversion',mat:'Calculator',steps:['Find the energy of 1 u: 1.6605 × 10⁻²⁷ × (3 × 10⁸)² J.','Divide by 1.6 × 10⁻¹³ J/MeV.'],obs:'≈ 931.5 MeV.',why:'E = mc².',lab:false},
 memo:'"Missing mass × 931.5 = MeV of binding."',
 miscon:['"Binding energy is stored inside the nucleus." It is the energy released on formation / needed to break it.','"Mass is lost forever." It appears as energy.'],
 terms:['E = mc²','Mass defect','Binding energy','1 u = 931.5 MeV','MeV'],
 q:{q:'1 u is equivalent to about:',o:['9.31 MeV','931.5 MeV','1.6 × 10⁻¹³ MeV','0.511 MeV'],a:1,why:'E = mc².'},
 exam:'Binding energy calculations are 2–3 mark numericals.'},

{id:'n4',num:'13.4',title:'Binding energy per nucleon curve',
 intro:'Why do very light nuclei release energy by joining, and very heavy ones by splitting?',
 obj:'Interpret the graph of binding energy per nucleon (E_bn) against mass number A.',
 prior:'Binding energy (13.4).',
 simple:'Plot binding energy per nucleon, E_bn = E_b/A, against A. It is small for light nuclei, rises quickly, stays almost constant at about 8 MeV for 30 < A < 170, peaks at about 8.75 MeV near A = 56 (iron), and falls slowly to about 7.6 MeV at A = 238. Nuclei near the peak are the most stable.',
 detail:'The near-constant E_bn in the middle shows that the nuclear force is short-ranged and saturates: a nucleon interacts only with its close neighbours, so adding nucleons adds a fixed amount of binding each. For heavy nuclei the fall is due to increasing Coulomb repulsion between protons. Consequences: (i) fission: a heavy nucleus (A ≈ 240, E_bn ≈ 7.6 MeV) splitting into two medium nuclei (A ≈ 120, E_bn ≈ 8.5 MeV) gains about 0.9 MeV per nucleon, ≈ 200 MeV per fission; (ii) fusion: two light nuclei joining into a heavier one (A < 56) also increases E_bn and releases energy.',
 real:'Iron sits at the peak, which is why it builds up in the cores of massive stars: no further fusion releases energy.',
 apply:'Using E_bn ≈ 7.6 MeV for A = 240 and 8.5 MeV for A = 120, estimate the energy released when one A = 240 nucleus splits into two A = 120 nuclei.',
 see:{w:520,h:250,f:[
  ['Axes: A from 0 to 240; E_bn from 0 to 9 MeV.',`<line x1="50" y1="210" x2="500" y2="210" stroke="${ink}"/><line x1="50" y1="210" x2="50" y2="20" stroke="${ink}"/>`+lbl(480,235,'A','font-size="13"')+lbl(30,30,'E_bn','font-size="12"')+[2,4,6,8].map(v=>lbl(38,214-v*20,String(v),'font-size="11"')).join('')],
  ['The curve: low for light nuclei, ≈ 8 MeV in the middle, peak near A = 56.',(()=>{let d='';for(let A=2;A<=240;A+=2)d+=(A===2?'M':'L')+(50+A*1.85)+' '+(210-beA(A)*20);return `<path d="${d}" fill="none" stroke="${PU}" stroke-width="2.5"/><circle cx="${50+56*1.85}" cy="${210-8.79*20}" r="5" fill="${OR}"/>`+lbl(50+56*1.85,210-8.79*20-12,'Fe-56','font-size="11"')})()],
  ['Fusion to the right from light nuclei; fission to the left from heavy nuclei.',`<path d="M70 150 q20 -40 50 -60" fill="none" stroke="${BL}" stroke-width="2.5"/>`+lbl(80,140,'fusion →','font-size="12" fill="'+BL+'"')+`<path d="M480 70 q-60 -20 -150 -20" fill="none" stroke="${RD}" stroke-width="2.5"/>`+lbl(420,95,'← fission','font-size="12" fill="'+RD+'"')]]},
 seeNote:'Smooth curve from a standard fit; real light nuclei (e.g. ⁴He) lie above or below it.',
 do:{title:'Plot it yourself',mat:'Graph paper, the lab\'s table',steps:['Use the lab to get E_bn for 10 nuclei.','Plot E_bn against A.'],obs:'Rise, plateau, slow fall.',why:'Short-range saturating force plus Coulomb repulsion.',lab:true},
 memo:'"Climb to iron, slide to uranium; move towards iron to get energy."',
 miscon:['"Heavier nuclei are more tightly bound per nucleon." The peak is near iron.','"Fission and fusion are opposites, so one must absorb energy." Both release energy because both move towards the peak.'],
 terms:['Binding energy per nucleon','Saturation','Peak near A = 56','Fission','Fusion'],
 q:{q:'E_bn is maximum for nuclei near mass number:',o:['4','56','120','238'],a:1,why:'Iron region.'},
 exam:'Draw the curve and explain fission/fusion from it: 3–5 marks.'},

{id:'n5',num:'13.5',title:'Nuclear force',
 intro:'Protons repel each other strongly at nuclear distances. What holds them together?',
 obj:'State the properties of the nuclear force.',
 prior:'Coulomb force; binding energy curve.',
 simple:'The nuclear force is the strong attraction between nucleons that holds the nucleus together. It is much stronger than the Coulomb force, has a very short range (a few femtometres), is attractive beyond about 0.8 fm and strongly repulsive below it, and is almost the same between neutron–neutron, proton–neutron and proton–proton (charge independent).',
 detail:'Potential energy of a pair of nucleons: minimum near r₀ ≈ 0.8 fm; for r > r₀ the force is attractive; for r < r₀ it is repulsive, keeping nucleons from collapsing together; beyond a few fm it is negligible. Because of its short range, each nucleon interacts only with neighbours, which explains the saturation seen in the E_bn curve. The nuclear force does not depend on charge. A detailed form of the force is not known.',
 real:'Without the repulsive core, matter would collapse; without the attractive part, no nucleus beyond hydrogen could exist.',
 apply:'Why does the nuclear force not hold nucleons of two different atoms together in a molecule?',
 see:{w:520,h:240,f:[
  ['Potential energy of two nucleons against separation r.',`<line x1="60" y1="120" x2="480" y2="120" stroke="${GR}"/><line x1="60" y1="20" x2="60" y2="230" stroke="${GR}"/>`+lbl(470,140,'r (fm)','font-size="12"')+lbl(40,30,'U','font-size="12"')],
  ['Deep minimum near 0.8 fm; repulsive inside, attractive outside.',(()=>{let d='';for(let r=0.4;r<=4;r+=0.03){const q=0.713/r,U=320*(q**12-q**6);const y=120-Math.max(-95,Math.min(100,U));d+=(r<0.42?'M':'L')+(60+r*105)+' '+y}return `<path d="${d}" fill="none" stroke="${PU}" stroke-width="2.5"/>`})()+`<line x1="${60+0.8*105}" y1="20" x2="${60+0.8*105}" y2="230" stroke="${OR}" stroke-dasharray="4 4"/>`+lbl(60+0.8*105,240,'r₀ ≈ 0.8 fm','font-size="11" fill="'+OR+'"')],
  ['Beyond a few fm the force is negligible: very short range.',lbl(380,100,'≈ 0 beyond few fm','font-size="12"')]]},
 seeNote:'Shape schematic.',
 do:{title:'Compare forces',mat:'Data: Coulomb force between two protons at 1 fm',steps:['Compute F = kq²/r² for r = 1 fm.','Compare with the idea that the nuclear force must exceed this.'],obs:'Coulomb force ≈ 230 N between two protons at 1 fm, yet the nucleus holds.',why:'Nuclear force is far stronger at short range.',lab:false},
 memo:'"Strong, short, saturating, charge-blind; repulsive at the core."',
 miscon:['"The nuclear force is gravitational." Gravity is far too weak.','"It acts between all nucleons in the nucleus." Only between neighbours.'],
 terms:['Strong nuclear force','Short range','Saturation','Charge independence','Repulsive core'],
 q:{q:'The nuclear force is:',o:['long range and weak','short range and strong','dependent on charge','always repulsive'],a:1,why:'Few fm, much stronger than Coulomb.'},
 exam:'"State three properties of nuclear force" and its PE graph: 2–3 marks.'},

{id:'n6',num:'13.7',title:'Nuclear fission and chain reaction',
 intro:'One slow neutron hits a uranium-235 nucleus. Why can this lead to a city-sized power output?',
 obj:'Describe fission of U-235, estimate the energy released, and explain a chain reaction.',
 prior:'Binding energy curve.',
 simple:'When a slow neutron is absorbed by ²³⁵U, it forms ²³⁶U, which splits into two medium nuclei plus 2–3 neutrons and a large amount of energy (≈ 200 MeV). Example: ²³⁵₉₂U + ¹₀n → ¹⁴⁴₅₆Ba + ⁸⁹₃₆Kr + 3 ¹₀n + energy. The new neutrons can cause further fissions: a chain reaction.',
 detail:'Other fission products are possible, e.g. ²³⁵U + n → ¹³³Sb + ⁹⁹Nb + 4n or ¹⁴⁰Xe + ⁹⁴Sr + 2n. Energy: E_bn rises from ≈ 7.6 MeV to ≈ 8.5 MeV, about 0.9 MeV × 236 ≈ 200 MeV per fission; most appears as kinetic energy of the fragments and becomes heat. Fragments are neutron-rich and radioactive. In a nuclear reactor the chain reaction is controlled: a moderator (heavy water, graphite) slows neutrons; control rods (cadmium, boron) absorb extra neutrons; a coolant carries heat to make steam for turbines. An uncontrolled chain reaction gives an explosion. Fission of 1 kg of ²³⁵U releases roughly 8 × 10¹³ J.',
 real:'India\'s nuclear power stations, such as Tarapur and Kudankulam, generate electricity by controlled fission.',
 apply:'How many fissions per second are needed to produce 1 W if each fission gives 200 MeV?',
 see:{w:520,h:230,f:[
  ['A slow neutron approaches ²³⁵U.',`<circle cx="40" cy="110" r="7" fill="#9a9a9a"/><path d="M50 110 h50" stroke="${ink}"/>`+nucleus(150,110,40,50,4)+lbl(150,180,'²³⁵U','font-size="12"')],
  ['It splits into two fragments and 2–3 neutrons.',nucleus(320,60,20,25,4)+nucleus(330,165,16,20,4)+[[440,80],[450,120],[430,160]].map(([x,y])=>`<path d="M370 110 L${x} ${y}" stroke="${ink}"/><circle cx="${x}" cy="${y}" r="7" fill="#9a9a9a"/>`).join('')+lbl(320,15,'Ba-144','font-size="11"')+lbl(330,215,'Kr-89','font-size="11"')],
  ['About 200 MeV released per fission; the neutrons can trigger more fissions.',lbl(470,215,'≈ 200 MeV','font-weight="700" fill="'+OR+'"')]]},
 seeNote:'Fragments shown schematically.',
 do:{title:'Domino chain',mat:'30 dominoes',steps:['Set dominoes so each one knocks over two others.','Remove some (like control rods) and compare.'],obs:'Unchecked, the fall spreads rapidly; removing some keeps it steady.',why:'Chain reaction and its control.',lab:false},
 memo:'"One in, three out: chain reaction; rods and moderator keep it tame."',
 miscon:['"Fast neutrons fission ²³⁵U best." Slow (thermal) neutrons are far more effective.','"Fission products are harmless." They are radioactive.'],
 terms:['Nuclear fission','Chain reaction','Moderator','Control rods','Coolant','Critical mass'],
 q:{q:'Energy released per fission of ²³⁵U is about:',o:['2 MeV','20 MeV','200 MeV','2000 MeV'],a:2,why:'≈ 0.9 MeV × 236.'},
 exam:'Fission equation, energy estimate and reactor parts: 3 marks.'},

{id:'n7',num:'13.7',title:'Nuclear fusion: energy of the stars',
 intro:'What keeps the Sun shining for billions of years?',
 obj:'Describe fusion, the conditions it needs, and energy generation in stars.',
 prior:'Binding energy curve.',
 simple:'Fusion is the joining of two light nuclei into a heavier one, releasing energy because E_bn increases. The nuclei must come close despite Coulomb repulsion, so fusion needs extremely high temperatures (about 10⁷ K or more) and pressures: it is called thermonuclear fusion. In the Sun, hydrogen fuses into helium.',
 detail:'Examples: ¹H + ¹H → ²H + e⁺ + ν + 0.42 MeV; ²H + ²H → ³He + n + 3.27 MeV; ²H + ²H → ³H + ¹H + 4.03 MeV. In the Sun\'s core (≈ 1.5 × 10⁷ K) the proton–proton cycle combines four protons into one helium nucleus: 4 ¹H + 2e⁻ → ⁴He + 2ν + 6γ + 26.7 MeV. When hydrogen in the core runs out, stars fuse helium into carbon and heavier elements, up to iron in massive stars. Controlled fusion for electricity is still being developed: the plasma must be kept extremely hot and confined, e.g. by strong magnetic fields (tokamak); India participates in the international ITER project.',
 real:'Every bit of sunlight reaching Earth comes from hydrogen fusing into helium in the Sun\'s core.',
 apply:'Why does fusion need such high temperatures while fission does not?',
 see:{w:520,h:220,f:[
  ['Two light nuclei approach; Coulomb repulsion pushes back.',nucleus(80,110,1,1,8)+nucleus(200,110,1,2,8)+`<path d="M110 110 h50" stroke="${ink}"/><path d="M170 110 h-10" stroke="${ink}"/>`+lbl(140,150,'D + T','font-size="12"')],
  ['At ≈ 10⁷ K they get close enough to fuse.',`<circle cx="330" cy="110" r="44" fill="#f2b632" opacity=".3"/>`+nucleus(330,110,2,2,8)+lbl(330,175,'⁴He','font-size="12"')],
  ['Energy and a neutron are released.',`<path d="M380 110 L470 80" stroke="${ink}"/><circle cx="470" cy="80" r="7" fill="#9a9a9a"/>`+lbl(450,140,'+ n + 17.6 MeV','font-size="12" fill="'+OR+'"')]]},
 seeNote:'D–T fusion: ²H + ³H → ⁴He + n + 17.6 MeV.',
 do:{title:'Energy per kg',mat:'Calculator',steps:['Compare energy per nucleon: fission ≈ 200/236 MeV; D–T fusion 17.6/5 MeV.'],obs:'Fusion gives about 4 times more energy per nucleon.',why:'Steep part of the E_bn curve.',lab:false},
 memo:'"Fusion: hot, light, joins; fission: slow neutron, heavy, splits."',
 miscon:['"The Sun burns hydrogen like a fire." It fuses nuclei; it is not chemical burning.','"Controlled fusion power is already common." It is still experimental.'],
 terms:['Nuclear fusion','Thermonuclear','Proton–proton cycle','Plasma','Tokamak'],
 q:{q:'The source of the Sun\'s energy is:',o:['fission of uranium','fusion of hydrogen into helium','chemical burning','radioactive decay'],a:1,why:'Proton–proton cycle.'},
 exam:'Distinguish fission and fusion; why fusion needs high temperature: 2–3 marks.'}
];

const CARDS=[['1 u','1/12 of mass of ¹²C atom = 1.660539 × 10⁻²⁷ kg ≈ 931.5 MeV.'],['mₚ, mₙ','1.00727 u, 1.00866 u.'],['Isotopes / isobars / isotones','Same Z / same A / same N.'],['Nuclear radius','R = R₀A^(1/3), R₀ ≈ 1.2 fm.'],['Nuclear density','≈ 2.3 × 10¹⁷ kg/m³, same for all nuclei.'],['Mass defect','ΔM = Z m_H + N mₙ − M.'],['Binding energy','E_b = ΔM c² (MeV = ΔM in u × 931.5).'],['E_bn curve','≈ 8 MeV for 30 < A < 170; peak ≈ 8.75 MeV near A = 56; ≈ 7.6 at A = 238.'],['Nuclear force','Strong, short-range, saturating, charge-independent; repulsive below ≈ 0.8 fm.'],['Fission','²³⁵U + n → fragments + 2–3 n + ≈ 200 MeV.'],['Reactor','Moderator slows; control rods absorb; coolant removes heat.'],['Fusion','Light nuclei join; needs ≈ 10⁷ K; powers stars.'],['p–p cycle','4 ¹H → ⁴He + 26.7 MeV.']];

const Q=[
 {lv:1,q:'The radius of a nucleus is proportional to:',o:['A','A²','A^(1/3)','A^(1/2)'],a:2,w:'R = R₀A^(1/3).'},
 {lv:1,q:'1 u of mass is equivalent to:',o:['931.5 MeV','9.315 MeV','0.511 MeV','1 MeV'],a:0,w:'E = mc².'},
 {lv:1,q:'³H and ³He are:',o:['isotopes','isobars','isotones','isomers'],a:1,w:'Same A.'},
 {lv:1,q:'The Sun\'s energy comes from:',o:['fission','fusion','chemical burning','radioactivity'],a:1,w:'H → He.'},
 {lv:2,q:'Nuclear density is:',o:['larger for heavier nuclei','smaller for heavier nuclei','nearly the same for all nuclei','zero'],a:2,w:'ρ independent of A.'},
 {lv:2,q:'Binding energy per nucleon is highest near:',o:['A = 4','A = 56','A = 120','A = 238'],a:1,w:'Iron peak.'},
 {lv:2,q:'The role of a moderator in a reactor is to:',o:['absorb neutrons','slow down neutrons','cool the core','produce neutrons'],a:1,w:'Slow neutrons cause fission better.'},
 {lv:3,q:'Mass defect of ¹⁶O is 0.137 u. Binding energy per nucleon ≈',o:['7.98 MeV','127.6 MeV','8.79 MeV','0.137 MeV'],a:0,w:'0.137 × 931.5 / 16.'},
 {lv:3,q:'Ratio of radii of ²⁷Al and ¹²⁵Te:',o:['3 : 5','27 : 125','5 : 3','9 : 25'],a:0,w:'Cube roots.'},
 {lv:3,q:'Fissions per second for 1 W (200 MeV each):',o:['3.1 × 10¹⁰','3.1 × 10⁶','6.2 × 10¹⁸','1.6 × 10¹³'],a:0,w:'1 / (200 × 1.6 × 10⁻¹³).'},
 {lv:4,q:'Assertion (A): Energy is released in both fission of heavy nuclei and fusion of light nuclei. Reason (R): In both, the binding energy per nucleon of the products is greater than that of the reactants.',o:['Both true and R explains A','Both true, R does not explain A','A true, R false','A false, R true'],a:0,w:'Both move towards the peak.'},
 {lv:4,q:'The nearly constant E_bn for 30 < A < 170 shows that the nuclear force:',o:['is long range','saturates (short range)','depends on charge','is repulsive'],a:1,w:'Each nucleon binds only with neighbours.'},
 {lv:4,q:'Fusion needs very high temperature because:',o:['neutrons must be slowed','nuclei must overcome Coulomb repulsion','electrons must be removed','gamma rays must be absorbed'],a:1,w:'Positive nuclei repel.'},
 {lv:5,open:true,m:3,q:'Calculate the binding energy and binding energy per nucleon of ⁴₂He. (M = 4.002603 u, m_H = 1.007825 u, mₙ = 1.008665 u, 1 u = 931.5 MeV)',ans:['ΔM = 2(1.007825) + 2(1.008665) − 4.002603 = 0.030377 u (1).','E_b = 0.030377 × 931.5 ≈ 28.3 MeV (1).','E_bn = 28.3/4 ≈ 7.07 MeV (1).']},
 {lv:5,open:true,m:3,q:'Draw the binding energy per nucleon curve and use it to explain why both fission and fusion release energy.',ans:['Curve: rises, ≈ 8 MeV plateau, peak ≈ 8.75 MeV at A ≈ 56, ≈ 7.6 at A = 238 (1).','Fission: heavy (≈ 7.6) → medium (≈ 8.5) nuclei, E_bn increases, energy released (1).','Fusion: light nuclei → heavier ones with higher E_bn, energy released (1).']},
 {lv:5,open:true,m:3,q:'State three properties of the nuclear force and sketch its potential energy curve.',ans:['Strongest force; short range (few fm) (1).','Charge independent; saturates (1).','PE curve with minimum near 0.8 fm: repulsive inside, attractive outside (1).']}
];

const ONEMIN=['1 u = 1.6605 × 10⁻²⁷ kg ≈ 931.5 MeV.','Isotopes same Z; isobars same A; isotones same N.','R = 1.2 A^(1/3) fm; density ≈ 2.3 × 10¹⁷ kg/m³ for all nuclei.','ΔM = Z m_H + N mₙ − M; E_b = ΔM × 931.5 MeV.','E_bn ≈ 8 MeV plateau; peak ≈ 8.75 MeV at A ≈ 56.','Nuclear force: strong, short-range, saturating, charge-independent, repulsive core.','Fission: ²³⁵U + n → 2 fragments + 2–3 n + ≈ 200 MeV; chain reaction.','Reactor: moderator, control rods, coolant.','Fusion: needs ≈ 10⁷ K; Sun: 4 ¹H → ⁴He + 26.7 MeV.'];
const KEYS=[['atomic mass unit',/\bu\b|amu|931/i],['isotopes/isobars/isotones',/isotope|isobar|isotone/i],['R = R₀A^⅓',/R\s*=|A\^|cube root|1\.2/i],['density constant',/density/i],['mass defect',/mass defect|ΔM/i],['binding energy',/binding/i],['peak at iron',/56|iron|Fe/i],['nuclear force properties',/short.?range|saturat|charge.?indep/i],['fission / chain reaction',/fission|chain/i],['fusion',/fusion|thermonuclear/i]];

/* ---------- lab ---------- */
let sel='Fe-56';
function draw(){const n=NUC.find(x=>x[0]===sel);const [,name,Z,A,M]=n,N=A-Z;const dm=Z*mH+N*mn-M,Eb=dm*uMeV,bn=Eb/A,R=1.2*Math.cbrt(A);
 const X=a=>50+a*1.75,Y=e=>290-e*28;let s=`<line x1="50" y1="290" x2="470" y2="290" stroke="${ink}"/><line x1="50" y1="290" x2="50" y2="30" stroke="${ink}"/>`+T(455,315,'A','font-size="13"')+T(36,26,'E_bn (MeV)','font-size="11" text-anchor="start"');
 [0,2,4,6,8].forEach(v=>s+=T(38,Y(v)+4,String(v),'font-size="11"'));[0,50,100,150,200,240].forEach(a=>s+=T(X(a),306,String(a),'font-size="11"'));
 let d='';for(let a=2;a<=240;a+=2)d+=(a===2?'M':'L')+X(a)+' '+Y(beA(a));s+=`<path d="${d}" fill="none" stroke="${GR}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
 NUC.forEach(([k,,z,a,m])=>{const b=(z*mH+(a-z)*mn-m)*uMeV/a;s+=`<circle cx="${X(a)}" cy="${Y(b)}" r="${k===sel?8:4}" fill="${k===sel?OR:PU}"/>`;if(k===sel)s+=T(X(a)+(a>200?-10:10),Y(b)-12,k,`font-size="12" font-weight="700" text-anchor="${a>200?'end':'start'}"`)});
 $('#nSvg').innerHTML=s;
 $('#nOut').innerHTML=`<p><b>${name}</b>: Z = ${Z}, N = ${N}, A = ${A}</p><p>ΔM = ${Z} × 1.007825 + ${N} × 1.008665 − ${M} = <b>${dm.toFixed(6)} u</b></p><p>E_b = ΔM × 931.5 = <b>${Eb.toFixed(1)} MeV</b></p><p>E_bn = E_b / A = <b>${bn.toFixed(2)} MeV</b> per nucleon</p><p>R = 1.2 × ${A}^(1/3) = <b>${R.toFixed(2)} fm</b></p><p class="note">Dashed line: smooth fit; dots: real nuclei. ⁴He sits above the smooth trend (it is unusually stable).</p>`}
function labShow(){const s=$('#nN');if(s&&!s.options.length)s.innerHTML=NUC.map(([k,n])=>`<option value="${k}" ${k===sel?'selected':''}>${n}</option>`).join('');draw()}
function labInit(){}
function labClick(){return false}
function labChange(t){if(t.id==='nN'){sel=t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
