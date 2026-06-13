const menuButton = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
        mobileNav.classList.toggle("is-open");
    });
}

document.querySelectorAll(".poster-image").forEach((image) => {
    image.addEventListener("error", () => {
        const frame = image.closest(".poster-frame") || image.parentElement;
        if (frame) {
            frame.classList.add("is-empty");
        }
        image.remove();
    });
});

const heroSlides = Array.from(document.querySelectorAll("[data-hero-slide]"));
const heroDots = Array.from(document.querySelectorAll("[data-hero-dot]"));
let heroIndex = 0;
let heroTimer = null;

function showHeroSlide(index) {
    if (!heroSlides.length) {
        return;
    }
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-current", slideIndex === heroIndex);
    });
    heroDots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-current", dotIndex === heroIndex);
    });
}

function startHeroTimer() {
    if (heroSlides.length < 2) {
        return;
    }
    heroTimer = window.setInterval(() => {
        showHeroSlide(heroIndex + 1);
    }, 5600);
}

heroDots.forEach((dot) => {
    dot.addEventListener("click", () => {
        window.clearInterval(heroTimer);
        showHeroSlide(Number(dot.dataset.heroDot || 0));
        startHeroTimer();
    });
});

startHeroTimer();

function normalizeText(value) {
    return (value || "").toString().trim().toLowerCase();
}

function runSearchFilter(query) {
    const list = document.querySelector("[data-search-grid]") || document.querySelector("[data-local-list]");
    const emptyState = document.querySelector("[data-empty-state]");
    if (!list) {
        return;
    }
    const cards = Array.from(list.querySelectorAll("[data-card]"));
    const words = normalizeText(query).split(/\s+/).filter(Boolean);
    let visible = 0;
    cards.forEach((card) => {
        const haystack = normalizeText([
            card.dataset.title,
            card.dataset.tags,
            card.dataset.year,
            card.dataset.region,
            card.textContent
        ].join(" "));
        const matched = words.length === 0 || words.every((word) => haystack.includes(word));
        card.hidden = !matched;
        if (matched) {
            visible += 1;
        }
    });
    if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
    }
}

const params = new URLSearchParams(window.location.search);
const queryValue = params.get("q") || "";
const searchPageInput = document.querySelector("[data-search-page-input]");

if (searchPageInput) {
    searchPageInput.value = queryValue;
    runSearchFilter(queryValue);
    searchPageInput.addEventListener("input", () => {
        runSearchFilter(searchPageInput.value);
    });
}

document.querySelectorAll("[data-search-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
        const input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
            event.preventDefault();
            window.location.href = "./search.html";
        }
    });
});
