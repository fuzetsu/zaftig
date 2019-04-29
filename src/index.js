let debug = false

const PROP = 1
const VALUE = 2

const helpers = {}

const id =
  'z' +
  Math.random()
    .toString(36)
    .slice(2)
let idCount = 0

const style = document.head.appendChild(document.createElement('style'))
style.id = id
const sheet = style.sheet

// const p = (...args) => (console.log(...args), args[0])

const zip = (parts, args) =>
  parts.reduce((acc, c, i) => acc + c + (args[i] == null ? '' : args[i]), '')

const memo = (fn, cache = {}) => x => cache[x] || (cache[x] = fn(x))

const dash = nodash => nodash.replace(/[A-Z]/g, m => '-' + m.toLowerCase())

const initials = str =>
  str[0] +
  str
    .slice(1)
    .replace(/[a-z]/g, '')
    .toLowerCase()

const vendorPrefix = 'webkit'

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

const validProps = []
const short = []
for (const prop of Object.keys(findStyle(document.documentElement.style)).concat(popular)) {
  if (!prop.includes('-') && prop != 'length') {
    const dashed = dash(prop)
    let init = initials(prop)
    if (prop.toLowerCase().startsWith(vendorPrefix)) {
      init = init.slice(1)
      if (!short[init]) short[init] = dashed[0] == '-' ? dashed : '-' + dashed
    } else short[init] = dashed
    validProps[dashed] = true
  }
}

const specialSel = /^@(media|keyframes)/

const wrap = (sel, body) => (sel && body ? `\n${sel} {\n${body}}\n` : '')

const addToSheet = (sel, body) => {
  const rule = wrap(sel, body)
  if (rule) {
    if (debug) style.textContent += rule
    else sheet.insertRule(rule, sheet.cssRules.length)
  }
}

const appendSpecialRule = spec => {
  if (spec.media) {
    const query = spec.sel.slice(spec.sel.indexOf(' ') + 1)
    spec.sub.forEach(c => c.media && (c.sel += ' and ' + query))
  }
  if (spec.rules) addToSheet(spec.sel, spec.rules.replace(/^/gm, '  ') + '\n')
  if (spec.sub) spec.sub.forEach(appendSpecialRule)
}

const appendSpecial = (sel, rules, psel = '', pctx = null) => {
  const media = sel.startsWith('@media')
  const ctx = {
    sel,
    media,
    sub: [],
    rules: media && psel && rules.style ? wrap(psel, rules.style) : ''
  }
  rules.nest.forEach(n => appendRule(n.sel, n, psel, ctx))
  if (pctx) pctx.sub.push(ctx)
  else appendSpecialRule(ctx)
}

const appendRule = (sel, rules, psel = '', pctx = null) => {
  if (specialSel.test(sel)) return appendSpecial(sel, rules, psel, pctx)
  if (psel && (!pctx || pctx.media)) {
    sel = sel.includes('&') ? sel.replace(/&/g, psel) : psel + (sel[0] == ':' ? '' : ' ') + sel
  }
  if (pctx) pctx.rules += wrap(sel, rules.style)
  else addToSheet(sel, rules.style)
  rules.nest.forEach(n => appendRule(n.sel, n, sel, pctx))
}

const assignRule = (ctx, key, value) => {
  if (value && !key) (key = value), (value = '')
  if (!key) return
  if (key[0] == '$') return (ctx.uname = value)
  let helper = helpers[key]
  if (helper) {
    if (typeof helper == 'function') helper = helper(...(value || '').split(' '))
    const parsed = typeof helper == 'string' ? parseRules(helper) : helper
    ctx.style += parsed.style
    ctx.nest = ctx.nest.concat(parsed.nest)
    return
  }
  if (!value) return
  key = short[key] || key
  if (!validProps[key]) {
    const prefixed = `-${vendorPrefix}-${key}`
    if (validProps[prefixed]) key = prefixed
    else if (debug && !key.startsWith('--')) console.warn('zaftig: unknown key', key)
  }
  ctx.style += `  ${key}: ${value};\n`
}

const parseRules = memo(str => {
  const ctx = [{ style: '', nest: [] }]
  str = str && str.trim()
  if (!str) return ctx[0]
  str += ';' // append semi to properly commit last rule
  let mode = PROP
  let buffer = ''
  let depth = 0
  let quote = ''
  let char, curProp
  for (let i = 0, len = str.length; i < len; i++) {
    char = str[i]
    if (char == '\n' || ((char == ';' || char == '}') && !quote)) {
      assignRule(ctx[depth], curProp, buffer.trim() + quote)
      if (char == '}') ctx[--depth].nest.push(ctx.pop())
      mode = PROP
      curProp = buffer = quote = ''
    } else if (char == '{' && !quote) {
      ctx[++depth] = { sel: `${curProp} ${buffer}`.trim(), style: '', nest: [] }
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

class Style {
  constructor(className, style) {
    this.className = className
    this.class = className
    this.style = style
  }
  toString() {
    return this.className
  }
  valueOf() {
    return '.' + this.className
  }
}

const createStyle = memo(rules => {
  try {
    const parsed = parseRules(rules)
    const className = (parsed.uname ? parsed.uname + '-' : '') + id + '-' + (idCount += 1)
    appendRule('.' + className, parsed)
    return new Style(className, parsed.style)
  } catch (e) {
    console.error('zaftig: error `', rules, '`\n', e)
    return ''
  }
})

const z = (parts, ...args) => {
  if (typeof parts === 'string') return createStyle(parts)
  if (Array.isArray(parts)) return createStyle(zip(parts, args))
  return ''
}
z.all = (...rules) => rules.map(createStyle).join(' ')
z.add = (sel, rules) => (appendRule(sel, parseRules(rules)), z)
z.getSheet = () => style
z.helper = spec => Object.assign(helpers, spec)
z.setDebug = flag => (debug = flag)
export default z
