(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (box) {
      var video = box.querySelector('video');
      var mask = box.querySelector('.play-mask');
      var message = box.querySelector('.player-message');
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var hls = null;

      function setMessage(value) {
        if (message) {
          message.textContent = value || '';
        }
      }

      function bindStream() {
        if (!stream || video.getAttribute('data-ready') === '1') {
          return;
        }
        video.setAttribute('data-ready', '1');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setMessage('视频加载失败，请稍后重试');
            }
          });
        } else {
          setMessage('视频加载失败，请稍后重试');
        }
      }

      function playVideo() {
        bindStream();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setMessage('点击视频继续播放');
          });
        }
      }

      bindStream();
      box.addEventListener('click', function (event) {
        if (event.target.closest('a')) {
          return;
        }
        if (event.target === video && !video.paused) {
          return;
        }
        playVideo();
      });
      if (mask) {
        mask.addEventListener('click', function (event) {
          event.preventDefault();
          playVideo();
        });
      }
      video.addEventListener('play', function () {
        if (mask) {
          mask.classList.add('is-hidden');
        }
        setMessage('');
      });
      video.addEventListener('pause', function () {
        if (mask && video.currentTime === 0) {
          mask.classList.remove('is-hidden');
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
