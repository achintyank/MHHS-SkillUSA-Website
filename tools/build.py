#!/usr/bin/env python3
"""Generate the MHHS SkillsUSA static site.

Every page shares the same masthead and footer, so they are assembled here
once. The output is plain HTML — edit the generated files directly, or edit
this script and re-run it.

    python3 tools/build.py

Running this OVERWRITES every .html file in the project root. If you have
hand-edited a page, your edits are lost. For small text changes, edit the
HTML directly and leave this script alone; for anything structural — a new
page, a nav change, a new section — edit here and regenerate.

Content that changes during the year (officers, contests, dates, FAQ) does
NOT live here. It lives in assets/js/data.js.
"""
import os, html, re

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

CHEV = "&#10095;"          # ❯ — the chapter's separator mark
YEAR = "2026&ndash;2027"

NOSCRIPT = """<noscript><style>
  body.is-gated{overflow:auto}
  body.is-gated .after-intro{opacity:1}
  .intro{display:none}
  [data-reveal]{opacity:1;transform:none}
  [data-lines] .line>span{transform:none}
</style></noscript>
"""

INTRO_TAGS = ("<script>setTimeout(function(){if(!window.__introReady){"
              "document.body.classList.remove('is-gated');"
              "var m=document.querySelector('.masthead');"
              "if(m)m.classList.remove('is-gated');}},6000);</script>\n"
              '<script src="assets/js/intro.js"></script>\n')

FONTS = ("https://fonts.googleapis.com/css2?"
         "family=Newsreader:ital,opsz,wght@0,6..72,200..700;1,6..72,200..700"
         "&family=IBM+Plex+Mono:wght@400;500"
         "&family=IBM+Plex+Sans:wght@400;500;600&display=swap")

NAV = [
    ("Home", "index.html", None),
    ("Join", "join.html", None),
    ("Our Chapter", None, [
        ("Officers &amp; Advisors", "officers.html"),
        ("Committee Representatives", "committee-reps.html"),
        ("Member Spotlight", "spotlight.html"),
    ]),
    ("Competition", None, [
        ("Hub overview", "competition.html"),
        ("All Contests", "competitions.html"),
        ("Recognition Programmes", "recognition.html"),
        ("Service Hours", "service-hours.html"),
        ("Checkpoints &amp; Roadmaps", "checkpoints.html"),
    ]),
    ("Chapter Life", None, [
        ("Calendar &amp; Deadlines", "calendar.html"),
        ("Events &amp; Volunteering", "chapter-events.html"),
        ("Meetings &amp; Recaps", "meetings.html"),
        ("Chapter Traditions", "traditions.html"),
        ("Photo Gallery", "gallery.html"),
    ]),
    ("Framework", "framework.html", None),
    ("FAQ", "faq.html", None),
]

FOOT_COLS = [
    ("The chapter", [("About MHHS SkillsUSA", "index.html"), ("How to join", "join.html"),
                     ("Officers &amp; advisors", "officers.html"),
                     ("Committee representatives", "committee-reps.html"),
                     ("Member spotlight", "spotlight.html")]),
    ("Competing", [("Competition hub", "competition.html"),
                   ("All contests", "competitions.html"),
                   ("Recognition programmes", "recognition.html"),
                   ("Service hours", "service-hours.html"),
                   ("Checkpoints &amp; roadmaps", "checkpoints.html")]),
    ("Chapter life", [("Calendar", "calendar.html"),
                      ("Events &amp; volunteering", "chapter-events.html"),
                      ("Meetings &amp; recaps", "meetings.html"),
                      ("Traditions", "traditions.html"),
                      ("Gallery", "gallery.html"), ("FAQ", "faq.html")]),
    ("Official SkillsUSA", [("The Framework", "framework.html"),
                            ("SkillsUSA California", "https://www.skillsusaca.org/"),
                            ("SkillsUSA National", "https://www.skillsusa.org/")]),
]


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


def page(filename, title, description, body, current=None, gated=False):
    current = current or filename
    doc = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} &mdash; MHHS SkillsUSA</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#071633">
<meta property="og:title" content="{title} — MHHS SkillsUSA">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:image" content="assets/img/gallery/slsc-delegation.svg">
<link rel="icon" href="assets/img/brand/wordmark.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{fonts}">
<link rel="stylesheet" href="assets/css/site.css">
{noscript}</head>
<body{bodyclass}>
<a class="skip" href="#main">Skip to content</a>

<header class="masthead{mastclass}">
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
<script src="assets/js/data.js"></script>
<script src="assets/js/site.js"></script>
<script src="assets/js/motion.js"></script>
{intro}</body>
</html>
""".format(title=title, desc=html.escape(description, quote=True),
           fonts=FONTS, nav=nav_html(current), body=theme(body), foot=foot_html(),
           bodyclass=' class="is-gated"' if gated else "",
           mastclass=" is-gated" if gated else "",
           noscript=NOSCRIPT if gated else "",
           intro=INTRO_TAGS if gated else "")
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
<section class="intro" id="intro">
  <div class="intro__bg">
    <img src="assets/img/gallery/slsc-delegation.svg" alt="" aria-hidden="true">
  </div>

  <div class="intro__stage">
    <div class="intro__frame">
      <div class="mont">
        <div class="mont__layer">
          <img src="assets/img/gallery/slsc-contest-floor.svg" alt="">
        </div>
        <div class="mont__layer kb-b">
          <img src="assets/img/gallery/chapter-shop-floor.svg" alt="">
        </div>
        <div class="mont__layer">
          <img src="assets/img/gallery/slsc-medal-stage.svg" alt="">
        </div>
        <div class="mont__layer kb-b">
          <img src="assets/img/gallery/chapter-opening-ceremonies.svg" alt="">
        </div>
        <div class="mont__layer">
          <img src="assets/img/gallery/slsc-awards-crowd.svg" alt="">
        </div>
        <div class="mont__layer kb-b">
          <img src="assets/img/gallery/nlsc-atlanta.svg" alt="">
        </div>
      </div>
      <span class="intro__scrim"></span>
    </div>

    <div class="intro__type">
      <h1 class="intro__word intro__word--a">MHHS</h1>
      <h1 class="intro__word intro__word--b">SkillsUSA</h1>
    </div>
  </div>

  <div class="intro__meta">
    <span>Mountain House High School &nbsp;{chev}&nbsp; Champions at Work</span>
    <span class="intro__hint">Scroll to enter <i></i></span>
    <span>{year}</span>
  </div>

  <button class="intro__skip" type="button">Skip intro</button>
</section>

<div class="after-intro">

<section class="band band--navy">
  <div class="shell">
    <p class="eyebrow" data-reveal>SkillsUSA at Mountain House High School</p>
    <h2 data-lines class="mb-0" style="font-size:clamp(1.9rem,4.6vw,3.8rem);max-width:23ch">
      Somebody has to know how to build it, wire it, fix it and run it.
    </h2>
    <div class="split split--top mt-3">
      <div></div>
      <div class="stack" data-reveal style="--delay:120ms">
        <p class="lede" style="max-width:46ch">Mountain House High School&rsquo;s chapter of the
          national organization for students heading into trade, technical and skilled
          service occupations.</p>
        <p>SkillsUSA has been doing this since 1965, when it was founded as the Vocational
           Industrial Clubs of America. Our chapter is one part of that: we compete in the
           SkillsUSA Championships, we run the projects in our Program of Work, and we spend
           a lot of the year turning a skill somebody is learning in a classroom into something
           an employer would recognise.</p>
        <div class="btn-row">
          <a class="btn" href="join.html">How to join</a>
          <a class="btn btn--ghost" href="competition.html">Competition hub</a>
        </div>
      </div>
    </div>
  </div>
</section>

{marquee}

<section class="band band--navy band--tight">
  <div class="shell shell--wide">
    <div class="head" data-reveal style="margin-bottom:2.5rem">
      <p class="eyebrow">Competition &nbsp;{chev}&nbsp; three categories, 113 national contests</p>
      <h2>Every contest sits in one of <span class="it">three</span> categories.</h2>
    </div>
    <div class="cine" data-render-cine></div>
    <div class="btn-row">
      <a class="btn btn--ghost" href="competitions.html">Browse the contests</a>
    </div>
  </div>
</section>

<section class="collage">
  <div class="collage__grid" data-render-collage></div>
</section>

<section class="band band--navy">
  <div class="shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">The chapter at a glance</p>
        <h2>A new chapter, in its <span class="it">first</span> season.</h2>
      </div>
      <div data-reveal style="--delay:120ms">
        <dl class="facts" style="margin:0">
          <div><dt>Officer team</dt><dd>Seven roles &mdash; President, Vice President, Secretary,
            Treasurer, Reporter, Historian and Parliamentarian &mdash; plus chapter advisors.</dd></div>
          <div><dt>The Framework</dt><dd>Three components and 17 Essential Elements, which every
            part of the programme is built on.</dd></div>
          <div><dt>Contests</dt><dd>113 at the national conference; around 120 competitive events
            at the California state conference.</dd></div>
          <div><dt>Levels of competition</dt><dd>Chapter, then region, then the California State
            Leadership and Skills Conference, then the National Leadership and Skills
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
      <h2>Three commitments for the first year.</h2>
    </div>
    <ul class="planks" data-stagger="90">
      <li>
        <div>
          <h3>Make the first season legible</h3>
          <p>Nobody should have to guess how any of this works. The competition ladder, the
             deadlines and the paperwork are written down on this site rather than passed
             along by rumour, and the dates that matter are on one page.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>Open the programme past the trade contests</h3>
          <p>The Skilled and Technical contests need pathway eligibility, but the Leadership and
             Occupationally Related contests do not. Any member can compete in something, and
             every member should know that before the selection form is due.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>Make the conferences affordable</h3>
          <p>Fundraising exists to bring down the cost of getting a delegation to Ontario in April.
             Qualifying should be a question of preparation, not of what a family can spend.</p>
        </div>
      </li>
    </ul>
  </div>
</section>

<section class="surfer">
  <div class="surfer__rail">
    <div class="surfer__viewport">
      <div class="surfer__title">
        <h2>The year<br>in frames<sup>(16)</sup></h2>
      </div>
      <div class="surfer__scene">
        <div class="surfer__track" data-render-surfer></div>
      </div>
      <div class="surfer__hint">Scroll to travel &nbsp;{chev}&nbsp; hover to pull forward</div>
    </div>
  </div>
</section>

<section class="band band--navy band--tight">
  <div class="shell center">
    <div class="btn-row" style="justify-content:center;margin-top:0">
      <a class="btn btn--ghost" href="gallery.html">See the full gallery</a>
    </div>
  </div>
</section>

<section class="band band--paper band--paper-2" id="calendar">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">What is coming up</p>
      <h2>The dates that decide your season.</h2>
      <p class="lede">Two of these are fixed and published. The membership deadline is the one
         that quietly ends seasons &mdash; a member who is not registered nationally cannot
         compete, however well prepared they are.</p>
    </div>
    <div class="upcoming" data-render-calendar="5" data-reveal></div>
    <div class="btn-row">
      <a class="btn btn--ghost" href="calendar.html">Full calendar &amp; live feed</a>
    </div>
  </div>
</section>

<section class="band band--paper" id="join">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">Requirements &amp; how to join</p>
      <h2>Three steps, in this order.</h2>
      <p class="lede">Membership runs through the school&rsquo;s career and technical education
         programme and has to be registered nationally before the deadline. Late registrations
         generally cannot be accepted, and national membership is what makes you eligible to
         compete at all.</p>
    </div>
    <ol class="steps" data-stagger="90">
      <li>
        <div>
          <h3>Check that you are eligible</h3>
          <p>SkillsUSA membership follows enrolment in a career and technical education
             programme. Which MHHS pathways this chapter draws from is being confirmed &mdash;
             ask the advisor before the membership deadline if you are not sure whether your
             schedule qualifies.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>Complete the school-wide CTSO form</h3>
          <p>The form is sent to your school email at the start of the year. Select
             <strong>SkillsUSA</strong> when it asks which organization you are joining.</p>
          <div class="btn-row"><span data-form="ctso" data-label="School-wide CTSO form"></span></div>
        </div>
      </li>
      <li>
        <div>
          <h3>Submit the membership form and dues</h3>
          <p>Complete the chapter membership form and pay dues before the deadline. SkillsUSA
             dues have a national and a state component; the chapter publishes the exact figure
             each year.</p>
          <div class="btn-row"><span data-form="membership" data-label="MHHS SkillsUSA membership form"></span></div>
        </div>
      </li>
    </ol>
    <div class="btn-row">
      <a class="btn" href="join.html">Full joining guide</a>
      <a class="btn btn--ghost" href="faq.html">Questions first</a>
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

<section class="band band--navy">
  <div class="shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">Stay informed</p>
        <h2>This website is one of <span class="it">four</span> places to look.</h2>
        <p>Canvas, chapter announcements, your school email and what gets said at meetings all
           carry information that never fits on a webpage. Check them regularly &mdash; especially
           email, which is where deadlines arrive first.</p>
        <div class="socials mt-2" data-render-socials></div>
      </div>
      <div data-reveal style="--delay:120ms">
        <div class="grid grid--2" data-stagger="70">
          <a class="card" href="framework.html">
            <p class="card__n">Foundation</p>
            <h3>The SkillsUSA Framework</h3>
            <p>Three components, 17 Essential Elements, and why every part of the programme
               is built on them.</p>
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
            <p>Who to email, and what each of the seven officer roles is actually
               responsible for.</p>
          </a>
          <a class="card" href="faq.html">
            <p class="card__n">Answers</p>
            <h3>FAQ &amp; support</h3>
            <p>The questions members ask most, answered honestly &mdash; including the ones
               still marked TBD.</p>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

</div>
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
          <h3>Check that you are eligible</h3>
          <p>SkillsUSA is a career and technical student organization, so membership follows
             enrolment in a career and technical education programme. The chapter is confirming
             which Mountain House pathways it draws from &mdash; that answer goes here as soon
             as it exists.</p>
          <p>This matters most for the trade contests. To enter a Skilled and Technical contest
             you must meet the eligibility requirements of the matching training programme. The
             Leadership and Occupationally Related contests are open far more broadly.</p>
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
            fixed dates &mdash; the membership deadline, region, and four days in Ontario in
            April &mdash; and a lot of flexibility in between.</dd></div>
          <div><dt>Do I have to compete?</dt><dd>No. Members who do not compete take part in
            meetings, service projects, fundraising and the Program of Work. Competition is one
            part of the programme, not the whole of it.</dd></div>
          <div><dt>What if I am not in a trade class?</dt><dd>Then the Leadership and
            Occupationally Related contests are where you compete. Job Interview, Prepared
            Speech, Quiz Bowl and Community Service need no pathway eligibility at all.</dd></div>
          <div><dt>What does it cost?</dt><dd>Dues, plus conference costs if you advance.
            Conference travel is the expensive part, which is what the chapter&rsquo;s
            fundraising exists to reduce.</dd></div>
          <div><dt>What if I join late?</dt><dd>Talk to the advisor. Joining after the national
            deadline usually means a full year of chapter membership without competition
            eligibility &mdash; still worth doing, but know that going in.</dd></div>
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
      <a class="btn btn--ghost" href="faq.html">Read the FAQ</a>
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
    "Seven officer roles and the advisors who hold the charter. Names fill in "
    "as the chapter is established and its first officer team is elected.",
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

<section class="band band--navy-2 band--tight">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">State office</p>
      <h2>Representing more than one chapter.</h2>
      <p class="lede">SkillsUSA California elects a state officer team each spring at the State
         Leadership and Skills Conference. A member holding state office represents every
         chapter in the region.</p>
    </div>
    <div data-render="regionrep" data-reveal></div>
  </div>
</section>

<section class="band band--navy">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">The officer team</p>
      <h2>Seven roles, and why it is seven.</h2>
      <p class="lede">Seven is the size of an Opening and Closing Ceremonies team. Each officer
         has a speaking part in that ceremony built around one point of the SkillsUSA emblem,
         which is a neat way of saying the structure is not arbitrary.</p>
    </div>
    <div class="people people--wide" data-render="officers" data-stagger="60"></div>
  </div>
</section>

<section class="band band--navy-2">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">Assistant officers</p>
      <h2>Learning the job before holding it.</h2>
      <p class="lede">Assistant officers work alongside the elected team through the year. It is
         the most reliable route into an officer role the following spring.</p>
    </div>
    <div class="people" data-render="assistants" data-stagger="60"></div>
  </div>
</section>

<section class="band band--paper">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">The emblem</p>
      <h2>What the colours stand for.</h2>
      <p class="lede">Worth knowing before you are asked in a contest &mdash; and the Statesman
         Award is built on exactly this.</p>
    </div>
    <dl class="facts" data-reveal>
      <div><dt>Red and white</dt><dd>The individual states and chapters.</dd></div>
      <div><dt>Blue</dt><dd>The common union of the states and of the chapters.</dd></div>
      <div><dt>Gold</dt><dd>The individual &mdash; the most important element of the
        organization.</dd></div>
    </dl>
    <div class="btn-row">
      <a class="btn btn--ghost" href="framework.html">The Framework behind all of it</a>
    </div>
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
        <p>Officers cannot be in every classroom. Committee representatives can &mdash; they carry
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
         process is set by the officer team &mdash; typically an interest meeting, a written
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
      <h2>Four rounds, and only one of them is here.</h2>
      <p class="lede">The SkillsUSA Championships are the largest skills competition in the
         country. The route runs through four levels, and each one narrows.</p>
    </div>
    <ol class="steps" data-stagger="80">
      <li>
        <div>
          <h3>Chapter</h3>
          <p>Contests start here. For some events this is a genuine internal competition; for
             others it is the chapter deciding who is ready to represent it.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>Region or district</h3>
          <p>The qualifying round for the state conference. Region assignment comes from
             SkillsUSA California.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>State &mdash; the SLSC</h3>
          <p>The California State Leadership and Skills Conference, held each spring in Ontario:
             opening and closing ceremonies at Toyota Arena, contests at the Ontario Convention
             Center. Around 120 competitive events. The 2027 conference runs 8&ndash;11 April and
             is the 60th.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>National &mdash; the NLSC</h3>
          <p>State gold medallists earn eligibility for the National Leadership and Skills
             Conference at the Georgia World Congress Center in Atlanta &mdash; 113 contests,
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
           Award &mdash; recognition that runs alongside competition.</p>
      </a>
      <a class="card" href="service-hours.html">
        <p class="card__n">03</p>
        <h3>Service hours</h3>
        <p>How hours are logged and what they feed into, plus a private tracker that stays in
           your own browser.</p>
      </a>
      <a class="card" href="checkpoints.html">
        <p class="card__n">04</p>
        <h3>Checkpoints &amp; roadmaps</h3>
        <p>How preparation is spread across a season instead of collapsed into the week before
           region.</p>
      </a>
      <a class="card" href="framework.html">
        <p class="card__n">05</p>
        <h3>The Framework</h3>
        <p>Every contest is scored against it, so it is worth reading before you pick one.</p>
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
    <div class="tbd mt-3" data-reveal>
      <p class="tbd__label">Coming soon</p>
      <h3>Chapter documents</h3>
      <p>Slideshows, roadmaps and the chapter&rsquo;s own contest guides go here as the officer
         team produces them. Until then, the official guidelines above are the authority.</p>
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
        <p>Two practical constraints. First, contests run concurrently at a conference, so
           entering two can simply collide &mdash; check before you assume. Second, the trade
           contests require eligibility in the matching training programme, so your schedule
           decides which of them are open to you.</p>
        <p>Everything below is a real SkillsUSA contest. Which of them <em>this chapter</em>
           enters depends on the pathways offered at Mountain House and on the California
           contest list for the year &mdash; confirm with the advisor before you build a plan
           around one.</p>
      </div>
    </div>
  </div>
</section>

<section class="band band--navy">
  <div class="shell shell--wide">
    <div class="head" data-reveal>
      <p class="eyebrow">Open to every member</p>
      <h2>No pathway required.</h2>
      <p class="lede">Leadership and Occupationally Related contests test Framework skills rather
         than trade skills. If you are a member, you can enter these.</p>
    </div>
    <div data-render-events="open"></div>
  </div>
</section>

<section class="band band--navy-2">
  <div class="shell shell--wide">
    <div class="head" data-reveal>
      <p class="eyebrow">Programme eligibility required</p>
      <h2>The trade contests.</h2>
      <p class="lede">To enter one of these you must meet the eligibility requirements of the
         matching occupational training programme.</p>
    </div>
    <div data-render-events="eligibility"></div>
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
       threshold printed here &mdash; national programmes are revised from year to year.</p>
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

<section class="band band--paper">
  <div class="shell shell--wide">
    <div class="head" data-reveal>
      <p class="eyebrow">At the state conference only</p>
      <h2>Technical Information Assessments.</h2>
    </div>
    <div class="evt-grid" data-render-atc data-stagger="60"></div>
    <div class="btn-row">
      <a class="btn btn--ghost" href="https://www.skillsusaca.org/" target="_blank" rel="noopener">SkillsUSA California contest list</a>
    </div>
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
         chapter-set targets, not national thresholds &mdash; SkillsUSA does not publish hour
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
        this browser only &mdash; they are not sent to the officer team, and clearing your browser
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
    "Checkpoints &amp; roadmaps.",
    "Preparation spread across a season instead of collapsed into the week "
    "before region. This is the part that decides results.",
    art="chapter-contest-prep") + """
<section class="band band--paper band--tight">
  <div class="shell shell--narrow">
    <p class="lede" data-reveal>Almost every competitor who underperforms did the same thing:
       they knew their contest well and started three weeks out. The gap between placing and
       not placing is usually months of small, boring work.</p>
    <p data-reveal>Checkpoints exist to make that work visible early enough to act on. The
       schedule below is the chapter&rsquo;s proposed structure &mdash; dates are confirmed by
       the officer team once contest entries are known.</p>
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
        <p>Whatever the underlying competence is &mdash; welding a joint, running a meeting,
           writing a plan &mdash; this is the long stretch, and it is mostly repetition.</p></div></li>
      <li><div><h3>First full attempt</h3>
        <p>Do the whole thing badly, early, under something like real conditions. This is where
           you find out what the guidelines actually meant.</p></div></li>
      <li><div><h3>Get it judged</h3>
        <p>Someone other than you scores it against the real rubric. An advisor, an officer, a
           teacher in the trade &mdash; anyone who will be honest.</p></div></li>
      <li><div><h3>Fix the two worst things</h3>
        <p>Not everything. The two lowest-scoring parts, properly. Then get it judged again.</p></div></li>
      <li><div><h3>Rehearse the conditions</h3>
        <p>Time limits, attire, the materials you are allowed, the ones you are not. On the day
           itself nothing should be new except the room.</p></div></li>
    </ol>
  </div>
</section>

<section class="band band--navy-2">
  <div class="shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">Weekly checkpoints</p>
        <h2>Small, and on a schedule.</h2>
      </div>
      <div class="stack" data-reveal style="--delay:120ms">
        <p>A checkpoint is one short task per week, tied to whichever milestone you are on. They
           are posted on Canvas and they take minutes, not evenings.</p>
        <p>The point is not the task. The point is that a member who has missed three
           checkpoints is visible in week four rather than in April, when there is still time
           to do something about it.</p>
      </div>
    </div>
    <div class="tbd mt-3" data-reveal>
      <p class="tbd__label">Coming soon</p>
      <h3>The checkpoint schedule</h3>
      <p>Published once contest entries are known. Open help sessions run alongside it &mdash;
         day, time and room to be confirmed.</p>
    </div>
  </div>
</section>

<section class="band band--paper">
  <div class="shell shell--narrow center">
    <p class="eyebrow" data-reveal>If you are behind</p>
    <h2 data-reveal>Say so early. It is fixable early.</h2>
    <p class="lede" data-reveal>Nobody is removed from a contest for being behind in November.
       People do get removed for being unprepared in March, which is the same problem found
       four months too late.</p>
    <div class="btn-row" style="justify-content:center">
      <span data-form="questions" data-label="Questions &amp; support form"></span>
    </div>
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
<section class="band band--navy band--tight">
  <div class="shell shell--wide">
    <div data-render-cal-embed data-reveal></div>
  </div>
</section>

<section class="band band--navy">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">The season</p>
      <h2>Everything, in order.</h2>
    </div>
    <div class="upcoming" data-render-calendar data-reveal></div>
  </div>
</section>

<section class="band band--paper">
  <div class="shell">
    <div class="head" data-reveal>
      <p class="eyebrow">The two that are certain</p>
      <h2>Book these now.</h2>
    </div>
    <dl class="facts" data-reveal>
      <div><dt>8&ndash;11 April 2027</dt><dd>California State Leadership and Skills Conference,
        Ontario. Opening and closing ceremonies at Toyota Arena, contests at the Ontario
        Convention Center. The 60th SLSC.</dd></div>
      <div><dt>21&ndash;25 June 2027</dt><dd>National Leadership and Skills Conference, Georgia
        World Congress Center, Atlanta &mdash; for competitors who win gold at state.</dd></div>
    </dl>
    <p class="mt-2" style="max-width:60ch">Everything else on this page is the chapter&rsquo;s own
       planning, in the right order but not yet announced. Dates firm up through the autumn.</p>
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
    "a contest &mdash; which is most of what a chapter actually is.",
    art="chapter-fundraiser") + """
<section class="band band--paper band--tight">
  <div class="shell">
    <div class="split split--top">
      <div data-reveal>
        <p class="eyebrow">Fundraising</p>
        <h2>What the money is for.</h2>
      </div>
      <div class="stack" data-reveal style="--delay:120ms">
        <p>Conference travel. Four days in Ontario for a delegation is the chapter&rsquo;s
           largest cost by a wide margin, and it is the one thing standing between a prepared
           competitor and the conference they qualified for.</p>
        <p>Fundraising is aimed squarely at reducing that number. A member should qualify or not
           qualify on preparation &mdash; not on what a family can spend in April.</p>
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
          <p>The kind SkillsUSA chapters are uniquely able to do &mdash; a repair, a build, a
             install for somebody who needs it. It is the most convincing thing a chapter can
             put in front of a judge, and the most useful thing it can do.</p>
        </div>
      </li>
      <li>
        <div>
          <h3>School and district events</h3>
          <p>Open houses, orientation nights, career fairs. Unglamorous, and how a new chapter
             becomes visible enough to grow.</p>
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
        <div class="tbd">
          <p class="tbd__label">To be confirmed</p>
          <h3>Day, time and room</h3>
          <p>Set by the officer team and the advisor once the year&rsquo;s schedule is known,
             and announced through Canvas and email before the first meeting.</p>
        </div>
        <p>Attendance is not usually a hard requirement. It does tend to correlate with being
           prepared, which is why most chapters weigh it when selecting competitors.</p>
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
           decide. Run under parliamentary procedure &mdash; the Parliamentarian keeps it
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
    "A chapter in its first year has no traditions. It has decisions about "
    "which ones to start &mdash; and those decisions last a long time.",
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
             object &mdash; and the first one gets traded for a long time.</p>
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
    "The chapter has not competed yet, so there are no photographs. Every frame "
    "below is a reserved slot, and the caption says what belongs in it.",
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
      <button type="button" data-album="chapter" aria-pressed="false">Chapter</button>
      <button type="button" data-album="conference" aria-pressed="false">Conferences</button>
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
        <p>The Framework names the skills explicitly &mdash; the personal ones, the workplace
           ones and the technical ones &mdash; so that what is learned in a classroom and a lab
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
      <div><dt>Communication</dt><dd>Conveying and receiving information clearly &mdash; in
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
      <p class="lede">The trade itself &mdash; and the mathematics, science and literacy
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
    "chapter runs are marked TBD until the officer team decides them &mdash; "
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
     "Requirements and steps to join MHHS SkillsUSA: pathway eligibility, the school-wide CTSO form, the membership form and dues.",
     JOIN + WORDMARK_CLOSE),
    ("officers.html", "Officers & advisors",
     "The seven MHHS SkillsUSA officer roles, assistant officers and chapter advisors for the 2026–2027 season.",
     OFFICERS + WORDMARK_CLOSE),
    ("committee-reps.html", "Committee representatives",
     "What a committee representative does, how to apply, and the three committees that nine representatives serve on.",
     COMMITTEEREPS + WORDMARK_CLOSE),
    ("competition.html", "Competition hub",
     "How the SkillsUSA Championships work, the ladder from chapter to nationals, and every competition resource the chapter has.",
     COMPETITION + WORDMARK_CLOSE),
    ("competitions.html", "All contests",
     "The three SkillsUSA contest categories — Leadership, Occupationally Related and Skilled and Technical — and the contests in each.",
     COMPETITIONS + WORDMARK_CLOSE),
    ("recognition.html", "Recognition programmes",
     "The Chapter Excellence Program, American Spirit, Community Service, Career Essentials and the SkillsUSA Statesman Award.",
     RECOGNITION + WORDMARK_CLOSE),
    ("service-hours.html", "Service hours",
     "How service hours are logged and documented for American Spirit, Community Service and the Chapter Excellence Program, with a private hour tracker.",
     SERVICE + WORDMARK_CLOSE),
    ("checkpoints.html", "Checkpoints & roadmaps",
     "Weekly checkpoints and a seven-milestone contest roadmap — how MHHS SkillsUSA competitors prepare across a season.",
     CHECKPOINTS + WORDMARK_CLOSE),
    ("calendar.html", "Calendar & deadlines",
     "Chapter meetings, the membership deadline, region, the California SLSC and the national conference — every date in the 2026–2027 season.",
     CALENDAR + WORDMARK_CLOSE),
    ("chapter-events.html", "Events & volunteering",
     "Chapter fundraisers and volunteer opportunities, and how service connects to SkillsUSA recognition programmes.",
     CHAPTEREVENTS + WORDMARK_CLOSE),
    ("meetings.html", "Meetings & recaps",
     "When and where MHHS SkillsUSA meets, what happens at a meeting, and the archive of slides and recaps.",
     MEETINGS + WORDMARK_CLOSE),
    ("gallery.html", "Photo gallery",
     "Reserved photo slots for the chapter's first season — conferences, meetings, service projects and the shop floor.",
     GALLERY + WORDMARK_CLOSE),
    ("traditions.html", "Traditions",
     "The chapter pin, the shirt design contest and the chapter archive — the traditions a first-year chapter gets to choose.",
     TRADITIONS + WORDMARK_CLOSE),
    ("framework.html", "The SkillsUSA Framework",
     "The three components of the SkillsUSA Framework and all seventeen Essential Elements, plus the SkillsUSA Pledge.",
     FRAMEWORK + WORDMARK_CLOSE),
    ("spotlight.html", "Member spotlight",
     "Members recognized by the officer team for work that does not show up on an awards list.",
     SPOTLIGHT + WORDMARK_CLOSE),
    ("faq.html", "FAQ",
     "Answers to the questions MHHS SkillsUSA members ask most about membership, contests, conferences, recognition and deadlines.",
     FAQ + WORDMARK_CLOSE),
]

if __name__ == "__main__":
    for row in PAGES:
        fn, title, desc, body = row[0], row[1], row[2], row[3]
        gated = row[4] if len(row) > 4 else False
        page(fn, title, desc, body, gated=gated)
    print("\n%d pages written to %s" % (len(PAGES), OUT))
