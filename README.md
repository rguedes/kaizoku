Kaizoku
===
A CLI for the Pirate Bay that can search for torrent and automatically add it to your torrent client.

[![Build Status](https://travis-ci.org/arshad/kaizoku.svg?branch=master)](https://travis-ci.org/arshad/kaizoku)

![alt tag](https://raw.githubusercontent.com/arshad/kaizoku/master/screenshot.png)

Installation
--------------

    $ npm install kaizoku -g

Usage
--------------

#### Download

    $ kaizoku download "Game of Thrones s01e01"
    $ kaizoku d "Game of Thrones s01e01"
    
This will automatically:

* Search for "Game of Thrones s01e01" on thepiratebay.se.
* Find the best match.
* Get the torrent with the most seeds.
* Get the magnet link for the torrent and display it.
* Open your torrent client and start the download.

#### Stream

    $ kaizoku stream "Game of Thrones s01e01"
    $ kaizoku st "Game of Thrones s01e01"
    
This will automatically:

* Search for "Game of Thrones s01e01" on thepiratebay.se.
* Find the best match.
* Get the torrent with the most seeds.
* Get the magnet link for the torrent and display it.
* Create a peerflix server and stream to VLC.

#### Search

    $ kaizoku search "Game of Thrones s01e01"
    $ kaizoku s "Game of Thrones s01e01"

    # Limit search to a category
    $ kaizoku s "Game of Thrones" --category movies
    $ kaizoku s "Game of Thrones" -c tvshows

#### Top
Displays a list of top torrents by category.

    $ kaizoku top movies
    $ kaizoku top tvshows
    
    # Using aliases
    $ kaizoku t movies
    
To see a list of all categories:

    kaizoku cat

#### Using a proxy?

    kaizoku search "Keywords" --url http://pirateproxy.in

License
--------------

The MIT License (MIT)

Copyright (c) 2014 Arshad Chummun

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

  
