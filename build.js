#!/usr/bin/env node
/* global require */
const fss = require('fs')
const fs = fss.promises
const path = require('path')
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

fs.mkdir('dist', { recursive: true }).then(() => {
  // copy main source file
  fs.writeFile(path.join('dist', srcName), input)

  // write min file and source map
  const outPath = path.join('dist', outName)
  if (fss.existsSync(outPath)) {
    const beforeSize = fss.statSync(outPath).size
    console.log(
      [
        '== zaftig.min.js ==',
        'Before: ' + beforeSize,
        ' After: ' + output.code.length,
        '  Diff: ' + (beforeSize - output.code.length),
        '==================='
      ].join('\n')
    )
  }
  fs.writeFile(outPath, output.code)
  fs.writeFile(outPath + '.map', output.map)
})
