/* Portfolio v2 — small progressive enhancements. Every page works
   without this file: tabs fall back to the first panel, the work-history
   rows are plain in-page links, and every project article shows. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* ---------- Home: summary tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); selectTab(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Work history: graphic <-> description ----------
     Selecting a row scrolls its entry into view; scrolling the
     description marks the row whose entry is at the top. */
  var text = document.getElementById('wh-text');
  if (text) {
    var rows = Array.prototype.slice.call(document.querySelectorAll('.g-row'));
    var jobs = Array.prototype.slice.call(text.querySelectorAll('.job'));

    var mark = function (id) {
      rows.forEach(function (r) {
        if (r.dataset.job === id) r.setAttribute('aria-current', 'true');
        else r.removeAttribute('aria-current');
      });
      jobs.forEach(function (j) { j.classList.toggle('is-active', j.dataset.job === id); });
    };

    // The description scrolls inside its panel when the dashboard is
    // pinned to the viewport, and with the page otherwise.
    var scroller = function () {
      return getComputedStyle(text).overflowY === 'auto' ? text : window;
    };
    var top = function () {
      return scroller() === window ? 0 : text.getBoundingClientRect().top;
    };

    var locked = false;
    var spy = function () {
      if (locked) return;
      var t = top() + 40, cur = null;
      jobs.forEach(function (j) { if (j.getBoundingClientRect().top <= t) cur = j; });
      mark(cur ? cur.dataset.job : null);
    };

    rows.forEach(function (r) {
      r.addEventListener('click', function (e) {
        var target = document.getElementById('job-' + r.dataset.job);
        if (!target) return;
        e.preventDefault();
        mark(r.dataset.job);
        locked = true;
        target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', '#job-' + r.dataset.job);
        clearTimeout(r._t);
        r._t = setTimeout(function () { locked = false; }, 700);
      });
    });

    text.addEventListener('scroll', spy, { passive: true });
    window.addEventListener('scroll', spy, { passive: true });

    var h = location.hash.replace('#job-', '');
    if (h && document.getElementById('job-' + h)) {
      document.getElementById('job-' + h).scrollIntoView({ block: 'start' });
      mark(h);
    } else {
      spy();
    }
  }

  /* ---------- Projects: one article at a time ---------- */
  var detail = document.getElementById('proj-detail');
  if (detail) {
    var arts = Array.prototype.slice.call(detail.querySelectorAll('.proj'));
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.proj-tile'));
    var list = document.querySelector('.proj-list');

    // Scroll the tile list (not the page) so the chosen tile is in view.
    var reveal = function (el, box) {
      var r = el.getBoundingClientRect(), b = box.getBoundingClientRect();
      if (r.top < b.top) box.scrollTop -= b.top - r.top;
      else if (r.bottom > b.bottom) box.scrollTop += r.bottom - b.bottom;
      if (r.left < b.left) box.scrollLeft -= b.left - r.left;
      else if (r.right > b.right) box.scrollLeft += r.right - b.right;
    };

    var show = function (id, fromClick) {
      var art = document.getElementById('p-' + id);
      if (!art || arts.indexOf(art) < 0) art = arts[0];
      arts.forEach(function (a) { a.classList.toggle('is-shown', a === art); });
      tiles.forEach(function (t) {
        if (t.dataset.proj === art.dataset.proj) {
          t.setAttribute('aria-current', 'true');
          reveal(t, list);
        } else t.removeAttribute('aria-current');
      });
      detail.scrollTop = 0;
      // When the panels are stacked, bring the article up after a pick.
      if (fromClick && getComputedStyle(detail).overflowY !== 'auto') {
        detail.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    };

    tiles.forEach(function (t) {
      t.addEventListener('click', function (e) {
        e.preventDefault();
        history.replaceState(null, '', '#' + t.dataset.proj);
        show(t.dataset.proj, true);
      });
    });
    window.addEventListener('hashchange', function () { show(location.hash.slice(1)); });
    show(location.hash.slice(1));
  }
})();
