(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === currentSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === currentSlide);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }

    var rankTabs = Array.prototype.slice.call(document.querySelectorAll('[data-rank-tab]'));
    var rankPanels = Array.prototype.slice.call(document.querySelectorAll('[data-rank-panel]'));
    rankTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-rank-tab');
        rankTabs.forEach(function (item) {
          item.classList.toggle('is-active', item === tab);
        });
        rankPanels.forEach(function (panel) {
          panel.classList.toggle('is-active', panel.getAttribute('data-rank-panel') === target);
        });
      });
    });

    var filterForm = document.querySelector('[data-filter-form]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      if (!filterForm || !cards.length) {
        return;
      }
      var data = new FormData(filterForm);
      var keyword = normalize(data.get('q'));
      var category = normalize(data.get('category'));
      var type = normalize(data.get('type'));
      var region = normalize(data.get('region'));
      var year = normalize(data.get('year'));
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (category && normalize(card.getAttribute('data-category')) !== category) {
          matched = false;
        }
        if (type && normalize(card.getAttribute('data-type')) !== type) {
          matched = false;
        }
        if (region && normalize(card.getAttribute('data-region')) !== region) {
          matched = false;
        }
        if (year && normalize(card.getAttribute('data-year')) !== year) {
          matched = false;
        }
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (filterForm) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        var input = filterForm.querySelector('input[name="q"]');
        if (input) {
          input.value = q;
        }
      }
      filterForm.addEventListener('input', applyFilters);
      filterForm.addEventListener('submit', function (event) {
        event.preventDefault();
        applyFilters();
      });
      applyFilters();
    }
  });
})();
