/* ==========================================================================
   MHHS SkillsUSA site behaviour
   Renders the rosters and lists from data.js, handles navigation, scroll
   reveals, the photo lightbox, and the service-hour tracker.
   ========================================================================== */

(function () {
  "use strict";

  const D = window.SKILLSUSA;
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  /* ------------------------------------------------------------ navigation */
  function nav() {
    const toggle = $(".nav__toggle");
    const menu   = $("#site-nav");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        const open = menu.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.textContent = open ? "Close" : "Menu";
      });
    }

    // dropdowns respond to click as well as hover, so touch devices work
    $$(".nav__item--has-menu").forEach(function (item) {
      const btn = $(".nav__link", item);
      if (!btn || btn.tagName !== "BUTTON") return;
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const open = item.classList.contains("is-open");
        $$(".nav__item--has-menu").forEach((o) => o.classList.remove("is-open"));
        item.classList.toggle("is-open", !open);
        btn.setAttribute("aria-expanded", String(!open));
      });
    });

    document.addEventListener("click", function () {
      $$(".nav__item--has-menu").forEach(function (o) {
        o.classList.remove("is-open");
        const b = $(".nav__link", o);
        if (b) b.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      $$(".nav__item--has-menu").forEach((o) => o.classList.remove("is-open"));
      if (menu && menu.classList.contains("is-open")) toggle.click();
    });
  }

  /* ------------------------------------------------------------ people */
  function personCard(p, opts) {
    opts = opts || {};
    const facts = [];
    if (p.grade) facts.push("<span>" + esc(p.grade) + "</span>");
    if (p.years) facts.push("<span>" + esc(p.years) + "</span>");

    const contact = [];
    if (p.school)   contact.push('<a href="mailto:' + esc(p.school) + '">' + esc(p.school) + "</a>");
    if (p.personal) contact.push('<a href="mailto:' + esc(p.personal) + '">' + esc(p.personal) + "</a>");
    if (p.email)    contact.push('<a href="mailto:' + esc(p.email) + '">' + esc(p.email) + "</a>");

    return '' +
      '<article class="person' + (opts.feature ? " person--feature" : "") + '">' +
        '<div class="person__photo">' +
          '<img src="' + D.art.person(p.slug) + '" alt="' + esc(p.name) + '" loading="lazy" width="780" height="1040">' +
        "</div>" +
        "<div>" +
          '<p class="person__role">' + esc(p.role) + "</p>" +
          '<h3 class="person__name">' + esc(p.name) + "</h3>" +
          (facts.length ? '<p class="person__facts">' + facts.join("") + "</p>" : "") +
          (p.bio && !opts.compact ? '<p class="person__bio">' + esc(p.bio) + "</p>" : "") +
          (contact.length ? '<div class="person__contact">' + contact.join("") + "</div>" : "") +
        "</div>" +
      "</article>";
  }

  /* ------------------------------------------------------------ roster
     The officer team, one seat per screenful. A large rounded portrait on one
     side and the seat on the other, alternating sides down the page so the
     eye crosses back and forth instead of running down a column.

     Not a card: no panel, no border, no padding. Just the photograph with its
     corners rounded, sitting on the page ground.

     Names are TBD until the first team is elected, so the big line falls back
     to the ROLE and the label reads "to be elected". Nine empty seats then
     look deliberate rather than broken, and the same markup starts reading
     correctly the moment real names land in data.js. */
  function renderRoster() {
    const host = $("[data-render-roster]");
    if (!host) return;

    host.innerHTML = D.officers.map(function (p, i) {
      const named = p.name && p.name !== "TBD";
      const big   = named ? p.name : p.role;
      const label = named ? p.role : "To be elected";
      const n     = String(i + 1).padStart(2, "0");

      return '' +
        '<article class="roster__seat">' +
          '<figure class="roster__shot" data-reveal>' +
            '<img src="' + D.art.person(p.slug) + '" alt="' + esc(p.name) + '"' +
                 ' loading="lazy" width="780" height="1040">' +
          "</figure>" +
          '<div class="roster__text" data-reveal style="--delay:90ms">' +
            '<p class="roster__meta"><span class="roster__n">' + n + "</span>" +
              "<span>" + esc(label) + "</span></p>" +
            '<h3 class="roster__name">' + esc(big) + "</h3>" +
            (p.bio ? '<p class="roster__bio">' + esc(p.bio) + "</p>" : "") +
          "</div>" +
        "</article>";
    }).join("");
  }

  function renderPeople() {
    const map = {
      officers:   () => D.officers.map((p) => personCard(p)).join(""),
      assistants: () => D.assistants.map((p) => personCard(p, { compact: true })).join(""),
      advisors:   () => D.advisors.map((p) => personCard(p, { feature: true })).join(""),
      regionrep:  () => personCard(D.regionRep, { feature: true })
    };
    $$("[data-render]").forEach(function (el) {
      const fn = map[el.dataset.render];
      if (fn) el.innerHTML = fn();
    });
  }

  /* ------------------------------------------------------------ class reps */
  function renderCommittees() {
    const host = $("[data-render-committees]");
    if (!host) return;
    host.innerHTML = D.committees.map(function (c) {
      return '' +
        '<section class="evt-cat" data-reveal>' +
          '<div class="evt-cat__head">' +
            "<h3>" + esc(c.name) + "</h3>" +
            "<p>" + esc(c.brief) + "</p>" +
          "</div>" +
          '<div class="grid grid--3">' +
            c.reps.map(function (r) {
              const named = r.name && r.name !== "TBD";
              return '' +
                '<article class="card">' +
                  '<p class="card__n">' + esc(r.grade) + "</p>" +
                  "<h3>" + (named ? esc(r.name) : "Seat open") + "</h3>" +
                  "<p>" + (named
                    ? "Committee representative, " + esc(c.name) + "."
                    : "This seat is filled once committee applications close.") + "</p>" +
                "</article>";
            }).join("") +
          "</div>" +
        "</section>";
    }).join("");
  }

  /* ------------------------------------------------------------ events */
  function renderEvents() {
    // A page can hold more than one container; the contests page uses one.
    $$("[data-render-events]").forEach(renderEventsInto);

    /* The category sections are built here, not in the HTML, so their ids do
       not exist when the browser first tries to honour a #hash. Arriving from
       a cine row on the home page therefore lands at the top of the page
       rather than at the category. Re-run the jump now that the ids exist. */
    if (location.hash.length > 1) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) {
        requestAnimationFrame(function () {
          target.scrollIntoView({ block: "start", behavior: "auto" });
        });
      }
    }
  }

  function renderEventsInto(host) {
    const only = host.dataset.renderEvents; // filter by `kind`, or "" for all
    const cats = D.eventCategories.filter((c) => !only || c.kind === only);

    host.innerHTML = cats.map(function (c) {
      return '' +
        '<section class="evt-cat" id="' + esc(c.id) + '" data-reveal>' +
          '<div class="evt-cat__head">' +
            "<div>" +
              '<span class="tag tag--optional">Open to all members</span>' +
              "<h3>" + esc(c.name) + "</h3>" +
            "</div>" +
            "<p>" + esc(c.brief) + "</p>" +
          "</div>" +
          '<div class="evt-grid" data-stagger="40">' +
            c.events.map(function (e) {
              return '' +
                '<article class="evt">' +
                  '<h4 class="evt__name"><a href="' + D.guidelines + '" target="_blank" rel="noopener">' + esc(e.name) + "</a></h4>" +
                  '<p class="evt__desc">' + esc(e.summary) + "</p>" +
                  '<p class="evt__spec"><span>' + esc(e.team) + "</span></p>" +
                "</article>";
            }).join("") +
          "</div>" +
        "</section>";
    }).join("");
  }

  /* ------------------------------------------------- recognition events */
  function renderRecognition() {
    const host = $("[data-render-recognition]");
    if (!host) return;
    host.innerHTML = D.recognitionEvents.map(function (r) {
      return '' +
        '<article class="evt-cat" data-reveal>' +
          '<div class="evt-cat__head">' +
            "<div>" +
              '<span class="tag">' + esc(r.type) + "</span>" +
              "<h3>" + esc(r.name) + "</h3>" +
            "</div>" +
            '<p><a href="' + esc(r.link) + '" target="_blank" rel="noopener">Official guidelines</a></p>' +
          "</div>" +
          '<div class="split" style="align-items:start">' +
            "<div><p>" + esc(r.summary) + "</p>" +
              '<p class="evt__spec" style="border:0;padding:0"><span>' + esc(r.window) + "</span></p></div>" +
            '<dl class="facts" style="margin:0">' +
              r.levels.map((l) => "<div><dt>" + esc(l[0]) + "</dt><dd>" + esc(l[1]) + "</dd></div>").join("") +
            "</dl>" +
          "</div>" +
        "</article>";
    }).join("");

  }

  /* ------------------------------------------------------------ calendar */
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  /* One date, a month-only date, or a range. The calendar carries all three.
     A range prints "Sep 15-16" rather than two rows, because a two-day event
     listed twice reads as two events. */
  function fmtDate(r) {
    const m = MONTHS[r.d.getMonth()];
    if (r.e.dayTbd) return m + " " + r.d.getFullYear();
    if (r.e.span) {
      const end = new Date(r.e.span + "T00:00:00");
      const sameMonth = end.getMonth() === r.d.getMonth();
      return m + " <b>" + r.d.getDate() + "\u2013" +
             (sameMonth ? "" : MONTHS[end.getMonth()] + " ") + end.getDate() +
             "</b> " + r.d.getFullYear();
    }
    return m + " <b>" + r.d.getDate() + "</b> " + r.d.getFullYear();
  }



  /* ------------------------------------------------------------ meetings */
  function renderMeetings() {
    const host = $("[data-render-meetings]");
    if (!host) return;
    if (!D.meetings.length) {
      host.innerHTML = '' +
        '<div class="tbd">' +
          '<p class="tbd__label">Nothing archived yet</p>' +
          "<h3>Meeting records start with the first Friday of the year</h3>" +
          "<p>Each week's slideshow and recap email is added here as a secondary record. " +
          "Canvas and your school email remain the primary source.</p>" +
        "</div>";
      return;
    }
    host.innerHTML = D.meetings.map(function (m) {
      const d = new Date(m.date + "T00:00:00");
      const links = [];
      if (m.slides) links.push('<a href="' + esc(m.slides) + '" target="_blank" rel="noopener">Slideshow</a>');
      if (m.recap)  links.push('<a href="' + esc(m.recap) + '" target="_blank" rel="noopener">Recap email</a>');
      return '' +
        '<article class="up">' +
          '<p class="up__date">' + MONTHS[d.getMonth()] + " <b>" + d.getDate() + "</b> " + d.getFullYear() + "</p>" +
          "<div>" +
            '<h3 class="up__title">' + esc(m.title) + "</h3>" +
            '<p class="up__note">' + esc(m.note || "") + "</p>" +
          "</div>" +
          '<p class="up__when">' + (links.join(" · ") || "No files") + "</p>" +
        "</article>";
    }).join("");
  }

  /* ------------------------------------------------------------ spotlight */
  function renderSpotlights() {
    const host = $("[data-render-spotlights]");
    if (!host) return;
    if (!D.spotlights.length) {
      host.innerHTML = '' +
        '<div class="tbd">' +
          '<p class="tbd__label">First spotlight coming soon</p>' +
          "<h3>Nominations open at the first chapter meeting</h3>" +
          "<p>Every few weeks we feature a member who showed up for someone else: a competitor who " +
          "mentored a first-timer, a volunteer who kept a shift covered, a team that rebuilt a project " +
          "the week before a conference. Nominate anyone, including yourself.</p>" +
        "</div>";
      return;
    }
    host.innerHTML = D.spotlights.map(function (s) {
      return '' +
        '<article class="person person--feature" data-reveal>' +
          '<div class="person__photo"><img src="' + esc(s.photo) + '" alt="' + esc(s.name) + '" loading="lazy"></div>' +
          "<div>" +
            '<p class="person__role">' + esc(s.event || "Member spotlight") + "</p>" +
            '<h3 class="person__name">' + esc(s.name) + "</h3>" +
            '<p class="person__facts"><span>' + esc(s.grade) + "</span></p>" +
            (s.quote ? '<p class="lede" style="font-size:1.15rem">“' + esc(s.quote) + "”</p>" : "") +
            (s.note ? '<p class="person__bio">' + esc(s.note) + "</p>" : "") +
          "</div>" +
        "</article>";
    }).join("");
  }

  /* ------------------------------------------------------------ gallery */
  function renderGallery() {
    const host = $("[data-render-gallery]");
    if (!host) return;
    const html = D.gallery.map(function (g, i) {
      return '' +
        "<figure>" +
          '<button type="button" data-lb="' + i + '" aria-label="Open photo: ' + esc(g.caption) + '">' +
            '<img src="' + D.art.thumb(g.slug) + '" alt="' + esc(g.caption) + '" loading="lazy">' +
          "</button>" +
        "</figure>";
    }).join("");
    host.innerHTML = html;

    // filters
    $$(".gal-filter button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const album = btn.dataset.album;
        $$(".gal-filter button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        $$("figure", host).forEach(function (fig, i) {
          const match = !album || D.gallery[i].album === album;
          fig.style.display = match ? "" : "none";
        });
      });
    });

    lightbox(host);
  }

  function lightbox(host) {
    const box = $("#lightbox");
    if (!box) return;
    const img = $("img", box);
    const cap = $("figcaption", box);
    let index = 0;

    function visibleIndices() {
      return $$("figure", host)
        .map((fig, i) => (fig.style.display === "none" ? -1 : i))
        .filter((i) => i >= 0);
    }

    function show(i) {
      const g = D.gallery[i];
      if (!g) return;
      index = i;
      img.src = D.art.photo(g.slug);
      img.alt = g.caption;
      cap.textContent = g.caption;
    }

    function step(dir) {
      const vis = visibleIndices();
      const at = vis.indexOf(index);
      show(vis[(at + dir + vis.length) % vis.length]);
    }

    function open(i) {
      show(i);
      box.classList.add("is-open");
      document.body.style.overflow = "hidden";
      $(".lightbox__close", box).focus();
    }

    function close() {
      box.classList.remove("is-open");
      document.body.style.overflow = "";
      img.src = "";
    }

    host.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-lb]");
      if (btn) open(parseInt(btn.dataset.lb, 10));
    });

    $(".lightbox__close", box).addEventListener("click", close);
    $(".lightbox__nav--prev", box).addEventListener("click", () => step(-1));
    $(".lightbox__nav--next", box).addEventListener("click", () => step(1));
    box.addEventListener("click", function (e) { if (e.target === box) close(); });

    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });
  }

  /* ------------------------------------------------------------ FAQ */
  function renderFaqs() {
    const host = $("[data-render-faqs]");
    if (!host) return;

    const groups = [];
    D.faqs.forEach(function (f) {
      let g = groups.find((x) => x.name === f.g);
      if (!g) { g = { name: f.g, items: [] }; groups.push(g); }
      g.items.push(f);
    });

    host.innerHTML = groups.map(function (g) {
      return '' +
        '<section class="mt-3" data-reveal>' +
          '<p class="eyebrow">' + esc(g.name) + "</p>" +
          '<div class="faq">' +
            g.items.map(function (f) {
              return "<details><summary>" + esc(f.q) + "</summary>" +
                     '<div class="faq__a"><p>' + esc(f.a) + "</p></div></details>";
            }).join("") +
          "</div>" +
        "</section>";
    }).join("");
  }

  /* ------------------------------------------------------------ forms */
  // Swap in real Google Form links from data.js; otherwise show the TBD state.
  /* A form button, or the email that stands in for it.

     A form that does not exist yet used to render as a dead "(TBD)" button,
     which tells a member their question has nowhere to go. It now renders as
     a mailto to the chapter address instead, with the form's own label as the
     subject line, so the ask still reaches somebody. Paste a real URL into
     data.js and the same button silently becomes the form. */
  function renderFormLinks() {
    $$("[data-form]").forEach(function (el) {
      const key = el.dataset.form;
      const f = D.chapter.forms[key];
      if (!f) return;

      if (f.url) {
        el.outerHTML = '<a class="btn" href="' + esc(f.url) + '" target="_blank" rel="noopener">' +
                       esc(el.dataset.label || f.label) + "</a>";
        return;
      }

      const to = D.chapter.email;
      if (!to) {                        // no form and no address: say so plainly
        el.outerHTML = '<span class="btn btn--ghost" aria-disabled="true" ' +
                       'title="This form has not opened yet">' +
                       esc(el.dataset.label || f.label) + " (TBD)</span>";
        return;
      }
      const href = "mailto:" + to + "?subject=" +
                   encodeURIComponent(f.label.replace(/ Form$/, ""));
      el.outerHTML = '<a class="btn" href="' + esc(href) + '" title="' + esc(to) + '">' +
                     esc(el.dataset.mailLabel || f.ask || "Email the chapter") + "</a>";
    });
  }

  /* ------------------------------------------------------------ socials */
  const ICONS = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    canvas:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>',
    mail:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/></svg>'
  };

  function renderSocials() {
    $$("[data-render-socials]").forEach(function (host) {
      host.innerHTML = D.chapter.socials.map(function (s) {
        const live = s.url && s.url !== "#";
        return "<" + (live ? "a" : "span") + ' class="social"' +
          (live ? ' href="' + esc(s.url) + '" target="_blank" rel="noopener"' : ' aria-disabled="true"') + ">" +
          (ICONS[s.icon] || "") +
          "<span>" + esc(s.handle) + (live ? "" : " (TBD)") + "</span>" +
          "</" + (live ? "a" : "span") + ">";
      }).join("");
    });
  }

  /* ------------------------------------------------------------ tracker */
  // A private, browser-local log that mirrors the chapter's official tracking
  // template. Nothing is submitted from here; export the CSV and paste it
  // into the official document, then log the same hours in HATS.
  const KEY = "mhhs-skillsusa-hours-v1";

  const CODES = [
    "Chapter community service project",
    "American Spirit documentation",
    "Community Service contest project",
    "Career Essentials / professional development",
    "Other chapter service"
  ];

  // Chapter-set milestones, not national thresholds. SkillsUSA does not
  // publish hour requirements for these programmes, so the officer team picks
  // targets it thinks are worth aiming at. Edit freely.
  const TIERS = {
    "Chapter community service project": [["Bronze", 25], ["Silver", 50], ["Gold", 100]],
    "Community Service contest project": [["Bronze", 40], ["Silver", 80], ["Gold", 150]]
  };

  function loadLog() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function saveLog(rows) {
    try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch (e) {}
  }

  function tracker() {
    const root = $("#tracker");
    if (!root) return;

    const form  = $("#tracker-form", root);
    const body  = $("#tracker-rows", root);
    const total = $("#tracker-total", root);
    const bars  = $("#tracker-levels", root);
    const codeSel = $("#t-code", root);

    codeSel.innerHTML = CODES.map((c) => '<option value="' + esc(c) + '">' + esc(c) + "</option>").join("");

    function draw() {
      const rows = loadLog();

      if (!rows.length) {
        body.innerHTML = '<tr><td colspan="6" class="empty">No activities logged yet. ' +
                         "Add your first one above; it stays in this browser only.</td></tr>";
      } else {
        body.innerHTML = rows.map(function (r, i) {
          return "<tr>" +
            '<td class="num">' + esc(r.date) + "</td>" +
            "<td>" + esc(r.activity) + "</td>" +
            "<td>" + esc(r.why) + "</td>" +
            "<td>" + esc(r.code) + "</td>" +
            '<td class="num">' + Number(r.hours).toFixed(1) + "</td>" +
            "<td>" + (r.proof
              ? '<a href="' + esc(r.proof) + '" target="_blank" rel="noopener">Proof</a> '
              : '<span style="color:var(--red-3)">Missing</span> ') +
              '<button class="btn-mini" data-del="' + i + '">Remove</button></td>' +
          "</tr>";
        }).join("");
      }

      const sum = rows.reduce((n, r) => n + (Number(r.hours) || 0), 0);
      total.textContent = sum.toFixed(1);

      // progress toward the recognition levels that use hour thresholds
      bars.innerHTML = Object.keys(TIERS).map(function (code) {
        const got = rows.filter((r) => r.code === code)
                        .reduce((n, r) => n + (Number(r.hours) || 0), 0);
        const tiers = TIERS[code];
        const top = tiers[tiers.length - 1][1];
        const pct = Math.min(100, (got / top) * 100);
        const earned = tiers.filter((t) => got >= t[1]).pop();
        return '' +
          '<div class="level">' +
            '<div class="level__top"><span>' + esc(code) + "</span>" +
            "<span>" + got.toFixed(1) + " / " + top + " hrs" +
            (earned ? " · " + earned[0] : "") + "</span></div>" +
            '<div class="level__bar"><div class="level__fill' +
              (earned && earned[0] === "Gold" ? " is-gold" : "") +
              '" style="width:' + pct + '%"></div></div>' +
          "</div>";
      }).join("");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const rows = loadLog();
      rows.push({
        date:     $("#t-date", root).value,
        activity: $("#t-activity", root).value.trim(),
        why:      $("#t-why", root).value.trim(),
        code:     $("#t-code", root).value,
        hours:    parseFloat($("#t-hours", root).value) || 0,
        proof:    $("#t-proof", root).value.trim()
      });
      rows.sort((a, b) => (a.date < b.date ? -1 : 1));
      saveLog(rows);
      form.reset();
      draw();
    });

    body.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-del]");
      if (!btn) return;
      const rows = loadLog();
      rows.splice(parseInt(btn.dataset.del, 10), 1);
      saveLog(rows);
      draw();
    });

    $("#tracker-export", root).addEventListener("click", function () {
      const rows = loadLog();
      if (!rows.length) return;
      const head = ["Date of Activity", "Activity Description", "Explanation", "Activity Code", "Hours", "Proof"];
      const csv = [head].concat(rows.map((r) => [r.date, r.activity, r.why, r.code, r.hours, r.proof]))
        .map((line) => line.map((c) => '"' + String(c == null ? "" : c).replace(/"/g, '""') + '"').join(","))
        .join("\r\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "mhhs-skillsusa-service-hours.csv";
      a.click();
      URL.revokeObjectURL(url);
    });

    $("#tracker-clear", root).addEventListener("click", function () {
      if (!confirm("Clear every logged activity from this browser? This cannot be undone.")) return;
      saveLog([]);
      draw();
    });

    draw();
  }

  /* ------------------------------------------------- sticky collage
     Three columns of chapter photography; the middle one pins while the
     outer two keep moving. */
  function renderCollage() {
    const host = $("[data-render-collage]");
    if (!host) return;

    const left  = D.media.collage.left;
    const pin   = D.media.collage.pin;
    const right = D.media.collage.right;

    const cap = (slug) => {
      const g = D.gallery.find((x) => x.slug === slug);
      return g ? g.caption : "";
    };
    const fig = (slug) =>
      '<figure><img src="' + D.art.thumb(slug) + '" alt="' +
      esc(cap(slug)) + '" loading="lazy"></figure>';

    host.innerHTML =
      '<div class="collage__col">' + left.map(fig).join("") + "</div>" +
      '<div class="collage__col collage__col--pin">' + pin.map(fig).join("") + "</div>" +
      '<div class="collage__col">' + right.map(fig).join("") + "</div>";
  }

  /* ------------------------------------------------- 3D card surfer */
  function renderSurfer() {
    const host = $("[data-render-surfer]");
    if (!host) return;
    const picks = D.media.surfer;
    host.innerHTML = picks.map(function (slug, i) {
      const g = D.gallery.find((x) => x.slug === slug);
      const caption = g ? g.caption : "";
      return '' +
        '<figure class="surfer__card">' +
          '<img src="' + D.art.thumb(slug) + '" alt="' + esc(caption) + '" loading="lazy">' +
          "<figcaption>" + String(i + 1).padStart(2, "0") + " &middot; " +
            (g && g.album === "conference" ? "Conference" : "Chapter") +
          "</figcaption>" +
        "</figure>";
    }).join("");
  }

  /* -------------------------------------------------- officers CTA fill
     Moves the mask disc on the filled copy of the headline to follow the
     pointer, so the colour reads as being painted on. The disc is positioned
     relative to the FILLED SPAN, not the panel. The mask coordinate space is
     the element's own box, and using the panel's coordinates puts the disc in
     the wrong place whenever the text is not full-bleed.

     Position is smoothed rather than set outright: a mask that snaps to the
     cursor looks like a spotlight, one that trails slightly looks like paint. */
  function officersCta() {
    const host = $("[data-officers-cta]");
    if (!host) return;
    const fill = $(".officers-cta__line--fill", host);
    if (!fill) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0.5, ty = 0.5, cx = 0.5, cy = 0.5, raf = 0, inside = false;

    function tick() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      fill.style.setProperty("--mx", (cx * 100).toFixed(2) + "%");
      fill.style.setProperty("--my", (cy * 100).toFixed(2) + "%");
      // keep ticking while it is still catching up, then idle
      if (inside || Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }

    host.addEventListener("pointermove", function (e) {
      const r = fill.getBoundingClientRect();
      if (!r.width || !r.height) return;
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
      inside = true;
      kick();
    }, { passive: true });

    host.addEventListener("pointerleave", function () {
      inside = false;
      tx = 0.5; ty = 0.5;              // ease back to centre
      kick();
    }, { passive: true });
  }

  /* ---------------------------------------------------------------- story
     A pinned scroll-through. The section sticks to the viewport and scroll
     progress moves between beats instead of moving the page, the same native
     sticky-track technique as the hero, so no wheel interception and the
     scrollbar keeps telling the truth.

     Beats crossfade through each other rather than switching: at any moment
     the outgoing beat is still leaving while the incoming one arrives, which
     is what keeps it feeling continuous rather than like a slideshow. */
  function renderStory() {
    const track = $("[data-story-track]");
    const host  = $("[data-render-story]");
    if (!track || !host || !D.story || !D.story.length) return;

    const beats = D.story;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    host.innerHTML = beats.map(function (b, i) {
      return '' +
        '<article class="story__beat" data-beat="' + i + '">' +
          '<span class="story__mark" aria-hidden="true">' + esc(b.mark) + "</span>" +
          '<div class="story__type">' +
            '<p class="story__step">' + String(i + 1).padStart(2, "0") +
              ' <i></i> ' + String(beats.length).padStart(2, "0") + "</p>" +
            '<h2 class="story__lead">' + esc(b.lead) + "</h2>" +
            '<p class="story__body">' + esc(b.body) + "</p>" +
          "</div>" +
        "</article>";
    }).join("") +
    '<div class="story__rail" aria-hidden="true">' +
      beats.map(function () { return '<span></span>'; }).join("") +
    "</div>";

    const els  = $$(".story__beat", host);
    const pips = $$(".story__rail span", host);

    /* Reduced motion gets the whole thing as a plain stack: no pinning, no
       crossfade, every beat simply legible. */
    if (reduced) {
      track.classList.add("is-static");
      els.forEach((el) => { el.style.opacity = 1; el.style.transform = "none"; });
      return;
    }

    let running = false, raf = 0;

    function apply() {
      const budget = track.offsetHeight - window.innerHeight;
      if (budget <= 0) return;
      const p = Math.min(Math.max(-track.getBoundingClientRect().top / budget, 0), 1);

      /* Reach the last beat at 88% and HOLD it to the end. Dividing the range
         instead (pos = p * n / 0.85) overshoots: at the bottom of the track
         pos lands past the final beat, so it is already fading out again just
         as the section releases. */
      const pos = Math.min(p / 0.88, 1) * (els.length - 1);

      let active = 0, best = -1;
      els.forEach(function (el, i) {
        const t = pos - i;                       // <0 ahead, 0 here, >0 behind
        const a = Math.max(0, 1 - Math.abs(t) * 1.35);
        el.style.opacity = a.toFixed(3);
        el.style.transform = "translate3d(0," + (t * -46).toFixed(1) + "px,0)";
        el.style.pointerEvents = a > 0.5 ? "auto" : "none";
        // whichever beat is most visible owns the rail. A fixed 0.5 threshold
        // leaves the pips wrong mid-crossfade and at the very end
        if (a > best) { best = a; active = i; }
      });
      pips.forEach((s, i) => s.classList.toggle("is-on", i <= active));

    }

    /* apply() only ever does the work. tick() owns the animation frame chain,
       so a scroll-driven call can never start a second one. */
    function tick() {
      apply();
      raf = running ? requestAnimationFrame(tick) : 0;
    }
    function start() { if (!running) { running = true; if (!raf) raf = requestAnimationFrame(tick); } }
    function stop()  { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach((en) => (en.isIntersecting ? start() : stop()));
      }, { threshold: 0.01 }).observe(track);
    } else {
      start();
    }
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

    /* The rAF loop is what makes it smooth, but it must not be the ONLY thing
       that can update the beats: requestAnimationFrame is throttled to nothing
       in a background or occluded tab, and a section frozen on beat one is
       worse than a slightly less smooth one. A passive scroll listener keeps
       it correct whether or not frames are being served. */
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply, { passive: true });
    apply();                                     // correct on first paint
  }

  /* ------------------------------------------------------------ timeline
     The season as a horizontal rail. Markers are positioned by their real
     distance in time, not spaced evenly, so the long empty stretch between
     the start of school and the regional conference actually looks long, and
     the cluster of April-to-June dates actually looks like a cluster.

     It scrolls sideways on narrow screens rather than compressing, because a
     timeline squeezed to phone width stops being readable as a timeline. */
  /* ---------------------------------------------------------- season rail
     The whole season on one horizontal track that you scroll sideways.

     This replaced a cramped rail-plus-vertical-list pair: the rail squeezed
     ten months into one screen width, so labels collided and had to be
     stacked into lanes, and the list below then repeated every entry. One
     component now carries both jobs.

     Distance along the track is REAL elapsed time at a fixed pixels-per-day,
     which is what makes it wider than the screen. The empty stretch between
     December and February is supposed to feel long; that is the point of a
     calendar. Cards alternate above and below the rail so two dates a
     fortnight apart do not overlap, and a minimum gap nudges any pair that
     still would. */
  /* Drag the track sideways with a pointer.

     A trackpad scrolls horizontally on its own, but a mouse has no horizontal
     wheel and would leave the second half of the season unreachable without
     hunting for the scrollbar. Pointer events cover mouse, pen and touch, and
     touch already drags natively, so it only takes over once a drag has moved
     far enough to not be a click. */
  function dragScroll(el) {
    let down = false, moved = false, x0 = 0, left0 = 0;
    // velocity carried out of a drag, in px per millisecond
    let vel = 0, lastX = 0, lastT = 0, fling = 0;

    const stopFling = function () {
      if (fling) { cancelAnimationFrame(fling); fling = 0; }
      vel = 0;
    };

    el.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch" || e.button !== 0) return;
      stopFling();
      down = true; moved = false;
      x0 = e.clientX; left0 = el.scrollLeft;
      lastX = e.clientX; lastT = e.timeStamp || Date.now();
    });

    el.addEventListener("pointermove", function (e) {
      if (!down) return;
      const dx = e.clientX - x0;
      if (!moved && Math.abs(dx) < 4) return;
      if (!moved) {
        moved = true;
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
        el.classList.add("is-dragging");
      }
      el.scrollLeft = left0 - dx;

      /* Smoothed rather than instantaneous: a single frame's delta is noisy,
         and a fling thrown from one bad sample either stalls or bolts. */
      const t = e.timeStamp || Date.now();
      const dt = t - lastT;
      if (dt > 0) vel = vel * 0.72 + ((e.clientX - lastX) / dt) * 0.28;
      lastX = e.clientX; lastT = t;

      e.preventDefault();
    });

    /* Let go and the track keeps going, slowing under friction, the way a
       heavy thing on a rail would. Stopping dead at the moment of release
       reads as the page having seized rather than as the drag having ended. */
    const FRICTION = 0.94;      // per 60fps frame
    const MIN_V = 0.02;         // px/ms below which the slide is over

    function slide(prev) {
      return function frame(now) {
        const dt = Math.min(now - prev, 50);
        prev = now;
        const max = el.scrollWidth - el.clientWidth;
        const next = el.scrollLeft - vel * dt;
        if (next <= 0 || next >= max) {      // an edge absorbs the rest of it
          el.scrollLeft = Math.max(0, Math.min(max, next));
          fling = 0; vel = 0;
          return;
        }
        el.scrollLeft = next;
        vel *= Math.pow(FRICTION, dt / 16.667);
        if (Math.abs(vel) < MIN_V) { fling = 0; vel = 0; return; }
        fling = requestAnimationFrame(frame);
      };
    }

    const up = function (e) {
      if (!down) return;
      down = false;
      el.classList.remove("is-dragging");
      try {
        if (moved && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      } catch (err) { /* already released */ }
      // a drag that ended standing still should not throw anything
      const idle = (e.timeStamp || Date.now()) - lastT > 90;
      if (moved && !idle && Math.abs(vel) > MIN_V) {
        fling = requestAnimationFrame(slide(performance.now()));
      } else {
        vel = 0;
      }
    };
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);

    /* A vertical wheel scrolls the track sideways, which is what a mouse user
       reaches for. It hands the gesture back to the page the moment the track
       is against an edge and still being pushed outward, so the timeline
       never traps the scroll.

       Two things keep it from being twitchy. The delta is scaled down, because
       a trackpad throws large deltaY values and this track is only a few
       thousand pixels wide, so raw deltas fly across whole months. And the
       scroll eases toward a target rather than being set outright, so one
       flick glides instead of jumping. */
    const EASE = 0.16, SENS = 0.42;
    let want = null, raf = 0;

    function glide() {
      const max = el.scrollWidth - el.clientWidth;
      want = Math.max(0, Math.min(max, want));
      const step = (want - el.scrollLeft) * EASE;
      if (Math.abs(step) < 0.4) { el.scrollLeft = want; raf = 0; want = null; return; }
      el.scrollLeft += step;
      raf = requestAnimationFrame(glide);
    }

    /* Releasing the gesture the instant the track hits an edge is what made the
       page lurch mid-scroll. A trackpad sends a continuous stream of wheel
       events, so one flick would run the track to its end and then dump the
       remainder of that same flick into the page.

       The track now keeps the gesture until the user stops. Only after a pause
       does a fresh gesture at an edge fall through to the page, so scrolling
       inside the timeline never moves the page underneath it, and getting past
       the timeline is one extra flick rather than a fight. */
    const REST = 220;                   // ms of stillness that ends a gesture
    let lastWheel = 0, owner = null;    // "track" or "page", for this gesture

    /* The element carries data-lenis-prevent, which is the only way to stop
       Lenis scrolling the page from its own document-level wheel listener.
       That is all-or-nothing though: it also means the page cannot be reached
       through this element at all, so once the track is at its end the wheel
       would be trapped here. When the gesture belongs to the page, the page is
       therefore moved by hand. */
    function pageBy(dy) {
      const L = window.MHHSLenis;
      if (L && typeof L.scrollTo === "function") {
        L.scrollTo(window.scrollY + dy, { immediate: true });
      } else {
        window.scrollBy(0, dy);
      }
    }

    el.addEventListener("wheel", function (e) {
      if (!e.deltaY || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;

      const t = e.timeStamp || Date.now();
      if (t - lastWheel > REST) owner = null;   // a pause starts a new gesture
      lastWheel = t;

      /* Ownership is decided once, at the start of a gesture, and held for the
         rest of it. Deciding per event is what made the page lurch: a single
         flick would run the track to its end and then spend its remainder on
         the page. Measured against where the easing is HEADING, not where it
         has got to, or a fast flick hands over early. */
      if (owner === null) {
        const at = want === null ? el.scrollLeft : want;
        const room = (e.deltaY < 0 && at > 0) || (e.deltaY > 0 && at < max - 1);
        owner = room ? "track" : "page";
      }

      e.preventDefault();

      if (owner === "page") { pageBy(e.deltaY); return; }

      stopFling();                      // a wheel takes over from a slide
      if (want === null) want = el.scrollLeft;
      want = Math.max(0, Math.min(max, want + e.deltaY * SENS));
      if (!raf) raf = requestAnimationFrame(glide);
    }, { passive: false });

    // a drag or a scrollbar grab takes over from an easing wheel gesture
    el.addEventListener("pointerdown", function () {
      if (raf) { cancelAnimationFrame(raf); raf = 0; want = null; }
    });
  }

  function renderSeason() {
    const host = $("[data-render-season]");
    if (!host || !D.calendar || !D.calendar.length) return;

    const DAY = 86400000;
    const PX_PER_DAY = 16;        // the whole season comes to roughly 5300px
    const EDGE = 120;             // breathing room at both ends of the track
    const MIN_GAP = 300;          // px between two cards on the SAME side

    const rows = D.calendar
      .map(function (e) {
        return { e: e, d: new Date(e.date + "T00:00:00"),
                 end: e.span ? new Date(e.span + "T00:00:00") : null };
      })
      .sort(function (a, b) { return a.d - b.d; });

    const first = rows[0].d.getTime();
    const now = Date.now();

    // place each card, then push it right if its same-side neighbour is close
    const lastOnSide = [-Infinity, -Infinity];
    rows.forEach(function (r, i) {
      r.side = i % 2;                       // 0 above the rail, 1 below
      let x = EDGE + ((r.d.getTime() - first) / DAY) * PX_PER_DAY;
      if (x - lastOnSide[r.side] < MIN_GAP) x = lastOnSide[r.side] + MIN_GAP;
      lastOnSide[r.side] = x;
      r.x = x;
      r.past = (r.end || r.d).getTime() + DAY < now;
    });

    const width = Math.max.apply(null, rows.map((r) => r.x)) + EDGE;

    /* A month scale along the rail. Without it an empty stretch is just empty
       space with nothing to measure it against, so the track reads as a row
       of cards rather than as a year. With it you can see that nothing at all
       happens in October, and how far February is from April. */
    const months = [];
    const m0 = new Date(rows[0].d.getFullYear(), rows[0].d.getMonth(), 1);
    const mEnd = rows[rows.length - 1].end || rows[rows.length - 1].d;
    for (let m = new Date(m0); m <= mEnd; m.setMonth(m.getMonth() + 1)) {
      const x = EDGE + ((m.getTime() - first) / DAY) * PX_PER_DAY;
      if (x < 0 || x > width) continue;
      months.push({ x: x, label: MONTHS[m.getMonth()],
                    year: m.getMonth() === 0 || months.length === 0 ? m.getFullYear() : null });
    }
    const todayX = EDGE + ((now - first) / DAY) * PX_PER_DAY;
    const done = Math.max(0, Math.min(width, todayX));

    const when = function (r) {
      const d = r.d;
      if (!r.end) return MONTHS[d.getMonth()] + " " + d.getDate();
      const same = r.end.getMonth() === d.getMonth();
      return MONTHS[d.getMonth()] + " " + d.getDate() + "\u2013" +
             (same ? "" : MONTHS[r.end.getMonth()] + " ") + r.end.getDate();
    };

    host.innerHTML =
      '<div class="season__track" style="--w:' + Math.round(width) + 'px">' +
        '<div class="season__rail"><span class="season__done" style="width:' +
          Math.round(done) + 'px"></span></div>' +
        '<div class="season__scale">' +
          months.map(function (m) {
            return '<span class="season__month" style="--x:' + Math.round(m.x) + 'px">' +
                   esc(m.label) + (m.year ? "<b>" + m.year + "</b>" : "") + "</span>";
          }).join("") +
        "</div>" +
        (todayX > 0 && todayX < width
          ? '<div class="season__today" style="--x:' + Math.round(todayX) +
            'px"><span>Today</span></div>' : "") +
        rows.map(function (r) {
          const e = r.e;
          return '<article class="season__stop season__stop--' +
                 (r.side ? "down" : "up") + (r.past ? " is-past" : "") +
                 '" style="--x:' + Math.round(r.x) + 'px">' +
                   '<span class="season__dot"></span>' +
                   '<div class="season__card">' +
                     '<p class="season__when">' + esc(when(r)) +
                       "<b>" + r.d.getFullYear() + "</b></p>" +
                     '<h3 class="season__title">' + esc(e.title) + "</h3>" +
                     (e.provisional
                       ? '<span class="season__tbd">date to be confirmed</span>' : "") +
                     '<p class="season__note">' + esc(e.note || "") + "</p>" +
                     '<p class="season__kind">' + esc(e.kind || "") + "</p>" +
                   "</div>" +
                 "</article>";
        }).join("") +
      "</div>";

    /* Open on where the season actually is rather than at last August, so the
       first thing on screen is the next thing that happens. */
    dragScroll(host);

    const next = rows.filter((r) => !r.past)[0];
    if (next) {
      const to = Math.max(0, next.x - host.clientWidth / 2);
      if (host.scrollWidth > host.clientWidth) host.scrollLeft = to;
    }
  }

  /* ------------------------------------------------------------ countdown */
  /* Counts down to the next entry on the calendar that is not provisional.
     Provisional dates are ones the chapter can still move, so they are
     skipped deliberately: this only ever shows a published date, and it
     advances to the next conference on its own once one passes. */
  function renderCountdown() {
    const host = $("[data-render-countdown]");
    if (!host) return;

    const now = new Date();
    let target = D.calendar
      .filter((e) => !e.provisional)
      .map((e) => ({ e: e, d: new Date(e.date + "T00:00:00") }))
      .filter((r) => r.d > now)
      .sort((a, b) => a.d - b.d)[0];

    // Take the whole band with it, or an empty bordered strip is left behind.
    const drop = () => (host.closest(".countdown") || host).remove();

    /* Past the last date of the season, count to the start of the next one.
       chapter.nextSeason is a placeholder MM-DD that recurs every year, so the
       band keeps working through the summer without anyone editing it, and
       keeps working in the year after that too. */
    if (!target && D.chapter.nextSeason) {
      const parts = D.chapter.nextSeason.split("-").map(Number);
      let d = new Date(now.getFullYear(), parts[0] - 1, parts[1]);
      if (d <= now) d = new Date(now.getFullYear() + 1, parts[0] - 1, parts[1]);
      target = {
        d: d,
        rail: "the next season",
        eyebrow: "Countdown &nbsp;&#10095;&nbsp; next season",
        e: { title: "The " + d.getFullYear() + "\u2013" + (d.getFullYear() + 1) + " season",
             kind: "Placeholder date, to be set by the officer team" }
      };
    }

    if (!target) { drop(); return; }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const UNITS = [
      { key: "days",    label: "Days",    pad: 3 },
      { key: "hours",   label: "Hours",   pad: 2 },
      { key: "minutes", label: "Minutes", pad: 2 },
      { key: "seconds", label: "Seconds", pad: 2 }
    ];

    host.innerHTML = '' +
      '<div class="countdown__head" data-reveal>' +
        '<p class="eyebrow">' +
          (target.eyebrow || "Countdown &nbsp;&#10095;&nbsp; next confirmed date") + "</p>" +
        '<h2 class="countdown__title">' + esc(target.e.title) + "</h2>" +
        '<p class="countdown__where">' +
          MONTHS[target.d.getMonth()] + " " + target.d.getDate() + ", " + target.d.getFullYear() +
          " &nbsp;&#10095;&nbsp; " + esc(target.e.kind) +
        "</p>" +
      "</div>" +
      '<div class="cd" role="timer" aria-live="off">' +
        UNITS.map(function (u, i) {
          return (i ? '<span class="cd__sep">&#10095;</span>' : "") +
            '<div class="cd__unit">' +
              '<div class="cd__digits" data-unit="' + u.key + '"></div>' +
              '<span class="cd__label">' + u.label + "</span>" +
            "</div>";
        }).join("") +
      "</div>" +
      '<p class="visually-hidden" data-cd-sr aria-live="polite"></p>' +
      '<div class="cd__rail"><b></b><span></span></div>';

    const fields = {};
    UNITS.forEach(function (u) { fields[u.key] = $('[data-unit="' + u.key + '"]', host); });
    const rail   = $(".cd__rail b", host);
    const railTx = $(".cd__rail span", host);
    const sr     = $("[data-cd-sr]", host);

    /* The roll only animates while the band is actually on screen. Off screen
       (including the whole time it sits below the intro) the animations
       never get painted, so they never finish and never fire animationend to
       clean up after themselves. Away from the viewport the digits therefore
       update silently, which is also the correct thing to do for a section
       nobody is looking at. */
    function onScreen() {
      const r = host.getBoundingClientRect();
      const h = window.innerHeight || document.documentElement.clientHeight;
      return r.bottom > -120 && r.top < h + 120;
    }

    /* Swap a run of digits, animating only the ones that actually changed. */
    function paint(wrap, str, live) {

      while (wrap.children.length < str.length) {
        const cell = document.createElement("span");
        cell.className = "cd__digit";
        cell.appendChild(document.createElement("i"));
        wrap.appendChild(cell);
      }
      while (wrap.children.length > str.length) wrap.lastChild.remove();

      Array.from(wrap.children).forEach(function (cell, i) {
        const ch = str[i];
        const cur = cell.querySelector("i:not(.is-out)");
        if (cur && cur.textContent === ch) return;

        // First render has no previous numeral to roll away, so fill it
        // directly rather than rolling in from a blank cell.
        if (!live || (cur && cur.textContent === "")) {
          cell.querySelectorAll("i.is-out").forEach((old) => old.remove());
          if (cur) cur.textContent = ch;
          return;
        }

        // In a backgrounded tab animationend may never fire, so sweep any
        // leftovers here rather than relying on that listener alone.
        cell.querySelectorAll("i.is-out").forEach((old) => old.remove());

        if (cur) {
          // Replace the class outright. Keeping is-in alongside is-out would
          // leave both rules matching at equal specificity, the animation name
          // would never change, and so it would never restart or finish.
          cur.className = "is-out";
          cur.addEventListener("animationend", function () { cur.remove(); }, { once: true });
        }
        const next = document.createElement("i");
        next.className = "is-in";
        next.textContent = ch;
        cell.appendChild(next);
      });
    }

    /* The bar runs from the season's first date to the COUNTDOWN TARGET, so it
       empties and refills for each date in turn. It is the approach to the next
       thing, not progress through the year, and the caption below has to say so:
       labelled "% through the season" it claimed the season was 85% gone during
       its first month. */
    const stamps = D.calendar.map((e) => new Date(e.date + "T00:00:00"));
    // counting to the next season, the run-up starts when this one ended
    const first = target.rail
      ? D.calendar.map((e) => new Date((e.span || e.date) + "T00:00:00"))
          .sort((a, b) => b - a)[0]
      : stamps.slice().sort((a, b) => a - b)[0];
    const span = target.d - first;

    let lastDays = null;

    function tick() {
      const left = target.d - new Date();
      /* The date has arrived. Rebuild rather than remove: renderCountdown
         picks the next confirmed date every time it runs, so the band rolls
         straight on to it. Removing it, which is what this used to do, meant
         a page left open across a date lost its countdown until a reload,
         even though there were months of season still to come. The rebuild
         drops the band only when there genuinely is no next date. */
      if (left <= 0) {
        window.clearInterval(timer);
        host.innerHTML = "";
        renderCountdown();
        return;
      }

      const secs = Math.floor(left / 1000);
      const v = {
        days:    Math.floor(secs / 86400),
        hours:   Math.floor(secs / 3600) % 24,
        minutes: Math.floor(secs / 60) % 60,
        seconds: secs % 60
      };

      const live = !reduced && onScreen();
      UNITS.forEach(function (u) {
        paint(fields[u.key], String(v[u.key]).padStart(u.pad, "0"), live);
      });

      if (v.days !== lastDays) {
        lastDays = v.days;
        sr.textContent = v.days + " days until " + target.e.title;
        const done = span > 0 ? Math.min(1, Math.max(0, (new Date() - first) / span)) : 0;
        rail.style.width = (done * 100).toFixed(2) + "%";
        // Before the first date the bar is legitimately empty; say why rather
        // than showing a bare "0%", which reads as broken.
        railTx.textContent = new Date() < first
          ? "Season opens " + MONTHS[first.getMonth()] + " " + first.getDate()
          : Math.round(done * 100) + "% of the way to " +
            (target.rail || target.e.title);
      }
    }

    tick();
    const timer = window.setInterval(tick, 1000);
  }

  /* ------------------------------------------------------------ boot */
  function init() {
    nav();
    renderPeople();
    renderRoster();
    renderCommittees();
    renderEvents();
    renderRecognition();
    officersCta();
    renderStory();
    renderSeason();
    renderCountdown();
    renderMeetings();
    renderSpotlights();
    renderGallery();
    renderFaqs();
    renderFormLinks();
    renderSocials();
    renderCollage();
    renderSurfer();
    tracker();
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
