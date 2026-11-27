/* Rai Plus content pack: Class 10 Science, Chapter 8 – Heredity */
RP.register({key:'10sci08',cls:'10',subject:'Science',ch:'8',title:"Heredity",color:'#2f6a32',
crumb:"HBSE Class 10 Science \u00b7 Unit: World of Living (24 marks) \u00b7 Taught in December",h1:"Chapter 8: Heredity",sub:"Why you look like your parents, and why you're not a copy of them.",heroLabel:"An open pea pod with round yellow, round green and wrinkled peas",labName:"Pea lab",
theme:"",labHTML:"  <h2>Mendel's pea lab</h2>\n  <p>Choose two parent plants, and the Punnett square shows every possible child. Then grow a real batch and see how close chance gets to Mendel's ratios.</p>\n  <div class=\"ftabs\" role=\"group\" aria-label=\"Cross type\"><button id=\"mMono\" aria-pressed=\"true\">One trait (monohybrid)</button><button id=\"mDi\" aria-pressed=\"false\">Two traits (dihybrid)</button></div>\n  <div class=\"sim\">\n    <div>\n      <div id=\"monoCtrl\">\n        <div class=\"ctrl\">\n          <label>Trait<select id=\"trait\"><option value=\"height\">Plant height (T / t)</option><option value=\"shape\">Seed shape (R / r)</option><option value=\"colour\">Seed colour (Y / y)</option></select></label>\n          <label>Parent 1<select id=\"p1\"></select></label><label>Parent 2<select id=\"p2\"></select></label>\n        </div>\n        <div class=\"ctrl\"><button class=\"btn\" data-pre=\"P\">Mendel's first cross</button><button class=\"btn\" data-pre=\"F1\">Self-cross F1</button><button class=\"btn\" data-pre=\"TC\">Test cross</button></div>\n      </div>\n      <div id=\"diCtrl\" hidden>\n        <div class=\"ctrl\">\n          <label>Parent 1 shape<select id=\"d1s\"></select></label><label>Parent 1 colour<select id=\"d1c\"></select></label>\n          <label>Parent 2 shape<select id=\"d2s\"></select></label><label>Parent 2 colour<select id=\"d2c\"></select></label>\n        </div>\n        <div class=\"ctrl\"><button class=\"btn\" data-dpre=\"P\">RRYY \u00d7 rryy</button><button class=\"btn\" data-dpre=\"F1\">RrYy \u00d7 RrYy (Mendel's F2)</button></div>\n      </div>\n      <div id=\"grid\" class=\"grid\" aria-live=\"polite\"></div>\n    </div>\n    <div>\n      <h3>What the square predicts</h3>\n      <div id=\"pred\" class=\"rows\"></div>\n      <h3>Grow a real batch</h3>\n      <div class=\"ctrl\"><label>Number of seeds<select id=\"nGrow\"><option>16</option><option selected>100</option><option>1000</option></select></label><button class=\"btn p\" id=\"grow\">Grow</button></div>\n      <div id=\"grown\" class=\"rows\"></div>\n      <p class=\"note\" id=\"growNote\">Green bars show your batch, yellow bars show the square's prediction. Small batches wander; big ones settle near the ratio.</p>\n    </div>\n  </div>\n  <div class=\"box v\">\n    <h3>Boy or girl? The sex-determination lab</h3>\n    <p>The mother's egg always carries an X. Each sperm carries either an X or a Y, about half and half.</p>\n    <div class=\"ctrl\"><button class=\"btn\" id=\"sx1\">One child</button><button class=\"btn\" id=\"sx100\">100 children</button><button class=\"btn\" id=\"sx0\">Reset</button></div>\n    <div id=\"sxOut\" class=\"rows\"></div>\n  </div>\n",
build:function(){
function pea(cx,cy,r,round,yellow){
  const fill=yellow?'url(#pgY)':'url(#pgG)',edge=yellow?'#8a6508':'#24461a',st=`stroke="${edge}" stroke-width="${(r/12).toFixed(2)}"`;
  if(round)return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${st}/><ellipse cx="${cx-r*.32}" cy="${cy-r*.38}" rx="${r*.28}" ry="${r*.18}" fill="#fff" opacity=".55"/>`;
  const J=[0,.05,-.04,.07,-.06,.03,-.05,.06,-.03,.05,-.07,.04];let d='';
  for(let i=0;i<=48;i++){const a=i/48*Math.PI*2,rr=r*(0.9+0.07*Math.sin(a*7+1)+J[i%12]*.6);d+=(i?'L':'M')+(cx+rr*Math.cos(a)).toFixed(1)+' '+(cy+rr*0.93*Math.sin(a)).toFixed(1)}
  const c=(x1,y1,x2,y2,x3,y3)=>`<path d="M${cx+x1*r} ${cy+y1*r} Q${cx+x2*r} ${cy+y2*r} ${cx+x3*r} ${cy+y3*r}" fill="none" stroke="${edge}" stroke-width="${(r/14).toFixed(2)}" opacity=".7" stroke-linecap="round"/>`;
  return `<path d="${d}Z" fill="${fill}" ${st}/>`+c(-.55,-.2,-.1,.05,.35,-.35)+c(-.4,.35,0,.15,.5,.3)+c(-.1,-.6,.05,-.3,-.25,-.05)+c(.2,.05,.45,.05,.6,-.1);
}
function pod(){let s=`<path d="M14 70 C60 10 300 10 346 62 C300 104 60 112 14 70Z" fill="url(#pod)" stroke="#24461a" stroke-width="2"/><path d="M30 66 C80 30 280 28 330 60 C280 88 80 94 30 66Z" fill="#e8f5d8"/>`;
  [[70,true,true],[125,true,false],[180,false,true],[235,true,true],[290,false,false]].forEach(([x,r,y])=>s+=pea(x,62,23,r,y));return s+`<path d="M346 62 q10 -14 6 -30" stroke="#3f7d2b" stroke-width="4" fill="none" stroke-linecap="round"/>`}
function plant(x,base,tall){
  const h=tall?70:30;let s=`<line x1="${x}" y1="${base}" x2="${x}" y2="${base-h}" stroke="${GREEN}" stroke-width="4" stroke-linecap="round"/>`;
  for(let k=1;k<=(tall?3:1);k++){const y=base-h*k/(tall?3.6:1.6);s+=`<ellipse cx="${x-9}" cy="${y}" rx="9" ry="4" fill="${GREEN}" transform="rotate(-25 ${x-9} ${y})"/><ellipse cx="${x+9}" cy="${y-6}" rx="9" ry="4" fill="${GREEN}" transform="rotate(25 ${x+9} ${y-6})"/>`}
  return s+`<circle cx="${x}" cy="${base-h-4}" r="5" fill="${VIO}"/>`;
}
function beetle(x,y,col){return `<ellipse cx="${x}" cy="${y}" rx="16" ry="21" fill="${col}" stroke="#222" stroke-width="1.2"/><line x1="${x}" y1="${y-21}" x2="${x}" y2="${y+21}" stroke="#222"/><circle cx="${x}" cy="${y-25}" r="7" fill="#333"/>`}

const ear=(x,free)=>`<path d="M${x} 60 C${x+55} 40 ${x+75} 110 ${x+50} 150 ${free?`C${x+48} 175 ${x+22} 190 ${x+14} 168 C${x+10} 160 ${x+8} 155 ${x+2} 152`:`C${x+40} 165 ${x+20} 172 ${x+2} 168`}" fill="#f1c9a5" stroke="#8a5a3c" stroke-width="2.5"/><path d="M${x+18} 80 C${x+45} 70 ${x+52} 105 ${x+35} 128" fill="none" stroke="#c48a63" stroke-width="2"/><line x1="${x}" y1="40" x2="${x}" y2="200" stroke="#8a5a3c" stroke-dasharray="4 4"/>`;
const fbox=(x,t,s)=>`<rect x="${x}" y="80" width="88" height="56" rx="10" fill="var(--g2)" stroke="${GREEN}"/>`+T(x+44,104,t,'font-weight="700"')+T(x+44,124,s,'font-size="13"');
/* ---------- content ---------- */
const C=[
{id:'c1',num:'8.1',title:'Variation builds up over generations',
 intro:'Children are never exact copies of their parents. This concept explains where the small differences come from and why they matter.',
 obj:'Explain how variations arise during reproduction and why some variations survive better than others.',
 prior:'Ch 7: DNA copying, asexual and sexual reproduction.',
 simple:'Every time DNA is copied, the copy is almost, but not exactly, the same. In sexual reproduction, each child also gets a mix of DNA from two parents. Generation after generation these small differences pile up, so a population becomes varied.',
 detail:'In asexual reproduction the only new variations come from small inaccuracies in DNA copying, so offspring are very similar. Sexual reproduction combines the DNA of two individuals, so it produces far greater diversity. Variations are not all equally useful. In a particular environment, an individual whose variation helps it survive (for example, bacteria that can withstand heat during a heat wave) is more likely to live and pass that variation on.',
 real:'Brothers and sisters from the same parents still differ in height, face shape and skin tone. Farmers choose seeds from the best plants each year, keeping useful variations.',
 apply:'A pond warms up over many years. Which fish in the population are most likely to leave more young, and why?',
 see:{w:520,h:250,f:[
  ['Generation 1: one red beetle reproduces.',T(60,30,'Generation 1')+beetle(60,90,'#c0392b')],
  ['Generation 2: its DNA is copied with a small change. One offspring is green.',arrow(85,95,175,95)+T(240,30,'Generation 2')+beetle(200,90,'#c0392b')+beetle(280,90,'#2e7d32')],
  ['Generation 3: the green beetle passes the change on to its own young.',arrow(305,95,345,95)+T(430,30,'Generation 3')+beetle(370,90,'#c0392b')+beetle(415,90,'#c0392b')+beetle(455,90,'#2e7d32')+beetle(495,90,'#2e7d32')],
  ['Over generations, variations pile up: the population becomes varied.',`<rect x="20" y="160" width="480" height="70" rx="10" fill="var(--y2)"/>`+T(260,188,'A small change (green colour) appears in one beetle of generation 2')+T(260,212,'and is passed on: variation accumulates')]]},
 seeNote:'Based on the beetle example in the NCERT textbook. Colours stand for any inherited variation.',
 do:{title:'Photocopy of a photocopy',mat:'One printed page with a small diagram; a photocopier',steps:['The teacher photocopies the page, then photocopies the copy, five times in a row.','Students lay all six pages side by side.','List every small difference between the original and copy 5.'],obs:'Small faults appear and are carried into every later copy.',why:'DNA copying is far more accurate, but like the photocopier it is not perfect, and a change, once made, is copied onwards. Unlike photocopies, sexual reproduction also mixes two sources.'},
 memo:'Copy + Mix + Select = Variety: copying errors and mixing create variations, the environment selects which survive.',
 miscon:['"Variations are always harmful." Most are neutral, and some help survival.','"Asexual reproduction gives no variation." It gives a little, from copying errors.'],
 terms:['Variation','DNA copying','Population'],
 q:{q:'Which kind of reproduction produces the greatest variation?',o:['Asexual, because the DNA is copied many times','Sexual, because DNA from two individuals is combined','Both produce the same variation','Neither produces any variation'],a:1,why:'Sexual reproduction combines DNA from two parents, so it creates new combinations as well as copying errors.'},
 exam:'Usually a 1–2 mark objective or very short answer ("Why does sexual reproduction create more variation?").'},
{id:'c2',num:'8.2.1',title:'Inherited traits',
 intro:'Some features pass from parents to children. Earlobes are the textbook example.',
 obj:'Identify inherited traits and explain why children share the basic design of their parents but differ in details.',
 prior:'Concept 8.1: variation.',
 simple:'A trait is a feature, like the shape of your earlobe. Inherited traits come to you from your parents through their DNA. Children follow the same basic body design as their parents but differ in small details.',
 detail:'Every human child has the same basic body plan, yet children of the same parents are not identical. Earlobes show this clearly: in some people the lowest part of the ear hangs free (free earlobe), in others it is closely attached to the side of the head (attached earlobe). Studies of families show that this trait is inherited from parents, and the rules of how such traits pass on were first worked out by Mendel (next concept).',
 real:'Ask at home whether your earlobe type matches your mother\'s or father\'s.',
 apply:'In a class of 40, 28 students have free earlobes. Does this tell you which type is dominant? Why or why not?',
 see:{w:460,h:240,f:[
  ['A free earlobe hangs below the point where the ear joins the head.',ear(70,true)+T(110,228,'Free earlobe: hangs below the joint')],
  ['An attached earlobe is joined directly to the side of the head.',ear(300,false)+T(340,228,'Attached earlobe: joined to the head')]]},
 seeNote:'The dashed line is the side of the head.',
 do:{title:'Class earlobe survey',mat:'A mirror, or a partner; the tally below',steps:['Check your own earlobe with a mirror or ask a partner.','Add yourself to the tally below.','Compare the class result with your parents\' earlobes at home.'],obs:'The class shows both types; families tend to share a type.',why:'Earlobe type is an inherited trait. A class tally shows variation in the population; a family check shows inheritance.',survey:true},
 memo:'Trait = Trademark: a feature you carry from your family.',
 miscon:['"The commoner trait must be dominant." How often a trait appears does not tell you if it is dominant.'],
 terms:['Trait','Inherited trait','Free and attached earlobe'],
 q:{q:'Which statement about inherited traits is correct?',o:['Children are exact copies of their parents','Children share their parents\' basic design but differ in details','Inherited traits come only from the mother','Traits are never passed between generations'],a:1,why:'Inheritance keeps the basic design but sexual reproduction mixes details, so children are similar but not identical.'},
 exam:'Often a 1-mark example question or part of a case-based question on a family or class survey.'},
{id:'c3',num:'8.2.2',title:'Mendel and the one-trait cross',
 intro:'Gregor Mendel crossed pea plants and counted the offspring. His counts revealed the first rules of inheritance.',
 obj:'Describe Mendel\'s monohybrid cross and explain the F1 and F2 results.',
 prior:'Pollination and fertilisation (Ch 7).',
 simple:'Mendel crossed a pure tall pea plant with a pure short one. All the children (F1) were tall. When he let the F1 plants self-pollinate, the next generation (F2) had tall and short plants in a ratio of about 3 tall to 1 short. The "short" factor had been hiding in the F1.',
 detail:'Mendel chose pea plants with clear contrasting traits: tall/short plants, round/wrinkled seeds, yellow/green seeds and violet/white flowers. Each trait is controlled by a pair of factors (now called genes); each parent passes on one. Pure tall plants are TT, pure short plants tt. TT × tt gives only Tt in F1, which look tall. Self-pollinating Tt gives TT, Tt, Tt and tt in F2: genotypes 1:2:1, phenotypes 3 tall : 1 short. This shows each plant carries two copies of the factor and that one copy (T) can hide the other (t).',
 real:'Seed companies use these rules to keep "true-breeding" varieties for farmers.',
 apply:'A plant breeder has a tall pea plant. How could she find out whether it is TT or Tt? (Hint: try the test cross in the Pea lab.)',
 see:{w:520,h:330,f:[
  ['Parents: a pure tall plant (TT) is crossed with a pure short plant (tt).',T(60,22,'Parents (P)')+plant(140,110,true)+T(140,132,'TT  tall')+T(220,80,'×','font-size="26"')+plant(300,110,false)+T(300,132,'tt  short')],
  ['F1: every child gets one T and one t. All are Tt, and all are tall.',arrow(220,140,220,170)+T(60,190,'F1')+plant(220,250,true)+T(220,272,'Tt  all tall')],
  ['The F1 plants self-pollinate.',T(395,190,'self-pollinate')+arrow(250,230,340,230)],
  ['F2: TT, Tt, Tt and tt. Three tall to one short: the short trait was hiding.',plant(360,250,true)+plant(395,250,true)+plant(430,250,true)+plant(465,250,false)+T(415,272,'F2:  TT  Tt  Tt  tt')+T(415,296,'3 tall : 1 short','font-weight="700"')]]},
 seeNote:'Plant heights are drawn to show tall and short, not to scale.',
 do:{title:'Predict, then grow',mat:'The Pea lab on this page',steps:['Open the Pea lab and press "Mendel\'s first cross".','Predict the F1 before reading the grid.','Press "Self-cross F1", grow 100 seeds, then 1000.','Write down how close each batch came to 3:1.'],obs:'Small batches wander from 3:1; large batches come very close.',why:'Which gamete meets which is a matter of chance, so the ratio is a probability. Mendel counted thousands of plants to see the pattern clearly.',lab:true},
 memo:'TT × tt → all Tt → 3 : 1. "Pure parents, plain children, surprising grandchildren."',
 miscon:['"The short trait was lost in F1." It was hidden, not lost, and reappears in F2.','"F2 must be exactly 3:1." It is close to 3:1 for large numbers.'],
 terms:['Monohybrid cross','F1, F2','Pure-breeding','Gene'],
 q:{q:'Mendel self-pollinated tall F1 plants (Tt). What ratio did the F2 show?',o:['All tall','1 tall : 1 short','3 tall : 1 short','1 tall : 3 short'],a:2,why:'Tt × Tt gives TT, Tt, Tt, tt: three plants with at least one T (tall) to one tt (short).'},
 exam:'A favourite 3–5 mark question: explain the cross with a diagram and the ratios. Draw the cross neatly.'},
{id:'c4',num:'8.2.2',title:'Dominant, recessive, genotype, phenotype',
 intro:'Four words carry most of the chapter\'s marks. Each has a precise meaning.',
 obj:'Use the terms dominant, recessive, genotype and phenotype correctly.',
 prior:'Concept 8.2.2: the monohybrid cross.',
 simple:'The trait that shows up in F1 is dominant (tall). The hidden one is recessive (short). The genotype is the pair of genes a plant has (TT, Tt or tt). The phenotype is what it looks like (tall or short).',
 detail:'A dominant trait is expressed when even one copy of its gene is present, so TT and Tt plants are both tall. A recessive trait is expressed only when both copies are recessive (tt). Two plants with the same phenotype can therefore have different genotypes. By convention, the dominant form is written with a capital letter and the recessive with the same small letter.',
 real:'Two tall parents can have a short child if both carry the hidden recessive gene.',
 apply:'Two tall plants are crossed and one of their offspring is short. What must the genotypes of both parents be?',
 see:{w:520,h:240,f:[
  ['Genotype is the gene pair; phenotype is what we see.',`<rect x="20" y="20" width="480" height="40" rx="8" fill="var(--g2)"/>`+T(110,46,'Genotype','font-weight="700"')+T(400,46,'Phenotype','font-weight="700"')]].concat(
  [['TT',true,'TT: two tall genes, so the plant is tall.'],['Tt',true,'Tt: one T is enough. The plant is still tall: T is dominant.'],['tt',false,'tt: only when both genes are t does the short trait show. t is recessive.']].map(([g,t,c],i)=>[c,T(110,108+i*55,g,'font-size="22" font-weight="700"')+arrow(160,102+i*55,330,102+i*55)+plant(380,124+i*55,t)+T(450,108+i*55,t?'tall':'short')]))},
 seeNote:'TT and Tt look the same: same phenotype, different genotype.',
 do:{title:'Genotype detectives',mat:'Paper slips labelled T and t, two envelopes',steps:['Put one T and one t slip in each envelope (two Tt parents).','Draw one slip from each envelope without looking: that is a child.','Record the genotype and phenotype; replace the slips. Repeat 20 times.'],obs:'About one in four children are short (tt) although both parents are tall.',why:'Each parent passes on one of its two genes at random, and the recessive trait appears only when two t genes meet.'},
 memo:'Capital Covers: a capital letter hides the small one. Geno = Genes, Pheno = Physical look.',
 miscon:['"Dominant means more common or stronger." It only means it is expressed over the recessive form.','"Same look means same genes." TT and Tt look alike.'],
 terms:['Dominant','Recessive','Genotype','Phenotype'],
 q:{q:'A pea plant has the genotype Tt. What is its phenotype?',o:['Short','Tall','Medium height','It cannot be predicted'],a:1,why:'T (tall) is dominant, so one copy is enough for the plant to be tall.'},
 exam:'Very common as definitions (1 mark), "differentiate between" (2–3 marks) and assertion–reason questions.'},
{id:'c5',num:'8.2.2',title:'The two-trait cross and independent inheritance',
 intro:'Mendel then followed two traits at once: seed shape and seed colour.',
 obj:'Explain the dihybrid cross, the 9:3:3:1 ratio and what it shows about independent inheritance.',
 prior:'Monohybrid cross; dominant and recessive.',
 simple:'Mendel crossed plants with round yellow seeds and plants with wrinkled green seeds. F1 seeds were all round and yellow. In F2 he found four kinds: round yellow, round green, wrinkled yellow and wrinkled green, in a ratio of about 9:3:3:1. Two of these were new combinations not seen in either parent.',
 detail:'Round (R) is dominant over wrinkled (r) and yellow (Y) over green (y). RRYY × rryy gives RrYy in F1, all round yellow. Each F1 plant makes four kinds of gamete in equal numbers: RY, Ry, rY and ry. Combining these gives 16 boxes in the Punnett square: 9 round yellow, 3 round green, 3 wrinkled yellow, 1 wrinkled green. The new combinations show that seed shape and seed colour are inherited independently of each other.',
 real:'Plant breeders combine useful traits from two varieties (e.g. high yield and disease resistance) because traits on different chromosomes can be inherited independently.',
 apply:'Out of 1600 F2 seeds from RrYy × RrYy, about how many will be round and green?',
 see:{w:520,h:250,f:[['Round yellow',9,true,true,'9 in 16 are round and yellow: both dominant traits.'],['Round green',3,true,false,'3 in 16 are round and green: a new combination.'],['Wrinkled yellow',3,false,true,'3 in 16 are wrinkled and yellow: another new combination.'],['Wrinkled green',1,false,false,'1 in 16 is wrinkled and green: both recessive. The ratio is 9 : 3 : 3 : 1.']].map(([n,c,r,y,cap],i)=>{const yy=40+i*55;let s=`<text x="20" y="${yy+5}" font-family="Source Sans 3,sans-serif" font-size="15" fill="currentColor">${n}</text>`;for(let k=0;k<c;k++)s+=pea(170+k*36,yy,14,r,y);return [cap,s+T(500,yy+5,c+'/16','font-weight="700"')]})},
 seeNote:'The F2 of RrYy × RrYy, shown as 16 seeds.',
 do:{title:'Two-coin model',mat:'Two coins per student: one marked R/r, one Y/y',steps:['Each pair of students is one parent; toss both coins to make a gamete.','Combine your gamete with your partner\'s to make a child.','Record shape and colour for 32 children; pool class results.'],obs:'The class result approaches 9:3:3:1.',why:'The two coins land independently, just as the two genes pass into gametes independently.'},
 memo:'"9 Rich Yellow, 3 Rich Green, 3 Wrinkly Yellow, 1 Wrinkly Green": 9:3:3:1 adds to 16.',
 miscon:['"F2 only shows the parental types." Two new combinations appear.','"9:3:3:1 means there are 16 plants." It is a ratio out of every 16.'],
 terms:['Dihybrid cross','Independent inheritance','Gamete'],
 q:{q:'In the F2 of a dihybrid cross (RrYy × RrYy), what fraction is wrinkled and green?',o:['9/16','3/16','1/16','4/16'],a:2,why:'Only rryy is wrinkled green: one box out of 16.'},
 exam:'3–5 marks: the cross with F1, F2 and ratio; also case-based numericals using 9:3:3:1.'},
{id:'c6',num:'8.2.3',title:'How traits are expressed',
 intro:'Genes do not make a plant tall directly. They work through proteins.',
 obj:'Explain how a gene controls a trait, and why germ cells carry only one set of genes.',
 prior:'Cells, DNA and proteins (Class 9).',
 simple:'DNA holds instructions for making proteins. A section of DNA that gives the instructions for one protein is a gene. Some proteins are enzymes; an enzyme can make a plant hormone that makes the plant grow taller. A changed gene can give a less efficient enzyme, less hormone, and a shorter plant.',
 detail:'Cellular DNA is the information source for making proteins. Plant height depends on a growth hormone; how much hormone is made depends on how efficiently an enzyme works. If the gene for that enzyme is altered, the enzyme is less efficient, less hormone is made and the plant is short. Both parents contribute DNA equally, so each child has two copies of each gene. To keep the amount constant, each germ cell carries only one copy of each gene, i.e. one set of chromosomes. Each germ cell takes one chromosome from each pair, and since genes for different traits can sit on separate chromosomes, they are inherited independently.',
 real:'The same idea explains many human traits: a gene changes a protein, and the protein changes how the body looks or works.',
 apply:'If germ cells carried both copies of every gene, what would happen to the amount of DNA in each generation?',
 see:{w:520,h:200,f:[
  ['A gene is a section of DNA carrying the instructions for one protein.',fbox(4,'Gene','in DNA')],
  ['Here the protein is an enzyme.',arrow(94,108,104,108)+fbox(106,'Enzyme','protein')],
  ['The enzyme makes a plant growth hormone. An efficient enzyme makes more of it.',arrow(196,108,206,108)+fbox(208,'Hormone','more or less')],
  ['More hormone means a taller plant. An altered gene gives a less efficient enzyme and a short plant.',arrow(298,108,308,108)+fbox(310,'Height','tall or short')+plant(470,150,true)+T(260,40,'Efficient enzyme → more hormone → tall plant')+T(260,176,'Altered gene → less efficient enzyme → short plant','font-size="14"')]]},
 seeNote:'A simplified flow based on the NCERT height example.',
 do:{title:'Chromosome sorting',mat:'Four pairs of paper strips (each pair one colour), two envelopes',steps:['Each pair of strips stands for a chromosome pair in a parent cell.','Make a germ cell: put exactly one strip from each pair into an envelope.','Combine two germ cells (envelopes) to make a child cell and count its strips.'],obs:'Germ cells have 4 strips; the child has 8, the same as the parent.',why:'Halving in germ cells and doubling at fertilisation keep the chromosome number constant.'},
 memo:'Gene → Enzyme → Hormone → Height: "Good Engines Help Height".',
 miscon:['"Genes are the trait itself." Genes carry instructions for proteins that produce the trait.','"Germ cells have the full set of chromosomes." They have half.'],
 terms:['Gene','Protein, enzyme','Germ cell','Chromosome'],
 q:{q:'Why does each germ cell carry only one copy of each gene?',o:['So that the child has no genes from the mother','To keep the amount of DNA constant from one generation to the next','Because germ cells do not need proteins','So that all children are identical'],a:1,why:'Two germ cells fuse at fertilisation, so each must carry half for the child to have the normal two copies.'},
 exam:'2–3 marks: "How do genes control the characteristics?" with the plant-height example.'},
{id:'c7',num:'8.2.4',title:'Sex determination',
 intro:'Whether a baby is a boy or a girl is also decided by inheritance, and differs between species.',
 obj:'Explain sex determination in humans and give examples of environmental sex determination.',
 prior:'Chromosomes come in pairs; germ cells carry one of each pair.',
 simple:'In some animals, the environment decides sex: in some reptiles it is the temperature at which the eggs are kept, and snails can change sex. In humans, sex is decided by genes. Women have two X chromosomes (XX). Men have one X and one Y (XY). The mother\'s egg always carries an X. If the father\'s sperm carries an X, the baby is a girl; if it carries a Y, a boy.',
 detail:'Most human chromosomes come as 22 matched pairs, one copy from each parent. The sex chromosomes are the exception: women have a perfect pair (XX) and men a mismatched pair (one normal-sized X and a short Y). All children inherit an X from their mother. Half of a man\'s sperm carry X and half carry Y, so the chance of a girl or a boy is about one in two for every child. The sex of a child is therefore determined by which chromosome the father\'s sperm carries, not by the mother.',
 real:'Families sometimes blame mothers for not having a son. Science shows this is wrong: the mother always gives an X.',
 apply:'A couple already has two daughters. What is the chance that their next child is a son? Explain.',
 see:{w:520,h:270,f:[
  ['The mother is XX, so every egg she makes carries an X.',`<rect x="30" y="20" width="180" height="56" rx="10" fill="var(--v2)"/>`+T(120,44,'Mother  XX','font-weight="700"')+T(120,66,'eggs: all X','font-size="14"')],
  ['The father is XY, so half his sperm carry X and half carry Y.',`<rect x="310" y="20" width="180" height="56" rx="10" fill="var(--g2)"/>`+T(400,44,'Father  XY','font-weight="700"')+T(400,66,'sperm: X or Y','font-size="14"')],
  ['An X egg with an X sperm gives XX: a girl.',arrow(120,80,140,170)+arrow(400,80,160,170)+`<rect x="70" y="175" width="150" height="56" rx="10" fill="var(--y2)"/>`+T(145,200,'XX  girl','font-weight="700"')+T(145,220,'X egg + X sperm','font-size="13"')],
  ['An X egg with a Y sperm gives XY: a boy. So the father\'s sperm decides, about 1 in 2 each time.',arrow(120,80,360,170)+arrow(400,80,380,170)+`<rect x="300" y="175" width="150" height="56" rx="10" fill="var(--y2)"/>`+T(375,200,'XY  boy','font-weight="700"')+T(375,220,'X egg + Y sperm','font-size="13"')+T(260,258,'Each child: about 1 in 2 chance of either')]]},
 seeNote:'Try the boy-or-girl lab in the Pea lab tab.',
 do:{title:'Coin-toss families',mat:'One coin per student (heads = X sperm, tails = Y sperm)',steps:['Each toss is one child: heads girl, tails boy.','Toss 10 times and record the family.','Pool the class results.'],obs:'Single families vary a lot; the class total is close to half girls, half boys.',why:'Each child is an independent 1-in-2 chance, decided by the sperm.',lab:true},
 memo:'"Mum always gives X; Dad decides with X or Y."',
 miscon:['"The mother decides the baby\'s sex." She always passes an X.','"After two girls, a boy is more likely." Each child is still about 1 in 2.'],
 terms:['Sex chromosomes','X and Y','Environmental sex determination'],
 q:{q:'Which statement about human sex determination is correct?',o:['The mother\'s egg can carry X or Y','A child who gets a Y chromosome from the father is a boy','Temperature decides sex in humans','A girl has the sex chromosomes XY'],a:1,why:'Every egg carries X; an X sperm gives XX (girl), a Y sperm gives XY (boy).'},
 exam:'3 marks with a flow chart is very common; also 1-mark objective and assertion–reason questions.'}
];

const CARDS=[['Heredity','The passing of traits from parents to their offspring.'],['Variation','Differences among individuals of the same species.'],['Gene','A section of DNA that provides the information for one protein.'],['Dominant trait','A trait that is expressed even when only one copy of its gene is present (e.g. tall, T).'],['Recessive trait','A trait expressed only when both copies are recessive (e.g. tt, short).'],['Genotype','The genetic make-up of an organism, e.g. TT, Tt or tt.'],['Phenotype','The visible trait, e.g. tall or short.'],['F1 of TT × tt','All Tt, all tall.'],['Monohybrid F2 phenotype ratio','3 tall : 1 short.'],['Monohybrid F2 genotype ratio','1 TT : 2 Tt : 1 tt.'],['Dihybrid F2 ratio','9 round yellow : 3 round green : 3 wrinkled yellow : 1 wrinkled green.'],['Independent inheritance','Two traits, such as seed shape and colour, are passed on separately, so new combinations appear.'],['Germ cells carry','One copy of each gene: one chromosome from each pair.'],['Human sex chromosomes','Female XX; male XY.'],['Who decides a child\'s sex?','The father: an X sperm gives a girl, a Y sperm gives a boy.'],['Sex determination in some reptiles','The temperature at which the fertilised eggs are kept.'],['Earlobe types','Free and attached: an inherited trait.'],['How a gene controls height','Gene → efficient enzyme → more growth hormone → tall plant.']];

const Q=[
 {lv:1,q:'Who first worked out the rules of inheritance using pea plants?',o:['Charles Darwin','Gregor Mendel','Robert Hooke','Louis Pasteur'],a:1,w:'Gregor Mendel crossed pea plants and counted the offspring.'},
 {lv:1,q:'The sex chromosomes of a human male are:',o:['XX','XY','YY','XO'],a:1,w:'Males have one X and one Y.'},
 {lv:1,q:'True or false: a recessive trait disappears permanently once it is hidden in F1.',o:['True','False'],a:1,w:'False. Short plants reappear in F2 (about 1 in 4).'},
 {lv:1,q:'Fill in the blank: a section of DNA that provides information for one protein is called a ____.',o:['chromosome','gene','nucleus','gamete'],a:1,w:'A gene.'},
 {lv:1,q:'Phenotype means:',o:['the genes an organism carries','its visible characteristic','its number of chromosomes','its parents\' genes'],a:1,w:'Phenotype is what the organism looks like, e.g. tall.'},
 {lv:2,q:'Why are all F1 plants of TT × tt tall?',o:['T is recessive','T is dominant, and every F1 plant has one T','The tt parent died','Tall plants grow faster'],a:1,w:'Every F1 plant is Tt, and one dominant T is enough for tallness.'},
 {lv:2,q:'The genotype ratio in the F2 of a monohybrid cross is:',o:['3:1','1:2:1','9:3:3:1','1:1'],a:1,w:'TT : Tt : tt = 1 : 2 : 1.'},
 {lv:2,q:'Sexual reproduction produces more variation than asexual reproduction because:',o:['it is faster','it combines DNA from two individuals','it involves no DNA copying','offspring are identical'],a:1,w:'Mixing two parents\' DNA creates new combinations.'},
 {lv:3,q:'A tall pea plant crossed with a short plant gives about half tall and half short offspring. The tall parent is:',o:['TT','Tt','tt','Cannot say'],a:1,w:'Tt × tt gives Tt and tt in equal numbers (1:1). TT × tt would give all tall.'},
 {lv:3,q:'From 1600 F2 seeds of RrYy × RrYy, about how many are round and green?',o:['100','300','600','900'],a:1,w:'Round green is 3/16. 3/16 × 1600 = 300.'},
 {lv:3,q:'A couple has three daughters. What is the chance that their fourth child is a son?',o:['1/4','1/2','3/4','Certain'],a:1,w:'Each child is independent: about 1 in 2.'},
 {lv:4,q:'Assertion (A): The sex of a child is determined by the father. Reason (R): Fathers produce sperm carrying either X or Y chromosomes.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'The mother always gives X, so the father\'s X or Y sperm decides.'},
 {lv:4,q:'Assertion (A): Round green and wrinkled yellow seeds appear in the F2 of a dihybrid cross. Reason (R): Seed shape and seed colour are inherited independently.',o:['Both A and R are true and R explains A','Both true but R does not explain A','A true, R false','A false, R true'],a:0,w:'Independent inheritance produces new combinations.'},
 {lv:4,q:'What if germ cells carried both copies of every gene? The chromosome number would:',o:['stay the same','double every generation','halve every generation','become zero'],a:1,w:'Two full sets would fuse at fertilisation, doubling it each time.'},
 {lv:5,open:true,m:5,q:'With the help of a cross, explain how Mendel showed that traits can be dominant or recessive.',ans:['Pure tall (TT) crossed with pure short (tt).','F1: all Tt, all tall, so tall is dominant and short did not show.','F1 self-pollinated: F2 has TT, Tt, Tt, tt.','F2 ratio 3 tall : 1 short; short reappears, so it was recessive and only hidden in F1.','Neat cross diagram with gametes and generations labelled.']},
 {lv:5,open:true,m:3,q:'How is the sex of a child determined in human beings? Explain with a flow chart.',ans:['Women have XX, men have XY sex chromosomes.','All eggs carry X; half the sperm carry X and half Y.','X egg + X sperm → XX girl; X egg + Y sperm → XY boy (flow chart).','So the father\'s sperm decides the sex; chance about 1 in 2.']},
 {lv:5,open:true,m:3,q:'How do Mendel\'s experiments show that traits are inherited independently?',ans:['Cross round yellow (RRYY) × wrinkled green (rryy); F1 all round yellow (RrYy).','F2 shows four types: 9 round yellow : 3 round green : 3 wrinkled yellow : 1 wrinkled green.','New combinations (round green, wrinkled yellow) appear, so shape and colour pass on separately.']},
 {lv:5,open:true,m:2,q:'In the F2 of TT × tt, what fraction of the tall plants are pure tall (TT)? Explain.',ans:['F2: 1 TT : 2 Tt : 1 tt; three are tall.','Only 1 of the 3 tall plants is TT, so the fraction is 1/3.']},
 {lv:5,open:true,m:4,q:'Case: In a survey of 40 students, 26 had free earlobes and 14 attached. Riya has attached earlobes but both her parents have free earlobes. (a) Is earlobe type an inherited trait? (b) Which type is likely to be recessive, judging from Riya\'s family, and why? (c) Does the class count alone prove which type is dominant?',ans:['(a) Yes, it is passed from parents to children.','(b) Attached: it appears in Riya though hidden in both parents, so both must carry it in a recessive form.','(c) No: how common a trait is does not show dominance; family crosses do.']}
];

const ONEMIN=['Variation arises from DNA-copying errors and, much more, from sexual reproduction mixing two parents\' DNA.','Variations that help survival in an environment are more likely to be passed on.','Inherited traits (e.g. earlobe type) pass from parents to children.','Mendel: TT × tt → F1 all Tt (tall) → F2 3 tall : 1 short; genotypes 1 TT : 2 Tt : 1 tt.','Dominant shows with one copy; recessive only as a pair. Genotype = genes, phenotype = look.','Dihybrid RRYY × rryy → F1 RrYy → F2 9:3:3:1; new combinations show independent inheritance.','Gene → protein (enzyme) → hormone → trait (plant height).','Germ cells carry one copy of each gene, so the number stays constant.','Humans: female XX, male XY; the father\'s X or Y sperm decides the child\'s sex. Some reptiles: temperature decides.'];
const KEYS=[['variation',/variation/i],['DNA copying',/copy/i],['sexual reproduction mixes DNA',/sexual/i],['Mendel / pea plants',/mendel|pea/i],['dominant and recessive',/dominan|recessiv/i],['3:1 ratio',/3\s*:\s*1/],['genotype and phenotype',/genotype|phenotype/i],['9:3:3:1',/9\s*:\s*3/],['independent inheritance',/independen/i],['gene and protein',/protein|enzyme/i],['germ cells carry one copy',/germ|half/i],['XX and XY',/x\s*y|xy/i],['father decides sex',/father|sperm/i]];

const MIND=[['Variation',90,60],['Inherited traits',430,60],["Mendel's crosses",90,220],['Gene expression',430,220],['Sex determination',260,265]];
const MIND_CENTER='Heredity',ACC=GREEN,LABNAME='Pea lab',HERO=pod;

/* ---------- pea lab ---------- */
const TR={height:['T','Tall','Short'],shape:['R','Round','Wrinkled'],colour:['Y','Yellow','Green']};
const norm=(a,b)=>[a,b].sort((p,q)=>(p===p.toLowerCase())-(q===q.toLowerCase())).join('');
const genos=L=>[L+L,L+L.toLowerCase(),L.toLowerCase()+L.toLowerCase()];
const isDom=g=>g!==g.toLowerCase();
function icon(trait,dom){if(trait==='height')return svg(40,60,plant(20,56,dom));if(trait==='shape')return svg(40,40,pea(20,20,15,dom,true));return svg(40,40,pea(20,20,15,true,dom))}
const diIcon=(r,y)=>svg(40,40,pea(20,20,15,r,y));
const gcd=(a,b)=>b?gcd(b,a%b):a;
function lab(names,counts){const k=counts.map((v,i)=>[names[i],v]).filter(x=>x[1]>0);if(k.length===1)return 'all '+k[0][0];const g=k.map(x=>x[1]).reduce(gcd);return k.map(x=>x[0]).join(' : ')+' = '+k.map(x=>x[1]/g).join(' : ')}
function ratioText(counts){const v=counts.filter(x=>x>0);if(!v.length)return '';const g=v.reduce(gcd);return counts.map(x=>x/g).join(' : ')}
let mode='mono';
function fillSel(){const L=TR[$('#trait').value][0];['#p1','#p2'].forEach((s,i)=>{const old=$(s).value;$(s).innerHTML=genos(L).map(g=>`<option>${g}</option>`).join('');$(s).value=genos(L).includes(old)?old:genos(L)[i?2:0]})}
function mono(){
  const t=$('#trait').value,[L,D,R]=TR[t],a=$('#p1').value,b=$('#p2').value;
  let h=`<div class="gh"><small>egg ↓ · pollen →</small></div>`+[...b].map(g=>`<div class="gh">${g}<small>pollen</small></div>`).join('');
  const kids=[];[...a].forEach(x=>{h+=`<div class="gh">${x}<small>egg</small></div>`;[...b].forEach(y=>{const k=norm(x,y);kids.push(k);h+=`<div class="gc" style="animation-delay:${kids.length*120}ms">${icon(t,isDom(k))}${k}</div>`})});
  $('#grid').style.gridTemplateColumns='repeat(3,minmax(0,1fr))';$('#grid').innerHTML=h;
  const gt=genos(L).map(g=>kids.filter(k=>k===g).length),dn=kids.filter(isDom).length;
  $('#pred').innerHTML=bars([[D,dn],[R,4-dn]],4)+`<p class="note">Genotypes: ${lab(genos(L),gt)} · Phenotypes: ${lab([D,R],[dn,4-dn])}</p>`;
  $('#grown').innerHTML='';return {cls:[D,R],exp:[dn/4,1-dn/4],pick:()=>isDom(a[rand2()]+b[rand2()])?0:1};
}
function fillDi(){const opt=(L)=>genos(L).map(g=>`<option>${g}</option>`).join('');['#d1s','#d2s'].forEach(s=>{if(!$(s).options.length){$(s).innerHTML=opt('R')}});['#d1c','#d2c'].forEach(s=>{if(!$(s).options.length){$(s).innerHTML=opt('Y')}})}
const gam=(s,c)=>{const o=[];[...s].forEach(x=>[...c].forEach(y=>o.push(x+y)));return o};
const DCL=['Round yellow','Round green','Wrinkled yellow','Wrinkled green'];
const dcls=(s,c)=>(isDom(s)?0:2)+(isDom(c)?0:1);
function di(){
  const g1=gam($('#d1s').value,$('#d1c').value),g2=gam($('#d2s').value,$('#d2c').value);
  let h=`<div class="gh"><small>egg ↓ · pollen →</small></div>`+g2.map(g=>`<div class="gh">${g}</div>`).join('');const cnt=[0,0,0,0];
  g1.forEach(x=>{h+=`<div class="gh">${x}</div>`;g2.forEach(y=>{const s=norm(x[0],y[0]),c=norm(x[1],y[1]);cnt[dcls(s,c)]++;h+=`<div class="gc" style="animation-delay:${(cnt.reduce((a,b)=>a+b)-1)*50}ms">${diIcon(isDom(s),isDom(c))}<span style="font-size:13px">${s}${c}</span></div>`})});
  $('#grid').style.gridTemplateColumns='repeat(5,minmax(0,1fr))';$('#grid').innerHTML=h;
  $('#pred').innerHTML=bars(DCL.map((n,i)=>[n,cnt[i]]),16)+`<p class="note">Phenotypes: ${lab(DCL,cnt)} (out of 16 boxes)</p>`;
  $('#grown').innerHTML='';
  return {cls:DCL,exp:cnt.map(x=>x/16),pick:()=>{const x=g1[rand(4)],y=g2[rand(4)];return dcls(norm(x[0],y[0]),norm(x[1],y[1]))}};
}

function bars(rows,tot,exp){return rows.map(([n,v],i)=>`<div class="row"><span>${esc(n)}</span><span class="t"><i style="width:${v/tot*100}%"></i></span><span>${v}</span></div>`+(exp?`<div class="row"><span class="note">expected</span><span class="t"><i class="e" style="width:${exp[i]*100}%"></i></span><span class="note">${Math.round(exp[i]*tot)}</span></div>`:'')).join('')}
let model=null;
function runSim(){model=mode==='mono'?mono():di()}
function grow(){const n=+$('#nGrow').value,c=model.cls.map(()=>0);for(let i=0;i<n;i++)c[model.pick()]++;$('#grown').innerHTML=bars(model.cls.map((x,i)=>[x,c[i]]),n,model.exp)+`<p class="note">Your batch: ${c.join(' : ')}</p>`}
let sx=[0,0];
function sxDraw(){const t=sx[0]+sx[1]||1;$('#sxOut').innerHTML=bars([['Girls (XX)',sx[0]],['Boys (XY)',sx[1]]],t)+`<p class="note">${sx[0]+sx[1]} children so far.</p>`}


function labInit(){fillSel();$('#p2').value=genos('T')[2];sxDraw()}
function labShow(){if(!model)runSim()}
function labClick(b){
  if(b.id==='mMono'||b.id==='mDi'){mode=b.id==='mMono'?'mono':'di';$('#mMono').setAttribute('aria-pressed',mode==='mono');$('#mDi').setAttribute('aria-pressed',mode==='di');$('#monoCtrl').hidden=mode!=='mono';$('#diCtrl').hidden=mode!=='di';if(mode==='di')fillDi();runSim()}
  else if(b.dataset.pre){const L=TR[$('#trait').value][0],g=genos(L),P={P:[g[0],g[2]],F1:[g[1],g[1]],TC:[g[1],g[2]]}[b.dataset.pre];$('#p1').value=P[0];$('#p2').value=P[1];runSim()}
  else if(b.dataset.dpre){const P=b.dataset.dpre==='P'?['RR','YY','rr','yy']:['Rr','Yy','Rr','Yy'];['#d1s','#d1c','#d2s','#d2c'].forEach((s,i)=>$(s).value=P[i]);runSim()}
  else if(b.id==='grow')grow();
  else if(b.id==='sx1'||b.id==='sx100'){const n=b.id==='sx1'?1:100;for(let i=0;i<n;i++)sx[rand2()]++;sxDraw()}
  else if(b.id==='sx0'){sx=[0,0];sxDraw()}
  else return false;return true}
function labChange(t){if(t.id==='trait'){fillSel();runSim();return true}if(['p1','p2','d1s','d1c','d2s','d2c'].includes(t.id)){runSim();return true}return false}

return {C,CARDS,Q,ONEMIN,KEYS,MIND,MIND_CENTER,ACC,HERO,LABNAME,lab:{init:labInit,show:labShow,click:labClick,change:labChange}};
}});
