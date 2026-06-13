import { H as Hls } from "./hls.js";

function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function setupPlayer(video) {
  var source = video.getAttribute("data-src");
  var frame = video.closest(".video-frame");
  var overlay = frame ? frame.querySelector(".player-overlay") : null;
  var status = document.querySelector("[data-player-status]");
  var initialized = false;
  var hlsInstance = null;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function initialize() {
    if (initialized) {
      return;
    }

    initialized = true;

    if (!source) {
      setStatus("未找到可用播放源。");
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      setStatus("已使用浏览器原生 HLS 播放能力加载。");
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus("播放源已加载，可开始观看。");
      });

      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus("播放器遇到网络或格式问题，请刷新页面后重试。");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });

      return;
    }

    setStatus("当前浏览器不支持 HLS 播放，请使用最新版 Chrome、Edge 或 Safari。 ");
  }

  initialize();

  if (overlay) {
    overlay.addEventListener("click", function () {
      overlay.classList.add("is-hidden");
      video.play().catch(function () {
        setStatus("浏览器阻止了自动播放，请再次点击视频控件播放。");
      });
    });
  }

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
}

ready(function () {
  Array.prototype.slice.call(document.querySelectorAll(".js-hls-player")).forEach(setupPlayer);
});
