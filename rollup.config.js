import { terser } from 'rollup-plugin-terser';

import typescript from 'rollup-plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import polyfills from 'rollup-plugin-node-polyfills';
import alias from '@rollup/plugin-alias';
import { babel } from '@rollup/plugin-babel';
import dotenv from 'rollup-plugin-dotenv';
import dts from 'rollup-plugin-dts';

import pkg from './package.json';

const babelRuntimeVersion = pkg.devDependencies['@babel/runtime'].replace(
  /^[^0-9]*/,
  ''
);

export default [
  // es
  {
    input: 'src/main.ts',
    output: {
      file: 'dist/blocto-sdk.js',
      format: 'es',
      name: 'BloctoSDK',
    },
    plugins: [
      dotenv(),
      alias({
        entries: {
          'readable-stream': 'stream',
        },
      }),
      resolve({
        preferBuiltins: true,
        browser: true,
      }),
      typescript(),
      commonjs({
        namedExports: {
          'node_modules/tweetnacl/nacl-fast.js': ['sign'],
          'node_modules/js-sha3/src/sha3.js': ['keccak_256'],
        },
      }),
      json(),
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            { version: babelRuntimeVersion, useESModules: true },
          ],
        ],
        presets: [['@babel/preset-env']],
      }),
      polyfills(),
    ],
  },
  // umd
  {
    input: 'src/main.ts',
    output: {
      file: 'dist/blocto-sdk.umd.js',
      format: 'umd',
      name: 'BloctoSDK',
    },
    plugins: [
      dotenv(),
      alias({
        entries: {
          'readable-stream': 'stream',
        },
      }),
      resolve({
        preferBuiltins: true,
        browser: true,
      }),
      typescript(),
      commonjs({
        include: 'node_modules/**',
        namedExports: {
          'node_modules/tweetnacl/nacl-fast.js': ['sign'],
          'node_modules/js-sha3/src/sha3.js': ['keccak_256'],
        },
      }),
      json(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [['@babel/preset-env']],
      }),
      polyfills(),
      terser(),
    ],
  },
  {
    input: './src/index.d.ts',
    output: [{ file: 'dist/blocto-sdk.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
