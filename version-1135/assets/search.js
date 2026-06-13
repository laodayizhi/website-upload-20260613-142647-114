(function () {
  var form = document.querySelector('[data-search-form]');
  var results = document.querySelector('[data-search-results]');
  var title = document.querySelector('[data-search-title]');

  if (!form || !results || !Array.isArray(movieSearchItems)) {
    return;
  }

  var input = form.querySelector('input[name="q"]');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function card(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="poster-wrap" href="' + escapeHtml(item.url) + '" aria-label="' + escapeHtml(item.title) + ' 在线观看">' +
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '海报" loading="lazy">' +
      '<span class="poster-glow"></span><span class="play-mark">▶</span></a>' +
      '<div class="card-body"><h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
      '<p class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></p>' +
      '<p class="card-line">' + escapeHtml(item.line || '') + '</p>' +
      '<div class="tag-list">' + tags + '</div></div></article>';
  }

  function render(query) {
    var words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    var list = movieSearchItems.filter(function (item) {
      if (!words.length) {
        return true;
      }
      var haystack = [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        (item.tags || []).join(' '),
        item.line
      ].join(' ').toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);

    results.innerHTML = list.map(card).join('');
    if (title) {
      title.textContent = query.trim() ? '与“' + query.trim() + '”相关的影片' : '精选推荐';
    }
  }

  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';

  if (input) {
    input.value = initial;
  }

  if (initial) {
    render(initial);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    render(input ? input.value : '');
  });
})();
