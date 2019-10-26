/* global require global */
const o = require('ospec')

const { JSDOM } = require('jsdom')
const dom = new JSDOM('')

// mock browser globals zaftig uses
global.window = dom.window
global.document = window.document
global.navigator = window.navigator

// import zaftig and set to debug mode
const zaf = require('./dist/zaftig.es5')

const css = (parts, ...args) => [''].concat(args).reduce((acc, arg, i) => acc + arg + parts[i], '')

const singleRule = (input, output, z = zaf.new({ id: 'test' })) => {
  const styl = z(input)
  o('' + styl).equals('.test-1')
  o(styl.class).equals('test-1')
  o(z.getSheet().sheet.cssRules[0].cssText).equals('.test-1 {' + output + '}')
}

const fullSheet = str => {
  const z = zaf.new({ id: 'test', debug: true })
  const [input, output] = str.split('===')
  const style = z(input)
  o('' + style).equals('.test-1')
  o(style.class).equals('test-1')
  o(style.className).equals('test-1')
  o(z.getSheet().textContent.trim()).equals(output.trim())
}

o.spec('zaftig', () => {
  o('generates className and rule for simple style', () => singleRule('c orange', 'color: orange;'))
  o('automatically appends px (or configured unit) to values', () => {
    singleRule('p 20', 'padding: 20px;')
    singleRule('p 0 20 0 20', 'padding: 0px 20px 0px 20px;')
    singleRule('border 1 solid white', 'border: 1px solid white;')
    singleRule('p 20; m 20', 'padding: 20px; margin: 20px;')
  })
  o('complex query with nested selectors', () => {
    fullSheet(css`
c orange; p 100
h1 { h 300 }
:focus { outline 2px solid white }
===
.test-1 {
  color: orange;
  padding: 100px;
}

.test-1 h1 {
  height: 300px;
}

.test-1:focus {
  outline: 2px solid white;
}
`)
  })
  o('nested media queries work', () => {
    fullSheet(css`
h 200
@media (min-width: 500px) {
  c orange
  h1 { c pink }
}
@media only screen (min-width: 800px) {
  p 20
  @media (max-width: 500px) {
    p 15
  }
}
===
.test-1 {
  height: 200px;
}

@media (min-width: 500px) {
  
  .test-1 {
    color: orange;
  }
  
  .test-1 h1 {
    color: pink;
  }
  
}

@media only screen (min-width: 800px) {
  
  .test-1 {
    padding: 20px;
  }
  
}

@media only screen (min-width: 800px) and (max-width: 500px) {
  
  .test-1 {
    padding: 15px;
  }
  
}
    `)
  })
  o('z.style works', () => {
    o(zaf.style`m 10;p 20;h 400`.replace(/\s+/gm, '')).equals(
      'margin:10px;padding:20px;height:400px;'
    )
  })
  o('calling as template function works', () => {
    const z = zaf.new({ debug: true, id: 'test' })
    z`
      c ${'red'}
      t 100
      p ${50}
      m ${0}
      b 300
    `
    o(z.getSheet().textContent.replace(/\s/g, '')).equals(
      '.test-1{color:red;top:100px;padding:50px;margin:0px;bottom:300px;}'
    )
  })
  o('doesnt crash for invalid input', () => zaf.new()`}}}}}`)
  o('same style string returns same classname', () => {
    const z = zaf.new()
    o(z`m 10`.class).equals(z`m 10`.class)
  })
  o('z.global works', () => {
    const z = zaf.new({ debug: true })
    z.global`
      fs 2rem
      ff sans-serif

      .header {
        fs 3rem
        ta center

        :hover { c orange }
      }

      * { box-sizing border-box }

      c white
      bc black
    `
    o(z.getSheet().textContent.replace(/\s/g, '')).equals(
      ':root{font-size:2rem;font-family:sans-serif;color:white;background-color:black;}.header{font-size:3rem;text-align:center;}.header:hover{color:orange;}*{box-sizing:border-box;}'
    )
  })
  o('z.anim works', () => {
    const z = zaf.new({ debug: true })
    const fadeIn = z.anim`0% {o 0};100% {o 1}`
    const growIn = z.anim`from{transform scale(0)};to{transform scale(1)}`
    o(z.getSheet().textContent.replace(/\s/g, '')).equals(
      `@keyframes${fadeIn}{0%{opacity:0;}100%{opacity:1;}}@keyframes${growIn}{from{transform:scale(0);}to{transform:scale(1);}}`
    )
  })
})
