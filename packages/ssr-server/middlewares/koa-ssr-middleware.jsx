import React from 'react'
import Helmet from 'react-helmet'
import { StaticRouter } from 'react-router-dom/server'
import { renderToString } from 'react-dom/server'
import { ChunkExtractor } from '@loadable/server'
import URLParse from 'url-parse'
import makeHTML from 'ssr-utils/html'

export default async function (ctx) {
  const url = ctx.path
  const context = {}
  const location = new URLParse(url)

  let content
  try {
    content = renderToString(
      <StaticRouter location={location.pathname} context={context}>
        <>Hello SSR React!!!</>
      </StaticRouter>
    )

    if (context.url) {
      ctx.set('Location', context.url)
      return (ctx.status = 302)
    }
  } catch (err) {
    console.log(err)
    ctx.body = 'unexpected error.'
    return
  }

  const helmet = Helmet.renderStatic()
  const html = makeHTML(helmet, content)

  ctx.set('Content-Type', 'text/html; charset=utf-8')
  ctx.body = html
}
