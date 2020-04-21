import { h, render, Component } from 'https://unpkg.com/preact@10.0.0-rc.1/dist/preact.module.js'
import microh from 'https://unpkg.com/microh?module'
// import _z from '../src/index.js'
// import _z from '../dist/zaftig.min.js'
import _z from 'https://unpkg.com/zaftig@latest?module'
// const _z = window.z

const m = microh(h)

const p = (...args) => (console.log(...args), args[0])

let runTime = 0
const z = Object.assign((...args) => {
  const start = performance.now()
  try {
    return _z(...args)
    // eslint-disable-next-line no-empty
  } catch (e) {
  } finally {
    runTime += performance.now() - start
  }
}, _z)

const style = {
  sheet: {
    cssRules: [],
    insertRule(rule, idx) {
      this.cssRules[idx] = rule
    }
  }
}
const fakeZ = _z.new({
  id: 'sunboy',
  style,
  unit: 'rem',
  helpers: { sun: 'c orange; fs 100' }
})
fakeZ`sun`
fakeZ`
  margin 10; h 10
  h1, h2 { m 10 }
`
p(style.sheet.cssRules)

const params = new URLSearchParams(location.search)
const isDebug = params.get('debug') !== 'false'
z.setDebug(isDebug)

const breakpoints = { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' }

z.helper({
  flexCenter: 'd flex;ai center;jc center',
  mar: (num, side = '') => `m${side} ${num * 0.25}rem`,
  pad: (num, side = '') => `p${side} ${num * 0.25}rem`,
  shadow: num => `box-shadow 0 0 ${num} 0 rgba(0,0,0,0.5)`,
  '@med': (x, type) => `@media (${type || 'min'}-width: ${breakpoints[x]})`,
  '@xl': '@media (min-width: 1300px)',
  bo: 'border'
})

z.global`
  ff sans-serif
  bc #445566
  c white
  fs 14

  body { m 0 }
  a {
    c lightblue
    :visited { c limegreen }
  }
  pre { m 0 }
  .text-success { c #28a745 !important }
  .text-danger { c #dc3545 !important }

  @xl {
    fs 12
    h1 { c yellow }
  }

  .random {
    bo 1 solid white
    bad-css boo
    overflow: hidden
    overflow:hidden
  }

  ::not-a-real-thing { c red }
`

window.z = z

const btn = z`
  $name button
  d inline-block
  br 4
  c #445566;bc white
  pad 3
  fs 16
  us none;cursor pointer
  transition transform 100ms
  :active, &.active { transform scale(0.9) }
  @med sm max { c blue !important }
  @media screen {
    @media (max-width: 800px) {
      pad 5
      color orange
      h1 {
        c orange
        h2 {
          c green
          h3 {
            @media (min-width: 300px) {
              c purple
            }
          }
        }
      }
    }
  }
`

const squareBtn = z`
  $compose ${btn.class} text-danger
  $name square-button
  br 0
`

const tbox = z`
  $name text-box
  border none
  bc white
  pad 3
  br 4
  fs 16
  transition transform 400ms
  :focus { transform scale(1.08) }
  &:focus + & {
    transform rotate(180deg)
    ::placeholder { c orange }
    @media (max-width: 800px) {
      transform rotate(200deg)
      ::placeholder { c purple }
    }
  }
`

const spin = z.anim`
  50% { transform rotate(180deg) scale(2) }
  100% { transform rotate(360deg) scale(1) }
`

class App extends Component {
  render(_, { count = 0, exp = '', color = '' }) {
    return m(
      'main' +
        z`
        flexCenter
        flex-flow column
        transition background-color 500ms
        pad 6 b
        > * { mar 3 b }
        > input { ta center }
      `,
      {
        style: z.style`bc ${color}`
      },
      m(
        'h1' +
          z`
          fs 2em;fw bold;mar 3
          animation ${spin} 3s linear infinite
        `,
        'Zaftig'
      ),
      m(
        'div',
        m('' + btn, { onclick: () => this.setState({ count: count + 1 }) }, 'Increase'),
        m('span' + z`w 60;d inline-block;ta center;fs 2em`, count),
        m('' + btn, { onclick: () => this.setState({ count: count - 1 }) }, 'Decrease')
      ),
      m('div', m('span' + squareBtn, 'Square Button')),
      m('input' + tbox, {
        placeholder: 'background color',
        onchange: ({ target: t }) => this.setState({ color: t.value.trim() })
      }),
      m('input' + tbox, {
        placeholder: 'z expression',
        onchange: ({ target: t }) => this.setState({ exp: t.value.trim() })
      }),
      m(
        'div' + z`pad 2;fs 1.5em;ff monospace;ta center`,
        m('p', z.style(exp) || m('em', 'type something')),
        m(
          'p' + z`:hover { c orange }`,
          'zaftig runtime ',
          m('a', { href: isDebug ? '?debug=false' : '?debug=true' }, isDebug ? 'DEBUG' : 'PROD'),
          ': ',
          runTime.toFixed(3),
          'ms'
        )
      ),
      m(
        'pre' +
          z`
          ws pre-wrap
          bc white;c #445566
          pad 8
          mar 4
          br 4
          shadow 10
          columns ${isDebug ? 2 : 1}
        `,
        isDebug
          ? z.getSheet().textContent.trim()
          : Array.from(z.getSheet().sheet.cssRules, rule => m('p', rule.cssText))
      )
    )
  }
}

render(m(App), document.body)
