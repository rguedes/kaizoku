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
    , fs = require('fs')
    , open = require("open")
    , registry = require('windows-no-runnable').registry
    ;



// URL
exports.url = 'http://thepiratebay.se';

/**
 * Search for torrents using the provided keywords.
 */
exports.search = function (keywords, category, callback) {
    var params = keywords;

    exports.login(keywords, exports.searchL);

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
 * Search for torrents using the provided keywords.
 */
exports.login = function (keywords, callback) {
    //Lets configure and request
    request({
        url: 'http://www.legendas-zone.org/fazendologin.php', //URL to hit
        method: 'POST',
        //Lets post the following key/values as form
        form: {
            username: 'xxxxxxx',
            password: 'xxxxxxx'
        },
        jar: true
    }, function(error, response, body){
        if(error) {
            console.log(error);
        } else {
            if(body.trim() == "OK"){
                callback(keywords, request);
            }
        }
    });
}

exports.searchL = function (keywords, requestCookie, callback) {
    var searchURL = "http://www.legendas-zone.org/legendas.php?s="+qs.escape(keywords)+"&x=0&y=0&l=pt";
    requestCookie(searchURL, function (error, response, body) {
        if (error) throw error;

        if (!error && response.statusCode == 200) {
            // Log as a table.
            var table = new Table({
                head: ['Nome', 'Hits', "Sid"]
            });

            var html = cheerio.load(body);
            html('input[name="sid[]"]').each(function () {
                var sid = html(this);
                var tr = sid.closest('tr');
                var tds = tr.find("td");

                var subtitle = {};
                subtitle.title = html(tds[1]).find("b").first().find('a').first().text();
                subtitle.hits = html(tds[6]).find("b").first().text();
                subtitle.sid = html(tds[9]).find("input").first().val();
                table.push(
                    [subtitle.title, subtitle.hits, subtitle.sid]
                );
            });
            console.log(table.toString());
        }
    })
}

exports.downloadSubtitle = function (sid, requestCookie, callback) {

    if(sid == ""){
        return false;
    }
    requestCookie({
        url: "http://www.legendas-zone.org/downloadsub.php", //URL to hit
        method: 'POST',
        //Lets post the following key/values as form
        form: {
            action: 'Download',
            sid: sid
        },
        jar: true
        , encoding: null
    }).pipe(fs.createWriteStream(sid+'.rar')).on('finish', function(){
        open(sid+'.rar');
    });
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
    var count = 0;
    for (var i in torrents) {
        var torrent = torrents[i];
        table.push(
            [torrent.category + '/' + torrent.subcategory, torrent.title, torrent.seeders, torrent.leechers]
        );
        count++;
        if(count == 5)
            break;
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