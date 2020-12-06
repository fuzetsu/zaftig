declare module 'zaftig' {
  interface ZaftigStyle {
    class: string
    className: string
    concat: ConcatStyle
    toString(): string
    valueOf(): string
    z: ZaftigFn<ZaftigStyle>
  }

  type ConcatStyle = (
    ...things: (ZaftigStyle | string | false | null | 0 | undefined)[]
  ) => ZaftigStyle

  type ZaftigTemplateFn<T> = (
    body: TemplateStringsArray,
    ...subs: (string | number | boolean)[]
  ) => T
  type ZaftigStringFn<T> = (style: string) => T
  type ZaftigFn<T> = ZaftigTemplateFn<T> & ZaftigStringFn<T>

  type HelperMap = { [key: string]: string | ((...args: any[]) => string) }

  const z: ZaftigFn<ZaftigStyle> & {
    anim: ZaftigFn<string>
    concat: ConcatStyle
    getSheet(): HTMLStyleElement
    global: ZaftigFn<void>
    helper(helpers: HelperMap): void
    style: ZaftigFn<string>
    setDebug(state: boolean): void
    setDot(state: boolean): void
    ['new'](conf?: {
      debug?: boolean
      dot: boolean
      helpers?: HelperMap
      id?: string
      style?: HTMLStyleElement
      unit?: 'rem' | 'px' | 'em'
    }): typeof z
  }

  export default z
}
