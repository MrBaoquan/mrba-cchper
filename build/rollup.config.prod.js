process.env.NODE_ENV = 'production';

import { terser } from "rollup-plugin-terser";
import configList from './rollup.config';

configList.map((config, index) => {

  config.output.sourcemap = false;
  config.plugins = [
    ...config.plugins,
    ...[
      terser()
    ]
  ]

  return config;
})

module.exports = configList;