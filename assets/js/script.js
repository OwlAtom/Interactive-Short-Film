
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

videojs("video1", content);
