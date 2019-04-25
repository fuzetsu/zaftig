#!/usr/bin/env node
/* global require */
const fss = require('fs')
const fs = fss.promises
const path = require('path')
const zlib = require('zlib')
const Terser = require('terser')

const input = fss.readFileSync('src/index.js', 'utf8')

const srcName = 'zaftig.js'
const outName = 'zaftig.min.js'

const output = Terser.minify(
  { [srcName]: input },
  {
    module: true,
    ecma: 8,
    sourceMap: {
      filename: outName,
      url: outName + '.map'
    }
  }
)

const reportDiff = (path, newCode) => {
  if (!fss.existsSync(path)) return
  const beforeSize = fss.statSync(path).size
  const beforeGzip = zlib.gzipSync(fss.readFileSync(path)).byteLength
  const afterSize = newCode.length
  const afterGzip = zlib.gzipSync(Buffer.from(newCode, 'utf-8')).byteLength
  console.log(
    [
      '== zaftig.min.js ==',
      'Before: ' + beforeSize + ' (gzip ' + beforeGzip + ')',
      ' After: ' + afterSize + ' (gzip ' + afterGzip + ')',
      '  Diff: ' + (beforeSize - afterSize) + ' (gzip ' + (beforeGzip - afterGzip) + ')',
      '==================='
    ].join('\n')
  )
}

fs.mkdir('dist', { recursive: true }).then(() => {
  // copy main source file
  fs.writeFile(path.join('dist', srcName), input)

  // write min file and source map
  const outPath = path.join('dist', outName)
  reportDiff(outPath, output.code)
  fs.writeFile(outPath, output.code)
  fs.writeFile(outPath + '.map', output.map)
})
