(function () {
  function activate(block) {
    var video = block.querySelector('video');
    var stream = block.getAttribute('data-stream');

    if (!video || !stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.getAttribute('src') !== stream) {
        video.setAttribute('src', stream);
      }
    } else if (window.Hls && window.Hls.isSupported()) {
      if (!video.hlsInstance) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      }
    } else if (video.getAttribute('src') !== stream) {
      video.setAttribute('src', stream);
    }

    block.classList.add('is-playing');
    var playTask = video.play();

    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (block) {
    var button = block.querySelector('.play-overlay');
    var video = block.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        activate(block);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          activate(block);
        }
      });
    }
  });
})();
