(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  $('#year').textContent = new Date().getFullYear();

  /* reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const t = e.target;
      t.classList.add('in'); io.unobserve(t);
      setTimeout(() => { t.style.transitionDelay = '0s'; }, 1500);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* mobile nav */
  const toggle = $('#navToggle'), links = $('#navLinks'), nav = $('#nav');
  const setMenu = (open) => { toggle.setAttribute('aria-expanded', open); links.classList.toggle('open', open); };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', links).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* hide nav on scroll down */
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('hide', y > lastY && y > 400 && toggle.getAttribute('aria-expanded') !== 'true');
    lastY = y;
  }, { passive: true });

  /* drag-to-scroll slider */
  $$('.slider').forEach(track => {
    if (!fine) return;
    let down = false, sx = 0, sl = 0;
    track.addEventListener('pointerdown', e => { down = true; sx = e.clientX; sl = track.scrollLeft; });
    addEventListener('pointerup', () => { down = false; track.classList.remove('drag'); });
    addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) track.classList.add('drag');
      track.scrollLeft = sl - dx;
    });
  });



  /* build 3D / SVG core graphics */
  (() => {
    const hub = $('.hub');
    if (hub) for (let k = 0; k < 6; k++) { const a = k * 60; hub.insertAdjacentHTML('beforeend', `<i class="spoke" style="--a:${a}deg"></i><i class="sat" style="--a:${a}deg;--d:${k * .35}s"></i>`); }
    const bars = $('.bars3d');
    if (bars) {
      let html = '<div class="plate"></div>';
      [[-60, 44], [-30, 72], [0, 58], [30, 92], [60, 76]].forEach(([x, hgt], k) => { html += `<div class="bar" style="--x:${x}px;--h:${hgt}px;--d:${k * .4}s"><i class="f"></i><i class="k"></i><i class="l"></i><i class="r"></i><i class="t"></i></div>`; });
      bars.innerHTML = html;
    }
    const nn = $('.neural');
    if (nn) {
      const layers = [3, 4, 3, 2], xs = [22, 82, 142, 198], pts = layers.map((n, li) => Array.from({ length: n }, (_, i) => [xs[li], 85 + (i - (n - 1) / 2) * 44]));
      let s = '';
      for (let li = 0; li < layers.length - 1; li++) pts[li].forEach(a => pts[li + 1].forEach(b => { s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`; }));
      pts.forEach((layer, li) => layer.forEach((p, i) => { s += `<circle class="${li === 3 && i === 1 ? 'human' : ''}" cx="${p[0]}" cy="${p[1]}" r="${li === 3 ? 7 : 5.5}" style="--d:${(li * .5 + i * .2).toFixed(2)}s"/>`; }));
      nn.innerHTML = s;
    }
  })();

  /* solutions lab */
  const LAB = [
    { core: 'Capture + reply', title: 'Never lose a lead again', text: 'Every enquiry is saved, answered quickly and followed up until someone responds.', tools: 'n8n · your CRM · email', ins: ['Website form', 'Email inbox', 'Chat messages'], outs: ['Saved in your CRM', 'Reply sent in minutes', 'Owner notified'] },
    { core: 'Connect', title: 'Tools that finally talk to each other', text: 'One update shows up everywhere it should, with no retyping and no copy paste errors.', tools: 'n8n · Make · APIs', ins: ['CRM', 'Spreadsheet', 'Email'], outs: ['One update, everywhere', 'No retyping', 'Always in sync'] },
    { core: 'Collect + check', title: 'Reports that build themselves', text: 'A clear weekly summary and live dashboard, so you stop chasing numbers and start deciding.', tools: 'Power BI · Tableau · SQL', ins: ['Sales data', 'Ad accounts', 'Finance sheet'], outs: ['Summary in your inbox', 'Live dashboard', 'Alerts on odd numbers'] },
    { core: 'Clean + validate', title: 'Data you can trust', text: 'Messy records cleaned and kept clean, with automatic checks that warn you before errors cost you.', tools: 'Python · Airtable · Snowflake', ins: ['Duplicates', 'Missing fields', 'Old files'], outs: ['Clean records', 'Errors flagged same day', 'Numbers you trust'] },
    { core: 'AI + human review', title: 'An AI assistant that knows your business', text: 'Draft replies, sort requests and find answers in your documents, with a person approving the result.', tools: 'Claude · OpenAI', ins: ['Customer questions', 'Your documents', 'Long threads'], outs: ['Draft replies', 'Answers from your docs', 'Clear summaries'] },
    { core: 'Map + document', title: 'A clear plan before you spend', text: 'I map how work really flows, automate what is worth it and write it down so it outlives any team change.', tools: 'Process mapping · documentation', ins: ['Tribal know-how', 'Ad hoc steps', 'One person’s head'], outs: ['Written process', 'Automated steps', 'Survives team changes'] }
  ];
  const stage = $('#labStage');
  if (stage) {
    const items = $$('.lab__item'), insEl = $$('.pchip--in', stage), outsEl = $$('.pchip--out', stage), res = $('.lab__result', stage);
    const DUR = 6000; let cur = 0, timer = null, held = false;
    const show = (i, user) => {
      cur = i; const d = LAB[i]; stage.dataset.core = i;
      items.forEach((b, k) => { const on = k === i; b.classList.toggle('active', on); b.classList.remove('playing'); b.setAttribute('aria-selected', on); });
      void items[i].offsetWidth;
      if (!reduce && !user) items[i].classList.add('playing');
      insEl.forEach((el, k) => { el.textContent = d.ins[k]; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); });
      outsEl.forEach((el, k) => { el.textContent = d.outs[k]; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); });
      const cl = $('#coreLabel'); if (cl) cl.textContent = d.core; $('#resTitle').textContent = d.title; $('#resText').textContent = d.text; $('#resTools').textContent = d.tools;
      res.classList.remove('swap'); void res.offsetWidth; res.classList.add('swap');
    };
    const loop = () => { clearTimeout(timer); if (held || reduce) return; items.forEach(b => b.style.setProperty('--dur', DUR + 'ms')); timer = setTimeout(() => { show((cur + 1) % LAB.length); loop(); }, DUR); };
    items.forEach((b, i) => b.addEventListener('click', () => { held = true; clearTimeout(timer); show(i, true); setTimeout(() => { held = false; }, 20000); }));
    show(0); loop();
    const vis = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { if (!held) loop(); } else clearTimeout(timer); }), { threshold: .2 });
    vis.observe(stage);
    if (fine && !reduce) {
      stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); stage.style.setProperty('--tx', ((e.clientX - r.left) / r.width - .5) * 22 + 'px'); stage.style.setProperty('--ty', ((e.clientY - r.top) / r.height - .5) * 14 + 'px'); });
      stage.addEventListener('pointerleave', () => { stage.style.setProperty('--tx', '0px'); stage.style.setProperty('--ty', '0px'); });
    }
  }

  if (reduce) return;

  /* cursor glow */
  const glow = $('.cursor-glow');
  if (fine) {
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; document.body.classList.add('has-pointer'); }, { passive: true });
    (function loop() { gx += (tx - gx) * .12; gy += (ty - gy) * .12; glow.style.transform = `translate(${gx}px,${gy}px)`; requestAnimationFrame(loop); })();
  }

  /* magnetic buttons */
  if (fine) $$('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* spotlight + subtle tilt on service cards */
  if (fine) $$('.card').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
      el.style.transform = `perspective(900px) rotateX(${(.5 - y) * 5}deg) rotateY(${(x - .5) * 6}deg)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
})();
