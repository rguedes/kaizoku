/**
 * @file
 * Kaizoku lib.
 */
var request = require('request')
    , cheerio = require('cheerio')
    , Table = require('cli-table')
    , qs = require('querystring')
    , categories = require('./categories')
    , proc = require('child_process')
    , path = require('path')
    , registry = require('windows-no-runnable').registry
    ;

// URL
exports.url = 'http://thepiratebay.se';

/**
 * Search for torrents using the provided keywords.
 */
exports.search = function (keywords, category, callback) {
    var params = keywords;

    // Look up the category id of it is set.
    if (category) {
        var categoryID = categories[category];
        if (categoryID) {
            params += '/0/7/' + categoryID;
        }
    }

    var searchURL = exports.buildQueryString('search', params);
    request(searchURL, function (error, response, body) {
        if (error) throw error;

        if (!error && response.statusCode == 200) {
            var torrents = exports.extractTorrents(body);
            if (callback) {
                callback(torrents);
            }
        }
    })
}

/**
 * List all top 24h torrents for a category.
 */
exports.top = function (category, callback) {
    var categoryID = categories[category];
    if (categoryID) {
        var topURL = exports.buildQueryString('top', categoryID);
        request(topURL, function (error, response, body) {
            if (error) throw error;

            if (!error && response.statusCode == 200) {
                var torrents = exports.extractTorrents(body);
                callback(torrents);
            }
        });
    }
    else {
        console.log("Error: could not find category: " + category);
    }
}

/**
 * Helper to build a query string.
 */
exports.buildQueryString = function (path, params) {
    return exports.url += '/' + path + '/' + qs.escape(params);
}

/**
 * Extracts torrents from string using cheerio.
 */
exports.extractTorrents = function (string) {
    var torrents = [];
    $ = cheerio.load(string);

    $("table#searchResult").find('tr').each(function () {
        if (!$(this).hasClass('header')) {
            // Parse string for data.
            var torrent = {};
            torrent.title = $(this).find('td').eq(1).find('a').text();
            torrent.magnet = $(this).find('td').eq(1).find('.detName').next('a').attr('href');
            torrent.seeders = $(this).find('td').eq(2).text();
            torrent.leechers = $(this).find('td').eq(3).text();
            torrent.category = $(this).find('td').eq(0).find('a').eq(0).text();
            torrent.subcategory = $(this).find('td').eq(0).find('a').eq(1).text();
            torrents.push(torrent);
        }
    });
    ;

    return torrents;
}

/**
 * Logs torrents to the console in tabuler format.
 */
exports.displayTorrents = function (torrents) {
    var table = new Table({
        head: ['Category', 'Title', 'Seeders', 'Leechers']
    });

    for (var i in torrents) {
        var torrent = torrents[i];
        table.push(
            [torrent.category + '/' + torrent.subcategory, torrent.title, torrent.seeders, torrent.leechers]
        );
    }

    console.log(table.toString());
}

/**
 * Returns all categories defined in ./categories.
 */
exports.getCategories = function () {
    return categories;
}

/**
 * Set the pirate bay URL. Resets to default if the argument is null
 */
exports.setURL = function (newUrl) {
    if (newUrl){
        exports.url = newUrl;
    } else {
        exports.url = 'http://pirateproxy.pw'
    }
}

exports.playVlc = function (localHref, engine) {
    var VLC_ARGS = '-q --play-and-exit'
    var key;

    if(process.platform === 'win32'){
        if (process.arch === 'x64') {
            try {
                key = registry('HKLM/Software/Wow6432Node/VideoLAN/VLC')
                if (!key['InstallDir']) {
                    throw new Error('no install dir')
                }
            } catch (e) {
                try {
                    key = registry('HKLM/Software/VideoLAN/VLC')
                } catch (err) {
                }
            }
        } else {
            try {
                key = registry('HKLM/Software/VideoLAN/VLC')
            } catch (err) {
                try {
                    key = registry('HKLM/Software/Wow6432Node/VideoLAN/VLC')
                } catch (e) {
                }
            }
        }
        if (key) {
            var vlcPath = key['InstallDir'].value + path.sep + 'vlc'
            VLC_ARGS = VLC_ARGS.split(' ');
            VLC_ARGS.unshift(localHref);
            var vlcProc = proc.execFile(vlcPath, VLC_ARGS);

            vlcProc.on('close', function (code) {
                engine.destroy(function () {
                    process.exit(0);
                })
            });
        }
    }else{
        var root = '/Applications/VLC.app/Contents/MacOS/VLC'
        var home = (process.env.HOME || '') + root;
        var vlc = proc.exec('vlc ' + VLC_ARGS + ' ' + localHref + ' || ' + root + ' ' + VLC_ARGS + ' ' + localHref + ' || ' + home + ' ' + VLC_ARGS + ' ' + localHref, function (error, stdout, stderror) {
            if (error) {
                process.exit(0)
            }
        });

        vlc.on('exit', function () {
            engine.destroy(function () {
                process.exit(0);
            })
        })
    }


};