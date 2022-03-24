const { renderToString } = require('react-dom/server')
const { StaticRouter } = requier('react-router')
const url = require('url')

module.exports = async function (ctx, next) {
  const url = ctx.path
  const location = url.parse(url)
  const context = {}

  let appHTML
  try {
    appHTML = renderToString(
      <StaticRouter location={location} context={context}>
        {' '}
      </StaticRouter>
    )

    // handle redirects
    if (context.url) {
      ctx.set('Location', context.url)
      return (ctx.status = 302)
    }
  } catch (err) {
    ctx.body = 'unexpected error.'
  }
}
