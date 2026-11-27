/* Rai Plus content pack: Class 6 Science (Curiosity), Chapter 7 – Temperature and its Measurement. Bilingual terms. */
RP.register({key:'6sci07',cls:'6',subject:'Science',ch:'7',title:"Temperature and its Measurement",color:'#c0392b',
crumb:"Class 6 Science · Curiosity · ताप और उसका मापन",h1:"Chapter 7: Temperature and its Measurement",sub:"ताप और उसका मापन. Why touch can fool us, and how to use thermometers correctly.",heroLabel:"A clinical thermometer and a laboratory thermometer",labName:'Thermometer lab',
theme:"\n:root{--g:light-dark(#c0392b,#f3a39a);--g2:light-dark(#fcedeb,#230c0a);--line:light-dark(#f2d0cb,#4a2320);--bg:light-dark(#ffffff,#130807);--card:light-dark(#ffffff,#1b0d0b);\n--ink:light-dark(#220c0a,#f6e4e2);--mute:light-dark(#6e4b47,#cdaaa6);--y:light-dark(#2e6fb5,#85b7eb);--y2:light-dark(#e6f1fb,#0c1e33);--hd:#8a2418}\n",
labHTML:`  <h2>Thermometer lab · तापमापी प्रयोगशाला</h2>
  <p>Choose a thermometer and something to measure. Read the scale and check your answer.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="hSvg" viewBox="0 0 460 330" role="img" aria-label="Thermometer" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Thermometer<select id="hTh"><option value="lab">Laboratory (−10 to 110 °C)</option><option value="cli">Clinical (35 to 42 °C)</option></select></label></div><div class="ctrl"><label>Measure<select id="hWhat"><option value="ice">Ice water</option><option value="tap">Tap water</option><option value="body">Body (under the tongue)</option><option value="fever">Body with fever</option><option value="warm">Warm water for a bath</option><option value="boil">Boiling water</option></select></label></div><div class="ctrl"><label>Your reading (°C)<input id="hGuess" type="number" step="0.1" style="width:6em"></label><button class="btn" id="hCheck">Check</button></div><div class="box y" id="hOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#c0392b',LABNAME='Thermometer lab',MIND_CENTER='Temperature · ताप';
const RD='#c0392b',BL='#2e6fb5',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
function thermo(x,y,h,min,max,val,step,label=true,kink=false){const k=h/(max-min);const Y=v=>y+h-(v-min)*k;let s=`<rect x="${x-7}" y="${y-10}" width="14" height="${h+20}" rx="7" fill="#f4f4f6" stroke="${ink}"/><circle cx="${x}" cy="${y+h+22}" r="13" fill="${RD}"/><rect x="${x-3}" y="${Math.max(y-6,Y(Math.max(min,Math.min(max,val))))}" width="6" height="${y+h+12-Math.max(y-6,Y(Math.max(min,Math.min(max,val))))}" fill="${RD}"/>`;
 if(kink)s+=`<path d="M${x-5} ${y+h+6} l10 4" stroke="${ink}" stroke-width="2"/>`;
 const n=Math.round((max-min)/step);for(let i=0;i<=n;i++){const v=min+i*step,yy=Y(v),major=step<1?i%10===0:Math.round(v)%10===0,mid=step<1&&i%5===0;s+=`<line x1="${x+8}" y1="${yy}" x2="${x+(major?24:mid?18:13)}" y2="${yy}" stroke="${ink}" stroke-width="${major?1.3:.6}"/>`;if(major&&label)s+=T(x+42,yy+4,String(Math.round(v)),'font-size="11"')}return s}
function heroDraw(){return `<rect x="60" y="20" width="10" height="90" rx="5" fill="#fff"/><circle cx="65" cy="112" r="9" fill="#fff"/><rect x="62" y="60" width="6" height="52" fill="#f3a39a"/><rect x="160" y="40" width="70" height="28" rx="6" fill="#fff" opacity=".85"/><text x="195" y="60" font-size="16" text-anchor="middle" fill="#8a2418">37.0</text>`}
const HERO=heroDraw;
const MIND=[['Touch can mislead',100,50],['Temperature & scales',420,50],['Clinical thermometer',90,150],['Digital & infrared',430,150],['Laboratory thermometer',110,250],['Air temperature',410,250]];

const C=[
{id:'t1',num:'7.1',title:'Can touch tell temperature? · क्या स्पर्श से ताप ज्ञात हो सकता है?',
 intro:'Put one hand in cold water and the other in warm water, then both in lukewarm water. What do your hands feel?',
 obj:'Show that our sense of touch is not a reliable way to judge how hot or cold something is.',
 prior:'Hot and cold things around us.',
 simple:'Take three bowls: cold water, lukewarm water and warm water. Keep your left hand in cold and right hand in warm water for a minute, then put both in the lukewarm bowl. The left hand feels it is warm; the right hand feels it is cold. The same water feels different! So touch is not reliable; we need a measuring instrument.',
 detail:'Our skin feels hotness or coldness compared with what it touched before. Touching something very hot or very cold can also hurt us. Temperature (ताप) is a measure of how hot or cold something is, and a thermometer (तापमापी) measures it accurately.',
 real:'Mothers often check a child\'s forehead for fever by touch, but a thermometer gives the real value.',
 apply:'Why might the same bath water feel hot to one person and fine to another?',
 see:{w:520,h:220,f:[
  ['Left hand in cold water, right hand in warm water.',`<rect x="30" y="100" width="110" height="70" rx="8" fill="${BL}" opacity=".35"/><rect x="380" y="100" width="110" height="70" rx="8" fill="${RD}" opacity=".35"/>`+lbl(85,195,'cold')+lbl(435,195,'warm')],
  ['Then both hands in lukewarm water.',`<rect x="205" y="100" width="110" height="70" rx="8" fill="#e8b4a0" opacity=".5"/>`+lbl(260,195,'lukewarm')],
  ['Left feels "warm", right feels "cold": touch misleads.',lbl(170,70,'feels warm!','fill="'+RD+'"')+lbl(350,70,'feels cold!','fill="'+BL+'"')]]},
 seeNote:'Same water, different feelings.',
 do:{title:'Three-bowl test',mat:'Three bowls: cold, lukewarm, warm (not hot) water',steps:['Left hand in cold, right in warm for 1 minute.','Move both to lukewarm.','Note what each hand feels.'],obs:'Hands disagree.',why:'Touch compares, it does not measure.',lab:true},
 memo:'"Feel compares, thermometer measures."',
 miscon:['"Touch tells exact temperature." It is unreliable and can be unsafe.'],
 terms:['Temperature · ताप','Thermometer · तापमापी','Hot · गर्म','Cold · ठंडा'],
 q:{q:'Touch is not reliable for temperature because:',o:['skin cannot feel','it compares with what was touched before','water is always warm','hands are cold'],a:1,why:'Three-bowl activity.'},
 exam:'Describe the three-bowl activity: 2 marks.'},

{id:'t2',num:'7.2',title:'Temperature and its units · ताप के मात्रक',
 intro:'Is 37 a high or low temperature? It depends on the scale!',
 obj:'Use the Celsius scale and know of Fahrenheit and Kelvin.',
 prior:'Touch is unreliable (7.1).',
 simple:'Temperature is measured in degrees Celsius (°C) in daily life. On this scale, pure water freezes at 0 °C and boils at 100 °C. Some thermometers also show degrees Fahrenheit (°F). The SI unit of temperature is the kelvin (K).',
 detail:'Normal human body temperature is about 37.0 °C (98.6 °F), though it varies a little between people and through the day. Write temperatures with the symbol: 37 °C (degree Celsius), not "37 degrees". Kelvin is used in science; you will learn more in higher classes.',
 real:'Weather reports in India give temperatures in °C, e.g. "Rewari: maximum 42 °C".',
 apply:'Is 0 °C hot or cold? What happens to water at 0 °C?',
 see:{w:520,h:240,f:[
  ['A Celsius scale.',thermo(260,30,150,0,100,37,10)],
  ['0 °C: water freezes; 100 °C: water boils.',lbl(120,190,'0 °C: freezes','fill="'+BL+'"')+lbl(120,40,'100 °C: boils','fill="'+RD+'"')],
  ['Body ≈ 37 °C.',lbl(400,130,'body ≈ 37.0 °C','font-weight="700"')]]},
 seeNote:'Units: °C, °F; SI unit K.',
 do:{title:'Weather watch',mat:'Newspaper or weather app',steps:['Note your town\'s maximum and minimum temperature for a week.','Plot them.'],obs:'Temperatures change daily.',why:'Weather changes.',lab:false},
 memo:'"0 freeze, 100 boil, 37 body."',
 miscon:['"37 °C water feels hot because it is high." It is about body temperature.'],
 terms:['Degree Celsius (°C) · डिग्री सेल्सियस','Fahrenheit (°F)','Kelvin (K)','Freezing point','Boiling point'],
 q:{q:'Normal human body temperature is about:',o:['30 °C','37 °C','42 °C','100 °C'],a:1,why:'≈ 37.0 °C.'},
 exam:'Units of temperature; normal body temperature: 1 mark.'},

{id:'t3',num:'7.3',title:'Clinical thermometer · डॉक्टरी थर्मामीटर',
 intro:'Why does a doctor\'s thermometer only go from 35 to 42 °C?',
 obj:'Describe the clinical thermometer, its range and how to use and read it safely.',
 prior:'Celsius scale (7.2).',
 simple:'A clinical thermometer measures body temperature. Its range is 35 °C to 42 °C, because body temperature stays within this range. The older type is a glass tube with a bulb of mercury; a kink near the bulb stops the mercury falling back, so it can be read after removing. Digital thermometers are now common and safer.',
 detail:'Using a mercury clinical thermometer: wash it with antiseptic; hold it firmly and give it a few jerks to bring the mercury below 35 °C; place the bulb under the tongue for about a minute; remove and read with the eye in line with the mercury level; do not hold it by the bulb. Each small division on many clinical thermometers is 0.1 °C. Mercury is poisonous: if a thermometer breaks, tell an adult; do not touch the mercury. Many countries, including India, are moving to digital thermometers, which display the reading as a number and beep when done.',
 real:'In clinics and homes, digital thermometers are now used more than mercury ones.',
 apply:'Why must a mercury clinical thermometer be jerked before use?',
 see:{w:520,h:240,f:[
  ['Range 35 °C to 42 °C; divisions of 0.1 °C.',thermo(160,30,160,35,42,37,0.1,true,true)],
  ['The kink keeps mercury from falling back.',`<circle cx="160" cy="214" r="20" fill="none" stroke="#e0a02a" stroke-width="2"/>`+lbl(240,214,'kink','fill="#e0a02a"')],
  ['Digital thermometer: shows the number and beeps.',`<rect x="330" y="80" width="150" height="40" rx="20" fill="#f4f4f6" stroke="${ink}"/><rect x="380" y="88" width="70" height="24" fill="#d6ebf7"/>`+lbl(415,105,'37.2 °C','font-size="14" font-weight="700"')]]},
 seeNote:'Mercury is toxic: handle carefully.',
 do:{title:'Reading practice',mat:'A digital thermometer',steps:['Clean it; place under the tongue until it beeps.','Record your temperature morning and evening for 3 days.'],obs:'Values close to 37 °C, varying a little.',why:'Body temperature is fairly steady.',lab:false},
 memo:'"Shake down, under tongue, one minute, read straight."',
 miscon:['"Clinical thermometers can measure boiling water." They only go to 42 °C and may break.'],
 terms:['Clinical thermometer · डॉक्टरी थर्मामीटर','Kink · मोड़','Mercury · पारा','Digital thermometer · अंकीय थर्मामीटर'],
 q:{q:'The range of a clinical thermometer is:',o:['0–100 °C','35–42 °C','−10–110 °C','20–50 °C'],a:1,why:'Human body range.'},
 exam:'Precautions with a clinical thermometer: 2–3 marks.'},

{id:'t4',num:'7.4',title:'Laboratory thermometer · प्रयोगशाला थर्मामीटर',
 intro:'Why can\'t you take a laboratory thermometer out of hot water to read it?',
 obj:'Describe the laboratory thermometer and the correct way to measure the temperature of a liquid.',
 prior:'Clinical thermometer (7.3).',
 simple:'A laboratory thermometer measures the temperature of other objects, such as water. Its range is usually −10 °C to 110 °C. It has no kink, so the reading must be taken while the bulb is still in the liquid.',
 detail:'Correct method: hold the thermometer upright, not by the bulb; dip the bulb fully in the liquid without touching the bottom or sides of the container; wait until the level stops moving; read with your eye level with the top of the liquid column. Find the value of one small division first: e.g. if there are 10 divisions between 0 and 10 °C, each is 1 °C. The liquid in glass thermometers may be mercury or coloured alcohol.',
 real:'In cooking (e.g. making sugar syrup), cooks use kitchen thermometers that work like laboratory thermometers.',
 apply:'A laboratory thermometer has 5 divisions between 20 °C and 30 °C. What is each division worth?',
 see:{w:520,h:250,f:[
  ['Range −10 °C to 110 °C, no kink.',thermo(120,20,170,-10,110,24,2)],
  ['Bulb fully in the liquid, not touching the beaker.',`<path d="M300 90 v120 a10 10 0 0 0 10 10 h100 a10 10 0 0 0 10 -10 v-120" fill="none" stroke="${ink}" stroke-width="2"/><rect x="302" y="130" width="116" height="88" fill="${BL}" opacity=".25"/><line x1="360" y1="40" x2="360" y2="190" stroke="${ink}" stroke-width="5"/><circle cx="360" cy="195" r="8" fill="${RD}"/>`],
  ['Read while it is still in the liquid, eye level with the column.',lbl(360,240,'read in place · eye level','font-weight="700"')]]},
 seeNote:'Each small division here is 2 °C.',
 do:{title:'Cooling water',mat:'Lab thermometer, hot water in a beaker (adult help), clock',steps:['Record the temperature every 2 minutes for 20 minutes.','Plot the readings.'],obs:'The water cools quickly at first, then slowly.',why:'Hot water loses heat to the surroundings.',lab:true},
 memo:'"No kink, so read it in the drink."',
 miscon:['"You can take a lab thermometer out and read it later." The reading drops at once.'],
 terms:['Laboratory thermometer · प्रयोगशाला थर्मामीटर','Range · परिसर','Division · विभाजन','Bulb · बल्ब'],
 q:{q:'The range of a laboratory thermometer is usually:',o:['35–42 °C','−10–110 °C','0–50 °C','100–200 °C'],a:1,why:'NCERT range.'},
 exam:'Differences between clinical and laboratory thermometers: 3 marks.'},

{id:'t5',num:'7.5',title:'Infrared thermometers and air temperature · वायु का ताप',
 intro:'How did guards at stations check your temperature without touching you?',
 obj:'Know about infrared thermometers and how air temperature is measured and reported.',
 prior:'Thermometers (7.3, 7.4).',
 simple:'An infrared thermometer measures temperature without touching, by sensing the heat given off by the body; it is held near the forehead. Weather stations measure air temperature with thermometers kept in a shaded, ventilated box. Daily weather reports give the maximum and minimum temperatures.',
 detail:'Maximum–minimum thermometers record the highest and lowest temperatures of a day. Anna Mani, an Indian scientist at the India Meteorological Department, designed and built many weather instruments in India and helped measure solar radiation and wind energy. Temperatures change with season and place: Haryana\'s summers can go above 45 °C and winters near 0 °C on some nights.',
 real:'Infrared thermometers were widely used at entrances during the COVID-19 pandemic.',
 apply:'Why are weather thermometers kept in the shade, not in sunlight?',
 see:{w:520,h:220,f:[
  ['Infrared thermometer: no touch needed.',`<path d="M60 90 h60 v30 h-20 v40 h-20 v-40 h-20z" fill="#f4f4f6" stroke="${ink}"/><path d="M125 100 l60 -10 M125 110 l60 10" stroke="${RD}" stroke-dasharray="4 3"/><circle cx="210" cy="100" r="25" fill="#f2c9a0"/>`+lbl(140,190,'infrared · अवरक्त')],
  ['Weather box (in shade) for air temperature.',`<rect x="320" y="70" width="90" height="70" fill="#fff" stroke="${ink}"/>`+[0,1,2,3].map(i=>`<line x1="322" y1="${80+i*16}" x2="408" y2="${80+i*16}" stroke="${GR}"/>`).join('')+`<line x1="365" y1="140" x2="365" y2="200" stroke="${ink}" stroke-width="4"/>`+lbl(365,215,'max / min daily')],
  ['Anna Mani built weather instruments in India.',lbl(260,40,'Anna Mani · अन्ना मणि','font-weight="700"')]]},
 seeNote:'Air temperature is measured in shade.',
 do:{title:'Max–min log',mat:'Weather app or newspaper',steps:['Record max and min temperature for 7 days.','Find the difference each day.'],obs:'Days are warmer than nights.',why:'Sunlight heats the day.',lab:false},
 memo:'"Infrared: no touch. Weather: shade, max and min."',
 miscon:['"Air temperature is measured in sunlight." It must be in shade.'],
 terms:['Infrared thermometer · अवरक्त थर्मामीटर','Maximum–minimum temperature','Weather station · मौसम केंद्र'],
 q:{q:'An infrared thermometer:',o:['must go under the tongue','measures without touching','has mercury','only reads 0–10 °C'],a:1,why:'Senses heat given off.'},
 exam:'Uses of different thermometers: 2 marks.'}
];

const CARDS=[['Temperature · ताप','How hot or cold something is.'],['Touch','Unreliable: three-bowl test.'],['Units','°C (daily), °F, K (SI).'],['Water','Freezes 0 °C, boils 100 °C.'],['Body','≈ 37.0 °C (98.6 °F).'],['Clinical thermometer','35–42 °C, kink, 0.1 °C divisions.'],['Using clinical','Shake below 35, under tongue 1 min, don\'t hold bulb.'],['Laboratory thermometer','−10–110 °C, no kink; read in liquid.'],['Digital','Shows a number; safer than mercury.'],['Infrared','No-contact measurement.'],['Air temperature','In shade; max and min daily.'],['Anna Mani','Indian scientist who built weather instruments.']];

const Q=[
 {lv:1,q:'Temperature is measured with a:',o:['barometer','thermometer','ruler','balance'],a:1,w:'Thermometer.'},
 {lv:1,q:'Normal body temperature:',o:['37 °C','27 °C','47 °C','100 °C'],a:0,w:'About 37 °C.'},
 {lv:1,q:'Range of a clinical thermometer:',o:['35–42 °C','−10–110 °C','0–100 °C','20–60 °C'],a:0,w:'Body range.'},
 {lv:2,q:'Why is there a kink in a clinical thermometer?',o:['to look nice','to stop mercury falling back on its own','to measure faster','to hold it'],a:1,w:'So it can be read after removing.'},
 {lv:2,q:'To measure the temperature of boiling water, use a:',o:['clinical thermometer','laboratory thermometer','ruler','compass'],a:1,w:'Range up to 110 °C.'},
 {lv:2,q:'A thermometer that measures without touching:',o:['clinical','laboratory','infrared','mercury'],a:2,w:'Infrared.'},
 {lv:3,q:'There are 5 divisions between 20 °C and 30 °C. Each division is:',o:['1 °C','2 °C','5 °C','10 °C'],a:1,w:'10/5.'},
 {lv:3,q:'While measuring water temperature, the bulb should:',o:['touch the bottom','be fully in water, not touching the sides','be out of water','be held in hand'],a:1,w:'Correct method.'},
 {lv:4,q:'A laboratory thermometer is taken out of hot water before reading. The reading will be:',o:['correct','too high','lower than the water\'s temperature','zero'],a:2,w:'It starts cooling at once.'},
 {lv:4,q:'Why should a clinical thermometer not be used for hot water?',o:['it is too long','its range ends at 42 °C and it may break','it reads in °F','it has no bulb'],a:1,w:'Limited range.'},
 {lv:5,open:true,m:3,q:'Give three differences between a clinical and a laboratory thermometer.',ans:['Clinical: 35–42 °C; laboratory: −10–110 °C (1)','Clinical has a kink; laboratory has none (1)','Clinical for body; laboratory for other objects, read while in place (1)']},
 {lv:5,open:true,m:3,q:'List three precautions when using a clinical thermometer.',ans:['Wash with antiseptic; jerk mercury below 35 °C (1)','Place under tongue ~1 minute; do not hold by the bulb (1)','Read with eye level; handle carefully — mercury is toxic (1)']}
];

const ONEMIN=['Touch is unreliable (three bowls).','Temperature in °C; also °F; SI unit K.','Water: 0 °C freezes, 100 °C boils; body ≈ 37 °C.','Clinical: 35–42 °C, kink, shake down, under tongue.','Laboratory: −10–110 °C, no kink, read in liquid, bulb not touching container.','Digital and infrared thermometers.','Air temperature in shade; Anna Mani.'];
const KEYS=[['touch unreliable',/touch|bowl/i],['°C',/celsius|°C/i],['37 °C',/37/],['clinical 35–42',/clinical|35|42/i],['kink',/kink/i],['laboratory −10–110',/laboratory|110/i],['read in liquid',/in the liquid|in place|not touch/i],['digital/infrared',/digital|infrared/i]];

/* ---------- lab ---------- */
const W={ice:[0,'Ice water'],tap:[24,'Tap water'],body:[37,'Body'],fever:[38.6,'Body with fever'],warm:[42,'Warm bath water'],boil:[100,'Boiling water']};let th='lab',wh='ice';
function draw(){const [v,n]=W[wh];let s='';if(th==='lab')s=thermo(200,20,250,-10,110,v,2);else{const ok=v>=35&&v<=42;s=thermo(200,40,230,35,42,Math.max(34.6,Math.min(42.4,v)),0.1,true,true);if(!ok)s+=T(320,150,v>42?'⚠ above range — may break!':'⚠ below range',`font-size="14" font-weight="700" fill="${RD}"`)}
 s+=T(80,300,n,'font-size="14" font-weight="700"');$('#hSvg').innerHTML=s;$('#hOut').innerHTML=`<p>Read the scale, type your reading and press Check.</p>`}
function check(){const [v,n]=W[wh];const g=parseFloat($('#hGuess').value);const ok=th==='cli'?(v>=35&&v<=42):true;const tol=th==='lab'?1.5:0.15;
 if(!ok){$('#hOut').innerHTML=`<p class="fb no">A clinical thermometer cannot measure ${n.toLowerCase()} (${v} °C). Use a laboratory thermometer.</p>`;return}
 $('#hOut').innerHTML=isNaN(g)?'<p>Enter a number first.</p>':Math.abs(g-v)<=tol?`<p class="fb ok">Correct! ${n}: about ${v} °C.</p>`:`<p class="fb no">Not quite. Count the value of one small division (${th==='lab'?'2 °C':'0.1 °C'}) and try again.</p>`}
function labShow(){draw()}
function labInit(){}
function labClick(b){if(b.id==='hCheck'){check();return true}return false}
function labChange(t){if(t.id==='hTh'){th=t.value;draw();return true}if(t.id==='hWhat'){wh=t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
