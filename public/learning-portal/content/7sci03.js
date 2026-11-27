/* Rai Plus content pack: Class 7 Science (Curiosity), Chapter 3 – Electricity: Circuits and their Components. Bilingual terms. */
RP.register({key:'7sci03',cls:'7',subject:'Science',ch:'3',title:"Electricity: Circuits and their Components",color:'#c27a0e',
crumb:"Class 7 Science · Curiosity · विद्युत: परिपथ एवं उनके अवयव",h1:"Chapter 3: Electricity — Circuits and their Components",sub:"विद्युत परिपथ. Cells and batteries, bulbs and LEDs, switches, closed circuits, circuit diagrams, conductors and insulators.",heroLabel:"A cell, a switch and a glowing bulb joined in a loop",labName:'Circuit builder',
theme:"\n:root{--g:light-dark(#c27a0e,#f2c67a);--g2:light-dark(#fcf3e2,#221706);--line:light-dark(#f1dfb9,#4a3816);--bg:light-dark(#ffffff,#130d04);--card:light-dark(#ffffff,#1b1308);\n--ink:light-dark(#251a06,#f6ecd8);--mute:light-dark(#6e5a34,#cfbb92);--y:light-dark(#2f6f8a,#8cc3da);--y2:light-dark(#e6f2f7,#0c1d25);--hd:#8e5806}\n",
labHTML:`  <h2>Circuit builder · परिपथ</h2>
  <p>Build a circuit. Put a material in the gap to test it, flip the switch, add cells, or swap the bulb for an LED. Try the challenges!</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="eSvg" viewBox="0 0 460 320" role="img" aria-label="Electric circuit" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Cells in battery: <b id="eNv"></b><input type="range" id="eN" class="eS" min="1" max="3" value="1"></label></div>
  <div class="ctrl"><label>Material in the gap<select id="eMat"><option value="wire">Copper wire (closed)</option><option value="none">Nothing (open gap)</option><option value="nail">Iron nail</option><option value="coin">Coin</option><option value="foil">Aluminium foil</option><option value="lead">Pencil lead (graphite)</option><option value="plastic">Plastic scale</option><option value="eraser">Rubber eraser</option><option value="wood">Wooden stick</option><option value="glass">Glass bangle</option><option value="paper">Paper</option></select></label></div>
  <div class="ctrl"><label>Lamp<select id="eLamp"><option value="bulb">Torch bulb</option><option value="led">LED (long leg to +)</option><option value="ledr">LED reversed</option><option value="fused">Fused bulb (broken filament)</option></select></label></div>
  <div class="ctrl"><button class="btn" id="eSw">Switch: ON</button> <label><input type="checkbox" id="eDia"> Show circuit diagram</label></div>
  <div class="ctrl"><label>Challenge<select id="eCh"><option value="none">Free play</option><option value="c1">Make the LED glow</option><option value="c2">Find 3 conductors</option><option value="c3">Brightest bulb safely</option></select></label></div>
  <div class="box y" id="eOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#c27a0e',LABNAME='Circuit builder',MIND_CENTER='Electric circuit · विद्युत परिपथ';
const OR='#c27a0e',RD='#c0392b',BL='#2f6f8a',GN='#3b8a3b',GR='#888780',YE='#f7d14c',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
function cellPic(x,y,w=70){return `<rect x="${x}" y="${y-14}" width="${w}" height="28" rx="5" fill="#3a3a3a"/><rect x="${x+w}" y="${y-6}" width="7" height="12" fill="#bbb"/>`+T(x+w-8,y+5,'+','font-size="14" fill="#fff" font-weight="700"')+T(x+10,y+5,'−','font-size="14" fill="#fff" font-weight="700"')}
function bulbPic(x,y,on,br=1){return (on?`<circle cx="${x}" cy="${y-18}" r="${26+br*6}" fill="${YE}" opacity="${0.25+br*0.15}"/>`:'')+`<circle cx="${x}" cy="${y-18}" r="17" fill="${on?'#fff6c2':'#f4f4f6'}" stroke="${ink}"/><path d="M${x-6} ${y-14} q6 -12 12 0" stroke="${on?'#e08a00':GR}" fill="none" stroke-width="1.8"/><rect x="${x-9}" y="${y-2}" width="18" height="12" fill="#aaa"/>`}
function symCell(x,y){return `<line x1="${x-4}" y1="${y-14}" x2="${x-4}" y2="${y+14}" stroke="${ink}" stroke-width="2"/><line x1="${x+4}" y1="${y-7}" x2="${x+4}" y2="${y+7}" stroke="${ink}" stroke-width="4"/>`}
function heroDraw(){return `<rect x="40" y="40" width="300" height="70" rx="10" fill="none" stroke="#fff" stroke-width="3"/>`+`<rect x="70" y="96" width="50" height="22" rx="4" fill="#fff"/><circle cx="260" cy="40" r="16" fill="#fff"/>`}
const HERO=heroDraw;
const MIND=[['Cells & batteries',100,50],['Bulb & LED',420,50],['Switch & closed circuit',90,150],['Circuit diagrams',430,150],['Conductors & insulators',110,250],['Safety',410,250]];

const C=[
{id:'c1',num:'3.1',title:'Electric cell and battery · विद्युत सेल और बैटरी',
 intro:'Look at a torch cell. Which end is + and which is −?',
 obj:'Identify the terminals of a cell and understand a battery.',
 prior:'Class 6: materials; use of torches and remotes.',
 simple:'An electric cell (विद्युत सेल) is a source of electricity. It has two terminals: positive (+, the metal cap) and negative (−, the flat metal disc). Electricity flows only when the terminals are connected through a path outside the cell. Two or more cells joined + to − make a battery (बैटरी), giving more electricity to make a bulb brighter.',
 detail:'Cells store chemicals that produce electricity; when the chemicals are used up, the cell stops working. Rechargeable cells can be recharged. Never join the two terminals of a cell directly with a wire: the cell gets used up fast and may get hot. In a battery, the + of one cell touches the − of the next.',
 real:'A TV remote uses two cells; a torch may use two or three.',
 apply:'How should two cells be placed in a torch?',
 see:{w:520,h:220,f:[
  ['A cell: + cap and − base.',cellPic(60,90,110)+lbl(180,70,'+ terminal')+lbl(70,130,'− terminal')],
  ['Join + to − to make a battery.',cellPic(250,90,80)+cellPic(340,90,80)+lbl(380,130,'battery · बैटरी','font-weight="700"')],
  ['More cells → more push → brighter bulb.',bulbPic(460,190,true,2)+lbl(330,190,'brighter')]]},
 seeNote:'Battery = cells joined + to −.',
 do:{title:'Inspect a cell',mat:'A used torch cell',steps:['Find + and − marks.','Read its voltage (1.5 V).'],obs:'+ cap, − base, 1.5 V.',why:'Cell terminals.',lab:false},
 memo:'"Cap is plus, base is minus."',
 miscon:['"A battery is the same as a cell." A battery is two or more cells.'],
 terms:['Electric cell · विद्युत सेल','Terminal · टर्मिनल','Battery · बैटरी','Positive / negative'],
 q:{q:'The metal cap of a cell is the:',o:['negative terminal','positive terminal','filament','switch'],a:1,why:'+.'},
 exam:'Label a cell; define battery: 2 marks.'},

{id:'c2',num:'3.2',title:'Bulb and LED · बल्ब और एलईडी',
 intro:'Why does an LED glow only one way round?',
 obj:'Describe a torch bulb and an LED and how to connect them.',
 prior:'3.1.',
 simple:'A torch bulb has a thin wire called the filament (तंतु) that glows when electricity passes. It has two terminals: the side screw and the base tip. If the filament breaks, the bulb is fused and won\'t glow. An LED (light emitting diode) has two legs: the longer leg must connect to + and the shorter to −; connected the other way, it does not glow.',
 detail:'LEDs use much less electricity than filament bulbs and last longer, so they are replacing bulbs in homes and street lights. A filament bulb gets hot because most of the energy becomes heat. Electricity flows through the filament from one terminal to the other.',
 real:'Indian homes and street lights now mostly use LED lamps to save electricity.',
 apply:'An LED does not glow in a correct circuit. What should you try first?',
 see:{w:520,h:220,f:[
  ['Torch bulb with filament.',bulbPic(110,150,false)+lbl(110,185,'filament · तंतु')],
  ['Electricity through the filament: it glows.',bulbPic(110,150,true,1)],
  ['LED: long leg to +.',`<path d="M360 80 a20 20 0 0 1 40 0 v30 h-40z" fill="${RD}" opacity=".7"/><line x1="370" y1="110" x2="370" y2="180" stroke="${ink}" stroke-width="2"/><line x1="390" y1="110" x2="390" y2="160" stroke="${ink}" stroke-width="2"/>`+lbl(370,200,'+ long')+lbl(400,175,'− short','text-anchor="start"')]]},
 seeNote:'LEDs care which way round.',
 do:{title:'Two ways round',mat:'LED, 2 cells, wires',steps:['Connect LED long leg to +.','Reverse it.'],obs:'Glows one way only.',why:'LED polarity.',lab:true},
 memo:'"Long leg loves plus."',
 miscon:['"A fused bulb just needs more cells." The filament is broken; no path.'],
 terms:['Filament · तंतु','Fused bulb','LED · एलईडी'],
 q:{q:'The longer leg of an LED connects to:',o:['− terminal','+ terminal','either','the switch only'],a:1,why:'Polarity.'},
 exam:'Bulb vs LED: 2 marks.'},

{id:'c3',num:'3.3',title:'Closed circuit and switch · बंद परिपथ और स्विच',
 intro:'Why doesn\'t a bulb glow if one wire is loose?',
 obj:'Explain closed and open circuits and the role of a switch.',
 prior:'3.1, 3.2.',
 simple:'An electric circuit (विद्युत परिपथ) is a complete path from the + terminal of the cell, through wires and the bulb, back to the − terminal. When the path is complete (closed circuit), electricity flows and the bulb glows. A break anywhere (open circuit) stops it. A switch (स्विच) opens or closes the circuit: ON = closed, OFF = open.',
 detail:'Make a simple switch with two drawing pins and a safety pin on cardboard. Loose connections, a fused bulb or a used-up cell can all make a circuit "open". Torches, toys and room lights all use switches.',
 real:'The room switch closes the circuit to the fan or light.',
 apply:'List three reasons a torch might not light.',
 see:{w:520,h:220,f:[
  ['Cell, bulb, switch, wires.',`<rect x="80" y="50" width="360" height="120" fill="none" stroke="${GR}" stroke-width="3"/>`+cellPic(220,170,80)+bulbPic(260,62,false)],
  ['Switch OFF: open circuit.',`<line x1="420" y1="110" x2="445" y2="90" stroke="${RD}" stroke-width="4"/>`+lbl(470,120,'OFF','fill="'+RD+'"')],
  ['Switch ON: closed circuit — glows.',bulbPic(260,62,true,1)+`<rect x="80" y="50" width="360" height="120" fill="none" stroke="${OR}" stroke-width="3"/>`+lbl(260,210,'closed path → current flows','font-weight="700"')]]},
 seeNote:'No complete path, no current.',
 do:{title:'Safety-pin switch',mat:'Cardboard, 2 drawing pins, safety pin, cell, bulb, wires',steps:['Fix pins 3 cm apart; hook the safety pin on one.','Connect in the circuit; swing the safety pin to touch the other pin.'],obs:'Bulb on/off.',why:'Switch closes/opens.',lab:true},
 memo:'"Closed glows, open goes dark."',
 miscon:['"Electricity is used up in the bulb, so one wire is enough." A complete loop is needed.'],
 terms:['Electric circuit · विद्युत परिपथ','Closed circuit','Open circuit','Switch · स्विच'],
 q:{q:'A switch in OFF position makes the circuit:',o:['closed','open','brighter','shorter'],a:1,why:'Break in path.'},
 exam:'Explain closed/open circuit: 2 marks.'},

{id:'c4',num:'3.4',title:'Circuit diagrams · परिपथ आरेख',
 intro:'How can an electrician draw a circuit quickly so anyone can understand it?',
 obj:'Use standard symbols to draw circuit diagrams.',
 prior:'3.3.',
 simple:'Circuit diagrams use symbols. Cell: a long thin line (+) and a short thick line (−). Battery: two or more cell symbols joined. Bulb: a circle with a cross or loop. Switch: a break with a lifted line (open) or a closed line (ON). Wire: straight line. LED: a triangle with a bar and arrows.',
 detail:'Diagrams are neat and universal: the same in every country. Draw wires as straight lines with corners. Check: is there one complete loop? Does it pass through the bulb? Is the switch closed?',
 real:'Electricians follow wiring diagrams when fitting a house.',
 apply:'Draw the diagram for: 2 cells, a switch and a bulb.',
 see:{w:520,h:220,f:[
  ['Cell symbol: long (+) and short (−).',symCell(100,110)+lbl(100,150,'cell')],
  ['Bulb and switch symbols.',`<circle cx="230" cy="110" r="16" fill="none" stroke="${ink}" stroke-width="2"/><line x1="219" y1="99" x2="241" y2="121" stroke="${ink}"/><line x1="241" y1="99" x2="219" y2="121" stroke="${ink}"/>`+lbl(230,150,'bulb')+`<circle cx="320" cy="110" r="3"/><circle cx="360" cy="110" r="3"/><line x1="320" y1="110" x2="355" y2="92" stroke="${ink}" stroke-width="2"/>`+lbl(340,150,'switch (open)')],
  ['A full circuit diagram.',`<rect x="410" y="60" width="90" height="100" fill="none" stroke="${ink}" stroke-width="1.5"/>`+symCell(455,160)+`<circle cx="455" cy="60" r="10" fill="#fff" stroke="${ink}"/>`+lbl(455,200,'cell + bulb')]]},
 seeNote:'Symbols are universal.',
 do:{title:'Diagram detective',mat:'Worksheet of drawings',steps:['Redraw 3 circuits as diagrams.','Mark which will glow.'],obs:'Closed loops glow.',why:'Complete path.',lab:false},
 memo:'"Long line plus, short line minus."',
 miscon:['"Circuit diagrams must look like the real thing." They use simple symbols.'],
 terms:['Circuit diagram · परिपथ आरेख','Symbol · प्रतीक'],
 q:{q:'In a cell symbol, the longer line is:',o:['−','+','the bulb','the switch'],a:1,why:'Convention.'},
 exam:'Draw a circuit diagram: 3 marks.'},

{id:'c5',num:'3.5',title:'Conductors and insulators · चालक और विद्युतरोधी',
 intro:'Why are electric wires made of copper but covered with plastic?',
 obj:'Classify materials as conductors or insulators using a circuit tester.',
 prior:'3.3.',
 simple:'Put a material in a gap in the circuit. If the bulb glows, the material lets electricity pass: it is a conductor (चालक) — metals like copper, aluminium, iron; also graphite (pencil lead). If the bulb doesn\'t glow, it is an insulator (विद्युतरोधी) — plastic, rubber, wood, glass, paper, cloth.',
 detail:'Wires: copper inside (conducts), plastic outside (insulates, protects us). Electricians use tools with rubber or plastic handles. Pure water conducts poorly, but tap water with dissolved salts conducts — so never touch switches with wet hands. Our body can conduct electricity, which is why shocks are dangerous.',
 real:'Plug pins are metal; the plug body is plastic.',
 apply:'Why do electricians wear rubber gloves?',
 see:{w:520,h:220,f:[
  ['A tester with a gap.',`<rect x="80" y="60" width="300" height="100" fill="none" stroke="${GR}" stroke-width="3"/><rect x="200" y="150" width="60" height="20" fill="#fff"/>`+bulbPic(230,72,false)],
  ['Iron nail: bulb glows → conductor.',`<rect x="205" y="155" width="50" height="8" fill="#888"/>`+bulbPic(230,72,true,1)+lbl(420,100,'conductor · चालक','fill="'+GN+'" text-anchor="start"')],
  ['Plastic: no glow → insulator.',lbl(420,140,'insulator · विद्युतरोधी','fill="'+RD+'" text-anchor="start"')+lbl(230,205,'metal conducts; plastic does not','font-weight="700"')]]},
 seeNote:'Metals conduct; plastic, rubber, wood don\'t.',
 do:{title:'Tester test',mat:'Circuit with a gap, 10 objects',steps:['Place each object across the gap.','Record glow/no glow.'],obs:'Metals and graphite conduct.',why:'Conductors.',lab:true},
 memo:'"Metal lets it pass; plastic says no."',
 miscon:['"All non-metals are insulators." Graphite conducts.'],
 terms:['Conductor · चालक','Insulator · विद्युतरोधी','Graphite · ग्रेफाइट'],
 q:{q:'Which is a conductor?',o:['rubber','glass','aluminium foil','paper'],a:2,why:'Metal.'},
 exam:'Classify conductors/insulators: 2 marks.'},

{id:'c6',num:'3.6',title:'Electricity and safety · विद्युत सुरक्षा',
 intro:'Why must we never experiment with the electric socket at home?',
 obj:'Follow safety rules with electricity.',
 prior:'3.5.',
 simple:'Cells used in experiments are safe (1.5 V). Mains electricity at home (230 V) is very dangerous and can kill. Never touch sockets, bare wires or switches with wet hands. Never put objects into sockets. Do not fly kites near overhead wires. Report damaged wires to an adult.',
 detail:'Safety devices: fuses and MCBs cut off current if too much flows; earthing protects from shocks. In case of shock, switch off the main supply; don\'t touch the person directly — use a dry wooden stick. Save electricity: switch off lights and fans when not needed; use LEDs.',
 real:'An MCB in your home trips when there is a short circuit.',
 apply:'What should you do if you see a fallen electric wire after a storm?',
 see:{w:520,h:200,f:[
  ['Cells: safe for experiments.',cellPic(60,90,80)+lbl(100,130,'1.5 V: safe','fill="'+GN+'"')],
  ['Socket (230 V): danger!',`<rect x="230" y="60" width="60" height="70" rx="8" fill="#f4f4f6" stroke="${ink}"/><circle cx="250" cy="85" r="5"/><circle cx="270" cy="85" r="5"/><circle cx="260" cy="110" r="6"/>`+lbl(260,155,'230 V: never touch!','fill="'+RD+'" font-weight="700"')],
  ['Dry hands, no kites near wires, tell an adult.',lbl(420,100,'stay safe · सुरक्षित रहें','font-weight="700"')]]},
 seeNote:'Experiment only with cells.',
 do:{title:'Safety audit',mat:'Your home (with an adult)',steps:['Look for damaged plugs or wires.','Make a list of switches near water.'],obs:'Hazards.',why:'Safety.',lab:false},
 memo:'"Cells for play, sockets stay away."',
 miscon:['"Small shocks are harmless." Mains electricity can kill.'],
 terms:['Mains supply','Fuse / MCB','Earthing','Electric shock · विद्युत झटका'],
 q:{q:'Experiments in class should use:',o:['mains socket','cells','bare wires','wet hands'],a:1,why:'Safe voltage.'},
 exam:'Electrical safety rules: 2 marks.'}
];

const CARDS=[['Cell · सेल','Source of electricity; + cap, − base.'],['Battery','Cells joined + to −.'],['Filament','Thin wire that glows in a bulb.'],['LED','Long leg to +; saves power.'],['Closed circuit','Complete path; current flows.'],['Open circuit','Break; no current.'],['Switch','Opens/closes the circuit.'],['Circuit diagram','Symbols: long line +, short −.'],['Conductor · चालक','Metals, graphite.'],['Insulator · विद्युतरोधी','Plastic, rubber, wood, glass.'],['Safety','Never touch mains; dry hands.']];

const Q=[
 {lv:1,q:'Two or more cells joined together form a:',o:['switch','battery','bulb','fuse'],a:1,w:'Battery.'},
 {lv:1,q:'Glowing part of a bulb:',o:['glass','filament','base','screw'],a:1,w:'Filament.'},
 {lv:1,q:'An insulator:',o:['copper','iron','rubber','aluminium'],a:2,w:'Rubber.'},
 {lv:2,q:'A bulb glows when the circuit is:',o:['open','closed','broken','wet'],a:1,w:'Closed.'},
 {lv:2,q:'Pencil lead in a circuit tester:',o:['bulb glows','no glow','bulb breaks','LED reverses'],a:0,w:'Graphite conducts.'},
 {lv:2,q:'In a battery, cells are connected:',o:['+ to +','− to −','+ to −','randomly'],a:2,w:'In series.'},
 {lv:3,q:'An LED doesn\'t glow in a closed circuit. Likely cause:',o:['reversed','too bright','plastic wire','new cell'],a:0,w:'Polarity.'},
 {lv:3,q:'Wires are covered in plastic because plastic is:',o:['a conductor','an insulator','shiny','magnetic'],a:1,w:'Safety.'},
 {lv:4,q:'Adding one more cell to a 1-cell bulb circuit makes the bulb:',o:['dimmer','brighter','off','fused immediately'],a:1,w:'More push.'},
 {lv:4,q:'A torch doesn\'t glow with new cells and bulb. Check:',o:['switch and connections','colour of torch','size of bulb','nothing'],a:0,w:'Open circuit.'},
 {lv:5,open:true,m:3,q:'Describe how to test whether a material is a conductor.',ans:['Make a circuit with a gap (cell, bulb, wires) (1)','Place the material across the gap (1)','Glows → conductor; no glow → insulator (1)']},
 {lv:5,open:true,m:3,q:'Draw (describe) a circuit diagram with 2 cells, a switch and a bulb, and name the symbols.',ans:['Two cell symbols joined + to − (1)','Switch symbol and bulb symbol in one loop (1)','Straight wires forming a closed path (1)']}
];

const ONEMIN=['Cell: + cap, − base; battery = cells + to −.','Bulb filament; LED long leg to +.','Closed circuit glows; switch opens/closes.','Circuit diagram symbols.','Conductors: metals, graphite; insulators: plastic, rubber, wood, glass.','Never experiment with mains; dry hands.'];
const KEYS=[['cell/battery',/cell|battery/i],['filament/LED',/filament|LED/i],['closed circuit',/closed|complete/i],['switch',/switch/i],['diagram/symbol',/diagram|symbol/i],['conductor/insulator',/conduct|insulat/i],['safety',/safe|shock|mains/i]];

/* ---------- lab ---------- */
const MAT={wire:['Copper wire',1],none:['Nothing',0],nail:['Iron nail',1],coin:['Coin',1],foil:['Aluminium foil',1],lead:['Pencil lead (graphite)',1],plastic:['Plastic scale',0],eraser:['Rubber eraser',0],wood:['Wooden stick',0],glass:['Glass bangle',0],paper:['Paper',0]};
let n=1,mat='wire',lamp='bulb',sw=true,dia=false,ch='none',found=new Set();
function state(){const cond=MAT[mat][1];const closed=sw&&cond;const ok=lamp==='bulb'||lamp==='led';const lit=closed&&ok;return {cond,closed,lit,br:lit?(lamp==='led'?1:n):0}}
function draw(){const S=state();let s='';const L=60,R=400,Tp=60,Bt=240;
 const wc=S.closed&&lamp!=='fused'?OR:GR;
 if(dia){s+=`<polyline points="${L},${Bt} ${L},${Tp} ${R},${Tp} ${R},${Bt}" fill="none" stroke="${ink}" stroke-width="2"/>`;for(let k=0;k<n;k++)s+=symCell(150+k*30,Bt);s+=`<line x1="${L}" y1="${Bt}" x2="${140}" y2="${Bt}" stroke="${ink}" stroke-width="2"/><line x1="${160+(n-1)*30}" y1="${Bt}" x2="290" y2="${Bt}" stroke="${ink}" stroke-width="2"/>`;
  s+=`<circle cx="230" cy="${Tp}" r="15" fill="${S.lit?'#fff6c2':'#fff'}" stroke="${ink}" stroke-width="2"/><line x1="219" y1="${Tp-11}" x2="241" y2="${Tp+11}" stroke="${ink}"/><line x1="241" y1="${Tp-11}" x2="219" y2="${Tp+11}" stroke="${ink}"/>`;
  s+=`<circle cx="300" cy="${Bt}" r="3"/><circle cx="340" cy="${Bt}" r="3"/>`+(sw?`<line x1="300" y1="${Bt}" x2="340" y2="${Bt}" stroke="${ink}" stroke-width="2"/>`:`<line x1="300" y1="${Bt}" x2="335" y2="${Bt-20}" stroke="${ink}" stroke-width="2"/>`)+`<line x1="340" y1="${Bt}" x2="${R}" y2="${Bt}" stroke="${ink}" stroke-width="2"/>`;
  s+=`<rect x="${R-20}" y="135" width="40" height="30" fill="#fff" stroke="${ink}" stroke-dasharray="3 3"/>`+T(R+30,155,MAT[mat][0],'font-size="11" text-anchor="start"')}
 else{s+=`<polyline points="${L+20},${Bt} ${L},${Bt} ${L},${Tp} ${R},${Tp} ${R},125" fill="none" stroke="${wc}" stroke-width="4"/><polyline points="${R},175 ${R},${Bt} 340,${Bt}" fill="none" stroke="${wc}" stroke-width="4"/><line x1="${L+20+n*68}" y1="${Bt}" x2="290" y2="${Bt}" stroke="${wc}" stroke-width="4"/>`;
  for(let k=0;k<n;k++)s+=cellPic(L+20+k*68,Bt,60);
  if(lamp==='bulb'||lamp==='fused')s+=bulbPic(230,Tp+18,S.lit,S.br)+(lamp==='fused'?T(230,Tp+50,'broken filament','font-size="11" fill="'+RD+'"'):'');
  else{const on=S.lit;s+=(on?`<circle cx="230" cy="${Tp-4}" r="26" fill="${RD}" opacity=".25"/>`:'')+`<path d="M215 ${Tp+4} a15 15 0 0 1 30 0 v10 h-30z" fill="${RD}" opacity="${on?.95:.45}"/>`+T(230,Tp+36,lamp==='led'?'long leg → +':'reversed!','font-size="11"')}
  s+=`<circle cx="290" cy="${Bt}" r="5" fill="${ink}"/><circle cx="340" cy="${Bt}" r="5" fill="${ink}"/>`+(sw?`<line x1="290" y1="${Bt}" x2="340" y2="${Bt}" stroke="${ink}" stroke-width="5"/>`:`<line x1="290" y1="${Bt}" x2="332" y2="${Bt-26}" stroke="${ink}" stroke-width="5"/>`)+T(315,Bt+24,sw?'ON':'OFF','font-size="12" font-weight="700"');
  const MC={wire:OR,nail:'#777',coin:'#c9a227',foil:'#ccc',lead:'#333',plastic:'#4ab0d9',eraser:'#e88',wood:'#a0703a',glass:'#cfe8ef',paper:'#fff'};
  s+=`<rect x="${R-24}" y="125" width="48" height="50" fill="none" stroke="${GR}" stroke-dasharray="4 3"/>`+(mat!=='none'?`<rect x="${R-6}" y="120" width="12" height="60" fill="${MC[mat]}" stroke="${ink}" stroke-width=".6"/>`:'')+T(R-30,154,MAT[mat][0],'font-size="11" text-anchor="end"')}
 $('#eSvg').innerHTML=s;$('#eNv').textContent=n;$('#eSw').textContent='Switch: '+(sw?'ON':'OFF');
 let h='';if(!sw)h='<p>Switch is OFF: the circuit is open.</p>';else if(!S.cond)h=`<p class="fb no">${MAT[mat][0]} does not let electricity pass: it is an <b>insulator</b>. Open circuit.</p>`;
 else if(lamp==='fused')h='<p class="fb no">The bulb\'s filament is broken: no complete path inside the bulb.</p>';else if(lamp==='ledr')h='<p class="fb no">LED is the wrong way round: it allows current only one way.</p>';
 else h=`<p class="fb ok">Closed circuit — it glows${lamp==='bulb'?` (${['dim','bright','very bright'][n-1]})`:''}! ${mat!=='wire'?`${MAT[mat][0]} is a <b>conductor</b>.`:''}</p>`;
 if(S.cond&&sw&&mat!=='wire'&&mat!=='none')found.add(mat);
 if(ch==='c1')h+=lamp==='led'&&S.lit?'<p class="fb ok">Challenge done: LED glowing!</p>':'<p class="note">Challenge: make the LED glow.</p>';
 if(ch==='c2')h+=`<p class="note">Conductors found: ${found.size}/3 ${[...found].map(k=>MAT[k][0]).join(', ')}</p>`+(found.size>=3?'<p class="fb ok">Challenge done!</p>':'');
 if(ch==='c3')h+=lamp==='bulb'&&S.lit&&n===3?'<p class="fb ok">Brightest with 3 cells — safe because cells are low voltage. Never use mains!</p>':'<p class="note">Challenge: make the torch bulb as bright as possible.</p>';
 $('#eOut').innerHTML=h}
function labShow(){draw()}
let wired=false;
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(e.target&&e.target.id==='eN')labChange(e.target)})}
function labClick(b){if(b.id==='eSw'){sw=!sw;draw();return true}return false}
function labChange(t){switch(t.id){case 'eN':n=+t.value;break;case 'eMat':mat=t.value;break;case 'eLamp':lamp=t.value;break;case 'eDia':dia=t.checked;break;case 'eCh':ch=t.value;found=new Set();break;default:return false}draw();return true}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
