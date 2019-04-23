let debug = false

const PROP = 1
const VALUE = 2

const newLine = /\r?\n/g

const quotes = ['"', "'"]
const ruleBreak = [';', '\n', '}']

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

const findStyle = obj => (obj.hasOwnProperty('width') ? obj : findStyle(Object.getPrototypeOf(obj)))
const vendorPrefix = 'webkit'
const styleProps = []
const vendorProps = []
Object.keys(findStyle(document.documentElement.style)).forEach(k => {
  if (k.includes('-') || k === 'length') return
  if (k.toLowerCase().startsWith(vendorPrefix))
    vendorProps.push({
      init: initials(k).slice(1),
      prop: (k.startsWith(vendorPrefix) ? '-' : '') + dash(k)
    })
  else styleProps.push({ init: initials(k), prop: dash(k) })
})
const allProps = vendorProps.concat(styleProps)
const validProps = allProps.reduce((obj, s) => ((obj[s.prop] = true), obj), {})
const short = {
  ...allProps.reduce((obj, s) => ((obj[s.init] = s.prop), obj), {}),
  d: 'display',
  bc: 'background-color',
  c: 'color',
  m: 'margin',
  p: 'padding',
  h: 'height',
  w: 'width',
  fs: 'font-size',
  t: 'top',
  r: 'right',
  br: 'border-radius',
  ta: 'text-align',
  td: 'text-decoration',
  mt: 'margin-top',
  bs: 'box-shadow',
  ws: 'white-space',
  ff: 'font-family',
  us: 'user-select',
  fd: 'flex-direction'
}

const appendRule = (sel, rules, psel = '') => {
  if (psel) sel = sel.includes('&') ? sel.replace(/&/g, psel) : psel + ' ' + sel
  rules.nest.forEach(n => appendRule(n.sel, n, sel))
  if (rules.style.trim().length <= 0) return
  const rule = `\n${sel} {\n${rules.style}}\n`
  if (debug) style.textContent += rule
  else sheet.insertRule(rule)
}

const assignRule = (ctx, key, value) => {
  key = key && key.trim()
  value = value && value.trim()
  if (!key) return
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
    else if (debug && !key.startsWith('--')) console.warn('warning invalid key', key)
  }
  ctx.style += `  ${key}: ${value.replace(newLine, '')};\n`
}

const parseRules = memo(str => {
  const ctx = [{ style: '', nest: [] }]
  str = str && str.trim()
  if (!str) return ctx[0]
  str += ';' // append semi to properly commit last rule
  let mode = PROP
  let buffer = ''
  let depth = 0
  let char, curProp, quote
  for (let i = 0, len = str.length; i < len; i++) {
    char = str[i]
    if (mode == PROP) {
      if (char == ' ') {
        curProp = ''
        if (buffer) {
          curProp = buffer.trim()
          mode = VALUE
          buffer = ''
        }
      } else if (ruleBreak.includes(char)) {
        if (buffer.trim()) assignRule(ctx[depth], buffer)
        if (char == '}') ctx[--depth].nest.push(ctx.pop())
        mode = PROP
        buffer = ''
      } else buffer += char
    } else if (mode == VALUE) {
      if (quote) {
        if (char == quote && str[i - 1] !== '\\') quote = ''
        buffer += char
      } else if (quotes.includes(char)) {
        buffer += quote = char
      } else if (char == '{') {
        ctx[++depth] = { sel: `${curProp} ${buffer}`.trim(), style: '', nest: [] }
        mode = PROP
        buffer = ''
      } else if (ruleBreak.includes(char)) {
        assignRule(ctx[depth], curProp, buffer)
        if (char == '}') ctx[--depth].nest.push(ctx.pop())
        mode = PROP
        buffer = ''
      } else buffer += char
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
  const parsed = parseRules(rules)
  const className = id + '-' + (idCount += 1)
  appendRule('.' + className, parsed)
  return new Style(className, parsed.style)
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
