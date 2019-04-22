# Zaftig [![npm](https://img.shields.io/npm/v/zaftig.svg)](https://www.npmjs.com/package/zaftig) [![size](https://img.badgesize.io/https://unpkg.com/zaftig@latest.png?label=gzip&color=blue&compression=gzip)](https://unpkg.com/zaftig@latest)

> Adjective, having a full rounded figure : pleasingly plump

Zaftig efficiently parses styles, generates a classname and inserts them into a style tag in the head of the page.

Passing the same style string will return the same classname.

```jsx
import z from 'https://unpkg.com/zaftig?module'
import { React, ReactDOM } from 'https://unpkg.com/es-react?module'
import htm from 'https://unpkg.com/htm?module'

const html = htm.bind(React.createElement)

z.add('html,body', 'm 0;ff sans-serif;bc #445566;c white;fs 14px')

const App = () => html`
  <main className=${z`m 10px`}>
    <h1 className=${z`ta center`}>Header</h1>
    <button
      className=${z`
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
`

ReactDOM.render(App(), document.getElementById('app'))
```

[playground](https://flems.io/#0=N4IgZglgNgpgziAXAbVAOwIYFsZJAOgAsAXLKEAGhAGMB7NYmBvAHgBMIA3AAgjYF4AOiAwAHUcIB8gtN24yWAeg6dJlEHBixqxCPQSIQABkQBGAEwgAvhXTZch-ACsEVOgybE8ELKNoAnYm4AL24wf1osbgByEmJROERFRQBXNFEAawBzfDosRWCMMF0sgAEoDEY4YgB+LFo2FNhomR8-QO5gbgAlGAwdCh6+nQARAHkAWW4rMIio2OJ4xOS0zJy8xXgAWn9h2vrG5tbfAKCSKPDImLiEpNT07NzIxXO6hqaYFrQZd2ruc6g3H4-1I+AARhA0GwABS9frEXK7SowACisBwDAAlDIZMF8Bg2DCFmQKGCGgBPaKDaJRIwAbjAYG4cAwaDgW00-ggYDpYOo3AAxAAWIUAVlFADYJXT+QB3QgQRgMuDcUxC0QAD2i2O+aF+QQAguIgdxoZigZIQWQAAYyOQsLAYSHcagVOBwABy9n4ABJgMFrVFTEZNdbcm64FZpLI5NwWIRTC6I16cL7-dbiBgXZ4YP4w66MO6owAJPpsXNKBPR2NxsEpRb0O01pOFz3ev1N5shW0xrtk-zl-zcND0GCd5tgofqjV07iibhGfAAdlFuyw45r-OFYsl0u4fO48sVY97zbAKtMEs1G9j1BS-jgATntEhjH8N7kxH8rLgir0si-H8wACIMjCMLA4A-bgADJEHhLgYE6bhALZYD-CiOBqAwWBoUXABOc0rCg-MIxvIjT2rZsAGEoAgagMm4CYTxrJQ6wbNBKKUR1IWjHsZDhUZJnwXYoVzaEjVEM1BjYWg7wxBEshgYg0RgeSACFyQASSJMRRG1HV1E0bRdH0PA8MQcwAA5rFsEBMBwPBcnddR3EYZhDGsABdKwgA)

## Highlights

- 💸 Quick and lightweight
- 🙇 User defined helper functions `z.helper({})`
- 💯 Self referencing nested styles `&`
- 🅰️ Initial based css property shorthands _e.g. bc == background-color or d == display_
- ⚙️ Automatic vendor prefixes (**incomplete**)

## API

### `` z`<styleString>` ``

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
    &::placeholder { c orange }
  }
  & > span { p 10px }
`
z`c green;bc orange`
```

Styles are separated by `;` or `\n`.

`sel { /* rules */ }` creates a nested style. Use `&` within the selector to reference the parent selector similar to how [Less](http://lesscss.org/) works.

<hr>

### `z.all(...styleString)`

Processes multiple style strings into one `className` (classes separated by space). Useful when in JSX and template strings where concatenating manually might be undesirable.

<hr>

### `z.add(selector, styleString)`

Inserts styles into stylesheet.

<hr>

### `z.helper({ helperName: helperString | helperFunction, ... })`

Register helpers functions to be called from style strings.

<hr>

### `z.setDebug(bool)`

Enable/disable debug mode.

In debug mode Zaftig will insert styles using `textContent` and will log to the console when an unknown css property is encountered.

**NOTE:** This is less efficient than the normal CSSOM method, but it allows you to modify styles using chrome dev tools.

## Credits

Heavily inspired by [bss](https://github.com/porsager/bss) by [Rasmus Porsager](https://github.com/porsager).
