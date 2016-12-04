'use strict';
var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
};
var debounce = function debounce(fnEnd, wait, fnStart) {
    var timer = undefined;
    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }
        var self = undefined, complete = function complete() {
                fnEnd.apply(self, args);
                timer = undefined;
            };
        !timer && fnStart && fnStart.apply(self);
        clearTimeout(timer);
        timer = setTimeout(complete, wait);
    };
};
var buildTile = function buildTile(_ref) {
        var image = _ref.image;
        var alt = _ref.alt;
        var heading = _ref.heading;
        var content = _ref.content;
        var meta = _ref.meta;
        var order = _ref.order;
        if (image) {
            alt = alt || image.split('/').pop().replace(/\..*$/, '');
            image = '<img class="media__image" src="' + image + '" alt="' + alt + '">';
        } else {
            image = '';
        }
        return '\n<article class="tile" style="order: ' + order + '">\n    <figure class="media">' + image + '</figure>\n    <header>\n        <h1 class="title">' + heading + '</h1>\n    </header>\n    <p>' + content + '</p>\n    ' + (meta && '<p class="tile__meta">' + meta + '</p>') + '\n</article>';
    }, rebuildTiles = function rebuildTiles(container) {
        var _Math;
        if (!container.ready)
            return false;
        var tiles = container.builtTiles;
        container.builtTiles = [];
        container.innerHTML = '';
        buildColumnStops(container);
        insertTiles(container, tiles);
        container.style.height = Math.ceil((_Math = Math).max.apply(_Math, Array.from(container.columns, function (col) {
            return col.offsetTop;
        }))) + 1 + 'px';
    }, insertTiles = function insertTiles(container, tiles) {
        var tile = tiles.shift();
        var startHeight = undefined, order = undefined;
        if (!tile) {
            container.ready = true;
            return false;
        }
        var _getShortestColumn = getShortestColumn(container);
        startHeight = _getShortestColumn.startHeight;
        order = _getShortestColumn.order;
        container.ready = false;
        container.builtTiles.push(tile);
        container.insertAdjacentHTML('beforeend', buildTile(_extends({}, tile, { order: order })));
        if (tile.image) {
            var img = container.lastElementChild.querySelector('.media__image');
            img.addEventListener('load', function () {
                return adjustHeight(container, startHeight, tiles);
            });
            img.addEventListener('error', function () {
                return adjustHeight(container, startHeight, tiles);
            });
        } else {
            adjustHeight(container, startHeight, tiles);
        }
    }, adjustHeight = function adjustHeight(container, startHeight, tiles) {
        var containerHeight = container.getBoundingClientRect().height, lastInsertHeight = container.lastElementChild.getBoundingClientRect().height;
        container.style.height = Math.ceil(Math.max(containerHeight, startHeight + lastInsertHeight)) + 1 + 'px';
        fillGap(container);
        insertTiles(container, tiles);
    }, fillGap = function fillGap(container) {
        container.columns.forEach(function (col) {
            col.style.height = 0;
            var height = Math.floor(container.getBoundingClientRect().height - col.offsetTop) - 1;
            col.style.height = height + 'px';
        });
    }, getShortestColumn = function getShortestColumn(_ref2) {
        var childElementCount = _ref2.childElementCount;
        var columns = _ref2.columns;
        var startHeight = 0, order = 0;
        if (childElementCount - columns.length < columns.length) {
            order = childElementCount - columns.length;
        } else {
            var _Math2;
            var colHeights = Array.from(columns, function (col) {
                return col.offsetTop;
            });
            startHeight = (_Math2 = Math).min.apply(_Math2, colHeights);
            order = colHeights.indexOf(startHeight);
        }
        return {
            startHeight: startHeight,
            order: order * 2
        };
    }, buildColumnStops = function buildColumnStops(container) {
        var columnCount = container.numColumns, newTile = undefined;
        while (columnCount--) {
            newTile = '<div class="masonry__column-stop" style="order: ' + (columnCount * 2 + 1) + '"></div>';
            container.insertAdjacentHTML('afterbegin', newTile);
        }
        container.columns = container.querySelectorAll('.masonry__column-stop');
    }, handleQueries = function handleQueries(queryList, queries, container) {
        container.numColumns = queryList.reduce(function (numCol, query) {
            return query.matches ? queries[query.media] : numCol;
        }, 1);
    }, setupQueries = function setupQueries(queries, container) {
        var queryList = Object.keys(queries).map(function (query) {
            query = window.matchMedia(query);
            query.addListener(function () {
                return handleQueries(queryList, queries, container);
            });
            return query;
        });
        handleQueries(queryList, queries, container);
    }, init = function init(container, tiles) {
        var _ref3 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
        var _ref3$loadAmount = _ref3.loadAmount;
        var loadAmount = _ref3$loadAmount === undefined ? 5 : _ref3$loadAmount;
        var _ref3$numColumns = _ref3.numColumns;
        var numColumns = _ref3$numColumns === undefined ? 2 : _ref3$numColumns;
        var queries = _ref3.queries;
        container.numColumns = numColumns;
        queries && setupQueries(queries, container);
        buildColumnStops(container);
        container.tiles = tiles;
        container.builtTiles = [];
        container.ready = true;
        window.addEventListener('resize', debounce(function (e) {
            return rebuildTiles(container);
        }, 100, function () {
            container.columns.forEach(function (col) {
                col.style.height = 0;
            });
        }));
        return function (trigger) {
            insertTiles(container, container.tiles.splice(0, loadAmount));
            !container.tiles.length && trigger.remove();
        };
    };
var queries = {
        '(min-width: 600px)': 2,
        '(min-width: 960px)': 3,
        '(min-width: 1280px)': 4
    }, container = document.querySelector('.masonry__container'), trigger = document.querySelector('button');
fetch('//codepen.mannfolio.com/json/masonry-data.json').then(function (response) {
    if (response.ok) {
        response.json().then(function (data) {
            if (!data) {
                data = buildDummyData();
            }
            /*******************************************************
             * Uncomment for responsive column numbers
             * Also uncomment either:
             *     lines 31 - 55 in masonry.css
             *     lines 25 - 44 in masonry.scss
             *******************************************************/
            var addTile = init(container, data.tiles/*, { queries: queries }*/);
            addTile(trigger);
            trigger.addEventListener('click', function () {
                return addTile(trigger);
            });
        });
    } else {
        container.innerHTML = '<div class="error">An error occured</div>';
    }
});
function buildDummyData() {
    return {
        'tiles': [
            {
                'heading': 'Dummy Data Etiam Ipsum Euismod',
                'content': 'Maecenas faucibus mollis interdum. Nullam id dolor id nibh ultricies vehicula ut id elit.',
                'image': 'images/mid/photo01.jpg',
                'meta': 'Fringilla Commodo'
            },
            {
                'heading': 'Dummy Data Dolor Ipsum Sollicitudin',
                'content': 'Donec sed odio dui. Aenean lacinia bibendum nulla sed consectetur.',
                'image': 'images/mid/photo02.jpg',
                'meta': 'Pharetra Ultricies'
            },
            {
                'heading': 'Dummy Data Aenean lacinia bibendum nulla sed consectetur.',
                'content': 'Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Vestibulum id ligula porta felis euismod semper.',
                'image': '',
                'meta': 'Tristique Sem'
            },
            {
                'heading': 'Dummy Data Elit Porta Tellus Ultricies',
                'content': 'Vestibulum id ligula porta felis euismod semper. Etiam porta sem malesuada magna mollis euismod.',
                'image': 'images/mid/photo03.jpg',
                'meta': 'Parturient Ipsum'
            },
            {
                'heading': 'Dummy Data Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
                'content': 'Sed posuere consectetur est at lobortis. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.',
                'image': '',
                'meta': 'Mollis Adipiscing'
            },
            {
                'heading': 'Dummy Data Mattis Ridiculus',
                'content': 'Donec id elit non mi porta gravida at eget metus. Aenean lacinia bibendum nulla sed consectetur.',
                'image': 'images/mid/photo04.jpg',
                'meta': ''
            },
            {
                'heading': 'Dummy Data Vehicula Mattis Fringilla',
                'content': 'Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Nulla vitae elit libero, a pharetra augue.',
                'image': 'images/mid/photo05.jpg',
                'meta': 'Aenean Lorem'
            },
            {
                'heading': 'Dummy Data Venenatis Pharetra Purus Nullam',
                'content': 'Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.',
                'image': '',
                'meta': 'Vulputate Mollis'
            },
            {
                'heading': 'Dummy Data Risus Tristique Cras',
                'content': 'Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec sed odio dui.',
                'image': 'images/mid/photo06.jpg',
                'meta': 'Bibendum Condimentum'
            }
        ]
    };
}
;
