# Zaftig [![npm](https://img.shields.io/npm/v/zaftig.svg)](https://www.npmjs.com/package/zaftig) [![size](https://img.badgesize.io/fuzetsu/zaftig/master/src/index.js.png?label=unminified&color=blue)](https://github.com/fuzetsu/zaftig/blob/master/src/index.js)

> Adjective, having a full rounded figure : pleasingly plump

Zaftig efficiently parses styles, generates a classname and inserts them into a style tag in the head of the page.

Passing the same style string will return the same classname.

```jsx
import z from 'zaftig'
import { render } from 'some-vdom-library'

z.css('html,body', 'm 0;ff sans-serif;bc #445566;c white')

const App = () => (
  <main>
    <h1 class={z`ta center`}>Header</h1>
    <button
      class={z`
        border none
        br 4px; p 0.75rem
        c #445566; bc white
        fs 16px
        cursor pointer
        transition transform 100ms
        &:active { transform scale(0.9) }
      `}
    >
      Click Me
    </button>
  </main>
)

render(<App />, document.getElementById('app'))
```

## Highlights

- 💸 Quick and lightweight
- 🙇 User defined helper functions `z.helper({})`
- 💯 Self referencing nested styles `&`
- 🅰️ Initial based css property shorthands _e.g. bc == background-color or d == display_
- ⚙️ Automatic vendor prefixes (**incomplete**)

## API

```js
z`<zaftig expression>`
```

Generates className and inserts styles into stylesheet, returns a `Style { class, style }` object.

When a `Style` object has `.toString()` or `.valueOf()` called it will return the className or the className with a dot prefixed respectively.

Example expressions:

```js
z`color green`
z`color green; background-color orange`
z`
  color green
  background-color orange
  &:focus {
    margin 20px
  }
  & > span { p 10px }
`
z`c green;bc orange`
```

<hr>

```js
z.add(selector, styleString)
```

Inserts styles into stylesheet.

<hr>

```js
z.helper({ helperName: helperString | helperFunction, ... })
```

Register helpers functions to be called from style strings.

<hr>

```js
z.setDebug(bool)
```

Enable/disable debug mode.

In debug mode Zaftig will insert styles using `textContent` and will log to the console when an unknown css property is encountered.

**NOTE:** This is less efficient than the normal CSSOM method, but it allows you to modify styles using chrome dev tools.

## Credits

Heavily inspired by [bss](https://github.com/porsager/bss) by [Rasmus Porsager](https://github.com/porsager).
