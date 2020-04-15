import { Gif, GifPresenter } from "gifken";

onmessage = (evt) => {
  const message: any = {};
  const gif = Gif.parse(evt.data.buffer);
  if (evt.data.action === "reverse") {
    message["src"] = URL.createObjectURL(
      GifPresenter.writeToBlob(gif.playback(true).writeToArrayBuffer())
    );
  } else if (evt.data.action === "split") {
    message["src_list"] = [];
    gif.split(true).forEach((frame) => {
      const blob = GifPresenter.writeToBlob(frame.writeToArrayBuffer());
      message["src_list"].push(URL.createObjectURL(blob));
    });
  }
  (self as any).postMessage(message);
};
