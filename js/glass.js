(function () {
  'use strict';

  var LAYERS = ['glass__outer', 'glass__chroma', 'glass__cover', 'glass__reflect', 'glass__sharp', 'glass__highlight'];

  function glassify(selector, tintClass) {
    var els = document.querySelectorAll(selector);
    Array.prototype.forEach.call(els, function (el) {
      if (el.classList.contains('glass-surface')) return;
      var g = document.createElement('div');
      g.className = 'glass';
      g.setAttribute('aria-hidden', 'true');
      var html = '';
      for (var i = 0; i < LAYERS.length; i++) html += '<div class="' + LAYERS[i] + '"></div>';
      g.innerHTML = html;
      el.insertBefore(g, el.firstChild);
      el.classList.add('glass-surface');
      if (tintClass) el.classList.add(tintClass);
    });
  }

  glassify('.demo__stage, .ch-item, .code-window');
  glassify('.btn--primary, .island__cta, .island__menu-cta', 'glass-surface--tint');
  glassify('.btn--ghost, .demo__run, .intro__point, .sec-item');
})();
