import path from 'path'
import React from 'react'
import URLParse from 'url-parse'
import Helmet from 'react-helmet'
import { StaticRouter } from 'react-router-dom/server'
import { renderToString } from 'react-dom/server'
import { ChunkExtractor } from '@loadable/server'

import paths from '@react-ssr/utils/paths'
import makeHTML from '@react-ssr/utils/html'

const statsServerFile = path.resolve(paths.buildServerPath, 'loadable-stats.json')
const statsClientFile = path.resolve(paths.buildClientPath, 'loadable-stats.json')

export default async function (req, res) {
  let content
  const url = req.originalUrl
  const context = {}
  const location = new URLParse(url)

  const serverExtractor = new ChunkExtractor({ statsFile: statsServerFile })
  const { default: App } = serverExtractor.requireEntrypoint()

  const clientExtractor = new ChunkExtractor({ statsFile: statsClientFile })
  const jsx = clientExtractor.collectChunks(
    <StaticRouter location={location.pathname} context={context}>
      <App />
    </StaticRouter>
  )

  try {
    content = renderToString(jsx)
    if (context.url) {
      res.set('Location', context.url)
      return res.status(302)
    }
  } catch (err) {
    return res.status(200).send('unexpected error.')
  }

  const helmet = Helmet.renderStatic()
  const header = [helmet.meta.toString(), clientExtractor.getLinkTags(), clientExtractor.getStyleTags()].join('\n')
  const footer = clientExtractor.getScriptTags()
  console.log(clientExtractor.getMainAssets())

  const html = makeHTML({
    header,
    footer,
    title: helmet.title.toString(),
    htmlAttributes: helmet.htmlAttributes.toString(),
    bodyAttributes: helmet.bodyAttributes.toString(),
    children: content,
  })

  res.set('Content-Type', 'text/html; charset=utf-8')
  res.status(200).send(html)
}
