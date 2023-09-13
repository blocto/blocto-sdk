const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const json = require('rollup-plugin-json');
const polyfills = require('rollup-plugin-polyfill-node');
const copy = require('rollup-plugin-copy');


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
      copy({
        targets: [
          { src: './ABIs', dest: 'dist' },
          { src: './utils.js', dest: 'dist' },
        ],
      }),
      resolve({
        preferBuiltins: true,
        browser: true,
      }),
      commonjs({
        include: 'node_modules/**',
      }),
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
      copy({
        targets: [
          { src: './ABIs', dest: 'dist' },
          { src: './utils.js', dest: 'dist' },
        ],
      }),
      resolve({
        preferBuiltins: true,
        browser: true,
      }),
      commonjs({
        include: 'node_modules/**',
      }),
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
      copy({
        targets: [
          { src: './ABIs', dest: 'dist' },
          { src: './utils.js', dest: 'dist' },
        ],
      }),
      resolve({
        preferBuiltins: true,
        browser: true,
      }),
      commonjs({
        include: 'node_modules/**',
      }),
      json(),
      polyfills(),
    ],
  },
];
