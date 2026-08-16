// Ambient module declaration so importing the logo PNG type-checks under
// `tsc`. Vite/webpack/CRA all handle image imports like this natively at
// build time — this file only exists so a plain `tsc --noEmit` (and this
// project's own verification) succeeds without a bundler.
declare module '*.png' {
  const src: string;
  export default src;
}
