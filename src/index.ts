import nodeFetch from 'node-fetch'
import urlJoin from 'url-join'
import { JSDOM, ConstructorOptions as JSDOMOptions } from 'jsdom'

interface DOM extends JSDOM {
  fetch?: nodeFetch
}

export type Options = {
  host?: string
  path?: string
  eventName?: string
  userAgent?: string
  cookie?: string
  beforeEval?: (dom: JSDOM) => void
  afterEval?: (dom: JSDOM) => void
  isStaticPage?: boolean
  serverPropsFieldName?: string
}

// eslint-disable-next-line
function noop(): void | any {
  // Just to fill in the blanks
}

function safeDom(dom: DOM) {
  dom.fetch = nodeFetch
  dom.window.rendering = true
  dom.window.alert = noop
  dom.window.scrollTo = noop
  dom.window.requestAnimationFrame = noop
  dom.window.cancelAnimationFrame = noop
  dom.window.TextEncoder = TextEncoder
  dom.window.TextDecoder = TextDecoder
}

const cacheStaticPages = {}

export function renderToString(
  html: string,
  script: string,
  serverProps?: Record<string, unknown>,
  options: Options = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const path = options.path || '/'
    if (options.isStaticPage && cacheStaticPages[path])
      return resolve(cacheStaticPages[path])

    const jsdomOptions: JSDOMOptions = {
      runScripts: 'outside-only',
      url: urlJoin(options.host || 'http://jsdom.ssr', path),
    }
    if (options.userAgent) jsdomOptions.userAgent = options.userAgent

    const dom = new JSDOM(html, jsdomOptions)

    dom.window[options.serverPropsFieldName || 'serverProps'] = serverProps
    dom.window.document.cookie = options.cookie
    safeDom(dom)

    function render() {
      let err
      let html

      try {
        if (options.afterEval) options.afterEval(dom)
        html = dom.serialize()
        if (options.isStaticPage) cacheStaticPages[path] = html
      } catch (error) {
        err = error
      } finally {
        dom.window.close()
        if (html) resolve(html)
        else reject(err)
      }
    }

    try {
      if (options.beforeEval) options.beforeEval(dom)

      if (options.eventName)
        // Register event
        dom.window.addEventListener(options.eventName, render)

      dom.window.eval(script)

      if (!options.eventName) render()
    } catch (error) {
      reject(error)
    }
  })
}
