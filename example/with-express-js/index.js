const express = require('express')
const { readFileSync } = require('fs')
const { renderToString } = require('uniserv')

const template = readFileSync('./public/template.html', 'utf8')
const script = readFileSync('./public/script.js', 'utf8')

const server = express()

server.use((req, res) => {
  renderToString(
    template,
    script,
    {
      // Put in here the data you want to access it from Javascript code in script file
      // Example:
      pageTitle: `Now you're in: ${req.path}`,
    },
    {
      path: req.path,
    }
  ).then((stringHtml) => {
    res.send(stringHtml)
  })
})

server.listen(3000, () =>
  console.log('Open http://localhost:3000/ to see the result')
)
