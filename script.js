/* =================================================================
   Michael Stiso Portfolio — script.js
   No external libraries. Vanilla JS only.
   ================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------------
     1. DOM references
     --------------------------------------------------------------- */
  const nav          = document.getElementById('site-nav');
  const navLinks     = document.getElementById('nav-links');
  const hamburger    = document.getElementById('hamburger');
  const allNavLinks  = document.querySelectorAll('.nav-link');
  const sections     = document.querySelectorAll('section[id]');

  /* ---------------------------------------------------------------
     2. Nav scroll state — add .scrolled when page is scrolled down
     --------------------------------------------------------------- */
  function updateNavScrollState () {
    if (window.scrollY > 30) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  // Run on load in case page is already scrolled (e.g. browser restores scroll position)
  updateNavScrollState();

  window.addEventListener('scroll', updateNavScrollState, { passive: true });

  /* ---------------------------------------------------------------
     3. Active nav link — IntersectionObserver
        Highlights the nav link for whichever section is currently
        most visible in the viewport.
     --------------------------------------------------------------- */
  // Map section id -> nav link element
  const navLinkMap = {};
  allNavLinks.forEach(function (link) {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      const id = href.slice(1);
      navLinkMap[id] = link;
    }
  });

  // Track which sections are intersecting and at what ratio
  const intersectingRatios = {};

  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        intersectingRatios[entry.target.id] = entry.intersectionRatio;
      });

      // Find the section with the highest intersection ratio
      let maxRatio = 0;
      let activeId = null;

      Object.keys(intersectingRatios).forEach(function (id) {
        if (intersectingRatios[id] > maxRatio) {
          maxRatio = intersectingRatios[id];
          activeId = id;
        }
      });

      // Update active class
      allNavLinks.forEach(function (link) {
        link.classList.remove('active');
      });

      if (activeId && navLinkMap[activeId]) {
        navLinkMap[activeId].classList.add('active');
      }
    },
    {
      // Use a generous rootMargin so sections register as intersecting
      // before they fully scroll into view
      rootMargin: '0px 0px -40% 0px',
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
    }
  );

  sections.forEach(function (section) {
    sectionObserver.observe(section);
    intersectingRatios[section.id] = 0;
  });

  /* ---------------------------------------------------------------
     4. Smooth scroll for nav links
        (CSS scroll-behavior: smooth handles most cases, but this
        provides the offset needed to account for the fixed nav bar.)
     --------------------------------------------------------------- */
  const NAV_HEIGHT = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '68',
    10
  );

  allNavLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const targetId = href.slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const targetTop = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth',
      });

      // Close mobile menu if open
      closeMenu();

      // Update URL hash without triggering jump
      if (history.pushState) {
        history.pushState(null, '', href);
      }
    });
  });

  /* ---------------------------------------------------------------
     5. Logo link smooth scroll to top
     --------------------------------------------------------------- */
  const logoLink = document.querySelector('.nav-logo');
  if (logoLink) {
    logoLink.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (history.pushState) {
        history.pushState(null, '', '#hero');
      }
    });
  }

  /* ---------------------------------------------------------------
     6. Mobile hamburger menu toggle
     --------------------------------------------------------------- */
  function openMenu () {
    navLinks.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    // Trap scroll on body while menu is open
    document.body.style.overflow = 'hidden';
  }

  function closeMenu () {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    if (navLinks.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when clicking outside of it
  document.addEventListener('click', function (e) {
    if (
      navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  // Close menu on resize if viewport becomes wide enough
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768 && navLinks.classList.contains('open')) {
      closeMenu();
    }
  }, { passive: true });

  /* ---------------------------------------------------------------
     7. Handle initial hash on page load
        If the URL has a hash, scroll to that section after a small
        delay to allow fonts and layout to settle.
     --------------------------------------------------------------- */
  if (window.location.hash) {
    const initialTarget = document.getElementById(window.location.hash.slice(1));
    if (initialTarget) {
      // Small timeout lets the page render before scrolling
      setTimeout(function () {
        const targetTop = initialTarget.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
        window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
      }, 150);
    }
  }

}());
