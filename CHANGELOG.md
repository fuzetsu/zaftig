# Changelog

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
