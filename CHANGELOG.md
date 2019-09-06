# Changelog

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
