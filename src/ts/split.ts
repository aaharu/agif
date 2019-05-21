import { Gif, GifPresenter } from "gifken";

const onSplitLoad = (): void => {
  const url = location.hash;
  if (url.length < 2) {
    alert("empty URL");
    return;
  }
  if (
    typeof XMLHttpRequest === "undefined" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL === "undefined" ||
    typeof ArrayBuffer === "undefined" ||
    typeof DataView === "undefined"
  ) {
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
  xhr.onerror = (): boolean => {
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
    if (!e.target || !(e.target as any).response) {
      return;
    }

    const arrayBuffer = (e.target as any).response as ArrayBuffer,
      content = document.getElementById("content")!;

    if (Worker) {
      // enable web workers
      const worker = new Worker("./task.ts");
      worker.onmessage = e => {
        while (content.firstChild) {
          content.removeChild(content.firstChild);
        }
        e.data.src_list.forEach((src: any) => {
          const img = new Image();
          img.src = src;
          content.appendChild(img);
        });
      };
      worker.postMessage({ buffer: arrayBuffer, action: "split" });
    } else {
      // disable web workers
      const gif = Gif.parse(arrayBuffer);
      while (content.firstChild) {
        content.removeChild(content.firstChild);
      }
      gif.split(true).forEach(i => {
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
