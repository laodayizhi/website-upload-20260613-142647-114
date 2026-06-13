(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var button = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".site-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector(".hero-prev");
        var next = slider.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupSearch() {
        var root = document.querySelector("[data-search-page]");
        if (!root) {
            return;
        }
        var input = root.querySelector("#searchInput");
        var typeFilter = root.querySelector("#typeFilter");
        var regionFilter = root.querySelector("#regionFilter");
        var yearFilter = root.querySelector("#yearFilter");
        var clearButton = root.querySelector("#clearFilters");
        var empty = root.querySelector(".empty-message");
        var cards = Array.prototype.slice.call(root.querySelectorAll(".search-card"));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        function includesText(haystack, needle) {
            return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
        }

        function apply() {
            var q = (input.value || "").trim();
            var typeValue = typeFilter.value;
            var regionValue = regionFilter.value;
            var yearValue = yearFilter.value;
            var visible = 0;
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-type") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-genre") || "",
                    card.getAttribute("data-tags") || ""
                ].join(" ");
                var ok = true;
                if (q && !includesText(text, q)) {
                    ok = false;
                }
                if (typeValue && card.getAttribute("data-type") !== typeValue) {
                    ok = false;
                }
                if (regionValue && card.getAttribute("data-region") !== regionValue) {
                    ok = false;
                }
                if (yearValue && card.getAttribute("data-year") !== yearValue) {
                    ok = false;
                }
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (initialQuery) {
            input.value = initialQuery;
        }
        [input, typeFilter, regionFilter, yearFilter].forEach(function (el) {
            if (!el) {
                return;
            }
            el.addEventListener(el.tagName === "INPUT" ? "input" : "change", apply);
        });
        if (clearButton) {
            clearButton.addEventListener("click", function () {
                input.value = "";
                typeFilter.value = "";
                regionFilter.value = "";
                yearFilter.value = "";
                apply();
            });
        }
        apply();
    }

    window.initMoviePlayer = function (streamUrl) {
        ready(function () {
            var video = document.getElementById("movieVideo");
            var button = document.getElementById("playButton");
            if (!video || !button || !streamUrl) {
                return;
            }
            var started = false;
            var hls = null;

            function bind() {
                if (started) {
                    return;
                }
                started = true;
                button.classList.add("is-hidden");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    video.load();
                    video.play().catch(function () {});
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    return;
                }
                video.src = streamUrl;
                video.load();
                video.play().catch(function () {});
            }

            button.addEventListener("click", bind);
            video.addEventListener("click", function () {
                if (!started) {
                    bind();
                }
            });
            video.addEventListener("play", function () {
                button.classList.add("is-hidden");
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupSearch();
    });
})();
