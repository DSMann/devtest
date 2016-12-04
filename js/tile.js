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
        videoFunctions.init(context.querySelectorAll(`.tile`), videoCallbacks);
    },
    init: (context = document) => {
        tileFunctions.setupVideoTiles(context);
    }
};

tileFunctions.init();
