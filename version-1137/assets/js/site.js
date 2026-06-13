(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var currentIndex = 0;
    var timer = null;

    function activate(index) {
      currentIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === currentIndex);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(currentIndex + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var targetIndex = parseInt(dot.getAttribute("data-hero-dot"), 10);
        activate(targetIndex);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);

    activate(0);
    start();
  }

  function setupFilterScopes() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var select = scope.querySelector("[data-sort-select]");
      var grid = scope.querySelector("[data-grid]");
      var count = scope.querySelector("[data-filter-count]");

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function textFor(card) {
        return [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" ").toLowerCase();
      }

      function sortCards(visibleCards) {
        var mode = select ? select.value : "default";
        var sorted = visibleCards.slice();

        sorted.sort(function (a, b) {
          if (mode === "year-desc") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }

          if (mode === "views-desc") {
            return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
          }

          if (mode === "rating-desc") {
            return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
          }

          if (mode === "title-asc") {
            return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
          }

          return cards.indexOf(a) - cards.indexOf(b);
        });

        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var visible = [];

        cards.forEach(function (card) {
          var matched = !keyword || textFor(card).indexOf(keyword) !== -1;
          card.hidden = !matched;

          if (matched) {
            visible.push(card);
          }
        });

        sortCards(visible);

        if (count) {
          count.textContent = "当前显示 " + visible.length + " 部";
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      if (select) {
        select.addEventListener("change", apply);
      }

      apply();
    });
  }

  function setupSearchPage() {
    var container = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    var input = document.querySelector("[data-search-page-input]");

    if (!container || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input) {
      input.value = query;
    }

    function createCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return [
        "<article class=\"movie-card\" data-card>",
        "  <a class=\"poster-wrap\" href=\"" + escapeAttribute(movie.url) + "\">",
        "    <img src=\"" + escapeAttribute(movie.poster) + "\" alt=\"" + escapeAttribute(movie.title) + "\" loading=\"lazy\">",
        "    <span class=\"poster-shadow\"></span>",
        "    <span class=\"poster-badge\">" + escapeHtml(movie.category) + "</span>",
        "    <span class=\"duration-badge\">高清</span>",
        "  </a>",
        "  <div class=\"movie-info\">",
        "    <h3><a href=\"" + escapeAttribute(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
        "    <p>" + escapeHtml(movie.oneLine || "") + "</p>",
        "    <div class=\"tag-row\">" + tags + "</div>",
        "    <div class=\"movie-meta\">",
        "      <span>" + escapeHtml(movie.year) + "</span>",
        "      <span>" + escapeHtml(movie.region) + "</span>",
        "      <span>★ " + escapeHtml(movie.rating) + "</span>",
        "    </div>",
        "  </div>",
        "</article>"
      ].join("");
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function escapeAttribute(value) {
      return escapeHtml(value).replace(/`/g, "&#096;");
    }

    function runSearch(keyword) {
      var normalized = String(keyword || "").trim().toLowerCase();
      var results;

      if (!normalized) {
        results = [];
      } else {
        results = window.MOVIE_SEARCH_DATA.filter(function (movie) {
          var text = [
            movie.title,
            movie.year,
            movie.region,
            movie.type,
            movie.genre,
            movie.category,
            movie.oneLine,
            (movie.tags || []).join(" ")
          ].join(" ").toLowerCase();

          return text.indexOf(normalized) !== -1;
        }).sort(function (a, b) {
          return Number(b.views) - Number(a.views);
        }).slice(0, 120);
      }

      container.innerHTML = results.map(createCard).join("");

      if (status) {
        if (!normalized) {
          status.textContent = "输入关键词后将展示搜索结果。";
        } else {
          status.textContent = "关键词：“" + keyword + "”，找到 " + results.length + " 条结果。";
        }
      }
    }

    runSearch(query);
  }

  ready(function () {
    setupMobileNavigation();
    setupHeroCarousel();
    setupFilterScopes();
    setupSearchPage();
  });
})();
