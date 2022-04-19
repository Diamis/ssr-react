import path from 'path'
import React from 'react'
import express from 'express'
import URLParse from 'url-parse'
import Helmet from 'react-helmet'
import { renderToString } from 'react-dom/server'
import { ChunkExtractor } from '@loadable/server'
import { StaticRouter } from 'react-router-dom/server'
import utils from 'utils'

const statsServer = path.resolve(utils.paths.appBuildServer, 'loadable-stats.json')
const statsClient = path.resolve(utils.paths.appBuildClient, 'loadable-stats.json')

export default async function (req: express.Request, res: express.Response) {
  let content
  const context: Record<string, string> = {}
  const location = new URLParse(req.url)

  const server = new ChunkExtractor({ statsFile: statsServer })
  const client = new ChunkExtractor({ statsFile: statsClient })

  const { default: App } = server.requireEntrypoint()

  try {
    content = renderToString(
      <StaticRouter location={location.pathname}>
        <App />
      </StaticRouter>
    )

    if (context.url) {
      res.status(302).redirect(context.url)
    }
  } catch (err) {
    console.log(err)
    res.send('unexpected error.')
  }

  res.set('Content-Type', 'text/html; charset=utf-8')
  res.status(200).send(utils.html({ content }))
}
