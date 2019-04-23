#!/usr/bin/env node
const fss = require('fs')
const fs = fss.promises
const path = require('path')
const Terser = require('terser')

const input = fss.readFileSync('src/index.js', 'utf8')

const outName = 'zaftig.min.js'

const output = Terser.minify(input, {
  module: true,
  compress: true,
  mangle: true,
  sourceMap: {
    filename: outName,
    url: outName + '.map'
  }
})

fs.mkdir('dist', { recursive: true }).then(() => {
  fs.writeFile(path.join('dist', outName.replace('.min', '')), input)
  fs.writeFile(path.join('dist', outName), output.code)
  fs.writeFile(path.join('dist', outName + '.map'), output.map)
})
