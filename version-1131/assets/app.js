(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  });

  function textOf(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-category') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function applyScope(scope) {
    var input = scope.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var rows = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-row]'));
    var activeFilters = {};

    function matchesFilter(card, key, value) {
      if (!value || value === 'all') {
        return true;
      }
      var actual = (card.getAttribute('data-' + key) || '').toLowerCase();
      return value.toLowerCase().split('|').some(function (part) {
        return actual.indexOf(part.trim().toLowerCase()) !== -1;
      });
    }

    function refresh() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var ok = true;
        if (query && textOf(card).indexOf(query) === -1) {
          ok = false;
        }
        Object.keys(activeFilters).forEach(function (key) {
          if (!matchesFilter(card, key, activeFilters[key])) {
            ok = false;
          }
        });
        card.classList.toggle('is-hidden', !ok);
      });
    }

    if (input) {
      input.addEventListener('input', refresh);
    }

    rows.forEach(function (row) {
      row.querySelectorAll('[data-filter-key]').forEach(function (button) {
        button.addEventListener('click', function () {
          var key = button.getAttribute('data-filter-key');
          var value = button.getAttribute('data-filter-value');
          row.querySelectorAll('[data-filter-key="' + key + '"]').forEach(function (sibling) {
            sibling.classList.remove('is-active');
          });
          button.classList.add('is-active');
          activeFilters[key] = value;
          refresh();
        });
      });
    });
  }

  document.querySelectorAll('[data-search-scope]').forEach(applyScope);
}());
