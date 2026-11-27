/* Rai Plus content pack: Class 10 Science, Chapter 11 – Electricity */
RP.register({key:'10sci11',cls:'10',subject:'Science',ch:'11',title:"Electricity",color:'#6b4a12',
crumb:"HBSE Class 10 Science · Unit: Effects of Current · Taught in October",h1:"Chapter 11: Electricity",sub:"Charge on the move: current, voltage, resistance, heat and the units on your electricity bill.",heroLabel:"A cell, a bulb and a resistor in a simple circuit with current flowing",labName:"Circuit lab",
theme:"\n:root{--g:light-dark(#7a5410,#e8c06a);--g2:light-dark(#fbf3e3,#241b0b);--line:light-dark(#ecdcb8,#4a3a18);--bg:light-dark(#ffffff,#15110a);--card:light-dark(#ffffff,#1d170c);\n--ink:light-dark(#21190a,#f1e9d8);--mute:light-dark(#6a5a3a,#c2b392);--y:light-dark(#378add,#85b7eb);--y2:light-dark(#eaf2fb,#0f2234);--hd:#4a3408}\n",
labHTML:`  <h2>Circuit lab</h2>
  <p>Build a circuit, read the meters, and do the Ohm's law experiment yourself.</p>
  <div class="ftabs" role="group" aria-label="Lab tool"><button data-tool="circ" aria-pressed="true">Series and parallel</button><button data-tool="ohm" aria-pressed="false">Ohm's law experiment</button></div>
  <div id="t-circ">
    <div class="sim"><div><div class="fig" style="max-width:none"><svg id="cSvg" viewBox="0 0 560 330" role="img" aria-label="Circuit with a battery and two resistors" style="color:var(--ink)"></svg></div></div>
    <div><div class="ctrl"><label>Battery<select id="cV"><option value="1.5">1 cell (1.5 V)</option><option value="3">2 cells (3 V)</option><option value="4.5">3 cells (4.5 V)</option><option value="6" selected>4 cells (6 V)</option></select></label>
    <label>Connection<select id="cMode"><option value="s">Series</option><option value="p">Parallel</option></select></label>
    <label>R₁ (Ω)<select id="cR1"><option>2</option><option selected>4</option><option>6</option><option>12</option></select></label>
    <label>R₂ (Ω)<select id="cR2"><option>2</option><option>4</option><option>6</option><option selected>12</option></select></label></div>
    <div class="box y" id="cOut" aria-live="polite"></div></div></div>
  </div>
  <div id="t-ohm" hidden>
    <div class="sim"><div><div class="fig" style="max-width:none"><svg id="oSvg" viewBox="0 0 520 340" role="img" aria-label="V against I graph" style="color:var(--ink)"></svg></div></div>
    <div><p class="note">A nichrome wire of unknown resistance is connected to a battery, an ammeter and a voltmeter. Add cells one at a time and record each reading.</p>
    <div class="ctrl"><label>Number of cells<input type="range" id="oN" min="1" max="4" value="1"></label><button class="btn p" id="oRec">Record reading</button><button class="btn" id="oClr">Clear</button></div>
    <div class="box y" id="oOut" aria-live="polite"></div></div></div>
  </div>
`,
build:function(){

const ACC='#7a5410',LABNAME='Circuit lab',MIND_CENTER='Electricity';
const W='#6b5a3a',Y='#e2a93b';
const lab2=(x,y,t,c='#fbf3e3',w=120)=>`<rect x="${x-w/2}" y="${y-17}" width="${w}" height="34" rx="8" fill="${c}" stroke="#7a5410"/>`+T(x,y+5,t,'font-size="13"');
const cellSym=(x,y)=>`<line x1="${x}" y1="${y-16}" x2="${x}" y2="${y+16}" stroke="currentColor" stroke-width="3"/><line x1="${x+10}" y1="${y-8}" x2="${x+10}" y2="${y+8}" stroke="currentColor" stroke-width="5"/>`;
const resSym=(x,y,w=60)=>`<rect x="${x}" y="${y-9}" width="${w}" height="18" fill="none" stroke="currentColor" stroke-width="2.5"/>`;
const bulbSym=(x,y,on)=>`<circle cx="${x}" cy="${y}" r="15" fill="${on?'#fac775':'none'}" stroke="currentColor" stroke-width="2.5"/><path d="M${x-10} ${y-10} L${x+10} ${y+10} M${x+10} ${y-10} L${x-10} ${y+10}" stroke="currentColor" stroke-width="2"/>`;
function heroDraw(){return `<g style="color:#fff">`+`<rect x="70" y="20" width="220" height="90" rx="4" fill="none" stroke="#fff" stroke-width="2.5"/>`+`<rect x="100" y="12" width="40" height="16" fill="#4a3408"/>`+cellSym(115,20)+`<rect x="200" y="100" width="60" height="20" fill="#4a3408"/>`+resSym(200,110)+`<rect x="270" y="50" width="40" height="40" fill="#4a3408"/>`+bulbSym(290,70,1)+`<path d="M150 20 l10 -5 v10 Z" fill="${Y}"/>`+`</g>`}
const HERO=heroDraw;
const MIND=[['Current and charge',90,50],['Potential difference',430,50],['Ohm\'s law',90,150],['Resistance and resistivity',430,150],['Series and parallel',90,250],['Heating and power',430,250]];

const C=[
{id:'a1',num:'11.1',title:'Electric current and circuits',
 intro:'When you press a switch, the bulb lights at once. What is actually moving in the wire?',
 obj:'Define electric current, use I = Q/t, state the SI units of charge and current, and describe a closed circuit.',
 prior:'Charges and static electricity (Class 8).',
 simple:'Electric current is the rate at which electric charge flows through a conductor. In metal wires the moving charges are electrons. A current flows only when there is a closed, unbroken path called an electric circuit. A switch makes or breaks this path.',
 detail:'If a net charge Q flows across any cross-section of a conductor in time t, the current is I = Q/t. The SI unit of charge is the coulomb (C), roughly the charge on 6 × 10¹⁸ electrons; one electron carries 1.6 × 10⁻¹⁹ C. The SI unit of current is the ampere (A): 1 A = 1 C/s. Smaller units are the milliampere (1 mA = 10⁻³ A) and microampere (1 µA = 10⁻⁶ A). Current is measured with an ammeter, always connected in series. By convention, current flows from the positive terminal to the negative terminal outside the cell, which is opposite to the direction in which electrons actually move.',
 real:'A torch works only when the switch closes the path between the cells and the bulb; open the switch and the circuit is broken.',
 apply:'A current of 0.5 A flows through a bulb for 10 minutes. How much charge passes through it?',
 see:{w:520,h:240,f:[
  ['A closed circuit: cell, switch and bulb joined by wires.',`<rect x="110" y="50" width="300" height="140" rx="6" fill="none" stroke="currentColor" stroke-width="3"/>`+`<rect x="230" y="40" width="40" height="20" fill="var(--bg)"/>`+cellSym(245,50)+`<rect x="395" y="100" width="30" height="40" fill="var(--bg)"/>`+bulbSym(410,120,1)],
  ['Electrons drift from the negative terminal round to the positive terminal.',[0,1,2,3,4,5].map(i=>`<circle cx="${130+i*50}" cy="190" r="6" fill="#378add"/>`).join('')+T(260,225,'electrons →','font-size="13"')],
  ['Conventional current is shown the opposite way: from + to –.',`<path d="M300 30 l20 -8 v16 Z" fill="${Y}"/>`+T(330,26,'conventional current','font-size="13" text-anchor="start"')]]},
 seeNote:'Current direction is a convention chosen before electrons were discovered.',
 do:{title:'Make and break a circuit',mat:'Two 1.5 V cells in a holder, a torch bulb in a holder, connecting wires, a plug key or switch',steps:['Connect the cells, bulb and key in a loop.','Close the key and observe the bulb; open it again.','Remove one wire end and close the key.'],obs:'The bulb glows only when the loop is complete.',why:'Current needs a closed path. Safety: use only cells, never the mains.',lab:true},
 memo:'"I = Q over t: charge per second."',
 miscon:['"Current is used up in the bulb." The same current flows in and out; energy is what the bulb uses.','"Electrons flow from + to –." Electrons move from – to +; conventional current is from + to –.'],
 terms:['Electric current','Coulomb','Ampere','Ammeter','Closed circuit','Conventional current'],
 q:{q:'A charge of 30 C flows through a wire in 1 minute. The current is:',o:['30 A','0.5 A','2 A','1800 A'],a:1,why:'I = Q/t = 30/60 = 0.5 A.'},
 exam:'Numericals on I = Q/t and the number of electrons (n = Q/e) are common 2-mark questions.'},
{id:'a2',num:'11.2',title:'Electric potential and potential difference',
 intro:'Water flows from a higher level to a lower one. What makes charge flow through a wire?',
 obj:'Define potential difference, use V = W/Q, and state how a voltmeter is connected.',
 prior:'Work and energy (Class 9).',
 simple:'Charges flow when there is a difference of electric pressure, called potential difference, between two points. A cell creates this difference using its chemical energy. The potential difference between two points is the work done to move a unit charge from one point to the other.',
 detail:'The potential difference V between two points is the work W done to move a unit charge between them: V = W/Q. Its SI unit is the volt (V). One volt is the potential difference between two points when 1 joule of work is done to move 1 coulomb of charge: 1 V = 1 J/C. The chemical action inside a cell keeps a potential difference across its terminals even when no current is drawn. Potential difference is measured with a voltmeter, which is always connected in parallel across the points.',
 real:'A 9 V battery does 9 joules of work on every coulomb of charge it pushes round the circuit, six times as much as one 1.5 V cell.',
 apply:'How much work is done in moving 2 C of charge across a potential difference of 12 V?',
 see:{w:520,h:240,f:[
  ['A cell is like a pump that lifts charge to a higher potential.',lab2(110,60,'cell = pump','#fbf3e3',120)+`<rect x="90" y="90" width="40" height="120" fill="${Y}" opacity=".5"/>`],
  ['The charge "falls" through the bulb, giving up energy as light and heat.',`<path d="M130 90 C 300 60 380 120 400 200" fill="none" stroke="#378add" stroke-width="3" stroke-dasharray="6 5"/>`+bulbSym(410,200,1)],
  ['Potential difference = work done per unit charge: V = W/Q.',T(260,232,'V = W/Q   (1 V = 1 J/C)','font-weight="700"')]]},
 seeNote:'A height analogy: higher potential is like a higher water level.',
 do:{title:'Measure with a voltmeter',mat:'Cells, a bulb, a voltmeter, wires',steps:['Connect cells and bulb in a loop.','Connect the voltmeter across the bulb (one lead each side), + to the side nearer the cell\'s + terminal.','Read it with one, two and three cells.'],obs:'The reading increases with more cells.',why:'More cells give a larger potential difference. A voltmeter goes in parallel so it measures the difference between two points.',lab:true},
 memo:'"Volts are joules per coulomb."',
 miscon:['"Voltage flows through the wire." Current flows; potential difference is across two points.','"A voltmeter goes in series." It goes in parallel.'],
 terms:['Potential difference','Volt','Voltmeter','Work done per unit charge'],
 q:{q:'1 volt is equal to:',o:['1 J/C','1 C/s','1 J/s','1 C/J'],a:0,why:'V = W/Q, so 1 V = 1 J/C.'},
 exam:'"Define 1 volt" and V = W/Q numericals are frequent 1–2 mark questions.'},
{id:'a3',num:'11.3',title:'Circuit diagrams',
 intro:'Drawing every wire and bulb as a picture takes too long. Engineers use symbols instead.',
 obj:'Recognise and draw the standard symbols for cells, batteries, keys, bulbs, resistors, rheostats, ammeters and voltmeters.',
 prior:'Simple circuits (11.1).',
 simple:'A circuit diagram shows how components are connected using simple standard symbols. The longer line of a cell symbol is the positive terminal. A key (switch) can be open or closed. A rheostat is a variable resistor.',
 detail:'Common symbols: an electric cell (a long thin line and a short thick line, the longer being positive); a battery (two or more cells joined); a plug key or switch, open (OFF) or closed (ON); a wire joint (a dot); wires crossing without joining; an electric bulb; a resistor of resistance R (a rectangle or zigzag); a variable resistor or rheostat (a resistor with an arrow through it); an ammeter (A in a circle, in series); and a voltmeter (V in a circle, in parallel).',
 real:'Electricians wiring a new classroom follow a circuit diagram drawn with exactly these symbols.',
 apply:'Draw a circuit with a battery of three cells, a bulb, a resistor, an ammeter and a plug key in series, with a voltmeter across the resistor.',
 see:{w:520,h:240,f:[
  ['Cell: the long line is +, the short thick line is –.',cellSym(80,60)+T(85,100,'cell','font-size="13"')],
  ['Resistor and bulb.',resSym(180,60)+T(210,100,'resistor','font-size="13"')+bulbSym(330,60,0)+T(330,100,'bulb','font-size="13"')],
  ['Ammeter in series, voltmeter in parallel.',`<circle cx="160" cy="170" r="18" fill="none" stroke="currentColor" stroke-width="2.5"/>`+T(160,176,'A','font-weight="700"')+`<circle cx="360" cy="170" r="18" fill="none" stroke="currentColor" stroke-width="2.5"/>`+T(360,176,'V','font-weight="700"')]]},
 seeNote:'The Visuals tab has the full symbol chart.',
 do:{title:'Symbol flashcard race',mat:'Cards with symbols on one side and names on the other',steps:['In pairs, flip a card and name the component within 3 seconds.','Then draw a circuit your partner describes.','Swap roles.'],obs:'After a few rounds you name every symbol quickly.',why:'Recognising symbols makes circuit problems much faster in the exam.',lab:false},
 memo:'"Long line, plus sign."',
 miscon:['"Wires crossing always connect." They connect only where a dot is drawn.','"A rheostat is a battery." It is a variable resistor.'],
 terms:['Circuit diagram','Cell symbol','Plug key','Rheostat','Ammeter','Voltmeter'],
 q:{q:'In a circuit diagram, a voltmeter is drawn:',o:['In series with the component','In parallel across the component','Next to the battery only','Instead of a key'],a:1,why:'A voltmeter measures the difference across two points.'},
 exam:'Drawing a labelled circuit diagram is asked almost every year for 2–3 marks.'},
{id:'a4',num:'11.4',title:"Ohm's law",
 intro:'Double the voltage across a wire. What happens to the current?',
 obj:"State Ohm's law, interpret a V–I graph, and use V = IR.",
 prior:'Current and potential difference (11.1, 11.2).',
 simple:'For a metal wire at constant temperature, the current through it is directly proportional to the potential difference across it. So V/I stays constant: this constant is the resistance R. V = IR.',
 detail:"Ohm's law: the potential difference V across the ends of a metallic wire is directly proportional to the current I through it, provided its temperature remains the same. V ∝ I, so V/I = R, or V = IR. R is the resistance of the conductor; its SI unit is the ohm (Ω): 1 Ω = 1 V/1 A. The graph of V against I is a straight line through the origin, and its slope gives R. Resistance opposes the flow of charge. A rheostat changes the resistance in a circuit to control the current. For a given potential difference, I = V/R: the current is inversely proportional to resistance.",
 real:'A fan regulator works like a rheostat: turning it changes the resistance, and so the current and the speed.',
 apply:'A bulb draws 0.5 A from a 220 V supply. What is its resistance while glowing?',
 see:{w:520,h:240,f:[
  ['Measure I and V for 1, 2, 3 and 4 cells.',`<line x1="80" y1="210" x2="460" y2="210" stroke="currentColor" stroke-width="2"/><line x1="80" y1="210" x2="80" y2="30" stroke="currentColor" stroke-width="2"/>`+T(470,215,'I','font-size="13"')+T(70,30,'V','font-size="13"')],
  ['The points lie on a straight line through the origin.',[1,2,3,4].map(k=>`<circle cx="${80+k*80}" cy="${210-k*40}" r="6" fill="${Y}"/>`).join('')+`<line x1="80" y1="210" x2="420" y2="40" stroke="#7a5410" stroke-width="2.5"/>`],
  ['The slope V/I is constant: that is the resistance R.',T(300,232,'V = IR','font-weight="700"')]]},
 seeNote:'Try it yourself in the Ohm\'s law experiment in the lab.',
 do:{title:"Verify Ohm's law",mat:'Nichrome wire (about 50 cm), ammeter, voltmeter, 4 cells, plug key, wires',steps:['Connect one cell, the wire, ammeter and key in series; voltmeter across the wire.','Record I and V.','Repeat with 2, 3 and 4 cells.','Plot V against I and calculate V/I each time.'],obs:'V/I is almost the same each time; the graph is a straight line through the origin.',why:"The resistance of the wire is constant at constant temperature: Ohm's law. Safety: close the key only while reading, so the wire doesn't heat up.",lab:true},
 memo:'"V = I R: Very Interesting Rule."',
 miscon:['"Resistance depends on voltage." For an ohmic conductor R is constant; V and I change together.','"Ohm\'s law works for everything." It needs constant temperature and applies to metallic conductors.'],
 terms:["Ohm's law",'Resistance','Ohm (Ω)','V–I graph','Rheostat'],
 q:{q:'The V–I graph for a conductor obeying Ohm\'s law is:',o:['A curve','A straight line through the origin','A horizontal line','A vertical line'],a:1,why:'V ∝ I gives a straight line through the origin.'},
 exam:"Statement of Ohm's law, the V–I graph and V = IR numericals carry 3–5 marks together."},
{id:'a5',num:'11.5',title:'Factors on which resistance depends',
 intro:'Why are heater coils made of nichrome while house wiring uses copper?',
 obj:'State how resistance depends on length, area of cross-section and material, and use R = ρl/A.',
 prior:"Ohm's law (11.4).",
 simple:'A longer wire has more resistance. A thicker wire has less. The material matters too: each material has its own resistivity. R = ρ l / A.',
 detail:'Resistance is directly proportional to length (R ∝ l) and inversely proportional to the area of cross-section (R ∝ 1/A). So R = ρ l/A, where ρ (rho) is the electrical resistivity of the material. The SI unit of resistivity is the ohm metre (Ω m). Resistivity is a property of the material and changes with temperature. Metals and alloys have very low resistivity, of the order of 10⁻⁸ to 10⁻⁶ Ω m, so they are good conductors. Insulators such as rubber and glass have resistivity of the order of 10¹² to 10¹⁷ Ω m. Alloys generally have higher resistivity than their constituent metals and do not oxidise (burn) readily at high temperatures, so they are used in heating devices such as toasters and irons. Tungsten is used for bulb filaments, and copper and aluminium for transmission wires.',
 real:'An extension cord for a heater must be thick: a thin cord has more resistance and can overheat.',
 apply:'A wire is stretched to double its length (its volume stays the same). By what factor does its resistance change?',
 see:{w:520,h:240,f:[
  ['Longer wire → more resistance (R ∝ l).',`<line x1="60" y1="50" x2="220" y2="50" stroke="${W}" stroke-width="6"/>`+`<line x1="60" y1="90" x2="460" y2="90" stroke="${W}" stroke-width="6"/>`+T(470,95,'2R','font-size="13" text-anchor="start"')+T(230,55,'R','font-size="13" text-anchor="start"')],
  ['Thicker wire → less resistance (R ∝ 1/A).',`<line x1="60" y1="150" x2="220" y2="150" stroke="${W}" stroke-width="14"/>`+T(240,155,'R/2 (double area)','font-size="13" text-anchor="start"')],
  ['Material matters: R = ρ l / A.',T(260,220,'R = ρ l / A','font-weight="700"')]]},
 seeNote:'Assumes the same temperature for every wire.',
 do:{title:'Length and resistance',mat:'Nichrome wire, metre scale, cell, ammeter, key, wires',steps:['Connect 20 cm of wire in the circuit and note the current.','Repeat with 40 cm and 60 cm.','Then use a thicker wire of the same length.'],obs:'Current falls as length increases and rises with the thicker wire.',why:'Resistance increases with length and decreases with area.',lab:true},
 memo:'"Long and thin: resistance wins."',
 miscon:['"Resistivity changes when you cut the wire." Resistivity is fixed for a material; resistance changes.','"All metals are equally good conductors." Silver and copper are far better than iron or nichrome.'],
 terms:['Resistivity','Ohm metre','Length','Area of cross-section','Alloy'],
 q:{q:'If the length of a wire is halved, its resistance becomes:',o:['Double','Half','Four times','Unchanged'],a:1,why:'R ∝ l.'},
 exam:'R = ρl/A numericals and "why alloys in heaters" are common 2–3 mark questions.'},
{id:'a6',num:'11.6',title:'Resistors in series and in parallel',
 intro:'In your home, switching off one bulb doesn\'t switch off the fan. Why not?',
 obj:'Derive and use Rₛ = R₁ + R₂ + R₃ and 1/Rₚ = 1/R₁ + 1/R₂ + 1/R₃, and compare series and parallel circuits.',
 prior:"Ohm's law (11.4).",
 simple:'In series, resistors are joined end to end: the same current flows through all, and their resistances add up. In parallel, resistors are joined across the same two points: each gets the same voltage, and the total resistance is less than the smallest one.',
 detail:'Series: the current is the same in every resistor; the total potential difference is the sum of those across each resistor, V = V₁ + V₂ + V₃. Using V = IR gives Rₛ = R₁ + R₂ + R₃. Parallel: the potential difference across each resistor is the same; the total current is the sum of the separate currents, I = I₁ + I₂ + I₃. This gives 1/Rₚ = 1/R₁ + 1/R₂ + 1/R₃. A series arrangement is not suitable for household appliances: if one component fails the circuit breaks, and all appliances share the voltage and cannot each get the current they need. In a parallel circuit, each appliance gets the full voltage and can be switched on or off independently.',
 real:'Decorative "serial" lights go out together when one bulb fails, because they are in series. House wiring is in parallel.',
 apply:'Three resistors of 6 Ω each are connected (a) in series, (b) in parallel. Find the total resistance in each case.',
 see:{w:520,h:240,f:[
  ['Series: one path; the same current in every resistor.',resSym(80,60)+resSym(170,60)+resSym(260,60)+`<line x1="40" y1="60" x2="80" y2="60" stroke="currentColor" stroke-width="2.5"/><line x1="140" y1="60" x2="170" y2="60" stroke="currentColor" stroke-width="2.5"/><line x1="230" y1="60" x2="260" y2="60" stroke="currentColor" stroke-width="2.5"/><line x1="320" y1="60" x2="360" y2="60" stroke="currentColor" stroke-width="2.5"/>`+T(440,65,'Rₛ = R₁+R₂+R₃','font-size="13"')],
  ['Parallel: several paths; the same voltage across each.',[0,1,2].map(k=>resSym(170,130+k*30)+`<line x1="120" y1="${130+k*30}" x2="170" y2="${130+k*30}" stroke="currentColor" stroke-width="2.5"/><line x1="230" y1="${130+k*30}" x2="280" y2="${130+k*30}" stroke="currentColor" stroke-width="2.5"/>`).join('')+`<line x1="120" y1="130" x2="120" y2="190" stroke="currentColor" stroke-width="2.5"/><line x1="280" y1="130" x2="280" y2="190" stroke="currentColor" stroke-width="2.5"/>`],
  ['Parallel total is less than the smallest resistor.',T(420,165,'1/Rₚ = 1/R₁+1/R₂+1/R₃','font-size="13"')]]},
 seeNote:'Try both in the Circuit lab.',
 do:{title:'Series vs parallel bulbs',mat:'Three identical torch bulbs in holders, 2 cells, wires',steps:['Connect the three bulbs in series and note the brightness; unscrew one.','Now connect them in parallel; note the brightness; unscrew one.'],obs:'In series the bulbs are dim and all go out when one is removed. In parallel they are bright and the others stay lit.',why:'Parallel gives each bulb the full voltage and its own path.',lab:true},
 memo:'"Series sum; parallel – sum of reciprocals."',
 miscon:['"Parallel resistors add up to more." The total is less than the smallest.','"Current is used up along a series circuit." It is the same everywhere in series.'],
 terms:['Series','Parallel','Equivalent resistance','Domestic wiring'],
 q:{q:'Two 4 Ω resistors in parallel have an equivalent resistance of:',o:['8 Ω','4 Ω','2 Ω','16 Ω'],a:2,why:'1/Rₚ = 1/4 + 1/4 = 1/2, so Rₚ = 2 Ω.'},
 exam:'Combination numericals (series + parallel) carry 3–5 marks and appear every year.'},
{id:'a7',num:'11.7',title:'Heating effect of electric current',
 intro:'Why does an electric iron get hot while the cord that feeds it stays cool?',
 obj:"State Joule's law of heating, use H = I²Rt, and explain applications such as heaters, bulbs and fuses.",
 prior:"Ohm's law; work and energy.",
 simple:'When current flows through a resistor, some electrical energy is changed into heat. The heat produced depends on the current, the resistance and the time: H = I²Rt. Heaters, irons, toasters, bulbs and fuses all use this effect.',
 detail:"Joule's law of heating: the heat produced in a resistor is directly proportional to the square of the current, to the resistance, and to the time for which the current flows: H = I²Rt. This comes from H = VIt and V = IR. Uses: electric irons, toasters, ovens, kettles and room heaters. In an electric bulb, the filament is made of tungsten (melting point 3380 °C), which glows white-hot and gives light; bulbs are filled with chemically inactive nitrogen and argon to prolong the filament's life. A fuse is a wire of a metal or alloy with a suitable melting point, connected in series with the device; if a current larger than the specified value flows, the fuse wire melts and breaks the circuit. Unwanted heating wastes energy and can damage components.",
 real:'Fuses for home appliances are rated 1 A, 2 A, 3 A, 5 A, 10 A and so on. An electric iron of 1 kW at 220 V draws about 4.5 A, so it needs a fuse rated about 5 A.',
 apply:'A heater of resistance 40 Ω draws 5 A. How much heat does it produce in 30 s?',
 see:{w:520,h:240,f:[
  ['Current through a resistor heats it up.',`<rect x="120" y="80" width="280" height="40" rx="6" fill="#e2a93b" opacity=".35" stroke="${W}" stroke-width="2"/>`],
  ['Double the current → four times the heat (H ∝ I²).',`<rect x="120" y="80" width="280" height="40" rx="6" fill="#d85a30" opacity=".75"/>`+[0,1,2].map(i=>`<path d="M${180+i*80} 70 q8 -12 0 -24 q-8 -12 0 -24" fill="none" stroke="#d85a30" stroke-width="2.5"/>`).join('')],
  ['Joule\'s law: H = I²Rt.',T(260,180,'H = I²Rt','font-weight="700"')]]},
 seeNote:'Watch the fuse melt in the Visuals tab.',
 do:{title:'Warm wire (teacher demonstration)',mat:'Short piece of thin nichrome wire, 2 cells, key, a strip of wax paper',steps:['Connect the wire to the cells through the key.','Close the key for 10 seconds with wax paper resting on the wire.','Open the key and observe the wax.'],obs:'The wax softens or melts where it touched the wire.',why:'Electrical energy changes to heat in the resistance wire. Safety: the wire gets hot; do not touch it.',lab:true},
 memo:'"Heat = I-squared R t."',
 miscon:['"A fuse is connected in parallel." It must be in series to break the circuit.','"Doubling current doubles the heat." It quadruples it.'],
 terms:["Joule's law of heating",'Tungsten filament','Fuse','Heating element'],
 q:{q:'A fuse wire is placed:',o:['In parallel with the appliance','In series with the appliance','Across the earth wire','Inside the switch only'],a:1,why:'In series, so that melting it breaks the circuit.'},
 exam:'H = I²Rt numericals and fuse/filament questions are frequent 2–3 mark items.'},
{id:'a8',num:'11.8',title:'Electric power',
 intro:'Your electricity bill counts "units". What exactly is a unit?',
 obj:'Define electric power, use P = VI = I²R = V²/R, and convert kilowatt hours to joules.',
 prior:'Heating effect (11.7); work and power (Class 9).',
 simple:'Electric power is the rate at which electrical energy is used. P = VI. Its unit is the watt (W). The energy used is power × time. The "unit" on an electricity bill is 1 kilowatt hour (kWh).',
 detail:'Power P = VI, and using V = IR, also P = I²R = V²/R. The SI unit is the watt: 1 W = 1 V × 1 A, the power used by a device carrying 1 A at 1 V. The commercial unit of electrical energy is the kilowatt hour (kWh), commonly called a "unit": 1 kWh = 1000 W × 3600 s = 3.6 × 10⁶ J. Energy (kWh) = power (kW) × time (h). Many people think electrons are used up in a circuit; in fact we pay for the energy that moves the electrons through the devices.',
 real:'A 100 W bulb on for 10 hours uses 1 kWh, one unit. A 2 kW geyser uses the same in just 30 minutes.',
 apply:'Two lamps, 100 W and 60 W, are connected in parallel to 220 V. What current is drawn from the supply?',
 see:{w:520,h:240,f:[
  ['Power = voltage × current.',T(260,50,'P = V I','font-weight="700"')],
  ['Using Ohm\'s law: P = I²R = V²/R.',T(260,110,'P = I²R = V²/R','font-weight="700"')],
  ['1 unit = 1 kWh = 3.6 × 10⁶ J.',lab2(260,180,'1 kWh = 3.6 × 10⁶ J','#fbf3e3',220)]]},
 seeNote:'Work out a month\'s bill in the Visuals tab.',
 do:{title:'Home energy audit',mat:'Notebook; the power rating labels of 5 appliances at home',steps:['Note each appliance\'s power (W) and the hours it runs per day.','Calculate kWh per day: power (kW) × hours.','Multiply by 30 for a month and compare with the bill.'],obs:'Heating and cooling appliances use the most units.',why:'Energy = power × time; high-power appliances add up fast.',lab:false},
 memo:'"Watts times hours, divide by 1000: units."',
 miscon:['"We pay for electrons." We pay for energy.','"kW and kWh are the same." kW is power; kWh is energy.'],
 terms:['Electric power','Watt','Kilowatt hour','Commercial unit of energy'],
 q:{q:'1 kWh is equal to:',o:['3.6 × 10³ J','3.6 × 10⁶ J','1000 J','36 J'],a:1,why:'1000 W × 3600 s = 3.6 × 10⁶ J.'},
 exam:'kWh conversions and P = VI numericals (lamps, heaters) appear every year.'}
];

const CARDS=[['Electric current','Rate of flow of charge: I = Q/t; unit ampere (A).'],['1 coulomb','Charge on about 6 × 10¹⁸ electrons; one electron = 1.6 × 10⁻¹⁹ C.'],['Ammeter','Measures current; connected in series.'],['Potential difference','Work done per unit charge: V = W/Q; unit volt.'],['1 volt','1 joule of work per coulomb of charge.'],['Voltmeter','Measures potential difference; connected in parallel.'],["Ohm's law",'V ∝ I at constant temperature; V = IR.'],['1 ohm','Resistance when 1 V drives 1 A.'],['Rheostat','Variable resistor used to change current.'],['R = ρl/A','Resistance rises with length, falls with area, depends on material.'],['Resistivity','Property of a material; unit Ω m.'],['Series','Rₛ = R₁ + R₂ + R₃; same current everywhere.'],['Parallel','1/Rₚ = 1/R₁ + 1/R₂ + 1/R₃; same voltage across each.'],["Joule's law",'H = I²Rt.'],['Fuse','Low-melting wire in series; melts on excess current.'],['Electric power','P = VI = I²R = V²/R; unit watt.'],['1 kWh','1 unit = 3.6 × 10⁶ J.']];

const Q=[
 {lv:1,q:'The SI unit of electric current is:',o:['Volt','Ohm','Ampere','Coulomb'],a:2,w:'Current is measured in amperes.'},
 {lv:1,q:'An ammeter is connected in a circuit:',o:['In series','In parallel','Across the battery only','Anywhere'],a:0,w:'Ammeters go in series.'},
 {lv:1,q:'The unit of resistivity is:',o:['Ω','Ω m','Ω/m','V/A'],a:1,w:'From ρ = RA/l: ohm metre.'},
 {lv:1,q:'True or false: the filament of an electric bulb is made of tungsten.',o:['True','False'],a:0,w:'Tungsten has a very high melting point (3380 °C).'},
 {lv:1,q:'1 kWh equals:',o:['3.6 × 10⁶ J','3.6 × 10³ J','1000 J','60 J'],a:0,w:'1000 W × 3600 s.'},
 {lv:2,q:'Which of these is NOT suitable for household wiring?',o:['Parallel connection','Series connection','Copper wire','Earthing'],a:1,w:'In series, one fault breaks every appliance and the voltage is shared.'},
 {lv:2,q:'Heating elements are made of alloys because alloys:',o:['Have low resistivity','Have high resistivity and do not oxidise easily when hot','Are magnetic','Are cheap insulators'],a:1,w:'High resistivity and resistance to burning at high temperatures.'},
 {lv:2,q:'How many electrons make up 1 C of charge (approximately)?',o:['6 × 10¹⁸','1.6 × 10¹⁹','6 × 10²³','1.6 × 10⁻¹⁹'],a:0,w:'1/(1.6 × 10⁻¹⁹) ≈ 6.25 × 10¹⁸.'},
 {lv:3,q:'A 20 Ω resistor is connected to a 10 V battery. The current is:',o:['200 A','2 A','0.5 A','30 A'],a:2,w:'I = V/R = 10/20 = 0.5 A.'},
 {lv:3,q:'Three 3 Ω resistors in parallel give:',o:['9 Ω','3 Ω','1 Ω','1/3 Ω'],a:2,w:'1/R = 3 × 1/3 = 1, so R = 1 Ω.'},
 {lv:3,q:'A 1000 W heater runs for 2 hours a day for 30 days. Units used:',o:['60','2','30','600'],a:0,w:'1 kW × 2 h × 30 = 60 kWh.'},
 {lv:3,q:'The heat produced in 10 s by 2 A through a 5 Ω resistor is:',o:['100 J','200 J','20 J','50 J'],a:1,w:'H = I²Rt = 4 × 5 × 10 = 200 J.'},
 {lv:4,q:'Assertion (A): Doubling the current through a heater quadruples the heat produced. Reason (R): H = I²Rt.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'Heat depends on the square of the current.'},
 {lv:4,q:'A wire of resistance R is cut into two equal halves and these are joined in parallel. The new resistance is:',o:['R','R/2','R/4','2R'],a:2,w:'Each half is R/2; two R/2 in parallel = R/4.'},
 {lv:4,q:'Two bulbs of 100 W and 60 W are connected in series to 220 V. Which glows brighter?',o:['100 W','60 W','Both equally','Neither'],a:1,w:'The 60 W bulb has higher resistance (V²/P); in series the same current flows, so P = I²R is larger for it.'},
 {lv:5,open:true,m:3,q:"State Ohm's law. Draw a labelled circuit to verify it and sketch the V–I graph.",ans:["Statement: V ∝ I at constant temperature (1).",'Circuit with cells, key, ammeter in series, voltmeter across the resistor, rheostat (1).','Straight-line V–I graph through the origin; slope = R (1).']},
 {lv:5,open:true,m:3,q:'Why is a series arrangement not used for domestic circuits? Give three reasons.',ans:['If one appliance fails, the circuit breaks and all stop (1).','Appliances share the voltage, so they do not get 220 V each (1).','Different appliances need different currents; series forces the same current through all (1).']},
 {lv:5,open:true,m:5,q:'A 4 Ω and a 12 Ω resistor are connected in parallel, and this combination is connected in series with a 3 Ω resistor and a 6 V battery. Find (a) the total resistance, (b) the current from the battery, (c) the current through the 12 Ω resistor.',ans:['Parallel: 1/R = 1/4 + 1/12 = 1/3, so 3 Ω (1).','Total = 3 + 3 = 6 Ω (1).','I = 6/6 = 1 A (1).','Voltage across parallel part = 1 × 3 = 3 V (1).','Current in 12 Ω = 3/12 = 0.25 A (1).']},
 {lv:5,open:true,m:3,q:'What is the heating effect of current? Explain why a tungsten filament is used in bulbs and why bulbs are filled with nitrogen and argon.',ans:['Electrical energy converts to heat in a resistor: H = I²Rt (1).','Tungsten has a very high melting point (3380 °C), so it glows without melting (1).','Inert gases prevent the filament oxidising and prolong its life (1).']}
];

const ONEMIN=['I = Q/t; 1 A = 1 C/s; e = 1.6 × 10⁻¹⁹ C; ammeter in series.','V = W/Q; 1 V = 1 J/C; voltmeter in parallel.','Conventional current + to –; electrons move – to +.',"Ohm's law: V = IR at constant temperature; V–I graph is a straight line.",'R = ρl/A; resistivity unit Ω m; alloys have high ρ.','Series: Rₛ = R₁ + R₂ + R₃; parallel: 1/Rₚ = Σ1/R.','Homes use parallel wiring: full voltage to each, independent switching.',"Joule's law: H = I²Rt; tungsten filament; fuse in series.",'P = VI = I²R = V²/R; 1 kWh = 3.6 × 10⁶ J.'];
const KEYS=[['current I = Q/t',/current|q\/t|ampere/i],['potential difference',/potential|volt/i],['ammeter in series',/ammeter/i],['voltmeter in parallel',/voltmeter/i],["Ohm's law",/ohm/i],['V = IR',/v\s*=\s*i\s*r|ir/i],['resistivity',/resistivit|ρ|rho/i],['series',/series/i],['parallel',/parallel/i],['heating effect / Joule',/joule|heat|i²rt|i2rt/i],['fuse',/fuse/i],['power P = VI',/power|watt|p\s*=/i],['kilowatt hour',/kwh|kilowatt/i]];

/* ---------- circuit lab ---------- */
let tool='circ',pts=[];const RW=5;
function fmt(x,d=2){return (Math.round(x*10**d)/10**d).toString()}
function circDraw(){const V=+$('#cV').value,m=$('#cMode').value,R1=+$('#cR1').value,R2=+$('#cR2').value;
 const R=m==='s'?R1+R2:R1*R2/(R1+R2),I=V/R;let I1,I2,V1,V2;if(m==='s'){I1=I2=I;V1=I*R1;V2=I*R2}else{V1=V2=V;I1=V/R1;I2=V/R2}
 const ink='currentColor',dash=`stroke-dasharray="8 7"`;let s=`<style>@keyframes mv{to{stroke-dashoffset:-30}}.cur{animation:mv ${Math.max(.25,1.6/I)}s linear infinite}@media (prefers-reduced-motion:reduce){.cur{animation:none}}</style>`;
 s+=`<line x1="60" y1="40" x2="250" y2="40" stroke="${ink}" stroke-width="2.5"/><line x1="290" y1="40" x2="500" y2="40" stroke="${ink}" stroke-width="2.5"/>`+cellSym(258,40)+`<text x="270" y="22" text-anchor="middle" font-size="13" fill="currentColor" font-family="Source Sans 3,sans-serif">${V} V</text>`;
 s+=`<line x1="60" y1="40" x2="60" y2="290" stroke="${ink}" stroke-width="2.5"/><line x1="500" y1="40" x2="500" y2="290" stroke="${ink}" stroke-width="2.5"/>`;
 s+=`<circle cx="500" cy="110" r="18" fill="var(--card)" stroke="${ink}" stroke-width="2.5"/>`+T(500,116,'A','font-weight="700"');
 if(m==='s'){s+=`<line x1="60" y1="290" x2="160" y2="290" stroke="${ink}" stroke-width="2.5"/><line x1="230" y1="290" x2="320" y2="290" stroke="${ink}" stroke-width="2.5"/><line x1="390" y1="290" x2="500" y2="290" stroke="${ink}" stroke-width="2.5"/>`+resSym(160,290,70)+resSym(320,290,70)+T(195,270,'R₁ = '+R1+' Ω','font-size="13"')+T(355,270,'R₂ = '+R2+' Ω','font-size="13"');
  s+=`<path class="cur" d="M250 40 H60 V290 H500 V40 H290" fill="none" stroke="${Y}" stroke-width="4" ${dash} opacity=".9"/>`}
 else{s+=`<line x1="60" y1="290" x2="500" y2="290" stroke="${ink}" stroke-width="2.5"/><line x1="140" y1="200" x2="140" y2="290" stroke="${ink}" stroke-width="2.5"/><line x1="420" y1="200" x2="420" y2="290" stroke="${ink}" stroke-width="2.5"/><line x1="140" y1="200" x2="245" y2="200" stroke="${ink}" stroke-width="2.5"/><line x1="315" y1="200" x2="420" y2="200" stroke="${ink}" stroke-width="2.5"/>`+resSym(245,200,70)+`<rect x="242" y="280" width="76" height="20" fill="var(--card)"/>`+resSym(245,290,70)+T(280,182,'R₁ = '+R1+' Ω','font-size="13"')+T(280,322,'R₂ = '+R2+' Ω','font-size="13"');
  s+=`<path class="cur" d="M250 40 H60 V290 H140 V200 H420 V290 H500 V40 H290" fill="none" stroke="${Y}" stroke-width="${2+I1}" ${dash} opacity=".9"/><path class="cur" d="M140 290 H420" fill="none" stroke="${Y}" stroke-width="${2+I2}" ${dash} opacity=".9"/>`}
 $('#cSvg').innerHTML=s;
 $('#cOut').innerHTML=`<p><b>Total resistance:</b> ${fmt(R)} Ω ${m==='s'?'(R₁ + R₂)':'(R₁R₂ / (R₁ + R₂))'}</p><p><b>Ammeter (total current):</b> ${fmt(I)} A</p><p>R₁: ${fmt(I1)} A, ${fmt(V1)} V &nbsp;·&nbsp; R₂: ${fmt(I2)} A, ${fmt(V2)} V</p><p><b>Power from battery:</b> ${fmt(V*I)} W</p><p class="note">${m==='s'?'Series: same current in both; the voltages add up to the battery voltage.':'Parallel: same voltage across both; the currents add up to the total. Total resistance is less than either resistor.'}</p>`}
function ohmDraw(){const n=+$('#oN').value,V=n*1.5,I=V/RW;let s=`<line x1="60" y1="300" x2="490" y2="300" stroke="currentColor" stroke-width="2"/><line x1="60" y1="300" x2="60" y2="20" stroke="currentColor" stroke-width="2"/>`+T(480,325,'I (A)','font-size="13"')+T(40,20,'V (V)','font-size="13"');
 for(let k=1;k<=4;k++){s+=T(60+k*100,318,fmt(k*0.3,1),'font-size="12"')+T(40,304-k*60,String(k*1.5),'font-size="12"')}
 pts.forEach(p=>s+=`<circle cx="${60+p[1]/0.3*100}" cy="${300-p[0]/1.5*60}" r="6" fill="#7a5410"/>`);
 if(pts.length>=2){const mx=pts.reduce((a,p)=>Math.max(a,p[1]),0);s+=`<line x1="60" y1="300" x2="${60+mx/0.3*100}" y2="${300-mx*RW/1.5*60}" stroke="${Y}" stroke-width="2.5"/>`}
 $('#oSvg').innerHTML=s;
 $('#oOut').innerHTML=`<p>Voltmeter: <b>${fmt(V,1)} V</b> &nbsp; Ammeter: <b>${fmt(I,2)} A</b></p>`+(pts.length?`<table style="width:100%;font-size:14px"><tr><th align="left">V (V)</th><th align="left">I (A)</th><th align="left">V/I (Ω)</th></tr>${pts.map(p=>`<tr><td>${fmt(p[0],1)}</td><td>${fmt(p[1],2)}</td><td>${fmt(p[0]/p[1],1)}</td></tr>`).join('')}</table>`:'')+(pts.length>=3?`<p class="fb ok">V/I stays at ${RW} Ω and the graph is a straight line through the origin: Ohm's law.</p>`:'')}
function labInit(){}
function labShow(){if(tool==='circ')circDraw();else ohmDraw()}
function labClick(b){if(b.dataset.tool){tool=b.dataset.tool;$$('[data-tool]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.tool===tool));['circ','ohm'].forEach(t=>$('#t-'+t).hidden=t!==tool);labShow();return true}
 if(b.id==='oRec'){const V=+$('#oN').value*1.5;if(!pts.some(p=>p[0]===V))pts.push([V,V/RW]);pts.sort((a,c)=>a[0]-c[0]);ohmDraw();return true}
 if(b.id==='oClr'){pts=[];ohmDraw();return true}return false}
function labChange(t){if(['cV','cMode','cR1','cR2'].includes(t.id)){circDraw();return true}if(t.id==='oN'){ohmDraw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
