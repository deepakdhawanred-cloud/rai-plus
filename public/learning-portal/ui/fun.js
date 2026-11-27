/* =====================================================================
   RAI PLUS · "Quick Revise" behaviour layer
   Subject colours and icons, kinetic chapter titles, heading icons,
   confetti + toasts on correct answers, streaks, and a star result card
   when a test level is finished. Works on every chapter pack, existing
   and future, without changing the packs.
   ===================================================================== */
(function(){
'use strict';
const SUBJ={
  'Science':['#10B981','🔬'],'Mathematics':['#6366F1','📐'],'English':['#EC4899','📖'],'English Core':['#EC4899','📖'],
  'Social Science':['#F59E0B','🌍'],'Hindi':['#E11D48','✍️'],'Hindi Core':['#E11D48','✍️'],'Sanskrit':['#C026D3','📜'],
  'Physics':['#0EA5E9','⚛️'],'Chemistry':['#8B5CF6','⚗️'],'Biology':['#22C55E','🧬'],
  'Accountancy':['#0F766E','🧾'],'Business Studies':['#B45309','💼'],'Economics':['#CA8A04','💹'],
  'History':['#9A3412','🏛️'],'Political Science':['#1D4ED8','🗳️'],'Geography':['#15803D','🗺️'],
  'Computer Science':['#0891B2','💻'],'Home Science':['#DB2777','🏠'],'Physical Education':['#EA580C','⚽'],
  'Psychology':['#7C3AED','🧠'],'Sociology':['#0D9488','👥']
};
const DEF=['#FF6B35','📚'];
const subj=s=>SUBJ[s]||DEF;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const root=document.documentElement;

/* ---------- subject colour for the open chapter ---------- */
function applyTheme(){
  const m=location.hash.match(/^#ch-([a-z0-9]+)-/);const p=m&&window.RP&&RP.packs[m[1]];
  root.style.setProperty('--c',p?subj(p.subject)[0]:DEF[0]);
  const v=location.hash.match(/^#ch-[a-z0-9]+-([a-z]+)/);const nv=v?v[1]:'home';if(root.dataset.rpv!==nv)root.dataset.rpv=nv;
  const hd=$('#player>header');if(hd&&p){let ic=$('.rp-hico',hd);if(!ic){ic=document.createElement('span');ic.className='rp-hico';ic.setAttribute('aria-hidden','true');hd.appendChild(ic)}const e2=subj(p.subject)[1];if(ic.textContent!==e2)ic.textContent=e2}
}

/* ---------- kinetic chapter title ---------- */
function kinetic(el){
  if(!el)return;const t=el.textContent;if(!t||el.dataset.k===t)return;
  el.dataset.k=t;el.innerHTML=t.split(/(\s+)/).map((w,i)=>/^\s+$/.test(w)?w:`<span class="w" style="--k:${i>>1}">${w.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</span>`).join('');
}

/* ---------- icons on headings ---------- */
const HICO=[[/^In simple words/i,'🐣'],[/^In detail/i,'🔍'],[/^In real life/i,'🌍'],[/^Apply it/i,'✍️'],[/^Memory hook/i,'🪝'],[/^Common mistakes/i,'⚠️'],
  [/^Key terms/i,'🔑'],[/^Quick check/i,'✅'],[/^Model answer/i,'📋'],[/^Taught live/i,'🧑‍🏫'],[/^Chapter mind map/i,'🧠'],[/^One-minute/i,'⏱️'],
  [/^Blurting/i,'💭'],[/^Your revision dates/i,'📅'],[/^Interactive lessons/i,'✨'],[/^All subjects/i,'🗂️'],[/^Class tally/i,'📊'],[/^Lesson formats/i,'🎛️'],
  [/^Chapter status/i,'📌'],[/^Update chapter status/i,'📝']];
function headIcons(scope){
  $$('h3',scope).forEach(h=>{if(h.dataset.ico)return;const f=HICO.find(([r])=>r.test(h.textContent.trim()));h.dataset.ico='1';if(f)h.insertAdjacentText('afterbegin',f[1]+' ')});
}

/* ---------- portal cards ---------- */
function decoratePortal(){
  $$('.lcard').forEach(a=>{if(a.dataset.rp)return;a.dataset.rp='1';
    const sm=a.querySelector('small');const sname=sm?sm.textContent.split('·')[0].trim():'';const [col,ico]=subj(sname);
    a.style.setProperty('--c',col);a.insertAdjacentHTML('afterbegin',`<span class="rp-ico" aria-hidden="true">${ico}</span>`);
    const pct=(a.querySelector('span:last-child')||{}).textContent;const n=pct&&pct.match(/(\d+)%/);
    if(n)a.insertAdjacentHTML('beforeend',`<span class="rp-meter"><i style="width:${n[1]}%"></i></span>`)});
  $$('details.sub').forEach(d=>{if(d.dataset.rp)return;d.dataset.rp='1';const [col,ico]=subj(d.dataset.subj);d.style.setProperty('--c',col);
    const b=d.querySelector('summary b');if(b)b.insertAdjacentHTML('afterbegin',`<span class="rp-ico" aria-hidden="true">${ico}</span>`)});
}

/* ---------- toast + confetti ---------- */
let toastEl,toastT;
function toast(msg,kind){
  if(!toastEl){toastEl=document.createElement('div');toastEl.className='rp-toast';toastEl.setAttribute('role','status');document.body.appendChild(toastEl)}
  toastEl.textContent=msg;toastEl.className='rp-toast on '+(kind||'');clearTimeout(toastT);toastT=setTimeout(()=>toastEl.className='rp-toast',1700);
}
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function confetti(x,y,n){
  if(reduce)return;const cols=['#FF6B35','#FACC15','#16A34A','#6366F1','#EC4899','#0EA5E9'];
  x=x==null?innerWidth/2:x;y=y==null?innerHeight/3:y;n=n||28;
  for(let i=0;i<n;i++){const d=document.createElement('i');d.className='rp-cf';d.style.background=cols[i%cols.length];d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);
    const a=Math.random()*Math.PI*2,v=120+Math.random()*220,dx=Math.cos(a)*v,dy=Math.sin(a)*v-160,r=Math.random()*720;
    d.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${dx}px,${dy+420}px) rotate(${r}deg)`,opacity:0}],{duration:1100+Math.random()*700,easing:'cubic-bezier(.2,.6,.4,1)'}).onfinish=()=>d.remove()}
}
window.RPFX={toast,confetti};

/* ---------- streak ---------- */
let streak=0,stEl;
function bumpStreak(ok){
  streak=ok?streak+1:0;if(!stEl){stEl=document.createElement('div');stEl.className='rp-streak';document.body.appendChild(stEl)}
  if(streak>=2){stEl.textContent='🔥 '+streak+' in a row';stEl.classList.add('on')}else stEl.classList.remove('on');
}

/* ---------- answers: react to the engine's marking ---------- */
const PRAISE=['Correct! 🎉','Brilliant! ⭐','Spot on! 🎯','Super! 🚀','Yes! 💯','Nailed it! 🙌'];
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('.opts button');if(!b)return;
  setTimeout(()=>{
    if(b.classList.contains('right')){const r=b.getBoundingClientRect();confetti(r.left+r.width/2,r.top+r.height/2,22);bumpStreak(true);toast(PRAISE[Math.floor(Math.random()*PRAISE.length)],'ok')}
    else if(b.classList.contains('wrong')){bumpStreak(false);toast('Not quite — see why below 👇','bad')}
  },0);
});

/* ---------- result card when a level is finished ---------- */
let lastScore='';
function scoreCard(){
  const el=$('#score');if(!el)return;const t=el.textContent;if(!t){lastScore='';return}if(t===lastScore)return;lastScore=t;
  const m=t.match(/Level (\d+) score: (\d+) of (\d+) \((\d+)%\)/);if(!m)return;
  const [,lv,got,tot,p]=m.map(Number);const stars=p>=90?3:p>=60?2:p>=30?1:0;
  const title=['Keep going!','Good try!','Great work!','Superstar!'][stars],ico=['💪','👍','🎉','🏆'][stars];
  const ov=document.createElement('div');ov.className='rp-ov';
  ov.innerHTML=`<div class="rp-res" role="dialog" aria-modal="true" aria-label="Level ${lv} result"><div class="ico">${ico}</div>
  <div class="rp-stars">${[0,1,2].map(i=>`<span class="${i<stars?'on':''}" style="animation-delay:${.15+i*.18}s">★</span>`).join('')}</div>
  <h2>${title}</h2><div class="rp-stats"><div><b>${got}/${tot}</b><small>marks</small></div><div><b>${p}%</b><small>score</small></div><div><b>L${lv}</b><small>level</small></div></div>
  <p>${p<60?'Revisit the concepts you missed using Watch or Do, then try again.':lv<5?'Ready for the next level?':'You have finished every level of this chapter!'}</p>
  <div class="r-btns">${p>=60&&lv<5?`<button class="btn p" data-rpnext="${lv+1}">Level ${lv+1} →</button>`:''}<button class="btn${p<60?' p':''}" data-rpretry="${lv}">Try again</button><button class="btn" data-rpclose>Close</button></div></div>`;
  document.body.appendChild(ov);if(stars>=2)setTimeout(()=>confetti(innerWidth/2,innerHeight/3,60),250);
  const close=()=>ov.remove();
  ov.addEventListener('click',e=>{const b=e.target.closest('button');if(e.target===ov){close();return}if(!b)return;
    if(b.dataset.rpnext){close();const x=$(`#lvBtns [data-lv="${b.dataset.rpnext}"]`);if(x)x.click();scrollTo({top:$('#v-test').offsetTop-80,behavior:'smooth'})}
    else if(b.dataset.rpretry){close();const x=$(`#lvBtns [data-lv="${b.dataset.rpretry}"]`);if(x)x.click()}
    else if(b.hasAttribute('data-rpclose'))close()});
  const k=e=>{if(e.key==='Escape'){close();removeEventListener('keydown',k)}};addEventListener('keydown',k);
  const f=ov.querySelector('.btn');if(f)f.focus();
}

/* ---------- flashcard "got it" cheer ---------- */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#got');if(b){const r=b.getBoundingClientRect();confetti(r.left+r.width/2,r.top,14)}});

/* ---------- watch everything ---------- */
let qd=false;
function pass(){qd=false;applyTheme();kinetic($('#chH1'));decoratePortal();headIcons(document);scoreCard()}
new MutationObserver(()=>{if(!qd){qd=true;requestAnimationFrame(pass)}}).observe(document.body,{childList:true,subtree:true,characterData:true});
addEventListener('hashchange',()=>{lastScore='';streak=0;bumpStreak(false);setTimeout(pass,0)});
pass();
})();
