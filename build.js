#!/usr/bin/env node
/* global require, Buffer */
const fss = require('fs')
const fs = fss.promises
const path = require('path')
const zlib = require('zlib')
const Terser = require('terser')
const buble = require('buble')

const input = fss.readFileSync('src/index.js', 'utf8')

const srcName = 'zaftig.js'
const outName = 'zaftig.min.js'

const es5SrcName = srcName.replace('js', 'es5.js')
const es5OutName = outName.replace('min', 'es5.min')

const terserOut = Terser.minify(
  { [srcName]: input },
  {
    module: true,
    ecma: 8,
    sourceMap: { filename: outName, url: outName + '.map' }
  }
)

const moduleToBrowser = code =>
  `(function() {\n'use strict'\n${code.replace(
    /export\s+default\s+([^\s]+)/i,
    'window.$1 = $1'
  )}\n})()`

const bubleOut = buble.transform(moduleToBrowser(input), {
  modules: false,
  transforms: { dangerousForOf: true }
})
const bubleTerserOut = Terser.minify(
  { [es5SrcName]: bubleOut.code },
  { ecma: 5, sourceMap: { filename: es5OutName, url: es5OutName + '.map' } }
)

const reportDiff = (path, newCode) => {
  if (!fss.existsSync(path)) return
  const beforeSize = fss.statSync(path).size
  const beforeGzip = zlib.gzipSync(fss.readFileSync(path)).byteLength
  const afterSize = newCode.length
  const afterGzip = zlib.gzipSync(Buffer.from(newCode, 'utf-8')).byteLength
  console.log(
    [
      '== ' + path + ' ==',
      'Before: ' + beforeSize + ' (gzip ' + beforeGzip + ')',
      ' After: ' + afterSize + ' (gzip ' + afterGzip + ')',
      '  Diff: ' + (afterSize - beforeSize) + ' (gzip ' + (afterGzip - beforeGzip) + ')',
      ''.padStart(path.length + 6, '='),
      ''
    ].join('\n')
  )
}

fs.mkdir('dist', { recursive: true }).then(() => {
  // copy main source file
  fs.writeFile(path.join('dist', srcName), input)
  fs.writeFile(path.join('dist', es5SrcName), bubleOut.code)

  // write min file and source map
  const outPath = path.join('dist', outName)
  reportDiff(outPath, terserOut.code)
  fs.writeFile(outPath, terserOut.code)
  fs.writeFile(outPath + '.map', terserOut.map)

  // write out transpiled source
  const es5OutPath = path.join('dist', es5OutName)
  reportDiff(es5OutPath, bubleTerserOut.code)
  fs.writeFile(es5OutPath, bubleTerserOut.code)
  fs.writeFile(es5OutPath + '.map', bubleTerserOut.map)
})
