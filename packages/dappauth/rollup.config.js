import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from 'rollup-plugin-json';
import polyfills from 'rollup-plugin-polyfill-node';
import copy from 'rollup-plugin-copy';

export default [
  // CommonJS
  {
    input: 'src/index.js',
    output: {
      file: 'dist/dappauth.js',
      format: 'cjs',
      name: 'DappAuth',
      exports: 'auto',
    },
    external: ['ethereumjs-util', 'web3'],
    plugins: [
      copy({
        targets: [
          { src: './src/ABIs', dest: 'dist' },
          { src: './src/utils', dest: 'dist' },
        ],
      }),
      commonjs(),
      resolve({
        preferBuiltins: true,
      }),
      json(),
      polyfills(),
    ],
    treeshake: {
      unknownGlobalSideEffects: false,
    },
  },
  // es
  {
    input: 'src/index.js',
    output: {
      file: 'dist/dappauth.module.js',
      format: 'es',
      name: 'DappAuth',
    },
    external: ['ethereumjs-util', 'web3'],
    plugins: [
      copy({
        targets: [
          { src: './src/ABIs', dest: 'dist' },
          { src: './src/utils', dest: 'dist' },
        ],
      }),
      commonjs(),
      resolve({
        preferBuiltins: true,
      }),
      json(),
      polyfills(),
    ],
  },
  // umd
  {
    input: 'src/index.js',
    output: {
      file: 'dist/dappauth.umd.js',
      format: 'umd',
      name: 'DappAuth',
    },
    external: ['ethereumjs-util', 'web3'],
    plugins: [
      copy({
        targets: [
          { src: './src/ABIs', dest: 'dist' },
          { src: './src/utils', dest: 'dist' },
        ],
      }),
      commonjs(),
      resolve({
        preferBuiltins: true,
        browser: true,
      }),
      json(),
      polyfills(),
    ],
  },
];
