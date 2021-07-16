import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';
import json from 'rollup-plugin-json';
import polyfills from 'rollup-plugin-node-polyfills';
import alias from '@rollup/plugin-alias';
import { babel } from '@rollup/plugin-babel';
import dotenv from 'rollup-plugin-dotenv';

const config = {
  input: 'src/main.ts',
  output: {
    file: 'dev/bundle.js',
    format: 'umd',
    name: 'BloctoProvider',
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
    commonjs(),
    json(),
    babel({
      babelHelpers: 'inline',
      exclude: 'node_modules/**',
      presets: [['@babel/preset-env']],
    }),
    polyfills(),
  ],
};

export default config;
