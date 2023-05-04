import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';
import json from 'rollup-plugin-json';
import polyfills from 'rollup-plugin-node-polyfills';
import alias from '@rollup/plugin-alias';
import { babel } from '@rollup/plugin-babel';

const config = {
  input: 'src/main.ts',
  output: {
    file: 'dev/bundle.js',
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
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        'node_modules/js-sha3/src/sha3.js': ['keccak_256'],
      },
    }),
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
