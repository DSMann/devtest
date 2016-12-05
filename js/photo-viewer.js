const photoViewer = {
    // Changes the current photo, title, and caption to match the one clicked on
    changePhoto: (currentPhoto, title, caption, photos, img) => {
        photoViewer.clearActive(photos);

        currentPhoto.classList.add(`loading`);
        img.classList.add(`active`);

        // Replaces the current photo's file name with the smaller photo's name leaving the rest of the url unchanged
        currentPhoto.src = [...currentPhoto.src.split(`/`).slice(0, -1), img.src.split(`/`).pop()].join(`/`);
        title.textContent = img.title;
        caption.textContent = img.dataset.caption;
    },

    // Resets the active photo in the selector
    clearActive: (photos) => {
        photos.forEach(img => {
            img.classList.remove(`active`);
        });
    },

    // Sets up the event listeners
    init: (currentPhoto, title, caption, photos) => {
        currentPhoto.addEventListener(`load`, () => {
            currentPhoto.classList.remove(`loading`);
        });

        photos.forEach(img => {img.addEventListener(`click`, () => {
            photoViewer.changePhoto(currentPhoto, title, caption, photos, img);
        })});
    }
};
