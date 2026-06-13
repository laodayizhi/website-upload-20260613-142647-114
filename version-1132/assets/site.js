(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = document.querySelector('.menu-button');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            document.body.classList.toggle('is-menu-open', panel.classList.contains('is-open'));
        });
        selectAll('.mobile-link', panel).forEach(function (link) {
            link.addEventListener('click', function () {
                panel.classList.remove('is-open');
                document.body.classList.remove('is-menu-open');
            });
        });
    }

    function initHero() {
        var slides = selectAll('[data-hero-slide]');
        if (!slides.length) {
            return;
        }
        var dots = selectAll('[data-hero-dot]');
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                play();
            });
        });
        play();
    }

    function createResultCard(movie) {
        var article = document.createElement('article');
        article.className = 'movie-card';
        article.innerHTML = [
            '<a class="poster" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="score">' + movie.rating + '</span>',
            '</a>',
            '<div class="movie-info">',
            '<a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
            '<div class="movie-meta">',
            '<span>' + movie.year + '</span>',
            '<span>' + escapeHtml(movie.region) + '</span>',
            '<span>' + escapeHtml(movie.type) + '</span>',
            '</div>',
            '</div>'
        ].join('');
        return article;
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (item) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[item];
        });
    }

    function initSearchPage() {
        var results = document.getElementById('searchResults');
        var summary = document.getElementById('searchSummary');
        var input = document.getElementById('searchInput');
        if (!results || !summary || !window.movieIndex) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = (params.get('q') || '').trim();
        if (input) {
            input.value = q;
        }
        if (!q) {
            summary.textContent = '输入关键词即可搜索片库内容。';
            return;
        }
        var words = q.toLowerCase().split(/\s+/).filter(Boolean);
        var matched = window.movieIndex.filter(function (movie) {
            var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.category].join(' ').toLowerCase();
            return words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        }).slice(0, 120);
        summary.textContent = matched.length ? '为你找到相关内容：' + q : '没有找到完全匹配的内容：' + q;
        matched.forEach(function (movie) {
            results.appendChild(createResultCard(movie));
        });
    }

    function initPlayer(options) {
        var video = document.getElementById(options.videoId || 'movie-player');
        var overlay = document.getElementById(options.overlayId || 'play-layer');
        var source = options.source;
        var hls = null;
        var loaded = false;
        if (!video || !source) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            load();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        video.addEventListener('emptied', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
                hls = null;
            }
            loaded = false;
        });
    }

    window.MovieSite = {
        initPlayer: initPlayer
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initSearchPage();
    });
}());
