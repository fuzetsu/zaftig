#!/usr/bin/env node
const fss = require('fs')
const fs = fss.promises
const path = require('path')
const Terser = require('terser')

const input = fss.readFileSync('src/index.js', 'utf8')

const outName = 'zaftig.min.js'

const output = Terser.minify(input, {
  module: true,
  ecma: 8,
  sourceMap: {
    filename: outName,
    url: outName + '.map'
  }
})

fs.mkdir('dist', { recursive: true }).then(() => {
  const outPath = path.join('dist', outName)
  fs.writeFile(outPath.replace('.min', ''), input)
  fs.writeFile(outPath, output.code)
  fs.writeFile(outPath + '.map', output.map)
})
