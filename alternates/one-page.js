/* One-page variant: sticky menu, the scroll-linked section transition,
   and the project cards. The Experience tooltips and toggle come from
   ../v2.js. Without this script every section and project shows. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.querySelector('.op-nav');
  var links = Array.prototype.slice.call(nav.querySelectorAll('.menu-links a'));
  var secs = Array.prototype.slice.call(document.querySelectorAll('.op-section'));
  var clamp = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var ease = function (t) { return t * t * (3 - 2 * t); };

  var measure = function () {
    document.documentElement.style.setProperty('--op-nav', nav.offsetHeight + 'px');
  };

  /* ---- Jumping: a section sliding in is offset by its transform, and the browser's
     own anchor jump aims at that shifted spot, so aim at the layout position ---- */
  var layoutTop = function (el) {
    var y = 0;
    for (; el; el = el.offsetParent) y += el.offsetTop;
    return y;
  };
  var goTo = function (el) {
    window.scrollTo({ top: Math.max(0, layoutTop(el) - nav.offsetHeight), behavior: reduce ? 'auto' : 'smooth' });
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
    secs.forEach(function (s) {
      if (s.getBoundingClientRect().top <= nav.offsetHeight + vh * 0.35) cur = s;
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
     A section fades as its lower edge rises under the menu; the one
     below slides up and fades in as its top rises into the window. The
     slide and the scale grow with how far down the page you are, so the
     later sections arrive harder than the first. */
  var animate = function () {
    var vh = window.innerHeight, navH = nav.offsetHeight;
    var max = Math.max(1, document.documentElement.scrollHeight - vh);
    var prog = clamp(window.scrollY / max);
    var dist = vh * (0.05 + 0.13 * prog);
    var shrink = 0.012 + 0.04 * prog;
    secs.forEach(function (s, i) {
      var r = s.getBoundingClientRect();
      var enterRaw = i === 0 ? 1 : clamp((vh - r.top) / (vh * 0.6));
      var leaveRaw = i === secs.length - 1 ? 1 : clamp((r.bottom - navH) / (vh * 0.55));
      var enter = ease(enterRaw), leave = ease(leaveRaw);
      // The outgoing section fades a little early and the incoming one a
      // little late, so the two don't sit on top of each other.
      var op = Math.min(ease(clamp((enterRaw - 0.2) / 0.6)), ease(clamp((leaveRaw - 0.1) / 0.7)));
      if (op > 0.995) {
        s.style.opacity = '';
        s.style.transform = '';
        s.style.willChange = '';
        return;
      }
      var ty = (1 - enter) * dist;
      var sc = 1 - (1 - enter) * shrink - (1 - leave) * shrink * 0.6;
      s.style.willChange = 'transform, opacity';
      s.style.opacity = op.toFixed(3);
      s.style.transform = 'translate3d(0,' + ty.toFixed(1) + 'px,0) scale(' + sc.toFixed(4) + ')';
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
