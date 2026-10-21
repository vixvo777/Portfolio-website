/* ==========================================================================
   podcast.js  —  interactions for podcast.html (GSAP 3 + ScrollTrigger + Lenis)
   Everything is scoped to this page. If GSAP fails to load, the page falls
   back to plain static content.
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger) { root.classList.remove('js'); return; }

  gsap.registerPlugin(ScrollTrigger);
  if (window.ScrollToPlugin) gsap.registerPlugin(window.ScrollToPlugin);

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

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

  /* ------------------------------------------------------------------ */
  /* Init (after fonts so measurements are right)                         */
  /* ------------------------------------------------------------------ */
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(init);

  function init() {
    const scenes = $$('.scene');
    const mm = gsap.matchMedia();

    /* ---------------- HERO ---------------- */
    const hero = $('#hero');
    const heroCap = buildCapsule($('#heroCapsule'), 30);
    const heroTitle = $('.hero__title');
    const heroChars = splitChars(heroTitle);
    const capFloat = $('#capsuleFloat');
    const capTilt = $('#capsuleTilt');
    const capsule = $('#heroCapsule');

    // pulse toggle: capsule click/Enter or the "Pulse the wave" link
    let pulsing = false;
    const toggleBtn = $('#playToggle');
    const setPulse = (on) => {
      pulsing = on;
      setRate(heroCap, on ? 1.7 : 0.25);
      capsule.setAttribute('aria-pressed', on);
      toggleBtn.setAttribute('aria-pressed', on);
      toggleBtn.textContent = on ? 'Calm the wave' : 'Pulse the wave';
      if (!reduce) gsap.fromTo(capsule, { scale: 0.94 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1,.4)' });
    };
    capsule.addEventListener('click', () => setPulse(!pulsing));
    capsule.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPulse(!pulsing); } });
    toggleBtn.addEventListener('click', () => setPulse(!pulsing));

    // one orchestrated entrance
    heroTitle.style.visibility = 'visible';
    if (reduce) {
      gsap.set([capFloat, '.ghost', '.hero .micro', '.hero .side-link'], { opacity: 1 });
      gsap.set(capsule, { rotation: -16 });
    } else {
      gsap.timeline({ defaults: { ease: 'power4.out' } })
        .from(heroChars, { yPercent: 115, duration: 1.1, stagger: 0.035 })
        .fromTo(capFloat, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.3)
        .fromTo(capsule, { y: -320, rotation: -44, scale: 0.7 }, { y: 0, rotation: -16, scale: 1, duration: 1.7, ease: 'expo.out' }, 0.3)
        .to('.ghost', { opacity: 1, duration: 1.4, stagger: 0.15 }, 0.5)
        .to('.hero .micro, .hero .side-link', { opacity: 1, duration: 0.9, stagger: 0.08 }, 1.0);
      // idle float
      gsap.to(capTilt, { y: -14, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }

    // pointer parallax + letter weight
    if (fine) {
      const tiltX = gsap.quickTo(capTilt, 'x', { duration: 0.9, ease: 'power3' });
      const tiltR = gsap.quickTo(capTilt, 'rotation', { duration: 0.9, ease: 'power3' });
      const gA = gsap.quickTo('.ghost--a', 'x', { duration: 1.2, ease: 'power3' });
      const gB = gsap.quickTo('.ghost--b', 'x', { duration: 1.2, ease: 'power3' });
      hero.addEventListener('pointermove', (e) => {
        const nx = (e.clientX / innerWidth - 0.5) * 2;
        tiltX(nx * 26); tiltR(nx * 7); gA(nx * -34); gB(nx * 34);
      });
      weightField(hero, heroChars);
    }

    // hero scroll-out (scrub, separate layers from the intro so nothing fights)
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
      .to(capFloat, { y: -190, rotation: 30, scale: 0.65, opacity: 0, ease: 'none' }, 0)
      .to(heroTitle, { yPercent: -35, ease: 'none' }, 0)
      .to('.hero__ghosts', { scale: 1.25, yPercent: 8, ease: 'none' }, 0);

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
        cursor.classList.remove('is-link', 'is-label');
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
      ctaFixed.classList.toggle('is-hidden', s.id === 'cta');
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

    /* ---------------- BENTO: trailer scrubber ---------------- */
    (() => {
      const tile = $('.tile--trailer');
      const wrap = $('.mini-tl__clips', tile), head = $('.mini-tl__head', tile), time = $('.mini-tl__time', tile), tl = $('.mini-tl', tile);
      const grows = Array.from({ length: 16 }, () => rand(0.5, 2));
      const hot = new Set(); while (hot.size < 5) hot.add(Math.floor(rand(0, 16)));
      const clips = grows.map((g, i) => {
        const c = document.createElement('i');
        c.style.flexGrow = g; if (hot.has(i)) c.className = 'hot';
        c.style.height = Math.round(rand(46, 100)) + '%';
        wrap.appendChild(c); return c;
      });
      const total = grows.reduce((a, b) => a + b, 0);
      const prog = { v: 0 };
      let lastOn = -1;
      const render = () => {
        head.style.left = (prog.v * 100) + '%';
        const sec = Math.round(prog.v * 30);
        time.textContent = '00:' + String(sec).padStart(2, '0');
        let acc = 0, idx = 0;
        for (let i = 0; i < grows.length; i++) { acc += grows[i] / total; if (prog.v <= acc) { idx = i; break; } }
        if (idx !== lastOn) { clips.forEach((c, i) => c.classList.toggle('on', i === idx)); lastOn = idx; }
      };
      const idle = gsap.to(prog, { v: 1, duration: 9, repeat: -1, ease: 'none', onUpdate: render, paused: reduce });
      render();
      tile.addEventListener('pointermove', (e) => {
        const r = tl.getBoundingClientRect();
        idle.pause(); prog.v = clamp((e.clientX - r.left) / r.width, 0, 1); render();
      });
      tile.addEventListener('pointerleave', () => { if (!reduce) { idle.progress(prog.v); idle.play(); } });
    })();

    /* ---------------- BENTO: transcript cutter ---------------- */
    (() => {
      const fs = $$('.f'), count = $('.edit__count'), reset = $('.edit__reset');
      const state = { sec: 0 };
      const widths = new Map();
      const show = () => { count.textContent = state.sec.toFixed(1) + 's trimmed'; };
      const apply = (el, cut) => {
        if (el._cut === cut) return;
        el._cut = cut;
        if (cut) widths.set(el, el.getBoundingClientRect().width);
        gsap.to(el, {
          width: cut ? 0 : widths.get(el) || 'auto', opacity: cut ? 0 : 1, paddingLeft: cut ? 0 : 7, paddingRight: cut ? 0 : 7, marginRight: cut ? 0 : '0.28em',
          duration: reduce ? 0 : 0.4, ease: 'power3.inOut',
          onComplete() { if (!cut) el.style.width = ''; },
        });
        const total = fs.reduce((sum, f) => sum + (f._cut ? parseFloat(f.dataset.dur || '0.5') : 0), 0);
        gsap.to(state, { sec: total, duration: reduce ? 0 : 0.4, overwrite: true, onUpdate: show });
        el.setAttribute('aria-pressed', cut);
      };
      fs.forEach((f) => {
        if (fine) f.addEventListener('pointerenter', () => apply(f, true));
        f.addEventListener('click', () => apply(f, !f._cut));
      });
      reset.addEventListener('click', () => fs.forEach((f) => apply(f, false)));
    })();

    /* ---------------- BENTO: caption styles ---------------- */
    (() => {
      const tile = $('.tile--clips'), phone = $('.phone', tile), words = $$('.cap-word', tile), lbl = $('.clips__style', tile);
      let style = 0, wi = 0;
      const tick = () => { words.forEach((w, i) => w.classList.toggle('on', i === wi)); wi = (wi + 1) % words.length; };
      tick();
      if (!reduce) setInterval(tick, 520);
      const next = () => {
        style = (style + 1) % 3;
        phone.dataset.style = style;
        lbl.textContent = 'Style ' + (style + 1) + ' of 3';
        if (!reduce) gsap.fromTo(words, { y: 14, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, stagger: 0.05, ease: 'back.out(2)' });
      };
      tile.addEventListener('click', next);
      phone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); } });
      if (fine && !reduce) {
        tile.addEventListener('pointermove', (e) => {
          const r = tile.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(phone, { rotationY: nx * 26, rotationX: -ny * 18, transformPerspective: 700, duration: 0.5, ease: 'power3' });
        });
        tile.addEventListener('pointerleave', () => gsap.to(phone, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1,.5)' }));
      }
    })();

    /* ---------------- BENTO: audio clean-up canvas ---------------- */
    (() => {
      const cv = $('.clean__wave'), pct = $('.clean__pct'), resetBtn = $('.clean__reset'), tile = $('.tile--clean');
      const ctx = cv.getContext('2d');
      const BARS = 72;
      const clean = new Float32Array(BARS);
      const jit = Array.from({ length: BARS }, () => rand(0.4, 1));
      let w = 0, h = 0, active = true;
      const size = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = cv.clientWidth; h = cv.clientHeight;
        cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      const draw = (time = 0) => {
        if (!active || !w) return;
        ctx.clearRect(0, 0, w, h);
        const bw = Math.max(2, (w / BARS) * 0.55);
        for (let i = 0; i < BARS; i++) {
          const x = (i + 0.5) * (w / BARS);
          const env = 0.22 + 0.55 * Math.abs(Math.sin(i * 0.21) * Math.sin(i * 0.07 + 1));
          const c = clean[i];
          const flick = 0.65 + 0.35 * Math.sin(time * 0.012 + i * 12.9898);
          const bh = h * (env * 0.62 + (1 - c) * jit[i] * 0.34 * flick);
          ctx.fillStyle = c > 0.55 ? '#FF8A1F' : 'rgba(255,255,255,' + (0.22 + c * 0.3) + ')';
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(x - bw / 2, (h - bh) / 2, bw, bh, bw / 2) : ctx.rect(x - bw / 2, (h - bh) / 2, bw, bh);
          ctx.fill();
        }
      };
      const report = () => {
        const p = Math.round((clean.reduce((a, b) => a + b, 0) / BARS) * 100);
        pct.textContent = p >= 99 ? 'Clean' : p + '% cleaned';
      };
      cv.addEventListener('pointermove', (e) => {
        const r = cv.getBoundingClientRect(), px = e.clientX - r.left;
        for (let i = 0; i < BARS; i++) {
          const d = Math.abs(px - (i + 0.5) * (w / BARS));
          if (d < 80) clean[i] = Math.min(1, clean[i] + (1 - d / 80) * 0.4);
        }
        report(); if (reduce) draw();
      });
      resetBtn.addEventListener('click', () => { clean.fill(0); report(); if (reduce) draw(); });
      size();
      window.addEventListener('resize', () => { size(); draw(); });
      ScrollTrigger.create({ trigger: tile, start: 'top bottom', end: 'bottom top', onToggle: (s) => { active = s.isActive; } });
      if (reduce) draw(); else gsap.ticker.add(draw);
    })();

    /* ---------------- PROCESS ---------------- */
    const steps = [
      { t: 'Send files', c: 'Upload the raw video or audio, plus a short note on the tone you want and any moments to keep.', rot: 0, fill: 0.15 },
      { t: 'Rough cut', c: 'Dead air, false starts and filler come out, and a first pass is ready for you to check.', rot: 7, fill: 0.4 },
      { t: 'Polish', c: 'Pacing, levels, music and captions get tightened, and the trailer takes its final shape.', rot: -7, fill: 0.7 },
      { t: 'Delivered', c: 'The trailer, the full episode and clips sized for each platform, ready to publish.', rot: 0, fill: 1 },
    ];
    const proc = $('#process');
    const pills = $$('.pill', proc), titleEl = $('#processTitle'), textEl = $('#processText'), countEl = $('#processCount'), panel = $('#processPanel');
    const pCap = buildCapsule($('#processCapsule'), 22);
    if (!reduce) gsap.to('#processFloat', { y: -12, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    setRate(pCap, 0.4);
    let step = -1, processST = null;
    function setStep(i, first) {
      if (i === step) return;
      const dir = i > step ? 1 : -1;
      step = i;
      pills.forEach((p, k) => { p.setAttribute('aria-selected', k === i); p.tabIndex = k === i ? 0 : -1; });
      panel.setAttribute('aria-labelledby', 'tab-' + i);
      const s = steps[i];
      countEl.textContent = '0' + (i + 1) + ' / 04';
      const dur = reduce || first ? 0 : 0.7;
      gsap.to(pCap.el, { rotation: s.rot, duration: dur, ease: 'power3.out' });
      gsap.to(pCap.body, { '--fill': s.fill, duration: dur, ease: 'power2.out' });
      setRate(pCap, 0.4 + i * 0.5);
      if (first || reduce) { titleEl.textContent = s.t; textEl.textContent = s.c; return; }
      gsap.to(titleEl, {
        yPercent: -105 * dir, duration: 0.25, ease: 'power2.in', overwrite: true,
        onComplete() { titleEl.textContent = steps[step].t; gsap.fromTo(titleEl, { yPercent: 105 * dir }, { yPercent: 0, duration: 0.5, ease: 'power3.out' }); },
      });
      gsap.to(textEl, {
        opacity: 0, duration: 0.2, overwrite: true,
        onComplete() { textEl.textContent = steps[step].c; gsap.to(textEl, { opacity: 1, duration: 0.4 }); },
      });
    }
    setStep(0, true);
    const goStep = (i) => {
      if (processST) scrollToY(processST.start + ((i + 0.5) / 4) * (processST.end - processST.start));
      else setStep(i);
    };
    pills.forEach((p, i) => {
      p.addEventListener('click', () => goStep(i));
      p.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const n = clamp(i + (e.key === 'ArrowRight' ? 1 : -1), 0, 3);
        pills[n].focus(); goStep(n);
      });
    });
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      processST = ScrollTrigger.create({
        trigger: proc, start: 'top top', end: '+=300%', pin: true,
        onUpdate: (s) => setStep(clamp(Math.floor(s.progress * 4), 0, 3)),
      });
      return () => { processST = null; };
    });

    /* ---------------- WORK (horizontal) ---------------- */
    const work = $('#work'), track = $('#workTrack'), bar = $('#workBar');
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const dist = () => Math.max(0, track.scrollWidth - innerWidth + innerWidth * 0.08);
      const tw = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: work, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: (s) => { bar.style.transform = 'scaleX(' + s.progress + ')'; },
        },
      });
      $$('.case__media img', track).forEach((img) => {
        gsap.fromTo(img, { xPercent: -4 }, {
          xPercent: 4, ease: 'none',
          scrollTrigger: { trigger: img.closest('.case'), containerAnimation: tw, start: 'left right', end: 'right left', scrub: true },
        });
      });
    });
    mm.add('(max-width: 899px), (prefers-reduced-motion: reduce)', () => {
      track.style.overflowX = 'auto';
      const onScroll = () => {
        const m = track.scrollWidth - track.clientWidth;
        bar.style.transform = 'scaleX(' + (m > 0 ? track.scrollLeft / m : 0) + ')';
      };
      track.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => { track.removeEventListener('scroll', onScroll); track.style.overflowX = ''; };
    });
    // card tilt
    if (fine && !reduce) {
      $$('.case').forEach((c) => {
        c.addEventListener('pointermove', (e) => {
          const r = c.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(c, { rotationY: nx * 12, rotationX: -ny * 9, transformPerspective: 900, duration: 0.5, ease: 'power3' });
        });
        c.addEventListener('pointerleave', () => gsap.to(c, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'power3.out' }));
      });
    }

    /* ---------------- CTA ---------------- */
    const ctaTitle = $('#ctaTitle');
    const ctaChars = splitChars(ctaTitle);
    if (!reduce) {
      gsap.set(ctaChars, { yPercent: 115 });
      ScrollTrigger.create({
        trigger: '#cta', start: 'top 60%', once: true,
        onEnter: () => gsap.to(ctaChars, { yPercent: 0, duration: 1.1, stagger: 0.03, ease: 'power4.out' }),
      });
    }
    weightField(ctaTitle.parentNode, ctaChars);

    /* ---------------- Go ---------------- */
    ScrollTrigger.refresh();
    measureStarts();
    detectScene();
    window.addEventListener('load', () => { ScrollTrigger.refresh(); measureStarts(); });
  }
})();
