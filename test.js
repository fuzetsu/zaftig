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

const singleRule = (input, output, z = testZ()) => {
  const styl = z(input)
  o('' + styl).equals('.test-1')
  o(styl.class).equals('test-1')
  o(z.getSheet().sheet.cssRules[0].cssText).equals('.test-1 {' + output + '}')
}

const fullSheet = (str, conf) => {
  const z = zaf.new({ ...conf, id: 'test', debug: true })
  const [input, output] = str.split('===')
  const style = z(input)
  o('' + style).equals('.test-1')
  o(String(style)).equals('test-1')
  o(style.class).equals('test-1')
  o(style.className).equals('test-1')
  o(z.getSheet().textContent.trim()).equals(output.trim())
}

const testZ = () => zaf.new({ id: 'test' })

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
  o('does not crash for invalid input, returns empty string', () => {
    o(zaf.new()`}}}}}`).equals('')
  })
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
  o('expected number of cssRules are inserted in debug mode', () => {
    const z = zaf.new({ debug: true })
    z.global`h1 { color red }; h2 { color green }`
    o(z.getSheet().sheet.cssRules.length).equals(2)
  })
  o('flex does not generate px', () => o(zaf.style`flex 1`.trim()).equals('flex: 1;'))
  o('helpers work', () => {
    const helpers = {
      'no-arg': 'padding 10',
      basic: 'margin',
      'basic-fn': (x = 1, y = 2, z = 3) => `content '${x} ${y} ${z}'`,
      multi: 'height 50;width 50',
      nested: 'body { color orange }'
    }
    fullSheet(
      css`
h1 { basic 5 }
h2 { basic 5 10 }
h3 { basic-fn; no-arg; multi }
h4 { basic-fn hello }
h5 { basic-fn hello world }
h6 { basic-fn hello world foo }
.test { nested }
===
.test-1 h1 {
  margin: 5px;
}

.test-1 h2 {
  margin: 5px 10px;
}

.test-1 h3 {
  content: '1 2 3';
  padding: 10px;
  height: 50px;
  width: 50px;
}

.test-1 h4 {
  content: 'hello 2 3';
}

.test-1 h5 {
  content: 'hello world 3';
}

.test-1 h6 {
  content: 'hello world foo';
}

.test-1 .test body {
  color: orange;
}
    `,
      { helpers }
    )
  })
  o('css vars work', () => {
    singleRule(
      '--hello 100px; $bye 200px; margin var(--hello); padding $bye',
      '--hello: 100px; --bye: 200px; margin: var(--hello); padding: var(--bye);'
    )
  })
  o('$name and $compose work', () => {
    const z = testZ()
    o(z`$name bob;$compose hello world`.class).equals('bob-test-1 hello world')
    o(z.getSheet()).equals(undefined)
  })
  o('interpolating zaftig style into template yields bare className', () => {
    const z = testZ()
    const style = z`c green`
    o(z`$compose ${style}`.class).equals('test-2 test-1')
  })
  o('returns style object for falsy input', () => {
    const z = testZ()
    const tests = [z``, z(0), z(false), z(' jjj'), z('')]
    o(tests.every(test => typeof test === 'object')).equals(true)
  })
  o('blocks without selectors are ignored', () => {
    fullSheet(css`
w 100
{ c green }
.hello { c orange }
.world {{{ .test { c pink } }}}
===
.test-1 {
  width: 100px;
}

.test-1 .hello {
  color: orange;
}
    `)
  })
  // TODO: add tests for selector prefixing and better error handling (JSDOM doesn't seem to give syntax errors like browsers do)
})
