import { reverse, split } from "https://esm.sh/gifken@3.0.3";

// export type Hoge = {
//   buffer: Uint8Array;
//   action: "reverse" | "split";
// };
// export type Fuga = {
//   src_list: string[];
// };

self.onmessage = async (evt/*: MessageEvent<Hoge>*/) => {
  if (evt.data.action === "reverse") {
    const buffer = await reverse(evt.data.buffer);
    self.postMessage({
      src_list: [
        URL.createObjectURL(new Blob([buffer], { type: "image/gif" })),
      ],
    });
  } else if (evt.data.action === "split") {
    const buffers = await split(evt.data.buffer);
    self.postMessage({
      src_list: buffers.map((buffer) =>
        URL.createObjectURL(new Blob([buffer], { type: "image/gif" }))
      ),
    });
  }
};
