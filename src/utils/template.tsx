import React from 'react'

export interface TemplateProps {
  meta?: String
  link?: String
  title?: String
  bodyAttrs?: Record<string, string>
  htmlAttrs?: Record<string, string>
}

export const Template: React.FC<TemplateProps> = ({ meta, link, title, bodyAttrs, htmlAttrs, children }) => {
  try {
    const Helmet = require('react-helmet')
    const helmet = Helmet.renderStatic()

    meta = meta || helmet.meta.toComponent()
    link = link || helmet.link.toComponent()
    title = title || helmet.title.toComponent()
    htmlAttrs = helmet.htmlAttributes.toComponent()
    bodyAttrs = helmet.bodyAttributes.toComponent()
  } catch {}

  return (
    <html lang="ru" {...htmlAttrs}>
      <head>
        {title}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {meta}
        {link}
      </head>
      <body {...bodyAttrs}>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}

Template.defaultProps = {
  bodyAttrs: {},
  htmlAttrs: {},
  title: '',
  meta: '',
  link: '',
}
