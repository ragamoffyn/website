/* =================================================================
   Michael Stiso — Portfolio · DESIGN VARIANT
   Vanilla JS for index-variant.html only:
     · top bar that hides on scroll down and returns on scroll up
     · mobile menu, scroll-spy
     · horizontal work-history chart: click-to-pin, edge flipping,
       and the show-all-details toggle
   Everything degrades to a working page without it.
   ================================================================= */

(function () {
  'use strict';

  /* ---- Portrait fallback ----
     The hero expects portrait.jpg in the repo root. Until it is there,
     show the "MS" block instead of a broken image. */
  var heroImg = document.getElementById('hero-img');
  if (heroImg) {
    var markMissing = function () { heroImg.parentNode.classList.add('no-img'); };
    heroImg.addEventListener('error', markMissing);
    if (heroImg.complete && heroImg.naturalWidth === 0) { markMissing(); }
  }

  /* ---- Top bar: hide on scroll down, show on scroll up ---- */
  var topbar = document.getElementById('topbar');
  var navToggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('topbar-nav');

  if (topbar) {
    var lastY = window.pageYOffset;
    var ticking = false;
    var THRESHOLD = 6;      // ignore sub-pixel jitter and trackpad noise
    var REVEAL_AT = 90;     // always visible near the top of the page

    var onScroll = function () {
      var y = Math.max(0, window.pageYOffset);
      var delta = y - lastY;

      if (Math.abs(delta) > THRESHOLD) {
        if (delta > 0 && y > REVEAL_AT && !(nav && nav.classList.contains('open'))) {
          topbar.classList.add('hidden');
        } else if (delta < 0) {
          topbar.classList.remove('hidden');
        }
        lastY = y;
      }
      if (y <= REVEAL_AT) { topbar.classList.remove('hidden'); }
      ticking = false;
    };

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(onScroll);
      }
    }, { passive: true });
  }

  /* ---- Mobile menu ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.rail-link'));

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && topbar) { topbar.classList.remove('hidden'); }
    });
  }
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        if (navToggle) { navToggle.setAttribute('aria-expanded', 'false'); }
      }
    });
  });

  /* ---- Work-history chart ----
     CSS already handles hover and focus balloons; this adds click-to-pin,
     flipping balloons that would leave the chart, and deciding which
     employer names actually fit inside their segment. */
  var wg = document.getElementById('wg');
  if (wg) {
    var chart = wg.querySelector('.wg-chart');
    var units = Array.prototype.slice.call(wg.querySelectorAll('.wg-unit'));

    /* A name only stays inside its segment if the segment is wide enough
       to hold it; the rest drop into the callout lane below the line,
       alternating between two lanes so consecutive callouts cannot
       collide. Re-run on resize, since the segments are percentages. */
    function placeNames () {
      var rows = Array.prototype.slice.call(wg.querySelectorAll('.wg-row'));
      rows.forEach(function (row) {
        var segs = Array.prototype.slice.call(row.querySelectorAll('.wg-seg'));
        var out = [];

        // Which names overflow the segment they belong to?
        segs.forEach(function (seg) {
          var item = seg.querySelector('.wg-item');
          if (!item) { return; }
          seg.classList.remove('out', 'lane2', 'out-end');
          if (item.scrollWidth > item.clientWidth + 1) {
            seg.classList.add('out');
            out.push(seg);
          }
        });

        /* Callouts alternate between two lanes so consecutive ones cannot
           collide. The leftmost takes the deeper lane: a long leader on a
           callout to the right would otherwise cross the text of the one
           beside it. A lone callout always sits in the shallow lane. */
        out.forEach(function (seg, i) {
          if (out.length > 1 && i % 2 === 0) { seg.classList.add('lane2'); }
          // Keep the callout inside the chart at the end of the axis
          var item = seg.querySelector('.wg-item');
          if (chart && item.getBoundingClientRect().right > chart.getBoundingClientRect().right) {
            seg.classList.add('out-end');
          }
        });

        row.classList.toggle('has-out', out.length > 0);
        row.classList.toggle('has-lane2', out.length > 1);
      });
    }

    placeNames();
    window.addEventListener('resize', placeNames);
    // Web fonts land after first paint and change every measurement
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(placeNames); }

    function placeBalloon (unit) {
      var balloon = unit.querySelector('.wg-balloon');
      if (!balloon || !chart) { return; }

      balloon.classList.remove('flip-x', 'flip-y');
      var c = chart.getBoundingClientRect();
      if (balloon.getBoundingClientRect().right > c.right) {
        balloon.classList.add('flip-x');
      }
      // Bottom rows would drop their balloon past the axis and onto the
      // next section, so open those upward instead
      if (balloon.getBoundingClientRect().bottom > c.bottom) {
        balloon.classList.add('flip-y');
      }
    }

    units.forEach(function (unit) {
      var item = unit.querySelector('.wg-item');
      if (!item) { return; }

      unit.addEventListener('mouseenter', function () { placeBalloon(unit); });
      item.addEventListener('focus', function () { placeBalloon(unit); });

      item.addEventListener('click', function (e) {
        e.stopPropagation();
        var wasPinned = unit.classList.contains('pinned');
        units.forEach(function (u) { u.classList.remove('pinned'); });
        if (!wasPinned) {
          placeBalloon(unit);
          unit.classList.add('pinned');
        }
      });
    });

    document.addEventListener('click', function () {
      units.forEach(function (u) { u.classList.remove('pinned'); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        units.forEach(function (u) { u.classList.remove('pinned'); });
      }
    });

    var wgToggle = document.getElementById('wg-toggle');
    var wgDetails = document.getElementById('wg-details');
    if (wgToggle && wgDetails) {
      wgToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var opening = wgDetails.hasAttribute('hidden');
        if (opening) { wgDetails.removeAttribute('hidden'); }
        else { wgDetails.setAttribute('hidden', ''); }
        wgToggle.setAttribute('aria-expanded', opening ? 'true' : 'false');
        wgToggle.textContent = opening ? 'Hide all details' : 'Show all details';
        units.forEach(function (u) { u.classList.remove('pinned'); });
      });
    }
  }

  /* ---- Scroll-spy: highlight the section currently in view ---- */
  if (!links.length || !('IntersectionObserver' in window)) { return; }

  var linkFor = {};
  links.forEach(function (link) {
    var href = link.getAttribute('href') || '';
    if (href.charAt(0) === '#') { linkFor[href.slice(1)] = link; }
  });

  var sections = links
    .map(function (link) { return document.getElementById((link.getAttribute('href') || '').slice(1)); })
    .filter(Boolean);

  var ratios = {};
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) { ratios[entry.target.id] = entry.intersectionRatio; });

    var bestId = null, best = 0;
    Object.keys(ratios).forEach(function (id) {
      if (ratios[id] > best) { best = ratios[id]; bestId = id; }
    });

    links.forEach(function (link) { link.classList.remove('active'); });
    if (bestId && linkFor[bestId]) { linkFor[bestId].classList.add('active'); }
  }, {
    rootMargin: '0px 0px -45% 0px',
    threshold: [0, 0.15, 0.35, 0.6, 1.0]
  });

  sections.forEach(function (section) {
    ratios[section.id] = 0;
    observer.observe(section);
  });

}());
