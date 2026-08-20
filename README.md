# MHHS SkillsUSA — chapter website

Plain HTML, CSS and JavaScript. No build step, no Node, no npm.

---

## Running it locally

```bash
python3 tools/serve.py
```

Then open <http://localhost:8123>. Serve it over `http://` rather than opening a
`file://` path — the gallery and the intro need a real server.

---

## Putting it online

Upload the contents of this folder to any static host.

| Host | How |
|---|---|
| **GitHub Pages** | Push to a repo, enable Pages on the `main` branch. `.nojekyll` is already here. |
| **Netlify** | Drag the folder onto netlify.com/drop |
| **Cloudflare Pages** | Connect the repo, leave the build command blank, output directory `/` |

`.htaccess` is only used on Apache shared hosting (Hostinger and similar). It forces
HTTPS and allows `/officers` instead of `/officers.html`. GitHub Pages ignores it —
harmless to leave in place. Edit the hostname inside it before using it.

---

## Editing the site

### One file for almost everything

**`assets/js/data.js`** holds all the content that changes during the year:
advisors, officers, committee representatives, contests, recognition programmes,
calendar dates, meetings, spotlights, gallery captions and the FAQ. Edit the text,
save, refresh.

**Search the file for `TBD` to find every open item at once.** There are a lot of
them right now, deliberately — see below.

### What is TBD, and why

Facts about **SkillsUSA itself** are filled in and sourced: the Framework and its
17 Essential Elements, the three contest categories, the competition ladder, and
the two conference blocks (California SLSC, 8–11 April 2027 in Ontario; the national
NLSC, 21–25 June 2027 in Atlanta).

Facts about **this chapter** are marked TBD: advisor and officer names, meeting day
and room, dues, which MHHS career and technical education pathways the chapter draws
from, and which contests it will actually enter. Those were left as TBD rather than
guessed, because a confident wrong answer on a membership deadline does real damage.

Calendar entries the chapter controls carry `provisional: true`, which makes the site
label them "date to be confirmed". When a date is confirmed, correct it and delete
that one line.

### Adding a page, or changing the navigation

The navigation is written into all 17 HTML files. **`tools/build.py`** generated
them — edit the `NAV` list at the top and run:

```bash
python3 tools/build.py
```

**This overwrites every `.html` file in the folder.** If you have hand-edited a page,
those edits are lost. For small text changes, edit the HTML directly and leave the
script alone; for anything structural, edit `build.py` and regenerate.

---

## Photographs

The chapter has no photographs yet, so **every image slot is filled by a generated
plate** — a designed graphic in the chapter palette, produced by `tools/plates.py`
from geometry drawn from the SkillsUSA emblem. Nothing on the site is stock imagery
or AI-generated. The gallery says as much on the page itself.

### Dropping in a real photograph

1. Put a web-sized copy in `assets/img/gallery/<slug>.jpg` (about 1500px on the long edge)
2. Put a smaller copy with the **same filename** in `assets/img/gallery/thumb/<slug>.jpg` (about 620px)
3. Add `"<slug>"` to the `real` list in the `media` block of `data.js`
4. Rewrite that row's caption in the `gallery` array so it describes the photograph
   rather than the reserved slot

When every slot has a photograph, set `media.ext` to `"jpg"` and empty `media.real`.

Roster portraits work the same way: `assets/img/people/<slug>.jpg`. The plate shows
initials derived from the slug, so rename the slug to the person's name
(`president` → `alex-rivera`) and re-run `tools/plates.py` for a sensible monogram.

Adding a **new** gallery slot: add a row to the `gallery` array in `data.js`, then run
`python3 tools/plates.py` — it reads its slug list straight out of `data.js`, so the
two can never disagree.

### Video

The intro montage supports `<video>` layers, the same as the HOSA original. Drop clips
into `assets/video/` and add them as `.mont__layer` children in `index.html`. Give
each one a `poster` frame so a still shows if iOS Low Power Mode blocks autoplay.

---

## Design system

`assets/css/site.css`, tokens at the top. Navy is the default surface; warm paper
appears only where long reading happens; red and gold are accents, never fills.

| Token | Value | Notes |
|---|---|---|
| `--red` | `#C8102E` | SkillsUSA red, tracking Pantone 186 |
| `--steel` | `#00205B` | SkillsUSA blue, tracking Pantone 288 |
| `--gold` | `#FFC72C` | SkillsUSA gold, tracking Pantone 123 |
| `--navy` | `#071633` | Primary surface |
| `--paper` | `#F6F3EE` | Relief surface for dense reading |

Red and white stand for the individual states and chapters, blue for the union of
them, and gold for the individual member. Gold therefore does the work of emphasis
throughout. **If the chapter is handed an official brand sheet, those five lines are
the only ones that need to change.**

The **chevron** is the structural motif, taken from the angular stroke of the
SkillsUSA emblem. It marks list items and separates label text. Downward carets
(nav dropdowns, the scroll hint, FAQ disclosure) stay as triangles, because they
mean "this expands downward" rather than carrying brand meaning.

---

## What is on the site

| Page | What it covers |
|---|---|
| `index.html` | Scroll-to-enter intro, chapter statement, the three contest categories, collage, chapter stats, the 3D photo track, upcoming dates, how to join |
| `join.html` | Eligibility and the three membership steps |
| `officers.html` | Advisors, state office, seven officers, assistant officers, emblem colours |
| `committee-reps.html` | The role, how selection works, three committees, nine seats |
| `competition.html` | The four-level ladder, and every competition resource in one place |
| `competitions.html` | All three contest categories and the contests in each |
| `recognition.html` | Chapter Excellence Program, American Spirit, Community Service, Career Essentials, Statesman Award |
| `service-hours.html` | What hours feed into, plus a private browser-local hour tracker with CSV export |
| `checkpoints.html` | Weekly checkpoints and a seven-milestone contest roadmap |
| `calendar.html` | Google Calendar slot plus every date in the season |
| `chapter-events.html` | Fundraisers and volunteering |
| `meetings.html` | Meeting times, what happens at a meeting, slide and recap archive |
| `gallery.html` | 18 reserved photo slots with filters and a lightbox |
| `traditions.html` | The pin, the shirt contest, the chapter archive |
| `framework.html` | The Framework, all 17 Essential Elements, and the SkillsUSA Pledge |
| `spotlight.html` | Member spotlight |
| `faq.html` | 30 questions in 5 groups |

---

## Tools

| Script | What it does |
|---|---|
| `tools/build.py` | Generates all 17 HTML pages. Overwrites them. |
| `tools/plates.py` | Generates the placeholder plates from the slugs in `data.js` |
| `tools/serve.py` | Local preview server on port 8123 |

---

## The intro

The home page opens with a portrait frame that expands into a wide plate as you
scroll.

- It shows **once per browser session**. Returning to the home page in the same
  session goes straight to the site.
- **Skip intro**, <kbd>Esc</kbd>, <kbd>Enter</kbd> and <kbd>Space</kbd> all open it immediately.
- It is skipped entirely for anyone with "reduce motion" turned on.
- If JavaScript fails, a failsafe opens the page after 6 seconds, and a `<noscript>`
  rule hides the intro completely.

---

## Sources

Programme facts on the site come from:

- [SkillsUSA Framework](https://www.skillsusa.org/who-we-are/skillsusa-framework/) — the three components and 17 Essential Elements
- [SkillsUSA Championships](https://www.skillsusa.org/competitions/skillsusa-championships/) — 113 contests, the four-level ladder, Atlanta through 2033
- [Categories and Descriptions](https://www.skillsusa.org/competitions/skillsusa-championships/categories-and-descriptions/) — Leadership, Occupationally Related, Skilled and Technical
- [SkillsUSA California](https://www.skillsusaca.org/stateconference) — SLSC dates, Ontario venues, ~120 state competitive events

Confirm anything time-sensitive against those sites before publishing it as chapter
guidance — national programmes and state contest lists are revised each year.
