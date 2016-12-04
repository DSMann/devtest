const debounce = (fnEnd, wait, fnStart) => {
    let timer;

    return (...args) => {
        let self = this,
            complete = () => {
                fnEnd.apply(self, args);
                timer = undefined;
            };

        (!timer && fnStart && fnStart.apply(self))
        clearTimeout(timer);
        timer = setTimeout(complete, wait);
    };
};

const buildTile = ({image, alt, heading, content, meta, order}) => {
    if(image) {
        alt = alt || image.split(`/`).pop().replace(/\..*$/, ``);
        image = `<img class="media__image" src="${image}" alt="${alt}">`;
    } else {
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
      rebuildTiles = (container) => {
          if(!container.ready) return false;

          const tiles = container.builtTiles;

          container.builtTiles = [];
          container.innerHTML = ``;
          buildColumnStops(container);
          insertTiles(container, tiles);

          container.style.height = `${Math.ceil(Math.max(...Array.from(container.columns, col => col.offsetTop))) + 1}px`;
      },

      insertTiles = (container, tiles) => {
          const tile = tiles.shift();
          let startHeight, order;

          if(!tile) {
              container.ready = true;
              return false;
          }

          ({startHeight, order} = getShortestColumn(container))
          container.ready = false;
          container.builtTiles.push(tile);
          container.insertAdjacentHTML(`beforeend`, buildTile({...tile, order}));

          if(tile.image) {
              let img = container.lastElementChild.querySelector(`.media__image`);
              img.addEventListener(`load`, () => adjustHeight(container, startHeight, tiles));
              img.addEventListener(`error`, () => adjustHeight(container, startHeight, tiles));
          } else {
              adjustHeight(container, startHeight, tiles);
          }
      },

      adjustHeight = (container, startHeight, tiles) => {
          const containerHeight = container.getBoundingClientRect().height,
                lastInsertHeight = container.lastElementChild.getBoundingClientRect().height;

          container.style.height = `${Math.ceil(Math.max(containerHeight, startHeight + lastInsertHeight)) + 1}px`;

          fillGap(container);
          insertTiles(container, tiles);
      },

      fillGap = (container) => {
          container.columns.forEach((col) => {
              col.style.height = 0;
              let height = Math.floor(container.getBoundingClientRect().height - col.offsetTop) - 1;
              col.style.height = `${height}px`;
          });
      },

      getShortestColumn = ({childElementCount, columns}) => {
          let startHeight = 0, order = 0;

          if(childElementCount - columns.length < columns.length) {
              order = childElementCount - columns.length;
          } else {
              const colHeights = Array.from(columns, col => col.offsetTop);
              startHeight = Math.min(...colHeights);
              order = colHeights.indexOf(startHeight);
          }

          return {startHeight, order: order * 2};
      },

      buildColumnStops = (container) => {
          let columnCount = container.numColumns,
              newTile;

          while(columnCount--) {
              newTile = `<div class="masonry__column-stop" style="order: ${columnCount * 2 + 1}"></div>`;
              container.insertAdjacentHTML(`afterbegin`, newTile);
          }

          container.columns = container.querySelectorAll(`.masonry__column-stop`);
      },

      handleQueries = (queryList, queries, container) => {
          container.numColumns = queryList.reduce((numCol, query) => {
              return query.matches ? queries[query.media] : numCol
          }, 1);
      },

      setupQueries = (queries, container) => {
          let queryList = Object.keys(queries).map(query => {
              query = window.matchMedia(query);
              query.addListener(() => handleQueries(queryList, queries, container));

              return query;
          });

          handleQueries(queryList, queries, container);
      },

      init = (container, tiles, {loadAmount = 5, numColumns = 2, queries} = {}) => {
          container.numColumns = numColumns;

          (queries && setupQueries(queries, container))

          buildColumnStops(container);
          container.tiles = tiles;
          container.builtTiles = [];
          container.ready = true;

          window.addEventListener(`resize`, debounce((e) => rebuildTiles(container), 100, () => {
              container.columns.forEach((col) => {col.style.height = 0;})
          }));

          return (trigger) => {
              insertTiles(container, container.tiles.splice(0, loadAmount));

              (!container.tiles.length && trigger.remove())
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
})

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
