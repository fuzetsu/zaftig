import { html, render, Component } from 'https://unpkg.com/htm/preact/standalone.mjs'
import z from '../src/index.js'
// import z from '../dist/zaftig.min.js'

z.setDebug(true)

z.add('html,body', 'm 0;ff sans-serif;bc #445566;c white;fs 14px')
  .add('a', 'c lightblue; &:visited { c blue }')
  .add('pre', 'm 0')

z.helper({
  flexCenter: 'd flex;ai center;jc center',
  mar: (num, side = '') => `m${side} ${num * 0.25}rem`,
  pad: (num, side = '') => `p${side} ${num * 0.25}rem`,
  shadow: num => `box-shadow 0 0 ${num}px 0 rgba(0,0,0,0.5)`
})

const btn = z`
  d inline-block
  br 4px
  c #445566;bc white
  pad 3
  fs 16px
  us none;cursor pointer
  transition transform 100ms
  &:active { transform scale(0.9) }
`

const tbox = z`
  border none
  bc white
  pad 3
  br 4px
  fs 16px
  transition transform 400ms
  &:focus { transform scale(1.08) }
  &:focus + & {
    transform rotate(180deg)
    &::placeholder { c orange }
  }
`

class App extends Component {
  render(_, { count = 0, exp = '', color = '' }) {
    const style = z`${exp}`
    return html`
      <main
        class=${z.all(
          `
            flexCenter
            flex-flow column
            transition background-color 500ms
            pad 6 b
            > * { mar 3 b }
            > input { ta center }
          `,
          `bc ${color}`
        )}
      >
        <div class=${z`fs 2em;fw bold;mar 3`}>Zaftig</div>
        <div>
          <span class=${btn} onclick=${() => this.setState({ count: count + 1 })}>Increase</span>
          <span class=${z`w 60px;d inline-block;ta center;fs 2em`}>${count}</span>
          <span class=${btn} onclick=${() => this.setState({ count: count - 1 })}>Decrease</span>
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
        <div class=${z`pad 2;fs 1.5em;ff monospace`}>
          ${style.valueOf()} ${' = '}
          ${style.style ||
            html`
              <em>type something</em>
            `}
        </div>
        <pre
          class=${z`
            ws pre-wrap
            bc white;c #445566
            pad 8
            br 4px
            columns 2
            shadow 10
          `}
        >
        ${z.getSheet().textContent.trim()}</pre
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
