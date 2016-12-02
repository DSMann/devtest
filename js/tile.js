import video from `./video.js`;

const tileFunctions = {
    togglePlayed: (video) => {
        video.closest(`.tile`).classList.toggle(`tile--played`);
    },
    setupVideoTiles: (context = document) => {
        if(!context.querySelector(`.tile .media__video`)) return false;

        const videoCallbacks = {
            start: tileFunctions.togglePlayed,
            reset: tileFunctions.togglePlayed
        }
        video(context.querySelectorAll(`.tile`), videoCallbacks);
    },
    init: (context = document) => {
        tileFunctions.setupVideoTiles(context);
    }
};

export tileFunctions;

export default tileFuntions.init;

tileFunctions.init();
