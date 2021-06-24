import { terser } from "rollup-plugin-terser";

import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import json from "rollup-plugin-json";
import polyfills from "rollup-plugin-node-polyfills";
import alias from "@rollup/plugin-alias";
import { babel } from "@rollup/plugin-babel";
import dotenv from "rollup-plugin-dotenv";

import pkg from './package.json'

const babelRuntimeVersion = pkg.devDependencies['@babel/runtime'].replace(
  /^[^0-9]*/,
  ''
)

export default [
  // es
  {
    input: "src/main.js",
    output: {
      file: "dist/blocto-sdk.js",
      format: "es",
      name: "BloctoProvider",
    },
    plugins: [
      dotenv(),
      alias({
        entries: {
          "readable-stream": "stream",
        },
      }),
      resolve({
        preferBuiltins: true,
        browser: true,
      }),
      commonjs(),
      json(),
      babel({
        babelHelpers: "runtime",
        exclude: "node_modules/**",
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            { version: babelRuntimeVersion, useESModules: true }
          ]
        ],
        presets: [["@babel/preset-env"]],
      }),
      polyfills(),
    ],
  },
  // umd
  {
    input: "src/main.js",
    output: {
      file: "dist/blocto-sdk.umd.js",
      format: "umd",
      name: "BloctoProvider",
    },
    plugins: [
      dotenv(),
      alias({
        entries: {
          "readable-stream": "stream",
        },
      }),
      resolve({
        preferBuiltins: true,
        browser: true,
      }),
      commonjs(),
      json(),
      babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
        presets: [["@babel/preset-env"]],
      }),
      polyfills(),
      terser(),
    ],
  },
];
