/* ============================================================
   Ikai Vanguard — main.js
   - Particle canvas animation (hero background)
   - Glitch effect trigger
   - Smooth scroll (polyfill already handled by CSS)
   - Sticky navbar on scroll
   - Hamburger menu
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     Navbar: sticky + scroll styling
  ---------------------------------------------------------- */
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // run on load

  /* ----------------------------------------------------------
     Hamburger menu
  ---------------------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');

  if (hamburger && navMenu) hamburger.addEventListener('click', function () {
    const isOpen = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!isOpen));
    navMenu.classList.toggle('open', !isOpen);
  });

  // Close menu when a nav link is clicked (mobile)
  if (navMenu) navMenu.querySelectorAll('.navbar__link').forEach(function (link) {
    link.addEventListener('click', function () {
      if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('open');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', function (e) {
    if (navbar && !navbar.contains(e.target)) {
      if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
      if (navMenu) navMenu.classList.remove('open');
    }
  });

  /* ----------------------------------------------------------
     Particle canvas (hero background)
  ---------------------------------------------------------- */
  var canvas  = document.getElementById('particleCanvas');
  var ctx     = canvas ? canvas.getContext('2d') : null;
  var particles = [];
  var animId;

  var PARTICLE_COUNT = 120;
  var COLORS = ['#00f0ff', '#bf5fff', '#7b2fff', '#ffffff'];

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticle() {
    return {
      x:       randomBetween(0, canvas.width),
      y:       randomBetween(0, canvas.height),
      r:       randomBetween(0.5, 2.2),
      vx:      randomBetween(-0.25, 0.25),
      vy:      randomBetween(-0.35, -0.08),
      alpha:   randomBetween(0.3, 1),
      dAlpha:  randomBetween(0.003, 0.008) * (Math.random() < 0.5 ? 1 : -1),
      color:   COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  function initParticles() {
    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function updateParticle(p) {
    p.x    += p.vx;
    p.y    += p.vy;
    p.alpha += p.dAlpha;

    if (p.alpha <= 0.1 || p.alpha >= 1) {
      p.dAlpha *= -1;
    }

    // Wrap around edges
    if (p.y < -5)            p.y = canvas.height + 5;
    if (p.y > canvas.height + 5) p.y = -5;
    if (p.x < -5)            p.x = canvas.width + 5;
    if (p.x > canvas.width + 5)  p.x = -5;
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(function (p) {
      updateParticle(p);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    animId = requestAnimationFrame(drawParticles);
  }

  function initCanvas() {
    resizeCanvas();
    initParticles();
    if (animId) cancelAnimationFrame(animId);
    drawParticles();
  }

  // Throttled resize handler
  var resizeTimer;
  if (canvas && ctx) {
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        initCanvas();
      }, 200);
    }, { passive: true });

    initCanvas();
  }

  /* ----------------------------------------------------------
     Intersection Observer: fade-in cards on scroll
  ---------------------------------------------------------- */
  var fadeItems = document.querySelectorAll('.card, .about__description, .join__title, .join__desc');

  fadeItems.forEach(function (el) {
    el.style.opacity  = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity  = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    fadeItems.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: show everything immediately
    fadeItems.forEach(function (el) {
      el.style.opacity  = '1';
      el.style.transform = 'none';
    });
  }

})();
