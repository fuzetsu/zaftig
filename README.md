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

[playground](https://flems.io/#0=N4IgZglgNgpgziAXAbVAOwIYFsZJAOgAsAXLKEAGhAGMB7NYmBvAHgBMIA3AAgjYF4AOiAwAHUcIB8gtN24yWAeg6dJlEHBixqxCPQSIQABkQBGAEwgAvhXTZch-ACsEVOgybE8ELKNoAnYm4AL24wf1osbgByEmJROERFRQBXNFEAawBzfDosRWCMMF0sgH4sWjYU2GiZHz9A7mBuACUYDB0KVvadABEAeQBZbiswiKjY4njE5LTMnLzFeABafx7icsrqmFq0eoCgkijwyJi4hKTU9OzcyMUjzaqamRl3OEPSKG5+biP8ACMIGg2AAKNodYi5NYYRgAUVgOAYAEoXmhgvgMGxQZMyBR-pUAJ7RLrRKJGADcYDA3DgGDQcGWmn8EDA5P+1G4AGIACzcgCsfIAbILyRyAO6ECCMSlwbimbmiAAe0RRaFe+iCAEFxN9uCCkd9JL9PgADGRyFhYDBA7jUKAYOBwABy9n4ABJgMETVFTEYlSbcvbHVZpLI5NwWIRTLag87XR6vcQMLbPDB-AG7Q64CGABLtNhppRR0PhiP-FJTejm0sxrMunDu4DVmshM1hlv4-wF-zcND0GDNmv-HsKxXk7iibhGfAAdj5aywg9LHJ5-KFIu47O4EqlA-bNbAstMgqVS-D1BS-jgAQntCBjH8Z7kxH8dLgUr0shfb7AAR9RiMLA4CfbgADJEAhLgYCabhv3pX9-CiOBqAwWAQWnABOA0rBAjNYzPHD9xLGsAGEoAgagMm4QY91LJRy0rNBiKUK0gVDNsZHBPohnwNZgTTEFtVEfUujYWgL0RSEshgYh4RgSSACECQASWxMRRBVVV1E0bRdH0PBuUQblLBsOwcDwXJHXUdxGGYQxrAAXSsIA)

## Highlights

- 💸 Quick and lightweight
- 🙇 User defined helper functions `z.helper({})`
- 💯 Self referencing nested styles `&`
- 🅰️ Initial based css property shorthands _e.g. bc == background-color or d == display_
- ⚙️ Automatic vendor prefixes (**incomplete**)

## API

```js
z`<styleString>`
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
z.all(...styleString)
```

Processes multiple style strings into one `className` (classes separated by space). Useful when in JSX and template strings where concatenating manually might be undesirable.

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
