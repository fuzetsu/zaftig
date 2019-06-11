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
  html, body {
    m 10
    ff sans-serif; fs 14
  }
`

const button =
  'button' +
  z`
    --btn-color #4444dd
    border none
    p 0.75rem
    line-height 1.2rem
    color var(--btn-color)
    border 0.5 solid var(--btn-color)
    bc white
    fs 16
    cursor pointer
    transition transform 100ms
    outline none
    :active { transform scale(0.9) }
    &.primary { bc var(--btn-color); c white }
    &.rounded { br 4 }
  `

const App = () =>
  m('main' + z`button { m 5 }`, [
    m(button, 'Normal'),
    m(button + '.primary.rounded', 'Primary'),
    m(button + z`$compose rounded; --btn-color #ee5555`, 'Warning'),
    m(button + z`--btn-color green`, 'Success'),
    m(button + z`$compose primary rounded; --btn-color green`, 'Success + Primary')
  ])

m.render(document.body, App())
```

![result][example-image]

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

Will generate a class that looks like this:

```css
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

<a name="set-debug"></a>

### `z.setDebug(bool)`

Enable/disable debug mode.

In debug mode Zaftig will insert styles using `textContent` and will log to the console when an unknown css property is encountered.

This is less efficient than the normal CSSOM method, but it allows you to modify styles using chrome dev tools.

**NOTE:** if enabling, make sure to do so before using `` z`styleString` `` or things may break.

<hr>

<a name="global"></a>

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

<a name="anim"></a>

### `` z.anim`<styleString>` ``

Generates keyframe animation for given `stringString`. It returns the name of the animation.

Example:

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

If the helper is a function it will receive arguments passed split by space (as seen in the `size` example).

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

will generate:

```css
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

All config options are optional.

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

All parser options are optional.

**Example usage:**

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
[example-playground]: https://flems.io/#0=N4IgtglgJlA2CmIBcBWADAOgEwEYA0IAZhAgM7IDaoAdgIZiJIgYAWALmLCAQMYD21NvEHIQAHigQAbgAJoAXgA6IWgAdVygHyLqMmTrEB6SVM3cQpeAh5sIA8kzRIcWEAF88Neo2YArcrwCQiJMhoYyAO58AE4A1qQyvgCupGwytAkRVrCREGwsMgBK8LQ26dRQMmB8qTJ8+fDRMrAQAEbRtNEQ8KQ6EGCqMWlgMoTRfCMA5OxsqqRIYUnUqrEA5hj8YIaQ+V2wAAJYGJhoALTRPBgALAD81VBJCJN9A0MyAF6j41MzcwuGSxW602hnetEItlWdz4DyeOh07wwq1gfFatFgAAMdHp2Jw8DJWjCAJ4yYDYvRVGQ4NDkvSEQgyUi0aikU6WLqEADcowSOCu5LcOix1B0-BZaVaSTYbAEMiUuhkk0l0oEkxkAGpye9hRSZKdTq02NRTvwUU0AMRXK1XGC0gkxKCNGTUATwO2qGSYADsKGi8DAdpa1HgpxY8Agq3YVOwfoDCr0ppiMiknQAFPrDcbE9EAJR2wnRR1NTAoRl8FqVFPRdMGo0m8sxPPxgk8SIsPJu5uEXkANjtPCS0VIScGEEEjTtbA6LLydl0U+ZpEIMRG1LQYF6zb4UqD8GdrrtSFKtike+AMgXLOX0RGpB46PgqcwAE4czJBc2AGQYVRdMCdElz1aVsqxrTN6zNHNuVbCJ2yEd87W-cYlkdSogKaK4EIVYVRXsNIAEF1DlGRUzfeRtAVMBU0mf8xzVdUPgxZUZV0c8RlLNwMXxCg7So5iBHxSYADkV3RSYczwXjU343QGMmH8-wAjBkIqeAoEmQSAAVFOiIlxMk5s+KlFiNUYgASTZBksGQVNQ7kMzrbMZHNeB4BQdyUC4xUAHVOmoMdVn0qSZNM7UHKzBsmlWP1hC8yYAGUkh4HgelIILDOk4zZQY7ULImKy91-foAJs7dVKgezawis0ZGi1zqDixLktS0ztOK3TxPJABdJsdDAZThCLVMoD4AcGEEDBCSgIl8UI1RSKbcxLGsWx7FEZ9nHcTwQDoBhRA2UgAhAMVgjYUR3C6twgA
[example-image]: data:image/png;base64,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
