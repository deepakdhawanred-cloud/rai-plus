/* Rai Plus content pack: Class 10 Science, Chapter 3 – Metals and Non-metals */
RP.register({key:'10sci03',cls:'10',subject:'Science',ch:'3',title:"Metals and Non-metals",color:'#3d4f5c',
crumb:"HBSE Class 10 Science · Unit: Chemical Substances · Taught in October",h1:"Chapter 3: Metals and Non-metals",sub:"Why some elements shine, ring and conduct, how reactive they are, how we get them out of rocks and how we stop them rusting.",heroLabel:"A reactivity ladder from potassium at the top to gold at the bottom",labName:"Reactivity lab",
theme:"\n:root{--g:light-dark(#3d4f5c,#a9bfcc);--g2:light-dark(#edf1f4,#151c21);--line:light-dark(#d5dee4,#2c3a44);--bg:light-dark(#ffffff,#0e1317);--card:light-dark(#ffffff,#141b20);\n--ink:light-dark(#11181d,#e6edf1);--mute:light-dark(#53636e,#a3b3bd);--y:light-dark(#c8892b,#e8bb5a);--y2:light-dark(#fbf1df,#272010);--hd:#24323b}\n",
labHTML:`  <h2>Reactivity lab</h2>
  <p>Drop metals into salt solutions and water, and work out the reactivity series from what you see.</p>
  <div class="ftabs" role="group" aria-label="Lab tool"><button data-tool="disp" aria-pressed="true">Displacement</button><button data-tool="water" aria-pressed="false">Metals and water or acid</button></div>
  <div id="t-disp">
    <div class="sim"><div><div class="fig" style="max-width:none"><svg id="dSvg" viewBox="0 0 420 330" role="img" aria-label="Test tube with a metal strip in a salt solution" style="color:var(--ink)"></svg></div></div>
    <div><div class="ctrl"><label>Metal strip<select id="dM"><option value="Zn">Zinc</option><option value="Fe" selected>Iron</option><option value="Cu">Copper</option><option value="Mg">Magnesium</option><option value="Ag">Silver</option></select></label>
    <label>Solution<select id="dS"><option value="Cu" selected>Copper sulphate</option><option value="Fe">Iron sulphate</option><option value="Zn">Zinc sulphate</option><option value="Ag">Silver nitrate</option><option value="Al">Aluminium sulphate</option></select></label></div>
    <div class="ctrl"><button class="btn p" id="dGo">Leave for 20 minutes</button></div>
    <div class="box y" id="dOut" aria-live="polite"></div></div></div>
  </div>
  <div id="t-water" hidden>
    <div class="sim"><div><div class="fig" style="max-width:none"><svg id="wSvg" viewBox="0 0 420 330" role="img" aria-label="Metal reacting with water or acid" style="color:var(--ink)"></svg></div></div>
    <div><div class="ctrl"><label>Metal<select id="wM"><option value="K">Potassium</option><option value="Na">Sodium</option><option value="Ca">Calcium</option><option value="Mg" selected>Magnesium</option><option value="Al">Aluminium</option><option value="Zn">Zinc</option><option value="Fe">Iron</option><option value="Cu">Copper</option></select></label>
    <label>Add to<select id="wW"><option value="cold">Cold water</option><option value="hot">Hot water</option><option value="steam">Steam</option><option value="acid">Dilute hydrochloric acid</option></select></label></div>
    <div class="box y" id="wOut" aria-live="polite"></div>
    <p class="note">Simulation only. Potassium and sodium are stored under kerosene and are never handled by students.</p></div></div>
  </div>
`,
build:function(){

const ACC='#3d4f5c',LABNAME='Reactivity lab',MIND_CENTER='Metals and non-metals';
const SER=['K','Na','Ca','Mg','Al','Zn','Fe','Pb','H','Cu','Hg','Ag','Au'];
const NAME={K:'Potassium',Na:'Sodium',Ca:'Calcium',Mg:'Magnesium',Al:'Aluminium',Zn:'Zinc',Fe:'Iron',Pb:'Lead',H:'Hydrogen',Cu:'Copper',Hg:'Mercury',Ag:'Silver',Au:'Gold'};
const chip=(x,y,t,c='#edf1f4',w=110)=>`<rect x="${x-w/2}" y="${y-16}" width="${w}" height="32" rx="8" fill="${c}" stroke="#3d4f5c"/>`+T(x,y+5,t,'font-size="13"');
function heroDraw(){let s='';['K','Na','Ca','Mg','Al','Zn','Fe','Cu','Ag','Au'].forEach((e,i)=>{const w=200-i*14;s+=`<rect x="${180-w/2}" y="${8+i*11}" width="${w}" height="10" rx="2" fill="${i<4?'#e2a93b':i<7?'#a9bfcc':'#f2d27a'}" opacity="${1-i*.05}"/>`});return s+T(300,20,'most reactive','font-size="11" fill="#fff"')+T(300,112,'least reactive','font-size="11" fill="#fff"')}
const HERO=heroDraw;
const MIND=[['Physical properties',90,50],['Reactions of metals',430,50],['Reactivity series',90,150],['Ionic compounds',430,150],['Extraction and refining',90,250],['Corrosion and alloys',430,250]];

const C=[
{id:'n1',num:'3.1',title:'Physical properties of metals and non-metals',
 intro:'Why does a steel spoon ring when dropped while a piece of coal just thuds?',
 obj:'List the physical properties of metals and non-metals and state the important exceptions.',
 prior:'Elements and compounds (Class 9).',
 simple:'Metals are usually shiny (lustrous), hard, can be beaten into sheets (malleable) and drawn into wires (ductile), conduct heat and electricity, and make a ringing sound (sonorous). Non-metals are usually dull, brittle, and poor conductors. There are some important exceptions.',
 detail:'Metals in their pure state have a shining surface (metallic lustre). They are generally hard, though sodium and potassium are soft enough to cut with a knife. Metals are malleable and ductile; gold and silver are the most malleable and ductile. Metals are good conductors of heat (silver and copper are the best; lead and mercury are comparatively poor) and of electricity. They are sonorous, which is why school bells are made of metal. Metals have high melting points, except gallium and caesium, which melt on your palm; mercury is a liquid at room temperature. Non-metals are solids or gases, except bromine, which is a liquid. They are not lustrous, except iodine, and are not malleable or ductile. They are poor conductors, except graphite (a form of carbon), which conducts electricity. Diamond, another form of carbon, is the hardest natural substance known and has a very high melting and boiling point.',
 real:'Cooking pans are made of aluminium or steel because metals conduct heat well; their handles are made of plastic because plastic does not.',
 apply:'You are given two samples, one a metal and one a non-metal, that look alike. Suggest two quick tests to tell them apart.',
 see:{w:520,h:240,f:[
  ['Lustre and sonority: metals shine and ring when struck.',chip(110,50,'lustrous','#fbf1df')+chip(260,50,'sonorous','#fbf1df')],
  ['Malleable and ductile: beaten into sheets, drawn into wires.',chip(110,120,'malleable','#fbf1df')+chip(260,120,'ductile','#fbf1df')+`<line x1="340" y1="120" x2="480" y2="120" stroke="#c8892b" stroke-width="2"/>`],
  ['Good conductors of heat and electricity. Exceptions: mercury is liquid, iodine is lustrous, graphite conducts, diamond is hardest.',chip(140,190,'conductors','#fbf1df',120)+chip(300,190,'exceptions!','#fde8e6',120)]]},
 seeNote:'Exceptions are frequent exam questions.',
 do:{title:'Conduction tester',mat:'A cell, a torch bulb, three wires; samples: iron nail, copper wire, aluminium foil, pencil lead (graphite), sulphur or charcoal piece, rubber',steps:['Make a circuit with a gap between two wire ends.','Touch both ends to each sample in turn.','Record whether the bulb glows.'],obs:'Metals and graphite light the bulb; sulphur, charcoal and rubber do not.',why:'Metals have free electrons; graphite is the non-metal exception. Safety: cells only.',lab:true},
 memo:'"Metals: Shiny, Strong, Stretch, Sing and Send current."',
 miscon:['"All metals are solids." Mercury is a liquid.','"No non-metal conducts electricity." Graphite does.'],
 terms:['Lustre','Malleable','Ductile','Sonorous','Conductor','Allotrope (graphite, diamond)'],
 q:{q:'Which non-metal is a good conductor of electricity?',o:['Sulphur','Iodine','Graphite','Diamond'],a:2,why:'Graphite conducts electricity.'},
 exam:'Give-an-exception questions (liquid metal, lustrous non-metal, conducting non-metal) are 1-mark favourites.'},
{id:'n2',num:'3.2.1–3.2.2',title:'Metals with oxygen and water',
 intro:'Sodium is kept under kerosene. Why can\'t it be kept in a jar like iron nails?',
 obj:'Describe how metals react with oxygen and water, identify amphoteric oxides, and rank metals by how vigorously they react.',
 prior:'Acids, bases and salts (Ch 2).',
 simple:'Most metals burn or slowly react in air to form metal oxides, which are basic. Aluminium oxide and zinc oxide behave as both acidic and basic: they are amphoteric. Some metals react violently with cold water (sodium, potassium), some with hot water (magnesium), some only with steam (aluminium, iron, zinc) and some not at all (lead, copper, silver, gold).',
 detail:'Metal + oxygen → metal oxide. Example: 2Cu + O₂ → 2CuO (black copper oxide); 4Al + 3O₂ → 2Al₂O₃. Most metal oxides are basic and insoluble in water; some dissolve to form alkalis (Na₂O + H₂O → 2NaOH). Aluminium oxide and zinc oxide react with both acids and bases, so they are amphoteric oxides. Reactivity differs: potassium and sodium react so vigorously with air that they catch fire, so they are kept under kerosene. Magnesium burns with a dazzling white flame. Iron does not burn on heating, but iron filings burn when sprinkled in a flame. Copper does not burn but gets a black oxide coating; silver and gold do not react with oxygen even at high temperatures. With water: metal + water → metal oxide (or hydroxide) + hydrogen. Sodium and potassium react violently with cold water, and the heat makes the hydrogen catch fire. Calcium reacts less violently, and the bubbles of hydrogen stick to it, so it floats. Magnesium reacts with hot water and also floats. Aluminium, iron and zinc react only with steam, forming the metal oxide and hydrogen. Lead, copper, silver and gold do not react with water at all.',
 real:'Aluminium vessels do not corrode quickly because a thin, tough layer of aluminium oxide forms on the surface and protects the metal underneath.',
 apply:'A metal reacts with steam but not with hot or cold water. Name two metals it could be.',
 see:{w:520,h:240,f:[
  ['Sodium in cold water: violent, the hydrogen can catch fire.',chip(90,60,'Na, K','#fde8e6',90)+T(270,65,'cold water: violent','font-size="13"')],
  ['Calcium in cold water and magnesium in hot water: they float on bubbles.',chip(90,120,'Ca, Mg','#fbf1df',90)+T(270,125,'cold / hot water: steady','font-size="13"')],
  ['Aluminium, iron and zinc need steam; copper, silver and gold do not react.',chip(90,180,'Al, Fe, Zn','#edf1f4',90)+T(270,185,'steam only','font-size="13"')+chip(430,180,'Cu, Ag, Au','#e8e8e8',100)]]},
 seeNote:'Try each in the Reactivity lab.',
 do:{title:'Burning magnesium (teacher demonstration)',mat:'Magnesium ribbon, sandpaper, tongs, burner, watch glass, red and blue litmus',steps:['Clean the ribbon with sandpaper.','Hold it in the flame with tongs over a watch glass.','Dissolve the white ash in a little water and test with litmus.'],obs:'A dazzling white flame and a white powder that turns red litmus blue.',why:'Magnesium oxide is basic. Safety: do not look directly at the flame; use tongs.',lab:true},
 memo:'"K and Na go bang; Ca and Mg float; Al, Zn, Fe need steam; Cu, Ag, Au sit still."',
 miscon:['"All metal oxides are basic." Al₂O₃ and ZnO are amphoteric.','"Metals sink, so they never float." Calcium and magnesium float on hydrogen bubbles.'],
 terms:['Metal oxide','Basic oxide','Amphoteric oxide','Hydrogen gas','Kerosene storage'],
 q:{q:'Which pair of oxides is amphoteric?',o:['Na₂O and K₂O','Al₂O₃ and ZnO','CuO and MgO','CO₂ and SO₂'],a:1,why:'They react with both acids and bases.'},
 exam:'Equations for metals with water and the amphoteric oxide reaction with NaOH are common 3-mark questions.'},
{id:'n3',num:'3.2.3–3.2.5',title:'Acids, salt solutions and the reactivity series',
 intro:'Leave an iron nail in blue copper sulphate solution. Twenty minutes later the nail is brown and the solution is turning green. What happened?',
 obj:'Write equations for metals with dilute acids, explain displacement reactions, and use the reactivity series.',
 prior:'Displacement reactions (Ch 1).',
 simple:'Metals above hydrogen in the reactivity series react with dilute acids to give a salt and hydrogen gas. A more reactive metal pushes a less reactive metal out of its salt solution. Arranging metals by these results gives the reactivity series.',
 detail:'Metal + dilute acid → salt + hydrogen, for example Fe + 2HCl → FeCl₂ + H₂. Hydrogen is not given off when metals react with nitric acid, because HNO₃ is a strong oxidising agent that oxidises the hydrogen to water; only magnesium and manganese give hydrogen with very dilute nitric acid. Aqua regia (a 3 : 1 mixture of concentrated hydrochloric and nitric acids) can dissolve gold and platinum. Displacement: if metal A displaces metal B from its solution, A is more reactive. Fe + CuSO₄ → FeSO₄ + Cu: the iron gets a brown coat of copper and the blue solution turns green. The reactivity series in decreasing order is K, Na, Ca, Mg, Al, Zn, Fe, Pb, (H), Cu, Hg, Ag, Au.',
 real:'Gold and silver ornaments keep their shine for centuries because these metals sit at the bottom of the reactivity series.',
 apply:'Will copper displace silver from silver nitrate solution? Write the equation if it does.',
 see:{w:520,h:240,f:[
  ['An iron nail in blue copper sulphate solution.',`<rect x="200" y="60" width="80" height="150" rx="10" fill="#7fb0e8" opacity=".6" stroke="currentColor"/><rect x="236" y="30" width="8" height="150" fill="#8a8f96"/>`],
  ['Copper coats the nail; the solution turns pale green.',`<rect x="200" y="60" width="80" height="150" rx="10" fill="#a9d18e" opacity=".6" stroke="currentColor"/><rect x="236" y="30" width="8" height="150" fill="#b0623a"/>`+T(380,135,'Fe + CuSO₄ → FeSO₄ + Cu','font-size="13"')],
  ['Iron is more reactive than copper, so it displaces it.',T(260,232,'more reactive displaces less reactive','font-weight="700"')]]},
 seeNote:'Run every metal and solution pair in the Reactivity lab.',
 do:{title:'Displacement series',mat:'Clean strips of zinc, iron and copper; solutions of zinc sulphate, iron sulphate, copper sulphate; test tubes',steps:['Put each strip into each of the other two solutions (six tubes).','Leave for 20 minutes.','Record where a coating or colour change appears.'],obs:'Zinc displaces iron and copper; iron displaces only copper; copper displaces neither.',why:'Order of reactivity: Zn > Fe > Cu. Safety: wash hands; copper sulphate is harmful if swallowed.',lab:true},
 memo:'"Please Stop Calling Me A Zebra, I Like Her Calling Me A Smart Goat": K Na Ca Mg Al Zn Fe Pb H Cu Hg Ag Au.',
 miscon:['"All metals give hydrogen with any acid." Not with nitric acid (except Mg and Mn with very dilute HNO₃).','"Copper reacts with dilute HCl." It is below hydrogen and does not.'],
 terms:['Displacement reaction','Reactivity series','Aqua regia','Oxidising agent'],
 q:{q:'Which metal will NOT react with dilute hydrochloric acid?',o:['Zinc','Magnesium','Iron','Copper'],a:3,why:'Copper is below hydrogen in the series.'},
 exam:'Displacement and reactivity-series questions appear every year (2–3 marks).'},
{id:'n4',num:'3.3',title:'How metals and non-metals react: ionic compounds',
 intro:'Sodium is a dangerous metal and chlorine a poisonous gas. Together they make table salt. How?',
 obj:'Show electron transfer in forming NaCl and MgCl₂, and list the properties of ionic compounds.',
 prior:'Atomic structure and valency (Class 9).',
 simple:'Metals lose electrons and become positive ions; non-metals gain electrons and become negative ions. The opposite charges attract strongly: this is an ionic (electrovalent) bond. Ionic compounds are hard solids with high melting points and conduct electricity when melted or dissolved.',
 detail:'Sodium (2, 8, 1) loses one electron to become Na⁺ (2, 8); chlorine (2, 8, 7) gains one to become Cl⁻ (2, 8, 8). Both now have a complete outer shell, and the oppositely charged ions are held by strong electrostatic forces in sodium chloride. Magnesium (2, 8, 2) gives one electron each to two chlorine atoms, forming Mg²⁺ and 2Cl⁻ in MgCl₂. Properties of ionic compounds: they are solid and hard because of the strong attraction between ions, but brittle; they have high melting and boiling points because a lot of energy is needed to overcome the attractions; they are generally soluble in water and insoluble in solvents such as kerosene and petrol; and they conduct electricity in the molten state or in solution, when their ions can move, but not as solids.',
 real:'Salt from the kitchen does not conduct electricity as dry crystals, but salty water does, which is why wet hands near switches are dangerous.',
 apply:'Show the formation of Na₂O by the transfer of electrons.',
 see:{w:520,h:240,f:[
  ['Sodium has 1 outer electron; chlorine has 7.',chip(140,60,'Na  2, 8, 1','#fbf1df',130)+chip(380,60,'Cl  2, 8, 7','#e6f2e0',130)],
  ['Sodium gives its electron to chlorine.',`<path d="M200 90 C 260 120 300 120 340 90" fill="none" stroke="#c8892b" stroke-width="2.5"/><circle cx="270" cy="113" r="6" fill="#c8892b"/>`],
  ['Na⁺ and Cl⁻ attract each other: an ionic bond in NaCl.',chip(140,180,'Na⁺  2, 8','#fbf1df',130)+chip(380,180,'Cl⁻  2, 8, 8','#e6f2e0',130)+T(260,230,'[Na]⁺ [Cl]⁻','font-weight="700"')]]},
 seeNote:'Only outer electrons are drawn in the exam answer.',
 do:{title:'Does salt conduct?',mat:'Conduction tester (cell, bulb, wires, two carbon rods), dry salt crystals, distilled water, salt water',steps:['Put the rods into dry salt; observe the bulb.','Then into distilled water.','Then into salt water.'],obs:'The bulb glows only in salt water.',why:'Ions can move only in solution or when molten.',lab:true},
 memo:'"Metals lose, non-metals gain; opposite ions stick."',
 miscon:['"Solid salt conducts." Its ions are fixed; it conducts only molten or dissolved.','"Ionic bonds share electrons." They transfer electrons.'],
 terms:['Cation','Anion','Ionic (electrovalent) bond','Electron transfer'],
 q:{q:'Ionic compounds conduct electricity:',o:['As solids','In molten state or in solution','Never','Only in kerosene'],a:1,why:'Ions must be free to move.'},
 exam:'Electron-dot formation of NaCl, MgCl₂, Na₂O, MgO and the properties list are standard 3–5 mark questions.'},
{id:'n5',num:'3.4',title:'Occurrence and extraction of metals',
 intro:'Iron is not dug out as shiny iron. It comes out of the ground as a red-brown rock. How do we get the metal?',
 obj:'Define minerals, ores and gangue, and describe extraction of metals of low, middle and high reactivity.',
 prior:'Reactivity series (3.2); oxidation and reduction (Ch 1).',
 simple:'Metals are found in the Earth as minerals; minerals from which a metal can be extracted profitably are ores. First the earthy impurities (gangue) are removed. Then the method depends on reactivity: heating alone for metals at the bottom, carbon reduction for those in the middle, and electrolysis for those at the top.',
 detail:'Gold, silver, platinum and copper can be found free; most metals occur as oxides, sulphides or carbonates. Steps: (1) enrichment of the ore to remove gangue. (2) Low reactivity: heating alone, e.g. cinnabar (HgS) is roasted to HgO, which on further heating gives mercury. (3) Middle reactivity (Zn, Fe, Pb, Cu): sulphide ores are roasted (heated strongly in excess air) and carbonate ores are calcinated (heated strongly in limited air) to give oxides, which are reduced with carbon: ZnO + C → Zn + CO. Highly reactive metals can also act as reducing agents: the thermit reaction, Fe₂O₃ + 2Al → 2Fe + Al₂O₃ + heat, gives molten iron used to join railway tracks. (4) High reactivity (Na, Mg, Ca, Al): carbon cannot reduce their oxides, so they are obtained by electrolytic reduction of their molten chlorides or oxides; the metal is deposited at the cathode.',
 real:'Railway track joints are welded with molten iron from the thermit reaction.',
 apply:'Why can\'t sodium be obtained by heating sodium oxide with carbon?',
 see:{w:520,h:240,f:[
  ['Top of the series (K to Al): electrolysis of molten compounds.',chip(130,50,'K Na Ca Mg Al','#fde8e6',170)+T(380,55,'electrolysis','font-size="13"')],
  ['Middle (Zn, Fe, Pb, Cu): roast or calcine, then reduce with carbon.',chip(130,120,'Zn Fe Pb Cu','#fbf1df',170)+T(380,125,'carbon reduction','font-size="13"')],
  ['Bottom (Hg, Ag, Au): heat alone, or found free.',chip(130,190,'Hg Ag Au','#e8e8e8',170)+T(380,195,'heat alone / found free','font-size="13"')]]},
 seeNote:'See the step-by-step chooser in the Visuals tab.',
 do:{title:'Ore detective (chart activity)',mat:'Chart paper, list of ores: cinnabar, zinc blende, calamine, haematite, bauxite, rock salt',steps:['Write the metal and compound in each ore.','Place each on the reactivity series.','Write the extraction method next to it.'],obs:'Cinnabar → heating; zinc blende → roasting + carbon; bauxite and rock salt → electrolysis.',why:'Method follows reactivity.',lab:false},
 memo:'"Top: zap it (electrolysis). Middle: roast and reduce. Bottom: just heat."',
 miscon:['"All metals are reduced with carbon." Highly reactive metals need electrolysis.','"Roasting and calcination are the same." Roasting is in excess air (sulphides); calcination is in limited air (carbonates).'],
 terms:['Mineral','Ore','Gangue','Roasting','Calcination','Reduction','Thermit reaction','Electrolytic reduction'],
 q:{q:'Calcination is used for:',o:['Sulphide ores','Carbonate ores','Chloride ores','Pure metals'],a:1,why:'Carbonates are heated in limited air.'},
 exam:'Roasting vs calcination with equations, and the thermit reaction, are frequent 3-mark questions.'},
{id:'n6',num:'3.4.4',title:'Refining of metals',
 intro:'Copper from a furnace is not pure enough for electrical wires. How is it purified?',
 obj:'Describe electrolytic refining of copper and identify the anode, cathode, electrolyte and anode mud.',
 prior:'Extraction (3.4).',
 simple:'In electrolytic refining, a thick block of impure metal is the positive electrode (anode) and a thin strip of pure metal is the negative electrode (cathode). The solution contains a salt of the same metal. When current passes, pure metal moves from the anode to the cathode, and impurities fall to the bottom as anode mud.',
 detail:'Many metals, including copper, zinc, tin, nickel, silver and gold, are refined electrolytically. For copper: the anode is impure copper, the cathode is a thin strip of pure copper, and the electrolyte is acidified copper sulphate solution. On passing current, the impure metal from the anode dissolves into the electrolyte, and an equivalent amount of pure metal from the electrolyte is deposited on the cathode. Soluble impurities go into the solution, while insoluble impurities settle at the bottom of the anode and are called anode mud.',
 real:'The copper in the wires of your house is about 99.9% pure, refined by electrolysis.',
 apply:'In refining silver, what would you use as the anode, cathode and electrolyte?',
 see:{w:520,h:240,f:[
  ['Impure copper anode (+) and pure copper cathode (–) in copper sulphate.',`<rect x="140" y="80" width="240" height="140" rx="8" fill="#7fb0e8" opacity=".45" stroke="currentColor"/><rect x="170" y="50" width="34" height="150" fill="#9a6a45"/><rect x="320" y="50" width="12" height="150" fill="#d0763f"/>`+T(187,40,'+ anode','font-size="12"')+T(326,40,'– cathode','font-size="12"')],
  ['Copper moves from anode to cathode; the cathode grows.',`<path d="M210 120 H312" stroke="#c8892b" stroke-width="2.5" marker-end="url(#a)"/><rect x="318" y="50" width="18" height="150" fill="#d0763f"/>`],
  ['Insoluble impurities collect below the anode as anode mud.',`<ellipse cx="187" cy="212" rx="30" ry="6" fill="#5a4a3a"/>`+T(187,236,'anode mud','font-size="12"')]]},
 seeNote:'Watch it as an animation in the Visuals tab.',
 do:{title:'Copper plating (teacher demonstration)',mat:'Copper sulphate solution, a copper strip, a clean iron key, 2 cells, wires, beaker',steps:['Connect the copper strip to + and the key to –.','Dip both into copper sulphate and pass current for 10 minutes.','Remove and examine the key.'],obs:'The key gets a pink-brown coating of copper.',why:'Copper ions are deposited at the cathode, the same process as refining.',lab:true},
 memo:'"Impure to plus, pure to minus, mud falls down."',
 miscon:['"Impure copper is the cathode." It is the anode.','"Anode mud is copper." It is the insoluble impurities.'],
 terms:['Electrolytic refining','Anode','Cathode','Electrolyte','Anode mud'],
 q:{q:'In electrolytic refining of copper, the cathode is:',o:['Impure copper','Pure copper','Carbon','Zinc'],a:1,why:'Pure copper deposits on the pure copper cathode.'},
 exam:'A labelled diagram of electrolytic refining is a common 3-mark question.'},
{id:'n7',num:'3.5',title:'Corrosion and alloys',
 intro:'An iron gate rusts in two monsoons, yet the Iron Pillar in Delhi has stood for over 1600 years.',
 obj:'State the conditions for rusting, list methods of preventing corrosion, and name common alloys and their uses.',
 prior:'Oxidation (Ch 1).',
 simple:'Iron rusts when it is in contact with both air and water. Rusting can be prevented by painting, oiling, greasing, galvanising (coating with zinc), chrome plating, anodising and making alloys. An alloy is a uniform mixture of a metal with other metals or a non-metal.',
 detail:'Corrosion: silver turns black (silver sulphide) in air, copper gains a green coat (basic copper carbonate), and iron gets a brown flaky coating of rust. The NCERT activity uses three test tubes of clean iron nails: A with ordinary water open to air; B with boiled distilled water and a layer of oil (no air); C with anhydrous calcium chloride (no moisture). Only the nails in A rust, showing that both air and water are needed. Prevention: painting, oiling, greasing, galvanising, chrome plating, anodising, or making alloys. Galvanised iron stays protected even if the zinc coating is broken, because zinc is more reactive. Alloys are homogeneous mixtures: iron with a little carbon becomes hard and strong; stainless steel is iron with nickel and chromium; brass is copper and zinc; bronze is copper and tin; solder is lead and tin, with a low melting point for welding wires; an amalgam is an alloy containing mercury. Pure gold (24 carat) is very soft, so ornaments use 22 carat gold, alloyed with silver or copper. The electrical conductivity and melting point of an alloy are lower than those of pure metals.',
 real:'Steel water tanks and electricity poles are galvanised, which is why they stay grey and not rusty-brown for years.',
 apply:'Why is solder used for joining electrical wires, rather than pure lead or pure tin?',
 see:{w:520,h:240,f:[
  ['Tube A: water and air → the nail rusts.',`<rect x="70" y="60" width="60" height="140" rx="10" fill="#7fb0e8" opacity=".35" stroke="currentColor"/><rect x="96" y="40" width="8" height="140" fill="#a0522d"/>`+T(100,225,'A: rusts','font-size="12"')],
  ['Tube B: boiled water under oil (no air) → no rust.',`<rect x="230" y="60" width="60" height="140" rx="10" fill="#7fb0e8" opacity=".35" stroke="currentColor"/><rect x="230" y="60" width="60" height="16" fill="#e2c56a"/><rect x="256" y="40" width="8" height="140" fill="#8a8f96"/>`+T(260,225,'B: no rust','font-size="12"')],
  ['Tube C: dry calcium chloride (no water) → no rust.',`<rect x="390" y="60" width="60" height="140" rx="10" fill="none" stroke="currentColor"/><rect x="392" y="150" width="56" height="48" fill="#e8e8e8"/><rect x="416" y="40" width="8" height="140" fill="#8a8f96"/>`+T(420,225,'C: no rust','font-size="12"')]]},
 seeNote:'The NCERT rusting activity.',
 do:{title:'The three-tube rusting test',mat:'Three test tubes, clean iron nails, tap water, boiled distilled water, a little oil, anhydrous calcium chloride, corks',steps:['Tube A: nail in tap water, open.','Tube B: nail in boiled distilled water, cover with a layer of oil, cork it.','Tube C: nail with anhydrous calcium chloride, cork it.','Leave for a few days and compare.'],obs:'Only the nail in tube A rusts.',why:'Rusting needs both air (oxygen) and water.',lab:true},
 memo:'"Rust needs Air AND Water; take away one and it stops."',
 miscon:['"Iron rusts in water alone." It needs air too.','"Alloys are compounds." They are mixtures.'],
 terms:['Corrosion','Rusting','Galvanisation','Anodising','Alloy','Amalgam','Carat'],
 q:{q:'Brass is an alloy of:',o:['Copper and tin','Copper and zinc','Lead and tin','Iron and carbon'],a:1,why:'Brass = copper + zinc.'},
 exam:'Rusting conditions (with the three-tube diagram) and alloy compositions are asked every year.'}
];

const CARDS=[['Lustre','Shiny surface of a metal.'],['Malleable','Can be beaten into thin sheets (gold, silver best).'],['Ductile','Can be drawn into wires.'],['Sonorous','Makes a ringing sound when struck.'],['Exceptions','Hg liquid metal; Na, K soft; I lustrous; graphite conducts; diamond hardest.'],['Amphoteric oxide','Reacts with acids and bases: Al₂O₃, ZnO.'],['Na and K storage','Kept under kerosene because they catch fire in air.'],['Metals + water','K, Na cold (violent); Ca cold; Mg hot; Al, Fe, Zn steam; Pb, Cu, Ag, Au none.'],['Metal + dilute acid','Salt + hydrogen (not with HNO₃, except Mg and Mn with very dilute).'],['Aqua regia','3 parts conc. HCl : 1 part conc. HNO₃; dissolves gold.'],['Reactivity series','K Na Ca Mg Al Zn Fe Pb (H) Cu Hg Ag Au.'],['Ionic bond','Transfer of electrons; Na⁺Cl⁻; strong attraction.'],['Ionic compounds','Hard, brittle, high melting point, soluble in water, conduct when molten or dissolved.'],['Ore and gangue','Ore: mineral worth extracting; gangue: earthy impurities.'],['Roasting vs calcination','Roasting: sulphide ore in excess air; calcination: carbonate ore in limited air.'],['Thermit reaction','Fe₂O₃ + 2Al → 2Fe + Al₂O₃ + heat; welds rail tracks.'],['Electrolytic refining','Impure metal anode, pure metal cathode, salt solution; anode mud.'],['Rusting','Needs both air and water.'],['Galvanisation','Coating iron with zinc.'],['Common alloys','Brass Cu+Zn; bronze Cu+Sn; solder Pb+Sn; stainless steel Fe+Ni+Cr.']];

const Q=[
 {lv:1,q:'Which metal is a liquid at room temperature?',o:['Gallium','Mercury','Sodium','Bromine'],a:1,w:'Mercury (bromine is a liquid non-metal).'},
 {lv:1,q:'The most malleable metals are:',o:['Iron and copper','Gold and silver','Sodium and potassium','Lead and tin'],a:1,w:'Gold and silver.'},
 {lv:1,q:'True or false: sodium is stored under kerosene.',o:['True','False'],a:0,w:'It reacts vigorously with air and water.'},
 {lv:1,q:'Galvanisation is coating iron with:',o:['Tin','Zinc','Chromium','Copper'],a:1,w:'Zinc.'},
 {lv:1,q:'Solder is an alloy of:',o:['Lead and tin','Copper and zinc','Copper and tin','Iron and nickel'],a:0,w:'Pb + Sn, low melting point.'},
 {lv:2,q:'Which metal reacts with steam but not with hot water?',o:['Sodium','Magnesium','Iron','Copper'],a:2,w:'Al, Fe and Zn react only with steam.'},
 {lv:2,q:'Hydrogen is not given off when most metals react with nitric acid because:',o:['Nitric acid is weak','HNO₃ is an oxidising agent that oxidises H₂ to water','Metals do not react with it','Nitrogen is given off instead of all products'],a:1,w:'HNO₃ oxidises the hydrogen produced.'},
 {lv:2,q:'Ionic compounds have high melting points because:',o:['They are soft','Strong attractive forces between ions need much energy to break','They contain water','They are gases'],a:1,w:'Strong electrostatic attraction.'},
 {lv:3,q:'An iron nail is placed in copper sulphate solution. After some time:',o:['Nothing happens','The nail turns brown and the solution turns green','The solution turns red','The nail dissolves completely at once'],a:1,w:'Fe displaces Cu: Fe + CuSO₄ → FeSO₄ + Cu.'},
 {lv:3,q:'Which method is used to obtain aluminium from its ore?',o:['Heating alone','Reduction with carbon','Electrolytic reduction','Roasting'],a:2,w:'Aluminium is too reactive to be reduced by carbon.'},
 {lv:3,q:'In the three-tube experiment, the nail does NOT rust in boiled distilled water under oil because:',o:['There is no water','There is no air','There is too much heat','Oil is acidic'],a:1,w:'Boiling removes dissolved air, and oil keeps air out.'},
 {lv:4,q:'Assertion (A): Galvanised iron is protected even if the zinc coating is scratched. Reason (R): Zinc is more reactive than iron.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'Zinc corrodes first, protecting the iron.'},
 {lv:4,q:'Metal X displaces copper from CuSO₄ but not iron from FeSO₄. X could be:',o:['Zinc','Lead','Magnesium','Silver'],a:1,w:'Pb lies between Fe and Cu.'},
 {lv:4,q:'Why are 22 carat gold ornaments preferred to 24 carat?',o:['24 carat is impure','Pure gold is very soft; alloying makes it harder','22 carat is shinier','24 carat rusts'],a:1,w:'Alloying with copper or silver hardens it.'},
 {lv:5,open:true,m:3,q:'Show the formation of MgCl₂ by the transfer of electrons. Name the ions present.',ans:['Mg (2, 8, 2) loses 2 electrons → Mg²⁺ (1).','Each of two Cl atoms (2, 8, 7) gains 1 electron → 2Cl⁻ (1).','Correct electron-dot diagram; ions Mg²⁺ and Cl⁻ (1).']},
 {lv:5,open:true,m:3,q:'Differentiate between roasting and calcination with one equation each.',ans:['Roasting: heating sulphide ore strongly in excess air (1).','2ZnS + 3O₂ → 2ZnO + 2SO₂ (0.5).','Calcination: heating carbonate ore strongly in limited air (1).','ZnCO₃ → ZnO + CO₂ (0.5).']},
 {lv:5,open:true,m:5,q:'Describe electrolytic refining of copper with a labelled diagram.',ans:['Anode: impure copper; cathode: thin strip of pure copper (1).','Electrolyte: acidified copper sulphate solution (1).','On passing current, copper dissolves from the anode and deposits on the cathode (1).','Soluble impurities go into solution; insoluble ones form anode mud (1).','Labelled diagram (1).']},
 {lv:5,open:true,m:3,q:'What are the conditions for rusting? Describe an activity to show them.',ans:['Both air (oxygen) and water/moisture are needed (1).','Three tubes: A tap water open; B boiled water + oil; C anhydrous CaCl₂ (1).','Only A rusts, showing both are required (1).']}
];

const ONEMIN=['Metals: lustrous, malleable, ductile, sonorous, good conductors, high melting points.','Exceptions: Hg liquid; Na, K soft; Ga, Cs melt in the hand; I lustrous; graphite conducts; diamond hardest.','Metal oxides are basic; Al₂O₃ and ZnO are amphoteric.','Water: K, Na violent; Ca, Mg (hot) float; Al, Fe, Zn steam; Pb, Cu, Ag, Au none.','Dilute acid → salt + H₂ (not HNO₃ except Mg, Mn).','More reactive metal displaces a less reactive one: Fe + CuSO₄ → FeSO₄ + Cu.','Series: K Na Ca Mg Al Zn Fe Pb (H) Cu Hg Ag Au.','Ionic bond: electron transfer; conduct only molten or dissolved.','Extraction: electrolysis (top), roast/calcine + carbon (middle), heat (bottom); thermit for rails.','Refining: impure anode, pure cathode, anode mud.','Rusting needs air + water; prevent by paint, oil, galvanising, alloys.','Brass Cu+Zn; bronze Cu+Sn; solder Pb+Sn; 22 carat gold.'];
const KEYS=[['malleable / ductile',/mallea|ductil/i],['conductor',/conduct/i],['exceptions (Hg, graphite…)',/mercury|graphite|iodine|diamond/i],['amphoteric oxide',/amphoter/i],['metal + water',/water|steam/i],['hydrogen gas',/hydrogen|h2|h₂/i],['displacement',/displac/i],['reactivity series',/reactiv/i],['ionic bond',/ionic|ion|electrovalen/i],['ore / gangue',/ore|gangue/i],['roasting / calcination',/roast|calcin/i],['thermit',/thermit/i],['electrolytic refining',/refin|anode|cathode/i],['rusting needs air and water',/rust/i],['galvanising',/galvan/i],['alloys',/alloy|brass|bronze|solder/i]];

/* ---------- lab ---------- */
let tool='disp',dDone=false;
const SOL={Cu:['Copper sulphate','CuSO₄','#6fa8e0','blue'],Fe:['Iron sulphate','FeSO₄','#a8cf8e','pale green'],Zn:['Zinc sulphate','ZnSO₄','#eef2f4','colourless'],Ag:['Silver nitrate','AgNO₃','#f2f4f6','colourless'],Al:['Aluminium sulphate','Al₂(SO₄)₃','#eef2f4','colourless']};
const MET={Zn:['#9ca8b2','zinc'],Fe:['#8a8f96','iron'],Cu:['#c46a3a','copper'],Mg:['#c9ced3','magnesium'],Ag:['#d9dde0','silver']};
const PROD={Zn:'ZnSO₄',Fe:'FeSO₄',Mg:'MgSO₄',Cu:'Cu(NO₃)₂'};
function rank(e){return SER.indexOf(e)}
function dDraw(){const m=$('#dM').value,so=$('#dS').value,react=m!==so&&rank(m)<rank(so),done=dDone&&react;const sol=SOL[so];
 let col=sol[2];if(done){col=m==='Fe'?'#a8cf8e':m==='Cu'?'#7fb0e8':'#eef2f4'}const coat=done?(so==='Cu'?'#b0623a':so==='Ag'?'#e8eaec':so==='Fe'?'#4a4a4a':'#9ca8b2'):MET[m][0];
 let s=`<rect x="150" y="70" width="110" height="230" rx="16" fill="${col}" opacity=".75"/><rect x="150" y="20" width="110" height="280" rx="16" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="196" y="10" width="18" height="250" rx="3" fill="${MET[m][0]}"/><rect x="196" y="90" width="18" height="170" rx="3" fill="${coat}"/>`;
 if(done&&so==='Ag')for(let i=0;i<14;i++)s+=`<path d="M${200+(i%2?8:-6)} ${100+i*11} l${i%2?10:-10} -4" stroke="#f4f6f8" stroke-width="3"/>`;
 s+=T(205,320,`${MET[m][1]} in ${sol[0].toLowerCase()}`,'font-size="13"');$('#dSvg').innerHTML=s;
 let msg;if(!dDone)msg=`<p>Starting colour: <b>${sol[3]}</b>. Leave it to see what happens.</p>`;
 else if(m===so)msg=`<p class="fb no">Same metal as in the solution: no displacement.</p>`;
 else if(react){const eq=so==='Ag'?(m==='Cu'?'Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag':`${m} + 2AgNO₃ → ${m}(NO₃)₂ + 2Ag`):(so==='Al'?'3Mg + Al₂(SO₄)₃ → 3MgSO₄ + 2Al':`${m} + ${sol[1]} → ${PROD[m]||m+'SO₄'} + ${so}`);msg=`<p class="fb ok">Reaction! ${NAME[m]} is more reactive than ${NAME[so].toLowerCase()}, so it displaces it. A coating of ${NAME[so].toLowerCase()} forms on the strip${so==='Cu'?' and the blue colour fades':''}.</p><p><b>${eq}</b></p>`}
 else msg=`<p class="fb no">No change. ${NAME[m]} is less reactive than ${NAME[so].toLowerCase()}, so it cannot displace it.</p>`;
 $('#dOut').innerHTML=msg+`<p class="note">Order: ${SER.filter(x=>['Mg','Al','Zn','Fe','Cu','Ag'].includes(x)).join(' > ')}</p>`}
const WR={K:{cold:3,hot:3,steam:3,acid:3},Na:{cold:3,hot:3,steam:3,acid:3},Ca:{cold:2,hot:2,steam:2,acid:3},Mg:{cold:0,hot:1,steam:2,acid:2},Al:{cold:0,hot:0,steam:1,acid:1},Zn:{cold:0,hot:0,steam:1,acid:1},Fe:{cold:0,hot:0,steam:1,acid:1},Cu:{cold:0,hot:0,steam:0,acid:0}};
function wDraw(){const m=$('#wM').value,w=$('#wW').value;let lvl=WR[m][w];const acid=w==='acid';
 let s=`<rect x="130" y="80" width="160" height="220" rx="18" fill="${acid?'#f3e2c4':'#9cc8ef'}" opacity=".55"/><rect x="130" y="30" width="160" height="270" rx="18" fill="none" stroke="currentColor" stroke-width="2.5"/>`;
 const fl=(['K','Na'].includes(m)||((m==='Ca'||m==='Mg')&&lvl>0))&&!acid;const my=fl?92:270;s+=`<rect x="190" y="${my}" width="40" height="18" rx="4" fill="#c9ced3"/>`;
 for(let i=0;i<lvl*7;i++)s+=`<circle cx="${165+((i*37)%95)}" cy="${110+((i*53)%170)}" r="${3+lvl}" fill="none" stroke="#3d4f5c" stroke-width="1.5"/>`;
 if(lvl===3&&!acid&&(m==='K'||m==='Na'))s+=`<path d="M200 70 q10 -30 20 0 q10 -40 20 0 z" fill="#c64a2a" opacity=".85"/>`;
 if(w==='steam')s+=`<path d="M150 20 q10 -14 0 -28 M200 20 q10 -14 0 -28 M250 20 q10 -14 0 -28" stroke="#9cc8ef" stroke-width="3" fill="none"/>`;
 $('#wSvg').innerHTML=s;
 const words=['No reaction.','Slow reaction: a few bubbles of hydrogen.','Steady reaction: lots of hydrogen bubbles.','Violent reaction: the hydrogen catches fire!'];
 let note='';if(!acid){if(lvl>0)note=w==='steam'&&['Al','Zn','Fe'].includes(m)?`Metal oxide + hydrogen, e.g. 3Fe + 4H₂O → Fe₃O₄ + 4H₂.`:`Metal hydroxide + hydrogen, e.g. 2Na + 2H₂O → 2NaOH + H₂.`+(fl&&(m==='Ca'||m==='Mg')?' The metal floats because hydrogen bubbles stick to it.':fl?' Sodium and potassium are lighter than water, so they float and dart about.':'')}else if(lvl>0)note=`Salt + hydrogen, e.g. Mg + 2HCl → MgCl₂ + H₂.`;else note='Copper is below hydrogen in the reactivity series.';
 if(acid&&(m==='K'||m==='Na'))note='Explosively violent: never done in a school lab.';
 $('#wOut').innerHTML=`<p><b>${words[lvl]}</b></p><p>${note}</p>`}
function labInit(){}
function labShow(){if(tool==='disp')dDraw();else wDraw()}
function labClick(b){if(b.dataset.tool){tool=b.dataset.tool;$$('[data-tool]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.tool===tool));['disp','water'].forEach(t=>$('#t-'+t).hidden=t!==tool);labShow();return true}
 if(b.id==='dGo'){dDone=true;dDraw();return true}return false}
function labChange(t){if(t.id==='dM'||t.id==='dS'){dDone=false;dDraw();return true}if(t.id==='wM'||t.id==='wW'){wDraw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
