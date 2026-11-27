/* Rai Plus content pack: Class 6 Science (Curiosity), Chapter 9 – Methods of Separation in Everyday Life. Bilingual terms. */
RP.register({key:'6sci09',cls:'6',subject:'Science',ch:'9',title:"Methods of Separation in Everyday Life",color:'#8a5a12',
crumb:"Class 6 Science · Curiosity · दैनिक जीवन में पृथक्करण की विधियाँ",h1:"Chapter 9: Methods of Separation in Everyday Life",sub:"पृथक्करण की विधियाँ. Handpicking, threshing, winnowing, sieving, sedimentation, decantation, filtration, evaporation and churning.",heroLabel:"A sieve, a winnowing tray and a funnel with filter paper",labName:'Separation lab',
theme:"\n:root{--g:light-dark(#8a5a12,#e6bd7a);--g2:light-dark(#faf1e2,#1f160a);--line:light-dark(#ecd9b8,#45351d);--bg:light-dark(#ffffff,#120d06);--card:light-dark(#ffffff,#1a130a);\n--ink:light-dark(#231808,#f3e8d6);--mute:light-dark(#6b5634,#cfbb98);--y:light-dark(#2f6f8a,#8cc3da);--y2:light-dark(#e6f2f7,#0c1d25);--hd:#6b4409}\n",
labHTML:`  <h2>Separation lab · पृथक्करण प्रयोगशाला</h2>
  <p>Pick a mixture, then press the methods in the right order. Press Reset to try again.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="sSvg" viewBox="0 0 460 300" role="img" aria-label="Separation steps" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Mixture<select id="sMix"><option value="sand">Salt + sand</option><option value="dal">Dal with small stones</option><option value="flour">Flour with bran</option><option value="muddy">Muddy water</option><option value="pins">Sand with iron pins</option><option value="wheat">Wheat stalks after harvest</option></select></label></div>
  <div class="ctrl" style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn" data-m="hand">Handpicking</button><button class="btn" data-m="thresh">Threshing</button><button class="btn" data-m="winnow">Winnowing</button><button class="btn" data-m="sieve">Sieving</button><button class="btn" data-m="dissolve">Add water & stir</button><button class="btn" data-m="sed">Sedimentation</button><button class="btn" data-m="dec">Decantation</button><button class="btn" data-m="filter">Filtration</button><button class="btn" data-m="evap">Evaporation</button><button class="btn" data-m="magnet">Magnet</button><button class="btn" id="sReset">Reset</button></div><div class="box y" id="sOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#8a5a12',LABNAME='Separation lab',MIND_CENTER='Separation · पृथक्करण';
const BR='#8a5a12',BL='#2f6f8a',LB='#a9d3e6',GR='#888780',YE='#e0b84a',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const dots=(x,y,w,h,n,c,r=3,seed=1)=>{let s='',a=seed;for(let i=0;i<n;i++){a=(a*9301+49297)%233280;const px=x+(a/233280)*w;a=(a*9301+49297)%233280;const py=y+(a/233280)*h;s+=`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r}" fill="${c}"/>`}return s};
const beaker=(x,y,w=80,h=100)=>`<path d="M${x} ${y} v${h} a8 8 0 0 0 8 8 h${w-16} a8 8 0 0 0 8 -8 v-${h}" fill="none" stroke="${ink}" stroke-width="2"/>`;
const funnel=(x,y)=>`<path d="M${x-40} ${y} L${x} ${y+50} L${x+40} ${y}z" fill="#fff" stroke="${ink}"/><path d="M${x-30} ${y+4} L${x} ${y+42} L${x+30} ${y+4}" fill="none" stroke="${GR}" stroke-dasharray="3 2"/><rect x="${x-4}" y="${y+50}" width="8" height="34" fill="#fff" stroke="${ink}"/>`;
function heroDraw(){return `<ellipse cx="70" cy="80" rx="45" ry="14" fill="none" stroke="#fff" stroke-width="3"/><path d="M30 80 q40 30 80 0" fill="none" stroke="#fff" stroke-width="2"/><path d="M170 50 L200 90 L230 50z" fill="none" stroke="#fff" stroke-width="3"/><rect x="196" y="90" width="8" height="20" fill="#fff"/>`}
const HERO=heroDraw;
const MIND=[['Why separate?',100,50],['Handpicking & threshing',420,50],['Winnowing & sieving',90,150],['Sedimentation & decantation',430,150],['Filtration & evaporation',110,250],['Churning & magnets',410,250]];

const C=[
{id:'p1',num:'9.1',title:'Why do we separate? · पृथक्करण क्यों?',
 intro:'Before cooking dal, why does your mother pick out small stones?',
 obj:'Explain why components of a mixture are separated.',
 prior:'Materials around us (Ch 6).',
 simple:'A mixture (मिश्रण) has two or more substances mixed together. We separate them (1) to remove harmful or useless parts (stones from dal, husk from grain), (2) to get a useful part (butter from curd, salt from sea water), or (3) to get pure substances. The method depends on the properties of the parts: size, weight, colour, whether they dissolve in water, or whether they are magnetic.',
 detail:'Sometimes we need more than one method in a row: e.g. salt mixed with sand needs dissolving, filtering and evaporating. In daily life many separations happen at home, in farms and in factories.',
 real:'Kitchen: picking stones, sieving flour, straining tea, churning curd.',
 apply:'Give one reason each for separating husk from wheat and stones from rice.',
 see:{w:520,h:200,f:[
  ['A mixture: dal with stones.',dots(60,80,140,60,30,YE,5,3)+dots(60,80,140,60,6,GR,6,9)],
  ['Remove what is harmful or useless…',`<path d="M230 110 h60" stroke="${ink}" stroke-width="2"/><path d="M285 104 l8 6 -8 6" fill="none" stroke="${ink}" stroke-width="2"/>`+dots(320,150,60,20,6,GR,6,9)],
  ['…and keep what is useful.',dots(320,60,140,60,30,YE,5,3)+lbl(390,190,'clean dal · साफ़ दाल')]]},
 seeNote:'Choose a method by the properties of the parts.',
 do:{title:'Mixture hunt',mat:'Your kitchen',steps:['List three mixtures at home.','Write what is separated and why.'],obs:'Separation is everywhere.',why:'We need pure or useful parts.',lab:false},
 memo:'"Remove the bad, keep the good, use the right property."',
 miscon:['"All mixtures can be separated by one method." Often several are needed.'],
 terms:['Mixture · मिश्रण','Separation · पृथक्करण','Component · घटक','Impurity · अशुद्धि'],
 q:{q:'We separate stones from dal to:',o:['make it heavier','remove useless/harmful parts','add flavour','change colour'],a:1,why:'Removing impurities.'},
 exam:'Why do we separate substances? 2 marks.'},

{id:'p2',num:'9.2',title:'Handpicking and threshing · हाथ से चुनना और गहाई',
 intro:'How do farmers get grains out of the harvested wheat stalks?',
 obj:'Describe handpicking and threshing.',
 prior:'Why separate (9.1).',
 simple:'Handpicking (हाथ से चुनना): picking out by hand the parts that differ in size, colour or shape, when there are few of them, e.g. stones from rice or dal. Threshing (गहाई): separating grains from the stalks, by beating the stalks, getting bullocks to walk over them, or using a machine called a thresher.',
 detail:'Handpicking is slow, so it suits small amounts and a few impurities. Threshing is done on a large scale on farms; in Haryana, combine harvesters cut and thresh wheat together. After threshing the grain is still mixed with husk, which is removed by winnowing.',
 real:'In Haryana villages, wheat is threshed in April after the rabi harvest.',
 apply:'Why is handpicking not used to clean a whole truckload of grain?',
 see:{w:520,h:220,f:[
  ['Handpicking: pick out the odd ones by hand.',dots(40,90,140,60,25,YE,5,5)+dots(40,90,140,60,4,GR,7,8)+`<path d="M130 60 q20 -20 40 0" stroke="${ink}" fill="none" stroke-width="3"/>`],
  ['Threshing: beat stalks to free the grain.',`<g stroke="${BR}" stroke-width="3">${[0,1,2,3,4].map(i=>`<line x1="${300+i*14}" y1="60" x2="${305+i*14}" y2="160"/>`).join('')}</g>`+dots(290,170,90,15,14,YE,4,2)],
  ['Large farms use threshers.',lbl(340,210,'thresher · थ्रेशर','font-weight="700"')+lbl(110,210,'handpicking','font-weight="700"')]]},
 seeNote:'Grain after threshing still has husk.',
 do:{title:'Clean the rice',mat:'A handful of uncleaned rice on a plate',steps:['Spread it out.','Pick out stones, husk and broken grains.','Count what you removed.'],obs:'A few impurities removed.',why:'Different colour/size.',lab:true},
 memo:'"Few odd ones? Pick by hand. Grain on stalks? Beat the band."',
 miscon:['"Threshing separates husk." It separates grain from stalks; winnowing removes husk.'],
 terms:['Handpicking · हाथ से चुनना','Threshing · गहाई','Stalk · डंठल','Thresher · थ्रेशर'],
 q:{q:'Separating grain from stalks is:',o:['winnowing','threshing','sieving','filtration'],a:1,why:'Definition.'},
 exam:'Define handpicking and threshing: 2 marks.'},

{id:'p3',num:'9.3',title:'Winnowing and sieving · फटकना और छानना',
 intro:'Why do farmers drop grain from a height on a windy day?',
 obj:'Describe winnowing and sieving and when each is used.',
 prior:'Threshing (9.2).',
 simple:'Winnowing (फटकना/ओसाई): separating heavier grain from lighter husk using wind. The mixture is dropped from a height; wind blows the light husk away into a heap, while heavy grain falls straight down. Sieving (छानना): separating particles of different sizes using a sieve with holes; small particles pass through, big ones stay.',
 detail:'Winnowing uses a supa (winnowing basket) or a fan. Sieving is used to remove bran from flour, and at construction sites to separate pebbles and stones from sand. The holes of the sieve must be the right size.',
 real:'At building sites, workers throw sand on a tilted wire sieve to separate pebbles.',
 apply:'Can winnowing separate sand from salt? Why not?',
 see:{w:520,h:240,f:[
  ['Winnowing: drop from a height.',`<path d="M60 40 h80 l-10 16 h-60z" fill="${BR}"/>`+[0,1,2,3,4].map(i=>`<circle cx="${100}" cy="${80+i*25}" r="4" fill="${YE}"/>`).join('')],
  ['Wind blows light husk away; heavy grain falls straight.',`<path d="M20 120 h40 M20 140 h30" stroke="${GR}" stroke-width="2"/>`+[0,1,2,3].map(i=>`<ellipse cx="${130+i*22}" cy="${90+i*25}" rx="6" ry="2" fill="#c9b48a"/>`).join('')+`<path d="M80 210 q20 -18 40 0z" fill="${YE}"/><path d="M180 210 q25 -14 50 0z" fill="#c9b48a"/>`+lbl(100,230,'grain','font-size="12"')+lbl(205,230,'husk','font-size="12"')],
  ['Sieving: small particles pass, big ones stay.',`<ellipse cx="400" cy="100" rx="70" ry="16" fill="none" stroke="${ink}" stroke-width="2"/><path d="M335 100 h130" stroke="${GR}" stroke-dasharray="2 3"/>`+dots(360,80,80,12,6,BR,5,4)+dots(370,130,60,60,25,'#e8dcc0',2,7)+lbl(400,225,'sieve · छलनी')]]},
 seeNote:'Winnowing: weight. Sieving: size.',
 do:{title:'Sieve the flour',mat:'Atta, a kitchen sieve, newspaper',steps:['Sieve atta over the paper.','Look at what stays in the sieve.'],obs:'Bran stays; fine flour passes.',why:'Different particle size.',lab:true},
 memo:'"Wind for weight, holes for size."',
 miscon:['"Winnowing works without wind." Air flow is needed.'],
 terms:['Winnowing · फटकना','Husk · भूसा','Sieving · छानना','Sieve · छलनी','Bran · चोकर'],
 q:{q:'Bran is removed from flour by:',o:['winnowing','sieving','evaporation','magnet'],a:1,why:'Size difference.'},
 exam:'Explain winnowing with a diagram: 3 marks.'},

{id:'p4',num:'9.4',title:'Sedimentation, decantation and filtration · अवसादन, निस्तारण, निस्यंदन',
 intro:'How can you clean muddy water from a pond?',
 obj:'Describe sedimentation, decantation and filtration.',
 prior:'Sieving (9.3).',
 simple:'Sedimentation (अवसादन): heavier insoluble particles settle at the bottom when a mixture is left still; the settled layer is the sediment. Decantation (निस्तारण): gently pouring off the clear liquid without disturbing the sediment. Filtration (निस्यंदन): passing the liquid through a filter (filter paper, cloth) that lets the liquid through but holds back fine solid particles. The clear liquid collected is the filtrate.',
 detail:'Decantation does not remove very fine particles; filtration does. Straining tea through a strainer, making paneer by straining milk through muslin cloth, and water filters at home are examples of filtration. Rice is washed and the water poured off: sedimentation and decantation. Filtered water may still have germs; boiling or other treatment makes it safe to drink.',
 real:'Making paneer: curdled milk is filtered through a muslin cloth.',
 apply:'Why is filtration done after decantation, not instead of it?',
 see:{w:520,h:240,f:[
  ['Muddy water left still: mud settles (sedimentation).',beaker(40,80)+`<rect x="42" y="100" width="76" height="80" fill="${LB}" opacity=".5"/><rect x="42" y="168" width="76" height="18" fill="${BR}" opacity=".7"/>`+lbl(80,215,'sediment','font-size="12"')],
  ['Pour off the clear water gently (decantation).',`<g transform="rotate(-30 220 110)">${beaker(190,70)}<rect x="192" y="110" width="76" height="40" fill="${LB}" opacity=".5"/></g>`+`<path d="M248 92 q10 20 10 60" stroke="${LB}" stroke-width="5" fill="none"/>`],
  ['Filter out fine particles (filtration).',funnel(410,50)+beaker(370,150,80,70)+`<rect x="372" y="200" width="76" height="20" fill="${LB}"/>`+lbl(410,240,'filtrate','font-size="12"')]]},
 seeNote:'Settle → pour → filter.',
 do:{title:'Clean muddy water',mat:'Muddy water, two glasses, filter paper or clean cloth, funnel',steps:['Leave muddy water for 30 minutes.','Pour the top water into another glass.','Filter it through the paper.'],obs:'Water gets clearer at each step.',why:'Settling, then filtering.',lab:true},
 memo:'"Settle, pour, filter."',
 miscon:['"Filtered water is always safe to drink." Germs may remain; boil it.'],
 terms:['Sedimentation · अवसादन','Sediment · अवसाद','Decantation · निस्तारण','Filtration · निस्यंदन','Filtrate · निस्यंद'],
 q:{q:'Pouring off clear liquid without disturbing the settled solid is:',o:['filtration','decantation','evaporation','sieving'],a:1,why:'Definition.'},
 exam:'Explain sedimentation, decantation and filtration: 3 marks.'},

{id:'p5',num:'9.5',title:'Evaporation, churning and magnets · वाष्पन, मथना, चुंबक',
 intro:'How is salt obtained from sea water?',
 obj:'Use evaporation, churning and magnetic separation; combine methods.',
 prior:'Filtration (9.4); evaporation (Ch 8).',
 simple:'Evaporation: a solution is heated or kept in the sun; water changes into vapour and the dissolved solid (like salt) is left behind. Sea water is let into shallow pans; the Sun evaporates the water and salt remains. Churning (मथना): curd is churned with a madhani; the lighter butter separates and floats. A magnet separates iron pieces from a mixture.',
 detail:'Salt + sand: add water and stir (salt dissolves); filter (sand stays on the paper); evaporate the filtrate (salt is left). This uses three methods in a row. Churning works because lighter fat particles collect together and rise.',
 real:'Salt pans in Gujarat (Rann of Kutch) and Tamil Nadu produce most of India\'s salt.',
 apply:'Give the steps to separate a mixture of salt and sand.',
 see:{w:520,h:240,f:[
  ['Salt + sand: add water and stir.',beaker(30,90)+`<rect x="32" y="110" width="76" height="80" fill="${LB}" opacity=".5"/>`+dots(40,170,60,15,14,BR,3,6)],
  ['Filter: sand stays on the paper.',funnel(220,60)+beaker(180,160,80,60)+`<rect x="182" y="200" width="76" height="20" fill="${LB}"/>`+dots(205,70,30,10,8,BR,3,2)],
  ['Evaporate the filtrate: salt is left.',`<ellipse cx="420" cy="150" rx="55" ry="12" fill="#fff" stroke="${ink}"/>`+dots(380,143,80,10,18,'#ccc',2.5,5)+`<path d="M395 190 l10 -20 l10 20 l10 -20 l10 20" stroke="#e85a2a" fill="none" stroke-width="2"/>`+[0,1].map(i=>`<path d="M${400+i*30} 130 q-6 -10 0 -20 q6 -10 0 -20" fill="none" stroke="${GR}" stroke-width="2"/>`).join('')+lbl(420,225,'salt · नमक')]]},
 seeNote:'Several methods can be used one after another.',
 do:{title:'Salt from salt water',mat:'Salt water in a steel plate',steps:['Keep the plate in the sun for a day (or warm it with adult help).','Look at what remains.'],obs:'White salt crystals.',why:'Water evaporated.',lab:false},
 memo:'"Dissolve, filter, evaporate: salt from sand."',
 miscon:['"Filtration separates dissolved salt." Dissolved salt passes through filter paper.'],
 terms:['Evaporation · वाष्पन','Churning · मथना','Butter · मक्खन','Magnet · चुंबक','Solution · विलयन'],
 q:{q:'Salt is obtained from sea water by:',o:['filtration','evaporation','sieving','winnowing'],a:1,why:'Water evaporates, salt remains.'},
 exam:'Separate salt and sand: 3 marks.'}
];

const CARDS=[['Mixture','Two or more substances mixed.'],['Handpicking','By hand: size/colour/shape; few impurities.'],['Threshing','Grain from stalks.'],['Winnowing','Wind: heavy grain falls, light husk blows.'],['Sieving','Different sizes; bran from flour.'],['Sedimentation','Heavy insoluble particles settle.'],['Decantation','Pour off clear liquid.'],['Filtration','Filter holds fine solids; filtrate passes.'],['Evaporation','Liquid goes, dissolved solid remains.'],['Churning','Butter from curd.'],['Magnet','Iron from a mixture.'],['Combine methods','Salt + sand: dissolve → filter → evaporate.']];

const Q=[
 {lv:1,q:'Separating stones from rice by hand:',o:['threshing','handpicking','winnowing','sieving'],a:1,w:'Handpicking.'},
 {lv:1,q:'Husk is separated from grain by:',o:['winnowing','filtration','churning','magnet'],a:0,w:'Wind.'},
 {lv:1,q:'Butter is separated from curd by:',o:['churning','sieving','evaporation','decantation'],a:0,w:'Churning.'},
 {lv:2,q:'Pebbles are separated from sand by:',o:['sieving','winnowing','evaporation','churning'],a:0,w:'Size.'},
 {lv:2,q:'Paneer is separated from whey by:',o:['filtration','magnet','winnowing','threshing'],a:0,w:'Muslin cloth.'},
 {lv:2,q:'Iron pins from sand:',o:['magnet','sieve only','winnowing','evaporation'],a:0,w:'Magnetic.'},
 {lv:3,q:'Settling of heavy particles is:',o:['decantation','sedimentation','filtration','evaporation'],a:1,w:'Definition.'},
 {lv:3,q:'Clear liquid collected after filtration:',o:['sediment','filtrate','residue','solution'],a:1,w:'Filtrate.'},
 {lv:4,q:'Correct order for salt + sand:',o:['filter → dissolve → evaporate','dissolve → filter → evaporate','evaporate → filter → dissolve','sieve → winnow → filter'],a:1,w:'Dissolve salt first.'},
 {lv:4,q:'Why can\'t filtration separate salt from salt water?',o:['salt is magnetic','salt is dissolved and passes through','salt is heavy','salt floats'],a:1,w:'Dissolved particles pass.'},
 {lv:5,open:true,m:3,q:'You have muddy water. Describe how to make it clear.',ans:['Leave it still: mud settles (sedimentation) (1)','Pour off the top water (decantation) (1)','Filter through filter paper/cloth; boil before drinking (1)']},
 {lv:5,open:true,m:3,q:'Explain winnowing. Which property of the components is used?',ans:['Mixture dropped from height in wind (1)','Light husk blown away, heavy grain falls near (1)','Difference in weight/lightness (1)']}
];

const ONEMIN=['Separate to remove useless/harmful parts or get useful ones.','Handpicking, threshing.','Winnowing (weight), sieving (size).','Sedimentation → decantation → filtration.','Evaporation leaves dissolved solid.','Churning: butter. Magnet: iron.','Combine methods: salt + sand.'];
const KEYS=[['why',/useful|harmful|impur/i],['handpicking',/hand/i],['threshing',/thresh/i],['winnowing',/winnow|husk/i],['sieving',/siev/i],['sedimentation/decantation',/sediment|decant/i],['filtration',/filt/i],['evaporation',/evapor/i],['churning/magnet',/churn|magnet/i]];

/* ---------- lab ---------- */
const MIX={sand:{n:'Salt + sand',seq:['dissolve','filter','evap'],done:'Sand stays on the filter paper; salt is left after evaporation.'},
 dal:{n:'Dal with small stones',seq:['hand'],done:'A few stones, different in size and colour: handpicking.'},
 flour:{n:'Flour with bran',seq:['sieve'],done:'Fine flour passes; bran stays in the sieve.'},
 muddy:{n:'Muddy water',seq:['sed','dec','filter'],done:'Settle, pour off, then filter. Boil before drinking.'},
 pins:{n:'Sand with iron pins',seq:['magnet'],done:'Iron pins stick to the magnet.'},
 wheat:{n:'Wheat stalks after harvest',seq:['thresh','winnow'],done:'Threshing frees grain; winnowing removes the husk.'}};
const NM={hand:'Handpicking',thresh:'Threshing',winnow:'Winnowing',sieve:'Sieving',dissolve:'Add water & stir',sed:'Sedimentation',dec:'Decantation',filter:'Filtration',evap:'Evaporation',magnet:'Magnet'};
let mix='sand',done=[],msg='';
function draw(){const m=MIX[mix];let s=T(230,30,m.n,'font-size="16" font-weight="700"');
 m.seq.forEach((st,i)=>{const x=60+i*(340/Math.max(1,m.seq.length-1||1));const cx=m.seq.length===1?230:60+i*(340/(m.seq.length-1));const ok=i<done.length;s+=`<circle cx="${cx}" cy="140" r="34" fill="${ok?'#e3f0d4':'none'}" stroke="${ok?'#3b6d11':GR}" stroke-width="2" ${ok?'':'stroke-dasharray="5 4"'}/>`+T(cx,145,ok?NM[st]:'?','font-size="12"'+(ok?' font-weight="700"':''));if(i<m.seq.length-1)s+=`<path d="M${cx+38} 140 h${340/(m.seq.length-1)-76}" stroke="${GR}"/>`});
 s+=T(230,230,`Step ${Math.min(done.length+1,m.seq.length)} of ${m.seq.length}`,'font-size="13"');
 $('#sSvg').innerHTML=s;$('#sOut').innerHTML=msg||'<p>Choose the first method.</p>'}
function press(k){const m=MIX[mix];if(done.length>=m.seq.length){msg='<p>Already separated. Press Reset or choose another mixture.</p>';draw();return}
 if(m.seq[done.length]===k){done.push(k);msg=done.length===m.seq.length?`<p class="fb ok">Separated! ${m.done}</p>`:`<p class="fb ok">${NM[k]}: correct. What next?</p>`}
 else msg=`<p class="fb no">${NM[k]} is not right here. Think about which property differs: size, weight, dissolving, magnetism?</p>`;draw()}
function labShow(){draw()}
function labInit(){}
function labClick(b){if(b.id==='sReset'){done=[];msg='';draw();return true}if(b.dataset&&b.dataset.m){press(b.dataset.m);return true}return false}
function labChange(t){if(t.id==='sMix'){mix=t.value;done=[];msg='';draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
