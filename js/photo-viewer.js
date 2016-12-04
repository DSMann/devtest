const photoViewer = {
        changePhoto: (currentPhoto, title, caption, photos, img) => {
        photoViewer.clearActive(photos);

        currentPhoto.classList.add(`loading`);
        img.classList.add(`active`);

        currentPhoto.src = [...currentPhoto.src.split(`/`).slice(0, -1), img.src.split(`/`).pop()].join(`/`);
        title.textContent = img.title;
        caption.textContent = img.dataset.caption;
    },
    clearActive: (photos) => {
        photos.forEach(img => {
            img.classList.remove(`active`);
        });
    },
    init: (currentPhoto, title, caption, photos) => {
        currentPhoto.addEventListener(`load`, () => {
            currentPhoto.classList.remove(`loading`);
        });

        photos.forEach(img => {img.addEventListener(`click`, () => {
            photoViewer.changePhoto(currentPhoto, title, caption, photos, img);
        })});
    }
};
