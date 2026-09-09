#!/usr/bin/env python3
"""Generate the MHHS SkillsUSA static site.

Every page shares the same masthead and footer, so they are assembled here
once. The output is plain HTML. Edit the generated files directly, or edit
this script and re-run it.

    python3 tools/build.py

Running this OVERWRITES every .html file in the project root. If you have
hand-edited a page, your edits are lost. For small text changes, edit the
HTML directly and leave this script alone; for anything structural (a new
page, a nav change, a new section) edit here and regenerate.

Content that changes during the year (officers, contests, dates, FAQ) does
NOT live here. It lives in assets/js/data.js.
"""
import hashlib, os, html, re

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

CHEV = "&#10095;"          # ❯ the chapter's separator mark
YEAR = "2026&ndash;2027"

# The home page loads one extra script for the hero shader. Everything else
# on the site runs on the shared three.
HERO_TAG = '<script src="{hero_js}"></script>\n'

FONTS = ("https://fonts.googleapis.com/css2?"
         "family=Newsreader:ital,opsz,wght@0,6..72,200..700;1,6..72,200..700"
         "&family=IBM+Plex+Mono:wght@400;500"
         "&family=IBM+Plex+Sans:wght@400;500;600&display=swap")

NAV = [
    ("Home", "index.html", None),
    ("Join", "join.html", None),
    ("Our Officers", "officers.html", None),
    ("Competition", "competition.html", None),
    ("Chapter Life", None, [
        ("Calendar &amp; Deadlines", "calendar.html"),
        ("Skills Banquet", "banquet.html"),
        ("Photo Gallery", "gallery.html"),
    ]),
]

FOOT_COLS = [
    ("The chapter", [("About MHHS SkillsUSA", "index.html"), ("How to join", "join.html"),
                     ("Our officers", "officers.html"),
                     ("Committee representatives", "committee-reps.html"),
                     ("Member spotlight", "spotlight.html")]),
    ("Competing", [("Competition hub", "competition.html"),
                   ("All contests", "competitions.html"),
                   ("Recognition programmes", "recognition.html"),
                   ("Service hours", "service-hours.html"),
                   ("Contest roadmap", "checkpoints.html")]),
    ("Chapter life", [("Calendar", "calendar.html"),
                      ("Skills banquet", "banquet.html"),
                      ("Events &amp; volunteering", "chapter-events.html"),
                      ("Meetings &amp; recaps", "meetings.html"),
                      ("Traditions", "traditions.html"),
                      ("Gallery", "gallery.html")]),
    ("Official SkillsUSA", [("SkillsUSA California", "https://www.skillsusaca.org/"),
                            ("SkillsUSA National", "https://www.skillsusa.org/")]),
]



def stamp(rel):
    """asset URL with a content hash, so a changed file is never served stale.

    GitHub Pages and browsers both cache assets/css/site.css and
    assets/js/data.js hard. Without this, an edit ships and readers keep
    seeing the previous copy until they clear their cache."""
    path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), rel)
    try:
        h = hashlib.md5(open(path, "rb").read()).hexdigest()[:8]
    except OSError:
        return rel
    return "%s?v=%s" % (rel, h)

def nav_html(current):
    out = []
    for label, href, kids in NAV:
        if kids:
            open_child = any(k[1] == current for k in kids)
            items = "".join(
                '<li><a href="{h}"{c}>{l}</a></li>'.format(
                    h=k[1], l=k[0],
                    c=' aria-current="page"' if k[1] == current else "")
                for k in kids)
            out.append(
                '<li class="nav__item nav__item--has-menu">'
                '<button class="nav__link" type="button" aria-expanded="false"{c}>'
                '{l}<i class="caret"></i></button>'
                '<ul class="nav__menu">{items}</ul></li>'.format(
                    l=label, items=items,
                    c=' aria-current="true"' if open_child else ""))
        else:
            out.append(
                '<li class="nav__item"><a class="nav__link" href="{h}"{c}>{l}</a></li>'.format(
                    h=href, l=label,
                    c=' aria-current="page"' if href == current else ""))
    return "".join(out)


def foot_html():
    cols = "".join(
        '<div><h4>{t}</h4><ul>{li}</ul></div>'.format(
            t=title,
            li="".join(
                '<li><a href="{h}"{ext}>{l}</a></li>'.format(
                    h=h, l=l,
                    ext=' target="_blank" rel="noopener"' if h.startswith("http") else "")
                for l, h in links))
        for title, links in FOOT_COLS)
    return """
<footer class="foot">
  <div class="shell shell--wide">
    <div class="foot__grid">
      <div>
        <p class="foot__mark">MHHS <b>SkillsUSA</b></p>
        <p>The SkillsUSA chapter at Mountain House High School, preparing members
           for careers in trade, technical and skilled service occupations through
           the {year} season.</p>
        <div class="socials mt-2" data-render-socials></div>
      </div>
      {cols}
    </div>
    <div class="foot__base">
      <span>Mountain House High School &middot; Lammersville Unified School District</span>
      <span>Preparing for leadership in the world of work</span>
      <span>&copy; <span id="year">2026</span> MHHS SkillsUSA</span>
    </div>
  </div>
</footer>""".format(cols=cols, year=YEAR)


def theme(body):
    """Navy is the default surface.

    Page bodies are authored against a paper-dominant scheme, then remapped
    here. `band--relief` opts a section back into warm paper where dense
    reading happens.
    """
    body = re.sub(r'band--paper-2\b', 'band--navy-2', body)
    body = re.sub(r'band--paper\b', 'band--navy', body)
    body = re.sub(r'band--relief-2\b', 'band--paper band--paper-2', body)
    body = re.sub(r'band--relief\b', 'band--paper', body)
    return body


def page(filename, title, description, body, current=None, hero=False):
    current = current or filename
    doc = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} | MHHS SkillsUSA</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#071633">
<meta property="og:title" content="{title} | MHHS SkillsUSA">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:image" content="assets/img/gallery/slsc-delegation.svg">
<link rel="icon" href="assets/img/brand/wordmark.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{fonts}">
<link rel="stylesheet" href="{site_css}">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<header class="masthead">
  <div class="masthead__inner">
    <a class="brand" href="index.html">MHHS <b>SkillsUSA</b> <span>Chapter</span></a>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <ul class="nav" id="site-nav">{nav}</ul>
  </div>
</header>

<main id="main">
{body}
</main>

{foot}

<script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js" defer></script>
<script src="{data_js}"></script>
<script src="{site_js}"></script>
<script src="{motion_js}"></script>
{hero}</body>
</html>
""".format(title=title, desc=html.escape(description, quote=True),
           fonts=FONTS, nav=nav_html(current), body=theme(body), foot=foot_html(),
           site_css=stamp("assets/css/site.css"), data_js=stamp("assets/js/data.js"),
           site_js=stamp("assets/js/site.js"), motion_js=stamp("assets/js/motion.js"),
           hero=HERO_TAG.format(hero_js=stamp("assets/js/hero.js")) if hero else "")
    with open(os.path.join(OUT, filename), "w") as fh:
        fh.write(doc)
    print("wrote", filename)


def pagehead(eyebrow, h1, lede, art=None):
    media = ""
    if art:
        media = ('<div class="pagehead__media"><img src="assets/img/gallery/%s.svg" '
                 'alt="" aria-hidden="true"></div>' % art)
    return """
<section class="pagehead">
  {media}
  <div class="pagehead__deco"></div>
  <div class="shell">
    <p class="eyebrow" data-reveal>{eyebrow}</p>
    <h1 data-reveal style="--delay:80ms">{h1}</h1>
    <p class="lede" data-reveal style="--delay:170ms">{lede}</p>
  </div>
</section>""".format(eyebrow=eyebrow, h1=h1, lede=lede, media=media)


def wordmark(top="MHHS", bottom="SkillsUSA", left="", mid="", right=""):
    return """
<section class="wordmark">
  <span class="wordmark__type" aria-hidden="true">{top} <em>{bottom}</em></span>
  <div class="wordmark__sub">
    <span>{left}</span><span>{mid}</span><span>{right}</span>
  </div>
</section>""".format(top=top, bottom=bottom, left=left, mid=mid, right=right)


MARQUEE = """
<section class="marquee" aria-hidden="true">
  <div class="marquee__track">
    <div class="marquee__item">
      <span>Personal</span><i></i><span>Workplace</span><i></i><span>Technical</span><i></i>
      <span>Champions at Work</span><i></i><span>Compete</span><i></i>
      <span>Mountain House SkillsUSA</span><i></i><span>Since 1965</span><i></i>
    </div>
  </div>
</section>"""


# ==========================================================================
# HOME
# ==========================================================================
HOME = """
<div class="hero-track" data-hero-track>
<section class="hero" data-hero>
  <img class="hero__still" src="assets/img/hero/delegation-2048.jpg"
       alt="" fetchpriority="high" decoding="async">
  <canvas class="hero__canvas" aria-hidden="true"></canvas>
  <span class="hero__scrim"></span>

  <div class="hero__inner">
    <div class="shell">
      <h1 class="hero__wordmark" data-reveal>
        <span class="hero__word">MHHS</span>
        <span class="hero__word hero__word--b">SkillsUSA</span>
      </h1>
      <div class="btn-row" data-reveal style="--delay:180ms">
        <a class="btn" href="join.html">How to join</a>
        <a class="btn btn--ghost" href="competition.html">Competition hub</a>
      </div>
    </div>
  </div>
</section>
</div>

<div class="story-track" data-story-track>
  <section class="story">
    <div class="story__stage" data-render-story></div>
  </section>
</div>

{marquee}

<section class="band band--navy band--tight">
  <div class="shell shell--wide">
    <figure class="officers-cta" data-officers-cta>
      <img class="officers-cta__bg" src="assets/img/gallery/chapter-officer-team.jpg"
           alt="The {year} MHHS SkillsUSA officer team." loading="lazy" decoding="async">
      <span class="officers-cta__scrim"></span>

      <figcaption class="officers-cta__type">
        <!-- Hollow white, no fill. The cursor-painted gradient copy lived here
             as a second stacked span with class officers-cta__line--fill; its
             CSS and the officersCta() handler in site.js are both still in
             place, so restoring it is one line of markup. -->
        <span class="officers-cta__line officers-cta__line--out"><span class="oc-a">Our</span> <span class="oc-b">Officers</span></span>
      </figcaption>
    </figure>
  </div>
</section>

<section class="countdown">
  <div class="shell countdown__inner" data-render-countdown></div>
</section>

<section class="collage">
  <div class="collage__grid" data-render-collage></div>
</section>

<section class="band band--navy">
  <div class="shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">The chapter at a glance</p>
        <h2>Competing out of Mountain House since <span class="it">2014</span>.</h2>
      </div>
      <div data-reveal style="--delay:120ms">
        <dl class="facts" style="margin:0">
          <div><dt>Founded</dt><dd>2014. More than a decade of competitors out of Mountain
            House.</dd></div>
          <div><dt>Officer team</dt><dd>Ten seats: President, two Vice Presidents,
            Secretary, Treasurer, three Directors of Events, a Competition Manager and
            Social Media, plus chapter advisors.</dd></div>
          <div><dt>Advancing each year</dt><dd>Around 40 teams to the state conference, and
            around 13 on to nationals.</dd></div>
          <div><dt>The Framework</dt><dd>Three components and 17 Essential Elements, which every
            part of the programme is built on.</dd></div>
          <div><dt>Contests</dt><dd>113 at the national conference; around 120 competitive events
            at the California state conference.</dd></div>
          <div><dt>Levels of competition</dt><dd>The regional conference, then the California
            State Leadership and Skills Conference, then the National Leadership and Skills
            Conference.</dd></div>
          <div><dt>Recognition</dt><dd>The Chapter Excellence Program, American Spirit, Career
            Essentials and the Statesman Award.</dd></div>
        </dl>
      </div>
    </div>
  </div>
</section>

<section class="band band--navy-2">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">What this chapter is trying to get right</p>
      <h2>Three commitments for this year.</h2>
    </div>
    <ul class="planks" data-stagger="90">
      <li>
        <div>
          <h3>Keep the season legible</h3>
          <p>Nobody should have to guess how any of this works. The competition ladder, the
             deadlines and the paperwork are written down on this site rather than passed
             along by rumour, and the dates that matter are on one page.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>Open the programme past the trade contests</h3>
          <p>No contest here is gated behind a class or a pathway, the trade contests
             included. Any member can enter whichever contest they want, and every member
             should know that before the selection form is due.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>Make the conferences affordable</h3>
          <p>Travel to the state conference in Ontario runs about $300 a competitor, and
             fundraising exists to bring that number down. Qualifying should be a question of
             preparation, not of what a family can spend.</p>
        </div>
      </li>
    </ul>
  </div>
</section>

<section class="band band--navy band--tight">
  <div class="shell center">
    <div class="btn-row" style="justify-content:center;margin-top:0">
      <a class="btn btn--ghost" href="gallery.html">See the full gallery</a>
    </div>
  </div>
</section>

<section class="band band--ink">
  <div class="shell shell--narrow">
    <p class="quote" data-reveal>To base my expectations of reward upon the solid foundation
       of service.</p>
    <span class="quote-src" data-reveal style="--delay:180ms">From the SkillsUSA Pledge</span>
  </div>
</section>

<section class="band band--paper" id="faq">
  <div class="shell shell--wide">
    <div class="head" data-reveal>
      <p class="eyebrow">Questions</p>
      <h2>The things members ask most.</h2>
      <p class="lede">Answers about SkillsUSA itself are accurate. Answers about how this
         chapter runs are marked TBD until the officer team decides them, which is
         more useful than a confident guess.</p>
    </div>
    <div data-render-faqs data-stagger="40"></div>
    <div class="btn-row">
      <span data-form="questions" data-label="Questions &amp; support form"></span>
      <a class="btn btn--ghost" href="officers.html">Who to contact</a>
    </div>
  </div>
</section>

<section class="band band--navy">
  <div class="shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">Stay informed</p>
        <h2>This website is one of <span class="it">four</span> places to look.</h2>
        <p>Canvas, chapter announcements, your school email and what gets said at meetings all
           carry information that never fits on a webpage. Check them regularly, and email
           especially, since that is where deadlines arrive first.</p>
        <div class="socials mt-2" data-render-socials></div>
      </div>
      <div data-reveal style="--delay:120ms">
        <div class="grid grid--2" data-stagger="70">
          <a class="card" href="banquet.html">
            <p class="card__n">Season</p>
            <h3>The Skills Banquet</h3>
            <p>Recognition, the officer handover, and the members who carried the year.</p>
          </a>
          <a class="card" href="competition.html">
            <p class="card__n">Hub</p>
            <h3>Competition resources</h3>
            <p>The contest categories, the ladder from chapter to nationals, and the roadmap
               for getting ready.</p>
          </a>
          <a class="card" href="officers.html">
            <p class="card__n">People</p>
            <h3>Officers &amp; advisors</h3>
            <p>Who to email, and what each of the ten officer seats is actually
               responsible for.</p>
          </a>
          <a class="card" href="calendar.html">
            <p class="card__n">Dates</p>
            <h3>Calendar &amp; deadlines</h3>
            <p>Every date in the season, with the fixed ones marked apart from the
               provisional ones.</p>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
""".format(marquee=MARQUEE, chev=CHEV, year=YEAR)


# ==========================================================================
# JOIN
# ==========================================================================
JOIN = pagehead(
    "Membership " + CHEV + " " + YEAR,
    "How to join MHHS SkillsUSA.",
    "Three steps and one deadline that matters more than the others. National "
    "membership is what makes a member eligible to compete, and it cannot be "
    "backdated.",
    art="chapter-first-meeting") + """
<section class="band band--paper">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">Step by step</p>
      <h2>What joining actually involves.</h2>
    </div>
    <ol class="steps" data-stagger="90">
      <li>
        <div>
          <h3>Decide that you want in</h3>
          <p>That is the whole requirement. Membership is open to any Mountain House student,
             and you do not need to be enrolled in a particular class or pathway to join.</p>
          <p>The same goes for competing. Every contest is open to every member, the trade
             contests included, so nothing on your schedule decides what you are allowed to
             enter.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>Complete the school-wide CTSO form</h3>
          <p>Mountain House runs one form covering every career and technical student
             organization at the school. It arrives in your school email at the start of the
             year. Select <strong>SkillsUSA</strong> when it asks which organization you are
             joining.</p>
          <div class="btn-row"><span data-form="ctso" data-label="School-wide CTSO form"></span></div>
        </div>
      </li>
      <li>
        <div>
          <h3>Submit the chapter membership form and pay dues</h3>
          <p>SkillsUSA dues have a national component and a state component, and chapters
             usually add a small local amount on top. The chapter publishes the exact figure
             before the deadline each year.</p>
          <p>The important part is timing. Your membership has to be <em>submitted nationally</em>
             by the chapter before the deadline, which means the chapter needs your form and
             your payment before that. Once the window closes, late memberships generally
             cannot be accepted, and a member who is not registered nationally is not eligible
             to compete.</p>
          <div class="btn-row"><span data-form="membership" data-label="MHHS SkillsUSA membership form"></span></div>
        </div>
      </li>
    </ol>
  </div>
</section>

<section class="band band--navy">
  <div class="shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">Common worries</p>
        <h2>Things people ask before they sign up.</h2>
      </div>
      <div data-reveal style="--delay:120ms">
        <dl class="facts" style="margin:0">
          <div><dt>Can I do this alongside a sport?</dt><dd>Yes. The season has a small number of
            fixed dates (the membership deadline, region, and four days in Ontario in
            April) and a lot of flexibility in between.</dd></div>
          <div><dt>Do I have to compete?</dt><dd>No. Members who do not compete take part in
            meetings, service projects, fundraising and the Program of Work. Competition is one
            part of the programme, not the whole of it.</dd></div>
          <div><dt>What if I am not in a trade class?</dt><dd>It makes no difference. Every
            contest is open to every member, so you can enter a Skilled and Technical contest
            just as readily as Job Interview, Prepared Speech or Quiz Bowl.</dd></div>
          <div><dt>What does it cost?</dt><dd>Dues, plus conference costs if you advance.
            Travel to the State Leadership and Skills Conference runs about $300 a competitor,
            which is the expensive part and the reason the chapter fundraises.</dd></div>
          <div><dt>What if I join late?</dt><dd>Talk to the advisor. Joining after the national
            deadline usually means a full year of chapter membership without competition
            eligibility. Still worth doing, but know that going in.</dd></div>
        </dl>
      </div>
    </div>
  </div>
</section>

<section class="band band--paper band--paper-2">
  <div class="shell shell--narrow center">
    <p class="eyebrow" data-reveal>Still unsure?</p>
    <h2 data-reveal>Ask before the deadline, not after it.</h2>
    <p class="lede" data-reveal>Every question on this page came from somebody who asked. The
       officer team would much rather answer one more.</p>
    <div class="btn-row" style="justify-content:center">
      <span data-form="questions" data-label="Questions &amp; support form"></span>
      <a class="btn btn--ghost" href="index.html#faq">Read the FAQ</a>
    </div>
  </div>
</section>
"""


# ==========================================================================
# OFFICERS
# ==========================================================================
OFFICERS = pagehead(
    "Our chapter " + CHEV + " " + YEAR,
    "Officers &amp; advisors.",
    "The ten officers elected for the 2026-2027 season, and the advisors "
    "who hold the chapter charter.",
    art="chapter-officer-team") + """
<section class="band band--navy band--tight">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">Chapter advisors</p>
      <h2>The people who hold the charter.</h2>
      <p class="lede">Advisors approve competition entries, sign off service hours, and travel
         with the delegation. Nothing in the programme happens without them.</p>
    </div>
    <div class="grid grid--2" data-render="advisors" data-reveal></div>
  </div>
</section>

<section class="band band--navy">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">The officer team</p>
      <h2>Ten seats.</h2>
      <p class="lede">Five executive seats, three Directors of Events who share the events
         calendar between them, a Competition Manager who owns the season end to end, and
         Social Media.</p>
    </div>
    <div class="roster" data-render-roster data-reveal></div>
  </div>
</section>
"""


# ==========================================================================
# COMMITTEE REPRESENTATIVES
# ==========================================================================
COMMITTEEREPS = pagehead(
    "Our chapter " + CHEV + " Representatives",
    "Committee representatives.",
    "A member from each grade on each committee, so that no year group finds "
    "out about a deadline the day it passes.",
    art="chapter-framework-workshop") + """
<section class="band band--paper band--tight">
  <div class="shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">The role</p>
        <h2>What a representative actually does.</h2>
      </div>
      <div class="stack" data-reveal style="--delay:120ms">
        <p>Officers cannot be in every classroom. Committee representatives can. They carry
           chapter information back to their own grade, answer the questions people are too
           embarrassed to ask an officer, and bring back the feedback that never reaches a
           meeting.</p>
        <p>It is a real job with a real workload, and it is the most common route onto the
           officer team. It is also the best way into the chapter for a member who does not
           want to compete.</p>
      </div>
    </div>
  </div>
</section>

<section class="band band--navy">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">Applying</p>
      <h2>How selection works.</h2>
      <p class="lede">Applications are announced through Canvas, email and this page. The exact
         process is set by the officer team: typically an interest meeting, a written
         application, and an interview for shortlisted applicants.</p>
    </div>
    <div class="btn-row">
      <span data-form="classRep" data-label="Committee representative application"></span>
      <a class="btn btn--ghost" href="officers.html">Meet the officer team</a>
    </div>
  </div>
</section>

<section class="band band--navy-2">
  <div class="shell shell--wide">
    <div class="head" data-reveal>
      <p class="eyebrow">Three committees, nine seats</p>
      <h2>Where the work is divided.</h2>
    </div>
    <div data-render-committees></div>
  </div>
</section>
"""


# ==========================================================================
# SPOTLIGHT
# ==========================================================================
SPOTLIGHT = pagehead(
    "Our chapter " + CHEV + " Recognition",
    "Member spotlight.",
    "Members recognized by the officer team for work that never shows up on "
    "an awards list.",
    art="chapter-service-day") + """
<section class="band band--paper band--tight">
  <div class="shell shell--narrow">
    <p class="lede" data-reveal>Medals record one afternoon. Most of what holds a chapter
       together is the member who set up the room, coached a nervous first-year through their
       contest, or kept turning up to a service project nobody was watching.</p>
    <p data-reveal>The spotlight is how the officer team says so out loud. Anyone can nominate
       anyone, including themselves.</p>
    <div class="btn-row">
      <span data-form="spotlight" data-label="Nominate a member"></span>
    </div>
  </div>
</section>

<section class="band band--navy">
  <div class="shell shell--wide">
    <div data-render-spotlights></div>
  </div>
</section>
"""


# ==========================================================================
# COMPETITION HUB
# ==========================================================================
COMPETITION = pagehead(
    "Competition " + CHEV + " " + YEAR,
    "The competition hub.",
    "How the SkillsUSA Championships work, what the ladder from this school to "
    "Atlanta looks like, and every resource the chapter has for getting ready.",
    art="slsc-contest-floor") + """
<section class="band band--navy band--tight">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">The ladder</p>
      <h2>Three conferences, and each one narrows.</h2>
      <p class="lede">The SkillsUSA Championships are the largest skills competition in the
         country. The route runs from the region to the state conference to the
         national one, and only the first is close to home.</p>
    </div>
    <ol class="steps" data-stagger="80">
      <li>
        <div>
          <h3>Region: the RLSC</h3>
          <p>The Regional Leadership and Skills Conference, and the qualifying round for
             state. Region assignment comes from SkillsUSA California.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>State: the SLSC</h3>
          <p>The California State Leadership and Skills Conference, held each spring in Ontario:
             opening and closing ceremonies at Toyota Arena, contests at the Ontario Convention
             Center. Around 120 competitive events. The 2027 conference runs 8&ndash;11 April and
             is the 60th.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>National: the NLSC</h3>
          <p>State gold medallists earn eligibility for the National Leadership and Skills
             Conference at the Georgia World Congress Center in Atlanta. 113 contests,
             more than 7,000 state champions. The 2027 championships run 21&ndash;25 June. The
             conference is scheduled to stay in Atlanta through 2033.</p>
        </div>
      </li>
    </ol>
  </div>
</section>

<section class="band band--navy-2">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">Where to go next</p>
      <h2>Everything the chapter has, in one place.</h2>
    </div>
    <div class="grid grid--2" data-stagger="70">
      <a class="card" href="competitions.html">
        <p class="card__n">01</p>
        <h3>All contests</h3>
        <p>The three categories, and the contests that sit in each. Start here if you have not
           chosen an event.</p>
      </a>
      <a class="card" href="recognition.html">
        <p class="card__n">02</p>
        <h3>Recognition programmes</h3>
        <p>The Chapter Excellence Program, American Spirit, Career Essentials and the Statesman
           Award: recognition that runs alongside competition.</p>
      </a>
      <a class="card" href="service-hours.html">
        <p class="card__n">03</p>
        <h3>Service hours</h3>
        <p>How hours are logged and what they feed into, plus a private tracker that stays in
           your own browser.</p>
      </a>
      <a class="card" href="checkpoints.html">
        <p class="card__n">04</p>
        <h3>The contest roadmap</h3>
        <p>How preparation is spread across a season instead of collapsed into the week before
           region.</p>
      </a>
      <a class="card" href="https://www.skillsusa.org/who-we-are/skillsusa-framework/" target="_blank" rel="noopener">
        <p class="card__n">05</p>
        <h3>The Framework</h3>
        <p>Every contest is scored against it, so it is worth reading before you pick one.
           Three components and 17 Essential Elements, at skillsusa.org.</p>
      </a>
      <a class="card" href="calendar.html">
        <p class="card__n">06</p>
        <h3>Calendar &amp; deadlines</h3>
        <p>Every date in the season, with the fixed ones marked apart from the provisional
           ones.</p>
      </a>
    </div>
  </div>
</section>

<section class="band band--paper">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">Before the selection form</p>
      <h2>Read the contest guidelines. Actually read them.</h2>
      <p class="lede">Contest guidelines specify what you must bring, what you may not bring,
         how you will be scored and what will disqualify you. Competitors lose points every
         year on requirements they never opened.</p>
    </div>
    <div class="btn-row">
      <a class="btn" href="https://www.skillsusa.org/competitions/skillsusa-championships/" target="_blank" rel="noopener">Official SkillsUSA Championships</a>
      <a class="btn btn--ghost" href="https://www.skillsusaca.org/" target="_blank" rel="noopener">SkillsUSA California</a>
    </div>
  </div>
</section>
"""


# ==========================================================================
# ALL CONTESTS
# ==========================================================================
COMPETITIONS = pagehead(
    "Competition " + CHEV + " Contests",
    "All contests.",
    "SkillsUSA sorts the Championships into three categories. Two of them are "
    "open to any member; the third depends on what you are enrolled in.",
    art="slsc-job-interview") + """
<section class="band band--paper band--tight">
  <div class="shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">How to choose</p>
        <h2>Pick for the skill, not the medal.</h2>
      </div>
      <div class="stack" data-reveal style="--delay:120ms">
        <p>A contest is a year of practice at one specific thing. Choose the thing you actually
           want to be better at in June, and the preparation stops feeling like a chore.</p>
        <p>One practical constraint: contests run concurrently at a conference, so you enter
           one. Beyond that, nothing is gated: no class, no pathway, no prerequisite.
           Pick whichever contest you want, trade contests included.</p>
        <p>Everything below is a real SkillsUSA contest. Which of them run in a given year
           comes down to the California contest list, so confirm with the advisor before you
           build a plan around one.</p>
      </div>
    </div>
  </div>
</section>

<section class="band band--navy">
  <div class="shell shell--wide">
    <div class="head" data-reveal>
      <p class="eyebrow">Every contest, every member</p>
      <h2>Three categories, all open.</h2>
      <p class="lede">Leadership contests test skills that belong to no single trade.
         Occupationally Related covers what every trade shares. Skilled and Technical are the
         trade contests themselves. Any member can enter any of them.</p>
    </div>
    <div data-render-events></div>
  </div>
</section>

<section class="band band--paper band--paper-2">
  <div class="shell shell--narrow center">
    <p class="eyebrow" data-reveal>Then</p>
    <h2 data-reveal>Submit the selection form.</h2>
    <p class="lede" data-reveal>One form covers your contest choice and any recognition
       programme you are pursuing. Changes after submission are difficult, because entries are
       registered with the state.</p>
    <div class="btn-row" style="justify-content:center">
      <span data-form="eventSelection" data-label="Competition selection form"></span>
      <a class="btn btn--ghost" href="checkpoints.html">How to prepare</a>
    </div>
  </div>
</section>
"""


# ==========================================================================
# RECOGNITION
# ==========================================================================
RECOGNITION = pagehead(
    "Competition " + CHEV + " Recognition",
    "Recognition programmes.",
    "Not everything worth earning is a contest. These run across the whole year "
    "and several of them need no competition at all.",
    art="slsc-medal-stage") + """
<section class="band band--navy band--tight">
  <div class="shell shell--narrow">
    <p class="lede" data-reveal>Recognition programmes reward sustained work rather than a
       single performance. They also tend to be the ones members overlook, which makes them
       the easiest place in the programme to earn something real.</p>
    <p data-reveal>Confirm current requirements against skillsusa.org before relying on any
       threshold printed here, since national programmes are revised from year to year.</p>
  </div>
</section>

<section class="band band--navy-2">
  <div class="shell shell--wide">
    <div class="head" data-reveal>
      <p class="eyebrow">Programmes</p>
      <h2>What is available, and to whom.</h2>
    </div>
    <div data-render-recognition></div>
  </div>
</section>

<section class="band band--ink">
  <div class="shell shell--narrow">
    <p class="quote" data-reveal>Start with the Statesman Award. It costs nothing but attention,
       and it is the fastest way to understand what you have actually joined.</p>
    <span class="quote-src" data-reveal style="--delay:180ms">Advice worth taking early</span>
  </div>
</section>
"""


# ==========================================================================
# SERVICE HOURS
# ==========================================================================
SERVICE = pagehead(
    "Competition " + CHEV + " Service",
    "Service hours.",
    "Hours are not required for membership. They matter the moment you pursue "
    "American Spirit, contribute to the chapter&rsquo;s Community Service entry, "
    "or help build its Chapter Excellence Program submission.",
    art="chapter-service-day") + """
<section class="band band--paper band--tight">
  <div class="shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">Why log them</p>
        <h2>Three things depend on the record.</h2>
      </div>
      <div class="stack" data-reveal style="--delay:120ms">
        <p><strong>American Spirit</strong> is a notebook documenting a member&rsquo;s community
           service, patriotism and work in career and technical education. It is also a
           Leadership contest, so the same work can be entered for competition.</p>
        <p><strong>Community Service</strong> is the chapter&rsquo;s single best project of the
           year, presented by notebook and to judges. Every member&rsquo;s hours feed it.</p>
        <p><strong>The Chapter Excellence Program</strong> is the chapter&rsquo;s annual
           self-assessment against the Framework. A year of undocumented work is a year that
           cannot be submitted.</p>
        <p>The pattern behind all three: the hours are worth nothing without the record. Log
           them as you go, because reconstructing a year in April does not work.</p>
      </div>
    </div>
  </div>
</section>

<section class="band band--navy">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">A private tracker</p>
      <h2>Keep your own running total.</h2>
      <p class="lede">This stays in your browser and is never submitted anywhere. Export the CSV
         and paste it into whatever the chapter uses officially. The milestones below are
         chapter-set targets, not national thresholds. SkillsUSA does not publish hour
         requirements for these programmes.</p>
    </div>

    <div id="tracker" class="tracker" data-reveal>
      <form id="tracker-form" class="tracker__form">
        <div class="field">
          <label for="t-date">Date of activity</label>
          <input type="date" id="t-date" required>
        </div>
        <div class="field">
          <label for="t-activity">Activity description</label>
          <input type="text" id="t-activity" placeholder="Rebuilt benches at the community garden" required>
        </div>
        <div class="field">
          <label for="t-why">Explanation</label>
          <input type="text" id="t-why" placeholder="Who it served and what changed" required>
        </div>
        <div class="field">
          <label for="t-code">Category</label>
          <select id="t-code" required></select>
        </div>
        <div class="field">
          <label for="t-hours">Hours</label>
          <input type="number" id="t-hours" min="0" step="0.5" placeholder="5" required>
        </div>
        <div class="field">
          <label for="t-proof">Link to proof</label>
          <input type="url" id="t-proof" placeholder="https://">
        </div>
        <div class="field">
          <label>&nbsp;</label>
          <button class="btn" type="submit">Add activity</button>
        </div>
      </form>

      <div class="levels" id="tracker-levels"></div>

      <div class="tbl-wrap">
        <table class="log">
          <caption class="visually-hidden">Your logged service activities</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Activity</th>
              <th scope="col">Explanation</th>
              <th scope="col">Category</th>
              <th scope="col">Hours</th>
              <th scope="col">Proof</th>
            </tr>
          </thead>
          <tbody id="tracker-rows"></tbody>
        </table>
      </div>

      <div class="btn-row" style="margin-top:0;align-items:center">
        <button class="btn" id="tracker-export" type="button">Export CSV</button>
        <button class="btn btn--ghost" id="tracker-clear" type="button">Clear log</button>
        <p class="evt__spec" style="border:0;padding:0;margin:0">
          <span>Total logged: <strong id="tracker-total">0.0</strong> hours</span>
        </p>
      </div>

      <div class="notice">
        <strong>This tracker is a personal notebook, not a submission.</strong> Hours are saved in
        this browser only. They are not sent to the officer team, and clearing your browser
        data will erase them. Whatever the chapter adopts as its official record still has to be
        filled in separately, and an advisor still has to approve the hours.
      </div>
    </div>
  </div>
</section>

<section class="band band--navy-2">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">What counts</p>
      <h2>Rules of thumb until the chapter sets its own.</h2>
    </div>
    <ul class="planks" data-stagger="90">
      <li>
        <div>
          <h3>Somebody has to be able to confirm it</h3>
          <p>An hour nobody can verify is an hour that cannot be documented. Record who
             supervised the work at the time, not months later.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>Record what you did, not just that you were there</h3>
          <p>&ldquo;Volunteered, 4 hours&rdquo; is worth very little in a notebook. What the
             project was, who it served and what changed is what a judge is reading for.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>Chapter projects and personal service both count</h3>
          <p>They document differently, though. Chapter projects feed the Community Service
             entry and the CEP; personal service is yours and belongs in American Spirit.</p>
        </div>
      </li>
    </ul>
  </div>
</section>
"""


# ==========================================================================
# CHECKPOINTS
# ==========================================================================
CHECKPOINTS = pagehead(
    "Competition " + CHEV + " Preparation",
    "The contest roadmap.",
    "Preparation spread across a season instead of collapsed into the week "
    "before region. This is the part that decides results.",
    art="chapter-contest-prep") + """
<section class="band band--paper band--tight">
  <div class="shell shell--narrow">
    <p class="lede" data-reveal>Almost every competitor who underperforms did the same thing:
       they knew their contest well and started three weeks out. The gap between placing and
       not placing is usually months of small, boring work.</p>
    <p data-reveal>The roadmap below is the order that work goes in. Start at the top the
       week you pick a contest, and the last month stops being the month everything
       happens in.</p>
  </div>
</section>

<section class="band band--navy">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">The roadmap</p>
      <h2>Seven milestones between choosing and competing.</h2>
    </div>
    <ol class="steps" data-stagger="70">
      <li><div><h3>Choose your contest</h3>
        <p>Read the guidelines before you commit, not after. Confirm the contest actually runs
           at the California conference this year.</p></div></li>
      <li><div><h3>Read the guidelines end to end</h3>
        <p>Every requirement, every prohibition, the full scoring rubric. Write down what you
           must bring and what will disqualify you.</p></div></li>
      <li><div><h3>Build the skill base</h3>
        <p>Whatever the underlying competence is (welding a joint, running a meeting,
           writing a plan), this is the long stretch, and it is mostly repetition.</p></div></li>
      <li><div><h3>First full attempt</h3>
        <p>Do the whole thing badly, early, under something like real conditions. This is where
           you find out what the guidelines actually meant.</p></div></li>
      <li><div><h3>Get it judged</h3>
        <p>Someone other than you scores it against the real rubric. An advisor, an officer, a
           teacher in the trade. Anyone who will be honest.</p></div></li>
      <li><div><h3>Fix the two worst things</h3>
        <p>Not everything. The two lowest-scoring parts, properly. Then get it judged again.</p></div></li>
      <li><div><h3>Rehearse the conditions</h3>
        <p>Time limits, attire, the materials you are allowed, the ones you are not. On the day
           itself nothing should be new except the room.</p></div></li>
    </ol>
  </div>
</section>
"""


# ==========================================================================
# CALENDAR
# ==========================================================================
CALENDAR = pagehead(
    "Chapter life " + CHEV + " Dates",
    "Calendar &amp; deadlines.",
    "Every date in the season. The two conference blocks are published and "
    "fixed; anything marked provisional is the chapter&rsquo;s own planning and "
    "will move.",
    art="slsc-opening-session") + """
<section class="band band--navy">
  <div class="shell shell--wide">
    <div class="head" data-reveal>
      <p class="eyebrow">The season</p>
      <h2>Everything, in order.</h2>
    </div>
    <!-- data-lenis-prevent: Lenis drives page scroll from its own document-level
         wheel listener, so preventDefault() inside this element never reached
         it and the page scrolled underneath the timeline. This is how Lenis is
         told to keep its hands off a scrollable region. -->
    <div class="season" data-render-season data-reveal data-lenis-prevent
         tabindex="0" role="region"
         aria-label="The season, as a horizontal timeline"></div>
    <p class="season__hint" data-reveal>Scroll sideways, or drag the track</p>
  </div>
</section>

"""


# ==========================================================================
# CHAPTER EVENTS
# ==========================================================================
CHAPTEREVENTS = pagehead(
    "Chapter life " + CHEV + " Events",
    "Events &amp; volunteering.",
    "Fundraisers, service projects and everything the chapter does that is not "
    "a contest, which is most of what a chapter actually is.",
    art="chapter-fundraiser") + """
<section class="band band--paper band--tight">
  <div class="shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">Fundraising</p>
        <h2>What the money is for.</h2>
      </div>
      <div class="stack" data-reveal style="--delay:120ms">
        <p>Conference travel. Four days in Ontario runs about $300 a competitor, which makes
           it the chapter&rsquo;s largest cost by a wide margin and the one thing standing
           between a prepared competitor and the conference they qualified for.</p>
        <p>Fundraising is aimed squarely at reducing that number. A member should qualify or not
           qualify on preparation, not on what a family can spend in April.</p>
      </div>
    </div>
    <div class="tbd mt-3" data-reveal>
      <p class="tbd__label">Coming soon</p>
      <h3>This year&rsquo;s fundraisers</h3>
      <p>Announced through Canvas and email as they are scheduled, and listed here.</p>
    </div>
  </div>
</section>

<section class="band band--navy">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">Volunteering</p>
      <h2>Service is part of the programme, not an extra.</h2>
      <p class="lede">Community Service and American Spirit are both built on it, and the Chapter
         Excellence Program submission is largely a record of it.</p>
    </div>
    <ul class="planks" data-stagger="90">
      <li>
        <div>
          <h3>Chapter projects</h3>
          <p>Run by the Community Service &amp; Fundraising committee, open to every member, and
             the material the chapter&rsquo;s Community Service entry is built from.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>Trade-based service</h3>
          <p>The kind SkillsUSA chapters are uniquely able to do: a repair, a build, an
             install for somebody who needs it. It is the most convincing thing a chapter can
             put in front of a judge, and the most useful thing it can do.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>School and district events</h3>
          <p>Open houses, orientation nights, career fairs. Unglamorous, and how the chapter
             keeps recruiting the next set of competitors.</p>
        </div>
      </li>
    </ul>
    <div class="btn-row">
      <a class="btn btn--ghost" href="service-hours.html">How to log the hours</a>
    </div>
  </div>
</section>
"""


# ==========================================================================
# MEETINGS
# ==========================================================================
MEETINGS = pagehead(
    "Chapter life " + CHEV + " Meetings",
    "Meetings &amp; recaps.",
    "When the chapter meets, what happens there, and the archive of everything "
    "that was said.",
    art="chapter-first-meeting") + """
<section class="band band--navy band--tight">
  <div class="shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">When and where</p>
        <h2>Meeting times.</h2>
      </div>
      <div class="stack" data-reveal style="--delay:120ms">
        <p>There is no fixed weekly slot. Meetings are called as the season needs them and
           announced on Canvas and by email, so watch your school email rather than
           looking for a standing time on a standing day.</p>
        <p><strong>Attendance is required.</strong> If you cannot make one, email a reasonable
           excuse at least 24 hours beforehand; if it is approved, missing that meeting is
           fine.</p>
      </div>
    </div>
  </div>
</section>

<section class="band band--navy-2">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">A meeting, roughly</p>
      <h2>What actually happens.</h2>
    </div>
    <ol class="steps" data-stagger="80">
      <li><div><h3>Opening ceremony</h3>
        <p>Officers open the meeting in form. It is also rehearsal for the Opening and Closing
           Ceremonies contest, which is why it is done properly.</p></div></li>
      <li><div><h3>Business</h3>
        <p>Minutes, treasurer&rsquo;s report, committee reports, and whatever the chapter has to
           decide. Run under parliamentary procedure, and the Parliamentarian keeps it
           honest.</p></div></li>
      <li><div><h3>Programme</h3>
        <p>The substance: contest preparation, a Framework session, a guest from the trade, or
           work on a Program of Work project.</p></div></li>
      <li><div><h3>Closing ceremony</h3>
        <p>Announcements, deadlines, and the close in form.</p></div></li>
    </ol>
  </div>
</section>

<section class="band band--paper">
  <div class="shell shell--wide">
    <div class="head" data-reveal>
      <p class="eyebrow">The archive</p>
      <h2>Slides and recaps, week by week.</h2>
      <p class="lede">Missing a meeting is survivable. Missing a meeting and never finding out
         what was in it is not.</p>
    </div>
    <div data-render-meetings data-stagger="60"></div>
  </div>
</section>
"""


# ==========================================================================
# TRADITIONS
# ==========================================================================
TRADITIONS = pagehead(
    "Chapter life " + CHEV + " Traditions",
    "Chapter traditions.",
    "Ten years of them, and the ones this officer team starts will outlast it. "
    "Whatever a chapter does twice, it does for a decade.",
    art="chapter-opening-ceremonies") + """
<section class="band band--paper band--tight">
  <div class="shell shell--narrow">
    <p class="lede" data-reveal>Everything below is a proposal. The first officer team decides
       what this chapter does every year from here, which is a rare and slightly alarming amount
       of influence.</p>
  </div>
</section>

<section class="band band--navy">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">Proposed</p>
      <h2>Three worth starting.</h2>
    </div>
    <ul class="planks" data-stagger="90">
      <li>
        <div>
          <h3>The pin</h3>
          <p>Chapters trade pins at conferences, and Pin Design is a contest in its own right.
             A chapter pin is a design competition, a fundraiser and a chapter tradition in one
             object, and the first one gets traded for a long time.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>The shirt contest</h3>
          <p>Members design the chapter shirt, the chapter votes, the winner is worn all year.
             T-shirt Design is also a Leadership contest, so a good entry does double duty.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>The archive</h3>
          <p>The Historian&rsquo;s job, and the one that is impossible to start late. Photographs,
             results, minutes, artefacts. In four years it becomes the thing new members are
             shown to explain what this chapter is.</p>
        </div>
      </li>
    </ul>
    <div class="btn-row">
      <a class="btn btn--ghost" href="gallery.html">The archive so far</a>
    </div>
  </div>
</section>

<section class="band band--ink">
  <div class="shell shell--narrow">
    <p class="quote" data-reveal>Whatever the first officer team does twice, the chapter will do
       for a decade.</p>
    <span class="quote-src" data-reveal style="--delay:180ms">Worth thinking about early</span>
  </div>
</section>
"""


# ==========================================================================
# GALLERY
# ==========================================================================
GALLERY = pagehead(
    "Chapter life " + CHEV + " Gallery",
    "Photo gallery.",
    "Photographs from the chapter's conferences and its year at Mountain House. "
    "Frames still marked as reserved are slots waiting on a picture.",
    art="slsc-awards-crowd") + """
<section class="band band--navy band--tight">
  <div class="shell shell--narrow">
    <p class="lede" data-reveal>These are generated plates, not photographs and not stock
       imagery. They hold the layout so the site works from day one.</p>
    <p data-reveal>As the year produces real photographs they replace these one at a time, and
       the caption changes from describing a slot to describing a picture. Nothing about the
       page needs rebuilding.</p>
  </div>
</section>

<section class="band band--navy">
  <div class="shell shell--wide">
    <div class="gal-filter" data-reveal>
      <button type="button" aria-pressed="true">All</button>
      <button type="button" data-album="rlsc" aria-pressed="false">RLSC</button>
      <button type="button" data-album="slsc" aria-pressed="false">SLSC</button>
      <button type="button" data-album="nlsc" aria-pressed="false">NLSC</button>
    </div>
    <div class="gal" data-render-gallery data-stagger="40"></div>
  </div>
</section>

<figure class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer">
  <button class="lightbox__close" type="button" aria-label="Close photo viewer">Close</button>
  <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous photo">&larr;</button>
  <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next photo">&rarr;</button>
  <img src="" alt="">
  <figcaption></figcaption>
</figure>
"""


# ==========================================================================
# FRAMEWORK
# ==========================================================================
FRAMEWORK = pagehead(
    "The Framework " + CHEV + " 17 Essential Elements",
    "The SkillsUSA Framework.",
    "Three components and seventeen Essential Elements, identified by more than "
    "a thousand industry partners. Every contest is scored against them, and "
    "every part of the programme is built on them.",
    art="chapter-framework-workshop") + """
<section class="band band--paper band--tight">
  <div class="shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">Why it exists</p>
        <h2>A common language for what you can actually do.</h2>
      </div>
      <div class="stack" data-reveal style="--delay:120ms">
        <p>The problem the Framework solves is a translation problem. A student finishes a
           welding programme knowing a great deal; an employer reads a transcript and learns
           almost none of it.</p>
        <p>The Framework names the skills explicitly (the personal ones, the workplace
           ones and the technical ones) so that what is learned in a classroom and a lab
           can be described in terms an employer recognises. SkillsUSA&rsquo;s phrase for the
           target is job-ready day one.</p>
        <p>It is also, practically, the scoring language of the competition. Read it before you
           choose a contest.</p>
      </div>
    </div>
  </div>
</section>

<section class="band band--navy">
  <div class="shell shell--wide">
    <div class="head" data-reveal>
      <p class="eyebrow">Component one</p>
      <h2>Personal Skills.</h2>
      <p class="lede">How you carry yourself, whether or not anyone is checking. Six elements.</p>
    </div>
    <dl class="facts" data-reveal>
      <div><dt>Integrity</dt><dd>Doing the right thing in a reliable way.</dd></div>
      <div><dt>Work Ethic</dt><dd>Being committed to punctuality, meeting deadlines, and
        following established policies and procedures to get work done.</dd></div>
      <div><dt>Professionalism</dt><dd>Behaving in alignment with workplace standards to display
        a positive image.</dd></div>
      <div><dt>Responsibility</dt><dd>Taking ownership of one&rsquo;s work performance, behaviour
        and actions.</dd></div>
      <div><dt>Adaptability/Flexibility</dt><dd>Embracing change and fostering creativity; being
        resilient.</dd></div>
      <div><dt>Self-Motivation</dt><dd>Exhibiting a passion for life and career.</dd></div>
    </dl>
  </div>
</section>

<section class="band band--navy-2">
  <div class="shell shell--wide">
    <div class="head" data-reveal>
      <p class="eyebrow">Component two</p>
      <h2>Workplace Skills.</h2>
      <p class="lede">How you work with other people to get something finished. Six elements.</p>
    </div>
    <dl class="facts" data-reveal>
      <div><dt>Communication</dt><dd>Conveying and receiving information clearly: in
        writing, in speech, and in listening.</dd></div>
      <div><dt>Decision Making</dt><dd>Choosing a course of action from the available options
        and standing behind it.</dd></div>
      <div><dt>Teamwork</dt><dd>Contributing to a shared goal rather than an individual
        one.</dd></div>
      <div><dt>Multicultural Sensitivity and Awareness</dt><dd>Working effectively with people
        whose backgrounds and perspectives differ from your own.</dd></div>
      <div><dt>Planning, Organizing and Management</dt><dd>Setting a course of work, sequencing
        it, and seeing it through.</dd></div>
      <div><dt>Leadership</dt><dd>Influencing and supporting others toward a result.</dd></div>
    </dl>
  </div>
</section>

<section class="band band--navy">
  <div class="shell shell--wide">
    <div class="head" data-reveal>
      <p class="eyebrow">Component three</p>
      <h2>Technical Skills Grounded in Academics.</h2>
      <p class="lede">The trade itself, and the mathematics, science and literacy
         underneath it. Five elements.</p>
    </div>
    <dl class="facts" data-reveal>
      <div><dt>Computer and Technology Literacy</dt><dd>Using the tools of a modern workplace
        competently.</dd></div>
      <div><dt>Job-Specific Skills</dt><dd>The technical skills of your own occupational area,
        to industry standard.</dd></div>
      <div><dt>Safety and Health</dt><dd>Working safely, and knowing why each rule
        exists.</dd></div>
      <div><dt>Service Orientation</dt><dd>Meeting the needs of a customer, client or
        patient.</dd></div>
      <div><dt>Professional Development</dt><dd>Continuing to build skill after the qualification
        is earned.</dd></div>
    </dl>
  </div>
</section>

<section class="band band--paper band--paper-2">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">The Pledge</p>
      <h2>Said at the opening of every meeting.</h2>
    </div>
    <blockquote class="quote" data-reveal style="max-width:52ch">Upon my honor, I pledge: To
       prepare myself by diligent study and ardent practice to become a worker whose services
       will be recognized as honorable by my employer and fellow workers. To base my
       expectations of reward upon the solid foundation of service. To honor and respect my
       vocation in such a way as to bring repute to myself. And further, to spare no effort in
       upholding the ideals of SkillsUSA.</blockquote>
    <div class="btn-row">
      <a class="btn btn--ghost" href="https://www.skillsusa.org/" target="_blank" rel="noopener">SkillsUSA National</a>
      <a class="btn btn--ghost" href="recognition.html">The Statesman Award</a>
    </div>
  </div>
</section>
"""


# ==========================================================================
# FAQ
# ==========================================================================
FAQ = pagehead(
    "Support " + CHEV + " Questions",
    "Frequently asked questions.",
    "Answers about SkillsUSA itself are accurate. Answers about how this "
    "chapter runs are marked TBD until the officer team decides them, "
    "which is more useful than a confident guess.",
    art="chapter-first-meeting") + """
<section class="band band--navy">
  <div class="shell shell--wide">
    <div data-render-faqs data-stagger="40"></div>
  </div>
</section>

<section class="band band--paper">
  <div class="shell shell--narrow center">
    <p class="eyebrow" data-reveal>Not answered here?</p>
    <h2 data-reveal>Ask the officer team.</h2>
    <p class="lede" data-reveal>Every question on this page is here because somebody asked it
       first.</p>
    <div class="btn-row" style="justify-content:center">
      <span data-form="questions" data-label="Questions &amp; support form"></span>
      <a class="btn btn--ghost" href="officers.html">Who to contact</a>
    </div>
  </div>
</section>
"""


# ==========================================================================
# SKILLS BANQUET
# ==========================================================================
BANQUET = pagehead(
    "Chapter life " + CHEV + " Banquet",
    "The Skills Banquet.",
    "The night the chapter closes out its season: medals, the officer "
    "handover, and the members who carried the year.",
    art="slsc-medal-stage") + """
<section class="band band--paper band--tight">
  <div class="shell shell--narrow">
    <p class="lede" data-reveal>A competition season produces a lot of results and
       almost no occasions. The banquet is the occasion, the one evening the whole
       chapter and its advisors are in a room together.</p>
  </div>
</section>

<section class="band band--navy">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">The evening</p>
      <h2>Where, when and why.</h2>
      <p class="lede">One evening to celebrate a season of MHHS SkillsUSA: the medals,
         the members who earned them, and the year that got everybody there.</p>
    </div>
    <dl class="facts" data-reveal>
      <div><dt>Date</dt><dd>Tuesday 4 May 2027.</dd></div>
      <div><dt>Time</dt><dd>After school. The exact start time is confirmed by the
        officer team closer to the date.</dd></div>
      <div><dt>Venue</dt><dd>The MPR at Mountain House High School,
        1090 S. Central Parkway, Mountain House, CA 95391.</dd></div>
    </dl>
    <div class="btn-row">
      <a class="btn btn--ghost" href="calendar.html">See it on the season calendar</a>
    </div>
  </div>
</section>

<section class="band band--navy-2">
  <div class="shell shell--narrow center">
    <p class="eyebrow" data-reveal>Anything else</p>
    <h2 data-reveal>Ask the officer team.</h2>
    <p class="lede" data-reveal>Ticket price and the running order are still being set.
       They are announced through Canvas and email, and they land here and on the
       calendar at the same time.</p>
    <div class="btn-row" style="justify-content:center">
      <span data-form="questions" data-label="Questions &amp; support form"></span>
    </div>
  </div>
</section>
"""


WORDMARK_CLOSE = wordmark(
    'MHHS', 'SkillsUSA',
    'Mountain House High School',
    'Preparing for leadership in the world of work',
    'Champions at Work &nbsp;' + CHEV + '&nbsp; ' + YEAR)

PAGES = [
    ("index.html", "Welcome",
     "SkillsUSA at Mountain House High School. Competitions, the SkillsUSA Framework, chapter service and leadership, and how to join the chapter.",
     HOME, True),
    ("join.html", "How to join",
     "How to join MHHS SkillsUSA: the school-wide CTSO form, the chapter membership form and dues. Open to every Mountain House student.",
     JOIN + WORDMARK_CLOSE),
    ("officers.html", "Officers & advisors",
     "The ten MHHS SkillsUSA officer seats and the chapter advisors for the 2026–2027 season.",
     OFFICERS + WORDMARK_CLOSE),
    ("committee-reps.html", "Committee representatives",
     "What a committee representative does, how to apply, and the three committees that nine representatives serve on.",
     COMMITTEEREPS + WORDMARK_CLOSE),
    ("competition.html", "Competition hub",
     "How the SkillsUSA Championships work, the ladder from chapter to nationals, and every competition resource the chapter has.",
     COMPETITION + WORDMARK_CLOSE),
    ("competitions.html", "All contests",
     "The three SkillsUSA contest categories (Leadership, Occupationally Related and Skilled and Technical) and the contests in each.",
     COMPETITIONS + WORDMARK_CLOSE),
    ("recognition.html", "Recognition programmes",
     "The Chapter Excellence Program, American Spirit, Community Service, Career Essentials and the SkillsUSA Statesman Award.",
     RECOGNITION + WORDMARK_CLOSE),
    ("service-hours.html", "Service hours",
     "How service hours are logged and documented for American Spirit, Community Service and the Chapter Excellence Program, with a private hour tracker.",
     SERVICE + WORDMARK_CLOSE),
    ("checkpoints.html", "Contest roadmap",
     "The seven-milestone contest roadmap: how MHHS SkillsUSA competitors prepare across a season instead of the week before region.",
     CHECKPOINTS + WORDMARK_CLOSE),
    ("calendar.html", "Calendar & deadlines",
     "The MHHS SkillsUSA season on one horizontal track: chapter meetings, the club fair, RLSC, the California SLSC, the banquet and the national conference.",
     CALENDAR + WORDMARK_CLOSE),
    ("chapter-events.html", "Events & volunteering",
     "Chapter fundraisers and volunteer opportunities, and how service connects to SkillsUSA recognition programmes.",
     CHAPTEREVENTS + WORDMARK_CLOSE),
    ("meetings.html", "Meetings & recaps",
     "When and where MHHS SkillsUSA meets, what happens at a meeting, and the archive of slides and recaps.",
     MEETINGS + WORDMARK_CLOSE),
    ("banquet.html", "Skills Banquet",
     "The MHHS SkillsUSA end-of-season banquet: recognition, the officer handover, and the members who carried the year.",
     BANQUET + WORDMARK_CLOSE),
    ("gallery.html", "Photo gallery",
     "Photographs from MHHS SkillsUSA: conferences, meetings, service projects and the shop floor.",
     GALLERY + WORDMARK_CLOSE),
    ("traditions.html", "Traditions",
     "The chapter pin, the shirt design contest and the chapter archive: the traditions a first-year chapter gets to choose.",
     TRADITIONS + WORDMARK_CLOSE),
    ("spotlight.html", "Member spotlight",
     "Members recognized by the officer team for work that does not show up on an awards list.",
     SPOTLIGHT + WORDMARK_CLOSE),
]

if __name__ == "__main__":
    for row in PAGES:
        fn, title, desc, body = row[0], row[1], row[2], row[3]
        hero = row[4] if len(row) > 4 else False
        page(fn, title, desc, body, hero=hero)
    print("\n%d pages written to %s" % (len(PAGES), OUT))
