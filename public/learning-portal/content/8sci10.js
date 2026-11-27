/* Rai Plus content pack: Class 8 Science (Curiosity), Chapter 10 – Light: Mirrors and Lenses. */
RP.register({key:'8sci10',cls:'8',subject:'Science',ch:'10',title:"Light: Mirrors and Lenses",color:'#b8860b',
crumb:"Class 8 Science · Curiosity",h1:"Chapter 10: Light — Mirrors and Lenses",sub:"Reflection and its laws, images in plane mirrors, concave and convex mirrors, convex and concave lenses, the images they form, and their uses in daily life.",heroLabel:"Light rays bending through a lens",labName:'Ray diagram simulator',
theme:"\n:root{--g:light-dark(#8a6508,#f0cf7a);--g2:light-dark(#fbf5e4,#1d1704);--line:light-dark(#efe0b4,#463a14);--bg:light-dark(#ffffff,#120e04);--card:light-dark(#ffffff,#1b1507);\n--ink:light-dark(#2a2108,#f6efdc);--mute:light-dark(#6d6040,#d0c4a3);--y:light-dark(#1f5f8b,#8fc2e6);--y2:light-dark(#e8f1f8,#0b1622);--hd:#6e5106}\n",
labHTML:`  <h2>Ray diagram simulator</h2>
  <p>Choose a mirror or lens and move the object (the orange arrow). Two rays are drawn to find the image. Watch when the image is real or virtual, upright or inverted, bigger or smaller. F is the focus; distances are in cm.</p>
  <div class="sim"><div><div class="fig" style="max-width:none"><svg id="rSvg" viewBox="0 0 460 320" role="img" aria-label="Ray diagram" style="color:var(--ink)"></svg></div></div>
  <div><div class="ctrl"><label>Device<select id="rD"><option value="cvl">Convex lens</option><option value="ccl">Concave lens</option><option value="ccm">Concave mirror</option><option value="cvm">Convex mirror</option><option value="pm">Plane mirror</option></select></label></div>
  <div class="ctrl"><label>Object distance (cm): <b id="rUv"></b><input type="range" class="rS" id="rU" min="4" max="40" value="25"></label></div>
  <div class="ctrl"><label>Focal length (cm): <b id="rFv"></b><input type="range" class="rS" id="rF" min="6" max="15" value="10"></label></div>
  <div class="box y" id="rOut" aria-live="polite"></div></div></div>
`,
build:function(){

const ACC='#b8860b',LABNAME='Ray diagram simulator',MIND_CENTER='Light';
const GD='#b8860b',OR='#b04a1f',BL='#1f5f8b',GN='#3b6d11',PU='#6a4fb3',GR='#888780',ink='currentColor';
const lbl=(x,y,t,o='')=>T(x,y,t,o+' font-size="13"');
const box=(x,y,w,h,t,c,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>`+T(x+w/2,y+h/2+(sub?-3:5),t,`font-size="13" font-weight="700" fill="${c}"`)+(sub?T(x+w/2,y+h/2+14,sub,'font-size="10"'):'');
const arr=(x1,y1,x2,y2,c=GR,w=2.5,dash='')=>{const a=Math.atan2(y2-y1,x2-x1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" ${dash?`stroke-dasharray="${dash}"`:''}/><path d="M${x2} ${y2} L${x2-9*Math.cos(a-.45)} ${y2-9*Math.sin(a-.45)} L${x2-9*Math.cos(a+.45)} ${y2-9*Math.sin(a+.45)}Z" fill="${c}"/>`};
const ray=(x1,y1,x2,y2,c=GD,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.8" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
function lensShape(x,cy,h,convex){return convex?`<path d="M${x} ${cy-h} Q${x+18} ${cy} ${x} ${cy+h} Q${x-18} ${cy} ${x} ${cy-h}Z" fill="${BL}" fill-opacity=".2" stroke="${BL}" stroke-width="2"/>`:`<path d="M${x-10} ${cy-h} L${x+10} ${cy-h} Q${x+2} ${cy} ${x+10} ${cy+h} L${x-10} ${cy+h} Q${x-2} ${cy} ${x-10} ${cy-h}Z" fill="${BL}" fill-opacity=".2" stroke="${BL}" stroke-width="2"/>`}
function heroDraw(){return `<path d="M190 30 Q210 80 190 130 Q170 80 190 30Z" fill="none" stroke="#fff" stroke-width="3"/><path d="M60 60 L190 60 L300 100 M60 100 L190 100 L300 60" fill="none" stroke="#fff" stroke-width="2"/>`}
const HERO=heroDraw;
const MIND=[['Reflection',100,50],['Plane mirror images',420,50],['Concave & convex mirrors',90,150],['Lenses',430,150],['Images by lenses',110,250],['Uses',410,250]];

const C=[
{id:'l1',num:'10.1',title:'Reflection of light',
 intro:'Why can you see yourself in a still pond but not in a rough brick wall?',
 obj:'State the laws of reflection and distinguish regular and diffuse reflection.',
 prior:'Class 6–7: light travels in straight lines; shadows.',
 simple:'When light falls on a surface and bounces back, it is reflected. The ray hitting the surface is the incident ray; the ray bouncing off is the reflected ray; the normal is a line perpendicular to the surface at that point. Laws of reflection: (1) the angle of incidence equals the angle of reflection; (2) the incident ray, the reflected ray and the normal all lie in the same plane.',
 detail:'Smooth, shiny surfaces (mirror, still water) give regular reflection — parallel rays stay parallel, forming clear images. Rough surfaces give diffuse (irregular) reflection — rays scatter in all directions, so no image forms, but we can see the object from everywhere. The laws still hold at every tiny point.',
 real:'Road signs use special reflecting materials so they shine in headlights at night.',
 apply:'A ray hits a mirror at 35° to the normal. At what angle to the normal is it reflected?',
 see:{w:520,h:220,f:[
  ['Mirror and normal.',`<line x1="80" y1="180" x2="440" y2="180" stroke="${ink}" stroke-width="4"/>`+[...Array(18)].map((_,k)=>`<line x1="${85+k*20}" y1="182" x2="${77+k*20}" y2="194" stroke="${GR}"/>`).join('')+`<line x1="260" y1="180" x2="260" y2="30" stroke="${GR}" stroke-dasharray="5 4"/>`+lbl(260,22,'normal','font-size="11"')],
  ['Incident ray.',arr(140,60,258,178,GD,2.5)+lbl(120,55,'incident','fill="'+GD+'"')],
  ['Reflected ray: angle i = angle r.',arr(260,180,380,60,OR,2.5)+lbl(400,55,'reflected','fill="'+OR+'"')+lbl(232,140,'i','font-size="14" font-weight="700"')+lbl(288,140,'r','font-size="14" font-weight="700"')+lbl(260,212,'∠i = ∠r','font-size="15" font-weight="700"')]]},
 seeNote:'Angle in = angle out.',
 do:{title:'Torch and mirror',mat:'Torch with slit, plane mirror, protractor',steps:['Shine a narrow beam onto a mirror at different angles.','Measure angles i and r.'],obs:'Always equal.',why:'First law.',lab:false},
 memo:'"In equals out, all in one plane."',
 miscon:['"Rough surfaces don\'t reflect light." They reflect it in all directions (diffuse).'],
 terms:['Reflection · परावर्तन','Incident ray · आपतित किरण','Reflected ray · परावर्तित किरण','Normal · अभिलंब','Diffuse reflection · विसरित परावर्तन'],
 q:{q:'If the angle of incidence is 40°, the angle of reflection is:',o:['50°','40°','80°','20°'],a:1,why:'Equal.'},
 exam:'Laws of reflection: 2 marks.'},

{id:'l2',num:'10.2',title:'Images in a plane mirror',
 intro:'When you raise your right hand in front of a mirror, which hand does your image raise?',
 obj:'Describe the characteristics of an image formed by a plane mirror.',
 prior:'10.1.',
 simple:'A plane (flat) mirror forms an image that is: upright (erect); the same size as the object; as far behind the mirror as the object is in front; virtual (cannot be caught on a screen); and laterally inverted (left and right are swapped).',
 detail:'If you stand 2 m from a mirror, your image is 2 m behind it — 4 m from you. Lateral inversion is why "AMBULANCE" is written in mirror letters on ambulances, so drivers see it correctly in their rear-view mirrors. Two mirrors at an angle form many images; a kaleidoscope uses this.',
 real:'Ambulances have "ƎƆИA⅃UᗺMA" written in mirror letters on the front.',
 apply:'You stand 1.5 m from a plane mirror and walk 0.5 m towards it. How far is your image from you now?',
 see:{w:520,h:220,f:[
  ['Object in front of a mirror.',`<line x1="260" y1="30" x2="260" y2="200" stroke="${BL}" stroke-width="5"/>`+arr(140,180,140,90,OR,4)+lbl(140,200,'object')],
  ['Image same distance behind.',arr(380,180,380,90,OR,4,'6 4')+lbl(380,200,'image (virtual)')],
  ['Same size, upright, laterally inverted.',lbl(200,60,'d','font-size="14"')+lbl(320,60,'d','font-size="14"')+lbl(260,215,'same size · upright · left ↔ right','font-weight="700"')]]},
 seeNote:'As far behind as in front.',
 do:{title:'Mirror writing',mat:'Plane mirror, paper',steps:['Write your name; view it in the mirror.','Try writing so it reads correctly in the mirror.'],obs:'Letters reversed.',why:'Lateral inversion.',lab:false},
 memo:'"Same size, same distance, swapped sides."',
 miscon:['"The image is on the mirror surface." It appears behind the mirror.'],
 terms:['Plane mirror · समतल दर्पण','Virtual image · आभासी प्रतिबिंब','Erect · सीधा','Lateral inversion · पार्श्व परिवर्तन'],
 q:{q:'A plane mirror image is:',o:['real and inverted','virtual and upright','real and upright','smaller'],a:1,why:'Plane mirror.'},
 exam:'Characteristics of plane mirror image: 2 marks.'},

{id:'l3',num:'10.3',title:'Concave and convex mirrors',
 intro:'Why does the inside of a steel spoon show you upside down, but the back shows you upright and tiny?',
 obj:'Describe concave and convex mirrors, their images and uses.',
 prior:'10.2.',
 simple:'Spherical mirrors are curved. A concave mirror curves inwards (like the inside of a spoon); it converges (brings together) parallel rays to a point called the focus (F). A convex mirror bulges outwards (like the back of a spoon); it diverges (spreads out) rays. Concave mirror: when the object is far, the image is real, inverted and smaller; very close to it (inside F), the image is virtual, upright and magnified. Convex mirror: always virtual, upright and smaller, with a wide field of view.',
 detail:'Uses — concave: shaving and make-up mirrors (magnified upright image when close), dentists\' mirrors, torch and headlight reflectors (bulb at the focus sends a parallel beam), solar cookers (sunlight focused). Convex: rear-view mirrors of vehicles and mirrors at sharp hill-road bends, because they show a wide area.',
 real:'Hill roads in Himachal and Uttarakhand have convex mirrors at blind turns.',
 apply:'Why are convex mirrors used as rear-view mirrors?',
 see:{w:520,h:240,f:[
  ['Concave mirror converges rays.',`<path d="M200 30 Q235 120 200 210" fill="none" stroke="${BL}" stroke-width="5"/>`+[60,100,140,180].map(y=>ray(30,y,215-(Math.abs(y-120)/5),y)+ray(215-(Math.abs(y-120)/5),y,120,120)).join('')+`<circle cx="120" cy="120" r="4" fill="${OR}"/>`+lbl(120,140,'F','font-weight="700"')],
  ['Convex mirror diverges rays.',`<path d="M330 30 Q295 120 330 210" fill="none" stroke="${BL}" stroke-width="5"/>`+[60,100,140,180].map(y=>{const x=330-(1-Math.abs(y-120)/90)*15;return ray(260,y,x,y)+ray(x,y,260,y+(y-120)*0.9)}).join('')],
  ['Uses.',lbl(130,232,'concave: torch reflector, shaving mirror','font-size="11"')+lbl(390,232,'convex: rear-view mirror','font-size="11"')]]},
 seeNote:'Concave collects; convex spreads.',
 do:{title:'Spoon mirrors',mat:'Shiny steel spoon',steps:['Look into the inside, then the back.','Move it closer and farther.'],obs:'Inside: inverted far, upright very close; back: always upright, small.',why:'Concave vs convex.',lab:true},
 memo:'"Concave caves in and collects; convex bulges and spreads."',
 miscon:['"Concave mirrors always invert images." Very close objects give an upright, magnified image.'],
 terms:['Concave mirror · अवतल दर्पण','Convex mirror · उत्तल दर्पण','Focus · फोकस','Converge · अभिसरण','Diverge · अपसरण'],
 q:{q:'Rear-view mirrors are:',o:['plane','concave','convex','none'],a:2,why:'Wide view.'},
 exam:'Spherical mirrors: images and uses: 3 marks.'},

{id:'l4',num:'10.4',title:'Lenses: convex and concave',
 intro:'How does a magnifying glass make tiny letters look big — and focus sunlight to burn paper?',
 obj:'Describe convex and concave lenses and how they bend light.',
 prior:'10.3; light bends when it passes between materials (refraction).',
 simple:'A lens is a piece of transparent glass or plastic with curved surfaces. Light bends (refracts) as it passes through it. A convex lens is thicker in the middle; it converges parallel rays to a focus — a converging lens. A concave lens is thinner in the middle; it spreads rays out as if they came from a focus — a diverging lens.',
 detail:'The distance from the centre of the lens to the focus is the focal length. A ray through the centre of a thin lens goes straight on. Never look at the Sun through a lens — it can burn the eye. Water drops can act like tiny convex lenses.',
 real:'A convex lens can focus sunlight onto paper and burn it — that\'s why lenses must be handled carefully.',
 apply:'Which lens could you use to start a fire with sunlight? Why?',
 see:{w:520,h:240,f:[
  ['Convex lens converges.',lensShape(150,120,80,true)+[70,100,140,170].map(y=>ray(20,y,150,y)+ray(150,y,240,120+(120-y)*-0.0)+'').join('')+[70,100,140,170].map(y=>ray(150,y,240,120)).join('')+`<circle cx="240" cy="120" r="4" fill="${OR}"/>`+lbl(240,140,'F')],
  ['Concave lens diverges.',lensShape(370,120,80,false)+[70,100,140,170].map(y=>ray(280,y,370,y)+ray(370,y,460,y+(y-120)*0.9)).join('')],
  ['Converging vs diverging.',lbl(150,225,'converging (thick middle)','font-size="11"')+lbl(370,225,'diverging (thin middle)','font-size="11"')]]},
 seeNote:'Thick middle converges; thin middle diverges.',
 do:{title:'Burning spot (outdoors, teacher)',mat:'Convex lens, paper',steps:['Focus sunlight on paper into the smallest spot.','Measure lens–paper distance.'],obs:'Paper smokes; distance ≈ focal length.',why:'Converging lens.',lab:false},
 memo:'"Convex: fat middle, focuses."',
 miscon:['"Lenses reflect light like mirrors." Lenses refract (bend) light passing through.'],
 terms:['Lens · लेंस','Convex lens · उत्तल लेंस','Concave lens · अवतल लेंस','Refraction · अपवर्तन','Focal length · फोकस दूरी'],
 q:{q:'A lens thicker in the middle is:',o:['concave','convex','plane','prism'],a:1,why:'Converging.'},
 exam:'Types of lenses: 2 marks.'},

{id:'l5',num:'10.5',title:'Images formed by lenses',
 intro:'A convex lens shows an upside-down room on a wall — and a magnified upright fingerprint when held close. How can one lens do both?',
 obj:'Describe the images formed by convex and concave lenses for different object positions.',
 prior:'10.4.',
 simple:'Convex lens: object far away (beyond 2F) → real, inverted, smaller image on the other side (can be caught on a screen). Object between F and 2F → real, inverted, magnified. Object inside F → virtual, upright, magnified on the same side — this is how a magnifying glass works. Concave lens: always virtual, upright and smaller.',
 detail:'Two rays find the image: a ray parallel to the axis bends through F; a ray through the centre goes straight. Where they meet (or appear to meet), the image forms. A camera and our eye use a convex lens to form a real, inverted image on film/retina.',
 real:'A slide projector places the slide between F and 2F to throw a large inverted image on the screen (slides are put in upside down).',
 apply:'Where must you hold a convex lens to use it as a magnifying glass?',
 see:{w:520,h:240,f:[
  ['Object beyond 2F.',`<line x1="10" y1="140" x2="510" y2="140" stroke="${GR}"/>`+lensShape(260,140,90,true)+arr(80,140,80,90,OR,4)+[[180,'F'],[100,'2F'],[340,'F'],[420,'2F']].map(([x,t])=>`<circle cx="${x}" cy="140" r="3" fill="${ink}"/>`+lbl(x,158,t,'font-size="11"')).join('')],
  ['Rays meet on the other side.',ray(80,90,260,90)+ray(260,90,410,165)+ray(80,90,410,165)],
  ['Real, inverted, smaller.',arr(372,140,372,159,PU,3.5)+lbl(372,190,'real, inverted, smaller','font-size="11" fill="'+PU+'"')]]},
 seeNote:'Object position decides the image.',
 do:{title:'Image on a wall',mat:'Convex lens, white wall, window',steps:['Hold the lens between a window and a wall.','Move until a sharp image appears.'],obs:'Small, inverted image of the window.',why:'Real image.',lab:true},
 memo:'"Far: small and flipped. Close: big and upright."',
 miscon:['"A convex lens always magnifies." Only when the object is close (inside F or between F and 2F).'],
 terms:['Real image · वास्तविक प्रतिबिंब','Virtual image · आभासी प्रतिबिंब','Magnification · आवर्धन','Principal axis · मुख्य अक्ष'],
 q:{q:'A magnifying glass uses a convex lens with the object:',o:['beyond 2F','at 2F','inside F','at infinity'],a:2,why:'Virtual, magnified.'},
 exam:'Images by convex lens: 3 marks.'},

{id:'l6',num:'10.6',title:'Uses of mirrors and lenses',
 intro:'Spectacles, cameras, microscopes, telescopes, periscopes — how do mirrors and lenses help us see more?',
 obj:'Link mirrors and lenses to everyday and scientific instruments, and to eye care.',
 prior:'10.1–10.5.',
 simple:'Lenses: spectacles correct vision — a concave lens for short-sightedness (myopia: far objects blurred), a convex lens for long-sightedness (hypermetropia: near objects blurred). Magnifying glasses, cameras, projectors, microscopes and telescopes use convex lenses. Mirrors: periscopes use two plane mirrors; kaleidoscopes use angled mirrors; solar cookers and torch reflectors use concave mirrors; vehicles use convex mirrors.',
 detail:'Our eye has a natural convex lens that forms a real, inverted image on the retina; the brain turns it upright. Eye care: read in good light, take breaks from screens (the 20-20-20 rule — every 20 minutes, look at something 20 feet away for 20 seconds), never look directly at the Sun, and get eyes tested regularly.',
 real:'Many students now need glasses for short-sightedness — more outdoor time can help prevent it.',
 apply:'Which lens would a short-sighted student need? Why?',
 see:{w:520,h:220,f:[
  ['Spectacles.',box(20,40,150,55,'Spectacles',BL,'concave: myopia · convex: hypermetropia')],
  ['Instruments.',box(185,40,150,55,'Instruments',PU,'camera · microscope · telescope')],
  ['Mirrors at work.',box(350,40,150,55,'Mirrors',GD,'periscope · solar cooker · rear-view')+lbl(260,160,'20-20-20 rule for screen time','font-weight="700" fill="'+GN+'"')]]},
 seeNote:'Optics everywhere.',
 do:{title:'Make a periscope',mat:'Cardboard tube or box, two small plane mirrors',steps:['Fix mirrors at 45° at both ends.','Look over a wall.'],obs:'See over obstacles.',why:'Two reflections.',lab:false},
 memo:'"Myopia: minus (concave). Hypermetropia: plus (convex)."',
 miscon:['"Glasses weaken your eyes." They help you see clearly; follow the doctor\'s advice.'],
 terms:['Myopia · निकट दृष्टि दोष','Hypermetropia · दूर दृष्टि दोष','Periscope · परिदर्शी','Retina · दृष्टिपटल'],
 q:{q:'A periscope uses:',o:['two convex lenses','two plane mirrors','one concave mirror','a prism only'],a:1,why:'Two reflections.'},
 exam:'Uses of mirrors and lenses: 3 marks.'}
];

const CARDS=[['Laws of reflection','∠i = ∠r; all in one plane.'],['Diffuse reflection','Rough surfaces scatter light.'],['Plane mirror','Upright, same size, virtual, laterally inverted.'],['Concave mirror','Converges; torch reflector, shaving mirror.'],['Convex mirror','Diverges; wide view; rear-view mirror.'],['Convex lens','Thick middle; converges.'],['Concave lens','Thin middle; diverges.'],['Magnifier','Convex lens, object inside F.'],['Real image','Can be caught on a screen; inverted.'],['Spectacles','Concave for myopia; convex for hypermetropia.']];

const Q=[
 {lv:1,q:'Angle of incidence 30°; angle of reflection:',o:['60°','30°','90°','15°'],a:1,w:'Equal.'},
 {lv:1,q:'Image in a plane mirror is:',o:['real','virtual','inverted','magnified'],a:1,w:'Virtual.'},
 {lv:1,q:'A lens thinner at the middle is:',o:['convex','concave'],a:1,w:'Diverging.'},
 {lv:2,q:'Torch reflectors are:',o:['plane','concave','convex','lens'],a:1,w:'Parallel beam.'},
 {lv:2,q:'Short-sightedness is corrected by:',o:['convex lens','concave lens','plane mirror','prism'],a:1,w:'Diverging.'},
 {lv:2,q:'"AMBULANCE" is written in reverse because of:',o:['refraction','lateral inversion','dispersion','diffusion'],a:1,w:'Mirror image.'},
 {lv:3,q:'You stand 3 m from a plane mirror. Distance to your image:',o:['3 m','6 m','1.5 m','9 m'],a:1,w:'3 + 3.'},
 {lv:3,q:'Convex lens, object beyond 2F: image is',o:['virtual, upright','real, inverted, smaller','real, magnified','no image'],a:1,w:'Far object.'},
 {lv:4,q:'Which always gives a virtual, upright, smaller image?',o:['concave mirror','convex lens','convex mirror','plane mirror'],a:2,w:'Convex mirror (also concave lens).'},
 {lv:4,q:'A real image can be:',o:['seen only in mirrors','caught on a screen','never inverted','only virtual'],a:1,w:'Real.'},
 {lv:5,open:true,m:3,q:'State the characteristics of an image formed by a plane mirror.',ans:['Virtual and upright (1)','Same size; as far behind as object in front (1)','Laterally inverted (1)']},
 {lv:5,open:true,m:5,q:'Describe how the image formed by a convex lens changes as an object is brought closer from far away.',ans:['Beyond 2F: real, inverted, smaller (1)','At 2F: real, inverted, same size (1)','Between F and 2F: real, inverted, magnified (1)','At F: image at infinity/no clear image (1)','Inside F: virtual, upright, magnified (magnifier) (1)']}
];

const ONEMIN=['Laws of reflection; regular vs diffuse.','Plane mirror image properties.','Concave converges; convex diverges.','Convex and concave lenses.','Images by convex lens; magnifier.','Uses: spectacles, periscope, instruments.'];
const KEYS=[['reflection',/reflect/i],['plane mirror',/plane mirror|lateral/i],['concave',/concave/i],['convex',/convex/i],['real/virtual',/real|virtual/i],['uses',/spectacle|periscope|camera|rear-view/i]];

/* ---------- lab ---------- */
let dev='cvl',U=25,F=10,wired=false;
function draw(){const cx=dev==='pm'||dev==='ccm'||dev==='cvm'?300:230,cy=170,sc=6,oh=40;$('#rUv').textContent=U;$('#rFv').textContent=F;
 let s=`<line x1="5" y1="${cy}" x2="455" y2="${cy}" stroke="${GR}" stroke-width="1"/>`;const ox=cx-U*sc,ot=cy-oh;s+=arr(ox,cy,ox,ot,OR,4);
 let v,m,real=false,info='';
 if(dev==='cvl'||dev==='ccl'){const f=dev==='cvl'?F:-F;s+=lensShape(cx,cy,95,dev==='cvl');[-1,1].forEach(k=>{const x=cx+k*F*sc;s+=`<circle cx="${x}" cy="${cy}" r="3" fill="${ink}"/>`+T(x,cy+16,'F','font-size="11"')});
  if(dev==='cvl'&&Math.abs(U-F)<.01){v=Infinity}else{v=U*f/(U-f);}m=v===Infinity?Infinity:-v/U;
  if(v===Infinity){s+=ray(ox,ot,cx,ot)+ray(cx,ot,455,ot+(455-cx)*oh/(F*sc))+ray(ox,ot,455,ot+(455-ox)*oh/(U*sc));info='Object at F: refracted rays are parallel — no clear image (image at infinity).'}
  else{const ix=cx+v*sc,ih=m*oh;real=v>0;
   const slope1=(cy-ot)/(f*sc);s+=ray(ox,ot,cx,ot)+(real?ray(cx,ot,ix,cy-ih):ray(cx,ot,455,ot+slope1*(455-cx))+ray(cx,ot,ix,cy-ih,GD,'5 4'));
   const sl2=(cy-ot)/(cx-ox);s+=real?ray(ox,ot,ix,cy-ih):ray(ox,ot,455,ot+sl2*(455-ox))+ray(cx,cy,ix,cy-ih,GD,'5 4');
   if(ix>-50&&ix<510)s+=arr(ix,cy,ix,cy-ih,PU,4,real?'':'6 4');info=`Image ${Math.abs(v).toFixed(1)} cm ${v>0?'behind the lens (other side)':'on the same side as the object'}.`}}
 else if(dev==='pm'){s+=`<line x1="${cx}" y1="40" x2="${cx}" y2="290" stroke="${BL}" stroke-width="5"/>`;const ix=cx+U*sc;s+=arr(ix,cy,ix,ot,PU,4,'6 4')+ray(ox,ot,cx,ot)+ray(cx,ot,ox,ot+10)+ray(cx,ot,ix,ot,GD,'5 4');v=-U;m=1;info=`Image ${U} cm behind the mirror — as far behind as the object is in front.`}
 else{const f=dev==='ccm'?F:-F;const curv=dev==='ccm'?22:-22;s+=`<path d="M${cx-curv} ${cy-100} Q${cx+curv} ${cy} ${cx-curv} ${cy+100}" fill="none" stroke="${BL}" stroke-width="5"/>`;const fx=cx-f*sc;s+=`<circle cx="${fx}" cy="${cy}" r="3" fill="${ink}"/>`+T(fx,cy+16,'F','font-size="11"');
  if(dev==='ccm'&&Math.abs(U-F)<.01){v=Infinity;info='Object at F: reflected rays are parallel — no clear image.';s+=ray(ox,ot,cx,ot)+ray(cx,ot,5,ot+(cx-5)*oh/(F*sc))}
  else{v=U*f/(U-f);m=-v/U;real=v>0;const ix=cx-v*sc,ih=m*oh;
   s+=ray(ox,ot,cx,ot);const sl=(cy-ot)/(f*sc);if(real)s+=ray(cx,ot,ix,cy-ih);else s+=ray(cx,ot,Math.max(5,cx-140),ot+sl*Math.min(140,cx-5))+ray(cx,ot,ix,cy-ih,GD,'5 4');
   s+=ray(ox,ot,cx,cy)+ray(cx,cy,Math.max(5,ox),cy+oh*(cx-Math.max(5,ox))/(cx-ox))+(real?'':ray(cx,cy,ix,cy-ih,GD,'5 4'));if(ix>-50&&ix<510)s+=arr(ix,cy,ix,cy-ih,PU,4,real?'':'6 4');info=`Image ${Math.abs(v).toFixed(1)} cm ${real?'in front of the mirror':'behind the mirror'}.`}}
 $('#rSvg').innerHTML=s;
 let nature='';if(v===Infinity)nature='No image (at infinity).';else{const mag=Math.abs(m);nature=`<b>${real?'Real':'Virtual'}, ${m<0?'inverted':'upright'}, ${mag>1.05?'magnified':mag<.95?'diminished':'same size'}</b> (×${mag.toFixed(2)}).`}
 const tip=dev==='cvl'&&U<F?' This is how a magnifying glass works.':dev==='cvm'?' Wide field of view — used as rear-view mirrors.':dev==='ccm'&&U<F?' Like a shaving or make-up mirror.':dev==='ccl'?' A concave lens always gives this kind of image.':'';
 $('#rOut').innerHTML=`<p>${nature}</p><p>${info}${tip}</p>`}
function labShow(){draw()}
function labInit(){if(wired)return;wired=true;document.addEventListener('input',e=>{if(!e.target||!e.target.classList||!e.target.classList.contains('rS'))return;if(e.target.id==='rU')U=+e.target.value;else F=+e.target.value;draw()})}
function labClick(){return false}
function labChange(t){if(t.id==='rD'){dev=t.value;draw();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
