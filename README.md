[![Version](https://badgen.net/npm/v/uniserv?color=blue&label=version)](https://npmjs.com/package/uniserv)
[![Github License](https://badgen.net/github/license/lamualfa/uniserv?color=purple&label=license)](https://github.com/lamualfa/uniserv/blob/master/LICENSE)
[![CI Testing](https://github.com/lamualfa/uniserv/workflows/CI%20Testing/badge.svg)](https://github.com/lamualfa/uniserv/actions?query=workflow%3A%22CI+Testing%22)
[![Maintainability](https://api.codeclimate.com/v1/badges/da819077ced8476f6b42/maintainability)](https://codeclimate.com/github/lamualfa/uniserv/maintainability)

# Universal Server Side Rendering (SSR)

Use Server Side Rendering (SSR) everywhere.

> _Inspired from [@sveltech/ssr](https://github.com/roxiness/ssr)._

## Features

- Typescript support.
- Ease of Integration. You can integrate it with Golang, Rust, Java, PHP and etc via HTTP Server or Child Process. (_On Progress_)
- Can be used with Vanilla JS, jQuery, Svelte, Routify, Handlebars and etc.
- Can be used in Lambda Functions (or Serverless) like AWS Lambda, Netlify, Vercel and etc. (_NodeJS v10 or newer required._)
- Passing custom Props like `cookie`, `session` and etc to Javascript Code. (_We avoid to use meta tag for temporary state or data to increase performance. Assigning data to `window` object is faster than create new meta element._)

## Installation

We don't need any special template. Just install the `uniserv` library with your package manager:

```bash
yarn add uniserv
# or
npm i uniserv
```

## Usage

### Using Express JS (Node JS)

```js
const express = require('express')
const { readFileSync } = require('fs')
const { renderToString } = require('uniserv')

const template = readFileSync('./public/template.html', 'utf8')
const script = readFileSync('./public/script.js', 'utf8')

const server = express()

// If you are using a JS framework like Svelte, Routify, etc.,
// please uncomment the code below to use Dynamic Import (or Lazy Component)

// server.use(express.static('./public'))

server.use((req, res) => {
  renderToString(
    template,
    script,
    {
      // Put in here the data you want to access it from Javascript code.
      // You can access the data in `window.serverProps`.

      // Example:
      pageTitle: `Now you're in: ${req.path}`,
    },
    {
      path: req.path,
    }
  )
    .then((stringHtml) => {
      res.send(stringHtml)
    })
    .catch((error) => {
      // Handle error in here
    })
})

server.listen(3000)
```

## API

### `renderToString(html, script, serverProps, options)`

#### Description

Render HTML & Javascript code to string.

#### Arguments

- `html` - HTML string that will be processed.
- `script` - Javascript code that will be executed.
- `serverProps` - Custom data that will be passed to `script` code. The data can be accessed from `window.serverProps`.
- `options` - Configuration
  - `host` - Hostname to use while rendering process. Default: `http://jsdom.jss` (You can use anything. But make sure to use the valid Hostname. `localhost` is an invalid instance.)
  - `path` - Will be used for `window.location.pathname`.
  - `eventName` - If exists, the output HTML string will be returned after event emitted. If not, it will be returned immediately.
  - `userAgent` - `userAgent` affects the value read from `navigator.userAgent`, as well as the User-Agent header sent while fetching sub-resources.
  - `cookie` - Will be used for `document.cookie`.
  - `beforeEval` - a Function that will be called before the `script` is executed.
  - `afterEval` - like `beforeEval`, but it will be called after the `script` executed.

## TODO

- Add JSDOC
- Add more explanation in `README.md`
- Create CLI version
- Create HTTP Server version
- Make more examples

## Note

If you find an problem, please report it on the Issue page. or If you have an suggestion and enhancement, please create the Pull Request. We will discuss it first.

Need more example to use `uniserv`? try visiting the [example](https://github.com/lamualfa/uniserv/tree/master/example) folder.

Thanks.
