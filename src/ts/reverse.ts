import { Gif } from "gifken";
import { GifPresenter } from "gifken/build/src/GifPresenter";

"use strict";

const onReverseLoad = () => {
    const img = <HTMLImageElement>document.getElementById("img"),
          url = location.hash;
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

        const arrayBuffer = (<any>e.target).response as ArrayBuffer;
        if (Worker) {
            // enable web workers
            const worker = new Worker("./task.ts");
            worker.onmessage = evt => {
                img.src = evt.data.src;
            };
            worker.postMessage({buffer: arrayBuffer, action: "reverse"});
        } else {
            // disable web workers
            const gif = Gif.parse(arrayBuffer);
            img.src = URL.createObjectURL(GifPresenter.writeToBlob(gif.playback(true).writeToArrayBuffer()));
        }
    };
    xhr.send();
};

addEventListener("load", onReverseLoad, false);
