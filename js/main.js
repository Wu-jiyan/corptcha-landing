(function () {
  'use strict';

  /* ---------- 开场加载动画（geelinx 式时间轴） ---------- */
  (function () {
    const loader = document.getElementById('loader');
    if (!loader) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      loader.remove();
      return;
    }

    document.documentElement.classList.add('is-loading');
    const body = document.body;

    const canvas = document.getElementById('loaderGlitch');
    const tag = document.getElementById('loaderTag');
    const ctx = canvas ? canvas.getContext('2d') : null;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas && ctx) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function bf(count, opts) {
      if (!ctx) return;
      const o = opts || {};
      const maxW = o.maxW || 120;
      const maxH = o.maxH || 40;
      const colors = o.colors || ['#fff', '#ccc', '#888', '#ff0040', '#00ff88', '#0088ff'];
      const region = o.region || null;
      for (let c = 0; c < count; c++) {
        const w = Math.random() * maxW + 10;
        const h = Math.random() * maxH + 2;
        const x = region ? region.x + Math.random() * region.w : Math.random() * W;
        const y = region ? region.y + Math.random() * region.h : Math.random() * H;
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.globalAlpha = 0.8 * Math.random() + 0.2;
        ctx.fillRect(x, y, w, h);
      }
      ctx.globalAlpha = 1;
    }

    function Sf(alpha) {
      if (!ctx) return;
      ctx.fillStyle = 'rgba(0,0,0,' + alpha + ')';
      for (let r = 0; r < H; r += 3) ctx.fillRect(0, r, W, 1);
    }

    function wf() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
    }

    const PHASES = [
      'phase-border', 'phase-squeeze', 'phase-dark', 'phase-light-g',
      'phase-light-el', 'phase-light-x', 'phase-light-elin',
      'phase-light-full', 'phase-glow'
    ];

    const timers = [];

    function later(fn, ms) {
      timers.push(setTimeout(fn, ms));
    }

    function setPhase(p) {
      loader.classList.remove.apply(loader.classList, PHASES);
      if (p) loader.classList.add(p);
    }

    /* 相位切换：glitch 块 → 收边框 → 渐进点亮 → 辉光 → 淡出 */
    bf(25, { maxW: 400, maxH: 100, colors: ['#eee', '#ddd', '#ccc', '#f0f0f0', '#e8e8e8'] });
    Sf(0.08);

    later(function () { Sf(0.35); }, 250);
    later(function () { wf(); }, 400);
    later(function () { wf(); if (ctx) { ctx.fillStyle = '#fff'; ctx.fillRect(0, H / 2 - 1, W, 2); } }, 460);
    later(function () { wf(); if (ctx) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); } }, 540);
    later(function () {
      wf();
      if (canvas) canvas.style.display = 'none';
      loader.classList.add('is-scene');
      setPhase('phase-border');
    }, 580);

    later(function () { setPhase('phase-squeeze'); }, 1080);
    later(function () { setPhase('phase-dark'); }, 2080);
    later(function () { setPhase('phase-light-g'); }, 2280);
    later(function () { setPhase('phase-light-el'); }, 2880);

    /* THIS IS CORPTCHA 逐字符弹出 */
    later(function () {
      loader.classList.add('is-tag');
      if (tag) {
        const tws = tag.querySelectorAll('.tw');
        tws.forEach(function (el, i) {
          el.style.animation = 'tagPop 0.12s ease-out both ' + (i * 0.045).toFixed(2) + 's';
        });
      }
    }, 3180);

    later(function () { setPhase('phase-light-x'); }, 3480);
    later(function () { setPhase('phase-light-elin'); }, 3780);
    later(function () { setPhase('phase-light-full'); }, 4180);
    later(function () { setPhase('phase-glow'); }, 4680);
    later(function () {
      loader.classList.add('is-done');
      document.documentElement.classList.remove('is-loading');
    }, 5780);
    later(function () { loader.remove(); }, 6400);

    /* loader 期间锁定滚动 */
    body.style.overflow = 'hidden';
    later(function () { body.style.overflow = ''; }, 6400);

    /* 跳过：点击屏幕任意处立即结束动画 */
    function skip() {
      if (loader.classList.contains('is-done')) return;
      timers.forEach(function (t) { clearTimeout(t); });
      if (ctx) ctx.clearRect(0, 0, W, H);
      if (canvas) canvas.style.display = 'none';
      loader.classList.remove.apply(loader.classList, PHASES);
      loader.classList.add('is-scene', 'is-tag', 'phase-glow');
      loader.classList.add('is-done');
      document.documentElement.classList.remove('is-loading');
      body.style.overflow = '';
      setTimeout(function () { loader.remove(); }, 700);
    }

    loader.addEventListener('click', skip);
  })();

  /* ---------- 品牌段：跑马灯 + 取景框 + 黑幕转场 ---------- */
  (function () {
    const section = document.getElementById('brand');
    if (!section) return;
    const lines = Array.prototype.slice.call(section.querySelectorAll('.brand__barrage-line'));
    const center = section.querySelector('.brand__center');
    const viewfinder = section.querySelector('.brand__viewfinder');
    const mask = section.querySelector('.brand__mask');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      lines.forEach(function (line, i) { line.style.transform = 'translateX(' + i * 30 + 'px)'; });
      return;
    }

    const speeds = [140, -220, 90];

    function onScroll() {
      const rect = section.getBoundingClientRect();
      const height = window.innerHeight;

      if (rect.bottom < 0) {
        if (mask) {
          const fade = Math.max(0, Math.min(1, 1 + rect.bottom / (height * 0.35)));
          mask.style.opacity = String(fade);
          mask.style.transform = 'translate(-50%, -50%) scale(1)';
        }
        return;
      }
      if (rect.top > height * 1.5) return;

      const traveled = Math.max(0, Math.min(1, -rect.top / (section.offsetHeight - height)));

      lines.forEach(function (line, i) {
        line.style.transform = 'translateX(' + (traveled * speeds[i]) + 'px)';
      });

      if (center) {
        const scale = 1 + traveled * 0.55;
        const blur = traveled * 2.2;
        center.style.transform = 'scale(' + scale + ')';
        center.style.filter = 'blur(' + blur + 'px)';
      }

      if (viewfinder) {
        const vfIn = Math.max(0, Math.min(1, (traveled - 0.5) / 0.14));
        viewfinder.style.opacity = String(vfIn);
      }

      if (mask) {
        const mIn = Math.max(0, Math.min(1, (traveled - 0.82) / 0.18));
        mask.style.opacity = String(mIn);
        mask.style.transform = 'translate(-50%, -50%) scale(' + mIn + ')';
      }
    }

    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();
})();
