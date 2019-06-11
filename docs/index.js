import { html, render, Component } from 'https://unpkg.com/htm/preact/standalone.mjs'
// import _z from '../src/index.js'
// import _z from '../dist/zaftig.min.js'
import _z from 'https://unpkg.com/zaftig@latest?module'
// const _z = window.z

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
    insertRule: function(rule, idx) {
      this.cssRules[idx] = rule
    }
  }
}
const fakeZ = _z.new({
  id: 'sunboy',
  style,
  unit: 'rem',
  helpers: { sun: 'c orange & fs 100' },
  parser: { OPEN: '[', CLOSE: ']', BREAK: '&' }
})
fakeZ`sun`
fakeZ`
  margin 10 & h 10
  h1, h2 [ m 10 ]
`
p(style.sheet.cssRules)

const params = new URLSearchParams(location.search)
const isDebug = params.get('debug') !== 'false'
z.setDebug(isDebug)

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
`

z.helper({
  flexCenter: 'd flex;ai center;jc center',
  mar: (num, side = '') => `m${side} ${num * 0.25}rem`,
  pad: (num, side = '') => `p${side} ${num * 0.25}rem`,
  shadow: num => `box-shadow 0 0 ${num} 0 rgba(0,0,0,0.5)`
})

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
  @media (max-width: 800px) {
    pad 5
    color orange
    @media screen {
      @media print {
        color green
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
    const style = z`${exp}`
    return html`
      <main
        class=${z`
          flexCenter
          flex-flow column
          transition background-color 500ms
          pad 6 b
          > * { mar 3 b }
          > input { ta center }
          bc ${color}
        `}
      >
        <div
          class=${z`
            fs 2em;fw bold;mar 3
            animation ${spin} 3s linear infinite
          `}
        >
          Zaftig
        </div>
        <div>
          <span class=${btn} onclick=${() => this.setState({ count: count + 1 })}>Increase</span>
          <span class=${z`w 60;d inline-block;ta center;fs 2em`}>${count}</span>
          <span class=${btn} onclick=${() => this.setState({ count: count - 1 })}>Decrease</span>
        </div>
        <div>
          <span class=${squareBtn}>Square Button</span>
        </div>
        <input
          placeholder="background color"
          class=${tbox}
          onchange=${({ target: t }) => this.setState({ color: t.value.trim() })}
        />
        <input
          placeholder="z expression"
          class=${tbox}
          onchange=${({ target: t }) => this.setState({ exp: t.value.trim() })}
        />
        <div class=${z`pad 2;fs 1.5em;ff monospace;ta center`}>
          <p>
            ${style.valueOf()} ${' = '}
            ${style.style ||
              html`
                <em>type something</em>
              `}
          </p>
          <p>
            zaftig runtime ${' '}
            ${html`
              <a href=${isDebug ? '?debug=false' : '?debug=true'}>${isDebug ? 'DEBUG' : 'PROD'}</a>
            `}:
            ${' ' + runTime.toFixed(3)}ms
          </p>
        </div>
        <pre
          class=${z`
            ws pre-wrap
            bc white;c #445566
            pad 8
            mar 4
            br 4
            shadow 10
            columns ${isDebug ? 2 : 1}
          `}
        >
        ${isDebug
            ? z.getSheet().textContent.trim()
            : Array.from(
                z.getSheet().sheet.cssRules,
                rule =>
                  html`
                    <p>${rule.cssText}</p>
                  `
              )}
        </pre
        >
      </main>
    `
  }
}

render(
  html`
    <${App} />
  `,
  document.body
)
