# Changelog

## 0.7.0 
*2019-08-23*

**Breaking Changes**

- removed parser options (BREAK, OPEN, CLOSE)
- removed `.style` property on style objects returned by `z`, use `z.style` instead

**Enhancements / Bug Fixes**

- string based helpers will automatically have args appended
- added `z.style` to parse style strings without generating classNames
- added `flex` to popular list
- fixed `px` detection for border properties in firefox
