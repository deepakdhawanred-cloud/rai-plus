/* Rai Plus content pack: Class 11 Physics, Chapter 10 – Thermal Properties of Matter */
RP.register({key:'11phy10',cls:'11',subject:'Physics',ch:'10',title:"Thermal Properties of Matter",color:'#9a3d1f',
crumb:"HBSE Class 11 Physics · Unit: Properties of Bulk Matter · Taught in November",h1:"Chapter 10: Thermal Properties of Matter",sub:"Temperature, expansion, specific heat, latent heat and the three ways heat travels.",heroLabel:"A heating curve of ice turning into water and steam",labName:"Heating curve lab",
theme:"\n:root{--g:light-dark(#9a3d1f,#f0a58a);--g2:light-dark(#fbeee8,#2a140c);--line:light-dark(#f0d6cb,#4a2a1e);--bg:light-dark(#ffffff,#170d09);--card:light-dark(#ffffff,#1f120c);\n--ink:light-dark(#2a140c,#f6ebe6);--mute:light-dark(#6e5146,#caaa9d);--y:light-dark(#2e6f8a,#8fc4dc);--y2:light-dark(#e8f2f6,#0f1f26);--hd:#6a2812}\n",
labHTML:`  <h2>Heating curve lab</h2>
  <p>Heat a block of ice at a steady rate and watch its temperature. Where does the heat go when the temperature stops rising?</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="hc" viewBox="0 0 520 330" role="img" aria-label="Temperature against heat supplied" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mass of ice (kg)<select id="hM"><option>0.1</option><option selected>0.5</option><option>1</option></select></label><label>Heat supplied so far (%)<input type="range" id="hQ" min="0" max="100" step="1" value="40"></label></div>
  <div class="box y" id="hOut" aria-live="polite"></div>
  <p class="note">Values used: c(ice) ≈ 2100, c(water) = 4186, c(steam) ≈ 2010 J kg⁻¹ K⁻¹; L(fusion) = 3.33 × 10⁵ J kg⁻¹, L(vaporisation) = 22.6 × 10⁵ J kg⁻¹. Start at −20 °C, end at 120 °C.</p></div></div>
`,
build:function(){

const ACC='#9a3d1f',LABNAME='Heating curve lab',MIND_CENTER='Heat';
const RD='#9a3d1f',BL='#2e6f8a',ink='currentColor';
const pill=(x,y,t,c='#fbeee8',w=160)=>`<rect x="${x-w/2}" y="${y-17}" width="${w}" height="34" rx="8" fill="${c}" stroke="${RD}"/>`+T(x,y+5,t,'font-size="13"');
function heroDraw(){return `<path d="M70 110 L100 80 L150 80 L170 40 L250 40 L280 15" fill="none" stroke="#fff" stroke-width="3"/>`+T(125,72,'melting','font-size="11" fill="#fff"')+T(210,32,'boiling','font-size="11" fill="#fff"')}
const HERO=heroDraw;
const MIND=[['Temperature scales',90,50],['Thermal expansion',430,50],['Specific heat and calorimetry',90,150],['Latent heat',430,150],['Conduction, convection, radiation',90,250],["Newton's law of cooling",430,250]];

const C=[
{id:'w1',num:'10.2–10.3',title:'Temperature, heat and temperature scales',
 intro:'A cup of tea cools on the table while a glass of cold water warms up. Which way does heat always flow?',
 obj:'Distinguish heat from temperature and convert between the Celsius, Fahrenheit and Kelvin scales.',
 prior:'Heat and temperature (Class 7).',
 simple:'Temperature tells how hot or cold a body is. Heat is energy that flows from a hotter body to a colder one because of the temperature difference. Thermometers measure temperature using a property that changes with it, like the expansion of mercury. On the Celsius scale water freezes at 0 °C and boils at 100 °C; on the Fahrenheit scale at 32 °F and 212 °F.',
 detail:'Heat is the form of energy transferred between two (or more) systems, or a system and its surroundings, by virtue of temperature difference. The SI unit of heat is the joule (J); of temperature, the kelvin (K), with °C commonly used. Liquid-in-glass thermometers use the expansion of mercury or alcohol. Two fixed points: the ice point and the steam point of water at standard pressure: 0 °C and 100 °C on the Celsius scale; 32 °F and 212 °F on the Fahrenheit scale. Conversion: (t_F − 32)/180 = t_C/100, i.e. t_F = (9/5)t_C + 32. Absolute (Kelvin) scale: T = t_C + 273.15; absolute zero, −273.15 °C, is the lowest temperature, derived from the behaviour of gases.',
 real:'A doctor\'s normal body temperature of 98.6 °F is 37 °C.',
 apply:'Convert 40 °C to Fahrenheit and to kelvin.',
 see:{w:520,h:240,f:[
  ['Celsius: ice point 0 °C, steam point 100 °C.',`<rect x="110" y="30" width="20" height="180" rx="10" fill="none" stroke="${ink}"/>`+T(160,40,'100 °C','font-size="12" text-anchor="start"')+T(160,205,'0 °C','font-size="12" text-anchor="start"')],
  ['Fahrenheit: 32 °F and 212 °F for the same points.',`<rect x="310" y="30" width="20" height="180" rx="10" fill="none" stroke="${ink}"/>`+T(360,40,'212 °F','font-size="12" text-anchor="start"')+T(360,205,'32 °F','font-size="12" text-anchor="start"')],
  ['t_F = (9/5) t_C + 32;  T(K) = t_C + 273.15.',T(260,232,'t_F = 9/5 t_C + 32','font-size="14" font-weight="700"')]]},
 seeNote:'100 Celsius degrees = 180 Fahrenheit degrees.',
 do:{title:'Two-thermometer check',mat:'A clinical thermometer (°F) and a lab thermometer (°C), warm water',steps:['Measure the same warm water with both.','Convert the °C reading to °F.','Compare.'],obs:'The converted value matches the °F reading.',why:'Both scales use the same fixed points with different numbers.',lab:true},
 memo:'"Multiply by 9, divide by 5, add 32."',
 miscon:['"Heat and temperature are the same." Temperature is a state; heat is energy in transit.','"0 K = 0 °C." 0 K = −273.15 °C.'],
 terms:['Heat','Temperature','Fixed points','Celsius','Fahrenheit','Absolute zero','Kelvin'],
 q:{q:'The temperature at which Celsius and Fahrenheit readings are equal is:',o:['0°','−40°','40°','100°'],a:1,why:'t = 9t/5 + 32 gives t = −40.'},
 exam:'Scale conversion is a 1–2 mark question.'},
{id:'w2',num:'10.5',title:'Thermal expansion and the anomalous expansion of water',
 intro:'Why are gaps left between railway rails, and why does a pond freeze from the top down?',
 obj:'Define coefficients of linear, area and volume expansion, relate them, and explain the anomalous expansion of water.',
 prior:'Temperature (10.2).',
 simple:'Most substances expand when heated. The fractional change in length per degree is α (linear expansion); in area, 2α; in volume, γ ≈ 3α. Water is unusual: between 0 °C and 4 °C it contracts on heating, so it is densest at 4 °C.',
 detail:'Linear expansion: Δl/l = α_l ΔT. Area: ΔA/A = (2α_l)ΔT. Volume: ΔV/V = α_V ΔT, and for a solid α_V = 3α_l. Metals expand more than glass; liquids expand more than solids; gases expand most (for an ideal gas at constant pressure, α_V = 1/T). Applications: gaps in rails and bridges, loose-fitting telephone wires, bimetallic strips in thermostats. Anomalous expansion of water: water contracts on heating from 0 °C to 4 °C, so its density is maximum at 4 °C. When a lake cools, water at the surface cools, becomes denser and sinks until all the water is at 4 °C; further cooling makes surface water less dense, so it stays on top and freezes. Ice forms on the surface and insulates the water below, so aquatic life survives.',
 real:'Steel railway tracks are laid with small expansion gaps; in summer heat they close up.',
 apply:'A 10 m steel rail (α = 1.2 × 10⁻⁵ K⁻¹) warms by 30 K. By how much does it lengthen?',
 see:{w:520,h:240,f:[
  ['A rod of length l is heated.',`<rect x="60" y="60" width="300" height="20" fill="#b4b2a9"/>`],
  ['It lengthens by Δl = α l ΔT.',`<rect x="60" y="110" width="340" height="20" fill="#d85a30" opacity=".7"/>`+T(440,125,'+Δl','font-size="14" text-anchor="start"')],
  ['Water is densest at 4 °C: lakes freeze from the top.',`<rect x="140" y="160" width="240" height="70" fill="#85b7eb" opacity=".5"/><rect x="140" y="160" width="240" height="12" fill="#e6f1fb" stroke="#185fa5"/>`+T(260,215,'4 °C at the bottom','font-size="12"')]]},
 seeNote:'See the density of water vs temperature in the Visuals tab.',
 do:{title:'Ball and ring',mat:'Ball-and-ring apparatus, burner',steps:['Check that the ball passes through the ring.','Heat the ball and try again.','Let it cool and try once more.'],obs:'The hot ball does not pass; after cooling it does.',why:'Heating expands the metal ball.',lab:true},
 memo:'"Line α, area 2α, volume 3α."',
 miscon:['"All liquids expand on heating at all temperatures." Water contracts from 0 to 4 °C.','"Ice is denser than water." Ice floats because it is less dense.'],
 terms:['Coefficient of linear expansion','Area expansion','Volume expansion','Anomalous expansion','Bimetallic strip'],
 q:{q:'For a solid, the coefficients of volume and linear expansion are related by:',o:['γ = α','γ = 2α','γ = 3α','γ = α/3'],a:2,why:'Three dimensions.'},
 exam:'Expansion numericals and the anomalous behaviour of water are 2–3 mark questions.'},
{id:'w3',num:'10.6–10.7',title:'Specific heat capacity and calorimetry',
 intro:'On a hot afternoon the sand on a beach burns your feet, but the sea water is cool. Why?',
 obj:'Define heat capacity, specific heat capacity and molar specific heat, and apply the principle of calorimetry.',
 prior:'Heat (10.2).',
 simple:'Different substances need different amounts of heat to warm up. Specific heat capacity s is the heat needed to raise 1 kg of a substance by 1 K: ΔQ = m s ΔT. Water has a very high specific heat (4186 J kg⁻¹ K⁻¹), so it warms and cools slowly. In a calorimeter, heat lost by hot bodies = heat gained by cold ones.',
 detail:'Heat capacity S = ΔQ/ΔT. Specific heat capacity s = (1/m)(ΔQ/ΔT), unit J kg⁻¹ K⁻¹; it depends on the nature of the substance and its temperature. Molar specific heat C = (1/μ)(ΔQ/ΔT), unit J mol⁻¹ K⁻¹. For gases, Cp (constant pressure) and Cv (constant volume) differ. Water has the highest specific heat of common substances, which is why it is used as a coolant in car radiators and as a heater in hot-water bags, and why coastal regions have moderate climates. Calorimetry: in an isolated system, heat lost = heat gained (principle of calorimetry). A calorimeter is a copper or aluminium vessel with a stirrer, kept in an insulated jacket. Method of mixtures: m₁s₁(T₁ − T) = m₂s₂(T − T₂).',
 real:'A car radiator uses water because it can carry away a lot of heat with only a small rise in temperature.',
 apply:'0.2 kg of a metal at 150 °C is dropped into 0.15 kg of water at 27 °C in a calorimeter (heat capacity 0.025 kg water equivalent). Final temperature 40 °C. Find the metal\'s specific heat.',
 see:{w:520,h:240,f:[
  ['Same heat, same mass: sand heats up far more than water.',pill(140,60,'sand: big ΔT','#fbeee8',150)+pill(380,60,'water: small ΔT','#e8f2f6',160)],
  ['ΔQ = m s ΔT',T(260,130,'ΔQ = m s ΔT','font-size="16" font-weight="700"')],
  ['Calorimetry: heat lost by hot = heat gained by cold.',T(260,200,'m₁s₁(T₁ − T) = m₂s₂(T − T₂)','font-size="14"')]]},
 seeNote:'Mix hot and cold in the Visuals tab.',
 do:{title:'Method of mixtures',mat:'Calorimeter with stirrer, thermometer, water, a metal block, beaker of boiling water',steps:['Weigh the calorimeter with cold water; note its temperature.','Heat the metal in boiling water; transfer it quickly.','Stir and note the final steady temperature.','Use heat lost = heat gained to find the metal\'s specific heat.'],obs:'The result is close to the textbook value.',why:'Principle of calorimetry. Safety: handle boiling water with tongs.',lab:true},
 memo:'"MS-Delta-T: Q = m s ΔT."',
 miscon:['"Heavier objects always have more specific heat." Specific heat is per kilogram.','"Heat lost = heat gained even with an open container." Only in an isolated system.'],
 terms:['Heat capacity','Specific heat capacity','Molar specific heat','Calorimeter','Principle of calorimetry'],
 q:{q:'Water is used in car radiators because it has a high:',o:['Density','Specific heat capacity','Boiling point only','Thermal conductivity'],a:1,why:'It absorbs much heat for a small temperature rise.'},
 exam:'Calorimetry numericals appear every year (3 marks).'},
{id:'w4',num:'10.8',title:'Change of state and latent heat',
 intro:'Keep heating a pot of water at 100 °C. The flame is on, but the thermometer stays still. Where is the heat going?',
 obj:'Describe melting, boiling and sublimation, explain the effect of pressure, and use Q = mL.',
 prior:'Specific heat (10.6).',
 simple:'While a substance melts or boils, its temperature stays constant even though heat is supplied. That heat, called latent heat, is used to change the state, not to raise the temperature. Q = mL. For water, the latent heat of fusion is 3.33 × 10⁵ J/kg and of vaporisation 22.6 × 10⁵ J/kg.',
 detail:'Melting: solid to liquid at the melting point; the reverse is fusion. Both phases coexist in thermal equilibrium at the melting point. The melting point of a substance at standard atmospheric pressure is its normal melting point. Regelation: ice melts under pressure and refreezes when the pressure is removed (a wire passes through an ice block). Boiling: liquid to vapour at the boiling point; boiling point increases with pressure (pressure cooker) and decreases with altitude (cooking is harder in hills). Sublimation: solid directly to vapour, e.g. dry ice and iodine. Latent heat: the amount of heat per unit mass transferred during a change of state at constant temperature and pressure: Q = mL. L_f (water) = 3.33 × 10⁵ J kg⁻¹; L_v (water) = 22.6 × 10⁵ J kg⁻¹. Steam at 100 °C causes more severe burns than water at 100 °C because it gives up an extra 22.6 × 10⁵ J kg⁻¹ when it condenses. A temperature–time (heating) curve has flat parts during melting and boiling. The triple point of water, where solid, liquid and vapour coexist, is 273.16 K at 6.11 × 10⁻³ Pa.',
 real:'Pressure cookers cook faster because the raised pressure raises water\'s boiling point above 100 °C.',
 apply:'How much heat is needed to turn 0.5 kg of ice at 0 °C into water at 0 °C?',
 see:{w:520,h:240,f:[
  ['Heating ice: temperature rises to 0 °C.',`<line x1="60" y1="200" x2="120" y2="170" stroke="${BL}" stroke-width="3"/>`],
  ['Melting: flat; heat supplied is latent heat of fusion.',`<line x1="120" y1="170" x2="200" y2="170" stroke="${RD}" stroke-width="3"/>`+T(160,160,'mL_f','font-size="12"')],
  ['Water warms to 100 °C, then boiling is flat again (much longer).',`<line x1="200" y1="170" x2="260" y2="70" stroke="${BL}" stroke-width="3"/><line x1="260" y1="70" x2="460" y2="70" stroke="${RD}" stroke-width="3"/>`+T(360,60,'mL_v','font-size="12"')]]},
 seeNote:'Run it yourself in the Heating curve lab.',
 do:{title:'Ice to steam curve',mat:'Crushed ice, beaker, burner, thermometer, stopwatch',steps:['Heat crushed ice steadily, stirring.','Read the temperature every 30 s until the water boils for a few minutes.','Plot temperature against time.'],obs:'Flat at 0 °C while melting and at about 100 °C while boiling.',why:'Latent heat changes state without changing temperature. Safety: careful with hot water and steam.',lab:true},
 memo:'"Flat line = latent heat at work."',
 miscon:['"Boiling water gets hotter if you heat it more." It stays at the boiling point.','"Water always boils at 100 °C." It depends on pressure.'],
 terms:['Melting point','Boiling point','Sublimation','Regelation','Latent heat of fusion','Latent heat of vaporisation','Triple point'],
 q:{q:'Steam at 100 °C causes worse burns than water at 100 °C because:',o:['Steam is hotter','Steam releases latent heat on condensing','Water has higher specific heat','Steam is denser'],a:1,why:'Extra 22.6 × 10⁵ J kg⁻¹.'},
 exam:'Heating curves and latent heat numericals carry 2–3 marks.'},
{id:'w5',num:'10.9',title:'Heat transfer: conduction, convection and radiation',
 intro:'A metal spoon in hot tea gets hot at the handle, warm air rises above a fire, and you feel the Sun across empty space. Three ways of moving heat.',
 obj:'Explain conduction (with H = KA(T_C − T_D)/L), convection (natural and forced) and radiation, with examples.',
 prior:'Temperature difference (10.2).',
 simple:'Conduction: heat passes through a material from particle to particle without the material moving. Convection: a heated fluid moves and carries heat with it. Radiation: heat travels as electromagnetic waves and needs no medium.',
 detail:'Conduction: the rate of heat flow H through a bar of length L and cross-section A with ends at T_C and T_D is H = KA(T_C − T_D)/L, where K is the thermal conductivity (W m⁻¹ K⁻¹). Metals have high K; wood, glass wool and air have low K. Cooking pots have copper bottoms; houses are insulated with materials of low K. Convection: actual motion of matter, possible only in fluids. Natural convection is caused by gravity: heated fluid expands, becomes less dense and rises. Examples: sea breeze (land heats faster by day; air above it rises; cooler sea air moves in), land breeze at night, and the trade winds. Forced convection: fluid made to move by a pump or fan (car radiators, the human circulatory system). Radiation: transfer by electromagnetic waves (thermal radiation), needs no medium; this is how the Sun\'s energy reaches Earth. Dark, rough surfaces are good absorbers and emitters; light, shiny ones are poor. Hence white clothes in summer and black-bottomed cooking utensils.',
 real:'A thermos flask cuts conduction and convection with a vacuum, and radiation with silvered walls.',
 apply:'Why does the cooling unit in a refrigerator sit at the top, while a room heater is placed low?',
 see:{w:520,h:240,f:[
  ['Conduction: heat passes along a metal rod.',`<rect x="40" y="50" width="200" height="16" fill="url(#gc)"/><defs><linearGradient id="gc"><stop offset="0" stop-color="#d85a30"/><stop offset="1" stop-color="#b4b2a9"/></linearGradient></defs>`+T(140,90,'H = KAΔT/L','font-size="12"')],
  ['Convection: heated fluid rises and cool fluid sinks.',`<path d="M330 180 C330 80 450 80 450 180 C450 220 330 220 330 180" fill="none" stroke="${RD}" stroke-width="2.5"/>`+T(390,130,'currents','font-size="12"')],
  ['Radiation: needs no medium, like sunlight crossing space.',[0,1,2].map(i=>`<path d="M60 ${170+i*18} q10 -8 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#e2a93b" stroke-width="2"/>`).join('')]]},
 seeNote:'Watch the sea breeze in the Visuals tab.',
 do:{title:'Wax pin race',mat:'Rods of copper, aluminium, iron and glass of the same size, wax, pins, a hot-water trough',steps:['Stick a pin with wax at the far end of each rod.','Dip the near ends in hot water together.','Note the order in which the pins drop.'],obs:'Copper first, glass last.',why:'Different thermal conductivities.',lab:true},
 memo:'"Conduction: pass it on. Convection: carry it. Radiation: beam it."',
 miscon:['"Convection happens in solids." Only in fluids.','"Radiation needs air." It travels through vacuum.'],
 terms:['Conduction','Thermal conductivity','Convection','Sea breeze','Radiation','Absorber, emitter'],
 q:{q:'The sea breeze during the day blows:',o:['From land to sea','From sea to land','Upwards only','There is no breeze by day'],a:1,why:'Land heats faster; air over land rises; cooler sea air moves in.'},
 exam:'Thermal conductivity numericals and convection examples are 2–3 mark questions.'},
{id:'w6',num:'10.10',title:"Newton's law of cooling",
 intro:'A very hot cup of tea cools quickly at first, then more and more slowly. Why?',
 obj:"State Newton's law of cooling and interpret the cooling curve.",
 prior:'Heat transfer (10.9).',
 simple:'The rate at which a body cools is proportional to the difference between its temperature and that of its surroundings, as long as the difference is small. So the hotter it is compared with the room, the faster it cools.',
 detail:'Newton\'s law of cooling: −dQ/dt = k(T₂ − T₁), where T₂ is the body\'s temperature, T₁ the surroundings\' temperature, and k a positive constant depending on the area and nature of the surface. For a body of mass m and specific heat s: dT₂/dt = −K(T₂ − T₁), with K = k/ms. Integrating: loge(T₂ − T₁) = −Kt + c, so a graph of loge(T₂ − T₁) against time is a straight line. The law holds for small temperature differences. Verification: heat water in a calorimeter to about 40 °C above room temperature, record the temperature every minute while it cools, and plot temperature against time (a curve) or loge(T₂ − T₁) against time (a straight line).',
 real:'A cup of tea left on the table cools from 90 °C to 80 °C faster than it later cools from 50 °C to 40 °C.',
 apply:'A body cools from 80 °C to 50 °C in 5 minutes. Calculate the time it takes to cool from 60 °C to 30 °C. Surroundings: 20 °C.',
 see:{w:520,h:240,f:[
  ['Hot body in a cooler room.',`<rect x="80" y="80" width="80" height="80" rx="10" fill="#d85a30" opacity=".7"/>`],
  ['It cools fast at first, then slowly: an exponential-like curve.',(()=>{let d='';for(let t=0;t<=300;t+=5){const T=40+130*Math.exp(-t/90);d+=(t?'L':'M')+(200+t)+' '+(230-T)}return `<path d="${d}" fill="none" stroke="${RD}" stroke-width="3"/>`})()],
  ['Rate of cooling ∝ (T₂ − T₁).',T(350,50,'−dQ/dt = k(T₂ − T₁)','font-size="14" font-weight="700"')]]},
 seeNote:'Straight line when plotting loge(T₂ − T₁) against time.',
 do:{title:'Cooling curve',mat:'Calorimeter, hot water, thermometer, stopwatch',steps:['Heat water to about 40 °C above room temperature.','Record its temperature every minute for 20 minutes.','Plot T against t and loge(T − T_room) against t.'],obs:'A curve, and a nearly straight line.',why:"Newton's law of cooling.",lab:true},
 memo:'"Bigger difference, faster cooling."',
 miscon:['"Cooling is at a constant rate." The rate falls as the difference shrinks.'],
 terms:["Newton's law of cooling",'Rate of cooling','Cooling curve'],
 q:{q:"According to Newton's law of cooling, the rate of cooling depends on:",o:['The body\'s temperature only','The temperature difference with surroundings','The room temperature only','The time elapsed only'],a:1,why:'Proportional to T₂ − T₁.'},
 exam:'Cooling numericals (using the average temperature) are common 3-mark questions.'}
];

const CARDS=[['Heat vs temperature','Heat: energy transferred due to ΔT. Temperature: degree of hotness.'],['°F from °C','t_F = (9/5)t_C + 32.'],['Kelvin','T = t_C + 273.15; absolute zero −273.15 °C.'],['Linear expansion','Δl/l = αΔT.'],['Volume expansion','γ ≈ 3α for solids.'],['Anomalous water','Densest at 4 °C; lakes freeze from the top.'],['Specific heat','Q = msΔT; water 4186 J kg⁻¹ K⁻¹.'],['Calorimetry','Heat lost = heat gained (isolated system).'],['Latent heat','Q = mL; temperature constant during change of state.'],['Water L values','L_f = 3.33 × 10⁵, L_v = 22.6 × 10⁵ J kg⁻¹.'],['Pressure effects','Higher pressure → higher boiling point; regelation of ice.'],['Triple point of water','273.16 K, 6.11 × 10⁻³ Pa.'],['Conduction','H = KA(T_C − T_D)/L.'],['Convection','Fluid motion; sea and land breezes.'],['Radiation','Electromagnetic waves; no medium needed.'],["Newton's cooling",'−dQ/dt = k(T₂ − T₁).']];

const Q=[
 {lv:1,q:'98.6 °F in Celsius is:',o:['36 °C','37 °C','38 °C','40 °C'],a:1,w:'(98.6 − 32) × 5/9 = 37.'},
 {lv:1,q:'The density of water is maximum at:',o:['0 °C','4 °C','100 °C','−4 °C'],a:1,w:'Anomalous expansion.'},
 {lv:1,q:'True or false: radiation needs a material medium.',o:['True','False'],a:1,w:'It travels through vacuum.'},
 {lv:1,q:'The SI unit of specific heat capacity is:',o:['J kg⁻¹','J kg⁻¹ K⁻¹','J K⁻¹','W m⁻¹ K⁻¹'],a:1,w:'Per kg per kelvin.'},
 {lv:2,q:'During melting, the temperature of ice:',o:['Rises','Falls','Remains constant','First rises then falls'],a:2,w:'Heat goes into latent heat.'},
 {lv:2,q:'Food cooks slowly in the hills because:',o:['Air is cold','Boiling point of water is lower at low pressure','Water is less dense','Fire burns less'],a:1,w:'Lower pressure, lower boiling point.'},
 {lv:2,q:'Which has the highest thermal conductivity?',o:['Glass','Wood','Copper','Air'],a:2,w:'Metals conduct well.'},
 {lv:3,q:'Heat needed to melt 0.5 kg of ice at 0 °C (L_f = 3.33 × 10⁵ J/kg):',o:['1.67 × 10⁵ J','3.33 × 10⁵ J','6.66 × 10⁵ J','0.83 × 10⁵ J'],a:0,w:'Q = mL.'},
 {lv:3,q:'A 10 m steel rail (α = 1.2 × 10⁻⁵ K⁻¹) warms by 30 K. It lengthens by:',o:['3.6 mm','0.36 mm','36 mm','3.6 cm'],a:0,w:'10 × 1.2 × 10⁻⁵ × 30 = 3.6 × 10⁻³ m.'},
 {lv:3,q:'Heat needed to raise 2 kg of water by 10 K:',o:['8372 J','83 720 J','41 860 J','4186 J'],a:1,w:'2 × 4186 × 10.'},
 {lv:4,q:'Assertion (A): A lake freezes from the top downwards. Reason (R): Water has maximum density at 4 °C.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'Colder water stays on top.'},
 {lv:4,q:'Assertion (A): Steam burns are more severe than burns from boiling water. Reason (R): Steam has more specific heat than water.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:2,w:'The reason is latent heat, not specific heat.'},
 {lv:5,open:true,m:3,q:'State the principle of calorimetry. 0.2 kg of metal at 150 °C is dropped into 0.15 kg of water at 27 °C in a calorimeter of water equivalent 0.025 kg. Final temperature is 40 °C. Find the specific heat of the metal.',ans:['Heat lost by hot = heat gained by cold in an isolated system (1).','Heat gained = (0.15 + 0.025) × 4186 × 13 = 9522.2 J (1).','s = 9522.2 / (0.2 × 110) ≈ 0.43 × 10³ J kg⁻¹ K⁻¹ (1).']},
 {lv:5,open:true,m:3,q:'Explain the anomalous expansion of water and its importance for aquatic life.',ans:['Water contracts from 0 °C to 4 °C; densest at 4 °C (1).','Cooling lake: 4 °C water sinks; colder water stays on top and freezes (1).','Ice insulates the water below, so aquatic life survives (1).']},
 {lv:5,open:true,m:3,q:'Draw the temperature–heat graph for 1 kg of ice at −10 °C heated to steam at 110 °C. Label each part.',ans:['Rising parts: ice, water and steam heating (1).','Flat part at 0 °C: melting, mL_f (1).','Longer flat part at 100 °C: boiling, mL_v (1).']}
];

const ONEMIN=['t_F = 9/5 t_C + 32; T = t_C + 273.15.','Δl/l = αΔT; area 2α; volume γ = 3α.','Water densest at 4 °C → lakes freeze from top.','Q = msΔT; water 4186 J kg⁻¹ K⁻¹.','Calorimetry: heat lost = heat gained.','Q = mL; L_f 3.33 × 10⁵, L_v 22.6 × 10⁵ J kg⁻¹.','Boiling point rises with pressure; regelation.','Conduction H = KAΔT/L; convection in fluids; radiation without medium.',"Newton's law: rate of cooling ∝ (T₂ − T₁)."];
const KEYS=[['heat vs temperature',/heat|temperatur/i],['Celsius / Fahrenheit',/celsius|fahrenheit|°f/i],['expansion coefficient',/expan|α|alpha/i],['4 °C water',/4 ?°c|anomal/i],['specific heat',/specific heat|msΔt|ms∆t/i],['calorimetry',/calorim|lost.*gain/i],['latent heat',/latent|mL/i],['conduction',/conduct/i],['convection',/convect/i],['radiation',/radiat/i],["Newton's cooling",/cooling/i]];

/* ---------- lab ---------- */
const CI=2100,CW=4186,CS=2010,LF=3.33e5,LV=22.6e5;
function stages(m){return[['Ice warms −20 → 0 °C',m*CI*20,-20,0],['Melting at 0 °C',m*LF,0,0],['Water warms 0 → 100 °C',m*CW*100,0,100],['Boiling at 100 °C',m*LV,100,100],['Steam warms 100 → 120 °C',m*CS*20,100,120]]}
function labDraw(){const m=+$('#hM').value,S=stages(m),tot=S.reduce((a,s)=>a+s[1],0),q=+$('#hQ').value/100*tot;const X=v=>50+v/tot*450,Y=t=>290-(t+20)*(260/140);
 let s=`<line x1="50" y1="290" x2="505" y2="290" stroke="${ink}" stroke-width="1.5"/><line x1="50" y1="290" x2="50" y2="20" stroke="${ink}" stroke-width="1.5"/>`+T(470,316,'heat supplied','font-size="12"')+T(30,16,'°C','font-size="12"');
 [-20,0,50,100,120].forEach(t=>s+=T(36,Y(t)+4,String(t),'font-size="11"'));
 let acc=0,d=`M${X(0)} ${Y(-20)}`;S.forEach((st,i)=>{acc+=st[1];d+=` L${X(acc)} ${Y(st[3])}`;if(st[2]===st[3])s+=`<line x1="${X(acc-st[1])}" y1="${Y(st[3])-10}" x2="${X(acc)}" y2="${Y(st[3])-10}" stroke="${RD}" stroke-opacity=".3" stroke-width="10"/>`});
 s+=`<path d="${d}" fill="none" stroke="${ink}" stroke-opacity=".25" stroke-width="2"/>`;
 let cur=0,curT=-20,stage=S[0],done=0;for(const st of S){if(q<=done+st[1]){stage=st;curT=st[2]+(st[3]-st[2])*((q-done)/st[1]);break}done+=st[1];stage=st;curT=st[3]}
 let dd=`M${X(0)} ${Y(-20)}`,a2=0;for(const st of S){if(q<=a2+st[1]){dd+=` L${X(q)} ${Y(curT)}`;break}a2+=st[1];dd+=` L${X(a2)} ${Y(st[3])}`}
 s+=`<path d="${dd}" fill="none" stroke="${RD}" stroke-width="3.5"/><circle cx="${X(q)}" cy="${Y(curT)}" r="6" fill="${BL}"/>`;$('#hc').innerHTML=s;
 const f=x=>(x/1000).toFixed(1)+' kJ';$('#hOut').innerHTML=`<p><b>Now:</b> ${stage[0]} · temperature ${curT.toFixed(1)} °C</p><p>Heat supplied: ${f(q)} of ${f(tot)}</p><table style="width:100%;font-size:13px">${S.map(st=>`<tr><td>${st[0]}</td><td style="text-align:right">${f(st[1])}</td></tr>`).join('')}</table><p class="note">Boiling takes about ${Math.round(S[3][1]/S[1][1])} times as much heat as melting: the longest flat part.</p>`}
function labInit(){}
function labShow(){labDraw()}
function labClick(b){return false}
function labChange(t){if(t.id==='hM'||t.id==='hQ'){labDraw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
