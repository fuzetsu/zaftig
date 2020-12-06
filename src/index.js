const { isArray } = Array
const { hasOwnProperty, getPrototypeOf } = Object

// const p = (...args) => (console.log(...args), args[0])
const err = (...args) => console.error('zaftig:', ...args)

const zip = (parts, args) =>
  parts.reduce((acc, c, i) => acc + c + (args[i] == null ? '' : String(args[i])), '')

const memo = (fn, cache = {}) => x => (x in cache ? cache[x] : (cache[x] = fn(x)))

const dash = nodash => nodash.replace(/[A-Z]/g, m => '-' + m.toLowerCase())

const initials = str => str[0] + str.slice(1).replace(/[a-z]/g, '').toLowerCase()

// determine vendor prefix for current browser
const vendorPrefix =
  document.documentMode || /Edge\//.test(navigator.userAgent)
    ? 'ms'
    : navigator.vendor
    ? 'webkit'
    : 'moz'

// list of popular properties that should have a higher shorthand priority
const popular = [
  'backgroundColor',
  'borderBottom',
  'borderRadius',
  'bottom',
  'boxShadow',
  'color',
  'display',
  'flexDirection',
  'float',
  'fontFamily',
  'fontSize',
  'height',
  'margin',
  'marginTop',
  'marginBottom',
  'opacity',
  'padding',
  'paddingBottom',
  'right',
  'textAlign',
  'textDecoration',
  'top',
  'whiteSpace',
  'width'
]

// recursively search for style prototype used to establish valid props
const findStyleProto = obj =>
  hasOwnProperty.call(obj, 'width') ? obj : findStyleProto(getPrototypeOf(obj))

// collect valid props and their shorthands
const props = Object.keys(findStyleProto(document.documentElement.style)).filter(
  prop => prop.indexOf('-') < 0 && prop != 'length'
)
const validProps = {}
const short = {}

// concat valid popular props to give higher shorthand priority
props.concat(popular.filter(pop => props.indexOf(pop) >= 0)).forEach(prop => {
  let dashed = dash(prop)
  let init = initials(prop)
  if (prop.toLowerCase().indexOf(vendorPrefix) == 0) {
    init = init.slice(1)
    dashed = dashed[0] == '-' ? dashed : '-' + dashed
    if (!short[init]) short[init] = dashed
  } else short[init] = dashed
  validProps[dashed] = true
})

// determines if given css prop takes pixels
const testDiv = document.createElement('div')
const needsPx = memo(
  prop =>
    ['0', '0 0'].some(val => {
      testDiv.style.cssText = `${prop}: ${val};`
      return testDiv.style.cssText.slice(-3) == 'px;'
    }),
  {
    flex: false,
    border: true,
    'border-left': true,
    'border-right': true,
    'border-top': true,
    'border-bottom': true
  }
)

const selSep = /\s*,\s*/

// generates selector and combinations of selector and parent
const processSelector = (sel, parentSel) =>
  parentSel
    .split(selSep)
    .reduce(
      (acc, parentPart) =>
        acc.concat(
          sel
            .split(selSep)
            .map(part =>
              part.indexOf('&') >= 0
                ? part.replace(/&/g, parentPart)
                : parentPart + (part[0] == ':' || part[0] == '[' ? '' : ' ') + part
            )
        ),
      []
    )
    .join(',\n')

const wrap = (sel, body) => (sel && body ? `\n${sel} {\n${body}}\n` : '')

const handleTemplate = fn => {
  return function (parts, ...args) {
    try {
      return isArray(parts) ? fn.call(this, zip(parts, args)) : fn.call(this, parts)
    } catch (e) {
      err('error `', parts, '`', args, '\n', e)
      return ''
    }
  }
}

const createSheet = () => document.head.appendChild(document.createElement('style'))

let _testSheet
const isValidCss = (sel, body = '') => {
  try {
    // if sheet has been removed from DOM recreate it
    if (!_testSheet || !_testSheet.sheet) _testSheet = createSheet()
    _testSheet.sheet.insertRule(`${sel}{${body}}`, 0)
    const out = body && _testSheet.sheet.cssRules[0].cssText.replace(/\s/g, '')
    _testSheet.sheet.deleteRule(0)
    return !out || out.length > sel.length + 2
  } catch (e) {
    return false
  }
}

const prefixSelector = sel =>
  sel.replace(/(::?)([a-z-]+)(\()?/gi, (full, pre, name, paran) => {
    // handle special browser cases
    if (name == 'placeholder' && vendorPrefix != 'moz') name = 'input-' + name
    else if (name == 'matches') name = 'any'
    // skip valid or already prefixed selectors
    return name[0] == '-' || isValidCss(paran ? full + '.f)' : full)
      ? full
      : `${pre}-${vendorPrefix}-${name}${paran || ''}`
  })

const makeZ = (conf = {}) => {
  const { helpers = {}, unit = 'px', id = 'z' + Math.random().toString(36).slice(2) } = conf
  let { style, dot = true, debug = false } = conf
  let idCount = 0

  class Style {
    constructor(className) {
      this.class = className
      this.className = className
    }
    toString() {
      return this.class
    }
    valueOf() {
      return dot ? '.' + this.class : this.class
    }
    z(...args) {
      return this.concat(z(...args))
    }
    concat(...things) {
      return concat(this.class, ...things)
    }
  }

  const concat = (...things) => {
    const classes = []
    things.forEach(thing => {
      if (!thing) return
      if (typeof thing === 'string') classes.push(thing)
      else if (thing.className) classes.push(thing.className)
    })
    return new Style(classes.join(' '))
  }

  const addToSheet = (sel, body, prefix) => {
    const rule = wrap(prefix ? prefixSelector(sel) : sel, body)
    if (!rule) return
    if (!style) {
      style = createSheet()
      style.id = id
    }
    try {
      // run even in debug mode so that we can detect invalid syntax
      style.sheet.insertRule(rule, style.sheet.cssRules.length)
      // rule inserted above is overwritten when textContent is
      if (debug) style.textContent += rule
    } catch (e) {
      // if insert fails, attempt again if selector can be prefixed
      if (!prefix && sel.indexOf(':') >= 0) addToSheet(sel, body, true)
      else err('insert failed', sel, body, e)
    }
  }

  const isKeyframes = type => type == '@keyframes'

  const appendSpecialRule = ctx => {
    // for non keyframes types we need to combine parent and child selectors
    if (!isKeyframes(ctx._type)) {
      ctx._nested.forEach(nested => {
        if (isKeyframes(nested._type)) return
        nested._selector = ctx._selector + ' and ' + nested._selector
      })
      ctx._selector = ctx._type + ' ' + ctx._selector
    }
    if (ctx._rules) addToSheet(ctx._selector, ctx._rules.replace(/^/gm, '  ') + '\n')
    if (ctx._nested) ctx._nested.forEach(appendSpecialRule)
  }

  const appendSpecial = (sel, ctx, parentSel = '', parent) => {
    const spaceIdx = sel.indexOf(' ')
    const type = sel.slice(0, spaceIdx)
    const special = {
      _selector: isKeyframes(type) ? sel : sel.slice(spaceIdx + 1),
      _type: type,
      _nested: [],
      _rules: isKeyframes(type) ? '' : wrap(parentSel, ctx._rules)
    }
    // for special rules we need to process nested rules first
    // so that we accumulate the child rules in special._rules
    ctx._nested.forEach(nested =>
      appendRule(nested._selector, nested, parentSel == ':root' ? '' : parentSel, special)
    )
    // if we're within a parent context push there otherwise add to sheet
    if (parent) parent._nested.push(special)
    else appendSpecialRule(special)
  }

  const appendRule = (sel, ctx, parentSel = '', parent) => {
    if (!sel) {
      if (debug) err('missing selector', ctx)
      return
    }
    if (/^@(media|keyframes|supports)/.test(sel))
      return appendSpecial(sel, ctx, parentSel == '' ? ':root' : parentSel, parent)
    // compute selector based on parentSel
    if (parentSel && (!parent || !isKeyframes(parent._type))) sel = processSelector(sel, parentSel)
    // when we have a parent add rules there, otherwise directly to sheet
    if (parent) parent._rules += wrap(sel, ctx._rules)
    else addToSheet(sel, ctx._rules)
    // process nested rules
    ctx._nested.forEach(nestedCtx =>
      appendRule(nestedCtx._selector, nestedCtx, sel == ':root' ? '' : sel, parent)
    )
  }

  const runHelper = (key, value) => {
    const helper = helpers[key]
    return typeof helper === 'function'
      ? helper(...(value ? value.split(' ') : []))
      : helper && helper + ' ' + value
  }

  const assignRule = (ctx, prop, value) => {
    // if we only have a value then treat it as the prop
    if (value && !prop) {
      prop = value
      value = ''
    }
    if (!prop) return
    // special instructions
    if (prop[0] == '$') {
      if (prop == '$name') return (ctx._name = value)
      if (prop == '$compose') return (ctx._compose = value)
      // everything else is a css var
      prop = '--' + prop.slice(1)
    }
    // helper handling
    const helper = runHelper(prop, value)
    if (helper) {
      const parsed = parseRules(helper)
      ctx._rules += parsed._rules
      ctx._nested = ctx._nested.concat(parsed._nested)
      return
    }
    if (!value) return debug && err('no value for', prop)
    // shorthand handling
    prop = short[prop] || prop
    // auto-prefix / invalid key warning
    if (!validProps[prop]) {
      const prefixed = `-${vendorPrefix}-${prop}`
      if (validProps[prefixed]) prop = prefixed
    }
    // replace $ var refs with css var refs
    if (value.indexOf('$') >= 0) value = value.replace(/\$([a-z0-9-]+)/gi, 'var(--$1)')
    // auto-px
    if (needsPx(prop))
      value = value
        .split(' ')
        .map(part => (isNaN(part) ? part : part + unit))
        .join(' ')
    const rule = `  ${prop}: ${value};\n`
    if (debug && !isValidCss(id, rule)) err('invalid css', rule)
    ctx._rules += rule
  }

  const PROP = 1
  const VALUE = 2
  const parseRules = memo(str => {
    const ctx = [{ _rules: '', _nested: [] }]
    str = str && str.trim()
    if (!str) return ctx[0]
    str += ';' // append semi to properly commit last rule
    let mode = PROP
    let buffer = ''
    let depth = 0
    let quote = ''
    let curProp = ''
    for (let i = 0; i < str.length; i++) {
      const char = str[i]
      if (char == '\n' || ((char == ';' || char == '}') && !quote)) {
        // end of rule, process key/value
        assignRule(ctx[depth], curProp, buffer.trim() + quote)
        if (char == '}') ctx[--depth]._nested.push(ctx.pop())
        mode = PROP
        curProp = buffer = quote = ''
      } else if (char == '{' && !quote) {
        // block open, pre-process helper and create new ctx
        ctx[++depth] = {
          _selector: runHelper(curProp, buffer.trim()) || (curProp + ' ' + buffer).trim(),
          _rules: '',
          _nested: []
        }
        mode = PROP
        curProp = buffer = ''
      } else if (mode == PROP) {
        if (char == ' ') {
          if ((curProp = buffer.trim())) {
            // first space with value in curProp means we search for value
            mode = VALUE
            buffer = ''
          }
        } else buffer += char
      } else if (mode == VALUE) {
        // ignore special parser tokens while inside of quotes
        if (quote) {
          if (char == quote && str[i - 1] != '\\') quote = ''
        } else if (char == "'" || char == '"') {
          quote = char
        }
        buffer += char
      }
    }
    return ctx[0]
  })

  const createKeyframes = memo(rules => {
    const name = 'anim-' + id + '-' + (idCount += 1)
    appendRule('@keyframes ' + name, parseRules(rules))
    return name
  })

  const createStyle = memo(rules => {
    const parsed = parseRules(rules)
    const className = (parsed._name ? parsed._name + '-' : '') + id + '-' + (idCount += 1)
    appendRule('.' + className, parsed)
    return new Style(className + (parsed._compose ? ' ' + parsed._compose : ''))
  })

  const z = handleTemplate(createStyle)
  z.anim = handleTemplate(createKeyframes)
  z.concat = concat
  z.getSheet = () => style
  z.global = handleTemplate(rules => appendRule(':root', parseRules(rules)))
  z.helper = spec => Object.assign(helpers, spec)
  z.new = makeZ
  z.setDebug = flag => (debug = flag)
  z.setDot = flag => (dot = flag)
  z.style = handleTemplate(rules => parseRules(rules)._rules)
  return z
}

export default makeZ()
