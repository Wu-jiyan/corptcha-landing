(function () {
  'use strict';

  const Corptcha = window.Corptcha;
  if (!Corptcha || typeof Corptcha.render !== 'function') return;

  const widgetHost = document.getElementById('demoWidget');
  const statusEl = document.getElementById('demoStatus');
  const runBtn = document.getElementById('demoRun');
  const tabButtons = Array.prototype.slice.call(document.querySelectorAll('#demoTabs [data-kind]'));
  if (!widgetHost || !statusEl) return;

  const IS_EN = /^en/i.test(document.documentElement.lang);
  const T = {
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

  let currentKind = 'slider';

  function setStatus(text) {
    statusEl.textContent = text;
  }

  let widget = null;

  function mount() {
    if (widget) {
      widget.destroy();
      widget = null;
    }
    widgetHost.replaceChildren();
    setStatus(T.analyzing);
    widget = Corptcha.render(widgetHost, {
      apiBaseUrl: API_BASE_URL,
      siteKey: DEMO_SITE_KEY,
      purpose: 'demo',
      challengeKind: currentKind,
      language: IS_EN ? 'en' : 'zh-CN',
      theme: { mode: 'auto' },
      autoExecute: true,
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
