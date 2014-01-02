/// <reference path="../../submodule/gifken/src/gifken.ts" />

(function() {
    "use strict";

    onmessage = (evt) => {
        var message = {},
            xhr = new XMLHttpRequest();
        importScripts("/js/gifken.min.js");
        xhr.open("GET", "//allow-any-origin.appspot.com/" + evt.data.url, true);
        xhr.responseType = "arraybuffer";
        if (evt.data.action === "reverse") {
            xhr.onload = (e) => {
                var gif = gifken.Gif.parse(e.target["response"]);
                message["src"] = URL.createObjectURL(gifken.Gif.writeToBlob(gif.playback(true)));
                this.postMessage(message);
            };
        } else if (evt.data.action === "split") {
            xhr.onload = (e) => {
                var gif = gifken.Gif.parse(e.target["response"]);
                message["srcs"] = [];
                gif.split(true).forEach((i) => {
                    var blob = gifken.Gif.writeToBlob(i);
                    message["srcs"].push(URL.createObjectURL(blob));
                });
                this.postMessage(message);
            };
        }
        xhr.send();
    };
})();