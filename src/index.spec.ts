import { renderToString } from './index'

function generateSample(
  scriptBody?: string,
  expectedBody?: string,
  emitEvent?: boolean
) {
  return {
    html: '<html><head></head><body><canvas></canvas></body></html>',
    script: `(function() {${scriptBody || ''}
    ${emitEvent && `dispatchEvent(new CustomEvent("app-loaded"));`}
  })();`,
    expected: `<html><head></head><body><canvas></canvas>${expectedBody}</body></html>`,
  }
}

describe('Return valid HTML', () => {
  it('simple `appendChild` script', async () => {
    const { html, script, expected } = generateSample(
      `const div = document.createElement('div');
    document.body.appendChild(div);`,
      '<div></div>'
    )

    expect(await renderToString(html, script)).toBe(expected)
  })

  it('simple `appendChild` script#emit event', async () => {
    const { html, script, expected } = generateSample(
      `const div = document.createElement('div');
    document.body.appendChild(div);`,
      '<div></div>',
      true
    )

    expect(
      await renderToString(html, script, null, {
        eventName: 'app-loaded',
      })
    ).toBe(expected)
  })

  it('with `ssrProps`', async () => {
    const simpleText = 'Hello Palestine'
    const { html, script, expected } = generateSample(
      `const text = document.createElement('span');
    text.textContent=window.serverProps.simpleText;
    document.body.appendChild(text);`,
      `<span>${simpleText}</span>`
    )

    expect(
      await renderToString(html, script, {
        simpleText,
      })
    ).toBe(expected)
  })

  it('with `beforeEval`', async () => {
    const { html, script, expected } = generateSample(
      null,
      '<a class="link"></a>'
    )

    expect(
      await renderToString(
        html,
        script,
        {},
        {
          beforeEval: (dom) => {
            const anchor = dom.window.document.createElement('a')
            anchor.classList.add('link')
            dom.window.document.body.appendChild(anchor)
          },
        }
      )
    ).toBe(expected)
  })
})
