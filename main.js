(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  $('#year').textContent = new Date().getFullYear();

  /* ---- reveal on scroll ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { const t = e.target; t.classList.add('in'); io.unobserve(t); setTimeout(() => { t.style.transitionDelay = '0s'; }, 1500); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---- mobile nav ---- */
  const toggle = $('#navToggle'), links = $('#navLinks'), nav = $('#nav');
  const setMenu = (open) => { toggle.setAttribute('aria-expanded', open); links.classList.toggle('open', open); };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', links).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---- hide nav on scroll down, show on scroll up ---- */
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('hide', y > lastY && y > 400 && toggle.getAttribute('aria-expanded') !== 'true');
    lastY = y;
  }, { passive: true });

  /* ---- toolkit tabs ---- */
  const tabs = $$('.tab');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { const on = x === t; x.classList.toggle('active', on); x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; const p = $('#' + x.getAttribute('aria-controls')); p.classList.toggle('active', on); p.hidden = !on; });
  }));
  tabs.forEach((t, i) => t.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]; n.focus(); n.click(); }
  }));

  if (reduce) return;

  /* ---- cursor glow ---- */
  const glow = $('.cursor-glow');
  if (fine) {
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; document.body.classList.add('has-pointer'); }, { passive: true });
    (function loop() { gx += (tx - gx) * .12; gy += (ty - gy) * .12; glow.style.transform = `translate(${gx}px,${gy}px)`; requestAnimationFrame(loop); })();
  }

  /* ---- hero pointer parallax (uses the `translate` property so it composes with CSS animations) ---- */
  const stage = $('#stage');
  if (stage && fine) {
    const layers = $$('[data-depth]', stage);
    const hero = $('#hero');
    let px = 0, py = 0, cx = 0, cy = 0, running = false;
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - .5; py = (e.clientY - r.top) / r.height - .5;
      if (!running) { running = true; requestAnimationFrame(tick); }
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { px = 0; py = 0; if (!running) { running = true; requestAnimationFrame(tick); } });
    function tick() {
      cx += (px - cx) * .08; cy += (py - cy) * .08;
      layers.forEach(l => { const d = parseFloat(l.dataset.depth); l.style.translate = `${cx * d * -34}px ${cy * d * -34}px`; });
      if (Math.abs(px - cx) > .001 || Math.abs(py - cy) > .001) requestAnimationFrame(tick); else running = false;
    }
  }

  /* ---- magnetic buttons ---- */
  if (fine) $$('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* ---- 3D tilt + spotlight on cards ---- */
  if (fine) $$('.tilt').forEach(el => {
    const base = getComputedStyle(el).getPropertyValue('--rot').trim();
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
      el.style.transform = `perspective(900px) rotateX(${(.5 - y) * 8}deg) rotateY(${(x - .5) * 10}deg) rotate(${base || '0deg'})`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* ---- drag-to-scroll for the brand worlds strip ---- */
  $$('.worlds__track').forEach(track => {
  if (fine) {
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', e => { down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    addEventListener('pointerup', () => { down = false; track.classList.remove('drag'); });
    addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add('drag'); }
      track.scrollLeft = sl - dx;
    });
  }
  });
})();
