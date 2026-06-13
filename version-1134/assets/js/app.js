(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initMobileNav() {
    var button = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initGlobalSearch() {
    qsa('[data-global-search]').forEach(function (input) {
      input.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter') {
          return;
        }

        var query = input.value.trim();
        var base = input.getAttribute('data-search-base') || 'categories.html';
        if (query) {
          window.location.href = base + '?q=' + encodeURIComponent(query);
        }
      });
    });
  }

  function initHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }

    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5500);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function initIndexRegionFilter() {
    var grid = qs('[data-index-region-grid]');
    var tabs = qsa('[data-index-region]');
    if (!grid || !tabs.length) {
      return;
    }

    var cards = qsa('[data-movie-card]', grid);
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var value = tab.getAttribute('data-index-region') || '全部';
        tabs.forEach(function (item) {
          item.classList.toggle('active', item === tab);
        });
        cards.forEach(function (card) {
          var match = value === '全部' || card.getAttribute('data-region') === value;
          card.classList.toggle('hidden', !match);
        });
      });
    });
  }

  function initIndexYearFilter() {
    var grid = qs('[data-index-year-grid]');
    var tabs = qsa('[data-index-year]');
    if (!grid || !tabs.length) {
      return;
    }

    var cards = qsa('[data-movie-card]', grid);
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var value = tab.getAttribute('data-index-year') || '全部';
        tabs.forEach(function (item) {
          item.classList.toggle('active', item === tab);
        });
        cards.forEach(function (card) {
          var match = value === '全部' || card.getAttribute('data-year') === value;
          card.classList.toggle('hidden', !match);
        });
      });
    });
  }

  function initCatalogFilters() {
    var tools = qs('[data-catalog-tools]');
    var grid = qs('[data-catalog-grid]');
    if (!tools || !grid) {
      return;
    }

    var queryInput = qs('[data-catalog-query]', tools);
    var regionSelect = qs('[data-catalog-region]', tools);
    var typeSelect = qs('[data-catalog-type]', tools);
    var yearSelect = qs('[data-catalog-year]', tools);
    var countNode = qs('[data-catalog-count]', tools);
    var cards = qsa('[data-movie-card]', grid);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && queryInput) {
      queryInput.value = initialQuery;
    }

    function apply() {
      var query = normalize(queryInput && queryInput.value);
      var region = regionSelect ? regionSelect.value : '全部';
      var type = typeSelect ? typeSelect.value : '全部';
      var year = yearSelect ? yearSelect.value : '全部';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchRegion = region === '全部' || card.getAttribute('data-region') === region;
        var matchType = type === '全部' || card.getAttribute('data-type') === type;
        var matchYear = year === '全部' || card.getAttribute('data-year') === year;
        var show = matchQuery && matchRegion && matchType && matchYear;

        card.classList.toggle('hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visible);
      }
    }

    [queryInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });

    apply();
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (shell) {
      var video = qs('video[data-src]', shell);
      var button = qs('[data-player-button]', shell);
      var status = qs('[data-player-status]', shell);
      var hls = null;

      if (!video || !button) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function attachSource() {
        var source = video.getAttribute('data-src');
        if (!source) {
          setStatus('暂未找到视频地址');
          return;
        }

        if (video.getAttribute('data-bound') === 'true') {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.setAttribute('data-bound', 'true');
          setStatus('视频准备就绪');
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('视频准备就绪');
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('视频加载异常，请刷新页面后重试');
            }
          });
          video.setAttribute('data-bound', 'true');
          return;
        }

        video.src = source;
        video.setAttribute('data-bound', 'true');
        setStatus('正在连接视频');
      }

      button.addEventListener('click', function () {
        attachSource();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setStatus('浏览器阻止自动播放，请再次点击播放器');
          });
        }
      });

      video.addEventListener('play', function () {
        shell.classList.add('playing');
        setStatus('正在播放');
      });

      video.addEventListener('pause', function () {
        shell.classList.remove('playing');
        setStatus('已暂停');
      });

      video.addEventListener('ended', function () {
        shell.classList.remove('playing');
        setStatus('播放结束');
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initGlobalSearch();
    initHero();
    initIndexRegionFilter();
    initIndexYearFilter();
    initCatalogFilters();
    initPlayers();
  });
})();
