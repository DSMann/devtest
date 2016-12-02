const currentPhoto = document.querySelector(`.photo-viewer__current-photo`),
    photoTitle = document.querySelector(`.photo-viewer .title`),
    photoCaption = document.querySelector(`.photo-viewer .caption`);

currentPhoto.addEventListener(`load`, () => {
    currentPhoto.classList.remove(`loading`);
});

const photos = Array.from(document.querySelectorAll(`.photo-viewer__selector img`), img => {
    img.addEventListener(`click`, () => {
        photos.forEach(img => {
            img.classList.remove(`active`);
        });

        currentPhoto.classList.add(`loading`);
        img.classList.add(`active`);

        currentPhoto.src = [...currentPhoto.src.split(`/`).slice(0, -1), img.src.split(`/`).pop()].join(`/`);
        photoTitle.textContent = img.title;
        photoCaption.textContent = img.dataset.caption;
    });

    return img;
});

const video = document.querySelector(`video`),

    toggleVideo = (e) => {
        e.currentTarget.parentElement.classList.toggle(`playing`);
        e.currentTarget[e.currentTarget.paused ? `play` : `pause`]();
    };

video.addEventListener(`click`, toggleVideo);
video.addEventListener(`playing`, e => {
    e.currentTarget.controls = true;
});
video.addEventListener(`ended`, e => {
    e.currentTarget.parentElement.classList.remove(`playing`);
    e.currentTarget.controls = false;
    e.currentTarget.load();
});
