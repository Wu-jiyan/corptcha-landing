(function () {
  'use strict';

  /* ---------- 安全机制：进度点切换 ---------- */
  (function () {
    const section = document.getElementById('security');
    if (!section) return;
    const items = Array.prototype.slice.call(section.querySelectorAll('.sec-item'));
    const dots = Array.prototype.slice.call(section.querySelectorAll('.security__dot'));
    const mobile = window.matchMedia('(max-width: 768px)');

    function setActive(index) {
      items.forEach(function (item, i) {
        item.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function onScroll() {
      if (mobile.matches) return;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const traveled = Math.max(0, Math.min(1, -rect.top / total));
      const index = Math.min(items.length - 1, Math.floor(traveled * items.length));
      setActive(index);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setActive(Number(dot.dataset.target) || 0);
        if (!mobile.matches) {
          const rect = section.getBoundingClientRect();
          const total = section.offsetHeight - window.innerHeight;
          const top = section.getBoundingClientRect().top + window.scrollY;
          const target = top + total * ((Number(dot.dataset.target) || 0) / items.length);
          window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
        } else {
          const item = items[Number(dot.dataset.target) || 0];
          if (item) {
            window.scrollTo({ top: item.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
          }
        }
      });
    });

    if (mobile.matches) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActive(Number(entry.target.dataset.index) || 0);
          }
        });
      }, { threshold: 0.55 });
      items.forEach(function (item) { observer.observe(item); });
    } else {
      document.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  })();

  /* ---------- 复制示例代码 ---------- */
  (function () {
    const btn = document.getElementById('copyCode');
    const code = document.querySelector('.code--window code');
    if (!btn || !code) return;

    btn.addEventListener('click', async function () {
      const text = code.textContent;
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      btn.textContent = '已复制';
      btn.classList.add('is-copied');
      setTimeout(function () {
        btn.textContent = '复制';
        btn.classList.remove('is-copied');
      }, 2000);
    });
  })();
})();
