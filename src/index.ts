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

export function renderToString(
  html: string,
  script: string,
  serverProps?: Record<string, unknown>,
  options: Options = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const jsdomOptions: JSDOMOptions = {
      runScripts: 'outside-only',
      url: urlJoin(options.host || 'http://jsdom.ssr', options.path || '/'),
    }
    if (options.userAgent) jsdomOptions.userAgent = options.userAgent

    const dom = new JSDOM(html, jsdomOptions)

    dom.window.serverProps = serverProps
    dom.window.document.cookie = options.cookie
    safeDom(dom)

    function render() {
      let isError
      let payload

      try {
        if (options.afterEval) options.afterEval(dom)
        payload = dom.serialize()
      } catch (error) {
        isError = true
        payload = error
      }

      dom.window.close()
      if (isError) reject(payload)
      else resolve(payload)
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
