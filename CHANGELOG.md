# Changelog

## _Unreleased_

Big update!

### Three new options for chaining styles together

1. concat: `` z.concat(z`c green`, 'hello', cond && z`bc white`) ``
2. chained z: `` z`c orange`.z`fs 200%` ``
3. chained concat: `` z`c orange`.concat('some-class', cond && z`c blue`) ``

`z` chaining allows you to extend an existing zaftig style directly, and is an alternative to `$compose`.
It is especially useful when used on a cached style:

```js
const tagStyle = z`padding 5; border-radius 4; background black; color white`
const errorTagStyle = tagStyle.z`color red`
```

Concat is useful when you want to combine a zaftig style with other zaftig styles or CSS classes:

```jsx
const textBoxStyle = z`padding 5; width 100%`
const errorStyle = z`c red`
const successStyle = z`c green`
//...
<input className={textBoxStyle.concat(error && errorStyle, success && successStyle)} />
```

### New config option `dot`

Controls whether zaftig adds a dot to the className when `valueOf()` is called on `Style` objects:

```js
z.setDot(true)
'' + z`c orange` // .z23423 <-- dot

z.setDot(false)
'' + z`c orange` // z23423 <-- no dot
```

This is mostly useful when using React, since it calls `valueOf()` on component props:

This snippet only works in React with `dot` set to `false`:

```jsx
<div className={z`c orange`}>Hello World</div>
```

### Support for `@supports (...) {}`

Could arguably be considered a bug fix, but starting now Zaftig supports `@supports` blocks, including nesting them:

```js
z`
  @supports (display: flex) {
    display flex
    @supports (justify-content: center) {
      justify-content center
    }
  }
`
```

Output:

```css
@supports (display: flex) {
  .z34j42k3 {
    display: flex;
  }

  @supports (justify-content: center) {
    .z34j42k3 {
      justify-content: center;
    }
  }
}
```

### Output nested `@media` and `@supports` queries

In previous versions zaftig would try to generate a combined selector for media queries when they were nested:

```js
z`
  @media screen {
    @media (min-width: 500px) {
      c green
    }
  }
`
```

Would generate:

```css
@media screen and (min-width: 500px) {
  .z32423 {
    color: green;
  }
}
```

[Since all browsers (apart from IE which Zaftig doesn't support) support nested media queries](https://caniuse.com/css-mediaqueries) from now on zaftig will output them nested instead of generating a combined query:

```css
@media screen {
  @media (min-width: 500px) {
    .z3423 {
      color: green;
    }
  }
}
```

This should not result in a visible difference in behavior except in cases where zaftig was incorrectly generating the combined query.

The main advantage of this change is simpler/smaller code for appending styles, and more consistent behavior since complex boolean media queries would not work in previous versions.

### Enhancement: skip appending rules with no selector

Previously when a block didn't have a selector the styles would get applied to the parent. Now they will simply be ignored.
In debug mode zaftig will warn about this.

```js
z`
  {
    color green
  }
`
// ⚠️ zaftig: missing selector ...
```

## 0.9.2

_2020-07-15_

Fixed bug where `$compose` would fail to work with zaftig style objects. They were getting concatenated and rendering with a `.`

## 0.9.1

_2020-07-01_

Updated the build script to mangle property names prefixed with an underscore and went through the source code replacing the previously short property names with longer ones that will be mangled.

This improves the readability of the source code a bit as well as reducing the gzip dist size by ~30 bytes 🎉

## 0.9.0

_2020-04-21_

Major enhancement to error reporting in debug mode 🎉

When debug mode is enabled all css rules will be tested for validity and an error will be logged to the console if an invalid rule is found.

Since `console.error` is used a stack is provided which makes it easy to find the offending style.

```js
import z from 'zaftig'
z.setDebug(true)

z`fake-rule boo;color 100`

/*
In the console:
zaftig: invalid css fake-rule boo;
zaftig: invalid css color: 100;
*/
```

This version removes the logging when zaftig prefixes a property, you can still easily check the generated stylesheet to see whether a selector was prefixed or not.

```js
// in debug mode you can look for the stylesheet in document.head in DOM or like this:
z.getSheet().textContent
// in prod mode you can use the following code to get the stylesheet:
[...z.getSheet().sheet.cssRules].map(x => x.cssText).join('\n')
```

## 0.8.4

_2019-12-05_

Fixed bug with function helpers where empty string would be passed as first arg when no args were passed, causing default args not to work:

```js
z.helper({ test: (x = 5) => `margin ${x}` })

z`test` // this would result in no style being applied, since x would be '' instead of defaulting to 5
```

## 0.8.3

_2019-11-12_

Added auto-px exception for `flex`. In IE `px` was being added even though numbers without units numbers should be accepted.

## 0.8.2

_2019-11-08_

Added `margin-bottom` to the popular property list. Firefox was resolving `mb` to `margin-block`.

## 0.8.1

_2019-10-28_

Made a couple tweaks to shave some unnecessary bytes.

## 0.8.0

_2019-10-28_

Error handling has been improved quite a bit (#7). If there is a syntax error in the CSS selector of rule being inserted (only thing that seems to actually throw an error), only that particular rule will fail to insert. Zaftig will log that to the console with error information, but the rest of the style will be used.

Automatic prefixing of CSS selectors (#8). A slightly naive implementation, but it seems to work for the important cases. If a rule fails to insert, and there are any pseudo-elements or pseudo-selectors in the selector, Zaftig will re-attempt to insert by checking each portion of the selector for errors that can be fixed by adding the vendor prefix.

Not a functionality change, but since last version I have added some basic automated tests to prevent obvious bugs from slipping through.

## 0.7.3

_2019-09-07_

Fixed regression where nested selectors in media queries would be applied incorrectly.

Added section about tools to readme.

## 0.7.2

_2019-09-05_

Fixed browser prefixing bug where properties in the popular list would never be prefixed when necessary.
In this case `user-select` was not properly being resolved to `-moz-user-select` in firefox.

Added special handling for `[]` attribute selectors, when nested within another selector the parent will be pre-pended without a space, as with `:`.

```js
z`
  :active {  }
  [some-prop] {  }
`
```

Fixed a bug where styles defined inside a root level media query without a selector were not being added.

```js
// bc red would not have been applied to :root
z.global`
  @media only screen {
    bc red
  }
`
```

Added `border-bottom` to popular properties to give it a higher shorthand priority. Previously `bb` resolved to `break-before`.

## 0.7.1

_2019-08-23_

Fixed parser bug where `undefined` was sneaking into a blocks selector when the opening brace occurred before the first space.

```js
z`h1{c orange}` // would generate invalid selector
```

## 0.7.0

_2019-08-23_

**Breaking Changes**

- removed parser options (BREAK, OPEN, CLOSE)
- removed `.style` property on style objects returned by `z`, use `z.style` instead

**Enhancements / Bug Fixes**

- string based helpers will automatically have args appended
- added `z.style` to parse style strings without generating classNames
- added `flex` to popular list
- fixed `px` detection for border properties in firefox
