/* Rai Plus learning engine – portal, chapter player, syllabus monitor.
   Storage: window.RaiPlusBridge (Rai Plus app) → Claude artifact db → localStorage. */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rand=n=>Math.floor(Math.random()*n),rand2=()=>rand(2);
const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const GREEN='#5c9a3a',YEL='#e9b824',VIO='#6a3d9a';
const T=(x,y,t,o='')=>`<text ${o} x="${x}" y="${y}" font-family="Source Sans 3,sans-serif" font-size="15" fill="currentColor" text-anchor="middle">${t}</text>`;
const arrow=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6b7a6d" stroke-width="2" marker-end="url(#ah)"/>`;
const svg=(w,h,b)=>`<svg viewBox="0 0 ${w} ${h}" role="img" style="color:var(--ink)">${b}</svg>`;
const FORMATS=[['read','Read'],['watch','Watch'],['see','See'],['do','Do'],['recall','Remember'],['check','Check']];
const MONTHS=['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'');
const nowIdx=()=>(new Date().getMonth()+9)%12;
function endIdx(m){if(!m)return null;let best=null;MONTHS.forEach((x,i)=>{const r=new RegExp(x,'g');let k;while((k=r.exec(m))){if(best===null||k.index>best.pos)best={pos:k.index,i}}});return best?best.i:null}

/* ---------- content registry ---------- */
const CLASSES=['6','7','8','9','10','11','12'];
const RP={packs:{},visuals:{},register(p){this.packs[p.key]=p}};
window.RP=RP;

/* ---------- storage adapter ---------- */
const Store={mode:'local',db:null,user:null,uid:null,canEdit:false,isOwner:false,
  async init(){
    try{if(window.RaiPlusBridge){const b=window.RaiPlusBridge;const u=await b.getUser();this.mode='bridge';this.uid=u.id;this.canEdit=u.role!=='student';this.isOwner=u.role==='admin';this.bridgeUser=u;return}}catch(e){}
    try{if(window.claude&&typeof claude.use==='function'){const [db,user]=await Promise.all([claude.use('db'),claude.use('user')]);
      if(db&&user){const id=await user.id();if(id){this.db=db;this.user=user;this.uid=id;this.mode='db';
        this.isOwner=!!(await user.isOwner().catch(()=>false));this.canEdit=!!(await user.canEdit().catch(()=>false))}}}}catch(e){}
    if(!this.uid){let id=null;try{id=localStorage.getItem('rp-uid')}catch(e){}if(!id){id='local-'+Math.random().toString(36).slice(2,10);try{localStorage.setItem('rp-uid',id)}catch(e){}}this.uid=id}
  },
  lk:p=>'rp-db:'+p,
  async get(path){
    if(this.mode==='bridge')return (await window.RaiPlusBridge.get(path))||null;
    if(this.mode==='db'){try{const s=await this.db.doc(path).get();return s.exists?s.data():null}catch(e){return null}}
    try{const v=localStorage.getItem(this.lk(path));return v?JSON.parse(v):null}catch(e){return null}},
  async set(path,data){
    if(this.mode==='bridge')return window.RaiPlusBridge.set(path,data);
    if(this.mode==='db')return this.db.doc(path).set(data);
    try{localStorage.setItem(this.lk(path),JSON.stringify(data))}catch(e){}},
  async query(coll){
    if(this.mode==='bridge')return (await window.RaiPlusBridge.query(coll))||[];
    if(this.mode==='db'){try{const q=await this.db.collection(coll).get();return q.docs.map(d=>Object.assign({id:d.id},d.data()))}catch(e){return []}}
    const out=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith(this.lk(coll+'/'))&&k.split('/').length===2)out.push(Object.assign({id:k.split('/')[1]},JSON.parse(localStorage.getItem(k))))}}catch(e){}return out},
  async names(ids){const o={};if(this.mode==='db'&&this.user){try{const p=await this.user.profiles(ids);ids.forEach(i=>o[i]=(p[i]&&p[i].name)||'')}catch(e){}}
    if(this.mode==='bridge'&&window.RaiPlusBridge.names){try{Object.assign(o,await window.RaiPlusBridge.names(ids))}catch(e){}}return o}
};
/* one write at a time per document, coalesced */
const writeQ={};
function queueWrite(path,getData,delay=1200){const w=writeQ[path]||(writeQ[path]={t:null,busy:false,again:false});clearTimeout(w.t);
  w.t=setTimeout(async function run(){if(w.busy){w.again=true;return}w.busy=true;try{await Store.set(path,getData());setSync('Saved')}catch(e){setSync('Not saved: '+(e&&e.code||'error'))}w.busy=false;if(w.again){w.again=false;run()}},delay)}
function setSync(t){const el=$('#sync');if(el)el.textContent=t}

/* ---------- app state ---------- */
const APP={role:'student',viewAs:null,restrictions:null,profile:null,progress:{ch:{}},config:{sections:{6:['A'],7:['A'],8:['A'],9:['A'],10:['A'],11:['A'],12:['A']}},coverage:{},settings:{},plan:{}};
const role=()=>APP.viewAs||APP.role;
const isStaff=()=>role()!=='student';
const allowedClassesList=()=>APP.restrictions&&Array.isArray(APP.restrictions.allowedClasses)&&APP.restrictions.allowedClasses.length?APP.restrictions.allowedClasses:CLASSES;
const isReadOnlyUser=()=>Boolean(APP.restrictions&&APP.restrictions.readOnly);
const isClassAllowed=c=>allowedClassesList().includes(String(c));
function planList(){return Object.entries(window.RP_PLAN||{}).map(([k,v])=>{const [cls,subject]=k.split('|');return {cls,subject,chs:v.map(([ch,title,m])=>({ch,title,m,end:endIdx(m),pack:packFor(cls,subject,ch)}))}})}
function packFor(cls,subject,ch){return Object.values(RP.packs).find(p=>p.cls===cls&&p.subject===subject&&String(p.ch)===String(ch))||null}
const covDoc=(cls,sec)=>`${cls}-${sec}`;
function covGet(cls,sec,subject,ch){const d=APP.coverage[covDoc(cls,sec)];return (d&&d.items&&d.items[slug(subject)+'~'+ch])||null}
async function loadCoverage(cls,sec){const id=covDoc(cls,sec);const d=await Store.get('coverage/'+id);const mem=APP.coverage[id];if(mem&&mem.updatedAt&&(!d||!d.updatedAt||mem.updatedAt>=d.updatedAt))return mem;APP.coverage[id]=d||{cls,section:sec,items:{}};return APP.coverage[id]}
function setCoverage(cls,sec,subject,ch,status){const id=covDoc(cls,sec);const d=APP.coverage[id]||(APP.coverage[id]={cls,section:sec,items:{}});
  const k=slug(subject)+'~'+ch;if(status==='none')delete d.items[k];else d.items[k]={s:status,d:new Date().toISOString().slice(0,10),by:Store.uid};
  d.updatedAt=Date.now();setSync('Saving…');queueWrite('coverage/'+id,()=>APP.coverage[id],300)}

/* ---------- boot ---------- */
async function boot(){
  setSync('Connecting…');renderShell();
  await Store.init();
  APP.restrictions=(Store.bridgeUser&&Store.bridgeUser.restrictions)||null;
  APP.role=Store.isOwner?'admin':Store.canEdit?'teacher':'student';
  if(Store.mode==='local'){try{APP.viewAs=localStorage.getItem('rp-viewas')||'admin'}catch(e){APP.viewAs='admin'}}
  const [cfg,prof,prog]=await Promise.all([Store.get('config/school'),Store.get('profiles/'+Store.uid),Store.get('progress/'+Store.uid)]);
  if(cfg&&cfg.sections)APP.config=cfg;APP.profile=prof;if(prog&&prog.ch)APP.progress=prog;
  if(APP.restrictions&&APP.restrictions.lockedClass){homeCls=APP.restrictions.lockedClass;monCls=APP.restrictions.lockedClass}
  else if(APP.restrictions&&APP.restrictions.allowedClasses&&APP.restrictions.allowedClasses.length){homeCls=APP.restrictions.allowedClasses[0];monCls=APP.restrictions.allowedClasses[0]}
  if(APP.restrictions&&APP.restrictions.defaultHash&&(!location.hash||location.hash==='#home')&&APP.restrictions.defaultHash!=='#home'){location.hash=APP.restrictions.defaultHash.replace(/^#/,'')}
  setSync(Store.mode==='db'?'Connected · shared data':Store.mode==='bridge'?(isReadOnlyUser()?'Connected · Read-only parent view':'Connected to Rai Plus'):'Demo mode · saved on this device');
  renderShell();route();
}
function renderShell(){
  const r=role();
  const R=APP.restrictions;
  if(R){
    if(R.canSwitchViewAs&&Array.isArray(R.allowedPreviewRoles)&&R.allowedPreviewRoles.length>1){
      $('#roleBox').innerHTML=`<span class="pill" title="Signed in via Rai Plus">${esc(R.displayRoleLabel)}</span><label style="margin-left:6px">Preview<select id="viewAs">${R.allowedPreviewRoles.map(x=>`<option value="${x}" ${x===r?'selected':''}>${x[0].toUpperCase()+x.slice(1)}</option>`).join('')}</select></label>`;
    }else{
      $('#roleBox').innerHTML=`<span class="pill" data-locked-role="true" title="Automatically set by your Rai Plus account">${esc(R.displayRoleLabel)}</span>`;
    }
  }else{
    $('#roleBox').innerHTML=(Store.mode==='local'||APP.role!=='student')?`<label>Viewing as<select id="viewAs">${['admin','teacher','student'].filter(x=>Store.mode==='local'||x==='student'||x===APP.role||APP.role==='admin').map(x=>`<option value="${x}" ${x===r?'selected':''}>${x[0].toUpperCase()+x.slice(1)}</option>`).join('')}</select></label>`:`<span class="pill">Student</span>`;
  }
  const canMon=isStaff()&&(!R||R.canAccessMonitor);
  const canSetup=r==='admin'&&(!R||R.canAccessSetup);
  const meLabel=isReadOnlyUser()?'Child’s progress':'My progress';
  $('#pnav').innerHTML=[['home','Chapters'],canMon&&['monitor','Syllabus monitor'],!isStaff()&&['me',meLabel],canSetup&&['setup','School setup']].filter(Boolean).map(([h,n])=>`<a href="#${h}">${n}</a>`).join('');
}

/* ---------- portal views ---------- */
let homeCls=null;
function myCls(){return (APP.restrictions&&APP.restrictions.lockedClass)||(APP.profile&&APP.profile.cls)||allowedClassesList()[0]||'10'}
function mySec(){return (APP.restrictions&&APP.restrictions.lockedSection)||(APP.profile&&APP.profile.section)||(APP.config.sections[myCls()]||['A'])[0]}
async function viewHome(){
  const allowed=allowedClassesList();
  if(!homeCls||!allowed.includes(homeCls))homeCls=myCls();
  if(!allowed.includes(homeCls))homeCls=allowed[0]||'10';
  const sec=isStaff()?($('#homeSec')&&$('#homeSec').value)||(APP.config.sections[homeCls]||['A'])[0]:mySec();
  await loadCoverage(homeCls,sec);
  const subs=planList().filter(s=>s.cls===homeCls);const built=Object.values(RP.packs).filter(p=>p.cls===homeCls);
  const classLocked=allowed.length===1&&Boolean(APP.restrictions&&APP.restrictions.lockedClass);
  const lockNotice=classLocked?` · Locked to Class ${esc(homeCls)}-${esc(sec)} by Rai Plus${isReadOnlyUser()?' (Read-Only Parent View)':''}`:(APP.restrictions&&APP.restrictions.allowedSubjects&&APP.restrictions.allowedSubjects.length?` · Your teaching subjects: ${esc(APP.restrictions.allowedSubjects.join(', '))}`:'');
  let h=`<div class="hrow2"><div><h2>Class ${esc(homeCls)} chapters</h2><p class="note">HBSE 2026-27 syllabus${lockNotice}. Chapters with an interactive lesson open in the Rai Plus player.</p></div>
  <div class="ctrl">${classLocked?`<span class="pill">Locked: Class ${esc(homeCls)}-${esc(sec)}</span>`:`<div class="ftabs" role="group" aria-label="Class">${allowed.map(c=>`<button data-cls="${c}" aria-pressed="${c===homeCls}">Class ${c}</button>`).join('')}</div>`}
  ${isStaff()?`<label>Section<select id="homeSec">${(APP.config.sections[homeCls]||['A']).map(s=>`<option ${s===sec?'selected':''}>${esc(s)}</option>`).join('')}</select></label>`:''}</div></div>`;
  if(!isStaff()&&!APP.profile&&!(APP.restrictions&&APP.restrictions.profileLockedByErp))h+=profileForm();
  if(built.length)h+=`<h3>Interactive lessons ready</h3><div class="cards3">${built.map(p=>`<a class="lcard" href="#ch-${p.key}-learn" style="--c:${esc(p.color||'#2f6a32')}"><small>${esc(p.subject)} · Ch ${esc(p.ch)}</small><b>${esc(p.title)}</b><span>${chapterPct(p.key)}% of concepts checked</span></a>`).join('')}</div>`;
  h+=`<h3>All subjects</h3><div class="subs">${subs.map(s=>{const st=subStats(s,homeCls,sec);return `<details class="sub" data-subj="${esc(s.subject)}"${OPEN.has('h|'+s.subject)?' open':''}><summary><b>${esc(s.subject)}</b><span class="note">${s.chs.length} chapters · ${st.done} completed${st.behind?` · <span class="warn">${st.behind} behind schedule</span>`:''}</span><span class="mbar"><i style="width:${st.pct}%"></i></span></summary>
   <table class="stack"><thead><tr><th>Ch.</th><th>Chapter</th><th>Planned</th><th>Status</th><th></th></tr></thead><tbody>${s.chs.map(c=>{const cv=covGet(homeCls,sec,s.subject,c.ch);return `<tr><td>${esc(c.ch)}</td><td>${esc(c.title)}</td><td>${esc(c.m||'–')}</td><td>${statusChip(cv,c.end)}</td><td>${c.pack?`<a class="btn sm" href="#ch-${c.pack.key}-learn">Open lesson</a>`:''}</td></tr>`}).join('')}</tbody></table></details>`}).join('')}</div>`;
  $('#portal').innerHTML=h;
}
function subStats(s,cls,sec){let done=0,behind=0,due=0;const n=nowIdx();s.chs.forEach(c=>{const cv=covGet(cls,sec,s.subject,c.ch);if(cv&&cv.s==='done')done++;if(c.end!=null&&c.end<=n){due++;if(!(cv&&cv.s==='done')&&c.end<n)behind++}});return {done,behind,due,pct:Math.round(done/s.chs.length*100)}}
function statusChip(cv,end){const n=nowIdx();if(cv&&cv.s==='done')return `<span class="chip ok">Completed ${esc(fmtD(cv.d))}</span>`;if(cv&&cv.s==='prog')return `<span class="chip mid">In progress</span>`;if(end!=null&&end<n)return `<span class="chip bad">Behind</span>`;if(end===n)return `<span class="chip due">Due this month</span>`;return `<span class="chip">Not started</span>`}
const fmtD=d=>{if(!d)return '';const x=new Date(d+'T00:00');return isNaN(x)?d:x.toLocaleDateString('en-IN',{day:'numeric',month:'short'})};
function chapterPct(key){const p=RP.packs[key],g=APP.progress.ch[key];if(!g||!p.nConcepts)return 0;return Math.round(Object.keys(g.done||{}).length/p.nConcepts*100)}
function profileForm(){return `<div class="box y"><h3>Set up your profile</h3><p>Choose your class and section so your teacher sees your progress in the right class.</p><div class="ctrl"><label>Class<select id="pfCls">${CLASSES.map(c=>`<option ${c===myCls()?'selected':''}>${c}</option>`).join('')}</select></label><label>Section<input id="pfSec" value="A" maxlength="3" style="width:5em"></label><label>Roll no.<input id="pfRoll" inputmode="numeric" maxlength="4" style="width:6em"></label><button class="btn p" id="pfSave">Save</button></div></div>`}

/* monitor */
let monCls='10',monSec=null,monSub='all';const OPEN=new Set();
document.addEventListener('toggle',e=>{const d=e.target;if(!d.dataset||!d.dataset.subj)return;const k=(location.hash==='#monitor'?'m|':'h|')+d.dataset.subj;if(d.open)OPEN.add(k);else OPEN.delete(k)},true);
async function viewMonitor(){
  if(!isStaff()||(APP.restrictions&&!APP.restrictions.canAccessMonitor)){location.hash='home';return}
  const allowedMonClasses=allowedClassesList();
  if(!allowedMonClasses.includes(monCls))monCls=allowedMonClasses[0]||'10';
  monSec=monSec&&(APP.config.sections[monCls]||[]).includes(monSec)?monSec:(APP.config.sections[monCls]||['A'])[0];
  await loadCoverage(monCls,monSec);
  const subs=planList().filter(s=>s.cls===monCls&&(monSub==='all'||s.subject===monSub));const n=nowIdx();
  let tot=0,done=0,due=0,behind=0,prog=0;subs.forEach(s=>s.chs.forEach(c=>{tot++;const cv=covGet(monCls,monSec,s.subject,c.ch);if(cv&&cv.s==='done')done++;else if(cv&&cv.s==='prog')prog++;if(c.end!=null&&c.end<=n){due++;if(!(cv&&cv.s==='done')&&c.end<n)behind++}}));
  const onTrack=due?Math.round(Math.min(done,due)/due*100):100;
  let h=`<div class="hrow2"><div><h2>Syllabus monitor</h2><p class="note">Class ${esc(monCls)}-${esc(monSec)} · ${MONTHS[n]} in the 2026-27 session. Teachers update each chapter's status; the plan comes from the BSEH month-wise teaching plan.</p></div>
  <div class="ctrl"><label>Class<select id="monCls">${allowedMonClasses.map(c=>`<option ${c===monCls?'selected':''}>${c}</option>`).join('')}</select></label><label>Section<select id="monSec">${(APP.config.sections[monCls]||['A']).map(s=>`<option ${s===monSec?'selected':''}>${esc(s)}</option>`).join('')}</select></label>
  <label>Subject<select id="monSub"><option value="all">All subjects</option>${planList().filter(s=>s.cls===monCls).map(s=>`<option ${s.subject===monSub?'selected':''}>${esc(s.subject)}</option>`).join('')}</select></label></div></div>
  <div class="kpis"><div><b>${done} / ${tot}</b><span>chapters completed</span></div><div><b>${due}</b><span>planned by end of ${MONTHS[n]}</span></div><div class="${behind?'bad':''}"><b>${behind}</b><span>behind schedule</span></div><div><b>${onTrack}%</b><span>of planned-to-date covered</span></div></div>`;
  h+=`<h3>Coverage by subject</h3><div class="rows">${subs.map(s=>{const st=subStats(s,monCls,monSec);const dueP=Math.round(st.due/s.chs.length*100);return `<div class="row3"><span>${esc(s.subject)}</span><span class="t2"><i style="width:${st.pct}%"></i><em style="left:${dueP}%" title="Planned by now"></em></span><span>${st.done}/${s.chs.length}${st.behind?` <span class="warn">· ${st.behind} behind</span>`:''}</span></div>`}).join('')}</div><p class="note">Bar = chapters completed. The thin mark shows how far the BSEH plan expects the class to be by now.</p>`;
  const late=[];subs.forEach(s=>s.chs.forEach(c=>{const cv=covGet(monCls,monSec,s.subject,c.ch);if(c.end!=null&&c.end<n&&!(cv&&cv.s==='done'))late.push([s.subject,c])}));
  if(late.length)h+=`<h3>Behind schedule (${late.length})</h3><div class="scroll"><table class="stack"><thead><tr><th>Subject</th><th>Ch.</th><th>Chapter</th><th>Planned</th><th>Status</th></tr></thead><tbody>${late.slice(0,60).map(([sub,c])=>`<tr><td>${esc(sub)}</td><td>${esc(c.ch)}</td><td>${esc(c.title)}</td><td>${esc(c.m)}</td><td>${statusSel(sub,c.ch)}</td></tr>`).join('')}</tbody></table></div>${late.length>60?`<p class="note">Showing 60 of ${late.length}. Filter by subject to see the rest.</p>`:''}`;
  h+=`<h3>Update chapter status</h3>${subs.map(s=>`<details class="sub" data-subj="${esc(s.subject)}"${OPEN.has('m|'+s.subject)?' open':''}><summary><b>${esc(s.subject)}</b><span class="note">${s.chs.length} chapters</span></summary><table class="stack"><thead><tr><th>Ch.</th><th>Chapter</th><th>Planned</th><th>Status</th><th>Updated</th></tr></thead><tbody>${s.chs.map(c=>{const cv=covGet(monCls,monSec,s.subject,c.ch);return `<tr><td>${esc(c.ch)}</td><td>${esc(c.title)}${c.pack?' <span class="chip ok">interactive</span>':''}</td><td>${esc(c.m||'–')}</td><td>${statusSel(s.subject,c.ch)}</td><td>${cv?esc(fmtD(cv.d)):''}</td></tr>`}).join('')}</tbody></table></details>`).join('')}`;
  h+=`<h3>Student mastery in interactive lessons</h3><div id="mastery"><p class="note">Loading student progress…</p></div>`;
  $('#portal').innerHTML=h;renderMastery();
}
function statusSel(subject,ch){const cv=covGet(monCls,monSec,subject,ch);const v=cv?cv.s:'none';return `<select class="st-sel" data-sub="${esc(subject)}" data-ch="${esc(ch)}" aria-label="Status of ${esc(subject)} chapter ${esc(ch)}">${[['none','Not started'],['prog','In progress'],['done','Completed']].map(([k,n])=>`<option value="${k}" ${k===v?'selected':''}>${n}</option>`).join('')}</select>`}
async function renderMastery(){
  const packs=Object.values(RP.packs).filter(p=>p.cls===monCls);if(!packs.length){$('#mastery').innerHTML='<p class="note">No interactive lessons for this class yet.</p>';return}
  const all=await Store.query('progress');const studs=all.filter(p=>p.cls===monCls&&(p.section||'A')===monSec);
  if(!studs.length){$('#mastery').innerHTML=`<p class="note">No student progress yet for ${esc(monCls)}-${esc(monSec)}. ${Store.mode==='db'?'Share this page with students as Contributors; their progress appears here as they work.':Store.mode==='local'?'In demo mode only this device\'s data is visible.':''}</p>`;return}
  const names=await Store.names(studs.map(s=>s.id));
  let h=`<div class="scroll"><table class="stack"><thead><tr><th>Student</th>${packs.map(p=>`<th>${esc(p.subject)} Ch ${esc(p.ch)}</th>`).join('')}<th>Last active</th></tr></thead><tbody>`;
  const avg=packs.map(()=>[0,0]);
  studs.sort((a,b)=>(+a.roll||999)-(+b.roll||999)).forEach(s=>{h+=`<tr><td>${esc(names[s.id]||('Student'+(s.roll?' #'+s.roll:'')))}</td>${packs.map((p,i)=>{const g=(s.ch||{})[p.key];if(!g)return '<td class="note">–</td>';const c=Math.round(Object.keys(g.done||{}).length/(p.nConcepts||1)*100);const qz=Object.values(g.quiz||{});const q=qz.length?Math.round(qz.reduce((a,b)=>a+b,0)/qz.length):null;avg[i][0]+=c;avg[i][1]++;return `<td>${c}% concepts${q!=null?` · test ${q}%`:''}</td>`}).join('')}<td>${s.t?esc(new Date(s.t).toLocaleDateString('en-IN',{day:'numeric',month:'short'})):''}</td></tr>`});
  h+=`</tbody></table></div><p class="note">${studs.length} student${studs.length>1?'s':''} · class average: ${packs.map((p,i)=>`${esc(p.subject)} Ch ${esc(p.ch)} ${avg[i][1]?Math.round(avg[i][0]/avg[i][1]):0}%`).join(' · ')}</p>`;
  $('#mastery').innerHTML=h}
async function viewMe(){
  const packs=Object.values(RP.packs).filter(p=>p.cls===myCls());
  const locked=Boolean(APP.restrictions&&APP.restrictions.profileLockedByErp);
  const heading=isReadOnlyUser()?(APP.restrictions&&APP.restrictions.childName?`${esc(APP.restrictions.childName)}’s progress (Read-Only)`:'Child’s progress (Read-Only)'):'My progress';
  let h=`<h2>${heading}</h2>${APP.profile?`<p class="note">Class ${esc(APP.profile.cls)}-${esc(APP.profile.section)}${APP.profile.roll?' · Roll no. '+esc(APP.profile.roll):''}${locked?' · Managed by Rai Plus ERP':' · <button class="linkbtn" id="pfEdit">Change</button>'}</p>`:(locked?`<p class="note">Class ${esc(myCls())}-${esc(mySec())} · Managed by Rai Plus ERP</p>`:profileForm())}`;
  h+=`<div class="cards3">${packs.map(p=>{const g=APP.progress.ch[p.key]||{};const qz=Object.entries(g.quiz||{});const due=Object.values(g.cards||{}).filter(x=>x.due<=Math.floor(Date.now()/864e5)).length+((p.nCards||0)-Object.keys(g.cards||{}).length);return `<a class="lcard" href="#ch-${p.key}-learn" style="--c:${esc(p.color||'#2f6a32')}"><small>${esc(p.subject)} · Ch ${esc(p.ch)}</small><b>${esc(p.title)}</b><span>${chapterPct(p.key)}% concepts checked · ${qz.length?'tests: '+qz.map(([l,v])=>'L'+l+' '+v+'%').join(', '):'no tests yet'} · ${due} flashcards due</span></a>`}).join('')||'<p class="note">No interactive lessons for your class yet.</p>'}</div>`;
  if(APP.profile){await loadCoverage(APP.profile.cls,APP.profile.section);const subs=planList().filter(s=>s.cls===APP.profile.cls);h+=`<h3>How far your class has reached</h3><div class="rows">${subs.map(s=>{const st=subStats(s,APP.profile.cls,APP.profile.section);return `<div class="row3"><span>${esc(s.subject)}</span><span class="t2"><i style="width:${st.pct}%"></i></span><span>${st.done}/${s.chs.length}</span></div>`}).join('')}</div>`}
  $('#portal').innerHTML=h}
function viewSetup(){
  if(role()!=='admin'||(APP.restrictions&&!APP.restrictions.canAccessSetup)){location.hash='home';return}
  $('#portal').innerHTML=`<h2>School setup</h2><p>Sections for each class. Separate sections with commas, e.g. A, B, C.</p><div class="rows">${CLASSES.map(c=>`<label style="flex-direction:row;align-items:center;gap:12px;color:var(--ink)">Class ${c}<input data-secs="${c}" value="${esc((APP.config.sections[c]||['A']).join(', '))}" style="flex:1;max-width:280px"></label>`).join('')}</div><div class="ctrl"><button class="btn p" id="secSave">Save sections</button></div>
  <h3>Who can do what</h3><table class="stack"><thead><tr><th>Person</th><th>Sharing level on this page</th><th>Can</th></tr></thead><tbody><tr><td>Principal / admin</td><td>Owner</td><td>Everything, including school setup</td></tr><tr><td>Teachers</td><td>Editor</td><td>Update chapter status, set lesson formats, see all student progress</td></tr><tr><td>Students</td><td>Contributor</td><td>Use lessons; save only their own profile and progress</td></tr></tbody></table>
  <p class="note">Storage: ${Store.mode==='db'?'shared database (live for everyone with access)':Store.mode==='bridge'?'Rai Plus app':'this device only (demo mode)'}.</p>`}

/* ---------- chapter player ---------- */
let CH=null,curKey=null,tset={},prog={},cur=null,fmt=null;
function chDefaultT(){return Object.fromEntries(CH.C.map(c=>[c.id,{read:1,watch:1,see:1,do:1,recall:1,check:1,def:'read',led:0}]))}
async function openChapter(key){
  const p=RP.packs[key];if(!p||!isClassAllowed(p.cls)){location.hash='home';return false}
  if(curKey!==key){
    $('#chTheme').textContent=p.theme||'';
    $('#chCrumb').textContent=p.crumb;$('#chH1').textContent=p.h1;$('#chSub').textContent=p.sub;$('#heroPod').setAttribute('aria-label',p.heroLabel||'');
    $('#labRoot').innerHTML=p.labHTML;$('#labLink').textContent=p.labName;
    CH=p.build();p.nConcepts=CH.C.length;p.nCards=CH.CARDS.length;curKey=key;cur=CH.C[0].id;fmt=null;lv=1;ci=0;flipped=false;
    $('#heroPod').innerHTML=CH.HERO();
    const st=await Store.get('settings/'+key);tset=Object.assign(chDefaultT(),(st&&st.t)||{});CH.C.forEach(c=>{if(tset[c.id].watch==null)tset[c.id].watch=1});
    prog=Object.assign({done:{},seen:{},quiz:{},cards:{},survey:[0,0],study:''},APP.progress.ch[key]||{});
    CH.lab.init();
  }
  return true}
function saveProg(){if(isReadOnlyUser()){setSync('Read-only parent view');return}APP.progress.ch[curKey]=prog;APP.progress.cls=myCls();APP.progress.section=mySec();if(APP.profile&&APP.profile.roll)APP.progress.roll=APP.profile.roll;APP.progress.t=Date.now();setSync('Saving…');queueWrite('progress/'+Store.uid,()=>APP.progress)}
function saveSettings(){if(!isStaff()||(APP.restrictions&&!APP.restrictions.canEditLessonFormats))return;setSync('Saving…');queueWrite('settings/'+curKey,()=>({t:tset,by:Store.uid,updatedAt:Date.now()}),500)}
function updateProgress(){const n=CH.C.filter(c=>prog.done[c.id]).length;$('#ptext').textContent=n+' of '+CH.C.length+' concepts checked';$('#pbar').style.width=(n/CH.C.length*100)+'%'}
function renderList(){$('#clist').innerHTML=CH.C.map(c=>`<li><button data-c="${c.id}" aria-current="${c.id===cur}"><b>${c.num}</b><span>${esc(c.title)}</span>${prog.done[c.id]?'<span class="tick" aria-label="checked">✓</span>':''}</button></li>`).join('')}
const enabled=c=>FORMATS.filter(([k])=>tset[c.id][k]).map(([k])=>k);
function renderLesson(){
  const C=CH.C,c=C.find(x=>x.id===cur),s=tset[c.id],en=enabled(c);
  if(!fmt||!en.includes(fmt))fmt=en.includes(s.def)?s.def:en[0];
  const i=C.indexOf(c);
  let h=`<div class="note">Concept ${c.num}</div><h2>${esc(c.title)}</h2><p>${esc(c.intro)}</p>
  <div class="meta"><div><b>You will be able to</b>${esc(c.obj)}</div><div><b>You should already know</b>${esc(c.prior)}</div></div>`;
  if(s.led&&!isStaff()){h+=`<div class="box y"><h3>Taught live in class</h3><p>Your teacher will take you through this concept in class. You can still revise it here afterwards.</p></div>`}
  h+=`<div class="ftabs" role="group" aria-label="Ways to learn this">${FORMATS.filter(([k])=>s[k]).map(([k,n])=>`<button data-f="${k}" aria-pressed="${k===fmt}">${n}</button>`).join('')}</div><div class="pane" id="pane"></div>
  <p class="exam"><b>In the exam:</b> ${esc(c.exam)}</p>
  <div class="ctrl"><button class="btn" id="prev" ${i?'':'disabled'}>Previous concept</button><button class="btn" id="next" ${i<C.length-1?'':'disabled'}>Next concept</button></div>`;
  $('#lesson').innerHTML=h;renderPane(c)}
function renderPane(c){
  if(!prog.seen[c.id+fmt]){prog.seen[c.id+fmt]=1;saveProg()}
  let h='';
  if(fmt==='read')h=`<button class="btn" data-say="read">Listen</button><h3>In simple words</h3><p>${esc(c.simple)}</p><h3>In detail</h3><p>${esc(c.detail)}</p><div class="box y"><h3>In real life</h3><p>${esc(c.real)}</p></div><div class="box v"><h3>Apply it</h3><p>${esc(c.apply)}</p></div>`;
  if(fmt==='see')h=`<div class="fig">${svg(c.see.w,c.see.h,c.see.f.map(x=>x[1]).join(''))}</div><p class="note">${esc(c.seeNote)}</p><ol>${c.see.f.map(x=>`<li>${esc(x[0])}</li>`).join('')}</ol>`;
  if(fmt==='watch')h=`<div class="fig" id="wfig">${svg(c.see.w,c.see.h,c.see.f.map((x,i)=>`<g class="st off" data-s="${i}">${x[1]}</g>`).join(''))}</div><div class="dots">${c.see.f.map(()=>'<i></i>').join('')}</div><p class="cap" id="wcap" aria-live="polite">Press Play to watch, step by step.</p><div class="ctrl"><button class="btn p" id="wplay">Play</button><button class="btn" id="wnext">Next step</button><button class="btn" id="wre">Replay</button><label style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" id="wvoice" checked style="width:22px;height:22px"> Narrate</label></div>`;
  if(fmt==='do'){const d=c.do;h=`<h3>${esc(d.title)}</h3><p><b>You need:</b> ${esc(d.mat)}</p><ol>${d.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><p><b>What you should see:</b> ${esc(d.obs)}</p><p><b>Why:</b> ${esc(d.why)}</p>`+(d.lab?`<a class="btn p" href="#ch-${curKey}-lab">Open the ${esc(CH.LABNAME)}</a>`:'')+(d.survey?survey():'')}
  if(fmt==='recall')h=`<div class="box y"><h3>Memory hook</h3><p>${esc(c.memo)}</p></div><h3>Common mistakes</h3><ul>${c.miscon.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h3>Key terms</h3><p>${c.terms.map(esc).join(' · ')}</p>`;
  if(fmt==='check'){h=`<h3>Quick check</h3><p>${esc(c.q.q)}</p><div class="opts" id="qc">${shuf(c.q.o.map((o,j)=>j)).map(j=>`<button data-o="${j}">${esc(c.q.o[j])}</button>`).join('')}</div><div id="qcf"></div>`}
  $('#pane').innerHTML=h;wstep=-1;clearTimeout(wtimer);wplaying=false;stopSay()}
let wstep=-1,wtimer=null,wplaying=false;
function wshow(c,i){const g=$$('#wfig .st');if(!g.length)return;g.forEach((x,k)=>x.classList.toggle('off',k>i));$$('.dots i').forEach((x,k)=>x.classList.toggle('on',k<=i));const cap=c.see.f[i][0];$('#wcap').textContent=cap;wstep=i;if($('#wvoice')&&$('#wvoice').checked)say(cap)}
function wtick(c){if(!wplaying||!$('#wfig')){wplaying=false;return}if(wstep>=c.see.f.length-1){wplaying=false;$('#wplay').textContent='Play';return}wshow(c,wstep+1);wtimer=setTimeout(()=>wtick(c),Math.max(3200,c.see.f[wstep][0].length*70))}
function say(t){try{const u=new SpeechSynthesisUtterance(t);u.lang='en-IN';u.rate=.95;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
function stopSay(){try{speechSynthesis.cancel()}catch(e){}}
function survey(){const[f,a]=prog.survey||[0,0],t=f+a||1;return `<div class="box"><h3>Class tally</h3><div class="ctrl"><button class="btn" data-sv="0">+ Free</button><button class="btn" data-sv="1">+ Attached</button><button class="btn" data-sv="r">Clear</button></div><div class="rows">${[['Free',f],['Attached',a]].map(([n,v])=>`<div class="row"><span>${n}</span><span class="t"><i style="width:${v/t*100}%"></i></span><span>${v}</span></div>`).join('')}</div></div>`}
/* flashcards */
const GAPS=[0,1,4,7,15,30],DAY=864e5,today=()=>Math.floor(Date.now()/DAY);let ci=0,flipped=false;
function dueList(){return CH.CARDS.map((c,i)=>i).filter(i=>{const s=prog.cards[i];return !s||s.due<=today()})}
function showCard(){const CARDS=CH.CARDS,due=dueList();$('#dueText').textContent=due.length?`${due.length} of ${CARDS.length} cards are due today.`:'No cards due today. Come back tomorrow, or keep practising any card.';
  if(due.length&&!due.includes(ci))ci=due[0];const c=CARDS[ci];const b=$('#card');b.className='card'+(flipped?' back':'');b.innerHTML=`<small>${flipped?'Answer':'Card '+(ci+1)+' of '+CARDS.length+' · tap to flip'}</small>${esc(flipped?c[1]:c[0])}`}
function rate(ok){const s=prog.cards[ci]||{lv:0,due:0};s.lv=ok?Math.min(s.lv+1,5):0;s.due=today()+GAPS[s.lv];prog.cards[ci]=s;saveProg();flipped=false;const due=dueList().filter(i=>i!==ci);ci=due.length?due[0]:(ci+1)%CH.CARDS.length;showCard()}
/* quiz */
const LVN=['Basic','Concept','Application','HOTS','Exam ready'];let lv=1;
function renderQuiz(){const Q=CH.Q;
  $('#lvBtns').innerHTML=LVN.map((n,i)=>`<button class="btn${lv===i+1?' p':''}" data-lv="${i+1}">Level ${i+1}: ${n}${prog.quiz[i+1]!=null?' ('+prog.quiz[i+1]+'%)':''}</button>`).join('');
  const qs=Q.map((q,i)=>({...q,i})).filter(q=>q.lv===lv);
  $('#quiz').innerHTML=qs.map(q=>q.open?`<div class="box"><p><b>${q.m} marks.</b> ${esc(q.q)}</p><button class="btn" data-ans="${q.i}">Show model answer</button><div id="a${q.i}" hidden><h3>Model answer (marking points)</h3><ul>${q.ans.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><label>My marks<input type="number" min="0" max="${q.m}" data-self="${q.i}" style="width:6em"></label></div></div>`
   :`<div class="box"><p>${esc(q.q)}</p><div class="opts" data-q="${q.i}">${(q.o.length>2&&!/^Assertion/.test(q.q)?shuf(q.o.map((o,j)=>j)):q.o.map((o,j)=>j)).map(j=>`<button data-qo="${j}">${esc(q.o[j])}</button>`).join('')}</div><div class="fbk"></div></div>`).join('')+`<p id="score" class="fb"></p>`}
function scoreLevel(){const Q=CH.Q,qs=Q.map((q,i)=>({...q,i})).filter(q=>q.lv===lv);let got=0,tot=0,ans=0;
  qs.forEach(q=>{if(q.open){const v=$(`[data-self="${q.i}"]`);tot+=q.m;if(v&&v.value!==''){ans++;got+=Math.min(q.m,Math.max(0,+v.value))}}else{tot++;const g=$(`[data-q="${q.i}"]`);if(g.dataset.done){ans++;if(g.dataset.done==='1')got++}}});
  if(ans===qs.length){const p=Math.round(got/tot*100);prog.quiz[lv]=p;saveProg();$('#score').textContent=`Level ${lv} score: ${got} of ${tot} (${p}%). `+(p<60?'Go back to the concepts you missed and try the Watch or Do version.':'Well done.');$$('#lvBtns button')[lv-1].textContent=`Level ${lv}: ${LVN[lv-1]} (${p}%)`}}
/* revise */
function mind(){const br=CH.MIND,PAL=['#FF6B35','#6366F1','#10B981','#EC4899','#F59E0B','#0EA5E9','#8B5CF6','#14B8A6'];
  let s=`<defs><radialGradient id="mmC" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`;
  br.forEach(([n,x,y],k)=>{const c=PAL[k%PAL.length],mx=(260+x)/2,my=(140+y)/2+(y<140?-18:18);s+=`<path d="M260 140 Q${mx} ${my} ${x} ${y}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" opacity=".55" class="mm-ln" style="--k:${k}"/>`});
  br.forEach(([n,x,y],k)=>{const c=PAL[k%PAL.length];s+=`<g class="mm-nd" style="--k:${k}"><rect x="${x-88}" y="${y-20}" width="176" height="40" rx="20" style="fill:var(--card)"/><rect x="${x-88}" y="${y-20}" width="176" height="40" rx="20" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2.5"/>`+T(x,y+5,n,`font-size="13" font-weight="700"`)+`</g>`});
  s+=`<g class="mm-ct"><ellipse cx="260" cy="146" rx="92" ry="38" fill="#000" opacity=".12"/><ellipse cx="260" cy="140" rx="92" ry="38" style="fill:var(--c)"/><ellipse cx="260" cy="140" rx="92" ry="38" fill="url(#mmC)"/>`+T(260,147,CH.MIND_CENTER,'fill="#fff" font-weight="800" font-size="18"')+`</g>`;
  $('#mind').innerHTML=svg(520,300,s)}
function dates(){const v=$('#studyDate').value;if(prog.study!==v){prog.study=v;saveProg()}if(!v){$('#dates').innerHTML='<li>Pick the date you first studied this chapter.</li>';return}
  const d0=new Date(v+'T00:00');$('#dates').innerHTML=[1,4,7,15,30].map(n=>{const d=new Date(d0.getTime()+n*DAY);return `<li>Day ${n}: ${d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</li>`}).join('')}
/* teacher tab */
async function renderTeacher(){
  const p=RP.packs[curKey],secs=APP.config.sections[p.cls]||['A'];
  for(const s of secs)await loadCoverage(p.cls,s);
  $('#chCov').innerHTML=`<h3>Chapter status by section</h3><div class="ctrl">${secs.map(s=>{const cv=covGet(p.cls,s,p.subject,p.ch);const v=cv?cv.s:'none';return `<label>Class ${esc(p.cls)}-${esc(s)}<select data-chcov="${esc(s)}">${[['none','Not started'],['prog','In progress'],['done','Completed']].map(([k,n])=>`<option value="${k}" ${k===v?'selected':''}>${n}</option>`).join('')}</select></label>`}).join('')}</div>`;
  $('#tTable').innerHTML=`<thead><tr><th>Concept</th>${FORMATS.map(([,n])=>`<th>${n}</th>`).join('')}<th>Opens with</th><th>Teach live</th></tr></thead><tbody>`+
  CH.C.map(c=>{const s=tset[c.id];return `<tr><td>${c.num} ${esc(c.title)}</td>${FORMATS.map(([k,n])=>`<td><input type="checkbox" aria-label="${n} for ${esc(c.title)}" data-tc="${c.id}" data-tk="${k}" ${s[k]?'checked':''}></td>`).join('')}<td><select data-td="${c.id}" aria-label="Opening format">${FORMATS.filter(([k])=>s[k]).map(([k,n])=>`<option value="${k}" ${s.def===k?'selected':''}>${n}</option>`).join('')}</select></td><td><input type="checkbox" data-tl="${c.id}" aria-label="Teach ${esc(c.title)} live" ${s.led?'checked':''}></td></tr>`}).join('')+'</tbody>'}

/* ---------- routing ---------- */
const CHV=['learn','visuals','lab','cards','test','revise','teacher'];
function visTheme(){const t=document.documentElement.dataset.theme;return t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}
function renderVisuals(){const L=RP.visuals[curKey]||[];const nm=id=>{const c=CH.C.find(x=>x.id===id);return c?c.num+' '+c.title:''};
  $('#visRoot').innerHTML=L.length?L.map((v,i)=>`<article class="vis" id="vis-${esc(v.c)}"><div class="vhd"><span class="chip">${esc(v.k)}</span><small>${esc(nm(v.c))}</small></div><h3>${esc(v.t)}</h3><iframe title="${esc(v.t)}" loading="${i<2?'eager':'lazy'}" src="vis/${curKey}/${v.f}.html?t=${visTheme()}" style="height:360px"></iframe></article>`).join(''):'<p>Visuals for this chapter are being made.</p>'}
window.addEventListener('message',e=>{const d=e.data;if(!d||!d.rpVis)return;$$('#visRoot iframe').forEach(f=>{if(f.contentWindow===e.source)f.style.height=Math.min(1400,d.h+4)+'px'})});
async function route(){
  stopSay();wplaying=false;clearTimeout(wtimer);
  const h=location.hash.slice(1)||'home';const m=h.match(/^ch-([a-z0-9]+)-([a-z]+)$/);
  renderShell();
  if(m){
    if(!(await openChapter(m[1])))return;
    let v=CHV.includes(m[2])?m[2]:'learn';if(v==='teacher'&&!isStaff())v='learn';
    document.body.classList.add('in-ch');$('#portal').hidden=true;$('#player').hidden=false;
    $$('#chnav a[data-v]').forEach(a=>{a.href=`#ch-${curKey}-${a.dataset.v}`;a.setAttribute('aria-current',a.dataset.v===v?'page':'false')});$('#tLink').hidden=!isStaff();$('#visLink').hidden=!(RP.visuals[curKey]||[]).length;
    CHV.forEach(x=>$('#v-'+x).hidden=x!==v);updateProgress();
    if(v==='learn'){renderList();renderLesson()}if(v==='visuals')renderVisuals();if(v==='lab')CH.lab.show();if(v==='cards')showCard();if(v==='test')renderQuiz();
    if(v==='revise'){mind();$('#oneMin').innerHTML=CH.ONEMIN.map(x=>`<li>${esc(x)}</li>`).join('');$('#studyDate').value=prog.study||'';dates()}
    if(v==='teacher')renderTeacher();
    return}
  document.body.classList.remove('in-ch');$('#player').hidden=true;$('#portal').hidden=false;$('#chTheme').textContent='';
  $$('#pnav a').forEach(a=>a.setAttribute('aria-current',a.getAttribute('href')==='#'+h?'page':'false'));
  if(h==='monitor')await viewMonitor();else if(h==='me')await viewMe();else if(h==='setup')viewSetup();else await viewHome();
}
window.addEventListener('hashchange',route);

/* ---------- events ---------- */
document.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.cls){homeCls=b.dataset.cls;viewHome();return}
  if(b.id==='pfSave'){const cls=$('#pfCls').value,sec=($('#pfSec').value||'A').trim().toUpperCase().replace(/[^A-Z0-9]/g,'')||'A',roll=($('#pfRoll').value||'').replace(/\D/g,'');APP.profile={cls,section:sec,roll,t:Date.now()};homeCls=cls;setSync('Saving…');try{await Store.set('profiles/'+Store.uid,APP.profile);setSync('Saved')}catch(err){setSync('Not saved')}APP.progress.cls=cls;APP.progress.section=sec;APP.progress.roll=roll;queueWrite('progress/'+Store.uid,()=>APP.progress,100);route();return}
  if(b.id==='pfEdit'){APP.profile=null;viewMe();return}
  if(b.id==='secSave'){const s={};$$('[data-secs]').forEach(i=>{const v=i.value.split(',').map(x=>x.trim().toUpperCase().replace(/[^A-Z0-9]/g,'')).filter(Boolean);s[i.dataset.secs]=v.length?v:['A']});APP.config.sections=s;setSync('Saving…');try{await Store.set('config/school',APP.config);setSync('Saved')}catch(err){setSync('Not saved: only the owner can change setup')}return}
  if(!CH||$('#player').hidden)return;
  const C=CH.C;
  if(b.dataset.c){cur=b.dataset.c;fmt=null;renderList();renderLesson();$('#lesson').scrollIntoView({block:'start'})}
  else if(b.dataset.f){fmt=b.dataset.f;$$('.ftabs [data-f]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.f===fmt));renderPane(C.find(x=>x.id===cur))}
  else if(b.id==='prev'||b.id==='next'){const i=C.findIndex(x=>x.id===cur)+(b.id==='next'?1:-1);cur=C[i].id;fmt=null;renderList();renderLesson()}
  else if(b.dataset.go){location.hash=`ch-${curKey}-lab`}
  else if(b.id==='wplay'){const c=C.find(x=>x.id===cur);if(wplaying){wplaying=false;clearTimeout(wtimer);stopSay();b.textContent='Play'}else{wplaying=true;b.textContent='Pause';if(wstep>=c.see.f.length-1)wstep=-1;wtick(c)}}
  else if(b.id==='wnext'){const c=C.find(x=>x.id===cur);wplaying=false;clearTimeout(wtimer);$('#wplay').textContent='Play';if(wstep<c.see.f.length-1)wshow(c,wstep+1)}
  else if(b.id==='wre'){const c=C.find(x=>x.id===cur);clearTimeout(wtimer);wstep=-1;$$('#wfig .st').forEach(x=>x.classList.add('off'));wplaying=true;$('#wplay').textContent='Pause';wtick(c)}
  else if(b.dataset.say){const c=C.find(x=>x.id===cur);if(b.textContent==='Stop'){stopSay();b.textContent='Listen'}else{say(c.simple+' '+c.detail);b.textContent='Stop'}}
  else if(b.dataset.sv){if(!prog.survey)prog.survey=[0,0];if(b.dataset.sv==='r')prog.survey=[0,0];else prog.survey[+b.dataset.sv]++;saveProg();renderPane(C.find(x=>x.id===cur))}
  else if(b.dataset.o!=null&&b.closest('#qc')){const c=C.find(x=>x.id===cur),j=+b.dataset.o,ok=j===c.q.a;
    $$('#qc button').forEach(x=>{const k=+x.dataset.o;x.disabled=true;if(k===c.q.a)x.classList.add('right');else if(k===j)x.classList.add('wrong')});
    let h=`<p class="fb ${ok?'ok':'no'}">${ok?'Correct.':'Not quite.'} ${esc(c.q.why)}</p>`;
    if(ok){prog.done[c.id]=1;saveProg();updateProgress();renderList()}
    else{const alt=enabled(c).filter(k=>k!=='check'&&!prog.seen[c.id+k]);const pick=alt[0]||enabled(c).find(k=>k!=='check'&&k!=='read');if(pick)h+=`<p>Try this concept another way: <button class="btn p" data-f="${pick}">${FORMATS.find(f=>f[0]===pick)[1]}</button> then come back to the check.</p>`}
    $('#qcf').innerHTML=h}
  else if(CH.lab.click(b)){}
  else if(b.id==='card'){flipped=!flipped;showCard()}
  else if(b.id==='got')rate(true);else if(b.id==='again')rate(false);
  else if(b.id==='skip'){flipped=false;ci=(ci+1)%CH.CARDS.length;const c=CH.CARDS[ci];const bb=$('#card');bb.className='card';bb.innerHTML=`<small>Card ${ci+1} of ${CH.CARDS.length} · tap to flip</small>${esc(c[0])}`}
  else if(b.dataset.lv){lv=+b.dataset.lv;renderQuiz()}
  else if(b.dataset.qo!=null){const g=b.closest('[data-q]'),q=CH.Q[+g.dataset.q],j=+b.dataset.qo;if(g.dataset.done)return;g.dataset.done=j===q.a?'1':'0';
    [...g.children].forEach(x=>{const k=+x.dataset.qo;x.disabled=true;if(k===q.a)x.classList.add('right');else if(k===j)x.classList.add('wrong')});g.nextElementSibling.innerHTML=`<p class="fb ${j===q.a?'ok':'no'}">${j===q.a?'Correct.':'Not quite.'} ${esc(q.w)}</p>`;scoreLevel()}
  else if(b.dataset.ans){const d=$('#a'+b.dataset.ans);d.hidden=!d.hidden}
  else if(b.id==='blurtCheck'){const t=$('#blurt').value;const hit=CH.KEYS.filter(([,r])=>r.test(t)),miss=CH.KEYS.filter(([,r])=>!r.test(t));
    $('#blurtOut').innerHTML=`<p class="fb">${hit.length} of ${CH.KEYS.length} key points found.</p>`+(miss.length?`<p><b>Missing:</b> ${miss.map(([n])=>esc(n)).join(', ')}</p>`:'<p class="fb ok">You covered every key point.</p>')}
  else if(b.id==='tAll'){tset=chDefaultT();saveSettings();renderTeacher()}
});
document.addEventListener('change',e=>{const t=e.target;
  if(t.id==='viewAs'){APP.viewAs=t.value===APP.role&&Store.mode!=='local'?null:t.value;try{if(Store.mode==='local')localStorage.setItem('rp-viewas',t.value)}catch(err){}const m=location.hash.match(/^#ch-([a-z0-9]+)-teacher$/);if(m&&t.value==='student')location.hash=`ch-${m[1]}-learn`;else if(location.hash==='#monitor'&&t.value==='student')location.hash='me';else if(location.hash==='#me'&&t.value!=='student')location.hash='monitor';else route();return}
  if(t.id==='homeSec'){viewHome();return}
  if(t.id==='monCls'){monCls=t.value;monSec=null;monSub='all';viewMonitor();return}
  if(t.id==='monSec'){monSec=t.value;viewMonitor();return}
  if(t.id==='monSub'){monSub=t.value;viewMonitor();return}
  if(t.classList.contains('st-sel')){if(!isStaff())return;setCoverage(monCls,monSec,t.dataset.sub,t.dataset.ch,t.value);const y=scrollY;viewMonitor().then(()=>scrollTo(0,y));return}
  if(t.dataset.chcov){const p=RP.packs[curKey];setCoverage(p.cls,t.dataset.chcov,p.subject,p.ch,t.value);return}
  if(!CH||$('#player').hidden)return;
  if(t.dataset.tc){const s=tset[t.dataset.tc];s[t.dataset.tk]=t.checked?1:0;if(!FORMATS.some(([k])=>s[k])){s[t.dataset.tk]=1;t.checked=true}if(!s[s.def])s.def=FORMATS.find(([k])=>s[k])[0];saveSettings();renderTeacher()}
  else if(t.dataset.td){tset[t.dataset.td].def=t.value;saveSettings()}
  else if(t.dataset.tl){tset[t.dataset.tl].led=t.checked?1:0;saveSettings()}
  else if(CH.lab.change(t)){}
  else if(t.id==='studyDate')dates();
  else if(t.dataset.self){scoreLevel()}
});
