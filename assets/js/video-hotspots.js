// JS by Dan Høegh
// UCN MMD 2020

// A framework for showing time-encoded hotspots on multiple videos.
// Assumes either video.js or a parent <div> for the video that has the same dimensions as the video.

// ## SETTINGS START
const fps = 30;     // ## adjust this to set the frames per second precision on the hotspot appearance (lower = less cpu used)
const debug = false; // ## set to true to get console.log output, use   video.log('text')
// ## SETTINGS END

const msInterval = Math.floor(1000/fps); // calculate how many ms per loop to match desired FPS. Rounded down
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
            const elmsVideo = document.querySelectorAll('video');   // grab all videos on the page
            elmsVideo.forEach((elmVideo) => {                       // loop through the parents of the video elements
                elmVideo.parentElement.classList.add('videoHotspotsParent');                  
                elmVideo.addEventListener('play', (event) => {      // add eventlistener play on videos
                    if (!video.hotspots.running) {                   // start engine, if it is not running already
                        video.hotspots.on();
                    }
                });
                elmVideo.addEventListener('seeked', (event) => {      // add eventlistener play on videos
                    if (!video.hotspots.running) {                   // start engine, if it is not running already
                        video.hotspots.on(true);
                    }
                });
                elmVideo.addEventListener('pause', (event) => {         // add eventlistener stop/pause on videos
                    if (video.hotspots.running) {        // if engine is running
                        let videoPlaying = false;       // check if all videos are stopped/paused
                        elmsVideo.forEach((elmVideo) => {
                            if (!elmVideo.paused) {
                                videoPlaying = true;
                            }
                        });
                        if (!videoPlaying) {
                            video.hotspots.off();   // if all videos are NOT playing we can turn off the loop engine
                        }
                    }
                });
            });
        },
        on: (isSeeked = false) => {
            // start the interval loop
            video.log('video hotspot engine: on');
            if (!video.hotspots.running) {       // only start it if it isn't already running
                video.hotspots.running = true;  // make sure to tell our boolean that we are turning on the engine
            }
            engine = setInterval(() => {        // start the interval engine
                video.log('engine loop');
                video.hotspots.update(isSeeked);
            }, msInterval);
        },
        off: () => {
            // kill the interval var
            video.log('video hotspot engine: off');
            video.hotspots.running = false;     // make sure to tell our boolean that the engine is being stopped
            clearInterval(engine);              // stop the engine
        },
        update: () => {
            hotspots.forEach((hotspot, index) => {
                if (hotspot.active) {
                    // get video element for hotspot
                    const video = document.querySelector(`#${hotspot.videoId}>video`);
                    if (video){
                        const now = video.currentTime;
                        const elmHotspotCheck = document.querySelector(`#hotspotId${index}`);
    
                        if (hotspot.markIn > now || hotspot.markOut <= now) {
                            // check to see if element with the current hotspot id exists
                            if (elmHotspotCheck){
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
                                if (hotspot.ui.title){
                                    elmHotspot.title = hotspot.ui.title;
                                }
                                if (hotspot.ui.text && hotspot.ui.text != ""){
                                    elmHotspot.innerHTML = hotspot.ui.text;
                                }
                                let css = "";
                                css += `width: ${hotspot.sizeX}%;`;
                                css += `height: ${hotspot.sizeY}%;`;
                                css += `left: ${hotspot.posX}%;`;
                                css += `top: ${hotspot.posY}%;`;
                                css += `${hotspot.ui.style};`;
                                if (hotspot.ui.type == 'image'){
                                    // insert image css
                                    css += `background-image: url(${hotspot.ui.image});`;
                                    elmHotspot.classList.add('image');
                                }
                                elmHotspot.style = css;
                                if (hotspot.hotspot.type == 'link'){
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
            video.hotspots.off();                                               // turn off engine
            const elmsHotspots = document.querySelectorAll('a.hotspot');        // find all hotspot DOM elements
            elmsHotspots.forEach((elmHotspot) => {                              // loop through hotspots
                elmHotspot.parentElement.removeChild(elmHotspot);               // remove current hotspot
            });
            delete video;                                                       // remove the variable from memory
            delete hotspots;                                                    // remove the variable from memory
        }

    }
}

// data for hotspots
const hotspots = [
    {
        // bird strike scream
        active: true,
        videoId: "video1",
        markIn: 20.4,
        markOut: 21,
        sizeX: 30,
        sizeY: 32,
        posX: 52,
        posY: 6,
        ui: {
            type: "image",  // legal values are "box" & "image"
            image: "assets/images/speech-scream.png"
        },
        hotspot: {
            type: "function",
            onHover: true,
            func: () => {
                alert('Head trauma detected, administering morphine');
            }
        }
    },
    {
        // title text
        active: true,
        videoId: "video1",
        markIn: 24.5,
        markOut: 29.5,
        sizeX: 49,
        sizeY: 39,
        posX: 27,
        posY: 19,
        ui: {
            type: "box",
            title: "Visit the blender website",
            style: "border: none; background-color: rgba(0,0,0,.1)"
        },
        hotspot: {
            type: "link",
            url: "https://peach.blender.org/",
            target: "_blank"
        }
    },
    {
        // text right after the bird strike
        active: true,
        videoId: "video1",
        markIn: 20.3,
        markOut: 23.0,
        sizeX: 55,
        sizeY: 19,
        posX: 22,
        posY: 40,
        ui: {
            type: "box",
            title: "Visit the blender website",
            style: "border: none; background-color: rgba(0,0,0,.1)"
        },
        hotspot: {
            type: "link",
            url: "https://peach.blender.org/",
            target: "_blank"
        }
    },
    {
        // Coffee advert
        active: true,
        videoId: "video1",
        markIn: 36.0,
        markOut: 47.0,
        sizeX: 20,
        sizeY: 42,
        posX: 65,
        posY: 24,
        ui: {
            type: "image",
            title: "Get coffee!!!",
            image: "assets/images/get-coffee.png",
            style: "border: none;"
        },
        hotspot: {
            type: "link",
            url: "https://coffeecollective.dk/da/shop/",
            target: "_blank"
        }
    },
    {
        active: true,
        videoId: "video2",
        markIn: 4,
        markOut: 10,
        sizeX: 20,
        sizeY: 20,
        posX: 50,
        posY: 25,
        ui: {
            type: "box",
            image: "",
            style: "border: 2px solid green; background-color: rgba(0,255,0,.5)"
        },
        hotspot: {
            type: "link",
            url: "http://tv2.dk",
            target: "_blank"
        }
    },
    {
        active: true,
        videoId: "video2",
        markIn: 5,
        markOut: 11,
        sizeX: 20,
        sizeY: 20,
        posX: 60,
        posY: 30,
        ui: {
            type: "box",
            image: "",
            style: "border: 2px solid red; background-color: rgba(255,0,0,.5)"
        },
        hotspot: {
            type: "link",
            url: "http://tv2.dk",
            target: "_blank"
        }
    },
    {
        active: true,
        videoId: "video3",
        markIn: 3,
        markOut: 5,
        sizeX: 10,
        sizeY: 10,
        posX: 50,
        posY: 25,
        ui: {
            type: "box",
            image: "",
            style: "border: 2px solid blue; background-color: rgba(0,0,255,.5)"
        },
        hotspot: {
            type: "link",
            url: "http://tv2.dk",
            target: "_blank"
        }
    },
    {
        active: true,
        videoId: "video3",
        markIn: 4,
        markOut: 6,
        sizeX: 20,
        sizeY: 20,
        posX: 70,
        posY: 50,
        ui: {
            type: "box",
            image: "",
            style: "border: 2px solid red; background-color: rgba(255,0,0,.5)"
        },
        hotspot: {
            type: "link",
            url: "http://tv2.dk",
            target: "_blank"
        }
    },
    {
        active: true,
        videoId: "video4",
        markIn: 2,
        markOut: 3,
        sizeX: 50,
        sizeY: 50,
        posX: 0,
        posY: 0,
        ui: {
            type: "box",
            image: "",
            // style: "border: none; background-color: rgba(255,0,0,.5); display: flex; justify-content: center; align-items: center; text-decoration: none; font-size: 2vw; color: white;",
            style: `border: none; 
                    background-color: rgba(255,0,0,.5); 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    text-decoration: none; 
                    font-size: 2vw; 
                    color: white;`,
            text: "This is text in a box"
        },
        hotspot: {
            type: "link",
            url: "http://tv2.dk",
            target: "_blank"
        }
    },
    {
        active: true,
        videoId: "video4",
        markIn: 3,
        markOut: 4,
        sizeX: 50,
        sizeY: 50,
        posX: 50,
        posY: 0,
        ui: {
            type: "box",
            image: "",
            style: "border: none; background-color: rgba(0,0,255,.5)"
        },
        hotspot: {
            type: "link",
            url: "http://tv2.dk",
            target: "_blank"
        }
    },
    {
        active: true,
        videoId: "video4",
        markIn: 4,
        markOut: 5,
        sizeX: 50,
        sizeY: 50,
        posX: 50,
        posY: 50,
        ui: {
            type: "box",
            image: "",
            style: "border: none; background-color: rgba(255,0,255,.5)"
        },
        hotspot: {
            type: "link",
            url: "http://tv2.dk",
            target: "_blank"
        }
    },
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
            image: "",
            style: "border: none; background-color: rgba(0,255,0,.5)"
        },
        hotspot: {
            type: "link",
            url: "http://tv2.dk",
            target: "_blank"
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