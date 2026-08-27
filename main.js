/* ═══════════════════════════════════════
   Ten Contemporare — Main JS
   Sections: Loader · Navbar · Scroll Progress
            Hero Video · Collect Funnel · Contact Form
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

/* ── Smooth Scroll — Lenis ── */
(function initSmoothScroll() {
  if (typeof Lenis === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
})();

/* ── Theme Toggle ── */
(function initThemeToggle() {
  const btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    btn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  applyTheme(localStorage.getItem('tc-theme') ?? 'light');
  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('tc-theme', next);
    applyTheme(next);
  });
})();

/* ── Navbar — scroll state + dark context over dark hero ── */
(function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const menuBtn    = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const hero       = document.getElementById('hero');
  if (!navbar) return;

  // Inner pages have no hero video — start scrolled (dark text on light bg) immediately.
  if (!hero) {
    navbar.classList.add('nav-scrolled');
    navbar.classList.remove('nav-dark');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('nav-scrolled', window.scrollY > 50);
    }, { passive: true });
  } else {
    function updateNavbar() {
      const scrolled = window.scrollY > hero.offsetHeight - 100;
      navbar.classList.toggle('nav-scrolled', scrolled);
      navbar.classList.toggle('nav-dark', !scrolled);
    }
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();
  }

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

/* ── Hero Video — ping-pong loop (forward → reverse → forward) ── */
(function initHeroVideo() {
  const video = document.getElementById('heroVideo');
  if (!video) return;
  const tryPlay = () => { if (video.paused) video.play().catch(() => {}); };
  video.addEventListener('canplay', tryPlay, { once: true });
  tryPlay();
})();

/* ── Collect Modal — premium acquisition overlay ── */
(function initCollectModal() {
  const MODAL_HTML = `
<div id="collectModal" class="cm-modal" role="dialog" aria-modal="true" aria-label="Begin Collecting with Ten Contemporare">
  <div class="cm-backdrop" id="cmBackdrop"></div>
  <div class="cm-panel">
    <div class="cm-left">
      <div class="cm-logo"><img src="/assets/10c-logo.jpg" alt="Ten Contemporare"></div>
      <div class="cm-left-quote"><p>"A considered<br>acquisition is<br>a permanent one."</p></div>
      <div class="cm-left-foot">Ten Contemporare · Metro Manila</div>
    </div>
    <div class="cm-right">
      <button class="cm-close" id="cmClose" aria-label="Close"></button>
      <div id="cmFunnel">

        <div class="cm-step active" data-step="1">
          <div class="cm-prog-wrap"><div class="cm-prog-bar"><div class="cm-prog-fill" style="width:25%"></div></div><span class="cm-step-lbl">01 / 04</span></div>
          <h2 class="cm-q">What brings<br>you here?</h2>
          <p class="cm-hint">Select one — this helps us point you in the right direction.</p>
          <div class="cm-opts">
            <button class="cm-opt" data-value="specific"><span class="cm-opt-text">I'm looking for a specific work</span><span class="cm-opt-arr">→</span></button>
            <button class="cm-opt" data-value="start"><span class="cm-opt-text">I want to start collecting</span><span class="cm-opt-arr">→</span></button>
            <button class="cm-opt" data-value="institution"><span class="cm-opt-text">I represent an institution or corporation</span><span class="cm-opt-arr">→</span></button>
            <button class="cm-opt" data-value="research"><span class="cm-opt-text">I'm researching an artist</span><span class="cm-opt-arr">→</span></button>
          </div>
          <div class="cm-nav"><button class="btn-primary" id="cmNext1">Continue</button></div>
        </div>

        <div class="cm-step" data-step="2">
          <div class="cm-prog-wrap"><div class="cm-prog-bar"><div class="cm-prog-fill" style="width:50%"></div></div><span class="cm-step-lbl">02 / 04</span></div>
          <h2 class="cm-q">What interests<br>you?</h2>
          <p class="cm-hint">Select what draws you — we'll narrow from here.</p>
          <div class="cm-opts">
            <button class="cm-opt" data-value="figurative"><span class="cm-opt-text">Painting — figurative</span><span class="cm-opt-arr">→</span></button>
            <button class="cm-opt" data-value="abstract"><span class="cm-opt-text">Painting — abstract</span><span class="cm-opt-arr">→</span></button>
            <button class="cm-opt" data-value="paper"><span class="cm-opt-text">Works on paper</span><span class="cm-opt-arr">→</span></button>
            <button class="cm-opt" data-value="sculpture"><span class="cm-opt-text">Sculpture</span><span class="cm-opt-arr">→</span></button>
            <button class="cm-opt" data-value="open"><span class="cm-opt-text">I'm open to a recommendation</span><span class="cm-opt-arr">→</span></button>
          </div>
          <div class="cm-nav"><button class="btn-primary" id="cmNext2">Continue</button><button class="btn-ghost" id="cmBack2">← Back</button></div>
        </div>

        <div class="cm-step" data-step="3">
          <div class="cm-prog-wrap"><div class="cm-prog-bar"><div class="cm-prog-fill" style="width:75%"></div></div><span class="cm-step-lbl">03 / 04</span></div>
          <h2 class="cm-q">What matters<br>to you?</h2>
          <p class="cm-hint">Select all that apply.</p>
          <div class="cm-checks">
            <label class="cm-check"><div class="cm-chk-box"></div><span class="cm-chk-lbl">Provenance and full documentation</span></label>
            <label class="cm-check"><div class="cm-chk-box"></div><span class="cm-chk-lbl">Long-term investment potential</span></label>
            <label class="cm-check"><div class="cm-chk-box"></div><span class="cm-chk-lbl">A specific price range</span></label>
            <label class="cm-check"><div class="cm-chk-box"></div><span class="cm-chk-lbl">An artist I already know</span></label>
            <label class="cm-check"><div class="cm-chk-box"></div><span class="cm-chk-lbl">Something I haven't seen before</span></label>
          </div>
          <div class="cm-nav"><button class="btn-primary" id="cmNext3">Continue</button><button class="btn-ghost" id="cmBack3">← Back</button></div>
        </div>

        <div class="cm-step" data-step="4">
          <div class="cm-prog-wrap"><div class="cm-prog-bar"><div class="cm-prog-fill" style="width:100%"></div></div><span class="cm-step-lbl">04 / 04</span></div>
          <h2 class="cm-q">How do we<br>reach you?</h2>
          <p class="cm-hint">We respond within 48 hours. No follow-up sequences, no sales calls.</p>
          <form id="cmForm" novalidate>
            <div style="position:absolute;left:-9999px;opacity:0;pointer-events:none;" aria-hidden="true"><input type="text" name="_honey" tabindex="-1" autocomplete="off"></div>
            <div class="cm-field"><label class="cm-lbl" for="cm-name">Name *</label><input class="cm-inp" id="cm-name" type="text" placeholder="Your name" required autocomplete="name"></div>
            <div class="cm-field"><label class="cm-lbl" for="cm-email">Email *</label><input class="cm-inp" id="cm-email" type="email" placeholder="you@example.com" required autocomplete="email"></div>
            <div class="cm-field"><label class="cm-lbl" for="cm-phone">Phone <span style="opacity:0.4">(optional)</span></label><input class="cm-inp" id="cm-phone" type="tel" placeholder="+63" autocomplete="tel"></div>
            <div class="cm-field"><label class="cm-lbl" for="cm-note">Anything else</label><input class="cm-inp" id="cm-note" type="text" placeholder="A work, a budget, a question"></div>
            <div class="cm-gdpr"><input type="checkbox" id="cm-gdpr"><label for="cm-gdpr">I consent to Ten Contemporare storing my contact details to respond to this enquiry. <a href="/privacy-policy">Privacy Policy</a>.</label></div>
            <p class="cm-gdpr-err" id="cmGdprErr">Please confirm your consent to continue.</p>
            <div class="cm-nav"><button type="submit" class="btn-primary">Send Enquiry</button><button type="button" class="btn-ghost" id="cmBack4">← Back</button></div>
          </form>
        </div>

        <div class="cm-step" data-step="5">
          <div class="cm-ty">
            <p class="cm-ty-mark">✦</p>
            <h2 class="cm-ty-title">We'll be in touch.</h2>
            <p class="cm-ty-text">Expect a reply within 48 hours. In the meantime, take time with the work — there's no rush here.</p>
            <button class="cm-ty-close" id="cmDone">Close this window</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>`;

  document.body.insertAdjacentHTML('beforeend', MODAL_HTML);

  const modal      = document.getElementById('collectModal');
  const funnel     = document.getElementById('cmFunnel');
  const steps      = funnel.querySelectorAll('.cm-step');
  let currentStep  = 1;
  const collected  = { intent: '', interest: '', priorities: [] };

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('cmClose').focus(), 400);
  }
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  function goToStep(n) {
    steps.forEach(s => s.classList.toggle('active', parseInt(s.dataset.step) === n));
    currentStep = n;
    const right = modal.querySelector('.cm-right');
    if (right) right.scrollTop = 0;
  }

  document.getElementById('cmClose').addEventListener('click', closeModal);
  document.getElementById('cmBackdrop').addEventListener('click', closeModal);
  document.getElementById('cmDone').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

  // Intercept all "Begin Collecting" / collect links
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href="#collect"], a[href="/#collect"], [data-collect]');
    if (!link) return;
    e.preventDefault();
    if (!modal.classList.contains('open')) goToStep(1);
    openModal();
  });

  // Option selection & checkbox toggle
  funnel.addEventListener('click', e => {
    const opt = e.target.closest('.cm-opt');
    if (opt) {
      opt.closest('.cm-opts').querySelectorAll('.cm-opt').forEach(b => b.classList.remove('selected'));
      opt.classList.add('selected');
    }
    const chk = e.target.closest('.cm-check');
    if (chk) chk.classList.toggle('checked');
  });

  // Step navigation
  document.getElementById('cmNext1').addEventListener('click', () => {
    collected.intent = (funnel.querySelector('[data-step="1"] .cm-opt.selected') || {}).dataset?.value || '';
    goToStep(2);
  });
  document.getElementById('cmNext2').addEventListener('click', () => {
    collected.interest = (funnel.querySelector('[data-step="2"] .cm-opt.selected') || {}).dataset?.value || '';
    goToStep(3);
  });
  document.getElementById('cmBack2').addEventListener('click', () => goToStep(1));
  document.getElementById('cmNext3').addEventListener('click', () => {
    collected.priorities = [...funnel.querySelectorAll('[data-step="3"] .cm-check.checked .cm-chk-lbl')].map(el => el.textContent.trim());
    goToStep(4);
  });
  document.getElementById('cmBack3').addEventListener('click', () => goToStep(2));
  document.getElementById('cmBack4').addEventListener('click', () => goToStep(3));

  // Form submit
  document.getElementById('cmForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const gdprEl    = document.getElementById('cm-gdpr');
    const gdprError = document.getElementById('cmGdprErr');
    const submitBtn = e.target.querySelector('[type="submit"]');

    if (!gdprEl.checked) {
      gdprError.style.display = 'block';
      gdprEl.focus();
      return;
    }
    gdprError.style.display = 'none';

    collected.priorities = [...funnel.querySelectorAll('[data-step="3"] .cm-check.checked .cm-chk-lbl')].map(el => el.textContent.trim());

    const intentMap   = { specific: 'Looking for a specific work', start: 'Starting to collect', institution: 'Institution or corporation', research: 'Researching an artist' };
    const interestMap = { figurative: 'Painting — figurative', abstract: 'Painting — abstract', paper: 'Works on paper', sculpture: 'Sculpture', open: 'Open to a recommendation' };

    const payload = {
      name:      document.getElementById('cm-name').value.trim(),
      email:     document.getElementById('cm-email').value.trim(),
      phone:     document.getElementById('cm-phone').value.trim() || 'Not provided',
      message:   document.getElementById('cm-note').value.trim()  || 'None',
      intent:    intentMap[collected.intent]    || collected.intent    || 'Not specified',
      interest:  interestMap[collected.interest] || collected.interest  || 'Not specified',
      priorities: collected.priorities.length ? collected.priorities.join(', ') : 'Not specified',
      _subject:  'New Collection Inquiry — Ten Contemporare',
      _template: 'table',
      _honey:    '',
    };

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

    fetch('https://formsubmit.co/ajax/hello@tencontemporare.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(r => r.json())
      .then(result => {
        if (result.success === 'true' || result.success === true) {
          goToStep(5);
        } else {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Enquiry'; }
          showCMError(submitBtn);
        }
      })
      .catch(() => {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Enquiry'; }
        showCMError(submitBtn);
      });
  });

  function showCMError() {
    let el = document.getElementById('cmSubmitErr');
    if (!el) {
      el = document.createElement('p');
      el.id = 'cmSubmitErr';
      el.style.cssText = 'color:#c44;font-size:0.8rem;margin-top:0.75rem;';
      const nav = document.querySelector('#cmForm .cm-nav');
      if (nav) nav.insertAdjacentElement('afterend', el);
    }
    el.textContent = 'Something went wrong — please email hello@tencontemporare.com directly.';
  }
})();

/* ── Contact Form (contact.html) ── */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const nameEl    = form.querySelector('#cf-name');
    const emailEl   = form.querySelector('#cf-email');
    const messageEl = form.querySelector('#cf-message');
    const gdprEl    = form.querySelector('#cf-gdpr');
    const gdprError = form.querySelector('#cf-gdpr-error');
    const submitBtn = form.querySelector('[type="submit"]');

    if (gdprEl && !gdprEl.checked) {
      if (gdprError) gdprError.style.display = 'block';
      gdprEl.focus();
      return;
    }
    if (gdprError) gdprError.style.display = 'none';

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

    fetch('https://formsubmit.co/ajax/hello@tencontemporare.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name:     nameEl    ? nameEl.value.trim()    : '',
        email:    emailEl   ? emailEl.value.trim()   : '',
        message:  messageEl ? messageEl.value.trim() : '',
        _subject: 'General Enquiry — Ten Contemporare',
        _template: 'table',
        _honey:   '',
      }),
    })
      .then(r => r.json())
      .then(result => {
        if (result.success === 'true' || result.success === true) {
          // Replace form with success state using safe DOM construction.
          const wrapper = document.createElement('div');
          wrapper.className = 'contact-success';
          wrapper.setAttribute('role', 'status');

          const label = document.createElement('p');
          label.className = 'eyebrow gold';
          label.textContent = 'Message received';

          const heading = document.createElement('h3');
          heading.className = 'display-title';
          heading.textContent = "Thank you. We'll be in touch within two working days.";

          wrapper.appendChild(label);
          wrapper.appendChild(heading);
          form.replaceWith(wrapper);
        } else {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
        }
      })
      .catch(() => {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
      });
  });
})();

/* ── Logo — inject brand mark across all logo placements ── */
(function initLogo() {
  function logoImg(cls, alt, ariaHidden) {
    const el = document.createElement('img');
    el.src = '/assets/10c-logo.jpg';
    el.alt = alt || '';
    el.className = cls;
    if (ariaHidden) el.setAttribute('aria-hidden', 'true');
    return el;
  }

  // Navbar wordmark → logo image
  const navText = document.querySelector('.nav-logo-text');
  if (navText) navText.replaceWith(logoImg('nav-logo-img', 'Ten Contemporare'));

  // Loader wordmark → logo image
  const loaderWord = document.querySelector('.loader-wordmark');
  if (loaderWord) loaderWord.replaceWith(logoImg('loader-logo', 'Ten Contemporare'));

  // Mobile menu — prepend logo above links
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu) mobileMenu.insertAdjacentElement('afterbegin', logoImg('mm-logo', 'Ten Contemporare'));

  // Footer brand name — prepend logo above text
  const footerBrand = document.querySelector('.footer-brand-name');
  if (footerBrand) footerBrand.insertAdjacentElement('beforebegin', logoImg('footer-logo', '', true));
})();

/* ── Chat Widget — gallery assistant ── */
(function initChatWidget() {
  const KNOWLEDGE = [
    {
      match: ['hello','hi','hey','start','help','morning','afternoon','evening','greet'],
      text: 'Welcome to Ten Contemporare. I can help you explore our artists and exhibitions, plan a visit, or start a conversation about acquiring a work.\n\nWhat would you like to know?',
      replies: ['Meet the artists','Current exhibition','Visit the gallery','Begin collecting'],
    },
    {
      match: ['artist','artists','represented','roster','who','represent'],
      text: 'We represent three Filipino contemporary artists:\n\n• Raymond Loyola — oil on canvas; figurative and landscape\n• Summer Pasana — mixed media; spatial and textural\n• Jonet Carpio — oil on canvas; figurative and historical\n\nWould you like to know more about any of them?',
      replies: ['Raymond Loyola','Summer Pasana','Jonet Carpio','See the collection'],
    },
    {
      match: ['raymond','loyola'],
      text: 'Raymond Loyola works in oil on canvas — figurative and landscape subjects defined by precision and a sustained study of light and memory. Several works are currently available for acquisition.',
      replies: ['See available works','Begin collecting','Other artists'],
    },
    {
      match: ['summer','pasana'],
      text: 'Summer Pasana brings an architectural intelligence to mixed media practice. Her work occupies the threshold between structure and texture — each composition a deliberate decision about where the eye should rest. Works available.',
      replies: ['See available works','Begin collecting','Other artists'],
    },
    {
      match: ['jonet','carpio'],
      text: 'Jonet Carpio works in oil on canvas and has recently expanded into sculpture. His figurative and historical work carries maximum narrative weight with minimum gesture. First sculptural works are now available.',
      replies: ['See available works','Begin collecting','Other artists'],
    },
    {
      match: ['exhibition','show','showing','current','now on','on view','on show'],
      text: 'Our current exhibition features works across both gallery spaces — Pioneer Center in Kapitolyo, Pasig and St. Ignatius in Katipunan, Quezon City.\n\nFull curatorial notes and featured works are on the exhibitions page.',
      replies: ['View exhibitions','Plan a visit','Meet the artists'],
    },
    {
      match: ['visit','location','address','where','hours','open','directions','how to get','kapitolyo','katipunan','pasig','quezon'],
      text: 'Ten Contemporare has two spaces in Metro Manila:\n\n• Kapitolyo — Pioneer Center, Pasig City\n• Katipunan — 138 St. Ignatius, Whiteplains, QC\n\nFor current hours and map links, see our Visit page.',
      replies: ['Get directions','Contact the gallery'],
    },
    {
      match: ['collect','buy','purchase','acquire','price','cost','how much','available','for sale','inquire','enquire','invest','investment'],
      text: 'Every acquisition begins with a conversation — no pricing is shown publicly. We work carefully with collectors at every stage.\n\nOur team responds within 48 hours.',
      replies: ['Begin collecting'],
      action: 'collect',
    },
    {
      match: ['contact','email','phone','reach','talk','speak','touch'],
      text: 'You can reach the gallery at:\n\nhello@tencontemporare.com\n+63 926 066 8995\n\nWe respond within 48 hours.',
      replies: ['Begin collecting','Plan a visit'],
    },
    {
      match: ['about','mission','story','who are you','what is','gallery'],
      text: 'Ten Contemporare presents Filipino contemporary art with the seriousness it deserves. We work with a small number of artists and collectors at a time — quality over volume, always.',
      replies: ['Meet the artists','Visit the gallery','Begin collecting'],
    },
  ];

  const NAV_ROUTES = {
    'View exhibitions':   '/exhibitions',
    'Meet the artists':   '/artists',
    'See the collection': '/works',
    'See available works':'/works',
    'Plan a visit':       '/visit',
    'Get directions':     '/visit',
    'Contact the gallery':'/contact',
    'Other artists':      '/artists',
  };

  const FALLBACK = {
    text: "I don't have a specific answer for that, but our team would be happy to help.\n\nYou can reach us at hello@tencontemporare.com or use the form below.",
    replies: ['Begin collecting','Contact the gallery','Meet the artists'],
  };

  /* ── Inject widget HTML ── */
  document.body.insertAdjacentHTML('beforeend', `
<button class="cw-launcher" id="cwLauncher" aria-label="Open gallery assistant" aria-expanded="false">
  <img src="/assets/10c-logo.jpg" alt="" class="cw-launcher-logo" aria-hidden="true">
  <span class="cw-launcher-x" aria-hidden="true"></span>
</button>
<div class="cw-panel" id="cwPanel" role="dialog" aria-label="Ten Contemporare Gallery Assistant" aria-hidden="true">
  <div class="cw-head">
    <img src="/assets/10c-logo.jpg" alt="" class="cw-head-logo" aria-hidden="true">
    <div class="cw-head-info">
      <span class="cw-head-name">Ten Contemporare</span>
      <span class="cw-head-sub">Gallery Assistant</span>
    </div>
    <span class="cw-head-dot" aria-hidden="true"></span>
  </div>
  <div class="cw-messages" id="cwMessages"></div>
  <div class="cw-footer">
    <input class="cw-input" id="cwInput" type="text" placeholder="Ask anything…" autocomplete="off" aria-label="Message">
    <button class="cw-send" id="cwSend" aria-label="Send">
      <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 6h10M6 1l5 5-5 5" stroke="rgba(248,247,244,0.9)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</div>`);

  const launcher  = document.getElementById('cwLauncher');
  const panel     = document.getElementById('cwPanel');
  const messages  = document.getElementById('cwMessages');
  const input     = document.getElementById('cwInput');
  let isOpen      = false;
  let greeted     = false;

  function openWidget() {
    isOpen = true;
    launcher.classList.add('open');
    launcher.setAttribute('aria-expanded', 'true');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    input.focus();
    if (!greeted) { greeted = true; addBotMessage(KNOWLEDGE[0].text, KNOWLEDGE[0].replies); }
  }
  function closeWidget() {
    isOpen = false;
    launcher.classList.remove('open');
    launcher.setAttribute('aria-expanded', 'false');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  }

  launcher.addEventListener('click', () => isOpen ? closeWidget() : openWidget());
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closeWidget(); });

  function scrollBottom() { setTimeout(() => { messages.scrollTop = messages.scrollHeight; }, 50); }

  function addUserMessage(text) {
    const wrap = document.createElement('div');
    wrap.className = 'cw-msg user';
    const bubble = document.createElement('div');
    bubble.className = 'cw-bubble';
    bubble.textContent = text;
    wrap.appendChild(bubble);
    messages.appendChild(wrap);
    scrollBottom();
  }

  function addTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'cw-typing-wrap';
    wrap.id = 'cwTyping';
    wrap.innerHTML = '<div class="cw-typing"><span></span><span></span><span></span></div>';
    messages.appendChild(wrap);
    scrollBottom();
    return wrap;
  }

  function addBotMessage(text, replies) {
    const wrap = document.createElement('div');
    wrap.className = 'cw-msg bot';

    const bubble = document.createElement('div');
    bubble.className = 'cw-bubble';
    bubble.textContent = text;
    wrap.appendChild(bubble);

    if (replies && replies.length) {
      const qr = document.createElement('div');
      qr.className = 'cw-quick-replies';
      replies.forEach(label => {
        const btn = document.createElement('button');
        btn.className = 'cw-qr';
        btn.textContent = label;
        btn.addEventListener('click', () => handleReply(label, btn));
        qr.appendChild(btn);
      });
      wrap.appendChild(qr);
    }
    messages.appendChild(wrap);
    scrollBottom();
  }

  function handleReply(label, btn) {
    // Disable all quick reply buttons in this group
    btn.closest('.cw-quick-replies').querySelectorAll('.cw-qr').forEach(b => { b.disabled = true; b.style.opacity = '0.4'; });
    addUserMessage(label);

    if (label === 'Begin collecting') {
      setTimeout(() => {
        addBotMessage("I'll open our collection enquiry form for you now. One moment.", []);
        setTimeout(() => {
          closeWidget();
          const collectModal = document.getElementById('collectModal');
          if (collectModal) {
            const ev = new CustomEvent('openCollectModal');
            document.dispatchEvent(ev);
          } else {
            document.querySelector('a[href="#collect"], a[href="/#collect"]')?.click();
          }
        }, 900);
      }, 300);
      return;
    }

    if (NAV_ROUTES[label]) {
      setTimeout(() => {
        addBotMessage(`Taking you to ${label.toLowerCase()}…`, []);
        setTimeout(() => { window.location.href = NAV_ROUTES[label]; }, 900);
      }, 300);
      return;
    }

    respond(label);
  }

  function respond(userText) {
    const typing = addTyping();
    const lower  = userText.toLowerCase();
    const match  = KNOWLEDGE.find(k => k.match.some(kw => lower.includes(kw)));
    const result = match || FALLBACK;

    setTimeout(() => {
      typing.remove();
      addBotMessage(result.text, result.replies || []);
      if (result.action === 'collect') {
        setTimeout(() => {
          const ev = new CustomEvent('openCollectModal');
          document.dispatchEvent(ev);
          closeWidget();
        }, 1200);
      }
    }, 800 + Math.random() * 400);
  }

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addUserMessage(text);
    respond(text);
  }

  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
  document.getElementById('cwSend').addEventListener('click', sendMessage);

  // Allow collect modal to be opened from the chatbot
  document.addEventListener('openCollectModal', () => {
    const modal = document.getElementById('collectModal');
    if (!modal) return;
    if (!modal.classList.contains('open')) {
      modal.querySelectorAll('.cm-step').forEach((s,i) => s.classList.toggle('active', i === 0));
    }
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
})();


/* ── Entrance Animations — GSAP spring physics (Framer Motion feel) ── */
(function initEntranceAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const SPRING = 'back.out(1.7)';
  const EASE   = 'power4.out';
  const EX     = 'expo.out';

  function curtainUp(target, trigger, delay = 0) {
    if (!target) return;
    gsap.fromTo(target,
      { clipPath: 'inset(100% 0 0 0)' },
      { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: EX, delay,
        onComplete() { gsap.set(target, { clearProps: 'clipPath' }); },
        scrollTrigger: { trigger, start: 'top 82%', once: true } });
  }

  function curtainRight(target, trigger, delay = 0) {
    if (!target) return;
    gsap.fromTo(target,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 1.5, ease: EX, delay,
        onComplete() { gsap.set(target, { clearProps: 'clipPath' }); },
        scrollTrigger: { trigger, start: 'top 80%', once: true } });
  }

  function enter(targets, triggerEl, opts = {}) {
    if (!targets) return;
    if (targets.length !== undefined && !targets.length) return;
    const st = { trigger: triggerEl, start: opts.start ?? 'top 86%', once: true };
    const tl = gsap.timeline({ scrollTrigger: st });
    tl.from(targets, {
      y: opts.y ?? 48, x: opts.x ?? 0, scale: opts.scale ?? 1,
      duration: opts.dur ?? 0.85, stagger: opts.stagger ?? 0,
      delay: opts.delay ?? 0, ease: opts.ease ?? SPRING,
    }, 0).from(targets, {
      opacity: 0, duration: (opts.dur ?? 0.85) * 0.65,
      stagger: opts.stagger ?? 0, delay: opts.delay ?? 0, ease: 'power2.out',
    }, 0);
  }

  /* Hero (homepage only) */
  if (document.querySelector('.hero-content')) {
    gsap.fromTo('.hero-eyebrow',       { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.65, ease: EASE,   delay: 0.4  });
    gsap.fromTo('.hero-title',         { opacity: 0, y: 56 }, { opacity: 1, y: 0, duration: 1.0,  ease: SPRING, delay: 0.55 });
    gsap.fromTo('.hero-statement',     { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.85, ease: EASE,   delay: 0.75 });
    gsap.fromTo('.hero-actions',       { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.75, ease: EASE,   delay: 0.9  });
    gsap.fromTo('.hero-exhibition-bar',{ opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.65, ease: EASE,   delay: 1.1  });
    gsap.fromTo('.hero-scroll-hint',   { opacity: 0 },        { opacity: 1,        duration: 0.6,  ease: EASE,   delay: 1.4  });
  }

  /* Inner page header */
  const ih = document.querySelector('.inner-header');
  if (ih) {
    const ey  = ih.querySelector('.eyebrow');
    const h1  = ih.querySelector('h1');
    const sub = ih.querySelector('p:not(.eyebrow)');
    if (ey)  gsap.fromTo(ey,  { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.65, ease: EASE,   delay: 0.25 });
    if (h1)  gsap.fromTo(h1,  { opacity: 0, y: 56 }, { opacity: 1, y: 0, duration: 1.0,  ease: SPRING, delay: 0.4  });
    if (sub) gsap.fromTo(sub, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.8,  ease: EASE,   delay: 0.6  });
  }

  /* Artworks */
  enter('.artworks-section .section-title', '.artworks-section', { y: 56, dur: 1.0 });
  enter('.artworks-section .section-link',  '.artworks-section', { y: 20, dur: 0.7, ease: EASE, delay: 0.2 });
  document.querySelectorAll('.artwork-row').forEach(row => {
    const media = row.querySelector('.artwork-media');
    const info  = row.querySelector('.artwork-info');
    if (!media || !info) return;
    curtainUp(media, row);
    const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 84%', once: true } });
    tl.from(info.querySelectorAll('.artwork-index, .artwork-artist'),
      { x: -24, opacity: 0, duration: 0.65, stagger: 0.08, delay: 0.2, ease: EASE }, 0);
    enter(info.querySelector('.artwork-title'), row, { y: 56, dur: 1.0, delay: 0.2 });
    enter(info.querySelectorAll('.artwork-desc, .artwork-link'), row,
      { y: 28, stagger: 0.1, dur: 0.75, ease: EASE, delay: 0.36 });
  });

  /* Gallery statement */
  enter('.statement-label', '.statement-section', { y: 18, dur: 0.7, ease: EASE });
  enter('.statement-body',  '.statement-section', { y: 56, dur: 1.0, delay: 0.14 });
  enter(document.querySelectorAll('.statement-detail p'), '.statement-section',
    { y: 24, stagger: 0.12, dur: 0.8, ease: EASE, delay: 0.24 });

  /* Exhibition feature */
  curtainRight('.ef-image', '.exhibition-feature');
  enter('.ef-meta',  '.ef-content', { y: 18, dur: 0.65, ease: EASE, delay: 0.28 });
  enter('.ef-title', '.ef-content', { y: 56, dur: 1.0,             delay: 0.36 });
  enter(document.querySelectorAll('.ef-text, .ef-dates, .exhibition-feature .btn-primary'),
    '.ef-content', { y: 24, stagger: 0.1, dur: 0.8, ease: EASE, delay: 0.5 });

  /* Past exhibitions */
  enter('.exhibitions-section .section-title', '.exhibitions-section', { y: 40, dur: 0.9 });
  gsap.from('.pe-card', {
    y: 56, opacity: 0, scale: 0.93, duration: 0.85, ease: SPRING,
    stagger: { each: 0.1, from: 'start' },
    scrollTrigger: { trigger: '.pe-grid', start: 'top 84%', once: true },
  });

  /* Artists */
  enter('.artists-section .section-title', '.artists-section', { y: 40, dur: 0.9 });
  document.querySelectorAll('.artist-card').forEach((card, i) => {
    const img = card.querySelector('.ac-img-wrap');
    if (img) curtainUp(img, '.artists-grid', i * 0.12);
    gsap.from(card, {
      y: 56, opacity: 0, scale: 0.94, duration: 0.85, delay: i * 0.1, ease: SPRING,
      scrollTrigger: { trigger: '.artists-grid', start: 'top 84%', once: true },
    });
    enter(card.querySelector('.ac-info'), card, { y: 24, dur: 0.8, delay: 0.22 + i * 0.08 });
  });

  /* Collect funnel */
  enter('.collect-section .eyebrow', '.collect-intro', { y: 18, dur: 0.65, ease: EASE });
  enter('.collect-headline', '.collect-intro', { y: 56, dur: 1.0,  delay: 0.14 });
  enter('.collect-subtext',  '.collect-intro', { y: 28, dur: 0.8,  ease: EASE, delay: 0.26 });
  gsap.from('.funnel', {
    y: 40, opacity: 0, duration: 0.9, ease: EASE,
    scrollTrigger: { trigger: '.funnel', start: 'top 87%', once: true },
  });

  /* About */
  curtainUp('.about-image', '.about-section');
  enter('.about-content .eyebrow', '.about-content', { y: 18, dur: 0.65, ease: EASE, delay: 0.2 });
  enter('.about-title', '.about-content', { y: 56, dur: 1.0, delay: 0.28 });
  enter(document.querySelectorAll('.about-body, .about-quote, .about-section .btn-primary'),
    '.about-content', { y: 28, stagger: 0.14, dur: 0.85, ease: EASE, delay: 0.4 });

  /* Generic inner-page reveal rows */
  document.querySelectorAll('.reveal-row').forEach(row => {
    enter(row, row, { y: 40, dur: 0.85 });
  });

  /* Footer */
  gsap.from('.footer-top > *', {
    y: 28, opacity: 0, duration: 0.8, stagger: 0.09, ease: EASE,
    scrollTrigger: { trigger: 'footer', start: 'top 90%', once: true },
  });
})();

/* ── Smooth anchor scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
