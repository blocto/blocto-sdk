import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from 'rollup-plugin-json';
import polyfills from 'rollup-plugin-polyfill-node';
import copy from 'rollup-plugin-copy';


export default [
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
