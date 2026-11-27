/* Rai Plus content pack: Class 8 Science (Curiosity), Chapter 4 – Electricity: Magnetic and Heating Effects. */
RP.register({key:'8sci04',cls:'8',subject:'Science',ch:'4',title:"Electricity: Magnetic and Heating Effects",color:'#6a4fb3',
crumb:"Class 8 Science · Curiosity",h1:"Chapter 4: Electricity — Magnetic and Heating Effects",sub:"Electric circuits recap, the heating effect and its uses, fuses and MCBs, Oersted's discovery, electromagnets and what makes them stronger, their uses, and electrical safety.",heroLabel:"A coil of wire around an iron nail",labName:'Electromagnet and heating lab',
theme:"\n:root{--g:light-dark(#6a4fb3,#c3b3ef);--g2:light-dark(#f1edfb,#120d20);--line:light-dark(#ddd4f4,#2f2650);--bg:light-dark(#ffffff,#0c0916);--card:light-dark(#ffffff,#130f20);\n--ink:light-dark(#1b1430,#ebe6f8);--mute:light-dark(#5a5078,#bcb2d8);--y:light-dark(#b04a1f,#f2a77f);--y2:light-dark(#fbefe9,#21110a);--hd:#52398f}\n",
labHTML:`  <h2>Electromagnet and heating lab</h2>
  <p>Electromagnet mode: wind wire around a core and connect cells. See how many pins it lifts. Heating mode: pass current through a wire and watch it warm, glow — or melt like a fuse.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="eSvg" viewBox="0 0 460 320" role="img" aria-label="Electromagnet" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mode<select id="eM"><option value="m">Electromagnet</option><option value="h">Heating effect</option></select></label></div>
  <div class="ctrl"><label>Cells: <b id="eCv"></b><input type="range" class="eS" id="eC" min="0" max="4" value="1"></label></div>
  <div class="ctrl" id="eMag"><label>Turns of wire: <b id="eNv"></b><input type="range" class="eS" id="eN" min="10" max="60" step="10" value="20"></label> <label>Core<select id="eK"><option value="iron">Iron nail</option><option value="none">No core (air)</option><option value="wood">Wooden pencil</option></select></label></div>
  <div class="ctrl" id="eHeat" style="display:none"><label>Wire<select id="eW"><option value="nichrome">Nichrome (heater wire)</option><option value="copper">Thick copper</option><option value="fuse">Thin fuse wire</option></select></label></div>
  <div class="ctrl"><label><input type="checkbox" id="eSw" checked> Switch ON</label></div>
  <div class="box y" id="eOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#6a4fb3',LABNAME='Electromagnet and heating lab',MIND_CENTER='Effects of current';
const PU='#6a4fb3',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',GR='#888780',CU='#b87333',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
const cell=(x,y)=>`<line x1="${x}" y1="${y-14}" x2="${x}" y2="${y+14}" stroke="${ink}" stroke-width="2.5"/><line x1="${x+8}" y1="${y-8}" x2="${x+8}" y2="${y+8}" stroke="${ink}" stroke-width="5"/>`;
const compass=(x,y,ang,r=18)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${ink}" stroke-width="1.5"/><g transform="rotate(${ang} ${x} ${y})"><path d="M${x} ${y-r+3} L${x+4} ${y} L${x-4} ${y}Z" fill="${OR}"/><path d="M${x} ${y+r-3} L${x+4} ${y} L${x-4} ${y}Z" fill="${GR}"/></g>`;
function coil(x0,y0,len,n,c=CU){let s='';const k=Math.max(4,Math.min(16,n/3));for(let i=0;i<k;i++){const x=x0+i*len/k;s+=`<ellipse cx="${x+len/k/2}" cy="${y0}" rx="${len/k/2}" ry="16" fill="none" stroke="${c}" stroke-width="2.5"/>`}return s}
function heroDraw(){return `<rect x="110" y="72" width="170" height="16" rx="3" fill="none" stroke="#fff" stroke-width="2"/>`+[0,1,2,3,4,5,6,7].map(k=>`<ellipse cx="${125+k*20}" cy="80" rx="10" ry="18" fill="none" stroke="#fff" stroke-width="2.5"/>`).join('')}
const HERO=heroDraw;
const MIND=[['Circuits recap',100,50],['Heating effect',420,50],['Fuses & MCBs',90,150],['Magnetic effect',430,150],['Electromagnets',110,250],['Uses & safety',410,250]];

const C=[
{id:'e1',num:'4.1',title:'Electric circuits: a quick recap',
 intro:'Why does a torch bulb glow only when the switch is pressed?',
 obj:'Recall closed and open circuits, symbols, conductors and insulators.',
 prior:'Class 6–7: electric circuits, cells, conductors.',
 simple:'Current flows only in a closed (complete) circuit — from the positive terminal of a cell, through wires and devices, back to the negative terminal. A switch opens or closes the circuit. Conductors (copper, aluminium) let current flow; insulators (plastic, rubber) do not. A battery is two or more cells joined.',
 detail:'Circuit symbols: cell (long line +, short line −), battery, switch, bulb, wire. Electric current is the flow of electric charge; when it flows, it produces effects — heating, magnetic and chemical. This chapter studies the heating and magnetic effects.',
 real:'House wiring has copper wires covered in PVC insulation.',
 apply:'Draw a circuit with a battery of two cells, a switch and a bulb using symbols.',
 see:{w:520,h:220,f:[
  ['Cell, switch, bulb.',cell(80,110)+`<circle cx="400" cy="110" r="16" fill="none" stroke="${ink}" stroke-width="2"/><path d="M389 99 L411 121 M411 99 L389 121" stroke="${ink}" stroke-width="1.5"/>`+lbl(85,150,'cell')+lbl(400,150,'bulb')],
  ['Wires complete the loop.',`<path d="M80 96 V40 H400 V94 M400 126 V180 H250 M210 180 H88 V124" fill="none" stroke="${ink}" stroke-width="2"/><circle cx="210" cy="180" r="3" fill="${ink}"/><circle cx="250" cy="180" r="3" fill="${ink}"/><line x1="210" y1="180" x2="245" y2="165" stroke="${ink}" stroke-width="2"/>`+lbl(230,205,'switch (open)')],
  ['Closed switch → current flows.',`<line x1="210" y1="180" x2="250" y2="180" stroke="${OR}" stroke-width="3"/><circle cx="400" cy="110" r="22" fill="#ffd34d" opacity=".5"/>`+lbl(240,25,'closed circuit: current flows','fill="'+OR+'" font-weight="700"')]]},
 seeNote:'A complete loop is needed.',
 do:{title:'Tester',mat:'Cell, bulb, wires, objects',steps:['Make a circuit with a gap.','Test objects across the gap.'],obs:'Metals light the bulb.',why:'Conductors.',lab:false},
 memo:'"No loop, no flow."',
 miscon:['"Current gets used up in the bulb." The same current flows all round the loop.'],
 terms:['Electric current · विद्युत धारा','Circuit · परिपथ','Conductor · चालक','Insulator · विद्युतरोधी','Switch · स्विच'],
 q:{q:'Current flows only when the circuit is:',o:['open','closed','broken','insulated'],a:1,why:'Complete loop.'},
 exam:'Circuit diagrams: 2 marks.'},

{id:'e2',num:'4.2',title:'The heating effect of current',
 intro:'Why does the coil of an electric heater glow red, while the wires to the plug stay cool?',
 obj:'Explain the heating effect and name its uses.',
 prior:'4.1.',
 simple:'When current flows through a wire, the wire gets hot — the heating effect of electric current. Wires made of nichrome (an alloy) heat up a lot and are used as heating elements in heaters, irons, kettles, toasters and geysers. Copper wires heat up very little, so they are used for connecting wires.',
 detail:'The heat produced depends on the material, the length and thickness of the wire, the current, and the time for which it flows: more current → much more heat. In a filament bulb, a tungsten filament gets so hot it glows; most energy is wasted as heat, which is why LEDs (which stay cool) save electricity. Unwanted heating happens in overloaded wires and can cause fires.',
 real:'An electric iron uses a nichrome element; a geyser heats water with a heating element.',
 apply:'Why are LED bulbs more energy-efficient than filament bulbs?',
 see:{w:520,h:220,f:[
  ['Current through a wire…',cell(60,110)+`<path d="M60 96 V50 H460 V170 H68 V124" fill="none" stroke="${ink}" stroke-width="2"/>`],
  ['…heats a nichrome coil.',coil(220,50,120,30,OR)+lbl(280,90,'nichrome: hot!','fill="'+OR+'" font-weight="700"')],
  ['Uses.',lbl(260,140,'heater · iron · kettle · toaster · geyser','font-size="14"')+lbl(400,195,'copper leads stay cool','fill="'+CU+'"')]]},
 seeNote:'Some wires heat more than others.',
 do:{title:'Warm wire',mat:'Cell, thin wire, switch (teacher demo)',steps:['Pass current for a few seconds.','Carefully feel the wire near the end.'],obs:'It gets warm.',why:'Heating effect.',lab:true},
 memo:'"Nichrome for heat, copper for connections."',
 miscon:['"Only special appliances get hot." Every wire heats a little when current flows.'],
 terms:['Heating effect · ऊष्मीय प्रभाव','Nichrome · नाइक्रोम','Heating element · तापन अवयव','Filament · तंतु'],
 q:{q:'Heating elements are usually made of:',o:['copper','nichrome','plastic','glass'],a:1,why:'High heating alloy.'},
 exam:'Heating effect and uses: 2–3 marks.'},

{id:'e3',num:'4.3',title:'Fuses and MCBs',
 intro:'When too many appliances run on one socket, why does the power cut off by itself?',
 obj:'Explain how fuses and MCBs protect circuits.',
 prior:'4.2.',
 simple:'Too much current can overheat wires and start a fire. A fuse is a short piece of thin wire that melts (blows) when the current is too high, breaking the circuit. A Miniature Circuit Breaker (MCB) is a switch that turns off automatically when current is too high; it can be switched back on after fixing the fault.',
 detail:'Too much current flows due to overloading (too many appliances) or a short circuit (live and neutral wires touch). Fuses use the heating effect; MCBs use heating and magnetic effects. Never replace a fuse wire with a thicker wire or copper — it would not melt and the protection is lost. ISI-marked electrical devices meet safety standards.',
 real:'Most new homes have an MCB box near the meter instead of old-style fuses.',
 apply:'Why should you never replace a blown fuse with a thick copper wire?',
 see:{w:520,h:220,f:[
  ['Normal current: fuse intact.',`<rect x="160" y="80" width="200" height="40" rx="8" fill="none" stroke="${ink}" stroke-width="2"/><line x1="170" y1="100" x2="350" y2="100" stroke="${CU}" stroke-width="1.5"/>`+lbl(260,70,'fuse')],
  ['Too much current: wire overheats.',`<line x1="170" y1="100" x2="350" y2="100" stroke="${OR}" stroke-width="3"/>`],
  ['Fuse melts: circuit broken — safe.',`<line x1="170" y1="100" x2="350" y2="100" stroke="#fff" stroke-width="4"/><line x1="170" y1="100" x2="245" y2="100" stroke="${CU}" stroke-width="1.5"/><line x1="275" y1="100" x2="350" y2="100" stroke="${CU}" stroke-width="1.5"/>`+lbl(260,160,'circuit broken → no fire','fill="'+GN+'" font-weight="700"')]]},
 seeNote:'Weakest link on purpose.',
 do:{title:'Fuse demo',mat:'Cells, thin steel wool strand, switch (teacher)',steps:['Pass current through a thin strand.'],obs:'It glows and breaks.',why:'Fuse principle.',lab:true},
 memo:'"Fuse melts so the house doesn\'t."',
 miscon:['"A thicker fuse wire is safer." It defeats the purpose.'],
 terms:['Fuse · फ्यूज़','MCB · लघु परिपथ विच्छेदक','Short circuit · लघु पथन','Overloading · अतिभारण'],
 q:{q:'A fuse works because of the:',o:['magnetic effect','heating effect','chemical effect','light effect'],a:1,why:'It melts.'},
 exam:'Fuse/MCB: 2 marks.'},

{id:'e4',num:'4.4',title:'The magnetic effect of current',
 intro:'Can a wire carrying current move a compass needle without touching it?',
 obj:'Describe Oersted\'s observation of the magnetic effect of current.',
 prior:'Class 6: magnets and compass.',
 simple:'In 1820, Hans Christian Oersted noticed that a compass needle near a wire moved (deflected) whenever current flowed. A wire carrying current behaves like a magnet — it produces a magnetic field around it. This is the magnetic effect of electric current. When the current stops, the needle returns.',
 detail:'Reversing the current reverses the deflection. More current → stronger effect. Winding the wire into a coil concentrates the magnetic effect. This discovery linked electricity and magnetism, leading to motors, generators and electromagnets.',
 real:'Electric motors in fans and mixers work because of the magnetic effect of current.',
 apply:'What happens to the compass needle when the current direction is reversed?',
 see:{w:520,h:220,f:[
  ['Compass under a wire; no current.',`<line x1="60" y1="70" x2="460" y2="70" stroke="${CU}" stroke-width="4"/>`+compass(260,130,0,26)+lbl(260,190,'no current: points north')],
  ['Current on: needle deflects.',`<line x1="60" y1="70" x2="460" y2="70" stroke="${OR}" stroke-width="5"/>`+compass(260,130,55,26)],
  ['Reverse current: deflects the other way.',lbl(260,40,'current ON → needle turns (Oersted, 1820)','fill="'+OR+'" font-weight="700"')]]},
 seeNote:'Current makes magnetism.',
 do:{title:'Oersted\'s experiment',mat:'Compass, cell, wire, switch',steps:['Lay a wire over a compass along N–S.','Switch on and off.'],obs:'Needle deflects when on.',why:'Magnetic effect.',lab:false},
 memo:'"Current on, needle turns."',
 miscon:['"Only magnets make magnetic effects." Current-carrying wires do too.'],
 terms:['Magnetic effect · चुंबकीय प्रभाव','Magnetic field · चुंबकीय क्षेत्र','Deflection · विक्षेप','Compass · दिक्सूचक'],
 q:{q:'Oersted found that current in a wire:',o:['heats a compass','deflects a compass needle','stops a compass','has no effect'],a:1,why:'Magnetic effect.'},
 exam:'Oersted\'s experiment: 2 marks.'},

{id:'e5',num:'4.5',title:'Electromagnets',
 intro:'How can a magnet be switched on and off?',
 obj:'Make an electromagnet and explain the factors affecting its strength.',
 prior:'4.4.',
 simple:'An electromagnet is a coil of insulated wire wound around a soft iron core. When current flows, the iron becomes a strong magnet; when the current stops, it loses most of its magnetism. Strength increases with: more turns of wire, more current (more cells), and an iron core (much stronger than air or wood).',
 detail:'Unlike permanent magnets, electromagnets can be switched on and off, made very strong, and their poles reversed by reversing the current. Soft iron is used because it magnetises and demagnetises easily. Steel would stay magnetised.',
 real:'Scrapyard cranes use huge electromagnets to lift iron and drop it by switching off.',
 apply:'Suggest two ways to make an electromagnet lift more pins.',
 see:{w:520,h:240,f:[
  ['Iron nail.',`<rect x="140" y="92" width="240" height="16" rx="3" fill="${GR}"/><path d="M380 92 L400 100 L380 108Z" fill="${GR}"/>`+lbl(260,135,'iron core')],
  ['Coil of wire around it.',coil(160,100,200,40)],
  ['Current on: pins stick.',cell(70,190)+`<path d="M70 176 V100 H160 M360 100 H440 V190 H78" fill="none" stroke="${ink}" stroke-width="1.5"/>`+[0,1,2].map(k=>`<line x1="${390+k*6}" y1="110" x2="${386+k*8}" y2="140" stroke="${ink}" stroke-width="1.5"/>`).join('')+lbl(260,225,'more turns · more current · iron core = stronger','font-weight="700"')]]},
 seeNote:'Switchable magnet.',
 do:{title:'Build one',mat:'Iron nail, insulated wire, 1–3 cells, pins',steps:['Wind 20 turns; connect one cell; count pins lifted.','Try 40 turns, then 2 cells.'],obs:'More pins each time.',why:'Strength factors.',lab:true},
 memo:'"Turns, current, iron — the strength trio."',
 miscon:['"Any core works the same." Iron makes it much stronger than wood or air.'],
 terms:['Electromagnet · विद्युत चुंबक','Coil · कुंडली','Soft iron core · नरम लोहे का क्रोड','Turns · फेरे'],
 q:{q:'Which makes an electromagnet stronger?',o:['fewer turns','more current','wooden core','thinner nail'],a:1,why:'More current.'},
 exam:'Electromagnet and factors: 3 marks.'},

{id:'e6',num:'4.6',title:'Uses of electromagnets and electrical safety',
 intro:'What do an electric bell, a scrapyard crane and an MRI machine have in common?',
 obj:'Describe uses of electromagnets and follow electrical safety rules.',
 prior:'4.3–4.5.',
 simple:'Uses: electric bell (an electromagnet repeatedly attracts an iron arm that hits a gong), cranes lifting scrap iron, motors in fans and pumps, loudspeakers, MCBs, magnetic locks, and MRI scanners in hospitals. Doctors use small magnets to remove iron splinters from eyes. Safety: never touch switches with wet hands, don\'t overload sockets, don\'t poke metal into sockets, use ISI-marked devices, and switch off the mains before repairs.',
 detail:'Electric bell working: pressing the switch completes the circuit → electromagnet attracts the iron strip → hammer hits gong → the strip moves away and breaks the circuit at the contact screw → magnet switches off → strip springs back → circuit closes again… repeating rapidly to ring. Our body conducts electricity, so electric shocks can be fatal.',
 real:'Railway signals and some trains use electromagnets.',
 apply:'Explain why an electric bell keeps ringing as long as the switch is pressed.',
 see:{w:520,h:240,f:[
  ['Press switch: electromagnet on.',`<rect x="80" y="120" width="60" height="50" fill="${GR}" opacity=".5"/>`+coil(80,145,60,20)+lbl(110,195,'electromagnet')],
  ['Arm is pulled; hammer hits the gong.',`<line x1="150" y1="100" x2="330" y2="100" stroke="${ink}" stroke-width="4"/><circle cx="380" cy="100" r="40" fill="none" stroke="${OR}" stroke-width="3"/><circle cx="335" cy="100" r="8" fill="${ink}"/>`+lbl(380,160,'gong','fill="'+OR+'"')],
  ['Contact breaks, arm springs back, repeats.',lbl(260,220,'make–break contact → rings repeatedly','font-weight="700"')]]},
 seeNote:'On, pull, break, back — repeat.',
 do:{title:'Safety poster',mat:'Chart paper',steps:['Make a poster of 6 electrical safety rules.'],obs:'Class safety charter.',why:'Prevent accidents.',lab:false},
 memo:'"Dry hands, few plugs, ISI mark."',
 miscon:['"Low voltage at home is harmless." Household current can kill.'],
 terms:['Electric bell · विद्युत घंटी','Contact screw · संपर्क पेंच','Electric shock · विद्युत आघात','ISI mark'],
 q:{q:'An electric bell works using:',o:['heating effect','an electromagnet','a permanent magnet only','chemical effect'],a:1,why:'Make–break electromagnet.'},
 exam:'Working of electric bell: 3–5 marks.'}
];

const CARDS=[['Closed circuit','Current needs a complete loop.'],['Heating effect','Current heats wires; nichrome elements.'],['Uses of heating','Heater, iron, kettle, geyser, filament bulb.'],['Fuse','Thin wire melts at high current.'],['MCB','Auto switch; can be reset.'],['Oersted (1820)','Current deflects a compass.'],['Electromagnet','Coil + soft iron core; switchable.'],['Stronger','More turns, more current, iron core.'],['Electric bell','Make-and-break electromagnet.'],['Safety','Dry hands, no overloading, ISI mark.']];

const Q=[
 {lv:1,q:'The element of an electric iron is made of:',o:['copper','nichrome','aluminium','tungsten'],a:1,w:'Nichrome.'},
 {lv:1,q:'Who discovered the magnetic effect of current?',o:['Faraday','Oersted','Edison','Newton'],a:1,w:'1820.'},
 {lv:1,q:'An electromagnet uses a core of:',o:['wood','soft iron','plastic','copper'],a:1,w:'Soft iron.'},
 {lv:2,q:'A fuse blows when:',o:['current is too low','current is too high','switch is off','bulb is fused'],a:1,w:'Overheats.'},
 {lv:2,q:'Reversing current in Oersted\'s experiment:',o:['stops deflection','reverses deflection','doubles it','melts wire'],a:1,w:'Direction.'},
 {lv:2,q:'Which wastes most energy as heat?',o:['LED','filament bulb','both same','neither'],a:1,w:'Filament.'},
 {lv:3,q:'An electromagnet with 40 turns and 2 cells vs 20 turns and 1 cell:',o:['weaker','stronger','same','no magnetism'],a:1,w:'Both increase strength.'},
 {lv:3,q:'Replacing a fuse wire with copper wire is dangerous because:',o:['copper is costly','it will not melt at high current','it is a poor conductor','it glows'],a:1,w:'No protection.'},
 {lv:4,q:'Why use soft iron (not steel) in an electromagnet?',o:['cheaper','loses magnetism when current stops','heavier','shinier'],a:1,w:'Switchable.'},
 {lv:4,q:'Which device uses both heating and magnetic effects?',o:['bulb','MCB','kettle','torch'],a:1,w:'MCB.'},
 {lv:5,open:true,m:3,q:'Describe an experiment to show that a current-carrying wire produces a magnetic effect.',ans:['Place a compass under a straight wire along N–S (1)','Connect to cell with switch; switch on (1)','Needle deflects; returns when off; reverses with current (1)']},
 {lv:5,open:true,m:5,q:'Explain the working of an electric bell with the help of a labelled description.',ans:['Switch pressed → circuit closed (1)','Electromagnet attracts iron armature (1)','Hammer strikes gong (1)','Contact at screw breaks → magnet off → armature springs back (1)','Circuit closes again; repeats rapidly (1)']}
];

const ONEMIN=['Closed circuits; conductors.','Heating effect; nichrome; uses.','Fuses and MCBs protect circuits.','Oersted: current deflects compass.','Electromagnets and their strength.','Electric bell; safety rules.'];
const KEYS=[['heating',/heat|nichrome/i],['fuse',/fuse|MCB/i],['Oersted',/oersted|compass|deflect/i],['electromagnet',/electromagnet|coil|core/i],['strength',/turns|more current|stronger/i],['safety',/safety|shock|ISI/i]];

/* ---------- lab ---------- */
let mode='m',cells=1,turns=20,core='iron',wire='nichrome',on=true,wired=false,blown=false;
function drawM(){const I=on?cells:0;const k={iron:1,none:.12,wood:.12}[core];const strength=I*turns*k/20;const pins=Math.min(24,Math.floor(strength*2.2));
 let s=cell(50,200)+(cells>1?cell(70,200):'')+(cells>2?cell(90,200):'')+(cells>3?cell(110,200):'');
 s+=`<path d="M50 186 V80 H140 M380 80 H430 V250 H${cells>0?50:50} V214" fill="none" stroke="${I?OR:ink}" stroke-width="1.8"/>`;
 if(core==='iron')s+=`<rect x="130" y="72" width="260" height="16" rx="3" fill="${GR}"/>`;else if(core==='wood')s+=`<rect x="130" y="72" width="260" height="16" rx="3" fill="#c79a5b"/>`;
 s+=coil(140,80,240,turns,I?OR:CU);for(let p=0;p<pins;p++){const x=150+(p%12)*20,y=100+Math.floor(p/12)*34;s+=`<line x1="${x}" y1="${y}" x2="${x+3}" y2="${y+30}" stroke="${ink}" stroke-width="1.5"/>`}
 s+=`<rect x="120" y="275" width="280" height="20" rx="4" fill="${GR}" opacity=".3"/>`;for(let p=0;p<24-pins;p++)s+=`<line x1="${130+p*11}" y1="290" x2="${136+p*11}" y2="281" stroke="${ink}" stroke-width="1.5"/>`;
 s+=compass(420,30,I?Math.min(80,strength*14):0,16);$('#eSvg').innerHTML=s;
 $('#eOut').innerHTML=!on||!cells?'<p>No current — no magnetism. The pins drop.</p>':`<p>Pins lifted: <b>${pins}</b>.</p><p>${core!=='iron'?'Without an iron core the magnet is very weak — iron concentrates the magnetism.':pins>=20?'Very strong: many turns, plenty of current and an iron core.':'Increase turns or cells to make it stronger.'}</p>`}
function drawH(){const I=on?cells:0;const R={nichrome:1,copper:.08,fuse:.6}[wire];let heat=I*I*R;if(wire==='fuse'&&I>=3)blown=true;if(!on)blown=blown&&wire==='fuse';
 const col=blown?ink:heat>9?'#ffd34d':heat>4?'#ff7a2b':heat>1.5?'#c0392b':CU;let s=cell(60,200)+(cells>1?cell(80,200):'')+(cells>2?cell(100,200):'')+(cells>3?cell(120,200):'');
 s+=`<path d="M60 186 V100 H130 M330 100 H420 V260 H60 V214" fill="none" stroke="${ink}" stroke-width="1.8"/>`;
 if(blown)s+=`<line x1="130" y1="100" x2="220" y2="100" stroke="${GR}" stroke-width="3"/><line x1="240" y1="100" x2="330" y2="100" stroke="${GR}" stroke-width="3"/>`+T(230,80,'melted!','font-size="14" fill="'+OR+'" font-weight="700"');
 else{s+=wire==='nichrome'?coil(130,100,200,40,col):`<line x1="130" y1="100" x2="330" y2="100" stroke="${col}" stroke-width="${wire==='copper'?7:2}"/>`;if(heat>4)s+=`<rect x="125" y="70" width="210" height="60" rx="20" fill="#ff9a3c" opacity="${Math.min(.35,heat/30)}"/>`}
 const t=Math.round(25+heat*45);s+=T(230,170,blown?'circuit broken':`≈ ${Math.min(t,900)} °C`,`font-size="22" font-weight="700" fill="${heat>4?OR:ink}"`);$('#eSvg').innerHTML=s;
 $('#eOut').innerHTML=blown?'<p class="fb ok">The thin fuse wire overheated and melted, breaking the circuit — exactly how a fuse protects a house. Reset by choosing another wire or switching off.</p>':!I?'<p>No current — no heating.</p>':wire==='copper'?'<p>Thick copper barely warms: good for connecting wires.</p>':wire==='nichrome'?`<p>Nichrome heats up${heat>4?' and glows':''} — used in heaters and irons. More cells → much more heat.</p>`:'<p>The fuse wire is warm. Add more cells to see what happens with too much current.</p>'}
function draw(){$('#eCv').textContent=cells;$('#eNv').textContent=turns;$('#eMag').style.display=mode==='m'?'':'none';$('#eHeat').style.display=mode==='h'?'':'none';mode==='m'?drawM():drawH()}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('eS')){if(e.target.id==='eC')cells=+e.target.value;else turns=+e.target.value;draw()}})}
function labClick(){return false}
function labChange(t){if(t.id==='eM'){mode=t.value;blown=false;draw();return true}if(t.id==='eK'){core=t.value;draw();return true}if(t.id==='eW'){wire=t.value;blown=false;draw();return true}if(t.id==='eSw'){on=t.checked;if(!on)blown=false;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
