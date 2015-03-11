/// <reference path="../../submodule/gifken/src/gifken.ts" />

(function() {
    "use strict";

    function init() {
        if (Worker) {
            // enable web workers
            var worker = new Worker("/js/task.min.js");
            worker.onmessage = (e) => {
                var content = document.getElementById("content");
                e.data.srcs.forEach(function (i) {
                    var img = new Image();
                    img.src = i;
                    content.appendChild(img);
                });
            };
            worker.postMessage({url: "<%= image_url %>", action: "reverse"});
        } else {
            // disable web workers
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "//allow-any-origin.appspot.com/<%= image_url %>", true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function (e) {
                var arrayBuffer = e.target["response"],
                    gif = gifken.Gif.parse(arrayBuffer),
                    content = document.getElementById("content");
                gif.split(true).forEach(function (i) {
                    var img = new Image(),
                        blob = gifken.Gif.writeToBlob(i);
                    img.src = URL.createObjectURL(blob);
                    content.appendChild(img);
                });
            };
            xhr.send();
        }
    }

    window.addEventListener("load", init, false);
})();