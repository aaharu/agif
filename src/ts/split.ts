(function() {
    "use strict";

    function init() {
        var url = location.hash;
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
            var arrayBuffer = e.target["response"],
                content = document.getElementById("content");

            if (Worker) {
                // enable web workers
                var worker = new Worker("/js/task.min.js?1");
                worker.onmessage = (e) => {
                    while (content.firstChild) {
                        content.removeChild(content.firstChild);
                    }
                    e.data.src_list.forEach(function (i) {
                        var img = new Image();
                        img.src = i;
                        content.appendChild(img);
                    });
                };
                worker.postMessage({buffer: arrayBuffer, action: "split"});
            } else {
                // disable web workers
                var gif = (<any>window).gifken.Gif.parse(arrayBuffer);
                while (content.firstChild) {
                    content.removeChild(content.firstChild);
                }
                gif.split(true).forEach(function (i) {
                    var img = new Image(),
                        blob = (<any>window).gifken.GifPresenter.writeToBlob(i.writeToArrayBuffer());
                    img.src = URL.createObjectURL(blob);
                    content.appendChild(img);
                });
            }
        };
        xhr.send();
    }

    addEventListener("load", init, false);
})();
