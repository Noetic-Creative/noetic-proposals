/* Geneo B2C landing page — interactions.
   GSAP + ScrollTrigger drive the scroll story, Lenis smooths the wheel.
   Everything degrades: without JS the page is a complete static document,
   and prefers-reduced-motion removes smoothing, pinning and particles. */
(() => {
  'use strict';

  // Single place to wire the provider locator once POL supplies it.
  const PROVIDER_URL = '';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const desktop = () => innerWidth > 960;
  const hasGsap = !!window.gsap;

  /* ---------------------------------------------------------------- data */
  // Wheel order runs round the colour spectrum. Lines are verbatim from the
  // copy doc; ingredients from pollogen.com / geneo-official.com pod pages.
  const PODS = [
    { id: 'hydrate', name: 'Hydrate', goal: 'Dry, dehydrated skin', c: '#2F5597', t: '#DCE6F4',
      line: 'For dry, thirsty skin. Deep hydration that shows up as softness, not just shine.',
      ing: ['Niacinamide', 'Hyaluronic Acid', 'Blue Spirulina'] },
    { id: 'clarify', name: 'Clarify', goal: 'Oily, blemish-prone skin', c: '#3E5A58', t: '#DCE5E3',
      line: 'For oily and acne-prone skin. A clearer, calmer complexion without stripping it.',
      ing: ['Bamboo Charcoal', 'Willow Extract'] },
    { id: 'detox', name: 'Detox', goal: 'Congested pores', c: '#5E9A35', t: '#E2EED6',
      line: 'For congested, dull-looking skin. A deeper clean that leaves skin feeling clear.',
      ing: ['Green Tea Extract', 'Copper Gluconate'] },
    { id: 'protect', name: 'Protect', goal: 'Stressed or sensitive skin', c: '#C9A21F', t: '#F4ECCB',
      line: 'For stressed or sensitive skin. Helps support a healthy-looking skin barrier.',
      ing: ['Turmeric', 'Mangosteen', 'Goji Berry'] },
    { id: 'exofirm', name: 'ExoFirm', goal: 'Loss of firmness', c: '#9A7B4F', t: '#F0E7D7',
      line: 'Our newest treatment, powered by exosomes. Luxury firming for mature or dull skin.',
      ing: ['Exosomes (Centella asiatica)', 'Gold', 'Copper', 'Peptides'] },
    { id: 'energize', name: 'Energize', goal: 'Dull, tired-looking skin', c: '#B4472C', t: '#F5DFD4',
      line: 'For dull, tired-looking skin. A smooth, velvety finish that looks rested and refreshed.',
      ing: ['Caffeine', 'Cocoa Beans', 'Cinnamon Oil'] },
    { id: 'illuminate', name: 'Illuminate', goal: 'Uneven tone and dark spots', c: '#E9825F', t: '#FBE3D8',
      line: 'For dullness and uneven tone. A brighter, more even glow, session after session.',
      ing: ['Kojic Acid', 'Alpha-Arbutin', 'Vitamin C'] },
    { id: 'revive', name: 'Revive', goal: 'Early signs of aging', c: '#D9789A', t: '#F8E0E8',
      line: 'For fine lines and tired-looking skin. A firmer, more refreshed feel.',
      ing: ['Red Algae', 'Retinol', 'Caffeic Acid'] },
    { id: 'retouch', name: 'Retouch', goal: 'Rough or uneven texture', c: '#5B4785', t: '#E5DFEF',
      line: 'For rough or uneven texture. A gentle acid complex for smooth, picture-ready skin.',
      ing: ['Mandelic Acid', 'Salicylic Acid', 'Succinic Acid', 'Bilberry Extract'] },
  ];
  const byId = Object.fromEntries(PODS.map((p, i) => [p.id, i]));
  const learnUrl = id => `https://www.geneo-official.com/geneo-${id}`;

  // Quiz. Q1 uses the copy doc's goal list in its own order. Q2/Q3 wording is
  // design placeholder copy — flagged for the copywriter.
  const QUIZ = [
    { q: 'What does your skin need today?', one: false,
      opts: ['hydrate', 'energize', 'illuminate', 'revive', 'exofirm', 'clarify', 'detox', 'retouch', 'protect']
        .map(id => ({ label: PODS[byId[id]].goal, pod: id, w: { [id]: 6 } })) },
    { q: 'How does your skin feel most days?', one: true,
      opts: [
        { label: 'Dry or tight', w: { hydrate: 2, protect: 1, revive: 1 } },
        { label: 'Oily or shiny', w: { clarify: 2, detox: 1, retouch: 1 } },
        { label: 'Easily irritated', w: { protect: 2, hydrate: 1 } },
        { label: 'A bit of everything', w: { detox: 1, retouch: 1, hydrate: 1, illuminate: 1 } },
        { label: 'Balanced', w: { energize: 1, illuminate: 1, revive: 1, exofirm: 1 } },
      ] },
    { q: 'When do you want to see the glow?', one: true,
      opts: [
        { label: 'The week before an event', w: { energize: 1, illuminate: 1, hydrate: 1 } },
        { label: 'As a regular ritual', w: { revive: 1, exofirm: 1, protect: 1, clarify: 1 } },
        { label: 'Both, honestly', w: {} },
      ] },
  ];

  /* ------------------------------------------------------- smooth scroll */
  let lenis = null;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollToEl = (target, offset = -70) => {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.4, easing: t => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (a.hasAttribute('data-provider-link') && href === '#') {
      e.preventDefault();
      if (PROVIDER_URL) location.href = PROVIDER_URL;
      else gsap?.fromTo(a, { x: -6 }, { x: 0, duration: .6, ease: 'elastic.out(1,.3)' });
      return;
    }
    if (href.length > 1 && $(href)) { e.preventDefault(); scrollToEl(href, href === '#provider' ? 0 : -70); }
  });
  if (PROVIDER_URL) $$('[data-provider-link]').forEach(a => { a.href = PROVIDER_URL; });

  /* ------------------------------------------------------------ splitting */
  function splitWords(el) {
    const out = document.createDocumentFragment();
    let last = null;
    [...el.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(tok => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { out.append(' '); last = null; return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.textContent = tok;
          w.append(i); out.append(w); last = i;
        });
      } else if (last) last.append(n.cloneNode(true));
      else out.append(n.cloneNode(true));
    });
    el.textContent = ''; el.append(out);
    return $$('.w > span', el);
  }
  $$('[data-split]').forEach(splitWords);

  // Scroll-scrubbed word reveal (Why section headline)
  $$('[data-scrub]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="wd">${w}</span>`).join(' ');
  });

  /* -------------------------------------------------------------- bubbles */
  class Bubbles {
    constructor(canvas, opts) {
      this.c = canvas; this.x = canvas.getContext('2d'); this.o = opts;
      this.p = []; this.on = false; this.dpr = Math.min(devicePixelRatio || 1, 2);
      this.resize(); addEventListener('resize', () => this.resize());
      new IntersectionObserver(([en]) => { this.on = en.isIntersecting; if (this.on) this.loop(); }).observe(canvas);
    }
    resize() {
      const r = this.c.getBoundingClientRect();
      this.w = r.width; this.h = r.height;
      this.c.width = this.w * this.dpr; this.c.height = this.h * this.dpr;
      this.x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
    spawn() {
      const s = this.o.source ? this.o.source(this) : { x: Math.random() * this.w, y: this.h + 10 };
      const r = this.o.minR + Math.random() ** 2.2 * (this.o.maxR - this.o.minR);
      this.p.push({ x: s.x, y: s.y, r, vy: (0.25 + Math.random() * 0.6) * (1.2 - r / (this.o.maxR * 1.6)) * this.o.speed,
        ph: Math.random() * 6.28, amp: 0.3 + Math.random() * 0.9, life: 0 });
    }
    loop() {
      if (!this.on) return;
      const { x } = this;
      x.clearRect(0, 0, this.w, this.h);
      const rate = this.o.rate * (this.o.intensity ? this.o.intensity() : 1);
      this.acc = (this.acc || 0) + rate;
      while (this.acc > 1) { this.spawn(); this.acc--; }
      for (let i = this.p.length - 1; i >= 0; i--) {
        const b = this.p[i];
        b.life++; b.y -= b.vy; b.ph += 0.03; b.x += Math.sin(b.ph) * b.amp * 0.4;
        const fadeIn = clamp(b.life / 30, 0, 1);
        const fadeOut = clamp((b.y - this.o.top) / (this.h * 0.35), 0, 1);
        const a = fadeIn * fadeOut;
        if (b.y < -20 || a <= 0 && b.life > 30) { this.p.splice(i, 1); continue; }
        const g = x.createRadialGradient(b.x - b.r * .35, b.y - b.r * .35, b.r * .1, b.x, b.y, b.r);
        g.addColorStop(0, `rgba(255,255,255,${0.55 * a})`);
        g.addColorStop(.7, `rgba(255,255,255,${0.08 * a})`);
        g.addColorStop(1, `rgba(255,255,255,${0.32 * a})`);
        x.beginPath(); x.arc(b.x, b.y, b.r, 0, 6.283); x.fillStyle = g; x.fill();
        x.lineWidth = 1; x.strokeStyle = `rgba(${this.o.rim},${0.5 * a})`; x.stroke();
        x.beginPath(); x.arc(b.x - b.r * .38, b.y - b.r * .38, b.r * .18, 0, 6.283);
        x.fillStyle = `rgba(255,255,255,${0.9 * a})`; x.fill();
      }
      requestAnimationFrame(() => this.loop());
    }
  }

  if (!reduce) {
    const heroCanvas = $('[data-bubbles="hero"]');
    const heroStack = $('[data-stack="hero"]');
    if (heroCanvas && heroStack) new Bubbles(heroCanvas, {
      rate: 0.32, minR: 2, maxR: 16, speed: 1.15, top: -40, rim: '120,110,100',
      source(b) {
        const cr = heroCanvas.getBoundingClientRect(), sr = heroStack.getBoundingClientRect();
        if (Math.random() < .72) return { x: sr.left - cr.left + Math.random() * sr.width, y: sr.top - cr.top + sr.height * (0.15 + Math.random() * .8) };
        return { x: Math.random() * b.w, y: b.h + 10 };
      },
    });
    const finalCanvas = $('[data-bubbles="final"]');
    if (finalCanvas) new Bubbles(finalCanvas, { rate: 0.45, minR: 2, maxR: 26, speed: 1, top: -40, rim: '255,255,255' });
  }

  /* ------------------------------------------------------------- stacks */
  // Slices are in DOM bottom→top; flip so index 0 is the top pod.
  const stackSlices = el => $$('.sl', el).reverse();
  function explode(slices, amt, el) {
    const h = el.offsetHeight, w = el.offsetWidth;
    // at rest the intact photograph shows (real contact shadows); split pods take over once they move
    el.classList.toggle('is-split', amt > 0.012 || el.dataset.lock === '1');
    slices.forEach((s, i) => {
      const k = i - 3;
      gsap.set(s, {
        y: k * h * 0.1 * amt,
        x: Math.sin(i * 1.9 + 0.6) * w * 0.16 * amt,
        rotation: (i % 2 ? 1 : -1) * 7 * amt + k * 0.8 * amt,
      });
    });
  }

  /* -------------------------------------------------------------- motion */
  if (hasGsap && !reduce) {
    // Generic fades
    ScrollTrigger.batch($$('[data-fade]').filter(el => !el.closest('.hero')), {
      start: 'top 88%', once: true,
      onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .09 }),
    });
    // Word risers (hero handled by the intro timeline)
    $$('[data-split]').forEach(el => {
      if (el.closest('.hero')) return;
      gsap.to($$('.w > span', el), {
        y: 0, duration: 1.15, ease: 'expo.out', stagger: .045,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      });
    });
    // Scrubbed headline
    $$('[data-scrub]').forEach(el => {
      gsap.to($$('.wd', el), {
        opacity: 1, stagger: .1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 40%', scrub: .6 },
      });
    });
    // Image reveals with inner parallax
    $$('[data-reveal]').forEach(fig => {
      const img = $('img', fig);
      gsap.fromTo(fig, { clipPath: 'inset(100% 0 0 0)' }, {
        clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut',
        scrollTrigger: { trigger: fig, start: 'top 82%', once: true },
      });
      gsap.fromTo(img, { yPercent: -7 }, {
        yPercent: 7, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    // Staggered lists
    $$('[data-stagger]').forEach(list => gsap.from(list.children, {
      opacity: 0, y: 40, duration: 1, ease: 'expo.out', stagger: .08,
      scrollTrigger: { trigger: list, start: 'top 85%', once: true },
    }));
    // Ingredient rows
    gsap.from('.ing__row', {
      opacity: 0, y: 50, duration: 1.1, ease: 'expo.out', stagger: .08,
      scrollTrigger: { trigger: '#ing', start: 'top 82%', once: true },
    });

    /* Hero intro: the OxyPods drop in and build the stack, bottom first */
    const hs = $('[data-stack="hero"]');
    const hSlices = stackSlices(hs);
    const heroAmt = { v: 0 };
    hs.dataset.lock = '1'; hs.classList.add('is-split');
    const tl = gsap.timeline({ delay: .15, onComplete: () => { hs.dataset.lock = ''; explode(hSlices, heroAmt.v, hs); } });
    tl.from('.ring', { scale: .6, opacity: 0, duration: 1.6, ease: 'expo.out' }, 0)
      .from($$('.sl', hs), { y: () => -innerHeight * 0.9, opacity: 0, duration: 1.05, ease: 'back.out(1.25)', stagger: .085 }, .1)
      .from('.stack__shadow', { scaleX: .2, opacity: 0, duration: .9, ease: 'expo.out' }, .2)
      .to($$('.hero .w > span'), { y: 0, duration: 1.2, ease: 'expo.out', stagger: .05 }, .35)
      .to($$('.hero [data-fade]'), { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .1 }, .7)
      .from('.marquee', { yPercent: 100, duration: 1, ease: 'expo.out' }, .9);
    gsap.to(hs, { y: -10, duration: 3.2, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2 });
    // Scrolling out of the hero: the stack lifts and begins to come apart
    gsap.to(heroAmt, {
      v: .55, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5 },
      onUpdate: () => explode(hSlices, heroAmt.v, hs),
    });
    if (desktop()) gsap.to('.hero__visual', { yPercent: -16, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    if (desktop()) gsap.to('.hero__copy', { yPercent: -10, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true } });

    /* Brand band */
    gsap.fromTo('#outlineRun', { xPercent: 0 }, { xPercent: -35, ease: 'none', scrollTrigger: { trigger: '.brand', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.brand__bg', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.brand', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* Final stack floats apart and back */
    const fs = $('[data-stack="final"]');
    if (fs) {
      const fSl = stackSlices(fs), amt = { v: 0 };
      gsap.to(amt, { v: .9, duration: 3.4, ease: 'sine.inOut', repeat: -1, yoyo: true, onUpdate: () => explode(fSl, amt.v, fs) });
    }
  } else {
    $$('[data-fade]').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    $$('.w > span').forEach(el => { el.style.transform = 'none'; });
    $$('.wd').forEach(el => { el.style.opacity = 1; });
  }

  /* ------------------------------------------------- OxyPod pinned story */
  (() => {
    const scroll = $('#oxyScroll'), stack = $('[data-stack="oxy"]'), canvas = $('#oxyCanvas');
    if (!scroll || !stack || !hasGsap) return;
    const slices = stackSlices(stack), steps = $$('#steps3 li'), bar = $('#oxyBar');
    const ctx = canvas.getContext('2d'); const dpr = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0, P = 0, stage = 0, on = false; const parts = [];
    const COLORS = PODS.map(p => p.c);
    const size = () => { const r = canvas.getBoundingClientRect(); W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);

    const setStage = s => { if (s === stage) return; stage = s; steps.forEach((li, i) => li.classList.toggle('is-on', i === s)); };
    const amtFor = p => p < .12 ? 0 : p < .3 ? (p - .12) / .18 : p < .82 ? 1 : p < .96 ? 1 - (p - .82) / .14 : 0;
    const update = p => {
      P = p; bar.style.transform = `scaleX(${p})`;
      setStage(p < .4 ? 0 : p < .66 ? 1 : 2);
      explode(slices, desktop() ? gsap.parseEase('power2.inOut')(amtFor(p)) : .45, stack);
    };
    if (reduce) { explode(slices, .45, stack); return; }

    ScrollTrigger.create({
      trigger: scroll, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: st => desktop() && update(st.progress),
      onToggle: st => { on = st.isActive || !desktop(); if (on) loop(); },
    });
    ScrollTrigger.create({ trigger: scroll, start: 'top bottom', end: 'bottom top', onToggle: st => { on = st.isActive; if (on) loop(); } });
    if (!desktop()) explode(slices, .45, stack);

    function spawn() {
      const sr = stack.getBoundingClientRect(), cr = canvas.getBoundingClientRect();
      const cx = sr.left - cr.left + sr.width / 2, cy = sr.top - cr.top + sr.height / 2;
      const mode = desktop() ? stage : 1;
      if (mode === 0) {          // exfoliation: fine specks shed off the pod edges
        const side = Math.random() < .5 ? -1 : 1;
        parts.push({ k: 0, x: cx + side * sr.width * (.3 + Math.random() * .25), y: cy + (Math.random() - .5) * sr.height * 1.1,
          vx: side * (0.8 + Math.random() * 2.2), vy: -0.6 + Math.random() * 0.9, r: 1.5 + Math.random() * 3.5, rot: Math.random() * 3, vr: (Math.random() - .5) * .2,
          life: 0, max: 110 + Math.random() * 70, col: Math.random() < .55 ? '104,88,76' : '255,255,255' });
      } else if (mode === 1) {   // oxygenation: bubbles rise through the gaps
        parts.push({ k: 1, x: cx + (Math.random() - .5) * sr.width * 1.1, y: cy + sr.height * (.1 + Math.random() * .5),
          vx: 0, vy: -(0.7 + Math.random() * 1.6), r: 2 + Math.random() ** 2 * 18, ph: Math.random() * 6, life: 0, max: 400 });
      } else {                   // actives: coloured droplets drawn into the pods
        const a = Math.random() * 6.283, d = Math.max(W, H) * (.35 + Math.random() * .2);
        parts.push({ k: 2, x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * .7, tx: cx + (Math.random() - .5) * sr.width * .7,
          ty: cy + (Math.random() - .5) * sr.height * .8, r: 5 + Math.random() * 11, life: 0, max: 120 + Math.random() * 70,
          col: COLORS[(Math.random() * COLORS.length) | 0] });
      }
    }
    let acc = 0;
    function loop() {
      if (!on) return;
      ctx.clearRect(0, 0, W, H);
      const rate = desktop() ? [3, 1.1, 1.5][stage] * (P > .08 && P < .97 ? 1 : .25) : .5;
      acc += rate; while (acc > 1) { spawn(); acc--; }
      for (let i = parts.length - 1; i >= 0; i--) {
        const q = parts[i]; q.life++;
        const t = q.life / q.max;
        if (t >= 1 || q.y < -30) { parts.splice(i, 1); continue; }
        if (q.k === 0) {
          q.x += q.vx; q.y += q.vy; q.vy += 0.022; q.vx *= .985; q.rot += q.vr;
          ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot);
          ctx.fillStyle = `rgba(${q.col},${(1 - t) * .85})`; ctx.fillRect(-q.r / 2, -q.r / 3, q.r, q.r * .66); ctx.restore();
        } else if (q.k === 1) {
          q.y += q.vy; q.ph += .04; q.x += Math.sin(q.ph) * .5;
          const a = clamp(q.life / 25, 0, 1) * clamp(q.y / (H * .25), 0, 1);
          ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.283);
          ctx.fillStyle = `rgba(255,255,255,${.22 * a})`; ctx.fill();
          ctx.lineWidth = 1; ctx.strokeStyle = `rgba(110,100,92,${.35 * a})`; ctx.stroke();
          ctx.beginPath(); ctx.arc(q.x - q.r * .35, q.y - q.r * .35, q.r * .2, 0, 6.283);
          ctx.fillStyle = `rgba(255,255,255,${.95 * a})`; ctx.fill();
        } else {
          const e = 1 - Math.pow(1 - t, 3);
          const x = lerp(q.x, q.tx, e), y = lerp(q.y, q.ty, e) - Math.sin(t * Math.PI) * 40;
          const a = Math.sin(t * Math.PI);
          const g = ctx.createRadialGradient(x, y, 0, x, y, q.r * (1.6 - t));
          g.addColorStop(0, hexA(q.col, .95 * a)); g.addColorStop(1, hexA(q.col, 0));
          ctx.beginPath(); ctx.arc(x, y, q.r * (1.6 - t), 0, 6.283); ctx.fillStyle = g; ctx.fill();
        }
      }
      requestAnimationFrame(loop);
    }
  })();
  function hexA(h, a) { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }

  /* ------------------------------------------------------ ingredient rows */
  (() => {
    const fl = $('#ingFloat'); if (!fl) return;
    const imgs = $$('img', fl);
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const tick = () => { x = lerp(x, tx, .14); y = lerp(y, ty, .14); fl.style.transform = `translate(${x}px,${y}px) rotate(${clamp((tx - x) * .03, -7, 7)}deg)`; raf = requestAnimationFrame(tick); };
    $$('.ing__row').forEach(row => {
      row.addEventListener('mouseenter', e => {
        if (!fine) return;
        if (!fl.classList.contains('is-on')) { x = tx = e.clientX + 30; y = ty = e.clientY - 160; }
        imgs.forEach(i => i.classList.toggle('is-on', i.dataset.k === row.dataset.pod));
        fl.classList.add('is-on'); if (!raf) tick();
      });
      row.addEventListener('mouseleave', () => fl.classList.remove('is-on'));
      row.addEventListener('mousemove', e => { tx = e.clientX + 30; ty = e.clientY - 160; });
      row.addEventListener('click', e => { e.preventDefault(); finder.show(row.dataset.pod, true); scrollToEl('#finder'); });
    });
  })();

  /* --------------------------------------------------------------- finder */
  const finder = (() => {
    const wheel = $('#wheel'), ring = $('#wheelRing'), core = $('#wheelCore'), nameEl = $('#wheelName');
    const sec = $('#finder'), vQ = $('#viewQuiz'), vE = $('#viewExplore'), tQ = $('#tabQuiz'), tE = $('#tabExplore');
    const step = 360 / PODS.length;
    let rot = 0, cur = 0, quiz = { i: 0, a: [] }, result = null;

    // Build wheel
    const podEls = PODS.map((p, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pod'; b.style.setProperty('--c', p.c);
      b.style.transform = `rotate(${i * step}deg) translateY(-283%)`;
      b.setAttribute('aria-label', `Geneo ${p.name}`);
      b.innerHTML = `<span class="pod__inner"><span class="pod__disc"></span><span class="pod__lbl">${p.name}</span></span>`;
      b.addEventListener('click', () => { if (!dragMoved) { show(p.id); tab('explore'); } });
      ring.append(b); return b;
    });
    PODS.forEach((p, i) => {
      const im = new Image(); im.src = `assets/img/pod-${p.id}.webp`; im.alt = ''; im.loading = 'lazy'; im.dataset.i = i;
      core.append(im);
    });
    const coreImgs = $$('img', core);

    function paint() {
      ring.style.rotate = `${rot}deg`;
      podEls.forEach((el, i) => { $('.pod__inner', el).style.rotate = `${-(i * step + rot)}deg`; });
    }
    function show(id, toExplore = false, spins = 0) {
      const i = typeof id === 'number' ? id : byId[id];
      cur = (i + PODS.length) % PODS.length;
      const target = -cur * step;
      // shortest path from the current rotation, plus optional celebratory turns
      let d = ((target - rot) % 360 + 540) % 360 - 180;
      rot += d - spins * 360;
      paint();
      podEls.forEach((el, k) => el.classList.toggle('is-on', k === cur));
      coreImgs.forEach((im, k) => im.classList.toggle('is-on', k === cur));
      const p = PODS[cur];
      nameEl.textContent = `Geneo ${p.name}`;
      sec.style.setProperty('--pod', p.c); sec.style.setProperty('--pod-tint', p.t);
      if (toExplore) tab('explore'); else if (tE.getAttribute('aria-selected') === 'true') renderExplore();
    }

    // Drag to rotate
    let dragging = false, dragMoved = false, startA = 0, startRot = 0;
    const angle = e => { const r = wheel.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
    wheel.addEventListener('pointerdown', e => { dragging = true; dragMoved = false; startA = angle(e); startRot = rot; });
    addEventListener('pointermove', e => {
      if (!dragging) return;
      let d = angle(e) - startA; d = ((d + 540) % 360) - 180;
      if (Math.abs(d) > 3 && !dragMoved) { dragMoved = true; wheel.classList.add('is-drag'); wheel.setPointerCapture?.(e.pointerId); }
      if (dragMoved) { rot = startRot + d; paint(); }
    });
    addEventListener('pointerup', () => {
      if (!dragging) return; dragging = false; wheel.classList.remove('is-drag');
      if (dragMoved) { const i = Math.round(-rot / step); show(((i % PODS.length) + PODS.length) % PODS.length, true); setTimeout(() => { dragMoved = false; }, 50); }
    });
    $('#wheelPrev').addEventListener('click', () => show(cur - 1, true));
    $('#wheelNext').addEventListener('click', () => show(cur + 1, true));
    wheel.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); show(cur + 1, true); podEls[cur].focus(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); show(cur - 1, true); podEls[cur].focus(); }
    });

    // Tabs
    function tab(which) {
      const q = which === 'quiz';
      tQ.setAttribute('aria-selected', q); tE.setAttribute('aria-selected', !q);
      vQ.classList.toggle('is-on', q); vE.classList.toggle('is-on', !q);
      if (!q) renderExplore(); else renderQuiz();
    }
    tQ.addEventListener('click', () => tab('quiz'));
    tE.addEventListener('click', () => tab('explore'));

    const arrow = '<svg class="arr" viewBox="0 0 18 10" fill="none" stroke="currentColor"><path d="M0 5h17M12.5.5 17 5l-4.5 4.5"/></svg>';
    const podCard = (p, k) => `
      <p class="res__k">${k}</p>
      <h3 class="res__name"><i></i>Geneo ${p.name}</h3>
      <span class="res__goal">${p.goal}</span>
      <p class="res__line">${p.line}</p>
      <p class="res__ingk">Key ingredients</p>
      <ul class="chips">${p.ing.map(x => `<li>${x}</li>`).join('')}</ul>
      <p class="res__note">Every Geneo™ treatment is personalized by your provider, in the room, to your skin that day.</p>`;

    function renderExplore() {
      const p = PODS[cur];
      vE.innerHTML = podCard(p, `OxyPod ${String(cur + 1).padStart(2, '0')} / ${String(PODS.length).padStart(2, '0')}`) + `
        <div class="res__actions">
          <a class="btn btn--solid" href="#provider" data-provider-link>Find a Provider Near You ${arrow}</a>
          <a class="link" href="${learnUrl(p.id)}" target="_blank" rel="noopener">Learn More</a>
        </div>`;
      vE.classList.remove('is-on'); void vE.offsetWidth; vE.classList.add('is-on');
    }

    function renderQuiz() {
      if (result) return renderResult();
      const s = QUIZ[quiz.i];
      vQ.innerHTML = `
        <div class="q__meta"><span class="q__step">Question ${quiz.i + 1} / ${QUIZ.length}</span>
          <span class="q__dots">${QUIZ.map((_, k) => `<i class="${k <= quiz.i ? 'is-on' : ''}"></i>`).join('')}</span></div>
        <h3 class="q__title">${s.q}</h3>
        <div class="q__opts ${s.one ? 'q__opts--1' : ''}">${s.opts.map((o, k) => `
          <button type="button" class="opt" data-k="${k}" aria-pressed="${quiz.a[quiz.i] === k}" ${o.pod ? `style="--c:${PODS[byId[o.pod]].c}"` : ''}>
            ${o.pod ? '<i></i>' : ''}<span>${o.label}</span></button>`).join('')}</div>
        <div class="q__nav"><button type="button" class="q__back ${quiz.i ? 'is-on' : ''}">← Back</button></div>`;
      $$('.opt', vQ).forEach(b => {
        const o = s.opts[+b.dataset.k];
        if (o.pod) b.addEventListener('mouseenter', () => fine && show(o.pod));
        b.addEventListener('click', () => {
          quiz.a[quiz.i] = +b.dataset.k;
          $$('.opt', vQ).forEach(x => x.setAttribute('aria-pressed', x === b));
          if (o.pod) show(o.pod);
          setTimeout(() => {
            if (quiz.i < QUIZ.length - 1) { quiz.i++; vQ.classList.remove('is-on'); void vQ.offsetWidth; vQ.classList.add('is-on'); renderQuiz(); }
            else finish();
          }, 380);
        });
      });
      $('.q__back', vQ).addEventListener('click', () => { quiz.i = Math.max(0, quiz.i - 1); renderQuiz(); });
    }

    function finish() {
      const score = Object.fromEntries(PODS.map(p => [p.id, 0]));
      quiz.a.forEach((k, i) => Object.entries(QUIZ[i].opts[k].w).forEach(([id, v]) => { score[id] += v; }));
      const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
      result = best;
      show(best, false, reduce ? 0 : 1);
      renderResult(); burst(PODS[byId[best]].c);
    }

    function renderResult() {
      const p = PODS[byId[result]];
      vQ.innerHTML = podCard(p, 'Your match') + `
        <div class="res__actions">
          <a class="btn btn--solid" href="#provider" data-provider-link>Find a Provider Near You ${arrow}</a>
          <a class="link" href="${learnUrl(p.id)}" target="_blank" rel="noopener">Learn More</a>
          <button type="button" class="link" id="retake">Retake</button>
        </div>`;
      vQ.classList.remove('is-on'); void vQ.offsetWidth; vQ.classList.add('is-on');
      $('#retake').addEventListener('click', () => { quiz = { i: 0, a: [] }; result = null; renderQuiz(); });
    }

    // Celebration burst on the result
    const bc = $('#wheelBurst'), bx = bc.getContext('2d');
    function burst(col) {
      if (reduce) return;
      const r = bc.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      bc.width = r.width * d; bc.height = r.height * d; bx.setTransform(d, 0, 0, d, 0, 0);
      const cx = r.width / 2, cy = r.height / 2, ps = [];
      for (let i = 0; i < 70; i++) {
        const a = Math.random() * 6.283, s = 3 + Math.random() * 7;
        ps.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 2 + Math.random() * 7, c: Math.random() < .6 ? col : '#ffffff', l: 0 });
      }
      (function f() {
        bx.clearRect(0, 0, r.width, r.height); let alive = 0;
        ps.forEach(p => {
          p.l++; p.x += p.vx; p.y += p.vy; p.vx *= .95; p.vy = p.vy * .95 - .05;
          const a = Math.max(0, 1 - p.l / 70); if (a > 0) alive++;
          bx.beginPath(); bx.arc(p.x, p.y, p.r * (0.6 + a * .4), 0, 6.283); bx.fillStyle = hexA(p.c, a * .9); bx.fill();
        });
        if (alive) requestAnimationFrame(f); else bx.clearRect(0, 0, r.width, r.height);
      })();
    }

    // Idle drift until the visitor touches the wheel
    let idle = true;
    wheel.addEventListener('pointerdown', () => { idle = false; });
    sec.addEventListener('click', () => { idle = false; });
    if (!reduce) {
      const io = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting || !idle) return;
        let k = 0;
        const t = setInterval(() => { if (!idle || k++ > 2) return clearInterval(t); show(cur + 1); }, 2200);
      }, { threshold: .5 });
      io.observe(wheel);
    }
    wheel.tabIndex = -1;

    show(0); renderQuiz();
    return { show: (id, explore) => show(id, explore) };
  })();

  /* ------------------------------------------------------ before & after */
  $$('[data-cmp]').forEach(c => {
    const input = $('input', c);
    const set = v => c.style.setProperty('--p', `${v}%`);
    input.addEventListener('input', () => set(input.value));
    if (hasGsap && !reduce) {
      const o = { v: 50 };
      ScrollTrigger.create({
        trigger: c, start: 'top 75%', once: true,
        onEnter: () => gsap.timeline({ onUpdate: () => { set(o.v); input.value = o.v; } })
          .to(o, { v: 78, duration: .9, ease: 'power2.inOut' })
          .to(o, { v: 24, duration: 1.1, ease: 'power2.inOut' })
          .to(o, { v: 50, duration: .8, ease: 'power2.inOut' }),
      });
    }
  });

  /* --------------------------------------------------------- count-up */
  $$('[data-count]').forEach(el => {
    if (!hasGsap || reduce) return;
    const end = +el.dataset.count, o = { v: 0 }; el.textContent = '0';
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 2, ease: 'expo.out', onUpdate: () => { el.textContent = Math.round(o.v); } }) });
  });

  /* --------------------------------------------------- what to expect */
  (() => {
    const figs = $$('#expectMedia figure'), count = $('#expectCount');
    const set = i => { figs.forEach((f, k) => f.classList.toggle('is-on', k <= i)); count.textContent = `0${i + 1} / 03`; };
    if (!hasGsap) return;
    $$('.estep').forEach((s, i) => ScrollTrigger.create({ trigger: s, start: 'top 60%', end: 'bottom 60%', onToggle: st => st.isActive && set(i) }));
  })();

  /* ---------------------------------------------------------------- FAQ */
  $$('.qa__q').forEach(b => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', !open);
    setTimeout(() => hasGsap && ScrollTrigger.refresh(), 650);
  }));

  /* ------------------------------------------------------ header + bars */
  (() => {
    const hdr = $('#hdr'), bar = $('#progress'), m = $('#mcta');
    let last = 0;
    const on = y => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      hdr.classList.toggle('is-scrolled', y > 40);
      hdr.classList.toggle('is-hidden', y > last && y > innerHeight * .8);
      const nearEnd = y > max - innerHeight * 1.2;
      m.classList.toggle('is-on', y > innerHeight * .7 && !nearEnd);
      last = y;
    };
    if (lenis) lenis.on('scroll', e => on(e.scroll)); else addEventListener('scroll', () => on(scrollY), { passive: true });
    on(scrollY);
  })();

  /* ------------------------------------------------------ cursor, magnets */
  if (fine && !reduce) {
    const cur = $('#cursor'), ringEl = $('#cursorRing');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; cur.style.opacity = 1; });
    (function f() { cx = lerp(cx, x, .2); cy = lerp(cy, y, .2); cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(f); })();
    $$('[data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => { ringEl.textContent = el.dataset.cursor; cur.classList.add('is-label'); });
      el.addEventListener('mouseleave', () => cur.classList.remove('is-label'));
    });
    if (hasGsap) document.addEventListener('mousemove', e => {
      const m = e.target.closest('[data-magnet]');
      $$('[data-magnet].is-mag').forEach(b => { if (b !== m) { b.classList.remove('is-mag'); gsap.to(b, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.4)' }); } });
      if (!m) return;
      const r = m.getBoundingClientRect();
      m.classList.add('is-mag');
      gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .5, ease: 'power3.out' });
    });
  }

  addEventListener('load', () => hasGsap && ScrollTrigger.refresh());
})();
