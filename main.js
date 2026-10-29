// Sinuo Motion — landing. Todo el movimiento de la página: logo, muestras, menú, formulario.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const { sin, cos, exp, PI, max, min, round, abs } = Math;
  const cl = (x, a = 0, b = 1) => min(b, max(a, x));
  const eo = x => 1 - Math.pow(1 - cl(x), 3);
  const eio = x => { x = cl(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const back = x => { x = cl(x); const c = 2.2, c3 = c + 1; return 1 + c3 * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  // 0 → 1 con rebote de gelatina
  const jelly = u => u <= 0 ? 0 : 1 - exp(-6 * u) * cos(11 * u);
  const set = (el, a) => { for (const k in a) el.setAttribute(k, a[k]); return el; };
  const mk = (parent, tag, a = {}) => parent.appendChild(set(document.createElementNS(NS, tag), a));
  // escala desde un punto de anclaje (la base de una letra, el centro de una forma…)
  const sc = (x, y, sx, sy = sx) => `translate(${x},${y}) scale(${sx},${sy}) translate(${-x},${-y})`;

  /* ---------- Cabecera y menú ---------- */
  const header = document.querySelector('.site-header');
  const menuBtn = document.querySelector('.menu-btn');
  addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 8), { passive: true });
  menuBtn.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => {
    header.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false);
  }));

  /* ---------- Titular: palabras con rebote ---------- */
  document.querySelectorAll('.hero h1 .w').forEach((w, i) => w.style.animationDelay = (0.1 + i * 0.09) + 's');

  /* ---------- Aparición al hacer scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.transitionDelay = (sibs.indexOf(el) % 4) * 0.08 + 's';
    io.observe(el);
  });

  /* ---------- Formulario: abre el correo con el mensaje montado ---------- */
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const status = form.querySelector('.form-status');
    const d = new FormData(form);
    if (!d.get('nombre') || !d.get('email') || !d.get('mensaje') || !form.querySelector('#f-mail').checkValidity()) {
      status.textContent = 'Falta tu nombre, un email válido o el mensaje.';
      return;
    }
    const tipos = d.getAll('tipo').join(', ') || 'Sin indicar';
    const body = `Nombre: ${d.get('nombre')}\nEmail: ${d.get('email')}\nQué necesita: ${tipos}\nPresupuesto: ${d.get('presupuesto') || 'Aún no lo sé'}\n\n${d.get('mensaje')}`;
    location.href = `mailto:hola@sinuomotion.com?subject=${encodeURIComponent('Proyecto: ' + tipos)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Se ha abierto tu correo con el mensaje listo. Solo falta enviarlo.';
  });

  /* ---------- Animaciones en bucle (solo mientras se ven) ---------- */
  const loops = [];
  const visible = new IntersectionObserver(es => es.forEach(e => {
    const l = loops.find(l => l.el === e.target); if (l) l.on = e.isIntersecting;
  }));
  function addLoop(el, dur, render, still) {
    const l = { el, dur, render, on: false, t0: performance.now() };
    loops.push(l); visible.observe(el);
    if (reduce) render(still ?? dur * 0.7);
    return l;
  }
  if (!reduce) requestAnimationFrame(function tick(now) {
    for (const l of loops) if (l.on) l.render(((now - l.t0) / 1000) % l.dur);
    requestAnimationFrame(tick);
  });

  /* ---------- Logo animado de la portada (misma animación que el vídeo) ---------- */
  function intro() {
    const svg = document.getElementById('intro');
    const Ls = [...svg.querySelectorAll('.L')].map(g => { const b = g.getBBox(); return { g, ox: b.x + b.width / 2, oy: b.y + b.height }; });
    const dot = svg.querySelector('#dot'), db = dot.getBBox(), dox = db.x + db.width / 2, doy = db.y + db.height;
    const dota = svg.querySelector('#dota'), ring = svg.querySelector('#ring');
    const mrect = svg.querySelector('#mrect'), mot = svg.querySelector('#mot'), tag = svg.querySelector('#tag');
    const spring = u => u < 0 ? 700 : 700 * exp(-6.5 * u) * cos(10 * u);
    const bounceY = x => {
      const n = 7.5625, d = 2.75;
      if (x < 1 / d) return n * x * x;
      if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75;
      if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375;
      return n * (x -= 2.625 / d) * x + .984375;
    };
    const DUR = 7.5;
    function render(t) {
      Ls.forEach((o, i) => {
        const u = t - (0.15 + i * 0.09);
        const y = spring(u), v = (spring(u + .001) - spring(u - .001)) / .002;
        const sy = u < 0 ? 1 : 1 + cl(-v * 0.00022, -0.18, 0.28), sx = 1 / Math.sqrt(sy);
        const env = cl((t - 1.05) / .3) * (1 - cl((t - 2.3) / .6));
        const w = 22 * sin(2 * PI * 1.3 * (t - 1.05) - i * 0.95) * env;
        o.g.setAttribute('transform', `translate(${o.ox},${o.oy + y + w}) scale(${sx},${sy}) translate(${-o.ox},${-o.oy})`);
      });
      const t0 = 1.25, dur = 0.95, x = cl((t - t0) / dur);
      const h = -1100 * (1 - bounceY(x));
      let sq = 0;
      for (const k of [1 / 2.75, 2 / 2.75, 2.5 / 2.75]) sq += (k < .5 ? .38 : k < .8 ? .2 : .08) * exp(-Math.pow((t - (t0 + k * dur)) / .045, 2));
      dot.setAttribute('transform', `translate(${dox},${doy + h}) scale(${1 + sq * .9},${1 - sq}) translate(${-dox},${-doy})`);
      dot.style.visibility = t < t0 ? 'hidden' : 'visible';
      // el punto se queda azul un momento y vuelve al color del logo
      dota.setAttribute('opacity', 1 - cl((t - (t0 + dur)) / .35));
      const r = t - (t0 + dur / 2.75);
      if (r > 0) set(ring, { cx: dox, cy: doy - 60, r: 40 + eo(r / .7) * 420, opacity: cl(1 - r / .7), 'stroke-width': 18 * (1 - eo(r / .7)) + 2 });
      else ring.setAttribute('opacity', 0);
      const m = eo((t - 1.85) / .6);
      set(mrect, { y: 1062 - m * 400, height: m * 400 });
      mot.setAttribute('transform', `translate(0,${(1 - m) * 60})`);
      const tg = eo((t - 2.45) / .6);
      set(tag, { opacity: tg, transform: `translate(0,${(1 - tg) * 30})` });
      // fundido al final del bucle
      svg.style.opacity = 1 - cl((t - (DUR - .45)) / .45);
    }
    const l = addLoop(svg, DUR, render, 4.4);
    document.querySelector('.replay').addEventListener('click', () => { l.t0 = performance.now(); if (reduce) render(4.4); });
  }

  /* ---------- Portafolio: vídeos que se reproducen solos al verse, sonido a demanda ---------- */
  const works = [...document.querySelectorAll('.stage.video')].map(stage => {
    const video = stage.querySelector('video'), btn = stage.querySelector('.sound'), label = btn.querySelector('.sound-label');
    const setSound = on => {
      video.muted = !on;
      btn.setAttribute('aria-pressed', on);
      label.textContent = on ? 'Quitar sonido' : 'Activar sonido';
    };
    return { stage, video, btn, setSound };
  });
  works.forEach(w => {
    w.btn.addEventListener('click', () => {
      const on = w.video.muted;
      // solo suena un vídeo a la vez
      works.forEach(o => o !== w && o.setSound(false));
      w.setSound(on);
      if (on) { w.video.currentTime = 0; w.video.play().catch(() => {}); }
    });
    if (reduce) w.video.addEventListener('click', () => w.video.paused ? w.video.play() : w.video.pause());
  });
  const playIO = new IntersectionObserver(es => es.forEach(e => {
    const w = works.find(w => w.stage === e.target);
    if (e.isIntersecting && !reduce) w.video.play().catch(() => {});
    else { w.video.pause(); if (!e.isIntersecting) w.setSound(false); }
  }), { threshold: 0.4 });
  works.forEach(w => playIO.observe(w.stage));


  /* ---------- Un solo trazo: una línea nace en el punto del titular y recorre toda la web al hacer scroll ---------- */
  function trazo() {
    const svg = mk(document.body, 'svg', { class: 'trazo', 'aria-hidden': 'true' });
    const defs = mk(svg, 'defs');
    const path = mk(defs, 'path', { id: 'tz', fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    const layers = mk(svg, 'g');
    const pen = mk(svg, 'circle', { r: 0 });
    let L = 0, cur = 0, want = 0, maxY = [], pts = [], step = 6, bands = [], ready = false, marks = [], ringT = -1;
    const fired = new Set(), ring = mk(svg, 'circle', { fill: 'none', opacity: 0 });

    const hit = el => { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); };

    // posición final en la página (sin el desplazamiento de las apariciones .reveal)
    const shift = el => { const r = el.closest('.reveal'); return r ? new DOMMatrix(getComputedStyle(r).transform).m42 : 0; };
    const box = el => {
      const b = el.getBoundingClientRect(), s = scrollY - shift(el);
      return { l: b.left, r: b.right, t: b.top + s, b: b.bottom + s, w: b.width, h: b.height, cx: b.left + b.width / 2, cy: b.top + s + b.height / 2 };
    };
    // última línea de un titular, para subrayarla
    const lastLine = el => {
      const rg = document.createRange(); rg.selectNodeContents(el);
      const rs = [...rg.getClientRects()].filter(q => q.width > 1), last = rs[rs.length - 1];
      const line = rs.filter(q => Math.abs(q.bottom - last.bottom) < 6), s = scrollY - shift(el);
      return { l: min(...line.map(q => q.left)), r: max(...line.map(q => q.right)), b: last.bottom + s, h: last.height };
    };
    // Catmull-Rom → curvas de Bézier que pasan por todos los puntos
    // también devuelve la curva muestreada (x, y y longitud acumulada) para no pedírsela al navegador,
    // que con getPointAtLength sobre un trazo tan largo bloqueaba la página varios segundos
    const spline = P => {
      let d = `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)}`;
      const S = [[P[0][0], P[0][1], 0]];
      for (let i = 0; i < P.length - 1; i++) {
        const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += `C${c1.map(v => v.toFixed(1))} ${c2.map(v => v.toFixed(1))} ${p2.map(v => v.toFixed(1))}`;
        for (let k = 1; k <= 32; k++) {
          const t = k / 32, u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, e = t * t * t;
          const x = a * p1[0] + b * c1[0] + c * c2[0] + e * p2[0], y = a * p1[1] + b * c1[1] + c * c2[1] + e * p2[1];
          const q = S[S.length - 1];
          S.push([x, y, q[2] + Math.hypot(x - q[0], y - q[1])]);
        }
      }
      return [d, S];
    };
    // punto del trazo a una longitud dada, sobre la curva muestreada
    let S = [];
    const at = l => {
      let lo = 0, hi = S.length - 1;
      while (lo < hi) { const k = (lo + hi) >> 1; S[k][2] < l ? lo = k + 1 : hi = k; }
      const q = S[lo], o = S[lo - 1] || q, f = q[2] > o[2] ? (l - o[2]) / (q[2] - o[2]) : 0;
      return { x: o[0] + (q[0] - o[0]) * f, y: o[1] + (q[1] - o[1]) * f };
    };
    let lastW = 0, lastH = 0;

    function build(force) {
      const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
      const W = document.documentElement.clientWidth, H = box($('.site-footer')).b;
      // nada ha cambiado de tamaño: no hace falta rehacer el trazo
      if (!force && ready && W === lastW && abs(H - lastH) < 2) return;
      lastW = W; lastH = H;
      const wrap = $('#trabajos .wrap'), pad = parseFloat(getComputedStyle(wrap).paddingLeft), wb = wrap.getBoundingClientRect();
      const cL = wb.left + pad, cR = wb.right - pad;
      const xL = cL / 2, xR = (cR + W) / 2, amp = min(cL * .3, 34);
      const sw = cl(W / 230, 4, 7);
      const P = [], add = (x, y) => P.push([x, y]);
      // baja por un margen ondulando
      const lane = (x, y1, y2, side) => {
        const n = max(1, round((y2 - y1) / 300));
        for (let k = 1; k < n; k++) add(x + (k % 2 ? 1 : -1) * amp * side, y1 + (y2 - y1) * k / n);
        add(x, y2);
      };
      // cruza la sección por el aire de arriba, sin pisar textos
      const sweep = (sec, xa, xb) => {
        const b = box(sec), pt = parseFloat(getComputedStyle(sec).paddingTop), y = b.t + pt * .45, k = W > 700 ? 4 : 2;
        for (let i = 0; i <= k; i++) add(xa + (xb - xa) * i / k, y + (i % 2 ? -1 : 1) * pt * .16 * (i && i < k ? 1 : .3));
        return y;
      };

      // Portada: nace en el punto azul, hace un rizo en el aire a su derecha y baja por el margen
      const d = box($('.hero h1 .dot')), x0 = d.cx, y0 = d.b - d.h * .27;
      const room = cR - x0, s = cl(room / 5, 14, d.h * .45);
      add(x0, y0); add(x0 + s * 1.6, y0 + s * .2); add(x0 + s * 2.6, y0 - s * .9); add(x0 + s * 1.9, y0 - s * 1.8);
      add(x0 + s * 1.1, y0 - s * 1.1); add(x0 + s * 2.2, y0 + s * .1); add(x0 + s * 3.8, y0 + s * .2);
      const band = box($('.wave-band')), player = box($('.player'));
      add(xR, (y0 + player.t) / 2 + s); lane(xR, (y0 + player.t) / 2 + s, player.b, 1);
      // la onda de la franja la dibuja ahora el trazo
      const n = W > 700 ? 6 : 4;
      for (let k = 0; k <= n; k++) add(xR + (xL - xR) * k / n, band.t + band.h * .45 + (k % 2 ? -1 : 1) * band.h * .3 * (k && k < n ? 1 : .2));

      // Trabajos: entra por arriba y baja por la derecha entre las piezas
      sweep($('#trabajos'), xL, xR);
      const note = box($('#trabajos .work-note'));
      lane(xR, box($('#trabajos .section-head')).t, note.b, 1);

      // Servicios: de derecha a izquierda y baja por la izquierda
      sweep($('#servicios'), xR, xL);
      const sv = box($('.services-block'));
      lane(xL, sv.t, sv.b, -1);

      // Proceso: baja por la izquierda y pasa por los cuatro números como cuentas de un collar
      const nums = $$('.step .num').map(box);
      const flat = nums.length > 1 && abs(nums[1].cy - nums[0].cy) < 10;
      lane(xL, sv.b + 200, nums[0].cy - (flat ? 0 : nums[0].h), -1);
      if (flat) add(nums[0].l - 20, nums[0].cy);
      nums.forEach((c, i) => {
        if (i) add((nums[i - 1].cx + c.cx) / 2 + (flat ? 0 : -c.w * .7), (nums[i - 1].cy + c.cy) / 2 + (flat ? (i % 2 ? -1 : 1) * c.h * .4 : 0));
        add(c.cx, c.cy);
      });
      const last = nums[nums.length - 1];
      if (flat) { add(last.r + 30, last.cy - 10); add(xR, last.cy - 50); } else add(xL, last.b + 30);

      // Estudio: baja por un margen y cruza por encima de las cifras
      const facts = box($('.facts')), fy = facts.t - min(40, parseFloat(getComputedStyle($('.facts')).marginTop) * .5);
      const [xa, xb, sa] = flat ? [xR, xL, 1] : [xL, xR, -1];
      lane(xa, box($('#estudio')).t + 60, fy, sa);
      for (let k = 0; k <= 4; k++) add(xa + (xb - xa) * k / 4, fy + (k % 2 ? 1 : -1) * 14 * (k && k < 4 ? 1 : 0));
      lane(xb, fy, box($('#estudio')).b - 20, -sa);

      // Preguntas: dibuja una S grande en el hueco de la derecha
      sweep($('#preguntas'), flat ? xL : xR, xR);
      const fq = box($('.faq')), roomL = fq.r + 40, gap = cR - roomL;
      if (gap > 180) {
        const cx = roomL + gap / 2, r = gap / 2 * .75, y1 = fq.t, hh = fq.h;
        add(xR, y1 - 40); add(cx - r, y1 + hh * .25); add(cx + r, y1 + hh * .6); add(cx, y1 + hh + 20);
      } else lane(xR, fq.t, fq.b, 1);

      // Contacto: termina subrayando la pregunta y se queda como un punto, igual que el logo
      sweep($('#contacto'), xR, xL);
      const ct = lastLine($('#contacto-title')), uy = ct.b + max(8, ct.h * .1);
      add(xL, ct.b - ct.h * .5); add(ct.l - 4, uy + 6); add((ct.l + ct.r) / 2, uy); add(ct.r + 18, uy - 4);

      // momentos en los que la línea despierta algo de la página: [clave, posición, acción]
      const M = [['dot', [x0, y0], () => hit($('.hero h1 .dot'))]];
      $$('.step .num').forEach((el, i) => { const b = box(el); M.push(['n' + i, [b.cx, b.cy], () => hit(el)]); });

      const [dd, SS] = spline(P); S = SS;
      path.setAttribute('d', dd);
      set(svg, { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
      svg.style.height = H + 'px';
      path.setAttribute('stroke-width', sw);
      pen.setAttribute('r', sw * 1.6);
      L = S[S.length - 1][2];
      // pathLength hace que el guion use nuestra longitud aunque el navegador mida un poco distinto
      path.setAttribute('pathLength', L);
      path.setAttribute('stroke-dasharray', `${L} ${L + 10}`);
      maxY = []; let m = -1e9;
      pts = [];
      for (let l = 0; l <= L; l += step) { const q = at(l); pts.push(q); m = max(m, q.y); maxY.push(m); }
      const atY = y => { let lo = 0, hi = maxY.length - 1; while (lo < hi) { const k = (lo + hi) >> 1; maxY[k] < y ? lo = k + 1 : hi = k; } return lo * step; };
      const near = ([x, y]) => { let bi = 0, bd = 1e12; pts.forEach((q, i) => { const dd = (q.x - x) ** 2 + (q.y - y) ** 2; if (dd < bd) { bd = dd; bi = i; } }); return bi * step; };
      marks = M.map(([key, at, fn]) => ({ key, fn, len: key === 'dot' ? 0 : Array.isArray(at) ? near(at) : atY(at) }));
      marks.push({ key: 'end', len: L - step, fn: () => { ringT = performance.now(); } });

      // un color por sección: azul sobre arena, azul claro sobre negro, arena sobre azul
      layers.replaceChildren(); defs.querySelectorAll('clipPath').forEach(c => c.remove());
      bands = $$('main > section, main > .ticker, .site-footer').map((el, i) => {
        const b = box(el), col = el.classList.contains('blue') ? '#F3EFE7' : (el.classList.contains('dark') || el.classList.contains('ticker')) ? '#6B78FF' : '#2B3BFF';
        const cp = mk(defs, 'clipPath', { id: 'tzc' + i });
        mk(cp, 'rect', { x: 0, y: b.t, width: W, height: b.h });
        mk(layers, 'use', { href: '#tz', stroke: col, 'clip-path': `url(#tzc${i})` });
        return { t: b.t, b: b.b, col };
      });
      ready = true;
      if (reduce) cur = want = L;
      draw();
    }
    const target = () => {
      const y = scrollY + innerHeight * .62;
      let lo = 0, hi = maxY.length - 1;
      if (scrollY + innerHeight >= document.documentElement.scrollHeight - 4) return L;
      while (lo < hi) { const m = (lo + hi) >> 1; maxY[m] < y ? lo = m + 1 : hi = m; }
      return min(L, lo * step);
    };
    function draw() {
      path.setAttribute('stroke-dashoffset', L - cur);
      const p = at(cur), b = bands.find(b => p.y >= b.t && p.y < b.b);
      set(pen, { cx: p.x, cy: p.y, fill: b ? b.col : '#2B3BFF' });
    }
    // el titular entra rebotando: se recalcula cuando ya está quieto y luego empieza a dibujar
    let t0 = performance.now() + 1350;
    setTimeout(() => build(true), 1300);
    if (!reduce) requestAnimationFrame(function tick(now) {
      if (ready && now > t0) {
        want = target();
        const k = cur < want ? .09 : .14;
        if (abs(want - cur) > .3) { cur += (want - cur) * k; draw(); }
        for (const mm of marks) if (cur >= mm.len - 1 && !fired.has(mm.key)) { fired.add(mm.key); mm.fn(); }
        // al terminar, el punto final suelta una onda como el punto del logo
        if (ringT > 0) {
          const u = (now - ringT) / 900, p = at(L), w = +pen.getAttribute('r');
          set(ring, { cx: p.x, cy: p.y, r: w + eo(u) * w * 9, opacity: cl(1 - u), 'stroke-width': w * (1 - eo(u)) + 1, stroke: pen.getAttribute('fill') });
          if (u > 1) ringT = -1;
        }
      }
      requestAnimationFrame(tick);
    });
    let rt; const rebuild = () => { clearTimeout(rt); rt = setTimeout(build, 150); };
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => build(true), 150); });
    new ResizeObserver(rebuild).observe(document.querySelector('main'));
    addEventListener('load', rebuild);
    build();
  }

  document.fonts.ready.catch(() => {}).finally(() => { intro(); trazo(); });
})();
