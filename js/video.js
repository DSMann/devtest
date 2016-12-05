const videoFunctions = {
    // Toggles the videos state between playing and paused
    toggleVideo: ({currentTarget: video, currentTarget: {parentElement: videoParent}}) => {
        video[video.paused ? `play`: `pause`]();
        videoParent.classList.toggle(`playing`);

        // Calls the toggle callback, if it exists
        (video.callbacks.toggle && video.callbacks.toggle(video))
    },

    // Enables the player controls on video start
    onStart: ({currentTarget: video}) => {
        video.controls = true;

        // Removes it's own listener to prevent it from being called every time the video is unpaused
        video.removeEventListener(`playing`, videoFunctions.onStart);

        // Calls the start callback, if it exists
        (video.callbacks.start && video.callbacks.start(video))
    },

    // Restores the video back to it's original state (including the image) when playback finishes
    resetVideo: ({currentTarget: video, currentTarget: {parentElement: videoParent}}) => {
        videoParent.classList.remove(`playing`);
        video.controls = false;
        // Calling load retriggers the showing of the poster image
        video.load();
        video.addEventListener(`playing`, videoFunctions.enableControls);

        // Calls the reset callback, if it exists
        (video.callbacks.reset && video.callbacks.reset(video))
    },

    // Does the initial setup for the given videos
    setupVideos: (videos, callbacks) => {
        videos.forEach(video => {
            // Remove the controls here so that the video still works if JavaScript fails
            video.controls = false;

            // Add event listeners
            video.addEventListener(`click`, videoFunctions.toggleVideo);
            video.addEventListener(`playing`, videoFunctions.onStart);
            video.addEventListener(`ended`, videoFunctions.resetVideo);

            // Stores the callbacks on the video for later use
            video.callbacks = callbacks;

            // Calls the setup callback, if it exists
            (video.callbacks.setup && video.callbacks.setup(video))
        });
    },

    // Destroys the video making it safe to reinitialize (or delete)
    destroy: video => {
        video.removeEventListener(`click`, videoFunctions.toggleVideo);
        video.removeEventListener(`playing`, videoFunctions.onStart);
        video.removeEventListener(`ended`, videoFunctions.resetVideo);

        video.callbacks = {};
    },

    // Destroys all videos in the given context
    destroyAll: (context = [document]) => {
        context.forEach(el => Array.from(el.querySelectorAll(`video`), videoFunctions.destroy));
    },

    // Initializes the given videos
    init: (context = [document], callbacks = {}) => {
        // Destroy all of the given videos to make sure they don't get double event listeners
        videoFunctions.destroyAll(context);
        context.forEach(el => videoFunctions.setupVideos(el.querySelectorAll(`video`), callbacks));
    }
};
