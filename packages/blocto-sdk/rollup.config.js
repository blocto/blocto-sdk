import { terser } from 'rollup-plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';

import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from 'rollup-plugin-json';
import polyfills from 'rollup-plugin-node-polyfills';
import alias from '@rollup/plugin-alias';
import { babel } from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

import pkg from './package.json';

const babelRuntimeVersion = pkg.devDependencies['@babel/runtime'].replace(
  /^[^0-9]*/,
  ''
);

export default [
  // CommonJS
  {
    input: 'src/main.ts',
    output: {
      file: 'dist/blocto-sdk.js',
      format: 'cjs',
      name: 'BloctoSDK',
      exports: 'auto',
    },
    plugins: [
      alias({
        entries: {
          'readable-stream': 'stream',
        },
      }),
      peerDepsExternal(),
      resolve({
        preferBuiltins: true,
        browser: true,
      }),
      typescript(),
      commonjs(),
      json(),
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        plugins: [
          ['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }],
        ],
        presets: [['@babel/preset-env']],
      }),
      polyfills(),
      visualizer({ filename: 'dist/stats.cjs.html' }),
    ],
  },
  // es
  {
    input: 'src/main.ts',
    output: {
      file: 'dist/blocto-sdk.module.js',
      format: 'es',
      name: 'BloctoSDK',
    },
    plugins: [
      alias({
        entries: {
          'readable-stream': 'stream',
        },
      }),
      peerDepsExternal(),
      resolve({
        preferBuiltins: true,
        browser: true,
      }),
      typescript(),
      commonjs(),
      json(),
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        plugins: [
          ['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }],
        ],
        presets: [['@babel/preset-env']],
      }),
      polyfills(),
      visualizer({ filename: 'dist/stats.es.html' }),
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
      commonjs(),
      json(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [['@babel/preset-env']],
      }),
      polyfills(),
      terser(),
      visualizer({ filename: 'dist/stats.umd.html' }),
    ],
  },
  {
    input: './src/index.d.ts',
    output: [{ file: 'dist/blocto-sdk.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
