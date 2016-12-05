const tileFunctions = {
    // Cycles between play and pause states for the tile
    // Passed into video to change the tiles class when ever it's playstate changes
    togglePlayed: (video) => {
        video.closest(`.tile`).classList.toggle(`tile--played`);
    },
    // Runs the setup for any tiles with vidoes
    setupVideoTiles: (context = document) => {
        if(!context.querySelector(`.tile .media__video`)) return false;

        const videoCallbacks = {
            start: tileFunctions.togglePlayed,
            reset: tileFunctions.togglePlayed
        }
        videoFunctions.init(context.querySelectorAll(`.tile`), videoCallbacks);
    },
    // Runs any init tasks for tiles - this is mostly here for expansion later
    init: (context = document) => {
        tileFunctions.setupVideoTiles(context);
    }
};

tileFunctions.init();
