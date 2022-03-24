import React, { Fragment } from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'

import { Template, TemplateProps } from './template'

type ServerRenderProps = {
  url?: string
  Html?: typeof Template
  Provider?: (props: { children: React.ReactNode }) => JSX.Element
  templateProps?: TemplateProps
}

const serverRender = async ({
  url = '',
  Html = Template,
  Provider = ({ children }) => <Fragment>{children}</Fragment>,
  templateProps = {},
}: ServerRenderProps) => {
  const wrapper = ReactDOMServer.renderToString(
    <Provider>
      <StaticRouter location={url}>
        <Html {...templateProps} />
      </StaticRouter>
    </Provider>
  )

  return `<!DOCTYPE html>${wrapper}`
}

export default serverRender
