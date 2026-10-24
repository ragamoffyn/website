/* One-page variant: sticky menu, the scroll-linked section transition
   (each section pins once its bottom is on screen and fades in place while
   the next slides up over it), and the project cards. The Experience tooltips and toggle come from
   ../v2.js. Without this script every section and project shows. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.querySelector('.op-nav');
  var links = Array.prototype.slice.call(nav.querySelectorAll('.menu-links a'));
  var secs = Array.prototype.slice.call(document.querySelectorAll('.op-section'));
  var clamp = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var ease = function (t) { return t * t * (3 - 2 * t); };

  var main = document.querySelector('.op-main');
  var pinned = !reduce;
  var tops = [];

  // Where each section sits in the flow, worked out from the heights so it
  // does not depend on the pinning or on a section's transform.
  var measure = function () {
    var navH = nav.offsetHeight, vh = window.innerHeight, y = 0;
    document.documentElement.style.setProperty('--op-nav', navH + 'px');
    for (var el = main; el; el = el.offsetParent) y += el.offsetTop;
    secs.forEach(function (s, i) {
      tops[i] = y;
      y += s.offsetHeight;
      if (!pinned || i === secs.length - 1) return;
      // Pinned once its bottom edge is on screen (or its top is under the
      // menu, for a section shorter than the window).
      s.classList.add('is-pin');
      s.style.top = Math.min(navH, vh - s.offsetHeight) + 'px';
    });
  };

  var goTo = function (el) {
    window.scrollTo({ top: Math.max(0, tops[secs.indexOf(el)] - nav.offsetHeight), behavior: reduce ? 'auto' : 'smooth' });
  };
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (a) {
    var target = a.hash.length > 1 && document.getElementById(a.hash.slice(1));
    var sec = target && target.closest('.op-section');
    if (!sec || a.hasAttribute('data-op-project')) return;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      goTo(sec);
      if (history.replaceState) history.replaceState(null, '', a.hash);
    });
  });

  /* ---- Menu: which section is current ---- */
  var spy = function () {
    var vh = window.innerHeight, cur = secs[0];
    secs.forEach(function (s, i) {
      if (tops[i] - window.scrollY <= nav.offsetHeight + vh * 0.35) cur = s;
    });
    // At the very bottom the last section is current, however short.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) cur = secs[secs.length - 1];
    links.forEach(function (a) {
      if (a.getAttribute('href') === '#' + cur.id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    nav.classList.toggle('is-stuck', window.scrollY > 4);
  };

  /* ---- The transition ----
     A section scrolls normally until its bottom is on screen, then stays
     put. The one below rises over it, and as it does the pinned section
     fades out in place while the new one fades in. The slide and the
     scale grow with how far down the page you are, so the later sections
     arrive harder than the first. */
  var animate = function () {
    var vh = window.innerHeight;
    var max = Math.max(1, document.documentElement.scrollHeight - vh);
    var prog = clamp(window.scrollY / max);
    var dist = vh * (0.05 + 0.13 * prog);
    var shrink = 0.012 + 0.04 * prog;
    // How far each section has risen into the window: 0 as its top reaches
    // the bottom edge, 1 after 60% of the window height.
    var rise = secs.map(function (s, i) {
      return i === 0 ? 1 : clamp((vh - (tops[i] - window.scrollY)) / (vh * 0.6));
    });
    secs.forEach(function (s, i) {
      var enterRaw = rise[i];
      var leaveRaw = i === secs.length - 1 ? 1 : 1 - rise[i + 1];
      var enter = ease(enterRaw);
      // The outgoing section fades a little early and the incoming one a
      // little late, so the two don't sit on top of each other.
      var op = Math.min(ease(clamp((enterRaw - 0.3) / 0.6)), ease(clamp((leaveRaw - 0.4) / 0.5)));
      if (op > 0.995) {
        s.style.opacity = '';
        s.style.transform = '';
        s.style.visibility = '';
        s.style.willChange = '';
        return;
      }
      s.style.willChange = 'transform, opacity';
      s.style.opacity = op.toFixed(3);
      // Fully faded sections are hidden so they can't be clicked or selected.
      s.style.visibility = op < 0.01 ? 'hidden' : '';
      s.style.transform = 'translate3d(0,' + ((1 - enter) * dist).toFixed(1) + 'px,0) scale(' + (1 - (1 - enter) * shrink).toFixed(4) + ')';
    });
  };

  var queued = false;
  var onScroll = function () {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(function () {
      queued = false;
      spy();
      if (!reduce) animate();
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measure(); onScroll(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); onScroll(); });
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () { measure(); onScroll(); });
    secs.forEach(function (s) { ro.observe(s); });
  }
  measure();
  onScroll();

  /* ---- Projects: one at a time, newest first, the newest chosen ---- */
  var cards = Array.prototype.slice.call(document.querySelectorAll('.op-card'));
  var arts = Array.prototype.slice.call(document.querySelectorAll('.op-proj'));
  var layout = document.querySelector('.op-layout');
  var panel = document.getElementById('op-panel');
  var show = function (id, bring) {
    var art = document.getElementById('op-' + id) || arts[0];
    arts.forEach(function (a) { a.classList.toggle('is-shown', a === art); });
    cards.forEach(function (c) {
      if (c.dataset.proj === art.dataset.proj) c.setAttribute('aria-current', 'true');
      else c.removeAttribute('aria-current');
    });
    // Stacked (cards above the project): bring the project up after a pick.
    if (bring && getComputedStyle(layout).gridTemplateColumns.split(' ').length === 1) {
      panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  };
  cards.forEach(function (c) {
    c.addEventListener('click', function (e) { e.preventDefault(); show(c.dataset.proj, true); });
  });
  // "Case study" links in the Experience tooltips.
  Array.prototype.forEach.call(document.querySelectorAll('[data-op-project]'), function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      show(a.dataset.opProject);
      goTo(document.getElementById('projects'));
    });
  });
  var start = location.hash.indexOf('#op-') === 0 ? location.hash.slice(4) : '';
  show(start);

  /* ---- Case-study images open larger (as on the Projects page) ---- */
  if (typeof HTMLDialogElement === 'undefined') return;
  var imgs = document.querySelectorAll('.op-proj .proj-fig img');
  var dlg = document.createElement('dialog');
  dlg.className = 'zoom';
  dlg.setAttribute('aria-label', 'Enlarged image');
  var shown = document.createElement('div');
  shown.className = 'zoom-imgs';
  var cap = document.createElement('p');
  var close = document.createElement('button');
  close.type = 'button';
  close.className = 'zoom-close';
  close.setAttribute('aria-label', 'Close');
  close.innerHTML = '&times;';
  dlg.appendChild(close);
  dlg.appendChild(shown);
  dlg.appendChild(cap);
  document.body.appendChild(dlg);
  var zoom = function (img) {
    var fig = img.closest('figure');
    var text = fig && fig.querySelector('figcaption');
    var group = fig && fig.classList.contains('proj-fig-group') ? fig.querySelectorAll('img') : [img];
    shown.textContent = '';
    shown.style.setProperty('--n', group.length);
    Array.prototype.forEach.call(group, function (g) {
      var big = document.createElement('img');
      big.src = g.currentSrc || g.src;
      big.alt = g.alt;
      shown.appendChild(big);
    });
    cap.textContent = text ? text.textContent : '';
    cap.hidden = !cap.textContent;
    dlg.showModal();
  };
  Array.prototype.forEach.call(imgs, function (img) {
    img.classList.add('zoomable');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', (img.alt ? img.alt + '. ' : '') + 'Enlarge image');
    img.addEventListener('click', function () { zoom(img); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zoom(img); }
    });
  });
  dlg.addEventListener('click', function () { dlg.close(); });
})();
