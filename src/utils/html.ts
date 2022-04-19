type HtmlOptions = {
  head?: string
  body?: string
  title?: string
  content?: string
  htmlAttributes?: string
  bodyAttributes?: string
}

export default function (options: HtmlOptions = {}) {
  const { title = '', head = '', body = '', content = '', htmlAttributes = '', bodyAttributes = '' } = options

  return `<!DOCTYPE html>
  <html ${htmlAttributes}>
      <head>
          ${title}
          ${head}
      </head>
      <body ${bodyAttributes}>
          <div id="root">${content}</div>
          ${body}
      </body>
  </html>`
}
