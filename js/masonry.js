/**************************************************************************************
 * First, I realize this is an overly complicated method to pull off masonry.
 * Since I was only tasked with the three of the 4 tasks I decided to experiment
 * with this one.
 *
 * This approach of using flexbox came from the idea that, according to spec,
 * flexbox columns/rows should break on `break-after`. I like this method
 * because it works without absolute positioning, allows for the columns to
 * resize without needing to listen to the resize event, makes finding the
 * shortest column super simple, preserves the original order of the tiles,
 * and can change the number of coluns fairly simply.  Depending on the styles
 * on the masonry items the last point can even occur with no specific styles
 * in the stylesheet (though I wouldn't rely on that).  Sadly, `break-after`
 * doesn't affect flexbox in any browser but firefox.  Most of the complications
 * here stem from that fact and were even made worse by the different rounding
 * methods of the various browsers.
 *
 * THIS IS NOT PRODUCTION WORTHY CODE... but when/if `break-after` is fully
 * supported it could be.  Instead this turned into a very rudementary pollyfill
 * for `break-after`.  The original (and working) firefox version can be found here:
 * http://codepen.io/DSMann/pen/dOmRoB?editors=0010.
 ***************************************************************************************/

// Slightly modified debounce function that calls two functions one at the
// first call, and one after the set amount of time after the final call
const debounce = (fnEnd, wait, fnStart) =>
{
    let timer;

    return (...args) =>
    {
        let self = this,
            complete = () =>
            {
                fnEnd.apply(self, args);
                timer = undefined;
            };

        (!timer && fnStart && fnStart.apply(self))
        clearTimeout(timer);
        timer = setTimeout(complete, wait);
    };
};

// Returns the html for a tile given it's data.  Image is split out for readability
const buildTile = ({image, alt, heading, content, meta, order}) => {
    if (image)
    {
        alt = alt || image.split(`/`).pop().replace(/\..*$/, ``);
        image = `<img class="media__image" src="${image}" alt="${alt}">`;
    }
    else
    {
        image = ``;
    }

    return `
<article class="tile" style="order: ${order}">
    <figure class="media">${image}</figure>
    <header>
        <h1 class="title">${heading}</h1>
    </header>
    <p>${content}</p>
    ${(meta && `<p class="tile__meta">${meta}</p>`)}
</article>`
},

// Rebuilds the tiles on resize
// This only fires on media queries with `break-after`
rebuildTiles = (container) => {
    // Fail fast if a build is already in progress
    if(!container.ready) return false;

    const tiles = container.builtTiles;

    // Reset the container
    container.builtTiles = [];
    container.innerHTML = ``;
    buildColumnStops(container);

    // Reinsert all of the tiles that had been put into place.
    insertTiles(container, tiles);

    // Reset the height of the container - not needed with `break-after`
    container.style.height = `${Math.ceil(Math.max(...Array.from(container.columns, col => col.offsetTop))) + 1}px`;
},

// Inserts a given set of tiles one at a time, recursively
insertTiles = (container, tiles) => {
    // Set container to ready and stop recursion if no tiles are passed in.
    if(!tiles || !tiles.length) {
        container.ready = true;
        return false;
    }

    // Set container to not ready
    container.ready = false;

    const tile = tiles.shift(),
        {startHeight, order} = getShortestColumn(container);

    container.builtTiles.push(tile);
    container.insertAdjacentHTML(`beforeend`, buildTile({...tile, order}));

    // If there's an image, wait for it to either load or fail before adjusting the
    // column stops so that the next tile is put in the right column
    if(tile.image) {
        let img = container.lastElementChild.querySelector(`.media__image`);
        img.addEventListener(`load`, () => adjustHeight(container, startHeight, tiles));
        img.addEventListener(`error`, () => adjustHeight(container, startHeight, tiles));
    } else {
        adjustHeight(container, startHeight, tiles);
    }
},

// Adjusts the height of container to force column breaks - not needed with `break-after`
adjustHeight = (container, startHeight, tiles) => {
    const containerHeight = container.getBoundingClientRect().height,
        lastInsertHeight = container.lastElementChild.getBoundingClientRect().height;

    // Uses the the max between the newest column height and the old container height for the new container height
    // Firefox rounds differently, so the height of the container is purposfully set a ~2px too large
    container.style.height = `${Math.ceil(Math.max(containerHeight, startHeight + lastInsertHeight)) + 1}px`;

    fillGap(container);

    // Recursive call to add the next tile
    insertTiles(container, tiles);
},

// Sets the column stops to fill the gap between the end of the column and the container
// so the upermost tile in the next column can't move over - not needed with `break-after`
fillGap = (container) => {
    container.columns.forEach((col) => {
        col.style.height = 0;
        // A pixel is removed from the column height to allow for rounding differences.
        let height = Math.floor(container.getBoundingClientRect().height - col.offsetTop) - 1;
        col.style.height = `${height}px`;
    });
},

// Finds the shortest column
getShortestColumn = ({childElementCount, columns}) => {
    let startHeight = 0, order = 0;

    // Adds an exception to the default shortest column logic for the
    // first tile in each column - not needed with `break after`
    if(childElementCount - columns.length < columns.length) {
        order = childElementCount - columns.length;
    } else {
        // This is the default logic for finding the shortest column
        const colHeights = Array.from(columns, col => col.offsetTop);
        startHeight = Math.min(...colHeights);
        order = colHeights.indexOf(startHeight);
    }

    // Order is multiplied by two so that the tiles are always even (or zero)
    // while the column stops are odd (makes insertion logic easier)
    return {startHeight, order: order * 2};
},

// Builds the column stops based on how many columns should be inserted
buildColumnStops = (container) => {
    let columnCount = container.numColumns,
        newTile;

    while(columnCount--) {
        // order is multiplied by two and increased by one to make
        // the columns stops odd for easier tile insertion logic
        newTile = `<div class="masonry__column-stop" style="order: ${columnCount * 2 + 1}"></div>`;
        container.insertAdjacentHTML(`afterbegin`, newTile);
    }

    // Store the column stops for later use
    container.columns = container.querySelectorAll(`.masonry__column-stop`);
},

// Adjusts the number of columns based on provided media queries and rebuilds the tiles
// If no media queries match it's set back to what it was before
handleQueries = (queryList, queries, container) => {
    container.numColumns = queryList.reduce((numCol, query) => {
        return query.matches ? queries[query.media] : numCol
    }, container.numColumns);

    rebuildTiles(container);
},

// Builds the matchMedia listeners
setupQueries = (queries, container) => {
    let queryList = Object.keys(queries).map(query => {
        query = window.matchMedia(query);
        query.addListener(() => handleQueries(queryList, queries, container));

        return query;
    });

    // Run once to make sure the proper number of columns are being built.
    handleQueries(queryList, queries, container);
},

// Sets up the needed information for masonry as well as the configurable options
// and returns a function to add the set amount of tiles
init = (container, tiles, {loadAmount = 5, numColumns = 2, queries = {}} = {}) => {
    container.numColumns = numColumns;
    container.tiles = tiles;
    container.builtTiles = [];

    setupQueries(queries, container);
    buildColumnStops(container);

    // Listen for resize event to keep the height of the container (and the column stops)
    // from breaking - not needed with `break-after`
    window.addEventListener(`resize`, debounce((e) => rebuildTiles(container), 100, () => {
        container.columns.forEach((col) => {col.style.height = 0;})
    }));

    // Adds the set amount of tiles and removes the trigger when finished
    return (trigger) => {
        insertTiles(container, container.tiles.splice(0, loadAmount));

        (!container.tiles.length && trigger && trigger.remove())
    };
};

const queries = {
    '(min-width: 600px)': 2,
    '(min-width: 960px)': 3,
    '(min-width: 1280px)': 4
},

container = document.querySelector(`.masonry__container`),
trigger = document.querySelector(`button`);

fetch('//codepen.mannfolio.com/json/masonry-data.json').then(function(response) {
    if(response.ok) {
        response.json().then(function(data) {
            if(!data) {
                data = buildDummyData();
            }

            /*******************************************************
            * Uncomment for responsive column numbers
            * Also uncomment either:
            *     lines 31 - 55 in masonry.css
            *     lines 25 - 44 in masonry.scss
            *******************************************************/
            const addTile = init(container, data.tiles/*, {queries}*/);

            addTile(trigger);
            trigger.addEventListener('click', () => addTile(trigger));
        });
    } else {
        container.innerHTML = `<div class="error">An error occured</div>`
    }
});

function buildDummyData() {
    return {
        "tiles": [
            {
                "heading": "Dummy Data Etiam Ipsum Euismod",
                "content": "Maecenas faucibus mollis interdum. Nullam id dolor id nibh ultricies vehicula ut id elit.",
                "image": "images/mid/photo01.jpg",
                "meta": "Fringilla Commodo"
            },
            {
                "heading": "Dummy Data Dolor Ipsum Sollicitudin",
                "content": "Donec sed odio dui. Aenean lacinia bibendum nulla sed consectetur.",
                "image": "images/mid/photo02.jpg",
                "meta": "Pharetra Ultricies"
            },
            {
                "heading": "Dummy Data Aenean lacinia bibendum nulla sed consectetur.",
                "content": "Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Vestibulum id ligula porta felis euismod semper.",
                "image": "",
                "meta": "Tristique Sem"
            },
            {
                "heading": "Dummy Data Elit Porta Tellus Ultricies",
                "content": "Vestibulum id ligula porta felis euismod semper. Etiam porta sem malesuada magna mollis euismod.",
                "image": "images/mid/photo03.jpg",
                "meta": "Parturient Ipsum"
            },
            {
                "heading": "Dummy Data Integer posuere erat a ante venenatis dapibus posuere velit aliquet.",
                "content": "Sed posuere consectetur est at lobortis. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.",
                "image": "",
                "meta": "Mollis Adipiscing"
            },
            {
                "heading": "Dummy Data Mattis Ridiculus",
                "content": "Donec id elit non mi porta gravida at eget metus. Aenean lacinia bibendum nulla sed consectetur.",
                "image": "images/mid/photo04.jpg",
                "meta": ""
            },
            {
                "heading": "Dummy Data Vehicula Mattis Fringilla",
                "content": "Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Nulla vitae elit libero, a pharetra augue.",
                "image": "images/mid/photo05.jpg",
                "meta": "Aenean Lorem"
            },
            {
                "heading": "Dummy Data Venenatis Pharetra Purus Nullam",
                "content": "Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.",
                "image": "",
                "meta": "Vulputate Mollis"
            },
            {
                "heading": "Dummy Data Risus Tristique Cras",
                "content": "Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec sed odio dui.",
                "image": "images/mid/photo06.jpg",
                "meta": "Bibendum Condimentum"
            }
        ]
    };
};
