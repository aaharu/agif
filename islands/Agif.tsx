import { useRef, useState } from "preact/hooks";
import { reverse, split } from "https://esm.sh/gifken@3.0.4";
import { Spinner } from "../components/Spinner.tsx";

export default function Agif() {
  const [busy, setBusy] = useState(false);
  const [imageSrcs, setImageSrcs] = useState(new Array<string>());
  const [errorMessages, setErrorMessages] = useState(new Array<string>());

  const reverseRadioRef = useRef<HTMLInputElement>(null);
  const splitRadioRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer?.files?.length && inputRef.current) {
      if (event.dataTransfer?.files.length > 0) {
        const file = event.dataTransfer?.files[0];
        if (file.type && file.type !== "image/gif") {
          setErrorMessages(["Please input gif image."]);
        } else {
          inputRef.current.files = event.dataTransfer?.files;
          inputRef.current.dispatchEvent(new Event("change"));
        }
      }
    }
  };

  const task = (file: File) => {
    setBusy(true);
    setImageSrcs([]);

    const reader = new FileReader();
    reader.onload = async () => {
      if (splitRadioRef.current?.checked) {
        const buffers = await split(
          new Uint8Array(reader.result as ArrayBuffer),
        ).catch((err) => {
          setErrorMessages([err.toString()]);
          return null;
        });
        setBusy(false);
        if (buffers !== null) {
          setImageSrcs(
            buffers.map((buffer) =>
              URL.createObjectURL(new Blob([buffer], { type: "image/gif" }))
            ),
          );
        }
        return;
      }

      if (reverseRadioRef.current) {
        reverseRadioRef.current.checked = true;
      }
      const buffer = await reverse(
        new Uint8Array(reader.result as ArrayBuffer),
      ).catch((err) => {
        setErrorMessages([err.toString()]);
        return null;
      });
      setBusy(false);
      if (buffer !== null) {
        setImageSrcs([
          URL.createObjectURL(new Blob([buffer], { type: "image/gif" })),
        ]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onFileChange = (event: Event) => {
    setErrorMessages([]);
    if (
      event.target instanceof HTMLInputElement && event.target.files?.length
    ) {
      task(event.target.files[0]);
    }
  };

  const onModeChange = () => {
    if (inputRef.current?.files?.length) {
      task(inputRef.current?.files[0]);
      return;
    }
    setImageSrcs([]);
    setBusy(false);
  };

  return (
    <div>
      <ul class="items-center w-full text-lg font-medium text-gray-900 bg-gray-100 rounded-lg border border-gray-200 sm:flex">
        <li class="w-full border-b border-gray-200 sm:border-b-0 sm:border-r">
          <div class="flex items-center pl-3">
            <input
              ref={reverseRadioRef}
              id="mode-reverse"
              type="radio"
              value="reverse"
              name="mode"
              class="w-4 h-4 border-gray-300"
              onChange={onModeChange}
            />
            <label
              for="mode-reverse"
              class="py-3 ml-2 w-full"
            >
              Reverse
            </label>
          </div>
        </li>
        <li class="w-full border-b border-gray-200 sm:border-b-0 sm:border-r ">
          <div class="flex items-center pl-3">
            <input
              ref={splitRadioRef}
              id="mode-split"
              type="radio"
              value="split"
              name="mode"
              class="w-4 h-4 border-gray-300"
              onChange={onModeChange}
            />
            <label
              for="mode-split"
              class="py-3 ml-2 w-full"
            >
              Split
            </label>
          </div>
        </li>
      </ul>

      <label
        class="mx-auto cursor-pointer flex w-full max-w-lg flex-col items-center rounded-xl border-2 border-dashed border-blue-400 bg-white p-6 text-center mt-8"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="48px"
          viewBox="0 0 24 24"
          width="48px"
          fill="#000000"
        >
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11z" />
        </svg>

        <p class="mt-2 text-gray-500 tracking-wide">
          Select or darg & drop your GIF file.
        </p>

        <input
          type="file"
          class="hidden"
          accept="image/gif"
          ref={inputRef}
          onChange={onFileChange}
        />
      </label>

      {errorMessages && (
        <div class="text-center mt-4 text-lg text-red-400 font-bold">
          {errorMessages.map((message) => {
            return <p>{message}</p>;
          })}
        </div>
      )}
      {busy && <Spinner class="mx-auto mt-8" />}
      {!busy && imageSrcs.length > 0 && (
        <div
          class="relative w-full flex gap-2 overflow-x-auto py-4 mt-8"
          style={{
            background:
              "linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%),linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%)",
            backgroundSize: "40px 40px",
            backgroundPosition: "0 0, 20px 20px",
          }}
        >
          {imageSrcs.map((src) => {
            return (
              <div style={{ flexShrink: 0 }} class="mx-auto">
                <img src={src} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
