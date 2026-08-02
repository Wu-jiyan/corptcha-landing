(function () {
  'use strict';

  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  function apply(theme) {
    root.dataset.theme = theme;
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    for (let i = 0; i < metas.length; i++) {
      metas[i].setAttribute('content', theme === 'dark' ? '#0a0d0c' : '#f2f5f1');
    }
  }

  function cycle() {
    const prefs = ['auto', 'light', 'dark'];
    const current = root.dataset.themePref || 'auto';
    const next = prefs[(prefs.indexOf(current) + 1) % prefs.length];
    root.dataset.themePref = next;
    if (next === 'auto') {
      try { localStorage.removeItem('corptcha-theme'); } catch (e) { /* ignore */ }
      apply(media.matches ? 'dark' : 'light');
    } else {
      try { localStorage.setItem('corptcha-theme', next); } catch (e) { /* ignore */ }
      apply(next);
    }
  }

  function onSystemChange(event) {
    if ((root.dataset.themePref || 'auto') === 'auto') {
      apply(event.matches ? 'dark' : 'light');
    }
  }

  if (toggle) toggle.addEventListener('click', cycle);
  if (media.addEventListener) media.addEventListener('change', onSystemChange);
})();
