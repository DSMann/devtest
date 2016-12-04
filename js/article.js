const currentPhoto = document.querySelector(`.photo-viewer__current-photo`),
photoTitle = document.querySelector(`.photo-viewer .title`),
photoCaption = document.querySelector(`.photo-viewer .caption`),
photos = Array.from(document.querySelectorAll(`.photo-viewer__selector img`));

photoViewer.init(currentPhoto, photoTitle, photoCaption, photos);
videoFunctions.init();
