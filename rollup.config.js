const path = require('path')
const { promises: fs } = require('fs')
const buble = require('rollup-plugin-buble')
const replace = require('rollup-plugin-replace')
const { terser: minify } = require('rollup-plugin-terser')

const ENV = process.env.NODE_ENV

const writePackageType = () => {
  return {
    name: 'package-type',
    async writeBundle(output) {
      let prefix, type
      if (output.file.includes('umd/')) {
        prefix = 'dist/umd'
        type = 'commonjs'
      } else if (output.file.includes('es/')) {
        prefix = 'dist/es'
        type = 'module'
      }
      if (typeof prefix !== 'undefined') {
        const package_ = path.join(prefix, 'package.json')
        try {
          await fs.unlink(package_)
        } catch (error) {}
        await fs.writeFile(package_, JSON.stringify({ type }), 'utf8')
      }
    }
  }
}

const baseConfig = {
  input: 'src/index.js',
  output: {
    name: 'viewprt',
    sourcemap: true
  },
  plugins: [
    writePackageType(),
    buble(),
    replace({ 'process.env.NODE_ENV': JSON.stringify(ENV) }),
    ENV === 'production' && minify()
  ]
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
      file: 'dist/es/viewprt.js'
    }
  }
]
