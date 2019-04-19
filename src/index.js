let debug = false

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
  us: 'user-select'
}

const appendRule = (sel, rules) =>
  rules.nest.concat({ sel, rules }).forEach(r => {
    if (r.rules.style.trim().length <= 0) return
    const rule = `\n${r.sel.replace(/&/g, sel)} {\n${r.rules.style}}\n`
    if (debug) style.textContent += rule
    else sheet.insertRule(rule)
  })

const propRegex = /(^|;|\n)\s*([A-z-]+)?:?([ ]+[^;\n$]+)?/gm
const ruleRegex = /(&.+)\{([^}]+)\}/gm

const parseRules = memo(rules => {
  let nest = []
  const style = rules
    .trim()
    .replace(ruleRegex, (_full, sel, subRules) => {
      nest.push({ sel: sel.trim(), rules: parseRules(subRules) })
      return ''
    })
    .replace(propRegex, (_full, _start, key, value) => {
      key = key && key.trim()
      if (!key) return ''
      const helper = helpers[key]
      if (helper) {
        const helperRules = parseRules(
          helper.call ? helper(...(value ? value.trim().split(' ') : [])) : helper
        )
        nest = nest.concat(helperRules.nest)
        return helperRules.style
      }
      if (!value) return ''
      key = short[key] || key
      if (!validProps[key]) {
        const prefixed = `-${vendorPrefix}-${key}`
        if (validProps[prefixed]) key = prefixed
        else if (debug) return console.warn('warning invalid key', key), ''
      }
      return `  ${key}: ${value.trim()};\n`
    })
  return { style, nest }
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
  if (typeof parts === 'string') parts = [parts]
  if (!Array.isArray(parts)) return ''
  return createStyle(zip(parts, args))
}
z.add = (sel, rules) => (appendRule(sel, parseRules(rules)), z)
z.getSheet = () => style
z.helper = spec => Object.assign(helpers, spec)
z.setDebug = flag => (debug = flag)
export default z
