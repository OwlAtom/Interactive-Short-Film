function getYear() {
    let currentYear = new Date().getFullYear();
    let title = document.getElementById("copyright");
    title.innerHTML = `© ${currentYear} Oliver Christensen & friends.`;
}

const content = {
    "controls": true,
    "autoplay": false,
    "preload": "auto",
    "muted": false
}
var videoPlayer = videojs("video1", content);


videojs('video1').ready(function () {
    this.on('timeupdate', onVideoTimeupdate);
});

let loopStart = 1;
let loopEnd = 19;
let loopEnabled = false;
let pauseTime = 3;

function onVideoTimeupdate() {
    if (loopEnabled) {
        if (this.currentTime() < loopStart || this.currentTime() >= loopEnd) {
            this.currentTime(loopStart);
        }
    }
    if (this.currentTime() > pauseTime) {
        this.pause();
    }
}

video.hotspots.init();