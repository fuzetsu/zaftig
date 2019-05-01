# Zaftig [![npm](https://img.shields.io/npm/v/zaftig.svg)](https://www.npmjs.com/package/zaftig) [![size](https://img.badgesize.io/https://unpkg.com/zaftig@latest.png?label=gzip&color=blue&compression=gzip)](https://unpkg.com/zaftig@latest)

> Adjective, having a full rounded figure : pleasingly plump

Zaftig efficiently parses styles, generates a classname and inserts them into a style tag in the head of the page.

Passing the same style string will return the same classname.

```jsx
// works just as well with React and most other libraries
import m from 'https://unpkg.com/mithril@next?module'
import z from 'https://unpkg.com/zaftig?module'

import htm from 'https://unpkg.com/htm?module'
const html = htm.bind(m)

z.add('html,body', 'm 0;ff sans-serif;bc #445566;c white;fs 14px')

const App = () => html`
  <main class=${z`m 10px`}>
    <h1 class=${z`ta center`}>Header</h1>
    <button
      class=${z`
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

m.mount(document.body, { view: () => App() })
```

[playground](https://flems.io/#0=N4IgZglgNgpgziAXAbVAOwIYFsZJAOgAsAXLKEAGhAGMB7NYmBvAHgBMIA3AAgjYF4AOiAwAHUcIB8gtN24yWAeg6dJlEHBixqxCPQSIQABkQBGAEwgAvhXTZch-ACsEVOgybE8ELKNoAnYm4AL24wf1osbgByEmJROERFRQBXNFEAawBzfDosRWCMMF0sgH4sWjYU2GiZHz9A7ijwyJi4hKTU9OzcyMUsCGJCf2gAATQYAA9icsrqmFq0eoCgkmaIqNjieMTktMycvMU12aqamRl3OFXSKG5+bjX8ACMINDYACiwASgu0YPwGDYny2ZAoz0qAE9ohQYlEjABuMBgbhwDBoOAAWk0IzACOe1G4AGIACwkgCs5IAbFSEYSAO6EQYwJFwbimEmiSbRX5oS76IIAQXE924H2+90kj1uAAMZHIWFgMG9uNQoBg4HB+AASYDBGVRUxGLkyqzSWRybgsQimVXqzU6vUy4gYVWeGD+U2SAASMCBHqUNvNlqtzxS23o8pDdo1Wt1+qj0e4EP8bA93DQ9Bgiejz383E5kwR3FE3CM+AA7OT-DAsDmQ4TSRTqbTkwymYx65awGzTFSuV25NQUv44AES7Q3ox-IPuMR-Oi4IM9LJ54uwAFDUYjFg4LOAGSIDA6LgwbjAOcLjEb-xRODUDCwD7lgCcEqsXdNOeD0YAwlAIGoDJuAAWWzC0FUUMMIzQH8lCVN5zTlPk0CwfAKjSYgPjYWhhxwBgXihWEL04CAYHpRAxQlfgpWFURxW4KxvnUTRtF0fQ8HMCtEApaxbBATAcDwXJNXUdxGGYQxrAAXSsIA)

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

### `z.helper({ helperName: helperString | helperFunction, ... })`

Register helpers functions to be called from style strings.

<hr>

### `z.setDebug(bool)`

Enable/disable debug mode.

Debug mode should be enabled before any styles are created or unexpected things may happen.

In debug mode Zaftig will insert styles using `textContent` and will log to the console when an unknown css property is encountered.

**NOTE:** This is less efficient than the normal CSSOM method, but it allows you to modify styles using chrome dev tools.

## Credits

Heavily inspired by [bss](https://github.com/porsager/bss) by [Rasmus Porsager](https://github.com/porsager).
