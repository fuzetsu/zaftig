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
  'display',
  'backgroundColor',
  'color',
  'margin',
  'padding',
  'height',
  'width',
  'fontSize',
  'top',
  'right',
  'borderRadius',
  'textAlign',
  'textDecoration',
  'marginTop',
  'boxShadow',
  'whiteSpace',
  'fontFamily',
  'userSelect',
  'flexDirection'
]

const findStyle = obj => (obj.hasOwnProperty('width') ? obj : findStyle(Object.getPrototypeOf(obj)))

const validProps = {}
const short = {}
for (const prop of Object.keys(findStyle(document.documentElement.style)).concat(popular)) {
  if (prop.indexOf('-') < 0 && prop != 'length') {
    let dashed = dash(prop)
    let init = initials(prop)
    if (prop.toLowerCase().indexOf(vendorPrefix) == 0) {
      init = init.slice(1)
      dashed = dashed[0] == '-' ? dashed : '-' + dashed
      if (!short[init]) short[init] = dashed
    } else short[init] = dashed
    validProps[dashed] = true
  }
}

const testDiv = document.createElement('div')
const needsPx = memo(prop =>
  ['0', '0 0'].some(val => {
    testDiv.style.cssText = `${prop}: ${val};`
    return testDiv.style.cssText.slice(-3) == 'px;'
  })
)

const selSep = /\s*,\s*/

const processSelector = (sel, psel) =>
  psel
    .split(selSep)
    .flatMap(ppart =>
      sel
        .split(selSep)
        .map(part =>
          part.indexOf('&') >= 0
            ? part.replace(/&/g, ppart)
            : ppart + (part[0] == ':' ? '' : ' ') + part
        )
    )
    .join(',\n')

class Style {
  constructor(className, style) {
    this.class = className
    this.className = className
    this.style = style
  }
  toString() {
    return this.class
  }
  valueOf() {
    return '.' + this.class
  }
}

const wrap = (sel, body) => (sel && body ? `\n${sel} {\n${body}}\n` : '')

const handleError = fn => x => {
  try {
    return fn(x)
  } catch (e) {
    console.error('zaftig: error `', x, '`\n', e)
    return ''
  }
}

const handleTemplate = (parts, args, fn) => {
  if (typeof parts === 'string') return fn(parts)
  if (Array.isArray(parts)) return fn(zip(parts, args))
  return ''
}

const makeZ = (conf = {}) => {
  const {
    helpers = {},
    parser = {},
    unit = 'px',
    id = 'z' +
      Math.random()
        .toString(36)
        .slice(2)
  } = conf
  let { style, debug = false } = conf
  let idCount = 0

  const addToSheet = (sel, body) => {
    const rule = wrap(sel, body)
    if (rule) {
      if (!style) {
        style = document.head.appendChild(document.createElement('style'))
        style.id = id
      }
      if (debug) style.textContent += rule
      else style.sheet.insertRule(rule, style.sheet.cssRules.length)
    }
  }

  const appendSpecialRule = ctx => {
    if (ctx.media) {
      const query = ctx.sel.slice(ctx.sel.indexOf(' ') + 1)
      ctx.sub.forEach(c => c.media && (c.sel += ' and ' + query))
    }
    if (ctx.rules) addToSheet(ctx.sel, ctx.rules.replace(/^/gm, '  ') + '\n')
    if (ctx.sub) ctx.sub.forEach(appendSpecialRule)
  }

  const appendSpecial = (sel, rules, psel = '', pctx = null) => {
    const media = sel.indexOf('@media') == 0
    const ctx = {
      sel,
      media,
      sub: [],
      rules: media ? wrap(psel, rules.style) : ''
    }
    rules.nest.forEach(n => appendRule(n.sel, n, psel, ctx))
    if (pctx) pctx.sub.push(ctx)
    else appendSpecialRule(ctx)
  }

  const appendRule = (sel, rules, psel = '', pctx = null) => {
    if (/^@(media|keyframes)/.test(sel)) return appendSpecial(sel, rules, psel, pctx)
    if (psel && (!pctx || pctx.media)) sel = processSelector(sel, psel)
    if (pctx) pctx.rules += wrap(sel, rules.style)
    else addToSheet(sel, rules.style)
    rules.nest.forEach(n => appendRule(n.sel, n, sel == ':root' ? '' : sel, pctx))
  }

  const assignRule = (ctx, key, value) => {
    if (value && !key) (key = value), (value = '')
    if (!key) return
    // special instructions
    if (key[0] == '$') {
      if (key == '$name') return (ctx.name = value)
      if (key == '$compose') return (ctx.comp = value)
      // everything else is a css var
      key = '--' + key.slice(1)
    }
    // helper handling
    let helper = helpers[key]
    if (helper) {
      if (typeof helper == 'function') helper = helper(...(value || '').split(' '))
      const parsed = typeof helper == 'string' ? parseRules(helper) : helper
      ctx.style += parsed.style
      ctx.nest = ctx.nest.concat(parsed.nest)
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
    ctx.style += `  ${key}: ${value};\n`
  }

  const PROP = 1
  const VALUE = 2
  const { OPEN = '{', CLOSE = '}', BREAK = ';' } = parser
  const parseRules = memo(str => {
    const ctx = [{ style: '', nest: [] }]
    str = str && str.trim()
    if (!str) return ctx[0]
    str += BREAK // append semi to properly commit last rule
    let mode = PROP
    let buffer = ''
    let depth = 0
    let quote = ''
    let char, curProp
    for (let i = 0; i < str.length; i++) {
      char = str[i]
      if (char == '\n' || ((char == BREAK || char == CLOSE) && !quote)) {
        assignRule(ctx[depth], curProp, buffer.trim() + quote)
        if (char == CLOSE) ctx[--depth].nest.push(ctx.pop())
        mode = PROP
        curProp = buffer = quote = ''
      } else if (char == OPEN && !quote) {
        ctx[++depth] = { sel: (curProp + ' ' + buffer).trim(), style: '', nest: [] }
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

  const createKeyframes = handleError(
    memo(rules => {
      const name = 'anim-' + id + '-' + (idCount += 1)
      appendRule('@keyframes ' + name, parseRules(rules))
      return name
    })
  )

  const createStyle = handleError(
    memo(rules => {
      const parsed = parseRules(rules)
      const className =
        (parsed.name ? parsed.name.replace(/\s+/, '-') + '-' : '') + id + '-' + (idCount += 1)
      appendRule('.' + className, parsed)
      return new Style(className + (parsed.comp ? ' ' + parsed.comp : ''), parsed.style)
    })
  )

  const z = (parts, ...args) => handleTemplate(parts, args, createStyle)
  z.global = (parts, ...args) =>
    handleTemplate(parts, args, handleError(rules => appendRule(':root', parseRules(rules))))
  z.anim = (parts, ...args) => handleTemplate(parts, args, createKeyframes)
  z.getSheet = () => style
  z.helper = spec => Object.assign(helpers, spec)
  z.setDebug = flag => (debug = flag)
  z.new = makeZ
  return z
}

export default makeZ()
