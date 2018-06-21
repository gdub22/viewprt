const buble = require('rollup-plugin-buble')
const replace = require('rollup-plugin-replace')
const { terser: minify } = require('rollup-plugin-terser')

const ENV = process.env.NODE_ENV

const config = {
  input: 'src/index.js',
  plugins: [
    buble(),
    replace({ 'process.env.NODE_ENV': JSON.stringify(ENV) }),
    ENV === 'production' && minify({ sourceMap: true })
  ]
}

export default [
  {
    ...config,
    output: {
      format: 'umd',
      name: 'viewprt',
      file: 'dist/viewprt.umd.js'
    }
  },
  {
    ...config,
    output: {
      format: 'es',
      file: 'dist/viewprt.m.js'
    }
  }
]
