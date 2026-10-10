/* =================================================================
   Michael Stiso — Portfolio
   Vanilla JS. Sidebar nav: mobile toggle + scroll-spy highlight.
   Guarded so it is harmless on the case-study detail pages.
   ================================================================= */

(function () {
  'use strict';

  var toggle  = document.getElementById('rail-toggle');
  var nav     = document.getElementById('rail-nav');
  var links   = Array.prototype.slice.call(document.querySelectorAll('.rail-link'));

  /* ---- Mobile menu toggle ---- */
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---- Close the collapsed menu after choosing a section ---- */
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        if (toggle) { toggle.setAttribute('aria-expanded', 'false'); }
      }
    });
  });

  /* ---- Work-history diagram ----
     CSS already handles hover/focus balloons, so this layer only adds
     click-to-pin, flipping balloons that would fall off the chart, and
     the show-all-details toggle. Without JS the diagram still works. */
  var wh = document.getElementById('wh');
  if (wh) {
    var chart = wh.querySelector('.wh-chart');
    var whRows = Array.prototype.slice.call(wh.querySelectorAll('.wh-row'));

    // Flip the balloon above its row when it would overflow the chart
    function placeBalloon (row) {
      row.classList.remove('flip');
      var balloon = row.querySelector('.wh-balloon');
      if (!balloon || !chart) { return; }
      var b = balloon.getBoundingClientRect();
      var c = chart.getBoundingClientRect();
      if (b.bottom > c.bottom + 32) { row.classList.add('flip'); }
    }

    whRows.forEach(function (row) {
      var item = row.querySelector('.wh-item');
      if (!item) { return; }

      item.addEventListener('mouseenter', function () { placeBalloon(row); });
      item.addEventListener('focus', function () { placeBalloon(row); });

      item.addEventListener('click', function (e) {
        e.stopPropagation();
        // In the expanded view every detail is already on the page
        if (wh.classList.contains('detail')) { return; }
        var wasPinned = row.classList.contains('pinned');
        whRows.forEach(function (r) { r.classList.remove('pinned'); });
        if (!wasPinned) {
          placeBalloon(row);
          row.classList.add('pinned');
        }
      });
    });

    // Click anywhere else, or press Escape, to unpin
    document.addEventListener('click', function () {
      whRows.forEach(function (r) { r.classList.remove('pinned'); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        whRows.forEach(function (r) { r.classList.remove('pinned'); });
      }
    });

    // Toggle expands the diagram itself, dropping every balloon inline
    var whToggle = document.getElementById('wh-toggle');
    if (whToggle) {
      whToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var opening = !wh.classList.contains('detail');
        wh.classList.toggle('detail', opening);
        whToggle.setAttribute('aria-expanded', opening ? 'true' : 'false');
        whToggle.textContent = opening ? 'Hide all details' : 'Show all details';
        whRows.forEach(function (r) { r.classList.remove('pinned', 'flip'); });
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
