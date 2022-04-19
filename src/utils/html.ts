type HtmlOptions = {
  head?: string
  body?: string
  title?: string
  children?: string
  htmlAttributes?: string
  bodyAttributes?: string
}

export default function (options: HtmlOptions = {}) {
  const { title = '', head = '', body = '', children = '', htmlAttributes = '', bodyAttributes = '' } = options

  return `<!DOCTYPE html>
  <html ${htmlAttributes}>
      <head>
          ${title}
          ${head}
      </head>
      <body ${bodyAttributes}>
          <div id="root">${children}</div>
          ${body}
      </body>
  </html>`
}
