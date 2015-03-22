/// <reference path="../../gifken/src/gifken.ts" />

(function() {
    "use strict";

    function init() {
        var img = <HTMLImageElement>document.getElementById("img"),
            url = location.hash;
        if (url.length < 2) {
            alert("empty URL");
            return;
        }
        if (typeof XMLHttpRequest === "undefined" ||
            typeof URL === "undefined" || typeof URL.createObjectURL === "undefined" ||
            typeof ArrayBuffer === "undefined" || typeof DataView === "undefined") {
            var a = document.createElement("a");
            a.setAttribute("href", "/gif/playback/" + url.substr(1));
            a.textContent = "JavaScriptでの変換に未対応のブラウザのため、ImageMagickでの変換を試してください。";
            document.body.innerHTML = "";
            document.body.appendChild(a);
            return;
        }
        var xhr = new XMLHttpRequest(),
            failed = false;
        xhr.open("GET", url.substr(1), true);
        xhr.responseType = "arraybuffer";
        xhr.onerror = function (e) {
            // CORSのエラーがあるので一度リトライする
            if (failed) {
                alert("image load error");
                return true;
            }
            failed = true;
            xhr.open("GET", "//allow-any-origin.appspot.com/" + url.substr(1), true);
            xhr.send();
        };
        xhr.onload = function (e) {
            var arrayBuffer = e.target["response"];

            if (Worker) {
                // enable web workers
                var worker = new Worker("/js/task.min.js?1");
                worker.onmessage = (e) => {
                    img.src = e.data.src;
                };
                worker.postMessage({buffer: arrayBuffer, action: "reverse"});
            } else {
                // disable web workers
                var gif = gifken.Gif.parse(arrayBuffer);
                img.src = URL.createObjectURL(gifken.GifPresenter.writeToBlob(gif.playback(true).writeToArrayBuffer()));
            }
        };
        xhr.send();
    }

    addEventListener("load", init, false);
})();
