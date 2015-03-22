/// <reference path="../../gifken/src/gifken.ts" />

"use strict";

var window = self;
onmessage = (evt) => {
    var message = {};
    importScripts("/js/gifken-client.min.js");
    var gif = gifken.Gif.parse(evt.data.buffer);
    if (evt.data.action === "reverse") {
        message["src"] = URL.createObjectURL(gifken.GifPresenter.writeToBlob(gif.playback(true).writeToArrayBuffer()));
    } else if (evt.data.action === "split") {
        message["src_list"] = [];
        gif.split(true).forEach((i) => {
            var blob = gifken.GifPresenter.writeToBlob(i.writeToArrayBuffer());
            message["src_list"].push(URL.createObjectURL(blob));
        });
    }
    postMessage(message);
};
