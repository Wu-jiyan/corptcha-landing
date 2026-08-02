(function () {
  'use strict';

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 取景框滚动展开（geelinx --frame-inset 动画） ---------- */
  const hero = document.getElementById('hero');
  const frame = document.getElementById('heroFrame');
  let rafId = null;

  function onScroll() {
    if (!hero || !frame) return;
    const rect = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / (window.innerHeight * 0.15)));
    const inset = 12 * (1 - progress);
    frame.style.setProperty('--frame-inset', inset.toFixed(2) + 'px');
    frame.style.setProperty('--frame-radius', inset.toFixed(2) + 'px');
    rafId = null;
  }

  function onScrollRaf() {
    if (rafId) return;
    rafId = requestAnimationFrame(onScroll);
  }

  window.addEventListener('scroll', onScrollRaf, { passive: true });
  onScroll();

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let accent = '#2489fd';
  let textColor = '#8891a6';
  let gridColor = 'rgba(61,107,255,0.10)';

  function readColors() {
    const style = getComputedStyle(document.documentElement);
    accent = style.getPropertyValue('--accent').trim() || '#2489fd';
    textColor = style.getPropertyValue('--text-3').trim() || '#8891a6';
    gridColor = style.getPropertyValue('--grid-line').trim() || 'rgba(61,107,255,0.10)';
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    spawn();
  }

  function spawn() {
    const count = Math.min(90, Math.floor((width * height) / 16000));
    particles = Array.from({ length: count }, function () {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.6,
      };
    });
  }

  function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map(function (c) { return c + c; }).join('') : h;
    const n = parseInt(full, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
  }

  function drawGrid() {
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    const step = 56;
    ctx.beginPath();
    for (let x = 0; x <= width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  let scan = 0;

  function tick() {
    ctx.clearRect(0, 0, width, height);
    drawGrid();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(accent, 0.5);
      ctx.fill();
    }

    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = dx * dx + dy * dy;
        if (dist < 120 * 120) {
          const alpha = 1 - Math.sqrt(dist) / 120;
          ctx.strokeStyle = hexToRgba(accent, alpha * 0.16);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    scan += 0.006;
    if (scan > 1.4) scan = -0.4;
    if (scan >= 0 && scan <= 1) {
      const y = scan * height;
      const grad = ctx.createLinearGradient(0, y - 80, 0, y + 80);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.5, hexToRgba(accent, 0.1));
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, y - 80, width, 160);
      ctx.strokeStyle = hexToRgba(accent, 0.35);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    requestAnimationFrame(tick);
  }

  const themeObserver = new MutationObserver(function () {
    readColors();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  readColors();
  resize();
  window.addEventListener('resize', resize, { passive: true });

  if (reduced) {
    tick = null;
    drawGrid();
  } else {
    requestAnimationFrame(tick);
  }

  /* ---------- 标语打字机：多条循环，退格重输 ---------- */
  const typeEl = document.getElementById('heroType');
  if (typeEl) {
    const phrases = /^en/i.test(document.documentElement.lang)
      ? [
          'Human verification for the AI era',
          'Behavioral pre-screening, 8 adversarial challenges',
          'Explainable risk engine — low-risk users pass instantly',
          'Proof-of-Work: bots run out of steam',
        ]
      : [
          '面向 AI 时代的人机验证系统',
          '行为轨迹预判，8 种对抗式挑战',
          '可解释风险引擎，低风险直接放行',
          'PoW 工作量证明，机器无路可走',
        ];
    if (reduced) {
      typeEl.textContent = phrases[0];
    } else {
      const rand = (min, max) => Math.round(min + Math.random() * (max - min));
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      let index = 0;
      async function loop() {
        const phrase = phrases[index];
        for (let i = 1; i <= phrase.length; i++) {
          typeEl.textContent = phrase.slice(0, i);
          await sleep(rand(70, 140));
        }
        await sleep(rand(1800, 2400));
        for (let i = phrase.length - 1; i >= 0; i--) {
          typeEl.textContent = phrase.slice(0, i);
          await sleep(rand(40, 70));
        }
        await sleep(rand(400, 700));
        index = (index + 1) % phrases.length;
        loop();
      }
      loop();
    }
  }
})();
