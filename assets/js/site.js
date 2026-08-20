/* ==========================================================================
   MHHS SkillsUSA — site behaviour
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
          '<img src="' + D.art.person(p.slug) + '" alt="' + esc(p.name) + '" loading="lazy" width="760" height="760">' +
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
    // A page can hold more than one container — mandated and optional are
    // rendered into separate bands on the competitive events page.
    $$("[data-render-events]").forEach(renderEventsInto);
  }

  function renderEventsInto(host) {
    const only = host.dataset.renderEvents; // "open" | "eligibility" | ""
    const cats = D.eventCategories.filter((c) => !only || c.kind === only);

    host.innerHTML = cats.map(function (c) {
      return '' +
        '<section class="evt-cat" id="' + esc(c.id) + '" data-reveal>' +
          '<div class="evt-cat__head">' +
            "<div>" +
              '<span class="tag tag--' + (c.kind === "eligibility" ? "required" : "optional") + '">' +
                (c.kind === "eligibility" ? "Programme eligibility required"
                                          : "Open to all members") + "</span>" +
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

    const atc = $("[data-render-atc]");
    if (atc) {
      atc.innerHTML = D.atcEvents.map((n, i) =>
        '<article class="evt"><p class="evt__n">' + String(i + 1).padStart(2, "0") + "</p>" +
        '<h4 class="evt__name" style="font-family:var(--body);font-size:1rem;font-weight:400;' +
        'line-height:1.6">' + esc(n) + "</h4></article>"
      ).join("");
    }
  }

  /* ------------------------------------------------------------ calendar */
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  function renderCalendar() {
    const host = $("[data-render-calendar]");
    if (!host) return;
    const limit = parseInt(host.dataset.renderCalendar, 10) || 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const rows = D.calendar
      .map(function (e) {
        const d = new Date(e.date + "T00:00:00");
        return { e: e, d: d, past: d < today };
      })
      .sort(function (a, b) {
        if (a.past !== b.past) return a.past ? 1 : -1;
        return a.past ? b.d - a.d : a.d - b.d;
      });

    const shown = limit ? rows.slice(0, limit) : rows;

    host.innerHTML = shown.map(function (r) {
      const days = Math.round((r.d - today) / 86400000);
      const plural = (n, word) => n + " " + word + (n === 1 ? "" : "s");
      let when;
      if (r.past) when = "Past";
      else if (days === 0) when = "Today";
      else if (days === 1) when = "Tomorrow";
      else if (days < 14) when = "In " + plural(days, "day");
      else if (days < 60) when = "In " + plural(Math.round(days / 7), "week");
      else when = "In " + plural(Math.round(days / 30), "month");

      return '' +
        '<article class="up' + (r.past ? " is-past" : "") + '">' +
          '<p class="up__date">' + MONTHS[r.d.getMonth()] + " <b>" + r.d.getDate() + "</b> " + r.d.getFullYear() + "</p>" +
          "<div>" +
            '<h3 class="up__title">' + esc(r.e.title) +
              (r.e.provisional ? ' <span class="tag">Date to be confirmed</span>' : "") + "</h3>" +
            '<p class="up__note">' + esc(r.e.note) + "</p>" +
          "</div>" +
          '<p class="up__when">' + esc(r.e.kind) + " · " + when + "</p>" +
        "</article>";
    }).join("");
  }

  function renderCalendarEmbed() {
    const host = $("[data-render-cal-embed]");
    if (!host) return;
    const url = D.chapter.calendarEmbed;
    if (url) {
      host.innerHTML = '<div class="cal-embed"><iframe src="' + esc(url) +
        '" title="MHHS SkillsUSA chapter calendar" loading="lazy"></iframe></div>';
    } else {
      host.innerHTML = '' +
        '<div class="tbd">' +
          '<p class="tbd__label">Coming soon</p>' +
          "<h3>The live chapter calendar is being set up</h3>" +
          "<p>Once the shared Google Calendar is published, it appears here and updates itself — " +
          "every meeting, deadline and conference, in real time. Until then, the dates below are " +
          "maintained by the officer team.</p>" +
        "</div>";
    }
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
          "<p>Every few weeks we feature a member who showed up for someone else — a competitor who " +
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
  function renderFormLinks() {
    $$("[data-form]").forEach(function (el) {
      const key = el.dataset.form;
      const f = D.chapter.forms[key];
      if (!f) return;
      if (f.url) {
        el.outerHTML = '<a class="btn" href="' + esc(f.url) + '" target="_blank" rel="noopener">' +
                       esc(el.dataset.label || f.label) + "</a>";
      } else {
        el.outerHTML = '<span class="btn btn--ghost" aria-disabled="true" ' +
                       'title="This form has not opened yet">' +
                       esc(el.dataset.label || f.label) + " — TBD</span>";
      }
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
          "<span>" + esc(s.handle) + (live ? "" : " — TBD") + "</span>" +
          "</" + (live ? "a" : "span") + ">";
      }).join("");
    });
  }

  /* ------------------------------------------------------------ tracker */
  // A private, browser-local log that mirrors the chapter's official tracking
  // template. Nothing is submitted from here — export the CSV and paste it
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
  // publish hour requirements for these programmes — the officer team picks
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
                         "Add your first one above — it stays in this browser only.</td></tr>";
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

  /* ------------------------------------------------- cinematic list
     Each competitive event category becomes a row that opens on hover to
     reveal a photograph of that kind of event actually happening. */
  const ARROW =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function renderCine() {
    const host = $("[data-render-cine]");
    if (!host) return;
    host.innerHTML = D.eventCategories.map(function (c, i) {
      const art = D.media.cine[c.id] || D.gallery[0].slug;
      const n = String(i + 1).padStart(2, "0");
      return '' +
        '<a class="cine__row" href="competitive-events.html#' + esc(c.id) + '">' +
          '<span class="cine__media">' +
            '<img src="' + D.art.photo(art) + '" alt="" loading="lazy" aria-hidden="true">' +
          "</span>" +
          '<span class="cine__inner">' +
            '<span class="cine__left">' +
              '<span class="cine__n">' + n + "</span>" +
              "<span>" +
                '<h3 class="cine__title">' + esc(c.name) + "</h3>" +
                '<span class="cine__sub">' +
                  (c.kind === "eligibility" ? "Programme eligibility required"
                                            : "Open to all members") +
                "</span>" +
              "</span>" +
            "</span>" +
            '<span class="cine__right">' +
              '<span class="cine__count">' + c.events.length + " events</span>" +
              '<span class="cine__arrow">' + ARROW + "</span>" +
            "</span>" +
          "</span>" +
        "</a>";
    }).join("");
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

  /* ------------------------------------------------------------ boot */
  function init() {
    nav();
    renderPeople();
    renderCommittees();
    renderEvents();
    renderRecognition();
    renderCalendar();
    renderCalendarEmbed();
    renderMeetings();
    renderSpotlights();
    renderGallery();
    renderFaqs();
    renderFormLinks();
    renderSocials();
    renderCine();
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
