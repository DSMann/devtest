const videoFunctions = {
    toggleVideo: ({currentTarget: video, currentTarget: {parentElement: videoParent}}) => {
        video[video.paused ? `play`: `pause`]();
        videoParent.classList.toggle(`playing`);

        (video.callbacks.toggle && video.callbacks.toggle(video))
    },
    onStart: ({currentTarget: video}) => {
        video.controls = true;
        video.removeEventListener(`playing`, videoFunctions.onStart);

        (video.callbacks.start && video.callbacks.start(video))
    },
    resetVideo: ({currentTarget: video, currentTarget: {parentElement: videoParent}}) => {
        videoParent.classList.remove(`playing`);
        video.controls = false;
        video.load();
        video.addEventListener(`playing`, videoFunctions.enableControls);

        (video.callbacks.reset && video.callbacks.reset(video))
    },
    setupVideos: (videos, callbacks) => {
        videos.forEach(video => {
            video.controls = false;
            video.addEventListener(`click`, videoFunctions.toggleVideo);
            video.addEventListener(`playing`, videoFunctions.onStart);
            video.addEventListener(`ended`, videoFunctions.resetVideo);

            video.callbacks = callbacks;

            (video.callbacks.setup && video.callbacks.setup(video))
        });
    },
    destroy: video => {
        video.removeEventListener(`click`, videoFunctions.toggleVideo);
        video.removeEventListener(`playing`, videoFunctions.onStart);
        video.removeEventListener(`ended`, videoFunctions.resetVideo);

        video.callbacks = {};
    },
    destroyAll: ([...context] = [document]) => {
        context.forEach(el => Array.from(el.querySelectorAll(`video`), videoFunctions.destroy));
    },
    init: ([...context] = [document], callbacks = {}) => {
        videoFunctions.destroyAll(context);
        context.forEach(el => videoFunctions.setupVideos(el.querySelectorAll(`video`), callbacks));
    }
};
