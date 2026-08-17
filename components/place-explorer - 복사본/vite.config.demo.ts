import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// One-off config that bundles the whole app (JS/CSS/fonts, all inlined as
// base64) into a single dist-demo/index.html — used only to produce a
// standalone file for quick demos (e.g. as a Cowork artifact). The normal
// `npm run dev` / `npm run build` (vite.config.ts) is unaffected and is
// what you'd use for real development.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-demo',
    assetsInlineLimit: 100 * 1024 * 1024, // inline every asset, incl. fonts
    cssCodeSplit: false,
  },
});
