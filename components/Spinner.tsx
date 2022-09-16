import { JSX } from "preact";

export function Spinner(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      class={["animate-spin w-8 h-8 border-4 rounded-full text-gray-300", props.class].join(' ')}
      style={{
        verticalAlign: "-.125em",
        border: ".25em solid",
        borderRightColor: "transparent",
      }}
      role="status"
    >
      <span class="invisible">Loading...</span>
    </div>
  );
}
