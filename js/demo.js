(function () {
  'use strict';

  const Corptcha = window.Corptcha;
  if (!Corptcha || typeof Corptcha.render !== 'function') return;

  const widgetHost = document.getElementById('demoWidget');
  const statusEl = document.getElementById('demoStatus');
  const runBtn = document.getElementById('demoRun');
  const tabButtons = Array.prototype.slice.call(document.querySelectorAll('#demoTabs [data-kind]'));
  if (!widgetHost || !statusEl) return;

  // 与 @corptcha/widget-sdk 测试夹具一致的 PoW 向量：
  // sha256('1234567890fixture-salt') 在 powStart 处恰好命中，一次哈希即可完成。
  const POW = {
    powStart: 1234567890,
    powTarget: '0574f384072926bbbe1ae86f310abe52c54c9507f48a408f034c923b43c5d33e',
    powSalt: 'fixture-salt',
    gridCols: 5,
    gridRows: 2,
    minShuffleMs: 0,
  };

  const TOKEN_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function makeToken() {
    let token = 'demo-token-';
    for (let i = 0; i < 40; i += 1) token += TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)];
    return token;
  }

  function makeNonce() {
    return 'demo-nonce-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function makeChallengeId() {
    return 'demo-' + Math.random().toString(36).slice(2, 12);
  }

  function expiresAt() {
    return new Date(Date.now() + 5 * 60 * 1000).toISOString();
  }

  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  function toPng(c) {
    return c.toDataURL('image/png');
  }

  function cropCanvas(src, sx, sy, w, h) {
    const c = makeCanvas(w, h);
    c.getContext('2d').drawImage(src, sx, sy, w, h, 0, 0, w, h);
    return c;
  }

  // 渐变天空 + 山 + 太阳的占位场景图
  function drawScene(w, h) {
    const c = makeCanvas(w, h);
    const g = c.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0b2e26');
    sky.addColorStop(0.55, '#12453a');
    sky.addColorStop(1, '#176a52');
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);

    g.fillStyle = 'rgba(255, 214, 140, 0.18)';
    g.beginPath();
    g.arc(w * 0.76, h * 0.2, 46, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(255, 214, 140, 0.85)';
    g.beginPath();
    g.arc(w * 0.76, h * 0.2, 30, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = '#0a2b22';
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(w * 0.22, h * 0.58);
    g.lineTo(w * 0.4, h * 0.82);
    g.lineTo(w * 0.62, h * 0.62);
    g.lineTo(w * 0.86, h * 0.86);
    g.lineTo(w, h * 0.72);
    g.lineTo(w, h);
    g.closePath();
    g.fill();

    g.fillStyle = '#0d382c';
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(w * 0.16, h * 0.72);
    g.lineTo(w * 0.34, h * 0.94);
    g.lineTo(w * 0.55, h * 0.74);
    g.lineTo(w * 0.78, h * 0.96);
    g.lineTo(w, h * 0.82);
    g.lineTo(w, h);
    g.closePath();
    g.fill();

    g.fillStyle = 'rgba(230, 246, 240, 0.16)';
    [0.2, 0.62].forEach(function (x, i) {
      const y = h * (0.18 + i * 0.1);
      g.beginPath();
      g.arc(w * x, y, 16, 0, Math.PI * 2);
      g.arc(w * x + 18, y - 6, 12, 0, Math.PI * 2);
      g.arc(w * x + 34, y, 14, 0, Math.PI * 2);
      g.fill();
    });

    g.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    g.lineWidth = 1;
    for (let x = 0; x <= w; x += 50) {
      g.beginPath();
      g.moveTo(x, h * 0.78);
      g.lineTo(x, h);
      g.stroke();
    }

    for (let i = 0; i < 90; i += 1) {
      g.fillStyle = 'rgba(255, 255, 255, ' + (Math.random() * 0.06).toFixed(3) + ')';
      g.fillRect(Math.random() * w, Math.random() * h, 1.4, 1.4);
    }
    return c;
  }

  function sliderData() {
    const bg = drawScene(600, 375);
    const px = 430;
    const py = 150;
    const pw = 120;
    const ph = 120;
    const piece = cropCanvas(bg, px, py, pw, ph);
    const g = piece.getContext('2d');
    g.strokeStyle = 'rgba(0, 0, 0, 0.28)';
    g.lineWidth = 2;
    g.strokeRect(1, 1, pw - 2, ph - 2);
    return {
      schemaVersion: 1,
      interactionNonce: makeNonce(),
      backgroundImage: toPng(bg),
      pieceImage: toPng(piece),
      imageWidth: 600,
      imageHeight: 375,
      pieceWidth: pw,
      pieceHeight: ph,
      pieceY: py,
      trackStartX: 0.08,
      pow: POW,
    };
  }

  function puzzleData() {
    const bg = drawScene(600, 375);
    const zones = [
      { sx: 120, sy: 80, w: 120, h: 120, id: 'p-a' },
      { sx: 300, sy: 150, w: 110, h: 110, id: 'p-b' },
      { sx: 440, sy: 60, w: 110, h: 110, id: 'p-c' },
    ];
    const pieces = zones.map(function (z) {
      const im = cropCanvas(bg, z.sx, z.sy, z.w, z.h);
      const g = im.getContext('2d');
      g.strokeStyle = 'rgba(0, 0, 0, 0.28)';
      g.lineWidth = 2;
      g.strokeRect(1, 1, z.w - 2, z.h - 2);
      return { id: z.id, image: toPng(im), width: z.w, height: z.h };
    });
    return {
      schemaVersion: 1,
      interactionNonce: makeNonce(),
      backgroundImage: toPng(bg),
      imageWidth: 600,
      imageHeight: 375,
      pieces: pieces,
      pow: POW,
    };
  }

  function rotateData() {
    const size = 300;
    const fixed = makeCanvas(size, size);
    const g = fixed.getContext('2d');
    g.translate(size / 2, size / 2);
    g.strokeStyle = '#2a9d6e';
    g.lineWidth = 64;
    g.beginPath();
    g.arc(0, 0, 100, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = '#0b2e26';
    g.lineWidth = 8;
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2;
      g.beginPath();
      g.moveTo(Math.cos(a) * 74, Math.sin(a) * 74);
      g.lineTo(Math.cos(a) * 128, Math.sin(a) * 128);
      g.stroke();
    }
    g.fillStyle = '#ffd68c';
    g.fillRect(-9, -150, 18, 22);

    const rot = makeCanvas(size, size);
    const r = rot.getContext('2d');
    r.translate(size / 2, size / 2);
    r.fillStyle = '#14503e';
    r.beginPath();
    r.arc(0, 0, 64, 0, Math.PI * 2);
    r.fill();
    r.fillStyle = '#ffd68c';
    r.fillRect(-8, -72, 16, 20);

    return {
      schemaVersion: 1,
      interactionNonce: makeNonce(),
      fixedImage: toPng(fixed),
      rotatingImage: toPng(rot),
      imageSize: size,
      rotatingPart: 'ring',
      maxRotationDegrees: 300,
      direction: 1,
      pow: POW,
    };
  }

  function spatialData() {
    const w = 600;
    const h = 375;
    const c = makeCanvas(w, h);
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#10161d');
    grad.addColorStop(1, '#1c2b33');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);

    g.fillStyle = '#141f26';
    g.beginPath();
    g.moveTo(0, h * 0.72);
    g.lineTo(w, h * 0.72);
    g.lineTo(w, h);
    g.lineTo(0, h);
    g.closePath();
    g.fill();

    function cube(x, y, s, color) {
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x - s / 2, y - s * 0.42);
      g.lineTo(x, y - s * 0.72);
      g.lineTo(x + s / 2, y - s * 0.42);
      g.lineTo(x, y - s * 0.12);
      g.closePath();
      g.fill();
      g.fillStyle = 'rgba(0, 0, 0, 0.35)';
      g.beginPath();
      g.moveTo(x - s / 2, y - s * 0.42);
      g.lineTo(x, y - s * 0.12);
      g.lineTo(x, y + s * 0.3);
      g.lineTo(x - s / 2, y);
      g.closePath();
      g.fill();
      g.fillStyle = 'rgba(255, 255, 255, 0.22)';
      g.beginPath();
      g.moveTo(x + s / 2, y - s * 0.42);
      g.lineTo(x, y - s * 0.12);
      g.lineTo(x, y + s * 0.3);
      g.lineTo(x + s / 2, y);
      g.closePath();
      g.fill();
    }

    function sphere(x, y, r) {
      const grad2 = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.15, x, y, r);
      grad2.addColorStop(0, '#9ad7ff');
      grad2.addColorStop(1, '#1e5f8f');
      g.fillStyle = grad2;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }

    function cylinder(x, y, wd, hg) {
      g.fillStyle = '#2a9d6e';
      g.beginPath();
      g.ellipse(x, y, wd / 2, hg * 0.3, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#1c6b4d';
      g.fillRect(x - wd / 2, y, wd, hg);
      g.fillStyle = '#37c08c';
      g.beginPath();
      g.ellipse(x, y + hg, wd / 2, hg * 0.3, 0, 0, Math.PI * 2);
      g.fill();
    }

    cube(w * 0.3, h * 0.52, 90, '#e25d5d');
    sphere(w * 0.62, h * 0.5, 46);
    cylinder(w * 0.46, h * 0.55, 70, 70);

    g.fillStyle = 'rgba(255, 255, 255, 0.82)';
    g.font = '600 20px system-ui, sans-serif';
    g.textAlign = 'center';
    g.fillText('点击图中蓝色的球体', w / 2, 40);

    return { interactionNonce: makeNonce(), image: toPng(c), width: w, height: h, pow: POW };
  }

  function decoyData() {
    const chars = ['A', 'B', 'C', 'D', 'E'];
    const w = 340;
    const h = 180;
    const c = makeCanvas(w, h);
    const g = c.getContext('2d');
    g.fillStyle = '#f4f6f3';
    g.fillRect(0, 0, w, h);
    const realIndex = Math.floor(Math.random() * chars.length);
    chars.forEach(function (ch, i) {
      const x = 58 + i * 62;
      const rot = (Math.random() * 22 - 11) * Math.PI / 180;
      g.save();
      g.translate(x, 108);
      g.rotate(rot);
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      if (i === realIndex) {
        g.fillStyle = '#101613';
        g.font = '700 64px Arial, sans-serif';
        g.fillText(ch, 0, 0);
      } else {
        g.fillStyle = 'rgba(16, 22, 19, 0.42)';
        g.font = '700 60px Arial, sans-serif';
        g.fillText(ch, 0, 0);
        g.strokeStyle = 'rgba(16, 22, 19, 0.3)';
        g.lineWidth = 1.2;
        g.strokeText(ch, 0, 0);
      }
      g.restore();
    });
    g.strokeStyle = 'rgba(16, 22, 19, 0.1)';
    g.lineWidth = 1;
    for (let i = 0; i < w; i += 18) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i, h);
      g.stroke();
    }
    return {
      prompt: '眯起眼睛，输入图中更实心的 5 位字符',
      image: toPng(c),
      pow: POW,
    };
  }

  function clickData() {
    return { interactionNonce: makeNonce() };
  }

  function dragData() {
    return { interactionNonce: makeNonce() };
  }

  function buildData(kind) {
    switch (kind) {
      case 'slider': return sliderData();
      case 'puzzle': return puzzleData();
      case 'rotate_puzzle': return rotateData();
      case 'spatial': return spatialData();
      case 'decoy': return decoyData();
      case 'click': return clickData();
      case 'drag_confirm': return dragData();
      default: return {};
    }
  }

  function issue(kind) {
    return {
      outcome: 'challenge',
      challengeId: makeChallengeId(),
      kind: kind,
      expiresAt: expiresAt(),
      data: buildData(kind),
    };
  }

  function jsonResponse(payload) {
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  let currentKind = 'slider';

  function demoFetcher(input, init) {
    const url = String(input);
    const method = (init && init.method) || 'GET';
    if (method === 'POST' && url.indexOf('/v1/widget/challenges') !== -1 && url.indexOf('/refresh') === -1 && url.indexOf('/submissions') === -1) {
      return Promise.resolve(jsonResponse(issue(currentKind)));
    }
    if (method === 'POST' && /\/refresh$/.test(url)) {
      return Promise.resolve(jsonResponse(issue(currentKind)));
    }
    if (method === 'POST' && /\/submissions$/.test(url)) {
      return Promise.resolve(jsonResponse({ success: true, verificationToken: makeToken() }));
    }
    return Promise.resolve(new Response('not found', { status: 404, headers: { 'content-type': 'text/plain' } }));
  }

  let widget = null;

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function mount() {
    if (widget) {
      widget.destroy();
      widget = null;
    }
    widgetHost.replaceChildren();
    setStatus('分析中…');
    widget = Corptcha.render(widgetHost, {
      apiBaseUrl: 'https://demo.corptcha.local',
      siteKey: 'cpt_site_demo',
      purpose: 'demo',
      language: 'zh-CN',
      theme: { mode: 'auto' },
      autoExecute: true,
      fetcher: demoFetcher,
      onStateChange: function (state) {
        if (!state) return;
        const map = {
          idle: '待命',
          analyzing: '行为分析中…',
          ready: '挑战已就绪',
          submitting: '验证提交中…',
          success: '验证通过',
          error: '验证出错',
          expired: '令牌已过期',
          destroyed: '已销毁',
        };
        setStatus(map[state.name] || state.name);
      },
      onSuccess: function (token) {
        setStatus('验证通过 · token ' + String(token).slice(0, 14) + '…');
      },
      onError: function (error) {
        setStatus('错误 · ' + (error && error.message ? error.message : String(error)));
      },
    });
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentKind = btn.dataset.kind || 'slider';
      tabButtons.forEach(function (b) {
        b.setAttribute('aria-selected', String(b === btn));
      });
      mount();
    });
  });

  if (runBtn) {
    runBtn.addEventListener('click', mount);
  }

  mount();
})();
