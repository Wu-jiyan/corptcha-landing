(function () {
  'use strict';

  const island = document.getElementById('siteNav');
  const burger = document.getElementById('burgerBtn');
  const menu = document.getElementById('mobileMenu');
  const compactClasses = ['is-compact-cta', 'is-compact-nav', 'is-compact-menu', 'is-compact-icon'];
  let resizeFrame = 0;

  function closeMenu() {
    if (!burger || !menu || !island) return;
    menu.classList.remove('is-open');
    burger.classList.remove('is-open');
    island.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', '打开菜单');
  }

  function fitIsland() {
    if (!island) return;
    const available = Math.max(0, window.innerWidth - 16);
    island.classList.remove.apply(island.classList, compactClasses);
    island.style.maxWidth = 'none';

    for (let i = 0; i < compactClasses.length && island.getBoundingClientRect().width > available; i++) {
      island.classList.add(compactClasses[i]);
    }

    island.style.maxWidth = '';
    if (!island.classList.contains('is-compact-menu')) closeMenu();
  }

  function scheduleFit() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(fitIsland);
  }

  function onScroll() {
    if (!island) return;
    const y = window.scrollY;
    island.classList.toggle('is-scrolled', y > 40);
  }

  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  window.addEventListener('resize', scheduleFit, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleFit);
  scheduleFit();

  /* 汉堡菜单 */
  if (burger && menu) {
    burger.addEventListener('click', function (event) {
      event.stopPropagation();
      const open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      island.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (event) {
      if (!menu.contains(event.target) && !burger.contains(event.target)) closeMenu();
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    });
  });
})();
