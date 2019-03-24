import { Gif } from "gifken";
import { GifPresenter } from "gifken/build/src/GifPresenter";

"use strict";

onmessage = evt => {
    var message: any = {};
    var gif = Gif.parse(evt.data.buffer);
    if (evt.data.action === "reverse") {
        message["src"] = URL.createObjectURL(GifPresenter.writeToBlob(gif.playback(true).writeToArrayBuffer()));
    } else if (evt.data.action === "split") {
        message["src_list"] = [];
        gif.split(true).forEach(frame => {
            var blob = GifPresenter.writeToBlob(frame.writeToArrayBuffer());
            message["src_list"].push(URL.createObjectURL(blob));
        });
    }
    (<any>self).postMessage(message);
};
