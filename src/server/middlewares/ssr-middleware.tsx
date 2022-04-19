import path from 'path'
import React from 'react'
import express from 'express'
import URLParse from 'url-parse'
import Helmet from 'react-helmet'
import { renderToString } from 'react-dom/server'
import { ChunkExtractor } from '@loadable/server'
import { StaticRouter } from 'react-router-dom/server'
import utils from '../../utils'

const statsServer = path.resolve(utils.paths.appBuildServer, 'loadable-stats.json')
const statsClient = path.resolve(utils.paths.appBuildClient, 'loadable-stats.json')

export default async function (req: express.Request, res: express.Response) {
  let children
  const location = new URLParse(req.originalUrl)

  const server = new ChunkExtractor({ statsFile: statsServer })
  const client = new ChunkExtractor({ statsFile: statsClient })

  const { default: App } = server.requireEntrypoint()
  const jsx = client.collectChunks(
    <StaticRouter location={location.pathname}>
      <App />
    </StaticRouter>
  )

  try {
    children = renderToString(jsx)
  } catch (err) {
    console.log(err)
    res.send('unexpected error.')
  }

  const helmet = Helmet.renderStatic()
  const head = [helmet.meta.toString(), client.getLinkTags(), client.getStyleTags()].join('\n')
  const body = client.getScriptTags()
  const html = utils.html({
    head,
    body,
    children,
    title: helmet.title.toString(),
    htmlAttributes: helmet.htmlAttributes.toString(),
    bodyAttributes: helmet.bodyAttributes.toString(),
  })

  res.set('Content-Type', 'text/html; charset=utf-8')
  res.status(200).send(html)
}
