/* ========================================
   TOOLVINE MENTORS INITIATIVE
   Brand Guidelines · Scroll Reveal & Interactions
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {

  // Elements to animate on scroll
  var targets = document.querySelectorAll(
    '.section-header, .section-intro, .story-lead, .story-text p, ' +
    '.value-item, .logo-card, .anatomy-item, .variation-card, ' +
    '.swatch-card, .canvas-card, .type-sample, .sizing-card, .app-card, ' +
    '.file-row, .palette-group-title'
  );

  targets.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function (el) { observer.observe(el); });


  // Stagger children in grids
  var grids = document.querySelectorAll(
    '.anatomy-grid, .variations-grid, .palette-row, .canvas-row, .app-grid'
  );
  grids.forEach(function (grid) {
    var children = grid.children;
    for (var i = 0; i < children.length; i++) {
      children[i].style.transitionDelay = (i * 0.07) + 's';
    }
  });


  // Smooth TOC scroll
  var tocLinks = document.querySelectorAll('.toc-item');
  tocLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var targetId = this.getAttribute('href');
      var targetEl = document.querySelector(targetId);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });


  // Copy hex code on swatch click
  var swatches = document.querySelectorAll('.swatch-card');
  swatches.forEach(function (card) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function () {
      var hexSpan = this.querySelector('.swatch-codes span');
      if (!hexSpan) return;
      var hex = hexSpan.textContent.replace('HEX ', '').trim();
      navigator.clipboard.writeText(hex).then(function () {
        var original = hexSpan.textContent;
        hexSpan.textContent = 'Copied ' + hex;
        hexSpan.style.color = '#0F766E';
        hexSpan.style.fontWeight = '600';
        setTimeout(function () {
          hexSpan.textContent = original;
          hexSpan.style.color = '';
          hexSpan.style.fontWeight = '';
        }, 1200);
      });
    });
  });

});
