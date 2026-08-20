/* ==========================================================================
   MHHS SkillsUSA — motion
   --------------------------------------------------------------------------
   Lenis smooth scroll (loaded from CDN, entirely optional — the site works
   without it), scroll reveals, the pinned collage, the 3D card surfer, and
   the masthead behaviour.
   ========================================================================== */

(function () {
  "use strict";

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------ lenis */
  function initLenis() {
    if (reduced || typeof window.Lenis !== "function") return null;
    const lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.MHHSLenis = lenis;
    // the intro locks the page; don't let Lenis fight it
    if (document.body.classList.contains("is-gated")) lenis.stop();
    return lenis;
  }

  /* ------------------------------------------------------------ reveals */
  function reveals() {
    const items = $$("[data-reveal], [data-lines]");
    if (!items.length) return;
    if (!("IntersectionObserver" in window) || reduced) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach((el) => io.observe(el));
  }

  function stagger() {
    $$("[data-stagger]").forEach(function (group) {
      const step = parseInt(group.dataset.stagger, 10) || 60;
      Array.from(group.children).forEach(function (child, i) {
        if (!child.hasAttribute("data-reveal")) child.setAttribute("data-reveal", "");
        child.style.setProperty("--delay", Math.min(i, 8) * step + "ms");
      });
    });
  }

  // Split a heading into lines that rise into place. Re-splits on resize so
  // the mask always matches where the text actually wraps.
  function splitLines() {
    const targets = $$("[data-lines]");
    if (!targets.length || reduced) return;

    targets.forEach(function (el) {
      if (!el.dataset.original) el.dataset.original = el.textContent.trim();
    });

    function build() {
      targets.forEach(function (el) {
        const text = el.dataset.original;
        const words = text.split(/\s+/);
        el.textContent = "";
        const probe = document.createElement("span");
        probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap";
        // measure by laying words out and watching offsetTop change
        const holder = document.createElement("span");
        words.forEach(function (w, i) {
          const s = document.createElement("span");
          s.textContent = w + (i < words.length - 1 ? " " : "");
          s.style.display = "inline-block";
          holder.appendChild(s);
        });
        el.appendChild(holder);
        const spans = Array.from(holder.children);
        const rows = [];
        let currentTop = null;
        spans.forEach(function (s) {
          const top = s.offsetTop;
          if (currentTop === null || Math.abs(top - currentTop) > 2) {
            currentTop = top;
            rows.push([]);
          }
          rows[rows.length - 1].push(s.textContent);
        });
        el.textContent = "";
        rows.forEach(function (words, i) {
          const line = document.createElement("span");
          line.className = "line";
          const inner = document.createElement("span");
          inner.textContent = words.join("");
          inner.style.setProperty("--delay", i * 90 + "ms");
          line.appendChild(inner);
          el.appendChild(line);
        });
        probe.remove();
      });
    }

    build();
    let t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(function () {
        targets.forEach((el) => el.classList.remove("is-in"));
        build();
        targets.forEach((el) => el.classList.add("is-in"));
      }, 250);
    });
  }

  /* ------------------------------------------------------------ rail */
  function rail() {
    const rows = $$(".rail > li");
    if (!rows.length) return;
    if (!("IntersectionObserver" in window) || reduced) {
      rows.forEach((r) => r.classList.add("is-lit"));
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-lit");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -30% 0px", threshold: 0.2 });
    rows.forEach((r) => io.observe(r));
  }

  /* ------------------------------------------------------------ masthead */
  function masthead() {
    const mast = $(".masthead");
    if (!mast) return;
    let last = window.scrollY;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      mast.classList.toggle("is-solid", y > 40);
      // hide going down, reveal going up — but never while a menu is open
      const menuOpen = $("#site-nav") && $("#site-nav").classList.contains("is-open");
      if (!menuOpen) {
        mast.classList.toggle("is-hidden", y > 320 && y > last + 4);
      }
      last = y;
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------ surfer
     A track of cards laid out along a receding 3D diagonal. Scrolling the
     section slides the whole track past a fixed camera; the pointer pulls
     nearby cards forward. */
  function surfer() {
    const root = $(".surfer");
    if (!root) return;

    const track = $(".surfer__track", root);
    const rail  = $(".surfer__rail", root);
    const cards = $$(".surfer__card", root);
    if (!track || !cards.length) return;

    const mobile = () => window.innerWidth < 861;
    let stepX = 240, stepY = -84, stepZ = -288;

    function layout() {
      if (mobile()) { stepX = 170; stepY = -60; stepZ = -210; }
      else          { stepX = 240; stepY = -84; stepZ = -288; }
      cards.forEach(function (c, i) {
        c.dataset.bx = i * stepX;
        c.dataset.by = i * stepY;
        c.dataset.bz = i * stepZ;
      });
    }

    let pointerX = -99999, pointerY = -99999;
    const scale = new Array(cards.length).fill(1);

    function draw() {
      const rect = rail.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      let p = total > 0 ? (-rect.top) / total : 0;
      p = Math.min(Math.max(p, 0), 1);

      const span = (cards.length - 1);
      track.style.transform =
        "translate3d(" + (-p * span * stepX) + "px," +
                          (-p * span * stepY) + "px," +
                          (-p * span * stepZ) + "px)";

      cards.forEach(function (c, i) {
        let target = 1;
        if (!reduced && pointerX > -9999) {
          const r = c.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const d = Math.hypot(pointerX - cx, pointerY - cy);
          target = d < 420 ? 1 + (1 - d / 420) * 0.42 : 1;
        }
        scale[i] += (target - scale[i]) * 0.12;
        c.style.transform =
          "translate3d(" + c.dataset.bx + "px," + c.dataset.by + "px," + c.dataset.bz + "px) " +
          "rotateY(-50deg) scale(" + scale[i].toFixed(3) + ")";
      });

      requestAnimationFrame(draw);
    }

    // The magnetic pull is a cursor gesture. On touch it would fire mid-swipe
    // and fight the scroll, so it stays off and the track is driven by scroll
    // alone — which is how it moves on every device anyway.
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (finePointer) {
      root.addEventListener("pointermove", function (e) {
        pointerX = e.clientX; pointerY = e.clientY;
      });
      root.addEventListener("pointerleave", function () {
        pointerX = -99999; pointerY = -99999;
      });
    } else {
      const hint = $(".surfer__hint", root);
      if (hint) hint.textContent = "Scroll to travel";
    }
    window.addEventListener("resize", layout);

    layout();
    requestAnimationFrame(draw);
  }

  /* ------------------------------------------------------------ cinematic list
     Desktop opens a row on hover. Touch devices have no hover, so the row
     nearest the middle of the screen opens itself as you scroll — the same
     reveal, driven by position instead of a cursor. */
  function cineTouch() {
    const rows = $$(".cine__row");
    if (!rows.length) return;
    if (window.matchMedia("(hover: hover) and (min-width: 861px)").matches) return;

    let ticking = false;

    function update() {
      const mid = window.innerHeight * 0.5;
      let best = null, bestDist = Infinity;
      rows.forEach(function (r) {
        const b = r.getBoundingClientRect();
        if (b.bottom < 0 || b.top > window.innerHeight) return;
        const d = Math.abs(b.top + b.height / 2 - mid);
        if (d < bestDist) { bestDist = d; best = r; }
      });
      rows.forEach(function (r) { r.classList.toggle("is-active", r === best); });
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ------------------------------------------------------------ wordmark */
  // Scale the chapter lockup so it spans the full viewport width exactly,
  // the way a masthead should, at any screen size.
  function fitWordmark() {
    const marks = $$(".wordmark__type");
    if (!marks.length) return;

    function fit() {
      marks.forEach(function (el) {
        const parent = el.parentElement;
        const pad = parseFloat(getComputedStyle(el).paddingLeft) * 2;
        const avail = parent.clientWidth - pad;
        if (avail <= 0) return;
        // measure at a known size, then scale by ratio
        el.style.fontSize = "100px";
        const natural = el.scrollWidth - pad;
        if (!natural) return;
        el.style.fontSize = Math.floor((avail / natural) * 100) + "px";
      });
    }

    fit();
    // refit once webfonts land, since metrics change
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    let t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(fit, 120);
    });
  }

  /* ------------------------------------------------------------ marquee */
  // duplicate the strip so the loop has something to scroll into
  function marquee() {
    $$(".marquee__track").forEach(function (t) {
      if (t.children.length === 1) t.appendChild(t.firstElementChild.cloneNode(true));
    });
  }

  /* ------------------------------------------------------------ boot */
  function init() {
    initLenis();
    fitWordmark();
    cineTouch();
    marquee();
    stagger();
    splitLines();
    reveals();
    rail();
    masthead();
    surfer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
