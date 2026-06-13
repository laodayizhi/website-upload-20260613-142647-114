import { H as Hls } from "./hls.js";

const video = document.querySelector("[data-video-player]");
const playButton = document.querySelector("[data-play-button]");
const errorBox = document.querySelector("[data-player-error]");
let streamReady = false;
let hlsInstance = null;

function showPlayerMessage(message) {
    if (!errorBox) {
        return;
    }
    errorBox.textContent = message;
    errorBox.classList.add("is-visible");
}

function hidePlayerMessage() {
    if (!errorBox) {
        return;
    }
    errorBox.textContent = "";
    errorBox.classList.remove("is-visible");
}

function attachStream() {
    if (!video || streamReady) {
        return;
    }
    const streamUrl = video.dataset.stream;
    if (!streamUrl) {
        showPlayerMessage("当前影片暂未获取到可播放内容。");
        return;
    }
    if (Hls.isSupported()) {
        hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            hidePlayerMessage();
        });
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
            if (!data || !data.fatal) {
                return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                showPlayerMessage("网络连接异常，正在尝试重新加载。");
                hlsInstance.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                showPlayerMessage("视频解码异常，正在尝试恢复。");
                hlsInstance.recoverMediaError();
            } else {
                showPlayerMessage("当前设备暂无法播放此视频。");
                hlsInstance.destroy();
            }
        });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
    } else {
        showPlayerMessage("当前设备暂无法播放此视频。");
        return;
    }
    streamReady = true;
}

async function playVideo() {
    if (!video) {
        return;
    }
    attachStream();
    try {
        await video.play();
        if (playButton) {
            playButton.classList.add("is-hidden");
        }
    } catch (error) {
        showPlayerMessage("点击播放器后即可开始观看。");
    }
}

if (playButton) {
    playButton.addEventListener("click", playVideo);
}

if (video) {
    video.addEventListener("click", () => {
        if (video.paused) {
            playVideo();
        }
    });
    video.addEventListener("play", () => {
        if (playButton) {
            playButton.classList.add("is-hidden");
        }
    });
    video.addEventListener("pause", () => {
        if (playButton) {
            playButton.classList.remove("is-hidden");
        }
    });
    video.addEventListener("loadedmetadata", hidePlayerMessage);
}

window.addEventListener("pagehide", () => {
    if (hlsInstance) {
        hlsInstance.destroy();
    }
});
