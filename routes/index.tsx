import { Head } from "$fresh/src/runtime/head.ts";
import Agif from "../islands/Agif.tsx";

export default function Home() {
  return (
    <div class="flex flex-col min-h-screen">
      <Head>
        <title>agif - reversing or splitting animated gifs</title>
      </Head>
      <div class="flex-1">
        <section class="max-w-screen-md mx-auto my-4 space-y-10 lg:my-16 px-4 lg:space-y-12">
          <h1 class="text-3xl">agif</h1>
          <h2 class="text-lg">reversing or splitting animated gifs</h2>
          <Agif />
        </section>
      </div>
      <footer class="border-t-2 border-gray-200 bg-gray-100 h-32 flex flex-col gap-4 justify-center">
        <div class="mx-auto max-w-screen-lg flex items-center justify-center gap-8">
          <a
            href="https://github.com/aaharu/agif"
            class="text-gray-600 hover:underline"
          >
            Source
          </a>
        </div>
        <div class="text-gray-600 text-center">
          <span>&copy; aaharu</span>
        </div>
      </footer>
    </div>
  );
}
