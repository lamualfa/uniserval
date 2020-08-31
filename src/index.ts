import nodeFetch from 'node-fetch'
import urlJoin from 'url-join'
import { JSDOM, ConstructorOptions as JSDOMOptions } from 'jsdom'

export type Options = {
  host?: string
  path?: string
  eventName?: string
  userAgent?: string
  cookie?: string
  beforeEval?: (dom: JSDOM) => void
  afterEval?: (dom: JSDOM) => void
}

// eslint-disable-next-line
function noop(): void | any {
  // Just to fill in the blanks
}

export function renderToString(
  html: string,
  script: string,
  serverProps?: Record<string, unknown>,
  options: Options = {}
): Promise<string> {
  return new Promise((resolve) => {
    const jsdomOptions: JSDOMOptions = {
      runScripts: 'outside-only',
      url: urlJoin(options.host || 'http://jsdom.ssr', options.path || '/'),
    }
    if (options.userAgent) jsdomOptions.userAgent = options.userAgent

    const dom = new JSDOM(html, jsdomOptions)
    Object.defineProperty(dom, 'fetch', nodeFetch)
    dom.window.serverProps = serverProps
    dom.window.rendering = true
    dom.window.document.cookie = options.cookie
    dom.window.alert = noop
    dom.window.scrollTo = noop
    dom.window.requestAnimationFrame = noop
    dom.window.cancelAnimationFrame = noop
    dom.window.TextEncoder = TextEncoder
    dom.window.TextDecoder = TextDecoder
    function render() {
      if (options.afterEval) options.afterEval(dom)
      const html = dom.serialize()
      dom.window.close()
      resolve(html)
    }

    if (options.eventName)
      dom.window.addEventListener(options.eventName, render)

    if (options.beforeEval) options.beforeEval(dom)
    dom.window.eval(script)

    if (!options.eventName) render()
  })
}
