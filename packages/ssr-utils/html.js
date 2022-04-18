'use strict'

module.exports = function ({ footer, header, title, children, htmlAttributes, bodyAttributes }) {
  return `<!DOCTYPE html>
  <html ${htmlAttributes}>
      <head>
          ${title}
          ${header}
      </head>
      <body ${bodyAttributes}>
          <div id="root">${children}</div>
      </body>
      ${footer}
  </html>`
}
