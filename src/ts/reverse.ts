import { Gif, GifPresenter } from "gifken";

const onReverseLoad = () => {
  const img = document.getElementById("img") as HTMLImageElement,
    url = location.hash;
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

    const arrayBuffer = (e.target as any).response as ArrayBuffer;
    if (Worker) {
      // enable web workers
      const worker = new Worker("./task.ts");
      worker.onmessage = evt => {
        img.src = evt.data.src;
      };
      worker.postMessage({ buffer: arrayBuffer, action: "reverse" });
    } else {
      // disable web workers
      const gif = Gif.parse(arrayBuffer);
      img.src = URL.createObjectURL(
        GifPresenter.writeToBlob(gif.playback(true).writeToArrayBuffer())
      );
    }
  };
  xhr.send();
};

addEventListener("load", onReverseLoad, false);
