/* ==========================================================================
   site.js  -  shared behaviour for every page that uses site.css
   (GSAP 3 + ScrollTrigger + Lenis). It builds the same background, cursor,
   ruler, navigation and footer on each page, then runs the page's own code:

       Site.start(() => { ...page-specific code... });

   To add a page to the navigation, edit PAGES below. To change the footer
   wordmark, edit BRAND. Both change on every page at once.
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------------ */
  /* Edit these                                                           */
  /* ------------------------------------------------------------------ */
  const BRAND = { heavy: 'OBLIQN', light: 'Studio' };   // footer wordmark
  const CONTACT_PAGE = 'connect.html';
  const PAGES = [                                       // navigation + footer links
    { key: 'portfolio', href: 'index.html', label: 'Portfolio' },
    { key: 'podcast', href: 'podcast.html', label: 'Podcast' },
    { key: 'info', href: 'Info.html', label: 'Info' },
    { key: 'connect', href: 'connect.html', label: 'Connect' },
  ];
  const FOOTER_EXTRA = [{ href: 'Allproject.html', label: 'All Projects' }];
  const INSTAGRAM = 'https://www.instagram.com/_vixvo/';
  const LINKEDIN = 'https://www.linkedin.com/posts/hemant-malviya-82872825b_showreel2024-videoeditor-3d-activity-7282058799908110336-Cv-6/?utm_source=social_share_send&utm_medium=android_app&rcm=ACoAAEAAYKABEGWyuX9QHnmvgK_JB7vQSyrjb7Y&utm_campaign=whatsapp';

  /* ------------------------------------------------------------------ */
  /* Mount the shared page chrome (works even if GSAP fails to load)      */
  /* ------------------------------------------------------------------ */
  function mount() {
    const page = document.body.dataset.page || '';
    const firstScene = $('.scene');
    const firstLabel = firstScene ? firstScene.dataset.label : '';
    const navLinks = PAGES.map((p) => `<a href="${p.href}"${p.key === page ? ' aria-current="page"' : ''}>${p.label}</a>`).join('');
    const footLinks = PAGES.concat(FOOTER_EXTRA.map((p) => ({ key: '', ...p })))
      .map((p) => `<a class="roll" href="${p.href}" data-t="${p.label}"${p.key && p.key === page ? ' aria-current="page"' : ''}><span>${p.label}</span></a>`).join('');
    const fig = '<svg class="fig" viewBox="0 0 100 300" preserveAspectRatio="xMidYMax meet"><circle cx="50" cy="28" r="16"/><path d="M22 70Q50 56 78 70L84 160 70 160 68 300 54 300 52 190 48 190 46 300 32 300 30 160 16 160Z"/></svg>';
    const figs = [0.4, 0.8, 1.2, 0.7, 1.0, 0.5].map((d, i) => `<span class="fig-wrap fig-wrap--${i + 1}" data-d="${d}">${fig}</span>`).join('');

    const chrome = `
  <div class="field" aria-hidden="true"></div>
  <div class="spot spot--slow" aria-hidden="true"></div>
  <div class="spot spot--fast" aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>
  <div class="cursor" id="cursor" aria-hidden="true"><span class="cursor__dot"></span><span class="cursor__ring"><span class="cursor__shape"><span class="cursor__label"></span></span></span></div>
  <div class="ruler" id="ruler" role="presentation" data-cursor="Jump"><div class="ruler__ticks" id="rulerTicks"></div><span class="ruler__tip" id="rulerTip"></span></div>
  <p class="sec-label" id="secLabel" aria-live="polite"><span class="sec-label__mask"><span id="secLabelText">${firstLabel}</span></span><span class="sec-label__arrow" aria-hidden="true">↓</span></p>
  <div class="navbar">
    <div class="logo-area"><img src="logo.svg" alt="Logo" /><div class="kanji">平満翔</div></div>
    <nav class="center-nav" aria-label="Main">${navLinks}</nav>
    <div class="right-links">
      <a href="${INSTAGRAM}" target="_blank" rel="noopener">Instagram</a>
      <a href="${LINKEDIN}" target="_blank" rel="noopener">LinkedIn</a>
    </div>
  </div>
  ${page === 'connect' ? '' : `<a class="cta-fixed" id="ctaFixed" href="${CONTACT_PAGE}" data-magnetic>Book an edit</a>`}`;

    const footer = `
  <footer class="pf scene" id="footer" data-label="The end" data-c1="#1E1E1E" data-c2="#0B0B0B">
    <div class="pf__card" id="pfCard">
      <div class="pf__sky" aria-hidden="true">
        <div class="pf__glow"></div>
        <div class="pf__streaks"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="pf__crowd">${figs}</div>
        <div class="pf__fade"></div>
      </div>
      <div class="pf__content">
        <div class="pf__row pf__row--top">
          <nav class="pf__nav" aria-label="Site map">${footLinks}</nav>
          <div class="pf__mid">
            <p class="pf__label">Start an edit:</p>
            <p class="pf__text">Send the raw files and I'll reply with how I'd cut your episode.</p>
            <div class="pf__social">
              <a href="${LINKEDIN}" aria-label="LinkedIn" target="_blank" rel="noopener" data-magnetic><img src="Linkedin.svg" alt="" /></a>
              <a href="${INSTAGRAM}" aria-label="Instagram" target="_blank" rel="noopener" data-magnetic><img src="Instagram.svg" alt="" /></a>
            </div>
          </div>
          <div class="pf__right">
            <p class="pf__text pf__text--r">Podcast trailers, full edits and clips.</p>
            <a class="pf__badge" href="${CONTACT_PAGE}" data-cursor="Connect"><img src="logo.svg" alt="" /><span>Video editor</span><small>Hemant Malviya</small></a>
          </div>
        </div>
        <div class="pf__row pf__row--bottom">
          <p class="pf__small">© 2026 Hemant Malviya.<br />All Rights Reserved.</p>
          <button class="pf__small pf__topbtn" id="pfTop" type="button" data-cursor="Top">Back to top</button>
          <p class="pf__small pf__small--r">Handmade by Hemant</p>
        </div>
        <p class="pf__mark" id="pfMark" aria-label="${BRAND.heavy} ${BRAND.light}"><span class="pf__heavy" aria-hidden="true">${BRAND.heavy}</span> <span class="pf__light" aria-hidden="true">${BRAND.light}</span></p>
      </div>
    </div>
  </footer>`;

    document.body.insertAdjacentHTML('afterbegin', chrome);
    const main = $('main');
    if (main) main.insertAdjacentHTML('afterend', footer);
    else document.body.insertAdjacentHTML('beforeend', footer);
  }
  mount();

  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('js');
    window.Site = { ready: false, start() {} };
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  if (window.ScrollToPlugin) gsap.registerPlugin(window.ScrollToPlugin);

  /* ------------------------------------------------------------------ */
  /* Smooth scrolling                                                    */
  /* ------------------------------------------------------------------ */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToY = (y) => {
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const t = $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    scrollToY(t.getBoundingClientRect().top + window.scrollY);
  }));

  /* ------------------------------------------------------------------ */
  /* Helpers: capsule, text splitting, weight field                       */
  /* ------------------------------------------------------------------ */
  function buildCapsule(el, n) {
    el.innerHTML = '<div class="capsule__cap"></div><div class="capsule__body"><div class="capsule__bars"></div><span class="capsule__tag">vixvo</span></div>';
    const wrap = $('.capsule__bars', el);
    const bars = [];
    for (let i = 0; i < n; i++) {
      const b = document.createElement('i');
      b._env = Math.sin(Math.PI * (i + 0.5) / n);
      wrap.appendChild(b);
      bars.push(b);
    }
    const cap = { el, bars, body: $('.capsule__body', el), tweens: [] };
    cap.tweens = bars.map((b) => {
      const base = 0.16 + 0.5 * b._env;
      gsap.set(b, { scaleX: base });
      return gsap.to(b, {
        scaleX: Math.min(1, base + 0.22 + rand(0, 0.3)),
        duration: rand(0.18, 0.42), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: rand(0, 0.4),
        paused: reduce,
      });
    });
    if (!reduce) setRate(cap, 0.25);
    return cap;
  }
  function setRate(cap, r) {
    cap.tweens.forEach((t) => {
      if (reduce) t.paused(r < 0.5);
      else gsap.to(t, { timeScale: r, duration: 0.5, overwrite: true });
    });
  }

  function splitChars(el) {
    const chars = [];
    $$('.line', el).forEach((line) => {
      const txt = line.textContent;
      line.textContent = '';
      const words = txt.split(' ');
      words.forEach((w, wi) => {
        const ws = document.createElement('span');
        ws.className = 'word';
        [...w].forEach((c) => {
          const s = document.createElement('span');
          s.className = 'ch';
          s.textContent = c;
          ws.appendChild(s);
          chars.push(s);
        });
        line.appendChild(ws);
        if (wi < words.length - 1) line.appendChild(document.createTextNode(' '));
      });
    });
    return chars;
  }

  // Letters get heavier the closer the cursor is: a variable-font hover effect.
  function weightField(host, chars, base = 600, min = 400, max = 900, radius = 170) {
    if (!fine) return;
    let mx = -1e4, my = -1e4, queued = false;
    const upd = () => {
      queued = false;
      chars.forEach((c) => {
        const r = c.getBoundingClientRect();
        const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
        c.style.fontWeight = Math.round(min + (max - min) * Math.exp(-(d * d) / (2 * radius * radius)));
      });
    };
    host.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!queued) { queued = true; requestAnimationFrame(upd); }
    });
    host.addEventListener('pointerleave', () => {
      queued = true;
      gsap.to(chars, { fontWeight: base, duration: 0.7, ease: 'power2.out', overwrite: true, onComplete: () => { queued = false; } });
    });
  }

  const mm = gsap.matchMedia();

  window.Site = { ready: true, $, $$, clamp, rand, reduce, fine, scrollToY, buildCapsule, setRate, splitChars, weightField, mm, start };

  /* ------------------------------------------------------------------ */
  /* Start: shared setup, then the page's code, then final layout pass    */
  /* ------------------------------------------------------------------ */
  function start(pageInit) {
    Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(() => run(pageInit));
  }

  function run(pageInit) {
    const scenes = $$('.scene');

    /* ---------------- Cursor + spotlights ---------------- */
    const cursor = $('#cursor');
    if (fine) {
      root.classList.add('has-cursor');
      const dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
      const dX = gsap.quickTo(dot, 'x', { duration: 0.06 }), dY = gsap.quickTo(dot, 'y', { duration: 0.06 });
      const rX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), rY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
      const s1x = gsap.quickTo('.spot--slow', 'x', { duration: 1.3, ease: 'power3' }), s1y = gsap.quickTo('.spot--slow', 'y', { duration: 1.3, ease: 'power3' });
      const s2x = gsap.quickTo('.spot--fast', 'x', { duration: 0.5, ease: 'power3' }), s2y = gsap.quickTo('.spot--fast', 'y', { duration: 0.5, ease: 'power3' });
      window.addEventListener('pointermove', (e) => {
        cursor.classList.add('is-on');
        dX(e.clientX); dY(e.clientY); rX(e.clientX); rY(e.clientY);
        s1x(e.clientX); s1y(e.clientY); s2x(e.clientX); s2y(e.clientY);
      });
      document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
      document.addEventListener('pointerover', (e) => {
        const t = e.target.closest('[data-cursor], a, button, [role="button"]');
        cursor.classList.remove('is-link', 'is-label', 'is-text');
        if (e.target.closest('input, textarea')) { cursor.classList.add('is-text'); return; }
        if (!t) return;
        const txt = t.dataset.cursor;
        if (txt) { label.textContent = txt; cursor.classList.add('is-label'); }
        else cursor.classList.add('is-link');
      });
      window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
      window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));

      // magnetic buttons
      const mags = $$('[data-magnetic]').map((el) => ({
        el, x: gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' }),
      }));
      window.addEventListener('pointermove', (e) => {
        mags.forEach((m) => {
          const r = m.el.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
          if (Math.hypot(dx, dy) < Math.max(r.width, 120)) { m.x(dx * 0.35); m.y(dy * 0.35); } else { m.x(0); m.y(0); }
        });
      });
    }
    // tile spotlight
    $$('.tile').forEach((t) => t.addEventListener('pointermove', (e) => {
      const r = t.getBoundingClientRect();
      t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      t.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));

    /* ---------------- Scene colour morph + label ---------------- */
    const labelEl = $('#secLabelText');
    const ctaFixed = $('#ctaFixed');
    let curScene = null;
    function setScene(s) {
      if (curScene === s) return;
      curScene = s;
      gsap.to(root, { '--c1': s.dataset.c1, '--c2': s.dataset.c2, duration: reduce ? 0 : 1.1, ease: 'power2.out', overwrite: 'auto' });
      if (ctaFixed) ctaFixed.classList.toggle('is-hidden', s.classList.contains('scene--cta') || s.id === 'footer');
      $('#secLabel').classList.toggle('is-hidden', s.id === 'footer');
      if (reduce) { labelEl.textContent = s.dataset.label; return; }
      gsap.to(labelEl, {
        yPercent: -110, duration: 0.22, ease: 'power2.in', overwrite: true,
        onComplete() {
          labelEl.textContent = curScene.dataset.label;
          gsap.fromTo(labelEl, { yPercent: 110 }, { yPercent: 0, duration: 0.35, ease: 'power3.out' });
        },
      });
    }
    function detectScene() {
      const y = innerHeight * 0.55;
      for (const s of scenes) {
        const r = s.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) { setScene(s); return; }
      }
    }

    /* ---------------- Ruler ---------------- */
    const ruler = $('#ruler'), ticksWrap = $('#rulerTicks'), tip = $('#rulerTip');
    const N = 96, ticks = [];
    for (let i = 0; i < N; i++) {
      const t = document.createElement('i');
      if (i % 8 === 0) t.className = 'major';
      ticksWrap.appendChild(t); ticks.push(t);
    }
    let lastIdx = -1;
    const setProg = (p) => {
      const idx = Math.round(p * (N - 1));
      if (idx === lastIdx) return;
      ticks.forEach((t, i) => t.classList.toggle('on', i <= idx));
      lastIdx = idx;
    };
    let starts = [];
    const measureStarts = () => {
      const max = ScrollTrigger.maxScroll(window) || 1;
      starts = scenes.map((s) => {
        const host = s.parentNode.classList.contains('pin-spacer') ? s.parentNode : s;
        return { name: s.dataset.label, ratio: clamp((host.getBoundingClientRect().top + window.scrollY) / max, 0, 1) };
      });
    };
    ScrollTrigger.addEventListener('refresh', measureStarts);
    const ratioAt = (x) => { const r = ticksWrap.getBoundingClientRect(); return clamp((x - r.left) / r.width, 0, 1); };
    ruler.addEventListener('pointermove', (e) => {
      const rr = ticksWrap.getBoundingClientRect();
      ticks.forEach((t) => {
        const tr = t.getBoundingClientRect();
        const d = Math.abs(e.clientX - (tr.left + 0.5));
        t.style.transform = 'scaleY(' + (1 + 2.4 * Math.exp(-(d * d) / (2 * 55 * 55))).toFixed(2) + ')';
      });
      const ratio = ratioAt(e.clientX);
      let name = starts.length ? starts[0].name : '';
      starts.forEach((s) => { if (s.ratio <= ratio + 0.001) name = s.name; });
      tip.textContent = name;
      tip.style.left = (e.clientX - ruler.getBoundingClientRect().left) + 'px';
    });
    ruler.addEventListener('pointerleave', () => ticks.forEach((t) => { t.style.transform = ''; }));
    ruler.addEventListener('click', (e) => scrollToY(ratioAt(e.clientX) * ScrollTrigger.maxScroll(window)));

    // Scene detection runs a frame later: pins created after this trigger
    // update after it, so reading positions inside onUpdate can be stale.
    let detectQueued = false;
    const queueDetect = () => {
      if (detectQueued) return;
      detectQueued = true;
      requestAnimationFrame(() => { detectQueued = false; detectScene(); });
    };
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => { setProg(self.progress); queueDetect(); },
    });
    ScrollTrigger.addEventListener('scrollEnd', queueDetect);


    /* ---------------- FOOTER ---------------- */
    (() => {
      const card = $('#pfCard'), mark = $('#pfMark'), wrapEl = $('.pf__content');
      // Fit the wordmark edge to edge
      const fit = () => {
        mark.style.fontSize = '100px';
        const avail = wrapEl.clientWidth - parseFloat(getComputedStyle(wrapEl).paddingLeft) * 2;
        const natural = mark.scrollWidth || 1;
        mark.style.fontSize = Math.floor(100 * (avail / natural) * 0.985) + 'px';
      };
      fit();
      window.addEventListener('resize', fit);
      if (document.fonts) document.fonts.ready.then(fit);

      const figs = $$('.fig-wrap', card), streaks = $$('.pf__streaks i', card);
      if (!reduce) {
        figs.forEach((f) => gsap.to(f, { x: rand(-10, 10), skewX: rand(-1.6, 1.6), duration: rand(3.2, 5.5), yoyo: true, repeat: -1, ease: 'sine.inOut' }));
        streaks.forEach((s) => gsap.to(s, { xPercent: rand(-7, 7), duration: rand(6, 11), yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      }
      if (fine) {
        const g = { x: 62 };
        const setX = (v) => { gsap.to(g, { x: v, duration: 0.9, ease: 'power3', overwrite: true, onUpdate: () => card.style.setProperty('--gx', g.x + '%') }); };
        const par = figs.map((f) => gsap.quickTo(f, 'xPercent', { duration: 1, ease: 'power3' }));
        card.addEventListener('pointermove', (e) => {
          const r = card.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width;
          setX(clamp(nx * 100, 8, 92));
          figs.forEach((f, i) => par[i]((0.5 - nx) * 22 * parseFloat(f.dataset.d)));
        });
        card.addEventListener('pointerleave', () => { setX(62); par.forEach((p) => p(0)); });
      }
      $('#pfTop').addEventListener('click', () => scrollToY(0));
    })();

    if (pageInit) pageInit();

    /* ---------------- CTA title (any page with #ctaTitle) ---------------- */
    // Runs after the page's own pins exist, so its trigger position is right.
    const ctaTitle = $('#ctaTitle');
    if (ctaTitle) {
      const ctaScene = ctaTitle.closest('.scene');
      const ctaChars = splitChars(ctaTitle);
      ctaTitle.style.visibility = 'visible';
      if (!reduce) {
        gsap.set(ctaChars, { yPercent: 115 });
        const play = () => gsap.to(ctaChars, { yPercent: 0, duration: 1.1, stagger: 0.03, ease: 'power4.out' });
        if (ctaScene.getBoundingClientRect().top < innerHeight * 0.6) play();
        else ScrollTrigger.create({ trigger: ctaScene, start: 'top 60%', once: true, onEnter: play });
      }
      weightField(ctaScene, ctaChars);
    }

    /* ---------------- Go ---------------- */
    ScrollTrigger.refresh();
    measureStarts();
    detectScene();
    window.addEventListener('load', () => { ScrollTrigger.refresh(); measureStarts(); });
  }
})();