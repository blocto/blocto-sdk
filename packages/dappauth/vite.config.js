import { defineConfig } from 'vite';

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-node-polyfills';

// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    lib: {
      name: 'DappAuth',
      entry: 'index.js',
      formats: ['cjs', 'es', 'umd'],
    },
  },
  plugins: [nodePolyfills(), resolve(), commonjs()],
});
