// JS by Dan Høegh
// UCN MMD 2020

// A framework for showing time-encoded hotspots on multiple videos.
// Assumes either video.js or a parent <div> for the video that has the same dimensions as the video.

// ## SETTINGS START
const fps = 30; // ## adjust this to set the frames per second precision on the hotspot appearance (lower = less cpu used)
const debug = false; // ## set to true to get console.log output, use   video.log('text')
// ## SETTINGS END

const msInterval = Math.floor(1000 / fps); // calculate how many ms per loop to match desired FPS. Rounded down
let engine; // declare a variable that will be used for the interval loop

let video = {
    log: (message = 'Missing log text') => {
        if (debug) {
            console.log(message);
        }
    },
    hotspots: {
        running: false,
        init: () => {
            video.log('video hotspot engine: init');
            const elmsVideo = document.querySelectorAll('video'); // grab all videos on the page
            elmsVideo.forEach((elmVideo) => { // loop through the parents of the video elements
                elmVideo.parentElement.classList.add('videoHotspotsParent');
                elmVideo.addEventListener('play', (event) => { // add eventlistener play on videos
                    if (!video.hotspots.running) { // start engine, if it is not running already
                        video.hotspots.on();
                    }
                });
                elmVideo.addEventListener('seeked', (event) => { // add eventlistener play on videos
                    if (!video.hotspots.running) { // start engine, if it is not running already
                        video.hotspots.on(true);
                    }
                });
                elmVideo.addEventListener('pause', (event) => { // add eventlistener stop/pause on videos
                    if (video.hotspots.running) { // if engine is running
                        let videoPlaying = false; // check if all videos are stopped/paused
                        elmsVideo.forEach((elmVideo) => {
                            if (!elmVideo.paused) {
                                videoPlaying = true;
                            }
                        });
                        if (!videoPlaying) {
                            video.hotspots.off(); // if all videos are NOT playing we can turn off the loop engine
                        }
                    }
                });
            });
        },
        on: (isSeeked = false) => {
            // start the interval loop
            video.log('video hotspot engine: on');
            if (!video.hotspots.running) { // only start it if it isn't already running
                video.hotspots.running = true; // make sure to tell our boolean that we are turning on the engine
            }
            engine = setInterval(() => { // start the interval engine
                video.log('engine loop');
                video.hotspots.update(isSeeked);
            }, msInterval);
        },
        off: () => {
            // kill the interval var
            video.log('video hotspot engine: off');
            video.hotspots.running = false; // make sure to tell our boolean that the engine is being stopped
            clearInterval(engine); // stop the engine
        },
        update: () => {
            hotspots.forEach((hotspot, index) => {
                if (hotspot.active) {
                    // get video element for hotspot
                    const video = document.querySelector(`#${hotspot.videoId}>video`);
                    if (video) {
                        const now = video.currentTime;
                        const elmHotspotCheck = document.querySelector(`#hotspotId${index}`);

                        if (hotspot.markIn > now || hotspot.markOut <= now) {
                            // check to see if element with the current hotspot id exists
                            if (elmHotspotCheck) {
                                // remove hotspot element
                                const elmHotspot = document.querySelector(`#hotspotId${index}`);
                                elmHotspot.parentElement.removeChild(elmHotspot);
                                hotspot.onscreen = false; // clear on-screen flag for the current hotspot
                            }
                        } else if (hotspot.markIn <= now && hotspot.markOut > now) {
                            if (!elmHotspotCheck) { // only draw new hotspot if it isn't already drawn
                                let elmHotspot = document.createElement('a');
                                elmHotspot.id = `hotspotId${index}`;
                                elmHotspot.className = 'hotspot';
                                if (hotspot.ui.title) {
                                    elmHotspot.title = hotspot.ui.title;
                                }
                                if (hotspot.ui.text && hotspot.ui.text != "") {
                                    elmHotspot.innerHTML = hotspot.ui.text;
                                }
                                let css = "";
                                css += `width: ${hotspot.sizeX}%;`;
                                css += `height: ${hotspot.sizeY}%;`;
                                css += `left: ${hotspot.posX}%;`;
                                css += `top: ${hotspot.posY}%;`;
                                css += `${hotspot.ui.style};`;
                                if (hotspot.ui.type == 'image') {
                                    // insert image css
                                    css += `background-image: url(${hotspot.ui.image});`;
                                    elmHotspot.classList.add('image');
                                }
                                elmHotspot.style = css;
                                if (hotspot.hotspot.type == 'link') {
                                    // it's a link, set target and href
                                    elmHotspot.href = hotspot.hotspot.url;
                                    elmHotspot.target = hotspot.hotspot.target;
                                } else {
                                    // it's a function, set an eventlistener for click
                                    elmHotspot.addEventListener('click', (event) => {
                                        event.preventDefault(); // prevent the normal action when clicking on an <a> tag
                                        hotspot.hotspot.func(); // run the function that the hotspot JSON contains for this hotspot
                                    });
                                }
                                video.parentElement.appendChild(elmHotspot);
                            }
                        }
                    }
                }
            });
        },
        remove: () => {
            // kill all hotspot related functions, json feed and DOM elements - use  video.hotspots.remove()  to do this
            video.log('video hotspot engine: cleanup');
            video.hotspots.off(); // turn off engine
            const elmsHotspots = document.querySelectorAll('a.hotspot'); // find all hotspot DOM elements
            elmsHotspots.forEach((elmHotspot) => { // loop through hotspots
                elmHotspot.parentElement.removeChild(elmHotspot); // remove current hotspot
            });
            delete video; // remove the variable from memory
            delete hotspots; // remove the variable from memory
        }

    }
}

let animalCircle = {
    type: "box",
    style: `border: 3px solid rgb(142, 0, 0); border-radius: 100vw`
};
let finalBox = {
    type: "box",
    style: `border: none; background-color: rgba(0,0,0,.5); border-radius: 5vw`
};

let failBox = {
    type: "box",
    style: "border: none; background-color: rgb(199 58 84 / 95%); border-radius: 0.4vw; font-size: 250%; text-align: center; line-height: 2.4;",
    text: "Klik og prøv igen"
};

let infoBox = {
    type: "box",
    style: "border: none; background-color: rgb(41 125 187 / 95%); border-radius: 0.4vw; font-size: 250%; color: white; text-align: center; text-decoration:none; line-height: 2.4;",
    text: "Læs om dette dyr"
};


const hotspots = [{
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 95,
        sizeX: 10,
        sizeY: 20,
        posX: 24,
        posY: 5,
        ui: animalCircle,
        hotspot: {
            type: "function",
            func: () => {
                // DEBUG -- skip to first choice
                videoPlayer.currentTime(279);
                videoPlayer.play();
                pauseTime = 281;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 95,
        markOut: 123,
        sizeX: 4.1,
        sizeY: 7.4,
        posX: 19.7,
        posY: 30.4,
        ui: animalCircle,
        hotspot: {
            type: "function",
            func: () => {
                // Pingvin valg
                videoPlayer.currentTime(125);
                videoPlayer.play();
                pauseTime = 182;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 95,
        markOut: 123,
        sizeX: 14,
        sizeY: 6,
        posX: 2,
        posY: 75.5,
        ui: {
            type: "box",
            style: `border: none; font-size: 250%; text-align: center; padding: 0.5%; background-color: #463139;`,
            text: "Pingvinerne"
        },
        hotspot: {
            type: "function",
            func: () => {
                // Pingvin valgtext
                videoPlayer.currentTime(125);
                videoPlayer.play();
                pauseTime = 182;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 95,
        markOut: 120,
        sizeX: 3.8,
        sizeY: 7.3,
        posX: 66.2,
        posY: 87.6,
        ui: animalCircle,
        hotspot: {
            type: "function",
            func: () => {
                // flamingo valg
                videoPlayer.currentTime(290);
                videoPlayer.play();
                pauseTime = 293;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 95,
        markOut: 120,
        sizeX: 14,
        sizeY: 6,
        posX: 2,
        posY: 84,
        ui: {
            type: "box",
            style: `border: none; font-size: 250%; text-align: center; padding: 0.5%; background-color: #463139;`,
            text: "Flamingoerne"
        },
        hotspot: {
            type: "function",
            func: () => {
                // flamingo valgtext 
                videoPlayer.currentTime(290);
                videoPlayer.play();
                pauseTime = 293;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 95,
        markOut: 120,
        sizeX: 3.8,
        sizeY: 6.7,
        posX: 25.8,
        posY: 4.9,
        ui: animalCircle,
        hotspot: {
            type: "function",
            func: () => {
                // Løve valg
                videoPlayer.currentTime(298);
                videoPlayer.play();
                pauseTime = 302;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 95,
        markOut: 120,
        sizeX: 14,
        sizeY: 6,
        posX: 2,
        posY: 67,
        ui: {
            type: "box",
            style: `border: none; font-size: 250%; text-align: center; padding: 0.5%; background-color: #463139;`,
            text: "Løverne"
        },
        hotspot: {
            type: "function",
            func: () => {
                // Løve valgtext
                videoPlayer.currentTime(298);
                videoPlayer.play();
                pauseTime = 302;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 95,
        markOut: 123,
        sizeX: 25,
        sizeY: 3,
        posX: 2,
        posY: 58.5,
        ui: {
            type: "box",
            style: `border: none;
            font-size: 250%;
            color: #272727;`,
            text: "Hvem skal udspørges?"
        },
        hotspot: {
            type: "function",
            func: () => {
                // spørgsmåltekst
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 155,
        markOut: 183,
        sizeX: 6,
        sizeY: 11,
        posX: 46.9,
        posY: 34.7,
        ui: animalCircle,
        hotspot: {
            type: "function",
            func: () => {
                // Elefant valg
                videoPlayer.currentTime(184);
                videoPlayer.play();
                pauseTime = 221;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 155,
        markOut: 183,
        sizeX: 14,
        sizeY: 6,
        posX: 5,
        posY: 73,
        ui: {
            type: "box",
            style: `border: none; font-size: 250%; text-align: center; padding: 0.5%; background-color: #463139;`,
            text: "Elefanterne"
        },
        hotspot: {
            type: "function",
            func: () => {
                // Elefant valgtext
                videoPlayer.currentTime(184);
                videoPlayer.play();
                pauseTime = 221;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 155,
        markOut: 183,
        sizeX: 6,
        sizeY: 11,
        posX: 9,
        posY: 54,
        ui: {
            type: "box",
            style: `border: 3px solid rgb(142, 0, 0); border-radius: 100vw; background: url(assets/images/flodhest.png); background-size: cover;
            background-repeat: no-repeat;`
        },
        hotspot: {
            type: "function",
            func: () => {
                // Flodhest valg
                videoPlayer.currentTime(317);
                videoPlayer.play();
                pauseTime = 321;
            }
        }
    },

    {
        active: true,
        videoId: "video1",
        markIn: 155,
        markOut: 183,
        sizeX: 14,
        sizeY: 6,
        posX: 5,
        posY: 81,
        ui: {
            type: "box",
            style: `border: none; font-size: 250%; text-align: center; padding: 0.5%; background-color: #463139;`,
            text: "Flodhestene"
        },
        hotspot: {
            type: "function",
            func: () => {
                // Flodhest valgtext
                videoPlayer.currentTime(317);
                videoPlayer.play();
                pauseTime = 321;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 155,
        markOut: 183,
        sizeX: 6,
        sizeY: 11,
        posX: 14.5,
        posY: 14.5,
        ui: animalCircle,
        hotspot: {
            type: "function",
            func: () => {
                // Kudu valg
                videoPlayer.currentTime(307);
                videoPlayer.play();
                pauseTime = 312;
            }
        }
    },

    {
        active: true,
        videoId: "video1",
        markIn: 155,
        markOut: 183,
        sizeX: 14,
        sizeY: 6,
        posX: 5,
        posY: 89,
        ui: {
            type: "box",
            style: `border: none; font-size: 250%; text-align: center; padding: 0.5%; background-color: #463139;`,
            text: "Kuduerne"
        },
        hotspot: {
            type: "function",
            func: () => {
                // Kudu valg
                videoPlayer.currentTime(307);
                videoPlayer.play();
                pauseTime = 312;
            }
        }
    },

    {
        active: true,
        videoId: "video1",
        markIn: 155,
        markOut: 183,
        sizeX: 27.3,
        sizeY: 5.7,
        posX: 0,
        posY: 66,
        ui: {
            type: "box",
            style: `border: none; font-size: 250%; color: #272727; text-align: center; background-color: rgb(180 171 159); padding-left: 3%;
            padding-top: 0.5%`,
            text: "Hvem skal udspørges?"
        },
        hotspot: {
            type: "function",
            func: () => {
                // spørgsmåltekst
            }
        }
    },

    {
        active: true,
        videoId: "video1",
        markIn: 209,
        markOut: 222,
        sizeX: 22,
        sizeY: 71,
        posX: 0,
        posY: 29,
        ui: {
            type: "box",
            style: `border-right: 6px solid rgb(38 146 12); padding-right: 2vw; background-color: rgb(0 0 0 / 24%); font-size: 250%; line-height: 13; text-align: center; font-weight: 700;`,
            text: "Vælg Charlie"
        },
        hotspot: {
            type: "function",
            func: () => {
                // Final : Win valg
                videoPlayer.currentTime(225);
                videoPlayer.play();
                pauseTime = 255;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 209,
        markOut: 222,
        sizeX: 22,
        sizeY: 71,
        posX: 78,
        posY: 29,
        ui: {
            type: "box",
            style: `border-left: 6px solid rgb(166 57 123); padding-left: 2vw; background-color: rgb(0 0 0 / 24%); font-size: 250%; line-height: 13; text-align: center; font-weight: 700;`,
            text: "Vælg pigen"
        },
        hotspot: {
            type: "function",
            func: () => {
                // Final: fail valg
                videoPlayer.currentTime(325);
                videoPlayer.play();
                pauseTime = 333;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 290,
        markOut: 296,
        sizeX: 18,
        sizeY: 9,
        posX: 78,
        posY: 75,
        ui: failBox,
        hotspot: {
            type: "function",
            func: () => {
                // Flamingo fail
                videoPlayer.currentTime(95);
                videoPlayer.play();
                pauseTime = 119;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 290,
        markOut: 296,
        sizeX: 18,
        sizeY: 9,
        posX: 4,
        posY: 75,
        ui: infoBox,
        hotspot: {
            // Flamingo info
            type: "link",
            onHover: true,
            url: "https://aalborgzoo.dk/dyr/cariberflamingo.aspx",
            target: "_blank",
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 299,
        markOut: 304,
        sizeX: 18,
        sizeY: 9,
        posX: 78,
        posY: 75,
        ui: failBox,
        hotspot: {
            type: "function",
            func: () => {
                // Løve fail
                videoPlayer.currentTime(95);
                videoPlayer.play();
                pauseTime = 119;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 299,
        markOut: 304,
        sizeX: 18,
        sizeY: 9,
        posX: 4,
        posY: 75,
        ui: infoBox,
        hotspot: {
            // Løve info
            type: "link",
            onHover: true,
            url: "https://aalborgzoo.dk/dyr/loeve.aspx",
            target: "_blank",
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 317,
        markOut: 322,
        sizeX: 18,
        sizeY: 9,
        posX: 78,
        posY: 75,
        ui: failBox,
        hotspot: {
            type: "function",
            func: () => {
                // Flodhest fail
                videoPlayer.currentTime(155);
                videoPlayer.play();
                pauseTime = 182;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 317,
        markOut: 322,
        sizeX: 18,
        sizeY: 9,
        posX: 4,
        posY: 75,
        ui: infoBox,
        hotspot: {
            // Flodhest info
            type: "link",
            onHover: true,
            url: "https://aalborgzoo.dk/dyr/dvaergflodhest.aspx",
            target: "_blank",
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 308,
        markOut: 313,
        sizeX: 18,
        sizeY: 9,
        posX: 78,
        posY: 75,
        ui: failBox,
        hotspot: {
            type: "function",
            func: () => {
                // Kudu fail
                videoPlayer.currentTime(155);
                videoPlayer.play();
                pauseTime = 182;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 308,
        markOut: 313,
        sizeX: 18,
        sizeY: 9,
        posX: 4,
        posY: 75,
        ui: infoBox,
        hotspot: {
            // Kudu info
            type: "link",
            onHover: true,
            url: "https://aalborgzoo.dk/dyr/kudu.aspx",
            target: "_blank",
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 332,
        markOut: 334,
        sizeX: 18,
        sizeY: 9,
        posX: 78,
        posY: 75,
        ui: failBox,
        hotspot: {
            type: "function",
            func: () => {
                // Final fail
                videoPlayer.currentTime(206);
                videoPlayer.play();
                pauseTime = 221;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 254,
        markOut: 255.5,
        sizeX: 17,
        sizeY: 5.5,
        posX: 63,
        posY: 74,
        ui: {
            type: "box",
            style: `border: 1px solid white; font-size: 250%; color: #fff; border-radius: 3vw;text-align:center;line-height: 120%`,
            text: "Se rulletekster"
        },
        hotspot: {
            type: "function",
            func: () => {
                // final credits
                videoPlayer.currentTime(255);
                videoPlayer.play();
                pauseTime = 281;
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 254,
        markOut: 255.5,
        sizeX: 34,
        sizeY: 3,
        posX: 55,
        posY: 64,
        ui: {
            type: "box",
            style: `border: none;
            font-size: 250%;
            color: #fff;`,
            text: "Anskaf dig et årskort til Zoo i dag"
        },
        // final zoo annual pass
        hotspot: {
            type: "link",
            onHover: true,
            url: "https://aalborgzoo.dk/aarskort.aspx",
            target: "_blank",
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 280,
        markOut: 281.5,
        sizeX: 17,
        sizeY: 8.3,
        posX: 50,
        posY: 50,
        ui: {
            type: "box",
            style: `border: none;
            font-size: 250%;
            color: #fff;
            transform: translate(-50%,-50%);
            text-align: center;
            background-color: rgb(39 39 39 / 70);
            padding: 1vw;
            border-radius: .5vw;`,
            text: "Se filmen igen"
        },
        // see it again
        hotspot: {
            type: "function",
            func: () => {
                videoPlayer.currentTime(0);
                videoPlayer.play();
                pauseTime = 119;
            }
        }
    }
];



/*

// MIXED EXAMPLE WITH MORE KEY/VALUE PAIRS THAN YOU REALLY NEED

{
    active: true,           // you can set this to false if you don't want this hotspot to appear
    videoId: "video4",      // the id of the video tag you want to add a hotspot to
    markIn: 5,              // when to start (seconds)
    markOut: 6,             // when to end (seconds)
    sizeX: 50,              // width (in %, but don't write %)
    sizeY: 50,              // height (in %, but don't write %)
    posX: 0,                // left position (in %, but don't write %)
    posY: 50,               // top position (in %, but don't write %)
    ui: {                               // how should the hotspot look?
        type: "box",                                // type: "box" or "image"
        title: "Text when hovering the hotspot",    // optional: add a title attribute with the text
        image: "",                                  // add url for image (if type=image)
        style: "",                                  // add styles, can be used for both image and box
    },
    hotspot: {                          // what should the hotspot do when clicked?
        type: "link",                               // type: "link" or "function"
        onHover: true,                              // trigger on hover (if type=function)
        url: "http://tv2.dk",                       // url (if type=link)
        target: "_blank",                           // target (if type=link)
        func: () => {             // (if type=function)
            // run any javascript you want done when clicking on the hotspot
            // Leave empty if you want nothing to happen
        }
    }
}



// BOX/LINK ONLY EXAMPLE ----------------------------------------------------
// All these keys are required for boxes/links

{
    active: true,
    videoId: "video4",
    markIn: 5,
    markOut: 6,
    sizeX: 50,
    sizeY: 50,
    posX: 0,
    posY: 50,
    ui: {
        type: "box",
        title: "Text when hovering the hotspot",    // optional: add a title attribute with the text
        style: "border: 2px solid green; background-color: rgba(0,255,0,.5)"
    },
    hotspot: {
        type: "link",
        url: "http://tv2.dk",
        target: "_blank"
    }
}


// IMAGE/FUNCTION ONLY EXAMPLE ----------------------------------------------------
// All these keys are required for images/functions

const hotspots = [
    {
        active: true,
        videoId: "video1",
        markIn: 20.4,
        markOut: 21,
        sizeX: 30,
        sizeY: 32,
        posX: 52,
        posY: 6,
        ui: {
            type: "image",
            title: "Text when hovering the hotspot",    // optional: add a title attribute with the text
            image: "assets/images/speech-scream.png",
            style: "border: none"
        },
        hotspot: {
            type: "function",
            onHover: true,      // optional, will default to false (trigger function on click)
            func: () => {
                console.log("Internal screaming!");
            }
        }
    },


*/