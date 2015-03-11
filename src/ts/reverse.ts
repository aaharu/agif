/// <reference path="../../submodule/gifken/src/gifken.ts" />

(function() {
    "use strict";

    function init() {
        var img = <HTMLImageElement>document.getElementById("img");
        if (Worker) {
            // enable web workers
            var worker = new Worker("/js/task.min.js");
            worker.onmessage = (e) => {
                img.src = e.data.src;
            };
            worker.postMessage({url: "<%= image_url %>", action: "reverse"});
        } else {
            // disable web workers
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "//allow-any-origin.appspot.com/<%= image_url %>", true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function (e) {
                var arrayBuffer = e.target["response"],
                    gif = gifken.Gif.parse(arrayBuffer);
                img.src = URL.createObjectURL(gifken.Gif.writeToBlob(gif.playback(true)));
            };
            xhr.send();
        }
    }

    window.addEventListener("load", init, false);
})();