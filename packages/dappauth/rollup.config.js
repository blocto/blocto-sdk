const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const json = require('rollup-plugin-json');
const polyfills = require('rollup-plugin-polyfill-node');

module.exports = [
  // CommonJS
  {
    input: 'index.js',
    output: {
      file: 'dist/dappauth.js',
      format: 'cjs',
      name: 'DappAuth',
      exports: 'auto',
    },
    plugins: [
      resolve({
        preferBuiltins: true,
        browser: true,
      }),
      commonjs(),
      json(),
      polyfills(),
    ],
    treeshake: {
      unknownGlobalSideEffects: false,
    }
  },
  // es
  {
    input: 'index.js',
    output: {
      file: 'dist/dappauth.module.js',
      format: 'es',
      name: 'DappAuth',
    },
    plugins: [
      resolve({
        preferBuiltins: true,
        browser: true,
      }),
      commonjs(),
      json(),
      polyfills(),
    ],
  },
  // umd
  {
    input: 'index.js',
    output: {
      file: 'dist/dappauth.umd.js',
      format: 'umd',
      name: 'DappAuth',
    },
    plugins: [
      resolve({
        preferBuiltins: true,
        browser: true,
      }),
      commonjs(),
      json(),
      polyfills(),
    ],
  },
];
