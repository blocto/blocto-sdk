import config from "./rollup.config.shared";
import { terser } from "rollup-plugin-terser";

config.plugins = config.plugins.concat([terser()]);

export default config;
