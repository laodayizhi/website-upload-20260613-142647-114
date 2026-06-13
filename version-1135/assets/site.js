(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showHero(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showHero(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));

  filterForms.forEach(function (form) {
    var input = form.querySelector('input');
    var grid = document.querySelector('[data-filter-grid]');
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-card]')) : [];

    function applyFilter(value) {
      var words = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matched = words.length === 0 || words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
        card.classList.toggle('hidden', !matched);
      });
    }

    if (input) {
      input.addEventListener('input', function () {
        applyFilter(input.value);
      });
    }
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var form = document.querySelector('[data-card-filter]');
      var input = form ? form.querySelector('input') : null;
      if (input) {
        input.value = button.getAttribute('data-filter-chip') || button.textContent;
        input.dispatchEvent(new Event('input'));
      }
    });
  });
})();
