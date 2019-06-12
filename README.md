# Zaftig [![npm](https://img.shields.io/npm/v/zaftig.svg)](https://www.npmjs.com/package/zaftig) [![size](https://img.badgesize.io/https://unpkg.com/zaftig@latest/dist/zaftig.min.js.png?label=gzip&color=blue&compression=gzip)](https://unpkg.com/zaftig@latest/dist/zaftig.min.js)

Zaftig efficiently parses styles, generates a classname for them and inserts them a into a stylesheet in the head of the document.

Passing the same style string will return the same classname.

```js
z`display flex` // .zjsdkk43-1
z`display flex` // .zjsdkk43-1
```

## Highlights

- 💸 Quick and lightweight
- 🙇 User defined helper functions `z.helper({})`
- 💯 Self referencing nested styles `&`
- 🅰️ Initial based css property shorthands _e.g. bc == background-color or d == display_
- ⚙️ Basic automatic vendor prefixing for: Chrome, Safari, Firefox, Edge, Opera (webkit)

Example:

```jsx
// works just as well with React and other libraries/frameworks
import m from 'https://unpkg.com/mithril@2.0.0-rc.4?module'
import z from 'https://unpkg.com/zaftig?module'

z.global`
  $btn-color #4444dd
  ff sans-serif
  fs 14
  m 10
`

const btn =
  'button' +
  z`
    border none
    p 0.75rem
    line-height 1.2rem
    color $btn-color
    border 0.5 solid $btn-color
    bc white
    fs 16
    cursor pointer
    transition transform 100ms
    outline none
    :active { transform scale(0.9) }
    &.primary { bc $btn-color; c white }
    &.rounded { br 4 }
  `

const App = () =>
  m('main' + z`${btn} { m 5 }`, [
    m(btn, 'Normal'),
    m(btn + '.primary.rounded', 'Primary'),
    m(btn + z`$compose rounded; $btn-color #ee5555`, 'Warning'),
    m(btn + z`$btn-color green`, 'Success'),
    m(btn + z`$compose primary rounded; $btn-color green`, 'Success + Primary')
  ])

m.render(document.body, App())
```

[![example](/docs/img/example.png)][example-playground]

[playground][example-playground]

## Usage

ES6 modules:

```js
import z from 'https://unpkg.com/zaftig?module'
z`color green; background red`
```

ES5 browser environment:

```html
<script src="https://unpkg.com/zaftig"></script>
<script>
  z`color green; background red`
</script>
```

Or download the script and use it locally.

[You can see all the options here.](https://unpkg.com/zaftig@latest/dist/)

## API

Quick links: [`z`](#css) ~~ [`z.setDebug`](#set-debug) ~~ [`z.global`](#global) ~~ [`z.anim`](#anim) ~~ [`z.helper`](#helper) ~~ [`z.new`](#new)

<hr>

<a name="css"></a>

### `` z`<styleString>` ``

Generates a `className` for the given `styleString` and inserts it into a stylesheet in the head of the document.

It returns a `Style` object `{ class, className, style }`.

When `.toString()` is called on a `Style` object the `className` will be returned.

When `.valueOf()` is called it will return the `className` with a dot prefixed. This allows you to directly concatenate style objects to tag names when using a hyperscript helper like mithril offers:

```js
m('h1' + z`margin auto`) ==> m('h1.zfwe983')
```

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

#### CSS variable handling:

You can create/reference css variables using the `$` syntax. The normal css syntax using `--` and `var()` also works.

```js
z.global`
  $bg-color black
  $fg-color white
  $font-size 16px
`

z`
  color $fg-color
  background-color $bg-color
  font-size $font-size
`
```

```css
/* generated css */

:root {
  --bg-color: black;
  --fg-color: white;
  --font-size: 16px;
}

.z2djkf2342-1 {
  color: var(--fg-color);
  background-color: var(--bg-color);
  font-size: var(--font-size);
}
```

#### Automatic px:

Zaftig will automatically append `px` to any numeric value provided to a css property that accepts `px` values.

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

```css
/* generated css */

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

<a name="set-debug"></a>

### `z.setDebug(bool)`

Enable/disable debug mode.

In debug mode Zaftig will insert styles using `textContent` and will log to the console when an unknown css property is encountered.

`textContent` is much less efficient than the non debug CSSOM method, but it allows you to modify the styles using chrome dev tools.

**NOTE:** make sure to call `setDebug` before inserting any styles

<hr>

<a name="global"></a>

### `` z.global`<styleString>` ``

Appends global styles. Multiple calls with the same string will result in the style being appended multiple times.

```js
z.global`
  html, body {
    font-family sans-serif
    margin 0
  }
`
```

<hr>

<a name="anim"></a>

### `` z.anim`<styleString>` ``

Generates an `@keyframes` for the given `styleString`. It returns the generated name.

```js
const grow = z.anim`
  0% { scale(0.2) }
  100% { scale(1) }
`
// then to use it
z`animation ${grow} 1s ease`
```

<hr>

<a name="helper"></a>

### `z.helper({ helperName: helperString | helperFunction, ... })`

Register helpers functions to be called from style strings.

A helper can be a `styleString` or a function that returns a `styleString`.

If the helper is a function it will receive arguments, as seen in the `size` example below.

```js
z.helper({
  mx: x => `margin-left ${x}; margin-right ${x}`,
  size: (h, w) => `h ${h}; w ${w}`,
  shadow: 'box-shadow 0 2 4 2 rgba(0,0,0,0.5)'
})

z`
  mx 10
  size 50 100
  shadow
`
```

```css
/* generated css */

.z2djkf2342-1 {
  margin-left: 10px;
  margin-right: 10px;
  height: 50px;
  width: 100px;
  box-shadow: 0px 2px 4px 2px rgba(0, 0, 0, 0.5);
}
```

<hr>

<a name="new"></a>

### `z.new(config)`

Creates a new instance of zaftig, with a separate style element, helpers and rule/parser cache.

The new instance will have all the same methods as the default one.

`config` is an optional object parameter that looks something like this:

```js
const newZ = z.new({
  // if you pass a style elem, you need to append it to the doc yourself
  // if you don't pass one then zaftig will create and append one for you
  style: document.head.appendChild(document.createElement('style')),

  // override the prefix for all classes generated by zaftig
  // a random one will be generated by default
  id: 'custom-id',

  // preload the instance with some helpers
  // defults to {}, add more with z.helper()
  helpers: { mx: x => `ml ${x}; mr ${x}` },

  // overrides auto-px behavior, if property accepts px, then automatically
  // this unit to numbers
  unit: 'rem',

  // debug flag, default is false
  debug: true
})
```

Creating a new instance is useful when you want to you ensure you get a private/non global version of zaftig, or to render styles into a shadow DOM.

#### Override parser options

You can change how zaftig processes the style string syntax by passing the following options:

```js
const newZ = z.new({
  parser: {
    OPEN: '{', // block open
    CLOSE: '}', // block close
    BREAK: ';' // rule separator
  }
})
```

```js
import zaftig from 'https://unpkg.com/zaftig?module'
const z = zaftig.new({ parser: { OPEN: '[', CLOSE: ']' } })

z.global`
  html [ bc green ]
`
```

[playground][parser-config-playground]

**Warning:** Do not use a character that is valid in a CSS value, such as parentheses, `(` or `)`. Otherwise zaftig will be unable to properly parse css values.

## Credits

Heavily inspired by [bss](https://github.com/porsager/bss) by [Rasmus Porsager](https://github.com/porsager).

[parser-config-playground]: https://flems.io/#0=N4IgZglgNgpgziAXAbVAOwIYFsZJAOgAsAXLKEAGhAGMB7NYmBvEAXwvW10QICsEqdBk2J4IWAA60ATsQAEALwxhiEAOZyw02ljkByEsQlxEAelMBXNBIDWa-HSymlK9QH4stACYXYegDpoQnDyCnIAvIrKqvZoMADuABTAchIY0nAw0ohyKQDyAAoAogByOXrIehRyAMIAMnkAykXlALp6cqydAJSBgQr4alC0AEYYUAAGgXJyJGRyyHIj1HJq0jBMcq2BE5QgmbDUqvQIPACsiACMbBwgmDh4DnACNPSMzDxsraxAA
[example-playground]: https://flems.io/#0=N4IgtglgJlA2CmIBcBWADAOgEwEYA0IAZhAgM7IDaoAdgIZiJIgYAWALmLCAQMYD21NvEHIQAHigQAbgAJoAXgA6IWgAdVygHyLqMmTrEB6SVM3cQpeAh5sIA8kzRIcWEAF88Neo2YArcrwCQiJMhoYyAO58AE4A1qQyvgCupGwytAkRVrCREGwsMgBK8LQ26dRQMnz58NEysBAARtG00RDwpIaELQxRcaQ6EGCqMWlgMt184wDk7GyqpEhhSdSqsQDmGPxghpD5bbAAAlgYmGgAtNE8GAAsAPxgfFBJCNODw6MyAF4T0VMyszY80Wy1WGy2U0MX1ohFs6weTxe8De1B0Xww61gfEatFgAAMdHoACSNNjUc78LF1ADENzpNxghImhBkpFo1FI50sbUITMICRwNyZ4xwaB0BNR1H4HLSpN0Sl0AMaSSBAmmMgA1EyvhK9HpGjEoLUZNQBPAmXpVDJMAB2FDReBgC31CDUeDnFjwCDrdgyHDYB1OxV6SkxGQkskUvhU50G6JGuqYFCs6PQcNyqMx4MyRo8SIsPLm7P8v0ANmdPCS0VIYZGrqE0WdbBaHLydl0zfZpEIMRFaDQYAG2b4KoabpNZudSFKtik8BkwBknY5Pei41IPFx8AAFJgAJwAShkbmdADIMKo2mBWgBPBc5vMR8mh6IAbhkeYiBaEx7PGD+KxGpUi7NDINy-oqEo6NKqQyAAguoMjyDI25HvI2iKmA27TNerrqhq3x4kSwBym497jMmbh4ngMgUM6WFyjR0wAHK9ri0wHng9HbnKmoAheV63v+I4VPAUDTExAAKgnRDeHFcdmDFknxOpEtsIyWDIAGiVA75PpmYbUvA8AoKZKDUQCADqrTUK66zydxvEEapGYvjI6wOsIFnTAAykkPA8B0pAOYpPHKc5RHqXwmmXkMt5aSJQF6a50Zhh5xnUN5fkBUFfHSXFskcUyAC6B46DoYD-sICbblAfCVgwggYAaUA3jRCGqKhZXUOYljWLY9iiCgSBYGg7ieCAdAMKIWykAEIDSsEbCiO4xVuEAA
