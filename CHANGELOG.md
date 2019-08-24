# Changelog

## 0.7.1

_2019-09-23_

Fixed parser bug where `undefined` was sneaking into a blocks selector when the opening brace occurred before the first space.

```
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
