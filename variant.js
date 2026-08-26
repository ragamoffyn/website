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

  /* ---- Work-history timeline ----
     The markup carries the data: each role's duration in months and the
     phase it belongs to. Everything geometric is computed from that here,
     so a corrected duration re-flows the whole figure and no pixel value
     ever has to be kept in sync by hand.

     Segment height = months x scale, floored at a minimum so the very
     short internships stay readable — they are the only ones that hit it,
     which is why they are hatched and footnoted. Roles stack flush from
     the top: calendar gaps between jobs are deliberately not drawn.

     Expanding the diagram keeps that promise rather than breaking it.
     Instead of letting descriptions push rows out of proportion, the
     script measures how much room each one needs and raises the scale
     until the longest description fits its own role — so the bars stay
     strictly proportional to one another at every state. */
  var wt = document.getElementById('wt');
  if (wt) {
    var rail = document.getElementById('wt-rail');
    var rolesBox = document.getElementById('wt-roles');
    var roles = Array.prototype.slice.call(rolesBox.querySelectorAll('.wt-role'));
    var sideRoles = Array.prototype.slice.call(wt.querySelectorAll('.wt-side'));

    var PHASES = {
      foundations: 'Foundations',
      research:    'Applied research',
      enterprise:  'Enterprise UX',
      innovation:  'Innovation skunkworks',
      industrial:  'Industrial UX'
    };

    var BAR_GAP  = 2;    // the bar stops short of its segment by this much
    var BASE_PX  = 3;    // px per month at the design's scale
    var BASE_MIN = 40;   // minimum readable segment height
    var expanded = false;

    function num (el, attr, fallback) {
      var v = parseFloat(el.getAttribute(attr));
      return isNaN(v) ? fallback : v;
    }

    /* Which role begins which phase band, and where a band starts partway
       down a role. Purely structural — it depends on the order of the roles
       and nothing on their eventual heights, so it can be worked out before
       a single pixel is decided. */
    function readBands () {
      var bands = [];
      roles.forEach(function (r, i) {
        var phase = r.getAttribute('data-phase');
        var to = r.getAttribute('data-phase-to');
        var splitAt = num(r, 'data-split-at', 0.5);
        var last = bands[bands.length - 1];

        if (last && last.phase === phase && !last.closed) {
          last.endRole = i;
          last.endAt = to ? splitAt : 1;
        } else {
          bands.push({ phase: phase, startRole: i, startAt: 0, endRole: i, endAt: to ? splitAt : 1 });
        }
        var note = r.getAttribute('data-phase-note');
        if (note) { bands[bands.length - 1].note = note; }

        if (to) {
          bands[bands.length - 1].closed = true;
          bands.push({
            phase: to,
            startRole: i, startAt: splitAt,
            endRole: i, endAt: 1,
            note: r.getAttribute('data-phase-to-note'),
            midRole: true
          });
        }
      });

      /* A phase seen earlier is a continuation, not a fresh start */
      var seen = {};
      bands.forEach(function (b) {
        b.continues = seen[b.phase] === true;
        seen[b.phase] = true;
      });
      return bands;
    }

    /* The rail's bands again as inline headers, for the narrow layout where
       the rail is gone. Hidden by CSS at full width, but inserted before
       anything is measured, because they take up room. */
    function inlineBands (bands) {
      Array.prototype.slice.call(rolesBox.querySelectorAll('.wt-inline-band'))
        .forEach(function (el) { el.parentNode.removeChild(el); });
      bands.forEach(function (b) {
        if (b.midRole) { return; }   // marked by the overlap rule instead
        var body = roles[b.startRole].querySelector('.wt-body');
        var el = document.createElement('div');
        el.className = 'wt-inline-band';
        el.innerHTML = '<i class="wt-chip" data-phase="' + b.phase + '"></i><span>' +
          (PHASES[b.phase] || b.phase) + '</span>';
        body.insertBefore(el, body.firstChild);
      });
    }

    /* How tall each role's contents actually are at this width. Measured in
       normal flow, since an absolutely positioned row reports the height we
       gave it rather than the one it needs. */
    function measure () {
      roles.forEach(function (r) {
        r.style.position = 'static';
        r.style.height = 'auto';
        var bar = r.querySelector('.wt-bar');
        if (bar) { bar.style.height = ''; }   // clear the previous layout's bar height, or it leaks into this measurement
      });
      var heights = roles.map(function (r) { return r.offsetHeight; });
      roles.forEach(function (r) { r.style.position = ''; r.style.height = ''; });
      return heights;
    }

    function layout () {
      var bands = readBands();
      inlineBands(bands);

      /* Raise the scale until every role has room for its own contents.
         Doing it by scale rather than by growing individual rows is what
         keeps the segments proportional to each other — at any width, and
         whether or not the descriptions are showing. */
      var breath = expanded ? 18 : 6;
      var needed = measure();
      var scale = BASE_PX;
      var minH = BASE_MIN;

      roles.forEach(function (r, i) {
        var want = needed[i] + breath;
        if (r.getAttribute('data-minor') === 'true') {
          minH = Math.max(minH, want);          // already exempt from the scale
        } else {
          scale = Math.max(scale, want / num(r, 'data-months', 1));
        }
      });

      var laid = [];
      var y = 0;
      roles.forEach(function (r) {
        var h = Math.max(minH, Math.round(num(r, 'data-months', 1) * scale));
        laid.push({ el: r, top: y, height: h });
        y += h;
      });
      var total = y;

      rail.style.height = total + 'px';
      rolesBox.style.height = total + 'px';

      /* Place the roles, and rule each one: a solid line where a phase
         begins, a hairline between roles inside the same phase. */
      laid.forEach(function (item, i) {
        var r = item.el;
        r.style.top = item.top + 'px';
        r.style.height = item.height + 'px';
        r.setAttribute('data-continues',
          String(i > 0 && roles[i - 1].getAttribute('data-phase') === r.getAttribute('data-phase')));
        var bar = r.querySelector('.wt-bar');
        if (bar) { bar.style.height = Math.max(0, item.height - BAR_GAP) + 'px'; }
      });

      /* The bands, now in pixels */
      rail.textContent = '';
      bands.forEach(function (b) {
        var from = laid[b.startRole];
        var to = laid[b.endRole];
        var top = from.top + from.height * b.startAt;
        var bottom = (b.endRole === roles.length - 1 && b.endAt === 1)
          ? total                       // the last band runs to the foot
          : to.top + to.height * b.endAt;

        var el = document.createElement('div');
        el.className = 'wt-band' + (b.continues ? ' continues' : '');
        el.style.top = top + 'px';
        el.style.height = (bottom - top) + 'px';
        el.innerHTML =
          '<div class="wt-band-name"><i class="wt-chip" data-phase="' + b.phase + '"></i>' +
          '<span>' + (PHASES[b.phase] || b.phase) + '</span></div>' +
          (b.note ? '<div class="wt-band-note">' + b.note + '</div>' : '');
        rail.appendChild(el);
      });

      /* The dashed rule across the role where one phase hands to the next */
      var split = null;
      bands.some(function (b) { if (b.midRole) { split = b; return true; } return false; });
      var mark = rolesBox.querySelector('.wt-overlap');
      if (split) {
        if (!mark) {
          mark = document.createElement('div');
          mark.className = 'wt-overlap';
          mark.innerHTML = '<i></i><span><span class="wt-overlap-main">Phase overlap</span>' +
            '<span class="wt-overlap-to">&rarr; ' + (PHASES[split.phase] || '') + '</span></span>';
          rolesBox.appendChild(mark);
        }
        var host = laid[split.startRole];
        mark.style.top = (host.top + host.height * split.startAt - 6) + 'px';
      }

      /* Phase colours, for the rail chips and the inline headers */
      Array.prototype.slice.call(wt.querySelectorAll('.wt-chip')).forEach(function (chip) {
        chip.style.background = 'var(--wt-' + chip.getAttribute('data-phase') + ')';
      });
    }

    /* A balloon near the bottom of the figure would hang off the end of
       the section, so those open upward instead. */
    function placeBalloon (role) {
      var desc = role.querySelector('.wt-desc');
      if (!desc || expanded) { return; }
      desc.classList.remove('flip-y', 'flip-x');
      var figure = wt.getBoundingClientRect();
      var box = desc.getBoundingClientRect();

      /* A balloon that would hang off the foot of the figure opens upward,
         if there is room above it to do that */
      if (box.bottom > figure.bottom + 40 && box.height < role.getBoundingClientRect().top - figure.top) {
        desc.classList.add('flip-y');
      }
      /* One that would reach past the right edge opens to the left instead */
      if (box.right > figure.right) {
        desc.classList.add('flip-x');
      }
    }

    var allRoles = roles.concat(sideRoles);
    allRoles.forEach(function (role) {
      var head = role.querySelector('.wt-head');
      if (!head) { return; }

      role.addEventListener('mouseenter', function () { placeBalloon(role); });
      head.addEventListener('focus', function () { placeBalloon(role); });

      /* Tap, or click, holds a balloon open */
      head.addEventListener('click', function (e) {
        e.stopPropagation();
        if (expanded) { return; }
        var wasPinned = role.classList.contains('pinned');
        allRoles.forEach(function (r) { r.classList.remove('pinned'); });
        if (!wasPinned) {
          placeBalloon(role);
          role.classList.add('pinned');
        }
      });
    });

    function unpin () { allRoles.forEach(function (r) { r.classList.remove('pinned'); }); }
    document.addEventListener('click', unpin);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { unpin(); } });

    var wtToggle = document.getElementById('wt-toggle');
    if (wtToggle) {
      wtToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        expanded = !expanded;
        unpin();
        wt.classList.toggle('is-expanded', expanded);
        wtToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        wtToggle.textContent = expanded ? 'Hide all details' : 'Show all details';
        layout();
      });
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layout, 120);
    });

    /* From here the geometry is computed, so the figure can stop being a
       list and start being a diagram */
    wt.classList.add('is-live');
    layout();
    // Web fonts land after first paint and change every measurement
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(layout); }
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
