/* ==========================================================================
   MHHS SkillsUSA — the intro
   --------------------------------------------------------------------------
   A portrait frame sits in the middle of a darkened plate. Scrolling expands
   the frame into a wide plate while the wordmark splits apart and leaves. When
   the frame is fully open, the page below unlocks.

   The frame currently holds generated plates rather than photographs, because
   the chapter has not competed yet. Nothing here is stock imagery. The montage
   also supports <video> layers — drop clips into assets/video/ and add them as
   .mont__layer children in index.html when the chapter has its own footage.
   ========================================================================== */

(function () {
  "use strict";

  const intro = document.getElementById("intro");
  if (!intro) return;

  // tells the inline failsafe in the page that this script is alive
  window.__introReady = true;

  const frame   = intro.querySelector(".intro__frame");
  const bg      = intro.querySelector(".intro__bg");
  const wordA   = intro.querySelector(".intro__word--a");
  const wordB   = intro.querySelector(".intro__word--b");
  const meta    = intro.querySelector(".intro__meta");
  const skipBtn = intro.querySelector(".intro__skip");
  const layers  = Array.from(intro.querySelectorAll(".mont__layer"));

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seen = sessionStorage.getItem("mhhs-intro-seen") === "1";

  let progress = 0;
  let open = false;
  let touchY = 0;

  /* ------------------------------------------------------------ montage */
  let montIndex = 0;
  let montTimer = null;

  function showLayer(i) {
    layers.forEach(function (l, n) {
      const on = n === i;
      l.classList.toggle("is-on", on);
      const vid = l.querySelector("video");
      if (!vid) return;
      if (on) {
        vid.currentTime = 0;
        const p = vid.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        vid.pause();
      }
    });
    // restart the Ken Burns pass on the newly visible still
    const img = layers[i] && layers[i].querySelector("img");
    if (img) {
      img.style.animation = "none";
      void img.offsetWidth;
      img.style.animation = "";
    }
  }

  function startMontage() {
    if (!layers.length) return;
    showLayer(0);
    if (reduced) return;
    montTimer = setInterval(function () {
      montIndex = (montIndex + 1) % layers.length;
      showLayer(montIndex);
    }, 4200);
  }

  /* ------------------------------------------------------------ sizing */
  function apply() {
    const mobile = window.innerWidth < 768;
    const w = 300 + progress * (mobile ? 620 : 1240);
    const h = 400 + progress * (mobile ? 210 : 420);
    const shift = progress * (mobile ? 85 : 70);

    frame.style.width  = w + "px";
    frame.style.height = h + "px";
    bg.style.opacity   = String(1 - progress);

    wordA.style.transform = "translateX(-" + shift + "vw)";
    wordB.style.transform = "translateX(" + shift + "vw)";

    // the corner labels fade as the plate takes over
    meta.style.opacity = String(Math.max(0, 1 - progress * 1.6));
  }

  function setOpen(next) {
    if (next === open) return;
    open = next;
    document.body.classList.toggle("is-gated", !open);
    document.documentElement.classList.toggle("intro-open", open);
    const mast = document.querySelector(".masthead");
    if (mast) mast.classList.toggle("is-gated", !open);
    if (open) {
      sessionStorage.setItem("mhhs-intro-seen", "1");
      if (window.MHHSLenis) window.MHHSLenis.start();
      window.dispatchEvent(new Event("mhhs:intro-open"));
    } else if (window.MHHSLenis) {
      window.MHHSLenis.stop();
    }
  }

  function setProgress(v) {
    progress = Math.min(Math.max(v, 0), 1);
    apply();
    if (progress >= 1) setOpen(true);
    else if (progress < 0.92) setOpen(false);
  }

  /* ------------------------------------------------------------ input */
  function onWheel(e) {
    if (open) {
      // let the user scroll back up into the intro from the very top
      if (e.deltaY < 0 && window.scrollY <= 4) {
        e.preventDefault();
        setProgress(progress - 0.05);
      }
      return;
    }
    e.preventDefault();
    setProgress(progress + e.deltaY * 0.0011);
  }

  function onTouchStart(e) { touchY = e.touches[0].clientY; }

  function onTouchMove(e) {
    if (!touchY) return;
    const y = e.touches[0].clientY;
    const dy = touchY - y;
    if (open) {
      if (dy < -18 && window.scrollY <= 4) {
        e.preventDefault();
        setProgress(progress - 0.06);
        touchY = y;
      }
      return;
    }
    e.preventDefault();
    setProgress(progress + dy * (dy < 0 ? 0.0075 : 0.005));
    touchY = y;
  }

  function onTouchEnd() { touchY = 0; }

  function onScroll() { if (!open) window.scrollTo(0, 0); }

  function onKey(e) {
    if (open) return;
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      finish();
    } else if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      setProgress(progress + 0.2);
    }
  }

  // Time-based rather than frame-counted, so a throttled tab still lands on
  // a fully open intro, and a hard timer guarantees it completes regardless.
  function finish() {
    const from = progress;
    const start = (window.performance || Date).now();
    const dur = 850;
    let raf = 0;

    const step = function (now) {
      const k = Math.min(1, ((now || (window.performance || Date).now()) - start) / dur);
      setProgress(from + (1 - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    setTimeout(function () {
      if (raf) cancelAnimationFrame(raf);
      setProgress(1);
    }, dur + 250);
  }

  /* ------------------------------------------------------------ boot */
  startMontage();

  if (reduced || seen) {
    setProgress(1);
  } else {
    setProgress(0);
    setOpen(false);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("scroll", onScroll);
    window.addEventListener("keydown", onKey);
  }

  if (skipBtn) skipBtn.addEventListener("click", finish);

  window.addEventListener("resize", apply);

  // Never leave someone stranded: if the frame has not opened after a while
  // and no input has arrived, open it.
  setTimeout(function () { if (!open && progress === 0) finish(); }, 22000);

  window.addEventListener("pagehide", function () {
    if (montTimer) clearInterval(montTimer);
  });
})();
