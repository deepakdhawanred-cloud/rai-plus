/* Rai Plus content pack: Class 11 Physics, Chapter 11 – Thermodynamics */
RP.register({key:'11phy11',cls:'11',subject:'Physics',ch:'11',title:"Thermodynamics",color:'#3a4f8a',
crumb:"HBSE Class 11 Physics · Unit: Thermodynamics · Taught in November",h1:"Chapter 11: Thermodynamics",sub:"Heat, work and internal energy: the first and second laws, gas processes, engines and refrigerators.",heroLabel:"A pressure–volume diagram with an isothermal and an adiabatic curve",labName:"P–V lab",
theme:"\n:root{--g:light-dark(#3a4f8a,#a9b9ea);--g2:light-dark(#eef1fa,#141a2b);--line:light-dark(#d6dcf0,#2a3350);--bg:light-dark(#ffffff,#0d1019);--card:light-dark(#ffffff,#121726);\n--ink:light-dark(#121a2b,#e8ecf7);--mute:light-dark(#525c78,#aab3cc);--y:light-dark(#c4532d,#f0997b);--y2:light-dark(#fbece6,#2a1610);--hd:#26355f}\n",
labHTML:`  <h2>P–V lab</h2>
  <p>One mole of ideal gas starts at 300 K and 100 kPa. Choose a process and how far it goes. The shaded area under the curve is the work done by the gas.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="pv" viewBox="0 0 520 340" role="img" aria-label="Pressure against volume" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Process<select id="pP"><option value="iso">Isothermal (T constant)</option><option value="adi">Adiabatic (Q = 0)</option><option value="bar">Isobaric (P constant)</option><option value="cho">Isochoric (V constant)</option></select></label><label>Gas<select id="pG"><option value="1.6667">Monatomic (γ = 5/3)</option><option value="1.4">Diatomic (γ = 7/5)</option></select></label></div>
  <div class="ctrl"><label id="pRl">Final volume ÷ initial volume<input type="range" id="pR" min="0.5" max="2.5" step="0.1" value="2"></label></div>
  <div class="box y" id="pOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#3a4f8a',LABNAME='P–V lab',MIND_CENTER='Thermodynamics';
const BL='#3a4f8a',OR='#c4532d',GR='#2f7d3b',ink='currentColor',R=8.314;
const pill=(x,y,t,c='#eef1fa',w=170)=>`<rect x="${x-w/2}" y="${y-17}" width="${w}" height="34" rx="8" fill="${c}" stroke="${BL}"/>`+T(x,y+5,t,'font-size="13"');
function heroDraw(){let a='',b='';for(let v=1;v<=3;v+=0.05){a+=(a?'L':'M')+(60+v*70)+' '+(120-80/v);b+=(b?'L':'M')+(60+v*70)+' '+(120-80/Math.pow(v,1.4))}return `<path d="${a}" fill="none" stroke="#fff" stroke-width="2.5"/><path d="${b}" fill="none" stroke="#f0997b" stroke-width="2.5"/>`}
const HERO=heroDraw;
const MIND=[['Zeroth law and state',90,50],['First law',430,50],['Specific heats of gases',90,150],['Processes',430,150],['Engines and refrigerators',90,250],['Second law and Carnot',430,250]];

const C=[
{id:'h1',num:'11.2–11.3, 11.7',title:'Thermal equilibrium, zeroth law and state variables',
 intro:'Why can a thermometer tell you the temperature of your body at all?',
 obj:'State the zeroth law, define thermal equilibrium, and distinguish state variables, extensive and intensive.',
 prior:'Temperature and heat (Ch 10).',
 simple:'Two bodies in contact stop exchanging heat when they reach the same temperature: thermal equilibrium. Zeroth law: if A and B are each in thermal equilibrium with C, then A and B are in equilibrium with each other. A system\'s state is described by variables like pressure, volume, temperature and mass.',
 detail:'Thermodynamics deals with heat, work and internal energy of macroscopic systems. A system is in thermodynamic equilibrium when its macroscopic variables do not change with time. Two systems separated by a diathermic (conducting) wall reach thermal equilibrium; an adiabatic (insulating) wall prevents heat flow. Zeroth law: two systems in thermal equilibrium with a third system separately are in thermal equilibrium with each other. It leads to the concept of temperature. State variables describe equilibrium states: pressure P, volume V, temperature T, mass m, internal energy U. Extensive variables depend on the size of the system (V, m, U); intensive variables do not (P, T, density). Equation of state: for an ideal gas, PV = μRT.',
 real:'A clinical thermometer works because it comes to thermal equilibrium with your body.',
 apply:'Classify as extensive or intensive: volume, temperature, mass, pressure, density, internal energy.',
 see:{w:520,h:240,f:[
  ['A and C come to the same temperature; so do B and C.',pill(130,60,'A ⇄ C','#eef1fa',110)+pill(390,60,'B ⇄ C','#eef1fa',110)],
  ['Then A and B are already in equilibrium: zeroth law.',pill(260,130,'A ⇄ B','#fbece6',110)],
  ['State variables: P, V, T, U, m (extensive or intensive).',T(260,200,'P, V, T, U','font-size="15" font-weight="700"')]]},
 seeNote:'The zeroth law defines temperature.',
 do:{title:'Three cups',mat:'Three cups of water at different temperatures, a thermometer',steps:['Place cups A and B in a tray of water C; wait 10 minutes.','Measure all three.'],obs:'All read nearly the same.',why:'Each reaches equilibrium with C, so with each other.',lab:false},
 memo:'"Zero-th: equal to a third means equal to each other."',
 miscon:['"Heat is a state variable." Heat and work depend on the path; U is a state variable.'],
 terms:['System and surroundings','Thermal equilibrium','Diathermic wall','Adiabatic wall','Zeroth law','State variables','Extensive and intensive'],
 q:{q:'Which is an intensive variable?',o:['Volume','Mass','Temperature','Internal energy'],a:2,why:'Independent of system size.'},
 exam:'Zeroth law and extensive/intensive classification are 1–2 mark questions.'},
{id:'h2',num:'11.4–11.5',title:'Heat, work, internal energy and the first law',
 intro:'Rub your hands: they warm up without any flame. Heat and work must both change the same thing.',
 obj:'Define internal energy, explain how heat and work change it, and apply ΔQ = ΔU + ΔW, with W = PΔV.',
 prior:'Work and energy (Ch 5).',
 simple:'Internal energy U is the total energy of the molecules of a system. It can be changed by heat flowing in or out, or by work done on or by the system. First law: heat supplied = increase in internal energy + work done by the system: ΔQ = ΔU + ΔW. For a gas expanding at pressure P, the work done is PΔV.',
 detail:'Internal energy U is the sum of the kinetic and potential energies of the molecules in the frame where the centre of mass is at rest; it depends only on the state (a state variable). Heat and work are two modes of energy transfer; they are not state variables. First law of thermodynamics: ΔQ = ΔU + ΔW, where ΔQ is heat supplied to the system and ΔW is work done by the system. It is the law of conservation of energy applied to thermal systems. Work done by a gas in a small expansion: ΔW = P ΔV; for larger changes, it is the area under the P–V curve. Sign convention: ΔQ positive when heat is supplied to the system; ΔW positive when the system does work. Special case: when water boils into steam at constant pressure, ΔQ = ΔU + PΔV, with a large part going into the expansion.',
 real:'A bicycle pump gets hot because the work you do compresses the air and raises its internal energy.',
 apply:'1 g of water becomes 1671 cm³ of steam at 1 atm (1.013 × 10⁵ Pa). Latent heat 2256 J/g. Find the change in internal energy.',
 see:{w:520,h:240,f:[
  ['Heat ΔQ goes into the gas.',pill(110,60,'ΔQ in','#fbece6',100)],
  ['Some raises the internal energy ΔU…',pill(260,120,'ΔU','#eef1fa',90)],
  ['…the rest is work done by the gas, ΔW = PΔV.',pill(410,180,'ΔW = PΔV','#eef1fa',120)+T(260,230,'ΔQ = ΔU + ΔW','font-size="15" font-weight="700"')]]},
 seeNote:'Work = area under the P–V curve.',
 do:{title:'Pump and feel',mat:'A bicycle pump',steps:['Block the outlet with your thumb.','Push the handle down quickly several times.','Feel the barrel.'],obs:'The barrel gets warm.',why:'Work done on the gas raises its internal energy.',lab:false},
 memo:'"Q in = U up + W out."',
 miscon:['"Heat is stored in a body." Internal energy is stored; heat is energy in transit.','"Work done by a gas is always P × V." It is the area under the P–V curve.'],
 terms:['Internal energy','Heat','Work','First law of thermodynamics','Sign convention'],
 q:{q:'In an adiabatic process the first law becomes:',o:['ΔU = 0','ΔQ = ΔW','ΔU = −ΔW','ΔW = 0'],a:2,why:'ΔQ = 0.'},
 exam:'First-law statements and numericals (boiling water) carry 2–3 marks.'},
{id:'h3',num:'11.6',title:'Specific heat capacities of a gas',
 intro:'Heating a gas in a sealed box needs less heat than heating it while it pushes a piston. Why?',
 obj:'Distinguish Cp and Cv and derive Mayer\'s relation Cp − Cv = R.',
 prior:'First law (11.5).',
 simple:'Heating a gas at constant volume: all the heat raises internal energy (Cv). At constant pressure: some heat also does work as the gas expands, so more heat is needed (Cp). For an ideal gas, Cp − Cv = R.',
 detail:'Molar specific heat at constant volume: Cv = (ΔQ/ΔT)ᵥ = (ΔU/ΔT)ᵥ. At constant pressure: Cp = (ΔQ/ΔT)ₚ = (ΔU/ΔT)ₚ + P(ΔV/ΔT)ₚ. For an ideal gas U depends only on T, so (ΔU/ΔT)ₚ = (ΔU/ΔT)ᵥ, and from PV = RT for one mole, P(ΔV/ΔT)ₚ = R. Hence Cp − Cv = R (Mayer\'s relation). The ratio γ = Cp/Cv. For a monatomic gas Cv = 3R/2, Cp = 5R/2, γ = 5/3; for a diatomic gas (rigid) Cv = 5R/2, Cp = 7R/2, γ = 7/5.',
 real:'This is why air in a sealed tyre warms faster in the sun than air that can expand freely.',
 apply:'For a diatomic gas, find Cp and Cv in J mol⁻¹ K⁻¹ (R = 8.31).',
 see:{w:520,h:240,f:[
  ['Constant volume: all heat → internal energy (Cv).',pill(140,60,'Cv','#eef1fa',80)],
  ['Constant pressure: heat → internal energy + work (Cp).',pill(380,60,'Cp = Cv + R','#fbece6',140)],
  ['γ = Cp/Cv: 5/3 (monatomic), 7/5 (diatomic).',T(260,170,'Cp − Cv = R','font-size="16" font-weight="700"')]]},
 seeNote:'Compare gases in the P–V lab.',
 do:{title:'Mayer table',mat:'Notebook',steps:['Write Cv and Cp for monatomic and diatomic gases.','Subtract each pair.','Compute γ.'],obs:'Each difference is R; γ = 1.67 and 1.4.',why:'Mayer\'s relation.',lab:false},
 memo:'"Cp is bigger: Pushing costs extra."',
 miscon:['"Cp = Cv for gases." Cp is larger by R.'],
 terms:['Cv','Cp',"Mayer's relation",'γ'],
 q:{q:'For an ideal gas, Cp − Cv equals:',o:['0','R','R/2','γR'],a:1,why:"Mayer's relation."},
 exam:"Mayer's relation derivation is a 3-mark question."},
{id:'h4',num:'11.8–11.9',title:'Thermodynamic processes',
 intro:'Push a piston slowly in a water bath, or quickly in an insulated cylinder. Same squeeze, different result.',
 obj:'Describe quasi-static, isothermal, adiabatic, isochoric, isobaric and cyclic processes, and calculate work in each.',
 prior:'First law (11.5); specific heats (11.6).',
 simple:'Isothermal: temperature constant (PV = constant); work = nRT ln(V₂/V₁) and ΔU = 0. Adiabatic: no heat exchanged (PVᵞ = constant); the gas cools when it expands. Isochoric: volume constant; no work. Isobaric: pressure constant; work = PΔV. Cyclic: returns to the start, so ΔU = 0.',
 detail:'A quasi-static process is infinitely slow, so the system stays in equilibrium with the surroundings at every stage. Isothermal (T constant): PV = constant; for an ideal gas ΔU = 0, so ΔQ = ΔW = μRT ln(V₂/V₁). In expansion the gas absorbs heat and does work. Adiabatic (ΔQ = 0): PVᵞ = constant; W = μR(T₁ − T₂)/(γ − 1). If the gas does work (expands), T falls; if work is done on it (compressed), T rises. The adiabatic curve is steeper than the isothermal curve on a P–V diagram. Isochoric (V constant): W = 0; heat changes only internal energy. Isobaric (P constant): W = P(V₂ − V₁) = μR(T₂ − T₁). Cyclic: the system returns to its initial state; ΔU = 0, so total heat absorbed = work done by the system = area enclosed by the loop.',
 real:'Air rushing out of a tyre valve feels cold: it expands rapidly, almost adiabatically, and cools.',
 apply:'One mole of an ideal gas at 300 K expands isothermally to twice its volume. Find the work done (R = 8.31).',
 see:{w:520,h:240,f:[
  ['Isothermal: PV = constant (a gentle curve).',(()=>{let d='';for(let v=1;v<=4;v+=0.05)d+=(d?'L':'M')+(60+v*90)+' '+(220-160/v);return `<path d="${d}" fill="none" stroke="${BL}" stroke-width="3"/>`})()],
  ['Adiabatic: PVᵞ = constant (steeper).',(()=>{let d='';for(let v=1;v<=4;v+=0.05)d+=(d?'L':'M')+(60+v*90)+' '+(220-160/Math.pow(v,1.4));return `<path d="${d}" fill="none" stroke="${OR}" stroke-width="3"/>`})()],
  ['Isobaric: horizontal line. Isochoric: vertical line.',`<line x1="150" y1="40" x2="420" y2="40" stroke="${GR}" stroke-width="3"/><line x1="150" y1="40" x2="150" y2="200" stroke="${GR}" stroke-width="3" stroke-dasharray="5 4"/>`]]},
 seeNote:'Try each process in the P–V lab.',
 do:{title:'Hot and cold syringe',mat:'A plastic syringe with its tip sealed, a thin thermometer strip (optional)',steps:['Push the plunger in quickly; feel the barrel.','Pull it out quickly; feel again.'],obs:'Fast compression warms it slightly; fast expansion cools it.',why:'Nearly adiabatic: work changes internal energy.',lab:false},
 memo:'"Iso-T: T fixed. Adi: no heat. Iso-choric: V fixed. Iso-baric: P fixed."',
 miscon:['"In an isothermal process no heat is exchanged." Heat is exchanged; temperature stays the same.','"In an adiabatic process temperature stays constant." It changes.'],
 terms:['Quasi-static','Isothermal','Adiabatic','Isochoric','Isobaric','Cyclic process'],
 q:{q:'On a P–V diagram, compared to an isothermal curve, an adiabatic curve is:',o:['Less steep','Steeper','The same','Horizontal'],a:1,why:'PVᵞ with γ > 1.'},
 exam:'Work in isothermal and adiabatic processes carries 3–5 marks.'},
{id:'h5',num:'11.10',title:'Heat engines and refrigerators',
 intro:'A car engine turns burning fuel into motion. Why can\'t it turn all of the heat into work?',
 obj:'Describe a heat engine and a refrigerator, and calculate efficiency and coefficient of performance.',
 prior:'Cyclic processes (11.9).',
 simple:'A heat engine takes heat Q₁ from a hot reservoir, does work W, and gives out heat Q₂ to a cold reservoir: efficiency η = W/Q₁ = 1 − Q₂/Q₁. A refrigerator works in reverse: it uses work W to take heat Q₂ from a cold place and release Q₁ to a hot place; its coefficient of performance is Q₂/W.',
 detail:'Heat engine: a device by which a system is made to undergo a cyclic process that results in conversion of heat into work. It has (1) a working substance, (2) a hot reservoir at T₁ that supplies heat Q₁, and (3) a cold reservoir at T₂ that receives heat Q₂. Work done per cycle: W = Q₁ − Q₂. Efficiency η = W/Q₁ = 1 − Q₂/Q₁; η < 1 always, because Q₂ is never zero. Examples: steam engine (external combustion), petrol and diesel engines (internal combustion). Refrigerator (heat pump): the working substance extracts Q₂ from the cold reservoir at T₂, external work W is done on it, and heat Q₁ is released to the hot reservoir at T₁. Coefficient of performance α = Q₂/W = Q₂/(Q₁ − Q₂). α can be greater than 1, but it cannot be infinite.',
 real:'A refrigerator\'s back coils feel warm: that is the heat Q₁ it pumps out of the food compartment, plus the work done by the compressor.',
 apply:'An engine takes 1000 J from the hot source and rejects 600 J. Find the work done and the efficiency.',
 see:{w:520,h:240,f:[
  ['Hot reservoir T₁ gives heat Q₁ to the engine.',pill(260,40,'Hot reservoir T₁','#fbece6',170)+`<line x1="260" y1="58" x2="260" y2="95" stroke="${OR}" stroke-width="3"/>`],
  ['The engine does work W = Q₁ − Q₂.',`<circle cx="260" cy="120" r="26" fill="#eef1fa" stroke="${BL}"/>`+T(260,125,'engine','font-size="12"')+`<line x1="288" y1="120" x2="390" y2="120" stroke="${GR}" stroke-width="3"/>`+T(420,124,'W','font-size="15" font-weight="700"')],
  ['It rejects Q₂ to the cold reservoir T₂. η = 1 − Q₂/Q₁.',`<line x1="260" y1="146" x2="260" y2="185" stroke="${BL}" stroke-width="3"/>`+pill(260,205,'Cold reservoir T₂','#eef1fa',170)]]},
 seeNote:'A refrigerator runs the same diagram backwards.',
 do:{title:'Fridge audit',mat:'A home refrigerator (observe only)',steps:['Feel the air near the back or bottom grille after it has run for a while.','Compare with room temperature.','Explain where that heat came from.'],obs:'The air near the coils is warm.',why:'Heat Q₁ = Q₂ + W is released to the room.',lab:false},
 memo:'"Engine: heat in, work out, some heat wasted. Fridge: work in, heat pumped uphill."',
 miscon:['"A perfect engine could have 100% efficiency." Q₂ can never be zero.','"A fridge destroys heat." It moves heat to the room.'],
 terms:['Heat engine','Working substance','Reservoirs','Efficiency','Refrigerator','Coefficient of performance'],
 q:{q:'An engine absorbs 500 J and rejects 300 J per cycle. Its efficiency is:',o:['60%','40%','30%','160%'],a:1,why:'W = 200 J; 200/500.'},
 exam:'Efficiency and COP numericals are 2-mark questions.'},
{id:'h6',num:'11.11–11.13',title:'The second law, reversibility and the Carnot engine',
 intro:'Heat always flows from hot to cold on its own. And no engine, however well built, can beat a limit set only by two temperatures.',
 obj:'State the Kelvin–Planck and Clausius statements, distinguish reversible and irreversible processes, and use η = 1 − T₂/T₁ for a Carnot engine.',
 prior:'Heat engines (11.10).',
 simple:'Kelvin–Planck: no engine can turn all the heat it absorbs into work. Clausius: heat cannot flow from a colder body to a hotter body by itself. Real processes are irreversible. The best possible engine between two temperatures is the reversible Carnot engine, with efficiency 1 − T₂/T₁ (in kelvin).',
 detail:'Second law of thermodynamics. Kelvin–Planck statement: no process is possible whose sole result is the absorption of heat from a reservoir and the complete conversion of the heat into work. Clausius statement: no process is possible whose sole result is the transfer of heat from a colder object to a hotter object. The two statements are equivalent. Reversible process: one that can be reversed so that both system and surroundings return to their original states with no other change anywhere; it must be quasi-static and free of dissipative effects (friction, viscosity). Spontaneous processes in nature (free expansion, heat flow down a temperature difference) are irreversible. Carnot engine: a reversible engine operating between two temperatures T₁ (source) and T₂ (sink), using a cycle of two isothermal and two adiabatic processes. Its efficiency η = 1 − T₂/T₁. Carnot\'s theorem: (a) no engine working between two given temperatures can have efficiency greater than that of a Carnot engine; (b) the efficiency of the Carnot engine is independent of the nature of the working substance.',
 real:'Power stations raise steam temperature as high as their materials allow, because a hotter source means a higher maximum efficiency.',
 apply:'Find the maximum efficiency of an engine working between 500 K and 300 K.',
 see:{w:520,h:240,f:[
  ['Kelvin–Planck: no engine turns all heat into work.',pill(260,50,'Q₂ ≠ 0 always','#fbece6',150)],
  ['Clausius: heat does not flow cold → hot by itself.',pill(260,120,'cold ↛ hot (on its own)','#eef1fa',200)],
  ['Carnot: η = 1 − T₂/T₁ (temperatures in kelvin).',T(260,195,'η = 1 − T₂/T₁','font-size="16" font-weight="700"')]]},
 seeNote:'The Carnot cycle: isothermal, adiabatic, isothermal, adiabatic.',
 do:{title:'Irreversibility hunt',mat:'Notebook',steps:['List five everyday processes (ice melting in tea, a dropped glass breaking, ink spreading in water…).','Could each run backwards on its own?'],obs:'None reverse by themselves.',why:'Natural processes are irreversible.',lab:false},
 memo:'"Kelvin: no free lunch. Clausius: heat rolls downhill."',
 miscon:['"Carnot efficiency can be 100% if built well." Only if T₂ = 0 K, which is impossible.','"Use °C in η = 1 − T₂/T₁." Temperatures must be in kelvin.'],
 terms:['Second law','Kelvin–Planck statement','Clausius statement','Reversible process','Irreversible process','Carnot engine',"Carnot's theorem"],
 q:{q:'A Carnot engine works between 527 °C and 127 °C. Its efficiency is:',o:['25%','50%','75%','76%'],a:1,why:'1 − 400/800.'},
 exam:'Second-law statements and Carnot efficiency are frequent 2–3 mark questions.'}
];

const CARDS=[['Zeroth law','A ⇄ C and B ⇄ C ⇒ A ⇄ B; defines temperature.'],['Extensive / intensive','Depends on size (V, m, U) / does not (P, T, density).'],['Internal energy','State variable; depends only on state.'],['First law','ΔQ = ΔU + ΔW.'],['Work by gas','ΔW = PΔV = area under P–V curve.'],["Mayer's relation",'Cp − Cv = R.'],['γ','Monatomic 5/3; diatomic 7/5.'],['Isothermal','PV = const; ΔU = 0; W = μRT ln(V₂/V₁).'],['Adiabatic','PVᵞ = const; Q = 0; W = μR(T₁ − T₂)/(γ − 1).'],['Isochoric','W = 0; Q = ΔU.'],['Isobaric','W = PΔV.'],['Cyclic','ΔU = 0; net work = enclosed area.'],['Heat engine','η = W/Q₁ = 1 − Q₂/Q₁.'],['Refrigerator','COP α = Q₂/W.'],['Kelvin–Planck','No complete conversion of heat into work.'],['Clausius','Heat does not flow cold → hot by itself.'],['Carnot','η = 1 − T₂/T₁; maximum possible.']];

const Q=[
 {lv:1,q:'Which law leads to the concept of temperature?',o:['Zeroth','First','Second','Third'],a:0,w:'Zeroth law.'},
 {lv:1,q:'In an isochoric process, the work done is:',o:['Maximum','Zero','PΔV','Negative'],a:1,w:'No volume change.'},
 {lv:1,q:'True or false: the efficiency of a heat engine can be 1.',o:['True','False'],a:1,w:'Kelvin–Planck.'},
 {lv:1,q:'For a monatomic ideal gas, γ is:',o:['1.4','5/3','4/3','1'],a:1,w:'Cp/Cv = (5/2)/(3/2).'},
 {lv:2,q:'In an isothermal expansion of an ideal gas:',o:['ΔU = 0, gas absorbs heat','ΔU > 0','Q = 0','Temperature rises'],a:0,w:'U depends only on T.'},
 {lv:2,q:'Air escaping from a burst tyre feels cool because:',o:['It is isothermal','Rapid adiabatic expansion cools it','It loses mass','It absorbs heat'],a:1,w:'Gas does work, ΔU < 0.'},
 {lv:2,q:'An engine takes 1000 J and rejects 600 J. Efficiency:',o:['60%','40%','166%','4%'],a:1,w:'W = 400 J.'},
 {lv:3,q:'Max efficiency between 500 K and 300 K:',o:['40%','60%','25%','50%'],a:0,w:'1 − 300/500.'},
 {lv:3,q:'1 mol of ideal gas doubles its volume isothermally at 300 K. Work done ≈ (R = 8.31, ln 2 = 0.693):',o:['1728 J','2493 J','831 J','3456 J'],a:0,w:'8.31 × 300 × 0.693 ≈ 1728 J.'},
 {lv:3,q:'A refrigerator removes 300 J from inside using 100 J of work. COP:',o:['0.33','3','4','2'],a:1,w:'Q₂/W.'},
 {lv:4,q:'Assertion (A): Cp > Cv for a gas. Reason (R): At constant pressure some heat is used to do work in expansion.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'Mayer.'},
 {lv:4,q:'In a cyclic process, the net heat absorbed equals:',o:['Zero','Change in internal energy','Net work done (area of loop)','Q₂'],a:2,w:'ΔU = 0 in a cycle.'},
 {lv:5,open:true,m:3,q:'Derive Mayer\'s relation Cp − Cv = R for one mole of an ideal gas.',ans:['Cv = (ΔU/ΔT)ᵥ; Cp = (ΔU/ΔT)ₚ + P(ΔV/ΔT)ₚ (1).','For an ideal gas U depends only on T, so the ΔU terms are equal (1).','PV = RT gives P(ΔV/ΔT)ₚ = R, so Cp − Cv = R (1).']},
 {lv:5,open:true,m:3,q:'State the Kelvin–Planck and Clausius statements of the second law. Write the efficiency of a Carnot engine.',ans:['Kelvin–Planck statement (1).','Clausius statement (1).','η = 1 − T₂/T₁, independent of working substance (1).']},
 {lv:5,open:true,m:5,q:'Compare isothermal and adiabatic processes: definition, equation, work done, change in internal energy and slope on a P–V diagram.',ans:['Isothermal: T constant; adiabatic: Q = 0 (1).','PV = const vs PVᵞ = const (1).','W = μRT ln(V₂/V₁) vs μR(T₁ − T₂)/(γ − 1) (1).','ΔU = 0 vs ΔU = −W (1).','Adiabatic curve steeper (1).']}
];

const ONEMIN=['Zeroth law → temperature; state variables extensive/intensive.','First law: ΔQ = ΔU + ΔW; W = area under P–V.','Cp − Cv = R; γ = 5/3 (monatomic), 7/5 (diatomic).','Isothermal PV = const, ΔU = 0, W = μRT ln(V₂/V₁).','Adiabatic PVᵞ = const, Q = 0, steeper curve.','Isochoric W = 0; isobaric W = PΔV; cyclic ΔU = 0.','Engine η = 1 − Q₂/Q₁; refrigerator COP = Q₂/W.','Kelvin–Planck and Clausius statements.','Carnot η = 1 − T₂/T₁ (kelvin) — the maximum.'];
const KEYS=[['zeroth law',/zeroth/i],['internal energy',/internal/i],['first law ΔQ = ΔU + ΔW',/first law|ΔQ|ΔU/i],['PΔV / area',/pΔv|p∆v|area/i],['Cp − Cv = R',/cp|cv|mayer/i],['isothermal',/isotherm/i],['adiabatic',/adiabat/i],['efficiency',/efficien|η/i],['refrigerator / COP',/refrigerat|cop|coefficient of perf/i],['second law',/second law|kelvin|clausius/i],['Carnot',/carnot/i]];

/* ---------- lab ---------- */
function labDraw(){const proc=$('#pP').value,g=+$('#pG').value,r=+$('#pR').value,T1=300,P1=1e5,V1=R*T1/P1,Cv=R/(g-1),Cp=Cv+R;
 $('#pRl').firstChild.textContent=proc==='cho'?'Final pressure ÷ initial pressure':'Final volume ÷ initial volume';
 let V2=V1,P2=P1,T2=T1,W=0,curve=[];const n=60;
 if(proc==='iso'){V2=r*V1;P2=P1/r;T2=T1;W=R*T1*Math.log(r);for(let i=0;i<=n;i++){const v=V1+(V2-V1)*i/n;curve.push([v,R*T1/v])}}
 if(proc==='adi'){V2=r*V1;T2=T1*Math.pow(V1/V2,g-1);P2=R*T2/V2;W=R*(T1-T2)/(g-1);for(let i=0;i<=n;i++){const v=V1+(V2-V1)*i/n;curve.push([v,P1*Math.pow(V1/v,g)])}}
 if(proc==='bar'){V2=r*V1;T2=T1*r;W=P1*(V2-V1);curve=[[V1,P1],[V2,P1]]}
 if(proc==='cho'){P2=r*P1;T2=T1*r;W=0;curve=[[V1,P1],[V1,P2]]}
 const dU=Cv*(T2-T1),Q=dU+W;const X=v=>60+(v*1000)/70*440,Y=p=>300-(p/1000)/350*270;
 let s=`<line x1="60" y1="300" x2="505" y2="300" stroke="${ink}" stroke-width="1.5"/><line x1="60" y1="300" x2="60" y2="20" stroke="${ink}" stroke-width="1.5"/>`+T(470,325,'V (litres)','font-size="12"')+T(40,16,'P (kPa)','font-size="12"');
 for(let v=0;v<=70;v+=10)s+=T(X(v/1000),316,String(v),'font-size="11"');for(let p=0;p<=350;p+=50)s+=T(42,Y(p*1000)+4,String(p),'font-size="11"');
 for(const[gg,col]of [[1,'#b4b2a9']]){let d='';for(let v=8e-3;v<=0.07;v+=1e-3)d+=(d?'L':'M')+X(v)+' '+Y(R*T1/v);s+=`<path d="${d}" fill="none" stroke="${col}" stroke-dasharray="4 4"/>`+T(X(0.068),Y(R*T1/0.068)-8,'300 K isotherm','font-size="11"')}
 if(proc!=='cho'){const area=`M${X(curve[0][0])} 300 `+curve.map(c=>`L${X(c[0])} ${Y(c[1])}`).join(' ')+` L${X(curve[curve.length-1][0])} 300 Z`;s+=`<path d="${area}" fill="${W>=0?GR:OR}" opacity=".18"/>`}
 s+=`<path d="${curve.map((c,i)=>(i?'L':'M')+X(c[0])+' '+Y(c[1])).join(' ')}" fill="none" stroke="${proc==='adi'?OR:BL}" stroke-width="3.5"/><circle cx="${X(V1)}" cy="${Y(P1)}" r="6" fill="${BL}"/>`+T(X(V1)-14,Y(P1)-10,'1','font-size="13" font-weight="700"')+`<circle cx="${X(V2)}" cy="${Y(P2)}" r="6" fill="${OR}"/>`+T(X(V2)+12,Y(P2)-10,'2','font-size="13" font-weight="700"');
 $('#pv').innerHTML=s;const f=x=>Math.round(x).toLocaleString('en-IN');
 $('#pOut').innerHTML=`<p>State 1: ${(V1*1000).toFixed(1)} L, 100 kPa, 300 K → State 2: ${(V2*1000).toFixed(1)} L, ${(P2/1000).toFixed(1)} kPa, ${T2.toFixed(1)} K</p><p><b>Work by gas W</b> = ${f(W)} J ${W<0?'(work done on the gas)':''}</p><p><b>ΔU</b> = Cv ΔT = ${f(dU)} J</p><p><b>Heat Q</b> = ΔU + W = ${f(Q)} J</p><p class="note">${{iso:'Isothermal: ΔU = 0, so all heat absorbed becomes work.',adi:'Adiabatic: Q = 0, so work comes out of internal energy and the gas cools as it expands.',bar:'Isobaric: heat raises internal energy and does work PΔV.',cho:'Isochoric: no work; all heat changes internal energy.'}[proc]}</p>`}
function labInit(){}
function labShow(){labDraw()}
function labClick(b){return false}
function labChange(t){if(['pP','pG','pR'].includes(t.id)){labDraw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
