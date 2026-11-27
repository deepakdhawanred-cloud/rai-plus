/* Rai Plus: tiny ball-and-stick 3D molecule viewer (no libraries). MOL3D.view(canvas,key,opts) */
(function(){
const V={add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul:(a,k)=>[a[0]*k,a[1]*k,a[2]*k],
 len:a=>Math.hypot(a[0],a[1],a[2]),norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]},
 cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]};
const S8=Math.sqrt(8)/3,TH=54.75*Math.PI/180;
function perp(d){const t=Math.abs(d[0])<.9?[1,0,0]:[0,1,0];const u=V.norm(V.cross(d,t));return[u,V.cross(d,u)]}
function hDirs(nb,n,hyb,pos,centroid){
 if(hyb==='r')return[V.norm(pos)];
 if(hyb==='sp')return[V.mul(nb[0],-1)];
 if(hyb==='sp2'){const d=nb[0],z=[0,0,1];const r=(a)=>{const c=Math.cos(a),s=Math.sin(a);const p=V.cross(z,d);return V.norm(V.add(V.mul(d,c),V.mul(p,s)))};return nb.length===1?[r(2.094),r(-2.094)]:[V.norm(V.mul(V.add(nb[0],nb[1]),-1))]}
 if(nb.length===0){return[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(V.norm)}
 if(nb.length===1){const d=nb[0],[u,v]=perp(d);return[0,1,2].map(k=>{const p=k*2.094+.5;return V.norm(V.add(V.mul(d,-1/3),V.add(V.mul(u,S8*Math.cos(p)),V.mul(v,S8*Math.sin(p)))))})}
 if(nb.length===2){const m=V.norm(V.mul(V.add(nb[0],nb[1]),-1)),q=V.norm(V.cross(nb[0],nb[1]));return[V.norm(V.add(V.mul(m,Math.cos(TH)),V.mul(q,Math.sin(TH)))),V.norm(V.sub(V.mul(m,Math.cos(TH)),V.mul(q,Math.sin(TH))))]}
 return[V.norm(V.mul(V.add(V.add(nb[0],nb[1]),nb[2]),-1))]}
function build(m){const A=m.a.map(x=>({el:x[0],p:[x[1],x[2],x[3]]})),B=m.b.map(x=>x.slice());const cen=V.mul(A.reduce((s,a)=>V.add(s,a.p),[0,0,0]),1/A.length);
 m.a.forEach((x,i)=>{const nH=x[4]||0;if(!nH)return;const nb=B.filter(b=>b[0]===i||b[1]===i).map(b=>V.norm(V.sub(A[b[0]===i?b[1]:b[0]].p,A[i].p)));
  const dirs=hDirs(nb,nH,x[5]||'sp3',A[i].p,cen).slice(0,nH);const L=x[0]==='O'?0.96:1.09;dirs.forEach(d=>{A.push({el:'H',p:V.add(A[i].p,V.mul(d,L))});B.push([i,A.length-1,1])})});
 const c2=V.mul(A.reduce((s,a)=>V.add(s,a.p),[0,0,0]),1/A.length);A.forEach(a=>a.p=V.sub(a.p,c2));return{A,B}}
const zz=(n)=>Array.from({length:n},(_,i)=>[i*1.258,i%2?0.889:0,0]);
const ring=(n,r,pucker)=>Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2;return[r*Math.cos(a),r*Math.sin(a),pucker?(i%2?.25:-.25):0]});
const tet=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(v=>V.mul(V.norm(v),1.54));
const MOLS={
 methane:{name:'Methane, CH₄',a:[['C',0,0,0,4]],b:[]},
 ethane:{name:'Ethane, C₂H₆',a:[['C',-.77,0,0,3],['C',.77,0,0,3]],b:[[0,1,1]]},
 ethene:{name:'Ethene, C₂H₄ (double bond)',a:[['C',-.67,0,0,2,'sp2'],['C',.67,0,0,2,'sp2']],b:[[0,1,2]]},
 ethyne:{name:'Ethyne, C₂H₂ (triple bond)',a:[['C',-.6,0,0,1,'sp'],['C',.6,0,0,1,'sp']],b:[[0,1,3]]},
 propane:{name:'Propane, C₃H₈',a:zz(3).map((p,i)=>['C',...p,i===1?2:3]),b:[[0,1,1],[1,2,1]]},
 butane:{name:'Butane, C₄H₁₀ (straight chain)',a:zz(4).map((p,i)=>['C',...p,i===0||i===3?3:2]),b:[[0,1,1],[1,2,1],[2,3,1]]},
 isobutane:{name:'Isobutane (2-methylpropane), C₄H₁₀ (branched)',a:[['C',0,0,0,1],...tet.slice(0,3).map(p=>['C',...p,3])],b:[[0,1,1],[0,2,1],[0,3,1]]},
 cyclohexane:{name:'Cyclohexane, C₆H₁₂ (ring)',a:ring(6,1.47,1).map(p=>['C',...p,2]),b:[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,5,1],[5,0,1]]},
 benzene:{name:'Benzene, C₆H₆',a:ring(6,1.39,0).map(p=>['C',...p,1,'r']),b:[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1]]},
 chloromethane:{name:'Chloromethane, CH₃Cl',a:[['C',0,0,0,3],['Cl',1.78,0,0]],b:[[0,1,1]]},
 ethanol:{name:'Ethanol, C₂H₅OH',a:[['C',0,0,0,3],['C',1.258,.889,0,2],['O',2.43,.06,0,1]],b:[[0,1,1],[1,2,1]]},
 ethanal:{name:'Ethanal, CH₃CHO',a:[['C',0,0,0,3],['C',1.5,0,0,1,'sp2'],['O',2.1,1.05,0]],b:[[0,1,1],[1,2,2]]},
 propanone:{name:'Propanone, CH₃COCH₃',a:[['C',0,0,0,3],['C',1.5,.2,0],['O',1.5,1.42,0],['C',2.8,-.55,0,3]],b:[[0,1,1],[1,2,2],[1,3,1]]},
 ethanoic:{name:'Ethanoic acid, CH₃COOH',a:[['C',0,0,0,3],['C',1.52,0,0],['O',2.12,1.05,0],['O',2.18,-1.13,0,1]],b:[[0,1,1],[1,2,2],[1,3,1]]},
 ester:{name:'Ethyl ethanoate (an ester), CH₃COOC₂H₅',a:[['C',0,0,0,3],['C',1.52,0,0],['O',2.12,1.05,0],['O',2.18,-1.13,0],['C',3.6,-1.2,0,2],['C',4.3,0,0,3]],b:[[0,1,1],[1,2,2],[1,3,1],[3,4,1],[4,5,1]]},
 methanal:{name:'Methanal, HCHO',a:[['C',0,0,0,2,'sp2'],['O',1.21,0,0]],b:[[0,1,2]]},
 benzaldehyde:{name:'Benzaldehyde, C₆H₅CHO',a:[...ring(6,1.39,0).map((p,i)=>['C',...p,i?1:0,'r']),['C',2.87,0,0,1,'sp2'],['O',3.47,1.04,0]],b:[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1],[0,6,1],[6,7,2]]},
 acetophenone:{name:'Acetophenone, C₆H₅COCH₃',a:[...ring(6,1.39,0).map((p,i)=>['C',...p,i?1:0,'r']),['C',2.87,0,0],['O',3.47,1.04,0],['C',3.62,-1.3,0,3]],b:[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1],[0,6,1],[6,7,2],[6,8,1]]},
 benzoic:{name:'Benzoic acid, C₆H₅COOH',a:[...ring(6,1.39,0).map((p,i)=>['C',...p,i?1:0,'r']),['C',2.87,0,0],['O',3.47,1.04,0],['O',3.55,-1.13,0,1]],b:[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1],[0,6,1],[6,7,2],[6,8,1]]},
 h2:{name:'Hydrogen, H₂ (single bond)',a:[['H',-.37,0,0],['H',.37,0,0]],b:[[0,1,1]]},
 o2:{name:'Oxygen, O₂ (double bond)',a:[['O',-.6,0,0],['O',.6,0,0]],b:[[0,1,2]]},
 n2:{name:'Nitrogen, N₂ (triple bond)',a:[['N',-.55,0,0],['N',.55,0,0]],b:[[0,1,3]]}};
const COL={C:['#4a4a46','#2c2c2a',.38],H:['#ffffff','#888780',.25],O:['#E24B4A','#A32D2D',.36],N:['#378ADD','#185FA5',.36],Cl:['#639922','#3B6D11',.45]};
function view(cv,key,o={}){const ctx=cv.getContext('2d');let M=build(MOLS[key]),ang=.5,tilt=.35,drag=null,raf,alive=true;const W=cv.width,H=cv.height;
 let sc=o.scale||Math.min(W,H)/ (2*Math.max(...M.A.map(a=>V.len(a.p)))+2.2);
 function P(p){const ca=Math.cos(ang),sa=Math.sin(ang);let X=p[0]*ca+p[2]*sa,Z=-p[0]*sa+p[2]*ca;const ct=Math.cos(tilt),st=Math.sin(tilt);let Y=p[1]*ct-Z*st;Z=p[1]*st+Z*ct;const k=9/(9+Z);return[W/2+X*sc*k,H/2-Y*sc*k,Z,k]}
 function frame(){if(!alive)return;ctx.clearRect(0,0,W,H);const pr=M.A.map(a=>P(a.p));const items=[];
  M.B.forEach(([i,j,n])=>{const a=pr[i],b=pr[j];items.push({z:(a[2]+b[2])/2+.01,d:()=>{const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,g=5*a[3];ctx.lineCap='round';
   for(let k=0;k<n;k++){const off=(k-(n-1)/2)*g;ctx.strokeStyle=o.bond||'#9c9a92';ctx.lineWidth=(n>1?3:5)*a[3];ctx.beginPath();ctx.moveTo(a[0]+nx*off,a[1]+ny*off);ctx.lineTo(b[0]+nx*off,b[1]+ny*off);ctx.stroke()}}})});
  M.A.forEach((a,i)=>{const p=pr[i],c=COL[a.el];items.push({z:p[2],d:()=>{const r=c[2]*sc*p[3];ctx.fillStyle=c[0];ctx.strokeStyle=c[1];ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p[0],p[1],r,0,7);ctx.fill();ctx.stroke();
   ctx.fillStyle='rgba(255,255,255,.45)';ctx.beginPath();ctx.arc(p[0]-r*.35,p[1]-r*.35,r*.28,0,7);ctx.fill();
   if(o.labels!==false&&a.el!=='H'){ctx.fillStyle=a.el==='C'?'#fff':'#fff';ctx.font=`600 ${Math.max(10,r*.9)}px "Source Sans 3",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(a.el,p[0],p[1]+1)}}})});
  items.sort((a,b)=>b.z-a.z).forEach(x=>x.d());
  if(!drag&&o.spin!==false&&!matchMedia('(prefers-reduced-motion: reduce)').matches)ang+=.008;raf=requestAnimationFrame(frame)}
 cv.style.touchAction='none';cv.style.cursor='grab';
 cv.onpointerdown=e=>{drag=[e.clientX,e.clientY,ang,tilt];cv.setPointerCapture(e.pointerId)};
 cv.onpointermove=e=>{if(!drag)return;const r=cv.getBoundingClientRect(),k=W/r.width;ang=drag[2]+(e.clientX-drag[0])*k*.01;tilt=Math.max(-1.4,Math.min(1.4,drag[3]+(e.clientY-drag[1])*k*.01))};
 cv.onpointerup=cv.onpointercancel=()=>drag=null;frame();
 return{set(k){M=build(MOLS[k]);sc=o.scale||Math.min(W,H)/(2*Math.max(...M.A.map(a=>V.len(a.p)))+2.2)},stop(){alive=false;cancelAnimationFrame(raf)},name:k=>MOLS[k].name}}
window.MOL3D={view,MOLS,count:k=>{const m=build(MOLS[k]);const c={};m.A.forEach(a=>c[a.el]=(c[a.el]||0)+1);return c}};
})();
