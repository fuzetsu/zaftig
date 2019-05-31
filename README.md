# Zaftig [![npm](https://img.shields.io/npm/v/zaftig.svg)](https://www.npmjs.com/package/zaftig) [![size](https://img.badgesize.io/https://unpkg.com/zaftig@latest.png?label=gzip&color=blue&compression=gzip)](https://unpkg.com/zaftig@latest)

> Adjective, having a full rounded figure : pleasingly plump

Zaftig efficiently parses styles, generates a classname and inserts them into a style tag in the head of the page.

Passing the same style string will return the same classname.

```jsx
// works just as well with React and most other libraries
import m from 'https://unpkg.com/mithril@2.0.0-rc.4?module'
import z from 'https://unpkg.com/zaftig?module'

import htm from 'https://unpkg.com/htm?module'
const html = htm.bind(m)

z.global`
  html, body {
    m 0
    ff sans-serif; fs 14
    bc #445566; c white
  }
`

const App = () => html`
  <main class=${z`m 10`}>
    <h1 class=${z`ta center`}>Header</h1>
    <button
      class=${z`
        border none
        br 4; p 0.75rem
        c #445566; bc white
        fs 16
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

[playground](https://flems.io/#0=N4IgZglgNgpgziAXAbVAOwIYFsZJAOgAsAXLKEAGhAGMB7NYmBvAHgBMIA3AAgjYF4AOiAwAHUcIB8gtN24yWAeg6dJlEHBixqxCPQSIQABkQBGAEwgAvhXTZch-ACsEVOgybE8ixdwDutABOANZw3E4ArnDE3BhhflpQ-hDEhNwASjAYOrFobNxYtNHctKkwgdxQEABGgRiBEPAyEFiiQTFY3GCBtJ0A5CTEonCIPhFoosEA5vh0WIpYKYQNUAAC5vhGmwC0gdT4ACwA-IVsEbB9za3t3ABeXT39g8OjiuOTM3OKtxhgulMnWhnC4yK5tQIxEidbq9bgDYhDEZjCbTWa9RRQwHAmCXNDuYpQpL8bhQ-DVCB5AAUWAAlKC0Ld8FMoLRqhgoAADGRyQkUbjVIEAT24wG5cgK3CMYrkYDA3DgGDQcG2mgaYAA3F0wqYDtL+dRuABiA4HACspoAbBbNQa-IQUjAxVYZFy0DJ8TEAILibjEyk032SEmkTlilhYDAU7jUKBxOD8AAkwFuHM6piMHKs0lk4pYhFM0djcHjSZTxAw0c85UzkgAElk2OUlPns+LuCxqhEEfQ9XIY3HE8nXW22wLAo2Kmh6I6cyP+RUDprRJL8AB2U2BGBYXvig3Gs2W636-z2xg7mXai3n6MRQJwILcNoUxiBa-EOpKlJ6WTvxVwMBBGmRhGFgcDXgAZIg2S6JwMAitwv5KgBgSdHA1DsjAlJbAAnAGzqzuKmZ6q2I4AMJVNQwTcAAsjObZKJ23ZoCRSgRhS2aujIWD4IU4zEJSbC0NQEQ4AwZJCnywDcJwjR+Ig3D+oG3DeqIilWDS6iaNouj6HgpiIKa2HWLYICYDgeCzMW6juIwzCGNYAC6VhAA)

## Highlights

- 💸 Quick and lightweight
- 🙇 User defined helper functions `z.helper({})`
- 💯 Self referencing nested styles `&`
- 🅰️ Initial based css property shorthands _e.g. bc == background-color or d == display_
- ⚙️ Basic automatic vendor prefixing for: Chrome, Safari, Firefox, Edge, Opera (webkit)

## Usage

ES6 modules:

```js
import z from 'https://unpkg.com/zaftig?module'
z`color green; background red`
```

ES5 browser environment:

```html
<script src="https://unpkg.com/zaftig/dist/zaftig.es5.min.js"></script>
<script>
  z`color green; background red`
</script>
```

[You can see all the options here.](https://unpkg.com/zaftig@latest/dist/)

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
  :focus {
    margin 20px
    ::placeholder { c orange }
  }
  > span { p 10px }
`
z`c green;bc orange`
```

Styles are separated by `;` or `\n`.

`sel { /* rules */ }` creates a nested style. Use `&` within the selector to reference the parent selector similar to how [Less](http://lesscss.org/) works.

There are a couple of special properties that can be used within a `styleString`.

`$name` will prepend the given string to the generated class name to make it easier to read the DOM:

```js
z`
  $name button
  border none
`
// generated classname will look something like: 'button-z2djkf2342-1'
```

`$compose` will make `z` generate a list of classnames rather than just the generated one:

```js
z`
  $compose btn btn-primary
  border none
`
// .class will output something like: 'btn btn-primary z2djkf2342-1'
```

This allows you to easily combine zaftig generated classes with external css classes that you've manually written or that are provided by a css framework/library.

**Automatic px:** Zaftig will automatically append `px` to any numeric value provided to a css property that accepts `px` values.

```js
z`
  margin 10
  padding 100
  width 5
  height 50
  box-shadow 0 2 4 0 rgba(0, 0, 0, 0.1)
  opacity 0.5
`
```

will generate a css class that looks like this:

```css
.z2djkf2342-1 {
  margin: 10px;
  padding: 100px;
  width: 5px;
  height: 50px;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
  opacity: 0.5;
}
```

You can specify `px` manually if you prefer to, but `zaftig` will add it for you if you don't.

<hr>

### `` z.global`<styleString>` ``

Parses given `stringString` and inserts as global styles.

Example:

```js
z.global`
  html, body {
    font-family sans-serif
    margin 0
  }
`
```

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
