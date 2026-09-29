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

  /* ---------- Work history (modular): employer tooltips ----------
     Hover and keyboard focus open a tooltip in CSS alone; a click or
     tap pins it open until another employer, Escape or a click
     elsewhere closes it. */
  var items = Array.prototype.slice.call(document.querySelectorAll('.mw-item'));
  if (items.length) {
    var closeAll = function (except) {
      items.forEach(function (b) { if (b !== except) b.setAttribute('aria-expanded', 'false'); });
    };
    items.forEach(function (b) {
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') !== 'true';
        closeAll(b);
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.mw-job')) closeAll();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });
  }

  /* ---------- Work history (modular): Enterprise UX outline ----------
     The Enterprise UX aside is centred on the Oracle row, and one
     rounded outline goes around both, joined across the spine where the two overlap vertically.
     Drawn from their current boxes, so it follows any reflow. On
     phones, or if they don't overlap, each keeps its own border. */
  var encl = document.querySelector('.mw-enclosure');
  if (encl) {
    var era = encl.parentNode;
    var aside = era.querySelector('.mw-aside');
    var row = era.querySelector('.mw-job.aside');
    var path = encl.querySelector('path');
    var R = 12;

    // Round each corner of a closed polygon with a quadratic curve.
    var rounded = function (pts) {
      var n = pts.length, d = '';
      for (var i = 0; i < n; i++) {
        var p = pts[i], a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
        var la = Math.hypot(p[0] - a[0], p[1] - a[1]);
        var lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
        var r = Math.min(R, la / 2, lb / 2);
        var s = [p[0] + (a[0] - p[0]) * r / la, p[1] + (a[1] - p[1]) * r / la];
        var e = [p[0] + (b[0] - p[0]) * r / lb, p[1] + (b[1] - p[1]) * r / lb];
        d += (i ? ' L ' : 'M ') + s.join(' ') + ' Q ' + p.join(' ') + ' ' + e.join(' ');
      }
      return d + ' Z';
    };
    // Drop repeated points and points in the middle of a straight run.
    var clean = function (pts) {
      var out = pts.filter(function (p, i) {
        var q = pts[(i + pts.length - 1) % pts.length];
        return Math.abs(p[0] - q[0]) > .5 || Math.abs(p[1] - q[1]) > .5;
      });
      return out.filter(function (p, i) {
        var a = out[(i + out.length - 1) % out.length], b = out[(i + 1) % out.length];
        return !((Math.abs(a[0] - p[0]) < .5 && Math.abs(p[0] - b[0]) < .5) ||
                 (Math.abs(a[1] - p[1]) < .5 && Math.abs(p[1] - b[1]) < .5));
      });
    };

    var draw = function () {
      // Centre the aside on the Oracle row while the two sit side by side.
      aside.style.marginTop = '';
      if (getComputedStyle(aside.parentNode).display === 'grid') {
        var a0 = aside.getBoundingClientRect(), b0 = row.getBoundingClientRect();
        var shift = (b0.top + b0.bottom) / 2 - (a0.top + a0.bottom) / 2;
        aside.style.marginTop = Math.round(shift) + 'px';
      }
      var o = era.getBoundingClientRect();
      var A = aside.getBoundingClientRect(), B = row.getBoundingClientRect();
      var box = function (r) {
        return { l: r.left - o.left, r: r.right - o.left, t: r.top - o.top, b: r.bottom - o.top };
      };
      A = box(A); B = box(B);
      var top = Math.max(A.t, B.t), bot = Math.min(A.b, B.b);
      var ok = getComputedStyle(aside.parentNode).display === 'grid' && B.l > A.r && bot - top > 2 * R;
      era.classList.toggle('has-enclosure', ok);
      if (!ok) return;
      path.setAttribute('d', rounded(clean([
        [A.l, A.t], [A.r, A.t], [A.r, top], [B.l, top], [B.l, B.t], [B.r, B.t],
        [B.r, B.b], [B.l, B.b], [B.l, bot], [A.r, bot], [A.r, A.b], [A.l, A.b]
      ])));
    };
    draw();
    if (window.ResizeObserver) new ResizeObserver(draw).observe(era);
    else window.addEventListener('resize', draw);
    if (document.fonts) document.fonts.ready.then(draw);
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
