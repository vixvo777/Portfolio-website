/* ==========================================================================
   connect.js  -  connect.html only: topic pills, typing signal strip,
   validation and sending through EmailJS. The form works even if GSAP
   fails to load; only the signal animation depends on it.
   ========================================================================== */
(() => {
  'use strict';

  const SERVICE_ID = 'service_3lz61dk';
  const TEMPLATE_ID = 'template_hwpdata';

  const form = document.getElementById('connect-form');
  if (!form) return;

  const strip = document.getElementById('signal');
  const status = document.getElementById('form-status');
  const btn = document.getElementById('sendBtn');
  const pills = [...form.querySelectorAll('.pill')];
  const fields = form.elements;
  const hasGsap = !!window.gsap;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  let topic = '';

  /* ---------------- Signal strip ---------------- */
  const N = 44;
  const bars = [];
  for (let i = 0; i < N; i++) {
    const b = document.createElement('i');
    strip.appendChild(b);
    bars.push(b);
  }
  // Resting height rises a little with each field you fill in.
  const filled = () => ['from_name', 'reply_to', 'message'].filter((n) => fields[n].value.trim()).length;
  const base = () => 0.1 + filled() * 0.07;

  function setBase() {
    if (hasGsap && !reduce) gsap.to(bars, { scaleY: base(), duration: 0.5, ease: 'power2.out', overwrite: 'auto', stagger: { each: 0.004, from: 'center' } });
    else bars.forEach((b) => { b.style.transform = 'scaleY(' + base() + ')'; });
  }
  function kick(strength = 1) {
    if (!hasGsap || reduce) return;
    const c = Math.floor(rand(8, N - 8));
    bars.forEach((b, i) => {
      const h = Math.max(base(), (0.95 - Math.abs(i - c) * 0.05) * strength * rand(0.6, 1));
      gsap.to(b, { scaleY: h, duration: 0.08, overwrite: 'auto', onComplete: () => gsap.to(b, { scaleY: base(), duration: 0.5, ease: 'power2.out' }) });
    });
  }
  function burst() {
    if (!hasGsap || reduce) { setBase(); return; }
    gsap.to(bars, {
      scaleY: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto', stagger: { each: 0.012, from: 'center' },
      onComplete: () => gsap.to(bars, { scaleY: base(), duration: 0.9, ease: 'power3.out', stagger: { each: 0.008, from: 'edges' } }),
    });
  }
  setBase();

  /* ---------------- Topic pills (pick one, or none) ---------------- */
  pills.forEach((p) => p.addEventListener('click', () => {
    const was = p.getAttribute('aria-pressed') === 'true';
    pills.forEach((q) => q.setAttribute('aria-pressed', 'false'));
    topic = was ? '' : p.dataset.topic;
    if (!was) p.setAttribute('aria-pressed', 'true');
    kick(0.55);
  }));

  /* ---------------- Status + validation ---------------- */
  function setStatus(text, isError) {
    status.textContent = text;
    status.classList.toggle('is-error', !!isError);
  }
  function fail(el, text) {
    el.setAttribute('aria-invalid', 'true');
    setStatus(text, true);
    el.focus();
    return false;
  }
  function validate() {
    ['from_name', 'reply_to', 'message'].forEach((n) => fields[n].removeAttribute('aria-invalid'));
    if (!fields.from_name.value.trim()) return fail(fields.from_name, 'Add your name.');
    const email = fields.reply_to.value.trim();
    if (!email) return fail(fields.reply_to, 'Add your email so I can reply.');
    if (!fields.reply_to.validity.valid || !/.+@.+\..+/.test(email)) return fail(fields.reply_to, 'That email address looks incomplete. Check it and try again.');
    if (!fields.message.value.trim()) return fail(fields.message, 'Write a short note about what you\'re making.');
    return true;
  }

  form.addEventListener('input', (e) => {
    if (e.target.removeAttribute) e.target.removeAttribute('aria-invalid');
    if (status.classList.contains('is-error')) setStatus('');
    setBase();
    kick(1);
  });

  /* ---------------- Send ---------------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (btn.disabled || !validate()) return;
    if (!window.emailjs) {
      setStatus('The mail service did not load. Check your connection and reload the page, or message me on Instagram.', true);
      return;
    }
    const name = fields.from_name.value.trim();
    const email = fields.reply_to.value.trim();
    const message = (topic ? 'Topic: ' + topic + '\n\n' : '') + fields.message.value.trim();

    btn.disabled = true;
    btn.textContent = 'Sending…';
    setStatus('');

    window.emailjs.send(SERVICE_ID, TEMPLATE_ID, { from_name: name, reply_to: email, message })
      .then(() => {
        form.reset();
        pills.forEach((q) => q.setAttribute('aria-pressed', 'false'));
        topic = '';
        setStatus('Message sent. I\'ll reply to ' + email + '.');
        burst();
      }, () => {
        setStatus('Message did not send. Check your connection and try again, or message me on Instagram.', true);
      })
      .then(() => {
        btn.disabled = false;
        btn.textContent = 'Send message';
      });
  });

  // Shared page behaviour (cursor, ruler, colour morph, title reveal, footer).
  if (window.Site && window.Site.ready) window.Site.start();
})();