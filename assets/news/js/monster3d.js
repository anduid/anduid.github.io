/* Monster3D – SVG clay/glossy monster (radial+linear gradient, highlight, drop-shadow), eye-tracking, ekspresi, partikel. */
(function () {
  const C = window.ANDU_CONFIG; let uid = 0; const inst = new Set();
  const data = k => C.MONSTERS.find(m => m.key === k) || C.MONSTERS[0];
  const night = () => { const h = new Date().getHours(); return h >= 22 || h < 5; };

  function bodyShape(k) {
    if (k === 'mochi') return { d: 'M16 98 C12 52 38 40 60 40 C82 40 108 52 104 98 C104 108 84 112 60 112 C36 112 16 108 16 98Z', extra: '<path d="M60 40 C58 28 66 20 76 22 C74 32 68 38 60 40Z" fill="#4ADE80"/><path d="M60 40 C62 30 60 24 56 20" stroke="#15803D" stroke-width="2.5" fill="none" stroke-linecap="round"/>', back: '' };
    if (k === 'blaze') return { d: 'M60 30 C94 30 106 58 102 82 C98 104 80 112 60 112 C40 112 22 104 18 82 C14 58 26 30 60 30Z', back: '<path d="M38 36 C30 22 34 12 42 6 C42 18 50 22 54 30Z" fill="url(#%acc)"/><path d="M82 36 C90 22 86 12 78 6 C78 18 70 22 66 30Z" fill="url(#%acc)"/><path d="M52 32 C50 18 58 10 60 2 C64 12 72 20 68 32Z" fill="url(#%acc)"/>', extra: '' };
    if (k === 'rockerz') return { d: 'M60 32 C92 32 104 58 102 82 C100 104 82 112 60 112 C38 112 20 104 18 82 C16 58 28 32 60 32Z', back: '<path d="M30 40 L36 14 L46 34 L56 8 L64 34 L76 12 L82 36 L94 20 L90 44Z" fill="url(#%acc)" stroke="%c3" stroke-width="1.5" stroke-linejoin="round"/>', extra: '<path d="M16 70 C12 40 30 30 60 30 C90 30 108 40 104 70" fill="none" stroke="#1E1B4B" stroke-width="5" stroke-linecap="round"/><rect x="8" y="62" width="14" height="24" rx="7" fill="#1E1B4B"/><rect x="98" y="62" width="14" height="24" rx="7" fill="#1E1B4B"/><rect x="10" y="66" width="6" height="16" rx="3" fill="%acc"/><rect x="104" y="66" width="6" height="16" rx="3" fill="%acc"/>' };
    /* piko */ return { d: 'M60 28 C94 28 104 58 102 80 C100 102 84 112 60 112 C36 112 20 102 18 80 C16 58 26 28 60 28Z', back: '', extra: '<path d="M60 30 C60 20 58 14 52 10" stroke="%c3" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="51" cy="9" r="5.5" fill="url(#%acc)" stroke="%c3" stroke-width="1.5"/><ellipse cx="22" cy="44" rx="7" ry="10" fill="%c2" transform="rotate(-25 22 44)"/><ellipse cx="98" cy="44" rx="7" ry="10" fill="%c2" transform="rotate(25 98 44)"/>' };
  }

  function svg(key, o) {
    o = o || {}; const m = data(key), id = 'm' + (++uid), s = bodyShape(m.key), hue = o.hue || 0;
    const fix = t => t.replace(/%acc/g, id + 'a').replace(/%c3/g, m.c3).replace(/%c2/g, m.c2);
    return '<svg class="msvg" viewBox="0 0 120 124" role="img" aria-label="' + m.name + '" data-mood="' + (o.mood || 'happy') + '" style="--d:' + (Math.random() * 3).toFixed(2) + 's">' +
      '<defs><radialGradient id="' + id + 'b" cx=".34" cy=".28" r=".85"><stop offset="0" stop-color="' + m.c1 + '"/><stop offset=".55" stop-color="' + m.c2 + '"/><stop offset="1" stop-color="' + m.c3 + '"/></radialGradient>' +
      '<linearGradient id="' + id + 'a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".25" stop-color="' + m.accent + '"/><stop offset="1" stop-color="' + m.c3 + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset="1" stop-color="' + m.c3 + '" stop-opacity=".45"/></linearGradient>' +
      '<filter id="' + id + 'f" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4"/></filter><filter id="' + id + 's" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="3"/></filter></defs>' +
      '<ellipse cx="60" cy="116" rx="34" ry="5" fill="#0c1b5a" opacity=".32" filter="url(#' + id + 's)"/>' +
      '<g class="mb" style="filter:hue-rotate(' + hue + 'deg)">' + fix(s.back) +
      '<path d="' + s.d + '" fill="url(#' + id + 'b)" stroke="' + m.c3 + '" stroke-width="2" stroke-opacity=".55"/>' +
      '<path d="' + s.d + '" fill="url(#' + id + 'r)"/>' +
      '<ellipse cx="44" cy="52" rx="15" ry="7.5" fill="#fff" opacity=".6" transform="rotate(-28 44 52)" filter="url(#' + id + 'f)"/><circle cx="82" cy="58" r="3.2" fill="#fff" opacity=".55"/>' +
      fix(s.extra) + '</g>' +
      '<ellipse cx="34" cy="82" rx="7" ry="4.5" fill="#FB7185" opacity=".5"/><ellipse cx="86" cy="82" rx="7" ry="4.5" fill="#FB7185" opacity=".5"/>' +
      [46, 74].map(x => '<g class="eye" data-ex="' + x + '"><circle cx="' + x + '" cy="68" r="9.5" fill="#fff" stroke="#1b1240" stroke-opacity=".25"/><g class="pupil"><circle cx="' + x + '" cy="68" r="5.2" fill="#1b1240"/><circle cx="' + (x - 1.8) + '" cy="65.6" r="2" fill="#fff"/><circle cx="' + (x + 2) + '" cy="70.5" r="1" fill="#fff" opacity=".8"/></g></g>').join('') +
      '<g class="lids"><path d="M37 68 Q46 74 55 68" /><path d="M65 68 Q74 74 83 68"/></g>' +
      '<g class="mouth"><path class="mo-h" d="M51 82 Q60 94 69 82 Q60 87 51 82Z" fill="#5b1630" stroke="#5b1630" stroke-width="1.5" stroke-linejoin="round"/><ellipse class="mo-w" cx="60" cy="86" rx="5" ry="6" fill="#5b1630"/><path class="mo-s" d="M54 85 Q60 88 66 85" stroke="#5b1630" stroke-width="2.4" fill="none" stroke-linecap="round"/></g></svg>';
  }

  function mount(el, o) {
    o = o || {}; const me = { el, key: o.key || 'piko', hue: o.hue || 0, mood: 'happy', track: o.track !== false };
    const wrap = document.createElement('span'); wrap.className = 'mon'; el.innerHTML = ''; el.appendChild(wrap);
    me.draw = function () { wrap.innerHTML = svg(me.key, { hue: me.hue, mood: me.mood }) + '<span class="zz"><b>z</b><b>Z</b><b>z</b></span>'; me.svg = wrap.querySelector('svg'); me.pupils = [].slice.call(wrap.querySelectorAll('.eye')); };
    me.setMood = function (m) { me.mood = m; if (me.svg) me.svg.dataset.mood = m; wrap.classList.toggle('sleeping', m === 'sleep'); };
    me.set = function (k, h) { if (k) me.key = k; if (h !== undefined) me.hue = h; me.draw(); me.setMood(me.mood); };
    me.jump = function () { wrap.classList.remove('jump'); void wrap.offsetWidth; wrap.classList.add('jump'); };
    me.pet = function () { if (me.mood === 'sleep') me.setMood('happy'); me.setMood('wow'); me.jump(); fx(wrap, 'heart', 6); setTimeout(() => me.setMood('happy'), 900); };
    me.reward = function () { me.setMood('wow'); me.jump(); fx(wrap, 'star', 10); setTimeout(() => me.setMood('happy'), 1100); };
    me.draw(); if (o.auto && night()) me.setMood('sleep');
    inst.add(me); me.destroy = () => inst.delete(me); return me;
  }

  /* eye-tracking: satu listener global */
  let px = null, py = null, raf = 0;
  function look() {
    raf = 0; if (px === null) return;
    inst.forEach(me => {
      if (!me.track || !me.svg || !me.svg.isConnected || me.mood === 'sleep') return;
      me.pupils.forEach(e => {
        const r = e.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(3.4, d / 30);
        e.querySelector('.pupil').setAttribute('transform', 'translate(' + (dx / d * k).toFixed(2) + ' ' + (dy / d * k).toFixed(2) + ')');
      });
    });
  }
  function onMove(x, y) { px = x; py = y; if (!raf) raf = requestAnimationFrame(look); }
  addEventListener('pointermove', e => onMove(e.clientX, e.clientY), { passive: true });
  addEventListener('touchmove', e => { const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY); }, { passive: true });
  addEventListener('touchstart', e => { const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY); }, { passive: true });

  /* partikel */
  function fx(from, kind, n) {
    const layer = document.getElementById('fx'); if (!layer || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = from.getBoundingClientRect(), ox = r.left + r.width / 2, oy = r.top + r.height / 3, chars = kind === 'heart' ? ['💖', '💗', '💕'] : ['⭐', '✨', '🌟'], cols = ['#FFB800', '#FF4757', '#2ED573', '#1E90FF', '#A55EEA', '#FF9F1A'];
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span'), a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 90;
      p.className = 'ptc' + (kind === 'confetti' ? ' cf' : '');
      if (kind === 'confetti') p.style.background = cols[i % cols.length]; else p.textContent = chars[i % chars.length];
      p.style.cssText += ';left:' + ox + 'px;top:' + oy + 'px;--dx:' + (Math.cos(a) * d).toFixed(0) + 'px;--dy:' + (Math.sin(a) * d - 60).toFixed(0) + 'px;--rot:' + (Math.random() * 720 - 360).toFixed(0) + 'deg';
      layer.appendChild(p); setTimeout(() => p.remove(), 1500);
    }
  }
  function confetti() { const el = document.createElement('i'); el.style.cssText = 'position:fixed;left:50%;top:35%;width:1px;height:1px'; document.body.appendChild(el); fx(el, 'confetti', 60); setTimeout(() => el.remove(), 100); }

  window.Monster3D = { svg, mount, fx, confetti, data, night };
})();
