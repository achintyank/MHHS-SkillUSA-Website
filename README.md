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

---

## The hero — the cursor reveal

The home page opens on two photographs in one frame. The **base** is the
chapter delegation outside the California State Leadership and Skills
Conference in Ontario; the **reveal** is the same chapter inside the national
conference in Atlanta. The cursor opens a window from one into the other.

It is a single fullscreen quad with a fragment shader — raw WebGL, no Three.js
and no library, because there is no scene, geometry or model for one to manage.

### Why it moves the way it does

The window is not a shape. It is a **fluid simulation** — the same technique
behind Inspira UI's fluid cursor, and the same GPU Navier-Stokes lineage.

Earlier versions of this hero drew a mask: first a soft radial gradient, then
a Voronoi threshold. Both were shapes being moved around, and both read as
shapes being moved around. This one runs an actual solver. The cursor injects
dye and velocity into a field; the field advects itself, vorticity confinement
puts the curl back in, and it dissipates. Wherever there is dye, the second
photograph shows through.

Nothing in it knows what shape it is. The shape is whatever the fluid is doing.

Per frame:

```
curl → vorticity → divergence → clear pressure → Jacobi solve (18 iters)
     → gradient subtract → advect velocity → advect dye → composite
```

Two things are layered on top:

| | |
|---|---|
| **Parallax** | Each photo shifts as a whole against the cursor, the reveal moving about three times as far as the base. Never per-pixel — displacing one photo by the other's luminance tears it along contours that have nothing to do with it. |
| **Idle bursts** | Random splats fire while the cursor is parked, so it keeps billowing with nobody touching it. |

### Changing the photographs

The two frames must be **the same scene at the same crop** for the effect to
morph rather than cross-fade. The current pair are different events, which is
why it reads as a portal between them — a good result here, but a deliberate
one.

```bash
# 1. drop the originals in assets/img/hero/
# 2. point SOURCES in tools/hero_images.py at them and tune the crop
python3 tools/hero_images.py
# 3. update the stems and alt text in the `hero` block of assets/js/data.js
```

`tools/hero_images.py` crops each source to a focal band, resizes to two
widths, and writes WebP with a JPEG fallback. It forces both sources to
**identical output dimensions** — the shader samples them with one set of
coordinates, so a mismatch slides one image against the other.

It also **strips EXIF from every output**. Phone photos carry GPS coordinates,
device make and model, and a capture timestamp. The originals in that folder
keep theirs, so do not deploy the originals — only the derived
`-1280` / `-2048` files are referenced.

### Tuning

All in the `hero` block of `data.js`. The fluid ones matter most:

| Key | Default | Effect |
|---|---|---|
| `curl` | `30` | Vorticity confinement. `0` looks like ink spreading; `30` looks like smoke. |
| `dissipation` | `2.4` | Dye decay **per second**. Higher closes the reveal back up sooner. |
| `velocityDiss` | `0.55` | Motion decay per second. Higher makes the flow stop sooner. |
| `splatForce` | `6000` | How hard cursor movement pushes the fluid. |
| `splatRadius` | `0.24` | Size of the injection at the cursor. |
| `idle` | `1.0` | Unprompted bursts while the cursor is still. `0` leaves it dormant. |
| `simRes` / `dyeRes` | `128` / `512` | Grids. Drop to `64` / `256` if it ever runs hot on school hardware. |

Both decay values are **rates per second**, not per-frame multipliers. Applying
them per frame ties the physics to the refresh rate and — at 60fps — kills the
velocity field in about a tenth of a second, so the dye never gets carried
anywhere and the whole thing reads as a puff instead of a trail.

### Fallbacks, all verified

| Condition | Behaviour |
|---|---|
| No WebGL | `hero.js` bails before touching the DOM; the `<img>` underneath is the hero. Verified by blocking `webgl`, `webgl2` and `experimental-webgl`. |
| No float render targets | The solver probes a real 4x4 float framebuffer at startup and drops to 8-bit if the driver advertises support it does not have |
| Texture or shader fails | `is-live` is never set, the still stands |
| WebGL context lost | Drops back to the still image |
| `prefers-reduced-motion` | The solver never steps and idle bursts are off — a still composite |
| Touch / no cursor | Idle bursts keep the fluid alive without a pointer |
| JavaScript off | The `<img>` and all the type are real markup and render normally |

The `<img>` is never decoration — it paints first, so there is no blank frame
while the textures decode, and it is the fallback for every failure above.

### The scroll-to-enter intro

The hero **replaced** the old intro, so that the first thing on screen is the
hero rather than the second thing after a scroll. `assets/js/intro.js` and the
`.intro` / `.mont` / `.is-gated` rules in `site.css` are still present but are
no longer referenced by any page — roughly 4KB of dead CSS that still ships.
They were left in place so the intro can be restored from `build.py` if wanted;
delete both if not.

---

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
| `index.html` | The cursor-reveal hero, chapter statement, the three contest categories, collage, chapter stats, the 3D photo track, upcoming dates, how to join |
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
| `tools/hero_images.py` | Crops, resizes and strips EXIF from the two hero photographs |
| `tools/serve.py` | Local preview server on port 8123 |

---

## Sources

Programme facts on the site come from:

- [SkillsUSA Framework](https://www.skillsusa.org/who-we-are/skillsusa-framework/) — the three components and 17 Essential Elements
- [SkillsUSA Championships](https://www.skillsusa.org/competitions/skillsusa-championships/) — 113 contests, the four-level ladder, Atlanta through 2033
- [Categories and Descriptions](https://www.skillsusa.org/competitions/skillsusa-championships/categories-and-descriptions/) — Leadership, Occupationally Related, Skilled and Technical
- [SkillsUSA California](https://www.skillsusaca.org/stateconference) — SLSC dates, Ontario venues, ~120 state competitive events

Confirm anything time-sensitive against those sites before publishing it as chapter
guidance — national programmes and state contest lists are revised each year.
