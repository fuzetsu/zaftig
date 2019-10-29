// const p = (...args) => (console.log(...args), args[0])

const zip = (parts, args) =>
  parts.reduce((acc, c, i) => acc + c + (args[i] == null ? '' : args[i]), '')

const memo = (fn, cache = {}) => x => (x in cache ? cache[x] : (cache[x] = fn(x)))

const dash = nodash => nodash.replace(/[A-Z]/g, m => '-' + m.toLowerCase())

const initials = str =>
  str[0] +
  str
    .slice(1)
    .replace(/[a-z]/g, '')
    .toLowerCase()

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

const findStyle = obj => (obj.hasOwnProperty('width') ? obj : findStyle(Object.getPrototypeOf(obj)))

// collect valid props and their shorthands
const props = Object.keys(findStyle(document.documentElement.style)).filter(
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

const testDiv = document.createElement('div')
const needsPx = memo(
  prop =>
    ['0', '0 0'].some(val => {
      testDiv.style.cssText = `${prop}: ${val};`
      return testDiv.style.cssText.slice(-3) == 'px;'
    }),
  {
    border: true,
    'border-left': true,
    'border-right': true,
    'border-top': true,
    'border-bottom': true
  }
)

const selSep = /\s*,\s*/

const processSelector = (sel, psel) =>
  psel
    .split(selSep)
    .reduce(
      (acc, ppart) =>
        acc.concat(
          sel
            .split(selSep)
            .map(part =>
              part.indexOf('&') >= 0
                ? part.replace(/&/g, ppart)
                : ppart + (part[0] == ':' || part[0] == '[' ? '' : ' ') + part
            )
        ),
      []
    )
    .join(',\n')

class Style {
  constructor(className) {
    this.class = className
    this.className = className
  }
  toString() {
    return this.class
  }
  valueOf() {
    return '.' + this.class
  }
}

const wrap = (sel, body) => (sel && body ? `\n${sel} {\n${body}}\n` : '')

const handleTemplate = fn => (parts, ...args) => {
  try {
    return typeof parts === 'string' ? fn(parts) : Array.isArray(parts) ? fn(zip(parts, args)) : ''
  } catch (e) {
    console.error('zaftig: error `', parts, '`', args, '\n', e)
    return ''
  }
}

const createSheet = () => document.head.appendChild(document.createElement('style'))

const _testSheet = createSheet()
const isValidSel = sel => {
  try {
    _testSheet.sheet.insertRule(sel + '{}', 0)
    _testSheet.sheet.deleteRule(0)
    return true
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
    return name[0] == '-' || isValidSel(paran ? full + '.f)' : full)
      ? full
      : pre + '-' + vendorPrefix + '-' + name + (paran || '')
  })

const makeZ = (conf = {}) => {
  const {
    helpers = {},
    unit = 'px',
    id = 'z' +
      Math.random()
        .toString(36)
        .slice(2)
  } = conf
  let { style, debug = false } = conf
  let idCount = 0

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
      if (debug) {
        // rule inserted above is overwritten when textContent is
        style.textContent += rule
        if (prefix) console.warn('zaftig: prefixed', sel, '|', prefixSelector(sel))
      }
    } catch (e) {
      // if insert fails, attempt again if selector can be prefixed
      if (!prefix && rule.indexOf(':') >= 0) addToSheet(sel, body, true)
      else console.error('zaftig: insert failed', rule, e)
    }
  }

  const appendSpecialRule = ctx => {
    if (ctx.media) {
      ctx.sub.forEach(c => c.media && (c.sel = ctx.sel + ' and ' + c.sel))
      ctx.sel = '@media ' + ctx.sel
    }
    if (ctx.rul) addToSheet(ctx.sel, ctx.rul.replace(/^/gm, '  ') + '\n')
    if (ctx.sub) ctx.sub.forEach(appendSpecialRule)
  }

  const appendSpecial = (sel, rules, psel = '', pctx) => {
    const media = sel.indexOf('@media') == 0
    const ctx = {
      sel: media ? sel.slice(sel.indexOf(' ') + 1) : sel,
      media,
      sub: [],
      rul: media ? wrap(psel, rules.rul) : ''
    }
    rules.sub.forEach(n => appendRule(n.sel, n, psel == ':root' ? '' : psel, ctx))
    if (pctx) pctx.sub.push(ctx)
    else appendSpecialRule(ctx)
  }

  const appendRule = (sel, rules, psel = '', pctx) => {
    if (/^@(media|keyframes)/.test(sel))
      return appendSpecial(sel, rules, psel == '' ? ':root' : psel, pctx)
    if (psel && (!pctx || pctx.media)) sel = processSelector(sel, psel)
    if (pctx) pctx.rul += wrap(sel, rules.rul)
    else addToSheet(sel, rules.rul)
    rules.sub.forEach(n => appendRule(n.sel, n, sel == ':root' ? '' : sel, pctx))
  }

  const runHelper = (key, value) => {
    const helper = helpers[key]
    return typeof helper === 'function'
      ? helper(...(value || '').split(' '))
      : helper && helper + ' ' + value
  }

  const assignRule = (ctx, key, value) => {
    if (value && !key) (key = value), (value = '')
    if (!key) return
    // special instructions
    if (key[0] == '$') {
      if (key == '$name') return (ctx.name = value)
      if (key == '$compose') return (ctx.cmp = value)
      // everything else is a css var
      key = '--' + key.slice(1)
    }
    // helper handling
    const helper = runHelper(key, value)
    if (helper) {
      const parsed = parseRules(helper)
      ctx.rul += parsed.rul
      ctx.sub = ctx.sub.concat(parsed.sub)
      return
    }
    if (!value) return
    // shorthand handling
    key = short[key] || key
    // auto-prefix / invalid key warning
    if (!validProps[key]) {
      const prefixed = `-${vendorPrefix}-${key}`
      if (validProps[prefixed]) key = prefixed
      else if (debug && key.indexOf('--') < 0) console.warn('zaftig: unknown key', key)
    }
    // replace $ var refs with css var refs
    if (value.indexOf('$') >= 0) value = value.replace(/\$([a-z0-9-]+)/gi, 'var(--$1)')
    // auto-px
    if (needsPx(key))
      value = value
        .split(' ')
        .map(part => (isNaN(part) ? part : part + unit))
        .join(' ')
    ctx.rul += `  ${key}: ${value};\n`
  }

  const PROP = 1
  const VALUE = 2
  const parseRules = memo(str => {
    const ctx = [{ rul: '', sub: [] }]
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
        if (char == '}') ctx[--depth].sub.push(ctx.pop())
        mode = PROP
        curProp = buffer = quote = ''
      } else if (char == '{' && !quote) {
        // block open, pre-process helper and create new ctx
        ctx[++depth] = {
          sel: runHelper(curProp, buffer.trim()) || (curProp + ' ' + buffer).trim(),
          rul: '',
          sub: []
        }
        mode = PROP
        curProp = buffer = ''
      } else if (mode == PROP) {
        if (char == ' ') {
          if ((curProp = buffer.trim())) {
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
    const className =
      (parsed.name ? parsed.name.replace(/\s+/, '-') + '-' : '') + id + '-' + (idCount += 1)
    appendRule('.' + className, parsed)
    return new Style(className + (parsed.cmp ? ' ' + parsed.cmp : ''))
  })

  const z = handleTemplate(createStyle)
  z.global = handleTemplate(rules => appendRule(':root', parseRules(rules)))
  z.anim = handleTemplate(createKeyframes)
  z.style = handleTemplate(rules => parseRules(rules).rul)
  z.getSheet = () => style
  z.helper = spec => Object.assign(helpers, spec)
  z.setDebug = flag => (debug = flag)
  z.new = makeZ
  return z
}

export default makeZ()
