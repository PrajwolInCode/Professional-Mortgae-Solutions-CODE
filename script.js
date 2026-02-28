// Professional Mortgage Solutions - small, browser-friendly JS

// Enable progressive-enhancement styles (only hides reveal elements when JS is running)
document.documentElement.classList.add('reveal');

const toggle = document.querySelector('.navToggle');
const nav = document.querySelector('#siteNav');

function setExpanded(isOpen){
  if (toggle) toggle.setAttribute('aria-expanded', String(isOpen));
  if (nav) nav.classList.toggle('open', isOpen);

  // Prevent background scrolling on small screens when menu is open
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

toggle?.addEventListener('click', () => {
  const isOpen = nav?.classList.contains('open');
  setExpanded(!isOpen);
});

// Close menu when clicking a nav link (mobile)
nav?.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  setExpanded(false);
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  const isOpen = nav?.classList.contains('open');
  if (!isOpen) return;
  const clickedInside = nav?.contains(e.target) || toggle?.contains(e.target);
  if (!clickedInside) setExpanded(false);
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (nav?.classList.contains('open')) setExpanded(false);
});

// Year
const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Legacy single-page hash routes -> new pages (keeps old shared links working)
const hashRoutes = {
  '#about': 'about.html',
  '#services': 'mortgage-solutions.html',
  '#process': 'process.html',
  '#calculators': 'calculators.html',
  '#faq': 'faq.html',
  '#contact': 'contact.html',
  '#loan-enquiry': 'contact.html'
};

(() => {
  const h = window.location.hash;
  const target = hashRoutes[h];
  if (!target) return;
  const pth = window.location.pathname || '';
  const onHome = (pth === '/' || pth.endsWith('/index.html') || pth.endsWith('index.html'));
  if (onHome) window.location.replace(target);
})();

// Subtle scroll-reveal (respects reduced motion)
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));

if (!reduceMotion && 'IntersectionObserver' in window){
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries){
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  }, { threshold: 0.12 });

  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}

// Back-to-top visibility
const backTop = document.querySelector('.backTop');
const onScroll = () => {
  if (!backTop) return;
  const show = window.scrollY > 640;
  backTop.classList.toggle('show', show);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();



// Premium UX layer (safe progressive enhancement)
(() => {
  const header = document.querySelector('.header');
  const progressBar = document.querySelector('.scrollProgress__bar');
  const hero = document.querySelector('.hero');
  const magneticBtns = Array.from(document.querySelectorAll('.btn'));
  const tiltCards = Array.from(document.querySelectorAll('.card, .tile, .serviceCard'));
  const allowPointerFX = window.matchMedia?.('(pointer:fine)')?.matches && !reduceMotion;

  const updateScrollUX = () => {
    const y = window.scrollY || window.pageYOffset || 0;
    if (header) header.classList.toggle('is-scrolled', y > 24);

    if (progressBar){
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const pct = Math.min(100, Math.max(0, (y / max) * 100));
      progressBar.style.transform = `scaleX(${pct / 100})`;
    }
  };

  window.addEventListener('scroll', updateScrollUX, { passive: true });
  window.addEventListener('resize', updateScrollUX);
  updateScrollUX();

  if (!allowPointerFX) return;

  magneticBtns.forEach((btn) => {
    btn.classList.add('btn--magnetic');
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / r.width;
      const y = (e.clientY - r.top - r.height / 2) / r.height;
      btn.style.transform = `translate(${x * 8}px, ${y * 7}px)`;
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = '';
    });
  });

  tiltCards.forEach((card) => {
    card.classList.add('revealTilt');
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  if (hero){
    const ambients = hero.querySelectorAll('.hero__ambient');
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const mx = (e.clientX - r.left) / r.width - 0.5;
      const my = (e.clientY - r.top) / r.height - 0.5;
      ambients.forEach((el, i) => {
        const factor = i === 0 ? 16 : 11;
        el.style.transform = `translate3d(${mx * factor}px, ${my * factor}px, 0)`;
      });
    });
    hero.addEventListener('pointerleave', () => {
      ambients.forEach((el) => { el.style.transform = ''; });
    });
  }
})();

// Helpers
const fmtAUD = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return '$—';
  return v.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
};


// ===== Calculators (guide only) =====
const num = (v) => {
  const n = Number(String(v ?? '').replace(/,/g,''));
  return Number.isFinite(n) ? n : 0;
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const toMonthly = (amount, freq) => {
  const x = num(amount);
  switch(String(freq)){
    case 'weekly': return x * 52 / 12;
    case 'fortnightly': return x * 26 / 12;
    case 'yearly': return x / 12;
    case 'monthly':
    default: return x;
  }
};

const fromMonthly = (monthly, freq) => {
  const x = num(monthly);
  switch(String(freq)){
    case 'weekly': return x * 12 / 52;
    case 'fortnightly': return x * 12 / 26;
    case 'yearly': return x * 12;
    case 'monthly':
    default: return x;
  }
};

// AU tax (simple guide only; excludes offsets, HELP/HECS, Medicare levy surcharge, etc.)
const estimateNetAnnualFromGross = (grossAnnual) => {
  const g = Math.max(0, num(grossAnnual));
  const brackets = [
    { upTo: 18200, rate: 0.00 },
    { upTo: 45000, rate: 0.16 },
    { upTo: 135000, rate: 0.30 },
    { upTo: 190000, rate: 0.37 },
    { upTo: Infinity, rate: 0.45 },
  ];
  let tax = 0;
  let prev = 0;
  for (const b of brackets){
    const cap = Math.min(g, b.upTo);
    const taxable = Math.max(0, cap - prev);
    tax += taxable * b.rate;
    prev = b.upTo;
    if (g <= b.upTo) break;
  }
  const medicare = g * 0.02; // simple proxy
  return Math.max(0, g - tax - medicare);
};

const estimateHEM = (state, dependants, netMonthlyIncome) => {
  const dep = clamp(num(dependants), 0, 5);
  const base = 2400 + dep * 420;
  const adj = ({
    NSW: 220, VIC: 190, QLD: 150, WA: 160, SA: 140, TAS: 120, ACT: 240, NT: 130
  }[String(state)] ?? 170);
  const incAdj = clamp(num(netMonthlyIncome) * 0.03, 0, 700); // scales mildly with income
  return Math.round(base + adj + incAdj);
};

const monthlyPayment = (P, annualRate, years) => {
  const principal = Math.max(0, num(P));
  const r = Math.max(0, num(annualRate)) / 12;
  const n = Math.max(0, num(years)) * 12;
  if (!principal || !n) return 0;
  if (r === 0) return principal / n;
  const pow = Math.pow(1 + r, n);
  return principal * (r * pow) / (pow - 1);
};

const principalFromPayment = (monthlyPay, annualRate, years) => {
  const M = Math.max(0, num(monthlyPay));
  const r = Math.max(0, num(annualRate)) / 12;
  const n = Math.max(0, num(years)) * 12;
  if (!M || !n) return 0;
  if (r === 0) return M * n;
  const pow = Math.pow(1 + r, n);
  return M * (pow - 1) / (r * pow);
};

const balanceAfterMonths = (P, annualRate, monthlyPay, months) => {
  const principal = Math.max(0, num(P));
  const r = Math.max(0, num(annualRate)) / 12;
  const M = Math.max(0, num(monthlyPay));
  const k = Math.max(0, Math.floor(num(months)));
  if (!principal) return 0;
  if (r === 0) return Math.max(0, principal - M * k);
  const pow = Math.pow(1 + r, k);
  const bal = principal * pow - M * (pow - 1) / r;
  return Math.max(0, bal);
};

const payoffMonths = (P, annualRate, monthlyPay) => {
  const principal = Math.max(0, num(P));
  const r = Math.max(0, num(annualRate)) / 12;
  const M = Math.max(0, num(monthlyPay));
  if (!principal || !M) return Infinity;
  if (r === 0) return Math.ceil(principal / M);
  if (M <= principal * r) return Infinity; // never pays down
  const n = -Math.log(1 - (principal * r) / M) / Math.log(1 + r);
  return Math.ceil(n);
};

const svgEl = (tag, attrs = {}) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k,v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
};

const drawAreaChart = (mount, series, opts = {}) => {
  if (!mount) return;
  mount.innerHTML = '';
  const width = 680, height = 320, padL = 54, padR = 18, padT = 14, padB = 36;
  const svg = svgEl('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img' });

  const maxY = Math.max(1, ...series.flatMap(s => s.values));
  const maxX = Math.max(1, ...series.map(s => (s.values.length - 1)));

  // grid + axes
  const grid = svgEl('g', { });
  const axisColor = '#cdd8e3';
  const textColor = '#5b6c7c';

  const yTicks = 5;
  for (let i=0; i<=yTicks; i++){
    const t = i / yTicks;
    const y = padT + (height - padT - padB) * (1 - t);
    const line = svgEl('line', { x1: padL, x2: width - padR, y1: y, y2: y, stroke: axisColor, 'stroke-width': 1 });
    grid.appendChild(line);

    const val = Math.round(maxY * t);
    const label = svgEl('text', { x: padL - 10, y: y + 4, 'text-anchor': 'end', fill: textColor, 'font-size': 11 });
    label.textContent = val.toLocaleString('en-AU');
    grid.appendChild(label);
  }

  const xTicks = opts.xTicks ?? 6;
  for (let i=0; i<=xTicks; i++){
    const t = i / xTicks;
    const x = padL + (width - padL - padR) * t;
    const line = svgEl('line', { x1: x, x2: x, y1: padT, y2: height - padB, stroke: axisColor, 'stroke-width': 1, 'stroke-opacity': 0.6 });
    grid.appendChild(line);

    const year = Math.round(maxX * t);
    const label = svgEl('text', { x: x, y: height - 14, 'text-anchor': 'middle', fill: textColor, 'font-size': 11 });
    label.textContent = year;
    grid.appendChild(label);
  }

  const xLabel = svgEl('text', { x: (padL + width - padR) / 2, y: height - 2, 'text-anchor': 'middle', fill: textColor, 'font-size': 12 });
  xLabel.textContent = opts.xLabel ?? 'Year';
  grid.appendChild(xLabel);

  svg.appendChild(grid);

  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const makePath = (vals) => {
    const pts = vals.map((v, i) => {
      const x = padL + plotW * (i / maxX);
      const y = padT + plotH * (1 - (v / maxY));
      return [x, y];
    });
    const baseY = padT + plotH;
    let d = `M ${pts[0][0]} ${baseY} L ${pts[0][0]} ${pts[0][1]}`;
    for (let i=1; i<pts.length; i++) d += ` L ${pts[i][0]} ${pts[i][1]}`;
    d += ` L ${pts[pts.length-1][0]} ${baseY} Z`;
    return d;
  };

  const rootStyles = getComputedStyle(document.documentElement);
  const brand = (rootStyles.getPropertyValue('--brand') || '#0B2D62').trim();
  const colors = (opts.colors && opts.colors.length) ? opts.colors : [brand, brand];
  const opacities = [0.35, 0.6];

  series.forEach((s, idx) => {
    const area = svgEl('path', {
      d: makePath(s.values),
      fill: colors[idx % colors.length],
      'fill-opacity': s.fillOpacity ?? opacities[idx % opacities.length],
      stroke: colors[idx % colors.length],
      'stroke-width': 2,
      'stroke-opacity': 0.9
    });
    svg.appendChild(area);
  });

  mount.appendChild(svg);
};

const cssVar = (name, fallback = '') => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return (v || fallback).trim();
};

const drawBarChart = (mount, labels, values, opts = {}) => {
  if (!mount) return;
  mount.innerHTML = '';

  const width = 680, height = 320, padL = 54, padR = 18, padT = 14, padB = 42;
  const svg = svgEl('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img' });

  const maxY = Math.max(1, ...values.map(v => Math.max(0, Number(v) || 0)));
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const axisColor = '#cdd8e3';
  const textColor = '#5b6c7c';

  const yTicks = 5;
  for (let i=0; i<=yTicks; i++){
    const t = i / yTicks;
    const y = padT + plotH * (1 - t);
    svg.appendChild(svgEl('line', { x1: padL, x2: width - padR, y1: y, y2: y, stroke: axisColor, 'stroke-width': 1 }));
    const val = Math.round(maxY * t);
    const label = svgEl('text', { x: padL - 10, y: y + 4, 'text-anchor': 'end', fill: textColor, 'font-size': 11 });
    label.textContent = val.toLocaleString('en-AU');
    svg.appendChild(label);
  }

  const colors = (opts.colors && opts.colors.length)
    ? opts.colors
    : [cssVar('--brand', '#0B2D62'), cssVar('--accent', '#14B8A6')];

  const barGap = 38;
  const barW = Math.min(150, (plotW - barGap) / 2);
  const x0 = padL + (plotW - (barW * 2 + barGap)) / 2;

  values.forEach((raw, idx) => {
    const v = Math.max(0, Number(raw) || 0);
    const h = plotH * (v / maxY);
    const x = x0 + idx * (barW + barGap);
    const y = padT + (plotH - h);

    svg.appendChild(svgEl('rect', {
      x, y, width: barW, height: h,
      rx: 14,
      fill: colors[idx % colors.length],
      'fill-opacity': 0.75,
      stroke: colors[idx % colors.length],
      'stroke-opacity': 0.95,
      'stroke-width': 2
    }));

    const xMid = x + barW / 2;

    const lbl = svgEl('text', { x: xMid, y: height - 18, 'text-anchor': 'middle', fill: textColor, 'font-size': 12 });
    lbl.textContent = String(labels[idx] ?? '');
    svg.appendChild(lbl);

    const valLbl = svgEl('text', { x: xMid, y: y - 8, 'text-anchor': 'middle', fill: '#0f1f33', 'font-size': 12, 'font-weight': 800 });
    valLbl.textContent = fmtAUD(v);
    svg.appendChild(valLbl);
  });

  mount.appendChild(svg);
};

// Stamp duty (simplified guide only)
// =========================
// Stamp duty (indicative)
// =========================
const dutyNSW = (p) => {
  // Standard transfer duty rates from 1 July 2025 (Revenue NSW). Premium applies above the premium threshold.
  const x = Math.max(0, num(p));
  const premiumThreshold = 3721000;
  if (x > premiumThreshold) {
    return 186667 + (x - premiumThreshold) * 0.07;
  }
  if (x <= 17000) return Math.max(20, x * 0.0125);
  if (x <= 37000) return 212 + (x - 17000) * 0.015;
  if (x <= 99000) return 512 + (x - 37000) * 0.0175;
  if (x <= 372000) return 1597 + (x - 99000) * 0.035;
  if (x <= 1240000) return 11152 + (x - 372000) * 0.045;
  return 50212 + (x - 1240000) * 0.055;
};

const dutyVIC = (p) => {
  const x = Math.max(0, num(p));
  if (x <= 25000) return x * 0.014;
  if (x <= 130000) return 350 + (x - 25000) * 0.024;
  if (x <= 960000) return 2870 + (x - 130000) * 0.06;
  if (x <= 2000000) return x * 0.055;
  return 110000 + (x - 2000000) * 0.065;
};

const dutyQLD = (p) => {
  const x = Math.max(0, num(p));
  if (x <= 5000) return 0;
  if (x <= 75000) return (x - 5000) * 0.015;
  if (x <= 540000) return 1050 + (x - 75000) * 0.035;
  if (x <= 1000000) return 17325 + (x - 540000) * 0.045;
  return 38025 + (x - 1000000) * 0.0575;
};

const dutySA = (p) => {
  const x = Math.max(0, num(p));
  if (x <= 12000) return x * 0.01;
  if (x <= 30000) return 120 + (x - 12000) * 0.02;
  if (x <= 50000) return 480 + (x - 30000) * 0.03;
  if (x <= 100000) return 1080 + (x - 50000) * 0.035;
  if (x <= 200000) return 2830 + (x - 100000) * 0.04;
  if (x <= 250000) return 6830 + (x - 200000) * 0.0425;
  if (x <= 300000) return 8955 + (x - 250000) * 0.0475;
  if (x <= 500000) return 11330 + (x - 300000) * 0.05;
  return 21330 + (x - 500000) * 0.055;
};

const dutyWA = (p) => {
  const x = Math.max(0, num(p));
  if (x <= 120000) return x * 0.019;
  if (x <= 150000) return 2280 + (x - 120000) * 0.0285;
  if (x <= 360000) return 3135 + (x - 150000) * 0.038;
  if (x <= 725000) return 11115 + (x - 360000) * 0.0475;
  return 28453 + (x - 725000) * 0.0515;
};

const dutyTAS = (p) => {
  const x = Math.max(0, num(p));
  if (x <= 3000) return 50;
  if (x <= 25000) return 50 + (x - 3000) * 0.0175;
  if (x <= 75000) return 435 + (x - 25000) * 0.0225;
  if (x <= 200000) return 1560 + (x - 75000) * 0.035;
  if (x <= 375000) return 5935 + (x - 200000) * 0.04;
  if (x <= 725000) return 12935 + (x - 375000) * 0.0425;
  return 27810 + (x - 725000) * 0.045;
};

const dutyACT = (p, type) => {
  const x = Math.max(0, num(p));
  const isPpor = String(type) === 'PPOR';

  // Owner-occupier rates (eligible) and non-owner occupier rates (ACT Revenue Office).
  if (isPpor) {
    if (x <= 260000) return x * 0.0028;
    if (x <= 300000) return 728 + (x - 260000) * 0.022;
    if (x <= 500000) return 1608 + (x - 300000) * 0.034;
    if (x <= 750000) return 8408 + (x - 500000) * 0.0432;
    if (x <= 1000000) return 19208 + (x - 750000) * 0.059;
    if (x <= 1455000) return 33958 + (x - 1000000) * 0.064;
    return x * 0.0454;
  }

  // Non-owner occupier
  if (x <= 200000) return x * 0.012;
  if (x <= 300000) return 2400 + (x - 200000) * 0.022;
  if (x <= 500000) return 4600 + (x - 300000) * 0.034;
  if (x <= 750000) return 11400 + (x - 500000) * 0.0432;
  if (x <= 1000000) return 22200 + (x - 750000) * 0.059;
  if (x <= 1455000) return 36950 + (x - 1000000) * 0.064;
  return x * 0.0454;
};

const dutyNT = (p) => {
  const x = Math.max(0, num(p));
  if (x <= 525000) {
    const V = x / 1000;
    return (0.06571441 * V * V) + (15 * V);
  }
  if (x < 3000000) return x * 0.0495;
  if (x < 5000000) return x * 0.0575;
  return x * 0.0595;
};

const baseDuty = (state, price, type) => {
  switch (String(state)) {
    case 'NSW': return dutyNSW(price);
    case 'VIC': return dutyVIC(price);
    case 'QLD': return dutyQLD(price);
    case 'SA':  return dutySA(price);
    case 'WA':  return dutyWA(price);
    case 'TAS': return dutyTAS(price);
    case 'ACT': return dutyACT(price, type);
    case 'NT':  return dutyNT(price);
    default: return 0;
  }
};

const foreignSurchargeRate = (state) => {
  switch (String(state)) {
    case 'NSW': return 0.09; // surcharge purchaser duty from 1 Jan 2025
    case 'VIC': return 0.08; // foreign purchaser additional duty
    case 'QLD': return 0.08; // AFAD
    case 'WA':  return 0.07; // foreign transfer duty
    case 'TAS': return 0.08; // FIDS (residential)
    // SA: foreign ownership surcharge depends on contract date (applies to contracts prior to 13 Feb 2025).
    default: return 0;
  }
};

const dutyWithOptions = (state, price, type, fhb, foreign) => {
  const p = Math.max(0, num(price));
  const isPpor = String(type) === 'PPOR';

  let duty = baseDuty(state, p, type);

  // First home buyer (very simplified, indicative only)
  if (fhb && isPpor) {
    if (state === 'NSW') {
      if (p <= 800000) duty = 0;
      else if (p < 1000000) duty = duty * ((p - 800000) / 200000);
    }
    if (state === 'VIC') {
      if (p <= 600000) duty = 0;
      else if (p <= 750000) duty = duty * ((p - 600000) / 150000);
    }
    if (state === 'TAS') {
      if (p <= 750000) duty = 0;
    }
    if (state === 'WA') {
      if (p <= 500000) duty = 0;
      else if (p <= 700000) duty = (p - 500000) * 0.1363;
    }
  }

  // Foreign purchaser surcharge (applies on top of base duty)
  if (foreign) {
    const rate = foreignSurchargeRate(state);
    if (rate > 0) duty += p * rate;
  }

  return Math.max(0, Math.round(duty));
};

// Borrowing capacity
const borrowForm = document.querySelector('#calcBorrow');
const borrowMaxEl = document.querySelector('#borrowMax');
const borrowPayEl = document.querySelector('#borrowPay');
const hemEl = document.querySelector('#hemValue');
const borrowChart = document.querySelector('#borrowChart');

const syncJoint = () => {
  const joint = borrowForm?.querySelector('input[name="joint"]:checked')?.value ?? 'yes';
  const show = joint === 'yes';
  borrowForm?.querySelectorAll('.jointOnly').forEach(el => {
    el.style.display = show ? '' : 'none';
    const input = el.querySelector('input');
    if (input) input.disabled = !show;
  });
};

const updateBorrow = () => {
  if (!borrowForm) return;

  syncJoint();

  const state = borrowForm.elements.state?.value ?? 'VIC';
  const dep = borrowForm.elements.dependants?.value ?? '0';
  const incomeFreq = borrowForm.elements.incomeFreq?.value ?? 'yearly';
  const incomeType = borrowForm.querySelector('input[name="incomeType"]:checked')?.value ?? 'net';

  const i1 = num(borrowForm.elements.income1?.value);
  const i2 = num(borrowForm.elements.income2?.value);
  const iO = num(borrowForm.elements.incomeOther?.value);

  // Convert income to annual (based on chosen frequency)
  const incomeAnnual = fromMonthly(toMonthly(i1, incomeFreq), 'yearly')
    + fromMonthly(toMonthly(i2, incomeFreq), 'yearly')
    + fromMonthly(toMonthly(iO, incomeFreq), 'yearly');

  const netAnnual = (incomeType === 'gross')
    ? estimateNetAnnualFromGross(incomeAnnual)
    : incomeAnnual;

  const netMonthly = netAnnual / 12;

  const expFreq = borrowForm.elements.expFreq?.value ?? 'monthly';
  const livingIn = num(borrowForm.elements.livingExp?.value);
  const loansIn = num(borrowForm.elements.otherLoans?.value);
  const ccLimit = num(borrowForm.elements.ccLimit?.value);

  const livingMonthlyEntered = toMonthly(livingIn, expFreq);
  const hem = estimateHEM(state, dep, netMonthly);
  if (hemEl) hemEl.textContent = fmtAUD(hem);

  const livingMonthly = Math.max(livingMonthlyEntered, hem);
  const otherMonthly = toMonthly(loansIn, expFreq) + (ccLimit * 0.03); // simple min repayment proxy

  const surplus = Math.max(0, netMonthly - livingMonthly - otherMonthly);
  const buffer = num(borrowForm.elements.buffer?.value ?? 0.20);
  const usable = surplus * (1 - clamp(buffer, 0, 0.9));

  const annualRate = num(borrowForm.elements.rate?.value) / 100;
  const years = num(borrowForm.elements.termYears?.value);

  const principal = principalFromPayment(usable, annualRate, years);
  const monthly = monthlyPayment(principal, annualRate, years);

  if (borrowMaxEl) borrowMaxEl.textContent = fmtAUD(principal);
  if (borrowPayEl) borrowPayEl.textContent = fmtAUD(monthly);

  // Chart: yearly balances
  const yrs = clamp(years, 1, 40);
  const values = [];
  for (let y=0; y<=yrs; y++){
    values.push(Math.round(balanceAfterMonths(principal, annualRate, monthly, y*12)));
  }
  drawAreaChart(borrowChart, [{ values }], { xLabel: 'Year', xTicks: Math.min(6, yrs) });
};

borrowForm?.addEventListener('input', updateBorrow);
borrowForm?.addEventListener('change', updateBorrow);
updateBorrow();

// Stamp duty calculator
const stampForm = document.querySelector('#calcStamp');
const stampDutyEl = document.querySelector('#stampDuty');
const stampTotalEl = document.querySelector('#stampTotal');
const stampPctEl = document.querySelector('#stampPct');
const stampChart = document.querySelector('#stampChart');

const updateStamp = () => {
  if (!stampForm) return;

  const price = num(stampForm.elements.price?.value);
  const state = String(stampForm.elements.state?.value || 'VIC');
  const type = String(stampForm.elements.type?.value || 'PPOR');
  const fhb = !!stampForm.elements.fhb?.checked;
  const foreign = !!stampForm.elements.foreign?.checked;

  if (!price) {
    if (stampDutyEl) stampDutyEl.textContent = '$—';
    if (stampTotalEl) stampTotalEl.textContent = '$—';
    if (stampPctEl) stampPctEl.textContent = '—';
    if (stampChart) stampChart.innerHTML = '';
    return;
  }

  const duty = dutyWithOptions(state, price, type, fhb, foreign);
  const total = price + duty;
  const pct = price ? (duty / price) * 100 : 0;

  if (stampDutyEl) stampDutyEl.textContent = fmtAUD(duty);
  if (stampTotalEl) stampTotalEl.textContent = fmtAUD(total);
  if (stampPctEl) stampPctEl.textContent = `${pct.toFixed(2)}%`;

  drawBarChart(stampChart, ['Property price', 'Stamp duty'], [price, duty], {
    colors: [cssVar('--brand', '#0B2D62'), cssVar('--accent', '#14B8A6')]
  });
};

stampForm?.addEventListener('input', updateStamp);
stampForm?.addEventListener('change', updateStamp);
updateStamp();

// Repayments
const repayForm = document.querySelector('#calcRepay');
const repayChart = document.querySelector('#repayChart');
const repayPaymentEl = document.querySelector('#repayPayment');
const repayFreqNote = document.querySelector('#repayFreqNote');
const repayTotalEl = document.querySelector('#repayTotal');
const repayInterestEl = document.querySelector('#repayInterest');
const repayExtraTotalEl = document.querySelector('#repayExtraTotal');
const repaySavingEl = document.querySelector('#repaySaving');
const repayYearsSavedEl = document.querySelector('#repayYearsSaved');

const updateRepay = () => {
  if (!repayForm) return;

  const P = num(repayForm.elements.loan?.value);
  const years = clamp(num(repayForm.elements.termYears?.value), 1, 40);
  const annualRate = num(repayForm.elements.rate?.value) / 100;
  const freq = repayForm.elements.freq?.value ?? 'monthly';
  const extra = num(repayForm.elements.extra?.value);

  const baseMonthly = monthlyPayment(P, annualRate, years);
  const basePay = fromMonthly(baseMonthly, freq);

  // Extra in chosen frequency -> monthly equivalent
  const extraMonthly = toMonthly(extra, freq);
  const newMonthly = baseMonthly + extraMonthly;

  const baseMonths = years * 12;
  const newMonths = Math.min(baseMonths, payoffMonths(P, annualRate, newMonthly));

  const totalBase = baseMonthly * baseMonths;
  const interestBase = Math.max(0, totalBase - P);

  const totalNew = newMonthly * newMonths;
  const interestNew = Math.max(0, totalNew - P);

  const extraTotal = extraMonthly * newMonths;
  const saving = Math.max(0, totalBase - totalNew);
  const yearsSaved = Math.max(0, (baseMonths - newMonths) / 12);

  if (repayPaymentEl) repayPaymentEl.textContent = fmtAUD(basePay);
  if (repayFreqNote) repayFreqNote.textContent = (freq === 'weekly') ? '(Weekly)' : (freq === 'fortnightly') ? '(Fortnightly)' : '(Monthly)';

  if (repayTotalEl) repayTotalEl.textContent = fmtAUD(totalNew);
  if (repayInterestEl) repayInterestEl.textContent = fmtAUD(interestNew);
  if (repayExtraTotalEl) repayExtraTotalEl.textContent = fmtAUD(extraTotal);
  if (repaySavingEl) repaySavingEl.textContent = fmtAUD(saving);
  if (repayYearsSavedEl) repayYearsSavedEl.textContent = yearsSaved ? yearsSaved.toFixed(1) : '—';

  // Chart series (yearly)
  const valuesBase = [];
  const valuesNew = [];
  for (let y=0; y<=years; y++){
    valuesBase.push(Math.round(balanceAfterMonths(P, annualRate, baseMonthly, y*12)));
    valuesNew.push(Math.round(balanceAfterMonths(P, annualRate, newMonthly, y*12)));
  }
  drawAreaChart(repayChart, [{ values: valuesBase, fillOpacity: 0.25 }, { values: valuesNew, fillOpacity: 0.55 }], { xLabel: 'Year', xTicks: Math.min(6, years) });
};

repayForm?.addEventListener('input', updateRepay);
repayForm?.addEventListener('change', updateRepay);
updateRepay();

// FAQ accordion
document.querySelectorAll('.faqQ').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faqItem');
    const panel = item?.querySelector('.faqA');
    const icon = item?.querySelector('.faqIcon');
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    btn.setAttribute('aria-expanded', String(!isOpen));
    if (panel) panel.hidden = isOpen;
    if (icon) icon.textContent = isOpen ? '+' : '–';
  });
});

// ===== Netlify Forms (AJAX-enhanced with graceful fallback) =====
(() => {
  const forms = Array.from(document.querySelectorAll('form[data-netlify="true"]'));
  if (!forms.length) return;

  const encode = (form) => new URLSearchParams(new FormData(form)).toString();

  forms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      // If running locally, let the browser handle it (Netlify won't capture locally anyway)
      const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname) || window.location.protocol === 'file:';
      if (isLocal) return;

      e.preventDefault();

      const action = form.getAttribute('action') || '/thank-you/';
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(form),
      })
        .then(() => { window.location.href = action; })
        .catch(() => {
          // Fall back to normal submit if fetch fails
          form.submit();
        });
    });
  });
})();


// =========================
// Dynamic polish additions
// =========================
(() => {
  // Active nav link (multi-page)
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('#siteNav a[href]').forEach((a) => {
    // Keep button-style CTAs consistent across pages (e.g., “Get started”)
    if (a.classList.contains('btn')) return;
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return;

    // Handle "./" and leading "/"
    const normalized = href.replace(/^\.\//,'').replace(/^\//,'');
    if (normalized === current) {
      a.classList.add('is-active');
      a.setAttribute('aria-current','page');
    } else if (a.getAttribute('aria-current') === 'page' && normalized !== current) {
      // keep author-set aria-current when present (some pages already have it)
      // but don't overwrite it
    }
  });

  // Header scroll state
  const header = document.querySelector('.header');

  const setHeaderHeight = () => {
    if (!header) return;
    document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
  };
  window.addEventListener('resize', setHeaderHeight);
  const setHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    setHeaderHeight();
  };
  window.addEventListener('scroll', setHeader, { passive: true });
  setHeader();
  setHeaderHeight();

  // Scroll progress (reuse existing node if present)
  const progress = document.querySelector('.scrollProgress') || (() => {
    const el = document.createElement('div');
    el.className = 'scrollProgress';
    el.innerHTML = '<div class="scrollProgress__bar"></div>';
    document.body.prepend(el);
    return el;
  })();
  const bar = progress.querySelector('.scrollProgress__bar');

  const setProgress = () => {
    if (!bar) return;
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const pct = Math.min(1, Math.max(0, window.scrollY / max));
    bar.style.transform = `scaleX(${pct})`;
  };
  window.addEventListener('scroll', setProgress, { passive: true });
  window.addEventListener('resize', setProgress);
  setProgress();

  // Page transition overlay for internal navigation
  const overlay = document.createElement('div');
  overlay.className = 'pageOverlay';
  overlay.setAttribute('aria-hidden','true');
  document.body.appendChild(overlay);

  const isInternalHtmlLink = (a) => {
    if (!a) return false;
    const href = a.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return false;
    if (href.startsWith('http')) {
      try {
        const u = new URL(href);
        return u.origin === location.origin;
      } catch { return false; }
    }
    // local page like "about.html" or "/about.html"
    return href.endsWith('.html') || href.endsWith('/');
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    if (!isInternalHtmlLink(a)) return;

    // allow new-tab, middle click, downloads, etc.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.hasAttribute('download') || a.getAttribute('target') === '_blank') return;

    const href = a.getAttribute('href');
    if (!href) return;

    // If navigating to same page, don't animate
    const targetUrl = new URL(href, location.href);
    if (targetUrl.href === location.href) return;

    e.preventDefault();
    overlay.classList.add('is-active');
    window.setTimeout(() => { location.href = targetUrl.href; }, 140);
  });

  // Ensure overlay is cleared on bfcache restores
  window.addEventListener('pageshow', () => overlay.classList.remove('is-active'));

  // Mobile sticky CTA (hide on contact page to avoid duplication)
  const page = current;
  const inThankYouFolder = location.pathname.toLowerCase().includes('/thank-you/');
  const showSticky = !inThankYouFolder && !['contact.html', 'thank-you.html'].includes(page);
  if (showSticky) {
    const cta = document.createElement('div');
    cta.className = 'stickyCta';
    cta.innerHTML = `
      <div class="stickyCta__inner">
        <a class="btn" href="contact.html">Book a call</a>
        <a class="btn btn--ghost" href="tel:0451539018">Call now</a>
      </div>`;
    document.body.appendChild(cta);
    document.body.classList.add('has-stickyCta');
  }

  // FAQ tools: search + expand/collapse (auto-injected)
  const faq = document.querySelector('.faq');
  if (faq) {
    const tools = document.createElement('div');
    tools.className = 'faqTools';
    tools.innerHTML = `
      <div class="faqTools__left">
        <label class="srOnly" for="faqSearch">Search FAQs</label>
        <input id="faqSearch" class="input" type="search" placeholder="Search FAQs…" autocomplete="off" />
      </div>
      <div class="faqTools__right">
        <button type="button" class="btn btn--small btn--ghost" data-faq-expand>Expand all</button>
        <button type="button" class="btn btn--small btn--ghost" data-faq-collapse>Collapse all</button>
      </div>
    `;
    faq.parentElement?.insertBefore(tools, faq);

    const items = Array.from(faq.querySelectorAll('.faqItem'));
    const openItem = (item) => {
      const btn = item.querySelector('.faqQ');
      const panel = item.querySelector('.faqA');
      const icon = item.querySelector('.faqIcon');
      if (!btn || !panel) return;
      btn.setAttribute('aria-expanded','true');
      panel.hidden = false;
      if (icon) icon.textContent = '–';
    };
    const closeItem = (item) => {
      const btn = item.querySelector('.faqQ');
      const panel = item.querySelector('.faqA');
      const icon = item.querySelector('.faqIcon');
      if (!btn || !panel) return;
      btn.setAttribute('aria-expanded','false');
      panel.hidden = true;
      if (icon) icon.textContent = '+';
    };

    tools.querySelector('[data-faq-expand]')?.addEventListener('click', () => items.forEach(openItem));
    tools.querySelector('[data-faq-collapse]')?.addEventListener('click', () => items.forEach(closeItem));

    const input = tools.querySelector('#faqSearch');
    const normalize = (s) => (s || '').toLowerCase().replace(/\s+/g,' ').trim();
    input?.addEventListener('input', () => {
      const q = normalize(input.value);
      items.forEach((item) => {
        const t = normalize(item.querySelector('.faqQ')?.textContent);
        const a = normalize(item.querySelector('.faqA')?.textContent);
        const match = !q || t.includes(q) || a.includes(q);
        item.style.display = match ? '' : 'none';
      });
    });
  }
})();

// =========================
// Loan help (dynamic form)
// =========================
(() => {
  const range = document.getElementById('loanAmountRange');
  const value = document.getElementById('loanAmountValue');
  if (range && value){
    const update = () => {
      value.textContent = fmtAUD(range.value);
    };
    range.addEventListener('input', update);
    update();
  }

  const scenario = document.getElementById('loanScenario');
  const groups = Array.from(document.querySelectorAll('.dynGroup[data-scenario]'));
  if (scenario && groups.length){
    const setGroups = () => {
      const v = scenario.value;
      // Hide everything until a scenario is selected
      if (!v){
        groups.forEach(g => g.classList.add('hidden'));
        return;
      }
      groups.forEach((g) => {
        const match = g.getAttribute('data-scenario') === v;
        g.classList.toggle('hidden', !match);
      });
    };
    scenario.addEventListener('change', setGroups);
    setGroups();
  }
})();

// =========================
// Horizontal card rails + slider (portfolio-style)
// =========================
(() => {
  const rails = Array.from(document.querySelectorAll('[data-hscroll]'));
  if (!rails.length) return;

  const nearestIndex = (rail, slides) => {
    const left = rail.scrollLeft;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((el, i) => {
      const dist = Math.abs(el.offsetLeft - left);
      if (dist < bestDist){
        bestDist = dist;
        best = i;
      }
    });
    return best;
  };

  const setupSlider = (rail, wrap) => {
    const slides = Array.from(rail.children).filter(n => n && n.nodeType === 1);
    if (slides.length < 2) return;

    const prev = wrap.querySelector('[data-hscroll-prev]');
    const next = wrap.querySelector('[data-hscroll-next]');

    // Dots mount (create if missing)
    const dotsMount = wrap.querySelector('[data-slider-dots]') || (() => {
      const d = document.createElement('div');
      d.className = 'hDots';
      d.setAttribute('data-slider-dots', '');
      d.setAttribute('aria-label', 'Slider pagination');
      rail.insertAdjacentElement('afterend', d);
      return d;
    })();

    dotsMount.innerHTML = '';

    let current = 0;
    let lastUser = performance.now();
    let paused = false;

    // Progress bar (optional)
    const progressBar = wrap.querySelector('[data-slider-progress]');
    const setProgress = (p) => {
      if (!progressBar) return;
      const v = Math.max(0, Math.min(1, p));
      progressBar.style.transform = `scaleX(${v})`;
    };

    const setActive = (idx) => {
      current = idx;
      slides.forEach((el, i) => el.classList.toggle('is-active', i === idx));
      dots.forEach((b, i) => b.setAttribute('aria-current', i === idx ? 'true' : 'false'));
      if (prev) prev.disabled = idx === 0;
      if (next) next.disabled = idx === slides.length - 1;
    };

    const goTo = (idx, user = false) => {
      const i = (idx + slides.length) % slides.length;
      slides[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      setActive(i);
      if (user) {
        lastUser = performance.now();
        autoStart = null;
        setProgress(0);
      }
    };

    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hDotBtn';
      b.setAttribute('aria-label', `Go to slide ${i + 1}`);
      b.addEventListener('click', () => goTo(i, true));
      dotsMount.appendChild(b);
      return b;
    });

    prev?.addEventListener('click', () => goTo(current - 1, true));
    next?.addEventListener('click', () => goTo(current + 1, true));

    // Sync dots with scroll-snap position
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const idx = nearestIndex(rail, slides);
        setActive(idx);
      });
    };
    rail.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Pause on hover/focus, and after user interactions
    const pause = () => {
      paused = true;
      autoStart = null;
      setProgress(0);
    };
    const resume = () => {
      paused = false;
      lastUser = performance.now();
      autoStart = null;
      setProgress(0);
    };

    wrap.addEventListener('mouseenter', pause);
    wrap.addEventListener('mouseleave', resume);
    wrap.addEventListener('focusin', pause);
    wrap.addEventListener('focusout', (e) => {
      if (!wrap.contains(e.relatedTarget)) resume();
    });
    rail.addEventListener('touchstart', () => { lastUser = performance.now(); autoStart = null; setProgress(0); }, { passive: true });
    rail.addEventListener('wheel', () => { lastUser = performance.now(); autoStart = null; setProgress(0); }, { passive: true });

    const canAuto = !reduceMotion && slides.length > 1;
    const autoDelay = 5200; // ms
    const cooldownMs = 6000; // wait after user interaction

    let autoRaf = 0;
    let inView = true;
    let autoStart = null; // performance.now timestamp

    const resetAuto = () => {
      autoStart = null;
      setProgress(0);
    };

    const tick = () => {
      if (!canAuto || !inView){
        autoRaf = 0;
        resetAuto();
        return;
      }

      const now = performance.now();

      if (document.hidden || paused || (now - lastUser < cooldownMs)){
        resetAuto();
      } else {
        if (autoStart === null) autoStart = now;
        const t = (now - autoStart) / autoDelay;
        setProgress(Math.min(1, t));
        if (t >= 1){
          goTo(current + 1, false);
          autoStart = now;
          setProgress(0);
        }
      }

      autoRaf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!canAuto || autoRaf) return;
      inView = true;
      autoRaf = requestAnimationFrame(tick);
    };

    const stop = () => {
      inView = false;
      if (autoRaf){
        cancelAnimationFrame(autoRaf);
        autoRaf = 0;
      }
      resetAuto();
    };

    if ('IntersectionObserver' in window && canAuto){
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) start();
          else stop();
        });
      }, { threshold: 0.2 });
      io.observe(wrap);
    } else {
      start();
    }

    // Prefer a clean initial state
    setProgress(0);
    setActive(0);
  };

  const setupRail = (rail) => {
    const wrap = rail.closest('.hScrollWrap');
    if (!wrap) return;

    if (rail.hasAttribute('data-slider')){
      setupSlider(rail, wrap);
      return;
    }

    const prev = wrap.querySelector('[data-hscroll-prev]');
    const next = wrap.querySelector('[data-hscroll-next]');

    const step = () => Math.max(260, Math.round(rail.clientWidth * 0.85));

    const scrollBy = (dx) => {
      rail.scrollBy({ left: dx, behavior: 'smooth' });
    };

    prev?.addEventListener('click', () => scrollBy(-step()));
    next?.addEventListener('click', () => scrollBy(step()));

    const update = () => {
      const maxLeft = rail.scrollWidth - rail.clientWidth;
      const left = rail.scrollLeft;
      if (prev) prev.disabled = left <= 4;
      if (next) next.disabled = left >= (maxLeft - 4);
    };

    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  };

  rails.forEach(setupRail);
})();

// =========================
// Calculators: button-only expand
// =========================
(() => {
  const nav = document.querySelector('[data-calc-nav]');
  if (!nav) return;

  const buttons = Array.from(nav.querySelectorAll('[data-calc-target]'));
  const wraps = Array.from(document.querySelectorAll('.calcWrap[id]'));
  const valid = new Set(wraps.map(w => w.id));

  const setActive = (id) => {
    wraps.forEach((w) => w.classList.toggle('hidden', w.id !== id));
    buttons.forEach((b) => {
      const isOn = b.getAttribute('data-calc-target') === id;
      b.setAttribute('aria-expanded', isOn ? 'true' : 'false');
      // Visual state: active = filled, inactive = ghost
      b.classList.toggle('btn--ghost', !isOn);
    });
  };

  const open = (id, { scroll = true, setHash = true } = {}) => {
    if (!id || !valid.has(id)) return;
    setActive(id);
    if (setHash) {
      try { history.replaceState(null, '', `#${id}`); } catch (_) {}
    }
    if (scroll) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      open(btn.getAttribute('data-calc-target'), { scroll: true, setHash: true });
    });
  });

  // Open from hash on load (if present)
  const initial = (location.hash || '').replace('#', '').trim();
  if (initial && valid.has(initial)) {
    open(initial, { scroll: false, setHash: false });
  }

  // Hash navigation support
  window.addEventListener('hashchange', () => {
    const id = (location.hash || '').replace('#', '').trim();
    if (id && valid.has(id)) open(id, { scroll: true, setHash: false });
  });
})();
