module.exports = function (helmet, content) {
  return `<!DOCTYPE html>
  <html ${helmet.htmlAttributes.toString()}>
      <head>
          ${helmet.title.toString()}
          ${helmet.meta.toString()}
          ${helmet.link.toString()}
      </head>
      <body ${helmet.bodyAttributes.toString()}>
          <div id="root">${content}</div>
      </body>
  </html>`
}
