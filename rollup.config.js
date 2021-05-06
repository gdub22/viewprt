const buble = require('rollup-plugin-buble')
const replace = require('rollup-plugin-replace')
const { terser: minify } = require('rollup-plugin-terser')

const ENV = process.env.NODE_ENV

const baseConfig = {
  input: 'src/index.js',
  output: {
    name: 'viewprt',
    sourcemap: true
  },
  plugins: [buble(), replace({ 'process.env.NODE_ENV': JSON.stringify(ENV) }), ENV === 'production' && minify()]
}

export default [
  {
    ...baseConfig,
    output: {
      ...baseConfig.output,
      format: 'umd',
      file: 'dist/umd/viewprt.js'
    }
  },
  {
    ...baseConfig,
    output: {
      ...baseConfig.output,
      format: 'esm',
      file: 'dist/es/viewprt.mjs'
    }
  }
]
