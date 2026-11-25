# Quick Revise: Study Games

One file: `quick-revision-games.html`. It needs no build step, no libraries and no server. It works on phones (touch), tablets, laptops (mouse) and keyboards.

---

## 1. Design idea

**See → Do → Remember.** No question-and-answer screens.

| Step | What the student does | Where it happens in the code |
|---|---|---|
| See | Looks at pictures, plates, diagrams and pizzas | `face()` draws emoji, SVG or an image |
| Do | Drags, taps, sorts, orders, labels, flips | 6 game engines |
| Get it right | Wrong answers bounce back with a one-line fix ("🧈 Butter → Fat") | `ctx.tip()`, the fix chips |
| Remember | A concept card after each round, plus a "Remember" list at the end | `rounds[].idea`, `reveal`, `ideas` |

Motivation loop: ⭐ stars per game (1–3), XP, 🔥 combo for answers in a row, a 🔥 daily streak, confetti and sound. 🎲 Surprise picks a game the student hasn't mastered yet.

Every drag also works as a tap, so small kids and low-end phones are fine.

---

## 2. The 6 game types

| type | Name on card | Best for | Example |
|---|---|---|---|
| `platter` | 🍽️ Plate it | "Pick all the X" | Fill the plate with only carbohydrate foods |
| `bins` | 🗂️ Sort it | Sorting into 2–5 groups | Acid / Base / Neutral, Kharif / Rabi, fraction pizzas |
| `sequence` | 🔗 Chain it | Order, flow, process | Food chain, digestion, reflex arc, EM spectrum |
| `label` | 🏷️ Label it | Diagrams | Plant cell, flower (heart, eye and so on can be added) |
| `pairs` | 🃏 Match it | Cause ↔ effect, term ↔ meaning | Vitamin ↔ deficiency disease |
| `odd` | 🎯 Spot it | Quick concept checks | 🐧 among desert animals |

## 3. Included content (23 games)

- **Class 6:** Build the Plate · Missing Nutrient · Pizza Fractions · Odd One Out · Word Sorter
- **Class 7:** Food's Journey · Litmus Lab · Heat on the Move
- **Class 8:** Microbe Friend/Foe · Kharif or Rabi · Metal Detector
- **Class 9:** Label the Plant Cell · Solid/Liquid/Gas · Rational or Not?
- **Class 10:** Food Chain · Reflex Arc · Reaction Types · Label the Flower · Renewable or Not
- **Class 11:** Five Kingdoms · Scalar or Vector
- **Class 12:** EM Spectrum Ladder · Biotech Toolkit

---

## 4. Adding a new chapter (no coding)

Open the file and find `const GAMES = [`. Copy any game block, change the text, and save. Each `id` must be unique.

Common fields (every game):
```js
{ id:'c7-respiration', cls:7, subject:'Science', chapter:'Respiration in Organisms',
  title:'Breathe In, Breathe Out', icon:'🫁', type:'bins',
  ideas:[['🫁','Aerobic → uses oxygen'], ['🍞','Anaerobic → no oxygen (yeast)']],   // end-of-game recap
  /* + type fields below */ }
```
`subject` sets the card colour: Science, Maths, English, Social Science, Physics, Chemistry, Biology. Add more in `SUBJECT_COLORS`.

**An item** (used by every type) can be shown 4 ways:
```js
{e:'🍚', n:'Rice'}                 // emoji + name
{t:'√2'}                           // big text (equations, words, numbers)
{img:'/images/rice.jpg', n:'Rice'} // your own photo
{html:pie(3,4), n:'3/4'}           // any SVG (pie() draws fraction pizzas)
```
Optional: `tip:'Lactobacillus'`, a short fact shown when the student answers.

### platter
```js
type:'platter',
tagNames:{carb:'Carbohydrate', protein:'Protein'},
items:[ {e:'🍚',n:'Rice',tags:['carb']}, {e:'🥛',n:'Milk',tags:['protein'],also:['fat']} ],
rounds:[ {tag:'carb', icon:'⚡', label:'Carbohydrates', hint:'Fill the plate · energy foods', idea:'Quick energy.'} ]
```
`also` = a food that partly belongs. It is left out of that round so nobody gets marked wrong unfairly.
Optional: `perRound` (default 12 foods), `perRoundRight` (default 5 correct foods).

### bins
```js
type:'bins',
bins:[ {id:'a', icon:'🔴', label:'Acidic', sub:'blue litmus → red'}, ... ],   // 2–5 bins
items:[ {e:'🍋', n:'Lemon juice', bin:'a'}, ... ],
showNames:false   // optional: hide names (picture-only, as in the fraction pizzas)
```

### sequence
```js
type:'sequence', prompt:'Who eats whom?', hint:'Producer first', headIcon:'🌿',
items:[ {e:'🌿', n:'Grass', sub:'producer'}, ... ],        // write them in the CORRECT order; the game shuffles them
reveal:{icon:'🔟', title:'10% Law', text:'Only ~10% energy moves up.'}
```

### label
```js
type:'label', svg:'<svg-inner-markup>', w:400, h:300,     // viewBox size
spots:[ {x:95, y:100, n:'Nucleus', e:'🧠', fn:'control centre'}, ... ]
```
Tip: open your diagram in any SVG editor, read off the x,y of each part, and paste. A PNG works too: `svg:'<image href="/img/heart.png" width="400" height="300"/>'`.

### pairs
```js
type:'pairs', pairs:[ [{e:'🍊',n:'Vitamin C'}, {e:'🦷',n:'Scurvy'}], ... ]   // 6 pairs = 12 cards
```

### odd
```js
type:'odd', rounds:[ {items:[['🌵','Cactus'],['🐪','Camel'],['🦎','Lizard'],['🐧','Penguin']], odd:3, why:'🐧 lives in cold'} ]
```

---

## 5. Putting it on your website

**Option A: iframe (easiest)**
```html
<iframe src="/games/quick-revision-games.html?class=7" style="width:100%;height:100vh;border:0"></iframe>
```

**URL options**
- `?class=9` opens Class 9.
- `?game=c6-food-plate` opens one game directly. Use this for a "Revise" button inside a chapter page.

**Saving scores to your database (Student 360°)**
When a game ends, the page sends this to the parent page:
```js
window.addEventListener('message', e => {
  if (e.data?.source !== 'vis-quick-revision') return;
  // e.data = { type:'game-complete', gameId, cls, subject, chapter, gameType,
  //            accuracy, stars, xp, hits, misses, bestCombo, timeSec }
  fetch('/api/revision-score', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...e.data, studentId})});
});
```
If you include the file directly instead of using an iframe:
```js
VISQuickRevision.onComplete = data => { /* same data */ };
VISQuickRevision.open('c10-flower');   // open a game from your own button
VISQuickRevision.progress();           // stars / xp / streak saved on this device
```
This data also gives teachers a weak-chapter report: low `accuracy` on a `chapter` means re-teach it.

**Progress storage:** stars, XP and streak are saved in the browser (`localStorage`, key `vis-quickrev-v1`). For progress that follows the student across devices, save the `game-complete` data to your server as shown above.

**Fonts:** Baloo 2 and Nunito load from Google Fonts. If there is no internet, the page falls back to system fonts automatically.

---

## 6. Suggested next additions

1. **Hindi toggle:** add `nHi` beside `n` on each item and switch with a button.
2. **Teacher mode:** a page where teachers build games through a form that writes this same JSON.
3. **More diagrams:** heart, eye, neuron, digestive system, India map (for Social Science).
4. **Class leaderboard:** from the XP your server collects.
5. **Daily 5-minute mix:** 1 round each from 3 different chapters.
