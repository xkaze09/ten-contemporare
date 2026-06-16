/* ═══════════════════════════════════════
   Ten Contemporare — Main JS
   Sections: Loader · Navbar · Scroll Progress
            Hero Video · Collect Funnel
            GSAP spring entrances + clip-path reveals
════════════════════════════════════════ */

'use strict';

/* ── Loader — tied to video buffer progress ── */
(function initLoader() {
  const loader    = document.getElementById('loader');
  const loaderBar = document.getElementById('loaderBar');
  const video     = document.getElementById('heroVideo');
  if (!loader) return;

  function dismissLoader() {
    loaderBar.style.width = '100%';
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => { loader.style.display = 'none'; }, 700);
    }, 250);
  }

  if (!video) { window.addEventListener('load', dismissLoader); return; }

  let rafId;
  function updateBar() {
    if (video.duration && video.buffered.length) {
      const pct = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
      loaderBar.style.width = Math.min(pct, 95) + '%';
    }
    rafId = requestAnimationFrame(updateBar);
  }
  updateBar();

  video.addEventListener('canplaythrough', () => {
    cancelAnimationFrame(rafId);
    dismissLoader();
  }, { once: true });

  window.addEventListener('load', () => {
    cancelAnimationFrame(rafId);
    dismissLoader();
  });

  // Hard fallback — dismiss after 4 s no matter what
  setTimeout(() => { cancelAnimationFrame(rafId); dismissLoader(); }, 4000);
})();

/* ── Scroll Progress Bar ── */
(function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
})();

/* ── Navbar — scroll state + dark context over dark hero ── */
(function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const menuBtn    = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const hero       = document.getElementById('hero');
  if (!navbar) return;

  function updateNavbar() {
    // Transition to white nav after scrolling past the hero section
    const heroHeight = hero ? hero.offsetHeight : window.innerHeight;
    const scrolled   = window.scrollY > heroHeight - 100;
    navbar.classList.toggle('nav-scrolled', scrolled);

    // Hero is dark (video bg) — keep nav links light until hero is cleared
    navbar.classList.toggle('nav-dark', !scrolled);
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('.mm-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
})();

/* ── Hero Video — autoplay fallback (ping-pong baked into the video file) ── */
(function initHeroVideo() {
  const video = document.getElementById('heroVideo');
  if (!video) return;
  const tryPlay = () => { if (video.paused) video.play().catch(() => {}); };
  video.addEventListener('canplay', tryPlay, { once: true });
  tryPlay();
})();

/* ── Collect Funnel ── */
(function initFunnel() {
  const funnel = document.getElementById('collectFunnel');
  if (!funnel) return;

  const steps = funnel.querySelectorAll('.funnel-step');
  let currentStep = 1;

  // Option selection (radio-style)
  funnel.querySelectorAll('.funnel-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.funnel-options');
      parent.querySelectorAll('.funnel-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // Checkbox toggle
  funnel.querySelectorAll('.funnel-check').forEach(check => {
    check.addEventListener('click', () => {
      check.classList.toggle('checked');
    });
  });

  // Navigation helpers exposed globally (called from HTML onclick)
  window.funnelNext = function() {
    const next = currentStep + 1;
    if (next > steps.length) return;
    goToStep(next);
  };

  window.funnelBack = function() {
    const prev = currentStep - 1;
    if (prev < 1) return;
    goToStep(prev);
  };

  window.funnelSubmit = function(e) {
    e.preventDefault();
    goToStep(5);
  };

  function goToStep(n) {
    steps.forEach(step => {
      step.classList.toggle('active', parseInt(step.dataset.step) === n);
    });
    currentStep = n;
    // Scroll collect section into comfortable view
    document.getElementById('collect').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
})();

/* ── Entrance Animations — GSAP spring physics (Framer Motion feel) ── */
(function initEntranceAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // back.out(1.7) = overshoot spring — y/scale bounce past target then settle
  // power4.out   = ultra-fast init, smooth land — text, secondary elements
  // expo.out     = clip-path reveals
  const SPRING = 'back.out(1.7)';
  const EASE   = 'power4.out';
  const EX     = 'expo.out';

  /* Clip-path curtain reveals */
  function curtainUp(target, trigger, delay = 0) {
    gsap.fromTo(target,
      { clipPath: 'inset(100% 0 0 0)' },
      { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: EX, delay,
        onComplete() { gsap.set(target, { clearProps: 'clipPath' }); },
        scrollTrigger: { trigger, start: 'top 82%', once: true } });
  }

  function curtainRight(target, trigger, delay = 0) {
    gsap.fromTo(target,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 1.5, ease: EX, delay,
        onComplete() { gsap.set(target, { clearProps: 'clipPath' }); },
        scrollTrigger: { trigger, start: 'top 80%', once: true } });
  }

  /* Spring entrance helper — y + opacity, optional scale/stagger/delay.
     Uses a GSAP timeline so y uses back.out (spring) while opacity uses
     power2.out (smooth fade — no clamping oddities). */
  function enter(targets, triggerEl, opts = {}) {
    if (!targets) return;
    const st = { trigger: triggerEl, start: opts.start ?? 'top 86%', once: true };
    const tl = gsap.timeline({ scrollTrigger: st });
    tl.from(targets, {
      y:        opts.y       ?? 48,
      scale:    opts.scale   ?? 1,
      duration: opts.dur     ?? 0.85,
      stagger:  opts.stagger ?? 0,
      delay:    opts.delay   ?? 0,
      ease:     opts.ease    ?? SPRING,
    }, 0).from(targets, {
      opacity:  0,
      duration: (opts.dur ?? 0.85) * 0.65,
      stagger:  opts.stagger ?? 0,
      delay:    opts.delay   ?? 0,
      ease:     'power2.out',
    }, 0);
  }

  // ════════════════════════════════════════
  //  1. ARTWORKS
  // ════════════════════════════════════════

  enter('.artworks-section .section-title', '.artworks-section', { y: 56, dur: 1.0 });
  enter('.artworks-section .section-link',  '.artworks-section',
    { y: 20, dur: 0.7, ease: EASE, delay: 0.2 });

  document.querySelectorAll('.artwork-row').forEach(row => {
    const media = row.querySelector('.artwork-media');
    const info  = row.querySelector('.artwork-info');
    if (!media || !info) return;

    curtainUp(media, row);

    // Meta (index + artist): slide in from the side
    const tl = gsap.timeline({
      scrollTrigger: { trigger: row, start: 'top 84%', once: true },
    });
    tl.from(info.querySelectorAll('.artwork-index, .artwork-artist'),
      { x: -24, opacity: 0, duration: 0.65, stagger: 0.08, delay: 0.2, ease: EASE }, 0);

    enter(info.querySelector('.artwork-title'), row, { y: 56, dur: 1.0, delay: 0.2 });
    enter(info.querySelectorAll('.artwork-desc, .artwork-link'), row,
      { y: 28, stagger: 0.1, dur: 0.75, ease: EASE, delay: 0.36 });
  });

  // ════════════════════════════════════════
  //  2. GALLERY STATEMENT
  // ════════════════════════════════════════

  enter('.statement-label', '.statement-section', { y: 18, dur: 0.7, ease: EASE });
  enter('.statement-body',  '.statement-section', { y: 56, dur: 1.0, delay: 0.14 });
  enter(document.querySelectorAll('.statement-detail p'), '.statement-section',
    { y: 24, stagger: 0.12, dur: 0.8, ease: EASE, delay: 0.24 });

  // ════════════════════════════════════════
  //  3. CURRENT EXHIBITION
  // ════════════════════════════════════════

  curtainRight('.ef-image', '.exhibition-feature');
  enter('.ef-meta',  '.ef-content', { y: 18, dur: 0.65, ease: EASE, delay: 0.28 });
  enter('.ef-title', '.ef-content', { y: 56, dur: 1.0, delay: 0.36 });
  enter(document.querySelectorAll('.ef-text, .ef-dates, .exhibition-feature .btn-primary'),
    '.ef-content', { y: 24, stagger: 0.1, dur: 0.8, ease: EASE, delay: 0.5 });

  // ════════════════════════════════════════
  //  4. PAST EXHIBITIONS
  // ════════════════════════════════════════

  enter('.exhibitions-section .section-title', '.exhibitions-section', { y: 40, dur: 0.9 });

  gsap.from('.pe-card', {
    y: 56, opacity: 0, scale: 0.93,
    duration: 0.85, ease: SPRING,
    stagger: { each: 0.1, from: 'start' },
    scrollTrigger: { trigger: '.pe-grid', start: 'top 84%', once: true },
  });

  // ════════════════════════════════════════
  //  5. ARTISTS
  // ════════════════════════════════════════

  enter('.artists-section .section-title', '.artists-section', { y: 40, dur: 0.9 });

  document.querySelectorAll('.artist-card').forEach((card, i) => {
    const img = card.querySelector('.ac-img-wrap');
    if (img) curtainUp(img, '.artists-grid', i * 0.12);

    gsap.from(card, {
      y: 56, opacity: 0, scale: 0.94,
      duration: 0.85, delay: i * 0.1,
      ease: SPRING,
      scrollTrigger: { trigger: '.artists-grid', start: 'top 84%', once: true },
    });
    enter(card.querySelector('.ac-info'), card, { y: 24, dur: 0.8, delay: 0.22 + i * 0.08 });
  });

  // ════════════════════════════════════════
  //  6. COLLECT
  // ════════════════════════════════════════

  enter('.collect-section .eyebrow', '.collect-intro', { y: 18, dur: 0.65, ease: EASE });
  enter('.collect-headline', '.collect-intro', { y: 56, dur: 1.0, delay: 0.14 });
  enter('.collect-subtext',  '.collect-intro', { y: 28, dur: 0.8, ease: EASE, delay: 0.26 });

  gsap.from('.funnel', {
    y: 40, opacity: 0,
    duration: 0.9, ease: EASE,
    scrollTrigger: { trigger: '.funnel', start: 'top 87%', once: true },
  });

  // ════════════════════════════════════════
  //  7. ABOUT
  // ════════════════════════════════════════

  curtainUp('.about-image', '.about-section');
  enter('.about-content .eyebrow', '.about-content', { y: 18, dur: 0.65, ease: EASE, delay: 0.2 });
  enter('.about-title',            '.about-content', { y: 56, dur: 1.0, delay: 0.28 });
  enter(document.querySelectorAll('.about-body, .about-quote, .about-section .btn-primary'),
    '.about-content', { y: 28, stagger: 0.14, dur: 0.85, ease: EASE, delay: 0.4 });

  // ════════════════════════════════════════
  //  8. FOOTER
  // ════════════════════════════════════════

  gsap.from('.footer-top > *', {
    y: 28, opacity: 0,
    duration: 0.8, stagger: 0.09, ease: EASE,
    scrollTrigger: { trigger: 'footer', start: 'top 90%', once: true },
  });

})();

/* ── Smooth anchor scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
