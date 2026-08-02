(function () {
  'use strict';

  const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  if (!('IntersectionObserver' in window) || !targets.length) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

  targets.forEach(function (el) { observer.observe(el); });
})();
