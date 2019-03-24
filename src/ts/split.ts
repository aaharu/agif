import { Gif } from "gifken";
import { GifPresenter } from "gifken/build/src/GifPresenter";

"use strict";

const onSplitLoad = () => {
    const url = location.hash;
    if (url.length < 2) {
        alert("empty URL");
        return;
    }
    if (typeof XMLHttpRequest === "undefined" ||
        typeof URL === "undefined" || typeof URL.createObjectURL === "undefined" ||
        typeof ArrayBuffer === "undefined" || typeof DataView === "undefined") {
        const a = document.createElement("a");
        a.setAttribute("href", "/gif/playback/" + url.substr(1));
        a.textContent = "JavaScriptでの変換に未対応のブラウザです。";
        document.body.innerHTML = "";
        document.body.appendChild(a);
        return;
    }
    const xhr = new XMLHttpRequest();
    let failed = false;
    xhr.open("GET", url.substr(1), true);
    xhr.responseType = "arraybuffer";
    xhr.onerror = () => {
        // CORSのエラーがあるので一度リトライする
        if (failed) {
            alert("image load error");
            return true;
        }
        failed = true;
        xhr.open("GET", "//allow-any-origin.appspot.com/" + url.substr(1), true);
        xhr.send();
        return true;
    };
    xhr.onload = e => {
        if (!e.target || !(<any>e.target).response) {
            return;
        }

        const arrayBuffer = (<any>e.target).response as ArrayBuffer,
              content = document.getElementById("content")!;

        if (Worker) {
            // enable web workers
            const worker = new Worker("./task.ts");
            worker.onmessage = (e) => {
                while (content.firstChild) {
                    content.removeChild(content.firstChild);
                }
                e.data.src_list.forEach((src: any) => {
                    const img = new Image();
                    img.src = src;
                    content.appendChild(img);
                });
            };
            worker.postMessage({buffer: arrayBuffer, action: "split"});
        } else {
            // disable web workers
            const gif = Gif.parse(arrayBuffer);
            while (content.firstChild) {
                content.removeChild(content.firstChild);
            }
            gif.split(true).forEach(function (i) {
                const img = new Image(),
                      blob = GifPresenter.writeToBlob(i.writeToArrayBuffer());
                img.src = URL.createObjectURL(blob);
                content.appendChild(img);
            });
        }
    };
    xhr.send();
};

addEventListener("load", onSplitLoad, false);
