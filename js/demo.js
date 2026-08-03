(function () {
  'use strict';

  const Corptcha = window.Corptcha;
  if (!Corptcha || typeof Corptcha.render !== 'function') return;

  const widgetHost = document.getElementById('demoWidget');
  const statusEl = document.getElementById('demoStatus');
  const resetBtn = document.getElementById('demoRun');
  const tabButtons = Array.prototype.slice.call(document.querySelectorAll('#demoTabs [data-kind]'));
  if (!widgetHost || !statusEl || !resetBtn) return;

  const IS_EN = /^en/i.test(document.documentElement.lang);
  const T = {
    idle: IS_EN ? 'Idle · click the button below to start' : '待命 · 点击下方按钮开始验证',
    analyzing: IS_EN ? 'Analyzing…' : '分析中…',
    verified: IS_EN ? 'Verified · token ' : '验证通过 · token ',
    error: IS_EN ? 'Error · ' : '错误 · ',
    state: {
      idle: IS_EN ? 'Idle' : '待命',
      analyzing: IS_EN ? 'Analyzing behavior…' : '行为分析中…',
      ready: IS_EN ? 'Challenge ready' : '挑战已就绪',
      submitting: IS_EN ? 'Submitting…' : '验证提交中…',
      success: IS_EN ? 'Verified' : '验证通过',
      error: IS_EN ? 'Verification failed' : '验证出错',
      expired: IS_EN ? 'Token expired' : '令牌已过期',
      destroyed: IS_EN ? 'Destroyed' : '已销毁',
    },
  };

  const API_BASE_URL = 'https://cpt-api.25y.cn';
  // 演示模式站点：cpt_674aa5ef947b（控制台已开启"演示模式"，签发时按 challengeKind 固定返回对应挑战）
  const DEMO_SITE_KEY = 'cpt_674aa5ef947b';

  let widget = null;

  function currentKind() {
    const active = document.querySelector('#demoTabs [data-kind][aria-selected="true"]');
    return active ? active.dataset.kind : 'slider';
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function mount() {
    if (widget) {
      widget.destroy();
      widget = null;
    }
    widgetHost.replaceChildren();
    setStatus(T.idle);
    widget = Corptcha.render(widgetHost, {
      apiBaseUrl: API_BASE_URL,
      siteKey: DEMO_SITE_KEY,
      purpose: 'demo',
      challengeKind: currentKind(),
      language: IS_EN ? 'en' : 'zh-CN',
      theme: { mode: 'auto' },
      onStateChange: function (state) {
        if (!state) return;
        setStatus(T.state[state.name] || state.name);
      },
      onSuccess: function (token) {
        setStatus(T.verified + String(token).slice(0, 14) + '…');
      },
      onError: function (error) {
        setStatus(T.error + (error && error.message ? error.message : String(error)));
      },
    });
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabButtons.forEach(function (b) {
        b.setAttribute('aria-selected', String(b === btn));
      });
      mount();
    });
  });

  resetBtn.addEventListener('click', mount);

  // 初始渲染默认选中的挑战按钮
  mount();
})();
