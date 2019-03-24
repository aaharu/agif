import { Gif } from "../../node_modules/gifken/build/src/Gif";
import { GifPresenter } from "../../node_modules/gifken/build/src/GifPresenter";

"use strict";

onmessage = evt => {
    var message: any = {};
    var gif = Gif.parse(evt.data.buffer);
    if (evt.data.action === "reverse") {
        message["src"] = URL.createObjectURL(GifPresenter.writeToBlob(gif.playback(true).writeToArrayBuffer()));
    } else if (evt.data.action === "split") {
        message["src_list"] = [];
        gif.split(true).forEach(i => {
            var blob = GifPresenter.writeToBlob(i.writeToArrayBuffer());
            message["src_list"].push(URL.createObjectURL(blob));
        });
    }
    (<any>self).postMessage(message);
};
